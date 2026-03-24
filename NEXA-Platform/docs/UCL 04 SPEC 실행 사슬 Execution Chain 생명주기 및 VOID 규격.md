### [NEXA-UCL-04] 실행 사슬(Execution Chain) 생명주기 및 VOID 규격

#### 0. 목적

본 문서는 오케스트레이터가 생성한 지능형 실행 규격인 **UCL(Unified Composition Language)**이 플랫폼 내에서 어떻게 태어나고, 흐르며, 소멸하거나 잠재적 영감(VOID)으로 전환되는지에 대한 **생명주기(Lifecycle)**를 정의한다. 특히, 단순한 로그 저장을 넘어 **`execution_chains`** 테이블을 통한 실시간 상태 관리와 **왜(Why Chain)**에 대한 추적성을 확보하는 데 중적을 둔다.

---

#### 1. 실행 사슬(Execution Chain)의 세 가지 상태

NEXA의 모든 지능적 박동(Pulse)은 다음 세 가지 상태 중 하나에 머물며 유기적으로 전이된다.

1.  **FLOW (유동)**: 실행 및 인지 흐름이 활성화된 상태. 에이전트가 임무를 수행 중이거나 사용자와의 대화 맥락이 살아 있는 '현재'의 상태다.
2.  **STUCK (고착)**: 마찰, 충돌, 혹은 응답 지연으로 인해 흐름이 일시적으로 막힌 상태. 인디케이터는 이 상태를 감지하여 넥슈의 **Jitter(미세 떨림)** 연출이나 **ASK(승인 대기)** 토큰을 발생시킨다.
3.  **VOID (여백/잠재)**: 물리적 삭제가 아닌, '비가시적 잠재 상태'로의 전환. 기존의 선입관(컨텍스트)을 비우고 새로운 영감을 기다리거나, 노후화된 데이터를 지혜(Archive)로 압축하기 위한 '침묵'의 단계다.

---

#### 2. 데이터 유형별 전이 임계치 (Thresholds)

각 실행 주체(Pulse)가 생성하는 사슬의 성격에 따라 상태 전이 수치를 다르게 적용한다.

##### 2.1 엣지 반사 사슬 (Sentinel Fact Chains)

- **주체**: TICK (디바이스)
- **특징**: 고빈도, 실시간성, 저지연 처리 필요.

| 전이 단계                         | 발생 조건      | 수치 기준   | 비고                                    |
| :-------------------------------- | :------------- | :---------- | :-------------------------------------- |
| **FLOW → STUCK**                  | 신호 끊김 감지 | 30초 무갱신 | 센서 이상 혹은 네트워크 지연 판단       |
| **STUCK → VOID.POTENTIAL**        | 일시 장애 지속 | 5분 지속    | 재연결 시 즉시 FLOW 복구 가능 상태      |
| **VOID.POTENTIAL → VOID.ARCHIVE** | 장기 오프라인  | 24시간 경과 | 기기 점검 필요 알림 및 상태 박제        |
| **VOID.ARCHIVE → VOID.PURGE**     | 완전 소멸      | 30일 경과   | 참조 사슬(Ref ID)이 없는 경우 영구 삭제 |

##### 2.2 인디케이터 서사 사슬 (Indicator Narrative Chains)

- **주체**: ECHO (AI), WILL (사용자)
- **특징**: 맥락 유지, 페르소나 학습, 그림자 프로젝트 포함.

