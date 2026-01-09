# Mermaid 스타일 시스템 아키텍처 문서

## 개요

이 문서는 NEXA Platform의 Mermaid 다이어그램 스타일 관리 시스템의 구조와 동작 방식을 설명합니다. 향후 기능 추가 및 유지보수를 위한 참고 자료입니다.

## 시스템 구조

### 1. 주요 컴포넌트

```
src/domains/dev/modules/document-manager/
├── composables/
│   ├── useMermaid.js          # Mermaid 렌더링 및 스타일 주입
│   └── useMermaidStyle.js     # 스타일 상태 관리 및 CSS 생성
├── services/
│   └── mermaidStyleStorage.js # localStorage 기반 스타일 저장/로드
└── components/sections/
    └── MermaidStyleSection.vue # 스타일 설정 UI
```

### 2. 데이터 흐름

```
[사용자 입력]
    ↓
[MermaidStyleSection.vue]
    ↓ (ref 업데이트)
[useMermaidStyle.js]
    ↓ (CSS 생성)
[mermaidStyleStorage.js]
    ↓ (localStorage 저장)
[useMermaid.js]
    ↓ (스타일 주입 + 인라인 스타일)
[Mermaid SVG 렌더링]
```

## 핵심 개념

### 1. 스타일 종류

#### 노드 스타일

-   **배경색** (`nodeBg`): 노드 내부 배경
-   **테두리색** (`nodeBorder`): 노드 테두리
-   **테두리 두께** (`nodeBorderWidth`): 노드 테두리 두께
-   **그림자 효과** (`nodeShadow`, `nodeShadowBlur`, `nodeShadowOffsetX/Y`, `nodeShadowColor`)

#### 텍스트 스타일

-   **노드 텍스트 색상** (`textColor`): 노드 내부 텍스트 색상
-   **노드 텍스트 크기** (`textSize`): 노드 내부 텍스트 크기
-   **엣지 라벨 텍스트 색상** (`edgeText`): 연결선 라벨 텍스트 색상
-   **엣지 라벨 텍스트 크기** (`edgeLabelSize`): 연결선 라벨 텍스트 크기

#### 라인 스타일

-   **라인 색상** (`lineColor`): 연결선 색상
-   **라인 두께** (`lineWidth`): 연결선 두께
-   **라인 스타일** (`lineStyle`): solid, dashed, dotted

### 2. CSS 선택자 구조

#### 노드 텍스트

```css
.mermaid-block svg text:not(.edgeLabel text):not(.edgeLabel span):not(.messageText) {
  fill: ${textColor.value} !important;
}
```

#### 엣지 라벨 텍스트

```css
.mermaid-block svg .edgeLabel,
.mermaid-block svg .edgeLabel text,
.mermaid-block svg .edgeLabel span,
.mermaid-block svg .edgeText {
  fill: ${edgeText.value} !important;
}
```

**중요**: `text:not(.edgeLabel text)` 패턴은 노드 텍스트를 의미하며, 엣지 라벨이 아닙니다.

## 주요 문제 및 해결 방법

### 문제 1: CSS 파싱 시 노드 텍스트와 엣지 라벨 텍스트 구분 실패

#### 원인

**핵심 문제**: CSS에서 `text:not(.edgeLabel text)` 패턴은 **노드 텍스트**를 의미하지만, 파싱 로직이 `.edgeLabel text` 부분만 매칭하여 **엣지 라벨**로 잘못 인식했습니다.

**상세 설명**:

1. **CSS 구조**:

    ```css
    /* 노드 텍스트 - 엣지 라벨을 제외한 모든 텍스트 */
    text:not(.edgeLabel text):not(.edgeLabel span):not(.messageText) {
        fill: #ff73be !important;
    }

    /* 엣지 라벨 텍스트 */
    .edgeLabel,
    .edgeLabel text,
    .edgeLabel span,
    .edgeText {
        fill: #00ff00 !important;
    }
    ```

2. **파싱 실패 과정**:

    - 정규식 `/\.edgeLabel[^}]*text[^}]*fill:\s*([^!;]+)/i`가 실행됨
    - `text:not(.edgeLabel text)` 패턴에서 `.edgeLabel text` 부분이 매칭됨
    - 앞부분의 `text:not(`를 확인하지 않아 노드 텍스트 색상(`#ff73be`)을 엣지 라벨 색상으로 오인
    - 결과: 엣지 라벨 색상이 노드 텍스트 색상과 동일하게 설정됨

