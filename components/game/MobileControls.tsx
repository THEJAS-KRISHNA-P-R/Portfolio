"use client"

import { useEffect, useRef, useState } from "react"
import { usePortfolioStore } from "@/store/usePortfolioStore"

// Control scheme options
type ControlScheme = 'buttons' | 'joystick' | 'swipe'

interface MobileInput {
  forward:  boolean
  brake:    boolean
  backward: boolean
  left:     boolean
  right:    boolean
  boost:    boolean
  steerX:   number
  throttleY: number
}

// Shared ref — Car.tsx reads this directly
export const mobileInput: MobileInput = {
  forward: false,
  brake:   false,
  backward: false,
  left:    false,
  right:   false,
  boost:   false,
  steerX:   0,
  throttleY: 0,
}

const BTN_STYLE_BASE: React.CSSProperties = {
  userSelect: 'none',
  WebkitUserSelect: 'none',
  touchAction: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '14px',
  fontFamily: "'JetBrains Mono', monospace",
  fontWeight: 800,
  fontSize: 'clamp(1rem, 4vw, 1.4rem)',
  color: 'rgba(255,255,255,0.85)',
  background: 'rgba(10,25,15,0.72)',
  border: '1.5px solid rgba(0,230,118,0.2)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  boxShadow: '0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
  cursor: 'pointer',
  transition: 'background 0.06s, transform 0.06s, border-color 0.06s',
  WebkitTapHighlightColor: 'transparent',
  position: 'relative',
  overflow: 'hidden',
}

const BTN_ACTIVE_STYLE: React.CSSProperties = {
  background: 'rgba(0,180,90,0.25)',
  border: '1.5px solid rgba(0,230,118,0.6)',
  transform: 'scale(0.94)',
}

function GameButton({
  label,
  emoji,
  onPress,
  onRelease,
  active,
  color = 'rgba(0,230,118,0.2)',
  size = 64,
}: {
  label: string
  emoji: string
  onPress: () => void
  onRelease: () => void
  active?: boolean
  color?: string
  size?: number
}) {
  const style: React.CSSProperties = {
    ...BTN_STYLE_BASE,
    ...(active ? BTN_ACTIVE_STYLE : {}),
    width: `clamp(${size * 0.8}px, ${size / 375 * 100}vw, ${size}px)`,
    height: `clamp(${size * 0.8}px, ${size / 375 * 100}vw, ${size}px)`,
    borderColor: active ? color : 'rgba(255,255,255,0.12)',
    boxShadow: active
      ? `0 0 16px ${color}50, 0 4px 16px rgba(0,0,0,0.4)` 
      : '0 4px 16px rgba(0,0,0,0.4)',
    flexDirection: 'column',
    gap: '2px',
    fontSize: 'clamp(0.9rem, 3vw, 1.2rem)',
  }

  return (
    <div
      style={style}
      onPointerDown={e => { e.preventDefault(); onPress() }}
      onPointerUp={e => { e.preventDefault(); onRelease() }}
      onPointerLeave={e => { e.preventDefault(); onRelease() }}
      onPointerCancel={e => { e.preventDefault(); onRelease() }}
    >
      <span style={{ fontSize: 'clamp(1rem, 4vw, 1.4rem)', lineHeight: 1 }}>{emoji}</span>
      <span style={{ fontSize: 'clamp(0.38rem, 1vw, 0.45rem)', letterSpacing: '0.1em', opacity: 0.5 }}>{label}</span>
    </div>
  )
}

// ── Center-zone double-tap TURBO (30–70% width, 20–80% height) ───────────────
// Invisible zone over the area where the car sits in camera view.
// Double-tap here activates turbo. No text, no visible UI, no flash.
function CenterZoneTurbo() {
  const lastTapRef   = useRef(0)
  const boostTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation()
    const now = Date.now()
    if (now - lastTapRef.current < 300) {
      mobileInput.boost = true
      if (boostTimer.current) clearTimeout(boostTimer.current)
      boostTimer.current = setTimeout(() => {
        mobileInput.boost = false
      }, 3000)
    }
    lastTapRef.current = now
  }

  useEffect(() => () => { if (boostTimer.current) clearTimeout(boostTimer.current) }, [])

  return (
    <div
      onPointerDown={handlePointerDown}
      style={{
        position:      'fixed',
        left:          '30%',
        width:         '40%',
        top:           '20%',
        height:        '60%',
        zIndex:        98,          // below all buttons (z:250) and joystick (z:250)
        background:    'transparent',
        pointerEvents: 'auto',
        touchAction:   'none',
      }}
    />
  )
}

