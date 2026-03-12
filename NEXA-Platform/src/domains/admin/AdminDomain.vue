<!--
  [NEXA-ADMIN-01] 관리자 도메인 루트
  - MainLayout 하위, 도메인 키: nexa-admin
  - 중앙 컨텐츠는 AdminContent
-->
<template>
  <q-page class="admin-domain-container">
    <AdminContent />
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDomainIntercom } from '@system/composables/useDomainIntercom'
import AdminContent from './views/content/AdminContent.vue'

const { reportActive } = useDomainIntercom('nexa-admin')

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
