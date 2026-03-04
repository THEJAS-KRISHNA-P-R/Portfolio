"use client";

import { useRef, useState, useEffect, useCallback, memo } from "react";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { Html } from "@react-three/drei";
import { fireAchievement } from "./AchievementToast";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import * as THREE from "three";

// ── Module-level constants ────────────────────────────────────────────────
const MAZE_POS = new THREE.Vector3(-110, 0, 110);
const MAZE_ROT = Math.PI * 0.75; // same as group rotation

const C  = 4;    // cell size
const T  = 0.4;  // half wall thickness
const H  = 18;   // half maze size (9 cells × 2 = 18)
const WH = 3.5;  // wall height
const GAP = 5;   // entrance/exit opening width

// Convert local spawn [0, 1.5, 24] to world space:
const _localSpawn = new THREE.Vector3(0, 1.5, H + 6);
const _euler = new THREE.Euler(0, MAZE_ROT, 0);
export const MAZE_WORLD_SPAWN = _localSpawn.clone()
    .applyEuler(_euler)
    .add(MAZE_POS);

// Car should face INTO maze = opposite of spawn direction = MAZE_ROT
export const MAZE_WORLD_FACING = MAZE_ROT;
// ─────────────────────────────────────────────────────────────────────────

// ── Persistent high score ────────────────────────────────────────────────
let globalBestTime = Infinity;
let globalBestHits = Infinity;
// ── Cheat: ghost mode — wall hits have no effect ────────────────────
let _ghostMode = false;
let _ghostTimer: ReturnType<typeof setTimeout> | null = null;
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
const OUTER: [cx: number, cz: number, hw: number, hd: number][] = [
  [-10.25,  H,   7.75, T],   // south LEFT
  [ 10.25,  H,   7.75, T],   // south RIGHT
  [-10.25, -H,   7.75, T],   // north LEFT  (exit)
  [ 10.25, -H,   7.75, T],   // north RIGHT (exit)
  [-H,      0,   T,    H ],  // west FULL
  [ H,      0,   T,    H ],  // east FULL
]

// INNER WALLS — traced from a 9x9 grid
const INNER: [number, number, number, number][] = [
  // ── Row 2 horizontal walls ──────────────────────────────────────────
  [-6,  10,  2, T],   // cols 1-2 blocked
  [ 0,  10,  2, T],   // col 3-4
  [ 6,  10,  2, T],   // col 5-6

  // ── Row 3 horizontal walls ──────────────────────────────────────────
  [-2,   6,  2, T],   // one segment
  [ 8,   6,  2, T],   // right side

  // ── Row 4 horizontal walls (long wall divides top from bottom) ──────
  [-10,  2,  2, T],
  [-4,   2,  6, T],   // longer segment — 3 cells
  [ 8,   2,  2, T],

  // ── Row 6 horizontal walls ──────────────────────────────────────────
  [-4,  -6,  6, T],   // 3 cells center
  [ 8,  -6,  2, T],

  // ── Row 8 horizontal walls ──────────────────────────────────────────
  [-6,  -10, 2, T],
  [ 0,  -10, 2, T],
  [ 6,  -10, 2, T],

  // ── Vertical walls ───────────────────────────────────────────────────
  [-12,  8, T,  2],   // left inner spine north
  [-12, -2, T,  4],   // left inner spine south

  [-4,  14, T,  2],   // Col 3 boundary short top
  [-4,   0, T,  2],   // mid
  [-4,  -8, T,  2],   // near bottom

  [ 4,   8, T,  2],   // Center vertical
  [ 4,  -4, T,  4],

  [ 12,  4, T,  6],   // Col 7 boundary long mid

  [ 8,  12, T,  2],   // Right inner
  [ 8,  -4, T,  2],
]

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

