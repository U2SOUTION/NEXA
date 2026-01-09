<template>
  <q-page class="portfolio-domain-container">
    <PortfolioContent />
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDomainIntercom } from '@system/composables/useDomainIntercom'
import PortfolioContent from './views/content/PortfolioContent.vue'

const { reportActive } = useDomainIntercom('portfolio')

onMounted(() => {
  reportActive()
})
</script>

<style lang="scss" scoped>
.portfolio-domain-container {
  background: var(--nexa-background);
  height: 100%;
}
</style>
