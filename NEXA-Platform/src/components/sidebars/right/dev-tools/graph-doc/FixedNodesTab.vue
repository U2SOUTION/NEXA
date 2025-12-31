<!-- FixedNodesTab.vue
  GraphDoc 고정 노드 관리 탭
  고정된 노드 목록 표시 및 관리
-->

<template>
  <div class="fixed-nodes-tab">
    <!-- 헤더: 전체 해제 버튼 -->
    <div class="fixed-nodes-header q-pa-sm">
      <div class="row items-center justify-between">
        <div class="text-caption text-grey-6">{{ fixedNodeList.length }}개 노드 고정됨</div>
        <q-btn flat dense round icon="delete_sweep" @click="handleUnfixAllNodes">
          <q-tooltip>전체 해제</q-tooltip>
        </q-btn>
      </div>
    </div>

    <q-separator />

    <!-- 고정 노드 목록 -->
    <q-scroll-area class="fixed-nodes-list-area" :style="{ height: scrollAreaHeight }">
      <div v-if="fixedNodeList.length === 0" class="empty-state q-pa-md text-center">
        <q-icon name="lock_open" size="48px" color="grey-5" class="q-mb-sm" />
        <div class="text-caption text-grey-6">고정된 노드가 없습니다</div>
      </div>

      <div v-else class="fixed-nodes-list">
        <div v-for="nodeId in fixedNodeList" :key="nodeId" :class="['fixed-node-item', { 'fixed-node-item-highlighted': highlightedNodeId === nodeId }]" @mouseenter="handleNodeMouseEnter(nodeId)" @mouseleave="handleNodeMouseLeave(nodeId)">
          <q-icon name="lock" size="16px" color="primary" class="fixed-node-icon" />
          <div class="fixed-node-text">
            <span class="fixed-node-path">{{ getFileName(nodeId) }}</span>
          </div>
          <q-btn flat dense round icon="close" size="sm" class="fixed-node-delete" @click="handleUnfixNode(nodeId)">
            <q-tooltip>고정 해제</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-scroll-area>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// 고정 노드 목록 (전역 이벤트로 업데이트)
const fixedNodeList = ref([])

// 하이라이트된 노드 ID (실제 렌더링된 노드에서 호버 시)
const highlightedNodeId = ref(null)

// 파일 경로에서 파일명 추출
function getFileName(path) {
  if (!path) return path
  return path.split('/').pop() || path
}

// 아이템 높이 계산 (각 아이템 높이 + 여백 고려)
// padding: 2px 12px + 아이콘 높이 16px + 여백 고려
const ITEM_HEIGHT = 28 // 실제 아이템 높이 (패딩 2px*2 + 콘텐츠 높이 약 24px)
const MAX_HEIGHT = 400 // 최대 높이
const MIN_HEIGHT = 80 // 최소 높이 (빈 상태용)

// 스크롤 영역 높이 계산 (헤더는 q-scroll-area 외부에 있으므로 제외)
const scrollAreaHeight = computed(() => {
  if (fixedNodeList.value.length === 0) {
    return `${MIN_HEIGHT}px`
  }

  // 아이템 수에 따른 높이 계산 (헤더 제외, q-scroll-area 내부 컨텐츠만)
  const contentHeight = fixedNodeList.value.length * ITEM_HEIGHT

  // 최소/최대 높이 제한
  const calculatedHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, contentHeight))

  return `${calculatedHeight}px`
})

// 고정 노드 목록 업데이트 이벤트 핸들러
function handleFixedNodeListUpdate(event) {
  const { nodeIds } = event.detail
  fixedNodeList.value = nodeIds || []
  console.log('[FixedNodesTab] 고정 노드 목록 업데이트:', fixedNodeList.value.length, '개')
}

// 특정 노드 고정 해제
function handleUnfixNode(nodeId) {
  console.log('[FixedNodesTab] 노드 고정 해제:', nodeId)

  // 전역 이벤트로 고정 해제 요청
  window.dispatchEvent(
    new CustomEvent('graph-doc-unfix-node', {
      detail: {
        nodeId: nodeId,
      },
    }),
  )
}

