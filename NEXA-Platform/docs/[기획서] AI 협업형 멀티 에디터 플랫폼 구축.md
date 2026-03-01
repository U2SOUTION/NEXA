# [기획서] AI 협업형 멀티 에디터 플랫폼 구축

NEXA AI 도메인 현재 구조를 분석하고, **AI 협업형 멀티 에디터 플랫폼**의 기획 기초를 정리한 문서이다.

---

## 0. 배경 및 목적

### 0.1 배경

본 사이트는 **IOT 기반 엄격한 기계 조작 플랫폼**에서 **창의적인 아트 프로젝트**로 확장하기 위해, **AI와 협업 가능한 구조**를 구축하는 과정에 있다. 따라서 AI 도메인뿐 아니라 다른 도메인도 함께 준비하고 있으며, 본 기획서는 그 일환으로 진행된다.

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
- AI 채팅과 멀티 타입 에디터(문서/코드/이미지/오디오/비디오)를 **동시에** 활용할 수 있는 협업형 작업 환경 구축
- 채팅·에디터·탐색기를 **3영역 스플릿**으로 배치해 작업 흐름 유지

### 0.3 적용 범위

| 영역 | 범위 |
|------|------|
| 프레임 | left(채널/노트/미디어) · content(3영역 스플릿) · right(에이전트/설정) |
| 콘텐츠 | 좌(채팅) · 중앙(에디터/코드/이미지/오디오/비디오/뷰어) · 우(탐색기) |
| 백엔드 | Ollama 연동(chat, chat-stream, models) |

---

## 1. 주요 용어 및 UI 구조 정의

> 기존 Quasar의 **탭(q-tab)** 개념과 혼동을 피하기 위해 다음과 같이 명칭을 정의한다. 문서 내 모든 기술 용어는 이 정의를 따른다.

### 1.1 핵심 용어

| 용어 | 영문 | 정의 |
|------|------|------|
| **워크스페이스** | Workspace | 특정 작업 목적에 따라 **여러 편집 도구와 AI 채팅이 배치되는 최상위 컨테이너**. 현재 AI 도메인의 content 영역(AiContent → AiSplitLayout)이 이에 해당한다. |
| **탭** | Tab | 에디터 유형을 구분하는 단위. `editor`, `code`, `image`, `audio`, `video`, `viewer`가 각각 **탭**에 해당한다. 한 탭에서 여러 파일을 동시에 열 수 있다. |
| **패널** | Panel | **탭 내에서 열린 파일 1개당 1개의 패널**. 실제 파일이 로드되어 편집되는 독립적인 단위 창. 예: 코드 탭에서 file1.ts, file2.ts를 열면 패널 2개. |
| **배치 관리** | Layout Management | Quasar의 **QSplitter**와 **Pinia**를 사용하여 탭·패널의 **레이아웃 상태**(위치, 비율, 표시/숨김, 열린 패널 목록)를 관리하는 체계. |

### 1.2 계층 구조

```
워크스페이스
  └─ 탭 (editor | code | image | audio | video | viewer)  ← 에디터 유형
       ├─ 패널 (파일 A)
       ├─ 패널 (파일 B)
       └─ 패널 (파일 C)
```

- **1탭 : N패널** 관계. 여러 탭에서 여러 종류의 파일을 열 수 있고, **한 탭에 같은 종류의 파일 여러 개**를 열면 각 파일이 패널로 표시된다.

### 1.3 용어 구분 (혼동 방지)

| 구분 | Quasar/기존 용어 | 본 문서 용어 | 비고 |
|------|------------------|-------------|------|
| 최상위 | Tab, Drawer | **워크스페이스** | 탭·패널을 담는 컨테이너 |
| 에디터 유형 | q-tab, Tab | **탭** | editor, code, image, audio, video, viewer |
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
| 뷰어 탭 | viewer | UniversalViewer | 범용 파일 미리보기. 패널별로 파일 1개. |
| 채팅 | chat | — | AI 채팅 (편집 대상 아님, 협업 UI) |
| 탐색기 | explorer | — | 파일 탐색 (편집 대상 아님) |

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
| Center | `editor`, `code`, `image`, `audio`, `video`, `viewer` | 문서·코드·미디어 **탭** (탭당 여러 패널 가능) |
| Right | `explorer` | 파일 탐색기 |

---

## 3. 탭 구성 (aiPanelRegistry → 탭 ID 매핑)

> **1단계 목표**: 모든 에디터를 `EditorPanel` 규격 인터페이스(Props/Events)로 추상화. 각 탭에서 **여러 패널(파일 인스턴스)** 을 동시에 열 수 있도록 구조화.

