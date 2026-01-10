<!-- TextInput.vue
  텍스트 입력 샘플 컴포넌트
  개발 가이드용 샘플 파일
-->
<template>
  <div class="sample-header">
    <h3 class="sample-title">텍스트 입력 샘플</h3>
    <p class="sample-description">기본 텍스트 입력 필드 예시</p>
  </div>
  <div class="sample-container">
    <div class="input-examples">
      <q-input v-model="text" label="기본 입력" outlined />
      <q-input v-model="text" label="아이콘 입력" outlined>
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
      <q-input v-model="text" label="비밀번호 입력" type="password" outlined />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const text = ref('')
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

