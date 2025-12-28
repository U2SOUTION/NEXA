<!-- TextButton.vue
  텍스트 버튼 샘플 컴포넌트
  개발 가이드용 샘플 파일
-->
<!--
  @tags: styles 버튼, 텍스트 버튼
  @category: buttons
  @description: Text Button 샘플 컴포넌트
-->
<template>
  <div class="sample-header">
    <h3 class="sample-title">텍스트 버튼 샘플</h3>
    <p class="sample-description">텍스트만 표시되는 버튼 예시</p>
  </div>
  <div class="sample-container">
    <div class="button-examples">
      <q-btn flat label="텍스트 버튼" />
      <q-btn flat label="링크 스타일" color="primary" />
      <q-btn flat label="비활성화" disable />
      <q-btn flat label="아이콘 텍스트" icon="add" />
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
