## 🛠️ 1. 최종 결정 기술 스택 (React 중심 풀스택)

AI 에이전트(안티그래비티, 클로드 등)가 전 세계에서 가장 버그 없이 정교하게 코드를 짜내는 글로벌 표준 TypeScript 생태계로 확정했습니다.

- **프론트엔드**: Next.js (App Router, TypeScript) - 강력한 SEO, 뛰어난 로딩 속도, AI 생성 툴(v0.dev 등)과의 압도적인 궁합.
- **스타일링**: Tailwind CSS + Shadcn UI - AI가 원자 단위로 코드를 읽고 조작하기 가장 쉬운 Utility-first 스타일 채택. 화면 최적화 극대화.
- **실시간 동기화**: Yjs + Hocuspocus — **순수 Node.js 독립 프로세스** (`apps/sync/`). NestJS와 **프로세스·포트 분리** → 저수준 WebSocket(CRDT)과 Nest HTTP/REST **프로토콜 충돌 방지**, 고속 동기화 보장.
- **메인 백엔드**: NestJS (TypeScript) — REST API·비즈니스 로직·Prisma·감사 로그. **Hocuspocus는 Nest 내부에 두지 않음.**
- **모노레포**: `apps/web` · `apps/backend` · `apps/sync` + `packages/shared` — TypeScript **타입 SSOT**와 **앱별 독립 배포** 동시 확보.

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
  - 드로어·테마 등 **동기화 불필요** 로컬 UI.
  - IoT Safety/Telemetry는 `useYjsSync`(채널 A) 또는 Worker(채널 B) → 스토어 **단방향**.

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

---

## 📝 NEXA OS V2.1 모노레포 폴더 구조

NEXA OS V2.1 모노레포는 **`apps/web`**(Next.js UI), **`apps/backend`**(NestJS API), **`apps/sync`**(Hocuspocus 독립 서버)의 3대 핵심 앱과 공통 기능을 공유하는 **`packages/shared`**로 구성되어, 각 앱의 **독립적인 배포 유연성**과 **강력한 타입 안전성(SSOT)**을 동시에 확보하는 구조입니다.

### 핵심 아키텍처 3원칙 (V2.1 SSOT)

| #     | 원칙                               | 구현                                                                                                                                  |
| ----- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **①** | **Hocuspocus 독립 서버**           | `apps/sync/` — 순수 Node.js + `@hocuspocus/server`. NestJS(`apps/backend`)와 **별도 프로세스·포트**. Nest에 Hocuspocus 모듈 **금지**. |
| **②** | **Yjs ↔ Zustand 단방향 (IoT/UI)** | Tiptap·Monaco·Rivet → Yjs **양방향 직결**. 차트·Safety/Telemetry → `useYjsSync` **observe → Zustand만**. Zustand→Yjs 역쓰기 **금지**. |
| **③** | **모노레포 3앱 + shared**          | `apps/web` · `apps/backend` · `apps/sync` + `packages/shared` — DTO·commands·JWT·Yjs 맵 키 **단일 타입**. 앱별 **독립 빌드·배포**.    |

```text
pnpm-workspace
├── apps/web        → Next.js (UI)
├── apps/backend    → NestJS (REST · Prisma · audit · edge-queue)
├── apps/sync       → Hocuspocus (Yjs CRDT WebSocket only)
└── packages/shared → web · backend · sync 공통 import
```

> `docker-compose.yml`: `web`, `backend`, `sync`, `postgres` **서비스 분리**. `sync`는 CRDT 전용 포트(예: `:1234`), `backend`는 REST(예: `:3001`).

### 레이아웃 역할 분리 (4영역 · 웹 Footer 없음)

| 영역                     | 역할                                 | 구현                                    |
| ------------------------ | ------------------------------------ | --------------------------------------- |
| **Header — 전역 내비**   | 도메인(메뉴) 전환 · 로고             | `globalMenu.ts` + `GlobalMainMenu.tsx`  |
| **Header — 우측**        | 드로어 토글 · 테마 · `headerActions` | `GlobalNavbarRight.tsx` + registry 슬롯 |
| **Left Drawer**          | 현재 도메인 서브 내비·트리           | `domainLayoutRegistry.left`             |
| **Content**              | 메인 작업 — **여기만 세로 스크롤**   | `domainLayoutRegistry.content`          |
| **Right Drawer**         | 넥셋·에이전트·속성                   | `domainLayoutRegistry.right`            |
| **하단 — 시스템 상태바** | 전역·도메인 상태 요약                | `SystemStatusBar` + `statusPanel`       |

