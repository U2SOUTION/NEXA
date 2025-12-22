<!-- DocumentManagerHeader.vue
  문서 관리 헤더 컴포넌트
  검색 입력 및 필터 아이콘 그리드 포함
-->
<template>
  <div class="document-manager-header">
    <!-- 필터, 옵션 및 전체 통계 요약 (통합 섹션) -->
    <div class="filter-stats-section q-px-sm q-pt-sm q-pb-none">
      <!-- 검색 및 필터 -->
      <div class="row items-center q-gutter-sm q-mb-sm">
        <q-input :model-value="globalSearchQuery" :placeholder="getSearchPlaceholder()" dense outlined clearable class="search-input" @update:model-value="$emit('update:globalSearchQuery', $event)" @keydown.enter.prevent="$emit('performGlobalSearch')">
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
          <template v-slot:append>
            <q-btn flat dense round :icon="getSearchModeIcon()" @click="$emit('toggleSearchMode')" :class="searchMode === 'content' ? 'search-mode-btn-inactive' : 'search-mode-btn-active'" size="sm" class="search-mode-btn">
              <q-tooltip>{{ getSearchModeLabel() }}</q-tooltip>
            </q-btn>
          </template>
        </q-input>
      </div>
      <!-- 6개 아이콘 버튼 그리드 -->
      <div class="row icon-grid-row q-mb-sm">
        <!-- Exclude -->
        <div class="col-2 icon-grid-item" @click="$emit('toggleExcludedFiles')">
          <q-tooltip>{{ showExcludedFiles ? '검색어 제외한 문서 숨기기' : '검색어 제외한 문서 표시' }}</q-tooltip>
          <q-btn flat dense icon="filter_alt" :class="showExcludedFiles ? 'icon-btn-active' : 'icon-btn-inactive'" class="icon-btn-with-label"> </q-btn>
          <div class="icon-label">제외</div>
        </div>
        <!-- Hide -->
        <div class="col-2 icon-grid-item" @click="$emit('toggleHideCompleted')">
          <q-tooltip>{{ hideCompleted ? '완료된 항목 표시' : '완료된 항목 숨기기' }}</q-tooltip>
          <q-btn flat dense :icon="hideCompleted ? 'task_alt' : 'circle'" :class="hideCompleted ? 'icon-btn-active' : 'icon-btn-inactive'" class="icon-btn-with-label"> </q-btn>
          <div class="icon-label">완료</div>
        </div>
        <!-- Highlight -->
        <div class="col-2 icon-grid-item" @click="$emit('toggleHighlight')">
          <q-tooltip>스크롤 시 현재 섹션 하일라이팅</q-tooltip>
          <q-btn flat dense icon="highlight" :class="autoHighlightOnScroll ? 'icon-btn-active' : 'icon-btn-inactive'" class="icon-btn-with-label"> </q-btn>
          <div class="icon-label">강조</div>
        </div>
        <!-- Trash -->
        <div class="col-2 icon-grid-item" @click="$emit('toggleTrashView')">
          <q-tooltip>{{ isTrashView ? '일반 목록으로 돌아가기' : '휴지통 보기' }}</q-tooltip>
          <q-btn flat dense icon="delete_outline" :class="isTrashView ? 'icon-btn-trash' : 'icon-btn-inactive'" class="icon-btn-with-label">
            <q-badge v-if="!isTrashView && trashCount > 0" floating class="trash-badge">
              {{ trashCount }}
            </q-badge>
          </q-btn>
          <div class="icon-label">휴지통</div>
        </div>
        <!-- Refresh -->
        <div class="col-2 icon-grid-item" @click="$emit('loadMarkdownFiles')">
          <q-tooltip>새로고침</q-tooltip>
          <q-btn flat dense icon="refresh" class="icon-btn-active icon-btn-with-label"> </q-btn>
          <div class="icon-label">새로고침</div>
        </div>
        <!-- Settings -->
        <div class="col-2 icon-grid-item" @click="$emit('openSettings')">
          <q-tooltip>설정</q-tooltip>
          <q-btn flat dense icon="settings" class="icon-btn-active icon-btn-with-label"> </q-btn>
          <div class="icon-label">설정</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  headerHovered: {
    type: Boolean,
    default: false,
  },
  globalSearchQuery: {
    type: String,
    default: '',
  },
  searchMode: {
    type: String,
    default: 'both',
  },
  showExcludedFiles: {
    type: Boolean,
    default: false,
  },
  hideCompleted: {
    type: Boolean,
    default: false,
  },
  autoHighlightOnScroll: {
    type: Boolean,
    default: false,
  },
  isTrashView: {
    type: Boolean,
    default: false,
  },
  trashCount: {
    type: Number,
    default: 0,
  },
  getSearchPlaceholder: {
    type: Function,
    required: true,
  },
  getSearchModeIcon: {
    type: Function,
    required: true,
  },
  getSearchModeLabel: {
    type: Function,
    required: true,
  },
})

