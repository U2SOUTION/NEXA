<template>
  <div class="nexion-flow-settings" :class="{ 'q-pa-sm': !embedded, 'nexion-flow-settings--embedded': embedded }">
    <template v-if="!embedded">
      <div class="text-h6 q-mb-sm">Nexion 캔버스 (Vue Flow)</div>
      <p class="text-caption text-grey-7 q-mb-lg">노드 연결선·배경·미니맵 등은 사용자 설정에 저장되며, Nexion 도메인 캔버스에 즉시 반영됩니다.</p>
    </template>
    <p v-else class="text-caption text-grey-7 q-mb-md">변경 사항은 저장되며 캔버스에 바로 적용됩니다. 동일 항목은 우측 패널 <strong>설정</strong> 탭이나 상단 헤더 <strong>설정</strong> → Nexion 캔버스에서도 편집할 수 있습니다.</p>

    <div class="settings-section q-mb-lg">
      <div class="text-subtitle1 text-weight-medium q-mb-sm">연결선 (엣지)</div>
      <div class="nxf-pair row items-center no-wrap q-gutter-x-sm">
        <div class="col">
          <div class="text-caption q-mb-xs">선 두께 ({{ edgeWidthLabel }}px)</div>
          <q-slider :model-value="nx.edgeStrokeWidth" :min="0.1" :max="5" :step="0.1" dense color="primary" @update:model-value="(v) => patch({ edgeStrokeWidth: v })" />
        </div>
        <NexionColorSwatch class="nxf-pair__swatch" :model-value="nx.edgeStrokeColor" aria-label="엣지 선 색" @update:model-value="(v) => patch({ edgeStrokeColor: v })" />
      </div>
      <p class="text-caption text-grey-7 q-mt-sm q-mb-xs">클릭해 선택한 연결선은 색·두께가 잠시 바뀝니다. (멀티 선택: <strong>Ctrl</strong> 또는 <strong>⌘</strong> 누른 채 클릭)</p>
      <div class="nxf-pair row items-center no-wrap q-gutter-x-sm">
        <div class="col">
          <div class="text-caption q-mb-xs">선택 시 강조 색</div>
          <span class="text-caption text-grey-7">비우면 미리보기 선 색과 동일</span>
        </div>
        <NexionColorSwatch
          class="nxf-pair__swatch"
          clearable
          :model-value="nx.edgeSelectedStrokeColor"
          fallback-for-picker="#ff9800"
          aria-label="선택된 연결선 강조 색"
          @update:model-value="(v) => patch({ edgeSelectedStrokeColor: v ?? '' })"
        />
      </div>
    </div>

    <div class="settings-section q-mb-lg">
      <div class="text-subtitle1 text-weight-medium q-mb-sm">연결 드래그 미리보기</div>
      <p class="text-caption text-grey-7 q-mb-sm">카드 <strong>오른쪽 핸들</strong>에서 선을 끌어 <strong>왼쪽 핸들</strong>로 가져가는 동안에만 보이는 임시 선입니다. 놓기 전까지의 모양이며, 이미 연결된 선(엣지)과는 별도 설정입니다.</p>
      <div class="nxf-pair row items-center no-wrap q-gutter-x-sm">
        <div class="col">
          <div class="text-caption q-mb-xs">선 두께 ({{ nx.connectionStrokeWidth }}px)</div>
          <q-slider :model-value="nx.connectionStrokeWidth" :min="1" :max="8" :step="1" dense color="primary" @update:model-value="(v) => patch({ connectionStrokeWidth: v })" />
        </div>
        <NexionColorSwatch class="nxf-pair__swatch" :model-value="nx.connectionStrokeColor" aria-label="연결 미리보기 선 색" @update:model-value="(v) => patch({ connectionStrokeColor: v })" />
      </div>
    </div>

    <div class="settings-section q-mb-lg">
      <div class="text-subtitle1 text-weight-medium q-mb-sm">캔버스 배경</div>
      <p class="text-caption text-grey-7 q-mb-sm">단색 바탕만 적용합니다. 비우면 테마 배경을 씁니다.</p>
      <div class="row items-center no-wrap q-gutter-x-sm">
        <div class="col text-caption">바탕 색</div>
        <NexionColorSwatch clearable :model-value="nx.canvasBgColor" aria-label="캔버스 배경 색" @update:model-value="(v) => patch({ canvasBgColor: v ?? '' })" />
      </div>
    </div>

    <div class="settings-section q-mb-lg">
      <div class="text-subtitle1 text-weight-medium q-mb-sm">연결 스냅</div>
      <p class="text-caption text-grey-7 q-mb-xs">
        선을 끌 때 핸들에 <strong>얼마나 가까이</strong> 가면 붙일지입니다. <strong>0</strong>이면 스냅을 쓰지 않고, 핸들 중심에 맞출 때만 연결됩니다.
      </p>
      <div class="text-caption q-mb-xs">스냅 반경 ({{ nx.connectionRadius }}px)</div>
      <q-slider :model-value="nx.connectionRadius" :min="0" :max="120" :step="4" dense color="primary" @update:model-value="(v) => patch({ connectionRadius: v })" />
    </div>

    <div class="settings-section q-mb-lg">
      <div class="text-subtitle1 text-weight-medium q-mb-sm">미니맵 (우측 패널)</div>
      <p class="text-caption text-grey-7 q-mb-sm">비우면 라이트/다크 기본 톤입니다. 칸을 누르면 색 선택, × 로 자동 톤으로 돌아갑니다.</p>

      <div class="nxf-mini-row row items-center no-wrap q-gutter-x-sm q-mb-xs">
        <div class="col text-caption">마스크(비포커스)</div>
        <NexionColorSwatch clearable :model-value="nx.minimapMaskColor" aria-label="미니맵 마스크 색" @update:model-value="(v) => patch({ minimapMaskColor: v ?? '' })" />
      </div>
      <div class="nxf-mini-row row items-center no-wrap q-gutter-x-sm q-mb-xs">
        <div class="col text-caption">마스크 테두리</div>
        <NexionColorSwatch clearable :model-value="nx.minimapMaskStrokeColor" aria-label="미니맵 마스크 테두리" @update:model-value="(v) => patch({ minimapMaskStrokeColor: v ?? '' })" />
      </div>
      <div class="nxf-mini-row row items-center no-wrap q-gutter-x-sm q-mb-xs">
        <div class="col text-caption">노드 면</div>
        <NexionColorSwatch clearable :model-value="nx.minimapNodeColor" aria-label="미니맵 노드 면 색" @update:model-value="(v) => patch({ minimapNodeColor: v ?? '' })" />
      </div>
      <div class="nxf-mini-row row items-center no-wrap q-gutter-x-sm q-mb-sm">
        <div class="col text-caption">노드 테두리</div>
        <NexionColorSwatch clearable :model-value="nx.minimapNodeStrokeColor" aria-label="미니맵 노드 테두리 색" @update:model-value="(v) => patch({ minimapNodeStrokeColor: v ?? '' })" />
      </div>

      <q-btn flat dense color="primary" label="미니맵 색만 전부 자동" @click="clearMinimapColors" />
    </div>

    <q-separator class="q-my-md" />

    <q-btn outline color="warning" label="이 섹션 전체 기본값으로 초기화" @click="resetAll" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserSettingsStore } from '@system/store/userSettingsStore'
import NexionColorSwatch from './NexionColorSwatch.vue'

defineProps({
  embedded: {
    type: Boolean,
    default: false,
  },
})

const userSettings = useUserSettingsStore()
const { settings } = storeToRefs(userSettings)

const nx = computed(() => settings.value.nexionFlow)

const edgeWidthLabel = computed(() => {
  const w = nx.value.edgeStrokeWidth
  return w >= 1 ? String(Math.round(w)) : w.toFixed(1)
})

function patch(partial) {
  userSettings.patchNexionFlowSettings(partial)
}

function clearMinimapColors() {
  userSettings.patchNexionFlowSettings({
    minimapMaskColor: '',
    minimapMaskStrokeColor: '',
    minimapNodeColor: '',
    minimapNodeStrokeColor: '',
  })
}

function resetAll() {
  userSettings.resetNexionFlowSettings()
}
</script>

<style lang="scss" scoped>
.nexion-flow-settings {
  max-width: 720px;
}

.nexion-flow-settings--embedded {
  max-width: none;
}

.nxf-pair__swatch {
  padding-top: 18px;
}

.nxf-mini-row .col {
  min-width: 0;
}
</style>
