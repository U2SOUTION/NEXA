<template>
  <div class="nexel-sidebar">
    <div class="text-h4 text-bold text-primary sidebar-title" role="button" @click="handleHeaderClick">NEXA NEXEL</div>

    <q-input v-model="searchQuery" dense filled placeholder="검색어 입력..." class="q-mt-sm" bg-color="black">
      <template v-slot:append><q-icon name="search" size="xs" /></template>
    </q-input>

    <div class="q-mb-md node-sidebar-buttons">
      <q-btn outline icon="add" label="New" class="btn-action" @click="handleNewCanvas" />
      <q-btn outline icon="folder" label="Open" class="btn-action" />
      <q-btn outline icon="save" label="Save" class="btn-action" />
      <q-btn-dropdown outline icon="more" label="More" class="btn-action">
        <q-list dense>
          <q-item clickable v-close-popup @click="exportCanvas">
            <q-item-section avatar><q-icon name="download" /></q-item-section>
            <q-item-section>내보내기 (Export)</q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="printCanvas">
            <q-item-section avatar><q-icon name="print" /></q-item-section>
            <q-item-section>프린트 (Print)</q-item-section>
          </q-item>
          <q-separator />
          <q-item clickable v-close-popup class="text-negative">
            <q-item-section avatar><q-icon name="close" /></q-item-section>
            <q-item-section>캔버스 닫기</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </div>

    <div class="tmp-developer-mode">
      <q-btn outline icon="terminal" label="시물레이터" class="full-width btn-action tmp-developer-mode-btn" @click="nexNodeStore.openSimulator()" />
    </div>

    <div class="device-accordion q-mt-sm">
      <q-expansion-item label="연결된 장비" icon="memory" default-opened>
        <div v-if="devices.length === 0" class="no-device">
          <div class="text-caption text-grey-6">등록된 장비가 없습니다.</div>
          <q-btn flat dense label="장비 등록" color="primary" class="full-width" @click="handleRegisterClick" />
        </div>
        <div v-else class="device-list">
          <div v-for="device in devices" :key="device.id" class="device-item" :class="{ 'device-active': nexNodeStore.isDeviceSelected(device.id) }" @click="() => nexNodeStore.toggleDeviceSelection(device.id)">
            <div class="row items-center justify-between">
              <div>
                <div class="text-caption text-bold">{{ device.name }}</div>
                <div class="text-caption text-grey-6">{{ device.type }}</div>
              </div>
              <q-badge :color="device.status === 'online' ? 'green-6' : 'grey-6'" outline>{{ device.status }}</q-badge>
            </div>
          </div>
          <q-btn flat dense label="장비 등록" color="primary" class="full-width addDeviceBtn" @click="handleRegisterClick" />
        </div>
      </q-expansion-item>
    </div>

    <div class="tabs-container">
      <q-tabs v-model="resourceTab" dense active-color="primary" indicator-color="primary" align="justify">
        <q-tab name="nodes" label="Nodes" icon="hub" />
        <q-tab name="panels" label="Panels" icon="dashboard" />
        <q-tab name="compositions" label="Composition" icon="auto_awesome" />
      </q-tabs>

      <q-tab-panels v-model="resourceTab" animated class="bg-transparent tab-panels-content">
        <q-tab-panel name="nodes" class="q-pa-none">
          <q-expansion-item v-for="group in nodeGroups" :key="group.name" :label="group.name" :icon="group.icon" default-opened header-class="text-bold">
            <div class="row q-pa-xs">
              <div v-for="node in group.items" :key="node.id" class="col-6 q-pa-xs">
                <div class="resource-item draggable text-center q-pa-sm" draggable="true" @dragstart="handleDrag($event, 'node', node)">
                  <q-icon :name="node.icon" :color="node.color" size="sm" />
                  <div class="text-caption q-mt-xs">{{ node.name }}</div>
                </div>
              </div>
            </div>
          </q-expansion-item>
        </q-tab-panel>

        <q-tab-panel name="panels" class="q-pa-none">
          <q-expansion-item label="Visualizers" icon="visibility" default-opened header-class="text-bold">
            <div class="row q-pa-xs">
              <div v-for="n in 4" :key="n" class="col-6 q-pa-xs">
                <div class="resource-item draggable text-center q-pa-sm" draggable="true">
                  <q-icon name="analytics" color="green" size="sm" />
                  <div class="text-caption q-mt-xs">Gauge {{ n }}</div>
                </div>
              </div>
            </div>
          </q-expansion-item>
        </q-tab-panel>

        <q-tab-panel name="compositions" class="q-pa-none">
          <q-expansion-item v-for="group in compositionGroups" :key="group.name" :label="group.name" :icon="group.icon" default-opened header-class="text-bold">
            <div class="q-pa-xs">
              <div v-for="comp in group.items" :key="comp.id" class="comp-item q-mb-sm q-pa-sm" @click="loadComposition(comp)">
                <div class="row items-center no-wrap">
                  <q-icon :name="comp.icon" color="primary" size="xs" class="q-mr-sm" />
                  <div class="text-caption text-bold">{{ comp.name }}</div>
                </div>
                <div class="text-grey-7" style="font-size: 0.6rem">{{ comp.desc }}</div>
              </div>
            </div>
          </q-expansion-item>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getDeviceCatalog, useNexaNodeStore } from '@system/store/nexaNodeStore'

