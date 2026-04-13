<!-- CardPanelSample.vue
  카드 넥셋 샘플 - NexaPanel 컴포넌트 사용 예제
  코어 컴포넌트 응용 가이드
-->
<template>
  <div class="card-panel-sample">
    <div class="sample-section">
      <h4 class="section-title">카드 넥셋 기본 사용법</h4>
      <div class="section-content">
        <div class="panel-placeholder">
          <q-icon name="view_module" size="48px" color="grey-5" />
          <p class="placeholder-text">NexaPanel 카드 넥셋 예제</p>
        </div>
      </div>
    </div>

    <div class="sample-section">
      <h4 class="section-title">사용 예제</h4>
      <div class="code-example">
        <pre><code>&lt;NexaPanel
  panel-type="card"
  :content="cardContent"
/&gt;</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup>
// 코어 컴포넌트 import (실제 사용 시)
// import NexaPanel from '@domains/nexet/components/NexaPanel.vue'

// 예제 데이터 (참고용)
// eslint-disable-next-line no-unused-vars
const cardContent = {
  title: '카드 제목',
  body: '카드 내용',
  footer: '카드 푸터',
}
</script>

<style lang="scss" scoped>
.card-panel-sample {
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
  .panel-placeholder {
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
