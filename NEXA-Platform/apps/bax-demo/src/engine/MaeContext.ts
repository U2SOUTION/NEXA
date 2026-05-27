/**
 * @file MaeContext.ts
 * @role MAE 런타임 컨텍스트 타입·초기값 factory (G1).
 *       components·bax_mode·void_ratio·alarmState·layoutPolicy·depthProfile 등 단일 SSOT 객체.
 * @ssot docs/NEXA OS/BAX_미학적_인터페이스_UX_아키텍처_v0.9.md §2.1 · 부록 A
 */

export interface MaeContext {
  void_ratio: number
  focus_blur_scale: number
  bax_mode: string
  viewport_band: 'xl' | 'md' | 'sm'
  circuit_state: 'closed' | 'open' | 'half_open'
  hybrid_phase: 'urgent' | 'fine_tune' | 'idle'
  canvas_scale: number
  active_layout_policy: string
  asrOverride?: boolean
}

export function createInitialMaeContext(): MaeContext {
  return {
    void_ratio: 52,
    focus_blur_scale: 0.7,
    bax_mode: 'contextual',
    viewport_band: 'xl',
    circuit_state: 'closed',
    hybrid_phase: 'idle',
    canvas_scale: 1.0,
    active_layout_policy: 'default',
  }
}
