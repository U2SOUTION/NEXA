<!-- ComponentLibrarySidebar.vue
  컴포넌트 라이브러리 왼쪽 사이드바 통합 컴포넌트
  헤더 + 각 섹션들을 스크롤 영역에 배치
-->

<template>
  <div class="component-library-sidebar">
    <!-- 헤더 (검색) -->
    <ComponentLibraryHeader @search-change="handleSearchChange" />

    <!-- 스크롤 영역: 각 섹션들 -->
    <q-scroll-area class="component-library-sidebar-scroll-area">
      <!-- 규칙 위반 목록 (최우선) -->
      <ComponentLibraryViolations :violations="props.violations" :selected-violation="props.selectedViolation" @violation-selected="handleViolationSelected" />

      <!-- 카테고리 목록 -->
      <ComponentLibraryCategories :categories="props.categories" :selected-category="props.selectedCategory" :search-query="searchQuery" @category-selected="handleCategorySelected" />

      <!-- 컴포넌트 목록 (선택된 카테고리) -->
      <ComponentLibraryList :categories="props.categories" :selected-category="props.selectedCategory" :selected-component="props.selectedComponent" @component-selected="handleComponentSelected" />

      <!-- 파일 구조 (하위 메뉴) -->
      <ComponentLibraryFileStructure @show-file-structure="handleShowFileStructure" @show-file-structure-detail="handleShowFileStructureDetail" />
    </q-scroll-area>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ComponentLibraryHeader from './ComponentLibraryHeader.vue'
import ComponentLibraryViolations from './ComponentLibraryViolations.vue'
import ComponentLibraryCategories from './ComponentLibraryCategories.vue'
import ComponentLibraryList from './ComponentLibraryList.vue'
import ComponentLibraryFileStructure from './ComponentLibraryFileStructure.vue'

const props = defineProps({
  categories: {
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

const emit = defineEmits(['search-change', 'category-selected', 'component-selected', 'violation-selected', 'show-file-structure', 'show-file-structure-detail'])

// 검색어 상태
const searchQuery = ref('')

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

// 위반 항목 선택
function handleViolationSelected(item) {
  emit('violation-selected', item)
}

// 파일 구조 표시
function handleShowFileStructure() {
  emit('show-file-structure')
}

function handleShowFileStructureDetail() {
  emit('show-file-structure-detail')
}
</script>

<style lang="scss" scoped>
.component-library-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--nexa-surface);
}

.component-library-sidebar-scroll-area {
  flex: 1;
  min-height: 0;
}
</style>
