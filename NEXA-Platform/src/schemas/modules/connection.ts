import { z } from 'zod'
import { MetadataSchema } from '../common/metadata'

/**
 * [ConnectionSchema]
 * 두 포뮬레이터(배합기) 사이의 데이터 흐름을 정의합니다.
 * "A 배합기의 추출 결과물(Result)을 B 배합기의 투입 성분(Ingredient)으로 보낸다"는 논리를 담습니다.
 */
export const ConnectionSchema = z.object({
  // 1. 연결선 메타데이터 (ID, 생성일 등)
  metadata: MetadataSchema,

  // 2. 소스(Source): 데이터가 나오는 곳
  source: z.object({
    formulatorId: z.string(), // 시작점 배합기 ID
    resultId: z.string(), // 해당 배합기의 특정 결과물(Result) ID
  }),

  // 3. 타겟(Target): 데이터가 들어가는 곳
  target: z.object({
    formulatorId: z.string(), // 도착점 배합기 ID
    ingredientId: z.string(), // 해당 배합기의 특정 투입 성분(Ingredient) ID
  }),

  // 4. 연결 상태 및 검증
  status: z.object({
    isActive: z.boolean().default(true), // 연결 활성화 여부
    isValidated: z.boolean().default(false), // 데이터 타입 일치 검증 여부
  }),

  // 5. 시각적 표현 (UI)
  display: z.object({
    color: z.string().optional(), // 데이터 흐름에 따른 선 색상 (예: Boolean은 초록, Number는 파랑)
    label: z.string().optional(), // 연결선 위에 표시할 별칭
  }),
})

export type Connection = z.infer<typeof ConnectionSchema>
