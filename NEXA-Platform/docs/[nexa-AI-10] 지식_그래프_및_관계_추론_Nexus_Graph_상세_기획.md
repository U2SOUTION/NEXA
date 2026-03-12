# 지식 그래프 및 관계 추론 (Nexus Graph) 상세 기획

**"세상 모든 메타포의 인과관계"**를 AI가 **노드(Node)** 로 연결하고, 그 사이의 **논리적 선(Edge)** 을 추론하여 저장하는 **지식 그래프(Knowledge Graph)** 구축 전략을 정리한다.  
[NEXA-AI-01~05]는 **AI와 협업하기 위한 그릇**(탐색기·UI·워크스페이스·메타데이터 추출·룰 관리)에 집중한다면, 본 문서는 그 그릇에 담길 **"지식의 구조(Knowledge Schema)"** 와 **인과관계 파악**을 위한 두뇌 역할을 정의한다.

> **철학적 포지션**: 본 기획은 **한 차원 높은 철학적 인사이트**를 제공하고, **창작 도구로서 AI의 협력**을 이끈다는 의도를 갖는다. 단순한 데이터 연계를 넘어, **기계적 팩트**와 **예술적 메타포**를 이어 주고, **비선형적 유추**와 **인과의 서사화**를 통해 창작자에게 영감을 주는 구조를 목표로 한다.

---

## 1. 목적 및 배경

### 1.1 목적

- **메타포(Metaphor)** 와 **인과관계(Causality)** 를 **그래프 구조**로 표현하고 영속화한다.
- AI가 **데이터 간의 메타포를 발견**하고, **인과관계를 추론**하여 **노드·엣지**로 저장한다.
- Nexus Map(NEXA-AI-03 §8.6)의 **시각화·편집 UI**와 연동되며, **백엔드 지식 저장소**로서 별도 설계·운영한다.

### 1.2 NEXA-AI 문서군에서의 위치

| 문서 | 역할 | 본 문서와의 관계 |
|------|------|------------------|
| [NEXA-AI-01~02] | 탐색기·인프라 | 파일·문서 유입 경로. 지식 그래프의 **소스** |
| [NEXA-AI-03] | 워크스페이스·Nexus Map UI | **Nexus Map** = 본 그래프의 **시각화·편집** 계층. 본 문서 = **데이터·추론** 계층 |
| [NEXA-AI-04] | 메타데이터·메타포 추출 | **추출 결과**(objects, relations, metaphors 등) → 본 그래프의 **노드·엣지 입력** |
| [NEXA-AI-05] | 룰·프롬프트 관리 | 그래프 추론 시 사용할 **프롬프트·지침** 제공 |
| **[NEXA-AI-06]** | **지식 그래프·관계 추론** | **두뇌**. 메타포·인과를 노드·엣지로 구조화·저장·추론 |

### 1.3 핵심 질문

- **AI가 어떻게** 데이터 간의 메타포를 발견하는가?
- **AI가 어떻게** 인과관계를 노드·엣지로 생성하는가?
- **어떤 스키마**로 노드와 엣지를 저장하는가?

---

## 2. 지식 스키마 (Knowledge Schema)

### 2.1 노드(Node) 타입

| 노드 타입 | 설명 | 출처 | 예시 |
|-----------|------|------|------|
| **entity** | 실제 객체·개념. 파일, 장비, 문서, 이미지, 추상 개념 등 | files, source_metadata, AI 추론 | `file:abc123`, `concept:시간`, `device:motor-01` |
| **metaphor** | 메타포(은유). "A가 B를 상징" | NEXA-AI-04 §4.1 메타포 추출 | `metaphor:빛-진리`, `metaphor:바다-무한` |
| **persona** | AI 페르소나 | NEXA-AI-05, Nexus Map | `persona:코드리뷰어` |
| **skill** | 스킬 | NEXA-AI-05, Nexus Map | `skill:요약` |
| **task** | 테스크 | Nexus Map | `task:리팩터링` |
| **event** | 시점·이벤트. 스냅샷, 변경 이벤트 등 | NEXA-AI-03 §8.7 | `event:snapshot-001` |

