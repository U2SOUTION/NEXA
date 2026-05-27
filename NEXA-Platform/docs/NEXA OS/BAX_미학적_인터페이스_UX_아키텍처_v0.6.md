# BAX (Breathing AI Experience)
**미학적 인터페이스 · 사용자경험 아키텍처 정의서**
MVP 개발 SSOT — v0.6

> **문서 유형**: B — MVP 개발 SSOT (Functional Requirements · API · Matrix 중심)
> **상태**: Draft · **관련**: NEXA OS V2.1 · **실험 앱**: `apps/bax-demo`

---

## 약어 및 용어 정의

| 약어 | 풀네임 | 설명 |
|---|---|---|
| **BAX** | Breathing AI Experience | 인간의 의지와 AI 호흡이 결합된 **전체 사용자 경험 브랜드** |
| **MAE** | Matrix Aesthetic Engine | BAX를 3×3 Matrix·OVR·blur·진동으로 **구현하는 UI 엔진** |
| **M2P** | Matrix-to-Peripheral | 디스플레이(3×3 Matrix) ↔ 조작 장치(Peripheral) 미학 패킷 프로토콜 |
| **OVR** | Optimal Void Ratio (적정여백율) | 모드·뷰포트·가드레일이 정하는 `void_ratio` 하한 |
| **VirtualCanvas** | — | 픽셀이 아닌 **위상·농담·진동**으로 정의한 BAX 단일 페이지 캔버스 |
| **NIXIE Agent** | — | AI 캐릭터 기반 센서 결합 입력 에이전트 (캐릭터 + 센서 융합 입력) |
| **RuleGuard** | Rule-based Guard Engine | Phase 1 즉각 판단을 담당하는 `ruleEngine` 공식 명칭 |
| **AestheticTuner** | AI Aesthetic Fine-tuner | Phase 2 Ollama 기반 미세조정 레이어 공식 명칭 |
| **AXON** | Adaptive Cross-domain Ontology Network | 상위 우주 의미 소통 시스템 (APEX·HEXAGON·CONTO·KORE 포함) |

---

## 아키텍처 개요

**핵심 명제**: _여백은 자신감이다._ — IoT 관제에서 정보 과부하를 **여백·깊이·선명도**로 통제한다. BAX는 운영자 **의지**(M2P)와 **AI 호흡**(RuleGuard + AestheticTuner)이 만나는 UX 브랜드이며, MAE가 Matrix·OVR·blur를 실행한다.

### 시스템 계층 구조

```
BAX  Breathing AI Experience     ← UX 브랜드 (의지 + AI 호흡)
 ├── M2P  Matrix-to-Peripheral   ← 인간 의지 입력 (슬라이더·Serial·WS)
 └── MAE  Matrix Aesthetic Engine ← 3×3 Matrix · OVR · blur 실행 엔진
       ├── RuleGuard              ← Phase 1: 즉각 규칙 판단 (0ms)
       └── AestheticTuner        ← Phase 2: Ollama 미세조정 (지연 허용)
```

### 데이터 흐름 다이어그램

```
┌─────────────────────────────────────────────────┐
│  Input: Diverse Intent & Signal                 │
│  시맨틱매트릭스 · M2P슬라이더 · NIXIE · 엣지    │
└────────────────────┬────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────┐
│  MAE Pipeline: Hybrid Interpretation            │
│  Phase 1 Urgent (RuleGuard)  →  0ms 즉각 결정  │
│         ↓                                       │
│  Phase 2 Fine-tune (AestheticTuner)  →  지연   │
│         ↓                                       │
│  MAE Engine — Topology/Density/Vibration 산출   │
└────────────────────┬────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────┐
│  Final Approval: G2 Guardrail                   │
│  OVR 하한 검토  ←→  Safe-Zone 승인              │
│  충돌 시: Safe-Zone 우선 (ovrOverride)           │
└────────────────────┬────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────┐
│  Experience: BAX Projection                     │
│  VirtualCanvas → BAX 경험 (호흡하는 인터페이스)  │
└─────────────────────────────────────────────────┘
```

---

## MVP 범위

**검증 질문**: BAX 경험에서 슬라이더(의지)·가상 센서·(선택) Ollama(AI 호흡)가 `matrix_id` · `void_ratio` · `focus_blur`를 MAE에 내리면, **3×3 주소 기반 UI**가 **≤300ms** easing으로 호흡(수축/이완)하는가?

| In scope (MVP) | Out of scope (MVP) |
|---|---|
| 단일 SPA · 컴포넌트 3종 (Anchor·Frame·Sentinel) | 다페이지 · `domainLayoutRegistry` 전체 |
| **BAX 운영 모드** 4종 + 수동 전환 | nexage 전역 기본값 강제 |
| **OVR** · 뷰포트 밀도 적응 (기본) | 전 해상도 픽셀 단위 여백 보장 |
| 웹 슬라이더 = Peripheral 대체 | 전용 M2P 하드웨어 대량 생산 |
| 가상 센서 1종 + **RuleGuard→AestheticTuner 2단계** | 다중 IoT · SSE · Grade3 제어 |
| **Sparkline** (V1 진동) · Circuit Gate | 오디오 vibration (V3) |
| CSS `backdrop-filter` · Framer/GSAP | 오디오 레이어 · WCAG 실운영 인증 |

