# [설계안] 영문 네이밍 통일 및 EDITOR 탭 통합

UniversalViewer처럼 **EDITOR** 탭 하나로 통합하고, 파일 타입에 따라 내부 툴(Tiptap/Monaco/Image/Audio/Video)을 전환하는 설계.

---

## 1. 영문 네이밍 통일

### 1.1 패널·탭 레이블 (aiPanelRegistry)

| 기존 (한글) | 신규 (영문) | panelId |
|-------------|-------------|---------|
| 채팅 | Chat | chat |
| 에디터 | Editor | editor |
| 코드 | *(편집기 내부 전환)* | - |
| 이미지 | *(편집기 내부 전환)* | - |
| 음원 | *(편집기 내부 전환)* | - |
| 영상 | *(편집기 내부 전환)* | - |
| 뷰어 | Viewer | viewer |
| 탐색기 | Explorer | explorer |

### 1.2 액션·메뉴 레이블

| 기존 (한글) | 신규 (영문) |
|-------------|-------------|
| 에디터에 넣기 | Add to Editor |
| 채팅에 넣기 | Add to Chat |
| 미디어에 추가 | Add to Media |
| 이미지 편집 | Edit Image |
| 음원 편집 | Edit Audio |
| 영상 편집 | Edit Video |
| 코드 에디터에 삽입 | Insert to Editor (Code) |
| 기본 레이아웃 | Default Layout |
| 코드 중심 레이아웃 | Code Layout |

### 1.3 Notify 메시지

| 기존 (한글) | 신규 (영문) |
|-------------|-------------|
| 에디터에 삽입되었습니다 | Added to Editor |
| 채팅에 첨부됨 | Added to Chat |
| 미디어에 추가됨 | Added to Media |
| 이미지만 채팅에 첨부할 수 있습니다 | Only images can be added to Chat |
| ... | (필요 시 추가) |

---

## 2. EDITOR 탭 통합 (UniversalViewer 패턴)

### 2.1 개념

현재 center 탭: `editor` | `code` | `image` | `audio` | `video` | `viewer` (6개)

**통합 후:**

- **VIEWER**: UniversalViewer (읽기 전용, 파일 타입별 렌더러 자동 전환)
- **EDITOR**: 단일 탭, 파일/컨텍스트에 따라 내부 엔진 전환
  - Tiptap: 리치 텍스트 작성, MD/TXT/CSV 삽입, AI 응답 표시
  - Monaco: 코드 파일 편집
  - Image Editor: 이미지 편집 (추후)
  - Audio Editor: 음원 편집 (추후)
  - Video Editor: 영상 편집 (추후)

### 2.2 EDITOR 내부 전환 규칙

| 컨텍스트 | 표시 엔진 | 비고 |
|----------|-----------|------|
| 선택 파일 없음 / 메모 작성 / AI 응답 | Tiptap | 기본 |
| MD/TXT/CSV 삽입 | Tiptap | 파서 적용 후 삽입 |
| 코드 파일 클릭·편집 | Monaco | js, ts, json, yaml, py, ... |
| MD 편집 모드 (추후) | Monaco | 원본 md 편집 |
| 이미지 편집 (추후) | Image Editor | 이미지 전용 편집 |
| 오디오 편집 (추후) | Audio Editor | 오디오 전용 편집 |
| 비디오 편집 (추후) | Video Editor | 비디오 전용 편집 |

### 2.3 사용자 시나리오

| 동작 | 결과 |
|------|------|
| 파일 클릭 (md, txt, csv, 이미지 등) | VIEWER 탭 → UniversalViewer에 표시 |
| 파일 클릭 (코드) | EDITOR 탭 → Monaco 표시 |
| "Add to Editor" (md/txt/csv) | EDITOR 탭 → Tiptap에 파서 결과 삽입 |
| "Add to Editor" (이미지/오디오/비디오) | EDITOR 탭 → Tiptap에 미디어 삽입 |
| "Edit Image/Audio/Video" (추후) | EDITOR 탭 → 해당 전용 편집기 표시 |
| 메모 추가 / AI 응답 | EDITOR 탭 → Tiptap 표시 |

### 2.4 구조 변경 개요

```
[현재]
centerPanelIds: ['editor', 'code', 'image', 'audio', 'video', 'viewer']
  - editor  → AiEditorPanel (Tiptap)
  - code    → AiCodeEditorPanel (Monaco)
  - image   → AiImageEditorPanel (placeholder)
  - audio   → AiAudioEditorPanel (placeholder)
  - video   → AiVideoEditorPanel (placeholder)
  - viewer  → AiUniversalViewerPanel

[통합 후]
centerPanelIds: ['editor', 'viewer']
  - editor  → AiEditorPanel (내부에 mode: 'tiptap' | 'monaco' | 'image' | 'audio' | 'video')
  - viewer  → AiUniversalViewerPanel
```

---

## 3. 구현 단계

### Phase 1: 영문 네이밍 적용 (레이블만)

- `aiPanelRegistry.ts` PANEL_LABELS 영문화
- `AiExplorerPanel.vue`, `AiLeftNav.vue` 액션 레이블
- `AiChatPanel.vue` 메뉴/Notify
- 기타 한글 사용처 점검

### Phase 2: EDITOR 탭 통합

1. **AiEditorPanel.vue 확장**
   - `mode` prop 추가: `tiptap` | `monaco` | `image` | `audio` | `video`
   - 선택된 파일/컨텍스트에 따라 mode 결정
   - `editor`, `code`, `image`, `audio`, `video` 패널 로직을 AiEditorPanel 내부로 이동

2. **useAiSplitLayout.ts**
   - `DEFAULT_CENTER`: `['editor', 'viewer']` 로 변경
   - `applyPreset('code')`: `['editor', 'viewer']` 유지, editor 초기 mode만 `monaco`

3. **aiPanelRegistry.ts**
   - `code`, `image`, `audio`, `video` 패널 제거 (editor 내부로 통합)
   - centerPanelIds에서 제거

4. **showPanel / 컨텍스트**
   - `showPanel('editor')` + editor mode 설정 (예: `setEditorMode('monaco', file)`)
   - 기존 `showPanel('code')` 호출 → `showPanel('editor')` + mode='monaco'

### Phase 3: (추후) Image/Audio/Video 편집 연동

- EDITOR mode `image` | `audio` | `video` 활성화
- "Edit Image/Audio/Video" 클릭 시 `showPanel('editor')` + 해당 mode

---

## 4. 마이그레이션 고려

- **localStorage** `centerPanelIds`에 `code`, `image`, `audio`, `video`가 있으면 → `editor`로 병합, `viewer`는 그대로
- 기존 `showPanel('code')` 호출부를 `showPanel('editor')` + mode 전달로 변경

---

## 5. 요약

| 구분 | 변경 |
|------|------|
| 네이밍 | 패널·액션·메시지 전부 영문 |
| 탭 구조 | center: `editor` + `viewer` 2개 (현재 6개 → 2개) |
| EDITOR | 단일 탭, 파일 타입별 Tiptap/Monaco/Image/Audio/Video 전환 |
| 일관성 | UniversalViewer = 보기용, EDITOR = 편집·작성용 |
