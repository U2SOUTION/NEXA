## 지능형 시스템 설계(AI Governance) 용어집

1. 거버넌스 및 상태 관리 (Lifecycle)
  규칙이 시스템에 제안되어 '장기 기억(헌법)'으로 확정되는 과정입니다.


| 약어     | 풀네임 (Full Name)            | 의미 및 상태                         | 질문자님의 해석 (장기 기억 관점)  |
| ------ | -------------------------- | ------------------------------- | -------------------- |
| ASK    | Assessment & Key-check     | 규칙의 적절성을 계속 재검토하고 질문하는 유동적 상태   | 단기 기억 / 학습 중 (수정 가능) |
| GOVERN | Governance                 | 시스템이 규칙을 인지하고 관리/통제하기 시작한 운영 단계 | 중기 기억 / 관리 대상 (운영 중) |
| ERA    | Established Rule Authority | 시스템 생존과 직결된 절대 원칙(헌법)으로 고정된 상태  | 장기 기억 / 고착화 (수정 불가)  |


1. 시스템 핵심 가치 (Core Values)
  ERA 단계로 고정되어 시스템의 정체성을 형성하는 요소들입니다.


| 약어       | 풀네임 (Full Name)                         | 의미 및 역할                    | 비고          |
| -------- | --------------------------------------- | -------------------------- | ----------- |
| SAFETY   | Systemic Autonomy & Fixed Trust Yield   | 시스템의 생존과 안전을 보장하는 최우선 원칙   | ERA 고정 1순위  |
| CREATIVE | Core Resource & Essential Active Talent | 에이전트의 창의성과 생산성을 유지하는 핵심 가치 | ERA 고정 2순위  |
| LIMIT    | Legal & Integrity Management Interface  | 법적/윤리적 제한선 및 시스템의 경계 정의    | 위반 시 시스템 중단 |


1. 구조적 구성 요소 (Architecture)
  웹 프로그램 기획 시 데이터를 처리하고 분류하는 체계입니다.

**3-A. 시스템 계층 및 프로토콜**


| 약어      | 풀네임 (Full Name)                         | 의미 및 역할                              | N- 여부 |
| ------- | --------------------------------------- | ------------------------------------ | ----- |
| NEXA-OS | NEXA Operating System                   | 지식을 연산하여 실행을 도출하는 지능형 운영체제 (전체 시스템)  | 고유    |
| N-MAP   | NEXA Meta Action Protocol               | 사람의 의도를 기계의 동작으로 연결하는 표준 설계도         | N-    |
| N-PATH  | NEXA Narrative Path                     | 지식 자산의 물리·논리 위치를 추적하는 지능형 서사 경로      | N-    |
| N-BASE  | NEXA Basic Asset & Standard Environment | 시스템이 구동되는 기초 환경 및 표준 데이터 자산          | N-    |
| N-CORE  | NEXA Central Operating Resource Entity  | 결정된 원칙(ERA)이 실제로 실행되는 중추 엔진          | N-    |
| HEXAGON | HEXAGON Protocol                        | 모든 데이터 패킷의 6축(5W1H) 정수 토큰 골격 (§7 참조) | 고유    |
| COILS   | COILS Balancer                          | AI 판단의 주관적 가치 가중치 믹서 (§8 참조)         | 고유    |


**3-B. 핵심 3대 축 (Identity · Capability · Path)**


| 용어         | NEXA 서사 비유 | 의미 및 역할                                       |
| ---------- | ---------- | --------------------------------------------- |
| Identity   | 영혼 / 신분증   | 객체의 불변하는 정체성과 탄생 이유(Why Chain)를 보존하는 최상위 원장   |
| Capability | 공구 / 자격증   | 영혼이 현실에서 행사할 수 있는 권능·수단·보안 가드레일 (§10 참조)      |
| N-PATH     | 지그 / 지도    | 공구가 정확한 지점에서 작동하도록 잡아주는 정밀 실행 가이드(N-PATH 인덱스) |


**3-C. 실행 주체 및 역할**


