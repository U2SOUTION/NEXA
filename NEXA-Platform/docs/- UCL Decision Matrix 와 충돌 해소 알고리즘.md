## UCL 토큰 충돌 해소 알고리즘을 설계

---

### 충돌의 3가지 유형 먼저 정의

```mermaid
flowchart TD
    subgraph types ["충돌 유형 분류"]
        t1["유형 1 — 권위 충돌\nCORE의 WILL vs DOMAIN의 RULE\n개인 의지 vs 시스템 절대 원칙"]
        t2["유형 2 — 승격 충돌\nFIELD의 FACT가 DOMAIN의 RULE로\n현장 사실이 시스템 규칙이 될 때"]
        t3["유형 3 — 소멸 충돌\nDURATION → STUCK → VOID\n언제 데이터가 죽는가"]
    end
```

이 세 가지를 순서대로 알고리즘으로 풀겠습니다.

---

## 유형 1 — 권위 충돌 알고리즘

### CORE·WILL vs DOMAIN·RULE 충돌 해소

```mermaid
flowchart TD
    input["WILL + 명령 입력"]
    check1{"DOMAIN RULE\n존재하는가?"}
    check2{"RULE 레벨이\n무엇인가?"}
    check3{"MUST vs\nSHOULD 비교"}
    check4{"긴박도\nUrgency?"}

    input --> check1
    check1 -->|없음| execute["✅ WILL 즉시 실행"]
    check1 -->|있음| check2

    check2 -->|"Level 0\n절대 규칙"| block["🚫 WILL 차단\n이유 설명 + 대안 제시"]
    check2 -->|"Level 1~2\n운영자·사용자 규칙"| check3

    check3 -->|"RULE=MUST\nWILL=SHOULD"| warn["🔔 경고 후\n사용자 최종 선택"]
    check3 -->|"RULE=SHOULD\nWILL=MUST"| override["👤 WILL 우선\n규칙 우회 로그 기록"]
    check3 -->|"둘 다 MUST"| check4

    check4 -->|"긴박도 HIGH\n응급·위험"| emergency["🚨 긴박 모드\nLevel 1~2 우회\n사후 보고"]
    check4 -->|"긴박도 LOW"| escalate["⬆️ 상위 권한자에게\n에스컬레이션"]
```

### 충돌 해소 우선순위 매트릭스

| WILL 강도 | RULE 레벨 | RULE 강도 | 긴박도 | 결과                        |
| --------- | --------- | --------- | ------ | --------------------------- |
| MUST      | Level 0   | MUST      | Any    | 🚫 차단 (Level 0 절대 우선) |
| MUST      | Level 1   | MUST      | HIGH   | 🚨 긴박 모드 우회           |
| MUST      | Level 1   | MUST      | LOW    | ⬆️ 에스컬레이션             |
| MUST      | Level 1   | SHOULD    | Any    | 👤 WILL 우선 + 로그         |
| MUST      | Level 2   | Any       | Any    | 👤 WILL 우선 + 룰 수정 제안 |
| SHOULD    | Level 0   | Any       | Any    | 🚫 차단                     |
| SHOULD    | Level 1   | MUST      | Any    | 🔔 경고 후 사용자 선택      |
| SHOULD    | Level 1   | SHOULD    | Any    | 👤 WILL 우선 (약한 충돌)    |
| MAY       | Any       | MUST      | Any    | 🔔 RULE 우선 권고           |

---

## 유형 2 — 승격 충돌 알고리즘

### FIELD FACT → DOMAIN RULE 승격 과정

```mermaid
flowchart TD
    fact["FIELD·FACT 발생\n현장에서 관찰된 사실"]

    subgraph accumulate ["누적 단계 (Sentinel 역할)"]
        a1["동일 패턴 감지\n3회 이상 반복"]
        a2["DURATION 상태로 전환\n단발 → 지속 패턴"]
        a3["Indicator에 패턴 보고"]
    end

    subgraph analyze ["분석 단계 (Indicator 역할)"]
        b1["LINK 생성\n패턴 간 관계 정의"]
        b2["LOGIC 검증\n이 패턴이 규칙이 될 논리적 근거"]
        b3["기존 RULE과 충돌 검사"]
    end

    subgraph promote ["승격 단계"]
        c1{"충돌 없음"}
        c2["Level 3 룰로 등록\nAI 학습 제안 규칙"]
        c3["사용자 승인 요청\nASK 토큰 발동"]
        c4{"사용자 승인"}
        c5["Level 2 룰로 승격\n사용자 정의 규칙"]
        c6["승격 취소\nFACT로 보존"]
    end

    fact --> accumulate
    a1 --> a2 --> a3 --> analyze
    b1 --> b2 --> b3 --> c1
    c1 -->|없음| c2 --> c3 --> c4
    c1 -->|있음| conflict["충돌 해소 알고리즘\n유형 1 적용"]
    c4 -->|승인| c5
    c4 -->|거절| c6
```

### 승격 조건 수치 기준

```
FACT → DURATION 전환 조건
  - 동일 패턴 3회 이상 반복
  - 반복 간격 72시간 이내
  - Confidence 평균 0.8 이상

DURATION → Level 3 RULE 제안 조건
  - DURATION 유지 기간 7일 이상
  - 패턴 일관성 85% 이상
  - 기존 RULE과 충돌 없음

Level 3 → Level 2 승격 조건
  - 사용자 명시적 승인 (ASK → WILL)
  - 승인 후 30일 검증 기간
  - 검증 기간 내 위반 없음
```

