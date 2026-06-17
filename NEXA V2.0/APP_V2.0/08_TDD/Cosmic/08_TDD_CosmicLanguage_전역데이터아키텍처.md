---
doc_id: TDD-044
title: "Cosmic Language · 전역 데이터 아키텍처"
category: "08_TDD"
domain: NEXAOS
status: published
created: 2026-06-10
updated: 2026-06-13
parent_doc: TDD-043
terms_standard: ["ontology", "3d-mapping"]
terms_nexa: ["Cosmic-Layer", "Cosmic-Language", "CLA", "CSIM", "APEX", "NEXAVULT", "Self-Verification"]
tags: ["doc/cat/08-tdd", "doc/domain/nexaos", "std/ontology", "std/3d-mapping", "nexa/Cosmic-Language", "nexa/CLA", "nexa/APEX", "nexa/NEXAVULT", "nexa/Self-Verification"]
---
# Cosmic · 전역 데이터 아키텍처

> **표기 (Normative):** 신규·개정 SSOT 본문 = **Cosmic** · Tier 지칭 시 **`T1`–`T3`** · 구현 **`CSIM`**. bare **`CL`** · **`CLA`** **deprecated** — [용어집 §3.2.2](../../용어집_NEXA전용_v2.0.md).
>
> **6대 레이어 분담:** **`Cosmic`** 본 문서 · 프로토콜·`Axon` [TDD-043](./08_TDD_CSIM_AXON프로토콜_정본.md) `parent_doc` · **`Kineton`** [TDD-072](../NEXIA/Kineton/08_TDD_Kineton_PhysicalBridge_ACTON_ROS2_v1.0.md) · [Global Architecture](../NEXAOS/08_TDD_NEXAOS_전역아키텍처표준_GlobalArchitectureStandard_v1.0.md)

## 정의 및 철학

**Cosmic**은 인간의 주권적 의지(Intention)와 물리 세계의 객관적 법칙(Physical Laws) 사이를 잇는 최상위 공리(Axiom)이자 지능형 온톨로지이자 NEXA Platform 자체입니다.
**Cosmic**은 데이터를 단순한 신호 전달 도구가 아니라, 서버에 구축된 고정밀 3D 지도와 시맨틱 네트워크를 바탕으로 스스로 맥락을 증명하는 지능적 개체로 다룹니다. 이는 현장의 파편화된 수치를 우주적 질서 안에서 해석하여 인간과 AI가 직감적으로 소통할 수 있게 만드는 범용 언어 체계입니다.

여기서 '증명(Self-Verification/Authentication)'은 단순히 수학적 문제를 푸는 과정이 아니라, "데이터 스스로가 자신이 왜 존재하며, 이 맥락에서 무엇을 의미하는지 논리적 근거를 완벽히 갖추고 있음"을 의미합니다.
Cosmic 체계 안에서 데이터가 스스로를 증명한다는 것은 다음 세 가지 요소를 충족한다는 뜻입니다.

> 위치와 존재의 증명 (Spatial Truth)

    - 데이터가 단순한 숫자로 존재하는 것이 아니라, NEXA의 고정밀 3D 지도 상의 특정 좌표와 즉각 결합됨을 의미합니다. "나는 지금 '어디'에 있는 데이터인가?"라는 질문에 대해 시스템의 도움 없이 스스로 위치적 근거를 제시합니다.

> 관계와 맥락의 증명 (Semantic Truth)

    - 시맨틱 네트워크를 통해 주변 데이터들과의 관계를 스스로 규명합니다. 예를 들어, 온도 센서의 값이 올라갔을 때 이것이 '단순한 기온 상승'인지 '장비의 과부하'인지, 주변의 다른 지표들과 대조하여 자신의 '진짜 의미'를 확정 짓는 과정입니다.

> 신뢰의 증명 (Integrity)

    - 파편화된 수치가 외부의 노이즈나 오류가 아님을, 설계된 우주적 질서(**Cosmic**) 안에서 스스로 논리적 일관성을 통해 입증하는 것입니다. 즉, "나의 수치는 설계된 법칙(Physical Laws)에 부합하는가?"를 데이터 스스로가 체크하고 나타나는 것입니다.

