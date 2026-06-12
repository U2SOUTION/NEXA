---
doc_id: TDD-002
title: "NEXA OS · 도메인 구조 (레지스트리)"
category: "08_TDD"
domain: NEXAOS
status: published
created: 2026-06-10
updated: 2026-06-12
parent_doc: TDD-001
terms_standard: ["react", "typescript", "zustand"]
terms_nexa: ["domainKey", "domainLayoutRegistry", "nexia", "MainShell", "drawerDefaults", "tabId", "themePreset", "useLayoutStore"]
tags: ["doc/cat/08-tdd", "doc/domain/nexaos", "std/react", "std/typescript", "std/zustand", "nexa/domainKey", "nexa/domainLayoutRegistry", "nexa/nexia", "nexa/MainShell", "nexa/drawerDefaults", "nexa/tabId", "nexa/themePreset", "nexa/useLayoutStore"]
---

# NEXA OS — 도메인 구조

| 항목                            | 내용                                                                                                                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **역할**                        | 전역 `domainKey` · 레지스트리 슬롯 · 폴더 규약 SSOT                                                                                                                       |
| **To-Be (정본)**                | [`08_TDD_LangGraph_모노레포폴더구조`](../LangGraph/08_TDD_LangGraph_모노레포폴더구조_v1.0.md) — `apps/web` · `apps/backend` · `apps/sync` · `apps/agent-graph` · `packages/shared` |
| **레지스트리 (To-Be)**          | `NEXA-Platform/apps/web/src/frame/registry/domainLayoutRegistry.ts`                                                                                                       |
| **레지스트리 (As-Is · 레거시)** | `NEXA-Platform/src/frame/registry/domainRegistry.ts` (구 Vue/Quasar)                                                                                                      |
| **상위 설계**                   | [`08_TDD_NEXAOS_설계표준_미션크리티컬전략`](./08_TDD_NEXAOS_설계표준_미션크리티컬전략.md)                                                                                 |

> **읽는 법:** 구현·신규 도메인은 **To-Be**만 따른다 (`apps/web` · `*.tsx` · Zustand). §3은 **목적·역할** 중심 서술. 구 Vue/Quasar As-Is는 §4 `<details>` 참고.

---

## 1. 도메인이란

**도메인(Domain)** 은 **NEXA 플랫폼** Header **전역 메뉴**에서 선택하는 **하나의 제품·업무 영역**입니다.

**확장 방향:** NEXA는 **산업 → 아트 → 일상** 순으로 발전한다. `nexabo`·`infra`·`network` 등은 **1단계(산업)**, `solutions`·미디어 제너레이터는 **2단계(아트)**, `my`·Twinex·NEXA-CELL은 **3단계(일상)** 에 가깝게 배치·성숙한다. — [`01_BRD_NEXA_사업마스터플랜`](../../01_BRD/01_BRD_NEXA_사업마스터플랜.md)

- **`nexia`:** 플랫폼 **핵심 지능** — 7탭(`tabId`)·Omnix·고위험 승인·Twinex·**NEXA-CELL** SSOT — [`08_TDD/NEXIA`](../NEXIA/README.md).
- **그 외 `domainKey`:** 각자 UI·업무 로직을 갖고, AI·규범·실행 payload는 **NEXIA·NEXA OS Grade**와 **연결** — [`정체성 SSOT`](../_NEXA-플랫폼·메타-OS·NEXIA·도메인%20—%20정체성%20SSOT.md) §3.

### To-Be — 모노레포 (`apps/web`)

- UI: `apps/web/src/domains/{folder}/` (React/TSX)
- 레지스트리: `apps/web/src/frame/registry/domainLayoutRegistry.ts` — lazy import · **`drawerDefaults`** · `statusBar` · `themePreset`
- 상태: **Zustand** (`useLayoutStore` · 도메인별 `use*Store`) — Pinia **✗**
- **도메인 전환** = registry 항목 교체 → L/R Drawer · Content · (선택) Header Actions

```text
전역 메뉴 (domainKey)
       │
       ▼
domainLayoutRegistry[domainKey]
       │
       ├── left / content / right / headerActions  → domains/*/views/**/*.tsx
       ├── drawerDefaults  → §2.1 · useLayoutStore
       ├── statusBar / statusPanel  → (IoT·관제 도메인)
       └── themePreset  → power-grid | office-light | …
```

### As-Is — 레거시 (`NEXA-Platform/src/`, Vue/Quasar)

- `src/domains/{folder}/` · `domainRegistry.ts` · `*Domain.vue` · **Pinia**
- As-Is `.vue` / `server/domains/` 상세는 §4 `<details>` · §8 레거시 주석 참고.

### 프론트 4대 축 (개념 — To-Be 경로)

