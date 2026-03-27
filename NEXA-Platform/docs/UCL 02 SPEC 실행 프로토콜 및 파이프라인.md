# [NEXA-UCL-02] 실행 프로토콜 및 파이프라인

> 본 문서는 `- nexa UCL Protocol.md`와 `- nexa UCL 차별화된 구조는 무엇인가.md`를 통합한 실행 중심 규격서이다.  
> 철학/구조/알고리즘/UX를 한 파이프라인으로 정리 한다.

---

## 0) 목적

NEXA UCL은 입력을 해석하는 파서가 아니라, **사람의 의도(WILL)와 시스템 판단(ECHO), 실행 결과(EFFECT)**를 하나의 실행 사슬로 묶는 프로토콜이다.

- 멀티모달 입력을 HEXAGON(5W1H)으로 표준화
- 컨텍스트/룰 충돌을 선제적으로 검토
- 확신도·위험도·긴박도 기반 실행 모드 결정
- 도메인 독립 어댑터 실행
- 피드백 루프를 통해 단기/장기 학습

---

## 1) 철학 및 권한 체계

### 1.1 철학 레이어 (판단의 루트)

| 원칙            | 정의                        | 실행 원칙                                 |
| --------------- | --------------------------- | ----------------------------------------- |
| Liberation      | 반복은 AI, 판단/창조는 사람 | 자동화 가능한 것은 보조, 최종 결정은 사람 |
| Humanity        | 사람 소외 금지              | 고위험/저확신은 확인 요청                 |
| Domain Fluidity | 도메인 경계 최소화          | 파서-어댑터 분리로 확장                   |
| Expansion       | 의식 확장 제안              | 답변 이후 확장 관점 제공                  |
| Humility        | 본질 중심                   | 불필요한 복잡성 제거                      |

### 1.2 권한 레이어 (Rule Authority)

```
Level 0: 시스템 절대 규칙 (수정 불가)
Level 1: 플랫폼 운영 규칙 (관리자)
Level 2: 사용자 규칙 (개인 설정)
Level 3: AI 제안 규칙 (승인 후 반영)
```

충돌 우선순위: `Level 0 > Level 1 > Level 2 > Level 3`

---

## 2) UCL 5단계 실행 파이프라인

### 2.0 실행 사슬(Execution Chain) 생명주기와 실시간 동기화

파이프라인은 **전달만** 하는 것이 아니라, [NEXA-UCL-04]에 정의된 **`execution_chains` · `execution_steps`**의 생명주기를 **실시간으로 관장**한다.  
각 단계 전환 시 `ucl_packet.ucl_header.how_state`와 DB `execution_chains.how_state`는 동일 의미로 동기화한다(SMALLINT: FLOW, STUCK, VOID).

**5단계 파이프라인 ↔ `how_state` 연동(원칙)**

| 단계                  | 역할                  | `how_state` (실시간)                                                                          | 비고                                   |
| --------------------- | --------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------- |
| **Listen**            | 입력 표준화·패킷 창립 | **FLOW**                                                                                      | 실행 사슬 생성·진행 중                 |
| **Context Awareness** | 상태/룰 대조          | **FLOW** (정상) / **STUCK** (충돌·지연·저확신으로 진행 불가)                                  | STUCK 시 인디케이터·ASK 트리거 가능    |
| **Decision Making**   | 실행 모드 확정        | **FLOW** (즉시 실행) / **STUCK** (승인 대기·ASK) / **VOID** (영감 모드·맥락 플러시 후 재시작) | VOID는 “삭제”가 아닌 잠재 상태(UCL-04) |
| **Adapter Execution** | 논리→네이티브 실행    | **FLOW** / **STUCK** (어댑터 실패·타임아웃)                                                   | `execution_steps`에 원자 스텝 기록     |
| **Feedback Loop**     | 결과·학습 반영        | **FLOW** / **VOID** (세션 종료·아카이브로의 전환)                                             | 피드백 완료 후 사슬 정리               |

- **동기화 대상:** 오케스트레이터는 패킷 생성 시점에 `execution_chains` 행을 upsert하고, 단계마다 `how_state`·`updated_at`·필요 시 `why_chain`을 갱신한다.
- **스텝 단위:** `execution_steps.step_status`는 스텝별 FLOW/STUCK/COMPLETED/FAILED/VOID로 세분화한다(UCL-04 DDL 맥락).

---

### 2.0.1 영어 커널 — 파이프라인 IR vs 사용자 Summary