> 요약하자면

    - Cosmic에서의 증명이란, 데이터가 "나는 믿을 수 있는 데이터이며, 현재 이러한 맥락을 가지고 있다"라는 자기소개서를 완벽하게 지참하고 나타나는 것과 같습니다.
    - 덕분에 인간이나 AI가 이 데이터가 진짜인지, 어떤 의미인지 따로 분석하거나 의심할 필요 없이 직감적으로 즉시 믿고 사용할 수 있게 됩니다.

## 1. Cosmic의 존재 목적 (Raison d'être)

- **의미적 동기화(Semantic Synchronization):** 인간이 쓰는 모호한 자연어를 로봇이 즉시 실행 가능한 정밀 물리량으로, 로봇의 미세한 전기 신호를 인간이 이해하는 상황 맥락으로 상호 번역합니다.
- **지능형 자율성 부여:** 데이터 내부에 인과관계(Causality)와 강제성(Pulse)을 내재시켜, 중앙 통제가 끊긴 상황에서도 말단 장치(Node)가 프로토콜 원칙에 따라 자율적으로 안전 상태를 유지하게 합니다.

## 2. 참조 모델: 개념 계층과 구성 요소

개념적으로 상위에서 하위로 **Cosmic(의미·번역) → HEXAGON(문법) → CSIM(번역기)** 이 포개지며, 전송·검증 층에서는 **Zod-JSON·ROS 2**가 골격과 무결성을 맡습니다.

### 2.1 개념적 계층

- **Cosmic (의미·번역):** 물리 법칙과 인간의 의지를 동기화하는 최상위 관념. 물리적 사건을 의미로 치환합니다.
- **HEXAGON Protocol (문법):** Where, When, Who, What, How, Why 여섯 맥락으로 사건을 규정합니다.
- **CSIM (번역기):** 의미 매트릭스를 통해 모호한 의지를 정밀 물리량으로, 물리 수치를 인간 맥락으로 **실시간 상호 번역**하는 인터페이스입니다. 경량 **2×2/3×3** Matrix 는 **전송·편의 수단**이며, 목적은 **의미 동기화(Semantic Synchronization)** · **순도(Purity)** 입니다 — **판단·Run** 은 NEXAON(Nexaon).

### 2.2 HEXAGON Protocol (데이터의 맥락·사건성)

- 데이터를 단순 수치가 아닌 **사건(Event)**으로 정의합니다.
- **6-Core Context:** 모든 패킷은 Where(공간), When(시간), Who(주체), What(본질), How(상태), Why(인과) 메타데이터를 포함해야 합니다.
- 데이터는 스스로 누구의 의지로, 무엇을 위해, 현재 어떤 상태로 존재하는지 증명할 수 있어야 합니다.

### 2.3 CSIM — Cosmic Semantic Interface Matrix (의미 번역·LLM 정렬)

> CSIM(Cosmic Semantic Interface Matrix)은 물리적 데이터를 지능적 맥락으로 치환하는 가로·세로 축 기반의 **의미 매트릭스** 지도입니다. **개념 Tier:** **T1 공용어화** → **T2 맥락 동기화** → **T3 구체화** ([`TDD-043` §13.0.1](08_TDD_CSIM_AXON프로토콜_정본.md)).

| Tier | 단계 (EN) | Normative 정의 |
| :---: | :--- | :--- |
| **T1** | **Abstraction** · **공용어화** | 거친 WILL/FACT → **Matrix** **시스템 공용어** (양방향 1차 투영) |
| **T2** | **Contextualization** · **맥락 동기화** | Matrix + Domain/HEXAGON/`stateBus` → **오해 없는 의미** (+ Ethos 정렬) |
| **T3** | **Concretization** · **구체화** | 의미 → **Narrative** \| **Action** — CSIM 번역 · Run/표현 = NEXAON · Nixie · ACTON |