| 경로 (To-Be)                | 역할                                             | 비고                              |
| :-------------------------- | :----------------------------------------------- | :-------------------------------- |
| **`apps/web/src/frame/`**   | MainShell · `domainLayoutRegistry` · router      | 슬롯 호스트 only                  |
| **`apps/web/src/domains/`** | `domainKey`별 UI·Zustand store                   | **본 문서 SSOT**                  |
| **`apps/web/src/engines/`** | React Flow · Tiptap · Monaco — UI 금지 순수 로직 | domains → engines 역방향 **금지** |
| **`packages/shared/`**      | Zod 스키마 · commands · yjs keys                 | `@nexa/shared`                    |

---

## 2. 레지스트리 슬롯 규약

**To-Be** `domainLayoutRegistry.ts` 슬롯 규약 (As-Is `domainRegistry.ts`와 개념 동일):

| 슬롯                                | 필수      | 설명                                                                                                                                         |
| ----------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **`left`**                          | ✅        | Left Drawer — 도메인 **서브 내비**·트리·채널 목록 (전역 메뉴 아님)                                                                           |
| **`content`**                       | ✅        | 메인 작업 영역 — **유일한 main 세로 스크롤** 내부                                                                                            |
| **`right`**                         | ✅        | Right Drawer — `domains/*/views/right/*` · As-Is `null` → **`DefaultRightPanel`** fallback · **V2.1** 도메인별 전용 패널 필수 (보강본 §1677) |
| **`headerActions`**                 | 선택      | Header 우측 — 도메인 전용 액션 버튼                                                                                                          |
| **`drawerDefaults`**                | ✅ (V2.1) | L/R 드로어 **openPolicy**·`autoOpen`·`emptyMessage` — §2.1 · runtime은 **`useLayoutStore`**                                                  |
| **`statusBar`** / **`statusPanel`** | V2.1      | 하단 시스템 상태바 도메인 슬롯                                                                                                               |
| **`themePreset`**                   | V2.1      | `power-grid` · `office-light` 등 산업 프리셋                                                                                                 |

**`right` fallback (As-Is)**: registry `right: null` → `getRightSidebarComponent()`가 `@frame/views/common/DefaultRightPanel.tsx` 로드 (우측 드로어 **표시됨**).

**V2.1 `right` 목표**: 16개 `domainKey` 전부 `views/right/*RightPanel.tsx` — §3.0 인덱스·§3.9 `opt→rec` 참고.

**As-Is 레거시 `behavior`**: `domainRegistry.ts`의 `DomainBehavior` / `DEFAULT_BEHAVIOR` — **UI 미연동** · V2.1 **`drawerDefaults`(L/R)** 로 대체 (§2.1).

### 2.1 드로어 정책 SSOT (`drawerDefaults`)

> **목적**: 도메인마다 L/R 드로어 **열림 강도(정책)** 를 registry에 선언하고, 사용자 **기억 vs 기본** 선택과 **runtime store**로 자율성을 타협한다.  
> **3층 분리**: **registry = 정책** · **store = 실행 상태** · **사용자 설정 = 기억 모드**

#### 타입 (V2.1 · `domainLayoutRegistry.ts`)

```ts
type DrawerOpenPolicy =
  | "required" // UX상 사실상 필수 — remember로 영구 closed 불가 · 재진입 시 open
  | "recommended" // registry defaultOpen 따름 · remember ON이면 사용자 마지막 상태
  | "optional" // 기본 closed(또는 defaultOpen:false) · remember ON이면 사용자 존중
  | "hidden"; // 해당 side 슬롯 없음 (right: null 등)

type DrawerSidePolicy = {
  openPolicy: DrawerOpenPolicy;
  defaultOpen?: boolean; // recommended/optional일 때 registry 기본 (미지정: rec→true, opt→false)
  autoOpen?: boolean; // content 준비 후 1회 자동 open
  emptyMessage?: string; // 패널 비었을 때 안내 (dev right 등)
};

type DomainDrawerDefaults = {
  left?: DrawerSidePolicy;
  right?: DrawerSidePolicy;
};
```

#### 사용자 설정 — 전역 `drawerMemoryMode`

| 모드                   | UI 라벨 (예)       | 도메인 전환 시                                              |
| ---------------------- | ------------------ | ----------------------------------------------------------- |
| **`remember`**         | 마지막 상태 기억   | `domainKey + side`별 저장값 우선 (`recommended`/`optional`) |
| **`reset-to-default`** | 항상 도메인 기본값 | registry `drawerDefaults`만 적용                            |

- **저장**: `userSettingsStore` 또는 V2.1 **`useLayoutStore`** + `localStorage`
- **키 예**: `layout.drawer.memoryMode` · `layout.drawer.byDomain.{domainKey}.{left|right}.open`
- **UI**: **설정 → 레이아웃 → “도메인 전환 시 드로어”** (전역 SSOT) · (선택) 드로어 헤더 **“이 도메인 기본값으로 초기화”**

#### 도메인 전환 시 해석 (SSOT)

