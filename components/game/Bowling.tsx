"use client";

import { forwardRef, useEffect, useMemo, useRef, useState, memo, useCallback } from "react";
import { CapsuleCollider, RigidBody, CuboidCollider, RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html, useGLTF } from "@react-three/drei";
import { fireAchievement } from "./AchievementToast";
import { StrikeAnimation } from "./StrikeAnimation";
import { getLaneFloorMaterial } from "@/lib/materials";

useGLTF.preload('/bowling_pin.glb');

const BOWLING_POS: [number, number, number] = [-45, 0, -45];
const LANE_SCALE = 0.85;
const PIN_VISUAL_SCALE = 0.35;
const COL_HX = 0.07;
const COL_HY = 0.30;
const COL_HZ = 0.07;
const COL_Y = 0.30;

const PIN_POSITIONS: [number, number, number][] = [
    [0, 0, 0],
    [-0.4, 0, -0.75], [0.4, 0, -0.75],
    [-0.8, 0, -1.5], [0, 0, -1.5], [0.8, 0, -1.5],
    [-1.2, 0, -2.25], [-0.4, 0, -2.25], [0.4, 0, -2.25], [1.2, 0, -2.25],
];

function PinModel() {
    const { scene } = useGLTF('/bowling_pin.glb');
    const cloned = useMemo(() => {
        const c = scene.clone(true);
        c.traverse((child: unknown) => {
            const mesh = child as THREE.Mesh;
            if (mesh.isMesh) { mesh.castShadow = true; mesh.receiveShadow = true; }
        });
        return c;
    }, [scene]);
    return <primitive object={cloned} scale={PIN_VISUAL_SCALE} position={[0, 0, 0]} />;
}

const BowlingPin = forwardRef<RapierRigidBody, { position: [number, number, number]; onHit?: () => void }>(
    ({ position, onHit }, ref) => (
        <RigidBody
            ref={ref}
            position={position}
            onCollisionEnter={onHit}
            ccd={true}
            mass={0.7}
            linearDamping={0.15}
            angularDamping={0.2}
            restitution={0.45}
            friction={0.35}
            colliders={false}
        >
            <CapsuleCollider
                args={[0.35, 0.13]}
                position={[0, 0.48, 0]}
            />
            <PinModel />
        </RigidBody>
    )
);
BowlingPin.displayName = 'BowlingPin';

const LW = 3.8;
const GW = 0.6;
const WALL_H = 0.55;
const WALL_T = 0.12;
const LANE_SURF = 0.008;
const Z_APPROACH = BOWLING_POS[2] + 24;
const Z_PINDECK = BOWLING_POS[2] - 6.0;
const LANE_LEN = Z_APPROACH - Z_PINDECK;
const LANE_ZC = (Z_APPROACH + Z_PINDECK) / 2;
const CX = BOWLING_POS[0];
const ARROW_Z = BOWLING_POS[2] + 8;
const ARROW_XS = [-3, -1.5, -0.75, 0, 0.75, 1.5, 3].map(o => CX + o * (LW / 6));

