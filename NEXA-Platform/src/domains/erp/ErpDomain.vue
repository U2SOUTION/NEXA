<template>
  <q-page class="erp-domain-container">
    <ErpContent />
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDomainIntercom } from '@system/composables/useDomainIntercom'
import ErpContent from './views/content/ErpContent.vue'

const { reportActive } = useDomainIntercom('erp')

onMounted(() => {
  reportActive()
})
</script>

<style lang="scss" scoped>
.erp-domain-container {
  background: var(--nexa-background);
}
</style>
