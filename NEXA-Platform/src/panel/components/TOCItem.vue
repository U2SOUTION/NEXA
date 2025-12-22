<template>
  <div class="toc-item" :class="{ 'toc-item--active': isActive }">
    <div class="toc-item-header" @click="handleClick">
      <q-icon v-if="hasChildren" :name="expanded ? 'expand_more' : 'chevron_right'" size="16px" class="toc-toggle-icon" @click.stop="handleToggle" />
      <span v-else class="toc-toggle-spacer"></span>
      <span class="toc-item-text" :class="'toc-level-' + item.level">{{ item.text }}</span>
    </div>
    <div v-if="hasChildren && expanded" class="toc-children">
      <TOCItem
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        :expanded="getChildExpanded(child)"
        :current-section-id="currentSectionId"
        :auto-collapse="autoCollapse"
        :toc-expanded-map="tocExpandedMap"
        :toc-items="tocItems"
        @toggle="$emit('toggle', $event)"
        @scroll-to="$emit('scroll-to', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTOC } from 'src/modules/document-manager/composables/useTOC.js'

const props = defineProps({
  item: { type: Object, required: true },
  expanded: { type: Boolean, default: false, required: false },
  currentSectionId: { type: String, default: null },
  autoCollapse: { type: Boolean, default: true },
  tocExpandedMap: { type: Object, default: () => ({}) },
  tocItems: { type: Array, default: () => [] },
})

const emit = defineEmits(['toggle', 'scroll-to'])

const hasChildren = computed(() => props.item.children && props.item.children.length > 0)
const isActive = computed(() => props.currentSectionId === props.item.id)

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

function handleClick() {
  emit('scroll-to', props.item.id)
}

function handleToggle(e) {
  e.stopPropagation()
  emit('toggle', props.item.id)
}
</script>

<style lang="scss" scoped>
.toc-item {
  margin-bottom: 2px;
  display: block !important; // 명시적으로 블록 요소로 설정
  width: 100% !important; // 전체 너비 사용
  visibility: visible !important;
  opacity: 1 !important;
  min-height: 24px; // 최소 높이 보장

  .toc-item-header {
    display: flex !important;
    align-items: center;
    padding: 4px 8px;
    cursor: pointer;
    border-radius: 4px;
    color: var(--nexa-text-secondary);
    font-size: 0.875rem;
    transition: background-color 0.2s;
    min-height: 24px; // 최소 높이 보장
    visibility: visible !important;
    opacity: 1 !important;

    &:hover {
      background-color: var(--nexa-surface);
      color: var(--nexa-text-primary);
    }

    .toc-toggle-icon {
      margin-right: 4px;
      cursor: pointer;
      color: var(--nexa-text-secondary);
      flex-shrink: 0;
    }

    .toc-toggle-spacer {
      width: 20px;
      display: inline-block;
    }

    .toc-item-text {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &.toc-item--active .toc-item-header {
    background-color: var(--nexa-surface);
    color: var(--nexa-text-primary);
    font-weight: 600;
  }

  // 레벨별 들여쓰기
  .toc-level-1 {
    padding-left: 0;
    font-weight: 600;
  }

  .toc-level-2 {
    padding-left: 16px;
    font-weight: 500;
  }

  .toc-level-3 {
    padding-left: 32px;
  }

  .toc-level-4 {
    padding-left: 48px;
    font-size: 0.8rem;
  }

  .toc-level-5 {
    padding-left: 64px;
    font-size: 0.75rem;
  }

  .toc-level-6 {
    padding-left: 80px;
    font-size: 0.7rem;
  }
}

.toc-children {
  margin-left: 8px;
  padding-left: 8px;
  border-left: 1px solid var(--nexa-border-color);
}
</style>

