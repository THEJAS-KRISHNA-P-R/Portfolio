"use client";

import { useState, useEffect } from "react";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { gameState } from "@/components/game/Car";

/**
 * Green vignette flash that appears on screen edges when turbo fires.
 * Polls gameState at 20fps — fast enough to catch momentary boost activation.
 */
export function TurboVignette() {
    const isGameMode = usePortfolioStore((s) => s.isGameMode);
    const [active, setActive] = useState(false);

    useEffect(() => {
        const id = setInterval(() => {
            setActive(gameState.turboCharge < 0.05)
        }, 50)  // 20fps poll
        return () => clearInterval(id)
    }, [])

    return (
        <div
            className="pointer-events-none fixed inset-0 z-40"
            style={{
                background: active
                    ? "radial-gradient(ellipse at center, transparent 50%, rgba(0,230,118,0.25) 100%)"
                    : "none",
                opacity: active ? 1 : 0,
                transition: "opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
        />
    );
}
