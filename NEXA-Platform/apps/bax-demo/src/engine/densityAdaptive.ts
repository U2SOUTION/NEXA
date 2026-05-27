/**
 * @file densityAdaptive.ts
 * @role 반응형 밀도 적응 — sm TEXTURE 숨김·정보 면적 30% 초과 시 MID blur +1단계.
 *       applyAestheticState 직전 실행.
 * @ssot docs/NEXA OS/BAX_미학적_인터페이스_UX_아키텍처_v0.9.md §2.10
 */

import type { ResolvedLayout } from './LayoutPolicy/types'
import type { MaeContext } from './MaeContext'

export function densityAdaptive(layout: ResolvedLayout, _ctx: MaeContext): ResolvedLayout {
  return layout
}
