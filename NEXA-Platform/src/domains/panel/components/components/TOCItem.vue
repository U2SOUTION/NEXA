<template>
  <div class="toc-item" :class="['toc-level-' + item.level, { 'toc-item--active': isActive }]">
    <div class="toc-item-header" @click="handleClick">
      <q-icon v-if="hasChildren" :name="expanded ? 'expand_more' : 'chevron_right'" size="16px" class="toc-toggle-icon" @click.stop="handleToggle" />
      <span v-else class="toc-toggle-spacer"></span>
      <span class="toc-item-text" @click="handleTextClick" v-html="highlightedText"></span>
    </div>
    <q-slide-transition>
      <div v-show="hasChildren && expanded" class="toc-children">
        <TOCItem
          v-for="child in item.children"
          :key="child.id"
          :item="child"
          :expanded="getChildExpanded(child)"
          :current-section-id="currentSectionId"
          :auto-collapse="autoCollapse"
          :toc-expanded-map="tocExpandedMap"
          :toc-items="tocItems"
          :search-query="searchQuery"
          @toggle="$emit('toggle', $event)"
          @scroll-to="$emit('scroll-to', $event)"
        />
      </div>
    </q-slide-transition>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTOC } from '@domains/dev/modules/document-manager/composables/useTOC'

const props = defineProps({
  item: { type: Object, required: true },
  expanded: { type: Boolean, default: false, required: false },
  currentSectionId: { type: String, default: null },
  autoCollapse: { type: Boolean, default: true },
  tocExpandedMap: { type: Object, default: () => ({}) },
  tocItems: { type: Array, default: () => [] },
  searchQuery: { type: String, default: '' },
})

const emit = defineEmits(['toggle', 'scroll-to'])

const hasChildren = computed(() => props.item.children && props.item.children.length > 0)
const isActive = computed(() => props.currentSectionId === props.item.id)

/**
 * 한자/한글 포함 여부 확인
 */
