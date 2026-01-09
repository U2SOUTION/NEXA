<template>
  <q-page class="node-domain-container">
    <NodeContent />
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDomainIntercom } from '@system/composables/useDomainIntercom'
import NodeContent from './views/content/NodeContent.vue'

const { reportActive } = useDomainIntercom('automation')

onMounted(() => {
  reportActive()
})
</script>

<style lang="scss" scoped>
.node-domain-container {
  background: var(--nexa-background);
  height: 100%;
}
</style>
