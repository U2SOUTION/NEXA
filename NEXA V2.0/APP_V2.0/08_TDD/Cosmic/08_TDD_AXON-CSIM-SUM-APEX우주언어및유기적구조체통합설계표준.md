---
implements_doc: 
see_also: []
doc_id: TDD-043
title: "CSIM · AXON 프로토콜 정본"
category: "08_TDD"
domain: NEXAOS
status: draft
created: 2026-06-10
updated: 2026-06-29
parent_doc: TDD-001
terms_standard: ["mqtt", "protobuf", "pwm"]
terms_nexa: ["CSIM", "AXON", "APEX", "HEXAGON", "ACTON", "NEXAVULT"]
tags: ["doc/cat/08-tdd", "doc/domain/nexaos", "std/mqtt", "std/protobuf", "std/pwm", "nexa/CSIM", "nexa/AXON", "nexa/APEX", "nexa/HEXAGON", "nexa/ACTON", "nexa/NEXAVULT"]
---

8_TDD_AXON_CSIM_SUM_APEX_ 우주언어 _ 및 _ 유기적 _ 온톨로지 _ 확장 _ 구조체 _ 통합 _ 설계 _ 표준 _ 정본.md

# Cosmic Language 체계: CSIM 의미 매핑 및 AXON 구조 노드용 APEX 프로토콜 통합 설계 표준 (정본)


---


## §1. 한 줄 요약 · 아키텍처 핵심 설계

**한 줄 요약**
인간/AI 의 의도 (**WILL**) 를 **CSIM** 엔진이 **18-bit SUM(의미좌표)**에 담아 **APEX 패킷**으로 발송하면, **AXON 7- 레이어**를 타고 흘러 **ACTON(물리 실행)**과 **NIXIE(감각 발화)**라는 실질적 결과로 변환되는 우주언어 (Cosmic Language) 체계.

> [!ABSTRACT] **아키텍처 설계 핵심: 추상적 교감과 정밀 실행의 조화**
>
> - **추상적 언어의 가치 (Pros)**: 언어 장벽과 도메인 경계를 허물어 **범용적 연결성**을 제공하며, 미세한 감각 (빛·진동) 부터 거대한 물리 장비까지 **직관적인 의도 전달**이 가능함.
> - **정밀도 한계 극복 (Cons & Resolution)**: 추상적 신호의 불확실성은 **디지털 시방서 (Job Spec)**를 컨트롤러로 삼아 LLM 이 상황을 판단하는 **하이브리드 추론 (S2A)** 경로를 통해 최종적인 물리 정밀도로 수렴시킴.
NIXIE 와 SUM 의 숙명적 관계 (배경 노트)

[NIXIE] 는 주로 직접적인 언어보다 조용하고 간접적인 표현 (Subtle Expression) 을 지향합니다. 따라서 SUM 의 의미좌표값은 [NIXIE] 가 소리나 글 이전에 **' 공간적 분위기 '**를 형성하는 데 필수적인 재료가 됩니다.


### **아키텍트의 계층적 흐름 (Top-Down Flow)**

#### 1. **AXON (Stage)**: 신호가 흐르는 7- 계층 신경망 골격 (어디에서?)
#### 2. **CSIM (Logic)**: 의도를 좌표로 바꾸는 매핑 엔진 (어떻게?)
#### 3. **SUM (Data)**: 시스템 공용 의미 좌표계 (무엇을?)
#### 4. **APEX (Carrier)**: 최종적으로 패킹된 통신 프로토콜 (어떤 그릇에?)



---

## §2. 핵심 규범 요약 · 용어 · 구성요소 (통합 Normative 표)

### §2.0 핵심 규범 요약 (Normative)

| 구분      | 항목 (Name)         | 풀네임 / 규범 (Normative)                               | 역할 및 사양 (Role / Spec)                                 |
| :------ | :---------------- | :------------------------------------------------- | :---------------------------------------------------- |
| **인프라** | **AXON**          | **A**utonomous e**X**change **O**perating **N**ode | **신경망 아키텍처** — 7- 레이어 노드 체계 (`AL_1`~`AL_7`)           |
| **논리**  | **CSIM**          | Cosmic Semantic Interface **Mapping**              | **의미 매핑 엔진** — WILL/FACT 를 다중 출력 (SUM, NIXIE 등) 으로 변환 |
| 데이터     | SUM               | 3×3 Semantic Universal Matrix                      | **전역 의미 행렬** — 3×3 구조 기반의 보편적 의미 좌표계 (신호/지식 공용)       |
| **규격**  | **APEX Protocol** | Adaptive Perception and Expression **Protocol**    | **패킷 구조** — Header(64b) + Body(18b) + Tag             |
| **실행**  | **ACTON-GM**      | G/M Execution Bridge                               | **물리 실행** — 패킷 내 `programRef` 참조 및 검증 실행              |

> [!IMPORTANT] **운영 가이드라인 (Normative)**
>
> - **Body(18bit)**는 G-code 로 대체하지 않으며, 순수 의미 좌표만 담는다.
> - **G/M 본문**은 패킷에 포함하지 않고 [NEXAVULT]/Asset 저장소의 `programRef` 로 관리한다.
> - 특정 층 지칭 시 반드시 **`AL_1`~`AL_7`** 표기를 준수한다.

### §2.2 목적과 범위

본 문서는 **Cosmic Semantic Interface Mapping (CSIM)** 및 **AXON** 스택의 개념·구조·패킷·운영 원칙을 **구현 가능한 수준**으로 정의한다.

- **입력:** 인간/AI 의도, 센서·상태, 관계·가설
- **변환:** 레이어×축 매트릭스 + 온톨로지 맥락
- **출력:** 빛·소리·진동·디지털 패킷·물리 실행 (G-code/PWM 등)

**핵심 관점**

- 언어 = 단어가 아니라 **상태를 바꾸는 파형·패킷**
- 번역 = 텍스트 변환이 아니라 **물리량·의미 좌표 매핑**
- 맥락 (온톨로지) 이 전제되면 **매트릭스는 단순해도** 도메인별 수치·단위는 프로젝트에서 고정 가능

### §2.3 상세 용어 · 구성요소

| 이름 | 풀네임 | 역할 |
| :--- | :------ | :--- |
| **CSIM** | Cosmic Semantic Interface Mapping | **양방향 의미 번역기** — WILL/FACT ↔ [SUM / NIXIE / ACTON] 간 최적 매핑 선택 |
| SUM | **S**emantic **U**niversal **M**atrix | **전역 의미 행렬** — 3×3 구조 기반의 보편적 의미 좌표계 (신호/지식 공용) |
| **APEX Protocol** | Adaptive Perception and Expression Protocol | 시맨틱 **인터페이스** — 직관→인포→패킷 · 본 표 풀네임 통일 (2026-06-26) |
| **HEXAGON** | Six-Axis Tokenized Interaction Standard | **5W1H** 전송·문법 — Where/When/Who/What/How/Why |
| **NEXAON** | NEXA Ontology | Human ↔ AI **온톨로지·해석** |
| **NEXAVULT** | NEXA Knowledge Vault | 지식 **저장·재사용** (원본 + 벡터) |
| **ACTON Synapse** | Active Transition & Operation | 디지털→**물리 실행** · S- 커브·토크·버퍼 — G/M **불필요** 경로 포함 |
| **ACTON-GM** | ACTON **G/M Execution Bridge** | **엑추에이터 구체 명령** — 축·궤적·스핀들 G/M · NEXAVULT **`programRef`** Fetch·검증·실행 |
| **acton.motion** | ACTON Motion Tag | APEX **Attachment** — `programRef` + 무결성 메타 — §10.4.1 |
| **ENVIRON Shield** | Environmental Sensing & Response | **외부** 환경·복지·EMI — 제어 진입 전 필터 |

### §2.4 신호 흐름 · APEX 내부 해상도

**신호 흐름 (요약):**

```json
APEX → HEXAGON → NEXAON → NEXAVULT → NEXAON → HEXAGON → APEX
                              ↓
                   ACTON (+ ACTON-GM: G/M)
                              ↓
                         물리 (축·모터·스핀들)
                              ↑
                         ENVIRON (외부)
```

**APEX 내부 해상도:**

```json
1차  직관 신호     (음악, 색, 형태, EMG)
2차  인포그래픽    (제스처, 시각화)
3차  APEX 패킷     Header / Body / Tag
```

### §2.5 관련 아키텍처 링크

- **인터페이스 규약**: [NEXNAP 시스템 인터페이스 표준 규약]
- **전역 데이터 구조**: [Cosmic · 전역 데이터 아키텍처]
- **물리 브리지**: [Kineton Physical Bridge ACTON ROS2]
- **개념 허브**: [Global Architecture Standard]

### §2.6 CSIM 정의 (예고) — 정식 명세는 §8 참조

> **SSOT 안내**: CSIM 의 **정식 정의·단계 책임·역방향 명세**는 본 문서 **§8 "CSIM 정의 · 산출물 · 단계 책임 "** 에서 단일 진실 공급원 (SSOT) 으로 통합되어 있습니다.
> 본 §2.6 은 §1 핵심 설계와 §8 사이의 **연결 예고**이며, 핵심 산출물만 요약합니다.

**핵심 정의 (예고)**: CSIM (Cosmic Semantic Interface **Mapping**) 은 WILL(의도) 또는 FACT(현상) 를 분석하여, 감각적 투영을 위한 **SUM(좌표)** 또는 지식 구조화를 위한 **SoT(지식)** 중 최적의 형식을 선택하여 연결하는 매핑 엔진입니다.

> [!NOTE] **NIXIE 와 SUM 의 숙명적 관계**
> [NIXIE] 는 주로 직접적인 언어보다 조용하고 간접적인 표현 (Subtle Expression) 을 지향합니다. 따라서 SUM 의 좌표값은 [NIXIE] 가 소리나 글 이전에 **' 공간적 분위기 '**를 형성하는 데 필수적인 재료가 됩니다.

#### §2.6.1 CSIM 가시적 산출물 (Normative Outputs — 예고)

1. **Technical (SUM)**: [NIXIE] 의 간접 발화 (빛/진동) 및 기계 제어를 위한 **18-bit 좌표** 신호.
2. **Logical (SoT Generation)**: **CSIM**이 Raw Signal 로부터 의미를 추출하여 **[NEXAVULT]/[NEXAON]** 스키마에 맞게 구조화한 **고차원 지식 패킷**.
   - **추출 활동**: 주체 (Who), 행위 (What), 맥락 (Why) 등 **[HEXAGON]** 규격을 기반으로 지식의 뼈대를 매핑함.
   - **무결성 활동**: 단순 압축이 아닌, 지식 간의 관계성을 정의하여 정보 손실 없이 기록함.
1. **Physical (Action Tag)**: [ACTON-GM] 구동을 위한 참조 및 무결성 Hash.

| 구분 | 항목 | 역할 및 사양 (Role / Spec) |
| :--- | :--- | :--- |
| **논리** | **CSIM** | **의미 매핑 엔진** — 감각 투영 (SUM) 또는 지식 생성 (SoT) 경로 선택 |
| **데이터** | **SUM** | **의미 보편 행렬** — WILL/FACT 를 관통하는 **전역 의미 척도**. 18-bit 신호부터 고차원 좌표계까지 포함하는 지능의 표준 단위 |
| **데이터** | **SoT Token** | **고차원 지식 규격** — SUM 을 거치지 않는 직접적 지식 구조화 (Graph/JSONB) |

---

## §3. AXON 설계 원칙

### §3.0 원칙 1 — Base + Attachment

> 모든 레이어는 **Base 만으로 작동** 가능해야 한다. Attachment 는 **선택**으로 정밀도를 높인다.

```json
Base        →  단독 완결 (Header + Body)
Attachment  →  Tag · acton.motion(programRef) · 도메인 M-code 프로파일
              →  G/M **본문은 패킷 밖** — NEXAVULT/Asset 저장 후 참조만 전송
```

### §3.1 원칙 2 — 구조 결정 기준 (매트릭스 해상도)

> - **인터페이스**: 말단 단순화가 필요할 때 축·셀 감소 (예: 2×2)
> - **확장성**: Base+Attachment 준수를 통해 심플에서 정확으로 단계적 진화

| 검토 조건 | 영향 |
| :--- | :--- |
| **인터페이스** | 말단 단순 → 축·셀 감소 · UI 복잡 → 셀 직접 입력 |
| **AI 성능** | AI 강함 → Body 추상 유지 · 약함 → Tag·구체값 보완 |
| **도메인 철학** | 정밀 → 3×3 + Tag · 속도 → 2×2 + Header Sign |
| **확장** | Base+Attachment 준수 — 심플에서 정확으로 |

### §3.2 원칙 3 — 세포와 두뇌의 분리

```json
Sign / Body  →  사실 + 방향성만 (온톨로지 모름)
NEXAON        →  해석 · 판단 · 0/1 결정 (세포를 앎)
```

### §3.3 원칙 4 — 순환 정교화

```json
불완전한 씨드 → AI 해석 → 오류(신호)
      ↓
실측 충돌 → NEXAON 보정 → 정확도 ↑ (최대 3회 제한)
      ↓
NEXAVULT 저장 → 재사용 → 종결
```

### §3.4 원칙 5 — 추상적 의도의 우선성 및 구체적 사상의 가변성 (Golden Rule)

> **" 패킷은 ' 의도 ' 를 우선하되, 필요시 ' 정밀도 ' 를 수용한다."**

- **추상화 지향 (Default)**: 일반적인 상황에서 Body 내 수치는 **0.0 ~ 1.0 (또는 0~99)** 사이의 정규화된 강도로 표현하여 장비 간 범용성을 확보한다.
- **구체적 명세 허용 (Extension)**: 특정 인터페이스가 확보되거나 미션 크리티컬한 정밀도가 요구되는 경우, **Tag** 또는 **Domain Profile**에 정의된 규격에 따라 구체적인 물리 단위 (`Hz`, `mm`, `V`, `Pa`,`kg` 등) 를 포함한 메시지 구성을 허용한다.
- **가변 해상도 정책**: 시스템은 상황에 따라 ' 추상적 감 (Intention)' 과 ' 구체적 지시 (Instruction)' 사이에서 최적의 해상도를 선택하며, 이를 결정하는 SSOT 는 **NEXAON**의 온톨로지 판단에 둔다.

### §3.5 AXON 한 줄 정의

> **AXON**은 말단의 단순 신호에서 중앙의 정밀 지식으로 **수렴하는 순환 시스템**이다. Base 만으로 완결되고 Attachment 로 확장된다. 세포는 두뇌를 모르고, 두뇌는 순환으로 정교해진다.

### §3.6 ACTON-GM · Body vs G/M (Normative 요약)

**Body(18bit) 는 G-code 로 대체하지 않는다.** 의도·강도·시간축은 **APEX Body**에 둔다.
**G/M 본문은 APEX 패킷에 실지 않는다.** Tag 는 **저장소 위치 (`programRef`)** 와 **무결성 메타**만 담는다.

