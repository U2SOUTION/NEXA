<template>
  <q-page style="height: calc(100vh - 50px - 48px)" class="bg-grey-10">
    <!-- 일반 (비중첩) 레이아웃 -->
    <splitpanes
      v-if="
        currentPresetConfig &&
        currentPresetConfig.panes.length > 0 &&
        !currentPresetConfig.panes.some((p) => p.isContainer)
      "
      :key="layoutStore.activePreset + '-root-normal'"
      class="default-theme"
      style="height: 100%"
      :horizontal="currentPresetConfig.horizontal"
      @resized="handleSplitterResized"
    >
      <pane
        v-for="paneConfig in currentPresetConfig.panes"
        :key="paneConfig.id"
        :id="paneConfig.id"
        :size="paneConfig.defaultSize"
        class="pane-container bg-grey-9"
        :class="{
          'is-selected-pane': layoutStore.selectedPaneId === paneConfig.id,
          'pane-drop-hover': false,
        }"
        @click.stop="layoutStore.setSelectedPaneId(paneConfig.id)"
        :ref="(el) => (paneRefs[paneConfig.id] = el)"
      >
        <q-btn
          v-if="layoutStore.selectedPaneId === paneConfig.id"
          flat
          dense
          round
          icon="more_horiz"
          size="md"
          text-color="accent"
          class="pane-menu-button"
          @click.stop
          @mouseenter="openMenu(paneConfig.id)"
          @mouseleave="scheduleMenuHide(paneConfig.id)"
        >
          <q-menu
            v-model="menuVisibility[paneConfig.id]"
            anchor="bottom right"
            self="top right"
            @mouseenter="cancelMenuHide(paneConfig.id)"
            @mouseleave="hideMenu(paneConfig.id)"
          >
            <q-list dense style="min-width: 150px">
              <q-item clickable v-close-popup @click="openAddNexaPanelDialog(paneConfig.id)">
                <q-item-section avatar style="min-width: 30px"
                  ><q-icon name="add_box" size="xs" />
                </q-item-section>
                <q-item-section>패널 추가</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="showFeatureNotReadyAlert('창 분할')">
                <q-item-section avatar style="min-width: 30px"
                  ><q-icon name="splitscreen" size="xs" />
                </q-item-section>
                <q-item-section>창 분할</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="showFeatureNotReadyAlert('창 병합')">
                <q-item-section avatar style="min-width: 30px"
                  ><q-icon name="merge_type" size="xs" />
                </q-item-section>
                <q-item-section>창 병합</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <grid-layout
          v-if="layoutStore.panes[paneConfig.id]"
          v-model:layout="layoutStore.panes[paneConfig.id]"
          :col-num="12"
          :row-height="30"
          :is-draggable="true"
          :is-resizable="true"
          :responsive="false"
          :vertical-compact="true"
          :use-css-transforms="true"
          class="grid-layout-container q-pa-xs"
          @layout-updated="(newLayout) => handleLayoutUpdate(newLayout)"
        >
          <grid-item
            v-for="panel in layoutStore.panes[paneConfig.id]"
            :key="panel.i"
            :x="panel.x"
            :y="panel.y"
            :w="panel.w"
            :h="panel.h"
            :i="panel.i"
            @resized="(i, newH, newW) => handleGridItemResized(paneConfig.id, i, newH, newW)"
            @moved="(i, newX, newY) => handleGridItemMoved(paneConfig.id, i, newX, newY)"
            @dragstart.stop="() => handleItemDragStart()"
            @dragmove.stop="() => handleItemDrag()"
            @dragend.stop="() => handleItemDragEnd()"
            class="grid-item-card"
          >
            <q-card flat class="full-height column no-wrap bg-custom-dark-card">
              <q-card-section
                class="bg-black text-grey-5 q-pa-xs row items-center no-wrap pane-nexa-panel-header"
              >
                <div class="text-caption col ellipsis q-pl-xs">{{ panel.title }}</div>
                <q-space />
                <q-btn flat dense round icon="more_vert" size="xs" @click.stop>
                  <q-menu auto-close anchor="bottom end" self="top end">
                    <q-list dense style="min-width: 150px">
                      <q-item clickable @click="requestMovePanelDialog(paneConfig.id, panel.id)">
                        <q-item-section avatar style="min-width: 30px"
                          ><q-icon name="open_with" size="xs"
                        /></q-item-section>
                        <q-item-section>다른 창으로 이동...</q-item-section>
                      </q-item>
                      <q-separator />
                      <q-item
                        clickable
                        @click="layoutStore.removePanelFromPane(paneConfig.id, panel.id)"
                      >
                        <q-item-section avatar style="min-width: 30px"
                          ><q-icon name="delete_outline" size="xs"
                        /></q-item-section>
                        <q-item-section>패널 닫기</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </q-card-section>
              <q-card-section class="col q-pa-sm text-grey-6 text-caption scroll">
                {{ panel.content }}
                <div class="text-grey-7 text-caption">ID: {{ panel.id }}</div>
              </q-card-section>
            </q-card>
          </grid-item>
        </grid-layout>
        <div
          v-if="!layoutStore.panes[paneConfig.id] || layoutStore.panes[paneConfig.id].length === 0"
          class="text-grey-7 q-pa-md text-center flex flex-center full-height"
        >
          <div>
            <q-icon name="dashboard" size="lg" class="q-mb-sm" /><br />이 창에 패널이 없습니다.
          </div>
        </div>
      </pane>
    </splitpanes>

    <!-- L-Shape (중첩) 레이아웃 처리 -->
    <splitpanes
      v-else-if="
        currentPresetConfig &&
        layoutStore.activePreset === 'l-shape' &&
        currentPresetConfig.panes.some((p) => p.isContainer)
      "
      :key="layoutStore.activePreset + '-l-shape-root'"
      class="default-theme"
      style="height: 100%"
      :horizontal="currentPresetConfig.horizontal"
      @resized="handleSplitterResized"
    >
      <pane
        :key="currentPresetConfig.panes[0].id"
        :id="currentPresetConfig.panes[0].id"
        :size="currentPresetConfig.panes[0].defaultSize"
        class="pane-container bg-grey-9"
        :class="{
          'is-selected-pane': layoutStore.selectedPaneId === currentPresetConfig.panes[0].id,
          'pane-drop-hover': false,
        }"
        @click.stop="layoutStore.setSelectedPaneId(currentPresetConfig.panes[0].id)"
        :ref="(el) => (paneRefs[currentPresetConfig.panes[0].id] = el)"
      >
        <q-btn
          v-if="layoutStore.selectedPaneId === currentPresetConfig.panes[0].id"
          flat
          dense
          round
          icon="more_horiz"
          size="md"
          text-color="accent"
          class="pane-menu-button"
          @click.stop
          @mouseenter="openMenu(currentPresetConfig.panes[0].id)"
          @mouseleave="scheduleMenuHide(currentPresetConfig.panes[0].id)"
        >
          <q-menu
            v-model="menuVisibility[currentPresetConfig.panes[0].id]"
            anchor="bottom right"
            self="top right"
            @mouseenter="cancelMenuHide(currentPresetConfig.panes[0].id)"
            @mouseleave="hideMenu(currentPresetConfig.panes[0].id)"
          >
            <q-list dense style="min-width: 150px">
              <q-item
                clickable
                v-close-popup
                @click="openAddNexaPanelDialog(currentPresetConfig.panes[0].id)"
              >
                <q-item-section avatar style="min-width: 30px"
                  ><q-icon name="add_box" size="xs" />
                </q-item-section>
                <q-item-section>패널 추가</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="showFeatureNotReadyAlert('창 분할')">
                <q-item-section avatar style="min-width: 30px"
                  ><q-icon name="splitscreen" size="xs" />
                </q-item-section>
                <q-item-section>창 분할</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="showFeatureNotReadyAlert('창 병합')">
                <q-item-section avatar style="min-width: 30px"
                  ><q-icon name="merge_type" size="xs" />
                </q-item-section>
                <q-item-section>창 병합</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <grid-layout
          v-if="layoutStore.panes[currentPresetConfig.panes[0].id]"
          v-model:layout="layoutStore.panes[currentPresetConfig.panes[0].id]"
          :col-num="12"
          :row-height="30"
          :is-draggable="true"
          :is-resizable="true"
          :responsive="false"
          :vertical-compact="true"
          :use-css-transforms="true"
          class="grid-layout-container q-pa-xs"
          @layout-updated="(newLayout) => handleLayoutUpdate(newLayout)"
        >
          <grid-item
            v-for="panel in layoutStore.panes[currentPresetConfig.panes[0].id]"
            :key="panel.i"
            :x="panel.x"
            :y="panel.y"
            :w="panel.w"
            :h="panel.h"
            :i="panel.i"
            @resized="
              (i, newH, newW) =>
                handleGridItemResized(currentPresetConfig.panes[0].id, i, newH, newW)
            "
            @moved="
              (i, newX, newY) => handleGridItemMoved(currentPresetConfig.panes[0].id, i, newX, newY)
            "
            @dragstart.stop="() => handleItemDragStart()"
            @dragmove.stop="() => handleItemDrag()"
            @dragend.stop="() => handleItemDragEnd()"
            class="grid-item-card"
          >
            <q-card flat class="full-height column no-wrap bg-custom-dark-card">
              <q-card-section
                class="bg-black text-grey-5 q-pa-xs row items-center no-wrap pane-nexa-panel-header"
              >
                <div class="text-caption col ellipsis q-pl-xs">{{ panel.title }}</div>
                <q-space />
                <q-btn flat dense round icon="more_vert" size="xs" @click.stop>
                  <q-menu auto-close anchor="bottom end" self="top end">
                    <q-list dense style="min-width: 150px">
                      <q-item
                        clickable
                        @click="requestMovePanelDialog(currentPresetConfig.panes[0].id, panel.id)"
                      >
                        <q-item-section avatar style="min-width: 30px"
                          ><q-icon name="open_with" size="xs"
                        /></q-item-section>
                        <q-item-section>다른 창으로 이동...</q-item-section>
                      </q-item>
                      <q-separator />
                      <q-item
                        clickable
                        @click="
                          layoutStore.removePanelFromPane(currentPresetConfig.panes[0].id, panel.id)
                        "
                      >
                        <q-item-section avatar style="min-width: 30px"
                          ><q-icon name="delete_outline" size="xs"
                        /></q-item-section>
                        <q-item-section>패널 닫기</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </q-card-section>
              <q-card-section class="col q-pa-sm text-grey-6 text-caption scroll">
                {{ panel.content }}
                <div class="text-grey-7 text-caption">ID: {{ panel.id }}</div>
              </q-card-section>
            </q-card>
          </grid-item>
        </grid-layout>
        <div
          v-if="
            !layoutStore.panes[currentPresetConfig.panes[0].id] ||
            layoutStore.panes[currentPresetConfig.panes[0].id].length === 0
          "
          class="text-grey-7 q-pa-md text-center flex flex-center full-height"
        >
          <div>
            <q-icon name="dashboard" size="lg" class="q-mb-sm" /><br />이 창에 패널이 없습니다.
          </div>
        </div>
      </pane>

      <pane
        :key="currentPresetConfig.panes[1].id"
        :id="currentPresetConfig.panes[1].id"
        :size="currentPresetConfig.panes[1].defaultSize"
        class="pane-container bg-grey-9"
      >
        <splitpanes
          v-if="
            currentPresetConfig.panes[1].isContainer && currentPresetConfig.panes[1].nestedConfig
          "
          :key="layoutStore.activePreset + '-l-shape-nested'"
          class="default-theme"
          style="height: 100%"
          :horizontal="currentPresetConfig.panes[1].nestedConfig.horizontal"
          @resized="handleSplitterResized"
        >
          <pane
            v-for="nestedPaneConfig in currentPresetConfig.panes[1].nestedConfig.panes"
            :key="nestedPaneConfig.id"
            :id="nestedPaneConfig.id"
            :size="nestedPaneConfig.defaultSize"
            class="pane-container bg-grey-9"
            :class="{
              'is-selected-pane': layoutStore.selectedPaneId === nestedPaneConfig.id,
              'pane-drop-hover': false,
            }"
            @click.stop="layoutStore.setSelectedPaneId(nestedPaneConfig.id)"
            :ref="(el) => (paneRefs[nestedPaneConfig.id] = el)"
          >
            <q-btn
              v-if="layoutStore.selectedPaneId === nestedPaneConfig.id"
              flat
              dense
              round
              icon="more_horiz"
              size="md"
              text-color="accent"
              class="pane-menu-button"
              @click.stop
              @mouseenter="openMenu(nestedPaneConfig.id)"
              @mouseleave="scheduleMenuHide(nestedPaneConfig.id)"
            >
              <q-menu
                v-model="menuVisibility[nestedPaneConfig.id]"
                anchor="bottom right"
                self="top right"
                @mouseenter="cancelMenuHide(nestedPaneConfig.id)"
                @mouseleave="hideMenu(nestedPaneConfig.id)"
              >
                <q-list dense style="min-width: 150px">
                  <q-item
                    clickable
                    v-close-popup
                    @click="openAddNexaPanelDialog(nestedPaneConfig.id)"
                  >
                    <q-item-section avatar style="min-width: 30px"
                      ><q-icon name="add_box" size="xs" />
                    </q-item-section>
                    <q-item-section>패널 추가</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-close-popup @click="showFeatureNotReadyAlert('창 분할')">
                    <q-item-section avatar style="min-width: 30px"
                      ><q-icon name="splitscreen" size="xs" />
                    </q-item-section>
                    <q-item-section>창 분할</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="showFeatureNotReadyAlert('창 병합')">
                    <q-item-section avatar style="min-width: 30px"
                      ><q-icon name="merge_type" size="xs" />
                    </q-item-section>
                    <q-item-section>창 병합</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
            <grid-layout
              v-if="layoutStore.panes[nestedPaneConfig.id]"
              v-model:layout="layoutStore.panes[nestedPaneConfig.id]"
              :col-num="12"
              :row-height="30"
              :is-draggable="true"
              :is-resizable="true"
              :responsive="false"
              :vertical-compact="true"
              :use-css-transforms="true"
              class="grid-layout-container q-pa-xs"
              @layout-updated="(newLayout) => handleLayoutUpdate(newLayout)"
            >
              <grid-item
                v-for="panel in layoutStore.panes[nestedPaneConfig.id]"
                :key="panel.i"
                :x="panel.x"
                :y="panel.y"
                :w="panel.w"
                :h="panel.h"
                :i="panel.i"
                @resized="
                  (i, newH, newW) => handleGridItemResized(nestedPaneConfig.id, i, newH, newW)
                "
                @moved="(i, newX, newY) => handleGridItemMoved(nestedPaneConfig.id, i, newX, newY)"
                @dragstart.stop="() => handleItemDragStart()"
                @dragmove.stop="() => handleItemDrag()"
                @dragend.stop="() => handleItemDragEnd()"
                class="grid-item-card"
              >
                <q-card flat class="full-height column no-wrap bg-custom-dark-card">
                  <q-card-section
                    class="bg-black text-grey-5 q-pa-xs row items-center no-wrap pane-nexa-panel-header"
                  >
                    <div class="text-caption col ellipsis q-pl-xs">{{ panel.title }}</div>
                    <q-space />
                    <q-btn flat dense round icon="more_vert" size="xs" @click.stop>
                      <q-menu auto-close anchor="bottom end" self="top end">
                        <q-list dense style="min-width: 150px">
                          <q-item
                            clickable
                            @click="requestMovePanelDialog(nestedPaneConfig.id, panel.id)"
                          >
                            <q-item-section avatar style="min-width: 30px"
                              ><q-icon name="open_with" size="xs"
                            /></q-item-section>
                            <q-item-section>다른 창으로 이동...</q-item-section>
                          </q-item>
                          <q-separator />
                          <q-item
                            clickable
                            @click="layoutStore.removePanelFromPane(nestedPaneConfig.id, panel.id)"
                          >
                            <q-item-section avatar style="min-width: 30px"
                              ><q-icon name="delete_outline" size="xs"
                            /></q-item-section>
                            <q-item-section>패널 닫기</q-item-section>
                          </q-item>
                        </q-list>
                      </q-menu>
                    </q-btn>
                  </q-card-section>
                  <q-card-section class="col q-pa-sm text-grey-6 text-caption scroll">
                    {{ panel.content }}
                    <div class="text-grey-7 text-caption">ID: {{ panel.id }}</div>
                  </q-card-section>
                </q-card>
              </grid-item>
            </grid-layout>
            <div
              v-if="
                !layoutStore.panes[nestedPaneConfig.id] ||
                layoutStore.panes[nestedPaneConfig.id].length === 0
              "
              class="text-grey-7 q-pa-md text-center flex flex-center full-height"
            >
              <div>
                <q-icon name="dashboard" size="lg" class="q-mb-sm" /><br />이 창에 패널이 없습니다.
              </div>
            </div>
          </pane>
        </splitpanes>
      </pane>
    </splitpanes>

    <div
      v-else-if="!currentPresetConfig || currentPresetConfig.panes.length === 0"
      class="text-negative flex flex-center full-height"
    >
      선택된 프리셋('{{ layoutStore.activePreset }}')에 대한 레이아웃 구성이 없거나 잘못되었습니다.
    </div>
    <div v-else class="text-orange flex flex-center full-height">
      알 수 없는 조건으로 레이아웃을 표시할 수 없습니다. (프리셋: {{ layoutStore.activePreset }})
      <pre>{{ currentPresetConfig }}</pre>
    </div>

    <NexaPanelDialog
      v-model="showAddNexaPanelDialog"
      @addNexaPanel="handleNexaPanelAddedFromDialog"
    />

    <q-dialog v-model="showMovePanelDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">패널을 다른 창으로 이동</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          이동할 대상 창을 선택하세요. (현재 창: {{ movePanelState.sourcePaneId }})
          <q-select
            filled
            v-model="movePanelState.targetPaneId"
            :options="availableTargetPanes"
            label="대상 창"
            emit-value
            map-options
            dense
            class="q-mt-sm"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="취소" v-close-popup />
          <q-btn
            flat
            label="이동"
            color="primary"
            @click="executeMovePanel"
            :disable="!movePanelState.targetPaneId"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, watch, computed, onMounted, nextTick } from 'vue'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { GridLayout, GridItem } from 'vue3-grid-layout-next'
