/**
 * API 공통 타입 — 서버·프론트 공유
 * 목록 응답, 페이징, 성공/실패 래퍼
 *
 * @see docs/JS_TS_전환_계획.md (Phase 0 공통 타입 뼈대)
 * ApiResponse<T> — API 성공 래퍼
 * ApiErrorResponse — 실패 시 code/error
 * ApiResult<T> — 성공 | 실패 유니온
 * PaginationParams — offset, limit (요청)
 * PaginationResult<T> — items, total, offset, limit (응답)
 */

/** API 성공 응답 래퍼 (제네릭) */
export interface ApiResponse<T = unknown> {
  ok: true
  data: T
}

/** API 실패 응답 래퍼 */
export interface ApiErrorResponse {
  ok: false
  code?: string
  error: string
}

/** API 응답 (성공 또는 실패) */
export type ApiResult<T = unknown> = ApiResponse<T> | ApiErrorResponse

/** 페이징 파라미터 (요청) */
export interface PaginationParams {
  offset?: number
  limit?: number
}

/** 페이징된 목록 응답 (서버·프론트 공통) */
export interface PaginationResult<T = unknown> {
  items: T[]
  total: number
  offset: number
  limit: number
}
