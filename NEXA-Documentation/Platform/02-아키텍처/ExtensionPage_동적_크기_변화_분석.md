# ExtensionPage 동적 크기 변화 기능 분석

## 📋 개요

ExtensionPage는 세 가지 모드(popup, sidepanel, injected)에서 동작하며, 각 모드에 따라 다른 크기 조정 방식을 사용합니다. 이 문서는 동적 크기 변화 기능의 구조와 동작 방식을 분석합니다.

---

## 🏗️ 아키텍처 구조

### 1. 모드 감지 및 분기

**파일**: `NEXA-Platform/src/pages/ExtensionPage.vue`

```javascript
// 모드 감지 로직
const currentMode = computed(() => {
  if (route.query.mode === 'popup') return 'popup'
  if (route.query.mode === 'sidepanel') return 'sidepanel'
  if (route.query.mode === 'injected') return 'injected'
  if (window.self !== window.top) return 'popup' // fallback
  return null
})
```

**동작 방식**:
- URL query parameter (`?mode=popup/sidepanel/injected`)로 모드 감지
- iframe 감지 (`window.self !== window.top`)로 fallback 처리
- 모드에 따라 다른 레이아웃 컴포넌트 렌더링

---

## 📐 모드별 크기 조정 방식

### 1. Popup 모드

**파일**: `NEXA-Desktop/U2BEE V3/popup.html`, `popup.css`

**크기 설정**:
```css
html, body {
  width: 800px;    /* 고정 너비 */
  height: 600px;   /* 고정 높이 */
  overflow: hidden;
}

#u2bee-iframe {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
}
```

**특징**:
- ✅ **고정 크기**: 800x600px로 고정
- ✅ **절대 위치**: iframe이 부모를 완전히 덮음
- ✅ **크기 변화 없음**: 창 크기 변경 시에도 iframe 내부만 반응

**동적 조정**:
- ExtensionPage 내부는 Flexbox로 레이아웃 구성
- 탭 패널이 `flex: 1`로 남은 공간 차지
- 고정된 팝업 창 크기에 맞춰 내부 레이아웃만 조정

---

### 2. Side Panel 모드

**파일**: `NEXA-Desktop/U2BEE V3/sidepanel.html`

**크기 설정**:
```css
body {
  width: 100%;
  height: 100vh;  /* 뷰포트 높이에 맞춤 */
  overflow: hidden;
}

#u2bee-iframe {
  width: 100%;
  height: 100%;
}
```

**CSS 스타일** (`u2bee-layout.scss`):
```scss
body {
  padding: 30px;
  
  &.sidepanel-mode {
    padding: 20px 12px;  /* 패딩 축소 */
  }
}
```

**특징**:
- ✅ **동적 높이**: `100vh`로 뷰포트 높이에 맞춤
- ✅ **동적 너비**: Side Panel의 너비에 따라 자동 조정
- ✅ **패딩 조정**: 모드별로 다른 패딩 적용

**동적 조정**:
- Side Panel 크기 변경 시 자동으로 반응
- `100vh` 사용으로 높이 자동 조정
- Flexbox 레이아웃으로 내부 요소 자동 배치

---

### 3. Injected 모드 (가장 복잡)

**파일**: `NEXA-Platform/src/components/extension/u2bee/InjectedFloatingTabs.vue`

**크기 설정**:
```scss
.multi-direction-tabs-container {
  height: 100vh;           /* 뷰포트 높이 */
  padding-top: 30vh;       /* 시작 위치: 화면 중앙 부근 */
  align-items: flex-start;  /* 상단 정렬 */
  justify-content: flex-end; /* 우측 정렬 */
}

.u2bee-container.injected-layout {
  height: 100vh;
  min-height: 100vh;
  overflow: hidden;
  align-items: center;
}
```

**특징**:
- ✅ **뷰포트 기반**: `100vh`로 전체 화면 높이 사용
- ✅ **드래그 가능**: 탭 위치를 드래그로 조정 가능
- ✅ **동적 제한**: `window.innerHeight * 0.45`로 이동 범위 제한

