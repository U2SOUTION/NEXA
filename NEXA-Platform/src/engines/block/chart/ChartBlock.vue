<template>
  <div class="chart-block" :class="[`variant-${variant}`]">
    <div class="chart-placeholder">차트 블록 (구현 예정)</div>
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
.chart-block {
  padding: 1rem;
}
</style>
