<!-- LoginForm.vue
  로그인 폼 샘플 컴포넌트
  개발 가이드용 샘플 파일
-->
<template>
  <div class="sample-header">
    <h3 class="sample-title">로그인 폼 샘플</h3>
    <p class="sample-description">기본 로그인 폼 레이아웃 예시</p>
  </div>
  <div class="sample-container">
    <div class="form-examples">
      <q-input v-model="email" label="이메일" type="email" outlined />
      <q-input v-model="password" label="비밀번호" type="password" outlined />
      <q-btn color="primary" label="로그인" class="full-width" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const password = ref('')
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
  .form-examples {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}
</style>
