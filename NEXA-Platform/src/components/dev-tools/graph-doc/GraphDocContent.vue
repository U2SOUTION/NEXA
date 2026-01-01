<template>
  <div class="graph-doc-content">
    <!-- 아무것도 선택되지 않았을 때: 사이드바 정보 표시 (임시) -->
    <div v-if="!activeAccordion" class="graph-doc-sidebar-only">
      <div class="graph-sidebar q-pa-md">
        <div class="sidebar-empty-state">
          <q-icon name="hub" size="120px" color="grey-5" class="q-mb-md" />
          <h3 class="empty-state-title">GraphDoc</h3>
          <p class="empty-state-description">왼쪽 사이드바에서 아코디언을 열어 기능을 선택하세요.</p>
          <div class="empty-state-features q-mt-lg">
            <h4 class="features-subtitle">사용 가능한 기능</h4>
            <ul class="features-list">
              <li>Force-Directed Graph - 물리 시뮬레이션 기반 그래프</li>
              <li>파일 의존성 그래프 - 파일 간 의존성 관계 시각화</li>
              <li>패키지 의존성 그래프 - 패키지 및 코드 의존성 분석</li>
              <li>파일 구조 - 프로젝트 파일 구조 분석</li>
              <li>코드 검색 - 프로젝트 전체 코드 검색</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- 활성 아코디언에 따른 컨텐츠 표시 -->
    <!-- 의존성 그래프 -->
    <div v-else-if="activeAccordion === 'dependencyGraph'" class="graph-doc-main-content">
      <!-- 헤더: 분석 대상 입력 -->
      <div class="graph-doc-header q-pa-md">
        <div class="row items-center q-gutter-md">
          <!-- 뒤로가기/앞으로가기 버튼 -->
          <div class="col-auto">
            <div class="row items-center q-gutter-xs">
              <q-btn flat dense round icon="arrow_back" :disable="!canGoBack" @click="handleGoBack" class="history-nav-btn">
                <q-tooltip>뒤로가기</q-tooltip>
              </q-btn>
              <q-btn flat dense round icon="arrow_forward" :disable="!canGoForward" @click="handleGoForward" class="history-nav-btn">
                <q-tooltip>앞으로가기</q-tooltip>
              </q-btn>
              <!-- 현재 위치 표시 -->
              <span v-if="hasHistory" class="history-position"> {{ currentPosition.current }} / {{ currentPosition.total }} </span>
            </div>
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
        <!-- 현재 URL 입력 버튼 -->
        <div class="row q-mt-sm">
          <div class="col">
            <q-btn flat dense size="sm" icon="link" label="URL" color="primary" @click="handleUseCurrentUrl">
              <q-tooltip>현재 브라우저 URL을 분석 대상으로 사용합니다</q-tooltip>
            </q-btn>
            <span v-if="currentUrl" size="sm"> {{ currentUrl }} </span>
          </div>
          <!-- 노드 경로 표시 (오른쪽 정렬) -->
          <div class="col-auto">
            <span v-if="displayNodePath" class="node-path-display">{{ displayNodePath }}</span>
          </div>
        </div>
      </div>

      <!-- 다이어그램이 있을 때: 전체 컨텐츠 창에 다이어그램 렌더링 -->
      <div v-if="graphData" class="graph-doc-diagram-full">
        <div class="graph-container-full">
          <!-- 렌더링 중 스피너 -->
          <NexaSpinner v-if="isAnalyzing" size="md" message="렌더링 중..." centered />
          <NexaDiagram
            ref="dependencyDiagramRef"
            type="dependency-analysis"
            :data="dependencyDiagramData"
            :options="dependencyDiagramOptions"
            @node-click="handleDependencyNodeClick"
            @node-hover="handleDependencyNodeHover"
            @loaded="handleDependencyDiagramLoaded"
            @error="handleDependencyDiagramError"
          />
        </div>
      </div>

      <!-- 다이어그램이 없을 때: 사이드바 정보 표시 -->
      <div v-else class="graph-doc-sidebar-only">
        <div class="graph-sidebar q-pa-md">
          <div class="sidebar-empty-state">
            <q-icon name="info" size="48px" color="grey-5" class="q-mb-md" />
            <p class="text-grey-7 q-mb-lg">분석 대상을 입력하고 분석 버튼을 클릭하면<br />파일 간 의존성 관계가 그래프로 시각화됩니다.</p>

            <!-- 기능 목록 -->
            <div class="features-list">
              <h5 class="features-title">주요 기능</h5>
              <q-list dense separator>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="account_tree" size="20px" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="feature-label">파일 의존성 그래프 시각화</q-item-label>
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
        </div>
      </div>
    </div>

    <!-- 의존성 분석 -->
    <div v-else-if="activeAccordion === 'dependencyAnalysis'" class="graph-doc-main-content">
      <!-- 다이어그램이 있을 때: 전체 컨텐츠 창에 다이어그램 렌더링 -->
      <div v-if="dependencyAnalysisData" class="graph-doc-diagram-full">
        <div class="graph-container-full">
          <!-- 렌더링 중 스피너 -->
          <NexaSpinner v-if="isAnalyzing" size="md" message="렌더링 중..." centered />
          <NexaDiagram
            ref="dependencyAnalysisDiagramRef"
            type="dependency-analysis"
            :data="dependencyAnalysisDiagramData"
            :options="dependencyAnalysisDiagramOptions"
            @node-click="handleDependencyAnalysisNodeClick"
            @node-hover="handleDependencyAnalysisNodeHover"
            @loaded="handleDependencyAnalysisDiagramLoaded"
            @error="handleDependencyAnalysisDiagramError"
          />
        </div>
      </div>
      <!-- 다이어그램이 없을 때: 사이드바 정보 표시 -->
      <div v-else class="graph-doc-sidebar-only">
        <div class="graph-sidebar q-pa-md">
          <div class="sidebar-empty-state">
            <q-icon name="hub" size="120px" color="grey-5" class="q-mb-md" />
            <h3 class="empty-state-title">패키지 의존성 그래프</h3>
            <p class="empty-state-description">
              패키지 의존성 그래프 기능을 준비 중입니다.<br />
              곧 패키지 및 코드 의존성을 분석하고 시각화할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 파일 구조 -->
    <div v-else-if="activeAccordion === 'fileStructure'" class="graph-doc-main-content">
      <!-- 헤더: 분석 대상 입력 -->
      <div class="graph-doc-header q-pa-md">
        <div class="row items-center q-gutter-md">
          <!-- 뒤로가기/앞으로가기 버튼 -->
          <div class="col-auto">
            <div class="row items-center q-gutter-xs">
              <q-btn flat dense round icon="arrow_back" :disable="!canGoBack" @click="handleGoBack" class="history-nav-btn">
                <q-tooltip>뒤로가기</q-tooltip>
              </q-btn>
              <q-btn flat dense round icon="arrow_forward" :disable="!canGoForward" @click="handleGoForward" class="history-nav-btn">
                <q-tooltip>앞으로가기</q-tooltip>
              </q-btn>
              <!-- 현재 위치 표시 -->
              <span v-if="hasHistory" class="history-position"> {{ currentPosition.current }} / {{ currentPosition.total }} </span>
            </div>
          </div>
          <div class="col">
            <q-input v-model="analysisTarget" label="분석 대상 (URL 또는 디렉토리 경로)" placeholder="예: /dev, src/pages, src/components/ui" outlined dense @keyup.enter="handleAnalyzeFileStructureWithTarget">
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-auto">
            <q-btn color="primary" label="분석" icon="play_arrow" :loading="isAnalyzing" @click="handleAnalyzeFileStructureWithTarget" />
          </div>
        </div>
        <!-- 현재 URL 입력 버튼 -->
        <div class="row q-mt-sm">
          <div class="col">
            <q-btn flat dense size="sm" icon="link" label="URL" color="primary" @click="handleUseCurrentUrlForFileStructure">
              <q-tooltip>현재 브라우저 URL을 분석 대상으로 사용합니다</q-tooltip>
            </q-btn>
            <span v-if="currentUrl" size="sm"> {{ currentUrl }} </span>
          </div>
        </div>
      </div>

      <!-- 다이어그램이 있을 때: 전체 컨텐츠 창에 다이어그램 렌더링 -->
      <div v-if="fileTreeData" class="graph-doc-diagram-full">
        <div class="graph-container-full">
          <!-- 렌더링 중 스피너 -->
          <NexaSpinner v-if="isAnalyzing" size="md" message="렌더링 중..." centered />
          <NexaDiagram ref="fileTreeDiagramRef" type="filetree" :data="fileTreeDiagramData" :options="fileTreeDiagramOptions" @node-click="handleFileTreeNodeClick" @node-hover="handleFileTreeNodeHover" @loaded="handleFileTreeDiagramLoaded" @error="handleFileTreeDiagramError" />
        </div>
      </div>
      <!-- 다이어그램이 없을 때: 사이드바 정보 표시 -->
      <div v-else class="graph-doc-sidebar-only">
        <div class="graph-sidebar q-pa-md">
          <div class="sidebar-empty-state">
            <q-icon name="view_module" size="48px" color="grey-5" class="q-mb-md" />
            <p class="text-grey-7 q-mb-lg">분석 대상을 입력하고 분석 버튼을 클릭하면<br />프로젝트 파일 구조가 트리 형태로 시각화됩니다.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 코드 검색 -->
    <div v-else-if="activeAccordion === 'codeSearch'" class="graph-doc-main-content">
      <div class="coming-soon-wrapper">
        <div class="coming-soon-content">
          <q-icon name="search" size="80px" color="grey-7" class="q-mb-md" />
          <h2 class="coming-soon-title">코드 검색</h2>
          <p class="coming-soon-description">코드 검색 기능은 곧 출시될 예정입니다.</p>
          <div class="coming-soon-features q-mt-lg">
            <h3 class="features-title">예정된 기능</h3>
            <ul class="features-list">
              <li><strong>프로젝트 전체 검색:</strong> 모든 파일에서 코드 검색</li>
              <li><strong>정규식 검색:</strong> 고급 검색 패턴 지원</li>
              <li><strong>파일/함수/변수 검색:</strong> 심볼 기반 검색</li>
              <li><strong>검색 결과 하이라이트:</strong> 검색된 코드 위치 표시</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'
