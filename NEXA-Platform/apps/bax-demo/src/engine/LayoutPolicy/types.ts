/**
 * @file types.ts
 * @role LayoutPolicy 공유 타입 — BLOCK 컴포넌트 배치 결과 스키마.
 * @internal LayoutPolicy 서브모듈
 */

import type { MaeContext } from '../MaeContext'

export interface GridTemplate {
  columns: string
  rows: string
  areas?: string
}

export interface ComponentPlacement {
  componentId: string
  gridArea: string
  minWidth?: number
}

export interface ResolvedLayout {
  gridTemplate: GridTemplate
  placements: ComponentPlacement[]
  overflowFallback?: boolean
}

export interface LayoutPolicy {
  resolve(components: unknown[], ctx: MaeContext): ResolvedLayout
}
