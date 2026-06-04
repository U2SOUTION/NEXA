# AI VIDEO 제너레이터 — Tiptap · Rivet · ComfyUI / Remotion·MoviePy (기획 정리본)

> **스택:** 셸 **Next.js** · **Embedded Rivet** 정제 · **NEXIA React Flow** (Synapse). — [`M.O.S.E.S. 정리`](<../NEXA OS/M.O.S.E.S.(Meta-Operating System for Engineering & Synthesis) v2.0.md>) §3.5

**한 줄:** 자연어 → **플랫폼 Ollama**가 **기획서·대본·타임라인**을 만들고 → **Tiptap**에서 사람이 다듬고 → **Embedded Rivet**이 정제한 뒤 → **모드 1(시네마)** 또는 **모드 2(초고속)** 로 최종 MP4.

- **LLM·Embedded Rivet·ComfyUI:** 플랫폼 서버 — 사용자 PC Ollama **불요**, 브라우저 직접 호출 **금지**
- **실시간 연출:** P5.js + Tone.js + `<video>` (Sound §8.2 동형)

> [`NEXIA 주요 외부 엔진들과 아키텍쳐.md`](./NEXIA%20주요%20외부%20엔진들과%20아키텍쳐.md) · [`AI 3D`](./AI%203D%20제네레이터.md) · [`AI SOUND`](./AI%20SOUND%20제네레이터.md) · [`Rivet Engine 노드 분석.md`](./Rivet%20Engine%20노드%20분석.md)

---

## 1. 마스터 파이프라인 (확정 흐름)

```
[사용자 자연어 입력]
        ↓ HTTPS
[Ollama @ 플랫폼]
  · 기획서 (brief)
  · 대본 (script)
  · 타임라인 데이터 (timeline / shots)
        ↓
[Tiptap UI]  — 사용자가 대본·기획 편집 (Yjs 협업)
        ↓
[Rivet (rivet-node)]  — 데이터 정제 · 모드 분기 · Ethos · 자산 매핑
        ↓
 ┌────────────────────── 분기 ──────────────────────┐
 │  모드 1: 프리미엄 시네마틱 (CINEMATIC)              │  모드 2: 초고속 템플릿/스톡 (FAST)
 ↓                                                    ↓
[ComfyUI 워크플로]                                    [모드2 FAST — §3.5 프로필 3종]
 · Diffusion·img2vid 영상 생성                        · Remotion / Manim / R3F / MoviePy (GPU 거의 없음)
 · VRAM 대량 · 느림 · 고품짘 비주얼                    · 기술 애니·대시보드·교육 화면 합성 (초고속)
 · 브랜드 필름·제품 시네마·아트 워크                    · §3.5: TECH_ANIM · DATA_VIZ · EDU_SCREEN
        ↓                                                    ↓
[플랫폼 스토리지 MP4]  ←──────────────────────────────────┘
        ↓
[Physis UI]  <video> 프리뷰 · P5 · Tone · (모드2) Monaco 보조
```

**3D/Sound 제너레이터와의 차이:** Video는 **먼저 “무엇을 찍을지”(기획·대본·타임라인)** 를 문서화하고, **그 다음** 픽셀/컷 엔진을 고른다. Monaco·MoviePy는 **모드 2·하이브리드 편집**에 가깝다.

---

## 2. 단계별 역할

### 2.1 ① 자연어 → Ollama — `VideoProject` 초안

| 산출물                  | 형식                           | 내용                                                                                               |
| ----------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------- |
| **기획서** `brief`      | Tiptap/HTML 또는 Markdown 블록 | 목표·톤·길이·타깃·모드 추천                                                                        |
| **대본** `script`       | Tiptap 본문                    | 내레이션·자막 원문·씬 설명                                                                         |
| **타임라인** `timeline` | JSON                           | `shots[]` + **`fastProfile`** (§3.5) — id, durationSec, visualNote, narration, stockHint, modeHint |

**API (권장):** `POST /api/v1/video/project/draft`

```json
{
  "promptKo": "90초 제품 소개, 밝은 톤",
  "constraints": { "maxDurationSec": 90, "aspect": "9:16" }
}
```

**응답:**

```json
{
  "brief": { "title": "...", "sections": [...] },
  "script": { "prosemirror": { } },
  "timeline": {
    "shots": [
      { "id": "s1", "durationSec": 5, "narration": "...", "visualNote": "...", "modeHint": "FAST" }
    ]
  },
  "suggestedMode": "FAST",
  "draftPromptEn": "..."
}
```

