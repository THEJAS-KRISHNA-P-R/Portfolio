"use client"

import { useState, useEffect } from "react"
import { usePortfolioStore } from "@/store/usePortfolioStore"

export default function HUD() {
    const isGameMode = usePortfolioStore(s => s.isGameMode)
    const setIsGameMode = usePortfolioStore(s => s.setIsGameMode)
    const carSpeed = usePortfolioStore(s => s.carSpeed)
    const turboCharge = usePortfolioStore(s => s.turboCharge)
    const [showControls, setShowControls] = useState(true)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [wallHits, setWallHits] = useState<number | null>(null)
    const [mazeMode, setMazeMode] = useState<'reset' | 'counter' | null>(null)
    const [bestHits, setBestHits] = useState<number>(Infinity)

    useEffect(() => {
        const onHitUpdate = (e: any) => {
            setWallHits(e.detail.count)
            setBestHits(e.detail.bestHits)
            setMazeMode('counter')
        }
        const onModeChange = (e: any) => {
            setMazeMode(e.detail.mode)
            setBestHits(e.detail.bestHits)
            setWallHits(e.detail.mode === 'counter' ? 0 : null)
        }
        const onMazeClear = () => {
            setMazeMode(null)
            setWallHits(null)
        }

        window.addEventListener('maze-hit-update', onHitUpdate)
        window.addEventListener('maze-mode-change', onModeChange)
        window.addEventListener('maze-clear', onMazeClear)
        return () => {
            window.removeEventListener('maze-hit-update', onHitUpdate)
            window.removeEventListener('maze-mode-change', onModeChange)
            window.removeEventListener('maze-clear', onMazeClear)
        }
    }, [])

    useEffect(() => {
        const onChange = () => setIsFullscreen(!!document.fullscreenElement)
        document.addEventListener('fullscreenchange', onChange)
        return () => document.removeEventListener('fullscreenchange', onChange)
    }, [])

    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen()
                setIsFullscreen(true)
            } else {
                await document.exitFullscreen()
                setIsFullscreen(false)
            }
        } catch (_) { }
    }

    if (!isGameMode) return null

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 50,
                fontFamily: "'JetBrains Mono', monospace",
            }}
        >
            <style>{`
                @media (max-width: 600px) {
                    .hud-title-box { padding: 0.4rem 0.8rem !important; }
                    .hud-title-box h2 { font-size: 11px !important; }
                    .hud-title-box p { font-size: 9px !important; }
                    .hud-turbo-bar { width: 80px !important; }
                    .hud-controls-panel { display: none !important; }
                    .hud-speed-value { font-size: 1.1rem !important; }
                    .hud-portfolio-btn { transform: scale(0.85); transform-origin: bottom right; }
                    .hud-turbo-label { font-size: 0.5rem !important; }
                }
                @media (max-height: 450px) and (orientation: landscape) {
                    .hud-controls-panel { display: none !important; }
                    .hud-title-box { padding: 0.3rem 0.6rem !important; }
                    .hud-portfolio-btn { transform: scale(0.8); transform-origin: bottom right; }
                }
            `}</style>
            {/* ── TOP LEFT: Title ── */}
            <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10 }}>
                <div className="hud-title-box" style={{
                    background: 'rgba(5,15,10,0.75)',
                    border: '1px solid rgba(0,230,118,0.15)',
                    borderRadius: '12px',
                    padding: '0.6rem 1.2rem',
                    backdropFilter: 'blur(8px)',
                    textAlign: 'center',
                }}>
                    <h2 style={{ color: '#00e676', fontWeight: 700, fontSize: '14px', margin: 0, letterSpacing: '0.08em' }}>
                        PORTFOLIO WORLD
                    </h2>
                    <p style={{ color: '#4a7a5a', fontSize: '11px', margin: '2px 0 0 0' }}>
                        Drive to zones to explore
                    </p>
                </div>
            </div>

            {/* ── Maze Counter Pill ── */}
            {mazeMode === 'counter' && wallHits !== null && (
                <div style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 30,
                    pointerEvents: 'none',
                    fontFamily: "'JetBrains Mono', monospace",
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.15rem',
                }}>
                    <div style={{
                        background: 'rgba(0,10,26,0.85)',
                        border: '1px solid rgba(0,150,255,0.35)',
                        borderRadius: '12px',
                        padding: '0.4rem 1.1rem',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}>
                        <span style={{
                            fontSize: '0.5rem',
                            color: 'rgba(77,166,255,0.55)',
                            letterSpacing: '0.16em',
                            textTransform: 'uppercase',
                        }}>
                            WALL HITS
                        </span>
                        <span style={{
                            fontSize: '1.6rem',
                            fontWeight: 800,
                            color: wallHits === 0 ? '#4da6ff' : '#ff9944',
                            lineHeight: 1.1,
                            letterSpacing: '-0.02em',
                        }}>
                            {wallHits}
                        </span>
                        {bestHits !== Infinity && (
                            <span style={{
                                fontSize: '0.5rem',
                                color: 'rgba(255,255,255,0.2)',
                                letterSpacing: '0.1em',
                            }}>
                                BEST {bestHits}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* ── BOTTOM LEFT — Turbo only ── */}
            <div style={{
                position: 'absolute',
                bottom: '1.5rem',
                left: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                pointerEvents: 'none',
                zIndex: 10,
            }}>
                <span className="hud-turbo-label" style={{
                    fontSize: '0.58rem',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: turboCharge >= 100 ? '#00e676' : '#ff9940',
                    fontFamily: "'JetBrains Mono', monospace",
                }}>
                    {turboCharge >= 100 ? 'Turbo Ready' : `Charging ${Math.round(turboCharge)}%`}
                </span>
                <div className="hud-turbo-bar" style={{
                    width: '120px',
                    height: '3px',
                    background: 'rgba(255,255,255,0.07)',
                    borderRadius: '9999px',
                }}>
                    <div style={{
                        height: '100%',
                        width: `${Math.round(turboCharge)}%`,
                        borderRadius: '9999px',
                        background: turboCharge >= 100
                            ? '#00e676'
                            : 'linear-gradient(to right, #ff6600, #ff9900)',
                        transition: 'width 0.15s linear',
                    }} />
                </div>
            </div>

            {/* ── Controls panel — sits above turbo bar ── */}
            <div className="hud-controls-panel" style={{
                position: 'absolute',
                bottom: '4.5rem',
                left: '1rem',
                pointerEvents: 'none',
                opacity: showControls ? 1 : 0,
                transition: 'opacity 1s ease',
                zIndex: 10,
            }}>
                <div style={{
                    background: 'rgba(5,15,10,0.7)',
                    border: '1px solid rgba(0,230,118,0.1)',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    backdropFilter: 'blur(6px)',
                }}>
                    <p style={{ color: '#3d6b50', fontSize: '9px', letterSpacing: '0.2em', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
                        Controls
                    </p>
                    {([
                        ['W / ↑', 'Accelerate'],
                        ['S / ↓', 'Brake'],
                        ['A D', 'Steer'],
                        ['Space', 'Turbo'],
                    ] as [string, string][]).map(([key, label]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                            <span style={{
                                background: 'rgba(0,230,118,0.08)',
                                border: '1px solid rgba(0,230,118,0.2)',
                                borderRadius: '4px',
                                padding: '1px 6px',
                                fontSize: '10px',
                                color: '#7aaa8a',
                                minWidth: '36px',
                                textAlign: 'center',
                            }}>
                                {key}
                            </span>
                            <span style={{ fontSize: '10px', color: '#5a8a6a' }}>{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── BOTTOM RIGHT — Speed + Portfolio button ── */}
            <div style={{
                position: 'absolute',
                bottom: '1.5rem',
                right: '1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '0.5rem',
                zIndex: 10,
            }}>
                {/* Speed */}
                <div style={{ pointerEvents: 'none', textAlign: 'right' }}>
                    <div className="hud-speed-value" style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '1.4rem',
                        fontWeight: 700,
                        color: '#00e676',
                        lineHeight: 1,
                        letterSpacing: '-0.02em',
                    }}>
                        {Math.round(carSpeed * 3.6)}
                    </div>
                    <div style={{
                        fontSize: '0.5rem',
                        letterSpacing: '0.12em',
                        color: 'rgba(0,230,118,0.4)',
                        textTransform: 'uppercase',
                        fontFamily: "'JetBrains Mono', monospace",
                    }}>
                        km/h
                    </div>
                </div>

                {/* Standard Portfolio button */}
                <button
                    onClick={() => setIsGameMode(false)}
                    className="hud-portfolio-btn"
                    style={{ pointerEvents: 'all' }}
                >
                    <div className="btn-outer">
                        <div className="btn-inner">
                            <span>Standard Portfolio →</span>
                        </div>
                    </div>
                </button>
            </div>

            {/* ── TOP RIGHT: Fullscreen Toggle ── */}
            <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                zIndex: 20,
                pointerEvents: 'all',
            }}>
                <button
                    onClick={toggleFullscreen}
                    title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                    style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        background: 'rgba(5,15,10,0.7)',
                        border: '1px solid rgba(0,230,118,0.15)',
                        color: 'rgba(0,230,118,0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backdropFilter: 'blur(4px)',
                        transition: 'all 0.2s ease',
                        padding: 0,
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'rgba(0,230,118,0.4)'
                        e.currentTarget.style.color = '#00e676'
                        e.currentTarget.style.background = 'rgba(5,15,10,0.9)'
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'rgba(0,230,118,0.15)'
                        e.currentTarget.style.color = 'rgba(0,230,118,0.6)'
                        e.currentTarget.style.background = 'rgba(5,15,10,0.7)'
                    }}
                >
                    {isFullscreen ? (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M5.5 0v5.5H0v1h6.5V0h-1zm4 0v6.5H16v-1h-5.5V0h-1zM0 9.5v1h5.5V16h1V9.5H0zm9.5 5.5h1v-5.5H16v-1H9.5V15z" />
                        </svg>
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M1.5 1h4v-1h-5v5h1V1zm9-1v1h4v4h1V0h-5zm-10 14.5v-4h-1v5h5v-1h-4zm13.5.5h-4v1h5v-5h-1v4z" />
                        </svg>
                    )}
                </button>
            </div>

        </div>
    )
}
