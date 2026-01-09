<!-- TemporaryBinStorage.vue
  임시 보관소 컴포넌트
  빈을 임시로 보관하고 드래그 앤 드롭으로 이동 가능
-->

<template>
  <div
    ref="containerRef"
    class="temporary-bin-storage"
    :class="{ 'is-dragging': isDragging }"
    :style="containerStyle"
    @mousedown="handleMouseDown"
  >
    <!-- 드래그 핸들 -->
    <div class="storage-handle">
      <q-icon name="drag_indicator" size="20px" />
      <span class="storage-title">TEMPORARY STORAGE</span>
    </div>

    <!-- 빈 목록 -->
    <div
      class="bins-container"
      :class="{ 'drag-over': isDragOver }"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <div v-if="!temporaryBins || temporaryBins.length === 0" class="empty-message">
        <q-icon name="inventory_2" size="32px" color="grey-6" />
        <div class="text-caption text-grey-6 q-mt-sm">No bins in temporary storage</div>
        <div v-if="isDragOver" class="text-caption text-primary q-mt-sm">여기에 드롭하세요</div>
      </div>

      <div
        v-for="bin in temporaryBins"
        :key="bin.id"
        class="bin-card"
        draggable="true"
        @dragstart="handleDragStart($event, bin)"
        @dragend="handleDragEnd"
      >
        <div class="bin-card-content">
          <div class="bin-label">{{ getBinLabel(bin) }}</div>
          <div class="bin-position text-caption text-grey-6">
            {{ getOriginalPosition(bin) }}
          </div>
        </div>
        <div class="bin-actions">
          <q-btn
            flat
            dense
            round
            size="sm"
            icon="restore"
            class="action-btn restore-btn"
            @click="handleRestore(bin)"
          >
            <q-tooltip>원래 위치로 복원</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            round
            size="sm"
            icon="delete"
            class="action-btn delete-btn"
            @click="handleDelete(bin)"
          >
            <q-tooltip>완전 삭제</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>
  </div>

  <!-- 삭제 확인 모달 -->
  <q-dialog v-model="showDeleteConfirm" persistent>
    <q-card style="min-width: 500px; max-width: 600px" class="delete-confirm-card">
      <q-card-section class="delete-confirm-header">
        <div class="delete-confirm-title">CONFIRM DELETE</div>
      </q-card-section>

      <q-card-section class="delete-confirm-content">
        <div class="delete-confirm-message">
          <q-icon name="warning" size="30px" color="warning" class="q-mr-sm" />
          정말로 <strong>{{ deleteTargetBinLabel }}</strong> 부품함을 임시 보관소에서 완전히
          삭제하시겠습니까?
        </div>
        <div class="delete-confirm-warning text-caption">이 작업은 되돌릴 수 없습니다.</div>
      </q-card-section>

      <q-card-actions align="center" class="delete-confirm-actions">
        <q-btn flat label="취소" @click="showDeleteConfirm = false" class="delete-confirm-btn" />
        <q-btn
          flat
          label="삭제"
          color="negative"
          @click="confirmDelete"
          class="delete-confirm-btn"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { usePartsManagementStore } from '@system/store/partsManagementStore.js'
import { useQuasar } from 'quasar'

const emit = defineEmits(['position-changed'])

const partsStore = usePartsManagementStore()
const $q = useQuasar()

const temporaryBins = computed(() => {
  return partsStore.temporaryBins || []
})

// 드래그 상태
const isDragging = ref(false)
const dragStartPos = ref({ x: 0, y: 0 })
const isDraggingBin = ref(false)
const isDragOver = ref(false) // 임시 보관소에 드래그 오버 상태

// 삭제 확인 모달 관련 상태
const showDeleteConfirm = ref(false)
const deleteTargetBin = ref(null)
const deleteTargetBinLabel = computed(() => {
  return deleteTargetBin.value ? getBinLabel(deleteTargetBin.value) : ''
})

// 위치 상태 (기본값: 사이드바 하단)
const position = ref({ x: null, y: null })
const containerRef = ref(null)
const savedHeight = ref(null) // fixed로 전환 전 높이 저장
const savedWidth = ref(null) // fixed로 전환 전 너비 저장

const isFixed = computed(() => {
  return position.value.x !== null && position.value.y !== null
})

const containerStyle = computed(() => {
  if (isFixed.value) {
    const style = {
      position: 'fixed',
      left: `${position.value.x}px`,
      top: `${position.value.y}px`,
      zIndex: 2001, // 풋터(2000)보다 높게 설정
    }
    // 저장된 크기를 사용하여 크기 유지 (약간의 차이만 허용)
    if (savedWidth.value) {
      style.width = `${savedWidth.value}px`
    } else {
      style.width = '280px' // 기본값
    }
    if (savedHeight.value) {
      style.height = `${savedHeight.value}px`
    }
    return style
  }
  return {
    position: 'relative',
    width: '100%', // relative일 때는 부모 너비 사용
  }
})

