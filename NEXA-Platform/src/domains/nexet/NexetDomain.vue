<template>
  <q-page class="nexet-domain-container">
    <NexetContent />
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDomainIntercom } from '@system/composables/useDomainIntercom'
import NexetContent from './views/content/NexetContent.vue'

const { reportActive } = useDomainIntercom('nexet')

onMounted(() => {
  reportActive()
})
</script>

<style lang="scss" scoped>
.nexet-domain-container {
  background: var(--nexa-background);
  height: 100%;
}
</style>
