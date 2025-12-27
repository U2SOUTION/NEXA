<!-- DevGuideHeader.vue
  개발 가이드 헤더 컴포넌트
  검색, 필터, 뷰 모드 전환 등 포함
-->
<template>
  <div class="dev-guide-header">
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
      <div class="row q-gutter-sm q-mb-sm">
        <!-- 카테고리 필터 -->
        <div class="col">
          <q-select v-model="localFilterCategory" :options="categoryOptions" option-label="label" option-value="value" emit-value map-options dense outlined clearable placeholder="카테고리 필터" class="filter-select" @update:model-value="handleCategoryFilterChangeLocal">
            <template v-slot:prepend>
              <q-icon name="filter_alt" />
            </template>
          </q-select>
        </div>
      </div>

      <!-- 뷰 모드 전환 -->
      <div class="row q-gutter-sm q-mb-sm">
        <q-btn-toggle
          v-model="localViewMode"
          :options="[
            { label: '평면', value: 'flat', icon: 'view_list' },
            { label: '계층', value: 'hierarchy', icon: 'account_tree' },
          ]"
          toggle-color="primary"
          dense
          @update:model-value="handleViewModeChangeLocal"
        />
      </div>

      <!-- 액션 버튼 -->
      <div class="row q-gutter-sm q-mb-sm">
        <q-btn flat dense icon="refresh" @click="handleRefresh" />
        <q-btn flat dense icon="settings" @click="handleSettings" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useDevGuide } from 'src/composables/dev-tools/useDevGuide'

defineProps({
  headerHovered: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['refresh', 'settings'])

const { searchQuery, filterCategory, viewMode, categories, handleSearchChange, handleCategoryFilterChange, handleViewModeChange } = useDevGuide()

// 로컬 상태 (양방향 바인딩)
const localSearchQuery = ref(searchQuery.value)
const localFilterCategory = ref(filterCategory.value)
const localViewMode = ref(viewMode.value)

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

// 뷰 모드 변경 핸들러
function handleViewModeChangeLocal(value) {
  localViewMode.value = value
  handleViewModeChange(value)
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
</script>

<style lang="scss" scoped>
.dev-guide-header {
  .header-section {
    .search-input {
      width: 100%;
    }

    .filter-select {
      width: 100%;
    }
  }
}
</style>
