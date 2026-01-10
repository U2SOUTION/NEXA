<!-- ComponentStructure.vue
  파일 구조 컨벤션 샘플
  개발 가이드용 샘플 파일
-->
<template>
  <div class="sample-header">
    <h3 class="sample-title">컴포넌트 파일 구조 컨벤션</h3>
    <p class="sample-description">Vue 컴포넌트 파일의 표준 구조</p>
  </div>
  <div class="sample-container">
      <div class="structure-preview">
        <pre><code>{{ structureExample }}</code></pre>
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
</style>

