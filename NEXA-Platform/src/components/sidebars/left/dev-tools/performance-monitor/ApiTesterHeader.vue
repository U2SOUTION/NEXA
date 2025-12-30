<!-- ApiTesterHeader.vue
  API 테스터 헤더 컴포넌트
  검색, 새로고침, 설정
-->

<template>
  <div class="api-tester-header">
    <div class="header-content q-pa-md">
      <div class="row items-center justify-between">
        <div class="row items-center q-gutter-sm">
          <q-icon name="api" size="20px" color="primary" />
          <div class="header-title">API TESTER</div>
        </div>
        <div class="row items-center q-gutter-xs">
          <q-btn
            flat
            dense
            round
            size="sm"
            icon="search"
            @click="toggleSearch"
          >
            <q-tooltip>검색</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            round
            size="sm"
            icon="refresh"
            @click="handleRefresh"
          >
            <q-tooltip>새로고침</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            round
            size="sm"
            icon="settings"
            @click="handleSettings"
          >
            <q-tooltip>설정</q-tooltip>
          </q-btn>
        </div>
      </div>

      <!-- 검색 입력 (검색 모드일 때만 표시) -->
      <div v-if="showSearch" class="search-section q-mt-sm">
        <q-input
          v-model="searchQuery"
          placeholder="API 요청 검색..."
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
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showSearch = ref(false)
const searchQuery = ref('')

const emit = defineEmits(['refresh', 'search-change', 'settings'])

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

function handleSettings() {
  emit('settings')
}
</script>

<style lang="scss" scoped>
.api-tester-header {
  background: var(--nexa-background-darker);
  border-bottom: 1px solid var(--nexa-border-color);
}

.header-content {
  .header-title {
    color: var(--nexa-text-primary);
    font-size: 0.875rem;
    font-weight: 600;
  }
}

.search-section {
  // 검색 섹션 스타일
}
</style>
