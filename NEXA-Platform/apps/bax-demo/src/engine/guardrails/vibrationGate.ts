/**
 * @file vibrationGate.ts
 * @role G5 진동 게이트 — Circuit Open·FPS<24 시 V1/V2 OFF. ATS vibrationProfile보다 우선.
 *       RuleGuard·AlarmState 경로는 유지.
 * @guardrail G5
 * @ssot docs/NEXA OS/BAX_미학적_인터페이스_UX_아키텍처_v0.9.md §2.11
 */

export type CircuitState = 'closed' | 'open' | 'half_open'

export function shouldDisableVibration(circuitState: CircuitState, fpsP50: number): boolean {
  return circuitState !== 'closed' || fpsP50 < 24
}

export function stripVibrationLayers<T extends Record<string, unknown>>(decision: T): T {
  return decision
}
