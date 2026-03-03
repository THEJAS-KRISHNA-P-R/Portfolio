"use client";

import { useMemo, useRef, useEffect, memo } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody, CuboidCollider, BallCollider } from "@react-three/rapier";
import { Html, RoundedBox, Instances, Instance } from "@react-three/drei";
import * as THREE from "three";
import { createNoise2D } from "simplex-noise";
import { ZONES_ARRAY } from "@/lib/constants";
import { theme } from "@/lib/theme";

// ── Height-map config ───────────────────────────────────────────────
const TERRAIN_SIZE = 120;       // world units
const SEGMENTS = 100;           // Fix 2: was 80 — smoother slope transitions
const HEIGHT_SCALE = 5.5;       // Fix 2: was 3.5 — taller hills, more dramatic terrain
const NOISE_FREQ = 0.022;       // Fix 2: was 0.025 — more varied landscape
const NOISE_OCTAVES = 3;

const noise2D = createNoise2D();

// Flatten terrain near zones, center spawn, and corners
const FLAT_ZONES = [
    { x: 0, z: 0, radius: 14 },     // Center
    { x: -45, z: -45, radius: 15 }, // NW Corner: Bowling
    { x: -110, z: 110, radius: 25 },// SW Corner: Maze
    { x: 45, z: 45, radius: 16 },   // SE Corner: Football
    ...ZONES_ARRAY.map(z => ({ x: z.position[0], z: z.position[2], radius: 12 })),
];

function flattenFactor(wx: number, wz: number): number {
    let closest = 1;
    for (const fz of FLAT_ZONES) {
        const dist = Math.sqrt((wx - fz.x) ** 2 + (wz - fz.z) ** 2);
        const f = Math.min(1, Math.max(0, (dist - fz.radius) / 10));  // Fix 2: was /6
        closest = Math.min(closest, f);
    }
    return closest;
}

function sampleHeight(wx: number, wz: number): number {
    let h = 0;
    let amp = 1;
    let freq = NOISE_FREQ;
    for (let o = 0; o < NOISE_OCTAVES; o++) {
        h += noise2D(wx * freq, wz * freq) * amp;
        amp *= 0.5;
        freq *= 2;
    }
    return h * HEIGHT_SCALE * flattenFactor(wx, wz);
}

/** Get terrain height at any world (x, z). Used by Car spawn, tree placement. */
export function getHeight(x: number, z: number): number {
    return sampleHeight(x, z);
}

// Helper to keep trees/boulders away from zones
const isInsideZone = (x: number, z: number, padding = 10) =>
    ZONES_ARRAY.some(
        (zone) =>
            Math.abs(x - zone.position[0]) < padding &&
            Math.abs(z - zone.position[2]) < padding
    ) || (Math.abs(x) < 12 && Math.abs(z) < 12); // also avoid spawn

// Vertex color based on height
function heightColor(h: number): THREE.Color {
    const t = THREE.MathUtils.clamp((h + HEIGHT_SCALE) / (HEIGHT_SCALE * 2), 0, 1);
    const low = new THREE.Color("#1a472a");   // dark green valley
    const mid = new THREE.Color("#2d5a27");   // green
    const high = new THREE.Color("#5a3d1a");   // brown peak
    if (t < 0.5) return low.clone().lerp(mid, t * 2);
    return mid.clone().lerp(high, (t - 0.5) * 2);
}

