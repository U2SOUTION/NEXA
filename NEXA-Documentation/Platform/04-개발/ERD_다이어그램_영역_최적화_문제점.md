# ERD 다이어그램 영역 최적화 문제점

## 📋 개요

ERD 다이어그램이 부모 컨테이너 영역에 최적화되지 않는 문제와 관련된 현재 상태 및 해결 방향을 정리한 문서입니다.

---

## 🔴 현재 문제점

### 1. 영역 최적화 문제

#### 1.1 가로 크기

-   ✅ **상태**: 가로는 부모 컨테이너에 꽉 차도록 최적화되어 있음
-   ✅ **동작**: 브라우저 크기 변경 시 가로도 자동으로 조정됨

#### 1.2 세로 높이

-   ❌ **문제**: 높이가 부모 컨테이너의 실제 높이에 맞춰지지 않음
-   ❌ **증상**:
    -   브라우저를 키우면 세로도 커지면서 다이어그램이 확장됨
    -   페이지 스크롤이 불가능해짐 (휠 스크롤 시 다이어그램 줌이 먼저 작동)
-   ❌ **원인**:
    -   컨테이너 높이가 부모 컨테이너의 실제 높이를 감지하지 못함
    -   하드코딩된 값들이 있어서 동적 조정이 어려움

### 2. 스크롤/줌 충돌 문제

-   ❌ **문제**: 휠 마우스로 페이지 스크롤이 불가능
-   ❌ **원인**: 다이어그램 내부의 줌 기능이 휠 이벤트를 먼저 캡처
-   ❌ **요구사항**:
    -   다이어그램은 줌 기능이 있으니 휠로 별도 사용
    -   부모가 높이가 작다면 다이어그램은 잘려나가고 휠로 페이지를 스크롤할 수 있는 영역이 보여야 함

### 3. 재사용성 문제

-   ❌ **문제**: 하드코딩된 값들이 있어서 다양한 환경에서 재사용하기 어려움
-   ❌ **원인**:
    -   컨테이너 크기 계산 로직이 복잡하고 환경 의존적
    -   부모 컨테이너를 직접 조작하는 로직이 포함됨
-   ❌ **요구사항**:
    -   데이터만 넘기고 재사용 가능하도록
    -   각자 자신의 영역에 꽉 맞도록
    -   재사용하는 곳에서 크기를 지정하거나, 크기 지정값이 없으면 부모 영역에 최적화되어야 함

---

## 🎯 해결 방향

### 1. 영역 최적화

#### 1.1 가로 크기 (현재 유지)

-   ✅ 부모 컨테이너의 실제 사용 가능한 너비 감지
-   ✅ 패딩을 제외한 실제 너비 계산
-   ✅ 컨테이너 너비를 부모에 맞춤

#### 1.2 세로 높이 (수정 필요)

-   🔄 부모 컨테이너의 실제 사용 가능한 높이 감지
-   🔄 패딩을 제외한 실제 높이 계산
-   🔄 컨테이너 높이를 부모에 맞춤
-   🔄 부모 높이가 작으면 다이어그램이 잘려도 됨 (overflow 처리)

### 2. 스크롤/줌 분리

-   🔄 다이어그램 내부 휠: 줌 기능 (Ctrl/Cmd + 휠 또는 특정 조건)
-   🔄 페이지 휠: 일반 스크롤 (다이어그램 영역 밖 또는 기본 동작)
-   🔄 부모 높이가 작으면 페이지 스크롤 가능한 영역 보장

### 3. 재사용 가능한 구조

-   🔄 하드코딩된 값 제거
-   🔄 컨테이너 크기를 동적으로 감지하고 부모에 맞춤
-   🔄 크기 지정 옵션 추가 (재사용 시 크기 지정 가능)
-   🔄 크기 지정값이 없으면 부모 영역에 자동 최적화
-   🔄 ResizeObserver 등을 사용하여 컨테이너 크기 변경에 자동 반응

---

## 📝 현재 코드 상태

### 관련 파일

1. **`NEXA-Platform/src/diagram/erd/ERDDiagram.js`**

    - `renderERD()` 함수의 `setTimeout` 내부에서 초기 줌 설정
    - 현재: `fitToScreen(svg, svgGroup, containerWidth, containerHeight, zoom)` 호출
    - 문제: 부모 컨테이너의 실제 크기를 감지하지 못함

2. **`NEXA-Platform/src/diagram/utils/diagramZoom.js`**

    - `fitToScreen()` 함수에서 스케일 계산
    - 현재: `containerWidth`, `containerHeight` 파라미터 사용
    - 문제: 실제 컨테이너 크기와 다를 수 있음

3. **`NEXA-Platform/src/diagram/NexaDiagram.vue`**
    - 다이어그램 래퍼 컴포넌트
    - 현재: `.nexa-diagram-container`에 `width: 100%`, `height: 100%` 설정
    - 문제: 부모 컨테이너의 실제 크기를 반영하지 못함

---

## 🔧 수정 필요 사항

### 1. 부모 컨테이너 크기 감지

```javascript
// 부모 컨테이너의 실제 사용 가능한 크기 계산
const parentContainer = container.parentElement;
if (parentContainer) {
    const parentRect = parentContainer.getBoundingClientRect();
    const parentStyle = window.getComputedStyle(parentContainer);
    const parentPaddingLeft = parseFloat(parentStyle.paddingLeft) || 0;
    const parentPaddingRight = parseFloat(parentStyle.paddingRight) || 0;
    const parentPaddingTop = parseFloat(parentStyle.paddingTop) || 0;
    const parentPaddingBottom = parseFloat(parentStyle.paddingBottom) || 0;

    const parentAvailableWidth = parentRect.width - parentPaddingLeft - parentPaddingRight;
    const parentAvailableHeight = parentRect.height - parentPaddingTop - parentPaddingBottom;

    // 컨테이너 크기를 부모에 맞춤
    container.style.setProperty("width", `${parentAvailableWidth}px`, "important");
    container.style.setProperty("height", `${parentAvailableHeight}px`, "important");
}
```

### 2. 동적 크기 조정

-   ResizeObserver를 사용하여 부모 컨테이너 크기 변경 감지
-   크기 변경 시 `fitToScreen()` 재호출

### 3. 줌/휠 이벤트 분리

-   Ctrl/Cmd + 휠: 다이어그램 줌
-   일반 휠: 페이지 스크롤 (다이어그램 영역 밖 또는 특정 조건)

---

## 📌 참고 사항

-   현재 하드코딩된 값들은 임시 테스트용이었음
-   모든 하드코딩은 제거해야 함
-   재사용 가능한 구조로 리팩토링 필요
-   각 사용 환경에서 자동으로 적응하도록 구현

---

**작성일**: 2024년 12월  
**상태**: 문제점 정리 완료, 해결 대기 중
