<!-- PiniaStore.vue
  Pinia Store 패턴 샘플
  개발 가이드용 샘플 파일
-->
<template>
  <div class="pinia-store-pattern">
    <div class="pattern-header">
      <h3 class="pattern-title">Pinia Store 패턴</h3>
      <p class="pattern-description">Pinia를 사용한 상태 관리 패턴 예시</p>
    </div>
    <div class="pattern-container">
      <div class="code-preview">
        <pre><code>{{ codeExample }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup>
const codeExample = `// stores/myStore.js
import { defineStore } from 'pinia'

export const useMyStore = defineStore('myStore', {
  state: () => ({
    count: 0,
    items: []
  }),
  
  getters: {
    doubleCount: (state) => state.count * 2
  },
  
  actions: {
    increment() {
      this.count++
    }
  }
})`
</script>

<style lang="scss" scoped>
.pinia-store-pattern {
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