- **ID 규칙**: `{type}:{id}` (예: `entity:file-123`, `metaphor:m-456`). UUID/ULID 권장.

### 2.2 엣지(Edge) 타입 — 관계·인과

| 엣지 타입 | 설명 | 방향 | 예시 |
|-----------|------|------|------|
| **relates_to** | 일반 연관. "A와 B가 관련됨" | 양방향 | document ↔ concept |
| **symbolizes** | 상징. "A가 B를 상징" (메타포) | source → target | `빛` → `진리` |
| **causes** | 인과. "A가 B를 유발" | 원인 → 결과 | `수정` → `재배포` |
| **depends_on** | 의존. "A가 B에 의존" | dependent → dependency | task → file |
| **contains** | 포함. "A가 B를 포함" | container → contained | document → section |
| **assigned_to** | 할당. Nexus Map 할당 | file → persona/skill | file → persona |
| **extracted_from** | 추출 출처. 메타데이터 → 노드 | node → source | metaphor ← file |

- **속성**: `weight`(신뢰도·강도), `source`(수동|AI추론|메타추출), `created_at`, `evidence`(근거 텍스트/참조) 등.

### 2.3 노드·엣지 공통 속성

| 속성 | 타입 | 설명 |
|------|------|------|
| `id` | string | 고유 식별자 |
| `type` | string | 노드/엣지 타입 |
| `label` | string | 표시명 |
| `properties` | JSON | 확장 속성 |
| `source_id` | string | 출처(예: file_id, metadata_id) |
| `created_at` | datetime | 생성 시각 |
| `updated_at` | datetime | 수정 시각 |
| `confidence` | float | 신뢰도(0~1, AI 추론 시) |

---

## 3. 메타데이터 → 그래프 파이프라인

[NEXA-AI-04]의 **source_metadata** 추출 결과를 **Nexus Graph** 노드·엣지로 변환한다.

### 3.1 입력: source_metadata (NEXA-AI-04)

| 형식 | 추출 필드 예시 | 그래프 변환 |
|------|----------------|-------------|
| **문서** | summary, keywords, sections | entity 노드 + contains 엣지 |
| **이미지(철학)** | objects, relations, metaphors | entity + metaphor 노드 + symbolizes/causes 엣지 |
| **영상** | 키프레임별 metaphors, 서사적 메타포 | entity + 시퀀스 metaphor 노드 |
| **오디오** | mood, associations | entity + metaphor·relates_to 엣지 |

### 3.2 변환 규칙

1. **파일 → entity 노드**: `file_id` 기반. `entity:file-{id}`, label=original_name.
2. **objects → entity 노드**: 각 object를 `entity:obj-{id}` 로 생성. `extracted_from` 엣지로 원본 파일 연결.
3. **relations → 엣지**: `from`/`to`를 entity로 매핑. `relates_to` 또는 `relation_type`에 따라 엣지 타입 결정.
4. **metaphors → metaphor 노드 + symbolizes 엣지**: `source`/`target`/`meaning` → metaphor 노드 생성, source·target entity와 `symbolizes` 엣지 연결.
5. **abstract_concepts → entity 노드**: 개념을 `entity:concept-{id}` 로 생성. 원본과 `relates_to` 연결.

### 3.3 트리거

- **파일 업로드/DB 반영 후**: source_metadata 추출 완료 시 **그래프 확장** 비동기 실행.
- **재추출 시**: 기존 노드·엣지 갱신 또는 병합 정책 적용.

---

### 3.4 Cross-Domain Mapping Engine

IoT 플랫폼에서 발생하는 **물리적 팩트**를 **예술적 메타포**로 치환하는 매핑 레이어이다.

| 입력 (물리적 팩트) | 매핑 출력 (예술적 메타포) |
|--------------------|---------------------------|
| 전압 변동, 스파이크 | 긴장, 격렬함, 폭발 |
| 진동·주파수 패턴 | 고동, 맥박, 불안 |
| 온도·저항 변화 | 냉기, 소외, 차단 |
| 노이즈·불규칙 신호 | 혼란, 불확실성, 장애 |
| 정상 범위·안정 신호 | 평화, 균형, 이완 |

