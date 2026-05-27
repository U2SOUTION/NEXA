# BAX_문제 해소.md

> **통합됨**: 내용은 [`BAX_미학적_인터페이스_UX_아키텍처_v0.9.md`](./BAX_미학적_인터페이스_UX_아키텍처_v0.9.md) 로 흡수. 본 파일은 참고용 아카이브.

# BAX (Breathing AI Experience)
**미학적 인터페이스 · 사용자경험 아키텍처 정의서**
MVP 개발 SSOT — v0.8

> **문서 유형**: B — MVP 개발 SSOT
> **상태**: Draft · **관련**: NEXA OS V2.1 · **실험 앱**: `apps/bax-demo`
>
> **v0.8 변경 요약**:
> `depth`·`urgency` 역할 분리 명문화 (C1) · `void_ratio` 단일 제어 체계 확립, `margin_ratio` 폐기 (C2) ·
> `Frame` 레이어 선언 수정 — `OVERLAY` 타입 도입 (C3) · `RuleGuard` 모드 무관 Safety 경로 명시 (C4) ·
> `MaeContext` 타입 정의 (G1) · `AlarmState` 시스템 정의 (G2) · `focus_blur` 변환식 명문화 (G3) ·
> `DefaultLayoutPolicy` Frame 배치 완성 (G4) · urgency 상태 머신 추가 (R1) ·
> `CONTEXTUAL` 검증 시나리오 추가 (R2) · Grid overflow 전략 정의 (R3) · NIXIE Agent 연결점 명시 (R4)

---

## 약어 및 용어 정의

| 약어 | 풀네임 | 설명 |
|---|---|---|
| **BAX** | Breathing AI Experience | 인간의 의지와 AI 호흡이 결합된 전체 사용자 경험 브랜드 |
| **MAE** | Matrix Aesthetic Engine | 의미 속성을 해석해 Grid 구조·배치·시각값을 동적으로 결정하는 UI 엔진 |
| **M2P** | Matrix-to-Peripheral | 디스플레이 ↔ 조작 장치(Peripheral) 미학 패킷 프로토콜 |
| **OVR** | Optimal Void Ratio (적정여백율) | 모드·뷰포트·가드레일이 정하는 `void_ratio` 하한 |
| **VirtualCanvas** | — | 픽셀이 아닌 위상·농담·진동으로 정의한 BAX 단일 페이지 캔버스 |
| **LayoutPolicy** | — | 도메인별 교체 가능한 MAE의 배치 전략 인터페이스 |
| **DepthProfile** | — | `depth` 의미 속성을 실제 z-index·blur·opacity로 변환하는 MAE 내부 함수 |
| **AlarmState** | — | RuleGuard가 관리하는 경보 상태 머신. urgency lock의 유일한 소유자 |
| **NIXIE Agent** | — | AI 캐릭터 기반 센서 융합 입력 에이전트. M2P 채널을 통해 MAE에 연결 |
| **RuleGuard** | Rule-based Guard Engine | Phase 1 즉각 판단 엔진. 모드 무관 Safety 경로 |
| **AestheticTuner** | AI Aesthetic Fine-tuner | Phase 2 Ollama 기반 미세조정 레이어. `intelligent` 모드 전용 |
| **AXON** | Adaptive Cross-domain Ontology Network | 상위 우주 의미 소통 시스템 |

---

## 핵심 명제

> _여백은 자신감이다._

IoT 관제에서 정보 과부하를 **여백·깊이·선명도**로 통제한다.
BAX는 운영자 **의지**(M2P)와 **AI 호흡**(RuleGuard + AestheticTuner)이 만나는 UX 브랜드이며,
MAE가 의미를 해석하여 배치와 시각값을 결정한다.

---

## 아키텍처 개요

### 시스템 계층 구조

```
BAX  Breathing AI Experience
 ├── M2P  Matrix-to-Peripheral      ← 인간 의지 입력 (슬라이더·Serial·WS·NIXIE)
 └── MAE  Matrix Aesthetic Engine   ← 의미 해석 → Grid 구성 → 시각값 결정
       ├── RuleGuard                 ← Phase 1: Safety 즉각 판단 (모드 무관)
       ├── AestheticTuner           ← Phase 2: Ollama 미세조정 (intelligent 전용)
       ├── LayoutPolicy             ← 도메인별 교체 가능한 배치 전략
       └── DepthProfile             ← depth 의미 → z-index·blur·opacity 변환
```

### 데이터 흐름

```
┌──────────────────────────────────────────────────────────┐
│  Input Layer                                             │
│  M2P 슬라이더 · WebSocket · Web Serial · NIXIE Agent     │
└───────────────────────┬──────────────────────────────────┘
                        ▼
┌──────────────────────────────────────────────────────────┐
│  MAE Pipeline                                            │
│                                                          │
│  [모든 모드] RuleGuard — 임계 초과 감지 즉시 실행        │
│      → AlarmState 갱신 → urgency 결정                    │
│                                                          │
│  [intelligent 전용] AestheticTuner — void/blur 미세조정  │
│                                                          │
│  LayoutPolicy.resolve(components, ctx)                   │
│      → Grid 구성·배치 결정                               │
│  DepthProfile.resolve(depth, urgency, mode)              │
│      → blurPx · opacity · z-index 결정                  │
└───────────────────────┬──────────────────────────────────┘
                        ▼
┌──────────────────────────────────────────────────────────┐
│  Guardrail Layer  G1–G5                                  │
│  OVR clamp · Safe-Zone · Entropy · Occupancy · Vibration │
└───────────────────────┬──────────────────────────────────┘
                        ▼
┌──────────────────────────────────────────────────────────┐
│  VirtualCanvas — 동적 CSS Grid · 300ms transition        │
└──────────────────────────────────────────────────────────┘
```

---

## MVP 범위

**검증 질문**: 컴포넌트가 의미 속성만 선언하면 MAE가 Grid·배치·시각값을 결정하여 VirtualCanvas가 ≤300ms easing으로 호흡(수축/이완)하는가?

| In scope (MVP) | Out of scope (MVP) |
|---|---|
| 단일 SPA · 컴포넌트 3종 (Anchor·Frame·Sentinel) | 다페이지 · 전역 domainLayoutRegistry |
| BAX 운영 모드 4종 + 수동 전환 | nexage 전역 기본값 강제 |
| OVR · 뷰포트 밀도 적응 · LayoutPolicy 1종 | 복수 LayoutPolicy 동시 운용 |
| 웹 슬라이더 = Peripheral 대체 · NIXIE Agent 가상 시뮬 | 전용 M2P 하드웨어 · 실물 NIXIE |
| 가상 센서 1종 + RuleGuard→AestheticTuner 2단계 | 다중 IoT · SSE · Grade3 제어 |
| Sparkline (V1 진동) · Circuit Gate | 오디오 vibration (V3) |
| CSS Grid (동적) · `backdrop-filter` · Framer/GSAP | WCAG 실운영 인증 |

---

## 1. 설계 원칙

### 핵심 3원소

| 원소 | SSOT 변수 | MVP 역할 |
|---|---|---|
| **위상 (Topology)** | `layout` (MAE 결정) | 컴포넌트 배치·Grid 구성·z-index |
| **농담 (Density)** | `void_ratio` · OVR | 모드·뷰포트별 여백 하한 |
| **진동 (Vibration)** | Sparkline · micro-motion · (후속) audio | 시각적 맥박 — Circuit Open 시 최우선 차단 |

### AXON 원칙 3 정렬 — 세포와 두뇌의 분리

> 컴포넌트(세포)는 MAE(두뇌)를 몰라야 한다.
> 컴포넌트는 자신의 의미 속성만 선언하고, 배치와 시각 판단은 전적으로 MAE가 담당한다.

```
컴포넌트 (세포)  →  의미 속성만 선언  (위치·blur·opacity를 모름)
MAE (두뇌)      →  LayoutPolicy + DepthProfile 실행 → 모든 시각값 결정
```

---

### 1.1 컴포넌트 의미 속성 체계

컴포넌트는 아래 속성만 선언한다. 위치·크기·blur 수치는 **선언하지 않는다.**

