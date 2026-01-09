<template>
  <q-page class="dev-domain-container">
    <DevelopmentPage />
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDomainIntercom } from '@system/composables/useDomainIntercom'
import DevelopmentPage from 'pages/DevelopmentPage.vue'

const { reportActive } = useDomainIntercom('dev')

onMounted(() => {
  reportActive()
})
</script>
