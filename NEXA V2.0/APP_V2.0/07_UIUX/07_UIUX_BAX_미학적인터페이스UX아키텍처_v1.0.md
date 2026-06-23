---
parent_doc:
see_also: [UIX-007, TDD-007, TDD-004, TDD-071]
doc_id: UIX-003
title: "BAX 미학적 인터페이스 UX 아키텍처 v1.0"
category: "07_UIUX"
domain: NEXIA
status: published
created: 2026-06-22
updated: 2026-06-22
implements_doc: BRD-001
supersedes: "07_UIUX/07_UIUX_BAX_미학적인터페이스UX아키텍처.md (2026-06-10 draft · MAE 장문 — v1.0 Harness 모델로 대체)"
relocated_from: "_inbox/07_UIUX_BAX_미학적인터페이스UX아키텍처_v1.0.md"
terms_standard: ["zod", "css-grid", "next-js", "sse", "websocket"]
terms_nexa: ["BAX", "VirtualCanvas", "Harness", "ComponentManifest", "clusterKey", "LayoutProfile", "fill-policy", "tier", "capability", "bax-demo", "MAE", "RuleGuard", "M2P", "LayoutPolicy"]
tags: ["doc/cat/07-uiux", "doc/domain/nexia", "std/zod", "std/css-grid", "std/next-js", "std/sse", "std/websocket", "nexa/BAX", "nexa/VirtualCanvas", "nexa/Harness", "nexa/ComponentManifest", "nexa/clusterKey", "nexa/LayoutProfile", "nexa/fill-policy", "nexa/tier", "nexa/capability", "nexa/bax-demo", "nexa/MAE", "nexa/RuleGuard", "nexa/M2P", "nexa/LayoutPolicy"]
---

# BAX 미학적 인터페이스 UX 아키텍처 v1.0

> **범위:** NEXA-Platform **Core/UI 2층** · Manifest · Tier×Capability Harness · Grid · LLM delta · Layout Profile · RuleGuard 집행 순서.  
> **모노레포 경로 SSOT:** [`TDD-007` 모노레포 폴더 구조](../08_TDD/NEXAOS/08_TDD_NEXAOS_모노레포폴더구조_v1.0.md).  
> **Mission-Safe · G1–G5 상세:** [`TDD-004` 수직 계층 보안](../08_TDD/NEXAOS/08_TDD_NEXAOS_수직계층보안아키텍처.md).

## 1. 아키텍처 철학 : 환원주의와 유기적 질서 (Cosmos)

본 아키텍처는 "세상을 가장 작은 단위로 쪼개고 분석하여 재조립한다"는 서양의 환원주의(Reductionism) 및 원자론(Atomism) 철학에 그 뿌리를 둔다.

전통적인 웹 프레임워크(예: Quasar)의 디자인과 기능이 강력하게 결합한 유기체적 구조(Monolith)에서 탈출하여, 시스템을 철저하게 원자(Atom) 단위로 파괴하고 분석한다. 객체지향 프로그래밍(OOP)의 추상화(Abstraction)와 단일 책임 원칙(Single Responsibility Principle)을 현대 프론트엔드 환경에 완벽히 이식하여, 사용자에게 극대화된 자율성(Chaos)을 부여함과 동시에 시스템의 절대적인 시각적 균형과 질서(Cosmos)를 유지하는 것을 궁극적인 목적으로 삼는다.

---

## 2. 모노레포 기반 내부 SDK 구조 (Core와 UI의 격리)

관심사의 분리(Separation of Concerns)를 실현하기 위해 **NEXA-Platform** `pnpm-workspace` 단일 저장소 내에서 핵심 레이아웃 로직(Core)과 화면 렌더링(UI)을 완전히 격리한다.

> [!note] **개념 vs 폴더**
> **Core/UI는 `packages/core` · `packages/ui` 물리 폴더가 아닙니다.** 책임(UI · Core)을 나누는 **설계 레이어**이며, 실제 경로 SSOT는 [`08_TDD_NEXAOS_모노레포폴더구조_v1.0`](../08_TDD/NEXAOS/08_TDD_NEXAOS_모노레포폴더구조_v1.0.md) · 본 절 표·트리입니다.

### 2.1 NEXA-Platform 워크스페이스 개요 (TDD-007 §2)

```text
NEXA-Platform/                              # pnpm-workspace 제품 루트
├── apps/
│   ├── web/                                # Next.js · nexia · [UI 층] frame/ · domains/
│   ├── backend/                            # NestJS · REST · agent-graph 프록시
│   ├── sync/                               # Hocuspocus · CRDT
│   ├── agent-graph/                        # FastAPI + LangGraph · [Core 층] LLM · SSE
│   └── bax-demo/                           # (MVP) BAX 독립 실험 앱 — §6
├── packages/
│   └── shared/                             # [Core 층] Zod · Harness · Manifest SSOT
├── database/                               # Prisma · pgvector
└── docs/                                   # specs SSOT · 기획 (비배포)
```

### 2.2 BAX SDK 2층 (Core · UI)

| 층       | 한 줄                                                           | 브라우저 무관? | BAX 경로 (Greenfield)                                                                                                |
| :------- | :-------------------------------------------------------------- | :------------: | :------------------------------------------------------------------------------------------------------------------- |
| **Core** | Manifest · Harness · Bin Packing · Zod 검증 · MAE 연산          |       ⭕       | `packages/shared/src/schemas/bax/` · `packages/shared/src/bax/` · `apps/agent-graph/src/agent_graph/graphs/bax_*.py` |
| **UI**   | VirtualCanvas · Headless 뼈대 + Tailwind · 전 `domainKey` mount |       △        | `apps/web/src/frame/` · `apps/web/src/engines/bax/` · `apps/web/src/domains/*/` · `apps/bax-demo/` _(MVP sandbox)_   |

> [!important] **`agent-graph/adapters/` 와 혼동 ✗**
> `apps/agent-graph/.../adapters/` = **LLM·Embed 백엔드** 전용. BAX Harness·레이아웃 Core는 **`packages/shared/src/bax/`** 접두.

```text
                    ┌──────────── UI (표면 · VirtualCanvas) ────────────┐
                    │  apps/web/src/frame/ · domains/*/ · engines/bax/  │
                    │  apps/bax-demo/src/canvas/VirtualCanvas.tsx (MVP) │
                    └────────────────────┬──────────────────────────────┘
                                         │ ResolvedLayout · CSS vars · props
                    ┌────────────────────▼──────────────────────────────┐
                    │              Core (로직 · SSOT)                    │
                    │  packages/shared/src/schemas/bax/*                 │
                    │  packages/shared/src/bax/{harness,layout,...}    │
                    │  apps/agent-graph/graphs/bax_layout.py (Phase 2+)  │
                    └───────────────────────────────────────────────────┘
```

**Core — `packages/shared/src/bax/` (신규 · Greenfield 정본)**

```text
packages/shared/src/
├── schemas/bax/                            ◆ 계약 Zod
│   ├── component-manifest.schema.ts      # §4 id · name · tier · capabilities · clusterKey · mutability
│   ├── manifest-delta.schema.ts          # §5.4 LLM BaxManifestDelta
│   ├── mae-decision.schema.ts            # void_ratio · blur · layout delta
│   └── layout-policy.schema.ts           # GridTemplate · ResolvedLayout
└── bax/                                    ◆ Core 런타임 · 호스트 무관
    ├── tier.registry.ts                    # §4.2 tier enum · rank
    ├── capability.registry.ts              # §4.3 capability enum · maxArea · overlay
    ├── harness/                            # §3.6 · §4.4 matrix · clamp
    │   ├── harness-matrix.registry.ts
    │   ├── resolve-harness.ts
    │   └── apply-harness.ts
    ├── layout/                             # fill-policy · overlay-policy
    └── guardrails/                         # RuleGuard · ASR · G1–G5
```

**UI — `apps/web` + MVP `bax-demo`**

