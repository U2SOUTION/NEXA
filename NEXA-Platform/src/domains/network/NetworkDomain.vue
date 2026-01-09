<template>
  <q-page class="network-domain-container">
    <NetworkContent />
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDomainIntercom } from '@system/composables/useDomainIntercom'
import NetworkContent from './views/content/NetworkContent.vue'

const { reportActive } = useDomainIntercom('network')

onMounted(() => {
  reportActive()
})
</script>
