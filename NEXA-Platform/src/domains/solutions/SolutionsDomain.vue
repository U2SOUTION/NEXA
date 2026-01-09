<template>
  <q-page class="solutions-domain-container">
    <SolutionsPage />
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDomainIntercom } from '@system/composables/useDomainIntercom'
import SolutionsPage from 'pages/SolutionsPage.vue'

const { reportActive } = useDomainIntercom('solutions')

onMounted(() => {
  reportActive()
})
</script>
