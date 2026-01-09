<template>
  <div
    v-if="visible"
    ref="overlayRef"
    class="table-actions-overlay"
    :style="overlayStyle"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 선택 수량 표시 (복수 선택 시에만 표시) -->
    <div v-if="showSelectedCount && selectedCount > 1" class="selected-count-indicator">
      <q-icon name="check_circle" size="16px" color="primary" class="q-mr-xs" />
      <span class="selected-count-text">{{ selectedCount }}개 선택</span>
      <span v-if="selectedCountHint" class="selected-count-hint">{{ selectedCountHint }}</span>
    </div>

    <!-- 작업 버튼들 (호버된 행이 있고 단일 선택일 때만 표시) -->
    <template v-if="showActions && hoveredRowId && selectedCount <= 1">
      <q-btn
        v-if="actions.edit"
        flat
        dense
        round
        icon="edit"
        color="primary"
        @click="$emit('edit')"
        class="q-mr-xs action-btn action-btn-medium"
      />
      <q-btn
        v-if="actions.insert"
        flat
        dense
        round
        icon="playlist_add"
        color="positive"
        @click="$emit('insert-below')"
        class="q-mr-xs action-btn action-btn-medium"
      />
      <q-btn
        v-if="actions.delete"
        flat
        dense
        round
        icon="delete"
        color="negative"
        @click="$emit('delete')"
        class="action-btn action-btn-medium"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  hoveredRowId: {
    type: [Number, String],
    default: null,
  },
  selectedCount: {
    type: Number,
    default: 0,
  },
  showSelectedCount: {
    type: Boolean,
    default: true,
  },
  selectedCountHint: {
    type: String,
    default: '사이드바에서 관리',
  },
  showActions: {
    type: Boolean,
    default: true,
  },
  actions: {
    type: Object,
    default: () => ({
      edit: true,
      insert: true,
      delete: true,
    }),
  },
  position: {
    type: Object,
    default: () => ({ top: 0, right: 26 }),
  },
  autoPosition: {
    type: Boolean,
    default: false,
  },
  targetRowId: {
    type: [Number, String],
    default: null,
  },
})

const emit = defineEmits(['edit', 'delete', 'insert-below', 'mouseenter', 'mouseleave'])

const overlayRef = ref(null)

// 오버레이 스타일 계산
const overlayStyle = computed(() => {
  // position.top과 position.right가 숫자면 px를 붙이고, 문자열이면 그대로 사용
  const top =
    typeof props.position.top === 'number' ? `${props.position.top}px` : props.position.top || '0px'
  const right =
    typeof props.position.right === 'number'
      ? `${props.position.right}px`
      : props.position.right || '26px'

  if (props.autoPosition && props.targetRowId) {
    // 자동 위치 계산은 부모에서 처리하므로 position prop 사용
    return {
      top,
      right,
      opacity: props.visible ? 1 : 0,
      visibility: props.visible ? 'visible' : 'hidden',
    }
  }
  return {
    top,
    right,
    opacity: props.visible ? 1 : 0,
    visibility: props.visible ? 'visible' : 'hidden',
  }
})

// 마우스 이벤트 핸들러
function handleMouseEnter() {
  emit('mouseenter')
}

function handleMouseLeave() {
  emit('mouseleave')
}

// 외부에서 overlayRef에 접근할 수 있도록 expose
defineExpose({
  overlayRef,
})
</script>

<style lang="scss" scoped>
@import './TableActionsOverlay.scss';
</style>