[UCL-01] **영어 커널 / 다국어 쉘** 전략에 맞춘다.

| 구분                                                               | 언어                     | 내용                             |
| ------------------------------------------------------------------ | ------------------------ | -------------------------------- |
| **HEXAGON IR·`ucl_header`·`execution_bundle` 내부 문자열**         | **영어(권장·기본)**      | 토큰 효율·모델 논리 일관성       |
| **사용자에게 보이는 요약·Self facet (자아의 단면) 문구·채팅 응답** | **한국어(또는 UI 로캘)** | Summary 레이어만 번역·로캘라이즈 |

- 파이프라인 **2.1~2.4**에서 생성·전파되는 중간 표현은 **영문 IR**을 기준으로 한다.
- 최종 **Feedback** 또는 UI 출력 직전에만 `presentation_locale`에 따라 Summary를 한국어로 둔다.

---

## 2.1 Listen (멀티모달 입력 표준화)

입력(Text/Voice/Video)을 타입별 전처리 후 HEXAGON 5W1H IR(JSONB)로 통합한다. **필드 키·값은 영문 IR 규약을 따른다**(위 2.0.1).

```json
{
  "who": "user_or_agent",
  "what": "verb+object",
  "when": "moment|duration|immediate",
  "where": "scope",
  "why": "inferred_intent",
  "how": "method_or_params",
  "raw": "raw_input",
  "input_type": "text|voice|video",
  "confidence": 0.0
}
```

예외:

- 변환 실패/노이즈: low confidence + 불확실 플래그
- 악성 입력: Level 0 차단 + 감사 로그

## 2.2 Context Awareness (상태/룰 대조)

`현재 상태(State)` + `선 룰(Level 0~3)`을 대조해 충돌을 탐지한다.

- 상태: 기기/환경/사용자 컨텍스트/최근 이력
- 룰: 절대/운영/사용자/AI 제안 룰
- 결과: 통과 또는 충돌 해소 엔진 분기

대표 충돌:

- 우천 시 창문 개방 금지
- 외출 중 가스 금지
- 결제 2차 인증 필수

## 2.3 Decision Making (의사결정)

핵심 변수: `Confidence x Risk x Urgency`

| Confidence | Risk | 룰 충돌      | Urgency | 실행 모드         |
| ---------- | ---- | ------------ | ------- | ----------------- |
| High       | Low  | 없음         | Any     | 즉시 실행         |
| High       | Low  | 있음         | Low     | 충돌 보고 후 대기 |
| High       | Mid  | 없음         | Low     | 사용자 확인       |
| Low        | Any  | Any          | Low     | 사용자 확인       |
| Any        | High | Any          | Low     | 조언/거절         |
| Any        | Any  | Level 0 위반 | Any     | 즉시 차단         |
| Any        | Any  | Any          | High    | 긴박 모드         |

실행 모드:

- 즉시 실행
- 확인 요청
- 충돌 보고
- 조언/거절
- 즉시 차단
- 긴박 모드(사후 보고 포함)

## 2.4 Adapter Execution (도메인 독립 실행)

파서는 논리 명령만 생성하고, 어댑터가 네이티브 API로 변환한다.

용어 경계(정합 기준):

- **일꾼:** 오케스트레이터가 지시하는 실행 주체의 상위 개념
- **워커:** 내부 정규화/가공/라우팅 담당(외부 장치 직접 실행 금지)
- **어댑터:** 외부 실행 경계(기기/API/서비스) 호출 담당
- 정책 판단(허용/차단/우회)은 오케스트레이터/UCL 의사결정 레이어가 담당하며, 어댑터는 승인된 실행 번들을 재판단 없이 수행한다.

```
UCL logical command -> adapter registry -> domain adapter -> native API
```

핸드오프 필수 필드(Worker -> Adapter):

- `capability_id`
- `execution_bundle`
- `constraints`
- `is_virtual`

도메인 예:

- IoT/업무/농업/산업/예술/지식(RAG)

실패 처리:

- 대체 어댑터 탐색
- 부분 성공 분리 보고
- 권한 부족/타임아웃 재시도 후 실패 처리

## 2.5 Feedback Loop (즉각·단기·장기)

- 즉각: 성공/실패/부분 성공 보고
- 단기: 반복 패턴 기반 룰 제안(승인 후 반영)
- 장기: 전체 패턴 분석 -> 어댑터/룰/플랫폼 진화 제안

## 2.6 UCL 패킷 구조 엄격 명세 (JSONB Key/Type)

