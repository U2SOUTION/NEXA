<!--
  [NEXA-ADMIN-01] 슈퍼관리자 강제 비밀번호 변경
  - role=admin && password_must_change 일 때만 표시
-->
<template>
  <div class="admin-change-password q-pa-lg">
    <div class="change-password-card">
      <div class="text-h5 q-mb-sm">비밀번호 변경 필요</div>
      <p class="text-body2 text-grey-7 q-mb-md">
        슈퍼관리자 계정은 보안을 위해 강한 비밀번호로 변경해야 합니다.<br />
        최소 10자, 영문·숫자·특수문자를 각각 1자 이상 포함해 주세요.
      </p>
      <q-form @submit="onSubmit" class="q-gutter-md">
        <q-input
          v-model="currentPassword"
          type="password"
          label="현재 비밀번호"
          outlined
          dense
          :disable="loading"
          autocomplete="current-password"
          :rules="[(v) => !!v || '현재 비밀번호를 입력하세요']"
        />
        <q-input
          v-model="newPassword"
          type="password"
          label="새 비밀번호 (10자 이상, 영문·숫자·특수문자 포함)"
          outlined
          dense
          :disable="loading"
          autocomplete="new-password"
          :rules="[(v) => !!v && v.length >= 10 || '10자 이상 입력하세요']"
        />
        <q-input
          v-model="confirmPassword"
          type="password"
          label="새 비밀번호 확인"
          outlined
          dense
          :disable="loading"
          autocomplete="new-password"
          :rules="[(v) => v === newPassword || '비밀번호가 일치하지 않습니다']"
        />
        <p v-if="error" class="text-negative text-body2">{{ error }}</p>
        <div>
          <q-btn
            unelevated
            color="primary"
            type="submit"
            label="비밀번호 변경"
            :loading="loading"
          />
        </div>
      </q-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@system/store/authStore'

const authStore = useAuthStore()
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')

async function onSubmit() {
  if (newPassword.value !== confirmPassword.value) {
    error.value = '새 비밀번호가 일치하지 않습니다.'
    return
  }
  error.value = ''
  loading.value = true
  try {
    const result = await authStore.changePassword(currentPassword.value, newPassword.value)
    if (result.ok) {
      currentPassword.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
    } else {
      error.value = result.error ?? '변경에 실패했습니다.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.admin-change-password {
  max-width: 420px;
  margin: 0 auto;
}
.change-password-card {
  padding: 1rem 0;
}
</style>
