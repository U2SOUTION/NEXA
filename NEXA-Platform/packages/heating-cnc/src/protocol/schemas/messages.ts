import { z } from 'zod';
import { ControlHandshakeAckSchema, CmdAckSchema } from './commands.js';
import { SessionStateSchema, TriLinkPayloadSchema } from './session.js';
import { DeviceTelemetrySchema, TelemetryMessageSchema } from './telemetry.js';

export const UiHeartbeatAckSchema = z.object({
  type: z.literal('ui_heartbeat_ack'),
  tri_link: TriLinkPayloadSchema,
});
export type UiHeartbeatAck = z.infer<typeof UiHeartbeatAckSchema>;

export const SessionStateMessageSchema = z.object({
  type: z.literal('session_state'),
  payload: SessionStateSchema,
});
export type SessionStateMessage = z.infer<typeof SessionStateMessageSchema>;

export const FailSafeEventSchema = z.object({
  type: z.literal('fail_safe_event'),
  reason: z.string(),
  actions: z.array(z.string()),
});
export type FailSafeEvent = z.infer<typeof FailSafeEventSchema>;

export const ScanPassSampleMessageSchema = z.object({
  type: z.literal('scan_pass_sample'),
  a_deg: z.number(),
  a_load_pct: z.number(),
  index: z.number(),
  total: z.number(),
});
export type ScanPassSampleMessage = z.infer<typeof ScanPassSampleMessageSchema>;

export const ScanPassResultMessageSchema = z.object({
  type: z.literal('scan_pass_result'),
  scan_result: z.object({
    irregularity_index: z.number(),
    f_nominal: z.number(),
    f_adj: z.number(),
    skipped: z.boolean(),
    aborted: z.boolean(),
  }),
  eccentricity: z
    .object({
      e_mount_mm: z.number(),
      e_shape_mm: z.number(),
      e_mm: z.number(),
      phase_deg: z.number(),
    })
    .optional(),
});
export type ScanPassResultMessage = z.infer<typeof ScanPassResultMessageSchema>;

export const WsServerMessageSchema = z.discriminatedUnion('type', [
  UiHeartbeatAckSchema,
  TelemetryMessageSchema,
  SessionStateMessageSchema,
  ControlHandshakeAckSchema,
  CmdAckSchema,
  FailSafeEventSchema,
  ScanPassSampleMessageSchema,
  ScanPassResultMessageSchema,
  z.object({ type: z.literal('error'), message: z.string() }),
]);
export type WsServerMessage = z.infer<typeof WsServerMessageSchema>;

export { DeviceTelemetrySchema };
