"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { usePortfolioStore } from "@/store/usePortfolioStore"

// ─────────────────────────────────────────────────────────────────────────────
// Shared input object — Car.tsx reads this directly every frame.
// ─────────────────────────────────────────────────────────────────────────────
export interface MobileInput {
  forward: boolean
  brake: boolean
  backward: boolean
  left: boolean
  right: boolean
  boost: boolean   // drift
  turbo: boolean   // double-tap turbo
  steerX: number    // -1..1  analog steer
  throttleY: number    // -1..1  analog throttle
}

export const mobileInput: MobileInput = {
  forward: false, brake: false, backward: false,
  left: false, right: false,
  boost: false, turbo: false,
  steerX: 0, throttleY: 0,
}

// ─────────────────────────────────────────────────────────────────────────────
// BUTTON POSITIONS — research-based thumb zones
//
// Portrait natural grip: thumbs rest 15% inset, 18% from bottom.
// We push slightly inward from extreme corner so thumb doesn't clip edge.
//
// LEFT cluster:  left=4vw,  bottom=12vh  (left thumb natural zone)
// RIGHT cluster: right=4vw, bottom=12vh  (right thumb natural zone)
//
// Button size: 72px — 44px minimum per Apple HIG, 72px for gaming accuracy.
// Both clusters use IDENTICAL sizing — uniform feel.
// ─────────────────────────────────────────────────────────────────────────────
const BTN_SIZE = 72    // px base — uniform for ALL buttons
const BTN_GAP = '28px' // gap between buttons in a cluster