---

## 1. 설계 원칙

### 핵심 3원소

| 원소 | SSOT 변수 | MVP 역할 |
|---|---|---|
| **위상 (Topology)** | `matrix_id` (9칸) | 컴포넌트 주소·z-index·blur 기본값 |
| **농담 (Density)** | `void_ratio` · **OVR** | 모드·뷰포트별 하한 — 상한 100 |
| **진동 (Vibration)** | Sparkline · micro-motion · (후속) audio | 시각적 맥박 — Circuit Open 시 최우선 차단 |

### 컴포넌트 객체 속성 체계

모든 UI 노드는 **Depth × Mutability × Priority** 3축 메타데이터로 분류한다.

**① 축 정의**

| 축 | 속성명 | 값 | 설명 |
|---|---|---|---|
| **공간** | `depth` | `BG` | 원경 — blur↑ · opacity↓ · 구도·질감 |
| | | `MID` | 중경 — blur 중간 · 맥락·보조 정보 |
| | | `FG` | 근경 — blur 0 · ESSENTIAL 가독 정보 |
| **시간** | `mutability` | `IMMUTABLE` | 불변 뼈대 — 레이아웃 골격 |
| | | `MUTABLE` | 가변 — IoT 값·`matrix_id` 스위칭 대상 |
| **가치** | `priority` | `ESSENTIAL` | 본질 정보 — 경고·핵심 수치 |
| | | `CONTEXTUAL` | 맥락 — 보조 라벨·단위 |
| | | `TEXTURE` | 시각 질감 — 장식·노이즈 |

**② MVP 컴포넌트 매핑**

> 기존 `Comp A/B/C`의 역할과 특성을 반영하여 의미 기반 이름을 부여했습니다.

| 컴포넌트 | 구명칭 | `depth` | `mutability` | `priority` | `matrix_id` (초기) | 비고 |
|---|---|---|---|---|---|---|
| **Anchor** | Comp A (Giant) | BG | IMMUTABLE | TEXTURE | BG-L | 15vw · opacity 5% · blur 40px · 구도 무게중심 |
| **Frame** | Comp B (Micro) | FG | IMMUTABLE | TEXTURE | (frame) | 6px monospace — **데모 전용** |
| **Sentinel** | Comp C (IoT Card) | FG | MUTABLE | ESSENTIAL | FG-R → FG-C (경고) | **min-w 300px** · sparkline(V1) · Entropy Brake |

> **네이밍 근거**:
> - **Anchor** — 15vw Giant 타이포그래피가 페이지의 시각적 닻(anchor) 역할을 함
> - **Frame** — 6px Micro 격자가 전체 화면의 프레임(frame)을 형성함
> - **Sentinel** — ESSENTIAL 등급으로 경고를 감시하고 최우선 가독성을 지키는 초소(sentinel) 역할

**③ 타이포그래피 프리셋**

| 프리셋 | `depth` | `mutability` | `priority` | 시각 규격 | 역할 |
|---|---|---|---|---|---|
| **Micro-Typography** | FG | IMMUTABLE | TEXTURE | ~6px monospace · blur 0 | 프레임 격자·노이즈 질감 (G1 극소) |
| **Giant-Typography** | BG | IMMUTABLE | TEXTURE | ~15vw · opacity ~5% | 구도 무게중심·여백 균형 (G1 극대) |

### 가드레일 5조 (코드 강제 · LLM은 제안만)

| # | 규칙 | 구현 |
|---|---|---|
| **G1** | **극단적 대비** — Giant·Micro만, 중간 크기 카드 면적 ≤20% | `guardrails/sizePolicy.ts` |
| **G2** | **OVR + Safe-Zone** — `void_ratio ≥ ovr_floor` 및 Sentinel **물리 최소 크기** — **충돌 시 Safe-Zone 우선** | `ovrPolicy.ts` · `readabilitySafeZone.ts` |
| **G3** | **Entropy Brake** — 동시 `matrix_id` 변경 MUTABLE ≤ **1** / tick | `entropyBrake.ts` |
| **G4** | **Matrix 점유** — 동일 `matrix_id` 겹침 시 z-index·인접 셀 분산 | `matrixOccupancy.ts` |
| **G5** | **진동 차단** — `circuitState !== 'closed'` → Vibration 계층 **전면 OFF** | `vibrationGate.ts` |

---

## 2. 3×3 Aesthetic Matrix 구조

### 2.1 Matrix ID — 9칸 SSOT

화면 전체를 **가로 3칸(L, C, R) × 세로 3개 층(BG, MID, FG)**으로 나눈 9개의 고유 주소 체계.

| 구분 | L (좌) | C (중) | R (우) |
|:---|:---|:---|:---|
| **FG (근경)** | FG-L | **FG-C (경고 격상)** | FG-R (기본 Sentinel) |
| **MID (중경)** | MID-L (기본 위치) | MID-C | MID-R |
| **BG (원경)** | BG-L (Anchor 타이포) | BG-C | BG-R |

