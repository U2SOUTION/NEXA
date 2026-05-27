/**
 * @file viewportScale.ts
 * @role viewport_band별 canvas_scale·blur_scale — ResizeObserver 연동.
 * @ssot docs/NEXA OS/BAX_미학적_인터페이스_UX_아키텍처_v0.9.md §2.10
 */

export const VIEWPORT_SCALE = {
  xl: { canvas_scale: 1.0, blur_scale: 1.0 },
  md: { canvas_scale: 0.95, blur_scale: 0.9 },
  sm: { canvas_scale: 0.88, blur_scale: 0.8 },
} as const

export function getViewportBand(width: number): 'xl' | 'md' | 'sm' {
  if (width >= 1280) return 'xl'
  if (width >= 768) return 'md'
  return 'sm'
}
