"use client";

import { usePortfolioStore } from "@/store/usePortfolioStore";

/**
 * Green vignette flash that appears on screen edges when turbo fires.
 * Reads turboCharge from the store — when it drops to 0 the turbo just activated.
 */
export function TurboVignette() {
    const turboCharge = usePortfolioStore((s) => s.turboCharge);
    const isGameMode = usePortfolioStore((s) => s.isGameMode);

    if (!isGameMode) return null;

    // turboCharge drops to 0 the frame turbo fires, then recharges back to 100
    const active = turboCharge < 5;

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