| 용어           | 의미 및 역할                                            |
| ------------ | -------------------------------------------------- |
| Orchestrator | 7대 지식 층위를 악보 삼아 에이전트를 지휘하는 감독. 지능형 가드레일 역할         |
| Agent        | AI 모델 + 페르소나 + 스킬 + 로컬 메모리를 갖춘 전문 일꾼 (실행 주체)       |
| Adapter      | 셋팅된 공구(Capability)를 들고 물리적 장비·서비스를 구동하여 Effect를 생성 |


**3-D. 지능 엔진 및 시각화**

| 약어 / 용어    | 풀네임 (Full Name)                         | 의미 및 역할                                                                       |
| -------------- | ------------------------------------------ | ---------------------------------------------------------------------------------- |
| NIXIE          | NEXA Intuitive eXpressive Interface Engine | 데이터·상태를 빛·떨림·서사로 투영하는 시각화 엔진                                  |
| NEXU           | NEXA Universal Guide                       | 지식 OS의 서사적 지휘자이자 사용자 가이드 에이전트                                 |
| English Kernel | English Kernel — Multilingual Shell        | 내부 연산은 영어 커널로 정규화, 사용자 접점은 다국어 쉘로 출력                     |
| Phase Calculus | —                                          | 7대 지식 층위 간 위상차(Potential Difference)를 연산하여 실행 동력을 도출하는 원리 |
| Why Chain      | —                                          | 사실(SNT) → 판단(IND) → 실행(EFF)의 인과 사슬. 모든 결과의 족보                    |
| Late Anchoring | —                                          | 설계된 개념 노드에 실제 파일·자산을 사후 연결하는 메커니즘                         |

**3-E. 핵심 기술 스택**

*3-E-1. 최적화 및 가속*

| 약어 / 용어 | 풀네임 (Full Name)                       | 의미 및 역할 |
| ----------- | ---------------------------------------- | ------------ |
| TurboQuant  | Google, ICLR 2026                        | Data-oblivious 벡터 양자화: KV 캐시 6배 절감·추론 8배 가속을 달성하면서 모델 성능 하락 없음. 원본 데이터 열람 없이 양자화하는 특성으로 `nexa_identities`의 개인화 임베딩을 프라이버시 친화적으로 압축하고, 대규모 벡터 검색의 보안과 속도를 동시에 최적화하는 데 적용 |
| OpenCL      | Open Computing Language (Khronos Group)  | GPU/FPGA/CPU 병렬 연산 프레임워크. HEXAGON 프루닝 병렬화, 벡터 검색 가속에 적용 |
| Pruning     | —                                        | HEXAGON 토큰으로 무관 데이터 90%를 1ms 내에 사전 필터링 |

*3-E-2. 에이전트 실행 및 동기화*

| 약어 / 용어      | 풀네임 (Full Name)               | 의미 및 역할 |
| ---------------- | -------------------------------- | ------------ |
| OpenClaw         | OpenClaw Agent Framework (MIT)   | 자율 에이전트 런타임. Adapter를 스킬로 구현, Doc Sync Crawler 자율 실행, 멀티-LLM 전환, 로컬 우선 프라이버시 |
| Doc Sync Crawler | —                                | 파일 시스템과 DB를 동기화하여 doc_anchor·source_hash를 갱신. OpenClaw 에이전트가 자율 실행 |

*3-E-3. 협업 및 실시간 인프라*

| 약어 / 용어 | 풀네임 (Full Name)         | 의미 및 역할 |
| ----------- | -------------------------- | ------------ |
| Yjs         | Yjs CRDT Framework         | CRDT 기반 실시간 협업 프레임워크. 문서 내용의 동시 편집·충돌 없는 동기화를 담당 (N-PATH는 정체성·족보를 관리) |
| Hocuspocus  | Hocuspocus (Yjs Server)    | Yjs의 WebSocket 서버 구현체. 실시간 문서 동기화 백엔드로 Nexion 에디터와 연결 |
| Chokidar    | Chokidar (Node.js)         | 파일 시스템 감시 라이브러리. Doc Sync Crawler의 변경 감지 엔진으로 파일 생성·수정·삭제·이동을 실시간 포착 |
| BullMQ      | BullMQ (Redis 기반)         | 백그라운드 작업 큐 및 우선순위 스케줄러. 안전(1)·사용자(2) 작업은 즉시, 일상(4) 크롤링은 배칭 처리. 실패 시 자동 재시도 |
| Zod         | Zod (TypeScript)           | 런타임 스키마 검증 라이브러리. N-MAP 패킷의 HEXAGON 토큰 및 execution_bundle 파라미터의 형식 무결성을 입구에서 보장 |

