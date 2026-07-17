import {
  MockDeviceEngine,
  WsCommandSchema,
  type DeviceHeartbeat,
  type TriLinkPayload,
  type TriLinkState,
  type UiHeartbeat,
  createDefaultTriLinkState,
} from '@nexa/heating-cnc';

const UI_TTL_MS = 5000;
const DEVICE_TTL_MS = 3000;
const TELEMETRY_INTERVAL_MS = 500;
const WATCHDOG_INTERVAL_MS = 1000;

export class TriLinkSession implements DurableObject {
  private state: TriLinkState;
  private mockEngine: MockDeviceEngine;
  private uiSockets = new Set<WebSocket>();
  private deviceSockets = new Set<WebSocket>();
  private telemetryTimer: ReturnType<typeof setInterval> | null = null;
  private watchdogTimer: ReturnType<typeof setInterval> | null = null;
  private uptimeMs = 0;
  private deviceLegLive = false;

  constructor(_state: DurableObjectState, _env: unknown) {
    this.state = createDefaultTriLinkState('turning-01');
    this.mockEngine = new MockDeviceEngine('ui_sim');
    this.state.run_guard.ui_ttl_ms = UI_TTL_MS;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const leg: 'ui' | 'device' = url.pathname.includes('/device/') ? 'device' : 'ui';

    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      this.acceptSocket(server, leg);
      return new Response(null, { status: 101, webSocket: client });
    }

