<!-- ViewModeSettingsModal.vue
  뷰 모드 설정 모달
-->
<template>
  <q-dialog :model-value="modelValue" @update:model-value="handleDialogUpdate" no-backdrop-dismiss>
    <div ref="modalElementRef" class="modal-wrapper" :style="modalStyle">
      <q-card :class="['view-mode-settings-dialog-card', { minimized: isMinimized }]">
        <!-- 상단 타이틀 (드래그 핸들) -->
        <div class="view-mode-settings-header" @mousedown="handleDragStart">
          <div class="view-mode-settings-title">
            <span class="view-mode-settings-title-en">VIEW MODE SETTINGS</span>
            <div class="view-mode-settings-title-row">
              <span class="view-mode-settings-title-ko">뷰 모드 설정</span>
              <span class="view-mode-badge">{{ currentViewModeLabel }}</span>
            </div>
          </div>
          <div class="view-mode-settings-header-actions">
            <q-btn flat dense :icon="isMinimized ? 'expand_more' : 'remove'" @click.stop="toggleMinimize" class="view-mode-settings-minimize-btn" />
            <q-btn flat dense icon="close" @click.stop="() => closeModal()" class="view-mode-settings-close-btn" />
          </div>
        </div>

        <!-- 중간 컨텐츠 (최소화 시 숨김) -->
        <div v-if="!isMinimized" class="view-mode-settings-content-card">
          <!-- 구조적 래퍼 (시각적 스타일 없음, 폭 통일) -->
          <div class="view-mode-settings-content-wrapper">
            <!-- 탭 (스크롤 없음) -->
            <div class="view-mode-settings-tabs-section">
              <q-tabs v-model="activeTab" dense class="view-mode-settings-tabs" active-color="primary">
                <q-tab v-for="viewMode in viewModes" :key="viewMode.value" :name="viewMode.value" :label="viewMode.label" :icon="viewMode.icon" />
              </q-tabs>
            </div>

            <!-- 컨텐츠 (스크롤 가능) -->
            <div class="view-mode-settings-content-section">
              <q-tab-panels v-model="activeTab" animated class="view-mode-settings-tab-panels">
                <!-- 테이블 뷰 설정 -->
                <q-tab-panel name="table" class="view-mode-settings-tab-panel">
                  <TableViewSettings :settings="viewSettings.table" :available-columns="availableColumns" @update:settings="handleSettingsUpdate('table', $event)" @apply-to-all-views="handleApplySidebarNavToAllViews" />
                </q-tab-panel>

                <!-- 카드 뷰 설정 -->
                <q-tab-panel name="card" class="view-mode-settings-tab-panel">
                  <CardViewSettings :settings="viewSettings.card" :available-fields="availableFields" @update:settings="handleSettingsUpdate('card', $event)" @apply-to-all-views="handleApplySidebarNavToAllViews" />
                </q-tab-panel>

                <!-- 리스트 뷰 설정 -->
                <q-tab-panel name="list" class="view-mode-settings-tab-panel">
                  <ListViewSettings :settings="viewSettings.list" :available-fields="availableFields" @update:settings="handleSettingsUpdate('list', $event)" @apply-to-all-views="handleApplySidebarNavToAllViews" />
                </q-tab-panel>

                <!-- 갤러리 뷰 설정 -->
                <q-tab-panel name="gallery" class="view-mode-settings-tab-panel">
                  <GalleryViewSettings :settings="viewSettings.gallery" :available-fields="availableFields" @update:settings="handleSettingsUpdate('gallery', $event)" @apply-to-all-views="handleApplySidebarNavToAllViews" />
                </q-tab-panel>

                <!-- 타임라인 뷰 설정 -->
                <q-tab-panel name="timeline" class="view-mode-settings-tab-panel">
                  <TimelineViewSettings :settings="viewSettings.timeline" :available-fields="availableFields" @update:settings="handleSettingsUpdate('timeline', $event)" @apply-to-all-views="handleApplySidebarNavToAllViews" />
                </q-tab-panel>

                <!-- 차트 뷰 설정 -->
                <q-tab-panel name="chart" class="view-mode-settings-tab-panel">
                  <ChartViewSettings :settings="viewSettings.chart" :available-fields="availableFields" @update:settings="handleSettingsUpdate('chart', $event)" @apply-to-all-views="handleApplySidebarNavToAllViews" />
                </q-tab-panel>
              </q-tab-panels>
            </div>
          </div>
        </div>

        <!-- 하단 버튼 (최소화 시 숨김) -->
        <div v-if="!isMinimized" class="view-mode-settings-footer">
          <q-btn flat label="초기화" @click="handleReset" class="footer-action-btn" />
          <q-space />
          <q-btn flat label="취소" @click="() => closeModal()" class="footer-action-btn" />
          <q-btn color="primary" label="저장" @click="handleSave" class="footer-action-btn" />
        </div>
        <!-- 리사이즈 핸들 (오른쪽 아래) - q-card 기준 absolute 포지셔닝 (시각적 경계와 일치) -->
        <div v-if="!isMinimized && !isMaximized" class="resize-handle" @mousedown.stop="(e) => handleResizeStart(e, 'se')"></div>
      </q-card>
    </div>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import TableViewSettings from '../../view-settings/TableViewSettings.vue'
