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
    <q-scroll-area class="fixed-nodes-list-area" style="height: 400px">
      <div v-if="fixedNodeList.length === 0" class="empty-state q-pa-md text-center">
        <q-icon name="lock_open" size="48px" color="grey-5" class="q-mb-sm" />
        <div class="text-caption text-grey-6">고정된 노드가 없습니다</div>
      </div>

      <div v-else class="fixed-nodes-list">
        <div v-for="nodeId in fixedNodeList" :key="nodeId" class="fixed-node-item">
          <q-icon name="lock" size="16px" color="primary" class="fixed-node-icon" />
          <div class="fixed-node-text">
            <span class="fixed-node-path">{{ nodeId }}</span>
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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// 고정 노드 목록 (전역 이벤트로 업데이트)
const fixedNodeList = ref([])

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

onMounted(() => {
  console.log('[FixedNodesTab] 마운트 완료')
  // 전역 이벤트 리스너 등록
  window.addEventListener('graph-doc-fixed-nodes-updated', handleFixedNodeListUpdate)
})

onBeforeUnmount(() => {
  console.log('[FixedNodesTab] 언마운트')
  // 전역 이벤트 리스너 제거
  window.removeEventListener('graph-doc-fixed-nodes-updated', handleFixedNodeListUpdate)
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
