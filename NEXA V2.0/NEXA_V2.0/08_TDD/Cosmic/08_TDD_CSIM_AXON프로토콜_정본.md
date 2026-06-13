---
doc_id: TDD-043
title: "CSIM · AXON 프로토콜 정본"
category: "08_TDD"
domain: NEXAOS
status: published
created: 2026-06-10
updated: 2026-06-10
parent_doc: TDD-001
terms_standard: ["mqtt", "protobuf", "pwm"]
terms_nexa: ["CSIM", "AXON", "APEX", "HEXAGON", "ACTON", "NEXAVULT"]
tags: ["doc/cat/08-tdd", "doc/domain/nexaos", "std/mqtt", "std/protobuf", "std/pwm", "nexa/CSIM", "nexa/AXON", "nexa/APEX", "nexa/HEXAGON", "nexa/ACTON", "nexa/NEXAVULT"]
---
# CSIM · AXON 프로토콜 (정본)

**한 줄:** 인간·AI·기계의 의도를 **의미 매트릭스(APEX)** 로 압축하고, **HEXAGON(5W1H)** 으로 정규화하며, **NEXAON/NEXAVULT** 로 해석·학습해 **ACTON** 으로 물리 실행하는 **우주언어(Cosmic Language)** 프로토콜

> **G/M 없이도** PWM·MQTT·빛·진동 등 실행 가능하며, CNC·로봇 등 **엑추에이터의 구체 궤적·장비 명령**이 필요한 도메인만 **ACTON-GM(G/M)** 으로 NEXAVULT **`programRef`** 를 Fetch·검증·실행한다.

- **Normative (규범):** 구현·리뷰·Ethos 가드레일의 **단일 기준**

> 연동: [`NEXNAP 인터페이스 규약`](../NEXIA/08_TDD_NEXIA_NEXNAP시스템인터페이스표준규약.md) · [`멀티윈도우 · PiP`](../NEXIA/08_TDD_NEXIA_멀티윈도우DocumentPiP.md) · [`NEXIA 외부 엔진`](../NEXIA/08_TDD_NEXIA_외부엔진및아키텍처.md)

---

## 0. 핵심 규범 요약

| 항목          | 규범                                                                                |
| ------------- | ----------------------------------------------------------------------------------- |
| 매트릭스 크기 | **용도별 병행** — §5                                                                |
| 패킷 헤더     | **APEX v0.16 — 64-bit** — §9                                                        |
| Body 인코딩   | **3×3 × 2-bit/셀 = 18-bit** (+/-,0) — §10                                           |
| 4×4 매트릭스  | **부록 A — Draft, 비규범**                                                          |
| AXON 레이어   | **7-레이어** — **ACTON-GM ⊂ L6** — §4 · §4.1                                        |
| G/M 실행      | **ACTON-GM** — 패킷은 **`programRef`만** · G/M 본문은 NEXAVULT/Asset — §3.1 · §12.3 |

---

## 1. 목적과 범위

본 문서는 **Cosmic Semantic Interface Matrix (CSIM)** 및 **AXON** 스택의 개념·구조·패킷·운영 원칙을 **구현 가능한 수준**으로 정의한다.

- **입력:** 인간/AI 의도, 센서·상태, 관계·가설
- **변환:** 레이어×축 매트릭스 + 온톨로지 맥락
- **출력:** 빛·소리·진동·디지털 패킷·물리 실행(G-code/PWM 등)

**핵심 관점**

- 언어 = 단어가 아니라 **상태를 바꾸는 파형·패킷**
- 번역 = 텍스트 변환이 아니라 **물리량·의미 좌표 매핑**
- 맥락(온톨로지)이 전제되면 **매트릭스는 단순해도** 도메인별 수치·단위는 프로젝트에서 고정 가능

---

## 2. AXON Design Principles

### 2.1 원칙 1 — Base + Attachment

> 모든 레이어는 **Base만으로 작동** 가능해야 한다. Attachment는 **선택**으로 정밀도를 높인다.

```
Base        →  단독 완결 (Header + Body)
Attachment  →  Tag · acton.motion(programRef) · 도메인 M-code 프로파일
              →  G/M **본문은 패킷 밖** — NEXAVULT/Asset 저장 후 참조만 전송
```

### 2.2 원칙 2 — 구조 결정 기준 (매트릭스 크기)

> **고정 정답 없음.** 도메인·상황에 맞게 선택.