import 'vue3-grid-layout-next/dist/style.css'
import { useLayoutStore } from 'src/system/store/layout'
import NexaPanelDialog from '@domains/panel/components/NexaPanelDialog.vue'
import { useQuasar } from 'quasar'

const layoutStore = useLayoutStore()
const $q = useQuasar()

const showAddNexaPanelDialog = ref(false)
const currentTargetPaneId = ref(null)

const menuVisibility = ref({})
const menuHideTimers = ref({})

const isDraggingGridItem = ref(false)
const paneRefs = ref({})
const paneRects = ref({})

const showMovePanelDialog = ref(false)
const movePanelState = ref({
  sourcePaneId: null,
  panelId: null,
  targetPaneId: null,
})

const availableTargetPanes = computed(() => {
  if (!movePanelState.value.sourcePaneId) return []
  return layoutStore.getCurrentPaneIds
    .filter((id) => id !== movePanelState.value.sourcePaneId)
    .map((id) => ({ label: `창 ${id}`, value: id }))
})

const requestMovePanelDialog = (sourcePaneId, panelId) => {
  movePanelState.value = {
    sourcePaneId,
    panelId,
    targetPaneId: null,
  }
  showMovePanelDialog.value = true
}

const executeMovePanel = () => {
  if (
    movePanelState.value.sourcePaneId &&
    movePanelState.value.panelId &&
    movePanelState.value.targetPaneId
  ) {
    layoutStore.movePanelToAnotherPane({
      panelInstanceId: movePanelState.value.panelId,
      sourcePaneId: movePanelState.value.sourcePaneId,
      targetPaneId: movePanelState.value.targetPaneId,
    })
    showMovePanelDialog.value = false
    $q.notify({
      color: 'positive',
      position: 'top',
      message: `패널이 창 ${movePanelState.value.targetPaneId}으로 이동되었습니다.`,
      icon: 'check_circle',
    })
  } else {
    $q.notify({
      color: 'negative',
      position: 'top',
      message: '패널 이동에 필요한 정보가 부족합니다.',
      icon: 'warning',
    })
  }
}