| 채널 | 패킷 | 내용 |
| :--- | :--- | :--- |
| **Body** | ✅ | 의미·의도 — Target↑ · Intensity↑ · Horizon=Now |
| **Tag `acton.motion`** | ✅ (선택) | `programRef` · `contentHash` · `profile` — **참조만** |
| **ACTON-GM (런타임)** | ❌ | Fetch → Verify → Execute — §10.3 |
| **NEXAVULT / Asset** | ❌ | NC 원본 · CAM·포스트·S- 커브 **SoT** |

```json
패킷 (짧음)     programRef ──→  NEXAVULT/Asset (G/M 본문)
     │                              │
     └─ Body 의미 ──→ NEXAON ──→ Fetch · Hash 검증 · Ethos · 실행
```

- **표준 G-code** — ISO/관례 — 저장소 NC 내부 · Domain Profile **허용 subset** — §10.2
- **Domain M-code** — NEXAON·NEXAVULT·ENVIRON·Ethos — Profile **M-code 레지스트리** — §10.2
- **실시간 스트림** — APEX Tag 가 아닌 **ACTON job 채널** (패킷 밖) — §10.4


---

### §4. AXON 구조체 노드 내부 스택 (AL_1 ~ AL_7)

**설계 의도:** 단일 [AXON] 노드는 아래 7 개의 논리 계층을 스택 (Stack) 구조로 보유하며, 각 층은 상호 독립적으로 작동하거나 협력하여 신호를 지식으로 승격시킨다.
**※ 참고:** 여기서의 ' 계층 ' 은 외부 통제에 의한 종속이 아닌, **자율적 개체가 지능을 수행하기 위한 내부적 인지 단계**를 의미한다.

| 계층      | 명칭                        | 구성요소                 | 역할                        | 소통         |
| :------ | :------------------------ | :------------------- | :------------------------ | :--------- |
| **AL1** | **Ingress Mapping**       | **APEX Protocol**    | 인간/센서 입력의 1 차 SUM 투영      | 인간 ↔ 시스템   |
| **AL2** | **Hexagon Normalization** | **HEXAGON Protocol** | 5W1H 규격으로의 의미 정규화         | 기계 ↔ 알고리즘  |
| **AL3** | **Persona Balancing**     | **Coil Balancer**    | 가중치 및 페르소나 파라미터 보정        | 인간 ↔ AI    |
| **AL4** | **NEXAON Inference**      | **NEXAON Network**   | 엣지/중앙 분산 추론 및 해석          | 알고리즘 ↔ AI  |
| **AL5** | **Knowledge Persistence** | **NEXAVULT**         | NEXAVULT 지식 적재 및 재사용      | 플랫폼 ↔ 전 구간 |
| **AL6** | **Action Synapse**        | **ACTON Synapse**    | 물리 실행 (ACTON) 및 GM 브리지 제어 | 시스템 ↔ 물리   |
| **AL7** | **Environ Shield**        | **ENVIRON Shield**   | 외부 환경 노이즈 필터링 및 복지 최적화    | 환경 ↔ 시스템   |

### §4.1 Structural Autonomy Tiers (구조적 자율 위계)

- **AL1~2**: 원시 신호 처리 (**반사적 자율**) — 하부 구조의 즉각적 대응
- **AL4~5**: 고차원 추론 (**인지적 자율**) — 중추 구조의 데이터 정제
- **AL6~7**: 물리적/환경적 실행 (**행동적 자율**) — 상부 구조의 최종 실체화


### §4.2 ACTON Synapse 상세 구조

```json
AL_6 ACTON Synapse
├── (기본) 범용 실행 ── PWM · MQTT · 빛·진동 …
└── (선택) ACTON-GM  (CNC · 로봇 · SkyTen 등 Domain Profile) ── programRef → NEXAVULT/Asset → G/M → 컨트롤러
```

### §4.3 설계 의도

1. **HEXAGON 전진 배치** — 원시 신호를 조기에 5W1H 로 정규화 → 무결성 선확보
2. **NEXAON 이원화** — 엣지 **실시간** + 중앙 **고차원 추론**
3. **ACTON / ENVIRON 분리** — 내부 근육·신경 vs 외부 위협·복지
4. **ACTON-GM ⊂ AL_6** — 7- 레이어 유지 · G/M 은 **Attachment 급** 선택 브리지 — §3.0

### §4.4 LeRobot 등 E2E 학습

AXON **구조 변경 없이**, ACTON 단계 **선택 라이브러리**. 학습 데이터 = `[영상 + HEXAGON 토큰 + ACTON 피드백]` 로깅 권장 — §13.4.

---

## §5. APEX Protocol · SUM 패킷 (3×3 Normative Body)

### §5.0 APEX 패킷 구조

**주의:** APEX 는 Matrix 를 포함하는 **패킷 단위**이다. 3×3 구조는 APEX 의 **Body**에 한정된다.

```json
┌─────────────┐
│   HEADER    │  64-bit (v1.1) — 제어 및 메타데이터
├─────────────┤
│    BODY     │  3×3 Semantic SUM (18-bit) — 핵심 의미 좌표
├─────────────┤
│    TAG      │  선택적 Attachment — 구체적 수치 및 참조(programRef)
└─────────────┘
```

### §5.1 HEADER (논리 필드)

| 필드 | 역할 |
| :--- | :--- |
| Ontology ID | NEXAVULT 시방·매핑 규칙 |
| Domain | 추론 범위 고정 (Factory / Space …) |
| Version | 패킷 규격 |
| Confidence | 0~1 — 씨드 vs 보정 가중 |
| Sign | **의미 발생** 트리거 · 유휴 (0) 시 RF 절전 |
| Priority | QoS · 재전송 |
| Tick/ID | 인과·누락 검출 |
| Power Stat | Eco — Tag 생략·주기 연장 |

### §5.2 BODY — 3×3

| Axis \ Layer | **L1 Signal** | **L2 Context** | **L3 Projection** |
| :--- | :--- | :--- | :--- |
| **A1 Field** | Origin | Proximity | Target |
| **A2 Magnitude** | Intensity | Influence | Potential |
| **A3 Temporal** | Moment | Duration | Horizon |

### §5.3 TAG (Attachment)

| 필드 | 예 |
| :--- | :--- |
| 구체 수치 | `pressure: 142bar` |
| 임계 | `threshold: 120bar` |
| 시간 | ISO8601 |
| 좌표 | `line: 3, zone: B` |
| **acton.motion** | `programRef` · `contentHash` (SSOT) — §10.0 · §10.0.1 · §10.3.0 AIP · §10.4.1 |

#### §5.3.1 운용의 유연함

| 상황 | 구조 |
| :--- | :--- |
| 일반 | Header + Body |
| 정밀 | + Tag |
| NEXAVULT | Body→벡터 · Tag→원본 |

### §5.4 APEX Header 표준 64-bit (Normative)

**v1.1 — 보안 및 실행 스택 통합형 APEX Header (8 Bytes)**

| 필드 | Bits | 설명 | 보안 역할 | 검증 단계 & 스택 |
| :--- | :--- | :--- | :--- | :--- |
| **Magic Byte** | 8 | `0x41` ('A') — 프레임 동기화 및 시작점 식별 | 위조 패킷 1 차 필터링 | **Ingress** / C·Rust (Bit-masking) |
| **Node ID** | 8 | **발신 노드 식별자** — 시스템 내 고유 장치 ID (256 개 그룹) | **ACL 기반 접근 제어** 및 발신처 검증 | **Gateway** / Redis (ACL Lookup) |
| **Ontology ID** | 8 | 데이터 해석 규칙 식별 | 권한 외 온톨로지 접근 차단 | **NestJS** / Zod Schema |
| **Domain ID** | 8 | 도메인 (제조, 로봇 등) 식별 | 도메인 간 간섭 방지 및 데이터 격리 | **NestJS** / Namespace Logic |
| **Tick / ID** | 16 | **시퀀스 번호** — 패킷 순서 보장 및 유실 감지 | **Replay Attack(재전송 공격) 방지** | **Gateway** / Sliding Window Buffer |
| **Sec-Control** | 8 | **보안 및 운영 제어** — Sign(2), SecMode(2), Priority(2), Flags(2) | 암호화 모드 및 보안 레벨 결정 | **Reverse Proxy** / TLS 1.3·OpenSSL |
| **Integrity/MAC** | 8 | **Header Checksum / Truncated MAC** — 헤더 무결성 검증 | **헤더 변조 (Tampering) 탐지** | **MCU & Gateway** / CRC-8·HMAC |

**합계: 64 bit (8 Bytes)**

> [!IMPORTANT] **[NEW] 계층별 검증 기술 스택 (Security Tech Stack)**
> - **L4 Ingress (C/Rust)**: CPU 부하를 줄이기 위해 최하위 계층에서 `Magic Byte` 와 `Integrity` 를 비트 연산으로 즉시 검증하여 무효 패킷을 드랍 (Drop) 합니다.
> - **L7 Gateway (Node.js/Redis)**: `Node ID` 와 `Tick/ID` 를 사용하여 세션의 유효성을 검사합니다. Redis 의 **Atomic Counter**를 활용해 중복 패킷 주입을 차단합니다.
> - **Application (NestJS/Zod)**: `Ontology ID` 와 `Domain ID` 가 비즈니스 로직에 부합하는지 **Schema Validation**을 수행하며, 권한 위반 시 즉시 `403 Forbidden` 을 반환하고 로그를 남깁니다.
> - **Transport (AES-GCM/HMAC)**: `SecMode` 가 `Encrypted` 일 경우, **AES-256-GCM** 또는 **ChaCha20-Poly1305** 스택을 통해 본문의 기밀성을 보장합니다.

**Sec-Control 내부 보안 분할 상세:**

| 하위 필드 | Bits | 값 / 범위 |
| :--- | :--- | :--- |
| `Sign` | 2 | `00` 유휴 · `01` + · `10` − · `11` 중립 |
| `SecMode` | 2 | **`00` Plain(비암호화)** · **`01` Signed(서명)** · **`10` Encrypted(암호화)** |
| `Priority` | 2 | 0~3 (보안 위급도 및 QoS) |
| `Flags` | 2 | `bit0`=Ack(응답필수), `bit1`=Trust(검증완료 표식) |

**Flags 동작:**

- **Ack=1:** 중요 명령 (정지 등) — 응답·재전송
- **Ack=0:** 상태 보고 — Deep Sleep 우선
- **Compress=1:** Body 압축 (예: RLE · LZ4)
- **Sign=00 + Confidence 낮음:** 노이즈로 폐기 가능
- **Ver≠1:** 실험 채널 (`Ver=2·3`) 은 별도 `apex.experimental.*` Topic 으로 격리

> C 구조체·CRC 구현은 구현 Runbook — 본 문서는 **비트 레이아웃**만 규범.

### §5.5 SUM 3 상 논리 인코딩 (Normative)

**전송:** 2 진 · **의미:** 3 상 (+ / - / 0)

| 2-bit Value | Semantic State | 설명 |
| :--- | :--- | :--- |
| `00` | **Neutral (0)** | 해당 축의 변화 없음 / 대기 |
| `01` | **Positive (+)** | 증가 / 접근 / 활성화 |
| `10` | **Negative (-)** | 감소 / 회피 / 비활성화 |
| `11` | **Reserved** | 시스템 예비 비트 (Error 표시 등) |

- **9 셀 × 2bit = 18bit Body** (ESP32 말단에 적합)
- **0**은 " 데이터 없음 " 이 아니라 NEXAON 에 **맥락 힌트** — 아래 §7.0 "0 의 메시지 인코딩 규약 " 참조
- 근육: (+) 수축 · (-) antagonist · (0) 이완 — 생체·산업 공통

**[TIP] 저사양 MCU 최적화 비트 레이아웃 (Low-spec Optimized Packing)**
- **구조**: 3- 바이트 (24-bit) 공간 내에 18-bit 를 배치하되, **MSB 우선 (Big-Endian)** 및 **좌측 정렬 (Left-aligned)**을 채택한다.
- **배치**:
  - `Byte 0`: 셀 1, 2, 3, 4 (8-bit)
  - `Byte 1`: 셀 5, 6, 7, 8 (8-bit)
  - `Byte 2`: 셀 9 (2-bit) + **Padding (6-bit, Zero)**
- **이점**: MCU 는 루프를 돌 필요 없이 `byte[0]`, `byte[1]` 접근만으로 8 개의 셀을 즉시 획득하며, 마지막 셀만 마스킹하여 처리한다.

| Byte  | Bit 7-6 | Bit 5-4 | Bit 3-2 | Bit 1-0 | 역할              |
| :---- | :-----: | :-----: | :-----: | :-----: | :-------------- |
| **0** | Cell 1  | Cell 2  | Cell 3  | Cell 4  | L1-A1 ~ L2-A1   |
| **1** | Cell 5  | Cell 6  | Cell 7  | Cell 8  | L2-A2 ~ L3-A2   |
| **2** | Cell 9  |    0    |    0    |    0    | L3-A3 + Padding |

#### §5.5.1 제어 vs 추론 분리

| 계층 | 지연 | 내용 |
| :--- | :--- | :--- |
| Header+Body | **결정론 · 1ms 미만급** | LLM 불필요 · 실시간 제어 |
| Tag | **비등기** | LLM·NEXAON 보정 · **acton.motion(programRef)** · 로그 |
| NEXAVULT | **배치** | 순환 학습 |

---

## §6. APEX Protocol 의 SUM 패밀리 (용도별 병행)

> [!NOTE] **Normative 범위 안내**
> 본 표는 **Normative: 2×2 / 3×2 / 3×3** 만 다룹니다.
> 4×4 는 **비규범**이며 §13.2 "4×4 Draft (비규범)" 에서만 참고용으로 다룹니다.

| 구분 | 2×2 (Normative) | 3×2 (Normative) | 3×3 APEX (Normative) |
| :--- | :--- | :--- | :--- |
| **셀** | 4 | 6 | 9 |
| **시간·가능성** | 동일 셀 혼재 위험 | D3 가능성 | L3 Projection 정식 |
| **맥락** | HEXAGON 말단 · EMG · 4 버튼 UI | 2×2↔3×3 절충 | APEX Body · 온톨로지 |
| **AXON** | Base 극대화 | Base + 얇은 Attachment | Body + Tag Attachment |

**권장 파이프라인:**

```json
말단 입력  →  2×2   (빠름·단순)
중간 변환  →  AI/규칙으로 시간성 보완
APEX Body  →  3×3   (완전 의미 구조)
정밀       →  + Tag (선택)
```

> 4×4 확장이 필요한 도메인은 §13.2 Draft 를 참조하되, **이 정본 (정본 Normative) 에서는 4×4 를 표준으로 간주하지 않습니다.**

### §6.1 2×2 심플 Semantic Universal Matrix

| Axis \ Layer | L1 Action (외부·동적) | L2 State (내부·정적) |
| :--- | :--- | :--- |
| **A1 Vector** | Targeting — 출력·이동·전달 | Position — 소속·위치 |
| **A2 Scale** | Intensity — 강제·에너지 | Range — 영향권·범위 |

