<!-- DevToolsPanelSample.vue
  오른쪽 사이드바 샘플 컴포넌트
  개발 가이드용 샘플 파일
-->
<template>
  <div class="dev-tools-panel-sample">
    <div class="panel-header">
      <h3 class="panel-title">오른쪽 사이드바 샘플</h3>
      <p class="panel-description">개발 도구용 오른쪽 사이드바 예시</p>
    </div>
    <div class="panel-container">
      <div class="panel-placeholder">
        <q-icon name="view_sidebar" size="64px" color="grey-5" />
        <p class="placeholder-text">사이드바 미리보기 영역</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// 샘플 컴포넌트 - 실제 구현은 참고용
</script>

<style lang="scss" scoped>
.dev-tools-panel-sample {
  padding: 16px;
  background-color: var(--nexa-surface);
  border-radius: 8px;

  .panel-header {
    margin-bottom: 16px;

    .panel-title {
      color: var(--nexa-text-primary);
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .panel-description {
      color: var(--nexa-text-secondary);
      font-size: 0.875rem;
    }
  }

  .panel-container {
    .panel-placeholder {
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
}
</style>
