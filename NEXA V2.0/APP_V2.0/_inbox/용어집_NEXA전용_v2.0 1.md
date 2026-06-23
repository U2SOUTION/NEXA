---
implements_doc: 
doc_id: TDD-070
title: NEXA V2.0 전용 용어집
category: 08_TDD
domain: NEXAOS
status: draft
created: 2026-06-12
updated: 2026-06-22
parent_doc: TDD-001
see_also: [TDD-040, TDD-043, TDD-044, TDD-069, TDD-071, TDD-075, TDD-010, TDD-045, TDD-056, TDD-065, TDD-061, TDD-062, TDD-063, TDD-064, TDD-074, UIX-004, PRD-014]
terms_standard: []
terms_nexa: [glossary, terms_nexa, domainKey, tabId, DIEA, Nexaon, NIXIE, Navex, NISE, ML0, ML1, ML2, ML3, Menton, Menton-Layer, ML, Physical-Tier, Physical-Centric-Hierarchy, Core-Engine-Stack, Hub-and-Spoke, Cosmic-Layer, AXON, AXON-Stack-Layer, CSIM, APEX, HEXAGON, ACTON, NEXAVULT, ENVIRON-Shield, Galthon, Kineton, CAT, PMS, Contextual-Awareness-Timeline, Project-Management-System]
tags: [doc/cat/08-tdd, doc/domain/nexaos, nexa/glossary, nexa/terms_nexa, nexa/domainKey, nexa/tabId, nexa/DIEA, nexa/CAT, nexa/PMS]
---

# NEXA V2.0 전용 용어집

> **역할:** NEXA 플랫폼·제품·코드 전용 `terms_nexa` **사람이 읽는 SSOT**.  
> **짝 문서:** [용어집_범용_v2.0.md](용어집_범용_v2.0.md) (TDD-069) · **충돌 시:** nexia DIEA·`tabId` → **TDD-056** · Distillation·플랫폼 → **TDD-071**.

---

## 1. 사용 규칙

| scope | frontmatter_key | tag_prefix | ssot |
| :--- | :--- | :--- | :--- |
| 범용 기술 스택 | `terms_standard` | `std/` | [용어집_범용_v2.0.md](용어집_범용_v2.0.md) |
| NEXA 전용 | `terms_nexa` | `nexa/` | **본 문서** |

- 태그·배열 값은 **kebab-case**.
- **신규 전용 용어**는 본 용어집에 먼저 정의한 뒤 문서 `terms_nexa` 에 추가.
- **구 UI 라벨**(Cockpit, Ethos 등)은 **부록 A** — 신규 문서·코드 **금지**.


### NEX* 계열 용어 표기 규범 (Categorization)

> **원칙:** 표기법은 해당 데이터의 시스템 내 위계를 결정한다.

| 구분             | 분류           | 대상                 | 규칙                                |
| :------------- | :----------- | :----------------- | :-------------------------------- |
| **FULL UPPER** | **플랫폼 표준**   | 브랜드, 프로토콜, 전사 규약   | **FULL UPPER** (예: NEXA, NEXNAP)  |
| **Title Case** | **소프트웨어 제품** | 데이터 단위, UI 모듈, 제품명 | **Title Case** (예: Nexel, Nexaon) |
| **lower case** | **시스템 코드**   | 도메인 식별자, 런타임 키     | **lower case** (예: nexia, nexet)  |

## 2. 표 스키마 (Normative)

**모든 `terms_nexa` 용어 행**은 아래 **12열**을 사용한다. 해당 없으면 **빈 칸**.

| COLUMN         | MEANING                                                                                                                                         |
| :------------- | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| **tag**        | `terms_nexa` · `nexa/` 태그                                                                                                                       |
| **code**       | `domainKey` · `tabId` · `PT-0` 등 런타임 코드                                                                                                         |
| **label_ko**   | 기획·UI 한글 짧은 이름, 약어는 소리나는데 발음                                                                                                                    |
| **label_en**   | 영문 짧은 표기                                                                                                                                        |
| **fullname**   | 풀네임·약어 풀어쓰기                                                                                                                                     |
| **category**   | `platform` · `domainKey` · `tabId` · `physical-tier` · `menton-layer` · `cosmic-tier` · `axon-layer` · `ui` · `data` · `iot` · `bax` · `legacy` |
| **definition** | Normative 한 줄 정의                                                                                                                                |
| **not**        | 금지·혼동                                                                                                                                           |
| **artifact**   | 산출물·URL·확장자                                                                                                                                     |
| **related**    | 연관 tag                                                                                                                                          |
| **ssot**       | doc_id 또는 링크                                                                                                                                    |
| **notes**      | 별칭·deprecated·보조                                                                                                                                |

| TAG | CODE | LABEL_KO | LABEL_EN | FULLNAME | CATEGORY | DEFINITION | NOT | ARTIFACT | RELATED | SSOT | NOTES |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |

**메타·집계 표**(§1 · §6 · 부록 B)만 예외.

---

## 3. 개요 — 세 축 (서사)

NEXA OS는 **유기적 지능 생태계**이다.

1. **피지컬 티어** — **어디서** 연산하나 (PT-0~3)
2. **Menton Layer (ML0~ML3)** — **얼마나 깊게** 사고하나
3. **Axon Layer (AL1~AL7)** — **어떤 규격**으로 신호·의미·실행을 포장하나

---

### NEX* 계열 용어 체계 분류표 (별도로 유지 할것 )

