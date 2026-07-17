import type { ConnectionStatus } from '@/lib/ws-client';
import type { TriLinkPayload } from '@nexa/heating-cnc';

interface TriLinkBannerProps {
  status: ConnectionStatus;
  triLink: TriLinkPayload | null;
  runMode: string;
  deviceConnected: boolean;
}

function bannerClass(status: ConnectionStatus, triLink: TriLinkPayload | null): string {
  if (status !== 'connected') return 'tri-link tri-link--idle';
  if (!triLink) return 'tri-link tri-link--warn';
  if (triLink.run_active && triLink.ui_required && !triLink.ui_alive) return 'tri-link tri-link--danger';
  if (triLink.run_active) return 'tri-link tri-link--ok';
  return 'tri-link tri-link--ok';
}

const STATUS_LABEL: Record<ConnectionStatus, string> = {
  connecting: '연결 중…',
  connected: '연결됨',
  disconnected: '끊김 · 재연결 대기',
  error: '연결 오류',
};

export function TriLinkBanner({ status, triLink, runMode, deviceConnected }: TriLinkBannerProps) {
  const uiAlive = triLink?.ui_alive ?? false;
  const serverAlive = status === 'connected';
  const runActive = triLink?.run_active ?? false;

  return (
    <div className={bannerClass(status, triLink)} role="status" aria-live="polite">
      <div className="tri-link__dots" aria-hidden>
        <span
          className={`tri-link__dot ${uiAlive ? 'tri-link__dot--on' : 'tri-link__dot--off'}`}
          title="UI"
        />
        <span
          className={`tri-link__dot ${serverAlive ? 'tri-link__dot--on' : 'tri-link__dot--off'}`}
          title="Server"
        />
        <span
          className={`tri-link__dot ${deviceConnected ? 'tri-link__dot--on' : 'tri-link__dot--off'}`}
          title="Device"
        />
      </div>
      <div>
        <strong>Tri-Link</strong> · {STATUS_LABEL[status]}
        {triLink && (
          <span style={{ marginLeft: '0.5rem', opacity: 0.85 }}>
            {runActive ? 'RUN' : 'IDLE'} · {runMode}
            {triLink.ui_required && !triLink.ui_alive && ' · UI 타임아웃 위험'}
          </span>
        )}
      </div>
    </div>
  );
}
