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
const DEVICE_SIM_INTERVAL_MS = 500;

export class TriLinkSession implements DurableObject {
  private state: TriLinkState;
  private mockEngine: MockDeviceEngine;
  private uiSockets = new Set<WebSocket>();
  private deviceSockets = new Set<WebSocket>();
  private telemetryTimer: ReturnType<typeof setInterval> | null = null;
  private deviceSimTimer: ReturnType<typeof setInterval> | null = null;
  private uptimeMs = 0;

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
      this.stopDeviceSim();
    }

    ws.addEventListener('message', (event) => {
      try {
        const msg = JSON.parse(String(event.data)) as { type?: string };
        if (leg === 'ui') {
          this.handleUiMessage(ws, msg);
        } else if (msg.type === 'heartbeat') {
          const triLink = this.onDeviceHeartbeat(msg as DeviceHeartbeat);
          ws.send(JSON.stringify({ type: 'heartbeat_ack', tri_link: triLink }));
        }
      } catch {
        ws.send(JSON.stringify({ type: 'error', message: 'invalid_message' }));
      }
    });

    ws.addEventListener('close', () => {
      if (leg === 'ui') {
        this.uiSockets.delete(ws);
        if (this.uiSockets.size === 0) {
          this.state.ui_connected = false;
        }
      } else {
        this.deviceSockets.delete(ws);
        if (this.deviceSockets.size === 0 && this.mockEngine.getTelemetry().run_mode === 'ui_sim') {
          this.startDeviceSim();
        }
      }
      this.cleanupTimers();
    });
  }

  private handleUiMessage(ws: WebSocket, raw: unknown): void {
    const msg = raw as { type?: string };
    if (msg.type === 'ui_heartbeat') {
      const payload = this.onUiHeartbeat(msg as UiHeartbeat);
      ws.send(JSON.stringify({ type: 'ui_heartbeat_ack', tri_link: payload }));
      return;
    }

    const parsed = WsCommandSchema.safeParse(raw);
    if (!parsed.success) {
      ws.send(JSON.stringify({ type: 'error', message: 'unknown_command' }));
      return;
    }

    const cmd = parsed.data;
    switch (cmd.type) {
      case 'cmd_jog': {
        const result = this.mockEngine.jog(cmd.axis, cmd.delta);
        ws.send(
          JSON.stringify({
            type: 'cmd_ack',
            seq_id: cmd.seq_id,
            ok: result.ok,
            reason: result.reason,
          }),
        );
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
        ws.send(
          JSON.stringify({
            type: 'cmd_ack',
            seq_id: cmd.seq_id,
            ok: result.ok,
            reason: result.reason,
          }),
        );
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
      case 'cmd_set_run_mode': {
        this.mockEngine.setRunMode(cmd.run_mode);
        this.state.run_mode = cmd.run_mode;
        this.state.run_guard.ui_required = cmd.run_mode === 'live' && this.state.run_active;
        ws.send(JSON.stringify({ type: 'cmd_ack', seq_id: cmd.seq_id, ok: true }));
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
        ws.send(
          JSON.stringify({
            type: 'cmd_ack',
            seq_id: cmd.seq_id,
            ok: !blocked,
            reason: blocked ? 'executor_locked' : undefined,
          }),
        );
        if (!blocked) {
          this.state.session_id = cmd.session_id;
          const start = this.mockEngine.start();
          this.state.run_active = start.ok;
          this.broadcastState();
          this.broadcastTelemetry();
        }
        break;
      }
    }
  }

  onUiHeartbeat(msg: UiHeartbeat): TriLinkPayload {
    this.state.ui_last_seen_ms = Date.now();
    this.state.ui_connected = true;
    this.state.ui_tab_id = msg.tab_id;
    if (msg.session_id !== this.state.session_id && this.state.run_active) {
      this.triggerGhostJob('session_mismatch');
    }
    return this.buildTriLinkPayload();
  }

  onDeviceHeartbeat(msg: DeviceHeartbeat): TriLinkPayload {
    this.state.device_last_seen_ms = Date.now();
    if (msg.run_mode) {
      this.state.run_mode = msg.run_mode;
      this.mockEngine.setRunMode(msg.run_mode);
    }
    if (msg.run_active != null) this.state.run_active = msg.run_active;

    const triLink = this.buildTriLinkPayload();
    if (
      this.state.run_active &&
      this.state.run_mode === 'live' &&
      this.state.run_guard.ui_required &&
      !triLink.ui_alive
    ) {
      this.triggerGhostJob('ui_timeout');
    }
    return triLink;
  }

  private triggerGhostJob(reason: string): void {
    this.state.run_active = false;
    this.mockEngine.pause();
    this.mockEngine.estop();
    const event = {
      type: 'fail_safe_event',
      reason,
      actions: ['motion_stop', 'm5', 'run_abort'],
    };
    this.broadcastToUi(event);
    this.broadcastState();
    this.broadcastTelemetry();
  }

  private isUiAlive(): boolean {
    return Date.now() - this.state.ui_last_seen_ms < UI_TTL_MS;
  }

  private isDeviceAlive(): boolean {
    if (this.deviceSockets.size > 0) {
      return Date.now() - this.state.device_last_seen_ms < DEVICE_TTL_MS;
    }
    return this.mockEngine.getTelemetry().run_mode === 'ui_sim';
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

  private ensureTimers(): void {
    if (!this.telemetryTimer && this.uiSockets.size > 0) {
      this.telemetryTimer = setInterval(() => this.broadcastTelemetry(), TELEMETRY_INTERVAL_MS);
    }
    if (this.deviceSockets.size === 0 && this.mockEngine.getTelemetry().run_mode === 'ui_sim') {
      this.startDeviceSim();
    }
  }

  private cleanupTimers(): void {
    if (this.uiSockets.size === 0 && this.telemetryTimer) {
      clearInterval(this.telemetryTimer);
      this.telemetryTimer = null;
    }
    if (this.uiSockets.size === 0 && this.deviceSockets.size === 0) {
      this.stopDeviceSim();
    }
  }

  private startDeviceSim(): void {
    if (this.deviceSimTimer) return;
    this.deviceSimTimer = setInterval(() => {
      this.uptimeMs += DEVICE_SIM_INTERVAL_MS;
      this.state.device_last_seen_ms = Date.now();
      const triLink = this.buildTriLinkPayload();
      for (const ws of this.uiSockets) {
        this.sendToUi(ws, {
          type: 'heartbeat_ack',
          tri_link: triLink,
          simulated: true,
        });
      }
    }, DEVICE_SIM_INTERVAL_MS);
  }

  private stopDeviceSim(): void {
    if (this.deviceSimTimer) {
      clearInterval(this.deviceSimTimer);
      this.deviceSimTimer = null;
    }
  }
}

export { UI_TTL_MS, DEVICE_TTL_MS };
