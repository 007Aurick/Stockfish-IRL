import { useCallback, useEffect, useRef, useState } from "react";
import { API_URL, MOCK_BY_DEFAULT, MOCK_STEP_MS, POLL_MS } from "../config.ts";
import { MATE_LENGTH, mockState } from "../mock/scholarsMate.ts";
import { EMPTY_STATE, normalizeState, type GameState } from "../types.ts";

export type Link = "mock" | "connecting" | "connected" | "disconnected";

/**
 * Single place that talks to the backend.
 * Live: poll GET /state every 500ms, and POST /reset for New Game.
 * Mock: ignore the network and reveal a scripted game one move at a time.
 * A failed poll keeps the last good state and marks the link disconnected.
 */
export function useGameState() {
  const [mock, setMock] = useState(MOCK_BY_DEFAULT);
  const [link, setLink] = useState<Link>(MOCK_BY_DEFAULT ? "mock" : "connecting");
  const [resetting, setResetting] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  const [liveState, setLiveState] = useState<GameState>(EMPTY_STATE);
  const [step, setStep] = useState(0);
  const stepRef = useRef(0);

  const state = mock ? mockState(step) : liveState;

  useEffect(() => {
    if (!mock) return;
    const id = window.setInterval(() => {
      if (stepRef.current >= MATE_LENGTH) {
        window.clearInterval(id);
        return;
      }
      stepRef.current += 1;
      setStep(stepRef.current);
    }, MOCK_STEP_MS);
    return () => window.clearInterval(id);
  }, [mock, resetNonce]);

  useEffect(() => {
    if (mock) return;
    let cancelled = false;
    let seen = "";

    const poll = async () => {
      try {
        const res = await fetch(`${API_URL}/state`, { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const body: unknown = await res.json();
        const next = normalizeState(body);
        if (!next) throw new Error("invalid state");
        if (cancelled) return;
        setLink("connected");
        const text = JSON.stringify(next);
        if (text !== seen) {
          seen = text;
          setLiveState(next);
        }
      } catch {
        if (!cancelled) setLink("disconnected");
      }
    };

    void poll();
    const id = window.setInterval(() => void poll(), POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [mock, resetNonce]);

  const newGame = useCallback(async () => {
    setResetting(true);
    try {
      if (mock) {
        stepRef.current = 0;
        setStep(0);
        setResetNonce((n) => n + 1);
        return;
      }
      const res = await fetch(`${API_URL}/reset`, { method: "POST" });
      if (!res.ok) throw new Error(String(res.status));
      setLiveState(EMPTY_STATE);
      setLink("connecting");
      setResetNonce((n) => n + 1);
    } catch {
      setLink("disconnected");
    } finally {
      setResetting(false);
    }
  }, [mock]);

  const toggleMock = useCallback(() => {
    if (mock) {
      setLiveState(EMPTY_STATE);
      setLink("connecting");
      setMock(false);
      return;
    }
    stepRef.current = 0;
    setStep(0);
    setLink("mock");
    setMock(true);
    setResetNonce((n) => n + 1);
  }, [mock]);

  return { state, link, mock, toggleMock, newGame, resetting, resetNonce };
}
