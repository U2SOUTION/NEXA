# 멀티 셀렉션 표준화 계획

## 개요

멀티 셀렉션 기능을 **특수한 경우**와 **보편적인 경우**로 분리하여 대응하고, 
**q-item 기준 표준화**를 통해 통일된 UI/UX를 제공합니다.

---

## 1. q-item에 대한 설명

### 1.1 q-item이란?

**q-item**은 Quasar Framework에서 제공하는 **리스트 아이템 컴포넌트**입니다.

```vue
<q-list>
  <q-item>아이템 1</q-item>
  <q-item>아이템 2</q-item>
  <q-item>아이템 3</q-item>
</q-list>
```

### 1.2 q-item의 특징

1. **표준화된 리스트 아이템**: Quasar의 일관된 디자인 시스템
2. **클릭 가능**: `clickable` prop으로 클릭 이벤트 지원
3. **섹션 구조**: `q-item-section`으로 아이콘, 아바타, 텍스트 등을 구조화
4. **활성 상태**: `active` prop으로 선택 상태 표시
5. **리플 효과**: `v-ripple` 디렉티브로 시각적 피드백

### 1.3 q-item 사용 예시

```vue
<template>
  <q-list>
    <q-item 
      clickable 
      v-ripple
      :active="selectedItem === item.id"
      @click="selectItem(item)"
    >
      <!-- 아이콘 섹션 -->
      <q-item-section avatar>
        <q-icon name="description" />
      </q-item-section>
      
      <!-- 메인 콘텐츠 -->
      <q-item-section>
        <q-item-label>{{ item.name }}</q-item-label>
        <q-item-label caption>{{ item.description }}</q-item-label>
      </q-item-section>
      
      <!-- 액션 섹션 -->
      <q-item-section side>
        <q-btn icon="more_vert" flat dense />
      </q-item-section>
    </q-item>
  </q-list>
</template>
```

### 1.4 q-item을 사용하는 곳

- **DocumentListSidebar**: 파일 목록
- **PartsManagementSidebar**: 부품 목록
- **일반적인 사이드바 리스트**: 대부분의 네비게이션 메뉴

### 1.5 q-item이 아닌 경우

- **DataCardRenderer**: 카드 형태 렌더러 (커스텀 구조)
- **DataTableRenderer**: 테이블 행 렌더러 (tr/td 구조)
- **DataGalleryRenderer**: 갤러리 형태 렌더러 (커스텀 구조)

---

## 2. 사용 케이스 분리

### 2.1 특수한 경우 (Custom Implementation)

**특징**:
- 복잡한 커스텀 UI/UX 요구사항
- 기존 렌더러와 통합 필요 (DataCardRenderer, DataTableRenderer 등)
- 페이지별 고유한 디자인

**구현 방식**:
```javascript
// useMultiSelection.js만 사용
import { useMultiSelection } from 'src/composables/useMultiSelection.js'

const {
  selectedRows,
  selectedCount,
  multiSelectMode,
  onRowClick,
  onRowMouseDown,
  onRowMouseUp,
  clearSelection,
} = useMultiSelection({
  items: filteredItems,
  onSelectionChange: (newSelectedRows) => {
    // 커스텀 로직
  },
})

// 자체 UI 구현
// - 기존 액션 바에 통합
// - 커스텀 디자인
// - 렌더러별 특화 처리
```

**예시**:
- PartClassesView (DataCardRenderer, DataTableRenderer 사용)
- 복잡한 대시보드 페이지
- 커스텀 레이아웃이 필요한 페이지

---

### 2.2 보편적인 경우 (Standard Implementation)

**특징**:
- q-item을 사용하는 표준 리스트
- 간단한 멀티 셀렉션 기능
- 통일된 UI/UX 필요

