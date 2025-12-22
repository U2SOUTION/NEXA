<template>
  <q-page class="page-content" style="display: flex; flex-direction: column">
    <div
      v-if="selectedDashboardNode"
      class="q-pa-xs"
      style="flex-grow: 1; display: flex; flex-direction: column"
    >
      <div
        v-if="selectedDashboardNode.type === 'board'"
        style="flex-grow: 1; display: flex; flex-direction: column"
      >
        <!-- 처음 시작시 아직 넥사보드를 한번더 구성하지 않았으면 뜬 창  -->
        <nexa-board-setup
          v-if="!selectedDashboardNode.isLayoutConfigured || !selectedDashboardNode.dashboardPreset"
          :isOpen="true"
          :boardName="selectedDashboardNode.name"
          :devices="selectedDashboardNode.devices || []"
          :nexaPanels="selectedDashboardNode.nexaPanelList || []"
        />

        <!-- 한버너이라도 시작 했으면 넥사보드 저장한 넥사보드 렌더링 -->
        <div
          v-else
          class="dashboard-display-area-container"
          style="height: 100%; display: flex; flex-direction: column; flex-grow: 1"
        >
          <!-- 레이아웃 설정 완료 후 DashboardRenderer가 표시될 영역 -->
          <nexa-dashboard-renderer style="flex-grow: 1; min-height: 0" />
        </div>
      </div>

      <!-- 그룹을 선택 했을때 출력 -->
      <div
        v-else-if="selectedDashboardNode.type === 'group'"
        class="flex column flex-center text-center full-height q-pa-md"
      >
        <div class="text-h4 q-mb-xs">
          <q-icon name="folder_shared" class="q-mr-sm" />
          그룹: {{ selectedDashboardNode.name }}
        </div>
        <div
          v-if="selectedDashboardNode.description"
          class="text-grey-7 q-mb-md ellipsis"
          :title="selectedDashboardNode.description"
          style="max-width: 800px; text-align: left; font-size: 1.08em"
        >
          {{ selectedDashboardNode.description }}
        </div>

        <!-- 그룹 통계 정보 -->
        <div class="row q-col-gutter-md q-mb-lg" style="width: 100%; max-width: 800px">
          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="bg-grey-9">
              <q-card-section>
                <div class="text-h6">{{ groupStats.totalBoards }}</div>
                <div class="text-subtitle2">전체 보드</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="bg-grey-9">
              <q-card-section>
                <div class="text-h6">{{ groupStats.configuredBoards }}</div>
                <div class="text-subtitle2">설정 완료</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="bg-grey-9">
              <q-card-section>
                <div class="text-h6">{{ groupStats.pendingBoards }}</div>
                <div class="text-subtitle2">설정 대기</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="bg-grey-9">
              <q-card-section>
                <div class="text-h6">{{ groupStats.activeBoards }}</div>
                <div class="text-subtitle2">모니터링 중</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- 하위 항목 목록 -->
        <div v-if="childNodes.length > 0" class="q-mt-lg" style="width: 100%; max-width: 800px">
          <div class="row items-center q-mb-sm" style="justify-content: space-between">
            <div class="text-subtitle1 text-left">하위 항목 목록</div>
            <div class="text-caption text-grey-7">총 {{ groupStats.totalBoards }}개</div>
          </div>
          <div class="column">
            <q-card
              v-for="(child, idx) in childNodes"
              :key="child.id"
              class="q-pa-md cursor-pointer"
              @click="handleChildNodeClick(child)"
              flat
              style="transition: box-shadow 0.2s; margin-bottom: 4px; border: 1.5px solid #222"
              @mouseover="hovered = child.id"
              @mouseleave="hovered = null"
              :style="
                (hovered === child.id ? 'box-shadow: 0 4px 16px rgba(25,118,210,0.10);' : '') +
                ' margin-bottom: 4px; border: 1.5px solid #222;'
              "
            >
              <div class="row items-center no-wrap" style="min-width: 0">
                <q-icon
                  :name="
                    child.type === 'group'
                      ? 'folder'
                      : child.isLayoutConfigured
                        ? 'insights'
                        : 'pending_actions'
                  "
                  class="q-mr-md"
                  size="32px"
                  :color="
                    child.type === 'group'
                      ? 'secondary'
                      : child.isLayoutConfigured
                        ? 'primary'
                        : 'orange-7'
                  "
                />
                <span style="flex: 0 1 auto; text-align: left; font-weight: 500">
                  {{ child.name }}
                </span>
                <span
                  v-if="child.description"
                  class="ellipsis text-grey-7"
                  :title="child.description"
                  style="
                    flex: 1 1 0;
                    text-align: right;
                    margin-left: 16px;
                    min-width: 0;
                    font-size: 0.97em;
                  "
                >
                  {{ child.description }}
                </span>
                <!-- 상태 아이콘들 -->
                <div class="row items-center q-gutter-xs q-ml-md">
                  <q-icon
                    v-if="child.type === 'board' && !child.isLayoutConfigured"
                    name="pending_actions"
                    color="orange-7"
                    size="20px"
                    :title="'설정 대기'"
                  />
                  <q-icon
                    v-if="child.type === 'board' && idx === 0"
                    name="insights"
                    color="primary"
                    size="20px"
                    :title="'모니터링 중(샘플)'"
                  />
                  <q-icon
                    v-else-if="
                      child.type === 'board' &&
                      child.isLayoutConfigured &&
                      child.lastDataUpdate &&
                      Date.now() - new Date(child.lastDataUpdate).getTime() < 24 * 60 * 60 * 1000
                    "
                    name="insights"
                    color="primary"
                    size="20px"
                    :title="'모니터링 중'"
                  />
                  <q-icon
                    v-if="
                      child.type === 'board' &&
                      (!child.isLayoutConfigured ||
                        !child.lastDataUpdate ||
                        Date.now() - new Date(child.lastDataUpdate).getTime() >=
                          24 * 60 * 60 * 1000)
                    "
                    name="remove_circle_outline"
                    color="grey-5"
                    size="20px"
                    :title="'비활성'"
                  />
                </div>
                <q-icon name="chevron_right" class="q-ml-md" />
              </div>
            </q-card>
          </div>
        </div>
        <p v-else class="q-mt-md text-grey-7">이 그룹에는 하위 항목이 없습니다.</p>

        <!-- 하단 버튼 -->
        <div class="row q-col-gutter-sm q-mt-xl" style="width: 100%; max-width: 600px">
          <div class="col-12 col-sm-6">
            <q-btn
              color="primary"
              icon="add"
              label="새 보드"
              class="full-width"
              @click="createNewBoard"
            />
          </div>
          <div class="col-12 col-sm-6">
            <q-btn
              color="secondary"
              icon="edit"
              label="그룹 편집"
              class="full-width"
              @click="editGroup"
            />
          </div>
        </div>
        <!-- 그룹 기능 메모 -->
        <ul class="q-mt-md text-left text-grey-6" style="max-width: 800px; font-size: 0.98em">
          <li>그룹 통계/집계 (전체 보드, 활성/비활성, 장애 등)</li>
          <li>그룹 대시보드 (실시간 상태, 미니 차트, 알림 등)</li>
          <li>그룹 일괄 관리 (일괄 설정, 삭제, 이동, 권한 등)</li>
          <li>그룹별 커스텀 뷰 (레이아웃, 테마, 즐겨찾기 등)</li>
          <li>그룹 활동 이력 (변경 이력, 사용자 로그 등)</li>
          <li>그룹 내 검색/필터 (보드, 패널, 디바이스 등)</li>
        </ul>
      </div>
    </div>
    <!-- 보드가 선택되지 않은 경우에도 프리셋 미리보기 표시 -->
    <div v-else class="q-pa-xs" style="flex-grow: 1; display: flex; flex-direction: column">
      <div class="dashboard-display-area-container" style="height: 100%; display: flex; flex-direction: column; flex-grow: 1">
        <nexa-dashboard-renderer style="flex-grow: 1; min-height: 0" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useDashboardLayoutStore } from 'src/stores/dashboardLayoutStore'