const openMenu = (paneId) => {
  if (menuHideTimers.value[paneId]) {
    clearTimeout(menuHideTimers.value[paneId])
    menuHideTimers.value[paneId] = null
  }
  menuVisibility.value[paneId] = true
}

const scheduleMenuHide = (paneId) => {
  if (menuHideTimers.value[paneId]) {
    clearTimeout(menuHideTimers.value[paneId])
  }
  menuHideTimers.value[paneId] = setTimeout(() => {
    menuVisibility.value[paneId] = false
    menuHideTimers.value[paneId] = null
  }, 300)
}

const cancelMenuHide = (paneId) => {
  if (menuHideTimers.value[paneId]) {
    clearTimeout(menuHideTimers.value[paneId])
    menuHideTimers.value[paneId] = null
  }
}

const hideMenu = (paneId) => {
  menuVisibility.value[paneId] = false
  if (menuHideTimers.value[paneId]) {
    clearTimeout(menuHideTimers.value[paneId])
    menuHideTimers.value[paneId] = null
  }
}

const currentPresetConfig = computed(() => {
  if (
    !layoutStore.activePreset ||
    !layoutStore.presetPaneConfigurations ||
    !layoutStore.presetPaneConfigurations[layoutStore.activePreset]
  ) {
    console.warn(`Invalid or missing preset configuration for: ${layoutStore.activePreset}`)
    return null
  }
  return layoutStore.presetPaneConfigurations[layoutStore.activePreset]
})

