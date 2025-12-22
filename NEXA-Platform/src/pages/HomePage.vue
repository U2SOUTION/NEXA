<template>
  <q-page class="home-page">
    <div class="q-pa-lg">
      <!-- 헤더 섹션 -->
      <section class="title-area q-mb-lg">
        <div class="title-text">U2 SOLUTION</div>
        <div class="subtitle-text">NEXA GRID SYSTEM</div>
        <div class="subtitle-text">INNOVATION FOR CONNECTED FUTURE</div>
        <div class="subtitle-text">SMART IoT PLATFORM</div>
        <div class="subtitle-text">YOUR DATA, YOUR INSIGHT</div>
        <div class="subtitle-text">CONNECT. VISUALIZE. CONTROL.</div>
      </section>

      <!-- 현재 시간 표시 -->
      <div class="datetime-display q-mb-lg">
        <NexaBlock type="time" variant="main" />
      </div>

      <!-- 통계 카드 -->
      <div class="stats-container q-mb-lg">
        <q-card class="stat-card">
          <q-card-section>
            <div class="row items-center">
              <q-icon name="dashboard" size="48px" color="primary" class="q-mr-md" />
              <div>
                <div class="text-h6 text-grey-7 q-mb-xs">총 보드 수</div>
                <div class="text-h3 text-primary">{{ stats.totalBoards }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="stat-card">
          <q-card-section>
            <div class="row items-center">
              <q-icon name="devices" size="48px" color="primary" class="q-mr-md" />
              <div>
                <div class="text-h6 text-grey-7 q-mb-xs">연결된 디바이스</div>
                <div class="text-h3 text-primary">{{ stats.totalDevices }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="stat-card">
          <q-card-section>
            <div class="row items-center">
              <q-icon name="folder" size="48px" color="primary" class="q-mr-md" />
              <div>
                <div class="text-h6 text-grey-7 q-mb-xs">그룹 수</div>
                <div class="text-h3 text-primary">{{ stats.totalGroups }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 빠른 접근 -->
      <div class="quick-access-container q-mb-lg">
        <q-card class="quick-access-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">빠른 접근</div>
            <div class="row q-gutter-md">
              <q-btn flat color="primary" icon="dashboard_customize" label="NEXA BOARD" @click="goToNexaBoard" class="col-12 col-md-4" size="lg" />
              <q-btn flat color="primary" icon="inventory_2" label="부품관리" @click="goToPartsManagement" class="col-12 col-md-4" size="lg" />
              <q-btn flat color="primary" icon="devices_other" label="디바이스 추가" @click="goToAddDevice" class="col-12 col-md-4" size="lg" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 최근 보드 목록 -->
      <div v-if="recentBoards.length > 0" class="recent-boards-container">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">최근 보드</div>
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
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- 보드가 없을 때 -->
      <div v-else class="empty-state">
        <q-card>
          <q-card-section class="text-center q-pa-xl">
            <q-icon name="dashboard" size="64px" color="grey-5" class="q-mb-md" />
            <div class="text-h6 text-grey-7 q-mb-sm">보드가 없습니다</div>
            <div class="text-caption text-grey-6 q-mb-md">새 보드를 생성하여 시작하세요</div>
            <q-btn color="primary" label="보드 관리로 이동" icon="dashboard_customize" @click="goToBoardAdmin" unelevated />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBoardMenuStore } from 'src/stores/boardMenuStore'
import { useDashboardLayoutStore } from 'src/stores/dashboardLayoutStore'
import NexaBlock from 'src/block/NexaBlock.vue'

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

function goToBoardAdmin() {
  router.push('/board-admin')
}

function selectBoard(board) {
  dashboardLayoutStore.setSelectedNodeForDashboard(board)
  router.push('/nexa-board')
}
</script>

<style lang="scss" scoped>
.home-page {
  background: var(--nexa-background);
  min-height: 100vh;
}

.title-area {
  text-align: center;
  padding: 40px 20px;

  .title-text {
    font-size: 3rem;
    font-weight: 900;
    color: var(--nexa-primary);
    margin-bottom: 8px;
    letter-spacing: 2px;
  }

  .subtitle-text {
    font-size: 1rem;
    color: var(--nexa-text-secondary);
    margin-bottom: 4px;
    letter-spacing: 1px;
  }
}

.datetime-display {
  display: flex;
  justify-content: center;
  align-items: center;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  transition: all 0.2s ease;
  border: 1px solid var(--nexa-border-color);

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}

.quick-access-container {
  margin-bottom: 24px;
}

.quick-access-card {
  border: 1px solid var(--nexa-border-color);
}

.recent-boards-container {
  margin-top: 24px;
}

.empty-state {
  margin-top: 48px;
}

@media (max-width: 768px) {
  .title-area {
    padding: 20px 10px;

    .title-text {
      font-size: 2rem;
    }

    .subtitle-text {
      font-size: 0.875rem;
    }
  }

  .stats-container {
    grid-template-columns: 1fr;
  }
}
</style>
