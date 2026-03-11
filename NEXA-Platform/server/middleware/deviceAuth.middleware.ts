/**
 * Device Token 인증 [NEXA-AUTH-01] §5.3
 * JWT 없을 때 X-Device-Token으로 디바이스 인증 → req.user 설정
 * Redis 캐시 우선, 미스 시 DB 조회. 응답 전 last_seen, mac_address, ip_address 갱신
 */
import { allowedDomainsSchema } from '@system/schemas/jsonb.js'
import { parseJsonb } from '@/utils/parseJsonb.js'
import type { AuthUser } from '@/types/common.js'
import { toUserId } from '@system/types/ids.js'
import { hashDeviceToken } from '@/utils/deviceToken.js'
import { pool } from '@/config/dbConfig.js'
import * as devicesService from '@/domains/devices/devices.service.js'

function toUserResponse(row: Record<string, unknown> | null) {
  if (!row) return null
  const userId = row.u_id ?? row.user_id
  return {
    id: String(userId ?? ''),
    email: row.email || '',
    display_name: row.display_name || '',
    role: row.role || 'user',
    tier: row.tier || 'BASIC',
    allowed_domains: parseJsonb(row.allowed_domains, allowedDomainsSchema) ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

type AuthReq = { user?: unknown; headers?: Record<string, unknown>; deviceId?: unknown; ip?: string; connection?: { remoteAddress?: string } }
type AuthMiddlewareFn = (req: AuthReq, res: { status: (n: number) => { json: (o: unknown) => void } }, next: () => void) => void | Promise<void>

export const deviceTokenAuth: AuthMiddlewareFn = async (req, res, next) => {
  if (req.user) return next()

  const rawToken = req.headers?.['x-device-token']
  if (!rawToken || typeof rawToken !== 'string') {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: '인증이 필요합니다.' })
  }

  const tokenHash = hashDeviceToken(rawToken)
  if (!tokenHash) {
    return res.status(401).json({ code: 'INVALID_TOKEN', message: '유효하지 않은 디바이스 토큰입니다.' })
  }

  let cached = await devicesService.getDeviceFromCache(tokenHash)
  let row = null
  if (cached?.user_id && cached?.device_id) {
    if (!cached.is_active) {
      return res.status(401).json({ code: 'DEVICE_INACTIVE', message: '비활성화된 디바이스입니다.' })
    }
    const userRow = (await pool.query(
      'SELECT id, email, display_name, role, tier, allowed_domains, created_at, updated_at FROM users WHERE id = $1 AND deleted_at IS NULL',
      [cached.user_id]
    )).rows[0]
    if (userRow) {
      req.user = toUserResponse({ ...userRow, u_id: userRow.id })
      req.deviceId = cached.device_id
      await devicesService.updateDeviceLastSeen(String(cached.device_id), {
        mac_address: (req.headers?.['x-device-mac'] ?? null) as string | null,
        ip_address: req.ip ?? req.connection?.remoteAddress ?? null,
      })
      return next()
    }
  }

  row = await devicesService.getDeviceByTokenHash(tokenHash)
  if (!row) {
    return res.status(401).json({ code: 'INVALID_TOKEN', message: '디바이스를 찾을 수 없습니다.' })
  }
  if (!row.is_active) {
    return res.status(401).json({ code: 'DEVICE_INACTIVE', message: '비활성화된 디바이스입니다.' })
  }

  req.user = toUserResponse(row) as AuthUser
  req.deviceId = row.id as string
  await devicesService.setDeviceCache(
    tokenHash,
    toUserId(String(row.user_id ?? '')),
    row.id as string,
    Boolean(row.is_active),
  )
  await devicesService.updateDeviceLastSeen(row.id as string, {
    mac_address: (req.headers?.['x-device-mac'] ?? row.mac_address ?? null) as string | null,
    ip_address: (req.ip ?? req.connection?.remoteAddress ?? null) as string | null,
  })
  next()
}
