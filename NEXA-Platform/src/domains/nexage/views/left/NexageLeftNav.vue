<!-- NexaBoardSidebar.vue
  NEXA BOARD 메뉴 선택 시 표시되는 왼쪽 사이드바
  보드 계층 구조 네비게이션 제공
-->

<template>
  <q-list @click="handleBoardListClick">
    <StandardLeftHeader title="BOARD" subtitle="NEXA GRID SYSTEM" icon="dashboard" @title-click="goToHome" />

    <div class="q-pa-sm">
      <q-btn flat dense @click="addDevice" class="btn-nexa-primary q-mb-xs text-bold full-width q-py-xs">
        <template v-slot:default>
          <div class="full-width row items-center justify-center">
            <q-icon name="devices_other" class="q-mr-sm" />
            <span class="text-uppercase">ADD DEVICE</span>
          </div>
        </template>
      </q-btn>
      <q-btn flat dense @click="handleBoardModeToggle" class="btn-nexa-secondary q-mb-xs text-bold full-width q-mx-none q-py-xs">
        <template v-slot:default>
          <div class="full-width row items-center justify-center">
            <q-icon :name="currentViewMode === 'boardManagement' ? 'arrow_back' : 'dashboard_customize'" class="q-mr-sm" />
            <span class="text-uppercase">
              {{ currentViewMode === 'boardManagement' ? 'EXIT BOARD EDIT' : 'BOARD EDIT' }}
            </span>
          </div>
        </template>
      </q-btn>
    </div>

    <div v-if="hasBoards">
      <tree-nav-item v-for="rootNodeInLayout in rootBoardNodes" :key="rootNodeInLayout.id" :node="rootNodeInLayout" :level="0" :highlighted-node-id-from-layout="props.highlightedNodeId" />
    </div>

    <q-item v-if="!hasBoards">
      <q-item-section class="text-grey text-caption text-center q-pa-md">
        등록된 보드가 없습니다.
        <br />'BOARD EDIT'에서<br />
        새 보드/폴더를 만드세요.
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import StandardLeftHeader from '@frame/layout/components/StandardLeftHeader.vue'
import { useDashboardLayoutStore } from '@system/store/dashboardLayoutStore'
import { useBoardMenuStore } from '@system/store/boardMenuStore'
import { useBoardEditorStore } from '@system/store/boardEditorStore'
import TreeNavItem from '@system/components/ui/TreeNavItem.vue'

const router = useRouter()
const dashboardLayoutStore = useDashboardLayoutStore()
const boardMenuStore = useBoardMenuStore()
const boardEditorStore = useBoardEditorStore()

const currentViewMode = computed(() => dashboardLayoutStore.currentViewMode)
const rootBoardNodes = computed(() => boardMenuStore.getRootNodes)
const hasBoards = computed(() => rootBoardNodes.value && rootBoardNodes.value.length > 0)

// highlightedNodeId는 props로 받음
const props = defineProps({
  highlightedNodeId: {
    type: [String, Number],
    default: null,
  },
})

function goToHome() {
  dashboardLayoutStore.setCurrentViewMode('dashboard')
  dashboardLayoutStore.setSelectedNodeIdForEditor(null)
  dashboardLayoutStore.setSelectedNodeForDashboard(null)
  if (router.currentRoute.value.path !== '/') {
    router.push('/')
  }
}

function addDevice() {
  dashboardLayoutStore.setCurrentViewMode('dashboard')
  dashboardLayoutStore.setSelectedNodeIdForEditor(null)
  dashboardLayoutStore.setSelectedNodeForDashboard(null)
  router.push('/nexage/add-device')
}

function handleBoardModeToggle() {
  const newMode = dashboardLayoutStore.currentViewMode === 'boardManagement' ? 'dashboard' : 'boardManagement'
  dashboardLayoutStore.setCurrentViewMode(newMode)

  if (newMode === 'boardManagement') {
    boardEditorStore.clearDrawerSelectionForAdmin()
    if (router.currentRoute.value.path !== '/nexage/admin') {
      router.push('/nexage/admin')
    }
  } else {
    if (router.currentRoute.value.path === '/nexage/admin') {
      router.push('/nexage')
    }
  }
}

function handleBoardListClick() {
  // 현재 특별한 동작 없음
}
</script>
