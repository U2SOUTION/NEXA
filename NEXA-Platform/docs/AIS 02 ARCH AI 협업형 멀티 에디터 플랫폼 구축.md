# [기획서] AI 협업형 멀티 에디터 플랫폼 구축

NEXA AI 도메인 현재 구조를 분석하고, **AI 협업형 멀티 에디터 플랫폼**의 기획 기초를 정리한 문서이다. **이벤트(mitt) - 상태(Pinia) - 검증(Zod) - 영속성(PersistedState)**이라는 현대적인 웹 앱의 4대 요소를 모두 갖추고 있으며, 특히 **Focus Stack** 개념은 단순한 에디터를 넘어 **지능형 워크스페이스**로 가는 핵심 차별점이다.

---

## 0. 배경 및 목적

### 0.1 배경

본 사이트는 **IoT 기반 엄격한 기계 조작 플랫폼**에서 **창의적인 아트 프로젝트**로 확장하기 위해, **AI와 협업 가능한 구조**를 구축하는 과정에 있다. 따라서 AI 도메인뿐 아니라 다른 도메인도 함께 준비하고 있으며, 본 기획서는 그 일환으로 진행된다.

현재 **단일 파일 편집 중심**의 웹 플랫폼을 **다중 파일 동시 편집이 가능한 IDE급 환경**으로 격상시킨다.

목표 기능은 다음 두 가지를 모두 지원하는 것이다.

1. **여러 종류의 파일을 여러 탭에서 열 수 있다.**  
   문서 탭, 코드 탭, 이미지 탭 등 각 탭은 해당 유형의 파일을 다룬다. 여러 탭을 동시에 열어 서로 다른 종류의 파일을 함께 작업할 수 있다.

2. **단일 탭에서 같은 종류의 파일을 여러 개 열어서 편집할 수 있다.**  
   한 탭 안에서 열린 파일 1개당 **패널** 1개를 부여한다. 예: 코드 탭에서 file1.ts, file2.ts, file3.ts를 열면 패널 3개가 한 탭에 공존하고, 패널 간 전환으로 같은 종류의 여러 파일을 동시에 편집한다.

### 0.2 목적

- **Ollama(AI)와의 실시간 협업**을 최우선으로 고려
- **Vercel AI SDK**를 통해 **로컬 모델(Ollama)** 과 **클라우드 모델**을 유연하게 교체·사용. 선택한 **페르소나·스킬·테스크의 일관성**을 모델 전환과 관계없이 유지한다.
- **멀티 에이전트·오케스트레이터**: 로컬의 **여러 AI 모델**(코드/문서/이미지 등)을 다루어 **멀티모달**을 흉내 내기 위한 **오케스트레이터(useAiOrchestrator)**. 입력 분석·라우팅·컨텍스트 구성·호출·검증·결과 반영의 기준을 5.7에 정리.
- **로컬 모델의 저사양**과 **엣지 디바이스 AI** 한계를 보완하고, 보다 **똑똑한 기능**을 위해 **JSON으로 데이터를 통일**하며, **도메인·프로젝트별 페르소나·스킬·테스크**를 추가·관리·적용할 수 있는 시스템 구축
- **Tiptap(문서)**과 **Monaco(코드)**를 비롯한 미디어 편집 도구를 체계적으로 통합
- **뷰어 탭**: 문서·코드·이미지·오디오·영상 등 **모든 에디터 유형에 대응하는 멀티 뷰어**로 역할 수행
- AI 채팅과 멀티 타입 에디터(문서/코드/이미지/오디오/비디오)를 **동시에** 활용할 수 있는 협업형 작업 환경 구축
- 채팅·에디터·탐색기를 **3영역 스플릿**으로 배치해 작업 흐름 유지

### 0.3 적용 범위

| 영역 | 범위 |
|------|------|
| 프레임 | left(채널/노트/미디어) · content(3영역 스플릿) · right(에이전트/설정) |
| 콘텐츠 | 좌(채팅) · 중앙(에디터/코드/이미지/오디오/비디오/뷰어) · 우(탐색기) |
| 백엔드 | Ollama(로컬) + Vercel AI SDK를 통한 클라우드 모델 연동 |

---

## 1. 주요 용어 및 UI 구조 정의

> 기존 Quasar의 **탭(q-tab)** 개념과 혼동을 피하기 위해 다음과 같이 명칭을 정의한다. 문서 내 모든 기술 용어는 이 정의를 따른다.

### 1.1 핵심 용어

> **Workspace·Project 정의**는 [NEXA-STACK-01] §8.0을 기준으로 한다. Workspace = 도메인별 추상적 작업공간(UI 개념, DB 없음). **Project** = 최상위 작업단위(DB 테이블 유지).

| 용어 | 영문 | 정의 |
|------|------|------|
| **워크스페이스** | Workspace | 각 도메인에서 사용되는 **추상적 작업공간**(UI 개념). 여러 편집 도구와 AI 채팅이 배치되는 컨테이너. **DB 테이블 없음**. 현재 AI 도메인의 content 영역(AiContent → AiSplitLayout)이 이에 해당. [NEXA-STACK-01] §8.0 |
| **프로젝트** | Project | **최상위 작업단위**. 생성·불러오기·저장·분류의 기준. **DB 테이블 유지** (`projects`). 전 도메인 공통. 채팅·노트·파일·웹자료가 `project_id`로 소속. [NEXA-STACK-01] §8.0, [NEXA-AI-09] |
| **탭** | Tab | 에디터 유형을 구분하는 단위. `editor`, `code`, `image`, `audio`, `video`, `viewer`, `chat`, `explorer` 등이 각각 **탭**에 해당한다. 채팅·탐색기도 스플릿 영역을 넘나들 수 있는 탭으로 간주한다. 한 탭에서 여러 파일(또는 대화·폴더 등)을 동시에 열 수 있다. |
| **패널** | Panel | **탭 내에서 열린 파일 1개당 1개의 패널**. 실제 파일이 로드되어 편집되는 독립적인 단위 창. 예: 코드 탭에서 file1.ts, file2.ts를 열면 패널 2개. 패널 인스턴스는 **UUID 또는 ULID**로 고유 식별하여 탭·세션·다중 오픈 시 **ID 충돌**을 방지한다. |
| **배치 관리** | Layout Management | Quasar의 **QSplitter**와 **Pinia**를 사용하여 탭·패널의 **레이아웃 상태**(위치, 비율, 표시/숨김, 열린 패널 목록, **Z-index·Focus Stack**)를 관리하는 체계. Focus Stack은 AI 지칭("방금 수정한 그 코드" 등) 정확도 향상에 활용. |

### 1.2 계층 구조

```
워크스페이스
  └─ 탭 (editor | code | image | audio | video | viewer | chat | explorer | nexus)  ← 스플릿 영역 넘나들 수 있음. nexus=넥서스 맵(Nexus Map, 8.6). **탭 표시명은 "Nexus"**
       ├─ 패널 (파일 A)
       ├─ 패널 (파일 B)
       └─ 패널 (파일 C)
```

- **1탭 : N패널** 관계. 여러 탭에서 여러 종류의 파일을 열 수 있고, **한 탭에 같은 종류의 파일 여러 개**를 열면 각 파일이 패널로 표시된다.
- **Project·Workspace 계층**: UI 상 Workspace(도메인별) → **Project 선택** → 탭·패널 작업. 저장 시 **현재 선택된 Project**에 소속. [NEXA-STACK-01] §8.0

### 1.3 용어 구분 (혼동 방지)

| 구분 | Quasar/기존 용어 | 본 문서 용어 | 비고 |
|------|------------------|-------------|------|
| 최상위 작업단위(데이터) | — | **프로젝트(Project)** | 생성·불러오기·저장 단위. DB 테이블 유지 |
| 최상위 컨테이너(UI) | Tab, Drawer | **워크스페이스(Workspace)** | 탭·패널을 담는 UI 영역. 추상적 작업공간 |
| 에디터 유형 | q-tab, Tab | **탭** | editor, code, image, audio, video, viewer, chat, explorer (스플릿 넘나들 수 있음) |
| 파일 인스턴스 | — | **패널** | 탭 내에서 열린 파일 1개 = 패널 1개 |
| UI 전환 | q-tabs / q-tab-panels | 탭 전환 / 패널 전환 | 탭: 에디터 유형 선택, 패널: 열린 파일 간 전환 |

### 1.4 탭 네이밍 정책 (Label · ID · 도구 · 설계 의도)

| 탭 이름 (Label) | 탭 ID | 관련 도구 | 설계 의도 및 역할 |
|-----------------|-------|-----------|-------------------|
| **Dialogue** | `dialogue` | Chat | 지능형 대화: AI 페르소나와 소통하며 모든 워크스페이스의 맥락을 연결하는 협업 인터페이스 |
| **Narrative** | `narrative` | Tiptap | 서사 생성기: 파편화된 데이터를 엮어 철학적 의미와 인과관계를 기록하는 지식의 중심지 |
| **Logic** | `logic` | Monaco | 논리 설계기: 기계적 엄격성에 기반한 제어 코드와 시스템 로직을 설계하고 시뮬레이션 |
| **Media** | `media` | 통합미디어편집기 | 미디어 창작기: 이미지, 영상, 음원에서 예술적 메타포를 발굴하고 멀티모달 AI와 협업하는 공간. 패널로 미디어 타입 대응 |
| **Sense** | `sense` | UniversalViewer | 편집 대상이 아닌 **팩트(Raw Data)**를 관측하고, 그 위에 AI가 덧입힌 **인사이트**와 **메타포**를 함께 조망하는 통찰의 렌즈 |
| **Nexus** | `nexus` | Graph | 지능형 신경망: 모든 노드와 엣지의 관계를 시각적으로 설계하고 추론하는 최상위 지휘본부. **8.6 참조** |
| **Explorer** | `explorer` | Explorer | 자산 탐색기: **파일 탐색기**와 **프로젝트 탐색기** 하위 패널로 구분. 파일 탐색기는 내/외부(Internal/External) 자산 탐색·선택·채팅·에디터 주입. **프로젝트 탐색기**는 전역 작업파일 조회·하위 폴더 생성·Project 선택. [NEXA-AI-09] §3.6 참고 |

### 1.5 탭 ID 매핑 (구현용 레거시 호환)

| 탭 Label | 탭 ID (정식) | 레거시 ID | 에디터/도구 |
|----------|--------------|-----------|-------------|
| Dialogue | dialogue | chat | AiChatPanel |
| Narrative | narrative | editor | AiEditorPanel (Tiptap) |
| Logic | logic | code | AiCodeEditorPanel (Monaco) |
| Media | media | (구) image, audio, video, vision | **AiMediaPanel**: 단일 탭, 내부 하위 패널(이미지·음원·영상)로 파일 타입별 분기. 하위에 AiImageEditorPanel, AiAudioEditorPanel, AiVideoEditorPanel 사용 |
| Sense | sense | viewer | AiUniversalViewerPanel |
| Nexus | nexus | nexus | **AiNexusPanel**: Graph/Map (8.6). 현재 플레이스홀더, 추후 노드·엣지 시각화 구현 |
| Explorer | explorer | explorer | AiExplorerPanel |

### 1.6 Sense 탭 상세 정의 (멀티 뷰어)

Sense 탭(정식 ID: `sense`, 레거시 ID: `viewer`)은 **문서·코드·이미지·오디오·영상** 등 여러 유형의 파일을 **읽기 전용**으로 표시하는 **멀티 뷰어**이다. 단일 탭 내에서 유형별 뷰 컴포넌트를 전환하여 표시한다.

| 항목 | 정의 |
|------|------|
| **읽기 전용** | 편집 기능 없음. `EditorPanel` 규격의 `readonly: true` 고정. 저장·Dirty 처리 불필요 |
| **시뮬레이션** | 각 에디터 유형(editor/code/image/audio/video)의 **렌더 결과를 시뮬레이션**하여 표시. 실제 에디터 컴포넌트를 읽기 모드로 재사용하거나, 전용 뷰 컴포넌트로 표시 |
| **전환 방법** | 파일 확장자 또는 MIME 타입으로 **자동 감지** → 해당 뷰(문서/코드/이미지/오디오/영상) 렌더. 또는 사용자가 수동으로 뷰 유형 선택(드롭다운 등). 1단계에서는 자동 감지 우선. **매핑 예**: .md→문서, .ts/.vue→코드, .png/.jpg→이미지, .mp3/.wav→오디오, .mp4→영상 |
| **미지원 포맷** | 지원하지 않는 확장자/MIME일 경우 **"미지원 형식" 안내** 표시. 다운로드 링크 제공. 필요 시 "해당 에디터 탭에서 열기" 버튼으로 editor/code/image 등 전환 유도 |

