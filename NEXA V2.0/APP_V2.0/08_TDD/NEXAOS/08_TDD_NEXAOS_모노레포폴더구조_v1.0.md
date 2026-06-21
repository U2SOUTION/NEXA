---
implements_doc: 
see_also: [TDD-008, TDD-071, TDD-075]
doc_id: TDD-007
title: "NEXA-Platform 모노레포 폴더 구조 v1.0"
category: "08_TDD"
domain: NEXAOS
status: published
created: 2026-06-10
updated: 2026-06-16
relocated_from: "08_TDD/LangGraph/08_TDD_LangGraph_모노레포폴더구조_v1.0.md"
parent_doc: TDD-001
terms_standard: ["langgraph", "react-flow", "yjs", "hocuspocus", "nestjs", "next-js", "zod", "neo4j", "fastapi", "sse", "shacl", "esphome"]
terms_nexa: ["nexia", "agent-graph", "NexaonShell", "GraphCanvas", "ExplorerTree", "packages-shared", "approval-gate", "ontology-draft", "tabonto"]
tags: ["doc/cat/08-tdd", "doc/domain/nexaos", "std/langgraph", "std/react-flow", "std/yjs", "std/hocuspocus", "std/nestjs", "std/next-js", "std/zod", "std/neo4j", "std/fastapi", "std/sse", "std/shacl", "std/esphome", "nexa/nexia", "nexa/agent-graph", "nexa/NexaonShell", "nexa/GraphCanvas", "nexa/ExplorerTree", "nexa/packages-shared", "nexa/approval-gate", "nexa/ontology-draft", "nexa/tabonto"]
---

# NEXA-Platform 모노레포 폴더 구조

> [!note] **문서 위치 (2026-06-16)**
> **TDD-007** 정본은 **`08_TDD/NEXAOS/`** 입니다. 구 경로 `08_TDD/NEXAOS/08_TDD_NEXAOS_모노레포폴더구조_v1.0.md` 는 **리다이렉트**만 유지합니다.

> **범위:** **NEXA-Platform** `pnpm-workspace` 전체 — `web` · `backend` · `sync` · **`agent-graph`** · `packages/shared` · **TabOnto SDK** · (선택) Extension package.  
> **온톨로지 수직 스택:** LangGraph + React Flow + Yjs · IoT · SHACL · Neo4j · ESPHome. UI `domainKey` = **`nexia`** · Nexaon = `domains/nexia/modules/nexaon/`.
> **상위 SSOT:** [`인간-LLM 협업형 IoT 온톨로지 플랫폼`](../LangGraph/08_TDD_LangGraph_인간LLM협업형IoT온톨로지플랫폼_v1.0.md) · [`핵심 기술 스택`](../LangGraph/08_TDD_IoT온톨로지AI협력플랫폼_핵심기술스택_v1.0.md) · [`도메인 구조 통합 (TDD-071)`](./08_TDD_NEXAOS_도메인구조통합_v1.0.md)
> **UI 연계:** [`07_UIUX NEXIA MainShell 레이아웃`](../../07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md) · NEXA-Platform `docs/NEXA OS/`

---

## 1. 한 줄 요약

NEXA OS V2.1 **4 앱 + shared** 모노레포 위에 **`apps/agent-graph`(Python LangGraph)** 를 추가하고, **nexia UI · Nest 중계 · Hocuspocus · Zod 계약**을 **경로로 고정**한다. **AIP(오케스트레이션·LLM·SSE·Embed) SSOT = `apps/agent-graph` 단일** — Nest 는 인증·승인·프록시·DB 만 담당한다.

---

## 2. V2.1 대비 확장 원칙

| #     | 원칙                   | 구현                                                                                           |
| ----- | -------------------- | -------------------------------------------------------------------------------------------- |
| **①** | **Hocuspocus 독립**    | `apps/sync/` — Nest 에 WS **금지** (V2.1 동일)                                                    |
| **②** | **Yjs ↔ UI 직결**      | React Flow · TipTap → Yjs **양방향**. Telemetry 차트 → `useYjsSync` **observe 만** (V2.1 동일)       |
| **③** | **4 앱 + shared**     | `web` · `backend` · `sync` · **`agent-graph`** + `packages/shared`                           |
| **④** | **LLM·Streaming 단일** | Chat · Extract · RAG · SSE = **`agent-graph` 만**. 브라우저·Nest → Ollama/vLLM **직접 ✗**           |
| **⑤** | **Embed 단일**         | `/v1/embed` → `agent-graph` **`embedder`** in-process — Ollama Embed API **✗**               |
| **⑥** | **그래프 SSOT**         | LangGraph `StateGraph` = `apps/agent-graph/src/agent_graph/graphs/` — **JSON Export 중간층 없음** |
| **⑦** | **Neo4j 격리**         | `neo4j-driver` = **`backend/modules/ontology/`** only — Prisma **✗**                         |

