# Rivet · RAG · 온톨로지 — 용어집

> **범위:** `docs/NEXA OS/Rivet/` 문서군에서 쓰는 **NEXA 전용·Rivet·지능 층위** 용어.  
> **정본:** 지능 층위 → [`RAG · OAG · AIP`](<./RAG · OAG · AIP — 지능 층위와 오케스트레이션.md>) · 정체성 → [`정체성 SSOT`](<../../_NEXA-플랫폼·메타-OS·NEXIA·도메인 — 정체성 SSOT.md>) · AXON → [`CSIM · AXON (정본)`](<../../Nexia/_Cosmic Semantic Interface Matrix v2 — CSIM · AXON 프로토콜 (정본).md>)

---

## 1. NEXA 시스템 전용 용어

### 1.1 정체성 · 층

| 용어            | 정의                                                                                                                           | 주의                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| **NEXA 플랫폼** | 세상에 **배포·운영**되는 통합 **제품** (frame · domains · backend · 감사)                                                      | 「NEXIA 플랫폼」표현 **금지** (제품 전체 지칭 시) |
| **M.O.S.E.S.**  | **Meta-Operating System for Engineering & Synthesis** — **시스템을 만들기 위한 시스템**. Spec → Generate → Execute 메타 레이어 | 최종 **사용자 앱**이 아님                         |
| **NEXIA**       | NEXA 플랫폼 **내부 도메인 하나** (`domainKey: nexia`) — 7탭 · Omnix 허브 · **핵심 지능**                                       | 플랫폼 **전체 ≠ NEXIA**                           |
| **NEXA OS**     | 플랫폼 **거버넌스** — Grade×Ingress · Normex MUST · 감사 규칙 (V2.1)                                                           | 메타 OS(M.O.S.E.S.)와 혼동 금지                   |

**NEXIA 7탭 (`tabId` SSOT):** Omnix · Normex · Logex · Scribx · Vivex · Twinex · Navex

### 1.2 규범 · 게이트

| 용어                      | 정의                                                                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Normex (탭)**           | NEXIA 7탭 중 **Norm(규범) + `-ex`** — 정책·가드레일·인터랙티브 시방서 (TipTap·Yjs)                                                                |
| **Normex (이행 표준)**    | [`M.O.S.E.S. 기술 이행 표준`](<./M.O.S.E.S. 기술 이행 표준 (Normex & Standard).md>) — MUST/SHOULD **How(구현 정답지)**. 위반 시 Merge·런타임 차단 |
| **Prompt Shell**          | Rivet·LLM **입구 템플릿** — 형식·금지·MUST. **OAG 아님** (게이트)                                                                                 |
| **CP (Human Checkpoint)** | 파이프라인 **인간 승인** 지점 — **Aux-Human** 서브그래프                                                                                          |
| **CP-02**                 | **`docs/specs/`** 디스크 반영·기획 승인 (NEXAON·05 직전/직후)                                                                                      |
| **CP-06**                 | **Zod Contract** 승인                                                                                                                             |
| **CP-12**                 | **JOUT** — 검증된 코드·스키마 **디스크 쓰기** 최종 승인                                                                                           |
| **JOUT (Sub_12)**         | Sub_12_FileSystem_Write — atomic write · `written_paths[]`                                                                                        |

### 1.3 AXON · 경계

| 용어             | 풀네임 / 역할                                                                                  |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| **NEXA HEXAGON** | 5W1H **6축 정수 토큰** — 백오피스(지식·RAG) ↔ 피지컬 AI(IoT·ACTON) **경계 프로토콜**          |
| **NEXAON**       | **NEXA Ontology** — Human↔AI **온톨로지 해석·검수** (웹 NEXAON 뷰어·Yjs 초안) |
| **KORE**         | **Knowledge Origin and Retrieval Engine** — 백오피스 **지식(데이터) 허브** (origin · retention · retrieval). **원시 + 가공** (로그·FACT·Seed·벡터·Asset·승인 기록) 적재 · 순환 정교화 · `programRef` 본문(KORE/Asset). **≠** 온톨로지 SSOT · **≠** RAG(검색). 구현: `project_knowledge` · pgvector 등 |
| **ACTON**        | **Active Transition & Operation** — 디지털 의도 → **물리 실행** (Rule·Reflex·엣지)             |
| **ACTON-GM**     | ACTON **G/M 브릿지** — 엑추에이터 구체 명령 · KORE `programRef`                                |

