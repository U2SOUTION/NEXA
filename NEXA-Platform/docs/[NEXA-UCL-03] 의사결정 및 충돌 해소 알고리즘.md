# [NEXA-UCL-03] 의사결정 및 충돌 해소 알고리즘

> 본 문서는 `- nexa UCL Coil Conflict Matrix.md`와 `- nexa UCL Decision Matrix 와 충돌 해소 알고리즘.md`를 통합한 규격서다.  
> 코일 밸런서 충돌(쌍 기준)과 UCL 토큰 충돌(유형 기준)을 하나의 실행 프레임으로 정리한다.

---

## 0. 목적

UCL의 충돌은 두 층에서 발생한다.

1. **코일 밸런서 충돌**: Safety/Stability/Efficiency/Autonomy/Creative 사이의 긴장
2. **토큰 충돌**: WILL-RULE 권위 충돌, FACT-RULE 승격 충돌, DURATION-STUCK-VOID 소멸 충돌

본 문서는 이 두 층을 하나의 Decision Pipeline으로 통합한다.

**연계:** 의사결정 결과는 [NEXA-UCL-02] §2.0과 같이 `execution_chains.how_state`(FLOW / STUCK / VOID) 및 `who_pulse`(ASK 등)에 **즉시 반영**되어 실행 사슬과 동기화된다.

---

## 1. 공통 원칙

### 1.1 우선순위 고정 규칙

```
Safety     > Stability > Efficiency > Autonomy > Creative
```

- Safety: 절대 우선 (시스템 고정)
- Stability/Efficiency: 시스템 레이어
- Autonomy/Creative: 사용자 레이어
- 단, 긴박 모드에서는 Efficiency가 Stability보다 앞설 수 있음

### 1.2 가상 실행 분기: `is_virtual` · `target_entity_type`

[UCL-04] `execution_steps`의 **`is_virtual = true`**(시뮬레이션·Dry-run)일 때는 **물리적 EFF(실행결과)가 발생하지 않으므로** 코일 해소 알고리즘이 **별도 분기**를 탄다.

| 조건 | Safety 코일 | Creative 코일 | 해석 |
|------|-------------|----------------|------|
| **`is_virtual = false`** + `target_entity_type` ∈ {`PHYSICAL`, `NEXU`, …} | **표준 강도** | 기본 가중 | 실제 장비·물리 공간에 영향 가능 |
| **`is_virtual = true`** | **완화(시뮬레이션 모드)** | **상향(탐색 허용)** | Safety는 **Level 0(절대 규칙)만** 강제 유지, 그 외는 “예측 실패”로만 기록 |
| `AUTHORIZED_VIRTUAL` / `SIMULATION_NODE` | 위와 동일하게 **가상 계열**로 취급 가능 | 동일 | 명시적 가상 엔티티 |

**규칙 (Must):**
- 시뮬레이션에서도 **Level 0 위반**은 차단·`Safety VOID`와 동일하게 처리한다(UCL-04 §3).
- 시뮬레이션에서는 **Stability 하한**을 일시 완화할 수 있으나, **실행 승격**(`is_virtual: true → false`) 시에는 통합 매트릭스를 **다시 전체 Safety 가중**으로 평가한다.

### 1.3 Humanity 원칙

> MUST vs MUST 동급 충돌은 기계가 자동 확정하지 않는다.  
> 반드시 사람에게 에스컬레이션한다.

---

## 2. 코일 밸런서 충돌 매트릭스 (쌍 기반)

## 2.1 10개 충돌 쌍

- 높은 빈도:  
  - Safety <-> Autonomy  
  - Safety <-> Creative  
  - Stability <-> Creative  
  - Efficiency <-> Autonomy
- 중간 빈도:  
  - Stability <-> Autonomy  
  - Efficiency <-> Creative  
  - Safety <-> Efficiency
- 낮은 빈도:  
  - Safety <-> Stability  
  - Stability <-> Efficiency  
  - Autonomy <-> Creative

## 2.2 핵심 쌍 해소 규칙

### A) Safety <-> Autonomy

| 상황 | 해소 |
|---|---|
| 위반 없음 | 자율 실행 |
| 경미 위험 | Safety 우선 + 사후 경고 |
| 위험 감지 | 실행 차단 + 이유 설명 |
| Level 0 위반 | 즉시 차단 + 로그/알림 |