```text
pnpm-workspace (NEXA-Platform/)
├── apps/web              → Next.js · nexia (Nexaon React Flow UI)
├── apps/backend          → NestJS · nexaon · ontology · agent-graph proxy
├── apps/sync             → Hocuspocus · ontology:draft CRDT
├── apps/agent-graph      → FastAPI + LangGraph · LLM · embedder · SSE
├── packages/shared       → Zod · nexaon · agent-graph · Yjs map-keys
├── database/             → Prisma · pgvector
├── firmware/esphome/     → 승인 YAML · OTA 산출물 (선택)
└── docs/                 → specs SSOT · LangGraph/ 기획 (비배포)
```

---

## 3. Git 루트 트리 (범례)

| 기호  | 의미                            |
| ----- | ------------------------------- |
| **◆** | `packages/shared` — TS·Zod SSOT |
| **▲** | 배포·CI Docker context          |
| **★** | Nexaon · 온톨로지 플랫폼 핵심   |
| **■** | 메타·비배포 (설계서·inbox)      |

```text
NEXA/                                         # Git 루트
│
├── packages/                                 ◆ 공유
│   └── shared/src/
│       ├── schemas/
│       │   ├── nexaon/                       ★ ontology-node · draft · conflict · citation
│       │   │   ├── ontology-node.schema.ts
│       │   │   ├── draft-snapshot.schema.ts
│       │   │   ├── conflict-report.schema.ts
│       │   │   ├── approval-gate.schema.ts   # 승인 A/B/C
│       │   │   └── shacl-event.schema.ts     # SSE shacl_violation · highlight
│       │   ├── agent-graph/                  ★ RunRequest/Response · graph I/O
│       │   │   ├── run-request.schema.ts
│       │   │   ├── run-response.schema.ts
│       │   │   ├── sse-event.schema.ts
│       │   │   └── embed-request.schema.ts
│       │   └── dtos/                         # REST · SSE envelope (V2.1 공통)
│       ├── yjs/
│       │   ├── map-keys.ts
│       │   └── nexaon.keys.ts                ★ ontology:draft · run:timeline
│       ├── commands/
│       │   └── nexaon-approval.command.ts    # Human 승인 · CP-02 연계
│       └── openapi/
│           └── openapi.json                  # Nest export · agent-graph OpenAPI sync
│
├── NEXA-Platform/                            ▲ 제품 루트
│   ├── pnpm-workspace.yaml
│   ├── docker-compose.yml                    # profiles: core · ontology · iot · full
│   ├── package.json
│   │
│   ├── database/
│   │   ├── schema.prisma                     # Yjs · Draft · Audit · project_knowledge(pgvector)
│   │   └── docker/                           # Postgres + pgvector · (선택 Neo4j compose)
│   │
│   ├── scripts/
│   │   ├── dev.ps1 · dev.sh                  # web + backend + sync + agent-graph
│   │   ├── export-openapi.ts
│   │   └── esphome/                          # build · validate · OTA pack (선택)
│   │
│   ├── apps/
│   │   │
│   │   ├── web/                              # Next.js — V2.1 frame/ · domains/ 골격 유지
│   │   │   └── src/
│   │   │       ├── frame/                    # MainShellLayout · domainLayoutRegistry (V2.1)
│   │   │       ├── domains/nexia/
│   │   │       │   ├── tabs/logex/           ★ Nexaon 진입 — Logex → ontology 서브모드
│   │   │       │   │   └── NexaonEntry.tsx
│   │   │       │   └── modules/nexaon/       ★ UI·상태 (domainKey: nexia 유지)
│   │   │       │       ├── views/
│   │   │       │       │   ├── GraphCanvas.tsx       # React Flow · IoT 노드·핀맵
│   │   │       │       │   ├── SpecsPreview.tsx      # TipTap · Normex 미리보기
│   │   │       │       │   ├── RunPanel.tsx          # LangGraph Run · SSE 타임라인
│   │   │       │       │   ├── DiffOverlay.tsx       # AI 제안 · SHACL highlight
│   │   │       │       │   └── EsphomeDeploy.tsx     # YAML preview · OTA · Web Serial
│   │   │       │       ├── panels/
│   │   │       │       │   ├── ExplorerTree.tsx
│   │   │       │       │   ├── ApprovalGatePanel.tsx # 승인 A/B/C
│   │   │       │       │   └── ShaclViolationsPanel.tsx
│   │   │       │       ├── hooks/
│   │   │       │       │   ├── useNexaonYjs.ts
│   │   │       │       │   ├── useNexaonRun.ts       # SSE · run_id
│   │   │       │       │   ├── useNexaonGraph.ts     # React Flow ↔ Yjs
│   │   │       │       │   └── useNexaonWikilink.ts
│   │   │       │       └── store/
│   │   │       │           └── useNexaonStore.ts
│   │   │       ├── engines/
│   │   │       │   ├── react-flow/           ★ nexaon node types · Dagre layout
│   │   │       │   │   ├── nodeTypes/
│   │   │       │   │   ├── edgeTypes/
│   │   │       │   │   └── layout/dagreLayout.ts
│   │   │       │   ├── tiptap/
│   │   │       │   ├── hocuspocus/
│   │   │       │   │   └── useOntologyRoom.ts
│   │   │       │   ├── web-serial.ts         ★ ESP32 USB 플래싱
│   │   │       │   └── api-client.ts
│   │   │       └── system/api/
│   │   │           └── nexaonClient.ts         # Nest REST · Run 시작
│   │   │
│   │   ├── backend/                          # NestJS — Hocuspocus 임베드 ✗
│   │   │   ├── prisma/
│   │   │   └── src/modules/
│   │   │       ├── auth/                     # JWT — sync onAuthenticate
│   │   │       ├── agent-graph/              ★ HTTP 클라이언트 · run_id · SSE relay
│   │   │       │   ├── agent-graph.module.ts
│   │   │       │   ├── agent-graph.client.ts
│   │   │       │   ├── runs.controller.ts    # POST /nexaon/runs · SSE /nexaon/runs/:id/stream
│   │   │       │   └── embed.controller.ts   # POST /v1/embed → agent-graph proxy
│   │   │       ├── nexaon/                   ★ Yjs debounce · 승인 · Draft/Audit
│   │   │       │   ├── nexaon.module.ts
│   │   │       │   ├── nexaon.controller.ts
│   │   │       │   ├── nexaon-yjs.service.ts
│   │   │       │   ├── approval-gate.service.ts
│   │   │       │   └── nexaon-graph.sync.ts  # Yjs delta → ontology draft MERGE 트리거
│   │   │       ├── ontology/                 ★ Neo4j driver · promoted upsert
│   │   │       │   ├── ontology.module.ts
│   │   │       │   ├── neo4j.service.ts
│   │   │       │   ├── cypher/
│   │   │       │   │   ├── draft-merge.cypher
│   │   │       │   │   └── promoted-upsert.cypher
│   │   │       │   └── ttl-export.job.ts     # SHACL PASS 후 TTL 버퍼 (선택)
│   │   │       ├── specs/                    # DOCS_VAULT_ROOT → docs/specs 읽기
│   │   │       ├── knowledge/                # NEXAVULT · pgvector · embed job
│   │   │       │   ├── knowledge.module.ts
│   │   │       │   └── embed-pipeline.service.ts
│   │   │       ├── esphome/                  ★ (선택) YAML build · OTA artifact
│   │   │       │   └── esphome-compose.job.ts
│   │   │       └── jobs/                     # project_jobs · audit
│   │   │
│   │   ├── agent-graph/                      ★ Python — 별 프로세스 · 별 Dockerfile
│   │   │   ├── pyproject.toml
│   │   │   ├── Dockerfile
│   │   │   └── src/agent_graph/
│   │   │       ├── main.py                   # FastAPI · health
│   │   │       ├── api/routes/
│   │   │       │   ├── runs.py               # POST /v1/runs/{graph_id}
│   │   │       │   ├── stream.py             # GET /v1/runs/{run_id}/stream (SSE)
│   │   │       │   └── embed.py              # POST /v1/embed
│   │   │       ├── graphs/                   ★ StateGraph 정의 (레지스트리 SSOT)
│   │   │       │   ├── registry.yaml         # graph_id · entry · max_steps
│   │   │       │   ├── nexaon_ingest.py
│   │   │       │   ├── nexaon_refine.py
│   │   │       │   ├── nexaon_export.py      # SHACL gate · TTL buffer
│   │   │       │   ├── rag_retrieve.py
│   │   │       │   └── esphome_compose.py
│   │   │       ├── nodes/
│   │   │       │   ├── chunk_normalize.py
│   │   │       │   ├── relation_extract.py
│   │   │       │   ├── shacl_validate.py     # PASS | BAD
│   │   │       │   ├── query_rewrite.py      # BAD 루프 (max N)
│   │   │       │   ├── ttl_export.py
│   │   │       │   ├── pgvector_retrieve.py
│   │   │       │   └── esphome_template.py
│   │   │       ├── adapters/
│   │   │       │   ├── llm/
│   │   │       │   │   ├── base.py
│   │   │       │   │   ├── ollama.py         # dev
│   │   │       │   │   ├── vllm.py           # prod
│   │   │       │   │   └── factory.py        # LLM_BACKEND
│   │   │       │   ├── embedder.py           # nomic-embed-text in-process
│   │   │       │   ├── specs_reader.py
│   │   │       │   └── neo4j_read.py         # read-only Cypher (Nest 위임 권장)
│   │   │       └── prompts/                  # graph별 Jinja · system 템플릿
│   │   │           ├── nexaon_ingest/
│   │   │           ├── nexaon_export/
│   │   │           └── esphome_compose/
│   │   │
│   │   └── sync/                             # Hocuspocus (V2.1 동일)
│   │       └── src/
│   │           ├── server.ts
│   │           ├── extensions/
│   │           │   ├── authenticate.ts
│   │           │   ├── persistence.ts
│   │           │   └── yjs-schema-guard.ts
│   │           └── rooms/
│   │               └── ontologyRoomName.ts   ★ project:{id}:ontology:draft
│   │
│   ├── projects/{projectId}/                 ▲ 프로젝트별 런타임 산출 (Git 또는 DB)
│   │   ├── prompts/                          # 프로젝트 커스텀 프롬프트 (선택)
│   │   ├── ontology/
│   │   │   ├── draft/                        # JSONB 미러 export (선택)
│   │   │   └── promoted/                     # TTL 스냅샷 (SHACL PASS)
│   │   ├── esphome/
│   │   │   ├── generated/                    # esphome_compose 출력
│   │   │   └── builds/                       # compile 산출 · OTA bin
│   │   └── runs/{run_id}/                    ■ 감사 — 운영 SSOT는 DB (선택 미러)
│   │
│   ├── firmware/
│   │   └── esphome/                          # 공통 보드 템플릿 · include
│   │
│   └── docs/
│       ├── inbox/ · refined/ · trash/        ■ 비배포
│       ├── specs/                            △ Production 포함 (OAG SSOT)
│       │   ├── project-core/
│       │   ├── requirements/
│       │   └── ontology/                     ★ OWL · SHACL shapes · SKOS
│       ├── .nexaon/                          △ OG-RAG MOC · wikilink · conflict JSON
│       │   └── conflicts/{run_id}/
│       └── NEXA OS/LangGraph/                ■ 기획·아키텍처 (본 문서 등)
│
└── NEXA-Edge/                                ▲ 별 이미지 — HEXAGON·ACTON only (온톨로지 UI ✗)
```

