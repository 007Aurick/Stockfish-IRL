import json
import os
import time
from collections import deque
from typing import Any

import chess
import cv2
import supervision as sv
from dotenv import load_dotenv
from inference_sdk import InferenceHTTPClient

from board import build_board, draw_grid, draw_points, load_homography, print_board
from engine import analyze_move, engine
from moves import find_move

game = chess.Board()
history = deque(maxlen=3)

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

detections = sv.Detections.empty()  # start at no pieces found
last_sent = 0  # last time model was called

H = load_homography()
with open("corners.json") as f:
    saved_corners = json.load(f)

while True:
    ref, frame = cap.read()

    if not ref:
        break

    now = time.time()  # current time in frame
    if now - last_sent > SEND_EVERY:
        # only continue if more than 0.5 seconds since the last model call
        result = client.infer(frame, model_id=MODEL_ID)  # send frame to the Roboflow model
        detections = sv.Detections.from_inference(result)
        detections = detections[detections.confidence >= CONFIDENCE]
        last_sent = now  # updates the last time the model was called
        board = build_board(detections, H)
        history.append(board)
        if len(history) == 3 and history[0] == history[1] == history[2]:
            move = find_move(game, board)
            if move is not None:
                result = analyze_move(game, move)
                print(f"Move: {result['move']}  ({result['rating']})")
                if result["rating"] == "blunder":
                    print(f"   🚨 BLUNDER! Best was {result['best']}")
                game.push(move)
                history.clear()

    labels = []
    for name, conf in zip(detections.data["class_name"], detections.confidence):
        labels.append(f"{name} {conf:.2f}")

    annotated = box_annotator.annotate(frame.copy(), detections)
    annotated = label_annotator.annotate(annotated, detections, labels=labels)
    annotated = draw_grid(annotated, H)
    annotated = draw_points(annotated, detections, H)

    for (x, y) in saved_corners:
        cv2.circle(annotated, (x, y), 8, (255, 0, 255), -1)

    cv2.imshow("Chess Detection", annotated)  # displays the annotated frame

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
engine.quit()