**층(Depth)별 시각 속성**

| 층 | blur | opacity | z-index | 역할 |
|---|---|---|---|---|
| **FG** (근경) | 0px | 1.00 | 10 | 본질 정보 (ESSENTIAL) — 최고 선명도 |
| **MID** (중경) | 10px | 0.40 | 5 | 맥락·보조 정보 — 부드러운 흐림 |
| **BG** (원경) | 40px | 0.05 | 1 | 구도·질감 형성 — 배경 요소 |

**Matrix ID 상세 테이블**

| Matrix ID | Z | X | blur (px) | opacity | z-index | MVP 용도 |
|---|---|---|---|---|---|---|
| **BG-L** | BG | L | 40 | 0.05 | 1 | Anchor 타이포 |
| **BG-C** | BG | C | 40 | 0.05 | 1 | (예비) |
| **BG-R** | BG | R | 40 | 0.05 | 1 | (예비) |
| **MID-L** | MID | L | 10 | 0.40 | 5 | 경고 전 Sentinel 기본 위치 |
| **MID-C** | MID | C | 10 | 0.40 | 5 | (예비) |
| **MID-R** | MID | R | 10 | 0.40 | 5 | (예비) |
| **FG-L** | FG | L | 0 | 1.00 | 10 | (예비) |
| **FG-C** | FG | C | 0 | 1.00 | 10 | **경고 격상** 목표 |
| **FG-R** | FG | R | 0 | 1.00 | 10 | Sentinel (기본) |

**시맨틱 축 (AXON 연계)**

- **축(Axis)**: 장(Field, 위상) · 강도(Magnitude, 농담) · 시공간성(Temporal, 진동)
- **층(Layer)**: 신호(Signal, 발생) · 맥락(Context, 관계) · 투사(Projection, 미래)

---

### 2.2 상태 변수 SSOT

| 변수 | 타입 | 범위 | 설명 |
|---|---|---|---|
| `void_ratio` | int | 0–100 | 현재 공백률 — **≥ `ovr_floor`** (Safe-Zone 충돌 시 일시 하회 가능) |
| `ovr_floor` | int | — | 적정여백율 하한 — `resolveOvrFloor(bax_mode, viewport_band)` (런타임) |
| `bax_mode` | enum | §2.5 | BAX 운영 모드 — 사용자 선택 또는 이벤트 자동 전환 |
| `viewport_band` | enum | `xl` \| `md` \| `sm` | ResizeObserver 기준 밴드 |
| `canvas_scale` | float | 0.85–1.15 | VirtualCanvas 위상 스케일 — `--bax-canvas-scale` |
| `margin_ratio` | int | 0–100 | M2P — 여백 수축/이완 |
| `focus_blur` | int | 0–100 | FG 외 레이어 blur 강도 스케일 |
| `mid_blur_px` | int | 0–40 | MID 레이어 `backdrop-filter` px |
| `light_source_x` | int | 0–100 | 그림자 각도 X |
| `light_source_y` | int | 0–100 | 그림자 각도 Y |
| `hybrid_phase` | enum | `urgent` \| `fine_tune` | RuleGuard/AestheticTuner 2단계 반영 |
| `circuit_state` | enum | `closed` \| `open` \| `half_open` | NEXA `healthWatchdog` 연동 — G5 |

**CSS 전달**: `:root` CSS variables — `--bax-void-ratio`, `--bax-mid-blur`, …

---

### 2.3 MAE 엔진 데이터 흐름

```
[Peripheral]  슬라이더 | WebSocket | Web Serial
[UI]          bax_mode selector → useBaxStore
[Viewport]    ResizeObserver → viewport_band
       │
       ▼
[VirtualSensor]  mock tick
       │
       ├──(수동)──► BaxState + mode preset
       │
       └──(자동)──► hybridEvaluate(data)  [intelligent 모드]
                      ├── Phase 1 urgent:  RuleGuard  → matrix_id (즉시 0ms)
                      └── Phase 2 fine_tune: AestheticTuner → void/blur (지연 허용)
       ▼
[Pipeline]
  vibrationGate(circuit_state)          # G5
  → matrixOccupancy.resolve()           # G4
  → resolveOvrFloor + readabilitySafeZone  # G2
  → densityAdaptive
  → runGuardrails (G1–G5)
  → applyAestheticState + canvas_scale
       ▼
[VirtualCanvas]  MatrixStyles · 300ms transition
```

---

### 2.4 M2P 프로토콜 (MVP)

**Transport 우선순위**: ① 웹 슬라이더 (내장) → ② WebSocket `ws://localhost:*` → ③ Web Serial (Arduino)

**패킷 (JSON, 10–30 Hz 권장)**:

```json
{
  "v": 1,
  "source": "peripheral | sim-slider",
  "ts": 1710000000000,
  "margin_ratio": 42,
  "focus_blur": 18
}
```

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `v` | int | ✓ | 스키마 버전 |
| `source` | string | ✓ | 송신원 |
| `margin_ratio` | 0–100 | ✓ | User-Driven 호흡 |
| `focus_blur` | 0–100 | ✓ | blur 스케일 |

