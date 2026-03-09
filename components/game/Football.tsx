"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { RigidBody, RapierRigidBody, BallCollider } from "@react-three/rapier";
import * as THREE from "three";
import { fireAchievement } from "./AchievementToast";
import { handleGameComplete } from '@/lib/leaderboardService';

// Moved to SE corner
const SPAWN: [number, number, number] = [45, 1, 35];

export function Football() {
    const ballRef = useRef<RapierRigidBody>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const [, getKeys] = useKeyboardControls();

    // FOOTBALL FIX: 5 seconds after last hit
    const lastHitTimeRef = useRef(0);
    const RESET_DELAY_MS = 5000;

    useFrame((_, delta) => {
        if (!ballRef.current) return;
        const pos = ballRef.current.translation();
        const { reset } = getKeys();

        // Reset if fallen off world or manual reset
        if (pos.y < -10 || reset) {
            ballRef.current.setTranslation({ x: SPAWN[0], y: SPAWN[1], z: SPAWN[2] }, true);
            ballRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
            ballRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
            lastHitTimeRef.current = 0;
            return;
        }

        // FOOTBALL FIX: Reset 5 seconds after the last hit
        if (lastHitTimeRef.current > 0) {
            const timeSinceHit = Date.now() - lastHitTimeRef.current;
            if (timeSinceHit > RESET_DELAY_MS) {
                ballRef.current.setTranslation({ x: SPAWN[0], y: SPAWN[1], z: SPAWN[2] }, true);
                ballRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
                ballRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
                lastHitTimeRef.current = 0;
            }
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
            // FOOTBALL FIX: only record a hit if the ball is already moving (car strike),
            // not from resting contact with the ground at spawn
            onCollisionEnter={() => {
                const vel = ballRef.current?.linvel()
                if (!vel) return
                const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z)
                if (speed > 1.5) lastHitTimeRef.current = Date.now()
            }}
        >
            <BallCollider args={[0.5]} />
            <mesh ref={meshRef} castShadow>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshStandardMaterial color="#f0f0f0" roughness={0.4} metalness={0.1} />
            </mesh>
        </RigidBody>
    );
}
