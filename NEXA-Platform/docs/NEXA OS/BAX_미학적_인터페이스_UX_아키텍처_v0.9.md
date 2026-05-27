# BAX (Breathing AI Experience)

**미학적 인터페이스 · 사용자경험 아키텍처 정의서**  
MVP 개발 **단일 SSOT** — **v0.9**

> **문서 유형**: B — MVP 개발 SSOT (Functional Requirements · API · Semantic Layout 중심)  
> **요약본**: [`BAX_미학적_인터페이스_UX_아키텍처_요약_v0.8.md`](./BAX_미학적_인터페이스_UX_아키텍처_요약_v0.8.md) (v0.9 동기화)  
> **상태**: Draft · **관련**: NEXA OS V2.1 · **실험 앱**: `apps/bax-demo`  
> **선행 문서**: v0.8 UX SSOT · `BAX_문제 해소.md` — **본 문서에 흡수 완료. 구현 시 v0.9만 참조.**

> **v0.9 변경 요약** (v0.8 UX SSOT + `BAX_문제 해소.md` 통합 · 단일 SSOT 완성):
> **용어** — **ASR** · `asr_base` · `resolveAsrBase` · `asrOverride` · **ATS** 유지  
> **C1** — `depth`↔`urgency` 역할 분리 · **C2** — `void_ratio` 단일 SSOT · M2P v2  
> **C3** — `layer: OVERLAY` · **C4** — RuleGuard **모드 무관**  
> **G1–G4** — `MaeContext` · `AlarmState` · blur 공식 · DefaultLayoutPolicy · overflow  
> **R1–R4** — urgency 전이 · CONTEXTUAL 검증 · SingleColumnFallback · NIXIE M2P  
> **본판** — FR AC · UI · Safe-Zone · **§1.3 컴포넌트 개발 가이드** · 부록 전체

---

## 약어 및 용어 정의

| 약어               | 풀네임                    | 설명                                              |
| ------------------ | ------------------------- | ------------------------------------------------- |
| **BAX**            | Breathing AI Experience   | 인간의 의지와 AI 호흡이 결합된 **전체 UX 브랜드** |
| **MAE**            | Matrix Aesthetic Engine   | 의미 속성 → Grid·배치·시각값 **동적 결정**        |
| **ATS**            | Aesthetic Tuning Settings | **영속** 사용자 미학 조율 (ASR·Depth·Vibration)   |
| **M2P**            | Matrix-to-Peripheral      | **실시간 의지** 입력 (Peripheral·NIXIE·WS·Serial) |
| **ASR**            | Aesthetic Space Ratio     | `void_ratio` **하한** — `asr_base` (적정여백율)   |
| **VirtualCanvas**  | —                         | 위상·농담·진동 단일 페이지 캔버스                 |
| **LayoutPolicy**   | —                         | 도메인별 교체 가능 배치 전략                      |
| **DepthProfile**   | —                         | `depth` → blur·opacity · `urgency` → z-index      |
| **AlarmState**     | —                         | RuleGuard 소유 경보 상태 머신 · urgency lock SSOT |
| **RuleGuard**      | Rule-based Guard Engine   | Phase 1 · **모드 무관** Safety                    |
| **AestheticTuner** | AI Aesthetic Fine-tuner   | Phase 2 · `intelligent` 전용                      |
| **NIXIE Agent**    | —                         | M2P 채널 센서 융합 입력 (MVP: 가상 시뮬)          |

---

## 아키텍처 개요

**핵심 명제**: _여백은 자신감이다._ — 정보 과부하를 **여백·깊이·선명도**로 통제한다.

### 시스템 계층

```
BAX  Breathing AI Experience
 ├── ATS  Aesthetic Tuning Settings   ← 영속 (ASR·Depth·Vibration)
 ├── M2P  Matrix-to-Peripheral       ← 실시간 의지 (v2 패킷 · NIXIE)
 └── MAE  Matrix Aesthetic Engine
       ├── RuleGuard        ← Phase 1 Safety (모든 bax_mode)
       ├── AestheticTuner   ← Phase 2 (intelligent)
       ├── LayoutPolicy     ← BLOCK 컴포넌트 배치
       └── DepthProfile     ← 시각값 (+ ATS 튜닝)
```

### 입력 3계층

| 계층     | 역할                                            | 지속성     | MVP UI         |
| -------- | ----------------------------------------------- | ---------- | -------------- |
| **기획** | LayoutPolicy · `bax_mode` preset · 의미 속성    | 배포 단위  | Policy 교체    |
| **ATS**  | ASR 선호 · Depth · Vibration                    | **영속**   | Settings T0–T3 |
| **M2P**  | `void_ratio_delta` · `focus_blur_scale` · light | **실시간** | S1–S3 · NIXIE  |

> M2P ≠ ATS. 순간 호흡은 M2P, baseline 조율은 ATS.

### 데이터 흐름

```
Input (ATS · M2P · NIXIE · 센서)
  → Context Merge (bax_mode + ATS + M2P)
  → [모든 모드] RuleGuard → AlarmState → urgency
  → [intelligent] AestheticTuner → void/blur delta
  → OVERLAY 분리 → LayoutPolicy(BLOCK) → DepthProfile(+ATS)
  → resolveAsrBase + applySafeZone (G2)
  → Guardrails G1–G5 → VirtualCanvas (BLOCK Grid + OVERLAY absolute)
```

---

## MVP 범위

**검증 질문**: 의미 속성만 선언하면 MAE가 Grid·시각값을 결정하고 VirtualCanvas가 **≤300ms** easing으로 호흡하는가?

| In scope                              | Out of scope                    |
| ------------------------------------- | ------------------------------- |
| Anchor·Frame·Sentinel·Sparkline (4종) | 다페이지 · nexage 강제          |
| ATS + M2P 2패널 · LayoutPolicy 1종    | 다중 Policy · ATS 클라우드 sync |
| RuleGuard(모드 무관) + AestheticTuner | SSE · Grade3 · 다중 IoT         |
| M2P v2 · NIXIE 가상 시뮬              | 실물 NIXIE · M2P HW             |
| Sparkline(V1) · Circuit Gate          | V3 Audio · WCAG 인증            |

---

## 1. 설계 원칙

### AXON 원칙 3

컴포넌트(세포)는 **의미 속성만** 선언. MAE(두뇌)가 배치·blur·opacity·z-index를 결정한다.

### 핵심 3원소

| 원소     | SSOT                    | 역할                  |
| -------- | ----------------------- | --------------------- |
| **위상** | `layout` (MAE)          | Grid·배치·z-index     |
| **농담** | `void_ratio` · **ASR**  | `asr_base` 하한       |
| **진동** | V1 Sparkline · V2 micro | Circuit Open → G5 OFF |

### 1.1 컴포넌트 의미 속성

#### ① depth (불변) — blur·opacity 결정 (C1)

| 값  | blur            | opacity      |
| --- | --------------- | ------------ |
| FG  | **0 고정**      | **1.0 고정** |
| MID | 모드·scale 가변 | 모드 가변    |
| BG  | 높음            | 낮음         |

> urgency는 blur·opacity에 **영향 없음**.

#### ② urgency (가변) — z-index·배치 (C1)

| 값       | LayoutPolicy | z-index   |
| -------- | ------------ | --------- |
| CRITICAL | 최대 면적    | +10 boost |
| HIGH     | 확장 시도    | +3        |
| NORMAL   | 기본         | 0         |
| NONE     | 최소         | −2        |

> **AlarmState를 통해서만** CRITICAL/HIGH로 상승. M2P·AestheticTuner·`bax_mode`로 urgency 상승 **불가**.

#### ③ priority · ④ mutability · ⑤ layer · ⑥ minWidth

| `layer`     | Grid            | G1/G4    | 예               |
| ----------- | --------------- | -------- | ---------------- |
| **BLOCK**   | 참여            | 적용     | Anchor, Sentinel |
| **OVERLAY** | **미참여** (C3) | **제외** | Frame, Sparkline |

