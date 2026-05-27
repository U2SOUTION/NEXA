/**
 * @file useBaxStore.ts
 * @role BAX 런타임 Store — main_focus · 컴포넌트별 경보.
 */

import { create } from 'zustand'
import type { ComponentDeclaration } from '../types/component'
import type { MaeRenderState } from '../engine/renderState'
import { createEmptyRenderState } from '../engine/renderState'
import type { MaeContext } from '../engine/MaeContext'
import { computeAestheticState, syncComponentUrgency } from '../engine/applyAestheticState'
import { BAX_MODE_PRESETS, type BaxOperationMode } from '../engine/baxModePresets'
import { createInitialAlarmState, type AlarmState } from '../engine/alarmState'
import {
  evaluateComponentMetric,
  triggerManualCritical,
  clearAlarmState,
} from '../engine/ruleEngine'
import { COMPONENT_SIM_META } from '../engine/componentSimMeta'
import { getViewportBand } from '../engine/viewportScale'
import { useAestheticSettingsStore } from '../settings/useAestheticSettingsStore'
import { resolveAsrBase, clampVoidRatio } from '../engine/guardrails/asrPolicy'
import { MVP_COMPONENT_DECLARATIONS } from '../components/registry'
import { INITIAL_METRICS, tickMetrics, type SimMetrics } from './simMetrics'

function cloneComponents(): ComponentDeclaration[] {
  return MVP_COMPONENT_DECLARATIONS.map((c) => ({ ...c }))
}

function buildContext(state: BaxStore): MaeContext {
  const aesthetic_tuning = useAestheticSettingsStore.getState().toSettings()
  return {
    components: state.components,
    bax_mode: state.bax_mode,
    viewport_band: state.viewport_band,
    circuit_state: state.circuit_state,
    void_ratio: state.void_ratio,
    focus_blur_scale: state.focus_blur_scale,
    light_source_x: state.light_source_x,
    light_source_y: state.light_source_y,
    aesthetic_tuning,
    alarmState: state.alarmState,
    main_focus_id: state.main_focus_id,
    hybrid_phase: state.hybrid_phase,
    canvas_scale: state.render.canvas_scale,
    active_layout_policy: 'default',
    asrOverride: state.render.asrOverride,
  }
}

function runMae(state: BaxStore): MaeRenderState {
  return computeAestheticState(buildContext(state))
}

function runRuleGuard(state: BaxStore, metrics: SimMetrics, alarmState: AlarmState): AlarmState {
  const next = { ...alarmState }
  evaluateComponentMetric(state.main_focus_id, metrics, next)
  return next
}

export interface BaxStore {
  bax_mode: BaxOperationMode
  void_ratio: number
  focus_blur_scale: number
  viewport_band: 'xl' | 'md' | 'sm'
  circuit_state: 'closed' | 'open' | 'half_open'
  light_source_x: number
  light_source_y: number
  main_focus_id: string
  metrics: SimMetrics
  components: ComponentDeclaration[]
  alarmState: AlarmState
  hybrid_phase: 'urgent' | 'fine_tune' | 'idle'
  render: MaeRenderState
  ollamaEnabled: boolean

  setMainFocus: (id: string) => void
  setBaxMode: (mode: BaxOperationMode) => void
  applyM2P: (void_ratio_delta: number, focus_blur_scale: number) => void
  setLight: (x: number, y: number) => void
  setCircuitState: (s: BaxStore['circuit_state']) => void
  triggerCritical: () => void
  triggerCriticalFor: (componentId: string) => void
  clearAlarm: () => void
  setFocusMetricValue: (value: number) => void
  tickSensor: () => void
  updateViewport: (width: number) => void
  setOllamaEnabled: (v: boolean) => void
  refreshMae: () => void
}

