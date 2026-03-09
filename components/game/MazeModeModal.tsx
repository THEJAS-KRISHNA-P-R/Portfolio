"use client"
import { useEffect, useState } from "react"

export type MazeMode = 'explore' | 'hits' | 'hard'

export function MazeModeModal() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onApproach = () => setShow(true)
    window.addEventListener('maze:approach', onApproach)
    return () => window.removeEventListener('maze:approach', onApproach)
  }, [])

  const handleSelect = (mode: MazeMode) => {
    setShow(false)
    window.dispatchEvent(new CustomEvent('maze:confirm', { detail: { mode } }))
  }

  const handleCancel = () => {
    setShow(false)
    window.dispatchEvent(new CustomEvent('maze:cancel'))
  }

  if (!show) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 600,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(10px)',
      fontFamily: "'JetBrains Mono', monospace",
      padding: 'min(4rem, 10vh) 1rem 2rem 1rem',
      overflowY: 'auto',
      pointerEvents: 'auto'
    }}>
      <div style={{
        background: 'rgba(2,8,18,0.97)',
        border: '1px solid rgba(0,191,255,0.25)',
        borderRadius: '24px',
        padding: 'clamp(1.2rem,4vw,2rem)',
        width: 'min(440px, calc(100vw - 2rem))',
        boxShadow: '0 0 60px rgba(0,191,255,0.1), 0 20px 60px rgba(0,0,0,0.7)',
        backdropFilter: 'blur(24px)',
        position: 'relative'
      }}>
        <button
          onClick={handleCancel}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1.2rem',
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.3)',
            cursor: 'pointer',
            fontSize: '1.2rem',
            lineHeight: 1,
            padding: '0.2rem',
            fontFamily: 'inherit',
            zIndex: 10
          }}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'rgba(0,191,255,0.5)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            MAZE SYSTEM v2.0
          </div>
          <div style={{ fontSize: '1.2rem', color: '#e8f5e9', fontWeight: 700 }}>
            Select Protocol
          </div>
        </div>

        {/* Buttons Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
          {/* EXPLORE */}
          <button onClick={() => handleSelect('explore')} style={{
            padding: '1rem',
            borderRadius: '16px',
            border: '1.5px solid rgba(0,191,255,0.2)',
            background: 'rgba(0,191,255,0.05)',
            color: '#4da6ff',
            fontFamily: 'inherit',
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,191,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(0,191,255,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,191,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(0,191,255,0.2)' }}
          >
            <span style={{ fontSize: '1.5rem' }}>🌍</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.05em' }}>EXPLORATION</div>
              <div style={{ fontSize: '0.6rem', color: 'rgba(77,166,255,0.6)', marginTop: '0.1rem' }}>No timer. No hits. Just vibes.</div>
            </div>
          </button>

          {/* HITS */}
          <button onClick={() => handleSelect('hits')} style={{
            padding: '1rem',
            borderRadius: '16px',
            border: '1.5px solid rgba(255,210,0,0.2)',
            background: 'rgba(255,210,0,0.05)',
            color: '#ffcc00',
            fontFamily: 'inherit',
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,210,0,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,210,0,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,210,0,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,210,0,0.2)' }}
          >
            <span style={{ fontSize: '1.5rem' }}>💥</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.05em' }}>HIT COUNTER</div>
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,204,0,0.6)', marginTop: '0.1rem' }}>Count your bumps. Zero is the goal.</div>
            </div>
          </button>

          {/* HARD */}
          <button onClick={() => handleSelect('hard')} style={{
            padding: '1rem',
            borderRadius: '16px',
            border: '1.5px solid rgba(255,50,50,0.2)',
            background: 'rgba(255,50,50,0.05)',
            color: '#ff5555',
            fontFamily: 'inherit',
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,50,50,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,50,50,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,50,50,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,50,50,0.2)' }}
          >
            <span style={{ fontSize: '1.5rem' }}>💀</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.05em' }}>HARD (RESET)</div>
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,85,85,0.6)', marginTop: '0.1rem' }}>Timed run. One hit = FULL RESTART.</div>
            </div>
          </button>
        </div>

        <button onClick={handleCancel} style={{
          marginTop: '1.2rem', width: '100%', padding: '0.4rem',
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.15)', fontFamily: 'inherit',
          fontSize: '0.55rem', letterSpacing: '0.1em', cursor: 'pointer',
          textTransform: 'uppercase'
        }}>
          Close Protocol
        </button>
      </div>
    </div>
  )
}