```text
onDomainChange(domainKey):

  for side in [left, right]:
    policy = registry.drawerDefaults[side]
    if policy.openPolicy == 'hidden' → skip

    saved = loadSaved(domainKey, side)   // memoryMode == 'remember' 일 때만

    if memoryMode == 'remember' && saved != null && policy.openPolicy != 'required':
      open = saved.open
    else:
      open = resolveFromPolicy(policy)
        // required     → true
        // recommended  → policy.defaultOpen ?? true
        // optional     → policy.defaultOpen ?? false

    if policy.autoOpen && !userManuallyClosedThisSession(side):
      open = true

    useLayoutStore.setDrawerOpen(side, open)
```

#### §3 `drawerDefaults` 열 — 약어 · `openPolicy` × `drawerMemoryMode`

| 약어        | `openPolicy`               | 설명                                                                                      | `reset-to-default`             | `remember`                                                         | 비고                                |
| ----------- | -------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------ | ----------------------------------- |
| **req**     | `required`                 | **필수 open** — 패널 없으면 UX 깨짐                                                       | 항상 open                      | **재진입 시 open** (세션 중 닫기 허용 · **영구 closed 저장 불가**) | `dev` right (`R:req†`)              |
| **rec**     | `recommended`              | **권장 open** — registry `defaultOpen` 기본 true                                          | registry default               | 사용자 **마지막** open/closed                                      | §3 **L** 전부 · **R** 7키           |
| **opt**     | `optional`                 | **선택** — registry `defaultOpen` 기본 false · 닫힌 채 시작 OK                            | registry default (보통 closed) | 사용자 **마지막** 상태                                             | 랜딩·카탈로그·보조 패널 · **R** 7키 |
| **hid**     | `hidden`                   | **해당 side 없음** — 슬롯 미등록 · 정책 **skip**                                          | —                              | —                                                                  |                                     |
| **†**       | (수식)                     | **`autoOpen`** — content 준비 후 1회 자동 open · **`emptyMessage`** — 패널 비었을 때 안내 | 상위 `openPolicy` 따름         | 상위 `openPolicy` 따름                                             | `req`와 병기 (`R:req†`)             |
| **opt→rec** | `optional` → `recommended` | As-Is fallback only · **전용 RightPanel 신규 후** `rec`로 승격                            | `rec`와 동일                   | `rec`와 동일                                                       | `network`                           |

> **`required` + `remember`**: 제품 최소 UX 우선 — 닫아도 **다른 도메인 갔다 오면** 다시 open · 1회 안내: “이 도메인은 패널이 필요합니다”.

**§3 표기**: `L:rec · R:opt` = left `recommended` · right `optional`

#### Runtime SSOT — `useLayoutStore` (V2.1)

| 담당                 | 내용                                                                |
| -------------------- | ------------------------------------------------------------------- |
| **registry**         | `drawerDefaults` — 도메인별 **정책** (열어야 하는가)                |
| **`useLayoutStore`** | `leftOpen` · `rightOpen` · 폭 · `statusBarExpanded` — **현재 상태** |
| **사용자 설정**      | `drawerMemoryMode` + `byDomain` persisted state                     |

**Store-Driven Layout** (§5대 원칙 ⑤)과 동일 축 — [`08_TDD_NEXAOS_설계표준_미션크리티컬전략`](./08_TDD_NEXAOS_설계표준_미션크리티컬전략.md) `useLayoutStore` 참조.

---

## 3. 등록 도메인 (`domainKey` 16)

> 공통 구현 루트: `apps/web/src/domains/{folder}/` · 상태 **Zustand** · API **`apps/backend/src/modules/`** (§5). 슬롯 파일명 규칙은 §4. 도메인 맵: [`08_TDD_NEXAOS_도메인마스터맵`](./08_TDD_NEXAOS_도메인마스터맵_v1.0.md) (TDD-059).

### 3.0 요약 인덱스

| **domainKey** | 폴더     | 목적 (한 줄)                                   | 드로어 L/R     |
| :------------ | :------- | :--------------------------------------------- | :------------- |
| **home**      | home/    | 플랫폼 랜딩·NexaBlock                          | rec / opt      |
| **nexia**     | nexia/   | **NEXIA 7탭** · Omnix 허브 · NEXA-CELL         | rec / rec      |
| **ontex**     | ontex/   | 온톨로지 · Graph RAG · Nexion 캔버스 · Trace · 아카이브 | rec / rec      |
| **nexabo**    | nexabo/  | 대시보드·IoT·Telemetry 관제                    | rec / rec      |
| **nexet**     | nexet/   | **넥셋 마켓** · SW·HW 자산 유·무료 유통        | rec / rec      |
| **erp**       | erp/     | ERP 통합 셸 · 부품·재고·일정 (§3.D)            | rec / rec      |
| **infra**     | infra/   | 장치 등록·my-devices (→ nexabo)                | rec / rec      |
| **network**   | network/ | WiFi·CAN·MQTT 프로토콜                         | rec / opt→rec  |
| **solutions** | solutions/ | 산업·라이프 솔루션 카탈로그                    | rec / opt      |
| **portfolio** | portfolio/ | 프로젝트 성과·결과물 전시                      | rec / opt      |
| **extension** | extension/ | 플러그인 UI (→ u2bee)                        | rec / opt      |
| **settings**  | settings/  | 계정·환경·레이아웃 설정                        | rec / opt      |
| **my**        | my/        | 프로필·개인 workspace                          | rec / opt      |
| **help**      | help/      | 가이드·FAQ·온보딩                              | rec / opt      |
| **dev**       | dev/       | 문서·DB·테마·개발 가이드                       | rec / **req†** |
| **admin**     | admin/     | 슈퍼 관리자·멤버·리소스                        | rec / rec      |