function hasCJKOrHangul(text) {
  return /[\u4E00-\u9FFF\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/.test(text)
}

/**
 * 검색어가 있으면 텍스트를 하이라이트
 */
const highlightedText = computed(() => {
  const query = props.searchQuery?.trim()
  if (!query) return props.item.text

  try {
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const flags = hasCJKOrHangul(query) ? 'g' : 'gi'
    const regex = new RegExp(`(${escapedQuery})`, flags)
    return props.item.text.replace(regex, '<mark class="toc-search-highlight">$1</mark>')
  } catch {
    return props.item.text
  }
})

// useTOC composable에서 비즈니스 로직 함수 가져오기
const { getItemExpanded } = useTOC({
  tocItems: computed(() => props.tocItems),
  tocExpanded: computed(() => props.tocExpandedMap),
  tocAutoCollapse: computed(() => props.autoCollapse),
  tocAutoCloseOnContentClick: computed(() => false), // 패널에서는 사용하지 않음
  currentSectionId: computed(() => props.currentSectionId),
  allTOCExpandedState: computed(() => false), // 패널에서는 사용하지 않음
  isManualHighlight: computed(() => false), // 패널에서는 사용하지 않음
  selectedFile: computed(() => null), // 패널에서는 사용하지 않음
})

/**
 * 자식 항목의 expanded 상태를 계산 (비즈니스 로직은 useTOC로 위임)
 * @param {Object} childItem - 자식 항목 객체
 * @returns {boolean} 확장 여부
 */
function getChildExpanded(childItem) {
  return getItemExpanded(
    childItem.id,
    props.tocExpandedMap,
    props.autoCollapse,
    props.currentSectionId,
    [props.item], // 현재 항목의 자식만 확인 (재귀적으로 처리되므로)
  )
}

function handleClick(e) {
  // 화살표 아이콘을 클릭한 경우는 handleToggle에서 처리하므로 여기서는 무시
  if (e.target.closest('.toc-toggle-icon')) {
    return
  }
  // 텍스트를 클릭한 경우는 handleTextClick에서 처리
  if (e.target.closest('.toc-item-text')) {
    return
  }
  // 헤더의 다른 영역을 클릭한 경우 스크롤만 이동
  emit('scroll-to', props.item.id)
}

function handleTextClick(e) {
  e.stopPropagation()

  // 자식이 있는 아이템을 클릭하면 토글 발생
  // 아코디언 모드일 때: 2레벨 이상만 토글
  // 아코디언 모드 해제 시: 모든 레벨에서 토글
  const shouldToggle = hasChildren.value && (props.autoCollapse ? props.item.level >= 2 : true)

  if (shouldToggle) {
    emit('toggle', props.item.id)
  }
  // 스크롤 이동
  emit('scroll-to', props.item.id)
}

function handleToggle(e) {
  e.stopPropagation()
  emit('toggle', props.item.id)
}
</script>

<style lang="scss" scoped>
.toc-item {
  margin-bottom: 0;
  display: block;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  visibility: visible;
  opacity: 1;
  min-height: 24px;
  min-width: 0;

  .toc-item-header {
    display: flex;
    align-items: center;
    padding: 0px 2px;
    cursor: pointer;
    border-radius: 4px;
    color: var(--nexa-text-secondary);
    font-size: 0.875rem;
    transition: background-color 0.2s;
    min-height: 24px;
    min-width: 0;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    overflow: hidden;
    visibility: visible;
    opacity: 1;

    &:hover {
      background-color: var(--nexa-surface);
      color: var(--nexa-text-primary);
    }

    .toc-toggle-icon {
      margin-right: 4px;
      cursor: pointer;
      color: var(--nexa-text-secondary);
      flex-shrink: 0; // 아이콘은 축소되지 않음
    }

    .toc-toggle-spacer {
      width: 20px;
      flex-shrink: 0; // 스페이서도 축소되지 않음
      display: inline-block;
    }

    .toc-item-text {
      flex: 1 1 0%;
      min-width: 0;
      max-width: 100%;
      width: 0; // flexbox에서 오버플로우 작동을 위해 0으로 설정
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      box-sizing: border-box;
    }
  }
  //활성 상태 스타일
  &.toc-item--active .toc-item-header {
    color: var(--nexa-text-primary-focus);
  }

  // 레벨별 들여쓰기 : 헤더에 적용하여 화살표와 텍스트가 함께 이동
  &.toc-level-1 .toc-item-header {
    padding-left: 0px;
  }

  &.toc-level-1 .toc-item-text {
    font-weight: 600;
  }

  &.toc-level-2 .toc-item-header {
    padding-left: 0px; // 8px (기본) + 16px (들여쓰기)
  }

  &.toc-level-2 .toc-item-text {
    font-weight: 500;
  }

  &.toc-level-3 .toc-item-header {
    padding-left: 0px; // 8px (기본) + 32px (들여쓰기)
  }

  &.toc-level-4 .toc-item-header {
    padding-left: 0px; // 8px (기본) + 48px (들여쓰기)
  }

  &.toc-level-4 .toc-item-text {
    font-size: 0.8rem;
  }

  &.toc-level-5 .toc-item-header {
    padding-left: 16px; // 8px (기본) + 64px (들여쓰기)
  }

  &.toc-level-5 .toc-item-text {
    font-size: 0.75rem;
  }

  &.toc-level-6 .toc-item-header {
    padding-left: 20px; // 8px (기본) + 80px (들여쓰기)
  }

  &.toc-level-6 .toc-item-text {
    font-size: 0.7rem;
  }
}

.toc-children {
  margin-left: 6px;
  padding-left: 6px;
  border-left: 1px solid var(--nexa-border-color);
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
  min-width: 0;
  // 부드러운 전환을 위한 추가 스타일
  transition: opacity 0.3s ease-in-out;
}

// 검색 하이라이트 스타일
.toc-search-highlight {
  background-color: var(--nexa-accent);
  color: var(--nexa-text-primary);
  padding: 2px 4px;
  border-radius: 2px;
  font-weight: 600;
}

// 모든 하위 요소에도 적용
.toc-item *,
.toc-item-header *,
.toc-item span,
.toc-item div {
  max-width: 100%;
  box-sizing: border-box;
}
</style>