---

## 4. 4 단계 저장소 ↔ 경로 매핑

| 단계           | 저장                   | Prisma / DB                       | 코드 경로                                      |
| -------------- | ---------------------- | --------------------------------- | ---------------------------------------------- |
| **① 실시간**   | Yjs CRDT               | `project_yjs_updates` (BYTEA)     | `apps/sync` persistence · `nexaon-yjs.service` |
| **② Draft**    | LangGraph Extract JSON | `project_ontology_drafts` (JSONB) | `agent-graph` → Nest persist                   |
| **③ Audit**    | Human 승인 스냅샷      | `project_ontology_audits`         | `approval-gate.service`                        |
| **④ Promoted** | Neo4j 그래프           | Neo4j (Prisma ✗)                  | `ontology/neo4j.service` · SHACL PASS 후       |

---

## 5. LangGraph 그래프 레지스트리 (`registry.yaml`)

그래프 정의는 **Python `graphs/`** 에 두고, 메타는 YAML 로 고정한다.

```yaml
# apps/agent-graph/src/agent_graph/graphs/registry.yaml (예시)
graphs:
  nexaon_ingest:
    module: nexaon_ingest
    entry: build_graph
    max_steps: 32
  nexaon_refine:
    module: nexaon_refine
    entry: build_graph
    max_steps: 48
  nexaon_export:
    module: nexaon_export
    entry: build_graph
    max_steps: 64
    gates: [shacl_pass]
  rag_retrieve:
    module: rag_retrieve
    entry: build_graph
    max_steps: 16
  esphome_compose:
    module: esphome_compose
    entry: build_graph
    max_steps: 24
    gates: [human_approval_c]
```

