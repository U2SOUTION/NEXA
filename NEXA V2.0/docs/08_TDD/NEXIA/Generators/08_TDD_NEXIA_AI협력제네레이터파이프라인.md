---
doc_id: TDD-028
title: "AI 협력 제너레이터 파이프라인"
category: "08_TDD"
domain: NEXIA
status: published
created: 2026-06-10
updated: 2026-06-10
parent_doc: TDD-010
terms_standard: ["langgraph", "comfyui", "ollama"]
terms_nexa: ["Generators", "Omnix", "agent-graph", "Rivet"]
tags: ["doc/cat/08-tdd", "doc/domain/nexia", "std/langgraph", "std/comfyui", "std/ollama", "nexa/Generators", "nexa/Omnix", "nexa/agent-graph", "nexa/Rivet"]
---
# AI 협력 제네레이터 — 공통 아키텍처 파이프라인 (v2)

**한 줄:** 모든 Nexia 제너레이터는 **① 기획(Ollama@플랫폼) → ② Rivet 정제 → ③ 도메인 SoT(Monaco 또는 Tiptap) → ④ 클라이언트 Wasm/뷰어 → ⑤ Worker(선택)** 를 공유한다. **세부 스택·API·JSON 계약은 각 제너레이터 문서가 우선**한다.

> 상위 플랫폼: [`NEXIA 주요 외부 엔진들과 아키텍쳐.md`](../08_TDD_NEXIA_외부엔진및아키텍처.md) · 릴레이·Ethos: [`_프로토콜.md`](../08_TDD_NEXIA_NEXNAP시스템인터페이스표준규약.md)

---

## 0. 문서 역할

| 본 문서 | 각 `AI * 제너레이터.md` |
|---------|-------------------------|
| 4단계 **공통 파이프라인** · 분기표 · 복합 시나리오 | Monaco 언어 · Pyodide · API · MVP 순서 |
| SoT·Worker **원칙** | Blender/KiCad/ComfyUI **상세** |
| 제너레이터 간 **링크·Insight JSON** | 구현·디버깅 **기준** |

---

## 1. 공통 4단계 파이프라인

```
[사용자: 자연어 · 음성 · Cockpit]
        ↓ HTTPS (인증 · 레이트리밋)
┌───────────────────────────────────────────────────────────┐
│ ① 기획 — Ollama @ NEXA 플랫폼 (브라우저 직접 호출 ❌)      │
│    · Video: brief / script / timeline                     │
│    · 3D/Sound/Circuit: 코드 초안 또는 기획 블록(선택)      │
└───────────────────────────┬───────────────────────────────┘
                            ▼
┌───────────────────────────────────────────────────────────┐
│ ② 정제 — Rivet (rivet-node) + Ethos 가드레일              │
│    · domainId 분기 · JSON 규격화 · GPU/전압/비용 상한       │
└───────────────────────────┬───────────────────────────────┘
                            ▼
┌───────────────────────────────────────────────────────────┐
│ ③ SoT — 사용자가 확정·편집하는 단일 원천                   │
│    · Tiptap-first (Video)  또는  Monaco-first (3D/Sound/Circuit) │
│    · Yjs 실시간 협업                                       │
└───────────────────────────┬───────────────────────────────┘
                            ▼
┌───────────────────────────────────────────────────────────┐
│ ④ 클라이언트 연산·뷰어 (Pyodide Wasm · JS · Web Audio)     │
│    · CAD/DSP/BOM 굽기 — 서버 VM 없음 (축 A)                │
└───────────────────────────┬───────────────────────────────┘
                            ▼
┌───────────────────────────────────────────────────────────┐
│ ⑤ Worker (선택) — 검증·export·Insight JSON (SoT 대체 ❌)   │
│    Blender · KiCad · ComfyUI · Remotion/MoviePy job       │
└───────────────────────────────────────────────────────────┘
```

### 1.1 단계별 책임

| 단계 | 기술 | 산출물 (예) |
|------|------|-------------|
| **① 기획** | 플랫폼 Ollama + 오케스트(번역·프롬프트) | Tiptap 블록 · Monaco `code` 초안 · `draftPromptEn` |
| **② 정제** | Rivet + LangGraph | `VideoProject` · `domainRoutes[]` · Ethos `approved` |
| **③ SoT** | **Tiptap** 또는 **Monaco** | 사람이 수정한 **최종 의도** |
| **④ 클라이언트** | Pyodide · R3F · Tone.js · React Flow | 메시 · WAV · 회로도 · 실시간 변조 |
| **⑤ Worker** | Docker job queue | Insight JSON · MP4 · STEP · Gerber |

---

## 2. 절대 원칙 (모든 제너레이터 공통)

