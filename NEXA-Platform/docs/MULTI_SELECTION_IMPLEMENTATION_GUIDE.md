# 멀티 셀렉션 구현 가이드

## 개요

이 문서는 멀티 셀렉션 기능의 구현 방향과 설계 결정사항을 정리한 것입니다.

---

## 1. 현재 접근 방식

### Phase 1: useMultiSelection.js만 사용 (현재 단계)

**목적**: 문서 관리 툴에 멀티 셀렉션 기능 구현 및 검증

**방식**:
- `useMultiSelection.js` composable만 사용
- UI는 각 페이지에서 자체 구현
- 다양한 사용 패턴 경험 및 검증

**이유**:
- 다른 프로젝트/컨텐츠를 추가하여 다양한 패턴 경험 필요
- 실제 사용 사례를 충분히 모은 후 공통 패턴 정립
- 패턴 정립 후 컴포넌트화 진행

---

## 2. 설계 원칙

### 2.1 범용성 (Universal Design)

**원칙**: 모든 렌더러 타입 지원

- **q-item**: 리스트 아이템 (DocumentListSidebar 등)
- **카드**: DataCardRenderer
- **테이블**: DataTableRenderer
- **갤러리**: DataGalleryRenderer
- **커스텀**: 기타 커스텀 렌더러

**이유**: 
- 각 페이지마다 다른 렌더러 사용
- q-item으로 제한하면 확장성 부족
- 범용 설계로 모든 케이스 커버

### 2.2 모듈화된 액션 시스템

**원칙**: 모든 가능한 액션을 모듈화하고 필요한 것만 선택 사용

**액션 모듈**:
- **basic**: 생성, 편집, 삭제, 복제
- **order**: 위로 이동, 아래로 이동, 순서 변경, 정렬
- **status**: 활성화, 비활성화, 숨김, 표시
- **favorite**: 즐겨찾기 추가/제거
- **evaluation**: 평가, 리뷰
- **trash**: 휴지통 이동, 복원, 영구 삭제, 전체 비우기
- **export**: 내보내기, 인쇄, 공유
- **search**: 선택 항목 내 검색, 필터
- **group**: 그룹화, 그룹 해제, 분류

**사용 방식**:
```javascript
// 필요한 모듈만 선택
enabledModules: ['basic', 'trash', 'export']

// 특정 액션만 제외
disabledActions: ['permanent-delete', 'empty-trash']
```

### 2.3 액션 바 통합 설계

**원칙**: 하나의 컴포넌트로 통합, variant로 스타일 조정

**이유**:
- 사이드바와 컨텐츠 영역이 역할을 전환할 수 있음
  - 사이드바 = 리스트 → 컨텐츠 = 상세정보
  - 컨텐츠 = 리스트 → 사이드바 = 상세정보
- 위치만 다를 뿐, 기능은 동일해야 함
- 크기/스타일링 차이만 있음

**구현 방식**:
```vue
<MultiSelectionBar
  variant="sidebar"  // 또는 "content"
  :enabled-modules="enabledModules"
  @action="handleAction"
/>
```

**차이점**:
- `variant="sidebar"`: 컴팩트 (작은 텍스트, 작은 아이콘)
- `variant="content"`: 확장 (큰 텍스트, 큰 아이콘)

### 2.4 사이드바 이벤트 기반 표시

**원칙**: 이벤트 발생 시 조건부 표시

**표시 조건**:
- 멀티 셀렉션 모드 진입 시
- 선택된 항목이 많을 때 (예: 5개 이상)
- 상세 정보가 필요할 때

**위치**: 같은 사이드바 하단 (권장)

**구조**:
```
┌─────────────────────┐
│  사이드바 상단      │
│  (기존 콘텐츠)      │
├─────────────────────┤
│  선택된 항목        │ ← 이벤트 발생 시 표시
│  (멀티 셀렉션)      │
└─────────────────────┘
```

---

## 3. q-item에 대한 설명

### 3.1 q-item이란?

**q-item**은 Quasar Framework에서 제공하는 리스트 아이템 컴포넌트입니다.

```vue
<q-list>
  <q-item clickable v-ripple>
    <q-item-section avatar>
      <q-icon name="description" />
    </q-item-section>
    <q-item-section>
      <q-item-label>아이템 이름</q-item-label>
      <q-item-label caption>설명</q-item-label>
    </q-item-section>
  </q-item>
</q-list>
```

### 3.2 특징

