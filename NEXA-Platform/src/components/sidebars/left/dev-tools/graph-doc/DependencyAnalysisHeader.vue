<!-- DependencyAnalysisHeader.vue
  의존성 분석 헤더 컴포넌트
  새로고침, 설정
-->

<template>
  <div class="dependency-analysis-header">
    <div class="header-content q-pa-md">
      <div class="row items-center justify-between">
        <div class="row items-center q-gutter-sm">
          <q-icon name="hub" size="20px" color="primary" />
          <div class="header-title">의존성 분석</div>
        </div>
        <div class="row items-center q-gutter-xs">
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
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['refresh', 'settings'])

function handleRefresh() {
  emit('refresh')
}

function handleSettings() {
  emit('settings')
}
</script>

<style lang="scss" scoped>
.dependency-analysis-header {
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
</style>
