<template>
  <q-page class="nexage-domain-container">
    <router-view />
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDomainIntercom } from '@system/composables/useDomainIntercom'

const { reportActive } = useDomainIntercom('nexage')

onMounted(() => {
  reportActive()
})
</script>

<style lang="scss" scoped>
.nexage-domain-container {
  background: var(--nexa-background);
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
