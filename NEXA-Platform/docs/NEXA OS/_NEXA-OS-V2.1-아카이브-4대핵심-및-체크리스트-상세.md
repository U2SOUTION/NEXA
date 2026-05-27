# NEXA OS V2.1 — 아카이브: 4대 핵심 · 체크리스트 상세 (학습용)

> **용도**: `_NEXA-OS-V2.1-설계-표준-및-미션크리티컬-전략.md` 문서 다이어트 시 **통합·삭제된 상세본**입니다.  
> **SSOT(현행 설계 기준)** 는 본문 **`§ V2.1 완성 체크리스트 (4축 통합)`** — 이 파일은 **학습·복습·심화 이해**용입니다.

---

## Part A. V2.1 최종 완성 — 4대 핵심 (원문)

> **인프라 전제** (§핵심 아키텍처 3원칙): `apps/sync` Hocuspocus **독립** · Tiptap/Monaco/Rivet↔Yjs **양방향** / IoT→Zustand **단방향** · `packages/shared`를 web·backend·sync가 공유.

구현·문서·AI 생성 시 **아래 4축이 모두 충족**되어야 V2.1 골격이 완성된 것으로 봅니다.

---

### A-1. ① `frame/` 시스템 — 동적 레지스트리

`frame/`을 앱 골격으로 분리합니다. **반드시 존재·연동**할 파일:

| 파일               | 전체 경로                                             | 역할                                                                                           |
| ------------------ | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **등록부**         | `apps/web/src/frame/registry/domainLayoutRegistry.ts` | `left` / `content` / `right` / `headerActions` / **`statusBar`** / **`statusPanel`** lazy 로드 |
| **전역 메뉴 SSOT** | `apps/web/src/frame/navigation/globalMenu.ts`         | 로고 옆 탭 — `route`, `label`, `icon`, **`domainKey`**                                         |

**연동 흐름**

```text
globalMenu → domainKey → MainShellLayout → registry
  → LeftDrawer / Content(스크롤) / RightDrawer / SystemStatusBar
```

**보조**: `useDomainLayout.ts`, `layoutRegistry.ts`(u2bee 팝업 등).

**Desktop embed**: `app/(embed)/u2bee/*` + `U2BeeMinimalLayout` — `MainShellLayout`·상태바 **미사용** (웹뷰 B 전용).

---

### A-2. ② 보안 등급 (Grade 1·2·3) 인프라

| 등급 | 프론트                               | 백엔드 / 동기화                                    | 공유 SSOT                         |
| ---- | ------------------------------------ | -------------------------------------------------- | --------------------------------- |
| 🟢 1 | `useHocuspocus` ReadOnly             | **`apps/sync`** (Hocuspocus) + `backend/auth` JWT  | `commands` — 조회·문서 편집       |
| 🟡 2 | **`guards/authGuard.ts`** (MFA 권장) | **`audit-log.interceptor.ts`** + `modules/control` | `commands` — MFA·감사 필수 플래그 |
| 🔴 3 | Yjs/WS 제어 UI **없음**              | `modules/edge-queue` + **`edge-gateway/`** · **`edge-pull-sse`** | `commands` — Edge Pull/SSE·폐쇄망만 |

| 구분           | 필수 경로                                                       | 역할                                                                      |
| -------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **공유**       | `packages/shared/src/commands/`                                 | 1·2·3등급 타입·보안 요구 **단일 정의** — web · backend · sync 동일 import |
| **감사**       | `apps/backend/src/common/interceptors/audit-log.interceptor.ts` | 2등급 이상 제어 — **위변조 불가** 감사 로그                               |
| **MFA 게이트** | `apps/web/src/guards/authGuard.ts`                              | 2등급 소프트 제어 전 MFA 팝업 강제 (권장)                                 |

```ts
// packages/shared/src/commands/command-grade.enum.ts (개념)
export enum CommandGrade {
  Grade1 = 1, // 조회·문서·레이아웃 — 외부망 OK
  Grade2 = 2, // 소프트 제어 — MFA + audit
  Grade3 = 3, // 하드 제어 — edge Pull only, Yjs 금지
}
```

---

### A-3. ③ 미션 크리티컬 IoT — Grade 3·실시간

**3등급**은 외부망(Yjs/Hocuspocus)과 **코드·물리 경로 분리**:

```text
[브라우저] ──WebSocket──► apps/sync (Hocuspocus) ──► 🟢·🟡 Y.Doc only
                              │ onAuthenticate
                              └──► apps/backend/auth (JWT 검증)
                         ✗ Grade3 Push 차단 · Nest 내부 Hocuspocus 금지

[edge-queue API] ◄── edge-pull-sse (EventSource) · GET pull (fallback) ── [edge-gateway] ◄── MQTT / Modbus (폐쇄망·VPN)
```

| 경로                               | 역할                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------ |
| `modules/edge-queue/`              | 큐 적재 · Edge **`edge-pull-sse`** + GET pull fallback (외부에서 직접 장비 제어 불가) |
| `modules/edge-queue/edge-gateway/` | 내부망 전용 MQTT·Modbus 어댑터                                           |
| `hooks/useYjsSync.ts`              | **(채널 A)** Y.Map → Zustand **단방향** (에디터 CRDT는 Yjs binding 직접) |
| `workers/telemetryProcessor.ts`    | **(채널 B)** WS·대량 센서 — Worker 버퍼 → Telemetry만                    |
| `engines/websocket.ts`             | WS 클라이언트 — **Worker에만** postMessage (쌍의 진입점)                 |
| `engines/socketEmitter.ts`         | 긴급 정지 — React re-render 우회 단선 송신                               |
| `engines/commandTracker.ts`        | 명령 **송신~완료** 추적 — 미완료·타임아웃 UI/재시도                      |
| `edge-queue/edge-persistence.ts`   | **엣지 자율** — 서버 장애 시에도 Pull·안전 장치 로직 유지                |
| `packages/shared/time-sync.ts`     | Audit·명령 이벤트 **시각 정렬** (사고 재현)                              |
| `engines/healthWatchdog.ts`        | 과부하 시 Telemetry throttle · **Safety/제어 최우선**                    |

---

### A-4. ⑤ 미션 크리티컬 신뢰성 보강 (권장)

| 구분        | 파일                                                      | 누락 시                                                  |
| ----------- | --------------------------------------------------------- | -------------------------------------------------------- |
| 명령 피드백 | `apps/web/src/engines/commandTracker.ts`                  | “보냈다”와 “실행됐다” 불일치, 2등급 제어 **신뢰성 붕괴** |
| 엣지 자율성 | `apps/backend/src/modules/edge-queue/edge-persistence.ts` | 서버 다운 시 **현장 안전 로직 중단** 위험                |
| 시간 동기화 | `packages/shared/src/time-sync.ts`                        | Audit Log **선후 관계 왜곡**, 분쟁·규제 대응 약화        |
| 헬스 워치독 | `apps/web/src/engines/healthWatchdog.ts`                  | 과부하 시 차트가 Safety를 **밀어내는** 역전 현상         |

**신뢰성 데이터 흐름**

```text
[제어 클릭] ──► socketEmitter ──► commandTracker.track(id, { issuedAt: timeSync.now() })
                      │                    │
                      │                    └──► ACK/timeout ──► useSafetyStore · UI
                      │
[audit-log] ◄── time-sync.ts (동일 시계)

[서버 DOWN] ──► edge-persistence (로컬 큐·마지막 안전 정책) ──► edge-gateway ──► 장비

[메인 스레드 과부하] ──► healthWatchdog ──► Telemetry/차트 억제 · Safety·emit 유지
```

---

### A-5. ④ 도메인 뷰 구조 통일

모든 도메인은 **`domains/[도메인명]/views/`** 아래 **3폴더 필수**:

| 폴더       | 역할                                        |
| ---------- | ------------------------------------------- |
| `left/`    | 도메인 전용 서브 내비·트리 (전역 메뉴 아님) |
| `right/`   | 속성 패널·AI 에이전트·넥셋                  |
| `content/` | 메인 작업 화면                              |

**신규 도메인 절차**: `views/{left,content,right}` (+ `status/` 권장) → registry에 `statusBar`·`statusPanel` 등록 → `globalMenu.ts`에 `domainKey` 추가.

---

## Part B. 최종 요약 체크리스트 (원문 · 항목별)

구현·리뷰·AI 생성 시 **아래 6+2 필수 경로**를 먼저 확인. (문서·트리·코드 중 하나라도 없으면 미완성)

### B-1. 필수 6경로

