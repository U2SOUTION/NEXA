<!-- DevSidebarSample.vue
  왼쪽 사이드바 샘플 컴포넌트
  개발 가이드용 샘플 파일
-->
<template>
  <div class="sample-header">
    <h3 class="sample-title">왼쪽 사이드바 샘플</h3>
    <p class="sample-description">개발 도구용 왼쪽 사이드바 예시</p>
  </div>
  <div class="sample-container">
      <div class="sidebar-placeholder">
        <q-icon name="menu" size="64px" color="grey-5" />
        <p class="placeholder-text">사이드바 미리보기 영역</p>
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
    .sidebar-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      background-color: var(--nexa-background);
      border: 1px dashed var(--nexa-border-color);
      border-radius: 4px;

      .placeholder-text {
        margin-top: 8px;
        color: var(--nexa-text-secondary);
        font-size: 0.875rem;
      }
    }
}
</style>

