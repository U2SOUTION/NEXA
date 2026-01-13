<template>
  <q-list dense class="section-list">
    <q-item-label header>CONNECTOR</q-item-label>
    <q-item v-for="item in connectorItems" :key="item.label" dense>
      <q-item-section avatar><q-icon :name="item.icon" /></q-item-section>
      <q-item-section>{{ item.label }}</q-item-section>
    </q-item>
  </q-list>
</template>

<script setup>
const connectorItems = [
  { label: '장치/소스', icon: 'devices_other' },
  { label: '필드 매핑', icon: 'device_hub' },
  { label: '동기화 로그', icon: 'sync' },
  { label: '검증 규칙', icon: 'rule' },
]
</script>

<style scoped lang="scss">
.section-list {
  :deep(.q-item__label) {
    color: var(--nexa-text-primary);
  }
}
</style>
