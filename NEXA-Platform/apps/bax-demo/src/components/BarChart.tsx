/**
 * @file BarChart.tsx
 * @role CONTEXTUAL 부하 막대 그래프 — bar-load.
 */

import type { ComponentVisual } from '../types/component'
import { blockClass, blockHandlers, blockStyle } from '../canvas/blockRoot'
import { BlockBadges } from './BlockBadges'

interface Props {
  id: string
  visual: ComponentVisual
  values: number[]
  label?: string
  onFocus: (id: string) => void
}

export function BarChart({ id, visual, values, label = 'System Load', onFocus }: Props) {
  if (visual.hidden) return null

  const max = Math.max(...values, 1)

  return (
    <div
      className={blockClass(visual, 'bax-bars')}
      style={blockStyle(visual)}
      {...blockHandlers(id, onFocus)}
    >
      <BlockBadges visual={visual} />
      <div className="bax-bars__label">{label}</div>
      <div className="bax-bars__chart">
        {values.map((v, i) => (
          <div
            key={i}
            className="bax-bars__col"
            style={{ height: `${(v / max) * 100}%` }}
            title={`${v}%`}
          />
        ))}
      </div>
    </div>
  )
}
