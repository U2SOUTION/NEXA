## 🛠️ 1. 최종 결정 기술 스택 (React 중심 풀스택)

AI 에이전트(안티그래비티, 클로드 등)가 전 세계에서 가장 버그 없이 정교하게 코드를 짜내는 글로벌 표준 TypeScript 생태계로 확정했습니다.

- **프론트엔드**: Next.js (App Router, TypeScript) - 강력한 SEO, 뛰어난 로딩 속도, AI 생성 툴(v0.dev 등)과의 압도적인 궁합.
- **스타일링**: Tailwind CSS + Shadcn UI - AI가 원자 단위로 코드를 읽고 조작하기 가장 쉬운 Utility-first 스타일 채택. 화면 최적화 극대화.
- **실시간 동기화**: Yjs + Hocuspocus — **순수 Node.js 독립 프로세스** (`apps/sync/`). NestJS와 **프로세스·포트 분리** → 저수준 WebSocket(CRDT)과 Nest HTTP/REST **프로토콜 충돌 방지**, 고속 동기화 보장.
- **메인 백엔드**: NestJS (TypeScript) — REST API·비즈니스 로직·Prisma·감사 로그. **Hocuspocus는 Nest 내부에 두지 않음.**
- **모노레포**: `apps/web` · `apps/backend` · `apps/sync` + `packages/shared` — TypeScript **타입 SSOT**와 **앱별 독립 배포** 동시 확보.
- **데이터 검증**: Zod — packages/shared 내 모든 DTO 및 명령(Grade 1·2·3) 스키마 정의. 프론트·백엔드·동기화 서버 간의 런타임 데이터 무결성 보장 (Type SSOT)

---

## 🔄 2. Yjs 와 React 스토어(Zustand) — 역할 분리 (무한 루프 방지)

**원칙**: 에디터는 Yjs와 **직접 양방향** · 일반 UI·IoT는 Yjs → Zustand **단방향만**.

| 계층            | 대상                                      | 데이터 흐름                                    | React re-render                       |
| --------------- | ----------------------------------------- | ---------------------------------------------- | ------------------------------------- |
| **에디터**      | Tiptap, Monaco, Rivet                     | **Yjs ↔ 에디터** (CRDT·Awareness 직접 바인딩) | 에디터 내부만 (Zustand 경유 **금지**) |
| **일반 UI·IoT** | 차트, 위젯, Safety/Telemetry, 드로어·테마 | **Yjs → observe → Zustand** (단방향)           | Zustand 구독 컴포넌트만               |

**금지 (무한 루프·충돌)**:

- Zustand 변경 → `Y.Doc` 역쓰기 (일반 UI·IoT 경로)
- Tiptap/Monaco/Rivet 상태를 Zustand에 미러링 후 다시 Yjs에 쓰기
- `useYjsSync`를 에디터 본문 동기화에 사용

- **Yjs** (네트워크·CRDT SSOT):
  - `Y.Doc` 동기화, Awareness, CRDT 충돌 해결. **일반 React UI 직접 렌더 금지.**
  - Tiptap / Monaco / Rivet는 각각 Yjs binding extension으로 **에디터 컴포넌트만** 연결.
- **Zustand** (화면·로컬 UI 버퍼):
  - `ydoc.getMap(...).observe` → 정제된 스냅샷만 `ingest` → 선택적 re-render.
  - 드로어·locale 등 **동기화 불필요** 로컬 UI.
  - **테마**는 `useUiStore` + **시맨틱 CSS 변수** + 도메인 **프리셋** (§테마·시각 언어) — Safety 시인성은 사용자 커스텀으로 변경 **금지**.
  - IoT Safety/Telemetry는 `useYjsSync`(채널 A) 또는 Worker(채널 B) → 스토어 **단방향**.

---

## 🎨 테마·시각 언어 (Mission-Safe Theme System)

> 테마는 단순 `dark/light` 토글이 아닙니다. **장식(surface)** 과 **안전·상태(semantic)** 를 분리하고, 도메인 전환 시 **산업별 프리셋**을 `domainLayoutRegistry`와 연동합니다.

### 3계층 구조

| 계층                  | 담당                                  | 사용자·도메인 커스텀                  | 예                                 |
| --------------------- | ------------------------------------- | ------------------------------------- | ---------------------------------- |
| **① Semantic (고정)** | Safety·Telemetry·명령 상태 **시인성** | ❌ **재정의 금지**                    | `--safety-critical`, `--status-ok` |
| **② Surface (가변)**  | Shadcn·배경·테두리·일반 텍스트        | ✅ 테마·프리셋·사용자                 | `--background`, `--primary`        |
| **③ Preset (도메인)** | 산업·현장 권장 조합                   | ✅ `domainLayoutRegistry.themePreset` | `power-grid`, `factory-night`      |

```text
domainLayoutRegistry.themePreset  →  data-theme-preset on <html>
useUiStore.themeMode (light/dark)  →  Shadcn .dark 클래스
① semantic tokens                  →  Safety/Telemetry UI만 참조 (불변)
```

---

### CSS 변수 체계 (Tailwind 연동)

**경로**: `apps/web/src/system/styles/tokens/` · `tailwind.config.ts` · `globals.css`

#### 시맨틱 토큰 (① — 미션 크리티컬 · 변경 금지)

| CSS 변수            | Tailwind alias (예) | 용도                                | 가이드라인                                                      |
| ------------------- | ------------------- | ----------------------------------- | --------------------------------------------------------------- |
| `--safety-critical` | `safety-critical`   | 화재·긴급 정지·Grade3 경고          | **배경 대비 ≥7:1** (WCAG AAA 권장). 사용자 테마가 덮어쓰지 못함 |
| `--safety-warning`  | `safety-warning`    | 임계치 초과·2등급 제어 대기         | `--safety-critical`과 **색상·명도 동일 계열 금지**              |
| `--status-ok`       | `status-ok`         | 정상 가동·연결 OK                   | 녹색 계열 고정 hue 범위 (HSL 130–150°)                          |
| `--status-degraded` | `status-degraded`   | 지연·부분 장애·Telemetry 억제       | `--status-ok`와 혼동 불가                                       |
| `--status-offline`  | `status-offline`    | 단선·sync/backend 끊김              | 중립 회색 — `--safety-*`와 혼용 금지                            |
| `--command-pending` | `command-pending`   | `commandTracker` 송신~ACK 대기      | 애니메이션·아이콘 색 SSOT                                       |
| `--command-failed`  | `command-failed`    | 타임아웃·ACK 실패                   | `--safety-critical`과 동일 값 **사용 가능**                     |
| `--telemetry-muted` | `telemetry-muted`   | 차트·보조 Telemetry (useTransition) | Safety 색상 **참조 금지**                                       |

```css
/* system/styles/tokens/semantic.css — SSOT · 사용자 테마 import 후에도 !important 또는 layer order로 보호 */
:root {
  --safety-critical: 0 84% 42%; /* HSL — tailwind: hsl(var(--safety-critical)) */
  --safety-warning: 38 92% 50%;
  --status-ok: 142 71% 45%;
  --status-degraded: 45 93% 47%;
  --status-offline: 220 9% 46%;
  --command-pending: 217 91% 60%;
  --command-failed: 0 84% 42%;
  --telemetry-muted: 220 14% 71%;
}
```

```ts
// tailwind.config.ts — semantic만 extend (surface는 Shadcn 기존)
theme: {
  extend: {
    colors: {
      'safety-critical': 'hsl(var(--safety-critical) / <alpha-value>)',
      'status-ok': 'hsl(var(--status-ok) / <alpha-value>)',
      // ...
    },
  },
},
```

**컴포넌트 규칙**

- Safety/Telemetry/상태바/명령 UI → **`bg-safety-critical`**, **`text-status-ok`** 등 **semantic만** 사용.
- 일반 카드·버튼·드로어 → Shadcn `bg-background`, `text-foreground` (② surface).
- ❌ Safety UI에 `bg-primary`·임의 hex 직접 지정 **금지**.

---

### 산업별 프리셋 (③)

**경로**: `system/styles/presets/{preset-id}.css` · `system/styles/presets/index.ts`

| `themePreset` ID    | 권장 도메인                    | 모드               | 특성                                                              |
| ------------------- | ------------------------------ | ------------------ | ----------------------------------------------------------------- |
| **`power-grid`**    | `dashboard` (전력·에너지 관제) | light · **고대비** | 밝은 배경 + 진한 그리드선 · Safety semantic **기본값 유지**       |
| **`factory-night`** | `dashboard`, `ais`             | **dark**           | 야간 공장·저조도 · surface만 어둡게 · semantic **동일 luminance** |
| **`office-light`**  | `home`, `nexia`, `u2bee`       | light              | 사무실·일반 업무 · 낮은 자극 · 차트 `telemetry-muted` 활용        |
| **`control-room`**  | `dashboard` (옵션)             | dark · 중간 대비   | 24h 관제실 · statusBar compact 강조                               |

```css
/* presets/power-grid.css — ② surface만 오버라이드 */
[data-theme-preset='power-grid'] {
  --background: 0 0% 98%;
  --foreground: 222 47% 11%;
  --border: 220 13% 75%;
  /* --safety-critical 등 ① 은 정의하지 않음 */
}
```

---

### `domainLayoutRegistry` 연동

레이아웃 슬롯과 동일하게 **도메인별 `themePreset`** 을 registry에 선언합니다.

```ts
// frame/registry/domainLayoutRegistry.ts
export type ThemePresetId = 'power-grid' | 'factory-night' | 'office-light' | 'control-room'

export type DomainLayoutSlots = {
  left?: ComponentLoader
  content?: ComponentLoader
  right?: ComponentLoader
  headerActions?: ComponentLoader
  statusBar?: ComponentLoader
  statusPanel?: ComponentLoader
  /** 도메인 진입 시 적용할 산업 프리셋 (선택) */
  themePreset?: ThemePresetId
}

export const domainLayoutRegistry = {
  dashboard: {
    left: () => import('@/domains/dashboard/views/left/DashboardLeftNav'),
    content: () => import('@/domains/dashboard/views/content/DashboardContent'),
    right: () => import('@/domains/dashboard/views/right/DashboardRightPanel'),
    statusBar: () => import('@/domains/dashboard/views/status/DashboardStatusBar'),
    themePreset: 'power-grid', // 또는 현장 설정에 따라 factory-night
  },
  home: {
    content: () => import('@/domains/home/views/content/HomeView'),
    themePreset: 'office-light',
  },
  u2bee: {
    /* embed 모드는 U2BeeMinimalLayout — 프리셋 최소 surface */
    themePreset: 'office-light',
  },
} as const satisfies Record<string, DomainLayoutSlots>
```

**적용 흐름** (`hooks/useDomainLayout.ts` 또는 `MainShellLayout`)

```text
globalMenu.domainKey 변경
  → registry.themePreset 읽기
  → document.documentElement.dataset.themePreset = id
  → useUiStore.themeMode (light/dark)와 AND — factory-night + dark 등
  → 사용자가 헤더에서 수동 테마 변경 시: themePreset은 유지, mode만 토글
```

| 우선순위 | 소스                       | 설명                                             |
| -------- | -------------------------- | ------------------------------------------------ |
| 1        | **① semantic CSS**         | 항상 고정 — 어떤 프리셋에도 Safety hue 변경 없음 |
| 2        | **`themePreset`**          | 도메인 전환 시 surface 팔레트                    |
| 3        | **`useUiStore.themeMode`** | 사용자 light/dark (② surface만)                  |
| 4        | (선택) 사용자 accent       | ② `--primary` 등 — semantic **침범 금지**        |

**폴더 (트리 보강)**

```text
system/styles/
├── tokens/
│   ├── semantic.css          # ① SSOT — safety/status/command
│   └── surface.css           # ② Shadcn HSL base
├── presets/
│   ├── power-grid.css
│   ├── factory-night.css
│   ├── office-light.css
│   └── index.ts              # ThemePresetId · preset → CSS import map
└── apply-theme.ts            # dataset + .dark 토글 유틸
```

---

## 🛡️ 3. 하이브리드 망 분리 및 제어 명령 등급 보안 전략

금융권 수준의 물리적 안전성을 확보하면서도, 웹 기반 관제 편의성을 놓치지 않기 위해 명령의 위험도에 따라 망과 인증 단계를 분리합니다.

- 🟢 1등급 (일반 설정/조회) ➡️ 외부 인터넷망 자유 허용
- 대상: 대시보드 레이아웃 편집, 단순 텍스트/태그 수정, 데이터 모니터링.
  - 보안: 일반 웹 로그인 세션 + Hocuspocus의 ReadOnly 스코프 분리로 불법 변조 원천 차단.
- 🟡 2등급 (소프트 제어) ➡️ 외부 인터넷망 + 2차 인증(MFA)
- 대상: 소프트웨어 원격 재부팅, 알림 임계치 수정, 비위험 보조 장비 가동.
  - 보안: 명령 수행 시 OTP/생체 인증 강제, NestJS 메인 서버에 위변조 불가능한 감사 로그(Audit Log) 즉시 기록.
- 🔴 3등급 (하드 제어) ➡️ 내부 현장 폐쇄망 전용 (인터넷 원천 차단)
- 대상: 공장 메인 전원 차단, 물리 모터/밸브 조작, 하드웨어 펌웨어 업데이트.
  - 보안: 외부망(Yjs)을 통한 다이렉트 명령 전달 통로를 물리적으로 없앰. 오직 현장 내부 네트워크 및 VPN 환경의 서버(Edge)를 통해서만 실제 디바이스 제어 명령(MQTT 등) 전송.