| 구분        | 용어 (예시)            | 의미적 카테고리   | 아키텍처적 역할                          |
| :-------- | :----------------- | :--------- | :-------------------------------- |
| 표준, 프로토콜  | **NEXA**           | 최상위 브랜드    | 플랫폼 전체를 아우르는 상징적 위계               |
|           | **NEXAOS**         | 시스템 전체 명칭  | 미션크리티컬 설계 계층의 총칭                  |
|           | **NEXNAP**         | 전사 통신 규약   | 시스템 간 데이터 봉투(Envelope) 규약         |
|           | **NEXAON-NETWORK** | 전송 프로토콜    | 엣지-중앙 간 데이터 전송 채널 (AL4)           |
|           | **NEXAVULT**       | 보안 저장소     | Seed 및 벡터 데이터 저장 프로토콜 (AL5)       |
|           | **NEXA-CELL**      | 하드웨어 제품    | 물리적 센서 및 모듈 제품군                   |
| 컴포넌트, 클래스 | **Nexel**          | 데이터 원자     | 시스템의 최소 정보 단위 (Atomic Unit)       |
|           | **Nexaon**         | 제품/오케스트레이터 | 지능형 전략 실행 소프트웨어                   |
|           | **NexaonShell**    | 전용 UI      | 3분할(Explorer/Canvas/Run) 전용 인터페이스 |
|           | **NexiaContent**   | UI 프레임     | 탭바와 워크스페이스를 포함하는 루트 슬롯            |
|           | **NexiaWorkspace** | 작업 영역      | 다중 패널 배치를 지원하는 레이아웃 모듈            |
|           | **NEXU Canvas**    | 시각화 도구     | 온톨로지 및 지식 페브릭 시맨틱 뷰어              |
| 도메인키, url | **nexia**          | 도메인 식별자    | 지능 셸 및 DIEA 호스팅용 `domainKey`      |
|           | **nexabo**         | 도메인 식별자    | IoT 관제 및 텔레메트리용 `domainKey`       |
|           | **nexet**          | 도메인 식별자    | 자산 유통 및 마켓플레이스용 `domainKey`       |
> **개발 가이드**
  **대문자**를 보면 아키텍트는 `Protocol`이나 `Standard`를 떠올려야 합니다.
. **Title Case**를 보면 UI 개발자는 `Component`나 `Class`를 떠올려야 합니다.
  **소문자**를 보면 개발자는 `url`이나 `db_key`를 떠올려야 합니다.



## 4. NEXA V2.0 전용 용어 (`terms_nexa`)

### 4.1 플랫폼 · OS

| TAG                    | CODE             | LABEL_KO    | LABEL_EN             | FULLNAME                                        | CATEGORY | DEFINITION                                                | NOT                              | ARTIFACT | RELATED | SSOT    | NOTES               |
| :--------------------- | :--------------- | :---------- | :------------------- | :---------------------------------------------- | :------- | :-------------------------------------------------------- | :------------------------------- | :------- | :------ | :------ | :------------------ |
| `NEXA`                 |                  | 넥사          | NEXA                 |                                                 | platform | 사업·플랫폼 전체 브랜드                                             |                                  |          |         | BRD-001 |                     |
| `NEXAOS`               |                  | 넥사 OS       | NEXA OS              |                                                 | platform | OS·셸·도메인·미션크리티컬 설계층                                       |                                  |          |         | TDD-001 |                     |
| `domainKey`            | domainKey        | 도메인 키       | domainKey            |                                                 | platform | Header 전역 메뉴 도메인 식별자 (`nexia`, `erp` …)                   |                                  |          |         | TDD-071 |                     |
| `subRoute`             | subRoute         | 서브 라우트      | subRoute             |                                                 | platform | 단일 `domainKey` 내 content 분기 (`erp/parts`)                 |                                  |          |         | TDD-071 |                     |
| `MainShell`            |                  | 메인 쉘        | MainShell            |                                                 | platform | 4 영역 + StatusBar 플랫폼 셸                                    |                                  |          |         | UIX-004 | 구 UIX-006 → UIX-004 |
| `domainLayoutRegistry` |                  | 도메인 레이아웃 레지 | domainLayoutRegistry |                                                 | platform | domainKey→슬롯 lazy import 레지스트리                            |                                  |          |         | TDD-071 |                     |
| `useLayoutStore`       |                  | 유즈레이아웃 스토어  | useLayoutStore       |                                                 | platform | 드로어·상태바 Zustand SSOT                                      |                                  |          |         | UIX-004 |                     |
| `drawerDefaults`       |                  | 드로어 디폴트     | drawerDefaults       |                                                 | platform | 도메인별 L/R 드로어 open 정책                                      |                                  |          |         | TDD-071 |                     |
| `SystemStatusBar`      |                  | 시스템 상태바     | SystemStatusBar      |                                                 | platform | 하단 1 줄 + 확장 상태 패널 · CAT 후보 거점 (미정)                        |                                  |          |         | UIX-004 |                     |
| `AppHeader`            |                  | 앱 헤더        | AppHeader            |                                                 | platform | 상단 전역 헤더                                                  |                                  |          |         | UIX-004 |                     |
| `themePreset`          |                  | 테마 프리셋      | themePreset          |                                                 | platform | 도메인 테마 (`office-light` 등)                                 |                                  |          |         | TDD-071 |                     |
| `packages-shared`      | packages/shared  | 모노레포 공유폴더   | packages/shared      |                                                 | platform | Zod·commands 공유 패키지                                       |                                  |          |         | TDD-007 |                     |
| `agent-graph`          | apps/agent-graph | 에이전트 그래프    | agent-graph          |                                                 | platform | LLM·Embed·LangGraph 실행 앱                                  |                                  |          |         | TDD-003 |                     |
| `GraphCanvas`          |                  | 그래픽 켄버스     | GraphCanvas          |                                                 | platform | React Flow 워크플로 UI · Yjs `.nxflow`                        |                                  |          | Nexaon  | TDD-007 |                     |
| `apps-sync`            | apps/sync        | 앱스/싱크       | apps/sync            |                                                 | platform | Hocuspocus Yjs 서버                                         |                                  |          |         | TDD-038 |                     |
| `embedder`             |                  | 임베더         | embedder             |                                                 | platform | in-process 임베딩 (`/v1/embed`)                              |                                  |          |         | TDD-003 |                     |
| `M.O.S.E.S.`           |                  | 모세          | M.O.S.E.S.           | Mission-Operational Safety Engineering Standard | platform | 미션크리티컬 설계 원칙 약어                                           |                                  |          |         | TDD-001 |                     |
| `Galthon`              |                  | 갈톤          | Galthon              |                                                 | platform | NEXA 전체 신뢰성 담보 독립 감시 주체 — Why-Chain·trace 횡단 관측 · 흐름 개입 ✗ | ≠ NEXA · ≠ Menton · ≠ Nexaon Run |          |         | TDD-074 | 6대 핵심 축 ✗           |

### 4.2 domainKey (제품·업무 영역)

> 상세 맵: [TDD-071](08_TDD/NEXAOS/08_TDD_NEXAOS_도메인구조통합_v1.0.md).