**3-F. 4단계 지능 위계 (하드웨어)**


| 체급 (공식 명칭) | 역할     | HW 프로필   | 비고       |
| ---------- | ------ | -------- | -------- |
| 제니스 인디케이터  | 전략적 뇌  | **HOT**  | 필수       |
| 키네틱 컨트롤러   | 현장 지휘관 | **WARM** | 생략 가능    |
| 마이크로 센티널   | 인식 지능  | **WARM** | 생략 가능    |
| 나노 센티널     | 반사 신경  | **COLD** | 필수 (최전방) |


---

1. 펄스(Pulse) 및 승인 계층 (Who / Pulse)
  펄스는 “누가(또는 무엇이) 이 결정을 만들었는가”를 표시하는 1차 근거다.


| 약어     | 풀네임 (Full Name)            | 의미 및 역할                                                 | 질문자님의 해석 (장기 기억 관점) |
| ------ | -------------------------- | ------------------------------------------------------- | ------------------- |
| WILL   | User Intent (Approval)     | 사용자의 명시적 의도/승인. 실제 투입(실물 실행) 권한의 기준                     | 단기 실행 / 최종 승인       |
| ECHO   | AI Echo / Assessment       | AI의 판단/재해석 제안. 일반적으로 직접 집행보다는 ASK/WILL로 이어질 “말 걸기”의 시작점 | 중기 기억 / 제안 계층       |
| TICK   | Device/Sensor Fact         | 디바이스/센서가 발생시키는 사실(관측). 검증 가능한 SNT(사실) 생성 원천             | 사실 저장 / 센서 족보       |
| ASK    | Assessment & Key-check     | 불확실·위험·권한 문제 등으로 사용자 승인/선택이 필요한 상태                      | 단기 기억 / 판단 중        |
| GOVERN | Governance                 | 규칙이 운영 단계로 승격되어 통제/관리 대상이 되는 흐름                         | 운영 중 / 절차적 고착       |
| ERA    | Established Rule Authority | 시스템 생존과 직결된 절대 원칙(헌법) 단계(고정, 수정 불가)                     | 장기 기억 / 불변 권위       |


---

1. 실행 사슬(Execution Chain) 및 단계(Execution Steps)
  실행 사슬은 N-MAP Protocol이 생성하는 “실시간 실행 엔티티”이며, 단계는 “원자적 마디(Atomic Action)”다.


