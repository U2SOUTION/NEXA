import { z } from 'zod'

export const CommandSchema = z.object({
  // 제어 주체: 'AI', 'USER', 'SYSTEM_AUTO', 'HARDWARE_SWITCH'
  origin: z.enum(['AI', 'USER', 'SYSTEM', 'HARDWARE']),

  // 제어 대상 카테고리
  category: z.enum(['ACTUATOR', 'POWER', 'NETWORK', 'SAFETY']),

  // 구체적인 동작 명령
  action: z.string(), // 예: "SET_DAMPER", "POWER_OFF"

  // 제어 값: 수치형 또는 상태형 모두 수용
  value: z.union([z.number(), z.string(), z.boolean()]),

  // 명령의 우선순위: 사용자 조작(USER)은 보통 AI보다 높은 우선순위를 가짐
  priority: z.number().int().min(0).max(10).default(1),
})

export type Command = z.infer<typeof CommandSchema>
