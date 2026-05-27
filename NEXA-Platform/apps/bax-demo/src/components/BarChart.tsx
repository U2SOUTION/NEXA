/**
 * @file BarChart.tsx
 * @role CONTEXTUAL 부하 막대 그래프 — bar-load.
 */

import type { ComponentVisual } from '../types/component'

interface Props {
  id: string
  visual: ComponentVisual
  values: number[]
  label?: string
  embedded?: boolean
}

export function BarChart({ visual, values, label = 'System Load', embedded }: Props) {
  if (visual.hidden) return null

  const max = Math.max(...values, 1)

  return (
    <div
      className="bax-bars"
      style={{
        ...(embedded ? {} : { gridArea: visual.gridArea, zIndex: visual.zIndex }),
        opacity: visual.opacity,
        filter: visual.blurPx ? `blur(${visual.blurPx}px)` : undefined,
      }}
    >
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
