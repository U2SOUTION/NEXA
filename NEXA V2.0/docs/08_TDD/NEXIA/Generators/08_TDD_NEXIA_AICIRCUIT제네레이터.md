# AI CIRCUIT 제너레이터 — Monaco(ESP32 펌웨어) · Ollama · Pyodide · 회로도 뷰어 (기획 정리본)

**한 줄:** Monaco **ESP32 펌웨어** SoT → **이원화** — **① SCHEMATIC** 트랙(브라우저 BOM·React Flow 회로도) · **② SIMULATION** 트랙(플랫폼 **Wokwi CLI/API** 시뮬·시리얼·검증) — 공통 `ExtractSnapshot` · 분리 산출(`CircuitInsight` vs `WokwiInsight`).

- **회로 그리기:** JS Extract + Pyodide → **SVG/React Flow** (Wokwi **미사용**)
- **시뮬레이션:** 플랫폼 **Wokwi Worker** (`wokwi-cli` + `WOKWI_CLI_TOKEN`) · (선택) 브라우저 `@wokwi/client` **임베드 프리뷰**
- **LLM·Rivet·KiCad DRC:** 플랫폼 서버 — 브라우저 → Ollama **금지**

> [`NEXIA 주요 외부 엔진들과 아키텍쳐.md`](../08_TDD_NEXIA_외부엔진및아키텍처.md) · [`AI 3D 제네레이터.md`](./08_TDD_NEXIA_AI3D제네레이터.md) · [`AI SOUND 제너레이터.md`](./08_TDD_NEXIA_AISOUND제네레이터.md) · [`WebAssembly 는 무엇인가.md`](./08_TDD_NEXIA_WebAssembly개요.md)  
> Edge 배포(ESPHome YAML·OTA): [05_PRD_NEXIA_CELL_ESPHomeYAML제너레이터웹펌웨어](../../05_PRD/NEXIA/05_PRD_NEXIA_CELL_ESPHomeYAML제너레이터웹펌웨어.md)

---

## 1. 다른 제너레이터와의 1:1 대칭

| 역할 | 3D | Sound | **Circuit (본 문서)** |
|------|-----|-------|------------------------|
| **SoT (원천)** | CadQuery Python | Pippi/SCAMP Python | **ESP32 펌웨어** (C/C++, PlatformIO) |
| 편집 UI | Monaco | Monaco | **Monaco** (language: `cpp` / `platformio`) |
| 플랫폼 LLM | `/cad/generate` → C3Dv0 | `/sound/generate` | **`/circuit/generate`** · **`/circuit/analyze`** |
| Wasm 연산 | Pyodide + OCP | Pyodide + Pippi | Pyodide + **넷리스트/BOM 조립** (skidl 또는 순수 Python) |
| **정적·고속 분석** | — | — | **브라우저 JS** (GPIO·`#include`·I2C 주소 추출) |
| 시각화 | R3F (3D) | Tone.js + Wavesurfer | **React Flow**(회로) · **Wokwi embed**(시뮬) |
| 탭 1 | 3D 부품 | 음색·SFX | **회로도 + BOM** (SCHEMATIC) |
| 탭 2 | 2D 전개도 | paper.js 시퀀서 | **Wokwi 시뮬** (SIMULATION) |
| 탭 3 | — | — | **핀맵·ESPHome handoff** |
| 외부 마감 | STEP · Blender | WAV → DAW | **Wokwi CI** · KiCad (Phase 2) |

**Video와의 차이:** Video는 Tiptap 주 UI · 모드1/2 분기. Circuit은 Monaco SoT + **SCHEMATIC / SIMULATION 이원화** (§2.0).

---

## 2. 이원화 전략 — 회로 그리기 vs Wokwi 시뮬레이션

**공통 입력:** Monaco 펌웨어 + `ExtractSnapshot` (GPIO·버스·`#include`).  
**분리 출력:** 교육·제조용 **회로도**와 실행 검증용 **시뮬**은 파이프·파일·JSON이 다르다.