**멀티 뷰어의 복잡성**: 유형별 렌더 규칙·전환 UX·에러 처리 등이 조합되어 복잡해질 수 있음. 1단계에서는 **지원 포맷을 문서·코드·이미지·오디오·영상으로 제한**하고, 단순화하여 구축하는 것을 권장한다.

**뷰어 확장 로드맵**: 현재 **구체적 확장 로드맵은 미정**이다. PDF, 3D, 스프레드시트 등 추가 뷰어 유형은 별도 검토가 필요하며, **다른 도메인**(예: 문서 도메인, 미디어 라이브러리)과 연계될 경우 공통 뷰어 컴포넌트·MIME 매핑 등을 전역으로 분리할 필요가 있다. 향후 도메인 전역 뷰어 정책과 연동하여 정의한다.

### 1.7 NEXA-AI 도메인에서의 Project·탐색기

[NEXA-STACK-01] §8.0, [NEXA-AI-09] 기준으로 NEXA-AI는 다음을 지원한다.

| 항목 | 내용 |
|------|------|
| **Project** | 생성·불러오기·선택. 저장·채팅·노트·미디어·웹자료는 **현재 선택된 Project**에 소속. |
| **우측 탐색기** | **파일 탐색기**와 **프로젝트 탐색기** 하위 패널로 구분. 동일 패널 탭 구조 사용. |
| **파일 탐색기** | 업로드/문서 폴더 등 내·외부 자산 탐색·선택·채팅·에디터 주입. [NEXA-AI-03] 웹 탐색기 문서폴더 연동 참고 |
| **프로젝트 탐색기** | 전역에서 사용되는 **모든 작업파일** 조회. 프로젝트별 하위 폴더 생성·관리. Project 선택 시 해당 데이터만 필터. |

---

## 2. 현재 AI 도메인 레이아웃 구조

### 2.1 디렉터리 구조

```
src/domains/ai/
├── AiDomain.vue                    # AI 도메인 진입점 (router-view 래퍼)
├── config/
│   ├── aiAgentTabRegistry.ts       # 에이전트 탭 정의 (스킬/테스크/업무카드)
│   └── aiPanelRegistry.ts          # 탭 ID(editor/code/...) ↔ 컴포넌트 매핑
├── components/
│   ├── AiChatPanel.vue             # AI 채팅 패널
│   ├── AiEditorPanel.vue           # 리치 텍스트 에디터 (Tiptap)
│   ├── AiCodeEditorPanel.vue       # Monaco 코드 에디터
│   ├── AiImageEditorPanel.vue      # 이미지 편집 패널
│   ├── AiAudioEditorPanel.vue      # 오디오 편집 패널
│   ├── AiVideoEditorPanel.vue      # 비디오 편집 패널
│   ├── AiExplorerPanel.vue         # 파일 탐색기 패널
│   └── AiUniversalViewerPanel.vue  # 범용 파일 뷰어
├── composables/
│   ├── useAiChannels.ts            # 채널/채팅 CRUD + 선택 상태
│   ├── useAiMemos.ts               # 메모 CRUD (ai_user_memos API)
│   ├── useAiAssets.ts              # 파일 자산 (documents/images/audio/video)
│   ├── useAiModels.ts              # Ollama 모델 목록/능력
│   ├── useAiSettings.ts            # 설정 (모델, 목차, 폰트 등)
│   ├── useAiSplitLayout.ts         # 3영역 스플릿 레이아웃 상태
│   ├── useAiUnifiedSearch.ts       # 통합 검색(채널/메모/미디어/파일)
│   ├── useAiInsertRequest.ts       # 에디터 삽입 요청 이벤트
│   ├── useAiExplorerSelection.ts   # 탐색기 → 채팅/에디터 주입
│   ├── useAiMediaTab.ts            # 미디어 탭 열기 요청
│   └── useAiLeftToolbar.ts         # 좌측 패널 툴바/버튼
├── services/
│   └── aiApi.ts                    # AI API (chat, chat-stream, models 등)
├── utils/
│   ├── chatOutline.ts              # 채팅 목차 추출
│   └── modelDisplayName.ts         # 모델 표시명 포맷팅
└── views/
    ├── content/
    │   ├── AiContent.vue           # 메인 콘텐츠 (AiSplitLayout 래퍼)
    │   └── AiSplitLayout.vue       # 3영역 드래그 스플릿 레이아웃
    ├── left/
    │   └── AiLeftNav.vue           # 좌측 네비게이션 (채널/노트/미디어)
    └── right/
        ├── AiRightPanel.vue        # 우측 패널 (에이전트/설정)
        └── agent/
            ├── AiAgentSkillPanel.vue    # 스킬 (준비 중)
            ├── AiAgentTaskPanel.vue     # 테스크 (준비 중)
            └── AiAgentWorkcardPanel.vue # 업무카드 (준비 중)
```

### 2.2 프레임 레이아웃 (domainRegistry)

```
┌────────────────┬─────────────────────────────────────────────────┬────────────────┐
│  [AiLeftNav]   │              [ AiContent → AiSplitLayout ]       │ [AiRightPanel] │
│  채널/노트/    │  ┌─────────────┬──────────────────┬────────────┐ │  에이전트/     │
│  미디어 탭     │  │ Left        │ Center           │ Right      │ │  설정 탭       │
│                │  │ chat        │ editor/code/     │ explorer   │ │                │
│                │  │             │ image/audio/     │            │ │                │
│                │  │             │ video/viewer     │            │ │                │
└────────────────┴──┴─────────────┴──────────────────┴────────────┴┴────────────────┘
```

- **left**: `AiLeftNav.vue` — 채널·노트·미디어 탭
- **content**: `AiDomain.vue` → `router-view` → `AiContent.vue` → `AiSplitLayout.vue`
- **right**: `AiRightPanel.vue` — 에이전트·설정 탭

### 2.3 콘텐츠 레이아웃 (워크스페이스 = AiSplitLayout)

- `q-splitter` 기반 **3열 구조** (배치 관리의 핵심)
- 영역별 `vuedraggable` **탭** + `q-tab-panels`로 **탭 전환** (에디터 유형 선택)
- 각 탭 내에서는 열린 파일(패널) 간 전환
- `aiPanelRegistry`의 ID는 **탭 ID**에 해당 (editor, code, image 등)

| 영역 | 기본 탭 ID | 설명 |
|------|------------|------|
| Left | `chat` | AI 채팅 |
| Center | `editor`, `code`, `image`, `audio`, `video`, `viewer` | 문서·코드·미디어 **탭** (탭당 여러 패널 가능). `viewer`는 **멀티 뷰어**(모든 에디터 유형 대응) |
| Right | `explorer` | 파일 탐색기 |

---

## 3. 탭 구성 (aiPanelRegistry → 탭 ID 매핑)

> **1단계 목표**: 모든 에디터를 `EditorPanel` 규격 인터페이스(Props/Events)로 추상화. 각 탭에서 **여러 패널(파일 인스턴스)** 을 동시에 열 수 있도록 구조화.

### 3.1 EditorPanel 규격 인터페이스 (Props/Events 뼈대)

Tiptap, Monaco, 이미지·오디오·영상 에디터 등 **모든 에디터 패널**이 공통으로 따르는 최소 규격. chat·explorer 탭은 패널이 “파일 인스턴스”가 아닌 대화·폴더 목록 등이므로 **일부 규격만 적용**(예: `loading`, `focus`, `close` 등). 상세는 구현 시 확장한다.

#### Props

| Prop | 타입 | 필수 | 용도 |
|------|------|------|------|
| `panelId` | `string` | O | 패널 고유 ID (UUID/ULID). Pinia·Focus Stack·동기화 브릿지 식별용 |
| `filePath` | `string \| null` | O | 파일 경로. null이면 미저장 새 파일 |
| `tabId` | `string` | O | `editor` \| `code` \| `image` \| `audio` \| `video` \| `viewer` |
| `modelValue` | `T` | O | 에디터 내용. Tiptap: JSON, Monaco: string, 미디어: Blob/메타데이터 등 에디터별 형식 |
| `readonly` | `boolean` | - | 읽기 전용. 기본 false |
| `loading` | `boolean` | - | 로딩 중 표시(QLinearProgress 연동) |

#### Events

| Event | 페이로드 | 용도 |
|-------|----------|------|
| `update:modelValue` | `T` | 내용 변경. v-model 양방향 바인딩, 동기화 브릿지 수신 시 `content` 반영 |
| `update:dirty` | `boolean` | Dirty 상태 변경. 패널 생명주기(5.4) 및 닫기 확인용 |
| `focus` | — | 포커스 획득. Focus Stack 갱신 |
| `blur` | — | 포커스 손실 |
| `close` | — | 패널 닫기 요청. 부모가 처리 |
| `save` | — | 저장 완료 |
| `insert-content` | `{ content: unknown }` | 외부 삽입 요청(`ai:insert-request` 응답). 부모가 `modelValue` 갱신 후 전달 |
| `request-device-control-approval` | `{ payload: unknown }` | **AI 안전성**. AI가 장비 제어 수치(전압·속도 등) 변경을 제안했을 때, 승인 UI 표시. 사용자 명시적 승인 전에는 반영 안 함 (Human-in-the-loop, 5.7 Safety Sandbox 참조) |
| `approve-device-control` | `{ approved: boolean, payload? }` | 사용자가 승인 버튼으로 승인/거부 시 emit. 승인 시에만 해당 패널에 제어 수치 반영 |

#### 진행 상태 표시 (QLinearProgress) — EditorPanel 공통 규격

모든 EditorPanel 규격 패널은 **진행 상태**를 패널 상단에 표시한다. Quasar `QLinearProgress` 사용. `loading` Prop으로 제어.

| 조건 | 표시 | 비고 |
|------|------|------|
| **파일 로드 중** | `loading: true` → 패널 상단 QLinearProgress 표시 | 초기 로드·대용량 파일. 가능하면 determinate(진행률) |
| **AI 응답 생성 중** | 해당 패널에 AI가 내용 삽입 중이면 `loading: true` | 스트리밍 시 indeterminate 또는 청크 진행률 |
| **저장 중** | (선택) 저장 중에도 표시 가능 | 구현 시 확장 |

- **대상 패널**: editor, code, image, audio, video, viewer, chat 등 **EditorPanel 규격을 따르는 모든 패널**
- **위치**: 패널 헤더 직하 또는 본문 상단. 에디터 콘텐츠 위에 얇은 바 형태
- **표시 기준**: `loading === true`일 때만 표시. `loading === false`이면 숨김

#### AI 페르소나 존재감 시각화 (확장 UX)

AI가 단순 텍스트 삽입기가 아닌 **동료**로 느껴지도록 하는 시각적 장치. 상세 규격·기획은 **8.5 참조**.

| 항목 | 요약 |
|------|------|
| **고스트 텍스트 (Ghost Text)** | AI가 제안하는 내용을 **확정 전** 에디터에 **흐릿하게** 미리 보여주는 시각적 규격. 수락/거부 후 반영 |
| **진행 상태 세분화 (Gutter)** | QLinearProgress 외에, **에디터 여백(Gutter)** 에 AI가 **문서의 어느 부분을 읽고 있는지**, **장비의 어느 수치를 분석 중인지** 상태 아이콘으로 표시하는 기획 |

#### 슬롯·기타

- **에디터별 확장**: 각 에디터(Tiptap, Monaco 등)는 위 Props/Events를 **최소한** 구현하고, 추가 Props/Events 확장 가능
- **공통 expose**: `getContent()`, `setContent(content: T)` (동기화 브릿지·AI 편집 제안 반영용). `focus()` (포커스 이동용)

---

