<template>
  <q-page class="nexia-domain-container">
    <router-view />
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDomainIntercom } from '@system/composables/useDomainIntercom'

const { reportActive } = useDomainIntercom('nexia')

onMounted(() => {
  reportActive()
})
</script>

<style lang="scss" scoped>
.nexia-domain-container {
  background: var(--nexa-background);
  height: 100%;
}
</style>
