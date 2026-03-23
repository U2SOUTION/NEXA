# [NEXU-SCHEMA] 넥슈(NEXU) 데이터 스키마 (Draft)

> 작업중 문서 표기 규칙: 파일명 앞의 `-`는 현재 작업중임을 뜻한다. 정식 승격 시 `-` 제거 및 네이밍 수정이 예정되어 있으므로, 다른 문서에서는 **파일명 대신 참조 키 `[NEXU-SCHEMA]`**로만 언급한다.

## 0. 목적

이 문서는 넥슈(NEXU)가 다음 입력을 모두 수용(및 처리)하기 위한 **데이터 스키마(저장 규격 + 족보/추적 규격)**를 정의한다.

- 넥슈 자체 판단(자율 추론/인디케이터 출력)
- UI 선택(“지금의 나” 카드, 코일 밸런서 등 사용자 조작)
- 멀티모달 직접 입력(텍스트/음성/영상)

핵심 전제는 두 축이다.

1. **HEXAGON(5W1H) 프로토콜**: Who/When/Where/What/How/Why를 정수 토큰으로 분해하여, DB 레벨에서 대량 필터링·RAG 가중치 정책의 기반을 제공한다.
2. **ID 기반 참조 사슬(Traceability)**: 넥슈가 만든 “의도(WILL) → 판단(ECHO) → 연주/실행” 과정의 인과를 역추적 가능하게 구조화한다(Why Chain/Ref IDs 중심).

넥슈는 “서사적 지휘자(Narrative Conductor)”이므로, 단순 로깅이 아니라 **지능적 족보(Traceability)가 살아있는 형태**로 모든 데이터를 조직하는 것이 핵심이다.

**기대 효과:** 이렇게 설계함으로써 플랫폼에서 이루어지는 **모든 활동은 그 자체가 자산**으로 취급된다. 프로젝트 내부든 그림자 프로젝트(임시 체험·일상·도우미)든, 넥슈가 관여한 행동·선택·판단은 `project_logs`·`project_knowledge`와 참조 사슬에 남고, RAG·GOVERN·ECHO 승격·페르소나 아카이브 등이 이 자산을 소비한다. 그 결과 **플랫폼이 점차 똑똑해지는 기반**이 마련된다.

## 1. 통합 데이터 스키마: 개념 필드와 저장 매핑

넥슈가 수집하는 정보는 기본적으로 `project_logs`(현재/이력)와 `project_knowledge`(과거/지식) 레이어에 저장되며, 아래 “개념 필드”는 플랫폼 DDL 컬럼으로 매핑된다.

### 1.1 개념 필드(넥슈 공통 규격)

넥슈가 공통으로 쓰는 개념 필드는 다음과 같다.

- `pulse` (SMALLINT): 출처/동력원 구분 (WILL / ECHO / TICK, 필요 시 ASK/VOID 등은 HEXAGON 토큰 체계에 포함)
- `input_channel` (VARCHAR): 유입 경로 (UI_CARD, UI_SLIDER, VOICE, VIDEO, TEXT, AI_SLM 등)
- `hexagon_header` (SMALLINT): HEXAGON(5W1H) 토큰을 1ms 내 식별하기 위한 “인덱스(=6컬럼 토큰 세트의 약식 표현)”
- `payload` (JSONB): 선택 카드 ID, 슬라이더 값, 텍스트 원문, 파일 ref_id 등 실제 데이터(넥슈별 세부는 JSON에 둔다)
- `confidence_score` (SMALLINT): 판단의 무게(0~100). WILL은 기본적으로 100, ECHO는 추론 확신, TICK은 신호 품질 기반으로 반영
- `embedding` (VECTOR): 시맨틱 좌표(유사 이력/지식 검색의 기반)

### 1.2 저장 매핑(플랫폼 DDL 정합)

플랫폼 DDL에서는 `project_logs/project_knowledge`에 HEXAGON 5W1H를 `where_scope, when_tempo, who_pulse, what_intent, how_state, why_causality` 6컬럼으로 완전 분리한다. 따라서 넥슈 문서의 `hexagon_header`는 **이 6컬럼 토큰 세트의 약식 지칭**으로 사용한다.

#### A) `project_logs`에 대한 매핑


