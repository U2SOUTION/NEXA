/**
 * UUID v7 생성 유틸리티
 *
 * - NEXA 표준: UUID v7 (타임스탬프 포함 → 시간순 정렬·B-tree 인덱스 효율)
 * - gen_random_uuid()(Postgres v4) 사용 금지. Postgres 17 미만에서는 pg_uuidv7 확장 또는
 *   애플리케이션 레벨 생성 선택 가능.
 *
 * - **결정**: 애플리케이션 레벨(Node.js) 생성 — Postgres 버전·확장 의존 없음. INSERT 시
 *   id 컬럼에 명시적으로 주입.
 *
 * @see [NEXA-MIGRATE-01] §4.1
 * @see [NEXA-AUTH-01], [NEXA-AI-09]
 */

import { v7 } from 'uuid'

/**
 * UUID v7 생성. users, device_registry 등 PK용.
 * @returns {string} 36자 UUID (하이픈 포함, 예: '018e1234-5678-7000-8000-000000000000')
 */
export function generateUuidV7(): string {
  return (v7 as () => string)()
}
