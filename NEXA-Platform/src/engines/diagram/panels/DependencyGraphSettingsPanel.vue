<!-- DependencyGraphSettingsPanel.vue
  의존성 그래프 다이어그램 설정 넥셋
-->
<template>
  <div class="dependency-graph-settings-panel">
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

      <!-- 레이아웃 간격 설정 (hierarchical 그래프만 표시) -->
      <div v-if="schema.layout?.nodesep && schema.layout?.ranksep" class="settings-section q-mb-md">
        <h4 class="section-title">레이아웃 간격</h4>

        <div class="row items-center q-gutter-sm q-mb-sm">
          <div class="col-auto text-caption slider-label">노드 간격</div>
          <q-slider v-model.number="localSettings.layout.nodesep" :min="schema.layout.nodesep.min" :max="schema.layout.nodesep.max" :step="schema.layout.nodesep.step" class="col" @update:model-value="handleSettingsChange" />
          <div class="col-auto text-caption text-weight-medium slider-value">{{ localSettings.layout.nodesep }}px</div>
        </div>

        <div class="row items-center q-gutter-sm">
          <div class="col-auto text-caption slider-label">레벨 간격</div>
          <q-slider v-model.number="localSettings.layout.ranksep" :min="schema.layout.ranksep.min" :max="schema.layout.ranksep.max" :step="schema.layout.ranksep.step" class="col" @update:model-value="handleSettingsChange" />
          <div class="col-auto text-caption text-weight-medium slider-value">{{ localSettings.layout.ranksep }}px</div>
        </div>

        <!-- 레이아웃 방향 (hierarchical 그래프만 표시) -->
        <div v-if="schema.layout?.rankdir" class="q-mt-md">
          <div class="subsection-title">레이아웃 방향</div>
          <q-select v-model="localSettings.layout.rankdir" :options="rankdirOptions" dense outlined emit-value map-options @update:model-value="handleSettingsChange">
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-icon :name="scope.opt.icon" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
      </div>

      <!-- Force 시뮬레이션 설정 (force-directed 그래프만 표시) -->
      <div v-if="schema.layout?.force" class="settings-section q-mb-md">
        <h4 class="section-title">Force 시뮬레이션</h4>

        <div class="row items-center q-gutter-sm q-mb-sm">
          <div class="col-auto text-caption slider-label">반발력</div>
          <q-slider v-model.number="localSettings.layout.force.charge" :min="schema.layout.force.charge.min" :max="schema.layout.force.charge.max" :step="schema.layout.force.charge.step" class="col" @update:model-value="handleSettingsChange" />
          <div class="col-auto text-caption text-weight-medium slider-value">{{ localSettings.layout.force.charge }}</div>
        </div>

        <div class="row items-center q-gutter-sm q-mb-sm">
          <div class="col-auto text-caption slider-label">링크 거리</div>
          <q-slider v-model.number="localSettings.layout.force.linkDistance" :min="schema.layout.force.linkDistance.min" :max="schema.layout.force.linkDistance.max" :step="schema.layout.force.linkDistance.step" class="col" @update:model-value="handleSettingsChange" />
          <div class="col-auto text-caption text-weight-medium slider-value">{{ localSettings.layout.force.linkDistance }}px</div>
        </div>

        <div class="row items-center q-gutter-sm q-mb-sm">
          <div class="col-auto text-caption slider-label">링크 강도</div>
          <q-slider v-model.number="localSettings.layout.force.linkStrength" :min="schema.layout.force.linkStrength.min" :max="schema.layout.force.linkStrength.max" :step="schema.layout.force.linkStrength.step" class="col" @update:model-value="handleSettingsChange" />
          <div class="col-auto text-caption text-weight-medium slider-value">{{ localSettings.layout.force.linkStrength }}</div>
        </div>

        <div class="row items-center q-gutter-sm">
          <div class="col-auto text-caption slider-label">충돌 거리</div>
          <q-slider v-model.number="localSettings.layout.force.collision" :min="schema.layout.force.collision.min" :max="schema.layout.force.collision.max" :step="schema.layout.force.collision.step" class="col" @update:model-value="handleSettingsChange" />
          <div class="col-auto text-caption text-weight-medium slider-value">{{ localSettings.layout.force.collision }}px</div>
        </div>
      </div>

      <!-- 의존성 그래프 전용 설정 -->
      <div class="settings-section">
        <h4 class="section-title">의존성 그래프 옵션</h4>

        <!-- 엣지 스타일 -->
        <div class="q-mb-md">
          <div class="subsection-title">엣지 스타일</div>
          <q-select v-model="localSettings.edgeStyle" :options="edgeStyleOptions" dense outlined emit-value map-options @update:model-value="handleSettingsChange" />
        </div>

        <!-- 노드 라벨 표시 -->
        <div class="q-mb-md">
          <q-checkbox v-model="localSettings.showLabels" label="노드 라벨 표시" @update:model-value="handleSettingsChange" />
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
    default: 'dependency',
  },
})

const emit = defineEmits(['change', 'save', 'reset'])

// 스키마 가져오기
const schema = computed(() => diagramSettingsSchemas[props.type] || diagramSettingsSchemas.dependency)

// 레이아웃 방향 옵션
const rankdirOptions = [
  { label: '좌우 (LR)', value: 'LR', icon: 'swap_horiz', description: 'Left to Right' },
  { label: '상하 (TB)', value: 'TB', icon: 'swap_vert', description: 'Top to Bottom' },
  { label: '우좌 (RL)', value: 'RL', icon: 'swap_horiz', description: 'Right to Left' },
  { label: '하상 (BT)', value: 'BT', icon: 'swap_vert', description: 'Bottom to Top' },
]

// 엣지 스타일 옵션
const edgeStyleOptions = [
  { label: '직선', value: 'straight' },
  { label: '곡선', value: 'curved' },
  { label: '베지어', value: 'bezier' },
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

  // hierarchical 그래프 설정 (nodesep, ranksep, rankdir)
  if (schema.value.layout?.nodesep) {
    if (localSettings.value.layout?.nodesep !== oldSettings.layout?.nodesep || localSettings.value.layout?.ranksep !== oldSettings.layout?.ranksep || localSettings.value.layout?.rankdir !== oldSettings.layout?.rankdir) {
      changedTypes.push('layout')
    }
  }

  // force-directed 그래프 설정 (force 파라미터)
  if (schema.value.layout?.force) {
    const oldForce = oldSettings.layout?.force || {}
    const newForce = localSettings.value.layout?.force || {}
    if (newForce.charge !== oldForce.charge || newForce.linkDistance !== oldForce.linkDistance || newForce.linkStrength !== oldForce.linkStrength || newForce.collision !== oldForce.collision) {
      changedTypes.push('layout')
    }
  }

  if (localSettings.value.edgeStyle !== oldSettings.edgeStyle || localSettings.value.showLabels !== oldSettings.showLabels) {
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
.dependency-graph-settings-panel {
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
