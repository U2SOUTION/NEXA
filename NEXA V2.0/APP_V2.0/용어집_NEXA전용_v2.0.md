---
implements_doc: 
doc_id: TDD-070
title: NEXA V2.0 전용 용어집
category: 08_TDD
domain: NEXAOS
status: published
created: 2026-06-12
updated: 2026-06-13
parent_doc: TDD-001
see_also: [TDD-040, TDD-043, TDD-044, TDD-069, TDD-071, TDD-075, TDD-010, TDD-045, TDD-056, TDD-065, TDD-061, TDD-062, TDD-063, TDD-064, TDD-074, UIX-004, PRD-014]
terms_standard: []
terms_nexa: [glossary, terms_nexa, domainKey, tabId, DIEA, Nexaon, NIXIE, Navex, NISE, ML0, ML1, ML2, ML3, Menton, Menton-Layer, ML, Physical-Tier, Physical-Centric-Hierarchy, Core-Engine-Stack, Hub-and-Spoke, Cosmic-Layer, AXON, AXON-Stack-Layer, CSIM, APEX, HEXAGON, ACTON, NEXAVULT, ENVIRON-Shield, Galthon, Kineton]
tags: [doc/cat/08-tdd, doc/domain/nexaos, nexa/glossary, nexa/terms_nexa, nexa/domainKey, nexa/tabId, nexa/DIEA]
---

# NEXA V2.0 전용 용어집

> **doc_id:** TDD-070 · **역할:** NEXA 플랫폼·제품·코드 전용 식별자 (`terms_nexa`) 의 **사람이 읽는 SSOT**.
> **범용 기술:** [용어집_범용_v2.0.md](용어집_범용_v2.0.md) (TDD-069) · **짝 문서**.
> **기계 태그 SSOT:** 각 문서 frontmatter `terms_nexa` → `tags` ([`sync_terms_to_tags.py`](scripts/sync_terms_to_tags.py)).
> **충돌 시:** nexia **DIEA** Facet·`tabId` 는 **TDD-056** · 플랫폼 공통·Distillation 은 **TDD-071** 우선.

---

## 1. 사용 규칙 (요약)

| 구분 | frontmatter 키 | 태그 접두 | SSOT |
| :--- | :--- | :--- | :--- |
| **범용 기술 스택** | `terms_standard` | `std/` | [용어집_범용_v2.0.md](용어집_범용_v2.0.md) |
| **NEXA 전용** | `terms_nexa` | `nexa/` | **본 문서** |

- 태그·배열 값은 **kebab-case**.
- **신규 전용 용어**는 본 용어집에 먼저 정의한 뒤 문서 `terms_nexa` 에 추가.
- **구 UI 라벨**(Cockpit, Ethos 등) 은 **부록 A** 참고만 — 신규 문서·코드 **금지**.


## 2.용어집 만드는 법 "사람 중심" 표기 보강 과 서사 전면 배치 
NEXA OS는 단순한 소프트웨어의 집합이 아니라, 스스로 인지하고 성장하는 **유기적 지능 생태계**입니다. 이 생태계를 이해하기 위해 우리는 세 가지 핵심 축을 정의합니다.

1. **피지컬 티어 (어디에 있는가):** 생명체가 발을 딛고 있는 물리적 장소입니다. 말단의 감각(PT-0)부터 중앙의 심장(PT-3)까지, 연산이 일어나는 '무대'를 의미합니다.
2. **지능 위계 (얼마나 깊게 생각하는가):** 시스템의 사고 수준입니다. 찰나의 반사(ML0)부터 사용자의 얼굴(ML1), 그리고 깊은 전략적 추론(ML3)까지 이어지는 '생각의 층위'입니다.
3. **Axon Layer (어떻게 소통하는가):** 이 모든 것을 하나로 잇는 신경망입니다. 파편화된 신호를 표준화된 문법으로 정제하여, 온 몸에 흐르게 하는 '공통의 언어'입니다.


| 기술 ID (분류) | 사람이 읽는 표기 (기획용)   | 정의                  |     |
| :--------- | :---------------- | :------------------ | --- |
| **PT-0**   | **피지컬 티어 0 (말단)** | 센서·액추에이터 등 최말단 하드웨어 |     |
| **PT-3**   | **피지컬 티어 3 (중앙)** | 클라우드·서버 등 전체 제어 허브  |     |


## 3. NEXA V2.0 전용 용어 (`terms_nexa`)

NEXA 플랫폼·제품·코드에서만 쓰는 식별자·모듈·정책.

### 3.1 플랫폼 · OS

| 태그                     | 표기 (한글)              | 정의                                        | SSOT    |
| :--------------------- | :------------------- | :---------------------------------------- | :------ |
| `NEXA`                 | NEXA                 | 사업·플랫폼 전체 브랜드                             | BRD-001 |
| `NEXAOS`               | NEXA OS              | OS·셸·도메인·미션크리티컬 설계층                       | TDD-001 |
| `domainKey`            | domainKey            | Header 전역 메뉴 도메인 식별자 (`nexia`, `erp` …)   | TDD-071 |
| `subRoute`             | subRoute             | 단일 `domainKey` 내 content 분기 (`erp/parts`) | TDD-071 |
| `MainShell`            | MainShell            | 4 영역 +StatusBar 플랫폼 셸                     | UIX-006 |
| `domainLayoutRegistry` | domainLayoutRegistry | domainKey→슬롯 lazy import 레지스트리            | TDD-071 |
| `useLayoutStore`       | useLayoutStore       | 드로어·상태바 Zustand SSOT                      | UIX-006 |
| `drawerDefaults`       | drawerDefaults       | 도메인별 L/R 드로어 open 정책                      | TDD-071 |
| `SystemStatusBar`      | SystemStatusBar      | 하단 1 줄 + 확장 상태 패널                         | UIX-006 |
| `AppHeader`            | AppHeader            | 상단 전역 헤더                                  | UIX-006 |
| `themePreset`          | themePreset          | 도메인 테마 (`office-light` 등)                 | TDD-071 |
| `packages-shared`      | packages/shared      | Zod·commands 공유 패키지                       | TDD-007 |
| `agent-graph`          | apps/agent-graph     | LLM·Embed·LangGraph 실행 앱                  | TDD-003 |
| `GraphCanvas`          | GraphCanvas          | React Flow 워크플로 UI · Yjs `.nxflow`        | TDD-007 |
| `apps-sync`            | apps/sync            | Hocuspocus Yjs 서버                         | TDD-038 |
| `embedder`             | embedder             | in-process 임베딩 (`/v1/embed`)              | TDD-003 |
| `M.O.S.E.S.`           | M.O.S.E.S. (모세)      | 미션크리티컬 설계 원칙 약어                           | TDD-001 |

#### 3.1.1 독립주체 (6대 핵심 축 외)

> **한 줄:** 데이터·지식 **흐름 축** 이 아닌 **횡단·메타** 역할. 기술 ID **`GL`** · **Cold/Hot Path 비참여**.

| 태그 | 표기 | Normative 정의 |
| :--- | :--- | :--- |
| `Galthon` | **Galthon** (갈톤) | **NEXA** 시스템 전체 **신뢰성** 담보 **독립 감시 주체** — Why-Chain · trace · Ethos·SHACL **횡단 관측** · **흐름 개입 ✗** · 6대 핵심 축 **✗** |

> **경계:** **`Galthon`** ≠ 브랜드 **NEXA** · ≠ `Menton` · ≠ `Nexaon` Run — **감시탑(Watchtower)** 메타 역할만. **Normative SSOT:** [TDD-074](08_TDD/Galthon/08_TDD_Galthon_TrustWatch_신뢰감시독립주체_v1.0.md) · 개념 허브: [Global Architecture §Galthon](08_TDD/NEXAOS/08_TDD_NEXAOS_전역아키텍처표준_GlobalArchitectureStandard_v1.0.md).

**관측 질문 유형** _(흐름 비참여 · trace만)_: Envelope 폐기 · uplink 거부 · Run 보류 · 승인 거절 · promoted 불가 · explore 불가 — 엔진별 근거 표 = [TDD-074 §4.2](08_TDD/Galthon/08_TDD_Galthon_TrustWatch_신뢰감시독립주체_v1.0.md).

### 3.2 `domainKey` (제품·업무 영역)