```
                    [Monaco: firmware SoT — Yjs `code`]
                              │
                    [JS ExtractSnapshot — 공통]
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
     ┌─────────────────┐             ┌─────────────────┐
     │ SCHEMATIC 트랙   │             │ SIMULATION 트랙  │
     │ (회로 그리기)    │             │ (Wokwi)         │
     └────────┬────────┘             └────────┬────────┘
              ▼                               ▼
     Pyodide → CircuitInsight          WokwiProjectBuilder
     schematicGraph · BOM · netlist    diagram.json · wokwi.toml
              ▼                               ▼
     React Flow / SVG (탭1)            Wokwi Worker (wokwi-cli)
              │                      또는 @wokwi/client (탭2)
              ▼                               ▼
     BOM.csv · 교육용 PNG              WokwiInsight — serial · PASS/FAIL
```

### 2.0.1 트랙 비교

| 항목 | **SCHEMATIC** (회로 그리기) | **SIMULATION** (Wokwi) |
|------|----------------------------|-------------------------|
| **목적** | BOM·넷리스트·핀맵·교육용 회로도 | 펌웨어 **실행·시리얼·타이밍·시나리오** 검증 |
| **실행 위치** | 브라우저 (Pyodide + React Flow) | **플랫폼** `wokwi-cli` job (MVP) · embed는 보조 |
| **핵심 산출** | `CircuitInsight` | `WokwiInsight` |
| **기하 표현** | `schematicGraph` (자유 배치) | `diagram.json` (Wokwi parts·좌표) |
| **SoT 역동기** | schematic 드래그 → 펌웨어 ❌ | diagram 핀 변경 → 펌웨어 ❌ |
| **Worker** | KiCad (Phase 2, DRC) | **Wokwi CLI** (lint · sim · VCD) |

### 2.0.2 Rivet 분기 (권장)

| `circuitProfile` | 동작 |
|------------------|------|
| `SCHEMATIC_ONLY` | Extract → Pyodide → 탭1만 |
| `SIM_ONLY` | Wokwi build → job (회로도 생략 가능) |
| `BOTH` | 병렬 — `firmwareHash` 일치 시 Ethos 통과 |

### 2.0.3 동기화 규칙

- **단일 SoT:** 항상 **Monaco 펌웨어**. 트랙 간 불일치 시 **펌웨어 revision** 기준으로 SCHEMATIC·SIM **재실행**.
- **핀 번호:** `ExtractSnapshot`이 양 트랙 입력 — Wokwi `diagram.json` 생성 시 GPIO **우선**, LLM 배선 **금지**.
- **부품 매핑:** `includes[]` → Wokwi part type 테이블 (예: `DHT.h` → `wokwi-dht22`).

---

## 2.1 입력 경로 (Monaco SoT로 수렴)

```
┌─────────────────────────────────────────────────────────────┐
│  경로 A — 기존 펌웨어가 Monaco에 있음 (주 시나리오)            │
│  사용자가 pin/GPIO/라이브러리만 수정 → 「분석」               │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│  경로 B — 자연어로 시작                                       │
│  「DHT22 + OLED SSD1306 ESP32」→ Ollama → 펌웨어 초안 + BOM 힌트 │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│  경로 C — Ollama가 Monaco 코드 **일부 패치** 제안              │
│  「I2C를 21,22에서 18,19로 바꿔줘」→ diff → 사용자 승인 후 분석  │
└───────────────────────────┬─────────────────────────────────┘
                            ▼
              [Monaco: firmware SoT — Yjs `code`]
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
   [JS Pin Extractor]  [POST /circuit/analyze]  [Rivet EthosGuard]
   GPIO·bus·includes   Ollama: 부품·주석·경고      전압·전류·핀 충돌
         │                  │                  │
         └──────────────────┼──────────────────┘
                            ▼
              ┌─────────────┴─────────────┐
              ▼                           ▼
    [SCHEMATIC: Pyodide §4]      [SIM: WokwiProjectBuilder §9]
              ▼                           ▼
    [CircuitInsight §5]          [diagram.json + wokwi.toml]
              ▼                           ▼
    [탭1 React Flow]             [POST /wokwi/jobs → Worker]
              │                           ▼
              │                  [WokwiInsight §9.3]
              └───────────┬───────────────┘
                          ▼
              [탭3 핀맵 · ESPHome] · (선택) KiCad Phase 2
```

