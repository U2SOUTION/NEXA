<template>
  <div class="ai-split-layout column">
    <header class="ai-split-header">
      <span class="ai-split-title">NEXA AI</span>
      <div class="ai-split-menu">
        <q-btn-dropdown flat dense no-caps no-wrap class="menu-dropdown" label="파일" icon="folder_open">
          <q-list dense style="min-width: 160px">
            <q-item clickable v-close-popup>
              <q-item-section avatar><q-icon name="add_comment" size="xs" /></q-item-section>
              <q-item-section>새 채팅</q-item-section>
            </q-item>
            <q-item clickable v-close-popup>
              <q-item-section avatar><q-icon name="note_add" size="xs" /></q-item-section>
              <q-item-section>새 문서</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup>
              <q-item-section avatar><q-icon name="folder_open" size="xs" /></q-item-section>
              <q-item-section>열기</q-item-section>
            </q-item>
            <q-item clickable v-close-popup>
              <q-item-section avatar><q-icon name="save" size="xs" /></q-item-section>
              <q-item-section>저장</q-item-section>
            </q-item>
            <q-item clickable v-close-popup>
              <q-item-section avatar><q-icon name="upload" size="xs" /></q-item-section>
              <q-item-section>내보내기</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn-dropdown flat dense no-caps no-wrap class="menu-dropdown" label="편집" icon="edit">
          <q-list dense style="min-width: 160px">
            <q-item clickable v-close-popup>
              <q-item-section avatar><q-icon name="undo" size="xs" /></q-item-section>
              <q-item-section>실행 취소</q-item-section>
            </q-item>
            <q-item clickable v-close-popup>
              <q-item-section avatar><q-icon name="redo" size="xs" /></q-item-section>
              <q-item-section>다시 실행</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup>
              <q-item-section avatar><q-icon name="content_cut" size="xs" /></q-item-section>
              <q-item-section>잘라내기</q-item-section>
            </q-item>
            <q-item clickable v-close-popup>
              <q-item-section avatar><q-icon name="content_copy" size="xs" /></q-item-section>
              <q-item-section>복사</q-item-section>
            </q-item>
            <q-item clickable v-close-popup>
              <q-item-section avatar><q-icon name="content_paste" size="xs" /></q-item-section>
              <q-item-section>붙여넣기</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup>
              <q-item-section avatar><q-icon name="search" size="xs" /></q-item-section>
              <q-item-section>찾기</q-item-section>
            </q-item>
            <q-item clickable v-close-popup>
              <q-item-section avatar><q-icon name="find_replace" size="xs" /></q-item-section>
              <q-item-section>바꾸기</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn-dropdown flat dense no-caps no-wrap class="menu-dropdown" label="미리보기" icon="visibility">
          <q-list dense style="min-width: 180px">
            <q-item clickable v-close-popup>
              <q-item-section avatar><q-icon name="preview" size="xs" /></q-item-section>
              <q-item-section>프리뷰 모드</q-item-section>
            </q-item>
            <q-item clickable v-close-popup>
              <q-item-section avatar><q-icon name="code" size="xs" /></q-item-section>
              <q-item-section>소스/미리보기 전환</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn-dropdown flat dense no-caps no-wrap class="menu-dropdown" label="화면구성" icon="dashboard_customize">
          <q-list dense style="min-width: 180px">
            <q-item clickable v-close-popup @click="leftVisible = !leftVisible">
              <q-item-section avatar>
                <q-icon :name="leftVisible ? 'visibility' : 'visibility_off'" size="xs" />
              </q-item-section>
              <q-item-section>좌측 영역 표시/숨김</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="centerVisible = !centerVisible">
              <q-item-section avatar>
                <q-icon :name="centerVisible ? 'visibility' : 'visibility_off'" size="xs" />
              </q-item-section>
              <q-item-section>중앙 영역 표시/숨김</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="rightVisible = !rightVisible">
              <q-item-section avatar>
                <q-icon :name="rightVisible ? 'visibility' : 'visibility_off'" size="xs" />
              </q-item-section>
              <q-item-section>우측 영역 표시/숨김</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="applyPreset('default')">
              <q-item-section avatar><q-icon name="view_agenda" size="xs" /></q-item-section>
              <q-item-section>기본 레이아웃</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="applyPreset('code')">
              <q-item-section avatar><q-icon name="code" size="xs" /></q-item-section>
              <q-item-section>코드 중심 레이아웃</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="resetSplitSizes()">
              <q-item-section avatar><q-icon name="restart_alt" size="xs" /></q-item-section>
              <q-item-section>비율 초기화</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn-dropdown flat dense no-caps no-wrap class="menu-dropdown" label="실행" icon="play_arrow">
          <q-list dense style="min-width: 140px">
            <q-item clickable v-close-popup>
              <q-item-section avatar><q-icon name="play_arrow" size="xs" /></q-item-section>
              <q-item-section>실행</q-item-section>
            </q-item>
            <q-item clickable v-close-popup>
              <q-item-section avatar><q-icon name="bug_report" size="xs" /></q-item-section>
              <q-item-section>디버그</q-item-section>
            </q-item>
            <q-item clickable v-close-popup>
              <q-item-section avatar><q-icon name="stop" size="xs" /></q-item-section>
              <q-item-section>중단</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
      <div class="ai-split-actions">
        <q-btn flat dense round size="sm" :icon="leftVisible ? 'chevron_left' : 'chevron_right'" :title="leftVisible ? '좌측 숨기기' : '좌측 보이기'" @click="leftVisible = !leftVisible" />
        <q-btn flat dense round size="sm" :icon="centerVisible ? 'remove' : 'add'" :title="centerVisible ? '중앙 숨기기' : '중앙 보이기'" @click="centerVisible = !centerVisible" />
        <q-btn flat dense round size="sm" :icon="rightVisible ? 'chevron_right' : 'chevron_left'" :title="rightVisible ? '우측 숨기기' : '우측 보이기'" @click="rightVisible = !rightVisible" />
        <q-btn flat dense round size="sm" icon="restart_alt" title="레이아웃 초기화" @click="applyPreset('default')" />
      </div>
    </header>

    <!-- 구조: left | (center|right). 1번 splitter로 right를 함께 밀 수 있음 -->
    <q-splitter v-model="leftSplitModel" unit="%" :limits="leftVisible ? [SPLIT_LIMITS.minPct, SPLIT_LIMITS.maxPct] : [0, 0]" :horizontal="false" before-class="ai-splitter-pane" after-class="ai-splitter-pane" class="ai-split-main col">
      <template #before>
        <div v-show="leftVisible" class="ai-split-area ai-split-left column">
          <draggable v-model="leftPanelIdsModel" :item-key="(pid) => pid" tag="div" class="ai-area-tabs ai-tabs-draggable row no-wrap items-center" @end="onLeftSortEnd">
            <template #item="{ element: pid }">
              <div class="ai-draggable-tab" :class="{ 'q-tab--active': leftPanelIds.indexOf(pid) === leftActiveIndex }" @click="leftActiveIndex = leftPanelIds.indexOf(pid)">
                <q-icon :name="PANEL_ICONS[pid] ?? 'extension'" size="xs" />
                <span class="q-tab__label">{{ PANEL_LABELS[pid] ?? pid }}</span>
              </div>
            </template>
          </draggable>
          <q-tab-panels v-model="leftActiveIndex" animated class="col ai-area-panels">
            <q-tab-panel v-for="(pid, i) in leftPanelIds" :key="pid" :name="i" class="q-pa-none ai-tab-panel">
              <component :is="PANEL_COMPONENTS[pid]" v-bind="getPanelProps(pid)" />
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </template>
      <template #after>
        <q-splitter v-model="centerSplitModel" unit="%" :limits="centerRightLimits" :horizontal="false" before-class="ai-splitter-pane" after-class="ai-splitter-pane" class="col">
          <template #before>
            <div v-show="centerVisible" class="ai-split-area ai-split-center column">
              <draggable v-model="centerPanelIdsModel" :item-key="(pid) => pid" tag="div" class="ai-area-tabs ai-tabs-draggable row no-wrap items-center" @end="onCenterSortEnd">
                <template #item="{ element: pid }">
                  <div class="ai-draggable-tab" :class="{ 'q-tab--active': centerPanelIds.indexOf(pid) === centerActiveIndex }" @click="centerActiveIndex = centerPanelIds.indexOf(pid)">
                    <q-icon :name="PANEL_ICONS[pid] ?? 'extension'" size="xs" />
                    <span class="q-tab__label">{{ PANEL_LABELS[pid] ?? pid }}</span>
                  </div>
                </template>
              </draggable>
              <q-tab-panels v-model="centerActiveIndex" animated class="col ai-area-panels">
                <q-tab-panel v-for="(pid, i) in centerPanelIds" :key="pid" :name="i" class="q-pa-none ai-tab-panel">
                  <component :is="PANEL_COMPONENTS[pid]" v-bind="getPanelProps(pid)" />
                </q-tab-panel>
              </q-tab-panels>
            </div>
          </template>
          <template #after>
            <div v-show="rightVisible" class="ai-split-area ai-split-right column">
              <draggable v-model="rightPanelIdsModel" :item-key="(pid) => pid" tag="div" class="ai-area-tabs ai-tabs-draggable row no-wrap items-center" @end="onRightSortEnd">
                <template #item="{ element: pid }">
                  <div class="ai-draggable-tab" :class="{ 'q-tab--active': rightPanelIds.indexOf(pid) === rightActiveIndex }" @click="rightActiveIndex = rightPanelIds.indexOf(pid)">
                    <q-icon :name="PANEL_ICONS[pid] ?? 'extension'" size="xs" />
                    <span class="q-tab__label">{{ PANEL_LABELS[pid] ?? pid }}</span>
                  </div>
                </template>
              </draggable>
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
import draggable from 'vuedraggable'
import { leftPanelIds, centerPanelIds, rightPanelIds, leftVisible, centerVisible, rightVisible, leftSize, centerSize, rightSize, leftActiveIndex, centerActiveIndex, rightActiveIndex, applyPreset, resetSplitSizes, SPLIT_LIMITS } from '../../composables/useAiSplitLayout'
import { PANEL_LABELS, PANEL_ICONS, PANEL_COMPONENTS } from '../../config/aiPanelRegistry'