#### ① depth — 레이어 계층 의미 (불변 선언)

`depth`는 컴포넌트가 속하는 시각 계층의 의미다. 운영 중 변경되지 않는다.
DepthProfile은 `depth`를 기준으로 blur·opacity의 **기본값**을 결정한다.

| 값 | 의미 | blur 기본 방향 | opacity 기본 방향 |
|---|---|---|---|
| `FG` | 근경 — 선명함·전면·가독 핵심 | 0 고정 | 1.0 고정 |
| `MID` | 중경 — 맥락·보조 정보 | 모드에 따라 가변 | 모드에 따라 가변 |
| `BG` | 원경 — 구도·질감·배경 | 항상 높음 | 항상 낮음 |

> `depth: FG`는 blur가 항상 0임을 보장한다. urgency가 NONE이어도 FG 컴포넌트는 선명하다.
> urgency는 FG 내에서 z-index 우선순위와 LayoutPolicy 배치 결정에만 영향을 준다.

#### ② urgency — 현재 상태의 긴박도 (가변 선언)

`urgency`는 컴포넌트가 현재 처한 상태의 긴박도다. 이벤트에 따라 변한다.
DepthProfile은 `urgency`를 받아 **z-index**를 조정한다. blur·opacity는 `depth`가 결정한다.
LayoutPolicy는 `urgency`를 받아 **배치 우선순위**를 조정한다.

| 값 | 의미 | DepthProfile 영향 | LayoutPolicy 영향 |
|---|---|---|---|
| `CRITICAL` | 즉각 최우선 — Safety 관련 | z-index 최상위 boost | 최대 면적 셀 우선 확보 |
| `HIGH` | 높은 주의 — 경고 발생 | z-index 상위 | 현재 셀 유지·확장 시도 |
| `NORMAL` | 일반 동작 상태 | z-index 기본 | 기본 배치 |
| `NONE` | 배경성 — 정보 없음 | z-index 최하위 | 최소 공간 |

> **depth와 urgency의 역할 경계**:
> - blur·opacity → `depth`가 결정 (레이어 계층의 고유 특성)
> - z-index → `depth` 기본값 + `urgency` 가중치로 결정
> - Grid 배치 → `urgency`와 `priority`가 결정 (LayoutPolicy)

#### ③ priority — 정보 가치 등급 (불변 선언)

`priority`는 컴포넌트가 담은 정보의 의미적 중요도다. 운영 중 변경되지 않는다.
LayoutPolicy가 Grid 공간 할당 비율을 결정할 때 주로 사용한다.

| 값 | 의미 | 공간 할당 | Safe-Zone |
|---|---|---|---|
| `ESSENTIAL` | 본질 정보 — 경고·핵심 수치 | 우선 확보 | 적용 (minWidth 강제) |
| `CONTEXTUAL` | 맥락 — 보조 라벨·Sparkline | 중간 | 미적용 |
| `TEXTURE` | 시각 질감 — 장식·노이즈 | 잔여 공간 · 먼저 축소 | 미적용 |

#### ④ mutability — 재배치 가능 여부 (불변 선언)

| 값 | 의미 |
|---|---|
| `IMMUTABLE` | LayoutPolicy가 배치를 변경하지 않음 |
| `MUTABLE` | urgency·bax_mode 변화 시 재배치 가능 |

#### ⑤ layer — 렌더링 레이어 타입 (불변 선언, v0.8 신규)

`layer`는 컴포넌트가 VirtualCanvas에서 어떤 방식으로 렌더링되는지를 선언한다.
이전 버전에서 Frame(`TEXTURE·FG`)이 Sentinel(`ESSENTIAL·FG`)과 같은 레이어에서 경쟁한 문제(C3)를 해소한다.

| 값 | 의미 | Grid 참여 | 예시 |
|---|---|---|---|
| `BLOCK` | 일반 Grid 셀 참여 | 예 | Anchor, Sentinel |
| `OVERLAY` | Grid 위에 절대 위치 오버레이 — Grid 공간 미점유 | 아니오 | Frame (6px 격자) |

> `layer: OVERLAY` 컴포넌트는 LayoutPolicy의 배치 결정에서 제외된다.
> VirtualCanvas가 Grid 렌더링 후 `position: absolute`로 독립 합성한다.
> G1(면적 규칙)·G4(점유 규칙) 대상에서 제외된다.

#### ⑥ minWidth — Safe-Zone 물리 하한 (선택)

Safe-Zone 보장이 필요한 `ESSENTIAL` 컴포넌트만 선언한다.
위치 힌트가 아니라 LayoutPolicy가 Grid track을 역산할 때 사용하는 하한값이다.

#### MVP 컴포넌트 의미 속성 선언

| 컴포넌트 | `priority` | `urgency` (초기) | `depth` | `mutability` | `layer` | `minWidth` |
|---|---|---|---|---|---|---|
| **Anchor** | TEXTURE | NONE | BG | IMMUTABLE | BLOCK | — |
| **Frame** | TEXTURE | NONE | FG | IMMUTABLE | **OVERLAY** | — |
| **Sentinel** | ESSENTIAL | NORMAL | FG | MUTABLE | BLOCK | 300px |
| **Sparkline** | CONTEXTUAL | — | FG | MUTABLE | OVERLAY | — |

> Frame이 `layer: OVERLAY`로 분리되어 Sentinel과 Grid 레이어 경쟁이 없어진다.
> Sparkline은 Sentinel 내부에 합성되는 OVERLAY이므로 독립 LayoutPolicy 대상이 아니다.

---

### 1.2 가드레일 5조

코드 강제 — LLM은 제안만.

| # | 규칙 | 구현 파일 |
|---|---|---|
| **G1** | **극단적 대비** — `layer: BLOCK`인 TEXTURE 컴포넌트 면적 ≤20%. ESSENTIAL 우선 확보. OVERLAY는 면적 계산 제외 | `guardrails/sizePolicy.ts` |
| **G2** | **OVR + Safe-Zone** — `void_ratio ≥ ovr_floor` 및 ESSENTIAL `minWidth` 강제. 충돌 시 Safe-Zone 우선 (`ovrOverride`). LayoutPolicy가 `minWidth`를 받아 Grid track 역산 | `ovrPolicy.ts` · `readabilitySafeZone.ts` |
| **G3** | **Entropy Brake** — 동시 Grid 재배치 MUTABLE ≤ 1 / tick | `entropyBrake.ts` |
| **G4** | **Occupancy** — `layer: BLOCK` 컴포넌트 간 동일 셀 다중 점유 시 z-index 정렬·인접 셀 분산. OVERLAY는 제외 | `layoutOccupancy.ts` |
| **G5** | **진동 차단** — `circuitState !== 'closed'` → Vibration 전면 OFF. Safety·RuleGuard 경로는 유지 | `vibrationGate.ts` |

---

## 2. MAE — 의미 기반 자유 배치 엔진

### 2.1 MaeContext — 런타임 컨텍스트 (v0.8 신규 정의)

MAE의 모든 함수가 공유하는 런타임 상태 컨텍스트. 단일 객체로 전달한다.

```ts
interface MaeContext {
  // 컴포넌트 레지스트리
  components:        ComponentDeclaration[]

  // 운영 상태
  bax_mode:          BaxOperationMode
  viewport_band:     'xl' | 'md' | 'sm'
  circuit_state:     'closed' | 'open' | 'half_open'

  // 여백 상태
  void_ratio:        number           // 0–100, 현재 공백률
  focus_blur_scale:  number           // 0–1, DepthProfile 스케일러

  // 조명
  light_source_x:    number           // 0–100
  light_source_y:    number           // 0–100

  // 정책 인스턴스
  layoutPolicy:      LayoutPolicy
  depthProfile:      DepthProfile

  // 알람 상태 (RuleGuard 소유)
  alarmState:        AlarmState

  // 하이브리드 상태
  hybrid_phase:      'urgent' | 'fine_tune' | 'idle'

  // 캔버스
  canvas_scale:      number           // 0.85–1.15
  active_layout_policy: string        // LayoutPolicy 식별자
}
```

---

### 2.2 AlarmState — 경보 상태 머신 (v0.8 신규 정의)

