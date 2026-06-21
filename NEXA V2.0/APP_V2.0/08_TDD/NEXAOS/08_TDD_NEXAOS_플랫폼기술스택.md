---
implements_doc: 
see_also: []
doc_id: TDD-003
title: "NEXA OS 플랫폼 기술 스택"
category: "08_TDD"
domain: NEXAOS
status: published
created: 2026-06-10
updated: 2026-06-13
parent_doc: TDD-001
terms_standard: ["next-js", "yjs", "react-flow", "tiptap", "monaco", "nestjs", "pgvector", "neo4j", "vllm", "langgraph"]
terms_nexa: ["agent-graph", "packages-shared", "embedder", "GraphCanvas"]
tags: ["doc/cat/08-tdd", "doc/domain/nexaos", "std/next-js", "std/yjs", "std/react-flow", "std/tiptap", "std/monaco", "std/nestjs", "std/pgvector", "std/neo4j", "std/vllm", "std/langgraph", "nexa/agent-graph", "nexa/packages-shared", "nexa/embedder", "nexa/GraphCanvas"]
---

# 08\_TDD\_NEXAOS\_ 플랫폼기술스택

> **SSOT (2026-06-13):** **워크플로** = **React Flow (UI)** + **LangGraph (`apps/agent-graph`)** · **Rivet ✗**
> **Chat·Streaming** = agent-graph **LLM adapter** (dev: Ollama · **prod: vLLM**) · **Embed** = `embedder` in-process.

---

## 🌐 프론트엔드 & 사용자 인터페이스 (Next.js 기반)

| 역할            | 확정 스택       | 도입 목적 및 상세 기능                                                                                                                          |
| --------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 기본 프레임워크 | Next.js         | 플랫폼의 전체 웹 인터페이스 구성 및 SSR 처리                                                                                                    |
| 실시간 협업     | Yjs             | 캔버스·문서·코드 동시 편집 (CRDT)                                                                                                               |
| 비주얼 노드 UI  | **React Flow**  | Nexaon/Logex `GraphCanvas` — 노드·엣지 시각 편집 · Yjs `ontology:draft` 연동                                                                    |
| 문서 에디터     | Tiptap          | @tiptap/react · @tiptap/extension-collaboration — 기획·규범 초안 · Yjs 공식 연동                                                                |
| 스크립트 에디터 | Monaco          | @monaco-editor/react — 생성 코드 편집 · Yjs 결합                                                                                                |

---

## ⚙ 참고: 백엔드 및 AI/온톨로지 엔진 영역

- **NestJS** — 인증 · CP-02 · **agent-graph Run 프록시** · SSE 중계
- **`apps/agent-graph`** — **LangGraph** `StateGraph` SSOT · **`adapters/llm/`** (Ollama · vLLM) · **`embedder`** · `/v1/embed`
- **PostgreSQL** (pgvector) · **Neo4j** (온톨로지 쿼리층)

---

## 💡 Tiptap · React Flow · Monaco 시너지

1. **Yjs + Hocuspocus:** Tiptap·React Flow·Monaco 가 동일 Y.Doc 을 공유한다.
2. **AI 문서 스트리밍:** 토큰 생성은 **agent-graph LLM adapter** (dev Ollama · prod vLLM) 만. NestJS 가 SSE 를 중계하고 Tiptap 이 마크다운을 실시간 반영한다.
3. **기획 → 코드:** Tiptap 기획 확정 후 **RunPanel** → Nest → **LangGraph** Run → Monaco/Tiptap 출력.

프론트엔드 3 대 컴포넌트: **[React Flow(그래프) / Tiptap(문서) / Monaco(코드)]**.

---

## ⚙️ [2/2] 백엔드 & AI/온톨로지 추론 엔진 (NestJS & Python)

| 역할                     | 확정 스택                         | 도입 목적 및 상세 기능                                                                                       |
| ------------------------ | --------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 메인 애플리케이션 백엔드 | NestJS                            | 인증 · CP-02 · **agent-graph SSE 중계** — Ollama **직접 호출 없음**                                          |
| 워크플로 런타임          | **`apps/agent-graph` LangGraph**  | `graphs/` StateGraph · Run · RAG · Extract · SHACL · **`LLM_BACKEND`**                                       |
| 실시간 통신 (Streaming)  | NestJS SSE relay                  | agent-graph `/v1/runs/{id}/stream` → Nest → TipTap/RunPanel. **토큰 생성은 agent-graph 만**                 |
| LLM · 추론 (AIP)         | agent-graph LLM adapter           | Ollama (dev) · **vLLM (prod)** · Chat · Extract · RAG · SSE                                                  |
| **임베딩**               | agent-graph `embedder`            | sentence-transformers / ONNX · **`nomic-embed-text` in-process** · `/v1/embed` · **Ollama Embed ✗**        |
| 데이터베이스 (관계형)    | PostgreSQL                        | Yjs · project_knowledge(pgvector) · jobs · Prisma                                                            |
| 데이터베이스 (온톨로지)  | Neo4j                             | specs 동기화 트리플 · SPARQL/Cypher — SSOT 아님 (wikilink·specs 정본)                                        |
| 로컬 LLM 가동            | Ollama (dev) · **vLLM (prod)**    | **agent-graph adapter 만** — Nest · 브라우저 **금지**                                                          |

---

## 💡 아키텍처 핵심 요약

1. Next.js + **React Flow** + Tiptap 편집 → Yjs(Hocuspocus) 실시간 공유.
2. NestJS 가 **LangGraph Run** 을 프록시 — `POST /v1/runs/{graph_id}` · SSE relay.
3. **agent-graph**가 LLM adapter(dev Ollama · prod vLLM) 와 **embedder** 로 연산 분리.
4. Embed → **`/v1/embed` → embedder** → pgvector.

```text
UI (React Flow · Tiptap · Monaco)
  → NestJS (인증 · Run 프록시 · SSE relay)
  → agent-graph (LangGraph)
        ├── LLM adapter → Ollama (dev) | vLLM (prod)
        └── embedder (/v1/embed)
```

데이터 규격 SSOT: `packages/shared/schemas/agent-graph` · LangGraph RunRequest/Response.

---

## LangGraph Python 서버 (FastAPI) 분리 — 장단점

### 👍 장점

1. **파이썬 온톨로지 생태계** — rdflib · Owlready2 · SPARQLWrapper.
2. **결합도 분리** — 무거운 AI 추론 중에도 NestJS·Yjs 편집 블로킹 최소화.
3. **확장성** — agent-graph 만 GPU 노드로 스케일 아웃.

### 👎 단점

1. **배포 복잡도** — Nest + FastAPI + sync 프로세스.
2. **서버 간 통신** — Run HTTP + SSE relay SSOT 필요.
3. **분산 상태** — PostgreSQL ↔ Neo4j 일관성.

### 💡 제언

- **Streaming SSOT:** agent-graph SSE → Nest relay → UI. 중간 JSON Export 층 **없음**.
- **통신:** Run = POST `/v1/runs/{graph_id}` · stream = GET `/v1/runs/{run_id}/stream`.

---

## 관련 문서

| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXA OS 설계 표준 · 미션 크리티컬 전략 (TDD-001)](./08_TDD_NEXAOS_설계표준_미션크리티컬전략.md) |
| 모노레포 구조 | [LangGraph 모노레포 폴더 구조 v1.0 (TDD-007)](../NEXAOS/08_TDD_NEXAOS_모노레포폴더구조_v1.0.md) |
| TS 스키마 | [TS 타입 · 스키마 전략 (TDD-037)](../AI/08_TDD_AI_TS타입스키마전략.md) |
