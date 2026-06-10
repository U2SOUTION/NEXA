# NEXIA · 외부 엔진과 아키텍처

> **스택 SSOT (To-Be):** [`M.O.S.E.S. 정리`](<../NEXA OS/Rivet/M.O.S.E.S.(Meta-Operating System for Engineering & Synthesis) v2.0.md>) — **`apps/web` = Next.js** · **Desktop / Embedded Rivet** · **Vite+React** 제너레이터는 Next **embed**. 아래 **Vue/Quasar** 표기는 **As-Is(레거시)**.

- **정체성:** **NEXA 플랫폼** 내 **NEXIA 도메인**(`nexia`) 엔진 연동 — [`정체성 SSOT`](../_NEXA-플랫폼·메타-OS·NEXIA·도메인%20—%20정체성%20SSOT.md)

## 0. 문서 목적

본 문서는 **NEXIA 도메인**의 **외부 엔진·내부 프레임워크·브라우저 Wasm 제너레이터** 연동을 운영 가능한 기준으로 정의한다.

- **NEXIA 도메인 셸:** Standard 7 **`tabId`** — Omnix · Normex · Logex · Scribx · Vivex · Twinex · Navex ([`00 …`](./08_TDD_NEXIA_구조기술스택운영방침.md) §3.1 SSOT)
- **IoT·데이터 라우팅:** [`MQTT토픽데이터라우팅`](./08_TDD_NEXIA_MQTT토픽데이터라우팅.md) · [`데이터분산처리하이브리드전략`](./08_TDD_NEXIA_데이터분산처리하이브리드전략.md)
- **상세 스택 (본 문서 §10):**
  - [`AI 3D 제네레이터.md`](./Generators/08_TDD_NEXIA_AI3D제네레이터.md) — CadQuery / Pyodide / R3F
  - [`AI 3D Blender 백엔드 연동.md`](./Generators/08_TDD_NEXIA_AI3DBlender백엔드연동.md) — 웹 SoT · Blender 검수·시뮬
  - [`AI SOUND 제너레이터.md`](./Generators/08_TDD_NEXIA_AISOUND제네레이터.md) — Pippi·SCAMP / Pyodide / **Tone.js**
  - [`AI VIDEO 제너레이터.md`](./Generators/08_TDD_NEXIA_AIVIDEO제네레이터.md) — Tiptap·Rivet → 모드1 ComfyUI · 모드2 Remotion/MoviePy
  - [`AI CIRCUIT 제너레이터.md`](./Generators/08_TDD_NEXIA_AICIRCUIT제네레이터.md) — Monaco(ESP32) · SCHEMATIC/SIM 이원화 · **Wokwi CLI**
  - [`AI 협력 제네레이터 아키텍처 파이프라인.md`](./Generators/08_TDD_NEXIA_AI협력제네레이터파이프라인.md) — **4단계 공통 파이프라인** · Tiptap/Monaco 분기
  - [`WebAssembly 는 무엇인가.md`](./WebAssembly%20는%20무엇인가.md) — Wasm·Pyodide 배경

---

## 1. 아키텍처 원칙

- **단일 오케스트레이션:** 모든 **LLM·ComfyUI·ESPHome** 호출은 **플랫폼 백엔드 오케스트레이터**를 경유한다. (브라우저 → Ollama 직접 호출 금지)
- **연산 분리 (§11):** **무거운 도메인 연산(CAD·오디오 DSP 굽기)** 은 사용자 브라우저 **Pyodide(Wasm)**; **추론·코드 생성** 은 **플랫폼 Ollama** (+ 선택 클라우드).
- **실시간층 (사운드):** 센서·슬라이더 고주파는 **Tone.js**; Wasm(Pippi) **재굽기는 이벤트·버튼 단위**.
- **상태 일관성:** UI/협업 상태는 **Yjs** 단일 소스.
- **로직 자산화:** **Desktop Rivet** `.rivet-project` / export JSON + Subgraph 버전 관리 → **Embedded Rivet** 실행.
- **확장 우선:** 외부 엔진·모델은 API 계약으로 교체 가능.

---

## 2. 외부 연동 엔진 정의