**구현 방식**:
```vue
<template>
  <!-- 표준 멀티 셀렉션 액션 바 -->
  <MultiSelectionBar
    :selected-count="selectedCount"
    :show="multiSelectMode || selectedCount > 0"
    :actions="standardActions"
    @clear-selection="clearSelection"
  />

  <!-- 표준 멀티 셀렉션 아이템 -->
  <q-list>
    <MultiSelectionItem
      v-for="item in items"
      :key="item.id"
      :item="item"
      :is-selected="isItemSelected(item)"
      :long-pressing-id="longPressingRowId"
      :show-checkbox="multiSelectMode || selectedCount > 0"
      @click="handleItemClick"
      @mousedown="handleItemMouseDown"
      @mouseup="handleItemMouseUp"
      @toggle="handleItemToggle"
    >
      <!-- q-item-section 구조 -->
      <q-item-section avatar>
        <q-icon :name="item.icon" />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ item.name }}</q-item-label>
      </q-item-section>
    </MultiSelectionItem>
  </q-list>
</template>

<script setup>
import { useMultiSelection } from 'src/composables/useMultiSelection.js'
import MultiSelectionBar from 'src/components/common/MultiSelectionBar.vue'
import MultiSelectionItem from 'src/components/common/MultiSelectionItem.vue'

// 표준 구현
const {
  selectedRows,
  selectedCount,
  multiSelectMode,
  longPressingRowId,
  onRowClick: handleItemClick,
  onRowMouseDown: handleItemMouseDown,
  onRowMouseUp: handleItemMouseUp,
  clearSelection,
} = useMultiSelection({
  items: items,
  onSelectionChange: (newSelectedRows) => {
    // 표준 로직
  },
})
</script>
```

**예시**:
- DocumentListSidebar (파일 목록)
- 간단한 설정 페이지
- 표준 사이드바 리스트

---

## 3. MultiSelectionBar.vue 표준화

### 3.1 표준 액션 바 구조

```vue
<!-- MultiSelectionBar.vue -->
<template>
  <div v-if="show" class="multi-selection-bar q-pa-sm">
    <div class="row items-center justify-between">
      <!-- 선택 개수 표시 -->
      <div class="selected-count row items-center q-gutter-xs">
        <q-icon name="check_circle" size="20px" color="primary" />
        <span class="text-weight-bold text-body1">{{ selectedCount }}개 선택됨</span>
      </div>

      <!-- 액션 버튼들 -->
      <div class="multi-actions row items-center q-gutter-xs">
        <!-- 슬롯: 커스텀 액션 -->
        <slot name="actions">
          <!-- 기본 액션 버튼들 -->
          <q-btn
            v-for="action in actions"
            :key="action.id"
            :icon="action.icon"
            :label="action.label"
            :color="action.color || 'primary'"
            flat
            dense
            @click="action.handler"
          />
        </slot>

        <!-- 선택 해제 버튼 -->
        <q-btn
          icon="close"
          label="선택 해제"
          flat
          dense
          color="grey-7"
          @click="handleClearSelection"
        />
      </div>
    </div>
  </div>
</template>
```

### 3.2 표준 액션 정의

```javascript
// 표준 액션 타입
const standardActions = [
  {
    id: 'delete',
    icon: 'delete',
    label: '삭제',
    color: 'negative',
    handler: () => handleDelete(),
  },
  {
    id: 'restore',
    icon: 'restore',
    label: '복원',
    color: 'primary',
    handler: () => handleRestore(),
  },
  // ...
]
```

### 3.3 사용 가이드

**보편적인 경우**:
```vue
<MultiSelectionBar
  :selected-count="selectedCount"
  :actions="standardActions"
  @clear-selection="clearSelection"
/>
```

**특수한 경우**:
```vue
<!-- MultiSelectionBar의 상태 정보만 사용 -->
<template>
  <div v-if="showActions" class="custom-action-bar">
    <!-- 커스텀 디자인 -->
    <div>{{ selectedCount }}개 선택됨</div>
    <!-- 커스텀 액션 버튼들 -->
  </div>
</template>

<script setup>
// useMultiSelectionState에서 상태만 가져오기
const { showActions, selectedCount } = useMultiSelectionState(...)
</script>
```

---

## 4. MultiSelectionSidebar.vue 이벤트 기반 표준화

### 4.1 문제점

- **위치 불명확**: 우측 사이드바인가? 같은 사이드바인가?
- **UX 복잡도**: 리스트와 사이드바 양쪽에 선택 피드백이 있으면 혼란
- **조건부 표시**: 언제 표시해야 할지 불명확

