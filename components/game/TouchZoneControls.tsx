"use client"

import { useEffect, useRef, useState } from "react"
import { usePortfolioStore } from "@/store/usePortfolioStore"

// Publishes touch state to a module-level object read by Car.tsx
// This avoids React re-render overhead on every touch event
export const touchState = {
    left: false,
    right: false,
    brake: false,
    boost: false,
}

export function TouchZoneControls() {
    const isGameMode = usePortfolioStore(s => s.isGameMode)
    const [showHint, setShowHint] = useState(false)
    const [hintOpacity, setHintOpacity] = useState(0)
    const hintShown = useRef(false)
    const doubleTapTimer = useRef<NodeJS.Timeout | null>(null)
    const lastTapTime = useRef(0)
    const activeTouches = useRef<Map<number, 'left' | 'right' | 'brake'>>(new Map())

    // Only render on touch devices
    const [isTouch, setIsTouch] = useState(false)
    useEffect(() => {
        setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }, [])

    // Show zone hints on first interaction
    const showTouchHint = () => {
        if (hintShown.current) return
        hintShown.current = true
        setShowHint(true)
        setHintOpacity(0.35)
        setTimeout(() => setHintOpacity(0), 1800)
        setTimeout(() => setShowHint(false), 2600)
    }

    useEffect(() => {
        if (!isTouch || !isGameMode) return

        const getZone = (touch: Touch): 'left' | 'right' | 'brake' | null => {
            const x = touch.clientX
            const y = touch.clientY
            const w = window.innerWidth
            const h = window.innerHeight

            // Bottom 15% of screen = brake zone
            if (y > h * 0.85) return 'brake'
            // Left 45% = steer left
            if (x < w * 0.45) return 'left'
            // Right 45% = steer right
            if (x > w * 0.55) return 'right'
            // Middle 10% = no steer (dead zone prevents accidental turns)
            return null
        }

        const recalcState = () => {
            touchState.left = false
            touchState.right = false
            touchState.brake = false
            activeTouches.current.forEach(zone => {
                if (zone === 'left') touchState.left = true
                if (zone === 'right') touchState.right = true
                if (zone === 'brake') touchState.brake = true
            })
        }

        const onTouchStart = (e: TouchEvent) => {
            e.preventDefault()
            showTouchHint()

            // Double-tap detection for boost (any finger, anywhere)
            const now = Date.now()
            if (now - lastTapTime.current < 300) {
                touchState.boost = true
                if (doubleTapTimer.current) clearTimeout(doubleTapTimer.current)
                doubleTapTimer.current = setTimeout(() => {
                    touchState.boost = false
                }, 100)
            }
            lastTapTime.current = now

            Array.from(e.changedTouches).forEach(touch => {
                const zone = getZone(touch)
                if (zone) activeTouches.current.set(touch.identifier, zone)
            })
            recalcState()
        }

        const onTouchMove = (e: TouchEvent) => {
            e.preventDefault()
            // Re-evaluate zone as finger slides across screen
            Array.from(e.changedTouches).forEach(touch => {
                const zone = getZone(touch)
                if (zone) {
                    activeTouches.current.set(touch.identifier, zone)
                } else {
                    activeTouches.current.delete(touch.identifier)
                }
            })
            recalcState()
        }

        const onTouchEnd = (e: TouchEvent) => {
            e.preventDefault()
            Array.from(e.changedTouches).forEach(touch => {
                activeTouches.current.delete(touch.identifier)
            })
            recalcState()
        }

        const onTouchCancel = (e: TouchEvent) => {
            activeTouches.current.clear()
            touchState.left = false
            touchState.right = false
            touchState.brake = false
        }

        // Attach to document so touches anywhere on screen are captured
        document.addEventListener('touchstart', onTouchStart, { passive: false })
        document.addEventListener('touchmove', onTouchMove, { passive: false })
        document.addEventListener('touchend', onTouchEnd, { passive: false })
        document.addEventListener('touchcancel', onTouchCancel, { passive: false })

        return () => {
            document.removeEventListener('touchstart', onTouchStart)
            document.removeEventListener('touchmove', onTouchMove)
            document.removeEventListener('touchend', onTouchEnd)
            document.removeEventListener('touchcancel', onTouchCancel)
            // Clear all touch state on unmount
            touchState.left = touchState.right = touchState.brake = touchState.boost = false
        }
    }, [isTouch, isGameMode])

    if (!isTouch || !isGameMode) return null

    return (
        <>
            {/* Visual zone hint — fades in on first touch, then disappears */}
            {showHint && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    pointerEvents: 'none',
                    zIndex: 40,
                    display: 'flex',
                    transition: 'opacity 0.8s ease',
                    opacity: hintOpacity,
                }}>
                    {/* Left zone hint */}
                    <div style={{
                        flex: '0 0 45%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,230,118,0.06)',
                        borderRight: '1px solid rgba(0,230,118,0.15)',
                    }}>
                        <span style={{
                            fontSize: '2.5rem',
                            color: 'rgba(0,230,118,0.5)',
                            fontFamily: 'sans-serif',
                        }}>◀</span>
                    </div>
                    {/* Dead zone center */}
                    <div style={{ flex: '0 0 10%' }} />
                    {/* Right zone hint */}
                    <div style={{
                        flex: '0 0 45%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,230,118,0.06)',
                        borderLeft: '1px solid rgba(0,230,118,0.15)',
                    }}>
                        <span style={{
                            fontSize: '2.5rem',
                            color: 'rgba(0,230,118,0.5)',
                            fontFamily: 'sans-serif',
                        }}>▶</span>
                    </div>
                </div>
            )}

            {/* Always-visible hint text at very bottom */}
            <div style={{
                position: 'fixed',
                bottom: '0.4rem',
                left: '50%',
                transform: 'translateX(-50%)',
                pointerEvents: 'none',
                zIndex: 41,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.55rem',
                color: 'rgba(255,255,255,0.18)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
            }}>
                Tap left / right to steer  ·  Double-tap to boost
            </div>
        </>
    )
}
