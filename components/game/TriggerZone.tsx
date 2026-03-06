"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { usePortfolioStore } from "@/store/usePortfolioStore";

interface TriggerZoneProps {
    position: [number, number, number];
    zoneId: string;
    color: string;
    label: string;
}

export function TriggerZone({ position, zoneId, color, label }: TriggerZoneProps) {
    const setPendingZone = usePortfolioStore(state => state.setPendingZone);
    const activeZone = usePortfolioStore(state => state.activeZone);
    const pendingZone = usePortfolioStore(state => state.pendingZone);

    const ringGroupRef = useRef<THREE.Group>(null);
    const ring1Ref = useRef<THREE.Mesh>(null);
    const ring2Ref = useRef<THREE.Mesh>(null);
    const ring3Ref = useRef<THREE.Mesh>(null);
    const glowMatRef = useRef<THREE.MeshBasicMaterial>(null);
    const beamMatRef = useRef<THREE.MeshBasicMaterial>(null);

    const [isInside, setIsInside] = useState(false);
    const scaleTarget = useRef(1);
    const currentScale = useRef(1);

    // Visual effects animation
    useFrame((state, delta) => {
        // Rotate outer base ring
        if (ringGroupRef.current) {
            ringGroupRef.current.rotation.y += 0.008 * delta * 60;
        }

        // Pulse inner glow
        const time = state.clock.elapsedTime;
        if (glowMatRef.current) {
            glowMatRef.current.opacity = 0.03 + Math.sin(time * 3) * 0.03;
        }

        // Modulate beam opacity
        if (beamMatRef.current) {
            beamMatRef.current.opacity = 0.12 + Math.sin(time * 2.5) * 0.06;
        }

        // Orbit rings
        if (ring1Ref.current) ring1Ref.current.rotation.y += 0.4 * delta;
        if (ring2Ref.current) ring2Ref.current.rotation.y -= 0.6 * delta;
        if (ring3Ref.current) ring3Ref.current.rotation.y += 0.25 * delta;

        // Handle scale "pop" on entry
        scaleTarget.current = isInside ? 1.3 : 1.0;

        // Lerp scale
        currentScale.current += (scaleTarget.current - currentScale.current) * 0.1;
        if (ringGroupRef.current) {
            ringGroupRef.current.scale.setScalar(currentScale.current);
        }
    });

    const handleEnter = () => {
        setIsInside(true);
        // Show modal immediately — no delay, no guard
        setPendingZone(zoneId);
    };

    const handleExit = () => {
        setIsInside(false);
        // Do NOT clear pendingZone here — modal stays open so user can tap buttons
        // ZoneConfirmModal's dismiss/confirm buttons handle closing
    };

    return (
        <group position={position}>
            {/* Physics Sensor */}
            <RigidBody type="fixed" colliders={false} sensor onIntersectionEnter={handleEnter} onIntersectionExit={handleExit}>
                {/* The collider is slightly taller than the visual elements to ensure the car hits it */}
                <CuboidCollider args={[4, 3, 4]} position={[0, 1.5, 0]} />
            </RigidBody>

            {/* 1. Ground hexagon glow — flat, sits on terrain */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <ringGeometry args={[3.2, 4.0, 6]} />
                <meshBasicMaterial color={color} transparent opacity={0.6} depthWrite={false} />
            </mesh>

            {/* 2. Inner fill disc — very faint */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
                <circleGeometry args={[3.2, 6]} />
                <meshBasicMaterial color={color} transparent opacity={0.06} depthWrite={false} />
            </mesh>

            {/* 3. Three rotating orbital rings at different heights + tilts */}
            <mesh ref={ring1Ref} position={[0, 1.5, 0]} rotation={[0.3, 0, 0]}>
                <torusGeometry args={[4.5, 0.03, 8, 64]} />
                <meshBasicMaterial color={color} transparent opacity={0.7} />
            </mesh>
            <mesh ref={ring2Ref} position={[0, 2.5, 0]} rotation={[0, 0, 0.4]}>
                <torusGeometry args={[3.8, 0.025, 8, 64]} />
                <meshBasicMaterial color={color} transparent opacity={0.7} />
            </mesh>
            <mesh ref={ring3Ref} position={[0, 3.5, 0]} rotation={[0.5, 0, 0.3]}>
                <torusGeometry args={[5.0, 0.02, 8, 64]} />
                <meshBasicMaterial color={color} transparent opacity={0.7} />
            </mesh>

            {/* 4. Vertical energy beam — thin, pulsing */}
            <mesh position={[0, 10, 0]}>
                <cylinderGeometry args={[0.15, 0.4, 20, 8, 1, true]} />
                <meshBasicMaterial
                    ref={beamMatRef}
                    color={color}
                    transparent
                    opacity={0.15}
                    depthWrite={false}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* 5. Corner spike pillars — 4 thin pillars at hex corners */}
            {[0, 1, 2, 3, 4, 5].map(i => {
                const angle = (i / 6) * Math.PI * 2
                const x = Math.cos(angle) * 3.6
                const z = Math.sin(angle) * 3.6
                return (
                    <mesh key={i} position={[x, 1.5, z]}>
                        <cylinderGeometry args={[0.04, 0.08, 3, 5]} />
                        <meshBasicMaterial color={color} transparent opacity={0.5} />
                    </mesh>
                )
            })}

            {/* 6. Zone label — floats above beam */}
            {activeZone !== zoneId && (
                <Html position={[0, 2.8, 0]} center distanceFactor={12} occlude="blending" transform zIndexRange={[100, 0]}>
                    <div className="flex flex-col items-center pointer-events-none gap-2">
                        <div
                            className="px-4 py-2 rounded-xl backdrop-blur-xl border flex flex-col items-center gap-1 shadow-2xl"
                            style={{
                                backgroundColor: 'rgba(5, 10, 15, 0.85)',
                                borderColor: `${color}50`,
                                boxShadow: `0 0 20px -5px ${color}60`,
                            }}
                        >
                            <span className="font-display font-bold text-base" style={{ color }}>
                                {label}
                            </span>
                        </div>
                    </div>
                </Html>
            )}

            {/* 7. Point light */}
            <pointLight color={color} intensity={isInside ? 4 : 1.5} distance={12} position={[0, 2, 0]} />
        </group>
    );
}