---

### A. 진입·공통

**`home`** (`home/`) — 로그인 후 **첫 화면**. NexaBlock·보드 바로가기로 다른 도메인으로 분기한다. 업무용 밝은 테마(`office-light`). 프론트 only.

**`settings`** (`settings/`) — 계정·환경·**드로어 기억 모드**(`drawerMemoryMode`) 등 플랫폼 전역 설정. `ontex` 캔버스·Flow 관련 전역 설정 SSOT가 여기에 둘 수 있다.

**`my`** (`my/`) — 프로필·디바이스·**개인 프로젝트** workspace. 인증·프로젝트 CRUD는 Nest `auth` · `projects`와 연동한다.

**`help`** (`help/`) — 정적 가이드·FAQ. App Router SEO에 적합한 읽기 전용 도메인.

_슬롯 예:_ `HomeLeftNav.tsx` · `SettingsContent.tsx` · `MyRightPanel.tsx` 등 — 패턴 `views/{left,content,right}/*`.

---

### B. NEXA 제품군

**`nexia`** (`nexia/`) — **플랫폼 핵심 지능**. 7탭 셸(Omnix·Normex·Logex·Scribx·Vivex·Twinex·Navex)로 인간·AI·장치를 조율한다. Twinex에 **NEXA-CELL**(ESPHome·펌웨어)이 통합된다. LLM·스트리밍은 **`apps/agent-graph`만** 사용한다. Yjs·협업은 `apps/sync`. 상세: [`08_TDD/NEXIA`](../NEXIA/README.md).

_슬롯 예:_ `NexiaShell.tsx` · `tabs/*` · `NexiaRightPanel.tsx` · `NexiaHeaderActions.tsx` · `useNexiaStore`.

**`ontex`** (`ontex/`) — **온톨로지·지식 통합 도메인**. NEXIA 산출물·IoT·ERP 이벤트를 **Graph RAG** · **pgvector** · RDF/JSON-LD로 연결한다. LangGraph로 그래프 탐색·추론 흐름을 오케스트레이션한다. **Nexion React Flow 캔버스**(관계·워크플로 시각 편집 · Yjs) · **Trace·데이터 흐름 분석** · **Tiptap 아카이브·Hub·Sentinel 저장소**를 이 도메인에 통합한다. Nest `archive/` · `knowledge/` · `ontology/`와 연동. 상세: [`08_TDD/Ontex`](../Ontex/08_TDD_Ontex_기술스택운영방침_v1.0.md) (TDD-057).

**Content**만 `subRoute`로 분기 (L/R 드로어 공유 · `erp`와 동일 패턴).

| `subRoute` | 역할 | 비고 |
| :--- | :--- | :--- |
| `canvas` | 지식 데스크 · Nexion React Flow | 구 `nexion/` |
| `explore` | Graph RAG · 온톨로지 탐색 | |
| `trace` | 데이터 흐름 · Trace | 구 `nexeed` |
| `archive` | Tiptap·Hub·Sentinel 저장소 | 구 `nexa-archive` |

_슬롯 예:_ `OntexShell.tsx` · `views/canvas/*` · `views/explore/*` · `views/trace/*` · `views/archive/*` · `OntexRightPanel.tsx`.

**`nexabo`** (`nexabo/`) — **넥사보드**. Panel·대시·IoT Telemetry·`/nexabo/admin`. `statusBar` · `statusPanel`로 관제 UX. `infra` 기능 흡수 방향. 테마 `power-grid` · `factory-night` · `control-room`.

**`nexet`** (`nexet/`) — **넥셋(Nexet) 마켓** `domainKey`. NEXA OS에서 사용할 수 있는 **소프트웨어**(위젯·템플릿·로직·워크플로·익스텐션 등)와 **하드웨어**를 **유료·무료**로 검색·구독·설치·유통하는 독립 도메인이다. 실행(`nexia`)·창작(`ontex`)과 분리되어 **소유권·라이선스·버전·Capability ID(`cap.*`)** 를 전문 처리한다. 자산 상세·거버넌스·5대 핵심 자산 체계는 [`Market SPEC`](../../../../NEXA-Platform/docs/Market/Market%20SPEC%20마켓%20지능%20유통%20및%20생태계%20통합%20규격서.md)(Nexara 서사)를 따른다. 설치된 자산의 메타·족보(Why Chain)는 `ontex`로 피드할 수 있다.

