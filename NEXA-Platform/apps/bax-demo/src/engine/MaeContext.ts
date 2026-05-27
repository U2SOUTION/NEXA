/**
 * @file MaeContext.ts
 * @role MAE 런타임 컨텍스트 타입·초기값 factory (G1).
 */

import type { ComponentDeclaration } from '../types/component'
import type { AlarmState } from './alarmState'
import type { BaxOperationMode } from './baxModePresets'
import type { AestheticTuningSettings } from '../settings/useAestheticSettingsStore'

export interface MaeContext {
  components: ComponentDeclaration[]
  bax_mode: BaxOperationMode
  viewport_band: 'xl' | 'md' | 'sm'
  circuit_state: 'closed' | 'open' | 'half_open'
  void_ratio: number
  focus_blur_scale: number
  light_source_x: number
  light_source_y: number
  aesthetic_tuning: AestheticTuningSettings
  alarmState: AlarmState
  main_focus_id: string
  hybrid_phase: 'urgent' | 'fine_tune' | 'idle'
  canvas_scale: number
  active_layout_policy: string
  asrOverride?: boolean
}

export function createInitialMaeContext(
  components: ComponentDeclaration[],
  aesthetic_tuning: AestheticTuningSettings,
  alarmState: AlarmState,
): MaeContext {
  return {
    components,
    bax_mode: 'contextual',
    viewport_band: 'xl',
    circuit_state: 'closed',
    void_ratio: 52,
    focus_blur_scale: 0.7,
    light_source_x: 50,
    light_source_y: 30,
    aesthetic_tuning,
    alarmState,
    main_focus_id: 'sentinel',
    hybrid_phase: 'idle',
    canvas_scale: 1.0,
    active_layout_policy: 'default',
  }
}