- **역할**: 기계적 수치(전압, 진동, 온도 등)가 들어오면, **사전 정의된 매핑 테이블** 또는 **AI 추론**으로 대응되는 예술적·철학적 메타포 노드를 생성하고, 원본 장비/센서 entity와 `symbolizes` 엣지로 연결.
- **설정**: Rule Manager의 `knowledge_graph.cross_domain_mapping` 스코프에서 **매핑 규칙**·**해석 가이드라인** 주입. 도메인(기계 vs 철학)에 따라 동일 수치도 다른 메타포로 매핑 가능.
- **확장**: 매핑 테이블은 사용자·프로젝트별로 커스터마이즈. "이 프로젝트에서는 진동을 '고동'이 아닌 '기다림'으로 해석" 등.

---

## 4. AI 추론 전략 — 메타포 발견 및 인과관계 생성

### 4.1 메타포 발견 (Cross-modal / Cross-document)

| 단계 | 설명 |
|------|------|
| **1. 유사도 검색** | 벡터 임베딩으로 **유사한 메타포·개념**을 검색. "이 문서의 메타포 A와 저 이미지의 메타포 B가 유사한가?" |
| **2. AI 추론** | 유사 후보 쌍을 AI에 입력. "다음 두 메타포 간의 관계(동일·유사·대립·인과)를 판단하고, 있으면 엣지로 출력하라" |
| **3. 엣지 생성** | AI 출력을 Zod 검증 후 `relates_to`, `symbolizes`, `causes` 등 엣지로 저장 |

- **프롬프트**: Rule Manager의 `knowledge_graph.metaphor_inference` 스코프. NEXA-AI-05와 연동.

### 4.2 비선형적 유추(Creative Analogy) — Distance-Adjustable Inference

유사도 검색 기반 메타포 발견은 **합리적**이지만, **창작**을 위해서는 **멀리 떨어진 개념**을 연결하는 능력이 필요하다.

| 장치 | 설명 |
|------|------|
| **Distance-Adjustable Inference** | AI가 인과관계를 추론할 때 **직접적인 논리(Rigor)** 뿐만 아니라, 의도적으로 **거리가 먼 개념**을 연결하는 **예술적 비약(Artistic Leap)** 모드를 선택할 수 있게 함 |
| **예시** | `강철의 차가움` ↔ `인간의 소외`, `진동의 리듬` ↔ `시간의 흐름`, `전압 스파이크` ↔ `감정의 폭발` — 도메인이 다른 개념 간 **의도적 연결** |
| **모드** | **Rigor 모드**: 유사도·논리적 근접성 기반. **Creative 모드**: 거리 파라미터를 높여 "의도적으로 먼" 개념 쌍도 후보에 포함. AI에게 "예술적 비약을 허용하라"는 지침 주입 |
| **룰 연동** | Rule Manager `knowledge_graph.creative_analogy` 스코프. **distance_threshold**, **artistic_leap_allowed** 등 파라미터와 **예술론·철학적 가이드라인** 주입 |

#### 4.2.1 Human-in-the-loop 승인 UI (예술적 비약 피드백 루프)

AI가 생성한 **예술적 비약**이 너무 터무니없을 경우를 대비해, **데이터 정합성**을 높이기 위한 피드백 루프를 둔다.

| 항목 | 설명 |
|------|------|
| **위치** | **Nexus Map** 상에서, `source_type === 'ai_inference'` 이며 Creative 모드로 생성된 엣지에 대해 |
| **동작** | 사용자가 해당 엣지(또는 엣지 그룹)를 선택 후 **승인(approve) / 반려(reject) / 수정(modify)** 수행 |
| **승인** | 엣지를 "확정" 상태로 전환. 이후 그래프 검색·추론에 정식 반영 |
| **반려** | 엣지를 비활성화 또는 삭제. 데이터에 남기지 않거나 `status: 'rejected'` 로 표시 |
| **수정** | 엣지 속성(label, evidence, weight 등)을 사용자가 편집 후 승인. "이 연결은 이렇게 해석하는 게 맞다"로 보정 |
| **시각 구분** | 승인 대기 엣지는 **점선·또는 구분색**으로 표시. 승인 완료 시 **실선** 등으로 변경 |