### 2.2 [A] MVP 런타임 (구현·디버깅 기준)

```
[React UI: 자연어, circuitProfile, 탭]
        ↓ HTTPS
[NEXA 플랫폼 API]
  POST /circuit/generate · /analyze · /refine
  POST /circuit/wokwi/project/build   — diagram.json 번들
  POST /circuit/wokwi/jobs            — wokwi-cli 시뮬
        ↓
[Monaco] 펌웨어 · Ctrl+Enter
        ↓
[JS Extractor] → ExtractSnapshot
        ├─ SCHEMATIC → Pyodide → CircuitInsight → 탭1
        └─ SIM → build → Wokwi Worker → WokwiInsight → 탭2
```

**실행 사이클 — AI 펌웨어 생성 (서버)**

```text
React: promptKo + boardProfile(esp32dev) + 탭 ID
  → POST /api/v1/circuit/generate
  → 플랫폼: 번역 · System Prompt(§6) · Ollama (임베디드 코드 모델)
  → { "code": "...", "draftBomHints": [...] }
  → Monaco 바인딩
```

**실행 사이클 — SCHEMATIC (클라이언트)**

```text
Monaco → ExtractSnapshot → Pyodide → CircuitInsight → React Flow (탭1)
```

**실행 사이클 — SIMULATION (플랫폼)**

```text
Monaco + ExtractSnapshot + firmwareHash
  → POST /circuit/wokwi/project/build
  → { projectZipUrl, diagramHash, wokwi.toml preview }
  → POST /circuit/wokwi/jobs { expectText?, scenario?, timeoutMs }
  → [Wokwi Worker] wokwi-cli lint → wokwi-cli run
  → WokwiInsight { serialLog, success, screenshots?, vcdUrl? }
  → 탭2: 로그 · PASS/FAIL · (선택) embed 재생
```

| 버튼 | 트랙 |
|------|------|
| **Ctrl+Enter / 「회로 분석」** | SCHEMATIC만 (클라이언트) |
| **「시뮬 실행」** | SIM — 플랫폼 job (토큰·큐) |
| **「전체 검증」** | `circuitProfile=BOTH` — 병렬 job |

- **「AI 생성」:** `/circuit/generate`
- **「AI 수정」:** `/circuit/patch` — 사용자 승인 후 적용

### 2.3 [B] 오케스트레이션 고도화 (Phase 2)

- Rivet: `RouteCircuitProfile` → `BuildWokwiProject` → `RunWokwiSim` → `MergeInsights`
- `EthosElectricalGuard` — SIM FAIL 시 APPROVED 차단
- 다중 보드(ESP32-S3, C3) · **프로젝트 전체** (여러 Monaco 파일) · 클라우드 LLM 폴백
- Sense 탭: 확정 BOM → ESPHome YAML 제너레이터로 **릴레이** (Edge 문서)

---

## 3. 절대 원칙 — SoT와 허용 영역

| ✅ Circuit 제너레이터 SoT | ❌ SoT로 삼지 않음 |
|---------------------------|-------------------|
| **Monaco 펌웨어** (GPIO·버스·include) | KiCad에서 **핀을 바꾼 뒤** 펌웨어 자동 덮어쓰기 |
| **CircuitInsight JSON** (BOM·netlist·핀맵) | LLM이 **저항값·전압**을 확인 없이 **자동 적용** |
| 사용자 **승인 후** Monaco 패치 | Schematic·`diagram.json` 편집이 **펌웨어 역동기** ❌ |
| **WokwiInsight** (시뮬 로그·판정) | Wokwi 결과로 Monaco **자동 패치** ❌ |

**KiCad Worker 역할 (Blender 3D 연동과 동형):**

| ✅ KiCad가 하는 일 | ❌ KiCad에서 하지 않는 일 |
|-------------------|-------------------------|
| 넷리스트 **DRC** · 간격 검사 | 펌웨어 **로직** 수정 |
| `.kicad_sch` · Gerber **export** | Monaco SoT **대체** |
| 플랫폼 job 큐 · 감사 로그 | 사용자 PC KiCad **필수 설치** (MVP 불요) |