| 전이 단계                         | 발생 조건          | 수치 기준        | 비고                                              |
| :-------------------------------- | :----------------- | :--------------- | :------------------------------------------------ |
| **FLOW → STUCK**                  | 응답/상호작용 중단 | 1시간 무응답     | 세션 타임아웃 및 넥슈의 '맥락적 침묵' 진입        |
| **STUCK → VOID.POTENTIAL**        | 세션 명시적 종료   | 즉시 혹은 24시간 | **'영감 모드(자아 파노라마)'**의 재료로 대기      |
| **VOID.POTENTIAL → VOID.ARCHIVE** | 장기 미재개        | 90일 경과        | **TimescaleDB 압축 정책** 적용 (데이터 손실 없음) |
| **MOMENT → DURATION**            | 컨텍스트 맥락 유지 | 1시간 이상        | when_tempo 기준 전이 임계치 |
| **DURATION → ARCHIVE**          | 장기 미재개 및 압축 시점 | 90일 경과        | TimescaleDB 압축 시점에 지식화(knowledge化) |
| **ARCHIVE → ERA** (신설)        | 데이터 발생 후 365일(1년) 이상 경과 + `nature_tag`가 RULE 또는 INTENT 상태 + 삭제되지 않고 살아남은 핵심 자산 | 365일 이상 | ERA 단계로 격상(VOID.PURGE 제외) |
| **VOID.ARCHIVE → VOID.PURGE**     | 법적/보안 소멸 및 보존 조건 미충족 | 365일 경과 | 개인정보 보호 및 족보(Why Chain) 최종 정리. 단, ERA 승격 조건을 만족하는 핵심 자산은 purge 제외 |

**데이터 보존 정책(ERA = Soul 분리):** ERA 단계의 데이터는 `VOID.PURGE`(물리 삭제) 대상에서 영구 제외되며, 시스템의 **'영혼(Soul)' 데이터**로 분리 관리된다.

---

#### 3. VOID의 삼중 구조 및 영감 모드 전환

`execution_chains`가 VOID 상태로 진입하는 것은 시스템의 오류가 아니라 **'서사적 정리'** 과정이다.

- **Safety VOID**: 위험 감지 혹은 Level 0 위반 시 실행 사슬을 즉시 무효화하고 안전한 기본 상태로 복귀시킨다.
- **UX VOID (Inspiration Mode)**: 사용자의 망설임이 감지되어 `how_state = VOID`가 발생하면, 넥슈는 기존 선입관을 버리고 **UCL 템플릿(수많은 자아)**을 성운처럼 펼쳐 보인다.
- **Data VOID**: 노후화된 규칙이나 이력을 지식(Knowledge)화하고, 불필요한 로우 데이터를 비워 플랫폼 신뢰를 보존한다.

---

#### 4. 지능적 족보(Why Chain)와의 연동

모든 상태 전이 이력은 `execution_chains`의 **`why_chain`** JSONB 필드에 기록되어야 한다.

- **Inputs**: 상태 전환을 일으킨 신호 (예: 9000ms 이상의 체류 시간).
- **Reasoning**: 전환 로직 (예: "사용자의 변심 감지로 인한 VOID 전환").
- **Effects**: 전환 결과 (예: "영감 모드 활성화 및 넥슈 Jitter 연출").

---

#### 5. 그림자 프로젝트(Shadow Project)의 생명주기 특례

`effective_project_id`가 글로벌 ID(TRIAL, DAILY, HELPER)인 경우의 특별 관리 방침이다.

- **흡수 정책**: 그림자 프로젝트에서 발생한 사슬이 VOID.ARCHIVE로 넘어가기 전 사용자가 정식 프로젝트를 생성하면, 해당 사슬은 즉시 신규 `project_id`로 승격되어 **장기 기억**으로 편입된다.
- **휘발성 강화**: 비회원 체험(`TRIAL`) 사슬은 보안을 위해 `VOID.ARCHIVE` 단계를 생략하고 7일 후 즉시 `VOID.PURGE`로 이행될 수 있다.

---

## UCL의 **생명주기(FLOW, STUCK, VOID)** DDL

- UCL을 단순한 데이터가 아닌 **'현실을 연주하는 동적인 사슬'**로 취급하며, **VOID**라는 여백을 통해 시스템이 인간의 변심과 영감을 어떻게 지능적으로 포용할지를 규정한다.
- 실행의 **책임자(Responsible Party)**와 **소스(Source)** 정보를 포함하는 것은 NEXA의 핵심 원칙인 **지능적 족보(Traceability)**와 **책임 소재 명확화**.