import { useBoardMenuStore } from 'src/stores/boardMenuStore'
import { useRouter } from 'vue-router'
import NexaDashboardRenderer from 'src/board/NexaDashboardRenderer.vue'
import NexaBoardSetup from 'src/board/NexaBoardSetup.vue'

const dashboardLayoutStore = useDashboardLayoutStore()
const boardMenuStore = useBoardMenuStore()
const router = useRouter()

const selectedDashboardNode = computed(() => dashboardLayoutStore.selectedNodeForDashboard)

const childNodes = computed(() => {
  if (
    selectedDashboardNode.value &&
    selectedDashboardNode.value.type === 'group' &&
    selectedDashboardNode.value.childrenIds
  ) {
    return selectedDashboardNode.value.childrenIds
      .map((id) => boardMenuStore.getNodeById(id))
      .filter((node) => node) // Ensure node exists
  }
  return []
})

// 그룹 통계 정보 계산
const groupStats = computed(() => {
  const stats = {
    totalBoards: 0,
    configuredBoards: 0,
    pendingBoards: 0,
    activeBoards: 0,
  }

  if (childNodes.value) {
    stats.totalBoards = childNodes.value.length
    stats.configuredBoards = childNodes.value.filter(
      (node) => node.type === 'board' && node.isLayoutConfigured,
    ).length
    stats.pendingBoards = childNodes.value.filter(
      (node) => node.type === 'board' && !node.isLayoutConfigured,
    ).length
    // 활성 보드는 레이아웃이 설정되어 있고, 최근 24시간 내에 데이터가 수집된 보드
    stats.activeBoards = childNodes.value.filter(
      (node) =>
        node.type === 'board' &&
        node.isLayoutConfigured &&
        node.lastDataUpdate &&
        Date.now() - new Date(node.lastDataUpdate).getTime() < 24 * 60 * 60 * 1000,
    ).length
  }

  return stats
})

function handleChildNodeClick(node) {
  if (node) {
    console.log('[NexaBoardPage] Child node clicked:', JSON.parse(JSON.stringify(node)))
    dashboardLayoutStore.setSelectedNodeForDashboard(node)
  }
}

// 새 보드 생성
function createNewBoard() {
  router.push({
    path: '/board-admin',
    query: { groupId: selectedDashboardNode.value.id },
  })
}

// 그룹 편집
function editGroup() {
  router.push({
    path: '/board-admin',
    query: { editGroup: selectedDashboardNode.value.id },
  })
}

const hovered = ref(null)
</script>

<style lang="scss" scoped>
.page-content {
  height: calc(100vh - 50px - 48px); // 헤더(50px) + Footer(48px) 제외
  overflow-y: auto;
}

.full-height {
  height: 100%;
}
</style>
