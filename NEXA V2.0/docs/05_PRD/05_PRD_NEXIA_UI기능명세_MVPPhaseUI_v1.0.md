---
implements_doc: 
see_also: []
doc_id: PRD-001
title: "NEXIA UI 기능 명세 — MVP Phase UI v1.0"
category: "05_PRD"
domain: NEXIA
status: published
created: 2026-06-10
updated: 2026-06-12
parent_doc: BRD-001
terms_standard: ["react-flow", "yjs", "sse", "shacl", "msw", "web-serial"]
terms_nexa: ["nexia", "MainShell", "NexiaContent", "GraphCanvas", "ExplorerTree", "domainKey", "NexaonShell", "useLayoutStore", "RunPanel", "Navex", "Global-Navex", "GlobalFileExplorer", "tabId"]
tags: ["doc/cat/05-prd", "doc/domain/nexia", "std/react-flow", "std/yjs", "std/sse", "std/shacl", "std/msw", "std/web-serial", "nexa/nexia", "nexa/MainShell", "nexa/NexiaContent", "nexa/GraphCanvas", "nexa/ExplorerTree", "nexa/domainKey", "nexa/NexaonShell", "nexa/useLayoutStore", "nexa/RunPanel", "nexa/Navex", "nexa/Global-Navex", "nexa/GlobalFileExplorer", "nexa/tabId"]
---

# NEXIA UI 기능 명세 — MVP Phase UI v1.0

> **범위:** UI **1 순위** 구현 — `domainKey: nexia` · 레이아웃 SSOT [`07_UIUX NEXIA MainShell 레이아웃 v1.0`](../07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md). Nexaon(`modules/nexaon/`) 은 Logex·ontology 서브모드.
> **백엔드:** 초기에는 **Mock / MSW** 허용 — UI-L5 이후 Nest 연동.

**제품 방향:** NEXA 는 **산업 → 아트 → 일상** 순으로 발전한다. MVP UI 는 **1 단계 (산업·온톨로지 엔지니어링)** 에 최적화되며, 이후 아트·일상 UX 로 확장한다. — [`01_BRD_NEXA_사업마스터플랜`](../01_BRD/01_BRD_NEXA_사업마스터플랜.md)

---

## 1. MVP 목표

| 목표   | 설명                                                                |
| ------ | ------------------------------------------------------------------- |
| **G1** | Human 이 **React Flow**에서 IoT 온톨로지 그래프를 편집·시각화        |
| **G2** | **Yjs**로 다중 사용자 (·AI Diff) **실시간 공유** 체감                |
| **G3** | **Run · SSE** 타임라인으로 LangGraph 실행 **가시화**                |
| **G4** | **승인 A/B/C · SHACL violation** UI — export/deploy **게이트 표현** |
| **G5** | (Phase UI-3) ESPHome YAML preview · Web Serial **배포 UI**          |

**비목표 (MVP ✗):** Neo4j Cypher 콘솔 · 전체 7 탭 완성 · RAG 코퍼스 관리 UI · 모바일 최적화

---

## 2. 사용자·페르소나

| 역할                  | 주 작업면                  | 핵심 니즈                    |
| --------------------- | -------------------------- | ---------------------------- |
| **온톨로지 엔지니어** | GraphCanvas · ExplorerTree | 클래스·핀맵·관계 정확히 편집 |
| **AI 협업자 (Human)**  | Run Chat · DiffOverlay     | AI 제안 검수·승인            |
| **현장 엔지니어**     | Deploy 탭                  | YAML · OTA · USB             |

---

## 3. 화면별 기능 명세

### 3.1 MainShell (전역)

| ID      | 기능                                                      | 우선순위 | 수용 기준                               |
| ------- | --------------------------------------------------------- | -------- | --------------------------------------- |
| F-MS-01 | domainKey 전환 시 left/content/right/status **동시 교체** | P0       | nexia ↔ home 전환 시 슬롯 유지 ✗       |
| F-MS-02 | Content **단일 세로 스크롤**                              | P0       | 헤더·상태바 고정                        |
| F-MS-03 | L/R 드로어 리사이즈 · remember                            | P1       | `useLayoutStore` persist                |
| F-MS-04 | SystemStatusBar compact/expanded                          | P1       | StatusOpsPanel + NexiaStatusPanel stack |
| F-MS-05 | `themePreset: office-light` (nexia)                       | P2       | domain 진입 시 apply                    |

### 3.2 NEXIA 셸 (`NexiaContent`)

