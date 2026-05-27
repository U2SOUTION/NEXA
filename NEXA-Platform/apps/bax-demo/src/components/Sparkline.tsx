/**
 * @file Sparkline.tsx
 * @role Comp D · OVERLAY CONTEXTUAL V1.
 */

import type { ComponentVisual } from '../types/component'

interface Props {
  history: number[]
  intensity: 0 | 1 | 2
  visual?: ComponentVisual
}

export function Sparkline({ history, intensity }: Props) {
  if (intensity === 0 || history.length < 2) return null

  const w = 280
  const h = 48
  const min = Math.min(...history) - 2
  const max = Math.max(...history) + 2
  const range = max - min || 1

  const points = history
    .map((v, i) => {
      const x = (i / (history.length - 1)) * w
      const y = h - ((v - min) / range) * h
      return `${x},${y}`
    })
    .join(' ')

  const stroke = intensity === 1 ? 'rgba(120,200,255,0.35)' : 'rgba(120,200,255,0.75)'
  const strokeWidth = intensity === 1 ? 1 : 1.5

  return (
    <svg className="bax-sparkline" data-bax-id="sparkline" viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
      <polyline fill="none" stroke={stroke} strokeWidth={strokeWidth} points={points} />
    </svg>
  )
}
