# 멀티 셀렉션 컴포넌트 분석 및 개선 방안

## 질문 1: 액션 바 별도 컴포넌트의 디자인 자유도

### 현재 상황
- **PartClassesView**: `TableFilterBar` 내부에 `PartClassesActionsBar`가 슬롯으로 통합됨
- **DocumentListSidebar**: 상단에 별도 액션 영역 없음 (파일 선택 시 DevelopmentPage 상단에 표시)
- 각 페이지마다 고유한 액션 바 구조와 디자인이 이미 존재

### 문제점
1. **위치 충돌**: `MultiSelectionBar`를 별도로 만들면 기존 액션 바와 위치가 겹칠 수 있음
2. **디자인 불일치**: 각 페이지의 고유한 디자인과 통합하기 어려움
3. **중복 UI**: 액션 버튼이 두 곳에 나타날 수 있음

### 개선 방안

#### 방안 A: 기존 액션 바에 통합 (권장)
```vue
<!-- PartClassesActionsBar.vue -->
<template>
  <div class="part-classes-actions-bar">
    <!-- 멀티 셀렉션 상태 표시 (조건부) -->
    <div v-if="multiSelectMode || selectedCount > 0" class="multi-selection-indicator">
      <q-icon name="check_circle" />
      <span>{{ selectedCount }}개 선택됨</span>
    </div>
    
    <!-- 기존 액션 바 내용 -->
    <ViewModeSelector ... />
    <q-btn-dropdown ... />
  </div>
</template>
```

**장점**:
- 기존 디자인과 자연스럽게 통합
- 각 페이지의 고유한 레이아웃 유지
- UI 중복 없음

**단점**:
- 각 페이지마다 개별 구현 필요
- 공용 컴포넌트의 이점이 줄어듦

#### 방안 B: 슬롯 기반 통합 컴포넌트
```vue
<!-- MultiSelectionBar.vue 개선 -->
<template>
  <div v-if="show" class="multi-selection-bar">
    <!-- 선택 개수 표시 -->
    <div class="selected-count">{{ selectedCount }}개 선택됨</div>
    
    <!-- 슬롯: 기존 액션 바에 통합 가능 -->
    <slot name="integrated-actions">
      <!-- 기본 액션 버튼들 -->
    </slot>
  </div>
</template>
```

**장점**:
- 기존 액션 바에 멀티 셀렉션 상태만 추가 가능
- 유연한 통합 방식

**단점**:
- 여전히 위치 문제 발생 가능

#### 방안 C: 상태만 제공하는 Composable (최종 권장)
```javascript
// useMultiSelectionActions.js
export function useMultiSelectionActions(selectedCount, multiSelectMode) {
  const showActions = computed(() => multiSelectMode.value || selectedCount.value > 0)
  
  return {
    showActions,
    selectedCount,
    // 각 페이지에서 자체 액션 바에 통합
  }
}
```

**장점**:
- 각 페이지의 기존 액션 바 구조 유지
- 상태만 공유하고 UI는 각자 구현
- 최대한의 디자인 자유도

**단점**:
- UI 컴포넌트 재사용 불가
- 각 페이지마다 UI 구현 필요

### 결론 및 제안
**MultiSelectionBar.vue는 제거하고, 대신 상태 관리만 제공하는 composable로 변경**

---

## 질문 2: MultiSelectionItem.vue 통일의 제한사항

### 현재 상황
- **PartClassesView**: `DataCardRenderer`, `DataTableRenderer` 등 다양한 렌더러 사용
- 각 렌더러가 자체적인 선택 피드백 제공 (하이라이트, 체크박스 등)
- `MultiSelectionItem`은 `q-item` 전용 래퍼

### 문제점
1. **렌더러 호환성**: `q-item`이 아닌 렌더러와 호환 불가
   - `DataCardRenderer`: 카드 형태
   - `DataTableRenderer`: 테이블 행
   - `DataGalleryRenderer`: 갤러리 아이템
2. **기존 피드백과 충돌**: 각 렌더러의 자체 선택 피드백과 중복될 수 있음
3. **제한적 사용**: `q-item`을 사용하는 리스트에만 적용 가능

### 개선 방안

#### 방안 A: 렌더러별 별도 컴포넌트 (현재 구조 유지)
```javascript
// 각 렌더러가 자체 선택 피드백 제공
DataCardRenderer: selectedRows prop으로 선택 상태 관리
DataTableRenderer: selectedRows prop으로 선택 상태 관리
// MultiSelectionItem은 q-item 전용으로만 사용
```

**장점**:
- 각 렌더러의 고유한 디자인 유지
- 기존 구조와 호환

**단점**:
- 통일성 부족
- 코드 중복 가능

#### 방안 B: Mixin/Composable 패턴
```javascript
// useMultiSelectionState.js
export function useMultiSelectionState() {
  // 선택 상태 관리 로직만 제공
  // 각 렌더러가 이를 활용하여 자체 UI 구현
}
```

**장점**:
- 로직 재사용
- UI는 각 렌더러가 자유롭게 구현

**단점**:
- UI 통일성은 여전히 부족

#### 방안 C: MultiSelectionItem을 선택적 사용 (권장)
```vue
<!-- q-item 리스트에서만 사용 -->
<MultiSelectionItem v-for="item in items" ...>
  <!-- 내용 -->
</MultiSelectionItem>

<!-- 다른 렌더러는 기존 방식 유지 -->
<DataCardRenderer :selected-rows="selectedRows" ... />
<DataTableRenderer :selected-rows="selectedRows" ... />
```

