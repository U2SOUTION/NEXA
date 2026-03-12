/**
 * JWT 인증 미들웨어 [NEXA-AUTH-01] §5.3
 * Bearer access_token 검증 → req.user 설정. 없거나 실패 시 X-Device-Token 시도.
 */
import { ApiErrorCode } from '@system/schemas/errors.js'
import { allowedDomainsSchema } from '@system/schemas/jsonb.js'
import { toUserId } from '@system/types/ids.js'
import { parseJsonb } from '@/utils/parseJsonb.js'
import type { AuthUser } from '@/types/common.js'
import { verifyAccess } from '@/utils/jwtAuth.js'
import { pool } from '@/config/dbConfig.js'
import { deviceTokenAuth } from './deviceAuth.middleware.js'

const AUTH_SKIP_PATHS = [
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/refresh',
  '/api/auth/logout',
]

// 로그인 UI 적용 전까지 인증 없이 허용 (부품관리·아카이브·문서·AI 등). 로그인 UI 붙인 뒤 제거하고 /api/auth/me만 보호할지 결정.
// [NEXA-ADMIN-01] /api/admin은 인증 예외 없음 — role=admin 체크로 슈퍼관리자만 허용.
const AUTH_SKIP_PREFIXES = [
  '/api/part-classes',
  '/api/part-models',
  '/api/part-specs',
  '/api/part-files',
  '/api/archives',
  '/api/archive-doc',
  '/api/system-templates',
  '/api/docs',
  '/api/files',
  '/api/db',
  '/api/dev/',
  '/api/package-json',
  '/api/ai/',
  '/api/ai-user-memos',
]

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
  if (shouldSkipAuth(req.path)) return next()

  const authHeader = req.headers?.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    return deviceTokenAuth(req, res, next)
  }

  const decoded = verifyAccess(token) as { user_id?: string } | null
  if (!decoded?.user_id) {
    return deviceTokenAuth(req, res, next)
  }

  pool
    .query(
      'SELECT id, email, display_name, role, tier, allowed_domains, created_at, updated_at, password_must_change FROM users WHERE id = $1 AND deleted_at IS NULL',
      [decoded.user_id]
    )
    .then(({ rows }) => {
      const user = toUserResponse(rows[0])
      if (!user) {
        return res.status(401).json({ code: ApiErrorCode.USER_NOT_FOUND, message: '사용자를 찾을 수 없습니다.' })
      }
      req.user = user
      next()
    })
    .catch((err) => {
      console.error('[auth middleware]', err)
      res.status(500).json({ code: ApiErrorCode.SERVER_ERROR, message: (err as Error).message })
    })
}
