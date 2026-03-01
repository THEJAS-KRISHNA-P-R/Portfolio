"use client"

import { useEffect, useRef, useState } from "react"

type StrikeAnimationProps = {
    onDone: () => void
}

export function StrikeAnimation({ onDone }: StrikeAnimationProps) {
    const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter')
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animRef = useRef<number>(0)

    // ── Canvas: animated colorful stripes flying across ──────────────────
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')!
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        let frame = 0
        const STRIPE_W = 80
        const STRIPES = [
            '#cc0000',   // deep red
            '#ffffff',   // white
            '#1a3a8a',   // blue
            '#ffffff',
            '#cc0000',
            '#ffffff',
            '#1a3a8a',
            '#ffffff',
            '#cc0000',
        ]

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            const diag = Math.sqrt(canvas.width ** 2 + canvas.height ** 2)
            const offset = (frame * 4) % (STRIPE_W * STRIPES.length)

            ctx.save()
            ctx.translate(canvas.width / 2, canvas.height / 2)
            ctx.rotate(-Math.PI / 6)  // 30° diagonal
            ctx.translate(-diag / 2 - STRIPE_W * STRIPES.length, -diag / 2)

            for (let i = 0; i < Math.ceil(diag / STRIPE_W) * 2 + STRIPES.length; i++) {
                ctx.fillStyle = STRIPES[i % STRIPES.length]
                ctx.globalAlpha = 0.18
                ctx.fillRect(
                    i * STRIPE_W - offset,
                    0,
                    STRIPE_W,
                    diag * 2
                )
            }
            ctx.restore()

            frame++
            animRef.current = requestAnimationFrame(draw)
        }
        animRef.current = requestAnimationFrame(draw)
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current)
        }
    }, [])

    // ── Phase timing ───────────────────────────────────────────────────────
    useEffect(() => {
        const t1 = setTimeout(() => setPhase('hold'), 400)
        const t2 = setTimeout(() => setPhase('exit'), 3200)
        const t3 = setTimeout(onDone, 3900)
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
    }, [onDone])

    const entering = phase === 'enter'
    const exiting = phase === 'exit'

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            opacity: entering ? 0 : exiting ? 0 : 1,
            transition: entering
                ? 'opacity 0.35s ease'
                : exiting
                    ? 'opacity 0.6s ease'
                    : 'none',
        }}>
            {/* Diagonal stripe canvas bg */}
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                }}
            />

            {/* Dark overlay for text readability */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.45)',
            }} />

            {/* ── STRIKE text ─────────────────────────────────────────────── */}
            <div style={{
                position: 'relative',
                zIndex: 2,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                transform: entering ? 'scale(0.6)' : exiting ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}>
                {/* "STRIKE" letters — individually colored */}
                <div style={{
                    display: 'flex',
                    gap: '0.05em',
                    fontSize: 'clamp(4rem, 14vw, 9rem)',
                    fontWeight: 900,
                    fontFamily: "'JetBrains Mono', Impact, monospace",
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                    filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.4))',
                }}>
                    {/* S */}<span style={{ color: '#cc0000', textShadow: '0 0 40px rgba(204,0,0,0.8), 3px 3px 0 #000' }}>S</span>
                    {/* T */}<span style={{ color: '#ffffff', textShadow: '0 0 40px rgba(255,255,255,0.6), 3px 3px 0 #000' }}>T</span>
                    {/* R */}<span style={{ color: '#1a3a8a', textShadow: '0 0 40px rgba(26,58,138,0.8), 3px 3px 0 #000' }}>R</span>
                    {/* I */}<span style={{ color: '#cc0000', textShadow: '0 0 40px rgba(204,0,0,0.8), 3px 3px 0 #000' }}>I</span>
                    {/* K */}<span style={{ color: '#ffffff', textShadow: '0 0 40px rgba(255,255,255,0.6), 3px 3px 0 #000' }}>K</span>
                    {/* E */}<span style={{ color: '#1a3a8a', textShadow: '0 0 40px rgba(26,58,138,0.8), 3px 3px 0 #000' }}>E</span>
                </div>

                {/* Exclamation + Pin emojis */}
                <div style={{
                    fontSize: 'clamp(1.5rem, 4vw, 3rem)',
                    letterSpacing: '0.3em',
                    animation: 'strikePinBounce 0.4s ease-in-out infinite alternate',
                }}>
                    🎳🎳🎳
                </div>

                {/* "ALL 10 DOWN!" */}
                <div style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 'clamp(0.7rem, 2vw, 1.1rem)',
                    fontWeight: 700,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: '#ffffff',
                    opacity: 0.8,
                    textShadow: '0 2px 12px rgba(0,0,0,0.9)',
                }}>
                    All 10 Down!
                </div>
            </div>

            <style>{`
        @keyframes strikePinBounce {
          from { transform: translateY(0) rotate(-5deg); }
          to   { transform: translateY(-8px) rotate(5deg); }
        }
      `}</style>
        </div>
    )
}
