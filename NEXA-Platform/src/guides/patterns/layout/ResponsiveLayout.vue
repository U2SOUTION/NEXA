<!-- ResponsiveLayout.vue
  반응형 레이아웃 패턴 샘플
  개발 가이드용 샘플 파일
-->
<!--
  @tags: patterns 레이아웃, 반응형
  @category: layout
  @description: Responsive Layout 패턴 샘플 컴포넌트
-->
<template>
  <div class="responsive-layout-pattern">
    <div class="pattern-header">
      <h3 class="pattern-title">반응형 레이아웃 패턴</h3>
      <p class="pattern-description">화면 크기에 따라 자동으로 조정되는 레이아웃 예시</p>
    </div>
    <div class="pattern-container">
      <div class="layout-preview">
        <div class="responsive-grid">
          <div class="grid-item">아이템 1</div>
          <div class="grid-item">아이템 2</div>
          <div class="grid-item">아이템 3</div>
          <div class="grid-item">아이템 4</div>
        </div>
      </div>
      <div class="code-preview">
        <pre><code>{{ codeExample }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup>
const codeExample = `<template>
  <div class="responsive-grid">
    <div class="grid-item">아이템 1</div>
    <div class="grid-item">아이템 2</div>
    <div class="grid-item">아이템 3</div>
  </div>
</template>

<style lang="scss" scoped>
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
</style>`
</script>

<style lang="scss" scoped>
.responsive-layout-pattern {
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
    .layout-preview {
      margin-bottom: 16px;
      padding: 16px;
      background-color: var(--nexa-background);
      border-radius: 4px;

      .responsive-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;

        .grid-item {
          padding: 12px;
          background-color: var(--nexa-surface);
          border: 1px solid var(--nexa-border-color);
          border-radius: 4px;
          text-align: center;
          color: var(--nexa-text-primary);
        }
      }
    }

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