const leftPanelIdsModel = computed({
  get: () => leftPanelIds.value,
  set: (v) => {
    leftPanelIds.value = v
  },
})
const centerPanelIdsModel = computed({
  get: () => centerPanelIds.value,
  set: (v) => {
    centerPanelIds.value = v
  },
})
const rightPanelIdsModel = computed({
  get: () => rightPanelIds.value,
  set: (v) => {
    rightPanelIds.value = v
  },
})

function onLeftSortEnd(evt) {
  if (evt.oldIndex !== evt.newIndex) {
    fixActiveIndexAfterSort('left', evt.oldIndex, evt.newIndex)
  }
}
function onCenterSortEnd(evt) {
  if (evt.oldIndex !== evt.newIndex) {
    fixActiveIndexAfterSort('center', evt.oldIndex, evt.newIndex)
  }
}
function onRightSortEnd(evt) {
  if (evt.oldIndex !== evt.newIndex) {
    fixActiveIndexAfterSort('right', evt.oldIndex, evt.newIndex)
  }
}

/** vuedraggable가 배열을 이미 재정렬했으므로 activeIndex만 보정 */
function fixActiveIndexAfterSort(area, fromIndex, toIndex) {
  const active = area === 'left' ? leftActiveIndex : area === 'center' ? centerActiveIndex : rightActiveIndex
  let newActive = active.value
  if (active.value === fromIndex) newActive = toIndex
  else if (fromIndex < active.value && toIndex >= active.value) newActive = active.value - 1
  else if (fromIndex > active.value && toIndex <= active.value) newActive = active.value + 1
  active.value = newActive
}

