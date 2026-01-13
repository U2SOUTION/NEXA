<template>
  <q-list dense class="section-list">
    <q-item-label header>INSIGHTS</q-item-label>
    <q-item v-for="item in insightItems" :key="item.label" dense>
      <q-item-section avatar><q-icon :name="item.icon" /></q-item-section>
      <q-item-section>{{ item.label }}</q-item-section>
    </q-item>
  </q-list>
</template>

<script setup>
const insightItems = [
  { label: '관계망 뷰', icon: 'timeline' },
  { label: '타임라인 로그', icon: 'receipt_long' },
  { label: '알림/이벤트', icon: 'notifications' },
  { label: '보고서/다운로드', icon: 'download' },
]
</script>

<style scoped lang="scss">
.section-list {
  :deep(.q-item__label) {
    color: var(--nexa-text-primary);
  }
}
</style>
