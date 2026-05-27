/**
 * @file nixieSimulator.ts
 * @role NIXIE Agent 가상 시뮬 — M2P v2 포맷 WebSocket 송신 (R4). MVP 실물 HW 대체.
 * @ssot docs/NEXA OS/BAX_미학적_인터페이스_UX_아키텍처_v0.9.md §2.8
 */

import type { M2PPacketV2 } from './types'

export function createNixieSimulatorPacket(
  void_ratio_delta: number,
  focus_blur_scale: number,
): M2PPacketV2 {
  return {
    v: 2,
    source: 'nixie-agent',
    ts: Date.now(),
    void_ratio_delta,
    focus_blur_scale,
  }
}
