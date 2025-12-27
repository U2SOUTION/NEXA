<!-- ComponentStructure.vue
  파일 구조 컨벤션 샘플
  개발 가이드용 샘플 파일
-->
<template>
  <div class="component-structure-convention">
    <div class="convention-header">
      <h3 class="convention-title">컴포넌트 파일 구조 컨벤션</h3>
      <p class="convention-description">Vue 컴포넌트 파일의 표준 구조</p>
    </div>
    <div class="convention-container">
      <div class="structure-preview">
        <pre><code>{{ structureExample }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup>
const structureExample = [
  '<template>',
  '  <!-- 템플릿 영역 -->',
  '</template>',
  '',
  '<script setup>',
  '// Script setup 영역',
  '</' + 'script>',
  '',
  '<style lang="scss" scoped>',
  '/* 스타일 영역 */',
  '</style>',
].join('\n')
</script>

<style lang="scss" scoped>
.component-structure-convention {
  padding: 16px;
  background-color: var(--nexa-surface);
  border-radius: 8px;

  .convention-header {
    margin-bottom: 16px;

    .convention-title {
      color: var(--nexa-text-primary);
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .convention-description {
      color: var(--nexa-text-secondary);
      font-size: 0.875rem;
    }
  }

  .convention-container {
    .structure-preview {
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

