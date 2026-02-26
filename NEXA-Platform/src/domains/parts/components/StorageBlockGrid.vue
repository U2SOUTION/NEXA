<!-- StorageBlockGrid.vue
  스토리지 블록의 그리드 뷰 컴포넌트
  RACK, SHELF_UNIT, CABINET 타입에 따라 다른 그리드 표시
-->

<template>
  <div class="storage-block-grid-container">
    <div v-if="!block" class="empty-state">
      <div class="empty-state-content">
        <div class="empty-state-title">LOGISTICS MANAGEMENT SYSTEM</div>
        <div class="empty-state-subtitle">
          Select a storage block or floor from the sidebar to view the grid
        </div>
        <q-icon name="inventory_2" size="80px" class="empty-state-icon q-mb-md q-mt-lg" />
        <div class="empty-state-korean-title text-h6">스토리지 블록 또는 층을 선택하세요</div>
        <div class="empty-state-korean-subtitle text-caption q-mt-sm">
        왼쪽 사이드바에서 스토리지 블록 또는 층을 클릭하여 그리드를 확인하세요
        </div>
      </div>
    </div>

    <div v-else class="grid-content">
      <!-- 네비게이션 경로 -->
      <div class="grid-header q-pa-md">
        <div class="row items-center justify-between">
          <div
            class="navigation-path"
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave"
          >
            <!-- 마우스 오버 시 또는 셀이 선택된 경우 전체 경로 표시 -->
            <template v-if="shouldShowFullPath">
              <span class="nav-item text-primary">{{ getFullPath() }}</span>
            </template>
            <!-- 기본 표시: 개별 항목 -->
            <template v-else>
              <span class="nav-item text-primary nav-item-clickable" @click="handleBlockClick">
                {{ block.name }}
              </span>
              <span v-if="selectedRow" class="nav-separator text-grey-6 q-mx-sm">></span>
              <span
                v-if="selectedRow"
                class="nav-item text-accent nav-item-clickable"
                @click="handleFloorClick"
              >
                {{ getFloorLabel(selectedRow) }}
              </span>
            </template>
          </div>
          <!-- 선반 타입일 때만 스케일 조절 슬라이더 -->
          <div
            v-if="
              block && (block.storage_type === 'SHELF_UNIT' || block.storage_type === 'CABINET')
            "
            class="scale-selector"
          >
            <span class="scale-label">ZOOM</span>
            <q-btn
              icon="remove"
              size="sm"
              dense
              flat
              round
              color="grey-6"
              @click="decreaseScale"
              class="scale-btn"
            />
            <q-slider
              v-model="binScale"
              :min="0.1"
              :max="1.0"
              :step="0.05"
              label
              :label-value="`${Math.round(binScale * 100)}%`"
              color="primary"
              dense
              class="scale-slider"
            />
            <q-btn
              icon="add"
              size="sm"
              dense
              flat
              round
              color="grey-6"
              @click="increaseScale"
              class="scale-btn"
            />
          </div>
        </div>
      </div>

      <q-separator />

      <!-- RACK 타입 그리드 (층 x 칸) -->
      <div
        v-if="block && block.storage_type === 'RACK'"
        class="rack-grid"
        :style="{ '--column-count': columnCount }"
      >
        <template v-if="displayRows.length > 0">
          <div v-for="row in displayRows" :key="row.id" class="rack-row">
            <div class="rack-cells">
              <div
                v-for="colIndex in columnCount"
                :key="colIndex"
                class="rack-cell"
                :class="{
                  'cell-empty': !cellDataMap[`${row.id}-${colIndex - 1}`],
                  'cell-has-bin': !!cellDataMap[`${row.id}-${colIndex - 1}`],
                  'drag-over':
                    dragOverCell?.rowIndex === getRowIndex(row) &&
                    dragOverCell?.colIndex === colIndex - 1,
                }"
                :title="getTooltipText(row, colIndex - 1)"
                :draggable="!!cellDataMap[`${row.id}-${colIndex - 1}`]"
                @click="handleCellClick(getRowIndex(row), colIndex - 1)"
                @dblclick="handleCellDoubleClick(getRowIndex(row), colIndex - 1, row)"
                @dragstart="handleCellDragStart($event, getRowIndex(row), colIndex - 1, row)"
                @dragover.prevent="handleCellDragOver($event, getRowIndex(row), colIndex - 1)"
                @dragleave="handleCellDragLeave"
                @drop="handleCellDrop($event, getRowIndex(row), colIndex - 1, row)"
              >
                <div class="cell-content">
                  <div class="cell-label">{{ getCellLabel(row, colIndex - 1) }}</div>
                  <div v-if="cellDataMap[`${row.id}-${colIndex - 1}`]" class="cell-bin-info">
                    <q-chip dense size="sm" color="primary">
                      {{ cellDataMap[`${row.id}-${colIndex - 1}`]?.sku || 'BIN' }}
                    </q-chip>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
        <div v-else class="text-center q-pa-lg text-grey-6">
          표시할 층이 없습니다. (행 개수: {{ allRows.length }}, 표시 행: {{ displayRows.length }},
          블록 타입: {{ block?.storage_type }})
        </div>
      </div>

      <!-- SHELF_UNIT 또는 CABINET 타입 반복문으로 그리드 만들기 -->
      <div v-else class="shelf-grid">
        <div v-for="row in displayRows" :key="row.id" class="shelf-row">
          <div
            class="shelf-cell"
            :class="{
              'drag-over-cell': dragOverShelfCell?.rowId === row.id,
            }"
            @dblclick="handleShelfCellDoubleClick(row)"
            @dragover.prevent="handleShelfCellDragOver($event, row)"
            @dragleave="handleShelfCellDragLeave"
            @drop="handleShelfCellDrop($event, row)"
          >
            <!-- 선반 라벨 - 반복문의 층을 이용해서 표시 -->
            <div class="shelf-label">{{ getFloorLabel(row) }}</div>

            <!-- 빈들 동적으로 표시 -->
            <div class="shelf-bins" :ref="(el) => setShelfBinsRef(el, row.id)">
              <div
                v-for="bin in getShelfBinsForRow(row)"
                :key="bin.cellIndex"
                class="shelf-bin"
                :class="{
                  'drag-over':
                    dragOverShelfBin?.rowId === row.id &&
                    dragOverShelfBin?.cellIndex === bin.cellIndex,
                }"
                :style="getShelfBinStyle(bin.data)"
                :draggable="!!bin.data"
                @dblclick.stop="handleShelfBinDoubleClick(row, bin.cellIndex)"
                @dragstart="handleShelfBinDragStart($event, row, bin.cellIndex)"
                @dragover.prevent="handleShelfBinDragOver($event, row, bin.cellIndex)"
                @dragleave="handleShelfBinDragLeave"
                @drop="handleShelfBinDrop($event, row, bin.cellIndex)"
              >
                {{ formatShelfBinSkuWithEllipsis(bin.data?.sku, bin.cellIndex) }}
              </div>
              <!-- 빈 공간 더블클릭 영역 -->
              <div
                v-if="getShelfBinsForRow(row).length > 0"
                class="shelf-bin-empty-space"
                :style="getEmptySpaceStyle(row)"
                @dblclick.stop="handleShelfCellDoubleClick(row)"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 빈 상세 모달 -->
    <BinDetailModal v-model="showBinDetailModal" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { usePartsManagementStore } from '@system/store/partsManagementStore.js'
