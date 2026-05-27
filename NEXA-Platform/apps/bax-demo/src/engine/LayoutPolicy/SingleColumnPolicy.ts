/**
 * @file SingleColumnPolicy.ts
 * @role sm·Grid overflow 전용 단일열 LayoutPolicy (R3).
 *       minWidth 합 > 가용 너비 시 DefaultLayoutPolicy에서 위임. TEXTURE sm 숨김.
 * @ssot docs/NEXA OS/BAX_미학적_인터페이스_UX_아키텍처_v0.9.md §2.3 · §2.10
 */

import type { LayoutPolicy, ResolvedLayout } from './types'
import type { MaeContext } from '../MaeContext'

export class SingleColumnPolicy implements LayoutPolicy {
  resolve(_components: unknown[], _ctx: MaeContext): ResolvedLayout {
    return {
      gridTemplate: { columns: '1fr', rows: 'auto' },
      placements: [],
      overflowFallback: true,
    }
  }
}
