"use client"

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { RigidBody, CuboidCollider } from "@react-three/rapier"
import { Instances, Instance } from "@react-three/drei"
import * as THREE from "three"
import { useQualityStore } from "@/store/useQualityStore"
import { MazeMode } from "./MazeModeModal"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import { gameState } from "./Car"

// ── Constants ─────────────────────────────────────────────────────────
const MAZE_LAYOUT: number[][] = [
    [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
]

const MAZE_ROWS = 13
const MAZE_COLS = 25
const CELL_SIZE = 4
const WALL_HEIGHT = 3.5
const WALL_HALF_H = WALL_HEIGHT / 2
const CELL_HALF = CELL_SIZE / 2

const MAZE_ORIGIN_X = -140
const MAZE_ORIGIN_Z = 72
const MAZE_CENTER_X = MAZE_ORIGIN_X + (MAZE_COLS * CELL_SIZE) / 2
const MAZE_CENTER_Z = MAZE_ORIGIN_Z + (MAZE_ROWS * CELL_SIZE) / 2

// Entry through gap in top wall (row 0 cols 1-2)
const ENTRY_WORLD_X = MAZE_ORIGIN_X + 1.5 * CELL_SIZE
const ENTRY_WORLD_Z = MAZE_ORIGIN_Z + 1.5 * CELL_SIZE

// Exit through gap in bottom wall (row 12 cols 22-23)
const EXIT_WORLD_X = MAZE_ORIGIN_X + 22.5 * CELL_SIZE
const EXIT_WORLD_Z = MAZE_ORIGIN_Z + 12.5 * CELL_SIZE

// ── Wall builders ──────────────────────────────────────────────────────

// VISUAL: one position per wall cell — no overlaps, no "+" artifacts
function buildVisualCells(layout: number[][]): [number, number, number][] {
    const out: [number, number, number][] = []
    for (let row = 0; row < MAZE_ROWS; row++) {
        for (let col = 0; col < MAZE_COLS; col++) {
            if (layout[row][col] === 1) {
                out.push([
                    MAZE_ORIGIN_X + (col + 0.5) * CELL_SIZE,
                    WALL_HALF_H,
                    MAZE_ORIGIN_Z + (row + 0.5) * CELL_SIZE,
                ])
            }
        }
    }
    return out
}

// PHYSICS: horizontal run-length merged — fewer Rapier bodies
function buildPhysicsSegs(layout: number[][]): {
    pos: [number, number, number]
    args: [number, number, number]
}[] {
    const out: { pos: [number, number, number]; args: [number, number, number] }[] = []
    for (let row = 0; row < MAZE_ROWS; row++) {
        let col = 0
        while (col < MAZE_COLS) {
            if (layout[row][col] === 1) {
                let len = 0
                while (col + len < MAZE_COLS && layout[row][col + len] === 1) len++
                out.push({
                    pos: [
                        MAZE_ORIGIN_X + (col + len / 2) * CELL_SIZE,
                        WALL_HALF_H,
                        MAZE_ORIGIN_Z + (row + 0.5) * CELL_SIZE,
                    ],
                    args: [len * CELL_HALF, WALL_HALF_H, CELL_HALF],
                })
                col += len
            } else { col++ }
        }
    }
    return out
}

// ── Component ──────────────────────────────────────────────────────────
export const Maze = memo(function Maze() {
    const [mazeActive, setMazeActive] = useState(false)
    const [pendingModal, setPendingModal] = useState(false)
    const modeRef = useRef<MazeMode>('explore')
    const startTime = useRef(0)
    const lastHitTime = useRef(0)
    const hasMoved = useRef(false)

    const incrementMazeHits = usePortfolioStore(s => s.incrementMazeHits)
    const resetMazeHits = usePortfolioStore(s => s.resetMazeHits)
    const currentHits = usePortfolioStore(s => s.mazeHits)

    const visualCells = useMemo(() => buildVisualCells(MAZE_LAYOUT), [])
    const physicsSegs = useMemo(() => buildPhysicsSegs(MAZE_LAYOUT), [])

    // ── Collision: handle consequences based on mode ──────────────────
    const handleCollision = useCallback(() => {
        if (!mazeActive) return

        const now = performance.now()
        // Debounce: Ignore hits within 1 second of the last one to prevent jitter counting
        if (now - lastHitTime.current < 1000) return
        lastHitTime.current = now

        if (modeRef.current === 'hits') {
            incrementMazeHits()
        } else if (modeRef.current === 'hard') {
            // HARD MODE: Reset everything on one hit
            startTime.current = 0 // Wait for movement again
            hasMoved.current = false
            window.dispatchEvent(new CustomEvent('car:teleport', {
                detail: {
                    position: { x: ENTRY_WORLD_X, y: 0.5, z: ENTRY_WORLD_Z },
                    rotation: { x: 0, y: 1, z: 0, w: 0 },
                }
            }))
            // Reset HUD state manually for hard reset
            window.dispatchEvent(new CustomEvent('maze:hit-reset'))
        }
    }, [mazeActive, incrementMazeHits])

    // ── Approach: show mode select modal ──────────────────────────────
    const handleApproach = useCallback(() => {
        if (mazeActive || pendingModal) return
        setPendingModal(true)
        window.dispatchEvent(new CustomEvent('game:freeze-controls', { detail: { frozen: true } }))
        window.dispatchEvent(new CustomEvent('maze:approach'))
    }, [mazeActive, pendingModal])

    // ── Exit: stop timer, fire completion ─────────────────────────────
    const handleExit = useCallback(() => {
        if (!mazeActive) return
        const elapsed = (performance.now() - startTime.current) / 1000

        // 1. Set inactive FIRST
        setMazeActive(false)

        // 2. Fire completion events
        window.dispatchEvent(new CustomEvent('maze:complete', {
            detail: {
                time: modeRef.current === 'explore' ? undefined : (hasMoved.current ? elapsed : 0),
                hits: modeRef.current === 'explore' ? undefined : currentHits,
                mode: modeRef.current
            }
        }))
        window.dispatchEvent(new CustomEvent('game:clear', {
            detail: { game: 'maze', time: elapsed }
        }))

        // 3. Freeze controls
        window.dispatchEvent(new CustomEvent('game:freeze-controls', { detail: { frozen: true } }))

        // 4. Wait 3 seconds showing result, THEN teleport back to world 
        // (Wait... actually the HUD overlay takes over pointer events, so car can stay there)
        setTimeout(() => {
            // We don't teleport back immediately here anymore, 
            // let the user close the overlay first or wait.
            // Actually, let's keep the auto-teleport as a "cleanup" after a longer delay 
            // IF the user hasn't closed it.
        }, 5000)

    }, [mazeActive, currentHits])

    // ── Event wiring ──────────────────────────────────────────────────
    useEffect(() => {
        const onConfirm = (e: Event) => {
            const mode = (e as CustomEvent).detail?.mode ?? 'explore'
            modeRef.current = mode
            setPendingModal(false)
            setMazeActive(true)
            startTime.current = 0
            hasMoved.current = false
            resetMazeHits()
            lastHitTime.current = 0

            // Teleport car to entry cell
            window.dispatchEvent(new CustomEvent('car:teleport', {
                detail: {
                    position: { x: ENTRY_WORLD_X, y: 0.5, z: ENTRY_WORLD_Z },
                    rotation: { x: 0, y: 1, z: 0, w: 0 },
                }
            }))

            window.dispatchEvent(new CustomEvent('game:freeze-controls', { detail: { frozen: true } }))
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('game:freeze-controls', { detail: { frozen: false } }))
            }, 800)

            window.dispatchEvent(new CustomEvent('maze:start', {
                detail: { mode }
            }))
        }

        const onCancel = () => {
            setPendingModal(false)
            window.dispatchEvent(new CustomEvent('game:freeze-controls', { detail: { frozen: false } }))
        }

        const onReset = () => {
            setMazeActive(false)
            setPendingModal(false)
            startTime.current = 0
            hasMoved.current = false
        }

        const onForceExit = () => {
            setMazeActive(false)
            setPendingModal(false)
            startTime.current = 0
            hasMoved.current = false
            window.dispatchEvent(new CustomEvent('maze:reset'))
            window.dispatchEvent(new CustomEvent('car:teleport', {
                detail: {
                    position: { x: ENTRY_WORLD_X - 10, y: 0.5, z: MAZE_ORIGIN_Z - 12 },
                    rotation: { x: 0, y: 0, z: 0, w: 1 },
                }
            }))
            window.dispatchEvent(new CustomEvent('game:freeze-controls', { detail: { frozen: false } }))
        }

        window.addEventListener('maze:confirm', onConfirm)
        window.addEventListener('maze:cancel', onCancel)
        window.addEventListener('maze:reset', onReset)
        window.addEventListener('maze:force-exit', onForceExit)

        return () => {
            window.removeEventListener('maze:confirm', onConfirm)
            window.removeEventListener('maze:cancel', onCancel)
            window.removeEventListener('maze:reset', onReset)
            window.removeEventListener('maze:force-exit', onForceExit)
        }
    }, [resetMazeHits])

    // ── Timer Start Check ──────────────────────────────────────────────
    useEffect(() => {
        if (!mazeActive) return
        const id = setInterval(() => {
            if (!hasMoved.current && gameState.speed > 0.1) {
                hasMoved.current = true
                startTime.current = performance.now()
                window.dispatchEvent(new CustomEvent('maze:timer-start'))
            }
        }, 100)
        return () => clearInterval(id)
    }, [mazeActive])

    // ── Render ────────────────────────────────────────────────────────
    return (
        <>
            {/* ── Approach sensor — triggers modal ── */}
            <RigidBody
                type="fixed"
                sensor
                position={[ENTRY_WORLD_X, 0.05, MAZE_ORIGIN_Z - 6]}
                onIntersectionEnter={handleApproach}
            >
                <CuboidCollider args={[2, 0.05, 2]} />
            </RigidBody>

            {/* EXIT SENSOR — only triggers handleExit if maze is active */}
            <RigidBody
                type="fixed"
                sensor
                position={[EXIT_WORLD_X, 0.05, EXIT_WORLD_Z + CELL_HALF]}
                onIntersectionEnter={handleExit}
            >
                <CuboidCollider args={[2, 0.05, 2]} />
            </RigidBody>

            {/* ENTRANCE BARRIER — ALWAYS blocks to prevent backtracking/unauthorized entry */}
            <RigidBody type="fixed" position={[ENTRY_WORLD_X, WALL_HALF_H, MAZE_ORIGIN_Z + CELL_HALF]}>
                <CuboidCollider args={[4, WALL_HALF_H, 0.2]} />
            </RigidBody>

            {/* EXIT BARRIER — ALWAYS blocks entry from outside. */}
            <RigidBody type="fixed" position={[EXIT_WORLD_X, WALL_HALF_H, EXIT_WORLD_Z + CELL_HALF]}>
                <CuboidCollider args={[CELL_SIZE / 2, WALL_HALF_H, 0.2]} sensor={mazeActive} />
            </RigidBody>

            {/* ── Visual walls — per-cell Instances ─ */}
            <Instances limit={400}>
                <boxGeometry args={[CELL_SIZE, WALL_HEIGHT, CELL_SIZE]} />
                <meshStandardMaterial color="#0d2218" roughness={0.9} metalness={0.05} />
                {visualCells.map((pos, i) => (
                    <Instance key={i} position={pos} />
                ))}
            </Instances>

            {/* ── Physics — merged horizontal segments ─────────────── */}
            {physicsSegs.map((seg, i) => (
                <RigidBody
                    key={`mp-${i}`}
                    type="fixed"
                    position={seg.pos}
                    onCollisionEnter={handleCollision}
                >
                    <CuboidCollider args={seg.args} />
                </RigidBody>
            ))}

            {/* ── Floor ─────────────────────────────────────────────── */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[MAZE_CENTER_X, 0.01, MAZE_CENTER_Z]}
                receiveShadow
            >
                <planeGeometry args={[MAZE_COLS * CELL_SIZE, MAZE_ROWS * CELL_SIZE]} />
                <meshStandardMaterial color="#0a1a10" roughness={0.95} />
            </mesh>

            {/* ── Entry/Exit Markers ────────────────────────────────── */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ENTRY_WORLD_X, 0.02, ENTRY_WORLD_Z]}>
                <circleGeometry args={[1.4, 8]} />
                <meshBasicMaterial color="#00ff88" transparent opacity={0.5} depthWrite={false} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[EXIT_WORLD_X, 0.02, EXIT_WORLD_Z]}>
                <circleGeometry args={[1.4, 8]} />
                <meshBasicMaterial color="#ff4444" transparent opacity={0.5} depthWrite={false} />
            </mesh>

            {!mazeActive && (
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ENTRY_WORLD_X, 0.02, MAZE_ORIGIN_Z - 6]}>
                    <planeGeometry args={[4, 4]} />
                    <meshBasicMaterial color="#00bfff" transparent opacity={0.12} depthWrite={false} />
                </mesh>
            )}
        </>
    )
})
