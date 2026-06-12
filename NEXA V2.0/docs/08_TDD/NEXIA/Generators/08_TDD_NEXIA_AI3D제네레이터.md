---
doc_id: TDD-026
title: "AI 3D 제너레이터"
category: "08_TDD"
domain: NEXIA
status: published
created: 2026-06-10
updated: 2026-06-10
parent_doc: TDD-010
terms_standard: ["pyodide", "webassembly", "three-js", "monaco", "ollama"]
terms_nexa: ["AI3D", "CadQuery", "R3F", "OCP-wasm"]
tags: ["doc/cat/08-tdd", "doc/domain/nexia", "std/pyodide", "std/webassembly", "std/three-js", "std/monaco", "std/ollama", "nexa/AI3D", "nexa/CadQuery", "nexa/R3F", "nexa/OCP-wasm"]
---
# React + Monaco + Pyodide + OCP.wasm + Three.js(R3F) + Ollama(C3Dv0) 중심 정리

**브라우저:** 자연어 입력 → **NEXA 플랫폼 API**가 CadQuery(Python) 코드 생성 → Monaco 편집 → **Pyodide+OCP.wasm** 연산 → R3F로 3D/2D 표시 → STEP/DXF.

- **CAD·메시·렌더:** 사용자 브라우저 (Wasm) — **CAD 연산 서버 없음**
- **LLM(C3Dv0·번역·오케스트):** **플랫폼 웹 서버** (Ollama + 필요 시 클라우드 모델) — 사용자 PC에 Ollama 설치 **불요**

> Wasm·Pyodide 배경: [`WebAssembly 는 무엇인가.md`](./WebAssembly%20는%20무엇인가.md)  
> **웹 원천 → Blender 검수·시뮬:** [`AI 3D Blender 백엔드 연동.md`](./08_TDD_NEXIA_AI3DBlender백엔드연동.md)

---

## 1. 데이터 흐름 (두 레벨)

| 레벨 | 이름 | 포함 범위 |
|------|------|-----------|
| **A. MVP 런타임** | 사용자가 체험하는 전체 경로 | React → **플랫폼 LLM API** → Monaco → Pyodide → R3F → export |
| **B. 오케스트레이션 고도화** | 같은 플랫폼 서버 안에서 확장 | 다중 에이전트·모델 라우팅·클라우드 폴백·감사 로그 (Phase 2) |

§8은 **브라우저 엔진(A의 Pyodide·R3F)** 을 먼저 검증한 뒤, **플랫폼 LLM API**를 연결합니다. Ollama는 처음부터 **서버에만** 둡니다.

### 1.1 [A] MVP 런타임 파이프 (구현·디버깅의 기준)

```
[React UI: 자연어, 슬라이더, 탭]
        ↓  HTTPS (인증·레이트리밋)
[NEXA 플랫폼 API]  예: POST /api/v1/cad/generate
        ↓  (서버 내부)
[오케스트레이션 — MVP는 얇게]  탭·§3.1 번역·System Prompt 조립
        ↓
[Ollama C3Dv0]  (플랫폼 서버 localhost/내부망)  │  필요 시 클라우드 LLM 폴백
        ↓
[CadQuery Python 문자열] → JSON 응답
        ↓
[Monaco] 편집 · Ctrl+Enter / Run
        ↓
[Pyodide + OCP.wasm]  ← 브라우저만, 서버 CAD 연산 없음
        ↓
[ToMesh 등 → JSON] → [R3F] 3D / 2D 뷰
        ↓
[보내기] .STEP(탭1) / .DXF(탭2)
```

**브라우저는 Ollama에 직접 붙지 않음** (`localhost:11434` 호출 금지). API 키·모델 버전·라우팅은 플랫폼만 제어합니다.

**실행 사이클 — AI 코드 생성 (서버)**

```text
React: 사용자 한국어/영어 + 탭 ID + 보정 메타
  → POST /api/v1/cad/generate
  → 플랫폼: 번역(§3.1) → System Prompt(§3.1.2) → Ollama C3Dv0 (또는 라우터)
  → 응답: { "code": "import cadquery as cq\n..." }
  → Monaco value 바인딩
```

**실행 사이클 — CAD·렌더 (클라이언트만)**