| tag       | code    | label_ko | label_en | fullname | category  | definition                            | not                        | artifact | related      | ssot    | notes |
| :-------- | :------ | :------- | :------- | :------- | :-------- | :------------------------------------ | :------------------------- | :------- | :----------- | :------ | :---- |
| `nexia`   | nexia   | 넥시아      | nexia    |          | domainKey | 플랫폼 핵심 지능 셸 · DIEA 호스트 · Distillation | NEXAON 프로젝트명 · NEXIA 표기 혼동 |          | DIEA, Nexaon | TDD-071 |       |
| `ontex`   | ontex   | 온텍스      | Ontex    |          | domainKey | 온톨로지·Graph RAG·pgvector (구 nexion 흡수) |                            |          |              | TDD-071 |       |
| `erp`     | erp     | 이알피      | erp      |          | domainKey | ERP 메인 (구 erp-parts 통합)               |                            |          |              | TDD-071 |       |
| `nexabo`  | nexabo  | 넥사보      | nexabo   |          | domainKey | IoT 관제·텔레메트리 (구 nexage)               |                            |          |              | TDD-071 |       |
| `nexet`   | nexet   | 넥셋       | nexet    |          | domainKey | SW/HW 마켓 유통                           |                            |          |              | TDD-071 |       |
| `infra`   | infra   | 인프라      | infra    |          | domainKey | 장치 등록·my-devices                      |                            |          |              | TDD-071 |       |
| `network` | network | 네트워크     | network  |          | domainKey | WiFi·CAN·MQTT 토폴로지                    |                            |          |              | TDD-071 |       |
| `admin`   | admin   | 어드       | admin    |          | domainKey | 슈퍼 관리 (구 nexa-admin)                  |                            |          |              | TDD-071 |       |

### 4.3 아키텍처 축 — Physical · Menton · Engine

> **한 줄:** PT = 배치 · ML = 논리 계층 · Core Engine = 기능. SSOT: [TDD-040](08_TDD/AI/08_TDD_AI_지능위계및하드웨어사양.md) · [TDD-075 Hub-and-Spoke](08_TDD/NEXAOS/08_TDD_NEXAOS_전역아키텍처표준_GlobalArchitectureStandard_v1.0.md).

| TAG                 | CODE | LABEL_KO      | LABEL_EN                  | FULLNAME                | CATEGORY      | DEFINITION                                       | NOT                                 | ARTIFACT | RELATED | SSOT    | NOTES             |
| :------------------ | :--- | :------------ | :------------------------ | :---------------------- | :------------ | :----------------------------------------------- | :---------------------------------- | :------- | :------ | :------ | :---------------- |
| `Physical-Tier`     | PT   | 피지컬 티어        | Physical Placement Tier   | Physical Placement Tier | axis          | 어디서 연산하나 — 4단 PT-0~3                             |                                     |          |         | TDD-040 |                   |
| `Menton-Layer`      | ML   | 멘톤 레이어        | Menton Intelligence Stack |                         | axis          | 소프트웨어상 역할 층 ML0~ML3                              | ≠ NEXA 브랜드 · ≠ NL0–NL3 (deprecated) |          |         | TDD-040 |                   |
| `Core-Engine-Stack` |      | 코어 엔진 기술      | Core Engine Stack         |                         | axis          | Cold Path 기능 엔진 6 (가변)                           |                                     |          |         | TDD-075 |                   |
| `Hub-and-Spoke`     |      | Hub-and-Spoke | Hub-and-Spoke             |                         | axis          | PT-3 허브 + PT-0~2·Nixie 샤드 배치                     |                                     |          |         | TDD-075 |                   |
| `PT-0`              | PT-0 | 피지컬 티어 0      | PT-0                      |                         | physical-tier | 말단 COLD — Nano Sentinel · HEXAGON · ACTON Reflex |                                     |          | ML0     | TDD-040 | HW: COLD          |
| `PT-1`              | PT-1 | 피지컬 티어 1      |                           |                         | physical-tier | WARM Micro Sentinel (선택) · Nixie ✗               |                                     |          |         | TDD-040 |                   |
| `PT-2`              | PT-2 | 피지컬 티어 2      |                           |                         | physical-tier | WARM Kinetic Controller (선택) · Fast Path         |                                     |          |         | TDD-040 |                   |
| `PT-3`              | PT-3 | 피지컬 티어 3      | Zenith                    |                         | physical-tier | HOT 풀스택 웹 허브 · DIEA · Nexaon · Ontex             |                                     |          |         | TDD-040 |                   |
| `ML0`               | ML0  |               | Reflexive · Edge          |                         | menton-layer  | Sentinel · Fact·Reflex·후보고 uplink · ACTON        |                                     |          | PT-0    | TDD-040 | LangGraph Agent ✗ |
| `ML1`               | ML1  |               | Presence                  |                         | menton-layer  | NIXIE · 4 Shell · 결과·알람·상태 Express               |                                     |          | NIXIE   | TDD-040 |                   |
| `ML2`               | ML2  |               | Tactical · Domain         |                         | menton-layer  | nexabo/nexia 작업면 — 관제·트윈·정재 UI                   |                                     |          |         | TDD-040 |                   |
| `ML3`               | ML3  |               | Strategic                 |                         | menton-layer  | Nexaon·agent-graph·Omnix — ingest→Run→promoted   |                                     |          | Nexaon  | TDD-073 | LangGraph Agent ✓ |

### 4.4 Cosmic Layer · CSIM (T1–T3)

| TAG      | CODE | LABEL_KO          | LABEL_EN          | FULLNAME                         | CATEGORY    | DEFINITION                              | NOT | ARTIFACT | RELATED | SSOT    | NOTES |
| :------- | :--- | :---------------- | :---------------- | :------------------------------- | :---------- | :-------------------------------------- | :-- | :------- | :------ | :------ | :---- |
| `Cosmic` |      | 코믹                | Cosmic Layer      |                                  | cosmic-tier | WILL/FACT 의미 번역 축 · Tier T1–T3          |     |          | CSIM    | TDD-043 |       |
| `T1`     | T1   | Abstraction       | Abstraction       |                                  | cosmic-tier | WILL/FACT → Matrix 시스템 공용어              |     |          |         | TDD-043 |       |
| `T2`     | T2   | Contextualization | Contextualization |                                  | cosmic-tier | Matrix+맥락 → 오해 없는 의미 토큰                 |     |          |         | TDD-043 |       |
| `T3`     | T3   | Concretization    | Concretization    |                                  | cosmic-tier | 의미 → Narrative\|Action · Run ✗ (Nexaon) |     |          |         | TDD-043 |       |
| `CSIM`   |      | 우주 의미 언어 번역기      | CSIM              | Cosmic Semantic Interface Matrix | cosmic-tier | Cosmic Layer 구현 · WILL/FACT ↔ Matrix 번역 |     |          | Cosmic  | TDD-043 |       |

