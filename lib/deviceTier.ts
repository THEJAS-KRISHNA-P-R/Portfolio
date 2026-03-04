import { getGPUTier } from '@pmndrs/detect-gpu'

export type QualityTier = 'high' | 'mid' | 'low'

export interface DeviceProfile {
  tier:            QualityTier
  isMobile:        boolean
  dpr:             number           // initial pixel ratio
  shadows:         boolean
  shadowMapSize:   number
  maxFPS:          number
  lazyLoadZones:   boolean          // distance-cull game zones or not
  postprocessing:  boolean          // any post-processing at all
  fog:             boolean
  starCount:       number
  pinCount:       number           // bowling pins (6 on low-end)
  physicsHz:       number           // physics update rate
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
      tier:           'low',
      isMobile:       false,
      dpr:            1.0,            // ← FULL resolution on desktop always
      shadows:        false,
      shadowMapSize:  512,
      maxFPS:         60,
      lazyLoadZones:  false,          // never lazy on desktop
      postprocessing: false,          // kill post to save GPU for resolution
      fog:            false,
      starCount:      400,
      pinCount:       10,
      physicsHz:      60,
    }
  } else if (!isMobile && tier === 2) {
    _profile = {
      tier:           'mid',
      isMobile:       false,
      dpr:            Math.min(window.devicePixelRatio, 1.2),  // up to 1.2
      shadows:        true,
      shadowMapSize:  512,
      maxFPS:         60,
      lazyLoadZones:  false,
      postprocessing: true,           // bloom + SMAA only
      fog:            true,
      starCount:      600,
      pinCount:       10,
      physicsHz:      60,
    }
  } else if (!isMobile) {
    // Desktop tier 3: full quality
    _profile = {
      tier:           'high',
      isMobile:       false,
      dpr:            Math.min(window.devicePixelRatio, 1.5),
      shadows:        true,
      shadowMapSize:  1024,
      maxFPS:         60,
      lazyLoadZones:  false,        // NEVER lazy load on high — cheat codes need full world
      postprocessing: true,         // full stack: SSAO + bloom + SMAA + vignette
      fog:            true,
      starCount:      2000,
      pinCount:       10,
      physicsHz:      60,
    }
  } else if (isMobile && tier <= 1) {
    // Old phone
    _profile = {
      tier:           'low',
      isMobile:       true,
      dpr:            Math.min(window.devicePixelRatio, 1.0),   // VISUAL FIX: was 0.85 → 1.0
      shadows:        false,
      shadowMapSize:  512,
      maxFPS:         30,
      lazyLoadZones:  true,
      postprocessing: false,
      fog:            false,
      starCount:      300,
      pinCount:       6,
      physicsHz:      45,
    }
  } else if (isMobile && tier === 2) {
    // Mid phone
    _profile = {
      tier:           'mid',
      isMobile:       true,
      dpr:            Math.min(window.devicePixelRatio, 1.25),  // VISUAL FIX: was 1.0 → 1.25
      shadows:        false,
      shadowMapSize:  512,
      maxFPS:         60,
      lazyLoadZones:  true,
      postprocessing: true,
      fog:            true,
      starCount:      600,
      pinCount:       10,
      physicsHz:      60,
    }
  } else {
    // Good phone (Oppo K13 etc)
    _profile = {
      tier:           'high',
      isMobile:       true,
      dpr:            Math.min(window.devicePixelRatio, 1.5),   // VISUAL FIX: was 1.3 → 1.5
      shadows:        true,
      shadowMapSize:  512,
      maxFPS:         60,
      lazyLoadZones:  false,
      postprocessing: true,
      fog:            true,
      starCount:      1200,
      pinCount:       10,
      physicsHz:      60,
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
  }
}
