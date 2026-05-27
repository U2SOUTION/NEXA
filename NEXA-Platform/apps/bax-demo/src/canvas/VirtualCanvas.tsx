/**
 * @file VirtualCanvas.tsx
 * @role VirtualCanvas — 패딩(void) + CSS Grid 단일 레이어. Frame 중첩 제거.
 */

import { useEffect, useRef, useState } from 'react'
import { BaxBlockRenderer } from '../components/BaxBlockRenderer'
import { SparklineFloat } from '../components/SparklineFloat'
import { BLOCK_COMPONENT_IDS } from '../components/registry'
import { useBaxStore } from '../store/useBaxStore'
import { useAestheticSettingsStore } from '../settings/useAestheticSettingsStore'

/** void_ratio 0–100 → 상하좌우 패딩 % (ASR 호흡) */
function voidPadding(voidRatio: number): string {
  const pad = (100 - voidRatio) / 2
  return `${pad}%`
}

export function VirtualCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
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

  const floatVisual = render.visuals['sparkline-float']

  useEffect(() => {
    setTempHistory((h) => [...h.slice(-24), metrics.temp])
  }, [metrics.temp])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      updateViewport(entry.contentRect.width)
    })
    ro.observe(el)
    updateViewport(el.clientWidth)
    return () => ro.disconnect()
  }, [updateViewport])

  const blockCount = BLOCK_COMPONENT_IDS.length
  const pad = voidPadding(render.void_ratio)

  return (
    <div className="bax-viewport" ref={containerRef}>
      <div className="bax-viewport__meta">
        <span>{blockCount} BLOCK</span>
        <span>void {render.void_ratio}%</span>
        <span>{render.overflowFallback ? 'SingleColumn' : 'Grid'}</span>
        <span>{render.gridTemplateColumns}</span>
      </div>
      <div
        className="bax-canvas"
        style={{
          padding: pad,
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
        <BaxBlockRenderer
          components={components}
          render={render}
          metrics={metrics}
          alarmLevel={alarmState.level}
          sparklineVisible={render.sparklineVisible}
          sparklineIntensity={sparklineIntensity}
          tempHistory={tempHistory}
          lightX={lightX}
          lightY={lightY}
          onFocus={setMainFocus}
        />
        {floatVisual && (
          <SparklineFloat
            visual={floatVisual}
            values={metrics.load}
            intensity={sparklineIntensity}
          />
        )}
      </div>
    </div>
  )
}
