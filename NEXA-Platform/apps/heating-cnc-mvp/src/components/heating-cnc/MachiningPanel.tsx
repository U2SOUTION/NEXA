'use client';

import { ControlPad } from '@/components/heating-cnc/ControlPad';
import { EventLog } from '@/components/heating-cnc/EventLog';
import { JogGrid } from '@/components/heating-cnc/JogGrid';
import { RunModeBanner } from '@/components/heating-cnc/RunModeBanner';
import { RunModeSelector } from '@/components/heating-cnc/RunModeSelector';
import { ScanPassCard } from '@/components/heating-cnc/ScanPassCard';
import { TelemetryCard } from '@/components/heating-cnc/TelemetryCard';
import { TriLinkBanner } from '@/components/heating-cnc/TriLinkBanner';
import { useTriLinkSession } from '@/hooks/useTriLinkSession';

export function MachiningPanel() {
  const {
    status,
    triLink,
    telemetry,
    session,
    log,
    deviceConnected,
    scanProgress,
    scanResult,
    scanning,
    runMode,
    setRunMode,
    jog,
    estop,
    start,
    pause,
    startScan,
    enterOverdrive,
    exitOverdrive,
    isLocked,
    isConnected,
  } = useTriLinkSession();

  const wsDisabled = !isConnected;

  return (
    <>
      <TriLinkBanner
        status={status}
        triLink={triLink}
        runMode={runMode}
        deviceConnected={deviceConnected}
      />
      <RunModeBanner runMode={runMode} deviceConnected={deviceConnected} />

      <div className="panel__grid">
        <div className="stack">
          <TelemetryCard telemetry={telemetry} session={session} />
          <ScanPassCard
            runMode={runMode}
            scanning={scanning}
            progress={scanProgress}
            result={scanResult}
            disabled={wsDisabled}
            onStartScan={startScan}
          />
          <JogGrid disabled={wsDisabled} onJog={jog} />
          <EventLog lines={log} />
        </div>

        <aside className="sidebar">
          <RunModeSelector
            value={runMode}
            disabled={wsDisabled}
            onChange={(mode) => setRunMode(mode)}
          />
          <ControlPad
            disabled={wsDisabled}
            isLocked={isLocked}
            inOverdrive={session.work_session === 'manual_overdrive'}
            onEstop={estop}
            onStart={start}
            onPause={pause}
            onEnterOverdrive={enterOverdrive}
            onExitOverdrive={exitOverdrive}
          />
        </aside>
      </div>
    </>
  );
}