`AlarmState`는 RuleGuard가 단독으로 소유·관리하는 urgency lock 시스템이다.
AestheticTuner는 `AlarmState`를 읽을 수 있지만 쓸 수 없다.

#### 상태 정의

```ts
type AlarmLevel = 'NONE' | 'HIGH' | 'CRITICAL'

interface AlarmState {
  level:        AlarmLevel        // 현재 경보 수준
  component_id: string | null     // 경보 대상 컴포넌트
  raised_at:    number | null     // 경보 발생 타임스탬프 (ms)
  source:       string | null     // 경보 발생 센서/조건
  cleared_by:   'auto' | 'operator' | null  // 해제 주체
}
```

#### urgency 상태 전이도

```
                    임계 초과 감지
        ┌───────────────────────────────────┐
        ▼                                   │
    [NORMAL]                                │
        │  RuleGuard: 임계 초과 → CRITICAL   │
        ▼                                   │
    [CRITICAL] ──── TTL 30s 자동 ──────► [HIGH]
        │                                   │
        │  조건 중 하나 충족:               │  5분 경과 OR
        │  · 센서값 정상 복귀               │  운영자 확인
        │  · 운영자 명시적 해제             │
        │  · TTL 30s → HIGH → 5분 → NORMAL │
        ▼                                   │
    [NORMAL] ◄──────────────────────────────┘
```

#### 전이 규칙

| 트리거 | 현재 → 다음 | 주체 | 부수 효과 |
|---|---|---|---|
| `sensor.value >= threshold` | NORMAL → CRITICAL | RuleGuard | LayoutPolicy 재실행, urgency lock 설정 |
| TTL 30s 경과 (센서 미복귀) | CRITICAL → HIGH | RuleGuard (자동) | 배치 유지, Sparkline 재개 허용 |
| 센서 정상 복귀 | CRITICAL/HIGH → NORMAL | RuleGuard | urgency lock 해제, 배치 복귀 |
| 운영자 명시 해제 | CRITICAL/HIGH → NORMAL | Operator UI | urgency lock 즉시 해제 |
| HIGH 5분 경과 (센서 미복귀) | HIGH → NORMAL | RuleGuard (자동) | 경고 기록 보존, 배치 복귀 |

> **안전 원칙**: urgency는 AlarmState를 통해서만 CRITICAL/HIGH로 올라갈 수 있다.
> AestheticTuner·수동 슬라이더·bax_mode 변경으로는 urgency를 높일 수 없다.

---

### 2.3 LayoutPolicy — 도메인별 배치 전략

LayoutPolicy는 MAE에서 분리된 교체 가능한 모듈이다. 도메인이 바뀌어도 컴포넌트 선언은 유지된다.

```ts
interface LayoutPolicy {
  resolve(
    components: ComponentDeclaration[],   // layer: BLOCK 컴포넌트만 전달됨
    ctx: MaeContext
  ): ResolvedLayout
}

interface ResolvedLayout {
  gridTemplate: GridTemplate
  placements:   ComponentPlacement[]
}

interface GridTemplate {
  columns: string    // e.g. "1fr 2fr" | "repeat(3, 1fr)"
  rows:    string    // e.g. "auto 1fr"
  areas?:  string    // CSS grid-template-areas (선택)
}

interface ComponentPlacement {
  componentId: string
  gridArea:    string    // CSS grid-area 값
  minWidth?:   number    // track 역산에 사용된 minWidth (감사용)
}
```

> OVERLAY 컴포넌트는 LayoutPolicy에 전달되지 않는다. VirtualCanvas가 별도 합성한다.

**MVP DefaultLayoutPolicy 동작 규칙**:

```
우선순위 결정 순서:
1. AlarmState.level === 'CRITICAL' → ESSENTIAL·MUTABLE 컴포넌트 최대 면적 셀 단독 확보
2. priority: ESSENTIAL + minWidth 있음 → minWidth 기반 Grid track 역산 후 배치
3. priority: TEXTURE → 나머지 공간 채움
4. viewport_band: sm → 단일 열, TEXTURE 숨김 (hidden)
5. void_ratio → OVR floor 준수, TEXTURE가 먼저 축소

Grid overflow 처리:
- minWidth 합산 > 가용 너비 → 단일 열로 강제 전환 (SingleColumnFallback)
- SingleColumnFallback 발동 시 ovrOverride 플래그 설정
```

**LayoutPolicy 교체 예시 (도메인별)**:

| 도메인 | LayoutPolicy | Grid 형태 |
|---|---|---|
| IoT 관제 (MVP) | `DefaultLayoutPolicy` | 2열: TEXTURE 배경 + ESSENTIAL 전면 |
| 의료 대시보드 | `MedicalLayoutPolicy` | 3열 균등 + 상단 CRITICAL 전용 배너 |
| 아트 인스톨레이션 | `ArtLayoutPolicy` | TEXTURE 전면, ESSENTIAL은 OVERLAY |
| 모바일 단일 뷰 | `SingleColumnPolicy` | 1열, CRITICAL → top sticky |

---

### 2.4 DepthProfile — 의미 → 시각값 변환

```ts
interface DepthProfile {
  resolve(
    depth:   'FG' | 'MID' | 'BG',
    urgency: AlarmLevel,      // CRITICAL | HIGH | NORMAL | NONE
    mode:    BaxOperationMode,
    scale:   number           // ctx.focus_blur_scale (0–1, MID·BG에만 적용)
  ): VisualValues
}

interface VisualValues {
  blurPx:  number    // 0–60
  opacity: number    // 0.03–1.0
  zIndex:  number    // 1–20
}
```

#### 역할 경계 (C1 해소)

- `blurPx`와 `opacity` → **`depth`만** 결정한다. urgency는 영향을 주지 않는다.
- `zIndex` → `depth` 기본값 + `urgency` 가중치로 결정한다.
- FG는 blur 항상 0, opacity 항상 1.0이다. 이는 urgency·bax_mode 무관 고정이다.

#### focus_blur_scale 적용 공식 (G3 해소)

`focus_blur_scale`은 MID·BG의 blur 강도를 사용자(M2P)가 조절하는 스케일러다.
FG에는 적용하지 않는다.

```ts
// blurPx 최종 계산
function applyScale(basePx: number, depth: string, scale: number): number {
  if (depth === 'FG') return 0          // FG는 항상 0, scale 무시
  return Math.round(basePx * scale)     // MID·BG: base × scale (0–1)
}
```

> S2 슬라이더(미드 포커스)는 `ctx.focus_blur_scale`(0–1)을 조정한다.
> scale=1.0이면 DefaultDepthProfile 기본값 그대로, scale=0이면 blur 0 (전면 선명).

#### DefaultDepthProfile 변환 기준

| `depth` | blur base (scale 적용 전) | `bax_mode` | opacity | z-index base |
|---|---|---|---|---|
| FG | 0px (scale 무시) | 모든 모드 | 1.00 | 10 |
| MID | 20px | `meditation` | 0.30 | 5 |
| MID | 4px | `dense_monitor` | 0.60 | 5 |
| MID | 10px | `contextual` / `intelligent` | 0.40 | 5 |
| BG | 60px | `meditation` | 0.03 | 1 |
| BG | 20px | `dense_monitor` | 0.10 | 1 |
| BG | 40px | `contextual` / `intelligent` | 0.05 | 1 |

#### urgency 가중치 → z-index 최종값

| `urgency` | z-index 가중치 | FG 최종 | MID 최종 | BG 최종 |
|---|---|---|---|---|
| CRITICAL | +10 | **20** | 15 | 11 |
| HIGH | +3 | 13 | 8 | 4 |
| NORMAL | 0 | 10 | 5 | 1 |
| NONE | −2 | 8 | 3 | 1 (최소 1) |

---

### 2.5 RuleGuard — Safety 경로 (모드 무관)

RuleGuard는 `bax_mode`에 무관하게 항상 실행된다. 이것이 AestheticTuner(intelligent 전용)와의 핵심 차이다.