const handleLayoutUpdate = () => {
  // console.log(`Layout updated`);
  // v-model handles store updates, no specific logic needed here for now
}

const handleGridItemResized = (paneId, itemId, newH, newW) => {
  layoutStore.updatePanelGridLayout(paneId, itemId, { h: newH, w: newW })
}

const handleGridItemMoved = (paneId, itemId, newX, newY) => {
  layoutStore.updatePanelGridLayout(paneId, itemId, { x: newX, y: newY })
}

const openAddNexaPanelDialog = (paneId) => {
  currentTargetPaneId.value = paneId
  showAddNexaPanelDialog.value = true
}

const handleNexaPanelAddedFromDialog = (nexaPanelConfig) => {
  if (currentTargetPaneId.value && layoutStore.panes[currentTargetPaneId.value]) {
    let newY = 0
    if (layoutStore.panes[currentTargetPaneId.value].length > 0) {
      newY = Math.max(0, ...layoutStore.panes[currentTargetPaneId.value].map((p) => p.y + p.h))
    }
    const newPanel = {
      ...nexaPanelConfig,
      x: 0,
      y: newY,
    }
    layoutStore.addPanelToPane(currentTargetPaneId.value, newPanel)
  }
  currentTargetPaneId.value = null
}

const showFeatureNotReadyAlert = (featureName) => {
  alert(`${featureName} 기능은 현재 준비 중입니다.`)
}

