/**
 * UUID v7 기반 ID 생성
 *
 * - 목적: 전역 고유 ID, 엣지 디바이스 대량 파일 생성 시 서버 없이 사전 생성 가능. 멱등성(Idempotency) 보장으로 중복 저장 방지
 * - UUID v7: 48bit Unix timestamp 포함 → 시간순 정렬·B-tree 인덱스 효율적, 랜덤 UUID(v4) 대비 성능 유리
 *
 * - 엣지 디바이스(ESPHome 등): 동일한 UUID v7 형식으로 펌웨어 단에서 생성 권장. 플랫폼과 ID 호환 유지.
 *
 * @see RFC 9562 (UUID Version 7)
 * @see [NEXA-AI-09] AI 워크스페이스 웹서치 자원 전략
 */
import { v7 } from 'uuid'

/** files, projects, ai_channels 등 엔티티 ID 생성용. UUID v7 반환 (36자, 하이픈 포함) */
export function generateId(): string {
  return v7()
}
