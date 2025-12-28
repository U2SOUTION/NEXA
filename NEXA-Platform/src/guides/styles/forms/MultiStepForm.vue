<!-- MultiStepForm.vue
  다단계 폼 샘플 컴포넌트
  개발 가이드용 샘플 파일
-->
<!--
  @tags: styles 폼, 다단계 폼
  @category: forms
  @description: Multi-Step Form 샘플 컴포넌트
-->
<template>
  <div class="multi-step-form-sample">
    <div class="sample-header">
      <h3 class="sample-title">다단계 폼 샘플</h3>
      <p class="sample-description">여러 단계로 나뉜 폼 예시</p>
    </div>
    <div class="sample-container">
      <q-stepper v-model="step" color="primary" animated>
        <q-step :name="1" title="1단계" icon="info" :done="step > 1">
          <q-input v-model="form.name" label="이름" outlined />
          <q-input v-model="form.email" label="이메일" type="email" outlined />
        </q-step>

        <q-step :name="2" title="2단계" icon="settings" :done="step > 2">
          <q-select v-model="form.category" :options="categoryOptions" label="카테고리" outlined />
          <q-input v-model="form.description" label="설명" type="textarea" outlined />
        </q-step>

        <q-step :name="3" title="3단계" icon="check">
          <div class="summary">
            <p>이름: {{ form.name }}</p>
            <p>이메일: {{ form.email }}</p>
            <p>카테고리: {{ form.category }}</p>
            <p>설명: {{ form.description }}</p>
          </div>
        </q-step>

        <template v-slot:navigation>
          <q-stepper-navigation>
            <q-btn v-if="step > 1" flat color="primary" @click="previousStep" label="이전" class="q-mr-sm" />
            <q-btn v-if="step < 3" color="primary" @click="nextStep" label="다음" />
            <q-btn v-else color="primary" @click="submitForm" label="완료" />
          </q-stepper-navigation>
        </template>
      </q-stepper>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const step = ref(1)
const form = ref({
  name: '',
  email: '',
  category: '',
  description: '',
})

const categoryOptions = ['옵션 1', '옵션 2', '옵션 3']

function nextStep() {
  if (step.value < 3) {
    step.value++
  }
}

function previousStep() {
  if (step.value > 1) {
    step.value--
  }
}

function submitForm() {
  console.log('폼 제출:', form.value)
}
</script>

<style lang="scss" scoped>
.multi-step-form-sample {
  padding: 16px;
  background-color: var(--nexa-surface);
  border-radius: 8px;

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
    .summary {
      padding: 16px;
      background-color: var(--nexa-background);
      border-radius: 4px;

      p {
        color: var(--nexa-text-primary);
        margin-bottom: 8px;
      }
    }
  }
}
</style>