```
[모든 bax_mode에서 센서 tick마다]
  RuleGuard.evaluate(sensor, ctx.alarmState)
    → 임계 초과: AlarmState NORMAL→CRITICAL 전이
                 ctx.components 내 대상 urgency 갱신
                 LayoutPolicy.resolve() 즉시 재실행
                 applyAestheticState({ phase: 'urgent' })
    → 정상 복귀: AlarmState CRITICAL/HIGH→NORMAL 전이
                 urgency 복귀
                 LayoutPolicy.resolve() 재실행
                 applyAestheticState({ phase: 'urgent' })
    → 변화 없음: pass

[intelligent 모드 추가 실행]
  AestheticTuner.evaluate(sensor, ctx)
    → void/blur 미세 조정 (urgency 변경 불가)
```

> `intelligent` 모드가 아니어도 RuleGuard는 항상 임계 초과를 감지하고 반응한다.
> `meditation` 모드에서 온도가 임계를 넘으면 Sentinel urgency가 CRITICAL이 되고
> LayoutPolicy가 배치를 재결정한다. 여백이 줄더라도 Safety가 우선이다.

---

### 2.6 상태 변수 SSOT

#### 핵심 상태 변수

| 변수 | 타입 | 범위 | 설명 |
|---|---|---|---|
| `void_ratio` | int | 0–100 | 현재 공백률. `≥ ovr_floor` (Safe-Zone 충돌 시 일시 하회 가능) |
| `ovr_floor` | int | 65–90 | 적정여백율 하한. `resolveOvrFloor(bax_mode, viewport_band)` 런타임 결정 |
| `focus_blur_scale` | float | 0–1 | DepthProfile MID·BG blur 강도 스케일러. S2 슬라이더 입력 |
| `bax_mode` | enum | §2.8 | BAX 운영 모드. DepthProfile·OVR 기본값 입력 |
| `viewport_band` | enum | xl·md·sm | ResizeObserver 기준 |
| `canvas_scale` | float | 0.85–1.15 | VirtualCanvas 위상 스케일 |
| `circuit_state` | enum | closed·open·half_open | NEXA healthWatchdog 연동 (G5) |
| `hybrid_phase` | enum | urgent·fine_tune·idle | 현재 실행 중인 MAE 단계 |
| `active_layout_policy` | string | — | 현재 LayoutPolicy 식별자 |
| `alarmState` | AlarmState | §2.2 | RuleGuard 소유 경보 상태 |
| `light_source_x/y` | int | 0–100 | 그림자 각도 |

> `margin_ratio` 변수는 폐기한다. M2P 패킷의 `margin_ratio` 필드도 `void_ratio_delta`로 교체한다. (C2 해소)

**CSS 전달**: `:root` — `--bax-void-ratio`, `--bax-canvas-scale`, `--bax-focus-blur-scale`, ...
Grid 구성은 VirtualCanvas에 직접 `style.gridTemplateColumns`, `style.gridTemplateRows`로 주입.

---

### 2.7 MAE 엔진 데이터 흐름

```
[Peripheral]  슬라이더(S0–S3) | WebSocket | Web Serial | NIXIE Agent (M2P 채널)
[UI]          bax_mode selector → useBaxStore
[Viewport]    ResizeObserver → viewport_band
       │
       ▼
[VirtualSensor / 실제 센서]  tick
       │
       ├──[모든 모드]──► RuleGuard.evaluate(sensor, alarmState)
       │                   → AlarmState 전이 → urgency 갱신
       │                   → LayoutPolicy 재실행 (변경 시)
       │
       └──[intelligent]──► AestheticTuner(sensor, ctx)
                             → void_ratio_delta, focus_blur_scale 제안
       ▼
[MAE Pipeline]
  vibrationGate(circuit_state)                  # G5
  → OVERLAY 분리 (LayoutPolicy 전달 제외)
  → LayoutPolicy.resolve(BLOCK 컴포넌트, ctx)   # 배치 결정
  → DepthProfile.resolve(depth, urgency, mode, scale)  # 시각값 결정
  → resolveOvrFloor + readabilitySafeZone       # G2
  → densityAdaptive
  → runGuardrails (G1–G5)
  → applyAestheticState + canvas_scale
       ▼
[VirtualCanvas]
  BLOCK 컴포넌트 → 동적 CSS Grid
  OVERLAY 컴포넌트 → position: absolute 합성
  300ms transition
```

---

### 2.8 M2P 프로토콜 (MVP)

**Transport 우선순위**: ① 웹 슬라이더 (내장) → ② WebSocket `ws://localhost:*` → ③ Web Serial (Arduino)

**NIXIE Agent 연결**: NIXIE Agent는 M2P 채널(WebSocket)을 통해 동일한 패킷 포맷으로 MAE에 입력한다. MVP에서는 가상 시뮬레이터로 대체한다.

**패킷 v2 (JSON, 10–30 Hz 권장)**:

```json
{
  "v": 2,
  "source": "peripheral | sim-slider | nixie-agent",
  "ts": 1710000000000,
  "void_ratio_delta": 5,
  "focus_blur_scale": 0.7
}
```

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `v` | int | ✓ | 스키마 버전 (v1의 `margin_ratio` 대체) |
| `source` | string | ✓ | 송신원 |
| `void_ratio_delta` | int −10~+10 | ✓ | `void_ratio` 증감분. MAE가 OVR clamp 후 반영 |
| `focus_blur_scale` | float 0–1 | ✓ | DepthProfile MID·BG blur 스케일러 직접 입력 |

> `void_ratio_delta` 수신 시 MAE: `void_ratio = clamp(void_ratio + delta, ovr_floor, 100)`
> 이로써 M2P 입력과 `void_ratio` 상태값 사이의 변환 로직이 명확해진다. (C2 해소)

**지연 목표**: Peripheral → 화면 반영 p95 ≤ 50ms

---

### 2.9 BAX 운영 모드 (BaxOperationMode)

| `bax_mode` | UI 라벨 | 핵심 전략 | `ovr_floor` | DepthProfile 영향 |
|---|---|---|---|---|
| `meditation` | 명상/여백 | 정보 최소화 · 호흡 극대화 | **85** | BG blur↑↑, MID blur↑, void 85–90 |
| `dense_monitor` | 밀집/모니터링 | 다중 지표 동시 관찰 | **75** | BG blur↓, MID blur↓, opacity↑ |
| `contextual` | 관계/맥락 | FG vs MID 대비 강조 | **78** | MID opacity↑ |
| `intelligent` | 인텔리전트 | AestheticTuner 상황별 제안 | **75** (동적) | MaeDecision 가변 · 실패 시 `dense_monitor` fallback |

> 모드 전환은 DepthProfile과 OVR에만 영향을 준다.
> Safety(RuleGuard·AlarmState)는 모드에 무관하게 항상 동작한다.

**모드 전환 흐름**:

```
[수동]  S0 모드 셀렉터 / DevController
    → useBaxStore.setMode(bax_mode)
    → DepthProfile 재계산, OVR 재계산

[AlarmState CRITICAL 발생 시 자동]
    → bax_mode는 변경하지 않는다 (Safety는 배치로 표현)
    → LayoutPolicy 재실행 + urgency 갱신만 수행

[intelligent 모드 AestheticTuner 실패]
    → bax_mode 강제 변경 없이 preset 값으로 fallback
```

---

### 2.10 반응형 — OVR · 밀도 적응 · VirtualCanvas 스케일

#### 2.10.1 `resolveOvrFloor(mode, viewport_band)`

```ts
const VIEWPORT_DELTA = { xl: 0, md: -2, sm: -5 } as const
const OVR_ABSOLUTE_MIN = 65  // 미학 하한 — sm 좁음 해결책 아님 (§2.10.4)

function resolveOvrFloor(mode: BaxOperationMode, band: ViewportBand): number {
  const base = BAX_MODE_PRESETS[mode].ovr_floor
  return Math.max(OVR_ABSOLUTE_MIN, base + VIEWPORT_DELTA[band])
}
```

| `viewport_band` | 조건 | OVR 보정 | LayoutPolicy 영향 |
|---|---|---|---|
| `xl` | ≥ 1280px | mode 기본값 | 기본 구성 |
| `md` | 768–1279px | −2 | Frame OVERLAY opacity 50% |
| `sm` | < 768px | −5 (하한 65 절대) | Frame OVERLAY 숨김 · 단일 열 고려 |

