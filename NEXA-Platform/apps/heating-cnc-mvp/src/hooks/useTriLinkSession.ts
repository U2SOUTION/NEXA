'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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

export interface ScanSampleProgress {
  a_deg: number;
  a_load_pct: number;
  index: number;
  total: number;
}

export interface ScanResultSummary {
  irregularity_index: number;
  f_adj: number;
  f_nominal: number;
  skipped: boolean;
  e_mm?: number;
}

export function useTriLinkSession() {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [triLink, setTriLink] = useState<TriLinkPayload | null>(null);
  const [telemetry, setTelemetry] = useState<DeviceTelemetry>(() => createDefaultTelemetry('ui_sim'));
  const [session, setSession] = useState<SessionState>(DEFAULT_SESSION);
  const [log, setLog] = useState<string[]>([]);
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanSampleProgress | null>(null);
  const [scanResult, setScanResult] = useState<ScanResultSummary | null>(null);
  const [scanning, setScanning] = useState(false);
  const clientRef = useRef<TriLinkClient | null>(null);

  const pushLog = useCallback((line: string) => {
    const ts = new Date().toLocaleTimeString('ko-KR', { hour12: false });
    setLog((prev) => [`[${ts}] ${line}`, ...prev].slice(0, 12));
  }, []);

  const [tabId, setTabId] = useState<string | null>(null);

  useEffect(() => {
    setTabId(getOrCreateTabId());
  }, []);

  useEffect(() => {
    if (!tabId) return;

    const client = new TriLinkClient({
      url: getWorkerWsUrl('/ui/ws'),
      tabId,
      onStatus: setStatus,
      onTriLink: setTriLink,
      onTelemetry: setTelemetry,
      onSessionState: setSession,
      onLog: pushLog,
      onDeviceConnected: setDeviceConnected,
      onFailSafe: () => setTelemetry((t) => ({ ...t, run_active: false, gcode_executor_state: 'LOCKED' })),
      onScanSample: (s) => {
        setScanning(true);
        setScanProgress(s);
      },
      onScanResult: (raw) => {
        setScanning(false);
        setScanProgress(null);
        const sr = raw.scan_result as Record<string, unknown> | undefined;
        const ecc = raw.eccentricity as Record<string, unknown> | undefined;
        if (sr) {
          setScanResult({
            irregularity_index: Number(sr.irregularity_index),
            f_adj: Number(sr.f_adj),
            f_nominal: Number(sr.f_nominal),
            skipped: Boolean(sr.skipped),
            e_mm: ecc ? Number(ecc.e_mm) : undefined,
          });
        }
      },
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
    deviceConnected,
    scanProgress,
    scanResult,
    scanning,
    runMode: telemetry.run_mode,
    setRunMode: (mode: RunMode) => client?.setRunMode(mode),
    jog: (axis: 'X' | 'Y' | 'Z' | 'A', delta: number) => client?.jog(axis, delta),
    estop: () => client?.estop(),
    start: () => client?.start(),
    pause: () => client?.pause(),
    startScan: () => client?.startScan(45),
    enterOverdrive: () => client?.setWorkSession('manual_overdrive'),
    exitOverdrive: () => client?.setWorkSession('machining'),
    isLocked: session.gcode_executor_state === 'LOCKED',
    isConnected: status === 'connected',
  };
}
