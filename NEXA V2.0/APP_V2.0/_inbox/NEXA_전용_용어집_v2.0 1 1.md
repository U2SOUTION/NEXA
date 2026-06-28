---
doc_id: 
title: ""
category: ""
domain: 
status: draft
created: 2026-06-24
updated: 2026-06-27
parent_doc: 
implements_doc: 
see_also: []
terms_standard: []
terms_nexa: []
---

# NEXA_ 전용 _ 용어집 _v2.0 1 1

NEXA OS 는 **유기적 지능 생태계**이다.

1. **Physical-TIER** — **어디서** 연산하나 (PT_0~3)
2. **Menton Layer (ML0~ML3)** — **얼마나 깊게** 사고하나
3. **Axon Layer (AL_1~AL_7)** — **어떤 규격**으로 신호·의미·실행을 포장하나

- **Core-Engine-Stack (CES)** — 전체 지능을 관통하는 **중앙 스택/엔진**
- **Physical-Centric-Hierarchy (PCH)** — 물리 티어를 축으로 위계를 **결정**하는 구조
- **Hub-and-Spoke / Cosmic-Layer** — 확장 시 허브 - 스포크 형태 및 계층화를 **표준**으로 삼는 방식
- **AXON / AXON-Stack-Layer** — 의미·실행을 **신호 계층으로 포장/전달**하는 규격
- **CSIM / APEX / HEXAGON / ACTON** — 계층 간 상호작용과 변환을 담당하는 **컴퓨팅 블록/도메인 구성요소**
- **Environment-Guard / ENVIRON-Shield** — 보안·격리·환경 경계로서의 **방어 계층**
- **Menton Layer**·**Axon Layer**·**Physical-Tier** 간 계층 경계로서의 **신호/의미 전달 규칙**
- Contextual-Awareness-Timeline (CAT) 이벤트 시계열을 따라 인식·추론·전환이 동작하는 규칙/타임라인이다.
- **Galthon / Kineton / Menton / Nexaon** — 계층을 잇는 이름 규격 및 도메인 라우팅을 담당하는 **연결 구성요소**



## NEXA V2.0 전용 용어

### 플랫폼 · OS
> TC: Tier-Code

| TAG                    | CODE                 | TIER         | TC(약어) | LABEL_KO    | LABEL_EN                                            | CATEGORY | DEFINITION                                                | NOT                              | ARTIFACT | RELATED | SSOT    | NOTES               |
| :--------------------- | :------------------- | :----------- | :----- | :---------- | :-------------------------------------------------- | :------- | :-------------------------------------------------------- | :------------------------------- | :------- | :------ | :------ | :------------------ |
| `NEXA`                 | NEXA                 | L0 플랫폼 표준    | PLAT   | 넥사          | NEXA                                                | platform | 사업·플랫폼 전체 브랜드                                             |                                  |          |         | BRD-001 |                     |
| `NEXA OS`              | NEXA_OS              | L0 플랫폼 표준    | PLAT   | 넥사 OS       | NEXA OS                                             | platform | OS·셸·도메인·미션크리티컬 설계층                                       |                                  |          |         | TDD-001 |                     |
| `domainKey`            | domainKey            | L3 내부 코드 변수  | INTVAR | 도메인 키       | domainKey                                           | platform | Header 전역 메뉴 도메인 식별자 (`nexia`, `erp` …)                   |                                  |          |         | TDD-071 |                     |
| `subRoute`             | subRoute             | L3 내부 코드 변수  | INTVAR | 서브 라우트      | subRoute                                            | platform | 단일 `domainKey` 내 content 분기 (`erp/parts`)                 |                                  |          |         | TDD-071 |                     |
| `MainShell`            | MainShell            | L1 제품 및 컴포넌트 | PROD   | 메인 쉘        | MainShell                                           | platform | 4 영역 + StatusBar 플랫폼 셸                                    |                                  |          |         | UIX-004 | 구 UIX-006 → UIX-004 |
| `domainLayoutRegistry` | domainLayoutRegistry | L3 내부 코드 변수  | INTVAR | 도메인 레이아웃 레지 | domainLayoutRegistry                                | platform | domainKey→슬롯 lazy import 레지스트리                            |                                  |          |         | TDD-071 |                     |
| `useLayoutStore`       | useLayoutStore       | L3 내부 코드 변수  | INTVAR | 유즈레이아웃 스토어  | useLayoutStore                                      | platform | 드로어·상태바 Zustand SSOT                                      |                                  |          |         | UIX-004 |                     |
| `drawerDefaults`       | drawerDefaults       | L3 내부 코드 변수  | INTVAR | 드로어 디폴트     | drawerDefaults                                      | platform | 도메인별 L/R 드로어 open 정책                                      |                                  |          |         | TDD-071 |                     |
| `SystemStatusBar`      | SystemStatusBar      | L1 제품 및 컴포넌트 | PROD   | 시스템 상태바     | SystemStatusBar                                     | platform | 하단 1 줄 + 확장 상태 패널 · CAT 후보 거점 (미정)                        |                                  |          |         | UIX-004 |                     |
| `AppHeader`            | AppHeader            | L1 제품 및 컴포넌트 | PROD   | 앱 헤더        | AppHeader                                           | platform | 상단 전역 헤더                                                  |                                  |          |         | UIX-004 |                     |
| `themePreset`          | themePreset          | L3 내부 코드 변수  | INTVAR | 테마 프리셋      | themePreset                                         | platform | 도메인 테마 (`office-light` 등)                                 |                                  |          |         | TDD-071 |                     |
| `packages shared`      | packages_shared      | L2 시스템 ID    | SYSID  | 모노레포 공유폴더   | packages/shared                                     | platform | Zod·commands 공유 패키지                                       |                                  |          |         | TDD-007 |                     |
| `agent graph`          | agent_graph          | L2 시스템 ID    | SYSID  | 에이전트 그래프    | agent-graph                                         | platform | LLM·Embed·LangGraph 실행 앱                                  |                                  |          |         | TDD-003 |                     |
| `GraphCanvas`          | GraphCanvas          | L1 제품 및 컴포넌트 | PROD   | 그래픽 켄버스     | GraphCanvas                                         | platform | React Flow 워크플로 UI · Yjs `.nxflow`                        |                                  |          | Nexaon  | TDD-007 |                     |
| `apps sync`            | apps_sync            | L2 시스템 ID    | SYSID  | 앱스/싱크       | apps/sync                                           | platform | Hocuspocus Yjs 서버                                         |                                  |          |         | TDD-038 |                     |
| `embedder`             | embedder             | L2 시스템 ID    | SYSID  | 임베더         | embedder                                            | platform | in-process 임베딩 (`/v1/embed`)                              |                                  |          |         | TDD-003 |                     |
| `M.O.S.E.S.`           | M.O.S.E.S.           | L0 플랫폼 표준    | PLAT   | 모세          | Mission-Operational Safety Engineering Standard<br> | platform | 미션크리티컬 설계 원칙 약어                                           |                                  |          |         | TDD-001 |                     |
| `Galthon`              | Galthon              | L1 제품 및 컴포넌트 | PROD   | 갈톤          | Galthon                                             | platform | NEXA 전체 신뢰성 담보 독립 감시 주체 — Why-Chain·trace 횡단 관측 · 흐름 개입 ✗ | ≠ NEXA · ≠ Menton · ≠ Nexaon Run |          |         | TDD-074 | 6 대 핵심 축 ✗           |

