// server/utils/errUtils.ts
/**
 * 에러 유틸 — strict 모드에서 catch (err: unknown) 처리
 * 분석 전문가용 유틸
 * --> 예: 모든 도메인에서 throw된 에러를 최종 처리하는 미들웨어
 */

/** 프로덕션에서 원시 message·DB code 노출 여부 (기본: 숨김) */
export function exposeErrorDetailsToClient(): boolean {
  return process.env.NODE_ENV !== 'production' || process.env.NEXA_EXPOSE_ERROR_DETAILS === '1'
}

export function errMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

/** 드라이버·런타임 code (예: ER_DUP_ENTRY, 23505) — 클라이언트 노출 시 주의 */
export function errCode(e: unknown): string | undefined {
  return (e as { code?: string })?.code
}

// ---------------------------------------------------------------------------
// NEXA 전용 API 오류 코드 (클라이언트가 i18n·토스트에 매핑)
// ---------------------------------------------------------------------------

export const NexaErr = {
  INTERNAL: 'NEXA_INTERNAL',
  VALIDATION: 'NEXA_VALIDATION',
  NOT_FOUND: 'NEXA_NOT_FOUND',
  CONFLICT: 'NEXA_CONFLICT',
  UNAUTHORIZED: 'NEXA_UNAUTHORIZED',
  FORBIDDEN: 'NEXA_FORBIDDEN',
  RATE_LIMITED: 'NEXA_RATE_LIMITED',
} as const

export type NexaErrCode = (typeof NexaErr)[keyof typeof NexaErr]

/**
 * 의도된 비즈니스/API 오류 — `nexaCode`는 항상 클라이언트로 전달 가능.
 * `exposeMessage: true`일 때만 프로덕션에서도 `message`를 응답에 포함 (예: 입력 검증 요약).
 *
 * @example
 * ```ts
 * import { NexaAppError, NexaErr } from '@/utils/errUtils.js'
 * if (!id) throw new NexaAppError(NexaErr.VALIDATION, 'id는 필수입니다.', { statusCode: 400, exposeMessage: true })
 * ```
 */
export class NexaAppError extends Error {
  readonly nexaCode: NexaErrCode
  readonly statusCode: number
  /** true면 프로덕션에서도 message를 API 응답에 포함 */
  readonly exposeMessage: boolean

  constructor(nexaCode: NexaErrCode, message: string, options?: { statusCode?: number; exposeMessage?: boolean }) {
    super(message)
    this.name = 'NexaAppError'
    this.nexaCode = nexaCode
    this.statusCode = options?.statusCode ?? 500
    this.exposeMessage = options?.exposeMessage ?? false
  }
}

export function isNexaAppError(e: unknown): e is NexaAppError {
  return e instanceof NexaAppError
}

/** 클라이언트용 NEXA 코드 (알 수 없으면 INTERNAL) */
export function nexaErrCode(e: unknown): NexaErrCode {
  if (isNexaAppError(e)) return e.nexaCode
  return NexaErr.INTERNAL
}

export type ApiErrorBody = {
  error: string
  nexaCode: NexaErrCode
  /** 프로덕션 기본 비노출. exposeMessage 또는 개발 모드에서만 */
  message?: string
  /** 개발 전용: DB/런타임 code */
  debugCode?: string
}

/**
 * JSON 응답용 본문. 보안: 프로덕션에서는 내부 stack·원시 Error.message·req.body를 넣지 않는다.
 */
export function toApiErrorBody(err: unknown): { status: number; body: ApiErrorBody } {
  const expose = exposeErrorDetailsToClient()
  const nexaCode = nexaErrCode(err)

  if (isNexaAppError(err)) {
    const body: ApiErrorBody = {
      error: '요청을 처리할 수 없습니다.',
      nexaCode: err.nexaCode,
    }
    if (expose || err.exposeMessage) {
      body.message = err.message
    }
    if (expose) {
      const dc = errCode(err)
      if (dc) body.debugCode = dc
    }
    return { status: err.statusCode, body }
  }

  const body: ApiErrorBody = {
    error: '서버 오류가 발생했습니다.',
    nexaCode,
  }
  if (expose) {
    body.message = errMessage(err)
    const dc = errCode(err)
    if (dc) body.debugCode = dc
  }
  return { status: 500, body }
}
