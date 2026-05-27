/**
 * @file ruleEngine.ts
 * @role RuleGuard — 포커스·컴포넌트별 메트릭 평가.
 */

import type { AlarmState } from './alarmState'
import { COMPONENT_SIM_META } from './componentSimMeta'
import type { SimMetrics } from '../store/simMetrics'

export const SENSOR_THRESHOLD = 80

export function evaluateComponentMetric(
  componentId: string,
  metrics: SimMetrics,
  alarmState: AlarmState,
): boolean {
  const meta = COMPONENT_SIM_META[componentId]
  if (!meta?.autoEvaluate) return false

  const value = meta.getValue(metrics)
  const threshold = meta.threshold
  const tripped = meta.compare === 'gte' ? value >= threshold : value <= threshold
  const cleared = meta.compare === 'gte' ? value < threshold : value > threshold

  if (tripped && alarmState.level === 'NONE') {
    alarmState.level = 'CRITICAL'
    alarmState.component_id = componentId
    alarmState.raised_at = Date.now()
    alarmState.source = componentId
    return true
  }
  if (cleared && alarmState.level !== 'NONE' && alarmState.component_id === componentId) {
    alarmState.level = 'NONE'
    alarmState.component_id = null
    alarmState.cleared_by = 'auto'
    return true
  }
  return false
}

export function triggerManualCritical(alarmState: AlarmState, componentId: string): void {
  alarmState.level = 'CRITICAL'
  alarmState.component_id = componentId
  alarmState.raised_at = Date.now()
  alarmState.source = 'manual'
  alarmState.cleared_by = null
}

export function clearAlarmState(alarmState: AlarmState, by: 'auto' | 'operator' = 'operator'): void {
  alarmState.level = 'NONE'
  alarmState.component_id = null
  alarmState.cleared_by = by
}
