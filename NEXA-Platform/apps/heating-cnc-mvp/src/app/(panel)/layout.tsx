import '@/styles/panel.css';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="panel">
      <header className="panel__header">
        <div>
          <h1 className="panel__title">Heating CNC</h1>
          <p className="panel__subtitle">MVP v0.1 · Phase 1 · Tri-Link WS</p>
        </div>
      </header>
      {children}
    </div>
  );
}
