<template>
  <div
    class="nexion-card-node"
    :class="cardRootClass"
  >
    <!-- 핸들보다 앞에 두면 제목/버튼이 핸들을 덮어 연결 판정이 실패할 수 있음 → 핸들은 맨 아래 + z-index -->
    <header class="nexion-card-node__header">
      <span class="nexion-card-node__title" :title="data.label">{{ data.label }}</span>
      <div class="nexion-card-node__actions">
        <q-btn
          flat
          dense
          round
          size="xs"
          icon="post_add"
          color="primary"
          aria-label="자식 카드 추가"
          class="nexion-card-node__action-btn"
          @click.stop="onAddChild"
        />
        <q-btn
          flat
          dense
          round
          size="xs"
          icon="filter_center_focus"
          aria-label="이 카드로 화면 맞춤"
          class="nexion-card-node__action-btn"
          @click.stop="onFitSelf"
        />
        <q-btn
          flat
          dense
          round
          size="xs"
          icon="delete_outline"
          color="negative"
          aria-label="이 카드 삭제"
          class="nexion-card-node__action-btn"
          @click.stop="onRemoveSelf"
        />
        <q-btn
          flat
          dense
          round
          size="xs"
          icon="more_horiz"
          aria-label="추가 메뉴"
          class="nexion-card-node__action-btn"
          @click.stop
        />
      </div>
    </header>

    <!-- 프랙탈 줌·본문 컨텐츠용 빈 영역 (자식 노드는 플로 좌표로 이 박스 안에만 두도록 스토어에서 클램프) -->
    <div class="nexion-card-node__body" />

    <footer class="nexion-card-node__footer">
      <template v-if="showDetail">
        <div class="nexion-card-node__footer-line" :title="data.linkId || undefined">
          <span class="nexion-card-node__footer-id text-mono">{{ data.linkId || '—' }}</span>
          <span class="nexion-card-node__footer-meta">· Link ID · 부가</span>
        </div>
      </template>
      <div v-else class="nexion-card-node__footer-collapsed" aria-hidden="true">···</div>
    </footer>

    <Handle id="in" class="nexion-card-node__handle" type="target" :position="Position.Left" />
    <Handle id="out" class="nexion-card-node__handle" type="source" :position="Position.Right" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import { Handle, Position } from '@vue-flow/core'
import { storeToRefs } from 'pinia'
import { useNexionFlowStore } from '@domains/nexion/modules/core/stores/nexionFlowStore'

const props = defineProps({
  id: { type: String, required: true },
  data: {
    type: Object,
    default: () => ({ label: '카드', linkId: '', nestedInCard: false, nexionCardTier: undefined }),
  },
  selected: { type: Boolean, default: false },
})

const $q = useQuasar()
const store = useNexionFlowStore()
const { viewportZoom } = storeToRefs(store)

const showDetail = computed(() => store.showNodeDetail(viewportZoom.value))

const cardRootClass = computed(() => {
  const tier = props.data.nexionCardTier ?? (props.data.nestedInCard ? 1 : 0)
  return {
    'nexion-card-node--selected': props.selected,
    'nexion-card-node--nested': props.data.nestedInCard,
    'nexion-card-node--nested-deep': props.data.nestedInCard && tier >= 2,
  }
})

function onAddChild() {
  store.addChildCard(props.id)
}

function onFitSelf() {
  store.requestFitView(props.id)
}

function onRemoveSelf() {
  $q.dialog({
    title: '노드 삭제',
    message: '이 노드와 연결된 엣지·자식 노드도 함께 제거됩니다.',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    store.removeNode(props.id)
  })
}
</script>