- C3Dv0·Pippi처럼 **실행 코드가 아님** — **콘텐츠·구조 데이터**
- 한국어 UI → 플랫폼 **번역·보존** (3D §3.1 동형)

### 2.2 ② Tiptap — 사람이 편집하는 주 무대

| 항목      | 기술                               | NEXA 탭                                                                           |
| --------- | ---------------------------------- | --------------------------------------------------------------------------------- |
| 에디터    | **Tiptap** + Yjs (`Y.XmlFragment`) | **1 Ethos** (정책·시방·대본) 또는 Physis 임베드                                   |
| 편집 대상 | 기획서·대본·씬 메모                | 비정형 → Rivet이 **정형 timeline**으로 동기화                                     |
| 협업      | Yjs                                | [`__NEXIA 멀티창 동기화`](./__NEXIA%20멀티창%20동기화%20구현%20로드맵.md) Phase 4 |

**Monaco는 이 단계의 주 UI가 아니다.** 대본·기획은 **Tiptap**, 실행 코드는 모드 2·Glos에서만.

### 2.3 ③ Rivet — 정제·분기·실행 오케스트

Tiptap/Yjs에서 확정(또는 저장)된 `VideoProject`를 입력으로:

| Rivet 노드 (예)       | 역할                                                             |
| --------------------- | ---------------------------------------------------------------- |
| `IngestProject`       | brief/script/timeline 파싱                                       |
| `NormalizeTimeline`   | duration 합·fps·해상도 검증                                      |
| `EthosGuard`          | GPU 예산·저작권·딥페이크·모드 상한                               |
| **`RouteMode`**       | `CINEMATIC` \| `FAST` \| `HYBRID`                                |
| `MapAssets`           | 스톡 ID·3D 캡처·Sound WAV URL 바인딩                             |
| `SubmitCinematicJobs` | 모드1 → ComfyUI 큐 (샷별)                                        |
| `RouteFastProfile`    | `TECH_ANIM` \| `DATA_VIZ` \| `EDU_SCREEN` \| `NEWS_SHORT` (§3.5) |
| `BuildFastRender`     | 프로필별 Remotion props · Manim job · MoviePy code               |
| `MergeOutputs`        | HYBRID: ComfyUI 클립 + FAST 컷 합성                              |

`.rivet-project` = 버전 관리 자산 ([`NEXIA … §A.4`](./NEXIA%20주요%20외부%20엔진들과%20아키텍쳐.md)). **ComfyUI workflow 전체를 LLM이 쓰지 않음** — `templateId` + 슬롯만.

**Synapse (2탭):** **Web Rivet Editor** + **NEXIA React Flow**로 설계·디버그.

---

## 3. 모드 분기 — 상세

### 3.1 모드 1 — 프리미엄 시네마틱 (`CINEMATIC`)

|              |                                                                |
| ------------ | -------------------------------------------------------------- |
| **엔진**     | **ComfyUI** (플랫폼 GPU)                                       |
| **하는 일**  | txt2img · img2vid · ControlNet · 업스케일                      |
| **입력**     | Rivet이 샷별 `promptPack` + (선택) R3F `init_image`            |
| **LLM 출력** | `VideoIntent` per shot — `templateId`, positive/negative, seed |
| **비용**     | **축 C (VRAM)** 큼 · Cockpit/Ethos 승인 권장                   |
| **속도**     | 느림 (큐·분 단위)                                              |
| **적합**     | 브랜드 필름·제품 히어로 샷·고품질 비주얼 아트                  |

```
Rivet → merge(templates/comfyui/{id}.json, promptPack)
     → POST /api/v1/video/jobs
     → ComfyUI → clipUrl per shot
     → (선택) 모드2로 넘겨 합성
```

### 3.2 모드 2 — 초고속 템플릿/스톡 (`FAST`)

|             |                                                                     |
| ----------- | ------------------------------------------------------------------- |
| **엔진**    | **Remotion** (우선·웹) 또는 **MoviePy** (서버·배치)                 |
| **하는 일** | 스톡 영상/이미지 + 자막 + BGM + 템플릿 레이아웃 **합성**            |
| **AI 생성** | **없음** — 또는 키비주얼 **1장** (Flux txt2img 1회만, ComfyUI 경량) |
| **비용**    | CPU·스토리지 중심 · GPU 최소                                        |
| **속도**    | 매우 빠름 (초~수십 초)                                              |
| **적합**    | 정보 쇼츠·자막 뉴스·리포트·교육 슬라이드형 영상                     |

**Remotion vs MoviePy (권장 분工):**

