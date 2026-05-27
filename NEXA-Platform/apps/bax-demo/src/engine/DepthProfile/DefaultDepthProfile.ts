/**
 * @file DefaultDepthProfile.ts
 * @role depth→blur/opacity · urgency→z-index (C1).
 */

import type { BaxOperationMode } from '../baxModePresets'
import type { AlarmLevel } from '../alarmState'
import type { ComponentDepth, ComponentUrgency } from '../../types/component'
import type { DepthProfile, VisualValues } from './types'
import type { AestheticTuningSettings } from '../../settings/useAestheticSettingsStore'

const MID_BLUR: Record<BaxOperationMode, number> = {
  meditation: 20,
  dense_monitor: 4,
  contextual: 10,
  intelligent: 10,
}

const BG_BLUR: Record<BaxOperationMode, number> = {
  meditation: 60,
  dense_monitor: 20,
  contextual: 40,
  intelligent: 40,
}

const MID_OPACITY: Record<BaxOperationMode, number> = {
  meditation: 0.3,
  dense_monitor: 0.6,
  contextual: 0.4,
  intelligent: 0.4,
}

const BG_OPACITY: Record<BaxOperationMode, number> = {
  meditation: 0.03,
  dense_monitor: 0.1,
  contextual: 0.05,
  intelligent: 0.05,
}

const URGENCY_Z: Record<ComponentUrgency, number> = {
  CRITICAL: 10,
  HIGH: 3,
  NORMAL: 0,
  NONE: -2,
}

function applyDepthTuning(
  values: VisualValues,
  depth: ComponentDepth,
  tuning: AestheticTuningSettings['depthProfileTuning'],
): VisualValues {
  if (depth === 'MID') return { ...values, blurPx: Math.round(values.blurPx * tuning.midBlurScale) }
  if (depth === 'BG') return { ...values, blurPx: Math.round(values.blurPx * tuning.bgBlurScale) }
  if (depth === 'FG') {
    return { ...values, opacity: Math.min(1, Math.max(0, values.opacity * tuning.fgMidContrast)) }
  }
  return values
}

export class DefaultDepthProfile implements DepthProfile {
  resolve(
    depth: ComponentDepth,
    urgency: ComponentUrgency,
    mode: BaxOperationMode,
    scale: number,
    tuning: AestheticTuningSettings['depthProfileTuning'],
  ): VisualValues {
    const baseZ = depth === 'FG' ? 10 : depth === 'MID' ? 5 : 1
    const zIndex = Math.max(1, baseZ + URGENCY_Z[urgency])

    if (depth === 'FG') {
      return applyDepthTuning({ blurPx: 0, opacity: 1, zIndex }, depth, tuning)
    }

    const basePx = depth === 'MID' ? MID_BLUR[mode] : BG_BLUR[mode]
    const opacity = depth === 'MID' ? MID_OPACITY[mode] : BG_OPACITY[mode]
    return applyDepthTuning(
      { blurPx: Math.round(basePx * scale), opacity, zIndex },
      depth,
      tuning,
    )
  }

  resolveFromAlarm(
    depth: ComponentDepth,
    componentUrgency: ComponentUrgency,
    mode: BaxOperationMode,
    scale: number,
    tuning: AestheticTuningSettings['depthProfileTuning'],
  ): VisualValues {
    return this.resolve(depth, componentUrgency, mode, scale, tuning)
  }
}

export function mapAlarmToUrgency(
  alarmLevel: AlarmLevel,
  base: ComponentUrgency,
): ComponentUrgency {
  if (alarmLevel === 'CRITICAL' && base !== 'NONE') return 'CRITICAL'
  if (alarmLevel === 'HIGH' && base !== 'NONE') return 'HIGH'
  if (alarmLevel === 'NONE') return base
  return base
}
