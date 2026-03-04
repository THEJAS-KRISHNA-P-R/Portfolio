import React, { Suspense, useEffect, memo, useState, useCallback } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { AdaptiveEvents, PerformanceMonitor, KeyboardControls, Environment, Stars, Instances, Instance } from "@react-three/drei";
import { Physics, RigidBody, CuboidCollider } from "@react-three/rapier";
import { Car } from "./Car";
import { Football } from "./Football";
import { GoalPost } from "./GoalPost";
import { GoalCelebration } from "./GoalCelebration";
import { ZONES_ARRAY } from "@/lib/constants";
import { TriggerZone } from "./TriggerZone";
import { SpinningText, Aurora } from "../ui";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { getDeviceProfile } from "@/lib/deviceTier";
import { useQualityStore } from "@/store/useQualityStore";
import { GameLoadingScreen } from "./GameLoadingScreen";
import { Effects } from "./Effects";

const Bowling = React.lazy(() => import("./Bowling").then(mod => ({ default: mod.Bowling })));
const Maze = React.lazy(() => import("./Maze").then(mod => ({ default: mod.Maze })));

function FrameloopManager() {
    const { setFrameloop } = useThree()
    const isGameMode = usePortfolioStore(s => s.isGameMode)
    useEffect(() => {
        setFrameloop(isGameMode ? 'always' : 'demand')
    }, [isGameMode, setFrameloop])
    return null
}
const keyboardMap = [
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
    { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
    { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
    { name: 'right', keys: ['ArrowRight', 'KeyD'] },
    { name: 'boost', keys: ['Space'] },
    { name: 'reset', keys: ['KeyR', 'r'] },
];

const ARENA_SIZE = 120;

function WorldFallback() {
    return (
        <div className="absolute inset-0 bg-[#0a0a0f] flex items-center justify-center z-50">
            <Aurora />
            <div className="relative z-10 flex flex-col items-center">
                <div className="text-4xl mb-6">|||</div>
                <SpinningText text="LOADING WORLD..." radius={5} className="text-white font-mono text-sm tracking-widest" />
            </div>
        </div>
    );
}


function WorldEnvironment() {
    // Tree clusters — scattered naturally around edges
    const TREE_POSITIONS: [number, number, number][] = [
        [15, 0, 20], [18, 0, 22], [14, 0, 25],      // cluster near start
        [-20, 0, 30], [-24, 0, 28], [-18, 0, 33],
        [35, 0, -15], [38, 0, -18], [33, 0, -12],
        [-30, 0, -25], [-35, 0, -22],
        [55, 0, 40], [58, 0, 38], [52, 0, 44],
        [-50, 0, -50], [-55, 0, -48],
        [70, 0, -30], [65, 0, -35],
        [-60, 0, 60], [-64, 0, 56],
        [80, 0, 50], [-80, 0, -40], [40, 0, 80], [-40, 0, 80],
        [90, 0, -60], [-90, 0, 60],
    ]

// Rocks — scattered between trees
const ROCK_POSITIONS: [number, number, number][] = [
    [22, 0, 15], [-15, 0, -20], [40, 0, 10],
    [-35, 0, 45], [60, 0, -20], [-55, 0, 30],
    [10, 0, 50], [-10, 0, -55], [75, 0, 20],
]

function SolidRock({ position, scale = 1 }: { position: [number, number, number], scale?: number }) {
    return (
        <RigidBody type="fixed" colliders={false} position={position}>
            <CuboidCollider args={[0.55 * scale, 0.3 * scale, 0.5 * scale]} />
            <mesh castShadow scale={scale}>
                <dodecahedronGeometry args={[0.6, 0]} />
                <meshStandardMaterial color="#1a2a20" roughness={0.9} />
            </mesh>
        </RigidBody>
    )
}

// Lamp posts — along the roads
    const LAMP_POSITIONS: [number, number, number][] = [
        [4, 0, 20], [-4, 0, 20],
        [4, 0, -20], [-4, 0, -20],
        [4, 0, 60], [-4, 0, 60],
        [4, 0, -60], [-4, 0, -60],
        [20, 0, 4], [20, 0, -4],
        [-20, 0, 4], [-20, 0, -4],
        [60, 0, 4], [60, 0, -4],
        [-60, 0, 4], [-60, 0, -4],
    ]

    return (
        <>
            {/* Physics ground */}
            <RigidBody type="fixed" friction={0.8} restitution={0.1}>
                <CuboidCollider args={[200, 0.1, 200]} position={[0, -0.1, 0]} />
            </RigidBody>

            {/* Main ground plane — solid color, no grid */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
                <planeGeometry args={[400, 400]} />
                <meshStandardMaterial color="#0a1a12" roughness={0.95} metalness={0.0} />
            </mesh>

            {/* Road markings */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
                <planeGeometry args={[6, 300]} />
                <meshStandardMaterial color="#0d2218" roughness={1} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
                <planeGeometry args={[300, 6]} />
                <meshStandardMaterial color="#0d2218" roughness={1} />
            </mesh>

            {/* Ground variation patches */}
            {[
                [30, 0, 25], [-40, 0, -30], [60, 0, -50],
                [-70, 0, 45], [20, 0, -80], [-50, 0, 70],
                [90, 0, 10], [-20, 0, 90],
            ].map(([x, y, z], i) => (
                <mesh key={i} rotation={[-Math.PI / 2, 0, Math.random()]} position={[x, 0.002, z]}>
                    <circleGeometry args={[4 + Math.random() * 5, 8]} />
                    <meshStandardMaterial color="#071510" roughness={1} transparent opacity={0.6} />
                </mesh>
            ))}

            {/* INSTANCED TREES */}
            <Instances castShadow limit={50}>
                <cylinderGeometry args={[0.12, 0.18, 1.2, 6]} />
                <meshStandardMaterial color="#1a3d20" roughness={1} />
                {TREE_POSITIONS.map((pos, i) => <Instance key={`trunk-${i}`} position={[pos[0], pos[1] + 0.6, pos[2]]} />)}
            </Instances>
            <Instances castShadow limit={50}>
                <coneGeometry args={[0.9, 2.2, 6]} />
                <meshStandardMaterial color="#0d4a1f" roughness={1} />
                {TREE_POSITIONS.map((pos, i) => <Instance key={`foliage1-${i}`} position={[pos[0], pos[1] + 2.0, pos[2]]} />)}
            </Instances>
            <Instances castShadow limit={50}>
                <coneGeometry args={[0.6, 1.6, 6]} />
                <meshStandardMaterial color="#0f5a24" roughness={1} />
                {TREE_POSITIONS.map((pos, i) => <Instance key={`foliage2-${i}`} position={[pos[0], pos[1] + 2.9, pos[2]]} />)}
            </Instances>

            {/* SOLID ROCKS (FIXED COLLIDERS) */}
            {ROCK_POSITIONS.map((pos, i) => {
                const pseudoScale = 0.8 + Math.abs(Math.sin(i)) * 0.6;
                return <SolidRock key={`rock-${i}`} position={pos} scale={pseudoScale} />
            })}

            {/* INSTANCED LAMP POSTS */}
            <Instances castShadow limit={50}>
                <cylinderGeometry args={[0.05, 0.07, 3.5, 6]} />
                <meshStandardMaterial color="#223322" roughness={0.8} metalness={0.4} />
                {LAMP_POSITIONS.map((pos, i) => <Instance key={`lamp1-${i}`} position={pos} />)}
            </Instances>
            <Instances limit={50}>
                <boxGeometry args={[0.1, 0.1, 0.6]} />
                <meshStandardMaterial color="#223322" roughness={0.8} metalness={0.4} />
                {LAMP_POSITIONS.map((pos, i) => <Instance key={`lamp2-${i}`} position={[pos[0], pos[1] + 1.8, pos[2] + 0.3]} />)}
            </Instances>
            <Instances limit={50}>
                <sphereGeometry args={[0.12, 8, 8]} />
                <meshBasicMaterial color="#aaffcc" />
                {LAMP_POSITIONS.map((pos, i) => <Instance key={`lamp3-${i}`} position={[pos[0], pos[1] + 1.8, pos[2] + 0.55]} />)}
            </Instances>

            {/* Lamp Post Physics */}
            {LAMP_POSITIONS.map((pos, i) => (
                <RigidBody key={`lamp-phys-${i}`} type="fixed" position={pos}>
                    <CuboidCollider args={[0.15, 1.75, 0.15]} />
                </RigidBody>
            ))}

            {/* Tree Physics — simple cylinder collider for trunks only */}
            {TREE_POSITIONS.map((pos, i) => (
                <RigidBody key={`tree-phys-${i}`} type="fixed" position={[pos[0], pos[1] + 0.6, pos[2]]}>
                    <CuboidCollider args={[0.2, 0.6, 0.2]} />
                </RigidBody>
            ))}

            {/* LAMP POST LIGHTS */}
            {LAMP_POSITIONS.map((pos, i) => (
                <pointLight key={`light-${i}`} position={[pos[0], pos[1] + 1.8, pos[2] + 0.55]} color="#aaffcc" intensity={1.5} distance={12} decay={2} />
            ))}

            {/* Boundary walls — invisible physics, visible as low hedges */}
            {[
                { pos: [0, 0.3, 150] as [number, number, number], rot: [0, 0, 0] },
                { pos: [0, 0.3, -150] as [number, number, number], rot: [0, 0, 0] },
                { pos: [150, 0.3, 0] as [number, number, number], rot: [0, Math.PI / 2, 0] },
                { pos: [-150, 0.3, 0] as [number, number, number], rot: [0, Math.PI / 2, 0] },
            ].map(({ pos, rot }, i) => (
                <group key={`wall${i}`} position={pos} rotation={rot as any}>
                    {/* Visible hedge row */}
                    <mesh>
                        <boxGeometry args={[300, 1.5, 0.8]} />
                        <meshStandardMaterial color="#0a2a12" roughness={1} />
                    </mesh>
                </group>
            ))}

            {/* Boundary physics colliders */}
            <RigidBody type="fixed" friction={0.3}>
                <CuboidCollider args={[150, 2, 0.4]} position={[0, 1, 150]} />
                <CuboidCollider args={[150, 2, 0.4]} position={[0, 1, -150]} />
                <CuboidCollider args={[0.4, 2, 150]} position={[150, 1, 0]} />
                <CuboidCollider args={[0.4, 2, 150]} position={[-150, 1, 0]} />
            </RigidBody>

            {/* Small ramp */}
            <RigidBody type="fixed">
                <mesh position={[25, 0.3, 0]} rotation={[0, 0, -0.18]} castShadow receiveShadow>
                    <boxGeometry args={[8, 0.6, 4]} />
                    <meshStandardMaterial color="#0d2a18" roughness={0.9} />
                </mesh>
                <CuboidCollider args={[4, 0.3, 2]} position={[25, 0.3, 0]} rotation={[0, 0, -0.18] as any} />
            </RigidBody>

            {/* Second ramp */}
            <RigidBody type="fixed">
                <mesh position={[-25, 0.3, 0]} rotation={[0, 0, 0.18]} castShadow receiveShadow>
                    <boxGeometry args={[8, 0.6, 4]} />
                    <meshStandardMaterial color="#0d2a18" roughness={0.9} />
                </mesh>
                <CuboidCollider args={[4, 0.3, 2]} position={[-25, 0.3, 0]} rotation={[0, 0, 0.18] as any} />
            </RigidBody>
        </>
    )
}

function GameCanvas({ children }: { children: React.ReactNode }) {
  const profile = useQualityStore(s => s.profile)!
  const [dpr, setDpr] = useState(profile.dpr)

  return (
    <Canvas
      dpr={dpr}
      shadows={profile.shadows}
      gl={{
        antialias:           false,
        powerPreference:     'high-performance',
        stencil:             false,
        alpha:               false,
        toneMapping:         THREE.ACESFilmicToneMapping,
        // VISUAL FIX: Exposure boost — was 1.0/1.1, now per-tier
        toneMappingExposure: profile.tier === 'high' ? 1.3 : profile.tier === 'mid' ? 1.2 : 1.1,
        outputColorSpace:    THREE.SRGBColorSpace,
      }}
      onCreated={({ gl }) => {
        gl.shadowMap.enabled = profile.shadows
        gl.shadowMap.type    = profile.shadows
          ? THREE.PCFSoftShadowMap
          : THREE.BasicShadowMap
      }}
      camera={{ position: [0, 8, 12], fov: 58, near: 0.3, far: profile.tier === 'low' ? 150 : 300 }}
      performance={{ min: 0.4 }}
    >
      <AdaptiveEvents />
      <PerformanceMonitor
        bounds={() => profile.tier === 'low' ? [20, 30] : [40, 60]}
        onDecline={() => setDpr(d => {
          // VISUAL FIX: Minimum DPR floor on mobile — never go below 0.85 on phone
          const minDPR = profile.isMobile ? 0.85 : 1.0;
          return Math.max(minDPR, d - 0.1);
        })}
        onIncline={() => setDpr(d => Math.min(profile.dpr, d + 0.1))}
        onFallback={() => setDpr(profile.isMobile ? 0.5 : 1.0)}
      />
      <FrameloopManager />
      {children}
    </Canvas>
  )
}

function SceneLights() {
  const profile = useQualityStore(s => s.profile)!

  return (
    <>
      {/* VISUAL FIX: Background is dark navy */}
      <color attach="background" args={['#0a0f1a']} />
      <directionalLight
        position={[40, 60, 20]}
        intensity={2.52}
        color="#c8e8ff"
        castShadow={profile.shadows}
        shadow-mapSize={[profile.shadowMapSize, profile.shadowMapSize]}
        shadow-camera-near={1}
        shadow-camera-far={profile.tier === 'high' ? 120 : 80}
        shadow-camera-left={-60}  shadow-camera-right={60}
        shadow-camera-top={60}    shadow-camera-bottom={-60}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-30, 8, 40]} intensity={0.49} color="#ff9944" castShadow={false} />
      {profile.tier !== 'low' && (
        <directionalLight position={[-20, 15, -60]} intensity={0.7} color="#66aaff" castShadow={false} />
      )}
      {/* VISUAL FIX: Much brighter ambient — was too dark on all devices */}
      <ambientLight intensity={profile.tier === 'high' ? 1.3 : profile.tier === 'mid' ? 1.1 : 0.9} />
      {/* VISUAL FIX: Hemisphere sky/ground light boost — skyColor = color prop in THREE */}
      <hemisphereLight args={['#b0c8ff', '#1a2a1a', 0.9]} />
      {profile.tier !== 'low' && (
        <>
          <Stars radius={180} depth={50} count={profile.starCount} factor={3} saturation={0.8} fade speed={0.3} />
          {/* VISUAL FIX: Environment map — off on low mobile to save perf */}
          <Environment preset="night" background={false} resolution={profile.tier === 'high' ? 128 : 32} />
        </>
      )}
      {/* VISUAL FIX: Fog lightened so far objects aren't invisible */}
      {profile.fog && <fog attach="fog" args={['#0d1520', 40, 200]} />}
    </>
  )
}

function AdaptivePhysics({ children }: { children: React.ReactNode }) {
  const profile = useQualityStore(s => s.profile)!

  return (
    <Physics
      gravity={[0, -9.81, 0]}
      timeStep={1 / profile.physicsHz}
      interpolate
      colliders={false}
    >
      {children}
    </Physics>
  )
}

export function World() {
  const setProfile = useQualityStore(s => s.setProfile)
  const profile = useQualityStore(s => s.profile)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    getDeviceProfile().then(p => {
      setProfile(p)
      setReady(true)
    })
  }, [setProfile])

  if (!ready || !profile) return <GameLoadingScreen progress={0} message="Detecting device..." />

  return <GameWorld />
}

