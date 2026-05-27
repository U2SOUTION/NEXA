# BAX (Breathing AI Experience)

**미학적 인터페이스 · 사용자경험 아키텍처 정의서**
MVP 개발 SSOT — v0.8

> **후속 SSOT**: [`BAX_미학적_인터페이스_UX_아키텍처_v0.9.md`](./BAX_미학적_인터페이스_UX_아키텍처_v0.9.md) — **단일 SSOT (본 문서 superseded)**
> **문서 유형**: B — MVP 개발 SSOT (Functional Requirements · API · Semantic Layout 중심)
> **요약본**: [`BAX_미학적_인터페이스_UX_아키텍처_요약_v0.8.md`](./BAX_미학적_인터페이스_UX_아키텍처_요약_v0.8.md) (1~2페이지)
> **상태**: Draft · **관련**: NEXA OS V2.1 · **실험 앱**: `apps/bax-demo`
> **v0.8 변경 요약**: **Aesthetic Tuning Settings(사용자 세팅)** 레이어 추가 — M2P(의지 입력)와 분리. ASR 선호·Depth Profile·Vibration 민감도 영속 조율.
> **v0.7 변경 요약**: 좌표 기반 고정 Matrix 전면 폐기 → 의미 속성 기반 자유 배치. LayoutPolicy·DepthProfile 도입.

---

## 약어 및 용어 정의

| 약어               | 풀네임                                     | 설명                                                                     |
| ------------------ | ------------------------------------------ | ------------------------------------------------------------------------ |
| **BAX**            | Breathing AI Experience                    | 인간의 의지와 AI 호흡이 결합된 **전체 사용자 경험 브랜드**               |
| **MAE**            | Matrix Aesthetic Engine                    | 의미 속성을 해석해 Grid 구조·배치·시각값을 **동적으로 결정**하는 UI 엔진 |
| **M2P**            | Matrix-to-Peripheral                       | **의지 입력층** — Peripheral·슬라이더 시뮬레이션 패킷 (실시간 호흡)      |
| **ATS**            | Aesthetic Tuning Settings                  | **사용자 세팅층** — ASR 선호·Depth·Vibration 등 **영속** 미학 조율       |
| **ASR**            | Aesthetic Space Ratio (미학적 공간/여백율) | 모드·뷰포트·가드레일이 정하는 `void_ratio` 하한                          |
| **VirtualCanvas**  | —                                          | 픽셀이 아닌 **위상·농담·진동**으로 정의한 BAX 단일 페이지 캔버스         |
| **LayoutPolicy**   | —                                          | 도메인별 교체 가능한 MAE의 배치 전략 인터페이스                          |
| **DepthProfile**   | —                                          | Depth 의미 속성을 실제 z-index·blur·opacity로 변환하는 MAE 내부 함수     |
| **NIXIE Agent**    | —                                          | AI 캐릭터 기반 센서 결합 입력 에이전트                                   |
| **RuleGuard**      | Rule-based Guard Engine                    | Phase 1 즉각 판단 엔진                                                   |
| **AestheticTuner** | AI Aesthetic Fine-tuner                    | Phase 2 Ollama 기반 미세조정 레이어                                      |
| **AXON**           | Adaptive Cross-domain Ontology Network     | 상위 우주 의미 소통 시스템                                               |

---

## 아키텍처 개요

**핵심 명제**: _여백은 자신감이다._ — IoT 관제에서 정보 과부하를 **여백·깊이·선명도**로 통제한다. BAX는 운영자 **의지**(M2P)와 **AI 호흡**(RuleGuard + AestheticTuner)이 만나는 UX 브랜드이며, MAE가 의미를 해석하여 배치·시각값을 결정한다. **철학·개인 쾌적함**은 **ATS(사용자 세팅)** 으로, **순간적 조작**은 **M2P**로 분리한다.

### 시스템 계층 구조

```
BAX  Breathing AI Experience          ← UX 브랜드 (의지 + AI 호흡)
 ├── ATS  Aesthetic Tuning Settings   ← 사용자 세팅 (영속 · OVR·Depth·Vibration 조율)
 ├── M2P  Matrix-to-Peripheral       ← 의지 입력 (슬라이더·Serial·WS · 실시간 시뮬)
 └── MAE  Matrix Aesthetic Engine     ← 의미 해석 → Grid 구성 → 시각값 결정
       ├── LayoutPolicy               ← 도메인별 교체 가능한 배치 전략 (기획)
       ├── DepthProfile               ← Depth 의미 → z-index·blur·opacity (+ ATS 튜닝)
       ├── RuleGuard                  ← Phase 1: 즉각 규칙 판단 (0ms)
       └── AestheticTuner             ← Phase 2: Ollama 미세조정 (지연 허용)
```

### 입력 3계층 (M2P vs ATS vs 기획)

| 계층                  | 역할                                                        | 지속성                                      | MVP UI             | MAE 반영 시점                      |
| --------------------- | ----------------------------------------------------------- | ------------------------------------------- | ------------------ | ---------------------------------- |
| **기획 주입**         | LayoutPolicy · BaxOperationMode preset · 컴포넌트 의미 속성 | 배포·도메인 단위                            | 코드·Policy 교체   | LayoutPolicy.resolve · preset 로드 |
| **ATS (사용자 세팅)** | 개인 ASR 선호 · Depth 대비 · Vibration 민감도               | **영속** (localStorage / userSettingsStore) | Settings 패널      | 파이프라인 **전역** (매 tick)      |
| **M2P (의지 입력)**   | margin_ratio · focus_blur · light (Peripheral 패킷)         | **세션·실시간**                             | Dev 슬라이더 S1–S3 | 패킷 수신 **즉시** (≤50ms)         |

> **분리 원칙**: M2P는 외부 조작 장치를 **재현하는 의지 입력층**이다. “나는 여백을 더 넓게 유지하고 싶다” 같은 **철학·쾌적함 조율**은 ATS에 둔다. M2P 슬라이더로 ATS를 대체하지 않는다.

### 데이터 흐름

```
┌─────────────────────────────────────────────────┐
│  Input                                          │
│  · ATS (영속 세팅) · M2P (실시간 의지)          │
│  · 시맨틱매트릭스 · NIXIE · 엣지 · 센서         │
└────────────────────┬────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────┐
│  Context Merge                                  │
│  bax_mode preset + ATS (OVR·Depth·Vibration)    │
│  + M2P packet (margin_ratio · focus_blur …)   │
└────────────────────┬────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────┐
│  MAE Pipeline: Hybrid Interpretation            │
│  Phase 1 Urgent (RuleGuard)  →  0ms 즉각 결정  │
│  Phase 2 Fine-tune (AestheticTuner) → 후속 조정 │
│  LayoutPolicy.resolve() → Grid 구성 결정        │
│  DepthProfile.apply(+ ATS tuning) → 시각값      │
└────────────────────┬────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────┐
│  Final Approval: G2 Guardrail                   │
│  ASR 하한 검토 ←→ Safe-Zone 승인               │
│  충돌 시: Safe-Zone 우선 (asrOverride)          │
└────────────────────┬────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────┐
│  Experience: BAX Projection                     │
│  VirtualCanvas → BAX 경험 (호흡하는 인터페이스) │
└─────────────────────────────────────────────────┘
```

---

## MVP 범위

**검증 질문**: 컴포넌트가 의미 속성만 선언하면, MAE가 Grid 구성·배치·시각값을 결정하여 VirtualCanvas가 **≤300ms** easing으로 호흡(수축/이완)하는가?