> IoT 제어는 **HEXAGON·Rule·ACTON** 만 — 벡터·JSONB 온톨로지·RAG **직결 금지**.

```text
[NEXAON → KORE → RAG]
  NEXAON  Human↔AI 해석·검수 (프로세스)
  KORE    지식(데이터) 허브 — 적재·보관·재사용 (원시 + 가공)
  RAG     KORE/pgvector 위 검색·인용 (허브 ≠ 검색 엔진)
```

> **KORE 범위:** 백오피스에서 **다시 꺼내 쓰도록** DB·Asset·로그에 남기는 지식. **포함 ✗:** `docs/specs/` Git SSOT · Yjs 세션 초안(CP 전) · IoT 실시간 패킷.

### 1.4 Rivet · Desktop 파이프라인

| 용어                  | 정의                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Main Orchestrator** | Desktop **지휘 그래프** — Sub_01→13 순차 · LLM 없음 · Aux-Log/Human 호출                                           |
| **01~14 Subroutine**  | Desktop **서브 캔버스(Graph)** — `.rivet` 탭 1:1. **01~13** = Main 체인 · **14** = Health( **Main 미호출** · 수동) |
| **01 Inbox Scanner**  | `docs/inbox/**` 스캔 (「01=스캔」만으로 축약하지 말 것 — **inbox 인벤토리**)                                       |
| **02~05**             | 정제 → 청크 → **04 Conflict MOC** → **05 specs MD** (온톨로지·OAG 정본 구간)                                       |
| **06~13**             | Zod → 검증 → Prisma/Pydantic/Nest DTO → **JOUT** → Git                                                             |
| **Aux-Log**           | `pipeline.log.jsonl` — Run 단계 감사                                                                               |
| **Aux-Human**         | CP-02 · CP-06 · CP-12 · User Input                                                                                 |

---

## 2. 지능 층위 · RAG · 온톨로지

| 약어       | 정식 명칭                         | 한 줄                                                      |
| ---------- | --------------------------------- | ---------------------------------------------------------- |
| **RAG**    | Retrieval-Augmented Generation    | 코퍼스에서 **근거 청크** 검색 후 생성                      |
| **OG-RAG** | **Ontology-Grounded RAG**         | 벡터 위 **2차 관계도**(MOC·wikilink·`ref_ids`)로 grounding |
| **OAG**    | **Ontology-Augmented Generation** | 구조·계획으로 **생성 보강** — 05 specs · NEXAON             |
| **AIP**    | AI Orchestration (Platform)       | **rivet-core** + **LangGraph** — 실행·감사                 |

```text
RAG → OG-RAG → OAG → AIP
         ↑ Normex · Zod · Prompt Shell = 게이트 (OAG 아님)
```

| 용어                   | 정의                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------- |
| **코퍼스 (Corpus)**    | RAG 검색 대상 — **설계:** `docs/specs/` · **운영:** `project_knowledge`(pgvector, **KORE 허브**)   |
| **MOC**                | Map of Content — Obsidian **허브 노트** (`conflict-report` · `health-report`)       |
| **wikilink**           | `[[specs/...]]` — Vault 상대경로 · Graph 엣지 SSOT                                  |
| **`ref_ids`**          | 청크→specs·log **역추적** JSONB 키 (본문 아님)                                      |
| **citations[]**        | RAG 응답 **필수 인용** — specs 경로 · `project_knowledge.id`                        |
| **AI 온톨로지 (환각)** | Extract JSON·자동 그래프 **초안** — CP·Git 없이 SSOT/실행에 쓰면 **독**             |
| **GraphRAG**           | 업계 프레임(엔티티·커뮤니티 자동 추출) — NEXA **OG-RAG와 별개** (wikilink+MOC 채택) |