// 위치 변경 감지하여 이벤트 emit
watch(
  isFixed,
  (newValue) => {
    emit('position-changed', newValue)
  },
  { immediate: true },
)

function getBinLabel(bin) {
  // 임시: 빈 ID 또는 SKU 표시
  return bin.binData?.sku || `BIN-${bin.id}`
}

function getOriginalPosition(bin) {
  if (!bin.originalPosition) return 'Unknown'
  const { cellIndex } = bin.originalPosition
  return `${cellIndex || 'N/A'}`
}

function handleMouseDown(event) {
  // 드래그 핸들 영역에서만 드래그 시작
  if (event.target.closest('.storage-handle')) {
    event.preventDefault() // 기본 동작 방지
    event.stopPropagation() // 이벤트 전파 방지

    // 현재 위치 가져오기
    let currentX = position.value.x
    let currentY = position.value.y
    const mouseX = event.clientX
    const mouseY = event.clientY

    // position이 null이면 현재 요소의 실제 위치를 가져옴
    if (currentX === null || currentY === null) {
      if (containerRef.value) {
        const rect = containerRef.value.getBoundingClientRect()
        // 현재 relative 위치에서의 화면상 위치를 그대로 사용
        currentX = rect.left
        currentY = rect.top
      } else {
        // 요소가 없으면 기본값 사용
        currentX = 0
        currentY = 0
      }
    }

    // 드래그 시작 위치 저장 (아직 fixed로 전환하지 않음)
    isDragging.value = true
    dragStartPos.value = {
      x: mouseX - currentX,
      y: mouseY - currentY,
    }

    // mousemove 이벤트에서 실제로 fixed로 전환
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }
}

function handleMouseMove(event) {
  if (!isDragging.value) return

  // 처음 움직일 때만 fixed로 전환하고 위치 설정
  if (position.value.x === null || position.value.y === null) {
    if (containerRef.value) {
      const rect = containerRef.value.getBoundingClientRect()
      // 현재 크기를 정확히 저장 (크기 유지를 위해)
      savedWidth.value = rect.width
      savedHeight.value = rect.height
      // 현재 위치를 그대로 사용하여 fixed로 전환
      position.value = {
        x: rect.left,
        y: rect.top,
      }
      // 드래그 시작 위치 재계산
      dragStartPos.value = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }
      return // 첫 번째 이동에서는 위치만 설정하고 종료
    }
  }

  const newX = event.clientX - dragStartPos.value.x
  const newY = event.clientY - dragStartPos.value.y

  // 화면 경계 체크 (헤더 50px, 풋터 48px 고려)
  const headerHeight = 50
  const footerHeight = 48
  const storageWidth = 280
  const storageHeight = containerRef.value ? containerRef.value.offsetHeight : 200

  const maxX = window.innerWidth - storageWidth
  const maxY = window.innerHeight - storageHeight - footerHeight

  position.value = {
    x: Math.max(0, Math.min(newX, maxX)),
    y: Math.max(headerHeight, Math.min(newY, maxY)),
  }
}

function handleMouseUp() {
  isDragging.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

function handleDragStart(event, bin) {
  isDraggingBin.value = true
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData(
    'application/json',
    JSON.stringify({
      type: 'temporary-bin',
      id: bin.id,
      binData: bin.binData,
      originalPosition: bin.originalPosition,
    }),
  )
}

function handleDragEnd() {
  isDraggingBin.value = false
}

function handleRestore(bin) {
  // 원래 위치로 복원
  const success = partsStore.restoreBinFromTemporary(bin.id)
  if (!success) {
    console.error('Failed to restore bin:', bin.id)
    $q.notify({
      type: 'negative',
      message: '빈 복원에 실패했습니다',
      position: 'top',
    })
  } else {
    $q.notify({
      type: 'positive',
      message: '빈이 원래 위치로 복원되었습니다',
      position: 'top',
    })
  }
}

function handleDelete(bin) {
  // 삭제 확인 모달 표시
  deleteTargetBin.value = bin
  showDeleteConfirm.value = true
}

function confirmDelete() {
  if (!deleteTargetBin.value) return

  const success = partsStore.deleteBinFromTemporary(deleteTargetBin.value.id)
  if (success) {
    $q.notify({
      type: 'positive',
      message: '빈이 완전히 삭제되었습니다',
      position: 'top',
    })
  } else {
    $q.notify({
      type: 'negative',
      message: '빈 삭제에 실패했습니다',
      position: 'top',
    })
  }

  showDeleteConfirm.value = false
  deleteTargetBin.value = null
}

// 임시 보관소에 드래그 오버
function handleDragOver(event) {
  isDragOver.value = true
  event.dataTransfer.dropEffect = 'move'
}

// 임시 보관소에서 드래그 리브
function handleDragLeave() {
  isDragOver.value = false
}

// 임시 보관소에 드롭
function handleDrop(event) {
  isDragOver.value = false

  try {
    const dragDataStr = event.dataTransfer.getData('application/json')
    if (!dragDataStr) {
      return
    }

    const dragData = JSON.parse(dragDataStr)

    // 셀에서 드롭한 경우
    if (dragData.type === 'cell') {
      // 셀에서 빈을 임시 보관소로 이동
      partsStore.addToTemporaryBins({
        binData: dragData.binData,
        originalPosition: {
          blockId: dragData.blockId,
          rowId: dragData.rowId,
          cellIndex: dragData.cellIndex || `${dragData.rowIndex + 1}-${dragData.colIndex + 1}`,
        },
      })
      // 셀에서 빈 제거
      partsStore.setCellData(dragData.blockId, dragData.rowId, dragData.colIndex, null)
    }
    // shelf-bin에서 드롭한 경우
    else if (dragData.type === 'shelf-bin') {
      // shelf-bin에서 빈을 임시 보관소로 이동
      const row = partsStore.getNodeById(dragData.rowId)
      const floorLabel = row?.row_identifier ? `${row.row_identifier}층` : row?.name || 'Unknown'
      const cellIndex = `${floorLabel}-${dragData.cellIndex + 1}`

      partsStore.addToTemporaryBins({
        binData: dragData.binData,
        originalPosition: {
          blockId: dragData.blockId,
          rowId: dragData.rowId,
          cellIndex: cellIndex,
        },
      })
      // shelf-bin에서 빈 제거
      partsStore.setCellData(dragData.blockId, dragData.rowId, dragData.cellIndex, null)
    }
  } catch (error) {
    console.error('Drop to temporary storage error:', error)
  }
}

onMounted(() => {
  // 초기에는 relative 위치로 유지 (사이드바 내부에 위치)
  // 드래그를 시작할 때만 fixed로 전환
  // 위치는 드래그 시작 시점에 설정됨
})

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})
</script>

