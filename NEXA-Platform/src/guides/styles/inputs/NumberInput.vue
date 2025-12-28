<!-- NumberInput.vue
  숫자 입력 샘플 컴포넌트
  개발 가이드용 샘플 파일
-->
<!--
  @tags: styles 입력, 숫자 입력
  @category: inputs
  @description: Number Input 샘플 컴포넌트
-->
<template>
  <div class="sample-header">
    <h3 class="sample-title">숫자 입력 샘플</h3>
    <p class="sample-description">숫자만 입력 가능한 필드 예시</p>
  </div>
  <div class="sample-container">
    <div class="input-examples">
      <q-input v-model.number="number" type="number" label="기본 숫자 입력" outlined />
      <q-input v-model.number="number" type="number" label="최소/최대값" :min="0" :max="100" outlined />
      <q-input v-model.number="number" type="number" label="스텝 입력" :step="10" outlined />
      <q-input v-model.number="number" type="number" label="아이콘 숫자 입력" outlined>
        <template v-slot:prepend>
          <q-icon name="numbers" />
        </template>
      </q-input>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const number = ref(0)
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
