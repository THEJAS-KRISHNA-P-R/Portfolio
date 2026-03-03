"use client"
import { useEffect, useState } from "react"

export function MazeModeModal() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const show = () => setVisible(true)
    window.addEventListener('maze:show-modal', show)
    return () => window.removeEventListener('maze:show-modal', show)
  }, [])

  const select = (mode: 'reset' | 'counter') => {
    window.dispatchEvent(new CustomEvent('maze:mode-selected', { detail: { mode } }))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 450,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)',
      fontFamily: "'JetBrains Mono', monospace",
      padding: '1rem',
    }}>
      <div style={{
        background: 'rgba(2,8,18,0.97)',
        border: '1px solid rgba(0,191,255,0.25)',
        borderRadius: '20px',
        padding: 'clamp(1.2rem,4vw,2rem)',
        width: 'min(320px, calc(100vw - 2rem))',
        boxShadow: '0 0 60px rgba(0,191,255,0.1), 0 20px 60px rgba(0,0,0,0.7)',
        backdropFilter: 'blur(24px)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
          <div style={{ fontSize: 'clamp(0.5rem,1.5vw,0.6rem)', color: 'rgba(0,191,255,0.5)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            MAZE MODE
          </div>
          <div style={{ fontSize: 'clamp(0.9rem,2.5vw,1.05rem)', color: '#e8f5e9', fontWeight: 700 }}>
            Choose Difficulty
          </div>
          <div style={{ fontSize: 'clamp(0.5rem,1.3vw,0.58rem)', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em', marginTop: '0.3rem', lineHeight: 1.5 }}>
            Drive from ENTER → EXIT
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => select('reset')} style={{
            flex: 1, padding: 'clamp(0.6rem,2vw,0.8rem) 0.5rem',
            borderRadius: '12px',
            border: '1.5px solid rgba(255,50,50,0.45)',
            background: 'rgba(255,30,30,0.1)',
            color: '#ff5555',
            fontFamily: 'inherit',
            fontSize: 'clamp(0.55rem,1.5vw,0.65rem)',
            fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
            transition: 'all 0.15s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,30,30,0.22)'; e.currentTarget.style.borderColor = 'rgba(255,50,50,0.8)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,30,30,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,50,50,0.45)' }}
          >
            <span style={{ fontSize: 'clamp(1rem,3vw,1.3rem)' }}>💥</span>
            RESET
            <span style={{ fontSize: 'clamp(0.42rem,1.2vw,0.5rem)', color: 'rgba(255,85,85,0.55)', fontWeight: 400 }}>Hit wall = restart</span>
          </button>
          <button onClick={() => select('counter')} style={{
            flex: 1, padding: 'clamp(0.6rem,2vw,0.8rem) 0.5rem',
            borderRadius: '12px',
            border: '1.5px solid rgba(0,150,255,0.45)',
            background: 'rgba(0,120,255,0.1)',
            color: '#4da6ff',
            fontFamily: 'inherit',
            fontSize: 'clamp(0.55rem,1.5vw,0.65rem)',
            fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
            transition: 'all 0.15s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,120,255,0.22)'; e.currentTarget.style.borderColor = 'rgba(0,150,255,0.8)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,120,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(0,150,255,0.45)' }}
          >
            <span style={{ fontSize: 'clamp(1rem,3vw,1.3rem)' }}>🔢</span>
            COUNTER
            <span style={{ fontSize: 'clamp(0.42rem,1.2vw,0.5rem)', color: 'rgba(77,166,255,0.55)', fontWeight: 400 }}>Count wall hits</span>
          </button>
        </div>

        <button onClick={() => setVisible(false)} style={{
          marginTop: '0.8rem', width: '100%', padding: '0.3rem',
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.2)', fontFamily: 'inherit',
          fontSize: '0.52rem', letterSpacing: '0.08em', cursor: 'pointer',
        }}>
          dismiss
        </button>
      </div>
    </div>
  )
}
