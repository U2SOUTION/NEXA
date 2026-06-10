# The Wave of AI Innovation (AI 혁신의 물결)

> **관점:** 본 문서는 AI 역사의 **단계 타임라인**을 정리하고, **NEXA 플랫폼**이 그 물결 속에서 **어디에 서 있으며 무엇을 채택·거부하는지**를 맵핑한다.  
> **정체성 SSOT:** [`NEXA 플랫폼·메타-OS·NEXIA·도메인 — 정체성 SSOT`](../_NEXA-플랫폼·메타-OS·NEXIA·도메인%20—%20정체성%20SSOT.md)

---

## AI 혁신 단계 (역사 타임라인)

| 대분류 / 타임라인                                | 포함된 기술 및 핵심 단어 (영어)                                 | 한국어 의미                                                                 |
| ------------------------------------------------ | --------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **메인 제목**                                    | The Wave of AI Innovation                                       | AI 혁신의 물결                                                              |
| **1단계: AI의 탄생** (The Birth of AI / ~1980)   | Perceptron · Rules · Von Neumann · Turing Test · 1st AI Winter  | 퍼셉트론 · 규칙 · 폰 노이만 · 튜링 테스트 · 1차 AI 암흑기                   |
| **2단계: 논리적 AI** (Logical AI / 1980~2000)    | Logical Reasoning · Machine Learning · Ontology · 2nd AI Winter | 논리적 추론 · 머신러닝 · 온톨로지 · 2차 AI 암흑기                           |
| **과도기** (2000~2010)                           | Semantic Web                                                    | 시맨틱 웹                                                                   |
| **3단계: 생성형 AI** (Generative AI / 2010~2030) | DNN, GNN · Transformer · LLM, RAG · Diffusion                   | 심층신경망, 그래프신경망 · 트랜스포머 · 대형언어모델, 검색증강생성 · 디퓨전 |
| **4단계: 에이전틱 AI** (Agentic AI / 2030~2060)  | Reasoning · Planning · Neuro-symbolic · MCP, A2A, etc.          | 추론 · 계획 수립 · 뉴로-심볼릭 · 모델 컨텍스트 프로토콜 등                  |
| **5단계: 피지컬 AI** (Physical AI / 2060~2080+)  | Neuro-morphic · Quantum · ???                                   | 뉴로모픽 · 양자 컴퓨팅 · 미정 / 예측 불가                                   |

---

## NEXA 플랫폼이 서 있는 위치

**NEXA 플랫폼**은 **3단계(생성형 AI)** 를 **현재 운영 기반**으로 삼고, **4단계(에이전틱 AI)** 를 **오케스트레이션·규범 레이어**로 구축 중이며, **5단계(피지컬 AI)** 를 **엣지·IoT·현장 실행**으로 향하는 **장기 목표**로 둔다.

| 층                         | 역할                                  | AI 물결과의 관계                                             |
| -------------------------- | ------------------------------------- | ------------------------------------------------------------ |
| **M.O.S.E.S. (메타·빌드)** | NEXA 플랫폼을 **만들고 고치는** 층    | 3~4단계 **도구** (Desktop Rivet · Ollama · Zod · MCP)        |
| **NEXA 플랫폼 (제품)**     | 세상에 **배포·운영**되는 통합 제품    | 3단계 **런타임** (LLM·RAG·협업 UI) + 4단계 **에이전트 실행** |
| **NEXIA (`nexia` 도메인)** | 플랫폼 **핵심 지능** 허브 (7탭·Omnix) | 4단계 **Reasoning·Planning·Tool Calling** 조율               |
| **엣지·디바이스**          | ESP32 · 센티널 · 펌웨어               | 5단계 **Physical AI** 로의 연장                              |

```text
[ 3 Generative AI ]  LLM · RAG · Diffusion  ──▶  지금: Ollama · pgvector · ComfyUI …
[ 4 Agentic AI    ]  Plan · MCP · Graph    ──▶  지금: Rivet · Normex · Yjs 협업
[ 5 Physical AI   ]  Edge · Reflex        ──▶  목표: ESP32 · AXON · Safety Reflex
```

