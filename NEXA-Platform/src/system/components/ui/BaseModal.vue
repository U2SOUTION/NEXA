<!-- BaseModal.vue
  전역 공용 기본 모달 컴포넌트
  드래그, 리사이즈, 최소화, 위치 저장 등 모든 기능 포함
-->
<template>
  <q-dialog :model-value="modelValue" @update:model-value="handleDialogUpdate" :no-backdrop-dismiss="persistent" :maximized="false" :class="{ 'base-modal-maximized': isMaximized }">
    <div ref="modalElementRef" class="base-modal-wrapper" :style="modalStyle">
      <q-card :class="['base-modal-card', { minimized: isMinimized, maximized: isMaximized }]">
        <!-- 상단 헤더 (드래그 핸들) -->
        <div class="base-modal-header" @mousedown="handleDragStart">
          <div class="base-modal-title">
            <span class="base-modal-title-en">{{ titleEn }}</span>
            <span v-if="titleKo" class="base-modal-title-separator">|</span>
            <span class="base-modal-title-ko">{{ titleKo }}</span>
            <span v-if="badge" class="base-modal-badge">{{ badge }}</span>
          </div>
          <div class="base-modal-header-actions">
            <q-btn v-if="minimizable" flat dense :icon="isMinimized ? 'expand_more' : 'remove'" @click.stop="toggleMinimize" class="base-modal-minimize-btn" />
            <q-btn v-if="maximizable" flat dense :icon="isMaximized ? 'fullscreen_exit' : 'fullscreen'" @click.stop="toggleMaximize" class="base-modal-maximize-btn" />
            <q-btn flat dense icon="close" @click.stop="handleClose" class="base-modal-close-btn" />
          </div>
        </div>

        <!-- 중간 컨텐츠 (최소화 시 숨김) -->
        <div v-if="!isMinimized" class="base-modal-body">
          <!-- 탭이 있을 때: 탭 패널 사용 -->
          <template v-if="tabs && tabs.length > 0">
            <q-tabs v-model="activeTab" dense class="base-modal-tabs" active-color="primary" />
            <div class="base-modal-tab-panels-wrapper">
              <q-tab-panels v-model="activeTab" animated class="base-modal-tab-panels">
                <q-tab-panel v-for="tab in tabs" :key="tab.name" :name="tab.name" class="base-modal-tab-panel">
                  <slot :name="`tab-${tab.name}`" />
                </q-tab-panel>
              </q-tab-panels>
            </div>
          </template>
          <!-- 탭이 없을 때: 기본 콘텐츠 슬롯 -->
          <div v-else class="base-modal-content">
            <slot name="content" />
          </div>
        </div>

        <!-- 하단 버튼 (최소화 시 숨김, footer slot이 있으면 표시) -->
        <div v-if="!isMinimized && $slots.footer" class="base-modal-footer">
          <slot name="footer" :close="handleClose" />
        </div>

        <!-- 리사이즈 핸들 (오른쪽 아래, 최소화/최대화 시 숨김) -->
        <div v-if="!isMinimized && !isMaximized && resizable" class="base-modal-resize-handle" @mousedown.stop="(e) => handleResizeStart(e, 'se')"></div>
      </q-card>
    </div>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useDraggableResizableModal } from '@system/composables/useDraggableResizableModal'
import { useModalSystemStore } from '@system/store/modalSystemStore'

const props = defineProps({
  // v-model
  modelValue: {
    type: Boolean,
    required: true,
  },
  // 모달 고유 ID (필수)
  modalId: {
    type: String,
    required: true,
  },
  // 타이틀 (영문)
  titleEn: {
    type: String,
    default: '',
  },
  // 타이틀 (한글)
  titleKo: {
    type: String,
    default: '',
  },
  // 배지 (옵션)
  badge: {
    type: String,
    default: '',
  },
  // 탭 설정
  tabs: {
    type: Array,
    default: () => [],
  },
  // 초기 크기
  initialSize: {
    type: Object,
    default: () => ({ width: 500, height: 600 }),
  },
  // 초기 위치
  initialPosition: {
    type: Object,
    default: () => ({
      x: (window.innerWidth - 500) / 2,
      y: (window.innerHeight - 400) / 2,
    }),
  },
  // 드래그 가능 여부
  draggable: {
    type: Boolean,
    default: true,
  },
  // 리사이즈 가능 여부
  resizable: {
    type: Boolean,
    default: true,
  },
  // 최소화 가능 여부
  minimizable: {
    type: Boolean,
    default: true,
  },
  // 최대화 가능 여부
  maximizable: {
    type: Boolean,
    default: true,
  },
  // 위치/크기 저장 여부
  rememberPosition: {
    type: Boolean,
    default: true,
  },
  // 최소 크기
  minSize: {
    type: Object,
    default: () => ({ width: 300, height: 400 }),
  },
  // 최대 크기
  maxSize: {
    type: Object,
    default: () => ({ width: window.innerWidth * 0.95, height: window.innerHeight * 0.95 }),
  },
  // persistent 모달 (배경 클릭으로 닫기 불가)
  persistent: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'close', 'minimize', 'restore', 'maximize', 'unmaximize'])