import { useUserSettingsStore } from '@system/store/userSettingsStore'
import BinDetailModal from './BinDetailModal.vue'

const partsStore = usePartsManagementStore()
const userSettingsStore = useUserSettingsStore()

// 빈 상세 모달 표시 여부
const showBinDetailModal = ref(false)

// 빈 스케일 값 (0.1 ~ 1.0)
const binScale = computed({
  get: () => {
    return userSettingsStore.settings.partsManagement?.binScale || 0.5
  },
  set: (value) => {
    userSettingsStore.setBinScale(value)
  },
})

// 스케일 증가/감소 함수
function increaseScale() {
  const newScale = Math.min(1.0, binScale.value + 0.05)
  binScale.value = newScale
}

function decreaseScale() {
  const newScale = Math.max(0.1, binScale.value - 0.05)
  binScale.value = newScale
}

// shelf-bins 요소 참조 저장 (더 이상 필요 없지만 다른 곳에서 사용할 수 있으므로 유지)
const shelfBinsRefs = ref(new Map()) // key: rowId, value: HTMLElement

function setShelfBinsRef(el, rowId) {
  if (el) {
    shelfBinsRefs.value.set(rowId, el)
  }
}

// 드래그 상태
const draggedCell = ref(null) // { blockId, rowId, rowIndex, colIndex }
const dragOverCell = ref(null) // { rowIndex, colIndex }
const draggedShelfBin = ref(null) // { blockId, rowId, cellIndex, binData }
const dragOverShelfBin = ref(null) // { rowId, cellIndex }
const dragOverShelfCell = ref(null) // { rowId }

// 네비게이션 경로 마우스 오버 상태
const isHoveringPath = ref(false)

// 전체 경로 표시 여부
const shouldShowFullPath = computed(() => {
  return isHoveringPath.value || !!selectedCellIndex.value
})

function handleMouseEnter() {
  isHoveringPath.value = true
}

function handleMouseLeave() {
  isHoveringPath.value = false
}

// 선택된 storage_row가 있으면 해당 층의 부모 블록을 찾아서 표시
const selectedRow = computed(() => partsStore.selectedStorageRow)

// 선택된 셀 인덱스
const selectedCellIndex = computed(() => partsStore.selectedCellIndex)