<style lang="scss" scoped>
.nexion-card-node {
  container-type: size;
  container-name: nxn-card;

  --nxn-cap-title: var(--nxn-card-title-fs, 13px);
  --nxn-cap-body: var(--nxn-card-body-fs, 12px);
  --nxn-cap-footer: var(--nxn-card-footer-fs, 11px);
  --nxn-card-title-fs-local: clamp(3.5px, 4.85cqw, var(--nxn-cap-title));
  --nxn-card-body-fs-local: clamp(3px, 4.35cqw, var(--nxn-cap-body));
  --nxn-card-footer-fs-local: clamp(2.75px, 3.95cqw, var(--nxn-cap-footer));

  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  border-radius: clamp(3px, 2.6cqw, 10px);
  border: 1px solid var(--nexa-border-color, rgba(0, 0, 0, 0.18));
  background: var(--nexa-background-elevated, #fff);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  color: var(--nexa-text-primary, #1a1a1a);
  overflow: hidden;

  &:not(.nexion-card-node--nested) {
    min-width: 140px;
  }

  &--nested {
    min-width: 0;
    box-shadow: none;
  }

  &--selected {
    border-color: var(--nexa-primary, #1976d2);
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.25);
  }
}

.body--dark .nexion-card-node {
  background: var(--nexa-background-elevated, #2a2a2a);
  color: var(--nexa-text-primary, #eee);
}

.nexion-card-node__header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: clamp(1px, 1.4cqw, 6px);
  min-height: clamp(18px, 20cqh, 40px);
  padding: clamp(2px, 2.2cqh, 8px) clamp(2px, 2.8cqw, 12px) clamp(2px, 2.2cqh, 8px)
    clamp(2px, 3.2cqw, 12px);
  border-bottom: 1px solid var(--nexa-border-color, rgba(0, 0, 0, 0.1));
  background: rgba(0, 0, 0, 0.03);
}

.body--dark .nexion-card-node__header {
  background: rgba(255, 255, 255, 0.04);
}

.nexion-card-node__title {
  flex: 1;
  min-width: 0;
  font-size: var(--nxn-card-title-fs-local);
  font-weight: 600;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nexion-card-node__actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  margin: 0 -0.5cqw 0 0;
}

.nexion-card-node__action-btn {
  opacity: 0.82;

  :deep(.q-btn__wrapper) {
    min-width: clamp(14px, 10.5cqw, 34px);
    min-height: clamp(14px, 10.5cqw, 34px);
    padding: 0;
  }

  :deep(.q-icon) {
    font-size: clamp(9px, 7.2cqw, 18px);
  }
}

.nexion-card-node__body {
  flex: 1;
  min-height: 0;
  padding: clamp(2px, 2.6cqh, 10px) clamp(2px, 2.8cqw, 10px);
  font-size: var(--nxn-card-body-fs-local);
  background: rgba(0, 0, 0, 0.015);
}

.body--dark .nexion-card-node__body {
  background: rgba(255, 255, 255, 0.02);
}

.nexion-card-node__footer {
  flex-shrink: 0;
  padding: clamp(2px, 2cqh, 8px) clamp(2px, 3cqw, 12px) clamp(2px, 2.4cqh, 10px);
  border-top: 1px solid var(--nexa-border-color, rgba(0, 0, 0, 0.1));
  font-size: var(--nxn-card-footer-fs-local);
  line-height: 1.35;
}

.nexion-card-node__footer-line {
  display: flex;
  align-items: baseline;
  gap: 4px;
  min-width: 0;
}

.nexion-card-node__footer-id {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0.92;
}

.nexion-card-node__footer-meta {
  flex-shrink: 0;
  font-size: clamp(2.5px, 3.5cqw, calc(var(--nxn-card-footer-fs-local) * 0.95));
  color: var(--nexa-text-secondary, rgba(0, 0, 0, 0.5));
  white-space: nowrap;
}

.nexion-card-node__footer-collapsed {
  text-align: center;
  letter-spacing: 0.2em;
  color: var(--nexa-text-secondary, rgba(0, 0, 0, 0.45));
  font-size: var(--nxn-card-footer-fs-local);
}

.nexion-card-node__handle {
  width: clamp(6px, 5.8cqw, 16px);
  height: clamp(6px, 5.8cqw, 16px);
  min-width: clamp(6px, 5.8cqw, 16px);
  min-height: clamp(6px, 5.8cqw, 16px);
  background: var(--nexa-primary, #1976d2);
  border: clamp(1px, 0.55cqw, 2px) solid var(--nexa-background, #fff);
  z-index: 10;
  pointer-events: auto;
}
</style>