### 4.5 Axon Layer · Cosmic Language (AL1–AL7)

| TAG              | CODE     | LABEL_KO | LABEL_EN       | FULLNAME | CATEGORY   | DEFINITION                        | NOT | ARTIFACT | RELATED | SSOT    | NOTES |
| :--------------- | :------- | :------- | :------------- | :------- | :--------- | :-------------------------------- | :-- | :------- | :------ | :------ | :---- |
| `AXON`           |          | 엑숀       | AXON           |          | axon-layer | Axon Layer 7층 프로토콜 · AXON-AL1…AL7 |     |          |         | TDD-043 |       |
| `APEX`           | AXON-AL1 | 의미 규격    | APEX Matrix    |          | axon-layer | 3×3 의미 매트릭스(CSIM의 표준 출력 규격)       |     |          | CSIM    | TDD-043 |       |
| `HEXAGON`        | AXON-AL2 | 헥사곤      | HEXAGON        |          | axon-layer | 5W1H 6축 Envelope · Zod 문법         |     |          |         | TDD-043 |       |
| `Coil-Balancer`  | AXON-AL3 | 코일 벨렌서   | Coil Balancer  |          | axon-layer | 페르소나 Zero-sum · GOVERN            |     |          |         | TDD-043 |       |
| `NEXAON-Network` | AXON-AL4 | 넥사온 네트워크 | NEXAON Network |          | axon-layer | 엣지 후보고·중앙 해석                      |     |          | Nexaon  | TDD-043 |       |
| `NEXAVULT`       | AXON-AL5 | 넥사볼트     | NEXAVULT       |          | axon-layer | Seed·로그·벡터 이중 저장                  |     |          | Ontex   | TDD-043 |       |
| `ACTON`          | AXON-AL6 | 넥숀       | ACTON          |          | axon-layer | 물리 실행 Synapse · PWM · MQTT        |     |          |         | TDD-043 |       |
| `ENVIRON-Shield` | AXON-AL7 | 환경 보호막   | ENVIRON Shield |          | axon-layer | 환경·복지 · Jitter 차단 · Nixie triage  |     |          | NIXIE   | TDD-043 |       |

### 4.6 nexia — DIEA · tabId

> **DIEA** = Distillation Intelligence Engine Array · `nexia` 7 Facet. 구 별칭 `7Tab`/`7탭` SSOT ✗. URL: `/nexia/{tabId}`.
> **핵심 흐름:** 인간의지 ↔ [CSIM] 번역 ↔ [APEX] 매트릭스 ↔ [AXON] 프로토콜 ↔ [DIEA] 정재 작업대 ↔ [NEXIA] 정재 ↔ **M2P** 출력 ↔ [Peripheral]


| TAG      | CODE   | LABEL_KO | LABEL_EN | FULLNAME                               | CATEGORY | DEFINITION              | NOT                        | ARTIFACT         | RELATED      | SSOT    | NOTES    |
| :------- | :----- | :------- | :------- | :------------------------------------- | :------- | :---------------------- | :------------------------- | :--------------- | :----------- | :------ | :------- |
| `Omnix`  | omnix  | 옴닉스      | Omnix    |                                        | tabId    | 소통·허브·오케스트레이션·승인 중계     |                            | .nxchat          | DIEA         | TDD-056 |          |
| `Normex` | normex | 노멕스      | Normex   |                                        | tabId    | Norm·정책·Tiptap 시방서      |                            | .nxpol           | DIEA         | TDD-056 |          |
| `Logex`  | logex  | 로젝스      | Logex    |                                        | tabId    | 추론·관계·React Flow 워크플로   |                            | .nxflow          | DIEA, Nexaon | TDD-056 |          |
| `Scribx` | scribx | 스크립스     | Scribx   |                                        | tabId    | 코드·명세·Monaco            |                            | .nxcode          | DIEA         | TDD-056 |          |
| `Vivex`  | vivex  | 비벡스      | Vivex    |                                        | tabId    | 미디어·ComfyUI             |                            | .nxmedia         | DIEA         | TDD-056 |          |
| `Twinex` | twinex | 트윈엑스     | Twinex   |                                        | tabId    | 디지털 트윈·3D·ESPHome       |                            | .nxproj .nxdev … | DIEA         | TDD-056 |          |
| `Navex`  | navex  | 네이벡스     | Navex    |                                        | tabId    | 플랫폼 전역 자산 탐색·검색·릴레이     |                            |                  | DIEA, NISE   | TDD-056 | 생성 확장자 ✗ |
| `DIEA`   |        | 정재 작업대   | DIEA     | Distillation Intelligence Engine Array | tabId    | nexia 7 Facet 지능 엔진 어레이 | ≠ domainKey · ≠ Nexaon 동일시 |                  | Nexaon,APEX  | TDD-071 |          |

### 4.7 Nexaon · 명칭 (혼동 방지)

> Nexaon ⊂ nexia · Logex ontology. DIEA 7 Facet에 포함 ✗.

| TAG           | CODE | LABEL_KO | LABEL_EN    | FULLNAME | CATEGORY | DEFINITION                                     | NOT                                  | ARTIFACT                          | RELATED     | SSOT    | NOTES |
| :------------ | :--- | :------- | :---------- | :------- | :------- | :--------------------------------------------- | :----------------------------------- | :-------------------------------- | :---------- | :------ | :---- |
| `Nexaon`      |      | 넥사온      | Nexaon      |          | ui       | Logex ontology 서브모드 · ML3 Distillation 오케스트레이터 | tabId ✗ · domainKey ✗ · DIEA Facet ✗ | /nexia/logex/ontology/{projectId} | DIEA, Logex | TDD-073 |       |
| `NexaonShell` |      | 넥사온쉘     | NexaonShell |          | ui       | ExplorerTree · GraphCanvas · RunPanel 3분할      | MainShell ✗                          |                                   | Nexaon      | TDD-056 |       |
| `NEXIA`       |      | 닉시아      | NEXIA       |          | ui       | 제품·문서 도메인 라벨 (대문자)                             | nexia 코드키와 별도                        |                                   |             | TDD-010 |       |

