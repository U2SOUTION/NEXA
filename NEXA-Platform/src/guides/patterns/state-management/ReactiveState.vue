<!-- ReactiveState.vue
  Reactive State 패턴 샘플
  개발 가이드용 샘플 파일
-->
<!--
  @tags: patterns 상태 관리, Reactive
  @category: state-management
  @description: Reactive State 패턴 샘플 컴포넌트
-->
<template>
  <div class="reactive-state-pattern">
    <div class="pattern-header">
      <h3 class="pattern-title">Reactive State 패턴</h3>
      <p class="pattern-description">Vue의 reactive를 사용한 상태 관리 예시</p>
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
  '<' + 'script setup>',
  "import { reactive } from 'vue'",
  '',
  'const state = reactive({',
  '  count: 0,',
  "  message: 'Hello'",
  '})',
  '',
  'const increment = () => {',
  '  state.count++',
  '}',
  '</' + 'script>',
  '',
  '<' + 'template>',
  '  <div>',
  '    <p>{{ state.message }}</p>',
  '    <button @click="increment">Count: {{ state.count }}</button>',
  '  </div>',
  '</' + 'template>',
].join('\n')
</script>

<style lang="scss" scoped>
.reactive-state-pattern {
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

