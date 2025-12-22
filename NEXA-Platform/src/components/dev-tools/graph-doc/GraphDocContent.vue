<template>
  <div class="graph-doc-content">
    <!-- 헤더: 분석 대상 입력 -->
    <div class="graph-doc-header q-pa-md">
      <div class="row items-center q-gutter-md">
        <div class="col-auto">
          <q-icon name="account_tree" size="24px" color="primary" />
        </div>
        <div class="col">
          <q-input v-model="analysisTarget" label="분석 대상 (URL 또는 파일 경로)" placeholder="예: /dev, /portfolio, src/pages/DevelopmentPage.vue" outlined dense @keyup.enter="handleAnalyze">
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <div class="col-auto">
          <q-btn color="primary" label="분석" icon="play_arrow" :loading="isAnalyzing" @click="handleAnalyze" />
        </div>
      </div>
    </div>

    <!-- 메인 컨텐츠 영역 -->
    <div class="graph-doc-main row" style="height: calc(100vh - 200px)">
      <!-- 왼쪽: 그래프 시각화 영역 -->
      <div class="col-8 graph-visualization-area">
        <div v-if="!graphData" class="empty-state">
          <q-icon name="account_tree" size="120px" color="grey-5" class="q-mb-md" />
          <h3 class="empty-state-title">의존성 그래프</h3>
          <p class="empty-state-description">
            분석 대상을 입력하고 분석 버튼을 클릭하면<br />
            파일 간 의존성 관계가 그래프로 시각화됩니다.
          </p>
        </div>
        <div v-else class="graph-container">
          <!-- D3.js 그래프가 여기에 렌더링됩니다 -->
          <div class="graph-placeholder">
            <q-icon name="account_tree" size="80px" color="grey-7" class="q-mb-md" />
            <p class="text-grey-7">그래프 시각화 영역 (구현 예정)</p>
            <p class="text-caption text-grey-6 q-mt-sm">
              노드를 클릭하여 파일 정보 확인<br />
              노드를 우클릭하여 문서 생성 메뉴 열기
            </p>
          </div>
        </div>
      </div>

      <!-- 오른쪽: 파일 정보 및 액션 패널 -->
      <div class="col-4 graph-sidebar q-pa-md">
        <div v-if="!selectedNode" class="sidebar-empty-state">
          <q-icon name="info" size="48px" color="grey-5" class="q-mb-md" />
          <p class="text-grey-7 q-mb-lg">그래프에서 노드를 선택하면<br />파일 정보가 여기에 표시됩니다.</p>

          <!-- 기능 목록 -->
          <div class="features-list">
            <h5 class="features-title">주요 기능</h5>
            <q-list dense separator>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="account_tree" size="20px" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="feature-label">의존성 그래프 시각화</q-item-label>
                  <q-item-label caption>파일 간 관계를 인터랙티브 그래프로 표시</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="description" size="20px" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="feature-label">문서 자동 생성</q-item-label>
                  <q-item-label caption>API 문서, 컴포넌트 문서, 파일 문서 자동 생성</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="open_in_new" size="20px" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="feature-label">VS Code 통합</q-item-label>
                  <q-item-label caption>노드 더블클릭으로 VS Code에서 파일 열기</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="sync" size="20px" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="feature-label">문서 동기화</q-item-label>
                  <q-item-label caption>코드 변경 시 문서 자동 업데이트 및 고아 설명 감지</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="filter_list" size="20px" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="feature-label">필터 및 검색</q-item-label>
                  <q-item-label caption>파일 타입, 의존성 깊이로 필터링 및 검색</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="group_work" size="20px" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="feature-label">통합 문서 생성</q-item-label>
                  <q-item-label caption>여러 파일 선택 시 통합 문서 또는 아키텍처 문서 생성</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="smart_toy" size="20px" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="feature-label">AI 보조 생성</q-item-label>
                  <q-item-label caption>AI 프롬프트를 활용한 문서 생성 지원</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
        <div v-else class="node-info-panel">
          <div class="node-info-header q-mb-md">
            <h4 class="node-info-title">{{ selectedNode.name }}</h4>
            <q-btn flat dense icon="close" @click="selectedNode = null" />
          </div>
          <div class="node-info-content">
            <div class="info-item q-mb-sm">
              <span class="info-label">경로:</span>
              <span class="info-value">{{ selectedNode.path }}</span>
            </div>
            <div class="info-item q-mb-sm">
              <span class="info-label">타입:</span>
              <q-chip :label="selectedNode.type" size="sm" color="primary" />
            </div>
            <div class="info-item q-mb-md">
              <span class="info-label">의존성:</span>
              <span class="info-value">{{ selectedNode.dependencies?.length || 0 }}개</span>
            </div>
            <q-separator class="q-my-md" />
            <div class="node-actions">
              <q-btn flat color="primary" icon="open_in_new" label="VS Code에서 열기" class="full-width q-mb-sm" @click="handleOpenInVSCode" />
              <q-btn flat color="primary" icon="description" label="문서 생성" class="full-width" @click="handleGenerateDocument" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// 분석 대상 (URL 또는 파일 경로)
