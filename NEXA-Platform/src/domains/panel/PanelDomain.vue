<template>
  <q-page class="panel-domain-container">
    <PanelContent />
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDomainIntercom } from '@system/composables/useDomainIntercom'
import PanelContent from './views/content/PanelContent.vue'

const { reportActive } = useDomainIntercom('nexa-panel')

onMounted(() => {
  reportActive()
})
</script>

<style lang="scss" scoped>
.panel-domain-container {
  background: var(--nexa-background);
  height: 100%;
}
</style>