---

## 🎯 동적 크기 조정 메커니즘

### 1. 뷰포트 기반 크기 계산

**위치**: `InjectedFloatingTabs.vue`

```javascript
// 드래그 이동 범위 제한 계산
const handleMouseMove = (e) => {
  if (!isDragging.value) return
  const deltaY = e.clientY - dragStartY.value
  const newPos = dragStartPosition.value + deltaY

  // 뷰포트 높이의 45%를 이동 범위로 제한
  const limit = window.innerHeight * 0.45
  titlePosition.value = Math.max(-limit, Math.min(limit, newPos))
}
```

**동작 방식**:
1. **실시간 계산**: `window.innerHeight`를 사용하여 현재 뷰포트 높이 감지
2. **비율 기반 제한**: 뷰포트 높이의 45%를 상하 이동 범위로 설정
3. **동적 조정**: 창 크기 변경 시 자동으로 제한 범위 재계산

**예시**:
- 뷰포트 높이: 1000px → 이동 범위: ±450px
- 뷰포트 높이: 800px → 이동 범위: ±360px
- 뷰포트 높이: 1200px → 이동 범위: ±540px

---

### 2. CSS Viewport 단위 (vh/vw) 사용

**위치**: `u2bee-layout.scss`, `InjectedFloatingTabs.vue`

```scss
// 뷰포트 높이 단위 사용
.multi-direction-tabs-container {
  height: 100vh;        /* 뷰포트 높이의 100% */
  padding-top: 30vh;    /* 뷰포트 높이의 30% */
}

.u2bee-container.injected-layout {
  height: 100vh;
  min-height: 100vh;
}
```

**특징**:
- ✅ **자동 반응**: 브라우저 창 크기 변경 시 자동으로 재계산
- ✅ **비율 유지**: 뷰포트 비율에 따라 일관된 레이아웃 유지
- ✅ **CSS 네이티브**: JavaScript 없이도 자동 크기 조정

---

### 3. Flexbox 기반 동적 레이아웃

**위치**: `u2bee-layout.scss`

```scss
.u2bee-container {
  display: flex;
  flex-direction: column;  /* 세로 방향 */
  
  .header-section {
    flex-shrink: 0;  /* 고정 크기 */
  }
  
  .u2bee-tabs {
    flex-shrink: 0;  /* 고정 크기 */
  }
  
  .u2bee-panels {
    flex: 1;         /* 남은 공간 모두 차지 */
    min-height: 0;  /* 오버플로우 허용 */
  }
}
```

**동작 방식**:
1. **헤더/탭**: `flex-shrink: 0`으로 고정 크기 유지
2. **탭 패널**: `flex: 1`로 남은 공간 자동 차지
3. **자동 조정**: 컨테이너 크기 변경 시 패널만 자동 확장/축소

---

### 4. 드래그 기반 위치 조정

**위치**: `InjectedFloatingTabs.vue`

```javascript
// 드래그 시작
const startDrag = (e) => {
  isDragging.value = true
  dragStartY.value = e.clientY
  dragStartPosition.value = titlePosition.value
}

// 드래그 중
const handleMouseMove = (e) => {
  const deltaY = e.clientY - dragStartY.value
  const newPos = dragStartPosition.value + deltaY
  const limit = window.innerHeight * 0.45
  titlePosition.value = Math.max(-limit, Math.min(limit, newPos))
}

// 드래그 종료
const handleMouseUp = (e) => {
  if (dist < DRAG_THRESHOLD) {
    isTabsVisible.value = !isTabsVisible.value  // 탭 토글
  } else {
    savePos()  // 위치 저장
  }
}
```

