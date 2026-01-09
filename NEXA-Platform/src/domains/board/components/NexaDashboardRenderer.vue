<!--
  데시보드 레이아웃 렌더링 컴포넌트
-->

<template>
  <div style="height: 100%; padding-bottom: 5px" class="dashboard-renderer-container bg-grey-10">
    <!-- 일반 (비중첩) 레이아웃 -->
    <splitpanes
      v-if="
        currentPresetConfig &&
        currentPresetConfig.panes.length > 0 &&
        !currentPresetConfig.panes.some((p) => p.isContainer)
      "
      :key="dashboardLayoutStore.activePreset + '-root-normal' + paneSizesKeySuffix"
      class="default-theme"
      style="height: 100%"
      :horizontal="currentPresetConfig.horizontal"
      @resized="(eventData) => handleSplitterResized(eventData, 'root-normal')"
    >
      <pane
        v-for="paneConfig in currentPresetConfig.panes"
        :key="paneConfig.id"
        :id="paneConfig.id"
        :size="dashboardLayoutStore.panes[paneConfig.id]?.size || paneConfig.defaultSize"
        class="pane-container bg-grey-9"
        :class="{
          'is-selected-pane': dashboardLayoutStore.selectedPaneId === paneConfig.id,
          'pane-drop-hover': false, // TODO: 드래그 앤 드롭 시각적 피드백
        }"
        @click.stop="dashboardLayoutStore.setSelectedPaneId(paneConfig.id)"
        :ref="(el) => (paneRefs[paneConfig.id] = el)"
      >
        <q-btn
          v-if="dashboardLayoutStore.selectedPaneId === paneConfig.id"
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
          v-if="
            dashboardLayoutStore.panes[paneConfig.id] &&
            dashboardLayoutStore.panes[paneConfig.id].nexaPanels
          "
          v-model:layout="dashboardLayoutStore.panes[paneConfig.id].nexaPanels"
          :col-num="12"
          :row-height="30"
          :is-draggable="isDraggingEnabled"
          :is-resizable="isDraggingEnabled"
          :responsive="false"
          :vertical-compact="true"
          :use-css-transforms="true"
          class="grid-layout-container q-pa-xs"
          @layout-updated="(newLayout) => handleLayoutUpdate(newLayout, paneConfig.id)"
        >
          <grid-item
            v-for="panel in dashboardLayoutStore.panes[paneConfig.id].nexaPanels"
            :key="panel.i"
            :x="panel.x"
            :y="panel.y"
            :w="panel.w"
            :h="panel.h"
            :i="panel.i"
            @resized="
              (i, newH, newW, newHPx, newWPx) =>
                handleGridItemResized(paneConfig.id, i, newH, newW, newHPx, newWPx)
            "
            @moved="(i, newX, newY) => handleGridItemMoved(paneConfig.id, i, newX, newY)"
            @dragstart.stop="() => handleItemDragStart(panel.i)"
            @dragend.stop="() => handleItemDragEnd(panel.i)"
            class="grid-item-card"
            :drag-allow-from="`.pane-nexa-panel-header[data-nexa-panel-id='${panel.i}']`"
            :draggable-cancel="'.no-drag'"
          >
            <q-card flat class="full-height column no-wrap bg-custom-dark-card">
              <q-card-section
                :data-nexa-panel-id="panel.i"
                class="bg-black text-grey-5 q-pa-xs row items-center no-wrap pane-nexa-panel-header cursor-move"
              >
                <div class="text-caption col ellipsis q-pl-xs">{{ panel.title }}</div>
                <q-space />
                <q-btn flat dense round icon="more_vert" size="xs" @click.stop class="no-drag">
                  <q-menu auto-close anchor="bottom end" self="top end">
                    <q-list dense style="min-width: 150px">
                      <q-item clickable @click="requestMovePanelDialog(paneConfig.id, panel.i)">
                        <q-item-section avatar style="min-width: 30px"
                          ><q-icon name="open_with" size="xs"
                        /></q-item-section>
                        <q-item-section>다른 창으로 이동...</q-item-section>
                      </q-item>
                      <q-separator />
                      <q-item
                        clickable
                        @click="dashboardLayoutStore.removePanelFromPane(paneConfig.id, panel.i)"
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
                <div class="text-grey-7 text-caption">ID: {{ panel.id }} (i: {{ panel.i }})</div>
              </q-card-section>
            </q-card>
          </grid-item>
        </grid-layout>
        <div
          v-if="
            !dashboardLayoutStore.panes[paneConfig.id] ||
            !dashboardLayoutStore.panes[paneConfig.id].nexaPanels ||
            dashboardLayoutStore.panes[paneConfig.id].nexaPanels.length === 0
          "
          class="text-grey-6 q-pa-md text-center flex flex-center full-height"
        >
          <div>
            <q-icon name="dashboard" size="xl" class="q-mb-md text-grey-6" />
            <div class="text-subtitle1 q-mb-sm">패널이 비어 있습니다</div>
            <p class="text-caption q-mb-md">
              우측 상단 또는 창 내부의 '패널 추가' 버튼으로 다양한 패널을 추가해 보세요.<br />
              창 사이의 분할선을 드래그하여 크기를 자유롭게 조절할 수 있습니다.<br />
              나만의 맞춤형 대시보드를 구성하여 작업 효율을 높여보세요!
            </p>
            <q-btn
              flat
              color="secondary"
              label="이 창에 패널 추가"
              icon="add_box"
              @click="openAddNexaPanelDialog(paneConfig.id)"
              class="q-mt-sm"
            />
          </div>
        </div>
      </pane>
    </splitpanes>

    <!-- L-Shape (중첩) 레이아웃 처리 -->
    <splitpanes
      v-else-if="
        currentPresetConfig &&
        dashboardLayoutStore.activePreset === 'l-shape' &&
        currentPresetConfig.panes.some((p) => p.isContainer)
      "
      :key="dashboardLayoutStore.activePreset + '-l-shape-root' + paneSizesKeySuffix"
      class="default-theme"
      style="height: 100%"
      :horizontal="currentPresetConfig.horizontal"
      @resized="(eventData) => handleSplitterResized(eventData, 'l-shape-root')"
    >
      <!-- L-shape 왼쪽 패널 (일반 패널과 동일하게 처리) -->
      <pane
        :key="currentPresetConfig.panes[0].id"
        :id="currentPresetConfig.panes[0].id"
        :size="
          dashboardLayoutStore.panes[currentPresetConfig.panes[0].id]?.size ||
          currentPresetConfig.panes[0].defaultSize
        "
        class="pane-container bg-grey-9"
        :class="{
          'is-selected-pane':
            dashboardLayoutStore.selectedPaneId === currentPresetConfig.panes[0].id,
        }"
        @click.stop="dashboardLayoutStore.setSelectedPaneId(currentPresetConfig.panes[0].id)"
        :ref="(el) => (paneRefs[currentPresetConfig.panes[0].id] = el)"
      >
        <q-btn
          v-if="dashboardLayoutStore.selectedPaneId === currentPresetConfig.panes[0].id"
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
                  ><q-icon name="add_box" size="xs"
                /></q-item-section>
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
          v-if="
            dashboardLayoutStore.panes[currentPresetConfig.panes[0].id] &&
            dashboardLayoutStore.panes[currentPresetConfig.panes[0].id].nexaPanels
          "
          v-model:layout="dashboardLayoutStore.panes[currentPresetConfig.panes[0].id].nexaPanels"
          :col-num="12"
          :row-height="30"
          :is-draggable="isDraggingEnabled"
          :is-resizable="isDraggingEnabled"
          :responsive="false"
          :vertical-compact="true"
          :use-css-transforms="true"
          class="grid-layout-container q-pa-xs"
          @layout-updated="
            (newLayout) => handleLayoutUpdate(newLayout, currentPresetConfig.panes[0].id)
          "
        >
          <grid-item
            v-for="panel in dashboardLayoutStore.panes[currentPresetConfig.panes[0].id].nexaPanels"
            :key="panel.i"
            :x="panel.x"
            :y="panel.y"
            :w="panel.w"
            :h="panel.h"
            :i="panel.i"
            @resized="
              (i, newH, newW, newHPx, newWPx) =>
                handleGridItemResized(
                  currentPresetConfig.panes[0].id,
                  i,
                  newH,
                  newW,
                  newHPx,
                  newWPx,
                )
            "
            @moved="
              (i, newX, newY) => handleGridItemMoved(currentPresetConfig.panes[0].id, i, newX, newY)
            "
            @dragstart.stop="() => handleItemDragStart(panel.i)"
            @dragend.stop="() => handleItemDragEnd(panel.i)"
            class="grid-item-card"
            :drag-allow-from="`.pane-nexa-panel-header[data-nexa-panel-id='${panel.i}']`"
            :draggable-cancel="'.no-drag'"
          >
            <q-card flat class="full-height column no-wrap bg-custom-dark-card">
              <q-card-section
                :data-nexa-panel-id="panel.i"
                class="bg-black text-grey-5 q-pa-xs row items-center no-wrap pane-nexa-panel-header cursor-move"
              >
                <div class="text-caption col ellipsis q-pl-xs">{{ panel.title }}</div>
                <q-space />
                <q-btn flat dense round icon="more_vert" size="xs" @click.stop class="no-drag">
                  <q-menu auto-close anchor="bottom end" self="top end">
                    <q-list dense style="min-width: 150px">
                      <q-item
                        clickable
                        @click="requestMovePanelDialog(currentPresetConfig.panes[0].id, panel.i)"
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
                          dashboardLayoutStore.removePanelFromPane(
                            currentPresetConfig.panes[0].id,
                            panel.i,
                          )
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
                <div class="text-grey-7 text-caption">ID: {{ panel.id }} (i: {{ panel.i }})</div>
              </q-card-section>
            </q-card>
          </grid-item>
        </grid-layout>
        <div
          v-if="
            !dashboardLayoutStore.panes[currentPresetConfig.panes[0].id] ||
            !dashboardLayoutStore.panes[currentPresetConfig.panes[0].id].nexaPanels ||
            dashboardLayoutStore.panes[currentPresetConfig.panes[0].id].nexaPanels.length === 0
          "
          class="text-grey-6 q-pa-md text-center flex flex-center full-height"
        >
          <div>
            <q-icon name="dashboard" size="xl" class="q-mb-md text-grey-6" />
            <div class="text-subtitle1 q-mb-sm">패널이 비어 있습니다</div>
            <p class="text-caption q-mb-md">
              우측 상단 또는 창 내부의 '패널 추가' 버튼으로 다양한 패널을 추가해 보세요.<br />
              창 사이의 분할선을 드래그하여 크기를 자유롭게 조절할 수 있습니다.<br />
              나만의 맞춤형 대시보드를 구성하여 작업 효율을 높여보세요!
            </p>
            <q-btn
              flat
              color="secondary"
              label="이 창에 패널 추가"
              icon="add_box"
              @click="openAddNexaPanelDialog(currentPresetConfig.panes[0].id)"
              class="q-mt-sm"
            />
          </div>
        </div>
      </pane>

      <!-- L-shape 오른쪽 (중첩 Splitpanes) -->
      <pane
        :key="currentPresetConfig.panes[1].id"
        :id="currentPresetConfig.panes[1].id"
        :size="
          dashboardLayoutStore.panes[currentPresetConfig.panes[1].id]?.size ||
          currentPresetConfig.panes[1].defaultSize
        "
        class="nested-splitpanes-container"
      >
        <splitpanes
          v-if="
            currentPresetConfig.panes[1].isContainer && currentPresetConfig.panes[1].nestedConfig
          "
          :key="dashboardLayoutStore.activePreset + '-l-shape-nested' + paneSizesKeySuffix"
          class="default-theme"
          style="height: 100%"
          :horizontal="currentPresetConfig.panes[1].nestedConfig.horizontal"
          @resized="(eventData) => handleSplitterResized(eventData, 'l-shape-nested')"
        >
          <pane
            v-for="nestedPaneConfig in currentPresetConfig.panes[1].nestedConfig.panes"
            :key="nestedPaneConfig.id"
            :id="nestedPaneConfig.id"
            :size="
              dashboardLayoutStore.panes[nestedPaneConfig.id]?.size || nestedPaneConfig.defaultSize
            "
            class="pane-container bg-grey-9"
            :class="{
              'is-selected-pane': dashboardLayoutStore.selectedPaneId === nestedPaneConfig.id,
            }"
            @click.stop="dashboardLayoutStore.setSelectedPaneId(nestedPaneConfig.id)"
            :ref="(el) => (paneRefs[nestedPaneConfig.id] = el)"
          >
            <q-btn
              v-if="dashboardLayoutStore.selectedPaneId === nestedPaneConfig.id"
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
              v-if="
                dashboardLayoutStore.panes[nestedPaneConfig.id] &&
                dashboardLayoutStore.panes[nestedPaneConfig.id].nexaPanels
              "
              v-model:layout="dashboardLayoutStore.panes[nestedPaneConfig.id].nexaPanels"
              :col-num="12"
              :row-height="30"
              :is-draggable="isDraggingEnabled"
              :is-resizable="isDraggingEnabled"
              :responsive="false"
              :vertical-compact="true"
              :use-css-transforms="true"
              class="grid-layout-container q-pa-xs"
              @layout-updated="(newLayout) => handleLayoutUpdate(newLayout, nestedPaneConfig.id)"
            >
              <grid-item
                v-for="panel in dashboardLayoutStore.panes[nestedPaneConfig.id].nexaPanels"
                :key="panel.i"
                :x="panel.x"
                :y="panel.y"
                :w="panel.w"
                :h="panel.h"
                :i="panel.i"
                @resized="
                  (i, newH, newW, newHPx, newWPx) =>
                    handleGridItemResized(nestedPaneConfig.id, i, newH, newW, newHPx, newWPx)
                "
                @moved="(i, newX, newY) => handleGridItemMoved(nestedPaneConfig.id, i, newX, newY)"
                @dragstart.stop="() => handleItemDragStart(panel.i)"
                @dragend.stop="() => handleItemDragEnd(panel.i)"
                class="grid-item-card"
                :drag-allow-from="`.pane-nexa-panel-header[data-nexa-panel-id='${panel.i}']`"
                :draggable-cancel="'.no-drag'"
              >
                <q-card flat class="full-height column no-wrap bg-custom-dark-card">
                  <q-card-section
                    :data-nexa-panel-id="panel.i"
                    class="bg-black text-grey-5 q-pa-xs row items-center no-wrap pane-nexa-panel-header cursor-move"
                  >
                    <div class="text-caption col ellipsis q-pl-xs">{{ panel.title }}</div>
                    <q-space />
                    <q-btn flat dense round icon="more_vert" size="xs" @click.stop class="no-drag">
                      <q-menu auto-close anchor="bottom end" self="top end">
                        <q-list dense style="min-width: 150px">
                          <q-item
                            clickable
                            @click="requestMovePanelDialog(nestedPaneConfig.id, panel.i)"
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
                              dashboardLayoutStore.removePanelFromPane(nestedPaneConfig.id, panel.i)
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
                    <div class="text-grey-7 text-caption">
                      ID: {{ panel.id }} (i: {{ panel.i }})
                    </div>
                  </q-card-section>
                </q-card>
              </grid-item>
            </grid-layout>
            <div
              v-if="
                !dashboardLayoutStore.panes[nestedPaneConfig.id] ||
                !dashboardLayoutStore.panes[nestedPaneConfig.id].nexaPanels ||
                dashboardLayoutStore.panes[nestedPaneConfig.id].nexaPanels.length === 0
              "
              class="text-grey-6 q-pa-md text-center flex flex-center full-height"
            >
              <div>
                <q-icon name="dashboard" size="xl" class="q-mb-md text-grey-6" />
                <div class="text-subtitle1 q-mb-sm">패널이 비어 있습니다</div>
                <p class="text-caption q-mb-md">
                  우측 상단 또는 창 내부의 '패널 추가' 버튼으로 다양한 패널을 추가해 보세요.<br />
                  창 사이의 분할선을 드래그하여 크기를 자유롭게 조절할 수 있습니다.<br />
                  나만의 맞춤형 대시보드를 구성하여 작업 효율을 높여보세요!
                </p>
                <q-btn
                  flat
                  color="secondary"
                  label="이 창에 패널 추가"
                  icon="add_box"
                  @click="openAddNexaPanelDialog(nestedPaneConfig.id)"
                  class="q-mt-sm"
                />
              </div>
            </div>
          </pane>
        </splitpanes>
      </pane>
    </splitpanes>

    <!-- 패널 추가 다이얼로그 -->
    <NexaPanelDialog
      v-model="showAddNexaPanelDialog"
      @addNexaPanel="handleNexaPanelAddedFromDialog"
    />

    <!-- 패널 이동 다이얼로그 -->
    <q-dialog v-model="showMovePanelDialog" persistent>
      <q-card style="width: 400px; max-width: 90vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">패널 이동</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <p>'{{ panelToMove?.title || '패널' }}'을(를) 어느 창으로 이동하시겠습니까?</p>
          <q-list bordered separator>
            <q-item
              v-for="destPane in availableTargetPanes"
              :key="destPane.id"
              clickable
              v-ripple
              @click="movePanelToPane(destPane.id)"
              :disable="destPane.id === panelToMove?.currentPaneId"
            >
              <q-item-section>
                <q-item-label>{{ destPane.title || destPane.id }}</q-item-label>
                <q-item-label caption v-if="destPane.id === panelToMove?.currentPaneId"
                  >현재 창</q-item-label
                >
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 드래그 중인 패널의 고스트 요소 (선택적 개선 사항) -->
    <div v-if="draggingItem" class="dragging-ghost-item" :style="ghostStyle">
      {{ draggingItem.title }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar, debounce } from 'quasar'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