### domainKey (제품·업무 영역)
> 상세 맵: [TDD-071](08_TDD/NEXAOS/08_TDD_NEXAOS_도메인구조통합_v1.0.md). [[08_TDD_NEXAOS_도메인구조통합_v1.0]]

| tag       | code    | TIER      | TC(약어) | label_ko | label_en | category  | definition                            | not                        | artifact | related      | ssot    | notes |
| :-------- | :------ | :-------- | :----- | :------- | :------- | :-------- | :------------------------------------ | :------------------------- | :------- | :----------- | :------ | :---- |
| `Nexia`   | nexia   | L2 시스템 ID | SYSID  | 넥시아      | nexia    | domainKey | 플랫폼 핵심 지능 셸 · DIEA 호스트 · Distillation | NEXAON 프로젝트명 · NEXIA 표기 혼동 |          | DIEA, Nexaon | TDD-071 |       |
| `Ontex`   | ontex   | L2 시스템 ID | SYSID  | 온텍스      | Ontex    | domainKey | 온톨로지·Graph RAG·pgvector (구 nexion 흡수) |                            |          |              | TDD-071 |       |
| `ERP`     | erp     | L2 시스템 ID | SYSID  | 이알피      | erp      | domainKey | ERP 메인 (구 erp-parts 통합)               |                            |          |              | TDD-071 |       |
| `Nexabo`  | nexabo  | L2 시스템 ID | SYSID  | 넥사보      | nexabo   | domainKey | IoT 관제·텔레메트리 (구 nexage)               |                            |          |              | TDD-071 |       |
| `Nexet`   | nexet   | L2 시스템 ID | SYSID  | 넥셋       | nexet    | domainKey | SW/HW 마켓 유통                           |                            |          |              | TDD-071 |       |
| `Infra`   | infra   | L2 시스템 ID | SYSID  | 인프라      | infra    | domainKey | 장치 등록·my-devices                      |                            |          |              | TDD-071 |       |
| `Network` | network | L2 시스템 ID | SYSID  | 네트워크     | network  | domainKey | WiFi·CAN·MQTT 토폴로지                    |                            |          |              | TDD-071 |       |
| `Admin`   | admin   | L2 시스템 ID | SYSID  | 어드       | admin    | domainKey | 슈퍼 관리 (구 nexa-admin)                  |                            |          |              | TDD-071 |       |

### 아키텍처 축 — Physical · Menton · Engine
> **한 줄:** PT = 배치 · ML = 논리 계층 · Core Engine = 기능. SSOT: [TDD-040](08_TDD/AI/08_TDD_AI_지능위계및하드웨어사양.md) · [TDD-075 Hub-and-Spoke](08_TDD/NEXAOS/08_TDD_NEXAOS_전역아키텍처표준_GlobalArchitectureStandard_v1.0.md).

| TAG                   | CODE            | TIER         | TC(약어) | LABEL_KO      | LABEL_EN                  | CATEGORY      | DEFINITION                                       | NOT                                 | ARTIFACT | RELATED | SSOT    | NOTES             |
| :-------------------- | :-------------- | :----------- | :----- | :------------ | :------------------------ | :------------ | :----------------------------------------------- | :---------------------------------- | :------- | :------ | :------ | :---------------- |
| `Physical Tier`       | PT              | L1 제품 및 컴포넌트 | PROD   | 피지컬 티어        | Physical Placement Tier   | axis          | 어디서 연산하나 — 4 단 PT0~3                              |                                     |          |         | TDD-040 |                   |
| `Menton Layer`        | ML              | L1 제품 및 컴포넌트 | PROD   | 멘톤 레이어        | Menton Intelligence Stack | axis          | 소프트웨어상 역할 층 ML0~ML3                              | ≠ NEXA 브랜드 · ≠ NL0–NL3 (deprecated) |          |         | TDD-040 |                   |
| `Core Engine Stack`   | CoreEngineStack | L1 제품 및 컴포넌트 | PROD   | 코어 엔진 기술      | Core Engine Stack         | axis          | Cold Path 기능 엔진 6 (가변)                           |                                     |          |         | TDD-075 |                   |
| `Hub and Spoke`       | HubAndSpoke     | L1 제품 및 컴포넌트 | PROD   | Hub-and-Spoke | Hub-and-Spoke             | axis          | PT_3 허브 + PT_0~2·Nixie 샤드 배치                     |                                     |          |         | TDD-075 |                   |
| `PT0 Edge Cold`       | PT_0            | L0 플랫폼 표준    | PLAT   | 피지컬 티어 0      | PT0 Edge Cold             | physical-tier | 말단 COLD — Nano Sentinel · HEXAGON · ACTON Reflex |                                     |          | ML_0    | TDD-040 | HW: COLD          |
| `PT1 Micro Warm`      | PT_1            | L0 플랫폼 표준    | PLAT   | 피지컬 티어 1      |                           | physical-tier | WARM Micro Sentinel (선택) · Nixie ✗               |                                     |          |         | TDD-040 |                   |
| `PT2 Kinetic Warm`    | PT_2            | L0 플랫폼 표준    | PLAT   | 피지컬 티어 2      |                           | physical-tier | WARM Kinetic Controller (선택) · Fast Path         |                                     |          |         | TDD-040 |                   |
| `PT3 Zenith Hot`      | PT_3            | L0 플랫폼 표준    | PLAT   | 피지컬 티어 3      | Zenith                    | physical-tier | HOT 풀스택 웹 허브 · DIEA · Nexaon · Ontex             |                                     |          |         | TDD-040 |                   |
| `ML0 Reflexive Edge`  | ML_0            | L0 플랫폼 표준    | PLAT   |               | Reflexive · Edge          | menton-layer  | Sentinel · Fact·Reflex·후보고 uplink · ACTON        |                                     |          | PT_0    | TDD-040 | LangGraph Agent ✗ |
| `ML1 Presence`        | ML_1            | L0 플랫폼 표준    | PLAT   |               | Presence                  | menton-layer  | NIXIE · 4 Shell · 결과·알람·상태 Express               |                                     |          | NIXIE   | TDD-040 |                   |
| `ML2 Tactical Domain` | ML_2            | L0 플랫폼 표준    | PLAT   |               | Tactical · Domain         | menton-layer  | nexabo/nexia 작업면 — 관제·트윈·정재 UI                   |                                     |          |         | TDD-040 |                   |
| `ML3 Strategic`       | ML_3            | L0 플랫폼 표준    | PLAT   |               | Strategic                 | menton-layer  | Nexaon·agent-graph·Omnix — ingest→Run→promoted   |                                     |          | Nexaon  | TDD-073 | LangGraph Agent ✓ |

