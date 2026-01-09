<!-- DevGuideHeader.vue
  개발 가이드 헤더 컴포넌트
  검색, 필터, 뷰 모드 전환 등 포함
-->
<template>
  <div class="dev-guide-header">
    <!-- 헤더 타이틀 및 액션 버튼 -->
    <div class="header-title-section q-px-sm q-pt-sm q-pb-sm">
      <div class="row items-center justify-between">
        <div class="header-title">Development Guide</div>
        <div class="row q-gutter-xs">
          <!-- 뷰 모드 토글 -->
          <q-btn flat dense :icon="localViewMode === 'flat' ? 'view_list' : 'account_tree'" size="sm" @click="handleViewModeToggle">
            <q-tooltip>{{ localViewMode === 'flat' ? '평면 모드' : '계층 모드' }} (클릭하여 전환)</q-tooltip>
          </q-btn>
          <q-btn flat dense icon="refresh" size="sm" @click="handleRefresh">
            <q-tooltip>새로고침</q-tooltip>
          </q-btn>
          <q-btn flat dense icon="settings" size="sm" @click="handleSettings">
            <q-tooltip>설정</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- 검색 및 필터 섹션 -->
    <div class="header-section q-px-sm q-pt-sm q-pb-none">
      <!-- 검색 입력 -->
      <div class="row items-center q-gutter-sm q-mb-sm">
        <q-input v-model="localSearchQuery" placeholder="샘플 검색 (키워드, 태그)" dense outlined clearable class="search-input" @update:model-value="handleSearchChangeLocal">
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <!-- 필터 및 옵션 -->
      <div class="row q-gutter-sm q-mb-sm items-center">
        <!-- 카테고리 필터 -->
        <div class="col">
          <q-select v-model="localFilterCategory" :options="categoryOptions" option-label="label" option-value="value" emit-value map-options dense outlined clearable placeholder="카테고리 필터" class="filter-select" @update:model-value="handleCategoryFilterChangeLocal">
            <template v-slot:prepend>
              <q-icon name="filter_alt" />
            </template>
          </q-select>
        </div>
        <!-- 리스트 필터링 토글 버튼 -->
        <div class="filter-list-toggle">
          <q-btn :label="localFilterListOnSearch ? '리스트필터' : '리스트보존'" :icon="localFilterListOnSearch ? 'filter_list' : 'list'" rounded :class="{ 'filter-toggle-active': localFilterListOnSearch, 'filter-toggle-inactive': !localFilterListOnSearch }" @click="handleFilterListOnSearchToggle">
            <q-tooltip>리스트 필터링 {{ localFilterListOnSearch ? 'ON' : 'OFF' }}</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useDevGuide } from 'src/system/composables/useDevGuide'

