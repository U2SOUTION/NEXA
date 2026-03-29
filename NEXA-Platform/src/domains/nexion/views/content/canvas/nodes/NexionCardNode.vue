<template>
  <div
    class="nexion-card-node"
    :class="cardRootClass"
    :style="cardReadabilityStyle"
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
        <div
          class="nexion-card-node__footer-line"
          :class="{ 'nexion-card-node__footer-line--stack': data.nestedInCard }"
          :title="data.linkId || undefined"
        >
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

const showDetail = computed(() => store.showCardFooterDetail(props.id, viewportZoom.value))

/**
 * cqi 는 플로 좌표 박스 크기만 보므로, 캔버스 줌만 키우면 “돋보기 확대”처럼 보임.
 * 뷰포트 줌에 맞춰 플로 공간에서도 글자 하한을 키워 실제로 읽을 수 있게 함.
 */
const cardReadabilityStyle = computed(() => {
  if (!props.data.nestedInCard) return undefined
  const z = viewportZoom.value
  const z0 = store.LOD_ZOOM_DETAIL
  const mul = Math.min(3.25, Math.max(1, z / z0))
  const ramp = Math.sqrt(mul)
  const tier = typeof props.data.nexionCardTier === 'number' ? props.data.nexionCardTier : 1
  const deep = tier >= 2 ? 1.12 : 1
  const r = (n) => Math.round(n * 10) / 10
  return {
    '--nxn-nested-title-floor': `${r(7 * ramp * deep)}px`,
    '--nxn-nested-body-floor': `${r(6 * ramp * deep)}px`,
    '--nxn-nested-footer-floor': `${r(6.8 * ramp * deep)}px`,
  }
})

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
/* 컨테이너 = 카드 박스. 루트: 설정·cqi. 중첩: --nxn-nested-*-floor 로 뷰포트 줌에 맞춰 플로 공간 글자 하한 상향(돋보기 현상 완화) */
.nexion-card-node {
  container-type: size;
  container-name: nxn-card;

  /* 큰 박스: min(설정, 큰 cqi) → 설정 적용. 작은 박스만 cqi 가 더 작아져 축소 */
  --nxn-card-title-fs-local: min(var(--nxn-card-title-fs, 13px), max(6px, 8cqi));
  --nxn-card-body-fs-local: min(var(--nxn-card-body-fs, 12px), max(5px, 7.2cqi));
  --nxn-card-footer-fs-local: min(var(--nxn-card-footer-fs, 11px), max(5px, 6.6cqi));

  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  border-radius: 8px;
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

    --nxn-card-title-fs-local: min(
      var(--nxn-card-title-fs, 13px),
      max(var(--nxn-nested-title-floor, 7px), 7.5cqi)
    );
    --nxn-card-body-fs-local: min(
      var(--nxn-card-body-fs, 12px),
      max(var(--nxn-nested-body-floor, 6px), 6.8cqi)
    );
    --nxn-card-footer-fs-local: min(
      var(--nxn-card-footer-fs, 11px),
      max(var(--nxn-nested-footer-floor, 7px), 6.4cqi)
    );
  }

  &--nested-deep {
    --nxn-card-title-fs-local: min(
      var(--nxn-card-title-fs, 13px),
      max(var(--nxn-nested-title-floor, 9px), 8.5cqi)
    );
    --nxn-card-body-fs-local: min(
      var(--nxn-card-body-fs, 12px),
      max(var(--nxn-nested-body-floor, 8px), 7.5cqi)
    );
    --nxn-card-footer-fs-local: min(
      var(--nxn-card-footer-fs, 11px),
      max(var(--nxn-nested-footer-floor, 8px), 7.5cqi)
    );
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
  gap: 4px;
  min-height: 36px;
  padding: 6px 6px 6px 10px;
  border-bottom: 1px solid var(--nexa-border-color, rgba(0, 0, 0, 0.1));
  background: rgba(0, 0, 0, 0.03);
}

.nexion-card-node--nested .nexion-card-node__header {
  min-height: 26px;
  padding: 4px 6px 4px 8px;
  gap: 2px;
}

.nexion-card-node--nested-deep .nexion-card-node__header {
  min-height: 22px;
  padding: 3px 4px 3px 6px;
}

