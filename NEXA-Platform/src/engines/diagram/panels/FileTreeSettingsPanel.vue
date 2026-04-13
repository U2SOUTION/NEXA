<!-- FileTreeSettingsPanel.vue
  파일 트리 다이어그램 설정 넥셋
-->
<template>
  <div class="file-tree-settings-panel">
    <div class="panel-content q-pa-md">
      <!-- 노드 크기 설정 -->
      <div class="settings-section q-mb-md">
        <h4 class="section-title">노드 크기</h4>

        <div class="row items-center q-gutter-sm q-mb-sm">
          <div class="col-auto text-caption slider-label">노드 너비</div>
          <q-slider v-model.number="localSettings.nodeSize.width" :min="schema.nodeSize.width.min" :max="schema.nodeSize.width.max" :step="schema.nodeSize.width.step" class="col" @update:model-value="handleSettingsChange" />
          <div class="col-auto text-caption text-weight-medium slider-value">{{ localSettings.nodeSize.width }}px</div>
        </div>

        <div class="row items-center q-gutter-sm">
          <div class="col-auto text-caption slider-label">노드 높이</div>
          <q-slider v-model.number="localSettings.nodeSize.height" :min="schema.nodeSize.height.min" :max="schema.nodeSize.height.max" :step="schema.nodeSize.height.step" class="col" @update:model-value="handleSettingsChange" />
          <div class="col-auto text-caption text-weight-medium slider-value">{{ localSettings.nodeSize.height }}px</div>
        </div>
      </div>

      <!-- 레이아웃 설정 -->
      <div class="settings-section q-mb-md">
        <h4 class="section-title">레이아웃</h4>

        <!-- 트리 방향 -->
        <div class="q-mb-md">
          <div class="subsection-title">트리 방향</div>
          <q-select v-model="localSettings.layout.orientation" :options="orientationOptions" dense outlined emit-value map-options @update:model-value="handleSettingsChange" />
        </div>

        <!-- 노드 간격 -->
        <div class="row items-center q-gutter-sm q-mb-sm">
          <div class="col-auto text-caption slider-label">노드 간격</div>
          <q-slider v-model.number="localSettings.layout.nodesep" :min="schema.layout.nodesep.min" :max="schema.layout.nodesep.max" :step="schema.layout.nodesep.step" class="col" @update:model-value="handleSettingsChange" />
          <div class="col-auto text-caption text-weight-medium slider-value">{{ localSettings.layout.nodesep }}px</div>
        </div>

        <!-- 레벨 간격 -->
        <div class="row items-center q-gutter-sm">
          <div class="col-auto text-caption slider-label">레벨 간격</div>
          <q-slider v-model.number="localSettings.layout.ranksep" :min="schema.layout.ranksep.min" :max="schema.layout.ranksep.max" :step="schema.layout.ranksep.step" class="col" @update:model-value="handleSettingsChange" />
          <div class="col-auto text-caption text-weight-medium slider-value">{{ localSettings.layout.ranksep }}px</div>
        </div>
      </div>

      <!-- 파일 트리 전용 설정 -->
      <div class="settings-section">
        <h4 class="section-title">파일 트리 옵션</h4>

        <!-- 파일 아이콘 표시 -->
        <div class="q-mb-md">
          <q-checkbox v-model="localSettings.showFileIcons" label="파일 아이콘 표시" @update:model-value="handleSettingsChange" />
        </div>

        <!-- 초기 확장 레벨 -->
        <div class="q-mb-md">
          <div class="subsection-title">초기 확장 레벨</div>
          <q-input v-model.number="localSettings.expandLevel" type="number" :min="schema.expandLevel.min" :max="schema.expandLevel.max" dense outlined hint="0 = 모두 닫힘, -1 = 모두 열림" @update:model-value="handleSettingsChange" />
        </div>
      </div>

      <q-separator class="q-my-md" />

      <!-- 액션 버튼 -->
      <div class="action-buttons">
        <q-btn flat label="초기화" icon="refresh" @click="handleReset" />
        <q-space />
        <q-btn flat label="저장" icon="save" class="save-btn" @click="handleSave" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { loadDiagramSettings, updateDiagramSettings, resetDiagramSettings } from '../config/diagramSettings'
