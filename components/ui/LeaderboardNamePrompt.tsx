// components/ui/LeaderboardNamePrompt.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { submitScore, setStoredName, getStoredName } from '@/lib/leaderboardService'
import type { GameType } from '@/lib/leaderboard'
import { formatMazeTime } from '@/lib/leaderboard'

interface ModalState {
    mode: 'name-prompt' | 'notification' | null
    rank: number
    oldRank: number | null
    overtaken: string | null
    isEnteringTop5: boolean
    isPersonalBest: boolean
    isRecord: boolean
    game: GameType
    score: number
    time: number
}

const initialState: ModalState = {
    mode: null,
    rank: 0,
    oldRank: null,
    overtaken: null,
    isEnteringTop5: false,
    isPersonalBest: false,
    isRecord: false,
    game: 'football',
    score: 0,
    time: 0,
}

export default function LeaderboardNamePrompt() {
    const [state, setState] = useState<ModalState>(initialState)
    const [name, setName] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const onNeedsName = (e: Event) => {
            const d = (e as CustomEvent).detail
            setState({
                mode: 'name-prompt',
                rank: d.rank,
                oldRank: d.oldRank,
                overtaken: d.overtaken,
                isEnteringTop5: d.isEnteringTop5,
                isPersonalBest: d.isPersonalBest,
                isRecord: d.isRecord,
                game: d.game,
                score: d.score,
                time: d.time,
            })
            setName('')
            setSubmitting(false)
        }

        const onRanked = (e: Event) => {
            const d = (e as CustomEvent).detail
            setState({
                mode: 'notification',
                rank: d.rank,
                oldRank: d.oldRank,
                overtaken: d.overtaken,
                isEnteringTop5: d.isEnteringTop5,
                isPersonalBest: d.isPersonalBest,
                isRecord: d.isRecord,
                game: d.game,
                score: d.score,
                time: d.time,
            })
            // Dismiss after 5 seconds
            setTimeout(() => setState(s => ({ ...s, mode: null })), 5000)
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
        setTimeout(() => setState(s => ({ ...s, mode: null })), 5000)
    }

    if (!state.mode) return null

    const scoreDisplay = state.game === 'football'
        ? `${state.score} goal${state.score !== 1 ? 's' : ''}`
        : formatMazeTime(state.time)

    const playerName = getStoredName() ?? name

    // ── 1. NOTIFICATION BANNER (name already known) ──────────────────
    if (state.mode === 'notification') {
        const isHighRank = state.rank <= 3
        const isPersonalBest = state.isPersonalBest
        const isEnteringTop5 = state.isEnteringTop5

        let title = 'NEW SCORE'
        if (isPersonalBest) title = 'NEW RECORD'
        else if (isEnteringTop5) title = 'TOP 5 ENTERED'
        else if (state.overtaken) title = 'POSITION UP'

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
                    background: isHighRank ? 'rgba(255,215,0,0.12)' : 'rgba(0,255,136,0.10)',
                    border: `1px solid ${isHighRank ? 'rgba(255,215,0,0.5)' : 'rgba(0,255,136,0.4)'}`,
                    borderRadius: '14px',
                    padding: '1.8rem 2.5rem',
                    backdropFilter: 'blur(8px)',
                    boxShadow: `0 0 50px ${isHighRank ? 'rgba(255,215,0,0.15)' : 'rgba(0,255,136,0.12)'}`,
                }}>
                    <div style={{ fontSize: isHighRank ? '2.2rem' : '1.6rem', marginBottom: '0.4rem' }}>
                        {state.rank === 1 ? '🥇' : state.rank === 2 ? '🥈' : state.rank === 3 ? '🥉' : '🎯'}
                    </div>
                    <div style={{
                        color: isHighRank ? '#ffd700' : '#00ff88',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        marginBottom: '0.3rem',
                    }}>
                        {title} {isEnteringTop5 && !isPersonalBest && '⭐'}
                    </div>
                    <div style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        {scoreDisplay}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 500 }}>
                        {state.overtaken ? (
                            <>Overtook <span style={{ color: '#00ff88' }}>{state.overtaken}</span>! Now at <span style={{ color: '#00bfff' }}>#{state.rank}</span></>
                        ) : state.oldRank && state.oldRank !== state.rank ? (
                            <>Beating your record of <span style={{ color: '#00bfff' }}>#{state.oldRank}</span>!</>
                        ) : state.oldRank ? (
                            <>Beating your personal best!</>
                        ) : (
                            <>You ranked <span style={{ color: '#00bfff' }}>#{state.rank}</span>!</>
                        )}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', marginTop: '0.8rem' }}>
                        {playerName} · {state.game.toUpperCase()} LEADERBOARD
                    </div>
                </div>
            </div>
        )
    }

    // ── 2. NAME PROMPT (first time ever on this device) ──────────────
    const isHighRank = state.rank <= 3
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
                border: `1px solid ${isHighRank ? 'rgba(255,215,0,0.4)' : 'rgba(0,255,136,0.3)'}`,
                borderRadius: '14px',
                padding: '2rem 2.5rem',
                width: 'min(400px, 88vw)',
                boxShadow: `0 0 50px ${isHighRank ? 'rgba(255,215,0,0.1)' : 'rgba(0,255,136,0.1)'}`,
                textAlign: 'center',
            }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {state.rank === 1 ? '🥇' : '🏆'}
                </div>
                <div style={{
                    color: isHighRank ? '#ffd700' : '#00ff88',
                    fontSize: '0.8rem',
                    letterSpacing: '0.15em',
                    fontWeight: 700,
                    marginBottom: '0.3rem',
                }}>
                    {state.rank === 1 ? 'WORLD FIRST!' : 'LEADERBOARD ENTRY'}
                </div>
                <div style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                    {scoreDisplay}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '1.4rem' }}>
                    Ranked <span style={{ color: '#00ff88' }}>#{state.rank}</span>
                </div>

                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    marginBottom: '1.2rem',
                    paddingTop: '1.2rem',
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '0.72rem',
                }}>
                    Enter your name for the leaderboard
                </div>

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
                    {20 - name.length} chars left · saved to this device
                </div>

                <button
                    onClick={handleSubmitName}
                    disabled={!name.trim() || submitting}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: name.trim()
                            ? isHighRank ? 'rgba(255,215,0,0.15)' : 'rgba(0,255,136,0.15)'
                            : 'transparent',
                        border: `1px solid ${name.trim()
                            ? isHighRank ? 'rgba(255,215,0,0.5)' : 'rgba(0,255,136,0.4)'
                            : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: '8px',
                        color: name.trim()
                            ? isHighRank ? '#ffd700' : '#00ff88'
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
