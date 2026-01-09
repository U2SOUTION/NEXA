<template>
  <div class="database-viewer-content">
    <!-- 툴바 -->
    <div class="database-viewer-toolbar q-pa-md row items-center justify-between">
      <div class="row items-center q-gutter-md">
        <q-icon name="storage" size="24px" />
        <h3 class="database-viewer-toolbar-title">Database Viewer</h3>
        <p class="database-viewer-toolbar-subtitle">데이터베이스 뷰어</p>
      </div>
      <div class="row items-center q-gutter-sm">
        <q-btn flat icon="refresh" label="새로고침" @click="refreshData" :loading="isLoading" />
        <q-btn flat icon="settings" label="설정" />
      </div>
    </div>

    <!-- 메인 컨텐츠: 서브 메뉴에 따라 다른 컴포넌트 표시 -->
    <div class="database-viewer-main">
      <!-- ERD 다이어그램 -->
      <SchemaDiagram v-if="activeSubMenu === 'erd'" />

      <!-- 테이블 편집기 -->
      <TableEditor v-else-if="activeSubMenu === 'editor'" />

      <!-- SQL 쿼리 -->
      <SqlQueryEditor v-else-if="activeSubMenu === 'query'" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import SchemaDiagram from './SchemaDiagram.vue'
import TableEditor from './TableEditor.vue'
import SqlQueryEditor from './SqlQueryEditor.vue'

// 로딩 상태
const isLoading = ref(false)

// 서브 메뉴 상태
const activeSubMenu = ref('erd')

// 서브 메뉴 변경 이벤트 리스너
function handleSubMenuChanged(event) {
  activeSubMenu.value = event.detail.subMenu || 'erd'
}

// 데이터 새로고침
function refreshData() {
  isLoading.value = true
  // TODO: API 호출하여 데이터 새로고침
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
}

// 이벤트 리스너 등록/해제
onMounted(() => {
  window.addEventListener('database-viewer-sub-menu-changed', handleSubMenuChanged)
})

onUnmounted(() => {
  window.removeEventListener('database-viewer-sub-menu-changed', handleSubMenuChanged)
})
</script>

<style lang="scss" scoped>
.database-viewer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--nexa-background);
}

.database-viewer-toolbar {
  border-bottom: 1px solid var(--nexa-border-color);
  background-color: var(--nexa-surface);
  flex-shrink: 0;
}

.database-viewer-toolbar-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--nexa-text-primary);
  margin: 0;
}

.database-viewer-toolbar-subtitle {
  font-size: 0.875rem;
  color: var(--nexa-text-secondary);
  margin: 0;
}

.database-viewer-main {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.database-viewer-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
  color: var(--nexa-text-secondary);
}

.database-viewer-placeholder-text {
  font-size: 0.875rem;
  margin: 0;
  color: var(--nexa-text-secondary);
}
</style>
