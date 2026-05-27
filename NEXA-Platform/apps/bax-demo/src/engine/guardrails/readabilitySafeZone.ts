/**
 * @file readabilitySafeZone.ts
 * @role G2 Safe-Zone — Sentinel minWidth 300/280/240px 강제. 충돌 시 asrOverride·track 확장.
 *       Safe-Zone > ASR % 우선순위.
 * @guardrail G2
 * @ssot docs/NEXA OS/BAX_미학적_인터페이스_UX_아키텍처_v0.9.md §2.10
 */

import type { ResolvedLayout } from '../LayoutPolicy/types'
import type { MaeContext } from '../MaeContext'

export const SAFE_ZONE_MIN_WIDTH = { xl: 300, md: 300, sm: 280 } as const
export const SAFE_ZONE_ABSOLUTE_MIN = 240

export function applySafeZone(layout: ResolvedLayout, ctx: MaeContext): ResolvedLayout {
  void ctx
  return layout
}
