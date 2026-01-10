<!-- ChartBlockSample.vue
  차트 블록 샘플 - NexaBlock 컴포넌트 사용 예제
  코어 컴포넌트 응용 가이드
-->
<template>
  <div class="chart-block-sample">
    <div class="sample-section">
      <h4 class="section-title">차트 블록 기본 사용법</h4>
      <div class="section-content">
        <div class="block-placeholder">
          <q-icon name="bar_chart" size="48px" color="grey-5" />
          <p class="placeholder-text">NexaBlock 차트 블록 예제</p>
        </div>
      </div>
    </div>

    <div class="sample-section">
      <h4 class="section-title">사용 예제</h4>
      <div class="code-example">
        <pre><code>&lt;NexaBlock
  block-type="chart"
  :config="chartConfig"
/&gt;</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup>
// 코어 컴포넌트 import (실제 사용 시)
// import NexaBlock from '@engines/block/NexaBlock.vue'

// 예제 데이터 (참고용)
// eslint-disable-next-line no-unused-vars
const chartConfig = {
  type: 'bar',
  data: {
    labels: ['A', 'B', 'C'],
    datasets: [{ data: [10, 20, 30] }]
  }
}
</script>

<style lang="scss" scoped>
.chart-block-sample {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sample-section {
  border: 1px solid var(--nexa-border-color);
  border-radius: 4px;
  padding: 16px;
}

.section-title {
  color: var(--nexa-text-primary);
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.section-content {
  .block-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    background-color: var(--nexa-surface);
    border: 1px dashed var(--nexa-border-color);
    border-radius: 4px;

    .placeholder-text {
      margin-top: 8px;
      color: var(--nexa-text-secondary);
      font-size: 0.875rem;
    }
  }
}

.code-example {
  background-color: var(--nexa-surface);
  border: 1px solid var(--nexa-border-color);
  border-radius: 4px;
  padding: 12px;
  overflow-x: auto;

  pre {
    margin: 0;
    color: var(--nexa-text-primary);
    font-size: 0.875rem;
    font-family: 'Courier New', monospace;
  }
}
</style>