import { diagramSettingsSchemas } from '../config/diagramSettingsConfig'

const props = defineProps({
  settings: {
    type: Object,
    default: () => ({}),
  },
  type: {
    type: String,
    default: 'filetree',
  },
})

const emit = defineEmits(['change', 'save', 'reset'])

// 스키마 가져오기
const schema = computed(() => diagramSettingsSchemas[props.type] || diagramSettingsSchemas.filetree)

// 트리 방향 옵션
const orientationOptions = [
  { label: '상하', value: 'vertical' },
  { label: '좌우', value: 'horizontal' },
]

// 로컬 설정
const localSettings = ref(props.settings && Object.keys(props.settings).length > 0 ? props.settings : loadDiagramSettings(props.type))

// props.settings 동기화
watch(
  () => props.settings,
  (newSettings) => {
    if (newSettings && Object.keys(newSettings).length > 0) {
      localSettings.value = { ...newSettings }
    }
  },
  { deep: true, immediate: true },
)

// 설정 변경 핸들러
function handleSettingsChange() {
  const changedTypes = []
  const oldSettings = loadDiagramSettings(props.type)

  if (localSettings.value.nodeSize?.width !== oldSettings.nodeSize?.width || localSettings.value.nodeSize?.height !== oldSettings.nodeSize?.height) {
    changedTypes.push('nodeSize')
  }
  if (localSettings.value.layout?.orientation !== oldSettings.layout?.orientation || localSettings.value.layout?.nodesep !== oldSettings.layout?.nodesep || localSettings.value.layout?.ranksep !== oldSettings.layout?.ranksep) {
    changedTypes.push('layout')
  }
  if (localSettings.value.showFileIcons !== oldSettings.showFileIcons || localSettings.value.expandLevel !== oldSettings.expandLevel) {
    changedTypes.push('theme')
  }

  updateDiagramSettings(props.type, localSettings.value)
  emit('change', { ...localSettings.value }, changedTypes)
}

// 저장 핸들러
function handleSave() {
  updateDiagramSettings(props.type, localSettings.value)
  emit('save', { ...localSettings.value })
}

// 초기화 핸들러
function handleReset() {
  resetDiagramSettings(props.type)
  localSettings.value = loadDiagramSettings(props.type)
  handleSettingsChange()
  emit('reset')
}

// 외부 동기화
watch(
  () => loadDiagramSettings(props.type),
  (newSettings) => {
    if (JSON.stringify(localSettings.value) !== JSON.stringify(newSettings)) {
      localSettings.value = newSettings
    }
  },
  { deep: true },
)
</script>

<style lang="scss" scoped>
.file-tree-settings-panel {
  width: 100%;

  .panel-content {
    width: 100%;
  }

  .section-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--nexa-text-primary);
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--nexa-border-color);
  }

  .subsection-title {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--nexa-text-secondary);
    margin-bottom: 0.5rem;
  }

  .settings-section {
    .text-caption {
      font-size: 0.8rem;
      color: var(--nexa-text-secondary);
    }

    .slider-label {
      min-width: 50px;
      font-size: 0.8rem;
      color: var(--nexa-text-secondary);
    }

    .slider-value {
      min-width: 40px;
      text-align: right;
      font-size: 0.85rem;
      color: var(--nexa-text-primary);
      font-weight: 500;
    }
  }

  .action-buttons {
    display: flex;
    align-items: center;
    padding-top: 0.5rem;

    .q-btn {
      color: var(--nexa-text-secondary);

      &:hover {
        color: var(--nexa-text-primary);
        background-color: var(--nexa-surface-hover);
      }
    }

    .save-btn {
      color: var(--nexa-primary);

      &:hover {
        color: var(--nexa-primary);
        background-color: var(--nexa-button-primary-bg);
        opacity: 0.9;
      }
    }
  }
}
</style>