| 넥슈 개념 필드           | `project_logs` 저장 위치                                                          | 비고                                          |
| ------------------ | ----------------------------------------------------------------------------- | ------------------------------------------- |
| `pulse`            | `who_pulse`                                                                   | WILL/ECHO/TICK/ASK 등은 HEXAGON 토큰 매핑 기준을 따른다 |
| `hexagon_header`   | (`where_scope, when_tempo, who_pulse, what_intent, how_state, why_causality`) | 문서 상 약식 인덱스. 실제 DB는 6컬럼 완전 분리               |
| `payload`          | `extra_data`(+필요 시 `summary/why_chain`)                                       | 입력 원문/카드ID/슬라이더값/파일 ref_id는 JSONB에 둔다       |
| `confidence_score` | `confidence_score`                                                            | 플랫폼 DDL의 신뢰도 필드                             |
| `embedding`        | `embedding`                                                                   | 임베딩 차원은 채택 모델과 일치해야 함                       |
| `Traceability`     | `why_chain` JSONB                                                             | Why Chain은 인과 사슬을 구조화(아래 §4 참고)             |


#### B) `project_knowledge`에 대한 매핑


| 넥슈 개념 필드           | `project_knowledge` 저장 위치                                                     | 비고                                      |
| ------------------ | ----------------------------------------------------------------------------- | --------------------------------------- |
| `pulse`            | `who_pulse`                                                                   | 과거/지식에서도 “누가/어떤 동력원으로” 생성되었는지 보존        |
| `hexagon_header`   | (`where_scope, when_tempo, who_pulse, what_intent, how_state, why_causality`) | 동일 규칙                                   |
| `payload`          | `raw_content, content_fact, metadata, extra_data`                             | 지식화 단계에서 원문/요약/메타를 분리 저장                |
| `confidence_score` | `confidence_score`                                                            | RAG 가중치/필터 기준으로 사용                      |
| `embedding`        | `embedding`                                                                   | RAG 검색용                                 |
| `Traceability`     | `ref_ids` JSONB                                                               | SNT-IND-EFF 등 참조 사슬의 역추적 키 저장(아래 §4 참고) |


## 2. 프로젝트 내부/외부 동작 보강(스코프 문제)

**원칙:** 넥슈가 활동하는 **모든 영역은 저장 구조상 기본적으로 “프로젝트”로 바라본다.** 실제 사용자가 “지금 어떤 프로젝트 안에 있다”고 인식하는지와 무관하게, DB에는 항상 `project_id`가 있으며, “실제 프로젝트가 없는” 활동은 **그림자 프로젝트(shadow project)**에 귀속시켜 동일한 테이블·Traceability 체계를 유지한다.

### 2.1 그림자 프로젝트에 포함되는 영역

다음은 모두 “실제 프로젝트”가 없으므로, **그림자 프로젝트(또는 그에 상응하는 버킷)**에 `project_id`를 두고 저장하며, `scope_type`(및 필요 시 세부 구분)으로 의미를 구분한다.

- **비회원 활동(임시 체험)**  
  로그인하지 않은 사용자의 넥슈 체험. `scope_type = 'GLOBAL'`(또는 `'TRIAL'`) 및 `extra_data`에 비회원/임시 세션 식별 정보를 둔다.
- **회원의 프로젝트 아닌 일상 활동**  
  회원이 특정 프로젝트에 들어가지 않은 상태에서의 넥슈 사용(홈, 탐색, 설정, 일상 대화 등). `scope_type = 'GLOBAL'`(또는 `'DAILY'`)로 구분한다.
- **회원/비회원의 프로젝트 아닌 도우미 활동**  
  프로젝트 컨텍스트 밖에서의 “도우미” 모드(예: 플랫폼 가이드, FAQ, 일반 문의). 마찬가지로 그림자 프로젝트에 저장하고 `scope_type = 'GLOBAL'`(또는 `'HELPER'`) 등으로 구분한다.

구현 시 **하나의 글로벌 그림자 프로젝트 ID**를 두고 `scope_type`/`scope_subtype`(예: TRIAL, DAILY, HELPER)으로 세분할지, **용도별 그림자 프로젝트 ID**(예: trial_shadow_project_id, global_daily_project_id, helper_project_id)를 여러 개 둘지는 플랫폼 정책에 따라 결정한다. 어느 쪽이든 “넥슈가 활동하는 모든 영역 = 어떤 프로젝트(실제 또는 그림자)에 귀속”이라는 전제는 동일하다.

### 2.2 저장 규격 요약

- **effective_project_id**는 **DB 필드명이 아니라 개념(용어)**이다. “이 행이 효과적으로 귀속되는 프로젝트”를 가리키며, 물리적으로는 기존 **`project_id`** 컬럼에만 저장한다. 프로젝트 외 동작 시에는 `project_id`에 **글로벌(또는 용도별) 그림자 프로젝트**의 ID를 넣고, “실제로는 프로젝트 없이 동작한 기록”임을 구분하기 위해 `scope_type`을 함께 둔다.
- `scope_type`을 `extra_data` 또는 `metadata`(JSONB)에 기록한다. 별도 컬럼이 아님.
  - `scope_type = 'IN_PROJECT'`: 일반 프로젝트 컨텍스트 저장(사용자가 진입한 실제 프로젝트).
  - `scope_type = 'GLOBAL'`: 프로젝트 외(독립 운용) — 비회원 임시체험, 회원 일상, 도우미 활동 등 위 세 영역을 포함. 세부 구분은 같은 JSON 내 `scope_subtype`(예: TRIAL, DAILY, HELPER) 또는 별도 키로 둘 수 있다.