### 4.2 해결 방안: 이벤트 기반 표시

**컨텐츠 영역에서 이벤트 발생 → 사이드바 표시**

```vue
<!-- 컨텐츠 영역 (DocumentListSidebar) -->
<template>
  <q-list>
    <MultiSelectionItem
      v-for="item in items"
      @click="handleItemClick"
      @show-details="showItemDetails"  <!-- 이벤트 발생 -->
    >
      <!-- 내용 -->
    </MultiSelectionItem>
  </q-list>
</template>

<script setup>
function showItemDetails(item) {
  // 이벤트 발생 → 사이드바 표시
  emit('show-selection-sidebar', item)
}
</script>
```

### 4.3 표준 사이드바 위치

**옵션 1: 같은 사이드바 내 하단 (권장)**
```
┌─────────────────────┐
│  사이드바 상단      │
│  (기존 콘텐츠)      │
├─────────────────────┤
│  선택된 항목        │ ← 멀티 셀렉션 사이드바
│  (이벤트 발생 시)   │
└─────────────────────┘
```

**옵션 2: 우측 사이드바 (선택사항)**
```
┌──────────┬──────────┐
│  왼쪽     │  오른쪽  │
│  사이드바 │  사이드바│
│          │  (선택)  │
└──────────┴──────────┘
```

### 4.4 표준화된 구조

```vue
<!-- MultiSelectionSidebar.vue -->
<template>
  <div 
    v-if="visible && selectedItems.length > 0" 
    class="multi-selection-sidebar"
    :class="{ 'sidebar-bottom': position === 'bottom' }"
  >
    <!-- 헤더 -->
    <div class="sidebar-header">
      <div class="title">선택된 항목</div>
      <div class="count">{{ selectedItems.length }}개</div>
      <q-btn 
        icon="close" 
        flat 
        dense 
        @click="handleClose"
      />
    </div>

    <!-- 선택된 항목 리스트 -->
    <q-scroll-area class="items-scroll">
      <div
        v-for="item in selectedItems"
        :key="getItemId(item)"
        class="selected-item-card"
      >
        <slot name="item" :item="item">
          <!-- 기본 표시 -->
        </slot>
        <slot name="item-actions" :item="item">
          <!-- 기본 액션 -->
        </slot>
      </div>
    </q-scroll-area>
  </div>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false,  // 이벤트 발생 시에만 표시
  },
  position: {
    type: String,
    default: 'bottom',  // 'bottom' | 'right'
  },
  selectedItems: {
    type: Array,
    required: true,
  },
})
</script>
```

### 4.5 이벤트 기반 사용 예시

```vue
<!-- DocumentListSidebar.vue -->
<template>
  <div class="document-list-sidebar">
    <!-- 기존 사이드바 콘텐츠 -->
    <q-list>
      <MultiSelectionItem ... />
    </q-list>

    <!-- 멀티 셀렉션 사이드바 (하단) -->
    <MultiSelectionSidebar
      :visible="showSelectionSidebar"
      position="bottom"
      :selected-items="selectedRows"
      @close="showSelectionSidebar = false"
    >
      <template #item="{ item: file }">
        <div class="file-name">{{ file.displayName }}</div>
        <div class="file-meta">{{ file.modifiedDate }}</div>
      </template>
      <template #item-actions="{ item: file }">
        <q-btn icon="edit" @click="editFile(file)" />
        <q-btn icon="delete" @click="deleteFile(file)" />
      </template>
    </MultiSelectionSidebar>
  </div>
</template>

<script setup>
const showSelectionSidebar = ref(false)

// 멀티 셀렉션 모드 진입 시 자동 표시
watch(multiSelectMode, (newVal) => {
  if (newVal && selectedCount.value > 0) {
    showSelectionSidebar.value = true
  }
})

// 선택된 항목이 많을 때만 표시
watch(selectedCount, (count) => {
  if (count > 5) {
    showSelectionSidebar.value = true
  } else if (count === 0) {
    showSelectionSidebar.value = false
  }
})
</script>
```

---

## 5. 표준화된 사용 패턴

### 5.1 보편적인 경우 (q-item 리스트)

