import {
  analyzeScanPass,
  decomposeEccentricity,
  type ScanPassResult,
  type ScanSample,
  type SplitEccentricity,
} from '../cam/edge-case-cam.js';
import {
  type AMode,
  type GcodeExecutorState,
  type RunMode,
  type SessionState,
  type WorkSession,
} from '../protocol/schemas/session.js';
import { createDefaultTelemetry, type DeviceTelemetry } from '../protocol/schemas/telemetry.js';
import { generateStallGuardScanSamples } from './StallGuardScan.js';

function newSessionId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `pp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface ScanPassOutput {
  result: ScanPassResult;
  split: SplitEccentricity;
  samples: ScanSample[];
}

export class MockDeviceEngine {
  private telemetry: DeviceTelemetry;
  private seqId = 0;
  private workSession: WorkSession = 'machining';
  private postProcessSessionId: string | null = null;
  private scanning = false;
  private lastScan: ScanPassOutput | null = null;

  constructor(runMode: RunMode = 'ui_sim') {
    this.telemetry = createDefaultTelemetry(runMode);
    this.applyRunModeSideEffects(runMode);
  }

  setRunMode(runMode: RunMode): void {
    this.telemetry.run_mode = runMode;
    this.applyRunModeSideEffects(runMode);
  }

  private applyRunModeSideEffects(runMode: RunMode): void {
    if (runMode === 'device_dry' || runMode === 'ui_sim') {
      this.telemetry.pwm_actual = 0;
    }
    if (runMode === 'ui_sim') {
      this.telemetry.a_load_pct = 0;
    }
  }

  isScanning(): boolean {
    return this.scanning;
  }

  getLastScan(): ScanPassOutput | null {
    return this.lastScan;
  }

  /** Run scan pass — returns samples for progressive UI broadcast. */
  runScanPass(stepDeg = 45, fNominal = 600): ScanPassOutput {
    this.scanning = true;
    this.telemetry.a_mode = 'A_VEL';
    const samples = generateStallGuardScanSamples({ stepDeg });
    const result = analyzeScanPass(samples, fNominal);
    const split = decomposeEccentricity({
      scanSamples: samples,
      irregularityIndex: result.irregularityIndex,
    });
    this.lastScan = { result, split, samples };
    this.telemetry.a_load_pct = Math.max(...samples.map((s) => s.aLoadPct));
    this.telemetry.a_mode = 'A_IDLE';
    this.scanning = false;
    return this.lastScan;
  }

  getWorkSession(): WorkSession {
    return this.workSession;
  }

  setWorkSession(session: WorkSession): {
    ok: boolean;
    postProcessSessionId?: string;
    gcode_executor_state: GcodeExecutorState;
  } {
    if (session === 'manual_overdrive') {
      this.workSession = session;
      this.telemetry.gcode_executor_state = 'LOCKED';
      this.postProcessSessionId = newSessionId();
      this.telemetry.run_active = false;
      this.telemetry.pwm_actual = 0;
      return {
        ok: true,
        postProcessSessionId: this.postProcessSessionId,
        gcode_executor_state: 'LOCKED',
      };
    }

    this.workSession = 'machining';
    this.postProcessSessionId = null;
    if (this.telemetry.gcode_executor_state === 'LOCKED') {
      this.telemetry.gcode_executor_state = 'IDLE';
    }
    return { ok: true, gcode_executor_state: this.telemetry.gcode_executor_state };
  }

  jog(
    axis: 'X' | 'Y' | 'Z' | 'A',
    delta: number,
  ): { ok: boolean; telemetry: DeviceTelemetry; reason?: string } {
    if (this.scanning) {
      return { ok: false, telemetry: this.getTelemetry(), reason: 'scan_active' };
    }
    if (this.telemetry.gcode_executor_state === 'RUNNING' && this.workSession === 'machining') {
      return { ok: false, telemetry: this.getTelemetry(), reason: 'run_active' };
    }
    const key = axis.toLowerCase() as 'x' | 'y' | 'z' | 'a';
    this.telemetry[key] += delta;
    if (axis === 'A' && this.telemetry.run_mode !== 'ui_sim') {
      this.telemetry.a_load_pct = Math.min(99, (this.telemetry.a_load_pct ?? 0) + Math.abs(delta) * 2);
    }
    this.seqId += 1;
    return { ok: true, telemetry: this.getTelemetry() };
  }

  estop(): DeviceTelemetry {
    this.telemetry.run_active = false;
    this.telemetry.gcode_executor_state = 'LOCKED';
    this.telemetry.pwm_actual = 0;
    this.scanning = false;
    this.seqId += 1;
    return this.getTelemetry();
  }

  start(): { ok: boolean; telemetry: DeviceTelemetry; reason?: string } {
    if (this.workSession === 'manual_overdrive') {
      return { ok: false, telemetry: this.getTelemetry(), reason: 'executor_locked' };
    }
    if (this.telemetry.gcode_executor_state === 'LOCKED') {
      return { ok: false, telemetry: this.getTelemetry(), reason: 'executor_locked' };
    }
    this.telemetry.run_active = true;
    this.telemetry.gcode_executor_state = 'RUNNING';
    if (this.telemetry.run_mode === 'live') {
      this.telemetry.pwm_actual = 400;
    } else {
      this.telemetry.pwm_actual = 0;
    }
    this.seqId += 1;
    return { ok: true, telemetry: this.getTelemetry() };
  }

  pause(): DeviceTelemetry {
    this.telemetry.run_active = false;
    this.telemetry.gcode_executor_state = 'PAUSED';
    this.telemetry.pwm_actual = 0;
    this.seqId += 1;
    return this.getTelemetry();
  }

  getTelemetry(): DeviceTelemetry {
    return { ...this.telemetry };
  }

  getSeqId(): number {
    return this.seqId;
  }

  getPostProcessSessionId(): string | null {
    return this.postProcessSessionId;
  }

  getSessionState(): SessionState {
    return {
      work_session: this.workSession,
      post_process_session_id: this.postProcessSessionId ?? undefined,
      gcode_executor_state: this.telemetry.gcode_executor_state,
      a_submode: this.telemetry.a_mode as AMode,
      coords: {
        x: this.telemetry.x,
        y: this.telemetry.y,
        z: this.telemetry.z,
        a: this.telemetry.a,
      },
      heater_lock: this.workSession === 'manual_overdrive',
      foot_armed: false,
    };
  }
}