const block = computed(() => {
  // storage_row가 선택된 경우, 해당 row의 부모 블록을 찾음
  if (selectedRow.value) {
    return partsStore.getNodeById(selectedRow.value.parentId)
  }
  // storage_block이 직접 선택된 경우
  return partsStore.selectedStorageBlock
})

const allRows = computed(() => {
  if (!block.value || !block.value.children) return []
  return block.value.children.filter((child) => child.type === 'storage_row')
})

// 표시할 행들: selectedRow가 있으면 해당 행만, 없으면 전체 행
// 층수는 아래부터 위로 올라가도록 역순 정렬 (맨 아래가 1층)
const displayRows = computed(() => {
  let rows = []
  if (selectedRow.value) {
    rows = [selectedRow.value]
  } else {
    rows = [...allRows.value]
  }
  // 역순 정렬 (맨 아래가 1층)
  return rows.reverse()
})

// displayRows와 빈 데이터 변경은 스케일 슬라이더를 사용하므로 자동으로 반영됨

const columnCount = computed(() => {
  return block.value?.column_count || 1
})

// 셀 데이터 맵 (표시용, computed로 최적화)
const cellDataMap = computed(() => {
  const map = {}
  if (!block.value || !allRows.value) return map

  allRows.value.forEach((row) => {
    for (let colIndex = 0; colIndex < columnCount.value; colIndex++) {
      const key = `${row.id}-${colIndex}`
      map[key] = partsStore.getCellData(block.value.id, row.id, colIndex)
    }
  })
  return map
})

function getRowIndex(row) {
  // 전체 행 목록에서 현재 행의 인덱스를 찾음
  return allRows.value.findIndex((r) => r.id === row.id)
}

function getFloorLabel(row) {
  // 층 라벨 생성: row_identifier를 우선 사용, 없으면 층수만 추출
  if (row.row_identifier) {
    return `${row.row_identifier}층`
  }
  // row.name에서 숫자 부분만 추출 (예: "테스트 스토리지 - 1층" -> "1층")
  const match = row.name.match(/(\d+)층/)
  if (match) {
    return match[0]
  }
  // 기본값: 인덱스 기반
  return `${getRowIndex(row) + 1}층`
}

function getCellLabel(row, colIndex) {
  // 셀 라벨 생성: 층수-좌우INDEX 형식 (예: 1-1, 1-2, 2-1, 2-2)
  // row_identifier를 사용하거나, 전체 행 목록에서의 위치를 사용
  const floorNumber = row.row_identifier || String(getRowIndex(row) + 1)
  const columnNumber = colIndex + 1
  return `${floorNumber}-${columnNumber}`
}

function getTooltipText(row, colIndex) {
  // 툴팁 텍스트: 블록명 > 해당층수 > 해당 인덱스번호 (중복 제거)
  const floorLabel = getFloorLabel(row)
  const cellLabel = getCellLabel(row, colIndex)
  return `${block.value.name} > ${floorLabel} > ${cellLabel}`
}

// 셀 데이터 가져오기 (표시용)
function getCellDataForDisplay(rowIndex, colIndex) {
  try {
    if (!block.value || !allRows.value || rowIndex < 0 || colIndex < 0) {
      return null
    }
    if (rowIndex >= allRows.value.length) {
      return null
    }
    const clickedRow = allRows.value[rowIndex]
    if (!clickedRow || !clickedRow.id) {
      return null
    }

    return partsStore.getCellData(block.value.id, clickedRow.id, colIndex)
  } catch (error) {
    console.error('getCellDataForDisplay error:', error)
    return null
  }
}

// 선반형: 하나의 층에 있는 모든 빈 가져오기
function getShelfBinsForRow(row) {
  if (!block.value || !row) {
    return []
  }

  const bins = []
  // 선반형은 최대 20개의 빈까지 배치 가능 (필요시 조정)
  for (let cellIndex = 0; cellIndex < 20; cellIndex++) {
    const binData = partsStore.getCellData(block.value.id, row.id, cellIndex)
    if (binData) {
      bins.push({
        cellIndex,
        data: binData,
      })
    }
  }

  return bins
}

// shelf-bin SKU 표시 형식 간소화 (이전 버전 - 나중에 사용 가능)
// function formatShelfBinSku(sku, cellIndex) {
//   if (!sku) {
//     return `${cellIndex + 1}`
//   }
//
//   // 타임스테프가 포함된 경우 (예: BIN-2-3-1234567890123)
//   // 마지막 숫자 부분만 짧게 표시
//   const timestampMatch = sku.match(/BIN-\d+-\d+-(\d+)$/)
//   if (timestampMatch) {
//     const timestamp = timestampMatch[1]
//     // 마지막 6자리만 표시 (예: ...890123)
//     const shortTimestamp = timestamp.slice(-6)
//     return `BIN-${shortTimestamp}`
//   }
//
//   // 일반 SKU의 경우 최대 8자리로 제한
//   if (sku.length > 8) {
//     return sku.substring(0, 8) + '...'
//   }
//
//   return sku
// }

