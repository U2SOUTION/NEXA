<!-- ErrorTrackingSidebar.vue
  에러 트래킹 왼쪽 사이드바 통합 컴포넌트
  헤더 + 목록
-->

<template>
  <div class="error-tracking-sidebar">
    <!-- 헤더 (정보, 액션, 검색, 필터) -->
    <ErrorTrackingHeader
      :total-errors="statistics.total"
      :new-errors="statistics.new"
      :is-collecting="isCollecting"
      @refresh="handleRefresh"
      @search-change="handleSearchChange"
      @settings="handleSettings"
      @filter-change="handleFilterChange"
      @sort-change="handleSortChange"
      @collecting-toggle="handleCollectingToggle"
    />

    <!-- 목록 -->
    <ErrorTrackingList
      :errors="filteredErrors"
      :search-query="searchQuery"
      :selected-error="selectedError"
      :is-loading="isLoading"
      @error-selected="handleErrorSelect"
      @tab-change="handleTabChange"
    />
  </div>
</template>

<script setup>
import ErrorTrackingHeader from './ErrorTrackingHeader.vue'
import ErrorTrackingList from './ErrorTrackingList.vue'

defineProps({
  errors: {
    type: Array,
    default: () => [],
  },
  filteredErrors: {
    type: Array,
    default: () => [],
  },
  selectedError: {
    type: Object,
    default: null,
  },
  searchQuery: {
    type: String,
    default: '',
  },
  isCollecting: {
    type: Boolean,
    default: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  statistics: {
    type: Object,
    default: () => ({
      total: 0,
      new: 0,
      resolved: 0,
      ignored: 0,
      today: 0,
    }),
  },
})

const emit = defineEmits(['refresh', 'search-change', 'settings', 'filter-change', 'sort-change', 'collecting-toggle', 'error-selected', 'tab-change'])

// 새로고침
function handleRefresh() {
  emit('refresh')
}

// 검색 변경
function handleSearchChange(value) {
  emit('search-change', value)
}

// 필터 변경
function handleFilterChange(filters) {
  emit('filter-change', filters)
}

// 정렬 변경
function handleSortChange(option) {
  emit('sort-change', option)
}

// 수집 토글
function handleCollectingToggle(enabled) {
  emit('collecting-toggle', enabled)
}

// 에러 선택
function handleErrorSelect(error) {
  emit('error-selected', error)
}

// 설정
function handleSettings() {
  emit('settings')
}

// 탭 변경
function handleTabChange(tab) {
  emit('tab-change', tab)
}
</script>

<style lang="scss" scoped>
.error-tracking-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--nexa-surface);
}
</style>