**지연 목표**: Peripheral → 화면 반영 **p95 ≤ 50ms**

---

### 2.5 BAX 운영 모드 (BaxOperationMode)

| `bax_mode` | UI 라벨 | 핵심 전략 | 기본 매개변수 (예시) | `ovr_floor` |
|---|---|---|---|---|
| `meditation` | **명상/여백** | 정보 최소화 · 호흡 극대화 | void 85–90 · focus_blur 높음 · mid_blur 20–40 | **85** |
| `dense_monitor` | **밀집/모니터링** | 다중 지표 동시 관찰 | void OVR 하한 · mid_blur 0–8 | **75** |
| `contextual` | **관계/맥락** | FG vs MID 대비 · priority 축 강조 | matrix_id 전환 허용 ↑ · MID opacity↑ | **78** |
| `intelligent` | **인텔리전트** | AestheticTuner가 상황별 제안 | MaeDecision 가변 · 실패 시 `dense_monitor` fallback | **75** (동적) |

**모드 전환 흐름**

```
[사용자]  DevController · 설정 UI
    → useBaxStore.setMode(bax_mode)

[NEXA 흡수 시]
    → userSettingsStore.baxOperationMode  (영속 preference)
    → useLayoutStore.baxMode (런타임)

[자동]  RuleGuard | sensor event
    예: temp ≥ critical → dense_monitor (또는 intelligent if Ollama on)
    예: alarm cleared 5min → meditation (선택)
```

---

### 2.6 반응형 — OVR · 밀도 적응 · VirtualCanvas 스케일

**원칙**: "시각적 75%"는 해상도·DPI·창 크기에 의존 — **고정 % 금지**, **OVR + 적응**으로 대응.

> sm(모바일)의 가독성은 **§2.6.2 밀도 적응** + **§2.6.4 Safe-Zone(픽셀 하한)**이 담당하며, 두 규칙이 충돌하면 **Safe-Zone > OVR %** 우선.

#### 2.6.1 `resolveOvrFloor(mode, viewport_band)`

| `viewport_band` | 조건 | OVR 보정 | 밀도 적응 |
|---|---|---|---|
| `xl` | ≥ 1280px | `mode.ovr_floor` 그대로 | Frame(Micro) 표시 |
| `md` | 768–1279px | **−2** (예: 75→73) | Frame opacity 50% |
| `sm` | < 768px | **−5** (예: 75→70, 하한 **65** 절대) | **Frame 숨김** · Anchor scale↓ · Safe-Zone 적용 |

**`OVR_ABSOLUTE_MIN = 65` 역할 명확화**

| 구분 | 설명 |
|---|---|
| **역할** | 어떤 모드·밴드에서도 `void_ratio`가 **65% 미만**으로 내려가지 않는 전역 미학 하한 |
| **아닌 것** | sm에서 "정보 표시 영역을 넓히는" 장치가 아님 — sm 여백 완화는 `VIEWPORT_DELTA −5`가 담당 |
| **sm 가독성 SSOT** | Sentinel **물리 min-width** (280px / 절대 240px) — §2.6.4 |

```ts
const VIEWPORT_DELTA = { xl: 0, md: -2, sm: -5 } as const
const OVR_ABSOLUTE_MIN = 65 // 미학 하한 — sm 좁음 해결책 아님 (§2.6.4)

function resolveOvrFloor(mode: BaxOperationMode, band: ViewportBand): number {
  const base = BAX_MODE_PRESETS[mode].ovr_floor
  return Math.max(OVR_ABSOLUTE_MIN, base + VIEWPORT_DELTA[band])
}
```

#### 2.6.2 밀도 적응형 알고리즘 (Density Adaptive)

`applyAestheticState` 직전 실행:

1. `ovr_floor = resolveOvrFloor(bax_mode, viewport_band)`
2. `void_ratio = clamp(proposed, ovr_floor, 100)` — Safe-Zone 충돌 시 `ovr_floor` 미달 허용
3. `sm` → `hideComponents(['Frame'])` · `md` → Frame `opacity: 0.5`
4. 정보 면적 > 가용 영역 30% → 비-MUTABLE MID 항목 blur+1 단계 (G1 유지)
5. `applySafeZone` — Sentinel **픽셀 하한** 강제 · OVR 목표 **일시 포기** 가능

#### 2.6.3 VirtualCanvas Topology 스케일링

| `viewport_band` | `canvas_scale` | `blur_scale` | 효과 |
|---|---|---|---|
| `xl` | 1.00 | 1.00 | 기준 호흡 깊이 |
| `md` | 0.95 | 0.90 | blur px 소폭 감소 → 가독성 |
| `sm` | 0.88 | 0.80 | padding·gap 축소 · FG 카드 full-width 옵션 |

#### 2.6.4 가독성 Safe-Zone — Sentinel 물리 하한 (G2 보강)

OVR(%) 단독으로는 Sentinel이 지나치게 작아질 수 있음 — 픽셀·rem 하한을 OVR clamp 이후에도 강제.

