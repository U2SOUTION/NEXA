<!-- DateInput.vue
  날짜 입력 샘플 컴포넌트
  개발 가이드용 샘플 파일
-->
<!--
  @tags: styles 입력, 날짜 입력
  @category: inputs
  @description: Date Input 샘플 컴포넌트
-->
<template>
  <div class="date-input-sample">
    <div class="sample-header">
      <h3 class="sample-title">날짜 입력 샘플</h3>
      <p class="sample-description">날짜 선택 입력 필드 예시</p>
    </div>
    <div class="sample-container">
      <div class="input-examples">
        <q-input v-model="date" type="date" label="기본 날짜 입력" outlined />
        <q-input v-model="datetime" type="datetime-local" label="날짜/시간 입력" outlined />
        <q-input v-model="time" type="time" label="시간 입력" outlined />
        <q-input v-model="date" mask="####-##-##" label="날짜 마스크 입력" outlined>
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="date" mask="YYYY-MM-DD">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="닫기" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const date = ref('')
const datetime = ref('')
const time = ref('')
</script>

<style lang="scss" scoped>
.date-input-sample {
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
    .input-examples {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  }
}
</style>

