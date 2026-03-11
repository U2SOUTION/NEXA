/**
 * Express Request/Response 타입 호환용 — @types/express의 export 이슈 회피
 * [NEXA-PLATFORM-TS-01] 서버 컨트롤러에서 사용
 */
import type { AuthUser } from './common'

export interface RequestLike {
  body?: unknown
  params?: Record<string, string>
  user?: AuthUser
}

export interface ResponseLike {
  status(code: number): ResponseLike
  json(body: unknown): ResponseLike
  send(): ResponseLike
}
