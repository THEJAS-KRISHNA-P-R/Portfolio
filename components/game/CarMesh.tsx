"use client";

import { useRef, useMemo, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";

/**
 * Smooth procedural Mustang-style car.
 * Uses THREE.Shape + ExtrudeGeometry for a curved body profile.
 * Wheels spin based on speed, front wheels steer visually.
 */

export interface CarMeshHandle {
    update: (speed: number, steer: number, dt: number) => void;
}

// ── Dimensions ───────────────────────────────────────────────────────
const HALF_W = 0.85;       // half body width
const WHEEL_R = 0.3;
const WHEEL_W = 0.2;
const AXLE_X = HALF_W + 0.12;
const FRONT_Z = -1.15;
const REAR_Z = 1.05;

// ── Colors ───────────────────────────────────────────────────────────
const PAINT = "#c0392b";         // deep Mustang red
const PAINT_DARK = "#922b21";    // darker shade for lower body
const GLASS = "#1a2940";
const CHROME = "#d0d0d0";
const WHEEL_CLR = "#1a1a1a";
const RIM_CLR = "#b0b0b0";
const HEADLIGHT = "#ffffcc";
const TAILLIGHT = "#ff1a1a";
const INDICATOR = "#ffaa00";

export const CarMesh = forwardRef<CarMeshHandle, object>(function CarMesh(_, ref) {
    const wheelFL = useRef<THREE.Group>(null);
    const wheelFR = useRef<THREE.Group>(null);
    const wheelRL = useRef<THREE.Group>(null);
    const wheelRR = useRef<THREE.Group>(null);
    const steerFL = useRef<THREE.Group>(null);
    const steerFR = useRef<THREE.Group>(null);
    const spinAngle = useRef(0);

    useImperativeHandle(ref, () => ({
        update(speed: number, steer: number, dt: number) {
            const spinDelta = (speed / (WHEEL_R * 2 * Math.PI)) * Math.PI * 2 * dt;
            spinAngle.current += spinDelta;
            [wheelFL, wheelFR, wheelRL, wheelRR].forEach(w => {
                if (w.current) w.current.rotation.x = spinAngle.current;
            });
            const steerAngle = steer * 0.4;
            if (steerFL.current) steerFL.current.rotation.y = steerAngle;
            if (steerFR.current) steerFR.current.rotation.y = steerAngle;
        }
    }));

    // ── Body profile (side view: Z = forward, Y = up) ────────────────
    const bodyGeo = useMemo(() => {
        const shape = new THREE.Shape();

        // Start at rear bottom
        shape.moveTo(1.7, 0.15);

        // Rear lower body
        shape.lineTo(1.7, 0.55);

        // Rear deck (trunk) — slight rise
        shape.quadraticCurveTo(1.55, 0.68, 1.35, 0.72);

        // Rear window (fastback slope)
        shape.quadraticCurveTo(0.9, 1.05, 0.5, 1.1);

        // Roof
        shape.quadraticCurveTo(0.1, 1.12, -0.3, 1.08);

        // Windshield slope
        shape.quadraticCurveTo(-0.65, 0.95, -0.85, 0.7);

        // Hood — long, slightly curved (Mustang signature)
        shape.quadraticCurveTo(-1.1, 0.65, -1.4, 0.58);
        shape.quadraticCurveTo(-1.55, 0.55, -1.72, 0.5);

        // Front bumper — drops down
        shape.quadraticCurveTo(-1.78, 0.35, -1.75, 0.18);

        // Front bottom
        shape.lineTo(-1.72, 0.12);

        // Underside
        shape.lineTo(1.7, 0.12);
        shape.lineTo(1.7, 0.15);

        const extrudeSettings = {
            steps: 1,
            depth: HALF_W * 2,
            bevelEnabled: true,
            bevelThickness: 0.06,
            bevelSize: 0.04,
            bevelSegments: 3,
        };

        const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        // Center the extrusion
        geo.translate(0, 0, -HALF_W);
        // Rotate so Z is forward (shape was drawn in XY, extrude along Z)
        // We want the shape's X to become our Z (forward), shape's Y is our Y (up)
        // and extrude direction (Z) becomes our X (width)
        geo.rotateY(Math.PI / 2);
        geo.computeVertexNormals();
        return geo;
    }, []);

    // ── Glass (windshield + rear window) ─────────────────────────────
    const windshieldGeo = useMemo(() => {
        const shape = new THREE.Shape();
        // Windshield trapezoid
        shape.moveTo(-0.65, 0);
        shape.lineTo(0.65, 0);
        shape.lineTo(0.55, 0.38);
        shape.lineTo(-0.55, 0.38);
        shape.lineTo(-0.65, 0);

        const geo = new THREE.ShapeGeometry(shape);
        return geo;
    }, []);

    const rearWindowGeo = useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(-0.6, 0);
        shape.lineTo(0.6, 0);
        shape.lineTo(0.5, 0.3);
        shape.lineTo(-0.5, 0.3);
        shape.lineTo(-0.6, 0);

        const geo = new THREE.ShapeGeometry(shape);
        return geo;
    }, []);

    return (
        <group>
            {/* ── Main body ────────────────────────────────────── */}
            <mesh geometry={bodyGeo} castShadow receiveShadow>
                <meshStandardMaterial
                    color={PAINT}
                    metalness={0.7}
                    roughness={0.25}
                    flatShading={false}
                />
            </mesh>

            {/* Lower trim (darker) */}
            <mesh position={[0, 0.12, 0]} castShadow>
                <boxGeometry args={[HALF_W * 2 + 0.08, 0.1, 3.4]} />
                <meshStandardMaterial color={PAINT_DARK} metalness={0.5} roughness={0.4} />
            </mesh>

            {/* ── Windshield ───────────────────────────────────── */}
            <group position={[0, 0.72, -0.75]} rotation={[-0.65, 0, 0]}>
                <mesh geometry={windshieldGeo}>
                    <meshStandardMaterial
                        color={GLASS}
                        metalness={0.9}
                        roughness={0.05}
                        transparent
                        opacity={0.7}
                    />
                </mesh>
            </group>

            {/* ── Rear window ──────────────────────────────────── */}
            <group position={[0, 0.78, 0.75]} rotation={[0.75, 0, 0]}>
                <mesh geometry={rearWindowGeo}>
                    <meshStandardMaterial
                        color={GLASS}
                        metalness={0.9}
                        roughness={0.05}
                        transparent
                        opacity={0.7}
                    />
                </mesh>
            </group>

            {/* ── Side windows ─────────────────────────────────── */}
            {[-1, 1].map(side => (
                <mesh
                    key={`sw-${side}`}
                    position={[side * (HALF_W + 0.04), 0.88, -0.05]}
                    rotation={[0, (side * Math.PI) / 2, 0]}
                >
                    <planeGeometry args={[1.1, 0.28]} />
                    <meshStandardMaterial
                        color={GLASS}
                        metalness={0.9}
                        roughness={0.05}
                        transparent
                        opacity={0.65}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            ))}

            {/* ── Front grille ─────────────────────────────────── */}
            <mesh position={[0, 0.38, -1.76]} castShadow>
                <boxGeometry args={[1.3, 0.22, 0.06]} />
                <meshStandardMaterial color="#111111" metalness={0.3} roughness={0.8} />
            </mesh>
            {/* Chrome grille trim */}
            <mesh position={[0, 0.38, -1.78]}>
                <boxGeometry args={[1.35, 0.02, 0.02]} />
                <meshStandardMaterial color={CHROME} metalness={0.9} roughness={0.1} />
            </mesh>

            {/* ── Headlights ───────────────────────────────────── */}
            {[-0.55, 0.55].map(x => (
                <group key={`hl-${x}`} position={[x, 0.44, -1.76]}>
                    <mesh>
                        <boxGeometry args={[0.28, 0.14, 0.08]} />
                        <meshStandardMaterial
                            color={HEADLIGHT}
                            emissive={HEADLIGHT}
                            emissiveIntensity={0.6}
                            metalness={0.3}
                            roughness={0.2}
                        />
                    </mesh>
                    {/* Light housing */}
                    <mesh position={[0, 0, 0.04]}>
                        <boxGeometry args={[0.32, 0.18, 0.04]} />
                        <meshStandardMaterial color={CHROME} metalness={0.8} roughness={0.15} />
                    </mesh>
                </group>
            ))}

            {/* ── Front indicators ─────────────────────────────── */}
            {[-0.72, 0.72].map(x => (
                <mesh key={`ind-${x}`} position={[x, 0.34, -1.74]}>
                    <boxGeometry args={[0.12, 0.06, 0.06]} />
                    <meshStandardMaterial
                        color={INDICATOR}
                        emissive={INDICATOR}
                        emissiveIntensity={0.3}
                    />
                </mesh>
            ))}

            {/* ── Taillights (triple bar — Mustang signature) ──── */}
            {[-1, 1].map(side => (
                <group key={`tl-${side}`} position={[side * 0.5, 0.48, 1.72]}>
                    {[0, 0.1, 0.2].map((dy, i) => (
                        <mesh key={i} position={[0, dy - 0.1, 0]}>
                            <boxGeometry args={[0.28, 0.06, 0.06]} />
                            <meshStandardMaterial
                                color={TAILLIGHT}
                                emissive={TAILLIGHT}
                                emissiveIntensity={0.5}
                            />
                        </mesh>
                    ))}
                </group>
            ))}

            {/* ── Rear bumper chrome ───────────────────────────── */}
            <mesh position={[0, 0.22, 1.73]}>
                <boxGeometry args={[1.5, 0.06, 0.04]} />
                <meshStandardMaterial color={CHROME} metalness={0.9} roughness={0.1} />
            </mesh>

            {/* ── Side stripe (Mustang racing stripe) ──────────── */}
            {[-1, 1].map(side => (
                <mesh
                    key={`stripe-${side}`}
                    position={[side * (HALF_W + 0.02), 0.4, 0]}
                    rotation={[0, (side * Math.PI) / 2, 0]}
                >
                    <planeGeometry args={[3.2, 0.04]} />
                    <meshStandardMaterial
                        color="#ffffff"
                        metalness={0.3}
                        roughness={0.6}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            ))}

            {/* ── Wheel arches (slight bulge) ──────────────────── */}
            {[
                [-AXLE_X + 0.1, 0.3, FRONT_Z],
                [AXLE_X - 0.1, 0.3, FRONT_Z],
                [-AXLE_X + 0.1, 0.3, REAR_Z],
                [AXLE_X - 0.1, 0.3, REAR_Z],
            ].map((pos, i) => (
                <mesh key={`arch-${i}`} position={pos as [number, number, number]}>
                    <boxGeometry args={[0.18, 0.35, 0.55]} />
                    <meshStandardMaterial color={PAINT_DARK} metalness={0.5} roughness={0.4} />
                </mesh>
            ))}

            {/* ── Wheels ───────────────────────────────────────── */}
            {/* Front-Left */}
            <group position={[-AXLE_X, WHEEL_R, FRONT_Z]}>
                <group ref={steerFL}>
                    <group ref={wheelFL}>
                        <SmoothWheel side="left" />
                    </group>
                </group>
            </group>

            {/* Front-Right */}
            <group position={[AXLE_X, WHEEL_R, FRONT_Z]}>
                <group ref={steerFR}>
                    <group ref={wheelFR}>
                        <SmoothWheel side="right" />
                    </group>
                </group>
            </group>

            {/* Rear-Left */}
            <group position={[-AXLE_X, WHEEL_R, REAR_Z]}>
                <group ref={wheelRL}>
                    <SmoothWheel side="left" />
                </group>
            </group>

            {/* Rear-Right */}
            <group position={[AXLE_X, WHEEL_R, REAR_Z]}>
                <group ref={wheelRR}>
                    <SmoothWheel side="right" />
                </group>
            </group>
        </group>
    );
});

