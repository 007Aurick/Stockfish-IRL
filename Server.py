import json, os, time, threading
from collections import deque

import chess
import cv2
import supervision as sv
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from inference_sdk import InferenceHTTPClient

from board import build_board, draw_grid, load_homography
from engine import analyze_move
from moves import find_move

# ---------- setup (copied from Chessdetect.py) ----------
load_dotenv()
MODEL_ID = "irl-chess-piece-detector/1"
CONFIDENCE = 0.5
SEND_EVERY = 0.5

client = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key=os.environ["ROBOFLOW_API_KEY"],
)
box_annotator = sv.BoxAnnotator()
label_annotator = sv.LabelAnnotator(text_scale=0.3)

cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
H = load_homography()

game = chess.Board()
history = deque(maxlen=3)

app = FastAPI()

# Let the React frontend (running on a different port) call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- shared "counter" between the pipeline and the endpoints ----------
latest_frame = None

game_state = {
    "camera_connected": False,
    "status": "playing",          # "playing" | "checkmate" | "stalemate"
    "turn": "white",
    "winner": None,
    "moves": [],
    "last_alert": None,           # {"id", "type", "message"}
}
alert_id = 0


def side_name(color):
    return "white" if color == chess.WHITE else "black"


def set_alert(kind, message):
    """Store a new alert. The id goes up every time so the frontend knows it's new and speaks it once."""
    global alert_id
    alert_id += 1
    game_state["last_alert"] = {"id": alert_id, "type": kind, "message": message}
    print(message)


def reset_state():
    game_state.update({
        "status": "playing",
        "turn": "white",
        "winner": None,
        "moves": [],
        "last_alert": None,
    })


# ---------- the CHEF: the Chessdetect.py loop, running in the background ----------
def pipeline_loop():
    global latest_frame
    detections = sv.Detections.empty()
    last_sent = 0

    while True:
        ret, frame = cap.read()
        game_state["camera_connected"] = bool(ret)
        if not ret:
            time.sleep(0.05)
            continue

        now = time.time()
        if now - last_sent > SEND_EVERY:
            result = client.infer(frame, model_id=MODEL_ID)
            detections = sv.Detections.from_inference(result)
            detections = detections[detections.confidence >= CONFIDENCE]
            last_sent = now

            board = build_board(detections, H)
            history.append(board)

            # only act once the board has looked the same for 3 readings (~1.5s)
            if (game_state["status"] == "playing"
                    and len(history) == 3
                    and history[0] == history[1] == history[2]):
                move = find_move(game, board)
                if move is not None:
                    info = analyze_move(game, move)        # must run BEFORE push
                    color = side_name(game.turn)
                    number = game.fullmove_number

                    game.push(move)
                    history.clear()

                    game_state["moves"].append({
                        "ply": len(game.move_stack),
                        "number": number,
                        "color": color,
                        "san": info["move"],
                        "rating": info["rating"],
                        "loss": info["loss"],
                        "best": info["best"],
                    })
                    game_state["turn"] = side_name(game.turn)
                    print(f"Move: {info['move']}  ({info['rating']})")

                    # most important alert wins: checkmate > stalemate > blunder > check
                    if game.is_checkmate():
                        winner = side_name(not game.turn)   # the side that just moved
                        game_state["status"] = "checkmate"
                        game_state["winner"] = winner
                        set_alert("checkmate", f"Checkmate! {winner.capitalize()} wins!")
                    elif game.is_stalemate():
                        game_state["status"] = "stalemate"
                        set_alert("stalemate", "Stalemate! The game is a draw.")
                    elif info["rating"] == "blunder":
                        set_alert("blunder", f"Blunder! Best was {info['best']}")
                    elif game.is_check():
                        set_alert("check", f"Check! {side_name(game.turn).capitalize()} is in check.")

        labels = [f"{n} {c:.2f}" for n, c in
                  zip(detections.data.get("class_name", []), detections.confidence)]
        annotated = box_annotator.annotate(frame.copy(), detections)
 
        annotated = draw_grid(annotated, H)

        latest_frame = annotated          # instead of cv2.imshow


threading.Thread(target=pipeline_loop, daemon=True).start()


# ---------- the WAITER: sends whatever is on the counter ----------
def generate_frames():
    while True:
        if latest_frame is None:
            time.sleep(0.05)
            continue
        ok, buffer = cv2.imencode(".jpg", latest_frame)
        yield (b"--frame\r\n"
               b"Content-Type: image/jpeg\r\n\r\n" + buffer.tobytes() + b"\r\n")
        time.sleep(0.03)


@app.get("/video")
def video():
    return StreamingResponse(generate_frames(),
                             media_type="multipart/x-mixed-replace; boundary=frame")


@app.get("/state")
def state():
    return game_state


@app.post("/reset")
def reset():
    game.reset()
    history.clear()
    reset_state()
    return {"ok": True}