**불일치 시:** KiCad DRC FAIL → JSON + 검수 UI → 사용자가 **Monaco 펌웨어** 또는 **BOM 수동 수정** → 새 `revision` → 재분석.

---

## 4. 브라우저 연산 — JS Extractor + Pyodide

### 4.1 JS Pin Extractor (고속, Wasm 불필요)

Monaco 텍스트에서 **규칙 기반** 추출 (MVP는 regex + 간단 AST; Phase 2 tree-sitter-cpp):

| 패턴 | 추출 예 |
|------|---------|
| `#define DHT_PIN 4` | GPIO 4, role=sensor |
| `pinMode(LED_BUILTIN, OUTPUT)` | GPIO, direction |
| `Wire.begin(21, 22)` | I2C SDA/SCL |
| `SPI.begin(18, 19, 23, 5)` | SPI bus |
| `#include <Adafruit_SSD1306.h>` | 부품 힌트 OLED I2C |
| `constexpr uint8_t I2C_ADDR = 0x3C` | I2C 주소 |

출력: **`ExtractSnapshot`** (§5.1) — LLM 입력·Pyodide 입력 공통.

### 4.2 Pyodide — CircuitSpec 조립

3D의 CadQuery / Sound의 Pippi와 같은 **「굽기」** 계층.

| 기능 | 구현 (MVP 우선순위) |
|------|---------------------|
| BOM merge | extract + LLM hints + **부품 라이브러리 DB** (JSON, CDN) |
| 넷리스트 | 노드·엣지 `{ ref, pin, net }` |
| **규칙 엔진** | ESP32 3.3V · I2C pull-up 4.7k · decoupling 100nF+10µF · LDO if 5V sensor |
| 레이아웃 힌트 | auto-place **휴리스틱** (완전 autorouter ❌, MVP) |

**skidl:** Pyodide 호환 **스모크 테스트 필수**. 실패 시 **순수 Python dict netlist**만 MVP.

### 4.3 실시간 정책 (Sound Tone.js와 동형)

| 트리거 | 처리 |
|--------|------|
| GPIO 슬라이더·보드 프로필 변경 (고주파) | **핀맵 테이블·하이라이트만** (JS) |
| 펌웨어 **저장·Ctrl+Enter** | SCHEMATIC 재굽기 (Pyodide) |
| **「시뮬 실행」** | Wokwi job만 (회로도 React Flow **재레이아웃 없음**) |
| ❌ 비권장 | 키 입력마다 Ollama · 시뮬마다 SCHEMATIC 전체 재계산 |

---

## 5. `CircuitInsight` JSON (회로 SoT — 펌웨어 다음 계층)

Blender `BlenderInsight` · Video `timeline`과 동일한 **플랫폼 DB 저장·웹 소비** 계약.

### 5.1 ExtractSnapshot (클라이언트 → 서버 analyze)

```json
{
  "boardProfile": "esp32dev",
  "framework": "arduino",
  "pins": [
    { "gpio": 4, "role": "dht_data", "mode": "INPUT_PULLUP", "sourceLine": 42 }
  ],
  "buses": [
    { "type": "i2c", "sda": 21, "scl": 22, "devices": [{ "hint": "ssd1306", "addr": "0x3C" }] }
  ],
  "includes": ["DHT.h", "Adafruit_SSD1306.h", "WiFi.h"]
}
```

### 5.2 CircuitInsight (통합 페이로드)