    return Response.json({
      device_id: this.state.device_id,
      run_mode: this.state.run_mode,
      run_active: this.state.run_active,
      ui_connected: this.state.ui_connected,
      device_connected: this.deviceLegLive,
      session: this.mockEngine.getSessionState(),
    });
  }

  private acceptSocket(ws: WebSocket, leg: 'ui' | 'device'): void {
    ws.accept();

    if (leg === 'ui') {
      this.uiSockets.add(ws);
      this.state.ui_connected = true;
      this.sendToUi(ws, { type: 'session_state', payload: this.mockEngine.getSessionState() });
      this.sendTelemetry(ws);
      this.ensureTimers();
    } else {
      this.deviceSockets.add(ws);
      this.deviceLegLive = true;
      this.forwardToDevice({
        type: 'cmd_set_run_mode',
        seq_id: Date.now(),
        run_mode: this.state.run_mode,
      });
      this.broadcastToUi({ type: 'device_status', connected: true });
      this.syncTelemetryTimer();
    }

    ws.addEventListener('message', (event) => {
      try {
        const msg = JSON.parse(String(event.data)) as { type?: string };
        if (leg === 'ui') {
          this.handleUiMessage(ws, msg);
        } else {
          this.handleDeviceMessage(ws, msg);
        }
      } catch {
        ws.send(JSON.stringify({ type: 'error', message: 'invalid_message' }));
      }
    });

    ws.addEventListener('close', () => {
      if (leg === 'ui') {
        this.uiSockets.delete(ws);
        if (this.uiSockets.size === 0) this.state.ui_connected = false;
      } else {
        this.deviceSockets.delete(ws);
        if (this.deviceSockets.size === 0) {
          this.deviceLegLive = false;
          this.broadcastToUi({ type: 'device_status', connected: false });
          if (this.state.run_active && this.state.run_mode !== 'ui_sim') {
            this.triggerFailSafe('comm_timeout');
          }
        }
      }
      this.cleanupTimers();
      this.syncTelemetryTimer();
    });
  }

  private shouldUseMock(): boolean {
    if (this.state.run_mode === 'ui_sim') return true;
    return this.deviceSockets.size === 0;
  }

  private forwardToDevice(payload: object): void {
    const raw = JSON.stringify(payload);
    for (const ws of this.deviceSockets) {
      try {
        ws.send(raw);
      } catch {
        this.deviceSockets.delete(ws);
      }
    }
  }

  private handleUiMessage(ws: WebSocket, raw: unknown): void {
    const msg = raw as { type?: string };
    if (msg.type === 'ui_heartbeat') {
      const payload = this.onUiHeartbeat(msg as UiHeartbeat);
      ws.send(JSON.stringify({ type: 'ui_heartbeat_ack', tri_link: payload, device_connected: this.deviceLegLive }));
      return;
    }

    const parsed = WsCommandSchema.safeParse(raw);
    if (!parsed.success) {
      ws.send(JSON.stringify({ type: 'error', message: 'unknown_command' }));
      return;
    }

    const cmd = parsed.data;

    // 운영 모드는 서버 권한 — Mock + Device 양쪽 동기화 (heartbeat 덮어쓰기 방지)
    if (cmd.type === 'cmd_set_run_mode') {
      this.mockEngine.setRunMode(cmd.run_mode);
      this.state.run_mode = cmd.run_mode;
      this.state.run_guard.ui_required = cmd.run_mode === 'live' && this.state.run_active;
      if (this.deviceSockets.size > 0) {
        this.forwardToDevice(cmd);
      }
      this.syncTelemetryTimer();
      ws.send(JSON.stringify({ type: 'cmd_ack', seq_id: cmd.seq_id, ok: true, forwarded: this.deviceSockets.size > 0 }));
      this.broadcastTelemetry();
      return;
    }

    if (!this.shouldUseMock()) {
      this.forwardToDevice(cmd);
      ws.send(JSON.stringify({ type: 'cmd_ack', seq_id: cmd.seq_id, ok: true, forwarded: true }));
      return;
    }

    switch (cmd.type) {
      case 'cmd_jog': {
        const result = this.mockEngine.jog(cmd.axis, cmd.delta);
        ws.send(JSON.stringify({ type: 'cmd_ack', seq_id: cmd.seq_id, ok: result.ok, reason: result.reason }));
        if (result.ok) this.broadcastTelemetry();
        break;
      }
      case 'cmd_estop': {
        this.mockEngine.estop();
        this.state.run_active = false;
        ws.send(JSON.stringify({ type: 'cmd_ack', seq_id: cmd.seq_id, ok: true }));
        this.broadcastState();
        this.broadcastTelemetry();
        break;
      }
      case 'cmd_start': {
        const result = this.mockEngine.start();
        this.state.run_active = result.ok && result.telemetry.run_active;
        this.state.run_guard.ui_required = result.telemetry.run_mode === 'live';
        ws.send(JSON.stringify({ type: 'cmd_ack', seq_id: cmd.seq_id, ok: result.ok, reason: result.reason }));
        this.broadcastState();
        this.broadcastTelemetry();
        break;
      }
      case 'cmd_pause': {
        this.mockEngine.pause();
        this.state.run_active = false;
        ws.send(JSON.stringify({ type: 'cmd_ack', seq_id: cmd.seq_id, ok: true }));
        this.broadcastState();
        this.broadcastTelemetry();
        break;
      }
      case 'cmd_set_session': {
        const result = this.mockEngine.setWorkSession(cmd.work_session);
        ws.send(
          JSON.stringify({
            type: 'control_handshake_ack',
            seq_id: cmd.seq_id,
            ok: result.ok,
            gcode_executor_state: result.gcode_executor_state,
            post_process_session_id: result.postProcessSessionId,
          }),
        );
        this.broadcastState();
        break;
      }
      case 'cmd_run': {
        const blocked = this.mockEngine.getSessionState().gcode_executor_state === 'LOCKED';
        ws.send(JSON.stringify({ type: 'cmd_ack', seq_id: cmd.seq_id, ok: !blocked, reason: blocked ? 'executor_locked' : undefined }));
        if (!blocked) {
          this.state.session_id = cmd.session_id;
          const start = this.mockEngine.start();
          this.state.run_active = start.ok;
          this.broadcastState();
          this.broadcastTelemetry();
        }
        break;
      }
      case 'cmd_scan_start': {
        const mode = this.mockEngine.getTelemetry().run_mode;
        if (mode === 'ui_sim') {
          ws.send(JSON.stringify({ type: 'cmd_ack', seq_id: cmd.seq_id, ok: false, reason: 'ui_sim' }));
          break;
        }
        const stepDeg = cmd.scan_a_step_deg ?? 45;
        const samples = this.mockEngine.runScanPass(stepDeg).samples;
        let idx = 0;
        for (const s of samples) {
          this.broadcastToUi({
            type: 'scan_pass_sample',
            a_deg: s.aDeg,
            a_load_pct: s.aLoadPct,
            index: idx,
            total: samples.length,
          });
          idx += 1;
        }
        const scan = this.mockEngine.getLastScan()!;
        ws.send(JSON.stringify({ type: 'cmd_ack', seq_id: cmd.seq_id, ok: true }));
        this.broadcastToUi({
          type: 'scan_pass_result',
          scan_result: {
            irregularity_index: scan.result.irregularityIndex,
            f_nominal: scan.result.fNominal,
            f_adj: scan.result.fAdj,
            skipped: scan.result.skipped,
            aborted: scan.result.aborted,
          },
          eccentricity: {
            e_mount_mm: scan.split.eMountMm,
            e_shape_mm: scan.split.eShapeMm,
            e_mm: scan.split.eMountMm + scan.split.eShapeMm,
            phase_deg: scan.split.phaseDeg,
          },
        });
        this.broadcastTelemetry();
        break;
      }
    }
  }

  private handleDeviceMessage(ws: WebSocket, msg: { type?: string }): void {
    if (msg.type === 'heartbeat') {
      const triLink = this.onDeviceHeartbeat(msg as DeviceHeartbeat);
      ws.send(JSON.stringify({ type: 'heartbeat_ack', tri_link: triLink }));
      return;
    }

    if (msg.type === 'telemetry' && msg.payload && typeof msg.payload === 'object') {
      const payload = { ...(msg.payload as Record<string, unknown>) };
      // Device 텔레메트리의 run_mode는 서버 SSOT로 덮어씀
      payload.run_mode = this.state.run_mode;
      if (typeof payload.run_active === 'boolean') this.state.run_active = payload.run_active;
      this.broadcastTelemetryFromDevice(payload);
      return;
    }

    if (msg.type === 'scan_pass_sample' || msg.type === 'scan_pass_result' || msg.type === 'fail_safe_event') {
      this.broadcastToUi(msg);
    }
  }

  private broadcastTelemetryFromDevice(payload: Record<string, unknown>): void {
    this.broadcastToUi({
      type: 'telemetry',
      device_id: this.state.device_id,
      ts: Date.now(),
      payload: { ...payload, run_active: this.state.run_active },
    });
  }

  onUiHeartbeat(msg: UiHeartbeat): TriLinkPayload {
    this.state.ui_last_seen_ms = Date.now();
    this.state.ui_connected = true;
    this.state.ui_tab_id = msg.tab_id;
    if (msg.session_id !== this.state.session_id && this.state.run_active) {
      this.triggerFailSafe('session_mismatch');
    }
    return this.buildTriLinkPayload();
  }

  onDeviceHeartbeat(msg: DeviceHeartbeat): TriLinkPayload {
    this.state.device_last_seen_ms = Date.now();
    // run_mode는 UI cmd_set_run_mode가 SSOT — heartbeat로 덮어쓰지 않음
    if (msg.run_active != null) this.state.run_active = msg.run_active;
    this.uptimeMs = msg.uptime_ms ?? this.uptimeMs;

    const triLink = this.buildTriLinkPayload();
    if (this.state.run_active && this.state.run_mode === 'live' && this.state.run_guard.ui_required && !triLink.ui_alive) {
      this.triggerFailSafe('ui_timeout');
    }
    return triLink;
  }

  private runWatchdog(): void {
    const now = Date.now();
    const uiAlive = now - this.state.ui_last_seen_ms < UI_TTL_MS;
    const deviceAlive = this.deviceLegLive && now - this.state.device_last_seen_ms < DEVICE_TTL_MS;

    if (this.state.run_active && this.state.run_mode === 'live') {
      if (this.state.run_guard.ui_required && !uiAlive) {
        this.triggerFailSafe('ui_timeout');
        return;
      }
      if (!this.shouldUseMock() && !deviceAlive) {
        this.triggerFailSafe('comm_timeout');
      }
    }
  }

  private triggerFailSafe(reason: string): void {
    if (!this.state.run_active && reason !== 'comm_timeout') return;
    this.state.run_active = false;
    this.mockEngine.estop();
    this.forwardToDevice({ type: 'cmd_estop', seq_id: Date.now() });
    this.broadcastToUi({
      type: 'fail_safe_event',
      reason,
      actions: ['motion_stop', 'm5', 'm211', 'run_abort'],
    });
    this.broadcastState();
    this.broadcastTelemetry();
  }

  private isUiAlive(): boolean {
    return Date.now() - this.state.ui_last_seen_ms < UI_TTL_MS;
  }

  private buildTriLinkPayload(): TriLinkPayload {
    return {
      run_active: this.state.run_active,
      ui_alive: this.isUiAlive(),
      ui_required: this.state.run_guard.ui_required,
      session_id: this.state.session_id,
      server_ts: Date.now(),
    };
  }

  private sendToUi(ws: WebSocket, payload: object): void {
    try {
      ws.send(JSON.stringify(payload));
    } catch {
      this.uiSockets.delete(ws);
    }
  }

  private sendTelemetry(ws: WebSocket): void {
    const t = this.mockEngine.getTelemetry();
    this.sendToUi(ws, {
      type: 'telemetry',
      device_id: this.state.device_id,
      ts: Date.now(),
      payload: { ...t, run_active: this.state.run_active },
    });
  }

  private broadcastToUi(payload: object): void {
    for (const ws of this.uiSockets) {
      this.sendToUi(ws, payload);
    }
  }

  private broadcastTelemetry(): void {
    for (const ws of this.uiSockets) {
      this.sendTelemetry(ws);
    }
  }

  private broadcastState(): void {
    this.broadcastToUi({ type: 'session_state', payload: this.mockEngine.getSessionState() });
  }

  private syncTelemetryTimer(): void {
    const wantMockTelemetry = this.uiSockets.size > 0 && this.shouldUseMock();
    if (wantMockTelemetry && !this.telemetryTimer) {
      this.telemetryTimer = setInterval(() => this.broadcastTelemetry(), TELEMETRY_INTERVAL_MS);
    } else if (!wantMockTelemetry && this.telemetryTimer) {
      clearInterval(this.telemetryTimer);
      this.telemetryTimer = null;
    }
  }

  private ensureTimers(): void {
    this.syncTelemetryTimer();
    if (!this.watchdogTimer) {
      this.watchdogTimer = setInterval(() => this.runWatchdog(), WATCHDOG_INTERVAL_MS);
    }
  }

  private cleanupTimers(): void {
    if (this.uiSockets.size === 0 && this.telemetryTimer) {
      clearInterval(this.telemetryTimer);
      this.telemetryTimer = null;
    }
    if (this.uiSockets.size === 0 && this.deviceSockets.size === 0 && this.watchdogTimer) {
      clearInterval(this.watchdogTimer);
      this.watchdogTimer = null;
    }
  }
}

export { UI_TTL_MS, DEVICE_TTL_MS };