| 검토 조건       | 영향                                              |
| --------------- | ------------------------------------------------- |
| **인터페이스**  | 말단 단순 → 축·셀 감소 · UI 복잡 → 셀 직접 입력   |
| **AI 성능**     | AI 강함 → Body 추상 유지 · 약함 → Tag·구체값 보완 |
| **도메인 철학** | 정밀 → 3×3 + Tag · 속도 → 2×2 + Header Sign       |
| **확장**        | Base+Attachment 준수 — 심플에서 정확으로          |

### 2.3 원칙 3 — 세포와 두뇌의 분리

```
Sign / Body  →  사실 + 방향성만 (온톨로지 모름)
NEXAON        →  해석 · 판단 · 0/1 결정 (세포를 앎)
```

### 2.4 원칙 4 — 순환 정교화

```
불완전한 씨드 → AI 해석 → 오류(신호)
      ↓
실측 충돌 → NEXAON 보정 → 정확도 ↑
      ↓
NEXAVULT 저장 → 재사용 → 순환
```

### 2.5 AXON 한 줄 정의

> **AXON**은 말단의 단순 신호에서 중앙의 정밀 지식으로 **수렴하는 순환 시스템**이다. Base만으로 완결되고 Attachment로 확장된다. 세포는 두뇌를 모르고, 두뇌는 순환으로 정교해진다.

---

## 3. 용어 · 구성요소

| 이름               | 풀네임                                    | 역할                                                                                      |
| ------------------ | ----------------------------------------- | ----------------------------------------------------------------------------------------- |
| **CSIM**           | Cosmic Semantic Interface Matrix          | 의미 **번역 엔진** — 모호한 의지 ↔ 물리량                                                 |
| **APEX Matrix**    | Adaptive Perception and Expression Matrix | 시맨틱 **인터페이스** — 직관→인포→패킷                                                    |
| **HEXAGON**        | Six-Axis Tokenized Interaction Standard   | **5W1H** 전송·문법 — Where/When/Who/What/How/Why                                          |
| **NEXAON**         | NEXA Ontology                             | Human ↔ AI **온톨로지·해석**                                                              |
| **NEXAVULT**       | NEXA Knowledge Vault                      | 지식 **저장·재사용** (원본+벡터)                                                          |
| **ACTON Synapse**  | Active Transition & Operation             | 디지털→**물리 실행** · S-커브·토크·버퍼 — G/M **불필요** 경로 포함                        |
| **ACTON-GM**       | ACTON **G/M Execution Bridge**            | **엑추에이터 구체 명령** — 축·궤적·스핀들 G/M · NEXAVULT **`programRef`** Fetch·검증·실행 |
| **acton.motion**   | ACTON Motion Tag                          | APEX **Attachment** — `programRef` + 무결성 메타 — §8.4.1                                 |
| **ENVIRON Shield** | Environmental Sensing & Response          | **외부** 환경·복지·EMI — 제어 진입 전 필터                                                |

**신호 흐름 (요약):**

```
APEX → HEXAGON → NEXAON → NEXAVULT → NEXAON → HEXAGON → APEX
                              ↓
                   ACTON (+ ACTON-GM: G/M)
                              ↓
                         물리 (축·모터·스핀들)
                              ↑
                         ENVIRON (외부)
```

**APEX 내부 해상도:**

```
1차  직관 신호     (음악, 색, 형태, EMG)
2차  인포그래픽    (제스처, 시각화)
3차  APEX 패킷     Header / Body / Tag
```

### 3.1 ACTON-GM · Body vs G/M (Normative 요약)

**Body(18bit)는 G-code로 대체하지 않는다.** 의도·강도·시간축은 **APEX Body**에 둔다.  
**G/M 본문은 APEX 패킷에 실지 않는다.** Tag는 **저장소 위치(`programRef`)** 와 **무결성 메타**만 담는다.

| 채널                   | 패킷      | 내용                                                  |
| ---------------------- | --------- | ----------------------------------------------------- |
| **Body**               | ✅        | 의미·의도 — Target↑ · Intensity↑ · Horizon=Now        |
| **Tag `acton.motion`** | ✅ (선택) | `programRef` · `contentHash` · `profile` — **참조만** |
| **ACTON-GM (런타임)**  | ❌        | Fetch → Verify → Execute — §12.3.3                    |
| **NEXAVULT / Asset**   | ❌        | NC 원본 · CAM·포스트·S-커브 **SoT**                   |

```
패킷 (짧음)     programRef ──→  NEXAVULT/Asset (G/M 본문)
     │                              │
     └─ Body 의미 ──→ NEXAON ──→ Fetch · Hash 검증 · Ethos · 실행
```