- **해석적 유연성:** 동일한 전압 수치라도 매트릭스 좌표에 따라 정상 상태(Is)로도, 잠재적 위험(Might)으로도 해석될 수 있습니다.
- **초경량 벡터 통신:** 현장 장치는 좌표, 크기, 변화량 같은 최소 벡터 데이터를 고빈도로 전송해 트래픽을 절감합니다.
- **시맨틱 추론:** 서버 LLM은 Cosmic 온톨로지를 참조해 수신 벡터를 과거 기억(3D 스캔 데이터)과 전후 맥락에 결합하고 사건의 본질(Why)과 Narrative를 생성합니다.
- **LLM 게이트웨이:** LLM이 레지스터 값을 직접 읽지 않고 CSIM이 번역한 의미 토큰을 읽게 하여 환각(Hallucination)을 줄이고 물리 세계와의 논리적 정렬(Alignment)을 취합니다.
- **NEXAON 분리:** CSIM은 **번역·정렬·토큰화**만 담당한다. **상황 판단 · Run · HEXAGON 명령 생성**은 **NEXAON(Nexaon)** — CSIM이 만든 **Matrix·HEXAGON 토큰**을 **입력**으로 사용한다 ([`TDD-043` §2.3 · §13.0](08_TDD_CSIM_AXON프로토콜_정본.md)).

### 2.4 Zod-JSON 및 ROS 2 Schema (골격·무결성)

- **Zod 및 JSON:** 모든 Cosmic 메시지는 Zod 스키마로 전송 전후 검증됩니다. 런타임 무결성 검사로 프로토콜 위반이나 잘못된 명령이 물리 계층으로 내려가는 것을 막습니다.
- **ROS 2 표준:** 데이터 골격은 ROS 2 표준 메시지를 따릅니다. `geometry_msgs/Point`, `sensor_msgs/Imu` 등으로 NEXA-Platform과 모든 로봇·센서와의 호환성을 확보합니다.
- **VOID(파기):** ROS 2 규격을 따르지 않거나 논리 오류가 있는 데이터는 액추에이터에 도달하기 전 폐기되어 장비 손상을 원천 차단합니다.

### 2.5 지도 레이어 모델 (물리/추상/의미)

- **물리 세계 지도(Reality Map):** 갈보 레이저 기반 현실 스캔 결과를 좌표 기준으로 보관하는 3D 지도입니다.
- **추상 세계 지도(Operation Map):** 운영 상태, 위험도, 우선순위, 업무 존(Zone) 중심으로 단순화한 지도입니다.
- **의미 지도(Semantic Map):** CSIM/HEXAGON 관점의 사건 관계와 인과(Why)를 연결한 의미 그래프 지도입니다.
- 기본 운영은 추상/의미 지도로 수행하고, 근거 확인이 필요할 때 물리 지도로 드릴다운하는 방식을 권장합니다.

### 2.6 CSIM 운영 배치 (피지컬 티어 × Tier)

> **SSOT:** Tier 정의 = §2.3 · 배치 축 = [TDD-040 §0](../AI/08_TDD_AI_지능위계및하드웨어사양.md) · 파이프라인 = [Global Architecture §Cold Path](../NEXAOS/08_TDD_NEXAOS_전역아키텍처표준_GlobalArchitectureStandard_v1.0.md)

| 배치 | Tier | 역할 | PT |
| :--- | :---: | :--- | :---: |
| **ML0 말단** | **T1** | Matrix 공용어화 · raw uplink **✗** | PT-0 ~ PT-2 |
| **Ingress · Gate** | **T2** | 맥락·Ethos 정렬 · `stateBus` | PT-3 _(허브)_ |
| **Nexaon Run 입력** | **T3R** | semantic chunk · Run 정렬 _(Run 소유 ✗)_ | PT-3 |
| **Nixie 표현** | **T3N** | Narrative · ECHO | PT-0 ~ PT-3 _(표현)_ |
| **ACTON 하향** | **T3A** | Action · HEXAGON | PT-0 ~ PT-2 _(Hot)_ |

**경계:** `CSIM` = **번역·정렬만** — promoted · Run 종결 · Hot Path 집행 **소유 ✗** ([TDD-073](../NEXIA/Nexaon/08_TDD_Nexaon_Distillation오케스트레이터_v1.0.md) · [TDD-072](../NEXIA/Kineton/08_TDD_Kineton_PhysicalBridge_ACTON_ROS2_v1.0.md)).

## 3. 전역적 데이터 흐름 (Data Life-Cycle)