Nest `POST /nexaon/runs` body 의 `graph_id` 는 **이 레지스트리 키와 1:1**.

---

## 6. Import · 프로세스 경계

| 허용                                                          | 금지                                     |
| ------------------------------------------------------------- | ---------------------------------------- |
| `apps/web` → `@nexa/shared`                                   | `apps/web` → `@prisma/client`            |
| `apps/web/modules/nexaon` → `engines/react-flow`              | `engines/` → `domains/` 역참조           |
| `apps/backend` → `@nexa/shared` · `neo4j-driver`              | `apps/sync` → NestJS import              |
| `backend/modules/agent-graph` → agent-graph **HTTP/SSE only** | `agent-graph` → Prisma **직접** (기본)   |
| `backend/modules/nexaon` → `ontology` (draft sync)            | 브라우저 → Ollama · agent-graph **직접** |
| `backend/modules/ontology` → Neo4j read/write                 | Neo4j 를 Prisma 로 접근                    |
| Nest `/v1/embed` → agent-graph                                | Nest · web → Ollama **`/api/embed`**     |

```text
[Browser]
   ├── WS ──► apps/sync (Hocuspocus :1234)
   ├── REST ─► apps/backend (:3001)
   │              ├── agent-graph HTTP/SSE (:8100)
   │              ├── Neo4j (promoted)
   │              └── Prisma (Yjs · Draft · pgvector)
   └── Web Serial ─► ESP32 (로컬만)

apps/agent-graph ──► LLM adapter (Ollama dev | vLLM prod)
                  └── embedder (in-process)
```

