"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
const World = dynamic(() => import("@/components/game").then(mod => mod.World), { ssr: false });
import { SkipButton } from "@/components/ui";
import { ZoneConfirmModal } from "@/components/ui/ZoneConfirmModal";
import { TurboVignette } from "@/components/ui/TurboVignette";
import HUD from "@/components/ui/HUD";
import { StandardPortfolio } from "@/components/ui/StandardPortfolio";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { MobileControls } from "@/components/game/MobileControls";
import { GameLoadingScreen } from "@/components/game/GameLoadingScreen";
import { LandscapeToast } from "@/components/game/LandscapeToast"
import { MazeModeModal } from "@/components/game/MazeModeModal"
import { GameClearBanner } from "@/components/game/GameClearBanner"
import { CheatCodeManager } from "@/components/game/CheatCodeManager"
import { GameNotifContainer } from "@/components/game/GameNotifications"
import { MazeHUDOverlay } from "@/components/game/MazeHUDOverlay"
import { FootballScoreOverlay } from "@/components/game/FootballScoreOverlay"

export default function Home() {
  const isGameMode = usePortfolioStore((s) => s.isGameMode);
  const hasLoadedOnce = usePortfolioStore((s) => s.hasLoadedOnce);
  const setHasLoadedOnce = usePortfolioStore((s) => s.setHasLoadedOnce);
  const [showLoader, setShowLoader] = useState(false);
  const [worldReady, setWorldReady] = useState(false);

  useEffect(() => {
    if (isGameMode) {
      document.body.classList.add('game-mode');
      if (!hasLoadedOnce) {
        setShowLoader(true);
        setWorldReady(false);
      } else {
        setShowLoader(false);
        setWorldReady(true);
      }

      // iOS Safari: scroll to hide address bar
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isMobile = navigator.maxTouchPoints > 0;
      if (isSafari && isMobile) {
        setTimeout(() => window.scrollTo(0, 1), 300);
      }
    } else {
      document.body.classList.remove('game-mode');
      setShowLoader(false);
      setWorldReady(false);
    }
  }, [isGameMode]);

  return (
    <>
      {isGameMode ? (
        <div className="absolute inset-0 w-full h-full bg-bg overflow-hidden text-[#00e676]">
          {showLoader && !worldReady && !hasLoadedOnce && (
            <GameLoadingScreen onComplete={() => {
              setWorldReady(true);
              setHasLoadedOnce(true);
            }} />
          )}
          {/* Always mount the 3D world behind the loading screen so it can initialize */}
          <World />
          <HUD />
          <LandscapeToast />
          <GameNotifContainer />
          <MazeModeModal />
          <CheatCodeManager />
          <MazeHUDOverlay />
          <FootballScoreOverlay />
          <GameClearBanner />
          <TurboVignette />
          <ZoneConfirmModal />
          <SkipButton />
          <MobileControls />
        </div>
      ) : (
        <StandardPortfolio />
      )}
    </>
  );
}
