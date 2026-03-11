/**
 * 디바이스 API 컨트롤러 [NEXA-AUTH-01] §5.2
 */
import type { Request, Response } from 'express'
import { ApiErrorCode } from '@system/schemas/errors'
import type { DeviceResponse } from './device.types.js'
import * as devicesService from './devices.service.js'

function toDeviceResponse(row: Record<string, unknown> | null): DeviceResponse | null {
  if (!row) return null
  return {
    id: String(row.id ?? ''),
    user_id: String(row.user_id ?? ''),
    name: row.name != null ? String(row.name) : null,
    device_type: row.device_type != null ? String(row.device_type) : null,
    mac_address: row.mac_address != null ? String(row.mac_address) : null,
    last_seen: row.last_seen != null ? String(row.last_seen) : null,
    is_online: row.is_online != null ? Boolean(row.is_online) : null,
    is_active: row.is_active != null ? Boolean(row.is_active) : null,
    created_at: String(row.created_at ?? ''),
    role: row.role != null ? String(row.role) : undefined,
  }
}

export async function postDevice(req: Request, res: Response): Promise<Response> {
  if (!req.user?.id) {
    return res.status(401).json({ code: ApiErrorCode.UNAUTHORIZED, message: '인증이 필요합니다.' })
  }
  try {
    const payload = (req.body || {}) as { name?: string; device_type?: string; mac_address?: string }
    const result = await devicesService.createDevice(req.user.id, payload)
    return res.status(201).json({
      device: toDeviceResponse(result.device as Record<string, unknown>),
      device_token: result.device_token,
      message: 'device_token은 이번에만 노출됩니다. 안전하게 저장하세요.',
    })
  } catch (err) {
    console.error('[POST /api/devices]', err)
    return res.status(500).json({ code: ApiErrorCode.SERVER_ERROR, message: (err as Error).message })
  }
}

export async function getDevices(req: Request, res: Response): Promise<Response> {
  if (!req.user?.id) {
    return res.status(401).json({ code: ApiErrorCode.UNAUTHORIZED, message: '인증이 필요합니다.' })
  }
  try {
    const rows = await devicesService.listDevicesByUserId(req.user.id)
    return res.json(rows.map((row) => toDeviceResponse(row as Record<string, unknown>)))
  } catch (err) {
    console.error('[GET /api/devices]', err)
    return res.status(500).json({ code: ApiErrorCode.SERVER_ERROR, message: (err as Error).message })
  }
}

export async function patchDevice(req: Request, res: Response): Promise<Response> {
  if (!req.user?.id) {
    return res.status(401).json({ code: ApiErrorCode.UNAUTHORIZED, message: '인증이 필요합니다.' })
  }
  try {
    const device = await devicesService.updateDevice(
      req.params.id as string,
      req.user.id,
      (req.body || {}) as { name?: string; device_type?: string; is_active?: boolean }
    )
    if (!device) {
      return res.status(404).json({ code: ApiErrorCode.NOT_FOUND, message: '디바이스를 찾을 수 없습니다.' })
    }
    return res.json(toDeviceResponse(device as Record<string, unknown>))
  } catch (err) {
    console.error('[PATCH /api/devices/:id]', err)
    return res.status(500).json({ code: ApiErrorCode.SERVER_ERROR, message: (err as Error).message })
  }
}

export async function deleteDevice(req: Request, res: Response): Promise<Response> {
  if (!req.user?.id) {
    return res.status(401).json({ code: ApiErrorCode.UNAUTHORIZED, message: '인증이 필요합니다.' })
  }
  try {
    const ok = await devicesService.deleteDevice(req.params.id as string, req.user.id)
    if (!ok) {
      return res.status(404).json({ code: ApiErrorCode.NOT_FOUND, message: '디바이스를 찾을 수 없습니다.' })
    }
    return res.status(204).send()
  } catch (err) {
    console.error('[DELETE /api/devices/:id]', err)
    return res.status(500).json({ code: ApiErrorCode.SERVER_ERROR, message: (err as Error).message })
  }
}