defineEmits(['update:globalSearchQuery', 'performGlobalSearch', 'toggleSearchMode', 'toggleExcludedFiles', 'toggleHideCompleted', 'toggleHighlight', 'toggleTrashView', 'loadMarkdownFiles', 'openSettings'])
</script>

<style lang="scss" scoped>
// ============================================
// 섹션 스타일
// ============================================
.filter-stats-section {
  background: var(--nexa-background-lower);
  border-top: 1px solid var(--nexa-border-color);
}

// ============================================
// 검색 입력 필드
// ============================================
.search-input {
  flex: 1;
  min-width: 200px;
  background: var(--nexa-background-darker);

  // X 삭제 버튼 위치 조정
  :deep(.q-field__focusable-action) {
    margin-left: -15px !important;
  }

  // 입력 필드 텍스트 중앙 정렬
  :deep(input) {
    text-align: center;
  }

  // 우측 슬롯(append) 아이콘 크기 및 색상
  :deep(.q-field__append) {
    .search-mode-btn {
      .q-icon,
      .q-btn__content .q-icon {
        font-size: 24px !important;
        color: var(--nexa-primary);
      }
    }
  }
}

// 검색 모드 버튼 상태 색상
.search-mode-btn-active {
  :deep(.q-icon) {
    color: var(--nexa-primary);
  }
}

.search-mode-btn-inactive {
  :deep(.q-icon) {
    color: var(--nexa-text-secondary);
  }
}

// ============================================
// 아이콘 그리드
// ============================================
.icon-grid-row {
  display: flex;
  gap: 5px;
}

.icon-grid-item {
  border: 1px solid var(--nexa-border-color);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
  padding: 2px 0 4px 0;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    background-color: var(--nexa-surface);
    border-color: var(--nexa-primary);
  }
}

// 아이콘 버튼 (아이콘 + 레이블 포함)
.icon-btn-with-label {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: auto;
  pointer-events: none; // 클릭 이벤트를 부모 .icon-grid-item으로 전달

  // 아이콘 크기 통일
  :deep(.q-icon) {
    font-size: 22px;
    width: 22px;
    height: 22px;
  }

  // 아이콘 상태별 색상
  &.icon-btn-active {
    :deep(.q-icon) {
      color: var(--nexa-primary);
    }
  }

  &.icon-btn-inactive {
    :deep(.q-icon) {
      color: var(--nexa-text-secondary);
    }
  }

  &.icon-btn-trash {
    :deep(.q-icon) {
      color: var(--nexa-warning);
    }
  }
}

// 아이콘 레이블
.icon-label {
  font-size: 10px;
  margin-top: 0;
  text-align: center;
  line-height: 1;
  color: var(--nexa-primary);
  width: 100%;
}

// ============================================
// 휴지통 뱃지
// ============================================
:deep(.trash-badge) {
  background: transparent;
  color: var(--nexa-warning);
  left: 0;
}

</style>