| 대상 | CSS / 규칙 | MVP SSOT | `sm` 보정 |
|---|---|---|---|
| **Sentinel** (ESSENTIAL) | `min-width` | **300px** | **280px** (절대 **240px**) |
| Sentinel | `min-height` | **120px** | 100px |
| Sentinel 본문 | `font-size` | **≥ 1.25rem** (주 수치) | 동일 |
| Anchor/Frame (TEXTURE) | — | Safe-Zone **미적용** — 먼저 축소·숨김 | — |

> **우선순위 (G2)**: Safe-Zone **> OVR % 체감** — Sentinel이 읽히지 않으면 `void_ratio` 목표를 일시 포기하고 gap·padding만 조정 (`ovrOverride` 감사 로그 optional).

---

### 2.7 진동 (Vibration) — 기술 SSOT

진동은 blur/light 외 **시간축 피드백** — UI가 "살아 breathe"한다는 **저부하 시각 채널**.

| 계층 | MVP 구현 | `priority` | Circuit Open |
|---|---|---|---|
| **V0 정적** | `focus_blur` · `light_*` · shadow | — | 유지 (Safety 가독) |
| **V1 Sparkline** | Sentinel 하단 시간 기반 미니 라인 | CONTEXTUAL | **OFF** |
| **V2 Micro-motion** | opacity pulse · 1px border breathe (CSS/rAF) | TEXTURE | **OFF** |
| **V3 Audio** (후속) | 청각 레이어 | — | OFF |

**G5 — 진동 차단 (NEXA 연동)**

```
useConnectionStore.circuitState === 'open'
  OR healthWatchdog.mainFps p50 < 24 (3s)
    → vibrationGate.close()
         · sparkline unmount / canvas freeze
         · micro-animation class removed
         · Sentinel 숫자·텍스트만 표시
    → Safety·matrix_id(RuleGuard Phase 1) 경로는 유지
```

---

### 2.8 Matrix 점유 · 중첩 (Stacking) 규칙

동일 `matrix_id`를 여러 컴포넌트가 지목하면 `matrixOccupancy.ts` 파이프라인을 거친다.

**① 동일 셀 내 z-index (stack order)**

| 순위 | `priority` | `mutability` | 동작 |
|---|---|---|---|
| 1 | ESSENTIAL | MUTABLE | 최상단 · 클릭·포커스 |
| 2 | CONTEXTUAL | * | 중간 |
| 3 | TEXTURE | IMMUTABLE | 최하단 · 장식 |

동일 priority → `componentId` lexicographic (결정적 tie-break)

**② 인접 셀 자동 분산 (Adjacent Spillover)**

셀 점유 ≥ 2 MUTABLE/ESSENTIAL 및 면적 합 > 셀 80%:

```
1. 인접 후보: 같은 Z-depth 행 · Manhattan distance 1
2. 빈 셀 우선 · ESSENTIAL은 FG 계열 유지
3. spillover 1건/tick (G3 Entropy와 합치)
4. 후보 없음 → z-index stack (①) + Sentinel min Safe-Zone
```

---

### 2.9 지능형 하이브리드 반영 (RuleGuard + AestheticTuner · 시차 극복)

**문제**: AestheticTuner(Ollama) **수백 ms~수 s** 지연 동안 Safety UI가 늦어짐.
**해결**: **2단계 반영** — 주소는 RuleGuard **즉시**, 미학 미세조정은 AestheticTuner **후속**.

```
[센서] temp ≥ threshold (예: 80°C)
    │
    ├─ Phase 1 · urgent (0ms, RuleGuard) ─────────────────────────
    │     matrix_id  → FG-C
    │     focus_blur → 0
    │     target     → Sentinel
    │     applyAestheticState({ phase: 'urgent' })  ≤300ms
    │
    └─ Phase 2 · fine_tune (AestheticTuner 응답, intelligent 모드) ─
          matrix_id  → 변경 금지 (Phase 1 lock, TTL 30s 또는 alarm clear)
          void_ratio · mid_blur_px · focus_blur · light_* → AI 제안
          applyAestheticState({ phase: 'fine_tune' })  ≤300ms ease
```

| Phase | 주체 | 허용 필드 | 금지 |
|---|---|---|---|
| **`urgent`** | RuleGuard | `matrix_id`, `target_component`, `focus_blur` (0) | void 대폭 변경 (±5 이내만) |
| **`fine_tune`** | AestheticTuner (+ guardrails) | `void_ratio`, `mid_blur_px`, `focus_blur`, `light_*` | **`matrix_id` 덮어쓰기** |

---

## 3. MVP 화면 · 컴포넌트

단일 페이지. **이동·라우팅 없음.**

| ID | 이름 | 구명칭 | Matrix (초기) | 속성 | MVP 내용 |
|---|---|---|---|---|---|
| **Comp A** | **Anchor** | Giant | BG-L | IMMUTABLE · TEXTURE | 15vw, opacity 5%, blur 40px |
| **Comp B** | **Frame** | Micro | FG (frame) | IMMUTABLE · TEXTURE | 6px monospace — **데모 전용** |
| **Comp C** | **Sentinel** | IoT Card | FG-R → FG-C (경고) | MUTABLE · ESSENTIAL | `72°C` · min-w 300px · sparkline(V1) |