export const useBaxStore = create<BaxStore>((set, get) => ({
  bax_mode: 'contextual',
  void_ratio: BAX_MODE_PRESETS.contextual.initial_void_ratio,
  focus_blur_scale: 0.7,
  viewport_band: 'xl',
  circuit_state: 'closed',
  light_source_x: 50,
  light_source_y: 30,
  main_focus_id: 'sentinel',
  metrics: { ...INITIAL_METRICS },
  components: cloneComponents(),
  alarmState: createInitialAlarmState(),
  hybrid_phase: 'idle',
  render: createEmptyRenderState(),
  ollamaEnabled: false,

  refreshMae: () => {
    const s = get()
    set({
      render: runMae(s),
      components: syncComponentUrgency(s.components, s.alarmState.component_id, s.alarmState.level),
    })
  },

  setMainFocus: (main_focus_id) => {
    set({ main_focus_id })
    get().refreshMae()
  },

  setBaxMode: (mode) => {
    set({
      bax_mode: mode,
      void_ratio: BAX_MODE_PRESETS[mode].initial_void_ratio,
      hybrid_phase: 'idle',
    })
    get().refreshMae()
  },

  applyM2P: (void_ratio_delta, focus_blur_scale) => {
    const s = get()
    const aesthetic = useAestheticSettingsStore.getState().toSettings()
    const floor = resolveAsrBase(s.bax_mode, s.viewport_band, aesthetic.asrPreferenceOffset)
    const base = BAX_MODE_PRESETS[s.bax_mode].initial_void_ratio
    set({
      void_ratio: clampVoidRatio(base + void_ratio_delta, floor),
      focus_blur_scale,
    })
    get().refreshMae()
  },

  setLight: (x, y) => {
    set({ light_source_x: x, light_source_y: y })
    get().refreshMae()
  },

  setCircuitState: (circuit_state) => {
    set({ circuit_state })
    get().refreshMae()
  },

  triggerCritical: () => {
    get().triggerCriticalFor(get().main_focus_id)
  },

  triggerCriticalFor: (componentId) => {
    const meta = COMPONENT_SIM_META[componentId]
    const alarmState = { ...get().alarmState }
    triggerManualCritical(alarmState, componentId)
    const metrics = meta ? meta.applyAlert(get().metrics) : get().metrics
    set({ metrics, alarmState, main_focus_id: componentId, hybrid_phase: 'urgent' })
    get().refreshMae()
  },

  clearAlarm: () => {
    const alarmState = { ...get().alarmState }
    clearAlarmState(alarmState, 'operator')
    set({ alarmState, hybrid_phase: 'idle' })
    get().refreshMae()
  },

  setFocusMetricValue: (value) => {
    const s = get()
    const meta = COMPONENT_SIM_META[s.main_focus_id]
    if (!meta?.slider) return

    let metrics = { ...s.metrics }
    switch (s.main_focus_id) {
      case 'sentinel':
        metrics = { ...metrics, temp: value }
        break
      case 'gauge-humidity':
        metrics = { ...metrics, humidity: value }
        break
      case 'gauge-pressure':
        metrics = { ...metrics, pressure: value }
        break
      case 'bar-load':
        metrics = { ...metrics, load: [...metrics.load.slice(0, -1), value] }
        break
      case 'ring-status':
        metrics = { ...metrics, ringSegments: metrics.ringSegments.map((seg, i) => (i === 0 ? value / 100 : seg)) }
        break
      default:
        return
    }

    const alarmState = runRuleGuard(s, metrics, { ...s.alarmState })
    set({
      metrics,
      alarmState,
      hybrid_phase: alarmState.level === 'CRITICAL' ? 'urgent' : 'idle',
    })
    get().refreshMae()
  },

  tickSensor: () => {
    const s = get()
    const metrics = tickMetrics(s.metrics)
    const alarmState = runRuleGuard(s, metrics, { ...s.alarmState })
    set({
      metrics,
      alarmState,
      hybrid_phase: alarmState.level === 'CRITICAL' ? 'urgent' : 'idle',
    })
    get().refreshMae()
  },

  updateViewport: (width) => {
    set({ viewport_band: getViewportBand(width) })
    get().refreshMae()
  },

  setOllamaEnabled: (ollamaEnabled) => set({ ollamaEnabled }),
}))

useBaxStore.getState().refreshMae()