- **Phase 2** 에 본 승인 UI를 **명시적으로 포함**하여, AI 추론 결과가 곧바로 확정되지 않고 사용자 검토를 거치도록 한다. 이를 통해 **데이터 정합성**을 확보한다.

### 4.3 인과관계 추론

| 입력 | 출력 |
|------|------|
| 시계열 이벤트(스냅샷·변경 로그) | `causes` 엣지. "A 수정 → B 변경" |
| 메타포 쌍 | "A 메타포가 B 개념의 원인/결과로 해석되는가" |
| 문서·코드 의존 관계 | `depends_on` 엣지 |

- **이벤트 소스**: NEXA-AI-03 §8.7 인과 체인, ai_panel_change_log 등.
- **AI 역할**: 이벤트 시퀀스·메타데이터를 입력받아 "인과 가능성"을 판단하고, 승인 시 `causes` 엣지 생성.

### 4.4 인과관계의 서사화 — Temporal Synthesis Layer

철학적 탐구에서는 **단편적 인과**가 아니라, 인과들이 모여 만드는 **시간적 흐름과 의미**가 중요하다.

| 장치 | 설명 |
|------|------|
| **Temporal Synthesis Layer** | `event` 노드와 `causes` 엣지를 엮어 하나의 **서사(Narrative)** 로 재구성하는 기능 |
| **출력** | 단순 "A가 B의 원인이다"가 아니라, **스토리텔링** 방식의 요약. 예: *"A라는 물리적 현상이 반복되어, B라는 철학적 고뇌를 낳았다"* |
| **동작** | 인과 체인(A→B→C→…)을 순회하며, AI가 **맥락·의미**를 부여해 **한 문단 또는 짧은 서사**로 요약. 타임라인·시퀀스 보존 |
| **활용** | Nexus Map에서 인과 경로 선택 시 "이 인과 체인의 서사를 생성해줘" → AI가 스토리 형태로 응답. 창작·발표·문서화에 활용 |

### 4.5 수동 vs 자동

| 모드 | 설명 |
|------|------|
| **수동** | 사용자가 Nexus Map에서 노드 간 라인을 그려 연결. `source: 'manual'` |
| **AI 추론** | 위 4.1·4.2 파이프라인으로 자동 생성. `source: 'ai_inference'` |
| **메타 추출** | NEXA-AI-04 결과에서 직접 변환. `source: 'metadata_extract'` |

- **검증**: AI 추론 엣지는 `confidence` 임계치 미달 시 "후보"로만 보관. 사용자 승인 또는 배치 검토 후 확정.

---

## 5. Nexus Map(NEXA-AI-03 §8.6)과의 관계

| 구분 | Nexus Map (UI) | Nexus Graph (본 문서) |
|------|----------------|------------------------|
| **역할** | 시각화·편집·사용자 인터랙션 | 데이터·추론·영속화 |
| **데이터** | 노드 위치(x,y), 시각 레이어, 할당 정보 | 노드·엣지 스키마, 인과·메타포 관계 |
| **저장** | ai_workspace_layout, Pinia | ai_nexus_graph_nodes, ai_nexus_graph_edges (별도) |
| **연동** | Nexus Map은 **Nexus Graph**를 읽어 노드·엣지 렌더. 사용자 편집은 Graph에 반영 |
| **승인 UI** | AI 추론 엣지(특히 예술적 비약)에 대해 **승인/반려/수정** 피드백 루프. §4.2.1 Human-in-the-loop 참조 |

- **정리**: Nexus Map = **프론트엔드**. Nexus Graph = **백엔드 지식 저장소**. 둘은 **API**로 연동.

---

## 5.5 Rule Manager 연동 — 미학·철학 가이드라인