export const Terrain = memo(function Terrain() {
    // Build geometry once — Fix 0c: heightData removed from return
    const { geometry, trees, boulders } = useMemo(() => {
        const geo = new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, SEGMENTS, SEGMENTS);
        geo.rotateX(-Math.PI / 2);

        const pos = geo.attributes.position;
        const cols = SEGMENTS + 1;
        const colors = new Float32Array(pos.count * 3);

        // Fix 1: Correct height sampling — iterate with proper grid coords
        for (let i = 0; i < pos.count; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            // Map grid coordinates to world coordinates
            const wx = -TERRAIN_SIZE / 2 + (col / SEGMENTS) * TERRAIN_SIZE;
            const wz = -TERRAIN_SIZE / 2 + (row / SEGMENTS) * TERRAIN_SIZE;
            const h = sampleHeight(wx, wz);
            pos.setY(i, h);

            const c = heightColor(h);
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }

        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.computeVertexNormals();

        // Trees
        const tempTrees: { position: [number, number, number]; scale: number }[] = [];
        for (let i = 0; i < 30; i++) {
            let x: number, z: number;
            do {
                x = (Math.random() - 0.5) * (TERRAIN_SIZE - 10);
                z = (Math.random() - 0.5) * (TERRAIN_SIZE - 10);
            } while (isInsideZone(x, z));
            const y = sampleHeight(x, z);
            const scale = 0.8 + Math.random() * 0.5;
            tempTrees.push({ position: [x, y, z], scale });
        }

        // Boulders
        const tempBoulders: { position: [number, number, number]; scale: number; rotation: number }[] = [];
        for (let i = 0; i < 12; i++) {
            let x: number, z: number;
            do {
                x = (Math.random() - 0.5) * (TERRAIN_SIZE - 20);
                z = (Math.random() - 0.5) * (TERRAIN_SIZE - 20);
            } while (isInsideZone(x, z, 12));
            const y = sampleHeight(x, z);
            tempBoulders.push({
                position: [x, y + 0.3, z],
                scale: 0.6 + Math.random() * 0.8,
                rotation: Math.random() * Math.PI * 2,
            });
        }

        return { geometry: geo, trees: tempTrees, boulders: tempBoulders };
    }, []);

    // Dispose geometry when component unmounts
    useEffect(() => () => { geometry.dispose() }, [geometry])

    return (
        <>
            {/* Fix 0: Visual terrain mesh (no physics — just looks good) */}
            <mesh geometry={geometry} receiveShadow>
                <meshStandardMaterial vertexColors roughness={0.85} />
            </mesh>

            {/* Flat physics ground — always at Y=0, large enough to cover entire world */}
            <RigidBody type="fixed" position={[0, -0.5, 0]}>
                <CuboidCollider args={[TERRAIN_SIZE, 0.5, TERRAIN_SIZE]} />
            </RigidBody>

            {/* 2. GRID OVERLAY */}
            <gridHelper args={[TERRAIN_SIZE, 60, theme.colors.border, theme.colors.border]} position={[0, 0.05, 0]} />

            {/* 3. DECORATIVE TREES (Instanced) */}
            <Instances castShadow receiveShadow limit={100}>
                <cylinderGeometry args={[0.15, 0.25, 1.5]} />
                <meshStandardMaterial color="#4a2c0a" />
                {trees.map((tree, i) => (
                    <Instance
                        key={`trunk-${i}`}
                        position={[tree.position[0], tree.position[1] + 0.75 * tree.scale, tree.position[2]]}
                        scale={tree.scale}
                    />
                ))}
            </Instances>

            {/* Tree Physics */}
            {trees.map((tree, i) => (
                <RigidBody key={`tree-phys-${i}`} type="fixed" position={[tree.position[0], tree.position[1] + 0.75 * tree.scale, tree.position[2]]}>
                    <CuboidCollider args={[0.25 * tree.scale, 1.5 * tree.scale, 0.25 * tree.scale]} />
                </RigidBody>
            ))}

            <Instances castShadow receiveShadow limit={100}>
                <coneGeometry args={[1, 2.5, 8]} />
                <meshStandardMaterial color="#2d5a27" />
                {trees.map((tree, i) => (
                    <Instance
                        key={`leaves-${i}`}
                        position={[tree.position[0], tree.position[1] + 2.5 * tree.scale, tree.position[2]]}
                        scale={tree.scale}
                    />
                ))}
            </Instances>

            {/* 4. BOULDERS (Instanced Visuals) */}
            <Instances castShadow receiveShadow limit={50}>
                <icosahedronGeometry args={[1, 0]} />
                <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
                {boulders.map((b, i) => (
                    <Instance
                        key={`boulder-vis-${i}`}
                        position={b.position}
                        rotation={[0, b.rotation, 0]}
                        scale={b.scale}
                    />
                ))}
            </Instances>

            {/* Boulder Physics (Invisible true spheres) */}
            {boulders.map((b, i) => (
                <RigidBody key={`boulder-phys-${i}`} type="fixed" position={[b.position[0], b.position[1], b.position[2]]}>
                    <BallCollider args={[b.scale]} />
                </RigidBody>
            ))}

            {/* 5. ZONE BUILDINGS */}
            {ZONES_ARRAY.map((zone) => (
                <ZoneBuilding key={zone.id} zone={zone} />
            ))}

            {/* 6. BOUNDARY WALLS (Invisible) */}
            <RigidBody type="fixed" position={[0, 5, -TERRAIN_SIZE / 2 - 2]}>
                <CuboidCollider args={[TERRAIN_SIZE / 2, 10, 1]} />
            </RigidBody>
            <RigidBody type="fixed" position={[0, 5, TERRAIN_SIZE / 2 + 2]}>
                <CuboidCollider args={[TERRAIN_SIZE / 2, 10, 1]} />
            </RigidBody>
            <RigidBody type="fixed" position={[-TERRAIN_SIZE / 2 - 2, 5, 0]}>
                <CuboidCollider args={[1, 10, TERRAIN_SIZE / 2]} />
            </RigidBody>
            <RigidBody type="fixed" position={[TERRAIN_SIZE / 2 + 2, 5, 0]}>
                <CuboidCollider args={[1, 10, TERRAIN_SIZE / 2]} />
            </RigidBody>

            {/* 7. Ambient light near football spawn */}
            <pointLight color="#ffffff" intensity={0.5} distance={8} position={[45, 2, 30]} />
        </>
    );
})

// Animated emissive zone buildings
function ZoneBuilding({ zone }: { zone: typeof ZONES_ARRAY[0] }) {
    const materialRef = useRef<THREE.MeshStandardMaterial>(null);

    useFrame(({ clock }) => {
        if (materialRef.current) {
            materialRef.current.emissiveIntensity = 0.2 + Math.sin(clock.elapsedTime * 2) * 0.15;
        }
    });

    const y = getHeight(zone.position[0], zone.position[2]);

    return (
        <group position={[zone.position[0], y, zone.position[2]]}>
            <RoundedBox args={[4, 5, 4]} radius={0.08} smoothness={3} position={[0, 2.5, 0]} castShadow receiveShadow>
                <meshStandardMaterial
                    ref={materialRef}
                    color={zone.color}
                    emissive={zone.color}
                    roughness={0.4}
                />
            </RoundedBox>

            <Html
                position={[0, 4, 0]}
                center
                distanceFactor={15}
                occlude="blending"
                transform
            >
                <div
                    className="px-3 py-1 rounded-full backdrop-blur-md font-mono text-sm whitespace-nowrap shadow-lg flex items-center border border-white/20"
                    style={{
                        backgroundColor: `${zone.color}40`,
                        color: zone.color,
                        textShadow: `0 0 10px ${zone.color}`
                    }}
                >
                    {zone.label}
                </div>
            </Html>
        </group>
    );
}
