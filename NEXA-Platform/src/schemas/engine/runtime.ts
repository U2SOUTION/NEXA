import { z } from 'zod'

/**
 * [EngineStatusSchema]
 * 현재 로직 엔진의 물리적/논리적 가동 상태를 정의합니다.
 *
 * 엔진이 실행 중일 때 "현재 CPU 점유율은 얼마인가?", "어떤 설계도가 돌아가고 있는가?"라는 상태 데이터의 규격입니다.
 * 현재 상태: 엔진이 가동 중인지, 정지 중인지, 오류가 발생했는지 등의 상태를 나타냅니다.
 * 활성 설계도: 현재 실행 중인 설계도의 ID를 기록합니다.
 * 회전 속도: 로직 1회 회전 속도를 나타냅니다.
 * 가동 시간: 엔진이 가동된 시간을 기록합니다.
 * 리소스 사용량: 엔진이 사용하는 CPU와 메모리의 사용량을 나타냅니다.
 * 마지막 오류: 마지막으로 발생한 오류 메시지를 기록합니다.
 */
export const EngineStatusSchema = z.object({
  state: z.enum(['IDLE', 'RUNNING', 'PAUSED', 'ERROR', 'MAINTENANCE']),
  activeBlueprintId: z.string().nullable(), // 현재 실행 중인 설계도 ID
  cycleTime: z.number(), // 로직 1회 회전 속도 (ms)
  uptime: z.number(), // 엔진 가동 시간 (초)
  resourceUsage: z.object({
    cpu: z.number().min(0).max(100),
    memory: z.number(), // MB 단위
  }),
  lastError: z.string().optional(),
})

export type EngineStatus = z.infer<typeof EngineStatusSchema>
