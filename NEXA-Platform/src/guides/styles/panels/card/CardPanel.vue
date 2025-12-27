<!-- CardPanel.vue
  카드 패널 샘플 컴포넌트
  개발 가이드용 샘플 파일
-->
<template>
  <div class="card-panel-sample">
    <div class="panel-header">
      <h3 class="panel-title">카드 패널 샘플</h3>
      <p class="panel-description">NexaPanel 컴포넌트를 사용한 카드 패널 예시</p>
    </div>
    <div class="panel-container">
      <div class="panel-placeholder">
        <q-icon name="credit_card" size="64px" color="grey-5" />
        <p class="placeholder-text">패널 미리보기 영역</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// 샘플 컴포넌트 - 실제 구현은 참고용
</script>

<style lang="scss" scoped>
.card-panel-sample {
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

