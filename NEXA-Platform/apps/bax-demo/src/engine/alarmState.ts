/**
 * @file alarmState.ts
 * @role AlarmState 경보 상태 머신 (G2 · R1). RuleGuard 단독 소유.
 *       NONE/HIGH/CRITICAL 전이 · TTL 30s · 운영자 해제. urgency lock SSOT.
 * @ssot docs/NEXA OS/BAX_미학적_인터페이스_UX_아키텍처_v0.9.md §2.2
 */

export type AlarmLevel = 'NONE' | 'HIGH' | 'CRITICAL'

export interface AlarmState {
  level: AlarmLevel
  component_id: string | null
  raised_at: number | null
  source: string | null
  cleared_by: 'auto' | 'operator' | null
}

export function createInitialAlarmState(): AlarmState {
  return {
    level: 'NONE',
    component_id: null,
    raised_at: null,
    source: null,
    cleared_by: null,
  }
}