// ── Virtual Joystick — pure pointer-events, no library ───────────────────────
// Inspired by Bruno Simon's folio-2025 Nipple.js approach:
// one-finger drag → analog steer + throttle, progress^3 acceleration curve,
// pointer capture for clean multi-touch handling.
const JOYSTICK_RADIUS = 56   // px — max knob travel from center
const JOYSTICK_DEAD   = 0.14  // normalized dead-zone

function VirtualJoystick() {
  const baseRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const state   = useRef({ active: false, pid: -1, cx: 0, cy: 0 })

  useEffect(() => {
    const base = baseRef.current
    if (!base) return

    const release = () => {
      state.current.active = false
      state.current.pid    = -1
      mobileInput.forward   = false
      mobileInput.brake     = false
      mobileInput.backward  = false
      mobileInput.left      = false
      mobileInput.right     = false
      mobileInput.steerX    = 0
      mobileInput.throttleY = 0
      if (knobRef.current) {
        knobRef.current.style.transform = 'translate(-50%, -50%)'
        knobRef.current.style.opacity   = '0.38'
        knobRef.current.style.boxShadow = '0 0 10px rgba(0,230,118,0.20)'
      }
    }

    const onDown = (e: PointerEvent) => {
      e.preventDefault()
      if (state.current.active) return
      state.current.active = true
      state.current.pid    = e.pointerId
      base.setPointerCapture(e.pointerId)
      const r = base.getBoundingClientRect()
      state.current.cx = r.left + r.width  / 2
      state.current.cy = r.top  + r.height / 2
      if (knobRef.current) knobRef.current.style.opacity = '1'
    }

    const onMove = (e: PointerEvent) => {
      e.preventDefault()
      if (!state.current.active || e.pointerId !== state.current.pid) return

      const rawDx = e.clientX - state.current.cx
      const rawDy = e.clientY - state.current.cy
      const dist  = Math.hypot(rawDx, rawDy)
      const scale = dist > 0 ? Math.min(dist, JOYSTICK_RADIUS) / dist : 0
      const kx    = rawDx * scale  // clamped px offset
      const ky    = rawDy * scale

      // Normalized -1..1 analog values
      const sx =  kx / JOYSTICK_RADIUS  //  left(-) / right(+)
      const sy = -ky / JOYSTICK_RADIUS  //  up(+)  / down(-)  → forward positive

      // Progress^3 curve (Bruno Simon style) on the throttle axis
      const throttle = Math.sign(sy) * Math.pow(Math.abs(sy), 3)

      const fsX = Math.abs(sx) > JOYSTICK_DEAD ? sx : 0
      const fsY = Math.abs(sy) > JOYSTICK_DEAD ? throttle : 0

      mobileInput.forward   = fsY >  JOYSTICK_DEAD
      mobileInput.brake     = fsY < -JOYSTICK_DEAD
      mobileInput.backward  = fsY < -JOYSTICK_DEAD
      mobileInput.left      = fsX < -JOYSTICK_DEAD
      mobileInput.right     = fsX >  JOYSTICK_DEAD
      mobileInput.steerX    = fsX
      mobileInput.throttleY = fsY

      // Visual knob
      if (knobRef.current) {
        const glow = `0 0 ${10 + dist * 0.18}px rgba(0,230,118,${0.25 + Math.min(dist / JOYSTICK_RADIUS, 1) * 0.4})`
        knobRef.current.style.transform  = `translate(calc(-50% + ${kx}px), calc(-50% + ${ky}px))`
        knobRef.current.style.boxShadow  = glow
      }
    }

    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== state.current.pid) return
      release()
    }

    base.addEventListener('pointerdown',   onDown,  { passive: false })
    base.addEventListener('pointermove',   onMove,  { passive: false })
    base.addEventListener('pointerup',     onUp)
    base.addEventListener('pointercancel', onUp)

    return () => {
      base.removeEventListener('pointerdown',   onDown)
      base.removeEventListener('pointermove',   onMove)
      base.removeEventListener('pointerup',     onUp)
      base.removeEventListener('pointercancel', onUp)
      release()
    }
  }, [])

  return (
    <div
      ref={baseRef}
      style={{
        position: 'fixed',
        left: '8vw',
        bottom: 80,
        width: 140,
        height: 140,
        zIndex: 250,
        borderRadius: '50%',
        background: 'rgba(0,255,136,0.02)',
        border: '1px solid rgba(0,255,136,0.10)',
        touchAction: 'none',
        pointerEvents: 'auto',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* Crosshair guides */}
      <div style={{ position:'absolute', top:'50%', left:'12%', right:'12%', height:1, background:'rgba(0,255,136,0.10)', transform:'translateY(-50%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', left:'50%', top:'12%', bottom:'12%', width:1, background:'rgba(0,255,136,0.10)', transform:'translateX(-50%)', pointerEvents:'none' }} />
      {/* Knob */}
      <div
        ref={knobRef}
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: 44, height: 44,
          borderRadius: '50%',
          background: 'rgba(0,230,118,0.15)',
          border: '2px solid rgba(0,230,118,0.55)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          transform: 'translate(-50%, -50%)',
          opacity: 0.38,
          boxShadow: '0 0 10px rgba(0,230,118,0.20)',
          pointerEvents: 'none',
          transition: 'opacity 0.1s',
          willChange: 'transform',
        }}
      />
    </div>
  )
}

