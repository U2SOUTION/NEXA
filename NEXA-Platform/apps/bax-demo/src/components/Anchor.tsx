/**
 * @file Anchor.tsx
 * @role Comp A · BLOCK TEXTURE BG IMMUTABLE.
 *       Giant 타이포·light_source shadow만 렌더. Grid/blur/z-index 하드코딩 금지.
 * @declaration priority=TEXTURE urgency=NONE depth=BG layer=BLOCK
 * @ssot docs/NEXA OS/BAX_미학적_인터페이스_UX_아키텍처_v0.9.md §1.3.2
 */

export const ANCHOR_DECLARATION = {
  id: 'anchor',
  priority: 'TEXTURE',
  urgency: 'NONE',
  depth: 'BG',
  mutability: 'IMMUTABLE',
  layer: 'BLOCK',
} as const

export function Anchor() {
  return null
}
