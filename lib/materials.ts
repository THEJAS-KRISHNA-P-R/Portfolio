import type { QualityTier } from './deviceTier'

// DESKTOP PERF FIX: isMobile now drives separate envMapIntensity paths
export const getCarBodyMaterial = (tier: QualityTier, isMobile = false) => ({
  metalness:       tier === 'high' ? 0.65  : 0.40,
  roughness:       tier === 'high' ? 0.18  : 0.38,
  // Mobile keeps lower values to avoid IBL cost on GPU-constrained devices
  // Desktop halved from previous values — was causing mirror-chrome look
  envMapIntensity: isMobile
    ? (tier === 'high' ? 0.30 : tier === 'mid' ? 0.15 : 0.0)
    : (tier === 'high' ? 0.40 : tier === 'mid' ? 0.20 : 0.10),
})

// DESKTOP PERF FIX: Near-zero env map on lane — should look like matte wood
export const getLaneFloorMaterial = () => ({
  metalness:        0.04,
  roughness:        0.88,
  envMapIntensity:  0.08,
  emissive:         '#112233' as const,
  emissiveIntensity: 0.10,
})

// VISUAL FIX: Pin material — slightly matte
export const getPinMaterial = () => ({
  metalness:       0.05,
  roughness:       0.70,
  envMapIntensity: 0.10,
})