defineProps({
  headerHovered: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['refresh', 'settings'])

const { searchQuery, filterCategory, viewMode, filterListOnSearch, categories, handleSearchChange, handleCategoryFilterChange, handleViewModeChange, handleFilterListOnSearchChange } = useDevGuide()

// 로컬 상태 (양방향 바인딩)
const localSearchQuery = ref(searchQuery.value)
const localFilterCategory = ref(filterCategory.value)
const localViewMode = ref(viewMode.value)
const localFilterListOnSearch = ref(filterListOnSearch.value)

// 카테고리 옵션
const categoryOptions = computed(() => categories.value)

// 검색 변경 핸들러
function handleSearchChangeLocal(value) {
  localSearchQuery.value = value
  handleSearchChange(value)
}

// 카테고리 필터 변경 핸들러
function handleCategoryFilterChangeLocal(value) {
  localFilterCategory.value = value
  handleCategoryFilterChange(value)
}

// 리스트 필터링 토글 버튼 클릭 핸들러
function handleFilterListOnSearchToggle() {
  const newValue = !localFilterListOnSearch.value
  localFilterListOnSearch.value = newValue
  handleFilterListOnSearchChange(newValue)
}

// 뷰 모드 토글 핸들러
function handleViewModeToggle() {
  const newMode = localViewMode.value === 'flat' ? 'hierarchy' : 'flat'
  localViewMode.value = newMode
  handleViewModeChange(newMode)
}

// 새로고침 핸들러
function handleRefresh() {
  emit('refresh')
}

// 설정 핸들러
function handleSettings() {
  emit('settings')
}

// 외부 상태 변경 감시
watch(
  () => searchQuery.value,
  (newValue) => {
    if (localSearchQuery.value !== newValue) {
      localSearchQuery.value = newValue
    }
  },
)

watch(
  () => filterCategory.value,
  (newValue) => {
    if (localFilterCategory.value !== newValue) {
      localFilterCategory.value = newValue
    }
  },
)

watch(
  () => viewMode.value,
  (newValue) => {
    if (localViewMode.value !== newValue) {
      localViewMode.value = newValue
    }
  },
)

watch(
  () => filterListOnSearch.value,
  (newValue) => {
    if (localFilterListOnSearch.value !== newValue) {
      localFilterListOnSearch.value = newValue
    }
  },
)
</script>

<style lang="scss" scoped>
.dev-guide-header {
  // border-bottom: 1px solid var(--nexa-border-color);

  .header-title-section {
    border-bottom: 1px solid var(--nexa-border-color);
    //margin-bottom: 2px;

    .header-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--nexa-text-primary);
    }

    .q-btn {
      color: var(--nexa-text-secondary);
      transition:
        color 0.2s ease,
        background-color 0.2s ease;

      &:hover {
        color: var(--nexa-primary);
        background-color: color-mix(in srgb, var(--nexa-primary) 10%, transparent);
      }

      :deep(.q-icon) {
        font-size: 18px;
      }
    }
  }

  .header-section {
    .search-input {
      width: 100%;

      :deep(.q-field__control) {
        border: 2px solid var(--nexa-primary);
        border-radius: 4px;
      }

      :deep(.q-field__native) {
        color: var(--nexa-text-primary);
      }

      :deep(.q-field__prepend) {
        color: var(--nexa-primary);
      }

      &:focus-within {
        :deep(.q-field__control) {
          border-color: var(--nexa-primary);
        }
      }
    }

    .filter-select {
      width: 100%;
    }

    .filter-list-toggle {
      flex-shrink: 0;

      .q-btn {
        height: 30px; // 입력 필터와 동일한 높이
        min-width: auto; // 최소 너비 자동
        padding: 0 12px; // 좌우 패딩으로 여백 확보
        font-size: 0.8rem;
        letter-spacing: 0.04em;
        white-space: nowrap;
        border-radius: 4px;
        transition:
          background-color 0.2s ease,
          color 0.2s ease;
        overflow: hidden; // 버튼 전체 줄바꿈 방지

        // 버튼 컨텐츠 왼쪽 정렬 및 한 줄 유지
        :deep(.q-btn__content) {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          flex-wrap: nowrap;
          width: 100%;
        }

        // 아이콘 크기 및 간격 설정
        :deep(.q-icon) {
          font-size: 16px;
          margin-right: 4px;
          flex-shrink: 0; // 아이콘 크기 고정
        }

        // 라벨 줄바꿈 방지
        :deep(.q-btn__label) {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex-shrink: 1; // 라벨은 필요시 축소 가능
          min-width: 0; // flex 축소 허용
        }

        &.filter-toggle-active {
          background-color: var(--nexa-button-primary-bg);
          color: var(--nexa-button-primary-text);

          :deep(.q-icon) {
            color: var(--nexa-button-primary-text);
          }
        }

        &.filter-toggle-inactive {
          background-color: var(--nexa-surface);
          color: var(--nexa-text-secondary);

          :deep(.q-icon) {
            color: var(--nexa-text-secondary);
          }
        }

        &:hover {
          opacity: 0.8;
        }
      }
    }
  }
}
</style>