### B) Safety <-> Creative

| 상황 | 해소 |
|---|---|
| 위반 없음 | 창의 제안 허용 |
| 경미 위험 | 제안 허용, 실행 제한 |
| Safety 위반 | 제안/실행 차단 |

**보충:** `is_virtual = true`인 스텝/체인에서는 “경미 위험” 구간에서 **Creative 가중을 한 단계 상향**할 수 있다(§1.2). Level 0는 예외.

### C) Stability <-> Creative

- 기본: Stability를 보전하면서 Creative를 제한적 허용
- 실험/탐색 컨텍스트: Creative 가중 상향 가능
- 운영/하드 도메인: Stability 하한 강제

### D) Efficiency <-> Autonomy

| 상황 | 해소 |
|---|---|
| 저위험 + 고효율 필요 | Efficiency 우선 |
| 설명/검증 필요 | Autonomy 우선(확인 후 실행) |
| 긴박 모드 | Efficiency 우선, Autonomy 임시 하향 |

### E) 기타 쌍

- Safety <-> Efficiency: 가장 빠른 **안전 경로** 우선
- Efficiency <-> Creative: 병렬 제시(빠른 경로 + 창의 경로)
- Autonomy <-> Creative: 사용자 레이어 직접 조정

---

## 3. 토큰 충돌 알고리즘 (유형 기반)

## 3.1 유형 1: 권위 충돌 (WILL vs RULE)

대상: `CORE.WILL`과 `DOMAIN.RULE` 충돌

결정 순서:
1. RULE 존재 확인
2. RULE 레벨(Level 0~3) 확인
3. MUST/SHOULD/MAY 강도 비교
4. Urgency(긴박도) 반영

결과:
- Level 0 충돌: 차단
- RULE MUST vs WILL SHOULD: 경고 + 사용자 선택
- RULE SHOULD vs WILL MUST: WILL 우선 + 우회 로그
- MUST vs MUST: 에스컬레이션 (긴박 HIGH면 긴박 모드)

## 3.2 유형 2: 승격 충돌 (FACT -> RULE)

대상: `FIELD.FACT`를 `DOMAIN.RULE`로 승격하는 과정

승격 파이프:
1. 반복 패턴 누적 (FACT -> DURATION)
2. LINK/LOGIC 검증
3. 기존 RULE과 충돌 검사
4. Level 3 제안 룰 등록
5. ASK -> WILL 승인 시 Level 2 승격

**학습·제안 파이프라인 수치(초안)** — `execution_chains`의 **VOID/PURGE 일정과는 별개**이나, **승격된 RULE이 영구 저장**될 때는 `project_knowledge`·`execution_chains.why_chain`에 근거 ref를 남긴다.

- FACT -> DURATION: 3회 반복, 72h 이내, confidence 평균 >= 0.8
- DURATION -> Level 3 제안: 7일 유지, 일관성 >= 85%
- Level 3 -> Level 2: 사용자 승인 + 검증 기간 통과

## 3.3 유형 3: 소멸 충돌 (FLOW -> STUCK -> VOID) — [NEXA-UCL-04] 정렬

대상: **`execution_chains` 생명주기**와 동일한 수치 기준을 쓴다. 아래는 UCL-04 **데이터 유형별 전이 임계치**와 **일치**해야 한다.

### 3.3.1 엣지 반사 사슬 (Sentinel / TICK)

| 전이 | 수치 기준 (UCL-04) |
|------|---------------------|
| FLOW → STUCK | 30초 무갱신 |
| STUCK → VOID.POTENTIAL | 5분 지속 |
| VOID.POTENTIAL → VOID.ARCHIVE | 24시간 경과 (장기 오프라인) |
| VOID.ARCHIVE → VOID.PURGE | 30일 (참조 사슬 없을 때) |

### 3.3.2 인디케이터 서사 사슬 (WILL / ECHO)

| 전이 | 수치 기준 (UCL-04) |
|------|---------------------|
| FLOW → STUCK | 1시간 무응답 |
| STUCK → VOID.POTENTIAL | 세션 명시 종료 **즉시** 또는 **24시간** |
| VOID.POTENTIAL → VOID.ARCHIVE | **90일** 경과 (TimescaleDB 압축 정책과 연동) |
| VOID.ARCHIVE → VOID.PURGE | **365일** (법적·보안 소멸) |

