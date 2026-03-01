"use client"

import { useEffect, useState, useRef } from "react"
import { usePortfolioStore } from "@/store/usePortfolioStore"

export function LandscapeToast() {
    const isGameMode = usePortfolioStore(s => s.isGameMode)
    const [show, setShow] = useState(false)
    const [visible, setVisible] = useState(false)  // controls CSS opacity
    const [isMobile, setIsMobile] = useState(false)
    const [isPortrait, setIsPortrait] = useState(false)
    const dismissed = useRef(false)

    useEffect(() => {
        const mobile = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0
        setIsMobile(mobile)
    }, [])

    useEffect(() => {
        if (!isMobile) return
        const check = () => setIsPortrait(window.innerHeight > window.innerWidth)
        check()
        window.addEventListener('resize', check)
        window.addEventListener('orientationchange', check)
        return () => {
            window.removeEventListener('resize', check)
            window.removeEventListener('orientationchange', check)
        }
    }, [isMobile])

    // Show toast when entering game in portrait — only once per session
    useEffect(() => {
        if (!isMobile || !isGameMode || !isPortrait || dismissed.current) return

        setShow(true)
        // Fade in after mount
        const t1 = setTimeout(() => setVisible(true), 50)
        // Auto-dismiss after 5s
        const t2 = setTimeout(() => dismiss(), 5500)
        return () => { clearTimeout(t1); clearTimeout(t2) }
    }, [isGameMode, isPortrait, isMobile])

    // Hide toast if user rotates to landscape
    useEffect(() => {
        if (!isPortrait && show) dismiss()
    }, [isPortrait, show])

    const dismiss = () => {
        dismissed.current = true
        setVisible(false)
        setTimeout(() => setShow(false), 400)
    }

    if (!show) return null

    return (
        <div
            style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 500,
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.4s ease',
                pointerEvents: visible ? 'all' : 'none',
            }}
        >
            <div style={{
                background: 'rgba(3, 13, 7, 0.92)',
                border: '1px solid rgba(0,230,118,0.2)',
                borderRadius: '16px',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.85rem',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,230,118,0.08)',
                maxWidth: '260px',
                textAlign: 'center',
            }}>
                {/* Animated phone → landscape SVG */}
                <div style={{ animation: 'rotatePulse 2.4s ease-in-out infinite' }}>
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <rect x="15" y="6" width="18" height="30" rx="3"
                            stroke="#00e676" strokeWidth="1.5" fill="none" opacity="0.9" />
                        <circle cx="24" cy="32" r="1.5" fill="#00e676" opacity="0.5" />
                        <rect x="17" y="10" width="14" height="18" rx="1"
                            fill="#00e676" opacity="0.07" />
                        {/* Arrow arc */}
                        <path d="M 38 17 A 16 16 0 0 0 10 17"
                            stroke="#00e676" strokeWidth="1.5" strokeLinecap="round"
                            fill="none" opacity="0.5" />
                        <polyline points="7,13 10,17 13,14"
                            stroke="#00e676" strokeWidth="1.5" strokeLinecap="round"
                            strokeLinejoin="round" fill="none" opacity="0.5" />
                    </svg>
                </div>

                <div>
                    <p style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        color: '#e8f5e9',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        letterSpacing: '0.06em',
                        margin: '0 0 0.3rem',
                    }}>
                        Better in landscape
                    </p>
                    <p style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        color: 'rgba(255,255,255,0.35)',
                        fontSize: '0.6rem',
                        letterSpacing: '0.04em',
                        margin: 0,
                        lineHeight: 1.5,
                    }}>
                        Rotate your phone for the<br />full driving experience
                    </p>
                </div>

                {/* Dismiss */}
                <button
                    onClick={dismiss}
                    style={{
                        background: 'rgba(0,230,118,0.08)',
                        border: '1px solid rgba(0,230,118,0.2)',
                        borderRadius: '9999px',
                        padding: '0.35rem 1.1rem',
                        color: '#00e676',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.6rem',
                        fontWeight: 600,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        width: '100%',
                    }}
                >
                    Got it
                </button>
            </div>
        </div>
    )
}