| 컴포넌트      | priority   | urgency         | depth | mutability | layer       | minWidth |
| ------------- | ---------- | --------------- | ----- | ---------- | ----------- | -------- |
| **Anchor**    | TEXTURE    | NONE            | BG    | IMMUTABLE  | BLOCK       | —        |
| **Frame**     | TEXTURE    | NONE            | FG    | IMMUTABLE  | **OVERLAY** | —        |
| **Sentinel**  | ESSENTIAL  | NORMAL→CRITICAL | FG    | MUTABLE    | BLOCK       | 300px    |
| **Sparkline** | CONTEXTUAL | —               | FG    | MUTABLE    | **OVERLAY** | —        |

### 1.2 가드레일 G1–G5

| #   | 규칙                                                                              |
| --- | --------------------------------------------------------------------------------- |
| G1  | BLOCK TEXTURE 면적 ≤20%. OVERLAY 제외                                             |
| G2  | `void_ratio ≥ asr_base` + Sentinel minWidth — **Safe-Zone > ASR** (`asrOverride`) |
| G3  | tick당 MUTABLE 재배치 ≤1                                                          |
| G4  | BLOCK 동일 셀 → z-index · spillover. OVERLAY 제외                                 |
| G5  | Circuit Open → V1/V2 OFF. RuleGuard·AlarmState 유지                               |

> > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > >

### 1.3 컴포넌트 개발 가이드

**"세포(컴포넌트)는 두뇌(MAE 엔진)를 몰라야 한다"**

컴포넌트 TSX는 **의미 속성 선언 + 콘텐츠 렌더**만 담당한다. Grid·blur·z-index·urgency 변경은 **MAE 파이프라인**이 처리한다.

#### 1.3.1 `ComponentDeclaration` 필드 · 기본값

| 필드         | 타입     | 필수   | **기본값** (미지정 시) | 허용값                                                         | MAE 사용                        | 개발 시 챙길 것                                         |
| ------------ | -------- | ------ | ---------------------- | -------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------- |
| `id`         | `string` | ✅     | — (필수)               | 고유 kebab-case · MVP: `anchor` `frame` `sentinel` `sparkline` | 배치·CSS hook                   | VirtualCanvas registry에 등록                           |
| `priority`   | enum     | ✅     | **`CONTEXTUAL`**       | `ESSENTIAL` · `CONTEXTUAL` · `TEXTURE`                         | LayoutPolicy 우선순위 · G1 면적 | 정보 핵심 → ESSENTIAL · 장식 → TEXTURE                  |
| `urgency`    | enum     | ✅     | **`NORMAL`**           | `CRITICAL` · `HIGH` · `NORMAL` · `NONE`                        | z-index · LayoutPolicy          | **컴포넌트에서 set 금지** · RuleGuard→AlarmState만 갱신 |
| `depth`      | enum     | ✅     | **`MID`**              | `FG` · `MID` · `BG`                                            | blur · opacity (C1)             | 선언 후 **변경 금지** (불변)                            |
| `mutability` | enum     | ✅     | **`MUTABLE`**          | `IMMUTABLE` · `MUTABLE`                                        | G3 재배치 허용                  | 장식·틀 → IMMUTABLE                                     |
| `layer`      | enum     | ✅     | **`BLOCK`**            | `BLOCK` · `OVERLAY`                                            | Grid 참여 여부 (C3)             | 격자·데코 오버레이 → **OVERLAY**                        |
| `minWidth`   | `number` | 조건부 | **`undefined`**        | px · ESSENTIAL만                                               | G2 Safe-Zone · track 역산       | ESSENTIAL + 가독성 필수 시만 · OVERLAY **설정 금지**    |

**priority별 urgency 권장 초기값**:

| `priority`   | 권장 초기 `urgency` | 비고                                         |
| ------------ | ------------------- | -------------------------------------------- |
| `ESSENTIAL`  | `NORMAL`            | AlarmState 연동 대상 (`sentinel`)            |
| `CONTEXTUAL` | `NORMAL`            | Layout 재배치 없음 · z-index만 (`sparkline`) |
| `TEXTURE`    | **`NONE`**          | 배경·장식 (`anchor` · `frame`)               |

#### 1.3.2 MVP 4컴포넌트 등록 SSOT

| `id`        | `priority` | 초기 `urgency` | `depth` | `mutability` | `layer` | `minWidth` | 등록 예시                                  |
| ----------- | ---------- | -------------- | ------- | ------------ | ------- | ---------- | ------------------------------------------ |
| `anchor`    | TEXTURE    | NONE           | BG      | IMMUTABLE    | BLOCK   | —          | `declareBaxComponent('anchor', { ... })`   |
| `frame`     | TEXTURE    | NONE           | FG      | IMMUTABLE    | OVERLAY | —          | Grid·G1·G4 **미참여**                      |
| `sentinel`  | ESSENTIAL  | NORMAL         | FG      | MUTABLE      | BLOCK   | **300**    | AlarmState `component_id` 대상             |
| `sparkline` | CONTEXTUAL | NORMAL         | FG      | MUTABLE      | OVERLAY | —          | Sentinel DOM 내부 합성 · parent `sentinel` |

```ts
// src/components/registry.ts — MVP SSOT
export const MVP_COMPONENT_DECLARATIONS: ComponentDeclaration[] = [
  { id: 'anchor', priority: 'TEXTURE', urgency: 'NONE', depth: 'BG', mutability: 'IMMUTABLE', layer: 'BLOCK' },
  { id: 'frame', priority: 'TEXTURE', urgency: 'NONE', depth: 'FG', mutability: 'IMMUTABLE', layer: 'OVERLAY' },
  { id: 'sentinel', priority: 'ESSENTIAL', urgency: 'NORMAL', depth: 'FG', mutability: 'MUTABLE', layer: 'BLOCK', minWidth: 300 },
  { id: 'sparkline', priority: 'CONTEXTUAL', urgency: 'NORMAL', depth: 'FG', mutability: 'MUTABLE', layer: 'OVERLAY' },
]
```

#### 1.3.3 런타임 · ATS 초기값 (MVP 부트)

| 변수 / 설정            | 초기값                       | 비고                          |
| ---------------------- | ---------------------------- | ----------------------------- |
| `bax_mode`             | **`contextual`**             | DevController에서 전환        |
| `void_ratio`           | **`bax_mode` preset과 동일** | 아래 표 · M2P/AI는 delta만    |
| `focus_blur_scale`     | **`0.7`**                    | 0=선명 · 1=최대 blur (MID/BG) |
| `viewport_band`        | **`xl`**                     | ResizeObserver 갱신           |
| `circuit_state`        | **`closed`**                 | G5 테스트 시 `open`           |
| `canvas_scale`         | **`1.0`**                    | band별 §2.10                  |
| `hybrid_phase`         | **`idle`**                   | urgent / fine_tune            |
| `active_layout_policy` | **`default`**                | `DefaultLayoutPolicy`         |
| `alarmState.level`     | **`NONE`**                   | RuleGuard 소유                |

**`bax_mode`별 `void_ratio` · `asr_base` 초기값**:

| `bax_mode`      | `asr_base` | 권장 초기 `void_ratio` |
| --------------- | ---------- | ---------------------- |
| `meditation`    | 75         | **85**                 |
| `dense_monitor` | 25         | **30**                 |
| `contextual`    | 48         | **52**                 |
| `intelligent`   | 60         | **62**                 |

**`DEFAULT_AESTHETIC_TUNING` (ATS · localStorage 없을 때)**:

```ts
export const DEFAULT_AESTHETIC_TUNING: AestheticTuningSettings = {
  asrPreferenceOffset: 0,
  depthProfileTuning: { midBlurScale: 1.0, bgBlurScale: 1.0, fgMidContrast: 1.0 }, // preset: balanced
  vibrationProfile: {
    sparklineEnabled: true,
    sparklineIntensity: 2,
    microMotionEnabled: true,
    microMotionAmplitude: 30,
  },
}
```