> **용어:** 문서·구두에서 「NEXA OS」는 **거버넌스·Grade·Normex** 등 **플랫폼 운영 규칙**을 가리킬 때 쓰이고, **배포 제품 전체**는 **NEXA 플랫폼**이라 부른다. — [정체성 SSOT](../_NEXA-플랫폼·메타-OS·NEXIA·도메인%20—%20정체성%20SSOT.md)

---

## 단계별 — NEXA 플랫폼 대응

### 1~2단계 · 과도기 (탄생 ~ 시맨틱 웹)

**역사적 유산:** 규칙·온톨로지·기호 논리.

| AI 물결 키워드   | NEXA에서의 현대적 계승                               | 구현·문서                                                                                                                                                                                                       |
| ---------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Rules**        | **Normex** · Zod · MUST/SHOULD 실행 차단             | [`M.O.S.E.S. 기술 이행 표준`](<./Rivet/M.O.S.E.S. 기술 이행 표준 (Normex & Standard).md>)                                                                                                                       |
| **Ontology**     | `docs/specs/` 트리 · wikilink · Obsidian MOC (04·14) | [`Desktop Rivet 캔버스 설계 v1.0`](<../Rivet/Desktop%20Rivet%20캔버스(Graph)%20설계%20v1.0.md>)                                                                                                                 |
| **Semantic Web** | 5W1H HEXAGON · nature_tag · capability_id            | [`DDL v5`](../Database/DDL%200%20SCHEMA%20NEXA%20Platform%20DB%20설계%20명세%20v5.md) · [RAG 페르소나 전략서](<../AI/NEXA%20AIS%20RAG%20및%20페르소나%20아카이브%20전략서%20(RAG%20&%20Persona%20Strategy).md>) |

NEXA는 **순수 기호 AI 시대로 회귀하지 않는다.** 다만 **뉴로-심볼릭(4단계)** 을 위해 **기호·규범·온톨로지를 SSOT로 고정**하고, LLM은 그 위에서 추론·생성만 맡긴다.

---

### 3단계: 생성형 AI (2010~2030) — **현재 운영의 중심**

| 기술                  | NEXA 플랫폼 채택                                                                          | 거부·제한                                        |
| --------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------ |
| **Transformer / LLM** | **Ollama** (로컬) · NestJS 경유만 · Desktop Rivet Chat 노드                               | 브라우저→Ollama 직접 · 클라우드 SSOT 의존 기본값 |
| **RAG**               | `docs/specs/` 코퍼스 + **PostgreSQL `project_knowledge`** (pgvector) · Rivet Vector Store | 벡터 DB만 블랙박스 메모리                        |
| **OG-RAG** (NEXA)     | 벡터 위 **2차 관계도** — 04/14 MOC · wikilink · `ref_ids` (GraphRAG와 별개)               | Vector Store → Chat **단독 종료**                |
| **Diffusion**         | ComfyUI 등 **외부 엔진** · 오케스트레이터 경유 (NEXIA 미디어 파이프라인)                  | UI에서 엔진 직접 노출                            |
| **GNN**               | Nexion·Logex **관계 그래프 UI** (Vue/React Flow) — 지식·워크플로 **시각화**               | (연구·확장 여지)                                 |

**플랫폼 스택 (요약):** Next.js · NestJS · rivet-core · Yjs · PostgreSQL(pgvector) · Ollama — [`NEXIA 00`](../Nexia/00%20인공지능%20NEXIA%20구조와%20기술%20스택과%20운영방침.md) §2.

**RAG 상세:** 설계 코퍼스(Desktop 01~05)와 운영 코퍼스(DB)를 **같은 Rivet·Ollama 경로**로 읽는다 — [`NEXA RAG 아키텍처`](../Rivet/NEXA%20RAG%20아키텍처%20—%20Rivet·PostgreSQL·Ollama.md).

