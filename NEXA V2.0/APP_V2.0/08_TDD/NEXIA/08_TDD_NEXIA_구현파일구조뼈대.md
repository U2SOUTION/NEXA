---
implements_doc: 
see_also: []
doc_id: TDD-055
title: "NEXIA · 구현 파일 구조 뼈대"
category: "08_TDD"
domain: NEXIA
status: draft
created: 2026-06-12
updated: 2026-06-13
parent_doc: TDD-010
terms_standard: ["next-js", "nestjs", "zustand", "yjs", "langgraph", "zod"]
terms_nexa: ["nexia", "domainKey", "tabId", "domainLayoutRegistry", "Omnix", "Normex", "Logex", "NexaonShell", "NEXA-CELL"]
tags: ["doc/cat/08-tdd", "doc/domain/nexia", "std/next-js", "std/nestjs", "std/zustand", "std/yjs", "std/langgraph", "std/zod", "nexa/nexia", "nexa/domainKey", "nexa/tabId", "nexa/domainLayoutRegistry", "nexa/Omnix", "nexa/Normex", "nexa/Logex", "nexa/NexaonShell", "nexa/NEXA-CELL"]
---

# NEXIA · 구현 파일 구조 뼈대 (TDD)

> **역할:** `domainKey` 별 **To-Be 코드·백엔드·계약** 파일 트리 SSOT 뼈대. 상세 동작은 하위 TDD·PRD 에 위임.
> **선행:** [`TDD-071` 도메인 구조 통합](../NEXAOS/08_TDD_NEXAOS_도메인구조통합_v1.0.md) §8 · [`TDD-007` 모노레포](../NEXAOS/08_TDD_NEXAOS_모노레포폴더구조_v1.0.md)
> **UI 대응:** [`UIX-008` 컴포넌트 트리](../../07_UIUX/07_UIUX_NEXIA_컴포넌트트리뼈대.md)

---

## 0. 도메인 공통 템플릿 (16 키 · 참고)

모든 `domainKey` 는 아래 골격을 따른다. **nexia**는 §1 에 상세 기입 · 나머지 도메인은 동일 패턴으로 `08_TDD_{DOMAIN}_구현파일구조뼈대.md` 를 순차 작성한다.

| 레이어 | 경로 패턴 | 비고 |
| :--- | :--- | :--- |
| **App Router** | `apps/web/src/app/(shell)/{domainKey}/` | `subRoute`·`tabId` 는 도메인별 확장 |
| **도메인 UI** | `apps/web/src/domains/{folder}/` | `folder` = `domainKey` 권장 |
| **레지스트리** | `apps/web/src/frame/registry/domainLayoutRegistry.ts` | lazy import · `drawerDefaults` |
| **엔진** | `apps/web/src/engines/` | UI 금지 · domains → engines 단방향 |
| **계약** | `packages/shared/src/schemas/` | Zod · `@nexa/shared` |
| **백엔드** | `apps/backend/src/modules/` | Nest · agent-graph 프록시 |
| **협업** | `apps/sync/` | Hocuspocus · Nest WS **금지** |
| **연산** | `apps/agent-graph/` | LLM·SSE·Embed **단일** (nexia·Ontex) |

**범례 (§1 트리)**

| 기호 | 의미 |
| :--- | :--- |
| **■** | MVP 필수 — 레지스트리·라우트 동작 최소셋 |
| **◇** | Phase 2 — 스텁·placeholder 허용 |
| **○** | 후속 TDD 확정 후 추가 |

---

## 1. nexia — 메타

| 항목 | 값 |
| :--- | :--- |
| **domainKey** | **nexia** |
| **폴더** | `apps/web/src/domains/nexia/` |
| **라우트** | `/nexia` · `/nexia/[tabId]` · `/nexia/logex/ontology/...` |
| **드로어** | L `rec` · R `rec` |
| **themePreset** | `office-light` |
| **백엔드** | `nexaon/` · `agent-graph/`(프록시) · `esphome/`(Twinex) |
| **특이** | 7 탭 `tabId` · Logex → `modules/nexaon/` · statusBar·statusPanel **있음** |

---

## 2. App Router