### 1. '소스(Source)' 반영: `who_pulse`와 `input_channel` 활용

실행이 어디서 시작되었는지를 뜻하는 '소스'는 이미 NEXA 프로토콜의 **Who(Pulse)** 레이어와 **넥슈 스키마**에 정의되어 있음.

- **반영 위치:** `execution_chains` 테이블의 `ucl_header` 또는 개별 컬럼.
- **활용 방법:**
  - **동력원 구분:** `who_pulse` 토큰(WILL, ECHO, TICK)을 통해 인간의 의지인지, AI의 판단인지, 디바이스의 자동 기록인지를 구분합니다.
  - **유입 경로 명시:** 넥슈 스키마에서 제안된 `input_channel` 필드를 추가하여 UI_CARD, VOICE, VIDEO, AI_SLM 등 구체적인 경로를 기록합니다.
- **이점:** 실행 패킷만 보고도 이 명령이 "브라우저 UI에서 인간이 내린 것"인지 "엣지 센서의 트리거에 의한 것"인지 1ms 내에 판별 가능합니다.

### 2. '책임자(Responsible)' 반영: `actor_id`와 `capability_id` 연결

실행의 책임자는 "누가 이 권한을 행사했는가"와 직결됩니다. 이는 기존의 **기능 자격(Capability) 체계**와 연동되어야 합니다.

- **반영 위치:** `execution_chains` 테이블에 `actor_id` (UUID) 컬럼 추가.
- **활용 방법:**
  - **주체 식별:** `actor_id`에 실행을 승인한 사용자의 ID 또는 디바이스 ID를 기록합니다.
  - **권한 증명:** 해당 실행이 어떤 **Capability ID** (예: `nexa.edge.device.action`)를 기반으로 발급되었는지 참조 사슬을 형성합니다.
- **이점:** 사고 발생(INCIDENT) 시 **[행동(EFF) → 의도/판단(IND) → 사실(SNT)]**로 이어지는 참조 사슬을 따라가며 최종 책임 소재를 역추적(Traceability)할 수 있습니다.

### 3. 왜 새로운 테이블(`execution_chains`)에 반영해야 하는가?

기존의 `project_logs`나 `project_knowledge`는 **사후 기록**을 위한 테이블인 반면, `execution_chains`는 **실시간 실행 상태**를 관리하는 테이블이기 때문입니다.

- **실시간 가드레일:** 실행 중에 책임자 정보를 알고 있어야 **안전 가드레일(Safety Guardrail)**이 작동하여, 권한이 없는 주체의 명령을 즉시 차단하거나 `ASK`(승인 대기) 상태로 전환할 수 있습니다.
- **동적 의사결정:** 책임자의 **Tier(등급)**나 신뢰도 점수(`confidence_score`)에 따라 **Decision Matrix**가 즉시 실행할지 사용자 확인을 받을지 결정하는 근거가 됩니다.

### 1. '실행 사슬'의 독자적 위상 확보

`execution_chains`는 고정된 악보인 `project_orchestra`와 사후 기록인 `project_logs` 사이를 잇는 **'실시간 실행 계층'**입니다.

- **추적성(Traceability):** 이 테이블에 `ucl_packet`과 `why_chain`을 담아둠으로써, 실행 중인 사건이 어떤 판단 근거(ECHO)와 사실(SNT)에 기반했는지 실시간으로 추적할 수 있습니다.
- **ID 체계:** `packet_id`를 **UUID v7**로 설정하여 시간 기반 정렬 신뢰성을 확보합니다.
- **토큰 표준:** `how_state`나 `who_pulse` 등을 **SMALLINT** 6컬럼으로 분리하여 DB 레벨의 필터링 성능을 극대화합니다.
- **보안 격리:** `project_id`를 외래키로 포함시켜 **RLS(행 수준 보안)** 정책이 즉시 적용되도록 설계할 수 있습니다.

