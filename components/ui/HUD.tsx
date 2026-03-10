"use client"

import { useState, useEffect, useRef } from "react"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import { useQualityStore } from "@/store/useQualityStore"
import { gameState } from "@/components/game/Car"
import { MazeMode } from "@/components/game/MazeModeModal"
import { InfoModal } from "@/components/ui/InfoModal"

function HighScoreBadge({ score }: { score: number }) {
    const [visible, setVisible] = useState(false)
    const [shouldRender, setShouldRender] = useState(false)
    const [displayed, setDisplayed] = useState(score)
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const unmountTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (score <= 0) return
        setDisplayed(score)
        setVisible(true)
        setShouldRender(true)

        if (hideTimer.current) clearTimeout(hideTimer.current)
        hideTimer.current = setTimeout(() => {
            setVisible(false)
            if (unmountTimer.current) clearTimeout(unmountTimer.current)
            unmountTimer.current = setTimeout(() => {
                setShouldRender(false)
            }, 500)
        }, 5000)

        return () => {
            if (hideTimer.current) clearTimeout(hideTimer.current)
            if (unmountTimer.current) clearTimeout(unmountTimer.current)
        }
    }, [score])

    if (!shouldRender || displayed <= 0) return null

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'rgba(4,14,9,0.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,210,0,0.3)',
            borderRadius: '8px',
            padding: '0.3rem 0.65rem',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 'clamp(0.48rem, 1.3vw, 0.56rem)',
            color: 'rgba(255,210,0,0.85)',
            letterSpacing: '0.1em',
            width: 'fit-content',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(-5px)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
            pointerEvents: 'none',
        }}>
            <span>🏆</span>
            <span>BEST {displayed}</span>
        </div>
    )
}