import CardViewSettings from '../../view-settings/CardViewSettings.vue'
import ListViewSettings from '../../view-settings/ListViewSettings.vue'
import GalleryViewSettings from '../../view-settings/GalleryViewSettings.vue'
import TimelineViewSettings from '../../view-settings/TimelineViewSettings.vue'
import ChartViewSettings from '../../view-settings/ChartViewSettings.vue'
import { VIEW_MODES, VIEW_MODE_OPTIONS, defaultViewModeSettings, loadViewModeSettings, saveViewModeSettings, resetViewModeSettings, getViewModeLabel } from '../../config/viewModeSettings'
import { useDraggableResizableModal } from '@system/composables/useDraggableResizableModal.js'
import { useModalSystemStore } from '@system/store/modalSystemStore.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  currentViewMode: {
    type: String,
    default: VIEW_MODES.TABLE,
  },
  availableColumns: {
    type: Array,
    default: () => [],
  },
  availableFields: {
    type: Array,
    default: () => [],
  },
  storageKey: {
    type: String,
    default: 'part-classes-view-mode-settings',
  },
})

const emit = defineEmits(['update:modelValue', 'save', 'reset', 'settings-change'])

const $q = useQuasar()
const modalSystemStore = useModalSystemStore()

// 모달 ID (고유 식별자)
const MODAL_ID = 'view-mode-settings-modal'

// 드래그/리사이즈 기능
// modalElementRef는 템플릿에서 ref로 사용됨
const { modalStyle, handleDragStart, handleResizeStart, initializeModal, cleanupModal, modalElementRef, updateMinSize, resetMinSize } = useDraggableResizableModal(MODAL_ID, {
  initialSize: { width: 600, height: 800 },
  initialPosition: {
    x: (window.innerWidth - 600) / 2,
    y: (window.innerHeight - 500) / 2,
  },
  draggable: true,
  resizable: true,
  rememberPosition: true,
  // 최대 크기: 화면 크기의 95%로 설정 (더 넓게 사용 가능)
  // 실제 제한은 useDraggableResizableModal에서 동적으로 화면 크기를 확인하여 적용됨
  minSize: { width: 400, height: 500 },
  maxSize: { width: window.innerWidth * 0.95, height: window.innerHeight * 0.95 },
})

// 모달 상태
const isMinimized = computed(() => {
  const modal = modalSystemStore.getModalState(MODAL_ID)
  return modal?.features?.minimized || false
})

const isMaximized = computed(() => {
  const modal = modalSystemStore.getModalState(MODAL_ID)
  return modal?.features?.maximized || false
})

// 현재 뷰 모드 라벨 (활성 탭 기준)
const currentViewModeLabel = computed(() => getViewModeLabel(activeTab.value))

// 활성 탭 (현재 뷰 모드로 초기화)
const activeTab = ref(props.currentViewMode)

// 활성화된 뷰 모드만 필터링 (향후 특정 뷰 모드 비활성화 가능)
const viewModes = computed(() => VIEW_MODE_OPTIONS.filter((mode) => mode.enabled))

// 뷰 설정 (모든 뷰 모드)
const viewSettings = ref({
  [VIEW_MODES.TABLE]: { ...defaultViewModeSettings[VIEW_MODES.TABLE] },
  [VIEW_MODES.CARD]: { ...defaultViewModeSettings[VIEW_MODES.CARD] },
  [VIEW_MODES.LIST]: { ...defaultViewModeSettings[VIEW_MODES.LIST] },
  [VIEW_MODES.GALLERY]: { ...defaultViewModeSettings[VIEW_MODES.GALLERY] },
  [VIEW_MODES.TIMELINE]: { ...defaultViewModeSettings[VIEW_MODES.TIMELINE] },
  [VIEW_MODES.CHART]: { ...defaultViewModeSettings[VIEW_MODES.CHART] },
})

