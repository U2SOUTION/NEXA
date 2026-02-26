<template>
  <div class="ai-split-layout column">
    <header class="ai-split-header">
      <span class="ai-split-title">NEXA AI</span>
      <div class="ai-split-menu">
        <span class="menu-item">파일</span>
        <span class="menu-item">편집</span>
        <span class="menu-item">보기</span>
        <span class="menu-item">실행</span>
      </div>
      <div class="ai-split-actions">
        <q-btn flat dense round size="sm" :icon="leftVisible ? 'chevron_left' : 'chevron_right'" :title="leftVisible ? '좌측 숨기기' : '좌측 보이기'" @click="leftVisible = !leftVisible" />
        <q-btn flat dense round size="sm" :icon="centerVisible ? 'remove' : 'add'" :title="centerVisible ? '중앙 숨기기' : '중앙 보이기'" @click="centerVisible = !centerVisible" />
        <q-btn flat dense round size="sm" :icon="rightVisible ? 'chevron_right' : 'chevron_left'" :title="rightVisible ? '우측 숨기기' : '우측 보이기'" @click="rightVisible = !rightVisible" />
        <q-btn flat dense round size="sm" icon="restart_alt" title="레이아웃 초기화" @click="applyPreset('default')" />
      </div>
    </header>

    <q-splitter
      v-model="leftSplitModel"
      unit="%"
      :limits="leftVisible ? [15, 45] : [0, 0]"
      :horizontal="false"
      before-class="ai-splitter-pane"
      after-class="ai-splitter-pane"
      class="ai-split-main col"
    >
      <template #before>
        <div v-show="leftVisible" class="ai-split-area ai-split-left column">
          <q-tabs v-model="leftActiveIndex" dense align="justify" class="ai-area-tabs">
            <q-tab v-for="(pid, i) in leftPanelIds" :key="pid" :name="i" :label="PANEL_LABELS[pid] ?? pid" :icon="PANEL_ICONS[pid] ?? 'extension'" />
          </q-tabs>
          <q-tab-panels v-model="leftActiveIndex" animated class="col ai-area-panels">
            <q-tab-panel v-for="(pid, i) in leftPanelIds" :key="pid" :name="i" class="q-pa-none ai-tab-panel">
              <component :is="PANEL_COMPONENTS[pid]" v-bind="getPanelProps(pid)" />
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </template>
      <template #after>
        <q-splitter
          v-model="centerSplitModel"
          unit="%"
          :limits="centerRightLimits"
          :horizontal="false"
          before-class="ai-splitter-pane"
          after-class="ai-splitter-pane"
          class="col"
        >
          <template #before>
            <div v-show="centerVisible" class="ai-split-area ai-split-center column">
              <q-tabs v-model="centerActiveIndex" dense align="justify" class="ai-area-tabs">
                <q-tab v-for="(pid, i) in centerPanelIds" :key="pid" :name="i" :label="PANEL_LABELS[pid] ?? pid" :icon="PANEL_ICONS[pid] ?? 'extension'" />
              </q-tabs>
              <q-tab-panels v-model="centerActiveIndex" animated class="col ai-area-panels">
                <q-tab-panel v-for="(pid, i) in centerPanelIds" :key="pid" :name="i" class="q-pa-none ai-tab-panel">
                  <component :is="PANEL_COMPONENTS[pid]" v-bind="getPanelProps(pid)" />
                </q-tab-panel>
              </q-tab-panels>
            </div>
          </template>
          <template #after>
            <div v-show="rightVisible" class="ai-split-area ai-split-right column">
              <q-tabs v-model="rightActiveIndex" dense align="justify" class="ai-area-tabs">
                <q-tab v-for="(pid, i) in rightPanelIds" :key="pid" :name="i" :label="PANEL_LABELS[pid] ?? pid" :icon="PANEL_ICONS[pid] ?? 'extension'" />
              </q-tabs>
              <q-tab-panels v-model="rightActiveIndex" animated class="col ai-area-panels">
                <q-tab-panel v-for="(pid, i) in rightPanelIds" :key="pid" :name="i" class="q-pa-none ai-tab-panel">
                  <component :is="PANEL_COMPONENTS[pid]" v-bind="getPanelProps(pid)" />
                </q-tab-panel>
              </q-tab-panels>
            </div>
          </template>
        </q-splitter>
      </template>
    </q-splitter>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import {
  leftPanelIds,
  centerPanelIds,
  rightPanelIds,
  leftVisible,
  centerVisible,
  rightVisible,
  leftSize,
  centerSize,
  rightSize,
  leftActiveIndex,
  centerActiveIndex,
  rightActiveIndex,
  applyPreset,
} from '../../composables/useAiSplitLayout'
import { PANEL_LABELS, PANEL_ICONS, PANEL_COMPONENTS } from '../../config/aiPanelRegistry'