| In scope (MVP)                                    | Out of scope (MVP)                   |
| ------------------------------------------------- | ------------------------------------ |
| 단일 SPA · 컴포넌트 3종 (Anchor·Frame·Sentinel)   | 다페이지 · 전역 domainLayoutRegistry |
| **BAX 운영 모드** 4종 + 수동 전환                 | nexage 전역 기본값 강제              |
| **ATS** — ASR 선호 · Depth · Vibration (MVP UI)   | 다중 사용자 프로필 · 클라우드 sync   |
| **ASR** · 뷰포트 밀도 적응 · **LayoutPolicy** 1종 | 복수 LayoutPolicy 동시 운용          |
| 웹 슬라이더 = **M2P Peripheral** 시뮬             | 전용 M2P 하드웨어                    |
| 가상 센서 1종 + RuleGuard→AestheticTuner 2단계    | 다중 IoT · SSE · Grade3 제어         |
| **Sparkline** (V1 진동) · Circuit Gate            | 오디오 vibration (V3)                |
| CSS Grid (동적) · `backdrop-filter` · Framer/GSAP | WCAG 실운영 인증                     |

---

## 1. 설계 원칙

### 핵심 3원소

| 원소                 | SSOT 변수                               | MVP 역할                                  |
| -------------------- | --------------------------------------- | ----------------------------------------- |
| **위상 (Topology)**  | `layout` (MAE 결정)                     | 컴포넌트 배치·Grid 구성·z-index           |
| **농담 (Density)**   | `void_ratio` · **ASR**                  | 모드·뷰포트별 여백 하한                   |
| **진동 (Vibration)** | Sparkline · micro-motion · (후속) audio | 시각적 맥박 — Circuit Open 시 최우선 차단 |

### AXON 원칙 3과의 정렬

> 세포(컴포넌트)는 두뇌(MAE/LayoutPolicy)를 몰라야 한다.
> 컴포넌트는 자신의 의미 속성만 선언하고, 배치와 시각 판단은 전적으로 MAE가 담당한다.

```
컴포넌트 (세포)  →  의미 속성만 선언  (위치를 모름)
MAE (두뇌)      →  LayoutPolicy 실행 → 배치 결정  (컴포넌트를 앎)
```

이전 구조(`matrix_id: "FG-C"`)에서 컴포넌트가 자신의 물리적 좌표를 알고 있었던 문제를 완전히 해소한다.

---

### 컴포넌트 의미 속성 체계

컴포넌트는 아래 속성만 선언한다. 위치·크기·블러 수치는 **선언하지 않는다.**

**① 의미 속성 (컴포넌트가 선언)**

| 속성         | 타입 | 값           | 설명                              |
| ------------ | ---- | ------------ | --------------------------------- |
| `priority`   | enum | `ESSENTIAL`  | 본질 정보 — 경고·핵심 수치        |
|              |      | `CONTEXTUAL` | 맥락 — 보조 라벨·단위             |
|              |      | `TEXTURE`    | 시각 질감 — 장식·노이즈           |
| `urgency`    | enum | `CRITICAL`   | 즉각 최우선 처리                  |
|              |      | `HIGH`       | 높은 주의 필요                    |
|              |      | `NORMAL`     | 일반 상태                         |
|              |      | `NONE`       | 배경성 요소                       |
| `depth`      | enum | `FG`         | 근경 의미 — 선명함·전면           |
|              |      | `MID`        | 중경 의미 — 맥락·보조             |
|              |      | `BG`         | 원경 의미 — 구도·질감             |
| `mutability` | enum | `IMMUTABLE`  | 불변 뼈대                         |
|              |      | `MUTABLE`    | 가변 — 이벤트에 따라 재배치 가능  |
| `minWidth`   | px   | (선택)       | Safe-Zone 물리 하한만 — 위치 아님 |

**② MAE가 결정하는 것 (컴포넌트가 모름)**

| MAE 결정값 | 내용                                                 |
| ---------- | ---------------------------------------------------- |
| Grid 구조  | 열 수·행 수·비율 — 도메인·컨텍스트에 따라 가변       |
| 배치 셀    | 어느 Grid 셀에 위치할지                              |
| `z-index`  | DepthProfile이 depth + urgency 조합으로 결정         |
| `blur` px  | DepthProfile이 depth + bax_mode로 결정               |
| `opacity`  | DepthProfile이 depth + urgency로 결정                |
| 크기 비율  | priority + viewport_band로 결정 (minWidth 하한 준수) |

**③ MVP 컴포넌트 선언 예시**

| 컴포넌트     | `priority` | `urgency`         | `depth` | `mutability` | `minWidth` |
| ------------ | ---------- | ----------------- | ------- | ------------ | ---------- |
| **Anchor**   | TEXTURE    | NONE              | BG      | IMMUTABLE    | —          |
| **Frame**    | TEXTURE    | NONE              | FG      | IMMUTABLE    | —          |
| **Sentinel** | ESSENTIAL  | NORMAL → CRITICAL | FG      | MUTABLE      | 300px      |

### 가드레일 5조 (코드 강제 · LLM은 제안만)

| #      | 규칙                                                                                                     | 구현                                      |
| ------ | -------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| **G1** | **극단적 대비** — TEXTURE 컴포넌트 면적 ≤20%, ESSENTIAL은 우선 확보                                      | `guardrails/sizePolicy.ts`                |
| **G2** | **ASR + Safe-Zone** — `void_ratio ≥ asr_base` 및 Sentinel **물리 minWidth** — **충돌 시 Safe-Zone 우선** | `asrPolicy.ts` · `readabilitySafeZone.ts` |
| **G3** | **Entropy Brake** — 동시 Grid 재배치 MUTABLE ≤ **1** / tick                                              | `entropyBrake.ts`                         |
| **G4** | **Occupancy** — 동일 셀 다중 점유 시 z-index 정렬·인접 셀 분산                                           | `layoutOccupancy.ts`                      |
| **G5** | **진동 차단** — `circuitState !== 'closed'` → Vibration 전면 OFF                                         | `vibrationGate.ts`                        |

---

## 1.5 Aesthetic Tuning Settings (사용자 세팅 레이어 · ATS)

**ATS**는 BAX 철학·기획 의도를 **개인 쾌적함**에 맞게 조율하는 **영속 설정층**이다. M2P(실시간 의지)와 달리 localStorage / `userSettingsStore`에 저장되며, MAE 파이프라인 **전역**에 적용된다.

### 1.5.1 ATS 스키마 SSOT

```ts
interface AestheticTuningSettings {
  /** §1.5.2 — 모드 preset OVR에 가산 (0 = 기본, +15 = 여백 극대) */
  ovrPreferenceOffset: number // 0–15 (int)

  /** §1.5.3 — FG/MID/BG DepthProfile 대비 조율 */
  depthProfileTuning: DepthProfileTuning

  /** §1.5.4 — Sparkline·Micro-motion 민감도 */
  vibrationProfile: VibrationProfile
}

interface DepthProfileTuning {
  /** MID·BG blur 배율 — 1.0 = preset 기본 */
  midBlurScale: number // 0.5–2.0
  bgBlurScale: number // 0.5–2.0
  /** FG vs MID opacity 대비 — 높을수록 전경 선명 */
  fgMidContrast: number // 0.5–1.5
}

interface VibrationProfile {
  sparklineEnabled: boolean
  sparklineIntensity: 0 | 1 | 2 // off · low · normal
  microMotionEnabled: boolean
  microMotionAmplitude: number // 0–100 (0 = OFF)
}
```

**Store SSOT**

| bax-demo                         | NEXA 흡수 시                                  |
| -------------------------------- | --------------------------------------------- |
| `useAestheticSettingsStore`      | `userSettingsStore.aestheticTuning` (persist) |
| `localStorage` key: `bax.ats.v1` | Zod schema in `packages/shared`               |

