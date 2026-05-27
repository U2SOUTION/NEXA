/**
 * @file types.ts
 * @role DepthProfile 공유 타입.
 */

import type { BaxOperationMode } from '../baxModePresets'
import type { ComponentDepth, ComponentUrgency } from '../../types/component'
import type { AestheticTuningSettings } from '../../settings/useAestheticSettingsStore'

export interface VisualValues {
  blurPx: number
  opacity: number
  zIndex: number
}

export interface DepthProfile {
  resolve(
    depth: ComponentDepth,
    urgency: ComponentUrgency,
    mode: BaxOperationMode,
    scale: number,
    tuning: AestheticTuningSettings['depthProfileTuning'],
  ): VisualValues
}