### 3.3.3 그림자 프로젝트 특례 (UCL-04 §5)

- TRIAL 등: `VOID.ARCHIVE` 생략 후 **7일** 경과 시 `VOID.PURGE` 가능 — 일반 인디케이터 표와 **불일치할 수 있음**(의도적 휘발).

VOID 해석:
- POTENTIAL: 재활성 가능
- ARCHIVE: 읽기 전용 보존
- PURGE: 삭제 대상

---

## 4. 통합 Decision Matrix

UCL 토큰 + 코일 상태 + **`confidence_score`(SMALLINT)** + **`target_entity_type`** 를 함께 평가한다.

### 4.0 `target_entity_type` 가중치 (엔티티 계열)

[UCL-04] `execution_steps.target_entity_type` 예: `PHYSICAL`, `NEXU`, `AUTHORIZED_VIRTUAL`, `SIMULATION_NODE` 등.

| `target_entity_type` 계열 | Risk 기본 가중 | Creative 허용 | 비고 |
|---------------------------|----------------|---------------|------|
| **PHYSICAL** | +1 단계 상향 (보수) | 하한 유지 | 실물 장비·공간 |
| **NEXU** | 기본 | 기본 | 넥슈(가상/피지컬 경계는 capability로 추가 판별) |
| **AUTHORIZED_VIRTUAL** / **SIMULATION_NODE** | 가상 기본 | 상향 가능 | `is_virtual`과 조합 시 §1.2 적용 |
| **`is_virtual = true`** (스텝) | 가상 분기 | **Creative 상향** | Safety는 Level 0만 강제 |

**`confidence_score` 연동 (동적 임계값):**
- 기준값은 고정 95가 아니라 `project_settings.user_defined_threshold`를 사용한다(기본 95, UI 조정 범위 `±15%`).
- **`confidence_score >= user_defined_threshold`**: 자율 실행 후보(다른 충돌 없을 때).
- **`confidence_score < user_defined_threshold`**: **ASK 강제** — `who_pulse = ASK`, `how_state = STUCK`(승인 대기)로 동기화한다.
- 매트릭스의 “사용자 확인” 행과 합치시, **저확신 + PHYSICAL**이면 PHYSICAL 가중으로 **ASK 우선**.

### 4.1 매트릭스 (요약 표)

아래는 `target_entity_type`·`confidence_score`를 이미 반영한 **효과적** 실행 모드다(세부는 엔진이 코일 가중으로 계산).

| Confidence / score | Risk(엔티티 가중 후) | Rule Conflict | Urgency | Coil Conflict | 실행 모드 | 펄스/상태 |
|---|---|---|---|---|---|---|
| High / `>= user_defined_threshold` | Low | 없음 | Any | 경미 | 즉시 실행 | `how_state=FLOW`, `who_pulse` 유지 |
| High / `>= user_defined_threshold` | Low | 있음 | Low | 중간 | 충돌 보고 후 대기 | `STUCK` + 필요 시 `ASK` |
| High / `< user_defined_threshold` | Any | Any | Low | Any | **사용자 확인(ASK)** | **`who_pulse=ASK`**, `STUCK` |
| Low / Any | Any | Any | Low | Any | 사용자 확인 | **`who_pulse=ASK`**, `STUCK` |
| Any | High | Any | Low | Any | 조언/거절 | `ECHO` 또는 `ASK` |
| Any | Any | Level 0 위반 | Any | Any | 즉시 차단 | 차단 + `Safety VOID` 검토 |
| Any | Any | Any | High | Any | 긴박 모드 | `FLOW` + 사후 보고 |

**게이트 확정 규칙 (Must):**
- `user_defined_threshold`는 Decision Matrix의 **실행 게이트**다.
- 게이트 미달(`confidence_score < user_defined_threshold`)은 다른 완화 신호가 있어도 우선적으로 `ASK/STUCK`으로 전이한다.
- 게이트 이상이어도 Level 0/고위험/권위 충돌 규칙은 그대로 우선 적용한다.

### 4.2 에러 토큰 재투입 규칙 (`ucl_error_packet` → 매트릭스 → ASK)