// LAZY LOAD FIX: Signals when the scene has mounted inside the Canvas
function SceneReadyNotifier({ onReady }: { onReady: () => void }) {
  useEffect(() => { onReady() }, [onReady])
  return null
}

function GameWorld() {
    const [sceneReady, setSceneReady] = useState(false)
    const handleReady = useCallback(() => setSceneReady(true), [])

    return (
        <div className="absolute inset-0 w-full h-full" style={{ touchAction: 'none', zIndex: 1 }}>
            <Suspense fallback={<WorldFallback />}>
                <KeyboardControls map={keyboardMap}>
                    {/* LAZY LOAD FIX: Crossfade from loader to scene — no hard flash */}
                    <div style={{
                        opacity: sceneReady ? 1 : 0,
                        transition: 'opacity 0.6s ease',
                        position: 'absolute',
                        inset: 0,
                    }}>
                    <GameCanvas>
                        {/* Scene */}
                        <SceneReadyNotifier onReady={handleReady} />
                        <SceneLights />
                        <Effects />

                        {/* Physics */}
                        <AdaptivePhysics>
                            {/* Ground first — synchronous */}
                            <WorldEnvironment />

                            {/* Car — synchronous (procedural mesh, no GLB) */}
                            <Car />

                            {/* Football */}
                            <Football />
                            <GoalPost />
                            <GoalCelebration />

                            {/* Corner Games & Ramp (Lazy Loaded) */}
                            <Suspense fallback={null}>
                                <BowlingZones />
                                <MazeZone />
                            </Suspense>

                            {/* Trigger Zones */}
                            {ZONES_ARRAY.map(zone => (
                                <TriggerZone
                                    key={zone.id}
                                    position={zone.position}
                                    zoneId={zone.id}
                                    color={zone.color}
                                    label={zone.label}
                                />
                            ))}
                        </AdaptivePhysics>
                    </GameCanvas>
                    </div>
                </KeyboardControls>
            </Suspense>
        </div>
    );
}

const BowlingZones = () => {
    const profile = useQualityStore(s => s.profile)!
    const carPos = usePortfolioStore(s => s.carPos)
    const dist = (wx: number, wz: number) =>
        Math.sqrt((carPos.x - wx) ** 2 + (carPos.z - wz) ** 2)
    const shouldRender = (wx: number, wz: number) =>
        !profile.lazyLoadZones || dist(wx, wz) < 100

    return shouldRender(-45, -45) ? (
        <Suspense fallback={null}>
            <Bowling />
        </Suspense>
    ) : null
}

const MazeZone = () => {
    const profile = useQualityStore(s => s.profile)!
    const carPos = usePortfolioStore(s => s.carPos)
    const dist = (wx: number, wz: number) =>
        Math.sqrt((carPos.x - wx) ** 2 + (carPos.z - wz) ** 2)
    const shouldRender = (wx: number, wz: number) =>
        !profile.lazyLoadZones || dist(wx, wz) < 100

    return shouldRender(-110, 110) ? (
        <Suspense fallback={null}>
            <Maze />
        </Suspense>
    ) : null
}
