<!-- RadioInput.vue
  라디오 버튼 입력 샘플 컴포넌트
  개발 가이드용 샘플 파일
-->
<!--
  @tags: styles 입력, 라디오 버튼
  @category: inputs
  @description: Radio Input 샘플 컴포넌트
-->
<template>
  <div class="sample-header">
    <h3 class="sample-title">라디오 버튼 입력 샘플</h3>
    <p class="sample-description">라디오 버튼 입력 필드 예시</p>
  </div>
  <div class="sample-container">
    <div class="input-examples">
      <q-radio v-model="radio" val="option1" label="옵션 1" />
      <q-radio v-model="radio" val="option2" label="옵션 2" />
      <q-radio v-model="radio" val="option3" label="옵션 3" />
      <div class="radio-group">
        <q-radio v-model="radio2" val="red" label="빨강" color="red" />
        <q-radio v-model="radio2" val="blue" label="파랑" color="blue" />
        <q-radio v-model="radio2" val="green" label="초록" color="green" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const radio = ref('option1')
const radio2 = ref('red')
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

    .radio-group {
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
