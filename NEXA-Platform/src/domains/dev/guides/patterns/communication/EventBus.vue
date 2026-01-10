<!-- EventBus.vue
  이벤트 버스 통신 패턴 샘플
  개발 가이드용 샘플 파일
-->
<template>
  <div class="sample-header">
    <h3 class="sample-title">이벤트 버스 패턴</h3>
    <p class="sample-description">커스텀 이벤트를 사용한 컴포넌트 간 통신 예시</p>
  </div>
  <div class="sample-container">
      <div class="code-preview">
        <pre><code>{{ codeExample }}</code></pre>
      </div>
    </div>
</template>

<script setup>
const codeExample = `// 이벤트 발송
window.dispatchEvent(new CustomEvent('my-event', {
  detail: { message: 'Hello' }
}))

// 이벤트 수신
window.addEventListener('my-event', (event) => {
  console.log(event.detail.message)
})`
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
    .code-preview {
      background-color: var(--nexa-background);
      border: 1px solid var(--nexa-border-color);
      border-radius: 4px;
      padding: 16px;
      overflow-x: auto;

      pre {
        margin: 0;
        code {
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          color: var(--nexa-text-primary);
        }
      }
    }
}
</style>

