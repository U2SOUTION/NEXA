---
doc_id: TDD-072
title: "Kineton · Physical Bridge · ACTON · ROS 2 v1.0"
category: "08_TDD"
domain: NEXIA
status: draft
created: 2026-06-13
updated: 2026-06-13
parent_doc: TDD-043
see_also: [TDD-068, TDD-039, TDD-040, TDD-023, TDD-057, TDD-073, TDD-070, TDD-074]
terms_standard: ["ros-2", "mqtt", "pwm", "protobuf"]
terms_nexa: [Kineton, ACTON, HEXAGON, AXON, CSIM, Nano Sentinel, Kinetic Controller, Physical Tier, Hot Path, NEXA CELL, Twinex, NEXNAP, Envelope]
tags: ["doc/cat/08-tdd", "doc/domain/nexia", "std/ros-2", "std/mqtt", "nexa/Kineton", "nexa/ACTON"]
---

# Kineton · Physical Bridge · ACTON · ROS 2 v1.0

> **한 줄:** **`Kineton`** 은 승인·정렬된 Action 을 **물리 세계**에 투영하는 **Physical Bridge** — `ACTON` Synapse 실행 · **ROS 2** 미들웨어 매핑 · **Hot Path** Reflex · **역 uplink** telemetry. 프로토콜·문법 = **`Axon`** ([TDD-043](../Cosmic/08_TDD_CSIM_AXON프로토콜_정본.md)) · 집행·브리지 = **본 문서**.
>
> **기술 ID:** **`KL`** · **6대 핵심 레이어** — [Global Architecture Standard](../../NEXAOS/08_TDD_NEXAOS_전역아키텍처표준_GlobalArchitectureStandard_v1.0.md)

**Normative 진입점:** 물리 집행·Hot Path · ROS 2 Bridge · 엣지 Reflex 의 **Kineton 전용** 규격. `ACTON` 패킷·AL_6 정의는 **TDD-043** 을 따른다.

---

## 1. 목적과 범위

### 1.1 Kineton 이 담당하는 것

| 축 | 내용 |
| :--- | :--- |
| **Hot Path** | `Axon` → `HEXAGON` → `ACTON` **직결** Reflex — `Menton`·`Nexaon`·`Ontex` **우회** 가능 (PT_0~2) |
| **Cold Path 집행** | `Ontex` **promoted** · 승인 Action → `ACTON` · ROS 2 — 허브 경유 **승인본만** 하향 |
| **ACTON 실행** | PWM · MQTT · Synapse · **ACTON-GM** `programRef` — 런타임 Fetch·Verify·Execute ([TDD-043 §12](../Cosmic/08_TDD_CSIM_AXON프로토콜_정본.md)) |
| **ROS 2 Bridge** | Intent → Topic / Service / Action · 디지털 트윈·로봇 **상호운용** |
| **역 uplink** | 물리 피드백·telemetry → `Axon` · Inverse `CSIM` CT_1 — 디지털 트윈 정합 |

### 1.2 Kineton 이 담지 않는 것

| 대상 | 소유 | 비고 |
| :--- | :--- | :--- |
| **5W1H Envelope · Zod** | **`Axon`** · `HEXAGON` | TDD-043 §11 |
| **CSIM CT_1–CT_3 번역** | **`Cosmic`** · `CSIM` | TDD-043 §13 · TDD-044 |
| **Run · SHACL · promoted** | **`Nexaon`** | [TDD-073](../Nexaon/08_TDD_Nexaon_Distillation오케스트레이터_v1.0.md) |
| **영구 지식 고착** | **`Ontex`** | TDD-057 |
| **Why-Chain 감시** | **`Galthon`** | [TDD-074](../../Galthon/08_TDD_Galthon_TrustWatch_신뢰감시독립주체_v1.0.md) — **흐름 비참여** |

### 1.3 명칭