| 자산 축 | 예시 | 비고 |
| :--- | :--- | :--- |
| **SW** | UI 위젯 · UCL 템플릿 · Map · Workflow · Extension | Market SPEC 5대 자산 |
| **HW** | 모듈 · 디바이스 · 센서 키트 · 펌웨어 번들 | `my`·`infra`·Twinex와 Late Anchoring |

_슬롯 예:_ `NexetLeftNav.tsx` · `NexetCatalogContent.tsx` · `NexetRightPanel.tsx` · `useNexetStore`.

---

### C. IoT·네트워크

**`infra`** (`infra/`) — **장치·IoT 관제**(my-devices). DeviceDetails·등록 UX. Nest `devices` · `iot`. 장기적으로 **`nexabo`로 흡수**.

**`network`** (`network/`) — WiFi·CAN·Socket·**MQTT** 등 네트워크 프로토콜 설정·모니터링. `nexabo`/IoT 스택과 연계.

**`solutions`** (`solutions/`) — Industrial / Living / Media / Art **솔루션 카탈로그**·데모. 마케팅·탐색용, 백엔드 의존 낮음.

---

### D. ERP·전시

**`erp`** (`erp/`) — ERP **통합 셸**. Left/Right 드로어·상태바는 도메인 공통 · **Content**만 `subRoute`로 분기한다.

| `subRoute`    | 라벨          | 역할                     |
| :------------ | :------------ | :----------------------- |
| `overview`    | 업무 대시보드 | ERP 홈 · KPI             |
| `parts`       | 부품관리      | 분류 · BOM · 부품 마스터 |
| `inventory`   | 재고          | 입출고 · 창고            |
| `schedule`    | 일정관리      | 생산·납기·작업 일정      |
| `procurement` | 발주·구매     | Phase 2                  |
| `reports`     | 리포트·집계   | Phase 2                  |

_라우트 예:_ `/erp` → `overview` · `/erp/parts` · `/erp/inventory` · `/erp/schedule` — Nest `parts/` · `@nexa/shared` Zod.

**`portfolio`** (`portfolio/`) — 프로젝트 **성과·결과물 전시**(`project_releases`). CRUD는 `my` · `projects` API.

---

### E. 확장

**`extension`** (`extension/`) — U2BEE 등 **플러그인 UI**. To-Be에서 **`u2bee`** shell로 통합·이관.

---

### F. 개발·관리

**`dev`** (`dev/`) — 문서·DB 스키마·테마·코드 분석·**개발 가이드**. 문서 SSOT 탐색. 우측 드로어 **필수**(R:req†, `autoOpen`). Nest `specs` · `jobs`.

**`admin`** (`admin/`) — **슈퍼 관리자**: 멤버·AI 리소스·비밀번호. Nest `auth` · Grade·audit. (`domainKey` = 폴더명 `admin/` 일치)

---

### 3.9 공통 정책 요약

| 항목          | 내용                                                                                           |
| :------------ | :--------------------------------------------------------------------------------------------- |
| **드로어**    | L 전부 `recommended` · R `rec` 7 · `opt` 7 · `req` 1 (`dev`†) · `opt→rec` 1 (`network`) — §2.1 |
| **슬롯 파일** | `views/{left,content,right}/*.tsx` — §4 폴더 규약                                              |
| **store**     | Zustand `use*Store` (도메인·전역)                                                              |
| **subRoute**  | `erp` · `ontex` — L/R 드로어 공유 · content만 분기 — §3.B · §3.D                               |

---

## 4. 도메인 폴더 관례 (To-Be)

```text
apps/web/src/domains/<name>/
├── views/
│   ├── left/          # Left Drawer — *.tsx
│   ├── content/       # 메인 — *Content.tsx 또는 *Shell.tsx
│   ├── right/         # Right Drawer — *RightPanel.tsx
│   └── status/        # statusBar · statusPanel (선택)
├── components/        # headerActions 등
├── hooks/
├── services/          # nexaonClient 등 — Nest REST
├── store/             # Zustand (use*Store.ts)
├── modules/           # 대형 하위 (nexia/tabs/*, nexaon/* …)
└── types/
```

**`nexia/` To-Be 예:** `tabs/omnix` · `tabs/twinex` (NEXA-CELL) · `modules/nexaon/` — [`모노레포 §apps/web`](../LangGraph/08_TDD_LangGraph_모노레포폴더구조_v1.0.md)