`[NEXA-UCL-02]`의 **`ucl_error_packet`**은 **의사결정 매트릭스로 재투입**되며, 아래에 따라 **`who_pulse = ASK`** 및 **`how_state = STUCK`**를 **확정**한다.

| `error_code` | 매트릭스 입력 | `how_state` | `who_pulse` | 비고 |
|--------------|---------------|-------------|-------------|------|
| `ADAPTER_TIMEOUT` | Risk=Mid, 확인 필요 | **STUCK** | **ASK** | `retryable=true`면 재시도 후 동일 오류 시 ASK 고정 |
| `ADAPTER_NOT_FOUND` | Risk=Mid, 운영 제약 | **STUCK** | **ASK** | 대체 어댑터 탐색 실패 시 사용자 선택 |
| `ADAPTER_AUTH_DENIED` | Rule 충돌(권한) | **STUCK** | **ASK** | 권한 상승·다른 `actor_type` 위임 안내 |
| `ADAPTER_PARTIAL_SUCCESS` | Risk=Low~Mid | **FLOW** 또는 **STUCK** | **ASK**(선택) | 남은 스텝 진행 여부 확인 시 ASK |
| `ADAPTER_FATAL` | Level 0 후보 | 차단 우선 | **ECHO** 또는 **ASK** | Safety VOID 연동; 사람 개입 없이 복구 불가하면 ASK |

**재투입 절차 (확정):**
1. `error_token`의 HEXAGON을 현재 `ucl_header`와 병합(또는 덮어쓰기 규칙은 UCL-02 §2.8).
2. `confidence_score`를 에러 심각도에 따라 하향(예: 타임아웃 반복 시 `user_defined_threshold` 미만 강제).
3. **ASK가 필요한 모든 경우** `who_pulse := ASK`, `how_state := STUCK`를 **패킷·`execution_chains`에 동시 기록**.
4. `why_chain.effects[]`에 `error_code`, `retry_policy`, `fallback_action` 요약을 남긴다.

재시도 가능한 오류는 재시도 후 동일 에러 반복 시 `Urgency`를 낮추고 **ASK 경로로 강제 전환**한다.

---

## 5. 실행 파이프라인 (요약)

1. HEXAGON 토큰 수신 (`where/when/who/what/how/why`)
2. **`is_virtual` · `target_entity_type` 판별** → §1.2 가상 분기 여부 결정
3. 스코프/강도/성질 판별 + **`confidence_score`**
4. 충돌 유형 분류 (권위/승격/소멸)
5. 코일 쌍 충돌 평가
6. 통합 Decision Matrix 적용 (§4)
7. **`ucl_error_packet`이면 §4.2 재투입 후 ASK/STUCK 확정**
8. 실행 모드 결정 (즉시/확인/경고/차단/긴박)
9. `execution_chains` / `why_chain` / 피드백 적재

---

## 6. 로그 스키마 권장 (충돌 이력)

```sql
CREATE TABLE token_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conflict_type VARCHAR(20),       -- authority | promotion | decay | coil_pair
  token_will JSONB,
  token_rule JSONB,
  coil_context JSONB,              -- {safety, stability, efficiency, autonomy, creative}
  resolution VARCHAR(20),          -- block | override | escalate | emergency | confirm
  resolution_reason TEXT,
  user_decision VARCHAR(20),       -- approve | reject | pending
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. 미완성 항목 (다음 설계)

- MUST vs MUST 자동 해소 금지 영역의 상세 권한 정책
- 코일 밸런서 Why 레이어와 토큰 why_causality 정규 매핑
- ERA(장기 시간축) 전환 기준
- 도메인별 긴박도(Urgency) 수치 표준
- `target_entity_type` 전체 enum과 NEXU 물리/가상 세부 매핑 표준화

---

## 8. 결론

NEXA UCL의 충돌 해소는 단순 if-else가 아니라,
**권위(Authority), 생애주기(Decay), 승격(Promotion), 코일 밸런서(Coil Balancer)**를 함께 보는 다층 의사결정이다.

최종 원칙은 명확하다.

> 안전은 딱딱하게(Deterministic), 지능은 유연하게(Flexible).  
> 그리고 기계가 판단할 수 없는 MUST 충돌은 반드시 사람에게 넘긴다.