| 엔진                    | 역할                                  | 연동 위치                 | 연동 방식                       | 장애 시 대체           |
| ----------------------- | ------------------------------------- | ------------------------- | ------------------------------- | ---------------------- |
| **Ollama**              | 텍스트·코드 생성(CAD/음악/정책)       | **플랫폼 서버** (GX10 등) | HTTP REST (내부망)              | 경량 모델·클라우드 LLM |
| ComfyUI                 | 이미지/비주얼 생성                    | 플랫폼/GPU 노드           | HTTP JSON Workflow              | 큐·재시도              |
| ESPHome                 | IoT 제어/센서                         | MCU·MQTT 브로커           | MQTT, API                       | 장치 격리·수동 제어    |
| **Pyodide+OCP**         | CadQuery 3D 연산                      | **사용자 브라우저**       | Wasm (정적 번들)                | — (CAD 서버 API 선택)  |
| **Pyodide+Pippi/SCAMP** | 오디오·MIDI **굽기**                  | **사용자 브라우저**       | Wasm (검증 필요)                | 플랫폼 렌더 API        |
| **Tone.js**             | 재생·실시간 변조                      | **사용자 브라우저**       | Web Audio                       | —                      |
| **Wokwi CLI**           | ESP32 **펌웨어 시뮬** · lint · serial | **플랫폼 Worker**         | `wokwi-cli` + `WOKWI_CLI_TOKEN` | — (SIM 트랙)           |
| **R3F / P5 / paper.js** | 3D·영상·시퀀서 UI                     | 브라우저                  | JS 라이브러리                   | —                      |

> **Ollama는 최종 사용자 PC에 설치하지 않는다.** Nexia 제너레이터 UI는 `/api/v1/cad/generate`, `/api/v1/sound/generate` 만 호출한다.

### 2.1 내부 통합 레이어

| 레이어           | 기술                              | 책임                                         |
| ---------------- | --------------------------------- | -------------------------------------------- |
| Orchestration    | LangGraph.js                      | 상태 기반 실행 순서 제어                     |
| Logic Design     | **Desktop Rivet**                 | 그래프 설계 · Export JSON                    |
| Logic Runtime    | **Embedded Rivet** (`rivet-node`) | 추론 그래프 실행/재사용                      |
| Collaboration    | Yjs + Hocuspocus                  | 실시간 동시성/충돌 없는 상태 공유            |
| UI Shell (To-Be) | **Next.js** (`apps/web`)          | Omnix 및 7탭 셸                              |
| UI Shell (As-Is) | Vue 3 + Quasar                    | `NEXA-Platform/src` 레거시                   |
| Creative UI (앱) | **Vite + React** + Monaco         | 3D/사운드 등 **제너레이터** — Next **embed** |

### 2.2 플랫폼 API 게이트웨이 (권장 엔드포인트)

| API                                        | 출력                         | LLM (플랫폼)                                                | 클라이언트 연산                      |
| ------------------------------------------ | ---------------------------- | ----------------------------------------------------------- | ------------------------------------ |
| `POST /api/v1/cad/generate`                | CadQuery Python              | **C3Dv0** (`joshuaokolo/C3Dv0`) + 오케스트                  | Pyodide+OCP → R3F                    |
| `POST /api/v1/sound/generate`              | Pippi/SCAMP Python           | **음악·DSP 전용 모델** (C3Dv0와 **분리 라우팅**) + 오케스트 | Pyodide → WAV/MIDI → **Tone.js**     |
| `POST /api/v1/circuit/generate`            | ESP32 C/C++ 펌웨어           | **임베디드·회로 모델** (C3Dv0와 분리) + 오케스트            | JS Extract + Pyodide → BOM/netlist   |
| `POST /api/v1/circuit/analyze`             | BOM hints · warnings         | 동일 + ExtractSnapshot                                      | 클라이언트 Pyodide merge (SCHEMATIC) |
| `POST /api/v1/circuit/wokwi/project/build` | `diagram.json` · zip         | WokwiProjectBuilder                                         | —                                    |
| `POST /api/v1/circuit/wokwi/jobs`          | `WokwiInsight`               | —                                                           | **Wokwi Worker** (SIM)               |
| `/circuit/kicad/jobs`                      | `.kicad_sch` · DRC (Phase 2) | —                                                           | KiCad Worker                         |
| `/video/project/draft`                     | 기획·대본·timeline           | Ollama@플랫폼                                               | Tiptap(Yjs)                          |
| `/video/project/refine`                    | Rivet 정제·모드 분기         | Rivet                                                       | CINEMATIC/FAST                       |
| `/video/jobs`                              | ComfyUI (모드1)              | template merge                                              | GPU                                  |
| `/video/fast/render`                       | Remotion (모드2)             | props                                                       | CPU                                  |
| `/video/fast/manim/render`                 | TECH_ANIM                    | Manim                                                       | CPU                                  |
| `/video/fast/r3f/export`                   | TECH_ANIM                    | R3F frames                                                  | CPU                                  |
| `/video/edit/*`                            | MoviePy (모드2 대안)         | Python                                                      | CPU                                  |