- 표준화된 리스트 아이템 구조
- `clickable`, `active`, `v-ripple` 등 기본 기능 제공
- `q-item-section`으로 아이콘, 텍스트 등을 구조화
- DocumentListSidebar, PartsManagementSidebar 등에서 사용

### 3.3 q-item이 아닌 경우

- **DataCardRenderer**: 카드 형태 (커스텀 구조)
- **DataTableRenderer**: 테이블 행 (tr/td 구조)
- **DataGalleryRenderer**: 갤러리 형태 (커스텀 구조)

---

## 4. 사용 케이스 분리

### 4.1 특수한 경우 (Custom Implementation)

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

**예시**: PartClassesView (DataCardRenderer, DataTableRenderer 사용)

### 4.2 보편적인 경우 (Standard Implementation)

**특징**:
- q-item을 사용하는 표준 리스트
- 간단한 멀티 셀렉션 기능
- 통일된 UI/UX 필요

**구현 방식**:
```vue
<!-- 표준 컴포넌트 사용 (향후 구현) -->
<MultiSelectionBar variant="sidebar" ... />
<MultiSelectionItem ... />
```

**예시**: DocumentListSidebar (q-item 리스트)

---

## 5. 현재 구현 단계

### Phase 1: useMultiSelection.js만 사용 (진행 중)

**문서 관리 툴에 적용**:
1. `useMultiSelection.js` composable 사용
2. UI는 DocumentListSidebar에서 자체 구현
3. 액션 바는 기존 구조에 통합
4. 다양한 사용 패턴 검증

**구현 예시**:
```javascript
// DocumentListSidebar.vue
import { useMultiSelection } from 'src/composables/useMultiSelection.js'

const {
  selectedRows,
  selectedCount,
  multiSelectMode,
  longPressingRowId,
  onRowClick: handleFileClick,
  onRowMouseDown: handleFileMouseDown,
  onRowMouseUp: handleFileMouseUp,
  clearSelection,
} = useMultiSelection({
  items: computed(() => displayFiles.value),
  onSelectionChange: (newSelectedRows) => {
    // 선택 변경 시 처리
  },
})

// UI는 자체 구현
// - 액션 바는 기존 헤더에 통합
// - 체크박스는 q-item에 직접 추가
// - 선택 상태 스타일링 자체 구현
```

### Phase 2: 패턴 정립 (향후)

**다른 프로젝트/컨텐츠 추가 후**:
1. 다양한 사용 패턴 수집
2. 공통 패턴 파악
3. 표준 컴포넌트 설계
4. 컴포넌트화 진행

### Phase 3: 컴포넌트화 (향후)

**표준 컴포넌트 생성**:
- `MultiSelectionBar.vue` (variant 지원)
- `MultiSelectionItem.vue` (렌더러 독립적)
- `MultiSelectionSidebar.vue` (이벤트 기반)
- `useMultiSelectionActions.js` (모듈화된 액션 시스템)

---

## 6. 핵심 설계 결정사항

### 6.1 범용성 우선

- ✅ 모든 렌더러 타입 지원
- ✅ q-item 전용 제한 없음
- ✅ 커스텀 렌더러도 지원

### 6.2 모듈화된 액션

- ✅ 모든 가능한 액션을 모듈화
- ✅ 필요한 것만 선택 사용
- ✅ 확장 가능한 구조

### 6.3 통합된 액션 바

- ✅ 하나의 컴포넌트로 통합
- ✅ variant prop으로 스타일 조정
- ✅ 기능은 모두 동일

### 6.4 이벤트 기반 사이드바

- ✅ 조건부 표시
- ✅ 같은 사이드바 하단 배치
- ✅ 상세 정보 및 개별 액션 제공

---

## 7. 문서 관리 툴 구현 가이드

### 7.1 useMultiSelection.js 사용

```javascript
import { useMultiSelection } from 'src/composables/useMultiSelection.js'

const {
  selectedRows,        // 선택된 파일 배열
  selectedCount,       // 선택된 개수
  multiSelectMode,    // 멀티 셀렉션 모드 여부
  longPressingRowId,  // 롱프레스 중인 파일 ID
  onRowClick,
  onRowMouseDown,
  onRowMouseUp,
  clearSelection,
} = useMultiSelection({
  items: computed(() => displayFiles.value),
  onSelectionChange: (newSelectedRows) => {
    // 선택 변경 시 처리
  },
  onRowClick: (file, event) => {
    // 파일 클릭 처리
  },
})
```

