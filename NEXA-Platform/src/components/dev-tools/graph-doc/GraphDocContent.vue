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
              <li>의존성 그래프 - 파일 간 의존성 관계 시각화</li>
              <li>의존성 분석 - 패키지 및 코드 의존성 분석</li>
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

      <!-- 다이어그램이 있을 때: 전체 컨텐츠 창에 다이어그램 렌더링 -->
      <div v-if="graphData" class="graph-doc-diagram-full">
        <div class="graph-container-full">
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
        </div>
      </div>
    </div>

    <!-- 의존성 분석 -->
    <div v-else-if="activeAccordion === 'dependencyAnalysis'" class="graph-doc-main-content">
      <!-- 다이어그램이 있을 때: 전체 컨텐츠 창에 다이어그램 렌더링 -->
      <div v-if="dependencyAnalysisData" class="graph-doc-diagram-full">
        <div class="graph-container-full">
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
            <h3 class="empty-state-title">의존성 분석</h3>
            <p class="empty-state-description">
              의존성 분석 기능을 준비 중입니다.<br />
              곧 패키지 및 코드 의존성을 분석하고 시각화할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 파일 구조 -->
    <div v-else-if="activeAccordion === 'fileStructure'" class="graph-doc-main-content">
      <!-- 다이어그램이 있을 때: 전체 컨텐츠 창에 다이어그램 렌더링 -->
      <div v-if="fileTreeData" class="graph-doc-diagram-full">
        <div class="graph-container-full">
          <NexaDiagram ref="fileTreeDiagramRef" type="filetree" :data="fileTreeDiagramData" :options="fileTreeDiagramOptions" @node-click="handleFileTreeNodeClick" @node-hover="handleFileTreeNodeHover" @loaded="handleFileTreeDiagramLoaded" @error="handleFileTreeDiagramError" />
        </div>
      </div>
      <!-- 다이어그램이 없을 때: 사이드바 정보 표시 -->
      <div v-else class="graph-doc-sidebar-only">
        <div class="graph-sidebar q-pa-md">
          <div class="sidebar-empty-state">
            <q-icon name="view_module" size="120px" color="grey-5" class="q-mb-md" />
            <h3 class="empty-state-title">파일 구조</h3>
            <p class="empty-state-description">
              파일 구조 분석 기능을 준비 중입니다.<br />
              곧 프로젝트 파일 구조를 트리 형태로 시각화할 수 있습니다.
            </p>
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
import NexaDiagram from 'src/diagram/NexaDiagram.vue'
import { diagramTypes } from 'src/diagram/config/diagramMetadata.js'

const $q = useQuasar()

// 활성 아코디언 (사이드바와 동기화)
const activeAccordion = ref(null)

// 분석 대상 (URL 또는 파일 경로) - 사이드바와 동기화
const analysisTarget = ref('')

// 분석 중 상태
const isAnalyzing = ref(false)

// 그래프 데이터
const graphData = ref(null)

// 선택된 노드
const selectedNode = ref(null)