극성 (예)

- L1-A1 +1: 접근·발송 / +0: 회피·차단
- L2-A1 +1: 내부·연결 / +0: 외부·단절

강점 · 한계

- **강점:** 4 버튼·IoT·저비트 · 도메인 무관 4 칸
- **한계:** **시간성 부재** — " 지금 142bar" vs " 곧 142bar" 구분 어려움 → Tag 의존 또는 3×2/3×3 승격

### §6.2 3×2 절충 Semantic Universal Matrix

|  | D1 작용 | D2 상태 | D3 가능성 |
| :--- | :--- | :--- | :--- |
| **A1** | Target | Source | Bearing |
| **A2** | Power | Scale | Potential |

2×2 보다 **가능·예측** 축 분리 · 3×3 보다 가벼움

### §6.3 3×3 표준 Semantic Universal Matrix — Normative Body

3×3 Normative Body 의 패킷 구조는 §5.0 을, HEADER 필드는 §5.1 을, BODY 매트릭스는 §5.2 를, TAG 필드는 §5.3 을 참조하십시오.

---

## §7. 0 인코딩 규약 · 제어 vs 추론 분리 · 전송 매핑

### §7.0 0 의 메시지 인코딩 규약 (Normative)

> 본 규약은 "**0 = 데이터 부재**" 라는 오독을 막기 위한 명세입니다.
> `00` 인코딩은 **빈 상태 (Empty)**, **대기 상태 (Idle)**, **중립 상태 (Neutral)** 의 세 가지 메시지로 해석되며,
> NEXAON 은 Cell 내 0 의 **분포 패턴**으로 의미를 판별합니다.

| 0 의 정의 | 의미 (한국어) | 메시지 해석 | NEXAON 판별 규칙 (예시) |
| :--- | :--- | :--- | :--- |
| **Empty** | 빈 상태 (부재) | " 이 축은 **현재 측정 대상이 아님**" — 정보 없음 | 해당 Axis 전체가 0 + Domain Profile 이 측정 외 축으로 표시 |
| **Idle** | 대기 상태 (휴면) | " 측정 가능하지만 **지금은 사건 없음**" — 정상 휴면 신호 | L1·L2 가 0, L3(Horizon) 만 활성 |
| **Neutral** | 중립 상태 (균형) | "**양방향 모두 활성이나 강도 동일**" — 결정 보류 상태 | 동일 Axis 내 + / - 의 합이 같음 |

**예시 (9 셀 Body 의 0 분포):**

| 시나리오 | Body 0 분포 | 판별 결과 | NEXAON 후속 동작 |
| :--- | :--- | :--- | :--- |
| 워치 사용자가 **측정 안 함** | A3(Temporal) 전체가 0 | **Empty** | Time-series 샘플링 스킵 |
| 센서가 정상이나 변화 없음 | A1(Field) 전체가 0 | **Idle** | 이벤트 폴링 간격 늘림 (Eco) |
| 조향 좌/우 힘이 같음 | A2(Magnitude) ± 혼재, 합=0 | **Neutral** | ACTON 호출 보류, 다음 샘플 대기 |

**금지 규범:**

- **0 을 " 에러 " 로 취급하지 않는다.** — 에러는 `11` 인코딩이며, `00` 과 별개입니다.
- **0 을 " 측정 실패 " 로 암묵적 추론하지 않는다.** — 실패는 별도 Tag(`acton.motion.fault`) 로 보고합니다.

### §7.1 제어 vs 추론 분리

| 계층 | 지연 | 내용 |
| :--- | :--- | :--- |
| Header+Body | **결정론 · 1ms 미만급** | LLM 불필요 · 실시간 제어 |
| Tag | **비등기** | LLM·NEXAON 보정 · **acton.motion(programRef)** · 로그 |
| NEXAVULT | **배치** | 순환 학습 |

### §7.2 전송 계층 매핑 가이드 (Transport Mapping)

APEX 패킷은 하위 전송 프로토콜의 **Payload** 영역에 캡슐화되어 전달된다.

- **Hot Path (실시간 제어):** **UDP / ESP-NOW** 사용. 패킷 유실은 Header 의 `Confidence` 필드로 상쇄.
- **Backbone (노드 통신):** **MQTT** 사용. Topic 구조를 `axon/{domain}/{node_id}/apex` 로 설계 권장.
- **Stream (대용량 실행):** **TCP / WebSocket** 사용. `acton.motion` 등 대용량 Tag 전송 시 활용.
- **Cold Path (지식 관리):** **HTTP/JSON** 사용. 바이너리 패킷을 Base64 또는 JSON 배열로 인코딩하여 전송.
- **Unstable Path (저품질 무선):** **추론 기반 복구 (Inference Recovery)** 전략 채택. 로컬 NEXAON 이 유실된 데이터를 맥락으로 추론하여 ' 의도 ' 를 실행하고, 실행 결과 (FACT) 를 **후보고 (Post-report)** 채널로 확실히 전달하여 SSOT 를 동기화한다.
- **Critical Remote Path (원격 정밀):** **Path 2(Inline-G)** 또는 **Path 3(Ref-G)** 모드로 전환하여 물리적 수치가 포함된 ' 명확한 명령 ' 을 전송한다.


---

## §8. CSIM 정의 · 산출물 · 단계 책임 (SSOT)

> [!IMPORTANT] **SSOT 선언**
> 본 §8 은 본 문서 내 CSIM 관련 정의·산출물·단계 책임의 **단일 진실 공급원 (SSOT)** 입니다.
> §2.6 은 §8 의 요약 예고이며, §0 의 정렬 인덱스에 따라 본 §8 이 본문 흐름상 정식 위치입니다.

### §8.0 CSIM 정의

**정의**: WILL(의도) 또는 FACT(현상) 를 분석하여, 감각적 투영을 위한 **SUM(좌표)** 또는 지식 구조화를 위한 **SoT(지식)** 중 최적의 형식을 선택하여 연결하는 매핑 엔진.

> [!CAUTION] **책임 한계**
> CSIM 은 아래 산출물을 **' 생성 (Mapping)'**하고 **' 정렬 (Alignment)'**하는 것까지만 담당한다. 해당 산출물을 보고 실제 실행 여부를 **' 결정 (Run/Stop)'**하는 것은 오직 [NEXAON] 의 권한이다.

### §8.1 CSIM 가시적 산출물 (Normative Outputs — SSOT)

1. **Technical (SUM/APEX Body)**: 기계 간 초고속 제어를 위한 **18-bit SUM** 신호.
2. **Logical (SoT/Semantic Token)**: [NEXAON] 이 해석하고 [NIXIE] 가 발화할 수 있는 **지식 패킷 (JSONB/CoT)**.
3. **Physical (Action Tag)**: [ACTON-GM] 이 물리 장비를 구동하기 위해 참조하는 **`programRef` 및 무결성 Hash**.

| 구분 | 항목 | 역할 및 사양 (Role / Spec) |
| :--- | :--- | :--- |
| **논리** | **CSIM** | **의미 매핑 엔진** — 감각 투영 (SUM) 또는 지식 생성 (SoT) 경로 선택 |
| **데이터** | **SUM** | **의미 보편 행렬** — WILL/FACT 를 관통하는 **전역 의미 척도**. 18-bit 신호부터 고차원 좌표계까지 포함하는 지능의 표준 단위 |
| **데이터** | **SoT Token** | **고차원 지식 규격** — SUM 을 거치지 않는 직접적 지식 구조화 (Graph/JSONB) |

> [!NOTE] **CSIM 의 우주적 번역기 비유**
> "CSIM 의 결과물은 **기계가 읽는 비트 (Matrix)**, **디비가 읽는 지식 (JSONB)**, **인간이 읽는 문장 (NIXIE)**이라는 3 가지 얼굴을 동시에 가집니다. 이것이 바로 우리가 CSIM 을 ' 우주적 번역기 ' 라고 부르는 실질적인 이유입니다."

### §8.2 CSIM ↔ NEXAON 단계별 책임 (정방향 + 역방향 통합 SSOT)

> [!IMPORTANT] **SSOT 규약** — 역할 경계 (Normative)
> 본 표는 **CSIM(의미 매핑) ↔ NEXAON(해석·판단)** 간의 단일 진실 공급원입니다.
> **TDD-073 (Nexaon Distillation 오케스트레이터)** 과의 정합성은 §8.2.2 "TDD-073 정합 체크리스트 " 에서 추후 검증합니다.

#### §8.2.1 정방향 + 역방향 통합 책임 표

|        단계         | 입력                                              | CSIM 담당 (매핑)                                                                      | NEXAON 담당 (해석·판단)                                                                                                                     |
| :---------------: | :---------------------------------------------- | :-------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| **CT_1** (정방향 1)  | Raw Signal (인간·센서·LLM 출력)                       | **SUM 투영** · 손실 최소화 · 3 상 (+/−/0) 디지털 벡터화                                         | (없음 — CSIM 단독)                                                                                                                        |
| **CT_2** (정방향 2)  | SUM + Domain 컨텍스트                               | **HEXAGON·Domain 결합 의미 토큰 생성** · 경량 2×2/3×3 포맷                                    | (없음 — CSIM 단독)                                                                                                                        |
| **CT_3** (정방향 3)  | 정렬된 의미 토큰                                       | **Narrative(상향)** 또는 **Action(하향)** 토큰 합성 · `programRef` 매핑                       | **0/1 판단** · Run · SHACL 검증 · 온톨로지 최종 해석 · `graph_diff` 종결                                                                            |
| **CT_-1** (역방향 1) | Raw FACT (전류·각도·장력·온도·거리 등)                     | **SUM 역투영** · 1 차 노이즈 필터 (HW 리플·ADC quantization) · 3 상 (+/−/0) 매핑                | (없음 — CSIM 단독)                                                                                                                        |
| **CT_-2** (역방향 2) | 역투영 Matrix + 도메인 보정                             | **의미 토큰 재정렬** · Empty/Idle/Neutral 판별                                             | (없음 — CSIM 단독)                                                                                                                        |
| **CT_-3** (역방향 3) | - 정렬된 의미 토큰 (역방향)<br>- 해석 불능 (Non-interpretable) | - **Narrative/ECHO·`fact.*` 토큰 합성** · 의미 후보 생성<br>- **해석 실패 원인 매핑** (맥락 부족/지능 한계) | - **상태 코드 라벨링** (`STUCK`·`OK`·`ALERT`·`Me/You`) · **온톨로지 갱신** · `graph_diff` 종결<br>- **전략적 결정**: `Context 보충` 명령 또는 `LLM/HW 업그레이드` 제안 |
|                   |                                                 |                                                                                   |                                                                                                                                       |

> [!IMPORTANT] **역방향 3 단계 추가 (보정 2026-06-26)**
> CT*-1~CT*-3 은 ACTON 이 만든 FACT 를 다시 의미로 변환하는 **되먹임 루프**입니다.
> 본 §8.2 표가 정방향 + 역방향을 **한 표에 통합**한 SSOT 입니다 (D-2 / D-3 해결).

**핵심 분기 규칙 (Normative):**

1. **CSIM 은 절대 0/1 판정을 하지 않는다.** — 모든 RUN/STOP 결정과 **상태 코드 라벨링**은 NEXAON 의 영역입니다.
2. **CSIM 은 LLM 을 직접 호출하지 않는다.** — LLM 출력은 Raw Signal 입력으로 들어올 뿐, CSIM 내부 추론은 없습니다.
3. **NEXAON 은 Matrix 를 다시 만들지 않는다.** — CSIM 이 만든 Matrix(정방향·역방향 모두) 를 해석만 합니다.
4. **온톨로지 해석의 " 최종 종결자 " 는 NEXAON 이다.** — CSIM 이 SHACL/graph_diff 를 끝내지 않습니다.
5. **CSIM 은 의미 후보 (`fact.*` 토큰) 만 만들고, 상태 코드는 NEXAON 이 부여한다** — §8.2 책임 이관 참조.

- **압축·경량 패킷**은 **전송 수단**이지 CSIM 의 **목적 자체 ✗**.
- **맥락**(온톨로지 · Domain Profile · `stateBus` · 플랫폼 DIEA 산출) 이 전제되면 Matrix 는 **단순해도** 의미는 유지된다 — §1.

**핵심 규칙 (Normative) — 역방향:**

1. **역방향은 정방향의 거울**입니다. CT*-1 ↔ CT_3, CT*-2 ↔ CT_2, CT_-3 ↔ CT_1.
2. **노이즈 보정은 CSIM 1 차 + NEXAON 2 차**의 2 단 구조. CSIM 은 raw noise filter 만, NEXAON 이 의미적 이상치 (anomaly) 를 판정합니다.
3. **3 상 (+/−/0) 판별은 §7.0 "0 의 메시지 인코딩 규약 "** 을 따른다 — 정방향과 동일 규약.
4. **CT\_-3 의 상태 코드**는 `STUCK` (정체) · `OK` (정상) · `ALERT` (경고) · `Me/You` (관계) 등이며, 본 문서 범위 외 상태 코드는 NEXAON/도메인 측 결정입니다.
5. **순환 정교화 (§3.3)** 는 CT\_-3 → NEXAVULT 적재 → 다음 정방향 CT_1 입력으로의 **되먹임 루프**이며, Open #15(무한루프 방지) 와 직결됩니다.
6. **시간축 보존**: FACT 는 `A3×L3 Horizon` (측정 시각 ISO8601) 셀에 강제 주입. 역투영 시 누락된 시간 정보는 **Missing Data (Empty)** 로 분류 (§7.0).

**명칭 통일:** 역방향 단계는 `CT_-1` / `CT_-2` / `CT_-3` (언더스코어 1 개) 로 통일. 사용자 질문의 `CT-1` 하이픈 표기는 **오기로 간주**.

#### §8.2.2 TDD-073 정합 체크리스트 (향후 검증용)

- [ ] NEXAON 이 Matrix 를 다시 생성하지 않고 CSIM 출력만 소비하는가
- [ ] CSIM 이 NEXAON 의 SHACL 결과를 기다리며 동기 블록되는 경로가 없는가 (비동기 분리)
- [ ] `programRef` 해석 책임이 CSIM·NEXAON·ACTON-GM 중 어디에 있는지가 명확한가
- [ ] NEXAON 의 `graph_diff` 종결 후 CSIM 으로의 **피드백 채널**이 정의되어 있는가 (§8.3 다이어그램 참조)
- [ ] 상태 코드 (`STUCK`·`OK`·`ALERT`) 는 **NEXAON 단독**으로 부여되고, CSIM 은 `fact.*` 의미 후보만 만드는가
- [ ] **Fetch-Verify-Execute** 3 단계 책임자가 명시되어 있는가 (NEXAON Approve · ACTON-GM Fetch·Verify·Execute · NEXAVULT Record) — §10.3 참조
- [ ] **Ethos MUST 게이트**(무결성 검증 실패 → 즉시 `STUCK`) 위반 경로가 코드 레벨에서 차단되는가 — §10.5 보안 가이드라인 참조