function BowlingLane() {
    return (
        <group>
            <RigidBody type="fixed" friction={0.05} restitution={0.2}>
                <mesh position={[CX, LANE_SURF, LANE_ZC]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[LW, LANE_LEN]} />
                    <meshStandardMaterial {...getLaneFloorMaterial()} color="#c49a3c" />
                </mesh>
            </RigidBody>
            <mesh position={[CX, LANE_SURF + 0.001, LANE_ZC]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[LW * 0.38, LANE_LEN * 0.85]} />
                <meshStandardMaterial color="#d4ae58" roughness={0.08} metalness={0.12} transparent opacity={0.55} />
            </mesh>
            <mesh position={[CX, LANE_SURF + 0.001, BOWLING_POS[2] - 1.3]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[LW, 3.4]} />
                <meshStandardMaterial color="#e0c070" roughness={0.18} metalness={0.08} />
            </mesh>
            <mesh position={[CX, LANE_SURF + 0.002, Z_APPROACH - 2.5]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[LW + GW * 2, 0.09]} />
                <meshStandardMaterial color="#111111" roughness={0.4} />
            </mesh>
            <mesh position={[CX, LANE_SURF - 0.001, Z_APPROACH - 1.2]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[LW * 2.8, 2.4]} />
                <meshStandardMaterial color="#3d3022" roughness={0.6} metalness={0.02} />
            </mesh>
            <mesh position={[CX - LW / 2 - GW / 2, LANE_SURF - 0.003, LANE_ZC]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[GW, LANE_LEN]} />
                <meshStandardMaterial color="#5a4820" roughness={0.55} metalness={0.0} />
            </mesh>
            <mesh position={[CX + LW / 2 + GW / 2, LANE_SURF - 0.003, LANE_ZC]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[GW, LANE_LEN]} />
                <meshStandardMaterial color="#5a4820" roughness={0.55} metalness={0.0} />
            </mesh>
            {ARROW_XS.map((ax, i) => (
                <mesh key={i} position={[ax, LANE_SURF + 0.003, ARROW_Z]} rotation={[-Math.PI / 2, 0, Math.PI]}>
                    <coneGeometry args={[0.08, 0.28, 3]} />
                    <meshStandardMaterial color="#e8c04a" roughness={0.3} />
                </mesh>
            ))}
            {[-2, -1, 0, 1, 2].map((o, i) => (
                <mesh key={i} position={[CX + o * (LW / 4.5), LANE_SURF + 0.003, Z_APPROACH - 4.5]} rotation={[-Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[0.055, 12]} />
                    <meshStandardMaterial color="#e8c04a" roughness={0.3} />
                </mesh>
            ))}
            <RigidBody type="fixed" friction={0.3} restitution={0.3}>
                <mesh position={[CX - LW / 2 - GW - WALL_T / 2, WALL_H / 2, LANE_ZC]} castShadow>
                    <boxGeometry args={[WALL_T, WALL_H, LANE_LEN]} />
                    <meshStandardMaterial color="#2a1f10" roughness={0.8} />
                </mesh>
                <CuboidCollider args={[WALL_T / 2, WALL_H / 2, LANE_LEN / 2]}
                    position={[CX - LW / 2 - GW - WALL_T / 2, WALL_H / 2, LANE_ZC]} />
            </RigidBody>
            <RigidBody type="fixed" friction={0.3} restitution={0.3}>
                <mesh position={[CX + LW / 2 + GW + WALL_T / 2, WALL_H / 2, LANE_ZC]} castShadow>
                    <boxGeometry args={[WALL_T, WALL_H, LANE_LEN]} />
                    <meshStandardMaterial color="#2a1f10" roughness={0.8} />
                </mesh>
                <CuboidCollider args={[WALL_T / 2, WALL_H / 2, LANE_LEN / 2]}
                    position={[CX + LW / 2 + GW + WALL_T / 2, WALL_H / 2, LANE_ZC]} />
            </RigidBody>
            <RigidBody type="fixed" friction={0.5} restitution={0.15}>
                <mesh position={[CX, WALL_H / 2, Z_PINDECK]} castShadow>
                    <boxGeometry args={[LW + GW * 2 + WALL_T * 2, WALL_H * 2, WALL_T]} />
                    <meshStandardMaterial color="#1a1208" roughness={0.9} />
                </mesh>
                <CuboidCollider args={[(LW + GW * 2 + WALL_T * 2) / 2, WALL_H, WALL_T / 2]}
                    position={[CX, WALL_H, Z_PINDECK]} />
            </RigidBody>
            <mesh position={[CX - LW / 2 + 0.06, LANE_SURF + 0.002, LANE_ZC]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.06, LANE_LEN]} />
                <meshStandardMaterial color="#ffffff" roughness={0.3} transparent opacity={0.6} />
            </mesh>
            <mesh position={[CX + LW / 2 - 0.06, LANE_SURF + 0.002, LANE_ZC]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.06, LANE_LEN]} />
                <meshStandardMaterial color="#ffffff" roughness={0.3} transparent opacity={0.6} />
            </mesh>
        </group>
    );
}