<style lang="scss" scoped>
.temporary-bin-storage {
  width: 280px;
  min-height: 120px;
  max-height: 400px;
  background: var(--nexa-surface, rgba(30, 30, 30, 0.95));
  border: 1px solid var(--nexa-border-color, rgba(255, 255, 255, 0.2));
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);

  &.is-dragging {
    cursor: grabbing;
    opacity: 0.9;
  }
}

.storage-handle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(12, 216, 135, 0.3);
  border-bottom: 1px solid var(--nexa-border-color, rgba(255, 255, 255, 0.2));
  cursor: grab;
  user-select: none;

  &:active {
    cursor: grabbing;
  }
}

.storage-title {
  font-size: 14px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.488);
  text-transform: uppercase;
  letter-spacing: 1px;
  flex: 1;
}

.bins-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--nexa-surface, rgba(30, 30, 30, 0.95));
  min-height: 80px;

  &.drag-over {
    background: rgba(12, 216, 135, 0.1);
    border: 2px dashed rgba(12, 216, 135, 0.5);
    border-radius: 4px;
  }
}

.empty-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
}

.bin-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: var(--nexa-surface, rgba(255, 255, 255, 0.03));
  border: 1px solid var(--nexa-border-color, rgba(255, 255, 255, 0.15));
  border-radius: 4px;
  cursor: grab;
  transition: all 0.2s;

  &:hover {
    border-color: var(--nexa-primary, #2195f3a9);
    background: rgba(33, 150, 243, 0.1);
    transform: translateX(4px);
  }

  &:active {
    cursor: grabbing;
  }
}

.bin-card-content {
  flex: 1;
  min-width: 0;
}

.bin-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--nexa-text-primary, rgba(255, 255, 255, 0.9));
  margin-bottom: 4px;
}

.bin-position {
  font-size: 11px;
}

.bin-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.action-btn {
  opacity: 0.6;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
}

.restore-btn {
  color: var(--nexa-primary, #2196f3);
}

.delete-btn {
  color: var(--nexa-negative, #f44336);
}

/* 삭제 확인 모달 스타일 */
.delete-confirm-card {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 5px;
  box-shadow: none;
  padding: 32px;
}

.delete-confirm-header {
  padding: 24px 32px;
  text-align: center;
}

.delete-confirm-title {
  font-size: 2.1rem;
  font-weight: 700;
  color: rgba(212, 184, 0, 0.928);
}

.delete-confirm-content {
  padding: 32px;
  text-align: center;
}

.delete-confirm-message {
  font-size: 1.1rem;
  color: rgba(2, 168, 168, 0.7);
  margin-bottom: 16px;
  line-height: 1.6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;

  strong {
    color: rgba(11, 241, 3, 0.9);
    font-weight: 600;
  }
}

.delete-confirm-warning {
  color: rgba(244, 67, 54, 0.7);
  margin-top: 12px;
  text-align: center;
}

.delete-confirm-actions {
  padding: 24px 32px;
  gap: 16px;
}

.delete-confirm-btn {
  min-width: 120px;
  min-height: 48px;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  border: 1px solid rgba(0, 0, 0, 0.446);
  padding: 12px 24px;
}
</style>
