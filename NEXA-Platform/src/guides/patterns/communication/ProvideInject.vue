<!-- ProvideInject.vue
  Provide/Inject 통신 패턴 샘플
  개발 가이드용 샘플 파일
-->
<!--
  @tags: patterns 통신, Provide Inject
  @category: communication
  @description: Provide/Inject 패턴 샘플 컴포넌트
-->
<template>
  <div class="provide-inject-pattern">
    <div class="pattern-header">
      <h3 class="pattern-title">Provide/Inject 패턴</h3>
      <p class="pattern-description">부모-자식 컴포넌트 간 데이터 전달 예시</p>
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
  '// 부모 컴포넌트',
  '<' + 'script setup>',
  "import { provide, ref } from 'vue'",
  '',
  "const message = ref('Hello from Parent')",
  '',
  "provide('message', message)",
  '</' + 'script>',
  '',
  '// 자식 컴포넌트',
  '<' + 'script setup>',
  "import { inject } from 'vue'",
  '',
  "const message = inject('message')",
  '</' + 'script>',
].join('\n')
</script>

<style lang="scss" scoped>
.provide-inject-pattern {
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