### Cosmic Layer · CSIM (CT_1~3)

| TAG                     | CODE   | TIER         | TC(약어) | LABEL_KO          | LABEL_EN                             | CATEGORY    | DEFINITION                                         | NOT                     | ARTIFACT | RELATED    | SSOT    | NOTES          |
| :---------------------- | :----- | :----------- | :----- | :---------------- | :----------------------------------- | :---------- | :------------------------------------------------- | :---------------------- | :------- | :--------- | :------ | :------------- |
| `Cosmic`                | Cosmic | L1 제품 및 컴포넌트 | PROD   | 코믹                | Cosmic Layer                         | cosmic-tier | WILL/FACT 의미 번역 축 · Tier CT_1~3                    |                         |          | CSIM       | TDD-043 |                |
| `CSIM`                  | CSIM   | L0 플랫폼 표준    | PLAT   | 우주 의미 매핑 엔진       | Cosmic Semantic Interface Mapping    | cosmic-tier | WILL/FACT 를 **[[SUM]]** 및 **[[APEX]]**로 매핑하는 지능형 엔진 |                         |          | SUM, APEX  | TDD-043 |                |
| `SUM`                   | SUM    | L0 플랫폼 표준    | PLAT   | **전역 의미 행렬**      | Semantic Universal Matrix            | cosmic-tier | **3×3 좌표 + 2-bit Sign** 기반의 지능 보편 척도               | 단순 산술 합산 ✗              |          | CSIM, APEX | TDD-043 | **거버넌스 마스터 키** |
| `CT1 Abstraction`       | CT_1   | L0 플랫폼 표준    | PLAT   | Abstraction       | Abstraction                          | cosmic-tier | WILL/FACT → Matrix 시스템 공용어                         |                         |          |            | TDD-043 |                |
| `CT2 Contextualization` | CT_2   | L0 플랫폼 표준    | PLAT   | Contextualization | Contextualization                    | cosmic-tier | Matrix+ 맥락 → 오해 없는 의미 토큰                            |                         |          |            | TDD-043 |                |
| `CT3 Concretization`    | CT_3   | L0 플랫폼 표준    | PLAT   | Concretization    | Concretization                       | cosmic-tier | 의미 → Narrative\                                    | Action · Run ✗ (Nexaon) |          |            |         | TDD-043        |
| `CSIM`                  | CSIM   | L0 플랫폼 표준    | PLAT   | 우주 의미 언어 번역기      | Cosmic Semantic Interface Matrix<br> | cosmic-tier | Cosmic Layer 구현 · WILL/FACT ↔ Matrix 번역            |                         |          | Cosmic     | TDD-043 |                |

### Axon Layer · Cosmic Language (AL_1~7)

| TAG                  | CODE | TIER         | TC(약어) | LABEL_KO      | LABEL_EN       | CATEGORY   | DEFINITION                       | NOT | ARTIFACT | RELATED   | SSOT    | NOTES         |
| :------------------- | :--- | :----------- | :----- | :------------ | :------------- | :--------- | :------------------------------- | :-- | :------- | :-------- | :------ | :------------ |
| `AXON`               | AXON | L0 플랫폼 표준    | PLAT   | 엑숀            | AXON           | axon-layer | Axon Layer 7 층 프로토콜 · AL_1…AL_7   |     |          |           | TDD-043 |               |
| `AL1 APEX`           | AL_1 | L0 플랫폼 표준    | PLAT   | **APEX 프로토콜** | APEX Protocol  | axon-layer | **[[SUM]]**을 적재하여 전송하는 표준 신경계 규격 |     |          | SUM, CSIM | TDD-043 | **SUM 결합 엔진** |
| `AL2 HEXAGON`        | AL_2 | L0 플랫폼 표준    | PLAT   | 헥사곤           | HEXAGON        | axon-layer | 5W1H 6 축 Envelope · Zod 문법        |     |          |           | TDD-043 |               |
| `AL3 Coil Balancer`  | AL_3 | L1 제품 및 컴포넌트 | PROD   | 코일 벨렌서        | Coil Balancer  | axon-layer | 페르소나 Zero-sum · GOVERN           |     |          |           | TDD-043 |               |
| `AL4 NEXAON Network` | AL_4 | L0 플랫폼 표준    | PLAT   | 넥사온 네트워크      | NEXAON Network | axon-layer | 엣지 후보고·중앙 해석                     |     |          | Nexaon    | TDD-043 |               |
| `AL5 NEXAVULT`       | AL_5 | L0 플랫폼 표준    | PLAT   | 넥사볼트          | NEXAVULT       | axon-layer | Seed·로그·벡터 이중 저장                 |     |          | Ontex     | TDD-043 |               |
| `AL6 ACTON`          | AL_6 | L0 플랫폼 표준    | PLAT   | 넥숀            | ACTON          | axon-layer | 물리 실행 Synapse · PWM · MQTT       |     |          |           | TDD-043 |               |
| `AL7 ENVIRON Shield` | AL_7 | L0 플랫폼 표준    | PLAT   | 환경 보호막        | ENVIRON Shield | axon-layer | 환경·복지 · Jitter 차단 · Nixie triage |     |          | NIXIE     | TDD-043 |               |

