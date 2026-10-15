import type { Link } from "../hooks/useGameState.ts";

/**
 * Title, connection dot, sound toggle, mock toggle, and New Game (POST /reset).
 * Green means GET /state is succeeding. Red means the backend is unreachable.
 */
export function Header({
  link,
  mock,
  resetting,
  soundOn,
  onToggleMock,
  onToggleSound,
  onNewGame,
}: {
  link: Link;
  mock: boolean;
  resetting: boolean;
  soundOn: boolean;
  onToggleMock: () => void;
  onToggleSound: () => void;
  onNewGame: () => void;
}) {
  const dot =
    link === "mock"
      ? "bg-inaccuracy shadow-[0_0_8px_var(--color-inaccuracy)]"
      : link === "connected"
        ? "bg-best shadow-[0_0_8px_var(--color-best)]"
        : link === "connecting"
          ? "bg-muted"
          : "bg-blunder shadow-[0_0_8px_var(--color-blunder)]";
  const label =
    link === "mock" ? "Mock" : link === "connected" ? "Connected" : link === "connecting" ? "Connecting" : "Offline";

  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="font-display text-[1.35rem] leading-none font-semibold tracking-tight text-cream">
          Stockfish IRL
        </h1>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted">
          <span className={`h-2.5 w-2.5 rounded-full ${dot}`} aria-hidden="true" />
          <span>{label}</span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-pressed={mock}
          onClick={onToggleMock}
          className={`rounded-full px-3 py-1.5 text-xs font-bold tracking-wide ${
            mock ? "bg-inaccuracy/15 text-inaccuracy" : "bg-white/5 text-muted hover:bg-white/10"
          }`}
        >
          {mock ? "Mock on" : "Mock off"}
        </button>
        <button
          type="button"
          aria-pressed={soundOn}
          onClick={onToggleSound}
          className={`rounded-full px-3 py-1.5 text-xs font-bold tracking-wide ${
            soundOn ? "bg-best/15 text-best" : "bg-white/5 text-muted hover:bg-white/10"
          }`}
        >
          {soundOn ? "🔊 Sound on" : "🔊 Enable sound"}
        </button>
        <button
          type="button"
          onClick={onNewGame}
          disabled={resetting}
          className="rounded-full bg-best px-3.5 py-1.5 text-xs font-bold tracking-wide text-[#1a1814] hover:brightness-110 disabled:opacity-60"
        >
          {resetting ? "Starting…" : "New Game"}
        </button>
      </div>
    </header>
  );
}
