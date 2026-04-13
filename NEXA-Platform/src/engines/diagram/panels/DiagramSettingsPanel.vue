<!-- DiagramSettingsPanel.vue
  범용 다이어그램 설정 넥셋 베이스 컴포넌트
  타입에 따라 적절한 설정 컴포넌트를 동적으로 로드
-->
<template>
  <div class="diagram-settings-panel">
    <component v-if="settingsComponent" :is="settingsComponent" :settings="localSettings" :type="diagramType" @change="handleSettingsChange" @save="handleSave" @reset="handleReset" />
    <div v-else class="no-settings-message q-pa-md text-center">
      <q-icon name="info" size="48px" color="grey-7" class="q-mb-md" />
      <div class="text-body2 text-grey-7">지원하지 않는 다이어그램 타입입니다.</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import ERDSettingsPanel from './ERDSettingsPanel.vue'
import DependencyGraphSettingsPanel from './DependencyGraphSettingsPanel.vue'
import FileTreeSettingsPanel from './FileTreeSettingsPanel.vue'
import { loadDiagramSettings } from '../config/diagramSettings'

const props = defineProps({
  diagramType: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['settings-changed', 'settings-saved', 'settings-reset'])

// 타입별 설정 컴포넌트 매핑
const settingsComponent = computed(() => {
  const components = {
    erd: ERDSettingsPanel,
    dependency: DependencyGraphSettingsPanel,
    filetree: FileTreeSettingsPanel,
  }
  return components[props.diagramType] || null
})

// 로컬 설정 (초기값)
const localSettings = ref(loadDiagramSettings(props.diagramType) || {})

// 설정 변경 핸들러
function handleSettingsChange(settings, changedTypes = []) {
  localSettings.value = settings
  emit('settings-changed', { type: props.diagramType, settings, changedTypes })
}

// 저장 핸들러
function handleSave(settings) {
  localSettings.value = settings
  emit('settings-saved', { type: props.diagramType, settings })
}

// 초기화 핸들러
function handleReset() {
  localSettings.value = loadDiagramSettings(props.diagramType) || {}
  emit('settings-reset', { type: props.diagramType })
}

// 외부에서 설정이 변경되었을 때 동기화
watch(
  () => props.diagramType,
  (newType) => {
    localSettings.value = loadDiagramSettings(newType) || {}
  },
)

// 외부에서 설정이 변경되었을 때 동기화 (다른 곳에서 저장한 경우)
watch(
  () => loadDiagramSettings(props.diagramType),
  (newSettings) => {
    // 깊은 비교로 변경된 경우만 업데이트
    if (JSON.stringify(localSettings.value) !== JSON.stringify(newSettings)) {
      localSettings.value = newSettings
    }
  },
  { deep: true },
)
</script>

<style lang="scss" scoped>
.diagram-settings-panel {
  width: 100%;

  .no-settings-message {
    width: 100%;
  }
}
</style>