| 규칙             | 내용                                                                                  |
| :--------------- | :------------------------------------------------------------------------------------ |
| **네이밍**       | `domainKey` = 폴더명 권장 — `erp` → `erp/` · `admin` → `admin/`                       |
| **서브 라우트**  | `erp` (`overview` · `parts` …) · `ontex` (`canvas` · `explore` · `trace` · `archive`) — L/R 공유 · content만 `subRoute` |
| **store**        | 도메인 Zustand `store/` · 계약 `packages/shared`                                      |
| **cross-import** | `domains/a` → `domains/b` **금지** — 공통 `engines/` · `shared/`                      |
| **드로어**       | `drawerDefaults` + **`useLayoutStore`** (§2.1)                                        |
| **As-Is 이식**   | `*Domain.tsx` → `views/content/*Content.tsx` — registry 경로만 갱신                   |

<details>
<summary>As-Is 폴더 트리 (shadcn/ui · 참고용)</summary>

```text
apps/web/src/domains/<name>/
├── <Name>Domain.tsx
├── views/{left,content,right}/*.tsx
├── store/   # Zustand
└── …
```

</details>

---

## 5. 백엔드 ↔ 프론트 대응 (To-Be)

| `apps/backend/src/modules/` | 프론트 `domainKey` | 비고                                          |
| :-------------------------- | :----------------- | :-------------------------------------------- |
| `auth/`                     | `my` · `admin`     | JWT · 멤버                                    |
| `nexaon/` · `ontology/`     | `nexia` · `ontex`  | Yjs debounce · Draft · Neo4j · Graph RAG      |
| `agent-graph/` (프록시)     | `nexia` · `ontex`  | LLM·SSE·Embed — **연산은 `apps/agent-graph`** |
| `esphome/`                  | `nexia`/Twinex     | NEXA-CELL YAML·OTA                            |
| `knowledge/`                | `ontex` · `dev`    | pgvector · embed job                          |
| `devices/` · `iot/`         | `infra` → `nexabo` | 장치·텔레메트리                               |
| `parts/`                    | `erp`              | 부품·재고 ERP (`subRoute`)                    |
| `market/` (To-Be)           | `nexet`            | Capability·라이선스·유통 · `cap.*` / `usr.*`  |
| `projects/`                 | `my` · `portfolio` |                                               |
| `archive/`                  | `ontex`            | Tiptap·Hub·Sentinel 저장소                    |
| `specs/` · `jobs/`          | `dev`              | 문서 vault                                    |

- 협업: **`apps/sync`** (Hocuspocus) — Nest에 WebSocket **금지**
- 계약: **`packages/shared`** Zod

<details>
<summary>As-Is Express `server/domains/` (레거시)</summary>

| server/domains | domainKey                 |
| :------------- | :------------------------ |
| `ai/`          | `nexia` (구 AI 채팅 중심) |
| `devices/`     | `infra/`                  |
| …              | §3 As-Is 표 참고          |

</details>

---

## 6. V2.1 `domainLayoutRegistry` 확장 (To-Be)

As-Is `domainRegistry` 슬롯에 아래를 **추가**한다. **전체 16개 `domainKey`**는 §3.0 인덱스와 **동일 키**로 점진 등록.

| 추가 슬롯            | 용도                                                      |
| -------------------- | --------------------------------------------------------- |
| **`drawerDefaults`** | L/R **`openPolicy`** · `autoOpen` · `emptyMessage` — §2.1 |
| `statusBar`          | 도메인 전용 30px 한 줄 (IoT·관제)                         |
| `statusPanel`        | StatusOpsPanel **아래** 도메인 상세                       |
| `themePreset`        | `power-grid` · `factory-night` · `office-light`           |

**V2.1 신규·통합 도메인 (As-Is 표 외)**

| `domainKey` | 설명               | As-Is 대응  | `themePreset` (보강본) |
| ----------- | ------------------ | ----------- | ---------------------- |
| `u2bee`     | U2BEE shell        | `extension` | `office-light`         |
| `ontex`     | 온톨로지·Graph RAG | _(신규)_    | `office-light`         |

> IoT·Telemetry·Safety 통합 관제는 **`nexabo`**에 `statusBar` · `statusPanel` · `power-grid`/`factory-night`/`control-room`으로 확장한다 (`infra` 연계).

**`themePreset` 권장 매핑 (보강본 §Theme)**

| `themePreset`   | 권장 `domainKey`                                          |
| --------------- | --------------------------------------------------------- |
| `office-light`  | `home` · `nexia` · `ontex` · `nexet` · `u2bee` · 대부분 업무 도메인 |
| `power-grid`    | `nexabo` (전력·에너지·IoT)                                |
| `factory-night` | `nexabo` (야간·저조도)                                    |
| `control-room`  | `nexabo` (24h 관제 옵션)                                  |