**Dev Controller** (우하단): BAX 모드 선택 + 슬라이더 4종 + `경고 발생` + `가상 센서 tick` + Ollama on/off + viewport band 표시.

**수동 제어 슬라이더 (M2P Peripheral 대체)**

| ID | 명칭 | 변수 | 효과 |
|---|---|---|---|
| **S0** | **모드 셀렉터** | `bax_mode` | §2.5 preset 일괄 적용 |
| **S1** | **보이드 레이트** | `void_ratio` | padding scale — ≥ OVR 로 clamp |
| **S2** | **미드 포커스** | `mid_blur_px` | MID `backdrop-filter` |
| **S3** | **라이트 앵글** | `light_source_x/y` | Anchor `box-shadow` 각도 |

---

## 4. 기능 요구사항 (FR)

| ID | 요구사항 | Acceptance Criteria |
|---|---|---|
| **FR-01** | 3×3 Matrix 레이어 엔진 | 9칸 표 CSS 적용 · Sentinel **FG-R**에서 blur 0 · opacity 1 유지 |
| **FR-02** | 호흡형 blur/void | `meditation` → void 85–90 · OVR clamp · MID blur↑ · **≤300ms** |
| **FR-03** | 주소 스위칭 | **Phase 1** 즉시 **MID-L → FG-C** · `focus_blur=0` · **≤300ms** |
| **FR-04** | 가드레일 G1–G5 | OVR · Safe-Zone 300px · Matrix 점유 · Entropy · Vibration Gate |
| **FR-05** | M2P 수신 | 슬라이더 = 패킷과 동일 효과 · WS 연결 시 외부 패킷 ingest |
| **FR-06** | 하이브리드 RuleGuard+AestheticTuner | Phase 1 즉시 · Phase 2 **void/blur만** · `matrix_id` lock |
| **FR-07** | Fallback | AestheticTuner fail/timeout → Phase 1만 유지 · RuleGuard SSOT |
| **FR-08** | BAX 운영 모드 | 4모드 전환 · preset · 온도 급증 → `dense_monitor` / hybrid Phase 1 |
| **FR-09** | 반응형 OVR/Topology | ResizeObserver · OVR·scale · Safe-Zone sm 280px · OVR<65% 허용(ovrOverride) |
| **FR-10** | Matrix 점유/분산 | 동일 `matrix_id` 2+ → z-index · 인접 셀 spillover · §2.8 |
| **FR-11** | 진동 + Circuit | sparkline/micro on · Circuit OPEN → V1/V2 OFF · Sentinel 텍스트 유지 |

### 4.1 비기능 요구사항 (NFR)

| ID | 항목 | 기준 |
|---|---|---|
| **NFR-01** | FPS | 전환 중 p50 ≥ **24** |
| **NFR-02** | AestheticTuner | timeout **3s** → fallback |
| **NFR-03** | 오프라인 | AestheticTuner 없이 **수동+규칙+모드 preset** 100% 동작 |
| **NFR-04** | 반응형 | band 변경 · Sentinel **≥ Safe-Zone min-width** · OVR ≥65 또는 ovrOverride |
| **NFR-05** | Circuit | OPEN 시 sparkline/micro **0 frame** 추가 · FPS 회복 후 재개 |

---

## 5. AestheticTuner 연동 (Phase 2 · Fine-tuning)

### 5.1 역할 분담

| 계층 | Phase | 책임 |
|---|---|---|
| **RuleGuard** | **1 · urgent** | 임계 초과 **즉시** `matrix_id` → FG-C · `focus_blur=0` |
| **AestheticTuner** (Ollama) | **2 · fine_tune** | `void_ratio` · `mid_blur_px` · `focus_blur` · `light_*` **미세 조정** |
| **guardrails** | both | G1–G5 · Phase 2에서 `matrix_id` strip |
| **matrixOccupancy** | 1·2 | 배치 전 셀 점유·spillover |

> `intelligent` 외 모드: AestheticTuner **skip** · Phase 1만 rule 또는 수동.

### 5.2 API

```
POST http://localhost:11434/api/generate
format: "json" · model: llama3 (또는 경량 로컬 모델)
```

### 5.3 출력 스키마 (MaeDecision)

**Phase 2 (AestheticTuner)**:

```json
{
  "phase": "fine_tune",
  "target_component": "Sentinel",
  "void_ratio": 78,
  "focus_blur": 8,
  "mid_blur_px": 4
}
```

**Phase 1 (RuleGuard)**:

```json
{
  "phase": "urgent",
  "target_component": "Sentinel",
  "matrix_id": "FG-C",
  "focus_blur": 0
}
```

**AestheticTuner Prompt (fine_tune)**:

```
Phase fine_tune ONLY. matrix_id LOCKED: {locked_matrix_id}.
Return JSON: { phase, void_ratio, focus_blur, mid_blur_px? }.
void_ratio >= OVR floor. No matrix_id. No prose.
Input: {sensor} · current void/blur · mode: {bax_mode}
```