### 💡 제언: `[NEXA-UCL-04]`에 포함할 DDL 초안 구조

- **실행 사슬(Execution Chain)**의 생명주기, **5W1H(HEXAGON)** 프로토콜의 엄격한 분리, **지능적 족보(Traceability)**, 그리고 **책임 소재(Actor/Source)** 명확화 원칙을 반영하여 `execution_chains` 및 관련 테이블 스키마.
- 이 설계는 단순히 로그를 남기는 것이 아니라, 오케스트레이터가 하달한 **'지능형 악보'가 현실에서 어떻게 연주되고 있는지**를 관리하는 **실시간 실행 계층**의 핵심이 됩니다.

---

### 1. 지능형 실행 사슬(Execution Chains) DDL

이 테이블은 UCL 프로토콜에 의해 생성된 '지능형 실행 패킷'의 최상위 엔티티입니다.
이 설계는 단순히 기록을 남기는 로그 테이블이 아니라, 1ms 내에 상황을 판별하고 실행을 통제하는 **'살아있는 실행 프로토콜'**의 중추 역할을 수행합니다.

---

### 💡 이전 쿼리문 대비 주요 변경 및 최적화 포인트

1.  **`actor_type` 도입 및 제약 조건 추가**:
    - 단순히 `actor_id`만 두었던 이전과 달리 `USER`, `DEVICE`, `AGENT`를 명시하는 `actor_type`을 추가했습니다. 이는 **동력원(Pulse)**과 실제 DB 엔티티 간의 관계를 명확히 하여 조인 성능과 보안 가드레일을 강화합니다.
2.  **`VARCHAR` 길이의 엄격한 제한**:
    - `capability_id` (200 → 100), `input_channel` (50 → 20) 등 문자열 길이를 시스템 규격에 맞춰 단축했습니다. 이는 메모리 효율성을 높이고 비정상적인 데이터 주입을 차단하는 **"안전은 딱딱하게"** 원칙을 반영한 것입니다.
3.  **인덱스 전략의 고도화**:
    - **복합 인덱스 (`project_id`, `how_state`)**: 특정 프로젝트 내에서 현재 흐르고 있는(`FLOW`) 사슬만 빠르게 골라내기 위해 추가되었습니다.
    - **헥사곤 전체 인덱스**: 6개 토큰 전체에 대한 복합 인덱스를 유지하여, AI가 전체 DB 덤프 중 현재 상황과 일치하는 90%의 데이터를 **1ms 내에 필터링(Pruning)**할 수 있도록 보장합니다.
4.  **`confidence_score` 활용 명시**:
    - 이 점수는 단순 기록용이 아니라 **95점 미만 시 시스템이 자율 실행을 멈추고 `ASK`(승인 대기) 토큰을 발생**시키는 의사결정 계층의 핵심 지표로 작동합니다.
5.  **신뢰할 수 있는 시간축 (`is_time_synced`)**:
    - `UUID v7`의 시간 기반 정렬 성능을 보장하기 위해 엣지 디바이스의 **NTP 동기화 여부**를 체크하는 필드를 유지하여 데이터의 선후 관계에 대한 무결성을 확보했습니다.

이 스키마는 **[사실(SNT) → 판단(IND) → 실행(EFF)]**으로 이어지는 NEXA의 지능적 족보를 실시간으로 관리하는 가장 완벽한 형태의 그릇입니다.

