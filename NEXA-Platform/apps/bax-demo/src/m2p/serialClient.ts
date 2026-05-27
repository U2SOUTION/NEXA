/**
 * @file serialClient.ts
 * @role Web Serial → M2P v2 JSON line parse — Arduino pot 등 HW 의지 입력 (선택).
 * @ssot docs/NEXA OS/BAX_미학적_인터페이스_UX_아키텍처_v0.9.md §6
 */

import type { M2PPacketV2 } from './types'

export function parseM2PSerialLine(line: string): M2PPacketV2 | null {
  try {
    const parsed = JSON.parse(line) as M2PPacketV2
    return parsed.v === 2 ? parsed : null
  } catch {
    return null
  }
}
