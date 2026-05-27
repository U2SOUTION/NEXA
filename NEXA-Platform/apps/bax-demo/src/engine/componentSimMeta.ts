/**
 * @file componentSimMeta.ts
 * @role 컴포넌트별 시뮬 메트릭·임계·포커스 메타 SSOT.
 */

import type { BaxComponentId } from '../components/registry'
import type { SimMetrics } from '../store/simMetrics'

export interface ComponentSimMeta {
  label: string
  focusable: boolean
  autoEvaluate: boolean
  getValue: (m: SimMetrics) => number
  threshold: number
  /** gte: 값 ≥ 임계 시 경보 · lte: 값 ≤ 임계 시 경보 */
  compare: 'gte' | 'lte'
  applyAlert: (m: SimMetrics) => SimMetrics
  slider?: { min: number; max: number; step?: number; unit: string }
}

export const FOCUSABLE_BLOCK_IDS: BaxComponentId[] = [
  'anchor',
  'glyph-north',
  'glyph-east',
  'tagline',
  'sentinel',
  'gauge-humidity',
  'gauge-pressure',
  'bar-load',
  'ring-status',
]

export const COMPONENT_SIM_META: Record<string, ComponentSimMeta> = {
  anchor: {
    label: 'Anchor (BAX)',
    focusable: true,
    autoEvaluate: false,
    getValue: () => 0,
    threshold: Infinity,
    compare: 'gte',
    applyAlert: (m) => m,
  },
  'glyph-north': {
    label: 'Glyph NORTH',
    focusable: true,
    autoEvaluate: false,
    getValue: () => 0,
    threshold: Infinity,
    compare: 'gte',
    applyAlert: (m) => m,
  },
  'glyph-east': {
    label: 'Glyph EAST',
    focusable: true,
    autoEvaluate: false,
    getValue: () => 0,
    threshold: Infinity,
    compare: 'gte',
    applyAlert: (m) => m,
  },
  tagline: {
    label: 'Tagline',
    focusable: true,
    autoEvaluate: false,
    getValue: () => 0,
    threshold: Infinity,
    compare: 'gte',
    applyAlert: (m) => m,
  },
  sentinel: {
    label: 'Sentinel · Temp',
    focusable: true,
    autoEvaluate: true,
    getValue: (m) => m.temp,
    threshold: 80,
    compare: 'gte',
    applyAlert: (m) => ({ ...m, temp: 85 }),
    slider: { min: 65, max: 95, unit: '°C' },
  },
  'gauge-humidity': {
    label: 'Humidity',
    focusable: true,
    autoEvaluate: true,
    getValue: (m) => m.humidity,
    threshold: 85,
    compare: 'gte',
    applyAlert: (m) => ({ ...m, humidity: 92 }),
    slider: { min: 20, max: 99, unit: '%' },
  },
  'gauge-pressure': {
    label: 'Pressure',
    focusable: true,
    autoEvaluate: true,
    getValue: (m) => m.pressure,
    threshold: 1025,
    compare: 'gte',
    applyAlert: (m) => ({ ...m, pressure: 1035 }),
    slider: { min: 990, max: 1040, unit: 'hPa' },
  },
  'bar-load': {
    label: 'System Load',
    focusable: true,
    autoEvaluate: true,
    getValue: (m) => Math.max(...m.load, 0),
    threshold: 70,
    compare: 'gte',
    applyAlert: (m) => ({ ...m, load: [...m.load.slice(0, -1), 88] }),
    slider: { min: 20, max: 95, unit: '% peak' },
  },
  'ring-status': {
    label: 'Node Health',
    focusable: true,
    autoEvaluate: true,
    getValue: (m) => Math.min(...m.ringSegments) * 100,
    threshold: 35,
    compare: 'lte',
    applyAlert: (m) => ({
      ...m,
      ringSegments: m.ringSegments.map((seg, i) => (i === 0 ? 0.15 : seg)),
    }),
    slider: { min: 10, max: 100, unit: '% min seg' },
  },
}

export function getFocusMeta(id: string): ComponentSimMeta | undefined {
  return COMPONENT_SIM_META[id]
}
