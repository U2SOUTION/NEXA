import { z } from 'zod';

/** [03] 운영 모드 3단계 */
export const RunModeSchema = z.enum(['ui_sim', 'device_dry', 'live']);
export type RunMode = z.infer<typeof RunModeSchema>;

/** [03] 연결 모드 3단계 */
export const CommModeSchema = z.enum(['cloud', 'local_ap', 'sd_offline']);
export type CommMode = z.infer<typeof CommModeSchema>;

/** [03] work_session — 가공 vs 후공정 */
export const WorkSessionSchema = z.enum(['machining', 'manual_overdrive']);
export type WorkSession = z.infer<typeof WorkSessionSchema>;

/** [03] G-code Executor 상태 */
export const GcodeExecutorStateSchema = z.enum([
  'IDLE',
  'RUNNING',
  'SOFT_STOPPING',
  'LOCKED',
  'PAUSED',
]);
export type GcodeExecutorState = z.infer<typeof GcodeExecutorStateSchema>;

/** [01] A축 모드 */
export const AModeSchema = z.enum(['A_IDLE', 'A_POS', 'A_VEL']);
export type AMode = z.infer<typeof AModeSchema>;

export const TriLinkStateSchema = z.object({
  device_id: z.string(),
  session_id: z.string().nullable(),
  run_active: z.boolean(),
  run_mode: RunModeSchema,
  ui_connected: z.boolean(),
  ui_last_seen_ms: z.number(),
  device_last_seen_ms: z.number(),
  ui_tab_id: z.string().nullable(),
  run_guard: z.object({
    ui_required: z.boolean(),
    ui_ttl_ms: z.number(),
  }),
});
export type TriLinkState = z.infer<typeof TriLinkStateSchema>;

export const TriLinkPayloadSchema = z.object({
  run_active: z.boolean(),
  ui_alive: z.boolean(),
  ui_required: z.boolean(),
  session_id: z.string().nullable(),
  server_ts: z.number(),
});
export type TriLinkPayload = z.infer<typeof TriLinkPayloadSchema>;

export const SessionStateSchema = z.object({
  work_session: WorkSessionSchema,
  post_process_session_id: z.string().optional(),
  gcode_executor_state: GcodeExecutorStateSchema,
  a_submode: AModeSchema,
  coords: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
    a: z.number(),
  }),
  heater_lock: z.boolean(),
  foot_armed: z.boolean(),
});
export type SessionState = z.infer<typeof SessionStateSchema>;

export const UiHeartbeatSchema = z.object({
  type: z.literal('ui_heartbeat'),
  session_id: z.string().nullable(),
  tab_id: z.string(),
  operator_present: z.boolean(),
  run_ack: z.boolean(),
  page: z.enum(['control', 'thermal-lab', 'post-process', 'recipes']).optional(),
});
export type UiHeartbeat = z.infer<typeof UiHeartbeatSchema>;

export const DeviceHeartbeatSchema = z.object({
  type: z.literal('heartbeat'),
  device_id: z.string(),
  uptime_ms: z.number(),
  run_mode: RunModeSchema.optional(),
  comm_seq: z.number().optional(),
  run_active: z.boolean().optional(),
  last_exec_seq_id: z.number().optional(),
});
export type DeviceHeartbeat = z.infer<typeof DeviceHeartbeatSchema>;

export function createDefaultTriLinkState(deviceId: string): TriLinkState {
  return {
    device_id: deviceId,
    session_id: null,
    run_active: false,
    run_mode: 'ui_sim',
    ui_connected: false,
    ui_last_seen_ms: 0,
    device_last_seen_ms: 0,
    ui_tab_id: null,
    run_guard: { ui_required: false, ui_ttl_ms: 5000 },
  };
}
