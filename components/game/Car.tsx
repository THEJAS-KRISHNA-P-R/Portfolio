"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls, useGLTF } from "@react-three/drei";
import { RigidBody, CuboidCollider, type RapierRigidBody, useRapier } from '@react-three/rapier'
import * as THREE from 'three'
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { mobileInput } from "@/components/game/MobileControls";
import { getCarBodyMaterial } from "@/lib/materials";
import { DriftSmoke } from "./DriftSmoke";
import { useQualityStore } from "@/store/useQualityStore";

function BlobShadow({ visible }: { visible: boolean }) {
    // Global removal: ALWAYS return null regardless of setting
    return null;
}

// ── Rocket League Tuning ─────────────────────────────────────────────────────
const TOP_SPEED = 18
const ACCEL = 0.055
const BOOST_ACCEL = 0.15
const BRAKE = 0.065
const COAST_DECEL = 0.012
const REVERSE_SPEED = 7
const BOOST_SPEED = 35
const BOOST_DURATION = 3.3
const BOOST_COOLDOWN = 2.0 // seconds between boost charges
const BOOST_DRIVE_TO_RECHARGE = 12.0 // drive time for full refill if we don't use cooldown logic

const WHEELBASE = 3.2    // virtual wheelbase length — controls turn radius feel
const MAX_STEER_ANGLE = 0.52   // was 0.55
const STEER_SPEED = 9.0    // was 6.0
const STEER_RETURN = 12.0

const ACCEL_RAMP_UP_TIME = 1.5 // Time to reach full acceleration

// Powerslide / Drift
const DRIFT_LATERAL_KEEP = 0.65   // how much sideways vel survives (unused directly now)
const NORMAL_LATERAL_KEEP = 0.04   // grip — 96% of lateral killed per frame
const DRIFT_COUNTER_TORQUE = 160;  // magnitude for yaw scaling
// ─────────────────────────────────────────────────────────────────────────────

// ── Maze mode constants ──────────────────────────────────────────────────
const MAZE_X_MIN = -140
const MAZE_X_MAX = -40
const MAZE_Z_MIN = 72
const MAZE_Z_MAX = 124

function isInsideMaze(x: number, z: number): boolean {
    return x > MAZE_X_MIN && x < MAZE_X_MAX && z > MAZE_Z_MIN && z < MAZE_Z_MAX
}

// ── Shared game state — plain object, never in Zustand ─────────────────────
// Write here in useFrame (60fps), read by HUD/TurboVignette at 10-20fps poll.
export const gameState = {
    speed: 0,
    turboCharge: 1, // 0-1
    turboCooldown: 0, // 0-1 (1 means fully cooling down, 0 means ready)
    drifting: false,
    controlsFrozen: false,
    position: { x: 0, y: 0, z: 0 },
}

// ── Scratch Objects for zero-allocation performance ────────────────────────
const _carQuat = new THREE.Quaternion()
const _euler = new THREE.Euler()
const _rightDir = new THREE.Vector3()
const _forwardDir = new THREE.Vector3()
const _vel3 = new THREE.Vector3()
const _camOffset = new THREE.Vector3()
const _carPos = new THREE.Vector3()
const _vec3 = new THREE.Vector3()

// ── Module-level flags ──────────────────────────────────────────────────
let _inMaze = false
let _infiniteBoost = false
let _maxSpeedActive = false
let _maxSpeedTimer = 0

