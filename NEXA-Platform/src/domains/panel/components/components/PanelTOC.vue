<!-- PanelTOC.vue
  목차 패널
  Props 기반으로 재사용 가능하도록 패널화
  TOCItem은 같은 폴더의 별도 파일로 관리 (재귀 컴포넌트 특성상 안정성을 위해 분리)
-->
<template>
  <div class="nexa-panel-section toc-section">
    <!-- 헤더 컨트롤 -->
    <div class="row items-center justify-between q-gutter-xs toc-header-controls">
      <q-toggle :model-value="props.isAllExpanded" @update:model-value="handleToggleAll" size="sm" dense :label="props.isAllExpanded ? '전체 접기' : '전체 펼치기'" color="primary" />
      <q-toggle :model-value="props.autoCollapse" @update:model-value="handleAutoCollapseChange" size="sm" dense label="아코디언" color="primary" :key="`accordion-${props.autoCollapse}`" />
    </div>

    <!-- 검색 입력 -->
    <div class="toc-search-wrapper">
      <q-input v-model="searchQuery" dense outlined placeholder="목차 검색..." clearable />
    </div>

    <!-- 목차 내용 -->
    <div class="toc-section-content">
      <div v-if="items.length === 0" class="q-pa-md text-center text-grey-6 text-caption">목차가 없습니다.</div>
      <div v-else-if="filteredItems.length === 0" class="q-pa-md text-center text-grey-6 text-caption">검색 결과가 없습니다.</div>
      <template v-else>
        <TOCItem
          v-for="item in filteredItems"
          :key="item.id"
          :item="item"
          :expanded="getItemExpandedForSearch(item)"
          :current-section-id="currentSectionId"
          :auto-collapse="autoCollapse"
          :toc-expanded-map="tocExpandedMap"
          :toc-items="items"
          :search-query="searchQueryString"
          @toggle="handleToggle"
          @scroll-to="handleScrollTo"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
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

// 검색어 상태
const searchQuery = ref('')

// 검색어를 문자열로 변환하여 전달 (반응성 보장)
const searchQueryString = computed(() => searchQuery.value || '')

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

/**
 * 텍스트 정규화 (한자/한글 포함 여부에 따라 처리)
 */
function normalizeText(text) {
  // 한자/한글이 포함되어 있으면 원본 사용, 그 외에는 소문자 변환
  return /[\u4E00-\u9FFF\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/.test(text) ? text : text.toLowerCase()
}

/**
 * 검색어로 필터링된 아이템 목록 생성
 */
const filteredItems = computed(() => {
  const query = searchQuery.value.trim()
  if (!query) return props.items

  const normalizedQuery = normalizeText(query)

  function filterItem(item) {
    const normalizedText = normalizeText(item.text)
    const itemMatches = normalizedText.includes(normalizedQuery)
    const filteredChildren = item.children?.map((child) => filterItem(child)).filter(Boolean) || []

    if (itemMatches || filteredChildren.length > 0) {
      return { ...item, children: filteredChildren.length > 0 ? filteredChildren : item.children }
    }
    return null
  }

  return props.items.map((item) => filterItem(item)).filter(Boolean)
})

/**
 * 검색 시 아이템의 expanded 상태 계산 (검색어가 있으면 매칭된 항목은 자동으로 펼치기)
 */
function getItemExpandedForSearch(item) {
  const query = searchQuery.value.trim()
  if (!query) return getRootExpanded(item)

  const normalizedQuery = normalizeText(query)
  const itemMatches = normalizeText(item.text).includes(normalizedQuery)

  if (itemMatches) return true

  if (item.children?.some((child) => normalizeText(child.text).includes(normalizedQuery) || getItemExpandedForSearch(child))) {
    return true
  }

  return getRootExpanded(item)
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
  min-height: 200px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: visible; // q-input의 경계선이 잘리지 않도록
  overflow-y: visible;
  min-width: 0;
  padding: 0; // 좌우 패딩은 .accordion-wrapper에서 처리
}

.toc-header-controls {
  padding: 8px 12px;
  flex-shrink: 0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  min-width: 0;
}

.toc-section-content {
  overflow-y: visible;
  overflow-x: hidden;
  padding: 8px; // 이전 .toc-list의 padding: 4px 0을 고려하여 조정
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  min-width: 0;
}

// 검색 입력 필드 래퍼
// 전역 스타일(_form.scss)에서 .q-field__control { max-width: 100%; } 처리됨
.toc-search-wrapper {
  padding: 8px; // 상하 패딩
  flex-shrink: 0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: visible; // q-input의 경계선이 잘리지 않도록
  overflow-y: visible;
  min-width: 0;
}
</style>