- **표준 G-code** — ISO/관례 — 저장소 NC 내부 · Domain Profile **허용 subset** — §12.3.2
- **Domain M-code** — NEXAON·NEXAVULT·ENVIRON·Ethos — Profile **M-code 레지스트리** — §12.3.2
- **실시간 스트림** — APEX Tag가 아닌 **ACTON job 채널** (패킷 밖) — §12.3.4

---

## 4. AXON 7-레이어 아키텍처 (Normative)

플랫폼 **NEXA OS** 정체·Identity/Capability ID는 [`08_TDD_NEXAOS_도메인레지스트리명세`](../NEXAOS/08_TDD_NEXAOS_도메인레지스트리명세.md) 참조. 본 절은 **신호·의미 스택**만 규정.

| #   | 구성요소             | 역할                                                           | 소통             |
| --- | -------------------- | -------------------------------------------------------------- | ---------------- |
| L1  | **APEX Matrix**      | 인간 입력 → 3×3(또는 단계별 2×2) 패킷 · 3상(+/-/0) · Delta     | 인간 ↔ 시스템    |
| L2  | **HEXAGON Protocol** | 5W1H **6축 정수 토큰** — 정규화 문법                           | 기계 ↔ 알고리즘  |
| L3  | **Coil Balancer**    | 페르소나 파라미터 **Zero-sum(합=100)** — AI 추론 가이드        | 인간 ↔ AI        |
| L4  | **NEXAON Network**   | APEX+HEXAGON **해석** · 엣지 자체처리·후보고 · 중앙 고차원     | 알고리즘 ↔ AI    |
| L5  | **NEXAVULT**         | Seed·로그·벡터 **이중 저장** · 준공·개인화                     | 플랫폼 ↔ 전 구간 |
| L6  | **ACTON Synapse**    | 범용 **물리 실행** · S-커브·토크·버퍼 — **ACTON-GM**은 L6 선택 | 시스템 ↔ 물리    |
| L7  | **ENVIRON Shield**   | 바람·지형·EMI·사용자 복지 — **Jitter 차단**                    | 환경 ↔ 시스템    |

**ACTON Synapse** 상세 구조:

```
L6 ACTON Synapse
├── (기본) 범용 실행 ── PWM · MQTT · 빛·진동 …
└── (선택) ACTON-GM  (CNC · 로봇 · SkyTen 등 Domain Profile) ── programRef → NEXAVULT/Asset → G/M → 컨트롤러
```

**설계 의도**

1. **HEXAGON 전진 배치** — 원시 신호를 조기에 5W1H로 정규화 → 무결성 선확보
2. **NEXAON 이원화** — 엣지 **실시간** + 중앙 **고차원 추론**
3. **ACTON / ENVIRON 분리** — 내부 근육·신경 vs 외부 위협·복지
4. **ACTON-GM ⊂ L6** — 7-레이어 유지 · G/M은 **Attachment급** 선택 브리지 — §4.1

**LeRobot 등 E2E 학습:** AXON **구조 변경 없이**, ACTON 단계 **선택 라이브러리**. 학습 데이터 = `[영상 + HEXAGON 토큰 + ACTON 피드백]` 로깅 권장 — 부록 B.

---

## 5. 매트릭스 패밀리 (용도별 병행)

| 구분            | 2×2                           | 3×2                    | 3×3 APEX              | 4×4        |
| --------------- | ----------------------------- | ---------------------- | --------------------- | ---------- |
| **셀**          | 4                             | 6                      | 9                     | 16         |
| **시간·가능성** | 동일 셀 혼재 위험             | D3 가능성              | L3 Projection 정식    | 부록 Draft |
| **맥락**        | HEXAGON 말단 · EMG · 4버튼 UI | 2×2↔3×3 절충           | APEX Body · 온톨로지  | 부록 Draft |
| **AXON**        | Base 극대화                   | Base + 얇은 Attachment | Body + Tag Attachment | **비규범** |

**권장 파이프라인:**

```
말단 입력  →  2×2   (빠름·단순)
중간 변환  →  AI/규칙으로 시간성 보완
APEX Body  →  3×3   (완전 의미 구조)
정밀       →  + Tag (선택)
```

---

## 6. 2×2 Semantic Matrix

### 6.1 축

| Axis \ Layer  | L1 Action (외부·동적)      | L2 State (내부·정적) |
| ------------- | -------------------------- | -------------------- |
| **A1 Vector** | Targeting — 출력·이동·전달 | Position — 소속·위치 |
| **A2 Scale**  | Intensity — 강제·에너지    | Range — 영향권·범위  |

### 6.2 극성 (예)

- L1-A1 +1: 접근·발송 / +0: 회피·차단
- L2-A1 +1: 내부·연결 / +0: 외부·단절

### 6.3 말단 패킷 골격 (초경량)

