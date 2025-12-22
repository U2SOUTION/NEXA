<!-- OutlinedInputSample.vue
  입력 필드 샘플 (핵심만)
  아코디언 화살표 가려짐 테스트용
-->
<template>
  <div class="outlined-input-sample">
    <form @submit.prevent>
      <div class="form-group">
        <div class="text-subtitle2 q-mb-sm">입력 필드 (q-input)</div>

        <!-- 기본 텍스트 입력 -->
        <q-input v-model="formData.name" label="이름 (기본 텍스트 입력)" outlined dense class="q-mb-sm" />

        <!-- 필수 입력 필드 (Quasar 기본 동작) -->
        <q-input v-model="formData.age" label="* 나이 (필수 입력, 에러 영역 할당)" :rules="[(val) => !!val || '나이를 입력하세요']" outlined dense required class="q-mb-sm" />

        <!-- 유효성 검사 포함 (에러 영역 숨김 - 문제 발생 시에만 표시) -->
        <q-input v-model="formData.email" label="이메일 (유효성 검사 포함, 에러 영역 숨김)" :rules="[(val) => (val && val.length > 0) || '이메일을 입력하세요']" outlined dense hide-bottom-space class="q-mb-sm" />

        <!-- 긴 라벨 텍스트 입력 -->
        <q-input v-model="formData.address" label="주소 (매우 긴 라벨 텍스트: 이 라벨은 가로로 매우 길게 확장될 수 있어서 아코디언 화살표를 가릴 수 있습니다)" outlined dense class="q-mb-sm" />

        <!-- 특수 타입 입력 (url) -->
        <q-input v-model="formData.website" type="url" label="웹사이트 (url 타입)" autocomplete="url" outlined dense class="q-mb-sm" />

        <!-- 자동 높이 조절 텍스트 영역 -->
        <q-input v-model="formData.description" type="textarea" label="설명 (textarea, autogrow)" outlined dense autogrow class="q-mb-sm" />
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const formData = ref({
  name: '',
  age: '',
  address: '',
  email: '',
  website: '',
  description: '',
})
</script>

<style lang="scss" scoped></style>
