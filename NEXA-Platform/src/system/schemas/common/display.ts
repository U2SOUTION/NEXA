import { z } from 'zod'

/**
 * [FeedbackStatusEnum]
 * 사용자의 노드 설정에 대한 시스템의 실시간 판단 상태입니다.
 */
export const FeedbackStatusEnum = z.enum(['NONE', 'IMPOSSIBLE', 'INAPPROPRIATE', 'SUITABLE'])

/**
 * [DisplaySchema]
 * 넥셋의 시각적 상태와 실시간 피드백을 담당합니다.
 */
export const DisplaySchema = z.object({
  // 1. 시각적 테마 정보
  theme: z.object({
    primaryColor: z.string(), // 넥셋의 강조 색상 (RAW/RESULT 구분용)
    backgroundColor: z.string().default('#ffffff'),
    icon: z.string().optional(),
  }),

  // 2. 실시간 피드백 (P0 핵심)
  feedback: z.object({
    status: FeedbackStatusEnum.default('NONE'), // 실시간 상태 피드백
    message: z.string().optional(), // 피드백 사유 알림
  }),

  // 3. 수치 렌더링 옵션
  presentation: z.object({
    precision: z.number().default(2), // 소수점 자리수
    prefix: z.string().optional(),
    suffix: z.string().optional(),
  }),
})

export type Display = z.infer<typeof DisplaySchema>