| 탭 ID | 컴포넌트 | 설명 |
|-------|----------|------|
| chat | AiChatPanel | AI 채팅 대화·입력, 목차, 이미지 첨부 |
| editor | AiEditorPanel | 문서 탭. Tiptap. 탭 내 여러 파일 → 패널 N개 |
| code | AiCodeEditorPanel | 코드 탭. Monaco. 탭 내 여러 파일 → 패널 N개 |
| image | AiImageEditorPanel | 이미지 탭. 패널당 이미지 1개 |
| audio | AiAudioEditorPanel | 오디오 탭. 패널당 오디오 1개 |
| video | AiVideoEditorPanel | 영상 탭. 패널당 영상 1개 |
| viewer | AiUniversalViewerPanel | **멀티 뷰어** 탭. 문서·코드·이미지·오디오·영상 등 모든 에디터 유형에 대응. 패널당 파일 1개. |
| explorer | AiExplorerPanel | 파일 탐색기 (선택 파일 → 채팅/탭·패널로 주입) |
| nexus | (전용 컴포넌트) | **Nexus Map**. 문서·장비 관계 노드/선 시각화·편집. **탭 표시명 "Nexus"**. 8.6 참조 |

---

## 4. Composables 아키텍처

| Composable | 역할 | 연동 컴포넌트 |
|------------|------|---------------|
| useAiChannels | 채널·채팅 CRUD, 선택, Instruction | AiLeftNav, AiChatPanel, AiRightPanel |
| useAiSplitLayout | 3영역 탭·패널/비율, 표시/숨김, localStorage | AiSplitLayout, AiContent, AiExplorerPanel |
| useAiInsertRequest | 에디터 삽입 요청 콜백 | AiContent(구독), AiLeftNav(메모 등 호출) |
| useAiExplorerSelection | 탐색기 파일 → 채팅/에디터/미디어 주입 | AiContent(구독), AiExplorerPanel(호출) |
| useAiUnifiedSearch | 채널/노트/미디어/파일 통합 검색 | AiLeftNav, useAiChannels |
| useAiAssets | domain=ai 파일 CRUD, 미디어 카테고리 | AiLeftNav, AiExplorerPanel |
| useAiMemos | 메모 API (ai_user_memos) | AiLeftNav |
| useAiModels | Ollama 모델 목록/능력 | AiChatPanel, AiRightPanel |
| useAiSettings | 채팅·UI 설정, requestAttachToChat | AiChatPanel, AiRightPanel, AiExplorerPanel |
| useAiMediaTab | 미디어 탭·아코디언 열기 요청 | AiLeftNav(구독), AiExplorerPanel(호출) |
| useAiLeftToolbar | 좌측 패널 탭별 툴바 버튼 | AiLeftNav |
| **useAiOrchestrator** | **오케스트레이터**: 입력 분석·모델 라우팅·컨텍스트 구성·호출·검증·결과 반영 (5.7 참조) | AiChatPanel, 에디터 패널, 2단계 AI 협업 핵심 |

### 4.1 이벤트 버스 (mitt) 활용

형제·원거리 컴포넌트 간 **요청·트리거** 전달에 **mitt**를 사용한다. 기존 콜백(useAiInsertRequest 등)을 mitt 기반으로 전환·보완하여 결합도를 낮춘다.

| mitt 용도 | Pinia 용도 |
|----------|------------|
| 요청·트리거·알림 (일회성 이벤트) | 지속 상태 (탭·패널·Focus Stack·레이아웃) |

**주요 이벤트 예시**

| 이벤트 | 발신 | 수신 | 페이로드 |
|--------|------|------|----------|
| `ai:insert-request` | AiLeftNav(메모 등) | AiContent | `{ target, content }` |
| `ai:inject-to-chat` | AiExplorerPanel | AiContent | `{ file }` |
| `ai:inject-to-editor` | AiExplorerPanel | AiContent | `{ file, target? }` |
| `ai:open-media-tab` | AiExplorerPanel | AiLeftNav | `{ category }` |
| `ai:editor-content-sync` | 동일 filePath 패널 | 동일 filePath의 다른 패널들 | `{ filePath, panelId, content, tabId? }` (에디터 동기화 브릿지, 5.5 참조) |
| `ai:error` | 에러 발생 컴포넌트 | 전역 핸들러·로깅 | `{ code?, message?, source? }` (오류 수집용, 6.1 참조) |

**가이드라인**: 이벤트명은 `ai:` 접두사 사용. 페이로드는 `{ target?, content?, file? }` 등 필요한 정보만 전달. `useAiEventBus()` composable로 mitt 인스턴스 제공.

---

## 5. 데이터 흐름

### 5.1 에디터 삽입 (메모 등 → 에디터)

```
AiLeftNav (메모 우클릭/클릭) / 외부
  → mitt.emit('ai:insert-request', { target: 'editor', content })  // 또는 useAiInsertRequest
  → AiContent (mitt.on('ai:insert-request'))
  → showPanel('editor') + pendingInsertContent
  → 문서 탭 내 새 패널 또는 활성 패널에 삽입
```

### 5.2 탐색기 → 채팅/에디터

```
AiExplorerPanel (파일 선택 후 버튼)
  → mitt.emit('ai:inject-to-chat' | 'ai:inject-to-editor', { file })  // 또는 useAiExplorerSelection
  → AiContent (mitt.on) → 해당 탭 표시 + 새 패널로 파일 열기 또는 삽입
  → AiEditorPanel / AiChatPanel → 삽입
```

### 5.3 탭·패널 전환

```
탭 전환: useAiSplitLayout.showPanel(tabId)  // 현재 코드의 panelId = 본 문서의 탭 ID
  → getAreaAndIndexForPanel(tabId)
  → leftVisible/centerVisible/rightVisible + leftActiveIndex 등 설정
  → AiSplitLayout 탭 전환 (에디터 유형 선택)

패널 전환: 각 탭 내에서 열린 패널 목록 중 활성 패널 인덱스 변경 (1단계 이후 구현)
```

### 5.4 패널 생명주기 (Lifecycle)

#### 패널 열기 (Open)

- 탐색기·메모·채팅 등에서 파일 선택 → `ai:inject-to-editor` / `ai:insert-request` → 해당 탭에 **새 패널** 생성 또는 **활성 패널**에 삽입 (5.1, 5.2 참조)
- 패널 생성 시 **UUID/ULID**로 고유 ID 부여, Pinia store의 `열린 패널 목록`에 추가

#### 패널 닫기 (Close)

- 사용자가 패널 탭의 닫기 버튼(×) 클릭 시 **닫기 요청** 발생
- **Dirty 여부 확인** (아래 참조). Dirty면 저장 확인 다이얼로그 표시 후 진행
- 패널을 Pinia store의 `열린 패널 목록`에서 제거, Focus Stack에서 해당 ID 제거
- 해당 탭에 남은 패널이 있으면 **가장 최근 포커스 패널**을 활성화; 없으면 해당 탭 비활성 또는 기본 탭 전환

#### Dirty(변경사항) 처리

- **Dirty**: 메모리 상의 내용이 디스크/저장소와 다를 때. 각 에디터(Tiptap, Monaco 등)는 편집 시 `dirty` 플래그를 true로 설정
- **저장 시**: API 호출 후 `dirty = false`, 필요 시 `last_saved_at` 갱신
- **닫기 시 Dirty인 경우**:
  1. "저장하시겠습니까?" 확인 다이얼로그 표시 (저장 / 저장 안 함 / 취소)
  2. **저장** → 저장 후 패널 닫기
  3. **저장 안 함** → 내용 폐기 후 패널 닫기
  4. **취소** → 닫기 취소, 패널 유지
- 탭 전환·다른 패널 클릭 시에는 **즉시 저장/폐기하지 않음**. Dirty 상태 유지. (필요 시 "저장 후 전환" UX 추가 검토)
- **filePath가 null인 새 파일** 저장 시, 저장 위치·파일명 선택 플로우 필요. "다른 이름으로 저장" 다이얼로그 또는 파일 선택 모달 사용 권장.

#### 중복 오픈 (동일 파일 다중 패널)

- **기본 정책**: 동일 `filePath`를 같은 탭에서 다시 열면, **기존 패널로 포커스 이동** (새 패널 생성 X)
- **예외**: 사용자가 명시적으로 "새 창으로 열기" 등을 요청한 경우, 동일 파일을 **별도 패널**로 열 수 있음. 이때 패널 ID는 각각 UUID/ULID로 구분
- 중복 오픈 시 **에디터 동기화 브릿지**(5.5 참조)로 한쪽 수정을 다른 쪽에 전파. Yjs 도입 전까지의 임시 방편

### 5.5 에디터 동기화 브릿지 (1단계 범위, Yjs 전 임시 방편)

2개 이상의 패널이 **동일 `filePath`** 를 참조할 때(중복 오픈), 한쪽 편집 내용을 다른 패널에 전파하는 단순 브릿지. **Yjs 도입 전** 1단계에서 구현한다.

#### 전제

- 동일 파일을 여러 패널에서 열 수 있는 경우에만 동작 (5.4 중복 오픈 예외 케이스)
- **단일 사용자·단일 브라우저 탭** 전제. 멀티 유저·멀티 탭 실시간 협업은 Yjs로 처리

#### 동작 방식

| 단계 | 동작 |
|------|------|
| **1. 등록** | 패널이 `filePath`로 파일을 열면 브릿지에 `(filePath, panelId)` 쌍 등록. Pinia store 또는 별도 레지스트리로 관리 |
| **2. 구독** | 동일 `filePath`를 가진 패널이 2개 이상이면, 각 패널은 mitt 이벤트 `ai:editor-content-sync` 를 구독 |
| **3. 발행** | 패널 A에서 편집 완료(예: debounce 300ms 후)·저장·포커스 아웃 시 `mitt.emit('ai:editor-content-sync', { filePath, panelId, content, source })` |
| **4. 수신·반영** | `filePath`가 같은 **다른 패널**들(B, C…)만 수신. 발신 패널(panelId)은 제외. 수신 패널은 `content`로 로컬 에디터 내용을 **전체 교체** (setContent 등) |
| **5. Dirty 처리** | 수신 측 패널은 외부 동기화로 받은 갱신이므로 `dirty = false`로 설정. 사용자 직접 편집이 아니므로 저장 확인 불필요 |

#### 전파 트리거

- **텍스트/코드**: 편집 후 debounce(예: 300ms) 경과 시, 또는 사용자가 해당 패널에서 포커스 아웃 시
- **저장 시**: 저장 완료 시점에 최신 `content`를 브로드캐스트하여 다른 패널과 일치시킴

#### 제한 사항

- **전체 교체**: CRDT/OT가 아니므로 **전체 content** 교체. 동시 편집 시 마지막 전파가 이긴다(Last-Write-Wins). 충돌 해결 없음
- **에디터별 차이**: Tiptap(JSON), Monaco(문자열) 등 에디터마다 `content` 형식이 다름. `tabId`별로 직렬화/역직렬화 규칙 적용
- **미디어 탭**: 이미지·오디오·비디오는 바이너리/metadata 위주. 변경 시점이 뚜렷하면 동일 방식 적용, 아니면 1단계에서 생략 가능

#### mitt 이벤트 스펙 (추가)

| 이벤트 | 발신 | 수신 | 페이로드 | 비고 |
|--------|------|------|----------|------|
| `ai:editor-content-sync` | 동일 파일을 연 패널 | 동일 `filePath`의 다른 패널들 | `{ filePath, panelId, content, tabId? }` | 브릿지 전파용. `tabId`로 에디터 유형 구분 |

### 5.6 탭 영역 이동 UX (스플릿 영역 넘나들기)

채팅·탐색기 등 **특정 탭**이 좌·중앙·우 **스플릿 영역 간에 이동**할 수 있는 UX. 현재 전략의 타당성은 추가 검토 필요. **모바일 디바이스**나 향후 기능 확장 시 활용을 고려해 메모한다.

| 방식 | 동작 |
|------|------|
| **드래그** | 탭 헤더(또는 아이콘)를 좌/중앙/우 영역으로 드래그 앤 드롭 시 해당 영역으로 이동 |
| **메뉴** | 탭 우클릭 → "영역으로 이동" → 좌측 / 중앙 / 우측 선택 |
| **버튼** | 탭 헤더의 드롭다운/아이콘 클릭 시 영역 선택 옵션 표시 |

1단계에서는 **영역 고정**(chat=좌, center=에디터·코드·미디어·뷰어, explorer=우)이 기본. 영역 이동은 **추가 Phase**에서 구현 검토.

