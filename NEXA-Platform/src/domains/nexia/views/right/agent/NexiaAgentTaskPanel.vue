<template>
  <div class="nexia-agent-placeholder">
    <q-icon name="assignment" size="48px" class="placeholder-icon" />
    <div class="text-body1">테스크</div>
    <div class="text-caption text-grey-7">(준비 중)</div>
  </div>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.nexia-agent-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120px;

  .placeholder-icon {
    opacity: 0.3;
    margin-bottom: 12px;
  }
}
</style>
