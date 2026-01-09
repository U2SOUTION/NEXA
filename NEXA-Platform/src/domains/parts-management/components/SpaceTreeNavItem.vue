<!-- SpaceTreeNavItem.vue
  부품관리 시스템의 공간 계층 트리 네비게이션 아이템 컴포넌트
  base_spaces → storage_blocks → storage_rows 계층 구조 표현
  재귀적 컴포넌트로 동적 계층 구조 처리
-->

<template>
  <div :class="['tree-indent', 'tree-indent-level-' + level]">
    <q-item
      clickable
      v-ripple
      @click="handleNodeClick"
      @contextmenu.prevent="showContextMenu"
      :active="isActiveNode"
      active-class=""
      :class="{
        'selected-space-node': isActiveNode && node.type === 'base_space',
        'selected-block-node': isActiveNode && node.type === 'storage_block',
        'selected-row-node': isActiveNode && node.type === 'storage_row',
      }"
    >
      <q-item-section avatar style="min-width: 40px">
        <q-icon
          :name="getNodeIcon(node)"
          :color="getNodeColor(node)"
          :size="node.type === 'base_space' ? '28px' : '24px'"
          :class="{
            'space-icon': node.type === 'base_space',
            'block-icon': node.type === 'storage_block',
            'row-icon': node.type === 'storage_row',
          }"
        />
      </q-item-section>
      <q-item-section>
        <div class="row items-center">
          <span :class="['tree-item-text', 'tree-item-level-' + level]">{{ node.name }}</span>
          <q-chip v-if="node.sku" dense size="sm" color="grey-7" text-color="white" class="q-ml-sm">
            {{ node.sku }}
          </q-chip>
        </div>
      </q-item-section>
      <q-item-section side v-if="hasChildren">
        <q-btn
          flat
          dense
          round
          size="sm"
          :icon="isExpanded ? 'expand_less' : 'expand_more'"
          @click.stop="toggleExpansion"
        />
      </q-item-section>
    </q-item>

    <!-- 컨텍스트 메뉴 -->
    <q-menu v-model="contextMenuVisible" context-menu>
      <q-list dense style="min-width: 150px">
        <q-item
          v-if="node.type === 'base_space'"
          clickable
          v-close-popup
          @click="handleAddStorageBlock"
        >
          <q-item-section avatar>
            <q-icon name="add" />
          </q-item-section>
          <q-item-section>스토리지 블록 추가</q-item-section>
        </q-item>
        <q-separator />
        <q-item clickable v-close-popup @click="handleDelete">
          <q-item-section avatar>
            <q-icon name="delete" color="negative" />
          </q-item-section>
          <q-item-section>
            <span class="text-negative">삭제</span>
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>

    <div v-if="isExpanded && hasChildren">
      <space-tree-nav-item
        v-for="childNode in childNodes"
        :key="childNode.id"
        :node="childNode"
        :level="level + 1"
        :selected-node-id="selectedNodeId"
        :on-add-storage-block="onAddStorageBlock"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { usePartsManagementStore } from '@system/store/partsManagementStore.js'

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
  level: {
    type: Number,
    default: 0,
  },
  selectedNodeId: {
    type: Number,
    default: null,
  },
  onAddStorageBlock: {
    type: Function,
    default: null,
  },
})

const partsStore = usePartsManagementStore()
const $q = useQuasar()

// 컨텍스트 메뉴 상태
const contextMenuVisible = ref(false)

// 노드의 확장 상태 관리
const isExpanded = ref(props.node.expanded === undefined ? false : props.node.expanded)

// props.node.expanded 변경 감지
watch(
  () => props.node.expanded,
  (newValue) => {
    if (isExpanded.value !== !!newValue) {
      isExpanded.value = !!newValue
    }
  },
  { immediate: false },
)

// 자식 노드들 가져오기
const childNodes = computed(() => {
  if (props.node.children && props.node.children.length > 0) {
    return partsStore.getChildNodes(props.node.id)
  }
  return []
})

const hasChildren = computed(() => childNodes.value && childNodes.value.length > 0)

// 현재 노드가 활성화된 노드인지 판단
const isActiveNode = computed(() => {
  if (props.node.type === 'storage_block') {
    return partsStore.selectedStorageBlock?.id === props.node.id
  }
  return props.selectedNodeId === props.node.id
})

function toggleExpansion() {
  if (hasChildren.value) {
    const newExpansionState = !isExpanded.value
    partsStore.updateNode(props.node.id, { expanded: newExpansionState })
  }
}