#### 2.10.2 밀도 적응형 알고리즘

`applyAestheticState` 직전 실행:

1. `ovr_floor = resolveOvrFloor(bax_mode, viewport_band)`
2. `void_ratio = clamp(proposed, ovr_floor, 100)` — Safe-Zone 충돌 시 미달 허용
3. `sm` → TEXTURE·BLOCK 컴포넌트 우선 숨김. OVERLAY는 별도 처리
4. 정보 면적 > 가용 30% → MID DepthProfile blur 1단계 축소 (G1 유지)
5. `applySafeZone` — ESSENTIAL minWidth 강제 (G2)

#### 2.10.3 VirtualCanvas Topology 스케일링

| `viewport_band` | `canvas_scale` | `focus_blur_scale` 상한 | 효과 |
|---|---|---|---|
| `xl` | 1.00 | 1.00 | 기준 호흡 깊이 |
| `md` | 0.95 | 0.90 | blur 소폭 감소 |
| `sm` | 0.88 | 0.80 | gap 축소 · FG 카드 full-width |

#### 2.10.4 가독성 Safe-Zone — ESSENTIAL 물리 하한 (G2 보강)

| 대상 | CSS 규칙 | MVP SSOT | `sm` 보정 |
|---|---|---|---|
| Sentinel (ESSENTIAL) | `min-width` | **300px** | **280px** (절대 **240px**) |
| Sentinel | `min-height` | **120px** | 100px |
| Sentinel 본문 | `font-size` | **≥ 1.25rem** | 동일 |
| Anchor/Frame (TEXTURE) | — | Safe-Zone 미적용 — 먼저 축소·숨김 | — |

> **Grid overflow 처리 (R3 해소)**:
> `resolvedLayout.placements` 합산 minWidth > 가용 너비 시:
> `DefaultLayoutPolicy` → `SingleColumnFallback` 자동 전환.
> `ovrOverride` 플래그 설정 → 감사 로그. `void_ratio` 목표 일시 포기.

> **우선순위 (G2)**: Safe-Zone > OVR % — Sentinel이 읽히지 않으면 `void_ratio` 목표 일시 포기.

---

### 2.11 진동 (Vibration) — 기술 SSOT

| 계층 | MVP 구현 | `priority` | Circuit Open 시 |
|---|---|---|---|
| **V0 정적** | `focus_blur_scale` · `light_*` · shadow | — | 유지 |
| **V1 Sparkline** | Sentinel 하단 시간 기반 미니 라인 | CONTEXTUAL | OFF |
| **V2 Micro-motion** | opacity pulse · border breathe | TEXTURE | OFF |
| **V3 Audio** (후속) | 청각 레이어 | — | OFF |

**G5 — 진동 차단**:

```
circuitState === 'open'  OR  mainFps p50 < 24 (3s)
  → vibrationGate.close()
       · Sparkline unmount · micro-animation class removed
       · Sentinel 숫자·텍스트만 표시
  → Safety (RuleGuard·AlarmState·urgency) 경로는 유지
```

---

### 2.12 Layout 점유 · 중첩 (Stacking) 규칙

`layer: OVERLAY` 컴포넌트는 이 섹션의 규칙 적용 대상이 아니다.
`layer: BLOCK` 컴포넌트에만 적용한다.

**동일 셀 내 z-index 우선순위**:

| 순위 | `priority` | `urgency` | z-index |
|---|---|---|---|
| 1 | ESSENTIAL | CRITICAL | 20 |
| 2 | ESSENTIAL | HIGH | 13 |
| 3 | CONTEXTUAL | * | 8 |
| 4 | ESSENTIAL | NORMAL/NONE | 10/8 |
| 5 | TEXTURE | * | ≤ 3 |

동일 순위 → `componentId` lexicographic (결정적 tie-break)

**인접 셀 자동 분산 (Adjacent Spillover)**:

```
BLOCK 컴포넌트 동일 셀 ESSENTIAL 충돌 시:
1. LayoutPolicy.resolve() 재호출 → 대안 셀 요청
2. 빈 영역 우선, ESSENTIAL은 FG depth 유지
3. spillover 1건/tick (G3 Entropy와 합산)
4. 후보 없음 → z-index stack + minWidth Safe-Zone 보장
```

---

### 2.13 지능형 하이브리드 반영 (RuleGuard + AestheticTuner)

```
[모든 모드] RuleGuard — 임계 초과 시
────────────────────────────────────────────────────
  [Phase 1 · urgent, 0ms]
  AlarmState 전이 (NORMAL → CRITICAL)
  Sentinel.urgency → CRITICAL
  LayoutPolicy.resolve() 즉시 재실행
  focus_blur_scale → 1.0 강제 (blur 최대, FG는 0 유지)
  applyAestheticState({ phase: 'urgent' })  ≤300ms

[intelligent 모드 추가]
────────────────────────────────────────────────────
  [Phase 2 · fine_tune, AestheticTuner 응답 후]
  AlarmState.level 잠금 확인 → 변경 불가
  void_ratio_delta · focus_blur_scale → AI 제안
  applyAestheticState({ phase: 'fine_tune' })  ≤300ms ease

[AlarmState 해제 시 — 모든 모드]
────────────────────────────────────────────────────
  Sentinel.urgency → NORMAL
  LayoutPolicy.resolve() 재실행 (원래 배치 복귀)
  applyAestheticState({ phase: 'urgent' })  ≤300ms
```

| Phase | 주체 | 허용 필드 | 금지 |
|---|---|---|---|
| `urgent` | RuleGuard | `urgency`, `focus_blur_scale → 1.0` | void 대폭 변경 (delta ±5 이내) |
| `fine_tune` | AestheticTuner | `void_ratio_delta`, `focus_blur_scale` | urgency 변경 · LayoutPolicy 재실행 요청 |
| `urgent` (해제) | RuleGuard | urgency 복귀 · 배치 복귀 | — |

---

## 3. MVP 화면 · 컴포넌트

단일 페이지. 이동·라우팅 없음.

| ID | 이름 | 의미 속성 요약 | MAE 결정 결과 |
|---|---|---|---|
| Comp A | **Anchor** | TEXTURE · NONE · BG · IMMUTABLE · BLOCK | BG 영역 — 15vw Giant 타이포 · blur 최대 |
| Comp B | **Frame** | TEXTURE · NONE · FG · IMMUTABLE · **OVERLAY** | Grid 위 절대 위치 — 6px monospace 격자 (**데모 전용**) |
| Comp C | **Sentinel** | ESSENTIAL · NORMAL→CRITICAL · FG · MUTABLE · BLOCK · minWidth 300px | 기본: Grid 우측 · CRITICAL: 최대 면적 셀 |
| Comp D | **Sparkline** | CONTEXTUAL · — · FG · MUTABLE · **OVERLAY** | Sentinel 내부 하단 합성 |

> Sentinel urgency가 CRITICAL이 되면 컴포넌트 코드 수정 없이 AlarmState → LayoutPolicy → 배치가 자동 연쇄한다.

**CONTEXTUAL 검증 시나리오 (R2 해소)**:
Sparkline(CONTEXTUAL·OVERLAY)을 통해 CONTEXTUAL priority의 Vibration·Circuit Gate 동작을 MVP에서 검증한다.
Circuit Open 시 Sparkline이 G5에 의해 OFF되는지 확인이 핵심 체크포인트다.

**Dev Controller** (우하단):
BAX 모드 선택 + 슬라이더 4종 + `경고 발생/해제` + `가상 센서 tick` + Ollama on/off + viewport band + `LayoutPolicy 교체` (데모용) + AlarmState 현황 표시.

**수동 제어 슬라이더 (M2P Peripheral 대체)**:

| ID | 명칭 | 변수 | 효과 |
|---|---|---|---|
| S0 | 모드 셀렉터 | `bax_mode` | DepthProfile·OVR preset 일괄 변경 |
| S1 | 보이드 레이트 | `void_ratio_delta` (M2P 패킷) | void_ratio 증감 — OVR clamp 후 반영 |
| S2 | 미드 포커스 | `focus_blur_scale` | DepthProfile MID·BG blur 스케일 (0=전면선명, 1=최대blur) |
| S3 | 라이트 앵글 | `light_source_x/y` | Anchor `box-shadow` 각도 |

---

## 4. 기능 요구사항 (FR)

| ID | 요구사항 | Acceptance Criteria |
|---|---|---|
| **FR-01** | 의미 기반 동적 Grid | 컴포넌트 의미 속성 선언 → MAE가 Grid 구성·배치 결정. 좌표 하드코딩 없음 |
| **FR-02** | 호흡형 blur/void | `meditation` → void 85–90 · OVR clamp · DepthProfile MID blur↑ · ≤300ms |
| **FR-03** | urgency 기반 재배치 | AlarmState NORMAL→CRITICAL → LayoutPolicy 재실행 · focus_blur_scale=1.0 · ≤300ms |
| **FR-04** | 가드레일 G1–G5 | OVR · Safe-Zone 300px · Layout 점유 · Entropy · Vibration Gate |
| **FR-05** | M2P 수신 v2 | 슬라이더 = 패킷 동일 효과 · `void_ratio_delta` 수신 · OVR clamp 반영 |
| **FR-06** | 하이브리드 2단계 | Phase 1 RuleGuard 즉시 · Phase 2 AestheticTuner void/blur만 · urgency lock |
| **FR-07** | Fallback | AestheticTuner fail → Phase 1 유지 · RuleGuard SSOT |
| **FR-08** | BAX 운영 모드 | 4모드 전환 · DepthProfile·OVR 변경 · Safety는 모드 무관 항상 동작 |
| **FR-09** | 반응형 OVR/Topology | ResizeObserver · OVR·scale · Safe-Zone sm 280px · Grid overflow → SingleColumnFallback |
| **FR-10** | Layout 점유/분산 | BLOCK 컴포넌트 동일 셀 → z-index · 인접 셀 spillover · §2.12 |
| **FR-11** | 진동 + Circuit | Sparkline/micro on · Circuit OPEN → V1/V2 OFF · Sentinel 텍스트 유지 |
| **FR-12** | LayoutPolicy 교체 | 런타임 교체 시 컴포넌트 선언 변경 없이 Grid 재구성 |
| **FR-13** | AlarmState 상태 머신 | CRITICAL/HIGH/NORMAL 전이 · TTL 30s 자동 · 운영자 해제 · 센서 복귀 감지 |
| **FR-14** | OVERLAY 렌더링 | Frame·Sparkline이 Grid 공간 비점유 · G1·G4 대상 제외 확인 |

### 4.1 비기능 요구사항 (NFR)

| ID | 항목 | 기준 |
|---|---|---|
| **NFR-01** | FPS | 전환 중 p50 ≥ 24 |
| **NFR-02** | AestheticTuner | timeout 3s → fallback |
| **NFR-03** | 오프라인 | AestheticTuner 없이 수동+규칙+모드 preset 100% 동작 |
| **NFR-04** | 반응형 | band 변경 · Sentinel ≥ Safe-Zone minWidth · OVR ≥65 또는 SingleColumnFallback |
| **NFR-05** | Circuit | OPEN 시 sparkline/micro 0 frame 추가 · FPS 회복 후 재개 |
| **NFR-06** | Safety 응답 | RuleGuard 임계 초과 감지 → 화면 반영 ≤300ms (모든 bax_mode) |

---

## 5. AestheticTuner 연동 (Phase 2 · intelligent 전용)

### 5.1 역할 분담

| 계층 | Phase | 책임 |
|---|---|---|
| **RuleGuard** | 1 · urgent | AlarmState 전이 · urgency 갱신 · LayoutPolicy 재실행 트리거 (모드 무관) |
| **AestheticTuner** (Ollama) | 2 · fine_tune | `void_ratio_delta` · `focus_blur_scale` 미세 조정 (intelligent 전용) |
| **guardrails** | both | G1–G5 · Phase 2에서 urgency·layout 변경 strip |
| **layoutOccupancy** | 1·2 | BLOCK 컴포넌트 셀 점유·spillover |

### 5.2 API

```
POST http://localhost:11434/api/generate
format: "json" · model: llama3 (또는 경량 로컬 모델)
```

### 5.3 출력 스키마 (MaeDecision)

**Phase 1 (RuleGuard)**:

```json
{
  "phase": "urgent",
  "target_component": "Sentinel",
  "urgency": "CRITICAL",
  "focus_blur_scale": 1.0
}
```

**Phase 2 (AestheticTuner)**:

```json
{
  "phase": "fine_tune",
  "target_component": "Sentinel",
  "void_ratio_delta": -3,
  "focus_blur_scale": 0.6
}
```

> AestheticTuner 출력에 `urgency`, `layout_policy`, `grid_template` 필드가 포함되면 MAE가 strip한다.

**AestheticTuner Prompt (fine_tune)**:

```
Phase fine_tune ONLY.
AlarmState is LOCKED by RuleGuard. urgency cannot be changed.
Layout decisions are LOCKED.
Return JSON only: { phase, void_ratio_delta, focus_blur_scale }.
void_ratio_delta range: -10 to +10. focus_blur_scale range: 0.0 to 1.0.
Ensure final void_ratio >= OVR floor after delta.
No urgency field. No layout fields. No prose.
Input: sensor={sensor} · current void={void_ratio} · mode={bax_mode}
```

### 5.4 시나리오 예

| 입력 | Phase 1 (RuleGuard, 0ms) | Phase 2 (AestheticTuner, 지연) |
|---|---|---|
| 72°C — 정상 | urgency: NORMAL 유지 | void_ratio_delta: 0 · focus_blur_scale: 0.7 |
| 85°C — 임계 초과 | **AlarmState CRITICAL · urgency CRITICAL · LayoutPolicy 재배치** | void_ratio_delta: -3 · focus_blur_scale: 1.0 |
| 76°C — 복귀 | **AlarmState NORMAL · urgency NORMAL · 배치 복귀** | void_ratio_delta: +2 · focus_blur_scale: 0.8 |

---

## 6. 기술 스택 · 저장소

| 항목 | MVP 선택 | 비고 |
|---|---|---|
| App | `apps/bax-demo` (Vite + React) | NEXA monorepo 내 독립 |
| Style | Tailwind + CSS variables + 동적 Grid | gridTemplate 문자열을 MAE가 VirtualCanvas에 직접 주입 |
| Motion | Framer Motion 또는 GSAP | 300ms transition SSOT |
| AI | Ollama local (AestheticTuner) | 클라우드 API 금지 (MVP) |
| HW (선택) | Web Serial API | Arduino pot → M2P v2 packet |

**저장소 트리**:

```
apps/bax-demo/
├── src/
│   ├── canvas/
│   │   └── VirtualCanvas.tsx       # 동적 CSS Grid + OVERLAY 합성
│   ├── components/
│   │   ├── Anchor.tsx              # BLOCK 의미 속성 선언
│   │   ├── Frame.tsx               # OVERLAY 선언
│   │   ├── Sentinel.tsx            # BLOCK · MUTABLE · minWidth 300
│   │   └── Sparkline.tsx           # CONTEXTUAL · OVERLAY (Sentinel 내부)
│   ├── engine/
│   │   ├── MaeContext.ts           # MaeContext 인터페이스 (v0.8 신규)
│   │   ├── AlarmState.ts           # AlarmState 상태 머신 (v0.8 신규)
│   │   ├── LayoutPolicy/
│   │   │   ├── index.ts
│   │   │   ├── DefaultLayoutPolicy.ts
│   │   │   └── SingleColumnPolicy.ts
│   │   ├── DepthProfile/
│   │   │   ├── index.ts
│   │   │   └── DefaultDepthProfile.ts
│   │   ├── applyAestheticState.ts
│   │   ├── baxModePresets.ts
│   │   ├── guardrails/
│   │   │   ├── ovrPolicy.ts
│   │   │   ├── readabilitySafeZone.ts
│   │   │   ├── sizePolicy.ts
│   │   │   ├── entropyBrake.ts
│   │   │   └── vibrationGate.ts
│   │   ├── layoutOccupancy.ts
│   │   ├── hybridEvaluate.ts
│   │   ├── densityAdaptive.ts
│   │   ├── viewportScale.ts
│   │   └── ruleEngine.ts           # RuleGuard
│   ├── store/useBaxStore.ts
│   ├── m2p/
│   │   ├── wsClient.ts
│   │   ├── serialClient.ts
│   │   ├── nixieSimulator.ts       # NIXIE Agent 가상 시뮬레이터
│   │   └── types.ts                # M2P v2 패킷 타입
│   ├── ollama/client.ts
│   └── dev/DevController.tsx       # AlarmState 현황 표시 포함
└── package.json
```