**동작 방식**:
1. **드래그 감지**: `mousedown` 이벤트로 드래그 시작
2. **실시간 업데이트**: `mousemove` 이벤트로 위치 실시간 계산
3. **범위 제한**: `window.innerHeight * 0.45`로 이동 범위 제한
4. **위치 저장**: `localStorage`에 위치 저장하여 다음 로드 시 복원

**Transform 사용**:
```vue
<div class="tabs-wrapper" :style="{ transform: `translateY(${titlePosition}px)` }">
```
- `transform: translateY()` 사용으로 GPU 가속 활용
- `will-change: transform`으로 성능 최적화

---

## 🔄 크기 변화 흐름도

### Popup 모드
```
Extension Popup 창 (800x600px 고정)
  └─ iframe (100% x 100%)
      └─ ExtensionPage
          └─ Flexbox 레이아웃
              ├─ Header (flex-shrink: 0)
              ├─ Tabs (flex-shrink: 0)
              └─ Panels (flex: 1) ← 동적 크기 조정
```

### Side Panel 모드
```
Chrome Side Panel (동적 너비 x 100vh)
  └─ iframe (100% x 100%)
      └─ ExtensionPage
          └─ Flexbox 레이아웃
              ├─ Header (flex-shrink: 0)
              ├─ Tabs (flex-shrink: 0)
              └─ Panels (flex: 1) ← 동적 크기 조정
```

### Injected 모드
```
웹 페이지 (전체 화면)
  └─ Shadow DOM
      └─ iframe (80px x 100vh)
          └─ ExtensionPage
              └─ InjectedFloatingTabs
                  └─ 드래그 가능한 탭 (window.innerHeight * 0.45 범위)
```

---

## 📊 크기 계산 공식

### 1. Injected 모드 탭 이동 범위

```
이동 범위 = ±(window.innerHeight × 0.45)

예시:
- 뷰포트 높이: 1000px → 이동 범위: -450px ~ +450px
- 뷰포트 높이: 800px → 이동 범위: -360px ~ +360px
```

### 2. 탭 패널 높이 계산 (Popup/Side Panel)

```
패널 높이 = 컨테이너 높이 - 헤더 높이 - 탭 높이

CSS로 자동 계산:
- 컨테이너: height: 100vh 또는 고정 높이
- 헤더: flex-shrink: 0 (고정)
- 탭: flex-shrink: 0 (고정)
- 패널: flex: 1 (남은 공간)
```

### 3. 시작 위치 계산 (Injected 모드)

```
시작 위치 = 뷰포트 높이 × 0.3 (30vh)

CSS:
padding-top: 30vh;  /* 화면 중앙 부근에서 시작 */
```

---

## 🎨 CSS 변수 및 동적 스타일

### 1. 모드별 Body 클래스

**위치**: `ExtensionPage.vue`

```javascript
// 모드 변경 시 body 클래스 업데이트
watch(currentMode, (mode) => {
  document.body.classList.remove('injected-mode', 'sidepanel-mode')
  
  if (mode === 'injected') {
    document.body.classList.add('injected-mode')
  } else if (mode === 'sidepanel') {
    document.body.classList.add('sidepanel-mode')
  }
})
```

**스타일 적용**:
```scss
body {
  padding: 30px;
  
  &.injected-mode {
    padding: 0;
    overflow: hidden;
    background: transparent;
  }
  
  &.sidepanel-mode {
    padding: 20px 12px;  /* 패딩 축소 */
  }
}
```

---

### 2. 동적 Transform 적용

**위치**: `InjectedFloatingTabs.vue`

```vue
<div class="tabs-wrapper" :style="{ transform: `translateY(${titlePosition}px)` }">
```

**특징**:
- ✅ **반응형 바인딩**: Vue의 반응형 데이터로 실시간 업데이트
- ✅ **GPU 가속**: `transform` 사용으로 성능 최적화
- ✅ **부드러운 애니메이션**: CSS transition과 함께 사용 가능

---

## 🔧 주요 기능 상세 분석

### 1. 드래그 위치 제한 로직

**코드 위치**: `InjectedFloatingTabs.vue:60-68`

