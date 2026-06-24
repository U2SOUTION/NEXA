---
doc_id: TDD-074
title: "Galthon · Trust Watch · 신뢰 감시 독립주체 v1.0"
category: "08_TDD"
domain: NEXAOS
status: draft
created: 2026-06-13
updated: 2026-06-13
parent_doc: TDD-001
see_also: [TDD-070, TDD-053, TDD-043, TDD-073, TDD-057, TDD-072, TDD-068, TDD-075]
terms_standard: ["shacl", "audit-log", "trace"]
terms_nexa: [Galthon, Why-Chain, HEXAGON, Normex, Nexaon, trace_id, promoted, SHACL, Ethos, GL]
tags: ["doc/cat/08-tdd", "doc/domain/nexaos", "nexa/Galthon", "nexa/Why-Chain"]
---

# Galthon · Trust Watch · 신뢰 감시 독립주체 v1.0

> **한 줄:** **`Galthon`** 은 **NEXA** 전역 **신뢰성** 을 담보하는 **독립 감시 주체** — 6대 핵심 레이어 **외부** · Why-Chain · trace · Ethos·SHACL **횡단 관측** · Cold/Hot Path **비참여** · 데이터 **변조·우회 ✗**.
>
> **기술 ID:** **`GL`** · **6+1** = 6대 핵심 레이어 + **독립주체** — [Global Architecture Standard](../../NEXAOS/08_TDD_NEXAOS_전역아키텍처표준_GlobalArchitectureStandard_v1.0.md)

**Normative 진입점:** `Galthon` 정체·경계·관측 질문·Why-Chain 감사·trace 원칙. 용어 한 줄 = [TDD-070 §3.1.1](../../용어집_NEXA전용_v2.0.md).

---

## 1. 목적과 범위

### 1.1 Galthon 이 담당하는 것

| 축 | 내용 |
| :--- | :--- |
| **추론 투명성** | `Nexaon` Run · `Normex` Ethos · `CSIM` 토큰의 논리적 근거(Why) **관측·기록** |
| **무결성 감시** | `HEXAGON` Envelope · Ethos 게이트 · SHACL diff **정합성** 횡단 점검 |
| **What-if 추적** | 조건·정책 변경 시 판단 변화 **시뮬레이션·기록** — 실행 경로 **개입 ✗** |
| **Why-Chain 감사** | Raw → Context → Logic → Knowledge → Action **역추적 가능성** 검증 |

### 1.2 Galthon 이 담지 않는 것

| 대상 | 소유·담당 |
| :--- | :--- |
| **Envelope 작성·Zod** | **`Axon`** · `HEXAGON` (TDD-043) |
| **의미 번역·CT1–CT3** | **`Cosmic`** · `CSIM` (TDD-043 · TDD-044) |
| **Facet 산출·Ethos RULE** | **`Menton`** · DIEA · `Normex` (TDD-056) |
| **Run · 승인 · promoted** | **Nexaon** (TDD-073) · **Ontex** (TDD-057) |
| **물리 집행** | **Kineton** (TDD-072) |
| **브랜드·사업·플랫폼 운영** | **NEXA** _(사업·제품 브랜드)_ |

**원칙:** `Galthon` = **감시탑(Watchtower)** 메타 역할만 — 파이프라인 **분기·차단·승인 대행 ✗**.

---

## 2. 6+1 배치 · 아키텍처 위치

```text
                    [ Galthon · GL — 횡단 관측 · 비참여 ]
                              │
    Axon ─► Cosmic ─► Menton ─► Nexaon ─► Ontex ─► Kineton
     AL       CL        ML        NL        OL        KL
```

| 항목 | Normative |
| :--- | :--- |
| **6대 핵심 레이어** | AL · CL · ML · NL · OL · KL — 데이터·지식 **흐름 축** |
| **`Galthon`** | **GL** — 흐름 축 **✗** · 전 구간 **read-only 관측** |
| **Human Interface** | NEXU Canvas = Why-Chain **시각화** _(편집·승인 ✗)_ — Global Architecture §NEXU Canvas |
| **신뢰도 점수** | 엔티티·지식 **fit_score** 저장 = [TDD-053](../Identity/08_TDD_NEXA_데이터무결성과신뢰도점수.md) — `Galthon` trace 와 **연계** 가능 |

---

## 3. 관측 대상

Cold Path · Hot Path **모든 홉**을 **동일 규칙**으로 관측한다. **흐름 개입 ✗**.

| 기술 | 관측 포인트 |
| :--- | :--- |
| **`Axon`** | Envelope 폐기 · Zod FAIL · VOID |
| **`Cosmic`** | CT2 Ethos FAIL · raw uplink 시도 |
| **`Menton`** | `Normex` RULE 위반 · Facet 산출 이상 |
| **Nexaon** | Run 보류 · SHACL FAIL · ingest 게이트 |
| **Ontex** | promoted 전 쓰기 시도 · explore 불가 |
| **Kineton** | 미승인 Action · Hot Path 우회 집행 시도 |

---

## 4. Why-Chain · 관측 질문

### 4.1 역추적 홉 (Normative)

모든 `Action` 은 **Knowledge → Logic → Context → Raw** 까지 추적 가능해야 한다. 각 홉에 **Who · Why · When** (`HEXAGON` 6축) 이 남아야 한다.