const setupDefaultPanels = () => {
  layoutStore.clearAllPanels()
  const paneIds = layoutStore.getCurrentPaneIds
  if (paneIds && paneIds.length > 0) {
    paneIds.forEach((paneId) => {
      if (!layoutStore.panes[paneId]) {
        return
      }
      layoutStore.addPanelToPane(paneId, {
        title: `샘플 ${paneId}-1`,
        content: `${paneId}의 첫 번째 샘플 내용입니다.`,
        x: 0,
        y: 0,
        w: 6,
        h: 4,
      })
      if (paneIds.length === 1 || paneId !== paneIds[0]) {
        layoutStore.addPanelToPane(paneId, {
          title: `샘플 ${paneId}-2`,
          content: `${paneId}의 두 번째 샘플입니다.`,
          x: 6,
          y: 0,
          w: 6,
          h: 4,
        })
      }
    })
  }
}

const updateAllPaneRects = () => {
  if (!currentPresetConfig.value) return
  const newRects = {}
  const allPaneIds = layoutStore.getCurrentPaneIds
  if (!allPaneIds || allPaneIds.length === 0) {
    paneRects.value = {}
    return
  }
  allPaneIds.forEach((paneId) => {
    const paneRefInstance = paneRefs.value[paneId]
    if (paneRefInstance) {
      const actualElement = paneRefInstance.$el || paneRefInstance
      if (actualElement && typeof actualElement.getBoundingClientRect === 'function') {
        newRects[paneId] = actualElement.getBoundingClientRect()
      } else {
        // console.warn(`[updateAllPaneRects] Could not get DOM element or getBoundingClientRect for paneId: ${paneId}. Actual element:`, actualElement);
      }
    } else {
      // console.warn(`[updateAllPaneRects] No ref found for paneId: ${paneId}`);
    }
  })
  paneRects.value = newRects
  // console.log('[updateAllPaneRects] Final Pane Rects:', JSON.parse(JSON.stringify(paneRects.value)));
}