### 5.7 멀티 에이전트·오케스트레이터 (Multi-Agent / Orchestrator)

로컬의 **여러 AI 모델**을 다루어 **멀티모달**을 흉내 내기 위한 **멀티 에이전트 시스템**의 핵심이다. 본 문서에서는 이 중간 단계를 **오케스트레이터(Orchestrator)** 로 칭한다. (에이전트(Agent)와의 명칭 통일은 추후 규정 가능.) 구현 난이도가 높고, 실제 모델 다수 검토를 통해 구체화할 예정이므로, 여기서는 **기준·방향**을 정리한다.

#### 흐름 개요

```
사용자 입력
    ↓
[오케스트레이터]  ← 핵심 중간 단계 (useAiOrchestrator)
    ↓         ↓         ↓
코드 모델   문서 모델   이미지 모델
(CodeLlama) (Llama3)   (LLaVA)
    ↓         ↓         ↓
        결과 취합·통합
            ↓
        사용자에게 전달
```

#### 라우팅

- **규칙 기반 + 모델 기반 혼합**: 규칙(탭/파일타입/키워드)으로 1차 분기, 필요 시 소형 분류 모델로 의도 판별. 복잡도는 올라가나 **성능·정확도** 향상 목표.

#### 오케스트레이터 파이프라인 (useAiOrchestrator)

| 단계 | 내용 |
|------|------|
| **① 입력 분석** | `tabId` + 파일 타입 + 사용자 의도(질문/편집 요청 등) 추출 |
| **② 모델 선택 (라우팅)** | 규칙·모델 기반으로 코드/문서/이미지 등 **대상 모델** 결정 |
| **③ 미디어→텍스트 변환** | 필요 시 이미지/오디오를 텍스트로 변환 (LLaVA, Whisper 등) 후 하위 단계에 전달 |
| **④ 컨텍스트 구성** | **Focus Stack** + **패널 JSON**(10.1) + **선택 영역(selectionRange)** + **Nexus Map(관계망)**(8.6 참조) 조합. 참조 풀 내 JSON 데이터의 효율적 검색을 위해 **벡터 임베딩·유사도 검색** 로직 적용. 컨텍스트 관리 전략에 따라 토큰 제한·우선순위 적용 |
| **⑤ 모델 호출** | **Vercel AI SDK**로 해당 모델(Ollama·클라우드) 호출 |
| **⑥ Zod 응답 검증** | 응답이 요구 스키마와 일치하는지 **Zod**로 검증 (6.1 오류 처리와 연동) |
| **⑥-2 시뮬레이션 검증** | **코드(Monaco)** 인 경우, 실제 엣지에 업로드하기 전 **가상 장비(Simulator)** 환경에서 먼저 실행·검증. 통과 시에만 ⑦로 진행 (AI 안전성·Safety Sandbox, 5.7 하단 참조) |
| **⑦ 결과 반영** | 검증된 결과를 **해당 패널**에 반영 (insert-content, setContent 등). 장비 제어 수치 변경은 **인간 최종 승인** 후 반영 (5.7 하단 참조) |

#### AI 안전성 및 검증 레이어 (Safety Sandbox)

| 항목 | 내용 |
|------|------|
| **시뮬레이션 검증 단계** | Monaco에서 AI가 작성한 코드를 **실제 엣지에 업로드하기 전**, **가상 장비(Simulator)** 환경에서 먼저 실행해 보는 검증 프로세스. 오케스트레이터 파이프라인 **⑥-2**에 명시. 실패 시 사용자에게 오류 노출, ⑦ 결과 반영 중단 |
| **인간 최종 승인 (Human-in-the-loop)** | AI가 **장비 제어 수치**(전압, 속도 등) 변경을 제안할 때, **에디터 내 사용자의 명시적 승인 버튼** 없이는 반영되지 않도록 함. EditorPanel 이벤트 확장: `request-device-control-approval`(AI 제안 수신 시 승인 UI 표시), `approve-device-control`(사용자 승인 시에만 반영). 미승인 시 패널에는 반영하지 않거나 "승인 대기" 상태로 표시 |
| **가상 장비(Simulator)** | Wokwi 등 외부 API 사용 없이, **약식의 논리적 기능**을 부여한 시뮬레이터. **가상 개발 보드**는 **핀별 데이터 타입 검증** 중심으로 구성하고, **부품**도 비슷한 개념으로 하나씩 직접 추가해 나갈 예정. 상세 설계·구현은 **별도 기획서**에서 다룸. 본 문서에서는 "오케스트레이터 ⑥-2에서 코드를 가상 장비에서 실행·검증한다"는 연동 기준만 명시 |
| **system_instruction 계층** | **디폴트**: 하드코딩된 시스템 룰(예: HTML 사용 금지, 코드 주입 방지 등)을 기본으로 둠. **오버라이드**: 사용자가 **설정(useAiSettings)** 또는 **Nexus Map**에서 직접 지정한 룰이 있으면 디폴트를 덮어씀. 오케스트레이터·채팅 호출 시 우선순위: Nexus Map(할당된 페르소나/스킬) → 채팅별 system_instruction → 설정 → 디폴트 |
| **오버라이드 시 검증·안전 레이어** | 사용자가 **보안 규칙**(예: HTML 사용 금지)을 **명시적으로 덮어썼을 때**를 대비한 **유연한 검증·안전 전략**을 둠. 예: (1) 오버라이드 시 **확인 다이얼로그** 표시 (2) AI 응답 **후처리**에서 위험 패턴(스크립트·인라인 이벤트 등) **Zod 또는 정규식** 검증 후 제거/차단 (3) 오버라이드 기록 로깅. 구체 임계치·패턴 목록은 구현 시 정의 |

#### 컨텍스트 관리 (Context Management)

- **전략**: 오케스트레이터가 **단일 진입점**으로 컨텍스트를 조립. Pinia의 Focus Stack·열린 패널 목록·패널 JSON 스냅샷·**Nexus Map(관계망)**(8.6 참조)을 읽어, **활성/최근 패널 우선**으로 텍스트·메타를 수집. 토큰 제한이 있으면 **focusStack 순서·selectionRange** 기준으로 잘라냄. **관계망 데이터**를 함께 참고하여 문서 간 의존·연관을 반영한다.
- **관련 기술**: **Pinia**(Focus Stack·레이아웃·관계망), **패널 JSON**(layout·panels·focusStack·selectionRange), **벡터 임베딩·유사도 검색**(참조 풀 내 JSON 효율적 검색), **Zod**(입출력·컨텍스트 스키마), **Vercel AI SDK**(메시지·스트리밍). 컨텍스트 직렬화는 **JSON**으로 통일.
- **확장**: 페르소나·스킬·테스크(9.2.6)가 정해지면, 오케스트레이터가 해당 systemPrompt·promptTemplate을 컨텍스트에 병합.

#### 컨텍스트 우선순위·신선도 (Freshness)

Focus Stack에 **신선도(Freshness)** 개념을 보강하여, AI가 참조할 데이터의 **우선순위**를 세분화한다.

| 항목 | 내용 |
|------|------|
| **컨텍스트 가중치** | AI가 질문에 답할 때 **오래된 문서 내용**보다 **현재 장비에서 올라오는 실시간 경고·이벤트**에 더 높은 우선순위를 두도록 **컨텍스트 구성 전략(useAiOrchestrator)**을 보강. 예: 실시간 경고/알람 → 최근 IoT 인사이트 → Focus Stack 상위 패널 → 그 외 패널·오래된 스냅샷 순으로 가중치 부여. 토큰 제한 시 **신선도가 높은 소스**를 우선 포함 |
| **신선도 기준** | **타임스탬프·이벤트 발생 시점** 또는 **스트림 수신 시점**을 기준으로 신선도 산출. 장비 실시간 데이터·엣지 AI 인사이트는 문서 스냅샷보다 기본적으로 높은 신선도로 간주 (구체 수식·임계치는 구현 시 정의) |
| **컨텍스트 길이·자동 분리** | 토큰 한도에 근접하면 **자동 분리**(요약·중요 구간 유지) 또는 **우선순위 기반 잘라내기** 적용. 문서 길이(예: 1,000줄 내외) 유지와 동일한 설계 원칙 — 과도한 길이는 인지 부하·성능 저하를 유발하므로 기준이 됨 |

### 5.8 IoT 협업·데이터 수신 규격 (제3의 협업자)

**IoT 장비**를 사용자·AI와 함께 **제3의 협업자**로 수용하기 위한 데이터 수신 규격 방향. 플랫폼이 IoT 기반 기계 조작에서 확장된 맥락(0.1 배경)을 고려한 확장 영역이다.

#### 1. 데이터 이원화 전략

IoT·엣지 AI에서 오는 데이터를 **역할별로 구분**하여 패널이 수용할 수 있도록 한다.

| 유형 | 설명 | 패널 속성 예 |
|------|------|--------------|
| **팩트 (Raw Data)** | IoT 장비가 보내는 **원시 데이터**. 센서 값, 계측치, 이벤트 로그 등 | `dataSource: 'iot-raw'`, `payload`: 타임스탬프·값·장비 ID 등. 패널은 “팩트 전용” 뷰로 표시·저장 |
| **엣지 AI 추론 (Reasoning / Insight)** | 엣지에서 돌아가는 AI의 **추론·인사이트** 결과. 이상 탐지, 요약, 권고 등 | `dataSource: 'edge-ai-insight'`, `payload`: 추론 타입·요약·신뢰도 등. 패널은 “인사이트” 뷰로 구분 표시 |

- **패널 속성**: 해당 탭/패널이 **어떤 데이터 소스를 받는지** 구분. 예: `panelMeta.dataSource: 'iot-raw' | 'edge-ai-insight' | 'mixed'`. 오케스트레이터·다운스트림에서 팩트 vs 인사이트를 다르게 가공·표시할 수 있도록 한다.
- **수신 규격**: JSON 페이로드에 `type`(또는 `dataSource`), `sourceId`, `timestamp`, `payload` 등 공통 필드를 두고, 팩트/인사이트별 스키마는 **Zod**로 검증 검토.

#### 2. 실시간성 부하 관리

IoT 수치가 **초당 수십 번** 업데이트될 경우, 모든 값을 Pinia·Yjs에 그대로 반영하면 **성능 저하**가 발생할 수 있다.

| 방안 | 설명 |
|------|------|
| **이벤트 스로틀링 (Throttling)** | 수신 이벤트를 **시간 간격**으로 제한. 예: 최대 N회/초만 store·UI 반영. 나머지는 버리거나 별도 버퍼에만 유지 |
| **중요 변화 시에만 커밋** | **델타가 임계치를 넘을 때만** Pinia/Yjs에 반영. 미세한 변동은 누적했다가 의미 있는 변화만 커밋. 시나리오별 임계치(절대값·백분율) 정의 필요 |
| **시나리오 기반 정교화** | 장비 종류·샘플링 주기·용도(모니터링 vs 알람 vs 로그)에 따라 스로틀 주기·임계치·버퍼 정책을 나누어 설계. 별도 시나리오 문서에서 심화 검토 권장 |

위 정책은 **시나리오를 바탕으로 더 깊이 검토**할 예정이다. 1단계·2단계에서는 필요 시 “IoT 데이터 수신 시 스로틀·중요 변화만 반영” 정도만 가이드로 두고, Yjs·실시간 동기화(10.3) 단계에서 IoT 스트림과의 결합 방식을 구체화한다.

#### 3. 장비 로그 통합 (스킬 구조)

단순 **패널 정보**(열린 파일·Focus Stack)뿐만 아니라, **백그라운드에서 흐르는 IoT 로그 데이터**를 AI가 필요 시 **데스크로 끌어와** 분석할 수 있도록 한다.

