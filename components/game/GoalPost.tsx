"use client";

import { useRef, useState } from "react";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { fireAchievement } from "./AchievementToast";
import { fireNotif } from "@/components/game/GameNotifications";

// Moved to SE corner
const GOAL_POS: [number, number, number] = [45, 0, 45];
const POST_HEIGHT = 3;
const POST_WIDTH = 5;
const POST_RADIUS = 0.12;
const POST_COLOR = "#ffffff";

export function GoalPost() {
    const [showScore, setShowScore] = useState(false)
    const [displayScore, setDisplayScore] = useState<{ value: number; isHighScore: boolean } | null>(null)
    const highScore = useRef(0)
    const setFootballScore = usePortfolioStore(s => s.setFootballScore)

    const goalCooldown = useRef(false);

    const handleGoal = (event: any) => {
        if (goalCooldown.current) return;

        // Try rigidBodyObject first, fall back to collider parent
        const obj = event.other?.rigidBodyObject ?? event.other?.collider?.parent?.();
        if (!obj?.userData?.isBall) return;   // reject car and everything else

        const rb = event.other?.rigidBody;
        if (!rb) return;

        const vel = rb.linvel();
        const speed = Math.sqrt(vel.x ** 2 + vel.y ** 2 + vel.z ** 2);
        if (speed < 1.5) return;  // too slow — not a real shot

        goalCooldown.current = true;
        setTimeout(() => { goalCooldown.current = false; }, 3000); // 3s cooldown

        const scoreValue = Math.round(speed * 10);
        const currentHigh = highScore.current;
        setFootballScore(scoreValue);

        if (scoreValue > currentHigh) {
            highScore.current = scoreValue;
            fireAchievement({
                type: 'football',
                title: 'GOAL!',
                value: `${scoreValue} pts`,
                subtext: '★ New record!',
                isRecord: true,
                duration: 4000,
            });
            fireNotif({
                type: 'goal',
                title: 'GOAL!',
                value: `${scoreValue} pts`,
                subtext: '🏆 New high score!',
                isRecord: true,
                color: '#00e676',
                duration: 4000,
            });
            window.dispatchEvent(new CustomEvent('game:clear', { detail: { game: 'football', isRecord: true, value: `${scoreValue} pts` } }));
        } else {
            fireAchievement({
                type: 'football',
                title: 'GOAL!',
                value: `${scoreValue} pts`,
                subtext: `Best: ${currentHigh} pts`,
                duration: 2500,
            });
            fireNotif({
                type: 'goal',
                title: 'GOAL!',
                value: `${scoreValue} pts`,
                subtext: `Best: ${currentHigh} pts`,
                isRecord: false,
                color: '#00e676',
                duration: 4000,
            });
            window.dispatchEvent(new CustomEvent('game:clear', { detail: { game: 'football', isRecord: false, value: `${scoreValue} pts` } }));
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

            {/* Score display removed — handled by DOM toasts */}
        </group>
    );
}
