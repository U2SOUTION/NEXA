<template>
  <div class="nexion-right-panel q-pa-md">
    <div class="text-subtitle2 text-weight-bold q-mb-sm">노드 속성</div>

    <template v-if="selectedNode">
      <q-input
        v-model="labelEdit"
        class="q-mb-sm"
        outlined
        dense
        label="표시 제목"
        @blur="commitLabel"
        @keyup.enter="commitLabel"
      />
      <q-list bordered separator class="rounded-borders q-mb-md">
        <q-item>
          <q-item-section>
            <q-item-label caption>노드 ID</q-item-label>
            <q-item-label class="text-mono text-caption">{{ selectedNode.id }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label caption>Link ID (Phase 1 스텁)</q-item-label>
            <q-item-label class="text-mono text-caption">{{ selectedNode.data?.linkId || '—' }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label caption>유형</q-item-label>
            <q-item-label>{{ selectedNode.type === 'nexionGroup' ? '그룹 (부모)' : '카드' }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="selectedNode.parentNode">
          <q-item-section>
            <q-item-label caption>부모</q-item-label>
            <q-item-label class="text-mono text-caption">{{ selectedNode.parentNode }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <q-btn
        outline
        color="negative"
        size="sm"
        class="full-width"
        label="이 노드 삭제"
        @click="removeCurrent"
      />

      <p class="text-caption text-grey-7 q-mt-md">
        Late Anchoring·`doc_anchor`·영문 IR은 Phase 2~4에서 `[NXN] [UIUX]` §7에 맞춰 연결합니다.
      </p>
    </template>

    <div v-else class="text-caption text-grey-6 q-mt-md">
      노드를 선택하면 Link ID와 제목을 여기서 다룹니다.
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import { useNexionFlowStore } from '@domains/nexion/modules/core/stores/nexionFlowStore'

const $q = useQuasar()
const store = useNexionFlowStore()
const { nodes, selectedNodeId } = storeToRefs(store)

const labelEdit = ref('')

const selectedNode = computed(() => {
  const id = selectedNodeId.value
  if (!id) return null
  return nodes.value.find((n) => n.id === id) ?? null
})

watch(
  selectedNode,
  (n) => {
    labelEdit.value = n?.data?.label != null ? String(n.data.label) : ''
  },
  { immediate: true },
)

function commitLabel() {
  const id = selectedNodeId.value
  if (!id) return
  store.setNodeLabel(id, labelEdit.value || '카드')
}

function removeCurrent() {
  const id = selectedNodeId.value
  if (!id) return
  $q.dialog({
    title: '노드 삭제',
    message: '이 노드와 연결된 엣지도 함께 제거됩니다.',
    cancel: true,
  }).onOk(() => {
    store.removeNode(id)
  })
}
</script>

<style lang="scss" scoped>
.nexion-right-panel {
  height: 100%;
  overflow: auto;
}

.text-mono {
  font-family: monospace;
}
</style>