```text
React: width 등 state
  → pyodide.globals.set('USER_WIDTH', width)
  → runPythonAsync(monaco 코드 + 보정식)
  → ToMesh(result) → JSON.stringify
  → setMeshData → R3F geometry 갱신
```

- **Ctrl+Enter / Run:** Pyodide 사이클만 트리거 (이미 Monaco에 있는 코드)
- **「AI 생성」버튼:** 플랫폼 API 사이클
- 슬라이더 `onChange` → globals → Pyodide 재실행 (서버 불필요)
- **메시 변환:** `ToMesh` + JSON → R3F `bufferGeometry` (서버 `toThreejs()` CAD VM 아님)

### 1.2 [B] 오케스트레이션 고도화 (Phase 2 — 동일 플랫폼 서버)

```
[인간 + AI 기획 / 팀·탭 맥락]
        ↓
[오케스트레이션]  에이전트 할당 · 할루시네이션 가드 · 모델 라우터
        ├─ Ollama: C3Dv0, 소형 번역 모델
        └─ 클라우드: 고난도 요청·품질 폴백 (OpenAI 등 — 정책·비용에 따라)
        ↓
[CadQuery Python] → [Monaco] → [Pyodide] → [R3F]
```

- **MVP:** §1.1의 “얇은 오케스트”(탭 분기·번역·프롬프트 템플릿)만 서버에 구현해도 됨.
- **Phase 2:** NEXA 에이전트 허브·다단계 프롬프트·A/B 모델 비교 등 **같은 API 뒤**에서 확장.

---

## 2. 역할 분담 (스택 맵)

| 레이어 | 기술 | 실행 위치 | 역할 |
|--------|------|-----------|------|
| **UI** | React (Vite) | 브라우저 | 탭·보정 UI·Monaco·R3F |
| **플랫폼 API** | HTTPS REST (또는 tRPC 등) | **NEXA 웹 서버** | 인증, `/cad/generate`, 스트리밍 응답 |
| **오케스트레이션** | NEXA 서비스 코드 | **플랫폼 서버** | §3.1 번역·프롬프트 조립·모델 라우팅 |
| **LLM** | Ollama `joshuaokolo/C3Dv0` (+ 선택 클라우드) | **플랫폼 서버** (GPU/CPU) | 자연어 → CadQuery 코드 |
| **코드 편집** | Monaco | 브라우저 | 표시·수정·Pyodide 트리거 |
| **CAD 연산** | Pyodide + OCP.wasm | 브라우저 | CadQuery 실행·ToMesh |
| **시각화** | Three.js + R3F | 브라우저 | 3D/2D 뷰 |

---

## 3. 단계별 메커니즘

### ① 오케스트레이션·프롬프트 조립 (플랫폼 — [B] 확장, MVP는 얇게)

- **역할:** 사용자 입력(한국어 포함)을 C3Dv0에 맞는 **System + User 프롬프트**로 변환합니다.
- **행동:** 탭(3D/2D), §4.1 전개도 규칙, 치수 보존 번역, 에이전트 템플릿(Phase 2)을 적용한 뒤 **서버 내부 Ollama** 또는 클라우드로 호출합니다.

### ② 플랫폼 LLM → Monaco (코드 생성 — [A] 전반)

- **역할:** `POST /api/v1/cad/generate` 등으로 **CadQuery Python 문자열**만 브라우저에 반환합니다.
- **행동:** Monaco `value` 바인딩 → 사용자 수정 → **Ctrl+Enter** 로 Pyodide 실행 (§③).
- **한국어 UI:** §3.1 — 번역·정규화는 **플랫폼 오케스트**에서 처리 (사용자 Ollama 불필요).

### ③ Pyodide + R3F (클라이언트 — [A] 후반)

- **역할:** 생성된 코드·보정값을 **브라우저 Wasm**에서만 실행합니다.
- **행동:** ToMesh → R3F; **3D 솔리드·메시는 CAD 서버로 전송하지 않음** (LLM 입력 텍스트만 서버 경유 — §7.1).

### 3.1 C3Dv0 · 한국어 입력과 번역 기반 프롬프트

C3Dv0는 **플랫폼 서버의 Ollama**에서 동작합니다. 한국어 이해가 불안할 때 **서버에서** 번역·프롬프트 조립 후 C3Dv0에 넘깁니다.

