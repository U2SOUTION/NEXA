# 멀티 셀렉션 범용 설계

## 문제점 분석

### 1. q-item 제한의 문제
- **현재**: MultiSelectionItem이 q-item 전용
- **문제**: 카드, 테이블, 갤러리 등 다른 렌더러와 호환 불가
- **해결**: 렌더러에 독립적인 범용 컴포넌트로 재설계

### 2. 액션 바의 제한적 확장성
- **현재**: 기본적인 액션만 제공
- **문제**: 생성, 편집, 삭제, 순위변경, 정렬, 숨김, 즐겨찾기, 평가관리, 검색 등 다양한 액션 필요
- **해결**: 모듈화된 액션 시스템으로 확장 가능하게 설계

---

## 범용 설계 방안

### 1. MultiSelectionItem 범용화

#### 현재 구조 (q-item 전용)
```vue
<template>
  <q-item ...>
    <!-- q-item 구조 -->
  </q-item>
</template>
```

#### 개선된 구조 (렌더러 독립적)
```vue
<!-- MultiSelectionItem.vue -->
<template>
  <!-- 렌더러 타입에 따라 다른 래퍼 사용 -->
  <component
    :is="wrapperComponent"
    :class="selectionClasses"
    v-bind="wrapperProps"
    @click="handleClick"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
  >
    <!-- 체크박스 (조건부) -->
    <slot name="checkbox" v-if="showCheckbox">
      <q-checkbox
        :model-value="isSelected"
        @update:model-value="handleToggle"
        @click.stop
      />
    </slot>

    <!-- 아이템 내용 (슬롯) -->
    <slot />
  </component>
</template>

<script setup>
const props = defineProps({
  // 렌더러 타입: 'q-item' | 'card' | 'table-row' | 'gallery' | 'custom'
  rendererType: {
    type: String,
    default: 'q-item',
  },
  // 커스텀 래퍼 컴포넌트
  customWrapper: {
    type: [String, Object],
    default: null,
  },
  // ... 기타 props
})

const wrapperComponent = computed(() => {
  if (props.customWrapper) return props.customWrapper
  
  const componentMap = {
    'q-item': 'q-item',
    'card': 'div',
    'table-row': 'tr',
    'gallery': 'div',
  }
  return componentMap[props.rendererType] || 'div'
})

const wrapperProps = computed(() => {
  const baseProps = {
    class: selectionClasses.value,
  }
  
  if (props.rendererType === 'q-item') {
    return {
      ...baseProps,
      clickable: true,
      'v-ripple': true,
    }
  }
  
  return baseProps
})
</script>
```

#### 사용 예시

**q-item 리스트**:
```vue
<MultiSelectionItem
  renderer-type="q-item"
  :item="item"
  :is-selected="isSelected(item)"
>
  <q-item-section>
    <q-item-label>{{ item.name }}</q-item-label>
  </q-item-section>
</MultiSelectionItem>
```

**카드 렌더러**:
```vue
<MultiSelectionItem
  renderer-type="card"
  :item="item"
  :is-selected="isSelected(item)"
>
  <div class="card-content">
    <!-- 카드 내용 -->
  </div>
</MultiSelectionItem>
```

**테이블 렌더러**:
```vue
<MultiSelectionItem
  renderer-type="table-row"
  :item="item"
  :is-selected="isSelected(item)"
>
  <td>{{ item.name }}</td>
  <td>{{ item.description }}</td>
</MultiSelectionItem>
```

**커스텀 렌더러**:
```vue
<MultiSelectionItem
  :custom-wrapper="CustomCardComponent"
  :item="item"
  :is-selected="isSelected(item)"
>
  <!-- 커스텀 내용 -->
</MultiSelectionItem>
```

---

### 2. MultiSelectionBar 모듈화된 액션 시스템

#### 액션 모듈 구조

