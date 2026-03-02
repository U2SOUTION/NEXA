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

| 용어 | 영문 | 정의 |
|------|------|------|
| **워크스페이스** | Workspace | 특정 작업 목적에 따라 **여러 편집 도구와 AI 채팅이 배치되는 최상위 컨테이너**. 현재 AI 도메인의 content 영역(AiContent → AiSplitLayout)이 이에 해당한다. |
| **탭** | Tab | 에디터 유형을 구분하는 단위. `editor`, `code`, `image`, `audio`, `video`, `viewer`, `chat`, `explorer` 등이 각각 **탭**에 해당한다. 채팅·탐색기도 스플릿 영역을 넘나들 수 있는 탭으로 간주한다. 한 탭에서 여러 파일(또는 대화·폴더 등)을 동시에 열 수 있다. |
| **패널** | Panel | **탭 내에서 열린 파일 1개당 1개의 패널**. 실제 파일이 로드되어 편집되는 독립적인 단위 창. 예: 코드 탭에서 file1.ts, file2.ts를 열면 패널 2개. 패널 인스턴스는 **UUID 또는 ULID**로 고유 식별하여 탭·세션·다중 오픈 시 **ID 충돌**을 방지한다. |
| **배치 관리** | Layout Management | Quasar의 **QSplitter**와 **Pinia**를 사용하여 탭·패널의 **레이아웃 상태**(위치, 비율, 표시/숨김, 열린 패널 목록, **Z-index·Focus Stack**)를 관리하는 체계. Focus Stack은 AI 지칭("방금 수정한 그 코드" 등) 정확도 향상에 활용. |

### 1.2 계층 구조

```
워크스페이스
  └─ 탭 (editor | code | image | audio | video | viewer | chat | explorer)  ← 스플릿 영역 넘나들 수 있음
       ├─ 패널 (파일 A)
       ├─ 패널 (파일 B)
       └─ 패널 (파일 C)
```

- **1탭 : N패널** 관계. 여러 탭에서 여러 종류의 파일을 열 수 있고, **한 탭에 같은 종류의 파일 여러 개**를 열면 각 파일이 패널로 표시된다.

### 1.3 용어 구분 (혼동 방지)

| 구분 | Quasar/기존 용어 | 본 문서 용어 | 비고 |
|------|------------------|-------------|------|
| 최상위 | Tab, Drawer | **워크스페이스** | 탭·패널을 담는 컨테이너 |
| 에디터 유형 | q-tab, Tab | **탭** | editor, code, image, audio, video, viewer, chat, explorer (스플릿 넘나들 수 있음) |
| 파일 인스턴스 | — | **패널** | 탭 내에서 열린 파일 1개 = 패널 1개 |
| UI 전환 | q-tabs / q-tab-panels | 탭 전환 / 패널 전환 | 탭: 에디터 유형 선택, 패널: 열린 파일 간 전환 |

### 1.4 탭 유형별 명칭

| 탭 | 탭 ID | 에디터 | 설명 |
|----|-------|--------|------|
| 문서 탭 | editor | Tiptap | 리치 텍스트 편집. 문서 탭 내에서 여러 파일(.md 등) 동시 오픈 시 패널 N개. |
| 코드 탭 | code | Monaco | 코드 편집. 코드 탭 내에서 여러 파일(.ts, .vue 등) 동시 오픈 시 패널 N개. |
| 이미지 탭 | image | Custom | 이미지 편집·메타데이터. 패널별로 이미지 파일 1개. |
| 오디오 탭 | audio | Custom | 음원 편집·메타데이터. 패널별로 오디오 파일 1개. |
| 영상 탭 | video | Custom | 영상 편집·메타데이터. 패널별로 영상 파일 1개. |
| 뷰어 탭 | viewer | UniversalViewer | **모든 에디터 유형(문서·코드·이미지·오디오·영상)에 대응하는 멀티 뷰어**. 패널당 파일 1개. 상세 1.5 참조. |
| 채팅 탭 | chat | — | AI 채팅. 스플릿 영역(좌/중앙/우)을 넘나들 수 있는 탭. 협업 UI. |
| 탐색기 탭 | explorer | — | 파일 탐색. 스플릿 영역을 넘나들 수 있는 탭. 선택 파일 → 채팅·에디터 주입. |

### 1.5 뷰어 탭 상세 정의 (멀티 뷰어)

