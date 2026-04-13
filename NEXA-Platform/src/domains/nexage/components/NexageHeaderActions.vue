<!--
 NexageHeaderActions.vue
 넥사보드 메인 헤더 액션 컴포넌트 (현제 보드에만 적용, 차후 각 도메인에서 액션 버튼 또는 메세지 주입)
-->

<template>
  <div class="row items-center no-wrap q-gutter-xs">
    <q-btn flat dense icon="add_box" :label="showLabels ? '넥사패널 추가' : undefined" :disable="!canAddPanel" class="main-header-action" @click="$emit('add-panel')">
      <q-tooltip>선택된 창에 넥사패널 추가</q-tooltip>
    </q-btn>
    <q-btn flat dense icon="view_quilt" :label="showLabels ? '보드창 선택' : undefined" class="main-header-action" @click="$emit('open-window-preset')">
      <q-tooltip>창 변경</q-tooltip>
    </q-btn>
  </div>
</template>

<script setup>
defineProps({
  showLabels: {
    type: Boolean,
    default: false,
  },
  canAddPanel: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['add-panel', 'open-window-preset'])
</script>