export const Maze = memo(function Maze() {
    const setTeleportTarget = usePortfolioStore(s => s.setTeleportTarget);

    // Modal state
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
    const runningRef = useRef(false);

    // Keep modeRef and runningRef in sync with state
    useEffect(() => { modeRef.current = mode; }, [mode]);
    useEffect(() => { runningRef.current = running; }, [running]);

    // ── Spawn car at maze entrance ──────────────────────────────────────────
    const respawnToStart = useCallback(() => {
        // Fire a single event with BOTH position and rotation
        window.dispatchEvent(new CustomEvent('car:teleport', {
            detail: {
                x: MAZE_WORLD_SPAWN.x,
                y: MAZE_WORLD_SPAWN.y,
                z: MAZE_WORLD_SPAWN.z,
                rotationY: MAZE_WORLD_FACING,
            }
        }));
    }, []);

    const [lastExitTime, setLastExitTime] = useState(0);

    // ── Entry trigger (south sensor) — show modal ──────────────────────────
    const handleTriggerEnter = (e: any) => {
        const obj = e.other?.rigidBodyObject;
        if (!obj?.userData?.isCar) return;
        
        // Prevent instant re-trigger after exit (5s grace period)
        if (performance.now() - lastExitTime < 5000) return;

        if (modalShown && mode !== null) return;
        window.dispatchEvent(new CustomEvent('maze:show-modal'));
        setModalShown(true);
        // FREEZE CAR IMMEDIATELY
        window.dispatchEvent(new CustomEvent('game:freeze-controls', { detail: { frozen: true } }));
    };

    const handleEnter = (e: any) => {
        const obj = e.other?.rigidBodyObject;
        if (!obj?.userData?.isCar) return;
        if (mode === null) return;   // no mode selected yet — ignore
        if (!running) {
            startTime.current = performance.now();
            setRunning(true);
            setHitCount(0);
            // Re-notify HUD (covers both first entry AND re-entry after reset)
            window.dispatchEvent(new CustomEvent('maze:mode-active', { detail: { mode: modeRef.current } }));
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
            subtext: isRecord ? 'New best time!' : `Best: ${globalBestTime.toFixed(2)}s`,
            color: '#00bfff',
            isRecord,
            duration: 4500,
        });

        window.dispatchEvent(new CustomEvent('maze:cleared'));
        window.dispatchEvent(new CustomEvent('maze:exited'));  // clears HUD mode overlay
        window.dispatchEvent(new CustomEvent('game:clear', { detail: { game: 'maze', isRecord, value: `${elapsed.toFixed(2)}s` } }));

        // Reset so car can re-enter for a fresh run
        setMode(null);
        modeRef.current = null;
        setModalShown(false);
    };

    // ── Wall collision ───────────────────────────────────────────────────────
    const handleWallHit = (e: any) => {
        const obj = e.other?.rigidBodyObject;
        if (!obj?.userData?.isCar) return;
        if (!modeRef.current) return;
        if (!runningRef.current) return; // not in an active run
        if (_ghostMode) return;          // cheat: ghost mode active
        if (hitCooldown.current) return;

        hitCooldown.current = true;
        setTimeout(() => { hitCooldown.current = false; }, 800);

        if (modeRef.current === 'reset') {
            setRunning(false);
            startTime.current = 0;
            setHitCount(0);
            setModalShown(false);
            respawnToStart();
            window.dispatchEvent(new CustomEvent('maze:reset'));
            fireAchievement({ 
                type: 'maze', 
                title: 'WALL HIT', 
                value: 'RESET', 
                subtext: 'Return to entrance', 
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
                window.dispatchEvent(new CustomEvent('maze:wall-hit', { detail: { count: next } }));
                fireAchievement({ type: 'maze', title: 'WALL HIT', value: `${next}×`, subtext: 'Keep going!', color: '#ff9944', duration: 1800 });
                return next;
            });
        }
    };

    useEffect(() => {
        const onSelected = (e: Event) => {
            const { mode: m } = (e as CustomEvent).detail as { mode: 'reset' | 'counter' };
            setMode(m);
            modeRef.current = m;
            setHitCount(0);
            startTime.current = 0;
            setRunning(false);
            window.dispatchEvent(new CustomEvent('game:freeze-controls', { detail: { frozen: false } }));
            // Timer starts on entry sensor — don't start it here
            window.dispatchEvent(new CustomEvent('maze:mode-active', { detail: { mode: m } }));
        };
        const onDismissed = () => {
            setModalShown(false);
            setMode(null);
            modeRef.current = null;
            setLastExitTime(performance.now());
        };
        const onForceExit = () => {
            setRunning(false);
            setMode(null);
            modeRef.current = null;
            setModalShown(false);
            setHitCount(0);
            startTime.current = 0;
            setLastExitTime(performance.now());
            window.dispatchEvent(new CustomEvent('maze:reset'));
            window.dispatchEvent(new CustomEvent('maze:exited'));
            window.dispatchEvent(new CustomEvent('game:freeze-controls', { detail: { frozen: false } }));
        };
        window.addEventListener('maze:mode-selected', onSelected);
        window.addEventListener('maze:dismissed', onDismissed);
        window.addEventListener('maze:force-exit', onForceExit);
        return () => {
            window.removeEventListener('maze:mode-selected', onSelected);
            window.removeEventListener('maze:dismissed', onDismissed);
            window.removeEventListener('maze:force-exit', onForceExit);
        };
    }, []);

    const wallColor = '#001a3a';
    const wallEmissive = '#00bfff';

    return (
        <group position={[-110, 0, 110]} rotation={[0, MAZE_ROT, 0]}>

            {/* ── Large ground square ────────────────────────────────────────── */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[40, 40]} />
                <meshStandardMaterial color="#000d1a" roughness={0.95} />
            </mesh>

            {/* Subtle grid on maze floor */}
            <gridHelper
                args={[36, 18, '#00bfff', '#001a3a']}
                position={[0, 0.02, 0]}
            />

            {/* ── All walls ──────────────────────────────────────────────────── */}
            {ALL_WALLS.map(([cx, cz, hw, hd], i) => (
                <RigidBody
                    key={i}
                    type="fixed"
                    position={[cx, WH / 2, cz]}
                    onCollisionEnter={handleWallHit}
                    userData={{ isMazeWall: true }}
                >
                    <CuboidCollider args={[hw, WH / 2, hd]} />
                    {/* Main wall body */}
                    <mesh castShadow receiveShadow>
                        <boxGeometry args={[hw * 2, WH, hd * 2]} />
                        <meshStandardMaterial
                            color={wallColor}
                            emissive={wallEmissive}
                            emissiveIntensity={0.35}
                            roughness={0.2}
                            metalness={0.8}
                        />
                    </mesh>
                    {/* Glowing top cap */}
                    <mesh position={[0, WH / 2 + 0.06, 0]}>
                        <boxGeometry args={[hw * 2, 0.1, hd * 2]} />
                        <meshBasicMaterial color="#00bfff" transparent opacity={0.7} />
                    </mesh>
                </RigidBody>
            ))}

            {/* ── Exit anti-entry sensor — detects car approaching exit from wrong side ─────────── */}
            <RigidBody type="fixed" colliders={false} sensor
                onIntersectionEnter={(e: any) => {
                    const obj = e.other?.rigidBodyObject;
                    if (!obj?.userData?.isCar) return;

                    const pos = obj.translation();
                    const carZ = (new THREE.Vector3(pos.x, pos.y, pos.z))
                        .sub(new THREE.Vector3(-110, 0, 110))
                        .applyEuler(new THREE.Euler(0, -MAZE_ROT, 0)).z;

                    if (carZ < -18) {
                        respawnToStart();
                    }
                }}
            >
                <CuboidCollider
                    args={[GAP / 2, 2, 1.5]}
                    position={[0, 2, -18 - 1.5]}
                />
            </RigidBody>

            {/* ── TRIGGER SQUARE — in front of south entrance ──────────────── */}
            <group position={[0, 0, 18 + 5]}>

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
            <group position={[0, 0, 18]}>
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
            <group position={[0, 0, -18]}>
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
            <Html position={[0, 7, 18 + 2]} center distanceFactor={14}>
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

            {/* MazeModeModal is a DOM overlay — see components/game/MazeModeModal.tsx */}
        </group>
    );
})