이렇게 하면 `project_logs/project_knowledge`의 NOT NULL 제약을 만족하면서도, 넥슈 관점에서는 **모든 활동이 동일한 Traceability 체계**로 유지된다.

## 3. 세 가지 데이터 유입 경로별 처리 규격

이 절은 “같은 DB에 저장하되, 어떤 토큰(pulse/input_channel/HEXAGON 5W1H/신뢰도/족보)을 채우는가”를 정의한다.

### ① 자체적인 판단 데이터 (ECHO / AI_INFERENCE)

- 입력: 넥슈 앞단 **SLM(경량 추론 모델)** 또는 인디케이터가 사용자/시스템 상태를 분석해 만든 감정 분류/의도 추정/전략 제안
- 저장 규격
  - `pulse = ECHO`
  - `input_channel = 'AI_INFERENCE'` (또는 `AI_SLM`)
  - `confidence_score`: SLM 내부 확신도(0~100)로 저장
  - `hexagon(5W1H)`: 입력 요약/상태 기반으로 who/when/where/what/how/why 토큰을 채움
  - `payload`: 후보 UCL 헤더, 제안된 persona 표정 팩, 대안 프레이밍 등(전부 JSON)
  - `Traceability`: `why_chain`에 “어떤 입력 신호로부터 어떤 판단이 나왔는지”를 기록
- 승인 대기(ASK) 규칙
  - `confidence_score < 95`이면 `pulse`를 ASK로 전환하거나(권장), 같은 레코드에 `extra_data.intent='ASK_PENDING'`로 표기해 **승인 대기 토큰**을 생성
  - ASK 단계에서는 사용자에게 질문/선택지를 제공하기 위한 `payload.ask_question`과 `payload.candidate_ucl_headers`를 필수로 포함

### ② 사용자 UI 선택 데이터 (WILL / UI_INTERACTION)

- 입력: “지금의 나” 카드 선택, 코일 밸런서 슬라이더 조절, UI 버튼/노드 선택 등 명시적 조작
- 저장 규격
  - `pulse = WILL`
  - `input_channel = 'UI_CARD' | 'UI_SLIDER' | 'UI_BUTTON' | 'UI_NODE'` 등
  - `confidence_score = 100` (사용자가 명확히 선택했으므로 영구 보존/우선권 부여)
  - `hexagon(5W1H)`: UI 이벤트가 의미하는 where/what/how/why를 토큰화
  - `payload`:
    - 선택된 카드 ID / 슬라이더 값 / 선택 결과의 요약
    - `intent_tags` (예: INTENT 성격 태그)
  - `Traceability`:
    - `why_chain`에 “사용자가 무엇을 선택했고 그 선택이 어떤 UCL/PERSONA/코일 매핑으로 이어질지”를 기록
- 지식화(영구 보존) 포인트
  - UI 선택은 로그에 남는 것뿐 아니라, 유의미한 전환/결정일 경우 `project_knowledge.nature_tag = 'INTENT'`로 승격하여 장기 기억에 반영한다.

### ③ 직접 입력 데이터 (WILL / MULTIMODAL)

- 입력: 텍스트(채팅), 음성(STT), 영상(VLM)을 통해 들어오는 날것의 입력
- 처리 규격(Atom화 + 비식별화)
  - `payload`에는 원본을 직접 저장하지 않고, 비식별화된 5W1H 텍스트(또는 요약) + 원본 파일의 `ref_id`를 함께 저장한다.
  - `input_channel`은 원천에 따라 `VOICE | VIDEO | TEXT` 중 하나(또는 `MULTIMODAL`)
- VOID(비가시적 영감) 규칙
  - 입력이 또렷하지 않거나 망설임/불확실성이 감지되면 `HEXAGON how_state = VOID`를 부여하고, 넥슈가 **영감 모드(자아(UCL 템플릿) 파노라마 디스플레이)**로 전환하도록 한다.
  - 동시에 `payload.void_signals`에 체류/롤백/미선택 패턴 같은 행동 신호 근거를 JSON으로 남긴다.
