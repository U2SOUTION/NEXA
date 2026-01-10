<!-- PropsEmit.vue
  Props/Emit 통신 패턴 샘플
  개발 가이드용 샘플 파일
-->
<!--
  @tags: patterns 통신, Props Emit
  @category: communication
  @description: Props/Emit 패턴 샘플 컴포넌트
-->
<template>
  <div class="sample-header">
    <h3 class="sample-title">Props/Emit 패턴</h3>
    <p class="sample-description">Props로 데이터 전달, Emit으로 이벤트 전달 예시</p>
  </div>
  <div class="sample-container">
      <div class="code-preview">
        <pre><code>{{ codeExample }}</code></pre>
      </div>
    </div>
</template>

<script setup>
const codeExample = [
  '// 부모 컴포넌트',
  '<' + 'template>',
  '  <ChildComponent ',
  '    :message="parentMessage" ',
  '    @update="handleUpdate"',
  '  />',
  '</' + 'template>',
  '',
  '<' + 'script setup>',
  "import { ref } from 'vue'",
  '',
  "const parentMessage = ref('Hello')",
  'const handleUpdate = (value) => {',
  '  parentMessage.value = value',
  '}',
  '</' + 'script>',
  '',
  '// 자식 컴포넌트',
  '<' + 'template>',
  "  <button @click=\"$emit('update', 'New Value')\">",
  '    {{ message }}',
  '  </button>',
  '</' + 'template>',
  '',
  '<' + 'script setup>',
  "defineProps(['message'])",
  "defineEmits(['update'])",
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