// 설정 업데이트 핸들러
// - 각 뷰 모드 탭에서 설정이 변경될 때 호출
// - 내부 상태(viewSettings)를 업데이트하고, 부모에 실시간 변경 이벤트를 전달
function handleSettingsUpdate(viewMode, newSettings) {
  viewSettings.value[viewMode] = { ...newSettings }

  // 실시간 적용을 위한 이벤트 (부모에서 현재 뷰 모드와 같을 때만 프리뷰로 사용)
  emit('settings-change', {
    viewMode,
    settings: { ...viewSettings.value[viewMode] },
    allSettings: { ...viewSettings.value },
  })
}

// 사이드바 네비게이션 설정을 모든 뷰에 동시 적용
function handleApplySidebarNavToAllViews(sidebarNavSettings) {
  $q.dialog({
    title: '모든 뷰에 동시 적용',
    message: '현재 사이드바 네비게이션 설정을 모든 뷰 모드에 동시에 적용하시겠습니까?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    // 모든 뷰 모드에 사이드바 네비게이션 설정 적용
    Object.keys(VIEW_MODES).forEach((key) => {
      const viewMode = VIEW_MODES[key]
      if (viewSettings.value[viewMode]) {
        viewSettings.value[viewMode] = {
          ...viewSettings.value[viewMode],
          sidebarNavigation: { ...sidebarNavSettings },
        }
        // 각 뷰 모드의 설정 업데이트 이벤트 발생
        handleSettingsUpdate(viewMode, viewSettings.value[viewMode])
      }
    })

    $q.notify({
      type: 'positive',
      message: '모든 뷰 모드에 사이드바 네비게이션 설정이 적용되었습니다.',
      position: 'top',
      timeout: 2000,
    })
  })
}

// 모달 최소화/복원 토글
function toggleMinimize() {
  if (isMinimized.value) {
    modalSystemStore.restoreModal(MODAL_ID)
  } else {
    modalSystemStore.minimizeModal(MODAL_ID)
  }
}

// 모달 닫기 (자동 저장 포함)
function closeModal(skipAutoSave = false) {
  // 이벤트 객체가 전달된 경우 무시 (클릭 이벤트에서 자동으로 전달됨)
  if (skipAutoSave && typeof skipAutoSave === 'object' && skipAutoSave instanceof Event) {
    skipAutoSave = false
  }

  // 모달이 닫힐 때 자동으로 설정 저장 (저장 버튼 클릭 시에는 제외)
  if (!skipAutoSave) {
    saveAllSettings()
  }
  cleanupModal()
  emit('update:modelValue', false)
}

// 다이얼로그 업데이트 핸들러
function handleDialogUpdate(value) {
  if (value) {
    // 모달 열림
    initializeModal()
    modalSystemStore.addToStack(MODAL_ID)
    modalSystemStore.bringToFront(MODAL_ID)
  } else {
    // 모달 닫힘 시 자동 저장
    saveAllSettings()
    cleanupModal()
  }
  emit('update:modelValue', value)
}

// 모든 설정 저장 (공통 함수)
function saveAllSettings() {
  // 모든 뷰 모드 설정 저장
  Object.keys(viewSettings.value).forEach((viewMode) => {
    const settings = { ...viewSettings.value[viewMode] }
    
    // chartTypes가 배열인지 확인하고 배열로 보장
    if (settings.chartTypes && !Array.isArray(settings.chartTypes)) {
      // 객체로 변환된 경우 배열로 복원
      settings.chartTypes = Object.values(settings.chartTypes)
    }
    if (!Array.isArray(settings.chartTypes)) {
      settings.chartTypes = settings.chartTypes ? [settings.chartTypes] : []
    }

    saveViewModeSettings(props.storageKey, viewMode, settings)
  })
  emit('save', { ...viewSettings.value })
}

// 저장 버튼 클릭 핸들러
function handleSave() {
  saveAllSettings()
  $q.notify({
    type: 'positive',
    message: '뷰 모드 설정이 저장되었습니다.',
    position: 'top',
    timeout: 1500,
  })
  // 저장 버튼 클릭 시에는 closeModal에서 중복 저장하지 않도록 skipAutoSave 플래그 전달
  closeModal(true)
}