export function Car() {
    const carRef = useRef<RapierRigidBody>(null);
    const profile = useQualityStore(s => s.profile)!;
    const { world } = useRapier();
    const [, getKeys] = useKeyboardControls();
    const [ready, setReady] = useState(false);
    const [showFlames, setShowFlames] = useState(false);
    const cameraTarget = useRef(new THREE.Vector3());
    const _camTarget = useMemo(() => new THREE.Vector3(), [])

    // ... (rest of the component state)

    // State
    const currentSpeed = useRef(0);
    const yaw = useRef(0);
    const steerAngle = useRef(0);
    const isAccelerating = useRef(false);
    const steerInput = useRef(0);
    const smoothedSteerInput = useRef(0);
    const trailPositions = useRef<THREE.Vector3[]>([]);
    const forwardDriveTime = useRef(0);

    // NEW: Drift & Turbo state
    const drifting = useRef(false);
    const driftIntensity = useRef(0);
    const prevBoostKey = useRef(false);
    const turboTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Spawn cinematic
    const spawning = useRef(true);
    const spawnTimer = useRef(0);
    const SPAWN_DURATION = 1.5;

    const boostCharge = useRef(100)
    const boostActive = useRef(false)
    const boostTimer = useRef(0)
    const boostCooldownTimer = useRef(0)
    const driveTimeAccum = useRef(0)

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
            const detail = (e as CustomEvent).detail;

            // Support both old flat structure and new nested { position, rotation } structure
            const x = detail.position?.x ?? detail.x ?? 0;
            const y = detail.position?.y ?? detail.y ?? 0.5;
            const z = detail.position?.z ?? detail.z ?? 0;

            const body = carRef.current;
            if (!body) return;

            // 1. Zero out velocity first
            body.setLinvel({ x: 0, y: 0, z: 0 }, true);
            body.setAngvel({ x: 0, y: 0, z: 0 }, true);

            // 2. Set position
            body.setTranslation({ x, y, z }, true);

            // 3. Set rotation
            if (detail.rotation) {
                // Quaternion provided
                body.setRotation(detail.rotation, true);
                // Sync internal yaw state (approximate from quaternion y/w)
                yaw.current = 2 * Math.atan2(detail.rotation.y, detail.rotation.w);
            } else if (typeof detail.rotationY === 'number') {
                const rotationY = detail.rotationY;
                const halfAngle = rotationY / 2;
                body.setRotation(
                    { x: 0, y: Math.sin(halfAngle), z: 0, w: Math.cos(halfAngle) },
                    true
                );
                yaw.current = rotationY;
            }

            // 4. Reset internal states
            currentSpeed.current = 0;
            forwardDriveTime.current = 0;

            // CONTROL DRIFT FIX: Clear all mobile input state on teleport/reset
            mobileInput.forward = false;
            mobileInput.brake = false;
            mobileInput.backward = false;
            mobileInput.left = false;
            mobileInput.right = false;
            mobileInput.boost = false;
            mobileInput.steerX = 0;
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

        const onInfiniteBoost = () => { _infiniteBoost = true; };
        const onMaxSpeed = (e: Event) => {
            _maxSpeedActive = true;
            _maxSpeedTimer = (e as CustomEvent).detail?.duration ?? 30;
        };

        window.addEventListener('cheat:infinite-boost', onInfiniteBoost);
        window.addEventListener('cheat:max-speed', onMaxSpeed);

        const onRespawn = () => {
            const body = carRef.current;
            if (!body) return;
            body.setTranslation({ x: 0, y: 3, z: 0 }, true);
            body.setLinvel({ x: 0, y: 0, z: 0 }, true);
            body.setAngvel({ x: 0, y: 0, z: 0 }, true);
            currentSpeed.current = 0;
            forwardDriveTime.current = 0;
        };
        window.addEventListener('car:respawn', onRespawn);

        return () => {
            window.removeEventListener('car:reset', onReset);
            window.removeEventListener('game:freeze-controls', onFreeze);
            window.removeEventListener('cheat:infinite-boost', onInfiniteBoost);
            window.removeEventListener('cheat:max-speed', onMaxSpeed);
            window.removeEventListener('car:respawn', onRespawn);
        }
    }, []); // Empty dependency array means this runs once on mount

    useFrame((state, delta) => {
        const body = carRef.current;
        if (!body) return;

        if (!ready) {
            body.setTranslation({ x: 0, y: 2, z: 0 }, true);
            body.setLinvel({ x: 0, y: 0, z: 0 }, true);
            body.setAngvel({ x: 0, y: 0, z: 0 }, true);
            return;
        }

        const dt = Math.min(delta, 0.05);

        // Expose FPS for InfoModal
        if (typeof window !== 'undefined') {
            (window as any).__fps = Math.round(1 / delta);
        }

        if (controlsFrozen.current) {
            currentSpeed.current = 0;
            forwardDriveTime.current = 0;
            return;
        }

        if (carRef.current) {
            const p = carRef.current.translation()
            gameState.position.x = p.x
            gameState.position.y = p.y
            gameState.position.z = p.z
        }

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

        const keys = getKeys();

        // ── Input Muxing ─────────────────────────────────────────────────
        const isForward = keys.forward || mobileInput.forward;
        const isBrake = keys.backward || mobileInput.brake || mobileInput.backward;

        const targetSteerRaw = Math.abs(mobileInput.steerX) > 0.05
            ? -mobileInput.steerX
            : (keys.left ? 1 : keys.right ? -1 : 0);

        smoothedSteerInput.current = THREE.MathUtils.lerp(
            smoothedSteerInput.current,
            targetSteerRaw,
            12 * dt
        );

        const steerInputRaw = smoothedSteerInput.current;
        const touchThrottle = mobileInput.throttleY;
        const isForwardAnalog = isForward || touchThrottle > 0.15;
        const isBrakeAnalog = isBrake || touchThrottle < -0.15;

        // ── Boost Logic ──────────────────────────────────────────────────
        if (!boostActive.current && boostCharge.current < 100) {
            if (Math.abs(currentSpeed.current) > 1.0) {
                driveTimeAccum.current += dt;
                boostCharge.current = Math.min(100, (driveTimeAccum.current / BOOST_DRIVE_TO_RECHARGE) * 100);
            }
        }

        const shouldBoost = keys.boost || mobileInput.turbo || mobileTurbo || _infiniteBoost;
        const boostKeyEdge = shouldBoost && !prevBoostKey.current;
        prevBoostKey.current = shouldBoost;

        if (boostKeyEdge && (boostCharge.current >= 10 || _infiniteBoost) && !boostActive.current && boostCooldownTimer.current <= 0 && Math.abs(currentSpeed.current) > 0.5) {
            boostActive.current = true;
            boostTimer.current = BOOST_DURATION;
            // No longer resetting to 0 instantly! We'll drain it.
            // if (!keys.boost && !_infiniteBoost) boostCharge.current = 0;
            driveTimeAccum.current = 0;
            setShowFlames(true);
        }

        if (_infiniteBoost && boostActive.current) {
            boostTimer.current = BOOST_DURATION; // keep resetting
        }

        if (keys.boost && boostActive.current) {
            boostCharge.current = Math.max(0, boostCharge.current - 25 * dt);
            if (boostCharge.current <= 0) {
                boostActive.current = false;
                setShowFlames(false);
            }
        }

        if (boostActive.current && !keys.boost) {
            // Drain charge during one-shot boost (so it's not "instant")
            if (!_infiniteBoost) {
                boostCharge.current = Math.max(0, boostCharge.current - (100 / BOOST_DURATION) * dt);
            }
            boostTimer.current -= dt;
            if (boostTimer.current <= 0) {
                boostActive.current = false;
                setShowFlames(false);
                // Trigger cooldown unless infinite boost is on
                if (!_infiniteBoost) {
                    boostCooldownTimer.current = BOOST_COOLDOWN;
                }
            }
        }

        // Handle cooldown
        if (boostCooldownTimer.current > 0) {
            boostCooldownTimer.current = Math.max(0, boostCooldownTimer.current - dt);
        }

        if (_infiniteBoost) {
            boostCharge.current = 100;
            if (!boostActive.current && Math.abs(currentSpeed.current) > 0.1) {
                boostActive.current = true;
                setShowFlames(true);
            }
        }

        // ── Forward / Reverse Speed Math ─────────────────────────────────
        const effectiveTopSpeed = _maxSpeedActive ? TOP_SPEED * 3 : TOP_SPEED;
        const effectiveBoostSpeed = _maxSpeedActive ? BOOST_SPEED * 3 : BOOST_SPEED;
        if (_maxSpeedActive) {
            _maxSpeedTimer -= dt;
            if (_maxSpeedTimer <= 0) _maxSpeedActive = false;
        }

        const maxSpeed = _maxSpeedActive ? TOP_SPEED * 3.0 : (boostActive.current ? BOOST_SPEED : TOP_SPEED);
        const accel = boostActive.current ? BOOST_ACCEL : ACCEL;

        let targetSpeed = 0;
        if (isForwardAnalog) {
            forwardDriveTime.current += dt;
            const rampProgress = Math.min(1.0, forwardDriveTime.current / ACCEL_RAMP_UP_TIME);
            const engineScale = Math.abs(mobileInput.throttleY) > 0.05 ? Math.abs(mobileInput.throttleY) : 1.0;
            targetSpeed = maxSpeed * engineScale * rampProgress;
        } else if (isBrakeAnalog) {
            forwardDriveTime.current = 0;
            if (currentSpeed.current > 1) {
                targetSpeed = 0;
            } else {
                const engineScale = Math.abs(mobileInput.throttleY) > 0.05 ? Math.abs(mobileInput.throttleY) : 1.0;
                targetSpeed = -REVERSE_SPEED * engineScale;
            }
        }

        if (isForwardAnalog || (isBrakeAnalog && currentSpeed.current <= 1)) {
            currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, targetSpeed, accel);
        } else if (isBrakeAnalog && currentSpeed.current > 1) {
            currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, 0, BRAKE);
        } else {
            forwardDriveTime.current = 0;
            currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, 0, COAST_DECEL);
        }

        if (!isForwardAnalog && !isBrakeAnalog && !boostActive.current && Math.abs(currentSpeed.current) < 0.1) {
            currentSpeed.current = 0;
        }

        if (_maxSpeedActive) {
            currentSpeed.current = 45;
            _maxSpeedTimer -= dt;
            if (_maxSpeedTimer <= 0) _maxSpeedActive = false;
            if (!showFlames) setShowFlames(true);
        }

        isAccelerating.current = isForward && currentSpeed.current > 0 && currentSpeed.current < targetSpeed - 1;

        // ── Steering & Yaw ──────────────────────────────────────────────
        const forwardSpeed = currentSpeed.current;
        const turnRadius = WHEELBASE / Math.tan(MAX_STEER_ANGLE);
        const isReversing = forwardSpeed < -0.1;

        const effectiveSteerAngle = steerInputRaw * MAX_STEER_ANGLE;
        steerAngle.current = THREE.MathUtils.lerp(
            steerAngle.current,
            effectiveSteerAngle,
            Math.abs(steerInputRaw) > 0.01 ? 1 - Math.exp(-STEER_SPEED * dt) : 1 - Math.exp(-STEER_RETURN * dt)
        );
        steerAngle.current = THREE.MathUtils.clamp(steerAngle.current, -MAX_STEER_ANGLE, MAX_STEER_ANGLE);

        const absSpeed = Math.abs(currentSpeed.current);
        const speedDampening = Math.min(absSpeed / 1.5, 1.0);
        const driveSign = currentSpeed.current >= 0 ? 1 : -1;
        const smoothSign = driveSign * speedDampening;
        const steerReduction = 1.0 / (1.0 + absSpeed * 0.10);
        const effectiveSteer = steerAngle.current * steerReduction;

        const rawYawRate = (absSpeed / WHEELBASE) * effectiveSteer * smoothSign;
        const MAX_YAW_RATE = 2.8;
        const yawRate = THREE.MathUtils.clamp(rawYawRate, -MAX_YAW_RATE, MAX_YAW_RATE);

        yaw.current += yawRate * dt;
        steerInput.current = steerAngle.current / MAX_STEER_ANGLE;

        const quatFromYaw = _carQuat.setFromEuler(
            _euler.set(0, yaw.current, 0)
        );
        body.setRotation(
            { x: quatFromYaw.x, y: quatFromYaw.y, z: quatFromYaw.z, w: quatFromYaw.w },
            true
        );
        body.setAngvel({ x: 0, y: 0, z: 0 }, true);

        // ── VELOCITY & DRIFT ─────────────────────────────────────────────
        const forwardVec = _forwardDir.set(0, 0, -1).applyQuaternion(quatFromYaw);

        const wantsDrift = keys.drift || mobileInput.boost; // drift input
        const isMoving = Math.abs(currentSpeed.current) > 2.0;

        // Smooth drift intensity ramp — prevents instant snap on entry/exit
        if (wantsDrift && isMoving) {
            driftIntensity.current = Math.min(1.0, driftIntensity.current + dt * 5.0);
        } else {
            driftIntensity.current = Math.max(0.0, driftIntensity.current - dt * 4.0);
        }

        const di = driftIntensity.current;
        const isDrifting = di > 0.15;
        gameState.drifting = isDrifting;
        ; (window as any).__driftIntensity = di;

        const pos = body.translation();
        const inMaze = isInsideMaze(pos.x, pos.z);

        // --- LATERAL VELOCITY MATHS ---
        const rightVec = _rightDir.set(1, 0, 0).applyQuaternion(quatFromYaw);
        const currentVel = body.linvel();
        const velVec = _vel3.set(currentVel.x, 0, currentVel.z);
        let lateralVel = rightVec.dot(velVec);   // how fast car slides sideways

        // YAW SPIN during drift:
        // Instead of torque (which gets zeroed), directly add to yaw.current.
        // This IS the rear breaking loose — the car rotates faster than its velocity.
        if (di > 0.1 && Math.abs(steerAngle.current) > 0.05 && Math.abs(currentSpeed.current) > 2) {
            // Spin rate: proportional to steer angle × drift intensity × speed
            const spinRate = (steerAngle.current / MAX_STEER_ANGLE) * di * 1.8 * (Math.abs(currentSpeed.current) / TOP_SPEED);
            yaw.current += spinRate * dt;
        }

        // When inside maze, apply extra lateral damping to kill wall-bounce
        if (inMaze) {
            // Kill lateral velocity more aggressively in maze
            lateralVel *= 0.85;
            // Also cap max speed inside maze to prevent pinballing
            const MAZE_MAX_SPEED = 10;
            const speedSq = currentVel.x * currentVel.x + currentVel.z * currentVel.z;
            if (speedSq > MAZE_MAX_SPEED * MAZE_MAX_SPEED) {
                const currentSpeedVal = Math.sqrt(speedSq);
                const scale = MAZE_MAX_SPEED / currentSpeedVal;
                currentVel.x *= scale;
                currentVel.z *= scale;
            }
        }

        const lateralKeep = THREE.MathUtils.lerp(NORMAL_LATERAL_KEEP, DRIFT_LATERAL_KEEP, di);
        const keptLateral = lateralVel * lateralKeep;

        const driveVel = forwardVec.multiplyScalar(currentSpeed.current);

        // Apply velocity: forward component + retained lateral
        body.setLinvel({
            x: driveVel.x + rightVec.x * keptLateral,
            y: currentVel.y,  // preserve gravity
            z: driveVel.z + rightVec.z * keptLateral,
        }, true);

        // Speed Trails
        if (Math.abs(currentSpeed.current) > 8) {
            const p = body.translation();
            // Note: unshift creates a new object, this is okay for trails but we should be careful. 
            // In a tight loop, cloning a scratch is better.
            trailPositions.current.unshift(_vec3.set(p.x, p.y - 0.2, p.z).clone());
            if (trailPositions.current.length > 6) trailPositions.current.pop();
        }

        // ── Camera follow logic ────────────────────────────────────────────────
        const carPos = _carPos.set(pos.x, pos.y, pos.z);
        _inMaze = isInsideMaze(carPos.x, carPos.z);

        const camOffset = _camOffset.set(0, 2.8, 5.5)
            .applyQuaternion(quatFromYaw)
            .add(carPos);
        camOffset.y = Math.max(camOffset.y, pos.y + 1);

        const camSpeed = boostActive.current ? 5.0 : 4.0;
        state.camera.position.lerp(camOffset, 1 - Math.exp(-camSpeed * dt));
        cameraTarget.current.lerp(
            _vec3.set(pos.x, pos.y + 0.4, pos.z),
            1 - Math.exp(-12 * dt)
        );
        state.camera.lookAt(cameraTarget.current);

        const cam = state.camera as THREE.PerspectiveCamera;
        const targetFOV = boostActive.current ? 78 : 55;
        cam.fov = THREE.MathUtils.lerp(cam.fov, targetFOV, 0.08);
        cam.updateProjectionMatrix();

        // ── gameState ──────────────────────────────────────────────────
        // Drive time & boost logic
        gameState.speed = currentSpeed.current;
        gameState.turboCharge = boostCharge.current / 100;
        gameState.turboCooldown = boostCooldownTimer.current / BOOST_COOLDOWN;
        gameState.controlsFrozen = controlsFrozen.current;
        usePortfolioStore.getState().setCarPos({ x: pos.x, y: pos.y, z: pos.z });

        // ── Fall recovery / Manual Reset ─────────────────────────────────
        if (pos.y < -2 || (keys.reset && !_inMaze)) {
            const newY = keys.reset ? Math.max(pos.y + 4, 2) : 2;
            const newX = keys.reset ? pos.x : 0;
            const newZ = keys.reset ? pos.z : 0;
            body.setTranslation({ x: newX, y: newY, z: newZ }, true);
            body.setLinvel({ x: 0, y: 0, z: 0 }, true);
            body.setAngvel({ x: 0, y: 0, z: 0 }, true);
            currentSpeed.current = 0;
            mobileInput.forward = false;
            mobileInput.brake = false;
            mobileInput.boost = false;
            mobileInput.turbo = false;
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
                linearDamping={0.5}
                angularDamping={1.5}
                enabledRotations={[false, true, false]}
                friction={1.2}
                restitution={0}
                position={[0, 2, -5]}
            >
                {/* Main body collider - raised slightly to clear ramp bottoms */}
                <CuboidCollider args={[0.72, 0.22, 1.44]} position={[0, 0.18, 0]} />
                {/* Low belly — reduced to prevent beaching on ramp approach */}
                <CuboidCollider args={[0.58, 0.10, 1.17]} position={[0, -0.01, 0]} />
                <TurboFlames visible={showFlames} />
                <DriftSmoke />
                {/* Global shadow removal: castShadow is now ALWAYS false */}
                <CarBody castShadow={false} />
                <BlobShadow visible={false} />
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

function CarBody({ castShadow = true }: { castShadow?: boolean }) {
    const { scene } = useGLTF('/classic_muscle_car.glb');
    const profile = useQualityStore(s => s.profile)!;

    const cloned = useMemo(() => {
        const bodyMat = getCarBodyMaterial(profile.tier, profile.isMobile);

        const c = scene.clone(true);
        c.traverse((child: any) => {
            if (!child.isMesh) return;
            child.castShadow = castShadow;
            child.receiveShadow = true;
            if (!child.material) return;

            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((mat: any, idx: number) => {
                if (!mat) return;
                let m = mat.clone();

                // ── PC MATERIAL UPGRADE ──────────────────────────────────────
                // StandardMaterial doesn't support clearcoat/transmission
                // Upgrade to PhysicalMaterial on desktop for premium look
                if (!profile.isMobile && (m as any).isMeshStandardMaterial) {
                    const physMat = new THREE.MeshPhysicalMaterial();
                    // Manually transfer core properties to avoid .copy() crash on hidden props
                    physMat.color.copy(m.color);
                    physMat.roughness = m.roughness;
                    physMat.metalness = m.metalness;
                    physMat.map = m.map;
                    physMat.normalMap = m.normalMap;
                    physMat.envMapIntensity = m.envMapIntensity;
                    m = physMat;
                }

                if (m.name === 'Material' && m.color) {
                    // Main body
                    m.color.setStyle('#ff4000'); // Deeper orange-red
                    if (profile.isMobile) {
                        m.metalness = bodyMat.metalness;
                        m.roughness = bodyMat.roughness;
                        m.envMapIntensity = bodyMat.envMapIntensity;
                    } else {
                        m.metalness = 0.6;
                        m.roughness = 0.1;
                        m.envMapIntensity = 1.2;
                        m.clearcoat = 1.0;
                        m.clearcoatRoughness = 0.05;
                    }
                }
                if (m.name === 'Material.003') {
                    // Glass
                    m.transparent = true;
                    if (profile.isMobile) {
                        m.opacity = 0.42;
                        m.roughness = 0.0;
                        m.metalness = 0.1;
                        m.envMapIntensity = 0.0;
                    } else {
                        m.opacity = 0.25;
                        m.roughness = 0.0;
                        m.metalness = 0.9;
                        m.envMapIntensity = 1.5;
                        m.transmission = 0.95;
                        m.ior = 1.5;
                        m.thickness = 0.1;
                    }
                }
                if (m.name === 'Material.001') {
                    // Chrome
                    m.metalness = 1.0;
                    m.roughness = profile.isMobile ? 0.05 : 0.0;
                    m.envMapIntensity = profile.isMobile ? 0.2 : 2.0;
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
