import type { QualityTier } from './deviceTier'

// VISUAL FIX: Tier-aware car material — no longer mirror-like
export const getCarBodyMaterial = (tier: QualityTier) => ({
  metalness:       tier === 'high' ? 0.65  : 0.40,
  roughness:       tier === 'high' ? 0.18  : 0.38,
  envMapIntensity: tier === 'high' ? 0.45  : tier === 'mid' ? 0.25 : 0.0,
})

// VISUAL FIX: Bowling lane floor — matte wood look, not chrome
export const getLaneFloorMaterial = () => ({
  metalness:        0.05,
  roughness:        0.85,
  envMapIntensity:  0.12,
  emissive:         '#112233' as const,
  emissiveIntensity: 0.12,   // subtle glow instead of mirror shine
})

// VISUAL FIX: Pin material — slightly matte
export const getPinMaterial = () => ({
  metalness:       0.05,
  roughness:       0.70,
  envMapIntensity: 0.10,
})
