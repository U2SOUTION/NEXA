# 멀티 셀렉션 공용 컴포넌트 사용 가이드

## 개요

`src/components/common/` 디렉토리에 있는 멀티 셀렉션 컴포넌트들은 **어떤 페이지에서든 재사용 가능**한 공용 컴포넌트입니다.

## 컴포넌트 구조

```
src/components/common/
  ├── MultiSelectionBar.vue      # 상단 액션 바 (선택된 항목 개수 + 액션 버튼)
  ├── MultiSelectionItem.vue      # 리스트 아이템 래퍼 (체크박스 + 선택 상태)
  └── MultiSelectionSidebar.vue   # 사이드바 (선택된 항목 카드 표시, 선택사항)
```

## 각 컴포넌트의 역할

### 1. MultiSelectionBar.vue
**역할**: 멀티 셀렉션 모드일 때 상단에 표시되는 액션 바

**기능**:
- 선택된 항목 개수 표시
- 커스텀 액션 버튼들 표시 (슬롯 또는 props로 전달)
- 선택 해제 버튼

**언제 사용하나?**
- 멀티 셀렉션이 활성화된 모든 페이지에서 사용
- 선택된 항목들에 대한 일괄 작업 버튼을 표시할 때

---

### 2. MultiSelectionItem.vue
**역할**: 리스트의 각 아이템을 멀티 셀렉션 가능하게 만드는 래퍼

**기능**:
- 체크박스 자동 표시/숨김 (멀티 셀렉션 모드에 따라)
- 선택 상태 스타일링 (하이라이트, 보더)
- 롱프레스 상태 스타일링
- 클릭/마우스 이벤트 자동 전달

**언제 사용하나?**
- `q-item`을 사용하는 리스트에서 멀티 셀렉션을 추가할 때
- 기존 리스트 아이템을 멀티 셀렉션 가능하게 만들 때

---

### 3. MultiSelectionSidebar.vue
**역할**: 선택된 항목들을 사이드바에 카드 형태로 표시

**기능**:
- 선택된 항목들을 스크롤 가능한 리스트로 표시
- 각 항목별 커스텀 표시 (슬롯 사용)
- 각 항목별 액션 버튼 (슬롯 사용)

**언제 사용하나?**
- 선택된 항목들을 사이드바에서 확인하고 싶을 때
- 선택된 항목들에 대한 개별 작업이 필요할 때
- PartsManagementSidebar와 유사한 UI가 필요할 때

---

## 사용 예시

### 예시 1: DocumentListSidebar에 멀티 셀렉션 추가

```vue
<template>
  <div class="document-list-sidebar">
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
        <!-- 기존 파일 아이템 내용 -->
        <q-item-section avatar v-if="!multiSelectMode && selectedCount === 0">
          <q-icon :name="isFavorite(file.name) ? 'star' : 'description'" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ file.displayName }}</q-item-label>
        </q-item-section>
      </MultiSelectionItem>
    </q-list>
  </div>
</template>

<script setup>
import { useMultiSelection } from 'src/composables/useMultiSelection.js'
import MultiSelectionBar from 'src/components/common/MultiSelectionBar.vue'
import MultiSelectionItem from 'src/components/common/MultiSelectionItem.vue'

// useMultiSelection composable 사용
const {
  selectedRows,
  selectedCount,
  multiSelectMode,
  longPressingRowId,
  onRowClick: handleMultiRowClick,
  onRowMouseDown: handleMultiRowMouseDown,
  onRowMouseUp: handleMultiRowMouseUp,
  clearSelection,
} = useMultiSelection({
  items: computed(() => displayFiles.value),
  onSelectionChange: (newSelectedRows) => {
    // 선택 변경 시 처리
  },
})

// 파일 선택 상태 확인
function isFileSelected(file) {
  return selectedRows.value.some(f => f.name === file.name)
}

// 이벤트 핸들러
function handleFileClick(file, event) {
  handleMultiRowClick(file, event)
}

function handleFileMouseDown(file, event) {
  handleMultiRowMouseDown(file, event)
}

function handleFileMouseUp(file, event) {
  handleMultiRowMouseUp(file, event)
}

function handleFileToggle(file, value) {
  // 체크박스 토글 처리
}

// 멀티 셀렉션 액션 버튼들
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

---

### 예시 2: 다른 페이지에서도 사용 (예: 사용자 목록)

```vue
<template>
  <div class="user-list-page">
    <!-- 멀티 셀렉션 액션 바 -->
    <MultiSelectionBar
      :selected-count="selectedCount"
      :show="multiSelectMode || selectedCount > 0"
      :actions="userActions"
      @clear-selection="clearSelection"
    />

    <!-- 사용자 리스트 -->
    <q-list>
      <MultiSelectionItem
        v-for="user in users"
        :key="user.id"
        :item="user"
        :is-selected="isUserSelected(user)"
        :long-pressing-id="longPressingRowId"
        :show-checkbox="multiSelectMode || selectedCount > 0"
        @click="handleUserClick"
        @mousedown="handleUserMouseDown"
        @mouseup="handleUserMouseUp"
      >
        <q-item-section avatar>
          <q-avatar>
            <img :src="user.avatar" />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ user.name }}</q-item-label>
          <q-item-label caption>{{ user.email }}</q-item-label>
        </q-item-section>
      </MultiSelectionItem>
    </q-list>

    <!-- 선택된 사용자 사이드바 (선택사항) -->
    <MultiSelectionSidebar
      :selected-items="selectedRows"
      :get-item-id="(user) => user.id"
      :get-item-name="(user) => user.name"
    >
      <template #item="{ item: user }">
        <div class="item-name">{{ user.name }}</div>
        <div class="item-meta text-caption">{{ user.email }}</div>
      </template>
      <template #item-actions="{ item: user }">
        <q-btn icon="edit" flat dense @click="editUser(user)" />
        <q-btn icon="delete" flat dense color="negative" @click="deleteUser(user)" />
      </template>
    </MultiSelectionSidebar>
  </div>
