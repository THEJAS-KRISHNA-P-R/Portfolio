'use client'

import { useEffect, useState } from 'react'
import { useQualityStore } from '@/store/useQualityStore'
import { usePortfolioStore } from '@/store/usePortfolioStore'
import { generateProfile, type QualityTier } from '@/lib/deviceTier'

// ── Renderer info (read-only, gathered once on open) ──────────────────
function getRendererInfo() {
    try {
        const canvas = document.createElement('canvas')
        const gl = (canvas.getContext('webgl2') ||
            canvas.getContext('webgl') ||
            canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
        if (!gl) return { renderer: 'Unknown', vendor: 'Unknown' }
        const ext = gl.getExtension('WEBGL_debug_renderer_info')
        return {
            renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'Hidden by browser',
            vendor: ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : 'Hidden by browser',
        }
    } catch { return { renderer: 'Unavailable', vendor: 'Unavailable' } }
}

type Tab = 'controls' | 'cheatcodes' | 'renderer' | 'settings'

interface InfoModalProps {
    open: boolean
    onClose: () => void
    isMobile: boolean
    controlScheme?: 'buttons' | 'joystick'   // current mobile scheme
    onSchemeChange?: (s: 'buttons' | 'joystick') => void
}

export function InfoModal({
    open, onClose, isMobile, controlScheme, onSchemeChange
}: InfoModalProps) {
    const [tab, setTab] = useState<Tab>('controls')
    const [rendererInfo, setRendererInfo] = useState<{ renderer: string; vendor: string } | null>(null)
    const profile = useQualityStore(s => s.profile)

    // Gather renderer info once when modal first opens
    useEffect(() => {
        if (open && !rendererInfo) {
            setRendererInfo(getRendererInfo())
        }
    }, [open, rendererInfo])

    // Close on Escape
    useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open, onClose])

    // Reset to controls tab when closed
    useEffect(() => { if (!open) setTab('controls') }, [open])

    if (!open) return null

    const TABS: { id: Tab; label: string }[] = [
        { id: 'controls', label: 'Controls' },
        { id: 'cheatcodes', label: 'Secrets' },
        { id: 'renderer', label: 'Renderer' },
        { id: 'settings', label: 'Settings' },
    ]

    return (
        // ── Overlay ──────────────────────────────────────────────────────
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 700,
                background: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'min(1rem, 3vw)',
                fontFamily: "'JetBrains Mono', monospace",
                pointerEvents: 'auto',
            }}
        >
            {/* ── Card ───────────────────────────────────────────────────── */}
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: 'rgba(4, 12, 8, 0.97)',
                    border: '1px solid rgba(0,230,118,0.2)',
                    borderRadius: '16px',
                    width: '100%',
                    maxWidth: '480px',
                    maxHeight: 'min(90vh, 680px)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 0 60px rgba(0,230,118,0.08), 0 24px 48px rgba(0,0,0,0.6)',
                }}
            >
                {/* ── Header ─────────────────────────────────────────────── */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.1rem 1.3rem 0.8rem',
                    borderBottom: '1px solid rgba(0,230,118,0.08)',
                    flexShrink: 0,
                }}>
                    <div>
                        <div style={{ color: '#00e676', fontSize: '0.65rem', letterSpacing: '0.18em', marginBottom: '0.1rem' }}>
                            PORTFOLIO WORLD
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                            Info & Controls
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: 'clamp(30px, 9vw, 34px)',
                            height: 'clamp(30px, 9vw, 34px)',
                            borderRadius: '50%',
                            background: 'rgba(255, 82, 82, 0.1)',
                            border: '1px solid rgba(255, 82, 82, 0.4)',
                            color: '#ff5252',
                            fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = '#ff5252'
                            e.currentTarget.style.background = 'rgba(255, 82, 82, 0.2)'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'rgba(255, 82, 82, 0.4)'
                            e.currentTarget.style.background = 'rgba(255, 82, 82, 0.1)'
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* ── Tab pills ──────────────────────────────────────────── */}
                <div style={{
                    display: 'flex',
                    gap: '0.35rem',
                    padding: '0.7rem 1.1rem',
                    borderBottom: '1px solid rgba(0,230,118,0.08)',
                    flexShrink: 0,
                    overflowX: 'auto',
                }}>
                    {TABS.map(t => (
                        <button
                            key={t.id}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setTab(t.id);
                            }}
                            style={{
                                padding: '0.35rem 0.85rem',
                                borderRadius: '999px',
                                background: tab === t.id ? 'rgba(0,230,118,0.15)' : 'transparent',
                                border: `1px solid ${tab === t.id ? 'rgba(0,230,118,0.5)' : 'rgba(255,255,255,0.08)'}`,
                                color: tab === t.id ? '#00e676' : 'rgba(255,255,255,0.4)',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 'clamp(0.55rem, 1.8vw, 0.65rem)',
                                letterSpacing: '0.08em',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.15s',
                                flexShrink: 0,
                            }}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* ── Tab content ────────────────────────────────────────── */}
                <div style={{ overflowY: 'auto', padding: '1.1rem 1.3rem', flex: 1 }}>
                    {tab === 'controls' && <ControlsTab isMobile={isMobile} controlScheme={controlScheme} />}
                    {tab === 'cheatcodes' && <SecretsTab />}
                    {tab === 'renderer' && <RendererTab rendererInfo={rendererInfo} />}
                    {tab === 'settings' && <SettingsTab isMobile={isMobile} controlScheme={controlScheme} onSchemeChange={onSchemeChange} />}
                </div>
            </div>
        </div>
    )
}

