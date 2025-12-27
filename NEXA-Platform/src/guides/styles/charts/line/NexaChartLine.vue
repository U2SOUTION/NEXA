<!-- NexaChartLine.vue
  선 그래프 샘플 컴포넌트
  개발 가이드용 샘플 파일
-->
<template>
  <div class="nexa-chart-line-sample">
    <div class="chart-header">
      <h3 class="chart-title">선 그래프 샘플</h3>
      <p class="chart-description">NexaChart 컴포넌트를 사용한 선 그래프 예시</p>
    </div>
    <div class="chart-container">
      <div class="chart-placeholder">
        <q-icon name="show_chart" size="64px" color="grey-5" />
        <p class="placeholder-text">차트 미리보기 영역</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// 샘플 컴포넌트 - 실제 구현은 참고용
</script>

<style lang="scss" scoped>
.nexa-chart-line-sample {
  padding: 16px;
  background-color: var(--nexa-surface);
  border-radius: 8px;

  .chart-header {
    margin-bottom: 16px;

    .chart-title {
      color: var(--nexa-text-primary);
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .chart-description {
      color: var(--nexa-text-secondary);
      font-size: 0.875rem;
    }
  }

  .chart-container {
    .chart-placeholder {
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

