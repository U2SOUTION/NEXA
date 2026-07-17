import type {
  DeviceTelemetry,
  RunMode,
  SessionState,
  TriLinkPayload,
  WsCommand,
} from '@nexa/heating-cnc';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface TriLinkClientOptions {
  url: string;
  tabId: string;
  sessionId?: string | null;
  onStatus?: (status: ConnectionStatus) => void;
  onTriLink?: (payload: TriLinkPayload) => void;
  onTelemetry?: (telemetry: DeviceTelemetry) => void;
  onSessionState?: (state: SessionState) => void;
  onLog?: (line: string) => void;
  onFailSafe?: (reason: string) => void;
  onDeviceConnected?: (connected: boolean) => void;
  onScanSample?: (sample: { a_deg: number; a_load_pct: number; index: number; total: number }) => void;
  onScanResult?: (result: Record<string, unknown>) => void;
}

const HEARTBEAT_MS = 1000;
const RECONNECT_MS = 3000;

export class TriLinkClient {
  private ws: WebSocket | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private seqId = 0;
  private disposed = false;

  constructor(private readonly options: TriLinkClientOptions) {}

  connect(): void {
    if (this.disposed) return;
    this.options.onStatus?.('connecting');

    try {
      this.ws = new WebSocket(this.options.url);
    } catch {
      this.options.onStatus?.('error');
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.options.onStatus?.('connected');
      this.options.onLog?.('WS connected');
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      try {
        const msg: unknown = JSON.parse(String(event.data));
        this.handleMessage(msg);
      } catch {
        this.options.onLog?.('Invalid WS message');
      }
    };

    this.ws.onclose = () => {
      this.stopHeartbeat();
      if (!this.disposed) {
        this.options.onStatus?.('disconnected');
        this.options.onLog?.('WS disconnected');
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      this.options.onStatus?.('error');
    };
  }

  disconnect(): void {
    this.disposed = true;
    this.stopHeartbeat();
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }

  sendCommand(cmd: WsCommand): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify(cmd));
  }

  private nextSeq(): number {
    this.seqId += 1;
    return this.seqId;
  }

  jog(axis: 'X' | 'Y' | 'Z' | 'A', delta: number): void {
    this.sendCommand({ type: 'cmd_jog', seq_id: this.nextSeq(), axis, delta });
  }

  estop(): void {
    this.sendCommand({ type: 'cmd_estop', seq_id: this.nextSeq() });
  }

  start(): void {
    this.sendCommand({ type: 'cmd_start', seq_id: this.nextSeq() });
  }

  pause(): void {
    this.sendCommand({ type: 'cmd_pause', seq_id: this.nextSeq() });
  }

  setRunMode(runMode: RunMode): void {
    this.sendCommand({ type: 'cmd_set_run_mode', seq_id: this.nextSeq(), run_mode: runMode });
  }

  setWorkSession(workSession: 'machining' | 'manual_overdrive'): void {
    this.sendCommand({ type: 'cmd_set_session', seq_id: this.nextSeq(), work_session: workSession });
  }

  startScan(stepDeg = 45): void {
    this.sendCommand({ type: 'cmd_scan_start', seq_id: this.nextSeq(), scan_a_step_deg: stepDeg });
  }

  private handleMessage(raw: unknown): void {
    if (!raw || typeof raw !== 'object') return;
    const msg = raw as Record<string, unknown>;

    if (msg.tri_link && typeof msg.tri_link === 'object') {
      this.options.onTriLink?.(msg.tri_link as TriLinkPayload);
    }
    if (typeof msg.device_connected === 'boolean') {
      this.options.onDeviceConnected?.(msg.device_connected);
    }

    if (typeof msg.type !== 'string') return;

    switch (msg.type) {
      case 'ui_heartbeat_ack':
        if (typeof msg.device_connected === 'boolean') {
          this.options.onDeviceConnected?.(msg.device_connected);
        }
        break;
      case 'telemetry':
        if (msg.payload && typeof msg.payload === 'object') {
          this.options.onTelemetry?.(msg.payload as DeviceTelemetry);
        }
        break;
      case 'session_state':
        if (msg.payload && typeof msg.payload === 'object') {
          this.options.onSessionState?.(msg.payload as SessionState);
        }
        break;
      case 'cmd_ack': {
        const ok = msg.ok === true;
        if (!ok) this.options.onLog?.(`CMD rejected: ${String(msg.reason ?? 'unknown')}`);
        break;
      }
      case 'control_handshake_ack': {
        const ok = msg.ok === true;
        this.options.onLog?.(
          ok
            ? `Handshake OK · executor=${String(msg.gcode_executor_state)}`
            : 'Handshake failed',
        );
        break;
      }
      case 'fail_safe_event':
        this.options.onFailSafe?.(String(msg.reason));
        this.options.onLog?.(`FAIL-SAFE: ${String(msg.reason)}`);
        break;
      case 'device_status':
        if (typeof msg.connected === 'boolean') {
          this.options.onDeviceConnected?.(msg.connected);
          this.options.onLog?.(msg.connected ? 'Device leg connected' : 'Device leg disconnected');
        }
        break;
      case 'scan_pass_sample':
        this.options.onScanSample?.({
          a_deg: Number(msg.a_deg),
          a_load_pct: Number(msg.a_load_pct),
          index: Number(msg.index),
          total: Number(msg.total),
        });
        break;
      case 'scan_pass_result':
        this.options.onScanResult?.(msg);
        this.options.onLog?.('Scan Pass complete');
        break;
      case 'error':
        this.options.onLog?.(`Error: ${String(msg.message)}`);
        break;
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    const beat = () => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
      const payload = {
        type: 'ui_heartbeat',
        session_id: this.options.sessionId ?? null,
        tab_id: this.options.tabId,
        operator_present:
          typeof document !== 'undefined' && document.visibilityState === 'visible',
        run_ack: true,
        page: 'control' as const,
      };
      this.ws.send(JSON.stringify(payload));
    };
    beat();
    this.heartbeatTimer = setInterval(beat, HEARTBEAT_MS);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.disposed || this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, RECONNECT_MS);
  }
}

export function getWorkerWsUrl(path: '/ui/ws' | '/device/ws' = '/ui/ws'): string {
  const base = process.env.NEXT_PUBLIC_WORKER_URL ?? 'http://127.0.0.1:8787';
  return base.replace(/^http/, 'ws') + path;
}

export function getOrCreateTabId(): string {
  if (typeof window === 'undefined') return 'ssr';
  const key = 'heating-cnc-tab-id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}