```javascript
// src/composables/useMultiSelectionActions.js

/**
 * 멀티 셀렉션 액션 모듈 정의
 */
export const ACTION_MODULES = {
  // 기본 작업
  basic: {
    id: 'basic',
    label: '기본 작업',
    actions: [
      { id: 'create', icon: 'add', label: '생성', handler: 'onCreate' },
      { id: 'edit', icon: 'edit', label: '편집', handler: 'onEdit', singleOnly: true },
      { id: 'delete', icon: 'delete', label: '삭제', handler: 'onDelete', color: 'negative' },
      { id: 'duplicate', icon: 'content_copy', label: '복제', handler: 'onDuplicate' },
    ],
  },
  
  // 순서 관리
  order: {
    id: 'order',
    label: '순서 관리',
    actions: [
      { id: 'move-up', icon: 'arrow_upward', label: '위로 이동', handler: 'onMoveUp' },
      { id: 'move-down', icon: 'arrow_downward', label: '아래로 이동', handler: 'onMoveDown' },
      { id: 'reorder', icon: 'swap_vert', label: '순서 변경', handler: 'onReorder' },
      { id: 'sort', icon: 'sort', label: '정렬', handler: 'onSort' },
    ],
  },
  
  // 상태 관리
  status: {
    id: 'status',
    label: '상태 관리',
    actions: [
      { id: 'activate', icon: 'check_circle', label: '활성화', handler: 'onActivate' },
      { id: 'deactivate', icon: 'cancel', label: '비활성화', handler: 'onDeactivate' },
      { id: 'hide', icon: 'visibility_off', label: '숨김', handler: 'onHide' },
      { id: 'show', icon: 'visibility', label: '표시', handler: 'onShow' },
    ],
  },
  
  // 즐겨찾기 및 평가
  favorite: {
    id: 'favorite',
    label: '즐겨찾기',
    actions: [
      { id: 'add-favorite', icon: 'star_border', label: '즐겨찾기 추가', handler: 'onAddFavorite' },
      { id: 'remove-favorite', icon: 'star', label: '즐겨찾기 제거', handler: 'onRemoveFavorite' },
    ],
  },
  
  evaluation: {
    id: 'evaluation',
    label: '평가 관리',
    actions: [
      { id: 'rate', icon: 'star_rate', label: '평가', handler: 'onRate' },
      { id: 'review', icon: 'rate_review', label: '리뷰', handler: 'onReview' },
    ],
  },
  
  // 휴지통 관리
  trash: {
    id: 'trash',
    label: '휴지통',
    actions: [
      { id: 'move-to-trash', icon: 'delete', label: '휴지통으로 이동', handler: 'onMoveToTrash', color: 'negative' },
      { id: 'restore', icon: 'restore', label: '복원', handler: 'onRestore', color: 'primary' },
      { id: 'permanent-delete', icon: 'delete_forever', label: '영구 삭제', handler: 'onPermanentDelete', color: 'negative' },
      { id: 'empty-trash', icon: 'delete_sweep', label: '전체 비우기', handler: 'onEmptyTrash', color: 'negative' },
    ],
  },
  
  // 내보내기 및 공유
  export: {
    id: 'export',
    label: '내보내기',
    actions: [
      { id: 'export', icon: 'download', label: '내보내기', handler: 'onExport' },
      { id: 'print', icon: 'print', label: '인쇄', handler: 'onPrint' },
      { id: 'share', icon: 'share', label: '공유', handler: 'onShare' },
    ],
  },
  
  // 검색 및 필터
  search: {
    id: 'search',
    label: '검색',
    actions: [
      { id: 'search-in-selected', icon: 'search', label: '선택 항목 내 검색', handler: 'onSearchInSelected' },
      { id: 'filter-selected', icon: 'filter_list', label: '선택 항목 필터', handler: 'onFilterSelected' },
    ],
  },
  
  // 그룹 및 분류
  group: {
    id: 'group',
    label: '그룹 관리',
    actions: [
      { id: 'group', icon: 'group_work', label: '그룹화', handler: 'onGroup' },
      { id: 'ungroup', icon: 'group_off', label: '그룹 해제', handler: 'onUngroup' },
      { id: 'categorize', icon: 'category', label: '분류', handler: 'onCategorize' },
    ],
  },
}

/**
 * 액션 모듈 선택 및 필터링
 */
export function useMultiSelectionActions(options = {}) {
  const {
    selectedCount = ref(0),
    selectedRowId = ref(null),
    enabledModules = [], // 사용할 모듈 ID 배열
    disabledActions = [], // 비활성화할 액션 ID 배열
    customActions = [], // 커스텀 액션 배열
    onAction = () => {}, // 액션 핸들러
  } = options

  // 활성화된 모듈 필터링
  const activeModules = computed(() => {
    if (enabledModules.length === 0) {
      // 모든 모듈 활성화
      return Object.values(ACTION_MODULES)
    }
    return enabledModules
      .map(id => ACTION_MODULES[id])
      .filter(Boolean)
  })

  // 액션 목록 생성 (모듈별로 그룹화)
  const actionGroups = computed(() => {
    return activeModules.value.map(module => {
      const actions = module.actions
        .filter(action => {
          // 비활성화된 액션 제외
          if (disabledActions.includes(action.id)) return false
          
          // singleOnly 체크
          if (action.singleOnly && selectedCount.value !== 1) return false
          
          // multiOnly 체크
          if (action.multiOnly && selectedCount.value <= 1) return false
          
          return true
        })
        .map(action => ({
          ...action,
          moduleId: module.id,
          disabled: action.disabled?.(selectedCount.value, selectedRowId.value) || false,
        }))

      return {
        ...module,
        actions,
      }
    }).filter(group => group.actions.length > 0)
  })

  // 플랫 액션 목록 (그룹 없이)
  const flatActions = computed(() => {
    return actionGroups.value.flatMap(group => group.actions)
  })

  // 액션 핸들러
  function handleAction(action) {
    if (action.disabled) return
    
    // 커스텀 핸들러 호출
    onAction(action, {
      selectedCount: selectedCount.value,
      selectedRowId: selectedRowId.value,
    })
  }

  return {
    actionGroups,
    flatActions,
    handleAction,
  }
}
```

#### MultiSelectionBar 개선