| 용어                                | 의미 및 역할                                                       | 연결 필드/대상(문서 기준)                                                                                  |
| --------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| execution_chains                  | 실행 사슬의 최상위 레코드(실시간 악보/상태 관리)                                  | `execution_chains.packet_id`, `where_scope`, `when_tempo`, `who_pulse`, `how_state`, `why_chain` |
| packet_id                         | 실행 사슬 식별자(UUID v7 시간정렬 신뢰성 전제)                                | `execution_chains.packet_id`, `execution_steps.packet_id`                                        |
| actor_id                          | 실행 책임자 주체 ID(사용자/디바이스/에이전트)                                   | `execution_chains.actor_id`                                                                      |
| actor_type                        | 실행 주체의 유형(USER/DEVICE/AGENT)                                  | `execution_chains.actor_type`                                                                    |
| execution_steps                   | 실행 사슬을 구성하는 원자 스텝 테이블                                         | `execution_steps.step_status`, `is_virtual`, `timeline_branch_id`                                |
| step_sequence                     | 스텝 실행 순서                                                      | `execution_steps.step_sequence`                                                                  |
| step_status                       | 스텝 상태(FLOW/STUCK/COMPLETED/FAILED/VOID)                       | `execution_steps.step_status`                                                                    |
| is_virtual                        | 가상(Dry-run) 여부. 실물(EFF) 방지용 의미론적 잠금                           | `execution_steps.is_virtual`                                                                     |
| target_entity_type                | 대상 계열 구분(예: PHYSICAL/NEXU/AUTHORIZED_VIRTUAL/SIMULATION_NODE) | `execution_steps.target_entity_type`                                                             |
| timeline_branch_id                | 평행 타임라인(분기) 식별자                                               | `execution_steps.timeline_branch_id`                                                             |
| post_state_snapshot               | 타임머신 “뒤로가기” 복원 스냅샷                                            | `execution_steps.post_state_snapshot`                                                            |
| why_chain / why_step_logic        | 상태 전환의 인과 사슬(Reasoning + Effects)                             | `execution_chains.why_chain`, `execution_steps.why_step_logic`                                   |
| execution_bundle / context_bundle | 실행에 필요한 명령/제약/코일 가중치/페르소나 묶음                                  | `execution_chains.execution_bundle`, `execution_chains.context_bundle`                           |


---

1. 상태 전이(State Lifecycle) — FLOW / STUCK / VOID (+ 확장)
  실행 주체는 FLOW/STUCK/VOID를 순환하며, VOID는 단계별로 데이터의 생애를 다르게 취급한다.


| 상태/단계          | 의미 및 역할                              | 전이(문서 임계치 요약)                              |
| -------------- | ------------------------------------ | ------------------------------------------ |
| FLOW           | 실행/인지 흐름 활성화(정상 박동)                  | FLOW → STUCK                               |
| STUCK          | 흐름 막힘(응답 지연/충돌/대기)                   | STUCK → VOID.POTENTIAL                     |
| VOID           | 잠재/영감 대기(물리 삭제 아님)                   | VOID.POTENTIAL → VOID.ARCHIVE → VOID.PURGE |
| VOID.POTENTIAL | 단기 잠재(재개 가능 구간)                      | 인디케이터/센서별 임계치 적용                           |
| VOID.ARCHIVE   | 장기 압축/지식화 구간                         | TimescaleDB 압축 시점(90일 등)                   |
| VOID.PURGE     | 보존 조건 미충족 시 물리 삭제 후보                 | 기본 PURGE 임계치(365일 등)                       |
| MOMENT         | (when_tempo) 맥락이 단기~중기 유지되는 시간축 구간   | MOMENT → DURATION                          |
| DURATION       | (when_tempo) 장기 미재개로 압축/지식화로 넘어가는 구간 | DURATION → ARCHIVE                         |
| ERA (신설/격상)    | core 자산(“영혼(Soul)”로 승격)              | ARCHIVE → ERA 후 purge 영구 제외                |
| Safety VOID    | 위험/Level0 위반 시 즉시 무효화                | Safety guardrail 강제                        |
| UX VOID        | 사용자의 망설임/변심이 감지되어 영감 모드 진입           | 넥슈가 N-MAP 템플릿 성운 펼침                        |
| Data VOID      | 노후화된 이력/규칙을 지식화하고 로우 데이터를 비움         | 지식/아카이브 정리                                 |


---

1. HEXAGON Protocol(핵사곤) 및 5W1H 골격
  핵사곤은 “데이터 패킷의 헤더”로서 사건/맥락의 본질을 6축으로 고정한다.


| 축     | 약어/의미                 | 예시(문서 기준)               |
| ----- | --------------------- | ----------------------- |
| Where | 공간/영향 범위(Scope)       | SELF/FIELD/DOMAIN       |
| When  | 시간적 맥락(Tempo)         | MOMENT/DURATION/ERA     |
| Who   | 주체(Pulse 동력원)         | WILL/ECHO/TICK/ASK      |
| What  | 데이터 성격(의도/팩트 유형)      | FACT/LINK/RULE/INTENT   |
| How   | 실행 상태(Flow 계열)        | FLOW/STUCK/VOID         |
| Why   | 인과/판단 카테고리(코일 밸런서 관여) | Why/Decision Matrix 근거군 |