```ts
// V2.1 등록 예 (nexia — 슬롯 + drawerDefaults + 확장)
nexia: {
  left: () => import('@/domains/nexia/views/left/NexiaLeftNav'),
  content: () => import('@/domains/nexia/views/content/NexiaContent'),
  right: () => import('@/domains/nexia/views/right/NexiaRightPanel'),
  headerActions: () => import('@/domains/nexia/components/NexiaHeaderActions'),
  statusBar: () => import('@/domains/nexia/views/status/NexiaStatusBar'),
  statusPanel: () => import('@/domains/nexia/views/status/NexiaStatusPanel'),
  themePreset: 'office-light',
  drawerDefaults: {
    left: { openPolicy: 'recommended' },
    right: { openPolicy: 'recommended' },
  },
},

// dev — required + autoOpen (§3 R:req†)
dev: {
  /* left, content, right … */
  drawerDefaults: {
    left: { openPolicy: 'recommended' },
    right: {
      openPolicy: 'required',
      autoOpen: true,
      emptyMessage: '문서를 선택하거나 새로 만드세요.',
    },
  },
},
```

---

## 7. 신규 도메인 추가 절차

1. `apps/web/src/domains/{folder}/views/{left,content,right}/*.tsx` 생성
2. `domainLayoutRegistry.ts`에 lazy import + **`drawerDefaults`** (§2.1 · §3.0 L/R) 등록
3. 전역 메뉴(`globalMenu` / router)에 `domainKey`·route 연결
4. `useLayoutStore` + **`drawerMemoryMode`** UI (설정 → 레이아웃)
5. (V2.1) `statusBar` · `themePreset` · `packages/shared/schemas` 필요 시 추가
6. `apps/backend/src/modules/` (+ 필요 시 `apps/agent-graph` 그래프) 대응

---

## 8. `engines/` · `system/` · `shared/` (To-Be)

| 경로                                       | 용도                                                  |
| :----------------------------------------- | :---------------------------------------------------- |
| `apps/web/src/engines/react-flow/`         | React Flow node/edge types · Dagre                    |
| `apps/web/src/engines/tiptap/` · `monaco/` | 에디터 엔진                                           |
| `apps/web/src/components/store/`           | **Zustand** — `useLayoutStore` · auth · drawer memory |
| `packages/shared/src/schemas/`             | Zod SSOT — `nexaon/` · `agent-graph/`                 |
| `apps/web/src/components/ui/`              | Explorer · Table · Viewer                             |

> As-Is `apps/web/src/engines/diagram/`(D3)·`nexaNodeStore`(Zustand)는 **레거시**. 그래프·CELL은 **React Flow** + `nexia`/Twinex.

---

## 9. M2P 및 BAX 시스템의 핵심 설계 React 컴포넌트 예제

M2P 및 BAX 시스템의 핵심 설계 원칙인 **3축 메타데이터(Depth × Mutability × Priority)**와 **3×3 매트릭스 주소 체계**를 반영한 React 컴포넌트 예제

> 이 코드는 NEXA OS V2.1의 기술 스택인 Next.js, Tailwind CSS, 그리고 Framer Motion을 기반으로 합니다.

### 1. 컴포넌트 속성 인터페이스 정의

모든 BAX 컴포넌트는 시스템이 위치와 시각 효과를 결정할 수 있도록 다음 메타데이터를 가져야 합니다.

```typescript
// packages/shared/src/types/bax.ts (또는 컴포넌트 상단)
export type Depth = "BG" | "MID" | "FG";
export type Mutability = "IMMUTABLE" | "MUTABLE";
export type Priority = "ESSENTIAL" | "CONTEXTUAL" | "TEXTURE";
export type MatrixID = "BG-L" | "BG-C" | "BG-R" | "MID-L" | "MID-C" | "MID-R" | "FG-L" | "FG-C" | "FG-R";

interface BaxComponentProps {
  matrixId: MatrixID;
  depth: Depth;
  mutability: Mutability;
  priority: Priority;
  children: React.ReactNode;
}
```

### 2. 핵심 컴포넌트 예제: Comp C (IoT Card)

**Comp C**는 근경(FG)에 위치하며, 가변적(MUTABLE)이고 본질적인(ESSENTIAL) 정보를 담습니다. 가독성 확보를 위한 **Safe-Zone(min-w 300px)**과 **V1 진동(Sparkline)**이 적용된 예시입니다.

