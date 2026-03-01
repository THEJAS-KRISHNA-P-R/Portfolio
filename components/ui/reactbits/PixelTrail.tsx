"use client";

import { useEffect, useState } from "react";
import { usePortfolioStore } from "@/store/usePortfolioStore";

// SOURCE: https://reactbits.dev/cursor-effects/pixel-trail
export default function PixelTrail() {
    const { isGameMode, activeZone } = usePortfolioStore();
    const [positions, setPositions] = useState<{ x: number, y: number, id: number }[]>([]);

    // Base color logic relying on active zone
    const getGlowColor = () => {
        switch (activeZone) {
            case 'garage': return '#e94560';
            case 'lab': return '#4fc3f7';
            case 'podium': return '#f5a623';
            case 'shop': return '#7ed321';
            case 'certs': return '#9b59b6';
            default: return '#4fc3f7';
        }
    };

    useEffect(() => {
        if (!isGameMode) return;

        let idCounter = 0;

        const onMouseMove = (e: MouseEvent) => {
            const id = idCounter++;
            setPositions(prev => [...prev.slice(-30), { x: e.clientX, y: e.clientY, id }]);

            // Auto cleanup this specific point after delay
            setTimeout(() => {
                setPositions(prev => prev.filter(p => p.id !== id));
            }, 500);
        };

        window.addEventListener("mousemove", onMouseMove);
        return () => window.removeEventListener("mousemove", onMouseMove);
    }, [isGameMode]);

    if (!isGameMode) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            {positions.map((p, i) => (
                <div
                    key={p.id}
                    className="absolute w-2 h-2 rounded-sm"
                    style={{
                        left: p.x - 4,
                        top: p.y - 4,
                        backgroundColor: getGlowColor(),
                        boxShadow: `0 0 8px ${getGlowColor()}`,
                        opacity: i / positions.length, // Fade out older ones
                        transform: `scale(${i / positions.length})`,
                        transition: 'opacity 0.5s ease-out, transform 0.5s ease-out'
                    }}
                />
            ))}
        </div>
    );
}