|          | Remotion                                | MoviePy                               |
| -------- | --------------------------------------- | ------------------------------------- |
| 위치     | **브라우저/Node 렌더** (React 컴포지션) | **플랫폼 Python 러너**                |
| 강점     | 자막·모션 그래픽·9:16 템플릿·프리뷰     | 스톡 concat·ffmpeg 파이프·대량 배치   |
| LLM 산출 | **Remotion composition props** (JSON)   | **MoviePy Python** → Monaco (3D 동형) |
| MVP      | **FAST 기본** (뉴스·쇼츠)               | 서버 `/video/edit/render`             |

**MoviePy 정의:** 영상 **생성기가 아니라**, 이미 있는 클립·스톡·자막·오디오를 **어떻게 엮을지**에 대한 **편집 로직 코드**.

### 3.5 모드 2 활용 강화 — FAST 프로필 3종 (+ 뉴스 쇼츠)

모드 2는 “스톡만 붙이기”를 넘어 **도메인별 렌더 파이프**를 **`fastProfile`** 로 고정한다. Rivet `RouteFastProfile` → 해당 엔진만 호출.

| `fastProfile`    | 한 줄                                     | 주 엔진                                  | LLM·Rivet 산출                           |
| ---------------- | ----------------------------------------- | ---------------------------------------- | ---------------------------------------- |
| **`TECH_ANIM`**  | 2D/3D **기술·수식·다이어그램** 애니메이션 | **Manim** (서버) 또는 **R3F + Remotion** | Manim Python / Remotion `sequence` props |
| **`DATA_VIZ`**   | **대시보드·인터랙티브 UI** 시각화 영상    | **Remotion** (+ D3/Recharts 컴포넌트)    | `inputProps` JSON (시계열·KPI)           |
| **`EDU_SCREEN`** | **코딩·소프트웨어 교육** 화면 합성        | **MoviePy** (플랫폼 러너)                | MoviePy Python → Monaco                  |
| `NEWS_SHORT`     | 자막 뉴스·9:16 쇼츠 (기본)                | Remotion 템플릿 + 스톡                   | props + 자막                             |

`timeline.shots[].fastProfile` 미지정 시 Rivet이 `visualNote`·`brief.tags`로 추론 (교육→`EDU_SCREEN`, 차트→`DATA_VIZ`, 수식→`TECH_ANIM`).

---

#### 3.5.1 TECH_ANIM — 2D/3D 기술 애니메이션 자동 생성

**목적:** 수학·알고리즘·CAD 개념·NEXA 3D 메시를 **설명용 모션**으로 출력. ComfyUI Diffusion **불필요**.

**경로 A — Manim (플랫폼 CPU, 2D·LaTeX·벡터)**

| 항목   | 내용                                                                     |
| ------ | ------------------------------------------------------------------------ |
| 적합   | 수식 전개, 그래프, 플로우차트, 2D 기하 증명                              |
| 파이프 | Ollama → **Manim Python** → Monaco(Glos) → `/video/fast/manim/render`    |
| 입력   | Tiptap 대본의 `visualNote` · LaTeX 블록                                  |
| 출력   | 샷별 `.mp4` → Rivet이 Remotion 타임라인에 **`<OffthreadVideo>`** 로 삽입 |

```text
Rivet: fastProfile=TECH_ANIM, engine=manim
  → LLM: Scene 클래스 + construct() only
  → 서버: manim render -ql scene.py → clip_s1.mp4
  → (선택) Remotion Composition에서 concat + 자막·BGM
```

**경로 B — Three.js(R3F) + Remotion (3D·NEXA 3D 제너레이터 연동)**

| 항목   | 내용                                                                                          |
| ------ | --------------------------------------------------------------------------------------------- |
| 적합   | CadQuery 메시 **회전·단면·치수** 설명, 제품 3D                                                |
| 파이프 | [`AI 3D`](./AI%203D%20제네레이터.md) R3F → **프레임 시퀀스 PNG/WebM** → Remotion `<Sequence>` |
| 입력   | `meshSnapshotId` · camera orbit 메타 (Rivet `MapAssets`)                                      |
| 장점   | Manim에 없는 **실제 3D 메시** 재사용 · 브라우저에서 프리뷰 가능                               |

```text
[3D 제너레이터] Pyodide → R3F → recordFrames(0°…360°) → frames.zip
        ↓
[Remotion] TechAnim3DComposition — frameNumber → <Img src={frames[i]} />
        ↓
/fast/render { compositionId: "TechAnim3D", inputProps: { framesUrl, fps, captions } }
```

#### 3.5.1.B-2 CadQuery 코드 기반 「시뮬레이션」영상 (모드2 — **가능·권장**)

