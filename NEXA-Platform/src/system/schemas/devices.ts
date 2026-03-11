/**
 * 디바이스 API 스키마 — 서버·프론트·통합 테스트 공유
 * [NEXA-PLATFORM-TS-01] §2.1, §7.2
 */
import { z } from 'zod'

/** POST /api/devices body */
export const createDeviceSchema = z.object({
  name: z.string().max(255).nullable().optional().default(null),
  device_type: z.string().max(100).nullable().optional().default(null),
  mac_address: z.string().max(17).nullable().optional().default(null),
})

/** PATCH /api/devices/:id body */
export const updateDeviceSchema = z.object({
  name: z.string().max(255).nullable().optional(),
  device_type: z.string().max(100).nullable().optional(),
  is_active: z.boolean().optional(),
})

/** 단일 디바이스 응답 */
export const deviceResponseSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string().nullable(),
  device_type: z.string().nullable(),
  mac_address: z.string().nullable(),
  last_seen: z.string().nullable(),
  is_online: z.boolean().nullable(),
  is_active: z.boolean().nullable(),
  created_at: z.string(),
  role: z.string().optional(),
})

/** GET /api/devices 목록 응답 (배열) */
export const devicesResponseSchema = z.array(deviceResponseSchema)

/**
 * 디바이스 수신 페이로드 — 버전별 검증 [NEXA-PLATFORM-TS-01] §7.2
 * 텔레메트리·등록 요청 등 엣지 디바이스 → 서버 전송 시 version으로 구분
 */
const devicePayloadV1 = z.object({
  version: z.literal('1'),
  sensor_id: z.string(),
  value: z.union([z.number(), z.string(), z.boolean()]),
})
const devicePayloadV2 = z.object({
  version: z.literal('2'),
  sensorId: z.string(),
  value: z.union([z.number(), z.string(), z.boolean()]),
  unit: z.string().optional(),
})
export const devicePayloadSchema = z.discriminatedUnion('version', [
  devicePayloadV1,
  devicePayloadV2,
])
export type DevicePayload = z.infer<typeof devicePayloadSchema>

export type CreateDeviceInput = z.infer<typeof createDeviceSchema>
export type UpdateDeviceInput = z.infer<typeof updateDeviceSchema>
export type DeviceResponse = z.infer<typeof deviceResponseSchema>
