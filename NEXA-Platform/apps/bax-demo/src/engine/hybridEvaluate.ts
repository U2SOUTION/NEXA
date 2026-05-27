/**
 * @file hybridEvaluate.ts
 * @role 하이브리드 2단계 진입점 — Phase1 RuleGuard(모드 무관) + Phase2 AestheticTuner(intelligent).
 *       부록 C. FR-06·FR-07.
 * @ssot docs/NEXA OS/BAX_미학적_인터페이스_UX_아키텍처_v0.9.md §2.13 · 부록 C
 */

import type { MaeContext } from './MaeContext'
import type { AlarmState } from './alarmState'

export interface SensorReading {
  id: string
  value: number
  unit: string
  ts: number
}

export async function hybridEvaluate(
  _sensor: SensorReading,
  _ctx: MaeContext,
  _alarmState: AlarmState,
): Promise<void> {
  // TODO: ruleEngine + ollama (SSOT v0.9 부록 C)
}
