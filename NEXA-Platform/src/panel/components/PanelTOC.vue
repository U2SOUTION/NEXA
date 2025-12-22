<!-- PanelTOC.vue
  목차 패널
  Props 기반으로 재사용 가능하도록 패널화
  TOCItem은 같은 폴더의 별도 파일로 관리 (재귀 컴포넌트 특성상 안정성을 위해 분리)
-->
<template>
  <div class="nexa-panel-section toc-section">
    <!-- 헤더 컨트롤 -->
    <div class="toc-section-header q-pa-sm">
      <div class="row items-center justify-between q-gutter-xs">
        <q-toggle :model-value="isAllExpanded" @update:model-value="handleToggleAll" size="sm" dense :label="isAllExpanded ? '전체 접기' : '전체 펼치기'" color="primary" />
        <q-toggle :model-value="autoCollapse" @update:model-value="handleAutoCollapseChange" size="sm" dense label="아코디언" color="primary" />
      </div>
    </div>

    <q-separator />

    <!-- 목차 내용 -->
    <div class="toc-section-content">
      <div v-if="items.length === 0" class="q-pa-md text-center text-grey-6 text-caption">목차가 없습니다.</div>
      <div v-else class="toc-list">
        <template v-for="item in items" :key="item.id">
          <TOCItem :item="item" :expanded="getRootExpanded(item)" :current-section-id="currentSectionId" :auto-collapse="autoCollapse" :toc-expanded-map="tocExpandedMap" :toc-items="items" @toggle="handleToggle" @scroll-to="handleScrollTo" />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTOC } from 'src/modules/document-manager/composables/useTOC.js'
import TOCItem from './TOCItem.vue'

// Props 정의
const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  currentSectionId: {
    type: String,
    default: null,
  },
  autoCollapse: {
    type: Boolean,
    default: true,
  },
  isAllExpanded: {
    type: Boolean,
    default: false,
  },
  tocExpandedMap: {
    type: Object,
    default: () => ({}),
  },
})

// Emits 정의
const emit = defineEmits(['toggle', 'scroll-to', 'toggle-all', 'auto-collapse-change'])

// useTOC composable에서 비즈니스 로직 함수 가져오기
const { getItemExpanded } = useTOC({
  tocItems: computed(() => props.items),
  tocExpanded: computed(() => props.tocExpandedMap),
  tocAutoCollapse: computed(() => props.autoCollapse),
  tocAutoCloseOnContentClick: computed(() => false), // 패널에서는 사용하지 않음
  currentSectionId: computed(() => props.currentSectionId),
  allTOCExpandedState: computed(() => props.isAllExpanded),
  isManualHighlight: computed(() => false), // 패널에서는 사용하지 않음
  selectedFile: computed(() => null), // 패널에서는 사용하지 않음
})

/**
 * 루트 항목의 expanded 상태를 계산
 */
function getRootExpanded(item) {
  return getItemExpanded(item.id, props.tocExpandedMap, props.autoCollapse, props.currentSectionId, props.items)
}

function handleToggle(itemId) {
  emit('toggle', itemId)
}

function handleScrollTo(headingId) {
  emit('scroll-to', headingId)
}

function handleToggleAll() {
  emit('toggle-all')
}

function handleAutoCollapseChange(value) {
  emit('auto-collapse-change', value)
}
</script>

<style lang="scss" scoped>
.toc-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 200px;
  max-height: 600px;
}

.toc-section-header {
  flex-shrink: 0;
}

.toc-section-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.toc-list {
  padding: 4px 0;
}
</style>


