/**
 * @file SparklineFloat.tsx
 * @role OVERLAY CONTEXTUAL — 전역 부동 스파크라인 (load 추세).
 */

import type { ComponentVisual } from '../types/component'

interface Props {
  visual: ComponentVisual
  values: number[]
  intensity: 0 | 1 | 2
}

export function SparklineFloat({ visual, values, intensity }: Props) {
  if (visual.hidden || intensity === 0 || values.length < 2) return null

  const w = 200
  const h = 40
  const min = Math.min(...values) - 2
  const max = Math.max(...values) + 2
  const range = max - min || 1
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w
      const y = h - ((v - min) / range) * h
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className="bax-sparkline-float" data-bax-id="sparkline-float" style={{ zIndex: visual.zIndex }}>
      <span className="bax-sparkline-float__tag">LOAD TREND</span>
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
        <polyline
          fill="none"
          stroke={intensity === 1 ? 'rgba(120,200,255,0.4)' : 'rgba(120,200,255,0.8)'}
          strokeWidth={intensity === 1 ? 1 : 1.5}
          points={points}
        />
      </svg>
    </div>
  )
}
