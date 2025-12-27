<!-- ErrorBoundary.vue
  에러 처리 베스트 프랙티스 샘플
  개발 가이드용 샘플 파일
-->
<template>
  <div class="error-boundary-practice">
    <div class="practice-header">
      <h3 class="practice-title">에러 처리 패턴</h3>
      <p class="practice-description">컴포넌트 에러 처리 및 에러 바운더리 패턴</p>
    </div>
    <div class="practice-container">
      <div class="code-preview">
        <pre><code>{{ codeExample }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup>
const codeExample = `// 에러 처리 패턴
try {
  await someAsyncOperation()
} catch (error) {
  console.error('[ComponentName] 에러 발생:', error)
  // 사용자에게 에러 알림
  $q.notify({
    type: 'negative',
    message: '작업 중 오류가 발생했습니다.'
  })
}`
</script>

<style lang="scss" scoped>
.error-boundary-practice {
  padding: 16px;
  background-color: var(--nexa-surface);
  border-radius: 8px;

  .practice-header {
    margin-bottom: 16px;

    .practice-title {
      color: var(--nexa-text-primary);
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .practice-description {
      color: var(--nexa-text-secondary);
      font-size: 0.875rem;
    }
  }

  .practice-container {
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
}
</style>

