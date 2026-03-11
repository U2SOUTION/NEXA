/**
 * 디바이스 도메인 타입 [NEXA-PLATFORM-TS-01] §5.2
 */

/** POST /api/devices body */
export interface CreateDevicePayload {
  name?: string | null
  device_type?: string | null
  mac_address?: string | null
}

/** PATCH /api/devices/:id body */
export interface UpdateDevicePayload {
  name?: string | null
  device_type?: string | null
  is_active?: boolean
}

/** 디바이스 API 응답 (id는 문자열로 직렬화) */
export interface DeviceResponse {
  id: string
  user_id: string
  name: string | null
  device_type: string | null
  mac_address: string | null
  last_seen: string | null
  is_online: boolean | null
  is_active: boolean | null
  created_at: string
  role?: string
}

/** updateDeviceLastSeen 페이로드 */
export interface UpdateDeviceLastSeenPayload {
  mac_address?: string | null
  ip_address?: string | null
}