const modalSystemStore = useModalSystemStore()

// 드래그/리사이즈 기능
const { modalStyle, handleDragStart, handleResizeStart, initializeModal, cleanupModal, modalElementRef, updateMinSize, resetMinSize } = useDraggableResizableModal(props.modalId, {
  initialSize: props.initialSize,
  initialPosition: props.initialPosition,
  draggable: props.draggable,
  resizable: props.resizable,
  rememberPosition: props.rememberPosition,
  minSize: props.minSize,
  maxSize: props.maxSize,
})

// 모달 상태
const isMinimized = computed(() => {
  const modal = modalSystemStore.getModalState(props.modalId)
  return modal?.features?.minimized || false
})

const isMaximized = computed(() => {
  const modal = modalSystemStore.getModalState(props.modalId)
  return modal?.features?.maximized || false
})

// 활성 탭 (tabs가 있을 때만 사용)
const activeTab = ref(props.tabs && props.tabs.length > 0 ? props.tabs[0].name : null)

// 탭 변경 감지
watch(
  () => props.tabs,
  (newTabs) => {
    if (newTabs && newTabs.length > 0 && !activeTab.value) {
      activeTab.value = newTabs[0].name
    }
  },
  { immediate: true },
)

// 모달 열림/닫힘 감지
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      initializeModal()
      nextTick(() => {
        // 모달이 열릴 때 최소 크기 업데이트 가능
        if (modalElementRef.value) {
          // 필요시 동적으로 최소 크기 업데이트
        }
      })
    } else {
      cleanupModal()
    }
  },
)

// 다이얼로그 업데이트 핸들러
function handleDialogUpdate(value) {
  emit('update:modelValue', value)
  if (!value) {
    emit('close')
  }
}

// 모달 닫기
function handleClose() {
  emit('update:modelValue', false)
  emit('close')
}

// 최소화 토글
function toggleMinimize() {
  if (isMinimized.value) {
    modalSystemStore.restoreModal(props.modalId)
    emit('restore')
  } else {
    modalSystemStore.minimizeModal(props.modalId)
    emit('minimize')
  }
}

// 최대화 토글
function toggleMaximize() {
  if (isMaximized.value) {
    modalSystemStore.unmaximizeModal(props.modalId)
    emit('unmaximize')
  } else {
    modalSystemStore.maximizeModal(props.modalId)
    emit('maximize')
  }
}

// 탭 변경 핸들러 (외부에서 사용 가능하도록 expose)
function setActiveTab(tabName) {
  if (props.tabs && props.tabs.some((tab) => tab.name === tabName)) {
    activeTab.value = tabName
  }
}

// expose
defineExpose({
  setActiveTab,
  activeTab,
  updateMinSize,
  resetMinSize,
})

onMounted(() => {
  if (props.modelValue) {
    initializeModal()
  }
})

onUnmounted(() => {
  cleanupModal()
})
</script>

<style lang="scss" scoped>
// 최대화 상태일 때 q-dialog__inner의 중앙 정렬 비활성화
:deep(.q-dialog__inner) {
  &.base-modal-maximized {
    padding: 0 !important;
    display: flex !important;
    align-items: flex-start !important;
    justify-content: flex-start !important;
    max-width: none !important;
    min-width: auto !important;
    width: 100vw !important;
    height: 100vh !important;
    margin: 0 !important;
  }
}