| 원칙 | 내용 |
|------|------|
| **Ollama 위치** | **플랫폼 서버만** — `localhost:11434` 브라우저 호출 금지 |
| **연산 분리** | 무거운 **도메인 굽기** = 브라우저 **Pyodide(Wasm)**; **추론·코드 생성** = 플랫폼 |
| **SoT 단일화** | 도메인마다 **하나의 편집 원천** — Worker 결과로 SoT **자동 덮어쓰기 ❌** |
| **Worker 방향** | Monaco/Tiptap SoT → Worker → **JSON·파일 export** (단방향) |
| **협업** | **Yjs** 단일 문서 — `code` · `workflow` · 도메인별 insight 맵 |
| **Ethos** | Glos/Physis 실행 전 **승인·비용·전기·GPU** 가드 (Rivet `EthosGuard`) |
| **모델 라우팅** | C3Dv0(CAD) · 음악 모델 · 임베디드 모델 — **탭·API별 분리** |

---

## 3. 제너레이터 분기 — Tiptap-first vs Monaco-first

```
                    [Cockpit · Orchestrator]
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
       Tiptap-first                    Monaco-first
       (콘텐츠·구조 SoT)                (코드 SoT)
              │                               │
         [Video]                    [3D] [Sound] [Circuit]
              │                               │
         Rivet → 모드1/2                 Pyodide + 뷰어
         ComfyUI / Remotion              (+ Worker)
```

### 3.1 제너레이터 매핑 표

| 제너레이터 | ① 기획 UI | ③ SoT | ④ 클라이언트 | ⑤ Worker | 상세 문서 |
|------------|-----------|-------|--------------|----------|-----------|
| **Video** | **Tiptap** (brief·대본) | `timeline` + script | P5 · Tone · `<video>` | ComfyUI · Remotion · MoviePy | [`AI VIDEO`](./08_TDD_NEXIA_AIVIDEO제네레이터.md) |
| **3D** | Monaco (선택 NL) | **CadQuery Python** | Pyodide+OCP → **R3F** | **Blender** (계산만) | [`AI 3D`](./08_TDD_NEXIA_AI3D제네레이터.md) · [`Blender 연동`](./08_TDD_NEXIA_AI3DBlender백엔드연동.md) |
| **Sound** | Monaco | **Pippi/SCAMP Python** | Pyodide → **Tone.js** | — (DAW 마감) | [`AI SOUND`](./08_TDD_NEXIA_AISOUND제네레이터.md) |
| **Circuit** | Monaco | **ESP32 C/C++ 펌웨어** | SCHEMATIC: Pyodide→React Flow · SIM: Wokwi embed | **Wokwi CLI** · KiCad (Phase 2) | [`AI CIRCUIT`](./08_TDD_NEXIA_AICIRCUIT제네레이터.md) |

### 3.2 구버전 표현과의 정정

| 초기 비전 (v1) | v2 확정 |
|----------------|---------|
| Monaco에 KiCad **코드** SoT | Circuit SoT = **펌웨어**; KiCad = DRC·export Worker |
| CadQuery **서버** 엔진 | CadQuery = **Pyodide @ 브라우저** |
| Blender가 메시·기판 **합성·수정** | Blender = **형상 수정 금지**, `BlenderInsight` JSON |
| Wokwi CLI 필수 | **이원화:** SCHEMATIC=브라우저 · SIM=**Wokwi Worker** (`wokwi-cli`) |
| MoviePy = Blender 위 3D 합성 | MoviePy = **Video 모드2** EDU_SCREEN 등; 3D는 Remotion/R3F·CadQuery 시뮬 |

---

## 4. ③ 구체화 단계 — Monaco / Tiptap

### 4.1 Monaco-first (3D · Sound · Circuit)

| 흐름 | 설명 |
|------|------|
| Rivet → `generate` API | 플랫폼 Ollama가 **도메인 코드 문자열** 반환 |
| Monaco 바인딩 | 사용자 검수 · Ctrl+Enter = **클라이언트 굽기만** |
| AI 패치 (Circuit 등) | diff 제안 → **사용자 승인 후** 적용 |

**API (요약):** `/cad/generate` · `/sound/generate` · `/circuit/generate` · `/circuit/analyze` — [`NEXIA §2.2`](../08_TDD_NEXIA_외부엔진및아키텍처.md)

### 4.2 Tiptap-first (Video)

| 흐름 | 설명 |
|------|------|
| `/video/project/draft` | 기획서·대본·`timeline` |
| Tiptap 편집 | **주 UI** — Monaco는 모드2·Glos 보조 |
| `/video/project/refine` | Rivet → CINEMATIC \| FAST |

---

## 5. ④ 클라이언트 연산 · 실시간층