function SettingsSheet({
  visible,
  onClose,
  scheme,
  setScheme,
}: {
  visible: boolean
  onClose: () => void
  scheme: ControlScheme
  setScheme: (s: ControlScheme) => void
}) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 470,
        display: visible ? 'flex' : 'none',
        alignItems: 'flex-end',
        background: visible ? 'rgba(0,0,0,0.5)' : 'transparent',
        backdropFilter: visible ? 'blur(4px)' : 'none',
      }}
      onPointerDown={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        onPointerDown={e => e.stopPropagation()}
        style={{
          width: '100%',
          background: 'rgba(2,12,7,0.97)',
          border: '1px solid rgba(0,230,118,0.15)',
          borderRadius: '20px 20px 0 0',
          padding: 'clamp(1rem,4vw,1.5rem)',
          paddingBottom: 'max(1.2rem, env(safe-area-inset-bottom))',
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        <div style={{
          width: '40px', height: '4px', borderRadius: '2px',
          background: 'rgba(255,255,255,0.15)', margin: '0 auto 1rem'
        }} />

        <div style={{
          fontSize: 'clamp(0.5rem,1.5vw,0.6rem)',
          color: 'rgba(0,230,118,0.5)',
          letterSpacing: '0.2em',
          marginBottom: '0.8rem',
          textTransform: 'uppercase',
        }}>
          Control Scheme
        </div>

        {([
          { id: 'buttons',  label: 'BUTTONS',  desc: 'Left = steer  |  Right = gas/brake', emoji: '🎮', disabled: false },
          { id: 'joystick', label: 'JOYSTICK', desc: 'Virtual analog stick',               emoji: '🕹️', disabled: false },
        ] as const).map(opt => (
          <button
            key={opt.id}
            onPointerDown={e => {
              e.stopPropagation()
              if (!opt.disabled) {
                setScheme(opt.id)
                try { localStorage.setItem('controlScheme', opt.id) } catch {}
              }
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              width: '100%', padding: '0.65rem 0.9rem',
              marginBottom: '0.5rem',
              borderRadius: '12px',
              border: scheme === opt.id
                ? '1.5px solid rgba(0,230,118,0.5)'
                : '1.5px solid rgba(255,255,255,0.07)',
              background: scheme === opt.id
                ? 'rgba(0,230,118,0.1)'
                : 'rgba(255,255,255,0.03)',
              color: opt.disabled
                ? 'rgba(255,255,255,0.2)'
                : scheme === opt.id ? '#00e676' : 'rgba(255,255,255,0.5)',
              fontFamily: 'inherit',
              fontSize: 'clamp(0.6rem,1.8vw,0.72rem)',
              fontWeight: 700,
              letterSpacing: '0.1em',
              cursor: opt.disabled ? 'not-allowed' : 'pointer',
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: '1.3rem' }}>{opt.emoji}</span>
            <span style={{ flex: 1 }}>
              {opt.label}
              <span style={{
                display: 'block',
                fontSize: 'clamp(0.45rem,1.2vw,0.52rem)',
                fontWeight: 400, opacity: 0.45, marginTop: '1px'
              }}>
                {opt.disabled ? '🔒 Coming soon' : opt.desc}
              </span>
            </span>
            {scheme === opt.id && !opt.disabled && (
              <span style={{ color: '#00e676', fontSize: '0.9rem' }}>✓</span>
            )}
          </button>
        ))}

        <button
          onPointerDown={e => { e.stopPropagation(); onClose() }}
          style={{
            marginTop: '0.5rem', width: '100%', padding: '0.6rem',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)',
            color: 'rgba(255,255,255,0.4)',
            fontFamily: 'inherit',
            fontSize: 'clamp(0.52rem,1.4vw,0.6rem)',
            letterSpacing: '0.1em',
            cursor: 'pointer',
          }}
        >
          CLOSE
        </button>
      </div>
    </div>
  )
}