### 1.5.2 ASR 선호도 (개인 적정여백율)

`bax_mode` preset마다 `asr_base`가 있어도, 사용자가 “더 넓은 여백”을 원하면 **ATS가 하한을 상향**한다.

```ts
function resolveAsrBase(mode: BaxOperationMode, band: ViewportBand, ats: AestheticTuningSettings): number {
  const base = BAX_MODE_PRESETS[mode].asr_base + ats.ovrPreferenceOffset
  return Math.min(95, Math.max(OVR_ABSOLUTE_MIN, base + VIEWPORT_DELTA[band]))
}
```

| `ovrPreferenceOffset` | UI 라벨 (예)     | 효과                          |
| --------------------- | ---------------- | ----------------------------- |
| **0**                 | 기본 (모드 따름) | preset OVR만 적용             |
| **+5**                | 여유             | void_ratio 하한 +5            |
| **+10**               | 넓은 여백        | meditation에 가까운 밀도 유지 |
| **+15**               | 최대 (MVP 상한)  | G2·Safe-Zone 내에서만 허용    |

> ATS ASR 가산은 **AestheticTuner·M2P margin_ratio보다 우선하지 않는다** — 실시간 M2P는 순간 호흡, ATS는 **기본 바닥선(baseline)** 을 올린다.

### 1.5.3 Depth Profile Tuning (시각적 민감도)

`DefaultDepthProfile` 출력에 **사용자 배율**을 곱해 FG·MID·BG 대비를 눈에 맞게 조정한다.

```ts
function applyDepthTuning(values: VisualValues, depth: Depth, tuning: DepthProfileTuning): VisualValues {
  if (depth === 'MID') return { ...values, blurPx: values.blurPx * tuning.midBlurScale }
  if (depth === 'BG') return { ...values, blurPx: values.blurPx * tuning.bgBlurScale }
  if (depth === 'FG') return { ...values, opacity: clamp(values.opacity * tuning.fgMidContrast, 0, 1) }
  return values
}
```

| 컨트롤              | 범위    | 사용자 의도                    |
| ------------------- | ------- | ------------------------------ |
| **MID blur scale**  | 0.5–2.0 | 중경 흐림 — 눈 fatigue vs 맥락 |
| **BG blur scale**   | 0.5–2.0 | 원경 질감 강도                 |
| **FG–MID contrast** | 0.5–1.5 | 전경 선명도 · 정보 pop         |

Preset 단축 (MVP UI): `soft` · `balanced` · `sharp` → 위 3값 일괄 매핑.

### 1.5.4 Vibration 반응성 (V1 · V2)

Sparkline(V1)·Micro-motion(V2)의 **자극성**을 사용자가 조절한다. **G5(Circuit Open)는 ATS보다 우선** — 시스템 부하 시 진동은 여전히 최우선 OFF.

```ts
function applyVibrationProfile(gate: VibrationGate, profile: VibrationProfile): VibrationGate {
  if (!profile.sparklineEnabled) gate.disable('V1')
  else gate.setIntensity('V1', profile.sparklineIntensity) // 0|1|2 → opacity·stroke
  if (!profile.microMotionEnabled || profile.microMotionAmplitude === 0) gate.disable('V2')
  else gate.setAmplitude('V2', profile.microMotionAmplitude)
  return gate
}
```

| 설정                           | V1 Sparkline       | V2 Micro-motion               |
| ------------------------------ | ------------------ | ----------------------------- |
| `sparklineIntensity: 0`        | unmount            | —                             |
| `sparklineIntensity: 1`        | 저대비·thin stroke | —                             |
| `sparklineIntensity: 2`        | 기본 MVP           | —                             |
| `microMotionAmplitude: 0–30`   | —                  | 미세 pulse                    |
| `microMotionAmplitude: 31–100` | —                  | 눈에 띄는 breathe (TEXTURE만) |

---

## 2. MAE — 의미 기반 자유 배치 엔진

### 2.1 LayoutPolicy — 도메인별 배치 전략

LayoutPolicy는 **MAE에서 분리된 교체 가능한 모듈**이다. 같은 컴포넌트 집합에 다른 LayoutPolicy를 적용하면 완전히 다른 Grid가 구성된다. 도메인이 바뀌어도 컴포넌트 선언은 그대로 유지된다.

```ts
interface LayoutPolicy {
  // 컴포넌트 의미 속성을 받아 Grid 구성과 셀 배치를 반환
  resolve(components: ComponentDeclaration[], ctx: MaeContext): ResolvedLayout
}

interface ResolvedLayout {
  gridTemplate: GridTemplate // 열·행 수, 비율 (CSS Grid)
  placements: ComponentPlacement[] // 각 컴포넌트의 셀 배치
}

interface GridTemplate {
  columns: string // e.g. "1fr 2fr" | "repeat(3, 1fr)"
  rows: string // e.g. "auto 1fr auto"
  areas?: string // CSS grid-template-areas (선택)
}
```

**MVP DefaultLayoutPolicy 동작 규칙:**

```
1. urgency: CRITICAL → 단독 행 또는 최대 비율 셀 확보
2. priority: ESSENTIAL → FG 영역 우선 배치, minWidth 보장
3. priority: TEXTURE → BG 영역, 나머지 공간 채움
4. viewport_band: sm → 단일 열, TEXTURE 숨김
5. void_ratio → ASR space 준수, TEXTURE가 먼저 축소
```

**LayoutPolicy 교체 예시 (도메인별):**

| 도메인            | LayoutPolicy          | Grid 형태                          |
| ----------------- | --------------------- | ---------------------------------- |
| IoT 관제 (MVP)    | `DefaultLayoutPolicy` | 2열: TEXTURE 배경 + ESSENTIAL 전면 |
| 의료 대시보드     | `MedicalLayoutPolicy` | 3열 균등 + 상단 CRITICAL 전용 배너 |
| 아트 인스톨레이션 | `ArtLayoutPolicy`     | TEXTURE 전면, ESSENTIAL은 오버레이 |
| 모바일 단일 뷰    | `SingleColumnPolicy`  | 1열, CRITICAL → top sticky         |

### 2.2 DepthProfile — 의미 → 시각값 변환

DepthProfile은 `depth` 의미 속성과 `urgency`, `bax_mode`, **`AestheticTuningSettings.depthProfileTuning`** 을 받아 실제 CSS 시각값을 결정한다.

```ts
interface DepthProfile {
  resolve(depth: 'FG' | 'MID' | 'BG', urgency: UrgencyLevel, mode: BaxOperationMode, tuning?: DepthProfileTuning): VisualValues
}

interface VisualValues {
  blurPx: number // 0–40
  opacity: number // 0.05–1.0
  zIndex: number // 1–10
}
```

**DefaultDepthProfile 변환 기준:**

| `depth` | `urgency`   | `bax_mode`      | blur | opacity | z-index             |
| ------- | ----------- | --------------- | ---- | ------- | ------------------- |
| FG      | CRITICAL    | 모든 모드       | 0px  | 1.00    | **20** (긴급 boost) |
| FG      | HIGH/NORMAL | 모든 모드       | 0px  | 1.00    | 10                  |
| MID     | \*          | `meditation`    | 20px | 0.30    | 5                   |
| MID     | \*          | `dense_monitor` | 4px  | 0.60    | 5                   |
| MID     | \*          | 기타            | 10px | 0.40    | 5                   |
| BG      | \*          | `meditation`    | 60px | 0.03    | 1                   |
| BG      | \*          | `dense_monitor` | 20px | 0.10    | 1                   |
| BG      | \*          | 기타            | 40px | 0.05    | 1                   |

