/**
 * @file BaxBlockRenderer.tsx
 * @role BLOCK 컴포넌트 — BaxFocusShell + 클릭 포커스.
 */

import type { ComponentDeclaration } from '../types/component'
import type { MaeRenderState } from '../engine/renderState'
import type { SimMetrics } from '../store/simMetrics'
import { BaxFocusShell } from './BaxFocusShell'
import { Anchor } from './Anchor'
import { GlyphLabel } from './GlyphLabel'
import { Sentinel } from './Sentinel'
import { GaugeCard } from './GaugeCard'
import { BarChart } from './BarChart'
import { RingStatus } from './RingStatus'

interface Props {
  components: ComponentDeclaration[]
  render: MaeRenderState
  metrics: SimMetrics
  alarmLevel: string
  sparklineVisible: boolean
  sparklineIntensity: 0 | 1 | 2
  tempHistory: number[]
  lightX: number
  lightY: number
  onFocus: (id: string) => void
}

export function BaxBlockRenderer({
  components,
  render,
  metrics,
  alarmLevel,
  sparklineVisible,
  sparklineIntensity,
  tempHistory,
  lightX,
  lightY,
  onFocus,
}: Props) {
  const byId = Object.fromEntries(components.map((c) => [c.id, c]))
  const v = render.visuals

  return (
    <>
      {v.anchor && (
        <BaxFocusShell id="anchor" visual={v.anchor} onFocus={onFocus}>
          <Anchor visual={v.anchor} lightX={lightX} lightY={lightY} embedded />
        </BaxFocusShell>
      )}
      {v['glyph-north'] && (
        <BaxFocusShell id="glyph-north" visual={v['glyph-north']} onFocus={onFocus}>
          <GlyphLabel id="glyph-north" visual={v['glyph-north']} primary="NORTH" secondary="Telemetry Axis" variant="axis" embedded />
        </BaxFocusShell>
      )}
      {v['glyph-east'] && (
        <BaxFocusShell id="glyph-east" visual={v['glyph-east']} onFocus={onFocus}>
          <GlyphLabel id="glyph-east" visual={v['glyph-east']} primary="EAST" variant="caption" embedded />
        </BaxFocusShell>
      )}
      {v.tagline && (
        <BaxFocusShell id="tagline" visual={v.tagline} onFocus={onFocus}>
          <GlyphLabel id="tagline" visual={v.tagline} primary="Void · Depth · Breath" secondary="MAE Simulation Board" variant="caption" embedded />
        </BaxFocusShell>
      )}
      {v.sentinel && byId.sentinel && (
        <BaxFocusShell id="sentinel" visual={v.sentinel} onFocus={onFocus}>
          <Sentinel
            visual={v.sentinel}
            temp={metrics.temp}
            urgency={byId.sentinel.urgency}
            alarmLevel={alarmLevel}
            sparklineVisible={sparklineVisible}
            sparklineIntensity={sparklineIntensity}
            history={tempHistory}
            embedded
          />
        </BaxFocusShell>
      )}
      {v['gauge-humidity'] && byId['gauge-humidity'] && (
        <BaxFocusShell id="gauge-humidity" visual={v['gauge-humidity']} onFocus={onFocus}>
          <GaugeCard
            id="gauge-humidity"
            visual={v['gauge-humidity']}
            label="Humidity"
            value={metrics.humidity}
            unit="%"
            max={100}
            urgency={byId['gauge-humidity'].urgency}
            accent="#5ec4ff"
            embedded
          />
        </BaxFocusShell>
      )}
      {v['gauge-pressure'] && (
        <BaxFocusShell id="gauge-pressure" visual={v['gauge-pressure']} onFocus={onFocus}>
          <GaugeCard
            id="gauge-pressure"
            visual={v['gauge-pressure']}
            label="Pressure"
            value={metrics.pressure}
            unit="hPa"
            max={1040}
            urgency={byId['gauge-pressure']?.urgency}
            accent="#9b8cff"
            embedded
          />
        </BaxFocusShell>
      )}
      {v['bar-load'] && (
        <BaxFocusShell id="bar-load" visual={v['bar-load']} onFocus={onFocus}>
          <BarChart id="bar-load" visual={v['bar-load']} values={metrics.load} embedded />
        </BaxFocusShell>
      )}
      {v['ring-status'] && (
        <BaxFocusShell id="ring-status" visual={v['ring-status']} onFocus={onFocus}>
          <RingStatus id="ring-status" visual={v['ring-status']} segments={metrics.ringSegments} embedded />
        </BaxFocusShell>
      )}
    </>
  )
}