```text
apps/web/src/
├── frame/                                  # MainShellLayout · domainLayoutRegistry
├── engines/bax/                            # MAE · LayoutPolicy · DepthProfile (흡수 대상)
│   ├── LayoutPolicy/
│   ├── DepthProfile/
│   └── applyAestheticState.ts
└── domains/*/                              # VirtualCanvas mount · 전 domainKey

apps/bax-demo/                              # §6 MVP 실험 — monorepo 독립 sandbox
├── src/canvas/VirtualCanvas.tsx            # 동적 CSS Grid + OVERLAY 합성
├── src/components/registry.ts              # ComponentDeclaration registry
└── src/engine/                             # Core 흡수 전 프로토타입 (→ shared/bax)
```

- **Core (`@nexa/shared` · `packages/shared/src/bax/`)**: 브라우저 DOM에 의존하지 않고, Component Manifest·Tier·Capability 규격, Harness(§3.6), Fill-by-Similar(§3.3), Zod 타입 검증만 담당한다. LLM 레이아웃 추론은 **`apps/agent-graph`** 단일 SSOT(TDD-007 §2 ④)를 따른다.
- **UI (`apps/web` · `apps/bax-demo`)**: Headless 뼈대(키보드·접근성·OVERLAY/BLOCK 분리)는 `engines/bax/`에, 시각 껍데기는 Tailwind CSS + CSS variables로 주입한다. MVP는 `bax-demo`에서 검증 후 `web/frame`·`domains/*`로 흡수한다(§2).

---

## 3. BAX 그리드 시스템 전략

레이아웃 붕괴를 막는 **Harness 3축** — 본 절 전략(Macro · Fill · 중앙 집중) 위에 선언적으로 얹는 **기본 개념 SSOT**.

| Harness 축 | 개념 | Normative |
| :--- | :--- | :--- |
| **그리드** (기준선 축) | 화면 전체 **보이지 않는 바둑판 격자** | 사용자·LLM의 유기적 배치를 **일정 기준선에 스내핑(Snapping)** — Macro 12열 · `rowHeight` SSOT (§3.6) |
| **최소/최대 한계** (물리적 한계) | 컴포넌트 **min/max px** · **Grid Span** 임계치 | UI가 구겨지거나 화면 밖으로 터지는 것 **차단** — `minColSpan` · `maxColSpan` · `minWidthPx` (§3.6) |
| **비율 조율** (상대적 관계) | Padding · 내부 요소의 **상대 스케일** | 뷰포트·맥락 변화에 `%` · `fr` · `aspect-ratio` · φ(황금비) preset으로 **span 채운 뒤** 내부만 유기 조율 (§3.6) |

VirtualCanvas 위 레이아웃은 **Macro Grid(Zone 단위)** 와 **Zone 내부 Fill(밀착·동종 채우기)** 로 구성한다.  
서브 그리드로 칸을 더 쪼개는 방식은 **보조 수단**이며, 1차 전략은 **남은 span을 유사 성격 컴포넌트로 꽉 채우는 것**이다.

> **연계:** Micro-Grid · Sub-Grid Packing · 스캐벤저 영역 — [UIX-007 그리드 알고리즘](./07_UIUX_그리드알고리즘_동적타이포그래피UI.md) · Guardrail · `void_ratio` — 본 문서 §3 · §5 · [`TDD-004`](../08_TDD/NEXAOS/08_TDD_NEXAOS_수직계층보안아키텍처.md)

### 3.1 한 줄 요약

| # | 원칙 | 구현 |
| :-: | :--- | :--- |
| **①** | **여백미 = 외곽 · 중앙 집중** | 덩어리는 Canvas **center**에 모음 · void는 **외곽**만 · `void_ratio` · ASR · 외곽 라인 **가변** |
| **②** | **Zone 내부 = 밀착·통일** | 동일 `grid-gap` SSOT · 객체 간 **기본적으로 간격 없이 밀착** (통일감·질서) |
| **③** | **빈 span = 동종 Fill** | SubGrid 분할 대신 **`clusterKey` 동일** sibling 추가 · placeholder로 **빈 칸 금지** |
| **④** | **꽉 채우기 > 원식 크기** | 디자인 토큰 절대치보다 **grid span 소진** 우선 — stretch · span 확장 허용 |
| **⑤** | **재계산 범위 제한** | Macro/Zone은 뷰포트·Policy·urgency 시 · 데이터 tick은 **Zone 내부 scale/fill만** |

세부 룰(예외 간격·인스턴스 상한·Cluster Panel)은 구현 단계에서 **유연하게** 추가한다. 본 절은 **큰 그림 SSOT**다.

### 3.2 여백미 vs 밀착 — 두 종류의 공간

BAX에서 “여백”은 **한 가지가 아니다.** 혼동 시 `void_ratio`와 Zone 밀착 정책이 충돌한다.

**배치 기본 (Normative):** 객체 **덩어리(Zone·블록 묶음)** 는 VirtualCanvas **중앙(center)** 으로 모인다. 여백미(Macro Void)는 덩어리 **사이**가 아니라 **바깥·주변**에 분배된다. **외곽 라인(outline)** — Canvas 가장자리와 덩어리 실루엣 — 은 뷰포트·Policy·`void_ratio`에 따라 **변해도 된다**; 중앙 집중 원칙만 유지하면 된다.

| 구분 | 명칭 | 역할 | 측정·허용 |
| :--- | :--- | :--- | :--- |
| **Macro Void** | 여백미 | 덩어리 **바깥·주변** 숨 쉬는 공간 · Cosmos | `void_ratio ≥ asr_base` · ASR · **중앙 집중 시 외곽에 분배** |
| **Center Cluster** | 중앙 집중 | Zone·블록 묶음의 **기본 중력** — center 정렬 | LayoutPolicy **`justify/align: center`** SSOT · 덩어리 간 gap으로 void 연출 **✗** |
| **Intra-Zone Gap** | 밀착 간격 | Zone **내부** 객체 사이 · 통일·질서 | **단일 `grid-gap` SSOT** · void_ratio **✗** |
| **Outer Outline** | 외곽 라인 | Canvas·덩어리 **외곽 실루엣** | 뷰포트 band · Policy · void에 따라 **가변** · center cluster **불변** |

```text
   ← Macro Void ──→                    ← Macro Void ──→
         ┌─────────────────────────────────────────┐  ← Outer Outline (가변)
         │                                         │
         │      ← Macro Void (상) ──→              │
         │                                         │
         │         ┌─ Zone A ─────────┐            │
         │         │ ┌──┬──┬──┐ 밀착  │            │
         │         │ │  │  │  │ Fill  │  ← Center │
         │         │ └──┴──┴──┘       │    Cluster│
         │         │ ┌────────────┐   │            │
         │         │ │  Sentinel  │   │            │
         │         │ └────────────┘   │            │
         │         └──────────────────┘            │
         │                                         │
         │      ← Macro Void (하) ──→              │
         └─────────────────────────────────────────┘
              ← Macro Void (좌) →  ← Macro Void (우) →
```

**Normative:**

- 여백미는 **컴포넌트 사이 틈**으로 만들지 않는다. Zone 내부는 **밀착·동일 gap**으로 질서를 만든다.
- **덩어리는 중앙에 모은다.** 좌·우·상·하 **외곽** void가 `void_ratio`·ASR을 충족한다.
- **외곽 라인**은 band·Policy·덩어리 span 변경으로 **늘어나거나 줄어들어도 된다** — 중앙 집중·Zone 내부 밀착만 지킨다.

### 3.3 Macro Grid · Zone · Fill-by-Similar

#### Macro Grid

- VirtualCanvas 루트: **12열** CSS Grid (Harness `columns` · `rowHeight` SSOT).
- **Tier 1~2** 객체가 **Zone** span을 선점 — LayoutPolicy · AlarmState가 Macro 좌표 소유.
- OVERLAY(`frame` · `sparkline`)는 Macro만 참조 · Zone Fill **미참여** (§4 OVERLAY).