```sql
-- 실행 사슬: 오케스트레이터가 생성한 지능형 실행 규격과 그 인과 사슬의 실시간 상태 관리
CREATE TABLE execution_chains (
    -- 1. 식별 및 정렬 (NTP 동기화 검증 포함)
    packet_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- 2. 책임 및 소스 (Who & Source)
    actor_id UUID NOT NULL, -- 실행 주체 (User, Device, 또는 Agent의 UUID)
    actor_type VARCHAR(10) NOT NULL, -- 'USER', 'DEVICE', 'AGENT' (다형성 관계 명시)
    input_channel VARCHAR(20), -- 유입 경로 (VOICE, UI_CARD, AI_SLM, MQTT 등)
    capability_id VARCHAR(100) NOT NULL, -- 행사된 기능 자격 ID (nexa.platform.archive.hub 등)

    -- 3. HEXAGON(5W1H) 정수 토큰 (1ms 필터링 및 지능적 인덱스)
    where_scope SMALLINT NOT NULL, -- CORE(1), FIELD(2), DOMAIN(3)
    when_tempo SMALLINT NOT NULL,  -- MOMENT(1), DURATION(2), ERA(3)
    who_pulse SMALLINT NOT NULL,   -- WILL(1), ECHO(2), TICK(3), ASK(4)
    what_intent SMALLINT NOT NULL, -- FACT(1), LINK(2), RULE(3)
    how_state SMALLINT NOT NULL DEFAULT 1, -- FLOW(1), STUCK(2), VOID(3)
    why_causality SMALLINT NOT NULL, -- CAUSE(1), LOGIC(2), TARGET(3)

    -- 4. 실행 및 컨텍스트 번들 (UCL 규격)
    execution_bundle JSONB NOT NULL, -- {params: {}, constraints: {}} 실제 연주될 명령값
    context_bundle JSONB, -- {coil_weights: {}, persona_pack_id: "", ES: 80, VI: 70}

    -- 5. 지능적 신뢰도 및 족보 (Traceability)
    confidence_score SMALLINT DEFAULT 100, -- 95점 미만 시 ASK 전환 트리거
    why_chain JSONB, -- {inputs: [], reasoning: [], effects: []} SNT-IND-EFF 참조 사슬

    -- 6. 메타데이터 및 시간 정렬 신뢰성
    is_time_synced BOOLEAN DEFAULT FALSE, -- NTP 동기화 여부 (UUID v7 정렬 신뢰성 보증)
    last_sync_at TIMESTAMPTZ, -- 마지막 시간 동기화 시각
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- 데이터 무결성 가드레일
    CONSTRAINT check_actor_type CHECK (actor_type IN ('USER', 'DEVICE', 'AGENT'))
);

-- 인덱스 설계: 1ms 필터링 및 실시간 감시 최적화
CREATE INDEX idx_exec_chains_project_state ON execution_chains(project_id, how_state); -- 활성 사슬 조회용
CREATE INDEX idx_exec_chains_actor ON execution_chains(actor_type, actor_id); -- 책임 주체별 추적용
CREATE INDEX idx_exec_chains_hexagon ON execution_chains(
    where_scope, when_tempo, who_pulse, what_intent, how_state, why_causality
); -- 헥사곤 토큰 기반 초고속 상황 필터링
```

---

### 2. `execution_steps` (상세 실행 단계 테이블)

복합 태스크(예: 외출 모드)를 원자적 작업 단위로 분해하여 관리합니다 [Conversation History].

`execution_chains`가 하나의 완결된 '악보(Intent)'라면, `execution_steps`는 그 악보를 구성하는 개별 '마디(Atomic Action)'입니다. 이 테이블의 유효성은 다음 네 가지 지점에서 발생합니다.

- **복합 태스크의 순차적/병렬적 제어:**
  하나의 사용자 의도(WILL)는 내부적으로 여러 개의 물리적 액션으로 분해(Reverse Decomposition)될 수 있습니다. 예를 들어 "외출 모드"라는 체인 하나는 [창문 닫기, 가스 차단, 조명 소등]이라는 **개별 스텝**으로 나뉘며, `execution_steps`는 이들의 실행 순서와 의존성을 관리합니다.