const props = defineProps({
  editorContent: { type: String, default: '' },
  codeContent: { type: String, default: '' },
})

const emit = defineEmits(['update:editorContent', 'update:codeContent'])

const leftSplitModel = computed({
  get: () => (leftVisible.value ? leftSize.value : 0),
  set: (v) => {
    if (leftVisible.value) leftSize.value = Math.max(0, Math.min(45, v))
  },
})

const remaining = computed(() => 100 - (leftVisible.value ? leftSize.value : 0))
const centerShare = computed(() => {
  if (!centerVisible.value) return 0
  if (!rightVisible.value) return 100
  const total = centerSize.value + rightSize.value
  return total > 0 ? (centerSize.value / total) * 100 : 50
})

const centerSplitModel = computed({
  get: () => centerShare.value,
  set: (v) => {
    const rem = remaining.value
    if (rem <= 0) return
    if (!rightVisible.value) {
      centerSize.value = rem
      rightSize.value = 0
      return
    }
    if (!centerVisible.value) {
      centerSize.value = 0
      rightSize.value = rem
      return
    }
    centerSize.value = (rem * v) / 100
    rightSize.value = (rem * (100 - v)) / 100
  },
})

const centerRightLimits = computed(() => {
  if (!centerVisible.value || !rightVisible.value) return [0, 0]
  return [25, 75]
})

function getPanelProps(panelId) {
  if (panelId === 'editor') return { modelValue: props.editorContent, 'onUpdate:modelValue': (v) => emit('update:editorContent', v) }
  if (panelId === 'code') return { modelValue: props.codeContent, 'onUpdate:modelValue': (v) => emit('update:codeContent', v) }
  return {}
}

watch(
  () => [leftVisible.value, centerVisible.value, rightVisible.value],
  () => {
    const rem = 100 - (leftVisible.value ? leftSize.value : 0)
    if (!centerVisible.value && rightVisible.value) {
      rightSize.value = rem
      centerSize.value = 0
    } else if (centerVisible.value && !rightVisible.value) {
      centerSize.value = rem
      rightSize.value = 0
    }
  },
  { immediate: true },
)
</script>

<style lang="scss" scoped>
.ai-split-layout {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.ai-split-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-bottom: 1px solid var(--nexa-border-color, #e0e0e0);
}

.ai-split-title {
  font-weight: 600;
  font-size: 0.95rem;
}

.ai-split-menu {
  display: flex;
  gap: 0.5rem;
}

.menu-item {
  font-size: 0.85rem;
  color: var(--nexa-text-secondary, #666);
  cursor: default;
}

.ai-split-actions {
  margin-left: auto;
  display: flex;
  gap: 0.25rem;
}

.ai-split-main {
  min-height: 0;
  flex: 1;
}

.ai-splitter-pane {
  height: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  align-items: stretch;
}

.ai-split-area {
  height: 100%;
  width: 100%;
  min-height: 0;
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  align-self: stretch;
}

.ai-area-tabs {
  flex-shrink: 0;
  width: 100%;
  min-width: 0;
}

/* deep 사용 이유: Quasar q-tabs 내부 content가 영역 전체 너비를 쓰도록, align=justify와 함께 동작 */
.ai-area-tabs :deep(.q-tabs__content),
.ai-area-tabs :deep(.q-tabs__container) {
  width: 100%;
}

.ai-area-panels {
  flex: 1 1 0;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.ai-tab-panel {
  height: 100%;
  width: 100%;
  flex: 1 1 0;
  min-height: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  align-self: stretch;

  > * {
    flex: 1 1 0;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
    align-self: stretch;
  }
}

/* deep 사용 이유: Quasar q-tab-panels 내부 .q-panel 래퍼가 영역을 꽉 채우도록, 전용 class 노출 불가 */
.ai-area-panels :deep(.q-panel),
.ai-area-panels :deep(.q-tab-panels__content) {
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
