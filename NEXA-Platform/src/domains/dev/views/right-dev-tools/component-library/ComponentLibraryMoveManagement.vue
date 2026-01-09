<!-- ComponentLibraryMoveManagement.vue
  컴포넌트 라이브러리 이동 관리 컴포넌트
-->

<template>
  <div v-if="selectedComponent" class="component-library-move-management">
    <div class="section-header">
      <q-icon name="drive_file_move" size="20px" />
      <h4 class="section-title">이동 관리</h4>
    </div>
    <div class="move-management-content">
      <div class="info-row">
        <span class="info-label">현재 위치:</span>
        <span class="info-value code">{{ selectedComponent.path }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">제안 위치:</span>
        <span class="info-value code">-</span>
      </div>
      <div class="move-actions">
        <q-btn flat dense icon="open_in_new" label="파일 열기" @click="handleOpenFile" class="full-width q-mb-sm" />
        <q-btn flat dense icon="drive_file_move" label="이동 계획 수립" @click="handleShowMoveDialog" class="full-width" />
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  selectedComponent: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['open-file', 'show-move-dialog'])

// 파일 열기
function handleOpenFile() {
  emit('open-file', props.selectedComponent.path)
}

// 이동 다이얼로그 표시
function handleShowMoveDialog() {
  emit('show-move-dialog')
}
</script>

<style lang="scss" scoped>
.component-library-move-management {
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

.move-management-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  .info-row {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.5rem;
    background-color: var(--nexa-background);
    border-radius: 4px;

    .info-label {
      font-size: 0.75rem;
      color: var(--nexa-text-secondary);
      font-weight: 500;
    }

    .info-value {
      font-size: 0.85rem;
      color: var(--nexa-text-primary);

      &.code {
        font-family: monospace;
        background-color: var(--nexa-surface);
        padding: 0.25rem 0.5rem;
        border-radius: 2px;
      }
    }
  }

  .move-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>

