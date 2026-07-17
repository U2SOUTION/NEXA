---
doc_id:
title: "Heating CNC — Project Structure (NEXA Monorepo)"
category: "IoT / Manufacturing"
domain: controller
status: draft
created: 2026-07-07
updated: 2026-07-08
parent_doc: "README.md"
implements_doc:
see_also:
  - "README.md"
  - "00-Vision-Overview.md"
  - "03-Software-Protocol.md"
  - "05-GCode-CAM-Pipeline.md"
  - "../../../08_TDD/NEXAOS/08_TDD_NEXAOS_모노레포폴더구조_v1.0.md"
terms_standard: []
terms_nexa: []
---

# Project Structure — NEXA 모노레포 배치

Hot-Blade Turning Machine(Heating CNC) 의 **현재 설계 산출물**과 **NEXA 모노레포 To-Be 코드 배치**를 정의합니다.

- 모노레포 공통 규칙 (현행 레포): [`NEXA-Platform/docs/rules/project-structure.md`](../../NEXA-Platform/docs/rules/project-structure.md)
- **NEXA OS Greenfield SSOT**: [TDD-007 `08_TDD_NEXAOS_모노레포폴더구조_v1.0`](../08_TDD/NEXAOS/08_TDD_NEXAOS_%EB%AA%A8%EB%85%B8%EB%A0%88%ED%8F%AC%ED%8F%B4%EB%8D%94%EA%B5%AC%EC%A1%B0_v1.0.md)