---

## 7. NEXA OS 정합 (참고)

| BAX MVP | NEXA V2.1 | 관계 |
|---|---|---|
| VirtualCanvas (동적 Grid + OVERLAY) | `nexage` content + `NexaDashboardRenderer` | 후속 — MVP 검증 후 흡수 여부 결정 |
| void_ratio / OVR | `TELEMETRY_CIRCUIT_OPEN` 텍스트 모드 | Safety semantic 우선 |
| Vibration G5 | `healthWatchdog` · `circuitState` | 진동 최우선 OFF |
| `bax_mode` | `userSettingsStore` · `useLayoutStore` | nexage 흡수 시 설정 UI 연동 |
| AlarmState | NEXA 경보 시스템 | 흡수 시 NEXA 경보 이벤트 → AlarmState 전이 연동 |
| AestheticTuner JSON | `nexia` + `packages/shared` Zod | 흡수 시 MaeDecision → shared schema |
| M2P WS v2 | 채널 B Worker WS | 별도 — 미학 패킷 ≠ Telemetry flood |
| LayoutPolicy | `domainLayoutRegistry` | 흡수 시 도메인별 Policy 등록 체계로 확장 |

---

## 8. 현실성 · 리스크

| 항목 | 평가 | 메모 |
|---|---|---|
| 의미 기반 선언 체계 | 🟢 높음 | 컴포넌트 수 적음 · 인터페이스 명확 |
| 동적 CSS Grid | 🟢 높음 | gridTemplate 문자열 주입 — 표준 CSS |
| OVERLAY 레이어 분리 | 🟢 높음 | position: absolute — 구현 단순 |
| AlarmState 상태 머신 | 🟢 높음 | 상태 4개 · 전이 규칙 명확 |
| DepthProfile 가변값 | 🟢 높음 | focus_blur_scale 공식 명확 |
| LayoutPolicy 교체 | 🟢 높음 | MVP 1종 · 인터페이스 확정 |
| RuleGuard 모드 무관 동작 | 🟢 높음 | Safety 경로 분리 명확 |
| M2P v2 패킷 교체 | 🟡 중간 | 기존 v1 클라이언트 마이그레이션 필요 |
| 6px Frame 실운영 | 🔴 낮음 | 데모 전용 명시 |
| M2P 하드웨어 | 🔴 MVP 이후 | 슬라이더/Serial 먼저 |

**Go / No-Go (MVP 완료 정의)**:

- [ ] FR-01–14 PASS
- [ ] NFR-01 PASS (전환 중 FPS p50 ≥ 24)
- [ ] NFR-06 PASS (Safety 응답 ≤300ms, 모든 bax_mode)
- [ ] AestheticTuner off 시 FR-07 fallback PASS
- [ ] AlarmState 전이 시나리오 전체 PASS (§2.2 전이 규칙 5종)
- [ ] LayoutPolicy 교체 시 컴포넌트 선언 변경 없음 확인
- [ ] Frame·Sparkline OVERLAY가 G1·G4 적용 제외 확인 (FR-14)

---

## 부록 A. 핵심 타입 정의

```ts
// 컴포넌트가 선언하는 의미 속성
interface ComponentDeclaration {
  id:          string
  priority:    'ESSENTIAL' | 'CONTEXTUAL' | 'TEXTURE'
  urgency:     AlarmLevel           // 'CRITICAL' | 'HIGH' | 'NORMAL' | 'NONE'
  depth:       'FG' | 'MID' | 'BG'
  mutability:  'IMMUTABLE' | 'MUTABLE'
  layer:       'BLOCK' | 'OVERLAY'  // v0.8 신규
  minWidth?:   number               // ESSENTIAL 전용 Safe-Zone 하한
}

// MAE 런타임 컨텍스트
interface MaeContext {
  components:           ComponentDeclaration[]
  bax_mode:             BaxOperationMode
  viewport_band:        'xl' | 'md' | 'sm'
  circuit_state:        'closed' | 'open' | 'half_open'
  void_ratio:           number
  focus_blur_scale:     number        // 0–1
  light_source_x:       number
  light_source_y:       number
  layoutPolicy:         LayoutPolicy
  depthProfile:         DepthProfile
  alarmState:           AlarmState
  hybrid_phase:         'urgent' | 'fine_tune' | 'idle'
  canvas_scale:         number
  active_layout_policy: string
}

// AlarmState
type AlarmLevel = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'NONE'

interface AlarmState {
  level:        AlarmLevel
  component_id: string | null
  raised_at:    number | null
  source:       string | null
  cleared_by:   'auto' | 'operator' | null
}

// DepthProfile 출력
interface VisualValues {
  blurPx:  number    // applyScale(base, depth, focus_blur_scale)
  opacity: number
  zIndex:  number    // depth base + urgency 가중치
}

// MAE가 결정하는 배치 결과 (BLOCK 전용)
interface ComponentPlacement {
  componentId: string
  gridArea:    string
  minWidth?:   number
}

// LayoutPolicy 인터페이스
interface LayoutPolicy {
  resolve(
    components: ComponentDeclaration[],   // layer: BLOCK 만
    ctx: MaeContext
  ): ResolvedLayout
}

interface ResolvedLayout {
  gridTemplate: GridTemplate
  placements:   ComponentPlacement[]
  overflowFallback?: boolean            // SingleColumnFallback 발동 여부
}

interface GridTemplate {
  columns: string
  rows:    string
  areas?:  string
}

// Phase 1 RuleGuard 출력
interface UrgentDecision {
  phase:            'urgent'
  target_component: string
  urgency:          AlarmLevel
  focus_blur_scale: number    // CRITICAL 시 1.0 강제
}

// Phase 2 AestheticTuner 출력
interface FineTuneDecision {
  phase:             'fine_tune'
  target_component:  string
  void_ratio_delta:  number    // -10 to +10
  focus_blur_scale:  number    // 0–1
  // urgency, layout 관련 필드 없음 — MAE가 strip
}

// M2P v2 패킷
interface M2PPacketV2 {
  v:                 2
  source:            string
  ts:                number
  void_ratio_delta:  number    // -10 to +10
  focus_blur_scale:  number    // 0–1
}
```

---

## 부록 B. applyAestheticState (의사코드)

```ts
function applyAestheticState(decision: MaeDecision, ctx: MaeContext) {
  // G5: 진동 차단
  if (ctx.circuit_state !== 'closed') {
    decision = stripVibrationLayers(decision)
  }

  // Phase 2 보호: urgency·layout 변경 금지
  if (decision.phase === 'fine_tune') {
    decision = stripStructuralFields(decision)
  }

  // void_ratio 갱신 (M2P 또는 AestheticTuner 입력)
  if (decision.void_ratio_delta !== undefined) {
    ctx.void_ratio = clamp(
      ctx.void_ratio + decision.void_ratio_delta,
      resolveOvrFloor(ctx.bax_mode, ctx.viewport_band),
      100
    )
  }

  // OVERLAY 분리
  const blockComponents = ctx.components.filter(c => c.layer === 'BLOCK')
  const overlayComponents = ctx.components.filter(c => c.layer === 'OVERLAY')

  // BLOCK: LayoutPolicy로 Grid 배치 결정
  const layout  = ctx.layoutPolicy.resolve(blockComponents, ctx)
  const floor   = resolveOvrFloor(ctx.bax_mode, ctx.viewport_band)
  const adapted = densityAdaptive(layout, ctx)
  const safe    = runGuardrails(adapted, { ovr_floor: floor })   // G1–G4
  const final   = applySafeZone(safe, ctx.viewport_band)         // G2 Safe-Zone

  // BLOCK: DepthProfile로 시각값 결정
  for (const placement of final.placements) {
    const decl   = ctx.components.find(c => c.id === placement.componentId)!
    const visual = ctx.depthProfile.resolve(
      decl.depth,
      ctx.alarmState.level,      // urgency는 AlarmState에서 읽음
      ctx.bax_mode,
      ctx.focus_blur_scale
    )
    applyVisuals(placement.componentId, visual)
  }

  // BLOCK: CSS Grid 주입
  applyGridTemplate(ctx.canvas, final.gridTemplate)
  placeBlockComponents(final.placements)

  // OVERLAY: 독립 합성 (Grid 공간 비점유)
  for (const comp of overlayComponents) {
    applyOverlay(comp, ctx)
  }

  setCssVars(ctx.void_ratio, ctx.focus_blur_scale, ctx.canvas_scale)
  animate({ durationMs: 300, ease: 'easeOut' })
}
```