const props = defineProps({
  editorContent: { type: String, default: '' },
  codeContent: { type: String, default: '' },
  codeLanguage: { type: String, default: 'javascript' },
})

const emit = defineEmits(['update:editorContent', 'update:codeContent'])

const leftSplitModel = computed({
  get: () => (leftVisible.value ? leftSize.value : 0),
  set: (v) => {
    if (leftVisible.value) leftSize.value = Math.max(SPLIT_LIMITS.minPct, Math.min(SPLIT_LIMITS.maxPct, v))
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
  const rem = remaining.value
  if (rem <= 0) return [50, 50]
  const minCenterOfRemaining = (SPLIT_LIMITS.minPct * 100) / rem
  const maxCenterOfRemaining = 100 - (SPLIT_LIMITS.minPct * 100) / rem
  const minC = Math.ceil(Math.max(SPLIT_LIMITS.minPct, minCenterOfRemaining))
  const maxC = Math.floor(Math.min(SPLIT_LIMITS.maxPct, maxCenterOfRemaining))
  if (minC > maxC) return [50, 50]
  return [minC, maxC]
})

function getPanelProps(panelId) {
  if (panelId === 'editor') return { modelValue: props.editorContent, 'onUpdate:modelValue': (v) => emit('update:editorContent', v) }
  if (panelId === 'code')
    return {
      modelValue: props.codeContent,
      'onUpdate:modelValue': (v) => emit('update:codeContent', v),
      language: props.codeLanguage,
    }
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

watch(remaining, (rem) => {
  if (!centerVisible.value || !rightVisible.value || rem <= 0) return
  const [minC, maxC] = centerRightLimits.value
  const share = centerShare.value
  if (share < minC || share > maxC) {
    const clamped = Math.max(minC, Math.min(maxC, share))
    centerSize.value = (rem * clamped) / 100
    rightSize.value = (rem * (100 - clamped)) / 100
  }
})
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

.menu-dropdown {
  font-size: 0.85rem;
  color: var(--nexa-text-secondary, #666);
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

/* 스플릿 구분선: nexa-secondary 테마 색상 */
.ai-split-layout :deep(.q-splitter__separator),
.ai-split-layout :deep(.q-splitter__separator-area) {
  background-color: var(--nexa-secondary);
  opacity: 0.2;
}
.ai-split-layout :deep(.q-splitter__separator-area) {
  opacity: 0.08;
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

.ai-tabs-draggable {
  gap: 0.25rem;
}

.ai-draggable-tab {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.6rem;
  cursor: pointer;
  user-select: none;
  border-radius: 4px;
  transition:
    background 0.15s ease,
    opacity 0.15s ease,
    transform 0.15s ease,
    box-shadow 0.15s ease,
    outline 0.1s ease;
  flex: 1;
  min-width: 0;
  justify-content: center;
}
.ai-draggable-tab:hover {
  background: rgba(0, 0, 0, 0.05);
}
.ai-draggable-tab.q-tab--active {
  color: var(--q-primary);
  font-weight: 500;
}
.ai-draggable-tab.q-tab--active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: currentColor;
  border-radius: 2px 2px 0 0;
}
.ai-draggable-tab {
  position: relative;
}
.ai-draggable-tab[draggable='true'] {
  cursor: grab;
}
.ai-draggable-tab:active {
  cursor: grabbing;
}

/* 드래그 중 피드백: 반투명 + 그림자 */
.ai-draggable-tab--dragging {
  opacity: 0.5;
  transform: scale(0.96);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 10;
  pointer-events: none;
}

/* 드롭 대상 피드백: 테두리 + 배경 강조 */
.ai-draggable-tab--drop-target {
  background: rgba(25, 118, 210, 0.15) !important;
  outline: 2px solid var(--q-primary, #1976d2);
  outline-offset: 2px;
  border-radius: 6px;
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
  min-width: 0;
  overflow: hidden;
}
</style>
