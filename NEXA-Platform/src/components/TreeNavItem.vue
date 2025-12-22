<!-- src/components/TreeNavItem.vue
  트리 네비게이션 아이템 컴포넌트
  트리 구조의 각 노드를 나타내는 컴포넌트
  노드 클릭 시 해당 노드로 이동하거나 확장/축소 처리
  활성 노드에 대한 스타일 적용
  Vue 3 <script setup> 구문 사용
  -->

<template>
  <div :class="['tree-indent', 'tree-indent-level-' + level]">
    <q-item
      clickable
      v-ripple
      @click="handleNodeClick"
      :active="isActiveNode && !isHighlighted"
      active-class=""
      :class="{
        'highlighted-node': isHighlighted,
        'selected-group-node': isActiveNode && !isHighlighted && node.type === 'group',
        'selected-board-node': isActiveNode && !isHighlighted && node.type === 'board',
      }"
    >
      <q-item-section avatar style="min-width: 30px">
        <q-icon :name="getNodeIcon(node)" :color="node.type === 'board' ? 'secondary' : undefined" :style="node.type === 'group' ? 'color: #FFD600' : ''" />
      </q-item-section>
      <!-- 활성 노드일 때 이름 색상 변경 -->
      <q-item-section :style="isActiveNode && !isHighlighted ? 'color: #ff9800' : ''">
        {{ node.name }}
      </q-item-section>
      <q-item-section side v-if="node.type === 'group' && hasChildren">
        <q-btn flat dense round size="sm" :icon="isExpanded ? 'expand_less' : 'expand_more'" @click.stop="toggleExpansion" />
      </q-item-section>
    </q-item>

    <div v-if="isExpanded && hasChildren">
      <tree-nav-item v-for="childNode in childNodes" :key="childNode.id" :node="childNode" :level="level + 1" :highlighted-node-id-from-layout="highlightedNodeIdFromLayout" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBoardMenuStore } from 'src/stores/boardMenuStore'
import { useDashboardLayoutStore } from 'src/stores/dashboardLayoutStore'
import { useBoardEditorStore } from 'src/stores/boardEditorStore'

// 컴포넌트 자신의 이름을 명시적으로 선언 (재귀 컴포넌트의 경우 권장)
// Vue 3 <script setup>에서는 자동으로 이름이 추론되지만, 명시하는 것이 좋을 때도 있음 (이 경우 파일명 기반)
// defineOptions({ name: 'TreeNavItem' }); // 필요시 주석 해제

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
  level: {
    type: Number,
    default: 0,
  },
  highlightedNodeIdFromLayout: {
    type: String,
    default: null,
  },
})

const boardMenuStore = useBoardMenuStore()
const dashboardLayoutStore = useDashboardLayoutStore()
const boardEditorStore = useBoardEditorStore()
const router = useRouter()

// 노드의 확장 상태 관리. 초기값은 boardMenuStore의 노드.expanded를 따르거나, 없다면 false.
const isExpanded = ref(props.node.expanded === undefined ? false : props.node.expanded)

// props.node.expanded 변경 감지하여 isExpanded ref 동기화
watch(
  () => props.node.expanded,
  (newValue) => {
    // isExpanded.value와 newValue가 실제로 다른 경우에만 업데이트 (무한 루프 방지 및 최적화)
    if (isExpanded.value !== !!newValue) {
      // console.log(`[TreeNavItem ${props.node.name}] Watched props.node.expanded changed to:`, newValue, "Updating local isExpanded.");
      isExpanded.value = !!newValue // boolean 값으로 확실하게 변환
    }
  },
  { immediate: false },
) // immediate: false 또는 생략하여 초기 마운트 시 불필요한 실행 방지 (초기값은 ref에서 이미 설정됨)

// 자식 노드들 가져오기
const childNodes = computed(() => {
  if (props.node.type === 'group') {
    return boardMenuStore.getChildNodes(props.node.id)
  }
  return []
})

const hasChildren = computed(() => childNodes.value && childNodes.value.length > 0)

// 현재 노드가 활성화된(선택된) 노드인지 판단
const isActiveNode = computed(() => {
  if (dashboardLayoutStore.currentViewMode === 'dashboard') {
    return dashboardLayoutStore.selectedNodeForDashboard?.id === props.node.id
  }
  if (dashboardLayoutStore.currentViewMode === 'boardManagement') {
    // 보드 관리 모드일 때는 drawerSelectionForAdmin의 ID와 비교 (setDrawerItemSelectionForAdmin 사용)
    return boardEditorStore.drawerSelectionForAdmin?.id === props.node.id
  }
  return false
})

const isHighlighted = computed(() => {
  const highlight = props.node.id === props.highlightedNodeIdFromLayout
  return highlight
})

function toggleExpansion() {
  if (props.node.type === 'group') {
    const newExpansionState = !isExpanded.value
    // isExpanded.value = newExpansionState; // watch에 의해 props.node.expanded가 변경되면 자동으로 반영될 것이므로, 직접 할당 불필요 또는 주의
    // 스토어를 먼저 업데이트하고, 스토어 변경에 따른 prop 변경이 watch를 통해 isExpanded를 업데이트하도록 함.
    boardMenuStore.updateNode(props.node.id, { expanded: newExpansionState })
  }
}

function handleNodeClick() {
  const nodeInfo = {
    id: props.node.id,
    type: props.node.type,
    name: props.node.name,
  }

  if (dashboardLayoutStore.currentViewMode === 'dashboard') {
    dashboardLayoutStore.setSelectedNodeForDashboard(props.node)
    if (props.node.type === 'board') {
      // 보드 선택 시 /nexa-board로 라우팅하여 상단 메뉴가 NEXA BOARD로 유지되도록 함
      if (router.currentRoute.value.path !== '/nexa-board') {
        router.push('/nexa-board')
      }
    } else if (props.node.type === 'group') {
      if (hasChildren.value) toggleExpansion()
    }
  } else if (dashboardLayoutStore.currentViewMode === 'boardManagement') {
    boardEditorStore.setDrawerItemSelectionForAdmin(nodeInfo)

    // 관리 모드에서도 그룹 노드 클릭 시 토글 처리
    if (props.node.type === 'group' && hasChildren.value) {
      toggleExpansion()
    }

    if (router.currentRoute.value.path !== '/board-admin') {
      router.push('/board-admin')
    }
  }
}

function getNodeIcon(node) {
  if (node.type === 'group') return 'folder'
  if (node.type === 'board') return 'dashboard' // 모자이크 아이콘
  return 'description'
}
</script>

<style scoped>
/* 트리 네비게이션 아이템 들여쓰기 스타일 */
.tree-indent {
  padding-left: 6px;
  padding-right: 3px;
}
.tree-indent-level-0 {
  padding-left: 10px;
}
.tree-indent-level-1 {
  padding-left: 16px;
}
.tree-indent-level-2 {
  padding-left: 32px;
}
.tree-indent-level-3 {
  padding-left: 48px;
}
.tree-indent-level-4 {
  padding-left: 64px;
}
.tree-indent .q-item {
  margin-top: 0px !important;
  margin-bottom: 0px !important;
  padding-top: 0px !important;
  padding-bottom: 0px !important;
}

.highlighted-node {
  background-color: var(--nexa-positive) !important;
  color: rgb(100, 237, 214) !important;
}
.highlighted-node .q-item__section--avatar .q-icon,
.highlighted-node .q-item__section--side .q-icon {
  color: white !important;
}

.selected-board-node {
  color: var(--nexa-accent) !important;
}
.selected-board-node .q-icon {
  color: var(--nexa-accent) !important;
}
</style>
