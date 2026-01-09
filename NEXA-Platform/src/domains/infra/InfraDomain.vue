<template>
  <q-page class="infra-domain-container">
    <!-- 도메인별 3단 구성을 위한 메인 뷰 -->
    <InfraContent />
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDomainIntercom } from '@system/composables/useDomainIntercom'
import InfraContent from './views/content/InfraContent.vue'

// INFRA 도메인 인터콤 초기화
const { reportActive } = useDomainIntercom('infra')

onMounted(() => {
  // 시스템에 도메인 활성화 보고
  reportActive()
})
</script>

<style lang="scss" scoped>
.infra-domain-container {
  background: var(--nexa-background);
}
</style>