#### §8.2.3 🛡️ Safety Fallback: 판단 지연 비상 처리 규약 (Normative)

> [!CAUTION] **Fail-to-Safe 원칙**
> **NEXAON**의 판단 (CT_3) 이 약속된 시간 (기본 500ms) 내에 도달하지 않을 경우, 시스템은 ' 판단 보류 ' 가 아닌 ' 비상 정지 ' 로 간주한다.

1. **강제 전이**: 타임아웃 발생 시 **Gateway** 혹은 **CSIM**은 **NEXAON**의 응답을 기다리지 않고 즉시 해당 패킷의 상태를 **`STUCK (Emergency Hold)`**으로 확정한다.
2. **ACTON 동작**: `STUCK` 토큰을 수신한 **ACTON**은 즉시 모든 물리적 가속을 중단하고 **' 현재 위치 유지 (Hold)'** 또는 **' 안전 원점 복귀 (Home)'** 모드로 진입한다.
3. **상태 보고**: 비상 처리 결과는 즉시 **NIXIE**를 통해 관리자에게 `SYSTEM_TIMEOUT_STUCK` 알림으로 송출된다.

### §8.3 되먹임 루프 + 트리거 명세 (D-3 해결)

**순환 정교화 피드백 루프:**

```json
┌─────────── 정방향 (의도 → 실행) ──────────┐
│   사용자/WILL                              │
│      ↓                                    │
│   CT_1 → CT_2 → CT_3 → ACTON → 물리 실행  │
│                                    ↓      │
└────────────────────────────────────┘      │
                      ↓ FACT (센서·계측)     │
┌─────── 역방향 (FACT → 의미 → 개념) ──────┐│
│   CT_-1 ← CT_-2 ← CT_-3 ← NEXAVULT 적재  ││
│      ↑                                    │
│      └──── 다음 정방향 CT_1의 입력 ──────┘│
└──────── (반복 또는 종결) ──────────────────┘
```

**루프 5 단계 (Normative):** ① 정방향 CT_1→CT_3 ② 물리 실행 ③ 역방향 CT_-1→CT\_-3 ④ NEXAVULT 적재 ⑤ 다음 CT_1 로 되먹임.
**책임 이관 (Normative):** CSIM 은 `fact.*` 의미 후보만 만들고, 상태 코드 (`STUCK`·`ALERT`) 는 NEXAON 이 부여 — §8.2 핵심 규칙 #1과 정합.


#### §8.3.2 🆕 Loop Guardrail: 순환 종결 규약 (Closed #15)
**무한 루프 방지 강제 조항 (Normative)**
순환 정교화 과정에서 **CSIM**과 **NEXAON**은 동일 패킷의 인과 관계 (Tick/ID 기반) 내에서 다음의 종결 조건을 반드시 준수해야 한다.

| 구분                  | 종결 조건 (Termination Condition)                | 후속 동작                                                                          |
| :------------------ | :------------------------------------------- | :----------------------------------------------------------------------------- |
| **최대 깊이 도달**        | **Max Depth = 3** (3 회 보정 시도 후 정답 미도출 시)      | 즉시 `STUCK` 상태 코드 부여 및 로그 기록                                                    |
| **수렴 (Convergence)** | 이전 루프 대비 의미 좌표 (SUM) 변화율 **5% 미만**            | 최종 확정된 값으로 **NEXAVULT** 적재 및 종결                                                |
| **논리적 모순**          | **NEXAON** 판단 결과 ' 해석 불가 (Invalid Mapping)' 발생 | 즉시 `ALERT` 신호 발생 및 상위 레이어 보고                                                   |
| **시간 초과**           | 단일 패킷 처리 시간 **500ms** 경과                     | 즉시 **`STUCK`** 강제 주입 및 물리 실행 차단 (Safety Lock)<br>현재까지의 최선의 추론값 (Best Effort) 반환 |

**Loop Counter 운용 규칙:**
- **CSIM**은 역방향 매핑 (**CT_-3**) 시 패킷 메타데이터에 `loop_count` 를 1 씩 증가시킨다.
- **NEXAON**은 `loop_count >= 3` 인 요청에 대해 추가 보정 명령을 내릴 수 없으며, 반드시 **최종 판정 (Run/Stop)** 또는 **예외 처리**를 수행해야 한다.



### §8.4 CT 계층 (Normative Mapping Tiers)

> [!NOTE] **아키텍처 설계 원칙**
> CSIM 의 사상은 단방향 변환이 아닌, **의도 (WILL) 의 실체화**와 **현상 (FACT) 의 개념화**를 잇는 양방향 매핑 함수 (Bijective Mapping) 로 작동한다.

- **CT_1: Entry Projection (진입 매핑)**
  - **정의**: 비정형 원시 신호 (Raw Signal) 를 시스템 공용 좌표계인 **SUM**로 투영하는 단계.
  - **핵심**: 데이터의 손실을 최소화하면서 **3 상 논리 (+, -, 0)** 기반의 디지털 벡터로 변환한다.

- **CT_2: Semantic Alignment (의미 매핑)**
  - **정의**: 투영된 좌표에 **Domain 및 HEXAGON** 맥락을 주입하여 논리적 정합성을 맞추는 단계.
  - **핵심**: 사상된 좌표가 특정 도메인 (예: 로봇, 환경 제어) 내에서 가지는 **상대적 의미**를 확정하고 [NEXAON] 해석을 위한 전처리를 완료한다.

- **CT_3: Operative Synthesis (실행 매핑)**
  - **정의**: 정렬된 의미를 최종적인 **Narrative(ECHO)** 또는 **Action(ACTON)** 토큰으로 합성하는 단계.
  - **핵심**: 논리적 의미를 다시 물리적 실행량이나 인간이 이해할 수 있는 언어적 실체로 **재투영**한다.

> [!ABSTRACT] **수석 아키텍트의 비평**
> " 이처럼 ' 매핑 (Mapping)' 중심으로 어휘를 정렬하면, CSIM 이 단순한 데이터 변환기가 아니라 **' 의미의 좌표를 찾는 내비게이터 '**라는 사실이 명확해집니다. 특히 **Projection(투영)**과 **Alignment(정렬)**라는 표현은 [LangGraph] 에서 노드 간 상태를 전이시킬 때 매우 강력한 논리적 근거가 됩니다."

### §8.5 CT_3 방향 분기 (Normative)

| 방향 | CT_3 산출 (우선) | 소비 주체 |
| :--- | :--- | :--- |
| **상향** | **Narrative** · ECHO · 상태 토큰 | **Nixie**(ML_1) · 관제 UI |
| **하향** | **Action** · HEXAGON · ACTON | **ACTON** · Hot Path |
| **플랫폼 (ML_3)** | semantic chunk · Run **입력** 정렬 | **Nexaon** _(CSIM CT_3 기능 · Run 소유)_ |

**운영 배치**(ML*0 CT_1 · Ingress CT_2 · Nexaon CT_3) — [Global Architecture §Cold Path](../NEXAOS/08_TDD_NEXAOS*전역아키텍처표준*GlobalArchitectureStandard_v1.0.md) · [TDD-044 §2.6](./08_TDD_CosmicLanguage*전역데이터아키텍처.md) · [TDD-073 §4.1](../NEXIA/Nexaon/08_TDD_Nexaon_Distillation오케스트레이터_v1.0.md).
**개념 Tier (문서·Stack 공통):** **CT_1 공용어화** → **CT_2 맥락 동기화** → **CT_3 구체화**. _(구 표: 추상화→맥락화→구체화 — 동일 의미.)_

### §8.6 하향 · 상향 · 현장 흐름

#### §8.6.1 하향 — Intent to Act

1. **WILL** — 자연어·제스처·웨어러블
2. **CSIM 매핑** — 매트릭스 투영
3. **HEXAGON 검증** — 스키마·Ethos
4. **ACTON-GM** — NC 를 NEXAVULT/Asset 에 기록 · 패킷에는 `programRef` · Fetch·Verify·Execute
5. **물리 출력** — 컨트롤러 · PWM · MQTT 등

#### §8.6.2 상향 — Feedback to Context

1. **FACT** — 전류·각도·장력 등
2. **Inverse CSIM** — STUCK · Me/You 등 상태 코드
3. **ECHO** — AI 피드백 토큰
4. **MOMENT→ERA** — 디지털 트윈·Omnix 갱신

#### §8.6.3 현장 — Execution & Bridge

게이트웨이 → ESP-NOW/CAN → 노드 구동 · **ACTON** · **ENVIRON** 필터

### §8.7 CSIM 프로파일 계층 (Core / Domain / User)

| 계층 | 변경 | 권한 |
| :--- | :--- | :--- |
| **Core** | 축·레이어 골격 | 표준 관리자 |
| **Domain** | 가중치·의미 확장 · **ACTON-GM M-code 레지스트리** | 도메인 관리자 |
| **User** | 표현·민감도·단축 | 사용자 |

**우선순위:** `Core > Domain > User`
**User 금지:** Core 축 삭제 · 승인/위험 재정의 · 감사 필드 제거

---

## §9. NEXAON · NEXAVULT · ACTON-GM (역할 분담)

### §9.0 NEXAON

> CSIM↔NEXAON 책임 경계는 §8.2 SSOT 표를 사용합니다. 본 절은 그 보충 설명입니다.

