<template>
  <q-page class="ai-domain-container">
    <router-view />
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDomainIntercom } from '@system/composables/useDomainIntercom'

const { reportActive } = useDomainIntercom('nexa-ai')

onMounted(() => {
  reportActive()
})
</script>

<style lang="scss" scoped>
.ai-domain-container {
  background: var(--nexa-background);
  height: 100%;
}
</style>