---

## 부록 C. hybridEvaluate (의사코드)

```ts
async function hybridEvaluate(sensor: SensorReading, ctx: MaeContext) {
  // Phase 1: RuleGuard — 모든 모드에서 실행
  const alarmChanged = ruleEngine.evaluate(sensor, ctx.alarmState)
  if (alarmChanged) {
    // AlarmState 전이에 따라 urgency 갱신
    const targetId = ctx.alarmState.component_id!
    ctx.components = updateUrgency(ctx.components, targetId, ctx.alarmState.level)
    const urgent: UrgentDecision = {
      phase:            'urgent',
      target_component: targetId,
      urgency:          ctx.alarmState.level,
      focus_blur_scale: ctx.alarmState.level === 'CRITICAL' ? 1.0 : ctx.focus_blur_scale
    }
    applyAestheticState(urgent, ctx)
  }

  // Phase 2: AestheticTuner — intelligent 모드 전용
  if (ctx.bax_mode !== 'intelligent') return

  try {
    const fine = await evaluateWithOllama(sensor, ctx)
    applyAestheticState({ ...fine, phase: 'fine_tune' }, ctx)
  } catch {
    // timeout/error → Phase 1 결과 유지
    console.warn('AestheticTuner fallback: Phase 1 state preserved')
  }
}
```

---

## 부록 D. DefaultLayoutPolicy (의사코드)

```ts
class DefaultLayoutPolicy implements LayoutPolicy {
  resolve(
    components: ComponentDeclaration[],   // BLOCK 컴포넌트만
    ctx: MaeContext
  ): ResolvedLayout {
    const isCritical = ctx.alarmState.level === 'CRITICAL'
    const essentials = components.filter(c => c.priority === 'ESSENTIAL')
    const textures   = components.filter(c => c.priority === 'TEXTURE')
    const contextuals = components.filter(c => c.priority === 'CONTEXTUAL')

    // Grid overflow 확인 (R3 해소)
    const totalMinWidth = essentials.reduce((sum, c) => sum + (c.minWidth ?? 0), 0)
    const availableWidth = this.getAvailableWidth(ctx.viewport_band)
    if (totalMinWidth > availableWidth || ctx.viewport_band === 'sm') {
      return this.singleColumnFallback(essentials, textures, isCritical)
    }

    if (isCritical) {
      // CRITICAL: ESSENTIAL 컴포넌트 최대 면적 우선
      return {
        gridTemplate: { columns: '1fr 2fr', rows: '1fr' },
        placements: [
          ...textures.map(c => ({
            componentId: c.id,
            gridArea: '1 / 1 / 2 / 2'
          })),
          ...essentials.map(c => ({
            componentId: c.id,
            gridArea: '1 / 2 / 2 / 3',
            minWidth: c.minWidth
          })),
          // contextuals는 CRITICAL 시 ESSENTIAL 셀 내 OVERLAY로 처리
        ]
      }
    }

    // 기본: TEXTURE 배경 + ESSENTIAL 우측
    return {
      gridTemplate: { columns: '1fr 1fr', rows: '1fr' },
      placements: [
        ...textures.map(c => ({
          componentId: c.id,
          gridArea: '1 / 1 / 2 / 3'   // 전체 배경
        })),
        ...essentials.map(c => ({
          componentId: c.id,
          gridArea: '1 / 2 / 2 / 3',
          minWidth: c.minWidth
        })),
        ...contextuals.map(c => ({
          componentId: c.id,
          gridArea: '1 / 2 / 2 / 3'   // ESSENTIAL 셀과 공유 (z-index로 구분)
        }))
      ]
    }
  }

  private singleColumnFallback(
    essentials: ComponentDeclaration[],
    textures: ComponentDeclaration[],
    isCritical: boolean
  ): ResolvedLayout {
    return {
      gridTemplate: { columns: '1fr', rows: 'auto' },
      placements: [
        ...essentials.map((c, i) => ({
          componentId: c.id,
          gridArea: `${i + 1} / 1`,
          minWidth: c.minWidth
        }))
        // CRITICAL 시 textures 생략, 정상 시 포함
      ],
      overflowFallback: true
    }
  }
}
```

---

## 부록 E. 폐기 목록

| 폐기 항목 | 이유 | 대체 |
|---|---|---|
| `matrix_id` (BG-L·MID-C·FG-R 등) | 좌표와 의미 혼재 — AXON 원칙 3 위반 | `ComponentDeclaration` 의미 속성 |
| `MatrixStyles` 고정 9칸 테이블 | Grid 구성이 MAE 외부에 고정됨 | `LayoutPolicy.resolve()` 동적 결정 |
| `matrixOccupancy.ts` | matrix_id 기반 점유 로직 | `layoutOccupancy.ts` |
| Phase 1의 `matrix_id: "FG-C"` 출력 | 컴포넌트가 위치를 앎 | `urgency: "CRITICAL"` + AlarmState |
| `margin_ratio` 변수 | `void_ratio`와 이중 제어 — 변환 로직 미정의 | `void_ratio_delta` (M2P v2) |
| M2P 패킷 v1 `margin_ratio` 필드 | 동일 | M2P v2 `void_ratio_delta` |

---

## 변경 이력

| 버전 | 날짜 | 내용 |
|---|---|---|
| 0.1 | — | 기획 메모 통합본 |
| 0.2 | 2026-05 | B 스타일 MVP SSOT 재구성 |
| 0.3 | 2026-05 | OVR · BAX 운영 모드 4종 · VirtualCanvas |
| 0.4 | 2026-05 | Rule+AI 2단계 · Vibration/G5 · Matrix 점유 · Safe-Zone |
| 0.5 | 2026-05 | MAE 엔진 분리 — MaeDecision · engine/ |
| 0.6 | 2026-05 | BAX UX 브랜드 확정 — BAX/MAE/M2P 3계층 |
| 0.6r | 2026-05 | 네이밍 정비 — Anchor·Frame·Sentinel·RuleGuard·AestheticTuner |
| 0.7 | 2026-05 | Matrix 구조 전면 재설계 — 의미 속성 기반 자유 배치. LayoutPolicy·DepthProfile 도입 |
| **0.8** | **2026-05** | **충돌·결함 전면 해소**: depth·urgency 역할 분리 명문화(C1) · void_ratio 단일 제어·margin_ratio 폐기(C2) · OVERLAY 레이어 타입 도입으로 Frame 충돌 해소(C3) · RuleGuard Safety 경로 모드 무관 명시(C4) · MaeContext 타입 정의(G1) · AlarmState 상태 머신 정의(G2) · focus_blur_scale 공식 명문화(G3) · DefaultLayoutPolicy Frame 배치 완성(G4) · urgency 전이 상태 머신(R1) · CONTEXTUAL Sparkline 검증 시나리오(R2) · Grid overflow SingleColumnFallback(R3) · NIXIE Agent M2P 연결점 명시(R4) |

---

*BAX MVP 개발 SSOT v0.8 — AXON 시스템 내 미학 UX 레이어*