const debouncedUpdateAllPaneRects =
  $q.screen.width > 0
    ? (() => {
        let timer
        return () => {
          clearTimeout(timer)
          timer = setTimeout(() => {
            updateAllPaneRects()
          }, 100)
        }
      })()
    : () => {
        console.warn('Quasar screen not ready for debouncing.')
      }

onMounted(() => {
  if (!currentPresetConfig.value) {
    layoutStore.setActivePreset(layoutStore.activePreset || 'single')
  }
  const initialPaneIds = layoutStore.getCurrentPaneIds
  if (initialPaneIds && initialPaneIds.length > 0 && !layoutStore.selectedPaneId) {
    layoutStore.setSelectedPaneId(initialPaneIds[0])
  }
  setupDefaultPanels()
  nextTick(() => {
    updateAllPaneRects()
    window.addEventListener('resize', debouncedUpdateAllPaneRects)
  })
})

const handleSplitterResized = () => {
  // console.log('Splitter resized');
  debouncedUpdateAllPaneRects()
}

watch(
  () => layoutStore.activePreset,
  (newPreset, oldPreset) => {
    if (newPreset !== oldPreset) {
      if (!layoutStore.presetPaneConfigurations[newPreset]) {
        layoutStore.setActivePreset(oldPreset || 'single')
        return
      }
      const newPaneIds = layoutStore.getCurrentPaneIds
      layoutStore.setSelectedPaneId(newPaneIds && newPaneIds.length > 0 ? newPaneIds[0] : null)
      setupDefaultPanels()
      nextTick(updateAllPaneRects)
    }
  },
  { immediate: false },
)

