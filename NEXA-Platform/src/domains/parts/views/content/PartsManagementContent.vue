<template>
  <div class="parts-management-content">
    <!-- 부품 관리 메인 대시보드 (초기 상태 또는 물리 공간에 공간이 없을 때) -->
    <PartsManagementDashboard v-if="sidebarMode === null || (sidebarMode === 'physical' && !hasSpaces)" />

    <!-- 물리 공간 모드 (공간이 있을 때) -->
    <StorageBlockGrid v-else-if="sidebarMode === 'physical' && hasSpaces" />

    <!-- 부품 데이터 모드 -->
    <div v-else-if="sidebarMode === 'parts-data'" class="parts-data-view">
      <PartsDataDashboard v-if="selectedPartsDataView === null" />
      <PartClassesView v-else-if="selectedPartsDataView === 'part-classes'" />
      <PartModelsView v-else-if="selectedPartsDataView === 'part-models'" />
      <PartSpecsView v-else-if="selectedPartsDataView === 'part-specs'" />
      <PartClassesTrashView v-else-if="selectedPartsDataView === 'part-classes-trash'" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePartsManagementStore } from '@system/store/partsManagementStore'
import PartsManagementDashboard from '../../components/PartsManagementDashboard.vue'
import PartsDataDashboard from '../../components/PartsDataDashboard.vue'
import StorageBlockGrid from '../../components/StorageBlockGrid.vue'
import PartClassesView from '../../components/PartClassesView.vue'
import PartModelsView from '../../components/PartModelsView.vue'
import PartSpecsView from '../../components/PartSpecsView.vue'
import PartClassesTrashView from '../../components/PartClassesTrashView.vue'

const partsStore = usePartsManagementStore()
const sidebarMode = computed(() => partsStore.sidebarMode)
const selectedPartsDataView = computed(() => partsStore.selectedPartsDataView)
const hasSpaces = computed(() => partsStore.getRootNodes.length > 0)
</script>

<style lang="scss" scoped>
.parts-management-content {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.parts-data-view {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
