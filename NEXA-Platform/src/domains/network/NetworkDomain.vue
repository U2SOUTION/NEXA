<template>
  <q-page class="network-domain-container">
    <NetworkPage />
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDomainIntercom } from '@system/composables/useDomainIntercom'
import NetworkPage from 'pages/NetworkPage.vue'

const { reportActive } = useDomainIntercom('network')

onMounted(() => {
  reportActive()
})
</script>