import NexaDiagram from 'src/diagram/NexaDiagram.vue'
import NexaSpinner from 'src/components/ui/NexaSpinner.vue'
import { diagramTypes } from 'src/diagram/config/diagramMetadata.js'
import { analyzeDependencyGraph, isNpmPackage } from 'src/utils/graph-doc/dependencyGraphAnalyzer.js'
import { analyzePackageDependencies } from 'src/utils/graph-doc/packageDependencyAnalyzer.js'
import { analyzeFileStructure } from 'src/utils/graph-doc/fileStructureAnalyzer.js'
import { useGraphDocHistory } from 'src/composables/dev-tools/useGraphDocHistory.js'

const $q = useQuasar()
const route = useRoute()

// 히스토리 관리
const { canGoBack, canGoForward, currentPosition, hasHistory, addToHistory, goBack, goForward } = useGraphDocHistory()

// 활성 아코디언 (사이드바와 동기화)
const activeAccordion = ref(null)

// 분석 대상 (URL 또는 파일 경로) - 컨텐츠창 전용 (사이드바와 독립적)
const analysisTarget = ref('')

// 사이드바 분석 대상 (사이드바 전용, 컨텐츠와 독립적)
const sidebarAnalysisTarget = ref('')

// 현재 URL
const currentUrl = computed(() => {
  const path = route.path
  const query = route.query
  if (Object.keys(query).length > 0) {
    const queryString = new URLSearchParams(query).toString()
    return `${path}?${queryString}`
  }
  return path
})

// 현재 URL 사용
function handleUseCurrentUrl() {
  analysisTarget.value = currentUrl.value
  // 자동으로 분석 실행하지 않음 (사용자가 직접 분석 버튼 클릭)
}

// 경로를 루트 기준으로 정규화 (src/ 접두사 추가)
function normalizePath(path) {
  if (!path) return path

  // 앞뒤 공백 제거
  path = path.trim()

  // npm 패키지 경로는 그대로 반환 (@로 시작하는 scoped 패키지 또는 npm 패키지)
  // 예: @tiptap/extension-font-family, @vue/core, @vite-plugin-checker-runtime 등
  // 주의: @/는 경로 별칭이므로 제외
  if (path.startsWith('@') && !path.startsWith('@/')) {
    return path
  }

  // 이미 src/로 시작하면 그대로 반환
  if (path.startsWith('src/')) {
    return path
  }

  // /src/로 시작하면 src/로 변경
  if (path.startsWith('/src/')) {
    return path.substring(1)
  }

  // /로 시작하는 경로는 / 제거
  if (path.startsWith('/')) {
    path = path.substring(1)
  }

  // 상대 경로(./ 또는 ../)의 경우 ./ 또는 ../ 제거
  if (path.startsWith('./')) {
    path = path.substring(2)
  } else if (path.startsWith('../')) {
    // ../는 일단 유지 (상위 디렉토리)
    return `src/${path}`
  }

  // src/ 접두사 추가
  const normalized = `src/${path}`

  // 중복 슬래시 제거 (src//path -> src/path)
  return normalized.replace(/\/+/g, '/')
}

// 뒤로가기
async function handleGoBack() {
  const historyItem = goBack()
  if (historyItem) {
    // 히스토리 항목의 타겟으로 분석 재실행 (히스토리 추가 스킵)
    analysisTarget.value = historyItem.target
    await handleAnalyzeWithTarget(historyItem.target, true)
  }
}

// 앞으로가기
async function handleGoForward() {
  const historyItem = goForward()
  if (historyItem) {
    // 히스토리 항목의 타겟으로 분석 재실행 (히스토리 추가 스킵)
    analysisTarget.value = historyItem.target
    await handleAnalyzeWithTarget(historyItem.target, true)
  }
}