// ─────────────────────────────────────────────────────────────────────────────
// GameButton — frosted glass, uniform size, proper touch handling
// ─────────────────────────────────────────────────────────────────────────────
function GameButton({
  emoji, label, active, accentColor = '#00e676',
  size = BTN_SIZE, onPress, onRelease,
}: {
  emoji: string; label: string; active?: boolean
  accentColor?: string; size?: number
  onPress: () => void; onRelease: () => void
}) {
  const sz = `clamp(${Math.round(size * 0.75)}px, ${(size / 390 * 100).toFixed(1)}vw, ${size}px)`

  return (
    <div
      onPointerDown={e => { e.preventDefault(); e.stopPropagation(); onPress() }}
      onPointerUp={e => { e.preventDefault(); e.stopPropagation(); onRelease() }}
      onPointerLeave={e => { e.preventDefault(); onRelease() }}
      onPointerCancel={e => { e.preventDefault(); onRelease() }}
      style={{
        width: sz, height: sz,
        borderRadius: '18px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '3px',
        // Frosted glass — light and airy
        background: active
          ? `rgba(0,0,0,0.35)`
          : 'rgba(255,255,255,0.09)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: active
          ? `1.5px solid ${accentColor}90`
          : '1px solid rgba(255,255,255,0.16)',
        boxShadow: active
          ? `0 0 18px ${accentColor}28, 0 2px 10px rgba(0,0,0,0.35)`
          : '0 2px 10px rgba(0,0,0,0.22)',
        color: active ? accentColor : 'rgba(255,255,255,0.65)',
        transform: active ? 'scale(0.91)' : 'scale(1)',
        transition: 'transform 0.07s, background 0.07s, border-color 0.07s',
        userSelect: 'none', WebkitUserSelect: 'none',
        touchAction: 'none',
        WebkitTapHighlightColor: 'transparent',
        cursor: 'pointer',
      }}
    >
      <span style={{ fontSize: `clamp(1.2rem, ${(size * 0.33 / 390 * 100).toFixed(1)}vw, 1.55rem)`, lineHeight: 1 }}>
        {emoji}
      </span>
      <span style={{
        fontSize: 'clamp(0.34rem, 0.85vw, 0.4rem)',
        letterSpacing: '0.13em', textTransform: 'uppercase',
        opacity: 0.4, fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 700,
      }}>
        {label}
      </span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// VIRTUAL JOYSTICK — completely rewritten
//
// Design principles:
// 1. Omnidirectional — ANY direction of drag moves car accordingly.
//    Up/down → throttle, Left/right → steer. Diagonal = both.
// 2. Floating origin — stick spawns wherever finger touches, not fixed.
//    Prevents stretch reach. Natural for mobile gaming.
// 3. Dead zone 12% — kills thumb jitter.
// 4. Progressive curve — throttle uses x^1.4 curve (not linear, not cubic).
//    Linear feels sluggish; cubic is too sensitive at center.
// 5. Size: 70% of old size = 98px base (old was 140px).
// ─────────────────────────────────────────────────────────────────────────────
const JS_OUTER = 98    // px — outer ring diameter  (was 140, now 70%)
const JS_KNOB = 32    // px — knob diameter
const JS_TRAVEL = 42    // px — max knob travel from center
const JS_DEAD = 0.12  // normalized dead zone

function VirtualJoystick() {
  const outerRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  // Floating origin — set on pointer down
  const originRef = useRef({ x: 0, y: 0 })
  const pidRef = useRef<number>(-1)
  const activeRef = useRef(false)

  // Visible position of the joystick base (floats to touch point)
  const [basePos, setBasePos] = useState<{ x: number; y: number } | null>(null)

  const release = useCallback(() => {
    activeRef.current = false
    pidRef.current = -1
    mobileInput.forward = false
    mobileInput.brake = false
    mobileInput.backward = false
    mobileInput.left = false
    mobileInput.right = false
    mobileInput.steerX = 0
    mobileInput.throttleY = 0
    setBasePos(null)   // hide joystick base
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate(-50%, -50%)'
    }
  }, [])

  useEffect(() => {
    // Listen on the LEFT HALF of the screen only
    // (right half is for action buttons + drift)
    const zone = document.getElementById('joystick-zone')
    if (!zone) return

    const onDown = (e: PointerEvent) => {
      e.preventDefault()
      if (activeRef.current) return
      activeRef.current = true
      pidRef.current = e.pointerId
      zone.setPointerCapture(e.pointerId)

      // Floating origin — base appears where finger lands
      originRef.current = { x: e.clientX, y: e.clientY }
      setBasePos({ x: e.clientX, y: e.clientY })
    }

    const onMove = (e: PointerEvent) => {
      e.preventDefault()
      if (!activeRef.current || e.pointerId !== pidRef.current) return

      const dx = e.clientX - originRef.current.x
      const dy = e.clientY - originRef.current.y
      const dist = Math.hypot(dx, dy)

      // Clamp to JS_TRAVEL
      const scale = dist > JS_TRAVEL ? JS_TRAVEL / dist : 1
      const kx = dx * scale
      const ky = dy * scale

      // Normalize to -1..1
      const nx = kx / JS_TRAVEL   // negative = left, positive = right
      const ny = ky / JS_TRAVEL   // negative = forward (up drag), positive = back

      // Apply dead zone
      const ax = Math.abs(nx) > JS_DEAD ? nx : 0
      const ay = Math.abs(ny) > JS_DEAD ? ny : 0

      // Progressive curve on throttle (x^1.4 — responsive center, controlled peak)
      const throttle = ay === 0 ? 0 : -Math.sign(ay) * Math.pow(Math.abs(ay), 1.4)
      const steer = ax   // linear steer feels best for cars

      // Write to shared mobileInput
      mobileInput.steerX = steer
      mobileInput.throttleY = throttle
      mobileInput.forward = throttle > JS_DEAD
      mobileInput.brake = throttle < -JS_DEAD
      mobileInput.backward = throttle < -JS_DEAD
      mobileInput.left = steer < -JS_DEAD
      mobileInput.right = steer > JS_DEAD

      // Move knob visually
      if (knobRef.current) {
        knobRef.current.style.transform = `translate(calc(-50% + ${kx}px), calc(-50% + ${ky}px))`
      }
    }

    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== pidRef.current) return
      release()
    }

    zone.addEventListener('pointerdown', onDown, { passive: false })
    zone.addEventListener('pointermove', onMove, { passive: false })
    zone.addEventListener('pointerup', onUp)
    zone.addEventListener('pointercancel', onUp)

    return () => {
      zone.removeEventListener('pointerdown', onDown)
      zone.removeEventListener('pointermove', onMove)
      zone.removeEventListener('pointerup', onUp)
      zone.removeEventListener('pointercancel', onUp)
      release()
    }
  }, [release])

  return (
    <>
      {/* Invisible touch capture zone — LEFT 50% of screen, bottom 60% */}
      <div
        id="joystick-zone"
        style={{
          position: 'fixed',
          left: 0,
          bottom: 0,
          width: '50%',
          height: '60%',
          zIndex: 245,
          touchAction: 'none',
          pointerEvents: 'auto',
          // Debug: uncomment to see zone
          // background: 'rgba(0,255,0,0.05)',
        }}
      />

      {/* Floating joystick base — appears at touch point */}
      {basePos && (
        <div
          ref={outerRef}
          style={{
            position: 'fixed',
            left: basePos.x - JS_OUTER / 2,
            top: basePos.y - JS_OUTER / 2,
            width: JS_OUTER,
            height: JS_OUTER,
            zIndex: 246,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            border: '1.5px solid rgba(0,230,118,0.25)',
            backdropFilter: 'blur(4px)',
            pointerEvents: 'none',
          }}
        >
          {/* Crosshair */}
          <div style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', height: 1, background: 'rgba(0,255,136,0.15)', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', left: '50%', top: '10%', bottom: '10%', width: 1, background: 'rgba(0,255,136,0.15)', transform: 'translateX(-50%)', pointerEvents: 'none' }} />

          {/* Knob */}
          <div
            ref={knobRef}
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              width: JS_KNOB, height: JS_KNOB,
              borderRadius: '50%',
              background: 'rgba(0,230,118,0.18)',
              border: '2px solid rgba(0,230,118,0.65)',
              backdropFilter: 'blur(6px)',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 12px rgba(0,230,118,0.3)',
              pointerEvents: 'none',
              willChange: 'transform',
            }}
          />
        </div>
      )}
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS SHEET
// ─────────────────────────────────────────────────────────────────────────────
type ControlScheme = 'buttons' | 'joystick'

