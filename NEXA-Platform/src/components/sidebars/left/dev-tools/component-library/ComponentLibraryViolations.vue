<!-- ComponentLibraryViolations.vue
  컴포넌트 라이브러리 규칙 위반 목록 컴포넌트
  왼쪽 사이드바 최상단에 표시
-->

<template>
  <div v-if="violationStats.total > 0" class="component-library-violations">
    <div class="section-header">
      <q-icon name="warning" color="negative" size="20px" />
      <h4 class="section-title">규칙 위반</h4>
      <q-badge color="negative" :label="violationStats.total" />
    </div>
    <div class="violations-list">
      <div
        v-for="item in violations"
        :key="item.component.path"
        class="violation-item"
        :class="{ 'violation-item-selected': selectedViolation && selectedViolation.component.path === item.component.path }"
        @click="handleViolationClick(item)"
      >
        <q-icon name="error" :color="item.violations[0].severity === 'ERROR' ? 'negative' : 'warning'" size="16px" />
        <div class="violation-item-info">
          <div class="violation-item-name">{{ item.component.name }}</div>
          <div class="violation-item-count">{{ item.violations.length }}개 위반</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  violations: {
    type: Array,
    default: () => [],
  },
  selectedViolation: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['violation-selected'])

// 규칙 위반 통계
const violationStats = computed(() => ({
  total: props.violations.length,
  errors: props.violations.filter((v) => v.violations.some((vio) => vio.severity === 'ERROR')).length,
  warnings: props.violations.filter((v) => v.violations.some((vio) => vio.severity === 'WARNING')).length,
}))

// 위반 항목 클릭
function handleViolationClick(item) {
  emit('violation-selected', item)
}
</script>

<style lang="scss" scoped>
.component-library-violations {
  padding: 1rem;
  border-bottom: 2px solid var(--nexa-error);
  background-color: var(--nexa-surface);

  .section-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;

    .section-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--nexa-text-primary);
      margin: 0;
      flex: 1;
    }
  }
}

.violations-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.violation-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--nexa-surface-hover);
  }

  &.violation-item-selected {
    background-color: var(--nexa-surface-hover);
    border-left: 3px solid var(--nexa-error);
  }

  .violation-item-info {
    flex: 1;
    min-width: 0;

    .violation-item-name {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--nexa-text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .violation-item-count {
      font-size: 0.75rem;
      color: var(--nexa-text-secondary);
    }
  }
}
</style>

