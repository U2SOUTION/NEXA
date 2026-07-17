import type { RunMode } from '@nexa/heating-cnc';

interface RunModeBannerProps {
  runMode: RunMode;
  deviceConnected: boolean;
}

const MODE_META: Record<RunMode, { label: string; hint: string; tone: string }> = {
  ui_sim: {
    label: 'UI Sim',
    hint: 'MockDeviceEngine — 하드웨어 없이 전체 UX 검증',
    tone: 'run-banner--sim',
  },
  device_dry: {
    label: 'Device Dry',
    hint: '실장비 모션 · PWM=0 (열선 OFF)',
    tone: 'run-banner--dry',
  },
  live: {
    label: 'Live',
    hint: '열선 ON — 예열·인터록 통과 후만 START',
    tone: 'run-banner--live',
  },
};

export function RunModeBanner({ runMode, deviceConnected }: RunModeBannerProps) {
  const meta = MODE_META[runMode];

  return (
    <div className={`run-banner ${meta.tone}`} role="note">
      <strong>{meta.label}</strong>
      <span className="run-banner__hint">{meta.hint}</span>
      {runMode !== 'ui_sim' && (
        <span className={`run-banner__device ${deviceConnected ? 'run-banner__device--on' : 'run-banner__device--off'}`}>
          Device {deviceConnected ? '연결됨' : '미연결 · device-sim 또는 ESP32 필요'}
        </span>
      )}
    </div>
  );
}
