<!-- SecondaryButton.vue
  보조 버튼 샘플 컴포넌트
  개발 가이드용 샘플 파일
-->
<!--
  @tags: styles 버튼, 보조 버튼
  @category: buttons
  @description: Secondary Button 샘플 컴포넌트
-->
<template>
  <div class="sample-header">
    <h3 class="sample-title">보조 버튼 샘플</h3>
    <p class="sample-description">보조 액션을 위한 버튼 예시</p>
  </div>
  <div class="sample-container">
    <div class="button-examples">
      <q-btn outline label="보조 버튼" />
      <q-btn flat label="플랫 버튼" />
      <q-btn unelevated label="평면 버튼" />
      <q-btn outline label="아이콘 보조" icon="settings" />
    </div>
  </div>
</template>

<script setup>
// 샘플 컴포넌트 - 실제 구현은 참고용
</script>

<style lang="scss" scoped>
.sample-header {
  margin-bottom: 16px;

  .sample-title {
    color: var(--nexa-text-primary);
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .sample-description {
    color: var(--nexa-text-secondary);
    font-size: 0.875rem;
  }
}

.sample-container {
  .button-examples {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
}
</style>
