/**
 * @file GlyphLabel.tsx
 * @role TEXTURE 타이포 — glyph-north · glyph-east · tagline.
 */

import type { ComponentVisual } from '../types/component'

interface Props {
  id: string
  visual: ComponentVisual
  primary: string
  secondary?: string
  variant?: 'hero' | 'axis' | 'caption'
  embedded?: boolean
}

export function GlyphLabel({ visual, primary, secondary, variant = 'axis', embedded }: Props) {
  if (visual.hidden) return null

  return (
    <div
      className={`bax-glyph bax-glyph--${variant}`}
      style={{
        ...(embedded ? {} : { gridArea: visual.gridArea, zIndex: visual.zIndex }),
        opacity: visual.opacity,
        filter: visual.blurPx ? `blur(${visual.blurPx}px)` : undefined,
      }}
    >
      <span className="bax-glyph__primary">{primary}</span>
      {secondary && <span className="bax-glyph__secondary">{secondary}</span>}
    </div>
  )
}