import { GridLayout, GridItem } from 'vue3-grid-layout-next'
import 'vue3-grid-layout-next/dist/style.css'

import { useDashboardLayoutStore } from 'src/system/store/dashboardLayoutStore'
import NexaPanelDialog from '@domains/panel/components/NexaPanelDialog.vue'

const $q = useQuasar()
const dashboardLayoutStore = useDashboardLayoutStore()

const paneRefs = ref({})
const menuVisibility = ref({})
const menuHideTimers = ref({})
const paneSizesKeySuffix = ref(0) // <splitpanes> 강제 리렌더링용

const showAddNexaPanelDialog = ref(false)
const currentPaneIdForAddingWidget = ref(null)

const showMovePanelDialog = ref(false)
const panelToMove = ref(null)

const isDraggingEnabled = ref(true)
const draggingItem = ref(null)
const ghostStyle = ref({})

const currentPresetConfig = computed(() => {
  return dashboardLayoutStore.presetPaneConfigurations[dashboardLayoutStore.activePreset]
})

const availableTargetPanes = computed(() => {
  if (!panelToMove.value) return []
  const allPanes = dashboardLayoutStore.getCurrentPaneIds
  return allPanes
    .map((id) => ({
      id,
      title: getPaneTitleById(id) || id,
    }))
    .filter((p) => p.id !== panelToMove.value?.currentPaneId)
})