**결론:** 모드1 ComfyUI 없이, **동일 Monaco CadQuery 코드**를 시간축으로 반복 실행해 메시를 바꾸고 → R3F가 프레임을 캡처 → Remotion이 MP4로 묶는 방식이 **모드2 TECH_ANIM의 정석**이다.  
CadQuery는 **물리 엔진(FEA·유체)이 아니라** “파라메트릭·조립·단면” **기하 시뮬레이션**에 강하다.

| 시뮬레이션 종류                    | CadQuery/Pyodide                  | R3F                    | ComfyUI 필요? |
| ---------------------------------- | --------------------------------- | ---------------------- | ------------- |
| **파라메트릭 스윕** (치수 10→50mm) | `globals` 매 프레임 변경 → 재실행 | 동일 메시 갱신 후 캡처 | ❌            |
| **조립 시퀀스** (부품 순차 노출)   | 단계별 `union` / visibility       | 부품별 group opacity   | ❌            |
| **단면·필렛 진행**                 | `split`·`fillet` 단계 코드        | 고정 카메라            | ❌            |
| **카메라 오빗** (형상 고정)        | 1회 ToMesh                        | `camera.theta` 스윕    | ❌            |
| **분해(exploded) 뷰**              | 부품별 solid 분리                 | group `position` 보간  | ❌            |
| FEA·충돌·유체                      | CadQuery 범위 밖                  | 외부 결과 메시 import  | (별도)        |

**마스터 파이프 (3D ↔ Video 모드2):**

```text
[AI 3D] C3Dv0 → Monaco CadQuery 코드 (단일 소스)
        ↓
[Tiptap/Video timeline] simulationSpec — Rivet·Ollama이 JSON으로 채움
        ↓
[브라우저 — 「시뮬레이션 녹화」]  fastProfile=TECH_ANIM, engine=cadquery_r3f
  for frame in 0..N-1:
    pyodide.globals.set(PARAM, lerp(from, to, frame))
    runPythonAsync(monaco CadQuery)
    ToMesh → R3F setMeshData
    r3f.gl.render() → capture PNG → frames[frame]
        ↓
POST /video/fast/r3f/export  { framesZip, fps, cadquerySourceHash }
  (또는 Video 앱에서 직접 ZIP 업로드)
        ↓
[Rivet] Tiptap 자막 + Sound BGM 메타 병합
        ↓
POST /video/fast/render  TechAnim3D + captions
        ↓
모드2 MP4 (GPU·Diffusion 0)
```

**`simulationSpec` 예 (timeline 또는 shot에 첨부):**

```json
{
  "engine": "cadquery_r3f",
  "cadqueryRef": { "projectId": "...", "monacoRevision": 12 },
  "type": "param_sweep",
  "param": "USER_WIDTH",
  "from": 10,
  "to": 80,
  "unit": "mm",
  "steps": 60,
  "fps": 30,
  "camera": { "mode": "orbit", "thetaFrom": 0, "thetaTo": 360 }
}
```

```json
{
  "type": "assembly_sequence",
  "steps": [
    { "label": "base plate", "codeOffset": [0, 120] },
    { "label": "side wall", "codeOffset": [121, 200] }
  ],
  "holdFramesPerStep": 15
}
```

**LLM 역할 (모드2에서도 C3Dv0 재사용 가능):**

| 단계                          | 출력                                                                     |
| ----------------------------- | ------------------------------------------------------------------------ |
| 3D 「AI 생성」                | CadQuery **본문** 코드                                                   |
| Video `/project/draft`        | `simulationSpec` + Tiptap **내레이션** (“너비가 커질수록…”)              |
| (선택) `/video/simulate/plan` | Ollama가 `param`·`steps`·`type` 만 제안 — **본문 코드는 3D Monaco 유지** |

**Rivet 노드 추가 (예):** `ParseSimulationSpec` → `ValidateCadQueryRef` → `EnqueueFrameCapture` (클라이언트 job) → `WaitFramesZip` → `BuildTechAnim3DProps`.

**3D 제너레이터 UI 확장 (권장):**

- 버튼 **「모드2로 시뮬레이션 영상」** — 현재 mesh·Monaco 코드·슬라이더 범위를 `simulationSpec`으로 Video 프로젝트에 전달
- 녹화 중: 기존 R3F 뷰 + 진행률 — **실시간 연출은 R3F**(P5·Tone 불필요, 또는 Sound BGM만)
- 완료 후: Physis Video 탭으로 handoff → Remotion 자막·컷

**비용·성능:**

