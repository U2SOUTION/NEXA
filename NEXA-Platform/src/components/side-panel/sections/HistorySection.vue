<template>
  <div class="history-section">
    <div class="q-pa-sm">
      <q-list>
        <q-item v-for="i in 5" :key="i" clickable v-ripple>
          <q-item-section>
            <q-item-label>히스토리 항목 {{ i }}</q-item-label>
            <q-item-label caption>2024-03-{{ i }} 12:00</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script setup>
// 히스토리 관련 로직은 추후 구현
</script>

<style lang="scss" scoped>
.history-section {
  .q-item {
    border-bottom: 1px solid var(--nexa-border-color);

    &:last-child {
      border-bottom: none;
    }
  }
}
</style>
