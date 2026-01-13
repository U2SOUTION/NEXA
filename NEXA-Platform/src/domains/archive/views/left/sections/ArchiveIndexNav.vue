<template>
  <q-list dense class="section-list">
    <q-item-label header>개요</q-item-label>
    <q-item v-for="item in overviewItems" :key="item.label" dense>
      <q-item-section avatar><q-icon :name="item.icon" /></q-item-section>
      <q-item-section>{{ item.label }}</q-item-section>
    </q-item>
  </q-list>
</template>

<script setup>
const overviewItems = [
  { label: '개요', icon: 'info' },
  { label: '최근 활동', icon: 'history' },
  { label: '빠른 연결', icon: 'link' },
  { label: '가이드', icon: 'menu_book' },
]
</script>

<style scoped lang="scss">
.section-list {
  :deep(.q-item__label) {
    color: var(--nexa-text-primary);
  }
}
</style>