> **핵심**: blur·opacity 수치는 컴포넌트가 모른다. `bax_mode`가 바뀌면 같은 `depth: MID` 선언이 다른 시각값을 받는다. 컴포넌트 코드 변경 없이 전체 인터페이스의 분위기가 전환된다.

### 2.3 상태 변수 SSOT

| 변수                   | 타입   | 범위                              | 설명                                                              |
| ---------------------- | ------ | --------------------------------- | ----------------------------------------------------------------- |
| `void_ratio`           | int    | 0–100                             | 현재 공백률 — **≥ `asr_base`** (Safe-Zone 충돌 시 일시 하회 가능) |
| `asr_base`             | int    | —                                 | 적정여백율 하한 — `resolveAsrBase(bax_mode, viewport_band, ats)`  |
| `bax_mode`             | enum   | §2.6                              | BAX 운영 모드 — DepthProfile·OVR preset 입력                      |
| `aesthetic_tuning`     | object | §1.5                              | **ATS** — ASR 선호 · Depth · Vibration (영속)                     |
| `viewport_band`        | enum   | `xl` \| `md` \| `sm`              | ResizeObserver 기준 — LayoutPolicy·OVR 보정                       |
| `canvas_scale`         | float  | 0.85–1.15                         | VirtualCanvas 위상 스케일                                         |
| `margin_ratio`         | int    | 0–100                             | M2P — 여백 수축/이완                                              |
| `focus_blur`           | int    | 0–100                             | FG 외 레이어 blur 강도 스케일 (DepthProfile 입력)                 |
| `light_source_x`       | int    | 0–100                             | 그림자 각도 X                                                     |
| `light_source_y`       | int    | 0–100                             | 그림자 각도 Y                                                     |
| `hybrid_phase`         | enum   | `urgent` \| `fine_tune`           | RuleGuard/AestheticTuner 단계                                     |
| `circuit_state`        | enum   | `closed` \| `open` \| `half_open` | NEXA healthWatchdog 연동 — G5                                     |
| `active_layout_policy` | string | —                                 | 현재 적용 중인 LayoutPolicy 식별자                                |

**CSS 전달**: `:root` — `--bax-void-ratio`, `--bax-focus-blur`, `--bax-canvas-scale`, ...
Grid 구성은 VirtualCanvas에 직접 `style.gridTemplate*` 으로 주입.

### 2.4 MAE 엔진 데이터 흐름

```
[Peripheral]  M2P 슬라이더 | WebSocket | Web Serial     ← 의지 입력 (실시간)
[Settings]    useAestheticSettingsStore (ATS)            ← 영속 세팅
[UI]          bax_mode selector → useBaxStore
[Viewport]    ResizeObserver → viewport_band
       │
       ▼
[Context Merge]  bax_mode preset + ATS + M2P margin_ratio/focus_blur
       │
       ▼
[VirtualSensor]  mock tick
       │
       ├──(수동)──► BaxState + mode preset
       │
       └──(자동)──► hybridEvaluate(data)  [intelligent 모드]
                      ├── Phase 1 urgent:  RuleGuard  → urgency: CRITICAL (즉시 0ms)
                      └── Phase 2 fine_tune: AestheticTuner → void/blur 조정 (지연 허용)
       ▼
[MAE Pipeline]
  vibrationGate(circuit_state, ats.vibrationProfile)  # G5 + ATS
  → LayoutPolicy.resolve(components, ctx)
  → DepthProfile.apply(depth, urgency, mode, ats.depthProfileTuning)
  → resolveAsrBase(bax_mode, band, ats) + readabilitySafeZone  # G2
  → densityAdaptive
  → runGuardrails (G1–G5)
  → applyAestheticState + canvas_scale
       ▼
[VirtualCanvas]  동적 CSS Grid · 300ms transition
```

### 2.5 M2P 프로토콜 (의지 입력층 · MVP)

**역할**: 외부 Peripheral(포텐셔미터·웨어러블·Serial)을 **재현**하는 실시간 입력. ATS(영속 세팅)와 **혼동 금지**.

**Transport 우선순위**: ① M2P 시뮬 슬라이더 (내장) → ② WebSocket → ③ Web Serial (Arduino)

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

| 필드           | 타입   | 필수 | 설명                                                        |
| -------------- | ------ | ---- | ----------------------------------------------------------- |
| `v`            | int    | ✓    | 스키마 버전                                                 |
| `source`       | string | ✓    | 송신원                                                      |
| `margin_ratio` | 0–100  | ✓    | **M2P** — 순간 여백 호흡 (void_ratio 제어, ATS baseline 위) |
| `focus_blur`   | 0–100  | ✓    | **M2P** — DepthProfile focus_blur 스케일 (순간)             |

**지연 목표**: Peripheral → 화면 반영 **p95 ≤ 50ms**

---

### 2.6 BAX 운영 모드 (BaxOperationMode)

| `bax_mode`      | UI 라벨           | 핵심 전략                    | `asr_base`    | DepthProfile 영향                                   |
| --------------- | ----------------- | ---------------------------- | ------------- | --------------------------------------------------- |
| `meditation`    | **명상/여백**     | 정보 최소화 · 호흡 극대화    | **75**        | BG blur↑↑, MID blur↑, void 85–90                    |
| `dense_monitor` | **밀집/모니터링** | 다중 지표 동시 관찰          | **25**        | BG blur↓, MID blur↓, opacity↑                       |
| `contextual`    | **관계/맥락**     | FG vs MID 대비 강조          | **48**        | MID opacity↑, 재배치 허용↑                          |
| `intelligent`   | **인텔리전트**    | AestheticTuner가 상황별 제안 | **60** (동적) | MaeDecision 가변 · 실패 시 `dense_monitor` fallback |

---

### 2.7 반응형 — ASR · 밀도 적응 · VirtualCanvas 스케일

**원칙**: 고정 % 금지. ASR + 적응 + Safe-Zone 3단 체계로 대응.

#### 2.7.1 `resolveAsrBase(mode, viewport_band)`

```ts
const VIEWPORT_DELTA = { xl: 0, md: -2, sm: -5 } as const
const OVR_ABSOLUTE_MIN = 65 // 미학 하한 — sm 좁음 해결책 아님

function resolveAsrBase(mode: BaxOperationMode, band: ViewportBand, ats: AestheticTuningSettings): number {
  const base = BAX_MODE_PRESETS[mode].asr_base + ats.ovrPreferenceOffset
  return Math.min(95, Math.max(OVR_ABSOLUTE_MIN, base + VIEWPORT_DELTA[band]))
}
```

| `viewport_band` | 조건       | ASR 보정                  | LayoutPolicy 영향         |
| --------------- | ---------- | ------------------------- | ------------------------- |
| `xl`            | ≥ 1280px   | `mode.asr_base` 그대로    | 기본 구성                 |
| `md`            | 768–1279px | **−2**                    | Frame opacity 50%         |
| `sm`            | < 768px    | **−5** (하한 **20** 절대) | Frame 숨김 · 단일 열 고려 |

#### 2.7.2 밀도 적응형 알고리즘

`applyAestheticState` 직전 실행:

1. `asr_base = resolveAsrBase(bax_mode, viewport_band, ctx.aesthetic_tuning)`
2. `void_ratio = clamp(proposed, asr_base, 100)` — Safe-Zone 충돌 시 미달 허용
3. `sm` → TEXTURE 컴포넌트 우선 숨김
4. 정보 면적 > 가용 30% → MID DepthProfile blur+1단계 (G1 유지)
5. `applySafeZone` — Sentinel minWidth 강제

