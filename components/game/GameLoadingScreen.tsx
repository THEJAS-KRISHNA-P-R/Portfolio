"use client"

import { useEffect, useRef, useState } from "react"
import { CommitsGrid } from "@/components/ui/commits-grid"

interface GameLoadingScreenProps {
    onComplete?: () => void
    onViewPortfolio?: () => void
    progress?: number
    message?: string
}

export function GameLoadingScreen({
    onComplete,
    onViewPortfolio,
    progress: externalProgress,
    message: externalMessage
}: GameLoadingScreenProps) {
    const [internalProgress, setInternalProgress] = useState(0)
    const [phase, setPhase] = useState<'loading' | 'ready' | 'launching'>('loading')
    const [opacity, setOpacity] = useState(1)
    const [scanY, setScanY] = useState(0)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animRef = useRef<number>(0)

    const progress = externalProgress !== undefined ? externalProgress : internalProgress

    // ── Simulate loading progress ────────────────────────────────────────────
    useEffect(() => {
        if (externalProgress !== undefined) return
        let p = 0
        const interval = setInterval(() => {
            // Non-linear progress: fast then slows near 100
            const increment = p < 60 ? 2.2 : p < 85 ? 1.1 : p < 95 ? 0.4 : 0.15
            p = Math.min(100, p + increment)
            setInternalProgress(Math.round(p))
            if (p >= 100) {
                clearInterval(interval)
                setTimeout(() => setPhase('ready'), 300)
            }
        }, 40)
        return () => clearInterval(interval)
    }, [])

    // ── Scan line animation ───────────────────────────────────────────────────
    useEffect(() => {
        let y = 0
        const animate = () => {
            y = (y + 0.6) % 100
            setScanY(y)
            animRef.current = requestAnimationFrame(animate)
        }
        animRef.current = requestAnimationFrame(animate)
        return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
    }, [])

    // ── Grid canvas ───────────────────────────────────────────────────────────
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            draw()
        }

        const draw = () => {
            if (!ctx || !canvas) return
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Perspective grid lines — converge to center-bottom horizon
            const cx = canvas.width / 2
            const horizon = canvas.height * 0.52
            const numLines = 18

            ctx.strokeStyle = 'rgba(0, 230, 118, 0.07)'
            ctx.lineWidth = 1

            // Vertical converging lines
            for (let i = 0; i <= numLines; i++) {
                const t = i / numLines
                const bottomX = t * canvas.width
                ctx.beginPath()
                ctx.moveTo(bottomX, canvas.height)
                ctx.lineTo(cx, horizon)
                ctx.stroke()
            }

            // Horizontal depth lines
            const hLines = 10
            for (let i = 0; i <= hLines; i++) {
                const t = Math.pow(i / hLines, 1.8)
                const y = horizon + t * (canvas.height - horizon)
                const spread = t * (canvas.width / 2)
                ctx.beginPath()
                ctx.moveTo(cx - spread, y)
                ctx.lineTo(cx + spread, y)
                ctx.stroke()
            }
        }

        resize()
        window.addEventListener('resize', resize)
        return () => window.removeEventListener('resize', resize)
    }, [])

    const handleLaunch = () => {
        setPhase('launching')
        setOpacity(0)
        setTimeout(() => onComplete?.(), 800)
    }

    useEffect(() => {
        if (phase !== 'ready') return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Enter') handleLaunch()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [phase])

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1000,
                isolation: 'isolate',
                background: '#030d07',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                opacity,
                transition: phase === 'launching' ? 'opacity 0.8s ease' : 'none',
                overflow: 'hidden',
                fontFamily: "'JetBrains Mono', monospace",
            }}
        >
            {/* Perspective grid canvas */}
            <canvas
                ref={canvasRef}
                style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            />

            {/* Scan line */}
            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: `${scanY}%`,
                    height: '1px',
                    background: 'linear-gradient(to right, transparent, rgba(0,230,118,0.15), rgba(0,230,118,0.08), transparent)',
                    pointerEvents: 'none',
                }}
            />

            {/* Vignette */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)',
                pointerEvents: 'none',
            }} />

            {/* ── CONTENT ───────────────────────────────────────────────────── */}
            <div style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0',
                width: '100%',
                maxWidth: '340px',
                padding: '0 2rem',
            }}>

                {/* TK monogram — unchanged */}
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                    <CommitsGrid text="THEJAS" className="w-[160px]" />
                </div>

                {/* Name — unchanged */}
                <h1 style={{
                    margin: '0 0 0.25rem',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: '#e8f5e9',
                    textAlign: 'center',
                }}>
                    Thejas Krishna P R
                </h1>

                {/* Subtitle — unchanged */}
                <p style={{
                    margin: '0 0 2.5rem',
                    fontSize: '0.6rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'rgba(0,230,118,0.45)',
                    textAlign: 'center',
                }}>
                    Portfolio World
                </p>

                {/* ── Progress bar — unchanged ───────────────────────── */}
                {phase === 'loading' && (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        <div style={{
                            width: '100%', height: '2px',
                            background: 'rgba(255,255,255,0.06)',
                            borderRadius: '9999px', overflow: 'hidden',
                        }}>
                            <div style={{
                                height: '100%', width: `${progress}%`,
                                background: 'linear-gradient(to right, rgba(0,230,118,0.6), #00e676)',
                                borderRadius: '9999px', transition: 'width 0.1s linear',
                                boxShadow: '0 0 8px rgba(0,230,118,0.4)',
                            }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {externalMessage
                                ? <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em' }}>{externalMessage}</span>
                                : <LoadingStatus progress={progress} />
                            }
                            <span style={{ fontSize: '0.65rem', color: '#00e676', letterSpacing: '0.05em', fontVariantNumeric: 'tabular-nums' }}>
                                {progress}%
                            </span>
                        </div>
                    </div>
                )}

                {/* ── Enter World button (ready phase only) ─────────── */}
                {phase === 'ready' && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.75rem',
                        animation: 'fadeSlideUp 0.5s ease forwards',
                        width: '100%',
                    }}>
                        {/* PC: side by side. Mobile: stacked */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            width: '100%',
                            flexWrap: 'wrap',   // wraps to column on narrow screens
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <button onClick={handleLaunch} className="hud-portfolio-btn">
                                    <div className="btn-outer">
                                        <div className="btn-inner">
                                            <span>Enter World</span>
                                        </div>
                                    </div>
                                </button>
                                <p style={{
                                    fontSize: '0.48rem',
                                    marginTop: '0.5rem',
                                    visibility: 'hidden',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.12em',
                                    marginBottom: 0
                                }}>
                                    spacer
                                </p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <button
                                    onClick={onViewPortfolio}
                                    style={{
                                        padding: '0.75em 1.5em',
                                        background: '#050a0a',
                                        border: '1px solid rgba(0, 191, 255, 0.3)',
                                        borderRadius: '100em',
                                        color: 'rgba(0, 191, 255, 0.75)',
                                        fontFamily: "'JetBrains Mono', monospace",
                                        fontSize: '0.65rem',
                                        letterSpacing: '0.1em',
                                        textTransform: 'uppercase',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 0 15px rgba(0, 191, 255, 0.05)',
                                    }}
                                    onMouseEnter={e => {
                                        const btn = e.currentTarget
                                        btn.style.borderColor = 'rgba(0, 191, 255, 0.7)'
                                        btn.style.color = '#ffffff'
                                        btn.style.boxShadow = '0 0 25px rgba(0, 191, 255, 0.15), inset 0 0 10px rgba(0, 191, 255, 0.1)'
                                        btn.style.transform = 'translateY(-1px)'
                                    }}
                                    onMouseLeave={e => {
                                        const btn = e.currentTarget
                                        btn.style.borderColor = 'rgba(0, 191, 255, 0.3)'
                                        btn.style.color = 'rgba(0, 191, 255, 0.75)'
                                        btn.style.boxShadow = '0 0 15px rgba(0, 191, 255, 0.05)'
                                        btn.style.transform = 'translateY(0)'
                                    }}
                                >
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        backgroundImage: 'linear-gradient(90deg, transparent, rgba(0, 191, 255, 0.1), transparent)',
                                        backgroundSize: '200% 100%',
                                        animation: 'btnShimmer 3s infinite linear',
                                        pointerEvents: 'none'
                                    }} />
                                    <span style={{ position: 'relative', zIndex: 1 }}>View Portfolio</span>
                                </button>
                                <p style={{
                                    fontSize: '0.48rem', color: 'rgba(0, 191, 255, 0.4)',
                                    letterSpacing: '0.12em', textTransform: 'uppercase',
                                    marginTop: '0.5rem', textAlign: 'center', width: '100%',
                                    marginBottom: 0
                                }}>
                                    enter normal portfolio
                                </p>
                            </div>
                        </div>

                        <p style={{
                            fontSize: '0.55rem', color: 'rgba(255,255,255,0.18)',
                            letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0,
                        }}>
                            Press Enter or tap to continue to 3D world
                        </p>
                    </div>
                )}

                {/* ── View Portfolio button — visible during loading AND launching ── */}
                {(phase === 'loading' || phase === 'launching') && (
                    <div style={{ marginTop: '1.8rem', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <button
                            onClick={onViewPortfolio}
                            style={{
                                padding: '0.6rem 1.3rem',
                                background: '#050a0a',
                                border: '1px solid rgba(0, 191, 255, 0.25)',
                                borderRadius: '100em',
                                color: 'rgba(0, 191, 255, 0.65)',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '0.62rem',
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 0 12px rgba(0, 191, 255, 0.04)',
                            }}
                            onMouseEnter={e => {
                                const btn = e.currentTarget
                                btn.style.borderColor = 'rgba(0, 191, 255, 0.6)'
                                btn.style.color = '#ffffff'
                                btn.style.boxShadow = '0 0 20px rgba(0, 191, 255, 0.12)'
                                btn.style.transform = 'translateY(-1px)'
                            }}
                            onMouseLeave={e => {
                                const btn = e.currentTarget
                                btn.style.borderColor = 'rgba(0, 191, 255, 0.25)'
                                btn.style.color = 'rgba(0, 191, 255, 0.65)'
                                btn.style.boxShadow = '0 0 12px rgba(0, 191, 255, 0.04)'
                                btn.style.transform = 'translateY(0)'
                            }}
                        >
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: 'linear-gradient(90deg, transparent, rgba(0, 191, 255, 0.08), transparent)',
                                backgroundSize: '200% 100%',
                                animation: 'btnShimmer 4s infinite linear',
                                pointerEvents: 'none'
                            }} />
                            <span style={{ position: 'relative', zIndex: 1 }}>View Portfolio →</span>
                        </button>
                        <p style={{
                            fontSize: '0.45rem', color: 'rgba(0, 191, 255, 0.35)',
                            letterSpacing: '0.12em', textTransform: 'uppercase',
                            marginTop: '0.6rem', textAlign: 'center', marginBottom: 0
                        }}>
                            enter normal portfolio
                        </p>
                    </div>
                )}

                {/* Launching state — unchanged */}
                {phase === 'launching' && (
                    <p style={{
                        fontSize: '0.65rem', color: 'rgba(0,230,118,0.5)',
                        letterSpacing: '0.2em', textTransform: 'uppercase',
                        animation: 'pulse 0.6s infinite', marginTop: '0.75rem',
                    }}>
                        Initializing...
                    </p>
                )}
            </div>

            {/* Bottom corner coords — aesthetic detail */}
            <div style={{
                position: 'absolute',
                bottom: '1.2rem',
                left: '1.2rem',
                fontSize: '0.5rem',
                color: 'rgba(0,230,118,0.2)',
                letterSpacing: '0.08em',
                fontFamily: 'inherit',
                lineHeight: 1.6,
                pointerEvents: 'none',
            }}>
                <div>LAT 10.0°N / LON 76.2°E</div>
                <div>WORLD v2.0 · THREE.JS + RAPIER</div>
            </div>

            <div style={{
                position: 'absolute',
                bottom: '1.2rem',
                right: '1.2rem',
                fontSize: '0.5rem',
                color: 'rgba(0,230,118,0.2)',
                letterSpacing: '0.08em',
                textAlign: 'right',
                fontFamily: 'inherit',
                lineHeight: 1.6,
                pointerEvents: 'none',
            }}>
                <div>CREATIVE DEV</div>
                <div>© TKPR 2026</div>
            </div>

            <style>{`
        @keyframes tkPulse {
          0%, 100% { box-shadow: 0 0 30px rgba(0,230,118,0.08); }
          50%       { box-shadow: 0 0 50px rgba(0,230,118,0.2);  }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @keyframes btnShimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
        </div>
    )
}

// ── Loading status messages ───────────────────────────────────────────────────
function LoadingStatus({ progress }: { progress: number }) {
    const msg =
        progress < 15 ? 'Initializing physics...' :
            progress < 30 ? 'Loading world assets...' :
                progress < 50 ? 'Building terrain...' :
                    progress < 65 ? 'Spawning vehicle...' :
                        progress < 80 ? 'Placing zones...' :
                            progress < 92 ? 'Lighting scene...' :
                                progress < 100 ? 'Almost ready...' :
                                    'Complete'

    return (
        <span style={{
            fontSize: '0.6rem',
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.06em',
        }}>
            {msg}
        </span>
    )
}
