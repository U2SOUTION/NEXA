/**
 * @file DefaultLayoutPolicy.ts
 * @role MVP 기본 LayoutPolicy — 2열 TEXTURE+ESSENTIAL · CRITICAL 최대 면적 · overflow 시 SingleColumnFallback.
 *       OVERLAY 미전달. 부록 D 의사코드 구현체.
 * @ssot docs/NEXA OS/BAX_미학적_인터페이스_UX_아키텍처_v0.9.md §2.3 · 부록 D
 */

import type { LayoutPolicy, ResolvedLayout } from './types'
import type { MaeContext } from '../MaeContext'

export class DefaultLayoutPolicy implements LayoutPolicy {
  resolve(_components: unknown[], _ctx: MaeContext): ResolvedLayout {
    return {
      gridTemplate: { columns: '1fr 1fr', rows: '1fr' },
      placements: [],
    }
  }
}