| 역추적 홉 | 질문 | 담당 접점·엔진 | `Galthon` |
| :--- | :--- | :--- | :--- |
| Action → Knowledge | 무엇이 승인되어 실행되었나 | `Kineton` · `Ontex` promoted | trace · 기록 |
| Knowledge → Logic | 누가·어떤 Run 으로 정재했나 | `Nexaon` · `DIEA` · SHACL diff | trace · 기록 |
| Logic → Context | 어떤 맥락·Ethos 로 정렬되었나 | `CSIM` CT2 · `Normex` | trace · 기록 |
| Context → Raw | 원천 Fact·Envelope 는 무엇이었나 | `HEXAGON` · ML0 Sentinel | trace · 기록 |

### 4.2 관측 질문 · 엔진 근거

| 질문 유형 | 관측 근거 (엔진) | `Galthon` 역할 |
| :--- | :--- | :--- |
| 왜 Envelope 폐기? | `HEXAGON` + Zod | trace · 기록 |
| 왜 uplink 거부? | `CSIM` CT2 · `Normex` Ethos | trace · 기록 |
| 왜 Run 보류? | `DIEA` · `Nexaon` | trace · 기록 |
| 왜 승인 거절? | `Normex` · Omnix | trace · 기록 |
| 왜 promoted ✗? | `Nexaon` · SHACL | trace · 기록 |
| 왜 explore 불가? | `Ontex` 미존재 | trace · 기록 |

**시각화:** **NEXU Canvas** · Graph RAG 탐색 UI — 동일 체인을 **서사·그래프**로 표현 _(읽기 전용)_.

---

## 5. trace · 감사 데이터 (원칙)

| 필드·개념 | Normative |
| :--- | :--- |
| **`trace_id`** | 엣지 uplink · Nexaon ingest · Run · promoted **공통 상관 키** ([TDD-068](../NEXIA/08_TDD_NEXIA_IoT엣지데이터파이프라인_HEXAGON_Nexaon연계_v1.0.md)) |
| **이벤트 유형** | `gate_fail` · `ethos_fail` · `shacl_fail` · `run_hold` · `promote_reject` · `void` |
| **불변성** | 감사 로그 **append-only** · `Galthon` 이 기록한 trace **삭제·덮어쓰기 ✗** _(운영 정책)_ |
| **What-if** | 정책·RULE 변경 **시뮬레이션** 결과만 기록 — 실제 Envelope·Run **변조 ✗** |

구현 저장소·API 상세는 후속 승격 시 본 절을 확장한다.

---

## 6. 경계 · 명칭

| 구분 | `Galthon` | 비교 대상 |
| :--- | :--- | :--- |
| **브랜드** | 신뢰 **감시** 독립주체 | **NEXA** = 사업·플랫폼 브랜드 |
| **지능** | 관측·trace **✗** 판단 Run | **`Menton`** · **Nexaon** = 사고·집행 |
| **흐름** | Cold/Hot Path **비참여** | 6대 레이어 = 데이터 생애주기 축 |
| **표기** | **`Galthon`** · ID **`GL`** | 「Galthon Layer」·「GL층」**✗** — [용어집 §3.1.1](../../용어집_NEXA전용_v2.0.md) |

---

## 7. 구현 체크리스트 (초안)

- [ ] `trace_id` 전 구간 전파·`Galthon` 감사 이벤트 스키마
- [ ] Envelope VOID · Ethos FAIL · SHACL FAIL **자동 trace**
- [ ] Why-Chain 역추적 API _(read-only)_ · NEXU Canvas 연동
- [ ] TDD-053 신뢰도 점수와 감사 이벤트 **상관** (선택)
- [ ] Hot Path Reflex 이벤트 **후보고** trace ([TDD-072](../NEXIA/Kineton/08_TDD_Kineton_PhysicalBridge_ACTON_ROS2_v1.0.md))

---

## 관련 문서

| 관계 | 문서 |
| :--- | :--- |
| **용어 · GL** | [TDD-070 §3.1.1](../../용어집_NEXA전용_v2.0.md) |
| **개념 허브** | [Global Architecture Standard](../../NEXAOS/08_TDD_NEXAOS_전역아키텍처표준_GlobalArchitectureStandard_v1.0.md) |
| **미션 크리티컬** | [TDD-001](../NEXAOS/08_TDD_NEXAOS_설계표준_미션크리티컬전략.md) |
| **신뢰도 점수** | [TDD-053](../Identity/08_TDD_NEXA_데이터무결성과신뢰도점수.md) |
| **Axon · Cosmic** | [TDD-043](../Cosmic/08_TDD_CSIM_AXON프로토콜_정본.md) · [TDD-044](../Cosmic/08_TDD_CosmicLanguage_전역데이터아키텍처.md) |
| **Nexaon · Ontex** | [TDD-073](../NEXIA/Nexaon/08_TDD_Nexaon_Distillation오케스트레이터_v1.0.md) · [TDD-057](../Ontex/08_TDD_Ontex_기술스택운영방침_v1.0.md) |
| **엣지 · trace** | [TDD-068](../NEXIA/08_TDD_NEXIA_IoT엣지데이터파이프라인_HEXAGON_Nexaon연계_v1.0.md) |
