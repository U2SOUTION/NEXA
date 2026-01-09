<!-- ComponentLibraryRelatedDocs.vue
  컴포넌트 라이브러리 관련 문서 컴포넌트
-->

<template>
  <div class="component-library-related-docs">
    <div class="section-header">
      <q-icon name="description" size="20px" />
      <h4 class="section-title">관련 문서</h4>
    </div>
    <div class="docs-content">
      <q-list dense>
        <q-item clickable @click="handleOpenDocument('component-organization-guide')">
          <q-item-section avatar>
            <q-icon name="article" />
          </q-item-section>
          <q-item-section>
            <q-item-label>컴포넌트 조직화 가이드</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable @click="handleOpenDocument('naming-convention')">
          <q-item-section avatar>
            <q-icon name="article" />
          </q-item-section>
          <q-item-section>
            <q-item-label>네이밍 컨벤션</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable @click="handleOpenDocument('component-contract')">
          <q-item-section avatar>
            <q-icon name="article" />
          </q-item-section>
          <q-item-section>
            <q-item-label>컴포넌트 표준 계약</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['open-document'])

// 문서 열기
function handleOpenDocument(docType) {
  emit('open-document', docType)
}
</script>

<style lang="scss" scoped>
.component-library-related-docs {
  padding: 1rem;
  border-bottom: 1px solid var(--nexa-border-color);

  .section-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;

    .section-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--nexa-text-primary);
      margin: 0;
      flex: 1;
    }
  }
}

.docs-content {
  .q-item {
    border-radius: 4px;
    margin-bottom: 0.25rem;

    &:hover {
      background-color: var(--nexa-surface-hover);
    }
  }
}
</style>