watch(
  () => layoutStore.requestGenericAddPanelFlag,
  (newValue) => {
    if (newValue === true) {
      const targetPaneId =
        layoutStore.selectedPaneId ||
        (layoutStore.getCurrentPaneIds && layoutStore.getCurrentPaneIds[0])
      if (targetPaneId) {
        openAddNexaPanelDialog(targetPaneId)
      }
      layoutStore.requestGenericAddPanelFlag = false
    }
  },
)

// Grid Item's own drag events
const handleItemDragStart = () => {
  isDraggingGridItem.value = true
}

const handleItemDrag = () => {
  if (!isDraggingGridItem.value) return
}

const handleItemDragEnd = () => {
  isDraggingGridItem.value = false
}
</script>

<style lang="scss">
@import 'vue3-grid-layout-next/dist/style.css';

.splitpanes.default-theme .splitpanes__splitter {
  background-color: #292828;
  box-sizing: border-box;
  position: relative;
  flex-shrink: 0;
  border: none;
}
.splitpanes.default-theme .splitpanes__splitter:before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  transition: opacity 0.4s;
  background-color: rgba(var(--nexa-primary-rgb), 0.3);
  opacity: 0;
  z-index: 1;
}
.splitpanes.default-theme .splitpanes__splitter:hover:before {
  opacity: 1;
}
.splitpanes.default-theme .splitpanes__splitter:before {
  width: 100%;
  height: 100%;
}
.splitpanes.default-theme.splitpanes--vertical > .splitpanes__splitter {
  width: 5px;
}
.splitpanes.default-theme.splitpanes--horizontal > .splitpanes__splitter {
  height: 5px;
}

.pane-container {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  padding-top: 5px;
}

.pane-menu-button {
  position: absolute;
  top: -8px;
  right: 2px;
  z-index: 20;
}

.is-selected-pane {
  border-top: 1px solid $accent;
}

.grid-layout-container {
  width: 100%;
  height: 100%;
  flex-grow: 1;
}

.grid-item-card .q-card {
  overflow: hidden;
}

.grid-item-card .q-card-section.scroll {
  overflow: auto;
}

.pane-nexa-panel-header {
  cursor: move;
}

.bg-custom-dark-card {
  background-color: #2a2a2a !important;
}
.bg-black {
  background-color: #1e1e1e !important;
}
.text-grey-5 {
  color: #bdbdbd !important;
}
.text-grey-6 {
  color: #9e9e9e !important;
}
.text-grey-7 {
  color: #757575 !important;
}

.rounded-borders {
  border-radius: 4px;
}

.vue-grid-item {
  touch-action: none;
}
</style>