// SKU 앞부분 생략하고 뒷부분 표시
function formatShelfBinSkuWithEllipsis(sku, cellIndex, maxLength = 8, tailLength = 6) {
  if (!sku) {
    return `${cellIndex + 1}`
  }

  // SKU가 maxLength보다 짧으면 그대로 반환
  if (sku.length <= maxLength) {
    return sku
  }

  // 뒷부분 tailLength만큼 가져오기
  const tail = sku.slice(-tailLength)

  // 앞부분을 생략하고 뒷부분만 표시 (예: ...890123)
  return `...${tail}`
}

// 선반 빈의 스타일 계산 (모델 크기 반영)
function getShelfBinStyle(binData) {
  if (!binData) {
    return {}
  }

  // 모델 크기가 있으면 사용, 없으면 기본값
  const height_mm = binData.height_mm || 200 // 기본 200mm
  const width_mm = binData.width_mm || 160 // 기본 160mm

  // 스케일 슬라이더 값 사용 (0.1 ~ 1.0)
  const SCALE_FACTOR = binScale.value

  // 원본 비율 계산 (높이/너비)
  const aspectRatio = height_mm / width_mm

  // 픽셀 단위로 변환 (가로 기준, 비율 유지)
  // 가로 너비를 기준으로 하고, 높이는 비율에 따라 자동 계산
  // 최소값 제한 없이 스케일 팩터만 적용하여 비율 완벽 유지
  const widthPx = width_mm * SCALE_FACTOR
  const heightPx = widthPx * aspectRatio // 가로 비율에 따라 높이 결정

  // 스타일 설정 (비율 유지)
  const style = {
    width: `${widthPx}px`,
    height: `${heightPx}px`,
    minWidth: `${widthPx}px`,
    aspectRatio: aspectRatio.toString(), // CSS aspect-ratio로 비율 강제 유지
  }

  return style
}

// 빈 공간 스타일 계산 (컴팩트 모드용)
function getEmptySpaceStyle(row) {
  const bins = getShelfBinsForRow(row)
  if (bins.length === 0) {
    return { height: '100px' }
  }

  // 첫 번째 빈의 높이를 기준으로 설정
  const firstBin = bins[0]
  const binStyle = getShelfBinStyle(firstBin.data)
  return {
    height: binStyle.height || '100px',
  }
}

function handleCellClick(rowIndex, colIndex) {
  // 클릭한 셀의 row 찾기
  const clickedRow = displayRows.value.find((row) => getRowIndex(row) === rowIndex)
  if (clickedRow) {
    const cellLabel = getCellLabel(clickedRow, colIndex)
    partsStore.setSelectedCellIndex(cellLabel)
  }
}

function handleCellDoubleClick(rowIndex, colIndex, row) {
  // 더블클릭한 셀의 빈 데이터 가져오기 (없을 수도 있음)
  const cellData = getCellDataForDisplay(rowIndex, colIndex)
  if (!block.value || !row) {
    return
  }

  // 빈 정보와 위치 정보를 store에 저장
  // cellData가 null이면 빈 셀 상태로 처리
  const cellLabel = getCellLabel(row, colIndex)
  partsStore.setSelectedBin(cellData || null, {
    blockId: block.value.id,
    rowId: row.id,
    cellIndex: cellLabel,
  })

  // 모달 열기
  showBinDetailModal.value = true
}

// shelf-cell 더블클릭 핸들러 (부품함 추가 모달)
function handleShelfCellDoubleClick(row) {
  if (!block.value || !row) {
    return
  }

  const floorLabel = getFloorLabel(row)

  // 빈 셀 상태로 설정 (부품함 추가 모달)
  partsStore.setSelectedBin(null, {
    blockId: block.value.id,
    rowId: row.id,
    cellIndex: floorLabel,
  })

  // 모달 열기
  showBinDetailModal.value = true
}

// shelf-bin 더블클릭 핸들러 (입출고 모달)
function handleShelfBinDoubleClick(row, cellIndex) {
  if (!block.value || !row) {
    return
  }

  // 해당 위치의 빈 데이터 가져오기
  const rowIndex = getRowIndex(row)
  const cellData = getCellDataForDisplay(rowIndex, cellIndex)
  const floorLabel = getFloorLabel(row)

  // 빈 정보와 위치 정보를 store에 저장
  partsStore.setSelectedBin(cellData || null, {
    blockId: block.value.id,
    rowId: row.id,
    cellIndex: `${floorLabel}-${cellIndex + 1}`,
  })

  // 모달 열기
  showBinDetailModal.value = true
}

function getFullPath() {
  // 전체 경로 생성: 블록명 > 층수 > 인덱스
  if (!block.value) return ''

  let path = block.value.name || ''
  if (selectedRow.value) {
    const floorLabel = getFloorLabel(selectedRow.value)
    path += ` > ${floorLabel}`
  }
  if (selectedCellIndex.value) {
    path += ` > ${selectedCellIndex.value}`
  }
  return path
}