| 구분         | 필수 파일/경로 (전체)                                           | 누락 시 발생하는 문제                                                       |
| ------------ | --------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **동기화**   | `apps/sync/src/server.ts` + `extensions/authenticate.ts`        | Hocuspocus가 Nest에 묶이면 **WS·REST 프로토콜 충돌** · CRDT 성능 저하       |
| **레이아웃** | `apps/web/src/frame/registry/domainLayoutRegistry.ts`           | 도메인 전환 시 좌·우 드로어·메인 UI가 **유기적으로 바뀌지 않음**            |
| **보안**     | `apps/backend/src/common/interceptors/audit-log.interceptor.ts` | 2등급+ 제어 명령 **사후 추적 불가** (금융권 수준 감사 미달)                 |
| **보안**     | `packages/shared/src/commands/`                                 | web · backend · sync **명령 타입 불일치**, 위변조·등급 오용 위험            |
| **IoT**      | `apps/web/src/workers/telemetryProcessor.ts`                    | 대량 Telemetry 수신 시 **브라우저 메인 스레드·화면 얼음**                   |
| **IoT**      | `apps/web/src/hooks/useYjsSync.ts`                              | Yjs 데이터를 **Safety / Telemetry로 배분하지 못함** (알람 지연·차트와 경합) |

### B-2. IoT 실시간 필수 쌍

`engines/websocket.ts`는 Worker 쪽만 호출:

| 쌍    | 경로                                                     | 단독 사용 시                                        |
| ----- | -------------------------------------------------------- | --------------------------------------------------- |
| **A** | `hooks/useYjsSync.ts`                                    | Y.Map → Zustand **단방향** (에디터 CRDT는 Yjs 직결) |
| **B** | `workers/telemetryProcessor.ts` + `engines/websocket.ts` | **Yjs 밖** MQTT/WS 센서 폭주 흡수                   |

| 검증              | 통과 조건                                 |
| ----------------- | ----------------------------------------- |
| A만 있음          | ❌ 일반 소켓 폭주 시 **화면 프리징** 가능 |
| B만 있음          | ❌ Yjs Safety 알람 **미유입**             |
| A + B + WS→Worker | ✅ §미션 크리티컬 이중 채널 충족          |

### B-3. 레이아웃 연동 필수 (+2)

`domainLayoutRegistry`만으로는 전역 메뉴 전환이 안 됨:

| 구분         | 필수 파일/경로                                                          | 누락 시                                                      |
| ------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------ |
| **레이아웃** | `apps/web/src/frame/navigation/globalMenu.ts`                           | 헤더 탭과 `domainKey` 불일치, **URL↔드로어 슬롯 매핑 깨짐** |
| **상태바**   | `frame/status/SystemStatusBar.tsx` + registry `statusBar`/`statusPanel` | **하단 상태·상세** 미표시 · 이중 스크롤 위험                 |

### B-4. 권장 · 3등급 (금융·하드 제어)

| 구분          | 경로                                                     | 누락 시                                        |
| ------------- | -------------------------------------------------------- | ---------------------------------------------- |
| **보안**      | `apps/web/src/guards/authGuard.ts`                       | 2등급 MFA UI 게이트 없음                       |
| **IoT 3등급** | `apps/backend/src/modules/edge-queue/` + `edge-gateway/` | 3등급이 Yjs/외부망으로 새어 나갈 여지          |
| **도메인**    | `domains/*/views/{left,content,right}/`                  | registry에 등록해도 **끼워 넣을 뷰 파일 없음** |

### B-5. Desktop · U2BEE

상세·체크리스트 → [`_NEXA-OS-apps-desktop-설계-명세.md`](./_NEXA-OS-U2BEE-desktopApps-설계-명세.md) §8

### B-6. 신뢰성 보강 (권장 · §3대 수칙 이후)

| 구분        | 경로                               | 누락 시                             |
| ----------- | ---------------------------------- | ----------------------------------- |
| 명령 피드백 | `engines/commandTracker.ts`        | 실행 완료 미확인 · 제어 신뢰성 저하 |
| 엣지 자율   | `edge-queue/edge-persistence.ts`   | 서버 장애 시 현장 안전 중단 위험    |
| 시간 동기화 | `packages/shared/src/time-sync.ts` | Audit 선후 관계 부정확              |
| 헬스 워치독 | `engines/healthWatchdog.ts`        | 과부하 시 Safety 경로 밀림          |

---

