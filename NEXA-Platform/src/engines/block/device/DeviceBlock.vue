<template>
  <div class="device-block" :class="[`variant-${variant}`]">
    <div class="device-placeholder">
      장비 블록 (구현 예정)
    </div>
  </div>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => {
      return ['default', 'main', 'sidebar', 'compact'].includes(value)
    }
  }
})
</script>

<style lang="scss" scoped>
.device-block {
  padding: 1rem;
}
</style>

