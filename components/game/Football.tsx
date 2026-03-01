"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { RigidBody, RapierRigidBody, BallCollider } from "@react-three/rapier";
import * as THREE from "three";
import { fireAchievement } from "./AchievementToast";

// Moved to SE corner
const SPAWN: [number, number, number] = [45, 1, 35];

export function Football() {
    const ballRef = useRef<RapierRigidBody>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const [, getKeys] = useKeyboardControls();

    // Fix 9: idle auto-reset refs
    const idleTimer = useRef(0);

    useFrame((_, delta) => {
        if (!ballRef.current) return;
        const pos = ballRef.current.translation();
        const { reset } = getKeys();

        // Reset if fallen off world
        if (pos.y < -10 || reset) {
            ballRef.current.setTranslation({ x: SPAWN[0], y: SPAWN[1], z: SPAWN[2] }, true);
            ballRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
            ballRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
            idleTimer.current = 0;
        }

        // Fix 9: Auto-reset when ball is stationary for 10 seconds
        const vel = ballRef.current.linvel();
        const speed = Math.sqrt(vel.x ** 2 + vel.y ** 2 + vel.z ** 2);

        if (speed < 0.15) {
            idleTimer.current += delta;
            if (idleTimer.current > 10) {
                ballRef.current.setTranslation({ x: SPAWN[0], y: SPAWN[1], z: SPAWN[2] }, true);
                ballRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
                ballRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
                idleTimer.current = 0;
            }
        } else {
            idleTimer.current = 0;
        }
    });

    return (
        <RigidBody
            ref={ballRef}
            userData={{ isBall: true }}
            colliders={false}
            mass={2.5}              // Fix 9: was 0.8 — heavier, needs real hit
            restitution={0.6}       // Fix 9: was 0.7 — slightly less bouncy
            friction={0.8}          // Fix 9: was 0.5 — more grip
            linearDamping={0.4}     // Fix 9: was 0.5 — rolls further
            angularDamping={0.3}
            position={SPAWN}
        >
            <BallCollider args={[0.5]} />
            <mesh ref={meshRef} castShadow>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshStandardMaterial color="#f0f0f0" roughness={0.4} metalness={0.1} />
            </mesh>
        </RigidBody>
    );
}
