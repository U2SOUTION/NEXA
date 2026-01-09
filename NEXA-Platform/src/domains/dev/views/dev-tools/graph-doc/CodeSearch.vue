<!-- CodeSearch.vue
  코드 검색 컴포넌트
  검색 입력, 검색 버튼, 설정
-->

<template>
  <div class="code-search">
    <div class="header-content q-pa-md">
      <div class="row items-center q-gutter-sm q-mb-sm">
        <q-icon name="search" size="20px" color="primary" />
        <div class="header-title">코드 검색</div>
        <q-space />
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

      <!-- 검색 입력 -->
      <div class="search-section">
        <q-input
          :model-value="searchQuery"
          placeholder="코드 검색..."
          outlined
          dense
          clearable
          @update:model-value="handleSearchChange"
          @keyup.enter="handleSearch"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
          <template #append>
            <q-btn
              flat
              dense
              round
              icon="search"
              @click="handleSearch"
            />
          </template>
        </q-input>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  searchQuery: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['search-change', 'search', 'settings'])

function handleSearchChange(value) {
  emit('search-change', value)
}

function handleSearch() {
  emit('search')
}

function handleSettings() {
  emit('settings')
}
</script>

<style lang="scss" scoped>
.code-search {
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
