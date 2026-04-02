// auth.middleware.ts
/**
 * JWT 인증 미들웨어 [NEXA-AUTH-01]
 * Bearer(전달받은) access_token 검증 → req.user 설정. 없거나 실패 시 X-Device-Token 시도.
 *
 * 1) 인증 실패·비즈니스 메시지(401 등)는 `src/system/schemas/errors.ts`의 **ApiErrorCode**와
 *    `{ code, message }` 형태로 맞춥니다. (`ApiErrorResponse` — 로그인 API·프론트와 동일)
 * 2) `server.ts` 맨 끝의 **전역 에러 미들웨어**(`errorMiddleware`)는 `throw`/`next(err)`로 넘어온
 *    예외만 잡으며, 본문은 `{ error, nexaCode, message? }` (`errUtils.toApiErrorBody`) 입니다.
 *    둘은 용도가 다르므로 이 미들웨어에서 401을 보낼 때 `next(err)`로 넘기지 않습니다.
 * 3) DB 조회 등 **예기치 않은 오류(500)** 는 내부 `Error.message`를 프로덕션에 그대로 주면 안 되므로
 *    `toApiErrorBody`로 안전한 문구만 고르고, 응답 필드는 여전히 `code: SERVER_ERROR` + `message` 로
 *    맞춥니다. (개발 모드 또는 `NEXA_EXPOSE_ERROR_DETAILS=1` 일 때만 상세 message 포함)
 */
import { ApiErrorCode } from '@system/schemas/errors.js'
import { allowedDomainsSchema } from '@system/schemas/jsonb.js'
import { toUserId } from '@system/types/ids.js'
import { parseJsonb } from '@/utils/parseJsonb.js'
import type { AuthUser } from '@/types/common.js'
import { verifyAccess } from '@/utils/jwtAuth.js'
import { pool } from '@/config/dbConfig.js'
import { deviceTokenAuth } from './deviceAuth.middleware.js'
import { toApiErrorBody } from '@/utils/errUtils.js'

const AUTH_SKIP_PATHS = ['/api/auth/register', '/api/auth/login', '/api/auth/refresh', '/api/auth/logout']

// 로그인 UI 적용 전까지 인증 없이 허용 (부품관리·아카이브·문서·AI 등). 로그인 UI 붙인 뒤 제거하고 /api/auth/me만 보호할지 결정.
// [NEXA-ADMIN] /api/admin은 인증 예외 없음 — role=admin 체크로 슈퍼관리자만 허용.
const AUTH_SKIP_PREFIXES = ['/api/part-classes', '/api/part-models', '/api/part-specs', '/api/part-files', '/api/archives', '/api/archive-doc', '/api/system-templates', '/api/docs', '/api/files', '/api/db', '/api/dev/', '/api/package-json', '/api/ai/', '/api/ai-user-memos']

function shouldSkipAuth(path: string | undefined): boolean {
  if (!path) return true
  const p = String(path).split('?')[0]
  if (AUTH_SKIP_PATHS.some((skip) => p === skip || p.startsWith(skip + '/'))) return true
  if (p === '/api/health' || p.startsWith('/api/health/')) return true
  if (AUTH_SKIP_PREFIXES.some((prefix) => p === prefix || p.startsWith(prefix))) return true
  return false
}

function toUserResponse(row: Record<string, unknown> | null): AuthUser | null {
  if (!row || typeof row.id !== 'string') return null
  return {
    id: toUserId(row.id),
    email: String(row.email ?? ''),
    display_name: String(row.display_name ?? ''),
    role: String(row.role ?? ''),
    tier: String(row.tier ?? ''),
    allowed_domains: parseJsonb(row.allowed_domains, allowedDomainsSchema) ?? null,
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
    password_must_change: row.password_must_change === true,
  }
}

type MiddlewareFn = (req: { path?: string; headers?: { authorization?: string }; user?: unknown }, res: { status: (n: number) => { json: (o: unknown) => void } }, next: () => void) => void | Promise<void>

export const jwtAuthMiddleware: MiddlewareFn = (req, res, next) => {
  // 예외 경로는 인증 없이 다음 핸들러로 (목록은 상단 AUTH_* 상수 참고)
  if (shouldSkipAuth(req.path)) return next()

  const authHeader = req.headers?.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  // Access JWT가 없으면 디바이스 토큰 헤더로 재시도 (deviceAuth.middleware)
  if (!token) {
    return deviceTokenAuth(req, res, next)
  }

  const decoded = verifyAccess(token) as { user_id?: string } | null
  // 토큰은 있으나 서명/만료 등으로 user_id를 못 얻으면 JWT 대신 디바이스 흐름으로 넘김
  if (!decoded?.user_id) {
    return deviceTokenAuth(req, res, next)
  }

  pool
    .query('SELECT id, email, display_name, role, tier, allowed_domains, created_at, updated_at, password_must_change FROM users WHERE id = $1 AND deleted_at IS NULL', [decoded.user_id])
    .then(({ rows }) => {
      const user = toUserResponse(rows[0])
      if (!user) {
        // JWT의 user_id는 유효했으나 DB에 행이 없거나 삭제됨 → 401 + ApiErrorResponse
        // next(err)를 쓰면 전역 핸들러가 { error, nexaCode } 를 내려 프론트가 기대하는 `code`와 어긋남
        return res.status(401).json({ code: ApiErrorCode.USER_NOT_FOUND, message: '사용자를 찾을 수 없습니다.' })
      }
      req.user = user
      next()
    })
    .catch((err: unknown) => {
      console.error('[auth middleware]', err)
      // toApiErrorBody: expose가 꺼진 프로덕션에서는 body.message 없음 → 사용자용 문구는 body.error 사용
      // expose가 켜진 경우에만 body.message에 원인 요약(또는 NexaAppError 메시지)이 들어감
      const { body } = toApiErrorBody(err)
      res.status(500).json({
        code: ApiErrorCode.SERVER_ERROR,
        message: body.message ?? body.error,
      })
    })
}