### nexia — DIEA · tabId
> **DIEA** = Distillation Intelligence Engine Array · `nexia` 7 Facet. 구 별칭 `7Tab`/`7탭` SSOT ✗. URL: `/nexia/{tabId}`.
> **핵심 흐름:** 인간의지 ↔ [CSIM] 번역 ↔ [APEX] 매트릭스 ↔ [AXON] 프로토콜 ↔ [DIEA] 정재 작업대 ↔ [NEXIA] 정재 ↔ **M2P** 출력 ↔ [Peripheral]

| TAG      | CODE   | TIER         | TC(약어) | LABEL_KO | LABEL_EN                               | CATEGORY | DEFINITION              | NOT                        | ARTIFACT         | RELATED      | SSOT    | NOTES    |
| :------- | :----- | :----------- | :----- | :------- | :------------------------------------- | :------- | :---------------------- | :------------------------- | :--------------- | :----------- | :------ | :------- |
| `Omnix`  | Omnix  | L1 제품 및 컴포넌트 | PROD   | 옴닉스      | Omnix                                  | tabId    | 소통·허브·오케스트레이션·승인 중계     |                            | .nxchat          | DIEA         | TDD-056 |          |
| `Normex` | Normex | L1 제품 및 컴포넌트 | PROD   | 노멕스      | Normex                                 | tabId    | Norm·정책·Tiptap 시방서      |                            | .nxpol           | DIEA         | TDD-056 |          |
| `Logex`  | Logex  | L1 제품 및 컴포넌트 | PROD   | 로젝스      | Logex                                  | tabId    | 추론·관계·React Flow 워크플로   |                            | .nxflow          | DIEA, Nexaon | TDD-056 |          |
| `Scribx` | Scribx | L1 제품 및 컴포넌트 | PROD   | 스크립스     | Scribx                                 | tabId    | 코드·명세·Monaco            |                            | .nxcode          | DIEA         | TDD-056 |          |
| `Vivex`  | Vivex  | L1 제품 및 컴포넌트 | PROD   | 비벡스      | Vivex                                  | tabId    | 미디어·ComfyUI             |                            | .nxmedia         | DIEA         | TDD-056 |          |
| `Twinex` | Twinex | L1 제품 및 컴포넌트 | PROD   | 트윈엑스     | Twinex                                 | tabId    | 디지털 트윈·3D·ESPHome       |                            | .nxproj .nxdev … | DIEA         | TDD-056 |          |
| `Navex`  | Navex  | L1 제품 및 컴포넌트 | PROD   | 네이벡스     | Navex                                  | tabId    | 플랫폼 전역 자산 탐색·검색·릴레이     |                            |                  | DIEA, NISE   | TDD-056 | 생성 확장자 ✗ |
| `DIEA`   | DIEA   | L0 플랫폼 표준    | PLAT   | 정재 작업대   | Distillation Intelligence Engine Array | tabId    | nexia 7 Facet 지능 엔진 어레이 | ≠ domainKey · ≠ Nexaon 동일시 |                  | Nexaon,APEX  | TDD-071 |          |

### Nexaon · 명칭 (혼동 방지)

> Nexaon ⊂ nexia · Logex ontology. DIEA 7 Facet 에 포함 ✗.

| TAG           | CODE        | TIER         | TC(약어) | LABEL_KO | LABEL_EN    | CATEGORY | DEFINITION                                      | NOT                                  | ARTIFACT                          | RELATED     | SSOT    | NOTES |
| :------------ | :---------- | :----------- | :----- | :------- | :---------- | :------- | :---------------------------------------------- | :----------------------------------- | :-------------------------------- | :---------- | :------ | :---- |
| `Nexaon`      | Nexaon      | L1 제품 및 컴포넌트 | PROD   | 넥사온      | Nexaon      | ui       | Logex ontology 서브모드 · ML_3 Distillation 오케스트레이터 | tabId ✗ · domainKey ✗ · DIEA Facet ✗ | /nexia/logex/ontology/{projectId} | DIEA, Logex | TDD-073 |       |
| `NexaonShell` | NexaonShell | L1 제품 및 컴포넌트 | PROD   | 넥사온쉘     | NexaonShell | ui       | ExplorerTree · GraphCanvas · RunPanel 3 분할       | MainShell ✗                          |                                   | Nexaon      | TDD-056 |       |
| `NEXIA`       | NEXIA       | L0 플랫폼 표준    | PLAT   | 닉시아      | NEXIA       | ui       | 제품·문서 도메인 라벨 (대문자)                              | nexia 코드키와 별도                        |                                   |             | TDD-010 |       |

### 확장 레이어 — CAT · PMS (7+4)

> 7 Core tabId + Ontex·Admin·CAT·PMS. UI 배치 미정.

| TAG   | CODE | TIER      | TC(약어) | LABEL_KO | LABEL_EN                      | CATEGORY | DEFINITION                                                 | NOT                     | ARTIFACT | RELATED | SSOT          | NOTES |
| :---- | :--- | :-------- | :----- | :------- | :---------------------------- | :------- | :--------------------------------------------------------- | :---------------------- | :------- | :------ | :------------ | :---- |
| `CAT` | CAT  | L0 플랫폼 표준 | PLAT   | 켓        | Contextual Awareness Timeline | ui       | nexia·MainShell 횡단 상황 인지 · LLM Read-only                   | Omnix 채팅 ✗ · tabId ✗    |          | PMS     | DEV UI-Driven |       |
| `PMS` | PMS  | L0 플랫폼 표준 | PLAT   | 피엠에스     | Project Management System     | ui       | WBS·Roadmap·Backlog·Asset Ledger·Validation Gate · 지능 공정관리 | erp · 외부 PM ✗ · tabId ✗ |          | CAT     | DEV UI-Driven |       |

### nexia — UI 셸 · 레이아웃