onMounted(() => {
  console.log('[DashboardRenderer] Mounted. Active preset:', dashboardLayoutStore.activePreset)
  initializeMenuVisibility()
})

watch(
  () => dashboardLayoutStore.activePreset,
  (newPreset, oldPreset) => {
    if (newPreset !== oldPreset) {
      console.log('[DashboardRenderer] Active preset changed, re-initializing menus.')
      initializeMenuVisibility()
      paneRefs.value = {}
    }
  },
  { deep: true },
)

watch(
  () => dashboardLayoutStore.panes,
  (newPanes, oldPanes) => {
    // Pane의 size가 변경되었는지 확인하고, 변경되었다면 splitpanes를 강제로 리렌더링하기 위해 key를 변경
    // 이는 splitpanes가 prop으로 받은 size 변경을 즉시 반영하지 않을 수 있기 때문입니다.
    // 또는, preset 변경 시 pane 구성 자체가 달라질 때도 필요합니다.
    let sizesChanged = false
    if (newPanes && oldPanes) {
      const newPaneIds = Object.keys(newPanes)
      const oldPaneIds = Object.keys(oldPanes)
      if (
        newPaneIds.length !== oldPaneIds.length ||
        !newPaneIds.every((id) => oldPaneIds.includes(id))
      ) {
        sizesChanged = true // Pane 구성 자체가 변경됨
      } else {
        for (const paneId in newPanes) {
          if (
            newPanes[paneId] &&
            oldPanes[paneId] &&
            newPanes[paneId].size !== oldPanes[paneId].size
          ) {
            sizesChanged = true
            break
          }
        }
      }
    }

    if (sizesChanged) {
      // console.log('[DashboardRenderer] Pane sizes or configuration changed, forcing rerender of splitpanes.');
      paneSizesKeySuffix.value++
    }
  },
  { deep: true },
)

