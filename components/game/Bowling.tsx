"use client";

import { forwardRef, useEffect, useMemo, useRef, useState, memo, useCallback } from "react";
import { CapsuleCollider, RigidBody, CuboidCollider, RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html, useGLTF } from "@react-three/drei";
import { fireAchievement } from "./AchievementToast";
import { StrikeAnimation } from "./StrikeAnimation";
import { getLaneFloorMaterial } from "@/lib/materials";

// Preload so all 10 instances share the same asset fetch
useGLTF.preload('/bowling_pin.glb');

const BOWLING_POS: [number, number, number] = [-45, 0, -45];

// Spacing scale — reduced so the falling tip (height * sin θ) reaches adjacent pins
const LANE_SCALE = 0.85;

// Visual scale of the GLB model; tune if the pin appears too big/small in-world
const PIN_VISUAL_SCALE = 0.35;

// Collider half-extents: tall & narrow so the top sweeps into neighbours when tipping
const COL_HX = 0.07;   // half-width X
const COL_HY = 0.30;   // half-height Y → full height 0.60 units
const COL_HZ = 0.07;   // half-width Z
const COL_Y  = 0.30;   // collider centre Y (= COL_HY, so base sits at 0)

// Standard 10-pin triangle (relative offsets, Y=0 base)
const PIN_POSITIONS: [number, number, number][] = [
    // Row 1 (closest to car approach)
    [ 0,    0,  0   ],
    // Row 2
    [-0.4,  0, -0.75],  [ 0.4, 0, -0.75],
    // Row 3
    [-0.8,  0, -1.5 ],  [ 0,   0, -1.5 ],  [ 0.8, 0, -1.5 ],
    // Row 4
    [-1.2,  0, -2.25],  [-0.4, 0, -2.25],  [ 0.4, 0, -2.25],  [ 1.2, 0, -2.25],
];

// Single GLB instance, cloned per-pin inside useMemo
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
    // position Y=0 assumes the GLB origin is at the base of the pin.
    // If the pin floats or sinks, adjust the Y offset here.
    return <primitive object={cloned} scale={PIN_VISUAL_SCALE} position={[0, 0, 0]} />;
}

const BowlingPin = forwardRef<RapierRigidBody, { position: [number, number, number]; onHit?: () => void }>(
    ({ position, onHit }, ref) => (
        <RigidBody
            ref={ref}
            position={position}
            onCollisionEnter={onHit}
            ccd={true}             // ← CRITICAL: pins can tunnel without this
            mass={0.7}             // lighter = tips easier = more dominos
            linearDamping={0.15}   // very low — pins slide and roll into each other
            angularDamping={0.2}   // tips easily
            restitution={0.45}     // bounces into neighbors
            friction={0.35}
            colliders={false}
        >
            {/* CapsuleCollider: radius=0.13, half-height of cylinder portion=0.35 */}
            {/* Total height = 2*radius + 2*halfHeight = 0.26 + 0.70 = 0.96 ≈ pin body */}
            <CapsuleCollider
                args={[0.35, 0.13]}     // [halfHeight of cylinder, radius]
                position={[0, 0.48, 0]} // centered vertically on pin
            />
            <PinModel />
        </RigidBody>
    )
);
BowlingPin.displayName = 'BowlingPin';

// ─── Lane geometry ────────────────────────────────────────────────────────────
const LW         = 3.8;   // playable lane width
const GW         = 0.6;   // gutter channel width each side
const WALL_H     = 0.55;  // outer bumper-wall height
const WALL_T     = 0.12;  // wall thickness
const LANE_SURF  = 0.008; // lane visual sits just above the physics ground
const Z_APPROACH = BOWLING_POS[2] + 24;   // -21 — far approach end (where car starts)
const Z_PINDECK  = BOWLING_POS[2] - 6.0; // -51 — well behind the last pin row
const LANE_LEN   = Z_APPROACH - Z_PINDECK; // ≈26.6
const LANE_ZC    = (Z_APPROACH + Z_PINDECK) / 2;
const CX         = BOWLING_POS[0];

