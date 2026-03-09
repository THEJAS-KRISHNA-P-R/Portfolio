// components/ui/LeaderboardNamePrompt.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { submitScore, setStoredName, getStoredName } from '@/lib/leaderboardService'
import type { GameType } from '@/lib/leaderboard'
import { formatMazeTime } from '@/lib/leaderboard'

type RankType = 'record' | 'top5'

interface ModalState {
    mode: 'name-prompt' | 'notification' | null
    rank: RankType
    displacing: string | null
    game: GameType
    score: number
    time: number
}

export default function LeaderboardNamePrompt() {
    const [state, setState] = useState<ModalState>({
        mode: null, rank: 'top5', displacing: null,
        game: 'football', score: 0, time: 0,
    })
    const [name, setName] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        // Device has no stored name — ask for it
        const onNeedsName = (e: Event) => {
            const d = (e as CustomEvent).detail
            setState({
                mode: 'name-prompt',
                rank: d.rank, displacing: d.displacing,
                game: d.game, score: d.score, time: d.time,
            })
            setName('')
            setSubmitting(false)
        }

        // Device already has a name — just show the notification
        const onRanked = (e: Event) => {
            const d = (e as CustomEvent).detail
            setState({
                mode: 'notification',
                rank: d.rank, displacing: d.displacing,
                game: d.game, score: d.score, time: d.time,
            })
            // Auto-dismiss after 4 seconds
            setTimeout(() => setState(s => ({ ...s, mode: null })), 4000)
        }

        window.addEventListener('leaderboard:needs-name', onNeedsName)
        window.addEventListener('leaderboard:ranked', onRanked)
        return () => {
            window.removeEventListener('leaderboard:needs-name', onNeedsName)
            window.removeEventListener('leaderboard:ranked', onRanked)
        }
    }, [])

    // Focus input when name prompt opens
    useEffect(() => {
        if (state.mode === 'name-prompt') {
            setTimeout(() => inputRef.current?.focus(), 120)
        }
    }, [state.mode])

    const handleSubmitName = () => {
        if (!name.trim() || submitting) return
        setSubmitting(true)
        setStoredName(name.trim())
        submitScore(name.trim(), state.score, state.time, state.game)
        // Switch to notification mode
        setState(s => ({ ...s, mode: 'notification' }))
        setTimeout(() => setState(s => ({ ...s, mode: null })), 4000)
    }

    if (!state.mode) return null

    const scoreDisplay = state.game === 'football'
        ? `${state.score} goal${state.score !== 1 ? 's' : ''}`
        : formatMazeTime(state.time)

    const playerName = getStoredName() ?? name

    // ── NOTIFICATION BANNER (name already known) ──────────────────────
    if (state.mode === 'notification') {
        const isRecord = state.rank === 'record'
        return (
            <div style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 500,
                fontFamily: "'JetBrains Mono', monospace",
                textAlign: 'center',
                pointerEvents: 'none',
            }}>
                <div style={{
                    background: isRecord ? 'rgba(255,215,0,0.12)' : 'rgba(0,255,136,0.10)',
                    border: `1px solid ${isRecord ? 'rgba(255,215,0,0.5)' : 'rgba(0,255,136,0.4)'}`,
                    borderRadius: '14px',
                    padding: '1.8rem 2.5rem',
                    backdropFilter: 'blur(8px)',
                    boxShadow: `0 0 50px ${isRecord ? 'rgba(255,215,0,0.15)' : 'rgba(0,255,136,0.12)'}`,
                }}>
                    <div style={{
                        fontSize: isRecord ? '2.2rem' : '1.6rem',
                        marginBottom: '0.4rem',
                    }}>
                        {isRecord ? '🏆' : '🎯'}
                    </div>
                    <div style={{
                        color: isRecord ? '#ffd700' : '#00ff88',
                        fontSize: isRecord ? '1.1rem' : '0.9rem',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        marginBottom: '0.3rem',
                    }}>
                        {isRecord ? 'NEW RECORD' : 'TOP 5'}
                    </div>
                    <div style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        {scoreDisplay}
                    </div>
                    {state.displacing && (
                        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem' }}>
                            {isRecord
                                ? `beating ${state.displacing}'s record`
                                : `beating ${state.displacing}`
                            }
                        </div>
                    )}
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', marginTop: '0.5rem' }}>
                        {playerName} · {state.game === 'football' ? 'FOOTBALL' : 'MAZE'} LEADERBOARD
                    </div>
                </div>
            </div>
        )
    }

    // ── NAME PROMPT (first time ever on this device) ──────────────────
    const isRecord = state.rank === 'record'
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 500,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(5px)',
            fontFamily: "'JetBrains Mono', monospace",
        }}>
            <div style={{
                background: 'rgba(6, 15, 10, 0.97)',
                border: `1px solid ${isRecord ? 'rgba(255,215,0,0.4)' : 'rgba(0,255,136,0.3)'}`,
                borderRadius: '14px',
                padding: '2rem 2.5rem',
                width: 'min(400px, 88vw)',
                boxShadow: `0 0 50px ${isRecord ? 'rgba(255,215,0,0.1)' : 'rgba(0,255,136,0.1)'}`,
                textAlign: 'center',
            }}>
                {/* Badge */}
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {isRecord ? '🏆' : '🎯'}
                </div>
                <div style={{
                    color: isRecord ? '#ffd700' : '#00ff88',
                    fontSize: '0.75rem',
                    letterSpacing: '0.15em',
                    marginBottom: '0.3rem',
                }}>
                    {isRecord ? 'NEW RECORD' : 'YOU MADE TOP 5'}
                </div>
                <div style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                    {scoreDisplay}
                </div>
                {state.displacing && (
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', marginBottom: '1.4rem' }}>
                        {isRecord
                            ? `beating ${state.displacing}'s record`
                            : `beating ${state.displacing}`
                        }
                    </div>
                )}

                {/* Divider */}
                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    marginBottom: '1.2rem',
                    paddingTop: '1.2rem',
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '0.72rem',
                }}>
                    Enter your name for the leaderboard
                </div>

                {/* Input */}
                <input
                    ref={inputRef}
                    value={name}
                    onChange={e => setName(e.target.value.slice(0, 20))}
                    onKeyDown={e => e.key === 'Enter' && handleSubmitName()}
                    placeholder="Your name"
                    maxLength={20}
                    style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '1rem',
                        padding: '0.7rem 1rem',
                        marginBottom: '0.5rem',
                        outline: 'none',
                        textAlign: 'center',
                        boxSizing: 'border-box',
                    }}
                />
                <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.62rem', marginBottom: '1.1rem' }}>
                    {20 - name.length} chars left · saved to this device forever
                </div>

                {/* Submit */}
                <button
                    onClick={handleSubmitName}
                    disabled={!name.trim() || submitting}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: name.trim()
                            ? isRecord ? 'rgba(255,215,0,0.15)' : 'rgba(0,255,136,0.15)'
                            : 'transparent',
                        border: `1px solid ${name.trim()
                            ? isRecord ? 'rgba(255,215,0,0.5)' : 'rgba(0,255,136,0.4)'
                            : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: '8px',
                        color: name.trim()
                            ? isRecord ? '#ffd700' : '#00ff88'
                            : 'rgba(255,255,255,0.2)',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: name.trim() ? 'pointer' : 'default',
                        transition: 'all 0.2s',
                        letterSpacing: '0.08em',
                    }}
                >
                    {submitting ? 'ADDING...' : 'ADD TO LEADERBOARD'}
                </button>
            </div>
        </div>
    )
}
