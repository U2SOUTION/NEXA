import { z } from 'zod'

export const MetadataSchema = z.object({
  // 고유 식별자: UUID v4 형식을 권장
  id: z.string().uuid(),

  // 데이터 생성 시간: ISO 8601 형식
  createdAt: z.date().default(() => new Date()),

  // 데이터 소스: 장치 ID (예: 'STOVE-01') 또는 서비스 이름
  source: z.string(),

  // 수신 대상: 특정 장치 ID 또는 'BROADCAST'
  target: z.string().default('SYSTEM'),

  // 데이터 버전: 스키마 변경 대비
  version: z.string().default('1.0.0'),
})

export type Metadata = z.infer<typeof MetadataSchema>