| 항목 | 값                                                               |
| ---- | ---------------------------------------------------------------- |
| 연산 | **브라우저 Pyodide + WebGL** (축 A) — CAD 서버·ComfyUI GPU **0** |
| 병목 | `steps × ToMesh` — 60~120프레임 권장, Ethos `maxSteps`           |
| 품질 | 메시·조명은 **CAD 기하 그대로** — AI 환각 없음                   |

**한계 (문서화):**

- 프레임마다 Pyodide **전체 재실행**은 무겁다 → `steps` 상한 · 키프레임만 변경(카메라만 오빗 시 1회 ToMesh)
- 복잡 물리 시뮬은 **결과 메시/CSV를 import**한 뒤 동일 R3F 캡처 루프에 태우기 (Phase 2)

> 상세 CadQuery 실행 루프: [`AI 3D 제네레이터.md`](./AI%203D%20제네레이터.md) §1.1 · §「모드2 시뮬레이션 연동」

**Rivet 선택 규칙 (권장):**

- `brief.domain` ∈ `math, algorithm, proof` → **Manim**
- `asset.meshSnapshotId` 또는 **`simulationSpec.engine=cadquery_r3f`** → **CadQuery→R3F→Remotion** (§3.5.1.B-2)
- HYBRID: 히어로 컷만 모드1 ComfyUI, 설명 구간은 TECH_ANIM

**실시간:** 프리뷰는 R3F(3D) 또는 Remotion Player; **최종 굽기는 「렌더」 한 번**.

---

#### 3.5.2 DATA_VIZ — 실시간 인터랙티브 UI · 데이터 대시보드 시각화 (Remotion)

**목적:** ESPHome·공장 KPI·Aionos 스트림을 **움직이는 차트·게이지·테이블** 영상으로보냄. “살아 있는 대시보드”를 **MP4로 기록**해 공유·보고·쇼츠에 사용.

| 항목         | 내용                                                                                                                  |
| ------------ | --------------------------------------------------------------------------------------------------------------------- |
| 주 엔진      | **Remotion** — React 컴포넌트 = 매 프레임 UI                                                                          |
| 데이터       | Rivet `MapAssets` ← API/CSV/JSON · (실시간) Yjs `metrics` 스냅샷                                                      |
| 컴포넌트     | Recharts · D3 · 커스텀 SVG · Quasar 스타일 카드 **복제본**(Physis와 동일 토큰)                                        |
| “인터랙티브” | 편집기 안 슬라이더는 **Remotion `useCurrentFrame()`** 으로 재매핑 — 센서 고주파는 **P5+Tone**(§7), MP4 렌더는 버튼 시 |

**파이프:**

```text
Tiptap: "지난 7일 센서 트렌드 + 임계치 알람 강조"
        ↓
Ollama → timeline + DATA_VIZ 메타
        ↓
Rivet: 쿼리 API / Yjs snapshot → series[], thresholds[]
        ↓
LLM → Remotion inputProps (JSON only, not full TSX)
        ↓
POST /video/fast/render
  { compositionId: "DashboardKpi", inputProps: { series, theme, durationInFrames } }
        ↓
@remotion/renderer (플랫폼 Node) → mp4
```

**`inputProps` 예:**

```json
{
  "title": "라인 A 온도",
  "series": [
    { "t": 0, "v": 42 },
    { "t": 1, "v": 45 }
  ],
  "threshold": 50,
  "aspect": "16:9",
  "highlightFrames": [120, 180]
}
```

**템플릿 레지스트리:** `templates/remotion/DashboardKpi/Composition.tsx` — props 스키마만 LLM이 채움.

**Aionos·Sense 연동:** 센서 라이브 → Physis **Remotion Player 프리뷰** + P5; 확정 스냅샷으로 **보고용 MP4** 렌더.

**실시간 vs 렌더:**

| 구분          | 기술                                       |
| ------------- | ------------------------------------------ |
| 탐색·센서     | P5 · Tone · (선택) Remotion Player `pause` |
| 배포·보고 MP4 | Remotion **단일 렌더** job                 |

---

#### 3.5.3 EDU_SCREEN — 코딩 · 소프트웨어 교육용 화면 합성 (MoviePy)

**목적:** IDE 화면·터미널·슬라이드·웹캠(선택)을 **컷 규칙에 맞게** 이어 붙이고, 줌·하이라이트·자막·BGM을 **Python 편집 로직**으로 적용. **Diffusion 없음.**