| ID      | 기능                               | 우선순위 | 수용 기준                        |
| ------- | ---------------------------------- | -------- | -------------------------------- |
| F-NX-01 | 7 탭 TabBar · URL sync              | P0       | `/nexia/{tabId}` deep link       |
| F-NX-02 | tabId 별 Left/Right **패널 스왑**   | P0       | logex 진입 시 ExplorerTree       |
| F-NX-03 | HeaderActions tabId 별 분기         | P1       | Nexaon Run 버튼 logex+ontology 만 |
| F-NX-04 | NexiaStatusBar — SYNC · room · run | P1       | sync offline 시 degraded 표시    |

### 3.3 Nexaon — ExplorerTree (Left)

| ID      | 기능                             | 우선순위 | 수용 기준                     |
| ------- | -------------------------------- | -------- | ----------------------------- |
| F-EX-01 | 프로젝트 스위처                  | P0       | projectId 변경 → room 변경    |
| F-EX-02 | 트리: Classes · Assets · PinMaps | P0       | 클릭 → canvas focus node      |
| F-EX-03 | 필터: 타입 · SHACL 상태          | P2       | violation 만 보기              |
| F-EX-04 | Run history 목록                 | P2       | run_id 클릭 → RunPanel replay |

### 3.4 Nexaon — GraphCanvas (Content)

| ID      | 기능                                                     | 우선순위 | 수용 기준                  |
| ------- | -------------------------------------------------------- | -------- | -------------------------- |
| F-GC-01 | React Flow pan/zoom · minimap                            | P0       | 500+ node 30fps 목표       |
| F-GC-02 | 노드 타입: `class` · `asset` · `pin` · `port` · `sensor` | P0       | Zod `ontology-node` 준수   |
| F-GC-03 | edge 생성·삭제 · relation label                          | P0       | Yjs 즉시 반영              |
| F-GC-04 | 다중 선택 · box select                                   | P1       | Delete 키                  |
| F-GC-05 | Auto-layout (Dagre)                                      | P1       | Toolbar 버튼               |
| F-GC-06 | DiffOverlay — AI 제안 node/edge **점선**                 | P1       | accept/reject (local)      |
| F-GC-07 | SHACL violation **red outline**                          | P1       | SSE `shacl_violation` 수신 |
| F-GC-08 | 협업 커서 Awareness (선택)                               | P3       | Yjs awareness              |

**노드 데이터 (최소 필드)**

```ts
type NexaonNodeData = {
  label: string
  kind: 'class' | 'asset' | 'pin' | 'port' | 'sensor'
  pinMap?: { gpio: number; mode: string }
  shaclStatus?: 'ok' | 'violation' | 'unknown'
  draftSource?: 'human' | 'ai' | 'import'
}
```

### 3.5 Nexaon — SpecsPreview (Content, optional split)

| ID      | 기능                           | 우선순위 | 수용 기준                     |
| ------- | ------------------------------ | -------- | ----------------------------- |
| F-SP-01 | TipTap read/write · Yjs collab | P2       | specs wikilink 클릭 시 scroll |
| F-SP-02 | 패널 접기 · 리사이즈           | P1       | width persist localStorage    |
| F-SP-03 | Normex 용어 hover 카드         | P3       | normex 탭 연동                |

### 3.6 Nexaon — RunPanel (Content bottom)

| ID      | 기능                         | 우선순위 | 수용 기준            |
| ------- | ---------------------------- | -------- | -------------------- |
| F-RP-01 | graph_id 선택 · Run 시작     | P0       | `nexaon_ingest` 등   |
| F-RP-02 | SSE 이벤트 타임라인          | P0       | step · token · error |
| F-RP-03 | Stop / Cancel                | P1       | run_id abort API     |
| F-RP-04 | violation 클릭 → canvas jump | P1       | nodeId focus         |
| F-RP-05 | collapsible height           | P1       | 0~240px              |

**SSE 이벤트 UI 매핑**

| event             | UI                              |
| ----------------- | ------------------------------- |
| `run_started`     | 타임라인 헤더 · strip `run:#id` |
| `token`           | Run Chat 스트림 (Right)         |
| `graph_diff`      | DiffOverlay merge 제안          |
| `shacl_violation` | GC outline + SHACL 패널         |
| `run_completed`   | 승인 A 버튼 활성 검토           |

### 3.7 Nexaon — Right Drawer 패널

#### Properties (F-PR-\*)

| ID      | 기능                         | P   |
| ------- | ---------------------------- | --- |
| F-PR-01 | 선택 node/edge 필드 편집     | P0  |
| F-PR-02 | Zod inline validation 메시지 | P1  |
| F-PR-03 | 핀맵 GPIO · mode enum        | P0  |

#### Run Chat (F-RC-\*)

| ID      | 기능                       | P   |
| ------- | -------------------------- | --- |
| F-RC-01 | 프롬프트 입력 → Run 트리거 | P1  |
| F-RC-02 | SSE token 스트리밍 표시    | P0  |
| F-RC-03 | Chat history (session)     | P2  |

