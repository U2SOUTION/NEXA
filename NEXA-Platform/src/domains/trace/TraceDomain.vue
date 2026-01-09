<template>
  <q-page class="trace-domain-container">
    <TraceContent />
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDomainIntercom } from '@system/composables/useDomainIntercom'
import TraceContent from './views/content/TraceContent.vue'

const { reportActive } = useDomainIntercom('nexa-trace')

onMounted(() => {
  reportActive()
})
</script>

<style lang="scss" scoped>
.trace-domain-container {
  background: var(--nexa-background);
  height: 100%;
}
</style>
