<!-- NetworkHeader.vue
  네트워크 헤더 컴포넌트
  네트워크 통계, 검색, 필터, 설정
-->

<template>
  <div class="network-header">
    <!-- 네트워크 정보 -->
    <div class="network-info-section q-pa-sm">
      <div class="row items-center q-gutter-sm">
        <div class="col">
          <div class="network-name">NETWORK</div>
          <div class="network-meta text-caption">
            <span v-if="totalRequests > 0">총 요청 {{ totalRequests }}개</span>
            <span v-if="activeRequests > 0" class="q-ml-sm text-primary">진행 중 {{ activeRequests }}개</span>
          </div>
        </div>
        <div class="row items-center q-gutter-xs">
          <q-btn flat dense icon="search" size="sm" @click="toggleSearch" />
          <q-btn flat dense icon="refresh" size="sm" @click="handleRefresh" />
          <q-btn flat dense icon="settings" size="sm" @click="handleSettings" />
        </div>
      </div>
    </div>

    <!-- 검색 입력 (검색 모드일 때만 표시) -->
    <div v-if="showSearch" class="search-section q-pa-sm">
      <q-input
        v-model="searchQuery"
        placeholder="URL, 메서드 검색..."
        outlined
        dense
        clearable
        @update:model-value="handleSearchChange"
        @clear="handleSearchClear"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <!-- 필터 섹션 -->
    <div class="filter-section q-pa-sm">
      <div class="row q-gutter-xs no-wrap">
        <div class="col">
          <q-select
            v-model="selectedMethod"
            :options="methodOptions"
            dense
            outlined
            label="메서드"
            @update:model-value="handleFilterChange"
          />
        </div>
        <div class="col">
          <q-select
            v-model="selectedStatus"
            :options="statusOptions"
            dense
            outlined
            label="상태"
            @update:model-value="handleFilterChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  totalRequests: {
    type: Number,
    default: 0,
  },
  activeRequests: {
    type: Number,
    default: 0,
  },
})

const showSearch = ref(false)
const searchQuery = ref('')
const selectedMethod = ref(null)
const selectedStatus = ref(null)

const methodOptions = [
  { label: '전체', value: null },
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
  { label: 'PATCH', value: 'PATCH' },
]

const statusOptions = [
  { label: '전체', value: null },
  { label: '성공 (2xx)', value: '2xx' },
  { label: '클라이언트 오류 (4xx)', value: '4xx' },
  { label: '서버 오류 (5xx)', value: '5xx' },
]

const emit = defineEmits(['refresh', 'search-change', 'filter-change', 'settings'])

function toggleSearch() {
  showSearch.value = !showSearch.value
  if (!showSearch.value) {
    searchQuery.value = ''
    handleSearchChange('')
  }
}

function handleRefresh() {
  emit('refresh')
}

function handleSearchChange(value) {
  emit('search-change', value)
}

function handleSearchClear() {
  searchQuery.value = ''
  handleSearchChange('')
}

function handleFilterChange() {
  emit('filter-change', {
    method: selectedMethod.value,
    status: selectedStatus.value,
  })
}

function handleSettings() {
  emit('settings')
}
</script>

<style lang="scss" scoped>
.network-header {
  background: var(--nexa-background-darker);
  border-bottom: 1px solid var(--nexa-border-color);
}

.network-info-section {
  .network-name {
    color: var(--nexa-text-primary);
    font-size: 0.875rem;
    font-weight: 600;
  }

  .network-meta {
    color: var(--nexa-text-secondary);
  }
}

.search-section {
  // 검색 섹션 스타일
}

.filter-section {
  // 필터 섹션 스타일
}
</style>