```mermaid
flowchart LR
  subgraph gen [3단계 Generative — NEXA 현재]
    LLM[Ollama LLM]
    RAG[RAG pgvector + specs]
    DIF[Diffusion 엔진]
  end
  subgraph plat [NEXA 플랫폼]
    WEB[Next.js UI]
    NS[NestJS + rivet-core]
    PG[(PostgreSQL)]
  end
  WEB --> NS
  NS --> LLM
  NS --> RAG
  RAG --> PG
  NS --> DIF
```

---

### 4단계: 에이전틱 AI (2030~2060) — **지금 구축 중인 층**

| 기술                   | NEXA 대응                                                            | 설계 원칙                                                 |
| ---------------------- | -------------------------------------------------------------------- | --------------------------------------------------------- |
| **Reasoning**          | Rivet Sub 그래프 · NEXIA Omnix→Normex→탭 · 5W1H 필터                 | 추론 경로는 **그래프·로그로 가시화**                      |
| **Planning**           | Desktop Main 01→13 · `project_orchestra` · Human CP                  | 계획 변경은 **PR·설계 단위**, 채팅 한 줄로 SSOT 변경 금지 |
| **Neuro-symbolic**     | LLM(Ollama) + **Zod·Normex·Git specs**                               | 신경(생성) + 기호(검증·규범) **이중 레일**                |
| **MCP**                | Desktop **MCP FileSystem** (`docs/`) · Get Prompt · (확장) 도구 노드 | 웹은 NestJS API · Path Traversal 검증                     |
| **A2A / 멀티에이전트** | NEXIA 7탭 위임 · LangGraph(후보) · Embedded Rivet                    | **단일 오케스트레이션** 경유 — 직접 엔진 난립 금지        |

**NEXA가 에이전트 툴을 중심축으로 삼지 않는 이유** (3단계와 4단계 경계):

| 트렌디 에이전트   | NEXA 플랫폼                                            |
| ----------------- | ------------------------------------------------------ |
| 과제 한 번 끝내기 | `docs/specs/` · Zod · 모노레포 **장기 SSOT**           |
| 세션 메모리       | Git + DB **삼각 편대** (knowledge · chats · orchestra) |
| 채팅 = 전부       | 채팅 + Tiptap + Rivet **삼각 동기화**                  |

— [`Rivet 파이프라인`](../Rivet/Rivet%20파이프라인.md) 「왜 리벳인가?」「트렌디한 에이전트 툴과의 선」.

**책임 분리 (메타 vs 제품):**

```text
기획(What)   — 인간 + docs/specs
규격(How)    — M.O.S.E.S. · Desktop Rivet · Zod
검증·운영    — NEXA 플랫폼 · NestJS · PostgreSQL 운영 데이터
```

— [`M.O.S.E.S. v2.0`](<./Rivet/M.O.S.E.S.(Meta-Operating System for Engineering & Synthesis) v2.0.md>) §1.

---

### 5단계: 피지컬 AI (2060~2080+) — **장기 목표·엣지 전주**

| 기술                | NEXA 방향                                              | 현재 구현·설계                                                                        |
| ------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| **Physical AI**     | 현장·기기가 **지능의 말단**이 되되, 허브는 NEXA 플랫폼 | `project_devices` · 펌웨어 3단계 · `/infra`                                           |
| **Neuro-morphic**   | (장기) 엣지 추론 가속                                  | OpenCL · TinyML 후보 — [`stack-and-dependencies`](../rules/stack-and-dependencies.md) |
| **Quantum**         | 미정 — 플랫폼 코어 의존 없음                           | —                                                                                     |
| **Safety / Reflex** | 하드 도메인 **할루시네이션 원천 차단**                 | 로컬 선조치 · AXON · CSIM Ethos                                                       |

**지능 위계 (NEXA 피지컬 AI 논리):**

```text
엣지 센티널 — Fact 추출 · 5W1H 1차 요약 · Local Bypass
     ↓
NEXA 플랫폼 / NEXIA — 추론 · RAG · 승인(Omnix) · Rivet 실행
     ↓
이펙터 — ACTON · 펌웨어 · ESP32 OTA (M.O.S.E.S. Execute)
```

