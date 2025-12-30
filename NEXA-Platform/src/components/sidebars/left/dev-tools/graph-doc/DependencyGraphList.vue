<!-- DependencyGraphList.vue
  의존성 그래프 목록 컴포넌트
  그래프 노드 목록 표시 및 선택 기능
-->

<template>
  <div class="dependency-graph-list-container">
    <q-scroll-area class="dependency-graph-list-scroll-area">
      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="loading-section q-pa-lg text-center">
        <q-spinner color="primary" size="3em" />
        <div class="q-mt-md text-caption">그래프를 분석하는 중...</div>
      </div>

      <!-- 그래프 데이터가 없을 때 -->
      <div v-else-if="!graphData" class="empty-section q-pa-lg text-center">
        <q-icon name="account_tree" size="48px" color="grey-5" class="q-mb-md" />
        <div class="text-grey-7">분석 대상을 입력하고 분석 버튼을 클릭하세요.</div>
      </div>

      <!-- 노드 목록 -->
      <q-list v-else separator>
        <q-item
          v-for="node in graphData.nodes"
          :key="node.id"
          clickable
          :active="selectedNode?.id === node.id"
          active-class="node-item-active"
          @click="handleNodeSelect(node)"
        >
          <q-item-section avatar>
            <q-icon :name="getNodeIcon(node.type)" :color="getNodeColor(node.type)" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="node-name">{{ node.name || '이름 없음' }}</q-item-label>
            <q-item-label caption class="node-path">{{ node.path || '경로 없음' }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-chip
              :label="node.type || 'unknown'"
              size="sm"
              color="primary"
              text-color="white"
            />
            <q-icon name="chevron_right" color="grey-7" class="q-ml-sm" />
          </q-item-section>
        </q-item>

        <!-- 노드가 없을 때 -->
        <div v-if="graphData.nodes.length === 0" class="empty-section q-pa-lg text-center">
          <q-icon name="account_tree" size="48px" color="grey-5" class="q-mb-md" />
          <div class="text-grey-7">노드가 없습니다.</div>
        </div>
      </q-list>
    </q-scroll-area>
  </div>
</template>

<script setup>
defineProps({
  graphData: {
    type: Object,
    default: null,
  },
  selectedNode: {
    type: Object,
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['node-selected'])

function handleNodeSelect(node) {
  emit('node-selected', node)
}

function getNodeIcon(type) {
  const icons = {
    page: 'description',
    component: 'widgets',
    store: 'storage',
    composable: 'extension',
    util: 'build',
    api: 'api',
  }
  return icons[type] || 'insert_drive_file'
}

function getNodeColor(type) {
  const colors = {
    page: 'blue',
    component: 'green',
    store: 'orange',
    composable: 'purple',
    util: 'grey',
    api: 'red',
  }
  return colors[type] || 'grey-7'
}
</script>

<style lang="scss" scoped>
.dependency-graph-list-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dependency-graph-list-scroll-area {
  flex: 1;
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.node-item-active {
  background-color: var(--nexa-surface-hover);
}

.node-name {
  color: var(--nexa-text-primary);
  font-weight: 500;
  word-break: break-all;
}

.node-path {
  color: var(--nexa-text-secondary);
}

.empty-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}
</style>