> 도메인 전환 시 **left / right / statusBar / statusPanel** 이 `domainLayoutRegistry`에서 함께 교체됩니다.

### 시스템 상태바 (웹 Footer 대체 · 가변 높이)

**웹 전역 `<footer>` 풋터를 두지 않습니다.**  
이유: 본문+풋터 이중 스크롤, `100vh`·드로어·safe-area와의 충돌, IoT 대시보드에서 레이아웃 디버깅 비용 증가.

대신 **`MainShellLayout` 하단 고정 「시스템 상태바」** — IDE·OS 상태바와 같은 패턴.

| 모드                 | 높이                       | 내용                                                                |
| -------------------- | -------------------------- | ------------------------------------------------------------------- |
| **평상시 (compact)** | **~30px**                  | 연결망·Safety 요약·진행 중 명령·도메인 힌트 1줄                     |
| **상세 (expanded)**  | **≥300px** (리사이즈 가능) | 로그 tail, Telemetry 스냅샷, `commandTracker`·`healthWatchdog` 상세 |

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
| `frame/status/SystemStatusBar.tsx`          | 셸: compact + expand 토글, 높이 애니메이션              |
| `frame/status/StatusPanelHost.tsx`          | expanded 영역, 내부 스크롤 **단일**                     |
| `frame/views/common/DefaultStatusPanel.tsx` | 도메인 미지정 시 공용 상세 패널                         |
| `store/useLayoutStore.ts`                   | `statusBarExpanded`, `statusBarDetailHeight` (기본 300) |
| `domainLayoutRegistry`                      | `statusBar`, `statusPanel` 슬롯 (선택)                  |

**스크롤 규칙**: `Content`만 `overflow-auto`. 상태바·상세창은 셸에 고정되어 **페이지 전체 이중 스크롤 방지**.

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
│ ▼ statusPanel (펼침 시 ≥300px) — domainLayoutRegistry.statusPanel        │
└──────────────────────────────────────────────────────────────────────────┘
     ▲ .left / .right (드로어)          ▲ .statusBar + .statusPanel (registry)
