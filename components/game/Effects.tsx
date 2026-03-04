"use client"

import { Suspense, useMemo } from "react"
import * as THREE from "three"
import { EffectComposer, Bloom, Vignette, SMAA, N8AO, ChromaticAberration } from "@react-three/postprocessing"
import { EdgeDetectionMode, SMAAPreset, BlendFunction } from "postprocessing"
import { useQualityStore } from "@/store/useQualityStore"

export function Effects() {
  const profile = useQualityStore(s => s.profile)!

  // Low tier: zero post-processing
  if (!profile.postprocessing) return null

  // Mid tier: bloom + SMAA + vignette only
  if (profile.tier === 'mid') {
    return (
      <Suspense fallback={null}>
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom mipmapBlur luminanceThreshold={0.9} luminanceSmoothing={0.7} intensity={0.5} height={256} />
          <Vignette offset={0.25} darkness={0.55} blendFunction={BlendFunction.NORMAL} />
          <SMAA preset={SMAAPreset.LOW} edgeDetectionMode={EdgeDetectionMode.LUMA} />
        </EffectComposer>
      </Suspense>
    )
  }

  // High tier: full stack
  const caOffset = useMemo(() => new THREE.Vector2(0.0005, 0.0005), [])
  return (
    <Suspense fallback={null}>
      <EffectComposer multisampling={0} enableNormalPass>
        <N8AO aoRadius={3} intensity={2.5} distanceFalloff={1.2} halfRes quality="performance" />
        <Bloom mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.8} intensity={1.2} height={512} kernelSize={3} />
        <ChromaticAberration offset={caOffset} radialModulation={false} modulationOffset={0.5} blendFunction={BlendFunction.NORMAL} />
        <SMAA preset={SMAAPreset.HIGH} edgeDetectionMode={EdgeDetectionMode.COLOR} />
        <Vignette offset={0.2} darkness={0.65} blendFunction={BlendFunction.NORMAL} />
      </EffectComposer>
    </Suspense>
  )
}
