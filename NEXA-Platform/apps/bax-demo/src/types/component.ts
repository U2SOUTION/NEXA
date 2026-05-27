/**
 * @file component.ts
 * @role BAX 컴포넌트 의미 속성 공유 타입.
 */

export type ComponentPriority = 'ESSENTIAL' | 'CONTEXTUAL' | 'TEXTURE'
export type ComponentUrgency = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'NONE'
export type ComponentDepth = 'FG' | 'MID' | 'BG'
export type ComponentLayer = 'BLOCK' | 'OVERLAY'

export interface ComponentDeclaration {
  id: string
  priority: ComponentPriority
  urgency: ComponentUrgency
  depth: ComponentDepth
  mutability: 'IMMUTABLE' | 'MUTABLE'
  layer: ComponentLayer
  minWidth?: number
}

export interface ComponentVisual {
  blurPx: number
  opacity: number
  zIndex: number
  gridArea?: string
  hidden?: boolean
  isMainFocus?: boolean
  isAlarmTarget?: boolean
}
