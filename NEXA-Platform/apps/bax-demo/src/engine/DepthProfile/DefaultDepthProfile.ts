/**
 * @file DefaultDepthProfile.ts
 * @role depth→blur/opacity · urgency→z-index 변환 (C1). focus_blur_scale은 MID/BG만.
 *       FG blur=0 opacity=1.0 고정. ATS applyDepthTuning은 applyAestheticState에서 적용.
 * @ssot docs/NEXA OS/BAX_미학적_인터페이스_UX_아키텍처_v0.9.md §2.4
 */

import type { DepthProfile, VisualValues } from './types'
import type { AlarmLevel } from '../alarmState'

const URGENCY_Z: Record<AlarmLevel, number> = {
  CRITICAL: 10,
  HIGH: 3,
  NONE: -2,
}

export class DefaultDepthProfile implements DepthProfile {
  resolve(
    depth: 'FG' | 'MID' | 'BG',
    alarmLevel: AlarmLevel,
    _mode: string,
    scale: number,
  ): VisualValues {
    const baseZ = depth === 'FG' ? 10 : depth === 'MID' ? 5 : 1
    const weight = alarmLevel === 'NONE' ? 0 : URGENCY_Z[alarmLevel] ?? 0
    if (depth === 'FG') {
      return { blurPx: 0, opacity: 1.0, zIndex: baseZ + weight }
    }
    const basePx = depth === 'MID' ? 10 : 40
    return {
      blurPx: Math.round(basePx * scale),
      opacity: depth === 'MID' ? 0.4 : 0.05,
      zIndex: Math.max(1, baseZ + weight),
    }
  }
}