실행 계층 간 통신은 아래 `ucl_packet` JSONB 계약을 기본으로 한다.

```json
{
  "packet_id": "uuid",
  "protocol_version": "string",
  "ucl_header": {
    "where_scope": "smallint",
    "when_tempo": "smallint",
    "who_pulse": "smallint",
    "what_intent": "smallint",
    "how_state": "smallint",
    "why_causality": "smallint",
    "authority_level": "smallint",
    "urgency_level": "smallint"
  },
  "execution_bundle": {
    "intent_text": "string",
    "target_capability_id": "string",
    "target_resource_id": "string|null",
    "params": "object",
    "constraints": "object",
    "adapter_hint": "string|null"
  },
  "context_bundle": {
    "session_id": "uuid",
    "project_id": "uuid",
    "scope_type": "string",
    "scope_subtype": "string|null",
    "persona_pack_id": "string|null",
    "coil_weights": "object",
    "recent_refs": "array"
  },
  "trace_bundle": {
    "inputs": "array",
    "reasoning": "array",
    "effects": "array"
  },
  "confidence_score": "smallint",
  "created_at": "timestamptz"
}
```

필수 키:

- top-level: `packet_id`, `protocol_version`, `ucl_header`, `execution_bundle`, `context_bundle`, `confidence_score`, `created_at`
- header: `where_scope`, `when_tempo`, `who_pulse`, `what_intent`, `how_state`, `why_causality`

타입 규칙:

- `smallint`: 토큰/레벨 값(정수 범위)
- `params`, `constraints`, `coil_weights`: JSON object
- `recent_refs`, `inputs/reasoning/effects`: JSON array
- ID류는 문자열(UUID/Capability ID 포함)

## 2.7 에이전트 핸드오버(Handover) 규격

오케스트레이터가 Agent A -> Agent B로 태스크를 넘길 때, 컨텍스트를 아래 3등급으로 분리한다.

**`actor_type` · 권한 상속 (Must-Pass 필수)**  
[UCL-04] `execution_chains` DDL 맥락: `actor_type` ∈ `USER` | `DEVICE` | `AGENT`, `actor_id`는 해당 유형의 UUID다. 핸드오버 시 아래를 **반드시** Must-Pass에 포함한다.

| 필드                                                           | 의미           | 상속 규칙                                                                                                                                                             |
| -------------------------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `actor_type`                                                   | 실행 주체 유형 | B로 넘길 때 **유지**하거나, 오케스트레이터가 명시적으로 `AGENT`로만 바꾼다(USER→AGENT 위임 시).                                                                       |
| `actor_id`                                                     | 실행 주체 ID   | **권한 범위가 좁은 쪽을 유지**: USER 권한으로 시작한 사슬은 AGENT만으로 승격할 수 있어도, 그 반대(AGENT→USER)는 불가. DEVICE는 capability 범위 내에서만 AGENT에 위임. |
| `capability_id` (또는 `execution_bundle.target_capability_id`) | 행사 가능 기능 | B가 동일 capability를 가질 때만 핸드오버 허용; 없으면 STUCK + ASK.                                                                                                    |

Must-Pass JSONB 예시 키(핸드오버 확장):

```json
{
  "actor_type": "USER|DEVICE|AGENT",
  "actor_id": "uuid",
  "capability_scope": ["nexa.platform.xxx", "..."],
  "delegation": { "from": "agent_a_id", "to": "agent_b_id", "reason": "string" }
}
```

1. **Must-Pass (항상 전달)**

- `ucl_header` 전체
- **`actor_type`, `actor_id`** 및 위 **권한 상속** 규칙을 만족하는 `capability_id` / `capability_scope`
- `execution_bundle` 전체
- `context_bundle.project_id`, `session_id`, `scope_type`, `scope_subtype`
- `context_bundle.coil_weights`, `persona_pack_id`
- `trace_bundle.inputs` 최근 N개(기본 5)
- 보안/권한 관련 결정 토큰(ASK, BLOCK, LEVEL0 위반 플래그)

2. **May-Pass (조건부 전달)**

- `trace_bundle.reasoning` 상세 체인
- 장문 대화 원문/중간 추론 텍스트
- 직전 에이전트의 내부 힌트(`adapter_hint`, 탐색 후보 목록)

3. **Ephemeral-Drop (휘발/폐기)**

- 에이전트 내부 캐시, 임시 프롬프트, 디버그 로그
- 재현 불필요한 중간 임베딩 버퍼
- PII가 포함된 원본 임시 텍스트(비식별화 후 ref만 유지)