| 항목 | 내용 |
|------|------|
| **스킬(Skill) 명시** | **"장비 로그 끌어오기"** 또는 **"IoT 로그 분석"** 를 **스킬**로 정의(9.2.6). AI가 사용자 질문·태스크 맥락에서 "최근 N분 로그 필요" 등으로 판단 시, 백그라운드 버퍼·스토어에 쌓인 IoT 로그를 **요약·필터링**하여 컨텍스트에 주입하거나, 전용 **패널/뷰**에 "데스크"로 끌어와 표시 후 분석에 활용 |
| **데이터 소스** | 5.8 데이터 이원화(팩트·인사이트)와 동일한 수신 규격. 로그는 **시계열 버퍼** 또는 **롤링 윈도우**로 유지하고, 스킬 호출 시 구간·장비 ID·심각도 등으로 조회 |
| **오케스트레이터 연동** | useAiOrchestrator의 **④ 컨텍스트 구성** 단계에서, 선택된 스킬에 "장비 로그 통합"이 포함되면 해당 구간 로그를 컨텍스트에 병합. 또는 **별도 패널에 로그 뷰**를 열어 사용자·AI가 함께 참조 |

---

## 6. 서비스 (aiApi)

> **Vercel AI SDK** 적용 시 로컬(Ollama)·클라우드 모델 통합 호출 인터페이스로 확장 예정.

| 메서드 | 설명 |
|--------|------|
| listModels | Ollama 모델 목록 조회 |
| getModelShow | 모델 상세 정보 |
| chat | 단발 채팅 요청 |
| chatStream | 스트리밍 채팅 (onChunk 콜백) |
| checkConnection | Ollama 연결 확인 |
| generateTitle | 대화 제목 생성 |

### 6.1 오류/예외 처리 방향성

구현 시 따라야 할 **최소한의 방향성**. 세부 전략은 구현 문서에서 정리한다.

| 상황 | 방향 |
|------|------|
| **AI 응답 Zod 검증 실패** | 스키마 불일치 시 **원문(raw) 표시** 또는 "응답 형식 오류" 안내. 재시도 버튼 제공. 로그(또는 디버그 모드)에 검증 에러 상세 기록. 사용자 입력·대화 이력은 유지 |
| **Ollama 연결 끊김** | `checkConnection` 실패 시 **토스트/배너**로 "Ollama에 연결할 수 없습니다" 표시. 재시도·설정 이동 버튼. 채팅 입력은 비활성화 또는 "연결 후 다시 시도" 안내. 기존 대화 내용은 유지 |
| **파일 로드 실패** | 패널에서 파일 열기 실패 시 **에러 상태 UI** 표시("파일을 불러올 수 없습니다"). 재시도 버튼, 패널 닫기 버튼. 네트워크·권한·파일 없음 등 원인별 메시지 구분 권장 |
| **저장 실패** | Dirty 상태 유지, 토스트로 실패 안내. 재시도·다른 이름으로 저장 옵션 제공 |
| **AI 스트리밍 취소** | 사용자가 스트리밍 중 취소 시 **AbortController** 등으로 요청 중단. 받은 내용까지 유지 또는 폐기 정책 결정 |

**공통**: Quasar `Notify` 또는 공통 토스트/배너 컴포넌트로 일관된 UX. 에러는 mitt `ai:error` 또는 전역 핸들러로 수집·로그 기록 검토.

---

## 7. 설정 지속성

| 항목 | 저장소 | 키/위치 | 비고 |
|------|--------|---------|------|
| 스플릿 비율, 영역 표시/숨김, 탭 구성·열린 패널 목록·활성 패널·Focus Stack | localStorage | Pinia store별 | 1단계: **Pinia** 전환. **pinia-plugin-persistedstate**로 store를 localStorage에 자동 영속화하여 기본 Pinia를 보조 |
| 채널·채팅 선택, Instruction | (기존 정책) | useAiChannels | — |
| 모델·목차·폰트 등 | (기존 정책) | useAiSettings | — |

### 7.1 하이드레이션(Hydration) 전략 및 로딩 상태 (Pinia Persisted State)

- **하이드레이션**: 앱 초기화 시 localStorage에서 Pinia store를 복원하는 시점에 **비동기 로딩** 발생. 하이드레이션 완료 전까지 레이아웃·탭·패널 UI는 **스켈레톤 또는 기본값**으로 표시하고, 완료 후 실제 상태로 교체한다.
- **로딩 상태**: `isHydrated`(또는 유사) 플래그를 store에 두어 하이드레이션 완료 여부를 추적. 하이드레이션 전에는 의존 컴포넌트가 **로딩 UI**를 보여주고, 완료 후 렌더링한다.
- **충돌 방지**: 여러 탭에서 동시 접근 시 localStorage 읽기·쓰기 **레이스 컨디션** 가능. 필요한 경우 `storageEvent` 수신으로 다른 탭의 변경을 반영하거나, 단일 탭 전제로 1단계를 진행한다.

### 7.2 오프라인·로컬 가용성 (Offline-first) 및 하이드레이션 상세

**로컬 우선**으로 동작 가능하도록 하고, 네트워크 복구 후 **재동기화** 시 충돌 없이 병합하는 전략을 준비한다.

| 항목 | 내용 |
|------|------|
| **로컬 캐시 및 AI 전환** | **클라우드 AI 연결이 끊겼을 때** 로컬 모델(Ollama 등)로 **즉시 전환**하는 로직. useAiOrchestrator·aiApi에서 `checkConnection`(또는 요청 실패) 감지 시 **폴백으로 로컬 모델** 호출. 채팅·편집 제안은 로컬 캐시·이미 로드된 컨텍스트로 계속 가능하도록 유지. (6.1 Ollama 끊김 안내와 연동) |
| **오프라인 시 UI** | 네트워크 불가 시 "오프라인 모드" 배너 또는 토스트로 안내. 저장·동기화는 **대기 큐**에 넣고, 복구 후 재시도. 레이아웃·패널·채팅 이력은 localStorage·로컬 캐시로 유지 |
| **하이드레이션 상세 (Yjs·서버 병합)** | **네트워크 복구 후** Yjs 문서가 서버(y-leveldb 등)와 **충돌 없이 병합**되도록 하는 **하이드레이션 상세 전략** 보강. Yjs는 CRDT 기반이므로 이론적으로 오프라인 중 로컬 변경과 서버 상태는 **자동 병합** 가능. 다만 **연결 복구 시점**에 서버 상태를 가져와 로컬 Yjs 문서와 **merge**하는 순서·타임아웃·재시도 정책을 명시. 예: (1) 로컬 Yjs 상태 유지 (2) 서버에서 최신 스냅샷/업데이트 스트림 수신 (3) Yjs merge (4) 충돌 시 로컬 우선 또는 서버 우선 정책 선택 (5) `isHydrated`(서버 동기화 완료) 플래그 갱신. 상세는 Yjs 도입 단계(10.3)에서 정의 |

1단계·2단계에서는 Pinia·localStorage 기반이므로 **로컬 캐시 + 클라우드 끊김 시 로컬 모델 전환**까지 적용. **Yjs 병합**은 3단계 Yjs 적용 시 위 전략을 구체화한다.

### 7.3 창 분리·멀티 윈도우 (준비)

사용자 모니터 환경·작업 스타일에 따라 **탭·패널을 기본 워크스테이션에서 분리하여 별도 창**으로 표시할 수 있도록 설계 방향을 준비한다.

| 항목 | 내용 |
|------|------|
| **전역 상태 (UUID 기반)** | 모든 패널 ID·상태 관리는 **창 종속이 아닌 UUID 기반 전역 상태**로 유지. 어느 창에 패널이 있든 동일 `panelId`로 식별·참조 |
| **Global Focus Stack** | 창 분리 시에도 **Global Focus Stack**을 유지하여 AI가 사용자의 **전체 작업 맥락**을 놓치지 않도록 설계. 오케스트레이터 인식 범위는 창 경계와 무관하게 전역 Focus Stack·패널 JSON·Nexus Map 기준 |
| **하이드레이션 (창 복원)** | 앱 재시작 시 **분리되었던 창들의 위치·내용**을 복원하는 하이드레이션 전략 준비. 각 창의 위치·크기·포함된 탭·패널 ID 목록을 전역 레이아웃 JSON에 저장하고, 복원 시 UUID 기반으로 패널 상태·내용 재구성. 상세는 멀티 윈도우 도입 시 별도 정의 |

---

## 8. 확장 가능 영역

### 8.1 탭 확장

- `aiPanelRegistry`에 `PANEL_LABELS`, `PANEL_ICONS`, `PANEL_COMPONENTS` 추가 (탭 ID 매핑)
- 새 탭 ID 등록 후 `DEFAULT_LEFT`, `DEFAULT_CENTER`, `DEFAULT_RIGHT`에 포함 가능

### 8.2 에이전트 탭 확장

- `aiAgentTabRegistry`의 `AI_AGENT_TABS`에 항목 추가
- skill, task, workcard 외 추가 탭 정의 가능

### 8.3 리스트 가상화 (vue-virtual-scroller)

- **탐색기**: 파일·폴더 목록에 **vue-virtual-scroller** 적용으로 대량 항목 렌더링 성능 개선
- **채널 리스트**: AiLeftNav의 채널·채팅 목록에 **vue-virtual-scroller** 적용

### 8.4 미구현·준비 중

- 에이전트 패널: AiAgentSkillPanel, AiAgentTaskPanel, AiAgentWorkcardPanel (placeholder)
- 파일 메뉴(새 채팅, 새 문서, 열기, 저장 등) 일부 플레이스홀더
- 편집 메뉴(실행 취소, 복사, 붙여넣기 등) 일부 플레이스홀더

### 8.5 AI 페르소나 존재감 시각화 (UX)

문서 내에서 AI가 **단순 텍스트 삽입기가 아닌 '동료'**로 느껴지도록 하는 시각적 장치. EditorPanel 확장 UX(3.1 참조)와 연동한다.

| 항목 | 내용 |
|------|------|
| **고스트 텍스트 (Ghost Text)** | AI가 제안하는 내용을 **사용자가 확정하기 전** 에디터에 **흐릿하게** 미리 보여주는 시각적 규격. 스트리밍 또는 최종 제안 시, 해당 위치에 반투명/회색 등으로 **고스트** 렌더. 사용자가 **수락(Tab·버튼)** 시 실제 내용으로 반영, **거부** 시 제거. Tiptap·Monaco 등 에디터별로 인라인 디코레이션 또는 오버레이 방식 적용 검토 |
| **진행 상태 세분화 (Gutter 상태 아이콘)** | **QLinearProgress**(패널 상단) 외에, **에디터 여백(Gutter)** 에서 AI의 **현재 작업 위치·대상**을 상태 아이콘으로 표시하는 기획. 예: (1) **문서의 어느 부분을 읽고 있는지** — 해당 라인/블록 옆 거터에 "읽는 중" 아이콘 (2) **장비의 어느 수치를 분석 중인지** — 장비 ID·채널과 연결된 라인/영역 옆에 "분석 중" 아이콘. 오케스트레이터·컨텍스트 구성 단계(④)와 연동하여 "현재 참조 중인 영역" 정보를 패널에 전달하고, 거터에 표시. 구현 시 EditorPanel에 optional **gutterHints** 또는 이벤트로 주입 |

### 8.6 배경 컨텍스트·넥서스 맵 (Nexus Map)

Focus Stack을 확장하여, **패널을 닫아도 AI가 참조할 수 있는** **배경 컨텍스트(Background Context)** 레이어를 둔다. 이를 시각화·편집하는 전용 탭을 **문서·소통 시에는 "Nexus Map(넥서스 맵)"** 으로 칭하고, **실제 탭 표시명은 "Nexus"** 로 한다. 사람·AI·IoT가 만나는 **살아있는 신경망** 개념으로 확장·고도화할 수 있도록 네이밍을 둔다.

