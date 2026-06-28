---
doc_id: 
title: ""
category: ""
domain: 
status: draft
created: 2026-06-10
updated: 2026-06-11
parent_doc: 
implements_doc: 
see_also: []
terms_standard: []
terms_nexa: []
---

# doc_id 레지스트리 (불변 식별자 SSOT)

> **규칙 SSOT:** [개발문서 생태계와 관리 체계.md](./개발문서%20생태계와%20관리%20체계.md) · Frontmatter 스키마
> **갱신일:** 2026-06-22 · **확정 문서 84 건** · `_inbox`·README·메타 문서 제외

<!-- REL_SYNC_SUMMARY_START -->
> **관련 문서 링크 현황** (자동 갱신 `2026-06-11`) — 완료 **77/77** (100%) · **완료** 77
> 재생성: `python scripts/sync_registry_rel_links.py`
<!-- REL_SYNC_SUMMARY_END -->

## 사용 규칙

1. 신규 확정 문서 승격 시 **다음 발급 번호**에서 `doc_id` 를 할당하고 이 표에 한 줄 추가합니다.
2. 파일명·폴더가 바뀌어도 **`doc_id` 는 변경하지 않습니다.**
3. 각 문서 frontmatter 의 `doc_id`·`title`·`domain`·관계·`terms_standard`·`terms_nexa` 는 이 표·[스키마](./개발문서%20생태계와%20관리%20체계.md) 와 **일치**시킵니다. (2026-06-11 기준 **77 건 terms 반영 완료** — 본 표 `terms_*` 열은 각 문서 frontmatter 와 동기화)
4. 관계 (`parent_doc` 등) 는 **doc_id 만** 사용합니다. 그래프 링크는 본문 `## 관련 문서` 경로 링크만.
5. **`관련문서`·`링크·충실도` 열** — `python scripts/sync_registry_rel_links.py` 로 자동 갱신. 수동 편집하지 않습니다.

## 다음 발급 번호

| 접두 | 다음 번호 | 비고 |
| :--- | :-------- | :--- |
| `BRD-` | **003** | |
| `MVP-` | **002** | |
| `PRD-` | **014** | |
| `UIX-` | **010** | UIX-009 발급 (2026-06-22) |
| `TDD-` | **076** | TDD-075 발급 (2026-06-13) |
| `ADM-` | **002** | |
| `LEG-` | **001** | 미사용 |
| `DEC-` | **001** | 미사용 |
| `ANA-` | **001** | 미사용 |
| `QA-` | **001** | 미사용 |
| `UG-` | **001** | 미사용 |

---

## 01_BRD (2)

| doc_id | title | domain | terms_standard | terms_nexa | 관련문서 | 링크·충실도 | 파일 경로 |
| :----- | :----- | :----- | :----- | :----- | :----- | :----- | :----- |
| BRD-001 | NEXA 사업 마스터 플랜 | NEXA | iot, ontology, data-lake, time-series, saas, mqtt | NEXA, NEXIA, Nexaon, Physical-AI-Ops, Twinex, NEXA-CELL, Omnix | 완료 | 4 링크 | [01_BRD/01_BRD_NEXA_사업마스터플랜.md](./01_BRD/01_BRD_NEXA_사업마스터플랜.md) |
| BRD-002 | AI 혁신의 물결 · NEXA 포지셔닝 | NEXA | llm, rag, transformer, agentic-ai, mcp | NEXA, NEXIA, Physical-AI, Transparent-Orchestration | 완료 | 5 링크 | [01_BRD/01_BRD_AI혁신의물결_NEXA포지셔닝.md](./01_BRD/01_BRD_AI혁신의물결_NEXA포지셔닝.md) |

---

## 03_MVP (0 active)

