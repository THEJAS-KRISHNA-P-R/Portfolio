"use client";

import { useRef, useState } from "react";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { usePortfolioStore } from "@/store/usePortfolioStore";

// Fix 10: moved goal further from spawn
const GOAL_POS: [number, number, number] = [45, 0, 40];
const POST_HEIGHT = 3;
const POST_WIDTH = 5;
const POST_RADIUS = 0.12;
const POST_COLOR = "#ffffff";

export function GoalPost() {
    const [showScore, setShowScore] = useState(false)
    const [displayScore, setDisplayScore] = useState<{ value: number; isHighScore: boolean } | null>(null)
    const highScore = useRef(0)

    const handleGoal = (event: any) => {
        // Try rigidBodyObject first, fall back to collider parent
        const obj = event.other?.rigidBodyObject ?? event.other?.collider?.parent?.();
        if (!obj?.userData?.isBall) return;   // reject car and everything else

        const rb = event.other?.rigidBody;
        if (!rb) return;

        const vel = rb.linvel();
        const speed = Math.sqrt(vel.x ** 2 + vel.y ** 2 + vel.z ** 2);
        if (speed < 1.5) return;  // too slow — not a real shot

        const scoreValue = Math.round(speed * 10);
        const currentHigh = highScore.current;

        if (scoreValue > currentHigh) {
            highScore.current = scoreValue;
            setDisplayScore({ value: scoreValue, isHighScore: true });
            setShowScore(true);
            setTimeout(() => { setShowScore(false); setDisplayScore(null); }, 4000);
        } else {
            setDisplayScore({ value: scoreValue, isHighScore: false });
            setShowScore(true);
            setTimeout(() => { setShowScore(false); setDisplayScore(null); }, 2000);
        }
    };

    return (
        <group position={GOAL_POS} rotation={[0, Math.PI, 0]}>
            {/* Left Post */}
            <RigidBody type="fixed" position={[-POST_WIDTH / 2, POST_HEIGHT / 2, 0]}>
                <mesh castShadow>
                    <cylinderGeometry args={[POST_RADIUS, POST_RADIUS, POST_HEIGHT, 8]} />
                    <meshStandardMaterial color={POST_COLOR} metalness={0.6} roughness={0.3} />
                </mesh>
            </RigidBody>

            {/* Right Post */}
            <RigidBody type="fixed" position={[POST_WIDTH / 2, POST_HEIGHT / 2, 0]}>
                <mesh castShadow>
                    <cylinderGeometry args={[POST_RADIUS, POST_RADIUS, POST_HEIGHT, 8]} />
                    <meshStandardMaterial color={POST_COLOR} metalness={0.6} roughness={0.3} />
                </mesh>
            </RigidBody>

            {/* Crossbar */}
            <RigidBody type="fixed" position={[0, POST_HEIGHT, 0]}>
                <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[POST_RADIUS, POST_RADIUS, POST_WIDTH, 8]} />
                    <meshStandardMaterial color={POST_COLOR} metalness={0.6} roughness={0.3} />
                </mesh>
            </RigidBody>

            {/* Fix 10: Ground anchor plates under each post */}
            <RigidBody type="fixed" position={[-POST_WIDTH / 2, 0.1, 0]}>
                <mesh castShadow>
                    <boxGeometry args={[0.6, 0.2, 0.6]} />
                    <meshStandardMaterial color="#cccccc" metalness={0.7} roughness={0.2} />
                </mesh>
            </RigidBody>
            <RigidBody type="fixed" position={[POST_WIDTH / 2, 0.1, 0]}>
                <mesh castShadow>
                    <boxGeometry args={[0.6, 0.2, 0.6]} />
                    <meshStandardMaterial color="#cccccc" metalness={0.7} roughness={0.2} />
                </mesh>
            </RigidBody>

            {/* NET — visual grid */}
            {/* Vertical net lines */}
            {Array.from({ length: 7 }).map((_, i) => (
                <mesh key={`vn${i}`} position={[-POST_WIDTH / 2 + 0.1 + i * (POST_WIDTH / 6), POST_HEIGHT / 2, -1.2]}>
                    <boxGeometry args={[0.02, POST_HEIGHT, 0.02]} />
                    <meshBasicMaterial color="#ffffff" transparent opacity={0.25} />
                </mesh>
            ))}

            {/* Horizontal net lines */}
            {Array.from({ length: 5 }).map((_, i) => (
                <mesh key={`hn${i}`} position={[0, 0.6 + i * 0.6, -1.2]}>
                    <boxGeometry args={[POST_WIDTH, 0.02, 0.02]} />
                    <meshBasicMaterial color="#ffffff" transparent opacity={0.25} />
                </mesh>
            ))}

            {/* ── NET SIDE PANELS (connect posts to back wall) ── */}
            {/* LEFT side net — vertical lines */}
            {Array.from({ length: 4 }).map((_, i) => (
                <mesh
                    key={`ls${i}`}
                    position={[
                        -POST_WIDTH / 2 + 0.05,           // flush with left post inner face
                        0.3 + i * (POST_HEIGHT / 4),       // spread vertically
                        -0.4 - i * 0.2,                   // angle back slightly
                    ]}
                >
                    <boxGeometry args={[0.02, POST_HEIGHT / 4, 0.02]} />
                    <meshBasicMaterial color="#ffffff" transparent opacity={0.25} />
                </mesh>
            ))}

            {/* LEFT side net — horizontal lines */}
            {Array.from({ length: 4 }).map((_, i) => (
                <mesh
                    key={`lsh${i}`}
                    position={[
                        -POST_WIDTH / 2 + 0.05,
                        0.5 + i * 0.6,
                        -0.6,                              // midpoint between post and back
                    ]}
                >
                    <boxGeometry args={[0.02, 0.02, 1.2]} />  {/* runs front to back */}
                    <meshBasicMaterial color="#ffffff" transparent opacity={0.25} />
                </mesh>
            ))}

            {/* RIGHT side net — vertical lines */}
            {Array.from({ length: 4 }).map((_, i) => (
                <mesh
                    key={`rs${i}`}
                    position={[
                        POST_WIDTH / 2 - 0.05,
                        0.3 + i * (POST_HEIGHT / 4),
                        -0.4 - i * 0.2,
                    ]}
                >
                    <boxGeometry args={[0.02, POST_HEIGHT / 4, 0.02]} />
                    <meshBasicMaterial color="#ffffff" transparent opacity={0.25} />
                </mesh>
            ))}

            {/* RIGHT side net — horizontal lines */}
            {Array.from({ length: 4 }).map((_, i) => (
                <mesh
                    key={`rsh${i}`}
                    position={[
                        POST_WIDTH / 2 - 0.05,
                        0.5 + i * 0.6,
                        -0.6,
                    ]}
                >
                    <boxGeometry args={[0.02, 0.02, 1.2]} />
                    <meshBasicMaterial color="#ffffff" transparent opacity={0.25} />
                </mesh>
            ))}

            {/* TOP net panel — connects crossbar to back wall */}
            {/* Horizontal lines running front to back at the top */}
            {Array.from({ length: 7 }).map((_, i) => (
                <mesh
                    key={`top${i}`}
                    position={[
                        -POST_WIDTH / 2 + 0.1 + i * (POST_WIDTH / 6),
                        POST_HEIGHT - 0.05,                // just under the crossbar
                        -0.6,                              // center between front and back
                    ]}
                >
                    <boxGeometry args={[0.02, 0.02, 1.2]} />
                    <meshBasicMaterial color="#ffffff" transparent opacity={0.25} />
                </mesh>
            ))}

            {/* TOP net — crosswise lines */}
            {Array.from({ length: 3 }).map((_, i) => (
                <mesh
                    key={`topc${i}`}
                    position={[
                        0,
                        POST_HEIGHT - 0.05,
                        -0.3 - i * 0.4,                   // spread front to back
                    ]}
                >
                    <boxGeometry args={[POST_WIDTH, 0.02, 0.02]} />
                    <meshBasicMaterial color="#ffffff" transparent opacity={0.25} />
                </mesh>
            ))}

            {/* Back wall physics — ball bounces back */}
            <RigidBody type="fixed" position={[0, POST_HEIGHT / 2, -2]} restitution={0.6} friction={0.3}>
                <CuboidCollider args={[POST_WIDTH / 2, POST_HEIGHT / 2, 0.1]} />
            </RigidBody>

            {/* Side net walls */}
            <RigidBody type="fixed" position={[-POST_WIDTH / 2, POST_HEIGHT / 2, -1]} restitution={0.4}>
                <CuboidCollider args={[0.1, POST_HEIGHT / 2, 1]} />
            </RigidBody>
            <RigidBody type="fixed" position={[POST_WIDTH / 2, POST_HEIGHT / 2, -1]} restitution={0.4}>
                <CuboidCollider args={[0.1, POST_HEIGHT / 2, 1]} />
            </RigidBody>

            {/* Top net */}
            <RigidBody type="fixed" position={[0, POST_HEIGHT + 0.1, -1]} restitution={0.3}>
                <CuboidCollider args={[POST_WIDTH / 2, 0.1, 1]} />
            </RigidBody>

            {/* GOAL SENSOR — replace old one */}
            <RigidBody type="fixed" colliders={false} sensor onIntersectionEnter={handleGoal}>
                <CuboidCollider
                    args={[POST_WIDTH / 2 - 0.3, POST_HEIGHT / 2, 0.8]}
                    position={[0, POST_HEIGHT / 2, -0.8]}
                />
            </RigidBody>

            {/* Score display above the goal: */}
            <Html position={[0, POST_HEIGHT + 2.5, 0]} center distanceFactor={14} transform>
                <div className="flex flex-col items-center gap-1 pointer-events-none">

                    {/* Always show high score */}
                    {highScore.current > 0 && (
                        <div
                            className="px-4 py-1.5 rounded-full font-mono text-xs font-bold"
                            style={{
                                background: 'rgba(245,200,66,0.15)',
                                border: '1px solid rgba(245,200,66,0.4)',
                                color: '#f5c842',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            🏆 BEST: {highScore.current} pts
                        </div>
                    )}

                    {/* Current shot score — appears and fades */}
                    {showScore && displayScore && (
                        <div
                            className="px-4 py-2 rounded-full font-mono font-bold text-sm"
                            style={{
                                background: displayScore.isHighScore ? 'rgba(245,200,66,0.25)' : 'rgba(255,255,255,0.1)',
                                border: `1px solid ${displayScore.isHighScore ? 'rgba(245,200,66,0.6)' : 'rgba(255,255,255,0.2)'}`,
                                color: displayScore.isHighScore ? '#f5c842' : '#ffffff',
                                whiteSpace: 'nowrap',
                                animation: 'scorePopIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            }}
                        >
                            {displayScore.isHighScore ? '🎉 NEW BEST! ' : ''}{displayScore.value} pts
                        </div>
                    )}

                    {/* Static label when no score */}
                    {!showScore && highScore.current === 0 && (
                        <div
                            className="px-3 py-1 rounded-full font-mono text-[10px]"
                            style={{
                                background: 'rgba(0,0,0,0.5)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#5a8a6a',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            ⚽ Hit the ball into the net!
                        </div>
                    )}

                </div>
            </Html>
        </group>
    );
}