---

## 7. `docs/` 배포 매트릭스

| 경로                                        | Production 이미지 | 비고                       |
| ------------------------------------------- | ----------------- | -------------------------- |
| `docs/inbox` · `refined` · `trash`          | **제외**          | 메타                       |
| `docs/NEXA OS/` · `docs/NEXA OS/LangGraph/` | **제외**          | 기획서                     |
| **`docs/specs/**`\*\*                       | **포함** (기본)   | OAG · OWL · SHACL shapes   |
| **`docs/.nexaon/conflicts/**`\*\*           | **포함** (기본)   | OG-RAG MOC · wikilink JSON |
| `projects/*/runs/`                          | **제외** (기본)   | `project_jobs` · audit DB  |

---

## 8. Docker · 로컬 dev (포트)

| 프로세스            | 패키지        | 포트 (예)          |
| ------------------- | ------------- | ------------------ |
| `apps/web`          | pnpm          | `:3000`            |
| `apps/backend`      | pnpm          | `:3001`            |
| `apps/sync`         | pnpm          | `:1234` (WS)       |
| `apps/agent-graph`  | uv/pip        | `:8100`            |
| `packages/shared`   | pnpm build    | —                  |
| Postgres + pgvector | docker        | `:5432`            |
| Neo4j               | docker (선택) | `:7687`            |
| Ollama / vLLM       | docker (선택) | `:11434` / `:8000` |

```text
# scripts/dev.sh 요약
pnpm --filter @nexa/shared build
pnpm --filter @nexa/backend dev &
pnpm --filter @nexa/sync dev &
uv run --project apps/agent-graph uvicorn agent_graph.main:app --port 8100 &
pnpm --filter @nexa/web dev
```

**agent-graph 컨테이너:** Nest **내부망만** 노출 · `LLM_BACKEND` · `EMBED_MODEL` env · prod 는 vLLM sidecar 권장.

---

## 9. 경로 ↔ 지능 층

