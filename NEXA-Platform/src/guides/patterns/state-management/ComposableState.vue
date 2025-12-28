<!-- ComposableState.vue
  Composable State 패턴 샘플
  개발 가이드용 샘플 파일
-->
<!--
  @tags: patterns 상태 관리, Composable
  @category: state-management
  @description: Composable State 패턴 샘플 컴포넌트
-->
<template>
  <div class="composable-state-pattern">
    <div class="pattern-header">
      <h3 class="pattern-title">Composable State 패턴</h3>
      <p class="pattern-description">Composable을 사용한 재사용 가능한 상태 관리 예시</p>
    </div>
    <div class="pattern-container">
      <div class="code-preview">
        <pre><code>{{ codeExample }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup>
const codeExample = [
  '// composables/useCounter.js',
  "import { ref } from 'vue'",
  '',
  'export function useCounter(initialValue = 0) {',
  '  const count = ref(initialValue)',
  '  ',
  '  const increment = () => {',
  '    count.value++',
  '  }',
  '  ',
  '  const decrement = () => {',
  '    count.value--',
  '  }',
  '  ',
  '  const reset = () => {',
  '    count.value = initialValue',
  '  }',
  '  ',
  '  return {',
  '    count,',
  '    increment,',
  '    decrement,',
  '    reset',
  '  }',
  '}',
  '',
  '// 컴포넌트에서 사용',
  '<' + 'script setup>',
  "import { useCounter } from '@/composables/useCounter'",
  '',
  'const { count, increment, decrement } = useCounter(10)',
  '</' + 'script>',
].join('\n')
</script>

<style lang="scss" scoped>
.composable-state-pattern {
  padding: 16px;
  background-color: var(--nexa-surface);
  border-radius: 8px;

  .pattern-header {
    margin-bottom: 16px;

    .pattern-title {
      color: var(--nexa-text-primary);
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .pattern-description {
      color: var(--nexa-text-secondary);
      font-size: 0.875rem;
    }
  }

  .pattern-container {
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

