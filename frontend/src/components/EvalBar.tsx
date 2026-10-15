import type { Color, Eval } from "../types.ts";
import { formatEval, whiteShare } from "../format.ts";

/**
 * `eval` from GET /state, White's perspective.
 * White fills from the bottom; black occupies whatever is left at the top.
 */
export function EvalBar({ evaluation, winner }: { evaluation: Eval; winner: Color | null }) {
  const share = whiteShare(evaluation, winner);
  const anchor = Math.min(88, Math.max(12, share));
  const label = formatEval(evaluation);

  return (
    <div className="relative h-full w-11 shrink-0" aria-label={`Evaluation ${label}`}>
      <div className="absolute inset-y-0 left-1/2 w-7 -translate-x-1/2 overflow-hidden rounded-md bg-[#0c0c0c] ring-1 ring-white/20">
        <div
          className="absolute inset-x-0 bg-cream transition-[top] duration-500 ease-out"
          style={{ top: `${100 - share}%`, bottom: 0 }}
        />
      </div>
      <div
        className="absolute left-1/2 z-10 -translate-x-1/2 translate-y-1/2"
        style={{ bottom: `${anchor}%` }}
      >
        <span className="block rounded bg-[#141210] px-1 py-1 text-[11px] leading-none font-bold text-cream tabular-nums ring-1 ring-white/30">
          {label}
        </span>
      </div>
    </div>
  );
}