function handleBlockClick() {
  // 블록 클릭: 블록 선택으로 이동 (셀 선택 해제)
  partsStore.clearSelectedCellIndex()
  if (selectedRow.value) {
    partsStore.setSelectedStorageRow(null)
  }
}

function handleFloorClick() {
  // 층 클릭: 층 선택 유지, 셀 선택 해제
  partsStore.clearSelectedCellIndex()
}

// 셀 드래그 시작
function handleCellDragStart(event, rowIndex, colIndex, row) {
  if (!block.value || !row) {
    event.preventDefault()
    return
  }

  const cellData = getCellDataForDisplay(rowIndex, colIndex)
  if (!cellData) {
    // 빈 셀은 드래그 불가
    event.preventDefault()
    return
  }

  // 셀 라벨 생성 (cellIndex용)
  const cellLabel = getCellLabel(row, colIndex)

  // 드래그할 셀 정보 저장
  draggedCell.value = {
    blockId: block.value.id,
    rowId: row.id,
    rowIndex,
    colIndex,
    cellIndex: cellLabel,
    binData: cellData,
  }

  // 드래그 데이터 설정
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData(
    'application/json',
    JSON.stringify({
      type: 'cell',
      ...draggedCell.value,
    }),
  )
}

// 셀 드래그 오버
function handleCellDragOver(event, rowIndex, colIndex) {
  dragOverCell.value = { rowIndex, colIndex }
  event.dataTransfer.dropEffect = 'move'
}

// 셀 드래그 리브
function handleCellDragLeave() {
  dragOverCell.value = null
}

// 셀 드롭
function handleCellDrop(event, targetRowIndex, targetColIndex, targetRow) {
  dragOverCell.value = null

  if (!block.value || !targetRow) {
    return
  }

  try {
    const dragDataStr = event.dataTransfer.getData('application/json')
    if (!dragDataStr) {
      return
    }

    const dragData = JSON.parse(dragDataStr)

    // 임시 보관소에서 드롭한 경우
    if (dragData.type === 'temporary-bin') {
      const targetCellData = getCellDataForDisplay(targetRowIndex, targetColIndex)

      if (targetCellData) {
        // 타겟 셀에 빈이 있으면 스와핑
        // 임시 보관소의 빈을 타겟 셀에 넣고, 타겟 셀의 빈을 임시 보관소로
        partsStore.setCellData(block.value.id, targetRow.id, targetColIndex, dragData.binData)
        partsStore.addToTemporaryBins({
          binData: targetCellData,
          originalPosition: {
            blockId: block.value.id,
            rowId: targetRow.id,
            cellIndex: `${targetRow.row_identifier || targetRowIndex + 1}-${targetColIndex + 1}`,
          },
        })
        partsStore.removeFromTemporaryBins(dragData.id)
      } else {
        // 타겟 셀이 비어있으면 그냥 배치
        partsStore.setCellData(block.value.id, targetRow.id, targetColIndex, dragData.binData)
        partsStore.removeFromTemporaryBins(dragData.id)
      }
    }
    // 셀에서 셀로 드롭한 경우 (스와핑)
    else if (dragData.type === 'cell' && draggedCell.value) {
      const source = draggedCell.value

      // 같은 셀에 드롭한 경우 무시
      if (source.rowIndex === targetRowIndex && source.colIndex === targetColIndex) {
        draggedCell.value = null
        return
      }

      const targetCellData = getCellDataForDisplay(targetRowIndex, targetColIndex)

      if (targetCellData) {
        // 타겟 셀에 빈이 있으면 스와핑
        partsStore.swapCells(
          source.blockId,
          source.rowId,
          source.colIndex,
          block.value.id,
          targetRow.id,
          targetColIndex,
        )
      } else {
        // 타겟 셀이 비어있으면 이동
        partsStore.setCellData(block.value.id, targetRow.id, targetColIndex, source.binData)
        partsStore.setCellData(source.blockId, source.rowId, source.colIndex, null)
      }
    }
  } catch (error) {
    console.error('Drop error:', error)
  }

  draggedCell.value = null
}

// shelf-bin 드래그 시작
function handleShelfBinDragStart(event, row, cellIndex) {
  if (!block.value || !row) {
    event.preventDefault()
    return
  }

  const binData = partsStore.getCellData(block.value.id, row.id, cellIndex)
  if (!binData) {
    // 빈이 없으면 드래그 불가
    event.preventDefault()
    return
  }

  // 드래그할 빈 정보 저장
  draggedShelfBin.value = {
    blockId: block.value.id,
    rowId: row.id,
    cellIndex,
    binData,
  }

  // 드래그 데이터 설정
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData(
    'application/json',
    JSON.stringify({
      type: 'shelf-bin',
      ...draggedShelfBin.value,
    }),
  )
}