---

## ⚡미션 크리티컬(Mission-Critical) IoT 플랫폼 데이터 전략

장비를 제어하는 IoT 플랫폼에서 연산 부하로 인한 안전 데이터 처리 지연을 막는 최강의 아키텍처 핵심 요약입니다. 프로젝트 설계 시 이 표와 3대 수칙을 이정표로 삼으시면 안전사고를 완벽히 예방할 수 있습니다.

### IoT 플랫폼 데이터 전략 요약

| 구분            | 🚨 긴급·안전·제어 데이터                          | 📈 일반 수집·차트 데이터                          |
| --------------- | ------------------------------------------------- | ------------------------------------------------- |
| 대상 데이터     | 장비 고장, 화재 알람, 임계치 초과, 긴급 정지 명령 | 온습도, 전력량, 가동률, 실시간 트렌드 그래프 로그 |
| 처리 스레드     | 메인 스레드 직통 (방해 요소가 없어야 함)          | 웹 워커 (Web Worker) (백그라운드 격리 수신)       |
| 상태 관리       | useSafetyStore (단독 스토어 분리)                 | useTelemetryStore (메모리 버퍼 내장)              |
| 렌더링 우선순위 | 최우선 (Urgent Update)                            | 지연 가능 (useTransition 활용)                    |
| UI 반영 주기    | 즉시 반영 (0ms 지연)                              | 묶어서 반영 (200~500ms 버퍼링)                    |
| 통신 차단 방어  | UI가 멈춰도 소켓 발송(Emit) 즉시 실행             | 렌더링 부하 발생 시 차트 애니메이션 즉시 오프     |

**입력 채널 2종 (둘 다 처리해야 프리징 방지)**

| 채널                    | 대표 경로                                             | 처리 주체                              | 스토어                                 |
| ----------------------- | ----------------------------------------------------- | -------------------------------------- | -------------------------------------- |
| **A. Yjs / Hocuspocus** | IoT Safety/Telemetry **Y.Map** (에디터 CRDT **제외**) | `hooks/useYjsSync.ts` (단방향 observe) | `useSafetyStore` / `useTelemetryStore` |
| **B. 일반 소켓 폭주**   | `engines/websocket.ts` → MQTT/WS 센서                 | `workers/telemetryProcessor.ts`        | `useTelemetryStore` (postMessage만)    |

> ⚠️ **`useYjsSync`만** 있으면 채널 A만 커버 → 채널 B 폭주 시 **브라우저가 여전히 멈춤**.  
> **`telemetryProcessor`만** 있으면 채널 B만 커버 → Yjs 경로 **Safety 알람 미배분**. **두 파일은 필수 쌍.**

---

### 아키텍처 설계 시 반드시 지켜야 할 3대 절대 수칙

1.  스레드 분리 (Web Worker)

- 아무리 많은 일반 센서 데이터가 폭발해도 화면을 담당하는 메인 스레드는 이를 모릅니다.
  - 백그라운드(웹 워커)에서 데이터를 99% 다 소화하고, 진짜 위험한 1%의 안전 데이터만 메인 스레드로 인터럽트(새치기)를 걸어 올립니다.

2.  렌더링 우선순위 지정 (useTransition)

- Next.js(React)의 동시성 기능을 씁니다.
  - 브라우저가 무거운 차트를 그리다가도 안전/경고 데이터가 들어오면 차트 그리던 것을 즉시 내팽개치고 경고창부터 화면에 찍어냅니다.

3.  제어 명령 단선 구조화

- 사용자가 화면에서 [기기 중지] 버튼을 눌렀을 때, 이 이벤트는 React의 복잡한 컴포넌트 상태 변화나 렌더링 과정을 거치지 않습니다.
  - 클릭 즉시 네이티브 자바스크립트 소켓(socket.emit)을 통해 장비로 다이렉트 송신되도록 라인을 단선화합니다.

### 신뢰성·현장 자율 보강 (권장 · 3대 수칙과 함께)

| 모듈            | 경로                               | 역할                                                                                     |
| --------------- | ---------------------------------- | ---------------------------------------------------------------------------------------- |
| **명령 피드백** | `engines/commandTracker.ts`        | 명령 송신 → ACK/타임아웃/실패까지 **상태 추적** (`socketEmitter`·API와 `commandId` 연동) |
| **엣지 자율성** | `edge-queue/edge-persistence.ts`   | 서버·클라우드 장애 시에도 **현장 큐·안전 로직** 로컬 유지 (Grade3 Pull 오프라인)         |
| **시간 동기화** | `packages/shared/src/time-sync.ts` | 감사·사고 분석용 **단일 시각 기준** (Audit Log 선후 관계)                                |
| **헬스 워치독** | `engines/healthWatchdog.ts`        | 과부하 시 Telemetry·차트 **억제**, Safety·제어 경로 **최우선**                           |

> `time-sync`는 `audit-log.interceptor`·`commandTracker`가 기록하는 `issuedAt` / `ackedAt`에 공통 적용.  
> **장애 시 폴백·회로 차단·복구 시퀀스** → §예외 상황 대응 및 복구 전략.  
> **부하·보안 등급 자동 검증** → §미션 크리티컬 설계 검증.

---

## 🔁 예외 상황 대응 및 복구 전략 (Error Handling & Recovery)

> `commandTracker`·`edge-persistence`·`healthWatchdog`은 **정상 경로**의 신뢰성 모듈입니다. 본 절은 **장애·과부하 시 자동으로 전환되는 운영 등급(Degraded Mode)** 과 **복구 조건**을 SSOT로 정의합니다.

### 운영 등급 (Degraded Mode) — SSOT

| 등급            | 코드                     | 트리거 (요약)                      | UI·데이터                                                  | Safety·제어                                 |
| --------------- | ------------------------ | ---------------------------------- | ---------------------------------------------------------- | ------------------------------------------- |
| **정상**        | `NORMAL`                 | sync·backend·Worker 정상           | CRDT 실시간 + 차트 풀                                      | 전 경로                                     |
| **동기화 격리** | `SYNC_OFFLINE`           | `apps/sync` WS 끊김 ≥3s            | **로컬 편집 전용** + IoT **REST 폴링**                     | 채널 A 폴링 · B 유지 · `socketEmitter` 유지 |
| **관제 경량**   | `TELEMETRY_CIRCUIT_OPEN` | 채널 B 폭주 · Worker/FPS 임계 초과 | **안전 데이터 전용 텍스트 모드** — 차트·애니 **전면 차단** | Safety·상태바·명령 **만**                   |
| **백엔드 제한** | `API_DEGRADED`           | Nest REST 5xx/타임아웃             | 마지막 Safety 스냅샷 **읽기 전용**                         | 🟡2·🔴3 **신규 제어 UI 비활성**             |
| **현장 자율**   | `EDGE_AUTONOMOUS`        | 클라우드+sync 장기 불능            | 웹 UI **경고 배너** (현장 Edge SSOT)                       | Grade3 → `edge-persistence` (기존)          |

```text
useConnectionStore.degradedMode  ← healthWatchdog · useHocuspocus · api-client
SystemStatusBar                  ← degradedMode + commandTracker + sync latency
document.documentElement.dataset.degraded = mode   (선택 — CSS: 차트 숨김 등)
```

**공통 원칙**

- Safety·긴급 정지(`socketEmitter`) 경로는 **어떤 등급에서도 차단하지 않음**.
- 등급 전환은 **히스테리시스**(복구 조건 > 진입 조건) — 플래핑 방지.
- 모든 전환·복구는 `time-sync` 타임스탬프 + (가능 시) Audit/로컬 이벤트 로그.

---

### 1. 동기화 서버(`apps/sync`) 장애 대응

**감지** (`hooks/useHocuspocus.ts`)

| 신호              | 조건                         | 동작                                                   |
| ----------------- | ---------------------------- | ------------------------------------------------------ |
| WS `disconnected` | 즉시                         | `syncStatus = 'reconnecting'` · 배너 표시              |
| 재연결 실패       | **≥3s** (3회 heartbeat miss) | `degradedMode → SYNC_OFFLINE`                          |
| 재연결 성공       | CRDT sync complete           | `SYNC_OFFLINE → NORMAL` (히스테리시스: **5s** 안정 후) |

#### 1-A. 에디터 — **로컬 편집 전용 모드**

| 항목        | 규칙                                                                                     |
| ----------- | ---------------------------------------------------------------------------------------- |
| **Y.Doc**   | 브라우저 **IndexedDB**(`y-indexeddb` 등)에 로컬 CRDT 유지 — sync 없이 편집 **계속 가능** |
| **협업 UI** | Awareness·원격 커서 **숨김** · 헤더 배너: _「동기화 서버 오프라인 — 로컬 편집 전용」_    |
| **충돌**    | sync 복구 시 서버 Y.Doc과 **자동 머지**(CRDT) — 사용자에게 diff 요약(선택)               |
| **금지**    | sync 끊긴 상태에서 🟡2·🔴3 **원격 제어 UI** 노출 (REST도 degraded면 이중 차단)           |

#### 1-B. IoT 채널 A — **`useYjsSync` → REST 폴링 폴백**

Yjs observe가 끊기면 Safety/Telemetry Y.Map 스냅샷을 **backend REST**로 대체합니다.

```text
[SYNC_OFFLINE 진입]
  useYjsSync.pauseObserve()
  useYjsSync.startPolling({
    endpoint: GET /api/v1/iot/safety-snapshot,   // useSafetyStore.ingest
              GET /api/v1/iot/telemetry-snapshot, // useTelemetryStore.ingest (TELEMETRY_CIRCUIT_OPEN 아닐 때만)
    intervalMs: 2000,          // Safety 기본 2s
    backoffMaxMs: 10000,
  })

[NORMAL 복구]
  stopPolling() → useHocuspocus reconnect → observe 재개 → REST 스냅샷 1회 diff 후 폴링 종료
```

| API (backend)                        | 역할                                                       |
| ------------------------------------ | ---------------------------------------------------------- |
| `GET /api/v1/iot/safety-snapshot`    | `packages/shared` DTO — `useSafetyStore`와 **동일 스키마** |
| `GET /api/v1/iot/telemetry-snapshot` | 집계·다운샘플된 Telemetry (폴링 부하 제한)                 |
| `GET /api/v1/sync/health`            | sync 프로세스 헬스 (선택 — ops용)                          |

> **의견**: 폴링은 **채널 A 보조 수단**이지 CRDT 대체가 아닙니다. sync 복구 후 반드시 observe로 **되돌립니다**. 에디터 본문은 폴링 대상 **아님** (로컬 Y.Doc만).

**구현 경로**

```text
hooks/useHocuspocus.ts       # 연결 상태 · SYNC_OFFLINE 트리거
hooks/useYjsSync.ts          # observe | polling 전략 (Strategy)
engines/syncFallback.ts      # 폴링 스케줄 · backoff · ingest 라우팅
store/useConnectionStore.ts  # degradedMode · syncStatus SSOT
```

---

### 2. 회로 차단기 (Circuit Breaker) — 채널 B Telemetry 폭주

**목표**: Worker가 **포화**되거나 메인 스레드 FPS가 붕괴되면, 차트·애니메이션을 **완전히 끊고** Safety만 **텍스트·배지**로 표시합니다.

**감시** (`engines/healthWatchdog.ts` — 1s tick)

| 메트릭             | 수집원                                   | **OPEN 진입** (任一 충족)               | **CLOSE 복구** (전부 충족, 10s 유지) |
| ------------------ | ---------------------------------------- | --------------------------------------- | ------------------------------------ |
| Worker 큐 깊이     | `telemetryProcessor` postMessage backlog | **>500** msg 또는 **>50 msg/s** 5s 지속 | **<100** msg & **<20 msg/s**         |
| 메인 FPS           | `requestAnimationFrame` 샘플             | **<15 FPS** 3s 지속                     | **≥24 FPS**                          |
| Safety ingest 지연 | `useSafetyStore.lastIngestAt`            | now − last **>500ms** (Safety 밀림)     | **<200ms**                           |
| Worker heartbeat   | Worker ping/pong                         | **2회** 연속 miss                       | 3회 연속 정상                        |

```text
[NORMAL]
  websocket → telemetryProcessor → useTelemetryStore → 차트(useTransition)

[TELEMETRY_CIRCUIT_OPEN]
  healthWatchdog.openTelemetryCircuit()
    → telemetryProcessor: ingest pause (drop non-safety)
    → useTelemetryStore: freezeCharts = true
    → UI: Content 차트 unmount / placeholder
    → UI: Safety 전용 텍스트 패널 (SystemStatusBar + statusPanel 확장)
    → socketEmitter · useSafetyStore · useYjsSync(또는 폴링): **변경 없음**

[HALF_OPEN] (선택 — 30s 후)
  Worker에 probe batch 10msg/s — FPS·Safety 지연 재측정 → OPEN 유지 또는 CLOSE
```

#### 안전 데이터 전용 텍스트 모드 (UI SSOT)

