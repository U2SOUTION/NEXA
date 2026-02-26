<template>
  <q-dialog v-model="showModal" :maximized="$q.screen.lt.md" persistent>
    <q-card class="window-preset-modal" :style="modalCardStyle">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">NEXA 보드창 선택</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <WindowPresetSelector mode="edit" selection-mode="immediate" @select="handleSelect" />
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="취소" color="grey" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useDashboardLayoutStore } from '@system/store/dashboardLayoutStore'
import { useBoardPreset } from '@system/composables/useBoardPreset.js'
import WindowPresetSelector from '@domains/board/components/window/WindowPresetSelector.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const $q = useQuasar()
const dashboardLayoutStore = useDashboardLayoutStore()

const showModal = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// 반응형 모달 크기
const modalCardStyle = computed(() => {
  if ($q.screen.lt.md) {
    return { width: '100%', maxWidth: '100%' }
  } else if ($q.screen.lt.lg) {
    return { minWidth: '500px', maxWidth: '600px', width: '90vw' }
  } else {
    return { minWidth: '600px', maxWidth: '750px', width: '70vw' }
  }
})

const { selectPreset } = useBoardPreset('edit')

function handleSelect(preset) {
  selectPreset(preset, { immediate: true, save: true })
}

// 모달이 닫힐 때 변경사항 저장 (추가 보장)
watch(showModal, (isOpen) => {
  if (!isOpen && dashboardLayoutStore.selectedNodeForDashboard) {
    setTimeout(() => {
      dashboardLayoutStore.requestSaveLayout()
    }, 50)
  }
})
</script>

<style lang="scss" scoped>
.window-preset-modal {
  // 프리셋 그리드 레이아웃은 WindowPresetSelector에서 처리
}
</style>

