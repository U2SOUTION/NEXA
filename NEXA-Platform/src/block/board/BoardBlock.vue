<template>
  <div class="board-block" :class="[`variant-${variant}`]">
    <div class="board-placeholder">보드 블록 (구현 예정)</div>
  </div>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => {
      return ['default', 'main', 'sidebar', 'compact'].includes(value)
    },
  },
})
</script>

<style lang="scss" scoped>
.board-block {
  padding: 1rem;
}
</style>
