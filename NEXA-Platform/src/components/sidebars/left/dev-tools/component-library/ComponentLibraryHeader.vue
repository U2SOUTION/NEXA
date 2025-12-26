<!-- ComponentLibraryHeader.vue
  컴포넌트 라이브러리 왼쪽 사이드바 헤더 컴포넌트
  검색 기능 포함
-->

<template>
  <div class="component-library-header">
    <!-- 검색 입력 -->
    <div class="search-section q-pa-sm">
      <q-input v-model="searchQuery" placeholder="컴포넌트 검색..." outlined dense clearable @update:model-value="handleSearchChange" @clear="handleSearchClear">
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['search-change'])

// 검색 관련 상태
const searchQuery = ref('')

// 검색 변경
function handleSearchChange(value) {
  emit('search-change', value || '')
}

// 검색 초기화
function handleSearchClear() {
  searchQuery.value = ''
  emit('search-change', '')
}
</script>

<style lang="scss" scoped>
.component-library-header {
  border-bottom: 1px solid var(--nexa-border-color);
  background-color: var(--nexa-surface);
}

.search-section {
  border-bottom: 1px solid var(--nexa-border-color);
}
</style>