// 전체 노드 고정 해제
function handleUnfixAllNodes() {
  $q.dialog({
    title: '전체 고정 해제',
    message: '모든 노드의 고정을 해제하시겠습니까?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    console.log('[FixedNodesTab] 전체 노드 고정 해제')

    // 전역 이벤트로 전체 고정 해제 요청
    window.dispatchEvent(
      new CustomEvent('graph-doc-unfix-all-nodes', {
        detail: {},
      }),
    )
  })
}

// 노드 마우스 오버 (하이라이트)
function handleNodeMouseEnter(nodeId) {
  console.log('[FixedNodesTab] 노드 마우스 오버:', nodeId)
  window.dispatchEvent(
    new CustomEvent('graph-doc-highlight-node', {
      detail: {
        nodeId: nodeId,
      },
    }),
  )
}

// 노드 마우스 아웃 (하이라이트 해제)
function handleNodeMouseLeave(nodeId) {
  console.log('[FixedNodesTab] 노드 마우스 아웃:', nodeId)
  window.dispatchEvent(
    new CustomEvent('graph-doc-unhighlight-node', {
      detail: {
        nodeId: nodeId,
      },
    }),
  )
}

// 실제 렌더링된 노드에서 호버 시 리스트 아이템 하이라이트
function handleHighlightFixedNodeItem(event) {
  const { nodeId } = event.detail
  highlightedNodeId.value = nodeId
  console.log('[FixedNodesTab] 리스트 아이템 하이라이트:', nodeId)
}

// 실제 렌더링된 노드에서 호버 해제 시 리스트 아이템 하이라이트 해제
function handleUnhighlightFixedNodeItem(event) {
  const { nodeId } = event.detail
  if (highlightedNodeId.value === nodeId) {
    highlightedNodeId.value = null
    console.log('[FixedNodesTab] 리스트 아이템 하이라이트 해제:', nodeId)
  }
}

onMounted(() => {
  console.log('[FixedNodesTab] 마운트 완료')
  // 전역 이벤트 리스너 등록
  window.addEventListener('graph-doc-fixed-nodes-updated', handleFixedNodeListUpdate)
  window.addEventListener('graph-doc-highlight-fixed-node-item', handleHighlightFixedNodeItem)
  window.addEventListener('graph-doc-unhighlight-fixed-node-item', handleUnhighlightFixedNodeItem)
})

onBeforeUnmount(() => {
  console.log('[FixedNodesTab] 언마운트')
  // 전역 이벤트 리스너 제거
  window.removeEventListener('graph-doc-fixed-nodes-updated', handleFixedNodeListUpdate)
  window.removeEventListener('graph-doc-highlight-fixed-node-item', handleHighlightFixedNodeItem)
  window.removeEventListener('graph-doc-unhighlight-fixed-node-item', handleUnhighlightFixedNodeItem)
})
</script>

<style lang="scss" scoped>
.fixed-node-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 12px;
  cursor: pointer;
  min-width: 0;

  &:not(:hover) {
    .fixed-node-delete {
      margin-right: -8px;
    }
  }

  &:hover {
    background-color: var(--nexa-surface-hover);

    .fixed-node-delete {
      opacity: 1;
      visibility: visible;
      width: auto !important;
      min-width: auto !important;
      max-width: 40px !important;
      flex-basis: auto !important;
    }
  }

  // 실제 렌더링된 노드에서 호버 시 하이라이트
  &.fixed-node-item-highlighted {
    background-color: var(--nexa-primary);
    opacity: 0.8;

    .fixed-node-path {
      color: #ffffff;
      font-weight: 600;
    }

    .fixed-node-icon {
      color: #ffffff !important;
    }

    .fixed-node-delete {
      opacity: 1;
      visibility: visible;
      width: auto !important;
      min-width: auto !important;
      max-width: 40px !important;
      flex-basis: auto !important;
    }
  }
}

.fixed-node-icon {
  flex-shrink: 0;
}

.fixed-node-text {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  width: 0;
}

.fixed-node-path {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--nexa-text-primary);
  font-family: monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fixed-node-delete {
  flex-shrink: 0;
  visibility: hidden;
  min-width: 0 !important;
  max-width: 0 !important;
  overflow: hidden;
  transition:
    opacity 0.3s ease,
    visibility 0.3s ease,
    width 0.3s ease,
    max-width 0.3s ease;
}
</style>
