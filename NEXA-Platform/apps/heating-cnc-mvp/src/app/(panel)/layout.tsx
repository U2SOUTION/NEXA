'use client';

import '@/styles/panel.css';
import { ClientOnly } from '@/components/heating-cnc/ClientOnly';

function PanelChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="panel">
      <header className="panel__header">
        <div>
          <h1 className="panel__title">Heating CNC</h1>
          <p className="panel__subtitle">MVP v0.1 · Phase 2 · Tri-Link WS</p>
        </div>
      </header>
      {children}
    </div>
  );
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientOnly
      fallback={
        <div className="panel">
          <p className="panel__subtitle">제어 패널 로딩 중…</p>
        </div>
      }
    >
      <PanelChrome>{children}</PanelChrome>
    </ClientOnly>
  );
}
