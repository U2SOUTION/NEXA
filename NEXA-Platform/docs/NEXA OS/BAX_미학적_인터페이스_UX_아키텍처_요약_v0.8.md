# BAX — 요약 (Executive Summary)

> **원본 SSOT**: [`BAX_미학적_인터페이스_UX_아키텍처_v0.9.md`](./BAX_미학적_인터페이스_UX_아키텍처_v0.9.md) — **단일 SSOT (개발 시 본 문서만 참조)**  
> **문서 유형**: A — 1~2페이지 요약 · **버전**: v0.9 · **앱**: `apps/bax-demo`

---

## 한 줄

**BAX**(*Breathing AI Experience*)는 IoT 관제 UI에서 **여백·깊이·진동**으로 정보 과부하를 통제하는 UX 브랜드이며, **MAE**가 컴포넌트 **의미 속성**만으로 Grid·배치·시각값을 결정한다.

**검증 질문 (MVP)**: 의미 속성만 선언해도 VirtualCanvas가 **≤300ms** easing으로 호흡(수축/이완)하는가?

---

## 계층 구조

```
BAX   UX 브랜드 (의지 + AI 호흡)
 ├── ATS   사용자 세팅 — 영속 (ASR·Depth·Vibration)
 ├── M2P   의지 입력 — 실시간 (Peripheral 시뮬)
 └── MAE   실행 엔진
       LayoutPolicy · DepthProfile
       RuleGuard (Phase 1) · AestheticTuner (Phase 2)
```

| 약어 | 의미 |
| ---- | ---- |
| **MAE** | Matrix Aesthetic Engine — Grid·blur·배치 결정 |
| **M2P** | Matrix-to-Peripheral — **v2** `void_ratio_delta` · `focus_blur_scale` (실시간) |
| **ATS** | Aesthetic Tuning Settings — **영속** 개인 미학 조율 |
| **ASR** | Aesthetic Space Ratio — `void_ratio` **하한** (`asr_base`) |

---

## 입력 3계층 (핵심 분리)

| 계층 | 무엇 | 지속성 | 예 |
| ---- | ---- | ------ | -- |
| **기획** | LayoutPolicy · `bax_mode` preset · 의미 속성 | 배포 단위 | 도메인 Policy 교체 |
| **ATS** | ASR 선호 · Depth 대비 · Vibration 민감도 | **영속** | Settings T0–T3 |
| **M2P** | `margin_ratio` · `focus_blur` · light | **실시간** | 슬라이더 S1–S3 |

> M2P = 외부 장치 **재현**. “여백을 더 넓게” 같은 baseline은 **ATS**. M2P로 ATS를 대체하지 않는다.

---

## AXON 원칙

컴포넌트는 **의미만 선언** (`priority` · `urgency` · `depth` · `mutability` · `minWidth`).  
위치·blur·Grid는 **MAE만** 결정한다. (v0.7 이전 `matrix_id` 좌표 방식 폐기)

**MVP 3컴포넌트**: Anchor(TEXTURE) · Frame(TEXTURE) · Sentinel(ESSENTIAL, minWidth 300px)

---

## MAE 파이프라인 (압축)

```
입력(ATS + M2P + 센서)
  → Context Merge (bax_mode preset + ATS + M2P)
  → Phase 1 RuleGuard (0ms): urgency → CRITICAL, LayoutPolicy 재실행
  → Phase 2 AestheticTuner (지연): void/blur만, urgency·layout 잠금
  → LayoutPolicy.resolve → DepthProfile.apply(+ ATS)
  → G2: void_ratio ≥ asr_base, Safe-Zone (충돌 시 asrOverride)
  → VirtualCanvas (300ms)
```

---

## 가드레일 G1–G5

| # | 한 줄 |
| - | ----- |
| G1 | TEXTURE 면적 ≤20%, ESSENTIAL 우선 |
| G2 | `void_ratio ≥ asr_base` + Sentinel minWidth — **Safe-Zone 우선** |
| G3 | tick당 MUTABLE 재배치 ≤1 |
| G4 | 동일 셀 겹침 → z-index · 인접 셀 분산 |
| G5 | Circuit Open → Vibration(V1/V2) **최우선 OFF** |

---

## ATS (사용자 세팅) — 3종

| ID | 필드 | 범위 | 역할 |
| -- | ---- | ---- | ---- |
| T0 | `ovrPreferenceOffset` | +0~+15 | 모드 `asr_base` 상향 |
| T1 | `depthProfileTuning` | soft/balanced/sharp | FG–MID contrast · MID/BG blur 배율 |
| T2–T3 | `vibrationProfile` | V1 off/low/normal · V2 0–100 | Sparkline·Micro-motion 자극성 |

Store: `useAestheticSettingsStore` · `localStorage: bax.ats.v1`

---

## BAX 운영 모드

| `bax_mode` | `asr_base` | 용도 |
| ---------- | ---------- | ---- |
| `meditation` | 75 | 여백·호흡 극대 |
| `dense_monitor` | 25 | 밀집 관제 |
| `contextual` | 48 | FG/MID 대비 |
| `intelligent` | 60 | AestheticTuner (실패 → dense_monitor) |

반응형: `xl` / `md` / `sm` — band별 ASR 보정(−2/−5), sm은 Frame 숨김 · Safe-Zone 280px(절대 240px).

---

## M2P 패킷 (요약)

```json
{ "v": 1, "margin_ratio": 42, "focus_blur": 18 }
```

지연 **p95 ≤ 50ms**. ATS baseline **위**에서 순간 호흡.

---

## MVP In / Out

| In | Out |
| -- | --- |
| 단일 SPA · Anchor/Frame/Sentinel | 다페이지 · nexage 강제 |
| ATS + M2P 2패널 · LayoutPolicy 1종 | 복수 Policy · 클라우드 sync |
| RuleGuard→AestheticTuner 2단계 | SSE · Grade3 · 다중 IoT |
| Sparkline(V1) · Circuit Gate | V3 Audio · WCAG 인증 |

---

## FR · NFR (체크리스트)

**FR-01~17**: 의미 Grid · 호흡 blur/void · urgency 재배치 · G1–G5 · M2P **v2** · 하이브리드 2단계 · 4모드 · 반응형 · Layout 점유 · 진동 · Policy 교체 · **ATS 3종** · **AlarmState** · **OVERLAY**

**NFR**: FPS ≥24 · Ollama 3s fallback · 오프라인 동작 · Safe-Zone · Circuit→진동 OFF · **ATS 영속 / M2P 비영속** · **RuleGuard 모드 무관**

---

## Go / No-Go

- [ ] FR-01–17 · NFR-01–07 PASS
- [ ] AestheticTuner off → RuleGuard fallback
- [ ] LayoutPolicy 교체 시 컴포넌트 코드 변경 없음
- [ ] nexage 흡수 여부 결정 (§8 리스크)

---

## 상세 참조 (원본 §)

| 주제 | 원본 절 |
| ---- | ------- |
| ATS 스키마·코드 | §1.5 |
| LayoutPolicy · DepthProfile | §2.1–2.2 |
| 상태 변수 · MAE 흐름 | §2.3–2.4 |
| M2P · bax_mode · ASR · Safe-Zone | §2.5–2.7 |
| Vibration · Layout 점유 · Hybrid | §2.8–2.10 |
| Dev Controller · FR/NFR | §3–4 |
| Ollama · 스택 · NEXA 정합 | §5–7 |

---

_요약 v0.9 — 상세 SSOT v0.9 동기화 권장_