| 필드 | Header | Time | Polarity | Matrix(4b) | Tail |
| ---- | ------ | ---- | -------- | ---------- | ---- |

상위: **`[Header] + [Semantic Matrix] + [Tag/Value]`**

### 6.4 강점 · 한계

- **강점:** 4버튼·IoT·저비트 · 도메인 무관 4칸
- **한계:** **시간성 부재** — “지금 142bar” vs “곧 142bar” 구분 어려움 → Tag 의존 또는 3×2/3×3 승격

---

## 7. 3×2 절충

|        | D1 작용 | D2 상태 | D3 가능성 |
| ------ | ------- | ------- | --------- |
| **A1** | Target  | Source  | Bearing   |
| **A2** | Power   | Scale   | Potential |

2×2보다 **가능·예측** 축 분리 · 3×3보다 가벼움 — **원칙 2**로 선택.

---

## 8. 3×3 APEX Matrix — Normative Body

### 8.1 패킷 구조

```
┌─────────────┐
│   HEADER    │  64-bit (v0.16) — §9
├─────────────┤
│    BODY     │  3×3 시맨틱 · 18-bit 3상 — §10
├─────────────┤
│    TAG      │  선택 — §8.4
└─────────────┘
```

### 8.2 HEADER (논리 필드)

| 필드        | 역할                                      |
| ----------- | ----------------------------------------- |
| Ontology ID | NEXAVULT 시방·매핑 규칙                   |
| Domain      | 추론 범위 고정 (Factory / Space …)        |
| Version     | 패킷 규격                                 |
| Confidence  | 0~1 — 씨드 vs 보정 가중                   |
| Sign        | **의미 발생** 트리거 · 유휴(0) 시 RF 절전 |
| Priority    | QoS · 재전송                              |
| Tick/ID     | 인과·누락 검출                            |
| Power Stat  | Eco — Tag 생략·주기 연장                  |

### 8.3 BODY — 3×3

| Axis \ Layer     | **L1 Signal** | **L2 Context** | **L3 Projection** |
| ---------------- | ------------- | -------------- | ----------------- |
| **A1 Field**     | Origin        | Proximity      | Target            |
| **A2 Magnitude** | Intensity     | Influence      | Potential         |
| **A3 Temporal**  | Moment        | Duration       | Horizon           |

### 8.4 TAG (Attachment)

| 필드             | 예                            |
| ---------------- | ----------------------------- |
| 구체 수치        | `pressure: 142bar`            |
| 임계             | `threshold: 120bar`           |
| 시간             | ISO8601                       |
| 좌표             | `line: 3, zone: B`            |
| **acton.motion** | `programRef` — §8.4.1 · §12.3 |

**운용**

| 상황     | 구조                 |
| -------- | -------------------- |
| 일반     | Header + Body        |
| 정밀     | + Tag                |
| NEXAVULT | Body→벡터 · Tag→원본 |

#### 8.4.1 Tag — `acton.motion` (ACTON-GM)

**Body(18bit)를 G-code로 대체하지 않는다.** G/M **본문은 패킷에 넣지 않는다** — **저장소 참조만** Attachment.

| 필드          | 필수 | 설명                                                     |
| ------------- | ---- | -------------------------------------------------------- |
| `type`        | ✅   | `"acton.motion"` (고정)                                  |
| `programRef`  | ✅   | NC 위치 — `kore://job/{id}` · `asset://programs/{id}` 등 |
| `contentHash` | ✅   | SHA-256 (hex) — 다운로드 후 **일치 검증**                |
| `profile`     | ✅   | Domain Profile id — G/M subset · M-code 레지스트리       |
| `revisionId`  | 권장 | NEXAVULT revision · **중복 실행·감사**                   |
| `sizeBytes`   | 권장 | 사전 용량 검사 · 말단 버퍼 할당                          |

**금지 (Normative):** Tag에 G/M 문자열 **`block` 인라인** — RF·재전송·감사·Ethos 검증 모두 불리.

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

- **표준 G / Domain M:** NC **본문**은 `programRef` 대상 저장소에만 존재 — §12.3.2
- **Ethos:** Fetch **전** NEXAON 판정 · Execute **전** MUST(M200 등) + Omnix — §12.3.3 · §17

### 8.5 예시 — 공장 압력 이상

- **HEADER:** Domain=제조, Sign=`-`, Confidence 높음, Ontology=`factory-v2`
- **BODY:** A2×L1 Intensity↑ · A3×L3 Horizon=즉시 · A1×L1 Origin=라인3
- **TAG:** pressure, threshold, timestamp

---