```json
{
  "schemaVersion": "1.0",
  "projectId": "proj_abc",
  "revisionId": "rev_fw_v2",
  "firmwareHash": "sha256:...",
  "computedAt": "2026-05-28T12:00:00Z",
  "bom": {
    "lines": [
      { "ref": "U1", "mpn": "ESP32-WROOM-32", "qty": 1, "category": "mcu" },
      { "ref": "U2", "mpn": "SSD1306", "qty": 1, "category": "display" },
      { "ref": "R1", "value": "4.7k", "qty": 2, "category": "resistor", "note": "I2C pull-up" },
      { "ref": "C1", "value": "100nF", "qty": 1, "category": "capacitor", "note": "ESP32 decoupling" }
    ]
  },
  "netlist": {
    "nets": [
      { "name": "I2C_SDA", "nodes": [{ "ref": "U1", "pin": "GPIO21" }, { "ref": "U2", "pin": "SDA" }, { "ref": "R1", "pin": "1" }] }
    ]
  },
  "pinmap": {
    "rows": [
      { "gpio": 4, "signal": "DHT_DATA", "connectedTo": "J1-1", "warn": null },
      { "gpio": 21, "signal": "I2C_SDA", "connectedTo": "U2-SDA", "warn": null }
    ]
  },
  "warnings": [
    { "code": "MISSING_PULLUP", "severity": "warn", "message": "I2C pull-up not explicit in firmware; added R1,R2 by rule" }
  ],
  "ethos": { "maxSupplyV": 3.3, "approved": true },
  "schematicGraph": {
    "nodes": [{ "id": "U1", "type": "mcu", "x": 100, "y": 200 }],
    "edges": [{ "from": "U1:21", "to": "U2:SDA", "net": "I2C_SDA" }]
  },
  "status": "PASS"
}
```

| 필드 | 웹 처리 |
|------|---------|
| `bom` | BOM 테이블 · export CSV · 구매 링크(Phase 2) |
| `netlist` / `schematicGraph` | 탭1 회로도 렌더 |
| `pinmap` | 탭2 · Monaco **GPIO 주석 제안** (자동 적용 ❌) |
| `warnings` | 검수 패널 · Ethos |
| `firmwareHash` | Monaco revision과 **동기 검증** |

### 5.3 API (권장)

| API | 입력 | 출력 |
|-----|------|------|
| `POST /api/v1/circuit/generate` | `promptKo`, `boardProfile` | `{ code, draftBomHints?, draftPromptEn? }` |
| `POST /api/v1/circuit/analyze` | `code`, `extractSnapshot`, `revisionId` | LLM `{ bomHints[], warnings[], comments[] }` — 클라이언트가 Pyodide와 merge |
| `POST /api/v1/circuit/insights` | `CircuitInsight` | DB 저장 |
| `GET .../revisions/{rev}/circuit/insight/latest` | — | 최신 insight |
| `POST /api/v1/circuit/kicad/jobs` | `revisionId`, `insightId` | Phase 2 — KiCad Worker |
| `POST /api/v1/circuit/wokwi/project/build` | `code`, `extractSnapshot`, `boardProfile` | `{ projectZipUrl, diagramHash, files[] }` |
| `POST /api/v1/circuit/wokwi/jobs` | `revisionId`, `diagramHash`, `simOptions` | `{ jobId, status }` |
| `GET /api/v1/circuit/wokwi/jobs/{id}` | — | `WokwiInsight` · artifacts |
| `GET /api/v1/circuit/wokwi/embed-config` | `revisionId` (선택) | Phase 2 — `@wokwi/client` 단기 설정 |

**`simOptions` 예:**

```json
{
  "timeoutMs": 30000,
  "expectText": "WiFi connected",
  "failText": "Guru Meditation",
  "scenario": "tests/boot.yaml",
  "serialLogFile": "sim.log",
  "screenshotPart": "oled1",
  "screenshotTimeMs": 5000,
  "vcdFile": true
}
```

---

## 6. Ollama · 프롬프트 · 모델 라우팅

**C3Dv0(CAD) · Pippi(Sound)와 분리** — **임베디드·회로 전용** 라우팅.

| 호출 | 모델 (예) | System Prompt 핵심 |
|------|-----------|-------------------|
| `/circuit/generate` | Qwen2.5-Coder · CodeLlama · fine-tuned embedded | ESP32 Arduino idioms · **GPIO 표만** · hallucination 금지 |
| `/circuit/analyze` | 동일 + 작은 컨텍스트 | ExtractSnapshot **만** 신뢰 · 부품은 library ID 매칭 우선 |
| `/circuit/patch` | diff 전용 | **한 번에 한 bus/pin** · 전체 파일 재작성 금지 |

