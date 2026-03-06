"use client"

import { useEffect, useRef, useState, useCallback } from "react"

export interface AchievementData {
    type: 'maze' | 'bowling' | 'football' | 'jump' | 'generic'
    title: string
    value: string
    subtext?: string
    isRecord?: boolean
    color?: string
    duration?: number
}

const TYPE_COLORS: Record<string, string> = {
    maze: '#00bfff',
    bowling: '#ffcc00',
    football: '#00e676',
    jump: '#ff5500',
    generic: '#a0a0a0',
}

function Toast({
    data,
    onDone,
}: {
    data: AchievementData
    onDone: () => void
}) {
    const ref = useRef<HTMLDivElement>(null)
    const color = data.color ?? TYPE_COLORS[data.type] ?? '#a0a0a0'
    const duration = data.duration ?? 4000

    useEffect(() => {
        const el = ref.current
        if (!el) return

        // Slide in from LEFT (container is top-left)
        el.style.opacity = '0'
        el.style.transform = 'translateX(-20px)'

        const t0 = requestAnimationFrame(() => {
            el.style.transition = 'opacity 0.28s ease, transform 0.28s cubic-bezier(0.22,1,0.36,1)'
            el.style.opacity = '1'
            el.style.transform = 'translateX(0)'
        })

        const fadeId = setTimeout(() => {
            el.style.transition = 'opacity 0.35s ease, transform 0.35s ease'
            el.style.opacity = '0'
            el.style.transform = 'translateX(-16px)'
        }, duration - 380)

        const doneId = setTimeout(onDone, duration)

        return () => {
            cancelAnimationFrame(t0)
            clearTimeout(fadeId)
            clearTimeout(doneId)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div
            ref={ref}
            style={{
                display: 'flex',
                alignItems: 'stretch',
                borderRadius: '10px',
                overflow: 'hidden',
                background: 'rgba(4,12,8,0.88)',
                border: `1px solid ${color}35`,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: `0 4px 24px rgba(0,0,0,0.45), 0 0 0 1px ${color}12`,
                width: '240px',   // fixed width — no layout shift
                fontFamily: "'JetBrains Mono', monospace",
                pointerEvents: 'none',
                willChange: 'opacity, transform',
            }}
        >
            {/* Left color bar */}
            <div style={{
                width: '3px',
                background: data.isRecord ? `linear-gradient(to bottom, #ffcc00, ${color})` : color,
                flexShrink: 0,
                boxShadow: `0 0 6px ${color}55`,
            }} />

            {/* Content */}
            <div style={{
                padding: '0.6rem 0.8rem',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.08rem',
                minWidth: 0,
            }}>
                {data.isRecord && (
                    <div style={{ fontSize: '0.44rem', fontWeight: 700, letterSpacing: '0.2em', color: '#ffcc00', marginBottom: '0.1rem' }}>
                        ★ NEW RECORD
                    </div>
                )}
                <div style={{ fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color, opacity: 0.85 }}>
                    {data.title}
                </div>
                <div style={{ fontSize: data.value.length > 6 ? '1.3rem' : '1.6rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                    {data.value}
                </div>
                {data.subtext && (
                    <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.07em', marginTop: '0.08rem' }}>
                        {data.subtext}
                    </div>
                )}
            </div>

            {/* Icon */}
            <div style={{ width: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', opacity: 0.65, flexShrink: 0, paddingRight: '0.4rem' }}>
                {data.type === 'maze' && '🧩'}
                {data.type === 'bowling' && '🎳'}
                {data.type === 'football' && '⚽'}
                {data.type === 'jump' && '🚀'}
                {data.type === 'generic' && '🏆'}
            </div>
        </div>
    )
}

interface ToastEntry extends AchievementData { id: number }
let _id = 0

export function AchievementToastContainer() {
    const [toasts, setToasts] = useState<ToastEntry[]>([])

    const remove = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    useEffect(() => {
        const handler = (e: Event) => {
            const data = (e as CustomEvent<AchievementData>).detail
            _id++
            const newId = _id
            setToasts(prev => {
                // Deduplicate: if same title+value already showing, replace it
                const filtered = prev.filter(t => !(t.title === data.title && t.value === data.value))
                // Cap at 3
                const capped = filtered.slice(-2)
                return [...capped, { ...data, id: newId }]
            })
        }
        window.addEventListener('achievement', handler)
        return () => window.removeEventListener('achievement', handler)
    }, [])

    if (toasts.length === 0) return null

    return (
        <div style={{
            position: 'fixed',
            top: 'clamp(4.5rem, 10vh, 5.5rem)',
            left: 'clamp(0.6rem, 2vw, 1rem)',
            zIndex: 400,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem',
            pointerEvents: 'none',
        }}>
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    data={toast}
                    onDone={() => remove(toast.id)}
                />
            ))}
        </div>
    )
}

export function fireAchievement(data: AchievementData) {
    window.dispatchEvent(new CustomEvent<AchievementData>('achievement', { detail: data }))
}