#### Fill-by-Similar (1차 채우기 전략)

Zone 내부에 **미점유 span**이 남으면:

1. SubGrid로 쪼개지 **않는다** (기본).
2. 동일 **`clusterKey`** · 유사 `priority` · `capability` 후보에서 sibling을 추가한다.
3. 데이터가 없으면 **placeholder**(`----` · `00.00`)가 **한 칸을 점유** — 빈 DOM 셀 **금지** (UIX-007 Placeholder).
4. span이 여전히 남으면 **stretch**(colSpan +1) 또는 **Cluster Panel**(한 셀 내 다중 바인딩) — Phase별 선택.

```text
Fill 후보 풀 (clusterKey: "telemetry-meta")
  → meta-A (72°C) · meta-A' (68°C) · meta-A'' (----)

잔여 span 0 될 때까지 greedy add · maxInstances 상한 (세부 룰 · 후속)
```

#### `clusterKey` (Core 계약 · 초안)

| 필드 | 역할 |
| :--- | :--- |
| `clusterKey` | Fill sibling 그룹 ID — Core가 후보 풀 lookup |
| `fillRole` | `primary` · `sibling` · `placeholder` |
| `maxInstances` | Zone당 상한 (미지정 시 Policy default) |

경로: `packages/shared/src/schemas/bax/component-manifest.schema.ts` · `packages/shared/src/bax/layout/fill-policy.ts`

> **SubGrid:** Zone **한 칸 내부** 미세 정렬이 필요할 때만 보조. 1차 전략 **✗**.

### 3.4 간격 원칙 (Intra-Zone)

**기본 (Normative):** Zone 내부 객체는 **동일 간격으로 밀착** — `grid-gap` 하나만 SSOT (`--bax-zone-gap`).

| 규칙 | 내용 |
| :--- | :--- |
| **기본** | 객체 간 **추가 margin/padding gap 없음** · 통일감·질서 우선 |
| **예외** | **한두 객체 쌍**에만 의미 있는 간격 허용 가능 — LayoutPolicy · 도메인 preset으로 **명시적** 선언 시 |
| **금지** | Zone 내부 **불규칙·가변 gap**으로 여백미 연출 |
| **ESSENTIAL** | Sentinel 등 — span **고정** · Fill로 span 키우기 **✗** · Safe-Zone 우선 (Harness matrix) |

예외 간격의 구체 수치·적용 조건은 MVP 이후 **유연하게** 확장한다.

### 3.5 재계산 · 연산 경계

전역 Bin Packing **최적화 ✗** — 붕괴 방지 + Tier + Fill heuristics.

| 트리거 | 재계산 범위 |
| :--- | :--- |
| 뷰포트 band · LayoutPolicy 교체 | Macro · Zone span |
| AlarmState CRITICAL | ESSENTIAL Zone span (Policy 한정) |
| 데이터 tick · M2P | 해당 Zone **내부** fill · text scale · ellipsis |
| ATS · void_ratio | Macro Void **외곽** only |

복잡도 목표: Fill greedy **O(k)** · k = `maxInstances` 상한.

### 3.6 Harness — 3대 제약 (물리적 안전벨트)

Macro Grid · Fill 위에 선언적으로 얹는 **최소 통제**. 전역 최적화 코드 대신 **clamp · bounds**만 둔다.

| Harness 축 | 역할 |
| :--- | :--- |
| **그리드** | 12열 · `rowHeight` 스내핑 · Zone span 정수 칸 |
| **min/max** | `minColSpan` · `maxColSpan` · `minWidthPx` — 찌그러짐·overflow 차단 |
| **비율** | `aspect-ratio` · padding preset — **span 꽉 채운 뒤** 내부 조율 |

**구현 경로 (Greenfield):**

| 레이어 | 경로 |
| :--- | :--- |
| Core · Zod | `packages/shared/src/schemas/bax/harness.schema.ts` |
| Core · clamp | `packages/shared/src/bax/harness/apply-harness.ts` |
| Core · Fill | `packages/shared/src/bax/layout/fill-policy.ts` |
| UI · mount | `apps/bax-demo/src/canvas/VirtualCanvas.tsx` |