watch(
  () => dashboardLayoutStore.genericAddPanelTrigger,
  (newValue, oldValue) => {
    if (newValue !== oldValue && dashboardLayoutStore.selectedPaneId) {
      openAddNexaPanelDialog(dashboardLayoutStore.selectedPaneId)
    }
  },
)

function getPaneTitleById(paneId) {
  const findInPanes = (panesArray) => {
    for (const p of panesArray) {
      if (p.id === paneId) return p.title
      if (p.isContainer && p.nestedConfig && p.nestedConfig.panes) {
        const nestedTitle = findInPanes(p.nestedConfig.panes)
        if (nestedTitle) return nestedTitle
      }
    }
    return null
  }
  return findInPanes(currentPresetConfig.value?.panes || [])
}

function initializeMenuVisibility() {
  const newMenuVisibility = {}
  dashboardLayoutStore.getCurrentPaneIds.forEach((paneId) => {
    newMenuVisibility[paneId] = false
  })
  menuVisibility.value = newMenuVisibility
}

function openMenu(paneId) {
  if (menuHideTimers.value[paneId]) {
    clearTimeout(menuHideTimers.value[paneId])
    delete menuHideTimers.value[paneId]
  }
  Object.keys(menuVisibility.value).forEach((key) => {
    if (key !== paneId) menuVisibility.value[key] = false
  })
  menuVisibility.value[paneId] = true
}