| TAG                       | CODE                   | TIER         | TC(약어) | LABEL_KO   | LABEL_EN                            | CATEGORY | DEFINITION                               | NOT                         | ARTIFACT | RELATED             | SSOT    | NOTES   |
| :------------------------ | :--------------------- | :----------- | :----- | :--------- | :---------------------------------- | :------- | :--------------------------------------- | :-------------------------- | :------- | :------------------ | :------ | :------ |
| `NexiaContent`            | NexiaContent           | L1 제품 및 컴포넌트 | PROD   | 넥시아 콘텐츠    | NexiaContent                        | ui       | nexia Content 슬롯 루트 (TabBar+Workspace)   |                             |          |                     | UIX-004 |         |
| `NexiaWorkspace`          | NexiaWorkspace         | L1 제품 및 컴포넌트 | PROD   | 넥시아 워크스페이스 | NexiaWorkspace                      | ui       | L1 2-pane · L2 split · L3 PiP            |                             |          |                     | UIX-004 |         |
| `NexiaTabBar`             | NexiaTabBar            | L1 제품 및 컴포넌트 | PROD   | 넥시아 텝바     | NexiaTabBar                         | ui       | 6 탭 스트립 (omnix 제외·레일)                    |                             |          |                     | UIX-004 |         |
| `tabId`                   | tabId                  | L3 내부 코드 변수  | INTVAR | 탭 ID       | tabId                               | ui       | nexia 탭 식별자                              |                             |          |                     | TDD-056 |         |
| `subPaneId`               | subPaneId              | L3 내부 코드 변수  | INTVAR | 서브패널 ID    | subPaneId                           | ui       | 탭 내 서브패널·다중 창 ID                         |                             |          |                     | UIX-004 |         |
| `panelId`                 | panelId                | L3 내부 코드 변수  | INTVAR | 패널 ID      | panelId                             | ui       | PiP·detach 대상 패널 ID                      |                             |          |                     | UIX-004 |         |
| `OmnixRail`               | OmnixRail              | L1 제품 및 컴포넌트 | PROD   | 옴닉스 레일     | OmnixRail                           | ui       | L1 좌측 Omnix 고정 레일                        |                             |          |                     | UIX-004 |         |
| `Global Navex`            | GlobalNavex            | L1 제품 및 컴포넌트 | PROD   | 글로벌 네이벡스   | Global Navex                        | ui       | Right Drawer 플랫폼 전역 탐색                   |                             |          | Navex               | UIX-002 |         |
| `GlobalFileExplorer`      | GlobalFileExplorer     | L1 제품 및 컴포넌트 | PROD   | 글로벌 탐색기    | GlobalFileExplorer                  | ui       | Navex 공통 파일·자산 탐색 엔진                     |                             |          |                     | UIX-002 |         |
| `Global Asset Index`      | GlobalAssetIndex       | L1 제품 및 컴포넌트 | PROD   | 글로벌 자산 인덱스 | Global Asset Index                  | ui       | 플랫폼 전역 files 통합 인덱스 뷰                    |                             |          | Navex               | PRD-014 |         |
| `InfraTree`               | InfraTree              | L1 제품 및 컴포넌트 | PROD   | 인프라 구조     | InfraTree                           | ui       | Navex Left origin→domain→device          |                             |          |                     | UIX-002 |         |
| `Infra Explorer`          | InfraExplorer          | L1 제품 및 컴포넌트 | PROD   | 인프라 구조     | Infra Explorer                      | ui       | Navex infra 모드 · navexExploreMode: infra |                             |          |                     | UIX-002 |         |
| `Intelligent Explorer`    | IntelligentExplorer    | L1 제품 및 컴포넌트 | PROD   | 인텔리전트 탐색기  | Intelligent Explorer                | ui       | NISE · 개인화 탐색                            |                             |          | NISE                | PRD-014 |         |
| `Navex Search Engine`     | NavexSearchEngine      | L1 제품 및 컴포넌트 | PROD   | 네이벡스 검색 엔진 | Navex Search Engine                 | ui       | hybrid retrieval · RRF · personal rerank |                             |          | NISE                | TDD-065 |         |
| `NISE`                    | NISE                   | L0 플랫폼 표준    | PLAT   | 니세 (검색엔진)   | Navex Intelligent Search Engine<br> | ui       | Navex 검색 엔진 공식 약칭                        | ≠ Omnix · ≠ Ontex Graph RAG |          | Navex-Search-Engine | PRD-014 |         |
| `Personalization Profile` | PersonalizationProfile | L1 제품 및 컴포넌트 | PROD   | 개인화 프로필    | Personalization Profile             | ui       | Taste·Trace·Focus·Negative ranking SSOT  |                             |          |                     | PRD-014 |         |
| `Left Drawer`             | LeftDrawer             | L1 제품 및 컴포넌트 | PROD   | 왼쪽 사이드바    | Left Drawer                         | ui       | MainShell 좌측 패널                          |                             |          |                     | UIX-004 |         |
| `Right Drawer`            | RightDrawer            | L1 제품 및 컴포넌트 | PROD   | 오를쪽 사이드바   | Right Drawer                        | ui       | MainShell 우측 패널                          |                             |          |                     | UIX-004 |         |
| `PiP`                     | PiP                    | L1 제품 및 컴포넌트 | PROD   | 피아이피       | Picture-in-Picture<br>              | ui       | 패널 분리·detach                             |                             |          |                     | UIX-004 |         |
| `UI-L0`                   | UI-L0                  | L0 플랫폼 표준    | PLAT   | 유아이 레벨 0   | UI-L0                               | ui       | MVP UI 구현 단계 (PRD-001)                   |                             |          |                     |         | UI-L 계열 |

### Omnix · 협업 · BAX · 3 층 UI

> NEXU(What) · BAX(How sit) · NIXIE(Express). 병합 ✗.
> **핵심 흐름:** 인간의지 ↔ [CSIM] 번역 ↔ [APEX] 매트릭스 ↔ [AXON] 프로토콜 ↔ [DIEA] 정재 작업대 ↔ [NEXIA] 정재 ↔ **M2P** 출력 ↔ [Peripheral] 주변기기

