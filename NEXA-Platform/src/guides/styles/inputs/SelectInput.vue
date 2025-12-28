<!-- SelectInput.vue
  선택 입력 샘플 컴포넌트
  개발 가이드용 샘플 파일
-->
<template>
  <div class="sample-header">
    <h3 class="sample-title">선택 입력 샘플</h3>
    <p class="sample-description">드롭다운 선택 필드 예시</p>
  </div>
  <div class="sample-container">
    <div class="input-examples">
      <q-select v-model="selected" :options="options" label="기본 선택" outlined />
      <q-select v-model="selected" :options="options" label="다중 선택" multiple outlined />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const selected = ref(null)
const options = ['옵션 1', '옵션 2', '옵션 3']
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
  .input-examples {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}
</style>
