import { useState } from "react";
import { API_URL } from "../config.ts";
import type { Link } from "../hooks/useGameState.ts";

/**
 * The hero image. Live mode is GET /video, an MJPEG stream in an <img>.
 * Mock mode swaps in a still. This component never opens a camera.
 */
export function VideoFeed({
  src,
  link,
  cameraConnected,
}: {
  src: string;
  link: Link;
  cameraConnected: boolean;
}) {
  const [attempt, setAttempt] = useState(0);
  const mock = link === "mock";
  const frameKey = `${src}:${attempt}:${link}`;
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const broken = failedKey === frameKey;

  const backendDown = link === "disconnected";
  const cameraDown = link === "connected" && (!cameraConnected || broken);
  const badge = mock ? "MOCK" : link === "connected" ? "LIVE" : link === "connecting" ? "LIVE" : "OFFLINE";

  return (
    <div className="relative min-w-0 flex-1 overflow-hidden rounded-2xl bg-black shadow-[0_20px_60px_rgb(0_0_0/0.45)] ring-1 ring-white/10">
      {!broken && (
        <img
          key={frameKey}
          src={src}
          alt={mock ? "Mock camera feed of a chessboard" : "Live camera feed of the chessboard"}
          className="h-full w-full object-cover"
          draggable={false}
          onError={() => setFailedKey(frameKey)}
        />
      )}

      <div className="pointer-events-none absolute top-3 left-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold tracking-[0.16em] text-white backdrop-blur-sm">
          <span
            className={`h-1.5 w-1.5 rounded-full ${mock ? "bg-inaccuracy" : link === "disconnected" ? "bg-muted" : "bg-blunder"}`}
          />
          {badge}
        </span>
      </div>

      {backendDown && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/75 px-6 text-center">
          <div>
            <p className="font-display text-xl font-semibold">Backend disconnected</p>
            <p className="mt-1 text-sm text-muted">{API_URL} is unreachable</p>
          </div>
        </div>
      )}

      {cameraDown && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 px-6 text-center">
          <div>
            <p className="font-display text-xl font-semibold">Camera offline</p>
            <button
              type="button"
              className="pointer-events-auto mt-3 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-cream hover:bg-white/15"
              onClick={() => setAttempt((n) => n + 1)}
            >
              Retry feed
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
