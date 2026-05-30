/**
 * @file RingStatus.tsx
 * @role CONTEXTUAL 링 세그먼트 상태 — ring-status.
 */

import type { ComponentVisual } from '../types/component'
import { blockClass, blockHandlers, blockStyle } from '../canvas/blockRoot'
import { BlockBadges } from './BlockBadges'

interface Props {
  id: string
  visual: ComponentVisual
  segments: number[]
  onFocus: (id: string) => void
}

export function RingStatus({ id, visual, segments, onFocus }: Props) {
  if (visual.hidden) return null

  const size = 120
  const stroke = 10
  const r = (size - stroke) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r
  const gap = 0.04
  const segLen = (1 - gap * segments.length) / segments.length

  let offset = 0
  const arcs = segments.map((fill, i) => {
    const dash = circumference * segLen
    const dashOffset = -offset * circumference
    offset += segLen + gap
    const color = `hsl(${180 + i * 40}, 70%, ${45 + fill * 25}%)`
    return (
      <circle
        key={i}
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={`${dash * fill} ${circumference - dash * fill}`}
        strokeDashoffset={dashOffset}
        transform={`rotate(-90 ${cx} ${cy})`}
        opacity={0.85}
      />
    )
  })

  return (
    <div
      className={blockClass(visual, 'bax-ring')}
      style={blockStyle(visual)}
      {...blockHandlers(id, onFocus)}
    >
      <BlockBadges visual={visual} />
      <div className="bax-ring__label">Node Health</div>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bax-border)" strokeWidth={stroke} />
        {arcs}
      </svg>
    </div>
  )
}