```
[사용자 한국어]  (React — 표시·저장)
        ↓  HTTPS
[플랫폼 API / 오케스트]
        ↓
[번역 단계]  §3.1.1 (서버 Ollama 소형 모델 · 규칙 · 클라우드 · 사용자 확인)
        ↓
[영어(등) User + 탭별 System]  §3.1.2
        ↓
[Ollama C3Dv0 @ 플랫폼]
        ↓
[Monaco] → [Pyodide] …
```

| 원칙 | 설명 |
|------|------|
| **UI 언어 ≠ 모델 언어** | 화면은 한국어, C3Dv0 **User 메시지**는 서버에서 번역·정규화 가능 |
| **치수·단위 보존** | `50mm`, `R3`, `M3` 등 번역 시 변형 금지 |
| **실패 대비** | 직통 재시도 → 번역 경로 → (선택) 사용자에게 영어 초안 확인(§3.1.1 D) |
| **클라이언트 Ollama 없음** | 모든 LLM 호출은 플랫폼 API 뒤에서만 |

#### 3.1.1 번역 단계 구현 옵션 (플랫폼 서버)

| 방식 | 설명 | 비고 |
|------|------|------|
| **A. 플랫폼 Ollama 2차 호출** | 같은 서버 Ollama에 소형 모델로 “CAD용 영어 지시문, 수치 유지” | **권장** — 오케스트와 동일 인프라 |
| **B. 규칙 + 템플릿** | 한국어 패턴 → 고정 영어 템플릿 | 비용 0, 단순 요청에 강함 |
| **C. 클라우드 번역 API** | DeepL·Google 등 | 품질·과금 — 오케스트 라우터에서 선택 |
| **D. 사용자 확인** | API가 `draftPromptEn` 반환 → UI 수정 후 재요청 | 품질·교육용 |

#### 3.1.2 C3Dv0 System / User 프롬프트 예시 (번역 후)

오케스트가 탭(1/2)에 맞는 **System**을 붙여 **서버 Ollama C3Dv0**에 전달합니다. 탭 2는 §4.1 (**2D 선행**, 3D 언폴딩 금지).

**탭 1 — 3D 부품**

| 역할 | 예시 문장 |
|------|-----------|
| **System** | `You are a CadQuery code generator for TAB 1 (3D solid parts). Units: millimeters. Output ONLY valid Python using cadquery (import cadquery as cq). Use 3D operations: Workplane, box, hole, fillet, chamfer, extrude, etc. No markdown, no explanation. Assume result is the final solid for export.` |
| **User** | `Create a 50mm × 50mm × 3mm plate on XY, 10mm diameter hole at center, 3mm fillet on all vertical edges.` |

한국어 원문 예: *「가로 50, 세로 50, 두께 3 사각판 가운데 10파이 구멍, 세로 모서리 필렛 3mm」* → 서버 번역 후 User.

**탭 2 — 2D 전개도 (판금·절곡, 선행 설계)**

| 역할 | 예시 문장 |
|------|-----------|
| **System** | `You are a CadQuery code generator for TAB 2 (2D sheet-metal FLAT PATTERN / unfold layout). Units: millimeters. Output ONLY valid Python using cadquery (import cadquery as cq). Design in 2D FIRST: use cq.Sketch(), Workplane("XY"), line/arc/circle, cutouts, bend lines as construction geometry where needed. Do NOT build a 3D solid then unfold. Do NOT use box().extrude() as the primary deliverable. Do NOT accept requests to "unfold this 3D model" or auto-unwrap a solid—refuse and ask for explicit 2D flat dimensions instead. Respect injected globals if present: SHEET_THICKNESS_MM, BEND_RADIUS_MM, MACHINE_OFFSET_MM (apply as sketch offsets or comments in code). No markdown, no explanation. The human machinist will judge fold suitability and corrections; your job is accurate 2D CadQuery sketch code for laser/bend DXF export.` |
| **User** | `Draw a flat pattern for a rectangular box wrap-around: bottom 120×80 mm, four side flaps height 40 mm each, 1.5 mm sheet. Show bend lines. One M3 hole on the bottom center. Use 2D sketch only.` |

