/**
 * @file Frame.tsx
 * @role Comp B · OVERLAY TEXTURE FG IMMUTABLE (데모 전용).
 *       6px monospace 격자. Grid·G1·G2·G4 미참여. md opacity 50% · sm unmount는 MAE 담당.
 * @declaration priority=TEXTURE urgency=NONE depth=FG layer=OVERLAY
 * @ssot docs/NEXA OS/BAX_미학적_인터페이스_UX_아키텍처_v0.9.md §1.3.5
 */

export const FRAME_DECLARATION = {
  id: 'frame',
  priority: 'TEXTURE',
  urgency: 'NONE',
  depth: 'FG',
  mutability: 'IMMUTABLE',
  layer: 'OVERLAY',
} as const

export function Frame() {
  return null
}