function SettingsSheet({
  visible, onClose, scheme, setScheme,
}: {
  visible: boolean; onClose: () => void
  scheme: ControlScheme; setScheme: (s: ControlScheme) => void
}) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 470,
        display: visible ? 'flex' : 'none',
        alignItems: 'flex-end',
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: visible ? 'blur(5px)' : 'none',
        WebkitBackdropFilter: visible ? 'blur(5px)' : 'none',
      }}
      onPointerDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        onPointerDown={e => e.stopPropagation()}
        style={{
          width: '100%',
          background: 'rgba(4,14,9,0.97)',
          border: '1px solid rgba(0,230,118,0.18)',
          borderRadius: '22px 22px 0 0',
          padding: 'clamp(1rem,4vw,1.6rem)',
          paddingBottom: 'max(1.4rem, env(safe-area-inset-bottom))',
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {/* Drag handle */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.14)', margin: '0 auto 1.1rem' }} />

        <div style={{ fontSize: 'clamp(0.46rem,1.3vw,0.55rem)', color: 'rgba(0,230,118,0.5)', letterSpacing: '0.22em', marginBottom: '0.9rem' }}>
          CONTROL SCHEME
        </div>

        {([
          { id: 'buttons', emoji: '🎮', label: 'BUTTONS', desc: 'D-pad steer left · Gas/Brake right' },
          { id: 'joystick', emoji: '🕹️', label: 'JOYSTICK', desc: 'Analog stick · Drift bottom-right' },
        ] as const).map(opt => (
          <button
            key={opt.id}
            onPointerDown={e => {
              e.stopPropagation()
              setScheme(opt.id)
              try { localStorage.setItem('mobileControlScheme', opt.id) } catch { }
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.8rem',
              width: '100%', padding: '0.7rem 1rem',
              marginBottom: '0.5rem', borderRadius: '13px',
              border: scheme === opt.id
                ? '1.5px solid rgba(0,230,118,0.55)'
                : '1.5px solid rgba(255,255,255,0.07)',
              background: scheme === opt.id
                ? 'rgba(0,230,118,0.1)' : 'rgba(255,255,255,0.03)',
              color: scheme === opt.id ? '#00e676' : 'rgba(255,255,255,0.5)',
              fontFamily: 'inherit',
              fontSize: 'clamp(0.58rem,1.7vw,0.68rem)',
              fontWeight: 700, letterSpacing: '0.1em',
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            <span style={{ fontSize: '1.4rem' }}>{opt.emoji}</span>
            <span style={{ flex: 1 }}>
              {opt.label}
              <span style={{ display: 'block', fontSize: 'clamp(0.42rem,1.1vw,0.5rem)', fontWeight: 400, opacity: 0.45, marginTop: '2px' }}>
                {opt.desc}
              </span>
            </span>
            {scheme === opt.id && <span style={{ color: '#00e676' }}>✓</span>}
          </button>
        ))}

        <button
          onPointerDown={e => { e.stopPropagation(); onClose() }}
          style={{
            marginTop: '0.6rem', width: '100%', padding: '0.65rem',
            borderRadius: '11px',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)',
            color: 'rgba(255,255,255,0.38)',
            fontFamily: 'inherit',
            fontSize: 'clamp(0.5rem,1.3vw,0.58rem)',
            letterSpacing: '0.12em', cursor: 'pointer',
          }}
        >
          CLOSE
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TOP-RIGHT HUD ROW
// Fullscreen → Drift → Settings  (right to left, all in one row)
//
// Fullscreen: uses requestFullscreen with iOS Safari fallback.
// Drift:      top-right area, thumb doesn't reach naturally — it's a
//             deliberate "reach" action. Long-press available too.
// Settings:   pill-shaped icon button, same row.
// ─────────────────────────────────────────────────────────────────────────────
function TopRightHUD({
  onSettingsOpen,
}: {
  onSettingsOpen: () => void
}) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Keep fullscreen icon in sync
  useEffect(() => {
    const update = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', update)
    document.addEventListener('webkitfullscreenchange', update)
    return () => {
      document.removeEventListener('fullscreenchange', update)
      document.removeEventListener('webkitfullscreenchange', update)
    }
  }, [])

  const toggleFullscreen = useCallback(() => {
    const el = document.documentElement as any
    const doc = document as any

    const isFs = !!(doc.fullscreenElement || doc.webkitFullscreenElement)

    if (isFs) {
      // Exit
      if (doc.exitFullscreen) doc.exitFullscreen()
      else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen()
    } else {
      // Enter — try standard first, then webkit for iOS Safari
      if (el.requestFullscreen) {
        el.requestFullscreen({ navigationUI: 'hide' }).catch(() => { })
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen()
      } else {
        // iOS Safari PWA fallback: scroll to hide browser chrome
        window.scrollTo(0, 1)
      }
    }
  }, [])

  const btnBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: '11px',
    background: 'rgba(4,14,9,0.78)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'rgba(255,255,255,0.55)',
    cursor: 'pointer',
    touchAction: 'none',
    WebkitTapHighlightColor: 'transparent',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
    width: 'clamp(36px, 9vw, 42px)',
    height: 'clamp(36px, 9vw, 42px)',
    transition: 'background 0.08s, border-color 0.08s',
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 'clamp(0.55rem, 1.8vh, 0.9rem)',
        right: 'clamp(0.5rem, 1.5vw, 0.8rem)',
        zIndex: 260,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 'clamp(5px, 1.2vw, 8px)',
      }}
    >
      {/* SETTINGS button — pill icon */}
      <button
        onPointerDown={e => { e.preventDefault(); e.stopPropagation(); onSettingsOpen() }}
        style={{
          ...btnBase,
          fontSize: 'clamp(0.88rem, 2.5vw, 1rem)',
        }}
        aria-label="Settings"
      >
        ⚙
      </button>

      {/* FULLSCREEN button */}
      <button
        onPointerDown={e => { e.preventDefault(); e.stopPropagation(); toggleFullscreen() }}
        style={{
          ...btnBase,
          fontSize: 'clamp(0.82rem, 2.3vw, 0.95rem)',
        }}
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      >
        <svg
          width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ position: 'absolute' }}
        >
          {isFullscreen ? (
            // Compress arrows
            <>
              <polyline points="4 14 10 14 10 20" />
              <polyline points="20 10 14 10 14 4" />
              <line x1="10" y1="14" x2="3" y2="21" />
              <line x1="21" y1="3" x2="14" y2="10" />
            </>
          ) : (
            // Expand arrows
            <>
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </>
          )}
        </svg>
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN MobileControls component
// ─────────────────────────────────────────────────────────────────────────────
export function MobileControls() {
  const [isTouch, setIsTouch] = useState(false)
  const [frozen, setFrozen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [scheme, setScheme] = useState<ControlScheme>(() => {
    if (typeof window === 'undefined') return 'buttons'
    try { return (localStorage.getItem('mobileControlScheme') as ControlScheme) ?? 'buttons' }
    catch { return 'buttons' }
  })

  // Button active states (visual only)
  const [activeLeft, setActiveLeft] = useState(false)
  const [activeRight, setActiveRight] = useState(false)
  const [activeForward, setActiveForward] = useState(false)
  const [activeBrake, setActiveBrake] = useState(false)
  const [activeDrift, setActiveDrift] = useState(false)

  // Double-tap turbo
  const lastTapRef = useRef<number>(0);
  const turboTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDoubleTap = useCallback((e: React.PointerEvent) => {
    // only fire on pointerdown (type=touch or mouse)
    const now = Date.now();
    const gap = now - lastTapRef.current;
    lastTapRef.current = now;

    if (gap > 30 && gap < 280) {
      // valid double tap
      if (turboTimeoutRef.current) clearTimeout(turboTimeoutRef.current);
      mobileInput.turbo = true;
      turboTimeoutRef.current = setTimeout(() => {
        mobileInput.turbo = false;
      }, 3000);
    }
  }, []);

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  useEffect(() => {
    const h = (e: Event) => setFrozen((e as CustomEvent).detail.frozen)
    window.addEventListener('game:freeze-controls', h)
    return () => window.removeEventListener('game:freeze-controls', h)
  }, [])

  const handleDriftPress = useCallback(() => { mobileInput.boost = true; setActiveDrift(true) }, [])
  const handleDriftRelease = useCallback(() => { mobileInput.boost = false; setActiveDrift(false) }, [])

  if (!isTouch) return null

  // ── Thumb zone position constants ──────────────────────────────────────────
  // LEFT cluster:  left edge 4vw, bottom 12vh above safe area
  // RIGHT cluster: right edge 4vw, bottom 12vh above safe area
  const CLUSTER_BOTTOM = 'max(calc(env(safe-area-inset-bottom) + 5.5vh), 3.5rem)'
  const CLUSTER_SIDE = 'clamp(1.4rem, 7vw, 2.5rem)'

  return (
    <>
      {/* ── Top-right HUD: Settings + Fullscreen ───────────────── */}
      <TopRightHUD
        onSettingsOpen={() => setSettingsOpen(true)}
      />

      {/* TURBO SQUARE — hidden in joystick mode, visible in buttons mode only */}
      {scheme !== 'joystick' && (
        <div
          onPointerDown={(e) => { e.stopPropagation(); mobileInput.boost = true; }}
          onPointerUp={(e) => { e.stopPropagation(); mobileInput.boost = false; }}
          onPointerLeave={(e) => { e.stopPropagation(); mobileInput.boost = false; }}
          onPointerCancel={(e) => { e.stopPropagation(); mobileInput.boost = false; }}
          style={{
            position: 'fixed',
            top: 'calc(clamp(0.55rem, 1.8vh, 0.9rem) + clamp(36px, 9vw, 42px) + 0.5rem)',
            right: 'clamp(4.4rem, 7vw, 2.5rem)',
            width: 'clamp(54px, 14vw, 68px)',
            height: 'clamp(54px, 14vw, 68px)',
            borderRadius: '10px',
            background: 'rgba(30,30,30,0.72)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.13)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            touchAction: 'none',
            userSelect: 'none',
            zIndex: 260,
          }}
        >
          💨
        </div>
      )}

      {/* ── Double-tap anywhere (below buttons) = turbo ─────────────────── */}
      <div
        onPointerDown={handleDoubleTap}
        style={{
          position: 'fixed', inset: 0, zIndex: 238,
          pointerEvents: 'auto',
          background: 'transparent',
          touchAction: 'none',
        }}
      />

      {/* ── BUTTONS MODE ─────────────────────────────────────────────────── */}
      {!frozen && scheme === 'buttons' && (
        <>
          {/* LEFT: Steer cluster */}
          <div style={{
            position: 'fixed',
            bottom: `max(calc(env(safe-area-inset-bottom) + 24vh), 5rem)`,
            left: `calc(${CLUSTER_SIDE} + 4rem)`,
            zIndex: 250,
            display: 'flex',
            flexDirection: 'row',
            gap: BTN_GAP,
            pointerEvents: 'auto',
          }}>
            <GameButton
              emoji="◀" label="LEFT"
              active={activeLeft} accentColor="#00bfff" size={BTN_SIZE}
              onPress={() => { mobileInput.left = true; mobileInput.steerX = -1; setActiveLeft(true) }}
              onRelease={() => { mobileInput.left = false; mobileInput.steerX = 0; setActiveLeft(false) }}
            />
            <GameButton
              emoji="▶" label="RIGHT"
              active={activeRight} accentColor="#00bfff" size={BTN_SIZE}
              onPress={() => { mobileInput.right = true; mobileInput.steerX = 1; setActiveRight(true) }}
              onRelease={() => { mobileInput.right = false; mobileInput.steerX = 0; setActiveRight(false) }}
            />
          </div>

          {/* RIGHT: Brake + Gas cluster */}
          <div style={{
            position: 'fixed',
            bottom: `max(calc(env(safe-area-inset-bottom) + 24vh), 5rem)`,
            right: `calc(${CLUSTER_SIDE} + 4rem)`,
            zIndex: 250,
            display: 'flex',
            flexDirection: 'row',
            gap: BTN_GAP,
            pointerEvents: 'auto',
          }}>
            <GameButton
              emoji="▼" label="BRAKE"
              active={activeBrake} accentColor="#ff5522" size={BTN_SIZE}
              onPress={() => { mobileInput.brake = true; mobileInput.backward = true; mobileInput.throttleY = -1; setActiveBrake(true) }}
              onRelease={() => { mobileInput.brake = false; mobileInput.backward = false; mobileInput.throttleY = 0; setActiveBrake(false) }}
            />
            <GameButton
              emoji="▲" label="GAS"
              active={activeForward} accentColor="#00e676" size={BTN_SIZE}
              onPress={() => { mobileInput.forward = true; mobileInput.throttleY = 1; setActiveForward(true) }}
              onRelease={() => { mobileInput.forward = false; mobileInput.throttleY = 0; setActiveForward(false) }}
            />
          </div>
        </>
      )}

      {/* ── JOYSTICK MODE ────────────────────────────────────────────────── */}
      {!frozen && scheme === 'joystick' && (
        <>
          <VirtualJoystick />

          {/* Joystick mode: thumb drift button */}
          {/* Fix 3: Joystick mode: move turbo button inward (away from speedometer) */}
          {scheme === 'joystick' && !frozen && (
            <div
              onPointerDown={(e) => { e.stopPropagation(); mobileInput.boost = true; setActiveDrift(true); }}
              onPointerUp={(e) => { e.stopPropagation(); mobileInput.boost = false; setActiveDrift(false); }}
              onPointerLeave={(e) => { e.stopPropagation(); mobileInput.boost = false; setActiveDrift(false); }}
              onPointerCancel={(e) => { e.stopPropagation(); mobileInput.boost = false; setActiveDrift(false); }}
              style={{
                position: 'fixed',
                right: 'clamp(3.5rem, 10vw, 5rem)',
                bottom: `max(calc(env(safe-area-inset-bottom) + 18vh), 7rem)`,
                width: 'clamp(54px, 18.5vw, 72px)',
                height: 'clamp(54px, 18.5vw, 72px)',
                borderRadius: '16px',
                background: activeDrift ? 'rgba(255,165,0,0.3)' : 'rgba(30,30,30,0.72)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                border: activeDrift ? '1.5px solid rgba(255,165,0,0.7)' : '1px solid rgba(255,165,0,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem',
                touchAction: 'none', userSelect: 'none',
                zIndex: 250,
                transition: 'background 0.08s, transform 0.08s',
                transform: activeDrift ? 'scale(0.95)' : 'scale(1)',
              }}
            >💨</div>
          )}
        </>
      )}

      {/* ── Controls frozen overlay ──────────────────────────────────────── */}
      {frozen && (
        <div style={{
          position: 'fixed',
          bottom: 'max(5.5rem, calc(env(safe-area-inset-bottom) + 4.5rem))',
          left: '50%', transform: 'translateX(-50%)',
          zIndex: 250, pointerEvents: 'none',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 'clamp(0.42rem, 1.1vw, 0.5rem)',
          color: 'rgba(255,255,255,0.22)',
          letterSpacing: '0.14em',
        }}>
          CONTROLS PAUSED
        </div>
      )}

      {/* ── Settings sheet ───────────────────────────────────────────────── */}
      <SettingsSheet
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        scheme={scheme}
        setScheme={setScheme}
      />
    </>
  )
}
