"use client";

import { usePortfolioStore } from "@/store/usePortfolioStore";
import { theme } from "@/lib/theme";

// SOURCE: https://reactbits.dev/components/glass-card
export default function GlassCard({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const { activeZone } = usePortfolioStore();

    // Use explicit theme lookup because arbitrary Tailwind dynamic classes often don't compiler correctly in jit
    const zoneColor = activeZone && theme.colors[activeZone as keyof typeof theme.colors]
        ? theme.colors[activeZone as keyof typeof theme.colors]
        : theme.colors.glow;

    return (
        <div
            className={`relative overflow-hidden rounded-2xl bg-[#0f1923]/85 backdrop-blur-xl shadow-2xl ${className}`}
            style={{
                border: `1px solid ${zoneColor}66` // 66 translates to ~40% opacity 
            }}
        >
            <div
                className="absolute top-0 left-0 right-0 h-px w-full"
                style={{ background: `linear-gradient(90deg, transparent, ${zoneColor}, transparent)` }}
            />
            {children}
        </div>
    );
}