#### 2.7.3 VirtualCanvas Topology 스케일링

| `viewport_band` | `canvas_scale` | `blur_scale` | 효과                          |
| --------------- | -------------- | ------------ | ----------------------------- |
| `xl`            | 1.00           | 1.00         | 기준 호흡 깊이                |
| `md`            | 0.95           | 0.90         | blur 소폭 감소                |
| `sm`            | 0.88           | 0.80         | gap 축소 · FG 카드 full-width |

#### 2.7.4 가독성 Safe-Zone — Sentinel 물리 하한 (G2 보강)

| 대상                     | CSS 규칙     | MVP SSOT                          | `sm` 보정                  |
| ------------------------ | ------------ | --------------------------------- | -------------------------- |
| **Sentinel** (ESSENTIAL) | `min-width`  | **300px**                         | **280px** (절대 **240px**) |
| Sentinel                 | `min-height` | **120px**                         | 100px                      |
| Sentinel 본문            | `font-size`  | **≥ 1.25rem**                     | 동일                       |
| Anchor/Frame (TEXTURE)   | —            | Safe-Zone 미적용 — 먼저 축소·숨김 | —                          |

> **우선순위 (G2)**: Safe-Zone > ASR % — Sentinel이 읽히지 않으면 `void_ratio` 목표를 일시 포기 (`asrOverride` 감사 로그 optional).

---

### 2.8 진동 (Vibration) — 기술 SSOT

| 계층                | MVP 구현                          | `priority` | Circuit Open |
| ------------------- | --------------------------------- | ---------- | ------------ |
| **V0 정적**         | `focus_blur` · `light_*` · shadow | —          | 유지         |
| **V1 Sparkline**    | Sentinel 하단 미니 라인           | CONTEXTUAL | **OFF**      |
| **V2 Micro-motion** | opacity pulse · border breathe    | TEXTURE    | **OFF**      |
| **V3 Audio** (후속) | 청각 레이어                       | —          | OFF          |

**G5 — 진동 차단 (ATS보다 우선)**

```
circuitState === 'open'  OR  mainFps p50 < 24 (3s)
  → vibrationGate.close()          # G5 — ATS vibrationProfile 무시
       · sparkline unmount · micro-animation class removed
       · Sentinel 숫자·텍스트만 표시
  → Safety · RuleGuard Phase 1 경로는 유지

circuitState === 'closed'  AND  FPS 정상
  → applyVibrationProfile(ats.vibrationProfile)  # §1.5.4
```

---

### 2.9 Layout 점유 · 중첩 (Stacking) 규칙

MAE의 LayoutPolicy가 동일 셀을 복수 컴포넌트에 배정하면 `layoutOccupancy.ts` 파이프라인을 거친다.

**① 동일 셀 내 z-index (DepthProfile 기반)**

| 순위 | `priority` | `urgency`     | 동작                 |
| ---- | ---------- | ------------- | -------------------- |
| 1    | ESSENTIAL  | CRITICAL/HIGH | 최상단 · 클릭·포커스 |
| 2    | CONTEXTUAL | \*            | 중간                 |
| 3    | TEXTURE    | NONE          | 최하단 · 장식        |

동일 순위 → `componentId` lexicographic (결정적 tie-break)

**② 인접 셀 자동 분산 (Adjacent Spillover)**

```
ESSENTIAL urgency=CRITICAL/HIGH 충돌 시:
1. LayoutPolicy에 재배치 요청 → 대안 셀 제안
2. 빈 영역 우선 · ESSENTIAL은 FG depth 유지
3. spillover 1건/tick (G3 Entropy와 합치)
4. 후보 없음 → z-index stack + Sentinel minWidth 보장
```

---

### 2.10 지능형 하이브리드 반영 (RuleGuard + AestheticTuner)

**문제**: AestheticTuner 수백 ms~수 s 지연 동안 Safety UI가 늦어짐.
**해결**: Phase 1은 urgency를 즉시 CRITICAL로 올리고, Phase 2는 void/blur만 조정.

```
[센서] temp ≥ threshold (예: 80°C)
    │
    ├─ Phase 1 · urgent (0ms, RuleGuard) ─────────────────────────
    │     Sentinel.urgency  → CRITICAL
    │     Sentinel.focus_blur → 0
    │     LayoutPolicy.resolve() 즉시 재실행 → CRITICAL 배치
    │     applyAestheticState({ phase: 'urgent' })  ≤300ms
    │
    └─ Phase 2 · fine_tune (AestheticTuner, intelligent 모드) ─────
          urgency 변경 금지 (Phase 1 lock, TTL 30s 또는 alarm clear)
          void_ratio · focus_blur · light_* → AI 미세 제안
          applyAestheticState({ phase: 'fine_tune' })  ≤300ms ease
```

| Phase           | 주체           | 허용 필드                             | 금지                                           |
| --------------- | -------------- | ------------------------------------- | ---------------------------------------------- |
| **`urgent`**    | RuleGuard      | `urgency`, `focus_blur` (0)           | void 대폭 변경 (±5 이내만)                     |
| **`fine_tune`** | AestheticTuner | `void_ratio`, `focus_blur`, `light_*` | **urgency 덮어쓰기** · **LayoutPolicy 재실행** |

---

## 3. MVP 화면 · 컴포넌트

단일 페이지. **이동·라우팅 없음.**

| ID         | 이름         | 의미 속성 선언                                                                                 | Grid 배치 (MAE 결정)                           |
| ---------- | ------------ | ---------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| **Comp A** | **Anchor**   | `priority: TEXTURE, urgency: NONE, depth: BG, mutability: IMMUTABLE`                           | BG 영역 전체 — 15vw Giant 타이포               |
| **Comp B** | **Frame**    | `priority: TEXTURE, urgency: NONE, depth: FG, mutability: IMMUTABLE`                           | Frame 오버레이 — 6px monospace (**데모 전용**) |
| **Comp C** | **Sentinel** | `priority: ESSENTIAL, urgency: NORMAL→CRITICAL, depth: FG, mutability: MUTABLE, minWidth: 300` | 기본: 우측 · 경고: 중앙 최대 확보              |

> Sentinel의 urgency가 CRITICAL로 바뀌면, 컴포넌트 코드 수정 없이 LayoutPolicy가 배치를 재결정한다.

**Dev Controller** (우하단, **2패널 분리**):

| 패널               | 역할                 | MVP 컨트롤                                                                                        |
| ------------------ | -------------------- | ------------------------------------------------------------------------------------------------- |
| **Settings (ATS)** | 영속 미학 조율       | ASR 선호(+0~+15) · Depth preset(soft/balanced/sharp) · Vibration(V1/V2)                           |
| **M2P Sim**        | Peripheral 의지 시뮬 | S1–S3 슬라이더 · WS/Serial ingest                                                                 |
| **공통**           | 런타임               | BAX 모드 · `경고 발생` · 가상 센서 tick · Ollama on/off · viewport band · LayoutPolicy 교체(데모) |

**M2P 시뮬 슬라이더 (Peripheral 대체 — ATS 아님)**

| ID     | 명칭              | 변수               | 계층 | 효과                                          |
| ------ | ----------------- | ------------------ | ---- | --------------------------------------------- |
| **S1** | **보이드 레이트** | `margin_ratio`     | M2P  | 순간 padding scale — ATS baseline 위에서 호흡 |
| **S2** | **미드 포커스**   | `focus_blur`       | M2P  | DepthProfile MID·BG blur **순간** 스케일      |
| **S3** | **라이트 앵글**   | `light_source_x/y` | M2P  | Anchor `box-shadow` 각도                      |

