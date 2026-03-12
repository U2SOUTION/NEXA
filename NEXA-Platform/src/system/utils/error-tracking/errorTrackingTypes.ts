/**
 * 에러 트래킹 공통 타입
 */

export interface NormalizedError {
  message: string
  level: string
  file: string | null
  line: number | null
  column: number | null
  stack: string | null
  url: string
  userAgent: string
  timestamp: number
  errorType?: string | null
  id?: string
  status?: string
  count?: number
  type?: string
  ruleId?: string | null
  networkInfo?: Record<string, unknown>
  vueInfo?: unknown
}
