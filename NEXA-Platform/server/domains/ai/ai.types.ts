/**
 * AI 도메인 타입 — [NEXA-AI-10]
 * 프롬프트 컨텍스트·비동기 작업 상태 등
 */

/** 프로젝트 컨텍스트 — AI 프롬프트에 주입하는 프로젝트 메타데이터 */
export interface ProjectContext {
  id: string
  name: string
  description: string | null
}

/** 디바이스 컨텍스트 — AI 프롬프트에 주입하는 디바이스 메타데이터 */
export interface DeviceContext {
  id: string
  name: string
  projectId: string
  metadata?: Record<string, unknown>
}

/** AI 비동기 작업 상태 — 큐·폴링·UI 표시용 */
export type AiJobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
