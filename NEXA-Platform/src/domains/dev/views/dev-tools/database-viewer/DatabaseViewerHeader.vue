<!-- DatabaseViewerHeader.vue
  데이터베이스 뷰어 헤더 컴포넌트
  데이터베이스 정보, 새로고침, 검색 기능 포함
-->

<template>
  <div class="database-viewer-header">
    <!-- 데이터베이스 정보 -->
    <div class="database-info-section q-pa-sm">
      <div class="row items-center q-gutter-sm">
        <q-icon name="storage" size="20px" color="primary" />
        <div class="col">
          <div class="database-name">{{ props.dbInfo.databaseName || '데이터베이스' }}</div>
          <div class="database-meta text-caption">
            <span v-if="props.dbInfo.version">MySQL {{ props.dbInfo.version }}</span>
            <span v-if="props.tableCount > 0" class="q-ml-sm">테이블 {{ props.tableCount }}개</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 액션 버튼 -->
    <div class="header-actions q-pa-sm row items-center q-gutter-xs">
      <q-btn flat dense icon="refresh" label="새로고침" size="sm" @click="handleRefresh" :loading="isRefreshing" />
      <q-btn flat dense icon="search" label="검색" size="sm" @click="toggleSearch" />
      <q-space />
      <q-btn flat dense icon="settings" size="sm" @click="handleSettings" />
    </div>

    <!-- 검색 입력 (검색 모드일 때만 표시) -->
    <div v-if="showSearch" class="search-section q-pa-sm">
      <q-input v-model="searchQuery" placeholder="테이블명 검색..." outlined dense clearable @update:model-value="handleSearchChange" @clear="handleSearchClear">
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <!-- 서브 메뉴 탭 -->
    <div class="sub-menu-tabs">
      <q-tabs v-model="activeSubMenu" dense class="text-grey-7" active-color="primary" indicator-color="primary" align="justify" @update:model-value="handleSubMenuChange">
        <q-tab name="erd" label="ERD" icon="account_tree" />
        <q-tab name="editor" label="편집기" icon="edit" />
        <q-tab name="query" label="SQL" icon="code" />
      </q-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  dbInfo: {
    type: Object,
    default: () => ({
      databaseName: null,
      version: null,
      charset: null,
    }),
  },
  tableCount: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['refresh', 'search-change', 'settings', 'sub-menu-change'])

// 검색 관련 상태
const showSearch = ref(false)
const searchQuery = ref('')
const isRefreshing = ref(false)

// 서브 메뉴 상태
const activeSubMenu = ref('erd')

// 새로고침
function handleRefresh() {
  isRefreshing.value = true
  emit('refresh')
  // 로딩 상태는 부모 컴포넌트에서 관리
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

// 설정
function handleSettings() {
  emit('settings')
}

// 서브 메뉴 변경
function handleSubMenuChange(menuName) {
  emit('sub-menu-change', menuName)
}
</script>

<style lang="scss" scoped>
.database-viewer-header {
  border-bottom: 1px solid var(--nexa-border-color);
  background-color: var(--nexa-surface);
}

.database-info-section {
  border-bottom: 1px solid var(--nexa-border-color);
}

.database-name {
  font-weight: 600;
  color: var(--nexa-text-primary);
  font-size: 0.95rem;
}

.database-meta {
  color: var(--nexa-text-secondary);
  margin-top: 2px;
}

.header-actions {
  border-bottom: 1px solid var(--nexa-border-color);
}

.search-section {
  border-top: 1px solid var(--nexa-border-color);
}

.sub-menu-tabs {
  border-top: 1px solid var(--nexa-border-color);
  background-color: var(--nexa-surface);
}
</style>
