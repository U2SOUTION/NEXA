/**
 * @file Sparkline.tsx
 * @role Comp D · OVERLAY CONTEXTUAL FG MUTABLE (V1 진동).
 *       Sentinel DOM 내부 하단 합성. G5 Circuit Open 시 즉시 unmount. G1·G4 제외.
 * @declaration priority=CONTEXTUAL urgency=NORMAL depth=FG layer=OVERLAY
 * @ssot docs/NEXA OS/BAX_미학적_인터페이스_UX_아키텍처_v0.9.md §3.2
 */

export const SPARKLINE_DECLARATION = {
  id: 'sparkline',
  priority: 'CONTEXTUAL',
  urgency: 'NORMAL',
  depth: 'FG',
  mutability: 'MUTABLE',
  layer: 'OVERLAY',
} as const

export function Sparkline() {
  return null
}