| 항목 | 내용 |
|------|------|
| **배경 컨텍스트** | 사용자가 패널을 닫아도, **참조 풀**에 남겨 둔 스냅샷은 AI가 계속 참조 가능. "현재 AI가 머릿속에 담고 있는(닫혔지만 참조 중인) 스냅샷 목록"을 Focus Stack 확장 개념으로 관리. 참조 풀 내 **JSON 데이터의 효율적 검색**을 위해 **벡터 임베딩** 및 **유사도 검색** 로직 적용(오케스트레이터 ④ 컨텍스트 구성과 연동). 최대 개수·TTL·우선순위 퇴거 등 정책은 구현 시 정의 |
| **nexus 탭 (표시명 "Nexus")** | 탭 ID **nexus**. **문서와 장비 데이터 간의 관계**를 시각적으로 편집하는 전용 환경. 노드·선(관계) 기반 UI. 상세 UX·라이브러리 선정은 별도 기획 |
| **노드 구분** | 각 패널(UUID/ULID)을 **하나의 노드**로 취급. **열려 있는 패널** = **활성 노드**, **닫혔지만 참조 중인 스냅샷** = **배경 노드**로 시각적 구분. **Nexus** 탭에서 목록 표시·우선순위 정렬 가능 |
| **노드 종류 (실물 vs 논리)** | **실물 노드**: IoT 장비(포함된 엣지 AI 포함). 장비 하나 = 노드 하나. **논리 노드**: 문서(패널/파일), 페르소나(Persona), 스킬(Skill), 테스크(Task). 3자 협업(사람·AI·IoT)을 Nexus 상에서 동일한 맵으로 표현할 때 이 구분으로 시각·연결 규칙 적용 |
| **관계(Line)** | 노드 간 **관계**를 선(Line)으로 표현. **사용자 드래그**로 노드 사이를 연결·삭제하여 **수동으로 관계 생성** — AI에게 "이 두 데이터는 밀접한 연관이 있다"는 강한 힌트. **오케스트레이터에 의한 자동 추론**으로 관계 생성은 추후 단계에서 검토(비용·품질 고려) |
| **연결 규칙 (Zod 검증)** | Nexus에서 노드 간 라인 연결 시 **Zod 스키마**로 유효성 실시간 검증. 예: 페르소나↔스킬·테스크 연결 허용, **스킬↔장비 팩트 노드 직접 연결 금지** 등. 규칙은 우선 제시한 수준으로 구현 후, 검증하면서 점진적으로 발전 |
| **할당(Assign)** | **특정 파일**에 대해 **어떤 모델·페르소나·스킬**이 다루는지 AI가 **자동 제안**하고, 사용자가 **조정** 가능. 할당이 바뀌면 **테스크(Task)** 가 자동 추출·수정되도록 연동. Nexus 상에서 페르소나/스킬 노드를 파일(문서) 노드에 연결하는 UX로 "할당" 표현 |
| **레이어(Layer)** | **데이터 레이어**: 문서와 IoT 장비 간 참조·데이터 흐름. **지능 레이어**: 페르소나·스킬·테스크 간 논리적 연결. 사용자가 레이어별 켜기/끄기, 또는 **특정 노드 클릭 시 연관 지능망만 하이라이트**하여 복잡도 완화. Task는 지능 레이어에 두며, 문서·장비와의 연결로 Data–지능 경계 역할(위 내용 기준) |
| **탐색기와 Nexus 캔버스 분리** | **탐색기(Explorer)** 와 **Nexus 캔버스**는 UI·D&D 영역을 **명확히 분리**. 탐색기에서 파일을 Nexus로 가져오는 동작은 "드롭 존" 등으로 경계를 두어, 혼선 감소·확장성 확보. Nexus 캔버스 내부 D&D(노드 이동·라인 연결)는 전용 그래프 라이브러리 등으로 구현 |
| **데이터 영속성** | 노드 위치·연결 선(edges) 정보는 **JSON**으로 통일. **ai_workspace_layout** 테이블 또는 Pinia store에 저장. **pinia-plugin-persistedstate**로 유지 |
| **오케스트레이터 연동** | 컨텍스트 구성(5.7 ④) 시 Focus Stack·패널 JSON뿐 아니라 **관계망(Nexus Map) 데이터**·**할당 정보**를 함께 읽어 들임. AI는 문서 간 **의존·연관**과 **담당 페르소나/스킬**을 반영한 상태에서 답변 가능 |

트리 구조(장비 계층·문서 논리 트리), 데이터 흐름 시각화(Yjs Awareness 확장) 등은 별도 기획에서 심화한다.

### 8.7 Snapshot 및 시점 관리 (Time-Travel)

현재 **탭·패널 구조** 위에, **특정 시점의 워크스페이스 상태**를 스냅샷으로 저장하고, **인과관계 파악** 및 **AI의 과거·현재 비교 분석**을 가능하게 하는 기능이다.

#### 8.7.1 인과관계 추적 (시계열 데이터 변경 이력)

**인과관계**를 파악하려면 데이터가 **시간에 따라 어떻게 변했는지** 추적할 수 있어야 한다.

| 항목 | 내용 |
|------|------|
| **시계열 추적** | 패널별 **콘텐츠 변경 이력**(편집, 저장, AI 삽입 등)을 **타임스탬프**와 함께 기록. "언제, 어떤 순서로" 변경되었는지 재구성 가능하도록 설계 |
| **변경 단위** | 패널 단위(content), 블록/라인 단위(diff), 이벤트 단위(저장·AI 응답·사용자 편집). 1단계는 **패널 전체 스냅샷** 기준, 이후 단위를 세분화 가능 |
| **인과 체인** | "AI가 A 문서를 수정 → 사용자가 B 코드를 변경 → A 참조 시 B 영향" 등 **변경 간 의존·인과**를 추적. `workspace_snapshots`와 **이벤트 로그**(패널 ID, 이벤트 타입, 이전/이후 상태, timestamp)를 조합해 인과 그래프 구성 |
| **저장소** | `ai_workspace_snapshots` (시점별 워크스페이스 전체), `ai_panel_change_log`(패널별 변경 이벤트, 선택적) 또는 이벤트 소싱 구조. Yjs 도입 시 Yjs 히스토리와 연계 검토 |

#### 8.7.2 워크스페이스 스냅샷 저장

| 항목 | 내용 |
|------|------|
| **저장 대상** | 현재 **탭·패널 구조**(layout·panel_ids·focus_stack) + 각 패널의 **콘텐츠(content)** + **메타데이터**(filePath, tabId, dirty 등). 10.1 패널 JSON 구조와 호환 |
| **저장 트리거** | (1) **수동**: 사용자가 "스냅샷 저장" 버튼 클릭. (2) **자동**: 저장 시점, 마일스톤(예: AI 응답 반영 후), 주기적(예: N분 간격, 선택적) |
| **스냅샷 메타** | `snapshot_id`, `created_at`, `label`(사용자 지정, 예: "리팩터 전"), `trigger`(manual|save|milestone|scheduled) |
| **버전·용량** | 최대 보관 개수·TTL 정책. 오래된 스냅샷 퇴거 시 **인과 이력 연속성** 유지 여부 검토(최소 보관 기간·핵심 마일스톤만 유지 등) |

#### 8.7.3 AI 과거·현재 비교 분석

| 항목 | 내용 |
|------|------|
| **비교 분석 시나리오** | "이 시점과 지금의 차이를 분석해줘", "리팩터 전후 비교", "AI가 수정한 부분만 요약해줘" 등. **과거 스냅샷**과 **현재 상태**를 입력으로 AI에 전달 |
| **컨텍스트 구성** | 오케스트레이터(5.7 ④)에서 **비교 모드** 활성화 시: (1) 선택한 과거 스냅샷 JSON, (2) 현재 워크스페이스 상태 JSON. diff(텍스트/구조)를 전처리해 토큰 절약하거나, 전체를 주입 |
| **스킬·테스크 연동** | "과거·현재 비교"를 **스킬(Skill)** 또는 **테스크(Task)** 로 정의. 사용자가 스냅샷 선택 후 해당 스킬/테스크 실행 → AI가 두 시점을 비교·요약·인과 분석 |
| **UI** | 스냅샷 목록(타임라인·썸네일)·선택 → "이 시점과 비교" 버튼. 비교 결과는 채팅 또는 전용 패널에 표시 |

#### 8.7.4 구현 시 고려 사항

- **저장소**: 1단계는 **localStorage·IndexedDB**에 스냅샷 JSON 저장. 2단계 이후 `ai_workspace_snapshots` 등 서버 테이블로 이전.
- **diff 효율화**: 대용량 콘텐츠의 경우 **텍스트 diff**(예: diff-match-patch)·**구조 diff**(JSON path)만 저장해 용량·토큰 절약.
- **Nexus Map 연동**: 스냅샷에 **Nexus Map 상태**(노드·연결)도 포함하면 "과거 관계망 vs 현재 관계망" 비교 분석 가능.

---

## 9. DB 설계

> **범위**: AI 도메인 한정. localStorage → 서버 이전을 위한 테이블 설계. 1단계는 Pinia + pinia-plugin-persistedstate로 localStorage 기반 완성, 서버 이전은 2단계 또는 별도 Phase로 진행.

### 9.1 기존 테이블 (참조)

| 테이블 | 상태 | 용도 |
|--------|------|------|
| **ai_user_memos** | ✅ 존재 | 채팅 메모 저장 (ai_user_memos-기획.md) |
| **files** | ✅ 존재 | 문서 승격용 |
| **file_references** | ✅ 존재 | domain=ai 파일 참조 |

### 9.2 신규 테이블 (추가 설계)

#### 9.2.1 ai_channels — 채널

```sql
CREATE TABLE ai_channels (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100) DEFAULT 'developer',
  name VARCHAR(255) NOT NULL,
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_sort (sort_order)
);
```

| 필드 | 설명 |
|------|------|
| id | 채널 ID (useAiChannels channel.id) |
| name | 채널명 |
| sort_order | 정렬 순서 |

#### 9.2.2 ai_chats — 채널별 채팅

```sql
CREATE TABLE ai_chats (
  id VARCHAR(100) PRIMARY KEY,
  channel_id VARCHAR(100) NOT NULL,
  title VARCHAR(255) NULL,
  system_instruction TEXT NULL,
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_channel (channel_id),
  FOREIGN KEY (channel_id) REFERENCES ai_channels(id) ON DELETE CASCADE
);
```

| 필드 | 설명 |
|------|------|
| channel_id | ai_channels.id |
| title | 채팅 제목 |
| system_instruction | 채팅별 AI 시스템 지시. **디폴트**(하드코딩) → **설정**·**Nexus Map** 지정 시 오버라이드. 5.7 Safety Sandbox (system_instruction 계층·오버라이드 검증) 참조 |

#### 9.2.3 ai_chat_messages — 채팅 메시지

```sql
CREATE TABLE ai_chat_messages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  chat_id VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_chat (chat_id),
  FOREIGN KEY (chat_id) REFERENCES ai_chats(id) ON DELETE CASCADE
);
```

| 필드 | 설명 |
|------|------|
| role | user | assistant | system |
| content | 메시지 내용 |

#### 9.2.4 ai_workspace_layout — 워크스페이스 레이아웃

```sql
CREATE TABLE ai_workspace_layout (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(100) DEFAULT 'developer',
  layout_name VARCHAR(100) DEFAULT 'default',
  left_panel_ids JSON NULL,
  center_panel_ids JSON NULL,
  right_panel_ids JSON NULL,
  left_visible TINYINT(1) DEFAULT 1,
  center_visible TINYINT(1) DEFAULT 1,
  right_visible TINYINT(1) DEFAULT 1,
  left_size INT DEFAULT 28,
  center_size INT DEFAULT 44,
  right_size INT DEFAULT 28,
  left_active_index INT DEFAULT 0,
  center_active_index INT DEFAULT 0,
  right_active_index INT DEFAULT 0,
  focus_stack JSON NULL,
  last_focused_panel_id VARCHAR(64) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_layout (user_id, layout_name)
);
```

| 필드 | 설명 |
|------|------|
| left/center/right_panel_ids | 스플릿 영역별 탭 ID 목록. 현재는 탭 ID, 향후 패널 ID 확장 가능 |
| focus_stack | 패널 포커스 순서 (AI 지칭 해석용) |
| last_focused_panel_id | 마지막 포커스 패널 ID (UUID/ULID). 복원 시 해당 패널을 활성화하여 작업 지점 유지 |

#### 9.2.5 ai_user_settings — AI 사용자 설정

```sql
CREATE TABLE ai_user_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(100) DEFAULT 'developer',
  model_name VARCHAR(255) NULL,
  show_outline TINYINT(1) DEFAULT 1,
  font_size INT NULL,
  settings_json JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user (user_id)
);
```

| 필드 | 설명 |
|------|------|
| model_name | 선택 모델 |
| settings_json | 기타 설정 (확장) |

#### 9.2.6 2단계: ai_personas, ai_skills, ai_tasks (예정)

| 테이블 | 용도 |
|--------|------|
| **ai_personas** | 페르소나 정의 (역할·성향) |
| **ai_skills** | 스킬 정의 (기능) |
| **ai_tasks** | 테스크 정의 (작업 단위) |