## Part C. IoT 데이터 경로 (전체 흐름 · 원문)

```text
[대량 센서 WS] ──► workers/telemetryProcessor.ts ──postMessage──► useTelemetryStore ──► 차트 (useTransition)

[Y.Doc / apps/sync] ──► hooks/useYjsSync.ts (IoT 맵만) ──┬──► useSafetyStore    (긴급·0ms)
                                                        └──► useTelemetryStore

[Tiptap/Monaco/Rivet] ──► Yjs binding (양방향 · Zustand 미경유)

[긴급 정지 클릭] ──► engines/socketEmitter.ts (React re-render 우회, Yjs와 별도 단선)

[2등급 제어 API] ──► packages/shared/commands ──► audit-log (+ time-sync.ts 타임스탬프)

[제어 피드백] socketEmitter/commandTracker ──► ACK · timeout (issuedAt/ackedAt = time-sync)

[과부하] healthWatchdog ──► Telemetry 억제 · Safety·socketEmitter 유지

[서버 장애] edge-persistence ──► edge-gateway (현장 자율)
```

### 검증 포인트 (필수 쌍)

- `useYjsSync` **만** → Yjs가 아닌 **`engines/websocket` 폭주** 시 브라우저 **여전히 멈춤**.
- `telemetryProcessor` **만** → **Hocuspocus/Yjs** Safety 맵이 `useSafetyStore`로 **안 들어감**.
- `websocket.onmessage`에서 `useTelemetryStore.ingest()` 직접 호출 → Worker 우회 **안티패턴**.

> Grade3 하드 제어는 **Yjs·WS Push·브라우저 executable SSE** 금지 — `edge-queue` **`edge-pull-sse`** + `packages/shared/commands`. Web IoT sync 폴백 SSE → [`보강본`](./_NEXA-OS-V2.1-설계-표준-및-미션크리티컬-전략-보강본.md) §**SSE**.

---

## Part D. IoT 채널 A/B — 코드 패턴 (원문)

### 채널 A — `useYjsSync` (IoT Y.Map · 단방향 · 에디터 CRDT 제외)

```ts
// apps/web/src/hooks/useYjsSync.ts
// Tiptap/Monaco/Rivet는 Yjs binding 직접 사용. 여기서는 IoT 맵만.
ydoc.getMap('telemetry').observe(() => useTelemetryStore.getState().ingestFromYjs(...)) // 단방향
ydoc.getMap('safety').observe(() => useSafetyStore.getState().ingest(...)) // 0ms · Zustand→Yjs 역쓰기 금지
```

### 채널 B — `websocket.ts` + `telemetryProcessor.ts` (Yjs 밖 · 필수 쌍)

```ts
// engines/websocket.ts — onmessage에서 스토어 직접 호출 금지
ws.onmessage = (ev) => telemetryWorker.postMessage({ type: 'ingest', payload: ev.data })

// workers/telemetryProcessor.ts — 버퍼·배치 후
postMessage({ type: 'batch', rows }) // → useTelemetryStore.ingestBatch
```

> **`useYjsSync`만 있으면 채널 B 미커버** → 일반 소켓 폭주 시 프리징.  
> **Worker만 있으면 채널 A 미커버** → Yjs Safety 미유입.

---

## Part E. 4대 핵심 ↔ 체크리스트 매핑 (학습용)

| 4대 핵심     | 체크리스트에서 대응하는 항목                                              |
| ------------ | ------------------------------------------------------------------------- |
| ① frame/     | domainLayoutRegistry · globalMenu · SystemStatusBar                       |
| ② 보안       | commands/ · audit-log · (권장) authGuard                                  |
| ③ IoT·실시간 | sync · useYjsSync · telemetryProcessor · websocket→Worker · socketEmitter |
| ④ 도메인     | domains/\*/views/{left,content,right}/                                    |

**통합 후 SSOT**에서는 위를 **4축 한 표 + 권장 표**로 압축했습니다.  
항목별 **누락 시 영향**·**경로별 역할**을 깊게 익힐 때는 **Part A~D**를 순서대로 읽으면 됩니다.

---

## 관련 문서