export function MobileControls() {
  const [frozen,      setFrozen]      = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [scheme, setScheme] = useState<ControlScheme>(
    () => (typeof localStorage !== 'undefined'
      ? (localStorage.getItem('controlScheme') as ControlScheme) ?? 'buttons'
      : 'buttons')
  )

  const [activeLeft,    setActiveLeft]    = useState(false)
  const [activeRight,   setActiveRight]   = useState(false)
  const [activeForward, setActiveForward] = useState(false)
  const [activeBrake,   setActiveBrake]   = useState(false)

  const handleGasPress = () => {
    mobileInput.forward = true
    setActiveForward(true)
    mobileInput.throttleY = 1
  }

  const handleGasRelease = () => {
    mobileInput.forward = false
    setActiveForward(false)
    mobileInput.throttleY = 0
    // boost stays active until the 3s timeout clears it
  }

  useEffect(() => {
    const h = (e: Event) => setFrozen((e as CustomEvent).detail.frozen)
    window.addEventListener('game:freeze-controls', h)
    return () => window.removeEventListener('game:freeze-controls', h)
  }, [])

  const [isTouch, setIsTouch] = useState(false)
  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])
  if (!isTouch) return null

  const BTN = 68

  return (
    <>
      <CenterZoneTurbo />
      {isTouch && (
        <button
          onPointerDown={e => { e.preventDefault(); setSettingsOpen(v => !v) }}
          style={{
            position: 'fixed',
            top: 'clamp(3.8rem, 9vw, 5rem)',
            right: 'clamp(0.6rem, 2vw, 0.9rem)',
            zIndex: 260,
            background: 'rgba(4,16,10,0.75)',
            border: '1px solid rgba(0,230,118,0.15)',
            borderRadius: '10px',
            width: 'clamp(34px, 9vw, 42px)',
            height: 'clamp(34px, 9vw, 42px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'clamp(0.9rem, 2.8vw, 1.1rem)',
            color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'none',
          }}
          aria-label="Controls settings"
        >
          ⚙
        </button>
      )}

      {!frozen && scheme === 'joystick' && <VirtualJoystick />}

      {/* Section 5: Buttons mode — unchanged layout */}
      {!frozen && scheme === 'buttons' && (
        <div style={{
          position: 'fixed',
          bottom: 'max(4.5rem, calc(env(safe-area-inset-bottom) + 4rem))',
          left: 0,
          right: 0,
          zIndex: 250,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          padding: '0 clamp(1.5rem, 6vw, 3rem)',
          pointerEvents: 'none',
        }}>
          <div style={{ display: 'flex', gap: 'clamp(0.4rem, 2vw, 0.65rem)', pointerEvents: 'auto' }}>
            <GameButton
              label="LEFT"
              emoji="◀"
              active={activeLeft}
              color="rgba(0,191,255,0.5)"
              size={BTN}
              onPress={() => { mobileInput.left = true;  setActiveLeft(true); mobileInput.steerX = -1; }}
              onRelease={() => { mobileInput.left = false; setActiveLeft(false); mobileInput.steerX = 0; }}
            />
            <GameButton
              label="RIGHT"
              emoji="▶"
              active={activeRight}
              color="rgba(0,191,255,0.5)"
              size={BTN}
              onPress={() => { mobileInput.right = true;  setActiveRight(true); mobileInput.steerX = 1; }}
              onRelease={() => { mobileInput.right = false; setActiveRight(false); mobileInput.steerX = 0; }}
            />
          </div>

          <div style={{ display: 'flex', gap: 'clamp(0.4rem, 2vw, 0.65rem)', pointerEvents: 'auto' }}>
            <GameButton
              label="BRAKE"
              emoji="▼"
              active={activeBrake}
              color="rgba(255,80,0,0.5)"
              size={BTN}
              onPress={() => { mobileInput.brake = true; mobileInput.backward = true; setActiveBrake(true); mobileInput.throttleY = -1; }}
              onRelease={() => { mobileInput.brake = false; mobileInput.backward = false; setActiveBrake(false); mobileInput.throttleY = 0; }}
            />
            {/* Section 6: Double-tap GAS = TURBO */}
            <GameButton
              label="GAS"
              emoji="▲"
              active={activeForward}
              color="rgba(0,230,118,0.5)"
              size={BTN}
              onPress={handleGasPress}
              onRelease={handleGasRelease}
            />
          </div>
        </div>
      )}

      {frozen && (
        <div style={{
          position: 'fixed',
          bottom: 'max(5rem, env(safe-area-inset-bottom, 0px) + 4rem)',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 250,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.52rem',
          color: 'rgba(255,255,255,0.2)',
          letterSpacing: '0.12em',
          pointerEvents: 'none',
        }}>
          CONTROLS PAUSED
        </div>
      )}

      <SettingsSheet
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        scheme={scheme}
        setScheme={setScheme}
      />
    </>
  )
}