function handleNodeClick() {
  if (props.node.type === 'storage_row') {
    // storage_row 선택 (메인 뷰에 bin_masters 표시)
    partsStore.setSelectedStorageRow(props.node)
  } else if (props.node.type === 'storage_block') {
    // storage_block 선택 (메인 뷰에 그리드 표시)
    partsStore.setSelectedStorageBlock(props.node)
  } else if (hasChildren.value) {
    // 다른 타입은 확장/축소만 처리
    toggleExpansion()
  }
}

function showContextMenu() {
  // 모든 노드 타입에 대해 컨텍스트 메뉴 표시
  contextMenuVisible.value = true
}

function handleAddStorageBlock() {
  if (props.onAddStorageBlock) {
    props.onAddStorageBlock(props.node.id)
  }
  contextMenuVisible.value = false
}

function handleDelete() {
  contextMenuVisible.value = false

  const nodeTypeLabel =
    {
      base_space: '공간',
      storage_block: '스토리지 블록',
      storage_row: '스토리지 행',
    }[props.node.type] || '항목'

  const hasChildren = props.node.children && props.node.children.length > 0
  const message = hasChildren
    ? `'${props.node.name}' ${nodeTypeLabel} 및 모든 하위 항목을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
    : `'${props.node.name}' ${nodeTypeLabel}을(를) 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`

  $q.dialog({
    title: '삭제 확인',
    message,
    persistent: true,
    ok: {
      label: '삭제',
      color: 'negative',
      flat: false,
    },
    cancel: {
      label: '취소',
      flat: true,
    },
  })
    .onOk(() => {
      partsStore.removeNode(props.node.id)
      $q.notify({
        type: 'positive',
        icon: 'check_circle',
        message: `'${props.node.name}' ${nodeTypeLabel}이(가) 삭제되었습니다.`,
        position: 'top',
        timeout: 3000,
      })
    })
    .onCancel(() => {
      // 취소 시 아무 작업도 하지 않음
    })
}

function getNodeIcon(node) {
  switch (node.type) {
    case 'base_space':
      return 'location_city'
    case 'storage_block':
      return 'inventory_2'
    case 'storage_row':
      return 'view_quilt'
    default:
      return 'folder'
  }
}

function getNodeColor(node) {
  switch (node.type) {
    case 'base_space':
      // 버튼 색상과 일치시키기 위해 CSS 변수 사용
      return undefined // CSS로 직접 색상 지정
    case 'storage_block':
      return 'secondary'
    case 'storage_row':
      // 상위 아이콘과 같은 색상, CSS로 투명도 적용
      return undefined // CSS로 직접 색상 지정
    default:
      return undefined
  }
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

.tree-indent .q-item {
  margin-top: 0px !important;
  margin-bottom: 0px !important;
  padding-top: 0px !important;
  padding-bottom: 0px !important;
}

.selected-space-node {
  color: var(--nexa-primary) !important;
  background-color: rgba(33, 150, 243, 0.1) !important;
}

/* 공간 아이콘 색상 (버튼 색상과 일치) */
.space-icon {
  color: var(--nexa-button-primary-bg) !important;
}

/* 스토리지 블록 아이콘 색상 */
.block-icon {
  color: var(--nexa-button-primary-bg) !important;
  opacity: 0.8;
}

/* 스토리지 행 아이콘 색상 */
.row-icon {
  color: var(--nexa-text-secondary) !important;
  opacity: 0.6;
}

.selected-block-node {
  color: var(--nexa-secondary) !important;
  background-color: rgba(156, 39, 176, 0.1) !important;
}

.selected-row-node {
  color: var(--nexa-button-primary-bg) !important;
  background-color: rgba(33, 150, 243, 0.1) !important;
  opacity: 0.6;
}

/* 레벨별 폰트 크기 설정 */
.tree-item-text {
  font-weight: 500;
}

.tree-item-level-0 {
  font-size: 17px; /* 최상단: base_space */
  color: var(--nexa-button-primary-bg) !important;
}

.tree-item-level-1 {
  font-size: 15px; /* 1단계: storage_block */
  color: var(--nexa-button-primary-bg) !important;
}

.tree-item-level-2 {
  font-size: 14px; /* 2단계: storage_row */
  color: var(--nexa-text-secondary) !important;
}

.tree-item-level-3 {
  font-size: 12px; /* 3단계: 더 깊은 하위 레벨 */
}

/* Level 1 (storage_block)의 상하 마진 줄이기 */
.tree-indent-level-1 .q-item {
  margin-top: -2px !important;
  margin-bottom: -2px !important;
  padding-top: 3px !important;
  padding-bottom: 3px !important;
  min-height: 36px !important;
}

/* Level 2 (storage_row)의 상하 마진 줄이기 */
.tree-indent-level-2 .q-item {
  margin-top: -4px !important;
  margin-bottom: -4px !important;
  padding-top: 2px !important;
  padding-bottom: 2px !important;
  min-height: 30px !important;
}
</style>
