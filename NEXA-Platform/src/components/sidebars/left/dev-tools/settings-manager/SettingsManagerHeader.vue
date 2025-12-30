<!-- SettingsManagerHeader.vue
  설정 관리 헤더 컴포넌트
  검색, 필터, 새로고침 등 포함
-->
<template>
  <div class="settings-manager-header">
    <!-- 헤더 타이틀 및 액션 버튼 -->
    <div class="header-title-section q-px-sm q-pt-sm q-pb-sm">
      <div class="row items-center justify-between">
        <div class="header-title">Settings Manager</div>
        <div class="row q-gutter-xs">
          <q-btn flat dense icon="refresh" size="sm" :loading="isRefreshing" @click="handleRefresh">
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
        <q-input
          v-model="localSearchQuery"
          placeholder="설정 검색 (이름, 경로, 카테고리)"
          dense
          outlined
          clearable
          class="search-input"
          @update:model-value="handleSearchChangeLocal"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <!-- 필터 -->
      <div class="row q-gutter-sm q-mb-sm items-center">
        <!-- 카테고리 필터 -->
        <div class="col">
          <q-select
            v-model="localFilterCategory"
            :options="categoryOptions"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            dense
            outlined
            clearable
            placeholder="카테고리 필터"
            class="filter-select"
            @update:model-value="handleCategoryFilterChangeLocal"
          >
            <template v-slot:prepend>
              <q-icon name="filter_alt" />
            </template>
          </q-select>
        </div>
        <!-- 타입 필터 -->
        <div class="col">
          <q-select
            v-model="localFilterType"
            :options="typeOptions"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            dense
            outlined
            clearable
            placeholder="타입 필터"
            class="filter-select"
            @update:model-value="handleTypeFilterChangeLocal"
          >
            <template v-slot:prepend>
              <q-icon name="category" />
            </template>
          </q-select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  headerHovered: {
    type: Boolean,
    default: false,
  },
  searchQuery: {
    type: String,
    default: '',
  },
  filterCategory: {
    type: String,
    default: null,
  },
  filterType: {
    type: String,
    default: null,
  },
  categories: {
    type: Array,
    default: () => [],
  },
  types: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['search-change', 'category-filter-change', 'type-filter-change', 'refresh', 'settings'])

// 로컬 상태
const localSearchQuery = ref(props.searchQuery)
const localFilterCategory = ref(props.filterCategory)
const localFilterType = ref(props.filterType)
const isRefreshing = ref(false)

// 카테고리 옵션
const categoryOptions = computed(() => {
  return [
    { label: '전체', value: null },
    ...props.categories.map(cat => ({ label: cat, value: cat })),
  ]
})

// 타입 옵션
const typeOptions = computed(() => {
  return [
    { label: '전체', value: null },
    ...props.types.map(type => ({ label: type, value: type })),
  ]
})

// 검색 변경 핸들러
function handleSearchChangeLocal(value) {
  localSearchQuery.value = value
  emit('search-change', value)
}

// 카테고리 필터 변경 핸들러
function handleCategoryFilterChangeLocal(value) {
  localFilterCategory.value = value
  emit('category-filter-change', value)
}

// 타입 필터 변경 핸들러
function handleTypeFilterChangeLocal(value) {
  localFilterType.value = value
  emit('type-filter-change', value)
}

// 새로고침 핸들러
async function handleRefresh() {
  isRefreshing.value = true
  emit('refresh')
  // 새로고침 애니메이션을 위해 약간의 지연
  setTimeout(() => {
    isRefreshing.value = false
  }, 500)
}

// 설정 핸들러
function handleSettings() {
  emit('settings')
}

// 외부 상태 변경 감시
watch(
  () => props.searchQuery,
  (newValue) => {
    if (localSearchQuery.value !== newValue) {
      localSearchQuery.value = newValue
    }
  },
)

watch(
  () => props.filterCategory,
  (newValue) => {
    if (localFilterCategory.value !== newValue) {
      localFilterCategory.value = newValue
    }
  },
)

watch(
  () => props.filterType,
  (newValue) => {
    if (localFilterType.value !== newValue) {
      localFilterType.value = newValue
    }
  },
)
</script>

<style lang="scss" scoped>
.settings-manager-header {
  .header-title-section {
    border-bottom: 1px solid var(--nexa-border-color);

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
  }
}
</style>
