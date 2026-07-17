'use client';

import type { RunMode } from '@nexa/heating-cnc';

const RUN_MODES: { id: RunMode; label: string }[] = [
  { id: 'ui_sim', label: 'UI Sim' },
  { id: 'device_dry', label: 'Dry Run' },
  { id: 'live', label: 'Live' },
];

interface RunModeSelectorProps {
  value: RunMode;
  disabled?: boolean;
  onChange: (mode: RunMode) => void;
}

export function RunModeSelector({ value, disabled, onChange }: RunModeSelectorProps) {
  return (
    <section className="card">
      <h2 className="card__title">운영 모드</h2>
      <div className="mode-row" role="group" aria-label="운영 모드">
        {RUN_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            className={`mode-btn ${value === mode.id ? 'mode-btn--active' : ''}`}
            disabled={disabled}
            onClick={() => onChange(mode.id)}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </section>
  );
}
