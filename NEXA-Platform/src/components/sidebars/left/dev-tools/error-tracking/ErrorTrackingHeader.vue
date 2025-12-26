<!-- ErrorTrackingHeader.vue
  에러 트래킹 헤더 컴포넌트
  에러 통계, 검색, 필터, 액션 버튼 포함
-->

<template>
  <div class="error-tracking-header">
    <!-- 에러 트래킹 정보 -->
    <div class="error-info-section q-pa-sm">
      <div class="row items-center q-gutter-sm">
        <div class="col">
          <div class="error-tracking-name">Error Tracking</div>
          <div class="error-meta text-caption">
            <span v-if="totalErrors > 0">총 에러 {{ totalErrors }}개</span>
            <span v-if="newErrors > 0" class="q-ml-sm text-negative">신규 {{ newErrors }}개</span>
          </div>
        </div>
        <div class="row items-center q-gutter-xs">
          <q-btn flat dense icon="search" size="sm" @click="toggleSearch" />
          <q-btn flat dense icon="refresh" size="sm" @click="handleRefresh" :loading="isRefreshing" />
          <q-toggle :model-value="isCollecting" size="sm" @update:model-value="handleCollectingToggle" />
          <q-btn flat dense icon="settings" size="sm" @click="handleSettings" />
        </div>
      </div>
    </div>

    <!-- 검색 입력 (검색 모드일 때만 표시) -->
    <div v-if="showSearch" class="search-section q-pa-sm">
      <q-input v-model="searchQuery" placeholder="에러 메시지, 파일명 검색..." outlined dense clearable @update:model-value="handleSearchChange" @clear="handleSearchClear">
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <!-- 필터 섹션 (항상 표시) -->
    <div class="filter-section">
      <div class="row q-gutter-xs no-wrap">
        <div class="col">
          <q-select v-model="selectedLevel" :options="levelOptions" dense outlined label="레벨" @update:model-value="handleFilterChange" />
        </div>
        <div class="col">
          <q-select v-model="selectedStatus" :options="statusOptions" dense outlined label="상태" @update:model-value="handleFilterChange" />
        </div>
        <div class="col">
          <q-select v-model="selectedTimeRange" :options="timeRangeOptions" dense outlined label="기간" @update:model-value="handleFilterChange" />
        </div>
        <div class="col">
          <q-select v-model="selectedSort" :options="sortOptions" dense outlined label="정렬" @update:model-value="handleSortChange" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  totalErrors: {
    type: Number,
    default: 0,
  },
  newErrors: {
    type: Number,
    default: 0,
  },
  isCollecting: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['refresh', 'search-change', 'settings', 'filter-change', 'sort-change', 'collecting-toggle'])

// 검색 관련 상태
const showSearch = ref(false)
const searchQuery = ref('')
const isRefreshing = ref(false)

// 필터 관련 상태
const selectedLevel = ref(null)
const selectedStatus = ref(null)
const selectedTimeRange = ref(null)
const selectedSort = ref({ label: '최신순', value: 'newest' })

// 필터 옵션
const levelOptions = [
  { label: '전체', value: null },
  { label: 'Error', value: 'error' },
  { label: 'Warning', value: 'warning' },
  { label: 'Unhandled Rejection', value: 'unhandled' },
  { label: 'Lint', value: 'lint' },
]

const statusOptions = [
  { label: '전체', value: null },
  { label: '새 에러', value: 'new' },
  { label: '해결됨', value: 'resolved' },
  { label: '무시됨', value: 'ignored' },
]

const timeRangeOptions = [
  { label: '전체', value: null },
  { label: '오늘', value: 'today' },
  { label: '어제', value: 'yesterday' },
  { label: '최근 7일', value: '7days' },
  { label: '최근 30일', value: '30days' },
]

const sortOptions = [
  { label: '최신순', value: 'newest' },
  { label: '빈도순', value: 'frequency' },
  { label: '심각도순', value: 'severity' },
]

// 새로고침
function handleRefresh() {
  isRefreshing.value = true
  emit('refresh')
  setTimeout(() => {
    isRefreshing.value = false
  }, 500)
}

// 검색 토글
function toggleSearch() {
  showSearch.value = !showSearch.value
  if (!showSearch.value) {
    searchQuery.value = ''
    handleSearchClear()
  }
}

// 검색 변경
function handleSearchChange(value) {
  emit('search-change', value || '')
}

// 검색 초기화
function handleSearchClear() {
  searchQuery.value = ''
  emit('search-change', '')
}

// 필터 변경
function handleFilterChange() {
  emit('filter-change', {
    level: selectedLevel.value?.value,
    status: selectedStatus.value?.value,
    timeRange: selectedTimeRange.value?.value,
  })
}

// 정렬 변경
function handleSortChange(option) {
  emit('sort-change', option.value)
}

// 설정
function handleSettings() {
  emit('settings')
}

// 수집 토글
function handleCollectingToggle(value) {
  emit('collecting-toggle', value)
}
</script>

<style lang="scss" scoped>
.error-tracking-header {
  border-bottom: 1px solid var(--nexa-border-color);
  background-color: var(--nexa-surface);
}

.error-tracking-name {
  font-weight: 900;
  color: var(--nexa-text-primary);
  font-size: 1.95rem;
}

.error-meta {
  color: var(--nexa-text-secondary);
  margin-top: 2px;
}

.search-section {
  border-top: 1px solid var(--nexa-border-color);
}

.filter-section {
  background-color: var(--nexa-surface);
  margin-top: 5px;

  // Container Query를 사용하여 사이드바 너비 기준으로 화살표 숨기기
  // 사이드바가 400px 이하일 때 화살표 숨김
  @container error-tracking-sidebar (max-width: 400px) {
    :deep(.q-select__dropdown-icon) {
      display: none !important;
    }

    :deep(.q-field__append) {
      display: none !important;
    }
  }
}
</style>
