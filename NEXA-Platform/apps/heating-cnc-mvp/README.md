# Heating CNC MVP v0.1

Cloudflare Workers + Next.js 현장 제어 패널.

## Phase 1 완료 기능

- WebSocket Tri-Link (`/ui/ws`) — `ui_heartbeat` · telemetry · cmd_ack
- `MockDeviceEngine` (Worker DO 내 `ui_sim`)
- Control Handshake — 후공정 진입/복귀 (`cmd_set_session`)
- 반응형 UI — 모바일 / 태블릿 / 데스크톱

## 로컬 실행 (2 터미널)

```bash
# 터미널 1 — Worker
cd NEXA-Platform
npm run dev:heating-cnc-worker

# 터미널 2 — UI
cp apps/heating-cnc-mvp/.env.local.example apps/heating-cnc-mvp/.env.local
npm run dev:heating-cnc-mvp
```

브라우저: http://localhost:3100/machining

## 구조

```text
apps/heating-cnc-mvp/
├── src/hooks/useTriLinkSession.ts
├── src/lib/ws-client.ts
├── src/components/heating-cnc/
├── src/workers/durable-objects/TriLinkSession.ts
└── src/styles/panel.css
```

공유 로직: `packages/heating-cnc` (`@nexa/heating-cnc`)

## D1

```bash
cd apps/heating-cnc-mvp && npm run db:migrate:local
```
