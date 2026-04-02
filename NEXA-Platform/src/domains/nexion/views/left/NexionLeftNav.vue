<template>
  <div class="nexion-left-nav q-pa-md">
    <div class="text-subtitle2 text-weight-bold q-mb-sm">Resource Explorer</div>
    <p class="text-caption text-grey-7 q-mb-md">
      Phase 1: 캔버스 조작을 먼저 확정합니다. 문서 트리·동기화는 후속 Phase에서 연결합니다.
    </p>

    <q-list bordered separator class="rounded-borders q-mb-md">
      <q-item-label header class="text-caption">캔버스 액션</q-item-label>
      <q-item clickable v-ripple @click="addCardCenter">
        <q-item-section avatar>
          <q-icon name="add_box" color="primary" />
        </q-item-section>
        <q-item-section>
          <q-item-label>카드 추가 (중앙)</q-item-label>
          <q-item-label caption>뷰 중앙에 새 카드</q-item-label>
        </q-item-section>
      </q-item>
      <q-item clickable v-ripple @click="addGroupCenter">
        <q-item-section avatar>
          <q-icon name="folder_open" color="secondary" />
        </q-item-section>
        <q-item-section>
          <q-item-label>그룹 추가</q-item-label>
          <q-item-label caption>부모 노드 · 자식 카드 DnD</q-item-label>
        </q-item-section>
      </q-item>
      <q-item
        clickable
        v-ripple
        :disable="!selectedContainerId"
        @click="addChildIntoContainer"
      >
        <q-item-section avatar>
          <q-icon name="subdirectory_arrow_right" />
        </q-item-section>
        <q-item-section>
          <q-item-label>선택 노드에 자식 카드</q-item-label>
          <q-item-label caption>그룹은 박스가 자동 확장 · 카드는 크기 고정 후 줌으로</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

    <q-btn
      outline
      color="negative"
      size="sm"
      class="full-width q-mb-md"
      label="캔버스 초기화"
      @click="confirmReset"
    />

    <div class="text-caption text-grey-7 q-mb-xs">
      노드 목록
      <span class="text-grey-6"> · LOD로 캔버스에서 숨긴 카드는 배지 표시(줌 인·선택 시 표시)</span>
    </div>
    <q-scroll-area style="height: 220px" class="border rounded-borders">
      <q-list dense v-if="nodeList.length">
        <q-item
          v-for="n in nodeList"
          :key="n.id"
          clickable
          v-ripple
          :active="n.id === selectedNodeId"
          active-class="bg-primary text-white"
          @click="focusNode(n.id)"
        >
          <q-item-section>
            <q-item-label class="ellipsis">{{ n.data?.label || n.id }}</q-item-label>
            <q-item-label v-if="n.data?.linkId" caption :class="{ 'text-white': n.id === selectedNodeId }">
              {{ n.data.linkId }}
            </q-item-label>
          </q-item-section>
          <q-item-section side class="nexion-left-nav__badges">
            <q-badge
              v-if="n.type === 'nexionCard' && n.hidden"
              color="grey-7"
              text-color="white"
              class="q-mr-xs"
              outline
            >
              숨김
            </q-badge>
            <q-badge :color="n.type === 'nexionGroup' ? 'secondary' : 'primary'" outline>
              {{ n.type === 'nexionGroup' ? 'G' : 'C' }}
            </q-badge>
          </q-item-section>
        </q-item>
      </q-list>
      <div v-else class="q-pa-md text-caption text-grey-6 text-center">노드 없음</div>
    </q-scroll-area>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import { useNexionFlowStore } from '@domains/nexion/modules/core/stores/nexionFlowStore'

const $q = useQuasar()
const store = useNexionFlowStore()
const { nodes, selectedNodeId } = storeToRefs(store)

const nodeList = computed(() => [...nodes.value].sort((a, b) => a.id.localeCompare(b.id)))

/** 자식 카드를 넣을 수 있는 부모: 그룹 또는 카드 */
const selectedContainerId = computed(() => {
  const id = selectedNodeId.value
  if (!id) return null
  const n = nodes.value.find((x) => x.id === id)
  if (!n || (n.type !== 'nexionGroup' && n.type !== 'nexionCard')) return null
  return id
})

function addCardCenter() {
  store.addDocNodeAtSpawn()
}

function addGroupCenter() {
  store.addGroupAtSpawn()
}

function addChildIntoContainer() {
  if (!selectedContainerId.value) return
  store.addChildCard(selectedContainerId.value)
}

function focusNode(id) {
  store.selectNode(id)
  store.requestFitView(id)
}

function confirmReset() {
  $q.dialog({
    title: '캔버스 초기화',
    message: '모든 노드와 연결을 지울까요?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    store.resetPrototype()
  })
}
</script>

<style lang="scss" scoped>
.nexion-left-nav {
  height: 100%;
  overflow: auto;
}

.border {
  border: 1px solid var(--nexa-border-color, rgba(0, 0, 0, 0.12));
}
</style>
