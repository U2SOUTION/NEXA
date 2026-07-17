import type { ScanResultSummary, ScanSampleProgress } from '@/hooks/useTriLinkSession';
import type { RunMode } from '@nexa/heating-cnc';

interface ScanPassCardProps {
  runMode: RunMode;
  scanning: boolean;
  progress: ScanSampleProgress | null;
  result: ScanResultSummary | null;
  disabled?: boolean;
  onStartScan: () => void;
}

export function ScanPassCard({
  runMode,
  scanning,
  progress,
  result,
  disabled,
  onStartScan,
}: ScanPassCardProps) {
  if (runMode === 'ui_sim') return null;

  const phase = scanning ? 'scanning' : result ? 'complete' : 'pending';

  return (
    <aside className={`scan-pass-card scan-pass-card--${phase}`} data-phase={phase}>
      <header className="scan-pass-card__header">
        <h3 className="card__title scan-pass-card__title">Scan Pass</h3>
        {runMode === 'device_dry' && <span className="badge badge--idle">드라이런</span>}
      </header>

      {phase === 'pending' && (
        <>
          <p className="scan-pass-card__hint">
            A축 부하 스캔으로 비정형·편심을 감지하고 F를 보정합니다.
          </p>
          <button type="button" className="btn btn-secondary" disabled={disabled} onClick={onStartScan}>
            Scan 시작
          </button>
        </>
      )}

      {phase === 'scanning' && progress && (
        <section className="scan-pass-card__progress">
          <div className="scan-pass-card__bar" aria-hidden>
            <div
              className="scan-pass-card__bar-fill"
              style={{ width: `${((progress.index + 1) / progress.total) * 100}%` }}
            />
          </div>
          <p>
            샘플 {progress.index + 1}/{progress.total} · A={progress.a_deg}° · load {progress.a_load_pct}%
          </p>
        </section>
      )}

      {phase === 'complete' && result && (
        <dl className="scan-pass-card__metrics">
          <div>
            <dt>irregularity</dt>
            <dd>{result.irregularity_index.toFixed(2)}</dd>
          </div>
          <div>
            <dt>F</dt>
            <dd>
              {result.f_nominal} → <strong>{result.f_adj}</strong> mm/min
            </dd>
          </div>
          {result.e_mm != null && (
            <div>
              <dt>편심 e</dt>
              <dd>{result.e_mm.toFixed(2)} mm</dd>
            </div>
          )}
          {result.skipped && <p className="scan-pass-card__ok">정상 원통 — Scan skip</p>}
        </dl>
      )}
    </aside>
  );
}
