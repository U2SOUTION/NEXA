/**
 * @file Anchor.tsx
 * @role Comp A · BLOCK TEXTURE BG.
 */

import type { ComponentVisual } from '../types/component'
import { blockClass, blockHandlers, blockStyle } from '../canvas/blockRoot'
import { BlockBadges } from './BlockBadges'

interface Props {
  id: string
  visual: ComponentVisual
  lightX: number
  lightY: number
  onFocus: (id: string) => void
}

export function Anchor({ id, visual, lightX, lightY, onFocus }: Props) {
  if (visual.hidden) return null

  const angle = Math.atan2(lightY - 50, lightX - 50) * (180 / Math.PI)
  const shadowX = Math.cos((angle * Math.PI) / 180) * 24
  const shadowY = Math.sin((angle * Math.PI) / 180) * 24

  return (
    <div
      className={blockClass(visual, 'bax-anchor')}
      style={blockStyle(visual, {
        textShadow: `${shadowX}px ${shadowY}px 48px rgba(120, 200, 255, 0.15)`,
      })}
      {...blockHandlers(id, onFocus)}
    >
      <BlockBadges visual={visual} />
      <span className="bax-anchor__word">BAX</span>
      <span className="bax-anchor__sub">Breathing AI Experience</span>
    </div>
  )
}
