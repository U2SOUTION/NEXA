/**
 * @file Sentinel.tsx
 * @role Comp C · BLOCK ESSENTIAL.
 */

import type { ComponentVisual, ComponentUrgency } from '../types/component'
import { Sparkline } from './Sparkline'

interface Props {
  visual: ComponentVisual
  temp: number
  urgency: ComponentUrgency
  alarmLevel: string
  sparklineVisible: boolean
  sparklineIntensity: 0 | 1 | 2
  history: number[]
  embedded?: boolean
}

export function Sentinel({
  visual,
  temp,
  urgency,
  alarmLevel,
  sparklineVisible,
  sparklineIntensity,
  history,
  embedded,
}: Props) {
  if (visual.hidden) return null

  const isCritical = urgency === 'CRITICAL' || alarmLevel === 'CRITICAL'

  return (
    <div
      className={`bax-sentinel ${isCritical ? 'bax-sentinel--critical' : ''}`}
      style={{
        ...(embedded ? {} : { gridArea: visual.gridArea, zIndex: visual.zIndex }),
        opacity: visual.opacity,
        minWidth: 300,
        minHeight: 120,
      }}
    >
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