```text
apps/web/src/app/(shell)/
└── nexia/
    ├── layout.tsx                    ■ NexiaProvider · tab store hydrate
    ├── page.tsx                      ■ redirect → default tab (omnix)
    ├── [tabId]/
    │   └── page.tsx                  ■ NexiaContent 마운트
    └── logex/
        └── ontology/
            ├── page.tsx              ■ Nexaon 서브모드 진입
            └── [projectId]/
                └── page.tsx          ○ 프로젝트 스코프 URL
```

---

## 3. `domains/nexia/` — 프론트 트리

```text
apps/web/src/domains/nexia/
├── config/
│   └── nexiaTabs.ts                  ■ tabId SSOT · label · route · icon · engineId
├── types/
│   ├── tabId.ts                      ■ Omnix | Normex | Logex | …
│   ├── nexiaContext.ts               ■ Left/Right에 전달하는 tab 컨텍스트
│   └── logexSubMode.ts               ■ default | ontology
├── components/
│   ├── NexiaHeaderActions.tsx        ■ registry.headerActions
│   ├── NexiaTabBar.tsx               ■ Content 상단 7탭 스트립
│   └── NexiaProviders.tsx            ■ Yjs room · SSE context (선택 래퍼)
├── views/
│   ├── left/
│   │   └── NexiaLeftNav.tsx          ■ tabId → 서브 패널 스위치
│   ├── content/
│   │   └── NexiaContent.tsx          ■ TabBar + tabs/* 라우터
│   ├── right/
│   │   └── NexiaRightPanel.tsx       ■ tabId → 서브 패널 스위치
│   └── status/
│       ├── NexiaStatusBar.tsx        ■ registry.statusBar (~30px)
│       └── NexiaStatusPanel.tsx      ■ registry.statusPanel (expanded)
├── tabs/                             # 탭별 Content 본문 (얇은 셸)
│   ├── omnix/
│   │   ├── OmnixTab.tsx              ■
│   │   ├── components/               ○ ChatThread · RequestQueue
│   │   ├── hooks/                    ○ useOmnixStream
│   │   └── store/                    ○ useOmnixStore.ts
│   ├── normex/
│   │   ├── NormexTab.tsx             ■
│   │   ├── components/               ○ NormexEditorHost (Tiptap)
│   │   └── hooks/                    ○ useNormexYjs
│   ├── logex/
│   │   ├── LogexTab.tsx              ■ 서브모드 스위치
│   │   ├── NexaonEntry.tsx           ■ ontology → NexaonShell
│   │   ├── LogexFlowTab.tsx          ○ React Flow 일반 모드
│   │   └── store/                    ○ useLogexStore.ts
│   ├── scribx/
│   │   ├── ScribxTab.tsx             ■
│   │   └── components/               ○ MonacoHost
│   ├── vivex/
│   │   ├── VivexTab.tsx              ■
│   │   └── components/               ○ MediaStage · TranscribeBar
│   ├── twinex/
│   │   ├── TwinexTab.tsx             ■ NEXA-CELL 허브
│   │   ├── components/               ○ CellList · YamlPreview
│   │   └── services/                 ○ esphomeClient.ts
│   └── navex/
│       ├── NavexTab.tsx              ■
│       └── components/               ○ InfraMap · DeployQueue
├── modules/
│   └── nexaon/                       # Logex·ontology 전용 (Nexaon)
│       ├── NexaonShell.tsx           ■ 3분할 작업면
│       ├── index.ts                  ■ public export
│       ├── views/
│       │   ├── NexaonToolbar.tsx     ■
│       │   ├── GraphCanvas.tsx       ■ React Flow host
│       │   ├── SpecsPreview.tsx      ○ TipTap preview
│       │   ├── RunPanel.tsx          ■ SSE 타임라인
│       │   ├── DiffOverlay.tsx       ○ AI diff · SHACL highlight
│       │   └── EsphomeDeploy.tsx     ○ Deploy 탭 본문
│       ├── panels/
│       │   ├── ExplorerTree.tsx      ■ Left (ontology)
│       │   ├── PropertiesPanel.tsx   ■ Right Props
│       │   ├── RunChatPanel.tsx      ■ Right Chat
│       │   ├── ApprovalGatePanel.tsx ○ 승인 A/B/C
│       │   └── ShaclViolationsPanel.tsx ○
│       ├── hooks/
│       │   ├── useNexaonYjs.ts       ■
│       │   ├── useNexaonRun.ts       ■ SSE · run_id
│       │   ├── useNexaonGraph.ts     ■ RF ↔ Yjs
│       │   └── useNexaonWikilink.ts  ○
│       ├── services/
│       │   └── nexaonRunClient.ts    ■ POST runs · stream URL
│       └── store/
│           └── useNexaonStore.ts     ■ graph · run · layout
├── hooks/
│   ├── useNexiaTab.ts                ■ tabId ↔ URL sync
│   └── useNexiaContext.ts            ■ Left/Right 공통 tabId
├── services/
│   ├── nexiaApi.ts                   ■ 도메인 REST 진입
│   └── filesApi.ts                   ○ 첨부 · 드롭존 (TDD-013)
└── store/
    ├── useNexiaTabStore.ts           ■ activeTabId · logexSubMode
    └── useNexiaSessionStore.ts       ○ projectId · roomId
```

