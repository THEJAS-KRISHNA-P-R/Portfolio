import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DeviceProfile, QualityTier } from '@/lib/deviceTier'

interface QualityStore {
  userTier: QualityTier | null   // persisted manual selection
  detectedProfile: DeviceProfile | null
  profile: DeviceProfile | null  // current (possibly overridden) profile
  setDetectedProfile: (p: DeviceProfile) => void
  setProfile: (p: DeviceProfile) => void
  setUserTier: (t: QualityTier | null) => void
}

export const useQualityStore = create<QualityStore>()(
  persist(
    (set) => ({
      userTier: null,
      detectedProfile: null,
      profile: null,
      setDetectedProfile: (detectedProfile) =>
        set((state) => ({
          detectedProfile,
          // Only update active profile if user hasn't manually set one
          profile: state.userTier ? state.profile : detectedProfile
        })),
      setProfile: (profile) => set({ profile }),
      setUserTier: (userTier) => set({ userTier }),
    }),
    {
      name: 'portfolio-quality-settings',
      partialize: (state) => ({ userTier: state.userTier }), // only persist userTier
    }
  )
)
