<!-- RenderFunction.vue
  Render Function 패턴 샘플
  개발 가이드용 샘플 파일
-->
<!--
  @tags: patterns 컴포넌트 구조, Render Function
  @category: component-structure
  @description: Render Function 패턴 샘플 컴포넌트
-->
<template>
  <div class="render-function-pattern">
    <div class="pattern-header">
      <h3 class="pattern-title">Render Function 패턴</h3>
      <p class="pattern-description">JavaScript로 직접 DOM을 렌더링하는 패턴 예시</p>
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
  "import { h } from 'vue'",
  '',
  'export default {',
  '  render() {',
  "    return h('div', { class: 'my-component' }, [",
  "      h('h1', 'Hello World'),",
  "      h('button', {",
  '        onClick: () => {',
  "          console.log('Clicked')",
  '        }',
  "      }, 'Click Me')",
  '    ])',
  '  }',
  '}',
  '</' + 'script>',
].join('\n')
</script>

<style lang="scss" scoped>
.render-function-pattern {
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

