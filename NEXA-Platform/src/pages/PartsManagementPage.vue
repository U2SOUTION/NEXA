<template>
  <q-page class="parts-management-page">
    <!-- 현재 시간 및 날짜 표시 (상단) -->
    <div v-if="sidebarMode === null" class="api-data-area">
      <section class="title-area">
        <div class="title-text">U2 SOLUTION</div>
        <div class="subtitle-text">NEXA GRID SYSTEM</div>
        <div class="subtitle-text">LOGISTICS INFORMATION MANAGEMENT</div>
        <div class="subtitle-text">INNOVATION FOR CONNECTED FUTURE</div>
        <div class="subtitle-text">SMART IoT PLATFORM</div>
        <div class="subtitle-text">YOUR DATA, YOUR INSIGHT</div>
        <div class="subtitle-text">CONNECT. VISUALIZE. CONTROL.</div>
      </section>
      <div class="datetime-display">
        <NexaBlock type="time" variant="main" />
      </div>
      <!-- 앞으로 API Data 관련 요소가 추가될 예정 -->
    </div>

    <!-- 부품 관리 메인 대시보드 (초기 상태 또는 물리 공간에 공간이 없을 때) -->
    <PartsManagementDashboard v-if="sidebarMode === null || (sidebarMode === 'physical' && !hasSpaces)" />

    <!-- 물리 공간 모드 (공간이 있을 때) -->
    <StorageBlockGrid v-else-if="sidebarMode === 'physical' && hasSpaces" />

    <!-- 부품 데이터 모드 -->
    <div v-else-if="sidebarMode === 'parts-data'" class="parts-data-view">
      <!-- 부품 데이터 메인 대시보드 (하위 메뉴 선택 전) -->
      <PartsDataDashboard v-if="selectedPartsDataView === null" />

      <!-- 부품 데이터 상세 뷰 (하위 메뉴 선택 후) -->
      <PartClassesView v-else-if="selectedPartsDataView === 'part-classes'" />
      <PartModelsView v-else-if="selectedPartsDataView === 'part-models'" />
      <PartSpecsView v-else-if="selectedPartsDataView === 'part-specs'" />
      <PartClassesTrashView v-else-if="selectedPartsDataView === 'part-classes-trash'" />
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import PartsManagementDashboard from 'src/components/parts-management/PartsManagementDashboard.vue'
import PartsDataDashboard from 'src/components/parts-management/PartsDataDashboard.vue'
import StorageBlockGrid from 'src/components/parts-management/StorageBlockGrid.vue'
import PartClassesView from 'src/components/parts-management/PartClassesView.vue'
import PartModelsView from 'src/components/parts-management/PartModelsView.vue'
import PartSpecsView from 'src/components/parts-management/PartSpecsView.vue'
import PartClassesTrashView from 'src/components/parts-management/PartClassesTrashView.vue'
import NexaBlock from 'src/block/NexaBlock.vue'
import { usePartsManagementStore } from 'src/stores/partsManagementStore'
import { useURLStateManagement } from 'src/composables/url-state'
import { getDefaultShareView, getURLStateParamName } from 'src/config/url-state'

const route = useRoute()
const partsStore = usePartsManagementStore()
const sidebarMode = computed(() => partsStore.sidebarMode)
const selectedPartsDataView = computed(() => partsStore.selectedPartsDataView)
const hasSpaces = computed(() => partsStore.getRootNodes.length > 0)

const viewParam = 'v'

const sidebarModeForURL = computed({
  get: () => partsStore.sidebarMode,
  set: (value) => partsStore.setSidebarMode(value),
})

const { processDeepLink } = useURLStateManagement({
  stateMap: {
    [viewParam]: computed({
      get: () => partsStore.selectedPartsDataView,
      set: (value) => partsStore.setSelectedPartsDataView(value),
    }),
    mode: computed({
      get: () => {
        const mode = sidebarModeForURL.value
        return mode === 'parts-data' ? null : mode
      },
      set: (value) => {
        sidebarModeForURL.value = value || 'parts-data'
      },
    }),
  },
  deepLink: {
    onDeepLink: ({ view }) => {
      partsStore.setSidebarMode('parts-data')
      partsStore.setSelectedPartsDataView(view)
    },
    onDefaultInit: () => {
      if (partsStore.sidebarMode !== null) {
        partsStore.setSidebarMode(null)
      }
    },
    defaultView: getDefaultShareView(),
  },
})

onMounted(() => {
  nextTick(() => {
    processDeepLink()
  })
})

watch(
  () => route.query,
  (newQuery, oldQuery) => {
    if (!oldQuery) return

    const selectedParam = getURLStateParamName('selected')
    const viewParam = getURLStateParamName('view')
    const searchParam = getURLStateParamName('search')
    const categoryParam = getURLStateParamName('category')
    const statusParam = getURLStateParamName('status')

    const hasSharedParamChange = newQuery[selectedParam] !== oldQuery?.[selectedParam] || newQuery[searchParam] !== oldQuery?.[searchParam] || newQuery[categoryParam] !== oldQuery?.[categoryParam] || newQuery[statusParam] !== oldQuery?.[statusParam]

    const viewChanged = newQuery[viewParam] !== oldQuery?.[viewParam]
    const hasRelevantChange = hasSharedParamChange || (viewChanged && hasSharedParamChange)

    if (hasRelevantChange) {
      nextTick(() => processDeepLink())
    }
  },
  { deep: true },
)
</script>

<style lang="scss" scoped>
// CSS 변수를 사용하여 테마 색상 중앙 관리 (light.scss, dark.scss)

.parts-management-page {
  height: 100%;
  overflow: hidden;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.title-area {
  margin-top: 20px;
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.title-text {
  font-size: clamp(3rem, 5vw, 10rem);
  font-weight: 900;
  color: var(--nexa-background-upper, rgba(0, 0, 0, 0.87));
  font-family: 'Impact', 'Arial Black', 'Roboto Black', sans-serif;
  letter-spacing: 3px;
}

.subtitle-text {
  font-size: 1rem;
  font-weight: 400;
  color: var(--nexa-text-secondary, rgba(0, 0, 0, 0.6));
}

.datetime-display {
  text-align: left;
}

.parts-data-view {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