**장점**:
- `q-item` 리스트에 빠르게 멀티 셀렉션 추가 가능
- 기존 렌더러는 영향 없음
- 각 렌더러의 고유한 디자인 유지

**단점**:
- 완전한 통일성은 없음

### 결론 및 제안
**MultiSelectionItem.vue는 `q-item` 전용으로 유지하고, 다른 렌더러는 기존 방식 유지**

---

## 질문 3: MultiSelectionSidebar.vue의 필요성과 UX 복잡도

### 현재 상황
- **PartClassesView**: 리스트에서 선택된 항목이 하이라이트로 표시됨
- **PartsManagementSidebar**: 선택된 항목들을 사이드바에 카드로 표시 (이미 구현됨)
- 리스트와 사이드바 양쪽에 선택 피드백이 있으면 중복될 수 있음

### 문제점
1. **정보 중복**: 리스트에 이미 선택 피드백이 있는데 사이드바에도 표시하면 중복
2. **UX 복잡도 증가**: 사용자가 두 곳을 확인해야 함
3. **화면 공간 낭비**: 사이드바가 추가 공간을 차지

### 개선 방안

#### 방안 A: 선택적 사용 (권장)
```vue
<!-- 기본적으로는 사용하지 않음 -->
<!-- 필요할 때만 사용 (예: 복잡한 작업이 필요한 경우) -->
<MultiSelectionSidebar
  v-if="needsDetailedView"
  :selected-items="selectedRows"
>
  <!-- 추가 정보 표시 -->
</MultiSelectionSidebar>
```

**사용 시나리오**:
- 선택된 항목이 많을 때 (10개 이상)
- 각 항목에 대한 상세 정보가 필요할 때
- 개별 작업이 필요한 경우

#### 방안 B: 확장된 기능 제공
```vue
<MultiSelectionSidebar
  :selected-items="selectedRows"
  :show-details="true"
  :show-actions="true"
  :group-by="groupByFunction"
>
  <template #item="{ item }">
    <!-- 기본 정보 -->
    <div class="item-name">{{ item.name }}</div>
    <!-- 추가 상세 정보 -->
    <div class="item-details">
      <div>생성일: {{ item.createdDate }}</div>
      <div>수정일: {{ item.modifiedDate }}</div>
      <div>상태: {{ item.status }}</div>
    </div>
  </template>
  
  <template #item-actions="{ item }">
    <!-- 개별 액션 버튼들 -->
    <q-btn icon="edit" @click="editItem(item)" />
    <q-btn icon="delete" @click="deleteItem(item)" />
  </template>
</MultiSelectionSidebar>
```

**추가 기능**:
1. **상세 정보 표시**: 리스트에는 없는 추가 정보 (메타데이터, 통계 등)
2. **그룹화**: 선택된 항목을 카테고리별로 그룹화
3. **정렬/필터**: 선택된 항목 내에서 정렬 및 필터링
4. **일괄 편집**: 선택된 항목들의 공통 필드 일괄 편집
5. **비교 기능**: 선택된 항목들을 나란히 비교

#### 방안 C: 조건부 표시
```javascript
// 선택된 항목이 많을 때만 표시
const showSidebar = computed(() => {
  return selectedCount.value > 5 // 5개 이상일 때만
})
```

### 결론 및 제안
**MultiSelectionSidebar.vue는 선택적 기능으로 유지하되, 다음과 같이 개선:**

1. **기본적으로는 숨김**: 리스트 피드백으로 충분한 경우
2. **조건부 표시**: 선택된 항목이 많거나 상세 정보가 필요할 때만 표시
3. **확장된 기능 제공**: 
   - 상세 정보 표시
   - 그룹화/정렬/필터
   - 개별 액션 버튼
   - 일괄 편집 기능

---

## 최종 권장사항

### 1. MultiSelectionBar.vue
**→ 제거하고 상태 관리 composable로 대체**
```javascript
// useMultiSelectionState.js
export function useMultiSelectionState(selectedCount, multiSelectMode) {
  return {
    showActions: computed(() => multiSelectMode.value || selectedCount.value > 0),
    selectedCount,
    // 각 페이지의 기존 액션 바에 통합
  }
}
```

### 2. MultiSelectionItem.vue
**→ q-item 전용으로 유지, 다른 렌더러는 기존 방식 유지**
- `q-item` 리스트: MultiSelectionItem 사용
- DataCardRenderer, DataTableRenderer 등: 기존 방식 유지

### 3. MultiSelectionSidebar.vue
**→ 선택적 기능으로 유지, 확장된 기능 추가**
- 기본적으로는 숨김
- 조건부 표시 (선택된 항목이 많을 때, 상세 정보가 필요할 때)
- 추가 기능: 상세 정보, 그룹화, 정렬, 개별 액션 등

---

## 수정된 컴포넌트 구조

```
src/components/common/
  ├── MultiSelectionItem.vue      # q-item 전용 (유지)
  └── MultiSelectionSidebar.vue    # 선택적 사용 (개선)

src/composables/
  └── useMultiSelectionState.js   # 상태 관리만 제공 (신규)
```

**MultiSelectionBar.vue는 제거하고, 각 페이지의 기존 액션 바에 멀티 셀렉션 상태를 통합하는 방식으로 변경**