1. **Generation (생성):** 인간의 의지(WILL)나 환경 변화(FACT) 발생.
2. **Mapping (매핑):** CSIM 매트릭스로 의미적 좌표 부여.
3. **Encapsulation (캡슐화):** HEXAGON 토큰과 결합해 JSON 패킷화.
4. **Verification (검증):** Zod 런타임 무결성 검사.
5. **Transmission (전송):** 지연·신뢰성·보안 요구에 맞춰 §4.1에 기술한 전송 채택(예: MQTT, WebSocket, ROS 2 DDS 등). 말단·국소에서는 ESP-NOW, 필드 버스 등이 병행될 수 있습니다.
6. **Action & Echo (실행 및 피드백):** 물리 실행 후 결과를 CSIM으로 역번역해 상향 보고.

역방향 피드백은 §4.2와 연결됩니다.

## 4. 구현 스택: 통신 인프라와 인지 루프

### 4.1 통신 인프라 (Data Highway)

Cosmic 페이로드는 Zod 검증 후 동일하게 실을 수 있고, 실제 채택은 링크 신뢰성·양방향 필요·브라우저/모바일 도달 범위·ROS 2 상호운용 여부 등에 따라 조합합니다. 아래는 대표적인 후보입니다.

- **MQTT / MQTT-SN:** 브로커 기반 발행·구독. 엣지·클라우드 브리지, QoS, 유지 세션 등으로 상태 스트림·명령에 널리 씁니다.
- **WebSocket / WSS:** 브라우저 대시보드·SPA와 백엔드 간 양방향 실시간(텔메트리, 일부 명령)에 적합. TLS(WSS)·역방향 프록시와 함께 씁니다.
- **HTTP/HTTPS 및 REST:** 구성 반영(Configuration), 헬스·OTA 메타데이터, 대용량 또는 캐시 친화적 요청 등 요청–응답형 제어와 문서화에 유리합니다.
- **Server-Sent Events(SSE):** 서버→클라이언트 단방향 스트림이면서 WebSocket보다 단순한 배포가 필요할 때 대안이 됩니다.
- **gRPC / gRPC-Web:** 타입 안전 RPC, 서비스 간 고성능 스트리밍, 내부 마이크로서비스·에이전트 게이트웨이 레이어에 적합합니다.
- **ROS 2 DDS:** ROS 2 노드 간 기본 미들웨어. 동일 패킷을 ROS 타입과 Cosmic JSON 양쪽으로 매핑하는 브리지 패턴과 자연스럽게 맞습니다.
- **AMQP / RabbitMQ 등:** 업무 규약·데드레터 등이 필요한 명령·이벤트 큐 패턴을 쓸 때 고려합니다.
- **Kafka / 이벤트 스트림:** 다수 소비자, 재생(Replay), 감사 로그가 필요한 시스템 전역 버스 후보입니다.
- **WebRTC(Data Channel):** P2P·저지연이 필요한 원격 조종·영상 동기 신호 등에 활용 가능(시그널링은 HTTPS/WebSocket 등 별도).
- **ESP-NOW (Neural Sync):** 중앙 장치와 말단 액추에이터(ESP32) 간 저지연 국소 동기. 1:N 무선으로 마이크로초 단위 정밀 동기화에 활용합니다.
- **필드 버스(CAN, RS-485/UART(Modbus 등), EtherCAT):** 모터 드라이브·PLC·안전 장치 등 공장·차량 근처 링크. 게이트웨이에서 Cosmic 상위망과 연결합니다.
- **Thread / Zigbee / Bluetooth LE Mesh:** 배터리·건축물 내부 등 저전력 근거리 스마트 디바이스 집약 구역 후보입니다.
- **LTE/5G, LoRaWAN, 위성 터미널:** 전원·허용 대역 내에서 장거리 또는 오프그리드 현장 장비 백홀로 조합 가능합니다.

**패턴 참고:**

- **Hybrid G-Code Strategy:** 짧은 즉시 명령은 경량 채널(MQTT·WebSocket 등) 페이로드로 보내고, 대규모 작업 계획은 URL로 분리 다운로드하는 이원화 예시입니다.

**부록 보강:** 전송 채 선택 시 MQTT 토픽·WS 경로·HTTP 리소스·gRPC 서비스 정의 등 **라우팅 명세를 버스별로** 정리하면 상호운용이 수월합니다.