**한국어 UI:** 3D §3.1 동형 — 플랫폼에서 번역·`draftPromptEn` · 치수·핀 번호 **보존**.

**Rivet (Phase 2):**

| 노드 | 역할 |
|------|------|
| `EthosElectricalGuard` | 5V 센서 on 3.3V GPIO · 전류 합 · USB-only 전력 |
| `NormalizeBom` | MPN 중복 · ref designator 규칙 |
| `HandoffESPHome` | 확정 pinmap → Edge YAML 제너레이터 payload |
| `RouteCircuitProfile` | `SCHEMATIC_ONLY` \| `SIM_ONLY` \| `BOTH` |
| `BuildWokwiProject` | ExtractSnapshot → `diagram.json` (규칙 테이블) |

---

## 7. UI · 탭 · NEXA 7탭 매핑

| 탭 (앱) | 트랙 | 내용 | export |
|---------|------|------|--------|
| **탭 1 — 회로도** | SCHEMATIC | React Flow · BOM · net 하이라이트 | `BOM.csv`, `CircuitInsight.json` |
| **탭 2 — 시뮬레이션** | SIMULATION | Wokwi job 상태 · serial · embed · 시나리오 | `WokwiInsight.json`, `sim.log`, VCD |
| **탭 3 — 핀맵·배선** | 공통 | GPIO · ESPHome handoff | `pinmap.csv` |

| NEXA 탭 | Circuit 연동 |
|---------|--------------|
| **0 Cockpit** | 프로젝트·revision · analyze job 상태 |
| **1 Ethos** | 전압·전류·승인 · `ethos.approved` |
| **3 Glos** | **Monaco 펌웨어 SoT** · 회로 문서 |
| **4 Aionos** | **Wokwi serial** · VCD · GPIO 타임라인 차트 |
| **6 Sense** | 확정 → ESPHome · OTA 파이프 (Edge) |

**Yjs 키 (권장):**

| 키 | 소비자 |
|----|--------|
| `code` (Y.Text) | Monaco ↔ Extractor |
| `board_profile` (Y.Map) | ESP32 variant |
| `circuit_insight` (Y.Map) | SCHEMATIC — 회로도 · BOM |
| `wokwi_insight` (Y.Map) | SIM — jobId · serial · status |
| `circuit_profile` (Y.Map) | `SCHEMATIC_ONLY` \| `SIM_ONLY` \| `BOTH` |
| `workflow` (Y.Map) | Rivet |

---

## 8. 시각화 스택 (R3F/Tone 대칭)

| 레이어 | 기술 | 역할 |
|--------|------|------|
| 그래프 | **React Flow** 또는 **custom SVG** | 부품 심볼 · net 라우팅 (orthogonal) |
| 심볼库 | JSON footprint library | ESP32 module, R, C, generic IC |
| 3D (선택) | R3F | **PCB 3D 미리보기** — Phase 2, KiCad export 후 |
| 실시간 | JS | net hover · pin highlight · **Ollama 호출 없음** |

MVP: **자동 배치 휴리스틱** + 사용자 **드래그 보정** (보정은 `schematicGraph` 로컬만, **펌웨어 역동기 ❌**).

---

## 9. Wokwi 연동 — SIMULATION 트랙 (플랫폼 Worker)

**역할:** Monaco 펌웨어를 **실제 시뮬 환경**에서 실행·검증. **회로도 그리기와 분리** — Wokwi `diagram.json`은 시뮬 정확도용, `schematicGraph`는 교육·BOM용.

### 9.1 아키텍처

```
[Monaco firmware + ExtractSnapshot]
        ↓ HTTPS
POST /circuit/wokwi/project/build
        ↓ 플랫폼 (Python WokwiProjectBuilder)
  · wokwi.toml  — board: esp32-devkit-v1, firmware 경로
  · diagram.json — parts[] · connections[] (라이브러리 매핑)
  · 소스 .ino / .cpp (Monaco 복사) · (선택) 사전 빌드 ELF
        ↓ Asset zip → 내부 스토리지
POST /circuit/wokwi/jobs
        ↓ Docker Worker (wokwi-cli in PATH)
  1. wokwi-cli lint
  2. wokwi-cli <dir> --timeout --expect-text --scenario ...
        ↓
WokwiInsight JSON + serial.log + (선택) screenshot.png · .vcd
        ↓
[웹 탭2] · Aionos 차트 · Video TECH_ANIM handoff (시리얼 이벤트)
```

