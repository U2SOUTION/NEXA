/**
 * files.source_metadata AI 추출용 Zod 스키마
 * 전용 모델이 출력하는 JSON 검증 및 타입 보장에 사용.
 * @see docs/파일_source_metadata_AI_추출_기획.md
 */

import { z } from 'zod'

/** AI가 채울 수 있는 공통 메타데이터 (문서·이미지 등 공통) */
export const FileSourceMetadataSchema = z.object({
  /** 파일 내용 요약 (문서 요약, 이미지 설명 등) */
  summary: z.string().max(2000).optional(),
  /** 키워드 배열 */
  keywords: z.array(z.string().max(100)).max(20).optional(),
  /** 문서/자료 유형 힌트 (기획서, API문서, 메모, 스펙 등) */
  category_hint: z.string().max(100).optional(),
  /** 주 사용 언어 (ko, en 등) */
  language: z.string().max(10).optional(),
  /** 추출 시각 ISO 8601 */
  extracted_at: z.string().datetime().optional(),
  /** 문서 전용: 제목 추출 */
  title: z.string().max(500).optional(),
  /** 문서 전용: 대표 섹션 제목들 */
  sections: z.array(z.string().max(200)).max(50).optional(),
  /** 이미지 전용: 대체 텍스트/설명 */
  alt_text: z.string().max(500).optional(),
}).strict()

export type FileSourceMetadata = z.infer<typeof FileSourceMetadataSchema>

/** DB에 저장할 때는 Record 형태도 허용 (확장 필드) */
export const FileSourceMetadataDbSchema = FileSourceMetadataSchema.catchall(z.unknown())
export type FileSourceMetadataDb = z.infer<typeof FileSourceMetadataDbSchema>
