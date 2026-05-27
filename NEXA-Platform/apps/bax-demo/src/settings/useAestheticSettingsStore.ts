/**
 * @file useAestheticSettingsStore.ts
 * @role ATS 영속 Store (zustand + localStorage).
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AestheticTuningSettings {
  asrPreferenceOffset: number
  depthProfileTuning: {
    midBlurScale: number
    bgBlurScale: number
    fgMidContrast: number
  }
  vibrationProfile: {
    sparklineEnabled: boolean
    sparklineIntensity: 0 | 1 | 2
    microMotionEnabled: boolean
    microMotionAmplitude: number
  }
}

export const DEPTH_PRESETS = {
  soft: { midBlurScale: 1.4, bgBlurScale: 1.3, fgMidContrast: 0.9 },
  balanced: { midBlurScale: 1.0, bgBlurScale: 1.0, fgMidContrast: 1.0 },
  sharp: { midBlurScale: 0.7, bgBlurScale: 0.8, fgMidContrast: 1.2 },
} as const

export type DepthPreset = keyof typeof DEPTH_PRESETS

export const DEFAULT_AESTHETIC_TUNING: AestheticTuningSettings = {
  asrPreferenceOffset: 0,
  depthProfileTuning: { ...DEPTH_PRESETS.balanced },
  vibrationProfile: {
    sparklineEnabled: true,
    sparklineIntensity: 2,
    microMotionEnabled: true,
    microMotionAmplitude: 30,
  },
}

interface AtsStore extends AestheticTuningSettings {
  depthPreset: DepthPreset
  setAsrOffset: (v: number) => void
  setDepthPreset: (p: DepthPreset) => void
  setSparklineEnabled: (v: boolean) => void
  setSparklineIntensity: (v: 0 | 1 | 2) => void
  setMicroMotionEnabled: (v: boolean) => void
  setMicroAmplitude: (v: number) => void
  toSettings: () => AestheticTuningSettings
}

export const useAestheticSettingsStore = create<AtsStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_AESTHETIC_TUNING,
      depthPreset: 'balanced',
      setAsrOffset: (asrPreferenceOffset) => set({ asrPreferenceOffset }),
      setDepthPreset: (depthPreset) =>
        set({ depthPreset, depthProfileTuning: { ...DEPTH_PRESETS[depthPreset] } }),
      setSparklineEnabled: (sparklineEnabled) =>
        set((s) => ({ vibrationProfile: { ...s.vibrationProfile, sparklineEnabled } })),
      setSparklineIntensity: (sparklineIntensity) =>
        set((s) => ({ vibrationProfile: { ...s.vibrationProfile, sparklineIntensity } })),
      setMicroMotionEnabled: (microMotionEnabled) =>
        set((s) => ({ vibrationProfile: { ...s.vibrationProfile, microMotionEnabled } })),
      setMicroAmplitude: (microMotionAmplitude) =>
        set((s) => ({ vibrationProfile: { ...s.vibrationProfile, microMotionAmplitude } })),
      toSettings: () => {
        const { asrPreferenceOffset, depthProfileTuning, vibrationProfile } = get()
        return { asrPreferenceOffset, depthProfileTuning, vibrationProfile }
      },
    }),
    { name: 'bax.ats.v1' },
  ),
)