| 표시              | 소스                             | 형식                                        |
| ----------------- | -------------------------------- | ------------------------------------------- |
| 긴급 알람 목록    | `useSafetyStore.alarms`          | `--safety-critical` 텍스트 · 스크롤 리스트  |
| 연결·sync·circuit | `useConnectionStore`             | statusBar 한 줄                             |
| 명령 상태         | `commandTracker`                 | pending/failed 텍스트 (아이콘만, 애니 없음) |
| Telemetry         | **숨김** 또는 마지막 값 1줄 요약 | 차트·스파크라인 **금지**                    |

배너: _「과부하 — 관제 경량 모드 (Safety만 표시)」_ · `--status-degraded` semantic.

> **의견**: OPEN 상태에서도 Worker **종료하지 않음** — probe·Safety side-channel 유지. `terminate()`는 탭 unload 시만.

---

### 3. `commandTracker` — 명령 실패·타임아웃 복구

| 상태      | 조건                                         | UI·후속                                     |
| --------- | -------------------------------------------- | ------------------------------------------- |
| `pending` | 송신 직후                                    | `--command-pending` · statusBar             |
| `acked`   | ACK ≤ SLA                                    | 정상 종료                                   |
| `timeout` | SLA 초과 (Grade별: 🟡2 **10s**, 🟢1 **30s**) | **1회** 자동 재시도 → 실패 시 사용자 확인   |
| `failed`  | ACK reject / 네트워크                        | `--command-failed` · Audit ID 표시          |
| `blocked` | `API_DEGRADED` / `SYNC_OFFLINE` + 🟡2        | 재시도 **금지** · _「서버 연결 후 재시도」_ |

`SYNC_OFFLINE` 중 🟢1 조회성 명령은 REST 단독 허용 가능. 🟡2·🔴3는 **blocked**.

---

### 4. 백엔드 REST 장애 (`API_DEGRADED`)

| 구분              | 동작                                                                                    |
| ----------------- | --------------------------------------------------------------------------------------- |
| **Safety 스냅샷** | `sessionStorage` 마지막 성공 응답 캐시 (TTL **60s**) — stale 배지                       |
| **제어**          | 🟡2·🔴3 UI **disabled** · `socketEmitter`도 backend pre-check 실패 시 차단              |
| **폴링**          | `useYjsSync` 폴링 **exponential backoff** · sync만 살아 있어도 REST 없으면 Safety stale |
| **복구**          | 연속 2회 2xx → `API_DEGRADED` 해제                                                      |

---

### 5. 엣지 자율 (`EDGE_AUTONOMOUS`) — Grade3 연계

기존 `edge-queue/edge-persistence.ts`와 연동. **클라우드+sync 5분+** 불능 시:

- 웹: _「현장 Edge가 제어 SSOT — 원격 제어 불가」_ 배너.
- Grade3 Pull·MQTT는 **Edge 로컬** — 브라우저 UI는 모니터링(폴링/캐시)만.
- sync 복구 후 Edge 큐 **역동기화**는 backend `edge-queue` 담당 (웹 직접 X).

---

### 6. 복구 시퀀스 (권장 순서)

```text
1. healthWatchdog: TELEMETRY_CIRCUIT_OPEN 해제 (FPS·Worker 정상)
2. backend REST: API_DEGRADED 해제
3. apps/sync WS: SYNC_OFFLINE → observe 재개 · 협업 UI 복원
4. commandTracker: blocked → pending 재큐 (사용자 확인 후)
5. Telemetry 차트: useTransition으로 점진 remount (cold start 1회 downsample)
```

**SystemStatusBar**는 항상 **현재 degradedMode 최상위 1개** + stackable 경고( stale · circuit )를 표시합니다.

---

### 디렉토리 보강

```text
apps/web/src/
├── engines/
│   ├── healthWatchdog.ts      # Circuit Breaker · FPS · Worker 큐
│   ├── syncFallback.ts        # REST 폴링 · backoff
│   └── commandTracker.ts      # timeout · blocked · retry
├── hooks/
│   ├── useHocuspocus.ts       # sync 장애 감지
│   └── useYjsSync.ts          # observe ↔ polling Strategy
├── store/
│   └── useConnectionStore.ts  # degradedMode · syncStatus · circuitState
└── frame/status/
    └── DegradedModeBanner.tsx # Content 상단 · semantic 배너

apps/backend/src/modules/iot/
├── iot.controller.ts          # safety-snapshot · telemetry-snapshot
└── iot-snapshot.service.ts    # DB/Edge 집계 — 폴링 SSOT
```

---

## 📝 NEXA OS V2.1 모노레포 폴더 구조

NEXA OS V2.1 모노레포는 **`apps/web`**(Next.js UI), **`apps/backend`**(NestJS API), **`apps/sync`**(Hocuspocus 독립 서버)의 3대 핵심 앱과 **`packages/shared`**(Zod schemas + TypeScript SSOT)로 구성되어, **런타임 검증**과 **타입 안전성**을 동시에 확보합니다.

### 핵심 아키텍처 3원칙 (V2.1 SSOT)

| #     | 원칙                               | 구현                                                                                                                                           |
| ----- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **①** | **Hocuspocus 독립 서버**           | `apps/sync/` — 순수 Node.js + `@hocuspocus/server`. NestJS(`apps/backend`)와 **별도 프로세스·포트**. Nest에 Hocuspocus 모듈 **금지**.          |
| **②** | **Yjs ↔ Zustand 단방향 (IoT/UI)** | Tiptap·Monaco·Rivet → Yjs **양방향 직결**. 차트·Safety/Telemetry → `useYjsSync` **observe → Zustand만**. Zustand→Yjs 역쓰기 **금지**.          |
| **③** | **모노레포 3앱 + shared**          | `apps/web` · `apps/backend` · `apps/sync` + `packages/shared` — **Zod schemas** · commands · Yjs 맵 키 **단일 SSOT**. 앱별 **독립 빌드·배포**. |

```text
pnpm-workspace
├── apps/web        → Next.js (UI)
├── apps/backend    → NestJS (REST · Prisma · audit · edge-queue)
├── apps/sync       → Hocuspocus (Yjs CRDT WebSocket only)
└── packages/shared → schemas/ (Zod) · commands · yjs — web · backend · sync 공통 parse
```

> `docker-compose.yml`: §DevOps — **core** 4서비스 + **iot** 프로필(MQTT·엣지 시뮬). `sync` :1234 · `backend` :3001.

### 레이아웃 역할 분리 (4영역 · 웹 Footer 없음)

| 영역                     | 역할                                 | 구현                                    |
| ------------------------ | ------------------------------------ | --------------------------------------- |
| **Header — 전역 내비**   | 도메인(메뉴) 전환 · 로고             | `globalMenu.ts` + `GlobalMainMenu.tsx`  |
| **Header — 우측**        | 드로어 토글 · 테마 · `headerActions` | `GlobalNavbarRight.tsx` + registry 슬롯 |
| **Left Drawer**          | 현재 도메인 서브 내비·트리           | `domainLayoutRegistry.left`             |
| **Content**              | 메인 작업 — **여기만 세로 스크롤**   | `domainLayoutRegistry.content`          |
| **Right Drawer**         | 넥셋·에이전트·속성                   | `domainLayoutRegistry.right`            |
| **하단 — 시스템 상태바** | 전역·도메인 상태 요약                | `SystemStatusBar` + `statusPanel`       |

> 도메인 전환 시 **left / right / statusBar / statusPanel / themePreset** 이 `domainLayoutRegistry`에서 함께 교체됩니다.

### 시스템 상태바 (웹 Footer 대체 · 가변 높이)

**웹 전역 `<footer>` 풋터를 두지 않습니다.**  
이유: 본문+풋터 이중 스크롤, `100vh`·드로어·safe-area와의 충돌, IoT 대시보드에서 레이아웃 디버깅 비용 증가.

대신 **`MainShellLayout` 하단 고정 「시스템 상태바」** — IDE·OS 상태바와 같은 패턴.

| 모드                 | 높이                       | 내용                                                        |
| -------------------- | -------------------------- | ----------------------------------------------------------- |
| **평상시 (compact)** | **~30px**                  | §StatusBarStrip — 연결·Safety·명령·degraded **1줄**         |
| **상세 (expanded)**  | **≥300px** (리사이즈 가능) | §StatusOpsPanel(표준) + `registry.statusPanel`(도메인 추가) |

```text
MainShellLayout
├── Header
├── Body (flex-1 min-h-0)
│   ├── LeftDrawer
│   ├── MainColumn (flex flex-col flex-1 min-h-0)   ← 스크롤은 Content만
│   │   ├── Content  (flex-1 overflow-auto)
│   │   └── SystemStatusBar
│   │       ├── StatusBarStrip     (~30px, 항상 표시)
│   │       └── StatusPanelHost    (0 | ≥300px, 토글·드래그 리사이즈)
│   └── RightDrawer
└── (웹 Footer 없음)
```

| 파일                                        | 역할                                                    |
| ------------------------------------------- | ------------------------------------------------------- |
| `frame/status/SystemStatusBar.tsx`          | Strip + expand · StatusPanelHost                        |
| `frame/status/StatusPanelHost.tsx`          | StatusOpsPanel + registry.statusPanel stack             |
| `frame/status/panels/StatusOpsPanel.tsx`    | §표준 — ConnectionBar · RuntimeGrid · CommandList       |
| `frame/status/panels/MetricCard.tsx`        | FPS · Memory · Worker queue … 임계 semantic             |
| `frame/views/common/DefaultStatusPanel.tsx` | statusPanel 미등록 시 StatusOpsPanel만                  |
| `store/useLayoutStore.ts`                   | `statusBarExpanded`, `statusBarDetailHeight` (기본 300) |
| `store/useRuntimeMetricsStore.ts`           | healthWatchdog · Worker · latency 스냅샷                |
| `engines/runtimeMetricsCollector.ts`        | 1s tick · PerformanceObserver · ping                    |
| `domainLayoutRegistry`                      | `statusBar`, `statusPanel`, `themePreset` 슬롯 (선택)   |

**스크롤 규칙**: `Content`만 `overflow-auto`. 상태바·상세창은 셸에 고정되어 **페이지 전체 이중 스크롤 방지**.

---

### StatusBarStrip · StatusOpsPanel — 표준 UI (SSOT)

> **Compact**는 요약만, **Expanded**는 `StatusOpsPanel`(전역 표준) + 도메인 `statusPanel`(선택)을 **세로 스택**. 도메인 패널이 없으면 `DefaultStatusPanel` = `StatusOpsPanel` 단독.

#### 데이터 SSOT — `useRuntimeMetricsStore`

`healthWatchdog`·Worker·연결 훅이 **1s tick**으로 스냅샷을 밀어 넣고, UI는 **구독만** 합니다 (메인 스레드 계측은 collector 내부).

| 필드               | 수집원                                 | 설명                                 |
| ------------------ | -------------------------------------- | ------------------------------------ |
| `mainFps`          | `healthWatchdog` (rAF)                 | 메인 스레드 FPS p50/p10              |
| `mainLongTaskMs`   | `PerformanceObserver` (`longtask`)     | 50ms+ 블로킹 누적 (최근 10s)         |
| `heapUsedMb`       | `performance.memory` (Chrome) / `null` | JS 힙 사용량 (미지원 브라우저 → `—`) |
| `syncLatencyMs`    | `useHocuspocus` ping RTT               | `apps/sync` WS 왕복                  |
| `restLatencyMs`    | `api-client` HEAD `/health`            | Nest REST RTT                        |
| `mqttConnected`    | `websocket` / env                      | 채널 B 브로커 연결 (iot 프로필)      |
| `workerQueueDepth` | `telemetryProcessor` postMessage       | 대기 큐 길이                         |
| `workerMsgPerSec`  | Worker heartbeat                       | 초당 처리/유입                       |
| `workerDropped`    | Worker                                 | 버퍼 overflow drop 누적              |
| `safetyIngestMs`   | `useSafetyStore.lastIngestAt`          | 마지막 Safety 반영 지연              |
| `circuitState`     | `healthWatchdog`                       | `closed` · `open` · `half_open`      |
| `degradedMode`     | `useConnectionStore`                   | §복구 운영 등급                      |

```text
engines/healthWatchdog.ts ──┐
workers/telemetryProcessor  ├──► useRuntimeMetricsStore.ingest(snapshot)
useHocuspocus / api-client ─┘         │
                                      ▼
              SystemStatusBar / StatusOpsPanel (read-only)
```

---

#### Compact — `StatusBarStrip` (~30px)

**좌→우 고정 슬롯** (overflow 시 `…` · hover tooltip). semantic 색만 사용.

| 슬롯         | 표시 예                           | 색 / 아이콘                                |
| ------------ | --------------------------------- | ------------------------------------------ |
| **Degraded** | `NORMAL` 숨김 · `SYNC_OFFLINE` 등 | `--status-degraded` 배지                   |
| **Sync**     | `sync` · **42ms**                 | OK `--status-ok` / 끊김 `--status-offline` |
| **REST**     | `api` · **18ms**                  | 동일                                       |
| **Safety**   | `⚠ 2` · 최상위 1건 요약          | `--safety-critical` / `--safety-warning`   |
| **Command**  | `cmd` · pending **1**             | `--command-pending`                        |
| **FPS**      | **58** (compact 숫자만)           | <24 `--status-degraded`                    |
| **Domain**   | `registry.statusBar` 1줄 (선택)   | surface                                    |
| **Expand**   | `[▲]` / `[▼]`                     | `useLayoutStore.statusBarExpanded`         |