// 초기화
function handleReset() {
  $q.dialog({
    title: '설정 초기화',
    message: '현재 탭의 뷰 모드 설정을 기본값으로 되돌리시겠습니까?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    const currentViewMode = activeTab.value
    viewSettings.value[currentViewMode] = {
      ...defaultViewModeSettings[currentViewMode],
    }
    resetViewModeSettings(props.storageKey, currentViewMode)
    $q.notify({
      type: 'info',
      message: `${getViewModeLabel(currentViewMode)} 설정이 초기화되었습니다.`,
      position: 'top',
      timeout: 1500,
    })
  })
}

// 콘텐츠 높이 측정 및 최소 높이 업데이트
function updateMinHeightFromContent() {
  if (!modalElementRef.value) return

  nextTick(() => {
    const qCard = modalElementRef.value.querySelector('.view-mode-settings-dialog-card')
    if (!qCard) return

    // 현재 모달 크기 저장
    const modal = modalSystemStore.getModalState(MODAL_ID)
    const currentHeight = modal?.size?.height || 500

    // 모달을 일시적으로 작게 만들어서 콘텐츠의 실제 최소 높이 측정
    const tempHeight = 400
    const originalHeight = qCard.style.height
    const originalMaxHeight = qCard.style.maxHeight

    // 일시적으로 높이 제한 해제하고 작은 높이 설정
    qCard.style.maxHeight = 'none'
    qCard.style.height = `${tempHeight}px`

    // scrollHeight로 콘텐츠의 전체 높이 측정
    const contentHeight = qCard.scrollHeight

    // 원래 스타일 복원
    qCard.style.height = originalHeight
    qCard.style.maxHeight = originalMaxHeight

    // 최소 높이 계산 (10px 여유 공간)
    const minHeight = Math.ceil(contentHeight + 10)

    // 최소 높이 업데이트 (forceUpdate=true: 현재 크기 강제 조정 안 함)
    updateMinSize({ height: minHeight }, true)

    // 모달이 열릴 때만 최소 높이보다 작으면 조정
    if (currentHeight < minHeight) {
      modalSystemStore.updateSize(MODAL_ID, { height: minHeight })
    }
  })
}

// 모달이 열릴 때 설정 로드
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      // 모든 뷰 모드 설정 로드
      Object.keys(VIEW_MODES).forEach((key) => {
        const viewMode = VIEW_MODES[key]
        const loaded = loadViewModeSettings(props.storageKey, viewMode)
        viewSettings.value[viewMode] = { ...loaded }
      })
      // 현재 뷰 모드 탭으로 설정
      activeTab.value = props.currentViewMode

      // 모달 등록 및 스택에 추가
      initializeModal()
      modalSystemStore.addToStack(MODAL_ID)
      modalSystemStore.bringToFront(MODAL_ID)

      // 동적 최소 크기를 초기값으로 리셋 (이전에 설정된 큰 값 제거)
      resetMinSize()

      // 모달이 완전히 렌더링된 후 콘텐츠 높이 측정
      // 약간의 지연을 두어 DOM이 완전히 렌더링될 때까지 대기
      setTimeout(() => {
        updateMinHeightFromContent()
      }, 150)
    } else {
      // 모달 닫힘 시 해제
      cleanupModal()
    }
  },
  { immediate: true },
)

// 탭 변경 시 콘텐츠 높이 재측정 (탭 전환 애니메이션 완료 후)
watch(activeTab, () => {
  if (props.modelValue) {
    setTimeout(() => {
      updateMinHeightFromContent()
    }, 300) // Quasar 탭 애니메이션 시간 고려
  }
})

// 컴포넌트 언마운트 시 정리
onUnmounted(() => {
  cleanupModal()
})
</script>

<style lang="scss" scoped>
// // // q-dialog가 modal-wrapper의 크기를 제한하지 않도록 설정
// :deep(.q-dialog) {
//   max-width: none !important;
//   min-width: auto !important;
//   border: 2px solid var(--nexa-primary-color) !important;
//   border-radius: 4px;
// }

//⚠️ 모달 래퍼: modalStyle에서 position, width, height가 인라인으로 설정됨
.modal-wrapper {
  overflow: visible; // 리사이즈 핸들이 보이도록
  max-width: none !important; // q-dialog 크기 제한 제거
  min-width: auto !important;
}