// 분석 중 상태
const isAnalyzing = ref(false)

// 그래프 데이터
const graphData = ref(null)

// 선택된 노드
const selectedNode = ref(null)

// 호버된 노드 정보
const hoveredNode = ref(null)

// 표시할 노드 경로 (selectedNode 우선, 없으면 hoveredNode)
const displayNodePath = computed(() => {
  const node = selectedNode.value || hoveredNode.value
  if (!node) return null

  // 경로 추출 (path, id, nodeId 순서로 시도)
  const path = node.path || node.id || node.nodeId || node.name || null
  if (!path) return null

  // 정규화된 경로 반환
  return normalizePath(path)
})

// 다이어그램 refs
const dependencyDiagramRef = ref(null)
const fileTreeDiagramRef = ref(null)
const dependencyAnalysisDiagramRef = ref(null)

// 다이어그램 renderResult 저장
const dependencyDiagramRenderResult = ref(null)
const fileTreeDiagramRenderResult = ref(null)
const dependencyAnalysisDiagramRenderResult = ref(null)

// 고정된 노드 목록
const fixedNodeList = ref([])
const fixedNodeListUpdateInterval = ref(null)

// 이전 고정 노드 목록 (변경 감지용)
let previousFixedNodeIds = []

// 의존성 그래프 다이어그램 데이터 및 옵션 (Force-Directed Graph용)
const dependencyDiagramData = computed(() => {
  if (!graphData.value) {
    console.log('[GraphDocContent] dependencyDiagramData: graphData가 없음')
    return { packages: [], dependencies: [] }
  }

  // graphData를 Force-Directed Graph 형식으로 변환
  const nodes = graphData.value.nodes || []
  const edges = graphData.value.edges || []

  console.log('[GraphDocContent] dependencyDiagramData 변환 시작:', { nodesCount: nodes.length, edgesCount: edges.length })

  // 파일 타입별 색상 함수
  function getFileTypeColor(path) {
    if (!path) return 'var(--nexa-surface)'
    const ext = path.split('.').pop()?.toLowerCase()
    const colorMap = {
      vue: '#42b883',
      js: '#f7df1e',
      ts: '#007acc',
      scss: '#c6538c',
      css: '#563d7c',
      json: '#f39c12',
      md: '#08c',
      html: '#e34c26',
    }
    return colorMap[ext] || 'var(--nexa-surface)'
  }

  // 파일 데이터를 패키지 형식으로 변환 (Force-Directed Graph용)
  // npm 패키지 필터링 (추가 안전장치)
  const packages = nodes
    .filter((node) => {
      const path = node.path || node.id || node.name
      if (!path) return false

      // src/@... 형태인 경우도 npm 패키지로 인식
      // 예: src/@vite-plugin-checker-runtime.vue -> @vite-plugin-checker-runtime.vue
      const npmPackagePath = path.startsWith('src/@') ? path.substring(4) : path

      // npm 패키지 필터링
      if (isNpmPackage(npmPackagePath)) {
        return false
      }

      return true
    })
    .map((node) => ({
      id: node.path || node.id || node.name,
      name: node.name || node.id,
      radius: 25, // 파일은 작은 크기
      color: getFileTypeColor(node.path || node.id),
    }))

  // 엣지의 from/to를 노드의 id로 변환
  const dependencies = edges
    .map((edge) => {
      const fromId = edge.from || edge.source
      const toId = edge.to || edge.target

      // 노드가 존재하는지 확인
      const fromNode = nodes.find((n) => (n.id || n.name) === fromId || (n.path || n.id || n.name) === fromId)
      const toNode = nodes.find((n) => (n.id || n.name) === toId || (n.path || n.id || n.name) === toId)

      if (!fromNode || !toNode) {
        console.warn('[GraphDocContent] 엣지에 해당하는 노드를 찾을 수 없음:', { fromId, toId })
        return null
      }

      return {
        from: fromNode.path || fromNode.id || fromNode.name,
        to: toNode.path || toNode.id || toNode.name,
        label: edge.label || '',
      }
    })
    .filter((dep) => dep !== null) // null 제거

  const result = { packages, dependencies }
  console.log('[GraphDocContent] dependencyDiagramData 변환 완료:', { packagesCount: packages.length, dependenciesCount: dependencies.length })
  return result
})

const dependencyDiagramOptions = computed(() => ({
  selectedNode: selectedNode.value?.path || selectedNode.value?.id || null,
}))

// 파일 트리 다이어그램 데이터 및 옵션
const fileTreeData = ref(null)

const fileTreeDiagramData = computed(() => {
  if (!fileTreeData.value) return { files: [] }

  // fileTreeData를 파일 트리 형식으로 변환
  const files = Array.isArray(fileTreeData.value) ? fileTreeData.value : fileTreeData.value.files || []

  return { files }
})

const fileTreeDiagramOptions = computed(() => ({
  selectedNode: selectedNode.value?.path || selectedNode.value?.id || null,
}))

// 의존성 분석 다이어그램 데이터 및 옵션
const dependencyAnalysisData = ref(null)
const dependencyAnalysisDiagramData = ref({ packages: [], dependencies: [] })

// dependencyAnalysisData 변경 시 dependencyAnalysisDiagramData 업데이트
watch(
  () => dependencyAnalysisData.value,
  (newData) => {
    if (!newData) {
      dependencyAnalysisDiagramData.value = { packages: [], dependencies: [] }
      return
    }

    const packages = newData.packages || []
    const dependencies = newData.dependencies || []

    // 참조 동일성 유지: 내용이 같으면 업데이트하지 않음
    const current = dependencyAnalysisDiagramData.value
    if (current.packages.length === packages.length && current.dependencies.length === dependencies.length && packages.length > 0 && current.packages[0]?.id === packages[0]?.id) {
      return // 실제 변경 없음
    }

    // 새로운 데이터로 업데이트
    dependencyAnalysisDiagramData.value = { packages, dependencies }
  },
  { immediate: true },
)

const dependencyAnalysisDiagramOptions = computed(() => ({
  selectedNode: selectedNode.value?.id || selectedNode.value?.name || null,
}))

// 분석 실행 (컨텐츠창 입력값 사용)
async function handleAnalyze() {
  const target = analysisTarget.value.trim()
  handleAnalyzeWithTarget(target)
}

// 현재 URL을 파일 구조 분석 대상으로 사용
function handleUseCurrentUrlForFileStructure() {
  analysisTarget.value = currentUrl.value
  handleAnalyzeFileStructureWithTarget()
}

// 파일 구조 분석 실행 (컨텐츠창 입력값 사용)
async function handleAnalyzeFileStructureWithTarget() {
  const target = analysisTarget.value.trim()
  await handleAnalyzeFileStructure(target)
}

