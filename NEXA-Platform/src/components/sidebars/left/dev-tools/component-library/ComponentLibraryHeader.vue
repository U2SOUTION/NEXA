<!-- ComponentLibraryHeader.vue
  컴포넌트 라이브러리 헤더 컴포넌트
  정보, 액션 버튼, 검색, 탭 포함
-->

<template>
  <div class="component-library-header">
    <!-- 컴포넌트 라이브러리 정보 -->
    <div class="library-info-section q-pa-sm">
      <div class="row items-center q-gutter-sm">
        <q-icon name="widgets" size="20px" color="primary" />
        <div class="col">
          <div class="library-name">Component Library</div>
          <div class="library-meta text-caption">
            <span v-if="props.componentCount > 0">컴포넌트 {{ props.componentCount }}개</span>
            <span v-if="props.categoryCount > 0" class="q-ml-sm">카테고리 {{ props.categoryCount }}개</span>
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
      <q-input v-model="searchQuery" placeholder="컴포넌트 검색..." outlined dense clearable @update:model-value="handleSearchChange" @clear="handleSearchClear">
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <!-- 서브 메뉴 탭 -->
    <div class="sub-menu-tabs">
      <q-tabs v-model="activeTab" dense class="text-grey-7" active-color="primary" indicator-color="primary" align="justify" @update:model-value="handleTabChange">
        <q-tab name="categories" label="카테고리" icon="folder" />
        <q-tab name="components" label="컴포넌트" icon="widgets" />
        <q-tab name="taxonomy" label="부류체계" icon="account_tree" />
      </q-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  componentCount: {
    type: Number,
    default: 0,
  },
  categoryCount: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['refresh', 'search-change', 'settings', 'tab-change'])

// 검색 관련 상태
const showSearch = ref(false)
const searchQuery = ref('')
const isRefreshing = ref(false)

// 탭 상태 (부모와 동기화)
const activeTab = ref('categories')

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

// 설정
function handleSettings() {
  emit('settings')
}

// 탭 변경
function handleTabChange(tabName) {
  activeTab.value = tabName
  emit('tab-change', tabName)
}
</script>

<style lang="scss" scoped>
.component-library-header {
  border-bottom: 1px solid var(--nexa-border-color);
  background-color: var(--nexa-surface);
}

.library-info-section {
  border-bottom: 1px solid var(--nexa-border-color);
}

.library-name {
  font-weight: 600;
  color: var(--nexa-text-primary);
  font-size: 0.95rem;
}

.library-meta {
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
