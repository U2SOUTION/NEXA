/**
 * [NEXA-ADMIN-01] 관리자 API — 슈퍼관리자(role=admin) 전용.
 * DB·정책: [NEXA-MIGRATE-01] Postgres(pg), pool.query, 플레이스홀더 $1,$2.
 * users 테이블: database/init_auth.sql. JWT 필수, role=admin만 200 허용.
 */
import { Router } from 'express'
import type { AuthUser } from '@/types/common.js'
import { pool } from '@/config/dbConfig.js'

const router = Router()

router.use((req, res, next) => {
  const user = req.user as AuthUser | undefined
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ code: 'FORBIDDEN', message: '슈퍼관리자만 접근할 수 있습니다.' })
  }
  next()
})

/** GET /api/admin/members — 회원 목록 (users from init_auth.sql). 마운트: /api/admin */
router.get('/members', async (req, res) => {
  try {
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