### 4.8 확장 레이어 — CAT · PMS (7+4)

> 7 Core tabId + Ontex·Admin·CAT·PMS. UI 배치 미정.

| TAG                             | CODE | LABEL_KO                      | LABEL_EN | FULLNAME                      | CATEGORY | DEFINITION                                       | NOT                     | ARTIFACT | RELATED | SSOT          | NOTES         |
| :------------------------------ | :--- | :---------------------------- | :------- | :---------------------------- | :------- | :----------------------------------------------- | :---------------------- | :------- | :------ | :------------ | :------------ |
| `CAT`                           |      | 켓                             | CAT      | Contextual Awareness Timeline | ui       | nexia·MainShell 횡단 상황 인지 · LLM Read-only         | Omnix 채팅 ✗ · tabId ✗    |          | PMS     | DEV UI-Driven |               |
| `PMS`                           |      | 피엠에스                          | PMS      | Project Management System     | ui       | WBS·Roadmap·Backlog·Asset Ledger·Validation Gate | erp · 외부 PM ✗ · tabId ✗ |          | CAT     | DEV UI-Driven |               |


### 4.9 nexia — UI 셸 · 레이아웃

| TAG                       | CODE  | LABEL_KO   | LABEL_EN                | FULLNAME                        | CATEGORY | DEFINITION                               | NOT                         | ARTIFACT | RELATED             | SSOT    | NOTES    |
| :------------------------ | :---- | :--------- | :---------------------- | :------------------------------ | :------- | :--------------------------------------- | :-------------------------- | :------- | :------------------ | :------ | :------- |
| `NexiaContent`            |       | 넥시아 콘텐츠    | NexiaContent            |                                 | ui       | nexia Content 슬롯 루트 (TabBar+Workspace)   |                             |          |                     | UIX-004 |          |
| `NexiaWorkspace`          |       | 넥시아 워크스페이스 | NexiaWorkspace          |                                 | ui       | L1 2-pane · L2 split · L3 PiP            |                             |          |                     | UIX-004 |          |
| `NexiaTabBar`             |       | 넥시아 텝바     | NexiaTabBar             |                                 | ui       | 6 탭 스트립 (omnix 제외·레일)                    |                             |          |                     | UIX-004 |          |
| `tabId`                   | tabId | 탭 ID       | tabId                   |                                 | ui       | nexia 탭 식별자                              |                             |          |                     | TDD-056 |          |
| `subPaneId`               |       | 서브패널 ID    | subPaneId               |                                 | ui       | 탭 내 서브패널·다중 창 ID                         |                             |          |                     | UIX-004 |          |
| `panelId`                 |       | 패널 ID      | panelId                 |                                 | ui       | PiP·detach 대상 패널 ID                      |                             |          |                     | UIX-004 |          |
| `OmnixRail`               |       | 옴닉스 레일     | OmnixRail               |                                 | ui       | L1 좌측 Omnix 고정 레일                        |                             |          |                     | UIX-004 |          |
| `Global-Navex`            |       | 글로벌 네이벡스   | Global Navex            |                                 | ui       | Right Drawer 플랫폼 전역 탐색                   |                             |          | Navex               | UIX-002 |          |
| `GlobalFileExplorer`      |       | 글로벌 탐색기    | GlobalFileExplorer      |                                 | ui       | Navex 공통 파일·자산 탐색 엔진                     |                             |          |                     | UIX-002 |          |
| `Global-Asset-Index`      |       | 글로벌 자산 인덱스 | Global Asset Index      |                                 | ui       | 플랫폼 전역 files 통합 인덱스 뷰                    |                             |          | Navex               | PRD-014 |          |
| `InfraTree`               |       | 인프라 구조     | InfraTree               |                                 | ui       | Navex Left origin→domain→device          |                             |          |                     | UIX-002 |          |
| `Infra-Explorer`          |       | 인프라 구조     | Infra Explorer          |                                 | ui       | Navex infra 모드 · navexExploreMode: infra |                             |          |                     | UIX-002 |          |
| `Intelligent-Explorer`    |       | 인텔리전트 탐색기  | Intelligent Explorer    |                                 | ui       | NISE · 개인화 탐색                            |                             |          | NISE                | PRD-014 |          |
| `Navex-Search-Engine`     |       | 네이벡스 검색 엔진 | Navex Search Engine     |                                 | ui       | hybrid retrieval · RRF · personal rerank |                             |          | NISE                | TDD-065 |          |
| `NISE`                    |       | 니세(검색엔진)   | NISE                    | Navex Intelligent Search Engine | ui       | Navex 검색 엔진 공식 약칭                        | ≠ Omnix · ≠ Ontex Graph RAG |          | Navex-Search-Engine | PRD-014 |          |
| `Personalization-Profile` |       | 개인화 프로필    | Personalization Profile |                                 | ui       | Taste·Trace·Focus·Negative ranking SSOT  |                             |          |                     | PRD-014 |          |
| `Left-Drawer`             |       | 왼쪽 사이드바    | Left Drawer             |                                 | ui       | MainShell 좌측 패널                          |                             |          |                     | UIX-004 |          |
| `Right-Drawer`            |       | 오를쪽 사이드바   | Right Drawer            |                                 | ui       | MainShell 우측 패널                          |                             |          |                     | UIX-004 |          |
| `PiP`                     |       | 피아이피       | PiP                     | Picture-in-Picture              | ui       | 패널 분리·detach                             |                             |          |                     | UIX-004 |          |
| `UI-L0`                   |       | 유아이 레벨 0   | UI-L0                   |                                 | ui       | MVP UI 구현 단계 (PRD-001)                   |                             |          |                     |         | UI-L* 계열 |

### 4.10 Omnix · 협업 · BAX · 3층 UI 

> NEXU(What) · BAX(How sit) · NIXIE(Express). 병합 ✗.
> **핵심 흐름:** 인간의지 ↔ [CSIM] 번역 ↔ [APEX] 매트릭스 ↔ [AXON] 프로토콜 ↔ [DIEA] 정재 작업대 ↔ [NEXIA] 정재 ↔ **M2P** 출력 ↔ [Peripheral] 주변기기