// 분석 실행 (대상 지정)
async function handleAnalyzeWithTarget(target, skipHistory = false) {
  if (!target || target === 'test') {
    $q.notify({
      type: 'warning',
      message: '분석 대상을 입력해주세요. 예: /dev, src/pages/DevelopmentPage.vue, components/ui',
      position: 'center',
      timeout: 5000,
    })
    return
  }

  // 중복 요청 방지
  if (isAnalyzing.value) {
    console.log('[GraphDocContent] 이미 분석 중입니다.')
    return
  }

  console.log('[GraphDocContent] 의존성 그래프 분석 시작:', target)
  isAnalyzing.value = true

  try {
    // 실제 파일 분석
    const graphDataResult = await analyzeDependencyGraph(target)

    if (graphDataResult.nodes.length === 0) {
      $q.notify({
        type: 'warning',
        message: `분석 대상 파일을 찾을 수 없습니다: "${target}". 예시: /dev, /portfolio, src/pages/DevelopmentPage.vue`,
        position: 'top',
        timeout: 5000,
      })
      isAnalyzing.value = false
      return
    }

    graphData.value = graphDataResult
    isAnalyzing.value = false

    // 히스토리에 추가 (히스토리 네비게이션으로 인한 호출이 아닌 경우만)
    if (!skipHistory) {
      // 파일명 추출 (표시용)
      let fileName = null
      if (target.includes('/')) {
        const parts = target.split('/')
        fileName = parts[parts.length - 1]
        // 확장자 제거
        if (fileName.includes('.')) {
          fileName = fileName.split('.')[0]
        }
      } else {
        fileName = target
      }

      // 최소한의 정보만 저장 (표시용)
      // 클릭 시 target을 사용하여 실제 파일에서 다시 읽어옴
      addToHistory({
        diagramType: 'dependencyGraph',
        target: target, // 이것만으로 재분석 가능
        metadata: {
          // 표시용 정보만 저장 (클릭 시 재계산됨)
          nodeCount: graphDataResult.nodes.length,
          edgeCount: graphDataResult.edges.length,
          fileName: fileName,
          comment: graphDataResult.metadata?.mainFileComment || null, // 표시용 (클릭 시 재읽음)
        },
      })
    }

    console.log('[GraphDocContent] 의존성 그래프 데이터 설정 완료:', graphData.value)
    console.log('[GraphDocContent] activeAccordion:', activeAccordion.value)
    console.log('[GraphDocContent] dependencyDiagramData:', dependencyDiagramData.value)
  } catch (error) {
    console.error('[GraphDocContent] 의존성 그래프 분석 실패:', error)
    isAnalyzing.value = false
    // 오류는 콘솔에만 기록 (토스트 메시지 제거)
  }
}

// TODO: 향후 노드 정보 패널 추가 시 사용 예정
// VS Code에서 파일 열기
// function handleOpenInVSCode() {
//   if (!selectedNode.value) return
//   // TODO: VS Code URI 스키마로 파일 열기
//   $q.notify({
//     type: 'info',
//     message: 'VS Code 파일 열기 기능은 구현 예정입니다.',
//     position: 'top',
//   })
// }

// 문서 생성
// function handleGenerateDocument() {
//   if (!selectedNode.value) return
//   // TODO: 문서 생성 모달/플로우 시작
//   $q.notify({
//     type: 'info',
//     message: '문서 생성 기능은 구현 예정입니다.',
//     position: 'top',
//   })
// }

// 아코디언 변경 이벤트 리스너
function handleAccordionChange(event) {
  const { item, expanded } = event.detail
  console.log('[GraphDocContent] 아코디언 변경 이벤트 수신:', item, expanded)
  activeAccordion.value = expanded ? item : null
  console.log('[GraphDocContent] activeAccordion 업데이트:', activeAccordion.value)
}

// 분석 대상 변경 이벤트 리스너 (사이드바에서 호출)
function handleAnalysisTargetChange(event) {
  const { value } = event.detail
  // 사이드바 입력값은 sidebarAnalysisTarget에 저장 (컨텐츠와 독립적)
  sidebarAnalysisTarget.value = value
}

// 파일 구조 분석 대상 변경 이벤트 리스너 (사이드바에서 호출)
function handleFileStructureAnalysisTargetChange(event) {
  const { value } = event.detail
  // 사이드바 입력값 저장
  sidebarAnalysisTarget.value = value
}

// 파일 구조 분석 요청 이벤트 리스너 (사이드바에서 호출)
function handleFileStructureAnalyzeRequest(event) {
  // 사이드바의 분석 대상을 가져옴
  const target = event?.detail?.target || sidebarAnalysisTarget.value

  if (!target || target.trim() === '') {
    $q.notify({
      type: 'warning',
      message: '분석 대상을 입력해주세요.',
      position: 'center',
      timeout: 5000,
    })
    return
  }

  // 사이드바 분석 대상 저장
  sidebarAnalysisTarget.value = target.trim()

  // activeAccordion이 fileStructure가 아니면 설정
  if (activeAccordion.value !== 'fileStructure') {
    activeAccordion.value = 'fileStructure'
    console.log('[GraphDocContent] activeAccordion을 fileStructure로 설정')
  }

  // 사이드바 분석 실행 (사이드바 입력값 사용)
  handleAnalyzeFileStructure(target.trim())
}

// 분석 요청 이벤트 리스너 (사이드바에서 호출)
function handleAnalyzeRequest(event) {
  // 사이드바의 분석 대상을 가져옴
  const target = event?.detail?.target || sidebarAnalysisTarget.value

  if (!target || target.trim() === '') {
    $q.notify({
      type: 'warning',
      message: '분석 대상을 입력해주세요.',
      position: 'center',
      timeout: 5000,
    })
    return
  }

  // 사이드바 분석 대상 저장 (컨텐츠와 독립적)
  sidebarAnalysisTarget.value = target.trim()

  // activeAccordion이 dependencyGraph가 아니면 설정
  if (activeAccordion.value !== 'dependencyGraph') {
    activeAccordion.value = 'dependencyGraph'
    console.log('[GraphDocContent] activeAccordion을 dependencyGraph로 설정')
  }

  // 사이드바 분석 실행 (사이드바 입력값 사용)
  handleAnalyzeWithTarget(target.trim())
}

// 노드 선택 이벤트 리스너
function handleNodeSelected(event) {
  const { node } = event.detail
  selectedNode.value = node
}

// 의존성 그래프 다이어그램 이벤트 핸들러
function handleDependencyNodeClick(event) {
  const { nodeId, nodeData } = event
  selectedNode.value = nodeData || { path: nodeId, name: nodeId }

  // 노드의 파일 경로를 입력 필드에 설정하고 분석 재실행
  if (nodeData?.path || nodeId) {
    const filePath = nodeData?.path || nodeId
    analysisTarget.value = filePath

    // 자동으로 분석 실행
    handleAnalyze()
  }
}