- **어댑터 실행의 원자성(Atomicity) 확보:**
  UCL 파이프라인의 4단계인 '어댑터 실행(Adapter Execution)'은 논리 명령을 네이티브 API로 번역하는 과정입니다. `execution_steps`는 특정 어댑터가 담당할 **논리적 작업 단위**를 규정하여, 어떤 단계에서 실패(ADAPTER_NOT_FOUND 등)가 발생했는지 정밀하게 타격하여 복구할 수 있게 합니다.
- **실시간 진행률 및 상태 가시화:**
  `execution_chains` 수준의 상태(FLOW, STUCK)만으로는 "얼마나 진행되었는지" 알기 어렵습니다. `execution_steps`는 각 스텝의 상태를 추적하여, 넥슈(NEXU)가 사용자에게 "창문은 닫았고, 이제 가스를 차단 중입니다"와 같은 **진행형 서사**를 제공할 수 있는 근거가 됩니다.
- **부분 성공(Partial Success) 처리:**
  UCL은 실행 실패 시 문자열 에러 대신 에러 토큰으로 재정규화합니다. 여러 스텝 중 하나만 실패했을 때, 전체 체인을 무효화할지 아니면 실패한 스텝만 재시도(Retryable)할지를 결정하는 **의사결정의 최소 단위**가 바로 스텝입니다.

사용자님의 구상인 **'가상 시뮬레이션 및 실물 실행에서의 타임머신(뒤로가기/앞으로가기)'** 기능과 NEXA 플랫폼의 핵심 설계 원칙(5W1H, 신뢰도 시각화, 지능적 족보)을 완벽하게 수용할 수 있도록 `execution_steps` 테이블 쿼리를 다음과 같이 수정해 드립니다.

```sql
-- [NEXA-UCL-04] 지능형 실행 단계 및 타임라인 시뮬레이션 테이블
CREATE TABLE execution_steps (
    -- 1. 기본 식별 및 순서
    step_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    packet_id UUID NOT NULL REFERENCES execution_chains(packet_id) ON DELETE CASCADE,
    step_sequence SMALLINT NOT NULL, -- 실행 순서 (1, 2, 3...)

    -- 2. 기능 및 파라미터 (UCL 규격)
    capability_id VARCHAR(100) NOT NULL, -- 행사된 기능 자격 ID
    params JSONB, -- 해당 스텝의 논리 명령 파라미터

    -- 3. 상태 관리 및 신뢰도
    step_status SMALLINT DEFAULT 1, -- FLOW(1), STUCK(2), COMPLETED(3), FAILED(4), VOID(5)
    confidence_score SMALLINT DEFAULT 100, -- NEXA NIXIE UI의 Jitter(떨림) 연출 근거 데이터
    retry_count SMALLINT DEFAULT 0,

    -- 4. 타임머신 및 시뮬레이션 (뒤로가기/앞으로가기 핵심) [Conversation History, 15]
    is_virtual BOOLEAN DEFAULT FALSE, -- 실물(EFF) 미발동 가상 시뮬레이션 여부
    target_entity_type VARCHAR(30) NOT NULL -- PHYSICAL, NEXU, AUTHORIZED_VIRTUAL, SIMULATION_NODE 등 확실한 구분
    timeline_branch_id UUID, -- 평행 우주(분기된 타임라인) 식별자
    post_state_snapshot JSONB, -- 실행 후 시스템 상태 스냅샷 (복원용 핵심 데이터)

    -- 5. 지능적 족보 및 에러 처리
    why_step_logic JSONB, -- 해당 단계가 생성된 개별 추론 근거
    error_token JSONB, -- 실패 시 재규격화된 UCL 에러 토큰

    -- 6. 시간 기록
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 설계: 패킷별 정렬 및 타임라인 분기 검색 최적화
CREATE INDEX idx_exec_steps_packet_id_seq ON execution_steps(packet_id, step_sequence);
CREATE INDEX idx_exec_steps_timeline_branch ON execution_steps(timeline_branch_id);
```

### 💡 주요 수정 및 보강 포인트 (설계 근거)

