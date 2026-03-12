<!--
  [NEXA-ADMIN-01] 비밀번호 변경 — role=first 또는 password_must_change 시 표시
  nexa-admin 외부, 인증된 사용자 전용. 성공 시 role=admin 또는 password_must_change 해제
-->
<template>
  <q-page class="flex flex-center auth-page">
    <q-card class="auth-card q-pa-lg" flat bordered>
      <q-card-section class="text-center q-pb-md">
        <div class="text-h5 text-weight-bold text-primary">비밀번호 변경</div>
        <div class="text-body2 text-grey-7 q-mt-xs">
          관리자 계정은 보안을 위해 강한 비밀번호로 변경해 주세요.<br />
          최소 10자, 영문·숫자·특수문자를 각각 1자 이상 포함해 주세요.
        </div>
      </q-card-section>
      <q-card-section>
        <q-form class="column q-gutter-md" @submit.prevent="onSubmit">
          <q-input
            v-model="currentPassword"
            type="password"
            label="현재 비밀번호"
            outlined
            dense
            :disable="loading"
            autocomplete="current-password"
            :error="!!error"
            @update:model-value="error = ''"
          />
          <q-input
            v-model="newPassword"
            :type="showPassword ? 'text' : 'password'"
            label="새 비밀번호 (10자 이상, 영문·숫자·특수문자 포함)"
            outlined
            dense
            :disable="loading"
            autocomplete="new-password"
            @update:model-value="error = ''"
          >
            <template #append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>
          <q-input
            v-model="confirmPassword"
            type="password"
            label="새 비밀번호 확인"
            outlined
            dense
            :disable="loading"
            autocomplete="new-password"
          />
          <p v-if="error" class="text-negative text-body2 q-my-none">{{ error }}</p>
          <q-btn
            type="submit"
            label="비밀번호 변경"
            color="primary"
            unelevated
            no-caps
            class="full-width"
            :loading="loading"
            :disable="!currentPassword || !newPassword || newPassword.length < 10 || newPassword !== confirmPassword"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@system/store/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

onMounted(() => {
  authStore.init()
})

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
      const redirect = (route.query.redirect && String(route.query.redirect)) || '/nexa-admin'
      await router.replace(redirect)
    } else {
      error.value = result.error ?? '변경에 실패했습니다.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.auth-page {
  padding: 16px;
}
.auth-card {
  width: 100%;
  max-width: 420px;
  border-radius: 8px;
}
</style>