```tsx
import { motion } from "framer-motion";
import { useBaxStore } from "@/store/useBaxStore"; // 상태 관리 스토어 가정

export const IoTCard = ({ matrixId, data }: { matrixId: MatrixID; data: any }) => {
  const { circuitState } = useBaxStore(); // 회로 차단기 상태 구독

  return (
    <motion.div
      // 300ms Easing 적용
      layout
      transition={{ duration: 0.3, ease: "easeInOut" }}
      // Matrix ID에 따른 그리드 위치 및 시각 속성 매핑
      className={`
        bax-component safe-zone
        depth-fg mutability-mutable priority-essential
        min-w-[300px] min-h-[120px] p-6 rounded-2xl
        bg-background/80 backdrop-blur-md shadow-xl
        ${matrixId === "FG-C" ? "scale-110 border-2 border-primary" : "scale-100"}
      `}
    >
      <div className="flex flex-col gap-2">
        <span className="text-xs font-mono opacity-50">{matrixId}</span>
        <h3 className="text-2xl font-bold">온도 센서</h3>
        <p className="text-4xl font-black text-status-ok">{data.value}°C</p>
      </div>

      {/* V1 진동: Sparkline (Circuit Open 시 차단) */}
      {circuitState === "closed" && (
        <div className="mt-4 h-8 w-full opacity-30">
          <SparklineV1 data={data.history} />
        </div>
      )}
    </motion.div>
  );
};
```

### 3. 미학적 컴포넌트 예제: Comp A (Giant Typography)

**Comp A**는 원경(BG)에서 레이아웃의 무게중심을 잡는 불변(IMMUTABLE)의 질감(TEXTURE) 컴포넌트입니다.

```tsx
export const GiantBackground = ({ matrixId, text }: { matrixId: MatrixID; text: string }) => {
  return (
    <div
      className="
        depth-bg mutability-immutable priority-texture
        pointer-events-none select-none
        fixed flex items-center justify-center
        w-full h-full overflow-hidden
      "
      style={{
        // Matrix ID(BG-L 등)에 따른 고유 블러 및 투명도 적용
        filter: "blur(40px)",
        opacity: 0.05,
      }}
    >
      <h1 className="text-[15vw] font-black leading-none uppercase">{text}</h1>
    </div>
  );
};
```

### 4. VirtualCanvas에서의 조립 (레이아웃 엔진)

3×3 그리드 시스템 내에서 CSS Variables를 통해 **적정여백율(OVR)**과 **호흡(Breathing)** 효과를 컨트롤합니다.

```tsx
// apps/bax-demo/src/components/VirtualCanvas.tsx
export const VirtualCanvas = () => {
  const { voidRatio, focusBlur } = useBaxStore();

  return (
    <div
      className="virtual-canvas grid grid-cols-3 grid-rows-3 h-screen w-screen"
      style={{
        // BAX 엔진 상태를 CSS 변수로 전달
        '--bax-void-ratio': `${voidRatio}%`,
        '--bax-focus-blur': `${focusBlur}px`,
        padding: `calc(var(--bax-void-ratio) / 5)` // 여백을 통한 호흡 구현
      } as React.CSSProperties}
    >
      {/* 컴포넌트들이 지정된 matrixId에 맞춰 배치됨 */}
      <GiantBackground matrixId="BG-L" text="NEXA" />
      <div className="col-start-3 row-start-3 flex items-center justify-center">
        <IoTCard matrixId="FG-R" data={{ value: 72, history: [...] }} />
      </div>
    </div>
  );
};
```

### 구현 시 주의사항

1.  **G2 가드레일 (Safe-Zone 우선)**: 브라우저 크기가 작아져서 `void_ratio`와 `Safe-Zone(300px)`이 충돌할 경우, 여백율을 포기하더라도 정보 가독성을 위해 `Safe-Zone`을 우선해야 합니다.
2.  **G5 가드레일 (진동 차단)**: 시스템 부하(`circuitState !== 'closed'`) 발생 시, Sparkline과 같은 모든 **Vibration 계층(V1~V3)**은 즉시 렌더링을 중단(0 frame)해야 합니다.
3.  **300ms Easing**: 모든 상태 변화(`matrix_id` 이동, `blur` 변경 등)는 시각적 피로도를 낮추기 위해 반드시 **300ms 이하의 부드러운 전환**을 거쳐야 합니다.

## _최종 갱신: 2026-06-12 — `nexet` 마켓 정의 · §2.1 R 드로어 7/7 · `ontex`/`erp` `subRoute`._

## 관련 문서

| 관계        | 문서                                                                                                                              |
| :---------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| 상위 TDD    | [NEXA OS 설계 표준 · 미션 크리티컬 전략 (TDD-001)](./08_TDD_NEXAOS_설계표준_미션크리티컬전략.md)                                  |
| 도메인 맵   | [NEXA OS · 도메인 마스터 맵 v1.0 (TDD-059)](./08_TDD_NEXAOS_도메인마스터맵_v1.0.md) |
| Ontex SSOT  | [Ontex · 기술 스택 운영 방침 v1.0 (TDD-057)](../Ontex/08_TDD_Ontex_기술스택운영방침_v1.0.md) |
| UI 레이아웃 | [NEXIA MainShell · 레이아웃 v1.0 (UIX-004)](../../07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md) |
| 제품 PRD    | [NEXIA UI 기능 명세 — MVP Phase UI v1.0 (PRD-001)](../../05_PRD/05_PRD_NEXIA_UI기능명세_MVPPhaseUI_v1.0.md)                     |