```vue
<template>
  <!-- 1. 표준 액션 바 -->
  <MultiSelectionBar
    :selected-count="selectedCount"
    :actions="standardActions"
    @clear-selection="clearSelection"
  />

  <!-- 2. 표준 멀티 셀렉션 아이템 -->
  <q-list>
    <MultiSelectionItem
      v-for="item in items"
      :key="item.id"
      :item="item"
      :is-selected="isItemSelected(item)"
      :long-pressing-id="longPressingRowId"
      :show-checkbox="multiSelectMode || selectedCount > 0"
      @click="handleItemClick"
      @mousedown="handleItemMouseDown"
      @mouseup="handleItemMouseUp"
    >
      <q-item-section>
        <q-item-label>{{ item.name }}</q-item-label>
      </q-item-section>
    </MultiSelectionItem>
  </q-list>

  <!-- 3. 선택적 사이드바 (이벤트 기반) -->
  <MultiSelectionSidebar
    :visible="showSelectionSidebar"
    position="bottom"
    :selected-items="selectedRows"
  />
</template>
```

### 5.2 특수한 경우 (커스텀 렌더러)

```vue
<template>
  <!-- 커스텀 액션 바 -->
  <div v-if="showActions" class="custom-action-bar">
    {{ selectedCount }}개 선택됨
    <!-- 커스텀 액션 버튼들 -->
  </div>

  <!-- 커스텀 렌더러 -->
  <DataCardRenderer
    :selected-rows="selectedRows"
    @row-click="handleRowClick"
    @row-mousedown="handleRowMouseDown"
    @row-mouseup="handleRowMouseUp"
  />
</template>

<script setup>
// useMultiSelection.js만 사용
const {
  selectedRows,
  selectedCount,
  multiSelectMode,
  // ...
} = useMultiSelection({
  items: filteredItems,
  // 커스텀 로직
})
</script>
```

---

## 6. 컴포넌트 구조

```
src/components/common/
  ├── MultiSelectionBar.vue        # 표준 액션 바 (q-item 전용)
  ├── MultiSelectionItem.vue        # 표준 아이템 래퍼 (q-item 전용)
  └── MultiSelectionSidebar.vue     # 이벤트 기반 사이드바

src/composables/
  ├── useMultiSelection.js          # 핵심 로직 (공용)
  └── useMultiSelectionState.js    # 상태 관리 (선택사항)
```

---

## 7. 마이그레이션 가이드

### 7.1 기존 코드 → 표준화

**Before**:
```vue
<q-item v-for="item in items" @click="selectItem(item)">
  <!-- 내용 -->
</q-item>
```

**After (보편적인 경우)**:
```vue
<MultiSelectionItem
  v-for="item in items"
  :item="item"
  :is-selected="isItemSelected(item)"
  @click="handleItemClick"
>
  <!-- 내용 -->
</MultiSelectionItem>
```

**After (특수한 경우)**:
```vue
<!-- useMultiSelection.js만 사용, 자체 UI 구현 -->
```

---

## 8. 장점 요약

### 8.1 표준화의 장점

1. **통일된 UI/UX**: q-item 리스트에서 일관된 멀티 셀렉션 경험
2. **빠른 개발**: 표준 컴포넌트로 즉시 적용 가능
3. **유지보수 용이**: 한 곳만 수정하면 모든 곳에 반영
4. **학습 곡선 감소**: 표준 패턴만 익히면 됨

### 8.2 유연성 유지

1. **특수한 경우 지원**: 커스텀 구현 가능
2. **점진적 적용**: 기존 코드를 단계적으로 마이그레이션
3. **선택적 사용**: 필요한 부분만 표준 컴포넌트 사용

---

## 9. 다음 단계

1. **MultiSelectionBar.vue 개선**: 표준 액션 바 구조 확정
2. **MultiSelectionItem.vue 검증**: q-item 전용으로 테스트
3. **MultiSelectionSidebar.vue 이벤트 기반 개선**: 위치 및 표시 조건 명확화
4. **DocumentListSidebar에 적용**: 보편적인 경우로 첫 적용
5. **문서화**: 사용 가이드 및 예시 코드 작성