```javascript
const handleMouseMove = (e) => {
  if (!isDragging.value) return
  const deltaY = e.clientY - dragStartY.value
  const newPos = dragStartPosition.value + deltaY

  // 뷰포트 내에서만 움직이도록 제한
  const limit = window.innerHeight * 0.45
  titlePosition.value = Math.max(-limit, Math.min(limit, newPos))
}
```

**동작 원리**:
1. **델타 계산**: 마우스 이동 거리(`deltaY`) 계산
2. **새 위치 계산**: 시작 위치 + 이동 거리
3. **범위 제한**: `Math.max(-limit, Math.min(limit, newPos))`로 제한
4. **실시간 반영**: `titlePosition.value` 업데이트로 즉시 반영

**제한 범위 계산**:
- 상한: `+window.innerHeight * 0.45`
- 하한: `-window.innerHeight * 0.45`
- 중앙 기준: `0` (초기 위치)

---

### 2. 위치 저장/로드

**코드 위치**: `InjectedFloatingTabs.vue:47-51`

```javascript
const STORAGE_KEY = 'u2bee_title_position'

const loadPos = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) titlePosition.value = parseInt(saved, 10)
}

const savePos = () => {
  localStorage.setItem(STORAGE_KEY, titlePosition.value.toString())
}
```

**동작 방식**:
- **저장**: 드래그 종료 시 `localStorage`에 위치 저장
- **로드**: 컴포넌트 마운트 시 저장된 위치 복원
- **영구 저장**: 브라우저를 닫아도 위치 유지

---

### 3. 탭 토글 기능

**코드 위치**: `InjectedFloatingTabs.vue:70-80`

```javascript
const handleMouseUp = (e) => {
  if (!isDragging.value) return
  const dist = Math.abs(e.clientY - dragStartY.value)
  isDragging.value = false

  if (dist < DRAG_THRESHOLD) {
    // 이동 거리가 5px 미만이면 클릭으로 간주 → 탭 토글
    isTabsVisible.value = !isTabsVisible.value
  } else {
    // 이동 거리가 5px 이상이면 드래그로 간주 → 위치 저장
    savePos()
  }
}
```

**동작 방식**:
- **클릭 감지**: 이동 거리가 5px 미만이면 클릭으로 간주
- **드래그 감지**: 이동 거리가 5px 이상이면 드래그로 간주
- **토글 기능**: 클릭 시 탭 표시/숨김 토글

---

## 📐 레이아웃 구조 분석

### 1. Injected 모드 레이아웃

```
.multi-direction-tabs-container (100vh, flex)
  ├─ padding-top: 30vh (시작 위치)
  ├─ align-items: flex-start (상단 정렬)
  ├─ justify-content: flex-end (우측 정렬)
  └─ .tabs-section (80px 고정 너비)
      └─ .tabs-wrapper (transform: translateY())
          ├─ .title-container (60px 고정, 드래그 가능)
          └─ .tabs-container (flex-direction: column)
              └─ .tab-button (42x42px, active 시 50x36px)
```

**특징**:
- **고정 너비**: 탭 섹션은 80px 고정
- **동적 높이**: 뷰포트 높이에 맞춤
- **드래그 가능**: 타이틀 컨테이너를 드래그하여 위치 조정

---

### 2. Popup/Side Panel 모드 레이아웃

```
.u2bee-container (flex, flex-direction: column)
  ├─ .header-section (flex-shrink: 0, 고정)
  ├─ .u2bee-tabs (flex-shrink: 0, 고정)
  └─ .u2bee-panels (flex: 1, 동적)
      └─ 탭 패널 내용
```

**특징**:
- **Flexbox 기반**: 세로 방향 Flexbox 레이아웃
- **고정 헤더/탭**: 상단 요소는 고정 크기
- **동적 패널**: 하단 패널만 남은 공간 차지

---

## 🎯 크기 변화 트리거