---

1. COILS 벨런서 — 판단 가치 필터
  코일은 “같은 데이터라도 어떻게 해석/행동할지”의 가치 가중치를 제공한다.


| 코일         | 풀네임(설계 표현)                              | 의미 및 역할               |
| ---------- | --------------------------------------- | --------------------- |
| SAFETY     | Systemic Autonomy & Fixed Trust Yield   | 안전/신뢰/최우선 가드레일        |
| CREATIVE   | Core Resource & Essential Active Talent | 창의적 확장/실험적 조합         |
| LIMIT      | Legal & Integrity Management Interface  | 법적/윤리적 경계선            |
| Stability  | Stability(안정성)                          | 위험을 낮추고 흔들림을 억제하는 가중치 |
| Efficiency | Efficiency(효율)                          | 비용/시간을 줄이려는 가중치       |
| Harmony    | Harmony(조화)                             | 충돌 조율 및 상호작용 최적화 가중치  |


---

1. N-MAP Layer vs N-MAP Protocol
  문서의 N-MAP은 2개 층으로 나뉜다.


| 구분             | 의미 및 역할                                     |
| -------------- | ------------------------------------------- |
| N-MAP Layer    | 의미/정책 계층(목표 해석, 상태 추적, 충돌 조정, 컨텍스트 축적)      |
| N-MAP Protocol | 전송/형식 계층(스키마, 필수 필드, 코드값, 라우트/채널, 왕복 인터페이스) |


---

1. Capability ID(기능 자격 ID) 및 권한/연결 규격
  Capability ID는 플랫폼 전역의 “일급 객체”이며, 데이터/실행/시뮬레이션 모두의 자격을 규정한다.


| 용어                           | 의미 및 역할                                                             |
| ---------------------------- | ------------------------------------------------------------------- |
| Capability ID                | `nexa.`* 네임스페이스 기반 기능 자격 식별자(권한/연결/감사 단위)                           |
| capability                   | Capability ID의 메타데이터(라벨/설명/타입/상태 등)                                 |
| capability_map               | API/라우트 경로 ↔ required capability 매핑(인가 미들웨어 조회)                     |
| source                       | `registry`(코드 레지스트리 동기화), `override`(관리자 수동), `extension`(확장 스캔 자동) |
| tiers                        | 회원 서비스 등급(BASIC/…)                                                  |
| tier_allowed_capabilities    | Tier별 허용 capability 매핑                                              |
| capability_grant_history     | 발급/폐기 이력(감사). action: grant/revoke/RESOLVE_CONFLICT                 |
| capability_proposals         | AI가 추천하는 capability 승인/거절 제안(Fit Score 기반)                          |
| capability_tag_whitelist     | AI가 추천할 후보를 제한하는 태그 화이트리스트                                          |
| sandbox_profiles             | 격리 실행 환경 프로필(메모리/CPU/timeout/허용 모듈 등)                               |
| sandbox_profile_capabilities | 샌드박스가 상속하는 capability 목록(권한 컨텍스트)                                   |
| User Capability              | 사용자가 승인/발급받는 임시/개인 기능 자격                                            |


---

1. 신뢰도/적합도 점수(Confidence & Fit Scores)
  N-MAP-08에서 자원 합성의 안전성을 수치화하는 핵심 축이다.


| 용어                           | 의미 및 역할                                       | 위치/필드 예시                                                                                                 |
| ---------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| confidence_score             | 실행/판단의 확신도(0~100). threshold 미만이면 ASK/STOP 근거 | `execution_chains.confidence_score`, `execution_steps.confidence_score`, `project_logs.confidence_score` |
| user_defined_threshold       | Autonomy Threshold(기본 95, UI ±15%)            | `project_settings.user_defined_threshold`                                                                |
| confidence_threshold         | 외부 자원/신뢰 임계값(0~100; DDL 확장)                   | `project_settings.settings_data.confidence_threshold`                                                    |
| Fit Score                    | 후보 자원이 목표/컨텍스트에 얼마나 적합한지의 점수                  | `capability_proposals.fit_score` 또는 합성 후보 평가                                                             |
| Resource Confidence          | 외부 자원 “주장 값”과 “실측 결과”의 오차를 반영한 신뢰도            | N-MAP-08 사전 평정 결과(권장 DDL: proposal/knowledge에 기록)                                                        |
| pre-rating / pre_rating_runs | is_virtual=true에서 3회 이상 테스트해 오차를 산출하는 사전 평정   | N-MAP-08 §3.5                                                                                            |