```

- **Header (전역)**: `frame/navigation/globalMenu.ts` → `GlobalMainMenu.tsx`
- **Left / Right Drawer**: `domainLayoutRegistry.left` / `.right`
- **Content**: `domainLayoutRegistry.content` — **유일한 메인 스크롤**
- **시스템 상태바**: `domainLayoutRegistry.statusBar` (30px) + `statusPanel` (상세, 선택)

---

```yaml
NEXA OS V2.1/                          # 모노레포 루트
│
├── .claude/
├── .continue/
├── database/
│   ├── schema.prisma
│   └── docker/                        # Postgres, pgvector 등
├── docs/
├── scripts/
├── v0/
├── pnpm-workspace.yaml
├── docker-compose.yml
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
│   │   │   ├── frame/                 # [동적 레이아웃 셸] ★ 핵심 2파일 — §최종 완성 ①
│   │   │   │   ├── registry/
│   │   │   │   │   ├── domainLayoutRegistry.ts  # left/content/right/headerActions/statusBar/statusPanel
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
│   │   │   │   ├── status/                      # 웹 Footer 대체 · 가변 하단 상태바
│   │   │   │   │   ├── SystemStatusBar.tsx    # ~30px strip + expand 토글
│   │   │   │   │   └── StatusPanelHost.tsx    # ≥300px 상세 (registry.statusPanel)
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
│   │   │   │   ├── commandTracker.ts    # 명령 ID · 송신→완료 피드백 · 타임아웃 (신뢰성)
│   │   │   │   ├── healthWatchdog.ts    # FPS·지연 감시 — 과부하 시 Safety 경로 우선
│   │   │   │   ├── web-serial.ts
│   │   │   │   ├── tiptap/              # Tiptap ↔ Yjs 직접 바인딩 (Zustand 미경유)
│   │   │   │   └── charts/
│   │   │   │
│   │   │   ├── hooks/                   # 실시간 동기화 · 네트워크 연동
│   │   │   │   ├── useYjsSync.ts        # (채널 A) Y.Map observe → Zustand 단방향 (에디터 CRDT 제외)
│   │   │   │   ├── useHocuspocus.ts     # apps/sync WebSocket · JWT · ReadOnly(1등급)
│   │   │   │   └── useDomainLayout.ts   # domainLayoutRegistry 슬롯 resolve
│   │   │   │
│   │   │   ├── store/                   # [Zustand] 중요도별 분리 (§미션 크리티컬)
│   │   │   │   ├── useSafetyStore.ts    # 🚨 긴급·안전·제어 (0ms, 메인 스레드 직통)
│   │   │   │   ├── useTelemetryStore.ts # 📈 일반 수집 (버퍼·지연 반영, useTransition)
│   │   │   │   ├── useLayoutStore.ts    # 드로어 + statusBarExpanded·statusBarDetailHeight
│   │   │   │   └── useUiStore.ts        # theme, locale
│   │   │   │
│   │   │   ├── guards/                  # [보안] 프론트 제어 권한 · 인증
│   │   │   │   └── authGuard.ts         # 2등급 명령 시 MFA(2차 인증) 강제 등
│   │   │   │
│   │   │   ├── lib/
│   │   │   │   └── utils.ts
│   │   │   │
│   │   │   └── system/                  # 전역 비 UI 인프라
│   │   │       ├── config/
│   │   │       ├── styles/              # Tailwind CSS 변수 · 테마
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
│   │   │   │   └── persistence.ts       # onStoreDocument · Prisma/DB · XSS·스키마 검증
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
    └── shared/                          # web · backend · sync 공통 SSOT
        └── src/
            ├── commands/                # ★ (필수) 보안 등급·명령 SSOT — §최종 완성 ②
            │   ├── command-grade.enum.ts    # Grade1 | Grade2 | Grade3
            │   ├── command.types.ts         # 명령 페이로드 · MFA 요구 플래그
            │   ├── security-requirements.ts # 등급별 망·인증·감사 규칙
            │   └── index.ts
            ├── yjs/                     # Y.Doc 맵 키·스키마 상수 — web·sync 공통
            │   ├── map-keys.ts            # 'telemetry' | 'safety' | document room names
            │   └── index.ts
            ├── time-sync.ts             # NTP/논리 시각 · Audit·commandTracker 공통 타임스탬프
            ├── dtos/                    # 공유 DTO
            │   ├── device.dto.ts
            │   └── telemetry.dto.ts
            ├── openapi/                 # Nest Swagger export — desktop bridge/dto 생성 SSOT
            └── index.ts
```

### `apps/sync/` — Hocuspocus 독립 서버 (SSOT)

> **NestJS(`apps/backend`)에 `@hocuspocus/server`를 임베드하지 않습니다.** 저수준 Yjs WebSocket과 Nest HTTP/REST·DI·미들웨어가 한 프로세스에 섞이면 프로토콜·이벤트 루프 충돌과 CRDT 지연 위험이 있습니다.

| 항목           | 규칙                                                                            |
| -------------- | ------------------------------------------------------------------------------- |
| **런타임**     | 순수 Node.js — `apps/sync/src/server.ts`                                        |
| **인증**       | `onAuthenticate` → `apps/backend/modules/auth` REST로 JWT·ReadOnly 스코프 검증  |
| **영속화**     | `onStoreDocument` → Prisma/DB (backend와 DB URL 공유 가능, **프로세스는 분리**) |
| **공유 타입**  | `packages/shared` — `commands/`, `yjs/map-keys`                                 |
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

> **상세 SSOT**: [`_NEXA-OS-apps-desktop-설계-명세.md`](./_NEXA-OS-apps-desktop-설계-명세.md) — 폴더 트리 · 통신 3갈래 · U2BEE 분담 · IPC · 체크리스트

| 한 줄 | PyQt 셸 — OS·듀얼 웹뷰·`bridge/nestjs_client`. UI는 `apps/web` embed URL 렌더. pnpm 워크스페이스 **외부**.

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
│   ├── useYjsSync.ts              # Y.Map observe → Zustand (단방향 · 에디터 CRDT 제외)
│   └── useHocuspocus.ts           # apps/sync WebSocket 연결
├── store/
│   ├── useSafetyStore.ts          # 🚨 긴급·안전·제어
│   └── useTelemetryStore.ts       # 📈 일반 수집 (차트 등)
├── guards/
│   └── authGuard.ts               # 2등급 MFA 강제 등
└── engines/
    ├── socketEmitter.ts           # 긴급 정지 — 렌더 경로 우회
    ├── commandTracker.ts          # 송신→ACK 피드백
    └── healthWatchdog.ts          # 과부하 시 Safety 우선

apps/backend/src/modules/edge-queue/
└── edge-persistence.ts            # 서버 다운 시 현장 자율

apps/backend/src/common/interceptors/
└── audit-log.interceptor.ts       # time-sync 타임스탬프 사용

packages/shared/src/
├── commands/
├── yjs/                           # map-keys — web·sync 공통
└── time-sync.ts
```