한국어 원문 예: *「하판 120×80, 사이드 플랩 높이 40, 두께 1.5t 박스 전개도 2D로. 하판 중앙 M3. 절곡선 표시」* → 서버 번역 후 User.

**탭 2에서 피해야 할 User 요청 (기본 UX에서 비권장)**

- ❌ `Unfold the 3D part from tab 1 into a flat pattern.`
- ✅ `Flat pattern 2D: … (치수를 평면 기준으로 명시)`

**보정값 (UI → API 메타 → 프롬프트 또는 Pyodide globals)**

- API body 예: `{ "tab": 2, "promptKo": "…", "sheetThicknessMm": 1.5, "bendRadiusMm": 1.0, "machineOffsetMm": 0.2 }`
- C3Dv0 User 끝: `Use SHEET_THICKNESS_MM=1.5, …` 또는 생성 코드가 `globals`를 참조하도록 유도

**번역(2차) — 플랫폼 Ollama 소형 모델**

- System: `Translate the following Korean sheet-metal instruction into one English CadQuery user prompt. Keep all numbers and units. Say it is a 2D flat pattern only, not 3D unfold.`
- User: `「하판 120×80, 플랩 40, 1.5t, 하판 중앙 M3, 절곡선」`
- → 영어 User + 탭 2 System → C3Dv0

---

## 4. 제품 구조 (탭 1 / 탭 2)

### 공통

- **입력:** 자연어(한국어 UI) → **플랫폼 API** (§3.1) + (탭 2) 보정값
- **AI:** 탭 1 **3D CadQuery** / 탭 2 **2D `cq.Sketch()`** (§4.1, 3D 자동 전개 비목표)
- **CAD 실행:** **Pyodide만** (~0.1초 목표), CAD VM 서버 없음

### 탭 1 — 3D 부품

| 항목 | 스택 연결 |
|------|-----------|
| AI | 플랫폼 C3Dv0 — `box`, `hole`, `fillet` 등 |
| Monaco | API 응답 주입, 수정 후 Pyodide |
| R3F | Perspective, OrbitControls |
| 출력 | `.STEP` (Pyodide export 검증) |

### 탭 2 — 2D 전개도 (판금·절곡 발주)

| 항목 | 스택 연결 |
|------|-----------|
| AI | **2D 전개도 선행** — 플랫폼 C3Dv0 + §4.1 |
| React | 보정값 → API 메타 + `pyodide.globals.set` |
| R3F | Orthographic, 선 위주 |
| 출력 | `.DXF` |
| **사람** | 전개 적합도·현장 보정·3D 치환 판단 (§4.1) |

#### 4.1 탭 2 핵심 가치 — 「3D 자동 전개」가 아니라 「2D 전개도 선행 설계」

탭 2는 “탭 1 3D를 AI가 펼쳐 전개도를 뽑는 것”을 **1차 목표로 삼지 않습니다.**  
3D→2D 자동 언폴딩은 기술·현장 오차 모두 어렵습니다.

| 구분 | 탭 1 (3D) | 탭 2 (2D) |
|------|-----------|-----------|
| **설계 출발점** | 3D 형상 | **평면 전개도 먼저** |
| **AI 역할** | 3D CadQuery 보조 | **2D 스케치·전개 라인** 보조 |
| **우회** | — | **2D 선행 설계**, 3D 자동 전개 비목표 |
| **3D 관계** | STEP 출력 | 사람이 **탭 1·상상**으로 접힘 검증 |
| **품질 주체** | 코드·치수 | **현장 실무** + 보정 UI |

```
[실무자 / 플랫폼 AI] 2D 전개도·절곡선·구멍 (탭 2, CadQuery 2D)
        ↓
[Pyodide] → DXF
        ↓
[사람] 적합도·보정·3D 치환
        ↓
[현장] 레이저·절곡
```

- **「3D를 펴 달라」** 기본 프롬프트 ❌ · **「2D 전개도 짜 달라」** ✅
- AI는 **2D 코드 보조**; 적합도는 **사람**
- 성공 기준: **2D 선행 + 보정 + DXF 발주**, not 탭1 자동 전개율

**탭 격리:** Vite 폴더·렌더 분리 — 탭 2가 탭 1에 거의 영향 없음.

---

## 5. R3F · 탭별 렌더링