> **원칙**: 스펙 문서 (`00`–`10`) 는 SSOT. 구현은 문서가 가리키는 경로로 이식하며, `domains/` → `system/` 단방향 의존을 따릅니다.
> **이중 기준**: 본 문서는 **① 현행 Platform** (`src/`·`server/`·`apps/bax-demo`) 과 **② TDD-007 목표** (`apps/web`·`apps/backend`·`packages/shared`) 를 **병기**합니다. Phase 2 이행 시 [§11](#11-tdd-007-정합성-검토-2026-07-08) 경로를 우선합니다.

---

## 1. 현재 상태 (As-Is)

설계 단계 산출물은 **NEXA V2.0 인박스**에 모여 있습니다.

```text
NEXA/
└── NEXA V2.0/
    └── APP_V2.0/
        └── _inbox/
            └── Heating_CNC/                    ← 본 모듈 (현재 위치)
                ├── README.md                   # 모듈 인덱스
                ├── 00-Vision-Overview.md
                ├── 01-Hardware-Motion.md
                ├── 02-Thermal-Engine-Sensing.md
                ├── 03-Software-Protocol.md
                ├── 04-Data-Operations.md
                ├── 05-GCode-CAM-Pipeline.md
                ├── 06-Auth-Security.md
                ├── 07-Mechanical-Specs.md
                ├── 08-Project-Structure.md     # 본 문서
                ├── 10-Operational-Safety.md
                └── _ref/                       # 구현 전 TypeScript·UI 스텁
                    ├── edge-case-cam.ts
                    └── ScanPassCard.tsx
```

| 구분       | 상태                     | 비고                   |
| :--------- | :----------------------- | :--------------------- |
| **문서**   | `00`–`07`, `10` + README | canonical 스펙         |
| **코드**   | `_ref/` 2 파일만         | MVP 착수 전            |
| **펌웨어** | 스펙만 (`01`, `07`)      | `NEXA-Edge` 미착수     |
| **UI·API** | 스펙만 (`03`, `04`)      | Platform 도메인 미착수 |

---

## 2. NEXA 모노레포 맥락

```text
NEXA/                                           # Git 루트
├── NEXA-Platform/                              # Quasar + Vue 3 SPA + Express API
│   ├── src/                                    # domains / engines / frame / system (4축 고정)
│   ├── server/                                 # REST · 도메인 서비스 · middleware
│   ├── apps/                                   # 독립 데모·MVP 앱 (예: bax-demo)
│   ├── packages/                               # (To-Be) 도메인 공유 TS 패키지
│   └── docs/                                   # inbox → refined → specs
├── NEXA-Edge/                                  # ESP32 · PlatformIO 펌웨어 (리포: NEXA-Edeg)
├── NEXA-Desktop/
├── NEXA-App/
├── DEV/
└── NEXA V2.0/                                  # 기획·TDD 인박스 (현재 Heating_CNC 위치)
```

| 레이어                   | Heating CNC 역할                                                |
| :----------------------- | :-------------------------------------------------------------- |
| **NEXA-Platform**        | Phase 2 정식 UI·API·MES 연동                                    |
| **NEXA-Platform/apps**   | MVP v0.1 현장 패널 (Cloudflare Pages 배포 후보)                 |
| **packages/heating-cnc** | Workers·UI·서버 **공유** 도메인 로직 (CAM·열엔진·프로토콜 타입) |
| **NEXA-Edge**            | DLC32 + FluidNC 커스텀 · Tri-Link · Manual Overdrive 펌웨어     |
| **docs/specs**           | Rivet 파이프라인 확정 SSOT (인박스 이전 목적지)                 |

---

## 3. To-Be — 전체 배치 지도

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  docs/specs/manufacturing/heating-cnc/     ← 00~10 스펙 (SSOT)              │
└─────────────────────────────────────────────────────────────────────────────┘
         │                              │                         │
         ▼                              ▼                         ▼
┌─────────────────┐          ┌──────────────────────┐   ┌─────────────────────┐
│ packages/       │          │ apps/heating-cnc-mvp │   │ NEXA-Edge/          │
│ heating-cnc/    │◄─────────│ (MVP UI + CF Pages)  │   │ heating-cnc/        │
│ cam·thermal·    │  import  │ workers/ (번들)      │   │ fluidnc-custom/     │
│ protocol·schemas│          └──────────┬───────────┘   └──────────┬──────────┘
└────────┬────────┘                     │ WSS                        │ WSS
         │                              ▼                            │
         │                   ┌──────────────────────┐                 │
         └──────────────────►│ Cloudflare Workers │◄────────────────┘
                             │ TriLinkSession DO    │
                             │ D1 / KV              │
                             └──────────────────────┘
         │
         ▼ (Phase 2)
┌─────────────────────────────────────────────────────────────────────────────┐
│ NEXA-Platform/src/domains/heating-cnc/   UI (Quasar)                        │
│ NEXA-Platform/server/domains/heating-cnc/  REST · WS 프록시 · PostgreSQL    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. 상세 디렉터리 (To-Be)

### 4.1 문서 — `NEXA-Platform/docs/`

Rivet 생애주기: `inbox` → `refined` → **`specs`** ([project-structure §4](../../NEXA-Platform/docs/rules/project-structure.md))

```text
NEXA-Platform/docs/
├── inbox/                                      # (현재) NEXA V2.0/_inbox/Heating_CNC
└── specs/
    └── manufacturing/
        └── heating-cnc/                        # To-Be SSOT
            ├── README.md
            ├── 00-Vision-Overview.md
            ├── … (01~07, 08, 10)
            └── _ref/                           # 이식 완료 후 삭제 또는 examples/ 로 격하
```

| 문서 | 주제            | 주요 구현 대상                     |
| :--: | :-------------- | :--------------------------------- |
|  00  | 비전·MVP/Phase2 | —                                  |
|  01  | 하드웨어·모션   | `NEXA-Edge`                        |
|  02  | 열엔진·센서     | `packages/…/thermal/`              |
|  03  | 프로토콜·WS     | `packages/…/protocol/` · Workers   |
|  04  | D1·UI·운영      | MVP UI · `server/` · migrations    |
|  05  | CAM·G-code      | `packages/…/cam/` · `gcode/`       |
|  06  | 인증·RBAC       | `server/domains/heating-cnc/auth/` |
|  07  | 기계 사양       | `NEXA-Edge` · CAD 첨부             |
|  08  | **본 문서**     | —                                  |
|  10  | 운영 안전       | UI 배너 · 현장 체크리스트          |

---

### 4.2 공유 패키지 — `packages/heating-cnc/`

Workers·MVP 앱·Phase 2 Platform 이 **동일 로직**을 import 합니다.
[`05-GCode-CAM-Pipeline`](05-GCode-CAM-Pipeline.md) · [`_ref/`](_ref/) 에 명시된 배포 목표.

```text
NEXA-Platform/packages/heating-cnc/
├── package.json                                # name: "@nexa/heating-cnc"
├── tsconfig.json
├── src/
│   ├── index.ts                                # 공개 API barrel
│   │
│   ├── cam/                                    # [05] Edge Case CAM
│   │   ├── edge-case-cam.ts                    # ← _ref/edge-case-cam.ts
│   │   ├── decomposeEccentricity.ts
│   │   ├── buildPassFeedPlan.ts
│   │   └── material-aware.ts
│   │
│   ├── gcode/                                  # [05] GCode Pipeline
│   │   ├── GCodeInterpreter.ts
│   │   ├── chunker.ts
│   │   └── hfs/                                # Heat-Feed Sync 상태기
│   │       └── RunOrchestrator.ts
│   │
│   ├── thermal/                                # [02] ThermalCutterEngine
│   │   ├── ThermalCutterEngine.ts
│   │   ├── ThermalInertiaModel.ts
│   │   ├── ThermalCalibrator.ts
│   │   └── WireHealthMonitor.ts
│   │
│   ├── motion/                                 # [01] StallGuard · A축
│   │   ├── StallGuardLoadModel.ts
│   │   └── rpmSCurve.ts                        # Manual Overdrive S-Curve
│   │
│   ├── protocol/                               # [03] WS·REST 타입 (Zod)
│   │   ├── schemas/
│   │   │   ├── session.ts                      # work_session · Control Handshake
│   │   │   ├── commands.ts                     # cmd_jog · cmd_set_session …
│   │   │   ├── telemetry.ts
│   │   │   └── post-process.ts                 # post_process_sessions
│   │   └── types.ts
│   │
│   ├── schemas/                                # [04] D1 / Phase2 PG Zod
│   │   ├── recipes.ts
│   │   ├── job-logs.ts
│   │   └── wire-pm.ts
│   │
│   └── vision/                                 # [Phase 2 아이디어] — [00 웹캠 메모](00-Vision-Overview.md#phase-2-아이디어-메모--스마트폰-웹캠)
│       ├── motion-gesture.ts                   # 작업자 제스처 → cmd (NIXIE 별개)
│       ├── vision-scan.ts                      # 촬영 → outline · irregularity_est
│       └── hybrid-scan-merge.ts                # vision_scan + StallGuard scan_result
│
└── test/
    ├── edge-case-cam.test.ts
    └── GCodeInterpreter.test.ts
```

---

### 4.3 MVP v0.1 — `apps/heating-cnc-mvp/`

Cloudflare 조기 운영 ([03 MVP](03-Software-Protocol.md#mvp-v01--cloudflare-무료-서버)).
`apps/bax-demo/` 와 동일하게 **Platform 루트의 독립 앱**으로 두고, 공유 로직은 `@nexa/heating-cnc` 를 참조합니다.

```text
NEXA-Platform/apps/heating-cnc-mvp/
├── package.json
├── next.config.ts                              # Cloudflare Pages (@cloudflare/next-on-pages)
├── wrangler.toml                               # Workers · D1 · DO 바인딩
├── public/
│
├── src/
│   ├── app/                                    # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx                            # 대시보드 리다이렉트
│   │   ├── (panel)/                            # [04] 모바일 제어 패널
│   │   │   ├── layout.tsx                      # 섹션 A~G 탭
│   │   │   ├── machining/                      # 섹션 B·C — START·Jog·Scan Pass
│   │   │   ├── thermal-lab/                    # [02] /thermal-lab
│   │   │   ├── post-process/                   # [04 §G] Manual Overdrive
│   │   │   └── recipes/                        # 레시피 원터치
│   │   └── api/                                # Route Handlers (얇은 프록시)
│   │       ├── session/route.ts
│   │       ├── run/route.ts
│   │       └── gcode/analyze/route.ts
│   │
│   ├── components/
│   │   ├── heating-cnc/
│   │   │   ├── ScanPassCard.tsx                # ← _ref/ScanPassCard.tsx
│   │   │   ├── ManualOverdrivePanel.tsx        # [04 §G] (To-Be)
│   │   │   ├── TriLinkBanner.tsx
│   │   │   └── sections/                       # 04 UI 섹션 B~G
│   │   └── telemetry/
│   │
│   ├── workers/                                # CF Workers 엔트리 (wrangler 번들)
│   │   ├── index.ts                            # HTTP + WS upgrade
│   │   ├── durable-objects/
│   │   │   └── TriLinkSession.ts               # [03] Tri-Link DO
│   │   ├── engines/
│   │   │   ├── MockDeviceEngine.ts             # ui_sim
│   │   │   ├── CommandSequencer.ts
│   │   │   └── WirePmEngine.ts
│   │   └── routes/
│   │       ├── device-ws.ts                    # ESP32 Inbound
│   │       └── ui-ws.ts                        # 브라우저 leg
│   │
│   ├── lib/
│   │   ├── ws-client.ts
│   │   └── auth.ts                             # [06] JWT
│   │
│   └── styles/
│       └── panel.scss                          # 글러브·48px 터치 (04)
│
├── migrations/                                 # D1 SQL — [04 canonical schema]
│   ├── 0001_init.sql
│   └── 0002_post_process_sessions.sql
│
└── e2e/                                        # [03] Handshake · Tri-Link 시나리오
```

---

### 4.4 Phase 2 UI — `src/domains/heating-cnc/`

NEXA Platform **Quasar 도메인** ([project-structure `src/domains`](../../NEXA-Platform/docs/rules/project-structure.md)).
MVP UI 를 Vue 로 **점진 이식** · NEXIA·NIXIE 연동.

```text
NEXA-Platform/src/domains/heating-cnc/
├── HeatingCncDomain.vue                        # 도메인 루트 · 라우트 등록
├── routes.ts
│
├── views/
│   ├── DashboardView.vue                       # [04] 섹션 D 계기판
│   ├── MachiningPanelView.vue                  # 섹션 B·C
│   ├── PostProcessView.vue                     # 섹션 G · Utility Mode
│   └── ThermalLabView.vue                      # [02] 열선 테스트 랩
│
├── components/
│   ├── ScanPassCard.vue                        # React 스텁 → Vue 포팅
│   ├── ManualOverdrivePanel.vue
│   ├── RecipeGrid.vue
│   └── path-viz/                               # [05] Three.js PathViz
│       └── GcodePathCanvas.vue
│
├── composables/
│   ├── useHeatingCncSession.ts                 # work_session · Handshake
│   ├── useTriLink.ts
│   ├── usePostProcessSession.ts
│   └── useDeviceTelemetry.ts
│
├── stores/
│   └── heatingCncStore.ts                      # Pinia — run_mode · coords
│
└── services/
    └── heatingCncApi.ts                        # server REST 클라이언트
```

**의존**: `domains/heating-cnc` → `system/` · `engines/charts` · `@nexa/heating-cnc`
**금지**: `system/` 이 `heating-cnc` 참조

---

### 4.5 Phase 2 API — `server/domains/heating-cnc/`

```text
NEXA-Platform/server/domains/heating-cnc/
├── heating-cnc.routes.ts
├── heating-cnc.controller.ts
├── heating-cnc.service.ts                      # job_logs · recipes · PM
├── post-process.service.ts                     # post_process_sessions
├── thermal.service.ts                          # ThermalCutterEngine 래퍼
├── cam.service.ts                              # CAM generate API
├── device-bridge.service.ts                    # ESP32 WS 프록시 (Phase 2)
├── heating-cnc.types.ts
└── schemas/                                    # Zod — @nexa/heating-cnc 재export
```

PostgreSQL 마이그레이션: `server/migrations/` 또는 `database/migrations/heating-cnc/`
D1 스키마 ([04](04-Data-Operations.md#mvp-v01-d1-스키마-canonical)) → PG 이전 시 `wire_installations` · `post_process_sessions` 동형 유지.

---

### 4.6 엣지 펌웨어 — `NEXA-Edge/heating-cnc/`

```text
NEXA-Edge/heating-cnc/                          # PlatformIO
├── platformio.ini                              # board: esp32 · FluidNC fork
├── README.md
│
├── firmware/
│   ├── src/
│   │   ├── main.cpp
│   │   ├── motion/                             # [01] 4축 · StallGuard · Axis Isolation
│   │   │   ├── a_axis_dual_mode.cpp            # A_POS / A_VEL
│   │   │   └── stall_guard.cpp
│   │   ├── thermal/                            # [02] PWM · INA219 · S1~S12
│   │   │   ├── heater_interlock.cpp            # S12 릴레이
│   │   │   └── wire_sense_uart.cpp
│   │   ├── session/                            # [03] Manual Overdrive
│   │   │   ├── control_handshake.cpp           # G-code Executor LOCKED
│   │   │   ├── soft_lock_zero.cpp              # NVS
│   │   │   ├── jog_ledger.cpp
│   │   │   └── foot_pedal.cpp                  # GPIO 발 스위치
│   │   ├── connectivity/                       # [03] Tri-Link · Local AP · SD
│   │   │   ├── tri_link_watchdog.cpp
│   │   │   ├── local_portal.cpp
│   │   │   └── sd_offline.cpp
│   │   └── failsafe/
│   │       └── execute_failsafe.cpp            # S8/S9 · E-Stop ≤0.1s
│   │
│   ├── include/
│   └── lib/
│
├── fluidnc/                                    # FluidNC 커스텀 패치 · M210/M211
│   └── CustomGCode.cpp
│
├── config/                                     # [01] machine YAML · pins
│   ├── turning-4axis.yaml
│   └── pins_dlc32_max.h
│
└── test/
    └── native/                                 # jog_ledger · scurve 단위 테스트
```

---

### Phase 2 아이디어 — `vision/` 모듈 `[검토 대기]`

스마트폰 웹캠 활용 — 상세: [00 아이디어 메모](00-Vision-Overview.md#phase-2-아이디어-메모--스마트폰-웹캠).

| 경로                                                     | 용도                                      |
| :------------------------------------------------------- | :---------------------------------------- |
| `packages/heating-cnc/src/vision/motion-gesture.ts`      | 작업자 모션 → 명령·안전 대처 (NIXIE 별개) |
| `packages/heating-cnc/src/vision/vision-scan.ts`         | 모재 촬영 → 형상 추정                     |
| `apps/…/components/heating-cnc/VisionScanPanel.tsx`      | 거치 촬영 UI · AR 오버레이 (후보)         |
| `src/domains/heating-cnc/composables/useDeviceCamera.ts` | `getUserMedia` · Phase 2 Quasar           |

---

## 5. 스펙 → 코드 매핑 (요약)

| 스펙 모듈                    | 패키지 / 경로                                     | 핵심 심볼·파일                                  |
| :--------------------------- | :------------------------------------------------ | :---------------------------------------------- |
| **Edge Case CAM** [05]       | `packages/…/cam/`                                 | `runEdgeCaseCam`, `decomposeEccentricity`       |
| **G-code Pipeline** [05]     | `packages/…/gcode/`                               | `GCodeInterpreter`, `RunOrchestrator`           |
| **Thermal Engine** [02]      | `packages/…/thermal/`                             | `ThermalCutterEngine`, `WireHealthMonitor`      |
| **Tri-Link·WS** [03]         | `apps/…/workers/`                                 | `TriLinkSession`, `CommandSequencer`            |
| **Control Handshake** [03]   | `packages/…/protocol/` + Edge `session/`          | `gcode_executor_state`, `control_handshake_ack` |
| **Manual Overdrive UI** [04] | `apps/…/post-process/` · `domains/…/views/`       | `ManualOverdrivePanel`                          |
| **D1 / PG 스키마** [04]      | `migrations/`                                     | `post_process_sessions`, `utility_presets_json` |
| **Device Auth** [06]         | `server/domains/heating-cnc/` + Workers `auth.ts` | JWT · device token                              |
| **Mechanical** [07]          | `NEXA-Edge/config/`                               | `turning-4axis.yaml`                            |
| **Operational Safety** [10]  | UI 배너 · 체크리스트 컴포넌트                     | 환기·E-Stop 안내                                |

---

## 6. `_ref/` 이식표

| 현재 (인박스)                                    | To-Be                                                              | 비고                                                                        |
| :----------------------------------------------- | :----------------------------------------------------------------- | :-------------------------------------------------------------------------- |
| [`_ref/edge-case-cam.ts`](_ref/edge-case-cam.ts) | `packages/heating-cnc/src/cam/edge-case-cam.ts`                    | `@nexa/heating-cnc` export                                                  |
| [`_ref/ScanPassCard.tsx`](_ref/ScanPassCard.tsx) | `apps/heating-cnc-mvp/src/components/heating-cnc/ScanPassCard.tsx` | MVP: React 유지                                                             |
| —                                                | `src/domains/heating-cnc/components/ScanPassCard.vue`              | Phase 2: Vue 포팅                                                           |
| (미작성)                                         | `…/ManualOverdrivePanel.tsx` · `.vue`                              | [04 §G](04-Data-Operations.md#섹션-g-manual-overdrive--후가공-mvp-v01-필수) |

---

## 7. MVP v0.1 vs Phase 2 — 경로 대응

| 관심사        | MVP v0.1                                     | Phase 2                                 |
| :------------ | :------------------------------------------- | :-------------------------------------- |
| **UI**        | `apps/heating-cnc-mvp/` (Next.js → CF Pages) | `src/domains/heating-cnc/` (Quasar)     |
| **API**       | Workers + Route Handlers                     | `server/domains/heating-cnc/` (Express) |
| **실시간**    | CF DO `TriLinkSession`                       | 서버 WS + (선택) Redis pub/sub          |
| **DB**        | `apps/heating-cnc-mvp/migrations/` (D1)      | PostgreSQL migrations                   |
| **공유 로직** | `@nexa/heating-cnc`                          | 동일 패키지                             |
| **펌웨어**    | `NEXA-Edge/heating-cnc/`                     | 동일                                    |
| **문서 SSOT** | `NEXA V2.0/_inbox/Heating_CNC/`              | `docs/specs/manufacturing/heating-cnc/` |

---

## 8. 의존 방향 · 네이밍

```text
NEXA-Edge/firmware          ←── WSS ──►  apps/heating-cnc-mvp/workers
                                                │
                                                ▼ import
                                         packages/heating-cnc
                                                ▲
                                                │ import
                         src/domains/heating-cnc ─┘
                         server/domains/heating-cnc
```

| 규칙           | Heating CNC 적용                                                                             |
| :------------- | :------------------------------------------------------------------------------------------- |
| 패키지명       | `@nexa/heating-cnc`                                                                          |
| 도메인 slug    | `heating-cnc` (kebab)                                                                        |
| device_id 시드 | `turning-01` ([04](04-Data-Operations.md))                                                   |
| device_type    | `turning_4axis`                                                                              |
| Zod 스키마     | `packages/heating-cnc/src/protocol/schemas/` — Workers·server 공용                           |
| CSS            | Platform: `--nexa-*` 변수만 ([coding-style](../../NEXA-Platform/docs/rules/coding-style.md)) |

---

## 9. 구현 착수 순서 (권장)

1. `packages/heating-cnc` — `_ref/edge-case-cam.ts` 이식 + 단위 테스트
2. `apps/heating-cnc-mvp/migrations` — [04 D1](04-Data-Operations.md) 스키마
3. `apps/heating-cnc-mvp/workers` — Tri-Link · MockDeviceEngine
4. `NEXA-Edge/heating-cnc` — FluidNC + Control Handshake 펌웨어
5. MVP UI — Scan Pass · Manual Overdrive 패널
6. `docs/specs/manufacturing/heating-cnc/` — 인박스 promoted
7. Phase 2 — `domains/heating-cnc` · PostgreSQL 이전

---

## 10. 검증 체크리스트

- [ ] `@nexa/heating-cnc` 가 Workers·Next 양쪽에서 tree-shake 빌드 성공
- [ ] 문서 anchor (`03` WS 표) ↔ `protocol/schemas/*.ts` 필드 1:1
- [ ] D1 migration ↔ [04 CREATE TABLE](04-Data-Operations.md) 동형
- [ ] `NEXA-Edge` machine YAML ↔ [01](01-Hardware-Motion.md) 핀맵 일치
- [ ] `domains/heating-cnc` 가 `system/` 역참조 없음

---

## 11. TDD-007 정합성 검토 (2026-07-08)

대조 문서: [TDD-007 NEXA-Platform 모노레포 폴더 구조 v1.0](../08_TDD/NEXAOS/08_TDD_NEXAOS_%EB%AA%A8%EB%85%B8%EB%A0%88%ED%8F%AC%ED%8F%B4%EB%8D%94%EA%B5%AC%EC%A1%B0_v1.0.md)

### 11.1 종합 판정

| 항목                    | 판정 | 요약                                                                                                                                |
| :---------------------- | :--: | :---------------------------------------------------------------------------------------------------------------------------------- |
| **개념·레이어 분리**    |  ✅  | Edge 실행 · Platform UI/API · 공유 계약 · `docs/specs` SSOT — TDD-007 §2·§9 와 동형                                                 |
| **경로·패키지 명명**    |  ⚠️  | 본 문서 §4 는 **현행 레포** (`src/`·Express `server/`) 기준. TDD-007 Greenfield (`apps/web`·Nest `apps/backend`) 와 **경로 불일치** |
| **Zod·스키마 SSOT**     |  ⚠️  | TDD-007: `packages/shared/src/schemas/` 단일. 본 문서: `packages/heating-cnc/.../schemas/` — **계약층 이중화 위험**                 |
| **MVP Cloudflare 스택** |  ✅  | `apps/heating-cnc-mvp` + Workers — TDD 범위 밖 **조기 운영 앱** 으로 해석 가능 (`apps/bax-demo` 선례)                               |
| **NEXA-Edge**           |  ✅  | `NEXA-Edge/heating-cnc/` — TDD §9 「실행 (AXON)」·별 이미지 원칙과 일치                                                             |
| **실시간 WS**           |  △   | 장비 Tri-Link WS ≠ `apps/sync` Hocuspocus — **용도 분리** 명시 필요 (혼동 금지)                                                     |

**결론**: Heating CNC 모듈 배치는 **방향은 정합**하나, TDD-007 이행 시 §4.4·§4.5·§4.2 의 **물리 경로를 아래 표로 갱신**해야 합니다.

### 11.2 TDD-007 ↔ 본 문서 경로 대응

| 관심사                | 본 문서 §4 (현행·과도기)                        | **TDD-007 Greenfield (권장)**                                                                         |
| :-------------------- | :---------------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| **문서 SSOT**         | `docs/specs/manufacturing/heating-cnc/`         | 동일 (`docs/specs/**` — §7 배포 포함)                                                                 |
| **UI (Phase 2)**      | `src/domains/heating-cnc/`                      | `apps/web/src/domains/heating-cnc/` _(또는 `nexia/modules/manufacturing/` 서브모드 — 도메인 통합 시)_ |
| **API (Phase 2)**     | `server/domains/heating-cnc/`                   | `apps/backend/src/modules/heating-cnc/`                                                               |
| **Zod·DTO 계약**      | `packages/heating-cnc/src/protocol/schemas/`    | `packages/shared/src/schemas/heating-cnc/` ◆ **SSOT**                                                 |
| **도메인 알고리즘**   | `packages/heating-cnc/src/{cam,thermal,gcode}/` | 유지 가능 — `@nexa/heating-cnc` 가 shared 스키마 **import**                                           |
| **DB**                | `server/migrations/`                            | `NEXA-Platform/database/` (Prisma) + `heating_cnc_*` 모델                                             |
| **프로젝트 산출물**   | (미기재)                                        | `projects/{projectId}/heating-cnc/` — `.gcode` · `vision_scan/` · OTA mirror                          |
| **펌웨어**            | `NEXA-Edge/heating-cnc/`                        | 동일 · ESPHome 템플릿은 `firmware/esphome/` (WireSense 등 보조 MCU 시)                                |
| **MVP 현장 앱**       | `apps/heating-cnc-mvp/`                         | **유지** — CF Workers 번들은 TDD 4 앱 외 **조기 운영**                                                |
| **AI·비전 (Phase 2)** | `packages/heating-cnc/src/vision/`              | `apps/agent-graph/.../graphs/heating_cnc_vision.py` (추론) + shared Zod                               |

### 11.3 정합하는 항목 (유지)

1. **`pnpm-workspace` 내 `apps/` 독립 앱** — `heating-cnc-mvp` 는 `bax-demo` 와 동일 패턴.
2. **`NEXA-Edge/` 분리** — TDD §3 「NEXA-Edge = HEXAGON·ACTON · 온톨로지 UI ✗」와 부합. 터닝 머신 FluidNC 는 Edge 전용.
3. **`docs/inbox` → `docs/specs`** — Rivet 파이프라인 · TDD §7 배포 매트릭스 일치.
4. **의존 방향** — UI → shared/domain package → ✗ Prisma 직접 (web); backend → shared; Edge → HTTP/WS only — TDD §6 Import 경계와 동형.
5. **4 축 `src/` 골격** — `domains/` · `engines/` · `frame/` · `system/` (현행) / `apps/web/src/{frame,domains,engines,system}` (TDD) — Heating CNC 는 **domains 하위**만 점유.

### 11.4 불일치 · 보완 필요

|   #   | 이슈                                       | 권장 조치                                                                                                                                                                         |
| :---: | :----------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | Phase 2 API 를 Express `server/` 로만 기술 | Nest `apps/backend/src/modules/heating-cnc/` 병기 · device WS 는 **HTTP/SSE 프록시** (TDD §6: sync 앱에 WS 금지는 Hocuspocus 전용)                                                |
| **2** | `@nexa/heating-cnc` 내 Zod SSOT            | **프로토콜·D1 필드** → `packages/shared/schemas/heating-cnc/` 로 이전 · CAM/thermal 은 도메인 패키지 유지                                                                         |
| **3** | §2 맥락도에 Quasar+Express 만 표기         | TDD-007 **4+1 앱** (`web`·`backend`·`sync`·`agent-graph`·`shared`) 한 줄 추가                                                                                                     |
| **4** | `packages/` 위치                           | Git 루트 `NEXA/packages/shared` (TDD §3) vs `NEXA-Platform/packages/heating-cnc` — **workspace 루트는 `NEXA-Platform/`** 로 통일하고 `pnpm-workspace` 에 `@nexa/heating-cnc` 등록 |
| **5** | Phase 2 실시간                             | Tri-Link 장비 WS: `backend/modules/heating-cnc/device-bridge` — **`apps/sync` 와 분리** (협업 CRDT ≠ 모션 제어)                                                                   |
| **6** | `projects/{id}/` 미언급                    | 가공 이력·G-code·`vision_scan_json` 미러 경로 추가                                                                                                                                |
| **7** | MVP D1 vs Phase 2 PG                       | TDD `database/schema.prisma` 에 Heating CNC 테이블 **네임스페이스** (`HeatingCncJobLog` 등) 계획                                                                                  |

### 11.5 이중 타임라인 (권장 해석)

```text
[MVP v0.1 — 지금]
  apps/heating-cnc-mvp  +  CF Workers/D1  +  NEXA-Edge/heating-cnc
  packages/heating-cnc (로직) — 스키마는 당장 패키지 내부 허용

[Phase 2 — TDD-007 정렬]
  apps/web/.../heating-cnc          UI
  apps/backend/modules/heating-cnc  API · device-bridge
  packages/shared/schemas/heating-cnc  ◆ 계약 SSOT
  packages/heating-cnc              CAM · thermal · gcode (알고리즘)
  database/ (Prisma)                D1 → PG 이전
  apps/agent-graph (선택)           vision-scan · AI 레시피
```

> **주의**: [`project-structure.md`](../../NEXA-Platform/docs/rules/project-structure.md) 는 **현재 체크아웃 레포** (`src/`·Express) 기준. TDD-007 은 **Greenfield 목표**. 두 문서가 공존하는 동안 본 Heating CNC 문서는 **§11 표의 Greenfield 열**을 Phase 2 구현 SSOT 로 삼습니다.
