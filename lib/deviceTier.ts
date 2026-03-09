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

export async function getDeviceProfile(): Promise<DeviceProfile> {
  if (_profile) return _profile

  const gpuTier = await getGPUTier()
  const isMobile = gpuTier.isMobile
    ?? /Android|iPhone|iPad/i.test(navigator.userAgent)
    ?? (window.innerWidth <= 768 && 'ontouchstart' in window)

  const tier = gpuTier.tier

  // ── DPR rules ──────────────────────────────────────────────────────────
  // Desktop/laptop: MINIMUM DPR = 1.0, max = devicePixelRatio (usually 1-2)
  // Mobile:         DPR scales with tier (can go below 1 on very old phones)
  const baseDPR = isMobile
    ? (tier <= 1 ? 0.75 : tier === 2 ? 1.0 : Math.min(window.devicePixelRatio, 1.5))
    : Math.min(window.devicePixelRatio, tier <= 1 ? 1.0 : tier === 2 ? 1.2 : 1.5)
  //           ↑ desktop: never below 1.0 even on tier 1

  if (!isMobile && tier <= 1) {
    // Old laptop with bad GPU — reduce effects but KEEP resolution sharp
    _profile = {
      tier: 'low',
      isMobile: false,
      dpr: 1.0,            // ← FULL resolution on desktop always
      shadows: false,
      shadowMapSize: 512,
      maxFPS: 60,
      lazyLoadZones: false,          // never lazy on desktop
      postprocessing: false,          // kill post to save GPU for resolution
      fog: false,
      starCount: 400,
      pinCount: 10,
      physicsHz: 60,
      useMatcaps: false,
      blobShadow: false,
      maxLights: 20,             // Uncapped on desktop low (post-processing is killed instead)
      physicsIter: 4,
    }
  } else if (!isMobile && tier === 2) {
    _profile = {
      tier: 'mid',
      isMobile: false,
      dpr: Math.min(window.devicePixelRatio, 1.2),  // up to 1.2
      shadows: true,
      shadowMapSize: 512,
      maxFPS: 60,
      lazyLoadZones: false,
      postprocessing: true,           // bloom + SMAA only
      fog: true,
      starCount: 600,
      pinCount: 10,
      physicsHz: 60,
      useMatcaps: false,
      blobShadow: false,
      maxLights: 20,
      physicsIter: 4,
    }
  } else if (!isMobile) {
    // Desktop tier 3: full quality
    _profile = {
      tier: 'high',
      isMobile: false,
      dpr: Math.min(window.devicePixelRatio, 1.5),
      shadows: true,
      shadowMapSize: 1024,
      maxFPS: 60,
      lazyLoadZones: false,        // NEVER lazy load on high — cheat codes need full world
      postprocessing: true,         // full stack: SSAO + bloom + SMAA + vignette
      fog: true,
      starCount: 2000,
      pinCount: 10,
      physicsHz: 60,
      useMatcaps: false,
      blobShadow: false,
      maxLights: 20,
      physicsIter: 4,
    }
  } else if (isMobile && tier <= 1) {
    // Old phone
    _profile = {
      tier: 'low',
      isMobile: true,
      dpr: Math.min(window.devicePixelRatio, 1.0),   // tighten DPR to 1.0
      shadows: false,
      shadowMapSize: 0,
      maxFPS: 30,
      lazyLoadZones: true,
      postprocessing: false,
      fog: false,
      starCount: 0,
      pinCount: 6,
      physicsHz: 30,
      useMatcaps: true,        // ← Enable matcaps
      blobShadow: true,        // ← Fake shadow
      maxLights: 0,            // ← No point lights
      physicsIter: 2,          // ← Reduce solver iterations
    }
  } else if (isMobile && tier === 2) {
    // Mid phone
    _profile = {
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
      blobShadow: true,        // Fake shadow still
      maxLights: 4,            // Cap point lights
      physicsIter: 3,
    }
  } else {
    // Good phone (Oppo K13 etc)
    _profile = {
      tier: 'high',
      isMobile: true,
      dpr: Math.min(window.devicePixelRatio, 1.5),   // VISUAL FIX: was 1.3 → 1.5
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
      blobShadow: true,        // Even on high mobile, blob saves castShadow cost
      maxLights: 8,
      physicsIter: 4,
    }
  }

  return _profile!
}

// Sync getter — use after async init, falls back to mid
export function getProfileSync(): DeviceProfile {
  return _profile ?? {
    tier: 'mid', isMobile: false, dpr: 1,
    shadows: true, shadowMapSize: 512, maxFPS: 60,
    lazyLoadZones: false, postprocessing: true, fog: true,
    starCount: 800, pinCount: 10, physicsHz: 60,
    useMatcaps: false, blobShadow: false, maxLights: 12, physicsIter: 4,
  }
}
