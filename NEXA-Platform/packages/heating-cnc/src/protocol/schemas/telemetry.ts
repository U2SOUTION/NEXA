import { z } from 'zod';
import { AModeSchema, RunModeSchema } from './session.js';

export const DeviceTelemetrySchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
  a: z.number(),
  a_mode: AModeSchema,
  a_rpm_actual: z.number().optional(),
  a_load_pct: z.number().optional(),
  voltage: z.number().optional(),
  current: z.number().optional(),
  load_pct: z.number().optional(),
  wire_temp_c: z.number().optional(),
  wire_res_ohm: z.number().optional(),
  pwm_actual: z.number().optional(),
  run_mode: RunModeSchema,
  run_active: z.boolean(),
  gcode_executor_state: z.enum(['IDLE', 'RUNNING', 'SOFT_STOPPING', 'LOCKED', 'PAUSED']),
});
export type DeviceTelemetry = z.infer<typeof DeviceTelemetrySchema>;

export const TelemetryMessageSchema = z.object({
  type: z.literal('telemetry'),
  device_id: z.string(),
  ts: z.number(),
  payload: DeviceTelemetrySchema,
});
export type TelemetryMessage = z.infer<typeof TelemetryMessageSchema>;

export function createDefaultTelemetry(runMode: z.infer<typeof RunModeSchema> = 'ui_sim'): DeviceTelemetry {
  return {
    x: 0,
    y: 0,
    z: 0,
    a: 0,
    a_mode: 'A_IDLE',
    run_mode: runMode,
    run_active: false,
    gcode_executor_state: 'IDLE',
  };
}
