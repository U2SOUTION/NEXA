/**
 * @file AestheticSettingsPanel.tsx
 * @role ATS T0–T3 패널.
 */

import { DEPTH_PRESETS, useAestheticSettingsStore, type DepthPreset } from '../settings/useAestheticSettingsStore'
import { useBaxStore } from '../store/useBaxStore'

export function AestheticSettingsPanel() {
  const asrOffset = useAestheticSettingsStore((s) => s.asrPreferenceOffset)
  const depthPreset = useAestheticSettingsStore((s) => s.depthPreset)
  const vib = useAestheticSettingsStore((s) => s.vibrationProfile)
  const setAsrOffset = useAestheticSettingsStore((s) => s.setAsrOffset)
  const setDepthPreset = useAestheticSettingsStore((s) => s.setDepthPreset)
  const setSparklineEnabled = useAestheticSettingsStore((s) => s.setSparklineEnabled)
  const setSparklineIntensity = useAestheticSettingsStore((s) => s.setSparklineIntensity)
  const setMicroAmplitude = useAestheticSettingsStore((s) => s.setMicroAmplitude)
  const refreshMae = useBaxStore((s) => s.refreshMae)

  const onChange = () => refreshMae()

  return (
    <div className="bax-panel">
      <h3 className="bax-panel__title">ATS · Settings</h3>
      <label className="bax-field">
        <span>T0 ASR +{asrOffset}</span>
        <input
          type="range"
          min={0}
          max={15}
          value={asrOffset}
          onChange={(e) => {
            setAsrOffset(Number(e.target.value))
            onChange()
          }}
        />
      </label>
      <label className="bax-field">
        <span>T1 Depth</span>
        <select
          value={depthPreset}
          onChange={(e) => {
            setDepthPreset(e.target.value as DepthPreset)
            onChange()
          }}
        >
          {(Object.keys(DEPTH_PRESETS) as DepthPreset[]).map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
      <label className="bax-field bax-field--row">
        <span>T2 Sparkline</span>
        <input
          type="checkbox"
          checked={vib.sparklineEnabled}
          onChange={(e) => {
            setSparklineEnabled(e.target.checked)
            onChange()
          }}
        />
        <input
          type="range"
          min={0}
          max={2}
          value={vib.sparklineIntensity}
          onChange={(e) => {
            setSparklineIntensity(Number(e.target.value) as 0 | 1 | 2)
            onChange()
          }}
        />
      </label>
      <label className="bax-field">
        <span>T3 Micro {vib.microMotionAmplitude}</span>
        <input
          type="range"
          min={0}
          max={100}
          value={vib.microMotionAmplitude}
          onChange={(e) => {
            setMicroAmplitude(Number(e.target.value))
            onChange()
          }}
        />
      </label>
    </div>
  )
}