> **MVP-001 archived (2026-06-13)** — [archived doc_id](#archived-doc_id-2026-06-13--ssot-)

---

## 05_PRD (12)

| doc_id | title | domain | parent_doc | terms_standard | terms_nexa | 관련문서 | 링크·충실도 | 파일 경로 |
| :----- | :----- | :----- | :----- | :----- | :----- | :----- | :----- | :----- |
| PRD-001 | NEXIA UI 기능 명세 — MVP Phase UI v1.0 | NEXIA | BRD-001 | react-flow, yjs, sse, shacl, msw, web-serial | nexia, MainShell, NexiaContent, GraphCanvas, ExplorerTree, domainKey, NexaonShell, useLayoutStore, RunPanel | 완료 | 1/1 · 5 링크 | [05_PRD/05_PRD_NEXIA_UI기능명세_MVPPhaseUI_v1.0.md](./05_PRD/05_PRD_NEXIA_UI기능명세_MVPPhaseUI_v1.0.md) |
| PRD-002 | U2BEE 데스크톱 앱 설계 명세 | U2BEE | BRD-001 | pyqt6, postgresql, pgvector, ollama, yjs | U2BEE, QWebEngineView, apps-desktop | 완료 | 1/1 · 3 링크 | [05_PRD/05_PRD_U2BEE_데스크톱앱설계명세.md](./05_PRD/05_PRD_U2BEE_데스크톱앱설계명세.md) |
| PRD-003 | ASK VOID 처리 설계 (RFC) | NEXIA | BRD-001 | rfc | ASK, VOID, VOID-BOX, Omnix, DEFERRED | 완료 | 1/1 · 3 링크 | [05_PRD/NEXIA/05_PRD_NEXIA_ASKVOID처리설계.md](./05_PRD/NEXIA/05_PRD_NEXIA_ASKVOID처리설계.md) |
| PRD-004 | NEXA-CELL · ESPHome YAML 제너레이터 및 웹 펌웨어 | NEXIA | BRD-001 | esphome, react-flow, web-serial, ota, docker | NEXA-CELL, Twinex, Lambda, ESP32 | 완료 | 1/1 · 4 링크 | [05_PRD/NEXIA/05_PRD_NEXIA_CELL_ESPHomeYAML제너레이터웹펌웨어.md](./05_PRD/NEXIA/05_PRD_NEXIA_CELL_ESPHomeYAML제너레이터웹펌웨어.md) |
| PRD-005 | 드롭존 및 첨부 기능 플랜 | NEXIA | BRD-001 | file-upload, multipart, rest, mqtt | FileDropZone, FileBrowserModal, NexiaLeftNav, files, useNexiaAssets | 완료 | 1/1 · 4 링크 | [05_PRD/NEXIA/05_PRD_NEXIA_드롭존첨부기능플랜.md](./05_PRD/NEXIA/05_PRD_NEXIA_드롭존첨부기능플랜.md) |
| PRD-007 | 음성·미디어 파이프라인 (7 탭) | NEXIA | BRD-001 | whisper, stt, sse | Vivex, Scribx, agent-graph, transcribe | 완료 | 1/1 · 4 링크 | [05_PRD/NEXIA/05_PRD_NEXIA_음성미디어파이프라인7탭.md](05_PRD/NEXIA/05_PRD_NEXIA_음성미디어파이프라인.md) |
| PRD-008 | 웹 탐색기 ↔ 문서 폴더 연동 | NEXIA | BRD-001 | rest | GlobalFileExplorer, NexiaExplorerPanel, file_references, nexa-docs | 완료 | 1/1 · 4 링크 | [05_PRD/NEXIA/05_PRD_NEXIA_웹탐색기문서폴더연동.md](./05_PRD/NEXIA/05_PRD_NEXIA_웹탐색기문서폴더연동.md) |
| PRD-009 | 워크스페이스 단축키 및 레이아웃 | NEXIA | BRD-001 | zustand, keyboard-shortcuts | useNexiaSplitLayout, useGlobalShortcuts, Focus-Stack, NexiaSplitLayout, Nexus-Map | 완료 | 1/1 · 4 링크 | [05_PRD/NEXIA/05_PRD_NEXIA_워크스페이스단축키레이아웃.md](./05_PRD/NEXIA/05_PRD_NEXIA_워크스페이스단축키레이아웃.md) |
| PRD-010 | 워크스페이스 웹 서치 자원 전략 | NEXIA | BRD-001 | json, rest | NexiaLeftNav, useNexiaUnifiedSearch, Project, Web-Resources | 완료 | 1/1 · 3 링크 | [05_PRD/NEXIA/05_PRD_NEXIA_워크스페이스웹서치자원전략.md](./05_PRD/NEXIA/05_PRD_NEXIA_워크스페이스웹서치자원전략.md) |
| PRD-011 | 지식 그래프 및 관계 추론 (Nexus Graph) | NEXIA | BRD-001 | knowledge-graph, rag | Nexus-Graph, Nexus-Map, node, edge | 완료 | 1/1 · 3 링크 | [05_PRD/NEXIA/05_PRD_NEXIA_지식그래프NexusGraph.md](./05_PRD/NEXIA/05_PRD_NEXIA_지식그래프NexusGraph.md) |
| PRD-012 | 탐색기 ↔ 미디어 탭 동기화 | NEXIA | BRD-001 | rest | useNexiaAssets, useGlobalFileExplorer, file_references, NexiaLeftNav | 완료 | 1/1 · 4 링크 | [05_PRD/NEXIA/05_PRD_NEXIA_탐색기미디어탭동기화.md](./05_PRD/NEXIA/05_PRD_NEXIA_탐색기미디어탭동기화.md) |
| PRD-013 | files.source_metadata 추출 기획 | NEXIA | BRD-001 | ollama, zod, pgvector, ann, json-mode | source_metadata, agent-graph, file_embeddings, files | 완료 | 1/1 · 4 링크 | [05_PRD/NEXIA/05_PRD_NEXIA_파일메타데이터AI추출.md](./05_PRD/NEXIA/05_PRD_NEXIA_파일메타데이터AI추출.md) |
| PRD-014 | Navex · 이중 탐색 모드 · 지능형 탐색 v1.0 | NEXIA | BRD-001 | knowledge-graph, rag, pgvector, ann | Navex, Intelligent-Explorer, Infra-Explorer, Navex-Search-Engine, Personalization-Profile, Relational-File-View, Global-Asset-Index, file_embeddings | 완료 | 1/1 · 8 링크 | [05_PRD/NEXIA/05_PRD_NEXIA_Navex이중탐색모드지능형탐색_v1.0.md](./05_PRD/NEXIA/05_PRD_NEXIA_Navex이중탐색모드지능형탐색_v1.0.md) |

---

## 07_UIUX (8)

| doc_id | title | domain | implements_doc | terms_standard | terms_nexa | 관련문서 | 링크·충실도 | 파일 경로 |
| :----- | :----- | :----- | :----- | :----- | :----- | :----- | :----- | :----- |
| UIX-001 | Tiptap 엔진 도메인 옵션 | NEXIA | PRD-001 | tiptap, yjs | TiptapEditor, toolbarOrder, uploadHandler, engines-tiptap | 완료 | 1/1 · 2 링크 | [07_UIUX/07_UIUX_NEXIA_Tiptap엔진도메인옵션.md](./07_UIUX/07_UIUX_NEXIA_Tiptap엔진도메인옵션.md) |
| UIX-002 | 탐색기 UI 전략 | NEXIA | PRD-008 | next-js, rest | GlobalFileExplorer, NexiaExplorerPanel, useGlobalFileExplorer, explorer | 완료 | 1/1 · 3 링크 | [07_UIUX/07_UIUX_NEXIA_탐색기UI전략.md](./07_UIUX/07_UIUX_NEXIA_탐색기UI전략.md) |
| UIX-003 | BAX 미학적 인터페이스 UX 아키텍처 v1.0 | NEXIA | BRD-001 | zod, css-grid, next-js, sse, websocket | BAX, VirtualCanvas, Harness, ComponentManifest, clusterKey, LayoutProfile, MAE, RuleGuard, M2P, LayoutPolicy | 미완 | 0/1 | [07_UIUX/07_UIUX_BAX_미학적인터페이스UX아키텍처_v1.0.md](./07_UIUX/07_UIUX_BAX_미학적인터페이스UX아키텍처_v1.0.md) |
| UIX-004 | NEXIA MainShell · 레이아웃 v1.0 | NEXIA | PRD-001 | next-js, react, zustand, tailwind-css | nexia, MainShell, domainLayoutRegistry, useLayoutStore, SystemStatusBar, NexiaContent, NexaonShell, drawerDefaults, tabId | 완료 | 1/1 · 5 링크 | [07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md](./07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md) |
| UIX-005 | NEXIA v0 UI 프롬프트셋 v1.0 | NEXIA | PRD-001 | next-js, shadcn-ui, react-flow | nexia, v0, UI-L0, nexia-shell, nexaon-graph-workspace, NexaonShell | 완료 | 1/1 · 3 링크 | [07_UIUX/07_UIUX_NEXIA_v0UI프롬프트셋_v1.0.md](./07_UIUX/07_UIUX_NEXIA_v0UI프롬프트셋_v1.0.md) |
| UIX-006 | NEXA 통합 레이아웃 구조 규격 | NEXA | UIX-004 | zustand, next-js, app-router | MainShell, domainLayoutRegistry, useLayoutStore, SystemStatusBar, domainKey, AppHeader, Left-Drawer, Right-Drawer, drawerDefaults | **archived** | 1/1 · 4 링크 | [07_UIUX/07_UIUX_NEXA_통합레이아웃구조규격.md](./07_UIUX/07_UIUX_NEXA_통합레이아웃구조규격.md) |
| UIX-007 | 그리드 알고리즘 · 동적 타이포그래피 UI | NEXIA | UIX-003 | css-grid, typography | MAE, BAX, VirtualCanvas, DynamicGrid | 완료 | 1/1 · 2 링크 | [07_UIUX/07_UIUX_그리드알고리즘_동적타이포그래피UI.md](./07_UIUX/07_UIUX_그리드알고리즘_동적타이포그래피UI.md) |
| UIX-008 | NEXIA · 컴포넌트 트리 뼈대 | NEXIA | PRD-001 | react, next-js, zustand, tailwind-css, react-flow | MainShell, NexiaContent, NexiaTabBar, tabId, NexaonShell, GraphCanvas, ExplorerTree, drawerDefaults | 미완 | 0/1 | [07_UIUX/07_UIUX_NEXIA_컴포넌트트리뼈대.md](./07_UIUX/07_UIUX_NEXIA_컴포넌트트리뼈대.md) |

---

## 08_TDD — NEXAOS (10)

| doc_id | title | domain | parent_doc | terms_standard | terms_nexa | 관련문서 | 링크·충실도 | 파일 경로 |
| :----- | :----- | :----- | :----- | :----- | :----- | :----- | :----- | :----- |
| TDD-001 | NEXA OS 설계 표준 · 미션 크리티컬 전략 | NEXAOS | BRD-001 | next-js, nestjs, yjs, hocuspocus, zod, crdt, sse, websocket, zustand, tailwind-css | NEXAOS, domainLayoutRegistry, useLayoutStore, useYjsSync, apps-sync, M.O.S.E.S., Rivet | 완료 | 1/1 · 4 링크 | [08_TDD/NEXAOS/08_TDD_NEXAOS_설계표준_미션크리티컬전략.md](./08_TDD/NEXAOS/08_TDD_NEXAOS_설계표준_미션크리티컬전략.md) |
| TDD-071 | NEXA OS · 도메인 구조 통합 v1.0 | NEXAOS | TDD-001 | react, typescript, zustand, mermaid, langgraph, yjs | domainKey, domainLayoutRegistry, nexia, MainShell, drawerDefaults, tabId, themePreset, useLayoutStore, Ontex, erp, nexabo, nexet, subRoute, Nexion | 완료 | 1/1 · 6 링크 | [08_TDD/NEXAOS/08_TDD_NEXAOS_도메인구조통합_v1.0.md](./08_TDD/NEXAOS/08_TDD_NEXAOS_도메인구조통합_v1.0.md) |
| TDD-075 | NEXA OS · 전역 아키텍처 표준 (Global Architecture) v1.0 | NEXAOS | TDD-001 | — | Axon, Cosmic, Menton, Nexaon, Ontex, Kineton, Galthon, Why-Chain, Core-Engine-Stack, Hub-and-Spoke | 미완 | 0/1 | [08_TDD/NEXAOS/08_TDD_NEXAOS_전역아키텍처표준_GlobalArchitectureStandard_v1.0.md](./08_TDD/NEXAOS/08_TDD_NEXAOS_전역아키텍처표준_GlobalArchitectureStandard_v1.0.md) |
| TDD-060 | NEXA V2.0 용어집 (v1.0 분리 안내) | NEXAOS | TDD-001 | — | glossary | — | — | [용어집_v1.0.md](./용어집_v1.0.md) |
| TDD-069 | NEXA V2.0 범용 용어집 | NEXAOS | TDD-001 | — | glossary, terms_standard | — | — | [용어집_범용_v2.0.md](./용어집_범용_v2.0.md) |
| TDD-070 | NEXA V2.0 전용 용어집 | NEXAOS | TDD-001 | — | glossary, terms_nexa, domainKey, tabId | — | — | [용어집_NEXA전용_v2.0.md](./용어집_NEXA전용_v2.0.md) |
| TDD-003 | NEXA OS 플랫폼 기술 스택 | NEXAOS | TDD-001 | next-js, yjs, react-flow, tiptap, monaco, nestjs, pgvector, neo4j, vllm, langgraph | agent-graph, packages-shared, embedder, GraphCanvas | 완료 | 1/1 · 3 링크 | [08_TDD/NEXAOS/08_TDD_NEXAOS_플랫폼기술스택.md](./08_TDD/NEXAOS/08_TDD_NEXAOS_플랫폼기술스택.md) |
| TDD-004 | NEXA OS · 수직 계층 보안 아키텍처 | NEXAOS | TDD-001 | zod, rbac, mqtt | Grade, Ingress, edge-queue, commands, U2BEE | 완료 | 1/1 · 3 링크 | [08_TDD/NEXAOS/08_TDD_NEXAOS_수직계층보안아키텍처.md](./08_TDD/NEXAOS/08_TDD_NEXAOS_수직계층보안아키텍처.md) |
| TDD-005 | 4 대 핵심 · 체크리스트 상세 (아카이브) | NEXAOS | TDD-001 | yjs, hocuspocus, zod, nestjs | NEXAOS, apps-sync, packages-shared, mission-critical | 완료 | 1/1 · 2 링크 | [08_TDD/NEXAOS/08_TDD_NEXAOS_4대핵심_체크리스트상세.md](./08_TDD/NEXAOS/08_TDD_NEXAOS_4대핵심_체크리스트상세.md) |
| TDD-006 | 하드웨어 프로파일러 · 동적 성능 엔진 | NEXAOS | TDD-001 | webgl, performance-api | NEXA-SYNC, Coil-Balance, Hardware-Profiler, NIXIE | 완료 | 1/1 · 3 링크 | [08_TDD/NEXAOS/08_TDD_NEXAOS_하드웨어프로파일러동적성능엔진.md](./08_TDD/NEXAOS/08_TDD_NEXAOS_하드웨어프로파일러동적성능엔진.md) |

## 08_TDD — LangGraph (4)

| doc_id | title | domain | parent_doc | terms_standard | terms_nexa | 관련문서 | 링크·충실도 | 파일 경로 |
| :----- | :----- | :----- | :----- | :----- | :----- | :----- | :----- | :----- |
| TDD-007 | NEXA-Platform 모노레포 폴더 구조 v1.0 | NEXAOS | TDD-001 | langgraph, react-flow, yjs, hocuspocus, nestjs, next-js, zod, neo4j, fastapi, sse, shacl, esphome | nexia, agent-graph, NexaonShell, GraphCanvas, ExplorerTree, packages-shared, approval-gate, ontology-draft, tabonto | 완료 | 1/1 · 4 링크 | [08_TDD/NEXAOS/08_TDD_NEXAOS_모노레포폴더구조_v1.0.md](./08_TDD/NEXAOS/08_TDD_NEXAOS_모노레포폴더구조_v1.0.md) |
| TDD-008 | LangGraph · 인간 -LLM 협업형 IoT 온톨로지 플랫폼 | LangGraph | BRD-001 | langgraph, react-flow, yjs, hocuspocus, neo4j, shacl, esphome, sse | nexia, agent-graph, ontology-draft, approval-gate, GraphCanvas | 완료 | 1/1 · 4 링크 | [08_TDD/LangGraph/08_TDD_LangGraph_인간LLM협업형IoT온톨로지플랫폼_v1.0.md](./08_TDD/LangGraph/08_TDD_LangGraph_인간LLM협업형IoT온톨로지플랫폼_v1.0.md) |
| TDD-009 | IoT·온톨로지·AI 협력 플랫폼 핵심 기술 스택 | LangGraph | TDD-008 | langgraph, neo4j, sparql, cypher, graphql, grpc, ros-2, mqtt | nexia, Ontex, ontology, digital-twin | 완료 | 1/1 · 3 링크 | [08_TDD/LangGraph/08_TDD_IoT온톨로지AI협력플랫폼_핵심기술스택_v1.0.md](./08_TDD/LangGraph/08_TDD_IoT온톨로지AI협력플랫폼_핵심기술스택_v1.0.md) |
| TDD-058 | LangGraph · 오케스트레이션 설계 v1.0 | LangGraph | TDD-008 | langgraph, sse, fastapi, zod, state-graph | agent-graph, graph_id, run_id, Omnix, tabId, domainKey, orchestration, mint_surface | 완료 | 1/1 · 6 링크 | [08_TDD/LangGraph/08_TDD_LangGraph_오케스트레이션설계_v1.0.md](./08_TDD/LangGraph/08_TDD_LangGraph_오케스트레이션설계_v1.0.md) |

## 08_TDD — NEXIA (16)

| doc_id | title | domain | parent_doc | implements_doc | terms_standard | terms_nexa | 관련문서 | 링크·충실도 | 파일 경로 |
| :----- | :----- | :----- | :----- | :----- | :----- | :----- | :----- | :----- | :----- |
| TDD-010 | NEXIA 구조 · 기술 스택 운영 방침 | NEXIA | BRD-001 | — | next-js, yjs, hocuspocus, langgraph, ollama, esphome, comfyui | Omnix, Normex, Logex, Scribx, Vivex, Twinex, Navex, tabId, NEXA-CELL, Nexion | 완료 | 1/1 · 4 링크 | [08_TDD/NEXIA/08_TDD_NEXIA_구조기술스택운영방침.md](./08_TDD/NEXIA/08_TDD_NEXIA_구조기술스택운영방침.md) |
| TDD-011 | 데이터 분산 처리 · 하이브리드 전략 | NEXIA | TDD-010 | — | webgpu, mqtt, ollama, docker | BROWSER_EDGE, LOCAL_ONPREM, CLOUD_DEFAULT, ai_execution_mode | 완료 | 1/1 · 3 링크 | [08_TDD/NEXIA/08_TDD_NEXIA_데이터분산처리하이브리드전략.md](./08_TDD/NEXIA/08_TDD_NEXIA_데이터분산처리하이브리드전략.md) |
| TDD-012 | 데이터 생애주기 · 형상 관리 | NEXIA | TDD-010 | — | git, postgresql | Rivet, Logex, versioning, lifecycle | 완료 | 1/1 · 3 링크 | [08_TDD/NEXIA/08_TDD_NEXIA_데이터생애주기및형상관리.md](./08_TDD/NEXIA/08_TDD_NEXIA_데이터생애주기및형상관리.md) |
| TDD-013 | 드롭존 · 첨부 파일 구조 | NEXIA | TDD-010 | PRD-005 | file-upload, multipart, rest | NEXIA, FileDropZone, NexiaLeftNav, files | 완료 | 2/2 · 3 링크 | [08_TDD/NEXIA/08_TDD_NEXIA_드롭존첨부파일구조.md](./08_TDD/NEXIA/08_TDD_NEXIA_드롭존첨부파일구조.md) |
| TDD-014 | 멀티윈도우 · Document PiP | NEXIA | UIX-004 | — | document-pip, broadcast-channel, yjs | Multi-Window, PiP, Sync-Bus, panelId | 완료 | 1/1 · 3 링크 | [08_TDD/NEXIA/08_TDD_NEXIA_멀티윈도우DocumentPiP.md](./08_TDD/NEXIA/08_TDD_NEXIA_멀티윈도우DocumentPiP.md) |
| TDD-016 | 보안 및 권한 관리 체계 | NEXIA | TDD-010 | — | rbac, zod, jwt | Grade, Normex, Omnix, audit-log, edge-queue | 완료 | 1/1 · 3 링크 | [08_TDD/NEXIA/08_TDD_NEXIA_보안및권한관리체계.md](./08_TDD/NEXIA/08_TDD_NEXIA_보안및권한관리체계.md) |
| TDD-017 | 에코시스템 및 협업 규칙 | NEXIA | TDD-010 | — | yjs, langgraph | Omnix, Twinex, Normex, ecosystem | 완료 | 1/1 · 3 링크 | [08_TDD/NEXIA/08_TDD_NEXIA_에코시스템및협업규칙.md](./08_TDD/NEXIA/08_TDD_NEXIA_에코시스템및협업규칙.md) |
| TDD-018 | 예외 상황 처리 | NEXIA | TDD-010 | — | sse | Omnix, ASK, VOID, exception-handler | 완료 | 1/1 · 3 링크 | [08_TDD/NEXIA/08_TDD_NEXIA_예외상황처리.md](./08_TDD/NEXIA/08_TDD_NEXIA_예외상황처리.md) |
| TDD-019 | 외부 엔진 및 아키텍처 | NEXIA | TDD-010 | — | ollama, comfyui, esphome, langgraph, react-flow, webassembly | Logex, Scribx, Vivex, Twinex, Generators, agent-graph | 완료 | 1/1 · 3 링크 | [08_TDD/NEXIA/08_TDD_NEXIA_외부엔진및아키텍처.md](./08_TDD/NEXIA/08_TDD_NEXIA_외부엔진및아키텍처.md) |
| TDD-020 | 음성 인풋 · 브라우저 레이어 | NEXIA | TDD-010 | PRD-007 | whisper, webrtc, vad | Vivex, Scribx, transcribe, Cockpit | 완료 | 2/2 · 3 링크 | [08_TDD/NEXIA/08_TDD_NEXIA_음성인풋브라우저레이어.md](./08_TDD/NEXIA/08_TDD_NEXIA_음성인풋브라우저레이어.md) |
| TDD-021 | 음성 인풋 자동화 및 확장 | NEXIA | TDD-010 | PRD-007 | whisper, tts, sse | Vivex, STT, TTS, agent-graph | 완료 | 2/2 · 3 링크 | [08_TDD/NEXIA/08_TDD_NEXIA_음성인풋자동화및확장.md](./08_TDD/NEXIA/08_TDD_NEXIA_음성인풋자동화및확장.md) |
| TDD-022 | MQTT 토픽 · 데이터 라우팅 | NEXIA | TDD-009 | — | mqtt, websocket, socket-io | MQTT-Broker, agent-graph, NEXA-CELL, edge-device | 완료 | 1/1 · 3 링크 | [08_TDD/NEXIA/08_TDD_NEXIA_MQTT토픽데이터라우팅.md](./08_TDD/NEXIA/08_TDD_NEXIA_MQTT토픽데이터라우팅.md) |
| TDD-023 | NEXNAP 시스템 인터페이스 표준 규약 | NEXIA | TDD-010 | — | mqtt, protobuf | NEXNAP, ACTON, AXON, CSIM, Envelope | 완료 | 1/1 · 3 링크 | [08_TDD/NEXIA/08_TDD_NEXIA_NEXNAP시스템인터페이스표준규약.md](./08_TDD/NEXIA/08_TDD_NEXIA_NEXNAP시스템인터페이스표준규약.md) |
| TDD-055 | NEXIA · 구현 파일 구조 뼈대 | NEXIA | TDD-010 | — | next-js, nestjs, zustand, yjs, langgraph, zod | nexia, domainKey, tabId, domainLayoutRegistry, Omnix, Normex, Logex, NexaonShell, NEXA-CELL | 미완 | 0/1 | [08_TDD/NEXIA/08_TDD_NEXIA_구현파일구조뼈대.md](./08_TDD/NEXIA/08_TDD_NEXIA_구현파일구조뼈대.md) |
| TDD-056 | NEXIA · 7 탭 범위 확정 v1.0 | NEXIA | TDD-010 | PRD-001 | react-flow, yjs, tiptap, monaco, langgraph, sse | nexia, tabId, Omnix, Normex, Logex, Scribx, Vivex, Twinex, Navex, NexaonShell, ontology, Ontex | 완료 | 2/2 · 6 링크 | [08_TDD/NEXIA/08_TDD_NEXIA_7탭범위확정_v1.0.md](./08_TDD/NEXIA/08_TDD_NEXIA_7탭범위확정_v1.0.md) |
| TDD-067 | 에이전틱 AI 파이프라인 · 7탭 · 플랫폼·Yjs 연계 v1.0 | NEXIA | TDD-056 | — | langgraph, rag, mcp, agentic-ai, yjs, crdt, hocuspocus, mqtt | nexia, Ontex, Omnix, Nexaon, Navex, Nixie, agent-graph, apps-sync, tabId, Graph-RAG | 미완 | 0/1 | [08_TDD/NEXIA/08_TDD_NEXIA_에이전틱AI파이프라인_7탭플랫폼연계_v1.0.md](./08_TDD/NEXIA/08_TDD_NEXIA_에이전틱AI파이프라인_7탭플랫폼연계_v1.0.md) |
| TDD-068 | IoT 엣지 데이터 파이프라인 · HEXAGON · Nexaon 연계 v1.0 | NEXIA | TDD-022 | — | mqtt, esphome, protobuf, shacl, langgraph | HEXAGON, NEXNAP, Envelope, ACTON, NEXA-CELL, Twinex, Nexaon, EventRouter, Nixie | 미완 | 0/1 | [08_TDD/NEXIA/08_TDD_NEXIA_IoT엣지데이터파이프라인_HEXAGON_Nexaon연계_v1.0.md](./08_TDD/NEXIA/08_TDD_NEXIA_IoT엣지데이터파이프라인_HEXAGON_Nexaon연계_v1.0.md) |
| TDD-072 | Kineton · Physical Bridge · ACTON · ROS 2 v1.0 | NEXIA | TDD-043 | — | ros-2, mqtt, pwm, protobuf | Kineton, ACTON, HEXAGON, AXON, Hot-Path, Physical-Tier | 미완 | 0/1 | [08_TDD/NEXIA/Kineton/08_TDD_Kineton_PhysicalBridge_ACTON_ROS2_v1.0.md](./08_TDD/NEXIA/Kineton/08_TDD_Kineton_PhysicalBridge_ACTON_ROS2_v1.0.md) |
| TDD-073 | Nexaon · Distillation 오케스트레이터 v1.0 | NEXIA | TDD-008 | — | langgraph, yjs, react-flow, shacl, sse | Nexaon, NexaonShell, nexia, DIEA, promoted, ML_3 | 미완 | 0/1 | [08_TDD/NEXIA/Nexaon/08_TDD_Nexaon_Distillation오케스트레이터_v1.0.md](./08_TDD/NEXIA/Nexaon/08_TDD_Nexaon_Distillation오케스트레이터_v1.0.md) |
| TDD-057 | Ontex · 기술 스택 운영 방침 v1.0 | Ontex | TDD-071 | — | langgraph, pgvector, neo4j, rdf, json-ld, shacl, react-flow, yjs, zod | Ontex, Nexion, subRoute, Graph-RAG, NEXAVULT, canvas, explore, trace, archive | 완료 | 1/1 · 6 링크 | [08_TDD/Ontex/08_TDD_Ontex_기술스택운영방침_v1.0.md](./08_TDD/Ontex/08_TDD_Ontex_기술스택운영방침_v1.0.md) |

## 08_TDD — NEXIA / Nixie (4)

| doc_id | title | domain | parent_doc | terms_standard | terms_nexa | 관련문서 | 링크·충실도 | 파일 경로 |
| :----- | :----- | :----- | :----- | :----- | :----- | :----- | :----- | :----- |
| TDD-065 | Navex · 탐색 API · Facet 계약 v1.0 | NEXIA | TDD-056 | PRD-008 | rest, zod, typescript | Navex, GlobalFileExplorer, useGlobalFileExplorer, Global-Asset-Index, asset-origin, navexCategory | 완료 | 1/1 · 6 링크 | [08_TDD/NEXIA/08_TDD_NEXIA_Navex탐색APIFacet계약_v1.0.md](./08_TDD/NEXIA/08_TDD_NEXIA_Navex탐색APIFacet계약_v1.0.md) |
| TDD-061 | NIXIE · Web Shell v1.0 | NEXIA | TDD-010 | next-js, document-pip, webrtc, vad, sse, websocket | NIXIE, Nixie, NixieWebShell, PiP, Presence-Shell, Omnix, Envelope | 완료 | 1/1 · 5 링크 | [08_TDD/NEXIA/Nixie/08_TDD_NIXIE_WebShell_v1.0.md](./08_TDD/NEXIA/Nixie/08_TDD_NIXIE_WebShell_v1.0.md) |
| TDD-062 | NIXIE · Desktop Shell v1.0 | NEXIA | TDD-010 | python, websocket, sse, webrtc, vad | NIXIE, Nixie, NixieDesktopShell, M2P, Presence-Shell, Envelope | 완료 | 1/1 · 4 링크 | [08_TDD/NEXIA/Nixie/08_TDD_NIXIE_DesktopShell_v1.0.md](./08_TDD/NEXIA/Nixie/08_TDD_NIXIE_DesktopShell_v1.0.md) |
| TDD-063 | NIXIE · Mobile Shell v1.0 | NEXIA | TDD-010 | websocket, sse, push-notifications, webrtc, vad | NIXIE, Nixie, NixieMobileShell, Presence-Shell, Envelope, Omnix | 완료 | 1/1 · 4 링크 | [08_TDD/NEXIA/Nixie/08_TDD_NIXIE_MobileShell_v1.0.md](./08_TDD/NEXIA/Nixie/08_TDD_NIXIE_MobileShell_v1.0.md) |
| TDD-064 | NIXIE · Physical Shell v1.0 | NEXIA | TDD-010 | esphome, esp32, raspberry-pi, mqtt, websocket, ota | NIXIE, Nixie, NixiePhysicalShell, M2P, NEXA-CELL, Presence-Shell, Zenith-Indicator | 완료 | 1/1 · 5 링크 | [08_TDD/NEXIA/Nixie/08_TDD_NIXIE_PhysicalShell_v1.0.md](./08_TDD/NEXIA/Nixie/08_TDD_NIXIE_PhysicalShell_v1.0.md) |

## 08_TDD — NEXIA / Cells (2)

| doc_id | title | domain | implements_doc | terms_standard | terms_nexa | 관련문서 | 링크·충실도 | 파일 경로 |
| :----- | :----- | :----- | :----- | :----- | :----- | :----- | :----- | :----- |
| TDD-024 | CELL · ESP32 베이스라인 디바이스 등록 | NEXIA | PRD-004 | esphome, ota, esp32, mqtt | NEXA-CELL, Twinex, edge-device, react-flow | 완료 | 1/1 · 3 링크 | [08_TDD/NEXIA/Cells/08_TDD_NEXIA_CELL_ESP32베이스라인디바이스등록.md](./08_TDD/NEXIA/Cells/08_TDD_NEXIA_CELL_ESP32베이스라인디바이스등록.md) |
| TDD-025 | CELL · Lambda 템플릿 · Jetson 연동 API | NEXIA | PRD-004 | esphome, jetson, docker, rest | NEXA-CELL, Lambda, Jetson, Twinex | 완료 | 1/1 · 3 링크 | [08_TDD/NEXIA/Cells/08_TDD_NEXIA_CELL_Lambda템플릿Jetson연동API.md](./08_TDD/NEXIA/Cells/08_TDD_NEXIA_CELL_Lambda템플릿Jetson연동API.md) |

## 08_TDD — NEXIA / Generators (7 · archived)

> **Phase 2+** — MVP 7탭 P0 밖. [Generators/README](./08_TDD/NEXIA/Generators/README.md)

| doc_id | title | domain | parent_doc | status | terms_standard | terms_nexa | 관련문서 | 링크·충실도 | 파일 경로 |
| :----- | :----- | :----- | :----- | :----- | :----- | :----- | :----- | :----- | :----- |
| TDD-026 | AI 3D 제너레이터 | NEXIA | TDD-010 | **archived** | pyodide, webassembly, three-js, monaco, ollama | AI3D, CadQuery, R3F, OCP-wasm | 완료 | 1/1 · 3 링크 | [08_TDD/NEXIA/Generators/08_TDD_NEXIA_AI3D제네레이터.md](./08_TDD/NEXIA/Generators/08_TDD_NEXIA_AI3D제네레이터.md) |
| TDD-027 | AI 3D · Blender 백엔드 연동 | NEXIA | TDD-026 | **archived** | blender, python, docker | AI3D, Blender-backend, STEP, DXF | 완료 | 1/1 · 2 링크 | [08_TDD/NEXIA/Generators/08_TDD_NEXIA_AI3DBlender백엔드연동.md](./08_TDD/NEXIA/Generators/08_TDD_NEXIA_AI3DBlender백엔드연동.md) |
| TDD-028 | AI 협력 제너레이터 파이프라인 | NEXIA | TDD-010 | **archived** | langgraph, comfyui, ollama | Generators, Omnix, agent-graph, Rivet | 완료 | 1/1 · 4 링크 | [08_TDD/NEXIA/Generators/08_TDD_NEXIA_AI협력제네레이터파이프라인.md](./08_TDD/NEXIA/Generators/08_TDD_NEXIA_AI협력제네레이터파이프라인.md) |
| TDD-029 | AI CIRCUIT 제너레이터 | NEXIA | TDD-028 | **archived** | wokwi, monaco, esp32 | AICIRCUIT, SCHEMATIC, SIM, Twinex | 완료 | 1/1 · 2 링크 | [08_TDD/NEXIA/Generators/08_TDD_NEXIA_AICIRCUIT제네레이터.md](./08_TDD/NEXIA/Generators/08_TDD_NEXIA_AICIRCUIT제네레이터.md) |
| TDD-030 | AI SOUND 제너레이터 | NEXIA | TDD-028 | **archived** | pyodide, tone-js, webassembly | AISOUND, SCAMP, Pippi, Vivex | 완료 | 1/1 · 2 링크 | [08_TDD/NEXIA/Generators/08_TDD_NEXIA_AISOUND제네레이터.md](./08_TDD/NEXIA/Generators/08_TDD_NEXIA_AISOUND제네레이터.md) |
| TDD-031 | AI VIDEO 제너레이터 | NEXIA | TDD-028 | **archived** | comfyui, remotion, tiptap | AIVIDEO, Rivet, Vivex, Generators | 완료 | 1/1 · 2 링크 | [08_TDD/NEXIA/Generators/08_TDD_NEXIA_AIVIDEO제네레이터.md](./08_TDD/NEXIA/Generators/08_TDD_NEXIA_AIVIDEO제네레이터.md) |
| TDD-032 | WebAssembly 개요 | NEXIA | TDD-028 | **archived** | webassembly, pyodide | OCP-wasm, Wasm, Generators | 완료 | 1/1 · 2 링크 | [08_TDD/NEXIA/Generators/08_TDD_NEXIA_WebAssembly개요.md](./08_TDD/NEXIA/Generators/08_TDD_NEXIA_WebAssembly개요.md) |

## 08_TDD — AI (11)

| doc_id | title | domain | implements_doc | status | terms_standard | terms_nexa | 관련문서 | 링크·충실도 | 파일 경로 |
| :----- | :----- | :----- | :----- | :----- | :----- | :----- | :----- | :----- | :----- |
| TDD-033 | 5W1H · 6 대 추상 레이어 규격 | NEXIA | PRD-001 | published | embedding, tensor, pgvector | 5W1H, HEXAGON, 6-Layer, Nature-Tag, Atom, Scope | 완료 | 1/1 · 3 링크 | [08_TDD/AI/08_TDD_AI_5W1H_6대추상레이어규격.md](./08_TDD/AI/08_TDD_AI_5W1H_6대추상레이어규격.md) |
| TDD-034 | 데이터 성격 · 수명 주기 | NEXIA | PRD-001 | published | postgresql | Nature-Tag, ROUTINE, INTENT, GOVERN, Atom, ARCHIVE | 완료 | 1/1 · 3 링크 | [08_TDD/AI/08_TDD_AI_데이터성격수명주기.md](./08_TDD/AI/08_TDD_AI_데이터성격수명주기.md) |
| TDD-035 | 드롭존·첨부 파일 구조 (이관 안내) | NEXIA | PRD-005 | **archived** | file-upload, multipart, rest | FileDropZone, NexiaLeftNav, files | 완료 | 1/1 · 2 링크 | [08_TDD/AI/08_TDD_AI_드롭존첨부파일구조.md](./08_TDD/AI/08_TDD_AI_드롭존첨부파일구조.md) |
| TDD-036 | RAG · 페르소나 아카이브 전략 | NEXIA | PRD-001 | published | rag, pgvector, embeddings | Persona-Archive, Atom, 5W1H, Nature-Tag, INTENT | 완료 | 1/1 · 3 링크 | [08_TDD/AI/08_TDD_AI_RAG페르소나아카이브전략.md](./08_TDD/AI/08_TDD_AI_RAG페르소나아카이브전략.md) |
| TDD-037 | TS 타입 · 스키마 전략 | NEXIA | TDD-001 | published | zod, typescript | packages-shared, agent-graph, ApiErrorCode | 완료 | 1/1 · 3 링크 | [08_TDD/AI/08_TDD_AI_TS타입스키마전략.md](./08_TDD/AI/08_TDD_AI_TS타입스키마전략.md) |
| TDD-038 | Yjs · Hocuspocus 협업 SSOT | NEXIA | PRD-001 | published | yjs, crdt, hocuspocus, websocket, postgresql | apps-sync, project_yjs_updates, yjs_state, SharedWorker | 완료 | 1/1 · 3 링크 | [08_TDD/AI/08_TDD_AI_YjsHocuspocus협업SSOT.md](./08_TDD/AI/08_TDD_AI_YjsHocuspocus협업SSOT.md) |
| TDD-039 | 안전 대책 · 선조치 로직 | NEXIA | PRD-001 | published | mqtt, esp32 | Sentinel, Reflex, Bypass, Nano-Sentinel, Zenith-Indicator | 완료 | 1/1 · 3 링크 | [08_TDD/AI/08_TDD_AI_안전대책선조치로직.md](./08_TDD/AI/08_TDD_AI_안전대책선조치로직.md) |
| TDD-040 | 피지컬 티어 · 지능 위계 · 하드웨어 사양 | NEXIA | PRD-001 | published | esp32, jetson, raspberry-pi | Physical-Tier, Nano-Sentinel, Kinetic-Controller, Zenith-Indicator, COLD, WARM, HOT | 완료 | 1/1 · 3 링크 | [08_TDD/AI/08_TDD_AI_지능위계및하드웨어사양.md](./08_TDD/AI/08_TDD_AI_지능위계및하드웨어사양.md) |
| TDD-041 | 코일 밸런스 · GOVERN 운영 규범 | NEXIA | PRD-001 | published | json | GOVERN, COILS-Balancer, Safety, Compliance, Capability-ID | 완료 | 1/1 · 3 링크 | [08_TDD/AI/08_TDD_AI_코일밸런스운영규범GOVERN.md](./08_TDD/AI/08_TDD_AI_코일밸런스운영규범GOVERN.md) |
| TDD-042 | 협업형 멀티에디터 플랫폼 | NEXIA | PRD-001 | **archived** | yjs, crdt, zod, tiptap, monaco, sse, langgraph | NEXIA, agent-graph, Omnix, GOVERN, apps-sync, project_yjs_updates | 완료 | 1/1 · 4 링크 | [08_TDD/AI/08_TDD_AI_협업형멀티에디터플랫폼.md](./08_TDD/AI/08_TDD_AI_협업형멀티에디터플랫폼.md) |
| TDD-066 | AI 모델 · 런타임 · 엔진 배치 v1.0 | NEXIA | TDD-040 | published | llm, vlm, ollama, vllm, whisper, stt, tts, rag, langgraph, react-flow, comfyui, esphome | Zenith-Indicator, Nano-Sentinel, agent-graph, apps-sync, GraphCanvas, GOVERN | 미완 | 0/1 | [08_TDD/AI/08_TDD_AI_모델·런타임·엔진배치_v1.0.md](./08_TDD/AI/08_TDD_AI_모델·런타임·엔진배치_v1.0.md) |

> **TDD-035:** 정본은 **TDD-013**. frontmatter `status: archived` 권장.

## 08_TDD — Cosmic (2)

| doc_id | title | domain | parent_doc | terms_standard | terms_nexa | 관련문서 | 링크·충실도 | 파일 경로 |
| :----- | :----- | :----- | :----- | :----- | :----- | :----- | :----- | :----- |
| TDD-043 | CSIM · AXON 프로토콜 정본 | NEXAOS | TDD-001 | mqtt, protobuf, pwm | CSIM, AXON, APEX, HEXAGON, ACTON, NEXAVULT | 완료 | 1/1 · 3 링크 | [08_TDD/Cosmic/08_TDD_CSIM_AXON프로토콜_정본.md](08_TDD/Cosmic/08_TDD_AXON-CSIM-SUM-APEX우주언어및유기적구조체통합설계표준.md) |
| TDD-044 | Cosmic Language · 전역 데이터 아키텍처 | NEXAOS | TDD-043 | ontology, 3d-mapping | Cosmic-Language, CLA, APEX, NEXAVULT, Self-Verification | 완료 | 1/1 · 2 링크 | [08_TDD/Cosmic/08_TDD_CosmicLanguage_전역데이터아키텍처.md](./08_TDD/Cosmic/08_TDD_CosmicLanguage_전역데이터아키텍처.md) |

## 08_TDD — Galthon (1)

| doc_id | title | domain | parent_doc | terms_standard | terms_nexa | 관련문서 | 링크·충실도 | 파일 경로 |
| :----- | :----- | :----- | :----- | :----- | :----- | :----- | :----- | :----- |
| TDD-074 | Galthon · Trust Watch · 신뢰 감시 독립주체 v1.0 | NEXAOS | TDD-001 | shacl, audit-log, trace | Galthon, Why-Chain, HEXAGON, Normex, Nexaon, trace_id, promoted, GL | 미완 | 0/1 | [08_TDD/Galthon/08_TDD_Galthon_TrustWatch_신뢰감시독립주체_v1.0.md](./08_TDD/Galthon/08_TDD_Galthon_TrustWatch_신뢰감시독립주체_v1.0.md) |

## 08_TDD — Knowledge (5)

| doc_id | title | domain | parent_doc | terms_standard | terms_nexa | 관련문서 | 링크·충실도 | 파일 경로 |
| :----- | :----- | :----- | :----- | :----- | :----- | :----- | :----- | :----- |
| TDD-045 | 디렉토리 책임 · 기획 자원 경로 | NEXAOS | TDD-001 | next-js, typescript | Knowledge-OS, nexa_knowledge_vectors, project_knowledge, views | 완료 | 1/1 · 3 링크 | [08_TDD/Knowledge/08_TDD_Knowledge_디렉토리책임및기획자원경로.md](./08_TDD/Knowledge/08_TDD_Knowledge_디렉토리책임및기획자원경로.md) |
| TDD-046 | 시스템 구축 순서 및 로드맵 | NEXAOS | TDD-045 | postgresql, pgvector | Knowledge-OS, nexa_knowledge, roadmap | 완료 | 1/1 · 2 링크 | [08_TDD/Knowledge/08_TDD_Knowledge_시스템구축순서및로드맵.md](./08_TDD/Knowledge/08_TDD_Knowledge_시스템구축순서및로드맵.md) |
| TDD-047 | 언어적 라우팅 · 지능형 정규화 | NEXAOS | TDD-045 | embeddings, nlp, pgvector | Language-Routing, normalization, nexa_knowledge_vectors | 완료 | 1/1 · 2 링크 | [08_TDD/Knowledge/08_TDD_Knowledge_언어적라우팅및지능형정규화.md](./08_TDD/Knowledge/08_TDD_Knowledge_언어적라우팅및지능형정규화.md) |
| TDD-048 | 지식 운영 체제 · API 운영 정책 | NEXAOS | TDD-045 | rest, pgvector, postgresql | Knowledge-OS, nexa_knowledge_audit_logs, anchor_id, ASK, GOVERN | 완료 | 1/1 · 2 링크 | [08_TDD/Knowledge/08_TDD_Knowledge_지식운영체제_API운영정책.md](./08_TDD/Knowledge/08_TDD_Knowledge_지식운영체제_API운영정책.md) |
| TDD-049 | 지식 층위 · 오케스트레이션 | NEXAOS | TDD-045 | langgraph, pgvector | Knowledge-OS, orchestration, project_knowledge, nexa_knowledge | 완료 | 1/1 · 2 링크 | [08_TDD/Knowledge/08_TDD_Knowledge_지식층위와오케스트레이션.md](./08_TDD/Knowledge/08_TDD_Knowledge_지식층위와오케스트레이션.md) |

## 08_TDD — Identity (4)

| doc_id | title | domain | parent_doc | terms_standard | terms_nexa | 관련문서 | 링크·충실도 | 파일 경로 |
| :----- | :----- | :----- | :----- | :----- | :----- | :----- | :----- | :----- |
| TDD-050 | Capability ID 체계 · Tier 접근 권한 | NEXAOS | TDD-004 | rbac | Capability-ID, nexa, Tier, domain_tags | 완료 | 1/1 · 2 링크 | [08_TDD/Identity/08_TDD_NEXA_CapabilityID체계_발급및Tier접근권한.md](./08_TDD/Identity/08_TDD_NEXA_CapabilityID체계_발급및Tier접근권한.md) |
| TDD-051 | Capability 기능 자격 · 운영 및 보안 부록 | NEXAOS | TDD-050 | rbac, audit-log | Capability-ID, GOVERN, domain_tags | 완료 | 1/1 · 2 링크 | [08_TDD/Identity/08_TDD_NEXA_Capability기능자격_운영및보안부록.md](./08_TDD/Identity/08_TDD_NEXA_Capability기능자격_운영및보안부록.md) |
| TDD-052 | Identity ID 발급 및 처리 설계 | NEXAOS | TDD-004 | uuid, postgresql | identity_id, nexa_identities, Knowledge-OS | 완료 | 1/1 · 2 링크 | [08_TDD/Identity/08_TDD_NEXA_IdentityID발급및처리설계.md](./08_TDD/Identity/08_TDD_NEXA_IdentityID발급및처리설계.md) |
| TDD-053 | 데이터 무결성 · 신뢰도 점수 | NEXAOS | TDD-052 | postgresql | trust-score, nexa_identities, integrity | 완료 | 1/1 · 2 링크 | [08_TDD/Identity/08_TDD_NEXA_데이터무결성과신뢰도점수.md](./08_TDD/Identity/08_TDD_NEXA_데이터무결성과신뢰도점수.md) |

---

## 09_Admin (1)

| doc_id | title | domain | parent_doc | terms_standard | terms_nexa | 관련문서 | 링크·충실도 | 파일 경로 |
| :----- | :----- | :----- | :----- | :----- | :----- | :----- | :----- | :----- |
| ADM-001 | NEXA SYNC 커맨드 센터 | NEXAOS | TDD-001 | sse, websocket | NEXA-SYNC, Sentinel, Indicator, GOVERN, 5W1H, Traceability-Map | 완료 | 1/1 · 3 링크 | [09_Admin/09_Admin_NEXA_SYNC커맨드센터.md](./09_Admin/09_Admin_NEXA_SYNC커맨드센터.md) |

---

## 주요 관계 허브 (참고)

| doc_id | 역할 |
| :----- | :--- |
| **BRD-001** | 사업 SSOT · 대부분 PRD·TDD·UIX 의 `parent_doc` |
| **TDD-001** | NEXA OS 기술 SSOT |
| **TDD-071** | 도메인 구조 통합 (레지스트리 + Concept Map · **TDD-002/TDD-059 대체**) |
| **TDD-007** | NEXA-Platform 모노레포 구조 |
| **TDD-008** | LangGraph · IoT 온톨로지 플랫폼 |
| **TDD-058** | 플랫폼 오케스트레이션 · graph_id 레지스트리 |
| **TDD-010** | NEXIA 도메인 기술 SSOT |
| **TDD-056** | nexia 7 탭 범위 확정 (In/Out · MVP) |
| **TDD-057** | Ontex 도메인 기술 SSOT |
| **TDD-072** | Kineton · Physical Bridge · ACTON · ROS 2 |
| **TDD-073** | Nexaon · Distillation 오케스트레이터 |
| **TDD-074** | Galthon · Trust Watch · 신뢰 감시 독립주체 |
| **TDD-075** | NEXA OS · 전역 아키텍처 표준 (Global Architecture) |
| **PRD-005** ↔ **TDD-013** | 드롭존 클러스터 |
| **PRD-004** ↔ **TDD-024** · **TDD-025** | NEXA-CELL 클러스터 |
| **PRD-001** | NEXIA MVP UI · AI TDD-033~041 의 `implements_doc` |
| **TDD-038** | Yjs · Hocuspocus 협업 SSOT |

---

## _inbox (미발급)

`_inbox` 초안은 승격 시 `doc_id` 를 **신규 발급**합니다. 기존 번호를 재사용하지 않습니다.

| 상태 | 비고 |
| :--- | :--- |
| DRAFT 2 + 메모 1 | `DRAFT_IoT엣지…` · `DRAFT_에이전틱…` · `AI 모델 현황…` — [`_inbox/README.md`](./_inbox/README.md) |

---

## archived doc_id (2026-06-13 · SSOT ✗)

번호 유지 · 파일 삭제 없음 · `status: archived` + 대체 SSOT 링크.

| doc_id | title | domain | 대체 SSOT | 파일 경로 |
| :----- | :----- | :----- | :----- | :----- |
| **MVP-001** | NEXIA 레이아웃 · 팝아웃 MVP | NEXIA | **UIX-004** · **TDD-014** | [03_MVP/03_MVP_NEXIA_레이아웃팝아웃MVP.md](./03_MVP/03_MVP_NEXIA_레이아웃팝아웃MVP.md) |
| **UIX-006** | NEXA 통합 레이아웃 구조 규격 | NEXA | **UIX-004** · **TDD-071** | [07_UIUX/07_UIUX_NEXA_통합레이아웃구조규격.md](./07_UIUX/07_UIUX_NEXA_통합레이아웃구조규격.md) |
| **TDD-002** | NEXA OS · 도메인 구조 (레지스트리) | NEXAOS | **TDD-071** | [—](./08_TDD/NEXAOS/) *(파일 삭제 · 2026-06-14)* |
| **TDD-059** | NEXA OS · 도메인 마스터 맵 v1.0 | NEXAOS | **TDD-071** | [—](./08_TDD/NEXAOS/) *(파일 삭제 · 2026-06-14)* |
| **TDD-015** | 멀티창 동기화 구현 로드맵 | NEXIA | **TDD-014** · **TDD-038** | [08_TDD/NEXIA/08_TDD_NEXIA_멀티창동기화구현로드맵.md](./08_TDD/NEXIA/08_TDD_NEXIA_멀티창동기화구현로드맵.md) |
| **UIX-009** | BAX Core · UI · Harness 아키텍처 v1.0 | NEXIA | **UIX-003** (v1.0 정본 흡수) | [07_UIUX/07_UIUX_BAX_미학적인터페이스UX아키텍처_v1.0.md](./07_UIUX/07_UIUX_BAX_미학적인터페이스UX아키텍처_v1.0.md) *(2026-06-22 · UIX-003 재할당)* |
| **TDD-026~032** | Generators 7종 | NEXIA | **TDD-010** · **PRD-001** | [08_TDD/NEXIA/Generators/README.md](./08_TDD/NEXIA/Generators/README.md) |

---

## 폐기 · 삭제 doc_id (번호 재사용 금지)

| doc_id | title | domain | 처리 | 대체 SSOT | 비고 |
| :----- | :----- | :----- | :----- | :----- | :----- |
| **PRD-006** | 룰·프롬프트 통합 관리 | NEXIA | **삭제** (2026-06-13) | **TDD-041** GOVERN · **PRD-001** MVP UI | 의도적 폐기 — 구 NEXA-AI-05 초안 |