| 항목      | 내용                                                                                |
| --------- | ----------------------------------------------------------------------------------- |
| 주 엔진   | **MoviePy 2.x** — 플랫폼 `MoviePyRunner` + ffmpeg                                   |
| LLM       | C3Dv0·Pippi와 동형 — **`/video/edit/generate` → Monaco**                            |
| 입력 자산 | 화면 녹화 `.mp4` · IDE 스크린샷 · Sound **내레이션 WAV** · Tiptap **타임코드 메모** |

**전형 샷 구성:**

| 트랙      | 소스                 | MoviePy 처리                        |
| --------- | -------------------- | ----------------------------------- |
| 메인      | OBS/브라우저 녹화    | `subclip`, `crop`, `resize`         |
| PIP       | 웹캠 (선택)          | `CompositeVideoClip` 우하단         |
| 자막      | Tiptap `script`      | `TextClip` · 키워드 하이라이트 구간 |
| 오디오    | Sound 제너레이터 WAV | `with_audio`, ducking               |
| 커서 강조 | (선택) 좌표 메타     | `crop` 애니메이션 — Phase 2         |

**파이프:**

```text
Tiptap 대본 + timeline (IN/OUT per shot)
        ↓
Rivet: fastProfile=EDU_SCREEN · MapAssets(screen_recording_urls[])
        ↓
Ollama → MoviePy code (Monaco)
        ↓
POST /video/edit/render { code, assets, audioUrl }
        ↓
플랫폼 ffmpeg + MoviePy → lesson_final.mp4
```

**Remotion과 역할 분리:**

|         | Remotion (DATA_VIZ, TECH_ANIM B) | MoviePy (EDU_SCREEN)       |
| ------- | -------------------------------- | -------------------------- |
| 콘셉트  | **합성 UI를 코드로 그림**        | **이미 찍힌 화면을 자름**  |
| 교육 UX | 차트·다이어그램 모션             | **실제 IDE/터미널** 다루기 |
| Monaco  | props JSON (주로)                | **Python 전체** (주)       |

**Glos 탭:** MoviePy 코드 **AI 생성 → 수정 → 「편집 렌더」** — 3D CadQuery Run과 동일 muscle memory.

---

#### 3.5.4 FAST 프로필 통합 — Rivet · API · UI

**Rivet `RouteFastProfile` 이후:**

```
NEWS_SHORT     → BuildRemotionProps → /fast/render
TECH_ANIM      → ManimRender | R3FExport+Remotion → /fast/render
DATA_VIZ       → BuildDashboardProps → /fast/render
EDU_SCREEN     → GenerateMoviePy → /edit/render
```

**추가 API:**

| API                                                 | 프로필                                           |
| --------------------------------------------------- | ------------------------------------------------ |
| `POST /api/v1/video/fast/render`                    | Remotion (공통) — `compositionId` + `inputProps` |
| `POST /api/v1/video/fast/manim/render`              | TECH_ANIM-A — Manim code                         |
| `POST /api/v1/video/fast/r3f/export`                | TECH_ANIM-B — 프레임 ZIP (3D 연동)               |
| `POST /api/v1/video/edit/generate` · `/edit/render` | EDU_SCREEN                                       |

**Physis UI — 모드2 패널:**

| UI                | 프로필                                      |
| ----------------- | ------------------------------------------- |
| Remotion Player   | DATA_VIZ · TECH_ANIM(B) · NEWS_SHORT        |
| Monaco            | EDU_SCREEN · TECH_ANIM(Manim)               |
| 3D 임베드 링크    | TECH_ANIM — 「R3F 시퀀스보내기」            |
| paper.js 타임라인 | 전 프로필 공통 — 샷별 `fastProfile` 색 뱃지 |

**자산 레지스트리 추가:**

- `templates/remotion/DashboardKpi/`
- `templates/remotion/TechAnim3D/`
- `templates/remotion/NewsShort9x16/`
- `templates/manim/scenes/` (허용 Scene 베이스)
- `docs/Nexia/video-moviepy-edu-patterns.md`

### 3.3 모드 비교표

|              | 모드 1 CINEMATIC         | 모드 2 FAST                                     |
| ------------ | ------------------------ | ----------------------------------------------- |
| 픽셀 생성    | Diffusion **다수 샷**    | **없음** (스톡) 또는 1장                        |
| 주 UI (후반) | job 카드·프리뷰          | Tiptap 자막 + Remotion 프리뷰 / Monaco(MoviePy) |
| Rivet 분기   | `SubmitCinematicJobs`    | `RouteFastProfile` → §3.5 4종                   |
| 실시간       | P5+Tone (재큐 ❌)        | 동일                                            |
| 3D/Sound     | R3F→ControlNet · WAV→BGM | 스톡·WAV mux                                    |

