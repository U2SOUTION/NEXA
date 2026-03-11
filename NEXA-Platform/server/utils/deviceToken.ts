/**
 * Device Token 해시 [NEXA-AUTH-01] §4.2
 * 평문 저장 금지, SHA256 해시만 DB 저장·비교
 */
import crypto from 'crypto'

const DEVICE_TOKEN_CACHE_TTL_SEC = 3600 // 1시간

/**
 * @param {string} rawToken - 디바이스에 발급한 평문 토큰
 * @returns {string} 64자 hex (SHA256)
 */
export function hashDeviceToken(rawToken: string) {
  if (!rawToken || typeof rawToken !== 'string') return ''
  return crypto.createHash('sha256').update(rawToken.trim()).digest('hex')
}

/**
 * Redis 캐시 키
 * @param {string} tokenHash - SHA256 hex
 */
export function deviceCacheKey(tokenHash: string) {
  return `nexa:device:${tokenHash}`
}

export { DEVICE_TOKEN_CACHE_TTL_SEC }
