<template>
  <q-page class="parts-management-domain-container">
    <PartsManagementContent />
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDomainIntercom } from '@system/composables/useDomainIntercom'
import PartsManagementContent from './views/content/PartsManagementContent.vue'

const { reportActive } = useDomainIntercom('parts-management')

onMounted(() => {
  reportActive()
})
</script>

<style lang="scss" scoped>
.parts-management-domain-container {
  background: var(--nexa-background);
  height: 100%;
}
</style>
