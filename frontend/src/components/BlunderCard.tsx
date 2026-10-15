import type { AlertType, LastAlert } from "../types.ts";

const TONE: Record<AlertType, { label: string; box: string; kicker: string }> = {
  blunder: {
    label: "Blunder ??",
    box: "border-blunder/40 bg-blunder/15 text-[#ffd9d6]",
    kicker: "text-[#ff8f8c]",
  },
  check: {
    label: "Check",
    box: "border-mistake/40 bg-mistake/15 text-[#ffe7d2]",
    kicker: "text-mistake",
  },
  checkmate: {
    label: "Checkmate",
    box: "border-best/40 bg-best/15 text-[#e7f5d4]",
    kicker: "text-best",
  },
  stalemate: {
    label: "Stalemate",
    box: "border-white/15 bg-white/5 text-cream",
    kicker: "text-muted",
  },
};

/**
 * Renders /state `last_alert`. Hidden when the backend sends null.
 * The message text is used as-is — the UI does not write the alert.
 */
export function BlunderCard({ alert }: { alert: LastAlert | null }) {
  if (!alert) return null;
  const tone = TONE[alert.type] ?? TONE.blunder;

  return (
    <div key={alert.id} role="status" className={`alert-in rounded-xl border px-3.5 py-3 ${tone.box}`}>
      <p className={`text-[11px] font-bold tracking-[0.16em] uppercase ${tone.kicker}`}>{tone.label}</p>
      <p className="mt-1 text-[15px] leading-snug font-medium">{alert.message}</p>
    </div>
  );
}
