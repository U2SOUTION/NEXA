/**
 * JWT 발급·검증 [NEXA-AUTH-01] §5.1, §12.1
 * access 1h, refresh 7d. refresh에는 jti 부여(블랙리스트용)
 */
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { authConfig } from '@/config/authConfig.js'

const { jwtAccessSecret, jwtRefreshSecret, accessExpirySec, refreshExpirySec } = authConfig

export function signAccess(payload) {
  return jwt.sign(
    { ...payload, type: 'access' },
    jwtAccessSecret,
    { expiresIn: accessExpirySec }
  )
}

export function signRefresh(payload) {
  const jti = uuidv4()
  const token = jwt.sign(
    { ...payload, type: 'refresh', jti },
    jwtRefreshSecret,
    { expiresIn: refreshExpirySec }
  )
  return { token, jti, expiresIn: refreshExpirySec }
}

export function verifyAccess(token) {
  try {
    const decoded = jwt.verify(token, jwtAccessSecret)
    return decoded.type === 'access' ? decoded : null
  } catch {
    return null
  }
}

export function verifyRefresh(token) {
  try {
    const decoded = jwt.verify(token, jwtRefreshSecret)
    return decoded.type === 'refresh' ? decoded : null
  } catch {
    return null
  }
}
