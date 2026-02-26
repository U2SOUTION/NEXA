# Tiptap 엔진 — 도메인 사용 시 가능한 옵션

각 도메인에서는 **사용할 스킨을 직접 import** 한다 (예: base 스킨 → `@engines/tiptap/skins/base/TiptapEditor.vue`). 아래 옵션은 해당 스킨의 에디터 컴포넌트(TiptapEditor.vue)에서 받는 props 이다.

---

## 1. 스킨 에디터에서 제공하는 옵션 (props) — base 스킨 기준

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| **modelValue** | `String` | `''` | v-model 바인딩용 HTML 콘텐츠 |
| **placeholder** | `String` | `'내용을 입력하세요...'` | 빈 에디터에 보이는 placeholder |
| **uploadHandler** | `Function` | **(필수)** | `(file, context) => Promise<{ url, original_filename? }>` — 이미지 업로드 처리. 도메인별로 업로드 API/Base64 등 구현 후 전달 |
| **toolbarOrder** | `Array<string>` | (아래 전체 목록) | 툴바 버튼 **순서**. 여기 나열된 ID만 사용 가능 |
| **normalModeExcludedIds** | `Array<string>` | (일부 제외 목록) | **일반 모드**에서 숨길 툴바 버튼 ID. 풀스크린 모드에서는 전부 표시 |
| **allowFullscreen** | `Boolean` | `true` | 풀스크린 버튼·풀스크린 모달 사용 여부 |

---

## 2. toolbarOrder / normalModeExcludedIds에 쓸 수 있는 ID 전체

툴바 항목은 아래 ID로만 구성 가능하다. 순서를 바꾸거나, `normalModeExcludedIds`로 일반 모드에서 숨길 수 있다.

| ID | 설명 |
|----|------|
| `bold` | 굵게 |
| `italic` | 기울임 |
| `underline` | 밑줄 |
| `strike` | 취소선 |
| `heading1` ~ `heading3` | 제목 1~3 |
| `alignLeft`, `alignCenter`, `alignRight`, `alignJustify` | 정렬 |
| `highlight` | 하이라이트 |
| `textColor`, `backgroundColor` | 글자색·배경색 |
| `fontFamily` | 글꼴 |
| `superscript`, `subscript` | 위·아래 첨자 |
| `bulletList`, `orderedList`, `taskList` | 글머리·번호·할 일 목록 |
| `blockquote`, `codeBlock`, `code` | 인용·코드 블록·인라인 코드 |
| `insertTable` | 표 삽입 (표 선택 시 행/열 추가·삭제 메뉴) |
| `link`, `image`, `youtube` | 링크·이미지·유튜브 |
| `undo`, `redo` | 실행 취소·다시 실행 |
| `clearAll` | 서식 전부 지우기 |
| `spellcheck` | 맞춤법 검사 on/off |
| `horizontalRule` | 구분선 |

---

## 3. 엔진 내부 확장 옵션 (현재 미노출)

`skins/base/extensions.ts`의 `createBaseExtensions(options)`는 아래 옵션을 받을 수 있지만, **base 스킨 TiptapEditor.vue에서는 아직 이 옵션을 props로 받지 않고** 항상 `createBaseExtensions()` 무인자로 호출한다.

| 옵션 | 기본값 | 설명 |
|------|--------|------|
| `inlineImage` | `true` | 이미지 인라인 여부 |
| `allowBase64Image` | `true` | Base64 이미지 허용 여부 |
| `youtubeOptions` | `{ controls: true, nocookie: false }` | YouTube 확장 설정 |

도메인별로 이미지 인라인/Base64/유튜브 옵션을 다르게 쓰려면, 해당 스킨의 TiptapEditor.vue에 예: `extensionOptions` prop을 추가해 `createBaseExtensions(extensionOptions)`에 넘기는 식으로 확장할 수 있다.

---

## 4. 도메인별 사용 현황

| 도메인 | 컴포넌트 | 사용 중인 옵션 | 비고 |
|--------|-----------|----------------|------|
| **archive** | `ArchiveTiptapEditor.vue` | `modelValue`, `placeholder`, `uploadHandler` | 업로드는 partsDataStore.uploadTempFile 사용. 나머지 props는 기본값 |
| **parts** | `TiptapEditor.vue` | `modelValue`, `placeholder`, `partClassId`(자체 prop), `uploadHandler` | partClassId 있으면 uploadEditorImage, 없으면 uploadTempFile. 나머지 기본값 |
| **ai** | `AiEditorPanel.vue` | `modelValue`, `placeholder`, `uploadHandler`, `allowFullscreen: true` | 이미지는 Base64 data URL로 처리. 나머지 기본값 |

공통: **uploadHandler**는 도메인마다 다르게 구현(임시 업로드, 품목별 업로드, Base64 등).

---

## 5. 슬롯

스킨 에디터(TiptapEditor.vue)는 툴바를 커스터마이즈할 때 쓸 수 있는 슬롯을 제공한다.

- **toolbar** — 일반 모드 툴바. slot props: `editor`, `items`, `isFullscreen`, `toggleFullscreen`
- **toolbar-fullscreen** — 풀스크린 모드 툴바. 동일한 props

도메인에서 import 한 스킨 에디터에 `<template #toolbar="...">...</template>` 형태로 툴바를 교체할 수 있다.

---

## 6. 요약

- **도메인에서 실제로 조정 가능한 옵션**: `modelValue`, `placeholder`, `uploadHandler`, `toolbarOrder`, `normalModeExcludedIds`, `allowFullscreen`.
- **툴바 구성**: 위 ID 목록으로 순서 지정 + `normalModeExcludedIds`로 일반 모드에서 숨기기.
- **확장 동작(이미지/유튜브 옵션)**: 현재는 스킨 내부 고정. 도메인별로 다르게 쓰려면 해당 스킨의 TiptapEditor.vue에 extension 옵션 prop 추가 필요.
