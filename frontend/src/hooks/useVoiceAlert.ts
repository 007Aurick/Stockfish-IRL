import { useEffect, useRef } from "react";
import type { LastAlert } from "../types.ts";

/**
 * Speaks /state `last_alert.message` once each time `last_alert.id` changes.
 * The id already on screen when the board first loads is remembered and skipped.
 * The same id from the 500ms poll is ignored. Speech waits until sound is enabled.
 */
export function useVoiceAlert(alert: LastAlert | null, soundOn: boolean, ready: boolean, resetKey: number) {
  const spokenId = useRef<number | null>(null);
  const primed = useRef(false);
  const wasReady = useRef(false);
  const seenReset = useRef(resetKey);

  useEffect(() => {
    if (!ready) {
      wasReady.current = false;
      return;
    }

    const justLoaded = !wasReady.current || seenReset.current !== resetKey;
    wasReady.current = true;
    seenReset.current = resetKey;
    if (justLoaded) primed.current = false;

    const id = alert?.id ?? null;
    if (!primed.current) {
      primed.current = true;
      spokenId.current = id;
      return;
    }
    if (id === null || id === spokenId.current || !alert) return;

    spokenId.current = id;
    if (!soundOn || typeof window.speechSynthesis === "undefined") return;

    window.speechSynthesis.speak(new SpeechSynthesisUtterance(alert.message));
  }, [alert, soundOn, ready, resetKey]);
}
