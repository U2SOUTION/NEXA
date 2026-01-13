<template>
  <q-page class="archive-domain-container">
    <router-view />
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDomainIntercom } from '@system/composables/useDomainIntercom'

const { reportActive } = useDomainIntercom('nexa-archive')

onMounted(() => {
  reportActive()
})
</script>

<style lang="scss" scoped>
.archive-domain-container {
  background: var(--nexa-background);
  height: 100%;
}
</style>
