<template>
  <q-page class="nexeed-domain-container">
    <NexeedContent />
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDomainIntercom } from '@system/composables/useDomainIntercom'
import NexeedContent from './views/content/NexeedContent.vue'

const { reportActive } = useDomainIntercom('nexeed')

onMounted(() => {
  reportActive()
})
</script>

<style lang="scss" scoped>
.nexeed-domain-container {
  background: var(--nexa-background);
  height: 100%;
}
</style>
