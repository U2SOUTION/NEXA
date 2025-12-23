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

    <!-- 메인 컨텐츠: 3단 레이아웃 -->
    <div class="database-viewer-main">
      <q-splitter v-model="splitterModel" class="database-viewer-splitter">
        <!-- 왼쪽: 테이블 목록 -->
        <template v-slot:before>
          <div class="database-viewer-table-list-panel">
            <div class="database-viewer-panel-header">
              <q-icon name="table_view" size="18px" class="q-mr-sm" />
              <span>테이블 목록</span>
            </div>
            <div class="database-viewer-panel-content">
              <!-- TableList 컴포넌트 (추후 구현) -->
              <div class="database-viewer-placeholder">
                <q-icon name="table_view" size="48px" color="grey-7" class="q-mb-md" />
                <p class="database-viewer-placeholder-text">테이블 목록</p>
              </div>
            </div>
          </div>
        </template>

        <!-- 중앙: ERD 다이어그램 -->
        <template v-slot:after>
          <q-splitter v-model="rightSplitterModel" vertical class="database-viewer-right-splitter">
            <!-- 중앙: ERD 다이어그램 -->
            <template v-slot:before>
              <div class="database-viewer-diagram-panel">
                <div class="database-viewer-panel-header">
                  <q-icon name="account_tree" size="18px" class="q-mr-sm" />
                  <span>ERD 다이어그램</span>
                </div>
                <div class="database-viewer-panel-content">
                  <!-- SchemaDiagram 컴포넌트 (추후 구현) -->
                  <div class="database-viewer-placeholder">
                    <q-icon name="account_tree" size="48px" color="grey-7" class="q-mb-md" />
                    <p class="database-viewer-placeholder-text">ERD 다이어그램</p>
                  </div>
                </div>
              </div>
            </template>

            <!-- 오른쪽: 테이블 상세 정보 -->
            <template v-slot:after>
              <div class="database-viewer-table-detail-panel">
                <div class="database-viewer-panel-header">
                  <q-icon name="info" size="18px" class="q-mr-sm" />
                  <span>테이블 상세 정보</span>
                </div>
                <div class="database-viewer-panel-content">
                  <!-- TableDetail 컴포넌트 (추후 구현) -->
                  <div class="database-viewer-placeholder">
                    <q-icon name="info" size="48px" color="grey-7" class="q-mb-md" />
                    <p class="database-viewer-placeholder-text">테이블을 선택하세요</p>
                  </div>
                </div>
              </div>
            </template>
          </q-splitter>
        </template>
      </q-splitter>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 로딩 상태
const isLoading = ref(false)

// Splitter 모델 (왼쪽/오른쪽 비율)
const splitterModel = ref(20) // 왼쪽 20%, 중앙+오른쪽 80%
const rightSplitterModel = ref(70) // 중앙 70%, 오른쪽 30%

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

.database-viewer-splitter {
  height: 100%;
}

.database-viewer-right-splitter {
  height: 100%;
}

.database-viewer-table-list-panel,
.database-viewer-diagram-panel,
.database-viewer-table-detail-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--nexa-surface);
  border-right: 1px solid var(--nexa-border-color);
}

.database-viewer-table-detail-panel {
  border-right: none;
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
