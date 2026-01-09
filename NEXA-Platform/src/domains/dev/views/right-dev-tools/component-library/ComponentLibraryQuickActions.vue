<!-- ComponentLibraryQuickActions.vue
  컴포넌트 라이브러리 빠른 액션 컴포넌트
-->

<template>
  <div class="component-library-quick-actions">
    <div class="section-header">
      <q-icon name="flash_on" size="20px" />
      <h4 class="section-title">빠른 액션</h4>
    </div>
    <div class="actions-content">
      <q-btn flat dense icon="content_copy" label="경로 복사" @click="handleCopyPath" :disable="!selectedComponent" class="full-width q-mb-sm" />
      <q-btn flat dense icon="refresh" label="전체 재검사" @click="handleScanAndValidate" :loading="isScanning" class="full-width q-mb-sm" />
      <q-btn flat dense icon="rule" label="규칙 관리" @click="handleShowRuleSettings" class="full-width q-mb-sm" />
      <q-btn flat dense icon="folder_open" label="파일 구조" @click="handleShowFileStructure" class="full-width" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  selectedComponent: {
    type: Object,
    default: null,
  },
  isScanning: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['copy-path', 'scan-and-validate', 'show-rule-settings', 'show-file-structure'])

// 경로 복사
function handleCopyPath() {
  emit('copy-path')
}

// 전체 재검사
function handleScanAndValidate() {
  emit('scan-and-validate')
}

// 규칙 설정 표시
function handleShowRuleSettings() {
  emit('show-rule-settings')
}

// 파일 구조 표시
function handleShowFileStructure() {
  emit('show-file-structure')
}
</script>

<style lang="scss" scoped>
.component-library-quick-actions {
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

.actions-content {
  display: flex;
  flex-direction: column;
}
</style>