| 태그        | domainKey   | 역할                                    |
| :-------- | :---------- | :------------------------------------ |
| `nexia`   | **nexia**   | 플랫폼 **핵심 지능 셸** · **DIEA** 호스트 — Nexaon·`stateBus` **Distillation** ([§3.4.0](#340-nexia--domainkey-정의)) |
| `ontex`   | **Ontex**   | 온톨로지·Graph RAG·pgvector (구 nexion 흡수) |
| `erp`     | **erp**     | ERP 메인 (구 erp-parts 통합)               |
| `nexabo`  | **nexabo**  | IoT 관제·텔레메트리 (구 nexage)               |
| `nexet`   | **nexet**   | SW/HW 마켓 유통                           |
| `infra`   | **infra**   | 장치 등록·my-devices                      |
| `network` | **network** | WiFi·CAN·MQTT 토폴로지                    |
| `admin`   | **admin**   | 슈퍼 관리 (구 nexa-admin)                  |

상세 맵: [`TDD-071`](08_TDD/NEXAOS/08_TDD_NEXAOS_도메인구조통합_v1.0.md).

#### 3.2.0 피지컬 티어 · 세 축 · Hub-and-Spoke

> **한 줄:** **피지컬 티어 (PT-0~3)** = 배치 축 · **ML** = 논리 계층 · **Core Engine Stack** = 기능 엔진. **PT-3 허브** + **PT-0~2·Nixie 샤드**. SSOT: [TDD-040 §0](08_TDD/AI/08_TDD_AI_지능위계및하드웨어사양.md) · [Global Architecture §Hub-and-Spoke](08_TDD/NEXAOS/08_TDD_NEXAOS_전역아키텍처표준_GlobalArchitectureStandard_v1.0.md).

**NEXA 통합 아키텍처 위계 (Physical-Centric Hierarchy)**

| 축 | 호칭 (한·영) | 질문 | 개수 | SSOT |
| :--- | :--- | :--- | :---: | :--- |
| **① 피지컬 티어** | 피지컬 티어 · Physical Placement Tier | **어디서** 연산하나 | **4** (PT-0~3) | [TDD-040](08_TDD/AI/08_TDD_AI_지능위계및하드웨어사양.md) |
| **② 논리 계층** | Menton Layer (Intelligence Stack) | **소프트웨어상** 역할 층 | **4** (ML0–ML3) | **§3.2.1** · [TDD-068 §1.4](08_TDD/NEXIA/08_TDD_NEXIA_IoT엣지데이터파이프라인_HEXAGON_Nexaon연계_v1.0.md) |
| **③ 핵심 엔진** | Core Engine Stack | **무엇이** 기능 수행 | **6** _(가변)_ | [Global Architecture](08_TDD/NEXAOS/08_TDD_NEXAOS_전역아키텍처표준_GlobalArchitectureStandard_v1.0.md) · KL [TDD-072](08_TDD/NEXIA/Kineton/08_TDD_Kineton_PhysicalBridge_ACTON_ROS2_v1.0.md) · NL [TDD-073](08_TDD/NEXIA/Nexaon/08_TDD_Nexaon_Distillation오케스트레이터_v1.0.md) |

| 피지컬 티어 | HW | **지능 위계** (주체) | 비고 |
| :---: | :---: | :--- | :--- |
| **PT-0** | COLD | **Nano Sentinel** | HEXAGON · CSIM T1 · ACTON Reflex |
| **PT-1** | WARM | **Micro Sentinel** _(선택)_ | 비식별 게이트 · **Nixie ✗** |
| **PT-2** | WARM | **Kinetic Controller** _(선택)_ | Fast Path · 현장 JSON |
| **PT-3** | HOT | **Zenith Indicator** | **풀스택 웹 플랫폼 허브** · DIEA · Nexaon · Ontex |

**Hub-and-Spoke (Normative)**

- **PT-3 (Zenith):** Core Engine **통합 허브**—CSIM T2/T3R · DIEA · Normex · Nexaon · Ontex—가 **풀스택 웹 플랫폼**으로 집결 → **전역 최적화(Global Optimization)** · **장기 지식 고착(Long-term Memory)**.
- **PT-0~2 · Nixie:** **경량 실장(lite embodiment)**—말단 HEXAGON/CSIM T1 · Sentinel·SLM · CSIM T3N 표현—→ **Local Reflex** · **실시간 UI**.
- **오해 방지:** 6엔진 **전부 PT-3 only ✗** · 엣지 = **완전체 복제 ✗** · **동일 Axon Layer · HEXAGON 규격 샤드 ✓**. `지능 계층` **deprecated** → **피지컬 티어**. **지능 위계** = TDD-040 **주체 명** — **Menton Layer 층 번호 동의어 ✗**.

#### 3.2.1 Menton Intelligence Stack (ML0–ML3)

> **한 줄:** **지능·표현 4층** — Edge → Presence → Domain → Strategic. **Menton Layer (Intelligence Stack)** — 브랜드 **NEXA** 와 **동일시 ✗**. 기술 ID: **`ML`** (축) · **`ML0`–`ML3`** (층).
>
> **분담 (Phase 1):** **본 절** = ML0–ML3 **논리 역할** · **배치(어디서)** = [TDD-040](08_TDD/AI/08_TDD_AI_지능위계및하드웨어사양.md) PT-0~3 · **오케스트레이터** = [TDD-073](08_TDD/NEXIA/Nexaon/08_TDD_Nexaon_Distillation오케스트레이터_v1.0.md) · SSOT 맥락: [Global Architecture](08_TDD/NEXAOS/08_TDD_NEXAOS_전역아키텍처표준_GlobalArchitectureStandard_v1.0.md)

| ML | 별칭 | 주체 | 역할 | LangGraph Agent? |
| :--- | :--- | :--- | :--- | :---: |
| **ML0** | Reflexive · Edge | **Sentinel** · Nano/Micro-Sentinel | Fact · Reflex · 후보고 uplink · ACTON | — |
| **ML1** | Presence | **Nixie (NIXIE)** · 4 Shell 채널 | 지능 **결과·알람·상태 Express** · Reflex triage · PiP/TTS | ✗ |
| **ML2** | Tactical · Domain | **nexabo/** · **nexia/** (Twinex · Nexaon UI) | 관제 · 트윈 · 정재 **작업면** | — |
| **ML3** | Strategic | **Nexaon** · **`apps/agent-graph`** · **Omnix** | ingest → Run · SHACL · 승인 · **promoted** | ✓ |

> **ML3 Normative:** [TDD-073](08_TDD/NEXIA/Nexaon/08_TDD_Nexaon_Distillation오케스트레이터_v1.0.md) · 엣지 연계 [TDD-068 §1.4](08_TDD/NEXIA/08_TDD_NEXIA_IoT엣지데이터파이프라인_HEXAGON_Nexaon연계_v1.0.md)

**혼동 방지 (Normative)** — 본 **ML*** 체계와 **별도** 번호 체계:

| 접두·체계 | 예 | 의미 |
| :--- | :--- | :--- |
| **ML0–ML3** | ML1 Presence | **본 절** — Menton Intelligence Stack |
| **PT-0~3** | PT-3 Zenith | **피지컬 티어** — 배치 축 ([§3.2.0](#320-피지컬-티어--세-축--hub-and-spoke)) |
| **지능 위계** | Nano · Zenith Indicator | TDD-040 **주체 명** — **ML 층 번호 동의어 ✗** |
| **Core Engine Stack** | HEXAGON → Ontex | **기능 엔진** 6 _(가변)_ — **피지컬 티어 수 ✗** |
| **NISE-L*** | NISE-L0 Lexical … L5 | Navex hybrid 검색 ([`PRD-014`](05_PRD/NEXIA/05_PRD_NEXIA_Navex이중탐색모드지능형탐색_v1.0.md)) |
| **T1–T3** | T2 맥락 동기화 | **Cosmic Layer** — CSIM 개념 Tier ([§3.2.2](#322-cosmic-layer--csim-개념-tier-t1t3)) |
| **`AXON-AL1`–`AL7`** | AL2 HEXAGON | **Axon Layer** 7층 — 층 지칭 시에만 ([§3.2.3](#323-axon--cosmic-language-프로토콜)) |
| **UI-L*** | UI-L0 … | MVP UI 구현 단계 (PRD-001) |
| **NexiaWorkspace L*** | L1 2-pane · L2 split · L3 PiP | nexia **레이아웃** 층 ([§3.5](#35-nexia--ui-셸--레이아웃)) |
| **TDD-071 L*** | L0 인문 헌장 … | NEXA OS **도메인 수직** 계층 — Intelligence Stack **✗** |
| **CPU cache L*** | — | 하드웨어 문서 **✗** — ML* 와 **동일 표기 금지** |

> **구 표기:** `Nexa Layer` · `NEXA Layer` · **`NL0`–`NL3`** · **`NL`** (Menton 축 ID) **deprecated** → **Menton Layer** · **`ML`** · **`ML0`–`ML3`**. **`AL`** (Axon 축 ID) · **`AXON-AL*`** (와일드카드 축 참조) **deprecated** → **Axon Layer** · 층 지칭 시 **`AXON-AL1`–`AL7`**. **`CL`** (Cosmic 축 ID) · **`CLA`** **deprecated** → **Cosmic Layer** · Tier 지칭 시 **`T1`–`T3`**. 개정 전 **L0–L3** = **ML0–ML3** (Edge·Presence·Domain·Strategic). 신규·개정 SSOT: **가술명 우선** · Menton 층 **`ML0`–`ML3`** · Axon 층 **`AXON-AL1`–`AL7`** · Cosmic Tier **`T1`–`T3`** 필요 시만.

#### 3.2.2 Cosmic Layer · CSIM 개념 Tier (T1–T3)

> **한 줄:** **WILL/FACT 의미 번역** 축 — **Cosmic Layer** · 구현 **`CSIM`** · Tier 지칭 시 **T1–T3**. SSOT: [`TDD-043` §13.0.1](08_TDD/Cosmic/08_TDD_CSIM_AXON프로토콜_정본.md) · [`TDD-044` §2.3 · §2.6](08_TDD/Cosmic/08_TDD_CosmicLanguage_전역데이터아키텍처.md) · [Global Architecture §Cold Path](08_TDD/NEXAOS/08_TDD_NEXAOS_전역아키텍처표준_GlobalArchitectureStandard_v1.0.md).

| Tier | 단계 (EN) | Normative 정의 |
| :---: | :--- | :--- |
| **T1** | **Abstraction** · **공용어화** | WILL/FACT → **Matrix** **시스템 공용어** · 양방향 1차 투영 |
| **T2** | **Contextualization** · **맥락 동기화** | Matrix + 맥락 → **오해 없는 의미** 토큰 · Ethos 정렬 |
| **T3** | **Concretization** · **구체화** | 의미 → **Narrative** \| **Action** — CSIM 번역 · **Run ✗** (Nexaon) |

**운영 배치:** T1 = ML0 · T2 = Nest Ingress · T3 = Nexaon 내부 — **개념 Tier ≠ 배치 Tier** 혼동 **✗**. **Axon Layer** · **Menton Layer** 와 **별도** — [§3.2.3](#323-axon--cosmic-language-프로토콜).

> **표기 (Normative):** 신규·개정 SSOT 본문 = **Cosmic Layer** · Tier 지칭 시 **`T1`–`T3`** only. bare **`CL`** · **`CLA`** **deprecated**.

#### 3.2.3 AXON · Cosmic Language 프로토콜

> **한 줄:** 인간·AI·기계 의도를 **APEX Matrix** 로 압축하고 **HEXAGON(5W1H)** 으로 정규화한 뒤 **NEXAON/NEXAVULT** 로 해석·학습하여 **ACTON** 으로 물리 실행하는 **우주언어(Cosmic Language)** **신호·의미 스택**. SSOT: [`TDD-043`](08_TDD/Cosmic/08_TDD_CSIM_AXON프로토콜_정본.md) · [TDD-044](08_TDD/Cosmic/08_TDD_CosmicLanguage_전역데이터아키텍처.md).

| 태그 | 표기 | Normative 정의 |
| :--- | :--- | :--- |
| `AXON` | **AXON** | **Axon Layer** — 7-레이어 프로토콜 스택 · 층 지칭 시 **`AXON-AL1`…`AXON-AL7`** |
| `Cosmic` | **Cosmic** | **Cosmic Layer** — 의미·번역 축 · 구현 **CSIM** · Tier 지칭 시 **T1–T3** ([§3.2.2](#322-cosmic-layer--csim-개념-tier-t1t3)) |
| `CSIM` | **CSIM** | **Cosmic Layer** 구현체 — Cosmic Semantic Interface Matrix · **WILL/FACT ↔ Matrix 양방향 번역** ([§3.2.2](#322-cosmic-layer--csim-개념-tier-t1t3)) |
| `APEX` | **APEX** | **AXON-AL1** — 3×3(·2×2) **의미 매트릭스** · 3상 극성 · 패킷 Body |
| `HEXAGON` | **HEXAGON** | **AXON-AL2** — **5W1H 6축** Envelope · Zod 문법 ([§3.6](#36-omnix--협업--승인) 표) |
| `Coil-Balancer` | Coil Balancer | **AXON-AL3** — 페르소나 **Zero-sum** 가중치 · GOVERN |
| `NEXAON-Network` | NEXAON Network | **AXON-AL4** — 엣지 후보고 · 중앙 해석 · **Nexaon** |
| `NEXAVULT` | **NEXAVULT** | **AXON-AL5** — Seed·로그·벡터 이중 저장 · Ontex pgvector 연계 |
| `ACTON` | **ACTON** | **AXON-AL6** — 물리 **실행** Synapse · PWM · MQTT · **ACTON-GM** ⊂ **AXON-AL6** _(선택)_ |
| `ENVIRON-Shield` | ENVIRON Shield | **AXON-AL7** — 환경·복지 · Jitter 차단 · Nixie triage |

**Axon Layer 7층 (Normative · [TDD-043 §4](08_TDD/Cosmic/08_TDD_CSIM_AXON프로토콜_정본.md))**

| AXON-AL | 구성요소 | 역할 (한 줄) | Core Engine 연계 |
| :---: | :--- | :--- | :--- |
| **AL1** | **APEX Matrix** | 인간 입력 → Matrix 패킷 · 3상 극성 | **CSIM T1** 투영 |
| **AL2** | **HEXAGON Protocol** | 5W1H **6축** 정규화 문법 | **HEXAGON** Grammar Engine |
| **AL3** | **Coil Balancer** | 페르소나 **Zero-sum** 가중치 | GOVERN · Normex Ethos |
| **AL4** | **NEXAON Network** | 엣지 후보고 · 중앙 고차원 해석 | **Nexaon** · agent-graph |
| **AL5** | **NEXAVULT** | 벡터·로그 이중 저장 | **Ontex** · embed 코퍼스 |
| **AL6** | **ACTON Synapse** | 물리 실행 · **ACTON-GM** 선택 | ML0 **Reflex** · Hot Path |
| **AL7** | **ENVIRON Shield** | 환경·복지 · Jitter 차단 | Nixie triage · Normex |

**Cosmic Layer · Axon Layer · Core Engine (혼동 방지)**

| 구분 | Cosmic Layer | Axon Layer | Core Engine Stack |
| :--- | :--- | :--- | :--- |
| **질문** | Matrix **번역·정렬** 단계는 | **어떤 규격**으로 신호·의미·실행을 층층히 포장하나 | **누가** Cold Path 기능을 **실행**하나 |
| **번호** | **3 Tier** (지칭 **`T1`–`T3`**) | **7층** (층 지칭 **`AXON-AL1`–`AL7`**) | **6엔진** _(가변)_ |
| **관계** | **CSIM** 엔진이 Tier **번역** 수행 | CSIM·HEXAGON이 **AL1–AL2** 위에서 동작 | Cosmic·Axon **구현 주체** — Nexaon Run **✗** (번역만) |

> **표기 (Normative):** 신규·개정 SSOT 본문 = **Axon Layer** · 특정 층 지칭 시 **`AXON-AL1`** … **`AXON-AL7`** only. bare `L1`–`L7` · **`AL`** (축 ID) · `AXON-L*` · `AXON-S*` · `AXON-SL*` **deprecated**. **ML** = Menton Layer (층 ML0–ML3) — **번호 체계 별개**. **ML*** · **NISE-L*** · **TDD-071 L*** · Matrix 축 L1/L2 ([TDD-043 §6](08_TDD/Cosmic/08_TDD_CSIM_AXON프로토콜_정본.md)) 와 **동일 표기 금지**.

### 3.3 nexia — DIEA (Distillation Intelligence Engine Array · 7 Facet · `tabId` SSOT)

> **DIEA** (**Distillation Intelligence Engine Array**) — `nexia` 가 호스트하는 **7 Facet 지능 엔진 어레이**의 **공식 명칭**. **Nexaon** 이 Cold Path **Distillation** 을 오케스트레이션하고 Facet·Human 산출을 `ontex` 로 **고착** ([§3.3.1](#331-diea--nexaon--관계)). **구현 별칭:** `7Tab` · `7탭` · `tabId` — 문서·용어 SSOT 호칭은 **DIEA**. SSOT: [`TDD-071` §4](08_TDD/NEXAOS/08_TDD_NEXAOS_도메인구조통합_v1.0.md).

| tabId    | 태그       | 한글   | 역할                      | 대표 산출물                                                     |
| :------- | :------- | :--- | :---------------------- | :--------------------------------------------------------- |
| `omnix`  | `Omnix`  | 옴닉스  | 소통·허브·오케스트레이션·승인 중계     | `.nxchat`                                                  |
| `normex` | `Normex` | 노멕스  | Norm(규범)·정책·Tiptap 시방서  | `.nxpol`                                                   |
| `logex`  | `Logex`  | 로젝스  | 추론·관계·React Flow 워크플로   | `.nxflow` · **Nexaon**                                     |
| `scribx` | `Scribx` | 스크립스 | 코드·명세·Monaco            | `.nxcode`                                                  |
| `vivex`  | `Vivex`  | 비벡스  | 미디어·ComfyUI             | `.nxmedia`                                                 |
| `twinex` | `Twinex` | 트윈엑스 | 디지털 트윈·3D·ESPHome       | `.nxproj` `.nxdev` …                                       |
| `navex`  | `Navex`  | 네이벡스 | **플랫폼 전역** 자산 탐색·검색·릴레이 | 인덱싱 only · [§3.6.4](#364-navex--global-asset-index--상세-정의) |

- URL: `/nexia/{tabId}` · Nexaon canonical: `/nexia/logex/ontology/{projectId}` · deep link §3.4.1
- **풀네임:** Distillation Intelligence Engine Array — 문서·대화 **약칭** **DIEA**
- SSOT: [`TDD-010` §3.1](08_TDD/NEXIA/08_TDD_NEXIA_구조기술스택운영방침.md) · [`TDD-056`](08_TDD/NEXIA/08_TDD_NEXIA_7탭범위확정_v1.0.md)

#### 3.3.1 DIEA ↔ Nexaon — 관계

> **한 줄:** **DIEA** = `nexia` 의 **7 Facet 작업면 어레이** (무엇을·어디서 편집·생산하는가) · **Nexaon** = **Distillation 오케스트레이터** (Logex `ontology` — 어떻게 수집·Run·승인·고착으로 이어지는가). **Nexaon ∈ DIEA Facet ✗** · **Nexaon ⊂ nexia · Logex ontology ✓**.

| 구분 | **DIEA** | **Nexaon** |
| :--- | :--- | :--- |
| **정체** | Distillation Intelligence Engine Array — **7 Facet** (Omnix … Navex) | Logex **`ontology` 서브모드** 모듈 (`modules/nexaon/`) |
| **`tabId`** | **7 개** (`omnix` … `navex`) | **별도 `tabId` ✗** — canonical `/nexia/logex/ontology/{projectId}` |
| **역할** | Facet 별 **인지·산출** (채팅·Norm·Flow·코드·미디어·트윈·탐색) | **Cold Path** — `stateBus`·후보고·자산 **ingest → Run → graph_diff → 승인 → SHACL → promoted** |
| **LangGraph** | Facet 별 Run (예: Logex `.nxflow`) | **온톨로지 정재 Run** · `nexaon_ingest` / `nexaon_refine` **주 orchestration** |
| **Distillation 산출** | **각 Facet** → `ontex` (`Distillation 산출`) | **정제 루프 완료** → `promoted` 후보 → `ontex` 고착 ([§3.4.1](#341-nexaon--상세-정의)) |
| **Hot Path** | Normex·Logex 등 → `erp` **직주입** (archive **우회**) | Run·promoted **✗** — 실행·ERP 주입은 Facet·ERP 축 |

**협업 (Distillation 루프 — Normative)**

```text
stateBus · 엣지 후보고 · Human 편집
        │
        ▼
   nexia (domainKey)
        │
        ├── DIEA Facet ── 산출·편집·Hot Path (Normex→erp …)
        │
        └── Nexaon (Logex ontology) ── ingest · LangGraph Run · graph_diff
                    │
                    ├── Omnix ── 승인 · diff accept
                    ├── Normex ── 규범·시방서 참조
                    └── SHACL ── promoted ──► Ontex 고착
```

- **DIEA** Facet 산출은 **never 직접 promoted** — Nexaon 루프·승인·SHACL **경유** ([`TDD-071` §2.1.2](08_TDD/NEXAOS/08_TDD_NEXAOS_도메인구조통합_v1.0.md) · [`TDD-057` §7](08_TDD/Ontex/08_TDD_Ontex_기술스택운영방침_v1.0.md)).
- **Nexaon** 은 DIEA **대체·별도 domainKey ✗** — Logex 탭 **안의** 정제 오케스트레이션 층.
- **Omnix** 는 Nexaon Run **승인 게이트** — DIEA Facet 이자 Distillation 루프 **허브** ([§3.6](#36-omnix--협업--승인)).

**관련 SSOT:** [`TDD-071` §4·§2.1.2](08_TDD/NEXAOS/08_TDD_NEXAOS_도메인구조통합_v1.0.md) · [`TDD-056` §4](08_TDD/NEXIA/08_TDD_NEXIA_7탭범위확정_v1.0.md) · [TDD-068 §1.6.5](08_TDD/NEXIA/08_TDD_NEXIA_IoT엣지데이터파이프라인_HEXAGON_Nexaon연계_v1.0.md)

### 3.4 nexia — 명칭 구분 (혼동 방지)

| 태그            | 표기          | 정체                                             | 금지 혼동              |
| :------------ | :---------- | :--------------------------------------------- | :----------------- |
| `nexia`       | **nexia**   | UI **`domainKey`** · `domains/nexia/` — **핵심 지능 셸** · **DIEA** 호스트 ([§3.4.0](#340-nexia--domainkey-정의)) | NEXAON 프로젝트명 · **NEXIA** 표기와 혼동 |
| `DIEA`        | **DIEA** (Distillation Intelligence Engine Array) | nexia 내 **7 Facet** 어레이 (Omnix … Navex) · Facet 별 Distillation **산출** | `7Tab`/`7탭` SSOT 표기 ✗ · `domainKey` ✗ · Nexaon **과 동일시 ✗** ([§3.3.1](#331-diea--nexaon--관계)) |
| `Nexaon`      | **Nexaon**  | Logex **`ontology` 서브모드** — DIEA **Distillation 오케스트레이터** · Human↔LLM **온톨로지 정재** (§3.4.1) | 별도 `domainKey` ✗ · **`tabId` ✗** (8 번째 탭 ✗) · DIEA Facet **아님** · LangGraph Run **✓** ([§3.3.1](#331-diea--nexaon--관계)) |
| `NexaonShell` | NexaonShell | Nexaon 3 분할 작업면 셸 (ExplorerTree · GraphCanvas · RunPanel) | MainShell ✗        |
| `NEXIA`       | NEXIA       | 제품·문서 도메인 라벨 (대문자)                             | `nexia` 코드키와 별도 표기 |
| `LangGraph`   | LangGraph   | 기술 스택·`08_TDD/LangGraph/`                      | domainKey ✗        |
| `ontex`       | **Ontex**   | 온톨로지 **domainKey**                             | nexia Logex 와 별도   |

#### 3.4.0 nexia — domainKey 정의

> **한 줄:** 플랫폼 **핵심 지능 셸** · **DIEA** (Distillation Intelligence Engine Array) — **Nexaon** 오케스트레이터가 **가변적 DIEA Facet** (7 + _(Extended)_) 을 구동·연계하여 **`stateBus` 런타임 상태**를 **정제 (Distillation)**.

| 항목 | 내용 |
| :--- | :--- |
| **셸** | MainShell **Content** — TabBar · Workspace · **DIEA** Facet 전환 ([§3.5](#35-nexia--ui-셸--레이아웃)) |
| **DIEA** | Distillation Intelligence Engine Array — 7 Facet + 확장 슬롯 ([§3.3](#33-nexia--diea-distillation-intelligence-engine-array--7-facet--tabid-ssot)) |
| **Nexaon** | **Distillation 오케스트레이터** — ingest · Run · 승인 · promoted ([§3.3.1](#331-diea--nexaon--관계) · [§3.4.1](#341-nexaon--상세-정의)) |
| **입력** | **`stateBus`** 런타임 이벤트 — `ontex`·`erp` **직접 ingest ✗** ([`TDD-071` §2.1.2](08_TDD/NEXAOS/08_TDD_NEXAOS_도메인구조통합_v1.0.md)) |
| **출력** | **Cold:** `ontex` 고착 · **Hot Path:** Normex·Logex 등 → `erp` → 현장 (Distillation **우회** — [`TDD-071` §2.1.1](08_TDD/NEXAOS/08_TDD_NEXAOS_도메인구조통합_v1.0.md)) |

**가변적 Facet:** 고정 **7 `tabId`** (Omnix … Navex) + **`_(Extended)_`** 슬롯 — Nexaon Run·Omnix 승인·작업 맥락에 따라 **활성 Facet·서브모드**가 달라짐 (**8 번째 `tabId` ✗**).

#### 3.4.1 Nexaon — 상세 정의

> **한 줄:** Logex **`ontology` 서브모드** · **ML3 지능 루프** — Human↔LLM **지식·온톨로지 정재** (`modules/nexaon/` · `apps/agent-graph`). **`tabId` · `domainKey` ✗** · LangGraph Run **✓**. **DIEA** 와의 관계: [§3.3.1](#331-diea--nexaon--관계).

**DIEA 와의 관계 (요약)**

| 항목 | 내용 |
| :--- | :--- |
| **포함 관계** | Nexaon ⊂ **nexia** · Logex **`ontology`** — **DIEA 7 Facet 에 포함되지 않음** |
| **역할 분담** | **DIEA** = Facet **작업면·산출** · **Nexaon** = Cold Path **정재·Run·promoted** 오케스트레이션 |
| **진입 UI** | **NexaonShell** — Logex ontology **canonical home** ([`TDD-056` §4.1](08_TDD/NEXIA/08_TDD_NEXIA_7탭범위확정_v1.0.md)) |
| **연동 Facet** | **Omnix** 승인 · **Normex** 규범 · **Twinex**·**Navex** deep link · **Logex default**(`.nxflow`) 와 **별도** |

| 항목 | SSOT |
| :--- | :--- |
| **UI** | **NexaonShell** — ExplorerTree · GraphCanvas · RunPanel |
| **Canonical URL** | `/nexia/logex/ontology/{projectId}` — UI **집 주소** ([`TDD-056` §4.1](08_TDD/NEXIA/08_TDD_NEXIA_7탭범위확정_v1.0.md)) |
| **협업·Run** | Yjs `ontology:draft` · `nexaon_ingest` / `nexaon_refine` · **Omnix** 승인 · **SHACL** → **promoted** |
| **저장** | Yjs → Draft → Audit → Neo4j ([`TDD-008` §2.4](08_TDD/LangGraph/08_TDD_LangGraph_인간LLM협업형IoT온톨로지플랫폼_v1.0.md)) |

**ML3 역할:** 후보고·자산 **수집·매핑** → Run · `graph_diff` → Normex·승인 → SHACL → **promoted** (미검증 JSON → Ontex **✗**).

**진입 (Normative)** — **UI home · deep link · 엣지 후보고** 3 종. 동일 **`NexaonShell`** · Yjs room · Run graph.

| 축 | 출발 | Nexaon 연결 |
| :--- | :--- | :--- |
| **① 엣지 후보고** | Sentinel · `candidate:true` Envelope | Nest → **`nexaon_ingest`** (Logex **선행 ✗**) |
| **② nexabo** | Live Feed · 알람 | 큐 · correlate → ingest / **「정재 열기」** deep link |
| **③ Twinex** | `.nxdev` · 진단 | `device_id` → ExplorerTree 프리로드 |
| **④ Logex** | `logexSubMode: ontology` | **canonical home** · 수동 편집·Run |
| **⑤ Omnix** | 승인 · `graph_diff` | RunPanel · GraphCanvas (Diff accept) |
| **⑥ Navex** | 자산 선택 | class/asset/pin 컨텍스트 jump |

| ingest 모드 | 조건 | 동작 |
| :--- | :--- | :--- |
| **Auto** | critical · STUCK · 정책 매칭 | Omnix/router → `nexaon_ingest` |
| **Queue** | Normal 후보고 | staging 큐 → nexabo/Nixie 알림 → Human 정재 |
| **Buffer** | 고빈도 TICK | Live Feed 만 · Run 은 배치/임계치 |

**경계:** **Ontex** = promoted 허브 · **Nixie** = 결과 **표현** (Run ✗) — [§3.6.1](#361-nixie--nixie--상세-정의) · **nexabo** = 관제 UI · **Logex default** = `.nxflow` (ontology 와 별도).

**관련 SSOT:** [`TDD-056` §4.1](08_TDD/NEXIA/08_TDD_NEXIA_7탭범위확정_v1.0.md) · [`TDD-008`](08_TDD/LangGraph/08_TDD_LangGraph_인간LLM협업형IoT온톨로지플랫폼_v1.0.md) · [`TDD-057` §7](08_TDD/Ontex/08_TDD_Ontex_기술스택운영방침_v1.0.md) · [TDD-068 · IoT 엣지…](08_TDD/NEXIA/08_TDD_NEXIA_IoT엣지데이터파이프라인_HEXAGON_Nexaon연계_v1.0.md) §1.6.5

### 3.5 nexia — UI 셸 · 레이아웃

| 태그                             | 표기                    | 정의                                          |
| :----------------------------- | :-------------------- | :------------------------------------------ |
| `NexiaContent`                 | NexiaContent          | nexia Content 슬롯 루트 (TabBar+Workspace)      |
| `NexiaWorkspace`               | NexiaWorkspace        | Content 3 층 (L1 2-pane · L2 split · L3 PiP) |
| `NexiaTabBar`                  | NexiaTabBar           | 6 탭 스트립 (omnix 제외·레일)                       |
| `tabId`                        | tabId                 | nexia 탭 식별자                                 |
| `subPaneId`                    | subPaneId             | 탭 내 서브패널·다중 창 ID                            |
| `panelId`                      | panelId               | PiP·detach 대상 패널 ID                         |
| `OmnixRail`                    | OmnixRail             | L1 좌측 Omnix 고정 레일                           |
| `Global-Navex`                 | **Global Navex**      | Right Drawer 상시 **플랫폼 전역** 탐색 플러그인           |
| `Navex`                        | **Navex**             | `tabId=navex` 전체 화면 **Global Asset Index** 탭   |
| `GlobalFileExplorer`           | GlobalFileExplorer    | Navex 공통 파일·자산 탐색 엔진 (트리·목록·뷰어)           |
| `Global-Asset-Index`           | Global Asset Index    | Navex 가 노출하는 **플랫폼 전역** `files` 통합 인덱스 뷰   |
| `InfraTree`                    | InfraTree             | Navex Left — **origin → domain → device** 인프라 트리 |
| `Project-Explorer`             | Project Explorer      | Left Drawer — **`project_id` 고정** 프로젝트 탐색 (Navex ✗) |
| `Intelligent-Explorer`         | Intelligent Explorer  | Navex **지능형** — **NISE** · 개인화 · [`PRD-014`](05_PRD/NEXIA/05_PRD_NEXIA_Navex이중탐색모드지능형탐색_v1.0.md) |
| `Navex-Search-Engine`          | Navex Search Engine   | Intelligent Navex **서버 검색 엔진** — Global Asset Index hybrid retrieval · RRF · Personalization rerank. **약칭 = `NISE`** ([§3.6.4](#364-navex--global-asset-index--상세-정의)) |
| `NISE`                         | **NISE**              | **N**avex **I**ntelligent **S**earch **E**ngine — `Navex-Search-Engine` **공식 약칭**. L0–L5 hybrid · `POST /api/v1/navex/search*` · **≠ Omnix** · **≠ Ontex Graph RAG** ([`PRD-014` §2.3.1](05_PRD/NEXIA/05_PRD_NEXIA_Navex이중탐색모드지능형탐색_v1.0.md)) |
| `Personalization-Profile`    | Personalization Profile | 사용자 Taste·Trace·Focus·Negative — zero-query·ranking SSOT |
| `Infra-Explorer`              | Infra Explorer       | Navex **인프라** 모드 — InfraTree·facet·lexical `q` · `navexExploreMode: infra` ([`UIX-002`](07_UIUX/07_UIUX_NEXIA_탐색기UI전략.md)) |
| `Relational-File-View`       | Relational File View  | 지능형 — 선택 허브 + **연관 파일** orbit · pivot |
| `asset-origin`                 | asset-origin          | 자산 **출처** 축 — upload · edge · docs · market …   |
| `navexCategory`                | navexCategory         | Navex **파일 종류** facet — code · config · nx-* …  |
| `NexiaExplorerPanel`           | NexiaExplorerPanel    | 탐색기 + 액션바 래퍼                                |
| `useGlobalFileExplorer`        | useGlobalFileExplorer | 탐색기 상태·API 훅                                |
| `GraphCanvas`                  | GraphCanvas           | Nexaon React Flow 캔버스                       |
| `ExplorerTree`                 | ExplorerTree          | Nexaon Left 클래스·자산 트리                       |
| `RunPanel`                     | RunPanel              | LangGraph Run·SSE 타임라인                      |
| `Left-Drawer` / `Right-Drawer` | Left / Right Drawer   | MainShell 측면 패널                             |
| `PiP`                          | PiP                   | Picture-in-Picture 패널 분리                    |
| `UI-L0` …                      | UI-L*                 | MVP UI 구현 단계 (PRD-001)                      |

SSOT: [`UIX-004`](07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md).

### 3.6 Omnix · 협업 · 승인

| 태그              | 표기            | 정의                                                                                                                                                                                                                                                                        |
| :-------------- | :------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NIXIE`         | NIXIE         | **ML1 전방 Presence** — **NEXU Canvas · BAX · 전 `domainKey`** 를 **포함**해 상태·경고·정서 **Express** · Canvas/BAX **대체 ✗** · Run **소유 ✗** ([§3.2.1](#321-nexa-intelligence-stack-ML0ML3) · [§3.6.1](#361-nixie--nixie--상세-정의) · [§3.6.3](#363-플랫폼-ui-3층--nexu-canvas--bax--nixie)). |
| `Nixie`         | Nixie         | **NIXIE** 제품·UI·채널 표기 — **4 Shell 채널** ([§3.6.1](#361-nixie--nixie--상세-정의) · [§3.6.2](#362-nixie-shell-채널--4-forms))                                                                                                                                                      |
| `NEXU Canvas`   | NEXU Canvas   | 온톨로지·Knowledge OS **데이터 페브릭** 시맨틱·예술 **뷰** — Home(또는 전용 도메인) **풀 뷰** · **BAX 혼용 ✗** ([§3.6.3](#363-플랫폼-ui-3층--nexu-canvas--bax--nixie) · [`TDD-045` §6](08_TDD/Knowledge/08_TDD_Knowledge_디렉토리책임및기획자원경로.md)).                                                             |
| `BAX`           | BAX           | **미적 레이아웃 표현 엔진** — 데이터·인터랙션→배치·호흡·void · **전 `domainKey`** · **NEXU Canvas 혼용 ✗** ([§3.6.3](#363-플랫폼-ui-3층--nexu-canvas--bax--nixie) · [`UIX-003`](07_UIUX/07_UIUX_BAX_미학적인터페이스UX아키텍처.md)).                                                                              |
| `HEXAGON`       | HEXAGON       | **AXON-AL2** — 5W1H·의미 축 Envelope · [§3.2.3](#323-axon--cosmic-language-프로토콜)                                                                                                                                                                                             |
| `NEXNAP`        | NEXNAP        | 시스템 인터페이스·Envelope 규약                                                                                                                                                                                                                                                     |
| `Envelope`      | Envelope      | 탭·actor·payload 표준 메시지 래퍼                                                                                                                                                                                                                                                 |
| `approval-gate` | approval-gate | 승인 A/B/C 게이트                                                                                                                                                                                                                                                              |
| `GOVERN`        | GOVERN        | 룰·프롬프트 거버넌스                                                                                                                                                                                                                                                               |
| `ASK` / `VOID`  | ASK / VOID    | 미정·보류 처리 (PRD-003)                                                                                                                                                                                                                                                        |
| `VOID-BOX`      | VOID-BOX      | VOID 보관 UI                                                                                                                                                                                                                                                                |
| `DEFERRED`      | DEFERRED      | 연기된 결정 상태                                                                                                                                                                                                                                                                 |

#### 3.6.1 NIXIE · Nixie — 상세 정의

> **한 줄:** **ML1 전방 Presence** — **NEXU Canvas · BAX · 전 `domainKey`** 를 **포함**해 **결과·상태·경고·정서** Express. **Canvas/BAX 대체·병합 ✗** · **Run · Router · MQTT · promoted 소유 ✗**.

| 항목 | SSOT |
| :--- | :--- |
| **레이어** | **ML1 Presence** — **`domainKey` 무관** · 4 Shell 채널 ([§3.2.1](#321-nexa-intelligence-stack-ML0ML3) · [§3.6.2](#362-nixie-shell-채널--4-forms)) |
| **표기** | **`NIXIE`** / **`Nixie`** (브랜드 **NEXA NIXIE · 닉시**) |
| **연결 범위** | **NEXU Canvas · BAX · ML2 · 엣지** — [§3.6.3](#363-플랫폼-ui-3층--nexu-canvas--bax--nixie) |
| **Shell** | Web · Desktop · Mobile · Physical · `effective_project_id` · Self 동기화 |
| **Reflex (ML1 한정)** | 긴급도 · 조용/발화 · Express **채널** 선택 — **Run ✗** |

**ML1 역할:** **지능의 얼굴** · **플랫폼 전방 인터페이스** — Canvas·BAX·Omnix·Router 신호 **Express**. **지능 원천 ✗** — **Nexaon · Omnix · agent-graph**.

**플랫폼 UI 와의 관계 (혼동 방지)**

| 대상 | NIXIE 와 | NIXIE 가 하지 않음 |
| :--- | :--- | :--- |
| **NEXU Canvas** | confidence → **Jitter·TTS** | 페브릭 **렌더 ✗** |
| **BAX** | void·Alarm → **Reflex triage** | LayoutPolicy **✗** |
| **7 탭·nexabo** | 알림·승인 **연계** | Run·라우팅 **✗** |
| **4 Shell** | **Express** 구현체 | 개념 ≠ Web Shell 하나 |
| **Sentinel · ACTON** | ML0 이후 **알림** | 물리 Reflex **✗** |

**Nixie Reflex vs Nexaon Strategic (Normative)**

| 구분 | Nixie (ML1) | Nexaon / Omnix (ML3) |
| :--- | :--- | :--- |
| **입력** | bus · SSE · 큐 알림 · confidence | `nexaon_ingest` · Envelope · Human 승인 |
| **처리** | Reflex triage · 표현·알림 | Run · `graph_diff` · SHACL → **promoted** |
| **출력** | TTS · PiP · Jitter · Awareness | Draft · Audit · Neo4j · Ontex |

**진입·연계 (Normative)**

| 축 | 출발 | Nixie 연결 |
| :--- | :--- | :--- |
| **① Queue 알림** | Normal 후보고 · staging | nexabo/**Nixie** 알림 → Human **「정재 열기」** ([§3.4.1](#341-nexaon--상세-정의)) |
| **② Omnix·Run 상태** | GlobalFlow · Crew/Solo | MainShell **NIXIE** 시각화 계층 ([`UIX-004` §4.6](07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md)) |
| **③ IoT uplink** | Event Router fan-out | 요약·TTS·Jitter — **Run 트리거 ✗** ([TDD-068 §1.4](08_TDD/NEXIA/08_TDD_NEXIA_IoT엣지데이터파이프라인_HEXAGON_Nexaon연계_v1.0.md)) |
| **④ Self·정서** | `nexa_self_*` · 6-COILS | 정서 **Express** ([`TDD-045` §5](08_TDD/Knowledge/08_TDD_Knowledge_디렉토리책임및기획자원경로.md)) |
| **⑤ NEXU Canvas** | confidence · Why Chain | **Jitter·Awareness** — Canvas **렌더 ✗** ([§3.6.3](#363-플랫폼-ui-3층--nexu-canvas--bax--nixie)) |
| **⑥ BAX** | void · AlarmState | **Reflex triage** — Layout **✗** ([`UIX-003`](07_UIUX/07_UIUX_BAX_미학적인터페이스UX아키텍처.md)) |

**금지 (Normative):** LangGraph Agent · Run **트리거** · Event Router **fan-out** · MQTT **직접 publish** · promoted·Neo4j **쓰기** · **NEXU Canvas/BAX 대체·병합** · NexaonShell·7 탭 **대체** ✗.

**관련 SSOT:** [`TDD-045` §6](08_TDD/Knowledge/08_TDD_Knowledge_디렉토리책임및기획자원경로.md) · [`UIX-003`](07_UIUX/07_UIUX_BAX_미학적인터페이스UX아키텍처.md) · [`TDD-010` §3.1](08_TDD/NEXIA/08_TDD_NEXIA_구조기술스택운영방침.md) · [`UIX-004` §4.6](07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md) · [§3.6.2](#362-nixie-shell-채널--4-forms) · [§3.6.3](#363-플랫폼-ui-3층--nexu-canvas--bax--nixie)

#### 3.6.2 Nixie Shell 채널 — 4 Forms

> **한 줄:** **동일 NIXIE(ML1)** 가 사용자 앞에 서는 **4 가지 독립 Shell 채널**. 지능·Run 은 공유 · **표현·입력 표면** 만 다름. **PiP** 는 ①의 **표현 모드**이지 5 번째 채널 **✗**.

**공통 (Normative)**

| 원칙 | 내용 |
| :--- | :--- |
| **정체** | 4 채널 모두 **Nixie (ML1 Presence)** — Nexaon·Omnix·Router **결과 수신·표현** · Run·promoted **✗** |
| **동기화** | `effective_project_id` · Self(`nexa_self_*`) · confidence→Jitter · Envelope/SSE/WS **동일 계약** |
| **동시 활성** | Web + Physical 등 **복수 채널** 동시 가능 — Reflex triage 가 **어느 표면**에 Express 할지 선택 |
| **M2P** | Desktop·Physical 은 **BAX M2P** 실시간 의지 입력 채널 ([`UIX-BAX` §2.8](07_UIUX/07_UIUX_BAX_미학적인터페이스UX아키텍처.md)) |

| # | 태그 | 표기 | 형태 | 구현·전환 | SSOT |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **①** | `NixieWebShell` | **Nixie Web Shell** | nexia **브라우저** MainShell **frame** 내 **레이어** (P5 · Rive · NIXIE 시각화) | **Document PiP** 로 **detach** — Master–Slave handover · 탭 밖 **항상 -on** · 마이크/VAD 유지 | [`TDD-061`](08_TDD/NEXIA/Nixie/08_TDD_NIXIE_WebShell_v1.0.md) |
| **②** | `NixieDesktopShell` | **Nixie Desktop Shell** | **Python** 기반 **PC 독립** 얼굴 (트레이·전용 창·always-on-top) | 브라우저 **탭 종속 ✗** · 플랫폼과 **WS/SSE** · 로컬 TTS/마이크 · M2P uplink | [`TDD-062`](08_TDD/NEXIA/Nixie/08_TDD_NIXIE_DesktopShell_v1.0.md) |
| **③** | `NixieMobileShell` | **Nixie Mobile Shell** | **iOS/Android** 네이티브·크로스플랫폼 **앱** | 푸시·백그라운드 VAD/OS PiP 제약 · 동일 Envelope 구독 | [`TDD-063`](08_TDD/NEXIA/Nixie/08_TDD_NIXIE_MobileShell_v1.0.md) |
| **④** | `NixiePhysicalShell` | **Nixie Physical Shell** | **ESP32 · Raspberry Pi** 등 **하드웨어 독립** 실물 (LED · 닉시관 · Ambient) | M2P · Serial · WS · **브라우저/PC 불요** · 플랫폼 **오프라인 시** 로컬 Reflex **한정** | [`TDD-064`](08_TDD/NEXIA/Nixie/08_TDD_NIXIE_PhysicalShell_v1.0.md) |

**Web Shell 표현 모드 (① 내부 — 5 번째 채널 ✗)**

| 모드 | UI | 전환 |
| :--- | :--- | :--- |
| **Embedded** | MainShell **ML1 frame** · Omnix 레일과 **공존** | 기본 |
| **PiP** | **Document Picture-in-Picture** · 탭 밖 floating | Embedded ↔ PiP **양방향** · `voiceState.master` handover |

**혼동 방지 (Normative)**

| 대상                      | 관계                                                                   |
| :---------------------- | :------------------------------------------------------------------- |
| **NEXU Canvas**         | **별도 시맨틱 레이어** — Home **풀 뷰** · 타 도메인 **슬라이스** · NIXIE **체감 연결** · Canvas **렌더 ≠ Nixie Shell** |
| **7 탭·nexabo**          | ML2 업무 UI — Nixie **Express 대상** · 라우팅·Run **✗**                                            |
| **Nano/Micro-Sentinel** | ML0 **센서·ACTON·후보고** — Physical Shell **얼굴 연출 ✗** (동일 보드여도 **역할 분리**) |
| **Twinex·ESPHome 편집기**  | 디바이스 **설정·플래시** UI — Nixie Physical Shell **런타임 표현** 과 별도            |

**채널 선택 (Reflex triage):** 긴급도 · 사용자 시선·활성 디바이스 · `nexa_self_*` → **Express** 대상 채널 (①~④) 결정 — 라우팅·Run **✗**.

#### 3.6.3 플랫폼 UI 3 층 — NEXU Canvas · BAX · NIXIE

> **한 줄:** **의미 (NEXU) · 배치 (BAX) · 대면 (NIXIE)** — **서로 병합 ✗** · **NIXIE** 가 세 층 **포함** 전역 **Express**.

```text
  Knowledge OS · Ontex · promoted …  ← 데이터 원천
              │
              ▼
       NEXU Canvas   What/Why — 온톨로지·페브릭·Why Chain (예술·서사)
              │
              ▼
            BAX         How sit — Grid·void·ASR·RuleGuard (미적 레이아웃)
              │
              ▼
         ML2 Domain Content — nexia DIEA · erp · Ontex …
              ▲
              │  TTS · Jitter · 알림 · Reflex triage
            NIXIE (ML1)   전방 Presence — 위 층 **포함** 연결·Express
```

| 층 | 태그 | 역할 | Canonical mount | 금지 |
| :--- | :--- | :--- | :--- | :--- |
| **NEXU Canvas** | `NEXU Canvas` | 온톨로지·Knowledge **데이터 페브릭**을 **종합·예술적** 표현 (P5/Three/D3 · Fractal zoom) | **`domainKey: home`** Content **풀 뷰** (또는 전용 도메인) | BAX LayoutPolicy **소유 ✗** · 대시보드 **장식 ✗** |
| **BAX** | `BAX` · `VirtualCanvas` | 사용자·데이터·긴급도→**어디·어떤 호흡·밀도**로 배치 | **전 `domainKey`** (MainShell 하위) | Why Chain·온톨로지 **지도 ✗** · **NEXU Canvas 혼용 ✗** |
| **NIXIE** | `NIXIE` · `Nixie` | Canvas·BAX·ML2·엣지 **포함** **ML1 전방** Express | **4 Shell 채널** · frame **항상 -on** | Canvas/BAX **대체 ✗** · Run·Router **✗** |

**`VirtualCanvas` ≠ `NEXU Canvas` (Normative)**

| | **NEXU Canvas** | **BAX VirtualCanvas** |
| :--- | :--- | :--- |
| **질문** | 무엇이 · 왜 연결되는가 | 어디에 · 얼마나 여백·밀도로 |
| **데이터** | IND→SNT→Doc · Capability · confidence | MAE · void_ratio · LayoutPolicy |
| **SSOT** | [`TDD-045` §6](08_TDD/Knowledge/08_TDD_Knowledge_디렉토리책임및기획자원경로.md) | [`UIX-003`](07_UIUX/07_UIUX_BAX_미학적인터페이스UX아키텍처.md) |

**타 도메인:** NEXU Canvas = **컨텍스트 슬라이스** · inset · deep link — BAX·NIXIE 는 **동일** 가동. **Nexaon GraphCanvas** = 편집·Run·Yjs — NEXU Canvas = **탐험·서사** (뷰 모드 분리 권장).

**관련 SSOT:** [`TDD-045` §6~6.1](08_TDD/Knowledge/08_TDD_Knowledge_디렉토리책임및기획자원경로.md) · [`UIX-003`](07_UIUX/07_UIUX_BAX_미학적인터페이스UX아키텍처.md) · [`UIX-006`](07_UIUX/07_UIUX_NEXA_통합레이아웃구조규격.md) · [`TDD-061`](08_TDD/NEXIA/Nixie/08_TDD_NIXIE_WebShell_v1.0.md)

#### 3.6.4 Navex · Global Asset Index — 상세 정의

> **한 줄:** **`tabId=navex`** · **Global Navex** — **`NISE`** + **Personalization Profile** 로 **플랫폼 전역** 자산 **발견**. Intelligent = **검색 중심** · Infra = InfraTree.

| 항목 | SSOT |
| :--- | :--- |
| **검색 엔진 (`NISE`)** | **NISE** = **N**avex **I**ntelligent **S**earch **E**ngine — 태그 `Navex-Search-Engine` 과 **동일 정체**. lexical · semantic · structured · relational · **personal rerank** · API `POST /api/v1/navex/search*` ([`PRD-014` §3](05_PRD/NEXIA/05_PRD_NEXIA_Navex이중탐색모드지능형탐색_v1.0.md) · [`TDD-065` §9](08_TDD/NEXIA/08_TDD_NEXIA_Navex탐색APIFacet계약_v1.0.md)) |
| **개인화** | **Personalization Profile** — Trace · Taste · Focus · Zero-query ([`PRD-014` §5](05_PRD/NEXIA/05_PRD_NEXIA_Navex이중탐색모드지능형탐색_v1.0.md)) |
| **UI 표면** | **Navex** 탭 · **Global Navex** — intelligent **검색바 Hero** · infra `GlobalFileExplorer` |
| **데이터** | `files` + `file_references` · docs 루트 · edge ingest · (P1) nexet 설치본 |
| **범위** | **전 `domainKey`** — 생성·업로드·DB 등록 자산 |
| **Left (Navex)** | **InfraTree** — `origin` → `domainKey` → `device` |
| **Right** | ConnectionLog ◐ |

**Project Explorer vs Navex (Normative)**

| | **Project Explorer** | **Navex** |
| :--- | :--- | :--- |
| **위치** | Left Drawer | Navex 탭 · Global Navex |
| **스코프** | `project_id` **고정** | **전역** — facet·검색 |
| **질문** | 이 프로젝트 작업물? | 플랫폼 전체에서 어디? |
| **≠** | Navex **대체 ✗** | 프로젝트 UI **대체 ✗** |

**P0 `navexCategory`:** `nx-*` · documents · **code** · **config** · media · **edge-ingest**.

**`asset-origin`:** `upload` · `edge` · `docs` · `generated` · `web` · `memo` · `market` · `market-remote`(P2, 검색만).

| origin | 예 |
| :--- | :--- |
| `edge` | ESP32/RPi ingest — log · yaml · json (`metadata.device_id`) |
| `market` | nexet **설치된** 템플릿·패키지 (read-only) |
| `docs` | nexa-docs · platform-docs (internal/external) |

**혼동 방지**

| 대상                | Navex · NISE                                     | Navex · NISE ✗                                                                                                 |
| :---------------- | :----------------------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| **Omnix**         | **발견 intent** → `navex_search` tool · trace feed | 대화·승인·ranking **대체** · 자체 DB 검색 **✗** ([`PRD-014` §2.3.1](05_PRD/NEXIA/05_PRD_NEXIA_Navex이중탐색모드지능형탐색_v1.0.md)) |
| **Vivex 미디어 탭**   | 전역에서 **찾기**                                      | `domain=nexia` **전용 갤러리**                                                                                      |
| **Ontex/explore** | 파일 **조회·릴레이** · deep link                        | Graph RAG **전용 UI** · promoted **대체 ✗**                                                                        |
| **erp**           | 첨부·export **탐색**                                 | 부품 **마스터 편집**                                                                                                  |
| **nexet**         | 설치본 **미리보기**                                     | 구독·설치 **유통 UI**                                                                                                |
| **MQTT live**     | —                                                | **파일 아님** → nexabo/Twinex                                                                                      |

**필터 · 검색:** intelligent — **NISE** (hybrid + personal) · infra — facet + lexical ([`TDD-065`](08_TDD/NEXIA/08_TDD_NEXIA_Navex탐색APIFacet계약_v1.0.md)).

**NISE 명명 (Normative)**

| 표기 | 사용 |
| :--- | :--- |
| **`NISE`** | 문서·대화·다이어그램 **약칭** · Omnix·Ontex 와 **구분** |
| **`Navex-Search-Engine`** | `terms_nexa` · 코드·API·tool name (`navex_search`) |
| **Navex Search Engine** | UI·PRD **풀네임** (공백) |
| **✗** | `Nixie` · `Nexaon` · Omnix chat 검색 — **별개** |

**Infra-Explorer 명명 (Normative)**

| 표기 | 사용 |
| :--- | :--- |
| **`Infra-Explorer`** | `terms_nexa` · UI·PRD **모드명** (Intelligent 와 대칭) |
| **`infra`** | `settings.nexia.navexExploreMode` enum 값 |
| **Infra Explorer** | UI·대화 **풀네임** (공백) |

**Omnix 연동:** Discover intent → agent-graph tool **`navex_search`** → **NISE** API — ranking **재계산 ✗** ([`PRD-014` §2.3.2](05_PRD/NEXIA/05_PRD_NEXIA_Navex이중탐색모드지능형탐색_v1.0.md)).

**관련 SSOT:** [`TDD-056` §5.7](08_TDD/NEXIA/08_TDD_NEXIA_7탭범위확정_v1.0.md) · [`PRD-014`](05_PRD/NEXIA/05_PRD_NEXIA_Navex이중탐색모드지능형탐색_v1.0.md) · [`TDD-065`](08_TDD/NEXIA/08_TDD_NEXIA_Navex탐색APIFacet계약_v1.0.md) · [`TDD-010` §3.3](08_TDD/NEXIA/08_TDD_NEXIA_구조기술스택운영방침.md) · [`PRD-008`](05_PRD/NEXIA/05_PRD_NEXIA_웹탐색기문서폴더연동.md) · [`UIX-002`](07_UIUX/07_UIUX_NEXIA_탐색기UI전략.md) · [`PRD-010`](05_PRD/NEXIA/05_PRD_NEXIA_워크스페이스웹서치자원전략.md) §3.6

### 3.7 데이터 · 파일 · Identity

| 태그 | 표기 | 정의 |
| :--- | :--- | :--- |
| `files` | files | 업로드 파일 DB 테이블 |
| `file_references` | file_references | 도메인·프로젝트별 파일 참조 (**전 `domainKey`**) |
| `asset-origin` | asset-origin | Navex 출처 facet — upload · edge · docs · market … ([§3.6.4](#364-navex--global-asset-index--상세-정의)) |
| `navexCategory` | navexCategory | Navex 종류 facet — code · config · nx-* · edge-ingest … |
| `file_embeddings` | file_embeddings | 파일 벡터 인덱스 |
| `source_metadata` | source_metadata | AI 추출 메타 (PRD-013) |
| `nexa-docs` | nexa-docs | 문서 폴더 노드 ID (PRD-008) |
| `identity_id` | identity_id | Knowledge OS 영혼 원장 ID |
| `nexa_identities` | nexa_identities | Identity 테이블 |
| `anchor_id` | anchor_id | 자산 논리 고정 주소 |
| `graph_id` | graph_id | Nexaon·Run 그래프 식별 |
| `run_id` | run_id | LangGraph 실행 ID |
| `project_yjs_updates` | project_yjs_updates | Yjs 스냅샷 persist |
| `yjs_state` | yjs_state | Yjs 바이너리 상태 |
| `Knowledge-OS` | Knowledge OS | 용어·벡터·감사 체계 |

### 3.8 IoT · 제품 모듈

| 태그 | 표기 | 정의 |
| :--- | :--- | :--- |
| `NEXA-CELL` | NEXA-CELL | ESPHome YAML·웹 펌웨어 제품 |
| `Twinex` | Twinex | tabId·디지털 트윈 (§3.4) |
| `Physical-AI` | Physical AI | 물리 세계 +AI 융합 (BRD) |
| `Physical-AI-Ops` | Physical AI Ops | 산업 운영 단계 포지셔닝 |
| `digital-twin` | digital twin | Twinex 도메인 개념 |
| `edge` / `edge-device` | edge | 엣지 디바이스·큐 |
| `Lambda` | Lambda | NEXA-CELL 보드 라인 (문맥별) |

### 3.9 BAX · 미학 UI (선택 도메인)

| 태그 | 표기 | 정의 |
| :--- | :--- | :--- |
| `BAX` | BAX | **미적 레이아웃 표현 엔진** — MAE·void·RuleGuard · **전 domainKey** · **NEXU Canvas 혼용 ✗** ([§3.6.3](#363-플랫폼-ui-3층--nexu-canvas--bax--nixie) · [`UIX-003`](07_UIUX/07_UIUX_BAX_미학적인터페이스UX아키텍처.md)) |
| `MAE` | MAE | Matrix Aesthetic Engine — 의미→Grid·배치 |
| `ATS` | ATS | Aesthetic Tuning Settings — ASR·Depth·Vibration 영속 |
| `ASR` | ASR | Aesthetic Space Ratio — void 하한 |
| `M2P` | M2P | Matrix-to-Peripheral — 실시간 의지 (NIXIE·Serial) |
| `VirtualCanvas` | VirtualCanvas | **BAX** 레이아웃 호스트 (Grid+OVERLAY) — **NEXU Canvas ✗** |
| `LayoutPolicy` | LayoutPolicy | BAX 레이아웃 정책 |
| `RuleGuard` | RuleGuard | 규칙 가드 UI |

### 3.10 Generators · 미디어 파이프라인

| 태그 | 표기 | 정의 |
| :--- | :--- | :--- |
| `Generators` | Generators | AI 생성기 TDD 묶음 |
| `AIVIDEO` / `AI3D` / `AICIRCUIT` / `AISOUND` | AI* | 도메인별 생성기 모듈명 |
| `Vivex` | Vivex | 미디어 탭 (§3.4) |
| `GraphCanvas` | GraphCanvas | React Flow 워크플로 UI (§2.6) |

### 3.11 기타 전용 · 레거시 태그

문서에만 남아 있는 태그 — 신규 사용 시 본 절 또는 해당 TDD 에서 재확인.

| 태그 | 비고 |
| :--- | :--- |
| `Cockpit` | **폐기** → `Omnix` (부록 A) |
| `NexiaSplitLayout` | 구 MVP 분할 레이아웃 — To-Be 는 `NexiaWorkspace` |
| `Nexion` | UI 브랜드명 — **domainKey**는 `ontex` |
| `Nexus-Map` / `Nexus-Graph` | AI 워크스페이스 지식 맵 (레거시 AI TDD) |
| `U2BEE` | 데스크톱 앱 제품 (PRD-002) |
| `v0` / `nexia-shell` | v0 프롬프트·프로토타입 |

---

## 4. `.nx*` 산출물 확장자 (nexia)

| 확장자 | tabId | 설명 |
| :--- | :--- | :--- |
| `.nxchat` | omnix | 채팅·세션 로그 |
| `.nxpol` | normex | 규범·정책 문서 |
| `.nxflow` | logex | 워크플로·그래프 |
| `.nxcode` | scribx | 코드·스크립트 |
| `.nxmedia` | vivex | 미디어 메타·파라미터 |
| `.nxproj` | twinex | 프로젝트·트윈 루트 |
| `.nxgrp` | twinex | 그룹·토폴로지 |
| `.nxdev` | twinex | 디바이스 바인딩 |
| `.nxdiag` | twinex | 진단·시뮬 산출 |

Navex 는 **생성 확장자 없음** — **전 `domainKey`** · 전체 인덱싱 · P0 **code/config/edge** 포함. — [`TDD-010` §3.3](08_TDD/NEXIA/08_TDD_NEXIA_구조기술스택운영방침.md) · [§3.6.4](#364-navex--global-asset-index--상세-정의)

---

## 5. 부록 A — 구 UI 라벨 (비규범)

> [`TDD-010` 부록 B](08_TDD/NEXIA/08_TDD_NEXIA_구조기술스택운영방침.md) 와 동일. **신규 코드·문서·`tabId` 에 사용 금지.**

| 구 라벨                      | 현재 SSOT                                        |
| :------------------------ | :--------------------------------------------- |
| Cockpit (콕핏)              | **Omnix**                                      |
| Ethos (에토스)               | **Normex**                                     |
| Synapse (시넵스)             | **Logex**                                      |
| Glos (글로스)                | **Scribx**                                     |
| Physis (피시스)              | **Vivex**                                      |
| Sense (센스)                | **Twinex**                                     |
| Navis (나비스)               | **Navex**                                      |
| 레거시 탐색기 (초안 PRD)          | **Infra-Explorer** · `navexExploreMode: infra` |

---

## 6. 부록 B — 전체 태그 인덱스 (자동 집계)

확정 문서 83 건 frontmatter 기준 (2026-06-12). 신규 승격 시 [`sync_terms_to_tags.py`](scripts/sync_terms_to_tags.py) 재실행.

| 구분 | 개수 | 조회 방법 |
| :--- | :---: | :--- |
| `terms_standard` | 99 | [`용어집_범용_v2.0.md`](용어집_범용_v2.0.md) §2 + 각 문서 YAML |
| `terms_nexa` | 219 | 본 문서 §3 + [`doc_id_레지스트리`](doc_id_레지스트리.md) |

---

## 관련 문서

| 관계 | 문서 |
| :--- | :--- |
| 범용 용어 | [용어집_범용_v2.0.md](용어집_범용_v2.0.md) (TDD-069) |
| 문서 생태계·`terms_*` 규칙 | [개발문서 생태계와 관리 체계](<개발문서 생태계와 관리 체계.md>) |
| doc_id SSOT | [doc_id 레지스트리](doc_id_레지스트리.md) |
| 도메인 구조 SSOT | [NEXA OS · 도메인 구조 통합 (TDD-071)](08_TDD/NEXAOS/08_TDD_NEXAOS_도메인구조통합_v1.0.md) |
| **피지컬 티어 · Hub-and-Spoke** | [TDD-040 §0.1](08_TDD/AI/08_TDD_AI_지능위계및하드웨어사양.md) · [Global Architecture §Hub-and-Spoke](08_TDD/NEXAOS/08_TDD_NEXAOS_전역아키텍처표준_GlobalArchitectureStandard_v1.0.md) · [§3.2.0](#320-피지컬-티어--세-축--hub-and-spoke) |
| **Cosmic Layer · Axon Layer** | [TDD-043](08_TDD/Cosmic/08_TDD_CSIM_AXON프로토콜_정본.md) · [TDD-044](08_TDD/Cosmic/08_TDD_CosmicLanguage_전역데이터아키텍처.md) · [§3.2.2](#322-cosmic-layer--csim-개념-tier-t1t3) · [§3.2.3](#323-axon--cosmic-language-프로토콜) |
| nexia DIEA·스택 | [NEXIA 구조·기술스택 (TDD-010)](08_TDD/NEXIA/08_TDD_NEXIA_구조기술스택운영방침.md) |
| 플랫폼 레이아웃 | [NEXA 통합 레이아웃 (UIX-006)](07_UIUX/07_UIUX_NEXA_통합레이아웃구조규격.md) |
| nexia UI | [NEXIA MainShell (UIX-004)](07_UIUX/07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md) |
| DIEA · Nexaon · Distillation | [TDD-071 §2.1.2·§4](08_TDD/NEXAOS/08_TDD_NEXAOS_도메인구조통합_v1.0.md) · [용어집 §3.3.1](#331-diea--nexaon--관계) |
| DIEA Facet · Nexaon 진입 | [NEXIA DIEA Facet 범위 (TDD-056) §4.1](08_TDD/NEXIA/08_TDD_NEXIA_7탭범위확정_v1.0.md) |
| Nexaon · Run · SHACL | [LangGraph · IoT 온톨로지 (TDD-008)](08_TDD/LangGraph/08_TDD_LangGraph_인간LLM협업형IoT온톨로지플랫폼_v1.0.md) |
| Nexaon ↔ Ontex | [Ontex (TDD-057)](08_TDD/Ontex/08_TDD_Ontex_기술스택운영방침_v1.0.md) |
| 엣지 후보고 → Nexaon | [TDD-068 §1.6.5](08_TDD/NEXIA/08_TDD_NEXIA_IoT엣지데이터파이프라인_HEXAGON_Nexaon연계_v1.0.md) |
| Nixie · 4 Shell 채널 | [Nixie/README](08_TDD/NEXIA/Nixie/README.md) · TDD-061~064 |
| NEXU Canvas · BAX · NIXIE 3 층 | [§3.6.3](#363-플랫폼-ui-3층--nexu-canvas--bax--nixie) · [`TDD-045` §6.1](08_TDD/Knowledge/08_TDD_Knowledge_디렉토리책임및기획자원경로.md) · [`UIX-003`](07_UIUX/07_UIUX_BAX_미학적인터페이스UX아키텍처.md) |
| Nixie · 지능의 얼굴 | [Knowledge (TDD-045)](08_TDD/Knowledge/08_TDD_Knowledge_디렉토리책임및기획자원경로.md) |