function handleDependencyNodeHover(event) {
  const { nodeId, nodeData, isEntering } = event
  if (isEntering) {
    const rawPath = nodeData?.path || nodeId
    hoveredNode.value = {
      nodeId: nodeId,
      nodeData: nodeData,
      path: normalizePath(rawPath),
      name: nodeData?.name || nodeId?.split('/').pop() || nodeId,
    }

    // 고정 노드인지 확인하고 리스트 아이템 하이라이트
    const renderResult = dependencyDiagramRenderResult.value
    if (renderResult && renderResult.getFixedNodeIds) {
      const fixedNodeIds = renderResult.getFixedNodeIds()
      const nodePath = nodeData?.path || nodeId
      if (fixedNodeIds.includes(nodePath)) {
        window.dispatchEvent(
          new CustomEvent('graph-doc-highlight-fixed-node-item', {
            detail: {
              nodeId: nodePath,
            },
          }),
        )
      }
    }
  } else {
    hoveredNode.value = null

    // 고정 노드인지 확인하고 리스트 아이템 하이라이트 해제
    const renderResult = dependencyDiagramRenderResult.value
    if (renderResult && renderResult.getFixedNodeIds) {
      const fixedNodeIds = renderResult.getFixedNodeIds()
      const nodePath = nodeData?.path || nodeId
      if (fixedNodeIds.includes(nodePath)) {
        window.dispatchEvent(
          new CustomEvent('graph-doc-unhighlight-fixed-node-item', {
            detail: {
              nodeId: nodePath,
            },
          }),
        )
      }
    }
  }
}

function handleDependencyDiagramLoaded(renderResult) {
  console.log('[GraphDocContent] 의존성 그래프 다이어그램 로드 완료:', renderResult)
  isAnalyzing.value = false
  dependencyDiagramRenderResult.value = renderResult
  fileTreeDiagramRenderResult.value = null // 다른 다이어그램 초기화
  // 고정 노드 목록 업데이트 시작
  startFixedNodeListUpdate()
  // 줌 없이 호출 예제: fitToScreen의 자동 줌만 사용 (setOptimalZoom 호출 없음)
}

function handleDependencyDiagramError(error) {
  console.error('[GraphDocContent] 의존성 그래프 다이어그램 오류:', error)
  isAnalyzing.value = false
  // 오류는 콘솔에만 기록 (토스트 메시지 제거)
}

// 파일 트리 다이어그램 이벤트 핸들러
function handleFileTreeNodeClick(event) {
  const { nodeId, nodeData } = event
  selectedNode.value = nodeData || { path: nodeId, name: nodeId }

  // 노드의 파일 경로를 입력 필드에 설정하고 분석 재실행
  if (nodeData?.path || nodeId) {
    const filePath = nodeData?.path || nodeId
    analysisTarget.value = filePath

    // 자동으로 분석 실행
    handleAnalyze()
  }
}

function handleFileTreeNodeHover(event) {
  const { nodeId, nodeData, isEntering } = event
  if (isEntering) {
    const rawPath = nodeData?.path || nodeId
    hoveredNode.value = {
      nodeId: nodeId,
      nodeData: nodeData,
      path: normalizePath(rawPath),
      name: nodeData?.name || nodeId?.split('/').pop() || nodeId,
    }

    // 고정 노드인지 확인하고 리스트 아이템 하이라이트
    const renderResult = fileTreeDiagramRenderResult.value
    if (renderResult && renderResult.getFixedNodeIds) {
      const fixedNodeIds = renderResult.getFixedNodeIds()
      const nodePath = nodeData?.path || nodeId
      if (fixedNodeIds.includes(nodePath)) {
        window.dispatchEvent(
          new CustomEvent('graph-doc-highlight-fixed-node-item', {
            detail: {
              nodeId: nodePath,
            },
          }),
        )
      }
    }
  } else {
    hoveredNode.value = null

    // 고정 노드인지 확인하고 리스트 아이템 하이라이트 해제
    const renderResult = fileTreeDiagramRenderResult.value
    if (renderResult && renderResult.getFixedNodeIds) {
      const fixedNodeIds = renderResult.getFixedNodeIds()
      const nodePath = nodeData?.path || nodeId
      if (fixedNodeIds.includes(nodePath)) {
        window.dispatchEvent(
          new CustomEvent('graph-doc-unhighlight-fixed-node-item', {
            detail: {
              nodeId: nodePath,
            },
          }),
        )
      }
    }
  }
}

// ===== 줌 있는 코드 (주석 처리) =====
// function handleFileTreeDiagramLoaded(renderResult) {
//   console.log('[GraphDocContent] 파일 트리 다이어그램 로드 완료:', renderResult)
//   isAnalyzing.value = false
//   fileTreeDiagramRenderResult.value = renderResult
//   dependencyDiagramRenderResult.value = null // 다른 다이어그램 초기화
//   // 고정 노드 목록 업데이트 시작
//   startFixedNodeListUpdate()
//
//   // 파일 구조 그래프에만 2배 스케일 적용 (자동 중앙정렬)
//   if (renderResult && renderResult.setOptimalZoom) {
//     setTimeout(() => {
//       try {
//         // 스케일만 전달하면 setOptimalZoom에서 자동으로 중앙정렬 계산
//         renderResult.setOptimalZoom(1.6, null, null, { animate: true })
//         console.log('[GraphDocContent] 파일 구조 그래프 2배 스케일 적용 (자동 중앙정렬)')
//       } catch (err) {
//         console.warn('[GraphDocContent] 스케일 적용 실패:', err)
//       }
//     }, 500) // fitToScreen 완료 후 적용
//   }
// }

// ===== 줌 없이 호출 (자동 줌만 사용) =====
function handleFileTreeDiagramLoaded(renderResult) {
  console.log('[GraphDocContent] 파일 트리 다이어그램 로드 완료:', renderResult)
  isAnalyzing.value = false
  fileTreeDiagramRenderResult.value = renderResult
  dependencyDiagramRenderResult.value = null // 다른 다이어그램 초기화
  // 고정 노드 목록 업데이트 시작
  startFixedNodeListUpdate()
  // 줌 없이 호출: fitToScreen의 자동 줌만 사용 (setOptimalZoom 호출 없음)
}

function handleFileTreeDiagramError(error) {
  console.error('[GraphDocContent] 파일 트리 다이어그램 오류:', error)
  isAnalyzing.value = false
  // 오류는 콘솔에만 기록 (토스트 메시지 제거)
}

// 의존성 분석 다이어그램 이벤트 핸들러
function handleDependencyAnalysisNodeClick(event) {
  const { nodeId, nodeData } = event
  selectedNode.value = nodeData || { id: nodeId, name: nodeId }

  // 노드의 파일 경로를 입력 필드에 설정하고 분석 재실행
  // 의존성 분석은 패키지 ID이므로 파일 경로가 아닐 수 있음
  if (nodeData?.path) {
    analysisTarget.value = nodeData.path
    handleAnalyze()
  } else if (nodeData?.id && nodeData.id.includes('/')) {
    // ID가 경로 형태인 경우
    analysisTarget.value = nodeData.id
    handleAnalyze()
  }
}

