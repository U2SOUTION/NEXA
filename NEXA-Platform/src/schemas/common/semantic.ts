import { z } from 'zod'

// AI가 이해할 행위 의도 리스트
export const IntentEnum = z.enum([
  'MONITORING', // 단순 모니터링
  'CONTROL', // 직접 제어
  'OPTIMIZING', // AI에 의한 최적화 중
  'EMERGENCY', // 긴급 상황 대응
  'LEARNING', // TEACH 모드 학습 데이터
  'MAINTENANCE', // 장비 점검 및 유지보수
])

export const SemanticSchema = z.object({
  // 행위의 의도
  intent: IntentEnum,

  // 안전 등급: 1(매우 안전) ~ 5(최고 위험/즉시 차단 필요)
  safetyLevel: z.number().int().min(1).max(5).default(1),

  // 태그: 검색이나 필터링을 위한 커스텀 키워드
  tags: z.array(z.string()).optional(),

  // 비고: AI가 생성한 설명이나 사용자의 메모
  description: z.string().optional(),
})

export type Semantic = z.infer<typeof SemanticSchema>
