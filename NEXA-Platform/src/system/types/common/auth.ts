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
  /** [NEXA-ADMIN-01] true면 로그인 후 비밀번호 변경 필요(슈퍼관리자 등) */
  password_must_change?: boolean
}
