# 멀티 셀렉션 액션 바 타입별 설계

## 개요

멀티 셀렉션 액션 바는 **사이드바용**과 **컨텐츠용** 두 가지 타입으로 분리하여 각각의 환경에 최적화된 UI/UX를 제공합니다.

---

## 1. 사이드바용 액션 바 (MultiSelectionSidebarBar)

### 특징
- **위치**: 사이드바 내부 (리스트 상단 또는 하단)
- **공간**: 좁은 공간 (사이드바 너비 제한)
- **레이아웃**: 컴팩트한 디자인
- **액션**: 핵심 액션만 표시 (드롭다운 메뉴 활용)

### 디자인
```
┌─────────────────────┐
│ [✓] 3개 선택됨      │
│ [삭제▼] [복원▼] [×] │
└─────────────────────┘
```

### 구현

```vue
<!-- MultiSelectionSidebarBar.vue -->
<template>
  <div v-if="show" class="multi-selection-sidebar-bar q-pa-xs">
    <!-- 컴팩트한 레이아웃 -->
    <div class="row items-center justify-between q-gutter-xs">
      <!-- 선택 개수 (작은 텍스트) -->
      <div class="selected-count-compact row items-center q-gutter-xs">
        <q-icon name="check_circle" size="16px" color="primary" />
        <span class="text-caption text-weight-bold">{{ selectedCount }}개</span>
      </div>

      <!-- 액션 버튼들 (드롭다운 위주) -->
      <div class="multi-actions-compact row items-center q-gutter-xs">
        <!-- 주요 액션 드롭다운 -->
        <q-btn-dropdown
          v-for="group in primaryActionGroups"
          :key="group.id"
          flat
          dense
          size="sm"
          :icon="group.icon"
          :label="group.label"
          :color="group.color"
        >
          <q-list dense>
            <q-item
              v-for="action in group.actions"
              :key="action.id"
              clickable
              v-close-popup
              :disable="action.disabled"
              @click="handleAction(action)"
            >
              <q-item-section avatar>
                <q-icon :name="action.icon" :color="action.color || 'primary'" size="18px" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ action.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <!-- 즉시 실행 액션 (중요한 것만) -->
        <q-btn
          v-for="action in immediateActions"
          :key="action.id"
          flat
          dense
          size="sm"
          :icon="action.icon"
          :color="action.color || 'primary'"
          :disable="action.disabled"
          @click="handleAction(action)"
        >
          <q-tooltip>{{ action.label }}</q-tooltip>
        </q-btn>

        <!-- 선택 해제 -->
        <q-btn
          flat
          dense
          size="sm"
          icon="close"
          color="grey-7"
          @click="handleClearSelection"
        >
          <q-tooltip>선택 해제</q-tooltip>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useMultiSelectionActions } from 'src/composables/useMultiSelectionActions.js'

const props = defineProps({
  selectedCount: {
    type: Number,
    required: true,
  },
  selectedRowId: {
    type: [Number, String],
    default: null,
  },
  show: {
    type: Boolean,
    default: true,
  },
  // 사이드바용: 주요 액션 그룹만 표시
  primaryModules: {
    type: Array,
    default: () => ['basic', 'trash'], // 기본적으로 기본 작업과 휴지통만
  },
  // 즉시 실행 액션 (드롭다운 없이 바로 표시)
  immediateActions: {
    type: Array,
    default: () => [], // 예: [{ id: 'delete', icon: 'delete', label: '삭제', handler: 'onDelete' }]
  },
})

const emit = defineEmits(['action', 'clear-selection'])

const {
  actionGroups: allActionGroups,
  handleAction: handleActionInternal,
} = useMultiSelectionActions({
  selectedCount: computed(() => props.selectedCount),
  selectedRowId: computed(() => props.selectedRowId),
  enabledModules: props.primaryModules,
  onAction: (action, context) => {
    emit('action', action, context)
  },
})

// 주요 액션 그룹 (드롭다운으로 표시)
const primaryActionGroups = computed(() => {
  return allActionGroups.value.filter(group => 
    props.primaryModules.includes(group.id)
  )
})

function handleAction(action) {
  handleActionInternal(action)
}

function handleClearSelection() {
  emit('clear-selection')
}
</script>

<style lang="scss" scoped>
.multi-selection-sidebar-bar {
  background: var(--nexa-background-lower);
  border-bottom: 1px solid var(--nexa-border-color);
  position: sticky;
  top: 0;
  z-index: 10;

  .selected-count-compact {
    flex-shrink: 0;
  }

  .multi-actions-compact {
    flex: 1;
    justify-content: flex-end;
    flex-wrap: wrap;
  }
}
</style>
```

### 사용 예시