const analysisTarget = ref('')

// 분석 중 상태
const isAnalyzing = ref(false)

// 그래프 데이터
const graphData = ref(null)

// 선택된 노드
const selectedNode = ref(null)

// 분석 실행
function handleAnalyze() {
  if (!analysisTarget.value.trim()) {
    $q.notify({
      type: 'warning',
      message: '분석 대상을 입력해주세요.',
      position: 'top',
    })
    return
  }

  isAnalyzing.value = true

  // TODO: 실제 분석 API 호출
  setTimeout(() => {
    // 임시 데이터 (구현 예정)
    graphData.value = {
      nodes: [],
      edges: [],
    }
    isAnalyzing.value = false
    $q.notify({
      type: 'info',
      message: '분석 기능은 구현 예정입니다.',
      position: 'top',
    })
  }, 1000)
}

// VS Code에서 파일 열기
function handleOpenInVSCode() {
  if (!selectedNode.value) return

  // TODO: VS Code URI 스키마로 파일 열기
  $q.notify({
    type: 'info',
    message: 'VS Code 파일 열기 기능은 구현 예정입니다.',
    position: 'top',
  })
}

// 문서 생성
function handleGenerateDocument() {
  if (!selectedNode.value) return

  // TODO: 문서 생성 모달/플로우 시작
  $q.notify({
    type: 'info',
    message: '문서 생성 기능은 구현 예정입니다.',
    position: 'top',
  })
}
</script>

<style lang="scss" scoped>
.graph-doc-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--nexa-background);
}

.graph-doc-header {
  background: var(--nexa-surface);
  border-bottom: 1px solid var(--nexa-border-color);
}

.graph-doc-main {
  flex: 1;
  overflow: hidden;
}

.graph-visualization-area {
  background: var(--nexa-background);
  border-right: 1px solid var(--nexa-border-color);
  position: relative;
  overflow: hidden;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 2rem;
}

.empty-state-title {
  color: var(--nexa-text-primary);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem;
}

.empty-state-description {
  color: var(--nexa-text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
}

.graph-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.graph-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 2rem;
}

.graph-sidebar {
  margin-top: 1rem;
  background: var(--nexa-surface);
  overflow-y: auto;
}

.sidebar-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  text-align: center;
  padding: 1rem 0;
}

.features-list {
  width: 100%;
  margin-top: 2rem;
  text-align: left;
}

.features-title {
  color: var(--nexa-text-primary);
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  padding: 0 1rem;
}

.feature-label {
  color: var(--nexa-text-primary);
  font-size: 0.875rem;
  font-weight: 500;
}

:deep(.q-item__label--caption) {
  color: var(--nexa-text-secondary);
  font-size: 0.75rem;
  line-height: 1.4;
}

.node-info-panel {
  height: 100%;
}

.node-info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.node-info-title {
  color: var(--nexa-text-primary);
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  word-break: break-all;
}

.node-info-content {
  color: var(--nexa-text-primary);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-label {
  color: var(--nexa-text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  min-width: 60px;
}

.info-value {
  color: var(--nexa-text-primary);
  font-size: 0.875rem;
  word-break: break-all;
}

.node-actions {
  margin-top: 1rem;
}
</style>
