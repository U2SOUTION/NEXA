/**
 * 인증 API [NEXA-AUTH-01] §5.1
 * POST /api/auth/register, login, refresh, logout | GET /api/auth/me
 */
import { Router } from 'express'
import type { ResponseLike } from '@/types/request-response.js'
import bcrypt from 'bcryptjs'
import type { ZodError } from 'zod'
import { registerSchema, loginSchema, refreshSchema, logoutSchema } from '@system/schemas/auth.js'
import { ApiErrorCode } from '@system/schemas/errors.js'
import { allowedDomainsSchema } from '@system/schemas/jsonb.js'
import { toUserId } from '@system/types/ids.js'
import { parseJsonb } from '@/utils/parseJsonb.js'
import type { AuthUser } from '@/types/common.js'
import { pool } from '@/config/dbConfig.js'
import { generateUuidV7 } from '@/config/uuidUtils.js'
import { authConfig } from '@/config/authConfig.js'
import { signAccess, signRefresh, verifyAccess, verifyRefresh } from '@/utils/jwtAuth.js'
import redisClient from '@/config/redis.js'

const router = Router()
const SALT_ROUNDS = 10

function validationErrorResponse(res: ResponseLike, err: unknown): ResponseLike {
  const zodErr = err as { issues?: { path: (string | number)[]; message: string }[] }
  const errors = zodErr?.issues?.map((i) => ({ path: i.path.join('.'), message: i.message })) ?? []
  return res.status(400).json({
    code: ApiErrorCode.VALIDATION_ERROR,
    message: '입력값 검증 실패',
    errors,
  })
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
  }
}

/** POST /api/auth/register */
router.post('/auth/register', async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) return validationErrorResponse(res, parsed.error)

    const { email, password, display_name } = parsed.data
    const normalizedEmail = email.trim().toLowerCase()

    const { rows: existing } = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL',
      [normalizedEmail]
    )
    if (existing.length > 0) {
      return res.status(409).json({ code: ApiErrorCode.EMAIL_IN_USE, message: '이미 사용 중인 이메일입니다.' })
    }

    const id = generateUuidV7()
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS)

    await pool.query(
      `INSERT INTO users (id, email, password_hash, display_name, role, tier)
       VALUES ($1, $2, $3, $4, 'user', $5)`,
      [id, normalizedEmail, password_hash, (display_name || '').trim() || null, authConfig.defaultTier]
    )

    const { rows: userRows } = await pool.query(
      'SELECT id, email, display_name, role, tier, allowed_domains, created_at, updated_at FROM users WHERE id = $1',
      [id]
    )
    const user = toUserResponse(userRows[0] as Record<string, unknown>)
    if (!user) throw new Error('User not found after insert')
    const access_token = signAccess({ user_id: id, email: normalizedEmail, role: user.role })
    const { token: refresh_token, expiresIn: refresh_expires_in } = signRefresh({ user_id: id })

    return res.status(201).json({
      user,
      access_token,
      refresh_token,
      expires_in: authConfig.accessExpirySec,
      refresh_expires_in,
    })
  } catch (err) {
    console.error('[auth/register]', err)
    return res.status(500).json({ code: ApiErrorCode.SERVER_ERROR, message: (err as Error).message })
  }
})

/** POST /api/auth/login */
router.post('/auth/login', async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) return validationErrorResponse(res, parsed.error)

    const { email, password } = parsed.data
    const normalizedEmail = email.trim().toLowerCase()

    const { rows } = await pool.query(
      'SELECT id, email, password_hash, display_name, role, tier, allowed_domains, created_at, updated_at FROM users WHERE email = $1 AND deleted_at IS NULL',
      [normalizedEmail]
    )
    const row = rows[0] as Record<string, unknown> | undefined
    if (!row) {
      return res.status(401).json({ code: ApiErrorCode.INVALID_CREDENTIALS, message: '이메일 또는 비밀번호가 올바르지 않습니다.' })
    }

    const match = await bcrypt.compare(password, String(row.password_hash ?? ''))
    if (!match) {
      return res.status(401).json({ code: ApiErrorCode.INVALID_CREDENTIALS, message: '이메일 또는 비밀번호가 올바르지 않습니다.' })
    }

    const user = toUserResponse(row)
    const userId = String(row.id ?? '')
    const userEmail = String(row.email ?? '')
    const userRole = String(row.role ?? '')
    const access_token = signAccess({ user_id: userId, email: userEmail, role: userRole })
    const { token: refresh_token, expiresIn: refresh_expires_in } = signRefresh({ user_id: userId })

    return res.json({
      user,
      access_token,
      refresh_token,
      expires_in: authConfig.accessExpirySec,
      refresh_expires_in,
    })
  } catch (err) {
    console.error('[auth/login]', err)
    return res.status(500).json({ code: ApiErrorCode.SERVER_ERROR, message: (err as Error).message })
  }
})

