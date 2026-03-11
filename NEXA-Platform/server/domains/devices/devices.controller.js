/**
 * 디바이스 API 컨트롤러 [NEXA-AUTH-01] §5.2
 */
import * as devicesService from './devices.service.js'

function toDeviceResponse(row) {
  if (!row) return null
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    device_type: row.device_type,
    mac_address: row.mac_address,
    last_seen: row.last_seen,
    is_online: row.is_online,
    is_active: row.is_active,
    created_at: row.created_at,
    role: row.role,
  }
}

export async function postDevice(req, res) {
  if (!req.user?.id) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: '인증이 필요합니다.' })
  }
  try {
    const { name, device_type, mac_address } = req.body || {}
    const result = await devicesService.createDevice(req.user.id, { name, device_type, mac_address })
    return res.status(201).json({
      device: toDeviceResponse(result.device),
      device_token: result.device_token,
      message: 'device_token은 이번에만 노출됩니다. 안전하게 저장하세요.',
    })
  } catch (err) {
    console.error('[POST /api/devices]', err)
    return res.status(500).json({ code: 'SERVER_ERROR', message: err.message })
  }
}

export async function getDevices(req, res) {
  if (!req.user?.id) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: '인증이 필요합니다.' })
  }
  try {
    const rows = await devicesService.listDevicesByUserId(req.user.id)
    return res.json(rows.map(toDeviceResponse))
  } catch (err) {
    console.error('[GET /api/devices]', err)
    return res.status(500).json({ code: 'SERVER_ERROR', message: err.message })
  }
}

export async function patchDevice(req, res) {
  if (!req.user?.id) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: '인증이 필요합니다.' })
  }
  try {
    const device = await devicesService.updateDevice(
      req.params.id,
      req.user.id,
      req.body || {}
    )
    if (!device) {
      return res.status(404).json({ code: 'NOT_FOUND', message: '디바이스를 찾을 수 없습니다.' })
    }
    return res.json(toDeviceResponse(device))
  } catch (err) {
    console.error('[PATCH /api/devices/:id]', err)
    return res.status(500).json({ code: 'SERVER_ERROR', message: err.message })
  }
}

export async function deleteDevice(req, res) {
  if (!req.user?.id) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: '인증이 필요합니다.' })
  }
  try {
    const ok = await devicesService.deleteDevice(req.params.id, req.user.id)
    if (!ok) {
      return res.status(404).json({ code: 'NOT_FOUND', message: '디바이스를 찾을 수 없습니다.' })
    }
    return res.status(204).send()
  } catch (err) {
    console.error('[DELETE /api/devices/:id]', err)
    return res.status(500).json({ code: 'SERVER_ERROR', message: err.message })
  }
}