```text
│ [SYNC_OFFLINE] sync — · api 22ms · Safety ⚠1 · cmd ⏳1 · FPS 58 · IoT ■ · [▲] │
```

---

#### Expanded — `StatusOpsPanel` (표준 레이아웃)

**높이**: `useLayoutStore.statusBarDetailHeight` (기본 **300px**, 드래그 리사이즈 200–600).  
**내부**: 단일 `overflow-auto` — 패널 전체가 스크롤 (Content와 분리).

```text
┌─ StatusOpsPanel (전역 표준 · 모든 도메인 공통) ─────────────────────────────┐
│ A. ConnectionBar     [sync][rest][mqtt] latency chips + degraded badge      │
│ B. RuntimeGrid       CPU/메모리 · FPS · Worker · Safety (2×4 metric cards)   │
│ C. CircuitBanner     (open/half_open 일 때만 — §복구 안내)                    │
│ D. CommandList       commandTracker 최근 N건 (텍스트 · semantic)              │
├─ statusPanel slot (선택 · 도메인) ───────────────────────────────────────────┤
│ E. DomainStatusPanel  Telemetry tail · 로그 · Nexia 전용 …                   │
└──────────────────────────────────────────────────────────────────────────────┘
```

##### A. ConnectionBar (연결 · 지연)

| Chip        | 라벨   | 값                                                     | 임계 (색)                                               |
| ----------- | ------ | ------------------------------------------------------ | ------------------------------------------------------- |
| **Sync WS** | `SYNC` | `{latencyMs}ms` · `{connected\|reconnecting\|offline}` | >200ms `--status-degraded` · offline `--status-offline` |
| **REST**    | `API`  | `{restLatencyMs}ms`                                    | >500ms degraded · 5xx `--status-offline`                |
| **MQTT**    | `MQTT` | `{connected}` · `{msgPerSec}/s` (iot)                  | 끊김 offline                                            |
| **Mode**    | `MODE` | `degradedMode`                                         | semantic 배지                                           |

##### B. RuntimeGrid — 메트릭 카드 (8칸 · `grid-cols-4` × 2행)

| ID                        | UI 라벨          | 값 형식                     | 수집                | Warn            | Critical            |
| ------------------------- | ---------------- | --------------------------- | ------------------- | --------------- | ------------------- |
| **`metric-fps`**          | **FPS**          | `{p50}` (소) / p10 `{p10}`  | healthWatchdog      | p50 < **24**    | p10 < **15**        |
| **`metric-longtask`**     | **Long tasks**   | `{sumMs}ms` / 10s           | PerformanceObserver | > **200ms**     | > **500ms**         |
| **`metric-heap`**         | **Memory**       | `{heapUsedMb}` MB           | memory API          | > **512** MB    | > **768** MB        |
| **`metric-main-busy`**    | **Main busy**    | `{busyPercent}%`            | 1−(idle/1s) 근사    | > **60%**       | > **85%**           |
| **`metric-sync-rtt`**     | **Sync RTT**     | `{syncLatencyMs} ms`        | Hocuspocus ping     | > **200**       | > **1000**          |
| **`metric-worker-queue`** | **Worker queue** | `{depth}` · `{msgPerSec}/s` | telemetryProcessor  | depth > **100** | > **500** (Circuit) |
| **`metric-worker-drop`**  | **Worker drops** | `{workerDropped}` Σ         | Worker              | > **0**         | > **100**/min       |
| **`metric-safety-lag`**   | **Safety lag**   | `{safetyIngestMs} ms`       | useSafetyStore      | > **200**       | > **500**           |

**카드 UI 규격** (Shadcn + semantic)

```text
┌─────────────────┐
│ FPS          ●  │  ← 상태 dot: ok / warn / critical
│ 58              │  ← font-mono text-lg
│ p10 52          │  ← text-xs text-muted-foreground
└─────────────────┘
```

- **● 색**: ok `--status-ok` · warn `--status-degraded` · critical `--safety-critical`
- 차트·스파크라인: **기본 off** (Telemetry 부하). `TELEMETRY_CIRCUIT_OPEN` 시 카드 **숫자만** (§복구 텍스트 모드).

##### C. CircuitBanner

`circuitState !== 'closed'` 일 때만 표시.

```text
│ ⚠ Telemetry Circuit OPEN — 차트 중단 · Safety 전용 텍스트 모드 · [자세히] │
```

##### D. CommandList

| 컬럼     | 내용                                                    |
| -------- | ------------------------------------------------------- |
| `time`   | `time-sync` 상대 시각                                   |
| `grade`  | 🟢🟡🔴                                                  |
| `action` | command type                                            |
| `state`  | pending / acked / timeout / failed / blocked — semantic |

최대 **20건** · monospace · 행 클릭 → Audit ID 복사 (선택).

##### E. Domain `statusPanel` (선택)

`domainLayoutRegistry.statusPanel` — **StatusOpsPanel 아래**에만 추가.  
예: Dashboard → Telemetry 스냅샷 테이블 · Nexia → Yjs room 상태.

---

#### ASCII (Expanded 전체)

```text
├──────────────────────────────────────────────────────────────────────────┤
│ SYNC 38ms ●  API 15ms ●  MQTT 120/s ●  MODE NORMAL                       │
├──────────────────────────────────────────────────────────────────────────┤
│ [FPS 58   ] [Long 45ms] [Mem 186MB ] [Busy 22% ]                         │
│ [RTT 38ms ] [Queue 12 ] [Drop 0    ] [Safety 8ms]                         │
├──────────────────────────────────────────────────────────────────────────┤
│ cmd 14:02:01 🟡 REBOOT_AUX  pending …                                      │
│ cmd 14:01:58 🟢 THRESHOLD   acked                                          │
├─ DashboardStatusPanel (도메인) ────────────────────────────────────────────┤
│ Telemetry snapshot · device sim-edge-01 …                                  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

#### 구현 파일

| 파일                                       | 역할                                            |
| ------------------------------------------ | ----------------------------------------------- |
| `frame/status/SystemStatusBar.tsx`         | Strip + expand 토글 · `StatusPanelHost`         |
| `frame/status/StatusPanelHost.tsx`         | `StatusOpsPanel` + registry `statusPanel` stack |
| `frame/status/panels/StatusOpsPanel.tsx`   | **표준** A–D 섹션                               |
| `frame/status/panels/MetricCard.tsx`       | 8칸 그리드 카드 · 임계 색                       |
| `frame/status/panels/ConnectionBar.tsx`    | Sync/REST/MQTT chips                            |
| `frame/status/panels/CommandListPanel.tsx` | commandTracker 테이블                           |
| `store/useRuntimeMetricsStore.ts`          | 스냅샷 SSOT (UI read-only)                      |
| `engines/runtimeMetricsCollector.ts`       | Observer·ping·Worker 집계 (1s)                  |

**갱신 주기**: Expanded 열림 → **1s** · Compact만 → Strip 필드 **2s** (Safety·cmd는 즉시 구독).

**접근성**: 각 `MetricCard`에 `aria-label="{label} {value}, status {ok|warn|critical}"` · CircuitBanner `role="alert"`.

---

### 레이아웃 개념 (양쪽 드로어)

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ [Logo]  Home │ Nexia │ Nexage │ Dev │ …     [연결][테마][≡L][≡R][도메인액션] │
│         ↑ 전역 메뉴 (globalMenuTabs)              ↑ headerActions (선택)   │
├───┬──────────────────────────────────────────────────────────────────┬───┤
│ L │                                                                  │ R │
│ e │              Main Content (도메인별 page / content)               │ i │
│ f │                                                                  │ g │
│ t │   ← 도메인 서브 내비 (채널·트리·하위 메뉴)                          │ h │
│   │      NexiaLeftNav, DevLeftNav …                                  │ t │
│ D │                                                                  │   │
│ r │                                                                  │ D │
│ a │                                                                  │ r │
│ w │                                                                  │ a │
│ e │                                                                  │ w │
│ e │              Main Content  ← 이 영역만 스크롤                      │ r │
│   │                                                                  │   │
└───┴──────────────────────────────────────────────────────────────────┴───┘
├──────────────────────────────────────────────────────────────────────────┤
│ ■ 시스템 상태바 ~30px  [연결][Safety][명령#3] …          [▲ 상세]            │
├──────────────────────────────────────────────────────────────────────────┤
│ ▼ StatusOpsPanel (표준) + statusPanel (도메인, ≥300px)                   │
└──────────────────────────────────────────────────────────────────────────┘
     ▲ .left / .right (드로어)          ▲ .statusBar + .statusPanel (registry)
```

- **Header (전역)**: `frame/navigation/globalMenu.ts` → `GlobalMainMenu.tsx`
- **Left / Right Drawer**: `domainLayoutRegistry.left` / `.right`
- **Content**: `domainLayoutRegistry.content` — **유일한 메인 스크롤**
- **시스템 상태바**: `domainLayoutRegistry.statusBar` (30px) + `statusPanel` (상세, 선택)

---

## 모노레포 구조

> **Zod SSOT**: `packages/shared/src/schemas/`에 DTO·명령(Grade 1·2·3)·Yjs 페이로드 **Zod 스키마**를 정의하고, TypeScript 타입은 `z.infer<typeof Schema>`로 **스키마에서만** 파생합니다. web · backend · sync는 동일 스키마로 **런타임 parse** — compile-time 타입만 공유하는 것보다 미션 크리티컬 무결성을 우선합니다.

