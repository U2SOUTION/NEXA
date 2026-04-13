<!-- NexetThemeColor.vue
  DevToolsPanel.vue에서 사용할 아코디언 넥셋 컴포넌트
  ThemeColorPanel.vue를 감싸는 래퍼
-->
<template>
  <q-expansion-item icon="palette" label="테마 색상" default-opened>
    <ThemeColorPanel :selected-color="selectedColor" :usage-count="usageCount" :usage-files="usageFiles" @file-clicked="$emit('fileClicked', $event)" @color-edit="$emit('colorEdit', $event)" />
  </q-expansion-item>
</template>

<script setup>
import ThemeColorPanel from 'src/domains/dev/views/right-dev-tools/ThemeColorPanel.vue'

defineProps({
  selectedColor: {
    type: Object,
    default: null,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  usageFiles: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['fileClicked', 'colorEdit'])
</script>

<style lang="scss" scoped>
// 아코디언 넥셋 스타일은 부모 컴포넌트에서 관리
</style>
