<template>
  <div class="preset-setup-view">
    <div class="setup-header">
      <div class="text-subtitle1 q-mb-sm">
        <q-icon name="dashboard_customize" size="22px" class="q-mr-xs" color="primary" />
        NEXA 보드 창 구성 선택
      </div>
      <p class="text-caption text-grey-7">아래에서 보드 대시보드의 기본 레이아웃을 선택하세요. 이 설정은 나중에 변경할 수 있습니다.</p>
    </div>

    <WindowPresetSelector mode="setup" selection-mode="confirm" @select="handleSelect" />
  </div>
</template>

<script setup>
import WindowPresetSelector from '@domains/board/components/window/WindowPresetSelector.vue'

const emit = defineEmits(['select'])

function handleSelect(preset) {
  emit('select', preset)
}
</script>

<style lang="scss" scoped>
.preset-setup-view {
  width: 100%;
}

.setup-header {
  margin-bottom: 24px;
}
</style>

