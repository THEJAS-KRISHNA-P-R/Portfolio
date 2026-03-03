"use client"

import { usePortfolioStore } from "@/store/usePortfolioStore"

export function FootballScoreOverlay() {
    const footballScore = usePortfolioStore(s => s.footballScore)
    const footballHighScore = usePortfolioStore(s => s.footballHighScore)

    if (footballScore <= 0) return null

    return (
        <div className="football-score-hud" style={{
            position: 'fixed',
            top: 'clamp(4rem, 8vh, 5rem)',
            left: '1rem',
            zIndex: 300,
            pointerEvents: 'none',
            fontFamily: "'JetBrains Mono', monospace",
        }}>
            <div style={{
                background: 'rgba(3,10,6,0.8)',
                border: '1px solid rgba(0,230,118,0.15)',
                borderRadius: '8px',
                padding: '0.3rem 0.6rem',
                backdropFilter: 'blur(8px)',
            }}>
                <div style={{ fontSize: '0.45rem', color: 'rgba(0,230,118,0.4)', letterSpacing: '0.14em' }}>SCORE</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#00e676', lineHeight: 1 }}>
                    {footballScore}
                </div>
                {footballHighScore > 0 && (
                    <div style={{ fontSize: '0.45rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
                        BEST {footballHighScore}
                    </div>
                )}
            </div>
        </div>
    )
}
