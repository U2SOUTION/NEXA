<!-- PerformanceMonitorHeader.vue
  성능 모니터 헤더 컴포넌트
  모니터링 상태, 새로고침, 설정
-->

<template>
  <div class="performance-monitor-header">
    <div class="header-content q-pa-md">
      <div class="row items-center justify-between">
        <div class="row items-center q-gutter-sm">
          <q-icon name="speed" size="20px" color="primary" />
          <div class="header-title">성능 MONITOR</div>
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
            :color="isMonitoring ? 'negative' : 'positive'"
            :icon="isMonitoring ? 'stop' : 'play_arrow'"
            dense
            size="sm"
            @click="handleMonitoringToggle"
          >
            <q-tooltip>{{ isMonitoring ? '모니터링 중지' : '모니터링 시작' }}</q-tooltip>
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
const props = defineProps({
  isMonitoring: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['refresh', 'monitoring-toggle', 'settings'])

function handleRefresh() {
  emit('refresh')
}

function handleMonitoringToggle() {
  emit('monitoring-toggle', !props.isMonitoring)
}

function handleSettings() {
  emit('settings')
}
</script>

<style lang="scss" scoped>
.performance-monitor-header {
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