</template>

<script setup>
import { useMultiSelection } from 'src/composables/useMultiSelection.js'
import MultiSelectionBar from 'src/components/common/MultiSelectionBar.vue'
import MultiSelectionItem from 'src/components/common/MultiSelectionItem.vue'
import MultiSelectionSidebar from 'src/components/common/MultiSelectionSidebar.vue'

const users = ref([...]) // 사용자 목록

const {
  selectedRows,
  selectedCount,
  multiSelectMode,
  longPressingRowId,
  onRowClick: handleMultiRowClick,
  onRowMouseDown: handleMultiRowMouseDown,
  onRowMouseUp: handleMultiRowMouseUp,
  clearSelection,
} = useMultiSelection({
  items: computed(() => users.value),
  onSelectionChange: (newSelectedRows) => {
    // 선택 변경 시 처리
  },
})

function isUserSelected(user) {
  return selectedRows.value.some(u => u.id === user.id)
}

const userActions = [
  {
    id: 'activate',
    icon: 'check_circle',
    label: '활성화',
    color: 'positive',
    handler: () => activateUsers(selectedRows.value),
  },
  {
    id: 'deactivate',
    icon: 'cancel',
    label: '비활성화',
    color: 'negative',
    handler: () => deactivateUsers(selectedRows.value),
  },
]
</script>
```

---

## 공용으로 사용되는 이유

### 1. **일관된 UI/UX**
- 모든 페이지에서 동일한 멀티 셀렉션 인터페이스 제공
- 사용자가 한 번 배우면 모든 곳에서 사용 가능

### 2. **코드 재사용**
- 멀티 셀렉션 로직을 한 번만 작성하고 여러 곳에서 사용
- 버그 수정이나 기능 개선 시 한 곳만 수정하면 모든 곳에 반영

### 3. **유지보수 용이**
- 컴포넌트별로 역할이 명확히 분리되어 있음
- 각 컴포넌트를 독립적으로 테스트하고 수정 가능

### 4. **확장성**
- 새로운 페이지에 멀티 셀렉션을 추가할 때 최소한의 코드만 작성
- `useMultiSelection` composable과 함께 사용하면 즉시 적용 가능

---

## 컴포넌트 간 관계

```
┌─────────────────────────────────────────┐
│  useMultiSelection (composable)        │
│  - 선택 상태 관리                       │
│  - 이벤트 핸들링                        │
└─────────────────────────────────────────┘
           │
           ├─────────────────┬─────────────────┐
           │                 │                 │
           ▼                 ▼                 ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
│ MultiSelectionBar│ │MultiSelection │ │MultiSelection    │
│                  │ │Item           │ │Sidebar           │
│ - 액션 바        │ │               │ │                  │
│ - 선택 개수 표시 │ │ - 아이템 래퍼 │ │ - 사이드바       │
│ - 액션 버튼      │ │ - 체크박스     │ │ - 카드 표시      │
└──────────────────┘ └──────────────┘ └──────────────────┘
```

---

## 사용 패턴

### 기본 패턴
1. `useMultiSelection` composable로 선택 상태 관리
2. `MultiSelectionBar`로 액션 바 표시
3. `MultiSelectionItem`로 리스트 아이템 래핑
4. (선택사항) `MultiSelectionSidebar`로 선택된 항목 표시

### 커스터마이징
- **액션 버튼**: `MultiSelectionBar`의 `actions` prop 또는 `#actions` 슬롯 사용
- **아이템 표시**: `MultiSelectionItem`의 기본 슬롯 사용
- **사이드바 표시**: `MultiSelectionSidebar`의 `#item` 및 `#item-actions` 슬롯 사용

---

## 주의사항

1. **이벤트 바인딩 필수**
   - `MultiSelectionItem`에 `@click`, `@mousedown`, `@mouseup` 이벤트를 반드시 바인딩
   - `useMultiSelection`의 핸들러를 전달해야 함

2. **cleanup 호출**
   - 컴포넌트 언마운트 시 `useMultiSelection`의 `cleanup()` 함수 호출 필수

3. **아이템 ID**
   - 각 아이템은 고유한 `id` 또는 `name` 속성이 있어야 함
   - `MultiSelectionItem`의 `getItemId` prop으로 커스터마이징 가능

4. **성능**
   - 대량의 아이템이 있을 때는 가상 스크롤링 고려
   - `isSelected` 함수는 computed로 최적화 권장

---

## 마이그레이션 가이드

기존 코드를 멀티 셀렉션 컴포넌트로 마이그레이션하는 방법:

### Before (기존 코드)
```vue
<q-item
  v-for="item in items"
  :key="item.id"
  @click="selectItem(item)"
>
  <q-item-section>
    <q-item-label>{{ item.name }}</q-item-label>
  </q-item-section>
</q-item>
```

### After (멀티 셀렉션 적용)
```vue
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
```

---

## 요약

이 세 컴포넌트는 **어떤 페이지에서든 멀티 셀렉션 기능을 빠르게 추가**할 수 있도록 설계된 공용 컴포넌트입니다.

- **MultiSelectionBar**: 상단 액션 바
- **MultiSelectionItem**: 리스트 아이템 래퍼
- **MultiSelectionSidebar**: 선택된 항목 사이드바 (선택사항)

`useMultiSelection` composable과 함께 사용하면 **최소한의 코드로 완전한 멀티 셀렉션 기능**을 구현할 수 있습니다.


