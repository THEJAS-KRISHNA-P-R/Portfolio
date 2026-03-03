"use client"
import { useEffect, useRef, useState } from "react"

export interface GameClearPayload {
  game: 'football' | 'bowling' | 'maze'
  isRecord?: boolean
  value?: string   // "80 pts" / "12.34s"
}

const MESSAGES: Record<string, { big: string; sub: string; color: string; emoji: string }> = {
  football_record: { big: 'NEW RECORD!',   sub: 'Incredible goal!',       color: '#00e676', emoji: '🏆' },
  football:        { big: 'GOAL!',          sub: 'Well driven!',           color: '#00e676', emoji: '⚽' },
  bowling:         { big: 'STRIKE!',        sub: 'All 10 pins — perfect!', color: '#ffcc00', emoji: '💥' },
  maze_record:     { big: 'MAZE RECORD!',   sub: 'Blazing fast run!',      color: '#00bfff', emoji: '⚡' },
  maze:            { big: 'MAZE CLEAR!',    sub: 'You made it through!',   color: '#00bfff', emoji: '🏁' },
}

function key(p: GameClearPayload) {
  if (p.game === 'football' && p.isRecord) return 'football_record'
  if (p.game === 'maze' && p.isRecord) return 'maze_record'
  return p.game
}

export function GameClearBanner() {
  const [entry, setEntry] = useState<(GameClearPayload & { id: number }) | null>(null)
  const idRef = useRef(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<GameClearPayload>).detail
      idRef.current++
      setEntry({ ...detail, id: idRef.current })
    }
    window.addEventListener('game:clear', handler)
    return () => window.removeEventListener('game:clear', handler)
  }, [])

  useEffect(() => {
    if (!entry || !ref.current) return
    const el = ref.current
    // slide down from top
    el.style.opacity = '0'
    el.style.transform = 'translateX(-50%) translateY(-40px) scale(0.92)'
    const raf = requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.4s ease, transform 0.45s cubic-bezier(0.22,1,0.36,1)'
      el.style.opacity = '1'
      el.style.transform = 'translateX(-50%) translateY(0) scale(1)'
    })
    const fadeId = setTimeout(() => {
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease'
      el.style.opacity = '0'
      el.style.transform = 'translateX(-50%) translateY(-20px) scale(0.96)'
    }, 3200)
    const doneId = setTimeout(() => setEntry(null), 3700)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(fadeId)
      clearTimeout(doneId)
    }
  }, [entry?.id])

  if (!entry) return null

  const m = MESSAGES[key(entry)]
  if (!m) return null

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: 'clamp(3.5rem, 7vh, 5rem)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 500,
        pointerEvents: 'none',
        fontFamily: "'JetBrains Mono', monospace",
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.25rem',
      }}
    >
      {/* Main card */}
      <div style={{
        background: 'rgba(2,8,18,0.92)',
        border: `1.5px solid ${m.color}40`,
        borderRadius: '14px',
        padding: 'clamp(0.55rem,2vw,0.8rem) clamp(1rem,4vw,1.8rem)',
        backdropFilter: 'blur(20px)',
        boxShadow: `0 0 40px ${m.color}22, 0 8px 32px rgba(0,0,0,0.6)`,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        {/* emoji */}
        <span style={{ fontSize: 'clamp(1.3rem,4vw,1.8rem)', lineHeight: 1 }}>{m.emoji}</span>
        {/* text block */}
        <div>
          <div style={{
            fontSize: 'clamp(1rem,3.5vw,1.4rem)',
            fontWeight: 900,
            color: m.color,
            letterSpacing: '-0.01em',
            lineHeight: 1.1,
            textShadow: `0 0 20px ${m.color}80`,
          }}>
            {m.big}
          </div>
          <div style={{
            fontSize: 'clamp(0.5rem,1.5vw,0.62rem)',
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: '0.1em',
            marginTop: '0.1rem',
          }}>
            {entry.value ? `${m.sub} · ${entry.value}` : m.sub}
          </div>
        </div>
      </div>
    </div>
  )
}
