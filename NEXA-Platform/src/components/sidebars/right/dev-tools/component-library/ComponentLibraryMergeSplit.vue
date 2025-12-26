<!-- ComponentLibraryMergeSplit.vue
  컴포넌트 라이브러리 통합/분리 제안 컴포넌트
-->

<template>
  <div class="component-library-merge-split">
    <div class="section-header">
      <q-icon name="merge_type" size="20px" />
      <h4 class="section-title">구조 개선 제안</h4>
    </div>
    <div class="merge-split-content">
      <div class="suggestion-item">
        <q-icon name="merge" color="info" size="16px" />
        <div class="suggestion-text">
          <div class="suggestion-title">통합 제안</div>
          <div class="suggestion-detail">비슷한 기능의 컴포넌트 통합 가능</div>
        </div>
      </div>
      <div class="suggestion-item">
        <q-icon name="call_split" color="info" size="16px" />
        <div class="suggestion-text">
          <div class="suggestion-title">분리 제안</div>
          <div class="suggestion-detail">과도한 집중 컴포넌트 분리 가능</div>
        </div>
      </div>
      <q-btn flat dense icon="lightbulb" label="제안 보기" @click="handleShowSuggestions" class="full-width q-mt-sm" />
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['show-suggestions'])

// 제안 보기
function handleShowSuggestions() {
  emit('show-suggestions')
}
</script>

<style lang="scss" scoped>
.component-library-merge-split {
  padding: 1rem;
  border-bottom: 1px solid var(--nexa-border-color);

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

.merge-split-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: var(--nexa-background);
  border-radius: 4px;
  border-left: 3px solid var(--nexa-info);

  .suggestion-text {
    flex: 1;

    .suggestion-title {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--nexa-text-primary);
      margin-bottom: 0.25rem;
    }

    .suggestion-detail {
      font-size: 0.75rem;
      color: var(--nexa-text-secondary);
    }
  }
}
</style>

