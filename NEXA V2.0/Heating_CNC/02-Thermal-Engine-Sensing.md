---
doc_id: 
updated: 2026-07-07
implements_doc: 
terms_standard: []
terms_nexa: []
title: "Heating CNC — Thermal Engine & Sensing"
category: "IoT / Manufacturing"
domain: controller
status: draft
created: 2026-07-07
parent_doc: "README.md"
see_also:
  - "README.md"
  - "01-Hardware-Motion.md"
  - "03-Software-Protocol.md"
  - "04-Data-Operations.md"
---

# Thermal Engine & Sensing

지능형 열 제어 (`ThermalCutterEngine`), **INA219·K-Type 인라인 센싱**, **센서 인터록 S1~S9**, **`/thermal-lab`** 캘리브레이션을 정의합니다.

> 하드웨어 배선·WireSense 물리 배치: [01 Hardware & Motion](01-Hardware-Motion.md)
> WebSocket·REST 프로토콜: [03 Software & Protocol](03-Software-Protocol.md)
> D1 `thermal_*` 테이블: [04 Data & Operations](04-Data-Operations.md)

---

## 개요 · 온도 우선순위

| 우선순위 | 소스 | 용도 |
| :---: | :--- | :--- |
| **1** | `wire_temp_c` (K-Type 실측) | PID·예열 게이트·인터록 S5 |
| **1b** | 보정·필터 파이프라인 | [Calibration_Algorithm](#calibration_algorithm--실시간-온도-보정-알고리즘-mvp-v01-필수) — 2-Point → EMA → `wire_temp_c` |
| **2** | `temp_curve_json` (S↔T 보간) | K-Type 장애 시 폴백 |
| **3** | `ThermalCutterEngine` 추정 | open-loop 가공 S 산출 |

물리적 가공 원칙: **단위 시간당 소재가 흡수하는 열에너지를 일정하게** 유지 — 속도↑ → 전력↑, 속도↓ → 전력↓.
PWM(S) 변경과 **실제 온도 도달 사이에는 열적 관성 (지연)** 이 존재 → [Thermal_Inertia_Model](#thermal_inertia_model--열적-관성-및-지연-모델링-mvp-v01-필수).

---

## `/thermal-lab` — PWM·온도 테스트 랩 `[MVP v0.1 필수]`

가공 **START**·G-code 와 **완전 분리**된 전용 화면. S 값·예열·전류 한계·캘리브를 검증한 뒤 `ThermalCutterEngine`·레시피에 반영.

> 궤적·UI 검증: [03 운영 모드](03-Software-Protocol.md#운영-모드-3단계) (`ui_sim`/`device_dry`). 본 절은 **열선 전력·온도**만 집중.

### 화면 위치 · 진입

| 항목 | 내용 |
| :--- | :--- |
| 경로 | Next.js **`/thermal-lab`** (섹션 B 「열선 테스트」탭) |
| 가공 패널 | `START`·Jog·레시피 **비활성** — 테스트 전용 |
| 운영 모드 | `ui_sim` · `live` · `device_dry` **진입 차단** |

### `thermal_profiles` 설정 항목

| 그룹 | 필드 | 설명 | 기본값 예 |
| :--- | :--- | :--- | :--- |
| **열선 사양** | `wire_length_mm` | 유효 가공 길이 | 1200 |
| | `wire_diameter_mm` | 니크롬선 직경 | 0.5 |
| | `resistance_per_m` | Ω/m | 실측 |
| **전원** | `psu_voltage_nom` | DC PSU (V) | 18 |
| | `current_limit_a` | 소프트 차단 (A) | 3.5 |
| **PWM** | `pwm_min` / `pwm_max` | S 하한·상한 | 0 / 1000 |
| | `pwm_ramp_ms` | S 램프 (ms) | 500 |
| **예열** | `preheat_json` | `[{ s, dwell_sec }, …]` | `[{s:300,dwell_sec:3},…]` |
| **관성** | `thermal_tau_sec` | 1 차 지연 시상수 τ (s) | **2.0** — [Thermal_Inertia_Model](#thermal_inertia_model--열적-관성-및-지연-모델링-mvp-v01-필수) |
| | `t_ambient_c` | 기준 주변·냉간 T (°C) | 25 |
| | `preheat_gate_json` | START 잠금 조건 | `{ min_temp_c, margin_c, soak_sec }` |
| **온도** | `target_temp_c` | PID·예열 게이트 | 300 |
| **폴백** | `temp_curve_json` | S→°C | 시나리오 ⑧ 피팅 |
| **니크롬** | `nichrome_alpha` | R(T) α (/°C) | 1.0e-4 |
| **기준** | `r0_baseline_ohm` | 냉간 R₀ | 시나리오 ⑨ |
| **필터** | `ina219_ma_window` | MA 창 | **5** — [§3-4](#34-ina219-고속-pwm-환경--전류-노이즈-필터링) |
| **온도 보정** | `temp_calib_json` | 2-Point Gain·Offset | [Calibration_Algorithm](#calibration_algorithm--실시간-온도-보정-알고리즘-mvp-v01-필수) |
| | `temp_ema_alpha` | K-Type EMA α | **0.15** (100ms) |
| **단선** | `i_break_floor_a` · `i_break_ratio` | 동적 `I_break_abs` | 0.02A · 0.15 |
| **가공** | `feed_pwm_map` | F 구간별 권장 S | 레시피 복사 |

### 테스트 시나리오 (6 종)

| 유형 | 코드 | `ui_sim` | `live` |
| :--- | :--- | :--- | :--- |
| 수동 스텝 | `manual` | 가상 | INA219 + K-Type |
| 램프 스윕 | `ramp` | 가상 시계열 | → 시나리오 ⑧ |
| 예열 재생 | `preheat` | G4 가상 | K-Type 완료 확인 |
| 피드 연동 | `feed_sync` | 엔진 검증 | 시나리오 ⑩ |
| 온도 PID | `temp_pid` | 가상 PID | 시나리오 ① |
| 냉간 R₀ | `cold_r0` | 계산 | 시나리오 ⑨ |

세션 종료 → `thermal_test_logs` (100ms `samples_json`).

### UI 구성

```text
┌─ [ui_sim | live] ── device_dry 진입 불가 ─────────────────────┐
│ 프로파일 ▼  [저장] [기본값 복원]                                  │
│  열선 L/Ø/R·m  PSU 18V  한계 3.5A  램프 500ms                   │
│  예열: [S300·3s] [S650·2s]                                     │
├─ [수동][램프][예열][피드][PID][R₀]  ●REC  [시작][M5]            │
│  [엔진 계수 피팅] [레시피에 적용]                                │
│  S650  V:12.1V  A:2.4A  T:312°C  R:4.82Ω (+2.1%)              │
│  [2-Point 보정] Gain:1.04 Offset:-3.2  α:0.15                  │
├─ 차트: S/V/A/wire_temp_raw/corr/c · wire_res_ohm — I_raw vs I_filt │
└─ 안전: 연속 ON 60s · 과전류 자동 M5 ────────────────────────────┘
```

### ESP32 (`live` 테스트)

| 항목 | 동작 |
| :--- | :--- |
| `thermal_test_active=1` | **모터 명령 거부** · PWM·센서만 |
| PWM | `cmd_thermal_test` → LASER MOSFET |
| 안전 | `I > current_limit_a` → M5 |
| 타이머 | 연속 ON 60s → 자동 M5 |

### API · 프로토콜

> 상세: [03 WebSocket · REST](03-Software-Protocol.md#websocket-메시지--통합-명세-canonical)

| Method / type | 용도 |
| :--- | :--- |
| `cmd_thermal_test` | start / pwm_set / stop |
| `cmd_temp_pid` | 온도 폐루프 |
| `cmd_wire_health_check` | cold_r0 |
| `POST /api/thermal-calibrate/fit-k` | **K 피팅** → `engine_coefficients` · [03 동기화 시퀀스](03-Software-Protocol.md#테스트-랩--k-factor--실시간-제어-동기화-시퀀스-mvp-v01-필수) |
| `POST /api/thermal-calibrate/temp-2pt` | **2-Point 온도 보정** → `temp_calib_json` · [Calibration_Algorithm](#calibration_algorithm--실시간-온도-보정-알고리즘-mvp-v01-필수) |

### 안전 체크리스트 (`live` 테스트 전)

- [ ] 환기·소화기·비가연물 확인
- [ ] 모재 미장착 또는 공중 테스트 위치
- [ ] `device_dry` 아님 확인
- [ ] 전류 한계·60s 타이머
- [ ] E-Stop 24h 내 검증

---

## ThermalCutterEngine — 열 - 속도 동기화 엔진

MVP v0.1: Next.js Route Handlers · Phase 2: NestJS `ThermalCutterService` + AI 병합.

### 핵심 추상화 함수 3 선

| # | 함수 | 역할 |
| :---: | :--- | :--- |
| ① | `calculateRequiredPower(targetSpeed, material, wireLength)` | 속도·밀도·K → 목표 전력 (W). A 축 RPM → `targetSpeed = RPM×360` [deg/min] |
| ② | `convertPowerToTargetVoltage(P, R/m, L)` | P → V (`V = √(P×R)`) |
| ③ | `getAccelerationCompensationRatio(speed, accel)` | 감속 시 전력↓ — 과열 방지 |

### 클래스 구현 (개념)

```typescript
interface CuttingMaterialProfile {
  name: string; density: number; thermalK: number;
}
interface WireSpecification {
  resistancePerMeter: number; diameter: number;
}

export class ThermalCutterEngine {
  private coeffs: EngineCoefficients;

  loadCoefficients(profileId: number): void { /* D1 engine_coefficients */ }

  calculateRequiredPower(targetSpeed: number, material: CuttingMaterialProfile, wireLength: number): number {
    const k = this.coeffs.thermalK ?? material.thermalK;
    return targetSpeed * material.density * k * (wireLength / 1000);
  }

  convertPowerToTargetVoltage(requiredPower: number, wire: WireSpecification, currentLength: number): number {
    const R = wire.resistancePerMeter * (currentLength / 1000);
    return Number(Math.sqrt(requiredPower * R).toFixed(2));
  }

  getAccelerationCompensationRatio(currentSpeed: number, acceleration: number): number {
    if (currentSpeed === 0) return 0;
    const c = 1 + acceleration * 0.1;
    return Math.max(0.1, Math.min(c, 1.2));
  }

  sFromModel(requiredPower: number, wire: WireSpecification, length: number): number {
    const v = this.convertPowerToTargetVoltage(requiredPower, wire, length);
    const corrected = (v - this.coeffs.vOffset) / this.coeffs.pwmGain;
    return Math.round(Math.min(1000, (corrected / 18) ** 2 * 1000));
  }

  // S 순간 변경 시 T 도달 시각·오버슈트 — ThermalInertiaModel 위임
  planSWithInertia(targetS: number, currentT: number, tauSec: number): SPlanStep[];
}
```

> **런타임 HFS** (`Target_S = Base_S × Actual_F/Target_F`): [05 HFS](05-GCode-CAM-Pipeline.md#hfs--heat-feed-sync-보간-알고리즘-mvp-v01-필수) · `getAccelerationCompensationRatio` 는 HFS `α_accel` 로 사용.

---

## Thermal_Inertia_Model — 열적 관성 및 지연 모델링 `[MVP v0.1 필수]` {#thermal_inertia_model-- 열적 - 관성 - 및 - 지연 - 모델링 -mvp-v01- 필수}

### 현상

PWM(LASER S) 을 변경하면 **전력·전류는 즉시** 반응하지만, 니크롬선·주변 공기·K-Type 접점의 **열용량** 때문에 `wire_temp_c` 는 **지연·완만하게** 추종합니다.

| 구분 | 응답 | 대표 지연 |
| :--- | :--- | :--- |
| 전기 (S→I, V) | ms~10ms | INA219 필터 구간 |
| **열 (S→T)** | **초 단위** | 시상수 **τ ≈ 2s** (프로파일·길이·풍냉에 따라 1.5~3s) |

```text
S ↑ 즉시          T ↑ 점진 (τ 지연)
─── PWM ─────────► ─── wire_temp_c ───► 절삭 품질
     │                      │
     └── I, P 즉시          └── 목표 T 도달 전 이동 → 초기 절삭 불량
```

**초기 절삭 불량**: 가공 START 직후 첫 F 구간에서 T < T_target → 저온 절삭 (끌림·거칠기).
**오버슈트**: S 급상승 후 관성으로 T 가 목표를 넘어 S5(열폭주) 근접.

### 1 차 지연 모델 (1st-order lag)

정상상태 (steady-state) 목표 온도 `T_eq(S)` 는 `temp_curve_json` 또는 ramp 피팅 곡선에서 보간.

```text
dT/dt = (T_eq(S) − T) / τ

해석해 (S 스텝, t≥0):
  T(t) = T_eq + (T₀ − T_eq) · e^(−t/τ)

63% 도달: t = τ
95% 도달: t ≈ 3τ
```

| 기호 | 의미 | MVP 기본 | 식별 |
| :--- | :--- | :--- | :--- |
| `τ` | `thermal_tau_sec` | **2.0 s** | `/thermal-lab` `preheat`·`ramp` 로그 회귀 |
| `T_eq(s)` | S 정상 상태 T | `temp_curve_json` | 시나리오 ⑧ |
| `T₀` | 현재 `wire_temp_c` | K-Type 실측 | telemetry |
| `Ṫ` | dT/dt | — | S5 임계 10°C/s |

```typescript
/** Thermal_Inertia_Model — Workers · MockDeviceEngine · RunOrchestrator 공용 */
class ThermalInertiaModel {
  constructor(
    private tauSec: number,
    private tempCurve: (s: number) => number,  // temp_curve_json
  ) {}

  /** 이산 100ms 적분 (MockDeviceEngine · live 예측 공용) */
  stepT(currentT: number, targetS: number, dtSec = 0.1): number {
    const tEq = this.tempCurve(targetS);
    const alpha = 1 - Math.exp(-dtSec / this.tauSec);
    return currentT + alpha * (tEq - currentT);
  }

  /** S 스텝 후 T가 목표의 fraction(0.95) 도달 시간 */
  timeToReach(currentT: number, targetS: number, fraction = 0.95): number {
    const tEq = this.tempCurve(targetS);
    if (Math.abs(tEq - currentT) < 0.5) return 0;
    const ratio = (fraction * tEq + (1 - fraction) * currentT - currentT) / (tEq - currentT);
    if (ratio <= 0 || ratio >= 1) return 0;
    return -this.tauSec * Math.log(1 - ratio);
  }

  /** S 급변 시 예측 피크 T (오버슈트 없음 1차 모델 — PID 튜닝 전) */
  predictPeakT(currentT: number, stepS: number): number {
    return this.tempCurve(stepS);  // 1차 lag: asymptote = T_eq, overshoot은 2차 확장
  }

  /** τ 식별 — preheat/ramp samples_json */
  static fitTau(samples: { t: number; s: number; wire_temp_c: number }[]): number {
    // S 스텝 구간마다 T(t)=T_eq-(T_eq-T0)*exp(-t/τ) 최소자승 → median(τ)
    return 2.0; // placeholder — fit-k 파이프라인과 병렬
  }
}
```

### MockDeviceEngine — 1 차 지연 추종 · 오버슈트 예측

[03 MockDeviceEngine](03-Software-Protocol.md#mockdeviceengine-workers--ui_sim) 은 **S 를 즉시 T 로 매핑하지 않음**. `ThermalInertiaModel.stepT()` 로 100ms 마다 `wire_temp_c` 를 적분.

```typescript
interface SimThermalState {
  pwm: number;           // 명령 S
  pwmActual: number;     // ramp 후 실제 S
  wireTempC: number;     // 관성 적분 T
  wireTempPredictC: number;  // τ 선행 예측 (UI 차트)
  tauSec: number;
  overshootRisk: boolean;    // dT/dt > 8°C/s 또는 T > target+margin
}

class MockDeviceEngine {
  private thermal = new ThermalInertiaModel(2.0, s => tempCurve(s));
  private sim: SimThermalState;

  tick100ms(): void {
    this.sim.pwmActual = rampToward(this.sim.pwm, this.profile.pwm_ramp_ms);
    this.sim.wireTempC = this.thermal.stepT(this.sim.wireTempC, this.sim.pwmActual);
    const tTarget = tempCurve(this.sim.pwmActual);
    const dTdt = (this.sim.wireTempC - this.prevT) / 0.1;
    this.sim.overshootRisk = dTdt > 8 || this.sim.wireTempC > tTarget + 15;
    this.sim.wireTempPredictC = this.thermal.predictPeakT(this.sim.wireTempC, this.sim.pwmActual);
    this.emitTelemetry({ ...this.sim, simulated: true });
  }
}
```

| Mock 출력 | 용도 |
| :--- | :--- |
| `wire_temp_c` | 관성 곡선 — live K-Type 와 형상 비교 |
| `wire_temp_predict_c` | S 변경 후 예상 정상 T |
| `overshoot_risk` | UI 경고 · S5 시뮬 |
| `dT_dt` | S5(10°C/s) 접근 알림 |

### 프리 히팅 (Pre-heating) — 데이터화 · START 게이트

가공 **START 직전** `preheat_json` 시퀀스를 실행하고, **시나리오 ⑤** 로 목표 T 확인 후에만 모터·G-code 를 허용합니다.

#### `preheat_json` 구조 (canonical)

```json
[
  { "s": 300, "dwell_sec": 3, "note": "저출력 예열" },
  { "s": 650, "dwell_sec": 2, "note": "목표 T 접근" },
  { "s": 650, "dwell_sec": 0, "until": { "wire_temp_c_gte": 295 } }
]
```

| 필드 | 설명 |
| :--- | :--- |
| `s` | PWM S (0–1000) |
| `dwell_sec` | 최소 유지 시간 |
| `until.wire_temp_c_gte` | K-Type 조건 충족 시 다음 스텝 (live) |

#### `preheat_gate_json` — START 잠금

```json
{
  "min_temp_c": 290,
  "margin_c": 10,
  "soak_sec": 2,
  "require_preheat_complete": true
}
```

| 조건 | live | ui_sim |
| :--- | :--- | :--- |
| `wire_temp_c ≥ min_temp_c` | K-Type 실측 | `ThermalInertiaModel` 적분 T |
| `soak_sec` | 조건 유지 연속 시간 | 동일 |
| `require_preheat_complete` | `/thermal-lab` 또는 자동 preheat 완료 플래그 | 동일 |

```text
[가공 START 전 — Pre-heating 시퀀스]

UI START 요청
    → RunOrchestrator.state = PREHEAT
    → preheat_json[] 순차 실행 (cmd_spindle / M3 S)
    → 각 스텝: dwell + until T (관성 모델로 dwell_min ≥ 3τ 권장)
    → preheat_gate 통과?
         ├─ NO  → START 거부 · 「예열 중」배너 · wire_temp_c 게이지
         └─ YES → RUN · G-code 스트리밍 (첫 F 구간 S는 이미 T≥T_target)
```

#### dwell 시간 · τ 관계 (설계 규칙)

| 규칙 | 식 | 예 (τ=2s, T_target=300°C) |
| :--- | :--- | :--- |
| 95% 도달 최소 dwell | `dwell_min ≥ 3τ` | **≥6s** (단일 S 스텝) |
| 2 단 preheat | 저 S·긴 dwell → 고 S·짧은 dwell | S300·3s → S650·2s |
| ramp vs step | ramp 은 오버슈트↓ · step 은 τ 식별↑ | 랩 `ramp`·현장 `preheat` 병용 |

`/thermal-lab` **`preheat`** 시나리오 REC → `samples_json` → `ThermalInertiaModel.fitTau()` + `preheat_json`·`preheat_gate_json` 자동 제안 → 레시피·`POST /api/run` 에 bind.

### RunOrchestrator · live 선행 보상 (feed-forward)

S 를 **목표 T 가 되기 전에** 미리 올리는 선행 (lead) — 1 차 모델 역산.

```typescript
function leadTimeSec(currentT: number, targetS: number, tau: number): number {
  const model = new ThermalInertiaModel(tau, tempCurve);
  return model.timeToReach(currentT, targetS, 0.95);
}

// F 구간 진입 Δt 초 전에 S_target 적용 (live cmd_spindle 선행)
const lead = leadTimeSec(wireTempC, sTarget, profile.thermal_tau_sec);
if (timeToSegmentStart <= lead) applySpindle(sTarget);
```

| 모드 | 관성 모델 사용 |
| :--- | :--- |
| `ui_sim` | MockDeviceEngine 적분 + 오버슈트 UI |
| `device_dry` | preheat **생략 가능** · T 게이트 skip |
| `live` | preheat **필수** · K-Type 게이트 · S 선행 |

### τ · preheat 피팅 파이프라인

```text
/thermal-lab REC (preheat | ramp)
      ▼
samples_json { t, s, wire_temp_c }
      ├─ ThermalInertiaModel.fitTau()  → thermal_profiles.thermal_tau_sec
      ├─ temp_curve_json 갱신 (시나리오 ⑧)
      └─ preheat_json · preheat_gate_json 제안 (UI 승인)
      ▼
POST /api/run { profile_id, preheat_enforced: true }
      ▼
PREHEAT → GATE → RUN
```

### 검증 체크리스트

- [ ] Mock: S 0→650 스텝 — T 가 **즉시** 650°C 곡선값으로 점프하지 않음 (τ=2s 곡선)
- [ ] Mock: `overshoot_risk` — S 급상승 시 dT/dt 경고
- [ ] live: START 전 preheat 미완료 → **모터·G-code 거부** (시나리오 ⑤)
- [ ] live: preheat 후 첫 10mm — 저온 끌림 **없음** (현장 육안)
- [ ] `thermal_tau_sec` — ramp 로그와 Mock 곡선 RMSE < 5°C
- [ ] `dwell_sec ≥ 3τ` 미만 preheat → UI 「dwell 부족」 경고

---

## 테스트 랩 → 엔진 K 피드백 루프 `[MVP v0.1 필수]`

> **End-to-end 동기화 시퀀스** (랩 → D1 → Workers DO → WebSocket → ESP32):
> [03 K-Factor → 실시간 제어 동기화](03-Software-Protocol.md#테스트-랩--k-factor--실시간-제어-동기화-시퀀스-mvp-v01-필수)

```text
/thermal-lab REC (ramp/manual/preheat)
      ▼
thermal_test_logs.samples_json
      ▼
ThermalCalibrator.fit()  ← POST /api/thermal-calibrate/fit-k
      ├─ engine_coefficients.thermal_k
      ├─ pwm_gain · v_offset
      ├─ resistance_per_m
      ├─ temp_curve_json
      ├─ temp_calib_json          ← [Calibration_Algorithm · temp-2pt](#calibration_algorithm--실시간-온도-보정-알고리즘-mvp-v01-필수)
      └─ preheat_json
      ▼
ThermalRunSession.reloadCoeffs()     ← [03 Phase 3] Durable Object hot reload
      ▼
ThermalCutterEngine.loadCoefficients()
      ├─ RunOrchestrator → cmd_run M3 S… / cmd_spindle  ← [03 Phase 5]
      ├─ cmd_engine_profile → WireSense I_break_abs
      └─ MockDeviceEngine 동일 계수 (ui_sim)
```

### 피팅 계수

| 계수 | 저장 | 입력 | 용도 |
| :--- | :--- | :--- | :--- |
| `thermal_k` | `engine_coefficients` | F/RPM + T | `calculateRequiredPower` |
| `pwm_gain` | `engine_coefficients` | (s, bus_v) | S↔V 역보정 |
| `v_offset` | `engine_coefficients` | 잔차 | 저 PWM 선형화 |
| `resistance_per_m` | `engine_coefficients` | R + L | `convertPowerToTargetVoltage` |
| `temp_curve_json` | `thermal_profiles` | (s, T) | PID·예열 |
| `temp_calib_json` | `thermal_profiles` | 2-Point gain/offset | K-Type °C 보정 — [Calibration_Algorithm](#calibration_algorithm--실시간-온도-보정-알고리즘-mvp-v01-필수) |
| `temp_ema_alpha` | `thermal_profiles` | α | EMA 필터 |
| `s_to_power_json` | `engine_coefficients` | (s, W) | 모델 vs 실측 |

**최소 데이터**: 램프 ≥10 S 스텝 · 각 ≥2s · `wire_temp_c` 유효율 >80%.

```typescript
function sFromVoltage(v: number, vnom = 18, gain = 1, offset = 0): number {
  const corrected = Math.max(0, v - offset) / gain;
  return Math.round(Math.min(1000, Math.max(0, (corrected / vnom) ** 2 * 1000)));
}
```

---

## Calibration_Algorithm — 실시간 온도 보정 알고리즘 `[MVP v0.1 필수]` {#calibration_algorithm--실시간-온도-보정-알고리즘-mvp-v01-필수}

K-Type **Raw** → **2-Point 선형 보정** → **EMA 필터** → `wire_temp_c` (제어·인터록·텔레메트리 공용).  
WireSense ESP32 · Workers `WireHealthMonitor` · MockDeviceEngine 이 **동일 파이프라인** 을 사용합니다.

```text
MAX31855 Raw_Temp
      │
      ├─ 2-Point: T_corr = Raw × Gain + Offset     ← /thermal-lab temp-2pt
      │
      ├─ 드리프트 감시 (pre-EMA T_corr)           ← PWM 안정 ∧ |dT/dt|>50°C/s → S4
      │
      └─ EMA: T_final = α·T_corr + (1−α)·T_old   ← wire_temp_c
```

### 1. 2-Point 선형 보정 (Gain · Offset)

`/thermal-lab` 에서 확보한 **두 기준점** — **상온(냉간)** 과 **가공 온도(정상 가열 plateau)** — 으로 Gain·Offset 을 산출합니다.

| 지점 | 코드 | 측정 조건 | `T_ref` (기준) | `Raw` 출처 |
| :---: | :--- | :--- | :---: | :--- |
| **P1 · 상온** | `cold_r0` / `ambient` | `M5` · ≥60s 냉각 · `t_ambient_c` 안정 | **25°C** (또는 `t_ambient_c`) | K-Type 평균 10s |
| **P2 · 가공온도** | `preheat` / `ramp` | 목표 S(예: **650**) plateau ≥**5s** · `I_filt` 안정 | plateau `T_meas` 또는 `target_temp_c` | K-Type 평균 5s |

**산출식**

```text
Gain   = (T_ref2 − T_ref1) / (Raw2 − Raw1)
Offset = T_ref1 − Gain × Raw1

Corrected_Temp = (Raw_Temp × Gain) + Offset
```

```typescript
interface TempCalib2Point {
  raw1: number; t_ref1: number;   // 상온
  raw2: number; t_ref2: number;   // 가공 plateau
  gain: number;
  offset: number;
  calibrated_at: string;
  source_log_id?: number;
}

function fitTemp2Point(p1: { raw: number; tRef: number }, p2: { raw: number; tRef: number }): TempCalib2Point {
  const gain = (p2.tRef - p1.tRef) / (p2.raw - p1.raw);
  const offset = p1.tRef - gain * p1.raw;
  return { raw1: p1.raw, t_ref1: p1.tRef, raw2: p2.raw, t_ref2: p2.tRef, gain, offset, calibrated_at: new Date().toISOString() };
}

function correctTemp(raw: number, c: Pick<TempCalib2Point, 'gain' | 'offset'>): number {
  return raw * c.gain + c.offset;
}
```

**`/thermal-lab` 워크플로**

```text
① cold_r0 REC (M5)     → samples_json 구간 평균 → P1 { raw, t_ref=t_ambient_c }
② preheat/ramp REC     → S650 plateau 구간      → P2 { raw, t_ref=T_plateau }
③ POST /api/thermal-calibrate/temp-2pt { profile_id, log_id_p1, log_id_p2 }
      → thermal_profiles.temp_calib_json { gain, offset, … }
④ cmd_engine_profile → WireSense shadow reload
```

**저장 (`temp_calib_json` 예)**

```json
{
  "gain": 1.04,
  "offset": -3.2,
  "raw1": 28.1, "t_ref1": 25.0,
  "raw2": 318.5, "t_ref2": 312.0,
  "calibrated_at": "2026-07-07T09:00:00+09:00",
  "source_log_ids": [101, 102]
}
```

| 검증 | 규칙 |
| :--- | :--- |
| \|Raw2−Raw1\| | **≥ 50°C** 스팬 — 미만 시 UI 「2-Point 스팬 부족」 |
| \|Gain−1\| | **≤ 0.15** — 초과 시 접점·배선 재점검 |
| 재캘리브 | 집게 교체·K-Type 재용접 후 **필수** |

> K-Factor(`thermal_k`)·V 보정(`pwm_gain`)과 **독립** — 본 절은 **K-Type °C** 만 담당. [K 피드백 루프](#테스트-랩--엔진-k-피드백-루프-mvp-v01-필수).

### 2. 센서 드리프트 · 접촉 불량 감지 (S4 확장) {#2-센서-드리프트--접촉-불량-감지-s4-확장}

가공 중 **PWM(S)이 일정**한데 온도가 물리적으로 불가능한 속도로 변하면 **K-Type 접촉 불량·배선 흔들림·열전대 분리 직전** 으로 판정합니다.  
(S5 열폭주 **10°C/s** 와 구분 — 본 조건은 **센서 이상** 전용.)

| 항목 | 규칙 |
| :--- | :--- |
| PWM 안정 | `\|ΔS/Δt\| ≤ 5` / 100ms **또는** `\|S − S̄\| ≤ 10` — **≥ 200ms** 연속 |
| 급변 임계 | **`\|dT_corr/dt\| > 50°C/s`** (pre-EMA `T_corr` 기준) |
| 지속 | **≥ 100ms** 연속 — 단발 스파이크 무시 |
| 대응 | **S4** · `M5` · `reason: tc_contact_fault` |
| MAX31855 오픈 | 기존과 동일 · `reason: tc_open` |

```text
[PWM stable 200ms+] ∧ [|dT_corr/dt| > 50°C/s for 100ms]
        → executeInterlock('tc_contact_fault')  → S4 · M5
```

```typescript
class TempDriftDetector {
  private prevT = 0;
  private prevMs = 0;

  check(
    tCorr: number,
    pwmActual: number,
    pwmStable: boolean,
    nowMs: number,
  ): 'ok' | 'tc_contact_fault' {
    if (!pwmStable || this.prevMs === 0) {
      this.prevT = tCorr;
      this.prevMs = nowMs;
      return 'ok';
    }
    const dtSec = (nowMs - this.prevMs) / 1000;
    if (dtSec <= 0) return 'ok';
    const dTdt = Math.abs(tCorr - this.prevT) / dtSec;
    this.prevT = tCorr;
    this.prevMs = nowMs;
    if (dTdt > 50 && pwmActual > 0) return 'tc_contact_fault';
    return 'ok';
  }
}
```

**S4 vs S5 구분**

| ID | 조건 | `reason` | 물리 해석 |
| :---: | :--- | :--- | :--- |
| **S4** | MAX31855 오픈 | `tc_open` | 단선·오픈 서킷 |
| **S4** | PWM 안정 + **\|dT/dt\| > 50°C/s** | `tc_contact_fault` | 접촉 불량·노이즈·분리 직전 |
| **S5** | **\|dT/dt\| > 10°C/s** 2s | `thermal_runaway` | 실제 과열· runaway |

### 3. 평균 이동 필터 (EMA)

고주파 노이즈(접점 미세 진동·EMI)를 제거한 **안정 `wire_temp_c`** 를 PID·예열 게이트·S5 에 제공합니다.  
**드리프트 감지(S4)** 는 EMA **이전** `T_corr` 로 수행 — EMA 가 급변을 숨기지 않도록.

```text
Temp_final = (Alpha × New_Temp) + ((1 − Alpha) × Old_Temp)

New_Temp = T_corr (2-Point 보정 후)
Old_Temp = 이전 Temp_final
```

| 파라미터 | 필드 | MVP 기본 | 비고 |
| :--- | :--- | :---: | :--- |
| **Alpha (α)** | `temp_ema_alpha` | **0.15** | 100ms 주기 · τ_eff ≈ 0.57s |
| 주기 | — | **100ms** | K-Type 폴링과 동기 |
| 초기화 | — | 첫 `T_corr` | cold start |

```typescript
class TempEmaFilter {
  private tFinal: number | null = null;

  step(tCorr: number, alpha = 0.15): number {
    if (this.tFinal === null) {
      this.tFinal = tCorr;
      return tCorr;
    }
    this.tFinal = alpha * tCorr + (1 - alpha) * this.tFinal;
    return this.tFinal;
  }
}

/** WireSense 100ms 통합 파이프라인 */
function processWireTemp(raw: number, calib: TempCalib2Point, alpha: number): {
  wire_temp_raw: number;
  wire_temp_corr: number;
  wire_temp_c: number;
} {
  const tCorr = correctTemp(raw, calib);
  const tFinal = tempEma.step(tCorr, alpha);
  return { wire_temp_raw: raw, wire_temp_corr: tCorr, wire_temp_c: tFinal };
}
```

**α 튜닝 가이드**

| α | 응답 | 용도 |
| :---: | :--- | :--- |
| 0.05 | 느림 · 매우 안정 | S5 오검출 최소화 |
| **0.15** | MVP 균형 | PID·게이트 |
| 0.30 | 빠름 | `temp_pid` 랩 전용 |

텔레메트리: `wire_temp_raw` · `wire_temp_corr` · **`wire_temp_c`** (EMA) · `temp_ema_alpha`.

### Calibration_Algorithm 검증 체크리스트

- [ ] `/thermal-lab` cold_r0 + preheat → `temp-2pt` → plateau 오차 **±3°C**
- [ ] Gain·Offset 미적용 Raw vs 보정 후 — 300°C 구간 **±5°C** 개선
- [ ] EMA α=0.15 — 100ms 노이즈 **±8°C** → `wire_temp_c` **±2°C** 이내
- [ ] PWM 고정 · K-Type 배선 흔들기 mock → **50°C/s** 초과 · `tc_contact_fault` · 100ms 내 M5
- [ ] S5(10°C/s)와 S4(50°C/s+PWM안정) **독립** 발화 — 혼동 없음
- [ ] MAX31855 오픈 → `tc_open` (기존 S4)

---

## INA219 · K-Type 인라인 센싱

물리 배치: [01 Hardware & Motion · WireSense](01-Hardware-Motion.md#인라인-센싱--물리-배치-wiresense).

### 전기저항 측정

| 방식 | 조건 | 산식 |
| :--- | :--- | :--- |
| 동적 | PWM ON · I 안정 | `wire_res_ohm = bus_v / I_filt` |
| 냉간 | M5 · 상온 | S80 펄스 → R₀ |
| 교차검증 | ON | `R(T) ≈ R₀(1+αΔT)` vs K-Type |

α ≈ **1.0×10⁻⁴ /°C** · 허용 오차 ±8% 초과 → `sensor_mismatch`.

### WireSense 펌웨어 주기

| 주기 | 동작 |
| :--- | :--- |
| **10ms** | INA219 → 필터 → **S1~S3** |
| 50ms | `wire_res_ohm` · uplink |
| **100ms** | K-Type Raw → [2-Point + EMA](#calibration_algorithm--실시간-온도-보정-알고리즘-mvp-v01-필수) → `wire_temp_c` · **S4 드리프트** |
| 1Hz | ON 누적 · `resistance_drift_pct` |

### 3-4. INA219 PWM 노이즈 필터링 {#34-ina219- 고속 -pwm- 환경 -- 전류 - 노이즈 - 필터링}

PWM kHz 리플 → INA219 앨리어싱 → S1~S3 오검출. **MA(5) + 동적 임계** 로 해결.

```text
I_raw (10ms) → MA(5) → IIR(α=0.7) → I_filt → S1/S2
I_raw (병렬) ──────────────────────────────→ S3 (즉시)
```

```cpp
float filterCurrent(float i_raw) {
  static float buf[5], iir = 0;
  static uint8_t idx = 0;
  buf[idx++ % 5] = i_raw;
  float ma = 0; for (int i = 0; i < 5; i++) ma += buf[i];
  ma /= 5;
  iir = 0.7f * ma + 0.3f * iir;
  return iir;
}
```

**동적 단선 임계**:

```text
I_expected(s) ≈ (s/1000)² × 3.0A
I_break_abs(s) = max(0.02A, I_expected(s) × 0.15)
```

| S | `I_break_abs` (예) |
| :--- | :--- |
| ≤100 | 0.02A |
| 650 | ~0.19A |
| 1000 | ~0.45A |

| ID | 입력 | 필터 | 임계 |
| :---: | :--- | :--- | :--- |
| **S1** | `I_filt` | MA5+IIR | `< I_break_abs(s)` 300ms |
| **S2** | `I_filt` | MA5 | `> 3.5A` 50ms |
| **S3** | `I_raw` | 없음 | `> 4.2A` 또는 `dI/dt` |

텔레메트리: `shunt_a_raw` · `shunt_a`(I_filt) · `i_break_threshold` · `filter_ma_window`.

---

## 관리 시나리오 10 종 {#ina219--k-type- 열전대 - 인라인 - 센싱 - 및 - 관리 - 시나리오}

`WireHealthMonitor` (Workers / NestJS) 가 INA219·K-Type 해석.

| # | 시나리오 | 입력 | 동작 |
| :---: | :--- | :--- | :--- |
| ① | 직접 온도 PID | `wire_temp_c` | 목표 T → S 자동 |
| ② | 단선·아크·**TC 이상** | I·R·TC | M5 · S1/S3/**S4** |
| ③ | 수명·노화 | `resistance_drift_pct` | +15% 교체 권고 |
| ④ | 국부 핫스팟 | T vs R(T) | ΔT 괴리 → M5 |
| ⑤ | 예열 게이트 | T ≥ T_preheat | START 잠금 |
| ⑥ | 길이·저항 보정 | `wire_res_ohm` | L_eff → 엔진 갱신 |
| ⑦ | 열폭주 | dT/dt | >10°C/s → M5 (S5) |
| ⑧ | S↔T 캘리브 | 램프 로그 | `temp_curve_json` |
| ⑨ | 냉간 R₀ 검사 | M5 펄스 | R₀ ±5% 외 보류 |
| ⑩ | 피드 연동 | F + T | PID ±10% S 덮어씀 |

### ② 단선·아크 {#②- 단선아크 - 감지 -break--arc}

| 조건 | ID | 동작 |
| :--- | :---: | :--- |
| `pwm>0` ∧ `I_filt < I_break_abs(s)` 300ms | **S1** | M5 · latch |
| `I_raw > 4.2A` 또는 `dI/dt` | **S3** | M5 즉시 |
| TC 오픈 | **S4** | M5 · `tc_open` |
| PWM 안정 + **\|dT/dt\| > 50°C/s** | **S4** | M5 · `tc_contact_fault` — [드리프트 감지](#2-센서-드리프트--접촉-불량-감지-s4-확장) |

### ⑥ 유효 열선 길이 {#⑥- 유효 - 열선 - 길이 -- 저항 - 보정}

`L_eff = R_cold / resistance_per_m` → `ThermalCutterEngine.currentLength` 갱신.

### ⑤ 예열 게이트 · Pre-heating {#⑤- 예열 - 게이트 --pre-heating}

START 잠금: `wire_temp_c ≥ preheat_gate_json.min_temp_c` **`soak_sec` 연속** — [Thermal_Inertia_Model](#thermal_inertia_model--열적-관성-및-지연-모델링-mvp-v01-필수).

| 단계 | 조건 | 동작 |
| :--- | :--- | :--- |
| PREHEAT | `preheat_json[]` 실행 중 | 모터·G-code **거부** |
| GATE | T ≥ min · soak 충족 | START 허용 |
| RUN | gate OK | `RunOrchestrator` S 선행 (lead) 적용 |

### ⑧ 자동 S↔T 캘리브 {#⑧- 자동 -st- 캘리브 - 테스트 - 랩}

`ramp` 시 (s, T, R) → `temp_curve_json` 회귀.

### ⑨ 교대 검사 {#⑨- 교대 - 전 - 냉간 - 건강검사}

`S80` 80ms ×3 → `R_cold` · `R₀ ± 5%`.

## `WireHealthMonitor`

```typescript
class WireHealthMonitor {
  evaluate(sample: {
    busV: number; iFilt: number; iRaw: number;
    wireTempRaw: number; wireTempCorr: number; wireTempC: number;
    wireResOhm: number; pwmActual: number; r0Baseline: number;
    pwmStable: boolean; dTdtCorr: number;
  }): InterlockResult; // S1~S7 + S4 tc_contact_fault
}
```

---

## 센서 기반 인터록 S1~S9 {#센서 - 기반 - 인터록 -interlock-- 로컬 -fail-safe- 통합}

**WireSense + DLC32** 가 ms 단위 판정. 서버·UI 무관.

```text
L0  물리 E-Stop
L1  Tri-Link Fail-safe — [03 Tri-Link · S8/S9](03-Software-Protocol.md#tri-link-fail-safe--3-way-heartbeat--ghost-job-방지-mvp-v01-필수)
L2  센서 인터록 S1~S7 (본 절)
L3  A축 StallGuard — [01 A축](01-Hardware-Motion.md#a축-안전--인터록)
L4  cmd_estop
```

| ID | 이벤트 | 감지 | 임계 | 대응 | `reason` |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **S1** | 단선 | INA219 10ms | `I_filt < I_break_abs(s)` 300ms | M5→M211→latch | `wire_break` |
| **S2** | 과전류 | `I_filt` | >3.5A 50ms | M5→M211 | `overcurrent` |
| **S3** | 아크 | `I_raw` | >4.2A / dI/dt | M5 즉시 | `arc_detected` |
| **S4** | TC 오픈 · **접촉 불량** | MAX31855 오픈 **또는** PWM 안정∧**dT/dt>50°C/s** | M5 | `tc_open` · `tc_contact_fault` |
| **S5** | 열폭주 | K-Type | dT/dt>10°C/s 2s | M5→M211 | `thermal_runaway` |
| **S6** | R→∞ | INA219 | R>r0×10 | S1 동일 | `resistance_fault` |
| **S7** | 리미트 | GPIO | NC 트리거 | 전축 +M5 | `limit_hit` |
| **S8** | Device↔Server 단절 | Watchdog | ack>3s | [03 S8](03-Software-Protocol.md#통신-단절--deviceserver-fail-safe-s8-leg) | `comm_timeout` |
| **S9** | **UI 세션 상실 (Ghost Job)** | TriLink DO + ESP32 | UI TTL>5s ∧ live RUN | [03 S9 · Tri-Link](03-Software-Protocol.md#tri-link-fail-safe--3-way-heartbeat--ghost-job-방지-mvp-v01-필수) | `ui_ghost` |
| **S10** | **A 축 Stall (`A_VEL`)** | TMC StallGuard | `a_load_pct ≥ crit_pct(Ø)` 200ms | [01 StallGuard · Ø](01-Hardware-Motion.md#stallguard--모재-지름-동적-부하-임계-a_vel-mvp-v01-필수) | `a_stall` |

### S12 — Post-Process Interlock · 열선 릴레이 차단 `[MVP v0.1 필수]` {#s12--post-process-interlock--열선-릴레이-차단-mvp-v01-필수} {#s12--a_vel-중-열선-pwm-하드웨어-차단-mvp-v01-필수}

**목표**: 후공정 **RPM 모드** · **인덱싱(각도 이동)** 중 작업자가 양손으로 샌딩·도색·테이핑할 때 **열선 화상·화재** 를 원천 봉쇄합니다.

#### Heater Disable — 물리 릴레이

| 계층 | 동작 |
| :--- | :--- |
| **릴레이 (NC)** | 열선 PSU **물리 차단** — PWM MOSFET 과 **이중 차단** |
| **펌웨어** | `a_submode ∈ {rpm, index_moving}` → `DO_HEATER_ENABLE=OPEN` |
| **PWM** | MOSFET **Hi-Z** · `pwm_actual=0` |
| **프로토콜** | `cmd_spindle` · `M3 S>0` → `rejected` · `reason: post_process_heater_lock` |
| **UI** | 🔒 「열선 차단 중」·슬라이더 gray-out |
| **해제** | `M211` + 인덱싱 완료 + `manual_overdrive` 종료 시 순차 해제 |

```text
RPM 시작 (M210) 또는 G01 A (인덱싱)
    → DO_HEATER_RELAY = OPEN     ; 물리 차단
    → DO_LASER_PWM    = Hi-Z
    → heater_lock = true

RPM 정지 (M211) · 인덱싱 완료
    → (manual_overdrive 유지 시) heater_lock 유지 권장
    → machining 복귀 + 운영자 확인 후 릴레이 CLOSE
```

> 소프트웨어 `M5` 만으로는 **우발 PWM·릴레이 용착** 리스크가 남습니다. [03 Post-Process Interlock](03-Software-Protocol.md#post-process-interlock--하드웨어-안전-mvp-v01-필수).

### S1 · 열선 단선 {#s1-- 열선 - 단선 -wire-break-- 상세}

```text
PWM ON → I_filt < I_break_abs(s) 300ms 연속 → M5 · latch
```

### S2 · 과전류 {#s2-- 과전류 -overcurrent-- 상세}

`I_filt > 3.0A` 200ms → 경고 · `> 3.5A` 50ms → S2 차단.

| 상황 | I | R | ID |
| :--- | :--- | :--- | :---: |
| 단선 | →0 | →∞ | S1 |
| 과부하 | ↑ | 정상 | S2 |
| 아크 | spike | 급변 | S3 |

### `executeInterlock(event)`

```typescript
type InterlockEvent =
  | 'wire_break' | 'overcurrent' | 'arc_detected'
  | 'tc_open' | 'tc_contact_fault' | 'thermal_runaway' | 'resistance_fault' | 'limit_hit'
  | 'comm_timeout' | 'ui_ghost' | 'a_stall';  // S8 · S9 · S10

function executeInterlock(event: InterlockEvent, runMode: RunMode): void {
  if (runMode === 'live') hardM5();
  if (aMode === 'vel') hardM211();
  feedHold();
  if (event === 'wire_break' || event === 'ui_ghost' || event === 'a_stall') latchUntilAck();
  queueFailSafeEvent(event);
}
```

### 텔레메트리 · D1

| 필드 | 내용 |
| :--- | :--- |
| `sensor_flags` | `break_detected` \| `overcurrent` \| `tc_fault` … |
| `interlock_active` | latch 중 true |
| D1 | `fail_safe_events` |

### 인터록 검증 체크리스트

- [ ] S=100 예열 — S1 **미오검출** (동적 임계)
- [ ] live 단선 — 300ms 내 M5 (`I_filt`)
- [ ] `I_filt > 3.5A` → 50ms M5
- [ ] `I_raw` 아크 → S3 즉시 M5
- [ ] K-Type 분리 → `tc_open`
- [ ] PWM 안정 mock + 배선 흔들림 → `tc_contact_fault` (S4) — [Calibration_Algorithm](#calibration_algorithm--실시간-온도-보정-알고리즘-mvp-v01-필수)
- [ ] S1 latch 중 START 거부
- [ ] **S9** live RUN 중 UI 탭 종료 → Ghost Job 미발생 — [03 Tri-Link](03-Software-Protocol.md#tri-link-fail-safe--3-way-heartbeat--ghost-job-방지-mvp-v01-필수)
- [ ] UI: `I_raw` vs `I_filt` 동시 표시

---

## MVP 열·센서 마일스톤

| 순서 | 목표 |
| :---: | :--- |
| 0 | `ui_sim` — `/thermal-lab` UI·프로파일 CRUD |
| 2a | `ThermalInertiaModel` · MockDeviceEngine τ 적분 · preheat 게이트 |
| 2b | `live` + `thermal_test_active` — 실측 캘리브 · τ 피팅 |
| 2c | WireSense — INA219·K-Type 인라인 |
| 4 | 레시피·엔진 K bind · 시나리오 ⑤⑩ |
| 5 | `live` — 실측 T·R 반영 통합 가공 |

**MVP v0.1 열선 스택**: `/thermal-lab` → **2-Point·τ·K** 피팅 → **Calibration_Algorithm(EMA)** → **preheat GATE** → `ThermalCutterEngine` → `WireHealthMonitor` → `live` 가공.

---

## 관련 모듈

| 주제 | 문서 |
| :--- | :--- |
| 모듈 인덱스 | [README.md](README.md) |
| 4 축·LASER·WireSense 배선 | [01 Hardware & Motion](01-Hardware-Motion.md) |
| StallGuard · Ø 동적 임계 (S10) | [01 A축 · StallGuard](01-Hardware-Motion.md#stallguard--모재-지름-동적-부하-임계-a_vel-mvp-v01-필수) |
| WebSocket · 운영 모드 | [03 Software & Protocol](03-Software-Protocol.md) |
| Thermal_Inertia_Model · MockDeviceEngine | [03 MockDeviceEngine](03-Software-Protocol.md#mockdeviceengine-workers--ui_sim) |
| K-Factor · 랩→제어 동기화 | [03 § K-Factor 시퀀스](03-Software-Protocol.md#테스트-랩--k-factor--실시간-제어-동기화-시퀀스-mvp-v01-필수) |
| D1 `thermal_*` · UI 섹션 C | [04 Data & Operations](04-Data-Operations.md) |