---

1. 외부 자원 합성(동적 Substitution) 핵심 용어
  외부 API/타 프로젝트 자원을 “잠재(VOID)”에서 “실체”로 끌어오는 프로토콜 용어다.


| 용어                              | 의미 및 역할                                                |
| ------------------------------- | ------------------------------------------------------ |
| Resource Substitution(자원 차출/대체) | 문제 발생 또는 최적화 목적의 동적 대체                                 |
| Where-Scope 필터링                 | 사고 지점 주변/유사 범위를 1ms급으로 좁히는 공간 스코프 필터                   |
| project_network_topology        | 장치 간 거리/연결망을 저장하는 DB(“가까운 눈” 후보 계산의 기반)                |
| Meaning Lock                    | is_virtual=true로 안전성 검증 후, WILL 시 is_virtual=false로 전환 |
| Reverse Decomposition           | 기존 실행 계획을 대체 자원에 맞는 새 N-MAP 패킷으로 재조립                   |
| project_simulations             | 가상 시뮬레이션 결과의 저장소(사전 평정/검증 근거)                          |
| is_virtual=false 투입             | 실제 EFF(실물 실행) 수행의 최종 단계(권한/신뢰 통과 필요)                   |


---

1. 공유(Share)와 구독(Subscription) 및 보호 전략
  “상시 공유 vs 동적 차용” 모두 대상 시스템 무결성을 유지해야 한다.


| 용어                        | 의미 및 역할                                            |
| ------------------------- | -------------------------------------------------- |
| device_members            | 사용자↔디바이스 공유 멤버십/역할 매핑                              |
| project_members           | 프로젝트 공유 멤버십(향후 확장)                                 |
| sharing_status            | `active`/`suspended`/`revoked`(소유자 주권으로 즉시 무효화 가능) |
| resource_sharing_policy   | 차용 우선순위/복구 조건/임대 기한(TTL)·할당량 제한을 담는 정책             |
| Suspension(Suspend)       | 소유자가 공유/차용 연결을 일시 중단해 원본을 독점 사용하도록 만드는 조치          |
| Revoke(영구 끊기)             | 소유자가 연결을 해제하고 차용자 접근을 영구 제거                        |
| Owner Sovereignty(소유자 주권) | 우선권은 항상 소유자에게 있으며, 대상 무결성은 훼손되지 않음                 |
| Host-First Policy         | 본 디바이스/소유자 리소스가 항상 우선 점유(대여자는 남는 여력만 사용)           |
| Subscription(구독)          | “새로 생성하지 않고 타인의 데이터를 참조/관측”하는 실시간 연결 모델            |


---

1. Empathy(공감) 및 활력 지수(VI) 제동
  Empathy는 실행의 ‘사람 중심’ 가드레일이다.


| 용어                   | 의미 및 역할                                  |
| -------------------- | ---------------------------------------- |
| Empathy Engine       | 행동 신호(체류/발화/롤백/취소 등)로 ES·VI·PP를 계산       |
| ES (Empathy Score)   | 사람의 정서/도움 필요도를 나타내는 지수                   |
| VI (Vitality Index)  | 사용자의 활력/피로도를 나타내는 지수(낮으면 제동)             |
| PP (Pace Preference) | 응답 속도 선호(fast/normal/slow)               |
| VI 임계값               | VI 구간별로 자율 실행/제안 강도를 조절하는 기준             |
| Low-Entropy 모드       | VI가 낮을 때 복잡한 자원 합성 제안을 중단하고 로컬/안정 자원만 사용 |
| ES·VI·PP 연동          | Empathy 신호를 system prompt 톤/실행 큐로 반영     |