| 탭 ID | 컴포넌트 | 설명 |
|-------|----------|------|
| chat | AiChatPanel | AI 채팅 대화·입력, 목차, 이미지 첨부 |
| editor | AiEditorPanel | 문서 탭. Tiptap. 탭 내 여러 파일 → 패널 N개 |
| code | AiCodeEditorPanel | 코드 탭. Monaco. 탭 내 여러 파일 → 패널 N개 |
| image | AiImageEditorPanel | 이미지 탭. 패널당 이미지 1개 |
| audio | AiAudioEditorPanel | 오디오 탭. 패널당 오디오 1개 |
| video | AiVideoEditorPanel | 영상 탭. 패널당 영상 1개 |
| viewer | AiUniversalViewerPanel | 뷰어 탭. 패널당 파일 1개 |
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

---

## 5. 데이터 흐름

### 5.1 에디터 삽입 (메모 등 → 에디터)

```
AiLeftNav (메모 우클릭/클릭) / 외부
  → useAiInsertRequest.requestInsert(raw)
  → AiContent (onInsertRequest)
  → showPanel('editor') + pendingInsertContent  // 'editor' = 문서 탭 ID
  → 문서 탭 내 새 패널 또는 활성 패널에 삽입
```

### 5.2 탐색기 → 채팅/에디터

