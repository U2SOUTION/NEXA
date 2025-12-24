<!-- NexaDiagram.vue
  재사용 가능한 순수 다이어그램 컴포넌트
  타입, 데이터, 옵션만 전달하면 렌더링됩니다.
-->

<template>
  <div ref="diagramContainer" class="nexa-diagram">
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
    <div v-show="!isLoading && !error" ref="diagramInnerContainer" class="nexa-diagram-container"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { renderERD, updateERD } from './erd/ERDDiagram.js'
import { renderFlow } from './flow/FlowDiagram.js'
import { renderNetwork } from './network/NetworkDiagram.js'
import { diagramTypes } from './config/diagramMetadata.js'

const props = defineProps({
  // 다이어그램 타입
  type: {
    type: String,
    required: true,
    validator: (value) => Object.values(diagramTypes).includes(value),
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

// 렌더러 맵핑
const renderers = {
  [diagramTypes.ERD]: renderERD,
  [diagramTypes.FLOW]: renderFlow,
  [diagramTypes.NETWORK]: renderNetwork,
}

// 다이어그램 렌더링
async function renderDiagram() {
  if (!diagramInnerContainer.value) {
    console.warn('[NexaDiagram] 컨테이너가 없습니다.')
    return
  }

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
    if (newSelectedNode !== oldSelectedNode && renderResult && props.type === diagramTypes.ERD) {
      // ERD 업데이트 - 스타일만 변경, 레이아웃 재계산 없음
      updateERD(renderResult, props.data, props.options)
    }
  },
)

// 데이터 변경 감지
watch(
  () => props.data,
  () => {
    if (props.autoLoad) {
      renderDiagram()
    }
  },
  { deep: true },
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

  // 선택된 노드 스타일
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
      font-size: 16px;
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
