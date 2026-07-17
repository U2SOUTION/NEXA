import type { DeviceTelemetry, SessionState } from '@nexa/heating-cnc';

interface TelemetryCardProps {
  telemetry: DeviceTelemetry;
  session: SessionState;
}

function executorBadge(state: SessionState['gcode_executor_state']): string {
  switch (state) {
    case 'RUNNING':
      return 'badge badge--running';
    case 'LOCKED':
      return 'badge badge--locked';
    case 'PAUSED':
      return 'badge badge--paused';
    default:
      return 'badge badge--idle';
  }
}

export function TelemetryCard({ telemetry, session }: TelemetryCardProps) {
  return (
    <section className="card">
      <h2 className="card__title">텔레메트리</h2>
      <div style={{ marginBottom: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span className={executorBadge(session.gcode_executor_state)}>
          {session.gcode_executor_state}
        </span>
        <span className="badge badge--idle">{session.work_session}</span>
        {session.heater_lock && <span className="badge badge--locked">S12 HEATER LOCK</span>}
      </div>
      <div className="telemetry-grid">
        <div className="telemetry-item">
          <span className="telemetry-item__label">X</span>
          <span className="telemetry-item__value">{telemetry.x.toFixed(2)}</span>
        </div>
        <div className="telemetry-item">
          <span className="telemetry-item__label">Y</span>
          <span className="telemetry-item__value">{telemetry.y.toFixed(2)}</span>
        </div>
        <div className="telemetry-item">
          <span className="telemetry-item__label">Z</span>
          <span className="telemetry-item__value">{telemetry.z.toFixed(2)}</span>
        </div>
        <div className="telemetry-item">
          <span className="telemetry-item__label">A</span>
          <span className="telemetry-item__value">{telemetry.a.toFixed(1)}°</span>
        </div>
      </div>
      <p style={{ margin: '0.75rem 0 0', fontSize: '0.8125rem', color: 'var(--nexa-muted)' }}>
        A모드 {telemetry.a_mode}
        {telemetry.run_active ? ' · 가공 중' : ''}
      </p>
    </section>
  );
}
