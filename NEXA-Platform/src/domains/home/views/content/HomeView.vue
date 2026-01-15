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

      <div class="text-h6 q-mb-md text-center">시간의 흐름을 꿰뚫는 통시적 직관, 버려진 것에 지능을 불어넣고, 공간에 영원의 가치를 직조하다.</div>
      <div class="text-h6 q-mb-md text-center">UNITY의 손으로 버려진 것에 지능을, 유한한 공간에 무한한 가치를. 융합으로 삶의 새로운 질서를 빚어냅니다.</div>
      <div class="text-h6 q-mb-md text-center">우리가 만드는 것은 편의가 아니라 생명력이다. 기술과 자연의 리듬이 맞물릴 때, 문명은 다시 살아 숨 쉰다.</div>

      <!-- 웹 소개 페이지용 헤드라인 카피 -->
      <q-card class="copy-card q-mb-md">
        <q-card-section>
          <div class="text-body1 q-gutter-md">
            <p>
              <strong>자연의 공식, 기술의 언어로 다시 쓰다.</strong>
              버려진 재료에 순환의 생명을 불어넣다.
            </p>

            <p>
              <strong>기술은 살아있는 유기체.</strong>
              연결되고 감지하며, 스스로 배우는 생명 같은 시스템.
            </p>

            <p>
              <strong>공간의 미학은 존재의 본질.</strong>
              최소한의 구조로 최대한의 가치를 만드는 디자인.
            </p>

            <p>
              <strong>진화의 직관, 미래를 조형하다.</strong>
              기술의 흐름 속에 자연의 질서를 새기다.
            </p>

            <p>
              <strong>편의를 넘어, 생명력을 디자인하다.</strong>
              우리는 지속 가능한 리듬 속에 새로운 문명을 그린다.
            </p>
          </div>
        </q-card-section>
      </q-card>

      <!-- 브랜드 영상 내레이션 버전 -->
      <q-card class="copy-card q-mb-md">
        <q-card-section>
          <div class="text-body1 q-gutter-md">
            <p>버려진 것들은, 여전히 숨 쉬고 있었다 우리는 그 안에서 자연의 공식을 읽어냈다.</p>

            <p>기술이 감지하고, 생각하고, 반응하는 순간— 그것은 하나의 ‘살아있는 존재’가 된다.</p>

            <p>생명은 언제나 최소한의 공간으로, 자신을 가장 완벽하게 증명해왔다. 우리의 디자인도 그 질서를 따르려 한다.</p>

            <p>과거의 흔적 속에서 미래를 직관하며, 기술과 자연의 리듬을 하나로 엮는다.</p>

            <p>우리가 만드는 것은 편리함이 아니라, 살아 움직이는 생명력이다.</p>
          </div>
        </q-card-section>
      </q-card>

      <div class="text-h5 text-weight-bold q-mb-lg">생태적 순환과 기술 유기체에 대한 디자인 철학</div>

      <!-- 재료의 순환과 생태적 효율성 -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6 text-primary">재료의 순환과 생태적 효율성</div>
          <p>자연이 남긴 공식, 기술이 해석하다. 버려진 팔레트가 다시 태어나 순환의 언어를 말할 때, 우리는 ‘낭비 없는 생명’을 디자인한다.</p>
        </q-card-section>
      </q-card>

      <!-- IoT 플랫폼과 지능형 시스템 유기체 -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6 text-primary">IoT 플랫폼과 지능형 시스템 유기체</div>
          <p>기술은 살아있는 존재다. 감지하고, 사고하고, 반응하는 IoT의 세계는 우리 손끝에서 진화하는 또 하나의 생태계다.</p>
        </q-card-section>
      </q-card>

      <!-- 공간 활용과 존재의 최적화 -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6 text-primary">공간 활용과 존재의 최적화</div>
          <p>공간은 존재의 흔적이다. 최소한의 면적, 최대한의 가치 — 생명처럼 압축된 효율 속에 존재의 미학이 깃든다.</p>
        </q-card-section>
      </q-card>

      <!-- 통시적 직관과 진화의 흐름 -->
      <q-card class="quick-access-card q-mb-md">
        <q-card-section>
          <div class="text-h6 text-primary">통시적 직관과 진화의 흐름</div>
          <p>진화의 흐름을 직관하다. 과거의 설계 위에서 미래의 시스템을 꿈꾸는 일, 그것은 기술이 자연에 다시 귀의하는 길이다.</p>
        </q-card-section>
      </q-card>

      <div class="text-center">
        <div class="q-mb-md text-grey-6">
          <span>#재료순환</span>
          <span>#생태적효율성</span>
          <span>#지속가능한디자인</span>
          <span>#IoT플랫폼</span>
          <span>#지능형시스템유기체</span>
          <span>#융합의장</span>
          <span>#물질순환원리</span>
          <span>#생물학적네트워크</span>
          <span>#항상성(Homeostasis)</span>
          <span>#적응력(Adaptation)</span>
          <span>#공간활용최적화</span>
          <span>#생존전략기술적재현</span>
          <span>#통시적직관</span>
          <span>#진화적흐름</span>
          <span>#기술철학</span>
          <span>#생명지속가능성</span>
          <span>#시스템유기적생동성</span>
          <span>#자연질서통합</span>
          <span>#기술문명</span>
          <span>#에너지효율</span>
        </div>
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
import { useBoardMenuStore } from '@system/store/boardMenuStore'
import { useDashboardLayoutStore } from '@system/store/dashboardLayoutStore'
import NexaBlock from '@engines/block/NexaBlock.vue'

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
  router.push('/erp/parts')
}

function goToAddDevice() {
  router.push('/add-device')
}

function goToBoardAdmin() {
  router.push('/nexa-board/admin')
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

.copy-card {
  color: var(--nexa-text-secondary);
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
