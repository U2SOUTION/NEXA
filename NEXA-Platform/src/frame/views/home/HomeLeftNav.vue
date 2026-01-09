<!-- HomeSidebar.vue
  홈 페이지 왼쪽 사이드바
  빠른 접근 및 최근 보드 목록
-->

<template>
  <div class="home-sidebar">
    <q-list>
      <!-- 헤더 -->
      <div class="sidebar-header q-pa-md">
        <div class="text-h4 text-primary q-mb-xs text-bold">HOME</div>
        <div class="text-caption text-grey-7">NEXA Platform 대시보드</div>
      </div>

      <q-separator />

      <!-- 빠른 접근 -->
      <div class="q-pa-sm">
        <div class="text-subtitle2 text-bold q-mb-sm q-px-sm">빠른 접근</div>
        <q-btn flat dense @click="goToNexaBoard" class="btn-nexa-primary q-mb-xs text-bold full-width q-py-xs">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="dashboard_customize" class="q-mr-sm" />
              <span>NEXA BOARD</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="goToPartsManagement" class="btn-nexa-primary q-mb-xs text-bold full-width q-py-xs">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="inventory_2" class="q-mr-sm" />
              <span>부품관리</span>
            </div>
          </template>
        </q-btn>
        <q-btn flat dense @click="goToAddDevice" class="btn-nexa-primary text-bold full-width q-py-xs">
          <template v-slot:default>
            <div class="full-width row items-center justify-center">
              <q-icon name="devices_other" class="q-mr-sm" />
              <span>디바이스 추가</span>
            </div>
          </template>
        </q-btn>
      </div>

      <q-separator />

      <!-- 최근 보드 -->
      <div class="q-pa-sm">
        <div class="text-subtitle2 text-bold q-mb-sm q-px-sm">최근 보드</div>
        <q-list>
          <q-item v-for="board in recentBoards" :key="board.id" clickable v-ripple @click="selectBoard(board)">
            <q-item-section avatar>
              <q-icon name="dashboard" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ board.name }}</q-item-label>
              <q-item-label caption v-if="board.description">{{ board.description }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" color="grey" />
            </q-item-section>
          </q-item>
          <q-item v-if="recentBoards.length === 0">
            <q-item-section class="text-grey text-caption text-center q-pa-md">
              최근 보드가 없습니다.
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <q-separator />

      <!-- 통계 요약 -->
      <div class="q-pa-sm">
        <div class="text-subtitle2 text-bold q-mb-sm q-px-sm">시스템 현황</div>
        <div class="stats-grid q-pa-sm">
          <div class="stat-item">
            <div class="stat-label text-caption text-grey-6">보드</div>
            <div class="stat-value text-h6 text-primary">{{ stats.totalBoards }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label text-caption text-grey-6">디바이스</div>
            <div class="stat-value text-h6 text-primary">{{ stats.totalDevices }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label text-caption text-grey-6">그룹</div>
            <div class="stat-value text-h6 text-primary">{{ stats.totalGroups }}</div>
          </div>
        </div>
      </div>
    </q-list>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBoardMenuStore } from '@system/store/boardMenuStore.js'
import { useDashboardLayoutStore } from '@system/store/dashboardLayoutStore.js'

const router = useRouter()
const boardMenuStore = useBoardMenuStore()
const dashboardLayoutStore = useDashboardLayoutStore()

// 통계 계산
const stats = computed(() => {
  const allNodes = boardMenuStore.nodes
  const boards = allNodes.filter((node) => node.type === 'board')
  const groups = allNodes.filter((node) => node.type === 'group')

  // 디바이스 수 계산 (모든 보드의 devices 배열 합산)
  const totalDevices = boards.reduce((sum, board) => {
    return sum + (board.devices?.length || 0)
  }, 0)

  return {
    totalBoards: boards.length,
    totalDevices,
    totalGroups: groups.length,
  }
})

// 최근 보드 목록 (최대 5개)
const recentBoards = computed(() => {
  const allNodes = boardMenuStore.nodes
  const boards = allNodes.filter((node) => node.type === 'board').slice(0, 5)
  return boards
})

// 빠른 접근 함수들
function goToNexaBoard() {
  router.push('/nexa-board')
}

function goToPartsManagement() {
  router.push('/parts-management')
}

function goToAddDevice() {
  router.push('/add-device')
}

function selectBoard(board) {
  dashboardLayoutStore.setSelectedNodeForDashboard(board)
  router.push('/nexa-board')
}
</script>

<style lang="scss" scoped>
.home-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;

  .sidebar-header {
    background: var(--nexa-surface-header-bg);
    border-bottom: 1px solid var(--nexa-border-color);
  }

  .q-list {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;

    .stat-item {
      background: rgba(0, 0, 0, 0.15);
      border-radius: 4px;
      padding: 8px;
      text-align: center;
      transition: background-color 0.2s;

      &:hover {
        background: rgba(0, 0, 0, 0.25);
      }

      .stat-label {
        margin-bottom: 4px;
      }

      .stat-value {
        font-weight: 600;
      }
    }
  }
}
</style>

