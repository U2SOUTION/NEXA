# 문서 관리 멀티 셀렉션 기능 기획서

## 1. 개요

### 1.1 목적
- 왼쪽 사이드바(DocumentListSidebar)에 멀티 셀렉션 기능 추가
- 선택한 문서들을 일괄로 휴지통으로 이동하거나, 휴지통에서 부분적으로 삭제
- 멀티 셀렉션 기능을 전역적으로 재사용 가능한 컴포넌트로 추상화

### 1.2 참고 사례
- **PartClassesView** (`src/components/parts-management/PartClassesView.vue`)
  - `useMultiSelection` composable 사용
  - 롱프레스로 멀티 셀렉트 모드 진입
  - Ctrl/Cmd + 클릭으로 개별 토글
  - Shift + 클릭으로 범위 선택
  - 선택된 항목들을 사이드바에 표시

- **PartsManagementSidebar** (`src/components/sidebars/left/PartsManagementSidebar.vue`)
  - 멀티 셀렉션된 항목들을 카드 형태로 표시
  - 각 항목별 개별 액션 버튼 (수정, 삭제)
  - 선택된 항목 개수 표시

## 2. 현재 구조 분석

### 2.1 DocumentListSidebar 현재 상태
- **단일 선택만 지원**: `selectFile(file)` 함수로 하나의 파일만 선택
- **드래그 앤 드롭**: 우선순위 관리용 (멀티 셀렉션과 별개)
- **휴지통 모드**: 휴지통에 있는 파일 목록 표시
- **일반 모드**: 일반 파일 목록 표시 (그룹 모드, 정렬 모드 지원)

### 2.2 useMultiSelection Composable
- **위치**: `src/composables/useMultiSelection.js`
- **기능**:
  - 단일/복수 선택 관리
  - 롱프레스 감지 (기본 300ms)
  - Shift/Ctrl 선택 지원
  - 선택 상태 관리 (selectedRows, selectedCount 등)
  - ESC 키로 선택 해제

### 2.3 기존 멀티 셀렉션 사용 패턴
```javascript
const {
  selectedRows,
  selectedCount,
  multiSelectMode,
  longPressingRowId,
  onRowClick: handleRowClick,
  onRowMouseDown: handleRowMouseDown,
  onRowMouseUp: handleRowMouseUp,
  clearSelection,
} = useMultiSelection({
  items: filteredItems,
  onSelectionChange: (newSelectedRows) => {
    // 선택 변경 시 store 동기화
    store.selectedItems = [...newSelectedRows]
  },
  onRowClick: handleRowClick,
  onRowDoubleClick: handleRowDoubleClick,
})
```

## 3. 구현 방안

### 3.1 DocumentListSidebar에 멀티 셀렉션 적용

#### 3.1.1 기본 구조
```vue
<template>
  <!-- 멀티 셀렉션 모드일 때 상단 액션 바 -->
  <div v-if="multiSelectMode || selectedCount > 0" class="multi-selection-bar">
    <div class="selected-count">
      <q-icon name="check_circle" />
      <span>{{ selectedCount }}개 선택됨</span>
    </div>
    <div class="multi-actions">
      <!-- 일반 모드일 때 -->
      <template v-if="!isTrashView">
        <q-btn icon="delete" label="휴지통으로 이동" color="negative" @click="handleMoveSelectedToTrash" />
      </template>
      <!-- 휴지통 모드일 때 -->
      <template v-else>
        <q-btn icon="restore" label="복원" color="primary" @click="handleRestoreSelected" />
        <q-btn icon="delete_forever" label="영구 삭제" color="negative" @click="handlePermanentlyDeleteSelected" />
      </template>
      <q-btn icon="close" label="선택 해제" flat @click="clearSelection" />
    </div>
  </div>

  <!-- 파일 리스트 -->
  <q-list>
    <q-item
      v-for="file in displayFiles"
      :key="file.name"
      :class="{
        'selected': isFileSelected(file),
        'long-pressing': longPressingRowId === file.name
      }"
      @click="handleFileClick(file, $event)"
      @mousedown="handleFileMouseDown(file, $event)"
      @mouseup="handleFileMouseUp(file, $event)"
    >
      <!-- 체크박스 표시 (멀티 셀렉션 모드일 때) -->
      <q-item-section avatar v-if="multiSelectMode || selectedCount > 0">
        <q-checkbox
          :model-value="isFileSelected(file)"
          @update:model-value="toggleFileSelection(file)"
        />
      </q-item-section>
      <!-- 기존 아이콘 (단일 선택 모드일 때) -->
      <q-item-section avatar v-else>
        <q-icon :name="isFavorite(file.name) ? 'star' : 'description'" />
      </q-item-section>
      <!-- 파일 정보 -->
      <q-item-section>
        <q-item-label>{{ file.displayName }}</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>
```

