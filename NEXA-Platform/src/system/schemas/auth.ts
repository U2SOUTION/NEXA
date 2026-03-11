/**
 * 인증 API 스키마 — 서버·프론트 공유
 * [NEXA-PLATFORM-TS-01] §2.1
 */
import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('유효한 이메일 형식이 아닙니다').max(255),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
  display_name: z.string().max(100).optional().default(''),
})

export const loginSchema = z.object({
  email: z.string().email('유효한 이메일 형식이 아닙니다'),
  password: z.string().min(1, '비밀번호를 입력하세요'),
})

export const refreshSchema = z.object({
  refresh_token: z.string().min(1, 'refresh_token이 필요합니다'),
})

export const logoutSchema = z.object({
  refresh_token: z.string().min(1, 'refresh_token이 필요합니다'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RefreshInput = z.infer<typeof refreshSchema>
export type LogoutInput = z.infer<typeof logoutSchema>
