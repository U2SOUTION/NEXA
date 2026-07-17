'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createDefaultTelemetry,
  type DeviceTelemetry,
  type RunMode,
  type SessionState,
  type TriLinkPayload,
} from '@nexa/heating-cnc';
import {
  TriLinkClient,
  type ConnectionStatus,
  getOrCreateTabId,
  getWorkerWsUrl,
} from '@/lib/ws-client';

const DEFAULT_SESSION: SessionState = {
  work_session: 'machining',
  gcode_executor_state: 'IDLE',
  a_submode: 'A_IDLE',
  coords: { x: 0, y: 0, z: 0, a: 0 },
  heater_lock: false,
  foot_armed: false,
};

export function useTriLinkSession() {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [triLink, setTriLink] = useState<TriLinkPayload | null>(null);
  const [telemetry, setTelemetry] = useState<DeviceTelemetry>(() => createDefaultTelemetry('ui_sim'));
  const [session, setSession] = useState<SessionState>(DEFAULT_SESSION);
  const [log, setLog] = useState<string[]>([]);
  const clientRef = useRef<TriLinkClient | null>(null);

  const pushLog = useCallback((line: string) => {
    const ts = new Date().toLocaleTimeString('ko-KR', { hour12: false });
    setLog((prev) => [`[${ts}] ${line}`, ...prev].slice(0, 12));
  }, []);

  const tabId = useMemo(() => getOrCreateTabId(), []);

  useEffect(() => {
    const client = new TriLinkClient({
      url: getWorkerWsUrl('/ui/ws'),
      tabId,
      onStatus: setStatus,
      onTriLink: setTriLink,
      onTelemetry: setTelemetry,
      onSessionState: setSession,
      onLog: pushLog,
      onFailSafe: () => setTelemetry((t) => ({ ...t, run_active: false, gcode_executor_state: 'LOCKED' })),
    });
    clientRef.current = client;
    client.connect();
    return () => client.disconnect();
  }, [tabId, pushLog]);

  const client = clientRef.current;

  return {
    status,
    triLink,
    telemetry,
    session,
    log,
    runMode: telemetry.run_mode,
    setRunMode: (mode: RunMode) => client?.setRunMode(mode),
    jog: (axis: 'X' | 'Y' | 'Z' | 'A', delta: number) => client?.jog(axis, delta),
    estop: () => client?.estop(),
    start: () => client?.start(),
    pause: () => client?.pause(),
    enterOverdrive: () => client?.setWorkSession('manual_overdrive'),
    exitOverdrive: () => client?.setWorkSession('machining'),
    isLocked: session.gcode_executor_state === 'LOCKED',
    isConnected: status === 'connected',
  };
}