### 3.4 HYBRID (실무 기본)

1. **FAST**로 전체 타임라인·자막·스톡 골격 렌더 (프리뷰 공유)
2. 히어로 샷만 **CINEMATIC** ComfyUI 1~3컷
3. Rivet **`MergeOutputs`** — MoviePy 또는 Remotion으로 교체 컷 삽입

---

## 4. UI · 7탭 매핑

| 단계            | UI                                    | 탭                                |
| --------------- | ------------------------------------- | --------------------------------- |
| 기획·대본       | **Tiptap**                            | **1 Ethos** (또는 Cockpit 임베드) |
| 로직·분기       | **Embedded Rivet / NEXIA React Flow** | **2 Synapse**                     |
| 모드2 코드      | Monaco (MoviePy) · Remotion IDE       | **3 Glos** (선택)                 |
| 렌더·프리뷰·job | React · `<video>` · P5 · Tone         | **5 Physis**                      |
| 승인·쿼터       | Cockpit                               | **0 Cockpit**                     |

**제너레이터 앱 (Vite):** Physis에 임베드 — **Tiptap 패널 | 타임라인(paper.js) | 프리뷰 | 모드 스위치**.

| 패널      | 역할                                        |
| --------- | ------------------------------------------- |
| Tiptap    | brief + script                              |
| paper.js  | `timeline.shots` 시각 편집 (Sound 탭2 동형) |
| 모드 토글 | CINEMATIC / FAST / HYBRID                   |
| 프리뷰    | clip job + final MP4                        |

---

## 5. 기술 스택 맵

| 레이어     | 모드 1                      | 모드 2                                          |
| ---------- | --------------------------- | ----------------------------------------------- |
| 초안 LLM   | Ollama `VideoProject`       | 동일                                            |
| 사람 편집  | Tiptap + Yjs                | 동일                                            |
| 오케스트   | Rivet + LangGraph           | 동일                                            |
| 굽기       | ComfyUI + 템플릿 레지스트리 | Remotion · **Manim** · **R3F export** · MoviePy |
| 2D/3D 기술 | —                           | Manim · R3F→Remotion (§3.5.1)                   |
| 대시보드   | —                           | Remotion + chart props (§3.5.2)                 |
| 교육 화면  | —                           | MoviePy (§3.5.3)                                |
| 스톡       | —                           | NEWS_SHORT · Pexels 프록시                      |
| 자막       | ComfyUI (선택)              | Remotion · MoviePy `TextClip`                   |
| 오디오     | ComfyUI mux · Sound WAV     | Tone 프리뷰 · ffmpeg mux                        |
| 실시간     | P5 + Tone + video           | 동일                                            |

**자산 레지스트리 (Git/DB):**

- `templates/comfyui/*.json` — 모드 1
- `templates/remotion/*/Composition.tsx` — 모드 2
- `docs/Nexia/video-moviepy-patterns.md` — 모드 2 MoviePy 허용 API

---

## 6. 데이터 흐름 · API

### 6.1 [A] MVP 순서

1. `/video/project/draft` — Ollama → Tiptap 주입
2. 사용자 Tiptap·paper 편집 → Yjs 저장
3. 「정제·렌더」→ Rivet `RunProject`
4. 모드별 실행 → MP4 URL → Physis 프리뷰

### 6.2 API 요약

| API                                    | 단계                          | 출력                                |
| -------------------------------------- | ----------------------------- | ----------------------------------- |
| `POST /api/v1/video/project/draft`     | ①                             | brief, script, timeline             |
| `PUT /api/v1/video/project`            | ②                             | Yjs/Tiptap 동기화 저장              |
| `POST /api/v1/video/project/refine`    | ③                             | Rivet 실행 → 정제 timeline + `mode` |
| `POST /api/v1/video/jobs`              | 모드1                         | ComfyUI job                         |
| `POST /api/v1/video/fast/render`       | 모드2 Remotion (공통)         | compositionId + inputProps → MP4    |
| `POST /api/v1/video/fast/manim/render` | TECH_ANIM                     | Manim code → clip                   |
| `POST /api/v1/video/fast/r3f/export`   | TECH_ANIM · **CadQuery 시뮬** | frames ZIP (§3.5.1.B-2)             |
| `POST /api/v1/video/simulate/plan`     | (선택)                        | `simulationSpec` 제안               |
| `POST /api/v1/video/edit/generate`     | EDU_SCREEN                    | MoviePy → Monaco                    |
| `POST /api/v1/video/edit/render`       | EDU_SCREEN                    | code + assets → MP4                 |

### 6.3 Rivet `RouteMode` 입력