| TAG             | CODE | LABEL_KO      | LABEL_EN      | FULLNAME                  | CATEGORY | DEFINITION                                             | NOT                     | ARTIFACT | RELATED    | SSOT    | NOTES |
| :-------------- | :--- | :------------ | :------------ | :------------------------ | :------- | :----------------------------------------------------- | :---------------------- | :------- | :--------- | :------ | :---- |
| `NIXIE`         |      | 닉시            | NIXIE         |                           | ui       | ML1 Presence · Canvas·BAX·전 domainKey Express          | Canvas/BAX 대체 ✗ · Run ✗ |          | Nixie      | TDD-045 |       |
| `Nixie`         |      | 닉시            | Nixie         |                           | ui       | NIXIE 제품·UI·4 Shell 채널 표기                              |                         |          | NIXIE      | TDD-061 |       |
| `M2P`           |      | 엠투피           | M2P           | Matrix-to-Peripheral      | ui       | **실시간 의지 데이터를 NIXIE·Serial용 구체적 명령어로 변환/전송하는 실행 프로토콜** | CSIM는 통역사, M2P는 실행근육    |          |            | UIX-003 |       |
| `NEXU Canvas`   |      | 넥슈 켄버스        | NEXU Canvas   |                           | ui       | 온톨로지·Knowledge 페브릭 시맨틱 뷰                               | BAX 혼용 ✗                |          | BAX, NIXIE | TDD-045 |       |
| `VirtualCanvas` |      | 가상 켄버스        | VirtualCanvas |                           | bax      | BAX 레이아웃 호스트 Grid+OVERLAY                              | NEXU Canvas ✗           |          | BAX        | UIX-003 |       |
| `BAX`           |      | 벡스            | BAX           | Breathing AI Experience   | bax      | 미적 레이아웃 · void · Grid · 전 domainKey                    | NEXU Canvas 혼용 ✗        |          |            | UIX-003 |       |
| `MAE`           |      | 멤.에이.이        | MAE           | Matrix Aesthetic Engine   | bax      | **의미 데이터를 시각적 Grid로 배치하는 BAX 실행 엔진 (ATS 참조)**          |                         |          |            | UIX-003 |       |
| `ATS`           |      | 에이.티.에스       | ATS           | Aesthetic Tuning Settings | bax      | **ASR·Depth 등 미적 파라미터를 저장하고 MAE에 전달하는 영속화 모듈**         |                         |          |            | UIX-003 |       |
| `ASR`           |      | 에이.에스.알       | ASR           | Aesthetic Space Ratio     | bax      | **인터페이스의 여백 하한선(void_ratio)을 규정하는 핵심 지표**              |                         |          |            | UIX-003 |       |
| `LayoutPolicy`  |      | LayoutPolicy  | 레이아웃 폴리씨      |                           | bax      | BAX BLOCK 배치 정책                                        |                         |          |            | UIX-003 |       |
| `RuleGuard`     |      | RuleGuard     | 룰 그리드         |                           | bax      | 규칙 가드 · AlarmState                                     |                         |          |            | UIX-003 |       |
| `NEXNAP`        |      | NEXNAP        | 넥스넵           |                           | ui       | 시스템 인터페이스·Envelope 규약                                  |                         |          |            | TDD-010 |       |
| `Envelope`      |      | Envelope      | 봉투            |                           | ui       | 탭·actor·payload 표준 메시지 래퍼                              |                         |          |            | TDD-010 |       |
| `approval-gate` |      | approval-gate | 승인 게이트        |                           | ui       | 승인 A/B/C 게이트                                           |                         |          |            | TDD-008 |       |
| `GOVERN`        |      | GOVERN        | 거버넌스          |                           | ui       | 룰·프롬프트 거버넌스                                            |                         |          |            | TDD-043 |       |
| `ASK`           |      | ASK           | 요청/유보         |                           | ui       | **HEXAGON 내 결측 정보 보완을 위한 의도(Intent) 토큰**               |                         |          | VOID       |         |       |
| `VOID`          |      | VOID          | 중립/공백         |                           | ui       | 결정이 내려지지 않은 데이터의 잠재적 상태                                |                         |          | ASK        |         |       |
| `VOID-BOX`      |      | VOID-BOX      | 보이드 박스        |                           | ui       | **결정 유보(DEFERRED) 데이터를 담는 BAX 그리드 내 논리적 컨테이너**         |                         |          |            | PRD-003 |       |
| `DEFERRED`      |      | DEFERRED      | 연기/보류         |                           | ui       | 연기된 결정 상태                                              |                         |          |            | PRD-003 |       |

### 4.11 NIXIE — 4 Shell 채널

| TAG                  | CODE | LABEL_KO | LABEL_EN             | FULLNAME | CATEGORY | DEFINITION                       | NOT | ARTIFACT | RELATED | SSOT    | NOTES |
| :------------------- | :--- | :------- | :------------------- | :------- | :------- | :------------------------------- | :-- | :------- | :------ | :------ | :---- |
| `NixieWebShell`      |      | 닉시 웹쉘    | Nixie Web Shell      |          | ui       | MainShell frame ML1 · PiP detach |     |          |         | TDD-061 |       |
| `NixieDesktopShell`  |      | 닉스 데스크탑쉘 | Nixie Desktop Shell  |          | ui       | Python PC 독립 · WS/SSE · M2P      |     |          |         | TDD-062 |       |
| `NixieMobileShell`   |      | 닉스 모바일쉘  | Nixie Mobile Shell   |          | ui       | iOS/Android · 푸시·VAD             |     |          |         | TDD-063 |       |
| `NixiePhysicalShell` |      | 닉시 실물쉘   | Nixie Physical Shell |          | ui       | ESP32/RPi 하드웨어 · M2P·Serial      |     |          |         | TDD-064 |       |

### 4.12 데이터 · 파일 · Identity

