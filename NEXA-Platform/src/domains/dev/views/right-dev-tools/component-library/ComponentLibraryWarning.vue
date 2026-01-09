<!-- ComponentLibraryWarning.vue
  컴포넌트 라이브러리 규칙 위반 경고 컴포넌트
  오른쪽 사이드바 최상단에 표시
-->

<template>
  <div v-if="selectedComponent || selectedViolation" class="component-library-warning">
    <div class="section-header">
      <q-icon name="warning" color="negative" size="20px" />
      <h4 class="section-title">규칙 위반 경고</h4>
    </div>
    <div class="warning-content">
      <div v-if="selectedViolation" class="warning-item">
        <q-icon name="error" color="negative" size="16px" />
        <div class="warning-text">
          <div class="warning-title">{{ selectedViolation.component.name }}</div>
          <div class="warning-detail">{{ selectedViolation.violations.length }}개 위반 사항 발견</div>
        </div>
      </div>
      <div v-else-if="selectedComponent" class="warning-item">
        <q-icon name="check_circle" color="positive" size="16px" />
        <div class="warning-text">
          <div class="warning-title">규칙 준수</div>
          <div class="warning-detail">위반 사항 없음</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  selectedComponent: {
    type: Object,
    default: null,
  },
  selectedViolation: {
    type: Object,
    default: null,
  },
})
</script>

<style lang="scss" scoped>
.component-library-warning {
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

.warning-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.warning-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: var(--nexa-background);
  border-radius: 4px;
  border-left: 3px solid var(--nexa-error);

  .warning-text {
    flex: 1;

    .warning-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--nexa-text-primary);
      margin-bottom: 0.25rem;
    }

    .warning-detail {
      font-size: 0.8rem;
      color: var(--nexa-text-secondary);
    }
  }
}
</style>