**오케스트 공통 (MVP):** UI는 한국어 유지 → 서버에서 **번역·치수 보존·System Prompt 조립** → Ollama 호출. (선택) `draftPromptEn` 확인 UI. 상세: 3D §3.1 · Sound §6.

**응답 계약 (권장):** `{ "code": "<python>", "draftPromptEn?": "...", "tabId": "...", "modelId": "..." }` — Monaco만 소비, 원문 프롬프트는 감사 로그.

---

## 3. 데이터 흐름 표준

### 3.0 Omnix · 7탭 (플랫폼)

1. 사용자 입력은 Omnix에서 수신한다.
2. Orchestrator가 요청을 분류한다(추론/비주얼/IoT/복합/제너레이터).
3. 필요 시 Rivet 그래프를 실행하고 **플랫폼** Ollama·ComfyUI·ESPHome을 호출한다.
4. 결과는 Yjs 상태와 서버 저장소에 기록한다.
5. UI는 7개 탭 맥락에 맞게 표시하고 감사 로그를 남긴다.

### 3.0.1 제너레이터 앱 (3D / Sound) — 브라우저

1. React UI → **플랫폼 API** (코드 생성, §2.2).
2. Monaco에 Python 바인딩 → 사용자 편집.
3. **Pyodide(Wasm)** 로 CadQuery / Pippi·SCAMP **굽기** (서버 DSP VM 없음).
4. **R3F** 또는 **Tone.js** (+ P5/paper.js)로 표시·실시간 변조.
5. export: STEP/DXF/WAV/MID — 상세는 §10.

### 3.1 메시지 Envelope (권장)

- 필수 필드: `requestId`, `domainId`, `tabId`, `actor`, `timestamp`, `priority`, `payloadType`, `payload`.
- 보안 필드: `signature`, `nonce`, `traceId`.
- 운영 필드: `retryCount`, `timeoutMs`, `fallbackPolicy`.

---

## 4. 7탭 매핑 (`tabId` SSOT)

| #   | `tabId`    | 외부 엔진 의존            | 주요 출력                                                                                                                 |
| --- | ---------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Omnix**  | 전 엔진                   | 통합 실행/상태/승인                                                                                                       |
| 2   | **Normex** | Ollama                    | 정책/가드레일/목표 · **Norm(규범)** — [`00 …`](./08_TDD_NEXIA_구조기술스택운영방침.md) §3         |
| 3   | **Logex**  | Ollama, Rivet             | 로직 그래프/의사결정 흐름                                                                                                 |
| 4   | **Scribx** | Ollama, Rivet             | 코드/규칙 문서 · **3D/사운드 Monaco 연동**                                                                                |
| 5   | **Vivex**  | ComfyUI, (제너레이터)     | 이미지/미디어 · **R3F 3D 뷰**                                                                                             |
| 6   | **Twinex** | ESPHome, Three.js/Babylon | 장치·네트워크 · **디지털 트윈** · `.nxproj` — [`00 …`](./08_TDD_NEXIA_구조기술스택운영방침.md) §3 |
| 7   | **Navex**  | —                         | 자산 탐색 · 릴레이 컨텍스트                                                                                               |

---

## 5. 비기능 요구사항(NFR) 기준

| 항목               | 기준                  |
| ------------------ | --------------------- |
| UI 응답 시간       | P95 150ms 이하        |
| 엔진 호출 타임아웃 | 기본 10s, 최대 30s    |
| 상태 전파 지연     | 평균 50ms 이하        |
| 가용성 목표        | 월 99.9% 이상         |
| 감사 로그 보존     | 180일 이상            |
| 복구 목표          | RPO 1시간 / RTO 4시간 |

---

## 6. 보안 및 거버넌스 연결 규칙

