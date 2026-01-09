<template>
  <div class="weather-block" :class="[`variant-${variant}`]">
    <div class="weather-placeholder">
      날씨 정보 블록 (구현 예정)
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
.weather-block {
  padding: 1rem;
}
</style>

