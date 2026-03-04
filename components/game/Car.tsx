"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls, useGLTF } from "@react-three/drei";
import { RigidBody, RapierRigidBody, CuboidCollider, useRapier } from "@react-three/rapier";
import * as THREE from "three";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { mobileInput } from "@/components/game/MobileControls";
import { getProfileSync } from "@/lib/deviceTier";
import { getCarBodyMaterial } from "@/lib/materials";

// ── Rocket League Tuning ─────────────────────────────────────────────────────
const TOP_SPEED = 18
const ACCEL = 0.10     // was 0.15 — heavier feel
const BRAKE = 0.15     // was 0.12
const COAST_DECEL = 0.025    // was 0.04 — longer momentum
const REVERSE_SPEED = 8
const WHEELBASE = 3.2    // virtual wheelbase length — controls turn radius feel
const MAX_STEER_ANGLE = 0.52   // was 0.55
const STEER_SPEED = 9.0    // was 6.0
const STEER_RETURN = 12.0
const BOOST_SPEED = 32
const BOOST_ACCEL = 0.2
const BOOST_DURATION = 2.5
const BOOST_RECHARGE_DIST = 50
const BOOST_DRIVE_TO_RECHARGE = 4.0

const ACCEL_RAMP_UP_TIME = 1.5 // Time to reach full acceleration

// Powerslide
const DRIFT_LATERAL_KEEP = 0.4; // how much lateral velocity to keep during drift (0=full grip, 1=ice)
const NORMAL_LATERAL_KEEP = 0.05; // very tight grip normally
// ─────────────────────────────────────────────────────────────────────────────

// ── Maze mode flag: disables R-key reset while inside maze ─────────────────
let _inMaze = false

// ── Cheat flags (module-level so useFrame reads them without closure stale issues) ──
let _infiniteBoost = false
let _maxSpeedActive = false
let _maxSpeedTimer = 0

// ── Shared game state — plain object, never in Zustand ─────────────────────
// Write here in useFrame (60fps), read by HUD/TurboVignette at 10-20fps poll.
export const gameState = {
    speed: 0,        // raw m/s (unsigned)
    turboCharge: 0,  // 0..1
}