| 경로                                       | 설계 근거                                                                           |
| ------------------------------------------ | ----------------------------------------------------------------------------------- |
| **`workers/`**                             | 대량 Telemetry가 와도 **메인 스레드 분리** — §3대 수칙 ① Web Worker                 |
| **`useSafetyStore` / `useTelemetryStore`** | 화재·고장 알람이 차트 데이터에 밀리지 않도록 **상태 분리** — ② useTransition과 연동 |
| **`engines/socketEmitter.ts`**             | [긴급 정지] 클릭이 React re-render에 갇히지 않게 **즉시 송신** — ③ 제어 단선        |
| **`guards/authGuard.ts`**                  | 2등급(소프트 제어) **MFA** 프론트 게이트                                            |
| **`audit-log.interceptor.ts`**             | 2등급 이상 NestJS **감사 로그** (금융권 수준 추적)                                  |
| **`packages/shared/commands`**             | 1·2·3등급 명령 타입 **web · backend · sync 단일 정의**                              |
| **`packages/shared/yjs/`**                 | Y.Map 키·room 이름 — web·sync **동일 상수**                                         |
| **`packages/shared/time-sync.ts`**         | Audit·commandTracker **공통 시각** — 사고 선후 분석                                 |
| **`engines/commandTracker.ts`**            | 명령 **송신~완료** 피드백 — socketEmitter와 쌍                                      |
| **`engines/healthWatchdog.ts`**            | 과부하 시 Telemetry 억제 · Safety 경로 우선                                         |
| **`edge-persistence.ts`**                  | 서버 장애 시 **현장 큐·안전 정책** 로컬 유지                                        |

> `useDeviceStore`는 범용 IoT 버퍼가 필요할 때만 추가. 기본은 Safety / Telemetry 이원화.

### ✅ V2.1 최종 완성 — 4대 핵심 (미션 크리티컬 · 동적 레이아웃)

> **인프라 전제 (§핵심 아키텍처 3원칙)**: `apps/sync` Hocuspocus **독립** · Tiptap/Monaco/Rivet↔Yjs **양방향** / IoT→Zustand **단방향** · `packages/shared`를 web·backend·sync가 공유.

구현·문서·AI 생성 시 **아래 4축이 모두 충족**되어야 V2.1 골격이 완성된 것으로 봅니다.

---

#### ① `frame/` 시스템 — 동적 레지스트리 (완성)

`frame/`을 앱 골격으로 분리합니다. **반드시 존재·연동**할 파일:

| 파일               | 전체 경로                                             | 역할                                                                                           |
| ------------------ | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **등록부**         | `apps/web/src/frame/registry/domainLayoutRegistry.ts` | `left` / `content` / `right` / `headerActions` / **`statusBar`** / **`statusPanel`** lazy 로드 |
| **전역 메뉴 SSOT** | `apps/web/src/frame/navigation/globalMenu.ts`         | 로고 옆 탭 — `route`, `label`, `icon`, **`domainKey`**                                         |

연동 흐름: `globalMenu` → `domainKey` → `MainShellLayout` → registry → `LeftDrawer` / `Content`(스크롤) / `RightDrawer` / **`SystemStatusBar`**.

