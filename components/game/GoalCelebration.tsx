"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePortfolioStore } from "@/store/usePortfolioStore";

const PARTICLE_COUNT = 30;
const DURATION = 2.0; // seconds

/**
 * Particle burst that shoots upward from the goal when a goal is scored.
 * Uses THREE.Points — no external libraries.
 */
export function GoalCelebration() {
    const goals = usePortfolioStore((s) => s.goals);
    const pointsRef = useRef<THREE.Points>(null);
    const timerRef = useRef(0);
    const prevGoals = useRef(0);
    const velocities = useRef<THREE.Vector3[]>([]);
    const active = useRef(false);

    // Goal post net position (matches GoalPost.tsx Fix 10)
    const netPos = new THREE.Vector3(0, 2, -28);

    // Initialize random velocities when a goal is scored
    useEffect(() => {
        if (goals > prevGoals.current) {
            active.current = true;
            timerRef.current = 0;

            const vels: THREE.Vector3[] = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                vels.push(
                    new THREE.Vector3(
                        (Math.random() - 0.5) * 4,   // spread X
                        2 + Math.random() * 5,        // shoot up
                        (Math.random() - 0.5) * 4     // spread Z
                    )
                );
            }
            velocities.current = vels;

            // Reset particle positions to net
            if (pointsRef.current) {
                const posArr = pointsRef.current.geometry.attributes.position;
                for (let i = 0; i < PARTICLE_COUNT; i++) {
                    (posArr as THREE.BufferAttribute).setXYZ(i, netPos.x, netPos.y, netPos.z);
                }
                posArr.needsUpdate = true;
            }
        }
        prevGoals.current = goals;
    }, [goals]);

    useFrame((_, delta) => {
        if (!active.current || !pointsRef.current) return;

        timerRef.current += delta;
        const t = timerRef.current / DURATION;

        if (t >= 1) {
            active.current = false;
            return;
        }

        const posArr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const vel = velocities.current[i];
            if (!vel) continue;

            const px = posArr.getX(i) + vel.x * delta;
            const py = posArr.getY(i) + vel.y * delta - 5 * delta; // gravity
            const pz = posArr.getZ(i) + vel.z * delta;

            posArr.setXYZ(i, px, py, pz);
        }

        posArr.needsUpdate = true;

        // Fade via material opacity
        const mat = pointsRef.current.material as THREE.PointsMaterial;
        mat.opacity = 1 - t;
    });

    // Build initial geometry
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        positions[i * 3] = netPos.x;
        positions[i * 3 + 1] = netPos.y;
        positions[i * 3 + 2] = netPos.z;
    }

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                color="#f5c842"
                size={0.3}
                transparent
                opacity={0}
                depthWrite={false}
            />
        </points>
    );
}