export function Car() {
    const carRef = useRef<RapierRigidBody>(null);
    const { world } = useRapier();
    const [, getKeys] = useKeyboardControls();
    const [ready, setReady] = useState(false);
    const [showFlames, setShowFlames] = useState(false);
    const cameraTarget = useRef(new THREE.Vector3());
    const currentSpeed = useRef(0);
    const forwardDriveTime = useRef(0); // For linear acceleration ramp

    // Deterministic rotation
    const yaw = useRef(0);
    const steerAngle = useRef(0)   // current physical wheel angle in radians
    const steerInput = useRef(0)   // keep this for any visual use (wheel animation etc)
    const smoothedSteerInput = useRef(0) // low-pass filter for thumb jitters

    // Speed trails
    const trailPositions = useRef<THREE.Vector3[]>([]);

    // Spawn cinematic
    const spawning = useRef(true);
    const spawnTimer = useRef(0);
    const SPAWN_DURATION = 1.5;

    // Turbo state
    const boostCharge = useRef(1.0);
    const boostActive = useRef(false);
    const boostTimer = useRef(0);
    const driveTimeAccum = useRef(0);

    const mobileTurbo = usePortfolioStore(s => s.mobileTurbo);
    const teleportTarget = usePortfolioStore(s => s.teleportTarget);
    const setTeleportTarget = usePortfolioStore(s => s.setTeleportTarget);

    // Wait for physics world to register ground
    useEffect(() => {
        const t = setTimeout(() => setReady(true), 800);
        return () => clearTimeout(t);
    }, []);

    const controlsFrozen = useRef(false);

    useEffect(() => {
        const handler = (e: Event) => {
            const { x, y, z, rotationY } = (e as CustomEvent<{
                x: number; y: number; z: number; rotationY: number
            }>).detail;

            const body = carRef.current;
            if (!body) return;

            // 1. Zero out velocity first
            body.setLinvel({ x: 0, y: 0, z: 0 }, true);
            body.setAngvel({ x: 0, y: 0, z: 0 }, true);

            // 2. Set position
            body.setTranslation({ x, y, z }, true);

            // 3. Set rotation as quaternion
            const halfAngle = rotationY / 2;
            body.setRotation(
                { x: 0, y: Math.sin(halfAngle), z: 0, w: Math.cos(halfAngle) },
                true
            );
            
            // Sync internal yaw state
            yaw.current = rotationY;

            // 4. Reset internal speed states
            currentSpeed.current = 0;
            forwardDriveTime.current = 0;

            // CONTROL DRIFT FIX: Clear all mobile input state on teleport/reset
            mobileInput.forward = false;
            mobileInput.brake   = false;
            mobileInput.backward = false;
            mobileInput.left    = false;
            mobileInput.right   = false;
            mobileInput.boost   = false;
            mobileInput.steerX  = 0;
            mobileInput.throttleY = 0;
        };

        window.addEventListener('car:teleport', handler);
        return () => window.removeEventListener('car:teleport', handler);
    }, []);

    useEffect(() => {
        const onReset = () => {
            const body = carRef.current;
            if (!body) return;
            const pos = body.translation();
            const rot = body.rotation();
            const currentY = 2 * Math.atan2(rot.y, rot.w);
            
            window.dispatchEvent(new CustomEvent('car:teleport', {
                detail: { x: pos.x, y: pos.y + 2.5, z: pos.z, rotationY: currentY }
            }));
        };
        window.addEventListener('car:reset', onReset);

        const onFreeze = (e: Event) => {
            controlsFrozen.current = (e as CustomEvent).detail.frozen;
            if (controlsFrozen.current && carRef.current) {
                carRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
                carRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
            }
        };
        window.addEventListener('game:freeze-controls', onFreeze);

        return () => {
            window.removeEventListener('car:reset', onReset);
            window.removeEventListener('game:freeze-controls', onFreeze);
        }
    }, []);

    useFrame((state, delta) => {
        const body = carRef.current;
        if (!body) return;

        // Hold in place until physics settles
        if (!ready) {
            body.setTranslation({ x: 0, y: 2, z: 0 }, true);
            body.setLinvel({ x: 0, y: 0, z: 0 }, true);
            body.setAngvel({ x: 0, y: 0, z: 0 }, true);
            return;
        }

        const dt = Math.min(delta, 0.05);

        if (controlsFrozen.current) {
            currentSpeed.current = 0;
            forwardDriveTime.current = 0;
            return;
        }

        // ── Spawn cinematic ──────────────────────────────────────────────
        if (spawning.current) {
            spawnTimer.current += dt;
            const t = Math.min(spawnTimer.current / SPAWN_DURATION, 1);
            const pos = body.translation();
            const camY = THREE.MathUtils.lerp(18, 6, t * t);
            state.camera.position.set(pos.x, camY, pos.z + 10);
            cameraTarget.current.set(pos.x, pos.y + 0.5, pos.z);
            state.camera.lookAt(cameraTarget.current);
            if (t >= 1) spawning.current = false;
            return;
        }

        const keys = getKeys()

        // ── Merge keyboard + Bruno Simon one-finger touch ────────────────────────
        const isForward = keys.forward || mobileInput.forward;
        const isBrake = keys.backward || mobileInput.backward;
        const isBoost = keys.boost || mobileInput.boost;

        // Analog steer: proportional value from touch
        const targetSteerRaw = Math.abs(mobileInput.steerX) > 0.05
            ? -mobileInput.steerX          // analog from touch
            : (keys.left ? 1 : keys.right ? -1 : 0); // digital keyboard fallback

        // Low-pass filter to kill high-frequency thumb trembling
        smoothedSteerInput.current = THREE.MathUtils.lerp(
            smoothedSteerInput.current,
            targetSteerRaw,
            1 - Math.exp(-15 * dt)
        );

        const steerInputRaw = smoothedSteerInput.current;

        // Analog throttle from touch
        const touchThrottle = mobileInput.throttleY;
        const isForwardAnalog = isForward || touchThrottle > 0.15;
        const isBrakeAnalog = isBrake || touchThrottle < -0.15;

        const shouldBoost = isBoost || mobileTurbo;
        // ────────────────────────────────────────────────────────────────────────

        // ── Cheat: max speed timer tick ──────────────────────────────────
        if (_maxSpeedActive) {
            _maxSpeedTimer -= dt;
            if (_maxSpeedTimer <= 0) { _maxSpeedActive = false; _maxSpeedTimer = 0; }
        }
        const effectiveTopSpeed   = _maxSpeedActive ? TOP_SPEED * 3   : TOP_SPEED;
        const effectiveBoostSpeed = _maxSpeedActive ? BOOST_SPEED * 3 : BOOST_SPEED;

        // ── Speed ────────────────────────────────────────────────────────
        const maxSpeed = boostActive.current ? effectiveBoostSpeed : effectiveTopSpeed;
        const accel = boostActive.current ? BOOST_ACCEL : ACCEL;

        let targetSpeed = 0;
        if (isForwardAnalog) {
            forwardDriveTime.current += dt;
            const rampProgress = Math.min(1.0, forwardDriveTime.current / ACCEL_RAMP_UP_TIME);
            const engineScale = Math.abs(mobileInput.throttleY) > 0.05 ? Math.abs(mobileInput.throttleY) : 1.0;
            targetSpeed = maxSpeed * engineScale * rampProgress;
        }
        else if (isBrakeAnalog) {
            forwardDriveTime.current = 0;
            // If moving forward, backward = brake first
            if (currentSpeed.current > 1) {
                targetSpeed = 0; // brake
            } else {
                const engineScale = Math.abs(mobileInput.throttleY) > 0.05 ? Math.abs(mobileInput.throttleY) : 1.0;
                targetSpeed = -REVERSE_SPEED * engineScale; // reverse
            }
        }

        // Lerp speed
        if (isForwardAnalog || (isBrakeAnalog && currentSpeed.current <= 1)) {
            currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, targetSpeed, accel);
        } else if (isBrakeAnalog && currentSpeed.current > 1) {
            currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, 0, BRAKE);
        } else {
            // Coasting — gentle deceleration
            forwardDriveTime.current = 0;
            currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, 0, COAST_DECEL);
        }

        // Kill micro-drift
        if (!isForwardAnalog && !isBrakeAnalog && !boostActive.current && Math.abs(currentSpeed.current) < 0.1) {
            currentSpeed.current = 0;
        }

        // ── Boost ────────────────────────────────────────────────────────
        if (!boostActive.current && boostCharge.current < 1.0) {
            if (Math.abs(currentSpeed.current) > 1.0) {
                driveTimeAccum.current += dt;
                boostCharge.current = Math.min(1.0, driveTimeAccum.current / BOOST_DRIVE_TO_RECHARGE);
            }
        }

        if (shouldBoost && boostCharge.current >= 1.0 && !boostActive.current && Math.abs(currentSpeed.current) > 0.5) {
            boostActive.current = true;
            boostTimer.current = BOOST_DURATION;
            boostCharge.current = 0.0;
            driveTimeAccum.current = 0;
            setShowFlames(true);
        }

        // Cheat: infinite boost — keep charge full and boost permanently active
        if (_infiniteBoost) {
            boostCharge.current = 1.0
            if (!boostActive.current && Math.abs(currentSpeed.current) > 0.1) {
                boostActive.current = true
                setShowFlames(true)
            }
            if (boostActive.current) boostTimer.current = BOOST_DURATION // reset timer so it never expires
        }

        if (boostActive.current) {
            boostTimer.current -= dt;
            if (boostTimer.current <= 0) {
                boostActive.current = false;
                setShowFlames(false);
            }
        }

        // ── Steering (Ackermann-style: yaw_rate = speed × steer / wheelbase) ──────
        const absSpeed = Math.abs(currentSpeed.current);

        // Steer ramp — use analog value directly, ramp only for keyboard
        const targetAngle = steerInputRaw * MAX_STEER_ANGLE;

        steerAngle.current = THREE.MathUtils.lerp(
            steerAngle.current,
            targetAngle,
            Math.abs(steerInputRaw) > 0.01
                ? 1 - Math.exp(-STEER_SPEED * dt)    // snap toward target
                : 1 - Math.exp(-STEER_RETURN * dt) // return to center
        );

        // Clamp to max steer angle
        steerAngle.current = THREE.MathUtils.clamp(
            steerAngle.current,
            -MAX_STEER_ANGLE,
            MAX_STEER_ANGLE
        )

        // KEY FORMULA: yaw_rate = (speed / wheelbase) × steerAngle
        // At low speed → tiny yaw. At high speed → large yaw but wide radius.

        // Anti-jitter: gently blend the driveSign through zero rather than a harsh boolean flip.
        // This prevents the car from violently shaking left/right when velocity hovers around 0.
        const speedDampening = Math.min(absSpeed / 1.5, 1.0)
        const driveSign = currentSpeed.current >= 0 ? 1 : -1
        const smoothSign = driveSign * speedDampening

        // Speed-based steer reduction — at high speed, effective steer angle shrinks.
        // Formula: 1/(1 + speed×0.12) → at speed=0: 100% steer, speed=18: ~32% steer
        const steerReduction = 1.0 / (1.0 + absSpeed * 0.10) // Slightly less reduction for tighter turns at speed
        const effectiveSteer = steerAngle.current * steerReduction

        // Raw Ackermann yaw rate, then hard-capped
        const rawYawRate = (absSpeed / WHEELBASE) * effectiveSteer * smoothSign
        const MAX_YAW_RATE = 2.8 // Increased from 2.2 for snappier response
        const yawRate = THREE.MathUtils.clamp(rawYawRate, -MAX_YAW_RATE, MAX_YAW_RATE)

        // Apply yaw change
        yaw.current += yawRate * dt

        // Keep steerInput ref in sync for any UI/visual that reads it
        steerInput.current = steerAngle.current / MAX_STEER_ANGLE  // normalize to [-1, 1]
        // ─────────────────────────────────────────────────────────────────────────────

        // Build quaternion from yaw and SET it directly — no angular velocity
        const quatFromYaw = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(0, yaw.current, 0)
        );
        body.setRotation(
            { x: quatFromYaw.x, y: quatFromYaw.y, z: quatFromYaw.z, w: quatFromYaw.w },
            true
        );
        // Zero out angular velocity since we control rotation directly
        body.setAngvel({ x: 0, y: 0, z: 0 }, true);

        // ── Velocity ─────────────────────────────────────────────────────
        const forwardVec = new THREE.Vector3(0, 0, -1).applyQuaternion(quatFromYaw);
        const driveVel = forwardVec.multiplyScalar(currentSpeed.current);

        // Lateral friction — Rocket League style
        const rightVec = new THREE.Vector3(1, 0, 0).applyQuaternion(quatFromYaw);
        const currentVel = body.linvel();
        const lateralVel = rightVec.dot(new THREE.Vector3(currentVel.x, 0, currentVel.z));
        const isTurning = Math.abs(steerInputRaw) > 0.1;
        const isDrifting = shouldBoost && isTurning; // powerslide during boost + turn
        const lateralKeep = isDrifting ? DRIFT_LATERAL_KEEP : NORMAL_LATERAL_KEEP;

        body.setLinvel({
            x: driveVel.x + rightVec.x * lateralVel * lateralKeep,
            y: currentVel.y, // preserve gravity
            z: driveVel.z + rightVec.z * lateralVel * lateralKeep,
        }, true);

        // Speed Trails
        if (Math.abs(currentSpeed.current) > 8) {
            const p = body.translation();
            trailPositions.current.unshift(new THREE.Vector3(p.x, p.y - 0.2, p.z));
            if (trailPositions.current.length > 6) trailPositions.current.pop();
        }

        // ── Camera (Rocket League chase cam) ─────────────────────────────
        const pos = body.translation();
        const carPos = new THREE.Vector3(pos.x, pos.y, pos.z);
        const camOffset = new THREE.Vector3(0, 2.8, 5.5)
            .applyQuaternion(quatFromYaw)
            .add(carPos);
        camOffset.y = Math.max(camOffset.y, pos.y + 1);

        const camSpeed = boostActive.current ? 5.0 : 4.0;
        state.camera.position.lerp(camOffset, 1 - Math.exp(-camSpeed * dt));
        cameraTarget.current.lerp(
            new THREE.Vector3(pos.x, pos.y + 0.4, pos.z),
            1 - Math.exp(-12 * dt)
        );
        state.camera.lookAt(cameraTarget.current);

        // Boost FOV effect
        const cam = state.camera as THREE.PerspectiveCamera;
        const targetFOV = boostActive.current ? 78 : 55;
        cam.fov = THREE.MathUtils.lerp(cam.fov, targetFOV, 0.08);
        cam.updateProjectionMatrix();

        // ── gameState (plain object — zero React overhead) ────────────────
        gameState.speed = Math.abs(currentSpeed.current);
        gameState.turboCharge = boostCharge.current;

        // Update car position in store for lazy loading
        usePortfolioStore.getState().setCarPos({ x: pos.x, y: pos.y, z: pos.z });

        // ── Fall recovery / Manual Reset ────────────────────────────────────────────────
        if (pos.y < -2 || (keys.reset && !_inMaze)) {
            // If manual reset (keys.reset), pop them UP slightly from their current XZ so they don't fall forever if stuck
            const newY = keys.reset ? Math.max(pos.y + 4, 2) : 2;
            const newX = keys.reset ? pos.x : 0;
            const newZ = keys.reset ? pos.z : 0;
            body.setTranslation({ x: newX, y: newY, z: newZ }, true);
            body.setLinvel({ x: 0, y: 0, z: 0 }, true);
            body.setAngvel({ x: 0, y: 0, z: 0 }, true);
            currentSpeed.current = 0;
            // CONTROL DRIFT FIX: Clear all input on fall recovery / manual reset
            mobileInput.forward = false;
            mobileInput.brake   = false;
            mobileInput.backward = false;
            mobileInput.left    = false;
            mobileInput.right   = false;
            mobileInput.boost   = false;
            mobileInput.steerX  = 0;
            mobileInput.throttleY = 0;
        }
    });

    return (
        <>
            <RigidBody
                ref={carRef}
                userData={{ isCar: true }}
                colliders={false}
                ccd={true}
                mass={45}
                linearDamping={0.3}
                angularDamping={1.2}
                enabledRotations={[false, true, false]}
                friction={1.0}
                position={[0, 2, -5]}
            >
                {/* Main body collider - raised slightly to clear ramp bottoms */}
                <CuboidCollider args={[0.72, 0.22, 1.44]} position={[0, 0.18, 0]} />
                {/* Low belly — reduced to prevent beaching on ramp approach */}
                <CuboidCollider args={[0.58, 0.10, 1.17]} position={[0, -0.01, 0]} />
                <TurboFlames visible={showFlames} />
                <CarBody />
            </RigidBody>
            {trailPositions.current.map((pos, i) => (
                <mesh key={i} position={pos}>
                    <sphereGeometry args={[0.08 - i * 0.01, 4, 4]} />
                    <meshBasicMaterial
                        color={boostActive.current ? '#ff6600' : '#00e676'}
                        transparent
                        opacity={(6 - i) / 8}
                    />
                </mesh>
            ))}
        </>
    );
}

