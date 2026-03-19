# [NEXA-UCL-03] 의사결정 및 충돌 해소 알고리즘

> 본 문서는 `- nexa UCL Coil Conflict Matrix.md`와 `- nexa UCL Decision Matrix 와 충돌 해소 알고리즘.md`를 통합한 규격서다.  
> 코일 밸런서 충돌(쌍 기준)과 UCL 토큰 충돌(유형 기준)을 하나의 실행 프레임으로 정리한다.

---

## 0. 목적

UCL의 충돌은 두 층에서 발생한다.

1. **코일 밸런서 충돌**: Safety/Stability/Efficiency/Autonomy/Creative 사이의 긴장
2. **토큰 충돌**: WILL-RULE 권위 충돌, FACT-RULE 승격 충돌, DURATION-STUCK-VOID 소멸 충돌

본 문서는 이 두 층을 하나의 Decision Pipeline으로 통합한다.

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

### 1.2 Humanity 원칙

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

기본 수치 기준(초안):
- FACT -> DURATION: 3회 반복, 72h 이내, confidence 평균 >= 0.8
- DURATION -> Level 3 제안: 7일 유지, 일관성 >= 85%
- Level 3 -> Level 2: 사용자 승인 + 검증 기간 통과

## 3.3 유형 3: 소멸 충돌 (DURATION -> STUCK -> VOID)

대상: 맥락/데이터 생애주기 전환

전환 기준(초안):
- DURATION -> STUCK: 24h 무갱신
- STUCK -> VOID.POTENTIAL: STUCK 7일 + 참조 0
- VOID.POTENTIAL -> VOID.ARCHIVE: 90일 유지
- VOID.ARCHIVE -> VOID.PURGE: 365일 + 링크 없음

VOID 해석:
- POTENTIAL: 재활성 가능
- ARCHIVE: 읽기 전용 보존
- PURGE: 삭제 대상

---

## 4. 통합 Decision Matrix

UCL 토큰 + 코일 상태를 함께 평가한다.

| Confidence | Risk | Rule Conflict | Urgency | Coil Conflict | 실행 모드 |
|---|---|---|---|---|---|
| High | Low | 없음 | Any | 경미 | 즉시 실행 |
| High | Low | 있음 | Low | 중간 | 충돌 보고 후 대기 |
| High | Mid | 없음 | Low | 중간 | 사용자 확인 |
| Low | Any | Any | Low | Any | 사용자 확인 |
| Any | High | Any | Low | Any | 조언/거절 |
| Any | Any | Level 0 위반 | Any | Any | 즉시 차단 |
| Any | Any | Any | High | Any | 긴박 모드 |

### 4.1 에러 토큰 연동 규칙 (Adapter Failure -> Decision)

`[NEXA-UCL-02]`의 `ucl_error_packet.error_token`은 아래 규칙으로 본 매트릭스에 재투입한다.

- `ADAPTER_TIMEOUT` / `ADAPTER_NOT_FOUND`  
  -> 기본 `Risk=Mid`, `Rule Conflict=있음(운영 제약 가능성)`, 실행 모드 `사용자 확인` 또는 `충돌 보고 후 대기`
- `ADAPTER_AUTH_DENIED`  
  -> `Rule Conflict=Level 1~2 이상`, 실행 모드 `사용자 확인`(권한 상승 요청) 또는 `조언/거절`
- `ADAPTER_PARTIAL_SUCCESS`  
  -> `Risk=Low~Mid`, 실행 모드 `충돌 보고 후 대기` + 부분 성공/실패 분리 처리
- `ADAPTER_FATAL`  
  -> `Rule Conflict=Level 0 위반 후보`로 취급, 실행 모드 `즉시 차단` 우선

재시도 가능한 오류는 재시도 후 동일 에러 반복 시 `Urgency`를 낮추고 `확인 요청` 경로로 강제 전환한다.

---

## 5. 실행 파이프라인 (요약)

1. HEXAGON 토큰 수신 (`where/when/who/what/how/why`)
2. 스코프/강도/성질 판별
3. 충돌 유형 분류 (권위/승격/소멸)
4. 코일 쌍 충돌 평가
5. 통합 Decision Matrix 적용
6. 실행 모드 결정 (즉시/확인/경고/차단/긴박)
7. 로그/피드백 적재

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

---

## 8. 결론

NEXA UCL의 충돌 해소는 단순 if-else가 아니라,
**권위(Authority), 생애주기(Decay), 승격(Promotion), 코일 밸런서(Coil Balancer)**를 함께 보는 다층 의사결정이다.

최종 원칙은 명확하다.

> 안전은 딱딱하게(Deterministic), 지능은 유연하게(Flexible).  
> 그리고 기계가 판단할 수 없는 MUST 충돌은 반드시 사람에게 넘긴다.