**ATS Settings 패널 (영속 — M2P 아님)**

| ID     | 명칭                  | 필드                          | 효과                               |
| ------ | --------------------- | ----------------------------- | ---------------------------------- |
| **T0** | **ASR 선호**          | `ovrPreferenceOffset`         | 모드 preset ASR +0~+15             |
| **T1** | **Depth 감도**        | `depthProfileTuning` / preset | FG–MID contrast · MID/BG blur 배율 |
| **T2** | **Sparkline (V1)**    | `sparklineIntensity`          | off / low / normal                 |
| **T3** | **Micro-motion (V2)** | `microMotionAmplitude`        | 0–100 · 자극적 깜빡임 완화         |

> **BAX 모드**(`bax_mode`)는 시나리오 preset — DevController 공통 영역. ATS와 별도로 `useBaxStore`에 둔다.

---

## 4. 기능 요구사항 (FR)

| ID        | 요구사항                            | Acceptance Criteria                                                         |
| --------- | ----------------------------------- | --------------------------------------------------------------------------- |
| **FR-01** | 의미 기반 동적 Grid                 | 컴포넌트 의미 속성 선언 → MAE가 Grid 구성·배치 결정 · 9칸 좌표 사용 없음    |
| **FR-02** | 호흡형 blur/void                    | `meditation` → void 85–90 · ASR clamp · DepthProfile MID blur↑ · **≤300ms** |
| **FR-03** | urgency 기반 재배치                 | NORMAL→CRITICAL 시 LayoutPolicy 재실행 · `focus_blur=0` · **≤300ms**        |
| **FR-04** | 가드레일 G1–G5                      | ASR · Safe-Zone 300px · Layout 점유 · Entropy · Vibration Gate              |
| **FR-05** | M2P 수신                            | 슬라이더 = 패킷과 동일 효과 · WS 연결 시 외부 패킷 ingest                   |
| **FR-06** | 하이브리드 RuleGuard+AestheticTuner | Phase 1 urgency 즉시 · Phase 2 void/blur만 · urgency lock                   |
| **FR-07** | Fallback                            | AestheticTuner fail → Phase 1 유지 · RuleGuard SSOT                         |
| **FR-08** | BAX 운영 모드                       | 4모드 전환 · DepthProfile·OVR 변경 · 온도 급증 → CRITICAL + dense_monitor   |
| **FR-09** | 반응형 ASR/Topology                 | ResizeObserver · OVR·scale · Safe-Zone sm 280px · asrOverride               |
| **FR-10** | Layout 점유/분산                    | 동일 셀 2+ → z-index · 인접 셀 spillover · §2.9                             |
| **FR-11** | 진동 + Circuit                      | sparkline/micro on · Circuit OPEN → V1/V2 OFF · Sentinel 텍스트 유지        |
| **FR-12** | LayoutPolicy 교체                   | 런타임 LayoutPolicy 교체 시 컴포넌트 선언 변경 없이 Grid 재구성             |
| **FR-13** | ATS ASR 선호                        | `ovrPreferenceOffset` +0~+15 · `resolveAsrBase` 반영 · 영속 저장            |
| **FR-14** | ATS Depth Profile Tuning            | `depthProfileTuning` · preset soft/balanced/sharp · DepthProfile 배율 적용  |
| **FR-15** | ATS Vibration 반응성                | V1 intensity · V2 amplitude · G5 OPEN 시 ATS 무시 · Circuit 복구 후 재적용  |

### 4.1 비기능 요구사항 (NFR)

| ID         | 항목           | 기준                                                                     |
| ---------- | -------------- | ------------------------------------------------------------------------ |
| **NFR-01** | FPS            | 전환 중 p50 ≥ **24**                                                     |
| **NFR-02** | AestheticTuner | timeout **3s** → fallback                                                |
| **NFR-03** | 오프라인       | AestheticTuner 없이 수동+규칙+모드 preset 100% 동작                      |
| **NFR-04** | 반응형         | band 변경 · Sentinel ≥ Safe-Zone minWidth · ASR ≥65 또는 asrOverride     |
| **NFR-05** | Circuit        | OPEN 시 sparkline/micro **0 frame** 추가 · FPS 회복 후 ATS 재적용        |
| **NFR-06** | ATS 영속       | 새로고침 후 OVR·Depth·Vibration 설정 유지 · M2P 슬라이더 값은 **비영속** |

---

## 5. AestheticTuner 연동 (Phase 2 · Fine-tuning)

### 5.1 역할 분담

