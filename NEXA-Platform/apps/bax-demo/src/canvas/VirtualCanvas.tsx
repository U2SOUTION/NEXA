/**
 * @file VirtualCanvas.tsx
 * @role 단일 bax-canvas — void padding + grid + BLOCK/OVERLAY 직접 렌더.
 */

import { useEffect, useRef, useState } from 'react'
import { Anchor } from '../components/Anchor'
import { GlyphLabel } from '../components/GlyphLabel'
import { Sentinel } from '../components/Sentinel'
import { GaugeCard } from '../components/GaugeCard'
import { BarChart } from '../components/BarChart'
import { RingStatus } from '../components/RingStatus'
import { SparklineFloat } from '../components/SparklineFloat'
import { useBaxStore } from '../store/useBaxStore'
import { useAestheticSettingsStore } from '../settings/useAestheticSettingsStore'

function voidPadding(voidRatio: number): string {
  const pad = (100 - voidRatio) / 2
  return `${pad}%`
}

export function VirtualCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [tempHistory, setTempHistory] = useState<number[]>([72, 73, 71, 72])

  const render = useBaxStore((s) => s.render)
  const metrics = useBaxStore((s) => s.metrics)
  const alarmState = useBaxStore((s) => s.alarmState)
  const components = useBaxStore((s) => s.components)
  const updateViewport = useBaxStore((s) => s.updateViewport)
  const setMainFocus = useBaxStore((s) => s.setMainFocus)
  const lightX = useBaxStore((s) => s.light_source_x)
  const lightY = useBaxStore((s) => s.light_source_y)

  const sparklineIntensity = useAestheticSettingsStore((s) => s.vibrationProfile.sparklineIntensity)

  const v = render.visuals
  const byId = Object.fromEntries(components.map((c) => [c.id, c]))
  const floatVisual = v['sparkline-float']

  useEffect(() => {
    setTempHistory((h) => [...h.slice(-24), metrics.temp])
  }, [metrics.temp])

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      updateViewport(entry.contentRect.width)
    })
    ro.observe(el)
    updateViewport(el.clientWidth)
    return () => ro.disconnect()
  }, [updateViewport])

  return (
    <div
      ref={canvasRef}
      className="bax-canvas"
      style={{
        padding: voidPadding(render.void_ratio),
        display: 'grid',
        gridTemplateColumns: render.gridTemplateColumns,
        gridTemplateRows: render.gridTemplateRows,
        minHeight: 'min(78vh, 640px)',
        transform: `scale(${render.canvas_scale})`,
        transition:
          'padding 300ms ease-out, transform 300ms ease-out, grid-template 300ms ease-out',
        ['--bax-void-ratio' as string]: render.void_ratio,
        ['--bax-focus-blur' as string]: render.focus_blur_scale,
      }}
    >
      {v.anchor && (
        <Anchor id="anchor" visual={v.anchor} lightX={lightX} lightY={lightY} onFocus={setMainFocus} />
      )}
      {v['glyph-north'] && (
        <GlyphLabel
          id="glyph-north"
          visual={v['glyph-north']}
          primary="NORTH"
          secondary="Telemetry Axis"
          variant="axis"
          onFocus={setMainFocus}
        />
      )}
      {v['glyph-east'] && (
        <GlyphLabel id="glyph-east" visual={v['glyph-east']} primary="EAST" variant="caption" onFocus={setMainFocus} />
      )}
      {v.tagline && (
        <GlyphLabel
          id="tagline"
          visual={v.tagline}
          primary="Void · Depth · Breath"
          secondary="MAE Simulation Board"
          variant="caption"
          onFocus={setMainFocus}
        />
      )}
      {v.sentinel && byId.sentinel && (
        <Sentinel
          id="sentinel"
          visual={v.sentinel}
          temp={metrics.temp}
          urgency={byId.sentinel.urgency}
          alarmLevel={alarmState.level}
          sparklineVisible={render.sparklineVisible}
          sparklineIntensity={sparklineIntensity}
          history={tempHistory}
          onFocus={setMainFocus}
        />
      )}
      {v['gauge-humidity'] && byId['gauge-humidity'] && (
        <GaugeCard
          id="gauge-humidity"
          visual={v['gauge-humidity']}
          label="Humidity"
          value={metrics.humidity}
          unit="%"
          max={100}
          urgency={byId['gauge-humidity'].urgency}
          accent="#5ec4ff"
          onFocus={setMainFocus}
        />
      )}
      {v['gauge-pressure'] && (
        <GaugeCard
          id="gauge-pressure"
          visual={v['gauge-pressure']}
          label="Pressure"
          value={metrics.pressure}
          unit="hPa"
          max={1040}
          urgency={byId['gauge-pressure']?.urgency}
          accent="#9b8cff"
          onFocus={setMainFocus}
        />
      )}
      {v['bar-load'] && (
        <BarChart id="bar-load" visual={v['bar-load']} values={metrics.load} onFocus={setMainFocus} />
      )}
      {v['ring-status'] && (
        <RingStatus id="ring-status" visual={v['ring-status']} segments={metrics.ringSegments} onFocus={setMainFocus} />
      )}
      {floatVisual && (
        <SparklineFloat visual={floatVisual} values={metrics.load} intensity={sparklineIntensity} />
      )}
    </div>
  )
}
