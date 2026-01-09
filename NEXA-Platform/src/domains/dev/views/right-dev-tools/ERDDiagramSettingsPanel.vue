<!-- ERDDiagramSettingsPanel.vue
  ERD 다이어그램 설정 패널
  슬라이더와 셀렉트를 적절히 혼합하여 구성
-->
<template>
  <div class="erd-diagram-settings-panel">
    <div class="panel-content q-pa-md">
      <!-- 노드 크기 설정 -->
      <div class="settings-section q-mb-md">
        <h4 class="section-title">노드 크기</h4>

        <div class="row items-center q-gutter-sm q-mb-sm">
          <div class="col-auto text-caption slider-label">노드 너비</div>
          <q-slider v-model.number="localSettings.nodeSize.width" :min="1" :max="400" :step="10" class="col" @update:model-value="handleSettingsChange" />
          <div class="col-auto text-caption text-weight-medium slider-value">{{ localSettings.nodeSize.width }}px</div>
        </div>

        <div class="row items-center q-gutter-sm">
          <div class="col-auto text-caption slider-label">노드 높이</div>
          <q-slider v-model.number="localSettings.nodeSize.height" :min="1" :max="400" :step="5" class="col" @update:model-value="handleSettingsChange" />
          <div class="col-auto text-caption text-weight-medium slider-value">{{ localSettings.nodeSize.height }}px</div>
        </div>
      </div>

      <!-- 레이아웃 간격 설정 -->
      <div class="settings-section">
        <h4 class="section-title">레이아웃 간격</h4>

        <!-- 노드 간격 (슬라이더) -->
        <div class="q-mb-md">
          <div class="row items-center q-gutter-sm">
            <div class="col-auto text-caption slider-label">노드 간격 (nodesep)</div>
            <q-slider v-model.number="localSettings.layout.nodesep" :min="50" :max="500" :step="10" class="col" @update:model-value="handleSettingsChange" />
            <div class="col-auto text-caption text-weight-medium slider-value">{{ localSettings.layout.nodesep }}px</div>
          </div>
          <div class="hint-text">같은 레벨 내 노드 간 수평 최소 간격</div>
        </div>

        <!-- 레벨 간격 (슬라이더) -->
        <div class="q-mb-md">
          <div class="row items-center q-gutter-sm">
            <div class="col-auto text-caption slider-label">레벨 간격 (ranksep)</div>
            <q-slider v-model.number="localSettings.layout.ranksep" :min="50" :max="400" :step="10" class="col" @update:model-value="handleSettingsChange" />
            <div class="col-auto text-caption text-weight-medium slider-value">{{ localSettings.layout.ranksep }}px</div>
          </div>
          <div class="hint-text">서로 다른 레벨 간 수직 최소 간격</div>
        </div>

        <!-- 마진 X, Y (슬라이더) - 상하 배치 -->
        <div class="q-mb-md">
          <div class="row items-center q-gutter-sm q-mb-md">
            <div class="col-auto text-caption slider-label">마진 X</div>
            <q-slider v-model.number="localSettings.layout.marginx" :min="0" :max="300" :step="10" class="col margin-slider" @update:model-value="handleSettingsChange" />
            <div class="col-auto text-caption text-weight-medium slider-value">{{ localSettings.layout.marginx }}px</div>
          </div>
          <div class="row items-center q-gutter-sm">
            <div class="col-auto text-caption slider-label">마진 Y</div>
            <q-slider v-model.number="localSettings.layout.marginy" :min="0" :max="300" :step="10" class="col margin-slider" @update:model-value="handleSettingsChange" />
            <div class="col-auto text-caption text-weight-medium slider-value">{{ localSettings.layout.marginy }}px</div>
          </div>
        </div>

        <!-- 레이아웃 방향 (셀렉트) -->
        <div>
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
import { ref, watch } from 'vue'
import { loadERDSettings, updateERDSettings, resetERDSettings } from '@engines/diagram/config/diagramSettings.js'

// 레이아웃 방향 옵션
const rankdirOptions = [
  {
    label: '좌우 (LR)',
    value: 'LR',
    icon: 'swap_horiz',
    description: 'Left to Right',
  },
  {
    label: '상하 (TB)',
    value: 'TB',
    icon: 'swap_vert',
    description: 'Top to Bottom',
  },
  {
    label: '우좌 (RL)',
    value: 'RL',
    icon: 'swap_horiz',
    description: 'Right to Left',
  },
  {
    label: '하상 (BT)',
    value: 'BT',
    icon: 'swap_vert',
    description: 'Bottom to Top',
  },
]

// 로컬 설정 (실시간 반영용)
const localSettings = ref(loadERDSettings())

// 설정 변경 핸들러 (실시간 반영)
// 변경 타입을 감지하여 부분 업데이트 vs 전체 재렌더링 결정
// - nodeSize 변경: 위치 유지하며 크기만 업데이트 (점프 현상 방지)
// - layout 변경: 전체 재렌더링 필요
function handleSettingsChange() {
  // 변경된 설정 타입 감지
  const changedTypes = []
  const oldSettings = loadERDSettings()

  // 노드 크기 변경 감지 → 부분 업데이트로 처리 (위치 유지)
  if (localSettings.value.nodeSize?.width !== oldSettings.nodeSize?.width || localSettings.value.nodeSize?.height !== oldSettings.nodeSize?.height) {
    changedTypes.push('nodeSize')
  }

  // 레이아웃 변경 감지 → 전체 재렌더링 필요
  if (
    localSettings.value.layout?.nodesep !== oldSettings.layout?.nodesep ||
    localSettings.value.layout?.ranksep !== oldSettings.layout?.ranksep ||
    localSettings.value.layout?.marginx !== oldSettings.layout?.marginx ||
    localSettings.value.layout?.marginy !== oldSettings.layout?.marginy ||
    localSettings.value.layout?.rankdir !== oldSettings.layout?.rankdir
  ) {
    changedTypes.push('layout')
  }

  // 설정을 즉시 저장하고 캐시 업데이트 (실시간 반영을 위해)
  updateERDSettings(localSettings.value)

  // 전역 이벤트로 SchemaDiagram에 알림 (변경 타입 포함)
  // SchemaDiagram에서 changedTypes를 확인하여 적절한 업데이트 방식 선택
  window.dispatchEvent(
    new CustomEvent('erd-settings-changed', {
      detail: {
        settings: { ...localSettings.value },
        changedTypes: changedTypes,
      },
    }),
  )
}

// 저장 핸들러
function handleSave() {
  updateERDSettings(localSettings.value)
  // 저장 완료 이벤트
  window.dispatchEvent(
    new CustomEvent('erd-settings-saved', {
      detail: { settings: { ...localSettings.value } },
    }),
  )
}

// 초기화 핸들러
function handleReset() {
  resetERDSettings()
  localSettings.value = loadERDSettings()
  handleSettingsChange()
}

// 외부에서 설정이 변경되었을 때 동기화 (다른 곳에서 저장한 경우)
watch(
  () => loadERDSettings(),
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
.erd-diagram-settings-panel {
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

    .hint-text {
      font-size: 0.75rem;
      color: var(--nexa-text-hint);
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

  // 마진 슬라이더 크기 조정 (더 크게)
  .margin-slider {
    :deep(.q-slider__track-container) {
      height: 10px;
    }

    :deep(.q-slider__thumb) {
      width: 24px;
      height: 24px;
    }

    :deep(.q-slider__track) {
      height: 10px;
    }

    :deep(.q-slider__track-markers) {
      height: 10px;
    }
  }
}
</style>
