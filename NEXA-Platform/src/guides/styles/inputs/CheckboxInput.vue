<!-- CheckboxInput.vue
  체크박스 입력 샘플 컴포넌트
  개발 가이드용 샘플 파일
-->
<!--
  @tags: styles 입력, 체크박스
  @category: inputs
  @description: Checkbox Input 샘플 컴포넌트
-->
<template>
  <div class="sample-header">
    <h3 class="sample-title">체크박스 입력 샘플</h3>
    <p class="sample-description">체크박스 입력 필드 예시</p>
  </div>
  <div class="sample-container">
    <div class="input-examples">
      <q-checkbox v-model="checked" label="기본 체크박스" />
      <q-checkbox v-model="checked2" label="색상 체크박스" color="primary" />
      <q-checkbox v-model="checked3" label="비활성화" disable />
      <div class="checkbox-group">
        <q-checkbox v-model="options" val="option1" label="옵션 1" />
        <q-checkbox v-model="options" val="option2" label="옵션 2" />
        <q-checkbox v-model="options" val="option3" label="옵션 3" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const checked = ref(false)
const checked2 = ref(true)
const checked3 = ref(false)
const options = ref(['option1'])
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

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      background-color: var(--nexa-background);
      border-radius: 4px;
    }
  }
}
</style>
