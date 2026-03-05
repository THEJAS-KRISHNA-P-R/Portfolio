"use client"

import { Suspense, useMemo } from "react"
import * as THREE from "three"
import { EffectComposer, Bloom, Vignette, SMAA, N8AO, ChromaticAberration } from "@react-three/postprocessing"
import { EdgeDetectionMode, SMAAPreset, BlendFunction } from "postprocessing"
import { useQualityStore } from "@/store/useQualityStore"

export function Effects() {
  const profile = useQualityStore(s => s.profile)!

  // ── MOBILE: no post-processing (exactly as before) ────────────────────
  if (profile.isMobile && !profile.postprocessing) return null

  // ── MOBILE mid-tier: minimal (exactly as before) ──────────────────────
  if (profile.isMobile && profile.tier === 'mid') {
    return (
      <Suspense fallback={null}>
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom
            mipmapBlur
            luminanceThreshold={0.9}
            luminanceSmoothing={0.7}
            intensity={0.4}
            height={256}
          />
          <Vignette offset={0.25} darkness={0.55} blendFunction={BlendFunction.NORMAL} />
          <SMAA preset={SMAAPreset.LOW} edgeDetectionMode={EdgeDetectionMode.LUMA} />
        </EffectComposer>
      </Suspense>
    )
  }

  // ── MOBILE high-tier: medium (exactly as before) ──────────────────────
  if (profile.isMobile && profile.tier === 'high') {
    return (
      <Suspense fallback={null}>
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom
            mipmapBlur
            luminanceThreshold={0.88}
            luminanceSmoothing={0.75}
            intensity={0.7}
            height={320}
          />
          <Vignette offset={0.22} darkness={0.6} blendFunction={BlendFunction.NORMAL} />
          <SMAA preset={SMAAPreset.MEDIUM} edgeDetectionMode={EdgeDetectionMode.LUMA} />
        </EffectComposer>
      </Suspense>
    )
  }

  // ── DESKTOP low-tier (old laptop): minimal but sharp ─────────────────
  if (!profile.isMobile && profile.tier === 'low') {
    return (
      <Suspense fallback={null}>
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom
            mipmapBlur
            luminanceThreshold={0.92}
            luminanceSmoothing={0.8}
            intensity={0.35}
            height={256}
          />
          <SMAA preset={SMAAPreset.MEDIUM} edgeDetectionMode={EdgeDetectionMode.COLOR} />
          <Vignette offset={0.2} darkness={0.5} blendFunction={BlendFunction.NORMAL} />
        </EffectComposer>
      </Suspense>
    )
  }

  // ── DESKTOP mid-tier: bloom + SMAA + vignette ────────────────────────
  if (!profile.isMobile && profile.tier === 'mid') {
    return (
      <Suspense fallback={null}>
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom
            mipmapBlur
            luminanceThreshold={0.87}
            luminanceSmoothing={0.78}
            intensity={0.9}
            height={384}
            kernelSize={3}
          />
          <SMAA preset={SMAAPreset.HIGH} edgeDetectionMode={EdgeDetectionMode.COLOR} />
          <Vignette offset={0.2} darkness={0.6} blendFunction={BlendFunction.NORMAL} />
        </EffectComposer>
      </Suspense>
    )
  }

  // ── DESKTOP high-tier: full cinematic stack ──────────────────────────
  const caOffset = useMemo(() => new THREE.Vector2(0.0004, 0.0004), [])

  return (
    <Suspense fallback={null}>
      <EffectComposer multisampling={0} enableNormalPass>

        {/* SSAO — contact shadows, kills flat look */}
        <N8AO
          aoRadius={4}
          intensity={2.8}
          distanceFalloff={1.0}
          screenSpaceRadius={false}
          halfRes
          color={new THREE.Color(0x000000)}
          quality="performance"
        />

        {/* Selective bloom — only emissive > 1.0 glows */}
        <Bloom
          mipmapBlur
          luminanceThreshold={0.85}
          luminanceSmoothing={0.8}
          intensity={1.3}
          height={512}
          kernelSize={3}
        />

        {/* Subtle chromatic aberration — real lens feel */}
        <ChromaticAberration
          offset={caOffset}
          radialModulation={false}
          modulationOffset={0.5}
          blendFunction={BlendFunction.NORMAL}
        />

        {/* SMAA HIGH — best AA, no ghosting, works with SSAO */}
        <SMAA
          preset={SMAAPreset.ULTRA}
          edgeDetectionMode={EdgeDetectionMode.COLOR}
        />

        {/* Vignette */}
        <Vignette offset={0.18} darkness={0.65} blendFunction={BlendFunction.NORMAL} />

      </EffectComposer>
    </Suspense>
  )
}
