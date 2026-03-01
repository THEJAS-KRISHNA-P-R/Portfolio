"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { Html } from "@react-three/drei";
import { fireAchievement } from "./AchievementToast";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import * as THREE from "three";

// ── Constants ──────────────────────────────────────────────────────────────
const MAZE_POS: [number, number, number] = [-110, 0, 110];
const MAZE_SIZE = 28;        // total outer square side length
const HALF = MAZE_SIZE / 2;  // 14
const WALL_H = 3.0;
const T = 0.6;       // wall thickness (half = 0.3)
const HT = T / 2;

// Car spawn: outside south entrance, facing north into maze
const SPAWN_REL: [number, number, number] = [0, 1.5, HALF + 4];

// ── Persistent high score ────────────────────────────────────────────────
let globalBestTime = Infinity;
let globalBestHits = Infinity;

// ─────────────────────────────────────────────────────────────────────────
// WALL DEFINITIONS — relative to maze center
// Each wall: [cx, cz, halfW, halfD] where W=X extent, D=Z extent
// Traced from the image: entrance gap at south center, exit gap at north center
// ─────────────────────────────────────────────────────────────────────────
// Outer boundary — 4 sides with gaps
// South wall: two halves with center gap (entrance ~4 units wide)
// North wall: two halves with center gap (exit ~4 units wide)
// Left/Right: full solid

// OUTER WALLS
const GAP = 5; // gap width at entrance/exit
const OUTER: [number, number, number, number][] = [
    // [cx,   cz,    half-width-x,  half-depth-z]
    [-8.25, 14, 5.75, 0.3],   // south LEFT
    [8.25, 14, 5.75, 0.3],   // south RIGHT
    [-8.25, -14, 5.75, 0.3],   // north LEFT  (exit)
    [8.25, -14, 5.75, 0.3],   // north RIGHT (exit)
    [-14, 0, 0.3, 14],   // west FULL
    [14, 0, 0.3, 14],   // east FULL
];

// INNER WALLS — traced from the image maze pattern
// Grid: 7 columns × 7 rows, each cell = 2 units (S = 2)
// All coords relative to maze center [0,0]
const S2 = 2;  // one cell

const INNER: [number, number, number, number][] = [
    // ── Horizontal segments ───────────────────────────────────────────
    // Top horizontal bar (leaves left 2 cells and right gap for exit open)
    [-3 * S2, -5 * S2, 4 * S2, HT],   // top bar left portion

    // Upper-middle horizontal
    [1 * S2, -3 * S2, 3 * S2, HT],   // right side upper

    // Middle horizontal — nearly full width, leaves right gap
    [-2 * S2, -1 * S2, 5 * S2, HT],   // middle left

    // Lower-middle horizontal
    [1 * S2, 1 * S2, 3 * S2, HT],   // right side lower

    // Near-bottom horizontal
    [-2 * S2, 3 * S2, 4 * S2, HT],   // bottom-ish left

    // ── Vertical segments ──────────────────────────────────────────────
    // Far left inner vertical — long
    [-5 * S2, 0 * S2, HT, 3 * S2],  // left spine upper
    [-5 * S2, 4 * S2, HT, 2 * S2],  // left spine lower

    // Left-center vertical short
    [-1 * S2, -4 * S2, HT, 2 * S2],  // upper-center left

    // Center vertical short
    [1 * S2, 0 * S2, HT, 1 * S2],  // center mid

    // Right inner vertical — long
    [3 * S2, -2 * S2, HT, 3 * S2],  // right spine
];

const ALL_WALLS = [...OUTER, ...INNER];

// ── Exit blocker: one-way wall at north exit ──────────────────────────────
// Sensor that blocks the car from entering via exit (north gap).
// If car approaches exit from OUTSIDE (z < -HALF-1), block it.
// Implemented as a solid wall outside the north gap — only removable
// by scripted exit detection, not needed: simply add a solid invisible
// wall just north of exit that blocks entry from the north.
// The south entrance has no such blocker (entry is free).

