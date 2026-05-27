/**
 * @file asrPolicy.ts
 * @role G2 ASR 정책 — void_ratio ≥ resolveAsrBase clamp. asrOverride 시 Safe-Zone 우선.
 * @guardrail G2
 * @ssot docs/NEXA OS/BAX_미학적_인터페이스_UX_아키텍처_v0.9.md §1.5.2 · §2.10
 */

import { ASR_BAND_MIN, BAX_MODE_PRESETS, VIEWPORT_DELTA, type BaxOperationMode } from '../baxModePresets'

export function clampVoidRatio(value: number, asrBase: number): number {
  return Math.min(100, Math.max(asrBase, value))
}

export function resolveAsrBase(
  mode: BaxOperationMode,
  band: 'xl' | 'md' | 'sm',
  asrPreferenceOffset: number,
): number {
  const base = BAX_MODE_PRESETS[mode].asr_base + asrPreferenceOffset
  const withBand = base + VIEWPORT_DELTA[band]
  const floor = ASR_BAND_MIN[band]
  return Math.min(95, Math.max(floor, withBand))
}
