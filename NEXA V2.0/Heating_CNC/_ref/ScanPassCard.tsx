/**
 * Heating CNC — Scan Pass Card UI reference (Next.js / React)
 *
 * Canonical spec: ../04-Data-Operations.md#scan-pass-카드-ui-와이어프레임-mvp-v01-필수
 * Target deploy path: components/heating-cnc/ScanPassCard.tsx
 */

import type { EccentricityModel, ScanPassResult, SplitEccentricity } from './edge-case-cam';

// ---------------------------------------------------------------------------
// Props & state
// ---------------------------------------------------------------------------

export type ScanPassCardPhase =
  | 'hidden'      // scan_pass_enabled=false or ui_sim
  | 'pending'     // job armed, scan not started
  | 'scanning'    // M210 + A-step in progress
  | 'complete'    // analysis done, awaiting operator ack or auto-continue
  | 'skipped'     // irregularity < 0.15
  | 'aborted'     // stall_crit during scan
  | 'align_warn'; // e_mm > eccentricity_max_mm

export interface ScanPassCardProps {
  phase: ScanPassCardPhase;
  runMode: 'ui_sim' | 'device_dry' | 'live';
  connectivityMode: 'cloud' | 'local_ap' | 'sd_offline';
  scanEnabled: boolean;
  /** Live progress 0–N samples */
  sampleProgress?: { current: number; total: number };
  liveLoadPct?: number;
  result?: ScanPassResult;
  /** 이원화 편심 — e_mount(장착) / e_shape(형상) */
  splitEccentricity?: SplitEccentricity;
  eccentricity?: EccentricityModel;
  leadInAdjMm?: number;
  eccentricityMaxMm?: number;
  onAckContinue?: () => void;
  onAbortJob?: () => void;
  onOpenAlignmentGuide?: () => void;
}

// ---------------------------------------------------------------------------
// Reference component (layout-only — styling via CSS modules / Tailwind in app)
// ---------------------------------------------------------------------------

