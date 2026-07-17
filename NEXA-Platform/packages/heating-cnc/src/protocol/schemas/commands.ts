import { z } from 'zod';
import { RunModeSchema } from './session.js';

export const CmdJogSchema = z.object({
  type: z.literal('cmd_jog'),
  seq_id: z.number(),
  axis: z.enum(['X', 'Y', 'Z', 'A']),
  delta: z.number(),
  feed: z.number().optional(),
});
export type CmdJog = z.infer<typeof CmdJogSchema>;

export const CmdSetSessionSchema = z.object({
  type: z.literal('cmd_set_session'),
  seq_id: z.number(),
  work_session: z.enum(['machining', 'manual_overdrive']),
  utility_preset: z.string().optional(),
});
export type CmdSetSession = z.infer<typeof CmdSetSessionSchema>;

export const CmdRunSchema = z.object({
  type: z.literal('cmd_run'),
  seq_id: z.number(),
  session_id: z.string(),
  run_mode: RunModeSchema,
  gcode_chunk: z.string().optional(),
  recipe_id: z.number().optional(),
});
export type CmdRun = z.infer<typeof CmdRunSchema>;

export const CmdEstopSchema = z.object({
  type: z.literal('cmd_estop'),
  seq_id: z.number(),
});
export type CmdEstop = z.infer<typeof CmdEstopSchema>;

export const CmdStartSchema = z.object({
  type: z.literal('cmd_start'),
  seq_id: z.number(),
});
export type CmdStart = z.infer<typeof CmdStartSchema>;

export const CmdPauseSchema = z.object({
  type: z.literal('cmd_pause'),
  seq_id: z.number(),
});
export type CmdPause = z.infer<typeof CmdPauseSchema>;

export const CmdSetRunModeSchema = z.object({
  type: z.literal('cmd_set_run_mode'),
  seq_id: z.number(),
  run_mode: RunModeSchema,
});
export type CmdSetRunMode = z.infer<typeof CmdSetRunModeSchema>;

export const CmdScanStartSchema = z.object({
  type: z.literal('cmd_scan_start'),
  seq_id: z.number(),
  scan_a_step_deg: z.number().optional(),
});
export type CmdScanStart = z.infer<typeof CmdScanStartSchema>;

export const ControlHandshakeAckSchema = z.object({
  type: z.literal('control_handshake_ack'),
  seq_id: z.number(),
  ok: z.boolean(),
  gcode_executor_state: z.enum(['IDLE', 'RUNNING', 'SOFT_STOPPING', 'LOCKED', 'PAUSED']),
  post_process_session_id: z.string().optional(),
});
export type ControlHandshakeAck = z.infer<typeof ControlHandshakeAckSchema>;

export const WsCommandSchema = z.discriminatedUnion('type', [
  CmdJogSchema,
  CmdSetSessionSchema,
  CmdRunSchema,
  CmdEstopSchema,
  CmdStartSchema,
  CmdPauseSchema,
  CmdSetRunModeSchema,
  CmdScanStartSchema,
]);
export type WsCommand = z.infer<typeof WsCommandSchema>;

export const CmdAckSchema = z.object({
  type: z.literal('cmd_ack'),
  seq_id: z.number(),
  ok: z.boolean(),
  reason: z.string().optional(),
});
export type CmdAck = z.infer<typeof CmdAckSchema>;