> 코드 샘플은 본문 가독성을 위해 **[부록 A](#부록-a-core--ui-코드-스케치)** 에 통합.

---

## 4. 객체의 고유 속성 : Tier · Capability · Component Manifest

모든 BAX 컴포넌트(세포)는 **고유 `id`** 와 사람이 읽는 **`name`** 을 갖고, **얇은 Manifest** 만 선언한다.  
Grid span · gap · 면적 상한 · min/max 숫자는 Manifest **✗** — **Tier × Capability Harness 매트릭스** + **전역 Policy** + **Harness** 가 집행한다.

> **Grid · Harness 전략:** §3 · §4 · **LLM · RuleGuard:** §5

### 4.1 Component Manifest — 속성 필드

| 필드 | 필수 | 타입 | 역할 | LLM 변경 | 비고 |
| :--- | :---: | :--- | :--- | :---: | :--- |
| **`id`** | ✅ | `string` | 시스템 **고유** 식별자 · registry key · kebab-case | ✗ | VirtualCanvas · Zod hook |
| **`name`** | ✅ | `string` | UI·문서·디버그용 **표시명** | ✗ | `id`와 1:1 · 다국어는 후속 |
| **`tier`** | ✅ | enum | Macro **중요도·선점·Fill default** (UIX `priority` 흡수) | △ | registry enum SSOT · 단계 수 **가변** |
| **`capabilities`** | ✅ | `string[]` | **자격** · host · Fill 그룹 · **OVERLAY 희귀** 표시 | △ | Capability registry lookup |
| **`clusterKey`** | ✅ | `string` | **Fill sibling** 그룹 (§3.3) · 인지적 일관성 | △ | 동종 meta·placeholder 풀 |
| **`mutability`** | ✅ | `IMMUTABLE` \| `MUTABLE` | tick·데이터마다 **재배치 허용** (G3) | △ | 사용자 pin override 후속 |

**Manifest에 두지 않는 것 (SSOT elsewhere):**

| 제거·흡수 | 대신 |
| :--- | :--- |
| `priority` (ESSENTIAL …) | **`tier`** |
| `layer` BLOCK/OVERLAY | default **BLOCK** · `capabilities`에 `render:overlay-*` **희귀** |
| `minWidth` · min/max span | **Tier × Capability → HarnessCell** |
| gap · center · void | **전역 LayoutPolicy** (§3.2 · §3.4) |
| `maxAreaRatio` (G1) | **Capability registry** → matrix merge |
| `depth` · `urgency` | **MAE/AlarmState 런타임** (Manifest 기본 ✗) |

### 4.2 Tier (티어)

**한 줄:** Macro Grid에서 **누가 먼저·넓게·중앙에 가까이** 배치되는지의 **중요도 축**.

**타이포 계층 (Normative):** `primary` = **제목(주)** · **`sub-primary`** = **바로 아래 서브제목** — 같은 덩어리·중앙 cluster 안에서 **한 쌍**으로 배치.  
`secondary` 이하는 **제목 계열이 아닌** 보조·meta·장식 — **서브제목과 별개**.

```text
        [ center cluster — 제목 덩어리 ]
              primary      ← Sentinel · 주 메시지
              sub-primary  ← Anchor · 서브제목 (primary 직하 · 좁은 span)
        ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
              secondary / meta …  ← scavenger · Fill sibling (제목과 다른 축)
```

| Tier (초안 · registry 확장 가능) | rank | 레거시 대응 | Macro 동작 (요약) |
| :--- | :---: | :--- | :--- |
| `primary` | 1 | ESSENTIAL | **주** 패널/제목 · 넓은 span · Fill **✗** · primary Zone **선점** |
| **`sub-primary`** | **2** | (신규) ESSENTIAL **직하** 서브제목 | primary **아래·인접** · span ≤ primary · Fill **✗** · **secondary와 별개** |
| `secondary` | 3 | CONTEXTUAL | contextual 보조 · Fill **⭕** · 제목 덩어리 **밖** 또는 옆 scavenger |
| `meta` | 4 | CONTEXTUAL (slim) | slim meta · Fill **⭕** |
| `deco` | 5 | TEXTURE | 장식 BLOCK · maxArea 낮음 |
| `overlay-deco` | 6 | TEXTURE + OVERLAY | **희귀** · Grid **미참여** (capability와 짝) |

**Harness (sub-primary):** matrix에서 `primary`와 **동일 Zone family** · `anchorTo: primary` · `maxColSpan ≤ primary` · tick마다 **상대 위치 고정** (mutability default **IMMUTABLE**).

> Tier **개수 고정 ✗** — `tier.registry.ts` enum + rank 만 SSOT. LLM에는 **이름 enum 목록**만 노출.

### 4.3 Capability (자격)

**한 줄:** **기술·렌더·Fill·한도** 계약. Tier와 **직교** — “무엇을 할 수 있는가 / Grid에 어떻게 참여하는가”.

**Capability registry** (`packages/shared/src/bax/capability.registry.ts`) — Zod enum · 문서 표 SSOT.

| Capability (예) | 그룹 | 역할 |
| :--- | :--- | :--- |
| `essential-panel` | host | **primary** 핵심 패널 · Safe-Zone 후보 |
| `sub-primary-heading` | host | **sub-primary** 서브제목 · primary **직하** · giant typo |
| `telemetry-meta` | cluster | 온도·습도 등 **Fill sibling** 후보 |
| `log-slim` | cluster | 짧은 로그 meta |
| `texture-deco` | render | BLOCK 장식 · **maxAreaRatio** cap |
| `render:overlay-frame` | render | **희귀** · 캔버스 전체 덧칠 · Grid **✗** |
| `render:overlay-sparkline` | render | **희귀** · anchor `sentinel` · Grid **✗** |
| `host:video-stream` | host | (예) Zone 자격 · 호스트 요건 |

**OVERLAY:** default **BLOCK**. `render:overlay-*` capability **있을 때만** OVERLAY 층 — `primary` · `sub-primary` + overlay cap **조합 불가** (Harness reject).

### 4.4 Tier × Capability Harness 매트릭스

숫자·한도는 **셀 lookup + merge** — LLM **숫자 출력 ✗**.

#### 작성 · 사용 (한 줄)

**사람(개발자)이 registry에 표를 적어 두고**, 런타임에 **컴포넌트의 `tier` + `capabilities[]`로 행·열을 lookup** → merge → clamp → Fill/overlay 집행.

#### ① 누가 · 어디에 쓰나

| 주체 | 하는 일 |
| :--- | :--- |
| **개발자 / 도메인 설계** | `harness-matrix.registry.ts`에 **(tier, capability) → HarnessCell** 정의 · PR로 버전 관리 |
| **컴포넌트 TSX** | 숫자 **✗** — `tier` · `capabilities[]` 만 선언 |
| **LLM** | tier · capabilities **enum 선택** · matrix 숫자 **✗** |
| **Harness (Core)** | lookup · merge · `applyHarness` · fill/overlay-policy **집행** |

#### ② registry 작성 예 (선언적 · SSOT)

```ts
// harness-matrix.registry.ts — (발췌 · 개념)
export const HARNESS_MATRIX = {
  "primary:essential-panel": {
    minColSpan: 2,
    maxColSpan: 6,
    minWidthPx: 300,
    fillAllowed: false,
    participatesInGrid: true,
  },
  "sub-primary:sub-primary-heading": {
    minColSpan: 1,
    maxColSpan: 4,
    fillAllowed: false,
    anchorTo: "primary", // primary 직하
    participatesInGrid: true,
  },
  "secondary:telemetry-meta": {
    minColSpan: 1,
    maxColSpan: 2,
    maxAreaRatio: 0.15,
    fillAllowed: true,
    maxInstances: 6,
    participatesInGrid: true,
  },
  "overlay-deco:render:overlay-frame": {
    participatesInGrid: false, // → overlay-policy
  },
} satisfies Record<string, HarnessCell>;
```

- **키:** `` `${tier}:${capability}` `` — capability **하나당** 셀 하나 lookup.  
- **없는 조합** → Harness **reject** 또는 tier **default** fallback (Policy에서 명시).  
- **새 규칙**(면적 상한 등) → HarnessCell **필드 추가** · 컴포넌트 Manifest **변경 ✗**.

#### ③ 런타임 사용 흐름

```text
ComponentManifest { tier: "primary", capabilities: ["essential-panel"] }
        ↓
resolveHarness(tier, capabilities)
  → 셀 lookup: "primary:essential-panel"
  → capabilities가 여러 개면 셀 merge (보수적)
  → EffectiveHarness { minColSpan:2, maxColSpan:6, fillAllowed:false, … }
        ↓
applyHarness(EffectiveHarness, proposedPlacement)  // LLM/Policy가 제안한 span clamp
        ↓
fill-policy / overlay-policy  // EffectiveHarness 플래그에 따라 분기
```

**예 — `sentinel`:**  
Manifest `primary` + `essential-panel` → matrix에서 span 2–6 · Fill ✗ → Macro Grid에 clamp 후 mount.

**예 — meta sibling Fill:**  
`secondary` + `telemetry-meta` → `fillAllowed: true` · `maxInstances: 6` → `clusterKey` 풀에서 sibling greedy add (§3.3).

#### ④ 파일 역할

```text
packages/shared/src/bax/harness/
├── harness-matrix.registry.ts   # (tier, capability) → HarnessCell  ← ★ 작성
├── resolve-harness.ts           # lookup + merge → EffectiveHarness ← ★ 사용 진입
├── apply-harness.ts             # proposed span → clamp
├── layout/fill-policy.ts        # fillAllowed=true 일 때만
└── layout/overlay-policy.ts     # participatesInGrid=false 일 때만
```

**HarnessCell (셀 · 확장 필드):**

| 필드 | 예 |
| :--- | :--- |
| `minColSpan` · `maxColSpan` · `minWidthPx` | span clamp |
| `maxAreaRatio` | G1 면적 상한 |
| `fillAllowed` | Fill sibling 허용 |
| `maxInstances` | Zone당 sibling 상한 |
| `participatesInGrid` | false → overlay-policy |
| `mutabilityDefault` | tier default · Manifest override 가능 |
| `anchorTo` | (sub-primary) **`primary` id** · 직하 배치 SSOT |

**다중 capability merge (보수적):** `min*` → **max** · `max*` → **min** · `fillAllowed` → **AND**.

### 4.5 운영 흐름

```text
┌─ ① Registry (배포 시 · 사람/코드 SSOT) ─────────────────────────────┐
│  ComponentManifest: id · name · tier · capabilities[] ·            │
│                     clusterKey · mutability                         │
│  capability.registry · tier.registry · harness-matrix.registry      │
└───────────────────────────────┬────────────────────────────────────┘
                                ↓
┌─ ② 런타임 입력 ────────────────────────────────────────────────────┐
│  사용자 · M2P · AlarmState · ATS  +  (선택) LLM Manifest delta       │
│  LLM 출력: tier · capabilities[] · clusterKey  (enum만 · 숫자 ✗)   │
└───────────────────────────────┬────────────────────────────────────┘
                                ↓
┌─ ③ Harness (packages/shared/src/bax) ──────────────────────────────┐
│  Zod 검증 → resolveHarness(tier, caps) → EffectiveHarness          │
│  → applyHarness (BLOCK span clamp)                                  │
│  → fill-policy (clusterKey sibling · placeholder)  [BLOCK only]    │
│  → overlay-policy (frame full · sparkline anchor)  [overlay cap]   │
│  → 전역 Policy: gap · center cluster · void_ratio (§3)              │
└───────────────────────────────┬────────────────────────────────────┘
                                ↓
┌─ ④ UI (apps/web · bax-demo) ───────────────────────────────────────┐
│  VirtualCanvas: BLOCK Grid mount + OVERLAY 층 합성                  │
│  컴포넌트 TSX: id/name registry + 콘텐츠 렌더만 (좌표 계산 ✗)       │
└────────────────────────────────────────────────────────────────────┘
```

| 단계 | 주체 | 책임 |
| :--- | :--- | :--- |
| **Registry** | 개발자 · 도메인 preset | Manifest 고정 · matrix 셀 정의 |
| **LLM** | agent-graph (Phase 2+) | **tier · capabilities · clusterKey** 맥락 선택 |
| **Harness** | Core | 숫자·한도·Fill·overlay anchor **집행** |
| **사용자** | ATS · pin (후속) | **mutability** override · 고정/허용 |
| **UI** | engines/bax | ResolvedLayout → CSS Grid + OVERLAY |

### 4.6 MVP 4종 매핑 (초안)

| `id` | `name` | `tier` | `capabilities` | `clusterKey` | `mutability` |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `anchor` | Anchor | **`sub-primary`** | `sub-primary-heading` | `title-sub` | IMMUTABLE |
| `frame` | Frame | `overlay-deco` | `render:overlay-frame` | — | IMMUTABLE |
| `sentinel` | Sentinel | `primary` | `essential-panel` | `essential-primary` | MUTABLE |
| `sparkline` | Sparkline | `overlay-deco` | `render:overlay-sparkline` | — | MUTABLE |

> **제목 덩어리:** `sentinel`(primary) + `anchor`(sub-primary) — §3.2 center cluster **한 쌍**.  
> `secondary`/`meta` Fill은 **이 덩어리 바깥** scavenger.

> `frame` · `sparkline`: **Grid 미참여** — overlay-policy가 위치 집행. Fill **✗**.

---

## 5. 지능형 AI 에이전트 아키텍처 (LLM과 Harness의 융합)

복잡한 if/else 예외 처리를 **Manifest + Tier × Capability Harness 매트릭스**로 대체한다.  
**LLM = 정성적 분류(판사)** · **Harness = 정량적 집행(경찰)** · **UI = 렌더(집행)** — §3 Grid · §4 Manifest와 **동일 SSOT**.

> **인프라 SSOT:** LLM·SSE = **`apps/agent-graph`** 단일 (TDD-007 §2 ④) · Zod 계약 = **`packages/shared`**

### 5.1 한 줄 원칙

| # | 원칙 | 구현 |
| :-: | :--- | :--- |
| **①** | **LLM은 enum만** | `tier` · `capabilities[]` · `clusterKey` · (선택) `mutability` — **registry 키만** |
| **②** | **숫자는 Harness** | span · min/max · maxArea · Fill 상한 — **matrix lookup** (§4.4) |
| **③** | **전역은 Policy** | gap · center · void_ratio — LLM **✗** · LayoutPolicy |
| **④** | **불가 조합 reject** | Zod + matrix miss + primary+overlay → **fallback** · RuleGuard |
| **⑤** | **urgency는 런타임** | AlarmState · M2P — Manifest **기본 ✗** (§5) |

### 5.2 3층 오케스트레이션

```text
[ 트리거: 사용자 · M2P · AlarmState · 도메인 이벤트 · (Phase 2+) LLM ]
                              ↓
┌─ 1. LLM — 정성적 판단 (apps/agent-graph) ──────────────────────────┐
│  graphs/bax_layout.py (Phase 2+)                                     │
│  입력: 맥락 · registry enum 목록 · RAG(§6) · 현재 Manifest 스냅샷   │
│  출력: BaxManifestDelta JSON (Zod SSOT) — tier · caps · clusterKey  │
│  ✗ minColSpan · gap · px · overlay 좌표 · void_ratio 숫자            │
└───────────────────────────────┬────────────────────────────────────┘
                                ↓
┌─ 2. Harness — 정량적 통제 (packages/shared/src/bax) ───────────────┐
│  manifest.schema → resolveHarness(tier × caps) → EffectiveHarness   │
│  → applyHarness (BLOCK span clamp)                                  │
│  → fill-policy (clusterKey sibling · §3.3)                          │
│  → overlay-policy (render:overlay-* · §4.3)                         │
│  → guardrails (G1–G5 · Safe-Zone · AlarmState 연동)                 │
│  + 전역 Policy: gap · center cluster · void (§3)                    │
└───────────────────────────────┬────────────────────────────────────┘
                                ↓
┌─ 3. UI — 시각적 집행 (apps/web · bax-demo) ────────────────────────┐
│  engines/bax · VirtualCanvas                                        │
│  ResolvedLayout → CSS Grid (BLOCK) + OVERLAY 합성 · Tailwind/CSS vars│
│  컴포넌트: id · name · 콘텐츠만 — 좌표 계산 ✗                        │
└────────────────────────────────────────────────────────────────────┘
```

**Nest `backend`:** 인증 · 승인 · **agent-graph HTTP/SSE 프록시** — LLM 로직 **임베드 ✗**.

### 5.3 LLM vs Harness — 책임 분리

| 항목 | LLM | Harness (Core) |
| :--- | :---: | :---: |
| `tier` · `capabilities[]` 선택 | ⭕ | lookup |
| `clusterKey` · Fill **계열** 제안 | ⭕ | greedy add · maxInstances |
| `mutability` (맥락·사용자 의도) | △ 제안 | Manifest default · user pin |
| min/max span · minWidthPx | ✗ | matrix |
| maxAreaRatio (G1) | ✗ | matrix |
| gap · center · void_ratio | ✗ | LayoutPolicy |
| OVERLAY 위치 (frame / sparkline anchor) | ✗ | overlay-policy |
| urgency CRITICAL | ✗ | **AlarmState** → LayoutPolicy (1 tick) |
| `depth` · blur · opacity | ✗ | MAE / DepthProfile · [`UIX-007`](./07_UIUX_그리드알고리즘_동적타이포그래피UI.md) |

### 5.4 LLM 출력 계약 (BaxManifestDelta · 초안)

경로: `packages/shared/src/schemas/bax/manifest-delta.schema.ts`

```json
{
  "componentId": "sentinel",
  "tier": "primary",
  "capabilities": ["essential-panel"],
  "clusterKey": "essential-primary",
  "mutability": "MUTABLE",
  "reason": "contextual one-line for audit"
}
```

- **delta만** 출력 — registry `id`·`name` **변경 ✗**  
- enum은 **`tier.registry` · `capability.registry` · clusterKey whitelist** 외 reject  
- Phase 1 (bax-demo): LLM **off** — registry Manifest 고정 · Harness만 검증

### 5.5 Harness 집행 순서 (런타임)

```text
1. Manifest (registry ± LLM delta) — Zod parse
2. resolveHarness(tier, capabilities[]) — matrix merge
3. AlarmState / RuleGuard — urgency · CRITICAL span (BLOCK only)
4. applyHarness — proposed placement clamp
5. fill-policy — if fillAllowed && MUTABLE tick
6. overlay-policy — if !participatesInGrid
7. 전역 Policy — place-content-center · --bax-zone-gap · void_ratio
8. ResolvedLayout → UI mount
```

**Fail-closed:** matrix miss · illegal tier+cap · primary+`render:overlay-*` → **delta 폐기** · registry baseline 유지 · audit log.

### 5.6 MVP · Phase 로드맵

| Phase | LLM | Harness | 검증 질문 |
| :--- | :--- | :--- | :--- |
| **MVP** (`bax-demo`) | off · Ollama AestheticTuner만 (Phase 2) | matrix + fill + overlay **고정 registry** | tier+cap만으로 Grid **붕괴 ✗**? |
| **Phase 2** | `agent-graph` · `bax_layout` graph | LLM delta + RAG enum guard | 잘못된 cap **Harness가 차단**? |
| **Phase 3** (§6) | sLLM · matrix enum만 | 동일 Harness · 비용↓ | Flywheel 레시피 **자동 tier/cap** |

### 5.7 §4 · §3와의 정합

| 본 문서 | §5에서의 역할 |
| :--- | :--- |
| §3 Grid · Fill · center · gap Policy | Harness **7단계** · LLM **non-scope** |
| §4 Manifest 6필드 | LLM delta **상한** · matrix **숫자 SSOT** |
| §4.4 matrix registry | Harness **resolveHarness** 입력 |
| §6 Flywheel | LLM **프롬프트·파인튜닝** 데이터 — Harness 규칙 **불변** |

```text
Cosmos: Harness + Policy + matrix (질서 · 재현 가능)
Chaos:  LLM tier/cap/cluster 선택 + 사용자 mutability (맥락 · 의도)
```

---

## 6. 지속 가능한 진화 : Layout Profile · Flywheel

시간이 지날수록 **사용자 직접 배치(Layout DNA)** 를 축적해, 개인 **재방문 default** 와 **집단 레시피(RAG · LLM)** 로 이어지는 진화 구조.  
**1차 입력 = “좋다/싫다” ✗** · **Harness 통과한 사용자 배치 ✓** — 감성 태그는 **보조·낮은 가중치**만.

> **범위:** 본 절은 **방향·단계 SSOT**. 브랜드·PMF·저항은 **L1 Personal** 검증 후 확장 (과장 **✗**).

### 6.1 한 줄 원칙

| # | 원칙 | 구현 |
| :-: | :--- | :--- |
| **①** | **편집 opt-in** | baseline 먼저 · **고급/핀** — 편집 강요 **✗** |
| **②** | **Harness gate** | 저장·Flywheel 적재 **전** clamp · fillAllowed · maxArea **PASS** |
| **③** | **개인 vs 집단 분리** | Profile = **user default** · Vector = **익명·집계** |
| **④** | **재방문 default** | `LayoutProfile[user, domainKey, band]` > domain preset > registry |
| **⑤** | **matrix 자동 변경 ✗** | 집단 레시피 → RAG·**승인형** matrix 후보만 |

### 6.2 2층 데이터

| 층 | 명칭 | 저장 | LLM |
| :--- | :--- | :--- | :--- |
| **L1 Personal** | Layout Profile | DB JSON · user-scoped | **불필요** — 재방문 mount |
| **L2 Collective** | Layout DNA embed | Vector DB (pgvector) | RAG · tier/cap **힌트** (§5) |
| **L3** | matrix · Policy 후보 | registry PR · **사람 승인** | 전역 baseline 개선 |
| **L4** | sLLM | Harness-pass 스냅샷 대량 | enum만 · Phase 3 |

**Layout DNA (저장 스냅샷 · 초안):**

```json
{
  "userId": "…",
  "domainKey": "nexia",
  "viewportBand": "xl",
  "placements": [{ "componentId": "sentinel", "col": 1, "colSpan": 4, "row": 1, "rowSpan": 3 }],
  "manifestSnapshot": { "tier": "primary", "capabilities": ["essential-panel"], "clusterKey": "essential-primary" },
  "source": "user-edit",
  "harnessPass": true,
  "updatedAt": "…"
}
```

경로: `apps/backend` · `project_layout_profiles` (또는 user settings) · embed job → `knowledge/` pgvector (TDD-007).

### 6.3 사용자 직접 구성 (편집 모드)

```text
Registry baseline
      ↓
[편집 mode]  MUTABLE BLOCK만 drag · pin · meta sibling on/off (§4 mutability)
      ↓
Harness 실시간 clamp — primary/sub-primary IMMUTABLE (또는 pin)
      ↓
[저장]  Layout Profile (L1) — harnessPass=true 만
      ↓
(옵트인) 익명화 → Vector embed (L2)
```

- **Factory reset** · **domain preset 복귀** — 항상 제공 (저 resistance).  
- **gap · center · void** — 전역 Policy · 사용자가 깨지 **✗** (§3).

### 6.4 Flywheel — **수십 명** 규모 (전제)

**“몇 명” = 수십(約 20~50+) 명** 이 **동일 `domainKey`** 에서 Harness-pass Profile을 남길 때 집단 층이 실질적으로 돌아간다.

| 규모 | 효과 |
| :--- | :--- |
| **1~5** | L1 개인 default만 의미 · 집단 RAG **미약** |
| **수십 (~20+)** | 유사 band·domain **클러스터** embed · LLM tier/cap **힌트** ⭕ |
| **50+** | domain **baseline preset** · matrix 튜닝 **후보** (승인) |
| **대량** | sLLM · §6 L4 (Phase 3) |

```text
수십 명 Layout DNA (Harness-pass · 익명)
              ↓
    Vector DB — 유사 레이아웃 검색 (RAG)
              ↓
    agent-graph — BaxManifestDelta tier/cap/cluster 제안 (§5.4)
              ↓
    Harness — 동일 집행 · fail-closed
              ↓
    (승인) harness-matrix · domain preset 갱신 — 서비스 전역 안정
```

**“빠른 학습”:** **수십 명** 패턴 → RAG·LLM **제안 가속** · **전역 matrix 자동 반영 ✗** (불안정 방지).

### 6.5 감성 피드백 (보조)

| 입력 | 가중치 | 용도 |
| :--- | :--- | :--- |
| **Layout Profile (직접 배치)** | **高** | L1 default · L2 embed |
| “불편해/좋아” (optional) | **低** | RAG 태그 · audit — **배치 DNA 대체 ✗** |

### 6.6 Phase 로드맵

| Phase | Deliverable | Flywheel |
| :--- | :--- | :--- |
| **6a** | Layout Profile 저장 · 재방문 default | L1 only |
| **6b** | 편집 mode · mutability · reset | L1 + Harness gate |
| **6c** | 익명 embed · RAG (`agent-graph`) | L2 · **수십 명** 부터 유의미 |
| **6d** | 승인형 preset · matrix 후보 | L3 |
| **6e** | sLLM | L4 |

### 6.7 §5 · §4 정합 · 한계 (명시)

- **브랜드:** baseline 미학 + **제한된 편집** — 자유 빌더화 **✗** (§3 Cosmos).  
- **실용:** **반복·운영** 사용자에게 L1 가치 큼 — casual은 baseline 품질이 전부.  
- **저 resistance:** opt-in · immutable core · factory reset (§6.1 ①).  
- **Cosmos/Chaos:** Harness+Policy = Cosmos · 사용자 배치+LLM enum = Chaos (§5.7).

---

## 부록 A. Core · UI 코드 스케치

> **범위:** §3 Grid · §4 Manifest · §4.4 matrix · §5 Harness · §6 Profile — **한 흐름** 스케치.

```text
[Core] Manifest Zod → resolveHarness(matrix) → applyHarness → fill-policy
                         ↑ LayoutProfile (§6 L1) optional override
[UI]   registry → VirtualCanvas(BLOCK) + OverlayLayer → component render only
```

---

### A.1 Core — `packages/shared/src/` (브라우저 무관)

#### A.1.1 Manifest · Layout DNA

```ts
// schemas/bax/component-manifest.schema.ts
import { z } from "zod";

export const TierSchema = z.enum([
  "primary", "sub-primary", "secondary", "meta", "deco", "overlay-deco",
]);
export const MutabilitySchema = z.enum(["IMMUTABLE", "MUTABLE"]);

export const ComponentManifestSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  tier: TierSchema,
  capabilities: z.array(z.string()).min(1),
  clusterKey: z.string().min(1),
  mutability: MutabilitySchema,
});

export type ComponentManifest = z.infer<typeof ComponentManifestSchema>;

// schemas/bax/layout-profile.schema.ts — §6 L1
export const LayoutPlacementSchema = z.object({
  componentId: z.string(),
  col: z.number().int().min(1),
  row: z.number().int().min(1),
  colSpan: z.number().int().min(1),
  rowSpan: z.number().int().min(1),
});

export const LayoutProfileSchema = z.object({
  userId: z.string(),
  domainKey: z.string(),
  viewportBand: z.enum(["xl", "md", "sm"]),
  placements: z.array(LayoutPlacementSchema),
  harnessPass: z.literal(true),
  source: z.enum(["registry", "user-edit"]),
});

export type LayoutProfile = z.infer<typeof LayoutProfileSchema>;
```

#### A.1.2 Harness matrix · resolve

```ts
// bax/harness/harness-matrix.registry.ts — §4.4 (발췌)
export type HarnessCell = {
  minColSpan?: number;
  maxColSpan?: number;
  minWidthPx?: number;
  maxAreaRatio?: number;
  fillAllowed?: boolean;
  maxInstances?: number;
  participatesInGrid?: boolean; // false → overlay-policy
  anchorTo?: "primary";
};

export const HARNESS_MATRIX: Record<string, HarnessCell> = {
  "primary:essential-panel": {
    minColSpan: 2, maxColSpan: 6, minWidthPx: 300, fillAllowed: false, participatesInGrid: true,
  },
  "sub-primary:sub-primary-heading": {
    minColSpan: 1, maxColSpan: 4, fillAllowed: false, participatesInGrid: true, anchorTo: "primary",
  },
  "secondary:telemetry-meta": {
    minColSpan: 1, maxColSpan: 2, maxAreaRatio: 0.15, fillAllowed: true, maxInstances: 6, participatesInGrid: true,
  },
  "overlay-deco:render:overlay-frame": { participatesInGrid: false },
};

// bax/harness/resolve-harness.ts
export function resolveHarness(tier: string, capabilities: string[]): HarnessCell {
  const cells = capabilities.map((cap) => {
    const cell = HARNESS_MATRIX[`${tier}:${cap}`];
    if (!cell) throw new Error(`harness miss: ${tier}:${cap}`);
    return cell;
  });
  return mergeCells(cells); // min* max · max* min · fillAllowed AND
}

function mergeCells(cells: HarnessCell[]): HarnessCell {
  return {
    minColSpan: Math.max(...cells.map((c) => c.minColSpan ?? 1)),
    maxColSpan: Math.min(...cells.map((c) => c.maxColSpan ?? 12)),
    fillAllowed: cells.every((c) => c.fillAllowed !== false),
    participatesInGrid: cells.every((c) => c.participatesInGrid !== false),
  };
}
```

#### A.1.3 applyHarness · fill-policy (발췌)

```ts
// bax/harness/apply-harness.ts
export type GridPlacement = { col: number; row: number; colSpan: number; rowSpan: number };

export function applyHarness(cell: HarnessCell, proposed: GridPlacement, gridCols = 12): GridPlacement {
  const maxSpan = Math.min(cell.maxColSpan ?? gridCols, gridCols);
  const colSpan = clamp(proposed.colSpan, cell.minColSpan ?? 1, maxSpan);
  return {
    col: clamp(proposed.col, 1, gridCols - colSpan + 1),
    row: Math.max(1, proposed.row),
    colSpan,
    rowSpan: Math.max(1, proposed.rowSpan),
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

// bax/layout/fill-policy.ts — §3.3
export function fillSiblings(
  cell: HarnessCell,
  clusterKey: string,
  remainingSpans: number,
  pool: { id: string; clusterKey: string }[],
): string[] {
  if (!cell.fillAllowed || remainingSpans <= 0) return [];
  const siblings = pool.filter((p) => p.clusterKey === clusterKey).slice(0, cell.maxInstances ?? 6);
  return siblings.slice(0, remainingSpans).map((p) => p.id);
}
```

#### A.1.4 Layout pipeline (Core 진입점)

```ts
// bax/resolve-layout.ts
export function resolveBlockLayout(
  manifest: ComponentManifest,
  proposed: GridPlacement,
  profile?: z.infer<typeof LayoutProfileSchema>,
): GridPlacement {
  const cell = resolveHarness(manifest.tier, manifest.capabilities);
  if (cell.participatesInGrid === false) {
    throw new Error("OVERLAY must use overlay-policy, not BLOCK grid");
  }
  const base = profile?.placements.find((p) => p.componentId === manifest.id) ?? proposed;
  return applyHarness(cell, base);
}
```

#### A.1.5 manifest-delta · overlay-policy (§5)

```ts
// schemas/bax/manifest-delta.schema.ts — LLM enum-only · 숫자 ✗
export const BaxManifestDeltaSchema = z.object({
  componentId: z.string().min(1),
  tier: TierSchema,
  capabilities: z.array(z.string()).min(1),
  clusterKey: z.string().min(1),
  mutability: MutabilitySchema,
  reason: z.string().max(200),
});

export type BaxManifestDelta = z.infer<typeof BaxManifestDeltaSchema>;

// bax/apply-manifest-delta.ts — fail-closed (§5.5)
export function applyManifestDelta(
  registry: ComponentManifest[],
  delta: BaxManifestDelta,
): ComponentManifest {
  const base = registry.find((m) => m.id === delta.componentId);
  if (!base) throw new Error("unknown componentId");

  const cell = resolveHarness(delta.tier, delta.capabilities); // matrix miss → throw → delta 폐기
  if (delta.tier === "primary" && delta.capabilities.some((c) => c.startsWith("render:overlay-"))) {
    throw new Error("primary + overlay cap forbidden");
  }

  return { ...base, tier: delta.tier, capabilities: delta.capabilities, clusterKey: delta.clusterKey, mutability: delta.mutability };
}
```

```ts
// bax/layout/overlay-policy.ts — participatesInGrid=false 전용 (§5.3)
export type OverlayPlacement =
  | { kind: "frame"; inset: 0 }
  | { kind: "sparkline"; anchorComponentId: string; offset: { x: number; y: number } };

export function resolveOverlayPlacement(
  manifest: ComponentManifest,
  cell: HarnessCell,
  anchorRects: Map<string, DOMRectReadOnly>,
): OverlayPlacement {
  if (cell.participatesInGrid !== false) {
    throw new Error("overlay-policy: BLOCK component");
  }
  const cap = manifest.capabilities.find((c) => c.startsWith("render:overlay-"));
  if (cap === "render:overlay-frame") return { kind: "frame", inset: 0 };
  if (cap === "render:overlay-sparkline") {
    const anchorId = cell.anchorTo ?? "sentinel";
    const rect = anchorRects.get(anchorId);
    if (!rect) throw new Error(`anchor miss: ${anchorId}`);
    return { kind: "sparkline", anchorComponentId: anchorId, offset: { x: rect.right - 80, y: rect.bottom - 24 } };
  }
  throw new Error(`overlay cap miss: ${manifest.id}`);
}
```

#### A.1.6 agent-graph 연동 (Core 소비 · §5.2)

```ts
// apps/agent-graph/src/graphs/bax-layout.ts — delta 생성만 · Harness 집행 ✗
export async function proposeLayoutDelta(ctx: DomainContext): Promise<BaxManifestDelta> {
  // Phase 2: RAG enum guard → LLM tier/cap/clusterKey 제안
  return {
    componentId: "sentinel",
    tier: "primary",
    capabilities: ["essential-panel"],
    clusterKey: "essential-primary",
    mutability: "MUTABLE",
    reason: "domain telemetry emphasis",
  };
}

// apps/bax-demo — SSE 수신 후 Core gate
export function ingestAgentDelta(registry: ComponentManifest[], raw: unknown) {
  const parsed = BaxManifestDeltaSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, registry };
  try {
    const merged = applyManifestDelta(registry, parsed.data);
    return { ok: true as const, manifest: merged };
  } catch {
    return { ok: false as const, registry }; // fail-closed → baseline 유지
  }
}
```

---

### A.2 UI — `apps/bax-demo/src/` (렌더 · registry)

#### A.2.1 Component registry (Manifest SSOT)

```ts
// components/registry.ts — §4.6 MVP 4종
import type { ComponentManifest } from "@nexa/shared/schemas/bax/component-manifest.schema";

export const BAX_REGISTRY: ComponentManifest[] = [
  {
    id: "sentinel", name: "Sentinel",
    tier: "primary", capabilities: ["essential-panel"],
    clusterKey: "essential-primary", mutability: "MUTABLE",
  },
  {
    id: "anchor", name: "Anchor",
    tier: "sub-primary", capabilities: ["sub-primary-heading"],
    clusterKey: "title-sub", mutability: "IMMUTABLE",
  },
  {
    id: "frame", name: "Frame",
    tier: "overlay-deco", capabilities: ["render:overlay-frame"],
    clusterKey: "—", mutability: "IMMUTABLE",
  },
  {
    id: "sparkline", name: "Sparkline",
    tier: "overlay-deco", capabilities: ["render:overlay-sparkline"],
    clusterKey: "—", mutability: "MUTABLE",
  },
];
```

#### A.2.2 컴포넌트 — 콘텐츠만 (좌표 ✗)

```tsx
// components/SentinelCard.tsx
type Props = { title: string; value: string };

export function SentinelCard({ title, value }: Props) {
  return (
    <article className="bax-sentinel flex h-full flex-col justify-center p-[var(--bax-pad,1rem)]">
      <h2 className="text-sm opacity-70">{title}</h2>
      <p className="text-2xl font-semibold">{value}</p>
    </article>
  );
}

// components/Anchor.tsx — sub-primary · giant typo (발췌)
export function Anchor({ text }: { text: string }) {
  return <p className="bax-anchor text-6xl font-bold tracking-tight">{text}</p>;
}
```

#### A.2.3 VirtualCanvas — BLOCK + OVERLAY 합성

```tsx
// canvas/VirtualCanvas.tsx
import type { LayoutProfile } from "@nexa/shared/schemas/bax/layout-profile.schema";
import type { GridPlacement } from "@nexa/shared/bax/harness/apply-harness";
import { resolveBlockLayout } from "@nexa/shared/bax/resolve-layout";
import { resolveOverlayPlacement } from "@nexa/shared/bax/layout/overlay-policy";
import { resolveHarness } from "@nexa/shared/bax/harness/resolve-harness";
import { BAX_REGISTRY } from "../components/registry";
import { SentinelCard } from "../components/SentinelCard";
import { Anchor } from "../components/Anchor";
import { FrameOverlay } from "./FrameOverlay";
import { SparklineOverlay } from "./SparklineOverlay";

const COMPONENTS = {
  sentinel: SentinelCard,
  anchor: Anchor,
} as const;

export function VirtualCanvas({ profile }: { profile?: LayoutProfile }) {
  const sentinelManifest = BAX_REGISTRY.find((m) => m.id === "sentinel")!;
  const anchorManifest = BAX_REGISTRY.find((m) => m.id === "anchor")!;

  const sentinelPlace = resolveBlockLayout(
    sentinelManifest,
    { col: 1, row: 4, colSpan: 4, rowSpan: 3 },
    profile,
  );
  const anchorPlace = resolveBlockLayout(
    anchorManifest,
    { col: 1, row: 1, colSpan: 4, rowSpan: 2 },
    profile,
  );

  const sparklineManifest = BAX_REGISTRY.find((m) => m.id === "sparkline")!;
  const sparklineCell = resolveHarness(sparklineManifest.tier, sparklineManifest.capabilities);
  const anchorRects = new Map([["sentinel", { right: 320, bottom: 280 } as DOMRectReadOnly]]);
  const sparklinePlace = resolveOverlayPlacement(sparklineManifest, sparklineCell, anchorRects);

  return (
    <div className="bax-root relative">
      {/* BLOCK Grid — §3.2 center · §3.4 gap Policy */}
      <div
        className="bax-canvas grid place-content-center"
        style={{
          gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
          gridAutoRows: "16px",
          gap: "var(--bax-zone-gap, 0px)",
        }}
      >
        <GridSlot placement={anchorPlace}>
          <Anchor text="NEXA" />
        </GridSlot>
        <GridSlot placement={sentinelPlace}>
          <SentinelCard title="Temperature" value="72°C" />
        </GridSlot>
        {/* fill-policy → secondary/meta siblings (§3.3) */}
      </div>

      {/* OVERLAY — Grid span ✗ · overlay-policy (Core → style) */}
      <FrameOverlay />
      <SparklineOverlay placement={sparklinePlace} />
    </div>
  );
}

function GridSlot({ placement, children }: { placement: GridPlacement; children: React.ReactNode }) {
  return (
    <div
      style={{
        gridColumn: `${placement.col} / span ${placement.colSpan}`,
        gridRow: `${placement.row} / span ${placement.rowSpan}`,
      }}
    >
      {children}
    </div>
  );
}
```

```tsx
// canvas/FrameOverlay.tsx — capability render:overlay-frame
export function FrameOverlay() {
  return <div className="bax-frame pointer-events-none absolute inset-0" aria-hidden />;
}

// canvas/SparklineOverlay.tsx — Core overlay-policy 결과만 소비
import type { OverlayPlacement } from "@nexa/shared/bax/layout/overlay-policy";

export function SparklineOverlay({ placement }: { placement: Extract<OverlayPlacement, { kind: "sparkline" }> }) {
  return (
    <div
      className="bax-sparkline pointer-events-none absolute h-6 w-20"
      style={{ left: placement.offset.x, top: placement.offset.y }}
      data-anchor={placement.anchorComponentId}
    />
  );
}
```

---

### A.3 흐름 · § 매핑

| 단계 | Core | UI |
| :--- | :--- | :--- |
| Manifest | `ComponentManifestSchema` | `BAX_REGISTRY` |
| LLM delta §5 | `BaxManifestDeltaSchema` · `applyManifestDelta` | `ingestAgentDelta` |
| Harness | `resolveHarness` → `applyHarness` | `resolveBlockLayout` 호출 |
| Fill | `fill-policy.ts` | VirtualCanvas sibling mount |
| OVERLAY | `overlay-policy.ts` | `FrameOverlay` · `SparklineOverlay` |
| Profile §6 | `LayoutProfileSchema` | `VirtualCanvas({ profile })` |
| Policy | — | `--bax-zone-gap` · `place-content-center` |
| agent-graph | `proposeLayoutDelta` | SSE → ingest → re-mount |

```text
registry Manifest
    → resolveHarness(tier, caps)     [Core]
    → applyHarness · profile merge   [Core]
    → fill-policy (siblings)         [Core → UI mount list]
    → overlay-policy (no span)       [Core → UI style]
    → GridSlot mount                 [UI]
    → OverlayLayer                   [UI]
```

---

## 승격 · 통합 이력

- [x] `_inbox/…_v1.0.md` → `07_UIUX/` · **`doc_id: UIX-003`** — 2026-06-22
- [x] 구 `07_UIUX_BAX_미학적인터페이스UX아키텍처.md` (MAE 장문 draft) **삭제** — v1.0 Harness 모델로 **단일 SSOT** 통합

## 관련 문서

| 관계 | 문서 |
| :--- | :--- |
| 그리드 · 타이포 | [그리드 알고리즘 · 동적 타이포그래피 UI (UIX-007)](./07_UIUX_그리드알고리즘_동적타이포그래피UI.md) |
| 모노레포 경로 | [NEXA-Platform 모노레포 폴더 구조 v1.0 (TDD-007)](../08_TDD/NEXAOS/08_TDD_NEXAOS_모노레포폴더구조_v1.0.md) |
| Mission-Safe | [NEXA OS · 수직 계층 보안 (TDD-004)](../08_TDD/NEXAOS/08_TDD_NEXAOS_수직계층보안아키텍처.md) |
| 도메인 mount | [NEXIA MainShell · 레이아웃 v1.0 (UIX-004)](./07_UIUX_NEXIA_MainShell_레이아웃_v1.0.md) |
| 구현 BRD | [NEXA 사업 마스터 플랜 (BRD-001)](../01_BRD/01_BRD_NEXA_사업마스터플랜.md) |

---
