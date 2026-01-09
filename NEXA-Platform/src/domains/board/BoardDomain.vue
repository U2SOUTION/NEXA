<template>
  <q-page class="board-domain-container">
    <BoardContent />
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDomainIntercom } from '@system/composables/useDomainIntercom'
import BoardContent from './views/content/BoardContent.vue'

const { reportActive } = useDomainIntercom('nexa-board')

onMounted(() => {
  reportActive()
})
</script>

<style lang="scss" scoped>
.board-domain-container {
  background: var(--nexa-background);
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
