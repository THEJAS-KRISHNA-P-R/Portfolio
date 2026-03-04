"use client"

import { useEffect, useRef, useState, useCallback } from "react"

// ── Types ─────────────────────────────────────────────────────────────────
export type GameNotifType =
  | 'goal'        // football
  | 'bowling'     // pins knocked
  | 'strike'      // all 10 pins
  | 'maze_clear'  // maze completed
  | 'maze_hit'    // wall hit (counter mode)
  | 'maze_reset'  // wall hit (reset mode)
  | 'record'      // any new high score
  | 'info'        // generic

export interface GameNotifData {
  type: GameNotifType
  title: string        // e.g. "GOAL!" / "STRIKE!" / "MAZE CLEAR"
  value?: string       // e.g. "80 pts" / "12.34s" / "7/10"
  subtext?: string     // e.g. "New record!" / "Best: 10.20s"
  isRecord?: boolean
  color?: string       // accent — defaults per type
  duration?: number    // ms, default 3500
}

const TYPE_COLOR: Record<GameNotifType, string> = {
  goal:       '#00e676',
  bowling:    '#ffcc00',
  strike:     '#ffcc00',
  maze_clear: '#00bfff',
  maze_hit:   '#ff9944',
  maze_reset: '#ff3322',
  record:     '#ffcc00',
  info:       '#888888',
}

const TYPE_ICON: Record<GameNotifType, string> = {
  goal:       '⚽',
  bowling:    '🎳',
  strike:     '💥',
  maze_clear: '🏁',
  maze_hit:   '💢',
  maze_reset: '🔄',
  record:     '★',
  info:       'ℹ',
}

// ── Global fire helper ────────────────────────────────────────────────────
export function fireNotif(data: GameNotifData) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('game:achievement', { detail: data }))
  }
}

// ── Single toast ──────────────────────────────────────────────────────────
interface ToastEntry extends GameNotifData { id: number }
let _nextId = 0

function NotifToast({
  data,
  onDone,
}: {
  data: ToastEntry
  onDone: () => void
}) {
  const ref      = useRef<HTMLDivElement>(null)
  const color    = data.color ?? TYPE_COLOR[data.type]
  const duration = data.duration ?? 3500

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.opacity   = '0'
    el.style.transform = 'translateX(20px) scale(0.97)'
    const raf = requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.22,1,0.36,1)'
      el.style.opacity    = '1'
      el.style.transform  = 'translateX(0) scale(1)'
    })
    const fadeId = setTimeout(() => {
      el.style.transition = 'opacity 0.35s ease, transform 0.35s ease'
      el.style.opacity    = '0'
      el.style.transform  = 'translateX(12px) scale(0.97)'
    }, duration - 380)
    const doneId = setTimeout(onDone, duration)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(fadeId)
      clearTimeout(doneId)
    }
  }, [duration, onDone])

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        alignItems: 'stretch',
        borderRadius: '10px',
        overflow: 'hidden',
        background: 'rgba(3,10,6,0.88)',
        border: `1px solid ${color}28`,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px ${color}10`,
        width: '100%',
        fontFamily: "'JetBrains Mono', monospace",
        pointerEvents: 'none',
      }}
    >
      {/* Accent bar */}
      <div style={{
        width: '3px',
        background: data.isRecord ? `linear-gradient(180deg, #ffcc00, ${color})` : color,
        flexShrink: 0,
        boxShadow: `0 0 6px ${color}50`,
      }} />
      {/* Body */}
      <div style={{ padding: '0.55rem 0.75rem', flex: 1, minWidth: 0 }}>
        {data.isRecord && (
          <div style={{ fontSize: '0.42rem', color: '#ffcc00', letterSpacing: '0.2em', marginBottom: '0.1rem', textTransform: 'uppercase' }}>
            ★ NEW RECORD
          </div>
        )}
        <div style={{ fontSize: '0.55rem', color, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {data.title}
        </div>
        {data.value && (
          <div style={{ fontSize: data.value.length > 7 ? '1.2rem' : '1.5rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            {data.value}
          </div>
        )}
        {data.subtext && (
          <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', marginTop: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {data.subtext}
          </div>
        )}
      </div>
      {/* Icon */}
      <div style={{ width: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
        {TYPE_ICON[data.type]}
      </div>
    </div>
  )
}

// ── Container — mount ONCE in layout ──────────────────────────────────────
export function GameNotifContainer() {
  const [toasts, setToasts] = useState<ToastEntry[]>([])

  const remove = useCallback((id: number) => {
    setToasts(p => p.filter(t => t.id !== id))
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent<GameNotifData>).detail
      _nextId++
      setToasts(p => {
        // Remove any existing toast of same type before adding new one
        const filtered = p.filter(t => t.type !== d.type)
        return [...filtered.slice(-1), { ...d, id: _nextId }]
      })
    }
    window.addEventListener('game:achievement', handler)
    return () => window.removeEventListener('game:achievement', handler)
  }, [])

  if (!toasts.length) return null

  return (
    <div style={{
      position: 'fixed',
      // Responsive positioning: bottom-right on desktop, top-center on mobile
      // We use CSS media query equivalent via inline clamp trick:
      bottom: 'clamp(4.5rem, 8vh, 6rem)',
      right: '0.75rem',
      zIndex: 400,
      display: 'flex',
      flexDirection: 'column-reverse',
      gap: '0.4rem',
      pointerEvents: 'none',
      // Max width: on mobile constrain to not overflow
      width: 'min(260px, calc(100vw - 1.5rem))',
    }}>
      {toasts.map(t => (
        <NotifToast key={t.id} data={t} onDone={() => remove(t.id)} />
      ))}
    </div>
  )
}
