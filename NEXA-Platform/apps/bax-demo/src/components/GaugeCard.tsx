/**
 * @file GaugeCard.tsx
 * @role ESSENTIAL/CONTEXTUAL 게이지 카드 — humidity · pressure.
 */

import type { ComponentVisual, ComponentUrgency } from '../types/component'
import { blockClass, blockHandlers, blockStyle } from '../canvas/blockRoot'
import { BlockBadges } from './BlockBadges'

interface Props {
  id: string
  visual: ComponentVisual
  label: string
  value: number
  unit: string
  max: number
  urgency?: ComponentUrgency
  accent?: string
  onFocus: (id: string) => void
}

export function GaugeCard({
  id,
  visual,
  label,
  value,
  unit,
  max,
  urgency = 'NORMAL',
  accent = 'var(--bax-accent)',
  onFocus,
}: Props) {
  if (visual.hidden) return null

  const pct = Math.min(100, (value / max) * 100)
  const isCritical = urgency === 'CRITICAL'

  return (
    <div
      className={blockClass(visual, `bax-gauge${isCritical ? ' bax-gauge--critical' : ''}`)}
      style={blockStyle(visual, { minWidth: id === 'gauge-humidity' ? 180 : undefined })}
      {...blockHandlers(id, onFocus)}
    >
      <BlockBadges visual={visual} />
      <span className="bax-gauge__label">{label}</span>
      <span className="bax-gauge__urgency">{urgency}</span>
      <div className="bax-gauge__value">
        {value}
        <small>{unit}</small>
      </div>
      <div className="bax-gauge__track">
        <div className="bax-gauge__fill" style={{ width: `${pct}%`, background: accent }} />
      </div>
    </div>
  )
}
