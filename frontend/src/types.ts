export type Color = "white" | "black";

export type GameStatus = "playing" | "checkmate" | "stalemate" | "draw";

export type Rating = "best" | "good" | "inaccuracy" | "mistake" | "blunder";

/** White's point of view. 100 centipawns = 1 pawn. Positive mate means White mates in N. */
export type Eval = {
  cp: number;
  mate: number | null;
};

export type Move = {
  ply: number;
  number: number;
  color: Color;
  san: string;
  rating: Rating;
  loss: number;
  best: string | null;
  eval_after?: Eval;
};

export type AlertType = "blunder" | "check" | "checkmate" | "stalemate";

/** Latest voice-and-card alert from GET /state. `id` increases each time a new one is raised. */
export type LastAlert = {
  id: number;
  type: AlertType;
  message: string;
};

/** JSON body of GET /state. */
export type GameState = {
  camera_connected: boolean;
  status: GameStatus;
  turn: Color;
  winner: Color | null;
  eval: Eval;
  moves: Move[];
  last_alert: LastAlert | null;
};

export const EMPTY_STATE: GameState = {
  camera_connected: false,
  status: "playing",
  turn: "white",
  winner: null,
  eval: { cp: 0, mate: null },
  moves: [],
  last_alert: null,
};

const RATINGS: readonly Rating[] = ["best", "good", "inaccuracy", "mistake", "blunder"];
const ALERTS: readonly AlertType[] = ["blunder", "check", "checkmate", "stalemate"];
const STATUSES: readonly GameStatus[] = ["playing", "checkmate", "stalemate", "draw"];

function readEval(value: unknown): Eval | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const record = value as Partial<Eval>;
  if (typeof record.cp !== "number" && typeof record.mate !== "number") return undefined;
  return {
    cp: typeof record.cp === "number" ? record.cp : 0,
    mate: typeof record.mate === "number" ? record.mate : null,
  };
}

function readAlert(value: unknown): LastAlert | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Partial<LastAlert>;
  if (typeof record.id !== "number" || typeof record.message !== "string") return null;
  if (!ALERTS.includes(record.type as AlertType)) return null;
  return { id: record.id, type: record.type as AlertType, message: record.message };
}

/**
 * Accepts GET /state. `eval` is optional — the live server may omit it —
 * and a missing eval becomes 0 so the bar still renders.
 */
export function normalizeState(value: unknown): GameState | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Partial<GameState>;
  if (!Array.isArray(record.moves) || typeof record.status !== "string") return null;

  const evaluation = readEval(record.eval) ?? { cp: 0, mate: null };
  const moves: Move[] = [];
  for (const item of record.moves) {
    if (typeof item !== "object" || item === null) continue;
    const move = item as Partial<Move>;
    if (typeof move.san !== "string") continue;
    if (move.color !== "white" && move.color !== "black") continue;
    moves.push({
      ply: typeof move.ply === "number" ? move.ply : moves.length + 1,
      number: typeof move.number === "number" ? move.number : 1,
      color: move.color,
      san: move.san,
      rating: RATINGS.includes(move.rating as Rating) ? (move.rating as Rating) : "good",
      loss: typeof move.loss === "number" ? move.loss : 0,
      best: typeof move.best === "string" ? move.best : null,
      eval_after: readEval(move.eval_after),
    });
  }

  return {
    camera_connected: Boolean(record.camera_connected),
    status: STATUSES.includes(record.status as GameStatus) ? (record.status as GameStatus) : "playing",
    turn: record.turn === "black" ? "black" : "white",
    winner: record.winner === "white" || record.winner === "black" ? record.winner : null,
    eval: evaluation,
    moves,
    last_alert: readAlert(record.last_alert),
  };
}