```yaml
NEXA OS V2.1/                          # 모노레포 루트
│
├── .claude/
├── .continue/
├── database/
│   ├── schema.prisma
│   └── docker/                        # Postgres, pgvector 등
├── docs/
├── scripts/                           # §DevOps — dev · openapi · generate_client
│   ├── dev.ps1                        # 원클릭 (Windows)
│   ├── dev.sh                         # 원클릭 (Unix)
│   ├── export-openapi.ts              # Nest → packages/shared/openapi/openapi.json
│   └── docker/
│       └── edge-gateway-sim/          # MQTT publish + edge Pull 시뮬 Dockerfile
├── pnpm-workspace.yaml
├── docker-compose.yml                 # profiles: core · iot · full
├── package.json
│
├── apps/
│   ├── web/                           # Next.js — 통합 관제·도메인 UI
│   │   ├── src/
│   │   │   ├── app/                   # App Router (얇은 라우트만)
│   │   │   │   ├── layout.tsx         # RootLayout → frame/layouts/MainShellLayout 위임
│   │   │   │   ├── page.tsx
│   │   │   │   ├── (auth)/            # 로그인·회원가입 (드로어 없는 AuthLayout)
│   │   │   │   │   ├── login/page.tsx
│   │   │   │   │   └── register/page.tsx
│   │   │   │   ├── (embed)/           # Desktop·Extension 웹뷰 전용 (MainShell 없음)
│   │   │   │   │   └── u2bee/
│   │   │   │   │       ├── layout.tsx # U2BeeMinimalLayout (투명·프레임리스)
│   │   │   │   │       ├── overlay/page.tsx   # WebView B — 투명 오버레이 UI
│   │   │   │   │       └── archive/page.tsx   # 아카이브·Tiptap (선택)
│   │   │   │   └── (shell)/           # 메인 셸 하위 라우트 그룹
│   │   │   │       ├── layout.tsx     # MainShellLayout 고정
│   │   │   │       ├── page.tsx       # 홈 / 대시보드 진입
│   │   │   │       ├── nexia/         # 도메인 URL 예시
│   │   │   │       ├── u2bee/        # 브라우저 관제용 (드로어·상태바 포함)
│   │   │   │       └── dashboard/
│   │   │   │
│   │   │   ├── frame/                 # [동적 레이아웃 셸] ★ — §완성 체크리스트 ①
│   │   │   │   ├── registry/
│   │   │   │   │   ├── domainLayoutRegistry.ts  # left/content/right/headerActions/statusBar/statusPanel/themePreset
│   │   │   │   │   └── layoutRegistry.ts
│   │   │   │   ├── navigation/
│   │   │   │   │   └── globalMenu.ts            # (필수) 전역 메뉴 SSOT — route·icon·domainKey
│   │   │   │   ├── layouts/
│   │   │   │   │   ├── MainShellLayout.tsx    # Header + L/R Drawer + Content + SystemStatusBar (Footer 없음)
│   │   │   │   │   ├── AuthLayout.tsx
│   │   │   │   │   └── U2BeeMinimalLayout.tsx # embed·Desktop 웹뷰 전용 (프레임리스)
│   │   │   │   ├── drawers/
│   │   │   │   │   ├── LeftDrawer.tsx         # 도메인 left 슬롯만 호스트 (서브 내비)
│   │   │   │   │   ├── RightDrawer.tsx        # 도메인 right 슬롯 (push | overlay)
│   │   │   │   │   └── DrawerResizeHandle.tsx
│   │   │   │   ├── header/
│   │   │   │   │   ├── AppHeader.tsx
│   │   │   │   │   ├── GlobalMainMenu.tsx
│   │   │   │   │   └── GlobalNavbarRight.tsx
│   │   │   │   ├── status/                      # 웹 Footer 대체 · §StatusOpsPanel
│   │   │   │   │   ├── SystemStatusBar.tsx
│   │   │   │   │   ├── StatusPanelHost.tsx
│   │   │   │   │   ├── DegradedModeBanner.tsx
│   │   │   │   │   └── panels/
│   │   │   │   │       ├── StatusOpsPanel.tsx
│   │   │   │   │       ├── MetricCard.tsx
│   │   │   │   │       ├── ConnectionBar.tsx
│   │   │   │   │       └── CommandListPanel.tsx
│   │   │   │   └── views/
│   │   │   │       ├── common/
│   │   │   │       │   ├── DefaultRightPanel.tsx
│   │   │   │       │   ├── DefaultStatusPanel.tsx  # statusPanel 기본 fallback
│   │   │   │       │   └── NotFound.tsx
│   │   │   │       └── auth/
│   │   │   │
│   │   │   ├── domains/                 # views/{left,content,right} 필수 · status/ 권장
│   │   │   │   ├── nexia/
│   │   │   │   │   ├── components/              # headerActions 등 도메인 전용
│   │   │   │   │   ├── composables/
│   │   │   │   │   └── views/
│   │   │   │   │       ├── left/
│   │   │   │   │       │   └── NexiaLeftNav.tsx       # 서브 내비·트리
│   │   │   │   │       ├── content/
│   │   │   │   │       │   └── NexiaContent.tsx       # 메인 작업 영역
│   │   │   │   │       └── right/
│   │   │   │   │           └── NexiaRightPanel.tsx
│   │   │   │   │       └── status/                    # (선택) 도메인 전용 상태바·상세
│   │   │   │   │           ├── NexiaStatusBar.tsx       # 30px 한 줄
│   │   │   │   │           └── NexiaStatusPanel.tsx     # 펼침 시 상세
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── components/
│   │   │   │   │   └── views/
│   │   │   │   │       ├── left/
│   │   │   │   │       │   └── DashboardLeftNav.tsx
│   │   │   │   │       ├── content/
│   │   │   │   │       │   └── DashboardContent.tsx
│   │   │   │   │       └── right/
│   │   │   │   │           └── DashboardRightPanel.tsx
│   │   │   │   ├── u2bee/
│   │   │   │   │   └── views/ { left, content, right }
│   │   │   │   └── [domain]/
│   │   │   │       └── views/                 # 신규 도메인도 동일 3폴더 필수
│   │   │   │           ├── left/
│   │   │   │           ├── content/
│   │   │   │           └── right/
│   │   │   │
│   │   │   ├── components/              # v0 · Shadcn — 도메인 무관 순수 UI
│   │   │   │   ├── ui/                  # button, sheet, dialog …
│   │   │   │   └── dashboard/           # 공용 위젯 껍데기
│   │   │   │
│   │   │   ├── workers/                 # [IoT] 일반 수집(Telemetry) — Web Worker 백그라운드
│   │   │   │   └── telemetryProcessor.ts # 초당 대량 데이터 버퍼링, 메인 스레드 부하 프리징 방지
│   │   │   │
│   │   │   ├── engines/                 # [클라이언트 코어] UI 없음
│   │   │   │   ├── api-client.ts
│   │   │   │   ├── websocket.ts         # WS 수신 → Worker로만 전달 (메인에서 parse/ingest 금지)
│   │   │   │   ├── socketEmitter.ts     # 🚨 긴급 정지 — 리렌더 없이 다이렉트 emit (단선)
│   │   │   │   ├── commandTracker.ts    # 명령 ID · 송신→완료 · timeout/blocked (§복구)
│   │   │   │   ├── healthWatchdog.ts    # FPS·Worker 큐 · Circuit Breaker (§복구)
│   │   │   │   ├── runtimeMetricsCollector.ts  # StatusOpsPanel 1s tick
│   │   │   │   ├── syncFallback.ts      # sync 장애 시 REST 폴링 · backoff
│   │   │   │   ├── web-serial.ts
│   │   │   │   ├── tiptap/              # Tiptap ↔ Yjs 직접 바인딩 (Zustand 미경유)
│   │   │   │   └── charts/
│   │   │   │
│   │   │   ├── hooks/                   # 실시간 동기화 · 네트워크 연동
│   │   │   │   ├── useYjsSync.ts        # observe ↔ REST polling Strategy (§복구)
│   │   │   │   ├── useHocuspocus.ts     # apps/sync WS · SYNC_OFFLINE 감지
│   │   │   │   └── useDomainLayout.ts   # domainLayoutRegistry 슬롯 resolve
│   │   │   │
│   │   │   ├── store/                   # [Zustand] 중요도별 분리 (§미션 크리티컬)
│   │   │   │   ├── useSafetyStore.ts    # 🚨 긴급·안전·제어 (0ms, 메인 스레드 직통)
│   │   │   │   ├── useTelemetryStore.ts # 📈 일반 수집 (버퍼·지연 반영, useTransition)
│   │   │   │   ├── useRuntimeMetricsStore.ts # StatusOpsPanel 스냅샷 (§상태바)
│   │   │   │   ├── useLayoutStore.ts    # 드로어 + statusBarExpanded·statusBarDetailHeight
│   │   │   │   ├── useConnectionStore.ts # degradedMode · syncStatus · circuitState
│   │   │   │   └── useUiStore.ts        # themeMode (light/dark), locale — surface만
│   │   │   │
│   │   │   ├── guards/                  # [보안] 프론트 제어 권한 · 인증
│   │   │   │   └── authGuard.ts         # 2등급 명령 시 MFA(2차 인증) 강제 등
│   │   │   │
│   │   │   ├── lib/
│   │   │   │   ├── utils.ts
│   │   │   │   └── validation/          # Zod parse 래퍼 — shared 스키마 re-export 금지(직접 import)
│   │   │   │       └── parseApiResponse.ts  # api-client · syncFallback ingest 전 safeParse
│   │   │   │
│   │   │   └── system/                  # 전역 비 UI 인프라
│   │   │       ├── config/
│   │   │       ├── styles/              # §테마·시각 언어 — tokens · presets
│   │   │       │   ├── tokens/          # semantic.css (고정) · surface.css
│   │   │       │   ├── presets/         # power-grid · factory-night · office-light …
│   │   │       │   └── apply-theme.ts
│   │   │       └── types/
│   │   │
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── backend/                         # NestJS — REST API only (Hocuspocus 금지)
│   │   └── src/
│   │       ├── main.ts
│   │       ├── app.module.ts
│   │       ├── modules/
│   │       │   ├── auth/                # JWT 발급·검증 — apps/sync onAuthenticate가 호출
│   │       │   ├── devices/             # 🟢 1등급 — 조회·모니터링
│   │       │   ├── iot/                 # §복구 — sync 폴백 REST 스냅샷
│   │       │   │   ├── iot.controller.ts
│   │       │   │   └── iot-snapshot.service.ts
│   │       │   ├── control/             # 🟡 2등급 — 소프트 제어 (MFA · audit · commandTracker)
│   │       │   │   └── command-tracker.service.ts  # 서버측 ACK·완료 영속화 (선택)
│   │       │   └── edge-queue/          # 🔴 3등급 — 폐쇄망 전용 (Yjs/외부 WS 미경유)
│   │       │       ├── edge-queue.module.ts
│   │       │       ├── edge-queue.controller.ts   # Edge가 Pull 하는 REST만 노출
│   │       │       ├── edge-queue.service.ts      # 명령 큐 적재·만료·idempotency
│   │       │       ├── edge-persistence.ts        # 서버 장애 시 현장 큐·안전 상태 로컬 유지
│   │       │       └── edge-gateway/              # 현장망 MQTT/Modbus (내부 NIC/VPN 한정)
│   │       │           ├── mqtt.adapter.ts
│   │       │           └── modbus.adapter.ts        # (선택) 프로토콜별 분리
│   │       └── common/
│   │           ├── pipes/
│   │           │   └── zod-validation.pipe.ts   # @nexa/shared/schemas → Nest DTO 대체
│   │           ├── guards/
│   │           │   └── command-grade.guard.ts     # 등급별 라우트 차단 (3등급 외부망 거부)
│   │           └── interceptors/
│   │               └── audit-log.interceptor.ts     # 🟡 2등급 이상 제어 명령에 대한 위변조 불가능한 감사 로그 기록
│   │
│   ├── sync/                            # ★ Hocuspocus — 순수 Node.js 독립 프로세스
│   │   ├── src/
│   │   │   ├── server.ts                # @hocuspocus/server 진입 (Nest 미사용)
│   │   │   ├── extensions/
│   │   │   │   ├── authenticate.ts      # onAuthenticate — backend/auth JWT 검증
│   │   │   │   ├── persistence.ts       # onStoreDocument · Prisma/DB
│   │   │   │   └── yjs-schema-guard.ts  # Y.Map write — shared/yjs 스키마 safeParse (Grade3 차단 연계)
│   │   │   └── config.ts                # PORT, DATABASE_URL, BACKEND_AUTH_URL
│   │   ├── package.json                 # packages/shared 의존
│   │   └── tsconfig.json
│   ├── mobile/
│   ├── desktop/                         # Python(PyQt6) — → `_NEXA-OS-apps-desktop-설계-명세.md`
│   └── extension/                       # (선택) embed URL — Desktop이 U2BEE SSOT
│
├── firmware/
│   ├── esp32/
│   └── esphome/
│
├── ai/
│   ├── ollama/
│   └── comfyui/
│
└── packages/
    └── shared/                          # web · backend · sync 공통 SSOT (+ Zod)
        ├── package.json                 # zod workspace dependency
        └── src/
            ├── schemas/                 # ★ Zod SSOT — 타입·런타임 검증 단일 원천
            │   ├── commands/
            │   │   ├── command.schema.ts
            │   │   ├── command-grade.schema.ts
            │   │   └── index.ts
            │   ├── dtos/
            │   │   ├── device.schema.ts
            │   │   ├── telemetry.schema.ts
            │   │   ├── safety-snapshot.schema.ts
            │   │   └── iot-snapshot.schema.ts
            │   ├── yjs/
            │   │   ├── safety-map.schema.ts
            │   │   ├── telemetry-map.schema.ts
            │   │   └── index.ts
            │   └── index.ts
            ├── commands/                # ★ 보안 등급·명령 — §체크리스트 ② · §검증
            │   ├── command-grade.enum.ts
            │   ├── command.types.ts         # z.infer<typeof CommandSchema>
            │   ├── security-requirements.ts
            │   ├── test-fixtures/
            │   ├── __tests__/
            │   └── index.ts
            ├── yjs/
            │   ├── map-keys.ts
            │   └── index.ts
            ├── time-sync.ts
            ├── dtos/                    # schemas/dtos re-export (type · schema)
            │   └── index.ts
            ├── openapi/
            │   └── openapi.json
            └── index.ts
```

### Zod — 스키마 SSOT · 앱별 검증 연동

**원칙**: 스키마는 **`packages/shared/src/schemas/`에만** 정의. 각 앱에 **로컬 Zod duplicate 금지**.

| 계층        | 경로                                  | Zod 사용                                         |
| ----------- | ------------------------------------- | ------------------------------------------------ |
| **SSOT**    | `shared/schemas/**`                   | `z.object` → `export type T = z.infer<typeof S>` |
| **Web**     | `lib/validation/parseApiResponse.ts`  | REST·폴링 `safeParse` → store ingest **전**      |
| **Web**     | `workers/telemetryProcessor.ts`       | Worker msg `TelemetrySchema.safeParse`           |
| **Web**     | `hooks/useYjsSync.ts`                 | Y.Map → `SafetyMapSchema` / `TelemetryMapSchema` |
| **Web**     | forms                                 | `@hookform/resolvers/zod` + shared 스키마        |
| **Backend** | `common/pipes/zod-validation.pipe.ts` | `@Body()` — class-validator 대신 shared          |
| **Backend** | `command-grade.guard.ts`              | `CommandSchema.parse(body)` → `evaluateIngress`  |
| **Sync**    | `extensions/yjs-schema-guard.ts`      | Yjs write — control/safety · Grade3 reject       |
| **Sync**    | `extensions/persistence.ts`           | DB 저장 전 `safeParse`                           |
| **Desktop** | `bridge/dto/`                         | Zod **미사용** — OpenAPI → pydantic (§DevOps)    |

```text
REST / WS / Y.Map / Worker msg
        → @nexa/shared/schemas.safeParse()
        → OK: z.infer → store · DB · commandTracker
        → FAIL: 400 · drop · audit
```

**규칙**: `commands` = Grade **discriminatedUnion** · `dtos` = REST 폴링(§복구)과 ingest **동일** · `yjs` = map-keys별 payload. 앱별 duplicate schema · UI 내부 `as Type` **금지**.

```ts
// schemas/commands/command.schema.ts (개념)
export const CommandSchema = z.discriminatedUnion('grade', [
  /* Grade1|2|3 */
])
export type CommandPayload = z.infer<typeof CommandSchema>
```

### `apps/sync/` — Hocuspocus 독립 서버 (SSOT)

> **NestJS(`apps/backend`)에 `@hocuspocus/server`를 임베드하지 않습니다.** 저수준 Yjs WebSocket과 Nest HTTP/REST·DI·미들웨어가 한 프로세스에 섞이면 프로토콜·이벤트 루프 충돌과 CRDT 지연 위험이 있습니다.

