/**
 * @file registry.ts
 * @role MVP ComponentDeclaration registry — MAE에 BLOCK/OVERLAY 4종 등록 SSOT.
 * @ssot docs/NEXA OS/BAX_미학적_인터페이스_UX_아키텍처_v0.9.md §1.3.2
 */

import { ANCHOR_DECLARATION } from './Anchor'
import { FRAME_DECLARATION } from './Frame'
import { SENTINEL_DECLARATION } from './Sentinel'
import { SPARKLINE_DECLARATION } from './Sparkline'

export const MVP_COMPONENT_DECLARATIONS = [
  ANCHOR_DECLARATION,
  FRAME_DECLARATION,
  SENTINEL_DECLARATION,
  SPARKLINE_DECLARATION,
] as const

export type BaxComponentId = (typeof MVP_COMPONENT_DECLARATIONS)[number]['id']