#### Approvals (F-AP-\*)

| ID      | 기능                             | P   |
| ------- | -------------------------------- | --- |
| F-AP-01 | **승인 A** Draft → Audit         | P1  |
| F-AP-02 | **승인 B** SHACL PASS → promoted | P1  |
| F-AP-03 | **승인 C** ESPHome build         | P2  |
| F-AP-04 | 승인자 · timestamp · run_id 표시 | P1  |

#### SHACL (F-SH-\*)

| ID      | 기능                            | P   |
| ------- | ------------------------------- | --- |
| F-SH-01 | violation 목록 (path · message) | P1  |
| F-SH-02 | 항목 클릭 → canvas focus        | P1  |
| F-SH-03 | Query Rewrite 재 Run shortcut    | P2  |

#### Deploy (F-DP-\*)

| ID      | 기능                        | P   |
| ------- | --------------------------- | --- |
| F-DP-01 | ESPHome YAML Monaco preview | P2  |
| F-DP-02 | Web Serial connect · flash  | P3  |
| F-DP-03 | OTA trigger (승인 C 후)     | P3  |

### 3.8 Header Actions (Nexaon)

| ID      | 기능                   | P   | 단축키       |
| ------- | ---------------------- | --- | ------------ |
| F-HA-01 | Run (last graph_id)    | P0  | `Ctrl+Enter` |
| F-HA-02 | Export (nexaon_export) | P1  | —            |
| F-HA-03 | Auto-layout            | P1  | `Ctrl+L`     |
| F-HA-04 | Sync reconnect         | P1  | —            |
| F-HA-05 | Deploy drawer open     | P2  | —            |

### 3.9 Navex · Global Navex (자산 탐색)

> **문제:** L1 탭만 쓰면 자산 탐색은 **Navex 탭 클릭 시에만** 노출된다.
> **해결:** 동일 엔진을 **Navex(탭)** 와 **Global Navex(Right Drawer 플러그인)** 두 표면으로 제공. — [`UIX-004`](../07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md) §4.5 · [`UIX-002`](../07_UIUX/07_UIUX_NEXIA_탐색기UI전략.md) §1.3

#### Navex 탭 (`tabId=navex`)

| ID      | 기능                                      | P   | 수용 기준                                      |
| ------- | ----------------------------------------- | --- | ---------------------------------------------- |
| F-NV-01 | 인프라·프로젝트 트리 (`GlobalFileExplorer`) | P1  | DB + 문서 폴더 병합 (PRD-008)                  |
| F-NV-02 | 선택 컨텍스트 → `activeTabId` 릴레이       | P1  | Logex·Scribx·Twinex·Vivex 수신                 |
| F-NV-03 | 서브패널 `[explorer][preview]`            | P1  | `subPaneId` 다중 창 (UIX-004 §5)               |
| F-NV-04 | `.nx*` 산출물 인덱싱 표시                 | P2  | TDD-056 §5.7                                   |

#### Global Navex (Right Drawer 탐색 플러그인)

| ID       | 기능                                           | P   | 수용 기준                                                |
| -------- | ---------------------------------------------- | --- | -------------------------------------------------------- |
| F-GN-01  | `navexPlacement` 설정: `tab` \| `right-drawer-plugin` | P1  | 기본값 `tab` · persist `useLayoutStore`                  |
| F-GN-02  | Right Drawer 상시 `GlobalNavexPlugin` 마운트     | P1  | `NexiaExplorerPanel` · F-NV-01 엔진 공유                 |
| F-GN-03  | **viewport ≥1280px** 에서만 플러그인 활성        | P1  | 미만 시 강제 `tab` · 설정 토글 비활성 + 툴팁             |
| F-GN-04  | Nexaon Right 세그먼트와 **병치** (스택·`[Explore]`) | P1  | `logex+ontology` 시 Properties/Run 유지                  |
| F-GN-05  | 선택 릴레이 — F-NV-02 와 **동일 계약**           | P1  | 탭 전환 중에도 탐색 컨텍스트 유지                        |

**명칭 SSOT:** 탭 = **Navex** · Right Drawer 상시 = **Global Navex** (혼용 금지).

---

## 4. API · Mock 계약 (UI 개발용)

UI-L5 전까지 **MSW** 또는 `nexaonClient` mock.

| Method | Path                                        | UI 소비          |
| ------ | ------------------------------------------- | ---------------- |
| POST   | `/api/v1/nexaon/runs`                       | Run 시작         |
| GET    | `/api/v1/nexaon/runs/:id/stream`            | SSE (Nest relay) |
| POST   | `/api/v1/nexaon/approvals/:gate`            | 승인 A/B/C       |
| GET    | `/api/v1/nexaon/draft/:projectId`           | 초기 load (선택) |
| WS     | `ws://sync/.../project:{id}:ontology:draft` | Yjs              |

