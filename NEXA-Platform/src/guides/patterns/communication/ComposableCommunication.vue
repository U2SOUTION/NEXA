<!-- ComposableCommunication.vue
  Composable 통신 패턴 샘플
  개발 가이드용 샘플 파일
-->
<!--
  @tags: patterns 통신, Composable
  @category: communication
  @description: Composable을 사용한 통신 패턴 샘플 컴포넌트
-->
<template>
  <div class="composable-communication-pattern">
    <div class="pattern-header">
      <h3 class="pattern-title">Composable 통신 패턴</h3>
      <p class="pattern-description">Composable을 통한 상태 공유 및 통신 예시</p>
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
  '// composables/useSharedState.js',
  "import { ref } from 'vue'",
  '',
  'const state = ref({ count: 0 })',
  '',
  'export function useSharedState() {',
  '  const increment = () => {',
  '    state.value.count++',
  '  }',
  '  ',
  '  return {',
  '    state,',
  '    increment',
  '  }',
  '}',
  '',
  '// 컴포넌트에서 사용',
  '<' + 'script setup>',
  "import { useSharedState } from '@/composables/useSharedState'",
  '',
  'const { state, increment } = useSharedState()',
  '</' + 'script>',
].join('\n')
</script>

<style lang="scss" scoped>
.composable-communication-pattern {
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