---

## 4. `engines/` — nexia 연동 (횡단)

```text
apps/web/src/engines/
├── react-flow/
│   ├── nodeTypes/                    ■ nexaon class · asset · pin · sensor
│   ├── edgeTypes/                    ○ why-chain · late-anchor
│   └── layout/dagreLayout.ts         ■
├── tiptap/                           ■ Normex · SpecsPreview
├── monaco/                           ■ Scribx
├── hocuspocus/
│   └── useOntologyRoom.ts            ■ ontology:draft
├── langgraph/                        ○ Logex RunPanel · agent-graph 클라이언트
└── api-client.ts                     ■ 공통 fetch · SSE helper
```

> **금지:** `engines/*` → `domains/nexia/*` 역방향 import.

---

## 5. `frame/registry` — nexia 등록

```ts
// domainLayoutRegistry.ts — nexia (뼈대)
nexia: {
  left: () => import('@/domains/nexia/views/left/NexiaLeftNav'),
  content: () => import('@/domains/nexia/views/content/NexiaContent'),
  right: () => import('@/domains/nexia/views/right/NexiaRightPanel'),
  headerActions: () => import('@/domains/nexia/components/NexiaHeaderActions'),
  statusBar: () => import('@/domains/nexia/views/status/NexiaStatusBar'),
  statusPanel: () => import('@/domains/nexia/views/status/NexiaStatusPanel'),
  themePreset: 'office-light',
  drawerDefaults: {
    left:  { openPolicy: 'recommended', defaultOpen: true },
    right: { openPolicy: 'recommended', defaultOpen: true },
  },
},
```

---

## 6. `packages/shared` — 계약 (nexia·Nexaon)

```text
packages/shared/src/
├── schemas/
│   ├── nexia/
│   │   ├── tab-id.schema.ts          ■
│   │   └── session.schema.ts         ○
│   ├── nexaon/                       # 기존 TDD-007 SSOT
│   │   ├── ontology-node.schema.ts
│   │   ├── draft-snapshot.schema.ts
│   │   ├── approval-gate.schema.ts
│   │   └── shacl-event.schema.ts
│   └── agent-graph/
│       ├── run-request.schema.ts
│       ├── run-response.schema.ts
│       └── sse-event.schema.ts
├── yjs/
│   ├── map-keys.ts
│   └── nexaon.keys.ts                ■ ontology:draft · run:timeline
└── commands/
    └── nexaon-approval.command.ts
```

---

## 7. `apps/backend` — 모듈 매핑

```text
apps/backend/src/modules/
├── agent-graph/                      ■ runs.controller · SSE relay · embed proxy
│   ├── agent-graph.client.ts
│   └── runs.controller.ts            # POST /nexaon/runs · GET …/stream
├── nexaon/                           ■ Yjs debounce · Draft · Audit
│   ├── nexaon.module.ts
│   ├── draft.service.ts
│   └── approval.service.ts
├── ontology/                         ○ Neo4j · SHACL (후속)
├── esphome/                          ○ Twinex · NEXA-CELL OTA
└── auth/                             ■ JWT · sync onAuthenticate
```