// shelf-bin 드래그 오버
function handleShelfBinDragOver(event, row, cellIndex) {
  dragOverShelfBin.value = { rowId: row.id, cellIndex }
  event.dataTransfer.dropEffect = 'move'
}

// shelf-bin 드래그 리브
function handleShelfBinDragLeave() {
  dragOverShelfBin.value = null
}

// shelf-bin 드롭
function handleShelfBinDrop(event, targetRow, targetCellIndex) {
  dragOverShelfBin.value = null

  if (!block.value || !targetRow) {
    return
  }

  try {
    const dragDataStr = event.dataTransfer.getData('application/json')
    if (!dragDataStr) {
      return
    }

    const dragData = JSON.parse(dragDataStr)

    // 임시 보관소에서 드롭한 경우
    if (dragData.type === 'temporary-bin') {
      const targetBinData = partsStore.getCellData(block.value.id, targetRow.id, targetCellIndex)

      if (targetBinData) {
        // 타겟 위치에 빈이 있으면 스와핑
        // 임시 보관소의 빈을 타겟 위치에 넣고, 타겟 위치의 빈을 임시 보관소로
        partsStore.setCellData(block.value.id, targetRow.id, targetCellIndex, dragData.binData)
        const floorLabel = getFloorLabel(targetRow)
        partsStore.addToTemporaryBins({
          binData: targetBinData,
          originalPosition: {
            blockId: block.value.id,
            rowId: targetRow.id,
            cellIndex: `${floorLabel}-${targetCellIndex + 1}`,
          },
        })
        partsStore.removeFromTemporaryBins(dragData.id)
      } else {
        // 타겟 위치가 비어있으면 그냥 배치
        partsStore.setCellData(block.value.id, targetRow.id, targetCellIndex, dragData.binData)
        partsStore.removeFromTemporaryBins(dragData.id)
      }
    }
    // shelf-bin에서 shelf-bin으로 드롭한 경우 (스와핑)
    else if (dragData.type === 'shelf-bin' && draggedShelfBin.value) {
      const source = draggedShelfBin.value

      // 같은 위치에 드롭한 경우 무시
      if (source.rowId === targetRow.id && source.cellIndex === targetCellIndex) {
        draggedShelfBin.value = null
        return
      }

      const targetBinData = partsStore.getCellData(block.value.id, targetRow.id, targetCellIndex)

      if (targetBinData) {
        // 타겟 위치에 빈이 있으면 스와핑
        partsStore.swapCells(
          source.blockId,
          source.rowId,
          source.cellIndex,
          block.value.id,
          targetRow.id,
          targetCellIndex,
        )
      } else {
        // 타겟 위치가 비어있으면 이동
        partsStore.setCellData(block.value.id, targetRow.id, targetCellIndex, source.binData)
        partsStore.setCellData(source.blockId, source.rowId, source.cellIndex, null)
      }
    }
  } catch (error) {
    console.error('Shelf bin drop error:', error)
  }

  draggedShelfBin.value = null
}

// shelf-cell 드래그 오버 (빈이 없는 영역)
function handleShelfCellDragOver(event, row) {
  dragOverShelfCell.value = { rowId: row.id }
  event.dataTransfer.dropEffect = 'move'
}

// shelf-cell 드래그 리브
function handleShelfCellDragLeave() {
  dragOverShelfCell.value = null
}

// shelf-cell 드롭 (빈이 없는 영역에 드롭)
function handleShelfCellDrop(event, targetRow) {
  dragOverShelfCell.value = null

  if (!block.value || !targetRow) {
    return
  }

  try {
    const dragDataStr = event.dataTransfer.getData('application/json')
    if (!dragDataStr) {
      return
    }

    const dragData = JSON.parse(dragDataStr)

    // 임시 보관소에서 드롭한 경우
    if (dragData.type === 'temporary-bin') {
      // 해당 층의 다음 사용 가능한 위치 찾기
      let targetCellIndex = -1
      for (let i = 0; i < 20; i++) {
        const existingBin = partsStore.getCellData(block.value.id, targetRow.id, i)
        if (!existingBin) {
          targetCellIndex = i
          break
        }
      }

      if (targetCellIndex >= 0) {
        // 사용 가능한 위치에 배치
        partsStore.setCellData(block.value.id, targetRow.id, targetCellIndex, dragData.binData)
        partsStore.removeFromTemporaryBins(dragData.id)
      }
    }
    // shelf-bin에서 shelf-cell로 드롭한 경우 (다른 층으로 이동)
    else if (dragData.type === 'shelf-bin' && draggedShelfBin.value) {
      const source = draggedShelfBin.value

      // 같은 층에 드롭한 경우는 무시 (shelf-bin 드롭에서 처리)
      if (source.rowId === targetRow.id) {
        draggedShelfBin.value = null
        return
      }

      // 다른 층의 다음 사용 가능한 위치 찾기
      let targetCellIndex = -1
      for (let i = 0; i < 20; i++) {
        const existingBin = partsStore.getCellData(block.value.id, targetRow.id, i)
        if (!existingBin) {
          targetCellIndex = i
          break
        }
      }

      if (targetCellIndex >= 0) {
        // 다른 층의 사용 가능한 위치로 이동
        partsStore.setCellData(block.value.id, targetRow.id, targetCellIndex, source.binData)
        partsStore.setCellData(source.blockId, source.rowId, source.cellIndex, null)
      }
    }
  } catch (error) {
    console.error('Shelf cell drop error:', error)
  }

  draggedShelfBin.value = null
}
</script>

