<!-- GridLayout.vue
  Grid 레이아웃 패턴 샘플
  개발 가이드용 샘플 파일
-->
<!--
  @tags: patterns 레이아웃, Grid
  @category: layout
  @description: Grid Layout 패턴 샘플 컴포넌트
-->
<template>
  <div class="grid-layout-pattern">
    <div class="pattern-header">
      <h3 class="pattern-title">Grid 레이아웃 패턴</h3>
      <p class="pattern-description">CSS Grid를 사용한 레이아웃 구조 예시</p>
    </div>
    <div class="pattern-container">
      <div class="layout-preview">
        <div class="grid-container">
          <div class="grid-header">헤더</div>
          <div class="grid-sidebar">사이드바</div>
          <div class="grid-content">컨텐츠</div>
          <div class="grid-footer">푸터</div>
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
  <div class="grid-container">
    <div class="grid-header">헤더</div>
    <div class="grid-sidebar">사이드바</div>
    <div class="grid-content">컨텐츠</div>
    <div class="grid-footer">푸터</div>
  </div>
</template>

<style lang="scss" scoped>
.grid-container {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header"
    "sidebar content"
    "footer footer";
  gap: 16px;
}
</style>`
</script>

<style lang="scss" scoped>
.grid-layout-pattern {
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

      .grid-container {
        display: grid;
        grid-template-columns: 150px 1fr;
        grid-template-rows: auto 1fr auto;
        grid-template-areas:
          "header header"
          "sidebar content"
          "footer footer";
        gap: 12px;
        min-height: 200px;

        .grid-header {
          grid-area: header;
          padding: 12px;
          background-color: var(--nexa-surface);
          border: 1px solid var(--nexa-border-color);
          border-radius: 4px;
          text-align: center;
          color: var(--nexa-text-primary);
        }

        .grid-sidebar {
          grid-area: sidebar;
          padding: 12px;
          background-color: var(--nexa-surface);
          border: 1px solid var(--nexa-border-color);
          border-radius: 4px;
          text-align: center;
          color: var(--nexa-text-primary);
        }

        .grid-content {
          grid-area: content;
          padding: 12px;
          background-color: var(--nexa-surface);
          border: 1px solid var(--nexa-border-color);
          border-radius: 4px;
          text-align: center;
          color: var(--nexa-text-primary);
        }

        .grid-footer {
          grid-area: footer;
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

