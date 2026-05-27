/**
 * @file Anchor.tsx
 * @role Comp A · BLOCK TEXTURE BG.
 */

import type { ComponentVisual } from '../types/component'

interface Props {
  visual: ComponentVisual
  lightX: number
  lightY: number
  embedded?: boolean
}

export function Anchor({ visual, lightX, lightY, embedded }: Props) {
  if (visual.hidden) return null

  const angle = Math.atan2(lightY - 50, lightX - 50) * (180 / Math.PI)
  const shadowX = Math.cos((angle * Math.PI) / 180) * 24
  const shadowY = Math.sin((angle * Math.PI) / 180) * 24

  return (
    <div
      className="bax-anchor"
      style={{
        ...(embedded ? {} : { gridArea: visual.gridArea, zIndex: visual.zIndex }),
        opacity: visual.opacity,
        filter: visual.blurPx ? `blur(${visual.blurPx}px)` : undefined,
        textShadow: `${shadowX}px ${shadowY}px 48px rgba(120, 200, 255, 0.15)`,
      }}
    >
      <span className="bax-anchor__word">BAX</span>
      <span className="bax-anchor__sub">Breathing AI Experience</span>
    </div>
  )
}
