/**
 * [NEXA-ADMIN-01] 관리자 API
 * DB·정책: [NEXA-MIGRATE-01] Postgres(pg), pool.query, 플레이스홀더 $1,$2.
 * users 테이블: database/init_auth.sql ([NEXA-AUTH-01] §4.1). id(UUID v7), email, display_name, role, tier, created_at, deleted_at 등.
 *
 * GET /api/admin/members — 회원 목록. (인증 예외는 auth.middleware AUTH_SKIP_PREFIXES에서 관리. 추후 슈퍼관리자만 제한)
 */
import { Router } from 'express'
import { pool } from '@/config/dbConfig.js'

const router = Router()

/** GET /api/admin/members — 회원 목록 (users from init_auth.sql, Postgres §4.5 Node 드라이버) */
router.get('/admin/members', async (req, res) => {
  try {
    // 추후: JWT 검증 후 req.user?.role === 'admin' 체크로 슈퍼관리자만 허용
    const { rows } = await pool.query<{
      id: string
      email: string
      display_name: string | null
      role: string
      tier: string
      created_at: string | null
      deleted_at: string | null
    }>(
      `SELECT id, email, display_name, role, tier, created_at, deleted_at
       FROM users
       ORDER BY created_at DESC NULLS LAST`
    )
    const list = rows.map((r) => ({
      id: r.id,
      email: r.email ?? '',
      display_name: r.display_name ?? '',
      role: r.role ?? 'user',
      tier: r.tier ?? 'BASIC',
      created_at: r.created_at ?? '',
      status: r.deleted_at == null ? 'active' : 'inactive',
    }))
    res.json(list)
  } catch (err) {
    console.error('[GET /api/admin/members]', err)
    res.status(500).json({ message: (err as Error).message })
  }
})

export default router
