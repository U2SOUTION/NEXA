/**
 * @file ruleEngine.ts
 * @role RuleGuard — Safety Phase1. 모든 bax_mode·센서 tick마다 AlarmState 전이·임계 80°C.
 *       AestheticTuner와 분리. C4 모드 무관 Safety.
 * @ssot docs/NEXA OS/BAX_미학적_인터페이스_UX_아키텍처_v0.9.md §2.5 · §2.2
 */

import type { AlarmState } from './alarmState'
import type { SensorReading } from './hybridEvaluate'

export const SENSOR_THRESHOLD = 80

export function evaluate(sensor: SensorReading, alarmState: AlarmState, threshold = SENSOR_THRESHOLD): boolean {
  if (sensor.value >= threshold && alarmState.level === 'NONE') {
    alarmState.level = 'CRITICAL'
    alarmState.component_id = 'sentinel'
    alarmState.raised_at = Date.now()
    alarmState.source = sensor.id
    return true
  }
  if (sensor.value < threshold && alarmState.level !== 'NONE') {
    alarmState.level = 'NONE'
    alarmState.cleared_by = 'auto'
    return true
  }
  return false
}
