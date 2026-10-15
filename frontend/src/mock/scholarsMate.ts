import type { GameState, LastAlert, Move } from "../types.ts";

/**
 * Scholar's Mate, revealed one ply at a time:
 * 1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6?? 4. Qxf7#
 * Nf6 is the blunder (best was g6). The eval then jumps to mate.
 */
const MOVES: Move[] = [
  {
    ply: 1,
    number: 1,
    color: "white",
    san: "e4",
    rating: "best",
    loss: 0,
    best: "e4",
    eval_after: { cp: 32, mate: null },
  },
  {
    ply: 2,
    number: 1,
    color: "black",
    san: "e5",
    rating: "best",
    loss: 0,
    best: "e5",
    eval_after: { cp: 28, mate: null },
  },
  {
    ply: 3,
    number: 2,
    color: "white",
    san: "Bc4",
    rating: "good",
    loss: 14,
    best: "Nf3",
    eval_after: { cp: 42, mate: null },
  },
  {
    ply: 4,
    number: 2,
    color: "black",
    san: "Nc6",
    rating: "good",
    loss: 8,
    best: "Nc6",
    eval_after: { cp: 36, mate: null },
  },
  {
    ply: 5,
    number: 3,
    color: "white",
    san: "Qh5",
    rating: "inaccuracy",
    loss: 62,
    best: "Nf3",
    eval_after: { cp: -20, mate: null },
  },
  {
    ply: 6,
    number: 3,
    color: "black",
    san: "Nf6",
    rating: "blunder",
    loss: 900,
    best: "g6",
    eval_after: { cp: 0, mate: 1 },
  },
  {
    ply: 7,
    number: 4,
    color: "white",
    san: "Qxf7#",
    rating: "best",
    loss: 0,
    best: "Qxf7#",
    eval_after: { cp: 0, mate: 0 },
  },
];

export const MATE_LENGTH = MOVES.length;

const START_EVAL = { cp: 20, mate: null };

/** Each event gets its own id so a new one can be spoken once. */
function lastAlert(moves: Move[], finished: boolean): LastAlert | null {
  if (finished) {
    return { id: 2, type: "checkmate", message: "Checkmate. White wins." };
  }
  const blunder = moves.find((move) => move.rating === "blunder");
  if (!blunder) return null;
  const best = blunder.best ? ` Best was ${blunder.best}.` : "";
  return { id: 1, type: "blunder", message: `${blunder.san} is a blunder.${best}` };
}

/** `revealed` is how many plies have appeared. 0 is the empty starting position. */
export function mockState(revealed: number): GameState {
  const moves = MOVES.slice(0, Math.max(0, Math.min(revealed, MOVES.length)));
  const last = moves[moves.length - 1];
  const finished = moves.some((move) => move.san === "Qxf7#");
  return {
    camera_connected: true,
    status: finished ? "checkmate" : "playing",
    turn: finished ? "black" : moves.length % 2 === 0 ? "white" : "black",
    winner: finished ? "white" : null,
    eval: last?.eval_after ?? START_EVAL,
    moves,
    last_alert: lastAlert(moves, finished),
  };
}
