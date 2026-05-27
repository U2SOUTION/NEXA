/**
 * @file renderState.ts
 * @role MAE → React 렌더링 결과 DTO.
 */

import type { ComponentVisual } from '../types/component'

export interface MaeRenderState {
  gridTemplateColumns: string
  gridTemplateRows: string
  visuals: Record<string, ComponentVisual>
  void_ratio: number
  canvas_scale: number
  focus_blur_scale: number
  light_source_x: number
  light_source_y: number
  sparklineVisible: boolean
  asrOverride: boolean
  overflowFallback: boolean
}

export function createEmptyRenderState(): MaeRenderState {
  return {
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr',
    visuals: {},
    void_ratio: 52,
    canvas_scale: 1,
    focus_blur_scale: 0.7,
    light_source_x: 50,
    light_source_y: 30,
    sparklineVisible: true,
    asrOverride: false,
    overflowFallback: false,
  }
}