```json
{
  "mode": "FAST",
  "timeline": { "shots": [...] },
  "ethos": { "maxGpuSec": 0, "allowStock": true }
}
```

`mode` 미지정 시 Ollama `suggestedMode` + Ethos 규칙으로 자동.

---

## 7. 실시간 · 3D · Sound 연동

| 트리거               | 처리                                                     |
| -------------------- | -------------------------------------------------------- |
| 센서·슬라이더        | **P5 + Tone + video** only                               |
| Tiptap·타임라인 수정 | Rivet 재정제 — **렌더 버튼까지 ComfyUI/Remotion 미호출** |
| 「렌더」             | 선택 모드로 일괄 job                                     |

| 연동         | 용도                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------ |
| 3D / Blender | 모드1 ControlNet · TECH_ANIM · [Blender turntable](./AI%203D%20Blender%20백엔드%20연동.md) |
| Sound WAV    | BGM — Tone 프리뷰 · 최종 mux                                                               |
| 음성 인풋    | Cockpit → `/project/draft` 프롬프트                                                        |

---

## 8. 비용 3축

| 축               | 모드1                          | 모드2                       |
| ---------------- | ------------------------------ | --------------------------- |
| **A 클라이언트** | Tiptap·Remotion 프리뷰·P5·Tone | **대부분 여기**             |
| **B LLM**        | project/draft + Intent         | draft + (가끔) MoviePy code |
| **C GPU·미디어** | **ComfyUI VRAM** (큼)          | 스톡 CDN·CPU 렌더 (작음)    |

- ✅ _「기획·대본은 Tiptap. 실행 분기는 Rivet. 시네마만 GPU. 쇼츠는 FAST.»_
- ❌ _「모든 영상을 ComfyUI로»_ — 비용·시간 폭발

---

## 9. MVP vs Phase 2

| 항목    | MVP                                                    | Phase 2                                                         |
| ------- | ------------------------------------------------------ | --------------------------------------------------------------- |
| ① 초안  | `/project/draft` + Tiptap                              | 음성·PDF ingest                                                 |
| ③ Rivet | RouteMode + 1 ComfyUI 템플릿 + **Remotion 템플릿 1종** | HYBRID 자동 · 다중 템플릿                                       |
| 모드1   | 1 GPU · SVD/Flux                                       | Wan·LTX                                                         |
| 모드2   | NEWS_SHORT Remotion                                    | **TECH_ANIM** Manim+R3F · **DATA_VIZ** · **EDU_SCREEN** MoviePy |
| UI      | Tiptap + paper + Physis 프리뷰                         | Synapse 라이브 · Monaco                                         |
| 협업    | Yjs                                                    | Cockpit 승인·큐 알림                                            |

---

## 10. 구현 체크리스트

1. `VideoProject` JSON 스키마 + `/project/draft`
2. Ethos(또는 Physis) **Tiptap** + Yjs
3. Rivet: `IngestProject` → `RouteMode` → (ComfyUI \| Remotion)
4. ComfyUI 템플릿 1종 + `/video/jobs`
5. Remotion `NewsShort9x16` + `/fast/render`
6. **DATA_VIZ:** `DashboardKpi` composition + API→props
7. **TECH_ANIM:** Manim 1씬 OR 3D→R3F export→`TechAnim3D`
8. **EDU_SCREEN:** MoviePy `/edit/*` + Monaco
9. paper.js — 샷별 `fastProfile` 뱃지
10. P5·Tone · Ethos 쿼터

---

## 11. 관련 문서

| 문서                                                                                                               | 연관               |
| ------------------------------------------------------------------------------------------------------------------ | ------------------ |
| [NEXIA 주요 외부 엔진들과 아키텍쳐.md](./NEXIA%20주요%20외부%20엔진들과%20아키텍쳐.md)                             | ComfyUI·Physis·§10 |
| [00 인공지능 NEXIA 구조와 기술 스택과 운영방침.md](./00%20인공지능%20NEXIA%20구조와%20기술%20스택과%20운영방침.md) | Ethos=Tiptap       |
| [AI 3D](./AI%203D%20제네레이터.md) · [AI SOUND](./AI%20SOUND%20제네레이터.md)                                      | 자산 입력          |
| [Nexia 음성 인풋](./Nexia%20음성%20인풋%20자동화%20및%20확장%20로직.md)                                            | 자연어 → draft     |

---

_상태: v5 — 모드2 **fastProfile**: TECH_ANIM(Manim·R3F+Remotion) · DATA_VIZ(Remotion) · EDU_SCREEN(MoviePy) · NEWS_SHORT._