보조: `useDomainLayout.ts`, `layoutRegistry.ts`(u2bee 팝업 등).  
**Desktop embed**: `app/(embed)/u2bee/*` + `U2BeeMinimalLayout` — `MainShellLayout`·상태바 **미사용** (웹뷰 B 전용).

---

#### ② 보안 등급 (Grade 1·2·3) 인프라 (완성)

| 등급 | 프론트                               | 백엔드 / 동기화                                    | 공유 SSOT                         |
| ---- | ------------------------------------ | -------------------------------------------------- | --------------------------------- |
| 🟢 1 | `useHocuspocus` ReadOnly             | **`apps/sync`** (Hocuspocus) + `backend/auth` JWT  | `commands` — 조회·문서 편집       |
| 🟡 2 | **`guards/authGuard.ts`** (MFA 권장) | **`audit-log.interceptor.ts`** + `modules/control` | `commands` — MFA·감사 필수 플래그 |
| 🔴 3 | Yjs/WS 제어 UI **없음**              | `modules/edge-queue` + **`edge-gateway/`**         | `commands` — Pull·폐쇄망만        |

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

#### ③ 미션 크리티컬 IoT — Grade 3·실시간 (완성)

**3등급**은 외부망(Yjs/Hocuspocus)과 **코드·물리 경로 분리**:

```text
[브라우저] ──WebSocket──► apps/sync (Hocuspocus) ──► 🟢·🟡 Y.Doc only
                              │ onAuthenticate
                              └──► apps/backend/auth (JWT 검증)
                         ✗ Grade3 Push 차단 · Nest 내부 Hocuspocus 금지

[edge-queue API] ◄── Pull ── [edge-gateway] ◄── MQTT / Modbus (폐쇄망·VPN)
```

| 경로                               | 역할                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------ |
| `modules/edge-queue/`              | 큐 적재·Edge **Pull** REST (외부에서 직접 장비 제어 불가)                |
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

#### ⑤ 미션 크리티컬 신뢰성 보강 (권장)

| 구분        | 파일                                                      | 누락 시                                                  |
| ----------- | --------------------------------------------------------- | -------------------------------------------------------- |
| 명령 피드백 | `apps/web/src/engines/commandTracker.ts`                  | “보냈다”와 “실행됐다” 불일치, 2등급 제어 **신뢰성 붕괴** |
| 엣지 자율성 | `apps/backend/src/modules/edge-queue/edge-persistence.ts` | 서버 다운 시 **현장 안전 로직 중단** 위험                |
| 시간 동기화 | `packages/shared/src/time-sync.ts`                        | Audit Log **선후 관계 왜곡**, 분쟁·규제 대응 약화        |
| 헬스 워치독 | `apps/web/src/engines/healthWatchdog.ts`                  | 과부하 시 차트가 Safety를 **밀어내는** 역전 현상         |

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

#### ④ 도메인 뷰 구조 통일 (완성)

모든 도메인은 **`domains/[도메인명]/views/`** 아래 **3폴더 필수**:

| 폴더       | 역할                                        |
| ---------- | ------------------------------------------- |
| `left/`    | 도메인 전용 서브 내비·트리 (전역 메뉴 아님) |
| `right/`   | 속성 패널·AI 에이전트·넥셋                  |
| `content/` | 메인 작업 화면                              |

신규 도메인 절차: `views/{left,content,right}` (+ `status/` 권장) → registry에 `statusBar`·`statusPanel` 등록 → `globalMenu.ts`에 `domainKey` 추가.

---

### 최종 요약 체크리스트 (SSOT · 누락 시 영향)

구현·리뷰·AI 생성 시 **아래 6+2 필수 경로**를 먼저 확인합니다. (문서·트리·코드 중 하나라도 없으면 미완성)

