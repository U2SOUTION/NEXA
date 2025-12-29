<!-- ARIA.vue
  접근성(ARIA) 베스트 프랙티스 샘플
  개발 가이드용 샘플 파일
-->
<template>
  <div class="sample-header">
    <h3 class="sample-title">ARIA 접근성 패턴</h3>
    <p class="sample-description">스크린 리더를 위한 ARIA 속성 사용 예시</p>
  </div>
  <div class="sample-container">
      <div class="code-preview">
        <pre><code>{{ codeExample }}</code></pre>
      </div>
    </div>
</template>

<script setup>
const codeExample = `<template>
  <!-- ARIA 속성 사용 예시 -->
  <button
    aria-label="메뉴 열기"
    aria-expanded="false"
    aria-controls="menu"
  >
    <q-icon name="menu" />
  </button>
  
  <div
    id="menu"
    role="menu"
    aria-hidden="true"
  >
    <!-- 메뉴 내용 -->
  </div>
</template>`
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