function hideMenu(paneId) {
  if (menuHideTimers.value[paneId]) {
    clearTimeout(menuHideTimers.value[paneId])
  }
  menuVisibility.value[paneId] = false
}

function scheduleMenuHide(paneId) {
  if (menuHideTimers.value[paneId]) {
    clearTimeout(menuHideTimers.value[paneId])
  }
  menuHideTimers.value[paneId] = setTimeout(() => {
    menuVisibility.value[paneId] = false
  }, 300)
}

function cancelMenuHide(paneId) {
  if (menuHideTimers.value[paneId]) {
    clearTimeout(menuHideTimers.value[paneId])
    delete menuHideTimers.value[paneId]
  }
}

/**
 * Splitpanes의 @resized 이벤트 핸들러.
 * 분할창의 크기가 변경될 때 호출됩니다.
 * 변경된 pane들의 ID와 size를 추출하여 스토어 액션을 호출합니다.
 * @param {Array<{id: string|number, size: number, min: number, max: number}>} eventData - splitpanes에서 전달하는 pane 정보 배열 (실제로는 id가 없을 수 있음)
 * @param {string | null} splitpanesGroupIdentifier - 이벤트가 발생한 splitpanes 그룹 식별자 (예: 'root-normal', 'l-shape-root', 'l-shape-nested')
 */