| TAG             | CODE          | TIER         | TC(약어) | LABEL_KO      | LABEL_EN                        | CATEGORY | DEFINITION                                             | NOT                     | ARTIFACT | RELATED    | SSOT    | NOTES |
| :-------------- | :------------ | :----------- | :----- | :------------ | :------------------------------ | :------- | :----------------------------------------------------- | :---------------------- | :------- | :--------- | :------ | :---- |
| `NIXIE`         | NIXIE         | L0 플랫폼 표준    | PLAT   | 닉시            | NIXIE                           | ui       | ML_1 Presence · Canvas·BAX·전 domainKey Express         | Canvas/BAX 대체 ✗ · Run ✗ |          | Nixie      | TDD-045 |       |
| `Nixie`         | Nixie         | L1 제품 및 컴포넌트 | PROD   | 닉시            | Nixie                           | ui       | NIXIE 제품·UI·4 Shell 채널 표기                              |                         |          | NIXIE      | TDD-061 |       |
| `M2P`           | M2P           | L0 플랫폼 표준    | PLAT   | 엠투피           | Matrix-to-Peripheral            | ui       | **실시간 의지 데이터를 NIXIE·Serial 용 구체적 명령어로 변환/전송하는 실행 프로토콜** | CSIM 는 통역사, M2P 는 실행근육    |          |            | UIX-003 |       |
| `NEXU Canvas`   | NEXUCanvas    | L1 제품 및 컴포넌트 | PROD   | 넥슈 켄버스        | NEXU Canvas                     | ui       | 온톨로지·Knowledge 페브릭 시맨틱 뷰                               | BAX 혼용 ✗                |          | BAX, NIXIE | TDD-045 |       |
| `VirtualCanvas` | VirtualCanvas | L1 제품 및 컴포넌트 | PROD   | 가상 켄버스        | VirtualCanvas                   | bax      | BAX 레이아웃 호스트 Grid+OVERLAY                              | NEXU Canvas ✗           |          | BAX        | UIX-003 |       |
| `BAX`           | BAX           | L0 플랫폼 표준    | PLAT   | 벡스            | Breathing AI Experience         | bax      | 미적 레이아웃 · void · Grid · 전 domainKey                    | NEXU Canvas 혼용 ✗        |          |            | UIX-003 |       |
| `MAE`           | MAE           | L0 플랫폼 표준    | PLAT   | 멤.에이.이        | Matrix Aesthetic Engine<br>     | bax      | **의미 데이터를 시각적 Grid 로 배치하는 BAX 실행 엔진 (ATS 참조)**          |                         |          |            | UIX-003 |       |
| `ATS`           | ATS           | L0 플랫폼 표준    | PLAT   | 에이.티.에스       | Aesthetic Tuning Settings<br>AT | bax      | **ASR·Depth 등 미적 파라미터를 저장하고 MAE 에 전달하는 영속화 모듈**         |                         |          |            | UIX-003 |       |
| `ASR`           | ASR           | L0 플랫폼 표준    | PLAT   | 에이.에스.알       | Aesthetic Space Ratio<br>A      | bax      | **인터페이스의 여백 하한선 (void_ratio) 을 규정하는 핵심 지표**              |                         |          |            | UIX-003 |       |
| `LayoutPolicy`  | LayoutPolicy  | L1 제품 및 컴포넌트 | PROD   | LayoutPolicy  | 레이아웃 폴리씨                        | bax      | BAX BLOCK 배치 정책                                        |                         |          |            | UIX-003 |       |
| `RuleGuard`     | RuleGuard     | L1 제품 및 컴포넌트 | PROD   | RuleGuard     | 룰 그리드                           | bax      | 규칙 가드 · AlarmState                                     |                         |          |            | UIX-003 |       |
| `NEXNAP`        | NEXNAP        | L0 플랫폼 표준    | PLAT   | NEXNAP        | 넥스넵                             | ui       | 시스템 인터페이스·Envelope 규약                                  |                         |          |            | TDD-010 |       |
| `Envelope`      | Envelope      | L1 제품 및 컴포넌트 | PROD   | Envelope      | 봉투                              | ui       | 탭·actor·payload 표준 메시지 래퍼                              |                         |          |            | TDD-010 |       |
| `approval gate` | approval_gate | L2 시스템 ID    | SYSID  | approval-gate | 승인 게이트                          | ui       | 승인 A/B/C 게이트                                           |                         |          |            | TDD-008 |       |
| `GOVERN`        | GOVERN        | L0 플랫폼 표준    | PLAT   | GOVERN        | 거버넌스                            | ui       | 룰·프롬프트 거버넌스                                            |                         |          |            | TDD-043 |       |
| `ASK`           | ASK           | L0 플랫폼 표준    | PLAT   | ASK           | 요청/유보                           | ui       | **HEXAGON 내 결측 정보 보완을 위한 의도 (Intent) 토큰**               |                         |          | VOID       |         |       |
| `VOID`          | VOID          | L0 플랫폼 표준    | PLAT   | VOID          | 중립/공백                           | ui       | 결정이 내려지지 않은 데이터의 잠재적 상태                                |                         |          | ASK        |         |       |
| `VOID BOX`      | VOID_BOX      | L0 플랫폼 표준    | PLAT   | VOID-BOX      | 보이드 박스                          | ui       | **결정 유보 (DEFERRED) 데이터를 담는 BAX 그리드 내 논리적 컨테이너**         |                         |          |            | PRD-003 |       |
| `DEFERRED`      | DEFERRED      | L0 플랫폼 표준    | PLAT   | DEFERRED      | 연기/보류                           | ui       | 연기된 결정 상태                                              |                         |          |            | PRD-003 |       |

### NIXIE — 4 Shell 채널

| TAG                  | CODE | TIER         | TC(약어) | LABEL_KO | LABEL_EN             | FULLNAME | CATEGORY | DEFINITION                       | NOT | ARTIFACT | RELATED | SSOT    | NOTES |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `NixieWebShell`      | NixieWebShell        | L1 제품 및 컴포넌트 | PROD   | 닉시 웹쉘    | Nixie Web Shell      |          | ui       | MainShell frame ML_1 · PiP detach |     |          |         | TDD-061 |       |
| `NixieDesktopShell`  | NixieDesktopShell    | L1 제품 및 컴포넌트 | PROD   | 닉스 데스크탑쉘 | Nixie Desktop Shell  |          | ui       | Python PC 독립 · WS/SSE · M2P      |     |          |         | TDD-062 |       |
| `NixieMobileShell`   | NixieMobileShell     | L1 제품 및 컴포넌트 | PROD   | 닉스 모바일쉘  | Nixie Mobile Shell   |          | ui       | iOS/Android · 푸시·VAD             |     |          |         | TDD-063 |       |
| `NixiePhysicalShell` | NixiePhysicalShell   | L1 제품 및 컴포넌트 | PROD   | 닉시 실물쉘   | Nixie Physical Shell |          | ui       | ESP32/RPi 하드웨어 · M2P·Serial      |     |          |         | TDD-064 |       |