| TAG | CODE | LABEL_KO | LABEL_EN | FULLNAME | CATEGORY | DEFINITION | NOT | ARTIFACT | RELATED | SSOT | NOTES |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `files` |  | 파일 | files |  | data | 업로드 파일 DB 테이블 |  |  |  | TDD-010 |  |
| `file_references` |  | 파일 참조 | file_references |  | data | 도메인·프로젝트별 파일 참조 |  |  |  | TDD-010 |  |
| `asset-origin` |  | 출처 축 | asset-origin |  | data | Navex 출처 facet |  |  |  | PRD-014 |  |
| `navexCategory` |  | 종류 facet | navexCategory |  | data | Navex 종류 facet |  |  |  | TDD-065 |  |
| `file_embeddings` |  | 파일 벡터 인덱스 | file_embeddings |  | data | 파일 벡터 인덱스 |  |  |  | TDD-010 |  |
| `source_metadata` |  | 추출 메타 | source_metadata |  | data | AI 추출 메타 (PRD-013) |  |  |  | PRD-013 |  |
| `nexa-docs` |  | 문서 폴더 노드 | nexa-docs |  | data | 문서 폴더 노드 ID (PRD-008) |  |  |  | PRD-008 |  |
| `identity_id` |  | identity ID | identity_id |  | data | Knowledge OS identity ID |  |  |  | TDD-045 |  |
| `nexa_identities` |  | Identity 테이블 | nexa_identities |  | data | Identity 테이블 |  |  |  | TDD-045 |  |
| `anchor_id` |  | 자산 논리 고정 주소 | anchor_id |  | data | 자산 논리 고정 주소 |  |  |  | TDD-045 |  |
| `graph_id` |  | 그래프 ID | graph_id |  | data | Nexaon·Run 그래프 ID |  |  |  | TDD-008 |  |
| `run_id` |  | 실행 ID | run_id |  | data | LangGraph 실행 ID |  |  |  | TDD-008 |  |
| `project_yjs_updates` |  | Yjs 스냅샷 persist | project_yjs_updates |  | data | Yjs 스냅샷 persist |  |  |  | TDD-038 |  |
| `yjs_state` |  | Yjs 바이너리 상태 | yjs_state |  | data | Yjs 바이너리 상태 |  |  |  | TDD-038 |  |
| `Knowledge-OS` |  | Knowledge OS | Knowledge OS |  | data | 용어·벡터·감사 체계 |  |  |  | TDD-045 |  |

### 4.13 IoT · 제품 모듈

| TAG | CODE | LABEL_KO | LABEL_EN | FULLNAME | CATEGORY | DEFINITION | NOT | ARTIFACT | RELATED | SSOT | NOTES |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `NEXA-CELL` |  | NEXA-CELL | NEXA-CELL |  | iot | ESPHome YAML·웹 펌웨어 제품 |  |  |  | TDD-024 |  |
| `Physical-AI` |  | Physical AI | Physical AI |  | iot | 물리+AI 융합 (BRD) |  |  |  | BRD-001 |  |
| `Physical-AI-Ops` |  | Physical AI Ops | Physical AI Ops |  | iot | 산업 운영 포지셔닝 |  |  |  | BRD-001 |  |
| `digital-twin` |  | digital twin | digital twin |  | iot | Twinex 도메인 개념 |  |  | Twinex | TDD-056 |  |
| `edge` |  | edge | edge |  | iot | 엣지 디바이스·큐 |  |  |  | TDD-068 |  |
| `edge-device` |  | edge-device | edge-device |  | iot | 엣지 디바이스 |  |  |  | TDD-068 |  |
| `Lambda` |  | Lambda | Lambda |  | iot | NEXA-CELL 보드 라인 |  |  |  | TDD-024 |  |
| `Kineton` |  | Kineton | Kineton |  | iot | Physical Bridge · ACTON · ROS 2 |  |  |  | TDD-072 |  |

### 4.14 Generators · 미디어

| TAG          | CODE | LABEL_KO | LABEL_EN   | FULLNAME | CATEGORY | DEFINITION    | NOT | ARTIFACT | RELATED | SSOT    | NOTES |
| :----------- | :--- | :------- | :--------- | :------- | :------- | :------------ | :-- | :------- | :------ | :------ | :---- |
| `Generators` |      | 제너레이터    | Generators |          | iot      | AI 생성기 TDD 묶음 |     |          |         | TDD-031 |       |
| `AIVIDEO`    |      | 비디오 생성기  | AIVIDEO    |          | iot      | AI 비디오 생성기    |     |          |         | TDD-031 |       |
| `AI3D`       |      | 3D 생성기   | AI3D       |          | iot      | AI 3D 생성기     |     |          |         | TDD-031 |       |
| `AICIRCUIT`  |      | 회로 생성기   | AICIRCUIT  |          | iot      | AI 회로 생성기     |     |          |         | TDD-031 |       |
| `AISOUND`    |      | 솔 생성기    | AISOUND    |          | iot      | AI 사운드 생성기    |     |          |         | TDD-031 |       |

### 4.15 기타 · 레거시

| TAG                | CODE | LABEL_KO         | LABEL_EN         | FULLNAME | CATEGORY | DEFINITION       | NOT              | ARTIFACT | RELATED        | SSOT    | NOTES      |
| :----------------- | :--- | :--------------- | :--------------- | :------- | :------- | :--------------- | :--------------- | :------- | :------------- | :------ | :--------- |
| `Cockpit`          |      | Cockpit          | Cockpit          |          | legacy   | 구 UI 라벨          | 신규 금지            |          | Omnix          |         | → Omnix    |
| `NexiaSplitLayout` |      | NexiaSplitLayout | NexiaSplitLayout |          | legacy   | 구 MVP 분할         |                  |          | NexiaWorkspace |         | deprecated |
| `Nexion`           |      | Nexion           | Nexion           |          | legacy   | UI 브랜드명          | domainKey는 ontex |          |                | TDD-057 |            |
| `Nexus-Map`        |      | Nexus-Map        | Nexus-Map        |          | legacy   | 레거시 AI 지식 맵      |                  |          |                |         | deprecated |
| `U2BEE`            |      | U2BEE            | U2BEE            |          | legacy   | 데스크톱 앱 (PRD-002) |                  |          |                | PRD-002 |            |
| `v0`               |      | v0               | v0               |          | legacy   | v0 프롬프트·프로토타입    |                  |          |                | UIX-005 |            |
| `nexia-shell`      |      | nexia-shell      | nexia-shell      |          | legacy   | v0 프로토타입 셸       |                  |          |                | UIX-005 |            |

### 5. `.nx*` 산출물 확장자

> Navex: 생성 확장자 ✗ — 전 domainKey 인덱싱.

