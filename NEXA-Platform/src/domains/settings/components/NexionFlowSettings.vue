<template>
  <div class="nexion-flow-settings q-pa-sm">
    <div class="text-h6 q-mb-sm">Nexion 캔버스 (Vue Flow)</div>
    <p class="text-caption text-grey-7 q-mb-lg">
      노드 연결선·배경·미니맵 등은 사용자 설정에 저장되며, Nexion 도메인 캔버스에 즉시 반영됩니다.
    </p>

    <div class="settings-section q-mb-lg">
      <div class="text-subtitle1 text-weight-medium q-mb-md">연결선 (엣지)</div>
      <div class="row q-col-gutter-md items-end">
        <div class="col-12 col-sm-4">
          <div class="text-caption q-mb-xs">선 색</div>
          <q-input
            :model-value="nx.edgeStrokeColor"
            dense
            outlined
            @update:model-value="(v) => patch({ edgeStrokeColor: v })"
          >
            <template #append>
              <q-icon name="colorize" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-color
                    :model-value="nx.edgeStrokeColor"
                    @update:model-value="(v) => patch({ edgeStrokeColor: v })"
                  />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
        <div class="col-12 col-sm-8">
          <div class="text-caption q-mb-xs">선 두께 ({{ nx.edgeStrokeWidth }}px)</div>
          <q-slider
            :model-value="nx.edgeStrokeWidth"
            :min="1"
            :max="8"
            :step="1"
            label
            color="primary"
            @update:model-value="(v) => patch({ edgeStrokeWidth: v })"
          />
        </div>
      </div>
    </div>

    <div class="settings-section q-mb-lg">
      <div class="text-subtitle1 text-weight-medium q-mb-md">연결 드래그 미리보기</div>
      <div class="row q-col-gutter-md items-end">
        <div class="col-12 col-sm-4">
          <div class="text-caption q-mb-xs">선 색</div>
          <q-input
            :model-value="nx.connectionStrokeColor"
            dense
            outlined
            @update:model-value="(v) => patch({ connectionStrokeColor: v })"
          >
            <template #append>
              <q-icon name="colorize" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-color
                    :model-value="nx.connectionStrokeColor"
                    @update:model-value="(v) => patch({ connectionStrokeColor: v })"
                  />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
        <div class="col-12 col-sm-8">
          <div class="text-caption q-mb-xs">선 두께 ({{ nx.connectionStrokeWidth }}px)</div>
          <q-slider
            :model-value="nx.connectionStrokeWidth"
            :min="1"
            :max="8"
            :step="1"
            label
            color="primary"
            @update:model-value="(v) => patch({ connectionStrokeWidth: v })"
          />
        </div>
      </div>
    </div>

    <div class="settings-section q-mb-lg">
      <div class="text-subtitle1 text-weight-medium q-mb-md">캔버스 배경</div>
      <q-input
        class="q-mb-md"
        :model-value="nx.canvasBgColor"
        dense
        outlined
        label="배경색 (CSS)"
        hint="비우면 플랫폼 테마 배경(`--nexa-background`)을 사용합니다."
        placeholder="예: #1e1e1e 또는 transparent"
        @update:model-value="(v) => patch({ canvasBgColor: v ?? '' })"
      />
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-4">
          <q-select
            :model-value="nx.backgroundVariant"
            :options="bgVariantOptions"
            dense
            outlined
            label="패턴 종류"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            @update:model-value="(v) => patch({ backgroundVariant: v })"
          />
        </div>
        <div class="col-12 col-sm-4">
          <div class="text-caption q-mb-xs">패턴 간격 ({{ nx.backgroundDotGap }})</div>
          <q-slider
            :model-value="nx.backgroundDotGap"
            :min="8"
            :max="40"
            :step="1"
            label
            color="primary"
            @update:model-value="(v) => patch({ backgroundDotGap: v })"
          />
        </div>
        <div class="col-12 col-sm-4">
          <div class="text-caption q-mb-xs">패턴 크기 ({{ nx.backgroundDotSize }})</div>
          <q-slider
            :model-value="nx.backgroundDotSize"
            :min="0.5"
            :max="3"
            :step="0.05"
            label
            color="primary"
            @update:model-value="(v) => patch({ backgroundDotSize: v })"
          />
        </div>
      </div>
      <div class="text-caption q-mb-xs">패턴 색 (CSS)</div>
      <q-input
        :model-value="nx.backgroundPatternColor"
        dense
        outlined
        @update:model-value="(v) => patch({ backgroundPatternColor: v })"
      >
        <template #append>
          <q-icon name="colorize" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-color
                :model-value="nx.backgroundPatternColor"
                @update:model-value="(v) => patch({ backgroundPatternColor: v })"
              />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>

    <div class="settings-section q-mb-lg">
      <div class="text-subtitle1 text-weight-medium q-mb-md">연결·그리드</div>
      <div class="text-caption q-mb-xs">연결 스냅 반경 ({{ nx.connectionRadius }}px)</div>
      <q-slider
        class="q-mb-md"
        :model-value="nx.connectionRadius"
        :min="32"
        :max="120"
        :step="4"
        label
        color="primary"
        @update:model-value="(v) => patch({ connectionRadius: v })"
      />
      <q-toggle
        :model-value="nx.snapToGrid"
        label="그리드에 스냅"
        @update:model-value="(v) => patch({ snapToGrid: v })"
      />
    </div>

    <div class="settings-section q-mb-lg">
      <div class="text-subtitle1 text-weight-medium q-mb-sm">미니맵 (우측 패널)</div>
      <p class="text-caption text-grey-7 q-mb-md">
        색 필드를 비우면 라이트/다크 테마에 맞는 기본 톤이 사용됩니다.
      </p>
      <div class="row q-col-gutter-sm">
        <div class="col-12 col-sm-6">
          <q-input
            :model-value="nx.minimapMaskColor"
            dense
            outlined
            label="마스크(비포커스 영역) 색"
            @update:model-value="(v) => patch({ minimapMaskColor: v ?? '' })"
          />
        </div>
        <div class="col-12 col-sm-6">
          <q-input
            :model-value="nx.minimapMaskStrokeColor"
            dense
            outlined
            label="마스크 테두리"
            @update:model-value="(v) => patch({ minimapMaskStrokeColor: v ?? '' })"
          />
        </div>
        <div class="col-12 col-sm-6">
          <q-input
            :model-value="nx.minimapNodeColor"
            dense
            outlined
            label="노드 면 색"
            @update:model-value="(v) => patch({ minimapNodeColor: v ?? '' })"
          />
        </div>
        <div class="col-12 col-sm-6">
          <q-input
            :model-value="nx.minimapNodeStrokeColor"
            dense
            outlined
            label="노드 테두리"
            @update:model-value="(v) => patch({ minimapNodeStrokeColor: v ?? '' })"
          />
        </div>
      </div>
      <q-btn
        class="q-mt-md"
        flat
        dense
        color="primary"
        label="미니맵 색만 기본(자동 테마)으로"
        @click="clearMinimapColors"
      />
    </div>

    <q-separator class="q-my-md" />

    <q-btn outline color="warning" label="이 섹션 전체 기본값으로 초기화" @click="resetAll" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserSettingsStore } from '@system/store/userSettingsStore'

const userSettings = useUserSettingsStore()
const { settings } = storeToRefs(userSettings)

const nx = computed(() => settings.value.nexionFlow)

const bgVariantOptions = [
  { label: '점 (dots)', value: 'dots' },
  { label: '선 (lines)', value: 'lines' },
  { label: '십자 (cross)', value: 'cross' },
]

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
</style>
