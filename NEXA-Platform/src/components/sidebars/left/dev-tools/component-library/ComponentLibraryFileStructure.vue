<!-- ComponentLibraryFileStructure.vue
  컴포넌트 라이브러리 파일 구조 컴포넌트
  디렉토리 구조 및 파일 구조 상세 보기 버튼
-->

<template>
  <div class="component-library-file-structure">
    <div class="section-header">
      <q-icon name="folder_tree" size="20px" />
      <h4 class="section-title">파일 구조</h4>
    </div>
    <div class="file-structure-content">
      <q-btn flat dense icon="folder_open" label="디렉토리 구조" @click="handleShowFileStructure" class="full-width" />
      <q-btn flat dense icon="description" label="파일 구조 상세" @click="handleShowFileStructureDetail" class="full-width q-mt-sm" />
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['show-file-structure', 'show-file-structure-detail'])

// 디렉토리 구조 보기
function handleShowFileStructure() {
  emit('show-file-structure')
}

// 파일 구조 상세 보기
function handleShowFileStructureDetail() {
  emit('show-file-structure-detail')
}
</script>

<style lang="scss" scoped>
.component-library-file-structure {
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

.file-structure-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>