#### 3.1.2 Script 구현
```javascript
import { useMultiSelection } from 'src/composables/useMultiSelection.js'

// 멀티 셀렉션 설정
const {
  selectedRows,
  selectedCount,
  multiSelectMode,
  longPressingRowId,
  onRowClick: handleMultiRowClick,
  onRowMouseDown: handleMultiRowMouseDown,
  onRowMouseUp: handleMultiRowMouseUp,
  clearSelection,
  cleanup: cleanupMultiSelection,
} = useMultiSelection({
  items: computed(() => displayFiles.value),
  onSelectionChange: (newSelectedRows) => {
    // 선택된 파일들을 store에 저장 (필요시)
    // documentStore.selectedFiles = [...newSelectedRows]
  },
  onRowClick: (file, event) => {
    // 단일 선택 모드일 때만 기존 selectFile 호출
    if (!multiSelectMode.value) {
      selectFile(file)
    }
  },
  onRowDoubleClick: (file) => {
    // 더블 클릭 시 파일 열기 (기존 동작 유지)
    selectFile(file)
  },
})

// 파일 선택 상태 확인
function isFileSelected(file) {
  return selectedRows.value.some(f => f.name === file.name)
}

// 파일 클릭 핸들러 (멀티 셀렉션과 통합)
function handleFileClick(file, event) {
  handleMultiRowClick(file, event)
}

// 파일 마우스 다운 핸들러 (롱프레스 감지)
function handleFileMouseDown(file, event) {
  handleMultiRowMouseDown(file, event)
}

// 파일 마우스 업 핸들러
function handleFileMouseUp(file, event) {
  handleMultiRowMouseUp(file, event)
}

// 선택된 파일들을 휴지통으로 이동
async function handleMoveSelectedToTrash() {
  if (selectedRows.value.length === 0) return
  
  const count = selectedRows.value.length
  const confirmed = await $q.dialog({
    title: '휴지통으로 이동',
    message: `선택한 ${count}개 문서를 휴지통으로 이동하시겠습니까?`,
    cancel: true,
    persistent: true,
  })
  
  if (confirmed) {
    for (const file of selectedRows.value) {
      moveToTrash(file.name, documentStore)
    }
    clearSelection()
    $q.notify({
      type: 'positive',
      message: `${count}개 문서를 휴지통으로 이동했습니다`,
    })
  }
}

// 선택된 파일들 복원
async function handleRestoreSelected() {
  if (selectedRows.value.length === 0) return
  
  const count = selectedRows.value.length
  for (const file of selectedRows.value) {
    restoreFromTrash(file.name, documentStore)
  }
  clearSelection()
  $q.notify({
    type: 'positive',
    message: `${count}개 문서를 복원했습니다`,
  })
}

// 선택된 파일들 영구 삭제
async function handlePermanentlyDeleteSelected() {
  if (selectedRows.value.length === 0) return
  
  const count = selectedRows.value.length
  const confirmed = await $q.dialog({
    title: '영구 삭제',
    message: `선택한 ${count}개 문서를 영구적으로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
    cancel: true,
    persistent: true,
    ok: { color: 'negative' },
  })
  
  if (confirmed) {
    let successCount = 0
    let failCount = 0
    
    for (const file of selectedRows.value) {
      try {
        await permanentlyDeleteFromTrash(file.name, documentStore)
        successCount++
      } catch (error) {
        console.error(`파일 삭제 실패: ${file.name}`, error)
        failCount++
      }
    }
    
    clearSelection()
    
    if (failCount > 0) {
      $q.notify({
        type: 'warning',
        message: `${successCount}개 삭제 성공, ${failCount}개 삭제 실패`,
      })
    } else {
      $q.notify({
        type: 'negative',
        message: `${successCount}개 문서를 영구적으로 삭제했습니다`,
      })
    }
  }
}

// 컴포넌트 언마운트 시 정리
onBeforeUnmount(() => {
  cleanupMultiSelection()
})
```

### 3.2 전역 멀티 셀렉터 컴포넌트화

#### 3.2.1 컴포넌트 구조
```
src/components/common/
  MultiSelectionBar.vue          # 멀티 셀렉션 액션 바
  MultiSelectionItem.vue         # 멀티 셀렉션 아이템 래퍼
  MultiSelectionSidebar.vue      # 멀티 셀렉션 사이드바 (선택된 항목 표시)
