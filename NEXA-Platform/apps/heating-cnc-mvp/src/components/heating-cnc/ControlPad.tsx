'use client';

interface ControlPadProps {
  disabled?: boolean;
  isLocked?: boolean;
  onEstop: () => void;
  onStart: () => void;
  onPause: () => void;
  onEnterOverdrive?: () => void;
  onExitOverdrive?: () => void;
  inOverdrive?: boolean;
}

export function ControlPad({
  disabled,
  isLocked,
  onEstop,
  onStart,
  onPause,
  onEnterOverdrive,
  onExitOverdrive,
  inOverdrive,
}: ControlPadProps) {
  return (
    <section className="card">
      <h2 className="card__title">제어</h2>
      <div className="control-row">
        <button
          type="button"
          className="btn btn-estop"
          disabled={disabled}
          onClick={onEstop}
          aria-label="비상 정지"
        >
          E-STOP
        </button>
        <button
          type="button"
          className="btn btn-start"
          disabled={disabled || isLocked}
          onClick={onStart}
        >
          START
        </button>
        <button type="button" className="btn btn-pause" disabled={disabled} onClick={onPause}>
          PAUSE
        </button>
      </div>
      {isLocked && (
        <p style={{ margin: '0.75rem 0 0', fontSize: '0.8125rem', color: '#ff6b6b' }}>
          Utility Mode — G-code 실행 불가
        </p>
      )}
      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {!inOverdrive ? (
          <button
            type="button"
            className="btn btn-secondary"
            style={{ flex: 1, minWidth: '140px' }}
            disabled={disabled}
            onClick={onEnterOverdrive}
          >
            후공정 진입
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-secondary"
            style={{ flex: 1, minWidth: '140px' }}
            disabled={disabled}
            onClick={onExitOverdrive}
          >
            가공 모드 복귀
          </button>
        )}
      </div>
    </section>
  );
}