function handleDependencyAnalysisNodeHover(event) {
  const { nodeId, nodeData, isEntering } = event
  if (isEntering) {
    hoveredNode.value = {
      nodeId: nodeId,
      nodeData: nodeData,
      path: nodeId, // 패키지 ID
      name: nodeData?.name || nodeId,
    }

    // 고정 노드인지 확인하고 리스트 아이템 하이라이트
    const renderResult = dependencyAnalysisDiagramRenderResult.value
    if (renderResult && renderResult.getFixedNodeIds) {
      const fixedNodeIds = renderResult.getFixedNodeIds()
      if (fixedNodeIds.includes(nodeId)) {
        window.dispatchEvent(
          new CustomEvent('graph-doc-highlight-fixed-node-item', {
            detail: {
              nodeId: nodeId,
            },
          }),
        )
      }
    }
  } else {
    hoveredNode.value = null

    // 고정 노드인지 확인하고 리스트 아이템 하이라이트 해제
    const renderResult = dependencyAnalysisDiagramRenderResult.value
    if (renderResult && renderResult.getFixedNodeIds) {
      const fixedNodeIds = renderResult.getFixedNodeIds()
      if (fixedNodeIds.includes(nodeId)) {
        window.dispatchEvent(
          new CustomEvent('graph-doc-unhighlight-fixed-node-item', {
            detail: {
              nodeId: nodeId,
            },
          }),
        )
      }
    }
  }
}

function handleDependencyAnalysisDiagramLoaded(renderResult) {
  console.log('[GraphDocContent] 의존성 분석 다이어그램 로드 완료:', renderResult)
  isAnalyzing.value = false
  dependencyAnalysisDiagramRenderResult.value = renderResult
  dependencyDiagramRenderResult.value = null // 다른 다이어그램 초기화
  fileTreeDiagramRenderResult.value = null // 다른 다이어그램 초기화
  // 고정 노드 목록 업데이트 시작
  startFixedNodeListUpdate()
}

function handleDependencyAnalysisDiagramError(error) {
  console.error('[GraphDocContent] 의존성 분석 다이어그램 오류:', error)
  isAnalyzing.value = false
  // 오류는 콘솔에만 기록 (토스트 메시지 제거)
}

// 파일 구조 분석 실행
async function handleAnalyzeFileStructure(target, skipHistory = false) {
  if (!target || target === 'test') {
    $q.notify({
      type: 'warning',
      message: '분석 대상을 입력해주세요. 예: /dev, src/pages, src/components/ui',
      position: 'center',
      timeout: 5000,
    })
    return
  }

  // 중복 요청 방지
  if (isAnalyzing.value) {
    console.log('[GraphDocContent] 이미 분석 중입니다.')
    return
  }

  console.log('[GraphDocContent] 파일 구조 분석 시작:', target)
  isAnalyzing.value = true

  try {
    // 실제 파일 구조 분석
    const files = await analyzeFileStructure(target)

    if (files.length === 0) {
      $q.notify({
        type: 'warning',
        message: `분석 대상 파일을 찾을 수 없습니다: "${target}". 예시: /dev, src/pages, src/components/ui`,
        position: 'top',
        timeout: 5000,
      })
      isAnalyzing.value = false
      return
    }

    fileTreeData.value = files
    isAnalyzing.value = false

    // 히스토리에 추가 (히스토리 네비게이션으로 인한 호출이 아닌 경우만)
    if (!skipHistory) {
      // 파일명 추출 (표시용)
      const displayName = target.split('/').pop() || target
      addToHistory({
        target: target,
        diagramType: 'fileStructure',
        title: displayName,
        displayName: `${displayName} (${files.length}개 파일, 파일 구조)`,
        metadata: {
          filesCount: files.length,
        },
      })
    }
  } catch (error) {
    console.error('[GraphDocContent] 파일 구조 분석 오류:', error)
    isAnalyzing.value = false
    $q.notify({
      type: 'negative',
      message: '파일 구조 분석 중 오류가 발생했습니다.',
      position: 'top',
      timeout: 5000,
    })
  }
}

// 히스토리 항목 클릭 이벤트 리스너
async function handleHistoryItemClicked(event) {
  const { target, diagramType } = event.detail

  console.log('[GraphDocContent] 히스토리 항목 클릭:', { target, diagramType })

  // activeAccordion 설정 (다이어그램 타입에 따라)
  if (diagramType === 'dependencyGraph') {
    activeAccordion.value = 'dependencyGraph'
    // 분석 대상 설정
    analysisTarget.value = target
    // 재분석 실행 (히스토리 추가 스킵)
    await handleAnalyzeWithTarget(target, true)
  } else if (diagramType === 'dependencyAnalysis') {
    activeAccordion.value = 'dependencyAnalysis'
    // TODO: 의존성 분석 재분석 로직
  } else if (diagramType === 'fileStructure') {
    activeAccordion.value = 'fileStructure'
    // 분석 대상 설정
    analysisTarget.value = target
    // 재분석 실행 (히스토리 추가 스킵)
    await handleAnalyzeFileStructure(target, true)
  }
}

// 설정 변경 이벤트 리스너
function handleDiagramSettingsChanged(event) {
  const { type, changedTypes } = event.detail

  // 의존성 그래프 설정 변경
  if (type === diagramTypes.DEPENDENCY || type === 'dependency') {
    if (dependencyDiagramRef.value) {
      // 설정 변경에 따라 다이어그램 재렌더링 또는 부분 업데이트
      nextTick(() => {
        if (changedTypes.includes('nodeSize')) {
          // 노드 크기만 변경된 경우 부분 업데이트 가능
          // 현재는 전체 재렌더링
          dependencyDiagramRef.value?.renderDiagram()
        } else {
          // 레이아웃 등 다른 설정 변경 시 전체 재렌더링
          dependencyDiagramRef.value?.renderDiagram()
        }
      })
    }
  }

  // 파일 트리 설정 변경
  if (type === diagramTypes.FILETREE || type === 'filetree') {
    if (fileTreeDiagramRef.value) {
      nextTick(() => {
        fileTreeDiagramRef.value?.renderDiagram()
      })
    }
  }
}

// 패키지 의존성 분석 실행
async function handleAnalyzePackageDependencies(projectRoot = '') {
  console.log('[GraphDocContent] 패키지 의존성 분석 시작:', projectRoot)

  // 중복 요청 방지
  if (isAnalyzing.value) {
    console.log('[GraphDocContent] 이미 분석 중입니다.')
    return
  }

  isAnalyzing.value = true

  try {
    // 패키지 의존성 분석
    const result = await analyzePackageDependencies(projectRoot, {
      includeDevDependencies: true,
    })

    if (result.packages.length === 0) {
      $q.notify({
        type: 'warning',
        message: '분석된 패키지가 없습니다. package.json을 확인하세요.',
        position: 'top',
        timeout: 5000,
      })
      isAnalyzing.value = false
      return
    }

    dependencyAnalysisData.value = result
    isAnalyzing.value = false

    // activeAccordion이 dependencyAnalysis가 아니면 설정
    if (activeAccordion.value !== 'dependencyAnalysis') {
      activeAccordion.value = 'dependencyAnalysis'
      console.log('[GraphDocContent] activeAccordion을 dependencyAnalysis로 설정')
    }

    console.log('[GraphDocContent] 패키지 의존성 분석 완료:', {
      packagesCount: result.packages.length,
      dependenciesCount: result.dependencies.length,
    })
  } catch (error) {
    console.error('[GraphDocContent] 패키지 의존성 분석 실패:', error)
    $q.notify({
      type: 'negative',
      message: `패키지 의존성 분석 실패: ${error.message || error}`,
      position: 'top',
      timeout: 5000,
    })
    isAnalyzing.value = false
  }
}