export default function HUD() {
    const isGameMode = usePortfolioStore(s => s.isGameMode)
    const setIsGameMode = usePortfolioStore(s => s.setIsGameMode)
    const footballHighScore = usePortfolioStore(s => s.footballHighScore)
    const [displaySpeed, setDisplaySpeed] = useState(0)
    const [displayTurbo, setDisplayTurbo] = useState(100)
    const [displayCooldown, setDisplayCooldown] = useState(0)
    const [mazeRunning, setMazeRunning] = useState(false)
    const [activeMode, setActiveMode] = useState<MazeMode>('explore')
    const [mazeResult, setMazeResult] = useState<{ mode: MazeMode, time?: number, hits?: number, isNewBest?: boolean } | null>(null)
    const [mazeTimer, setMazeTimer] = useState(0)
    const [timerActive, setTimerActive] = useState(false)
    const [infoOpen, setInfoOpen] = useState(false)

    const profile = useQualityStore(s => s.profile)
    const isMobile = profile?.isMobile ?? false

    const mazeHits = usePortfolioStore(s => s.mazeHits)
    const mazeBestTime = usePortfolioStore(s => s.mazeBestTime)
    const mazeBestHits = usePortfolioStore(s => s.mazeBestHits)
    const setMazeRecord = usePortfolioStore(s => s.setMazeRecord)

    useEffect(() => {
        const onStart = (e: Event) => {
            const mode = (e as CustomEvent).detail.mode
            setActiveMode(mode)
            setMazeRunning(true)
            setMazeResult(null)
            setMazeTimer(0)
            setTimerActive(false)
        }
        const onTimerStart = () => setTimerActive(true)
        const onDone = () => {
            setMazeRunning(false)
            setTimerActive(false)
            setActiveMode('explore') // Reset to default
        }
        const onComplete = (e: Event) => {
            const { mode, time, hits } = (e as CustomEvent).detail
            setMazeRunning(false)
            setTimerActive(false)

            let isNewBest = false
            if (mode === 'hard' && time !== undefined && time > 0) {
                const recordExists = mazeBestTime !== null
                const improved = setMazeRecord('time', time)
                isNewBest = recordExists && improved
            } else if (mode === 'hits' && hits !== undefined) {
                const recordExists = mazeBestHits !== null
                const improved = setMazeRecord('hits', hits)
                isNewBest = recordExists && improved
            }

            setMazeResult({ mode, time, hits, isNewBest })
        }
        const onHitReset = () => {
            setMazeTimer(0)
            setTimerActive(false)
            const label = document.querySelector('.hud-turbo-label') as HTMLElement
            if (label) {
                label.style.color = '#ff4444'
                label.style.transition = 'none'
                label.style.transform = 'scale(1.2)'
                setTimeout(() => {
                    label.style.transition = 'all 0.4s ease'
                    label.style.color = ''
                    label.style.transform = ''
                }, 100)
            }
        }
        window.addEventListener('maze:start', onStart)
        window.addEventListener('maze:timer-start', onTimerStart)
        window.addEventListener('maze:complete', onComplete)
        window.addEventListener('maze:hit-reset', onHitReset)
        window.addEventListener('maze:reset', onDone)
        window.addEventListener('maze:exited', onDone)
        return () => {
            window.removeEventListener('maze:start', onStart)
            window.removeEventListener('maze:timer-start', onTimerStart)
            window.removeEventListener('maze:complete', onComplete)
            window.removeEventListener('maze:hit-reset', onHitReset)
            window.removeEventListener('maze:reset', onDone)
            window.removeEventListener('maze:exited', onDone)
        }
    }, [mazeBestTime, mazeBestHits, setMazeRecord])

    useEffect(() => {
        const id = setInterval(() => {
            setDisplaySpeed(Math.round(gameState.speed * 3.6))
            setDisplayTurbo(Math.round(gameState.turboCharge * 100))
            setDisplayCooldown(gameState.turboCooldown)

            if (timerActive) {
                setMazeTimer(prev => prev + 0.1)
            }
        }, 100)
        return () => clearInterval(id)
    }, [timerActive])

    if (!isGameMode) return null

    const closeOverlay = () => {
        setMazeResult(null)
        // Teleport car back to exit area in world
        window.dispatchEvent(new CustomEvent('car:teleport', {
            detail: {
                position: { x: -35, y: 0.5, z: 130 },
                rotation: { x: 0, y: 0, z: 0, w: 1 },
            }
        }))
        window.dispatchEvent(new CustomEvent('game:freeze-controls', { detail: { frozen: false } }))
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 500,
            fontFamily: "'JetBrains Mono', monospace",
        }}>
            <style>{`
                @media (max-width: 600px) {
                    .hud-turbo-bar { width: 80px !important; }
                    .hud-speed-value { font-size: 1.1rem !important; }
                    .hud-turbo-label { font-size: 0.5rem !important; }
                }
            `}</style>

            {/* ── TOP LEFT — Premium Portfolio Button ── */}
            <div style={{
                position: 'fixed', top: 'min(2rem, 4vh)', left: 'min(1rem, 4vw)',
                zIndex: 300, pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '0.8rem',
            }}>
                <button
                    className="hud-portfolio-btn"
                    onClick={() => setIsGameMode(false)}
                    style={{ transform: 'scale(1)', transformOrigin: 'left center' }}
                >
                    <div className="btn-outer">
                        <div className="btn-inner">
                            <span>Standard Portfolio</span>
                        </div>
                    </div>
                </button>
                <div style={{ pointerEvents: 'none' }}>
                    <HighScoreBadge score={footballHighScore} />
                </div>
            </div>

            {/* ── TOP RIGHT/CENTER — Mode Stats ── */}
            {mazeRunning && (
                <div style={{
                    position: 'absolute',
                    top: 'min(0.5rem, 2vh)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.2rem',
                    zIndex: 100,
                    width: 'min(90vw, 400px)',
                    pointerEvents: 'none'
                }}>
                    <div style={{ pointerEvents: 'auto' }}>
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('maze:force-exit'))}
                            style={{
                                background: 'rgba(255, 68, 68, 0.15)',
                                backdropFilter: 'blur(8px)',
                                border: '0.5px solid rgba(255, 68, 68, 0.4)',
                                borderRadius: '12px',
                                padding: '0.5rem 0.6rem',
                                color: '#ff5555',
                                fontSize: '0.65rem',
                                fontWeight: 900,
                                letterSpacing: '0.1em',
                                cursor: 'pointer',
                                textTransform: 'uppercase',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 4px 15px rgba(255, 68, 68, 0.15)',
                            }}
                        >
                            ✕ Exit Maze
                        </button>
                    </div>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0rem',
                        background: 'rgba(0,0,0,0.3)',
                        padding: '0.1rem 0.6rem',
                        borderRadius: '10px',
                        backdropFilter: 'blur(2px)',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <div style={{ fontSize: '0.4rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                            {activeMode === 'explore' ? 'Exploration Protocol' : activeMode === 'hits' ? 'Hit Counter System' : 'Hard Mode Active'}
                        </div>
                        {activeMode === 'hits' && (
                            <div style={{ fontSize: '0.6rem', color: '#ffcc00', fontWeight: 900 }}>
                                <span style={{ fontSize: '.7rem', opacity: 0.5, marginRight: '0.1rem' }}>HITS:</span>
                                {mazeHits}
                            </div>
                        )}
                        {activeMode === 'hard' && (
                            <div style={{ fontSize: '0.8rem', color: '#ff4444', fontWeight: 900 }}>
                                {mazeTimer.toFixed(1)}s
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── TOP RIGHT — Info Button (PC/Desktop only, hidden in maze) ── */}
            {!mazeRunning && !isMobile && (
                <div style={{
                    position: 'fixed', top: 'min(1.5rem, 3vh)', right: 'min(1rem, 4vw)',
                    zIndex: 260, pointerEvents: 'auto',
                }}>
                    <button
                        onClick={() => setInfoOpen(true)}
                        style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: 'rgba(4,14,9,0.78)', backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            color: 'rgba(255,255,255,0.55)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.1rem', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                            transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
                            e.currentTarget.style.color = '#ffffff'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                            e.currentTarget.style.color = 'rgba(255,255,255,0.55)'
                        }}
                    >
                        i
                    </button>
                </div>
            )}

            {/* ── BOTTOM LEFT — Turbo ── */}
            <div style={{
                position: 'absolute', bottom: '1.5rem', left: '1rem',
                display: 'flex', flexDirection: 'column', gap: '0.35rem', pointerEvents: 'none', zIndex: 10,
            }}>
                <span className="hud-turbo-label" style={{
                    fontSize: '0.58rem', letterSpacing: '0.16em', textTransform: 'uppercase',
                    color: displayCooldown > 0 ? '#ff5555' : (displayTurbo >= 100 ? '#00e676' : '#ff9940'),
                }}>
                    {displayCooldown > 0 ? 'Cooling Down' : (displayTurbo >= 100 ? 'Turbo Ready' : `Charging ${Math.round(displayTurbo)}%`)}
                </span>
                <div className="hud-turbo-bar" style={{
                    width: 'clamp(120px, 22vw, 220px)', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden',
                }}>
                    <div style={{
                        height: '100%', width: displayCooldown > 0 ? `${displayCooldown * 100}%` : `${Math.min(displayTurbo, 100)}%`,
                        background: displayCooldown > 0 ? '#ff4444' : displayTurbo >= 100 ? '#00e676' : '#ff6600',
                        transition: displayCooldown > 0 ? 'none' : 'width 0.1s linear',
                    }} />
                </div>
            </div>

            {/* ── BOTTOM RIGHT — Speed ── */}
            <div style={{
                position: 'absolute', bottom: '1.5rem', right: '1rem',
                display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', zIndex: 10,
            }}>
                <div style={{ pointerEvents: 'none', textAlign: 'right' }}>
                    <div className="hud-speed-value" style={{
                        fontSize: 'clamp(1.2rem, 3.5vw, 1.8rem)', fontWeight: 700, color: '#00e676', lineHeight: 1,
                    }}>{displaySpeed}</div>
                    <div style={{ fontSize: '0.5rem', color: 'rgba(0,230,118,0.4)', textTransform: 'uppercase' }}>km/h</div>
                </div>
            </div>

            {/* ── Maze Completion Overlays ── */}
            {mazeResult && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'auto', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
                    padding: '2rem'
                }}>
                    <div style={{
                        background: 'rgba(5, 15, 12, 0.98)', border: '2.5px solid',
                        borderColor: mazeResult.isNewBest ? '#ffcc00' : '#00e676', borderRadius: '32px',
                        padding: 'clamp(1rem, 3vw, 2rem)', textAlign: 'center', boxShadow: '0 0 120px rgba(0,0,0,1)',
                        animation: 'maze-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                        maxWidth: 'min(450px, 85vw)', position: 'relative'
                    }}>
                        <div style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', marginBottom: '0.4rem' }}>
                            {mazeResult.isNewBest ? '👑' : (mazeResult.mode === 'explore' ? '🏁' : mazeResult.mode === 'hits' ? '🏆' : '🔥')}
                        </div>

                        <h2 style={{
                            fontSize: 'clamp(1rem, 3.5vw, 1.4rem)', color: mazeResult.isNewBest ? '#ffcc00' : '#fff',
                            fontWeight: 900, margin: '0 0 0.4rem 0', textTransform: 'uppercase'
                        }}>
                            {mazeResult.isNewBest ? 'NEW WORLD RECORD!' : (
                                mazeResult.mode === 'explore' ? 'Goal Reached!' :
                                    mazeResult.mode === 'hits' ? 'Accuracy Master!' : 'Steel Nerves!'
                            )}
                        </h2>

                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(0.7rem, 2.2vw, 0.9rem)', lineHeight: 1.4, margin: '0 0 1rem 0' }}>
                            {mazeResult.mode === 'explore' && "Journey complete."}
                            {mazeResult.mode === 'hits' && `Accuracy: ${mazeResult.hits} hits.`}
                            {mazeResult.mode === 'hard' && "Hard Protocol cleared."}
                        </p>

                        {(mazeResult.mode !== 'explore') && (
                            <div style={{
                                display: 'flex', gap: '0.8rem', justifyContent: 'center',
                                background: 'rgba(255,255,255,0.05)', padding: 'clamp(0.6rem, 2vw, 1rem)', borderRadius: '20px',
                                marginBottom: '1rem'
                            }}>
                                {mazeResult.time !== undefined && mazeResult.time > 0 && (
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Time</div>
                                        <div style={{ fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', color: '#fff', fontWeight: 800 }}>{mazeResult.time.toFixed(2)}s</div>
                                    </div>
                                )}
                                {mazeResult.hits !== undefined && (
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Hits</div>
                                        <div style={{ fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', color: '#ffcc00', fontWeight: 800 }}>{mazeResult.hits}</div>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                closeOverlay();
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                            style={{
                                background: mazeResult.isNewBest ? '#ffcc00' : '#00e676',
                                color: '#000', border: 'none', borderRadius: '12px',
                                padding: 'clamp(0.6rem, 2.5vw, 1rem) clamp(1.2rem, 5vw, 2.5rem)',
                                fontWeight: 800, fontSize: 'clamp(0.75rem, 2.5vw, 0.9rem)',
                                cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em',
                                transition: 'all 0.2s ease', boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                                pointerEvents: 'auto'
                            }}
                        >
                            Return to World
                        </button>
                    </div>

                    <style>{`
                        @keyframes maze-pop {
                            from { opacity: 0; transform: scale(0.5) translateY(100px); }
                            to { opacity: 1; transform: scale(1) translateY(0); }
                        }
                    `}</style>
                </div>
            )}
            {/* ── Info Modal ───────────────────────────────────────────────── */}
            <InfoModal
                open={infoOpen}
                onClose={() => setInfoOpen(false)}
                isMobile={false}
            />
        </div>
    )
}