.body--dark .nexion-card-node__header {
  background: rgba(255, 255, 255, 0.04);
}

.nexion-card-node__title {
  flex: 1 1 auto;
  min-width: 2.5em;
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
  margin: 0 -2px 0 0;
}

.nexion-card-node__action-btn {
  opacity: 0.82;

  :deep(.q-btn__wrapper) {
    min-width: 24px;
    min-height: 24px;
    padding: 0;
  }

  :deep(.q-icon) {
    font-size: 15px;
  }
}

.nexion-card-node--nested .nexion-card-node__action-btn {
  :deep(.q-btn__wrapper) {
    min-width: max(18px, calc(var(--nxn-card-title-fs-local) * 1.55));
    min-height: max(18px, calc(var(--nxn-card-title-fs-local) * 1.55));
  }

  :deep(.q-icon) {
    font-size: max(10px, calc(var(--nxn-card-title-fs-local) * 1.08));
  }
}

.nexion-card-node--nested-deep .nexion-card-node__action-btn {
  :deep(.q-btn__wrapper) {
    min-width: max(16px, calc(var(--nxn-card-title-fs-local) * 1.65));
    min-height: max(16px, calc(var(--nxn-card-title-fs-local) * 1.65));
  }

  :deep(.q-icon) {
    font-size: max(9px, calc(var(--nxn-card-title-fs-local) * 1.12));
  }
}

.nexion-card-node__body {
  flex: 1;
  min-height: 0;
  padding: 8px;
  font-size: var(--nxn-card-body-fs-local);
  background: rgba(0, 0, 0, 0.015);
}

.nexion-card-node--nested .nexion-card-node__body {
  padding: 5px 6px;
}

.nexion-card-node--nested-deep .nexion-card-node__body {
  padding: 3px 4px;
}

.body--dark .nexion-card-node__body {
  background: rgba(255, 255, 255, 0.02);
}

.nexion-card-node__footer {
  flex-shrink: 0;
  padding: 6px 10px 8px;
  border-top: 1px solid var(--nexa-border-color, rgba(0, 0, 0, 0.1));
  font-size: var(--nxn-card-footer-fs-local);
  line-height: 1.35;
}

.nexion-card-node--nested .nexion-card-node__footer {
  padding: 4px 8px 6px;
}

.nexion-card-node--nested-deep .nexion-card-node__footer {
  padding: 3px 6px 5px;
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
  /* 풋터와 동일 크기 — 0.92 배 제거(깊은 카드에서 줌해도 부가만 알아보기 어렵던 원인) */
  font-size: inherit;
  color: var(--nexa-text-secondary, rgba(0, 0, 0, 0.5));
  white-space: nowrap;
  opacity: 0.88;
}

/* 한 줄 flex 에서 Link ID 가 0 너비로 밀리는 경우 방지 — 중첩 카드는 세로로 쌓음 */
.nexion-card-node__footer-line--stack {
  flex-direction: column;
  align-items: stretch;
  gap: 3px;
}

.nexion-card-node__footer-line--stack .nexion-card-node__footer-id {
  flex: none;
  width: 100%;
  min-width: 0;
  white-space: normal;
  word-break: break-all;
  overflow: visible;
  text-overflow: unset;
}

.nexion-card-node__footer-line--stack .nexion-card-node__footer-meta {
  white-space: normal;
}

.nexion-card-node__footer-collapsed {
  text-align: center;
  letter-spacing: 0.2em;
  color: var(--nexa-text-secondary, rgba(0, 0, 0, 0.45));
  font-size: var(--nxn-card-footer-fs-local);
}

.nexion-card-node__handle {
  width: 14px;
  height: 14px;
  min-width: 14px;
  min-height: 14px;
  background: var(--nexa-primary, #1976d2);
  border: 2px solid var(--nexa-background, #fff);
  z-index: 10;
  pointer-events: auto;
}

.nexion-card-node--nested .nexion-card-node__handle {
  width: 11px;
  height: 11px;
  min-width: 11px;
  min-height: 11px;
  border-width: 1.5px;
}

.nexion-card-node--nested-deep .nexion-card-node__handle {
  width: 9px;
  height: 9px;
  min-width: 9px;
  min-height: 9px;
  border-width: 1px;
}
</style>