| 계층                        | Phase             | 책임                                                   |
| --------------------------- | ----------------- | ------------------------------------------------------ |
| **RuleGuard**               | **1 · urgent**    | `urgency → CRITICAL` 즉시 · LayoutPolicy 재실행 트리거 |
| **AestheticTuner** (Ollama) | **2 · fine_tune** | `void_ratio` · `focus_blur` · `light_*` 미세 조정      |
| **guardrails**              | both              | G1–G5 · Phase 2에서 urgency 변경 strip                 |
| **layoutOccupancy**         | 1·2               | 배치 전 셀 점유·spillover                              |

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
  "mid_blur_scale": 0.6
}
```

> `urgency`, `layout_policy`, `grid_template` 필드는 AestheticTuner 출력에 포함되지 않는다. MAE가 strip한다.

**Phase 1 (RuleGuard)**:

```json
{
  "phase": "urgent",
  "target_component": "Sentinel",
  "urgency": "CRITICAL",
  "focus_blur": 0
}
```

**AestheticTuner Prompt (fine_tune)**:

```
Phase fine_tune ONLY. urgency is LOCKED. Layout decisions are LOCKED.
Return JSON: { phase, void_ratio, focus_blur, mid_blur_scale? }.
void_ratio >= ASR space. No urgency field. No layout fields. No prose.
Input: {sensor} · current void/blur · mode: {bax_mode}
```

### 5.4 시나리오 예

| 입력        | Phase 1 (RuleGuard, 0ms)                    | Phase 2 (AestheticTuner, 지연) |
| ----------- | ------------------------------------------- | ------------------------------ |
| 72°C normal | urgency: NORMAL 유지                        | void 78 · focus_blur 6 (선택)  |
| 85°C (≥80)  | **urgency: CRITICAL → LayoutPolicy 재배치** | void 75–80 · focus_blur 0–10   |

---

## 6. 기술 스택 · 저장소

| 항목      | MVP 선택                             | 비고                                    |
| --------- | ------------------------------------ | --------------------------------------- |
| App       | `apps/bax-demo` (Vite + React)       | NEXA monorepo 내 독립                   |
| Style     | Tailwind + CSS variables + 동적 Grid | CSS Grid columns/rows를 MAE가 직접 주입 |
| Motion    | Framer Motion **또는** GSAP          | 300ms transition SSOT                   |
| AI        | Ollama local (AestheticTuner)        | 클라우드 API **금지** (MVP)             |
| HW (선택) | Web Serial API                       | Arduino pot → M2P packet                |

**저장소 트리**:

```
apps/bax-demo/
├── src/
│   ├── canvas/VirtualCanvas.tsx       # 동적 CSS Grid 컨테이너
│   ├── components/
│   │   ├── Anchor.tsx                 # 의미 속성만 선언
│   │   ├── Frame.tsx
│   │   ├── Sentinel.tsx
│   │   └── SentinelSparkline.tsx
│   ├── engine/
│   │   ├── LayoutPolicy/
│   │   │   ├── index.ts               # LayoutPolicy 인터페이스
│   │   │   ├── DefaultLayoutPolicy.ts # MVP 배치 전략
│   │   │   └── SingleColumnPolicy.ts  # sm 대안
│   │   ├── DepthProfile/
│   │   │   ├── index.ts               # DepthProfile 인터페이스
│   │   │   └── DefaultDepthProfile.ts # depth+urgency+mode → 시각값
│   │   ├── applyAestheticState.ts
│   │   ├── baxModePresets.ts
│   │   ├── guardrails/
│   │   │   ├── asrPolicy.ts
│   │   │   ├── readabilitySafeZone.ts
│   │   │   ├── sizePolicy.ts
│   │   │   ├── entropyBrake.ts
│   │   │   └── vibrationGate.ts
│   │   ├── layoutOccupancy.ts         # G4 (구 matrixOccupancy)
│   │   ├── hybridEvaluate.ts
│   │   ├── densityAdaptive.ts
│   │   ├── viewportScale.ts
│   │   └── ruleEngine.ts
│   ├── settings/
│   │   ├── useAestheticSettingsStore.ts  # ATS — §1.5
│   │   ├── aestheticTuningSchema.ts      # Zod · localStorage bax.ats.v1
│   │   └── depthProfilePresets.ts        # soft · balanced · sharp
│   ├── store/useBaxStore.ts              # BAX 런타임 — bax_mode · M2P merge
│   ├── m2p/{wsClient.ts, serialClient.ts, types.ts}
│   ├── ollama/client.ts
│   └── dev/
│       ├── DevController.tsx
│       ├── AestheticSettingsPanel.tsx  # ATS T0–T3
│       └── M2pSimPanel.tsx              # M2P S1–S3
└── package.json
```

---

## 7. NEXA OS 정합 (참고)

| BAX MVP                   | NEXA V2.1                                  | 관계                                     |
| ------------------------- | ------------------------------------------ | ---------------------------------------- |
| VirtualCanvas (동적 Grid) | `nexage` content + `NexaDashboardRenderer` | 후속 — MVP 검증 후 흡수 여부 결정        |
| void_ratio / ASR          | `TELEMETRY_CIRCUIT_OPEN` 텍스트 모드       | Safety semantic 우선                     |
| **Vibration G5**          | `healthWatchdog` · `circuitState`          | 진동 최우선 OFF                          |
| `bax_mode`                | `userSettingsStore` · `useLayoutStore`     | nexage 흡수 시 설정 UI 연동              |
| **ATS**                   | `userSettingsStore.aestheticTuning`        | OVR·Depth·Vibration 영속                 |
| AestheticTuner JSON       | `nexia` + `packages/shared` Zod            | 흡수 시 MaeDecision → shared schema      |
| M2P WS                    | 채널 B Worker WS                           | **별도** — 미학 패킷 ≠ ATS ≠ Telemetry   |
| **LayoutPolicy**          | `domainLayoutRegistry`                     | 흡수 시 도메인별 Policy 등록 체계로 확장 |

---

## 8. 현실성 · 리스크

| 항목                          | 평가        | 메모                                |
| ----------------------------- | ----------- | ----------------------------------- |
| 의미 기반 선언 체계           | 🟢 높음     | 컴포넌트 수 적음 · 인터페이스 명확  |
| 동적 CSS Grid                 | 🟢 높음     | gridTemplate 문자열 주입 — 표준 CSS |
| DepthProfile 가변값           | 🟢 높음     | bax_mode 변경 시 자동 재계산        |
| LayoutPolicy 교체             | 🟢 높음     | MVP 1종 · 인터페이스만 확정하면 됨  |
| ASR · 모드 · 반응형           | 🟢 높음     | §2.7 — 기존 로직 유지               |
| ATS 3종 (OVR·Depth·Vibration) | 🟢 높음     | §1.5 · M2P와 UI·Store 분리          |
| RuleGuard+AestheticTuner      | 🟢 높음     | urgency 기반 · ATS와 독립           |
| 6px Frame 실운영              | 🔴 낮음     | **데모 전용**                       |
| M2P 하드웨어                  | 🔴 MVP 이후 | 슬라이더/Serial 먼저                |

**Go / No-Go (MVP 완료 정의)**:

- [ ] FR-01–15 PASS
- [ ] NFR-01 PASS (전환 중 FPS)
- [ ] AestheticTuner off 시 FR-07 fallback PASS
- [ ] LayoutPolicy 교체 시 컴포넌트 코드 변경 없음 확인
- [ ] §8 리뷰 후 nexage 흡수 여부 결정

---

## MAE Aesthetic Pipeline (MAE 미학 파이프라인)

**[기획 주입 + ATS + M2P → 2단계 하이브리드 → MAE → 가드레일 → VirtualCanvas]**

> > > > > > MAE 엔진에 기획 의도를 주입하는 방법 <<<<<
> > > > > > MAE(Matrix Aesthetic Engine)가 실질적인 UI 구현 엔진으로서 작동함에 따라, 기획자의 **사이트 기획 의도(방향성, 철학)**는 더 이상 고정된 픽셀이나 좌표가 아닌, **의미론적 규칙과 모듈형 정책**을 통해 시스템에 주입됩니다.

### 1. **LayoutPolicy (배치 전략의 주입)**

가장 강력한 기획 의도 주입 지점은 **LayoutPolicy** 모듈입니다. 기획자는 도메인의 성격(IoT 관제, 의료, 아트 등)에 따라 배치 전략을 설계하고 이를 MAE에 교체 가능한 형태로 제공할 수 있습니다.

- **어떻게 주입하는가:** "경고 시 중앙 집중", "모바일은 1열 구성", "TEXTURE는 배경으로 고정"과 같은 **의미론적 구도(Composition) 규칙**을 코드로 정의하여 MAE의 `LayoutPolicy.resolve()` 함수에 전달합니다.
- **효과:** 컴포넌트의 코드를 수정하지 않고도, 정책 교체만으로 전체 사이트의 그리드 구조와 배치 로직을 완전히 바꿀 수 있습니다.

### 2. **DepthProfile (미학적 감도의 주입)**

"여백은 자신감이다"라는 철학이나 "어느 정도의 흐림(blur)이 적당한가"에 대한 미학적 기준은 **DepthProfile**을 통해 주입됩니다.

- **어떻게 주입하는가:** `depth`(FG/MID/BG)라는 의미 속성이 실제 `blur`, `opacity`, `z-index`로 변환되는 **매핑 테이블**을 기획 의도에 맞게 설정합니다.
- **효과:** 기획자가 `meditation` 모드에서는 MID 레이어의 블러를 20px로, `dense_monitor` 모드에서는 4px로 설정하는 식으로 상황별 '미학적 감도'를 통제할 수 있습니다.

### 3. **BaxOperationMode (운영 모드 프리셋)**

기획자가 의도한 **사이트의 사용 시나리오**는 4가지 운영 모드 프리셋을 통해 주입됩니다.

- **어떻게 주입하는가:** 명상(meditation), 모니터링(dense_monitor), 맥락(contextual), 인텔리전트(intelligent) 모드별로 **적정여백율(ASR) 하한값**과 기본 미학 매개변수를 미리 정의해둡니다.
- **효과:** 시스템이 현재 '안정' 상태인지 '긴급' 상태인지에 따라 기획자가 의도한 시각적 호흡이 즉각적으로 구현됩니다.

### 4. **컴포넌트 의미 속성 선언 (정보 위계의 주입)**

기획자는 각 정보(컴포넌트)가 시스템 내에서 어떤 가치를 갖는지 **의미 속성**으로 정의함으로써 기획 의도를 반영합니다.

- **어떻게 주입하는가:** 개별 컴포넌트에 `priority`(ESSENTIAL/CONTEXTUAL/TEXTURE), `urgency`(NORMAL/CRITICAL), `mutability`(가변성) 등의 메타데이터를 부여합니다.
- **효과:** "이 수치는 본질적(ESSENTIAL)이므로 어떤 상황에서도 최우선적으로 보여야 한다"는 기획자의 판단이 MAE 엔진에 전달되어, 엔진이 최적의 위치를 자동으로 결정하게 합니다.

### 5. **Aesthetic Tuning Settings (사용자 세팅 · ATS)**

운영자 **개인**의 쾌적함·민감도는 **M2P(순간 의지)와 분리**된 **영속 세팅**으로 주입된다.

- **어떻게 주입하는가:** Settings 패널에서 **ASR 선호(+0~+15)**, **Depth Profile Tuning**(soft/balanced/sharp), **Vibration 반응성**(V1 intensity · V2 amplitude)을 설정한다. `useAestheticSettingsStore` → MAE Context Merge.
- **효과:** `dense_monitor` 모드여도 “나는 여백을 더 넓게” 같은 **개인 baseline**이 유지된다. Sparkline·Micro-motion이 자극적이면 amplitude를 낮춘다.

### 6. **인간의 직감적 메시지 (M2P · Peripheral 시뮬)**

운영자의 **순간적 의지**는 M2P 프로토콜로만 유입한다. ATS와 **혼동하지 않는다**.

- **어떻게 주입하는가:** 슬라이더·웨어러블·Serial의 **margin*ratio · focus_blur · light*\*** 패킷이 M2P → MAE로 실시간 ingest된다.
- **효과:** 가드레일·ATS baseline **위에서** 운영자가 여백의 수축·이완을 **호흡**하듯 조절한다.

**요약**: 기획 의도는 **LayoutPolicy · DepthProfile · BaxOperationMode · 컴포넌트 의미 속성** 4통로, **개인 쾌적함**은 **ATS**, **순간 의지**는 **M2P**로 MAE에 주입된다.

## 부록 A. 핵심 타입 정의

```ts
// 컴포넌트가 선언하는 의미 속성 (위치·크기 없음)
interface ComponentDeclaration {
  id: string
  priority: 'ESSENTIAL' | 'CONTEXTUAL' | 'TEXTURE'
  urgency: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'NONE'
  depth: 'FG' | 'MID' | 'BG'
  mutability: 'IMMUTABLE' | 'MUTABLE'
  minWidth?: number // Safe-Zone 하한만
}