const handleSplitterResized = (eventData, splitpanesGroupIdentifier = null) => {
  console.log(
    '[DashboardRenderer] handleSplitterResized CALLED. Group:',
    splitpanesGroupIdentifier,
    'Raw event data:',
    JSON.parse(JSON.stringify(eventData || {})),
  )

  let actualPanesArray = []
  if (eventData && Array.isArray(eventData.panes)) {
    actualPanesArray = eventData.panes
    console.log('[DashboardRenderer] Event data source: eventData.panes array.')
  } else if (Array.isArray(eventData)) {
    actualPanesArray = eventData
    console.log('[DashboardRenderer] Event data source: direct array.')
  }

  if (!actualPanesArray || actualPanesArray.length === 0) {
    console.warn(
      '[DashboardRenderer] No valid panes array found in resize event.',
      JSON.stringify(eventData || {}),
    )
    return
  }

  console.log(
    '[DashboardRenderer] Processing actualPanesArray (length:',
    actualPanesArray.length,
    '):',
    JSON.parse(JSON.stringify(actualPanesArray)),
    'Identifier:',
    splitpanesGroupIdentifier,
  )

  let effectivePaneConfigs = []
  const presetConfig = currentPresetConfig.value

  if (presetConfig) {
    if (splitpanesGroupIdentifier === 'l-shape-root') {
      effectivePaneConfigs = presetConfig.panes // L-Shape 루트 splitpanes의 설정
      console.log(
        '[DashboardRenderer L-Shape] Event identified as l-shape-root. Using presetConfig.panes. Count:',
        effectivePaneConfigs.length,
      )
    } else if (splitpanesGroupIdentifier === 'l-shape-nested') {
      if (presetConfig.panes[1]?.isContainer && presetConfig.panes[1]?.nestedConfig?.panes) {
        effectivePaneConfigs = presetConfig.panes[1].nestedConfig.panes
        console.log(
          '[DashboardRenderer L-Shape] Event identified as l-shape-nested. Using nestedConfig.panes. Count:',
          effectivePaneConfigs.length,
        )
      } else {
        console.error(
          '[DashboardRenderer L-Shape] Event identified as l-shape-nested, but nested config not found!',
        )
        return // 또는 오류 처리
      }
    } else if (splitpanesGroupIdentifier === 'root-normal') {
      // 일반 (비중첩) 프리셋
      effectivePaneConfigs = presetConfig.panes
      console.log(
        '[DashboardRenderer Non-L-Shape] Event identified as root-normal. Using presetConfig.panes. Count:',
        effectivePaneConfigs.length,
      )
    } else {
      // 식별자가 없거나 예상치 못한 경우 (폴백 로직 또는 오류 처리)
      console.warn(
        '[DashboardRenderer] Unknown or missing splitpanesGroupIdentifier:',
        splitpanesGroupIdentifier,
        'Attempting to infer based on pane count for preset:',
        dashboardLayoutStore.activePreset,
      )
      // 기존의 길이 기반 추론 로직을 폴백으로 사용할 수 있으나, 식별자를 사용하는 것이 더 정확함.
      // 현재는 식별자 기반으로만 처리하고, 문제가 지속되면 이 부분을 강화해야 함.
      if (dashboardLayoutStore.activePreset === 'l-shape') {
        // L-Shape인데 식별자가 없다면, 길이로 한번 더 추론 시도 (최후의 수단)
        const lShapeRootPanesConfig = presetConfig.panes
        const lShapeNestedPanesConfig =
          presetConfig.panes[1]?.isContainer && presetConfig.panes[1]?.nestedConfig?.panes
            ? presetConfig.panes[1].nestedConfig.panes
            : []
        if (actualPanesArray.length === lShapeRootPanesConfig.length) {
          effectivePaneConfigs = lShapeRootPanesConfig
        } else if (
          lShapeNestedPanesConfig.length > 0 &&
          actualPanesArray.length === lShapeNestedPanesConfig.length
        ) {
          effectivePaneConfigs = lShapeNestedPanesConfig
        }
        console.log(
          '[DashboardRenderer L-Shape Fallback] Inferred effectivePaneConfigs count:',
          effectivePaneConfigs.length,
        )
      } else {
        effectivePaneConfigs = presetConfig.panes // 일반 프리셋으로 가정
        console.log(
          '[DashboardRenderer Fallback] Assuming general preset. EffectivePaneConfigs count:',
          effectivePaneConfigs.length,
        )
      }
    }
  } else {
    console.error('[DashboardRenderer] CRITICAL: currentPresetConfig.value is null or undefined.')
    return
  }

  if (!effectivePaneConfigs || effectivePaneConfigs.length === 0) {
    console.error(
      '[DashboardRenderer] CRITICAL: effectivePaneConfigs is empty or undefined after attempting to determine configuration.',
      'Preset was:',
      dashboardLayoutStore.activePreset,
    )
    return
  }

  // 최종 길이 검사: 이벤트에서 온 pane 수와 매칭된 설정의 pane 수가 일치하는지 확인
  if (actualPanesArray.length !== effectivePaneConfigs.length) {
    console.warn(
      '[DashboardRenderer] Length Mismatch after config determination!',
      'actualPanesArray length:',
      actualPanesArray.length,
      'effectivePaneConfigs length:',
      effectivePaneConfigs.length,
      'This will likely lead to incorrect ID mapping. Review L-Shape logic or preset definitions.',
      'ActualPanesArray:',
      JSON.parse(JSON.stringify(actualPanesArray)),
      'EffectivePaneConfigs:',
      JSON.parse(JSON.stringify(effectivePaneConfigs)),
    )
    // 길이가 다르면 여기서 중단하는 것이 안전할 수 있습니다.
    // return; // 필요하다면 활성화
  }

  const newSizes = []
  let allPanesProcessedSuccessfully = true

  actualPanesArray.forEach((paneInfo, index) => {
    console.log(
      `[DashboardRenderer] Processing paneInfo at index ${index}:`,
      JSON.parse(JSON.stringify(paneInfo || {})),
    )

    if (index < effectivePaneConfigs.length) {
      const paneConfig = effectivePaneConfigs[index]
      const paneId = paneConfig.id

      if (paneId && typeof paneInfo.size === 'number') {
        newSizes.push({ id: String(paneId), size: paneInfo.size })
        console.log(
          `[DashboardRenderer] VALID pane resize info (using index ${index} for ID): id=${paneId}, size=${paneInfo.size}`,
        )
      } else {
        allPanesProcessedSuccessfully = false
        console.warn(
          '[DashboardRenderer] INVALID or INCOMPLETE pane info at index ' + index + '.', // 수정된 부분
          'Mapped ID:',
          paneId,
          'PaneInfo from event:',
          JSON.parse(JSON.stringify(paneInfo || {})),
          'Size from event:',
          paneInfo?.size,
          'Corresponding paneConfig:',
          JSON.parse(JSON.stringify(paneConfig || {})),
        )
      }
    } else {
      allPanesProcessedSuccessfully = false
      console.warn(
        '[DashboardRenderer] Index ' +
          index +
          ' is out of bounds for effectivePaneConfigs (length: ' +
          effectivePaneConfigs.length +
          '). Skipping this paneInfo:', // 수정된 부분
        JSON.parse(JSON.stringify(paneInfo || {})),
      )
    }
  })

  if (newSizes.length > 0) {
    console.log(
      '[DashboardRenderer] Attempting to call dashboardLayoutStore.updatePaneSizes with newSizes:',
      JSON.parse(JSON.stringify(newSizes)),
    )
    if (!allPanesProcessedSuccessfully) {
      console.warn(
        '[DashboardRenderer] Note: updatePaneSizes is being called, but not all pane info from the event was processed successfully or mapped to an ID. This might lead to partial updates or unexpected behavior.',
      )
    }
    const uniqueIdsInNewSizes = new Set(newSizes.map((s) => s.id))
    if (uniqueIdsInNewSizes.size !== newSizes.length) {
      console.error(
        '[DashboardRenderer] CRITICAL: Duplicate IDs found in newSizes before calling updatePaneSizes. This should not happen if effectivePaneConfigs mapping is correct.',
        newSizes,
      )
    }
    dashboardLayoutStore.updatePaneSizes(newSizes)
  } else {
    console.warn(
      '[DashboardRenderer] NO valid data was constructed to update pane sizes. newSizes array is empty. dashboardLayoutStore.updatePaneSizes will NOT be called. Review previous logs.',
    )
  }
}

