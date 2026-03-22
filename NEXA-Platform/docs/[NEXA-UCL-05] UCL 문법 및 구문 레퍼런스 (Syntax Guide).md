### [NEXA-UCL-05] UCL 문법 및 구문 레퍼런스 (Syntax Guide)

본 문서는 개발자와 AI 에이전트가 NEXA 플랫폼의 '악보'인 UCL(Unified Composition Language)을 직접 작성하기 위한 **DSL(Domain Specific Language) 표준 명세**입니다.

- UCL은 인간의 의지(WILL)와 시스템의 판단(ECHO)을 실제 물리적 액션으로 번역하는 핵심 규격입니다.

---

#### 1. UCL 패킷 기본 구조 (Top-level)

UCL 패킷은 JSONB 형식으로 구성되며, 인디케이터(Indicator)와 어댑터(Adapter) 간의 통신 계약을 정의합니다.

```json
{
  "packet_id": "UUID-v7",
  "protocol_version": "1.0",
  "ucl_header": { "HEXAGON_5W1H_TOKENS" },
  "execution_bundle": {
    "capability_id": "nexa.edge.device.action",
    "params": { "명령_파라미터" },
    "constraints": { "실행_제약_조건" }
  },
  "context_bundle": { "coil_weights": {}, "persona_pack_id": "" },
  "confidence_score": 100
}
```

---

#### 2. HEXAGON(5W1H) 헤더 표준 토큰 (Cheat Sheet)

모든 데이터 패킷의 헤더에 위치하여 1ms 내에 상황의 중요도를 판단하게 하는 지능적 인덱스입니다.
각 토큰은 코일 밸런서의 특정 가중치 임계값에 의해 동적으로 선택됨"

| 레이어    | 주요 토큰 (SMALLINT 매핑) | 의미 및 판단 기준                                           |
| :-------- | :------------------------ | :---------------------------------------------------------- |
| **Where** | CORE, FIELD, DOMAIN       | 영향 범위: 개인(CORE), 현장(FIELD), 전역 원칙(DOMAIN)       |
| **When**  | MOMENT, DURATION, ERA     | 시간 맥락: 즉각(MOMENT), 지속(DURATION), 거대 패러다임(ERA) |
| **Who**   | WILL, ECHO, TICK, ASK     | 동력원: 사람(WILL), AI(ECHO), 자동(TICK), 승인대기(ASK)     |
| **What**  | FACT, LINK, RULE          | 본질: 사실(FACT), 관계(LINK), 질서(RULE)                    |
| **How**   | FLOW, STUCK, VOID         | 상태: 유동(FLOW), 막힘(STUCK), 잠재/여백(VOID)              |
| **Why**   | CAUSE, LOGIC, TARGET      | 인과: 원인(CAUSE), 타당성(LOGIC), 최종목표(TARGET)          |

---

#### 3. params & constraints 표준 키값 목록

##### 3.1 `params` (실행 파라미터)

어댑터가 실제 기기 명령(Native API)으로 번역할 때 사용하는 논리 명령 값입니다.

| 표준 키(Key)   | 타입          | 설명                       | 예시                           |
| :------------- | :------------ | :------------------------- | :----------------------------- |
| `target_value` | number/string | 목표 설정값                | `24.5`, `"ON"`                 |
| `duration_ms`  | integer       | 동작 지속 시간             | `3000` (3초)                   |
| `transition`   | string        | 변화 리듬 (Ease-in/out 등) | `"linear"`, `"smooth"`         |
| `intensity`    | integer       | 실행 강도 (0~100)          | `80`                           |
| `mode`         | string        | 작동 모드                  | `"eco"`, `"turbo"`, `"silent"` |

##### 3.2 `constraints` (실행 제약 조건)

의사결정 계층(Decision Making)에서 실행 모드를 결정하기 위한 가드레일입니다.

| 표준 키(Key)     | 타입      | 설명                    | 연산 규칙                                      |
| :--------------- | :-------- | :---------------------- | :--------------------------------------------- |
| `risk_threshold` | integer   | 허용 가능한 최대 위험도 | 이 값보다 높으면 `ASK` 전환                    |
| `urgency_level`  | integer   | 긴급도 (1~5)            | 5일 경우 `Level 0` 룰 일부 우회 가능           |
| `safety_lock`    | boolean   | 물리적 인터락 강제 여부 | `true` 시 소프트웨어 판단보다 엣지 반사가 우선 |
| `retry_limit`    | integer   | 실패 시 재시도 횟수     | `ADAPTER_TIMEOUT` 발생 시 참조                 |
| `valid_until`    | timestamp | 명령의 유효 기한        | 경과 시 `VOID` 상태로 전이                     |

---

#### 4. 조동사(MUST/SHOULD/MAY) 연산 규칙

Who(Pulse) 레이어와 결합하여 실행의 강제성과 권위 충돌을 조율합니다.

| 조동사     | 권위 등급     | 충돌 발생 시 처리 로직 (Conflict Resolution)                                                      |
| :--------- | :------------ | :------------------------------------------------------------------------------------------------ |
| **MUST**   | **Level 0~1** | **절대 우선.** 타 룰과 충돌 시 실행 차단 및 사용자 에스컬레이션 필수. 안전(Safety) 코일과 강결합. |
| **SHOULD** | **Level 2**   | **권장.** 충돌 시 경고 후 사용자 선택(ASK→WILL) 유도. 안정성(Stability) 코일 우선 반영.           |
| **MAY**    | **Level 3**   | **자율/옵션.** 시스템 효율(Efficiency)이나 창의성(Creative) 가중치가 높을 경우 우회 가능.         |

**충돌 우선순위 공식:** `RULE.MUST > WILL.MUST > RULE.SHOULD > WILL.SHOULD > MAY`

---

#### 5. UCL '악보' 작성 예시 (Syntax Example)

**시나리오: 사용자가 부재중일 때(DURATION) 창문을 닫으라는 시스템의 강력한 제안(ECHO-MUST)**

```json
{
  "ucl_header": {
    "where_scope": "FIELD",
    "when_tempo": "DURATION",
    "who_pulse": "ECHO_MUST",
    "what_intent": "RULE",
    "how_state": "FLOW",
    "why_causality": "LOGIC"
  },
  "execution_bundle": {
    "capability_id": "nexa.edge.actuator.window.close",
    "params": {
      "target_value": "CLOSED",
      "transition": "smooth"
    },
    "constraints": {
      "risk_threshold": 10,
      "urgency_level": 4,
      "safety_lock": true
    }
  },
  "confidence_score": 98
}
```

---

#### 6. 팁: AI 에이전트를 위한 가이드

- **1ms 판단:** 복잡한 추론 없이 `ucl_header`의 토큰 조합만으로도 상황의 중요도를 즉시 결정하십시오.
- **VOID의 활용:** 사용자의 의도가 모호하거나 망설임이 감지되면 `how_state`를 `VOID`로 설정하여 '영감 모드'를 활성화하십시오.
- **신뢰도 연동:** `confidence_score`가 95점 미만이라면 `who_pulse`를 `ASK`로 설정하여 사용자의 최종 승인(WILL)을 유도하십시오.