### 4.2 순환 제어 및 피드백 (Cognitive Loop)

- **SimpleFOC Feedback:** BLDC 등 물리층의 전류·전압 변화를 데이터화해 장력·부하를 추정합니다.
- **CSIM 역번역(Inverse Mapping):** 센서 데이터를 다시 의미 매트릭스에 투영합니다.
- **예:** 단순 전류 피크(Fact) → 고착 상태(STUCK/Error) → 긴급 보고(ECHO/MUST).
- **Digital Twin 동기화:** 역번역 결과를 MQTT·WebSocket 등 상위망 경로로 웹 플랫폼 3D 맵 등에 반영해 가상·실제 상태를 맞춥니다.

## 5. 전역적 관점에서의 가치

의지(Human) → 논리(AI) → 전송(Network) → 힘(Machine)으로 이어지는 과정을 하나의 지능형 언어 순환 체계로 묶습니다.

1. **성찰적 학습:** 하드코딩 중심이 아니라 누적 데이터 기반으로 판단 임계값을 보정하며 시간이 흐를수록 정교해지는 자가 진화형 시스템을 지향합니다.
2. **도메인 확장성:** NEXA-Platform을 통해 아트, 디자인, 산업, 건축, 일상 등 고도 협업이 필요한 영역으로 표준 언어 규격을 확장할 수 있습니다.
3. **직감적 피드백:** 영상 원본에 의존하지 않고 추상 벡터 그래픽과 CSIM 번역 결과로 상황을 빠르게 파악하며, 필요 시 3D 지도 기반 근거(사진/영상)를 호출해 검증할 수 있습니다.
4. **안전성:** 하드웨어(슬립 클러치 등)와 소프트웨어(Zod·전류 감지)의 이중 방어로 파손을 줄입니다.
5. **지능화:** LLM이 기계 레지스터가 아니라 CSIM 매트릭스라는 의미론적 층을 통해 세계를 읽고 조작합니다.

**정리:** **Cosmic**은 철학적 최상위 프레임이고, **CSIM**은 그 철학을 물리 세계와 잇는 정교한 다리입니다.

## 부록

### A. 향후 구체화 과제

문서·구현을 구체화할 때 참고할 작업 목록입니다.

- 데이터 패킷 **헤더 구조(Header Structure)** 명세
- CLP를 LLM에 안전히 쓰기 위한 **프롬프트·학습 가이드라인**
- **Zod 스키마**를 통한 메시지 표준(언어의 표준) 확정
- **MQTT 토픽·WebSocket 경로·HTTP/gRPC 라우팅** 등 버스별 명세 및 페이로드 규약 설계
- 협업 세션의 **저장소·충돌 정책·감사 로그**(§부록 B)와 현장 명령 경로 간 **책임 경계** 문서화

### B. 협업·실시간 공유 상태 (애플리케이션 레이어)

협업은 플랫폼 핵심 기능으로 간주하되, 본 규격의 **MQTT·WS·DDS 등 전송 채널**(§4.1)과 역할을 혼동하지 않는 편이 좋습니다.

