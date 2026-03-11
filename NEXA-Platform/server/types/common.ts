/**
 * 서버 공통 타입 [NEXA-PLATFORM-TS-01] §5.2
 * UUID, Timestamp, AuthUser, Device·Project 응답용 인터페이스.
 * Branded ID는 @system/types/ids 사용.
 */
import type { UserId, ProjectId, DeviceId } from '@system/types/ids'

/** UUID 문자열 (DB id 컬럼 등) */
export type UUID = string

/** ISO 날짜 문자열 또는 타임스탬프 (created_at, updated_at) */
export type Timestamp = string

/** 인증된 사용자 (GET /api/auth/me, JWT payload·req.user) */
export interface AuthUser {
  id: UserId
  email: string
  display_name: string
  role: string
  tier: string
  allowed_domains: string[] | null
  created_at: Timestamp
  updated_at: Timestamp
}

/** device_registry 행 + device_members.role (목록/상세 응답) */
export interface DeviceRow {
  id: DeviceId
  user_id: UserId
  name: string | null
  device_type: string | null
  mac_address: string | null
  last_seen?: Timestamp | null
  is_online?: boolean
  is_active?: boolean
  created_at: Timestamp
  role?: string
  metadata?: unknown
}

/** projects 테이블 행 */
export interface ProjectRow {
  id: ProjectId
  user_id: UserId
  name: string
  description: string | null
  created_at: Timestamp
  updated_at: Timestamp
}
