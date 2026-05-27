/**
 * @file types.ts
 * @role LayoutPolicy 공유 타입.
 */

import type { ComponentDeclaration } from '../../types/component'
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
  resolve(components: ComponentDeclaration[], ctx: MaeContext): ResolvedLayout
}
