<!-- CodeSearchList.vue
  코드 검색 목록 컴포넌트
  검색 결과 목록 표시 및 선택 기능
-->

<template>
  <div class="code-search-list-container">
    <q-scroll-area class="code-search-list-scroll-area">
      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="loading-section q-pa-lg text-center">
        <q-spinner color="primary" size="3em" />
        <div class="q-mt-md text-caption">검색 중...</div>
      </div>

      <!-- 검색 결과 목록 -->
      <q-list v-else separator>
        <q-item
          v-for="result in searchResults"
          :key="result.id"
          clickable
          :active="selectedResult?.id === result.id"
          active-class="result-item-active"
          @click="handleResultSelect(result)"
        >
          <q-item-section avatar>
            <q-icon :name="getFileIcon(result.fileType)" :color="getFileColor(result.fileType)" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="result-file">{{ result.file || '파일 없음' }}</q-item-label>
            <q-item-label caption class="result-meta">
              <span v-if="result.line">라인 {{ result.line }}</span>
              <span v-if="result.match" class="q-ml-sm">{{ result.match }}</span>
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-icon name="chevron_right" color="grey-7" />
          </q-item-section>
        </q-item>

        <!-- 결과가 없을 때 -->
        <div v-if="searchResults.length === 0" class="empty-section q-pa-lg text-center">
          <q-icon name="search" size="48px" color="grey-5" class="q-mb-md" />
          <div class="text-grey-7">검색 결과가 없습니다.</div>
        </div>
      </q-list>
    </q-scroll-area>
  </div>
</template>

<script setup>
defineProps({
  searchResults: {
    type: Array,
    default: () => [],
  },
  selectedResult: {
    type: Object,
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['result-selected'])

function handleResultSelect(result) {
  emit('result-selected', result)
}

function getFileIcon(fileType) {
  const icons = {
    vue: 'widgets',
    js: 'code',
    ts: 'code',
    scss: 'style',
    css: 'style',
    md: 'description',
  }
  return icons[fileType] || 'insert_drive_file'
}

function getFileColor(fileType) {
  const colors = {
    vue: 'green',
    js: 'yellow',
    ts: 'blue',
    scss: 'pink',
    css: 'pink',
    md: 'grey',
  }
  return colors[fileType] || 'grey-7'
}
</script>

<style lang="scss" scoped>
.code-search-list-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.code-search-list-scroll-area {
  flex: 1;
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.result-item-active {
  background-color: var(--nexa-surface-hover);
}

.result-file {
  color: var(--nexa-text-primary);
  font-weight: 500;
  word-break: break-all;
}

.result-meta {
  color: var(--nexa-text-secondary);
}

.empty-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}
</style>