뷰어 탭(`viewer`)은 **문서·코드·이미지·오디오·영상** 등 여러 유형의 파일을 **읽기 전용**으로 표시하는 **멀티 뷰어**이다. 단일 탭 내에서 유형별 뷰 컴포넌트를 전환하여 표시한다.

| 항목 | 정의 |
|------|------|
| **읽기 전용** | 편집 기능 없음. `EditorPanel` 규격의 `readonly: true` 고정. 저장·Dirty 처리 불필요 |
| **시뮬레이션** | 각 에디터 유형(editor/code/image/audio/video)의 **렌더 결과를 시뮬레이션**하여 표시. 실제 에디터 컴포넌트를 읽기 모드로 재사용하거나, 전용 뷰 컴포넌트로 표시 |
| **전환 방법** | 파일 확장자 또는 MIME 타입으로 **자동 감지** → 해당 뷰(문서/코드/이미지/오디오/영상) 렌더. 또는 사용자가 수동으로 뷰 유형 선택(드롭다운 등). 1단계에서는 자동 감지 우선 |
| **미지원 포맷** | 지원하지 않는 확장자/MIME일 경우 **"미지원 형식" 안내** 표시. 다운로드 링크 제공. 필요 시 "해당 에디터 탭에서 열기" 버튼으로 editor/code/image 등 전환 유도 |

**멀티 뷰어의 복잡성**: 유형별 렌더 규칙·전환 UX·에러 처리 등이 조합되어 복잡해질 수 있음. 1단계에서는 **지원 포맷을 문서·코드·이미지·오디오·영상으로 제한**하고, 단순화하여 구축하는 것을 권장한다.

**뷰어 확장 로드맵**: 현재 **구체적 확장 로드맵은 미정**이다. PDF, 3D, 스프레드시트 등 추가 뷰어 유형은 별도 검토가 필요하며, **다른 도메인**(예: 문서 도메인, 미디어 라이브러리)과 연계될 경우 공통 뷰어 컴포넌트·MIME 매핑 등을 전역으로 분리할 필요가 있다. 향후 도메인 전역 뷰어 정책과 연동하여 정의한다.

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

Tiptap, Monaco, 이미지·오디오·영상 에디터 등 **모든 에디터 패널**이 공통으로 따르는 최소 규격. 상세는 구현 시 확장한다.

#### Props