핸드오버 패킷 키:

- `handover.from_agent`, `handover.to_agent`, `handover.reason`
- `handover.pass_level` (`must` | `must+may`)
- `handover.expire_at` (휘발 컨텍스트 만료 시각)

## 2.8 어댑터 실패 -> UCL 에러 토큰 매핑

어댑터 실행 실패는 그대로 문자열로 두지 않고 `error_token`으로 재정규화하여 피드백 루프/의사결정으로 재투입한다.

실패 책임 분리:

- 워커 실패(`PARSE_*`, `IR_*`, `ROUTING_*`)는 정규화/해석 레이어에서 복구(재파싱, 대체 워커 라우팅)한다.
- 어댑터 실패(`ADAPTER_*`, `NATIVE_*`)는 실행 레이어에서 복구(대체 어댑터, 재시도, ASK 전환)한다.

기본 매핑:

- `ADAPTER_TIMEOUT` -> `how_state=STUCK`, `who_pulse=ASK`, `what_intent=FACT`
- `ADAPTER_AUTH_DENIED` -> `why_causality=RULE_CONFLICT`, `who_pulse=ASK`
- `ADAPTER_NOT_FOUND` -> `what_intent=LINK_MISSING`, `how_state=STUCK`
- `ADAPTER_PARTIAL_SUCCESS` -> `what_intent=PARTIAL_EFFECT`, `how_state=FLOW`
- `ADAPTER_FATAL` -> `why_causality=LEVEL0_GUARD`, `who_pulse=ECHO`, 실행 차단 후보

에러 패킷(`ucl_error_packet`) 권장 키:

```json
{
  "packet_id": "uuid",
  "origin_packet_id": "uuid",
  "error_code": "string",
  "error_token": {
    "where_scope": "smallint",
    "when_tempo": "smallint",
    "who_pulse": "smallint",
    "what_intent": "smallint",
    "how_state": "smallint",
    "why_causality": "smallint"
  },
  "retry_policy": {
    "retryable": "boolean",
    "max_retry": "smallint",
    "backoff_ms": "integer"
  },
  "fallback_action": "string",
  "user_message": "string"
}
```

재투입 규칙:

- `retryable=true`면 2.4 단계 재시도 체인으로 회귀
- `retryable=false`면 2.3 Decision Matrix로 전달해 `확인/거절/대체` 결정
- 모든 에러 토큰은 `execution_chains.why_chain` 및 필요 시 `project_logs.why_chain.effects[]`에 적재

---

## 3) 차별화 포인트: 질문지 없는 Ambient UCL

기존 “질문-답변 온보딩” 대신, **비침습 Self facet (자아의 단면) 기반 수동 유도**를 채택한다.

핵심 원칙:

- Ambient Interface: 항상 주변에 있으나 방해하지 않음
- Progressive Disclosure: 막힘 시 자연 부상
- Passive Elicitation: 질문 대신 행동에서 추론
- Zero Onboarding: 설정 없이 즉시 사용

Self facet (자아의 단면) 타입(예):

- Now (현재 흐름)
- Energy (활력/속도)
- Direction (빠르게/깊게)
- Discovery (패턴 발견)

막힘 트리거(예):

- 타이핑 멈춤, 반복 수정, 제안 연속 거절, 과도한 세션 길이

공통 원칙:

- 클릭 강요 없음
- 팝업/모달/알림음 금지
- 클릭 1회로 내부 역방향 분해 수행

### 3.1 시나리오: 「지금의 나」Self facet (자아의 단면) → HEXAGON 재구성 (질문지 없는 온보딩)

사용자가 별도 설문 없이 **「지금의 나」(Now 계열) Self facet (자아의 단면)**를 한 번 클릭하면, 파이프라인은 아래 순서로만 진행한다.

1. **Listen:** 클릭 이벤트를 입력으로 수집; Self facet (자아의 단면)에 매핑된 프리셋 ID(예: `now_persona_v3`)를 IR에 합친다.
2. **Awareness:** 현재 세션·프로젝트·디바이스 상태와 Level 0~3 룰을 대조; 충돌 시 **STUCK**으로 전환해 ASK만 띄운다(긴 질문지 없음).
3. **Decision:** Self facet (자아의 단면)가 의미하는 **의도 묶음**(예: “집중 모드”, “가벼운 대화”)을 `what_intent`·`why_causality`에 반영; 승인이 필요 없으면 **FLOW** 유지.
4. **역방향 분해(동시):** §4의 1~5단계를 한 번에 실행 — HEXAGON 토큰 재작성, 코일(Source/Domain/Project) 재조정, 에이전트·페르소나 전환, UCL 후보 블록 생성, `how_state`가 VOID가 아니면 WILL/즉시 실행 경로 반영.
5. **Execution / Feedback:** `execution_chains`에 사슬 기록; 사용자에게는 **한국어 Summary**(Self facet (자아의 단면) 확인 문구 + 한 줄 요약)만 노출하고, 내부 IR은 영문 유지(2.0.1).