// 패키지 의존성 분석 요청 이벤트 리스너 (사이드바에서 호출)
function handlePackageDependencyAnalyzeRequest(event) {
  const projectRoot = event?.detail?.projectRoot || ''
  handleAnalyzePackageDependencies(projectRoot)
}

onMounted(() => {
  // 전역 이벤트 리스너 등록
  window.addEventListener('graph-doc-accordion-change', handleAccordionChange)
  window.addEventListener('graph-doc-dependency-graph-analysis-target-change', handleAnalysisTargetChange)
  window.addEventListener('graph-doc-dependency-graph-analyze', handleAnalyzeRequest)
  window.addEventListener('graph-doc-dependency-graph-node-selected', handleNodeSelected)
  window.addEventListener('graph-doc-file-structure-analyze', handleFileStructureAnalyzeRequest)
  window.addEventListener('graph-doc-file-structure-analysis-target-change', handleFileStructureAnalysisTargetChange)
  window.addEventListener('graph-doc-dependency-analysis-analyze', handlePackageDependencyAnalyzeRequest)
  window.addEventListener('dependency-diagram-settings-changed', handleDiagramSettingsChanged)
  window.addEventListener('filetree-diagram-settings-changed', handleDiagramSettingsChanged)
  window.addEventListener('graph-doc-circular-dependencies', handleCircularDependencies)
  window.addEventListener('graph-doc-unused-files', handleUnusedFiles)
  window.addEventListener('graph-doc-dependency-stats', handleDependencyStats)
  window.addEventListener('graph-doc-code-complexity', handleCodeComplexity)
  window.addEventListener('graph-doc-history-item-clicked', handleHistoryItemClicked)
  window.addEventListener('graph-doc-unfix-node', handleUnfixNodeRequest)
  window.addEventListener('graph-doc-unfix-all-nodes', handleUnfixAllNodesRequest)
  window.addEventListener('graph-doc-highlight-node', handleHighlightNodeRequest)
  window.addEventListener('graph-doc-unhighlight-node', handleUnhighlightNodeRequest)
})

// 간단한 메뉴 항목 핸들러
function handleCircularDependencies() {
  console.log('[GraphDocContent] 순환 의존성 감지')
  $q.notify({
    type: 'info',
    message: '순환 의존성 감지 기능은 준비 중입니다.',
    position: 'top',
  })
  // TODO: 순환 의존성 감지 로직 구현
}

function handleUnusedFiles() {
  console.log('[GraphDocContent] 사용되지 않는 파일')
  $q.notify({
    type: 'info',
    message: '사용되지 않는 파일 찾기 기능은 준비 중입니다.',
    position: 'top',
  })
  // TODO: 사용되지 않는 파일 찾기 로직 구현
}

function handleDependencyStats() {
  console.log('[GraphDocContent] 의존성 통계')
  $q.notify({
    type: 'info',
    message: '의존성 통계 기능은 준비 중입니다.',
    position: 'top',
  })
  // TODO: 의존성 통계 로직 구현
}

function handleCodeComplexity() {
  console.log('[GraphDocContent] 코드 복잡도 분석')
  $q.notify({
    type: 'info',
    message: '코드 복잡도 분석 기능은 준비 중입니다.',
    position: 'top',
  })
  // TODO: 코드 복잡도 분석 로직 구현
}

// 고정 노드 목록 업데이트 시작
function startFixedNodeListUpdate() {
  // 기존 인터벌 제거
  if (fixedNodeListUpdateInterval.value) {
    clearInterval(fixedNodeListUpdateInterval.value)
  }

  // 이전 목록 초기화 (새 다이어그램 로드 시)
  previousFixedNodeIds = []

  // 초기 업데이트 (즉시 한 번 실행)
  updateFixedNodeList()

  // 500ms마다 고정 노드 목록 업데이트 (변경 감지 로직으로 불필요한 업데이트 방지)
  fixedNodeListUpdateInterval.value = setInterval(() => {
    updateFixedNodeList()
  }, 500)
}

// 고정 노드 목록 업데이트
function updateFixedNodeList() {
  const renderResult = dependencyDiagramRenderResult.value || fileTreeDiagramRenderResult.value || dependencyAnalysisDiagramRenderResult.value
  if (renderResult && renderResult.getFixedNodeIds) {
    const newFixedNodeIds = renderResult.getFixedNodeIds()

    // 변경 감지: 배열 길이와 내용 비교
    const hasChanged = newFixedNodeIds.length !== previousFixedNodeIds.length || newFixedNodeIds.some((id, i) => id !== previousFixedNodeIds[i])

    // 변경된 경우에만 업데이트 및 이벤트 발생
    if (hasChanged) {
      fixedNodeList.value = newFixedNodeIds
      previousFixedNodeIds = newFixedNodeIds // 참조 저장 (다음 비교용)

      // 사이드바 탭에 고정 노드 목록 전달
      window.dispatchEvent(
        new CustomEvent('graph-doc-fixed-nodes-updated', {
          detail: {
            nodeIds: fixedNodeList.value,
          },
        }),
      )
    }
    // 변경되지 않았으면 아무것도 하지 않음 (불필요한 업데이트 방지)
  } else {
    // renderResult가 없는 경우에도 변경 감지
    if (previousFixedNodeIds.length > 0) {
      fixedNodeList.value = []
      previousFixedNodeIds = []

      // 사이드바 탭에 빈 목록 전달
      window.dispatchEvent(
        new CustomEvent('graph-doc-fixed-nodes-updated', {
          detail: {
            nodeIds: [],
          },
        }),
      )
    }
  }
}

// 특정 노드 고정 해제
function handleUnfixNode(nodeId) {
  const renderResult = dependencyDiagramRenderResult.value || fileTreeDiagramRenderResult.value || dependencyAnalysisDiagramRenderResult.value
  if (renderResult && renderResult.unfixNodes) {
    renderResult.unfixNodes(nodeId)
    updateFixedNodeList()
  }
}

// 전체 노드 고정 해제
function handleUnfixAllNodes() {
  const renderResult = dependencyDiagramRenderResult.value || fileTreeDiagramRenderResult.value || dependencyAnalysisDiagramRenderResult.value
  if (renderResult && renderResult.unfixNodes) {
    renderResult.unfixNodes()
    updateFixedNodeList()
  }
}

// 사이드바에서 노드 고정 해제 요청 이벤트 리스너
function handleUnfixNodeRequest(event) {
  const { nodeId } = event.detail
  handleUnfixNode(nodeId)
}

// 사이드바에서 전체 노드 고정 해제 요청 이벤트 리스너
function handleUnfixAllNodesRequest() {
  handleUnfixAllNodes()
}

