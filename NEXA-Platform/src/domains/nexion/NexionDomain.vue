<template>
  <q-page class="nexion-domain">
    <NexionContent />
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDomainIntercom } from '@system/composables/useDomainIntercom'
import NexionContent from './views/content/NexionContent.vue'

const { reportActive } = useDomainIntercom('nexion')

onMounted(() => {
  reportActive()
})
</script>

<style lang="scss" scoped>
.nexion-domain {
  background: var(--nexa-background);
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