function TurboFlames({ visible }: { visible: boolean }) {
    const flame1 = useRef<THREE.Mesh>(null);
    const flame2 = useRef<THREE.Mesh>(null);
    const inner1 = useRef<THREE.Mesh>(null);
    const inner2 = useRef<THREE.Mesh>(null);
    const light = useRef<THREE.PointLight>(null);

    useFrame(({ clock }) => {
        if (!visible) return;
        const t = clock.elapsedTime;
        // Multi-frequency flicker for organic feel
        const f1 = 0.72 + Math.sin(t * 24.3) * 0.14 + Math.sin(t * 43.7) * 0.07;
        const f2 = 0.72 + Math.sin(t * 19.8) * 0.14 + Math.sin(t * 38.1) * 0.07;

        if (flame1.current) flame1.current.scale.set(f1 * 0.38, f1 * 1.15, f1 * 0.38);
        if (flame2.current) flame2.current.scale.set(f2 * 0.38, f2 * 1.15, f2 * 0.38);
        if (inner1.current) inner1.current.scale.set(f1 * 0.17, f1 * 0.85, f1 * 0.17);
        if (inner2.current) inner2.current.scale.set(f2 * 0.17, f2 * 0.85, f2 * 0.17);
        if (light.current) light.current.intensity = 2.8 + Math.sin(t * 28) * 1.1;
    });

    // Exhaust exits at rear of model
    // Model scale 0.36, rotated PI, rear is at local Z≈+0.68, height≈0.15
    return (
        <group position={[0, 0.15, 1.0]} visible={visible}>

            {/* LEFT pipe — 3 cone layers */}
            <mesh ref={flame1} position={[-0.22, 0, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.07, 0.65, 8, 1, true]} />
                <meshBasicMaterial color="#ff5500" transparent opacity={0.92} side={2} />
            </mesh>
            <mesh ref={inner1} position={[-0.22, 0.05, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.035, 0.52, 6, 1, true]} />
                <meshBasicMaterial color="#ffee33" transparent opacity={0.88} side={2} />
            </mesh>
            <mesh position={[-0.22, -0.05, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.11, 0.38, 7, 1, true]} />
                <meshBasicMaterial color="#cc2200" transparent opacity={0.38} side={2} />
            </mesh>

            {/* RIGHT pipe — 3 cone layers */}
            <mesh ref={flame2} position={[0.22, 0, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.07, 0.65, 8, 1, true]} />
                <meshBasicMaterial color="#ff5500" transparent opacity={0.92} side={2} />
            </mesh>
            <mesh ref={inner2} position={[0.22, 0.05, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.035, 0.52, 6, 1, true]} />
                <meshBasicMaterial color="#ffee33" transparent opacity={0.88} side={2} />
            </mesh>
            <mesh position={[0.22, -0.05, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.11, 0.38, 7, 1, true]} />
                <meshBasicMaterial color="#cc2200" transparent opacity={0.38} side={2} />
            </mesh>

            {/* Dynamic orange glow */}
            <pointLight ref={light} color="#ff4400" intensity={3.5} distance={5} decay={2} />
        </group>
    );
}