- **역할 분리:** **Cosmic 페이로드 + Zod**는 교환되는 메시지의 진실 근원에 가깝고, 브라우저 **React 상태(Zustand)**(Zustand, Zustand 등)는 화면·세션 표현 로컬 상태에 가깝습니다. 협업으로 합의된 초안은 **별도 검증·권한·버전**(Who/Why 등 HEXAGON 맥락 포함) 후에 명령·설정 명으로 하위망으로 내려가는 패턴을 권합니다.
- **Yjs:** 문서형·구조형 상태에 널리 쓰이는 **CRDT** 라이브러리. 브라우저 간 동시 편집·오프라인 후 병합·awareness 등에 활용할 수 있습니다.
- **다른 CRDT:** **Automerge**(JSON 친화)·**Ink & Switch** 계열 패턴 참고. 도메인에 맞는 문서 단위 선택이 필요합니다.
- **OT(Operational Transform):** 전통적인 동시 편집 분기 중 하나로, 레거시 호환 또는 특정 에디터 엔진과 맞물릴 때 키워드로 조사합니다.
- **협업 백플레인 브리지:** Yjs 등을 **WebSocket**(예: 자체 또는 **Hocuspocus**, **y-websocket** 패턴)·**WebRTC** 등으로 묶거나, 매니지드 레이어(**Liveblocks**, **PartyKit** 등과 유사 접근)·**Socket.io**(룸·네임스페이스) 같은 실시간 그룹 단위 채널을 검토할 수 있습니다.
- **Realtime DB·브로커 패턴:** **Supabase Realtime**, **Firebase RTDB**(또는 Firestore)·**Phoenix Channels**(Elixir) 등 발행 구독·프레즌스가 필요하면 후보 목록에 둡니다.
- **스토어·복제:** **electric-sql**(로컬-클라우드 동기)·**CR-SQLite**(SQLite 기반 복제)·**Ditto** 같은 **복제(Replicated)** 레이아웃은 현장 장비 오프라인과 웹 편집 동기 교차 시 탐색 키워드입니다.
- **프레즌스·표시준 실시간 UI:** 다른 사용자 커서·선택(selection)·락 표시 등은 UX상 별 과제(**Presence**)로 명세하면 SIM·헥사곤 메타와 연계하기 좋습니다.
- **감사·규약:** 변경 이력·승인·역할(**RBAC/ABAC**), 이벤트 소싱 또는 **Kafka** 등 감사 스트림은 “누가 무엇을 확정했는가”와 물리 실행 사이 신뢰를 보강합니다.
- **사람–사람·사람–에이전트 협업:** 채널로 **매트릭스 프로토콜(Matrix)** 같은 연합형 메시지, 또는 **Human-in-the-loop** 명령 대기열(§4.1의 AMQP 계열과도 연결)을 함께 설계 검토할 수 있습니다.

**정리:** 협업 스택(Yjs·Zustand 스토어·실시간 브리지)은 **UI·합의·초안** 층에 두고, 현장 실행용 **Cosmic 메시지 경로**(검증·VOID·안전 장치)는 본문 §2–§4의 규칙과 맞추는 것이 안전합니다.

############################################################
운영 시나리오 예시
############################################################

이 절은 본문 규격을 실제 운영에 매핑하기 위한 예시이며, 수사적 설명 대신 재현 가능한 흐름으로만 기술합니다.

## 시나리오 1: 초경량 벡터 기반 이벤트 감지

### 목적

- 저대역폭 환경에서 이벤트를 빠르게 감지하고 의미를 상향 보고합니다.

### 흐름

1. Edge(ESP32)가 변화량(좌표, 크기, 진동 등)만 추출해 델타 벡터를 생성합니다.
2. 전송층(MQTT/WS/기타)으로 최소 패킷을 상향 전송합니다.
3. 서버가 CSIM 좌표 매핑 후 HEXAGON 문맥을 결합합니다.
4. Zod 검증 통과 시 이벤트를 확정하고, 실패 시 VOID 처리합니다.
5. 확정 이벤트를 Digital Twin과 운영 UI에 동기화합니다.

### 입력 예시

```json
{
  "id": "NEXA 기증자격 아이디",
  "pos": [120, 45],
  "size": [40, 40, 30],
  "type": "static",
  "delta": { "size_z": 5 }
}
```

### 기대 결과

- 영상 전송 없이도 상태 이상·객체 출현·고착 이벤트를 탐지할 수 있습니다.
- 상향 트래픽과 추론 부하를 동시에 절감합니다.

### 실제값 템플릿 (YAML)

```yaml
scenario:
  id: SCN-001
  name: gate_object_delta_detection
input_event:
  source: esp32-gate-01
  transport: mqtt
  topic: cla/edge/gate/object
  schema_version: cla.event.object-delta.v1
  payload:
    id: obj_20260506_001
    ts: '2026-05-06T10:12:00Z'
    pos: [120, 45]
    size: [40, 40, 30]
    type: static
    delta: { size_z: 5 }
validation:
  zod: ObjectDeltaEventV1
  on_fail: VOID
mapping:
  csim_cell: A3xL2
  semantic_label: POSSIBLE_DELIVERY
output:
  echo_topic: cla/echo/gate/object
  twin_channel: ws://nexa/twin/gate
```

## 시나리오 2: 직감형 확인과 근거 조회

### 목적

- 사용자가 벡터 상태를 즉시 이해하고, 필요 시 근거 데이터를 조회하도록 합니다.

