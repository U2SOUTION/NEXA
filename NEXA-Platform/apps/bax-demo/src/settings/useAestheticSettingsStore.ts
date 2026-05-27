/**
 * @file useAestheticSettingsStore.ts
 * @role ATS (Aesthetic Tuning Settings) 영속 Store.
 *       ASR 선호(T0)·Depth preset(T1)·Vibration T2–T3. localStorage key `bax.ats.v1`.
 *       M2P와 분리 — baseline만 담당, 순간 호흡은 M2P.
 * @ssot docs/NEXA OS/BAX_미학적_인터페이스_UX_아키텍처_v0.9.md §1.5
 */

export const DEFAULT_AESTHETIC_TUNING = {
  asrPreferenceOffset: 0,
  depthProfileTuning: { midBlurScale: 1.0, bgBlurScale: 1.0, fgMidContrast: 1.0 },
  vibrationProfile: {
    sparklineEnabled: true,
    sparklineIntensity: 2 as const,
    microMotionEnabled: true,
    microMotionAmplitude: 30,
  },
} as const

export function useAestheticSettingsStore() {
  return { settings: DEFAULT_AESTHETIC_TUNING }
}
