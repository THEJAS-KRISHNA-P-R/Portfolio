// components/game/LeaderboardBoard.tsx
'use client'

import { memo, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { fetchLeaderboard, type LeaderboardEntry } from '@/lib/leaderboardService'
import { formatMazeTime, LB_CONFIG } from '@/lib/leaderboard'
import type { GameType } from '@/lib/leaderboard'

interface Props {
    position: [number, number, number]
    rotation?: [number, number, number]   // Euler in radians
    game: GameType
}

// Board dimensions in world units
const BOARD_W = 6
const BOARD_H = 3.2

// Canvas resolution — keep low to avoid GPU memory waste
const TEX_W = 512
const TEX_H = 256

function drawBoard(
    ctx: CanvasRenderingContext2D,
    entries: LeaderboardEntry[],
    game: GameType
): void {
    const W = TEX_W
    const H = TEX_H

    // Background
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = 'rgba(6, 15, 10, 0.97)'
    ctx.fillRect(0, 0, W, H)

    // Border
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.6)'
    ctx.lineWidth = 3
    ctx.strokeRect(2, 2, W - 4, H - 4)

    // Inner accent line
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.15)'
    ctx.lineWidth = 1
    ctx.strokeRect(8, 8, W - 16, H - 16)

    // Title
    const title = game === 'football' ? '⚽  FOOTBALL' : '🏁  MAZE'
    ctx.font = 'bold 22px "JetBrains Mono", monospace'
    ctx.fillStyle = '#00ff88'
    ctx.textAlign = 'center'
    ctx.fillText('LEADERBOARD', W / 2, 38)

    ctx.font = '13px "JetBrains Mono", monospace'
    ctx.fillStyle = 'rgba(0,255,136,0.55)'
    ctx.fillText(title, W / 2, 56)

    // Divider
    ctx.strokeStyle = 'rgba(0,255,136,0.2)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(24, 66)
    ctx.lineTo(W - 24, 66)
    ctx.stroke()

    if (entries.length === 0) {
        ctx.font = '14px "JetBrains Mono", monospace'
        ctx.fillStyle = 'rgba(255,255,255,0.3)'
        ctx.textAlign = 'center'
        ctx.fillText('No scores yet. Be the first!', W / 2, H / 2 + 20)
        return
    }

    // Rows
    const ROW_H = (H - 82) / LB_CONFIG.TOP_N
    const MEDALS = ['🥇', '🥈', '🥉', '  4', '  5']
    const COL_RANK = 36
    const COL_NAME = 72
    const COL_SCORE = W - 28

    entries.forEach((entry, i) => {
        const y = 82 + i * ROW_H + ROW_H * 0.62

        // Highlight top row
        if (i === 0) {
            ctx.fillStyle = 'rgba(0,255,136,0.06)'
            ctx.fillRect(12, 82 + i * ROW_H + 2, W - 24, ROW_H - 4)
        }

        // Rank
        ctx.font = i < 3 ? '15px serif' : '12px "JetBrains Mono", monospace'
        ctx.fillStyle = i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'rgba(255,255,255,0.35)'
        ctx.textAlign = 'left'
        ctx.fillText(MEDALS[i], COL_RANK - 20, y)

        // Name — truncate at 14 chars
        const displayName = entry.playerName.length > 14
            ? entry.playerName.slice(0, 13) + '…'
            : entry.playerName
        ctx.font = '13px "JetBrains Mono", monospace'
        ctx.fillStyle = i === 0 ? '#ffffff' : 'rgba(255,255,255,0.75)'
        ctx.textAlign = 'left'
        ctx.fillText(displayName, COL_NAME, y)

        // Score
        const scoreText = game === 'football'
            ? `${entry.score} pts`
            : formatMazeTime(entry.time)
        ctx.font = 'bold 13px "JetBrains Mono", monospace'
        ctx.fillStyle = '#00ff88'
        ctx.textAlign = 'right'
        ctx.fillText(scoreText, COL_SCORE, y)
    })
}

export const LeaderboardBoard = memo(function LeaderboardBoard({
    position,
    rotation = [-Math.PI / 12, 0, 0],   // 15° tilt back — faces player at car height
    game,
}: Props) {
    const meshRef = useRef<THREE.Mesh>(null)
    const texRef = useRef<THREE.CanvasTexture | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [entries, setEntries] = useState<LeaderboardEntry[]>([])
    const lastFetch = useRef(0)

    // Initial fetch
    useEffect(() => {
        fetchLeaderboard(game).then(setEntries)
    }, [game])

    // Create canvas texture once
    useEffect(() => {
        const canvas = document.createElement('canvas')
        canvas.width = TEX_W
        canvas.height = TEX_H
        canvasRef.current = canvas
        const tex = new THREE.CanvasTexture(canvas)
        texRef.current = tex

        if (meshRef.current) {
            (meshRef.current.material as THREE.MeshBasicMaterial).map = tex
        }

        return () => { tex.dispose() }
    }, [])

    // Redraw canvas when entries change
    useEffect(() => {
        const canvas = canvasRef.current
        const tex = texRef.current
        if (!canvas || !tex) return
        const ctx = canvas.getContext('2d')!
        drawBoard(ctx, entries, game)
        tex.needsUpdate = true
    }, [entries, game])

    // Poll for new scores every 60s (inside useFrame to avoid setInterval)
    useFrame(() => {
        const now = performance.now()
        if (now - lastFetch.current > LB_CONFIG.POLL_INTERVAL) {
            lastFetch.current = now
            fetchLeaderboard(game).then(setEntries)
        }
    })

    return (
        <group position={position} rotation={rotation}>
            {/* Front side — nudged forward slightly to avoid Z-fighting with edge box */}
            <mesh ref={meshRef} position={[0, 0, 0.006]}>
                <planeGeometry args={[BOARD_W, BOARD_H]} />
                <meshBasicMaterial
                    color="#ffffff"
                    toneMapped={false}
                    side={THREE.FrontSide}
                />
            </mesh>

            {/* Back side — duplicated for readability from behind, nudged backward */}
            <mesh position={[0, 0, -0.016]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[BOARD_W, BOARD_H]} />
                <meshBasicMaterial
                    color="#ffffff"
                    toneMapped={false}
                    map={texRef.current ?? undefined}
                    side={THREE.FrontSide}
                />
            </mesh>

            {/* Board backing/edge — a thin box to give it depth, positioned between the planes */}
            <mesh position={[0, 0, -0.005]}>
                <boxGeometry args={[BOARD_W + 0.1, BOARD_H + 0.1, 0.01]} />
                <meshBasicMaterial color="#040d07" />
            </mesh>

            {/* Support legs — two thin boxes going into the ground */}
            {[-BOARD_W * 0.35, BOARD_W * 0.35].map((x, i) => (
                <mesh key={i} position={[x, -BOARD_H / 2 - 0.5, -0.05]}>
                    <boxGeometry args={[0.12, 1.0, 0.12]} />
                    <meshBasicMaterial color="#0a1a10" />
                </mesh>
            ))}
        </group>
    )
})
