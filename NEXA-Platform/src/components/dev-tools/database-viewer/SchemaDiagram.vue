<!-- SchemaDiagram.vue
  ERD 다이어그램 컴포넌트
  D3.js + dagre-d3-es를 사용하여 테이블 관계 시각화
-->

<template>
  <div class="schema-diagram">
    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="schema-diagram-loading q-pa-lg text-center">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-md text-caption">ERD 다이어그램을 불러오는 중...</div>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="schema-diagram-error q-pa-lg text-center">
      <q-icon name="error_outline" size="48px" color="negative" class="q-mb-md" />
      <div class="text-body2 text-negative q-mb-sm">{{ error }}</div>
      <q-btn flat dense label="다시 시도" icon="refresh" @click="loadSchemaData" />
    </div>

    <!-- 다이어그램 컨테이너 -->
    <div v-else ref="diagramContainer" class="schema-diagram-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as d3 from 'd3'

// dagre-d3-es는 동적 임포트 (필요시 설치)
let dagreD3 = null

const diagramContainer = ref(null)
const isLoading = ref(false)
const error = ref(null)
let svg = null
let svgGroup = null
let zoom = null
let graph = null

// 스키마 데이터 로드
async function loadSchemaData() {
  isLoading.value = true
  error.value = null

  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

    // 테이블 목록과 관계 정보를 동시에 가져오기
    const [tablesResponse, relationshipsResponse] = await Promise.all([
      fetch(`${apiBaseUrl}/db/tables`),
      fetch(`${apiBaseUrl}/db/relationships`),
    ])

    // 503 에러 체크
    if (tablesResponse.status === 503 || relationshipsResponse.status === 503) {
      throw new Error('데이터베이스 연결이 없습니다.')
    }

    const tablesData = await tablesResponse.json()
    const relationshipsData = await relationshipsResponse.json()

    if (!tablesData.success || !relationshipsData.success) {
      throw new Error('스키마 데이터를 불러오는데 실패했습니다.')
    }

    // dagre-d3-es 동적 임포트
    if (!dagreD3) {
      try {
        dagreD3 = await import('dagre-d3-es')
      } catch (importError) {
        console.error('[SchemaDiagram] dagre-d3-es 임포트 실패:', importError)
        throw new Error('dagre-d3-es 라이브러리를 찾을 수 없습니다. npm install dagre-d3-es를 실행하세요.')
      }
    }

    // 다이어그램 렌더링
    await nextTick()
    renderDiagram(tablesData.data, relationshipsData.data)
  } catch (err) {
    // ERR_CONNECTION_REFUSED 등 네트워크 에러 처리
    if (err.name === 'TypeError' && err.message?.includes('Failed to fetch')) {
      error.value = '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.'
      console.warn('[SchemaDiagram] 서버 연결 실패:', err.message)
    } else {
      console.error('[SchemaDiagram] 스키마 데이터 로드 실패:', err)
      error.value = err.message || 'ERD 다이어그램을 불러오는데 실패했습니다.'
    }
  } finally {
    isLoading.value = false
  }
}

// 다이어그램 렌더링
function renderDiagram(tables, relationships) {
  if (!diagramContainer.value || !dagreD3) return

  // 기존 SVG 제거
  d3.select(diagramContainer.value).selectAll('*').remove()

  // SVG 생성
  const containerWidth = diagramContainer.value.clientWidth || 800
  const containerHeight = diagramContainer.value.clientHeight || 600

  svg = d3
    .select(diagramContainer.value)
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
    .style('background-color', 'var(--nexa-background)')

  svgGroup = svg.append('g')

  // Dagre 그래프 생성
  graph = new dagreD3.graphlib.Graph()
    .setGraph({
      rankdir: 'LR', // 좌우 방향
      nodesep: 50, // 노드 간격
      ranksep: 80, // 레벨 간격
      marginx: 50,
      marginy: 50,
    })
    .setDefaultEdgeLabel(() => ({}))

  // 노드 추가 (테이블)
  tables.forEach((table) => {
    graph.setNode(table.name, {
      label: table.name,
      shape: 'rect',
      style: 'fill: var(--nexa-surface); stroke: var(--nexa-border-color); stroke-width: 2px;',
      labelStyle: 'fill: var(--nexa-text-primary); font-size: 14px; font-weight: 600;',
    })
  })

  // 엣지 추가 (외래키 관계)
  relationships.forEach((rel) => {
    graph.setEdge(rel.fromTable, rel.toTable, {
      label: `${rel.fromColumn} → ${rel.toColumn}`,
      arrowhead: 'vee',
      style: 'stroke: var(--nexa-primary); stroke-width: 2px; fill: none;',
      labelStyle: 'fill: var(--nexa-text-secondary); font-size: 12px;',
    })
  })

  // Dagre 레이아웃 계산
  dagreD3.layout(graph)

  // D3.js로 렌더링
  const render = new dagreD3.render()
  render(svgGroup, graph)

  // 줌/팬 기능
  zoom = d3
    .zoom()
    .scaleExtent([0.1, 3])
    .on('zoom', (event) => {
      svgGroup.attr('transform', event.transform)
    })

  svg.call(zoom)

  // 초기 줌 설정 (그래프가 화면에 맞도록)
  const bounds = svgGroup.node().getBBox()
  const fullWidth = bounds.width
  const fullHeight = bounds.height
  const width = containerWidth
  const height = containerHeight
  const midX = bounds.x + fullWidth / 2
  const midY = bounds.y + fullHeight / 2

  if (fullWidth > 0 && fullHeight > 0) {
    const scale = Math.min(width / fullWidth, height / fullHeight) * 0.9
    const translate = [width / 2 - scale * midX, height / 2 - scale * midY]

    svg.call(
      zoom.transform,
      d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
    )
  }
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  loadSchemaData()
})

// 컴포넌트 언마운트 시 정리
onBeforeUnmount(() => {
  if (svg) {
    svg.on('.zoom', null) // 줌 이벤트 제거
  }
})
</script>

<style lang="scss" scoped>
.schema-diagram {
  height: 100%;
  width: 100%;
  position: relative;
}

.schema-diagram-loading,
.schema-diagram-error {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.schema-diagram-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

// D3.js SVG 스타일 (전역 스타일이 필요하므로 :deep 사용)
:deep(.schema-diagram-container) {
  svg {
    width: 100%;
    height: 100%;
  }

  // 노드 스타일
  .node rect {
    rx: 4px;
    ry: 4px;
  }

  // 엣지 스타일
  .edgePath path {
    marker-end: url(#arrowhead);
  }

  // 화살표 마커
  .marker {
    fill: var(--nexa-primary);
  }
}
</style>