| 경로                                    | 역할                     | 층                                 |
| --------------------------------------- | ------------------------ | ---------------------------------- |
| `docs/specs/**`                         | 정본 MD · OWL · SHACL    | **OAG**                            |
| `docs/.nexaon/conflicts/`               | MOC · wikilink           | **OG-RAG**                         |
| `packages/shared/.../nexaon/`           | Zod · 승인 게이트        | **게이트**                         |
| `domains/nexia/modules/nexaon/`         | Human↔AI UI             | **Nexaon** (ontology 서브모드)     |
| `backend/modules/knowledge/`            | pgvector · NEXAVULT      | **RAG** (제어 직결 ✗)              |
| `apps/agent-graph/graphs/`              | StateGraph · SHACL · SSE | **AIP**                            |
| `backend/modules/ontology/`             | Neo4j promoted           | **운영 그래프** (normative SSOT ✗) |
| `firmware/esphome/` · `esphome/` module | YAML · OTA               | **IoT 배포**                       |
| `NEXA-Edge/`                            | HEXAGON · ACTON          | **실행** (AXON)                    |

---

## 10. Zod · OpenAPI 전파

V2.1 과 동일 — **`packages/shared/src/schemas/` 단일 SSOT**.

```text
packages/shared/schemas/
    nexaon/*  +  agent-graph/*  +  tabonto/*     ◆ EXTEND TabOnto (Phase 2+)
              │
              ├──► apps/web (parseApiResponse · parseSseEvent)
              ├──► apps/backend (ZodValidationPipe)
              ├──► apps/sync (yjs-schema-guard)
              └──► export-openapi.ts → agent-graph Pydantic sync (선택)
```

**TabOnto `schemas/tabonto/` (EXTEND 정본 · Phase 2+):**

| 스키마 | 역할 |
| :--- | :--- |
| `knowledge-node.schema.ts` | 용어 카드 · Edge |
| `extension-bridge.schema.ts` | WebExtensions PostMessage |
| `intellectual-signature.schema.ts` | **Intellectual Signature** · `axisSetId` · sum=100 |
| `axis-set.schema.ts` | **axisRegistry** · `tabonto-v1` keys/labels |

> 개념·카피 SSOT: [[../../EXTEND/TabOnto 지식 밸런서 · 지적 시그니처 규격]] · UI·Tab 3: [[../../EXTEND/TabOnto 브라우저 SIDE Panel - 지식 자산화 파이프라인]]

- `agent-graph` Request/Response 는 **OpenAPI ↔ Zod** lineage 유지.
- Python 측 hand-edit Pydantic **금지** — codegen 또는 shared OpenAPI pull.

---

## 10.5 TabOnto SDK 3층 (UI · Core · Host Adapter)

