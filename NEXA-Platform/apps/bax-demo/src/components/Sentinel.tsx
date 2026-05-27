/**
 * @file Sentinel.tsx
 * @role Comp C · BLOCK ESSENTIAL FG MUTABLE minWidth=300.
 *       온도·상태 카드. urgency는 AlarmState에서만 수신. Safe-Zone G2 대상.
 * @declaration priority=ESSENTIAL urgency=NORMAL depth=FG layer=BLOCK minWidth=300
 * @ssot docs/NEXA OS/BAX_미학적_인터페이스_UX_아키텍처_v0.9.md §1.3.2
 */

export const SENTINEL_DECLARATION = {
  id: 'sentinel',
  priority: 'ESSENTIAL',
  urgency: 'NORMAL',
  depth: 'FG',
  mutability: 'MUTABLE',
  layer: 'BLOCK',
  minWidth: 300,
} as const

export function Sentinel() {
  return null
}
