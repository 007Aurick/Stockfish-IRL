# ♟️Stockfish-IRL

**A camera watches a real, physical chessboard, tracks every move, and alerts the player the moment they blunder.**

Point a camera at your board, play a normal over-the-board game, and the system reads the position live, figures out which move was just played, asks Stockfish how good it was, and warns you instantly if you just hung a piece.

> 🚧 **Status: In progress.** The piece detection model is trained on Roboflow; the board tracking and move pipeline are being built.

---

## ✨ How It Works

```
Camera ──► Piece Detection ──► Board Mapping ──► Move Inference ──► Stockfish ──► Alert
          (Roboflow RF-DETR)    (homography)      (python-chess)     (eval Δ)     🔴 "Blunder!"
```

1. **Detect pieces.** A custom Roboflow RF-DETR model detects all 12 piece types (white/black × king, queen, rook, bishop, knight, pawn) in each frame.
2. **Map to squares.** The four board corners are used to compute a homography, warping the camera view into a clean top-down 8×8 grid. Each piece is assigned a square using the bottom-center of its bounding box, which is where it actually sits on the board.
3. **Wait for a stable board.** While a hand is over the board, the system waits. Once the position holds still for about a second, it takes a snapshot.
4. **Infer the move.** The new position is compared to the last confirmed one, and the change is matched against the legal moves from python-chess. The legal-move check corrects occasional misdetections: even if one piece is misread, usually only one legal move fits what changed.
5. **Evaluate.** Stockfish scores the position before and after the move.
6. **Alert.** If the mover's evaluation drops by about 2 pawns or more, it's flagged as a **blunder**, and the best move is shown.

---

## 🧠 The Model

| | |
|---|---|
| **Architecture** | Roboflow RF-DETR (Medium) |
| **Task** | Object detection, 12 classes |
| **Training images** | 223 images of the actual board (537 after augmentation) |
| **Input size** | 1024 × 1024 (keeps small pieces visible) |
| **Augmentations** | Brightness, exposure, slight blur, noise (no flips or rotations, since boards are never mirrored) |

### What I learned building the dataset

The first version of the model was trained mostly on a public dataset of a *different* board and piece set, with only 16 images of mine. On my own camera it fell apart, predicting "white king" for almost everything.

The fix wasn't a fancier model; it was **better data**:
- Recorded real games on my own board and extracted frames at 1 FPS.
- Auto-labeled 207 frames with a foundation model, then ran sanity checks using chess rules (each side has exactly one king, at most eight pawns, and so on) to flag labels that couldn't be right.
- Removed the off-domain images so the model learns *my* board, lighting, and camera angle.

---

## 🛠️ Tech Stack

- **[Roboflow](https://roboflow.com)**: dataset management, auto-labeling, training, and hosted inference
- **RF-DETR**: object detection model
- **[Supervision](https://github.com/roboflow/supervision)**: annotations and overlays
- **OpenCV**: camera capture and perspective transform
- **[python-chess](https://python-chess.readthedocs.io)**: board state, legal moves, FEN
- **[Stockfish](https://stockfishchess.org)**: position evaluation

---

## 🚀 Getting Started

```bash
git clone <your-repo-url>
cd irl-chess-blunder-detector
pip install inference supervision opencv-python python-chess
```

Install Stockfish and make sure it's on your PATH, then set your Roboflow API key:

```bash
export ROBOFLOW_API_KEY="your_key_here"
```

Model ID: `aurick-anwar/irl-chess-piece-detector-1-rfdetr-medium-t1`

---

## 🗺️ Roadmap

- [x] Collect and label a dataset from my own board
- [x] Train the RF-DETR piece detector
- [x] Live webcam inference
- [x] Board corner calibration and square mapping
- [ ] Move inference with legal-move matching
- [ ] Stockfish integration and blunder alerts
- [ ] On-screen overlay: best-move arrow, eval bar, blunder flash
- [ ] Text-to-speech alerts
- [ ] Stretch goal: a robot arm that plays Stockfish's reply on the physical board

---

## 👤 Author

**Aurick Anwar**, Engineering student at McMaster University · Robotics & Computer Vision
🌐 [aurickanwar.com](https://aurickanwar.com)

---

`#ComputerVision` `#Roboflow` `#RFDETR` `#ObjectDetection` `#MachineLearning` `#DeepLearning` `#Chess` `#Stockfish` `#OpenCV` `#Python` `#AI` `#Robotics` `#BuildInPublic`