| 이름 | 정체 |
| :--- | :--- |
| **Kineton** | 6대 레이어 **Physical Bridge** · 기술 ID **`KL`** |
| **ACTON** | `Axon` 스택 **AL_6** 실행 어휘 — **Kineton** 이 **소비·집행** |
| **ACTON-GM** | G/M · `programRef` — CNC·로봇 등 **선택** 도메인 ([TDD-043 §12.3](../Cosmic/08_TDD_CSIM_AXON프로토콜_정본.md)) |
| **NEXAON** (프로토콜) | Axon 해석·학습 층 — **제품 Nexaon ✗** |

---

## 2. 경로 분기 (Cold · Hot · Fast)

> SSOT 맥락: [Global Architecture — Why-Chain](../../NEXAOS/08_TDD_NEXAOS_전역아키텍처표준_GlobalArchitectureStandard_v1.0.md) · [TDD-068 §1.5.2](../08_TDD_NEXIA_IoT엣지데이터파이프라인_HEXAGON_Nexaon연계_v1.0.md)

```text
[Cold Path · 승인 집행]
  Ontex promoted → Action intent → ACTON → Kineton → ROS 2 / Device

[Hot Path · Reflex]
  Axon HEXAGON → ACTON → Kineton (Local Reflex) → Device
  (Menton · Nexaon · Ontex 우회 · 동일 Axon 규격 유지)

[Fast · Reflex]  (엣지 말단)
  ML_0 Sentinel ACTON → 물리 (<50ms) — 후보고만 상행 · DB 우회
```

| Path | Stack 관여 | DB·Ontex | Kineton 역할 |
| :--- | :--- | :--- | :--- |
| **Cold → Physical** | 승인 Action 만 | promoted **필수** | 허브 승인본 **집행** |
| **Hot Path** | `HEXAGON` shell | **우회** | 말단 **즉시 Reflex** |
| **Fast · Reflex** | ML_0 `ACTON` | **우회** | Nano/Kinetic **현장 제어** |

**원칙:** Hot/Cold **경로 분리** — Reflex 는 `Ontex` 없이 가능하나 **`Axon` Envelope 규격** 은 동일 ([TDD-039](../AI/08_TDD_AI_안전대책선조치로직.md) GOVERN · interlock **우회 ✗**).

---

## 3. 피지컬 티어 · 배치

> **배치 SSOT:** [TDD-040](../AI/08_TDD_AI_지능위계및하드웨어사양.md) · **논리 ML** = [TDD-070 §3.2.1](../../용어집_NEXA전용_v2.0.md)

| 피지컬 티어 | 주체 | Kineton 관여 | 비고 |
| :---: | :--- | :--- | :--- |
| **PT_0** | Nano Sentinel | **ACTON Reflex** · PWM/MQTT | COLD · uplink 후보만 |
| **PT_1** | Micro Sentinel | 1차 요약·게이트 _(선택)_ | 집행 보조 |
| **PT_2** | Kinetic Controller | **Fast Path** · TensorRT/SLM JSON 제어 | 현장 Decision |
| **PT_3** | Zenith Indicator | Cold Path **승인 Action** 하향 · ROS 2 허브 | **Run UI ✗** |

---

## 4. ACTON 집행 (TDD-043 참조)

**Normative:** `ACTON` Synapse · `ACTON-GM` · Body vs `programRef` — [TDD-043 §3.1 · §4 · §12](../Cosmic/08_TDD_CSIM_AXON프로토콜_정본.md).

| 단계 | 주체 | Kineton 동작 |
| :--- | :--- | :--- |
| **수신** | Nest / 엣지 | `HEXAGON` Envelope · Ethos PASS 확인 |
| **번역** | Kineton Bridge | WILL/FACT → `ACTON` 강도 · Synapse 명령 |
| **G/M** _(선택)_ | ACTON-GM | `programRef` → NEXAVULT Fetch → Verify → Execute |
| **실행** | Device / ROS 2 | Topic·Service·Action · PWM · MQTT |
| **피드백** | 역 uplink | telemetry → `Axon` Envelope |

**금지:** 미승인 Action 의 Cold Path **우회 집행 ✗** · Ethos FAIL Envelope **전파 ✗**.

---

## 5. ROS 2 Bridge

