import { create } from 'zustand'
import type { DeviceProfile } from '@/lib/deviceTier'

interface QualityStore {
  detectedProfile: DeviceProfile | null
  profile: DeviceProfile | null  // current (possibly overridden) profile
  setDetectedProfile: (p: DeviceProfile) => void
  setProfile: (p: DeviceProfile) => void
}

export const useQualityStore = create<QualityStore>(set => ({
  detectedProfile: null,
  profile: null,
  setDetectedProfile: detectedProfile => set({ detectedProfile, profile: detectedProfile }),
  setProfile: profile => set({ profile }),
}))