3. **왜 이런 문제가 발생했나?**:
    - 정규식이 부분 문자열만 매칭하여 전체 컨텍스트를 고려하지 않음
    - `text:not(.edgeLabel text)`는 "엣지 라벨 텍스트가 아닌 텍스트"를 의미하지만, 파서는 `.edgeLabel text`만 보고 엣지 라벨로 판단
    - 즉, **`edgeLabel text`를 구분하지 못한 것이 아니라, `text:not()` 전체 패턴을 제대로 인식하지 못한 것**

#### 해결 방법

1. **우선순위 기반 파싱**:

    - `.edgeText` 패턴을 먼저 찾기 (가장 명확함 - 엣지 텍스트 전용 클래스)
    - `.edgeLabel text` 패턴 찾기 (앞에 `text:not(`가 없는지 확인)
    - `.edgeLabel` 단독 패턴 찾기 (앞에 `text:not(`가 없는지 확인)

2. **컨텍스트 확인 (핵심 해결책)**:

    ```javascript
    // 매칭된 부분의 앞부분을 확인하여 text:not() 패턴인지 판단
    const matchIndex = css.indexOf(fullMatch);
    const beforeText = css.substring(Math.max(0, matchIndex - 50), matchIndex);

    // text:not(.edgeLabel text) 패턴이 아닌지 확인
    if (!beforeText.includes("text:not") || !beforeText.trim().endsWith("text:not(")) {
        // text:not() 패턴이 아니면 엣지 라벨로 처리
        edgeTextValue = match[1].trim();
    }
    ```

3. **파싱 순서의 중요성**:
    - `.edgeText`를 먼저 찾으면 명확한 엣지 라벨만 매칭
    - 그 다음 `.edgeLabel text`를 찾되, 앞부분을 확인하여 `text:not()` 패턴 제외
    - 이렇게 하면 `text:not(.edgeLabel text)`는 노드 텍스트로, `.edgeLabel text`는 엣지 라벨로 정확히 구분됨

### 문제 2: 실시간 반영 시 엣지 라벨 요소를 찾지 못함

#### 원인

-   선택자가 부정확: `.edgeLabel text`는 직접 자식만 찾음
-   Mermaid의 DOM 구조에서 `.edgeLabel`은 `g` 요소이고, 내부에 중첩된 구조가 있음

#### 해결 방법

1. **그룹 기반 선택**:

    ```javascript
    const edgeLabelGroups = svg.querySelectorAll('.edgeLabel, .edgeLabels, g[class*="edgeLabel"]');
    edgeLabelGroups.forEach((group) => {
        const textElements = group.querySelectorAll("text, tspan");
        // 그룹 내부의 모든 텍스트 요소 처리
    });
    ```

2. **다중 선택자 사용**:
    - `.edgeLabel` 그룹 내부의 모든 텍스트
    - `.edgeText` 클래스를 가진 요소
    - `[class*="edgeText"]` 속성 선택자

## 상세 구현

### 1. useMermaidStyle.js

#### 역할

-   스타일 상태 관리 (ref 기반)
-   CSS 생성 (`generateFileLevelCss`, `generateBlockLevelCss`)
-   CSS 파싱 (`loadFileStyle`)

#### 주요 함수

##### `generateFileLevelCss()`

전체 파일 레벨 CSS를 생성합니다. 모든 Mermaid 블록에 공통으로 적용됩니다.

```javascript
function generateFileLevelCss() {
    return `
    .mermaid-block svg .edgeLabel,
    .mermaid-block svg .edgeLabel text,
    .mermaid-block svg .edgeLabel span,
    .mermaid-block svg .edgeText {
      fill: ${edgeText.value} !important;
    }
  `;
}
```

##### `loadFileStyle()`

localStorage에서 저장된 CSS를 로드하고 파싱하여 ref 값들을 업데이트합니다.

**파싱 우선순위**:

1. `.edgeText` 패턴 (가장 명확)
2. `.edgeLabel text` 패턴 (앞에 `text:not(`가 없는 경우)
3. `.edgeLabel` 단독 패턴 (앞에 `text:not(`가 없는 경우)

### 2. MermaidStyleSection.vue

#### 역할

-   스타일 설정 UI 제공
-   실시간 스타일 미리보기 (`applyRealtimeStyles`)
-   스타일 저장/로드