---

## 유형 3 — 소멸 충돌 알고리즘

### DURATION → STUCK → VOID 전환 조건

```mermaid
flowchart TD
    duration["DURATION 상태\n지속 중인 데이터·맥락"]

    subgraph stuck_check ["STUCK 전환 조건 검사"]
        s1{"마지막 업데이트\n경과 시간"}
        s2{"참조 빈도\n감소율"}
        s3{"외부 의존성\n단절 여부"}
    end

    subgraph void_check ["VOID 전환 조건 검사"]
        v1{"STUCK 유지\n기간"}
        v2{"복구 가능성\n판단"}
        v3{"연결된 LINK\n존재 여부"}
    end

    subgraph void_type ["VOID 유형 분류"]
        vt1["VOID·POTENTIAL\n잠재 상태\n(재활성 가능)"]
        vt2["VOID·ARCHIVE\n아카이브\n(읽기 전용 보존)"]
        vt3["VOID·PURGE\n완전 삭제\n(복구 불가)"]
    end

    duration --> stuck_check
    s1 -->|"24h 이상"| stuck["STUCK 전환"]
    s1 -->|"24h 미만"| duration

    stuck --> void_check
    v1 -->|"7일 이상"| v2
    v1 -->|"7일 미만"| stuck

    v2 -->|"복구 가능\n연결 LINK 있음"| vt1
    v2 -->|"보존 필요\n중요도 높음"| vt2
    v2 -->|"복구 불가\n참조 없음"| v3

    v3 -->|"LINK 없음"| vt3
    v3 -->|"LINK 있음"| vt2
```

### 상태 전환 수치 기준표

| 전환                          | 조건          | 수치 기준                      | TimescaleDB 연결      |
| ----------------------------- | ------------- | ------------------------------ | --------------------- |
| DURATION → STUCK              | 업데이트 중단 | 24시간 무갱신                  | 청크 쓰기 중단 감지   |
| STUCK → VOID·POTENTIAL        | 단기 미활용   | STUCK 7일 + 참조 0             | 압축 대상 표시        |
| VOID·POTENTIAL → DURATION     | 재활성        | 새 참조 발생                   | 압축 해제 후 복원     |
| VOID·POTENTIAL → VOID·ARCHIVE | 장기 미활용   | POTENTIAL 90일 유지            | TimescaleDB 압축 적용 |
| VOID·ARCHIVE → VOID·PURGE     | 완전 소멸     | ARCHIVE 365일 + 연결 LINK 없음 | 물리 삭제             |

---

## 핵심 알고리즘 — 통합 Decision Matrix

세 유형을 통합한 최종 판단 흐름입니다.

```mermaid
flowchart TD
    token["HEXAGON 토큰 수신\nWhere·When·Who·What·How·Why"]

    step1["1. Where 스코프 확인\nCORE / FIELD / DOMAIN"]
    step2["2. Who 강제성 확인\nWILL·ECHO·TICK·ASK\n+ MUST·SHOULD·MAY"]
    step3["3. What 성질 확인\nFACT·LINK·RULE"]
    step4["4. 충돌 유형 분류\n유형1·2·3 중 해당 판단"]
    step5["5. 해소 알고리즘 적용\n위 3개 알고리즘"]
    step6["6. How 상태 결정\nFLOW·STUCK·VOID"]
    step7["7. 실행 모드 결정\n즉시·확인·경고·차단·긴박"]

    token --> step1 --> step2 --> step3 --> step4
    step4 --> step5 --> step6 --> step7

    subgraph log ["모든 단계 로그 기록"]
        l1["PostgreSQL\n충돌 이력 저장"]
        l2["피드백 루프\n패턴 학습"]
    end

    step7 --> log
```

---

### PostgreSQL 스키마 연결 — 충돌 이력 테이블

```sql
CREATE TABLE token_conflicts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conflict_type   VARCHAR(20),     -- authority·promotion·decay
  token_will      JSONB,           -- 충돌 발생 WILL 토큰
  token_rule      JSONB,           -- 충돌 발생 RULE 토큰
  resolution      VARCHAR(20),     -- block·override·escalate·emergency
  resolution_reason TEXT,          -- 해소 이유 설명
  user_decision   VARCHAR(20),     -- approve·reject·pending
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 충돌 패턴 분석 쿼리
SELECT conflict_type,
       resolution,
       COUNT(*) as frequency,
       AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_resolve_sec
FROM token_conflicts
GROUP BY conflict_type, resolution
ORDER BY frequency DESC;
```

---

### 미완성으로 남기는 항목

| 항목                               | 이유                                     |
| ---------------------------------- | ---------------------------------------- |
| MUST vs MUST 동급 충돌의 자동 해소 | 철학적 판단 필요 — 기계가 결정하면 안 됨 |
| 6코일 밸런스 Why 레이어 연결       | 6코일 정의가 선행되어야 함               |
| ERA 토큰의 시대적 전환 조건        | 장기 비전과 연결 — 별도 설계 필요        |

---

> **이 알고리즘의 핵심 철학은 하나입니다.**
> MUST vs MUST 처럼 기계가 판단할 수 없는 충돌은 반드시 사람에게 올립니다.
> **Humanity 원칙 — AI가 결정할 수 없는 것은 결정하지 않는다.**
