---
doc_id: 
title: ""
category: ""
domain: 
status: draft
created: 2026-07-17
updated: 2026-07-18
parent_doc: 
implements_doc: 
see_also: []
terms_standard: []
terms_nexa: []
---

# Heating CNC MVP v0.1

Cloudflare Workers + Next.js 현장 제어 패널.

## Phase 1 완료 기능

- WebSocket Tri-Link (`/ui/ws`) — `ui_heartbeat` · telemetry · cmd_ack
- `MockDeviceEngine` (Worker DO 내 `ui_sim`)
- Control Handshake — 후공정 진입/복귀 (`cmd_set_session`)
- 반응형 UI — 모바일 / 태블릿 / 데스크톱

## Phase 2 완료 기능

- **Device leg** — `/device/ws` (ESP32 또는 `device-sim`)
- **Tri-Link Fail-safe** — UI 5s / Device 3s watchdog → `fail_safe_event`
- **운영 모드** — `device_dry` (PWM=0) · device 연결 상태 배너
- **StallGuard Scan** — `cmd_scan_start` → `scan_pass_sample` / `scan_pass_result`
- **Provisioning API 스텁** — `POST /api/admin/devices/provision` (501)
- **펌웨어 스캐폴드** — `NEXA-Edeg/heating-cnc/` (PlatformIO)

## 로컬 실행 (3 터미널 — device_dry 테스트 시)

```bash
# 터미널 1 — Worker
cd NEXA-Platform
npm run dev:heating-cnc-worker

# 터미널 2 — UI
npm run dev:heating-cnc-mvp

# 청크 오류(383.js 등) 발생 시 — .next 캐시 삭제 후 재시작
npm run dev:clean -w heating-cnc-mvp

# 터미널 3 — Device sim (선택, device_dry/live 모드)
npm run device:sim -w heating-cnc-mvp
# 또는: npm run device:sim -w heating-cnc-mvp -- --mode device_dry
```

브라우저: <http://localhost:3100/machining>

1. 운영 모드를 `device_dry` 로 전환
2. device-sim 실행 시 Tri-Link 3 번째 점 (Device) 녹색
3. **Scan 시작** → 부하 샘플 진행바 → F 보정 결과

`NEXT_PUBLIC_WORKER_URL` 미설정 시 기본 `http://127.0.0.1:8787`.

## 구조

```text
apps/heating-cnc-mvp/
├── scripts/device-sim.mjs          # ESP32 대체 Node WS 클라이언트
├── src/hooks/useTriLinkSession.ts
├── src/lib/ws-client.ts
├── src/components/heating-cnc/
│   ├── RunModeBanner.tsx
│   ├── ScanPassCard.tsx
│   └── …
├── src/workers/durable-objects/TriLinkSession.ts
└── src/styles/panel.css
```

공유 로직: `packages/heating-cnc` (`@nexa/heating-cnc`)

## D1

```bash
cd apps/heating-cnc-mvp && npm run db:migrate:local
```

## 테스트

```bash
cd NEXA-Platform
npm run test:heating-cnc
npm run build:heating-cnc
npm run device:sim -w heating-cnc-mvp
```

~