| 구분         | 필수 파일/경로 (전체)                                           | 누락 시 발생하는 문제                                                                  | 문서 |
| :----------- | :-------------------------------------------------------------- | :------------------------------------------------------------------------------------- | :--: |
| **동기화**   | `apps/sync/src/server.ts` + `extensions/authenticate.ts`        | Hocuspocus가 Nest에 묶이면 **WS·REST 프로토콜 충돌** · CRDT 성능 저하                  |  ✅  |
| **레이아웃** | `apps/web/src/frame/registry/domainLayoutRegistry.ts`           | 도메인 전환 시 좌·우 드로어·메인 UI가 **유기적으로 바뀌지 않음** (한 도메인 UI에 고정) |  ✅  |
| **보안**     | `apps/backend/src/common/interceptors/audit-log.interceptor.ts` | 2등급+ 제어 명령 **사후 추적 불가** (금융권 수준 감사 미달)                            |  ✅  |
| **보안**     | `packages/shared/src/commands/`                                 | web · backend · sync **명령 타입 불일치**, 위변조·등급 오용 위험                       |  ✅  |
| **IoT**      | `apps/web/src/workers/telemetryProcessor.ts`                    | 대량 Telemetry 수신 시 **브라우저 메인 스레드·화면 얼음**                              |  ✅  |
| **IoT**      | `apps/web/src/hooks/useYjsSync.ts`                              | Yjs 실시간 데이터를 **Safety / Telemetry로 배분하지 못함** (알람 지연·차트와 경합)     |  ✅  |

**IoT 실시간 필수 쌍** — 아래 **둘 다** 있어야 하며, `engines/websocket.ts`는 Worker 쪽만 호출:

| 쌍    | 경로                                                     | 단독 사용 시                                        |
| ----- | -------------------------------------------------------- | --------------------------------------------------- |
| **A** | `hooks/useYjsSync.ts`                                    | Y.Map → Zustand **단방향** (에디터 CRDT는 Yjs 직결) |
| **B** | `workers/telemetryProcessor.ts` + `engines/websocket.ts` | **Yjs 밖** MQTT/WS 센서 폭주 흡수                   |

| 검증              | 통과 조건                                 |
| ----------------- | ----------------------------------------- |
| A만 있음          | ❌ 일반 소켓 폭주 시 **화면 프리징** 가능 |
| B만 있음          | ❌ Yjs Safety 알람 **미유입**             |
| A + B + WS→Worker | ✅ §미션 크리티컬 이중 채널 충족          |

**레이아웃 연동 필수 (위 5개와 함께)** — `domainLayoutRegistry`만으로는 전역 메뉴 전환이 안 됨:

| 구분         | 필수 파일/경로                                                          | 누락 시 발생하는 문제                                        | 문서 |
| :----------- | :---------------------------------------------------------------------- | :----------------------------------------------------------- | :--: |
| **레이아웃** | `apps/web/src/frame/navigation/globalMenu.ts`                           | 헤더 탭과 `domainKey` 불일치, **URL↔드로어 슬롯 매핑 깨짐** |  ✅  |
| **상태바**   | `frame/status/SystemStatusBar.tsx` + registry `statusBar`/`statusPanel` | 웹 Footer 없이 **하단 상태·상세** 미표시 · 이중 스크롤 위험  |  ✅  |

**권장·3등급 (금융·하드 제어 완성용)**

| 구분          | 경로                                                     | 누락 시                                        | 문서 |
| :------------ | :------------------------------------------------------- | :--------------------------------------------- | :--: |
| **보안**      | `apps/web/src/guards/authGuard.ts`                       | 2등급 MFA UI 게이트 없음                       |  ✅  |
| **IoT 3등급** | `apps/backend/src/modules/edge-queue/` + `edge-gateway/` | 3등급이 Yjs/외부망으로 새어 나갈 여지          |  ✅  |
| **도메인**    | `domains/*/views/{left,content,right}/`                  | registry에 등록해도 **끼워 넣을 뷰 파일 없음** |  ✅  |

**Desktop · U2BEE** — 상세·체크리스트 → [`_NEXA-OS-apps-desktop-설계-명세.md`](./_NEXA-OS-apps-desktop-설계-명세.md) §8

**신뢰성 보강 (권장 · §3대 수칙 이후)**

| 구분        | 경로                               | 누락 시                             | 문서 |
| ----------- | ---------------------------------- | ----------------------------------- | :--: |
| 명령 피드백 | `engines/commandTracker.ts`        | 실행 완료 미확인 · 제어 신뢰성 저하 |  ✅  |
| 엣지 자율   | `edge-queue/edge-persistence.ts`   | 서버 장애 시 현장 안전 중단 위험    |  ✅  |
| 시간 동기화 | `packages/shared/src/time-sync.ts` | Audit 선후 관계 부정확              |  ✅  |
| 헬스 워치독 | `engines/healthWatchdog.ts`        | 과부하 시 Safety 경로 밀림          |  ✅  |

