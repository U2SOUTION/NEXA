<!-- ScriptSetup.vue
  Script Setup 패턴 샘플
  개발 가이드용 샘플 파일
-->
<!--
  @tags: patterns 컴포넌트 구조, Script Setup
  @category: component-structure
  @description: Script Setup 패턴 샘플 컴포넌트
-->
<template>
  <div class="script-setup-pattern">
    <div class="pattern-header">
      <h3 class="pattern-title">Script Setup 패턴</h3>
      <p class="pattern-description">Vue 3 Script Setup을 사용한 간결한 컴포넌트 구조 예시</p>
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
  '<' + 'template>',
  '  <div class="my-component">',
  '    <h1>{{ title }}</h1>',
  '    <button @click="increment">Count: {{ count }}</button>',
  '  </div>',
  '</' + 'template>',
  '',
  '<' + 'script setup>',
  "import { ref } from 'vue'",
  '',
  "const title = ref('Hello World')",
  'const count = ref(0)',
  '',
  'const increment = () => {',
  '  count.value++',
  '}',
  '</' + 'script>',
].join('\n')
</script>

<style lang="scss" scoped>
.script-setup-pattern {
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