| 항목           | 규칙                                                                            |
| -------------- | ------------------------------------------------------------------------------- |
| **런타임**     | 순수 Node.js — `apps/sync/src/server.ts`                                        |
| **인증**       | `onAuthenticate` → `apps/backend/modules/auth` REST로 JWT·ReadOnly 스코프 검증  |
| **영속화**     | `onStoreDocument` → Prisma/DB (backend와 DB URL 공유 가능, **프로세스는 분리**) |
| **공유 타입**  | `packages/shared` — `schemas/` · `commands/` · `yjs/map-keys`                   |
| **클라이언트** | `apps/web` — `@hocuspocus/provider` + `useHocuspocus.ts` → `ws://sync:1234`     |
| **배포**       | `docker-compose` · K8s에서 **backend와 별도 서비스·스케일**                     |

```text
[Next.js] ──WS──► apps/sync (Hocuspocus :1234)
                      │ onAuthenticate
                      └──HTTP──► apps/backend/auth (JWT)
[Next.js] ──REST──► apps/backend (:3001)
```

---

### `apps/desktop/` (Python · PyQt)

> **상세 SSOT**: [`_NEXA-OS-apps-desktop-설계-명세.md`](./_NEXA-OS-U2BEE-apps-desktop-설계-명세.md) — 폴더 트리 · 통신 3갈래 · U2BEE 분담 · IPC · 체크리스트

| 한 줄 | PyQt 셸 — OS·듀얼 웹뷰·`bridge/nestjs_client`. UI는 `apps/web` embed URL 렌더. pnpm 워크스페이스 **외부**.

---

## 🛠️ 개발자 경험(DX) 및 환경 구축 (DevOps)

> **대상**: `apps/web` · `apps/backend` · `apps/sync` · `packages/shared`(pnpm) + **`apps/desktop`**(Python)을 **동시에** 다루는 개발자.  
> Desktop 상세 → [`_NEXA-OS-apps-desktop-설계-명세.md`](./_NEXA-OS-U2BEE-apps-desktop-설계-명세.md).

### 런타임 4+1 (로컬)

| #   | 런타임            | 패키지 매니저                        | 포트(기본)   |
| --- | ----------------- | ------------------------------------ | ------------ |
| 1   | `apps/web`        | pnpm                                 | `:3000`      |
| 2   | `apps/backend`    | pnpm                                 | `:3001`      |
| 3   | `apps/sync`       | pnpm                                 | `:1234` (WS) |
| 4   | `packages/shared` | pnpm (빌드 라이브러리)               | —            |
| 5   | `apps/desktop`    | **pip / uv** (워크스페이스 **외부**) | —            |

```text
[개발자 PC]
  pnpm dev (또는 docker compose --profile full up)
  python -m nexa_desktop          ← apps/desktop (선택)
```

---

### Docker Compose — 원클릭 개발 환경

**파일**: 루트 `docker-compose.yml` · `.env.example` · `scripts/docker/`

#### 프로필 (Profile)

| Profile           | 서비스                             | 용도                                                       |
| ----------------- | ---------------------------------- | ---------------------------------------------------------- |
| **`core`** (기본) | `postgres` · `backend` · `sync`    | API + CRDT + DB — **최소 IoT 없이** UI·에디터 개발         |
| **`iot`**         | + `mosquitto` · `edge-gateway-sim` | MQTT Telemetry 폭주 · Grade3 **Pull** · 채널 B Worker 검증 |
| **`full`**        | + `web` (hot reload volume)        | 브라우저만 열면 `:3000` — **신규 온보딩**                  |

```bash
# 최소 (DB + Nest + Hocuspocus)
docker compose --profile core up -d

# IoT·엣지 시나리오 (+ MQTT + 시뮬레이터)
docker compose --profile core --profile iot up -d

# 웹까지 컨테이너 (로컬 pnpm dev 대신)
docker compose --profile full up -d
```

#### 서비스 구성

| 서비스               | 이미지 / 빌드                     | 포트                | 역할                                       |
| -------------------- | --------------------------------- | ------------------- | ------------------------------------------ |
| **postgres**         | `postgres:16` (+ pgvector 옵션)   | `5432`              | Prisma · audit · edge-queue                |
| **backend**          | `apps/backend/Dockerfile.dev`     | `3001`              | Nest REST · Swagger export                 |
| **sync**             | `apps/sync/Dockerfile.dev`        | `1234`              | Hocuspocus — **Nest와 분리**               |
| **web**              | `apps/web/Dockerfile.dev`         | `3000`              | Next dev (`full` 프로필)                   |
| **mosquitto**        | `eclipse-mosquitto:2`             | `1883` · `9001`(WS) | 로컬 MQTT 브로커 — 센서 Telemetry **주입** |
| **edge-gateway-sim** | `scripts/docker/edge-gateway-sim` | — (내부)            | **엣지 게이트웨이 시뮬**                   |

#### `edge-gateway-sim` 동작 (로컬)

실제 폐쇄망 Edge를 대신해 **채널 B + Grade3 Pull** 을 재현합니다.

```text
mosquitto (:1883)
    ▲ publish (500/s 옵션 — TELEMETRY-FLOOD 테스트)
    │ edge-gateway-sim
    │   · MQTT subscribe → backend WS relay (또는 web websocket mock)
    │   · 주기적 GET backend/edge-queue/pull (Grade3 명령 소비 시뮬)
    └── backend (:3001) — edge-queue · iot snapshot
```

| env (`.env.example`)              | 설명                                  |
| --------------------------------- | ------------------------------------- |
| `MQTT_URL=mqtt://mosquitto:1883`  | web `engines/websocket.ts` · sim 공통 |
| `EDGE_SIM_PUBLISH_RATE=500`       | Flood 시나리오 msg/s                  |
| `EDGE_SIM_DEVICE_ID=sim-edge-01`  | Telemetry topic prefix                |
| `BACKEND_URL=http://backend:3001` | Pull 대상                             |

```yaml
# docker-compose.yml (개념 — iot 프로필 발췌)
services:
  mosquitto:
    profiles: [iot]
    image: eclipse-mosquitto:2
    ports: ['1883:1883', '9001:9001']
    volumes: ['./scripts/docker/mosquitto/mosquitto.conf:/mosquitto/config/mosquitto.conf']

  edge-gateway-sim:
    profiles: [iot]
    build: ./scripts/docker/edge-gateway-sim
    environment:
      MQTT_URL: mqtt://mosquitto:1883
      BACKEND_URL: http://backend:3001
      EDGE_SIM_PUBLISH_RATE: ${EDGE_SIM_PUBLISH_RATE:-10}
    depends_on: [mosquitto, backend]
```

#### 원클릭 스크립트 (호스트에서 pnpm + 선택 desktop)

```powershell
# scripts/dev.ps1 (Windows SSOT)
docker compose --profile core --profile iot up -d
pnpm install
pnpm --filter @nexa/shared build
pnpm dev                                    # turbo: web + backend + sync 동시
# 선택: apps/desktop/scripts/dev.ps1 → python -m nexa_desktop
```

```bash
# scripts/dev.sh (Unix)
docker compose --profile core --profile iot up -d
pnpm install && pnpm --filter @nexa/shared build && pnpm dev
```

| 명령             | 설명                                              |
| ---------------- | ------------------------------------------------- |
| `pnpm dev`       | turbo — `web` · `backend` · `sync` **병렬** watch |
| `pnpm dev:web`   | Next만 (backend/sync는 docker)                    |
| `pnpm dev:stack` | docker `core` + `pnpm dev:web`                    |
| `pnpm dev:iot`   | docker `core`+`iot` + `EDGE_SIM_PUBLISH_RATE=500` |

> **의견**: 일상 UI 작업은 `core`만으로 충분. **Worker·Circuit·Grade3·TELEMETRY-FLOOD-500** 작업 시 `--profile iot`를 켭니다.

---

### 타입·DTO 전파 워크플로 (`packages/shared` → 각 앱)

TypeScript 3앱은 **`packages/shared` 단일 SSOT**. Python Desktop은 **OpenAPI 미러** 경로를 씁니다.

```text
                    packages/shared/src/
                    ├── schemas/      ──► Zod SSOT · z.infer → types
                    ├── commands/     ──► web · backend · sync (pnpm workspace import)
                    ├── dtos/         ──► schemas re-export
                    ├── yjs/
                    └── openapi/
                         openapi.json  ◄── export (Nest Swagger)
                              │
                              ▼
                    apps/desktop/nexa_desktop/bridge/dto/   (pydantic — generate_client.py)
```

#### 1) `packages/shared` 변경 → TS 3앱 반영

| 단계 | 동작               | 도구                                                 |
| ---- | ------------------ | ---------------------------------------------------- |
| 1    | `shared` 소스 수정 | `packages/shared/src/**`                             |
| 2    | 라이브러리 재빌드  | `pnpm --filter @nexa/shared build` (tsc)             |
| 3    | 의존 앱 타입체크   | turbo `dependsOn: ["^build"]` — web · backend · sync |
| 4    | dev watch          | `pnpm dev` 시 shared `tsc --watch` 선행              |

**규칙**: web/backend/sync **상호 import 금지** — 교차 타입·스키마는 `packages/shared`만. `schemas/`·`commands/` 변경 시 `pnpm test:security` 필수.

#### 2) Nest OpenAPI → Python pydantic (`generate_client.py`)

**경로**

```text
scripts/export-openapi.ts                        # Nest → openapi.json
apps/desktop/scripts/generate_client.py
apps/desktop/nexa_desktop/bridge/dto/            # 생성물 (hand-edit 금지)
packages/shared/openapi/openapi.json             # SSOT 아카이브 (CI diff)
```

**`generate_client.py` 작동 방식**

| Step         | 처리                                                         |
| ------------ | ------------------------------------------------------------ |
| **① 입력**   | `openapi.json` 없으면 `pnpm openapi:export` 실행             |
| **② 정규화** | `components/schemas/*` ↔ shared DTO 이름 매핑               |
| **③ 생성**   | `datamodel-code-generator` → pydantic v2 `models.py`         |
| **④ 후처리** | `dto/__init__.py` re-export · `nestjs_client.py` import 고정 |
| **⑤ 검증**   | `python -m compileall bridge/dto` · openapi hash snapshot    |

```python
# apps/desktop/scripts/generate_client.py (개념)
ROOT = Path(__file__).resolve().parents[3]
OPENAPI = ROOT / "packages/shared/openapi/openapi.json"
OUT = Path(__file__).resolve().parents[1] / "nexa_desktop/bridge/dto"

def ensure_openapi() -> None:
    if not OPENAPI.exists():
        subprocess.run(["pnpm", "openapi:export"], cwd=ROOT, check=True)

def generate() -> None:
    subprocess.run([
        sys.executable, "-m", "datamodel_code_generator",
        "--input", str(OPENAPI),
        "--output", str(OUT / "models.py"),
        "--output-model-type", "pydantic_v2.BaseModel",
    ], check=True)
```

**루트 스크립트**

```json
{
  "scripts": {
    "openapi:export": "tsx scripts/export-openapi.ts",
    "openapi:desktop": "pnpm openapi:export && python apps/desktop/scripts/generate_client.py",
    "postbuild:backend": "pnpm openapi:export"
  }
}
```

#### 3) 변경 체크리스트 (개발자용)

| 변경                  | 필수 작업                                          |
| --------------------- | -------------------------------------------------- |
| `shared` DTO·commands | `pnpm --filter @nexa/shared build` → 3앱 typecheck |
| backend API 스키마    | `pnpm openapi:desktop` → `bridge/dto` diff commit  |
| `yjs/map-keys`        | shared + sync + web **동시** PR                    |
| MQTT topic            | mosquitto + `edge-gateway-sim` env                 |

#### 4) Desktop + TS 동시 개발 순서

1. `cp .env.example .env` · `docker compose --profile core --profile iot up -d`
2. `pnpm install` · `pnpm dev`
3. (DTO 변경 시) `pnpm openapi:desktop`
4. `cd apps/desktop` · `pip install -e .` · `python -m nexa_desktop`

| env                | dev 기본값              |
| ------------------ | ----------------------- |
| `NEXA_BACKEND_URL` | `http://127.0.0.1:3001` |
| `NEXA_WEB_URL`     | `http://127.0.0.1:3000` |
| `NEXA_SYNC_WS`     | `ws://127.0.0.1:1234`   |

---

### 미션 크리티컬 IoT · 보안 등급 (디렉토리 보완)

§**미션 크리티컬 IoT 데이터 전략**·§**보안 3등급**을 수용하기 위해 `apps/web/src`·`apps/backend`·`apps/sync`·`packages/shared`에 아래를 명시합니다.

```yaml
apps/sync/src/
├── server.ts                    # @hocuspocus/server — Nest와 별도 프로세스
└── extensions/
    ├── authenticate.ts          # JWT — backend/auth 검증
    └── persistence.ts           # onStoreDocument

apps/web/src/
├── workers/
│   └── telemetryProcessor.ts    # 일반 Telemetry — Worker에서 버퍼링 후 메인으로 전달
├── hooks/
│   ├── useYjsSync.ts              # observe ↔ REST polling (§복구)
│   └── useHocuspocus.ts           # apps/sync WS · SYNC_OFFLINE
├── store/
│   ├── useSafetyStore.ts          # 🚨 긴급·안전·제어
│   ├── useTelemetryStore.ts       # 📈 일반 수집 (차트 등)
│   └── useConnectionStore.ts      # degradedMode · syncStatus · circuitState
├── guards/
│   └── authGuard.ts               # 2등급 MFA 강제 등
└── engines/
    ├── socketEmitter.ts           # 긴급 정지 — 렌더 경로 우회
    ├── syncFallback.ts            # REST 폴링 · backoff
    ├── commandTracker.ts          # 송신→ACK · timeout/blocked
    └── healthWatchdog.ts          # Circuit Breaker · FPS · Worker 큐

apps/backend/src/modules/
├── iot/                           # safety-snapshot · telemetry-snapshot (폴링 SSOT)
└── edge-queue/
    └── edge-persistence.ts        # 서버 다운 시 현장 자율

apps/backend/src/common/interceptors/
└── audit-log.interceptor.ts       # time-sync 타임스탬프 사용

packages/shared/src/
├── schemas/                       # Zod — commands · dtos · yjs payloads
├── commands/
├── yjs/
└── time-sync.ts
```