// Seven targeting arrows; standard positions at ~15ft (≈4.6m) from foul line
const ARROW_Z    = BOWLING_POS[2] + 8;
const ARROW_XS   = [-3, -1.5, -0.75, 0, 0.75, 1.5, 3].map(o => CX + o * (LW / 6));

function BowlingLane() {
    return (
        <group>
            {/* ── Main lane surface ── */}
            <RigidBody type="fixed" friction={0.05} restitution={0.2}>
                <mesh position={[CX, LANE_SURF, LANE_ZC]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[LW, LANE_LEN]} />
                    {/* VISUAL FIX: Matte wood look, not chrome */}
                    <meshStandardMaterial {...getLaneFloorMaterial()} color="#c49a3c" />
                </mesh>
            </RigidBody>

            {/* ── Oil-pattern centre strip (slightly shinier) ── */}
            <mesh position={[CX, LANE_SURF + 0.001, LANE_ZC]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[LW * 0.38, LANE_LEN * 0.85]} />
                <meshStandardMaterial color="#d4ae58" roughness={0.08} metalness={0.12} transparent opacity={0.55} />
            </mesh>

            {/* ── Pin-deck highlight (lighter maple at the pin end) ── */}
            <mesh position={[CX, LANE_SURF + 0.001, BOWLING_POS[2] - 1.3]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[LW, 3.4]} />
                <meshStandardMaterial color="#e0c070" roughness={0.18} metalness={0.08} />
            </mesh>

            {/* ── Foul line ── */}
            <mesh position={[CX, LANE_SURF + 0.002, Z_APPROACH - 2.5]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[LW + GW * 2, 0.09]} />
                <meshStandardMaterial color="#111111" roughness={0.4} />
            </mesh>

            {/* ── Approach apron (wider, behind foul line) ── */}
            <mesh position={[CX, LANE_SURF - 0.001, Z_APPROACH - 1.2]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[LW * 2.8, 2.4]} />
                <meshStandardMaterial color="#3d3022" roughness={0.6} metalness={0.02} />
            </mesh>

            {/* ── Left gutter ── */}
            <mesh position={[CX - LW / 2 - GW / 2, LANE_SURF - 0.003, LANE_ZC]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[GW, LANE_LEN]} />
                <meshStandardMaterial color="#5a4820" roughness={0.55} metalness={0.0} />
            </mesh>

            {/* ── Right gutter ── */}
            <mesh position={[CX + LW / 2 + GW / 2, LANE_SURF - 0.003, LANE_ZC]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[GW, LANE_LEN]} />
                <meshStandardMaterial color="#5a4820" roughness={0.55} metalness={0.0} />
            </mesh>

            {/* ── Targeting arrows (7 small triangles, pointing toward pins) ── */}
            {ARROW_XS.map((ax, i) => (
                <mesh key={i} position={[ax, LANE_SURF + 0.003, ARROW_Z]} rotation={[-Math.PI / 2, 0, Math.PI]}>
                    <coneGeometry args={[0.08, 0.28, 3]} />
                    <meshStandardMaterial color="#e8c04a" roughness={0.3} />
                </mesh>
            ))}

            {/* ── Dot markers at the approach (range finders) ── */}
            {[-2, -1, 0, 1, 2].map((o, i) => (
                <mesh key={i} position={[CX + o * (LW / 4.5), LANE_SURF + 0.003, Z_APPROACH - 4.5]} rotation={[-Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[0.055, 12]} />
                    <meshStandardMaterial color="#e8c04a" roughness={0.3} />
                </mesh>
            ))}

            {/* ── Left outer bumper wall (physical) ── */}
            <RigidBody type="fixed" friction={0.3} restitution={0.3}>
                <mesh position={[CX - LW / 2 - GW - WALL_T / 2, WALL_H / 2, LANE_ZC]} castShadow>
                    <boxGeometry args={[WALL_T, WALL_H, LANE_LEN]} />
                    <meshStandardMaterial color="#2a1f10" roughness={0.8} />
                </mesh>
                <CuboidCollider args={[WALL_T / 2, WALL_H / 2, LANE_LEN / 2]}
                    position={[CX - LW / 2 - GW - WALL_T / 2, WALL_H / 2, LANE_ZC]} />
            </RigidBody>

            {/* ── Right outer bumper wall (physical) ── */}
            <RigidBody type="fixed" friction={0.3} restitution={0.3}>
                <mesh position={[CX + LW / 2 + GW + WALL_T / 2, WALL_H / 2, LANE_ZC]} castShadow>
                    <boxGeometry args={[WALL_T, WALL_H, LANE_LEN]} />
                    <meshStandardMaterial color="#2a1f10" roughness={0.8} />
                </mesh>
                <CuboidCollider args={[WALL_T / 2, WALL_H / 2, LANE_LEN / 2]}
                    position={[CX + LW / 2 + GW + WALL_T / 2, WALL_H / 2, LANE_ZC]} />
            </RigidBody>

            {/* ── Pin-setter back wall — moved well behind the last pin row ── */}
            <RigidBody type="fixed" friction={0.5} restitution={0.15}>
                <mesh position={[CX, WALL_H / 2, Z_PINDECK]} castShadow>
                    <boxGeometry args={[LW + GW * 2 + WALL_T * 2, WALL_H * 2, WALL_T]} />
                    <meshStandardMaterial color="#1a1208" roughness={0.9} />
                </mesh>
                <CuboidCollider args={[(LW + GW * 2 + WALL_T * 2) / 2, WALL_H, WALL_T / 2]}
                    position={[CX, WALL_H, Z_PINDECK]} />
            </RigidBody>

            {/* ── Lane edge stripe — left ── */}
            <mesh position={[CX - LW / 2 + 0.06, LANE_SURF + 0.002, LANE_ZC]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.06, LANE_LEN]} />
                <meshStandardMaterial color="#ffffff" roughness={0.3} transparent opacity={0.6} />
            </mesh>

            {/* ── Lane edge stripe — right ── */}
            <mesh position={[CX + LW / 2 - 0.06, LANE_SURF + 0.002, LANE_ZC]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.06, LANE_LEN]} />
                <meshStandardMaterial color="#ffffff" roughness={0.3} transparent opacity={0.6} />
            </mesh>
        </group>
    );
}
// ──────────────────────────────────────────────────────────────────────────────