<style lang="scss" scoped>
.storage-block-grid-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--nexa-bg, #1e1e1e);
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  margin: 0;
  padding: 0;
  padding-top: 10vh;
  width: 100%;
}

.empty-state-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.empty-state .empty-state-title {
  font-size: 120px;
  font-weight: 700;
  color: rgba(131, 223, 27, 0.9) !important;
  margin-bottom: 16px;
  letter-spacing: -1px;
  line-height: 1.2;
  text-transform: uppercase;
}

.empty-state .empty-state-subtitle {
  font-size: 16px;
  font-weight: 400;
  color: rgba(177, 175, 75, 0.85) !important;
  margin-top: 8px;
}

.empty-state .empty-state-korean-title {
  color: rgba(255, 200, 87, 0.95) !important;
  font-weight: 500;
}

.empty-state .empty-state-korean-subtitle {
  color: rgba(137, 203, 22, 0.85) !important;
}

.empty-state .empty-state-icon {
  color: rgba(255, 152, 0, 0.9) !important;
}

.empty-state .empty-state-icon :deep(svg) {
  fill: rgba(255, 152, 0, 0.9) !important;
}

.grid-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
}

.grid-header {
  background: var(--nexa-header-bg, rgba(33, 150, 243, 0.1));
  border-bottom: 1px solid var(--nexa-border-color, rgba(255, 255, 255, 0.1));
}

.navigation-path {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
}

.nav-item {
  cursor: default;
}

.nav-item-clickable {
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
    text-decoration: underline;
  }
}

.nav-separator {
  font-weight: 300;
}

.scale-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;

  .scale-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--nexa-text-secondary, rgba(255, 255, 255, 0.7));
    margin-right: 4px;
  }

  .scale-btn {
    min-width: 28px;
    width: 28px;
    height: 28px;
    padding: 0;
  }

  .scale-slider {
    flex: 1;
    min-width: 150px;
    max-width: 300px;
  }

  :deep(.q-slider) {
    .q-slider__track {
      background: rgba(255, 255, 255, 0.1);
    }

    .q-slider__thumb {
      background: var(--nexa-primary, #2196f3);
    }
  }
}

.tooltip-content {
  font-size: 13px;
  white-space: nowrap;
}

/* RACK 그리드 스타일 */
.rack-grid {
  flex: 1;
  overflow: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px; /* 렉형과 선반형 간격 통일 */
  width: 100%;
  box-sizing: border-box;
}

.rack-row {
  display: flex;
  align-items: center;
  width: 100%;
  margin: 0; /* 추가 margin 제거 */
  padding: 0; /* 추가 padding 제거 */
}

.rack-cells {
  display: flex;
  flex-direction: row;
  gap: 8px;
  width: 100%;
}

.rack-cell {
  flex: 1;
  min-width: 80px;
  aspect-ratio: 1;
  max-width: calc((100% - (var(--column-count, 3) - 1) * 8px) / var(--column-count, 3));
  border: 2px solid var(--nexa-border-color, rgba(255, 255, 255, 0.2));
  border-radius: 4px;
  background: var(--nexa-card-bg, rgba(255, 255, 255, 0.05));
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &:hover {
    border-color: var(--nexa-primary, #2196f3);
    background: rgba(33, 150, 243, 0.1);
    transform: scale(1.05);
  }

  &.cell-empty {
    opacity: 0.5;
    cursor: default;
    background: var(--nexa-card-bg, rgba(255, 255, 255, 0.02));
    border-style: dashed;

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 20px;
      height: 20px;
      border: 2px dashed var(--nexa-border-color, rgba(255, 255, 255, 0.1));
      border-radius: 2px;
      opacity: 0.3;
    }
  }

  &.cell-has-bin {
    cursor: grab;

    &:active {
      cursor: grabbing;
    }
  }

  &.drag-over {
    border-color: var(--nexa-primary, #2196f3);
    background: rgba(33, 150, 243, 0.2);
    transform: scale(1.1);
    box-shadow: 0 0 10px rgba(33, 150, 243, 0.5);
  }
}

/* 선반 라벨 - 하드코딩 스타일 */
.shelf-label {
  position: absolute;
  top: 8px;
  left: 16px;
  font-size: 12px;
  color: var(--nexa-text-secondary, rgba(255, 255, 255, 0.7));
  font-weight: 500;
  z-index: 1;
}

/* shelf-bins 컨테이너 */
.shelf-bins {
  display: flex;
  gap: 8px; /* 두 개의 shelf-bin 사이 간격 */
  align-items: flex-end; /* 아래 정렬 */
  width: max-content; /* 스크롤 가능하도록 설정 */
  min-width: 0; /* flex 컨테이너에서 오버플로우 방지 */
  flex-shrink: 0;
  flex-grow: 0;
  overflow-x: auto;
  overflow-y: hidden;
}

.shelf-bin-empty-space {
  min-width: 30px;
  height: 100px;
  cursor: pointer;
  flex-shrink: 0;
  border-radius: 2px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border: 1px dashed rgba(255, 255, 255, 0.2);
  }
}