```vue
<!-- MultiSelectionBar.vue -->
<template>
  <div v-if="show" class="multi-selection-bar q-pa-sm">
    <div class="row items-center justify-between">
      <!-- 선택 개수 -->
      <div class="selected-count row items-center q-gutter-xs">
        <q-icon name="check_circle" size="20px" color="primary" />
        <span class="text-weight-bold text-body1">{{ selectedCount }}개 선택됨</span>
      </div>

      <!-- 액션 버튼들 -->
      <div class="multi-actions row items-center q-gutter-xs">
        <!-- 모듈별 그룹화된 액션 (드롭다운) -->
        <template v-if="displayMode === 'grouped'">
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
        </template>

        <!-- 플랫 액션 버튼들 -->
        <template v-else>
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
        </template>

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
import { useMultiSelectionActions, ACTION_MODULES } from 'src/composables/useMultiSelectionActions.js'

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
  // 사용할 모듈 ID 배열 (빈 배열이면 모두 사용)
  enabledModules: {
    type: Array,
    default: () => [],
  },
  // 비활성화할 액션 ID 배열
  disabledActions: {
    type: Array,
    default: () => [],
  },
  // 표시 모드: 'grouped' | 'flat'
  displayMode: {
    type: String,
    default: 'flat',
  },
})

const emit = defineEmits(['action', 'clear-selection'])

const {
  actionGroups,
  flatActions,
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

function handleAction(action) {
  handleActionInternal(action)
}

function handleClearSelection() {
  emit('clear-selection')
}
</script>
```

#### 사용 예시

**기본 사용 (모든 액션)**:
```vue
<MultiSelectionBar
  :selected-count="selectedCount"
  :selected-row-id="selectedRowId"
  @action="handleAction"
  @clear-selection="clearSelection"
/>
```

**특정 모듈만 사용**:
```vue
<MultiSelectionBar
  :selected-count="selectedCount"
  :enabled-modules="['basic', 'trash', 'export']"
  @action="handleAction"
/>
```

**특정 액션 제외**:
```vue
<MultiSelectionBar
  :selected-count="selectedCount"
  :disabled-actions="['permanent-delete', 'empty-trash']"
  @action="handleAction"
/>
```

**그룹화된 표시**:
```vue
<MultiSelectionBar
  :selected-count="selectedCount"
  display-mode="grouped"
  @action="handleAction"
/>
```

**커스텀 액션 추가**:
```vue
<MultiSelectionBar
  :selected-count="selectedCount"
  @action="handleAction"
>
  <template #custom-actions>
    <q-btn icon="custom" label="커스텀 액션" @click="handleCustom" />
  </template>
</MultiSelectionBar>
```

---

## 최종 구조

```
src/components/common/
  ├── MultiSelectionBar.vue        # 모듈화된 액션 바
  ├── MultiSelectionItem.vue        # 범용 아이템 래퍼 (렌더러 독립적)
  └── MultiSelectionSidebar.vue     # 이벤트 기반 사이드바

src/composables/
  ├── useMultiSelection.js          # 핵심 선택 로직
  └── useMultiSelectionActions.js  # 모듈화된 액션 시스템
```

---

## 장점

### 1. 범용성
- **렌더러 독립적**: q-item, 카드, 테이블, 갤러리 등 모든 렌더러 지원
- **확장 가능**: 커스텀 렌더러도 쉽게 통합

### 2. 확장성
- **모듈화된 액션**: 필요한 액션만 선택해서 사용
- **커스텀 액션**: 슬롯으로 추가 액션 제공
- **조건부 활성화**: singleOnly, multiOnly 등 조건 지원

### 3. 유지보수성
- **중앙 관리**: 액션 정의가 한 곳에 집중
- **재사용성**: 모든 페이지에서 동일한 액션 시스템 사용
- **일관성**: 통일된 UI/UX 제공

---

## 마이그레이션 가이드

### 기존 코드 → 범용 구조

**Before**:
```vue
<q-item v-for="item in items" @click="selectItem(item)">
  <!-- 내용 -->
</q-item>
```

**After (q-item)**:
```vue
<MultiSelectionItem
  renderer-type="q-item"
  v-for="item in items"
  :item="item"
  :is-selected="isSelected(item)"
  @click="handleItemClick"
>
  <q-item-section>
    <q-item-label>{{ item.name }}</q-item-label>
  </q-item-section>
</MultiSelectionItem>
```

**After (카드)**:
```vue
<MultiSelectionItem
  renderer-type="card"
  v-for="item in items"
  :item="item"
  :is-selected="isSelected(item)"
  @click="handleItemClick"
>
  <div class="card-content">
    <!-- 카드 내용 -->
  </div>
</MultiSelectionItem>
```

---

## 다음 단계

1. **MultiSelectionItem 범용화**: 렌더러 타입 지원 추가
2. **액션 모듈 시스템 구현**: useMultiSelectionActions.js 생성
3. **MultiSelectionBar 개선**: 모듈화된 액션 시스템 통합
4. **문서화**: 사용 가이드 및 예시 코드 작성
5. **테스트**: 다양한 렌더러에서 테스트


