"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { usePortfolioStore } from "@/store/usePortfolioStore";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
    const isGameMode = usePortfolioStore((s) => s.isGameMode);
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        // Don't run smooth scroll in game mode or on touch devices
        // (native touch momentum is hardware-accelerated and smoother than JS)
        const isTouch = window.matchMedia("(pointer: coarse)").matches;
        if (isGameMode || isTouch) {
            lenisRef.current?.destroy();
            lenisRef.current = null;
            return;
        }

        const lenis = new Lenis({
            duration: 1.1,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 0.9,
            touchMultiplier: 1.6,
            infinite: false,
        });

        lenisRef.current = lenis;

        // Expose lenis globally so Navbar scroll-to can use it
        (window as any).__lenis = lenis;

        let rafId: number;
        function raf(time: number) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }
        rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
            lenisRef.current = null;
            delete (window as any).__lenis;
        };
    }, [isGameMode]);

    return <>{children}</>;
}