```

#### 3.2.2 MultiSelectionBar.vue
```vue
<template>
  <div v-if="show" class="multi-selection-bar">
    <div class="selected-count">
      <q-icon name="check_circle" color="primary" />
      <span class="text-weight-bold">{{ selectedCount }}개 선택됨</span>
    </div>
    <div class="multi-actions">
      <slot name="actions">
        <!-- 기본 액션 버튼들 -->
        <q-btn
          v-for="action in defaultActions"
          :key="action.id"
          :icon="action.icon"
          :label="action.label"
          :color="action.color"
          @click="action.handler"
        />
      </slot>
      <q-btn
        icon="close"
        label="선택 해제"
        flat
        @click="handleClearSelection"
      />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  selectedCount: {
    type: Number,
    required: true,
  },
  show: {
    type: Boolean,
    default: true,
  },
  actions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['clear-selection'])

const defaultActions = computed(() => props.actions)

function handleClearSelection() {
  emit('clear-selection')
}
</script>
```

#### 3.2.3 MultiSelectionItem.vue
```vue
<template>
  <q-item
    :class="{
      'selected': isSelected,
      'long-pressing': longPressingId === item.id,
    }"
    @click="handleClick"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
  >
    <!-- 체크박스 (멀티 셀렉션 모드) -->
    <q-item-section avatar v-if="showCheckbox">
      <q-checkbox
        :model-value="isSelected"
        @update:model-value="handleToggle"
      />
    </q-item-section>
    
    <!-- 슬롯: 기본 아이템 내용 -->
    <slot />
  </q-item>
</template>

<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
  longPressingId: {
    type: [String, Number],
    default: null,
  },
  showCheckbox: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click', 'mousedown', 'mouseup', 'toggle'])

function handleClick(event) {
  emit('click', props.item, event)
}

function handleMouseDown(event) {
  emit('mousedown', props.item, event)
}

function handleMouseUp(event) {
  emit('mouseup', props.item, event)
}

function handleToggle(value) {
  emit('toggle', props.item, value)
}
</script>
```

#### 3.2.4 MultiSelectionSidebar.vue
```vue
<template>
  <div v-if="selectedItems.length > 0" class="multi-selection-sidebar">
    <div class="sidebar-header">
      <div class="title">선택된 항목</div>
      <div class="count">{{ selectedItems.length }}개</div>
    </div>
    
    <q-scroll-area class="items-scroll">
      <div
        v-for="item in selectedItems"
        :key="getItemId(item)"
        class="selected-item-card"
      >
        <div class="item-info">
          <slot name="item" :item="item">
            <!-- 기본 아이템 표시 -->
            <div class="item-name">{{ getItemName(item) }}</div>
          </slot>
        </div>
        
        <div class="item-actions">
          <slot name="item-actions" :item="item">
            <!-- 기본 액션 버튼들 -->
          </slot>
        </div>
      </div>
    </q-scroll-area>
  </div>
</template>

<script setup>
const props = defineProps({
  selectedItems: {
    type: Array,
    required: true,
  },
  getItemId: {
    type: Function,
    default: (item) => item.id || item.name,
  },
  getItemName: {
    type: Function,
    default: (item) => item.name || item.displayName || String(item),
  },
})
</script>
```

### 3.3 사용 예시

#### 3.3.1 DocumentListSidebar에서 사용
```vue
<template>
  <!-- 멀티 셀렉션 액션 바 -->
  <MultiSelectionBar
    :selected-count="selectedCount"
    :show="multiSelectMode || selectedCount > 0"
    :actions="multiSelectionActions"
    @clear-selection="clearSelection"
  />

  <!-- 파일 리스트 -->
  <q-list>
    <MultiSelectionItem
      v-for="file in displayFiles"
      :key="file.name"
      :item="file"
      :is-selected="isFileSelected(file)"
      :long-pressing-id="longPressingRowId"
      :show-checkbox="multiSelectMode || selectedCount > 0"
      @click="handleFileClick"
      @mousedown="handleFileMouseDown"
      @mouseup="handleFileMouseUp"
      @toggle="handleFileToggle"
    >
      <q-item-section>
        <q-item-label>{{ file.displayName }}</q-item-label>
      </q-item-section>
    </MultiSelectionItem>
  </q-list>
</template>

<script setup>
import MultiSelectionBar from 'src/components/common/MultiSelectionBar.vue'
import MultiSelectionItem from 'src/components/common/MultiSelectionItem.vue'

