<template>
  <div class="nexia-placeholder-editor">
    <q-icon name="image" size="64px" class="placeholder-icon" />
    <div class="text-h6 q-mb-xs">Image Editor</div>
    <div class="text-body2 text-grey-7">(준비 중)</div>
    <div class="text-caption text-grey-6 q-mt-sm text-center purpose-desc">
      <div><strong>목적</strong> 래스터 이미지 보기·편집·리사이즈·필터</div>
      <div class="q-mt-xs"><strong>포맷</strong> JPG, PNG, GIF, WebP, BMP, SVG 등</div>
    </div>
  </div>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.nexia-placeholder-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 0;

  .placeholder-icon {
    opacity: 0.4;
    margin-bottom: 16px;
  }
  .purpose-desc {
    max-width: 240px;
    line-height: 1.5;
  }
}
</style>