#### 주요 함수

##### `applyRealtimeStyles()`

UI에서 스타일 변경 시 즉시 Mermaid 차트에 반영합니다.

**동작 순서**:

1. 기본 CSS 로드
2. 저장된 파일 CSS 로드 (localStorage)
3. 실시간 UI 설정값으로 CSS 생성
4. CSS 주입
5. 인라인 스타일 적용 (SVG 요소에 직접 적용)

##### `handleEdgeTextChange(newColor)`

엣지 라벨 텍스트 색상 변경 핸들러입니다.

```javascript
function handleEdgeTextChange(newColor) {
    edgeText.value = newColor;
    applyRealtimeStyles(); // 디바운싱 적용
}
```

### 3. useMermaid.js

#### 역할

-   Mermaid 차트 렌더링
-   스타일 주입 (`injectMermaidStyles`)
-   인라인 스타일 강제 적용 (`forceApplyThemeStyles`)

#### 주요 함수

##### `forceApplyThemeStyles(blockElement)`

CSS만으로는 적용되지 않는 경우를 대비해 인라인 스타일을 직접 적용합니다.

**적용 순서**:

1. 엣지 라벨 처리 (`.edgeLabel` 그룹 찾기)
2. 노드 텍스트 처리
3. 메시지 텍스트 처리 (시퀀스 다이어그램)

##### localStorage에서 색상 로드

`forceApplyThemeStyles` 내부에서 localStorage의 CSS를 파싱하여 최신 색상을 가져옵니다.

**주의사항**: `useMermaidStyle.js`와 동일한 파싱 로직을 사용해야 합니다.

### 4. mermaidStyleStorage.js

#### 역할

-   localStorage 기반 스타일 저장/로드
-   캐시 관리

#### 주요 함수

##### `saveMermaidStyle(filePath, cssContent)`

localStorage에 CSS를 저장합니다.

##### `loadMermaidStyle(filePath)`

localStorage에서 CSS를 로드합니다. 네트워크 요청 없이 localStorage만 확인합니다.

## CSS 파싱 로직 상세

### 노드 텍스트 색상 파싱

```javascript
// 1. text:not(.messageText) 패턴 (가장 정확)
const textNotMessageMatch = css.match(/text:not\([^)]*messageText[^)]*\)[^}]*fill:\s*([^!;]+)/i);
if (textNotMessageMatch) {
    const matchContext = textNotMessageMatch[0];
    // .edgeLabel이 명시적으로 제외된 패턴인지 확인
    if (matchContext.includes(".edgeLabel") || matchContext.includes("edgeLabel")) {
        // text:not(.edgeLabel ...) 패턴은 노드 텍스트
        textColorValue = textNotMessageMatch[1].trim();
    }
}
```

### 엣지 라벨 텍스트 색상 파싱

```javascript
// 1. .edgeText 패턴 (가장 명확함)
const edgeTextMatch = css.match(/\.edgeText[^}]*fill:\s*([^!;]+)/i);

// 2. .edgeLabel text 패턴 (text:not이 아닌 경우만)
const edgeLabelTextMatch = css.match(/\.edgeLabel[^}]*\s+text[^}]*fill:\s*([^!;]+)/i);
if (edgeLabelTextMatch) {
    const beforeText = css.substring(Math.max(0, matchIndex - 50), matchIndex);
    // text:not(.edgeLabel text) 패턴이 아닌지 확인
    if (!beforeText.includes("text:not") || !beforeText.trim().endsWith("text:not(")) {
        edgeTextValue = edgeLabelTextMatch[1].trim();
    }
}
```

## 실시간 반영 메커니즘

### 1. CSS 주입

```javascript
const styleTag = document.createElement("style");
styleTag.id = `mermaid-style-${mermaidId}`;
styleTag.textContent = finalCss;
document.head.appendChild(styleTag);
```

### 2. 인라인 스타일 적용

CSS만으로는 SVG의 `fill` 속성이 제대로 적용되지 않을 수 있으므로, 인라인 스타일을 직접 적용합니다.

```javascript
// 엣지 라벨 그룹 찾기
const edgeLabelGroups = svg.querySelectorAll('.edgeLabel, .edgeLabels, g[class*="edgeLabel"]');
edgeLabelGroups.forEach((group) => {
    const textElements = group.querySelectorAll("text, tspan");
    textElements.forEach((textEl) => {
        textEl.style.setProperty("fill", edgeText.value, "important");
        textEl.setAttribute("fill", edgeText.value);
    });
});
```