// 뷰 모드 설정 모달 카드 (리사이징 핸들 유격 문제 해결을 위한 position: relative)
.view-mode-settings-dialog-card {
  border: 1px solid var(--nexa-ui-primary) !important; // CSS 변수 이름 수정 (--nexa-primary-color → --nexa-primary)
  // ⚠️ 리사이즈 핸들 유격 문제 해결을 위한 position: relative
  position: relative; // 리사이즈 핸들 포지셔닝 기준점
  margin: 0;
  display: flex; // 컨텐츠 레이아웃 정렬을 위해 필수
  flex-direction: column; // 컨텐츠 레이아웃 정렬을 위해 필수
  width: 100%; // 컨텐츠 레이아웃 정렬을 위해 필수
  height: 100%; // 컨텐츠 레이아웃 정렬을 위해 필수
  box-sizing: border-box; // 패딩/보더가 내부에 포함되도록
  background-color: var(--nexa-modal-bg);
  min-width: auto; // 전역 min-width: 460px 오버라이드
  max-width: none !important; // 좌우 리사이징을 위해 필수
  color: var(--nexa-text-primary); // 텍스트 색상
  overflow: hidden; // 스크롤 작동을 위해 필수

  // 최소화 상태일 때 패딩 제거 및 라운드 코너 적용 (헤더만 보이도록)
  &.minimized {
    padding: 0 !important;
    overflow: hidden !important; // 라운드 코너가 제대로 보이도록
  }
}

.view-mode-settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: move; // 드래그 핸들
  user-select: none;
  transition: background-color 0.2s ease;
  border: 1px solid var(--nexa-border-color) !important;
  border-radius: 4px 4px 0 0; // 상단 모서리만 둥글게
  min-width: 0; // flex 축소 허용
  overflow: hidden; // 오버플로우 방지

  // 최소화 상태일 때 margin 제거 및 모든 모서리 둥글게
  .view-mode-settings-dialog-card.minimized & {
    margin-bottom: 0 !important;
    border-radius: 4px; // 최소화 시 모든 모서리 둥글게
    padding-right: 8px; // 오른쪽 패딩 줄여서 버튼 공간 확보
  }

  &:hover {
    background-color: var(--nexa-modal-header-hover-bg);
  }

  &:active {
    cursor: grabbing;
    background-color: var(--nexa-modal-header-hover-bg);
  }
}

.view-mode-settings-header-actions {
  display: flex;
  align-items: center;
  gap: 1px;
  flex-shrink: 0; // 기본적으로 축소 방지
  // 최소화 상태일 때 버튼 영역 보호
  .view-mode-settings-dialog-card.minimized & {
    min-width: 120px !important; // 최소화 버튼 + 닫기 버튼 너비 보장 (더 여유 있게)
    flex-shrink: 0 !important; // 축소 방지
    flex-grow: 0 !important; // 확장 방지
    position: relative; // 위치 고정
    z-index: 10; // 다른 요소 위에 표시
  }
}

.view-mode-settings-title {
  display: flex;
  flex-direction: column;
  min-width: 0; // flex 축소 허용
  flex: 1; // 남은 공간 사용
  overflow: hidden; // 텍스트 오버플로우 방지
  // 최소화 상태일 때 타이틀 영역 제한
  .view-mode-settings-dialog-card.minimized & {
    max-width: calc(100% - 120px) !important; // 버튼 영역(100px) + 여유(20px) 확보
    flex-shrink: 1; // 축소 허용
  }
}

.view-mode-settings-title-en {
  letter-spacing: 1.5px;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  opacity: 0.6;
}

.view-mode-settings-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.view-mode-settings-title-ko {
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap; // 줄바꿈 방지
  overflow: hidden; // 오버플로우 숨김
  text-overflow: ellipsis; // 말줄임표 표시
  min-width: 0; // flex 축소 허용
}

.view-mode-badge {
  padding: 2px 8px;
  background-color: var(--nexa-ui-primary);
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.view-mode-settings-content-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; // 스크롤 작동을 위해 필수
  overflow: hidden;
}

.view-mode-settings-content-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.view-mode-settings-tabs-section {
  padding: 12px;
  margin-bottom: 2px;
  background-color: var(--nexa-modal-surface);
  border-radius: 4px;
  overflow: hidden;

  :deep(.q-tab) {
    background-color: transparent;
    border-radius: 4px;
    transition: background-color 0.2s ease;
    overflow: hidden;

    &:hover {
      border: 1px solid var(--nexa-ui-primary);
    }
  }
}

.view-mode-settings-content-section {
  flex: 1;
  overflow-y: auto;
  //min-height: 0;
}

.view-mode-settings-tab-panels {
  background-color: transparent;
  :deep(.q-tab-panel) {
    padding: 0; // 아코디언 아이템의 패딩과 통일
  }
}