---

1. NEXA-NEXU 캔버스 표현 언어
  NEXA-NIXIE는 데이터/상태를 “서사적 시각 언어”로 투영하는 캔버스 체계다.


| 용어                       | 의미 및 역할                                                  |
| ------------------------ | -------------------------------------------------------- |
| NEXA NIXIE / NEXU Canvas | HEXAGON×6-COILS 기반 지능형 서사 시각화 캔버스                        |
| Lumina                   | 신뢰도·상태(체온/부하)에 따라 발광 강도와 색온도가 변하는 “빛의 생명력”               |
| Jitter                   | 불확실/긴장/오류 상황에서 도트가 미세 떨리는 연출                             |
| Fractal Sync             | Capability ID 마침표(.) 계층에서 폭발/함몰(10-100-1000 군집화) 전이      |
| Implosion(함몰)            | Zoom Out 시 상위 개념으로 응축                                    |
| Explosion(폭발)            | Zoom In 시 세부가 사방으로 분화                                    |
| Mixer Node               | Where(GPS)와 Capability ID(논리 좌표)를 조율해 도트를 배치             |
| LOD                      | COLD/WARM/HOT 하드웨어 프로필에 따른 연출/연산 강도                      |
| COLD                     | 최소 애니메이션/가독성 우선 모드                                       |
| WARM                     | 하이브리드 연출 모드                                              |
| HOT                      | 풀 시뮬레이션/잔상 최대 모드                                         |
| 외부 도트 인입(VOID→편입)        | N-MAP-08에서 외부 자원이 VOID 외곽에서 클러스터 폭발로 현재 좌표계로 편입되는 연출 가이드 |


---

1. 에러 코드 및 서사적 애니메이션 매핑(넥슈/Rive)
  에러는 텍스트보다 먼저 표정/연출로 심각도를 전달한다.


| error_code              | 넥슈(Rive) 상태             | 캔버스 연출(요약)         |
| ----------------------- | ----------------------- | ------------------ |
| ADAPTER_TIMEOUT         | Confused(고개 갸우뚱)        | 해당 장치 도트 Jitter    |
| ADAPTER_NOT_FOUND       | Confused + “찾을 수 없음” 암시 | 흐릿한/Dim 처리         |
| ADAPTER_AUTH_DENIED     | 경고 + 잠금 제스처             | 잠금 아이콘/붉은 테두리      |
| ADAPTER_PARTIAL_SUCCESS | 고민 표정 + ASK 대기 유도       | 성공/실패 도트 구분        |
| ADAPTER_FATAL           | Shocked + 차단 모드         | 닉시 도트 붉게 + 전체 경고 톤 |


---

1. DB/스키마 핵심 컬럼 표기 용어
  문서 간 용어 혼선을 줄이기 위한 “표준 컬럼 의미” 정리다.


| 용어                       | 의미                                             |
| ------------------------ | ---------------------------------------------- |
| JSONB                    | 유연한 확장 설정/메타데이터 저장 타입                          |
| pgvector / vector        | 의미 유사도 검색을 위한 벡터 인덱싱                           |
| RLS                      | Row Level Security(프로젝트/사용자별 행 격리)             |
| TimescaleDB              | 시계열 로그 압축/하이퍼테이블                               |
| hypertable               | TimescaleDB의 시간축 최적화 테이블                       |
| settings_data            | project_settings.settings_data 내부 확장 정책(JSONB) |
| current_coil_template_id | 적용 중인 코일 밸런서 템플릿 ID(프로젝트 설정)                   |
| project_extensions       | 설치된 플러그인/외부 API 연동 설정                          |
| project_secrets          | 외부 API 자격 증명(암호문 저장)                           |
| project_simulations      | 가상 시뮬레이션 결과 저장                                 |
| project_network_topology | 장치 간 연결망/거리 저장                                 |
| timeline_branch_id       | 시뮬레이션 분기 타임라인 ID                               |
| post_state_snapshot      | 되감기/복원 스냅샷(JSONB)                              |


---