/** POST /api/auth/refresh */
router.post('/auth/refresh', async (req, res) => {
  try {
    const parsed = refreshSchema.safeParse(req.body)
    if (!parsed.success) return validationErrorResponse(res, parsed.error)

    const { refresh_token: token } = parsed.data
    const decoded = verifyRefresh(token) as { jti?: string; user_id?: string; exp?: number } | null
    if (!decoded) {
      return res.status(401).json({ code: ApiErrorCode.INVALID_REFRESH_TOKEN, message: '유효하지 않거나 만료된 토큰입니다.' })
    }

    if (redisClient && decoded.jti) {
      const blacklisted = await redisClient.get(`refresh_blacklist:${decoded.jti}`)
      if (blacklisted) {
        return res.status(401).json({ code: ApiErrorCode.REFRESH_TOKEN_REVOKED, message: '이미 로그아웃된 토큰입니다.' })
      }
    }

    const userId = decoded.user_id
    if (!userId) return res.status(401).json({ code: ApiErrorCode.INVALID_REFRESH_TOKEN, message: '유효하지 않은 토큰입니다.' })
    const { rows } = await pool.query(
      'SELECT id, email, display_name, role, tier, allowed_domains, created_at, updated_at FROM users WHERE id = $1 AND deleted_at IS NULL',
      [userId]
    )
    if (!rows[0]) {
      return res.status(401).json({ code: ApiErrorCode.USER_NOT_FOUND, message: '사용자를 찾을 수 없습니다.' })
    }

    const user = toUserResponse(rows[0] as Record<string, unknown>)
    if (!user) return res.status(401).json({ code: ApiErrorCode.USER_NOT_FOUND, message: '사용자를 찾을 수 없습니다.' })
    const access_token = signAccess({ user_id: user.id, email: user.email, role: user.role })

    return res.json({
      user,
      access_token,
      expires_in: authConfig.accessExpirySec,
    })
  } catch (err) {
    console.error('[auth/refresh]', err)
    return res.status(500).json({ code: ApiErrorCode.SERVER_ERROR, message: (err as Error).message })
  }
})

/** POST /api/auth/logout — refresh_token 블랙리스트 등록 */
router.post('/auth/logout', async (req, res) => {
  try {
    const parsed = logoutSchema.safeParse(req.body)
    if (!parsed.success) return validationErrorResponse(res, parsed.error)

    const { refresh_token: token } = parsed.data
    const decoded = verifyRefresh(token) as { jti?: string; exp?: number } | null
    if (decoded?.jti && redisClient && decoded.exp) {
      const ttl = Math.max(1, (decoded.exp - Math.floor(Date.now() / 1000)))
      await redisClient.setex(`refresh_blacklist:${decoded.jti}`, ttl, '1')
    }
    return res.json({ success: true })
  } catch (err) {
    console.error('[auth/logout]', err)
    return res.status(500).json({ code: ApiErrorCode.SERVER_ERROR, message: (err as Error).message })
  }
})

/** GET /api/auth/me — JWT 미들웨어 이후 호출, req.user 사용 */
router.get('/auth/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ code: ApiErrorCode.UNAUTHORIZED, message: '인증이 필요합니다.' })
  }
  return res.json({ user: req.user })
})

export default router