#### 1.3.4 컴포넌트 TSX — 허용 · 금지

| ✅ 허용 (컴포넌트 내부)                       | ❌ 금지 (MAE/RuleGuard 영역)                        |
| --------------------------------------------- | --------------------------------------------------- |
| `ComponentDeclaration` export · registry 등록 | `grid-area` · `gridTemplate` 하드코딩               |
| MAE가 주입한 `--bax-*` CSS 변수 **소비**      | `blur` · `opacity` · `z-index` 직접 계산            |
| 콘텐츠·데이터 표시 (온도·라벨 등)             | `urgency` · `alarmState` **직접 변경**              |
| OVERLAY: `position:absolute` **수신** props   | M2P `void_ratio_delta`를 컴포넌트 state에 영속 저장 |
| `data-bax-id={id}` DOM hook                   | `margin_ratio` · M2P v1 필드                        |
| Circuit/G5에 따른 V1 unmount **수신**         | LayoutPolicy 로직 복제                              |

#### 1.3.5 컴포넌트별 주의 · 적용 가드레일

| 컴포넌트           | 주의사항                                           | 적용 가드레일                                                  |
| ------------------ | -------------------------------------------------- | -------------------------------------------------------------- |
| **Anchor**         | Giant 타이포·shadow만 · 배치 코드 없음             | G1 TEXTURE 면적 ≤20% · sm 시 **숨김 우선**                     |
| **Frame**          | **데모 전용** 6px 격자 · 실운영 배포 금지          | **G1·G2·G4 제외** (OVERLAY) · md opacity 50% · sm **unmount**  |
| **Sentinel**       | `minWidth`는 **선언만** — CSS width 직접 고정 금지 | **G2 Safe-Zone** 300/280/240px · AlarmState urgency **수신만** |
| **Sparkline**      | Sentinel 자식 OVERLAY · 독립 Grid 셀 금지          | **G5** Circuit Open → 즉시 unmount · **G1·G4 제외**            |
| **신규 ESSENTIAL** | `minWidth` 없으면 Safe-Zone 미보장                 | G2 협의 · DefaultLayoutPolicy track 역산                       |
| **신규 OVERLAY**   | BLOCK으로 두면 G1 면적·Grid 충돌                   | 반드시 `layer: OVERLAY`                                        |

#### 1.3.6 개발 체크리스트 (PR 전)

- [ ] `ComponentDeclaration`만 선언 · 좌표·blur·z-index 코드 없음
- [ ] `urgency` 변경 경로 없음 (AlarmState 외)
- [ ] OVERLAY → G1·G4 테스트 제외 확인
- [ ] ESSENTIAL → `minWidth` 또는 Safe-Zone 문서화
- [ ] IMMUTABLE → tick당 self-layout 변경 없음
- [ ] 진동(V1/V2) → `vibrationGate` 경유 · Circuit Open 시 OFF
- [ ] registry 등록 · VirtualCanvas mount 확인

  > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > >

---

## 1.5 ATS (Aesthetic Tuning Settings)

영속 설정. `useAestheticSettingsStore` · localStorage key `bax.ats.v1` · NEXA: `userSettingsStore.aestheticTuning`

### 1.5.1 ATS 스키마 SSOT

```ts
interface AestheticTuningSettings {
  asrPreferenceOffset: number // 0–15 → preset asr_base 가산
  depthProfileTuning: {
    midBlurScale: number // 0.5–2.0
    bgBlurScale: number
    fgMidContrast: number // 0.5–1.5
  }
  vibrationProfile: {
    sparklineEnabled: boolean
    sparklineIntensity: 0 | 1 | 2
    microMotionEnabled: boolean
    microMotionAmplitude: number // 0–100
  }
}
```

| UI              | 필드                       | 효과                      |
| --------------- | -------------------------- | ------------------------- |
| T0 ASR 선호     | `asrPreferenceOffset`      | +0~+15 on `asr_base`      |
| T1 Depth        | preset soft/balanced/sharp | MID/BG blur · FG contrast |
| T2–T3 Vibration | sparkline · micro          | G5 우선                   |

### 1.5.2 ASR 선호도

```ts
function resolveAsrBase(mode: BaxOperationMode, band: ViewportBand, ats: AestheticTuningSettings): number {
  const base = BAX_MODE_PRESETS[mode].asr_base + ats.asrPreferenceOffset
  const withBand = base + VIEWPORT_DELTA[band]
  const floor = ASR_BAND_MIN[band] // xl/md: 65 · sm: 20
  return Math.min(95, Math.max(floor, withBand))
}
```

> ATS는 **baseline**. M2P `void_ratio_delta`는 순간 호흡. clamp 하한 = `resolveAsrBase(...)` (Safe-Zone 충돌 시 `asrOverride`로 일시 하회).

### 1.5.3 Depth Profile Tuning

```ts
function applyDepthTuning(values: VisualValues, depth: 'FG' | 'MID' | 'BG', tuning: AestheticTuningSettings['depthProfileTuning']): VisualValues {
  if (depth === 'MID') return { ...values, blurPx: values.blurPx * tuning.midBlurScale }
  if (depth === 'BG') return { ...values, blurPx: values.blurPx * tuning.bgBlurScale }
  if (depth === 'FG') return { ...values, opacity: clamp(values.opacity * tuning.fgMidContrast, 0, 1) }
  return values
}
```

| 컨트롤          | 범위    | Preset 매핑 (MVP)                   |
| --------------- | ------- | ----------------------------------- |
| MID blur scale  | 0.5–2.0 | soft 1.4 · balanced 1.0 · sharp 0.7 |
| BG blur scale   | 0.5–2.0 | soft 1.3 · balanced 1.0 · sharp 0.8 |
| FG–MID contrast | 0.5–1.5 | soft 0.9 · balanced 1.0 · sharp 1.2 |

### 1.5.4 Vibration 반응성

```ts
function applyVibrationProfile(gate: VibrationGate, profile: VibrationProfile): VibrationGate {
  if (!profile.sparklineEnabled) gate.disable('V1')
  else gate.setIntensity('V1', profile.sparklineIntensity)
  if (!profile.microMotionEnabled || profile.microMotionAmplitude === 0) gate.disable('V2')
  else gate.setAmplitude('V2', profile.microMotionAmplitude)
  return gate
}
```

| 설정                           | V1 Sparkline       | V2 Micro-motion      |
| ------------------------------ | ------------------ | -------------------- |
| `sparklineIntensity: 0`        | unmount            | —                    |
| `sparklineIntensity: 1`        | 저대비 thin stroke | —                    |
| `sparklineIntensity: 2`        | 기본 MVP           | —                    |
| `microMotionAmplitude: 0–30`   | —                  | 미세 pulse (TEXTURE) |
| `microMotionAmplitude: 31–100` | —                  | breathe (TEXTURE)    |

> **G5 > ATS** — Circuit Open 시 ATS vibration 설정 무시.

---

## 2. MAE 엔진

### 2.1 MaeContext (G1)

```ts
interface MaeContext {
  components: ComponentDeclaration[]
  bax_mode: BaxOperationMode
  viewport_band: 'xl' | 'md' | 'sm'
  circuit_state: 'closed' | 'open' | 'half_open'
  void_ratio: number
  focus_blur_scale: number // 0–1, MID·BG blur 스케일 (G3)
  light_source_x: number
  light_source_y: number
  aesthetic_tuning: AestheticTuningSettings
  layoutPolicy: LayoutPolicy
  depthProfile: DepthProfile
  alarmState: AlarmState // RuleGuard 소유 (G2)
  hybrid_phase: 'urgent' | 'fine_tune' | 'idle'
  canvas_scale: number
  active_layout_policy: string
  asrOverride?: boolean // Safe-Zone 발동 시 감사 플래그
}
```

### 2.2 AlarmState (G2 · R1)