// 사이드바에서 노드 하이라이트 요청 이벤트 리스너
function handleHighlightNodeRequest(event) {
  const { nodeId } = event.detail
  highlightNode(nodeId, true)
}

// 사이드바에서 노드 하이라이트 해제 요청 이벤트 리스너
function handleUnhighlightNodeRequest(event) {
  const { nodeId } = event.detail
  highlightNode(nodeId, false)
}

// 노드 하이라이트 처리
function highlightNode(nodeId, highlight) {
  if (!nodeId) return

  const renderResult = dependencyDiagramRenderResult.value || fileTreeDiagramRenderResult.value
  if (!renderResult || !renderResult.svgGroup) {
    console.warn('[GraphDocContent] 다이어그램이 로드되지 않았습니다.')
    return
  }

  // SVG 그룹에서 노드 찾기 (data-node-id 속성 사용)
  const nodeElement = renderResult.svgGroup.select(`.node[data-node-id="${nodeId}"]`)

  if (nodeElement.empty()) {
    console.warn('[GraphDocContent] 노드를 찾을 수 없습니다:', nodeId)
    return
  }

  // node-hover 클래스 추가/제거
  nodeElement.classed('node-hover', highlight)

  // 하이라이트 시 노드를 최상위로 올림
  if (highlight) {
    nodeElement.raise()
  }
}

onBeforeUnmount(() => {
  // 고정 노드 목록 업데이트 인터벌 제거
  if (fixedNodeListUpdateInterval.value) {
    clearInterval(fixedNodeListUpdateInterval.value)
  }

  // 전역 이벤트 리스너 제거
  window.removeEventListener('graph-doc-accordion-change', handleAccordionChange)
  window.removeEventListener('graph-doc-dependency-graph-analysis-target-change', handleAnalysisTargetChange)
  window.removeEventListener('graph-doc-dependency-graph-analyze', handleAnalyzeRequest)
  window.removeEventListener('graph-doc-dependency-graph-node-selected', handleNodeSelected)
  window.removeEventListener('graph-doc-file-structure-analyze', handleFileStructureAnalyzeRequest)
  window.removeEventListener('graph-doc-file-structure-analysis-target-change', handleFileStructureAnalysisTargetChange)
  window.removeEventListener('dependency-diagram-settings-changed', handleDiagramSettingsChanged)
  window.removeEventListener('filetree-diagram-settings-changed', handleDiagramSettingsChanged)
  window.removeEventListener('graph-doc-circular-dependencies', handleCircularDependencies)
  window.removeEventListener('graph-doc-unused-files', handleUnusedFiles)
  window.removeEventListener('graph-doc-dependency-stats', handleDependencyStats)
  window.removeEventListener('graph-doc-code-complexity', handleCodeComplexity)
  window.removeEventListener('graph-doc-history-item-clicked', handleHistoryItemClicked)
  window.removeEventListener('graph-doc-unfix-node', handleUnfixNodeRequest)
  window.removeEventListener('graph-doc-unfix-all-nodes', handleUnfixAllNodesRequest)
  window.removeEventListener('graph-doc-highlight-node', handleHighlightNodeRequest)
  window.removeEventListener('graph-doc-unhighlight-node', handleUnhighlightNodeRequest)
})
</script>

<style lang="scss" scoped>
.graph-doc-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--nexa-background);
}

.graph-doc-main-content {
  flex: 1;
  overflow: hidden;
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

.graph-doc-empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
}

.empty-state-content {
  text-align: center;
  max-width: 600px;
}

.empty-state-title {
  color: var(--nexa-text-primary);
  font-size: 2rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem;
}

.empty-state-features {
  text-align: left;
  margin-top: 2rem;
}

.features-subtitle {
  color: var(--nexa-text-primary);
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.empty-state-features .features-list {
  color: var(--nexa-text-secondary);
  list-style-type: disc;
  margin-left: 1.5rem;
  line-height: 1.8;
}

.graph-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;

  :deep(.nexa-diagram) {
    width: 100%;
    height: 100%;
  }

  :deep(.nexa-diagram-container) {
    width: 100%;
    height: 100%;
  }
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
  max-width: 800px;
  width: 100%;
  background: var(--nexa-surface);
  border-radius: 8px;
  overflow-y: auto;
}

/* 다이어그램 전체 화면 모드 */
.graph-doc-diagram-full {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.graph-container-full {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden; /* fitToScreen이 그래프를 중앙에 맞추므로 overflow는 hidden 유지 */

  :deep(.nexa-diagram) {
    width: 100%;
    height: 100%;
  }

  :deep(.nexa-diagram-container) {
    width: 100%;
    height: 100%;
  }

  /* 3단계: 파일 트리 다이어그램의 최대 높이 제한 */
  /* 브라우저 높이를 넘지 않도록 제한 (헤더 300px 제외) */
  /* 가로가 커져도 세로는 calc(100vh - 300px)를 넘지 않음 */
  :deep(.nexa-diagram[data-diagram-type='filetree']) {
    max-height: calc(100vh - 300px);
  }

  :deep(.nexa-diagram[data-diagram-type='filetree'] .nexa-diagram-container) {
    max-height: calc(100vh - 300px);
  }

  :deep(.nexa-diagram[data-diagram-type='filetree'] .nexa-diagram-container svg) {
    max-height: calc(100vh - 300px);
  }
}

/* 사이드바만 표시 모드 */
.graph-doc-sidebar-only {
  flex: 1;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem;
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

/* 히스토리 네비게이션 버튼 */
.history-nav-btn {
  min-width: 32px;
  width: 32px;
  height: 32px;
}

.history-position {
  min-width: 40px;
  text-align: center;
  padding: 0 4px;
  font-size: 0.75rem;
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

.node-path-display {
  color: var(--nexa-text-primary);
  font-family: monospace;
  font-weight: 500;
}

.node-actions {
  margin-top: 1rem;
}

.node-info-card {
  width: 100%;
  background: var(--nexa-surface);
  border: 1px solid var(--nexa-border-color);
}

.node-info-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.node-info-item .node-info-label {
  font-size: 0.75rem;
  color: var(--nexa-text-secondary);
  font-weight: 500;
  min-width: 50px;
  flex-shrink: 0;
}

.node-info-item .node-info-value {
  font-size: 0.875rem;
  color: var(--nexa-text-primary);
  font-family: monospace;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.coming-soon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
}

.coming-soon-content {
  text-align: center;
  max-width: 600px;
}

.coming-soon-title {
  color: var(--nexa-text-primary);
  font-size: 2rem;
  font-weight: 600;
  margin: 1rem 0;
}

.coming-soon-description {
  color: var(--nexa-text-secondary);
  font-size: 1rem;
  margin: 0;
}

.coming-soon-features {
  text-align: left;
  margin-top: 2rem;
}

.features-title {
  color: var(--nexa-text-primary);
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.features-list {
  color: var(--nexa-text-secondary);
  list-style-type: disc;
  margin-left: 1.5rem;

  li {
    margin-bottom: 0.5rem;

    strong {
      color: var(--nexa-text-primary);
    }
  }
}
</style>