## 9. APEX Header v0.16 — 64-bit (Normative)

| 필드          | Bits | 설명                                         |
| ------------- | ---- | -------------------------------------------- |
| Magic Byte    | 8    | `0x41` ('A') — APEX 동기                     |
| Ontology ID   | 8    | 프로젝트 0~255                               |
| Domain & Ver  | 8    | Domain 4 + Version 4                         |
| Tick / ID     | 16   | 시퀀스 · 롤오버                              |
| Confidence    | 6    | 0~63                                         |
| Sign          | 2    | `00` 유휴 · `01` + · `10` - · `11` 예비/중립 |
| Priority      | 2    | 0~3                                          |
| Power Stat    | 4    | 배터리 16단계 (~6.25%)                       |
| Ack Flag      | 1    | 1=수신 확인·재전송                           |
| Compress Flag | 1    | Body 압축                                    |
| Checksum      | 8    | 8-bit CRC                                    |

**합계: 64 bit**

**운용**

- **Ack=1:** 중요 명령(정지 등) — 응답·재전송
- **Ack=0:** 상태 보고 — Deep Sleep 우선
- **Sign=0 + Confidence 낮음:** 노이즈로 폐기 가능
- **Power Stat 낮음:** Tag 생략 · 주기 연장

> C 구조체·CRC 구현은 구현 Runbook — 본 문서는 **비트 레이아웃**만 규범.

---

## 10. 3상 논리 · 18-bit Body

**전송:** 2진 · **의미:** 3상 (+ / - / 0)

| 2-bit | 의미                                |
| ----- | ----------------------------------- |
| 00    | Neutral — 해당 축 **비집중** (정보) |
| 01    | + Positive                          |
| 10    | - Negative                          |
| 11    | 예비 / Error                        |

- **9셀 × 2bit = 18bit Body** (ESP32 말단에 적합)
- **0**은 “데이터 없음”이 아니라 NEXAON에 **맥락 힌트**
- 근육: (+) 수축 · (-) antagonist · (0) 이완 — 생체·산업 공통

**제어 vs 추론 분리**

| 계층        | 지연                    | 내용                                                  |
| ----------- | ----------------------- | ----------------------------------------------------- |
| Header+Body | **결정론 · 1ms 미만급** | LLM 불필요 · 실시간 제어                              |
| Tag         | **비동기**              | LLM·NEXAON 보정 · **acton.motion(programRef)** · 로그 |
| NEXAVULT    | **배치**                | 순환 학습                                             |

---

## 11. HEXAGON Protocol (5W1H)

| 축    | 역할                                     |
| ----- | ---------------------------------------- |
| Where | 공간·좌표·존                             |
| When  | 시제·순서·지속                           |
| Who   | 주체·Pulse · **MUST/SHOULD/MAY** (Ethos) |
| What  | 대상·FACT/WILL/ECHO                      |
| How   | 방식·강도                                |
| Why   | 근거·가설                                |

- APEX 3차 해상도와 **기계 간 공통 포맷**
- CSIM: 자연어·센서 → 매트릭스 → **HEXAGON JSON** (Zod 등 스키마 검증 권장)
- Ethos: `[A3 판정]` · `[A4 범위]` 유사 축 — **실행 차단·재추론** — [`_프로토콜.md`](../NEXIA/08_TDD_NEXIA_NEXNAP시스템인터페이스표준규약.md) 가드레일과 정합

**토큰 예:**  
“바람 강함” → [A2×L2 STUCK 위험] → [MUST] 감속 — SkyTen 등 **도메인 시나리오**는 Robot/Edge 문서.

---

## 12. NEXAON · NEXAVULT

### 12.1 NEXAON

- Sign/Body **해석** · 0/1 실행 판정
- 엣지: **자체 처리·후보고** · 중앙: 고차원·온톨로지 갱신
- **세포(말단)는 NEXAON을 모름** — §2.3

### 12.2 NEXAVULT (_NEXA Knowledge Vault_)

- 백오피스 **지식(데이터) 허브** — 적재 · 보관 · 재사용 (원시 + 가공)
- Body → **벡터** · Tag → **원본** 이중 보존
- Seed·오류·실측 충돌 → **순환 정교화** — §2.4
- Ontology ID ↔ 시방서 매핑 — Header 연동

### 12.3 ACTON-GM — G-code · M-code (Normative)

**ACTON-GM**은 ACTON Synapse(L6)의 **실행 어휘(lexicon)** 이다.  
**의미(Body)** · **패킷(Tag=참조)** · **실행 본문(NEXAVULT/Asset)** 을 분리한다.

#### 12.3.1 역할 분담