#### IoT 데이터 경로 (5항목이 맞물리는 순서)

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

> **검증 포인트 (필수 쌍)**
>
> - `useYjsSync` **만** → Yjs가 아닌 **`engines/websocket` 폭주** 시 브라우저 **여전히 멈춤**.
> - `telemetryProcessor` **만** → **Hocuspocus/Yjs** Safety 맵이 `useSafetyStore`로 **안 들어감**.
> - `websocket.onmessage`에서 `useTelemetryStore.ingest()` 직접 호출 → Worker 우회 **안티패턴**.

> **AI·코드 생성 시**: 위 표 **문서 ✅ = 설계 SSOT 반영 완료**. 구현 repo에 파일이 없을 수 있음.

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
  },
  home: {
    left: () => import('@/domains/home/views/left/HomeLeftNav'),
    content: () => import('@/domains/home/views/content/HomeView'),
    right: null,
  },
  dashboard: {
    left: () => import('@/domains/dashboard/views/left/DashboardLeftNav'),
    content: () => import('@/domains/dashboard/views/content/DashboardContent'),
    right: () => import('@/domains/dashboard/views/right/DashboardRightPanel'),
    statusBar: () => import('@/domains/dashboard/views/status/DashboardStatusBar'),
    statusPanel: () => import('@/domains/dashboard/views/status/DashboardStatusPanel'), // IoT 로그·Telemetry 요약
  },
  u2bee: {
    left: () => import('@/domains/u2bee/views/left/U2BeeLeftNav'),
    content: () => import('@/domains/u2bee/views/content/U2BeeContent'),
    right: () => import('@/domains/u2bee/views/right/U2BeeRightPanel'),
    headerActions: () => import('@/domains/u2bee/components/U2BeeHeaderActions'),
  },
  ais: {
    left: () => import('@/domains/ais/views/left/AisLeftNav'),
    content: () => import('@/domains/ais/views/content/AisContent'),
    right: () => import('@/domains/ais/views/right/AisRightPanel'),
  },
} as const
```

**동작 요약**

1. `GlobalMainMenu` ← `globalMenu.ts` (`domainKey` 포함)
2. `MainShellLayout` ← registry → left / content(스크롤) / right / **statusBar** / **statusPanel**
3. `useLayoutStore` — 드로어 + `statusBarExpanded` · `statusBarDetailHeight`(기본 300)
4. `statusPanel` 미등록 도메인 → `DefaultStatusPanel` + 전역 연결·Safety·commandTracker 요약

**채널 A — `useYjsSync` (IoT Y.Map · 단방향 · 에디터 CRDT 제외)**

```ts
// apps/web/src/hooks/useYjsSync.ts — Tiptap/Monaco/Rivet는 Yjs binding 직접 사용. 여기서는 IoT 맵만.
ydoc.getMap('telemetry').observe(() => useTelemetryStore.getState().ingestFromYjs(...)) // 단방향
ydoc.getMap('safety').observe(() => useSafetyStore.getState().ingest(...)) // 0ms · Zustand→Yjs 역쓰기 금지
```

**채널 B — `websocket.ts` + `telemetryProcessor.ts` (Yjs 밖 · 필수 쌍)**

```ts
// engines/websocket.ts — onmessage에서 스토어 직접 호출 금지
ws.onmessage = (ev) => telemetryWorker.postMessage({ type: 'ingest', payload: ev.data })

// workers/telemetryProcessor.ts — 버퍼·배치 후
postMessage({ type: 'batch', rows }) // → useTelemetryStore.ingestBatch
```

> **`useYjsSync`만 있으면 채널 B 미커버** → 일반 소켓 폭주 시 프리징. **Worker만 있으면 채널 A 미커버** → Yjs Safety 미유입.

> Grade3 하드 제어는 **Yjs·WS Push 모두 금지** — `edge-queue` Pull + `packages/shared/commands`.

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

---