| TAG | CODE | LABEL_KO | LABEL_EN | FULLNAME | CATEGORY | DEFINITION | NOT | ARTIFACT | RELATED | SSOT | NOTES |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `nxchat` | omnix | 채팅·세션 | .nxchat |  | artifact | Omnix 채팅·세션 |  | .nxchat |  | TDD-010 |  |
| `nxpol` | normex | 규범·정책 | .nxpol |  | artifact | Normex 규범·정책 |  | .nxpol |  | TDD-010 |  |
| `nxflow` | logex | 워크플로·그래프 | .nxflow |  | artifact | Logex 워크플로·그래프 |  | .nxflow |  | TDD-010 |  |
| `nxcode` | scribx | 코드·스크립트 | .nxcode |  | artifact | Scribx 코드·스크립트 |  | .nxcode |  | TDD-010 |  |
| `nxmedia` | vivex | 미디어 메타 | .nxmedia |  | artifact | Vivex 미디어 메타 |  | .nxmedia |  | TDD-010 |  |
| `nxproj` | twinex | 프로젝트 루트 | .nxproj |  | artifact | Twinex 프로젝트 루트 |  | .nxproj |  | TDD-010 |  |
| `nxgrp` | twinex | 그룹·토폴로지 | .nxgrp |  | artifact | Twinex 그룹·토폴로지 |  | .nxgrp |  | TDD-010 |  |
| `nxdev` | twinex | 디바이스 바인딩 | .nxdev |  | artifact | Twinex 디바이스 바인딩 |  | .nxdev |  | TDD-010 |  |
| `nxdiag` | twinex | 진단·시뮬 | .nxdiag |  | artifact | Twinex 진단·시뮬 |  | .nxdiag |  | TDD-010 |  |

### 부록 A — 구 UI 라벨 (비규범)

> [TDD-010 부록 B](08_TDD/NEXIA/08_TDD_NEXIA_구조기술스택운영방침.md) 동일. **신규 금지.**

| TAG | CODE | LABEL_KO | LABEL_EN | FULLNAME | CATEGORY | DEFINITION | NOT | ARTIFACT | RELATED | SSOT | NOTES |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Cockpit-legacy` | Cockpit | 콕핏 | Cockpit |  | legacy | 구 UI 라벨 |  |  | Omnix |  | 부록 A |
| `Ethos-legacy` | Ethos | 에토스 | Ethos |  | legacy | 구 UI 라벨 |  |  | Normex |  | 부록 A |
| `Synapse-legacy` | Synapse | 시넵스 | Synapse |  | legacy | 구 UI 라벨 |  |  | Logex |  | 부록 A |
| `Glos-legacy` | Glos | 글로스 | Glos |  | legacy | 구 UI 라벨 |  |  | Scribx |  | 부록 A |
| `Physis-legacy` | Physis | 피시스 | Physis |  | legacy | 구 UI 라벨 |  |  | Vivex |  | 부록 A |
| `Sense-legacy` | Sense | 센스 | Sense |  | legacy | 구 UI 라벨 |  |  | Twinex |  | 부록 A |
| `Navis-legacy` | Navis | 나비스 | Navis |  | legacy | 구 UI 라벨 |  |  | Navex |  | 부록 A |
---

## 부록 B — 전체 태그 인덱스

확정 문서 frontmatter 기준. 신규 승격 시 [`sync_terms_to_tags.py`](scripts/sync_terms_to_tags.py) 재실행.

| SCOPE | COUNT | LOOKUP |
| :--- | :---: | :--- |
| `terms_standard` | 99 | [용어집_범용_v2.0.md](용어집_범용_v2.0.md) |
| `terms_nexa` | 219+ | 본 문서 §4 + [doc_id_레지스트리](doc_id_레지스트리.md) |

---

## 관련 문서

| RELATION | DOCUMENT |
| :--- | :--- |
| 범용 용어 | [용어집_범용_v2.0.md](용어집_범용_v2.0.md) (TDD-069) |
| 문서 생태계 | [개발문서 생태계와 관리 체계](<개발문서 생태계와 관리 체계.md>) |
| doc_id | [doc_id_레지스트리](doc_id_레지스트리.md) |
| 도메인 | [TDD-071](08_TDD/NEXAOS/08_TDD_NEXAOS_도메인구조통합_v1.0.md) |
| Physical · Hub | [TDD-040](08_TDD/AI/08_TDD_AI_지능위계및하드웨어사양.md) · [TDD-075](08_TDD/NEXAOS/08_TDD_NEXAOS_전역아키텍처표준_GlobalArchitectureStandard_v1.0.md) |
| Cosmic · Axon | [TDD-043](08_TDD/Cosmic/08_TDD_CSIM_AXON프로토콜_정본.md) · [TDD-044](08_TDD/Cosmic/08_TDD_CosmicLanguage_전역데이터아키텍처.md) |
| nexia 스택 | [TDD-010](08_TDD/NEXIA/08_TDD_NEXIA_구조기술스택운영방침.md) |
| nexia UI | [UIX-004](07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md) |
| BAX | [UIX-003](07_UIUX/07_UIUX_BAX_미학적인터페이스UX아키텍처_v1.0.md) |
| Nixie | [TDD-061~064](08_TDD/NEXIA/Nixie/) |

---

## 부록 C — 상세 서사 (이전 §3.3~3.6 요약 보존)

> **DIEA ↔ Nexaon:** DIEA = 7 Facet 작업면 · Nexaon = Cold Path Distillation 오케스트레이터 (Logex ontology). Facet 산출은 never 직접 promoted — Nexaon·승인·SHACL 경유 ([TDD-071 §2.1.2](08_TDD/NEXAOS/08_TDD_NEXAOS_도메인구조통합_v1.0.md)).

> **Nixie Reflex vs Nexaon Strategic:** Nixie(ML1) = Express·알림 · Nexaon(ML3) = Run·promoted. Run 트리거·Router fan-out **✗**.

> **NEXU · BAX · NIXIE 3층:** Knowledge 페브릭 → 미적 레이아웃 → ML1 Express. Canvas/BAX **혼용 ✗**.

> **Navex · NISE:** Intelligent = hybrid 검색 · Infra = InfraTree. Omnix discover → `navex_search` tool ([PRD-014](05_PRD/NEXIA/05_PRD_NEXIA_Navex이중탐색모드지능형탐색_v1.0.md)).

> **혼동 방지 (번호 체계):** ML0–ML3 ≠ PT-0–3 ≠ T1–T3 ≠ AXON-AL1–7 ≠ UI-L* ≠ NexiaWorkspace L* — **동일 표기 금지**.
