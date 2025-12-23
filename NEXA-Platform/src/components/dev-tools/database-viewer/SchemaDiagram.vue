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

    <!-- 다이어그램 컨테이너 (항상 렌더링) -->
    <div ref="diagramContainer" class="schema-diagram-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as d3 from 'd3'

// dagre-d3-es는 동적 임포트 (필요시 설치)
let dagre = null // dagre 패키지 (레이아웃 계산)
let graphlib = null // dagre-d3-es의 graphlib (그래프 생성)
let render = null // dagre-d3-es의 render (D3 렌더링)

const diagramContainer = ref(null)
const isLoading = ref(false)
const error = ref(null)
let svg = null
let svgGroup = null
let zoom = null
let graph = null

// 스키마 데이터 로드
async function loadSchemaData() {
  console.log('[SchemaDiagram] 데이터 로드 시작')
  isLoading.value = true
  error.value = null

  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
    console.log('[SchemaDiagram] API Base URL:', apiBaseUrl)

    // 테이블 목록과 관계 정보를 동시에 가져오기
    console.log('[SchemaDiagram] API 호출 시작...')
    const [tablesResponse, relationshipsResponse] = await Promise.all([fetch(`${apiBaseUrl}/db/tables`), fetch(`${apiBaseUrl}/db/relationships`)])

    console.log('[SchemaDiagram] API 응답 상태:', {
      tables: tablesResponse.status,
      relationships: relationshipsResponse.status,
    })

    // 503 에러 체크
    if (tablesResponse.status === 503 || relationshipsResponse.status === 503) {
      throw new Error('데이터베이스 연결이 없습니다.')
    }

    const tablesData = await tablesResponse.json()
    const relationshipsData = await relationshipsResponse.json()

    console.log('[SchemaDiagram] API 응답 데이터:', {
      tables: tablesData,
      relationships: relationshipsData,
    })

    if (!tablesData.success || !relationshipsData.success) {
      throw new Error('스키마 데이터를 불러오는데 실패했습니다.')
    }

    console.log('[SchemaDiagram] 테이블 개수:', tablesData.data?.length)
    console.log('[SchemaDiagram] 관계 개수:', relationshipsData.data?.length)

    // dagre-d3-es 동적 임포트
    if (!dagre || !graphlib || !render) {
      try {
        console.log('[SchemaDiagram] dagre-d3-es 임포트 시도...')

        // dagre-d3-es는 graphlib, render, intersect를 named export로 제공
        const dagreD3Module = await import('dagre-d3-es')
        console.log('[SchemaDiagram] dagre-d3-es 모듈 키:', Object.keys(dagreD3Module))

        // graphlib과 render는 직접 사용
        graphlib = dagreD3Module.graphlib
        render = dagreD3Module.render

        console.log('[SchemaDiagram] graphlib:', graphlib)
        console.log('[SchemaDiagram] render:', render)

        // dagre는 별도 패키지에서 임포트 (레이아웃 계산용)
        console.log('[SchemaDiagram] dagre 패키지 임포트 시도...')
        const dagreModule = await import('dagre')
        dagre = dagreModule.default || dagreModule

        console.log('[SchemaDiagram] dagre:', dagre)
        console.log('[SchemaDiagram] dagre.layout 타입:', typeof dagre?.layout)
        console.log('[SchemaDiagram] graphlib.Graph 타입:', typeof graphlib?.Graph)
        console.log('[SchemaDiagram] render 타입:', typeof render)
      } catch (importError) {
        console.error('[SchemaDiagram] dagre/dagre-d3-es 임포트 실패:', importError)
        throw new Error('dagre 또는 dagre-d3-es 라이브러리를 찾을 수 없습니다. npm install dagre dagre-d3-es를 실행하세요.')
      }
    }

    // 다이어그램 렌더링
    console.log('[SchemaDiagram] 다이어그램 렌더링 시작...')
    await nextTick()
    renderDiagram(tablesData.data, relationshipsData.data)
    console.log('[SchemaDiagram] 다이어그램 렌더링 완료')
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
  console.log('[SchemaDiagram] renderDiagram 호출됨')
  console.log('[SchemaDiagram] diagramContainer.value:', diagramContainer.value)
  console.log('[SchemaDiagram] dagre:', dagre)
  console.log('[SchemaDiagram] graphlib:', graphlib)
  console.log('[SchemaDiagram] render:', render)
  console.log('[SchemaDiagram] tables:', tables)
  console.log('[SchemaDiagram] relationships:', relationships)

  if (!diagramContainer.value) {
    console.error('[SchemaDiagram] diagramContainer가 없습니다!')
    return
  }

  if (!dagre || !graphlib || !render) {
    console.error('[SchemaDiagram] dagre, graphlib 또는 render가 없습니다!')
    return
  }

  // 기존 SVG 제거
  d3.select(diagramContainer.value).selectAll('*').remove()

  // 컨테이너 크기 확인 (약간의 지연을 두어 DOM이 완전히 렌더링된 후 크기 측정)
  setTimeout(() => {
    if (!diagramContainer.value) {
      console.error('[SchemaDiagram] setTimeout 내부에서 diagramContainer가 없습니다!')
      return
    }

    const containerWidth = diagramContainer.value.clientWidth || 800
    const containerHeight = diagramContainer.value.clientHeight || 600

    console.log('[SchemaDiagram] 컨테이너 크기:', containerWidth, containerHeight)

    if (containerWidth === 0 || containerHeight === 0) {
      console.warn('[SchemaDiagram] 컨테이너 크기가 0입니다. 다시 시도합니다...')
      setTimeout(() => renderDiagram(tables, relationships), 200)
      return
    }

    svg = d3.select(diagramContainer.value).append('svg').attr('width', '100%').attr('height', '100%').attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`).style('background-color', 'var(--nexa-background)')

    svgGroup = svg.append('g')

    console.log('[SchemaDiagram] SVG 생성 완료, 그래프 렌더링 시작...')
    renderGraphContent(tables, relationships, containerWidth, containerHeight)
  }, 100)
}

// 그래프 내용 렌더링
function renderGraphContent(tables, relationships, containerWidth, containerHeight) {
  console.log('[SchemaDiagram] renderGraphContent 호출됨')
  console.log('[SchemaDiagram] svgGroup:', svgGroup)
  console.log('[SchemaDiagram] graphlib:', graphlib)
  console.log('[SchemaDiagram] render:', render)

  if (!svgGroup) {
    console.error('[SchemaDiagram] svgGroup이 없습니다!')
    return
  }

  if (!graphlib || !dagre || !render) {
    console.error('[SchemaDiagram] graphlib, dagre 또는 render가 없습니다!')
    return
  }

  // Dagre 그래프 생성
  console.log('[SchemaDiagram] Dagre 그래프 생성 시작...')
  console.log('[SchemaDiagram] graphlib:', graphlib)
  console.log('[SchemaDiagram] graphlib.Graph:', graphlib.Graph)

  graph = new graphlib.Graph()
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
  console.log('[SchemaDiagram] 레이아웃 계산 시작...')
  console.log('[SchemaDiagram] dagre:', dagre)
  console.log('[SchemaDiagram] dagre.layout 타입:', typeof dagre?.layout)

  // dagre.layout이 함수인지 확인
  if (dagre && typeof dagre.layout === 'function') {
    dagre.layout(graph)
    console.log('[SchemaDiagram] dagre.layout() 호출 완료')
  } else {
    console.error('[SchemaDiagram] dagre.layout이 함수가 아닙니다!')
    console.log('[SchemaDiagram] dagre 객체 키:', Object.keys(dagre || {}))
    throw new Error('dagre layout 함수를 찾을 수 없습니다.')
  }

  console.log('[SchemaDiagram] 레이아웃 계산 완료')

  // D3.js로 렌더링
  console.log('[SchemaDiagram] D3.js 렌더링 시작...')
  console.log('[SchemaDiagram] render 타입:', typeof render)

  if (render) {
    // render는 dagre-d3-es에서 임포트한 클래스 생성자
    // new render()로 인스턴스를 생성하고, 인스턴스를 호출하여 렌더링
    const renderer = new render()
    renderer(svgGroup, graph)
    console.log('[SchemaDiagram] D3.js 렌더링 완료')
  } else {
    console.error('[SchemaDiagram] render를 찾을 수 없습니다!')
    console.log('[SchemaDiagram] render 객체:', render)
    throw new Error('render를 찾을 수 없습니다.')
  }

  // 줌/팬 기능
  console.log('[SchemaDiagram] 줌/팬 기능 설정...')
  zoom = d3
    .zoom()
    .scaleExtent([0.1, 3])
    .on('zoom', (event) => {
      svgGroup.attr('transform', event.transform)
    })

  svg.call(zoom)
  console.log('[SchemaDiagram] 줌/팬 기능 설정 완료')

  // 초기 줌 설정 (그래프가 화면에 맞도록)
  setTimeout(() => {
    try {
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

        svg.call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale))
      }
    } catch (err) {
      console.warn('[SchemaDiagram] 초기 줌 설정 실패:', err)
    }
  }, 50)
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  console.log('[SchemaDiagram] 컴포넌트 마운트됨')
  console.log('[SchemaDiagram] diagramContainer:', diagramContainer.value)

  // nextTick을 사용하여 DOM이 완전히 렌더링된 후 데이터 로드
  nextTick(() => {
    console.log('[SchemaDiagram] nextTick 후 diagramContainer:', diagramContainer.value)
    if (diagramContainer.value) {
      loadSchemaData()
    } else {
      console.error('[SchemaDiagram] diagramContainer가 여전히 없습니다!')
      // 재시도
      setTimeout(() => {
        console.log('[SchemaDiagram] 재시도 - diagramContainer:', diagramContainer.value)
        if (diagramContainer.value) {
          loadSchemaData()
        }
      }, 100)
    }
  })
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