- 모든 엔진 호출은 서비스 계정 + 권한 스코프로 제한한다.
- 민감 데이터는 전송/저장 시 암호화하며, 프롬프트 입력 전 마스킹한다.
- **제너레이터:** 3D 메시·로컬 Pyodide 결과는 기본 **브라우저 유지**; **자연어·생성 코드**는 플랫폼 LLM 경유 (§11).
- 외부 엔진 응답은 정책 검증(금칙어/규정 위반/신뢰도 임계치)을 통과해야 반영한다.
- 고위험 작업(IoT 제어, 대량 수정)은 Omnix 승인 단계를 강제한다.

---

## 7. 운영 Runbook 요약

### 7.1 엔진 장애

- 1단계: 실패 엔진 격리, 재시도 정책 적용.
- 2단계: 대체 경로 실행(경량 모델/큐 적재/수동 승인).
- 3단계: 장애 이벤트를 SEV 등급으로 기록하고 복구 보고.

### 7.2 데이터 불일치

- Yjs 상태 스냅샷과 서버 저장본을 비교한다.
- 충돌 구간은 최신 승인 이벤트 기준으로 병합한다.
- 병합 결과를 감사 로그와 함께 재배포한다.

---

## 8. 단계별 도입 계획

- **Phase 1 (MVP):** 플랫폼 Ollama + Rivet + LangGraph + Omnix/Logex/Scribx; **3D 제너레이터** (Pyodide+OCP+R3F, `/cad/generate`); **Sound** (Tone.js 우선 → Pippi 굽기).
- **Phase 2:** ComfyUI/ESPHome·Twinex; 사운드 **paper.js+SCAMP**; 오케스트 다중 모델·클라우드 폴백; P5 전시 모드.
- **Phase 3:** 정책 자동화, 비용·쿼터(§11), 멀티 테넌시.

---

## 9. 결정사항(ADR 요약)

- 채택: **Desktop/Embedded Rivet** + LangGraph + Yjs + **Next.js** (`apps/web`). (As-Is: Vue/Quasar)
- 채택: **Ollama @ 플랫폼 서버** — 사용자 로컬 Ollama 비요구.
- 채택: **Wasm(Pyodide) = CAD·오디오 DSP 굽기 @ 클라이언트**; **Tone.js = 사운드 실시간**.
- 채택: 외부 엔진 API 계약·느슨한 결합.
- 보류: Kafka (트래픽 임계 시).
- 폐기: 대화형 제안문만으로 문서 운영; **브라우저 → Ollama 직접 호출**.

---

## 10. Nexia 제너레이터 — 3D · Sound · Video · Circuit

[`AI 3D 제네레이터.md`](./Generators/08_TDD_NEXIA_AI3D제네레이터.md) · [`AI SOUND 제네레이터.md`](./Generators/08_TDD_NEXIA_AISOUND제네레이터.md) · [`AI VIDEO 제너레이터.md`](./Generators/08_TDD_NEXIA_AIVIDEO제네레이터.md) · [`AI CIRCUIT 제너레이터.md`](./Generators/08_TDD_NEXIA_AICIRCUIT제네레이터.md) 요약. **운영 기준은 각 문서가 우선.**

### 10.1 공통 파이프 (플랫폼 LLM + 클라이언트 Wasm)

```
3D/Sound/Circuit: React+Monaco → API → Ollama → Python/C++ → Pyodide/Extract → R3F/Tone/회로도
Circuit SIM:     firmware → /wokwi/project/build → wokwi-cli job → WokwiInsight

Video:  자연어 → /project/draft → Tiptap → Rivet(refine)
          → 모드1 ComfyUI | 모드2 Remotion/MoviePy → mp4
          공통: P5/Tone/video 실시간
```

| 대원칙      | 3D           | Sound         | Video                      | Circuit                               |
| ----------- | ------------ | ------------- | -------------------------- | ------------------------------------- |
| AI·초안     | LLM→**코드** | LLM→**코드**  | LLM→**기획·대본·timeline** | LLM→**펌웨어**                        |
| 편집 UI     | Monaco       | Monaco        | **Tiptap** → Rivet         | **Monaco**                            |
| 무거운 연산 | Pyodide      | Pyodide       | ComfyUI / Remotion         | Pyodide (SCHEMATIC) · **Wokwi** (SIM) |
| 실시간 UI   | R3F          | **Tone.js**   | P5 + Tone + `<video>`      | React Flow · **Wokwi embed**          |
| 탭 1        | 3D 부품      | 음색·SFX      | 숏클립·루프                | **회로도 + BOM**                      |
| 탭 2        | 2D 전개도    | paper.js+MIDI | 스토리보드                 | **Wokwi 시뮬**                        |
| 탭 3        | —            | —             | —                          | 핀맵·ESPHome                          |
| 외부 마감   | STEP/Blender | WAV→DAW       | MP4→NLE                    | **Wokwi CI** · KiCad                  |