// ─────────────────────────────────────────────────────────────────────────
type MazeMode = "reset" | "counter" | null;

export function Maze() {
    const setTeleportTarget = usePortfolioStore(s => s.setTeleportTarget);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [mode, setMode] = useState<MazeMode>(null);
    const [modalShown, setModalShown] = useState(false);  // only show once per entry

    // Game state
    const [hitCount, setHitCount] = useState(0);
    const [bestTime, setBestTime] = useState(globalBestTime);
    const [bestHits, setBestHits] = useState(globalBestHits);
    const [running, setRunning] = useState(false);

    const startTime = useRef(0);
    const hitCooldown = useRef(false);
    const modeRef = useRef<MazeMode>(null);

    // Keep modeRef in sync with state
    useEffect(() => { modeRef.current = mode; }, [mode]);

    // ── Spawn car at maze entrance ──────────────────────────────────────────
    const respawnToStart = useCallback(() => {
        setTeleportTarget([
            MAZE_POS[0] + SPAWN_REL[0],
            SPAWN_REL[1],
            MAZE_POS[2] + SPAWN_REL[2],
        ]);
    }, [setTeleportTarget]);

    // ── Entry trigger (south sensor) — show modal ──────────────────────────
    const handleTriggerEnter = (e: any) => {
        const obj = e.other?.rigidBodyObject;
        if (!obj?.userData?.isCar) return;
        if (modalShown && mode !== null) return;  // already playing
        setShowModal(true);
        setModalShown(true);
    };

    const handleEnter = (e: any) => {
        const obj = e.other?.rigidBodyObject;
        if (!obj?.userData?.isCar) return;
        if (mode === null) return;   // no mode selected yet — ignore
        if (!running) {
            startTime.current = performance.now();
            setRunning(true);
            setHitCount(0);
        }
    };

    // ── Exit trigger (north sensor) ─────────────────────────────────────────
    const handleExit = (e: any) => {
        const obj = e.other?.rigidBodyObject;
        if (!obj?.userData?.isCar) return;
        if (!running || startTime.current === 0) return;

        const elapsed = (performance.now() - startTime.current) / 1000;
        setRunning(false);
        startTime.current = 0;

        const isRecord = elapsed < globalBestTime;
        if (isRecord) { globalBestTime = elapsed; setBestTime(elapsed); }

        fireAchievement({
            type: 'maze',
            title: isRecord ? '★ MAZE RECORD' : 'MAZE CLEAR',
            value: `${elapsed.toFixed(2)}s`,
            subtext: isRecord ? 'New best!' : `Best: ${globalBestTime.toFixed(2)}s`,
            color: '#00bfff',
            isRecord,
            duration: 4000
        });

        window.dispatchEvent(new CustomEvent('maze-clear'))

        // Let user re-enter for another run
        setModalShown(false);
    };

    // ── Wall collision ───────────────────────────────────────────────────────
    const handleWallHit = (e: any) => {
        const obj = e.other?.rigidBodyObject;
        if (!obj?.userData?.isCar) return;
        if (!modeRef.current) return;
        if (hitCooldown.current) return;

        hitCooldown.current = true;
        setTimeout(() => { hitCooldown.current = false; }, 800);

        if (modeRef.current === 'reset') {
            setRunning(false);
            startTime.current = 0;
            respawnToStart();
            // Brief alert
            fireAchievement({
                type: 'maze',
                title: 'WALL HIT',
                value: 'RESET',
                subtext: 'Respawning...',
                color: '#ff2200',
                duration: 2000
            });
        } else {
            // Counter mode
            setHitCount(c => {
                const next = c + 1;
                if (next < globalBestHits) {
                    globalBestHits = next;
                    setBestHits(next);
                }
                window.dispatchEvent(new CustomEvent('maze-hit-update', { detail: { count: next, bestHits: globalBestHits } }))
                return next;
            });
        }
    };

    // ── Mode selection ───────────────────────────────────────────────────────
    const selectMode = (m: MazeMode) => {
        setMode(m);
        setShowModal(false);
        setHitCount(0);
        startTime.current = performance.now();
        setRunning(true);
        window.dispatchEvent(new CustomEvent('maze-mode-change', { detail: { mode: m, bestHits: globalBestHits } }))
    };

    const wallColor = '#001a3a';
    const wallEmissive = '#00bfff';

    return (
        <group position={MAZE_POS}>

            {/* ── Large ground square ────────────────────────────────────────── */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[MAZE_SIZE + 2, MAZE_SIZE + 2]} />
                <meshStandardMaterial color="#000d1a" roughness={0.95} />
            </mesh>

            {/* Subtle grid on maze floor */}
            <gridHelper
                args={[MAZE_SIZE, 14, '#00bfff', '#001a3a']}
                position={[0, 0.02, 0]}
            />

            {/* ── All walls ──────────────────────────────────────────────────── */}
            {ALL_WALLS.map(([cx, cz, hw, hd], i) => (
                <RigidBody
                    key={i}
                    type="fixed"
                    position={[cx, WALL_H / 2, cz]}
                    onCollisionEnter={handleWallHit}
                    userData={{ isMazeWall: true }}
                >
                    <CuboidCollider args={[hw, WALL_H / 2, hd]} />
                    {/* Main wall body */}
                    <mesh castShadow receiveShadow>
                        <boxGeometry args={[hw * 2, WALL_H, hd * 2]} />
                        <meshStandardMaterial
                            color={wallColor}
                            emissive={wallEmissive}
                            emissiveIntensity={0.35}
                            roughness={0.2}
                            metalness={0.8}
                        />
                    </mesh>
                    {/* Glowing top cap */}
                    <mesh position={[0, WALL_H / 2 + 0.06, 0]}>
                        <boxGeometry args={[hw * 2, 0.1, hd * 2]} />
                        <meshBasicMaterial color="#00bfff" transparent opacity={0.7} />
                    </mesh>
                </RigidBody>
            ))}

            {/* ── Exit anti-entry sensor — detects car approaching exit from wrong side ─────────── */}
            {/* Position it just outside the maze north wall */}
            <RigidBody type="fixed" colliders={false} sensor
                onIntersectionEnter={(e: any) => {
                    const obj = e.other?.rigidBodyObject;
                    if (!obj?.userData?.isCar) return;

                    // Check if car is OUTSIDE the maze (z < -HALF means north of maze)
                    const pos = obj.translation?.() ?? obj.getWorldPosition?.(new THREE.Vector3());
                    const carZ = (pos?.z ?? 0) - MAZE_POS[2];  // relative to maze center

                    if (carZ < -HALF) {
                        // Car is outside trying to enter through exit — push it back north
                        setTeleportTarget([
                            MAZE_POS[0],
                            1.5,
                            MAZE_POS[2] - HALF - 6,  // spawn outside north, away from wall
                        ]);
                    }
                }}
            >
                <CuboidCollider
                    args={[GAP / 2, 2, 1.5]}
                    position={[0, 2, -HALF - 1.5]}  // just outside north wall
                />
            </RigidBody>

            {/* ── TRIGGER SQUARE — in front of south entrance ──────────────── */}
            {/* Positioned outside maze, centered on entrance */}
            <group position={[0, 0, HALF + 5]}>   {/* 5 units south of maze wall */}

                {/* Glowing floor square — bigger than car (~8×8 units) */}
                <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[8, 8]} />
                    <meshBasicMaterial color="#00bfff" transparent opacity={0.18} />
                </mesh>

                {/* Animated pulsing border ring */}
                <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[3.8, 4.2, 4]} />  {/* square-ish ring: 4 segments */}
                    <meshBasicMaterial color="#00bfff" transparent opacity={0.5} side={2} />
                </mesh>

                {/* Corner markers */}
                {[[-3.5, -3.5], [3.5, -3.5], [-3.5, 3.5], [3.5, 3.5]].map(([x, z], i) => (
                    <mesh key={i} position={[x, 0.1, z]}>
                        <boxGeometry args={[0.3, 0.2, 0.3]} />
                        <meshBasicMaterial color="#00bfff" />
                    </mesh>
                ))}

                {/* "MAZE" label above the square */}
                <Html position={[0, 3, 0]} center distanceFactor={12}>
                    <div style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#00bfff',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        textShadow: '0 0 12px rgba(0,191,255,0.7)',
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap',
                    }}>
                        MAZE ▶
                    </div>
                </Html>

                {/* Physics sensor — triggers modal */}
                <RigidBody type="fixed" colliders={false} sensor onIntersectionEnter={handleTriggerEnter}>
                    <CuboidCollider args={[4, 2, 4]} position={[0, 2, 0]} />
                </RigidBody>
            </group>

            {/* ── South entry sensor (timer start) ──────────── */}
            <group position={[0, 0, HALF]}>
                {/* Green glow strip on ground */}
                <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[GAP, 1.5]} />
                    <meshBasicMaterial color="#00ff88" transparent opacity={0.35} />
                </mesh>
                <RigidBody type="fixed" colliders={false} sensor onIntersectionEnter={handleEnter}>
                    <CuboidCollider args={[GAP / 2, 2, 0.5]} position={[0, 2, 0]} />
                </RigidBody>
                {/* Entry label */}
                <Html position={[0, 4.5, 0]} center distanceFactor={12}>
                    <div style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '10px',
                        color: '#00ff88',
                        letterSpacing: '0.12em',
                        textShadow: '0 0 10px rgba(0,255,136,0.6)',
                        pointerEvents: 'none',
                    }}>
                        ENTER
                    </div>
                </Html>
            </group>

            {/* ── North exit sensor ─────────────────────────────────────────── */}
            <group position={[0, 0, -HALF]}>
                {/* Purple glow strip on ground */}
                <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[GAP, 1.5]} />
                    <meshBasicMaterial color="#ff00ff" transparent opacity={0.35} />
                </mesh>
                <RigidBody type="fixed" colliders={false} sensor onIntersectionEnter={handleExit}>
                    <CuboidCollider args={[GAP / 2, 2, 0.5]} position={[0, 2, 0]} />
                </RigidBody>
                <Html position={[0, 4.5, 0]} center distanceFactor={12}>
                    <div style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '10px',
                        color: '#ff00ff',
                        letterSpacing: '0.12em',
                        textShadow: '0 0 10px rgba(255,0,255,0.6)',
                        pointerEvents: 'none',
                    }}>
                        EXIT
                    </div>
                </Html>
            </group>

            {/* ── 3D Scoreboard above south entrance ────────────────────────── */}
            <Html position={[0, 7, HALF + 2]} center distanceFactor={14}>
                <div style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    textAlign: 'center',
                    background: 'rgba(0,10,26,0.88)',
                    border: '1px solid rgba(0,191,255,0.3)',
                    borderRadius: '10px',
                    padding: '0.5rem 0.9rem',
                    backdropFilter: 'blur(8px)',
                    pointerEvents: 'none',
                    minWidth: '110px',
                }}>
                    <div style={{ fontSize: '9px', color: 'rgba(0,191,255,0.6)', letterSpacing: '0.14em' }}>
                        MAZE
                    </div>
                    <div style={{ fontSize: '18px', color: '#00bfff', fontWeight: 800, lineHeight: 1.2 }}>
                        {bestTime === Infinity ? '--' : `${bestTime.toFixed(2)}s`}
                    </div>
                    <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em' }}>
                        BEST TIME
                    </div>
                </div>
            </Html>

            {/* ── Ambient lighting ─────────────────────────────────────────── */}
            <pointLight position={[0, 6, 0]} color="#00bfff" intensity={2.5} distance={40} decay={2} />

            {/* ── MODE SELECTION MODAL (in-world Html) ─────────────────────── */}
            {showModal && (
                <Html position={[0, 8, HALF - 2]} center distanceFactor={10}>
                    <div style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        background: 'rgba(2, 8, 18, 0.96)',
                        border: '1px solid rgba(0,191,255,0.3)',
                        borderRadius: '16px',
                        padding: '1.4rem 1.8rem',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        boxShadow: '0 0 60px rgba(0,191,255,0.12), 0 16px 48px rgba(0,0,0,0.7)',
                        textAlign: 'center',
                        minWidth: '220px',
                        pointerEvents: 'all',
                    }}>
                        <div style={{
                            fontSize: '0.6rem',
                            color: 'rgba(0,191,255,0.5)',
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            marginBottom: '0.3rem',
                        }}>
                            MAZE MODE
                        </div>
                        <div style={{
                            fontSize: '1rem',
                            color: '#e8f5e9',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            marginBottom: '0.25rem',
                        }}>
                            Choose Difficulty
                        </div>
                        <div style={{
                            fontSize: '0.58rem',
                            color: 'rgba(255,255,255,0.3)',
                            letterSpacing: '0.05em',
                            marginBottom: '1.2rem',
                            lineHeight: 1.6,
                        }}>
                            Drive from ENTER to EXIT
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            {/* RESET MODE — red = harder */}
                            <button
                                onClick={() => selectMode('reset')}
                                style={{
                                    flex: 1,
                                    padding: '0.65rem 0.5rem',
                                    borderRadius: '10px',
                                    border: '1.5px solid rgba(255,50,50,0.5)',
                                    background: 'rgba(255,30,30,0.1)',
                                    color: '#ff5555',
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: '0.62rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(255,30,30,0.22)'
                                    e.currentTarget.style.borderColor = 'rgba(255,50,50,0.8)'
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(255,30,30,0.1)'
                                    e.currentTarget.style.borderColor = 'rgba(255,50,50,0.5)'
                                }}
                            >
                                <span style={{ fontSize: '1.2rem' }}>💥</span>
                                <span>RESET</span>
                                <span style={{ fontSize: '0.5rem', color: 'rgba(255,85,85,0.6)', fontWeight: 400 }}>
                                    Hit = restart
                                </span>
                            </button>

                            {/* COUNTER MODE — blue = easier */}
                            <button
                                onClick={() => selectMode('counter')}
                                style={{
                                    flex: 1,
                                    padding: '0.65rem 0.5rem',
                                    borderRadius: '10px',
                                    border: '1.5px solid rgba(0,150,255,0.5)',
                                    background: 'rgba(0,120,255,0.1)',
                                    color: '#4da6ff',
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: '0.62rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(0,120,255,0.22)'
                                    e.currentTarget.style.borderColor = 'rgba(0,150,255,0.8)'
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(0,120,255,0.1)'
                                    e.currentTarget.style.borderColor = 'rgba(0,150,255,0.5)'
                                }}
                            >
                                <span style={{ fontSize: '1.2rem' }}>🔢</span>
                                <span>COUNTER</span>
                                <span style={{ fontSize: '0.5rem', color: 'rgba(77,166,255,0.6)', fontWeight: 400 }}>
                                    Count hits
                                </span>
                            </button>
                        </div>

                        {/* Dismiss */}
                        <button
                            onClick={() => setShowModal(false)}
                            style={{
                                marginTop: '0.75rem',
                                width: '100%',
                                padding: '0.3rem',
                                background: 'none',
                                border: 'none',
                                color: 'rgba(255,255,255,0.2)',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '0.52rem',
                                letterSpacing: '0.08em',
                                cursor: 'pointer',
                            }}
                        >
                            dismiss
                        </button>
                    </div>
                </Html>
            )}
        </group>
    );
}
