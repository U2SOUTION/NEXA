/**
 * 인증·사용자 API 타입 — 서버·프론트 공유
 * GET /api/auth/me, login, register 응답의 user
 */
import type { UserId } from '../ids'

export interface AuthUser {
  id: UserId
  email: string
  display_name: string
  role: string
  tier: string
  allowed_domains: string[] | null
  created_at: string
  updated_at: string
}