| 구분 | 탭 1 (3D) | 탭 2 (2D) |
|------|-----------|-----------|
| 카메라 | Perspective | Orthographic |
| 조명/재질 | ON | OFF 또는 최소 |
| geometry | JSON → `<bufferGeometry>` | §5.1 |
| UX | OrbitControls, Hover 치수 | 평면 도면 |
| 오버레이 | `CSS2DRenderer` (선택) | 동일 가능 |

### 5.1 탭 2 geometry (구현 시 택일)

| 방식 | 설명 |
|------|------|
| **A. R3F Line** | Orthographic + `Line` — MVP 권장 |
| **B. SVG / Canvas 2D** | 극경량 도면 UI |

---

## 6. Pyodide 초기화 (브라우저, 1회)

1. `loadPyodide()` (CDN 또는 Vite 정적 자산)
2. `micropip` → OCP.wasm / cadquery (URL·버전 고정)
3. 로딩 UI (~3초) — 재방문 캐시 (§9)

**플랫폼 서버:** Ollama + C3Dv0 이미지·GPU 할당은 **별도 배포** (§7).

---

## 7. 배포·운영

| 항목 | 내용 |
|------|------|
| **프론트** | `npm run build` → 정적 호스팅 또는 플랫폼과 동일 도메인 |
| **플랫폼 API** | NEXA 웹 서버 (Node/Python 등) — `/api/v1/cad/generate` |
| **Ollama** | **플랫폼 서버에 설치** — C3Dv0, (선택) 번역용 소형 모델 |
| **CAD 연산** | **0** — 사용자 브라우저 Pyodide only |
| **LLM 비용** | 플랫폼 GPU/CPU·토큰·(선택) 클라우드 API — **≠ 0** |
| **보안** | **메시/STEP 바이너리**는 기본적으로 클라이언트만; **프롬프트·생성 코드**는 플랫폼·LLM 경유 (§7.1) |

### 7.1 비용·데이터 — 3축 구분

**결론:** Wasm 레버리지는 **축 A(CAD·렌더)** 에만 “서버 연산 ≈ 0”. **축 B(LLM)**·**축 C(CDN)** 는 플랫폼이 부담합니다.

#### 축 A — CAD·메시·렌더 (클라이언트, 「CAD 서버 0」)

| 구간 | 위치 |
|------|------|
| CadQuery·OCP | 브라우저 Pyodide+Wasm |
| ToMesh | 브라우저 |
| R3F | 사용자 GPU |

→ 상시 **CAD GPU VM** 불필요.

#### 축 B — LLM·오케스트 (플랫폼 서버)

| 구간 | 위치 |
|------|------|
| C3Dv0·번역·라우팅 | **플랫폼 Ollama** + 선택 클라우드 |
| 오케스트레이션 | 플랫폼 API 동일 프로세스/내부망 |

→ **GPU 인스턴스·동시 요청·토큰** 비용 발생. 사용자 Ollama 설치 **요구 안 함**.

#### 축 C — 배포·전송

| 구간 | 비용 |
|------|------|
| Wasm 번들 CDN | 트래픽 소량~중량 |
| API·인증·DB | SaaS 공통 |

#### 데이터·프라이버시 (정확한 표현)

| 데이터 | 기본 경로 |
|--------|-----------|
| 3D 메시·Pyodide 연산 결과 | **브라우저 RAM** (CAD 서버 미전송) |
| 자연어·생성 CadQuery 코드 | **플랫폼 API → Ollama/클라우드** |
| 오프라인 AI | Monaco 수동 편집 + Pyodide만 (API 없이) |

- ✅ *「CAD·뷰어는 브라우저 Wasm — **CAD 연산 서버 없음**. AI 코드 생성은 **NEXA 플랫폼**이 Ollama/클라우드로 제공.»*
- ❌ *「플랫폼 운영비·LLM 비용까지 전부 0원»*

#### 7.1.1 권장 최소 사양

**클라이언트 (브라우저)**

| 리소스 | 권장 |
|--------|------|
| RAM | **8GB+** (Pyodide+OCP; Ollama 불필요) |
| CPU | 4코어+ |
| GPU | WebGL2 |
| 브라우저 | Chromium 최신 권장 |

**플랫폼 (Ollama + C3Dv0)**