---

## 5. Phase UI — 구현 로드맵

```text
UI-L0  MainShell + nexia stub
  ↓
UI-L1  7탭 + Logex placeholder
  ↓
UI-L2  NexaonShell + GraphCanvas (local state)
  ↓
UI-L3  Yjs + Hocuspocus + node types
  ↓
UI-L4  Left Explorer + Right segment panels
  ↓
UI-L5  RunPanel + SSE (mock → Nest)
  ↓
UI-L6  Global Navex Right 플러그인 (≥1280px)
  ↓
UI-L7  DiffOverlay + SHACL + Approvals
  ↓
UI-L8  SpecsPreview split + Deploy
```

| Phase     | 기능 ID (대표)               | Definition of Done                      |
| --------- | ---------------------------- | --------------------------------------- |
| **UI-L0** | F-MS-01~02                   | Storybook 또는 `/nexia` 라우트 스크린샷 |
| **UI-L1** | F-NX-01~02                   | 7 탭 URL · left swap                     |
| **UI-L2** | F-GC-01~03                   | 로컬 20 node 편집                       |
| **UI-L3** | F-GC-02~03 · Yjs             | 2 브라우저 동기화                        |
| **UI-L4** | F-EX-_ · F-PR-_              | 트리↔canvas · properties               |
| **UI-L5** | F-RP-\* · F-RC-02            | mock SSE 타임라인                       |
| **UI-L6** | F-GN-01~05 · F-NV-01~02      | Global Navex · ≥1280px 게이트           |
| **UI-L7** | F-AP-_ · F-SH-_ · F-GC-06~07 | 승인 버튼 · violation UX                |
| **UI-L8** | F-SP-_ · F-DP-_              | split · YAML preview                    |

---

## 6. 비기능 요구 (UI)

| 항목         | 목표                                                                 |
| ------------ | -------------------------------------------------------------------- |
| **초기 LCP** | nexia/logex/ontology < 3s (dev)                                      |
| **캔버스**   | 200 node · interaction < 16ms                                        |
| **SSE**      | token 첫 바이트 < 2s (mock 제외)                                     |
| **a11y**     | Toolbar · RunPanel `aria-label` · keyboard focus trap (Deploy modal) |
| **i18n**     | 1 차 ko-KR · 문자열 `domains/nexia/i18n/`                             |

---

## 7. 테스트 체크리스트 (UI)

- [ ] domain 전환 후 nexia drawerDefaults 복원
- [ ] `/nexia/logex/ontology/{id}` 새로고침 시 project 유지
- [ ] Yjs offline → SYNC_OFFLINE strip · 로컬 편집 유지
- [ ] Run 중 tab 전환 시 SSE 구독 정리 (memory leak ✗)
- [ ] SHACL violation 10 건 → canvas scroll · outline
- [ ] 승인 B 전 promoted 버튼 disabled
- [ ] Content scroll 이 canvas pan 과 충돌하지 않음

---


**결론:** **UI-L0~L4**로 **레이아웃·캔버스·협업**을 먼저 완성하고, **UI-L5**에서 **Run**을 붙인 뒤 **UI-L6**에서 **Global Navex**·**UI-L7**에서 **승인·SHACL**·**UI-L8**에서 **Deploy**를 연다.
---

## 관련 문서

| 관계 | 문서 |
| :--- | :--- |
| 상위 BRD | [NEXA 사업 마스터 플랜 (BRD-001)](../01_BRD/01_BRD_NEXA_사업마스터플랜.md) |
| UI 레이아웃 | [NEXIA MainShell · 레이아웃 v1.0 (UIX-004)](../07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md) |
| 탐색기 · Global Navex | [탐색기 UI 전략 (UIX-002)](../07_UIUX/07_UIUX_NEXIA_탐색기UI전략.md) |
| v0 프롬프트셋 | [NEXIA v0 UI 프롬프트셋 v1.0 (UIX-005)](../07_UIUX/07_UIUX_NEXIA_v0UI프롬프트셋_v1.0.md) |
| 모노레포 구조 | [LangGraph 모노레포 폴더 구조 v1.0 (TDD-007)](../08_TDD/LangGraph/08_TDD_LangGraph_모노레포폴더구조_v1.0.md) |
| 온톨로지 플랫폼 | [LangGraph · 인간-LLM 협업형 IoT 온톨로지 플랫폼 (TDD-008)](../08_TDD/LangGraph/08_TDD_LangGraph_인간LLM협업형IoT온톨로지플랫폼_v1.0.md) |
