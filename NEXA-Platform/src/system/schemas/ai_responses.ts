/**
 * AI(LLM) 응답 스키마 — [NEXA-AI-10]
 * Ollama 등 LLM JSON 응답 검증·프롬프트 가이드용.
 * 사용: aiResponseSchema.parse(JSON.parse(aiRawOutput))
 */
import { z } from 'zod'

/** 문서 요약 응답 — summary API */
export const summaryResponseSchema = z.object({
  summary: z.string(),
  keywords: z.array(z.string()),
  confidence: z.number().min(0).max(1).optional(),
})
export type SummaryResponse = z.infer<typeof summaryResponseSchema>

/** 정보 추출 응답 — extraction API (메타데이터, 엔티티 등) */
export const extractionResponseSchema = z.object({
  entities: z.array(z.object({
    type: z.string(),
    value: z.string(),
    start: z.number().optional(),
    end: z.number().optional(),
  })).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  raw_text: z.string().optional(),
})
export type ExtractionResponse = z.infer<typeof extractionResponseSchema>

/** 채팅/대화 응답 — chat API (스트리밍 시에는 message 객체만 사용) */
export const chatMessageResponseSchema = z.object({
  message: z.object({
    role: z.enum(['assistant', 'user', 'system']),
    content: z.string(),
  }),
})
export type ChatMessageResponse = z.infer<typeof chatMessageResponseSchema>
