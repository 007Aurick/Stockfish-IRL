# Stockfish IRL

React dashboard for a live, camera-based chess review. It only displays what the backend sends. It does not open a camera or analyze moves.

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. Mock mode is on by default and plays 1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6?? 4. Qxf7#, one move every two seconds. Turn **Mock off** to call the backend at `http://localhost:8000`.

- `GET /video` — MJPEG stream, shown in an image
- `GET /state` — polled every 500ms
- `POST /reset` — New Game

`/state` and `/reset` need CORS for `http://localhost:5173`. Set `VITE_USE_MOCK=false` to start in live mode.
