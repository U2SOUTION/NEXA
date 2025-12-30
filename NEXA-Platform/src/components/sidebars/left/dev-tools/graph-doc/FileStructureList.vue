<!-- FileStructureList.vue
  파일 구조 목록 컴포넌트
  파일 구조 트리 표시 및 선택 기능
-->

<template>
  <div class="file-structure-list-container">
    <q-scroll-area class="file-structure-list-scroll-area">
      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="loading-section q-pa-lg text-center">
        <q-spinner color="primary" size="3em" />
        <div class="q-mt-md text-caption">파일 구조를 불러오는 중...</div>
      </div>

      <!-- 파일 구조 트리 -->
      <div v-else-if="fileStructure" class="file-structure-tree q-pa-sm">
        <!-- TODO: 파일 구조 트리 구현 -->
        <div class="empty-section q-pa-lg text-center">
          <q-icon name="view_module" size="48px" color="grey-5" class="q-mb-md" />
          <div class="text-grey-7">파일 구조 트리 (구현 예정)</div>
        </div>
      </div>

      <!-- 파일 구조가 없을 때 -->
      <div v-else class="empty-section q-pa-lg text-center">
        <q-icon name="view_module" size="48px" color="grey-5" class="q-mb-md" />
        <div class="text-grey-7">파일 구조 데이터가 없습니다.</div>
      </div>
    </q-scroll-area>
  </div>
</template>

<script setup>
defineProps({
  fileStructure: {
    type: Object,
    default: null,
  },
  selectedFile: {
    type: Object,
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

// TODO: 파일 구조 트리 구현 시 사용
// const emit = defineEmits(['file-selected'])
</script>

<style lang="scss" scoped>
.file-structure-list-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.file-structure-list-scroll-area {
  flex: 1;
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

// .file-structure-tree {
//   // 파일 구조 트리 스타일 (구현 예정)
// }

.empty-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}
</style>
