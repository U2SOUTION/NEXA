<!-- PerformanceMonitorList.vue
  성능 모니터 목록 컴포넌트
  성능 메트릭 목록 표시 및 선택 기능
-->

<template>
  <div class="performance-monitor-list-container">
    <q-scroll-area class="performance-monitor-list-scroll-area">
      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="loading-section q-pa-lg text-center">
        <q-spinner color="primary" size="3em" />
        <div class="q-mt-md text-caption">메트릭을 불러오는 중...</div>
      </div>

      <!-- 메트릭 목록 -->
      <q-list v-else separator>
        <q-item
          v-for="metric in metrics"
          :key="metric.id"
          clickable
          :active="selectedMetric?.id === metric.id"
          active-class="metric-item-active"
          @click="handleMetricSelect(metric)"
        >
          <q-item-section avatar>
            <q-icon :name="metric.icon || 'speed'" :color="metric.color || 'primary'" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="metric-name">{{ metric.name || '메트릭 이름 없음' }}</q-item-label>
            <q-item-label caption class="metric-value">
              <span>{{ metric.value || '-' }}</span>
              <span v-if="metric.unit" class="q-ml-xs">{{ metric.unit }}</span>
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-icon name="chevron_right" color="grey-7" />
          </q-item-section>
        </q-item>

        <!-- 메트릭이 없을 때 -->
        <div v-if="metrics.length === 0" class="empty-section q-pa-lg text-center">
          <q-icon name="speed" size="48px" color="grey-5" class="q-mb-md" />
          <div class="text-grey-7">메트릭이 없습니다.</div>
        </div>
      </q-list>
    </q-scroll-area>
  </div>
</template>

<script setup>
defineProps({
  metrics: {
    type: Array,
    default: () => [],
  },
  selectedMetric: {
    type: Object,
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['metric-selected'])

function handleMetricSelect(metric) {
  emit('metric-selected', metric)
}
</script>

<style lang="scss" scoped>
.performance-monitor-list-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.performance-monitor-list-scroll-area {
  flex: 1;
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.metric-item-active {
  background-color: var(--nexa-surface-hover);
}

.metric-name {
  color: var(--nexa-text-primary);
  font-weight: 500;
}

.metric-value {
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