export const Bowling = memo(function Bowling() {
    const pinRefs = useRef<RapierRigidBody[]>([]);
    const [isResetting, setIsResetting] = useState(false);
    const [pinsDown, setPinsDown] = useState(0);
    const [showStrike, setShowStrike] = useState(false);
    const lastPinsDown = useRef(0);
    const settleUntil = useRef<number>(0);
    useEffect(() => { settleUntil.current = performance.now() + 2500; }, []);
    const strikeShownRef = useRef(false);
    const resetTimer = useRef(0);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── NEW: track whether the car has collided with the BALL/LANE
    // rather than individual pin-pin collisions.
    // We fire the notification once, 1.2s after the FIRST pin is hit,
    // then lock out further notifications until reset.
    const notifFiredRef = useRef(false);
    const notifTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const PIN_SPAWN_Y = 0.005;

    const pinWorldPositions = useMemo<[number, number, number][]>(
        () => PIN_POSITIONS.map(([x, , z]) => [
            BOWLING_POS[0] + x * LANE_SCALE, PIN_SPAWN_Y, BOWLING_POS[2] + z * LANE_SCALE,
        ]), []
    );

    // ── FIXED resetPins ──────────────────────────────────────────────────────
    // Pattern: wakeUp all → rAF → setTranslation/Rotation/Vel → rAF×2 → sleep all
    // The two nested rAFs ensure Rapier has processed the wake and position writes
    // before we put them to sleep. Without them, sleep() cancels the position write.
    const resetPins = useCallback(() => {
        // Clear all pending timers immediately
        if (debounceRef.current) { clearTimeout(debounceRef.current); debounceRef.current = null; }
        if (notifTimer.current) { clearTimeout(notifTimer.current); notifTimer.current = null; }

        setIsResetting(true);
        lastPinsDown.current = 0;
        setPinsDown(0);
        setShowStrike(false);
        strikeShownRef.current = false;
        notifFiredRef.current = false;
        resetTimer.current = 0;

        // ── Step 1: wake everything ──────────────────────────────────────
        pinRefs.current.forEach(pin => pin?.wakeUp());

        // ── Step 2: one rAF later — write positions (Rapier has processed wake)
        requestAnimationFrame(() => {
            pinRefs.current.forEach((pin, i) => {
                if (!pin) return;
                const [wx, wy, wz] = pinWorldPositions[i];
                pin.setLinvel({ x: 0, y: 0, z: 0 }, true);
                pin.setAngvel({ x: 0, y: 0, z: 0 }, true);
                pin.setTranslation({ x: wx, y: wy, z: wz }, true);
                pin.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
            });

            // ── Step 3: two rAFs later — sleep (Rapier has processed positions)
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    pinRefs.current.forEach(pin => pin?.sleep());
                    settleUntil.current = performance.now() + 2000;
                    // Un-block useFrame counting 200ms after sleep
                    setTimeout(() => setIsResetting(false), 200);
                });
            });
        });
    }, [pinWorldPositions]);

    // ── FIXED onPinHit ───────────────────────────────────────────────────────
    // Only fires notification ONCE per throw (notifFiredRef gate).
    // 1.4s debounce from first hit — by then all dominos have settled.
    // Counts pins at notification time (accurate final state).
    const onPinHit = useCallback(() => {
        // Already notified this throw, or currently resetting → ignore
        if (notifFiredRef.current || isResetting) return;
        // Ignore during settle period (false positives on spawn)
        if (performance.now() < settleUntil.current) return;

        // Debounce from first hit: cancel any pending, restart timer
        if (notifTimer.current) clearTimeout(notifTimer.current);

        notifTimer.current = setTimeout(() => {
            // Lock: no more notifications until next reset
            notifFiredRef.current = true;
            notifTimer.current = null;

            // Count fallen at notification time
            let fallen = 0;
            pinRefs.current.forEach(pin => {
                if (!pin) return;
                const rot = pin.rotation();
                const pos = pin.translation();
                if (Math.abs(rot.x) + Math.abs(rot.z) > 0.52 || pos.y < -0.3) fallen++;
            });

            // Don't toast for 0 fallen or if it's already a strike (strike banner handles that)
            if (fallen > 0 && fallen < 10) {
                fireAchievement({
                    type: 'bowling',
                    title: 'PINS DOWN',
                    value: `${fallen}/10`,
                    subtext: fallen >= 7 ? '🎳 Great shot!' : fallen >= 4 ? 'Nice hit!' : 'Keep going!',
                    color: '#ffcc00',
                    duration: 2500,
                });
            }
        }, 1400); // 1.4s — domino chain always finishes within this window
    }, [isResetting]);

    useEffect(() => {
        const onStrike = () => {
            pinRefs.current.forEach(pin => {
                if (!pin) return;
                pin.wakeUp();
                pin.setLinvel({ x: (Math.random() - 0.5) * 4, y: 3, z: (Math.random() - 0.5) * 4 }, true);
                pin.setAngvel({ x: Math.random() * 6, y: Math.random() * 6, z: Math.random() * 6 }, true);
            });
        };

        const onResetEvent = () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(resetPins, 2500);
        };

        window.addEventListener('resetBowlingPins', onResetEvent);
        window.addEventListener('cheat:auto-strike', onStrike);

        return () => {
            window.removeEventListener('resetBowlingPins', onResetEvent);
            window.removeEventListener('cheat:auto-strike', onStrike);
            if (notifTimer.current) clearTimeout(notifTimer.current);
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [resetPins]);

    useFrame((_, dt) => {
        if (isResetting || pinRefs.current.length < 10) return;
        if (performance.now() < settleUntil.current) return;

        let fallenCount = 0;
        pinRefs.current.forEach(pin => {
            if (!pin) return;
            const rot = pin.rotation();
            const pos = pin.translation();
            if (Math.abs(rot.x) + Math.abs(rot.z) > 0.52 || pos.y < -0.3) fallenCount++;
        });

        if (fallenCount !== lastPinsDown.current) {
            lastPinsDown.current = fallenCount;
            setPinsDown(fallenCount);
        }

        if (fallenCount > 0) {
            resetTimer.current += dt;
            if (resetTimer.current >= 5.0) {
                resetPins();
            }
        } else {
            resetTimer.current = 0;
        }

        if (fallenCount === 10 && !strikeShownRef.current) {
            strikeShownRef.current = true;
            setShowStrike(true);
            window.dispatchEvent(new CustomEvent('game:clear', { detail: { game: 'bowling' } }));
        }
    });

    return (
        <>
            <BowlingLane />
            {pinWorldPositions.map((pos, i) => (
                <BowlingPin
                    key={i}
                    position={pos}
                    onHit={onPinHit}
                    ref={(el) => { if (el) pinRefs.current[i] = el; }}
                />
            ))}
            <Html position={[BOWLING_POS[0], 5, BOWLING_POS[2] - 1]} center distanceFactor={14}>
                <div style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    textAlign: 'center',
                    background: 'rgba(5,5,20,0.88)',
                    border: '1px solid rgba(255,204,0,0.3)',
                    borderRadius: '10px',
                    padding: '0.4rem 0.9rem',
                    pointerEvents: 'none',
                    minWidth: '100px',
                }}>
                    <div style={{ fontSize: '8px', color: 'rgba(255,204,0,0.6)', letterSpacing: '0.14em' }}>BOWLING</div>
                    <div style={{ fontSize: '18px', color: '#ffcc00', fontWeight: 800, lineHeight: 1.2 }}>{pinsDown}/10</div>
                </div>
            </Html>
            {showStrike && (
                <Html
                    position={[BOWLING_POS[0], 1.8, BOWLING_POS[2] - 3]}
                    center
                    distanceFactor={12}
                    style={{ pointerEvents: 'none' }}
                >
                    <StrikeAnimation onDone={() => setShowStrike(false)} />
                </Html>
            )}
        </>
    );
});