const multiSelectionActions = computed(() => {
  if (isTrashView.value) {
    return [
      {
        id: 'restore',
        icon: 'restore',
        label: '복원',
        color: 'primary',
        handler: handleRestoreSelected,
      },
      {
        id: 'delete',
        icon: 'delete_forever',
        label: '영구 삭제',
        color: 'negative',
        handler: handlePermanentlyDeleteSelected,
      },
    ]
  } else {
    return [
      {
        id: 'trash',
        icon: 'delete',
        label: '휴지통으로 이동',
        color: 'negative',
        handler: handleMoveSelectedToTrash,
      },
    ]
  }
})
</script>
```

## 4. 구현 단계

### Phase 1: 기본 멀티 셀렉션 적용
1. `useMultiSelection` composable을 DocumentListSidebar에 통합
2. 파일 리스트에 롱프레스 및 클릭 이벤트 핸들러 추가
3. 선택된 파일 상태 표시 (체크박스 또는 하이라이트)
4. 멀티 셀렉션 모드 진입/해제 테스트

### Phase 2: 일괄 작업 기능
1. 멀티 셀렉션 액션 바 UI 추가
2. 선택된 파일들을 휴지통으로 이동 기능
3. 휴지통 모드에서 선택된 파일들 복원 기능
4. 휴지통 모드에서 선택된 파일들 영구 삭제 기능
5. 에러 처리 및 사용자 피드백 (토스트 메시지)

### Phase 3: 컴포넌트화
1. `MultiSelectionBar.vue` 컴포넌트 생성
2. `MultiSelectionItem.vue` 컴포넌트 생성
3. `MultiSelectionSidebar.vue` 컴포넌트 생성 (선택사항)
4. DocumentListSidebar에서 새 컴포넌트 사용으로 리팩토링
5. 다른 페이지에서도 재사용 가능하도록 문서화

### Phase 4: 고급 기능 (선택사항)
1. 선택된 항목들을 사이드바에 카드 형태로 표시 (PartsManagementSidebar 참고)
2. 각 항목별 개별 액션 버튼
3. 선택된 항목들 일괄 내보내기
4. 선택된 항목들 일괄 즐겨찾기 추가/제거
5. 키보드 단축키 지원 (Ctrl+A: 전체 선택, Delete: 삭제 등)

## 5. 고려사항

### 5.1 기존 기능과의 충돌 방지
- **드래그 앤 드롭**: 멀티 셀렉션과 드래그 앤 드롭이 동시에 활성화되지 않도록 처리
  - 멀티 셀렉션 모드일 때는 드래그 비활성화
  - 드래그 시작 시 멀티 셀렉션 모드 해제
- **단일 선택**: 멀티 셀렉션 모드가 아닐 때는 기존 단일 선택 동작 유지

### 5.2 성능 최적화
- 대량의 파일이 있을 때 선택 상태 관리 최적화
- 가상 스크롤링 고려 (필요시)

### 5.3 사용자 경험
- 멀티 셀렉션 모드 진입 방법 명확히 표시 (롱프레스 안내)
- 선택된 항목 개수 항상 표시
- 일괄 작업 시 진행 상태 표시 (로딩 인디케이터)
- 작업 완료 후 명확한 피드백

### 5.4 접근성
- 키보드 네비게이션 지원
- 스크린 리더 호환성
- 포커스 관리

## 6. 파일 구조

```
src/
  components/
    common/
      MultiSelectionBar.vue          # 멀티 셀렉션 액션 바
      MultiSelectionItem.vue          # 멀티 셀렉션 아이템 래퍼
      MultiSelectionSidebar.vue       # 멀티 셀렉션 사이드바 (선택사항)
    sidebars/
      left/
        DocumentListSidebar.vue       # 멀티 셀렉션 기능 추가
  composables/
    useMultiSelection.js              # 기존 composable (수정 불필요)
  stores/
    documentManagerStore.js           # 선택된 파일 상태 관리 (필요시 확장)
```

## 7. 참고 자료

- `src/composables/useMultiSelection.js` - 멀티 셀렉션 composable
- `src/components/parts-management/PartClassesView.vue` - 멀티 셀렉션 사용 예시
- `src/components/sidebars/left/PartsManagementSidebar.vue` - 멀티 셀렉션 UI 참고
- `src/modules/document-manager/services/documentStorage.js` - 휴지통 관련 함수들

## 8. 예상 작업 시간

- Phase 1: 4-6시간
- Phase 2: 3-4시간
- Phase 3: 4-5시간
- Phase 4: 6-8시간 (선택사항)

**총 예상 시간**: 11-15시간 (Phase 4 제외 시)