export function ScanPassCard(props: ScanPassCardProps) {
  const {
    phase,
    runMode,
    connectivityMode,
    scanEnabled,
    sampleProgress,
    liveLoadPct,
    result,
    splitEccentricity,
    eccentricity,
    leadInAdjMm,
    eccentricityMaxMm = 2.0,
    onAckContinue,
    onAbortJob,
    onOpenAlignmentGuide,
  } = props;

  if (!scanEnabled || runMode === 'ui_sim' || phase === 'hidden') {
    return null;
  }

  if (connectivityMode === 'sd_offline') {
    return (
      <aside className="scan-pass-card scan-pass-card--sd" data-phase="sd_baked">
        <header>Edge Case (SD)</header>
        <p>스캔 결과는 Export NC에 bake 됨. 런타임 Scan 없음.</p>
        {result && (
          <dl>
            <dt>F_adj</dt>
            <dd>{result.fAdj} mm/min</dd>
          </dl>
        )}
      </aside>
    );
  }

  return (
    <aside className={`scan-pass-card scan-pass-card--${phase}`} data-phase={phase}>
      <header className="scan-pass-card__header">
        <span className="scan-pass-card__icon" aria-hidden>
          {phase === 'scanning' ? '◎' : phase === 'complete' ? '✓' : '◇'}
        </span>
        <h3>Scan Pass — 비정형·편심 보정</h3>
        {runMode === 'device_dry' && (
          <span className="scan-pass-card__badge">드라이런 · M3 로그만</span>
        )}
      </header>

      {phase === 'pending' && (
        <p className="scan-pass-card__hint">
          START 후 본 가공 전 A축 8점 부하 스캔이 실행됩니다.
        </p>
      )}

      {phase === 'scanning' && sampleProgress && (
        <section className="scan-pass-card__progress">
          <div className="scan-pass-card__polar" aria-label="부하 맵 진행">
            {/* Polar mini-chart: samples rendered as radial bars */}
            <PolarLoadMiniChart samples={result?.samples ?? []} activeDeg={undefined} />
          </div>
          <p>
            샘플 {sampleProgress.current}/{sampleProgress.total}
            {liveLoadPct != null && ` · a_load ${liveLoadPct.toFixed(0)}%`}
          </p>
        </section>
      )}

      {(phase === 'complete' || phase === 'skipped' || phase === 'aborted') && result && (
        <section className="scan-pass-card__summary">
          <dl className="scan-pass-card__metrics">
            <div>
              <dt>irregularity</dt>
              <dd>{result.irregularityIndex.toFixed(2)}</dd>
            </div>
            <div>
              <dt>F</dt>
              <dd>
                {result.fNominal} → <strong>{result.fAdj}</strong> mm/min
              </dd>
            </div>
            {splitEccentricity ? (
              <>
                <div>
                  <dt>장착 e_mount</dt>
                  <dd>{splitEccentricity.eMountMm.toFixed(2)} mm (패스 전 구간)</dd>
                </div>
                <div>
                  <dt>형상 e_shape</dt>
                  <dd>{splitEccentricity.eShapeMm.toFixed(2)} mm → 수렴 시 0</dd>
                </div>
              </>
            ) : eccentricity ? (
              <div>
                <dt>편심 e</dt>
                <dd>{eccentricity.e_mm.toFixed(2)} mm @ {eccentricity.phase_deg}°</dd>
              </div>
            ) : null}
            {leadInAdjMm != null && (
              <div>
                <dt>Lead-in</dt>
                <dd>{leadInAdjMm.toFixed(2)} mm</dd>
              </div>
            )}
          </dl>

          {phase === 'skipped' && (
            <p className="scan-pass-card__ok">정상 원통 — Scan skip · F 유지</p>
          )}
          {phase === 'aborted' && (
            <p className="scan-pass-card__warn">
              StallGuard crit 초과 — Scan 중단 · F 최소값 적용
            </p>
          )}
          {splitEccentricity &&
            splitEccentricity.eMountMm + splitEccentricity.eShapeMm > eccentricityMaxMm && (
            <p className="scan-pass-card__critical">
              편심 합 {(splitEccentricity.eMountMm + splitEccentricity.eShapeMm).toFixed(1)}mm — 기계 정렬 점검 권장
            </p>
          )}
          {!splitEccentricity && eccentricity && eccentricity.e_mm > eccentricityMaxMm && (
            <p className="scan-pass-card__critical">
              편심 {eccentricity.e_mm.toFixed(1)}mm — 기계 정렬 점검 권장
            </p>
          )}
        </section>
      )}

      {phase === 'align_warn' && (
        <section className="scan-pass-card__align-warn">
          <p>편심이 허용 한도를 초과했습니다. CAM 보정만으로는 품질 보장이 어렵습니다.</p>
          <button type="button" className="btn-secondary" onClick={onOpenAlignmentGuide}>
            07 정렬 가이드
          </button>
        </section>
      )}

      <footer className="scan-pass-card__actions">
        {(phase === 'complete' || phase === 'align_warn') && (
          <button
            type="button"
            className="btn-primary btn-glove"
            onClick={onAckContinue}
          >
            {phase === 'align_warn' ? '정렬 확인 후 계속' : '본 가공 계속'}
          </button>
        )}
        {phase === 'aborted' && (
          <button type="button" className="btn-danger btn-glove" onClick={onAbortJob}>
            작업 중단
          </button>
        )}
      </footer>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Polar mini-chart (concept)
// ---------------------------------------------------------------------------

interface PolarLoadMiniChartProps {
  samples: Array<{ aDeg: number; aLoadPct: number }>;
  activeDeg?: number;
}

function PolarLoadMiniChart({ samples, activeDeg }: PolarLoadMiniChartProps) {
  const maxLoad = Math.max(100, ...samples.map((s) => s.aLoadPct), 1);
  return (
    <svg viewBox="0 0 120 120" width={120} height={120} role="img">
      <circle cx={60} cy={60} r={48} fill="none" stroke="currentColor" opacity={0.2} />
      {samples.map((s) => {
        const rad = ((s.aDeg - 90) * Math.PI) / 180;
        const r = 12 + (s.aLoadPct / maxLoad) * 36;
        const x = 60 + Math.cos(rad) * r;
        const y = 60 + Math.sin(rad) * r;
        return (
          <circle
            key={s.aDeg}
            cx={x}
            cy={y}
            r={4}
            fill={s.aLoadPct === Math.max(...samples.map((x) => x.aLoadPct)) ? '#f59e0b' : '#3b82f6'}
          />
        );
      })}
      {activeDeg != null && (
        <line
          x1={60}
          y1={60}
          x2={60 + Math.cos(((activeDeg - 90) * Math.PI) / 180) * 44}
          y2={60 + Math.sin(((activeDeg - 90) * Math.PI) / 180) * 44}
          stroke="#ef4444"
          strokeWidth={2}
        />
      )}
    </svg>
  );
}