const handleLayoutUpdate = debounce((newLayout, paneId) => {
  console.log(
    `[DashboardRenderer] Layout updated for pane ${paneId}. Requesting save. Layout data (may be already reflected in store via v-model):`,
    JSON.parse(JSON.stringify(newLayout)),
  )
  // v-model:layout이 이미 dashboardLayoutStore.panes[paneId].nexaPanels를 직접 업데이트했을 것이므로,
  // 여기서는 변경된 전체 레이아웃 상태를 저장하도록 요청합니다.
  dashboardLayoutStore.requestSaveLayout()
}, 300)

function handleGridItemResized(paneIdForItem, i, newH, newW, newHPx, newWPx) {
  console.log(
    `[DashboardRenderer] Item Resized in pane ${paneIdForItem}: Item ${i}, H:${newH}, W:${newW}, HPx:${newHPx}, WPx:${newWPx}`,
  )
  // 실제 레이아웃 업데이트는 v-model:layout과 handleLayoutUpdate를 통해 처리됨
  // 이 함수는 개별 resize 이벤트에 대한 추가 작업이 필요할 경우 사용
}

function handleGridItemMoved(paneIdForItem, i, newX, newY) {
  console.log(
    `[DashboardRenderer] Item Moved in pane ${paneIdForItem}: Item ${i}, X:${newX}, Y:${newY}`,
  )
  // 실제 레이아웃 업데이트는 v-model:layout과 handleLayoutUpdate를 통해 처리됨
  // 이 함수는 개별 move 이벤트에 대한 추가 작업이 필요할 경우 사용
}

function handleItemDragStart(panelId_i) {
  console.log('[DashboardRenderer] Item Drag Start:', panelId_i)
  isDraggingEnabled.value = true
  const panel = findPanelInAnyPane(panelId_i)
  if (panel.item) {
      draggingItem.value = { ...panel.item, title: panel.item.title || '패널' }
  }
}

function handleItemDragEnd(panelId_i) {
  console.log('[DashboardRenderer] Item Drag End:', panelId_i)
  if (draggingItem.value) {
    draggingItem.value = null
  }
}

function findPanelInAnyPane(panelId_i) {
  for (const paneId of Object.keys(dashboardLayoutStore.panes)) {
    const panel = dashboardLayoutStore.panes[paneId]?.find((p) => p.i === panelId_i)
    if (panel) return { paneId, item: panel }
  }
  return { paneId: null, item: null }
}

function openAddNexaPanelDialog(paneId) {
  console.log('[DashboardRenderer] openAddNexaPanelDialog called for paneId:', paneId)
  currentPaneIdForAddingWidget.value = paneId
  showAddNexaPanelDialog.value = true
  console.log('[DashboardRenderer] showAddNexaPanelDialog is now:', showAddNexaPanelDialog.value)
}