| 리소스 | 권장 |
|--------|------|
| RAM | 모델 크기 + 8GB+ (C3Dv0·동시 요청에 따라) |
| GPU | NVIDIA 등 **VRAM** — CPU-only 가능하나 지연 증가 |
| 운영 | 레이트리밋, 인증, 모델 버전 고정 |

#### Phase 2+ 하이브리드 (예외)

| 트리거 | 대응 |
|--------|------|
| 저사양 클라이언트 CAD | 선택 클라우드 CadQuery API (유료) |
| C3Dv0 품질 한계 | 오케스트에서 **클라우드 LLM** 폴백 |
| Wasm CDN | 캐시 전용 (연산 없음) |

배경: [`WebAssembly 는 무엇인가.md`](./WebAssembly%20는%20무엇인가.md)

### 7.2 모드2 Video — CadQuery 시뮬레이션 영상

[`AI VIDEO 제너레이터.md`](./08_TDD_NEXIA_AIVIDEO제네레이터.md) §3.5.1.B-2 — **모드2 `TECH_ANIM`**, ComfyUI 불필요.

동일 Monaco CadQuery를 프레임마다 `globals` 변경 후 Pyodide 실행 → ToMesh → R3F 캡처 → Remotion MP4. 적합: 파라메트릭 스윕·조립 시퀀스·오빗·분해 뷰 (FEA/유체는 별도).

3D 앱 **「모드2 시뮬레이션 녹화」** → `simulationSpec` + frames.zip을 Video handoff. CadQuery 본문은 `/cad/generate`만 사용.

### 7.3 Blender 백엔드 (계산만 — 형상 수정 없음)

[`AI 3D Blender 백엔드 연동.md`](./08_TDD_NEXIA_AI3DBlender백엔드연동.md) — mesh 미수정 · 허용=**조립·리깅·물리(질량·힌지·모터)·시각화(렌더만)** → JSON → 웹.

---

## 8. 구현 순서 제안

1. **Vite + React** — Monaco / R3F 레이아웃  
2. **Pyodide + OCP** — `ToMesh` → R3F  
3. **Monaco** — 샘플 코드, Ctrl+Enter → Pyodide  
4. **R3F** — 탭 1  
5. **플랫폼 API 스텁** — `POST /api/v1/cad/generate` (고정 코드 반환)  
6. **플랫폼 Ollama + C3Dv0** — 오케스트(탭·§3.1·§3.1.2) 연결  
7. **보정 UI** — globals + API 메타  
8. **탭 2** — §4.1, §5.1, DXF  
9. **STEP export** (Pyodide)  
10. **오케스트 고도화 [B]** — 다중 에이전트·클라우드 라우터  
11. **모드2 시뮬레이션** — frame capture · Video `r3f/export` handoff  

---

## 9. 명시적으로 검토할 것

| 항목 | 이유 |
|------|------|
| **OCP.wasm / cadquery CDN** | 버전·캐시 |
| **STEP/DXF in-browser** | Pyodide export, Worker |
| **플랫폼 API 계약** | 인증, 스트리밍, 에러, 레이트리밋 |
| **Ollama @ 서버** | C3Dv0 VRAM, 동시성, 내부망 vs 공개 API |
| **모델 라우터** | C3Dv0 vs 클라우드 vs 번역 모델 |
| **한국어 → 번역** | §3.1.1 A~D, `draftPromptEn` 확인 UI |
| **프라이버시 고지** | §7.1 — 프롬프트·코드 서버 경유 |
| **Wasm Worker** | Pyodide UI 프리즈 |
| **탭 2 geometry** | §5.1 A vs B |
| **탭 2 철학** | §4.1 |
| **오프라인 모드** | API 없이 Monaco+Pyodide |
| **비용 3축** | §7.1 A/B/C 모니터링 |
---

## 관련 문서

| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXIA 구조 · 기술 스택 운영 방침 (TDD-010)](../08_TDD_NEXIA_구조기술스택운영방침.md) |
| Blender 연동 | [AI 3D · Blender 백엔드 연동 (TDD-027)](./08_TDD_NEXIA_AI3DBlender백엔드연동.md) |
| Wasm 개요 | [WebAssembly 개요 (TDD-032)](./08_TDD_NEXIA_WebAssembly개요.md) |
