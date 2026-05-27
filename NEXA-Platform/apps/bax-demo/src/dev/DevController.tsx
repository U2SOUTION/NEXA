/**
 * @file DevController.tsx
 * @role Dev Controller — main_focus · 컴포넌트별 경보.
 */

import { BAX_MODE_PRESETS, type BaxOperationMode } from '../engine/baxModePresets'
import { COMPONENT_SIM_META, FOCUSABLE_BLOCK_IDS } from '../engine/componentSimMeta'
import { useBaxStore } from '../store/useBaxStore'
import { AestheticSettingsPanel } from './AestheticSettingsPanel'
import { M2pSimPanel } from './M2pSimPanel'

export function DevController() {
  const baxMode = useBaxStore((s) => s.bax_mode)
  const setBaxMode = useBaxStore((s) => s.setBaxMode)
  const metrics = useBaxStore((s) => s.metrics)
  const mainFocusId = useBaxStore((s) => s.main_focus_id)
  const setMainFocus = useBaxStore((s) => s.setMainFocus)
  const setFocusMetricValue = useBaxStore((s) => s.setFocusMetricValue)
  const tickSensor = useBaxStore((s) => s.tickSensor)
  const triggerCritical = useBaxStore((s) => s.triggerCritical)
  const clearAlarm = useBaxStore((s) => s.clearAlarm)
  const circuitState = useBaxStore((s) => s.circuit_state)
  const setCircuitState = useBaxStore((s) => s.setCircuitState)
  const alarmState = useBaxStore((s) => s.alarmState)
  const viewportBand = useBaxStore((s) => s.viewport_band)
  const render = useBaxStore((s) => s.render)
  const hybridPhase = useBaxStore((s) => s.hybrid_phase)

  const focusMeta = COMPONENT_SIM_META[mainFocusId]
  const focusValue = focusMeta ? Math.round(focusMeta.getValue(metrics)) : 0

  return (
    <aside className="bax-dev">
      <header className="bax-dev__header">
        <strong>BAX DevController</strong>
        <span className="bax-badge">{viewportBand}</span>
        <span className="bax-badge">{hybridPhase}</span>
      </header>

      <div className="bax-dev__row">
        <label className="bax-field">
          <span>bax_mode</span>
          <select value={baxMode} onChange={(e) => setBaxMode(e.target.value as BaxOperationMode)}>
            {(Object.keys(BAX_MODE_PRESETS) as BaxOperationMode[]).map((m) => (
              <option key={m} value={m}>
                {m} (asr {BAX_MODE_PRESETS[m].asr_base})
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="bax-panel bax-panel--compact">
        <h3 className="bax-panel__title">Main Focus · 포커스</h3>
        <p className="bax-hint">캔버스 클릭 또는 칩 선택 → hero 슬롯 · RuleGuard 대상</p>
        <div className="bax-focus-chips">
          {FOCUSABLE_BLOCK_IDS.map((id) => {
            const meta = COMPONENT_SIM_META[id]
            return (
              <button
                key={id}
                type="button"
                className={`bax-focus-chip ${mainFocusId === id ? 'bax-focus-chip--active' : ''}`}
                onClick={() => setMainFocus(id)}
                title={meta?.autoEvaluate ? `임계 ${meta.threshold}` : '수동 경보만'}
              >
                {id}
              </button>
            )
          })}
        </div>
        <p className="bax-hint">
          MAIN: <strong>{mainFocusId}</strong>
          {focusMeta?.label ? ` · ${focusMeta.label}` : ''}
        </p>
      </div>

      <div className="bax-dev__grid">
        <AestheticSettingsPanel />
        <M2pSimPanel />
      </div>

      <div className="bax-panel bax-panel--compact">
        <h3 className="bax-panel__title">Safety · Sensor</h3>
        <div className="bax-dev__actions">
          <button type="button" onClick={triggerCritical}>
            경고 발생 ({mainFocusId})
          </button>
          <button type="button" onClick={clearAlarm}>
            경고 해제
          </button>
          <button type="button" onClick={tickSensor}>
            센서 tick
          </button>
        </div>
        {focusMeta?.slider ? (
          <label className="bax-field">
            <span>
              {focusMeta.label} {focusValue}
              {focusMeta.slider.unit} (임계 {focusMeta.compare === 'lte' ? '≤' : '≥'} {focusMeta.threshold})
            </span>
            <input
              type="range"
              min={focusMeta.slider.min}
              max={focusMeta.slider.max}
              value={focusValue}
              onChange={(e) => setFocusMetricValue(Number(e.target.value))}
            />
          </label>
        ) : (
          <p className="bax-hint">타이포 컴포넌트 — 슬라이더 없음 · 「경고 발생」으로 레이아웃 CRITICAL 시뮬</p>
        )}
        <label className="bax-field bax-field--row">
          <span>Circuit</span>
          <select
            value={circuitState}
            onChange={(e) => setCircuitState(e.target.value as typeof circuitState)}
          >
            <option value="closed">closed</option>
            <option value="open">open (G5 OFF)</option>
            <option value="half_open">half_open</option>
          </select>
        </label>
        <dl className="bax-alarm">
          <dt>AlarmState</dt>
          <dd>{alarmState.level}</dd>
          <dt>target</dt>
          <dd>{alarmState.component_id ?? '—'}</dd>
          <dt>MAIN</dt>
          <dd>{mainFocusId}</dd>
          <dt>void</dt>
          <dd>{render.void_ratio}%</dd>
          <dt>grid</dt>
          <dd>
            {render.gridTemplateColumns} / {render.gridTemplateRows}
          </dd>
        </dl>
      </div>
    </aside>
  )
}
