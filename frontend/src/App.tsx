import { useState } from "react";
import { API_URL } from "./config.ts";
import { BlunderCard } from "./components/BlunderCard.tsx";
import { EvalBar } from "./components/EvalBar.tsx";
import { EvalGraph } from "./components/EvalGraph.tsx";
import { GameStatus } from "./components/GameStatus.tsx";
import { Header } from "./components/Header.tsx";
import { MoveList } from "./components/MoveList.tsx";
import { VideoFeed } from "./components/VideoFeed.tsx";
import { useGameState } from "./hooks/useGameState.ts";
import { useVoiceAlert } from "./hooks/useVoiceAlert.ts";

/** Layout only. Every /state and /reset call lives in useGameState. */
export default function App() {
  const { state, link, mock, toggleMock, newGame, resetting, resetNonce } = useGameState();
  const [soundOn, setSoundOn] = useState(false);
  const videoSrc = mock ? "/mock-feed.svg" : `${API_URL}/video`;
  // Live mode waits for the first successful /state so a pre-existing alert is not spoken.
  useVoiceAlert(state.last_alert, soundOn, mock || link === "connected", resetNonce);

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    if (typeof window.speechSynthesis === "undefined") return;
    if (next) window.speechSynthesis.resume();
    else window.speechSynthesis.cancel();
  }

  return (
    <main className="min-h-dvh bg-ink font-sans text-cream antialiased lg:h-dvh lg:overflow-hidden">
      <div className="mx-auto flex h-full max-w-[1600px] flex-col gap-4 p-3 lg:grid lg:grid-cols-[minmax(0,1.85fr)_minmax(340px,1fr)] lg:grid-rows-1 lg:p-4">
        <section className="flex h-[48vh] min-h-[260px] gap-3 lg:h-full lg:min-h-0">
          <EvalBar evaluation={state.eval} winner={state.winner} />
          <VideoFeed src={videoSrc} link={link} cameraConnected={state.camera_connected} />
        </section>

        <aside className="flex min-h-[520px] flex-col gap-3 rounded-2xl bg-panel p-4 ring-1 ring-white/10 lg:h-full lg:min-h-0">
          <Header
            link={link}
            mock={mock}
            resetting={resetting}
            soundOn={soundOn}
            onToggleMock={toggleMock}
            onToggleSound={toggleSound}
            onNewGame={() => void newGame()}
          />
          <GameStatus state={state} link={link} />
          <BlunderCard alert={state.last_alert} />
          <MoveList moves={state.moves} />
          <EvalGraph moves={state.moves} />
        </aside>
      </div>
    </main>
  );
}
