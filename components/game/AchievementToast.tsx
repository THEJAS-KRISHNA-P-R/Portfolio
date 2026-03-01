"use client"

import { useEffect, useRef, useState, useCallback } from "react"

// ── Types ──────────────────────────────────────────────────────────────────
export interface AchievementData {
    type: 'maze' | 'bowling' | 'football' | 'jump' | 'generic'
    title: string          // main headline e.g. "MAZE CLEAR"
    value: string          // big number/time e.g. "12.34s"
    subtext?: string       // small line e.g. "Best: 10.20s"
    isRecord?: boolean     // gold treatment
    color?: string         // accent color (default per type)
    duration?: number      // ms shown (default 4000)
}

// Color defaults per type
const TYPE_COLORS: Record<string, string> = {
    maze: '#00bfff',
    bowling: '#ffcc00',
    football: '#00e676',
    jump: '#ff5500',
    generic: '#a0a0a0',
}

// ── Single Toast ──────────────────────────────────────────────────────────
function Toast({
    data,
    onDone,
    index,
}: {
    data: AchievementData
    onDone: () => void
    index: number
}) {
    const ref = useRef<HTMLDivElement>(null)
    const color = data.color ?? TYPE_COLORS[data.type] ?? '#a0a0a0'
    const duration = data.duration ?? 4000

    useEffect(() => {
        const el = ref.current
        if (!el) return

        // Slide in from right
        el.style.opacity = '0'
        el.style.transform = 'translateX(24px)'
        const t0 = requestAnimationFrame(() => {
            el.style.transition = 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.22,1,0.36,1)'
            el.style.opacity = '1'
            el.style.transform = 'translateX(0)'
        })

        // Fade out
        const fadeId = setTimeout(() => {
            el.style.transition = 'opacity 0.4s ease, transform 0.4s ease'
            el.style.opacity = '0'
            el.style.transform = 'translateX(16px)'
        }, duration - 420)

        const doneId = setTimeout(onDone, duration)

        return () => {
            cancelAnimationFrame(t0)
            clearTimeout(fadeId)
            clearTimeout(doneId)
        }
    }, [])

    return (
        <div
            ref={ref}
            style={{
                display: 'flex',
                alignItems: 'stretch',
                gap: 0,
                borderRadius: '12px',
                overflow: 'hidden',
                background: 'rgba(4, 12, 8, 0.82)',
                border: `1px solid ${color}30`,
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                boxShadow: `0 4px 32px rgba(0,0,0,0.5), 0 0 0 1px ${color}14, inset 0 1px 0 ${color}18`,
                minWidth: '240px',
                maxWidth: '300px',
                fontFamily: "'JetBrains Mono', monospace",
                pointerEvents: 'none',
                marginBottom: index > 0 ? '0.5rem' : 0,
            }}
        >
            {/* Left color bar */}
            <div style={{
                width: '3px',
                background: data.isRecord
                    ? `linear-gradient(to bottom, #ffcc00, ${color})`
                    : color,
                flexShrink: 0,
                boxShadow: `0 0 8px ${color}60`,
            }} />

            {/* Content */}
            <div style={{
                padding: '0.7rem 0.9rem',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.1rem',
            }}>
                {/* Record badge */}
                {data.isRecord && (
                    <div style={{
                        fontSize: '0.48rem',
                        fontWeight: 700,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: '#ffcc00',
                        marginBottom: '0.15rem',
                    }}>
                        ★ NEW RECORD
                    </div>
                )}

                {/* Title */}
                <div style={{
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: color,
                    opacity: 0.85,
                }}>
                    {data.title}
                </div>

                {/* Value — big */}
                <div style={{
                    fontSize: data.value.length > 6 ? '1.4rem' : '1.8rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                }}>
                    {data.value}
                </div>

                {/* Subtext */}
                {data.subtext && (
                    <div style={{
                        fontSize: '0.55rem',
                        color: 'rgba(255,255,255,0.28)',
                        letterSpacing: '0.08em',
                        marginTop: '0.1rem',
                    }}>
                        {data.subtext}
                    </div>
                )}
            </div>

            {/* Right icon area */}
            <div style={{
                width: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                opacity: 0.7,
                flexShrink: 0,
                paddingRight: '0.5rem',
            }}>
                {data.type === 'maze' && '🧩'}
                {data.type === 'bowling' && '🎳'}
                {data.type === 'football' && '⚽'}
                {data.type === 'jump' && '🚀'}
                {data.type === 'generic' && '🏆'}
            </div>
        </div>
    )
}

// ── Toast Container — stacks toasts bottom-right ─────────────────────────
interface ToastEntry extends AchievementData {
    id: number
}

let _toastId = 0

export function AchievementToastContainer() {
    const [toasts, setToasts] = useState<ToastEntry[]>([])

    const remove = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    useEffect(() => {
        const handler = (e: Event) => {
            const data = (e as CustomEvent<AchievementData>).detail
            _toastId++
            setToasts(prev => [...prev.slice(-2), { ...data, id: _toastId }])
            // Max 3 toasts at once — slice older ones
        }
        window.addEventListener('achievement', handler)
        return () => window.removeEventListener('achievement', handler)
    }, [])

    if (toasts.length === 0) return null

    return (
        <div style={{
            position: 'fixed',
            bottom: '5rem',     // above the Standard Portfolio button
            right: '1rem',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column-reverse',
            gap: '0.5rem',
            pointerEvents: 'none',
        }}>
            {toasts.map((toast, i) => (
                <Toast
                    key={toast.id}
                    data={toast}
                    onDone={() => remove(toast.id)}
                    index={i}
                />
            ))}
        </div>
    )
}

// ── Helper: dispatch an achievement from anywhere ─────────────────────────
export function fireAchievement(data: AchievementData) {
    window.dispatchEvent(new CustomEvent<AchievementData>('achievement', { detail: data }))
}