- **CSIM 이 만든 Matrix 를 입력으로 받아 해석·판단만 수행** (Matrix 를 다시 만들지 않음 — §8.2 핵심 규칙 #3)
- Sign/Body **해석** · 0/1 실행 판정 · SHACL 검증 · 온톨로지 최종 해석 · `graph_diff` 종결
- 엣지: **자체 처리·후보고** · 중앙: 고차원·온톨로지 갱신
- **세포 (말단) 는 NEXAON 을 모름** — §3.2

### §9.1 NEXAVULT (_NEXA Knowledge Vault_)

- 백오피스 **지식 (데이터) 허브** — 적재 · 보관 · 재사용 (원시 + 가공)
- Body → **벡터** · Tag → **원본** 이중 보존
- Seed·오류·실측 충돌 → **순환 정교화** — §3.3
- Ontology ID ↔ 시방서 매핑 — Header 연동

### §9.2 ACTON-GM — G-code · M-code (Normative)

**ACTON-GM**은 ACTON Synapse(**AL_6**) 의 **실행 어휘 (lexicon)** 이다.
**의미 (Body)** · **패킷 (Tag=참조)** · **실행 본문 (NEXAVULT/Asset)** 을 분리한다.

#### §9.2.1 계층별 역할 분담

| 계층 | 담당 | 내용 |
| :--- | :--- | :--- |
| **APEX Body** | 의도·맥락 | 18bit 3 상 — Target/Intensity/Horizon 등 |
| **APEX Tag `acton.motion`** | 선택 Attachment | **`programRef` + `contentHash`** — G/M 본문 ❌ |
| **NEXAVULT / Asset** | NC **SoT** | CAM·포스트·생성 NC **원본 저장** |
| **ACTON-GM (런타임)** | Fetch·Verify·Execute | NEXAON/Ethos 통과 후 **다운로드→검증→전송** |

```json
Header + Body (의미)  →  NEXAON 해석 · Ethos
        ↓
Tag.programRef        →  ACTON-GM Fetch (TLS)
        ↓
contentHash 검증      →  Profile G/M whitelist
        ↓
   컨트롤러 (Marlin/GRBL/LinuxCNC/SkyTen 등)
        ↓
   FACT → NEXAVULT (실행 이력)
```

#### §9.2.2 G-code · Domain M-code

| 구분 | 범위 | 등록 |
| :--- | :--- | :--- |
| **표준 G** | G0/G1/G2/G3, G4, G90/G91, G28, F/S/T 등 | **ISO/관례** — Domain Profile 이 **허용 subset** 선언 |
| **Domain M** | M100~M199 (예) NEXAON·NEXAVULT·ENVIRON | **Domain Profile 표** — Core 축 변경 ❌ |
| **금지** | Body 를 ASCII G-code 로 **대체** | **비규범** |
| **금지** | Tag 에 G/M **`block` 인라인** | **비규범** — §10.4.1 |

**Domain M-code 예 (Draft — 비 -Normative, 번호는 Profile 별 확정):**

> [!WARNING] **비 -Normative 표시 (2026-06-26 갱신)**
> 아래 코드는 **예시이며 비 -Normative**입니다. 번호·의미 모두 도메인 측 결정 대기입니다.
> 본 문서가 `status: draft` 인 한, 본 표는 **참고용**이며 어떤 도메인에서도 그대로 채택할 수 없습니다.
> 확정 시 §"ACTON-GM" 정식 절로 승격됩니다. (의존: Open #9)

| 코드 | 의미 (예) |
| :--- | :--- |
| M150 | NEXAON sync / 후보고 트리거 |
| M160 | ENVIRON 스냅샷 요청 |
| M170 | NEXAVULT segment 로그 시작/종료 |
| M200 | Ethos **MUST** 게이트 — Omnix ACK 대기 |

#### §9.2.3 CadQuery · 3D · Circuit 와의 관계

- **3D CadQuery** → STEP — 형상 SoT (Blender/CNC **입력** 자산)
- **ACTON-GM** → **공구 경로·장비 motion** — 형상 **대체 아님**
- **Circuit** ESP32 펌웨어 ↔ ACTON-GM 은 **게이트웨이·CNC 도메인**에서만 교차




#### §9.2.4 Domain M-code 관리 및 격리 규정 (Normative)

> [!CAUTION] **충돌 방지 원칙**
> 모든 M- 코드는 단독으로 존재하지 않으며, 반드시 APEX Header 의 **Domain ID**와 결합하여 해석된다. 이를 통해 도메인 간 번호 중복 문제를 원천 차단한다.

##### 1. M-code 대역 예약 (Global Range Allocation)
전체 M-code 숫자를 역할에 따라 3 가지 대역으로 강제 분할한다.

| 대역 (Range) | 명칭 | 설명 | 관리 주체 |
| :--- | :--- | :--- | :--- |
| **M000 ~ M099** | **Core Standard** | ISO 표준 기반 범용 명령 (정지, 종료 등) | **NEXAOS Core** |
| **M100 ~ M899** | **Domain Specific** | 각 산업 도메인별 고유 기능 명령 | **Domain Profile** |
| **M900 ~ M999** | **Private / Temp** | 특정 현장/개발용 임시 명령 | **개별 사용자/현장** |

##### 2. Domain ID 기반 격리 (Contextual Isolation)
- **메커니즘**: **ACTON-GM**은 M- 코드를 실행하기 전, 패킷 헤더의 **Domain ID**를 참조하여 해당 도메인의 **M-code 레지스트리**를 로드한다.
- **효과**: `Domain ID: 01(제조)` 의 M150(냉각수 ON) 과 `Domain ID: 02(로봇)` 의 M150(그리퍼 닫기) 은 동일 번호임에도 논리적으로 완벽히 격리되어 충돌하지 않는다.

##### 3. 중앙 레지스트리 운영 규범
- 각 도메인 관리자는 자신의 도메인에서 사용할 M- 코드 리스트를 **Domain Profile**에 등록해야 한다.
- 등록되지 않은 M- 코드가 유입될 경우, 시스템은 이를 **' 미정의 명령 '**으로 간주하고 §10.5 보안 가이드라인에 따라 실행을 차단한다.



### §9.3 HEXAGON Protocol (5W1H) - 참조용

| 축 | 역할 |
| :--- | :--- |
| Where | 공간·좌표·존 |
| When | 시제·순서·지속 |
| Who | 주체·Pulse · **MUST/SHOULD/MAY** (Ethos) |
| What | 대상·FACT/WILL/ECHO |
| How | 방식·강도 |
| Why | 근거·가설 |

- APEX 3 차 해상도와 **기계 간 공통 포맷**
- CSIM: 자연어·센서 → 매트릭스 → **HEXAGON JSON** (Zod 등 스키마 검증 권장)
- Ethos: `[A3 판정]` · `[A4 범위]` 유사 축 — **실행 차단·재추론** — [`_프로토콜.md`](../NEXIA/08_TDD_NEXIA_NEXNAP시스템인터페이스표준규약.md) 가드레일과 정합

**토큰 예:**
" 바람 강함 " → [A2×L2 STUCK 위험] → [MUST] 감속 — SkyTen 등 **도메인 시나리오**는 Robot/Edge 문서.

---

## §10. ACTON-GM · 무결성 검증 · Fetch-Verify-Execute

### §10.0 G 코드 보낼때 Tag — `acton.motion` (ACTON-GM) — **2- 모드 발송 정책 (2026-06-28 갱신)**

> [!IMPORTANT] **ACTON-GM 발송 2- 모드 정책 (Normative)**
> ACTON-GM 은 기계조작 시 G- 코드를 발송하는 **두 가지 모드**를 지원합니다.
> - **Ref 모드**: `programRef` + `contentHash` — 외부 저장소에서 Fetch → Verify → Execute (긴 작업, 정밀 가공, 대량 작업)
> - **Inline 모드**: `inlineBlock` (G- 코드 본문) — 패킷에 직접 포함 → 즉시 실행 (단발성 명령, Hot Path, 초고속 응답)
>
> 두 모드는 **동일한 `type: "acton.motion"` 을 공유**하지만, 첨부 필드 구성이 다르며 무결성 정책 (§10.3.0 AIP) 적용 여부가 분기됩니다.
> 상세한 경로별 정책은 §10.0.2 " 발송 경로 3+1 (Path 1/2/3 + Hybrid)" 참조.

#### §10.0.0.a Ref 모드 필드 — 외부 NC 파일 참조 (Normative)

| 필드 | 필수 | 설명 |
| :--- | :--- | :--- |
| `type` | ✅ | `"acton.motion"` (고정) |
| `programRef` | ✅ | **URI String** — NC 위치 — URI 스킴은 §10.0.1 참조 (예시 일 뿐, 무제한 확장) |
| `contentHash` | ✅ | **Hex String** — **SHA-256 지문** — **무결성의 유일한 척도 (SSOT)** — §10.3.0 AIP · §10.4.1 적용 |
| `profile` | ✅ | Domain Profile id — G/M subset · M-code 레지스트리 |
| `revisionId` | 권장 | NEXAVULT revision · **중복 실행·감사** |
| `sizeBytes` | 권장 | 사전 용량 검사 · 말단 버퍼 할당 |
| `mode` | 권장 | `"ref"` (Ref 모드 명시, 미지정 시 기본값 `"ref"`) |

**예 (Ref 모드, Normative):**

```json
{
  "type": "acton.motion",
  "mode": "ref",
  "programRef": "kore://job/cnc-line3-cut-042",
  "contentHash": "a3f2…c91e",
  "profile": "cnc-laser-v1",
  "revisionId": "rev_042_v3",
  "sizeBytes": 18432
}
```

**동적 실행 메커니즘 (Spec-to-Action Flow):**
1. **Context Loading (시방서 선택)**: 사용자가 디지털 시방서의 특정 공정/규격표를 활성화 (클릭) 하면, 해당 **Job-File**이 `programRef` 를 통해 LLM 의 활성 메모리에 로드된다. 이 시점부터 시방서는 **' 최상위 규범 컨트롤러 '**가 된다.
2. **Intent Capture (불완전 신호 유입)**: 현장의 인간이 몸짓, 음성, 혹은 제스처로 의도를 전달한다. 이 신호는 노이즈가 섞인 **SUM(의미 좌표)** 패킷으로 유입된다.
3. **Knowledge-based Denoising (지식 기반 정제)**: 현장 LLM 은 유입된 불완전한 SUM 을 로드된 **디지털 시방서**와 대조한다.
    - _예: 소음 때문에 " 이동 " 인지 " 정지 " 인지 모호할 때, 시방서상 전체 작업의 성격, 규범과 ' 현재 위치 ' 를 파악하고 LLM 은 이를 ' 행동,보류 ' 중요한 기준을 생성하고 노이즈를 제거한다._
4. **Collaborative Execution (협업 실행)**: 정제된 의도는 시방서의 물리 임계치 내에서 구체적인 G- 코드 (Inline/Ref) 로 전환되어 **ACTON-GM**으로 전송된다.

**지능형 제어 시나리오 (예시):**
- **입력**: 인간의 모호한 손짓 (SUM: A1-Target↑) + 현장 소음 섞인 음성
- **참조**: 디지털 시방서 §4.2 " 용접 경로 가이드라인 및 안전 속도 "
- **LLM 추론**: " 사용자의 손짓은 경로 수정을 의미하나, 시방서 규격상 현재 속도에서의 급격한 회전은 금지됨. 시방서 가이드를 준수하여 완만한 곡선 경로로 보정 실행."
- **결과**: 보정된 G- 코드 발송 및 **NIXIE**를 통해 " 시방서 규격에 따라 경로를 보정하여 이동합니다 " 라고 사용자에게 피드백.

#### §10.0.0.b Inline 모드 필드 — 패킷 내 직접 발송 (Normative)

> [!NOTE] **Inline 모드 무결성 정책 (2026-06-28 확정)**
> Inline 모드는 **자기 해시 불요**입니다. 본문이 패킷 내부에 직접 실리므로 별도 `contentHash` 검증 없이 전송된 바이트열 그 자체가 실행됩니다.
> 이는 §10.3.0 AIP 가 **Ref 모드 (programRef 기반 외부 Fetch) 의 무결성 정책**임이 명확해짐을 의미합니다.
> Inline 모드는 패킷 전송 중 변조 위험이 없는 **신뢰된 내부 채널 (예: ACTON job 채널, §10.6)** 에서만 사용해야 합니다.

| 필드 | 필수 | 설명 |
| :--- | :--- | :--- |
| `type` | ✅ | `"acton.motion"` (고정) |
| `inlineBlock` | ✅ | **String** — G/M 본문 직접 기록 (예: `"G90\nG1 X10 Y0 F500\nM3 S1000"`) |
| `profile` | ✅ | Domain Profile id — G/M subset · M-code 레지스트리 |
| `mode` | ✅ | `"inline"` (Inline 모드 명시, 필수) |
| `sizeBytes` | 권장 | 사전 용량 검사 · 말단 버퍼 할당 |

**Inline 본문 크기 제한 (Strict Limit):**
- **기본 원칙**: 모든 Inline 본문은 **Domain Profile**에 정의된 한도를 초과할 수 없으며, 미정의 시 아래 기본값을 강제 적용한다.
- **CNC / 산업 장비**: `<= 512 Bytes` (초과 시 Ref 모드 권장)
- **로봇 / 다축 제어**: `<= 1 KB`
- **단순 Actuator / IoT**: `<= 128 Bytes`
- **위반 시 처리**: 한도 초과 패킷 수신 시 말단 노드는 즉시 **`STUCK`** 상태로 전이하고 실행을 거부한다.

**Inline 모드 금지/제한 (Normative):**
- `programRef` + `contentHash` 가 **동시에 첨부된 경우** → `mode: "inline"` 이 우선하되, **Ref 필드는 무시** (또는 전송 오류로 간주).
- **신뢰되지 않은 채널**(HTTP 외부 공개, 제 3 자 브로커 등) 에서의 Inline 발송은 **금지** — 외부 변조 시 즉시 실행되어 안전사고 직결.
- Inline 본문 크기는 **Domain Profile 별 `max_inline_bytes` 한도** 이내 (예: CNC `<= 1 KB`, 로봇 `<= 2 KB`, 단순 actuator `<= 256 B`).

**예 (Inline 모드, Normative):**

```json
{
  "type": "acton.motion",
  "mode": "inline",
  "inlineBlock": "G90\nG1 X10 Y0 F500\nM3 S1000",
  "profile": "cnc-laser-v1",
  "sizeBytes": 28
}
```

#### §10.0.0.c 모드 판별 규칙 (Normative)

ACTON-GM 은 다음 우선순위로 모드를 판별합니다:

1. `mode` 필드가 명시되면 → 그 값을 따른다.
2. `mode` 필드가 없고 `inlineBlock` 이 첨부되면 → **Inline 모드**.
3. `mode` 필드가 없고 `programRef` + `contentHash` 가 모두 첨부되면 → **Ref 모드**.
4. 둘 다 없거나 `mode` 만 있으면 → **즉시 `STUCK`** (NEXAON 단독 결정, §8.2 #1).

#### §10.0.1 📌 `programRef` URI 스킴 — **예시 명시 · 무제한 확장 가능**

> [!NOTE] **Normative 원칙 (2026-06-28 확정)**
> G/M 코드가 보관될 수 있는 저장소는 **3 가지로 한정되지 않으며**, 위 표의 `kore://` · `asset://` · `https://` 는 **그저 예시**입니다.
> 실제 운영에서는 사설 FTP, IPFS, NFS 마운트, OPC-UA 서버, 도메인 특화 NAS 등 **임의의 저장소**가 `programRef` 의 대상이 될 수 있습니다.
>
> 따라서 본 문서는 URI 스킴의 종류를 **Normative 로 강제하지 않으며**, **Domain Profile 이 허용한 모든 저장소**를 받아들입니다.
> 무결성은 URI 스킴 종류와 무관하게 **패킷 내 `contentHash` 가 유일한 척도**이므로 (§10.3.0 AIP 참조), 새 저장소 추가는 Domain Profile 의 **허용 목록** 갱신만으로 즉시 지원됩니다.

**예시 (Normative 후보 — 예시 일 뿐, 권장/배제 아님):**

| 스킴 예시 | 예시 URI | 후보 용도 | 비고 |
| :--- | :--- | :--- | :--- |
| `kore://` | `kore://job/cnc-line3-cut-042` | 내부 코어 job 단위 참조 | 예시 |
| `asset://` | `asset://programs/{id}` | 자산 (NC 원본·CAM·포스트) | 예시 |
| `https://` | `https://cdn.example.com/nc/042.nc` | 외부 CDN/HTTPS 캐시 | 예시 (TLS·인증 정책 별도) |
| `ftp://` | `ftp://10.0.0.5/cnc/042.nc` | 사설 FTP 서버 | 예시 |
| `ipfs://` | `ipfs://bafy…/042.nc` | IPFS 분산 저장소 | 예시 |
| `nfs://` | `nfs://nas.local/share/nc/042.nc` | NFS 마운트 | 예시 |
| `opcua://` | `opcua://server/Job/042` | OPC-UA 산업 서버 | 예시 |
| `s3://` | `s3://bucket/path/042.nc` | AWS S3 / MinIO | 예시 |
| _(사용자 정의)_ | `nxp://` · `vlt://` · … | 도메인 특화 프로토콜 | Domain Profile 등록 필요 |

**Domain Profile 등록 규칙 (Normative):**

1. 단일 도메인 내부에서 **여러 스킴을 혼용 가능** — 단, **`default_scheme` 을 Domain Profile 에 선언**하여 우선순위를 명시할 것.
2. 새 URI 스킴 추가는 **Domain Profile 의 `allowed_schemes` 목록에 1 줄 추가**로 즉시 지원.
3. **어떤 스킴이든** Fetch 단계의 TLS·인증 메커니즘은 Domain Profile 이 별도 명시 — §10.3 AIP 참조.
4. §16 Open #9 (Domain M-code 번호대) 확정과 무관하게, URI 스킴 자체는 **Domain Profile 의 자율 영역**으로 운영.

**예 (Normative):**

```json
{
  "type": "acton.motion",
  "programRef": "kore://job/cnc-line3-cut-042",
  "contentHash": "a3f2…c91e",
  "profile": "cnc-laser-v1",
  "revisionId": "rev_042_v3",
  "sizeBytes": 18432
}
```

#### §10.0.2 ACTON-GM 발송 경로 3+1 (Path 1 / Path 2 / Path 3 + Hybrid)

> [!IMPORTANT] **ACTON-GM 의 3 정규 경로 + 1 하이브리드 (Normative)**
> ACTON-GM 은 G/M 코드 발송 시 다음 **3 가지 정규 경로**를 지원하며, 상황에 따라 **1 가지 하이브리드 경로**를 추가로 운용할 수 있습니다.
> 모든 경로는 §10.0 "2- 모드 발송 정책 " 의 `mode: "ref"` 또는 `mode: "inline"` 로 매핑되며, 모드별로 §10.3.0 AIP 의 적용 여부가 분기됩니다.

**정규 경로 3 지 (Path 1 / Path 2 / Path 3):**

| Path | 명칭 | 메커니즘 | 입력 위치 | 발송 모드 | 적용 무결성 정책 | 대표 용도 |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| **Path 1** | **SUM-to-G** (추론형) | Body(SUM 의미) + 맥락 → **NEXAON/LLM 추론** → G- 코드 생성 → ACTON-GM 실행 | `Header + Body` (Tag 없음 또는 `acton.motion` 보정용) | 생성 결과를 Inline/Ref 로 후속 발송 | (생성 경로의 후속 발송 모드 정책 따름) | 자율 동작 · 감성 제어 · 유연한 반응 |
| **Path 2** | **Inline-G** (직접형) | Tag `inlineBlock` 에 **G- 코드 본문 직접 기록** → ACTON-GM 즉시 실행 | Tag `acton.motion` (mode=inline, `inlineBlock`) | **Inline 모드** | ❌ AIP 미적용 (자기 해시 불요, §10.0.0.b) | 단발성 명령 · Hot Path · 초고속 응답 |
| **Path 3** | **Ref-G** (관리형) | Tag `programRef` → **NC 파일 Fetch & Verify** (AIP) → ACTON-GM 실행 | Tag `acton.motion` (mode=ref, `programRef` + `contentHash`) | **Ref 모드** | ✅ AIP 적용 (§10.3.0) | 정밀 가공 · 복합 궤적 · 대량 작업 |

**하이브리드 경로 1 종 (Hybrid — Path 1 + Path 3 융합):**

| 항목 | 내용 |
| :--- | :--- |
| **명칭** | **Hybrid-SUM-Ref** (사전 Job-File 로드 + SUM 추론 융합) |
| **트리거** | SUM 의미 명령 (Body) 수신 |
| **사전 조건** | **작업지시서 Job 파일**(G- 코드 포함 가능) 을 `programRef` 로 **미리 로드**해 둠 |
| **추론 입력** | NEXAON/LLM 이 **현재 상황 (SUM) + 로드된 Job 파일 내용 (G- 코드·템플릿)** 을 근거로 G- 코드 생성 |
| **메커니즘** | (a) 사전: `programRef` + `contentHash` 로 Job 파일 Fetch·Verify·로컬 캐시 → (b) 본: SUM 수신 → LLM 추론 → 결과 G- 코드 생성 → (c) 후: Inline 모드로 즉시 실행 (또는 신규 `programRef` 로 저장 후 Ref 발송) |
| **무결성** | (a) 사전 단계는 **AIP 적용**, (b)(c) 단계는 Inline/Ref 발송 모드 정책 따름 |
| **대표 용도** | 반복 작업 템플릿 + 동적 파라미터 조정 · 작업지시서 기반 상황 적응형 가공 |

**경로 결정 우선순위 (Normative):**

1. **긴 작업·정밀 가공·대량 작업** → **Path 3 (Ref-G)** 우선.
2. **단발성·초고속·Hot Path** → **Path 2 (Inline-G)** 우선.
3. **자율 동작·추론·맥락 의존** → **Path 1 (SUM-to-G)** 우선.
4. **반복 템플릿 + 동적 파라미터** → **Hybrid (사전 Job-File 로드 + SUM 추론)** 우선.

**경로 관계도:**

```json
┌─────────── ACTON-GM 발송 경로 3+1 ───────────┐
│                                                │
│  Path 1 ── SUM-to-G (추론형)                  │
│   └─ Body(SUM) → NEXAON/LLM → G-code 생성     │
│                                                │
│  Path 2 ── Inline-G (직접형, mode=inline)      │
│   └─ Tag.inlineBlock → 즉시 실행 (AIP ❌)       │
│                                                │
│  Path 3 ── Ref-G (관리형, mode=ref)            │
│   └─ Tag.programRef → Fetch·Verify (AIP ✅) → 실행 │
│                                                │
│  Hybrid ── 사전 Job-File 로드 + SUM 추론        │
│   ├─ (a) programRef Fetch·Verify (AIP ✅)       │
│   ├─ (b) SUM 수신 → LLM 추론 (Job 파일 근거)   │
│   └─ (c) 결과 Inline/Ref 발송                  │
│                                                │
└────────────────────────────────────────────────┘
```

**예 (Hybrid, Normative):**

```json
// (a) 사전: Job 파일 로드 — Path 3 Ref 모드
{
  "type": "acton.motion",
  "mode": "ref",
  "programRef": "kore://job/welder-line2-template-007",
  "contentHash": "f8c1…d4b2",
  "profile": "welder-arc-v2",
  "revisionId": "rev_007_v1",
  "sizeBytes": 9216
}
// (b) 본: SUM 의미 명령 수신
//     Header: Domain=제조, Sign=+, Confidence 중간
//     Body: A2×L2 Intensity↑, A1×L2 Origin=라인 2 호 7
// (c) 후: NEXAON/LLM 이 (a)의 Job 파일 + (b)의 SUM 을 융합 추론
//        → 결과 G-코드 생성 → Inline 또는 Ref 로 발송
{
  "type": "acton.motion",
  "mode": "inline",
  "inlineBlock": "G91\nG1 Z-2.0 F100\nM3 S2200\nG4 P0.5",
  "profile": "welder-arc-v2",
  "sizeBytes": 38
}
```

---

- **표준 G / Domain M:** NC **본문**은 `programRef` 대상 저장소에만 존재 — §9.2.2
- **Ethos:** Fetch **전** NEXAON 판정 · Execute **전** MUST(M200 등) + Omnix — §10.3 · §16

예시) 공장 압력 이상

- **HEADER:** Domain=제조, Sign=`-`, Confidence 높음, Ontology=`factory-v2`
- **BODY:** A2×L1 Intensity↑ · A3×L3 Horizon=즉시 · A1×L1 Origin=라인 3
- **TAG:** pressure, threshold, timestamp

---

### §10.3.0 자율 무결성 프로토콜 (Autonomic Integrity Protocol, AIP) — Normative 선언 (Ref 모드 한정, 2026-06-28)

> [!IMPORTANT] **AIP — Normative 선언 (2026-06-28 확정) — 적용 범위: Ref 모드 (Path 3)**
> **Ref 모드 (`mode: "ref"`) 의 외부 저장소 발송에 한해**, APEX Tag `acton.motion` 의 **`contentHash` 가 데이터 무결성의 유일한 척도 (Single Source of Truth for Integrity)** 입니다.
> 어떤 경로 (`kore://` · `asset://` · `https://` · `ftp://` · `ipfs://` · `nfs://` · `opcua://` · `s3://` · 사용자 정의 등) 로 유입된 NC 본문이든, **실행 직전에 ACTON-GM 이 스스로 해시를 계산하여 패킷 내 `contentHash` 와 대조하는 자율 검증 (Self-Verification)** 을 수행합니다.
>
> **Inline 모드 (`mode: "inline"`) 는 AIP 적용 대상이 아닙니다** — 본문이 패킷 내부에 직접 실리므로 자기 해시 불요 (§10.0.0.b). Inline 발송은 신뢰된 내부 채널 (§10.6 ACTON job 채널) 에서만 허용됩니다.

**AIP 의 5 대 원칙 (Ref 모드 한정, Normative):**

1. **저장소 무관 (Storage-Agnostic)** — `programRef` 의 URI 스킴이 무엇이든, ACTON-GM 은 동일한 Fetch → Verify → Execute 흐름을 적용한다.
2. **해시가 유일한 척도 (Hash-as-Truth)** — `contentHash` 가 일치하면 그 데이터는 **어떤 저장소에서 왔든 신뢰**한다. 경로·출처·프로토콜은 부가 정보일 뿐 무결성 판정에 영향을 주지 않는다.
3. **자율 검증 (Self-Verification)** — 외부 신뢰 저장소·중앙 CA·별도 인증 서버에 의존하지 않고, **ACTON-GM 자신이 다운로드한 바이트열에서 SHA-256 을 즉시 계산**하여 검증한다.
4. **경로 실패 격리 (Path Failure Isolation)** — 특정 저장소의 일시적 장애가 **다른 저장소 경로의 실행을 차단해서는 안 된다**. Fetch 실패 시 §10.3 의 3 단계 게이트가 동일하게 작동한다.
5. **실패 시 단일 종결 (Unified Termination)** — 어떤 경로로 유입된 데이터든, Verify 실패 시 즉시 **`STUCK`** 상태로 전이되며, **NEXAON 이 `STUCK` 상태 코드를 단독 부여**한다 (§8.2 핵심 규칙 #1).

**AIP 동작 모델:**

```json
┌─────────────── APEX Packet (acton.motion Tag) ───────────────┐
│  Header: Domain / Ontology / Sign / Tick                        │
│  Body:   3×3 SUM (의미)                                         │
│  Tag:    programRef  ──▶  URI (kore:// | asset:// | https://   │
│                            | ftp:// | ipfs:// | nfs:// | s3://  │
│                            | opcua:// | 사용자 정의 …)           │
│           contentHash ──▶  SHA-256 (64 hex, SSOT)              │
│           profile / revisionId / sizeBytes  (보조 메타)          │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼  (AIP: 경로 무관)
┌─────────────── ACTON-GM 자율 무결성 게이트 ───────────────────┐
│  Fetch   : programRef 해석 → TLS(또는 Domain Profile 인증)     │
│  Verify  : 다운로드 바이트열 → SHA-256 계산 → contentHash 대조   │
│            ✅ 일치 → Execute 진행                                │
│            ❌ 불일치 → 즉시 STUCK (NEXAON 단독 결정)             │
│  Execute : Profile G/M subset 검증 후 컨트롤러 전송              │
└──────────────────────────────────────────────────────────────┘
```

**AIP 와 기존 §3.5 "ACTON-GM · Body vs G/M" 의 관계:**

- §3.5 의 "G/M 본문은 패킷 밖 — NEXAVULT/Asset 저장 후 참조만 전송 " 원칙은 **유지**.
- 본 §10.3.0 AIP 는 그 원칙의 **무결성 측면을 명시화**한 것 — 즉, **Body 는 의미·패킷은 참조·무결성은 해시** 라는 3- 분업을 AIP 가 최종 보증한다.

**AIP 가 보장하지 _ 않는 _ 것 (Scope Limit):**

- **기밀성 (Confidentiality)**: TLS 또는 별도 암호화 채널이 담당 — `SecMode=Encrypted` (Header §5.4) 참조.
- **인증 (Authentication)**: `programRef` 해석 시 TLS·API Key·OAuth 등은 Domain Profile 이 정의 — AIP 의 영역 외.
- **가용성 (Availability)**: 저장소 장애 시의 재시도·폴백은 §10.6 ACTON job 채널 정책에 따름.

AIP 는 이 셋 중 **무결성 (Integrity) 단 하나의 차원만** 자율 보증하며, 나머지는 **Domain Profile 의 책임 영역**으로 위임한다.

---

| 단계 | 주체 | 동작 |
| :--- | :--- | :--- |
| **1. Approve** | NEXAON | Body+`programRef` 해석 · Domain·Ontology · MUST 게이트 |
| **2. Fetch** | ACTON-GM | `programRef` → NEXAVULT/Asset **TLS** 다운로드 |
| **3. Verify** | ACTON-GM | `contentHash` 일치 · `sizeBytes` · Profile **G/M subset** · M-code 레지스트리 |
| **4. Execute** | ACTON-GM | 컨트롤러 전송 · S- 커브·버퍼 · ENVIRON 필터 |
| **5. Record** | NEXAVULT | `revisionId` · FACT · 감사 로그 |

**실패 시:** Hash 불일치 · Profile 위반 · NEXAON 미통과 → **실행 차단** · FACT `STUCK` · NIXIE 알림 — [`06 예외`](../NEXIA/08_TDD_NEXIA_예외상황처리.md)
**말단·저전력:** `programRef` 없이 **Header+Body 만** — 게이트웨이가 캐시된 NC 를 이미 보유한 경우에만 로컬 실행 (캐시 키 = `contentHash`).

### §10.4 무결성 검증 프로세스 (Fetch-Verify-Execute) (Normative)

> [!IMPORTANT] **3 단계 게이트 (Normative) — AIP §10.3.0 구현 · Ref 모드 한정**
> **Ref 모드 (`mode: "ref"`, Path 3)** 의 ACTON-GM 은 `programRef` 로 다운로드한 NC 본문을 **검증 없이** 컨트롤러에 전송할 수 없습니다.
> 아래 3 단계를 **순차·블로킹**으로 수행하며, 어느 하나라도 실패하면 즉시 **`STUCK`** 으로 전이합니다.
> 본 3 단계는 §10.3.0 AIP 의 **저장소 무관 (Storage-Agnostic)** 원칙에 따라 **어떤 URI 스킴으로 유입된 데이터든 동일하게 적용**됩니다.
>
> **Inline 모드 (`mode: "inline"`, Path 2) 는 본 3 단계를 거치지 않습니다** — `inlineBlock` 본문 그 자체가 실행되며, Profile G/M subset 검증 (§10.3 의 #3 단계 일부) 만 수행됩니다 (§10.4.2 참조).

**Ref 모드 — 3 단계 게이트 (Normative):**

| 단계 | 동작 | 실패 시 |
| :--- | :--- | :--- |
| **Fetch** | `programRef` 를 통해 Domain Profile 이 허용한 **임의의 저장소**에서 NC 파일을 다운로드한다. TLS · 인증 메커니즘은 Domain Profile 이 정의 (§10.3.0 AIP 의 인증 영역). | TLS 오류 · 인증 실패 · URI 해석 실패 → 즉시 거부 |
| **Verify** | 다운로드된 파일의 **SHA-256 해시**를 계산하여 Tag `contentHash` 와 **대조**한다. 이 비교는 **유일한 무결성 척도**로 사용된다. | 해시 불일치 · 해시 누락 · 형식 오류 → 즉시 거부 |
| **Execute** | 해시가 **일치할 경우에만** 컨트롤러에 데이터를 전송한다. **불일치 시 즉시 `STUCK` 상태로 전이**하고 보고한다. | (Verify 통과 시에만 진입) |

**3 단계의 본질 (AIP 핵심 메시지):**

- **Fetch 의 책임**: 데이터를 가져온다. **저장소·경로·프로토콜 종류는 무관**하다.
- **Verify 의 책임**: 가져온 바이트열의 **SHA-256 을 계산**하여 패킷 내 `contentHash` 와 대조한다. **이 한 비교가 무결성 판정의 전부**다.
- **Execute 의 책임**: Verify 가 통과한 데이터에 한해 **Profile G/M subset 검증** 후 컨트롤러로 전송한다.

> Fetch 단계에서 어떤 저장소·인증 메커니즘이 사용되었는지는 Verify 단계의 판정에 **전혀 영향을 주지 않습니다**. 그 어떤 저장소에서 가져왔든, **해시가 일치하면 통과, 불일치하면 차단**입니다.

#### §10.4.1 무결성 검증 핵심 필드 (Normative) — `contentHash` 가 SSOT

> [!IMPORTANT] **필드 위계 (Normative)**
> 4 개 필드 중 **`contentHash` 가 무결성의 유일한 척도 (SSOT)** 입니다.
> 나머지 필드는 **데이터 식별·추적·운영 최적화**를 위한 **보조 메타데이터**이며, 무결성 판정에는 직접 사용되지 않습니다 (단, `sizeBytes` 는 잘림·전송 오류 조기 감지에 사용).

| 필드 명칭 | 데이터 타입 | 역할 | 무결성 판정 기여 |
| :--- | :--- | :--- | :--- |
| **`contentHash`** | Hex String | 파일의 무결성을 증명하는 **SHA-256 지문** (소문자 hex 64 자, 정규식 `^[0-9a-f]{64}$`) | **✅ SSOT — 유일한 무결성 척도** |
| `programRef` | URI String | 실행 파일의 물리적/논리적 저장 위치 (URI 스킴 §10.0.1, **예시일 뿐 한정 아님**) | ❌ (Fetch 시 사용, Verify 시 불필요) |
| `sizeBytes` | Integer | 다운로드 후 크기 일치 확인 (잘림·전송 오류 방지, 권장) | ⚠️ 보조 — 전송 결함 조기 감지 |
| `revisionId` | String | NEXAVULT revision · 감사·중복 실행 추적 (권장) | ❌ (감사·로깅용, Verify 시 불필요) |

**필드별 상세 (Normative):**

- **`contentHash` (필수, SSOT)**
  - **정규식 검증**: `^[0-9a-f]{64}$` — 대문자·공백·잘림 모두 **Fetch 단계에서 즉시 거부** (§10.5 위반 항목 #2).
  - **해시 알고리즘**: **SHA-256** 고정 (현재). 다른 알고리즘 (Ed25519, BLAKE3 등) 채택 시 §16 Open #8 (서명 알고리즘) 결정에 따라 변경 가능.
  - **계산 시점**: Fetch 가 완료된 직후 **ACTON-GM 자신이 즉시 계산** — 외부 신뢰 저장소·중앙 CA·별도 인증 서버에 의존하지 않음 (§10.3.0 AIP 원칙 #3).
  - **재계산 정책**: 캐시 히트 시에도 Verify 단계에서 **로컬 재계산**을 수행 — 캐시 키 = `contentHash` (§10.6 캐시 히트 경로).

- **`programRef` (필수, Fetch 식별자)**
  - **역할**: 어디에서 데이터를 가져올지를 지정 — 무결성과 무관.
  - **URI 스킴 무제한**: `kore://` · `asset://` · `https://` · `ftp://` · `ipfs://` · `nfs://` · `opcua://` · `s3://` · 사용자 정의 모두 허용 (§10.0.1).
  - **해석 실패**: TLS 오류 · 인증 만료 · DNS 실패 · 네트워크 단절 등 → **Fetch 단계 거부** (§10.5 위반 항목 #3).

- **`sizeBytes` (권장, 전송 결함 조기 감지)**
  - **역할**: 다운로드 후 크기가 일치하는지 확인 — 잘림·전송 오류를 Verify 이전에 조기 감지.
  - **불일치 시**: 해시 불일치와 동일하게 **STUCK 전이** (해시는 어차피 불일치하므로). 조기 감지의 이점만 제공.

- **`revisionId` (권장, 감사·추적)**
  - **역할**: NEXAVULT 의 revision 식별자 — 중복 실행 추적·감사 로그용.
  - **Verify 판정 무관**: revisionId 가 없어도 무결성 검증은 정상 수행. 부재 시 NEXAVULT 에 `rev_unknown` 으로 기록.

**필드 부재 시 동작 (Normative):**

| 부재 필드 | 동작 |
| :--- | :--- |
| `contentHash` 부재 또는 형식 오류 | **Fetch 단계 즉시 거부** — 어떤 코드 경로에서도 Execute 도달 불가 (§10.5 위반 항목 #2) |
| `programRef` 부재 | **Header+Body 만으로 즉시 실행** 가능 (§10.6 — 말단·저전력 경로, 캐시 히트) |
| `sizeBytes` 부재 | Verify 는 그대로 수행 (해시 비교만으로 충분). 잘림 감지는 약해짐. |
| `revisionId` 부재 | 정상 진행. NEXAVULT 에 `rev_unknown` 으로 감사 로그만 기록. |

**SSOT 요약 표 (한 줄 결론):**

> **무결성의 유일한 척도는 `contentHash` 이다.** 다른 필드는 Fetch 를 가능하게 하거나, 전송 결함을 조기에 감지하거나, 감사 로그를 풍부하게 할 뿐 — **해시 한 비교가 무결성 판정의 전부**이다. 어떤 저장소에서 왔든, 어떤 프로토콜을 사용했든, **해시가 일치하면 통과, 불일치하면 차단** — AIP 원칙 #2 (" 해시가 유일한 척도 ").

#### §10.4.2 Inline 모드 검증 (경량 — Profile G/M subset 만) (Normative)

| 단계 | 동작 | 실패 시 |
| :--- | :--- | :--- |
| **Parse** | inlineBlock 문자열을 G/M 토큰으로 파식 | 파식 오류 → 즉시 거부 |
| **Subset 검증** | Profile g_subset / m_registry 와 대조 — §10.3 의 4 단계 (Execute) 와 동일 | G/M 위반 → 즉시 STUCK |
| **Execute** | 컨트롤러로 즉시 전송 | (통과 시에만 진입) |

> Inline 모드는 **자기 해시 불요** (§10.0.0.b) 이미로 Fetch/Verify 단계가 생락됩니다. 대싣 **신로되는 내부 채널 (§10.6 ACTON job 채널)** 에서만 사용해야 함니다.

### §10.5 보안 가이드라인 (Normative — Ethos 가드레일)

> [!WARNING] **Ethos MUST 게이트**
> 무결성 검증을 통과하지 못한 패킷은 **절대로 물리적 구동부 (Actuator) 에 접근할 수 없다.**
> 이는 자율 노드의 **최소한의 윤리적 가드레일 (Ethos)** 이며, 다음 위반은 **즉시 차단·보고**됩니다:

1. **Verify 실패 → Execute 시도**: 어떤 코드 경로에서도 허용되지 않음.
2. **`contentHash` 누락 또는 형식 오류** (`^[0-9a-f]{64}$` 불일치): Fetch 단계에서 즉시 거부.
3. **`programRef` 해석 실패 / TLS 오류 / 인증 만료**: Fetch 단계에서 거부.
4. **Profile G/M subset 위반** (예: 허용되지 않은 G-code 또는 M-code 포함): Verify 단계에서 거부.
5. **NEXAON MUST 게이트 미통과** (예: 위험 도메인인데 Omnix ACK 없음): Approve 단계에서 거부.

**STUCK 전이 규약 (Normative):**

- 모든 실패는 **NEXAON 이 즉시 `STUCK` 상태 코드 부여** — §8.2 핵심 규칙 #1 (CSIM 은 0/1 판단 안 함, 상태 코드는 NEXAON 단독).
- `STUCK` 토큰은 §8.2 **CT\_-3** 출력으로 NEXAVULT 에 기록되며, NIXIE(모바일 알림) 와 게이트웨이 로그에 동시 보고됩니다.
- 동일 **`contentHash` 실패가 N 회 누적**되면 해당 해시값은 **격리 (quarantine)** 처리되어 이후 자동 실행에서 제외됩니다 (Open #15 — 무한루프 방지 트리거의 " 이벤트 기반 " 경로와 연동). **AIP §10.3.0 원칙 #4 (경로 실패 격리)** 에 따라 격리는 **`programRef` 가 아닌 `contentHash` 단위**로 수행되어, 동일 해시를 가진 다른 저장소 경로의 실행까지 차단되는 부작용을 방지합니다.

### §10.6 패킷 vs ACTON job 채널 — 경로별 발송 채널 매핑

| 상황 / 경로 | 권장 채널 | 발송 모드 | AIP 적용 |
| :--- | :--- | :--- | :--- |
| 말단·워치·저전력 (단순 상태 명령) | **Header + Body 만** — motion 없음 | — | ❌ |
| **Path 1 — SUM-to-G** (자율 추론) | APEX 패킷 (Header+Body) → NEXAON/LLM → 생성 결과를 후속 Inline/Ref 로 발송 | (생성 경로 따름) | (후속 발송 따름) |
| **Path 2 — Inline-G** (단발성·Hot Path) | **ACTON job 채널** (내부 신뢰 채널) 또는 APEX 패킷 Tag (`mode: "inline"`) | **Inline** | ❌ (자기 해시 불요, §10.0.0.b) |
| **Path 3 — Ref-G** (정밀·대량 작업) | APEX 패킷 Tag (`mode: "ref"`, `programRef` + `contentHash`) | **Ref** | ✅ (§10.3.0 AIP) |
| **Hybrid — 사전 Job-File 로드 + SUM 추론** | (a) 사전: Ref 모드로 Job-File 로드 · (b) 본: Header+Body SUM 수신 → (c) 후: Inline 또는 Ref 발송 | Inline/Ref | (a) 단계만 ✅ |
| 캐시 히트 (동일 `contentHash` 보유) | **Fetch 생략** · Verify(**로컬 재계산** hash → `contentHash` 대조) → Execute (§10.4.1 `contentHash` SSOT) | Ref | ✅ (Verify 로컬 재계산) |
| 실시간 S- 커브 **스트림** | **ACTON job 채널** (APEX 패킷 밖) — §10.4 · §16 #10 | Inline 스트림 | ❌ |

**캐시 히트 경로의 AIP 준수 (Normative):**

- 캐시 히트로 Fetch 를 생략하더라도, **Verify 단계의 로컬 해시 재계산은 반드시 수행**합니다 — AIP 원칙 #3 (자율 검증) 에 따라 캐시 자체의 무결성을 신뢰하지 않고 **ACTON-GM 이 직접 다시 계산**합니다.
- 캐시 키는 **`contentHash` 자체**이므로, 동일 해시 = 동일 데이터가 보장됩니다 (§10.3.0 AIP 원칙 #2).

**CNC Domain 예 — 분업 (Body 유지, Normative 예시):**

| Body (의미·Normative) | ACTON-GM (실행·참조만) |
| :--- | :--- |
| A1→Target, A2→Intensity↑, A3→Now | `programRef` → NC 내 `G90` `G1 …` |
| A2→Intensity↓ (감속) | **별도 `programRef`** — NC 내 G/M 본문 |

> [!NOTE] **분업 원칙 재확인 (2026-06-26 갱신)**
>
> - **Body 는 의미만**: 감속도 "A2→Intensity↓" 로 표현. NC 코드 (`M150` 등) 는 Body 에 쓰지 않음.
> - **ACTON-GM 은 참조만**: 감속이 필요하면 **별도의 `programRef`** 를 발급해 NC 본문 (감속 시퀀스) 을 NEXAVULT/Asset 에 저장.
> - **예외**: 만약 동일 `programRef` 로 Intensity↑와 ↓가 모두 표현되어야 한다면, NC 내부에서 분기 처리 (예: 변수·서브루틴) 하고 Body 는 **단일 의미 토큰**만 담는다.
>
> 위 표는 **분업 원칙을 보여주는 예시**이며, **M150 자체의 의미는 비 -Normative**(Open #9) 입니다.

---

## §11. 디자인 패턴 · NEXA 플랫폼 연동 · LLM 시맨틱 가드레일

### §11.0 디자인 패턴 통합 메모 (단일 일러스트레이션 가이드)

> 본 문서는 6 개의 설계 패턴을 언급합니다. 독자가 단일 그림으로 이해할 수 있도록 통합 가이드를 제공합니다.
> 상세 다이어그램은 본 문서 부록 또는 Global Architecture Standard(TDD-001) 에서 유지됩니다.

| 패턴 | 적용 계층 | 역할 (한 줄) | 충돌 방지 규칙 |
| :--- | :--- | :--- | :--- |
| **Cell & Brain 분리** | AXON §3.2 | Cell(MCU) 은 NEXAON 모름 · Brain(중앙) 만 온톨로지 안다 | MCU 코드에 NEXAON import 금지 |
| **Base + Attachment** | APEX §3.0 | Header+Body 만 완결 · Tag 는 선택 | Tag 없는 패킷도 유효해야 함 |
| **순환 정교화** | NEXAON §3.3 | 불완전 씨드 → 실측 충돌 → 보정 → NEXAVULT 저장 → 재사용 | 무한루프 방지: 보정 깊이 상한 3 회 |
| **Hub-and-Spoke** | 전송 §7.2 | PT_3 Cold Path 중앙 · PT_0~2 경량 샤드 | 모든 샤드는 동일 AXON·HEXAGON 규격 |
| **Stack (AL_1~AL_7)** | AXON §4.0 | AL_1→AL_7 순방향 · AL_3(Persona Balancing) LLM 의존 | 역방향 의존 금지 (피드백은 별도 채널) |
| **Hot/Backbone/Stream/Cold** | 전송 §7.2 | UDP·MQTT·TCP/WS·HTTP 분리 | 같은 데이터가 2 개 경로 동시 사용 금지 |

> **패턴 충돌 시 우선순위 (Normative):**
> **Base + Attachment ≻ Cell & Brain 분리 ≻ Hub-and-Spoke ≻ 나머지**
> (가장 기본이 되는 "Base 만으로 완결 " 이 가장 우선)

### §11.1 NEXA 플랫폼 · NEXIA 도메인 연동

| `tabId` | CSIM/AXON |
| :--- | :--- |
| **Omnix** | 멀티모달 입출력 · 승인 · `GlobalFlow/Crew/Solo` ↔ 채널 컨텍스트 |
| **Normex** | HEXAGON Who · MUST/SHOULD · 실행 차단 · **Norm(규범)** — [`00 …`](../NEXIA/08_TDD_NEXIA_구조기술스택운영방침.md) §3 |
| **Logex** | NEXAON · LangGraph · 해석 그래프 |
| **Scribx** | 규칙·코드화 · 패킷 스키마 |
| **Vivex** | 3D·미디어 시각화 · ComfyUI 파이프라인 |
| **Twinex** | ESP32·ESPHome·말단 입력 · **디지털 트윈** · `.nxproj` — [`00 …`](../NEXIA/08_TDD_NEXIA_구조기술스택운영방침.md) §3 |
| **Navex** | 자산·노드 탐색 · 릴레이 컨텍스트 |

**Sync (참고):** 멀티윈도우 `nexia.window.sync.v1` · PiP `nexia.pip.sync.v1` — [`멀티윈도우 · PiP`](../NEXIA/08_TDD_NEXIA_멀티윈도우DocumentPiP.md)

### §11.2 LLM 시맨틱 가드레일

- LLM 명령은 CSIM **판정·범위** 통과 필수 — 미통과 → **실행 차단·재추론**
- **실시간 루프:** Header+Body **비 LLM** · Tag·고차원만 LLM/NEXAON
- Hallucination: Ontology ID · Domain · Confidence · 실측 **NEXAVULT 충돌**로 보정

---

## §12. 멀티모달 출력 · 설계 체크리스트

### §12.0 멀티모달 출력 (Light / Sound / Vibration)

- **시간 동기** — 깜박·비트·진동 주기 일치
- **에너지 곡선** — 밝기↑ ↔ 음량/진동↑
- **성격 매핑** — 색톤 ↔ 음색/질감
- **추상화 규범**: 본문의 `Intensity(A2)` 값은 물리적 진폭이 아닌 **' 전체 출력 대비 비율 '**로 해석한다.
- **해석 실패 시나리오**:
    1. 말단 장비가 해당 강도를 수용할 수 없는 경우, 가장 유사한 **안전 범위** 내에서 실행한다.
    2. 해석이 완전히 불가능한 경우, 즉시 **Inverse CSIM** 경로를 통해 상위 계층에 ' 맥락 보충 ' 을 요청한다.

Header+Body 비 LLM 수신 시에도 동일한 CSIM 매핑 규칙으로 내부 추론을 수행합니다.
한 채널만 수신해도 **전체 메시지 추론** 가능해야 함.


### §12.1 설계 체크리스트 (개요)

| 항목 | 위치 |
| :--- | :--- |
| Sign — Header vs 셀별 | §12.2 |
| 값 — Tag vs 셀 내장 | §12.3 |
| 추론 위치 | §12.4 |

### §12.2 Sign — Header vs 셀별

| 방식 | 장점 | 단점 |
| :--- | :--- | :--- |
| Header 통합 | 경량 · 패킷 톤 | 한 패킷 내 상충 부호 어려움 |
| 셀별 | 축별 분리 | Body 증가 |

**권장:** 말단·단순 명령 → **Header Sign** · 복합 → **패킷 분할** 또는 셀별 검토

### §12.3 값 — Tag vs 셀 내장

**기본 Tag** · 고정장비만 셀 직접값 — 원칙 1·2

### §12.4 추론 위치

| 시나리오 | 권장 |
| :--- | :--- |
| 워치 로컬 AI 강함 | 셀별 Sign·고밀 Body |
| 게이트웨이 중심 | Header Sign + Tag |
| 클라우드 추론 | Raw 근접 + Tag 확장 |

---

## §13. 부록 (A~D)

### §13.1 부록 A — HEXAGON Protocol (5W1H) 참조용

> 본 부록은 §9.3 의 HEXAGON 참조를 보강하기 위한 **참고용** 부록입니다.

| 축 | 역할 |
| :--- | :--- |
| Where | 공간·좌표·존 |
| When | 시제·순서·지속 |
| Who | 주체·Pulse · **MUST/SHOULD/MAY** (Ethos) |
| What | 대상·FACT/WILL/ECHO |
| How | 방식·강도 |
| Why | 근거·가설 |

- APEX 3 차 해상도와 **기계 간 공통 포맷**
- CSIM: 자연어·센서 → 매트릭스 → **HEXAGON JSON** (Zod 등 스키마 검증 권장)
- Ethos: `[A3 판정]` · `[A4 범위]` 유사 축 — **실행 차단·재추론** — [`_프로토콜.md`](../NEXIA/08_TDD_NEXIA_NEXNAP시스템인터페이스표준규약.md) 가드레일과 정합

**토큰 예:**
" 바람 강함 " → [A2×L2 STUCK 위험] → [MUST] 감속 — SkyTen 등 **도메인 시나리오**는 Robot/Edge 문서.

### §13.2 부록 B — 4×4 Draft (비규범)

> 탐색용 기록. **구현·Ethos 기준으로 사용하지 않음.**

| Axis \ Layer | L1 의도 | L2 상태 | L3 관계 | L4 가설 |
| :--- | :--- | :--- | :--- | :--- |
| A1 좌표 | 지향점 | 발생지 | 대상 | 잠재 |
| A2 위력 | 강제성 | 중요도 | 친밀도 | 파급 |
| A3 판정 | 승인/거부 | 정상/오류 | 아군/적 | 기회/위험 |
| A4 범위 | 개인/전체 | 내부/외부 | 직접/간접 | 단기/장기 |

물리 출력 (Draft): Color/Tone · Intensity · Frequency · Duration (0~9) — `Lx-A1A2A3A4-CITD`

### §13.3 부록 C — Core Engine 배치 (`HEXAGON` × PT)

> **이관:** Core Engine Stack (archived 2026-06-13) §0.2 · §3. **개념 허브** = [Global Architecture](../NEXAOS/08_TDD_NEXAOS_전역아키텍처표준_GlobalArchitectureStandard_v1.0.md).

| 기술 | Core Engine | Menton 층 | PT |
| :--- | :--- | :--- | :---: |
| **`Axon`** | `HEXAGON` | ML_0 Reflex | PT_0 ~ PT_3 Gate |
| **`Cosmic`** | `CSIM` | ML_0 CT_1 · Gate CT_2 · ML_3 CT_3 | PT_0 ~ PT_3 |
| **Hot Path** | `ACTON` | ML_0 Reflex | PT_0 ~ PT_2 |

**Hub-and-Spoke:** PT*3 = Cold Path 허브 · PT_0~2 = 경량 샤드 — 말단도 **동일 `Axon` · HEXAGON 규격** ([TDD-040 §0.1](../AI/08_TDD_AI*지능위계및하드웨어사양.md)).

### §13.4 부록 D — LeRobot · E2E 학습 (선택)

- AXON **헌법 변경 없음**
- ACTON 단계에서 **학습 기반 미세동작** 삽입
- 로그: `[camera frames, HEXAGON tokens, ACTON feedback]`
- HEXAGON 정규화 데이터 → 텐서 변환은 **어댑터**로 처리

---

## §14. 표준화 로드맵 · 기대 효과

### §14.0 표준화 로드맵

1. **Step 1:** Core 축·레이어 · 2×2/3×3 역할
2. **Step 2:** v1.0 Header + 18bit Body **필수/선택**
3. **Step 3:** ACTON-GM Domain Profile · M-code 표 · G subset · **programRef Fetch Runbook**
4. **Step 4:** Light/Sound/Vibration 렌더 테이블
5. **Step 5:** 예외·복원·보안 — [`06 예외 상황 처리`](../NEXIA/08_TDD_NEXIA_예외상황처리.md)
6. **Step 6:** Omnix 파일럿 · Twinex/ACTON · CNC/SkyTen 연동

### §14.1 기대 효과

- 언어 장벽·다언어 비용 ↓
- 파형·패킷 **즉각 인지**
- 시각·청각·촉각 **접근성**
- 산업·아트·우주 등 **도메인 재사용**

---

## §15. 외부 의존성 매트릭스 · 관련 문서

### §15.0 외부 의존성 매트릭스

> 본 표는 TDD-043 정본이 **다른 TDD/도메인에 위임한 사항**을 정리합니다.
> 본 문서만으로 해결 불가능한 항목은 아래 표의 책임 측이 결정해야 합니다.

| # | 위임 항목 | 책임 측 (TDD/도메인) | 영향받는 본 문서 절 | 결정 시 본 문서에 반영할 사항 |
| :---: | :--- | :--- | :--- | :--- |
| W-1 | **Body 18bit 바이트 정렬·Endian 정책** | **TDD-044** (Cosmic 데이터) | §5.4 "Header 표준 " · Open #7 | 패딩 정책 + Endian 명시 → §5.4 에 1 줄 추가 |
| W-2 | **0~9 vs Hz/진폭 공식** | TDD-044 / Domain Profile | §12.0 " 멀티모달 출력 " · Open #4 | Domain Profile 별 변환 표 추가 → §12.0 신설 |
| W-3 | ✅ **닫힘 (2026-06-26)** — Ontology ID 는 8bit 유지, **Domain ID 8bit 분리** | TDD-044 (확인용) | §5.4 "Header v1.1" | 본 문서에서 결정 완료 |
| W-4 | ✅ **닫힘 (2026-06-26)** — Confidence **8bit (0~255)** 채택 | TDD-044 (확인용) | §5.4 "Header v1.1" | 본 문서에서 결정 완료 |
| W-5 | ✅ **닫힘 (2026-06-26)** — §10.3 "Fetch·Verify·Execute (Normative)" + §10.4 " 무결성 검증 프로세스 " 책임자 표 명시 · **§10.3.0 AIP (2026-06-28)** 추가 | **TDD-073** (Nexaon) | §10.3 "Fetch·Verify·Execute" · Open #13 | 본 문서에서 결정 완료 |
| W-6 | **Domain M-code 번호대 (M100~M199 등)** | TDD-073 / 도메인 | §9.2.2 "G/M 코드 " · Open #9 | Profile 별 매핑 표 → §9.2.2 정식 절 |
| W-7 | **AL_1~AL_7 의존 방향** | TDD-073 / **TDD-040** (지능위계) | §4.0 "AXON 7- 레이어 " · Open #14 | 단방향 원칙 + 피드백 채널 분리 |
| W-8 | ⚠️ **부분 닫힘 (2026-06-28)** — §10.0.1 에서 URI 스킴을 **예시 명시 + 무제한 확장** 으로 재정의 (Domain Profile `allowed_schemes` 자율 등록). **무결성 판정은 §10.3.0 AIP 에 따라 `contentHash` 단독 SSOT** | TDD-044 / TDD-073 | §10.0.1 "URI 스킴 예시 " · §10.3.0 AIP · Open #9 | **종결** — 더 이상 단일 스킴 확정 불필요. Domain Profile 별 `allowed_schemes` 자율 관리. |
| W-9 | **순환 정교화 무한루프 방지 정책** | **신규 TDD** 또는 §별도 부록 | §3.3 " 원칙 4 순환 정교화 " · Open #15 | 보정 깊이 상한 + 종결 조건 명세 |
| W-10 | **멀티윈도우/PiP 링크 파일 검증** | NEXIA 문서 소유자 | §11.1 "Sync (참고)" | 대상 파일 존재 확인 후 링크 갱신 또는 제거 |

### §15.1 연계 문서 (참조)

| 문서 | 내용 |
| :--- | :--- |
| [NEXNAP 프로토콜](../NEXIA/08_TDD_NEXIA_NEXNAP시스템인터페이스표준규약.md) | gRPC/WS · Ethos · HEXAGON 인터페이스 |
| [음성 인풋 자동화](../NEXIA/08_TDD_NEXIA_음성인풋자동화및확장.md) | STT/TTS · PiP |
| [AI CIRCUIT 제너레이터](../../../NEXA-Platform/docs/Nexia/AI%20CIRCUIT%20제너레이터.md) | ESP32 말단 · Wokwi |

### §15.2 관련 문서 (상위/인접)

| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXA OS 설계 표준 · 미션 크리티컬 전략 (TDD-001)](../NEXAOS/08_TDD_NEXAOS_설계표준_미션크리티컬전략.md) |
| Cosmic | [Cosmic · 전역 데이터 아키텍처 (TDD-044)](./08_TDD_CosmicLanguage_전역데이터아키텍처.md) |
| 전역 아키텍처 | [Global Architecture Standard](../NEXAOS/08_TDD_NEXAOS_전역아키텍처표준_GlobalArchitectureStandard_v1.0.md) |
| NEXNAP | [NEXNAP 시스템 인터페이스 표준 규약 (TDD-023)](../NEXIA/08_TDD_NEXIA_NEXNAP시스템인터페이스표준규약.md) |
| Nexaon | [Nexaon Distillation 오케스트레이터 (TDD-073)](../NEXIA/Nexaon/08_TDD_Nexaon_Distillation오케스트레이터_v1.0.md) |
| 지능위계 | [지능위계 및 하드웨어 사양 (TDD-040)](../AI/08_TDD_AI_지능위계및하드웨어사양.md) |

**문서 상태 (2026-06-26 갱신):** `status: draft` — CSIM · Axon · AL_1~AL_7 · **APEX v1.0 (Header)** · ACTON-GM programRef · **Fetch-Verify-Execute (Ethos MUST)** · Body≠G-code · Open 12 개 미해결 (총 16 개 중 4 개 닫힘).
_Normative 표기는 §16 Open 12 개 (닫힘 4 개) 와 충돌하지 않는 범위에서만 유효합니다._

---

## §16. 미확정 (Open)

아직 **닫지 않은** 항목 — 표준 확정 전 보완 필요.

| #     | 항목                                       | 방향                                                                                                                      | 의존성               |
| :---- | :--------------------------------------- | :---------------------------------------------------------------------------------------------------------------------- | :---------------- |
| ~~1~~ | ~~5×5 필요성~~                              | ✅**폐기 (2026-06-29)** — 3×3+Tag 구조로 충분히 대체 가능함을 확인                                                                       | —                 |
| 2     | A4(4×4) 축 의미                             | ✅**부록 A** 유지 · Normative 아님 , 운영 진행 하면서 차후에 대응                                                                          | —                 |
| 3     | L4 vs L5 레이어 수                           | ✅§13.2 부록 B — 4×4 Draft (비규범) 유지 · Normative 아님 **3×3 L1~L3** 고정                                                        | —                 |
| 4     | 0~9 vs Hz/진폭 **공식**                      | ✅**확정 — **가변 해상도 정책** 채택. **Body**는 추상적 의도 (0.0~1.0) 를, **Tag**는 구체적 명세 (물리 단위) 를 담당. 해석 불가 시 **Inverse CSIM**을 통한 맥락/지능 보정 | TDD-044           |
| 5     | ~~장거리·저품질 채널~~                           | ✅**채널~~                           | ✅**채널~~                           | ✅**가변 해상도 정책**가변 해상도 정책**Body**Body**Tag**Tag**Inverse CSIM**Inverse CSIM**채널~~                           | ✅**채널~~                           | ✅**가변 해상도 정책**가변 해상도 정책**              | ✅**Body**Body** ✅**Tag** — **Inverse CSIM** 기반 무결성 검증을 기본으로 하되, 상위 서명은 Domain Profile 의 선택적 레이어로 위임.                         | —                 |
| 9     | ~~Domain M-code 번호대~~                    | ✅**채널~~                           | ✅** — **Body**              | ✅** 수립 완료 (Core: 0~99, Domain: 100~899, Private: 900~999).                | TDD-073           |
| 10    | ~~ACTON job 실시간 스트림 vs Ref 경계~~          | ✅**Tag** — **Inverse CSIM** 완료. 실시간 스트림은 **채널~~                           | ✅** ✅**, 단위 작업은 **가변 해상도 정책**              | ✅** 사용.               | —                 |
| 11    | ~~Ontology ID 8-bit 한계 (256 개)~~         | ✅ **Body** — Domain ID 8bit 분리 채택 (v1.1)                                                                     | TDD-044 (확인용)     |
| 12    | ~~Confidence 6-bit (0~63) 해상도 부족~~       | ✅ **Tag** — Confidence 8bit (0~255) 채택 (v1.1)                                                               | TDD-044 (확인용)     |
| 13    | ~~ACTON-GM Fetch·Verify·Execute 책임자 모호~~ | ✅ **Inverse CSIM** — §10.3 " 무결성 검증 프로세스 (Fetch-Verify-Execute)" + §10.3 "Fetch·Verify·Execute (Normative)" 책임자 표     | TDD-073           |
| 14    | **가변 해상도 정책**              | ✅**          | 순방향 단방향 원칙 명세 · 피드백 채널 분리                                                                                               | TDD-073 / TDD-040 |
| 15    | ~~순환 정교화 (§3.3) 무한루프 방지~~                | ✅ **Body** ✅** — §8.3.2 Max Depth=3 및 수렴 조건 명세 완료                                                                | -                 |
| 16    | ~~Inverse CSIM 단계 명세 (CT*-1~CT*-3)~~     | ✅ **Tag** — 본 문서 §8.2 "CSIM ↔ NEXAON 단계별 책임 " 표에 명세 추가                                                       | —                 |
| 17    | Inline 모드 max_inline_bytes 도메인별 한도       | ✅**§9.2.4 M-code 대역 예약 정책** — **Inverse CSIM** (CNC 512B, 로봇 1KB, IoT 128B). §10.0.0.b 에 규범 명시 완료.                                | TDD-073 / 도메인     |
| 18    | Hybrid 경로 LLM 추론 정책                      | 📌 [추가 별도 상세 필요] Hybrid(SUM + 사전 Job-File) 시 NEXAON/LLM 의 추론 안전장치 (Sandbox · Dry-run · 결과 검증) — §10.0.2 Hybrid 메커니즘      | TDD-040 / TDD-073 |

**채널~~                           | ✅**_PLACEHOLDER} | ✅** 총 **가변 해상도 정책** 중 **Body** (#11·#12·#13·#15·#16 — #17·#18 Inline/Hybrid 신규).
**Tag** ✅** **채널~~ | ✅**_PLACEHOLDER} | ✅** 모두 해결 (D-9: AIP + SSOT, D-10: 2- 모드 + 3+1 경로).
