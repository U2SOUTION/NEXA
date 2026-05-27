/**
 * @file layoutOccupancy.ts
 * @role G4 Layout 점유 — BLOCK 동일 셀 z-index·Adjacent Spillover 1/tick. OVERLAY 제외.
 * @guardrail G4
 * @ssot docs/NEXA OS/BAX_미학적_인터페이스_UX_아키텍처_v0.9.md §2.12
 */

import type { ResolvedLayout } from './LayoutPolicy/types'

export function resolveOccupancyConflicts(layout: ResolvedLayout): ResolvedLayout {
  return layout
}
