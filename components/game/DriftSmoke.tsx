"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { gameState } from "./Car";

export function DriftSmoke() {
    const leftRef = useRef<THREE.Mesh>(null)
    const rightRef = useRef<THREE.Mesh>(null)
    const leftMatRef = useRef<THREE.MeshBasicMaterial>(null)
    const rightMatRef = useRef<THREE.MeshBasicMaterial>(null)

    useFrame(({ clock }) => {
        const d = gameState.drifting
        const t = clock.elapsedTime

        // Anchor meshes: flicker opacity + scale for organic feel
        // Normal state: scale 0.01, opacity 0
        // Drift state: flicker around scale 1.0, opacity 0.2-0.3
        const opacL = d ? 0.22 + Math.sin(t * 17.3) * 0.08 : 0
        const opacR = d ? 0.22 + Math.sin(t * 19.7) * 0.08 : 0
        const scaleL = d ? 1.0 + Math.sin(t * 12.1) * 0.25 : 0.01
        const scaleR = d ? 1.0 + Math.sin(t * 14.6) * 0.25 : 0.01

        if (leftRef.current) leftRef.current.scale.setScalar(scaleL)
        if (rightRef.current) rightRef.current.scale.setScalar(scaleR)
        if (leftMatRef.current) leftMatRef.current.opacity = opacL
        if (rightMatRef.current) rightMatRef.current.opacity = opacR
    })

    // classic_muscle_car.glb: scale=0.28, rotation=[0,PI,0], position=[0,0.285,0]
    // After PI rotation: rear of car = positive Z in parent space
    // Rear axle at local Z ≈ +1.05, wheel Y ≈ 0.10, wheel X ≈ ±0.55
    const REAR_Z = 1.05
    const WHEEL_Y = 0.10
    const WHEEL_X = 0.55

    return (
        <group>
            {/* Rear LEFT wheel */}
            <mesh ref={leftRef} position={[-WHEEL_X, WHEEL_Y, REAR_Z]}>
                <sphereGeometry args={[0.42, 7, 7]} />
                <meshBasicMaterial
                    ref={leftMatRef}
                    color="#d0d0d0"
                    transparent
                    opacity={0}
                    depthWrite={false}
                />
            </mesh>
            {/* Rear RIGHT wheel */}
            <mesh ref={rightRef} position={[WHEEL_X, WHEEL_Y, REAR_Z]}>
                <sphereGeometry args={[0.42, 7, 7]} />
                <meshBasicMaterial
                    ref={rightMatRef}
                    color="#d0d0d0"
                    transparent
                    opacity={0}
                    depthWrite={false}
                />
            </mesh>
        </group>
    )
}