### 10.2 Tone.js 위치 (사운드 확정)

- **Pippi/SCAMP:** AI 협업·**배치** WAV/MIDI 생성 (Pyodide).
- **Tone.js:** 로드된 샘플·이펙트·Transport; **센서마다 Wasm 재합성 금지** (지연 방지).
- **P5.js:** 영상 픽셀 연출; **Tone `Analyser`** → P5 연동 (미디어 아트).
- **ESPHome 센서:** Yjs 또는 React state → **Tone 파라미터** + (저주기) P5.

### 10.3 Rivet · Yjs와의 접점

| Yjs 키 (예)              | 소비자              |
| ------------------------ | ------------------- |
| `code` (Y.Text)          | Monaco ↔ Pyodide   |
| `synth_settings` (Y.Map) | Tone.js             |
| `p5_params` (Y.Map)      | P5.js               |
| `workflow` (Y.Map)       | Rivet JSON (백엔드) |

Rivet은 **플랫폼**에서 “어떤 API·모델·탭으로 라우팅할지” 결정; 제너레이터 **실행**은 브라우저.

### 10.4 MVP vs Phase 2 (제너레이터)

| 구분      | MVP ([A])                                  | Phase 2 ([B])                                |
| --------- | ------------------------------------------ | -------------------------------------------- |
| 오케스트  | 탭 분기·번역·프롬프트 템플릿 (얇은 레이어) | 다중 에이전트·모델 라우터·클라우드 폴백·감사 |
| 3D 탭2    | 2D 전개도 **선행**, 3D 자동 언폴딩 비목표  | 동일 원칙 유지, 보정 UX 강화                 |
| Sound 탭2 | AI SCAMP + paper.js **시각화** 병행        | paper↔SCAMP 완전 자동 번역                  |
| 전시      | Tone.js + (선택) P5                        | P5·ESPHome·Yjs 통합 전시 모드                |

---

## 11. 비용·데이터 3축 (플랫폼 전체)

3D·Sound 공통. **「서버 0원」은 축 A에만 해당.**

| 축                         | 포함                                         | 비용                                |
| -------------------------- | -------------------------------------------- | ----------------------------------- |
| **A. 클라이언트 연산**     | Pyodide(CAD/DSP), R3F, Tone.js, P5, paper.js | **CAD·DSP VM ≈ 0** (사용자 CPU/GPU) |
| **B. 플랫폼 LLM·오케스트** | Ollama@서버, Rivet/LangGraph, (클라우드 LLM) | **GPU·토큰·동시성**                 |
| **C. 전송·미디어**         | Wasm CDN, ComfyUI, 영상 원본, API·DB         | 트래픽·스토리지                     |

- ✅ _「도메인 연산·뷰어·실시간 오디오는 브라우저. AI 코드·오케스트는 NEXA 플랫폼.»_
- ❌ _「플랫폼·LLM까지 전부 0원»_

---

## 12. 관련 문서 인덱스

| 문서                                                                                             | 내용                                           |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| [AI 3D 제네레이터.md](./Generators/08_TDD_NEXIA_AI3D제네레이터.md)                                                 | C3Dv0, CadQuery, R3F, 탭1/2, §7.1 비용         |
| [AI SOUND 제너레이터.md](./Generators/08_TDD_NEXIA_AISOUND제네레이터.md)                                           | Pippi, SCAMP, **Tone.js**, 전시 모드           |
| [AI VIDEO 제너레이터.md](./Generators/08_TDD_NEXIA_AIVIDEO제네레이터.md)                                           | ComfyUI, P5, Tone, 탭1/2, §9 비용              |
| [AI CIRCUIT 제너레이터.md](./Generators/08_TDD_NEXIA_AICIRCUIT제네레이터.md)                                       | ESP32 Monaco, SCHEMATIC/SIM, Wokwi, KiCad      |
| [AI 협력 제네레이터 아키텍처 파이프라인.md](./Generators/08_TDD_NEXIA_AI협력제네레이터파이프라인.md) | ①~⑤ 공통 단계, Insight 릴레이, 복합 시나리오   |
| [WebAssembly 는 무엇인가.md](./WebAssembly%20는%20무엇인가.md)                                   | Wasm·Pyodide 개념·예제 20선                    |
| [Nexia 음성 인풋 자동화 및 확장 로직.md](./Nexia%20음성%20인풋%20자동화%20및%20확장%20로직.md)   | 음성 → Omnix/오케스트 입력                     |
| [NEXNAP 인터페이스 규약](./08_TDD_NEXIA_NEXNAP시스템인터페이스표준규약.md)                                                                  | 7탭 릴레이·Normex 가드레일·gRPC/WS (플랫폼 셸) |