| 문서                                                                                                                   | 역할                                        |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| [`_NEXA-OS-V2.1-설계-표준-및-미션크리티컬-전략.md`](./_NEXA-OS-V2.1-설계-표준-및-미션크리티컬-전략.md)                 | **현행 SSOT** — §완성 체크리스트 (4축 통합) |
| [`_NEXA-OS-apps-desktop-설계-명세.md`](./_NEXA-OS-U2BEE-desktopApps-설계-명세.md)                                      | Desktop 상세                                |
| [`[Prompt 01] AI 에이전트 제출용 프롬프트 지시서.md`](./[Prompt%2001]%20AI%20에이전트%20제출용%20프롬프트%20지시서.md) | AI 생성 프롬프트                            |

---

## 🛡️ NEXA OS V2.1 반응형 레이아웃 5대 절대 원칙

#### 1. 전역 브라우저 스크롤 금지 (Viewport Locking)

- **원칙**: 브라우저 전체 창에 생기는 세로 스크롤바(`Global Scroll`)를 원천 차단합니다,.
- **이유**: `100vh` 계산 오류, 모바일 safe-area와의 충돌, 그리고 드로어와 메인 콘텐츠 간의 이중 스크롤 현상을 방지하여 레이아웃 디버깅 비용을 최소화하기 위함입니다.
- **구현**: `MainShellLayout`은 항상 화면 높이에 고정되며, 모든 하위 요소는 이 뷰포트 안에서만 움직여야 합니다.

#### 2. 메인 콘텐츠 중심의 단일 스크롤 (Primary Content Scroll)

- **원칙**: 사용자 화면에서 주된 세로 스크롤이 발생하는 곳은 오직 **`Content` 슬롯(중앙 작업 영역)**뿐이어야 합니다,.
- **이유**: 미션 크리티컬한 IoT 데이터를 확인하는 도중 헤더나 상태바가 화면 밖으로 사라지는 것을 막고, 사용자의 시선을 중앙 데이터에 집중시키기 위함입니다.

#### 3. 슬롯별 독립적 내부 스크롤 (Internal Slot Overflow)

- **원칙**: **파일 트리**나 긴 리스트가 포함되는 좌·우 드로어(`Left/Right Drawer`)는 **영역 내부에서만 독립적인 스크롤**을 가집니다.
- **이유**: 사이드바의 내용이 길어져도 메인 콘텐츠 영역이나 전체 레이아웃 구조에 영향을 주지 않도록 격리하기 위함입니다.
- **적용**: 파일 트리가 길어질 경우, 드로어 자체에 `overflow-y-auto`를 설정하여 전체 셸(Shell)은 고정된 채 드로어 내부만 스크롤되도록 구현합니다.

#### 4. 웹 풋터 영구 제거 및 가변 상태바 채택 (No Web Footer)

- **원칙**: 기존의 `<footer>` 형식을 완전히 폐기하고, 가변 높이를 가진 **`SystemStatusBar`**로 대체합니다,.
- **모드**: 평상시(Compact) **~30px**, 상세(Expanded) **300px 이상**으로 동적으로 높이가 조절되어야 합니다.
- **이유**: 하단 고정 상태바 형식을 취함으로써 드로어와의 레이아웃 간섭을 피하고, 사용자에게 필요한 시스템 헬스 정보를 상시 제공하기 위함입니다.

#### 5. 스토어 기반의 동적 레이아웃 제어 (Store-Driven Layout)

- **원칙**: 모든 드로어의 폭, 개폐 상태, 상태바의 높이 변화는 **`useLayoutStore.ts`**를 통해 전역적으로 관리되고 실시간 반영되어야 합니다,.
- **이유**: 미디어 쿼리(`CSS`)만으로는 한계가 있는 복잡한 슬롯 전환(Overlay vs Push 모드 등)을 자바스크립트 수준에서 정교하게 통제하여 UI 안정성을 확보하기 위함입니다,.

**절대 규칙**

- 규칙 1: 전역 브라우저 스크롤 금지 (Viewport Locking)
- 규칙 2: 메인 콘텐츠 영역 외에는 세로 스크롤을 금지하여 이중 스크롤 방지.
- 규칙 3: 모든 레이아웃 크기 변화는 useLayoutStore와 연동하여 예측 가능한 UI를 유지할 것.
- 규칙 4: 슬롯별 독립적 내부 스크롤 (Internal Slot Overflow)
- 규칙 5: 웹 풋터 영구 제거 및 가변 상태바 채택 (No Web Footer)
- 규칙 6: 스토어 기반의 동적 레이아웃 제어 (Store-Driven Layout)
