<template>
  <q-page class="nexel-domain-container">
    <NexelContent />
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDomainIntercom } from '@system/composables/useDomainIntercom'
import NexelContent from './views/content/NexelContent.vue'

const { reportActive } = useDomainIntercom('nexel')

onMounted(() => {
  reportActive()
})
</script>

<style lang="scss" scoped>
.nexel-domain-container {
  background: var(--nexa-background);
  height: 100%;
}
</style>
