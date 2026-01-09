<template>
  <q-page class="solutions-domain-container">
    <SolutionsContent />
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDomainIntercom } from '@system/composables/useDomainIntercom'
import SolutionsContent from './views/content/SolutionsContent.vue'

const { reportActive } = useDomainIntercom('solutions')

onMounted(() => {
  reportActive()
})
</script>