### 흐름

1. UI는 객체를 벡터 그래픽으로 표시합니다.
2. 사용자는 벡터를 클릭해 해당 이벤트의 근거(사진/클립/스냅샷)를 조회합니다.
3. 서버는 이벤트 ID 기준으로 시점·좌표가 정합한 근거를 반환합니다.
4. 사용자는 추론 결과와 근거를 비교해 상태를 승인/보류합니다.

### 기대 결과

- 기본 화면은 가볍고, 검증은 필요 시에만 수행되어 운영 효율이 높아집니다.
- LLM 판단의 설명 가능성과 신뢰도가 향상됩니다.

### 실제값 템플릿 (YAML)

```yaml
scenario:
  id: SCN-002
  name: vector_click_evidence_lookup
ui_event:
  action: click_vector
  vector_id: obj_20260506_001
  user_id: operator_01
query:
  evidence_index: cla_evidence_index_v1
  filters:
    time_window_sec: 30
    spatial_tolerance_px: 12
    confidence_min: 0.70
response:
  evidence:
    image_uri: s3://nexa-evidence/gate/2026/05/06/obj_20260506_001.jpg
    clip_uri: s3://nexa-evidence/gate/2026/05/06/obj_20260506_001.mp4
    snapshot_ts: '2026-05-06T10:11:58Z'
  llm_reason:
    label: delivery_candidate
    risk_score: 0.62
review:
  decision: pending # approve | hold | reject
```

## 시나리오 3: 능동 대응 및 성찰적 학습

### 목적

- 위험 상황에 선제 대응하고, 누적 데이터를 통해 판단 임계값을 개선합니다.

### 흐름

1. 서버가 CSIM 문맥과 외부 신호(예: 기상, 시간대, 패턴 이탈)를 결합해 위험도를 산정합니다.
2. 정책 임계값을 초과하면 액추에이터 명령을 발행합니다(예: 보호 동작, 경고 신호).
3. 실행 결과(ECHO)와 사용자 확정 라벨(정상/오탐)을 이벤트 로그로 적재합니다.
4. 주기적 학습으로 임계값·가중치를 재보정합니다.

### 기대 결과

- 즉시 대응(안전)과 장기 최적화(정확도)가 동시에 달성됩니다.
- 하드코딩 의존도를 줄이고 운영 데이터 기반 의사결정이 강화됩니다.

### 실제값 템플릿 (YAML)

```yaml
scenario:
  id: SCN-003
  name: proactive_response_and_reflective_learning
risk_assessment:
  inputs:
    csim_cell: A4xL4
    weather_forecast_rain_prob: 0.86
    object_present: true
    time_band: evening
  risk_score: 0.84
policy:
  threshold_high: 0.80
  action_on_high: extend_awning
command:
  transport: mqtt
  topic: cla/cmd/gate/awning
  payload:
    command: EXTEND
    duration_sec: 120
    reason: rain_protection_for_detected_object
echo:
  topic: cla/echo/gate/awning
  result: success
learning:
  log_store: cla_event_log_v2
  label_from_user: true_positive
  update:
    parameter: rain_object_protection_weight
    old: 0.58
    new: 0.63
```

## 시나리오 4: 3D 지도 기반 상황 디스플레이

### 목적

- NEXA-Platform의 3D 지도를 기준 좌표계로 사용해 이벤트를 공간적으로 표시하고, 운영자가 현황을 즉시 파악하도록 합니다.
- 3D 지도는 단일 전역 지도가 아니라 도메인별(예: 로봇, 건축, 산업) 및 프로젝트별로 분리된 지도를 사용합니다.

### 흐름

1. 서버는 검증 완료 이벤트를 `world_frame` 좌표로 정규화합니다.
2. Digital Twin 서비스는 물리 지도(Reality Map)와 추상/의미 지도(Operation/Semantic Map)를 동시에 갱신합니다.
3. 운영자가 객체를 클릭하면 증거 데이터(이미지/클립)와 CSIM 해석 결과를 오버레이로 표시합니다.
4. 운영자가 승인/보류/반려를 선택하면 결과를 이벤트 로그와 학습 레이어에 반영합니다.

### 기대 결과