| 제너레이터 | 굽기 (이벤트·Run) | 실시간 (고주파) |
|------------|-------------------|-----------------|
| 3D | Pyodide → ToMesh → R3F | R3F 카메라·슬라이더 globals |
| Sound | Pyodide → WAV/MIDI | **Tone.js만** (센서마다 Wasm 재굽기 ❌) |
| Circuit | JS Extract + Pyodide → **SCHEMATIC** BOM/회로도 | Wokwi serial · embed · pinmap |
| Video | (모드2) 프레임 export | P5 · Tone · video element |

> Wasm 배경: [`WebAssembly 는 무엇인가.md`](./WebAssembly%20는%20무엇인가.md)

---

## 6. ⑤ Worker — 허용 역할 (SoT 대체 금지)

| Worker | 입력 (SoT에서) | 출력 | 웹 반영 |
|--------|----------------|------|---------|
| **Blender** | STEP (read-only) | `BlenderInsight` — 조립·poses·물리·(선택) 시각화 | 검수·Monaco **제안** (자동 적용 ❌) |
| **KiCad** | `CircuitInsight` netlist | DRC · `.kicad_sch` · Gerber | 다운로드·FAIL 차단 |
| **Wokwi** | Monaco + `diagram.json` (빌드) | `WokwiInsight` — serial · lint · VCD | 탭2 · Ethos · Aionos |
| **ComfyUI** | Video timeline (모드1) | MP4 | Physis |
| **Remotion/MoviePy/Manim** | timeline (모드2) | MP4 | Physis |

**공통:** Worker가 **고친 메시·회로·펌웨어**를 공식 revision으로 승격하지 않는다.

---

## 7. Insight · Project JSON (도메인 간 릴레이)

복합 프로젝트(로봇+회로+교육 영상)는 Cockpit `projectId` 아래 revision별 JSON을 연결한다.

| 스키마 | 발행자 | 주요 필드 | 소비 |
|--------|--------|-----------|------|
| `VideoProject` | Ollama draft + Rivet | `brief`, `script`, `timeline`, `fastProfile` | Tiptap · 렌더 job |
| `BlenderInsight` | Blender Worker | `assembly`, `poses`, `physics`, `visualization?` | 3D 검수 · Video turntable |
| `CircuitInsight` | SCHEMATIC 트랙 | `bom`, `netlist`, `schematicGraph` | 회로도 · KiCad |
| `WokwiInsight` | SIM 트랙 | `serialLog`, `simulation`, `lint` | 시뮬 · OTA 게이트 |
| Rivet `workflow` | Synapse | `circuitProfile`, 노드·파라미터 | SCHEMATIC/SIM 분기 |

**릴레이 예:** `CircuitInsight.pinmap` → ESPHome prefill · `WokwiInsight.serialLog` → Aionos · Video EDU_SCREEN · `BlenderInsight.poses` → TECH_ANIM.

Envelope 권장: [`NEXIA §3.1`](../08_TDD_NEXIA_외부엔진및아키텍처.md) — `requestId`, `domainId`, `tabId`, `traceId`.

---

## 8. 복합 시나리오 예 — 6족 로봇 교육 키트

| 순서 | 단계 | 도메인 | 산출 |
|------|------|--------|------|
| 1 | ①② | Video + Ethos | Tiptap: 로봇 사양·90초 교육 대본 · `timeline` |
| 2 | ② | Rivet | `domainRoutes`: `3d`, `circuit`, `video.fast=TECH_ANIM` |
| 3 | ③ | 3D | Monaco CadQuery → Pyodide → R3F 케이스 |
| 4 | ③ | Circuit | Monaco ESP32 → **SCHEMATIC** `CircuitInsight` + **SIM** `WokwiInsight` |
| 5 | ④⑤ | 3D | STEP → Blender → `BlenderInsight` |
| 6 | ⑤ | Circuit | `wokwi-cli` expect-text · serial → Ethos PASS |
| 7 | ⑤ | Video | Remotion TECH_ANIM · (선택) MoviePy EDU_SCREEN |
| 8 | Sense | Edge | 확정 pinmap → ESPHome YAML · OTA |

동일 **Yjs Doc**에서 탭 전환; 각 도메인 revision은 `firmwareHash` / `cadRevisionId`로 **동기 검증**.

---

## 9. NEXA 7탭과의 접점

| 탭 | 제너레이터 파이프라인에서의 역할 |
|----|--------------------------------|
| **0 Cockpit** | 프로젝트·job 큐 · multi-domain 승인 |
| **1 Ethos** | 전압·GPU·비용 · `approved` · APPROVED 차단 |
| **2 Synapse** | Rivet `workflow` · `RouteMode` |
| **3 Glos** | **Monaco SoT** · 펌웨어·CadQuery·Pippi |
| **4 Aionos** | 물리 샘플 · 오디오·전류 차트 |
| **5 Physis** | R3F · 회로도 · `<video>` · ComfyUI 결과 |
| **6 Sense** | ESPHome · MQTT · OTA |

