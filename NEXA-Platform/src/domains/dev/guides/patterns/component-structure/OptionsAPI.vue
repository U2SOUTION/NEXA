<!-- OptionsAPI.vue
  Options API 패턴 샘플
  개발 가이드용 샘플 파일
-->
<!--
  @tags: patterns 컴포넌트 구조, Options API
  @category: component-structure
  @description: Options API 패턴 샘플 컴포넌트
-->
<template>
  <div class="sample-header">
    <h3 class="sample-title">Options API 패턴</h3>
    <p class="sample-description">Vue 2 스타일 Options API를 사용한 컴포넌트 구조 예시</p>
  </div>
  <div class="sample-container">
    <div class="code-preview">
      <pre><code>{{ codeExample }}</code></pre>
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
  '<' + 'script>',
  'export default {',
  "  name: 'MyComponent',",
  '  data() {',
  '    return {',
  "      title: 'Hello World',",
  '      count: 0',
  '    }',
  '  },',
  '  methods: {',
  '    increment() {',
  '      this.count++',
  '    }',
  '  }',
  '}',
  '</' + 'script>',
].join('\n')
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