.base-modal-wrapper {
  position: fixed;
  z-index: 3000;
  pointer-events: none;
  max-height: 98vh;
  display: flex;
  flex-direction: column;

  // 최대화 상태일 때 제한 제거
  &[style*='100vw'] {
    max-height: 100vh;
    max-width: 100vw;
  }
}

.base-modal-card {
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  min-width: 300px;
  min-height: 400px;
  width: 100%;
  height: 100%;
  max-height: 100%;
  border: 1px solid var(--nexa-ui-primary);
  background: var(--nexa-modal-bg);
  box-sizing: border-box;
  overflow: hidden;

  &.minimized {
    min-height: auto;
    height: auto !important;
    max-height: none !important;
  }

  &.maximized {
    width: 100vw !important;
    height: 100vh !important;
    max-height: 100vh !important;
    top: 0 !important;
    left: 0 !important;
    border-radius: 0;
  }
}

.base-modal-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: move;
  user-select: none;
  background-color: var(--nexa-modal-header-bg, var(--nexa-background-darker));
  padding: 6px 16px;
  border-bottom: 1px solid var(--nexa-border-color);
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--nexa-modal-header-hover-bg, var(--nexa-background-darker));
  }
}

.base-modal-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0; // 텍스트 오버플로우 방지
}

.base-modal-title-en {
  font-size: 22px;
  font-weight: 600;
  color: var(--nexa-text-primary);
  white-space: nowrap;
}

.base-modal-title-separator {
  color: var(--nexa-text-secondary);
  opacity: 0.5;
}

.base-modal-title-ko {
  color: var(--nexa-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.base-modal-badge {
  margin-left: 4px;
  padding: 2px 6px;
  background-color: var(--nexa-primary);
  color: white;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.base-modal-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.base-modal-tabs {
  flex-shrink: 0;
}

.base-modal-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0;
  -webkit-overflow-scrolling: touch;

  // 아이콘 크기 CSS 변수 (content slot 내부 요소에 사용)
  --modal-icon-size-title: 20px;
  --modal-icon-size-small: 14px;

  // 패딩 변형 클래스 (content slot 내부 요소에 사용)
  :deep(.modal-content-padded) {
    padding: 30px;
  }

  :deep(.modal-content-padded-sm) {
    padding: 16px;
  }

  // 아이콘 크기 유틸리티 클래스
  :deep(.modal-icon-title) {
    font-size: var(--modal-icon-size-title) !important;
  }

  :deep(.modal-icon-small) {
    font-size: var(--modal-icon-size-small) !important;
  }
}

.base-modal-tab-panels-wrapper {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.base-modal-tab-panels {
  height: 100%;
}

.base-modal-tab-panel {
  padding: 16px;
}

.base-modal-footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center; // 기본값: 중앙 정렬
  gap: 8px;

  // 우측 정렬 변형 클래스 (필요시 사용)
  &.right {
    justify-content: flex-end;
  }

  // 상단 마진 및 보더 추가 변형
  &.with-border {
    margin-top: 10px;
    padding-top: 16px;
    border-top: 1px solid var(--nexa-border-color);
  }
}

// Footer 스타일 유틸리티 클래스 (content 영역 내부 footer에 사용)
// 기본값: 중앙 정렬
.modal-footer-center {
  display: flex;
  justify-content: center; // 기본값: 중앙 정렬
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding-top: 16px;
  border-top: 1px solid var(--nexa-border-color);
}

.base-modal-resize-handle {
  position: absolute;
  left: auto;
  top: auto;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  cursor: nwse-resize;
  background-color: var(--nexa-resize-handle-bg);
  clip-path: polygon(0 100%, 100% 100%, 100% 0);
  z-index: 1002;
  pointer-events: auto;
  display: block;
  border: none;
  transition: background-color 0.2s ease;
  background-image: repeating-linear-gradient(45deg, transparent, transparent 2px, var(--nexa-resize-handle-pattern) 2px, var(--nexa-resize-handle-pattern) 4px);

  &:hover {
    background-color: var(--nexa-resize-handle-bg-hover);
    background-image: repeating-linear-gradient(45deg, transparent, transparent 2px, var(--nexa-resize-handle-pattern-hover) 2px, var(--nexa-resize-handle-pattern-hover) 4px);
  }
}
</style>
