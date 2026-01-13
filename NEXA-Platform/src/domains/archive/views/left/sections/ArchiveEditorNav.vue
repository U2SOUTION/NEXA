<template>
  <q-list dense class="section-list">
    <q-item-label header>EDITOR</q-item-label>
    <q-item v-for="item in editorItems" :key="item.label" dense>
      <q-item-section avatar><q-icon :name="item.icon" /></q-item-section>
      <q-item-section>{{ item.label }}</q-item-section>
    </q-item>
  </q-list>
</template>

<script setup>
const editorItems = [
  { label: '문서 목록', icon: 'description' },
  { label: '템플릿 선택', icon: 'view_module' },
  { label: '블록 라이브러리', icon: 'extension' },
  { label: '버전/히스토리', icon: 'update' },
]
</script>

<style scoped lang="scss">
.section-list {
  :deep(.q-item__label) {
    color: var(--nexa-text-primary);
  }
}
</style>
