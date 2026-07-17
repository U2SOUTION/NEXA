---
doc_id: 
updated: 2026-07-17
implements_doc: 
terms_standard: []
terms_nexa: []
title: "Heating CNC — Hardware & Motion"
category: "IoT / Manufacturing"
domain: controller
status: draft
created: 2026-07-07
parent_doc: "README.md"
see_also:
  - "README.md"
  - "02-Thermal-Engine-Sensing.md"
  - "03-Software-Protocol.md"
  - "04-Data-Operations.md"
  - "07-Mechanical-Specs.md"
---

# Hardware & Motion

4 축 핫 블레이드 터닝 머신의 **기계 좌표계**, **MKS DLC32 MAX 보드 매핑**, **TMC2209 모터 제어**, **A 축 이원화 (A_POS/A_VEL)**, **열선 PWM 배선**, **ESP32·FluidNC 펌웨어** 를 정의합니다.

> 소프트웨어·WebSocket: [03 Software & Protocol](03-Software-Protocol.md)
> 열선·센서·인터록: [02 Thermal Engine & Sensing](02-Thermal-Engine-Sensing.md)
> 기계 정렬·GT2 장력: [07 Mechanical Specs](07-Mechanical-Specs.md#mechanical-alignment--하드웨어-정렬-및-물리적-교정-mvp-v01-필수)

---

## 4 축 CNC 네이밍 · 좌표계 · DLC32 MAX 보드 매핑

**기계 좌표계**, **Makerbase MKS DLC32 MAX CNC(4 축·TMC2209·레이저 PWM)**, **열선 제어 (비모터 채널)** 를 한 표준으로 묶습니다. G-code, UI Jog, FluidNC, WebSocket 은 **이 문서를 기준**으로 작성합니다.

### 기계 좌표계 (4 축 터닝)

| 축 | 문서 명칭 | 물리 동작 | G-code | 비고 |
| :--- | :--- | :--- | :--- | :--- |
| **X** | 상부 좌우 이송축 | 열선 헤드 (ㄷ자 열선) 를 자재 **길이 방향 (가로)** 으로 이동 | `G01 X…` | 상부 갠트리 |
| **Y** | 상부 앞뒤 이송축 | 열선 헤드를 **두께 (깊이) 방향** 으로 밀어 넣음 | `G01 Y…` | 단면 프로파일 핵심 |
| **Z** | 상부 상하 이송축 | 열선 헤드 **높이** 정밀 제어 | `G01 Z…` | 지름·단차 |
| **A** | 하부 자재 회전축 | 8mm 전산볼트 아이소핑크 **360° 회전** | `G01 A…` · `M210 R…` | `A_POS` 각도 / `A_VEL` RPM — [A축 제어 규정](#a축-제어-규정--tmc2209--각도-위치--연속-rpm) |

```text
        Z ↑
          │  ┌─ 열선 헤드 (ㄷ자 니크롬선) ─┐  ← X/Y/Z
          │  └────────────────────────────┘
    ══════╪══════  아이소핑크  ← A축 회전
        [A]
```

> **용어**: 「스핀들」= **열선 헤드 (Hot-Wire Head)**. FluidNC·보드에서는 Laser/Spindle PWM 명칭 유지, 부하는 니크롬 열선.

### MKS DLC32 MAX — 4 축 모터 + 열선 매핑

*Makerbase MKS DLC32 MAX · 4 축 · TMC2209 ×4 · 레이저 PWM*

| 구분 | FluidNC / 보드 | TMC2209 | 본 프로젝트 |
| :--- | :--- | :--- | :--- |
| 1 번 모터 | **X** (Motor X) | Driver 1 UART | 상부 좌우 |
| 2 번 모터 | **Y** (Motor Y) | Driver 2 UART | 상부 앞뒤 |
| 3 번 모터 | **Z** (Motor Z) | Driver 3 UART | 상부 상하 |
| 4 번 모터 | **A** (4th Axis) | Driver 4 UART | 자재 회전 |
| **열선** *(모터 아님)* | **LASER** PWM | 내장 MOSFET | `M3 S` / `M5` |

- **4 축 = 모터 4 대**. 열선은 **PWM 부하**이며 A 축과 혼동 금지.
- 리미트: 축별 홈/리미트 — FluidNC `config.yaml` 에서 X/Y/Z/A 와 동일 명칭. **소프트웨어 디바운스 (50ms)** → [리미트 필터](#리미트-소프트웨어-필터-debouncing-mvp-v01-필수).

---

## A 축 제어 규정 — TMC2209 · 각도 위치 · 연속 RPM {#a 축 - 제어 - 규정 --tmc2209-- 각도 - 위치 -- 연속 -rpm}

A 축은 하부 **아이소핑크 자재 회전 (터닝)** 전용. Driver 4 **TMC2209 UART** 구동. **위치 (각도)** 와 **속도 (RPM)** 를 G-code 레벨에서 명시적으로 분리합니다.

### A_POS vs A_VEL 이원화

| 구분 | **모드 1 · 각도 위치 (`A_POS`)** | **모드 2 · 연속 RPM (`A_VEL`)** |
| :--- | :--- | :--- |
| **G-code** | `G00`/`G01 A{deg}` | `M210 R{rpm}` 시작 · `M211` 정지 |
| **제어 루프** | TMC2209 **위치 (closed-loop)** | TMC2209 **속도 (open-loop RPM)** |
| **종료 상태** | 목표 각도 **정지·유지** | `M211` 전까지 **연속 회전** (θ 누적) |
| **전형 용도** | **단면 인덱싱** · 프로파일 각도 스텝 | **원통 거칠기 제거** · **헬리컬** X/Z 동기 패스 |
| **X/Y/Z 동기** | 4 축 선형 보간 (`G01` 블렌드) | `M210` 유지 중 X/Y/Z **독립 보간** |
| **UI** | Jog ° · CAM 인덱스 | RPM 슬라이더 · `cmd_a_vel` |

```text
[가공 시나리오별 모드 선택]

스트링 바 유선형 — 단면 4~8방향?
  └─ YES → A_POS (G01 A0 → A90 → A180 …)

원통 Ø 일정 구간 — 길이 방향 일괄 깎기?
  └─ YES → A_VEL (M210 R5 + G01 X… Z…)

단일 단면 고정 각도?
  └─ A 고정 (A_POS · ΔA=0)
```

**상태기** (`a_mode` — 텔레메트리·펌웨어 공유):

```text
        ┌──────────┐
   ┌───►│  A_IDLE  │◄─── M211 / 홈 완료
   │    └────┬─────┘
   │         │ G00/G01 A{deg}
   │         ▼
   │    ┌──────────┐     M210 R{rpm}
   │    │  A_POS   │──────────────────┐
   │    │ (이동·유지)│                  │
   │    └────┬─────┘                  ▼
   │         │ 이동 완료          ┌──────────┐
   │         └──────────────────►│  A_VEL   │
   │    G01 A 수신 시 M211 선행   │ (연속RPM)│
   └─────────────────────────────└──────────┘
```

```text
[A축 제어 계층]

G-code / UI Jog
      │
      ├─ A_POS ──► G00/G01 A{deg} F{deg/min} ──► TMC2209 Driver4 (위치 루프)
      │
      └─ A_VEL ──► M210 R{rpm} / M211 ──► TMC2209 속도 모드 (연속 회전)
                        │
                   X/Y/Z 동시 보간 가능 (live 가공)
```

### 단위 · 좌표계

| 항목 | 규칙 |
| :--- | :--- |
| **공칭 단위** | **도 (°)** — UI·텔레메트리·Jog·G-code 모두 동일 |
| **기본 평면** | `G17` (X–Y) 유지 · 터닝 프로파일은 **X–Z + A** 동기 |
| **절대/증분** | `G90` 절대 각도 · `G91` 증분 ΔA (기본 **`G90`**) |
| **각도 래핑** | 표시 0–360° · 내부 좌표는 **누적 각도** 허용 (다회전 CAM) |
| **0° 기준** | 홈 (`G28 A0` / `$H/A`) 후 자재 장착면 = 작업 zero |

### 모드 1 — 각도 위치 (`A_POS`)

```gcode
G90
G01 X120 Y0 Z34 A0   F600
G01 X120 Y0 Z34 A90  F600
G04 P0.5
```

| G-code | 의미 |
| :--- | :--- |
| `G00 A{deg}` | 최대 속도로 각도 이동 |
| `G01 A{deg} F{f}` | 지정 피드로 각도 이동 · **F 는 복합 벡터** |
| `G91 G01 A45` | 현재 각도에서 **+45°** 증분 |

```text
F_a [deg/min] = RPM × 360
예: F1800 (A만) = 5 RPM
```

**TMC2209 (Driver 4)**:
- 마이크로스텝 **1/16 또는 1/32**
- `steps_per_degree` = `(200 × microsteps × 감속비) / 360`
- UART **StallGuard** → `a_load_pct` · Ø 연동 임계 — [StallGuard · Ø](#stallguard--모재-지름-동적-부하-임계-a_vel-mvp-v01-필수)

### 모드 2 — 연속 RPM (`A_VEL`)

| M-code | 인자 | 동작 |
| :--- | :--- | :--- |
| **`M210`** | `R{rpm}` 필수 · `P{dir}` 선택 | A 축 연속 회전. `P0` CW · `P1` CCW |
| **`M211`** | — | A 축 연속 회전 **정지** |

```gcode
M3 S650
M210 R5
G01 X0 Z10 F300
G01 X200 Z10 F300
M211
M5
```

| RPM 범위 | 권장 | 비고 |
| :--- | :--- | :--- |
| 최소 | **0.5 RPM** | 아이소핑크 절삭 안정 하한 |
| 기본 | **3–8 RPM** | 10 종 레시피 기본대 |
| 최대 | **15 RPM** | `config.yaml` `a_max_rpm` · StallGuard 감시 |

```text
ω [deg/s] = RPM × 6
F_equiv [deg/min] = RPM × 360
```

**모드 전환 규칙**:
- `M210` 활성 중 `G01 A{deg}` → **`M211` 자동 선행** 후 `A_POS`
- `A_POS` 이동 중 `M210` → 이동 **완료 후** RPM 모드
- `device_dry` / `ui_sim`: `M210`/`M211` **동작 동일** (PWM 만 분기 — [03 운영 모드](03-Software-Protocol.md#운영-모드-3단계))

### X/Y/Z 와 A 동기 (헬리컬 · 터닝 패스)

| 패턴 | G-code 패턴 | A 모드 |
| :--- | :--- | :--- |
| **인덱스 터닝** | `G01 X… Z… A0` → `A90` → `A180` … | `A_POS` |
| **연속 원통·헬리컬** | `M210 R5` + `G01 X… Z…` | `A_VEL` + XYZ 보간 |
| **단일 단면** | `G01 … A{고정}` | `A_POS` |

CAM 출력 시 블록 주석:

```gcode
; NEXA_A_MODE=A_POS
G01 X120 Y0 Z34 A90 F600
; NEXA_A_MODE=A_VEL R5
M210 R5
G01 X120 Y0 Z30 F400
```

### FluidNC `config.yaml` — A 축 (초안)

```yaml
axes:
  a:
    motor:
      standard_stepper:
        step_pin: gpio.XX
        direction_pin: gpio.XX
    steps_per_degree: 8.888
    max_rate_deg_per_min: 5400
    acceleration_deg_per_sec2: 180
    motor0:
      tmc2209:
        uart_pin: gpio.YY
        run_current: 0.8A
        hold_current: 0.4A
        stallguard: true
        sg_threshold: 100

; M210 → SetAxisVelocity A, R*6 deg/s
; M211 → StopAxis A
```

### A 축 텔레메트리 · Jog

| 항목 | 규칙 |
| :--- | :--- |
| Jog A | `A_POS` 전용: `cmd_jog { axis:"A", delta_deg, feed_deg_min }` |
| 연속 회전 UI | RPM 슬라이더 → `M210` / `M211` |
| 텔레메트리 | `{ a, a_mode:"pos"\|"vel", a_rpm_cmd?, a_rpm_actual?, a_load_pct? }` |
| `a_rpm_actual` | TMC2209 속도 추정 또는 Δa/Δt (100ms) |

> WebSocket 상세: [03 WebSocket 명세](03-Software-Protocol.md#websocket-메시지--통합-명세-canonical)

### A 축 안전 · 인터록

| 조건 | 동작 |
| :--- | :--- |
| `a_load_pct` > **`a_load_warn_pct(d)`** | UI 경고 · RPM **감속 20%** |
| `a_load_pct` > **`a_load_crit_pct(d)`** | **Stall Recovery** 시도 → 실패 시 **M211 + PAUSE** · latch — [스톨 복구](#스톨-복구-stall-recovery-mvp-v01-필수) |
| `M210` 중 E-Stop | `M211` + 전축 정지 |
| `thermal_test_active=1` | **A 축 명령 거부** |
| A 홈/리미트 미설정 | `M210`·`G01 A` **차단** |

> **`A_VEL` 전용**: 임계값은 고정 80/95% **아님** — 레시피 **모재 지름 Ø** 연동 동적 임계. 상세: [StallGuard · Ø 상관](#stallguard--모재-지름-동적-부하-임계-a_vel-mvp-v01-필수).

### 후가공 · Manual Overdrive A 축 활용 `[MVP v0.1 필수]` {#후가공 --manual-overdrive-a 축 - 활용 -mvp-v01- 필수}

가공 완료 후 **샌딩·도색·테이핑** 에는 [04 섹션 G](04-Data-Operations.md#섹션-g-manual-overdrive--후가공-mvp-v01-필수) · [03 Manual Overdrive](03-Software-Protocol.md#manual-overdrive--후가공-세션-mvp-v01-필수) 세션을 사용합니다.

| 후가공 | A 축 모드 | 프로토콜 | 비고 |
| :--- | :--- | :--- | :--- |
| **샌딩** | `A_VEL` RPM 고속 | `M210` · `utility_presets.Sanding_High` | S12 **릴레이 OFF** · 탈조 시 Homing |
| **도색** | `A_VEL` RPM 저속 | `M210` · `Painting_Low` | 발 스위치 트리거 권장 |
| **테이핑** | `A_POS` 인덱싱 | `cmd_a_index` 90° 스냅 | 인덱싱 중 S12 릴레이 차단 |
| **부분 보수** | `A_POS` 임의 각 | `cmd_a_index` · 각도 휠 | |

X/Y/Z 는 **조그·Goto** 로 접근. 좌표 규약: [03 Soft-Lock Zero](03-Software-Protocol.md#후공정-좌표계-유지-규약-mvp-v01-필수).

#### Axis Isolation · E-Stop (후공정) `[MVP v0.1]`

| 조건 | X/Y/Z | A |
| :--- | :--- | :--- |
| **A-RPM** (`M210`) | Enable **유지** (Holding Torque) · 조그 외 이동 SW 차단 | S-Curve RPM · StallGuard |
| **인덱싱** | 동일 홀드 | `A_POS` 각도 이동 |
| **E-Stop (L0)** | Enable 차단 · **≤0.1s** | `M211` + 회전 즉시 정지 |

상세: [03 Axis Isolation](03-Software-Protocol.md#a축-특화-프로토콜--rpm--인덱싱-mvp-v01-필수) · [Control Handshake](03-Software-Protocol.md#제어권-전환-안전-핸드셰이크-control-handshake-mvp-v01-필수).

### 발 스위치 (Foot Pedal) · GPIO `[MVP v0.1 필수]` {#발 - 스위치 -foot-pedal--gpio-mvp-v01- 필수}

| 항목 | 규격 |
| :--- | :--- |
| 신호 | DLC32 **GPIO** 입력 (예: `GPIO_NUM_35`) · NC 페달 권장 |
| 디바운스 | **50ms** — [리미트 필터](#리미트-소프트웨어-필터-debouncing-mvp-v01-필수) 동일 |
| 논리 | UI ARM 후 · **DOWN=RPM START** · **UP=RPM STOP** |
| 배선 | 페달 COM → GND · NO → GPIO + 풀업 |

양손이 자재 작업에 사용되므로 **설정은 터치·가동은 발** — [03 발 스위치](03-Software-Protocol.md#양손-자유--발-스위치--음성-phase-2-mvp-v01--phase-2).

---

## StallGuard · 모재 지름 (Ø) 동적 부하 임계 — `A_VEL` `[MVP v0.1 필수]` {#stallguard-- 모재 - 지름 - 동적 - 부하 - 임계 -a_vel-mvp-v01- 필수}

### 현상

TMC2209 **StallGuard**(`a_load_pct`) 는 A 축 모터 샤프트에 가해지는 **실효 토크**를 UART SG_RESULT 로 추정합니다.
**X/Y 벨트 장력·UCP204 심압 정렬** 이 어긋나면 실제 stall 없이도 SG 가 트리거될 수 있습니다 — [07 Mechanical Alignment](07-Mechanical-Specs.md#gt2-벨트-장력-정량화).
핫 블레이드 터닝에서 **절삭 (열 용융) 부하**가 비슷해도, **모재 반경 R = Ø/2** 에 따라 A 축이 느끼는 토크가 달라집니다.

```text
τ_A ≈ F_t · R_eff(Ø, Z)

F_t  : 열선 접촉 원주 방향 절삭력 (속도·온도·재질)
R_eff: 현재 절삭 단면 반경 — 레시피 Ø · Z 위치(유선형)에 따라 변함
```

| 레시피 예 | Ø (mm) | R (mm) | 동일 F_t 가정 시 τ_A | 고정 80% 임계 |
| :--- | :---: | :---: | :--- | :--- |
| 소형 단면 | **8** | 4 | **낮음** | ❌ **과민** — 정상 가공도 PAUSE |
| 중형 | 20 | 10 | 중간 | △ |
| 대형 (스트링 바) | **34** | 17 | **높음** | ❌ **둔감** — 실 stall 미검출 |

**`A_POS`**: 각도 이동 구간만 짧게 부하 — 고정 임계 + 짧은 duration 으로 충분.
**`A_VEL`**: `M210` 연속 회전 + X/Z 동시 절삭 — **Ø·RPM·F** 에 따라 SG 가 지속적으로 변함 → **동적 임계 필수**.

### 동적 임계 모델

기준 지름 `d_ref` = **34 mm** (10 종 레시피 최대 Ø). 현재 job 의 `recipes.diameter_mm` = **d**.

```text
ratio = (d / d_ref)^α        ; α = 0.85 (현장 튜닝 0.7~1.0)

a_load_warn_pct(d) = clamp( warn_base × ratio,  warn_min, warn_max )
a_load_crit_pct(d) = clamp( crit_base × ratio,  crit_min, crit_max )
```

| 파라미터 | MVP 기본 | 설명 |
| :--- | :--- | :--- |
| `warn_base` | **82** | d_ref 에서 경고 (%) |
| `crit_base` | **96** | d_ref 에서 M211+PAUSE (%) |
| `warn_min` / `warn_max` | **58 / 90** | 8mm·소형 오검출 방지 상한 |
| `crit_min` / `crit_max` | **78 / 98** | |
| `α` | **0.85** | 토크~R^1 에 근접, 경험 보정 |

**10 종 레시피 예시 (α=0.85)**

| recipe | Ø mm | `a_load_warn_pct` | `a_load_crit_pct` |
| :---: | :---: | :---: | :---: |
| 1 | 8 | **58** | **78** |
| 5 | 20 | **72** | **88** |
| 10 | 34 | **82** | **96** |

```typescript
/** StallGuardLoadModel — Workers · ESP32 shadow 공용 */
interface StallGuardPolicy {
  d_ref_mm: number;       // 34
  warn_base: number;      // 82
  crit_base: number;      // 96
  alpha: number;          // 0.85
  warn_min: number; crit_min: number;
  warn_max: number; crit_max: number;
}

function dynamicStallThresholds(
  d_mm: number,
  p: StallGuardPolicy,
  material_density_factor = 1.0,
) {
  const ratio = Math.pow(d_mm / p.d_ref_mm, p.alpha);
  const rho = material_density_factor;
  return {
    warn: clamp(p.warn_base * ratio * rho, p.warn_min, 98),
    crit: clamp(p.crit_base * ratio * rho, p.crit_min, 99),
  };
}
```

### Z 구간별 유효 Ø (Phase 2 · MVP 선택)

유선형 스트링 바는 **Z 에 따라 Ø가 변함**. MVP v0.1 은 레시피 **nominal `diameter_mm`** 으로 전 구간 동일 임계.
Phase 2: CAM `gcode_template` 메타 또는 `{ z_mm, diameter_mm }[]` 보간 → `R_eff(Z)` 실시간 갱신.

```typescript
function dEffAtZ(recipe: Recipe, z: number): number {
  const profile = recipe.diameter_profile_json; // [{z, d}, …]
  if (!profile?.length) return recipe.diameter_mm;
  return lerpByZ(profile, z);
}
```

### 데이터 바인딩 · 프로토콜

| 단계 | 주체 | 동작 |
| :---: | :--- | :--- |
| 1 | UI | 레시피 선택 → `diameter_mm` · **`material_density_factor`** |
| 2 | Workers | `POST /api/run` → `StallGuardLoadModel(d, ρ)` 임계 산출 |
| 3 | Workers | **`cmd_stall_policy`** `{ diameter_mm, material_density_factor, warn, crit }` → ESP32 |
| 4 | ESP32 | `A_VEL` 중 `a_load_pct` vs **동적** warn/crit |
| 5 | telemetry | `{ a_load_pct, a_load_warn_pct, a_load_crit_pct, recipe_d_mm, material_density_factor }` |

**WebSocket `cmd_stall_policy`** (Server→Device):

```json
{
  "type": "cmd_stall_policy",
  "recipe_id": 5,
  "diameter_mm": 20,
  "material_density_factor": 1.1,
  "a_mode": "vel",
  "a_load_warn_pct": 72,
  "a_load_crit_pct": 88,
  "rpm_nominal": 5
}
```

**D1 `recipes` 확장** (선택 · per-recipe 오버라이드):

```json
// stallguard_json
{ "warn_pct": 72, "crit_pct": 88, "calibrated_at": "2026-07-07", "dry_run_peak": 68 }
```

> 스키마: [04 Data & Operations · recipes](04-Data-Operations.md#mvp-v01-d1-스키마-canonical)

### `A_VEL` 인터록 상태기

```text
M210 R{rpm} 시작
    → cmd_stall_policy { diameter_mm, warn, crit }
    → 매 100ms:
         a_load_pct < warn     → OK
         warn ≤ pct < crit     → WARN · UI · optional RPM×0.8
         pct ≥ crit (200ms)    → Stall Recovery → 실패 시 M211 · PAUSE · a_stall
         d_pct/dt > 15%/100ms  → Stall Recovery 즉시 (동일)
```

| `a_mode` | StallGuard 동적 임계 |
| :--- | :--- |
| `A_POS` | 고정 **85 / 97%** (짧은 이동) |
| **`A_VEL`** | **`dynamicStallThresholds(diameter_mm)`** |
| `device_dry` | 동일 감시 · **PAUSE 만** (PWM OFF) |
| `ui_sim` | Mock `a_load_pct ∝ RPM × (d/d_ref)^α` |

### MockDeviceEngine · `ui_sim`

```typescript
// 가상 a_load_pct — Ø·RPM 연동 (오검출 시나리오 재현)
mockLoadPct(rpm: number, d_mm: number, d_ref = 34): number {
  const base = 40 * (rpm / 5) * Math.pow(d_mm / d_ref, 0.85);
  return Math.min(99, base + noise(±3));
}
```

### 캘리브레이션 (드라이런)

1. `device_dry` + `M210 R5` + 레시피 Ø별 **모재 없음** → `a_load_pct` baseline (≈15–25%)
2. `live` 공회전 (열선 OFF) → baseline
3. `live` 실가공 peak 기록 → `stallguard_json.dry_run_peak` · crit = peak + **12%** 로 미세조정
4. `/thermal-lab` 과 **독립** — A 축 전용 탭 또는 레시피 설정

### Scan Pass 연동 (Edge Case CAM) {#scan-pass- 연동 -edge-case-cam}

[05 Scan Pass](05-GCode-CAM-Pipeline.md#scan-pass--비정형-외경-인식--f-자동-감속) 는 본 가공 전 A 축 **8~12 점** 에서 `a_load_pct` 를 샘플링합니다.

| 항목 | 규칙 |
| :--- | :--- |
| Scan 중 임계 | `warn/crit × 1.15` **완화** (접촉 탐색) |
| `a_load_pct > crit` | Scan **중단** · M5 · `irregularity_index = 1.0` |
| 본 가공 | Scan 산출 `F_adj` · 정상 동적 임계 복귀 |
| Telemetry | `job_logs.scan_result_json` — 부하 맵 보존 |

**CAM 연동 (편심 이원화)**

| 측정 | CAM 필드 | 패스별 동작 |
| :--- | :--- | :--- |
| 4 점 간극 (07) | `e_mount` | **상수** — Lead-in 전 패스 유지 |
| Scan `load_span` 잔차 | `e_shape` | **감쇠** — [Symmetry Convergence](05-GCode-CAM-Pipeline.md#3-symmetry-convergence--패스별-대칭-수렴-mvp-v01-필수) |

### 검증 체크리스트

- [ ] Ø8 레시피 · 정상 가공 — **80% 고정**이면 PAUSE → **동적 58%** 에서 정상
- [ ] Ø34 레시피 · 고부하 — **96%** 근접 시 PAUSE
- [ ] 레시피 전환 → `cmd_stall_policy` 즉시 갱신
- [ ] telemetry `a_load_warn_pct` ≠ 고정 80
- [ ] `A_POS` G01 A90 — 동적 임계 **미적용** (고정 85/97)
- [ ] `a_load_pct` 급등 15%/100ms → crit 즉시
- [ ] Scan Pass 8 점 샘플 · `irregularity_index` 산출 · crit 초과 시 중단

### 통합 인터록

| ID | 이벤트 | 조건 | `reason` |
| :---: | :--- | :--- | :--- |
| **S10** | A 축 Stall (`A_VEL`) | `a_load_pct ≥ crit_pct(d)` 200ms | `a_stall` |
| **S11** | 홈 복귀 타임아웃 | `$H`/`G28` > **1.2×** 예상 시간 | `home_timeout` |
| **S12** | Post-Process Heater Lock | `a_submode=rpm` \| index 이동 | 릴레이 OPEN · `post_process_heater_lock` | [02 S12](02-Thermal-Engine-Sensing.md#s12--post-process-interlock--열선-릴레이-차단-mvp-v01-필수) |

> S1~S9: [02 Thermal Engine · 인터록](02-Thermal-Engine-Sensing.md#센서-기반-인터록-s1s9) · S7 리미트는 **50ms 디바운스** 후 판정 — [리미트 필터](#리미트-소프트웨어-필터-debouncing-mvp-v01-필수).

---

## 리미트 · 홈 · 스톨 복구 (펌웨어 안전) {#limit-home-stall-recovery}

ESP32 FluidNC 커스텀 레이어에서 **기계적 노이즈·홈 이탈·A 축 stall** 을 소프트웨어로 1 차 처리합니다.
S7(리미트)·S10(stall)·S11(홈) 은 [02 인터록](02-Thermal-Engine-Sensing.md#센서-기반-인터록-s1s9) · [03 Fail-safe](03-Software-Protocol.md#안전-재개-프로토콜-safe-resume--pause--resume-mvp-v01-필수) 와 연동됩니다.

### 리미트 소프트웨어 필터 (Debouncing) `[MVP v0.1 필수]` {#리미트 - 소프트웨어 - 필터 -debouncing-mvp-v01- 필수}

NC 리미트 스위치·배선 EMI 에서 **50ms 미만** 짧은 LOW/HIGH 글리치가 발생할 수 있습니다.
하드웨어 RC 필터만으로는 부족한 경우가 있어, **펌웨어 디바운스** 를 S7 **`limit_hit`** 판정 **직전**에 적용합니다.

| 항목 | 규칙 |
| :--- | :--- |
| 대상 | X/Y/Z/A **모든 리미트 GPIO** (FluidNC `config.yaml` `limit_*`) |
| 임계 | **`limit_debounce_ms = 50`** — 연속 **50ms** 동일 레벨 유지 시에만 **유효 트리거** |
| 50ms 미만 | **노이즈로 간주 · 무시** (S7 미발화 · 모터 정지 없음) |
| 디버그 | `device_dry` 에서만 `limit_glitch { axis, pulse_ms }` telemetry (선택) |

```text
[리미트 디바운스 상태기 — 축별 독립]

GPIO raw ──► pulse < 50ms? ──YES──► discard (노이즈)
                  │
                  NO (≥50ms stable)
                  ▼
            limit_valid = true
                  ▼
            executeInterlock('limit_hit')  → S7 · 전축 Hold + M5
```

```cpp
// FluidNC custom — per-axis limit debounce (의사코드)
struct LimitDebounce {
  uint32_t stable_since_ms = 0;
  bool     last_raw = false;
  bool     validated = false;
};

bool limitDebounced(LimitDebounce& st, bool raw, uint32_t now_ms, uint16_t debounce_ms = 50) {
  if (raw != st.last_raw) {
    st.last_raw = raw;
    st.stable_since_ms = now_ms;
    st.validated = false;
    return false;
  }
  if (!raw) return false;  // NC: released = no limit
  if (st.validated) return true;
  if (now_ms - st.stable_since_ms >= debounce_ms) {
    st.validated = true;
    return true;
  }
  return false;
}
```

**`config.yaml` (권장)**

```yaml
# axes: … 각 축 limit_pins NC
control:
  limit_debounce_ms: 50   # MVP 고정 · Phase 2 현장 튜닝 30~80
```

> S7 정의: [02 · S7 리미트](02-Thermal-Engine-Sensing.md#센서-기반-인터록-s1s9). 디바운스 **이후**에만 GPIO → S7 매핑.

### 홈 복귀 타임아웃 `[MVP v0.1 필수]` {#홈 - 복귀 - 타임아웃 -mvp-v01- 필수}

`$H`, `$H/X`, `G28`, `G28 A0` 등 **홈 시퀀스** 시작 시, 축별 **예상 이동 시간**을 산출하고 **1.2 배**를 초과하면 **Critical Error** 로 가공·홈을 중단합니다.
(리미트 미도달·벨트 슬립·장애물 걸림 등 **무한 홈** 방지)

**예상 시간 산출**

```text
t_expected(axis) =
    |current_pos - home_switch_est| / homing_feed_rate
  + pull_off_distance / pull_off_feed
  + settle_ms / 1000

t_expected_total =
    FluidNC homing cycle 기준 축 순차 합  (또는 병렬 시 max(t_axis))
```

| 파라미터 | 출처 | MVP 예 (X 축) |
| :--- | :--- | :--- |
| `homing_feed_rate` | `config.yaml` `$Homing/Feed` | 300 mm/min |
| `pull_off` | `$Homing/Pulloff` | 2 mm |
| `settle_ms` | 펌웨어 고정 | 200 ms |

```text
timeout_ms = ceil(t_expected_total × 1.2 × 1000)

$H 시작 → homing_timer 시작
    │
    ├─ 홈 완료 (limit + pull-off OK) → timer 해제 · A_IDLE
    │
    └─ elapsed > timeout_ms
           → feedHold · live 시 M5
           → fail_safe_event { reason:"home_timeout", axis, elapsed_ms, timeout_ms }
           → job 상태 ABORT (가공 중이었을 경우)
           → UI Critical Error · 수동 점검 후 재홈 필수
```

```typescript
interface HomeTimeoutPolicy {
  margin: number;           // 1.2 — MVP 고정
  min_timeout_ms: number;   // 3000 — 짧은 축 하한
  max_timeout_ms: number;   // 120000 — 2분 상한 (A 다회전)
}

function homeTimeoutMs(tExpectedSec: number, p: HomeTimeoutPolicy): number {
  const raw = Math.ceil(tExpectedSec * p.margin * 1000);
  return clamp(raw, p.min_timeout_ms, p.max_timeout_ms);
}
```

| `reason` | ID | RESUME |
| :--- | :---: | :--- |
| `home_timeout` | **S11** | ❌ — 재홈·원인 제거 후 **새 job** |

> 홈 완료 전 `M210`/`G01` 차단은 기존 [A축 안전](#a축-안전--인터록) 규칙 유지.

### 스톨 복구 (Stall Recovery) `[MVP v0.1 필수]` {#스톨 - 복구 -stall-recovery-mvp-v01- 필수}

StallGuard **crit** (`a_load_pct ≥ crit_pct(d)` **200ms** 또는 **d_pct/dt > 15%/100ms**) 감지 시, 즉시 **PAUSE 대신 1 회 탈출 시도** 후 실패하면 정지합니다.
성공해도 **자동 가공 재개 없음** — `LOCKED_POS` 를 checkpoint 로 남기고 [Safe Resume](03-Software-Protocol.md#안전-재개-프로토콜-safe-resume--pause--resume-mvp-v01-필수) 대기.

**복구 시퀀스**

```text
crit stall 감지 (S10 전 단계)
    │
    ├─ 1. 즉시 LOCKED_POS 스냅샷 (RAM + NVS shadow)
    │      { x, y, z, a, a_mode, a_rpm_cmd, job_line, ts_ms }
    │
    ├─ 2. A축(Driver4) TMC2209 hold/run current × 1.20  (최대 rated 상한 clamp)
    │      escape_window_ms = 500
    │
    ├─ 3. 탈출 모션 (a_mode별)
    │      A_VEL: M211 → G91 G01 A-3 F30  (역 3° 저속) → 200ms settle
    │      A_POS: feed hold 유지 · 역 2° micro-jog
    │
    ├─ 4. a_load_pct 재평가
    │      pct < warn  → PAUSE · reason a_stall_recovered · Safe Resume 허용
    │      pct ≥ warn  → M211 · PAUSE · fail_safe_event(a_stall) · current 복원
    │
    └─ 5. 전류 100% 복원 · escape 1회/stall 이벤트 (연속 재시도 금지)
```

```typescript
/** Stall Recovery — ESP32 · Workers telemetry 공용 */
interface LockedPos {
  x: number; y: number; z: number; a: number;
  a_mode: 'pos' | 'vel';
  a_rpm_cmd?: number;
  job_line?: number;
  ts_ms: number;
  stall_pct: number;
  recipe_d_mm?: number;
}

interface StallRecoveryPolicy {
  current_boost_pct: number;    // 20 → Irms × 1.20
  escape_deg: number;           // -3 (역방향)
  escape_feed_deg_min: number;  // 30
  escape_window_ms: number;     // 500
  max_attempts_per_event: 1;
}

async function stallRecovery(
  pos: LockedPos,
  policy: StallRecoveryPolicy,
): Promise<'recovered' | 'failed'> {
  saveLockedPos(pos);  // NVS key: locked_pos_json
  boostMotorCurrent('A', 1 + policy.current_boost_pct / 100);
  await microJogA(policy.escape_deg, policy.escape_feed_deg_min);
  await delay(200);
  const pct = readStallGuardPct('A');
  restoreMotorCurrent('A');
  if (pct < dynamicStallThresholds(pos.recipe_d_mm ?? 34).warn) {
    pauseJob('a_stall_recovered', pos);
    return 'recovered';
  }
  hardM211();
  pauseJob('a_stall', pos);
  return 'failed';
}
```

| 단계 | 텔레메트리 / 이벤트 |
| :--- | :--- |
| LOCKED_POS 저장 | `{ locked_pos: LockedPos }` |
| 탈출 시도 | `{ stall_recovery:"attempt", current_boost:1.2 }` |
| 성공 | `fail_safe_event { reason:"a_stall_recovered" }` → Safe Resume ✅ |
| 실패 | `fail_safe_event { reason:"a_stall" }` → Safe Resume ✅ (03 동일) |

**TMC2209 전류 상한**

| Driver | MVP `Irms` | Boost ×1.20 | 비고 |
| :--- | :---: | :---: | :--- |
| A (Driver 4) | 0.8 A | **0.96 A** | `rated × 1.0` 초과 금지 — config 상한 clamp |
| X/Y/Z | — | stall recovery **미적용** | A 축 전용 |

**`A_VEL` 인터록 상태기 (갱신)**

```text
M210 R{rpm} 시작
    → cmd_stall_policy { diameter_mm, warn, crit }
    → 매 100ms:
         a_load_pct < warn     → OK
         warn ≤ pct < crit     → WARN · UI · optional RPM×0.8
         pct ≥ crit (200ms)    → Stall Recovery 1회
                               → 실패 → M211 · PAUSE · a_stall
         d_pct/dt > 15%/100ms  → Stall Recovery 즉시 (동일)
```

> `resume_checkpoint_json` · D1: [04 Data · job_logs](04-Data-Operations.md#mvp-v01-d1-스키마-canonical) — `LOCKED_POS` 스냅샷 저장.

### 펌웨어 안전 검증 체크리스트

- [ ] 리미트 글리치 **30ms** 펄스 → S7 **미발화** · 50ms+ → S7 정상
- [ ] `$H` 벨트 분리 mock → **1.2×** 초과 시 `home_timeout` · job ABORT
- [ ] Ø20 · `M210` · 인위 stall → `LOCKED_POS` telemetry · 전류 +20% 로그
- [ ] Stall Recovery 성공 → `a_stall_recovered` · Safe Resume Phase 1~4
- [ ] Recovery 실패 → `a_stall` · latch · 연속 escape **1 회만**

---

## MKS TMC2209 드라이버 — 4 축 공통 · A 축 (Driver 4) 전용

DLC32 MAX **Driver 1–4** 모두 TMC2209 UART.

| 항목 | X/Y/Z | **A (Driver 4)** |
| :--- | :--- | :--- |
| 단위 | mm | **° (도)** |
| 제어 모드 | 위치만 | **`A_POS` + `A_VEL`(RPM)** |
| 마이크로스텝 | 1/16 | **1/16~1/32** |
| UART 텔레메트리 | `load_pct` (StallGuard) | **`a_load_pct`** · RPM 추정 |
| 전류 | 1–2A | **0.6–1.0A** (자재 척·감속비) |

- **StallGuard**: A 축 부하 — **`A_VEL` 동적 임계 (Ø)** → [StallGuard · Ø 상관](#stallguard--모재-지름-동적-부하-임계-a_vel-mvp-v01-필수) · S10
- **RPM 실측**: `a_rpm_actual ≈ Δa/Δt × (1/6)` (100ms)
- Phase 2: TMC `coolStep`·`stealthChop` (저 RPM 정음)

---

## 열선 PWM — DLC32 LASER 채널 (하드웨어)

| 항목 | 내용 |
| :--- | :--- |
| 단자 | **LASER** ± (SPINDLE/BED 미사용) |
| G-code | `M3 S0`–`S1000` ON · `M5` OFF |
| 전원 | 18V / 5A PSU 권장 · 내장 MOSFET ~4–5A |
| 동시 구동 | `device_dry`: 모터만 · `live`: `G01 … A…` + `M3 S…` |

```gcode
M3 S300
G4 P3
M3 S650
G90
G01 X120 Y0 Z34 A0   F600
G01 X120 Y0 Z34 A90  F600
M210 R5
G01 X80  Y0 Z32 F400
G01 X160 Y0 Z32 F400
M211
M5
```

> 소프트 PWM 제어·캘리브: [02 Thermal Engine](02-Thermal-Engine-Sensing.md) · 운영 모드: [03 Software & Protocol](03-Software-Protocol.md)

---

## G-code · 하드웨어 정합 요약

| 항목 | 규칙 |
| :--- | :--- |
| Jog | X/Y/Z: mm · **A: ° (`A_POS` 만)** · 연속 회전은 RPM→`M210` |
| A 축 모드 | `A_POS`=`G00/G01 A` · `A_VEL`=`M210 R`/`M211` |
| 텔레메트리 | `{ x,y,z,a, a_mode,a_rpm_actual,a_load_pct, … }` |
| Phase 2 | 3 축 프리폼 CNC = **별도 장비** · 현재는 **4 축 터닝** |

운영 모드·통신 안전: [03 Software & Protocol](03-Software-Protocol.md)

---

## ESP32 (FluidNC) — 하드웨어 디바이스 필수 기능

ESP32 내장 펌웨어 (`FluidNC` 기반 커스텀) 로컬 기능:

| 기능 | 동작 |
| :--- | :--- |
| G-code 버퍼링 | **4 축 (X/Y/Z/A)** 동기 구동 · `device_dry` 시 M3/M5 생략 |
| PWM 열선 | `live` 만 MOSFET 구동 |
| 인터록 감시 | 리미트 (50ms debounce) · INA219 · K-Type — [02 Thermal](02-Thermal-Engine-Sensing.md) |
| 리미트 · 홈 · Stall | 디바운스 · `$H` 타임아웃×1.2 · `LOCKED_POS` — [펌웨어 안전](#limit-home-stall-recovery) |
| Comm Watchdog | Tri-Link · Device leg — [03 Tri-Link Fail-safe](03-Software-Protocol.md#tri-link-fail-safe--3-way-heartbeat--ghost-job-방지-mvp-v01-필수) |
| **연결 모드** | `GPIO_LINK_MODE` · SoftAP · SD mount — [03 연결 모드](03-Software-Protocol.md#연결-모드-3단계--cloud--local-ap--sd-오프라인-mvp-v01-필수) |
| **SD G-code** | `/sd/nexa/` manifest · FluidNC file job — [03 SD 워크플로](03-Software-Protocol.md#sd-카드-기반-g-code-워크플로-mvp-v01-필수) |
| **Local Portal** | SPIFFS/SD `/www` · `192.168.4.1` HTTP/WS |

**FluidNC 드라이런** (`device_dry`):
- `M3`/`M5` 로그만, LASER **미구동**
- `$DryRun=1` 시 Laser PWM Hi-Z
- 모터·Jog·`M210`/`M211` 정상

---

## 연결 하드웨어 — AP 스위치 · SD 연장 가이드 `[MVP v0.1 필수]` {#연결 - 하드웨어 --ap- 스위치 --sd- 연장 - 가이드 -mvp-v01- 필수}

인터넷 단절·현장 Wi-Fi 불안 시 **물리 스위치 한 번**으로 Cloud ↔ Local AP 를 전환하고, SD 카드는 **장비 외부**에서 탈착해 G-code 를 갱신합니다.

### AP 전환 스위치 (Cloud Mode ↔ Local Mode)

```text
[전면 패널 — 운영자 접근]

  ┌─────────────────────────────┐
  │  ( CLOUD )  ○───●  ( LOCAL ) │  ← SPDT 토글
  └─────────────────────────────┘
         │              │
    GPIO_LINK_MODE    GND
    (ESP32 IO27 예시)
```

| 항목 | 사양 |
| :--- | :--- |
| **스위치** | SPDT 토글 · IP67 방진 커버 · 전면 패널 장착 |
| **ESP32 GPIO** | `GPIO_LINK_MODE` — **LOW=CLOUD** · **HIGH=LOCAL** (내부 풀다운) |
| **디바운스** | 50ms 소프트웨어 · 채터 시 **1 회만** 모드 전환 |
| **LED** | CLOUD=파랑 · LOCAL=초록 (GPIO 경유) |
| **RUN 중** | 전환 시 PAUSE — [03 전환 시퀀스](03-Software-Protocol.md#연결-모드-3단계--cloud--local-ap--sd-오프라인-mvp-v01-필수) |

**배선 (개념)**

```text
3.3V ──[10k]── GPIO_LINK_MODE ── ESP32
                    │
              SPDT 중앙 (common)
         NC ─ CLOUD   NO ─ LOCAL
              │              │
             GND            3.3V (또는 GND 반전 논리)
```

> **Human Error 방지**: 스위치 라벨은 **CLOUD** = 「인터넷·Cloudflare」 · **LOCAL** = 「장비 Wi-Fi 만」 으로 통일. 혼동 시 Ghost Job·S8 오동작.

### SD 카드 슬롯 연장 가이드

MKS DLC32/ESP32 모듈의 microSD 는 프레임 **내부**에 있어 현장 교체가 어렵습니다. **연장 가이드**로 **측면·후면 외부 슬롯**을 제공합니다.

```text
[측면 패널 — SD 외부 접근]

  ┌── 장비 측면 ──────────────┐
  │  ┌─────────────┐          │
  │  │ microSD     │◄─ 손가락 접근
  │  │ 외부 슬롯   │          │
  │  └──────┬──────┘          │
  │         │ FFC 15cm 90°     │
  │         ▼                  │
  │    [ESP32/DLC32 SD sock]   │
  └────────────────────────────┘
```

| 부품 | 사양 |
| :--- | :--- |
| **연장 키트** | microSD **male/female** 연장 케이블 (FFC 15–30cm) 또는 PCB 슬롯 어댑터 |
| **외부 슬롯** | **푸시 - 푸시** 카드 리테이너 · 카드 **삽입 방향** 화살표 라벨 |
| **방진** | 슬롯 덮개 (고무 플랩) · 가공 분진 시 **미삽입** 권고 |
| **핫스왑** | **금지** — SD 탈착 전 **전원 OFF** + `M5` 확인 |
| **장착** | [07 측면 패널](07-Mechanical-Specs.md#sd-외부-슬롯--ap-스위치-장착-mvp-v01-필수) 브래킷 |

**SD 삽입 절차 (운영)**

1. `live`/`device_dry` **STOP** · 열선 `M5`
2. 전원 OFF (또는 ESP32 리셋 홀드)
3. 덮개 열기 → SD 탈착
4. PC 에서 `/sd/nexa/` 구조로 파일 복사 · `manifest.json` 갱신
5. SD 삽입 → 덮개 닫기 → 전원 ON
6. AP 스위치 **LOCAL** → Local Portal · **Sync-Handshake** 통과 후 manifest 확인

### ESP32 Wi-Fi · SD 핀 (참고)

| 기능 | FluidNC / ESP32 |
| :--- | :--- |
| SD SPI | `config.yaml` `sd_card:` — CS GPIO (보드 실크 기준) |
| SoftAP | `wifi:` AP 모드 · SSID `NEXA-TURNING-01` |
| STA | 현장 Wi-Fi → Cloudflare WSS (`cloud` 모드) |

---

## 열선 배선 · 전원 (Heating Cable — 하드웨어)

MKS DLC32 MAX 하나로 **4 축 모터 + 열선 PWM** 동시 구동. 열선은 **LASER MOSFET** (A 축 모터와 분리).

### DLC32 MAX LASER 단자

| 항목 | 내용 |
| :--- | :--- |
| **단자** | 실크 **`LASER`** 2 핀 → ㄷ자 니크롬선 (**A 축 모터 금지**) |
| **FluidNC** | `Laser:` PWM · `M3 S0`–`S1000` / `M5` |
| **메커니즘** | 내장 MOSFET PWM → 열선 전류 |

- `M3 S500` = 50% · `M3 S1000` = 100% · `M5` = OFF

### 전원 · MOSFET 용량

#### PSU 통합 매칭

- DLC32 메인 전원 **12–24V DC** → 모터·열선 공유
- 1200mm · Ø0.5mm 니크롬: **18V · 3A** 권장 → PSU **18V / 5A** 여유 설정

#### 내장 MOSFET 한계

- DLC32 LASER MOSFET: **~4–5A** 허용
- 하이브리드 칼날 (0.5mm 2 줄 직렬): **2.5–3A** → 안전 범위

#### 대형 열선 확장 (5A+)

- **외장 MOSFET 모듈**을 DLC32 PWM 출력과 열선 사이에 삽입
- DLC32 는 PWM 게이트만, 대전류는 외장 모듈이 부담

### 인라인 센싱 — 물리 배치 (WireSense)

```text
[PSU 18V+] ──► [INA219 High-side] ──► [DLC32 LASER MOSFET] ──► 니크롬선(+)
                                                                    │
                                              K-Type 접합점 ●───────┤ 가열 중심
                                                                    니크롬선(−) ──► GND

[K-Type 리드] ──(냉단, 전류 경로 분리)──► MAX31855 ──► WireSense ESP32
[INA219 I2C] ── 0x40 ──► WireSense ESP32 (또는 DLC32 I2C)
```

| 부품 | 역할 | 배치 |
| :--- | :--- | :--- |
| **INA219** | Vbus · I | LASER **고전압측** · 션트 **0.1Ω 1% 3W** |
| **K-Type** | `wire_temp_c` | 가열 중심 비드 용접 · **냉단 배선** |
| **MAX31855** | TC 디지털화 | WireSense SPI · **0–800°C** |
| **WireSense ESP32** | 센서 폴링 | DLC32 **UART/I2C** JSON 브릿지 |

**매립 주의**
- K-Type 리드는 **가열 전류 경로와 분리**
- 접합부 **세라믹/섬유 절연**
- 집게 슬라이딩 시 저항 보정 — [02 Thermal](02-Thermal-Engine-Sensing.md)

```text
[DLC32 FluidNC] ◄──UART JSON──► [WireSense ESP32]
       │                              │
   LASER PWM                    INA219 + MAX31855
```

---

## 핀맵 · 확장 설계

현재 **4 축 터닝** ESP32 핀맵: FluidNC 축명 **X/Y/Z/A** 와 DLC32 슬롯 **1:1** 매핑.

| 장비 | 보드 | `device_id` |
| :--- | :--- | :--- |
| 4 축 핫 블레이드 터닝 | DLC32 MAX | `turning-01` |
| WireSense (선택) | NodeMCU 등 | `wire-sense-01` |
| 3 축 프리폼 CNC *(Phase 2)* | 별도 보드 | 별도 `device_id` |

---

## MVP 하드웨어 검증 체크리스트

- [ ] X/Y/Z/A 홈·리미트 동작 (`device_dry`)
- [ ] 리미트 **50ms** 디바운스 · **30ms** 글리치 무시
- [ ] `$H` 타임아웃 **1.2×** · `home_timeout` Critical Error
- [ ] `A_POS`: `G01 A0→A90` 인덱스 정확도
- [ ] StallGuard `a_load_pct` · **Ø8/Ø34** 동적 임계 검증
- [ ] Stall Recovery · `LOCKED_POS` · 전류 +20% · 1 회 탈출
- [ ] `A_VEL`: `M210 R5` RPM · `M211` 정지
- [ ] LASER 단자 ≠ A 축 모터 단자 확인
- [ ] 18V/5A PSU · MOSFET 발열 정상 (`live` 저출력 테스트)
- [ ] WireSense UART 브릿지 · INA219/K-Type 물리 배치

---

## 관련 모듈

| 주제 | 문서 |
| :--- | :--- |
| 모듈 인덱스 | [README.md](README.md) |
| WebSocket · 운영 모드 · Fail-safe | [03 Software & Protocol](03-Software-Protocol.md) |
| ThermalCutterEngine · 인터록 · 테스트 랩 | [02 Thermal Engine & Sensing](02-Thermal-Engine-Sensing.md) |
| D1 · UI · 운영 | [04 Data & Operations](04-Data-Operations.md) |
| 비전 · MVP 전략 | [00 Vision & Overview](00-Vision-Overview.md) |