// 다이어그램 refs
const dependencyDiagramRef = ref(null)
const fileTreeDiagramRef = ref(null)
const dependencyAnalysisDiagramRef = ref(null)

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
  const packages = nodes.map((node) => ({
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

// 분석 실행
function handleAnalyze() {
  // 테스트용: analysisTarget이 비어있어도 임시 데이터 생성
  const target = analysisTarget.value.trim() || 'test'

  console.log('[GraphDocContent] 의존성 그래프 분석 시작:', target)
  isAnalyzing.value = true

  // TODO: 실제 분석 API 호출
  setTimeout(() => {
    // 임시 데이터 (테스트용)
    graphData.value = {
      nodes: [
        { id: 'file1', name: 'File1.vue', path: 'src/components/File1.vue', type: 'vue' },
        { id: 'file2', name: 'File2.js', path: 'src/utils/File2.js', type: 'js' },
        { id: 'file3', name: 'File3.ts', path: 'src/types/File3.ts', type: 'ts' },
      ],
      edges: [
        { from: 'file1', to: 'file2', label: 'imports' },
        { from: 'file2', to: 'file3', label: 'imports' },
      ],
    }
    isAnalyzing.value = false
    console.log('[GraphDocContent] 의존성 그래프 데이터 설정 완료:', graphData.value)
    console.log('[GraphDocContent] activeAccordion:', activeAccordion.value)
    console.log('[GraphDocContent] dependencyDiagramData:', dependencyDiagramData.value)
    $q.notify({
      type: 'success',
      message: '분석이 완료되었습니다.',
      position: 'top',
    })
  }, 1000)
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

// 분석 대상 변경 이벤트 리스너
function handleAnalysisTargetChange(event) {
  const { value } = event.detail
  analysisTarget.value = value
}

// 분석 요청 이벤트 리스너
function handleAnalyzeRequest(event) {
  // 이벤트에서 분석 대상을 가져오거나, 비어있으면 기본값 사용
  const target = event?.detail?.target || analysisTarget.value || 'test'
  if (!analysisTarget.value) {
    analysisTarget.value = target
  }

  // activeAccordion이 dependencyGraph가 아니면 설정
  if (activeAccordion.value !== 'dependencyGraph') {
    activeAccordion.value = 'dependencyGraph'
    console.log('[GraphDocContent] activeAccordion을 dependencyGraph로 설정')
  }

  handleAnalyze()
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
}

function handleDependencyNodeHover(event) {
  // 호버 이벤트 처리 (필요 시)
  // 향후 확장 시 사용 예정
  void event
}

function handleDependencyDiagramLoaded(renderResult) {
  console.log('[GraphDocContent] 의존성 그래프 다이어그램 로드 완료:', renderResult)
}

function handleDependencyDiagramError(error) {
  console.error('[GraphDocContent] 의존성 그래프 다이어그램 오류:', error)
  $q.notify({
    type: 'negative',
    message: '다이어그램 렌더링 중 오류가 발생했습니다.',
    position: 'top',
  })
}

// 파일 트리 다이어그램 이벤트 핸들러
function handleFileTreeNodeClick(event) {
  const { nodeId, nodeData } = event
  selectedNode.value = nodeData || { path: nodeId, name: nodeId }
}

function handleFileTreeNodeHover(event) {
  // 호버 이벤트 처리 (필요 시)
  // 향후 확장 시 사용 예정
  void event
}

function handleFileTreeDiagramLoaded(renderResult) {
  console.log('[GraphDocContent] 파일 트리 다이어그램 로드 완료:', renderResult)
}

function handleFileTreeDiagramError(error) {
  console.error('[GraphDocContent] 파일 트리 다이어그램 오류:', error)
  $q.notify({
    type: 'negative',
    message: '다이어그램 렌더링 중 오류가 발생했습니다.',
    position: 'top',
  })
}

// 의존성 분석 다이어그램 이벤트 핸들러
function handleDependencyAnalysisNodeClick(event) {
  const { nodeId, nodeData } = event
  selectedNode.value = nodeData || { id: nodeId, name: nodeId }
}

function handleDependencyAnalysisNodeHover(event) {
  // 호버 이벤트 처리 (필요 시)
  // 향후 확장 시 사용 예정
  void event
}

function handleDependencyAnalysisDiagramLoaded(renderResult) {
  console.log('[GraphDocContent] 의존성 분석 다이어그램 로드 완료:', renderResult)
}

function handleDependencyAnalysisDiagramError(error) {
  console.error('[GraphDocContent] 의존성 분석 다이어그램 오류:', error)
  $q.notify({
    type: 'negative',
    message: '다이어그램 렌더링 중 오류가 발생했습니다.',
    position: 'top',
  })
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

onMounted(() => {
  // 테스트용 파일 구조 데이터 생성
  nextTick(() => {
    fileTreeData.value = [
      { path: 'src/components/Button.vue', type: 'vue' },
      { path: 'src/components/Card.vue', type: 'vue' },
      { path: 'src/utils/helpers.js', type: 'js' },
      { path: 'src/utils/constants.js', type: 'js' },
      { path: 'src/stores/userStore.js', type: 'js' },
      { path: 'src/stores/appStore.js', type: 'js' },
      { path: 'src/router/index.js', type: 'js' },
      { path: 'src/router/routes.js', type: 'js' },
      { path: 'src/pages/Home.vue', type: 'vue' },
      { path: 'src/pages/About.vue', type: 'vue' },
      { path: 'src/css/app.scss', type: 'scss' },
      { path: 'src/css/themes/dark.scss', type: 'scss' },
      { path: 'package.json', type: 'json' },
      { path: 'README.md', type: 'md' },
    ]

    // 테스트용 의존성 분석 데이터 생성
    dependencyAnalysisData.value = {
      packages: [
        { id: 'vue', name: 'vue', radius: 50, color: '#42b883' },
        { id: 'quasar', name: 'quasar', radius: 45, color: '#1976d2' },
        { id: 'd3', name: 'd3', radius: 40, color: '#f9a03c' },
        { id: 'dagre', name: 'dagre', radius: 35, color: '#ff6b6b' },
        { id: 'pinia', name: 'pinia', radius: 30, color: '#ffd93d' },
      ],
      dependencies: [
        { from: 'vue', to: 'quasar' },
        { from: 'quasar', to: 'd3' },
        { from: 'd3', to: 'dagre' },
        { from: 'vue', to: 'pinia' },
        { from: 'quasar', to: 'pinia' },
      ],
    }
  })

  // 전역 이벤트 리스너 등록
  window.addEventListener('graph-doc-accordion-change', handleAccordionChange)
  window.addEventListener('graph-doc-dependency-graph-analysis-target-change', handleAnalysisTargetChange)
  window.addEventListener('graph-doc-dependency-graph-analyze', handleAnalyzeRequest)
  window.addEventListener('graph-doc-dependency-graph-node-selected', handleNodeSelected)
  window.addEventListener('dependency-diagram-settings-changed', handleDiagramSettingsChanged)
  window.addEventListener('filetree-diagram-settings-changed', handleDiagramSettingsChanged)
})

onBeforeUnmount(() => {
  // 전역 이벤트 리스너 제거
  window.removeEventListener('graph-doc-accordion-change', handleAccordionChange)
  window.removeEventListener('graph-doc-dependency-graph-analysis-target-change', handleAnalysisTargetChange)
  window.removeEventListener('graph-doc-dependency-graph-analyze', handleAnalyzeRequest)
  window.removeEventListener('graph-doc-dependency-graph-node-selected', handleNodeSelected)
  window.removeEventListener('dependency-diagram-settings-changed', handleDiagramSettingsChanged)
  window.removeEventListener('filetree-diagram-settings-changed', handleDiagramSettingsChanged)
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
}

.graph-container-full {
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