function handleNexaPanelAddedFromDialog(widgetData) {
  console.log(
    '[DashboardRenderer] handleNexaPanelAddedFromDialog called with widgetData:',
    JSON.parse(JSON.stringify(widgetData || null)),
  )
  console.log(
    '[DashboardRenderer] currentPaneIdForAddingWidget:',
    currentPaneIdForAddingWidget.value,
  )

  if (currentPaneIdForAddingWidget.value) {
    const newPanelData = {
      ...widgetData,
      id: dashboardLayoutStore.getNextPanelId(),
    }
    newPanelData.i = newPanelData.id // i는 id와 동일하게

    console.log(
      '[DashboardRenderer] Preparing to add panel to store. Pane ID:',
      currentPaneIdForAddingWidget.value,
      'Panel Data:',
      JSON.parse(JSON.stringify(newPanelData)),
    )
    dashboardLayoutStore.addPanelToPane(currentPaneIdForAddingWidget.value, newPanelData)
    console.log('[DashboardRenderer] Panel presumably added to store.')
  } else {
    console.warn(
      '[DashboardRenderer] handleNexaPanelAddedFromDialog called but currentPaneIdForAddingWidget is null.',
    )
  }
  showAddNexaPanelDialog.value = false
  currentPaneIdForAddingWidget.value = null
}

function requestMovePanelDialog(currentPaneId, panel_i_Value) {
  const panelInfo = dashboardLayoutStore.panes[currentPaneId]?.find((p) => p.i === panel_i_Value)
  if (panelInfo) {
    panelToMove.value = {
      currentPaneId: currentPaneId,
      panelId: panel_i_Value,
      title: panelInfo.title,
    }
    showMovePanelDialog.value = true
  } else {
    console.warn('[DashboardRenderer] Panel not found for move:', currentPaneId, panel_i_Value)
  }
}

function movePanelToPane(targetPaneId) {
  if (panelToMove.value && panelToMove.value.panelId && targetPaneId) {
    const { currentPaneId, panelId } = panelToMove.value
    const panelData = dashboardLayoutStore.panes[currentPaneId]?.find((p) => p.i === panelId)

    if (panelData) {
      dashboardLayoutStore.removePanelFromPane(currentPaneId, panelId)
      dashboardLayoutStore.addPanelToPane(targetPaneId, { ...panelData, x: 0, y: 0 })

      $q.notify({
        type: 'positive',
        message: `'${panelData.title}' 패널이 이동되었습니다.`,
        icon: 'move_to_inbox',
      })
    } else {
      $q.notify({
        type: 'negative',
        message: '패널 이동 중 오류 발생: 원본 패널을 찾을 수 없습니다.',
      })
    }
  } else {
    $q.notify({ type: 'negative', message: '패널 이동 중 오류 발생: 정보 부족.' })
  }
  showMovePanelDialog.value = false
  panelToMove.value = null
}

function showFeatureNotReadyAlert(featureName) {
  $q.notify({
    color: 'orange',
    textColor: 'white',
    icon: 'warning',
    message: `${featureName} 기능은 현재 개발 중입니다.`,
    position: 'top',
    timeout: 2000,
  })
}
</script>

<style lang="scss">
.splitpanes.default-theme .splitpanes__pane {
  background-color: transparent;
}

.splitpanes.default-theme .splitpanes__splitter {
  background-color: var(--nexa-color-grey-8);
  box-sizing: border-box;
  &:hover {
    background-color: var(--nexa-primary);
  }
}

/* 수직 분할 (좌우) 시 구분선 */
.splitpanes.default-theme.splitpanes--vertical > .splitpanes__splitter {
  border-left: 1px solid var(--nexa-color-grey-9);
  border-right: 1px solid var(--nexa-color-grey-9);
  min-width: 7px;
}

/* 수평 분할 (상하) 시 구분선 */
.splitpanes.default-theme.splitpanes--horizontal > .splitpanes__splitter {
  border-top: 1px solid var(--nexa-color-grey-9);
  border-bottom: 1px solid var(--nexa-color-grey-9);
  min-height: 7px;
}

.pane-container {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: var(--nexa-background) !important;
}

.is-selected-pane {
  box-shadow: inset 0 1px 0 0 var(--nexa-accent);
}

.pane-menu-button {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 10;
}

.grid-layout-container {
  width: 100%;
  height: 100%;
}

.grid-item-card {
  overflow: hidden;
  touch-action: none;

  &.vue-grid-item > .vue-resizable-handle {
    background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" width="10" height="10"%3e%3cpath d="M 0 10 L 10 0 L 10 2 L 2 10 z M 6 10 L 10 6 L 10 8 L 8 10 z M 8 10 L 10 8 L 10 10 z" fill="rgba(255,255,255,0.5)"/%3e%3c/svg%3e');
    background-position: bottom right;
    padding: 0 3px 3px 0;
    background-repeat: no-repeat;
    background-origin: content-box;
    box-sizing: border-box;
    cursor: se-resize;
  }
  &.vue-grid-item.cssTransforms {
    transition-property: transform;
  }
}

.bg-custom-dark-card {
  background-color: var(--nexa-surface) !important;
}

.pane-nexa-panel-header {
  cursor: move;
  user-select: none;
  background-color: var(--nexa-panel-header) !important;
}

.dragging-ghost-item {
  position: absolute;
  background-color: rgba(var(--nexa-color-primary-rgb), 0.7);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  z-index: 10000;
  pointer-events: none;
  white-space: nowrap;
}

.scroll {
  overflow-y: auto;
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}
</style>