`AlarmState`는 RuleGuard가 단독 소유·관리. AestheticTuner는 **읽기만** 가능.

```ts
type AlarmLevel = 'NONE' | 'HIGH' | 'CRITICAL'

interface AlarmState {
  level: AlarmLevel
  component_id: string | null
  raised_at: number | null
  source: string | null
  cleared_by: 'auto' | 'operator' | null
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
        │  센서 정상 / 운영자 해제           │  HIGH 5min → NORMAL
        ▼                                   │
    [NORMAL] ◄──────────────────────────────┘
```

| 트리거                                 | 현재 → 다음            | 주체        | 부수 효과                                                   |
| -------------------------------------- | ---------------------- | ----------- | ----------------------------------------------------------- |
| `sensor.value >= threshold` (80°C MVP) | NORMAL → CRITICAL      | RuleGuard   | urgency lock · LayoutPolicy 재실행 · `focus_blur_scale→1.0` |
| TTL 30s (센서 미복귀)                  | CRITICAL → HIGH        | RuleGuard   | 배치 유지 · Sparkline 재개 허용                             |
| 센서 정상 복귀                         | CRITICAL/HIGH → NORMAL | RuleGuard   | urgency 복귀 · 배치 복귀                                    |
| 운영자 명시 해제                       | CRITICAL/HIGH → NORMAL | Operator UI | 즉시 lock 해제                                              |
| HIGH 5min (센서 미복귀)                | HIGH → NORMAL          | RuleGuard   | 배치 복귀 · 기록 보존                                       |

> **안전 원칙**: urgency는 AlarmState를 통해서만 CRITICAL/HIGH. M2P·슬라이더·`bax_mode`로 상승 불가.

### 2.3 LayoutPolicy

```ts
interface LayoutPolicy {
  resolve(components: ComponentDeclaration[], ctx: MaeContext): ResolvedLayout
}

interface ResolvedLayout {
  gridTemplate: GridTemplate
  placements: ComponentPlacement[]
  overflowFallback?: boolean
}

interface ComponentPlacement {
  componentId: string
  gridArea: string
  minWidth?: number
}

interface GridTemplate {
  columns: string
  rows: string
  areas?: string
}
```

- 입력: **`layer: BLOCK`만** · OVERLAY는 VirtualCanvas가 별도 합성
- CRITICAL: ESSENTIAL 최대 면적 · sm: `SingleColumnFallback` (R3)
- `minWidth` → Grid track 역산 (G2)

**MVP DefaultLayoutPolicy 동작 규칙**:

```
우선순위:
1. AlarmState.level === 'CRITICAL' → ESSENTIAL·MUTABLE 최대 면적 셀
2. priority ESSENTIAL + minWidth → track 역산 배치
3. priority TEXTURE → 나머지 공간
4. viewport_band sm → 단일 열 · TEXTURE 숨김
5. void_ratio → asr_base 준수 · TEXTURE 먼저 축소

Grid overflow (R3):
- minWidth 합 > 가용 너비 → SingleColumnFallback
- 발동 시 asrOverride 플래그 설정 가능
```

| 도메인 (예)    | Policy                | Grid 구성                          |
| -------------- | --------------------- | ---------------------------------- |
| IoT 관제 (MVP) | `DefaultLayoutPolicy` | 2열: TEXTURE 배경 + ESSENTIAL 전면 |

### 2.4 DepthProfile (C1 · G3)

```ts
interface DepthProfile {
  resolve(
    depth: 'FG' | 'MID' | 'BG',
    alarmLevel: AlarmLevel,
    mode: BaxOperationMode,
    scale: number, // ctx.focus_blur_scale
  ): VisualValues
}

interface VisualValues {
  blurPx: number // 0–60
  opacity: number // 0.03–1.0
  zIndex: number // 1–20
}
```

**역할 경계 (C1)**:

- `blurPx`·`opacity` → **`depth`만** · urgency 무관
- `zIndex` → depth base + urgency 가중치 (AlarmState.level → 컴포넌트 urgency 동기)
- FG: blur=0 · opacity=1.0 **고정** (mode·scale 무관)

**focus_blur_scale 공식 (G3)**:

```ts
function applyScale(basePx: number, depth: string, scale: number): number {
  if (depth === 'FG') return 0
  return Math.round(basePx * scale)
}
// 최종: blurPx = applyScale(basePx[depth, mode], depth, scale) × atsTuning
```

**DefaultDepthProfile 변환 기준**:

| depth | blur base      | `bax_mode`                   | opacity | z-index base |
| ----- | -------------- | ---------------------------- | ------- | ------------ |
| FG    | 0 (scale 무시) | 모든 모드                    | 1.00    | 10           |
| MID   | 20px           | `meditation`                 | 0.30    | 5            |
| MID   | 4px            | `dense_monitor`              | 0.60    | 5            |
| MID   | 10px           | `contextual` / `intelligent` | 0.40    | 5            |
| BG    | 60px           | `meditation`                 | 0.03    | 1            |
| BG    | 20px           | `dense_monitor`              | 0.10    | 1            |
| BG    | 40px           | `contextual` / `intelligent` | 0.05    | 1            |

**urgency → z-index 최종값**:

| urgency  | 가중치 | FG     | MID | BG        |
| -------- | ------ | ------ | --- | --------- |
| CRITICAL | +10    | **20** | 15  | 11        |
| HIGH     | +3     | 13     | 8   | 4         |
| NORMAL   | 0      | 10     | 5   | 1         |
| NONE     | −2     | 8      | 3   | 1 (min 1) |

### 2.5 RuleGuard (C4)

**모든 `bax_mode` · 매 센서 tick** 실행. AestheticTuner는 `intelligent`만.

```
RuleGuard.evaluate(sensor, alarmState)
  → CRITICAL: LayoutPolicy 재실행 · focus_blur_scale → 1.0 · phase urgent
  → NORMAL 복귀: 배치 복귀 · phase urgent
intelligent → AestheticTuner (void_ratio_delta · focus_blur_scale only)
```

> `meditation`에서도 임계 초과 시 Sentinel CRITICAL · LayoutPolicy 재배치. **Safety > 여백**.

### 2.6 상태 변수 SSOT

| 변수               | 타입       | 범위                  | 설명                                                  |
| ------------------ | ---------- | --------------------- | ----------------------------------------------------- |
| `void_ratio`       | int        | 0–100                 | 현재 공백률 · ≥ `asr_base` (asrOverride 시 일시 하회) |
| `asr_base`         | int        | 20–95                 | `resolveAsrBase(bax_mode, band, ats)`                 |
| `focus_blur_scale` | float      | 0–1                   | S2 / M2P v2                                           |
| `bax_mode`         | enum       | §2.9                  | DepthProfile·ASR preset                               |
| `viewport_band`    | enum       | xl·md·sm              | ResizeObserver                                        |
| `canvas_scale`     | float      | 0.85–1.15             | VirtualCanvas 위상                                    |
| `circuit_state`    | enum       | closed·open·half_open | G5                                                    |
| `alarmState`       | AlarmState | §2.2                  | RuleGuard 소유                                        |
| ~~`margin_ratio`~~ | —          | **폐기**              | M2P v2 `void_ratio_delta`                             |

**CSS**: `:root` — `--bax-void-ratio`, `--bax-canvas-scale`, `--bax-focus-blur-scale`  
Grid: VirtualCanvas `style.gridTemplateColumns/Rows` 직접 주입.

### 2.7 MAE 파이프라인

```
Context Merge → RuleGuard (all modes)
  → syncUrgencyFromAlarm
  → vibrationGate(G5 + ATS.vibrationProfile)
  → OVERLAY 분리
  → LayoutPolicy(BLOCK) → densityAdaptive
  → runGuardrails(G1–G4) → applySafeZone(G2)
  → DepthProfile(+ATS) per placement
  → BLOCK: CSS Grid · OVERLAY: position absolute
  → setCssVars · animate(300ms)
```