— [RAG 페르소나 전략서](<../AI/NEXA%20AIS%20RAG%20및%20페르소나%20아카이브%20전략서%20(RAG%20&%20Persona%20Strategy).md>) §5.4 · [CSIM·AXON](<../Nexia/_Cosmic%20Semantic%20Interface%20Matrix%20v2%20—%20CSIM%20·%20AXON%20프로토콜%20(정본).md>).

5단계는 **달력 연도 예측이 아니라 설계 방향**이다. NEXA는 **웹에서 먼저 3~4단계를 단단히** 쌓고, 엣지·OTA·Reflex로 **물리 세계로 확장**한다.

---

## NEXA 플랫폼 — 단계 통합 요약표

| AI 단계        | NEXA에서의 한 줄             | 핵심 자산                                        |
| -------------- | ---------------------------- | ------------------------------------------------ |
| 1~2 + 시맨틱   | **규범·온톨로지의 뿌리**     | Normex · specs · HEXAGON                         |
| **3 생성형**   | **지금 돌아가는 서비스**     | Ollama · **RAG** · Yjs · Diffusion 연동          |
| **4 에이전틱** | **그래프로 고정된 에이전트** | **OAG** · **AIP**(Rivet·LangGraph) · MCP · Omnix |
| **5 피지컬**   | **현장·기기로의 연장**       | ESP32 · Sentinel · Safety Reflex                 |

---

## 전략적 결론

**NEXA 플랫폼**은 트랜스포머 이후의 **생성형 AI(3단계)** 를 **Ollama·RAG·협업 UI**로 일상 운영에 올리고, **에이전틱 AI(4단계)** 는 **RAG → OAG → AIP** 층위(**OAG** = Ontology-Augmented Generation · **AIP** = rivet-core + LangGraph)로 **통제 가능한 오케스트레이션**을 구현한다. 최종적으로 **피지컬 AI(5단계)** 는 NEXA 플랫폼이 **허브·규범·장기 기억**을 담당하고, 엣지가 **Fact·Reflex**를 담당하는 **분리 위계**로 수렴한다.

**흔들리지 않을 선:**

1. **최종 진실** = Git + `docs/specs/` + Zod (생성·에이전트 Run은 과정).
2. **새 AI 물결 도구** = Rivet 노드·Ollama·MCP로 **흡수** — 플랫폼 뼈대 **교체 금지**.
3. **운영 데이터** = PostgreSQL + RAG가 **설계 문서와 동등한 코퍼스** — 웹만의 기억으로 끝나지 않음.

---

## 관련 문서

| 주제                       | 문서                                                                                                                         |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 정체성·3층 구조            | [`정체성 SSOT`](../_NEXA-플랫폼·메타-OS·NEXIA·도메인%20—%20정체성%20SSOT.md)                                                 |
| 메타 빌드·책임 분리        | [`M.O.S.E.S. v2.0`](<./Rivet/M.O.S.E.S.(Meta-Operating System for Engineering & Synthesis) v2.0.md>)                         |
| Rivet·일방통행·에이전트 선 | [`Rivet 파이프라인`](../Rivet/Rivet%20파이프라인.md)                                                                         |
| RAG·OG-RAG·OAG·AIP 층위    | [`RAG · OAG · AIP — 지능 층위와 오케스트레이션`](./RAG%20·%20OAG%20·%20AIP%20—%20지능%20층위와%20오케스트레이션.md)          |
| RAG·코퍼스·PostgreSQL      | [`NEXA RAG 아키텍처`](../Rivet/NEXA%20RAG%20아키텍처%20—%20Rivet·PostgreSQL·Ollama.md)                                       |
| NEXIA 7탭·스택             | [`NEXIA 00`](../Nexia/00%20인공지능%20NEXIA%20구조와%20기술%20스택과%20운영방침.md)                                          |
| 아톰·5W1H·피지컬 AI 철학   | [`RAG & Persona Strategy`](<../AI/NEXA%20AIS%20RAG%20및%20페르소나%20아카이브%20전략서%20(RAG%20&%20Persona%20Strategy).md>) |