```vue
<!-- DocumentListSidebar.vue -->
<template>
  <div class="document-list-sidebar">
    <!-- 사이드바용 액션 바 -->
    <MultiSelectionSidebarBar
      :selected-count="selectedCount"
      :selected-row-id="selectedRowId"
      :show="multiSelectMode || selectedCount > 0"
      :primary-modules="['basic', 'trash']"
      :immediate-actions="[
        { id: 'delete', icon: 'delete', label: '삭제', handler: 'onDelete', color: 'negative' }
      ]"
      @action="handleAction"
      @clear-selection="clearSelection"
    />

    <!-- 파일 리스트 -->
    <q-list>
      <!-- ... -->
    </q-list>
  </div>
</template>
```

---

## 2. 컨텐츠용 액션 바 (MultiSelectionContentBar)

### 특징
- **위치**: 컨텐츠 영역 상단 (DevelopmentPage 상단)
- **공간**: 넓은 공간 (전체 너비 활용 가능)
- **레이아웃**: 확장된 디자인
- **액션**: 모든 액션 표시 가능 (버튼 그룹, 드롭다운 혼합)

### 디자인
```
┌─────────────────────────────────────────────────────────┐
│ [✓] 3개 선택됨                                          │
│ [생성] [편집] [삭제] [복제] [순서변경▼] [상태관리▼] ... │
│ [내보내기▼] [공유] [선택 해제]                          │
└─────────────────────────────────────────────────────────┘
```

### 구현

```vue
<!-- MultiSelectionContentBar.vue -->
<template>
  <div v-if="show" class="multi-selection-content-bar q-pa-md">
    <div class="row items-center justify-between">
      <!-- 선택 개수 (큰 텍스트) -->
      <div class="selected-count-expanded row items-center q-gutter-sm">
        <q-icon name="check_circle" size="24px" color="primary" />
        <span class="text-h6 text-weight-bold">{{ selectedCount }}개 선택됨</span>
      </div>

      <!-- 액션 버튼들 (확장된 레이아웃) -->
      <div class="multi-actions-expanded row items-center q-gutter-sm">
        <!-- 즉시 실행 액션 버튼들 -->
        <q-btn
          v-for="action in flatActions"
          :key="action.id"
          :icon="action.icon"
          :label="action.label"
          :color="action.color || 'primary'"
          flat
          dense
          :disable="action.disabled"
          @click="handleAction(action)"
        >
          <q-tooltip v-if="action.tooltip">{{ action.tooltip }}</q-tooltip>
        </q-btn>

        <!-- 그룹화된 액션 (드롭다운) -->
        <q-btn-dropdown
          v-for="group in actionGroups"
          :key="group.id"
          flat
          dense
          :label="group.label"
          :icon="group.icon"
        >
          <q-list>
            <q-item
              v-for="action in group.actions"
              :key="action.id"
              clickable
              v-close-popup
              :disable="action.disabled"
              @click="handleAction(action)"
            >
              <q-item-section avatar>
                <q-icon :name="action.icon" :color="action.color || 'primary'" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ action.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <!-- 커스텀 액션 슬롯 -->
        <slot name="custom-actions" />

        <!-- 선택 해제 -->
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

<script setup>
import { useMultiSelectionActions } from 'src/composables/useMultiSelectionActions.js'

const props = defineProps({
  selectedCount: {
    type: Number,
    required: true,
  },
  selectedRowId: {
    type: [Number, String],
    default: null,
  },
  show: {
    type: Boolean,
    default: true,
  },
  // 컨텐츠용: 모든 모듈 사용 가능
  enabledModules: {
    type: Array,
    default: () => [], // 빈 배열이면 모든 모듈
  },
  // 비활성화할 액션
  disabledActions: {
    type: Array,
    default: () => [],
  },
  // 즉시 표시할 액션 (드롭다운 없이 버튼으로)
  immediateActions: {
    type: Array,
    default: () => ['create', 'edit', 'delete'], // 기본적으로 생성, 편집, 삭제는 즉시 표시
  },
  // 드롭다운으로 표시할 모듈
  dropdownModules: {
    type: Array,
    default: () => ['order', 'status', 'export'], // 순서, 상태, 내보내기는 드롭다운
  },
  // 표시 모드: 'expanded' | 'compact'
  displayMode: {
    type: String,
    default: 'expanded',
  },
})

const emit = defineEmits(['action', 'clear-selection'])

const {
  actionGroups: allActionGroups,
  flatActions: allFlatActions,
  handleAction: handleActionInternal,
} = useMultiSelectionActions({
  selectedCount: computed(() => props.selectedCount),
  selectedRowId: computed(() => props.selectedRowId),
  enabledModules: props.enabledModules,
  disabledActions: props.disabledActions,
  onAction: (action, context) => {
    emit('action', action, context)
  },
})

// 즉시 표시할 액션들 (버튼으로)
const flatActions = computed(() => {
  return allFlatActions.value.filter(action => 
    props.immediateActions.includes(action.id) && !action.disabled
  )
})

// 드롭다운으로 표시할 액션 그룹들
const actionGroups = computed(() => {
  return allActionGroups.value.filter(group => 
    props.dropdownModules.includes(group.id) && group.actions.length > 0
  )
})

function handleAction(action) {
  handleActionInternal(action)
}

function handleClearSelection() {
  emit('clear-selection')
}
</script>

<style lang="scss" scoped>
.multi-selection-content-bar {
  background: var(--nexa-background-lower);
  border-bottom: 2px solid var(--nexa-border-color);
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .selected-count-expanded {
    flex-shrink: 0;
  }

  .multi-actions-expanded {
    flex: 1;
    justify-content: flex-end;
    flex-wrap: wrap;
  }
}
</style>
```

