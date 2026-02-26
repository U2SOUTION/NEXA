<template>
  <div class="preset-selector">
    <WindowPresetCard v-for="preset in presets" :key="preset" :preset="preset" :active="mode === 'setup' ? false : activePreset === preset" :selected="tempSelectedPreset === preset" @select="handleSelect" />
  </div>
</template>

<script setup>
import { useBoardPreset } from '@system/composables/useBoardPreset'
import WindowPresetCard from '@domains/board/components/window/WindowPresetCard.vue'

const props = defineProps({
  mode: { type: String, default: 'select' },
  selectionMode: { type: String, default: 'immediate' }, // 'immediate' | 'confirm'
})

const emit = defineEmits(['select', 'confirm'])

const { presets, activePreset, tempSelectedPreset, selectPreset } = useBoardPreset(props.mode)

function handleSelect(preset) {
  if (props.selectionMode === 'immediate') {
    selectPreset(preset, { immediate: true, save: true })
  } else {
    selectPreset(preset, { immediate: false })
  }
  emit('select', preset)
}
</script>

<style lang="scss" scoped>
.preset-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  width: 100%;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

// 그리드 아이템이 겹치지 않도록 보장
.preset-selector > * {
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
}
</style>