- 텍스트 로그 중심 관제를 공간 관제 중심으로 전환할 수 있습니다.
- 같은 이벤트를 "위치 + 상태 + 근거"로 한 화면에서 확인해 대응 시간을 단축합니다.

### 실제값 템플릿 (YAML)

```yaml
scenario:
  id: SCN-004
  name: twin_3d_situation_display
twin:
  domain: robot
  project_id: skyten-gate
  map_id: skytengate_v3
  map_namespace: robot/skyten-gate
  frame: world
  render_channel: ws://nexa/twin/gate
  refresh_hz: 10
  map_layers:
    reality_map: galvo_scan_v3
    operation_map: ops_zone_map_v1
    semantic_map: csim_relation_map_v1
event_binding:
  source_topic: cla/echo/gate/object
  projection:
    pos_xy_to_world: true
    z_policy: ground_clamp
  style:
    risk_low: '#3CB371'
    risk_mid: '#F4C542'
    risk_high: '#E63946'
interaction:
  on_click:
    open_panel: evidence_and_reason
    fetch:
      evidence_index: cla_evidence_index_v1
      reason_topic: cla/reason/gate/object
review:
  decision_actions: [approve, hold, reject]
  writeback_topic: cla/review/gate/object
  audit_stream: kafka://cla.audit.review
```

## 운영 체크리스트

- 스키마: 메시지 버전, 필수 필드, VOID 규칙 명시
- 전송: 버스별 QoS/재시도/순서 보장 정책 명시
- 보안: 인증, 권한(RBAC/ABAC), 감사 로그 추적 키 정의
- 관측성: 지연, 유실률, 오탐률, 재현 가능 지표 대시보드화
- 협업: 승인 워크플로와 실행 명령 경로의 책임 경계 고정

## 문서 포지션 및 평가 (NEXA Platform OS 관점)

### 현재 포지션

- 본 문서는 NEXA Platform OS의 **루트 아키텍처 문서**로 기능할 수 있습니다.
- OS 관점에서 보면 커널 설계서라기보다, **의미 계층(Cosmic · CSIM) + 데이터 계층(Zod/ROS2) + 전송 계층 + 운영 계층**을 한 번에 정의하는 상위 기준 문서입니다.
- 특히 물리 지도/추상 지도/의미 지도의 분리 원칙과 시나리오 1~4는, 향후 모듈 분할 시 각 서브시스템의 경계를 잡는 기준점으로 유효합니다.

### 강점 평가

- 철학(공리/온톨로지)부터 운영 시나리오(YAML)까지 내려오는 **수직 일관성**이 확보되어 있습니다.
- 검증/폐기(VOID), 추론(CSIM), 실행(ECHO), 협업(승인/감사)까지 포함되어 **운영 현실성**이 높습니다.
- 도메인/프로젝트 단위 지도 분리와 3계층 지도 모델은 멀티 프로젝트 OS 확장에 적합합니다.

### 보완 권장사항

- 본 문서를 루트로 두고, 하위 문서를 `Core Spec`, `Runtime Spec`, `Map Spec`, `Policy Spec`으로 분리해 참조 관계를 명시하면 유지보수성이 크게 올라갑니다.
- 용어 사전(Glossary)과 버전 정책(예: `cla.spec.v1.x`)을 별도 섹션으로 고정하면 팀 온보딩 속도가 빨라집니다.
- 시나리오 YAML을 실제 Zod 스키마 파일과 1:1 매핑해 문서-코드 괴리를 줄이는 것이 다음 단계로 적절합니다.

### 총평

현재 문서는 NEXA Platform OS의 "아이디어 메모" 단계를 넘어, **상위 표준(Constitution) 문서**로 전환 가능한 수준입니다.  
즉시 구현을 강제하기보다는, 이 문서를 기준으로 모듈별 실행 규격을 파생시키는 방식이 가장 안전하고 확장성 높은 접근입니다.
---

## 관련 문서

| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [CSIM · AXON 프로토콜 정본 (TDD-043)](./08_TDD_CSIM_AXON프로토콜_정본.md) |
| 5W1H 레이어 | [5W1H · 6 대 추상 레이어 규격 (TDD-033)](../AI/08_TDD_AI_5W1H_6대추상레이어규격.md) |