### 5.4 시나리오 예

| 입력 | Phase 1 (RuleGuard, 0ms) | Phase 2 (AestheticTuner, 지연) |
|---|---|---|
| 72°C normal | FG-R · blur 유지 | void 78 · mid_blur 6 (선택) |
| 85°C (≥80) | **FG-C · blur 0** | void 75–80 · focus_blur 0–10 |

---

## 6. 기술 스택 · 저장소

| 항목 | MVP 선택 | 비고 |
|---|---|---|
| App | `apps/bax-demo` (Vite + React) | NEXA monorepo 내 독립 |
| Style | Tailwind + CSS variables | semantic은 NEXA `--status-*` 참조만 |
| Motion | Framer Motion **또는** GSAP | 300ms transition SSOT |
| AI | Ollama local (AestheticTuner) | 클라우드 API **금지** (MVP) |
| HW (선택) | Web Serial API | Arduino pot → M2P packet |

**저장소 트리**:

```
apps/bax-demo/
├── src/
│   ├── canvas/VirtualCanvas.tsx
│   ├── components/
│   │   ├── Anchor.tsx          # Comp A — Giant 타이포
│   │   ├── Frame.tsx           # Comp B — Micro 격자
│   │   ├── Sentinel.tsx        # Comp C — IoT ESSENTIAL
│   │   └── SentinelSparkline.tsx  # V1 vibration
│   ├── engine/                 # MAE (Matrix Aesthetic Engine)
│   │   ├── matrixStyles.ts
│   │   ├── applyAestheticState.ts
│   │   ├── baxModePresets.ts
│   │   ├── guardrails/
│   │   │   ├── ovrPolicy.ts
│   │   │   ├── readabilitySafeZone.ts  # Sentinel min 300px
│   │   │   ├── sizePolicy.ts
│   │   │   ├── entropyBrake.ts
│   │   │   └── vibrationGate.ts        # G5
│   │   ├── matrixOccupancy.ts          # G4
│   │   ├── hybridEvaluate.ts           # Phase 1/2
│   │   ├── densityAdaptive.ts
│   │   ├── viewportScale.ts
│   │   └── ruleEngine.ts               # RuleGuard
│   ├── store/useBaxStore.ts
│   ├── m2p/{wsClient.ts, serialClient.ts, types.ts}
│   ├── ollama/client.ts                # AestheticTuner
│   └── dev/DevController.tsx           # 모드 선택 + 슬라이더 S0–S3
└── package.json
```

**NEXA 흡수 시 store 매핑**

| bax-demo | NEXA V2.1 |
|---|---|
| `useBaxStore.baxMode` | `userSettingsStore.baxOperationMode` (persist) |
| `useBaxStore.*` (runtime) | `useLayoutStore.baxMode` · `baxVoidRatio` (선택) |

---

## 7. NEXA OS 정합 (참고)

| BAX MVP | NEXA V2.1 | 관계 |
|---|---|---|
| VirtualCanvas 3×3 | `nexage` content + `NexaDashboardRenderer` | **후속** — MVP 검증 후 흡수 여부 결정 |
| void_ratio / OVR | `TELEMETRY_CIRCUIT_OPEN` 텍스트 모드 | Safety semantic 우선 · OVR는 표시 밀도만 |
| **Vibration G5** | `healthWatchdog` · `circuitState` | 진동 최우선 OFF · Safety/matrix 유지 |
| `bax_mode` | `userSettingsStore` · `useLayoutStore` | nexage 흡수 시 설정 UI 연동 |
| AestheticTuner JSON | `nexia` + `packages/shared` Zod | 흡수 시 MaeDecision → shared schema |
| M2P WS | 채널 B Worker WS | **별도** — 미학 패킷 ≠ Telemetry flood |

---

## 8. 현실성 · 리스크

| 항목 | 평가 | 메모 |
|---|---|---|
| 3×3 + CSS MVP | 🟢 높음 | 1–2주 PoC |
| OVR · 모드 · 반응형 | 🟢 높음 | §2.5–2.6 — 고정 75% 폐기 |
| RuleGuard+AestheticTuner 2단계 | 🟢 높음 | Phase 1 즉시 + Phase 2 fine-tune |
| Matrix spillover | 🟢 높음 | §2.8 — MVP Sentinel 포함 3개로 검증 |
| Safe-Zone 300px | 🟢 높음 | OVR와 분리 · sm ovrOverride 명시 |
| Ollama matrix 결정 | 🟡 제거 | matrix는 Phase 1 RuleGuard 전용 |
| 6px Frame 실운영 | 🔴 낮음 | **데모 전용** 명시 |
| M2P 하드웨어 | 🔴 MVP 이후 | 슬라이더/Serial 먼저 |

**Go / No-Go (MVP 완료 정의)**:

- [ ] FR-01–11 PASS (하이브리드·Matrix·Vibration·Safe-Zone)
- [ ] NFR-01 PASS (전환 중 FPS)
- [ ] AestheticTuner off 시 FR-07 fallback PASS
- [ ] §8 리뷰 후 nexage 흡수 여부 결정

---

## 부록 A. MatrixStyles (의사코드)

