import type { Color, Eval, GameState, Move } from "./types.ts";

/** "+0.4", "0.0", "M1", "-M3". Mate in 0 is already checkmate, shown as "#". */
export function formatEval(evaluation: Eval): string {
  if (evaluation.mate !== null && Number.isFinite(evaluation.mate)) {
    if (evaluation.mate === 0) return "#";
    const n = Math.abs(evaluation.mate);
    return evaluation.mate > 0 ? `M${n}` : `-M${n}`;
  }
  const cp = Number.isFinite(evaluation.cp) ? evaluation.cp : 0;
  const rounded = Math.round(cp / 10) / 10;
  if (rounded === 0) return "0.0";
  const text = Math.abs(rounded).toFixed(1);
  return rounded > 0 ? `+${text}` : `-${text}`;
}

/** 0 = black owns the bar, 100 = white owns it. Pawns are clamped to ±10; mate pins an end. */
export function whiteShare(evaluation: Eval, winner: Color | null): number {
  if (evaluation.mate !== null && Number.isFinite(evaluation.mate)) {
    if (evaluation.mate > 0) return 100;
    if (evaluation.mate < 0) return 0;
    if (winner === "black") return 0;
    if (winner === "white") return 100;
    return 50;
  }
  const cp = Number.isFinite(evaluation.cp) ? evaluation.cp : 0;
  const pawns = Math.max(-10, Math.min(10, cp / 100));
  return ((pawns + 10) / 20) * 100;
}

/** Chart value from White's perspective. Mate is pinned to ±10. */
export function evalToPawns(evaluation: Eval, mover: Color): number {
  if (evaluation.mate !== null && Number.isFinite(evaluation.mate)) {
    if (evaluation.mate > 0) return 10;
    if (evaluation.mate < 0) return -10;
    return mover === "white" ? 10 : -10;
  }
  const cp = Number.isFinite(evaluation.cp) ? evaluation.cp : 0;
  return Math.max(-10, Math.min(10, cp / 100));
}

export type GraphPoint = {
  label: string;
  title: string;
  pawns: number;
  display: string;
  isBlunder: boolean;
};

/** One point per move, using that move's eval_after from /state. */
export function toGraphPoints(moves: Move[]): GraphPoint[] {
  const points: GraphPoint[] = [];
  for (const move of moves) {
    if (!move?.eval_after || !move.san) continue;
    points.push({
      label: move.san,
      title: move.color === "white" ? `${move.number}. ${move.san}` : `${move.number}... ${move.san}`,
      pawns: evalToPawns(move.eval_after, move.color),
      display: formatEval(move.eval_after),
      isBlunder: move.rating === "blunder",
    });
  }
  return points;
}

export function describePosition(state: GameState): string {
  if (state.status === "checkmate") {
    if (state.winner === "black") return "Checkmate — Black wins";
    if (state.winner === "white") return "Checkmate — White wins";
    return "Checkmate";
  }
  if (state.status === "stalemate") return "Stalemate";
  if (state.status === "draw") return "Draw";
  return state.turn === "white" ? "White to move" : "Black to move";
}
