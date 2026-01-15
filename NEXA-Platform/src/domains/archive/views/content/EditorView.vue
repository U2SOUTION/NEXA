<template>
  <div class="archive-view">
    <header class="page-header">
      <div class="title">EDITOR</div>
      <div class="subtitle">문서·블록·로직 조립 에디터</div>
    </header>

    <ArchiveEditorForm />
  </div>
</template>

<script setup>
import ArchiveEditorForm from '@domains/archive/components/ArchiveEditorForm.vue'
</script>

<style lang="scss" scoped>
.archive-view {
  padding: 16px;
  color: var(--nexa-text-primary);
  background: var(--nexa-background);
  min-height: 100%;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 16px;
  .title {
    font-size: 18px;
    font-weight: 700;
  }
  .subtitle {
    margin-top: 4px;
    font-size: 12px;
    color: var(--nexa-text-secondary);
  }
}
</style>
