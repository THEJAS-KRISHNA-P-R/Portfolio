"use client"

import { useState, useEffect, useRef } from "react"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import { useQualityStore } from "@/store/useQualityStore"

export function MazeHUDOverlay() {
    const isGameMode = usePortfolioStore(s => s.isGameMode)
    const mazeRunning = usePortfolioStore(s => s.mazeRunning)
    const setMazeRunning = usePortfolioStore(s => s.setMazeRunning)
    const profile = useQualityStore(s => s.profile)
    const [wallHits, setWallHits] = useState<number>(0)
    const [mazeMode, setMazeMode] = useState<'reset' | 'counter' | null>(null)
    const [elapsedDisplay, setElapsedDisplay] = useState('0.0s')
    const mazeStartTime = useRef(0)

    useEffect(() => {
        const onModeActive = (e: any) => {
            setMazeMode(e.detail.mode)
            setMazeRunning(true)
            setWallHits(0)
            setElapsedDisplay('0.0s')
            mazeStartTime.current = performance.now()
        }
        const onWallHit = (e: any) => {
            setWallHits(e.detail.count)
        }
        const onMazeCleared = () => {
            setMazeRunning(false)
            setMazeMode(null)
            setWallHits(0)
        }
        const onMazeReset = () => {
            setMazeRunning(false)
            setElapsedDisplay('WALL HIT')
            // Auto-hide the overlay 2.5 s after wall-hit so it doesn't stick forever
            setTimeout(() => {
                setMazeMode(null)
                setElapsedDisplay('0.0s')
            }, 2500)
        }
        const onMazeExited = () => {
            setMazeRunning(false)
            setMazeMode(null)
            setWallHits(0)
            setElapsedDisplay('0.0s')
        }

        window.addEventListener('maze:mode-active', onModeActive)
        window.addEventListener('maze:wall-hit', onWallHit)
        window.addEventListener('maze:cleared', onMazeCleared)
        window.addEventListener('maze:reset', onMazeReset)
        window.addEventListener('maze:exited', onMazeExited)
        return () => {
            window.removeEventListener('maze:mode-active', onModeActive)
            window.removeEventListener('maze:wall-hit', onWallHit)
            window.removeEventListener('maze:cleared', onMazeCleared)
            window.removeEventListener('maze:reset', onMazeReset)
            window.removeEventListener('maze:exited', onMazeExited)
        }
    }, [setMazeRunning])

    useEffect(() => {
        if (!mazeRunning) return
        const id = setInterval(() => {
            const secs = (performance.now() - mazeStartTime.current) / 1000
            setElapsedDisplay(`${secs.toFixed(1)}s`)
        }, 100)
        return () => clearInterval(id)
    }, [mazeRunning])

    if (mazeMode === null) return null

    return (
        <>
            {/* ── TOP CENTER: Maze timer ── */}
            <div className="maze-timer-overlay" style={{
                position: 'fixed',
                top: 'clamp(3.5rem, 7vh, 4.5rem)',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 300,
                pointerEvents: 'none',
                fontFamily: "'JetBrains Mono', monospace",
                textAlign: 'center',
            }}>
                <div style={{
                    background: 'rgba(0,10,26,0.82)',
                    border: `1px solid ${mazeRunning ? 'rgba(0,191,255,0.2)' : 'rgba(255,80,80,0.3)'}`,
                    borderRadius: '10px',
                    padding: '0.35rem 0.85rem',
                    backdropFilter: 'blur(10px)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                }}>
                    <span style={{ fontSize: 'clamp(0.45rem,1.2vw,0.52rem)', color: 'rgba(0,191,255,0.5)', letterSpacing: '0.14em' }}>
                        {mazeMode === 'reset' ? '💥 RESET MODE' : '🔢 COUNTER MODE'}
                    </span>
                    <span style={{
                        fontSize: 'clamp(0.9rem,2.5vw,1.1rem)',
                        color: mazeRunning ? '#00bfff' : '#ff5555',
                        fontWeight: 800,
                        fontVariantNumeric: 'tabular-nums'
                    }}>
                        {elapsedDisplay}
                    </span>
                </div>
            </div>

            {/* ── EXIT MAZE button (FIX 2) ── */}
            {mazeRunning && (
                <button
                    onClick={() => {
                        window.dispatchEvent(new CustomEvent('maze:force-exit'))
                        // Teleport to a safe location AWAY from the maze entrance trigger
                        // The maze entrance is at roughly [-110, 0, 110]
                        // Let's teleport back to the world spawn [0, 1.5, 0]
                        window.dispatchEvent(new CustomEvent('car:teleport', {
                            detail: { x: 0, y: 1.5, z: 0, rotationY: 0 }
                        }))
                    }}
                    style={{
                        position: 'fixed',
                        top: 'clamp(5.8rem, 10.5vh, 7rem)',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 310,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 'clamp(0.45rem, 1.2vw, 0.55rem)',
                        fontWeight: 700,
                        letterSpacing: '0.14em',
                        color: 'rgba(255,255,255,0.5)',
                        background: 'rgba(3,10,6,0.75)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '20px',
                        padding: '0.3rem 0.85rem',
                        cursor: 'pointer',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        whiteSpace: 'nowrap',
                    }}
                >
                    ✕ EXIT MAZE
                </button>
            )}

            {/* ── PERFORMANCE MODE indicator ── */}

            {/* ── PERFORMANCE MODE indicator ── */}
            {profile?.tier === 'low' && (
                <div style={{
                    position: 'fixed',
                    bottom: '0.4rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 200,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.42rem',
                    color: 'rgba(255,180,0,0.4)',
                    letterSpacing: '0.14em',
                    pointerEvents: 'none',
                }}>
                    PERFORMANCE MODE
                </div>
            )}

            {/* ── BOTTOM LEFT: Wall hits (counter mode) ── */}
            {mazeMode === 'counter' && mazeRunning && (
                <div style={{
                    position: 'fixed',
                    bottom: 'clamp(4.5rem, 8vh, 5.5rem)',
                    left: '1rem',
                    zIndex: 300,
                    pointerEvents: 'none',
                    fontFamily: "'JetBrains Mono', monospace",
                }}>
                    <div style={{
                        background: 'rgba(0,10,26,0.82)',
                        border: '1px solid rgba(0,150,255,0.18)',
                        borderRadius: '8px',
                        padding: '0.3rem 0.6rem',
                        backdropFilter: 'blur(8px)',
                    }}>
                        <div style={{ fontSize: 'clamp(0.4rem,1vw,0.48rem)', color: 'rgba(77,166,255,0.5)', letterSpacing: '0.16em' }}>WALL HITS</div>
                        <div style={{ fontSize: 'clamp(1.2rem,3vw,1.5rem)', fontWeight: 800, color: wallHits === 0 ? '#4da6ff' : '#ff9944', lineHeight: 1.1 }}>
                            {wallHits}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
