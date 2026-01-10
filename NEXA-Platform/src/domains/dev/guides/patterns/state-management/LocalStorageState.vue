<!-- LocalStorageState.vue
  LocalStorage State 패턴 샘플
  개발 가이드용 샘플 파일
-->
<!--
  @tags: patterns 상태 관리, LocalStorage
  @category: state-management
  @description: LocalStorage를 사용한 상태 관리 패턴 샘플 컴포넌트
-->
<template>
  <div class="sample-header">
    <h3 class="sample-title">LocalStorage State 패턴</h3>
    <p class="sample-description">LocalStorage를 사용한 영구 상태 관리 예시</p>
  </div>
  <div class="sample-container">
      <div class="code-preview">
        <pre><code>{{ codeExample }}</code></pre>
      </div>
    </div>
</template>

<script setup>
const codeExample = [
  '// composables/useLocalStorage.js',
  "import { ref, watch } from 'vue'",
  '',
  'export function useLocalStorage(key, defaultValue) {',
  '  const storedValue = localStorage.getItem(key)',
  '  const value = ref(storedValue ? JSON.parse(storedValue) : defaultValue)',
  '  ',
  '  watch(value, (newValue) => {',
  '    localStorage.setItem(key, JSON.stringify(newValue))',
  '  }, { deep: true })',
  '  ',
  '  return value',
  '}',
  '',
  '// 컴포넌트에서 사용',
  '<' + 'script setup>',
  "import { useLocalStorage } from '@system/composables/useLocalStorage'",
  '',
  "const userSettings = useLocalStorage('userSettings', {",
  "  theme: 'dark',",
  "  language: 'ko'",
  '})',
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

