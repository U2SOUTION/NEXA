<!-- ComponentLibrarySidebar.vue
  컴포넌트 라이브러리 왼쪽 사이드바 통합 컴포넌트
  헤더 + 목록
-->

<template>
  <div class="component-library-sidebar">
    <!-- 헤더 (정보, 액션, 검색, 탭) -->
    <ComponentLibraryHeader :component-count="totalComponentCount" :category-count="props.categories.length" @refresh="handleRefresh" @search-change="handleSearchChange" @settings="handleSettings" @tab-change="handleTabChange" @depth-change="handleDepthChange" />

    <!-- 목록 (탭에 따라 다른 목록 표시) -->
    <ComponentLibraryList
      :active-tab="activeTab"
      :categories="props.categories"
      :manual-categories="props.manualCategories"
      :components="allComponents"
      :selected-category="props.selectedCategory"
      :selected-component="props.selectedComponent"
      :search-query="searchQuery"
      @category-selected="handleCategorySelected"
      @component-selected="handleComponentSelected"
      @dimension-selected="handleDimensionSelected"
      @taxonomy-category-selected="handleTaxonomyCategorySelected"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ComponentLibraryHeader from './ComponentLibraryHeader.vue'
import ComponentLibraryList from './ComponentLibraryList.vue'

const props = defineProps({
  categories: {
    type: Array,
    default: () => [],
  },
  manualCategories: {
    type: Array,
    default: () => [],
  },
  violations: {
    type: Array,
    default: () => [],
  },
  selectedCategory: {
    type: String,
    default: null,
  },
  selectedComponent: {
    type: Object,
    default: null,
  },
  selectedViolation: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['search-change', 'category-selected', 'component-selected', 'violation-selected', 'show-file-structure', 'show-file-structure-detail', 'refresh', 'settings', 'tab-change', 'depth-change', 'dimension-selected', 'taxonomy-category-selected'])

// 검색어 상태
const searchQuery = ref('')

// 탭 상태 (기본값: 전체)
const activeTab = ref('all')

// 전체 컴포넌트 목록
const allComponents = computed(() => {
  return props.categories.flatMap((category) => category.components || [])
})

// 전체 컴포넌트 수
const totalComponentCount = computed(() => {
  return allComponents.value.length
})

// 검색 변경
function handleSearchChange(value) {
  searchQuery.value = value
  emit('search-change', value)
}

// 카테고리 선택
function handleCategorySelected(categoryName) {
  emit('category-selected', categoryName)
}

// 컴포넌트 선택
function handleComponentSelected(component) {
  emit('component-selected', component)
}

// 차원 선택 (부류체계)
function handleDimensionSelected(dimensionId) {
  emit('dimension-selected', dimensionId)
}

// 부류체계 카테고리 선택
function handleTaxonomyCategorySelected(data) {
  emit('taxonomy-category-selected', data)
}

// 새로고침
function handleRefresh() {
  emit('refresh')
}

// 설정
function handleSettings() {
  emit('settings')
}

// 탭 변경
function handleTabChange(tabName) {
  console.log('[ComponentLibrarySidebar] 탭 변경:', tabName)
  activeTab.value = tabName
  emit('tab-change', tabName)
  console.log('[ComponentLibrarySidebar] 탭 변경 이벤트 emit 완료')
}

// 깊이 변경
function handleDepthChange(depth) {
  emit('depth-change', depth)
}
</script>

<style lang="scss" scoped>
.component-library-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--nexa-surface);
}
</style>
