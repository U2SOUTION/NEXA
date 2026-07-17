/// <reference types="@cloudflare/workers-types" />

export { TriLinkSession } from './durable-objects/TriLinkSession';

export interface Env {
  DB: D1Database;
  TRI_LINK: DurableObjectNamespace;
  DEFAULT_DEVICE_ID: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return Response.json({ ok: true, service: 'heating-cnc-mvp-worker' });
    }

    if (url.pathname === '/api/admin/devices/provision' && request.method === 'POST') {
      return Response.json(
        {
          ok: false,
          stub: true,
          message: 'Phase 2 stub — JWT + device_credentials provisioning not yet implemented',
        },
        { status: 501 },
      );
    }

    if (url.pathname === '/ui/ws' || url.pathname.startsWith('/device/')) {
      const deviceId = env.DEFAULT_DEVICE_ID;
      const id = env.TRI_LINK.idFromName(deviceId);
      const stub = env.TRI_LINK.get(id);
      return stub.fetch(request);
    }

    return new Response('Heating CNC Worker — use /ui/ws or /device/ws', { status: 404 });
  },
};
