---
implements_doc: 
doc_id: TDD-060
title: "NEXA V2.0 용어집"
category: "08_TDD"
domain: NEXAOS
status: published
created: 2026-06-12
updated: 2026-06-12
parent_doc: TDD-001
see_also: [TDD-002, TDD-008, TDD-010, TDD-056, TDD-057, TDD-058, TDD-059, UIX-006, UIX-004]
terms_standard: []
terms_nexa: ["glossary", "terms_standard", "terms_nexa", "domainKey", "tabId", "Nexaon", "NexaonShell", "Nixie"]
tags: ["doc/cat/08-tdd", "doc/domain/nexaos", "nexa/glossary", "nexa/terms_standard", "nexa/terms_nexa", "nexa/domainKey", "nexa/tabId"]
---

# NEXA V2.0 용어집

> **역할:** NEXA V2.0 문서·코드에서 쓰는 용어의 **사람이 읽는 SSOT**.
> **기계 태그 SSOT:** 각 문서 frontmatter `terms_standard` · `terms_nexa` → `tags` ([`sync_terms_to_tags.py`](../../scripts/sync_terms_to_tags.py)).
> **충돌 시:** 본 용어집 ↔ 도메인 TDD 불일치면 **해당 도메인 TDD** 우선 · 플랫폼 공통은 **TDD-002** · nexia 7 탭은 **TDD-010 §3.1**.

---

## 1. 사용 규칙

| 구분 | frontmatter 키 | 태그 접두 | 예시 |
| :--- | :--- | :--- | :--- |
| **범용 기술 스택** | `terms_standard` | `std/` | `std/next-js`, `std/yjs` |
| **NEXA 전용** | `terms_nexa` | `nexa/` | `nexa/domainKey`, `nexa/Omnix` |

- 태그·배열 값은 **kebab-case** (`Global-Navex`, `react-flow`).
- **신규 전용 용어**는 본 용어집에 먼저 정의한 뒤 문서 `terms_nexa` 에 추가한다.
- **구 UI 라벨**(Cockpit, Ethos 등) 은 **부록 A** 참고만 — 신규 문서·코드 **금지**.

---

## 2. 범용 기술 스택 용어 (`terms_standard`)

업계 표준·오픈소스·인프라 기술. NEXA 외 프로젝트에서도 동일 의미.

### 2.1 프론트엔드 · UI

