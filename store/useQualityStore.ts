import { create } from 'zustand'
import type { DeviceProfile } from '@/lib/deviceTier'

interface QualityStore {
  profile: DeviceProfile | null
  setProfile: (p: DeviceProfile) => void
}

export const useQualityStore = create<QualityStore>(set => ({
  profile: null,
  setProfile: profile => set({ profile }),
}))