> [!note] **개념 vs 폴더**
> **SDK = `sdk/` 폴더 3개가 아닙니다.** 책임(UI · Core · Host Adapter)을 나누는 **설계 레이어**이며, 실제 경로는 아래 트리·표가 SSOT입니다.  
> 제품·호스트 관점 설명 → [[../../EXTEND/TabOnto 브라우저 대시보드 및 사이드바 키워드 자산 허브#TabOnto SDK 3층 (UI · Core · Host Adapter)]].

| 층 | 한 줄 | 호스트 무관? | TabOnto 경로 (Greenfield) |
| :--- | :--- | :---: | :--- |
| **Core** | 스키마 · API 계약 · 집계 규칙 · 클라이언트 타입 | ⭕ | `packages/shared/src/schemas/tabonto/` · `packages/shared/src/tabonto/` · `apps/backend/src/modules/tabonto/` |
| **UI** | 화면 · 위젯 · embed shell — **호스트마다 shell 분리 가능** | △ | `apps/web/src/domains/tabonto/` · `apps/web/src/app/(embed)/tabonto/` · package `newtab/` · `sidepanel/` *(껍데기)* |
| **Host Adapter** | 브라우저·OS·iframe 차이 흡수 — **인터페이스 1 · 구현은 IF 또는 파일 분리** | ✗ | `packages/shared/src/tabonto/host/` · `NEXA-TabOnto-package/{content,background,shared,host}/` |

> [!important] **`agent-graph/adapters/` 와 혼동 ✗**
> `apps/agent-graph/.../adapters/` = **LLM·Embed 백엔드** 전용. TabOnto 호스트 어댑터는 **`tabonto/host/`** 접두.

```text
                    ┌──────────── UI (표면 · 여러 shell) ────────────┐
                    │  domains/tabonto · (embed)/tabonto           │
                    │  package: sidepanel.html · newtab.html         │
                    └────────────────────┬─────────────────────────┘
                                         │ props · REST · postMessage
                    ┌────────────────────▼─────────────────────────┐
                    │              Core (로직 · SSOT)                 │
                    │  schemas/tabonto/* · tabonto/client           │
                    │  backend/modules/tabonto · agent-graph graphs │
                    └────────────────────┬─────────────────────────┘
                                         │ HostAdapter 인터페이스
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
  extension-adapter              web-adapter (direct)            desktop-adapter (P2+)
  package/content·background     (embed ✗ · 본관)                WebView bridge
  bridge-protocol.js             createHostAdapter({ surface:'web' })
```

**Core — `packages/shared/src/tabonto/` (신규 · Phase 2+ 정본)**

```text
packages/shared/src/
├── schemas/tabonto/                    ◆ 계약 Zod (기존 §10)
│   ├── knowledge-node.schema.ts
│   ├── extension-bridge.schema.ts
│   ├── intellectual-signature.schema.ts
│   └── …
└── tabonto/                            ◆ Core 런타임 · 호스트 무관
    ├── client/
    │   └── tabonto-api.types.ts        #   · REST DTO · parse helpers
    ├── balancer/
    │   └── axis-registry.ts            #   · axisSetId · normalize (FE mirror)
    └── host/
        ├── types.ts                    #   · HostAdapter · HostCapabilities
        └── create-host-adapter.ts      #   · 팩토리 — MVP: IF 1파일 · P2+: impl 분리
```

**UI — `apps/web` + package 껍데기**

```text
apps/web/src/
├── app/(embed)/tabonto/                # iframe 전용 라우트 · frame-ancestors
│   ├── sidepanel/page.tsx
│   └── layout.tsx
└── domains/tabonto/                    # React UI · 위젯 SSOT
    ├── embed/SidepanelApp.tsx · DashboardApp.tsx
    ├── components/                     # AxisRadar · TagChips · ExportMenu
    └── hooks/                          # useIntellectualSignature · useTabontoCapture

NEXA-TabOnto-package/                   # UI shell (로컬 HTML) + Adapter (아래)
├── sidepanel/sidepanel.html            # iframe 1개 껍데기
└── newtab/newtab.html                  # Z1~Z7 로컬 Zone 스택
```

**Host Adapter — package + shared `host/`**

```text
NEXA-TabOnto-package/
├── host/capabilities.js                # side_panel vs sidebar_action
├── shared/bridge-protocol.js           # ACTIONS · isAllowedOrigin
├── content/content.js                  # DOM capture
├── background/background.js          # runtime 중계
├── sidepanel/sidepanel.js              # PostMessage 브릿지
└── newtab/newtab-bridge.js

packages/shared/src/tabonto/host/
    create-host-adapter.ts              # surface: 'extension' | 'web' | 'desktop'
```

| `HostCapabilities` *(초안)* | Extension | NEXA web | Desktop WebView *(P2+)* |
| :--- | :---: | :---: | :---: |
| `domCapture` | ⭕ | ✗ | ✗ |
| `embedMode` | `iframe` | `direct` | `webview` |
| `storage` | `chrome-local` | `session` | `native-bridge` |
| `pip` | ⭕ | ✗ | ⭕ |
| `postMessageBridge` | ⭕ | ✗ | △ |

> **진화 규칙:** 호스트는 **`createHostAdapter(config)`만** import · 내부 구현을 IF → `host/impl/extension.ts` 등으로 쪼개도 **호스트 코드 무수정** 목표.

---

## 11. 구현 기준 디렉터리 (Greenfield)

> **전제:** Next.js · NestJS · Hocuspocus · LangGraph **신규 구축** — 레거시 UI·서버 경로 **이식 대상 아님**.

| 영역              | 경로                                                           | 스택                           |
| ----------------- | -------------------------------------------------------------- | ------------------------------ |
| **nexia · Nexaon** | `apps/web/src/domains/nexia/modules/nexaon/`                   | React Flow · TipTap · Run 패널 |
| **API · 게이트**  | `apps/backend/src/modules/nexaon` · `ontology` · `agent-graph` | Nest 모듈 3 분할                |
| **AI 런타임**     | `apps/agent-graph/src/agent_graph/`                            | LangGraph · FastAPI · SSE      |
| **실시간 CRDT**   | `apps/sync/src/`                                               | Hocuspocus · `ontology:draft`  |
| **계약 SSOT**     | `packages/shared/src/schemas/nexaon/` · `agent-graph/` · **`tabonto/`** *(Phase 2+)* | Zod                            |
| **TabOnto · Core** | `packages/shared/src/tabonto/` · `apps/backend/src/modules/tabonto/` · `apps/agent-graph/.../tabonto_*.py` | §10.5 SDK **Core** 층 |
| **TabOnto · UI** | `apps/web/src/domains/tabonto/` · `(embed)/tabonto/` · package `newtab/` · `sidepanel/` | §10.5 SDK **UI** 층 |
| **TabOnto · Host Adapter** | `packages/shared/src/tabonto/host/` · `NEXA-TabOnto-package/{content,background,shared,host}/` | §10.5 SDK **Host Adapter** · `createHostAdapter` |
| **TabOnto · Balancer** | `knowledge-balancer.service.ts` · `profile.controller.ts` | Nest · **Phase 2** |
| **TabOnto · embed** | `apps/web/src/app/(embed)/tabonto/` | Next.js iframe · **AxisRadar** |
| **온톨로지 정본** | `docs/specs/ontology/`                                         | OWL · SHACL · SKOS             |
| **IoT 배포**      | `projects/{id}/esphome/` · `firmware/esphome/`                 | ESPHome · OTA                  |

---

## 12. 관련 문서

| 주제               | 문서                                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------------------------- |
| V2.1 모노레포 골격 | [`08_TDD_NEXAOS_설계표준_미션크리티컬전략`](../NEXAOS/08_TDD_NEXAOS_설계표준_미션크리티컬전략.md)        |
| 비전 · 아키텍처    | [`인간-LLM 실시간 협업형 IoT 온톨로지 플랫폼`](../LangGraph/08_TDD_LangGraph_인간LLM협업형IoT온톨로지플랫폼_v1.0.md) |
| Yjs · Hocuspocus   | [`08_TDD_AI_YjsHocuspocus협업SSOT`](../AI/08_TDD_AI_YjsHocuspocus협업SSOT.md)                               |
| RAG · NEXAVULT     | [RAG · 페르소나 아카이브 전략 (TDD-036)](../AI/08_TDD_AI_RAG페르소나아카이브전략.md) · [지식 운영체제 · API 운영정책](../Knowledge/08_TDD_Knowledge_지식운영체제_API운영정책.md) |
| AXON · HEXAGON     | [`CSIM · AXON (정본)`](../Cosmic/08_TDD_CSIM_AXON프로토콜_정본.md) |
| **TabOnto EXTEND** | [[TabOnto 지식 밸런서 · 지적 시그니처 규격]](../../EXTEND/TabOnto 지식 밸런서 · 지적 시그니처 규격.md) · [[TabOnto 브라우저 대시보드 및 사이드바 키워드 자산 허브]](../../EXTEND/TabOnto 브라우저 대시보드 및 사이드바 키워드 자산 허브.md) |

---

**결론:** NEXA-Platform은 V2.1 **3 앱 +shared**에 **`agent-graph`** 를 더한 **4+1 구조**이다. **React Flow·Yjs·Nest·LangGraph·Neo4j·ESPHome·TabOnto** 경계가 **폴더명으로 고정**되며, 그래프·프롬프트·SHACL SSOT 는 **`apps/agent-graph`** 아래에 모인다.
---

## 관련 문서

| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXA OS 설계 표준 · 미션 크리티컬 전략 (TDD-001)](../NEXAOS/08_TDD_NEXAOS_설계표준_미션크리티컬전략.md) |
| 제품 PRD | [NEXIA UI 기능 명세 — MVP Phase UI v1.0 (PRD-001)](../../05_PRD/05_PRD_NEXIA_UI기능명세_MVPPhaseUI_v1.0.md) |
| UI 레이아웃 | [NEXIA MainShell · 레이아웃 v1.0 (UIX-004)](../../07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md) |
| 온톨로지 플랫폼 | [LangGraph · 인간-LLM 협업형 IoT 온톨로지 플랫폼 (TDD-008)](../LangGraph/08_TDD_LangGraph_인간LLM협업형IoT온톨로지플랫폼_v1.0.md) |