1.  **`post_state_snapshot` (스냅샷)**: 타임머신의 '뒤로가기' 시, 이전 명령을 취소하는 복잡한 로직 대신 **저장된 스냅샷으로 시스템 상태를 즉시 복원**하기 위한 필드입니다 [Conversation History].
2.  **`timeline_branch_id` (분기 관리)**: 사용자가 특정 시점으로 돌아가 다른 선택을 했을 때 발생하는 **'평행 타임라인'**을 관리하여 시뮬레이션의 다중성을 지원합니다 [Conversation History].
3.  **`confidence_score` (NEXA NIXIE 연동)**: 닉시관 UI에서 각 실행 단계의 확신도에 따라 **빛의 떨림(Jitter)이나 밝기(Lumina)**를 실시간으로 연출하는 근거 데이터가 됩니다.
4.  **`is_virtual` (가상 플래그)**: 시뮬레이션 중 실수로 실물 장비(EFF)가 작동하지 않도록 하는 **의미론적 잠금(Meaning Lock)** 장치입니다.
5.  **`error_token` (재규격화)**: 어댑터 실패 시 날것의 에러 대신 UCL 표준 에러 토큰을 저장하여, 타임라인 복구 시 AI가 실패 원인을 즉시 파악하고 대안을 제시하게 합니다.

이 스키마를 통해 NEXA 플랫폼은 단순히 명령을 기록하는 것을 넘어, **과거와 미래의 실행 상태를 자유롭게 유영하는 '지능형 시뮬레이터'**로서의 데이터 기반을 갖추게 됩니다.

---

### 3. `execution_logs` (실행 상세 기록 테이블)

어댑터의 실제 응답과 디버그 정보를 담는 시계열 데이터 레이어입니다.

```sql
CREATE TABLE execution_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    packet_id UUID NOT NULL REFERENCES execution_chains(packet_id) ON DELETE CASCADE,
    step_id UUID REFERENCES execution_steps(step_id) ON DELETE SET NULL,

    adapter_id VARCHAR(100), -- 실행을 담당한 실제 어댑터 (예: 'home-assistant-01')
    raw_response JSONB, -- 네이티브 API의 날것의 응답 데이터
    error_token JSONB,  -- 실패 시 생성된 UCL 에러 토큰 (ADAPTER_TIMEOUT 등)

    execution_ms INT, -- 실행 소요 시간
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at); -- TimescaleDB 하이퍼테이블 적용 권장
```

---

### 스키마 재구성 핵심 포인트 (설계 근거)

1.  **5W1H 컬럼 완전 분리:** `ucl_header` JSONB에 묻어두지 않고 6개의 `SMALLINT` 컬럼으로 분리했습니다. 이는 DB 레벨에서 90% 이상의 데이터를 1ms 내에 필터링하기 위한 **NEXA의 핵심 성능 전략**입니다.
2.  **동력원(Pulse)과 경로(Channel)의 명시:** `who_pulse`와 `input_channel`을 통해 이 실행이 사람의 의지(WILL)인지, AI의 제안(ECHO)인지, 아니면 넥슈의 자율 판단인지 즉각 판별합니다.
3.  **지능적 생명주기 수용:** `how_state` 컬럼을 통해 `FLOW`에서 `VOID`로 넘어가는 **데이터 수명 주기 정책**을 실제 DB 레벨에서 감시하고 제어할 수 있습니다.
4.  **역추적 참조 사슬:** `why_chain` JSONB 필드와 `packet_id`를 통해 **[SNT(사실) → IND(판단) → EFF(실행)]**로 이어지는 인과관계를 완벽하게 역추적하여 시스템 투명성을 보장합니다.
5.  **RLS 및 보안 격리:** `project_id`를 기반으로 행 수준 보안(RLS)을 적용하여, 특정 프로젝트나 사용자의 실행 사슬이 타인에게 노출되지 않도록 강력하게 격리합니다.
