/**
 * 디바이스 서비스 [NEXA-AUTH-01] §4.2, §5.2
 * device_registry, device_members CRUD, 캐시 무효화
 */
import type { UserId, DeviceId } from '@system/types/ids.js'
import type { CreateDevicePayload, UpdateDevicePayload, UpdateDeviceLastSeenPayload } from './device.types.js'
import { pool } from '@/config/dbConfig.js'
import { generateUuidV7 } from '@/config/uuidUtils.js'
import redisClient from '@/config/redis.js'
import { hashDeviceToken, deviceCacheKey, DEVICE_TOKEN_CACHE_TTL_SEC } from '@/utils/deviceToken.js'

export async function createDevice(userId: UserId, payload: CreateDevicePayload = {}) {
  const { name, device_type, mac_address } = payload
  const id = generateUuidV7()
  const rawToken = generateUuidV7().replace(/-/g, '') + generateUuidV7().replace(/-/g, '').slice(0, 8)
  const tokenHash = hashDeviceToken(rawToken)

  const client = await pool.connect()
  try {
    await client.query(
      `INSERT INTO device_registry (id, user_id, token_hash, name, device_type, mac_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, userId, tokenHash, name || null, device_type || null, mac_address || null]
    )
    const memberId = generateUuidV7()
    await client.query(
      `INSERT INTO device_members (id, user_id, device_id, role) VALUES ($1, $2, $3, 'owner')`,
      [memberId, userId, id]
    )
  } finally {
    client.release()
  }

  const [row] = (await pool.query(
    'SELECT id, user_id, name, device_type, mac_address, created_at, is_active FROM device_registry WHERE id = $1',
    [id]
  )).rows

  return { device: row, device_token: rawToken }
}

export async function listDevicesByUserId(userId: UserId) {
  const { rows } = await pool.query(
    `SELECT d.id, d.user_id, d.name, d.device_type, d.mac_address, d.last_seen, d.is_online, d.is_active, d.created_at,
            dm.role
     FROM device_registry d
     INNER JOIN device_members dm ON dm.device_id = d.id AND dm.user_id = $1
     ORDER BY d.created_at DESC`,
    [userId]
  )
  return rows
}

export async function getDeviceById(deviceId: DeviceId | string, userId: UserId) {
  const { rows } = await pool.query(
    `SELECT d.*, dm.role FROM device_registry d
     INNER JOIN device_members dm ON dm.device_id = d.id AND dm.user_id = $2
     WHERE d.id = $1`,
    [deviceId, userId]
  )
  return rows[0] || null
}

export async function getDeviceByTokenHash(tokenHash: string) {
  const { rows } = await pool.query(
    `SELECT d.*, u.id as u_id, u.email, u.display_name, u.role, u.tier, u.allowed_domains
     FROM device_registry d
     INNER JOIN users u ON u.id = d.user_id AND u.deleted_at IS NULL
     WHERE d.token_hash = $1`,
    [tokenHash]
  )
  return rows[0] || null
}

export async function updateDevice(deviceId: DeviceId | string, userId: UserId, payload: UpdateDevicePayload) {
  const device = await getDeviceById(deviceId, userId)
  if (!device) return null
  const { name, device_type, is_active } = payload
  const updates = []
  const values = []
  let i = 1
  if (name !== undefined) { updates.push(`name = $${i++}`); values.push(name) }
  if (device_type !== undefined) { updates.push(`device_type = $${i++}`); values.push(device_type) }
  if (is_active !== undefined) { updates.push(`is_active = $${i++}`); values.push(!!is_active) }
  if (updates.length === 0) return device
  values.push(deviceId)
  await pool.query(
    `UPDATE device_registry SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${i}`,
    values
  )
  if (payload.is_active === false && device?.token_hash) await invalidateDeviceCache(device.token_hash as string)
  return getDeviceById(deviceId, userId)
}

export async function deleteDevice(deviceId: DeviceId | string, userId: UserId) {
  const device = await getDeviceById(deviceId, userId)
  if (!device) return false
  await pool.query('DELETE FROM device_registry WHERE id = $1', [deviceId])
  await invalidateDeviceCache(device.token_hash as string | null | undefined)
  return true
}

export async function invalidateDeviceCache(tokenHash: string | null | undefined) {
  if (!tokenHash || !redisClient) return
  try {
    await redisClient.del(deviceCacheKey(tokenHash))
  } catch (err: unknown) {
    console.warn('[devices] cache invalidate:', (err as Error).message)
  }
}

export async function setDeviceCache(
  tokenHash: string,
  userId: UserId,
  deviceId: DeviceId | string,
  isActive: boolean,
) {
  if (!redisClient) return
  try {
    const val = JSON.stringify({ user_id: userId, device_id: deviceId, is_active: !!isActive })
    await redisClient.setex(deviceCacheKey(tokenHash), DEVICE_TOKEN_CACHE_TTL_SEC, val)
  } catch (err: unknown) {
    console.warn('[devices] cache set:', (err as Error).message)
  }
}

export async function getDeviceFromCache(tokenHash: string | null | undefined) {
  if (!redisClient) return null
  try {
    const raw = await redisClient.get(deviceCacheKey(tokenHash))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export async function updateDeviceLastSeen(deviceId: DeviceId | string, payload: UpdateDeviceLastSeenPayload = {}) {
  const { mac_address, ip_address } = payload
  const updates = ['last_seen = CURRENT_TIMESTAMP', 'is_online = true', 'updated_at = CURRENT_TIMESTAMP']
  const values = [deviceId]
  let i = 2
  if (mac_address != null) { updates.push(`mac_address = $${i++}`); values.push(String(mac_address).slice(0, 17)) }
  if (ip_address != null) { updates.push(`ip_address = $${i++}`); values.push(String(ip_address).slice(0, 45)) }
  await pool.query(
    `UPDATE device_registry SET ${updates.join(', ')} WHERE id = $1`,
    values
  )
}
