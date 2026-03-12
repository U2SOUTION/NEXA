<!--
  [NEXA-AUTH-01] 로그인 페이지
-->
<template>
  <q-page class="flex flex-center auth-page">
    <q-card class="auth-card q-pa-lg" flat bordered>
      <q-card-section class="text-center q-pb-md">
        <div class="text-h5 text-weight-bold text-primary">NEXA 로그인</div>
        <div class="text-body2 text-grey-7 q-mt-xs">이메일과 비밀번호를 입력하세요</div>
      </q-card-section>
      <q-card-section>
        <q-form class="column q-gutter-md" @submit.prevent="onSubmit">
          <q-input
            v-model="email"
            type="email"
            label="이메일"
            outlined
            dense
            :error="!!error"
            :error-message="error"
            autocomplete="email"
            :disable="loading"
            @update:model-value="error = ''"
          />
          <q-input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            label="비밀번호"
            outlined
            dense
            autocomplete="current-password"
            :disable="loading"
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
          <q-btn
            type="submit"
            label="로그인"
            color="primary"
            unelevated
            no-caps
            class="full-width"
            :loading="loading"
            :disable="!email.trim() || !password"
          />
        </q-form>
      </q-card-section>
      <q-card-section class="text-center q-pt-none">
        <router-link to="/register" class="text-primary text-body2">계정이 없으신가요? 회원가입</router-link>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@system/store/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

onMounted(() => {
  authStore.init()
})

async function onSubmit() {
  error.value = ''
  if (!email.value.trim() || !password.value) return
  loading.value = true
  try {
    const result = await authStore.login(email.value, password.value)
    if (result.ok) {
      const u = authStore.user
      const needChangePw = u?.role === 'first' || u?.password_must_change === true
      const redirect = (route.query.redirect && String(route.query.redirect)) || '/'
      if (needChangePw) {
        await router.replace({ path: '/change-password', query: redirect && redirect !== '/' ? { redirect } : {} })
      } else {
        await router.replace(redirect)
      }
    } else {
      error.value = result.error || '로그인에 실패했습니다.'
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
  max-width: 400px;
  border-radius: 8px;
}
a {
  text-decoration: none;
}
</style>
