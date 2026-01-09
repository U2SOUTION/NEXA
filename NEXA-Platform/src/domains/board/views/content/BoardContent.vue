<template>
  <div class="board-content" style="flex-grow: 1; display: flex; flex-direction: column">
    <div
      v-if="selectedDashboardNode"
      class="q-pa-xs"
      style="flex-grow: 1; display: flex; flex-direction: column"
    >
      <div
        v-if="selectedDashboardNode.type === 'board'"
        style="flex-grow: 1; display: flex; flex-direction: column"
      >
        <NexaBoardSetup
          v-if="!selectedDashboardNode.isLayoutConfigured || !selectedDashboardNode.dashboardPreset"
          :isOpen="true"
          :boardName="selectedDashboardNode.name"
          :devices="selectedDashboardNode.devices || []"
          :nexaPanels="selectedDashboardNode.nexaPanelList || []"
        />
        <div
          v-else
          class="dashboard-display-area-container"
          style="height: 100%; display: flex; flex-direction: column; flex-grow: 1"
        >
          <NexaDashboardRenderer style="flex-grow: 1; min-height: 0" />
        </div>
      </div>

      <div
        v-else-if="selectedDashboardNode.type === 'group'"
        class="flex column flex-center text-center full-height q-pa-md"
      >
        <!-- 그룹 뷰 내용 (기존 NexaBoardPage.vue에서 가져옴) -->
        <div class="text-h4 q-mb-xs">
          <q-icon name="folder_shared" class="q-mr-sm" />
          그룹: {{ selectedDashboardNode.name }}
        </div>
        <!-- ... 생략된 그룹 통계 및 리스트 로직 ... -->
        <div class="text-grey-7">그룹 상세 정보 및 하위 보드 목록이 여기에 표시됩니다.</div>
      </div>
    </div>
    <div v-else class="q-pa-xs" style="flex-grow: 1; display: flex; flex-direction: column">
      <div class="dashboard-display-area-container" style="height: 100%; display: flex; flex-direction: column; flex-grow: 1">
        <NexaDashboardRenderer style="flex-grow: 1; min-height: 0" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDashboardLayoutStore } from '@system/store/dashboardLayoutStore'
import NexaDashboardRenderer from '../../components/NexaDashboardRenderer.vue'
import NexaBoardSetup from '../../components/NexaBoardSetup.vue'

const dashboardLayoutStore = useDashboardLayoutStore()
const selectedDashboardNode = computed(() => dashboardLayoutStore.selectedNodeForDashboard)
</script>

<style lang="scss" scoped>
.board-content {
  height: 100%;
}
</style>