| 태그                   | 표기                 | 정의                           | NEXA V2.0 에서                                                      |
| :------------------- | :----------------- | :--------------------------- | :---------------------------------------------------------------- |
| `next-js`            | Next.js            | React 풀스택 프레임워크 · App Router | Greenfield UI `apps/web`                                          |
| `react`              | React              | UI 라이브러리                     | domains/* · frame/*                                               |
| `typescript`         | TypeScript         | 정적 타입 JS 상위집합                | 전 모노레포 기본                                                         |
| `zustand`            | Zustand            | 경량 클라이언트 상태                  | `useLayoutStore` 등                                                |
| `tailwind-css`       | Tailwind CSS       | 유틸리티 CSS                     | nexia UI 기본                                                       |
| `shadcn-ui`          | shadcn/ui          | Radix+Tailwind 컴포넌트 패턴       | v0·nexia 컴포넌트                                                     |
| `app-router`         | App Router         | Next.js 라우팅 (`app/`)         | `(shell)` · `/nexia/[tabId]`                                      |
| `react-flow`         | React Flow         | 노드·엣지 캔버스                    | Logex · Nexaon GraphCanvas                                        |
| `tiptap`             | Tiptap             | ProseMirror 기반 리치텍스트         | Normex · SpecsPreview                                             |
| `monaco`             | Monaco Editor      | VS Code 계열 코드 에디터            | Scribx                                                            |
| `document-pip`       | Document PiP       | 브라우저 PiP API                 | L3 패널 분리 ([`TDD-014`](../NEXIA/08_TDD_NEXIA_멀티윈도우DocumentPiP.md)) |
| `css-grid`           | CSS Grid           | 2D 그리드 레이아웃                  | BAX·동적 그리드                                                        |
| `typography`         | Typography         | 타이포 스케일·가변 폰트                | BAX MAE                                                           |
| `three-js`           | Three.js           | WebGL 3D                     | Twinex 트윈 뷰                                                       |
| `webgl` / `webgpu`   | WebGL / WebGPU     | GPU 렌더 API                   | 3D·쉐이더                                                            |
| `keyboard-shortcuts` | Keyboard shortcuts | 단축키 바인딩                      | PRD-009                                                           |
|                      |                    |                              |                                                                   |

### 2.2 실시간 · 협업

| 태그 | 표기 | 정의 | NEXA V2.0 에서 |
| :--- | :--- | :--- | :--- |
| `yjs` | Yjs | CRDT 실시간 동기화 | 그래프·문서·코드 협업 |
| `crdt` | CRDT | 충돌 없는 복제 자료형 | Yjs 기반 |
| `hocuspocus` | Hocuspocus | Yjs WebSocket 백엔드 | `apps/sync` |
| `websocket` | WebSocket | 양방향 실시간 채널 | sync · MQTT 브릿지 |
| `sse` | SSE | Server-Sent Events | Run 타임라인·토큰 스트림 |
| `broadcast-channel` | BroadcastChannel | 탭·창 간 메시지 | 멀티창 동기화 |
| `shared-worker` | SharedWorker | 백그라운드 공유 워커 | Yjs 연결 공유 |

### 2.3 백엔드 · 데이터

| 태그 | 표기 | 정의 | NEXA V2.0 에서 |
| :--- | :--- | :--- | :--- |
| `nestjs` | NestJS | Node 백엔드 프레임워크 | `apps/backend` · SSE 중계 |
| `postgresql` | PostgreSQL | 관계형 DB | files · Yjs persist · pgvector |
| `pgvector` | pgvector | Postgres 벡터 확장 | RAG · project_knowledge |
| `neo4j` | Neo4j | 속성 그래프 DB | 온톨로지 쿼리층 (SSOT 아님) |
| `rest` | REST | HTTP API 스타일 | 대부분 공개 API |
| `graphql` | GraphQL | 쿼리 언어 API | (선택) |
| `grpc` | gRPC | RPC 프레임워크 | (선택) |
| `fastapi` | FastAPI | Python ASGI API | agent-graph 보조 |
| `docker` | Docker | 컨테이너 | 배포·Blender 등 |
| `jwt` | JWT | 토큰 기반 인증 | API 인증 |
| `rbac` | RBAC | 역할 기반 접근제어 | (설계 중) |
| `uuid` | UUID | 범용 고유 ID | identity_id 등 |
| `zod` | Zod | 스키마 검증 | `packages/shared` |
| `json` / `json-ld` | JSON / JSON-LD | 데이터·시맨틱 직렬화 | 온톨로지 export |
| `rdf` / `sparql` | RDF / SPARQL | 시맨틱 웹 그래프·쿼리 | Ontex |
| `cypher` | Cypher | Neo4j 쿼리 언어 | 그래프 조회 |
| `shacl` | SHACL | RDF shapes 검증 | Nexaon 승인 게이트 |
| `ontology` | Ontology | 개념·관계 체계 (일반) | 도메인 `ontex` 와 구분 (§3.3) |
| `knowledge-graph` | Knowledge graph | 지식 그래프 (일반) | Logex·Ontex |
| `audit-log` | Audit log | 감사 로그 | 승인·변경 이력 |

### 2.4 AI · LLM

| 태그 | 표기 | 정의 | NEXA V2.0 에서 |
| :--- | :--- | :--- | :--- |
| `llm` | LLM | 대규모 언어 모델 | agent-graph 경유만 |
| `ollama` | Ollama | 로컬 LLM 런타임 | dev adapter |
| `vllm` | vLLM | 고성능 LLM 서빙 | prod adapter |
| `langgraph` | LangGraph | 상태 그래프 오케스트레이션 | `apps/agent-graph` |
| `state-graph` | State graph | LangGraph 상태 머신 | Run·승인 루프 |
| `rag` | RAG | 검색 증강 생성 | Ontex·Graph RAG |
| `embedding` / `embeddings` | Embedding | 벡터 임베딩 | `/v1/embed` · embedder |
| `transformer` | Transformer | 신경망 아키텍처 | (일반) |
| `agentic-ai` | Agentic AI | 도구·계획형 AI | Omnix·LangGraph |
| `mcp` | MCP | Model Context Protocol | 외부 도구 연동 |
| `whisper` | Whisper | STT 모델 | 음성→텍스트 |
| `stt` / `tts` | STT / TTS | 음성 인식·합성 | Vivex·Omnix |
| `vad` | VAD | 음성 활동 검출 | 브라우저 음성 레이어 |
| `webrtc` | WebRTC | 실시간 미디어 | (선택) |
| `nlp` | NLP | 자연어 처리 | (일반) |
| `msw` | MSW | API 모킹 | UI-L5 이전 |

### 2.5 IoT · 엣지 · 미디어

| 태그 | 표기 | 정의 | NEXA V2.0 에서 |
| :--- | :--- | :--- | :--- |
| `iot` | IoT | 사물인터넷 | nexabo·Twinex·NEXA-CELL |
| `mqtt` | MQTT | IoT 메시징 | 디바이스·텔레메트리 |
| `esphome` | ESPHome | ESP 펌웨어 YAML | NEXA-CELL · Deploy |
| `esp32` | ESP32 | MCU | 엣지 디바이스 |
| `ota` | OTA | 무선 펌웨어 갱신 | Deploy 패널 |
| `web-serial` | Web Serial API | 브라우저 시리얼 | USB 플래시 |
| `comfyui` | ComfyUI | 노드 기반 이미지 생성 | Vivex 파이프라인 |
| `remotion` | Remotion | React 영상 합성 | AIVIDEO |
| `blender` | Blender | 3D DCC | AI3D 백엔드 |
| `ros-2` | ROS 2 | 로봇 미들웨어 | (후속) |
| `jetson` | Jetson | NVIDIA 엣지 GPU | 엣지 추론 |
| `raspberry-pi` | Raspberry Pi | SBC | (일반) |
| `wokwi` | Wokwi | ESP 시뮬레이터 | (교육·프로토) |
| `saas` | SaaS | 구독형 서비스 | BM (BRD) |
| `data-lake` | Data lake | 대용량 원시 저장 | BRD·Ontex |
| `time-series` | Time series | 시계열 데이터 | nexabo·Time Axis |

### 2.6 Rivet · 워크플로 (오픈소스)

| 태그 | 표기 | 정의 | NEXA V2.0 에서 |
| :--- | :--- | :--- | :--- |
| `rivet` | Rivet | 노드 워크플로 에디터/런타임 | Embedded Rivet · rivet-core |

### 2.7 개발 · 품질 · 기타

| 태그 | 표기 | 정의 |
| :--- | :--- | :--- |
| `git` | Git | 버전 관리 |
| `python` | Python | 스크립트·agent·Blender |
| `pyqt6` | PyQt6 | U2BEE 데스크톱 UI |
| `pyodide` | Pyodide | 브라우저 Python |
| `webassembly` | WebAssembly | 브라우저 바이너리 |
| `file-upload` / `multipart` | File upload | HTTP 업로드 |
| `mermaid` | Mermaid | 다이어그램 마크다운 |
| `rfc` | RFC | 표준 초안 문서 |
| `socket-io` | Socket.IO | 실시간 (레거시 후보) |
| `performance-api` | Performance API | 브라우저 성능 측정 |
| `3d-mapping` / `ann` / `tensor` | 3D mapping / ANN / Tensor | ML·3D (도메인별) |

---

## 3. NEXA V2.0 전용 용어 (`terms_nexa`)

NEXA 플랫폼·제품·코드에서만 쓰는 식별자·모듈·정책.

### 3.1 플랫폼 · OS

| 태그 | 표기 | 정의 | SSOT |
| :--- | :--- | :--- | :--- |
| `NEXA` | NEXA | 사업·플랫폼 전체 브랜드 | BRD-001 |
| `NEXAOS` | NEXA OS | OS·셸·도메인·미션크리티컬 설계층 | TDD-001 |
| `domainKey` | domainKey | Header 전역 메뉴 도메인 식별자 (`nexia`, `erp` …) | TDD-002 |
| `subRoute` | subRoute | 단일 `domainKey` 내 content 분기 (`erp/parts`) | TDD-059 |
| `MainShell` | MainShell | 4 영역 +StatusBar 플랫폼 셸 | UIX-006 |
| `domainLayoutRegistry` | domainLayoutRegistry | domainKey→슬롯 lazy import 레지스트리 | TDD-002 |
| `useLayoutStore` | useLayoutStore | 드로어·상태바 Zustand SSOT | UIX-006 |
| `drawerDefaults` | drawerDefaults | 도메인별 L/R 드로어 open 정책 | TDD-002 |
| `SystemStatusBar` | SystemStatusBar | 하단 1 줄 + 확장 상태 패널 | UIX-006 |
| `AppHeader` | AppHeader | 상단 전역 헤더 | UIX-006 |
| `themePreset` | themePreset | 도메인 테마 (`office-light` 등) | TDD-002 |
| `packages-shared` | packages/shared | Zod·commands 공유 패키지 | TDD-007 |
| `agent-graph` | apps/agent-graph | LLM·Embed·LangGraph 실행 앱 | TDD-003 |
| `rivet-core` | rivet-core | Rivet 토폴로지·Get Prompt·위임만 | TDD-003 |
| `apps-sync` | apps/sync | Hocuspocus Yjs 서버 | TDD-042 |
| `embedder` | embedder | in-process 임베딩 (`/v1/embed`) | TDD-003 |
| `M.O.S.E.S.` | M.O.S.E.S. | 미션크리티컬 설계 원칙 약어 | TDD-001 |

### 3.2 `domainKey` (제품·업무 영역)

| 태그        | domainKey   | 역할                                    |
| :-------- | :---------- | :------------------------------------ |
| `nexia`   | **nexia**   | 핵심 지능 · 7 탭 · Omnix·Twinex·NEXA-CELL  |
| `ontex`   | **ontex**   | 온톨로지·Graph RAG·pgvector (구 nexion 흡수) |
| `erp`     | **erp**     | ERP 메인 (구 erp-parts 통합)               |
| `nexabo`  | **nexabo**  | IoT 관제·텔레메트리 (구 nexage)               |
| `nexet`   | **nexet**   | SW/HW 마켓 유통                           |
| `infra`   | **infra**   | 장치 등록·my-devices                      |
| `network` | **network** | WiFi·CAN·MQTT 토폴로지                    |
| `admin`   | **admin**   | 슈퍼 관리 (구 nexa-admin)                  |

상세 맵: [`TDD-059`](./08_TDD_NEXAOS_도메인마스터맵_v1.0.md).


### 3.3 nexia — 7 탭 (`tabId` SSOT)

| tabId    | 태그       | 벌움   | 역할                     | 대표 산출물                 |
| :------- | :------- | :--- | :--------------------- | :--------------------- |
| `omnix`  | `Omnix`  | 옴닉스  | 소통·허브·오케스트레이션·승인 중계    | `.nxchat`              |
| `normex` | `Normex` | 노멕스  | Norm(규범)·정책·Tiptap 시방서 | `.nxpol`               |
| `logex`  | `Logex`  | 로젝스  | 추론·관계·React Flow 워크플로  | `.nxflow` · **Nexaon** |
| `scribx` | `Scribx` | 스크립스 | 코드·명세·Monaco           | `.nxcode`              |
| `vivex`  | `Vivex`  | 비벡스  | 미디어·ComfyUI            | `.nxmedia`             |
| `twinex` | `Twinex` | 트윈엑스 | 디지털 트윈·3D·ESPHome      | `.nxproj` `.nxdev` …   |
| `navex`  | `Navex`  | 네이벡스 | 자산·파일 탐색·릴레이           | 인덱싱 only               |

- URL: `/nexia/{tabId}` · Nexaon canonical: `/nexia/logex/ontology/{projectId}` · deep link §3.4.1
- SSOT: [`TDD-010` §3.1](../NEXIA/08_TDD_NEXIA_구조기술스택운영방침.md) · [`TDD-056`](../NEXIA/08_TDD_NEXIA_7탭범위확정_v1.0.md)

### 3.4 nexia — 명칭 구분 (혼동 방지)

| 태그            | 표기          | 정체                                             | 금지 혼동              |
| :------------ | :---------- | :--------------------------------------------- | :----------------- |
| `nexia`       | **nexia**   | UI `domainKey` · `domains/nexia/`              | NEXAON 프로젝트명       |
| `Nexaon`      | **Nexaon**  | Logex **`ontology` 서브모드** — Human↔LLM **지식·온톨로지 정재** (§3.4.1) | 별도 domainKey ✗ · LangGraph Agent ✓ |
| `NexaonShell` | NexaonShell | Nexaon 3 분할 작업면 셸 (ExplorerTree · GraphCanvas · RunPanel) | MainShell ✗        |
| `NEXIA`       | NEXIA       | 제품·문서 도메인 라벨 (대문자)                             | `nexia` 코드키와 별도 표기 |
| `LangGraph`   | LangGraph   | 기술 스택·`08_TDD/LangGraph/`                      | domainKey ✗        |
| `ontex`       | **ontex**   | 온톨로지 **domainKey**                             | nexia Logex 와 별도   |

#### 3.4.1 Nexaon — 상세 정의

> **한 줄:** Logex **`ontology` 서브모드** · **L3 지능 루프** — Human↔LLM **지식·온톨로지 정재** (`modules/nexaon/` · `apps/agent-graph`). **`tabId` · `domainKey` ✗** · LangGraph Run **✓**.

| 항목 | SSOT |
| :--- | :--- |
| **UI** | **NexaonShell** — ExplorerTree · GraphCanvas · RunPanel |
| **Canonical URL** | `/nexia/logex/ontology/{projectId}` — UI **집 주소** ([`TDD-056` §4.1](../NEXIA/08_TDD_NEXIA_7탭범위확정_v1.0.md)) |
| **협업·Run** | Yjs `ontology:draft` · `nexaon_ingest` / `nexaon_refine` · **Omnix** 승인 · **SHACL** → **promoted** |
| **저장** | Yjs → Draft → Audit → Neo4j ([`TDD-008` §2.4](../LangGraph/08_TDD_LangGraph_인간LLM협업형IoT온톨로지플랫폼_v1.0.md)) |

**L3 역할:** 후보고·자산 **수집·매핑** → Run · `graph_diff` → Normex·승인 → SHACL → **promoted** (미검증 JSON → ontex **✗**).

**진입 (Normative)** — **UI home · deep link · 엣지 후보고** 3 종. 동일 **`NexaonShell`** · Yjs room · Run graph.

| 축 | 출발 | Nexaon 연결 |
| :--- | :--- | :--- |
| **① 엣지 후보고** | Sentinel · `candidate:true` Envelope | Nest → **`nexaon_ingest`** (Logex **선행 ✗**) |
| **② nexabo** | Live Feed · 알람 | 큐 · correlate → ingest / **「정재 열기」** deep link |
| **③ Twinex** | `.nxdev` · 진단 | `device_id` → ExplorerTree 프리로드 |
| **④ Logex** | `logexSubMode: ontology` | **canonical home** · 수동 편집·Run |
| **⑤ Omnix** | 승인 · `graph_diff` | RunPanel · GraphCanvas (Diff accept) |
| **⑥ Navex** | 자산 선택 | class/asset/pin 컨텍스트 jump |

| ingest 모드 | 조건 | 동작 |
| :--- | :--- | :--- |
| **Auto** | critical · STUCK · 정책 매칭 | Omnix/router → `nexaon_ingest` |
| **Queue** | Normal 후보고 | staging 큐 → nexabo/Nixie 알림 → Human 정재 |
| **Buffer** | 고빈도 TICK | Live Feed 만 · Run 은 배치/임계치 |

**경계:** **ontex** = promoted 허브 · **Nixie** = 결과 **표현** (Run ✗) · **nexabo** = 관제 UI · **Logex default** = `.nxflow` (ontology 와 별도).

**관련 SSOT:** [`TDD-056` §4.1](../NEXIA/08_TDD_NEXIA_7탭범위확정_v1.0.md) · [`TDD-008`](../LangGraph/08_TDD_LangGraph_인간LLM협업형IoT온톨로지플랫폼_v1.0.md) · [`TDD-057` §7](../Ontex/08_TDD_Ontex_기술스택운영방침_v1.0.md) · [`DRAFT_IoT엣지…`](../../_inbox/DRAFT_IoT엣지데이터파이프라인_HEXAGON선처리_Nexaon지식화연계.md) §1.6.5

### 3.5 nexia — UI 셸 · 레이아웃

| 태그                             | 표기                    | 정의                                          |
| :----------------------------- | :-------------------- | :------------------------------------------ |
| `NexiaContent`                 | NexiaContent          | nexia Content 슬롯 루트 (TabBar+Workspace)      |
| `NexiaWorkspace`               | NexiaWorkspace        | Content 3 층 (L1 2-pane · L2 split · L3 PiP) |
| `NexiaTabBar`                  | NexiaTabBar           | 6 탭 스트립 (omnix 제외·레일)                       |
| `tabId`                        | tabId                 | nexia 탭 식별자                                 |
| `subPaneId`                    | subPaneId             | 탭 내 서브패널·다중 창 ID                            |
| `panelId`                      | panelId               | PiP·detach 대상 패널 ID                         |
| `OmnixRail`                    | OmnixRail             | L1 좌측 Omnix 고정 레일                           |
| `Global-Navex`                 | **Global Navex**      | Right Drawer 상시 자산 탐색 플러그인                  |
| `Navex`                        | **Navex**             | `tabId=navex` 전체 화면 탐색 탭                    |
| `GlobalFileExplorer`           | GlobalFileExplorer    | 공통 파일·자산 탐색 엔진                              |
| `NexiaExplorerPanel`           | NexiaExplorerPanel    | 탐색기 + 액션바 래퍼                                |
| `useGlobalFileExplorer`        | useGlobalFileExplorer | 탐색기 상태·API 훅                                |
| `GraphCanvas`                  | GraphCanvas           | Nexaon React Flow 캔버스                       |
| `ExplorerTree`                 | ExplorerTree          | Nexaon Left 클래스·자산 트리                       |
| `RunPanel`                     | RunPanel              | LangGraph Run·SSE 타임라인                      |
| `Left-Drawer` / `Right-Drawer` | Left / Right Drawer   | MainShell 측면 패널                             |
| `PiP`                          | PiP                   | Picture-in-Picture 패널 분리                    |
| `UI-L0` …                      | UI-L*                 | MVP UI 구현 단계 (PRD-001)                      |

SSOT: [`UIX-004`](../../07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md).

### 3.6 Omnix · 협업 · 승인

| 태그              | 표기            | 정의                        |
| :-------------- | :------------ | :------------------------ |
| `NIXIE`         | NIXIE         | **지능의 얼굴·Presence Shell** — Omnix·Nexaon·Run **결과 표현** · LangGraph Agent ✗ ([§3.4.1](#341-nexaon--상세-정의)) |
| `Nixie`         | Nixie         | NIXIE 제품·채널 표기 (PiP · BAX M2P · 닉시관) — 코드·문서 동의어 |
| `HEXAGON`       | HEXAGON       | 5W1H·의미 축 프로토콜            |
| `NEXNAP`        | NEXNAP        | 시스템 인터페이스·Envelope 규약     |
| `Envelope`      | Envelope      | 탭·actor·payload 표준 메시지 래퍼 |
| `approval-gate` | approval-gate | 승인 A/B/C 게이트              |
| `GOVERN`        | GOVERN        | 룰·프롬프트 거버넌스               |
| `ASK` / `VOID`  | ASK / VOID    | 미정·보류 처리 (PRD-003)        |
| `VOID-BOX`      | VOID-BOX      | VOID 보관 UI                |
| `DEFERRED`      | DEFERRED      | 연기된 결정 상태                 |

### 3.7 데이터 · 파일 · Identity

| 태그 | 표기 | 정의 |
| :--- | :--- | :--- |
| `files` | files | 업로드 파일 DB 테이블 |
| `file_references` | file_references | 문서·미디어 참조 등록 |
| `file_embeddings` | file_embeddings | 파일 벡터 인덱스 |
| `source_metadata` | source_metadata | AI 추출 메타 (PRD-013) |
| `nexa-docs` | nexa-docs | 문서 폴더 노드 ID (PRD-008) |
| `identity_id` | identity_id | Knowledge OS 영혼 원장 ID |
| `nexa_identities` | nexa_identities | Identity 테이블 |
| `anchor_id` | anchor_id | 자산 논리 고정 주소 |
| `graph_id` | graph_id | Nexaon·Run 그래프 식별 |
| `run_id` | run_id | LangGraph 실행 ID |
| `project_yjs_updates` | project_yjs_updates | Yjs 스냅샷 persist |
| `yjs_state` | yjs_state | Yjs 바이너리 상태 |
| `Knowledge-OS` | Knowledge OS | 용어·벡터·감사 체계 |

### 3.8 IoT · 제품 모듈

| 태그 | 표기 | 정의 |
| :--- | :--- | :--- |
| `NEXA-CELL` | NEXA-CELL | ESPHome YAML·웹 펌웨어 제품 |
| `Twinex` | Twinex | tabId·디지털 트윈 (§3.4) |
| `Physical-AI` | Physical AI | 물리 세계 +AI 융합 (BRD) |
| `Physical-AI-Ops` | Physical AI Ops | 산업 운영 단계 포지셔닝 |
| `digital-twin` | digital twin | Twinex 도메인 개념 |
| `edge` / `edge-device` | edge | 엣지 디바이스·큐 |
| `Lambda` | Lambda | NEXA-CELL 보드 라인 (문맥별) |

### 3.9 BAX · 미학 UI (선택 도메인)

| 태그 | 표기 | 정의 |
| :--- | :--- | :--- |
| `BAX` | BAX | 미학적 인터페이스 UX 프레임 |
| `MAE` | MAE | 미학 엔진 |
| `ATS` | ATS | 적응 타이포 시스템 |
| `ASR` | ASR | 적응 스케일 레이어 |
| `M2P` | M2P | 모션→파라미터 |
| `VirtualCanvas` | VirtualCanvas | 가상 캔버스 |
| `LayoutPolicy` | LayoutPolicy | BAX 레이아웃 정책 |
| `RuleGuard` | RuleGuard | 규칙 가드 UI |

### 3.10 Generators · 미디어 파이프라인

| 태그 | 표기 | 정의 |
| :--- | :--- | :--- |
| `Generators` | Generators | AI 생성기 TDD 묶음 |
| `AIVIDEO` / `AI3D` / `AICIRCUIT` / `AISOUND` | AI* | 도메인별 생성기 모듈명 |
| `Vivex` | Vivex | 미디어 탭 (§3.4) |
| `Rivet` | Rivet | 워크플로 (NEXA 래핑) |

### 3.11 기타 전용 · 레거시 태그

문서에만 남아 있는 태그 — 신규 사용 시 본 절 또는 해당 TDD 에서 재확인.

| 태그 | 비고 |
| :--- | :--- |
| `Cockpit` | **폐기** → `Omnix` (부록 A) |
| `NexiaSplitLayout` | 구 MVP 분할 레이아웃 — To-Be 는 `NexiaWorkspace` |
| `Nexion` | UI 브랜드명 — **domainKey**는 `ontex` |
| `Nexus-Map` / `Nexus-Graph` | AI 워크스페이스 지식 맵 (레거시 AI TDD) |
| `U2BEE` | 데스크톱 앱 제품 (PRD-002) |
| `v0` / `nexia-shell` | v0 프롬프트·프로토타입 |

---

## 4. `.nx*` 산출물 확장자 (nexia)

| 확장자 | tabId | 설명 |
| :--- | :--- | :--- |
| `.nxchat` | omnix | 채팅·세션 로그 |
| `.nxpol` | normex | 규범·정책 문서 |
| `.nxflow` | logex | 워크플로·그래프 |
| `.nxcode` | scribx | 코드·스크립트 |
| `.nxmedia` | vivex | 미디어 메타·파라미터 |
| `.nxproj` | twinex | 프로젝트·트윈 루트 |
| `.nxgrp` | twinex | 그룹·토폴로지 |
| `.nxdev` | twinex | 디바이스 바인딩 |
| `.nxdiag` | twinex | 진단·시뮬 산출 |

Navex 는 **생성 확장자 없음** — 전체 인덱싱. — [`TDD-010` §3.3](../NEXIA/08_TDD_NEXIA_구조기술스택운영방침.md)

---

## 5. 부록 A — 구 UI 라벨 (비규범)

> [`TDD-010` 부록 B](../NEXIA/08_TDD_NEXIA_구조기술스택운영방침.md) 와 동일. **신규 코드·문서·`tabId` 에 사용 금지.**

| 구 라벨 | 현재 SSOT |
| :--- | :--- |
| Cockpit (콕핏) | **Omnix** |
| Ethos (에토스) | **Normex** |
| Synapse (시넵스) | **Logex** |
| Glos (글로스) | **Scribx** |
| Physis (피시스) | **Vivex** |
| Sense (센스) | **Twinex** |
| Navis (나비스) | **Navex** |

---

## 6. 부록 B — 전체 태그 인덱스 (자동 집계)

확정 문서 83 건 frontmatter 기준 (2026-06-12). 신규 승격 시 [`sync_terms_to_tags.py`](../../scripts/sync_terms_to_tags.py) 재실행.

| 구분 | 개수 | 조회 방법 |
| :--- | :---: | :--- |
| `terms_standard` | 99 | 본 문서 §2 + 각 문서 YAML |
| `terms_nexa` | 219 | 본 문서 §3 + [`doc_id_레지스트리`](../../doc_id_레지스트리.md) |

---

## 관련 문서

| 관계 | 문서 |
| :--- | :--- |
| 문서 생태계·`terms_*` 규칙 | [개발문서 생태계와 관리 체계](../../개발문서%20생태계와%20관리%20체계.md) |
| doc_id SSOT | [doc_id 레지스트리](../../doc_id_레지스트리.md) |
| 도메인 레지스트리 | [NEXA OS · 도메인 구조 (TDD-002)](./08_TDD_NEXAOS_도메인레지스트리명세.md) |
| 도메인 맵 | [NEXA OS · 도메인 마스터 맵 (TDD-059)](./08_TDD_NEXAOS_도메인마스터맵_v1.0.md) |
| nexia 7 탭·스택 | [NEXIA 구조·기술스택 (TDD-010)](../NEXIA/08_TDD_NEXIA_구조기술스택운영방침.md) |
| 플랫폼 레이아웃 | [NEXA 통합 레이아웃 (UIX-006)](../../07_UIUX/07_UIUX_NEXA_통합레이아웃구조규격.md) |
| nexia UI | [NEXIA MainShell (UIX-004)](../../07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md) |
| Nexaon · 진입 · 7 탭 | [NEXIA 7탭 범위 (TDD-056) §4.1](../NEXIA/08_TDD_NEXIA_7탭범위확정_v1.0.md) |
| Nexaon · Run · SHACL | [LangGraph · IoT 온톨로지 (TDD-008)](../LangGraph/08_TDD_LangGraph_인간LLM협업형IoT온톨로지플랫폼_v1.0.md) |
| Nexaon ↔ ontex | [Ontex (TDD-057)](../Ontex/08_TDD_Ontex_기술스택운영방침_v1.0.md) |
| 엣지 후보고 → Nexaon | [DRAFT_IoT엣지… §1.6.5](../../_inbox/DRAFT_IoT엣지데이터파이프라인_HEXAGON선처리_Nexaon지식화연계.md) |
| Nixie · 지능의 얼굴 | [Knowledge (TDD-045)](../Knowledge/08_TDD_Knowledge_디렉토리책임및기획자원경로.md) |