| Prop | 타입 | 필수 | 용도 |
|------|------|------|------|
| `panelId` | `string` | O | 패널 고유 ID (UUID/ULID). Pinia·Focus Stack·동기화 브릿지 식별용 |
| `filePath` | `string \| null` | O | 파일 경로. null이면 미저장 새 파일 |
| `tabId` | `string` | O | `editor` \| `code` \| `image` \| `audio` \| `video` |
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
| system_instruction | Instruction (useAiChannels) |

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
| left/center/right_panel_ids | 스플릿 영역별 탭 ID 목록 |
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
    "selectionRange": { "startLine": 10, "startColumn": 0, "endLine": 12, "endColumn": 5 }
  }],
  "focusStack": []
}
```

| 필드 | 용도 |
|------|------|
| `layout` | 스플릿 영역별 탭 구성, 활성 패널 ID |
| `panels` | 열린 패널 목록. `id`는 UUID/ULID로 고유 식별. `tabId`, `filePath`, `label`, `focusOrder` 포함 |
| `panels[].selectionRange` | **AI 협업용**. 현재 선택 영역. 텍스트/코드: `{ startLine, startColumn, endLine, endColumn }`. 문서(Tiptap): `{ startOffset, endOffset }` 등. "이 부분을 수정해줘" 지시 시 해석에 사용 |
| `focusStack` | 최근 포커스 순서 (AI 지칭 "방금 수정한 그 코드" 해석용) |

2단계에서 이 구조를 AI 컨텍스트에 포함해 패널 **이해**·**조작** 지시를 처리한다. 스키마는 Zod로 검증.

### 10.2 2단계: AI(Ollama) 컨텍스트 협업 엔진 연동

> **전제**: 1단계 탭·패널 독립화 및 Pinia 기반 레이아웃 시스템 완료 후 진행.

| 항목 | 내용 |
|------|------|
| **컨텍스트 주입** | AI에게 질문할 때 **1단계에서 준비한 패널 JSON**을 컨텍스트에 포함. **layout·panels·focusStack** 구조로 AI가 패널을 **이해**하고, "방금 수정한 코드" 등 **지칭 지시(resolution)** 의 정확도 향상 |
| **편집 제안** | AI가 생성한 내용을 **패널 JSON의 id/tabId**로 특정 패널에 반영. 1단계 패널 데이터 구조 기반으로 패널 **조작** (열기·포커스·내용 반영) |
| **미디어 확장** | 이미지·사운드·영상 탭의 패널 메타데이터를 AI가 분석하고 **수정 제안**을 할 수 있는 구조 구축 |
| **JSON 데이터 통일** | 로컬 모델·엣지 디바이스 환경에서 **똑똑한 기능**을 위해 AI 입력·출력·상태를 **JSON**으로 통일 |
| **응답 스키마 검증 (Zod)** | Ollama·클라우드 모델 등 AI 응답(JSON)이 **요구하는 스키마와 일치하는지 Zod로 검증**. 체크 필수 항목 |
| **페르소나·스킬·테스크 시스템** | **페르소나**(AI 역할·성향), **스킬**(기능), **테스크**(작업 단위)를 도메인·프로젝트별로 추가·관리·적용. JSON 구조 9.2.6 참조. **Vercel AI SDK**로 모델(Ollama·클라우드)을 교체해도 선택한 페르소나·스킬·테스크의 **일관성 유지** |

### 10.3 3단계: Yjs 기반 실시간 동기화 및 영속성 강화

> **적용 시점**: Yjs는 **에디터 기본 기능이 Pinia 기반으로 완성된 후** 이어서 추가 적용한다. **도메인 전역에서의 사용 기획**을 구체화한 뒤 진행한다.

| 항목 | 내용 |
|------|------|
| **실시간성 도입** | **Vercel AI SDK**(이미 적용)에 **Yjs**를 추가 적용. Tiptap(**y-prosemirror**)·Monaco(**y-monaco**) 바인딩으로 AI 입력을 실시간 시각화 |
| **상태 관리** | **Pinia**와 **JS**를 적절히 혼합하여 탭·패널·Yjs 문서 상태 관리 |
| **Awareness(인식)** | 사용자 커서와 AI의 작업 위치를 **패널** 상에 표시하여 협업 가시성 향상 |
| **서버 영속성** | Node.js 서버에 **y-leveldb** 등을 연동하여 브라우저 새로고침 후에도 **편집 이력과 패널 상태 유지** |

---

## 11. 기술 스택 요약

| 영역 | 기술 |
|------|------|
| **Frontend** | Vue 3, Quasar, Pinia, **pinia-plugin-persistedstate** (store 영속화), **mitt** (이벤트 버스), **vue-virtual-scroller** (탐색기·채널 리스트 가상화) |
| **Editor** | Tiptap (Rich Text), Monaco (Code), Custom Media Editors |
| **AI** | **Vercel AI SDK** (이미 적용): 로컬(Ollama)·클라우드 모델 유연 교체, 페르소나·스킬·테스크 일관성 유지 |
| **데이터** | **JSON** 통일 (패널·레이아웃·AI 입출력·페르소나·스킬·테스크). **Zod**로 AI 응답(JSON) 스키마 검증 |
| **Real-time** | **Yjs** (Pinia 기반 에디터 기본 기능 완성·도메인 전역 사용 기획 구체화 후 적용) |
| **상태 관리** | Pinia + **pinia-plugin-persistedstate**(store 영속화 보조). **mitt**는 요청·트리거(이벤트), Pinia는 지속 상태 |
| **Backend** | Node.js |
| **에디터 동기화 브릿지** | 동일 `filePath`의 다중 패널 간 편집 내용 전파. mitt `ai:editor-content-sync` + debounce/포커스아웃 트리거. 전체 교체, Last-Write-Wins. **동작 방식 5.5 참조**. **Yjs 도입 전** 임시 방편 |
| **QLinearProgress** | EditorPanel 공통 규격. `loading` Prop true 시 패널 상단에 진행 상태 표시. **조건·대상 3.1 참조** |

---

## 12. 향후 기획 방향 (참고)

**관련 문서**: ai_user_memos-기획.md, 탐색기-미디어탭-동기화-기획.md, ai-도메인-3영역-스플릿-레이아웃-기획.md 등

1. **메모 → 문서 승격**: ai_user_memos → files 정식 저장 (ai_user_memos-기획.md)
2. **탐색기·미디어 탭 동기화**: 좌측 미디어 탭과 탐색기 연동 (탐색기-미디어탭-동기화-기획.md)
3. **페르소나·스킬·테스크 시스템**: 도메인·프로젝트별 다양한 페르소나·스킬·테스크 추가·관리·적용 (에이전트 탭 연동)
4. **Zod 응답 검증**: AI 응답(JSON)이 요구 스키마와 일치하는지 **Zod**로 검증 (체크 필수)
5. **Yjs 적용**: Pinia 기반 에디터 기본 기능 완성 후, 도메인 전역 사용 기획 구체화를 거쳐 추가 적용
6. **에디터 패널 전역 엔진화**: 안정화 후 에디터 패널을 전역 엔진으로 격상, **모든 도메인에서 재사용 가능**하도록 구성
7. **드래그 앤 드롭**: 탭·패널 순서 사용자 재배치
8. **mitt 이벤트 버스 전환**: useAiInsertRequest·useAiExplorerSelection·useAiMediaTab 콜백을 mitt 기반으로 전환
9. **pinia-plugin-persistedstate 적용**: Pinia store를 localStorage에 자동 영속화하여 기존 수동 저장 로직을 대체·보조
10. **localStorage → 서버 이전**: ai_channels, ai_chats, ai_chat_messages, ai_workspace_layout, ai_user_settings 테이블 적용 (9. DB 설계)

> 세부 내용은 상황에 따라 별도 문서로 분리·심화한다.

---

## 13. 정리

| 항목 | 내용 |
|------|------|
| **용어** | 워크스페이스(최상위), **탭**(editor/code/image/audio/video/viewer/chat/explorer, 스플릿 넘나들 수 있음), **패널**(탭 내 파일 1개 = 패널 1개), 배치 관리(QSplitter+Pinia). **뷰어 탭**은 읽기 전용 멀티 뷰어(1.5 참조) |
| **레이아웃** | 프레임(left/content/right) + 워크스페이스 내 3영역 스플릿 |
| **이벤트 전달** | **mitt** 이벤트 버스 (`ai:insert-request`, `ai:inject-to-chat` 등). 기존 useAiInsertRequest·useAiExplorerSelection·useAiMediaTab 콜백을 mitt로 전환·보완 |
| **상태 공유** | useAiChannels, useAiSplitLayout, useAiSettings 모듈 레벨 ref → **1단계에서 Pinia 전환 검토** |
| **설정 지속성** | **pinia-plugin-persistedstate**로 Pinia store를 localStorage에 영속화. 기존 useAiSplitLayout·useAiChannels·useAiSettings는 Pinia 전환 시 통합 |
| **로드맵** | 1단계 탭·패널 독립화(Pinia·패널 JSON 구조 준비) → 2단계 AI 컨텍스트 협업(패널 이해·조작) → 3단계 Yjs |
| **오류/예외** | Zod 검증 실패→원문 표시·재시도. Ollama 끊김→배너·재시도. 파일 로드 실패→에러 UI·재시도. **6.1 참조** |
| **DB** | ai_user_memos(존재), ai_channels·ai_chats·ai_chat_messages·ai_workspace_layout·ai_user_settings (2단계 또는 별도 Phase) |
| **기술** | Vercel AI SDK, **mitt**(이벤트 버스), **Zod**(AI 응답 JSON 스키마 검증), Yjs(추가 예정), Pinia·JS 혼합 |
| **장기** | 에디터 패널 → 전역 엔진 격상, 모든 도메인 재사용 / JSON 통일·페르소나·스킬·테스크 시스템 |

본 기획은 **이벤트(mitt) - 상태(Pinia) - 검증(Zod) - 영속성(PersistedState)**이라는 현대적인 웹 앱의 4대 요소를 모두 갖추고 있으며, 특히 **Focus Stack**은 단순한 에디터를 넘어 **지능형 워크스페이스**로 가는 핵심 차별점이다. 이 기획서는 현재 AI 도메인 구조를 기반으로 하며, 협업형 멀티 에디터 플랫폼의 기초 아키텍처와 **용어 정의**를 확정한다. 세부 기능·API·UI 상세는 별도 기획 문서에서 상황에 따라 분리·심화한다.