| 매핑 | NEXA 측 | ROS 2 측 |
| :--- | :--- | :--- |
| **Intent** | `ACTON` · 승인 Action body | `geometry_msgs` / `std_msgs` / 도메인 Action |
| **상태** | Inverse `CSIM` CT_1 · Envelope | `/joint_states` · custom telemetry |
| **안전** | GOVERN · VOID · STUCK | estop · watchdog ([TDD-039](../AI/08_TDD_AI_안전대책선조치로직.md)) |

**원칙:** ROS 2 는 **미들웨어** — NEXA 논리·Ethos 는 **`Axon`·`Cosmic`** 층에서 선행 정렬.

---

## 6. 엣지 · IoT 연계

| 구간 | SSOT | Kineton |
| :--- | :--- | :--- |
| 후보고 uplink | [TDD-068 §4](../08_TDD_NEXIA_IoT엣지데이터파이프라인_HEXAGON_Nexaon연계_v1.0.md) | **promoted ✗** — Reflex 만 |
| Local Bypass | TDD-068 §4 · TDD-039 | STUCK · interlock **즉시 ACTON** |
| NEXNAP Envelope | [TDD-023](../08_TDD_NEXIA_NEXNAP시스템인터페이스표준규약.md) | uplink/downlink **공통 문법** |
| Twinex | TDD-024 · `.nxdev` | `device_id` · 디지털 트윈 정합 |

### 6.1 경로 분기 (Cold / Hot / Fast)

> **SSOT:** [Global Architecture §경로 분기](../../NEXAOS/08_TDD_NEXAOS_전역아키텍처표준_GlobalArchitectureStandard_v1.0.md)

| Path | 경로 | `Ontex` |
| :--- | :--- | :--- |
| **Cold · Distillation** | `stateBus` → `DIEA` → `Nexaon` → `Ontex` | **필수** |
| **Hot** | `DIEA` Normex·Logex → `erp` | **우회** |
| **Fast · Reflex** | ML_0 `ACTON` → **Kineton** | **우회** · 후보고만 상행 |

---

## 7. Human Interface

| 접점 | 역할 | 경계 |
| :--- | :--- | :--- |
| **Kineton UI** | 현장 제어·피드백 | `ROS 2` · Device — Run·promoted **✗** |
| **nexabo** | 관제·Awareness | 실시간 제어 **✗** — Hot Path 는 본 문서 |
| **Twinex** | `.nxdev` 바인딩 | 집행 의도 **하향** 소스 중 하나 |

---

## 8. 구현 체크리스트 (초안)

- [ ] Cold Path: `Ontex` promoted → Action gate → `ACTON` 하향
- [ ] Hot Path: `HEXAGON` → `ACTON` 엣지 Reflex · GOVERN 불변
- [ ] ROS 2 Topic/Service/Action 매핑 테이블 (도메인별)
- [ ] 역 uplink: telemetry → `Axon` Envelope · Zod
- [ ] ACTON-GM `programRef` 파이프라인 (선택 도메인)

---

## 관련 문서

| 관계 | 문서 |
| :--- | :--- |
| **ACTON · Axon 프로토콜** | [TDD-043](../Cosmic/08_TDD_CSIM_AXON프로토콜_정본.md) |
| **엣지 · Reflex** | [TDD-068](../08_TDD_NEXIA_IoT엣지데이터파이프라인_HEXAGON_Nexaon연계_v1.0.md) |
| **안전 · Bypass** | [TDD-039](../AI/08_TDD_AI_안전대책선조치로직.md) |
| **배치 · PT** | [TDD-040](../AI/08_TDD_AI_지능위계및하드웨어사양.md) |
| **승인 · promoted** | [TDD-073](../Nexaon/08_TDD_Nexaon_Distillation오케스트레이터_v1.0.md) · [TDD-057](../../Ontex/08_TDD_Ontex_기술스택운영방침_v1.0.md) |
| **개념 허브** | [Global Architecture Standard](../../NEXAOS/08_TDD_NEXAOS_전역아키텍처표준_GlobalArchitectureStandard_v1.0.md) |