### 1. 창 크기 변경 (자동)

**CSS 기반 자동 조정**:
- `100vh`, `100vw` 단위 사용 시 브라우저가 자동으로 재계산
- Flexbox 레이아웃이 자동으로 재배치
- JavaScript 이벤트 리스너 불필요

**예시**:
```scss
.container {
  height: 100vh;  /* 창 크기 변경 시 자동 재계산 */
  width: 100%;    /* 부모 너비에 맞춤 */
}
```

---

### 2. 드래그 이벤트 (수동)

**이벤트 흐름**:
```
mousedown → mousemove (반복) → mouseup
    ↓           ↓              ↓
  시작       위치 계산        저장/토글
```

**실시간 업데이트**:
- `mousemove` 이벤트마다 위치 재계산
- `titlePosition.value` 업데이트로 즉시 반영
- Vue의 반응형 시스템으로 DOM 자동 업데이트

---

### 3. 모드 변경 (프로그래밍)

**트리거**:
- URL query parameter 변경
- Extension에서 모드 전환 메시지 수신

**동작**:
```javascript
// 모드 변경 감지
watch(currentMode, (mode) => {
  // Body 클래스 업데이트
  document.body.classList.remove('injected-mode', 'sidepanel-mode')
  if (mode === 'injected') {
    document.body.classList.add('injected-mode')
  }
  
  // 레이아웃 자동 변경 (Vue 템플릿 조건부 렌더링)
})
```

---

## 🔍 성능 최적화 기법

### 1. GPU 가속 활용

```scss
.tabs-wrapper {
  will-change: transform;  /* 브라우저에 변경 예고 */
  transform: translateY(); /* GPU 가속 사용 */
}
```

**효과**:
- `transform` 사용으로 GPU 레이어 생성
- `will-change`로 브라우저 최적화 힌트 제공
- 부드러운 애니메이션 및 드래그 성능

---

### 2. 이벤트 리스너 최적화

```javascript
// 전역 이벤트 리스너 (성능 고려)
window.addEventListener('mousemove', handleMouseMove, { passive: false })
window.addEventListener('mouseup', handleMouseUp)
```

**특징**:
- 전역 리스너로 모든 마우스 이동 감지
- `passive: false`로 `preventDefault()` 사용 가능
- 컴포넌트 언마운트 시 자동 정리

---

### 3. 반응형 데이터 최적화

```javascript
// Vue 반응형 시스템 활용
const titlePosition = ref(0)  // 반응형 데이터

// 스타일 바인딩으로 자동 업데이트
:style="{ transform: `translateY(${titlePosition}px)` }"
```

**효과**:
- 변경된 부분만 DOM 업데이트
- 불필요한 리렌더링 방지
- Vue의 효율적인 가상 DOM 활용

---

## 📝 요약

### 동적 크기 조정 방식

1. **CSS Viewport 단위 (vh/vw)**
   - 브라우저가 자동으로 재계산
   - JavaScript 없이도 반응형 동작

2. **Flexbox 레이아웃**
   - `flex: 1`로 남은 공간 자동 차지
   - `flex-shrink: 0`으로 고정 크기 유지

3. **JavaScript 동적 계산**
   - `window.innerHeight`로 뷰포트 크기 감지
   - 드래그 위치 제한 계산

4. **Transform 기반 위치 조정**
   - GPU 가속 활용
   - 부드러운 애니메이션

### 모드별 차이점

| 모드 | 크기 방식 | 동적 조정 | 특징 |
|------|----------|----------|------|
| **Popup** | 고정 (800x600px) | 내부 레이아웃만 | Extension 창 크기 고정 |
| **Side Panel** | 동적 (너비 x 100vh) | 전체 반응형 | Chrome Side Panel 크기에 맞춤 |
| **Injected** | 동적 (80px x 100vh) | 드래그 가능 | 웹 페이지에 주입, 위치 조정 가능 |

---

**마지막 업데이트**: 2024년 12월
