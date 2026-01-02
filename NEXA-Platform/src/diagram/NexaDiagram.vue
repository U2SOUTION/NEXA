<!-- NexaDiagram.vue
  재사용 가능한 순수 다이어그램 컴포넌트
  타입, 데이터, 옵션만 전달하면 렌더링됩니다.
-->

<template>
  <div ref="diagramContainer" class="nexa-diagram" :data-diagram-type="type">
    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="nexa-diagram-loading q-pa-lg text-center">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-md text-caption">다이어그램을 불러오는 중...</div>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="nexa-diagram-error q-pa-lg text-center">
      <q-icon name="error_outline" size="48px" color="negative" class="q-mb-md" />
      <div class="text-body2 text-negative q-mb-sm">{{ error }}</div>
      <q-btn flat dense label="다시 시도" icon="refresh" @click="handleRetry" />
    </div>

    <!-- 다이어그램 컨테이너 -->
    <div v-show="!isLoading && !error" ref="diagramInnerContainer" class="nexa-diagram-container" :data-diagram-type="type"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { renderERD, updateERD } from './erd/ERDDiagram.js'
import { renderFlow } from './flow/FlowDiagram.js'
import { renderNetwork } from './network/NetworkDiagram.js'
import { renderForceDirected } from './dependency/ForceDirectedDiagram.js'
import { renderFileTree } from './filetree/FileTreeDiagram.js'
import { diagramTypes } from './config/diagramMetadata.js'

