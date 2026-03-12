<!--
  [NEXA-ADMIN-01] 관리자 도메인 루트
  - MainLayout 하위, 도메인 키: nexa-admin
  - 슈퍼관리자(admin) + password_must_change 시 비밀번호 변경 화면, 아니면 AdminContent
-->
<template>
  <q-page class="admin-domain-container">
    <AdminChangePassword v-if="showChangePassword" />
    <AdminContent v-else />
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useDomainIntercom } from '@system/composables/useDomainIntercom'
import { useAuthStore } from '@system/store/authStore'
import AdminContent from './views/content/AdminContent.vue'
import AdminChangePassword from './views/AdminChangePassword.vue'

const { reportActive } = useDomainIntercom('nexa-admin')
const authStore = useAuthStore()

const showChangePassword = computed(() => {
  const u = authStore.user
  return !!u && u.role === 'admin' && u.password_must_change === true
})

onMounted(() => {
  reportActive()
})
</script>

<style lang="scss" scoped>
.admin-domain-container {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
