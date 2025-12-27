<!-- LazyLoading.vue
  지연 로딩 성능 최적화 샘플
  개발 가이드용 샘플 파일
-->
<template>
  <div class="lazy-loading-practice">
    <div class="practice-header">
      <h3 class="practice-title">지연 로딩 패턴</h3>
      <p class="practice-description">컴포넌트 지연 로딩을 통한 성능 최적화</p>
    </div>
    <div class="practice-container">
      <div class="code-preview">
        <pre><code>{{ codeExample }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup>
const codeExample = `// 동적 컴포넌트 로딩
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
)

// 또는
const AsyncComponent = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
})`
</script>

<style lang="scss" scoped>
.lazy-loading-practice {
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