### 사용 예시

```vue
<!-- DevelopmentPage.vue -->
<template>
  <q-page class="development-page">
    <!-- 컨텐츠용 액션 바 -->
    <MultiSelectionContentBar
      :selected-count="selectedCount"
      :selected-row-id="selectedRowId"
      :show="multiSelectMode || selectedCount > 0"
      :enabled-modules="['basic', 'trash', 'export', 'order']"
      :immediate-actions="['create', 'edit', 'delete']"
      :dropdown-modules="['order', 'status', 'export']"
      @action="handleAction"
      @clear-selection="clearSelection"
    >
      <template #custom-actions>
        <q-btn icon="custom" label="커스텀 액션" @click="handleCustom" />
      </template>
    </MultiSelectionContentBar>

    <!-- 컨텐츠 영역 -->
    <div class="content-area">
      <!-- ... -->
    </div>
  </q-page>
</template>
```

---

## 3. 컴포넌트 구조

```
src/components/common/
  ├── MultiSelectionSidebarBar.vue    # 사이드바용 (컴팩트)
  ├── MultiSelectionContentBar.vue     # 컨텐츠용 (확장)
  ├── MultiSelectionItem.vue           # 범용 아이템
  └── MultiSelectionSidebar.vue        # 선택된 항목 사이드바

src/composables/
  ├── useMultiSelection.js             # 핵심 선택 로직
  └── useMultiSelectionActions.js      # 모듈화된 액션 시스템
```

---

## 4. 사용 패턴

### 사이드바에서 사용
```vue
<!-- DocumentListSidebar.vue -->
<template>
  <div class="sidebar">
    <!-- 사이드바용: 컴팩트한 디자인 -->
    <MultiSelectionSidebarBar
      :selected-count="selectedCount"
      :primary-modules="['basic', 'trash']"
      :immediate-actions="[{ id: 'delete', icon: 'delete', ... }]"
      @action="handleAction"
    />
    
    <!-- 리스트 -->
    <q-list>...</q-list>
  </div>
</template>
```

### 컨텐츠 영역에서 사용
```vue
<!-- DevelopmentPage.vue -->
<template>
  <q-page>
    <!-- 컨텐츠용: 확장된 디자인 -->
    <MultiSelectionContentBar
      :selected-count="selectedCount"
      :enabled-modules="['basic', 'trash', 'export', 'order']"
      :immediate-actions="['create', 'edit', 'delete']"
      :dropdown-modules="['order', 'status', 'export']"
      @action="handleAction"
    />
    
    <!-- 컨텐츠 -->
    <div class="content">...</div>
  </q-page>
</template>
```

---

## 5. 비교표

| 항목 | 사이드바용 | 컨텐츠용 |
|------|-----------|---------|
| **위치** | 사이드바 내부 | 컨텐츠 영역 상단 |
| **공간** | 좁음 (사이드바 너비) | 넓음 (전체 너비) |
| **레이아웃** | 컴팩트 | 확장 |
| **텍스트 크기** | 작음 (text-caption) | 큼 (text-h6) |
| **아이콘 크기** | 작음 (16px) | 큼 (24px) |
| **액션 표시** | 드롭다운 위주 | 버튼 + 드롭다운 혼합 |
| **즉시 표시 액션** | 최소 (1-2개) | 많음 (3-5개) |
| **사용 예시** | DocumentListSidebar | DevelopmentPage |

---

## 6. 공통 기능

두 컴포넌트 모두 동일한 액션 시스템을 사용:
- `useMultiSelectionActions` composable 공유
- 동일한 액션 모듈 사용
- 동일한 이벤트 핸들링

**차이점은 UI/UX만**:
- 사이드바용: 공간 절약, 컴팩트한 디자인
- 컨텐츠용: 넓은 공간 활용, 확장된 디자인

---

## 7. 마이그레이션 가이드

### 기존 MultiSelectionBar.vue 사용처

**사이드바에서 사용**:
```vue
<!-- Before -->
<MultiSelectionBar ... />

<!-- After -->
<MultiSelectionSidebarBar ... />
```

**컨텐츠 영역에서 사용**:
```vue
<!-- Before -->
<MultiSelectionBar ... />

<!-- After -->
<MultiSelectionContentBar ... />
```

---

## 8. 장점

1. **환경에 최적화**: 각 환경에 맞는 UI/UX 제공
2. **일관성**: 동일한 액션 시스템 공유
3. **유연성**: 필요한 액션만 선택해서 사용
4. **확장성**: 새로운 액션 모듈 추가 용이


