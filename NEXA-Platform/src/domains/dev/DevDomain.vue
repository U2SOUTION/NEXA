<template>
  <q-page class="dev-domain-container">
    <DevContent />
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDomainIntercom } from '@system/composables/useDomainIntercom'
import DevContent from './views/content/DevContent.vue'

const { reportActive } = useDomainIntercom('dev')

onMounted(() => {
  reportActive()
})
</script>
