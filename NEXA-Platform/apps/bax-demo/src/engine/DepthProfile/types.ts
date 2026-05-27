/**
 * @file types.ts
 * @role DepthProfile 공유 타입 — depth+alarmLevel+mode+scale → blur/opacity/zIndex.
 * @internal DepthProfile 서브모듈
 */

import type { AlarmLevel } from '../alarmState'

export interface VisualValues {
  blurPx: number
  opacity: number
  zIndex: number
}

export interface DepthProfile {
  resolve(
    depth: 'FG' | 'MID' | 'BG',
    alarmLevel: AlarmLevel,
    mode: string,
    scale: number,
  ): VisualValues
}