---

## 3. SSOT · 데이터 · 협업

| 용어                              | NEXA에서의 의미                                                                                                 |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **SSOT**                          | Single Source of Truth — **진실 우선:** Git `docs/specs/` > Zod > DDL 고정 컬럼 > `ref_ids` >> `metadata` JSONB |
| **JSONB**                         | PostgreSQL JSON 컬럼 — **보조 주머니만**. 핵심·검색·규범 값은 **컬럼·MD·Zod**                                   |
| **Zod**                           | `packages/shared` — API·Rivet I/O **형식** 검증. **의미 진실**은 specs+Human                                    |
| **Prisma**                        | `apps/backend/prisma` — PostgreSQL ORM. **web에서 Client 직접 사용 금지**                                       |
| **`packages/shared` (`@shared`)** | web · backend · sync **공통 Zod·commands·Yjs map-keys**                                                         |
| **Yjs**                           | CRDT — 실시간 협업 **Y.Doc**                                                                                    |
| **Hocuspocus**                    | `apps/sync` — Yjs **WebSocket** 서버 (Nest **프로세스 분리** · Nest 내장 금지)                                  |
| **`project_yjs_updates`**         | Yjs **증분** BYTEA 이력 — 단일 컬럼 덮어쓰기 금지                                                               |
| **pgvector**                      | PostgreSQL 벡터 확장 — **검색 가속** (블랙박스 SSOT 아님)                                                       |
| **`nomic-embed-text`**            | 임베딩 모델 SSOT (768) — agent-graph **`embedder` in-process** · Ollama Embed **✗** · Chat LLM과 **별도** |
| **Monorepo**                      | `apps/web` · `apps/backend` · `apps/sync` · `packages/shared` 한 저장소                                         |
| **5W1H / `nature_tag`**           | RAG·SQL 필터 축 — HEXAGON과 연계                                                                                |

---

## 4. Rivet · 외부 도구

| 용어                     | 정의                                                                                           |
| ------------------------ | ---------------------------------------------------------------------------------------------- |
| **Ironclad Rivet**       | 노드·엣지 **시각 그래프**로 AI 파이프라인 고정 — Ironclad 제품                                 |
| **Desktop Rivet**        | PC 설치형 — Sub_01~14 **설계** · MCP FileSystem · `docs/` **일방통행** 배치                    |
| **Embedded Rivet**       | `@ironclad/rivet-node` (**rivet-core**) — NestJS **런타임** · `.rivet-project` Contract만 로드 |
| **Rivet Graph Contract** | `projects/{id}/logic/*.rivet-project` — 프로젝트별 **실행 SSOT**                               |
| **MCP**                  | Model Context Protocol — AI→**파일·GitHub·Get Prompt** 안전 접근                               |
| **Ollama**               | **dev** 로컬 LLM — agent-graph **`LLM_BACKEND=ollama`** · Nest 경유만 (브라우저 직접 ✗) |
| **vLLM**                 | **prod** 추론 서버(권장) — agent-graph **`LLM_BACKEND=vllm`** · OpenAI-compatible `/v1` · Nest/rivet **무변경** |
| **LangGraph**            | AIP **에이전트 라우팅** — Omnix·탭 위임 (플랫폼 뼈대 **교체 아님**)                            |
| **Hermes 3**             | Desktop Sub **Chat 페르소나·모델 후보** 중 하나 — **플랫폼 LLM SSOT 단일 모델 아님**           |
| **Obsidian**             | Vault=`docs/` — **Graph View**로 MOC·wikilink 시각화 (04·14 산출)                              |
| **React Flow**           | `@xyflow/react` — NEXIA·NEXAON **웹 그래프 UI** (To-Be)                                         |
| **Dagre**                | 그래프 **자동 레이아웃** — AI는 토폴로지만, x,y는 프론트                                       |
| **TipTap**               | 리치 텍스트 · `y-prosemirror` — Normex·specs 미리보기                                          |
| **BullMQ**               | Redis 작업 큐 — Embed_Pipeline · ingest · Chokidar 후처리                                      |
| **PostgreSQL**           | 운영 DB — pgvector · Yjs 영속 · `project_knowledge`                                            |

