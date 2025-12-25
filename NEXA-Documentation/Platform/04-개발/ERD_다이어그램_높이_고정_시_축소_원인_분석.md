# ERD 다이어그램 높이 고정 시 축소 원인 분석

## 📋 개요

`NexaDiagram.vue`의 `.nexa-diagram-container` 높이를 `height: 100%`에서 `height: 300px`로 고정했을 때 다이어그램이 전체적으로 작아지는 원인을 분석한 문서입니다.

---

## 🔍 원인 분석

### 1. 스케일 계산 로직

**`diagramZoom.js`의 `fitToScreen()` 함수:**

```javascript
const scale = Math.min(width / fullWidth, height / fullHeight) * 0.9;
```

이 공식은 **가로/세로 비율 중 더 작은 값을 선택**하여 다이어그램이 컨테이너 안에 완전히 들어가도록 합니다.

### 2. 높이 고정 시 발생하는 문제

#### 2.1 높이가 100%일 때 (예시)

```
노드 영역 크기: width = 1200px, height = 500px
컨테이너 크기: width = 1000px, height = 1000px (부모의 100%)

scaleX = 1000 / 1200 = 0.833
scaleY = 1000 / 500 = 2.0

scale = Math.min(0.833, 2.0) * 0.9 = 0.75
```

→ **가로 기준으로 스케일이 결정됨** (0.833이 더 작으므로)

#### 2.2 높이가 300px로 고정될 때 (예시)

```
노드 영역 크기: width = 1200px, height = 500px
컨테이너 크기: width = 1000px, height = 300px (고정)

scaleX = 1000 / 1200 = 0.833
scaleY = 300 / 500 = 0.6

scale = Math.min(0.833, 0.6) * 0.9 = 0.54
```

→ **세로 기준으로 스케일이 결정됨** (0.6이 더 작으므로)

### 3. 문제의 핵심

1. **높이가 작아지면 `scaleY`가 작아짐**

    - `scaleY = containerHeight / fullHeight`
    - 컨테이너 높이가 300px로 고정되면 `scaleY`가 크게 감소

2. **`Math.min()`으로 인해 작은 스케일이 선택됨**

    - `scaleX`와 `scaleY` 중 더 작은 값이 선택됨
    - `scaleY`가 작아지면 최종 스케일도 작아짐

3. **결과적으로 다이어그램이 작게 표시됨**
    - 전체 다이어그램이 0.54배로 축소됨 (위 예시 기준)
    - 가로도 세로도 모두 작아짐

---

## 📊 실제 동작 흐름

### 코드 실행 순서

1. **`NexaDiagram.vue`** (CSS)

    ```scss
    .nexa-diagram-container {
        height: 300px; // 고정 높이
    }
    ```

2. **`ERDDiagram.js`** (`renderERD()`)

    ```javascript
    const containerWidth = container.clientWidth || 800;
    const containerHeight = container.clientHeight || 600;
    // container.clientHeight는 CSS에서 300px로 고정되어 있으므로 300이 됨
    ```

3. **`diagramZoom.js`** (`fitToScreen()`)

    ```javascript
    const scaleX = width / fullWidth; // 예: 1000 / 1200 = 0.833
    const scaleY = height / fullHeight; // 예: 300 / 500 = 0.6
    const scale = Math.min(scaleX, scaleY) * 0.9; // Math.min(0.833, 0.6) * 0.9 = 0.54
    ```

4. **결과**
    - 다이어그램이 0.54배로 축소되어 표시됨
    - 가로/세로 모두 작아짐

---

## 🎯 해결 방안

### 방안 1: 가로 우선 스케일 계산 (현재 요구사항)

높이가 작아도 가로를 우선적으로 꽉 차게 표시:

```javascript
// 가로를 우선적으로 꽉차게
const scale =
    scaleX < scaleY
        ? scaleX * 0.98 // 가로 우선: 가로를 꽉 차게
        : scaleY * 0.98; // 세로 우선: 세로를 꽉 차게
```

이렇게 하면:

-   높이가 300px로 작아도 가로는 꽉 차게 표시됨
-   세로는 잘려나가도 됨 (overflow 처리)

### 방안 2: 높이를 부모에 맞춤 (최종 목표)

하드코딩된 300px를 제거하고 부모 컨테이너의 실제 높이 사용:

```javascript
// 부모 컨테이너의 실제 높이 감지
const parentContainer = container.parentElement;
if (parentContainer) {
    const parentRect = parentContainer.getBoundingClientRect();
    const parentStyle = window.getComputedStyle(parentContainer);
    const parentPaddingTop = parseFloat(parentStyle.paddingTop) || 0;
    const parentPaddingBottom = parseFloat(parentStyle.paddingBottom) || 0;

    const parentAvailableHeight = parentRect.height - parentPaddingTop - parentPaddingBottom;

    // 컨테이너 높이를 부모에 맞춤
    container.style.setProperty("height", `${parentAvailableHeight}px`, "important");
}
```

---

## 📌 요약

**원인:**

-   높이를 300px로 고정 → `scaleY` 감소 → `Math.min(scaleX, scaleY)`로 인해 최종 스케일 감소 → 다이어그램 축소

**해결:**

1. **단기**: 가로 우선 스케일 계산으로 변경 (높이가 작아도 가로는 꽉 차게)
2. **장기**: 하드코딩 제거, 부모 컨테이너 높이에 자동 맞춤

---

**작성일**: 2024년 12월  
**관련 문서**: [ERD*다이어그램*영역*최적화*문제점.md](./ERD_다이어그램_영역_최적화_문제점.md)