```ts
export const MatrixStyles: Record<MatrixId, CssLayer> = {
  'BG-L': { blurPx: 40, opacity: 0.05, zIndex: 1 },  // Anchor
  'BG-C': { blurPx: 40, opacity: 0.05, zIndex: 1 },
  'BG-R': { blurPx: 40, opacity: 0.05, zIndex: 1 },
  'MID-L': { blurPx: 10, opacity: 0.4,  zIndex: 5 },
  'MID-C': { blurPx: 10, opacity: 0.4,  zIndex: 5 },
  'MID-R': { blurPx: 10, opacity: 0.4,  zIndex: 5 },
  'FG-L':  { blurPx: 0,  opacity: 1,    zIndex: 10 },
  'FG-C':  { blurPx: 0,  opacity: 1,    zIndex: 10 }, // 경고 격상
  'FG-R':  { blurPx: 0,  opacity: 1,    zIndex: 10 }, // Sentinel 기본
}
```

## 부록 B. applyAestheticState (의사코드)

```ts
function applyAestheticState(decision: MaeDecision, ctx: MaeContext) {
  if (!vibrationGate(decision, ctx.circuit_state)) {
    decision = stripVibrationLayers(decision) // G5
  }
  if (decision.phase === 'fine_tune') {
    decision = stripMatrixId(decision, ctx.lockedMatrix) // §2.9
  }
  const placed  = matrixOccupancy.resolve(decision, ctx)    // G4
  const floor   = resolveOvrFloor(ctx.bax_mode, ctx.viewport_band)
  const adapted = densityAdaptive(placed, ctx)
  const safe    = runGuardrails(adapted, { ovr_floor: floor })
  const layout  = applySafeZone(safe, ctx.viewport_band)    // G2 — may set ovrOverride
  setCssVars(layout.void_ratio, layout.focus_blur, ctx.canvas_scale)
  moveComponent(layout.target_component, layout.matrix_id)
  animate({ durationMs: 300, ease: 'easeOut' })
}
```

## 부록 C. hybridEvaluate (의사코드)

```ts
async function hybridEvaluate(sensor: SensorReading, ctx: MaeContext) {
  if (sensor.value >= THRESHOLD) {
    const urgent = ruleEngine.urgent(sensor)  // Phase 1 — RuleGuard
    ctx.lockedMatrix = urgent.matrix_id
    ctx.lockedUntil  = Date.now() + 30_000
    applyAestheticState({ ...urgent, phase: 'urgent' }, ctx)
  }
  if (ctx.bax_mode !== 'intelligent') return

  const fine = await evaluateWithOllama(sensor, ctx)  // Phase 2 — AestheticTuner
  if (Date.now() < ctx.lockedUntil) {
    delete fine.matrix_id
  }
  applyAestheticState({ ...fine, phase: 'fine_tune' }, ctx)
}
```

## 부록 D. AestheticTuner fine_tune (의사코드)

```ts
async function evaluateWithOllama(
  sensor: SensorReading,
  ctx: MaeContext
): Promise<MaeDecision> {
  try {
    const res    = await fetch('http://localhost:11434/api/generate', { /* … */ })
    const { response } = await res.json()
    const parsed = JSON.parse(response) as MaeDecision
    parsed.phase = 'fine_tune'
    delete parsed.matrix_id             // matrix_id는 RuleGuard 전용
    return runGuardrails(parsed, ctx)
  } catch {
    return { phase: 'fine_tune', ...ruleEngine.voidPreset(sensor) }  // fallback
  }
}
```

## 부록 E. 폐기·보류 (Out of doc scope)

- 투자용 대체 문서명 (Orchid Space, Confidence of Void 등) — 브랜딩 시 별도 백서
- 오디오 vibration 레이어 · 다중 IoT · nexage 직접 embed — MVP 이후

---

## 변경 이력

| 버전 | 날짜 | 내용 |
|---|---|---|
| 0.1 | — | 기획 메모 통합본 |
| 0.2 | 2026-05 | B 스타일 MVP SSOT 재구성 — 중복 제거 · FR/Matrix/M2P/Ollama 통합 |
| 0.3 | 2026-05 | OVR · BAX 운영 모드 4종 · 반응형 밀도 적응 · VirtualCanvas 스케일 |
| 0.4 | 2026-05 | Rule+AI 2단계 · Vibration/G5 · Matrix 점유 · Safe-Zone 300px · ovrOverride |
| 0.5 | 2026-05 | MAE 엔진 분리 — MaeDecision · engine/ · v0.5 중간 명명 |
| 0.6 | 2026-05 | BAX UX 브랜드 확정 — BAX(경험) / MAE(엔진) / M2P(의지) 3계층 · bax_mode |
| **0.6r** | **2026-05** | **네이밍 정비** — Comp A→Anchor · Comp B→Frame · Comp C→Sentinel · ruleEngine→RuleGuard · Ollama레이어→AestheticTuner · S0–S3 슬라이더 명명 · NIXIE Agent 정의 추가 |

---

*BAX MVP 개발 SSOT v0.6r — AXON 시스템 내 미학 UX 레이어*
