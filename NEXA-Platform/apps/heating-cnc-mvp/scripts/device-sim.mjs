/**
 * Heating CNC — Device leg simulator (Phase 2)
 * Connects to wrangler dev as ESP32 device: ws://127.0.0.1:8787/device/ws
 *
 * Usage:
 *   node scripts/device-sim.mjs
 *   node scripts/device-sim.mjs --mode device_dry
 */

import WebSocket from 'ws';

const args = process.argv.slice(2);
const modeIdx = args.indexOf('--mode');
const RUN_MODE = modeIdx >= 0 ? args[modeIdx + 1] : 'device_dry';
const WS_URL = process.env.DEVICE_WS_URL ?? 'ws://127.0.0.1:8787/device/ws';
const DEVICE_ID = 'turning-01';

const state = {
  x: 0,
  y: 0,
  z: 0,
  a: 0,
  run_mode: RUN_MODE,
  run_active: false,
  gcode_executor_state: 'IDLE',
  a_mode: 'A_IDLE',
  a_load_pct: 0,
  pwm_actual: 0,
};

let uptimeMs = 0;
let seqId = 0;

function telemetry() {
  return {
    type: 'telemetry',
    device_id: DEVICE_ID,
    ts: Date.now(),
    payload: {
      ...state,
      voltage: 12.1,
      current: state.pwm_actual > 0 ? 2.1 : 0,
      wire_temp_c: state.pwm_actual > 0 ? 280 : 25,
    },
  };
}

function handleCommand(cmd) {
  seqId = cmd.seq_id ?? seqId;
  switch (cmd.type) {
    case 'cmd_jog': {
      const key = cmd.axis.toLowerCase();
      const delta = cmd.delta;
      if (state.gcode_executor_state === 'RUNNING') break;
      state[key] += delta;
      if (cmd.axis === 'A') state.a_load_pct = Math.min(90, state.a_load_pct + Math.abs(delta));
      break;
    }
    case 'cmd_estop':
      state.run_active = false;
      state.gcode_executor_state = 'LOCKED';
      state.pwm_actual = 0;
      break;
    case 'cmd_start':
      if (state.gcode_executor_state !== 'LOCKED') {
        state.run_active = true;
        state.gcode_executor_state = 'RUNNING';
        state.pwm_actual = state.run_mode === 'live' ? 400 : 0;
      }
      break;
    case 'cmd_pause':
      state.run_active = false;
      state.gcode_executor_state = 'PAUSED';
      state.pwm_actual = 0;
      break;
    case 'cmd_set_run_mode':
      state.run_mode = cmd.run_mode;
      state.pwm_actual = 0;
      break;
    case 'cmd_scan_start': {
      const step = cmd.scan_a_step_deg ?? 45;
      const total = Math.floor(360 / step);
      for (let i = 0; i < total; i++) {
        const aDeg = i * step;
        const load = 28 + Math.round(20 * (0.5 + 0.5 * Math.sin((aDeg * Math.PI) / 180)));
        ws.send(
          JSON.stringify({
            type: 'scan_pass_sample',
            a_deg: aDeg,
            a_load_pct: load,
            index: i,
            total,
          }),
        );
      }
      ws.send(
        JSON.stringify({
          type: 'scan_pass_result',
          scan_result: {
            irregularity_index: 0.42,
            f_nominal: 600,
            f_adj: 420,
            skipped: false,
            aborted: false,
          },
          eccentricity: { e_mount_mm: 0.1, e_shape_mm: 0.35, e_mm: 0.45, phase_deg: 90 },
        }),
      );
      break;
    }
    default:
      break;
  }
  ws.send(JSON.stringify(telemetry()));
}

console.log(`[device-sim] connecting ${WS_URL} mode=${RUN_MODE}`);

const ws = new WebSocket(WS_URL);

ws.on('open', () => {
  console.log('[device-sim] connected');
  setInterval(() => {
    uptimeMs += 500;
    ws.send(
      JSON.stringify({
        type: 'heartbeat',
        device_id: DEVICE_ID,
        uptime_ms: uptimeMs,
        run_mode: state.run_mode,
        run_active: state.run_active,
        comm_seq: Math.floor(uptimeMs / 500),
      }),
    );
  }, 500);
});

ws.on('message', (data) => {
  try {
    const msg = JSON.parse(String(data));
    if (msg.type === 'heartbeat_ack') return;
    if (msg.type?.startsWith('cmd_')) handleCommand(msg);
  } catch (e) {
    console.error('[device-sim] parse error', e);
  }
});

ws.on('close', () => {
  console.log('[device-sim] disconnected');
  process.exit(0);
});

ws.on('error', (err) => {
  console.error('[device-sim] error', err.message);
});
