/**
 * @file M2pSimPanel.tsx
 * @role M2P S1–S3 패널.
 */

import { useState } from 'react'
import { useBaxStore } from '../store/useBaxStore'

export function M2pSimPanel() {
  const applyM2P = useBaxStore((s) => s.applyM2P)
  const setLight = useBaxStore((s) => s.setLight)
  const voidRatio = useBaxStore((s) => s.void_ratio)
  const focusBlur = useBaxStore((s) => s.focus_blur_scale)

  const [s1, setS1] = useState(0)
  const [s2, setS2] = useState(0.7)
  const [s3x, setS3x] = useState(50)
  const [s3y, setS3y] = useState(30)

  return (
    <div className="bax-panel">
      <h3 className="bax-panel__title">M2P · Sim</h3>
      <label className="bax-field">
        <span>S1 void delta {s1 > 0 ? '+' : ''}{s1}</span>
        <input
          type="range"
          min={-10}
          max={10}
          value={s1}
          onChange={(e) => {
            const v = Number(e.target.value)
            setS1(v)
            applyM2P(v, s2)
          }}
        />
      </label>
      <label className="bax-field">
        <span>S2 focus blur {s2.toFixed(2)}</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={s2}
          onChange={(e) => {
            const v = Number(e.target.value)
            setS2(v)
            applyM2P(s1, v)
          }}
        />
      </label>
      <label className="bax-field">
        <span>S3 light X {s3x}</span>
        <input
          type="range"
          min={0}
          max={100}
          value={s3x}
          onChange={(e) => {
            const v = Number(e.target.value)
            setS3x(v)
            setLight(v, s3y)
          }}
        />
      </label>
      <label className="bax-field">
        <span>S3 light Y {s3y}</span>
        <input
          type="range"
          min={0}
          max={100}
          value={s3y}
          onChange={(e) => {
            const v = Number(e.target.value)
            setS3y(v)
            setLight(s3x, v)
          }}
        />
      </label>
      <p className="bax-hint">
        void {voidRatio}% · blur scale {focusBlur.toFixed(2)} (비영속)
      </p>
    </div>
  )
}