const resourceTab = ref('nodes')
const searchQuery = ref('')
const nexNodeStore = useNexaNodeStore()
const devices = getDeviceCatalog()

const handleNewCanvas = () => nexNodeStore.createDefaultBlueprint()
const handleHeaderClick = () => nexNodeStore.resetBlueprint()

const nodeGroups = [
  {
    name: 'Trigger',
    icon: 'bolt',
    items: [
      { id: 't1', name: 'Timer', icon: 'timer', color: 'orange' },
      { id: 't2', name: 'Sensor', icon: 'sensors', color: 'orange' },
    ],
  },
  {
    name: 'Logic/Math',
    icon: 'calculate',
    items: [
      { id: 'l1', name: 'Adder', icon: 'add_circle', color: 'blue' },
      { id: 'l2', name: 'If-Else', icon: 'alt_route', color: 'blue' },
    ],
  },
]

// ✨ Composition 데이터 정의
const compositionGroups = [
  {
    name: 'Basic Templates',
    icon: 'star',
    items: [
      { id: 'c1', name: 'Blank Logic', desc: '초기화된 빈 캔버스', icon: 'crop_square' },
      { id: 'c2', name: 'Data Logger', desc: '데이터 수집 표준 구조', icon: 'history' },
    ],
  },
  {
    name: 'Industrial Logic',
    icon: 'precision_manufacturing',
    items: [{ id: 'c3', name: 'Conveyor Control', desc: '물류 벨트 제어 알고리즘', icon: 'settings_input_component' }],
  },
]

const handleRegisterClick = () => {
  console.log('장비 등록 UI') // placeholder for future modal
}

const handleDrag = (event, type, item) => {
  event.dataTransfer.setData('resourceType', type)
  event.dataTransfer.setData('itemData', JSON.stringify(item))
  window.dispatchEvent(new CustomEvent('nexel-helper-hide'))
}

const loadComposition = (comp) => console.log('로드:', comp.name)
const exportCanvas = () => console.log('내보내기')
const printCanvas = () => console.log('프린트')
</script>

<style scoped>
.nexel-sidebar {
  padding: 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.node-sidebar-buttons {
  margin-top: 10px;
  gap: 3px;
  display: flex;
}

.node-sidebar-buttons > * {
  flex: 1;
  min-width: 0;
}

.device-accordion {
  margin-top: 2px;
}

.device-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 3px;
}

.device-item {
  padding: 6px 8px;
  border: 1px solid var(--nexa-border-color);
  border-radius: 6px;
  background: var(--nexa-surface);
}

.device-item.device-active {
  border-color: var(--nexa-success);
  background: rgba(40, 167, 69, 0.12);
}

.no-addDeviceBtn {
  padding: 3px;
  display: flex;
  flex-direction: column;
}

.tabs-container {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--nexa-border-color);
}

.tab-panels-content {
  padding: 10px;
  overflow-y: auto;
  flex: 1;
  border-top: 1px solid var(--nexa-border-color);
}

.resource-item,
.comp-item {
  background: var(--nexa-surface);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.resource-item:hover,
.comp-item:hover {
  background: var(--nexa-item-hover-bg);
  transform: translateY(-2px);
}

.btn-action {
  font-size: 0.7rem;
}

.sidebar-title {
  cursor: pointer;
}
</style>
