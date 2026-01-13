<template>
  <q-list dense class="section-list">
    <q-item-label header>HUB</q-item-label>
    <q-item v-for="item in hubItems" :key="item.label" dense>
      <q-item-section avatar><q-icon :name="item.icon" /></q-item-section>
      <q-item-section>{{ item.label }}</q-item-section>
    </q-item>
  </q-list>
</template>

<script setup>
const hubItems = [
  { label: '자산 트리', icon: 'account_tree' },
  { label: '프로젝트 그리드', icon: 'grid_view' },
  { label: '지식 맵', icon: 'share' },
  { label: '추천/인사이트', icon: 'lightbulb' },
]
</script>

<style scoped lang="scss">
.section-list {
  :deep(.q-item__label) {
    color: var(--nexa-text-primary);
  }
}
</style>