본 기획(NEXA-AI-06)은 **NEXA-AI-05 룰·프롬프트 통합 관리**와 긴밀히 연동되어야 한다. 철학과 창작을 위해서는 AI에게 **일반적인 지침**이 아닌 **특화된 예술론·미학적 가이드라인**을 가르쳐야 하기 때문이다.

| 항목 | 내용 |
|------|------|
| **Consumer** | Rule Manager에 `knowledge_graph` Consumer 등록. 스코프: `metaphor_inference`, `creative_analogy`, `cross_domain_mapping`, `temporal_synthesis` |
| **미학적 가이드라인** | "추론 시 서양 미학의 대비·통일 원칙 적용", "동양 철학의 음양·상생 개념을 메타포 해석에 반영" 등 **예술론·미학 이론**을 룰로 주입 |
| **철학적 가이드라인** | "인과 추론 시 허구와 사실의 경계 명시", "메타포 해석 시 다의성 허용" 등 **철학적 해석 원칙** |
| **프로젝트별 오버라이드** | 프로젝트·도메인별로 다른 예술론 적용. "이 프로젝트는 베르그송의 시간론을 기반으로" 등 |
| **Resolution 연동** | 그래프 추론·서사 생성 시 Rule Manager **Resolution API** 호출 → `consumer=knowledge_graph`, `scope`에 맞는 룰만 결합해 AI에 전달 |

- **정리**: Rule Manager는 **무슨 지침을 줄지**를 정의하고, Nexus Graph는 **그 지침을 받아** 메타포·인과·서사를 추론한다. 일반 채팅용 룰과 **창작·철학용 룰**을 분리해 관리하는 것이 핵심이다.

---

## 6. 저장소·DB 설계 (초안)

### 6.1 ai_nexus_graph_nodes

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | VARCHAR(64) PK | `entity:uuid` 등 |
| type | VARCHAR(32) | entity, metaphor, persona, skill, task, event |
| label | VARCHAR(255) | 표시명 |
| properties | JSON | 확장 속성 |
| source_id | VARCHAR(64) | file_id, metadata_id 등 |
| source_type | VARCHAR(32) | metadata_extract, ai_inference, manual |
| confidence | FLOAT | 0~1 |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### 6.2 ai_nexus_graph_edges

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | VARCHAR(64) PK | 엣지 고유 ID |
| from_node_id | VARCHAR(64) FK | |
| to_node_id | VARCHAR(64) FK | |
| edge_type | VARCHAR(32) | relates_to, symbolizes, causes, depends_on, … |
| properties | JSON | weight, evidence 등 |
| source_type | VARCHAR(32) | manual, metadata_extract, ai_inference |
| approval_status | VARCHAR(16) | `pending`(승인대기), `approved`, `rejected`. Human-in-the-loop(§4.2.1)용. manual/metadata_extract는 기본 `approved` |
| confidence | FLOAT | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

- **인덱스**: `from_node_id`, `to_node_id`, `edge_type`, `source_type`, `approval_status`.

### 6.3 구현 단계

- **1단계**: JSON 파일 또는 단순 스토어로 프로토타입. 스키마 검증.
- **2단계**: `ai_nexus_graph_nodes`, `ai_nexus_graph_edges` 테이블 도입.
- **3단계**: 그래프 DB(Neo4j, Amazon Neptune 등) 검토 — 노드·엣지 수가 크게 늘어나면.

---

## 7. API·서비스 제안

| API/서비스 | 설명 |
|------------|------|
| `GET /api/nexus-graph/nodes` | 노드 목록. 필터: type, source_id |
| `GET /api/nexus-graph/edges` | 엣지 목록. 필터: from, to, edge_type |
| `POST /api/nexus-graph/nodes` | 노드 생성(수동·프로그램) |
| `POST /api/nexus-graph/edges` | 엣지 생성 |
| `POST /api/nexus-graph/enrich` | file_id 또는 metadata 입력 → 그래프 확장(메타 추출 결과 반영) |
| `POST /api/nexus-graph/infer` | AI 추론 트리거. 메타포·인과 후보 생성 |