/** Smooth wheel with tire, rim, and spokes */
function SmoothWheel({ side }: { side: "left" | "right" }) {
    const sign = side === "left" ? -1 : 1;

    const spokeGeo = useMemo(() => {
        return new THREE.BoxGeometry(WHEEL_R * 0.12, WHEEL_R * 1.6, 0.03);
    }, []);

    return (
        <group rotation={[0, 0, (Math.PI / 2) * sign]}>
            {/* Tire — high segment count for smoothness */}
            <mesh castShadow>
                <cylinderGeometry args={[WHEEL_R, WHEEL_R, WHEEL_W, 24]} />
                <meshStandardMaterial color={WHEEL_CLR} roughness={0.85} metalness={0.1} />
            </mesh>

            {/* Tire sidewall detail */}
            <mesh>
                <torusGeometry args={[WHEEL_R, 0.03, 8, 24]} />
                <meshStandardMaterial color="#333333" roughness={0.9} />
            </mesh>

            {/* Rim center disc */}
            <mesh position={[0, sign * (WHEEL_W / 2 + 0.01), 0]}>
                <cylinderGeometry args={[WHEEL_R * 0.55, WHEEL_R * 0.55, 0.04, 24]} />
                <meshStandardMaterial color={RIM_CLR} metalness={0.85} roughness={0.12} />
            </mesh>

            {/* Spokes — 5 spoke pattern */}
            {[0, 1, 2, 3, 4].map(i => (
                <mesh
                    key={i}
                    geometry={spokeGeo}
                    position={[0, sign * (WHEEL_W / 2 + 0.02), 0]}
                    rotation={[0, (i * Math.PI * 2) / 5, 0]}
                >
                    <meshStandardMaterial color={RIM_CLR} metalness={0.8} roughness={0.15} />
                </mesh>
            ))}

            {/* Center cap */}
            <mesh position={[0, sign * (WHEEL_W / 2 + 0.03), 0]}>
                <cylinderGeometry args={[WHEEL_R * 0.12, WHEEL_R * 0.12, 0.04, 12]} />
                <meshStandardMaterial color={CHROME} metalness={0.9} roughness={0.1} />
            </mesh>
        </group>
    );
}