## 향후 기능 추가 가이드

### 1. 새로운 스타일 속성 추가

#### Step 1: useMermaidStyle.js에 ref 추가

```javascript
const newStyleProperty = ref(defaultValue);
```

#### Step 2: CSS 생성 함수에 추가

```javascript
function generateFileLevelCss() {
    return `
    .mermaid-block svg .targetSelector {
      property: ${newStyleProperty.value} !important;
    }
  `;
}
```

#### Step 3: CSS 파싱 로직 추가

```javascript
async function loadFileStyle() {
    const css = await loadMermaidStyle(currentFilePath.value);
    const match = css.match(/\.targetSelector[^}]*property:\s*([^!;]+)/i);
    if (match) {
        newStyleProperty.value = match[1].trim();
    }
}
```

#### Step 4: MermaidStyleSection.vue에 UI 추가

```vue
<q-color v-model="style.newStyleProperty" format-model="hex" />
```

#### Step 5: 실시간 반영 로직 추가

```javascript
function applyRealtimeStyles() {
    const elements = svg.querySelectorAll(".targetSelector");
    elements.forEach((el) => {
        el.style.setProperty("property", newStyleProperty.value, "important");
    });
}
```

### 2. 새로운 다이어그램 타입 지원

#### Step 1: CSS 선택자 추가

```javascript
function generateFileLevelCss() {
    return `
    .mermaid-block svg .newDiagramType .targetElement {
      property: ${value.value} !important;
    }
  `;
}
```

#### Step 2: forceApplyThemeStyles에 로직 추가

```javascript
function forceApplyThemeStyles(blockElement) {
    const newDiagramElements = svg.querySelectorAll(".newDiagramType .targetElement");
    newDiagramElements.forEach((el) => {
        el.style.setProperty("property", value, "important");
    });
}
```

### 3. 스타일 프리셋 기능 추가

#### 구조 제안

```javascript
// useMermaidStyle.js
const presets = {
  dark: { nodeBg: '#333', textColor: '#fff', ... },
  light: { nodeBg: '#fff', textColor: '#000', ... },
  custom: { ... }
}

function applyPreset(presetName) {
  const preset = presets[presetName]
  Object.keys(preset).forEach(key => {
    if (refs[key]) {
      refs[key].value = preset[key]
    }
  })
}
```

## 디버깅 가이드

### 1. CSS 파싱 문제 디버깅

개발자 도구 콘솔에서 다음 로그를 확인:

-   `[useMermaidStyle] 엣지 라벨 텍스트 색상 파싱 성공`
-   `[useMermaidStyle] 노드 텍스트 색상 로드`

### 2. 실시간 반영 문제 디버깅

```javascript
// MermaidStyleSection.vue의 applyRealtimeStyles에 추가
if (import.meta.env.DEV) {
    console.log("[실시간 스타일] 엣지 라벨 요소 적용 완료:", {
        edgeLabelGroups: edgeLabelGroups.length,
        edgeTextElements: edgeTextElements.length,
        edgeTextValue: edgeText.value,
    });
}
```

### 3. DOM 구조 확인

```javascript
// useMermaid.js의 forceApplyThemeStyles에 추가
localStorage.setItem("mermaidDebug", "true");
// 페이지 새로고침 후 콘솔에서 DOM 구조 확인
```

## 주의사항

### 1. CSS 선택자 우선순위

-   `!important` 사용: Mermaid의 기본 스타일을 덮어쓰기 위해 필요
-   인라인 스타일: CSS보다 우선순위가 높으므로, CSS만으로 안 될 때 사용

### 2. 파싱 로직 일관성

-   `useMermaidStyle.js`와 `useMermaid.js`의 파싱 로직이 일치해야 함
-   새로운 속성 추가 시 두 곳 모두 업데이트 필요

### 3. 성능 고려사항

-   실시간 반영은 디바운싱 적용 (100-300ms)
-   CSS 파싱은 캐시 활용
-   localStorage 접근 최소화

## 참고 자료

-   Mermaid 공식 문서: https://mermaid.js.org/
-   SVG 스타일링: https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/SVG_and_CSS
-   Vue 3 Composition API: https://vuejs.org/guide/extras/composition-api-faq.html
