/**
 * @file baxModePresets.ts
 * @role BAX 4운영 모드 preset — asr_base·권장 초기 void_ratio·DepthProfile base 연동.
 * @ssot docs/NEXA OS/BAX_미학적_인터페이스_UX_아키텍처_v0.9.md §2.9 · §1.3.3
 */

export const BAX_MODE_PRESETS = {
  meditation: { asr_base: 75, initial_void_ratio: 85 },
  dense_monitor: { asr_base: 25, initial_void_ratio: 30 },
  contextual: { asr_base: 48, initial_void_ratio: 52 },
  intelligent: { asr_base: 60, initial_void_ratio: 62 },
} as const

export type BaxOperationMode = keyof typeof BAX_MODE_PRESETS

export const VIEWPORT_DELTA = { xl: 0, md: -2, sm: -5 } as const
export const ASR_BAND_MIN = { xl: 65, md: 65, sm: 20 } as const
