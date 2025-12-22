# ESC 키 사용 현황 분석

## 현재 ESC 키를 사용하는 곳

### 1. `useMultiSelection.js` (새로 추가됨)
- **용도**: 멀티 셀렉션 해제
- **등록 방식**: 일반 phase (`window.addEventListener('keydown', ...)`)
- **우선순위**: 낮음 (다른 핸들러가 먼저 처리할 수 있음)
- **조건**: 멀티 셀렉션 모드이거나 선택된 항목이 있을 때만 처리

### 2. `useTableKeyboard.js`
- **용도**: 사이드바 상세 뷰 해제 또는 멀티 셀렉션 해제
- **등록 방식**: Capture phase (`window.addEventListener('keydown', ..., true)`)
- **우선순위**: 높음 (capture phase이므로 먼저 실행)
- **조건**: 
  - 사이드바 상세 뷰가 활성화되어 있으면 해제
  - 그렇지 않으면 멀티 셀렉션 해제 (`clearSelection` 함수 사용)

### 3. `DevelopmentPage.vue`
- **용도**: 편집 모드 종료
- **등록 방식**: 일반 phase
- **우선순위**: 중간
- **조건**: 편집 모드일 때만 처리, 그렇지 않으면 이벤트 전파

### 4. `modalSystemStore.js`
- **용도**: 모달 닫기
- **등록 방식**: 일반 phase
- **우선순위**: 높음 (모달이 열려있을 때)
- **조건**: `activeModalId`가 있을 때만 처리

## 문제점

1. **중복 처리**: `useMultiSelection`과 `useTableKeyboard`가 둘 다 멀티 셀렉션 해제를 시도
2. **우선순위 불명확**: capture phase와 일반 phase가 섞여 있어 실행 순서가 예측하기 어려움
3. **충돌 가능성**: 여러 핸들러가 동시에 실행될 수 있음

## 권장 우선순위

1. **모달 닫기** (최우선)
   - 모달이 열려있을 때는 모달을 먼저 닫아야 함
   - `modalSystemStore.js`가 처리

2. **편집 모드 종료**
   - 편집 모드일 때는 편집 모드를 먼저 종료
   - `DevelopmentPage.vue`가 처리

3. **사이드바 상세 뷰 해제**
   - 사이드바 상세 뷰가 활성화되어 있으면 해제
   - `useTableKeyboard.js`가 처리

4. **멀티 셀렉션 해제** (최하위)
   - 위의 모든 조건이 아닐 때만 처리
   - `useMultiSelection.js` 또는 `useTableKeyboard.js`가 처리

## 해결 방안

### 옵션 1: `useTableKeyboard`에서 `useMultiSelection` 사용 시 ESC 키 처리 제거
- `useTableKeyboard`는 `useMultiSelection`의 `clearSelection`을 받아서 사용
- `useMultiSelection`이 이미 ESC 키를 처리하므로 `useTableKeyboard`에서는 제거

### 옵션 2: `useMultiSelection`의 ESC 키 처리를 capture phase로 변경
- 우선순위를 높여서 먼저 처리
- 하지만 모달이나 편집 모드보다는 낮아야 함

### 옵션 3: 통합 ESC 키 핸들러 생성
- 모든 ESC 키 처리를 하나의 핸들러로 통합
- 우선순위에 따라 순차적으로 처리

## 권장 사항

**옵션 1을 권장합니다:**
- `useTableKeyboard`는 `useMultiSelection`과 함께 사용될 때 ESC 키 처리를 하지 않도록 수정
- `useMultiSelection`이 범용적으로 사용되므로 여기서 ESC 키를 처리하는 것이 적절
- `useTableKeyboard`는 테이블 전용 기능(사이드바 상세 뷰 해제 등)만 처리

