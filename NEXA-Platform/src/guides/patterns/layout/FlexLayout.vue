<!-- FlexLayout.vue
  Flexbox 레이아웃 패턴 샘플
  개발 가이드용 샘플 파일
-->
<!--
  @tags: patterns 레이아웃, Flexbox
  @category: layout
  @description: Flexbox Layout 패턴 샘플 컴포넌트
-->
<template>
  <div class="flex-layout-pattern">
    <div class="pattern-header">
      <h3 class="pattern-title">Flexbox 레이아웃 패턴</h3>
      <p class="pattern-description">CSS Flexbox를 사용한 레이아웃 구조 예시</p>
    </div>
    <div class="pattern-container">
      <div class="layout-preview">
        <div class="flex-container">
          <div class="flex-item">아이템 1</div>
          <div class="flex-item">아이템 2</div>
          <div class="flex-item">아이템 3</div>
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
  <div class="flex-container">
    <div class="flex-item">아이템 1</div>
    <div class="flex-item">아이템 2</div>
    <div class="flex-item">아이템 3</div>
  </div>
</template>

<style lang="scss" scoped>
.flex-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}
</style>`
</script>

<style lang="scss" scoped>
.flex-layout-pattern {
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

      .flex-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        min-height: 100px;

        .flex-item {
          flex: 1;
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