이 흐름이 **Ambient UCL**: 질문 리스트 없이 **행동 1회 = 의미 재구성**이다.

---

## 4) 역방향 분해(Reverse Decomposition)

Self facet (자아의 단면) 클릭 1회가 내부에서 다음을 동시 수행한다.

1. HEXAGON 토큰 재구성 (**영문 IR 기준**으로 정규화, 2.0.1)
2. 코일 밸런서 재조정(Source/Domain/Project)
3. 에이전트/페르소나 전환
4. UCL 후보 블록 생성
5. 실행 전 ASK/WILL 상태 반영

즉, 사용자에게는 단순한 선택으로 보이지만, 내부적으로는 **의도-상태-실행 경로를 재합성**한다.  
「지금의 나」시나리오(§3.1)와 동일한 메커니즘이 다른 Self facet (자아의 단면)(에너지·방향·발견)에도 적용 가능하다.

---

## 5) VOID와 영감 모드

`how_state = VOID`는 “비어 있음”이 아니라, **잠재적/비가시적 상태**로서 영감 모드 진입 신호다.

- 컨텍스트 플러시(선입관 완화)
- 관찰 모드(저자극 표현: Lumina/Jitter)
- 자아 파노라마(UCL 템플릿/오케스트라 후보) 제시
- 선택 시 ASK -> WILL 승격 후 실행 사슬 연결

---

## 6) 충돌 조율 수식(실행 엔진 관점)

### 6.1 지능 위계 우선권

`Action = IsSafetyRisk ? EdgeReflex : PlatformInsight`

- 안전 위험이면 엣지(반사)가 우선
- 저확신이면 ASK로 전환

### 6.2 코일 밸런서 합성

`W_final = W_source + f(W_domain) + f(W_project)`

- 하드 도메인: 안전/안정 임계치 강제(clamp)
- 유연 도메인: 창의/확장 가중 허용

### 6.3 좌표 합성(믹서 노드)

`CanvasPoint = (GPS * W_stability) + (LogicID * W_creative)`

- 안정/창의 가중으로 물리-개념 좌표를 조율

---

## 7) 데이터·스키마 연계 포인트

**실시간 실행 계층 ([NEXA-UCL-04])**

- `execution_chains`: UCL 패킷 단위 사슬, `how_state`(FLOW/STUCK/VOID), `actor_type`/`actor_id`, `why_chain`
- `execution_steps`: 원자 스텝, `step_status`, `is_virtual`, 타임머신 스냅샷
- `execution_logs`: 어댑터 응답·지연·에러 토큰 시계열

**프로젝트·지식·사후 기록**

- `project_logs`: 실행 이력, why_chain, confidence_score (사후 분석·감사 보조)
- `project_knowledge`: 지식화, ref_ids, embedding
- `project_orchestra`: 워크플로/페르소나/스킬
- `orchestra_scores`: 템플릿 기반 자아 파노라마
- `balance_coil_templates`: 코일 밸런서 템플릿 적용

Why Chain 권장 구조:

- `inputs` (신호/근거 ref)
- `reasoning` (판단 로직)
- `effects` (액션/표정/UCL 결과)

---

## 8) 운영 규칙 요약

- Level 0 위반은 즉시 차단
- 저확신·중위험 이상은 확인 우선
- 긴박 모드는 사후 보고 필수
- 학습/규칙 반영은 승인 기반
- 기술 노출 최소화, 사용자 부담 최소화

---

## 9) 결론

UCL은 단순 파서가 아니라,  
**철학(Principle) -> 구조(Role/Rule) -> 판단(Matrix) -> 실행(Adapter) -> 성장(Feedback)**  
으로 이어지는 실행 프로토콜이다.

NEXA의 차별성은 “묻는 시스템”이 아니라, **방해하지 않고 관찰하며 필요한 순간에만 조율하는 시스템**이라는 점에 있다.