- **Nexus Map UI**: 위 API로 노드·엣지 조회 후 D3/Vue Flow 등으로 렌더.

---

## 8. 단계별 구현 로드맵

| Phase | 내용 |
|-------|------|
| **Phase 0** | 스키마·개념 정립. 본 문서 검토·보완. |
| **Phase 1** | **메타데이터 → 그래프** 파이프라인. NEXA-AI-04 추출 완료 시 entity·metaphor 노드, relates_to·symbolizes 엣지 생성. **Cross-Domain Mapping Engine** 기초(물리→메타포 매핑 테이블). JSON/단순 저장. |
| **Phase 2** | **DB 테이블** 도입. Nexus Map UI와 API 연동. 수동 노드·엣지 생성·편집. **Human-in-the-loop 승인 UI** — AI 추론 엣지(예술적 비약 포함)에 대해 Nexus Map 상에서 **승인/반려/수정** 피드백 루프. 미승인 엣지는 점선·구분색 등 시각 구분. **데이터 정합성** 강화. **Rule Manager 연동** — knowledge_graph Consumer, 미학·철학 가이드라인 룰 등록. |
| **Phase 3** | **AI 추론** 파이프라인. 메타포 간 유사도·관계 추론. **Distance-Adjustable Inference** (Rigor/Creative 모드). 인과관계 추론. |
| **Phase 4** | **Temporal Synthesis Layer** — event+causes → 서사(Narrative) 재구성. **그래프 검색·쿼리** 고도화. 필요 시 전용 그래프 DB 검토. |

---

## 9. 참고 문서

| 문서 | 연관 내용 |
|------|-----------|
| [NEXA-AI-03] AI_협업형_멀티_에디터_플랫폼_구축 | §8.6 Nexus Map(UI), §8.7 Snapshot·인과 체인 |
| [NEXA-AI-04] 파일_source_metadata_AI_추출_기획 | §4.1 멀티모달 메타포 추출 (objects, relations, metaphors) |
| [NEXA-AI-05] 룰_프롬프트_통합_관리_기획 | Resolution API, Consumer `metadata_extract`, `knowledge_graph` 스코프(확장) |

---

## 10. 요약

- **목적**: 메타포·인과관계를 **노드·엣지**로 구조화하고, AI가 **발견·추론**하여 저장하는 **지식 그래프(Nexus Graph)** 구축. **창작 도구**로서 철학적 인사이트 제공.
- **입력**: NEXA-AI-04의 source_metadata(메타포·relations 등) → 변환 파이프라인 → 노드·엣지.
- **추론**: AI가 메타포 간 유사·관계, 인과관계를 판단 → 엣지 생성. Rule Manager 프롬프트 연동.
- **핵심 장치**:
  - **Cross-Domain Mapping Engine**: 물리적 팩트(전압·진동) → 예술적 메타포(긴장·고동) 치환.
  - **Distance-Adjustable Inference**: 유사도뿐 아니라 **멀리 떨어진 개념** 연결(예술적 비약) 모드.
  - **Human-in-the-loop 승인 UI**: Nexus Map 상에서 AI 생성 엣지 **승인/반려/수정** 피드백 루프. 데이터 정합성 강화.
  - **Temporal Synthesis Layer**: event+causes → **서사(Narrative)** 재구성. 스토리텔링 방식 요약.
  - **Rule Manager 연동**: 미학·철학 가이드라인, 예술론·해석 원칙 주입.
- **출력**: Nexus Map(UI)이 이 그래프를 읽어 시각화. 사용자 편집은 그래프에 반영.
- **저장**: `ai_nexus_graph_nodes`, `ai_nexus_graph_edges` (또는 1단계 JSON/단순 스토어).

본 문서는 **지식의 구조**와 **인과관계 파악**, **창작을 위한 비선형적 유추**라는 목적지를 향하는 설계 기초를 제공한다. 세부 스키마·API·AI 추론 프롬프트는 구현 단계에서 구체화한다.
