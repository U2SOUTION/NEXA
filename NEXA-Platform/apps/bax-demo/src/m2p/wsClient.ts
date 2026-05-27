/**
 * @file wsClient.ts
 * @role M2P v2 WebSocket ingest — 외부 Peripheral/NIXIE 패킷 수신 → useBaxStore 반영.
 *       p95 ≤50ms. Telemetry flood와 분리 (NEXA 채널 B ≠ M2P).
 * @ssot docs/NEXA OS/BAX_미학적_인터페이스_UX_아키텍처_v0.9.md §2.8 · §7
 */

import type { M2PPacketV2 } from './types'

export type M2PHandler = (packet: M2PPacketV2) => void

export function connectM2PWebSocket(_url: string, _onPacket: M2PHandler): () => void {
  return () => {}
}