### 2.8 M2P v2 (C2 · R4)

```json
{
  "v": 2,
  "source": "peripheral | sim-slider | nixie-agent",
  "ts": 1710000000000,
  "void_ratio_delta": 5,
  "focus_blur_scale": 0.7
}
```

| 필드               | 범위    | 설명                               |
| ------------------ | ------- | ---------------------------------- |
| `void_ratio_delta` | −10~+10 | `void_ratio += delta` 후 ASR clamp |
| `focus_blur_scale` | 0–1     | MID·BG blur (FG 무시)              |

```ts
void_ratio = clamp(void_ratio + delta, resolveAsrBase(...), 100)
```

- 지연 **p95 ≤ 50ms**
- NIXIE Agent: 동일 포맷 WebSocket · MVP `nixieSimulator.ts`
- Serial: JSON line → `M2PPacketV2` parse

### 2.9 BAX 운영 모드

| `bax_mode`      | `asr_base` | 전략                                         |
| --------------- | ---------- | -------------------------------------------- |
| `meditation`    | **75**     | 여백·호흡 극대 · void 목표 85–90             |
| `dense_monitor` | **25**     | 밀집 관제                                    |
| `contextual`    | **48**     | FG/MID 대비                                  |
| `intelligent`   | **60**     | AestheticTuner · fail → dense_monitor values |

> 모드 전환 = DepthProfile·ASR만. AlarmState·RuleGuard는 **모드 무관**.

### 2.10 반응형 ASR · Safe-Zone

```ts
const VIEWPORT_DELTA = { xl: 0, md: -2, sm: -5 } as const
const ASR_BAND_MIN = { xl: 65, md: 65, sm: 20 } as const
const ASR_ABSOLUTE_MIN = 20 // 전 band 절대 하한 (Safe-Zone asrOverride 시에만 실질 하회)
```

| band | 조건       | ASR             | Layout                            |
| ---- | ---------- | --------------- | --------------------------------- |
| xl   | ≥1280px    | preset + ATS    | 기본 2열                          |
| md   | 768–1279px | −2 (min 65)     | Frame OVERLAY opacity 50%         |
| sm   | <768px     | −5 (min **20**) | Frame 숨김 · SingleColumnFallback |

**밀도 적응 (`densityAdaptive`)**:

1. `asr_base = resolveAsrBase(...)`
2. `void_ratio = clamp(proposed, asr_base, 100)` — Safe-Zone 충돌 시 asrOverride
3. `sm` → TEXTURE 우선 숨김
4. 정보 면적 > 가용 30% → MID blur +1단계 (G1)
5. `applySafeZone` — Sentinel minWidth 강제

**VirtualCanvas Topology**:

| band | `canvas_scale` | blur_scale |
| ---- | -------------- | ---------- |
| xl   | 1.00           | 1.00       |
| md   | 0.95           | 0.90       |
| sm   | 0.88           | 0.80       |

**가독성 Safe-Zone (G2)**:

| 대상          | 규칙         | MVP SSOT                          | sm                         |
| ------------- | ------------ | --------------------------------- | -------------------------- |
| Sentinel      | `min-width`  | **300px**                         | **280px** (절대 **240px**) |
| Sentinel      | `min-height` | **120px**                         | 100px                      |
| Sentinel 본문 | `font-size`  | **≥1.25rem**                      | 동일                       |
| Anchor/Frame  | —            | Safe-Zone 미적용 · 먼저 축소·숨김 | —                          |

```ts
const SAFE_ZONE_MIN_WIDTH = { xl: 300, md: 300, sm: 280 } as const
const SAFE_ZONE_ABSOLUTE_MIN = 240

function applySafeZone(layout: ResolvedLayout, ctx: MaeContext): ResolvedLayout {
  const sentinel = layout.placements.find((p) => p.componentId === 'Sentinel')
  const minW = Math.max(SAFE_ZONE_MIN_WIDTH[ctx.viewport_band], SAFE_ZONE_ABSOLUTE_MIN)
  const allocated = measureTrackWidth(layout, sentinel)

  if (allocated < minW) {
    ctx.asrOverride = true
    return expandSentinelTrack(layout, sentinel!, minW)
  }
  return layout
}
```

> **우선순위**: Safe-Zone > ASR % — Sentinel 가독성 확보 시 `void_ratio` 목표 일시 포기.

### 2.11 진동

| 계층                                | 구현                           | Circuit Open |
| ----------------------------------- | ------------------------------ | ------------ |
| V0 정적                             | blur · light · shadow          | 유지         |
| V1 Sparkline (OVERLAY · CONTEXTUAL) | Sentinel 하단 합성             | **OFF**      |
| V2 Micro-motion (TEXTURE)           | opacity pulse · border breathe | **OFF**      |
| V3 Audio                            | 후속                           | OFF          |

**G5 — vibrationGate**:

```
circuitState === 'open' OR mainFps p50 < 24 (3s window)
  → sparkline unmount · micro class removed · Sentinel 텍스트만
  → RuleGuard · AlarmState 유지

circuitState === 'closed' AND FPS 정상
  → applyVibrationProfile(ats.vibrationProfile)
```

### 2.12 Layout 점유 (BLOCK only)

OVERLAY 제외.

**동일 셀 z-index**:

| 순위 | priority   | urgency       |
| ---- | ---------- | ------------- |
| 1    | ESSENTIAL  | CRITICAL/HIGH |
| 2    | CONTEXTUAL | \*            |
| 3    | TEXTURE    | NONE          |

동일 순위 → `componentId` lexicographic.

**Adjacent Spillover**:

```
ESSENTIAL 충돌 시:
1. LayoutPolicy.resolve() 재호출
2. 빈 영역 우선 · FG depth 유지
3. spillover 1건/tick (G3)
4. 후보 없음 → z-index stack + minWidth Safe-Zone
```

### 2.13 하이브리드 2단계

| Phase       | 주체           | 허용                                    | 금지               |
| ----------- | -------------- | --------------------------------------- | ------------------ |
| `urgent`    | RuleGuard      | urgency · layout · focus_blur_scale→1.0 | void delta ±5 초과 |
| `fine_tune` | AestheticTuner | void_ratio_delta · focus_blur_scale     | urgency · layout   |
| idle        | —              | —                                       | —                  |

---

## 3. MVP 화면 · Dev Controller

단일 페이지. **이동·라우팅 없음.**  
컴포넌트 선언·기본값·가드레일 → **§1.3** 참조.

| ID     | 이름          | 의미 속성                                               | 배치 (MAE)                     | UI 스펙                                       |
| ------ | ------------- | ------------------------------------------------------- | ------------------------------ | --------------------------------------------- |
| Comp A | **Anchor**    | TEXTURE·NONE·BG·IMMUTABLE·**BLOCK**                     | BG 전체                        | 15vw Giant 타이포 · `light_source` box-shadow |
| Comp B | **Frame**     | TEXTURE·NONE·FG·IMMUTABLE·**OVERLAY**                   | Grid 비점유 absolute           | 6px monospace 격자 (**데모 전용**)            |
| Comp C | **Sentinel**  | ESSENTIAL·NORMAL→CRITICAL·FG·MUTABLE·BLOCK·minWidth 300 | 기본 우측 · CRITICAL 최대 면적 | 온도·상태 카드 · min-height 120px             |
| Comp D | **Sparkline** | CONTEXTUAL·FG·MUTABLE·**OVERLAY**                       | Sentinel 내부 하단 합성        | V1 stroke · G5 OFF 시 unmount                 |

> Sentinel CRITICAL: 컴포넌트 코드 변경 없이 AlarmState → LayoutPolicy → 배치 연쇄.

### 3.1 Dev Controller (우하단 · 2패널)

| 패널        | MVP 컨트롤                                                                                                             |
| ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| **ATS**     | T0 ASR 선호 · T1 Depth preset · T2 Sparkline · T3 Micro-motion                                                         |
| **M2P Sim** | S1 `void_ratio_delta` · S2 `focus_blur_scale` · S3 `light_source_x/y`                                                  |
| **공통**    | `bax_mode` · 경고 발생/해제 · 가상 센서 tick · Ollama on/off · viewport band · LayoutPolicy 교체 · **AlarmState 표시** |

