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

    <!-- 메인 컨텐츠: ERD 다이어그램 (테이블 상세 정보는 우측 사이드바로 이동) -->
    <div class="database-viewer-main">
      <div class="database-viewer-diagram-panel">
        <div class="database-viewer-panel-header">
          <q-icon name="account_tree" size="18px" class="q-mr-sm" />
          <span>ERD 다이어그램</span>
        </div>
        <div class="database-viewer-panel-content">
          <SchemaDiagram />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SchemaDiagram from './SchemaDiagram.vue'

// 로딩 상태
const isLoading = ref(false)

// 데이터 새로고침
function refreshData() {
  isLoading.value = true
  // TODO: API 호출하여 데이터 새로고침
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
}
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

.database-viewer-diagram-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--nexa-surface);
}

.database-viewer-panel-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--nexa-border-color);
  background-color: var(--nexa-surface);
  display: flex;
  align-items: center;
  font-weight: 600;
  color: var(--nexa-text-primary);
  flex-shrink: 0;
}

.database-viewer-panel-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
}

// 다이어그램 패널은 padding 없이 전체 영역 사용
.database-viewer-diagram-panel .database-viewer-panel-content {
  padding: 0;
  overflow: hidden;
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
