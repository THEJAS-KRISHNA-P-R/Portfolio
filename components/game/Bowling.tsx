"use client";

import { useGLTF, Html } from "@react-three/drei";
import { forwardRef, useMemo, useRef, useState } from "react";
import { RigidBody, CuboidCollider, RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { fireAchievement } from "./AchievementToast";
import { StrikeAnimation } from "./StrikeAnimation";

const BOWLING_POS: [number, number, number] = [-45, 0, -45];
const PIN_HEIGHT = 1.2;

// Preload the model
useGLTF.preload('/bowling_pin.glb');

// Pin component using the real GLB
const BowlingPin = forwardRef<
    RapierRigidBody,
    { position: [number, number, number] }
>(({ position }, ref) => {
    const { scene } = useGLTF('/bowling_pin.glb');

    // Clone so each pin is independent
    const cloned = useMemo(() => {
        const c = scene.clone(true);
        c.traverse((child: any) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        return c;
    }, [scene]);

    return (
        <RigidBody
            ref={ref}
            position={position}
            colliders={false}
            mass={1.2}
            linearDamping={0.6}
            angularDamping={0.9}
            restitution={0.25}
            friction={0.8}
        >
            {/* Physics collider — capsule approximation */}
            <CuboidCollider args={[0.1, 0.45, 0.1]} position={[0, 0.45, 0]} />

            {/* Visual GLB — scale to match collider */}
            <primitive
                object={cloned}
                scale={0.8}          // adjust until pin looks right in scene
                position={[0, -0.45, 0]} // offset downward so base sits on ground at 0
                rotation={[0, 0, 0]}
            />
        </RigidBody>
    );
});
BowlingPin.displayName = 'BowlingPin';

export function Bowling() {
    const pinRefs = useRef<RapierRigidBody[]>([]);
    const [isResetting, setIsResetting] = useState(false);
    const firstHitTime = useRef<number | null>(null);

    const [pinsDown, setPinsDown] = useState(0);
    const [showStrike, setShowStrike] = useState(false);
    const lastPinsDown = useRef(0);

    const pins = useMemo(() => {
        const positions: [number, number, number][] = [];
        const rows = 4;
        const spacing = 1.0;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col <= row; col++) {
                const x = (col - row / 2) * spacing;
                const z = -row * spacing * 0.866;
                positions.push([x, 0, z]);
            }
        }
        return positions;
    }, []);

    const resetGame = () => {
        setIsResetting(true);
        setTimeout(() => {
            pinRefs.current.forEach((pin, i) => {
                if (!pin) return;
                const pos = pins[i];
                pin.setTranslation({ x: BOWLING_POS[0] + pos[0], y: BOWLING_POS[1] + pos[1], z: BOWLING_POS[2] + pos[2] }, true);
                pin.setLinvel({ x: 0, y: 0, z: 0 }, true);
                pin.setAngvel({ x: 0, y: 0, z: 0 }, true);
                pin.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
            });
            firstHitTime.current = null;
            lastPinsDown.current = 0;
            setPinsDown(0);
            setIsResetting(false);
        }, 50);
    };

    useFrame(() => {
        if (isResetting || pinRefs.current.length < 10) return;

        let fallenCount = 0;
        pinRefs.current.forEach(pin => {
            if (!pin) return;
            // Check rotation using quaternion
            const rot = pin.rotation();
            const euler = new THREE.Euler().setFromQuaternion(
                new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w)
            );

            const tilt = Math.abs(euler.x) + Math.abs(euler.z);
            if (tilt > 0.5) fallenCount++;
        });

        // Set first hit time
        if (fallenCount > 0 && !firstHitTime.current) {
            firstHitTime.current = performance.now();
        }

        // Handle pin knockdowns
        if (fallenCount !== lastPinsDown.current) {
            lastPinsDown.current = fallenCount;
            setPinsDown(fallenCount);

            if (fallenCount === 10) {
                // STRIKE
                setShowStrike(true);
            } else if (fallenCount > 0) {
                // Show pin count notification
                fireAchievement({
                    type: 'bowling',
                    title: 'PINS DOWN',
                    value: `${fallenCount}/10`,
                    subtext: fallenCount >= 7 ? 'Great shot!' : fallenCount >= 4 ? 'Nice hit!' : 'Keep going!',
                    color: '#ffcc00',
                    duration: 2500,
                });
            }
        }

        // Auto-reset timer for non-strike rounds
        if (firstHitTime.current && performance.now() - firstHitTime.current > 3000 && fallenCount < 10 && !isResetting) {
            resetGame();
        }
    });

    return (
        <>
            <group position={BOWLING_POS}>
                {pins.map((pos, i) => (
                    <BowlingPin
                        key={i}
                        position={pos}
                        ref={(el) => { if (el) pinRefs.current[i] = el; }}
                    />
                ))}

                <Html position={[0, 4, 3]} center distanceFactor={14}>
                    <div style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        textAlign: 'center',
                        background: 'rgba(5, 5, 20, 0.88)',
                        border: '1px solid rgba(255, 204, 0, 0.3)',
                        borderRadius: '10px',
                        padding: '0.4rem 0.9rem',
                        pointerEvents: 'none',
                        minWidth: '100px',
                    }}>
                        <div style={{ fontSize: '8px', color: 'rgba(255,204,0,0.6)', letterSpacing: '0.14em' }}>
                            BOWLING
                        </div>
                        <div style={{ fontSize: '18px', color: '#ffcc00', fontWeight: 800, lineHeight: 1.2 }}>
                            {pinsDown}/10
                        </div>
                    </div>
                </Html>
            </group>

            {showStrike && (
                <Html fullscreen style={{ pointerEvents: 'none', zIndex: 1000 }}>
                    <StrikeAnimation onDone={() => {
                        setShowStrike(false);
                        setTimeout(resetGame, 1000);
                    }} />
                </Html>
            )}
        </>
    );
}