---

## 10. 비용·데이터 3축

| 축 | 공통 포함 | 비용 성격 |
|----|-----------|-----------|
| **A. 클라이언트** | Pyodide · R3F · Tone · React Flow | 사용자 CPU ≈ 0 |
| **B. 플랫폼 LLM·Rivet** | Ollama · draft/refine · analyze | GPU·토큰 |
| **C. Worker·미디어** | Blender · KiCad · ComfyUI · 스토리지 | GPU·CPU·트래픽 |

---

## 11. MVP vs Phase 2

| 구분 | MVP | Phase 2 |
|------|-----|---------|
| 오케스트 | 탭 분기·번역·얇은 Rivet | 다중 에이전트·클라우드 폴백 |
| Worker | 3D Blender insight · Video FAST | KiCad · ComfyUI 풀 파이프 |
| 복합 | 도메인 **수동** handoff | Cockpit 자동 `domainRoutes` |
| Circuit | SVG·BOM·JSON + **Wokwi SIM MVP** | KiCad · embed · auto ELF build |

---

## 12. 확장 방향 (모듈 추가)

중앙 **4단계 + SoT 원칙**이 고정되어 있으면, 도메인 확장은 다음만 추가하면 된다.

| 추가 시 | 변경 최소화 |
|---------|-------------|
| 새 제너레이터 (예: PCB thermal) | Monaco/Tiptap SoT 규칙 · `/api/v1/{domain}/*` · Pyodide 또는 Worker · Insight JSON |
| 새 Worker | job queue + 단방향 export — **Rivet 노드 1개** |
| 새 하드웨어 (드론·팩토리) | `boardProfile` · parts library · Rivet `domainId` |

**교체 가능:** Ollama 모델 · ComfyUI 워크플로 · symbol library — **API·JSON 계약**만 유지.

---

## 13. 관련 문서 인덱스

| 문서 | 내용 |
|------|------|
| [NEXIA 주요 외부 엔진들과 아키텍쳐.md](../08_TDD_NEXIA_외부엔진및아키텍처.md) | 플랫폼 §0~§12 · API · 7탭 |
| [AI 3D 제네레이터.md](./08_TDD_NEXIA_AI3D제네레이터.md) | CadQuery · Pyodide · R3F |
| [AI 3D Blender 백엔드 연동.md](./08_TDD_NEXIA_AI3DBlender백엔드연동.md) | Blender 허용 영역 · Insight |
| [AI SOUND 제너레이터.md](./08_TDD_NEXIA_AISOUND제네레이터.md) | Pippi · Tone.js |
| [AI VIDEO 제너레이터.md](./08_TDD_NEXIA_AIVIDEO제네레이터.md) | Tiptap · Rivet · 모드1/2 |
| [AI CIRCUIT 제너레이터.md](./08_TDD_NEXIA_AICIRCUIT제네레이터.md) | ESP32 · BOM · KiCad |
| [WebAssembly 는 무엇인가.md](./WebAssembly%20는%20무엇인가.md) | Pyodide |
| [Nexia 음성 인풋 자동화 및 확장 로직.md](./Nexia%20음성%20인풋%20자동화%20및%20확장%20로직.md) | ① 기획 입력 |
| [_프로토콜.md](../08_TDD_NEXIA_NEXNAP시스템인터페이스표준규약.md) | gRPC/WS · Ethos 토큰 |
| [05_PRD_NEXIA_CELL_ESPHomeYAML…](../../05_PRD/NEXIA/05_PRD_NEXIA_CELL_ESPHomeYAML제너레이터웹펌웨어.md) | Circuit → NEXA-CELL 배포 |

---

*상태: v2.1 — Circuit SCHEMATIC/SIM 이원화 · Wokwi Worker · Insight 릴레이.*
---

## 관련 문서

| 관계 | 문서 |
| :--- | :--- |
| 상위 TDD | [NEXIA 구조 · 기술 스택 운영 방침 (TDD-010)](../08_TDD_NEXIA_구조기술스택운영방침.md) |
| 외부 엔진 | [외부 엔진 및 아키텍처 (TDD-019)](../08_TDD_NEXIA_외부엔진및아키텍처.md) |
| AI VIDEO | [AI VIDEO 제너레이터 (TDD-031)](./08_TDD_NEXIA_AIVIDEO제네레이터.md) |
| AI CIRCUIT | [AI CIRCUIT 제너레이터 (TDD-029)](./08_TDD_NEXIA_AICIRCUIT제네레이터.md) |