**상호 참조:** 3D·Sound 문서는 본 문서 §1·§2·§10·§11을 **플랫폼 상위 뷰**로 링크한다.

---

## 부록 A. 통합 스택·비전 (참고)

### A.1 채택 스택 (OpenClaw 배제)

| 계층                 | 기술                                   | 역할                    |
| -------------------- | -------------------------------------- | ----------------------- |
| Presentation (To-Be) | **Next.js**                            | Omnix·7탭 (`apps/web`)  |
| Presentation (As-Is) | Vue 3 + Quasar                         | 레거시 `src/`           |
| Collaboration        | Yjs                                    | 실시간 동기화           |
| Orchestration        | LangGraph.js                           | 워크플로·State          |
| Logic Design         | **Desktop Rivet**                      | 추론 그래프 설계        |
| Logic Runtime        | **Embedded Rivet**                     | `rivet-node` @ NestJS   |
| Inference            | **Ollama (플랫폼)**                    | Qwen·C3Dv0·음악 모델 등 |
| Creative (병행)      | React + Monaco + Pyodide + R3F/Tone.js | §10                     |

### A.2 4+2 엔진 맵 (플랫폼 + 브라우저)

| 구분     | 엔진                   | 비유             |
| -------- | ---------------------- | ---------------- |
| 플랫폼   | Ollama                 | 두뇌 (코드·추론) |
| 플랫폼   | ComfyUI                | 시각 생성        |
| 플랫폼   | ESPHome                | 신경계·센서      |
| 플랫폼   | Rivet+LangGraph        | 척추·전략실      |
| 브라우저 | Pyodide+CadQuery/Pippi | 현장 연산(Wasm)  |
| 브라우저 | R3F / Tone.js / P5     | 눈·귀·픽셀       |

### A.3 산업 ↔ 아트 (Yjs 데이터 버스)

- ESPHome 센서 → Yjs → P5(시각)·**Tone.js**(청각)·Monaco(로직 파라미터).
- Rivet: 임계치 알람(산업)과 연출 강도(아트)를 **동일 워크플로**에서 분기 가능.
- Qwen 등 대형 모델(플랫폼): 추상적 맥락 명령 → 다중 엔진 파라미터 배분.

### A.4 Rivet JSON · AI 수정

- `.rivet-project` = JSON → Yjs `workflow` 동기화 가능.
- AI 직접 JSON 전체 수정은 fragile → **노드 템플릿 + 파라미터 조립** 권장.

### A.5 멀티 캔버스 레이아웃 (Next.js · As-Is Quasar)

- Splitter: 채팅 | Monaco / **Web Rivet Editor** | P5 + Tone 시각화.
- 엔지니어 모드 vs 아티스트 모드 vs 통합 관제 — 동일 Yjs Doc.

### A.6 에이전트·인프라 로드맵 (요약)

| 단계  | 초점                                         |
| ----- | -------------------------------------------- |
| 1~2   | 로컬/플랫폼 에이전트 기초, Git·텔레그램 관제 |
| 3~3.5 | DB, Vue 대시보드, API 래핑                   |
| 4~5   | GCP 상주, MQTT·ESP32                         |

(상세 설치 대화는 제거 — 구현 시 Runbook·별도 ops 문서로 분리.)

### A.7 비전 (한 줄)

NEXA는 산업 데이터와 예술적 영감을 실시간으로 교차시켜, 기술이 인간을 이해하고 인간이 기술을 감각하게 하는 **공생적 창의 생태계**를 지향한다.

### A.8 첫 통합 실험 (권장)

1. Rivet 또는 API가 가상 센서 값(0~100) 생성.
2. Yjs → Monaco 변수 / **Tone.js** `frequency` / P5 원 크기.
3. 플랫폼 Ollama가 맥락 해석 후 파라미터 배분 (§10.3).

---

_문서 버전: §0~§12 + 부록 A. 구버전 대화형 초안(로컬 Ollama·OpenClaw 중심)은 제거됨._