// 아코디언 아이템 스타일
.view-mode-settings-tab-panel {
  :deep(.q-expansion-item) {
    margin-bottom: 2px;
    border: none;
    border-radius: 4px;
    overflow: hidden;
    transition: background-color 0.3s ease;
    background-color: var(--nexa-modal-surface);

    .q-item {
      padding: 6px 22px;
      min-height: 36px;
      background-color: var(--nexa-modal-surface);
      transition: background-color 0.2s ease;
    }

    // 아코디언 컨텐츠 내부의 카드 섹션 패딩 제거
    .q-expansion-item__content {
      .q-card {
        .q-card__section {
          color: var(--nexa-text-secondary);

          padding: 0; //지정하지 않으면 자동으로 패딩이 적용되어 너무 큼
        }
      }
    }
  }

  // 펼쳐진 아코디언 아이템 헤더 스타일
  // 직접 자식만 선택하여 중첩된 아코디언의 .q-item은 제외
  :deep(.q-expansion-item.q-expansion-item--expanded > .q-expansion-item__container > .q-item) {
    background-color: var(--nexa-modal-accordion-expanded-bg) !important;
  }

  :deep(.q-card) {
    background-color: var(--nexa-modal-surface);
  }

  :deep(.q-field__control::after),
  :deep(.q-field__control::before) {
    border-color: var(--nexa-border-color) !important;
  }
}

.view-mode-settings-footer {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid var(--nexa-border-color);
  gap: 16px;

  .footer-action-btn {
    min-height: 48px;
    padding: 12px 32px;
    font-weight: 500;
    border-radius: 8px;
    border: 1px solid var(--nexa-border-color);
    margin-left: 4px;

    :deep(.q-btn__content) {
      font-size: 16px;
      line-height: 1.5;
      letter-spacing: 0.3em;
    }
  }
}

// 리사이즈 핸들: q-card 기준 absolute 포지셔닝 (시각적 경계와 일치)
//
// ⚠️ 문제 원인:
// - 이전: resize-handle이 modal-wrapper 기준으로 포지셔닝 (bottom: 0, right: 0)
// - modal-wrapper의 크기는 인라인 스타일로 설정되며, 리사이즈 시 이 값만 변경됨
// - 실제 시각적 모달 경계는 q-card의 padding(54px) 내부에 위치
// - 결과: 리사이즈 시 modal-wrapper 크기는 변하지만, 시각적 경계와 불일치하여 패딩 값만큼 유격 발생
//
// ✅ 해결 방법:
// - resize-handle을 q-card 내부로 이동 (템플릿 구조 변경)
// - q-card에 position: relative 추가하여 포지셔닝 기준점 설정
// - resize-handle을 q-card 기준으로 포지셔닝 (시각적 경계와 일치)
// - 이제 초기 로딩 시와 리사이즈 후 모두 정확한 위치 유지
//
// ⚠️ 주의: MainLayout.vue에 전역 .resize-handle 스타일이 있음 (left: -1px; top: 0; bottom: 0;)
// 모달의 리사이즈 핸들은 오른쪽 아래에 위치해야 하므로 left: auto, top: auto로 명시적으로 오버라이드 필요
.view-mode-settings-dialog-card .resize-handle {
  position: absolute !important;
  left: auto !important; // ⚠️ MainLayout 전역 스타일 오버라이드 필수 (제거 시 왼쪽 위로 이동)
  top: auto !important; // ⚠️ MainLayout 전역 스타일 오버라이드 필수 (제거 시 왼쪽 위로 이동)
  bottom: 0 !important;
  right: 0 !important;
  width: 24px !important;
  height: 24px !important;
  cursor: nwse-resize !important;
  background-color: var(--nexa-resize-handle-bg) !important;
  clip-path: polygon(0 100%, 100% 100%, 100% 0) !important; // 직각 삼각형
  z-index: 1002 !important;
  pointer-events: auto !important;
  display: block !important;
  border: none !important;
  transition: background-color 0.2s ease !important;
  background-image: repeating-linear-gradient(45deg, transparent, transparent 2px, var(--nexa-resize-handle-pattern) 2px, var(--nexa-resize-handle-pattern) 4px) !important;

  &:hover {
    background-color: var(--nexa-resize-handle-bg-hover) !important;
    background-image: repeating-linear-gradient(45deg, transparent, transparent 2px, var(--nexa-resize-handle-pattern-hover) 2px, var(--nexa-resize-handle-pattern-hover) 4px) !important;
  }
}
</style>