### 데이터 · 파일 · Identity

| TAG                   | CODE                | TIER        | TC(약어) | LABEL_KO        | LABEL_EN            | CATEGORY | DEFINITION               | NOT | ARTIFACT | RELATED | SSOT    | NOTES |
| :-------------------- | :------------------ | :---------- | :----- | :-------------- | :------------------ | :------- | :----------------------- | :-- | :------- | :------ | :------ | :---- |
| `files`               | files               | L2 시스템 ID   | SYSID  | 파일              | files               | data     | 업로드 파일 DB 테이블            |     |          |         | TDD-010 |       |
| `file_references`     | file_references     | L2 시스템 ID   | SYSID  | 파일 참조           | file_references     | data     | 도메인·프로젝트별 파일 참조          |     |          |         | TDD-010 |       |
| `asset origin`        | asset_origin        | L2 시스템 ID   | SYSID  | 출처 축            | asset-origin        | data     | Navex 출처 facet           |     |          |         | PRD-014 |       |
| `navexCategory`       | navexCategory       | L3 내부 코드 변수 | INTVAR | 종류 facet        | navexCategory       | data     | Navex 종류 facet           |     |          |         | TDD-065 |       |
| `file_embeddings`     | file_embeddings     | L2 시스템 ID   | SYSID  | 파일 벡터 인덱스       | file_embeddings     | data     | 파일 벡터 인덱스                |     |          |         | TDD-010 |       |
| `source_metadata`     | source_metadata     | L2 시스템 ID   | SYSID  | 추출 메타           | source_metadata     | data     | AI 추출 메타 (PRD-013)       |     |          |         | PRD-013 |       |
| `nexa docs`           | nexa_docs           | L2 시스템 ID   | SYSID  | 문서 폴더 노드        | nexa-docs           | data     | 문서 폴더 노드 ID (PRD-008)    |     |          |         | PRD-008 |       |
| `identity_id`         | identity_id         | L2 시스템 ID   | SYSID  | identity ID     | identity_id         | data     | Knowledge OS identity ID |     |          |         | TDD-045 |       |
| `nexa_identities`     | nexa_identities     | L2 시스템 ID   | SYSID  | Identity 테이블    | nexa_identities     | data     | Identity 테이블             |     |          |         | TDD-045 |       |
| `anchor_id`           | anchor_id           | L2 시스템 ID   | SYSID  | 자산 논리 고정 주소     | anchor_id           | data     | 자산 논리 고정 주소              |     |          |         | TDD-045 |       |
| `graph_id`            | graph_id            | L2 시스템 ID   | SYSID  | 그래프 ID          | graph_id            | data     | Nexaon·Run 그래프 ID        |     |          |         | TDD-008 |       |
| `run_id`              | run_id              | L2 시스템 ID   | SYSID  | 실행 ID           | run_id              | data     | LangGraph 실행 ID          |     |          |         | TDD-008 |       |
| `project_yjs_updates` | project_yjs_updates | L2 시스템 ID   | SYSID  | Yjs 스냅샷 persist | project_yjs_updates | data     | Yjs 스냅샷 persist          |     |          |         | TDD-038 |       |
| `yjs_state`           | yjs_state           | L2 시스템 ID   | SYSID  | Yjs 바이너리 상태     | yjs_state           | data     | Yjs 바이너리 상태              |     |          |         | TDD-038 |       |
| `Knowledge OS`        | KNOWLEDGE_OS        | L0 플랫폼 표준   | PLAT   | Knowledge OS    | Knowledge OS        | data     | 용어·벡터·감사 체계              |     |          |         | TDD-045 |       |

### IoT · 제품 모듈

| TAG               | CODE            | TIER         | TC(약어) | LABEL_KO   | LABEL_EN        | CATEGORY | DEFINITION                                 | NOT | ARTIFACT | RELATED | SSOT    | NOTES |
| :---------------- | :-------------- | :----------- | :----- | :--------- | :-------------- | :------- | :----------------------------------------- | :-- | :------- | :------ | :------ | :---- |
| `NEXA CELL`       | NEXA_CELL       | L0 플랫폼 표준    | PLAT   | 넥사 세일      | NEXA-CELL       | iot      | ESPHome YAML·웹 펌웨어 제품                      |     |          |         | TDD-024 |       |
| `Physical AI`     | PHYSICAL_AI     | L0 플랫폼 표준    | PLAT   | 피지컬 AI     | Physical AI     | iot      | 물리 +AI 융합 (BRD)                             |     |          |         | BRD-001 |       |
| `Physical AI Ops` | PHYSICAL_AI_OPS | L0 플랫폼 표준    | PLAT   | 피키컬 AI Ops | Physical AI Ops | iot      | 산업 운영 포지셔닝                                 |     |          |         | BRD-001 |       |
| `digital twin`    | digital_twin    | L2 시스템 ID    | SYSID  | 디지털 트윈     | digital twin    | iot      | Twinex 도메인 개념                              |     |          | Twinex  | TDD-056 |       |
| `edge`            | edge            | L2 시스템 ID    | SYSID  | 엣지         | edge            | iot      | 엣지 디바이스·큐                                  |     |          |         | TDD-068 |       |
| `edge device`     | edge_device     | L2 시스템 ID    | SYSID  | 엣지 디바이스    | edge-device     | iot      | 엣지 디바이스                                    |     |          |         | TDD-068 |       |
| `Lambda`          | Lambda          | L1 제품 및 컴포넌트 | PROD   | 람다         | Lambda          | iot      | NEXA-CELL 보드 라인 (개발보드)                     |     |          |         | TDD-024 |       |
| `Kineton`         | Kineton         | L1 제품 및 컴포넌트 | PROD   | 키네톤        | Kineton         | iot      | Physical Bridge · ACTON · ROS 2 번역,물리 실행엔진 |     |          |         | TDD-072 |       |

### Generators · 미디어

