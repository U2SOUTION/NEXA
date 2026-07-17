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

export const WsServerMessageSchema = z.discriminatedUnion('type', [
  UiHeartbeatAckSchema,
  TelemetryMessageSchema,
  SessionStateMessageSchema,
  ControlHandshakeAckSchema,
  CmdAckSchema,
  FailSafeEventSchema,
  z.object({ type: z.literal('error'), message: z.string() }),
]);
export type WsServerMessage = z.infer<typeof WsServerMessageSchema>;

export { DeviceTelemetrySchema };