export const Bowling = memo(function Bowling() {
    const pinRefs = useRef<RapierRigidBody[]>([]);
    const [isResetting, setIsResetting] = useState(false);
    const [pinsDown, setPinsDown] = useState(0);
    const [showStrike, setShowStrike] = useState(false);
    const lastPinsDown = useRef(0);
    const settleUntil = useRef<number>(0);
    // Populated after first render so performance.now() is safe client-side
    useEffect(() => { settleUntil.current = performance.now() + 2500; }, []);
    const pinNotifTimer     = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hitFlagRef        = useRef(false);
    const debounceRef       = useRef<ReturnType<typeof setTimeout> | null>(null);
    const strikeShownRef    = useRef(false);   // prevents firing game:clear twice

    // COL_Y - COL_HY = 0.30 - 0.30 = 0 in local space, so collider bottom is exactly at
    // the RigidBody's world Y. Spawn at 0.005 to avoid exact-zero ground intersection.
    const PIN_SPAWN_Y = 0.005;

    const pinWorldPositions = useMemo<[number, number, number][]>(
        () => PIN_POSITIONS.map(([x, , z]) => [
            BOWLING_POS[0] + x * LANE_SCALE, PIN_SPAWN_Y, BOWLING_POS[2] + z * LANE_SCALE,
        ]), []
    );

    const resetPins = useCallback(() => {
        if (pinNotifTimer.current) { clearTimeout(pinNotifTimer.current); pinNotifTimer.current = null; }
        setIsResetting(true);
        setTimeout(() => {
            pinRefs.current.forEach((pin, i) => {
                if (!pin) return;
                const [wx, wy, wz] = pinWorldPositions[i];
                pin.setTranslation({ x: wx, y: wy, z: wz }, true);
                pin.setLinvel({ x: 0, y: 0, z: 0 }, true);
                pin.setAngvel({ x: 0, y: 0, z: 0 }, true);
                pin.setRotation({ x: 0, y: (Math.random() * 0.2 - 0.1), z: 0, w: 1 }, true);
                pin.sleep();
            });
            lastPinsDown.current = 0;
            settleUntil.current = performance.now() + 2000;
            setPinsDown(0);
            setShowStrike(false);
            strikeShownRef.current = false;
            setIsResetting(false);
        }, 50);
    }, [pinWorldPositions]);

    // Called on every pin's onCollisionEnter — debounced 5s sliding window
    // Every new collision cancels + restarts the timer (last hit starts the clock)
    const onPinHit = useCallback(() => {
        hitFlagRef.current = true;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            // Score snapshot at reset time — pins have had 5s to settle
            // Strike was already shown in useFrame; only handle non-strike notification here
            let finalCount = 0;
            pinRefs.current.forEach(pin => {
                if (!pin) return;
                const rot = pin.rotation();
                const pos = pin.translation();
                const tilt = Math.abs(rot.x) + Math.abs(rot.z);
                if (tilt > 0.52 || pos.y < -0.3) finalCount++;
            });
            if (finalCount < 10 && finalCount > 0) {
                fireAchievement({ type: 'bowling', title: 'PINS DOWN', value: `${finalCount}/10`, subtext: finalCount >= 7 ? '🎳 Great shot!' : finalCount >= 4 ? 'Nice hit!' : 'Keep going!', color: '#ffcc00', duration: 2500 });
            }
            hitFlagRef.current  = false;
            debounceRef.current = null;
            resetPins();
        }, 5000);
    }, [resetPins]);

    useEffect(() => {
        const h = () => resetPins();
        window.addEventListener('resetBowlingPins', h);
        // Cheat: auto-strike — smash all pins with a large impulse
        const onStrike = () => {
            pinRefs.current.forEach(pin => {
                if (!pin) return;
                pin.applyImpulse({ x: (Math.random() - 0.5) * 0.5, y: 2.5, z: -4 }, true)
                pin.applyTorqueImpulse({ x: (Math.random() - 0.5) * 2, y: 0, z: (Math.random() - 0.5) * 2 }, true)
            })
        }
        window.addEventListener('cheat:auto-strike', onStrike);
        return () => {
            window.removeEventListener('resetBowlingPins', h);
            window.removeEventListener('cheat:auto-strike', onStrike);
            if (debounceRef.current) clearTimeout(debounceRef.current);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useFrame(() => {
        if (isResetting || pinRefs.current.length < 10) return;
        if (performance.now() < settleUntil.current) return;
        // HUD counter — and immediate strike detection as soon as all 10 are down
        let fallenCount = 0;
        pinRefs.current.forEach(pin => {
            if (!pin) return;
            const rot = pin.rotation();
            const pos = pin.translation();
            const tilt = Math.abs(rot.x) + Math.abs(rot.z);
            if (tilt > 0.52 || pos.y < -0.3) fallenCount++;
        });
        if (fallenCount !== lastPinsDown.current) {
            lastPinsDown.current = fallenCount;
            setPinsDown(fallenCount);
        }
        // Strike: show banner immediately when all 10 fall, don't wait for reset timer
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
                <BowlingPin key={i} position={pos} onHit={onPinHit} ref={(el) => { if (el) pinRefs.current[i] = el; }} />
            ))}
            <Html position={[BOWLING_POS[0], 5, BOWLING_POS[2] - 1]} center distanceFactor={14}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", textAlign: 'center', background: 'rgba(5,5,20,0.88)', border: '1px solid rgba(255,204,0,0.3)', borderRadius: '10px', padding: '0.4rem 0.9rem', pointerEvents: 'none', minWidth: '100px' }}>
                    <div style={{ fontSize: '8px', color: 'rgba(255,204,0,0.6)', letterSpacing: '0.14em' }}>BOWLING</div>
                    <div style={{ fontSize: '18px', color: '#ffcc00', fontWeight: 800, lineHeight: 1.2 }}>{pinsDown}/10</div>
                </div>
            </Html>
            {/* Strike banner in 3D space — floats above the pin deck, faces the approach */}
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
})