| HTTP (예) | 모듈 | 프론트 소비자 |
| :--- | :--- | :--- |
| `POST /nexaon/runs` | agent-graph | `useNexaonRun` |
| `GET /nexaon/runs/:id/stream` | agent-graph | `RunPanel` SSE |
| `POST /v1/embed` | agent-graph | 검색·RAG (후속) |
| `GET/PUT /nexaon/drafts/:id` | nexaon | Yjs persist |
| `POST /esphome/*` | esphome | `TwinexTab` |

---

## 8. `apps/sync` · `apps/agent-graph`

```text
apps/sync/
└── src/rooms/
    └── ontologyDraftRoom.ts          ■ Hocuspocus · ontology:draft

apps/agent-graph/
└── src/agent_graph/
    ├── graphs/                       ■ LangGraph StateGraph SSOT
    │   └── nexaon_ingest.py          # 예: 기본 ingest 그래프
    └── api/
        ├── runs.py                   ■
        └── embed.py                  ○
```

---

## 9. 구현 체크리스트 (nexia MVP)

| # | 항목 | 파일·모듈 | 상태 |
| :-: | :--- | :--- | :---: |
| 1 | registry 6 슬롯 + drawerDefaults | `domainLayoutRegistry.nexia` | [ ] |
| 2 | App Router `/nexia/[tabId]` | `app/(shell)/nexia/` | [ ] |
| 3 | 7 탭 SSOT | `config/nexiaTabs.ts` | [ ] |
| 4 | Content 라우터 | `NexiaContent.tsx` + `tabs/*` | [ ] |
| 5 | L/R tabId 스위치 | `NexiaLeftNav` · `NexiaRightPanel` | [ ] |
| 6 | Nexaon 진입 | `LogexTab` → `NexaonEntry` → `NexaonShell` | [ ] |
| 7 | Yjs room | `useNexaonYjs` + `apps/sync` | [ ] |
| 8 | Run SSE | `useNexaonRun` + Nest relay | [ ] |
| 9 | statusBar·Panel | `NexiaStatusBar` · `NexiaStatusPanel` | [ ] |
| 10 | shared Zod | `packages/shared` nexaon·agent-graph | [ ] |

---

## 10. 후속 도메인 문서 (예정)

| domainKey | TDD 뼈대 문서 | 우선순위 |
| :--- | :--- | :--- |
| Ontex | `08_TDD_ONTEX_구현파일구조뼈대.md` | P1 |
| erp | `08_TDD_ERP_구현파일구조뼈대.md` | P1 |
| nexet | `08_TDD_NEXET_구현파일구조뼈대.md` | P2 |
| nexabo | `08_TDD_NEXABO_구현파일구조뼈대.md` | P2 |
| … | TDD-071 §7.0 나머지 11 키 | P3 |

---

## 관련 문서

| 관계 | 문서 |
| :--- | :--- |
| 레지스트리 SSOT | [NEXA OS · 도메인 구조 통합 (TDD-071)](../NEXAOS/08_TDD_NEXAOS_도메인구조통합_v1.0.md) |
| 모노레포 | [LangGraph 모노레포 폴더 구조 (TDD-007)](../NEXAOS/08_TDD_NEXAOS_모노레포폴더구조_v1.0.md) |
| NEXIA Normative | [NEXIA 구조 · 기술 스택 운영 방침 (TDD-010)](./08_TDD_NEXIA_구조기술스택운영방침.md) |
| UI 컴포넌트 트리 | [NEXIA · 컴포넌트 트리 뼈대 (UIX-008)](../../07_UIUX/07_UIUX_NEXIA_컴포넌트트리뼈대.md) |
| MainShell 레이아웃 | [NEXIA MainShell · 레이아웃 (UIX-004)](../../07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md) |
| 도메인 맵 | [NEXA OS · 도메인 구조 통합 (TDD-071)](../NEXAOS/08_TDD_NEXAOS_도메인구조통합_v1.0.md) |