/* shelf-bin 클래스 스타일 */
.shelf-bin {
  display: inline-flex;
  align-items: center; /* 상하 중앙 정렬 */
  justify-content: center; /* 좌우 중앙 정렬 */
  padding: 0; /* 패딩 제거 */
  background: #986722 !important; /* 브라운 - CSS 변수 무시 */
  color: white;
  border: 2px solid #1a1815 !important; /* 다크 브라운 - CSS 변수 무시 */
  border-radius: 0; /* 라운드 제거 - 일반 사각형 */
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
  /* 높이는 인라인 스타일로 설정됨 (컴팩트 모드에서는 스케일 팩터에 따라, 스크롤 모드에서는 100px) */
  min-width: fit-content; /* 내용물에 맞게 최소 너비 설정 (스크롤 모드용) */
  flex-shrink: 0; /* 스크롤 모드에서 줄어들지 않도록 */
  user-select: none; /* 텍스트 선택 방지 */
  -webkit-user-select: none; /* Safari 지원 */
  -moz-user-select: none; /* Firefox 지원 */
  -ms-user-select: none; /* IE/Edge 지원 */
  overflow: hidden; /* 텍스트 오버플로우 방지 */
  text-overflow: ellipsis; /* 긴 텍스트 말줄임표 표시 */

  &:hover {
    background: #6b4a15 !important; /* 브라운 다크 */
    transform: scale(1.05);
  }

  &.drag-over {
    border-color: #8b6914 !important; /* 브라운 계통 */
    background: rgba(152, 103, 34, 0.5) !important; /* 브라운 반투명 */
    transform: scale(1.1);
    box-shadow: 0 0 10px rgba(152, 103, 34, 0.6); /* 브라운 그림자 */
  }
}

/* SHELF 그리드 스타일 */
.shelf-grid {
  flex: 1;
  overflow: auto;
  padding: 16px; /* 렉형과 동일한 padding */
  display: flex;
  flex-direction: column;
  gap: 8px; /* 렉형과 동일한 간격 */
  width: 100%;
  box-sizing: border-box;
}

.shelf-row {
  display: flex;
  align-items: center;
  width: 100%;
  margin: 0; /* 추가 margin 제거 */
  padding: 0; /* 추가 padding 제거 */
  transition:
    min-height 0.3s ease,
    height 0.3s ease;
}

.shelf-cell {
  min-height: 80px; /* 렉형 셀과 동일한 높이 (aspect-ratio: 1, min-width: 80px) */
  border: 2px solid var(--nexa-border-color, rgba(255, 255, 255, 0.2));
  border-radius: 4px;
  background: var(--nexa-card-bg, rgba(255, 255, 255, 0.05));
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column; /* 세로 방향으로 배치 */
  align-items: flex-start; /* 상단 정렬 */
  justify-content: flex-start; /* 왼쪽 정렬 */
  position: relative;
  padding: 8px 16px; /* 내부 여백 */

  /* 선반은 항상 가로로 꽉 참 */
  flex: 1;
  width: 100%;
  overflow-x: auto; /* 가로 스크롤 활성화 */
  overflow-y: hidden; /* 세로 스크롤 비활성화 */
  align-items: stretch;

  &:hover {
    border-color: rgba(33, 150, 243, 0.4);
    background: rgba(33, 150, 243, 0.1);
  }

  &.drag-over-cell {
    border-color: var(--nexa-primary, #2196f3);
    background: rgba(33, 150, 243, 0.2);
    border-style: dashed;
  }

  &.cell-empty {
    opacity: 0.5;
    cursor: default;
    background: var(--nexa-card-bg, rgba(255, 255, 255, 0.02));
    border-style: dashed;

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 20px;
      height: 20px;
      border: 2px dashed var(--nexa-border-color, rgba(255, 255, 255, 0.1));
      border-radius: 2px;
      opacity: 0.3;
    }
  }

  &.cell-has-bin {
    cursor: grab;

    &:active {
      cursor: grabbing;
    }
  }
}
</style>