**페르소나·스킬·테스크 JSON 데이터 구조 (뼈대)** — 2단계 구현·DB 설계 시 이 구조를 기준으로 함. Zod로 검증.

```json
{
  "personas": [{
    "id": "persona-01",
    "name": "코드 리뷰어",
    "description": "코드 품질 검토 및 리팩터링 제안",
    "systemPrompt": "You are a senior code reviewer...",
    "avatar": null
  }],
  "skills": [{
    "id": "skill-01",
    "name": "요약",
    "description": "텍스트 요약",
    "promptTemplate": "Summarize the following: {{content}}",
    "inputSchema": {},
    "outputSchema": {}
  }, {
    "id": "skill-iot-log",
    "name": "장비 로그 끌어오기",
    "description": "백그라운드 IoT 로그를 데스크로 끌어와 분석. 5.8 장비 로그 통합 참조",
    "promptTemplate": "Analyze the following device logs: {{logs}}",
    "inputSchema": {},
    "outputSchema": {}
  }],
  "tasks": [{
    "id": "task-01",
    "name": "리팩터링 요청",
    "description": "선택 코드 리팩터링 제안",
    "skillIds": ["skill-01", "skill-02"],
    "personaId": "persona-01"
  }]
}
```

| 필드 | 용도 |
|------|------|
| **personas[].id** | 고유 ID. UUID/ULID 권장 |
| **personas[].name** | 표시명 |
| **personas[].description** | 설명 |
| **personas[].systemPrompt** | AI 시스템 프롬프트. 채팅 시 컨텍스트에 주입 |
| **personas[].avatar** | 아바타 URL (선택) |
| **skills[].id** | 고유 ID |
| **skills[].name** | 스킬 표시명 |
| **skills[].description** | 설명 |
| **skills[].promptTemplate** | 프롬프트 템플릿. `{{변수}}` 치환 |
| **skills[].inputSchema** | 입력 스키마 (Zod). AI 호출 시 검증용 (선택) |
| **skills[].outputSchema** | 출력 스키마 (Zod). AI 응답 검증용 (선택) |
| **tasks[].id** | 고유 ID |
| **tasks[].name** | 테스크 표시명 |
| **tasks[].description** | 설명 |
| **tasks[].skillIds** | 연계 스킬 ID 목록 |
| **tasks[].personaId** | 기본 페르소나 ID (선택) |

채팅 요청 시 **선택된 personaId·skillIds·taskId**를 요청 페이로드에 포함. Vercel AI SDK·Ollama 호출 시 해당 페르소나의 systemPrompt·스킬의 promptTemplate을 조합하여 사용. 세부 조합 로직은 2단계 구현 시 정의.

### 9.3 적용 순서

| Phase | 테이블 | 비고 |
|-------|--------|------|
| **1단계** | — | Pinia + pinia-plugin-persistedstate로 localStorage 기반 |
| **2단계** | ai_channels, ai_chats, ai_chat_messages, ai_workspace_layout, ai_user_settings | useAiChannels·useAiSplitLayout·useAiSettings → API 전환 |
| **2단계** | ai_personas, ai_skills, ai_tasks | 페르소나·스킬·테스크 시스템 |
| **별도 Phase** | ai_workspace_snapshots, ai_panel_change_log(선택) | Snapshot·시점 관리(Time-Travel). **8.7 참조** |

---

## 10. 단계별 구현 로드맵

### 10.1 1단계: 탭·패널 독립화 및 레이아웃 시스템 구축 (현재 단계)

| 항목 | 내용 |
|------|------|
| **추상화** | 모든 에디터를 **EditorPanel** 규격(3.1 Props/Events)으로 규격화. **탭**별로 **여러 패널(파일 인스턴스)** 동시 오픈 구조 지원 |
| **상태 관리** | **Pinia**를 사용하여 탭 구성, **열린 패널 목록**(탭별), 활성 패널 ID, 스플릿 뷰 위치 정보 저장. **패널 Z-index·Focus Stack** 정보도 함께 관리. **pinia-plugin-persistedstate**로 store 영속화 구현 (localStorage 자동 저장) |
| **UI 완성도** | Quasar 레이아웃 내에서 에디터가 깨지지 않고 **리사이징(Resize)**되는지, 탭·패널 간 파일 로드 및 저장이 단일 사용자 환경에서 완벽한지 검증 |
| **리스트 가상화** | **vue-virtual-scroller**를 탐색기(파일 목록)·채널 리스트(AiLeftNav)에 적용하여 긴 목록 렌더링 성능 향상 |
| **패널 데이터 구조(JSON)** | AI가 패널을 **이해**하고 **조작**하기 위해 1단계에서 미리 준비. Pinia 상태를 **JSON 스냅샷**으로 변환하여 2단계 컨텍스트 주입·편집 제안에 활용. AI 협업을 위한 **패널 스냅샷** 세분화 |

**권장 구현 순서**: ① EditorPanel 규격(3.1) 구현 → ② Pinia 레이아웃·열린 패널 목록 → ③ 패널 생명주기(5.4) → ④ 동기화 브릿지(5.5). **검증**: EditorPanel Props/Events 준수, 열기/닫기/Dirty 흐름, 동기화 브릿지 전파 동작.

**1단계에서 준비할 패널용 JSON 구조 (예시)**

```json
{
  "layout": { "leftPanelIds": [], "centerPanelIds": [], "rightPanelIds": [], "activePanelId": "" },
  "panels": [{
    "id": "01HXYZ...",
    "tabId": "code",
    "filePath": "/path/to/file.ts",
    "label": "file.ts",
    "focusOrder": 0,
    "dirty": false,
    "selectionRange": { "startLine": 10, "startColumn": 0, "endLine": 12, "endColumn": 5 }
  }],
  "focusStack": []
}
```

| 필드 | 용도 |
|------|------|
| `layout` | 스플릿 영역별 탭 구성, 활성 패널 ID |
| `panels` | 열린 패널 목록. `id`는 UUID/ULID로 고유 식별. `tabId`, `filePath`, `label`, `focusOrder` 포함 |
| `panels[].dirty` | 저장되지 않은 변경사항 여부. AI가 "미저장 변경" 고려 시 활용 |
| `panels[].selectionRange` | **AI 협업용**. 현재 선택 영역. 텍스트/코드: `{ startLine, startColumn, endLine, endColumn }`. 문서(Tiptap): `{ startOffset, endOffset }` 등. "이 부분을 수정해줘" 지시 시 해석에 사용 |
| `focusStack` | 최근 포커스 순서 (AI 지칭 "방금 수정한 그 코드" 해석용) |

2단계에서 이 구조를 AI 컨텍스트에 포함해 패널 **이해**·**조작** 지시를 처리한다. 스키마는 Zod로 검증.

### 10.2 2단계: AI(Ollama) 컨텍스트 협업 엔진 연동

> **전제**: 1단계 탭·패널 독립화 및 Pinia 기반 레이아웃 시스템 완료 후 진행.

| 항목 | 내용 |
|------|------|
| **오케스트레이터(useAiOrchestrator)** | **멀티 에이전트 시스템**의 핵심. 사용자 입력 → 입력 분석·모델 라우팅·컨텍스트 구성·호출·Zod 검증·결과 반영. 5.7 참조. 로컬 다중 모델(코드/문서/이미지 등)을 다루어 **멀티모달** 대응의 기준 |
| **컨텍스트 주입** | 오케스트레이터가 **1단계 패널 JSON**·Focus Stack·선택 영역을 조합해 컨텍스트 구성. **layout·panels·focusStack** 로 AI가 패널을 **이해**하고, "방금 수정한 코드" 등 **지칭 지시(resolution)** 정확도 향상 |
| **편집 제안** | AI가 생성한 내용을 **패널 JSON의 id/tabId**로 특정 패널에 반영. 1단계 패널 데이터 구조 기반으로 패널 **조작** (열기·포커스·내용 반영) |
| **미디어 확장** | 이미지·사운드·영상 탭의 패널 메타데이터를 AI가 분석·**수정 제안**. 필요 시 LLaVA/Whisper 등 **미디어→텍스트** 변환 후 오케스트레이터 파이프라인에 투입 |
| **JSON 데이터 통일** | 로컬 모델·엣지 디바이스 환경에서 **똑똑한 기능**을 위해 AI 입력·출력·상태를 **JSON**으로 통일 |
| **응답 스키마 검증 (Zod)** | Ollama·클라우드 모델 등 AI 응답(JSON)이 **요구하는 스키마와 일치하는지 Zod로 검증**. 체크 필수 항목. 오케스트레이터 ⑥ 단계 |
| **페르소나·스킬·테스크 시스템** | **페르소나**(AI 역할·성향), **스킬**(기능), **테스크**(작업 단위)를 도메인·프로젝트별로 추가·관리·적용. JSON 구조 9.2.6 참조. 오케스트레이터 컨텍스트에 병합. **Vercel AI SDK**로 모델 교체 시에도 **일관성 유지** |

### 10.3 3단계: Yjs 기반 실시간 동기화 및 영속성 강화

> **적용 시점**: Yjs는 **에디터 기본 기능이 Pinia 기반으로 완성된 후** 이어서 추가 적용한다. **도메인 전역에서의 사용 기획**을 구체화한 뒤 진행한다.

| 항목 | 내용 |
|------|------|
| **실시간성 도입** | **Vercel AI SDK**(이미 적용)에 **Yjs**를 추가 적용. Tiptap(**y-prosemirror**)·Monaco(**y-monaco**) 바인딩으로 AI 입력을 실시간 시각화 |
| **상태 관리** | **Pinia**와 **JS**를 적절히 혼합하여 탭·패널·Yjs 문서 상태 관리 |
| **Awareness(인식)** | 사용자 커서와 AI의 작업 위치를 **패널** 상에 표시하여 협업 가시성 향상 |
| **서버 영속성** | Node.js 서버에 **y-leveldb** 등을 연동하여 브라우저 새로고침 후에도 **편집 이력과 패널 상태 유지** |
| **IoT 협업** | **제3의 협업자**로 IoT 데이터 수신 시 데이터 이원화(팩트 vs 엣지 AI 인사이트)·실시간 부하 관리(스로틀·중요 변화 시 커밋). **5.8 참조** |
| **오프라인·재동기화** | 네트워크 복구 후 Yjs·서버 병합 시 **하이드레이션 상세 전략** 적용. **7.2 참조** |

#### Yjs 기반 권한 및 소유권 (Permissions) — 준비 사항

Yjs 적용은 다음 단계 작업이므로, 여기서는 **준비 수준**의 기획만 정리한다.

| 항목 | 내용 |
|------|------|
| **노드별 잠금 (Node-level Locking)** | AI가 **특정 섹션을 작성 중**일 때 사용자가 동일 구간을 동시에 수정하면 충돌·혼란이 발생할 수 있음. **Yjs Awareness** 기능을 확장하여 **"현재 편집 중인 노드 점유 상태"**를 표현·시각화하는 기획을 보강. 예: 특정 블록/노드를 AI가 점유 중이면 해당 영역을 잠금(또는 읽기 전용) 표시하고, 사용자에게 "AI 편집 구간"으로 안내. 구체 구현은 Yjs 도입 단계에서 진행 |
| **장비 전용 영역 (Device-only Region)** | 문서 내에서 **장비 데이터만 기록**될 수 있는 영역 정의. **"Read-only for Human, Write-only for Device"** — 사람(사용자)은 해당 영역을 **읽기 전용**, 장비(IoT·엣지)만 **쓰기** 가능. 센서 값·계측치 등이 이 영역에만 쓰여지고, 사용자는 수정하지 않고 조회만 함. Tiptap 노드/블록 또는 Monaco 주석·전용 블록 등으로 영역을 구분하는 방식 검토. 상세 스키마·UI는 Yjs·에디터 연동 시 정의 |

---

## 11. 기술 스택 요약