### 4.1 대표 Rivet 그래프 ID (웹)

| 그래프                            | 층         | 용도                        |
| --------------------------------- | ---------- | --------------------------- |
| `Embed_Pipeline`                  | RAG        | 청크 임베딩 → pgvector      |
| `RAG_Retrieve`                    | RAG+OG-RAG | 검색 · ref_ids · citations  |
| `NEXAON_Ingest` / `NEXAON_Refine`   | OG-RAG     | Yjs 초안 · 관계 분석 (가칭) |
| `HEXAGON_Route` / `ACTON_Execute` | AIP        | IoT — **Vector Store 없음** |

---

## 5. 흔한 혼동 · 정정

| 잘못 쓰기               | 정본                                                         |
| ----------------------- | ------------------------------------------------------------ |
| Normex = OAG            | Normex·Zod·Prompt Shell = **게이트** · OAG = 05 specs 구조화 |
| OG-RAG = GraphRAG       | NEXA OG-RAG = **wikilink + 04/14 MOC + ref_ids**             |
| Rivet Core = Desktop    | **Desktop**=설계 · **Embedded Rivet**=웹 실행                |
| AI JSON = 온톨로지 SSOT | 정본 = **`docs/specs/` MD + Git**                            |
| pgvector = 진실         | pgvector = **KORE 가속 저장** · 진실 = specs + ref_ids                 |
| KORE = RAG·벡터 검색      | KORE = **허브(적재·보관)** · **RAG** = 허브 위 검색·인용                 |
| KORE = 온톨로지           | 온톨로지 SSOT = **`docs/specs/` + wikilink** · KORE = **적재·재사용**    |
| KORE = NEXAON 산출만      | NEXAON·Embed·ACTON FACT 등 **여러 경로**로 허브에 유입                   |
| Hermes = 유일 LLM       | Chat 후보 중 하나 · 임베딩 SSOT = **nomic-embed-text**       |
| 01 Sub = 「스캔」만     | **01=Inbox 인벤토리** · 02=정제 · 03=청크 …                  |
| Yjs = Hocuspocus        | Yjs=CRDT 라이브러리 · Hocuspocus=**WS 서버**                 |
| 14 Sub = Main 체인      | **14=Health** · Main **미호출** · 수동 진단                  |

---

## 관련 문서

| 주제        | 문서                                                                             |
| ----------- | -------------------------------------------------------------------------------- |
| 지능 층위   | [`RAG · OAG · AIP`](<./RAG · OAG · AIP — 지능 층위와 오케스트레이션.md>)         |
| RAG 구현    | [`NEXA RAG 아키텍처`](<./NEXA RAG 아키텍처 — Rivet·PostgreSQL·Ollama.md>)        |
| Desktop Sub | [`Desktop Rivet 캔버스 설계 v1.0`](<./Desktop Rivet 캔버스(Graph) 설계 v1.0.md>) |
| NEXAON 툴    | [`온톨로지 관리 툴`](<./리벳(Rivet) 중심의 '온톨로지 관리 툴 개발.md>)           |
| Yjs         | [`Yjs·Hocuspocus SSOT`](<../../AI/00_[AIS] Yjs·Hocuspocus 협업 SSOT.md>)         |
| NEXIA 탭    | [`NEXIA 00`](<../../Nexia/00 인공지능 NEXIA 구조와 기술 스택과 운영방침.md>)     |