**인증:** `WOKWI_CLI_TOKEN` — **플랫폼 시크릿만** (브라우저·사용자 PC에 토큰 노출 ❌).  
**참고:** [Wokwi CLI](https://docs.wokwi.com/wokwi-ci/cli-usage) · [CI Dashboard](https://wokwi.com/dashboard/ci)

### 9.2 WokwiProjectBuilder (diagram.json 생성)

| 입력 | 규칙 |
|------|------|
| `boardProfile` | `esp32-devkit-v1` · `esp32-s3-devkitc-1` 등 Wokwi board id |
| `pins[]` | MCU `esp32` part에 GPIO 연결 |
| `includes[]` | `partMapping.json`: `DHT.h` → `wokwi-dht22`, `SSD1306` → `wokwi-ssd1306` |
| `buses.i2c` | SDA/SCL net — pull-up은 diagram에 **저항 part** 추가 |
| LLM | 배선 **금지** — 미매핑 include는 `warnings` + 수동 템플릿 |

**lint:** job 전 `wokwi-cli lint` — unknown part · invalid pin → job **FAIL** (빌드 단계에서 차단).

### 9.3 `WokwiInsight` JSON

```json
{
  "schemaVersion": "1.0",
  "revisionId": "rev_fw_v2",
  "firmwareHash": "sha256:...",
  "diagramHash": "sha256:...",
  "jobId": "wokwi_job_456",
  "computedAt": "2026-05-28T14:00:00Z",
  "lint": { "success": true, "warnings": [] },
  "simulation": {
    "success": true,
    "timeoutMs": 30000,
    "exitCode": 0,
    "expectTextMatched": true,
    "failTextFound": false,
    "durationSimMs": 12400
  },
  "serialLog": "...\nWiFi connected\n",
  "artifacts": {
    "serialLogUrl": "asset://.../sim.log",
    "screenshotUrl": "asset://.../oled.png",
    "vcdUrl": "asset://.../logic.vcd",
    "projectZipUrl": "asset://.../wokwi-bundle.zip"
  },
  "scenarioResults": [{ "name": "boot", "passed": true }],
  "status": "PASS",
  "statusReason": null
}
```

| 필드 | 웹 처리 |
|------|---------|
| `lint` | diagram 빌드 오류 — Monaco·매핑 테이블 수정 안내 |
| `simulation.success` | Ethos · APPROVED · Sense OTA **게이트** (정책) |
| `serialLog` | 탭2 콘솔 · Aionos |
| `artifacts.vcdUrl` | 로직 분석기 뷰 (Phase 2) |

### 9.4 브라우저 `@wokwi/client` (보조 — Phase 2)

| 모드 | 용도 |
|------|------|
| **Worker-only (MVP)** | CI형 `expect-text` 검증 — 재현성·감사 |
| **Embed (Phase 2)** | 탭2 인터랙티브 프리뷰 — **플랫폼이 embed 설정만** 내려줌 |

- Embed는 **시뮬 UX**용; **공식 판정**은 Worker `WokwiInsight` 기준.
- VS Code Wokwi 확장과 동일 `wokwi.toml` + `diagram.json` — 로컬 개발 후 NEXA zip 업로드 가능.

### 9.5 Wokwi vs KiCad vs SCHEMATIC

| 도구 | 트랙 | SoT 대체 |
|------|------|----------|
| React Flow | SCHEMATIC | ❌ |
| Wokwi | SIMULATION | ❌ |
| KiCad Worker | 제조 export (Phase 2) | ❌ |

---

## 10. KiCad Worker (Phase 2 — SCHEMATIC 마감)

```
[CircuitInsight JSON + symbol library]
        ↓ 내부망 job queue
[KiCad Worker — kicad-cli / pcbnew scripting]
  · netlist import
  · DRC
  · .kicad_sch · Gerber zip
        ↓
POST .../circuit/kicad/jobs/{id}/artifacts
        ↓
[웹] DRC 리포트 · download · Physis 썸네일
```

- **형상(회로 연결) SoT:** 여전히 **펌웨어 + CircuitInsight** — KiCad는 **검증·제조 export**만.
- MVP는 **JSON + SVG + CSV**만으로 가치 전달 가능.

---

## 11. Edge · ESPHome와의 관계

| Circuit 제너레이터 | Edge ESPHome YAML 제너레이터 |
|-------------------|------------------------------|
| **회로·BOM·핀맵** (하드웨어 관점) | **동작·센서·OTA** (펌웨어 배포 관점) |
| Monaco **C++ / Arduino** SoT | **YAML** SoT |
| `HandoffESPHome` 릴레이 | pin·entity 자동 생성 |

**권장 흐름:** Circuit에서 GPIO 확정 → `pinmap` JSON → Edge 캔버스 **prefill** → YAML 빌드·OTA.

---

## 12. 비용·데이터 3축

| 축 | Circuit 포함 | 비용 |
|----|--------------|------|
| **A. 클라이언트** | SCHEMATIC: Extract · Pyodide · React Flow | 사용자 CPU ≈ 0 |
| **B. 플랫폼 LLM** | generate · analyze · patch · Rivet | GPU·토큰 |
| **C. Worker·외부** | **Wokwi CLI job** · KiCad · insight DB · Wokwi 토큰 할당 | CPU·큐·API |

---

## 13. 구현 순서 제안 (MVP → Phase 2)

**SCHEMATIC 트랙**

1. Vite + React — Monaco · `circuitProfile`
2. JS Extractor · Pyodide · CircuitInsight
3. React Flow 탭1 · BOM export
4. `/circuit/generate` · `/analyze` 스텁

**SIMULATION 트랙 (Wokwi)**

5. `partMapping.json` — include → Wokwi part id
6. `WokwiProjectBuilder` — `diagram.json` · `wokwi.toml` zip
7. Docker **Wokwi Worker** — `WOKWI_CLI_TOKEN` · `lint` + run
8. `/circuit/wokwi/jobs` · `WokwiInsight` DB · 탭2 UI
9. Rivet `RouteCircuitProfile` · SIM FAIL → Ethos

**공통·확장**

10. 탭3 pinmap · ESPHome handoff
11. `@wokwi/client` embed (Phase 2)
12. KiCad Worker (Phase 2)

---

## 14. MVP 성공 기준

**SCHEMATIC**

- 펌웨어 수정 → **5초 이내** BOM·회로도 (Extract+Pyodide, LLM 없이)
- KiCad 없이 BOM.csv · SVG export

**SIMULATION**

- 동일 revision → `wokwi/project/build` → **lint PASS**
- `wokwi-cli` job → `expectText` 매칭 · `WokwiInsight.status=PASS`
- **Wokwi 토큰** 플랫폼만 보유 · 브라우저 직접 CLI 호출 0건

**공통**

- 자연어 → 펌웨어 초안 + BOTH 프로필 시 **회로·시뮬** 각각 갱신
- 브라우저 → Ollama **직접 호출 0건**

---

## 15. 리스크 · 미결정

| 항목 | 대응 |
|------|------|
| LLM 부품 환각 | SCHEMATIC: library 우선 · SIM: **partMapping 규칙만** |
| diagram vs schematic 불일치 | **이원화 유지** — `firmwareHash`로 각각 재빌드 |
| Wokwi 미지원 부품 | `lint` FAIL · 수동 diagram 템플릿 |
| ELF 빌드 | MVP: Arduino 스케치 단순 빌드 또는 Worker `platformio run` (Phase 2) |
| skidl Pyodide | SCHEMATIC MVP는 pure Python netlist |
| PlatformIO vs Arduino | MVP `esp32-devkit-v1` 하나 |

---

*상태: v2 — SCHEMATIC/SIM 이원화 · Wokwi Worker(`wokwi-cli`) · `WokwiInsight` · 탭1/2/3 · KiCad Phase 2.*