| ID  | 명칭          | 변수               | 계층 |
| --- | ------------- | ------------------ | ---- |
| S1  | 보이드 레이트 | `void_ratio_delta` | M2P  |
| S2  | 미드 포커스   | `focus_blur_scale` | M2P  |
| S3  | 라이트 앵글   | `light_source_x/y` | M2P  |

> `bax_mode`는 `useBaxStore` · ATS는 `useAestheticSettingsStore` — **Store 분리**.

### 3.2 CONTEXTUAL 검증 시나리오 (R2)

MVP에서 Sparkline으로 CONTEXTUAL·Vibration·Circuit Gate를 검증한다.

| 단계 | 조건                                     | 기대 결과                                        | FR         |
| ---- | ---------------------------------------- | ------------------------------------------------ | ---------- |
| 1    | `sparklineEnabled=true` · Circuit closed | Sparkline 렌더 · Sentinel 하단                   | FR-11      |
| 2    | ATS `sparklineIntensity` 0→2             | stroke 대비 변화                                 | FR-17      |
| 3    | Circuit → open                           | Sparkline **즉시** unmount · Sentinel 숫자 유지  | FR-11 · G5 |
| 4    | Circuit → closed · FPS ≥24               | ATS intensity 재적용                             | NFR-05     |
| 5    | OVERLAY 확인                             | G1 TEXTURE 20% 계산에 Frame·Sparkline **미포함** | FR-14      |

---

## 4. 기능 요구사항 (FR)

| ID        | 요구사항             | Acceptance Criteria                                                                                |
| --------- | -------------------- | -------------------------------------------------------------------------------------------------- |
| **FR-01** | 의미 기반 동적 Grid  | 4컴포넌트 의미 속성만 선언 → MAE가 Grid·배치 결정 · 9칸 좌표·`matrix_id` 없음                      |
| **FR-02** | 호흡형 blur/void     | `meditation` void 85–90 · `void_ratio ≥ asr_base` clamp · MID blur↑ · 전환 **≤300ms**              |
| **FR-03** | urgency 기반 재배치  | AlarmState NORMAL→CRITICAL → LayoutPolicy 재실행 · CRITICAL 시 `focus_blur_scale=1.0` · **≤300ms** |
| **FR-04** | 가드레일 G1–G5       | ASR · Safe-Zone 300px · BLOCK Layout 점유 · Entropy 1/tick · Vibration Gate                        |
| **FR-05** | M2P v2 수신          | S1–S3 = M2P 패킷 동일 · WS/Serial ingest · `void_ratio_delta` ASR clamp                            |
| **FR-06** | 하이브리드 2단계     | Phase 1 RuleGuard 즉시 · Phase 2 void/blur만 · AlarmState urgency lock                             |
| **FR-07** | Fallback             | AestheticTuner fail/timeout → Phase 1 유지 · RuleGuard SSOT                                        |
| **FR-08** | BAX 운영 모드        | 4모드 · DepthProfile·ASR 변경 · **meditation에서도** CRITICAL Safety                               |
| **FR-09** | 반응형 ASR/Topology  | ResizeObserver · xl/md ASR≥65 · sm ASR≥20 · Safe-Zone · SingleColumnFallback · asrOverride         |
| **FR-10** | Layout 점유/분산     | BLOCK 동일 셀 z-index · spillover 1/tick · §2.12                                                   |
| **FR-11** | 진동 + Circuit       | Sparkline/micro on · Circuit OPEN → V1/V2 OFF · Sentinel 텍스트 유지                               |
| **FR-12** | LayoutPolicy 교체    | 런타임 Policy 교체 · 컴포넌트 선언 변경 없이 Grid 재구성                                           |
| **FR-13** | AlarmState 상태 머신 | CRITICAL/HIGH/NORMAL 전이 5종 · TTL 30s · 운영자 해제 · §2.2                                       |
| **FR-14** | OVERLAY 렌더링       | Frame·Sparkline Grid 비점유 · G1·G4 제외 확인                                                      |
| **FR-15** | ATS ASR 선호         | `asrPreferenceOffset` +0~+15 · `resolveAsrBase` · localStorage 영속                                |
| **FR-16** | ATS Depth tuning     | preset soft/balanced/sharp · `applyDepthTuning`                                                    |
| **FR-17** | ATS Vibration        | V1 intensity · V2 amplitude · G5 > ATS · Circuit 복구 후 재적용                                    |

### 4.1 비기능 요구사항 (NFR)

| ID         | 항목           | 기준                                                                                       |
| ---------- | -------------- | ------------------------------------------------------------------------------------------ |
| **NFR-01** | FPS            | 전환 중 p50 ≥ **24**                                                                       |
| **NFR-02** | AestheticTuner | timeout **3s** → fallback (FR-07)                                                          |
| **NFR-03** | 오프라인       | AestheticTuner 없이 규칙+모드+ATS 100%                                                     |
| **NFR-04** | 반응형         | band 변경 · Sentinel ≥ Safe-Zone · **xl/md void≥65** · **sm void≥20** · 또는 `asrOverride` |
| **NFR-05** | Circuit        | OPEN 시 V1/V2 **0 frame** 추가 · FPS 회복 후 ATS 재적용                                    |
| **NFR-06** | Safety 응답    | RuleGuard 임계 → 화면 반영 **≤300ms** (모든 bax_mode)                                      |
| **NFR-07** | ATS/M2P        | ATS 영속 · M2P 슬라이더 **비영속**                                                         |

---

## 5. AestheticTuner (intelligent · Phase 2)

### 5.1 역할 분담

| 계층                | Phase     | 책임                                                    |
| ------------------- | --------- | ------------------------------------------------------- |
| **RuleGuard**       | urgent    | AlarmState · urgency · LayoutPolicy (모드 무관)         |
| **AestheticTuner**  | fine_tune | `void_ratio_delta` · `focus_blur_scale` (intelligent만) |
| **guardrails**      | both      | G1–G5 · Phase 2 structural strip                        |
| **layoutOccupancy** | both      | BLOCK spillover                                         |

### 5.2 API

```
POST http://localhost:11434/api/generate
Content-Type: application/json
{ "model": "llama3", "format": "json", "stream": false, "prompt": "..." }
```

### 5.3 MaeDecision 출력 스키마

**Phase 1 (RuleGuard — 코드 생성, LLM 아님)**:

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

> `urgency`, `layout_policy`, `grid_template` 포함 시 MAE가 **strip**.

**Prompt (fine_tune)**:

```
Phase fine_tune ONLY.
AlarmState is LOCKED by RuleGuard. urgency cannot be changed.
Layout decisions are LOCKED.
Return JSON only: { "phase", "target_component", "void_ratio_delta", "focus_blur_scale" }.
void_ratio_delta: -10 to +10. focus_blur_scale: 0.0 to 1.0.
Ensure final void_ratio >= asr_base after delta.
No urgency. No layout fields. No prose.
Input: sensor={value}°C · void_ratio={current} · asr_base={floor} · mode={bax_mode}
```

### 5.4 시나리오 예

| 입력      | Phase 1 (0ms)                            | Phase 2 (지연)       |
| --------- | ---------------------------------------- | -------------------- |
| 72°C 정상 | NORMAL 유지                              | delta 0 · scale 0.7  |
| 85°C 임계 | **CRITICAL · Layout 재배치 · scale 1.0** | delta −3 · scale 1.0 |
| 76°C 복귀 | **NORMAL · 배치 복귀**                   | delta +2 · scale 0.8 |

---

## 6. 기술 스택 · 저장소

