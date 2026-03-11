/**
 * 디바이스·센서 공통 타입 — IoT 경계 (서버·프론트·엣지 공유)
 * 뼈대만 정의. 상세 필드는 도메인·엣지 연동 시 Zod 스키마로 보강.
 *
 * @see docs/JS_TS_전환_계획.md (Phase 0 공통 타입 뼈대)
 * Device — GET/POST /api/devices 응답 (서버·프론트 공유)
 * DeviceStatus — deviceId, status(online/offline/error/maintenance), lastSeenAt, metadata
 * SensorData — sensorId, value, unit, timestamp, deviceId, metadata
 */

/** 디바이스 API 응답 (GET/POST /api/devices) — 서버·프론트 공유 */
export interface Device {
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

/** 디바이스 상태 (엣지·서버·프론트 공통) */
export interface DeviceStatus {
  deviceId: string
  status: 'online' | 'offline' | 'error' | 'maintenance'
  lastSeenAt?: string
  metadata?: Record<string, unknown>
}

/** 센서 데이터 (엣지 → 서버 → 프론트) */
export interface SensorData {
  sensorId: string
  value: number | string | boolean
  unit?: string
  timestamp: string
  deviceId?: string
  metadata?: Record<string, unknown>
}
