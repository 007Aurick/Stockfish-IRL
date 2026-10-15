import type { Link } from "../hooks/useGameState.ts";
import type { GameState } from "../types.ts";
import { describePosition } from "../format.ts";

/**
 * One line from /state: whose turn it is, or the finished result.
 * If the poll fails, this line becomes "Backend disconnected" and the rest of the UI stays up.
 */
export function GameStatus({ state, link }: { state: GameState; link: Link }) {
  const offline = link === "disconnected";
  const connecting = link === "connecting";
  const playing = state.status === "playing";

  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 ${offline ? "bg-blunder/10" : "bg-white/[0.04]"}`}
      aria-live="polite"
    >
      {!offline && !connecting && playing && (
        <span
          className={`h-3.5 w-3.5 shrink-0 rounded-full ${
            state.turn === "white" ? "bg-cream" : "bg-[#141210] ring-1 ring-cream/70"
          }`}
          aria-hidden="true"
        />
      )}
      <p className={`text-sm font-semibold ${offline ? "text-[#ffb4b0]" : "text-cream"}`}>
        {offline ? "Backend disconnected" : connecting ? "Connecting…" : describePosition(state)}
      </p>
    </div>
  );
}