| 항목   | MVP                                  | 비고                    |
| ------ | ------------------------------------ | ----------------------- |
| App    | `apps/bax-demo` (Vite + React)       | monorepo 독립           |
| Style  | Tailwind + CSS variables + 동적 Grid | MAE가 gridTemplate 주입 |
| Motion | Framer Motion 또는 GSAP              | **300ms** SSOT          |
| AI     | Ollama local                         | 클라우드 API 금지       |
| HW     | Web Serial (선택)                    | Arduino → M2P v2        |

```
apps/bax-demo/
├── package.json                          # @role BAX MVP 실험 앱 루트 — Vite+React · MAE·ATS·M2P 통합 데모
├── src/
│   ├── canvas/
│   │   └── VirtualCanvas.tsx             # @role 동적 CSS Grid + OVERLAY 합성 · MAE gridTemplate/CSS vars mount
│   ├── components/
│   │   ├── registry.ts                   # @role MVP ComponentDeclaration 4종 registry (§1.3.2)
│   │   ├── Anchor.tsx                    # @role Comp A · BLOCK TEXTURE BG · Giant 타이포
│   │   ├── Frame.tsx                     # @role Comp B · OVERLAY TEXTURE FG · 6px 격자 (데모 전용)
│   │   ├── Sentinel.tsx                  # @role Comp C · BLOCK ESSENTIAL · AlarmState urgency 수신 · G2
│   │   └── Sparkline.tsx                 # @role Comp D · OVERLAY CONTEXTUAL V1 · G5 unmount
│   ├── settings/
│   │   └── useAestheticSettingsStore.ts  # @role ATS 영속 Store · T0–T3 · localStorage bax.ats.v1
│   ├── store/
│   │   └── useBaxStore.ts                # @role 런타임 Store (비영속) · bax_mode · void · M2P
│   ├── engine/
│   │   ├── MaeContext.ts                 # @role MaeContext 타입 · 초기값 factory (G1)
│   │   ├── alarmState.ts                 # @role AlarmState 상태 머신 · RuleGuard 소유 (G2·R1)
│   │   ├── LayoutPolicy/
│   │   │   ├── index.ts                  # @role LayoutPolicy public API re-export
│   │   │   ├── types.ts                  # @role ResolvedLayout · GridTemplate 타입
│   │   │   ├── DefaultLayoutPolicy.ts    # @role MVP 2열 · CRITICAL · overflow fallback (부록 D)
│   │   │   └── SingleColumnPolicy.ts     # @role sm 단일열 · R3 SingleColumnFallback
│   │   ├── DepthProfile/
│   │   │   ├── index.ts                  # @role DepthProfile public API re-export
│   │   │   ├── types.ts                  # @role VisualValues · DepthProfile 인터페이스
│   │   │   └── DefaultDepthProfile.ts    # @role depth→blur/opacity · urgency→z-index (C1)
│   │   ├── applyAestheticState.ts          # @role MAE 파이프라인 orchestrator (부록 B)
│   │   ├── baxModePresets.ts             # @role 4모드 asr_base · void 초기값 preset
│   │   ├── guardrails/
│   │   │   ├── asrPolicy.ts              # @role G2 · void_ratio ≥ asr_base clamp
│   │   │   ├── readabilitySafeZone.ts    # @role G2 · Sentinel 300/280/240px · asrOverride
│   │   │   ├── sizePolicy.ts             # @role G1 · BLOCK TEXTURE 면적 ≤20%
│   │   │   ├── entropyBrake.ts           # @role G3 · tick당 재배치 ≤1
│   │   │   └── vibrationGate.ts          # @role G5 · Circuit Open V1/V2 OFF
│   │   ├── layoutOccupancy.ts            # @role G4 · 동일 셀 z-index · spillover
│   │   ├── hybridEvaluate.ts             # @role Phase1 RuleGuard + Phase2 AestheticTuner (부록 C)
│   │   ├── densityAdaptive.ts            # @role sm TEXTURE 숨김 · blur 적응
│   │   ├── viewportScale.ts              # @role band별 canvas_scale · ResizeObserver
│   │   └── ruleEngine.ts                 # @role RuleGuard evaluate · 임계 80°C (C4)
│   ├── m2p/
│   │   ├── types.ts                      # @role M2PPacketV2 타입 SSOT
│   │   ├── wsClient.ts                   # @role M2P v2 WebSocket ingest
│   │   ├── serialClient.ts               # @role Web Serial → M2P v2 parse
│   │   └── nixieSimulator.ts             # @role NIXIE Agent 가상 WS (R4)
│   ├── ollama/
│   │   └── client.ts                     # @role AestheticTuner Ollama · timeout 3s
│   └── dev/
│       ├── DevController.tsx             # @role 공통 · AlarmState · 센서 tick · Policy 교체
│       ├── AestheticSettingsPanel.tsx    # @role ATS T0–T3 패널
│       └── M2pSimPanel.tsx               # @role M2P S1–S3 슬라이더 (비영속)
```

> 각 소스 파일 상단에 `@file` · `@role` · `@ssot` JSDoc 주석이 붙어 있다. `@guardrail`은 guardrails/ 하위 파일에 추가.

---

## 7. NEXA OS 정합

| BAX MVP       | NEXA V2.1                           | 관계                |
| ------------- | ----------------------------------- | ------------------- |
| ATS           | `userSettingsStore.aestheticTuning` | 설정 UI 연동        |
| VirtualCanvas | `nexage` · `NexaDashboardRenderer`  | MVP 후 흡수 검토    |
| AlarmState    | NEXA 경보 시스템                    | 경보 이벤트 → 전이  |
| G5            | `healthWatchdog` · `circuitState`   | 진동 최우선 OFF     |
| MaeDecision   | `packages/shared` Zod               | 흡수 시 schema 공유 |
| M2P v2 WS     | 채널 B Worker                       | ≠ Telemetry flood   |
| LayoutPolicy  | `domainLayoutRegistry`              | 도메인 Policy 확장  |

---

## 8. 현실성 · 리스크 · Go/No-Go

| 항목                    | 평가 | 메모                        |
| ----------------------- | ---- | --------------------------- |
| 의미 선언 체계          | 🟢   | 4컴포넌트 · 인터페이스 확정 |
| 동적 CSS Grid + OVERLAY | 🟢   | 표준 CSS                    |
| AlarmState              | 🟢   | 전이 5종 명확               |
| DefaultLayoutPolicy     | 🟢   | 부록 D 의사코드             |
| M2P v1→v2               | 🟡   | delta 필드 마이그레이션     |
| 6px Frame               | 🔴   | 데모 전용                   |
| M2P HW                  | 🔴   | MVP 이후                    |

**Go / No-Go**:

- [ ] FR-01–17 PASS
- [ ] NFR-01–07 PASS
- [ ] AlarmState 전이 5종 PASS (§2.2)
- [ ] R2 Sparkline 시나리오 5단계 PASS (§3.2)
- [ ] AestheticTuner off → FR-07 fallback
- [ ] LayoutPolicy 교체 · 컴포넌트 선언 무변경
- [ ] Frame·Sparkline OVERLAY · G1/G4 제외 (FR-14)
- [ ] meditation + 85°C → CRITICAL (FR-08)
- [ ] nexage 흡수 여부 결정

---

## 부록 A. 핵심 타입 정의