| TAG          | CODE | TIER         | TC(약어) | LABEL_KO | LABEL_EN   | FULLNAME | CATEGORY | DEFINITION    | NOT | ARTIFACT | RELATED | SSOT    | NOTES |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Generators` | Generators        | L1 제품 및 컴포넌트 | PROD   | 제너레이터    | Generators |          | iot      | AI 생성기 TDD 묶음 |     |          |         | TDD-031 |       |
| `AIVIDEO`    | AIVIDEO           | L0 플랫폼 표준    | PLAT   | 비디오 생성기  | AIVIDEO    |          | iot      | AI 비디오 생성기    |     |          |         | TDD-031 |       |
| `AI3D`       | AI3D              | L0 플랫폼 표준    | PLAT   | 3D 생성기   | AI3D       |          | iot      | AI 3D 생성기     |     |          |         | TDD-031 |       |
| `AICIRCUIT`  | AICIRCUIT         | L0 플랫폼 표준    | PLAT   | 회로 생성기   | AICIRCUIT  |          | iot      | AI 회로 생성기     |     |          |         | TDD-031 |       |
| `AISOUND`    | AISOUND           | L0 플랫폼 표준    | PLAT   | 솔 생성기    | AISOUND    |          | iot      | AI 사운드 생성기    |     |          |         | TDD-031 |       |

### 기타 · 레거시

| TAG                | CODE             | TIER         | TC(약어) | LABEL_KO         | LABEL_EN         | CATEGORY | DEFINITION       | NOT              | ARTIFACT | RELATED        | SSOT    | NOTES      |
| :----------------- | :--------------- | :----------- | :----- | :--------------- | :--------------- | :------- | :--------------- | :--------------- | :------- | :------------- | :------ | :--------- |
| `Cockpit`          | Cockpit          | L1 제품 및 컴포넌트 | PROD   | Cockpit          | Cockpit          | legacy   | 구 UI 라벨          | 신규 금지            |          | Omnix          |         | → Omnix    |
| `NexiaSplitLayout` | NexiaSplitLayout | L1 제품 및 컴포넌트 | PROD   | NexiaSplitLayout | NexiaSplitLayout | legacy   | 구 MVP 분할         |                  |          | NexiaWorkspace |         | deprecated |
| `Nexion`           | Nexion           | L1 제품 및 컴포넌트 | PROD   | Nexion           | Nexion           | legacy   | UI 브랜드명          | domainKey 는 ontex |          |                | TDD-057 |            |
| `Nexus Map`        | NexusMap         | L1 제품 및 컴포넌트 | PROD   | Nexus-Map        | Nexus-Map        | legacy   | 레거시 AI 지식 맵      |                  |          |                |         | deprecated |
| `U2BEE`            | U2BEE            | L0 플랫폼 표준    | PLAT   | U2BEE            | U2BEE            | legacy   | 데스크톱 앱 (PRD-002) |                  |          |                | PRD-002 |            |
| `v0`               | v0               | L2 시스템 ID    | SYSID  | v0               | v0               | legacy   | v0 프롬프트·프로토타입    |                  |          |                | UIX-005 |            |
| `nexia shell`      | nexia_shell      | L2 시스템 ID    | SYSID  | nexia-shell      | nexia-shell      | legacy   | v0 프로토타입 셸       |                  |          |                | UIX-005 |            |

### `.nx`* 산출물 확장자

> Navex: 생성 확장자 ✗ — 전 domainKey 인덱싱.

| TAG | CODE | TIER | LABEL_KO | ARTIFACT |
| :--- | :--- | :--- | :--- | :--- |
| `Omnix Chat` | `nx_chat` | L2 시스템 ID | 채팅·세션 | `.nxchat` |
| `Normex Policy` | `nx_pol` | L2 시스템 ID | 규범·정책 | `.nxpol` |
| `Logex Workflow` | `nx_flow` | L2 시스템 ID | 워크플로·그래프 | `.nxflow` |
| `Scribx Script` | `nx_code` | L2 시스템 ID | 코드·스크립트 | `.nxcode` |
| `Vivex Media` | `nx_media` | L2 시스템 ID | 미디어 메타 | `.nxmedia` |
| `Twinex Project` | `nx_proj` | L2 시스템 ID | 프로젝트 루트 | `.nxproj` |
| `Twinex Group` | `nx_grp` | L2 시스템 ID | 그룹·토폴로지 | `.nxgrp` |
| `Twinex Device` | `nx_dev` | L2 시스템 ID | 디바이스 바인딩 | `.nxdev` |
| `Twinex Diag` | `nx_diag` | L2 시스템 ID | 진단·시뮬 | `.nxdiag` |

## 관련 문서

| RELATION       | DOCUMENT                                                                                                                           |
| :--- | :--- |
| 범용 용어          | [용어집범용v2.0.md](용어집_범용_v2.0.md) (TDD-069)                                                                                           |
| 문서 생태계         | [개발문서 생태계와 관리 체계](개발문서 생태계와 관리 체계.md)                                                                                              |
| doc_id         | [doc*id*레지스트리](doc_id_레지스트리.md)                                                                                                    |
| 도메인            | [TDD-071](08_TDD/NEXAOS/08_TDD_NEXAOS_도메인구조통합_v1.0.md)                                                                             |
| Physical · Hub | [TDD-040](08_TDD/AI/08_TDD_AI_지능위계및하드웨어사양.md) · [TDD-075](08_TDD/NEXAOS/08_TDD_NEXAOS_전역아키텍처표준_GlobalArchitectureStandard_v1.0.md) |
| Cosmic · Axon  | [TDD-043](../08_TDD/Cosmic/08_TDD_AXON-CSIM-SUM-APEX우주언어및유기적구조체통합설계표준.md) · [TDD-044](08_TDD/Cosmic/08_TDD_CosmicLanguage_전역데이터아키텍처.md)                  |
| nexia 스택       | [TDD-010](08_TDD/NEXIA/08_TDD_NEXIA_구조기술스택운영방침.md)                                                                                 |
| nexia UI       | [UIX-004](07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md)                                                                            |
| BAX            | [UIX-003](07_UIUX/07_UIUX_BAX_미학적인터페이스UX아키텍처_v1.0.md)                                                                              |
| Nixie          | [TDD-061~064](08_TDD/NEXIA/Nixie/)                                                                                                 |
