/**
 * Branded ID 타입 — UserId, ProjectId, DeviceId 등 혼용 방지
 * [NEXA-PLATFORM-TS-01] §2.4
 *
 * - API·DB 경계에서 문자열 수신 후 toUserId 등 변환 함수로 한 번만 변환.
 * - as UserId 강제 단언 대신 Zod 기반 변환 함수 사용 권장.
 */
import { z } from 'zod'

const uuidSchema = z.string().uuid()

export type UserId = string & { readonly __brand: 'UserId' }
export const userIdSchema = uuidSchema.transform((s) => s as UserId)
export function toUserId(id: string): UserId {
  return userIdSchema.parse(id)
}
export function toUserIdSafe(id: string) {
  return userIdSchema.safeParse(id)
}

export type ProjectId = string & { readonly __brand: 'ProjectId' }
export const projectIdSchema = uuidSchema.transform((s) => s as ProjectId)
export function toProjectId(id: string): ProjectId {
  return projectIdSchema.parse(id)
}
export function toProjectIdSafe(id: string) {
  return projectIdSchema.safeParse(id)
}

export type DeviceId = string & { readonly __brand: 'DeviceId' }
export const deviceIdSchema = uuidSchema.transform((s) => s as DeviceId)
export function toDeviceId(id: string): DeviceId {
  return deviceIdSchema.parse(id)
}
export function toDeviceIdSafe(id: string) {
  return deviceIdSchema.safeParse(id)
}

export type ArchiveId = string & { readonly __brand: 'ArchiveId' }
export const archiveIdSchema = uuidSchema.transform((s) => s as ArchiveId)
export function toArchiveId(id: string): ArchiveId {
  return archiveIdSchema.parse(id)
}
export function toArchiveIdSafe(id: string) {
  return archiveIdSchema.safeParse(id)
}