| 영역 | 기술 |
|------|------|
| **Frontend** | Vue 3, Quasar, Pinia, **pinia-plugin-persistedstate** (store 영속화), **mitt** (이벤트 버스), **vue-virtual-scroller** (탐색기·채널 리스트 가상화) |
| **Editor** | Tiptap (Rich Text), Monaco (Code), Custom Media Editors |
| **AI** | **Vercel AI SDK** (이미 적용): 로컬(Ollama)·클라우드 모델 유연 교체, 페르소나·스킬·테스크 일관성 유지 |
| **오케스트레이터** | **useAiOrchestrator**: 입력 분석·규칙/모델 기반 라우팅·컨텍스트 구성(Focus Stack+패널 JSON)·모델 호출·Zod 검증·**시뮬레이션 검증(코드)**·결과 반영. **멀티 에이전트·멀티모달** 대응 (5.7 참조) |
| **AI 안전성 (Safety Sandbox)** | 코드는 가상 장비에서 검증 후 반영. 장비 제어 수치는 **인간 최종 승인** 후 반영. **system_instruction 계층**(디폴트→설정·Nexus Map 오버라이드)·**오버라이드 시 검증·안전 레이어**. **5.7 참조** |
| **컨텍스트 관리** | Pinia(Focus Stack)·패널 JSON·selectionRange·**Nexus Map(관계망)**·**벡터 임베딩·유사도 검색**(참조 풀 JSON 효율적 검색)·Zod·JSON 직렬화. 오케스트레이터가 단일 진입점으로 조립. **신선도(Freshness)**·컨텍스트 가중치(실시간 경고 우선). **장비 로그 통합** 스킬(5.7·5.8 참조). **8.6 참조** |
| **데이터** | **JSON** 통일 (패널·레이아웃·AI 입출력·페르소나·스킬·테스크). **Zod**로 AI 응답(JSON) 스키마 검증 |
| **Real-time** | **Yjs** (Pinia 기반 에디터 기본 기능 완성·도메인 전역 사용 기획 구체화 후 적용). **권한·소유권** 준비: 노드별 잠금(Awareness 확장), 장비 전용 영역(Read-only Human / Write-only Device). **10.3 참조** |
| **상태 관리** | Pinia + **pinia-plugin-persistedstate**(store 영속화 보조). **mitt**는 요청·트리거(이벤트), Pinia는 지속 상태 |
| **오프라인·로컬 가용성** | 클라우드 AI 끊김 시 로컬 모델 즉시 전환. 네트워크 복구 후 Yjs 서버 병합(하이드레이션 상세). **7.2 참조** |
| **Backend** | Node.js |
| **에디터 동기화 브릿지** | 동일 `filePath`의 다중 패널 간 편집 내용 전파. mitt `ai:editor-content-sync` + debounce/포커스아웃 트리거. 전체 교체, Last-Write-Wins. **동작 방식 5.5 참조**. **Yjs 도입 전** 임시 방편 |
| **QLinearProgress** | EditorPanel 공통 규격. `loading` Prop true 시 패널 상단에 진행 상태 표시. **조건·대상 3.1 참조** |
| **AI 존재감 UX** | 고스트 텍스트(확정 전 미리보기)·거터 상태 아이콘(읽는 중/분석 중). **8.5 참조** |
| **Nexus Map** | 문서상 "Nexus Map(넥서스 맵)", 탭 표시명 "Nexus"(탭 ID: nexus). **실물 노드**(장비)·**논리 노드**(문서·페르소나·스킬·테스크). **레이어**(Data/지능)·**할당**(파일↔모델/페르소나/스킬, AI 제안·사람 조정·테스크 자동 반영). **연결 규칙** Zod 검증. **탐색기·Nexus 캔버스 분리**. **8.6 참조** |
| **IoT 협업** | 제3의 협업자. 데이터 이원화(팩트/엣지 AI 인사이트)·스로틀·중요 변화 시 커밋. **5.8 참조** |
| **창 분리·멀티 윈도우** | 탭·패널 분리 가능. UUID 전역 상태·**Global Focus Stack**·창 복원 하이드레이션 준비. **7.3 참조** |

---

## 12. 향후 기획 방향 (참고)

> **역할**: 10장 로드맵은 단계별 **구현 범위**, 본 절은 **별도 문서·관련 기획** 링크 위주. 세부 순서·우선순위는 별도 정리.

**관련 문서**: [NEXA-STACK-01] 기술 스택·용어(Workspace·Project 기준), [NEXA-AI-09] 웹서치·프로젝트·탐색기, [NEXA-AI-03] 웹 탐색기 문서폴더 연동, ai_user_memos-기획.md, 탐색기-미디어탭-동기화-기획.md, ai-도메인-3영역-스플릿-레이아웃-기획.md 등

1. **메모 → 문서 승격**: ai_user_memos → files 정식 저장 (ai_user_memos-기획.md)
2. **탐색기·미디어 탭 동기화**: 좌측 미디어 탭과 탐색기 연동 (탐색기-미디어탭-동기화-기획.md)
3. **페르소나·스킬·테스크 시스템**: 도메인·프로젝트별 다양한 페르소나·스킬·테스크 추가·관리·적용 (에이전트 탭 연동)
4. **오케스트레이터·멀티 에이전트 정교화**: 여러 로컬 모델 실험·검토를 통해 라우팅 규칙·컨텍스트 전략 구체화 (5.7 기준)
5. **IoT 협업·실시간 부하 관리**: IoT 데이터 이원화(팩트/인사이트)·스로틀·중요 변화 시 커밋 정책을 시나리오 기반으로 심화 (5.8 참조)
6. **Nexus Map(nexus 탭) 상세 기획**: 실물/논리 노드·레이어(Data/지능)·할당·Zod 연결 규칙·탐색기·Nexus 캔버스 분리·노드/선 UI·관계망 JSON 스키마·트리/흐름 시각화 등 별도 기획서로 심화 (8.6 기준)
7. **Snapshot 및 시점 관리 (Time-Travel)**: 인과관계 추적(시계열 변경 이력)·워크스페이스 스냅샷 저장·AI 과거·현재 비교 분석. **8.7 참조**
8. **창 분리·멀티 윈도우**: 모니터·작업 스타일에 따른 탭·패널 분리. UUID 전역 상태·Global Focus Stack·창 복원 하이드레이션 (7.3 참조)
9. **Zod 응답 검증**: AI 응답(JSON)이 요구 스키마와 일치하는지 **Zod**로 검증 (체크 필수)
9. **Yjs 적용**: Pinia 기반 에디터 기본 기능 완성 후, 도메인 전역 사용 기획 구체화를 거쳐 추가 적용
10. **에디터 패널 전역 엔진화**: 안정화 후 에디터 패널을 전역 엔진으로 격상, **모든 도메인에서 재사용 가능**하도록 구성
11. **드래그 앤 드롭**: 탭·패널 순서 사용자 재배치
12. **mitt 이벤트 버스 전환**: useAiInsertRequest·useAiExplorerSelection·useAiMediaTab 콜백을 mitt 기반으로 전환
13. **pinia-plugin-persistedstate 적용**: Pinia store를 localStorage에 자동 영속화하여 기존 수동 저장 로직을 대체·보조
14. **localStorage → 서버 이전**: ai_channels, ai_chats, ai_chat_messages, ai_workspace_layout, ai_user_settings 테이블 적용 (9. DB 설계)
15. **문서 관리 필터 (디렉토리별 1depth 서브폴더)**: 현재 디렉토리 필터(nexa-docs / platform-docs) 선택 시, 해당 디렉토리 내 **1차 하위 폴더(Platform, 공통, Desktop 등)** 기준 필터 버튼 추가 표시. 구현 난이도 낮음. 실제 사용성 검토 후 필요 시 추가.

> 세부 내용은 상황에 따라 별도 문서로 분리·심화한다.

---

## 13. 정리

| 항목 | 내용 |
|------|------|
| **용어** | [NEXA-STACK-01] §8.0 기준: **Workspace**(도메인별 추상적 작업공간, UI 개념·DB 없음), **Project**(최상위 작업단위, DB 테이블 유지). **탭**(Dialogue/Narrative/Logic/Media/Sense/Nexus/Explorer, §1.4·§1.5), **패널**(탭 내 파일 1개 = 패널 1개), 배치 관리(QSplitter+Pinia). **탐색기**: 파일탐색기·프로젝트탐색기 구분(§1.7). **Sense** 탭은 읽기 전용 멀티 뷰어(1.6). **Nexus** 탭 = Nexus Map(8.6) |
| **레이아웃** | 프레임(left/content/right) + 워크스페이스 내 3영역 스플릿 |
| **이벤트 전달** | **mitt** 이벤트 버스 (`ai:insert-request`, `ai:inject-to-chat` 등). 기존 useAiInsertRequest·useAiExplorerSelection·useAiMediaTab 콜백을 mitt로 전환·보완 |
| **상태 공유** | useAiChannels, useAiSplitLayout, useAiSettings 모듈 레벨 ref → **1단계에서 Pinia 전환 검토** |
| **설정 지속성** | **pinia-plugin-persistedstate**로 Pinia store를 localStorage에 영속화. 기존 useAiSplitLayout·useAiChannels·useAiSettings는 Pinia 전환 시 통합 |
| **오프라인·로컬** | 클라우드 끊김 시 로컬 모델 전환. 네트워크 복구 후 Yjs 병합(하이드레이션 상세). **7.2 참조** |
| **창 분리·멀티 윈도우** | 탭·패널 분리 가능. UUID 전역 상태·Global Focus Stack·창 복원 하이드레이션 준비. **7.3 참조** |
| **로드맵** | 1단계 탭·패널 독립화(Pinia·패널 JSON 구조 준비) → 2단계 AI 컨텍스트 협업(**오케스트레이터**·패널 이해·조작) → 3단계 Yjs |
| **오케스트레이터** | useAiOrchestrator. 멀티 에이전트·멀티모달 대응. 입력 분석→라우팅→컨텍스트(**신선도·가중치**)→호출→Zod 검증→시뮬레이션 검증→결과 반영. **장비 로그 통합** 스킬. **5.7·5.8 참조** |
| **AI 안전성** | 시뮬레이션 검증·인간 최종 승인·**system_instruction 계층**(디폴트→설정·Nexus Map)·**오버라이드 시 검증·안전**. **5.7 참조** |
| **IoT 협업** | 제3의 협업자. 데이터 이원화(팩트 vs 엣지 AI 인사이트)·스로틀·중요 변화 시 커밋. **5.8 참조** |
| **오류/예외** | Zod 검증 실패→원문 표시·재시도. Ollama 끊김→배너·재시도. 파일 로드 실패→에러 UI·재시도. **6.1 참조** |
| **DB** | ai_user_memos(존재), ai_channels·ai_chats·ai_chat_messages·ai_workspace_layout·ai_user_settings (2단계 또는 별도 Phase) |
| **기술** | Vercel AI SDK, **mitt**(이벤트 버스), **Zod**(AI 응답 JSON 스키마 검증), Yjs(추가 예정), Pinia·JS 혼합 |
| **장기** | 에디터 패널 → 전역 엔진 격상, 모든 도메인 재사용 / JSON 통일·페르소나·스킬·테스크 시스템 |
| **Yjs 권한(준비)** | 노드별 잠금(Awareness 확장)·장비 전용 영역(Read-only Human, Write-only Device). **10.3 참조** |
| **AI 존재감 UX** | 고스트 텍스트·거터 상태 아이콘(읽는 중/분석 중). **8.5 참조** |
| **Nexus Map** | 실물/논리 노드·레이어(Data/지능)·할당(파일↔페르소나/스킬, AI 제안·사람 조정·테스크 자동 반영)·Zod 연결 검증·탐색기·Nexus 캔버스 분리. **8.6 참조** |
| **Snapshot·시점 관리** | 인과관계 추적(시계열 변경 이력)·워크스페이스 스냅샷 저장·AI 과거·현재 비교 분석. **8.7 참조** |

본 기획은 **이벤트(mitt) - 상태(Pinia) - 검증(Zod) - 영속성(PersistedState)**이라는 현대적인 웹 앱의 4대 요소를 모두 갖추고 있으며, 특히 **Focus Stack**은 단순한 에디터를 넘어 **지능형 워크스페이스**로 가는 핵심 차별점이다. 이 기획서는 현재 AI 도메인 구조를 기반으로 하며, 협업형 멀티 에디터 플랫폼의 기초 아키텍처와 **용어 정의**를 확정한다. 세부 기능·API·UI 상세는 별도 기획 문서에서 상황에 따라 분리·심화한다.