```
AiExplorerPanel (파일 선택 후 버튼)
  → useAiExplorerSelection.requestInjectToEditor(file) 등
  → AiContent (onInjectToEditor) → 해당 탭 표시 + 새 패널로 파일 열기 또는 삽입
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

---

## 6. 서비스 (aiApi)

| 메서드 | 설명 |
|--------|------|
| listModels | Ollama 모델 목록 조회 |
| getModelShow | 모델 상세 정보 |
| chat | 단발 채팅 요청 |
| chatStream | 스트리밍 채팅 (onChunk 콜백) |
| checkConnection | Ollama 연결 확인 |
| generateTitle | 대화 제목 생성 |

---

## 7. 설정 지속성

| 항목 | 저장소 | 키/위치 | 비고 |
|------|--------|---------|------|
| 스플릿 비율, 영역 표시/숨김, 탭 구성·열린 패널 목록·활성 패널 | localStorage | `nexa-ai-split-layout` | 1단계: **Pinia** 전환으로 탭·열린 패널·활성 패널·위치 정보 통합 관리 |
| 채널·채팅 선택, Instruction | (기존 정책) | useAiChannels | — |
| 모델·목차·폰트 등 | (기존 정책) | useAiSettings | — |

---

## 8. 확장 가능 영역

### 8.1 탭 확장

- `aiPanelRegistry`에 `PANEL_LABELS`, `PANEL_ICONS`, `PANEL_COMPONENTS` 추가 (탭 ID 매핑)
- 새 탭 ID 등록 후 `DEFAULT_LEFT`, `DEFAULT_CENTER`, `DEFAULT_RIGHT`에 포함 가능

### 8.2 에이전트 탭 확장

- `aiAgentTabRegistry`의 `AI_AGENT_TABS`에 항목 추가
- skill, task, workcard 외 추가 탭 정의 가능

### 8.3 미구현·준비 중

- 에이전트 패널: AiAgentSkillPanel, AiAgentTaskPanel, AiAgentWorkcardPanel (placeholder)
- 파일 메뉴(새 채팅, 새 문서, 열기, 저장 등) 일부 플레이스홀더
- 편집 메뉴(실행 취소, 복사, 붙여넣기 등) 일부 플레이스홀더

---

## 9. 단계별 구현 로드맵

### 9.1 1단계: 탭·패널 독립화 및 레이아웃 시스템 구축 (현재 단계)

| 항목 | 내용 |
|------|------|
| **추상화** | 모든 에디터를 **EditorPanel** 규격으로 규격화. **탭**별로 **여러 패널(파일 인스턴스)** 동시 오픈 구조 지원 |
| **상태 관리** | **Pinia**를 사용하여 탭 구성, **열린 패널 목록**(탭별), 활성 패널 ID, 스플릿 뷰 위치 정보 저장 |
| **UI 완성도** | Quasar 레이아웃 내에서 에디터가 깨지지 않고 **리사이징(Resize)**되는지, 탭·패널 간 파일 로드 및 저장이 단일 사용자 환경에서 완벽한지 검증 |

### 9.2 2단계: AI(Ollama) 컨텍스트 협업 엔진 연동

| 항목 | 내용 |
|------|------|
| **컨텍스트 주입** | AI에게 질문할 때 **현재 활성화된 패널(열린 파일)** 의 데이터를 자동으로 포함하여 전송 |
| **편집 제안** | AI가 생성한 내용을 특정 패널에 즉시 반영하거나, **변경 사항을 하이라이트**하는 기능 구현 |
| **미디어 확장** | 이미지·사운드·영상 탭의 패널 메타데이터를 AI가 분석하고 **수정 제안**을 할 수 있는 구조 구축 |
| **JSON 데이터 통일** | 로컬 모델·엣지 디바이스 환경에서 **똑똑한 기능**을 위해 AI 입력·출력·상태를 **JSON**으로 통일 |
| **페르소나·스킬·테스크 시스템** | 도메인·프로젝트 특성에 따라 **다양한 페르소나·스킬·테스크**를 추가·관리·적용. **Vercel AI SDK**로 모델(Ollama·클라우드)을 교체해도 선택한 페르소나·스킬·테스크의 **일관성 유지** |

### 9.3 3단계: Yjs 기반 실시간 동기화 및 영속성 강화

> **적용 시점**: Yjs는 **에디터 기본 기능이 Pinia 기반으로 완성된 후** 이어서 추가 적용한다. **도메인 전역에서의 사용 기획**을 구체화한 뒤 진행한다.

| 항목 | 내용 |
|------|------|
| **실시간성 도입** | **Vercel AI SDK**(이미 적용)에 **Yjs**를 추가 적용. Tiptap(**y-prosemirror**)·Monaco(**y-monaco**) 바인딩으로 AI 입력을 실시간 시각화 |
| **상태 관리** | **Pinia**와 **JS**를 적절히 혼합하여 탭·패널·Yjs 문서 상태 관리 |
| **Awareness(인식)** | 사용자 커서와 AI의 작업 위치를 **패널** 상에 표시하여 협업 가시성 향상 |
| **서버 영속성** | Node.js 서버에 **y-leveldb** 등을 연동하여 브라우저 새로고침 후에도 **편집 이력과 패널 상태 유지** |

---

## 10. 기술 스택 요약

| 영역 | 기술 |
|------|------|
| **Frontend** | Vue 3, Quasar, Pinia |
| **Editor** | Tiptap (Rich Text), Monaco (Code), Custom Media Editors |
| **AI** | **Vercel AI SDK** (이미 적용): 로컬(Ollama)·클라우드 모델 유연 교체, 페르소나·스킬·테스크 일관성 유지 |
| **데이터** | **JSON** 통일 (AI 입력·출력·페르소나·스킬·테스크 등, 로컬·엣지 환경 대응) |
| **Real-time** | **Yjs** (Pinia 기반 에디터 기본 기능 완성·도메인 전역 사용 기획 구체화 후 적용) |
| **상태 관리** | Pinia와 JS 혼합 사용 계획 (적절한 영역에 각각 적용) |
| **Backend** | Node.js |

---

## 11. 향후 기획 방향 (참고)

1. **메모 → 문서 승격**: ai_user_memos → files 정식 저장 (ai_user_memos-기획.md)
2. **탐색기·미디어 탭 동기화**: 좌측 미디어 탭과 탐색기 연동 (탐색기-미디어탭-동기화-기획.md)
3. **페르소나·스킬·테스크 시스템**: 도메인·프로젝트별 다양한 페르소나·스킬·테스크 추가·관리·적용 (에이전트 탭 연동)
4. **Yjs 적용**: Pinia 기반 에디터 기본 기능 완성 후, 도메인 전역 사용 기획 구체화를 거쳐 추가 적용
5. **에디터 패널 전역 엔진화**: 안정화 후 에디터 패널을 전역 엔진으로 격상, **모든 도메인에서 재사용 가능**하도록 구성
6. **드래그 앤 드롭**: 탭·패널 순서 사용자 재배치

> 세부 내용은 상황에 따라 별도 문서로 분리·심화한다.

---

## 12. 정리

| 항목 | 내용 |
|------|------|
| **용어** | 워크스페이스(최상위), **탭**(editor/code/image/audio/video/viewer), **패널**(탭 내 파일 1개 = 패널 1개), 배치 관리(QSplitter+Pinia) |
| **레이아웃** | 프레임(left/content/right) + 워크스페이스 내 3영역 스플릿 |
| **이벤트 전달** | useAiInsertRequest, useAiExplorerSelection, useAiMediaTab 콜백 패턴 |
| **상태 공유** | useAiChannels, useAiSplitLayout, useAiSettings 모듈 레벨 ref → **1단계에서 Pinia 전환 검토** |
| **설정 지속성** | useAiSplitLayout, useAiChannels, useAiSettings에서 localStorage 활용 |
| **로드맵** | 1단계 탭·패널 독립화(Pinia) → 2단계 AI 컨텍스트 협업 → 3단계 Yjs(에디터 기본 완성·도메인 전역 기획 구체화 후 적용) |
| **기술** | Vercel AI SDK(적용됨, 로컬·클라우드 유연 교체·페르소나 일관성), Yjs(추가 예정), Pinia·JS 혼합 |
| **장기** | 에디터 패널 → 전역 엔진 격상, 모든 도메인 재사용 / JSON 통일·페르소나·스킬·테스크 시스템 |

이 기획서는 현재 AI 도메인 구조를 기반으로 하며, 협업형 멀티 에디터 플랫폼의 기초 아키텍처와 **용어 정의**를 확정한다. 세부 기능·API·UI 상세는 별도 기획 문서에서 상황에 따라 분리·심화한다.
