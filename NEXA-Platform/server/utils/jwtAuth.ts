/**
 * JWT 발급·검증 [NEXA-AUTH-01] §5.1, §12.1
 * access 1h, refresh 7d. refresh에는 jti 부여(블랙리스트용)
 */
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { authConfig } from '@/config/authConfig.js'

const { jwtAccessSecret, jwtRefreshSecret, accessExpirySec, refreshExpirySec } = authConfig

export function signAccess(payload: { user_id: string; email?: string; role?: string }) {
  return jwt.sign(
    { ...payload, type: 'access' },
    jwtAccessSecret,
    { expiresIn: accessExpirySec }
  )
}

export function signRefresh(payload: { user_id: string }) {
  const jti = uuidv4()
  const token = jwt.sign(
    { ...payload, type: 'refresh', jti },
    jwtRefreshSecret,
    { expiresIn: refreshExpirySec }
  )
  return { token, jti, expiresIn: refreshExpirySec }
}

export function verifyAccess(token: string) {
  try {
    const decoded = jwt.verify(token, jwtAccessSecret) as { type?: string; user_id?: string }
    return decoded?.type === 'access' ? decoded : null
  } catch {
    return null
  }
}

export function verifyRefresh(token: string) {
  try {
    const decoded = jwt.verify(token, jwtRefreshSecret) as { type?: string; jti?: string; user_id?: string; exp?: number }
    return decoded?.type === 'refresh' ? decoded : null
  } catch {
    return null
  }
}