// ────────────────────────────────────────────────────────────────────────
// TAB COMPONENTS
// ────────────────────────────────────────────────────────────────────────

function Key({ children }: { children: React.ReactNode }) {
    return (
        <kbd style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '28px',
            padding: '0.15rem 0.45rem',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderBottom: '2px solid rgba(255,255,255,0.1)',
            borderRadius: '5px',
            color: 'rgba(255,255,255,0.75)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.62rem',
            letterSpacing: '0.04em',
            lineHeight: 1,
        }}>
            {children}
        </kbd>
    )
}

function CtrlRow({ keys, label }: { keys: React.ReactNode; label: string }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.55rem 0',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
            <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {keys}
            </div>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', textAlign: 'right', marginLeft: '1rem' }}>
                {label}
            </span>
        </div>
    )
}

function SectionHead({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            color: 'rgba(0,230,118,0.6)',
            fontSize: '0.55rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginBottom: '0.3rem',
            marginTop: '1rem',
        }}>
            {children}
        </div>
    )
}

function ControlsTab({ isMobile, controlScheme }: {
    isMobile: boolean
    controlScheme?: 'buttons' | 'joystick'
}) {
    if (!isMobile) {
        return (
            <div>
                <SectionHead>Movement</SectionHead>
                <CtrlRow keys={<><Key>W</Key><Key>A</Key><Key>S</Key><Key>D</Key></>} label="Drive" />
                <CtrlRow keys={<><Key>↑</Key><Key>←</Key><Key>↓</Key><Key>→</Key></>} label="Drive (arrow keys)" />
                <CtrlRow keys={<Key>Space</Key>} label="Drift" />
                <CtrlRow keys={<><Key>T</Key><span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.6rem' }}>or</span><Key>Shift</Key></>} label="Turbo boost" />

                <SectionHead>World</SectionHead>
                <CtrlRow keys={<Key>R</Key>} label="Respawn car" />
                <CtrlRow keys={<><Key>Mouse</Key><span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.6rem' }}>drag</span></>} label="Rotate camera" />

                <SectionHead>Mini-games</SectionHead>
                <CtrlRow keys={<span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.65rem' }}>🎳 NW corner</span>} label="Bowling" />
                <CtrlRow keys={<span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.65rem' }}>⚽ SE corner</span>} label="Football" />
                <CtrlRow keys={<span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.65rem' }}>🏁 SW corner</span>} label="Maze" />

                <SectionHead>Zones</SectionHead>
                <CtrlRow
                    keys={<span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.65rem' }}>Drive into rings</span>}
                    label="Open portfolio sections"
                />
            </div>
        )
    }

    return (
        <div>
            {controlScheme === 'joystick' ? (
                <>
                    <SectionHead>Joystick (current)</SectionHead>
                    <CtrlRow
                        keys={<span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.65rem' }}>Left thumb · drag</span>}
                        label="Steer & drive"
                    />
                    <CtrlRow
                        keys={<span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.65rem' }}>Double-tap screen</span>}
                        label="Turbo boost"
                    />
                </>
            ) : (
                <>
                    <SectionHead>Button layout (current)</SectionHead>
                    <CtrlRow
                        keys={<span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.65rem' }}>◀ ▶ left cluster</span>}
                        label="Steer"
                    />
                    <CtrlRow
                        keys={<span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.65rem' }}>▼ ▲ right cluster</span>}
                        label="Forward / Reverse"
                    />
                    <CtrlRow
                        keys={<span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.65rem' }}>Double-tap screen</span>}
                        label="Turbo boost"
                    />
                </>
            )}

            <SectionHead>Common</SectionHead>
            <CtrlRow
                keys={<span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.65rem' }}>💨 button (top right)</span>}
                label="Drift mode"
            />
            <CtrlRow
                keys={<span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.65rem' }}>⛶ button (top right)</span>}
                label="Fullscreen"
            />

            <SectionHead>Mini-games</SectionHead>
            <CtrlRow keys={<span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.65rem' }}>🎳 NW corner</span>} label="Bowling" />
            <CtrlRow keys={<span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.65rem' }}>⚽ SE corner</span>} label="Football" />
            <CtrlRow keys={<span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.65rem' }}>🏁 SW corner</span>} label="Maze" />

            <SectionHead>Zones</SectionHead>
            <CtrlRow
                keys={<span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.65rem' }}>Drive into rings</span>}
                label="Open portfolio sections"
            />
        </div>
    )
}

function SecretsTab() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{
                background: 'rgba(0,230,118,0.05)',
                border: '1px solid rgba(0,230,118,0.15)',
                borderRadius: '10px',
                padding: '1rem 1.1rem',
            }}>
                <div style={{ color: '#00e676', fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                    🔐 Cheat Codes
                </div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', lineHeight: 1.7, margin: 0 }}>
                    There are hidden cheat codes in this world. They're typed on your keyboard — no hints given.
                    If you're curious, explore. If you find one, you'll know.
                </p>
            </div>

            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                <div style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.6rem', letterSpacing: '0.15em' }}>
                    KNOWN CODES
                </div>
                <div style={{ color: 'rgba(0,230,118,0.4)', fontSize: '2rem', fontWeight: 700, lineHeight: 1.2 }}>
                    3
                </div>
                <div style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.55rem', letterSpacing: '0.1em' }}>
                    to be discovered
                </div>
            </div>

            <div style={{
                borderLeft: '2px solid rgba(0,230,118,0.2)',
                paddingLeft: '0.9rem',
            }}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.62rem', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
                    "The codes are themed around the car. Think about what a driver would want."
                </p>
            </div>
        </div>
    )
}

function RendererTab({ rendererInfo }: {
    rendererInfo: { renderer: string; vendor: string } | null
}) {
    const profile = useQualityStore(s => s.profile)
    const detectedProfile = useQualityStore(s => s.detectedProfile)
    const setProfile = useQualityStore(s => s.setProfile)

    const fps = typeof window !== 'undefined' ? (window as any).__fps ?? null : null

    function InfoRow({ label, value, accent, warning }: { label: string; value: string; accent?: boolean; warning?: boolean }) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: '0.4rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                gap: '1rem',
            }}>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.6rem', flexShrink: 0 }}>{label}</span>
                <span style={{
                    color: warning ? '#ff5252' : accent ? '#00e676' : 'rgba(255,255,255,0.7)',
                    fontSize: '0.62rem',
                    textAlign: 'right',
                    wordBreak: 'break-word',
                    fontWeight: (warning || accent) ? 600 : 400,
                }}>{value}{warning && ' ⚠️'}</span>
            </div>
        )
    }

    const tierLabel: Record<string, string> = {
        low: 'Low',
        mid: 'Mid',
        high: 'High',
    }

    const tierWeight: Record<QualityTier, number> = {
        low: 0,
        mid: 1,
        high: 2,
    }

    const currentTierWeight = profile ? tierWeight[profile.tier] : 1
    const detectedTierWeight = detectedProfile ? tierWeight[detectedProfile.tier] : 1
    const isAggressive = currentTierWeight > detectedTierWeight

    const handleTierChange = (t: QualityTier) => {
        if (!profile) return
        const newProfile = generateProfile(t, profile.isMobile)
        setProfile(newProfile)
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div>
                <SectionHead>GPU Performance</SectionHead>
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.8rem' }}>
                    {(['low', 'mid', 'high'] as const).map(t => {
                        const active = profile?.tier === t
                        const overtiered = tierWeight[t] > detectedTierWeight
                        return (
                            <button
                                key={t}
                                onClick={() => handleTierChange(t)}
                                style={{
                                    flex: 1,
                                    padding: '0.5rem 0.3rem',
                                    background: active ? 'rgba(0,230,118,0.15)' : 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${active ? '#00e676' : 'rgba(255,255,255,0.1)'}`,
                                    borderRadius: '6px',
                                    color: active ? '#00e676' : 'rgba(255,255,255,0.4)',
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: '0.55rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.05em',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {tierLabel[t].toUpperCase()}
                                {overtiered && !active && (
                                    <div style={{
                                        position: 'absolute', top: 0, right: 0,
                                        width: '4px', height: '4px',
                                        background: '#ff5252', borderRadius: '50%',
                                        margin: '3px'
                                    }} />
                                )}
                            </button>
                        )
                    })}
                </div>

                {isAggressive && (
                    <div style={{
                        background: 'rgba(255, 82, 82, 0.08)',
                        border: '1px solid rgba(255, 82, 82, 0.2)',
                        borderRadius: '6px',
                        padding: '0.5rem 0.7rem',
                        marginBottom: '0.8rem'
                    }}>
                        <div style={{ color: '#ff5252', fontSize: '0.55rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                            ⚠️ PERFORMANCE WARNING
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.52rem', lineHeight: 1.5, margin: 0 }}>
                            This quality level exceeds your device's auto-detected capabilities. You may experience lag or crashes.
                        </p>
                    </div>
                )}
            </div>

            <div>
                <SectionHead>Statistics</SectionHead>
                <InfoRow label="Renderer" value={rendererInfo?.renderer ?? 'Detecting...'} />
                <InfoRow label="Live FPS" value={fps ? `${fps} FPS` : '—'} accent />
                <div style={{ height: '0.3rem' }} />
                <InfoRow label="Resolution" value={`${profile?.dpr.toFixed(2)}x`} />
                <InfoRow label="Shadows" value={profile?.shadows ? `${profile.shadowMapSize}px` : 'Off'} />
                <InfoRow label="Post FX" value={
                    profile?.tier === 'low' ? 'Off' :
                        profile?.tier === 'mid' ? 'Bloom' : 'Full stack'
                } />
                <InfoRow
                    label="Status"
                    value={isAggressive ? 'Aggressive' : 'Optimized'}
                    warning={isAggressive}
                    accent={!isAggressive}
                />
            </div>
        </div>
    )
}

function SettingsTab({ isMobile, controlScheme, onSchemeChange }: {
    isMobile: boolean
    controlScheme?: 'buttons' | 'joystick'
    onSchemeChange?: (s: 'buttons' | 'joystick') => void
}) {
    const handleRespawn = () => {
        window.dispatchEvent(new CustomEvent('car:respawn'))
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {isMobile && onSchemeChange && (
                <div>
                    <SectionHead>Control Scheme</SectionHead>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                        {(['buttons', 'joystick'] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => onSchemeChange(s)}
                                style={{
                                    flex: 1,
                                    padding: '0.6rem',
                                    background: controlScheme === s ? 'rgba(0,230,118,0.12)' : 'transparent',
                                    border: `1px solid ${controlScheme === s ? 'rgba(0,230,118,0.5)' : 'rgba(255,255,255,0.1)'}`,
                                    borderRadius: '8px',
                                    color: controlScheme === s ? '#00e676' : 'rgba(255,255,255,0.4)',
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: '0.62rem',
                                    letterSpacing: '0.08em',
                                    cursor: 'pointer',
                                    textTransform: 'capitalize' as const,
                                    transition: 'all 0.15s',
                                }}
                            >
                                {s === 'buttons' ? '🎮 Buttons' : '🕹 Joystick'}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <SectionHead>Car</SectionHead>
                <button
                    onClick={handleRespawn}
                    style={{
                        width: '100%',
                        padding: '0.65rem',
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: 'rgba(255,255,255,0.55)',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.65rem',
                        letterSpacing: '0.08em',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
                        e.currentTarget.style.color = 'rgba(255,255,255,0.85)'
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                        e.currentTarget.style.color = 'rgba(255,255,255,0.55)'
                    }}
                >
                    ↺ Respawn Car
                </button>
                <p style={{
                    color: 'rgba(255,255,255,0.2)', fontSize: '0.58rem',
                    marginTop: '0.4rem', lineHeight: 1.5,
                }}>
                    Also press <kbd style={{
                        padding: '0.05rem 0.35rem', background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)', borderRadius: '3px',
                        fontSize: '0.58rem',
                    }}>R</kbd> on keyboard anytime.
                </p>
            </div>

            <div>
                <SectionHead>Navigation</SectionHead>
                <button
                    onClick={() => {
                        usePortfolioStore.getState().setIsGameMode(false)
                    }}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: '#050a0a',
                        border: '1px solid rgba(0, 191, 255, 0.3)',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.65rem',
                        letterSpacing: '0.08em',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 0 20px rgba(0, 191, 255, 0.06)',
                    }}
                    onMouseEnter={e => {
                        const btn = e.currentTarget
                        btn.style.background = 'rgba(0, 191, 255, 0.05)'
                        btn.style.borderColor = 'rgba(0, 191, 255, 0.8)'
                        btn.style.boxShadow = '0 0 30px rgba(0, 191, 255, 0.2), inset 0 0 15px rgba(0, 191, 255, 0.1)'
                        btn.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={e => {
                        const btn = e.currentTarget
                        btn.style.background = '#050a0a'
                        btn.style.borderColor = 'rgba(0, 191, 255, 0.3)'
                        btn.style.boxShadow = '0 0 20px rgba(0, 191, 255, 0.06)'
                        btn.style.transform = 'translateY(0)'
                    }}
                >
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: 'linear-gradient(90deg, transparent, rgba(0, 191, 255, 0.15), transparent)',
                        backgroundSize: '200% 100%',
                        animation: 'btnShimmer 3s infinite linear',
                        pointerEvents: 'none'
                    }} />
                    <span style={{ position: 'relative', zIndex: 1 }}>📑 View Standard Portfolio</span>
                </button>
            </div>

            <div>
                <SectionHead>About</SectionHead>
                <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '8px',
                    padding: '0.8rem 0.9rem',
                }}>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.62rem', lineHeight: 1.7, margin: 0 }}>
                        Built with Next.js, Three.js, React Three Fiber, and Rapier physics.
                        Inspired by Bruno Simon's portfolio. Drive around, explore, and find the easter eggs.
                    </p>
                    <div style={{ marginTop: '0.6rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const }}>
                        {['Next.js', 'R3F', 'Rapier', 'Zustand'].map(tag => (
                            <span key={tag} style={{
                                padding: '0.1rem 0.45rem',
                                background: 'rgba(0,230,118,0.06)',
                                border: '1px solid rgba(0,230,118,0.15)',
                                borderRadius: '4px',
                                color: 'rgba(0,230,118,0.5)',
                                fontSize: '0.55rem',
                                letterSpacing: '0.08em',
                            }}>{tag}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