function CarBody() {
    const { scene } = useGLTF('/classic_muscle_car.glb');

    const cloned = useMemo(() => {
        // VISUAL FIX: Tier-aware car body material — no longer mirror-like
        const bodyMat = getCarBodyMaterial(getProfileSync().tier);

        const c = scene.clone(true);
        c.traverse((child: any) => {
            if (!child.isMesh) return;
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((mat: any, idx: number) => {
                const m = mat.clone();
                if (m.name === 'Material') {
                    // Main body — vivid OrangeRed, matte metallic (not mirror)
                    m.color.setStyle('#ff5500');
                    m.metalness = bodyMat.metalness;
                    m.roughness = bodyMat.roughness;
                    m.envMapIntensity = bodyMat.envMapIntensity;
                }
                if (m.name === 'Material.003') {
                    // Glass
                    m.transparent = true;
                    m.opacity = 0.42;
                    m.roughness = 0.0;
                    m.metalness = 0.1;
                }
                if (m.name === 'Material.001') {
                    // Chrome
                    m.metalness = 0.95;
                    m.roughness = 0.05;
                }
                if (Array.isArray(child.material)) {
                    child.material[idx] = m;
                } else {
                    child.material = m;
                }
            });
        });
        return c;
    }, [scene]);

    return (
        <primitive
            object={cloned}
            scale={0.28}
            position={[0, 0.285, 0]}
            rotation={[0, Math.PI, 0]}
        />
    );
}

useGLTF.preload('/classic_muscle_car.glb');
