"use client"

import { useEffect, useState } from "react"
import { usePortfolioStore } from "@/store/usePortfolioStore"

// ── Module-level input state ─────────────────────────────────────────────────
// Read directly by Car.tsx in useBeforePhysicsStep — no React re-renders
export const mobileInput = {
    steerX: 0,   // -1 (full left) to +1 (full right)
    throttleY: 0,   // -1 (full brake/reverse) to +1 (full forward)
    boost: false,
    // Derived digital booleans for systems that use them
    get left() { return this.steerX < -0.15 },
    get right() { return this.steerX > 0.15 },
    get forward() { return this.throttleY > 0.15 },
    get backward() { return this.throttleY < -0.15 },
}

// ── Tuning ───────────────────────────────────────────────────────────────────
const DEAD_ZONE = 8     // px — movement under this is ignored (prevents micro-drift)
const FULL_RANGE = 55    // px — drag this far from anchor = maximum input (1.0)
const STEER_SCALE = 1.0   // multiply steer sensitivity
const THROTTLE_SCALE = 1.0   // multiply throttle sensitivity

export function MobileControls() {
    const isGameMode = usePortfolioStore(s => s.isGameMode)
    const [isTouch, setIsTouch] = useState(false)
    const [showHint, setShowHint] = useState(true)

    // Detect touch device once on client
    useEffect(() => {
        const hasTouch = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0
        setIsTouch(hasTouch)
    }, [])

    useEffect(() => {
        if (!isTouch || !isGameMode) return

        // ── Single-finger tracking ───────────────────────────────────────────────
        // We only track ONE specific touch identifier (the first one down)
        // A second finger is reserved for camera and never interferes with driving

        let driveTouchId: number | null = null
        let anchorX = 0
        let anchorY = 0
        let lastTapTime = 0

        const onTouchStart = (e: TouchEvent) => {
            const now = performance.now();
            if (now - lastTapTime < 300) {
                mobileInput.boost = true;
            } else {
                mobileInput.boost = false;
            }
            lastTapTime = now;
            // Only track the FIRST finger — second+ = camera
            if (driveTouchId !== null) return
            if (e.touches.length > 1) return  // already multi-touch, skip

            const touch = e.changedTouches[0]
            driveTouchId = touch.identifier
            anchorX = touch.clientX
            anchorY = touch.clientY

            // Immediately zero out input (fresh start each touch)
            mobileInput.steerX = 0
            mobileInput.throttleY = 0

            // Hide hint on first real touch
            setShowHint(false)
        }

        const onTouchMove = (e: TouchEvent) => {
            if (driveTouchId === null) return

            // CRITICAL: Prevent browser scroll/pan to avoid severe mobile lag
            if (e.cancelable) e.preventDefault()

            // Find our tracked finger
            let activeTouch: Touch | null = null
            for (let i = 0; i < e.touches.length; i++) {
                if (e.touches[i].identifier === driveTouchId) {
                    activeTouch = e.touches[i]
                    break
                }
            }
            if (!activeTouch) return

            const dx = activeTouch.clientX - anchorX
            const dy = activeTouch.clientY - anchorY   // positive = finger moved DOWN

            // Dead zone — ignore tiny trembles
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < DEAD_ZONE) {
                mobileInput.steerX = 0
                mobileInput.throttleY = 0
                return
            }

            // Normalize to [-1, 1] clamped at FULL_RANGE pixels
            // Steer: dx positive = finger right = steer right
            // Throttle: dy NEGATIVE = finger moved UP = forward (screen Y is inverted)
            mobileInput.steerX = Math.max(-1, Math.min(1, (dx / FULL_RANGE) * STEER_SCALE))
            mobileInput.throttleY = Math.max(-1, Math.min(1, (-dy / FULL_RANGE) * THROTTLE_SCALE))
        }

        const onTouchEnd = (e: TouchEvent) => {
            // Check if our tracked finger lifted
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === driveTouchId) {
                    driveTouchId = null
                    anchorX = 0
                    anchorY = 0
                    mobileInput.steerX = 0
                    mobileInput.throttleY = 0
                    break
                }
            }
        }

        const onTouchCancel = () => {
            driveTouchId = null
            mobileInput.steerX = 0
            mobileInput.throttleY = 0
            mobileInput.boost = false
        }

        // Attach to document — catches touches anywhere on screen
        // passive: false allows e.preventDefault() to block scroll
        document.addEventListener('touchstart', onTouchStart, { passive: false })
        document.addEventListener('touchmove', onTouchMove, { passive: false })
        document.addEventListener('touchend', onTouchEnd, { passive: false })
        document.addEventListener('touchcancel', onTouchCancel, { passive: true })

        return () => {
            document.removeEventListener('touchstart', onTouchStart)
            document.removeEventListener('touchmove', onTouchMove)
            document.removeEventListener('touchend', onTouchEnd)
            document.removeEventListener('touchcancel', onTouchCancel)
            mobileInput.steerX = 0
            mobileInput.throttleY = 0
            mobileInput.boost = false
        }
    }, [isTouch, isGameMode])

    if (!isTouch || !isGameMode) return null

    return (
        <>
            {showHint && <TouchHint />}
        </>
    )
}

function TouchHint() {
    const [opacity, setOpacity] = useState(1)
    const [gone, setGone] = useState(false)

    useEffect(() => {
        const t1 = setTimeout(() => setOpacity(0), 2500)
        const t2 = setTimeout(() => setGone(true), 3800)
        return () => { clearTimeout(t1); clearTimeout(t2) }
    }, [])

    if (gone) return null

    return (
        <div style={{
            position: 'fixed',
            bottom: '40%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 49,
            opacity,
            transition: 'opacity 1.3s ease',
            pointerEvents: 'none',
            textAlign: 'center',
        }}>
            <div style={{
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(6px)',
                borderRadius: '10px',
                padding: '0.5rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
            }}>
                <p style={{
                    color: 'rgba(0,230,118,0.7)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.62rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    margin: 0,
                }}>
                    Drag to drive · Double-tap for turbo
                </p>
            </div>
        </div>
    )
}