| 계층                        | 담당                 | 내용                                           |
| --------------------------- | -------------------- | ---------------------------------------------- |
| **APEX Body**               | 의도·맥락            | 18bit 3상 — Target/Intensity/Horizon 등        |
| **APEX Tag `acton.motion`** | 선택 Attachment      | **`programRef` + `contentHash`** — G/M 본문 ❌ |
| **NEXAVULT / Asset**        | NC **SoT**           | CAM·포스트·생성 NC **원본 저장**               |
| **ACTON-GM (런타임)**       | Fetch·Verify·Execute | NEXAON/Ethos 통과 후 **다운로드→검증→전송**    |

```
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

#### 12.3.2 표준 G-code · Domain M-code

| 구분         | 범위                                    | 등록                                                 |
| ------------ | --------------------------------------- | ---------------------------------------------------- |
| **표준 G**   | G0/G1/G2/G3, G4, G90/G91, G28, F/S/T 등 | **ISO/관례** — Domain Profile이 **허용 subset** 선언 |
| **Domain M** | M100~M199 (예) NEXAON·NEXAVULT·ENVIRON  | **Domain Profile 표** — Core 축 변경 ❌              |
| **금지**     | Body를 ASCII G-code로 **대체**          | **비규범**                                           |
| **금지**     | Tag에 G/M **`block` 인라인**            | **비규범** — §8.4.1                                  |

**Domain M-code 예 (Draft — 번호는 Profile별 확정):**

| 코드 | 의미 (예)                              |
| ---- | -------------------------------------- |
| M150 | NEXAON sync / 후보고 트리거            |
| M160 | ENVIRON 스냅샷 요청                    |
| M170 | NEXAVULT segment 로그 시작/종료        |
| M200 | Ethos **MUST** 게이트 — Omnix ACK 대기 |

#### 12.3.3 Fetch · Verify · Execute (Normative)

| 단계           | 주체           | 동작                                                                          |
| -------------- | -------------- | ----------------------------------------------------------------------------- |
| **1. Approve** | NEXAON · Ethos | Body+`programRef` 해석 · Domain·Ontology · MUST 게이트                        |
| **2. Fetch**   | ACTON-GM       | `programRef` → NEXAVULT/Asset **TLS** 다운로드                                |
| **3. Verify**  | ACTON-GM       | `contentHash` 일치 · `sizeBytes` · Profile **G/M subset** · M-code 레지스트리 |
| **4. Execute** | ACTON-GM       | 컨트롤러 전송 · S-커브·버퍼 · ENVIRON 필터                                    |
| **5. Record**  | NEXAVULT       | `revisionId` · FACT · 감사 로그                                               |

**실패 시:** Hash 불일치 · Profile 위반 · Ethos 미통과 → **실행 차단** · FACT `STUCK` · Omnix 알림 — [`06 예외`](<../NEXIA/08_TDD_NEXIA_예외상황처리.md>)

**말단·저전력:** `programRef` 없이 **Header+Body만** — 게이트웨이가 캐시된 NC를 이미 보유한 경우에만 로컬 실행(캐시 키 = `contentHash`).

#### 12.3.4 패킷 vs ACTON job 채널

| 상황                           | 권장                                                  |
| ------------------------------ | ----------------------------------------------------- |
| 말단·워치·저전력               | **Header + Body만** — motion 없음                     |
| CNC·로봇·일반 job              | Tag **`programRef`만** — §8.4.1                       |
| 캐시 히트 (동일 `contentHash`) | Fetch 생략 · Verify(로컬 hash) → Execute              |
| 실시간 S-커브 **스트림**       | **ACTON job 채널** (APEX 패킷 밖) — §12.3.4 · §19 #10 |

**CNC Domain 예 — 분업 (Body 유지):**

| Body (의미)                      | ACTON-GM (실행)                         |
| -------------------------------- | --------------------------------------- |
| A1→Target, A2→Intensity↑, A3→Now | `programRef` → NC 내 `G90` `G1 …`       |
| A2→Intensity↓ (감속)             | 동일 NC 또는 별도 ref — NC 내 `M150 P1` |

#### 12.3.5 CadQuery · 3D · Circuit와의 관계

- **3D CadQuery** → STEP — 형상 SoT (Blender/CNC **입력** 자산)
- **ACTON-GM** → **공구 경로·장비 motion** — 형상 **대체 아님**
- **Circuit** ESP32 펌웨어 ↔ ACTON-GM은 **게이트웨이·CNC 도메인**에서만 교차

---

## 13. 3단계 번역 프로세스 (CSIM)

### 13.1 하향 — Intent to Act

1. **WILL** — 자연어·제스처·웨어러블
2. **CSIM 매핑** — 매트릭스 투영
3. **HEXAGON 검증** — 스키마·Ethos
4. **ACTON-GM** — NC를 NEXAVULT/Asset에 기록 · 패킷에는 `programRef` · Fetch·Verify·Execute
5. **물리 출력** — 컨트롤러 · PWM · MQTT 등

### 13.2 현장 — Execution & Bridge

게이트웨이 → ESP-NOW/CAN → 노드 구동 · **ACTON** · **ENVIRON** 필터

### 13.3 상향 — Feedback to Context

1. **FACT** — 전류·각도·장력 등
2. **Inverse CSIM** — STUCK · Me/You 등 상태 코드
3. **ECHO** — AI 피드백 토큰
4. **MOMENT→ERA** — 디지털 트윈·Omnix 갱신

---

## 14. 프로파일 계층 (Core / Domain / User)

| 계층       | 변경                                              | 권한          |
| ---------- | ------------------------------------------------- | ------------- |
| **Core**   | 축·레이어 골격                                    | 표준 관리자   |
| **Domain** | 가중치·의미 확장 · **ACTON-GM M-code 레지스트리** | 도메인 관리자 |
| **User**   | 표현·민감도·단축                                  | 사용자        |

**우선순위:** `Core > Domain > User`

**User 금지:** Core 축 삭제 · 승인/위험 재정의 · 감사 필드 제거

---

## 15. 멀티모달 출력 (Light / Sound / Vibration)

- **시간 동기** — 깜박·비트·진동 주기 일치
- **에너지 곡선** — 밝기↑ ↔ 음량/진동↑
- **성격 매핑** — 색톤 ↔ 음색/질감

한 채널만 수신해도 **전체 메시지 추론** 가능해야 함.

---

## 16. 설계 체크리스트

### 16.1 Sign — Header vs 셀별

| 방식        | 장점           | 단점                        |
| ----------- | -------------- | --------------------------- |
| Header 통합 | 경량 · 패킷 톤 | 한 패킷 내 상충 부호 어려움 |
| 셀별        | 축별 분리      | Body 증가                   |

**권장:** 말단·단순 명령 → **Header Sign** · 복합 → **패킷 분할** 또는 셀별 검토

### 16.2 값 — Tag vs 셀 내장

**기본 Tag** · 고정장비만 셀 직접값 — 원칙 1·2

### 16.3 추론 위치

| 시나리오          | 권장                |
| ----------------- | ------------------- |
| 워치 로컬 AI 강함 | 셀별 Sign·고밀 Body |
| 게이트웨이 중심   | Header Sign + Tag   |
| 클라우드 추론     | Raw 근접 + Tag 확장 |

---

## 17. NEXA 플랫폼 · NEXIA 도메인 연동

| `tabId`    | CSIM/AXON                                                                                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Omnix**  | 멀티모달 입출력 · 승인 · `GlobalFlow/Crew/Solo` ↔ 채널 컨텍스트                                                                                            |
| **Normex** | HEXAGON Who · MUST/SHOULD · 실행 차단 · **Norm(규범)** — [`00 …`](<../NEXIA/08_TDD_NEXIA_구조기술스택운영방침.md>) §3 |
| **Logex**  | NEXAON · LangGraph · 해석 그래프                                                                                                                               |
| **Scribx** | 규칙·코드화 · 패킷 스키마                                                                                                                                  |
| **Vivex**  | 3D·미디어 시각화 · ComfyUI 파이프라인                                                                                                                      |
| **Twinex** | ESP32·ESPHome·말단 입력 · **디지털 트윈** · `.nxproj` — [`00 …`](<../NEXIA/08_TDD_NEXIA_구조기술스택운영방침.md>) §3  |
| **Navex**  | 자산·노드 탐색 · 릴레이 컨텍스트                                                                                                                           |

**Sync (참고):** 멀티윈도우 `nexia.window.sync.v1` · PiP `nexia.pip.sync.v1` — [`멀티윈도우 · PiP`](../NEXIA/08_TDD_NEXIA_멀티윈도우DocumentPiP.md)

---

## 18. LLM 시맨틱 가드레일

- LLM 명령은 CSIM **판정·범위** 통과 필수 — 미통과 → **실행 차단·재추론**
- **실시간 루프:** Header+Body **비LLM** · Tag·고차원만 LLM/NEXAON
- Hallucination: Ontology ID · Domain · Confidence · 실측 **NEXAVULT 충돌**로 보정

---

## 19. 미확정 (Open)

아직 **닫지 않은** 항목 — 표준 확정 전 보완 필요.

| #   | 항목                                             | 방향                                    |
| --- | ------------------------------------------------ | --------------------------------------- |
| 1   | 5×5 필요성                                       | **보류** — 3×3+Tag 우선                 |
| 2   | A4(4×4) 축 의미                                  | **부록 A** 유지 · Normative 아님        |
| 3   | L4 vs L5 레이어 수                               | **3×3 L1~L3** 고정                      |
| 4   | 0~9 vs Hz/진폭 **공식**                          | Domain Profile 테이블                   |
| 5   | 장거리·저품질 채널                               | Ack · Checksum · 주기적 Tag 절대값 — §9 |
| 6   | HEXAGON 6축 **비트 할당**                        | 별도 HEXAGON 부록 예정                  |
| 7   | Body 18bit **바이트 정렬**                       | ESP32 패킹 Runbook                      |
| 8   | ACTON-GM **서명** — `contentHash` 외 Ed25519 등  | Profile별 — §12.3.3                     |
| 9   | Domain **M-code 번호대**                         | Profile별 표 — §12.3.2 Draft            |
| 10  | ACTON job **실시간 스트림** vs `programRef` 경계 | 스트림은 job 채널 · job 단위는 ref      |

---

## 20. 표준화 로드맵

1. **Step 1:** Core 축·레이어 · 2×2/3×3 역할
2. **Step 2:** v0.16 Header + 18bit Body **필수/선택**
3. **Step 3:** ACTON-GM Domain Profile · M-code 표 · G subset · **programRef Fetch Runbook**
4. **Step 4:** Light/Sound/Vibration 렌더 테이블
5. **Step 5:** 예외·복원·보안 — [`06 예외 상황 처리`](<../NEXIA/08_TDD_NEXIA_예외상황처리.md>)
6. **Step 6:** Omnix 파일럿 · Twinex/ACTON · CNC/SkyTen 연동

---

## 21. 기대 효과

- 언어 장벽·다언어 비용 ↓
- 파형·패킷 **즉각 인지**
- 시각·청각·촉각 **접근성**
- 산업·아트·우주 등 **도메인 재사용**

---

## 부록 A — 4×4 Draft (비규범)

> 탐색용 기록. **구현·Ethos 기준으로 사용하지 않음.**

| Axis \ Layer | L1 의도   | L2 상태   | L3 관계   | L4 가설   |
| ------------ | --------- | --------- | --------- | --------- |
| A1 좌표      | 지향점    | 발생지    | 대상      | 잠재      |
| A2 위력      | 강제성    | 중요도    | 친밀도    | 파급      |
| A3 판정      | 승인/거부 | 정상/오류 | 아군/적   | 기회/위험 |
| A4 범위      | 개인/전체 | 내부/외부 | 직접/간접 | 단기/장기 |

물리 출력 (Draft): Color/Tone · Intensity · Frequency · Duration (0~9) — `Lx-A1A2A3A4-CITD`

---

## 부록 B — LeRobot · E2E 학습 (선택)

- AXON **헌법 변경 없음**
- ACTON 단계에서 **학습 기반 미세동작** 삽입
- 로그: `[camera frames, HEXAGON tokens, ACTON feedback]`
- HEXAGON 정규화 데이터 → 텐서 변환은 **어댑터**로 처리

---

## 22. 연계 문서

| 문서                                                                                                                          | 내용                                 |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| [\_프로토콜.md](../NEXIA/08_TDD_NEXIA_NEXNAP시스템인터페이스표준규약.md)                                                               | gRPC/WS · Ethos · HEXAGON 인터페이스 |
| [07 음성 인풋…](<../NEXIA/08_TDD_NEXIA_음성인풋자동화및확장.md>) | STT/TTS · PiP                        |
| [AI CIRCUIT 제너레이터](<../../../NEXA-Platform/docs/Nexia/AI CIRCUIT 제너레읰터.md>)                                         | ESP32 말단 · Wokwi                   |

---

_상태: Normative — CSIM · AXON 7L · APEX v0.16 · ACTON-GM programRef · Body≠G-code._
---

## 관련 문서

| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXA OS 설계 표준 · 미션 크리티컬 전략 (TDD-001)](../NEXAOS/08_TDD_NEXAOS_설계표준_미션크리티컬전략.md) |
| Cosmic Language | [Cosmic Language · 전역 데이터 아키텍처 (TDD-044)](./08_TDD_CosmicLanguage_전역데이터아키텍처.md) |
| NEXNAP | [NEXNAP 시스템 인터페이스 표준 규약 (TDD-023)](../NEXIA/08_TDD_NEXIA_NEXNAP시스템인터페이스표준규약.md) |