const props = defineProps({
  // 다이어그램 타입
  type: {
    type: String,
    required: true,
    validator: (value) => {
      // diagramTypes의 모든 값 허용
      const validTypes = Object.values(diagramTypes)
      return validTypes.includes(value)
    },
  },
  // 다이어그램 데이터
  data: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  // 다이어그램 옵션
  options: {
    type: Object,
    default: () => ({
      selectedNode: null,
      layoutType: 'hierarchical',
      layoutOptions: {},
    }),
  },
  // 자동 로드 여부
  autoLoad: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['node-click', 'node-hover', 'node-double-click', 'edge-click', 'canvas-click', 'error', 'loaded'])

const diagramContainer = ref(null)
const diagramInnerContainer = ref(null)
const isLoading = ref(false)
const error = ref(null)
let renderResult = null
let isRendering = false // 렌더링 중 플래그

// 렌더러 맵핑
const renderers = {
  [diagramTypes.ERD]: renderERD,
  [diagramTypes.FLOW]: renderFlow,
  [diagramTypes.NETWORK]: renderNetwork,
  // dependency 타입도 force-directed 그래프 사용 (파일 의존성 그래프는 물리 기반)
  [diagramTypes.DEPENDENCY]: (container, data, options) => renderForceDirected(container, data, { ...options, diagramType: diagramTypes.DEPENDENCY }),
  [diagramTypes.DEPENDENCY_ANALYSIS]: (container, data, options) => renderForceDirected(container, data, { ...options, diagramType: diagramTypes.DEPENDENCY_ANALYSIS }),
  [diagramTypes.FILETREE]: renderFileTree,
}

// 다이어그램 렌더링
async function renderDiagram() {
  if (!diagramInnerContainer.value) {
    console.warn('[NexaDiagram] 컨테이너가 없습니다.')
    return
  }

  // 렌더링 중이면 무시
  if (isRendering) {
    console.warn('[NexaDiagram] 이미 렌더링 중입니다.')
    return
  }

  isRendering = true
  isLoading.value = true
  error.value = null

  try {
    const renderer = renderers[props.type]
    if (!renderer) {
      throw new Error(`지원하지 않는 다이어그램 타입: ${props.type}`)
    }

    // 이벤트 핸들러 생성
    const eventHandlers = {
      onNodeClick: (nodeId, nodeData) => {
        emit('node-click', { nodeId, nodeData })
      },
      onNodeHover: (nodeId, nodeData, isEntering) => {
        emit('node-hover', { nodeId, nodeData, isEntering })
      },
    }

    // 렌더링 옵션 병합
    const renderOptions = {
      ...props.options,
      ...eventHandlers,
    }

    // 렌더링 실행
    renderResult = await renderer(diagramInnerContainer.value, props.data, renderOptions)

    emit('loaded', renderResult)
  } catch (err) {
    console.error('[NexaDiagram] 렌더링 실패:', err)
    error.value = err.message || '다이어그램을 렌더링하는데 실패했습니다.'
    emit('error', err)
  } finally {
    isLoading.value = false
    isRendering = false
  }
}

// 다시 시도
function handleRetry() {
  renderDiagram()
}

// 선택된 노드 변경 감지
watch(
  () => props.options?.selectedNode,
  (newSelectedNode, oldSelectedNode) => {
    if (newSelectedNode !== oldSelectedNode && renderResult) {
      if (props.type === diagramTypes.ERD) {
        // ERD 업데이트 - 스타일만 변경, 레이아웃 재계산 없음
        updateERD(renderResult, props.data, props.options)
      } else if (props.type === diagramTypes.DEPENDENCY || props.type === 'dependency') {
        // 의존성 그래프는 전체 재렌더링 (향후 부분 업데이트 추가 가능)
        renderDiagram()
      }
      // 파일 트리와 의존성 분석은 Force-Directed Graph이므로
      // selectedNode 변경 시 내부에서 스타일만 업데이트하므로 재렌더링 불필요
    }
  },
)

// 데이터 변경 감지
watch(
  () => props.data,
  (newData, oldData) => {
    // 데이터가 실제로 변경되었는지 확인 (참조 비교)
    if (newData === oldData) return

    // 데이터가 변경되면 이전 렌더링을 취소하고 새로 시작
    // (렌더링 중이어도 새로운 데이터로 재렌더링해야 함)
    if (isRendering) {
      console.log('[NexaDiagram] 데이터 변경 감지: 이전 렌더링 취소하고 새로 시작')
      isRendering = false // 이전 렌더링 취소
    }

    // 의존성 분석 다이어그램의 경우, packages와 dependencies 배열의 길이와 내용을 비교
    if (props.type === diagramTypes.DEPENDENCY_ANALYSIS) {
      const newPackages = newData?.packages || []
      const oldPackages = oldData?.packages || []
      const newDeps = newData?.dependencies || []
      const oldDeps = oldData?.dependencies || []

      // 배열 길이와 첫 번째 요소만 비교 (성능 최적화)
      if (newPackages.length === oldPackages.length && newDeps.length === oldDeps.length && newPackages.length > 0 && newPackages[0]?.id === oldPackages[0]?.id && newDeps.length > 0 && newDeps[0]?.from === oldDeps[0]?.from) {
        return // 실제 변경 없음
      }
    }

    if (props.autoLoad) {
      // isRendering을 먼저 설정하지 말고, renderDiagram() 내부에서 설정하도록 함
      renderDiagram()
    }
  },
  { deep: false }, // deep watch 제거하여 성능 개선
)

// 컴포넌트 마운트 시 렌더링
onMounted(() => {
  if (props.autoLoad) {
    nextTick(() => {
      renderDiagram()
    })
  }
})

// 컴포넌트 언마운트 시 정리
onBeforeUnmount(() => {
  // cleanup 함수 호출 (툴팁 제거 등)
  if (renderResult?.cleanup) {
    renderResult.cleanup()
  }
  // 다이어그램 정리
  if (renderResult?.zoom && renderResult?.svg) {
    renderResult.svg.on('.zoom', null)
  }
  if (renderResult?.svg) {
    renderResult.svg.selectAll('*').remove()
  }
})

// 외부에서 렌더링을 트리거할 수 있도록 expose
defineExpose({
  renderDiagram,
  get renderResult() {
    return renderResult
  },
})
</script>

<style lang="scss" scoped>
.nexa-diagram {
  height: 100%;
  width: 100%;
  position: relative;
}

.nexa-diagram-loading,
.nexa-diagram-error {
  min-height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.nexa-diagram-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 1px solid rgb(0, 232, 112);
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

// D3.js SVG 스타일 (전역 스타일이 필요하므로 :deep 사용)
:deep(.nexa-diagram-container) {
  svg {
    width: 100%;
    height: 100%;
    background-color: var(--nexa-background);
  }

  // 노드 기본 스타일
  .node {
    pointer-events: all;
    cursor: default;

    rect {
      rx: 4px;
      ry: 4px;
      fill: var(--nexa-surface);
      stroke: var(--nexa-border-color);
      stroke-width: 2px;
      pointer-events: all;
    }

    text {
      text-anchor: middle !important;
      dominant-baseline: middle !important;
      fill: var(--nexa-text-primary);
      font-size: 14px;
      font-weight: 600;
      pointer-events: none; // text는 이벤트를 부모로 전달
    }
  }

  // 선택된 노드 스타일 (크기 변경 없이 색상과 스타일만 변경)
  .node.node-selected {
    rect {
      fill: var(--nexa-primary);
      stroke: var(--nexa-primary);
      stroke-width: 4px;
      filter: drop-shadow(0 4px 8px rgba(0, 118, 253, 0.5));
      opacity: 1;
    }

    text {
      fill: #ffffff;
      font-weight: 700;
    }
  }

  // 노드 호버 스타일
  .node.node-hover {
    cursor: pointer;

    rect {
      stroke: var(--nexa-primary) !important;
      stroke-width: 1px !important;
      opacity: 0.9;
    }

    circle {
      stroke: var(--nexa-primary) !important;
      stroke-width: 4px !important;
      filter: drop-shadow(0 0 8px var(--nexa-primary));
    }

    //노드 내부 라벨 호버 스타일 (PackageDependencyDiagram, FileTreeDiagram용)
    text {
      filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.684));
    }
  }

  // 강조된 링크 스타일 (Force-Directed Graph용)
  .link.link-highlighted {
    stroke: var(--nexa-primary) !important;
    stroke-width: 3px !important;
    stroke-opacity: 1 !important;
    filter: drop-shadow(0 0 4px var(--nexa-primary));
  }

  // 연결된 노드 스타일 (Force-Directed Graph용)
  .node.node-connected {
    circle {
      stroke: var(--nexa-primary) !important;
      stroke-width: 3px !important;
      opacity: 0.8;
    }
  }

  // 고정된 노드 스타일 (Force-Directed Graph용)
  .node.node-fixed {
    circle {
      stroke: var(--nexa-accent) !important;
      stroke-width: 5px !important;
    }
  }

  // 엣지 기본 스타일
  .edgePath path {
    stroke: var(--nexa-primary);
    stroke-width: 2px;
    fill: none;
    marker-end: url(#arrowhead);
  }

  // 엣지 라벨 스타일
  .edgeLabel text {
    fill: var(--nexa-text-secondary);
    font-size: 12px;
  }

  // 화살표 마커
  .marker {
    fill: var(--nexa-primary);
  }
}
</style>