### 7.2 UI 구현

**체크박스 추가**:
```vue
<q-item
  v-for="file in displayFiles"
  :key="file.name"
  :class="{ 'selected': isFileSelected(file) }"
  @click="handleFileClick(file, $event)"
  @mousedown="handleFileMouseDown(file, $event)"
  @mouseup="handleFileMouseUp(file, $event)"
>
  <!-- 체크박스 (멀티 셀렉션 모드일 때만) -->
  <q-item-section avatar v-if="multiSelectMode || selectedCount > 0">
    <q-checkbox
      :model-value="isFileSelected(file)"
      @update:model-value="toggleFileSelection(file)"
      @click.stop
    />
  </q-item-section>
  
  <!-- 기존 아이콘 (단일 선택 모드일 때만) -->
  <q-item-section avatar v-else>
    <q-icon :name="isFavorite(file.name) ? 'star' : 'description'" />
  </q-item-section>
  
  <!-- 파일 정보 -->
  <q-item-section>
    <q-item-label>{{ file.displayName }}</q-item-label>
  </q-item-section>
</q-item>
```

**액션 바 통합**:
```vue
<!-- 기존 헤더에 멀티 셀렉션 상태 표시 -->
<div class="file-list-header">
  <!-- 멀티 셀렉션 모드일 때 -->
  <div v-if="multiSelectMode || selectedCount > 0" class="multi-selection-indicator">
    <q-icon name="check_circle" />
    <span>{{ selectedCount }}개 선택됨</span>
  </div>
  
  <!-- 액션 버튼들 -->
  <div class="multi-actions">
    <q-btn
      v-if="!isTrashView"
      icon="delete"
      label="휴지통으로 이동"
      @click="handleMoveSelectedToTrash"
    />
    <q-btn
      v-if="isTrashView"
      icon="restore"
      label="복원"
      @click="handleRestoreSelected"
    />
    <q-btn
      v-if="isTrashView"
      icon="delete_forever"
      label="영구 삭제"
      @click="handlePermanentlyDeleteSelected"
    />
    <q-btn
      icon="close"
      label="선택 해제"
      @click="clearSelection"
    />
  </div>
</div>
```

### 7.3 일괄 작업 함수

```javascript
// 선택된 파일들을 휴지통으로 이동
async function handleMoveSelectedToTrash() {
  if (selectedRows.value.length === 0) return
  
  const count = selectedRows.value.length
  const confirmed = await $q.dialog({
    title: '휴지통으로 이동',
    message: `선택한 ${count}개 문서를 휴지통으로 이동하시겠습니까?`,
    cancel: true,
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
    message: `선택한 ${count}개 문서를 영구적으로 삭제하시겠습니까?`,
    cancel: true,
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
```

---

## 8. 향후 계획

### 8.1 패턴 수집

1. 문서 관리 툴에서 다양한 사용 패턴 경험
2. 다른 프로젝트/컨텐츠 추가
3. 공통 패턴 파악

### 8.2 표준 컴포넌트 설계

1. 수집된 패턴 기반으로 표준 컴포넌트 설계
2. 범용성과 확장성 확보
3. 모듈화된 액션 시스템 통합

### 8.3 컴포넌트화

1. `MultiSelectionBar.vue` (variant 지원)
2. `MultiSelectionItem.vue` (렌더러 독립적)
3. `MultiSelectionSidebar.vue` (이벤트 기반)
4. `useMultiSelectionActions.js` (모듈화된 액션)

---

## 9. 참고 자료

- `src/composables/useMultiSelection.js` - 핵심 선택 로직
- `src/components/parts-management/PartClassesView.vue` - 멀티 셀렉션 사용 예시
- `src/components/sidebars/left/PartsManagementSidebar.vue` - 멀티 셀렉션 UI 참고

---

## 10. 요약

### 현재 단계
- ✅ `useMultiSelection.js`만 사용하여 문서 관리 툴에 구현
- ✅ 다양한 사용 패턴 경험 및 검증
- ✅ 다른 프로젝트 추가 후 패턴 정립

### 설계 원칙
- ✅ 범용성: 모든 렌더러 타입 지원
- ✅ 모듈화: 액션 시스템 모듈화
- ✅ 통합: 액션 바 하나로 통합 (variant 방식)
- ✅ 이벤트 기반: 사이드바 조건부 표시

### 향후 계획
- 패턴 수집 → 표준 설계 → 컴포넌트화


