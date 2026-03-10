import { getGPUTier } from '@pmndrs/detect-gpu'

export type QualityTier = 'high' | 'mid' | 'low'

export interface DeviceProfile {
  tier: QualityTier
  isMobile: boolean
  dpr: number           // initial pixel ratio
  shadows: boolean
  shadowMapSize: number
  maxFPS: number
  lazyLoadZones: boolean          // distance-cull game zones or not
  postprocessing: boolean          // any post-processing at all
  fog: boolean
  starCount: number
  pinCount: number           // bowling pins (6 on low-end)
  physicsHz: number           // physics update rate
  useMatcaps: boolean          // replace meshStandard with meshMatcap on low
  blobShadow: boolean          // fake blob shadow under car instead of castShadow
  maxLights: number           // cap point lights rendered
  physicsIter: number           // Rapier solver iterations
}

// Cache result — only run once
let _profile: DeviceProfile | null = null

export function generateProfile(tier: QualityTier, isMobile: boolean): DeviceProfile {
  if (!isMobile && tier === 'low') {
    return {
      tier: 'low',
      isMobile: false,
      dpr: 1.0,
      shadows: false,
      shadowMapSize: 512,
      maxFPS: 60,
      lazyLoadZones: false,
      postprocessing: false,
      fog: false,
      starCount: 400,
      pinCount: 10,
      physicsHz: 60,
      useMatcaps: false,
      blobShadow: false,
      maxLights: 20,
      physicsIter: 10,
    }
  }

  if (!isMobile && tier === 'mid') {
    return {
      tier: 'mid',
      isMobile: false,
      dpr: Math.min(window.devicePixelRatio, 1.2),
      shadows: true,
      shadowMapSize: 512,
      maxFPS: 60,
      lazyLoadZones: false,
      postprocessing: true,
      fog: true,
      starCount: 600,
      pinCount: 10,
      physicsHz: 60,
      useMatcaps: false,
      blobShadow: false,
      maxLights: 20,
      physicsIter: 10,
    }
  }

  if (!isMobile) { // high
    return {
      tier: 'high',
      isMobile: false,
      dpr: Math.min(window.devicePixelRatio, 1.5),
      shadows: true,
      shadowMapSize: 1024,
      maxFPS: 60,
      lazyLoadZones: false,
      postprocessing: true,
      fog: true,
      starCount: 2000,
      pinCount: 10,
      physicsHz: 60,
      useMatcaps: false,
      blobShadow: false,
      maxLights: 20,
      physicsIter: 10,
    }
  }

  if (isMobile && tier === 'low') {
    return {
      tier: 'low',
      isMobile: true,
      dpr: Math.min(window.devicePixelRatio, 1.0),
      shadows: false,
      shadowMapSize: 0,
      maxFPS: 30,
      lazyLoadZones: true,
      postprocessing: false,
      fog: false,
      starCount: 0,
      pinCount: 6,
      physicsHz: 30,
      useMatcaps: true,
      blobShadow: true,
      maxLights: 0,
      physicsIter: 6,
    }
  }

  if (isMobile && tier === 'mid') {
    return {
      tier: 'mid',
      isMobile: true,
      dpr: Math.min(window.devicePixelRatio, 1.5),
      shadows: true,
      shadowMapSize: 512,
      maxFPS: 60,
      lazyLoadZones: true,
      postprocessing: true,
      fog: true,
      starCount: 300,
      pinCount: 10,
      physicsHz: 45,
      useMatcaps: false,
      blobShadow: true,
      maxLights: 4,
      physicsIter: 8,
    }
  }

  // Mobile High
  return {
    tier: 'high',
    isMobile: true,
    dpr: Math.min(window.devicePixelRatio, 1.5),
    shadows: true,
    shadowMapSize: 512,
    maxFPS: 60,
    lazyLoadZones: false,
    postprocessing: true,
    fog: true,
    starCount: 1200,
    pinCount: 10,
    physicsHz: 60,
    useMatcaps: false,
    blobShadow: true,
    maxLights: 8,
    physicsIter: 10,
  }
}

export async function getDeviceProfile(): Promise<DeviceProfile> {
  if (_profile) return _profile

  const gpuTier = await getGPUTier()
  const isMobile = gpuTier.isMobile
    ?? /Android|iPhone|iPad/i.test(navigator.userAgent)
    ?? (window.innerWidth <= 768 && 'ontouchstart' in window)

  const detectedTier: QualityTier = gpuTier.tier <= 1 ? 'low' : gpuTier.tier === 2 ? 'mid' : 'high'
  _profile = generateProfile(detectedTier, isMobile)

  return _profile
}

// Sync getter — use after async init, falls back to mid
export function getProfileSync(): DeviceProfile {
  return _profile ?? {
    tier: 'mid', isMobile: false, dpr: 1,
    shadows: true, shadowMapSize: 512, maxFPS: 60,
    lazyLoadZones: false, postprocessing: true, fog: true,
    starCount: 800, pinCount: 10, physicsHz: 60,
    useMatcaps: false, blobShadow: false, maxLights: 12, physicsIter: 8,
  }
}