// MAE가 결정하는 배치 결과
interface ComponentPlacement {
  componentId: string
  gridArea: string // CSS grid-area 값
  visualValues: VisualValues // DepthProfile 결과
}

// DepthProfile 출력
interface VisualValues {
  blurPx: number
  opacity: number
  zIndex: number
}

// LayoutPolicy 인터페이스
interface LayoutPolicy {
  resolve(components: ComponentDeclaration[], ctx: MaeContext): ResolvedLayout
}

interface ResolvedLayout {
  gridTemplate: GridTemplate
  placements: ComponentPlacement[]
}

// ATS — §1.5
interface AestheticTuningSettings {
  ovrPreferenceOffset: number
  depthProfileTuning: DepthProfileTuning
  vibrationProfile: VibrationProfile
}

// MaeContext (발췌)
interface MaeContext {
  bax_mode: BaxOperationMode
  viewport_band: ViewportBand
  aesthetic_tuning: AestheticTuningSettings
  circuit_state: CircuitState
  // …
}

// Phase 1 RuleGuard 출력
interface UrgentDecision {
  phase: 'urgent'
  targetComponent: string
  urgency: 'CRITICAL'
  focusBlur: 0
}

// Phase 2 AestheticTuner 출력
interface FineTuneDecision {
  phase: 'fine_tune'
  targetComponent: string
  voidRatio: number
  focusBlur: number
  midBlurScale?: number
  // urgency, gridTemplate 등 구조 관련 필드 없음
}
```

## 부록 B. applyAestheticState (의사코드)

```ts
function applyAestheticState(decision: MaeDecision, ctx: MaeContext) {
  const ats = ctx.aesthetic_tuning // useAestheticSettingsStore

  if (!vibrationGate(decision, ctx.circuit_state, ats.vibrationProfile)) {
    decision = stripVibrationLayers(decision) // G5 > ATS
  }
  if (decision.phase === 'fine_tune') {
    decision = stripStructuralFields(decision)
  }

  const layout = ctx.layoutPolicy.resolve(ctx.components, ctx)
  const visuals = ctx.depthProfile.apply(layout.placements, ctx.bax_mode, ats.depthProfileTuning)

  const space = resolveAsrBase(ctx.bax_mode, ctx.viewport_band, ats)
  const adapted = densityAdaptive(visuals, ctx)
  const safe = runGuardrails(adapted, { asr_base: space })
  const final = applySafeZone(safe, ctx.viewport_band)

  applyGridTemplate(ctx.canvas, layout.gridTemplate)
  setCssVars(final.void_ratio, final.focus_blur, ctx.canvas_scale)
  placeComponents(final.placements)
  animate({ durationMs: 300, ease: 'easeOut' })
}
```

## 부록 C. hybridEvaluate (의사코드)

```ts
async function hybridEvaluate(sensor: SensorReading, ctx: MaeContext) {
  if (sensor.value >= THRESHOLD) {
    const urgent = ruleEngine.urgent(sensor) // Phase 1 — RuleGuard
    ctx.components = updateUrgency(ctx.components, urgent.targetComponent, 'CRITICAL')
    ctx.lockedUntil = Date.now() + 30_000
    applyAestheticState({ ...urgent, phase: 'urgent' }, ctx)
  }
  if (ctx.bax_mode !== 'intelligent') return

  const fine = await evaluateWithOllama(sensor, ctx) // Phase 2 — AestheticTuner
  if (Date.now() < ctx.lockedUntil) {
    fine = stripStructuralFields(fine) // urgency 잠금 유지
  }
  applyAestheticState({ ...fine, phase: 'fine_tune' }, ctx)
}
```

## 부록 D. DefaultLayoutPolicy (의사코드)

```ts
class DefaultLayoutPolicy implements LayoutPolicy {
  resolve(components: ComponentDeclaration[], ctx: MaeContext): ResolvedLayout {
    const hasCritical = components.some(c => c.urgency === 'CRITICAL')
    const essentials  = components.filter(c => c.priority === 'ESSENTIAL')
    const textures    = components.filter(c => c.priority === 'TEXTURE')

    if (ctx.viewport_band === 'sm') {
      return this.singleColumn(essentials, textures, hasCritical)
    }

    if (hasCritical) {
      // CRITICAL 발생 시 ESSENTIAL 컴포넌트가 중앙 최대 영역 확보
      return {
        gridTemplate: { columns: '1fr 2fr', rows: '1fr' },
        placements: [
          { componentId: 'Anchor', gridArea: '1 / 1 / 2 / 2', visualValues: ... },
          { componentId: 'Sentinel', gridArea: '1 / 2 / 2 / 3', visualValues: ... },
        ]
      }
    }

    // 기본: TEXTURE 배경 + ESSENTIAL 전면
    return {
      gridTemplate: { columns: '1fr 1fr', rows: '1fr' },
      placements: [
        { componentId: 'Anchor',   gridArea: '1 / 1 / 2 / 3', visualValues: ... },
        { componentId: 'Sentinel', gridArea: '1 / 2 / 2 / 3', visualValues: ... },
      ]
    }
  }
}
```

---

_BAX MVP 개발 SSOT v0.8 — AXON 시스템 내 미학 UX 레이어_