| 경로                                       | 설계 근거                                                                           |
| ------------------------------------------ | ----------------------------------------------------------------------------------- |
| **`workers/`**                             | 대량 Telemetry가 와도 **메인 스레드 분리** — §3대 수칙 ① Web Worker                 |
| **`useSafetyStore` / `useTelemetryStore`** | 화재·고장 알람이 차트 데이터에 밀리지 않도록 **상태 분리** — ② useTransition과 연동 |
| **`engines/socketEmitter.ts`**             | [긴급 정지] 클릭이 React re-render에 갇히지 않게 **즉시 송신** — ③ 제어 단선        |
| **`guards/authGuard.ts`**                  | 2등급(소프트 제어) **MFA** 프론트 게이트                                            |
| **`audit-log.interceptor.ts`**             | 2등급 이상 NestJS **감사 로그** (금융권 수준 추적)                                  |
| **`packages/shared/schemas`**              | Zod **런타임 parse** — web · backend · sync 경계 검증                               |
| **`packages/shared/commands`**             | 1·2·3등급 명령 — schemas에서 z.infer                                                |
| **`packages/shared/yjs/`**                 | Y.Map 키·room 이름 — web·sync **동일 상수**                                         |
| **`packages/shared/time-sync.ts`**         | Audit·commandTracker **공통 시각** — 사고 선후 분석                                 |
| **`engines/commandTracker.ts`**            | 명령 **송신~완료** 피드백 — socketEmitter와 쌍                                      |
| **`engines/healthWatchdog.ts`**            | Circuit Breaker · 과부하 시 Telemetry 차단 · Safety 텍스트 모드 (§복구)             |
| **`engines/syncFallback.ts`**              | sync 장애 시 REST 폴링 · `useYjsSync` Strategy (§복구)                              |
| **`store/useConnectionStore.ts`**          | `degradedMode` SSOT · SystemStatusBar 연동                                          |
| **`modules/iot/`**                         | `safety-snapshot` / `telemetry-snapshot` — 폴링 API                                 |
| **`edge-persistence.ts`**                  | 서버 장애 시 **현장 큐·안전 정책** 로컬 유지                                        |

> `useDeviceStore`는 범용 IoT 버퍼가 필요할 때만 추가. 기본은 Safety / Telemetry 이원화.

---

## 🧪 미션 크리티컬 설계 검증 (Verification Methodology)

> 정적 체크리스트(파일 존재)만으로는 **미션 크리티컬**을 보장할 수 없습니다. 본 절은 **부하·보안 등급**을 **자동화 테스트**로 증명하는 SSOT입니다. CI에서 **merge gate**로 실행합니다.

### 검증 3층 (Test Pyramid)

| 층                   | 대상                                               | 도구                               | CI 게이트                                    |
| -------------------- | -------------------------------------------------- | ---------------------------------- | -------------------------------------------- |
| **L1 — Contract**    | `packages/shared/commands` · DTO · 등급 규칙       | Vitest                             | **필수** — 모든 PR                           |
| **L2 — Integration** | Worker · `healthWatchdog` · guard · sync extension | Vitest + jsdom / `@nestjs/testing` | **필수** — `web`·`backend`·`sync` 변경 시    |
| **L3 — E2E / Load**  | 브라우저 FPS · Circuit · degraded UI               | Playwright · 전용 harness 페이지   | **필수** — release · nightly · IoT 경로 변경 |

```text
pnpm test:unit          # packages/shared (+ 각 앱 unit)
pnpm test:integration   # backend guard · sync filter · worker
pnpm test:load          # TELEMETRY-FLOOD-500 (Playwright)
pnpm test:security      # Grade1/2/3 matrix — shared SSOT 기반
```

---

### 1. 부하 테스트 — `TELEMETRY-FLOOD-500`

**목적**: 초당 **≥500건** Telemetry를 `telemetryProcessor`에 주입해도 **메인 스레드 FPS**와 **Safety ingest**가 §미션 크리티컬·§복구 기준을 만족하는지 측정합니다.

#### 시나리오 SSOT

| Phase             | 시간              | 주입                               | 측정                               |
| ----------------- | ----------------- | ---------------------------------- | ---------------------------------- |
| **Baseline**      | 10s               | 0 msg/s                            | FPS 기준선                         |
| **Flood**         | 30s               | **500 msg/s** (고정)               | FPS · Worker backlog · Safety 지연 |
| **Safety inject** | Flood 중 t=15s    | **1건** `useSafetyStore` 경로 알람 | ingest latency                     |
| **Recovery**      | Flood 종료 후 20s | 0                                  | Circuit CLOSE · FPS 복귀           |

**주입 경로** (프로덕션과 동일): `engines/websocket.ts` **mock** → `telemetryProcessor` Worker — 메인 스레드에서 `ingest()` 직접 호출 **금지** (§체크리스트 ③).

#### FPS 측정 (메인 스레드)

`healthWatchdog`과 **동일 알고리즘**을 테스트 harness에서 재사용합니다.

```ts
// apps/web/src/engines/__tests__/helpers/fpsSampler.ts
export async function sampleFps(durationMs: number): Promise<{ p50: number; p10: number; min: number }> {
  const samples: number[] = []
  let last = performance.now()
  const end = last + durationMs
  await new Promise<void>((resolve) => {
    function tick(now: number) {
      samples.push(1000 / (now - last))
      last = now
      if (now < end) requestAnimationFrame(tick)
      else resolve()
    }
    requestAnimationFrame(tick)
  })
  samples.sort((a, b) => a - b)
  const pct = (p: number) => samples[Math.floor(samples.length * p)] ?? 0
  return { p50: pct(0.5), p10: pct(0.1), min: samples[0] ?? 0 }
}
```

#### 합격 기준 (Pass Criteria)

| 지표               | Baseline (10s) | Flood (30s)                                          | Safety inject (1회)                  | Recovery (20s)                  |
| ------------------ | -------------- | ---------------------------------------------------- | ------------------------------------ | ------------------------------- |
| **FPS p50**        | **≥ 55**       | **≥ 24**                                             | —                                    | **≥ 24**                        |
| **FPS p10**        | **≥ 50**       | **≥ 15**                                             | —                                    | **≥ 15**                        |
| **Safety ingest**  | —              | —                                                    | **≤ 200ms** (알람 → store 반영)      | —                               |
| **Worker backlog** | < 50           | Circuit OPEN 허용 · **Safety 경로 지연 >500ms 금지** | —                                    | **< 100** (10s 유지)            |
| **degradedMode**   | `NORMAL`       | `TELEMETRY_CIRCUIT_OPEN` **허용** (설계 의도)        | `NORMAL` 유지 불필요 · Safety만 필수 | `NORMAL` 또는 Circuit **CLOSE** |

> **판정**: Flood 중 FPS p10 < 15 **이면서** Circuit이 **OPEN 되지 않으면 FAIL** (워치독 미구현).  
> Flood 중 Safety ingest > 200ms → **즉시 FAIL** (최우선 경로 붕괴).

#### Harness · CI

```text
apps/web/src/
├── workers/__tests__/
│   └── telemetryProcessor.load.spec.ts   # Worker 단독 — 500/s postMessage
├── engines/__tests__/
│   ├── healthWatchdog.circuit.spec.ts
│   └── helpers/
│       ├── fpsSampler.ts
│       └── telemetryFloodInjector.ts     # mock WS → Worker
└── e2e/
    └── telemetry-flood-500.spec.ts       # Playwright — Dashboard + 차트 mounted
```

```ts
// e2e/telemetry-flood-500.spec.ts (개념)
test('TELEMETRY-FLOOD-500', async ({ page }) => {
  await page.goto('/dashboard?testHarness=telemetry-flood')
  const baseline = await page.evaluate(() => window.__nexaTest.sampleFps(10_000))
  expect(baseline.p50).toBeGreaterThanOrEqual(55)

  await page.evaluate(() => window.__nexaTest.startFlood(500))
  await page.waitForTimeout(30_000)
  const flood = await page.evaluate(() => window.__nexaTest.sampleFps(5_000))
  expect(flood.p10).toBeGreaterThanOrEqual(15)

  await page.evaluate(() => window.__nexaTest.injectSafetyAlarm())
  const latency = await page.evaluate(() => window.__nexaTest.lastSafetyIngestMs())
  expect(latency).toBeLessThanOrEqual(200)

  await page.evaluate(() => window.__nexaTest.stopFlood())
  await expect(page.getByTestId('degraded-mode')).not.toHaveText('CIRCUIT_OPEN', { timeout: 20_000 })
})
```

---

### 2. 보안 등급 검증 — `packages/shared/commands` 연동

**목적**: 🔴 **3등급(Grade3)** 제어 명령이 **외부망 Yjs/WS·공인 REST** 경로로 유입될 때 **모든 레이어에서 차단**되는지 SSOT 타입 기준으로 검증합니다.

#### SSOT — 공유 테스트 매트릭스

`packages/shared/src/commands/`에 **등급·경로·기대 결과**를 한곳에 정의하고, web · backend · sync 테스트가 **동일 fixture**를 import합니다.

```text
packages/shared/src/commands/
├── command-grade.enum.ts
├── command.types.ts
├── security-requirements.ts      # 등급별 허용 경로 · MFA · audit
├── test-fixtures/
│   ├── command-fixtures.ts       # createMockCommand(grade, payload)
│   └── grade-route-matrix.ts     # ★ SSOT — [grade × ingress] → expect
└── __tests__/
    └── command-grade.contract.spec.ts
```

```ts
// packages/shared/src/commands/test-fixtures/grade-route-matrix.ts
import { CommandGrade } from '../command-grade.enum'

export type IngressPath = 'yjs-external' | 'rest-external' | 'rest-internal-vpn' | 'edge-pull'

export type GradeExpectation = 'allow' | 'deny' | 'deny-no-ui'

/** [grade × ingress] → 기대 동작 — web/backend/sync 테스트 공통 SSOT */
export const GRADE_ROUTE_MATRIX: Record<CommandGrade, Partial<Record<IngressPath, GradeExpectation>>> = {
  [CommandGrade.Grade1]: {
    'yjs-external': 'allow', // ReadOnly scope
    'rest-external': 'allow',
  },
  [CommandGrade.Grade2]: {
    'yjs-external': 'allow', // MFA + audit (sync/backend)
    'rest-external': 'allow',
  },
  [CommandGrade.Grade3]: {
    'yjs-external': 'deny', // ★ 외부망 Yjs 차단
    'rest-external': 'deny', // ★ 공인 REST 차단
    'rest-internal-vpn': 'deny', // 브라우저 경유 Push 금지
    'edge-pull': 'allow', // Edge-gateway Pull only
  },
}
```

#### 레이어별 자동화 테스트

| 레이어          | 파일                                                            | 검증 내용                                                                                            |
| --------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **L1 Contract** | `commands/__tests__/command-grade.contract.spec.ts`             | `security-requirements.ts`가 matrix와 **일치** · Grade3 + `yjs-external` → `deny`                    |
| **Backend**     | `common/guards/command-grade.guard.spec.ts`                     | `POST /control` + Grade3 + `X-Forwarded-For`(외부) → **403** · Audit **미기록**(거부 선행)           |
| **Sync**        | `apps/sync/src/extensions/__tests__/yjs-command-filter.spec.ts` | Y.Map `control` 키에 Grade3 write → **transaction reject** · persistence **skip**                    |
| **Web**         | `guards/__tests__/command-emission.spec.ts`                     | `socketEmitter`·`useYjsSync` 역쓰기 경로에 Grade3 payload → **throw / blocked** · 제어 UI **미노출** |

```ts
// packages/shared/src/commands/__tests__/command-grade.contract.spec.ts
import { describe, it, expect } from 'vitest'
import { CommandGrade } from '../command-grade.enum'
import { GRADE_ROUTE_MATRIX } from '../test-fixtures/grade-route-matrix'
import { evaluateIngress } from '../security-requirements'

describe('CommandGrade × Ingress (SSOT matrix)', () => {
  for (const [grade, routes] of Object.entries(GRADE_ROUTE_MATRIX)) {
    for (const [ingress, expected] of Object.entries(routes ?? {})) {
      it(`${grade} + ${ingress} → ${expected}`, () => {
        expect(evaluateIngress(Number(grade) as CommandGrade, ingress as any)).toBe(expected)
      })
    }
  }

  it('Grade3 must never allow yjs-external', () => {
    expect(GRADE_ROUTE_MATRIX[CommandGrade.Grade3]['yjs-external']).toBe('deny')
  })
})
```