```ts
interface ComponentDeclaration {
  id: string
  priority: 'ESSENTIAL' | 'CONTEXTUAL' | 'TEXTURE'
  urgency: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'NONE'
  depth: 'FG' | 'MID' | 'BG'
  mutability: 'IMMUTABLE' | 'MUTABLE'
  layer: 'BLOCK' | 'OVERLAY'
  minWidth?: number
}

type BaxOperationMode = 'meditation' | 'dense_monitor' | 'contextual' | 'intelligent'
type ViewportBand = 'xl' | 'md' | 'sm'
type CircuitState = 'closed' | 'open' | 'half_open'

interface SensorReading {
  id: string
  value: number
  unit: string
  ts: number
}

interface MaeContext {
  /* §2.1 */
}
interface AlarmState {
  /* §2.2 */
}
interface AestheticTuningSettings {
  /* §1.5.1 */
}

interface VisualValues {
  blurPx: number
  opacity: number
  zIndex: number
}

interface LayoutPolicy {
  resolve(components: ComponentDeclaration[], ctx: MaeContext): ResolvedLayout
}

interface ResolvedLayout {
  gridTemplate: GridTemplate
  placements: ComponentPlacement[]
  overflowFallback?: boolean
}

interface UrgentDecision {
  phase: 'urgent'
  target_component: string
  urgency: AlarmLevel
  focus_blur_scale: number
}

interface FineTuneDecision {
  phase: 'fine_tune'
  target_component: string
  void_ratio_delta: number
  focus_blur_scale: number
}

type MaeDecision = UrgentDecision | FineTuneDecision

interface M2PPacketV2 {
  v: 2
  source: string
  ts: number
  void_ratio_delta: number
  focus_blur_scale: number
}
```

---

## 부록 B. applyAestheticState (의사코드)

```ts
function applyAestheticState(decision: MaeDecision, ctx: MaeContext) {
  if (ctx.circuit_state !== 'closed') {
    decision = stripVibrationLayers(decision)
  }
  if (decision.phase === 'fine_tune') {
    decision = stripStructuralFields(decision)
  }

  if ('void_ratio_delta' in decision && decision.void_ratio_delta != null) {
    ctx.void_ratio = clamp(ctx.void_ratio + decision.void_ratio_delta, resolveAsrBase(ctx.bax_mode, ctx.viewport_band, ctx.aesthetic_tuning), 100)
  }

  if (decision.phase === 'urgent' && ctx.alarmState.level === 'CRITICAL') {
    ctx.focus_blur_scale = 1.0
  }

  const blocks = ctx.components.filter((c) => c.layer === 'BLOCK')
  const overlays = ctx.components.filter((c) => c.layer === 'OVERLAY')

  let layout = ctx.layoutPolicy.resolve(blocks, ctx)
  layout = densityAdaptive(layout, ctx)
  layout = runGuardrails(layout, ctx)
  layout = applySafeZone(layout, ctx)

  for (const p of layout.placements) {
    const decl = ctx.components.find((c) => c.id === p.componentId)!
    const urgency = syncUrgencyFromAlarm(decl, ctx.alarmState)
    let visual = ctx.depthProfile.resolve(decl.depth, ctx.alarmState.level, ctx.bax_mode, ctx.focus_blur_scale)
    visual = applyDepthTuning(visual, decl.depth, ctx.aesthetic_tuning.depthProfileTuning)
    applyVisuals(p.componentId, visual, urgency)
  }

  applyGridTemplate(ctx.canvas, layout.gridTemplate)
  placeBlockComponents(layout.placements)

  const gate = applyVibrationProfile(createVibrationGate(), ctx.aesthetic_tuning.vibrationProfile)
  for (const comp of overlays) {
    applyOverlay(comp, ctx, gate)
  }

  setCssVars(ctx.void_ratio, ctx.focus_blur_scale, ctx.canvas_scale)
  animate({ durationMs: 300, ease: 'easeOut' })
}
```

---

## 부록 C. hybridEvaluate (의사코드)

```ts
const SENSOR_THRESHOLD = 80

async function hybridEvaluate(sensor: SensorReading, ctx: MaeContext) {
  const alarmChanged = ruleEngine.evaluate(sensor, ctx.alarmState, SENSOR_THRESHOLD)
  if (alarmChanged) {
    syncUrgencyFromAlarm(ctx)
    const urgent: UrgentDecision = {
      phase: 'urgent',
      target_component: ctx.alarmState.component_id!,
      urgency: ctx.alarmState.level === 'NONE' ? 'NORMAL' : ctx.alarmState.level,
      focus_blur_scale: ctx.alarmState.level === 'CRITICAL' ? 1.0 : ctx.focus_blur_scale,
    }
    applyAestheticState(urgent, ctx)
  }

  if (ctx.bax_mode !== 'intelligent') return

  try {
    const fine = await evaluateWithOllama(sensor, ctx, { timeoutMs: 3000 })
    applyAestheticState(stripStructuralFields(fine), ctx)
  } catch {
    // FR-07: RuleGuard SSOT 유지
  }
}
```

---

## 부록 D. DefaultLayoutPolicy (의사코드)

```ts
class DefaultLayoutPolicy implements LayoutPolicy {
  resolve(components: ComponentDeclaration[], ctx: MaeContext): ResolvedLayout {
    const isCritical = ctx.alarmState.level === 'CRITICAL'
    const essentials = components.filter((c) => c.priority === 'ESSENTIAL')
    const textures = components.filter((c) => c.priority === 'TEXTURE')

    const totalMinWidth = essentials.reduce((s, c) => s + (c.minWidth ?? 0), 0)
    const available = this.getAvailableWidth(ctx.viewport_band)
    if (totalMinWidth > available || ctx.viewport_band === 'sm') {
      return this.singleColumnFallback(essentials, textures, isCritical)
    }

    if (isCritical) {
      return {
        gridTemplate: { columns: '1fr 2fr', rows: '1fr' },
        placements: [
          ...textures.map((c) => ({ componentId: c.id, gridArea: '1 / 1 / 2 / 2' })),
          ...essentials.map((c) => ({
            componentId: c.id,
            gridArea: '1 / 2 / 2 / 3',
            minWidth: c.minWidth,
          })),
        ],
      }
    }

    return {
      gridTemplate: { columns: '1fr 1fr', rows: '1fr' },
      placements: [
        ...textures.map((c) => ({ componentId: c.id, gridArea: '1 / 1 / 2 / 3' })),
        ...essentials.map((c) => ({
          componentId: c.id,
          gridArea: '1 / 2 / 2 / 3',
          minWidth: c.minWidth,
        })),
      ],
    }
  }

  private singleColumnFallback(essentials: ComponentDeclaration[], textures: ComponentDeclaration[], isCritical: boolean): ResolvedLayout {
    const rows = isCritical ? essentials : [...essentials, ...textures.filter((t) => t.depth === 'BG')]
    return {
      gridTemplate: { columns: '1fr', rows: `repeat(${rows.length}, auto)` },
      placements: rows.map((c, i) => ({
        componentId: c.id,
        gridArea: `${i + 1} / 1`,
        minWidth: c.minWidth,
      })),
      overflowFallback: true,
    }
  }

  private getAvailableWidth(band: ViewportBand): number {
    return { xl: 1280, md: 768, sm: 360 }[band]
  }
}
```

---

## 부록 E. 폐기 목록

| 폐기                              | 대체                                    |
| --------------------------------- | --------------------------------------- |
| `matrix_id`                       | 의미 속성 + LayoutPolicy                |
| `margin_ratio` · M2P v1           | `void_ratio` + `void_ratio_delta` (v2)  |
| `ovr_floor` / OVR                 | **ASR** · `asr_base` · `resolveAsrBase` |
| `ovrPreferenceOffset`             | **`asrPreferenceOffset`**               |
| Frame as BLOCK FG                 | **`layer: OVERLAY`**                    |
| urgency by slider/AI/bax_mode     | **AlarmState only**                     |
| v0.8 UX SSOT · `BAX_문제 해소.md` | **본 문서 v0.9**                        |

---

## 변경 이력

| 버전            | 내용                                                                                   |
| --------------- | -------------------------------------------------------------------------------------- |
| 0.8 (UX)        | ATS · ASR · M2P/Settings 분리                                                          |
| 0.8 (문제 해소) | C1–C4 · G1–G4 · R1–R4 · M2P v2 · AlarmState · OVERLAY                                  |
| **0.9**         | **단일 SSOT 완성** — 용어(v0.8) + 기술(문제 해소) + FR AC · UI · Safe-Zone · 부록 전체 |

---

_BAX MVP 개발 단일 SSOT v0.9 — AXON 미학 UX 레이어_
