/**
 * @file Sentinel.tsx
 * @role Comp C · BLOCK ESSENTIAL.
 */

import type { ComponentVisual, ComponentUrgency } from '../types/component'
import { blockClass, blockHandlers, blockStyle } from '../canvas/blockRoot'
import { BlockBadges } from './BlockBadges'
import { Sparkline } from './Sparkline'

interface Props {
  id: string
  visual: ComponentVisual
  temp: number
  urgency: ComponentUrgency
  alarmLevel: string
  sparklineVisible: boolean
  sparklineIntensity: 0 | 1 | 2
  history: number[]
  onFocus: (id: string) => void
}

export function Sentinel({
  id,
  visual,
  temp,
  urgency,
  alarmLevel,
  sparklineVisible,
  sparklineIntensity,
  history,
  onFocus,
}: Props) {
  if (visual.hidden) return null

  const isCritical = urgency === 'CRITICAL' || alarmLevel === 'CRITICAL'

  return (
    <div
      className={blockClass(visual, `bax-sentinel${isCritical ? ' bax-sentinel--critical' : ''}`)}
      style={blockStyle(visual, { minWidth: 300, minHeight: 120 })}
      {...blockHandlers(id, onFocus)}
    >
      <BlockBadges visual={visual} />
      <div className="bax-sentinel__label">Sentinel · ESSENTIAL</div>
      <div className="bax-sentinel__temp">{temp}°C</div>
      <div className="bax-sentinel__meta">
        urgency: <strong>{urgency}</strong> · alarm: {alarmLevel}
      </div>
      {sparklineVisible && (
        <Sparkline history={history} intensity={sparklineIntensity} visual={visual} />
      )}
    </div>
  )
}