- Traceability(Why Chain 역추적)
  - `ref_ids`(또는 `extra_data.ref_id_chain`)에 다음을 함께 저장해 인과를 역추적한다.
    - 입력 원본 파일의 ref_id
    - 전처리 결과물(비식별화된 5W1H 텍스트/요약)의 ref_id
    - (해당되는 경우) RAG 검색에 사용된 지식 ref_id 또는 후보군 ref_id

## 4. 지능적 족보(Traceability) 구조 규격

넥슈는 “의도(WILL) → 판단(ECHO) → 연주/실행(NEXU/Rive)” 데이터 사슬에서, 중간 단계의 근거를 반드시 저장해야 한다.

### 4.1 `project_logs.why_chain` (JSONB) 권장 형태

`why_chain`은 최소 다음 3종 노드로 구성한다.

- `inputs`: 어떤 신호(텍스트/행동/디바이스/TICK)를 기반으로 했는지(각 노드는 ref_id 또는 event_id를 가진다)
- `reasoning`: SLM/인디케이터가 어떤 내부 상태/규칙으로 판단했는지(모델/버전/프롬프트 요약 등은 extra_data.metadata에 둔다)
- `effects`: 어떤 액션 또는 후보 UCL 헤더/Persona 팩/코일 매핑으로 이어졌는지

> Why Chain의 필드 상세 구조는 추후 `[NEXU-SCHEMA]` v1.1에서 확정할 수 있으나, 역추적 가능하도록 **참조 키(ref_id/event_id)들은 절대 문자열만으로 끝내지 말고 JSON에 남겨야** 한다.

### 4.2 `project_knowledge.ref_ids` (JSONB)

`project_knowledge`의 `ref_ids`는 “이 지식이 어떤 로그/원본/파생물을 근거로 생겼는가”를 역추적하는 키 집합이다.

- 추천: `ref_ids` 내부에 `source_log_ids[]`, `source_multimodal_ref_ids[]`, `source_hexagon_ids[]` 같은 배열을 둔다.
- RAG에서 유사도를 계산할 때는 `confidence_score`와 함께 `ref_ids`로 “근거가 있는 지식”만 상위로 올리는 정책을 적용할 수 있다.

## 5. HEXAGON(5W1H) 토큰 운용 가이드(넥슈 전용 규칙)

- 토큰 매핑은 플랫폼의 HEXAGON 프로토콜 정의를 따르며, 넥슈는 **“어떤 이벤트가 어떤 토큰으로 들어가야 하는지”**만 규정한다.
- `how_state`에는 넥슈의 동태 상태를 반영한다.
  - `how_state = VOID`: 비가시적 영감/불확실성 구간
  - `how_state = FLOW/STUCK`: 실행 흐름/막힘/지연 상태(행동 신호 기반)
- `why_causality`는 6코일 가중치(또는 그에 준하는 인과 분류)로부터 도출된 판단 카테고리로 기록한다.

## 6. 예시(JSON) 스케치

### 예시 1) ECHO(자체 판단 → ASK)

- `pulse=ECHO`, `input_channel=AI_INFERENCE`
- `confidence_score=62`
- `extra_data` 예:
{
"candidate_ucl_headers": ["UCL.ACTION.SAVE", "UCL.ACTION.DELETE"],
"ask_question": "저장/삭제 중 어떤 의도로 보셨나요?",
"persona_pack_id": "persona.calm",
"void_related": false
}

### 예시 2) WILL(UI 카드 선택 → INTENT 지식화)

- `pulse=WILL`, `input_channel=UI_CARD`, `confidence_score=100`
- `extra_data` 예:
{
"selected_card_id": "card.now-self.intent_focus",
"intent_tags": ["INTENT"],
"applied_coil_weights": {"safety": 0.6, "creative": 0.4}
}

### 예시 3) WILL(MULTIMODAL → VOID 전환)

- `pulse=WILL`, `input_channel=VOICE|TEXT|VIDEO`
- `hexagon.how_state=VOID`
- `payload/ref_id` 예:
{
"normalized_5w1h_text": "지금은 방향을 못 잡겠지만, 작은 시작을 원해요.",
"multimodal_ref_id": "SNT-VOICE-20260319-0001",
"stt_ref_id": "SNT-STT-20260319-0001",
"void_signals": {"rollback_count": 2, "dwell_ms": 9000}
}

## 7. 다음 단계(문서 승격 v1.0 기준)

- `[NEXU-SCHEMA]` v1.0에서는 `why_chain`/`ref_ids`의 **최소 필드 목록(스키마 확정)**을 표준화한다.
- NEXU가 “프로젝트 외(Global)” 모드일 때 **effective_project_id**(즉, `project_id` 컬럼에 넣을 값) 지정 방식(글로벌 그림자 프로젝트 ID 계약)을 문서에 명시한다.

