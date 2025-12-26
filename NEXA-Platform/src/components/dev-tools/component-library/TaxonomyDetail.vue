<!-- TaxonomyDetail.vue
  부류체계 상세 정보 컴포넌트
-->

<template>
  <div class="taxonomy-detail">
    <div class="empty-state q-pa-xl text-center">
      <q-icon name="account_tree" size="64px" class="q-mb-md" />
      <div class="text-h6">부류체계는 추후 구현 예정입니다</div>
    </div>
  </div>
</template>

<script setup>
// 부류체계 상세 정보는 추후 구현
</script>

<style lang="scss" scoped>
.taxonomy-detail {
  height: 100%;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--nexa-text-secondary);
}
</style>