```ts
// apps/sync/src/extensions/__tests__/yjs-command-filter.spec.ts (개념)
it('rejects Grade3 control write from external Y.Doc transaction', async () => {
  const doc = new Y.Doc()
  const update = encodeGrade3ControlWrite(doc) // fixture from shared
  const result = await applyYjsCommandFilter(update, { ingress: 'yjs-external', jwtScope: 'read-write' })
  expect(result.accepted).toBe(false)
  expect(result.reason).toMatch(/Grade3|external|denied/i)
})
```

```ts
// apps/backend/.../command-grade.guard.spec.ts (개념)
it('returns 403 for Grade3 on external REST', () => {
  const cmd = createMockCommand(CommandGrade.Grade3, { action: 'MAIN_POWER_OFF' })
  expect(() => guard.canActivate(mockContext({ body: cmd, ip: '203.0.113.1' }))).toThrow(ForbiddenException)
})
```

#### CI · Merge Gate

```yaml
# .github/workflows/mission-critical.yml (개념)
jobs:
  security-grade:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm test:security # shared matrix → backend → sync → web
  telemetry-load:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm exec playwright install chromium
      - run: pnpm test:load # TELEMETRY-FLOOD-500 — release/nightly 또는 IoT 라벨 PR
```

| 게이트                         | 조건                                                   |
| ------------------------------ | ------------------------------------------------------ |
| **PR (IoT·commands·sync)**     | `test:security` + `test:unit` **필수 green**           |
| **PR (Worker·healthWatchdog)** | + Worker integration spec                              |
| **Release / nightly**          | + `TELEMETRY-FLOOD-500` E2E                            |
| **Regression**                 | matrix·FPS 기준 변경 시 **ADR 또는 본 문서** 동시 수정 |

---

### 3. 체크리스트 연동 (⑤ 검증 축)

정적 4축(①~④)에 더해, **⑤ 검증**이 green이어야 “미션 크리티컬 구현 완료”로 간주합니다.

| 검증 ID             | 스펙                     | 합격                                                         |
| ------------------- | ------------------------ | ------------------------------------------------------------ |
| **V-LOAD-500**      | §TELEMETRY-FLOOD-500     | Flood FPS p10 ≥ 15 · Safety ≤ 200ms · Recovery Circuit CLOSE |
| **V-SEC-G3-YJS**    | Grade3 + `yjs-external`  | sync filter **deny** · web emit **blocked**                  |
| **V-SEC-G3-REST**   | Grade3 + `rest-external` | `command-grade.guard` **403**                                |
| **V-SEC-G3-EDGE**   | Grade3 + `edge-pull`     | edge-queue **allow** (대조군 — false negative 방지)          |
| **V-SYNC-FALLBACK** | sync kill + REST 폴링    | `SYNC_OFFLINE` · Safety snapshot ingest (§복구)              |

---

### ✅ V2.1 완성 체크리스트 (SSOT · 4+1축 통합)

> **인프라 전제** (§핵심 아키텍처 3원칙): `apps/sync` 독립 · 에디터↔Yjs **양방향** / IoT→Zustand **단방향** · `packages/shared` — web · backend · sync 공유.

구현·리뷰·AI 생성 시 **아래 한 표 + §⑤ 검증(V-\*)** 로 검증합니다. (4축 필수 + ⑤ 검증 + 권장 분리)

#### 필수 — 4축 (하나라도 없으면 미완성)

| 축               | 필수 경로                                                                                                                                      | 누락 시                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **① 레이아웃**   | `domainLayoutRegistry` · `globalMenu` · `SystemStatusBar` + **`StatusOpsPanel`** (+ `statusPanel`) · `useRuntimeMetricsStore` · `semantic.css` | 슬롯 불일치 · Expanded **메트릭 표준** 미준수 · Safety semantic 임의 색                    |
| **② 보안**       | `packages/shared/src/commands/` · `backend/.../audit-log.interceptor.ts`                                                                       | 등급·명령 타입 불일치 · 2등급+ **감사 추적 불가**                                          |
| **③ IoT·동기화** | `apps/sync` + `useYjsSync` + Worker A/B 쌍 + `socketEmitter` + **`syncFallback`** + **`useConnectionStore`**                                   | Nest 내부 Hocuspocus · A/B 단독 · sync 장애 시 **Safety 미수신** · 폭주 시 **Safety 밀림** |
| **④ 도메인**     | `domains/*/views/{left,content,right}/` (+ `status/` 권장)                                                                                     | registry만 있고 **뷰 파일 없음**                                                           |
| **⑤ 검증**       | `pnpm test:security` · `TELEMETRY-FLOOD-500` · `commands/test-fixtures/grade-route-matrix.ts` (§미션 크리티컬 설계 검증)                       | V-\* **FAIL** · Grade3 Yjs 유입 **미차단** · Flood 시 Safety >200ms                        |

**레이아웃 연동**: `globalMenu` → `domainKey` → `MainShellLayout` → registry → L/R Drawer · Content(스크롤) · **SystemStatusBar** · **`themePreset`**.  
**Desktop embed**: `(embed)/u2bee/*` + `U2BeeMinimalLayout` — [`desktop 설계 명세`](./_NEXA-OS-U2BEE-apps-desktop-설계-명세.md) §8.

**보안 등급 (요약)**

| 등급 | 프론트                         | 백엔드·sync                             | SSOT             |
| ---- | ------------------------------ | --------------------------------------- | ---------------- |
| 🟢 1 | `useHocuspocus` ReadOnly       | `apps/sync` + `backend/auth` JWT        | `commands`       |
| 🟡 2 | `authGuard` (권장→필수화 검토) | `audit-log` + `control`                 | `commands` + MFA |
| 🔴 3 | Yjs/WS 제어 UI **없음**        | `edge-queue` + `edge-gateway` Pull only | `commands`       |

**IoT 채널 필수 쌍** — **A+B 동시** (§미션 크리티컬 표 참고)

|       | 경로                                     | 단독 시                        |
| ----- | ---------------------------------------- | ------------------------------ |
| **A** | `useYjsSync.ts`                          | B 없음 → WS 폭주 **프리징**    |
| **B** | `websocket.ts` → `telemetryProcessor.ts` | A 없음 → Yjs Safety **미유입** |

> `websocket.onmessage`에서 `useTelemetryStore.ingest()` 직접 호출 **금지**.

**Grade 3 경로**

```text
[브라우저] ──WS──► apps/sync (🟢·🟡 Y.Doc) ──auth──► backend
[edge-queue] ◄── Pull ── edge-gateway ◄── MQTT/Modbus (폐쇄망)   ✗ Yjs/WS Push
```

#### 권장 (금융·하드 제어·신뢰성)

| 경로                                          | 누락 시                                                            |
| --------------------------------------------- | ------------------------------------------------------------------ |
| `guards/authGuard.ts`                         | 2등급 MFA UI 없음                                                  |
| `modules/edge-queue/` + `edge-gateway/`       | 3등급 외부망 유출                                                  |
| `engines/commandTracker.ts`                   | 명령 완료 미확인 · timeout/blocked 미처리                          |
| `engines/syncFallback.ts`                     | sync 장애 시 Safety **폴링 공백**                                  |
| `store/useConnectionStore.ts`                 | degradedMode·배너 **미표시**                                       |
| `modules/iot/` (snapshot API)                 | REST 폴백 **엔드포인트 없음**                                      |
| `edge-queue/edge-persistence.ts`              | 서버 장애 시 현장 안전 중단                                        |
| `packages/shared/time-sync.ts`                | Audit 선후 왜곡                                                    |
| `engines/healthWatchdog.ts`                   | Circuit Breaker 미동작 → Safety 밀림                               |
| `packages/shared/commands/test-fixtures/`     | Grade×Ingress matrix SSOT **없음** → 보안 테스트 분열              |
| `pnpm test:security` · `pnpm test:load`       | TELEMETRY-FLOOD-500 · Grade3 차단 **CI 미실행**                    |
| `docker-compose.yml` (+ `iot` profile)        | 로컬 MQTT·edge-gateway-sim **없음** → 채널 B·Grade3 Pull 수동 재현 |
| `pnpm openapi:desktop` · `generate_client.py` | backend API 변경 후 desktop pydantic **드rift**                    |

**신규 도메인**: `views/{left,content,right}` → registry `statusBar`/`statusPanel`/`themePreset` → `globalMenu`에 `domainKey`.

> **AI·코드 생성**: 본 체크리스트 = SSOT. **⑤ 검증(V-\*)** green 없이 merge 금지 (§미션 크리티컬 설계 검증). repo에 미구현 파일 있을 수 있음.  
> **삭제된 상세본(4대 핵심·항목별 체크리스트·IoT 코드 패턴)** → [`_NEXA-OS-V2.1-아카이브-4대핵심-및-체크리스트-상세.md`](./_NEXA-OS-V2.1-아카이브-4대핵심-및-체크리스트-상세.md) (학습용)

### 도메인 레이아웃 등록 예시 (개념)

```ts
// frame/navigation/globalMenu.ts — 헤더 전역 메뉴 (도메인 전환)
export const globalMenuTabs = [
  { name: 'home', route: '/', label: 'Home', domainKey: 'home' },
  { name: 'nexia', route: '/nexia', label: 'Nexia', domainKey: 'nexia', nexaPrefix: true },
  { name: 'dashboard', route: '/dashboard', label: 'IoT', domainKey: 'dashboard' },
  { name: 'ais', route: '/ais', label: 'AIS', domainKey: 'ais' },
  { name: 'u2bee', route: '/u2bee', label: 'U2BEE', domainKey: 'u2bee' },
] as const

// frame/registry/domainLayoutRegistry.ts — 선택된 도메인 안의 슬롯만
export const domainLayoutRegistry = {
  nexia: {
    left: () => import('@/domains/nexia/views/left/NexiaLeftNav'),
    content: () => import('@/domains/nexia/views/content/NexiaContent'),
    right: () => import('@/domains/nexia/views/right/NexiaRightPanel'),
    headerActions: () => import('@/domains/nexia/components/NexiaHeaderActions'),
    statusBar: () => import('@/domains/nexia/views/status/NexiaStatusBar'),
    statusPanel: () => import('@/domains/nexia/views/status/NexiaStatusPanel'),
    themePreset: 'office-light',
  },
  home: {
    left: () => import('@/domains/home/views/left/HomeLeftNav'),
    content: () => import('@/domains/home/views/content/HomeView'),
    right: null,
    themePreset: 'office-light',
  },
  dashboard: {
    left: () => import('@/domains/dashboard/views/left/DashboardLeftNav'),
    content: () => import('@/domains/dashboard/views/content/DashboardContent'),
    right: () => import('@/domains/dashboard/views/right/DashboardRightPanel'),
    statusBar: () => import('@/domains/dashboard/views/status/DashboardStatusBar'),
    statusPanel: () => import('@/domains/dashboard/views/status/DashboardStatusPanel'),
    themePreset: 'power-grid',
  },
  u2bee: {
    left: () => import('@/domains/u2bee/views/left/U2BeeLeftNav'),
    content: () => import('@/domains/u2bee/views/content/U2BeeContent'),
    right: () => import('@/domains/u2bee/views/right/U2BeeRightPanel'),
    headerActions: () => import('@/domains/u2bee/components/U2BeeHeaderActions'),
  },
} as const
```

**동작 요약**

1. `GlobalMainMenu` ← `globalMenu.ts` (`domainKey` 포함)
2. `MainShellLayout` ← registry → left / content(스크롤) / right / **statusBar** / **statusPanel**
3. `useLayoutStore` — 드로어 + `statusBarExpanded` · `statusBarDetailHeight`(기본 300)
4. Expanded → **StatusOpsPanel**(표준 8메트릭) + `registry.statusPanel` · 미등록 → StatusOpsPanel만

> IoT 채널 A/B 코드 패턴 · Grade3 — §2 · §미션 크리티컬 · **§완성 체크리스트** 참고.

## 🛡️ NEXA OS V2.1 반응형 레이아웃 5대 절대 원칙

`MainShellLayout` 기준 — **이중 스크롤·레이아웃 붕괴 방지**.

| #     | 원칙                     | 한 줄                                     | 구현                                                                   |
| ----- | ------------------------ | ----------------------------------------- | ---------------------------------------------------------------------- |
| **1** | **뷰포트 고정**          | 창 전체(`body`) 세로 스크롤 **금지**      | `MainShellLayout` = `100vh` 고정 · `flex` + `min-h-0`                  |
| **2** | **Content 단일 스크롤**  | 메인 작업 영역**만** 세로 스크롤          | `Content` → `flex-1 overflow-auto` (헤더·상태바는 고정)                |
| **3** | **드로어 내부 스크롤**   | L/R Drawer는 **자기 영역만** 스크롤       | 드로어 → `overflow-y-auto` (셸·Content에 영향 없음)                    |
| **4** | **Footer 없음 · 상태바** | `<footer>` 대신 **`SystemStatusBar`**     | compact **~30px** · expanded **≥300px** (`useLayoutStore`)             |
| **5** | **Store-Driven Layout**  | 드로어·상태바 크기/개폐는 **스토어 SSOT** | `useLayoutStore` — 폭·open·`statusBarExpanded`·`statusBarDetailHeight` |

```text
MainShellLayout (viewport lock)
├── Header (고정)
├── Body (flex-1 min-h-0)
│   ├── LeftDrawer   ← 내부 scroll (③)
│   ├── Content      ← 유일한 main scroll (②)
│   └── RightDrawer  ← 내부 scroll (③)
└── SystemStatusBar  ← Footer 대체 (④) · useLayoutStore (⑤)
```

---
