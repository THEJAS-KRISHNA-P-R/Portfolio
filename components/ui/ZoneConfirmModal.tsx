"use client"

import { useEffect, useCallback } from "react"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import PixelCard from "@/components/ui/PixelCard"
import "@/components/ui/PixelCard.css"

// Zone metadata — icon-free, color per zone
const ZONE_META: Record<string, { color: string; description: string }> = {
    'projects': { color: '#e94560', description: 'View my built projects' },
    'about': { color: '#4fc3f7', description: 'Learn about who I am' },
    'achievements': { color: '#f5a623', description: 'See my awards and wins' },
    'certifications': { color: '#9b59b6', description: 'My credentials and certifications' },
    'contact': { color: '#7ed321', description: 'Let\'s get in touch' },
}

const DEFAULT_META = { color: '#00e676', description: 'Explore this section' }

export function ZoneConfirmModal() {
    const pendingZone = usePortfolioStore(s => s.pendingZone)
    const setPendingZone = usePortfolioStore(s => s.setPendingZone)
    const setIsGameMode = usePortfolioStore(s => s.setIsGameMode)
    const setActiveZone = usePortfolioStore(s => s.setActiveZone)
    const setScrollTarget = usePortfolioStore(s => s.setScrollTarget)

    const isOpen = !!pendingZone

    const handleConfirm = useCallback(() => {
        if (!pendingZone) return
        setActiveZone(pendingZone) // Actually set the active zone
        setScrollTarget(pendingZone) // Tell the unmounted StandardPortfolio to scroll here
        setIsGameMode(false)       // Triggers transition out of 3D game
        setPendingZone(null)
    }, [pendingZone, setActiveZone, setIsGameMode, setPendingZone, setScrollTarget])

    const handleDismiss = useCallback(() => {
        setPendingZone(null)
    }, [setPendingZone])

    // Keyboard: Enter = confirm, Escape = dismiss
    useEffect(() => {
        if (!isOpen) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Enter') { e.preventDefault(); handleConfirm() }
            if (e.key === 'Escape') { e.preventDefault(); handleDismiss() }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [isOpen, handleConfirm, handleDismiss])

    if (!isOpen || !pendingZone) return null

    // Get display name — convert zone id to title case
    const displayName = pendingZone.charAt(0).toUpperCase() + pendingZone.slice(1)
    const meta = ZONE_META[pendingZone.toLowerCase()] ?? DEFAULT_META

    return (
        // Backdrop — zIndex 600: above Canvas(1), turbo catcher(238), controls(250), settings(470)
        <div
            onPointerDown={e => { if (e.target === e.currentTarget) handleDismiss() }}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                pointerEvents: 'auto',
            }}
        >
            {/* Modal card — fixed size, pointer events don't bubble to backdrop */}
            <div
                onPointerDown={e => e.stopPropagation()}
                style={{
                    position: 'relative',
                    width: '360px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: `0 0 40px ${meta.color}18, 0 20px 60px rgba(0,0,0,0.6)`,
                }}
            >
                {/* PixelCard fills the background — FIXED dimensions */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                    <PixelCard
                        variant="default"
                        colors={`${meta.color},${meta.color}88,#0a1a10`}
                        gap={7}
                        speed={30}
                        noFocus
                        className="pixel-card-transparent-bg"
                        style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: 0,
                            border: 'none',
                            background: 'transparent',
                        }}
                    >
                        {/* empty — pixels only, no children */}
                        <div />
                    </PixelCard>
                </div>

                {/* Dark overlay so text is readable over pixels */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 1,
                    background: 'linear-gradient(160deg, rgba(5,15,10,0.88) 0%, rgba(5,15,10,0.82) 100%)',
                    pointerEvents: 'none',
                }} />

                {/* Content — sits above pixel layer and overlay */}
                <div style={{
                    position: 'relative',
                    zIndex: 2,
                    padding: '2.25rem 2rem 1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.65rem',
                    fontFamily: "'JetBrains Mono', monospace",
                    pointerEvents: 'none', // Buttons row below overrides with pointerEvents:'auto'
                }}>

                    {/* Zone name */}
                    <h2 style={{
                        color: meta.color,
                        fontSize: '1.7rem',
                        fontWeight: 700,
                        margin: 0,
                        letterSpacing: '-0.02em',
                        textAlign: 'center',
                        textShadow: `0 0 24px ${meta.color}50`,
                    }}>
                        {displayName}
                    </h2>

                    {/* Description */}
                    <p style={{
                        color: 'rgba(255,255,255,0.45)',
                        fontSize: '0.78rem',
                        margin: 0,
                        textAlign: 'center',
                        letterSpacing: '0.04em',
                    }}>
                        {meta.description}
                    </p>

                    {/* Divider */}
                    <div style={{
                        width: '100%',
                        height: '1px',
                        background: `linear-gradient(to right, transparent, ${meta.color}30, transparent)`,
                        margin: '0.3rem 0',
                    }} />

                    {/* Buttons row — explicit pointerEvents so parent's 'none' doesn't block */}
                    <div style={{ display: 'flex', gap: '0.75rem', width: '100%', pointerEvents: 'auto' }}>

                        {/* Keep Driving — ghost */}
                        <button
                            onClick={handleDismiss}
                            style={{
                                flex: 1,
                                padding: '0.72rem 0',
                                borderRadius: '9999px',
                                border: '1px solid rgba(255,255,255,0.12)',
                                background: 'rgba(255,255,255,0.04)',
                                color: 'rgba(255,255,255,0.5)',
                                fontSize: '0.76rem',
                                fontWeight: 500,
                                fontFamily: 'inherit',
                                letterSpacing: '0.02em',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={e => {
                                const b = e.currentTarget
                                b.style.background = 'rgba(255,255,255,0.09)'
                                b.style.borderColor = 'rgba(255,255,255,0.25)'
                                b.style.color = 'rgba(255,255,255,0.8)'
                            }}
                            onMouseLeave={e => {
                                const b = e.currentTarget
                                b.style.background = 'rgba(255,255,255,0.04)'
                                b.style.borderColor = 'rgba(255,255,255,0.12)'
                                b.style.color = 'rgba(255,255,255,0.5)'
                            }}
                        >
                            Keep Driving
                        </button>

                        {/* Let's Go — PRIMARY, zone color, shimmer style */}
                        <button
                            onClick={handleConfirm}
                            className="zone-confirm-primary-btn"
                            data-color={meta.color}
                            style={{
                                flex: 1,
                                padding: '0.72rem 0',
                                borderRadius: '9999px',
                                border: `1px solid ${meta.color}70`,
                                background: `linear-gradient(135deg, ${meta.color}28, ${meta.color}14)`,
                                color: meta.color,
                                fontSize: '0.76rem',
                                fontWeight: 700,
                                fontFamily: 'inherit',
                                letterSpacing: '0.04em',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: `0 0 14px ${meta.color}22, inset 0 1px 0 ${meta.color}30`,
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                            onMouseEnter={e => {
                                const b = e.currentTarget
                                b.style.background = `linear-gradient(135deg, ${meta.color}44, ${meta.color}2a)`
                                b.style.boxShadow = `0 0 24px ${meta.color}44, inset 0 1px 0 ${meta.color}50`
                            }}
                            onMouseLeave={e => {
                                const b = e.currentTarget
                                b.style.background = `linear-gradient(135deg, ${meta.color}28, ${meta.color}14)`
                                b.style.boxShadow = `0 0 14px ${meta.color}22, inset 0 1px 0 ${meta.color}30`
                            }}
                        >
                            {/* Shimmer sweep */}
                            <span style={{
                                position: 'absolute',
                                backgroundImage: `linear-gradient(105deg, transparent 40%, ${meta.color}30 50%, transparent 60%)`,
                                backgroundSize: '200% 100%',
                                animation: 'btnShimmer 2.4s linear infinite',
                                borderRadius: 'inherit',
                                pointerEvents: 'none',
                            }} />
                            <span style={{ position: 'relative', zIndex: 1 }}>Let's Go →</span>
                        </button>

                    </div>

                    {/* Keyboard hint */}
                    <p style={{
                        color: 'rgba(255,255,255,0.18)',
                        fontSize: '0.62rem',
                        margin: '0.2rem 0 0',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                    }}>
                        Enter to confirm · Esc to dismiss
                    </p>

                </div>
            </div>
        </div>
    )
}
