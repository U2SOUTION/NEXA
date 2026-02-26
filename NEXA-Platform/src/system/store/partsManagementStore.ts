import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePartsManagementStore = defineStore('partsManagement', () => {
  // 공간 계층 구조 (하드코딩된 임시 데이터로 시작 - 테스트용)
  const spaces = ref([
    {
      id: 1,
      name: '테스트 공간 1',
      type: 'base_space',
      expanded: true,
      children: [
        {
          id: 2,
          name: '테스트 스토리지 블록 1',
          type: 'storage_block',
          storage_type: 'RACK',
          column_count: 3,
          parentId: 1,
          expanded: true,
          children: [
            {
              id: 3,
              name: '테스트 스토리지 - 1층',
              type: 'storage_row',
              row_identifier: '1',
              parentId: 2,
            },
            {
              id: 4,
              name: '테스트 스토리지 - 2층',
              type: 'storage_row',
              row_identifier: '2',
              parentId: 2,
            },
          ],
        },
      ],
    },
    {
      id: 5,
      name: '테스트 공간 2',
      type: 'base_space',
      expanded: true,
      children: [
        {
          id: 6,
          name: '테스트 선반 블록 1',
          type: 'storage_block',
          storage_type: 'SHELF_UNIT',
          column_count: null, // 선반형은 칸이 없음
          height_mm: 2000, // 전체 높이 2000mm
          parentId: 5,
          expanded: true,
          children: [
            {
              id: 7,
              name: '테스트 선반 - 1층',
              type: 'storage_row',
              row_identifier: '1',
              height_mm: 200, // 기본 높이 200mm
              parentId: 6,
            },
            {
              id: 8,
              name: '테스트 선반 - 2층',
              type: 'storage_row',
              row_identifier: '2',
              height_mm: 200,
              parentId: 6,
            },
            {
              id: 9,
              name: '테스트 선반 - 3층',
              type: 'storage_row',
              row_identifier: '3',
              height_mm: 200,
              parentId: 6,
            },
            {
              id: 10,
              name: '테스트 선반 - 4층',
              type: 'storage_row',
              row_identifier: '4',
              height_mm: 200,
              parentId: 6,
            },
          ],
        },
      ],
    },
  ])

  // 현재 선택된 storage_row
  const selectedStorageRow = ref(null)

  // 현재 선택된 storage_block
  const selectedStorageBlock = ref(null)

  // 현재 선택된 셀 인덱스 (층수-칸수 형식)
  const selectedCellIndex = ref(null)

  // 현재 선택된 빈 정보 (상세 모달용)
  const selectedBin = ref(null) // { binData, position: { blockId, rowId, cellIndex } }

  // 임시 보관소 (빈을 임시로 보관하는 배열)
  const temporaryBins = ref([])

  // 셀 데이터 저장 (키: "blockId-rowId-cellIndex", 값: 빈 데이터)
  const cellDataMap = ref(new Map())

  // 빈 모델 데이터 (localStorage에서 로드)
  const binModels = ref([])

  // 사이드바 모드 상태 (null: 초기 상태/대시보드, 'physical': 물리 공간, 'parts-data': 부품 데이터)
  const sidebarMode = ref(null) // null | 'physical' | 'parts-data'

  // 부품 데이터 관리 뷰 선택 상태
  const selectedPartsDataView = ref(null) // 'part-classes' | 'part-models' | 'part-specs' | 'part-classes-trash'

  // 사이드바 모드 설정 함수
  function setSidebarMode(mode) {
    sidebarMode.value = mode
    // 물리 공간 모드로 전환 시 부품 데이터 뷰 초기화
    if (mode === 'physical') {
      selectedPartsDataView.value = null
    }
  }

  // 부품 데이터 관리 뷰 설정 함수
  function setSelectedPartsDataView(view) {
    selectedPartsDataView.value = view
  }

  // 부품 데이터 관리 뷰 초기화 함수
  function clearSelectedPartsDataView() {
    selectedPartsDataView.value = null
  }
  const BIN_MODELS_STORAGE_KEY = 'nexaBinModels'
  const CELL_DATA_STORAGE_KEY = 'nexaCellData'
  const TEMPORARY_BINS_STORAGE_KEY = 'nexaTemporaryBins'

  // localStorage에서 빈 모델 로드
  function loadBinModelsFromStorage() {
    try {
      const stored = localStorage.getItem(BIN_MODELS_STORAGE_KEY)
      if (stored) {
        binModels.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('[PartsManagementStore] Failed to load bin models from storage:', error)
      binModels.value = []
    }
  }

  // localStorage에 빈 모델 저장
  function saveBinModelsToStorage() {
    try {
      localStorage.setItem(BIN_MODELS_STORAGE_KEY, JSON.stringify(binModels.value))
    } catch (error) {
      console.error('[PartsManagementStore] Failed to save bin models to storage:', error)
    }
  }

  // localStorage에서 셀 데이터 로드
  function loadCellDataFromStorage() {
    try {
      const stored = localStorage.getItem(CELL_DATA_STORAGE_KEY)
      if (stored) {
        const dataArray = JSON.parse(stored)
        cellDataMap.value = new Map(dataArray)
      }
    } catch (error) {
      console.error('[PartsManagementStore] Failed to load cell data from storage:', error)
      cellDataMap.value = new Map()
    }
  }

  // localStorage에 셀 데이터 저장
  function saveCellDataToStorage() {
    try {
      // Map을 배열로 변환하여 저장
      const dataArray = Array.from(cellDataMap.value.entries())
      localStorage.setItem(CELL_DATA_STORAGE_KEY, JSON.stringify(dataArray))
    } catch (error) {
      console.error('[PartsManagementStore] Failed to save cell data to storage:', error)
    }
  }

  // localStorage에서 임시 보관소 빈 로드
  function loadTemporaryBinsFromStorage() {
    try {
      const stored = localStorage.getItem(TEMPORARY_BINS_STORAGE_KEY)
      if (stored) {
        temporaryBins.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('[PartsManagementStore] Failed to load temporary bins from storage:', error)
      temporaryBins.value = []
    }
  }

  // localStorage에 임시 보관소 빈 저장
  function saveTemporaryBinsToStorage() {
    try {
      localStorage.setItem(TEMPORARY_BINS_STORAGE_KEY, JSON.stringify(temporaryBins.value))
    } catch (error) {
      console.error('[PartsManagementStore] Failed to save temporary bins to storage:', error)
    }
  }

  // 초기 로드
  loadBinModelsFromStorage()
  loadCellDataFromStorage()
  loadTemporaryBinsFromStorage()

  // localStorage에 데이터가 없을 때만 테스트용 초기 빈 데이터 추가
  if (cellDataMap.value.size === 0) {
    // RACK 타입: blockId=2, rowId=3 (1층), cellIndex=0,1에 빈 추가
    cellDataMap.value.set('2-3-0', { sku: 'BIN-001', name: '테스트 빈 1', height_mm: 100 })
    cellDataMap.value.set('2-3-1', { sku: 'BIN-002', name: '테스트 빈 2', height_mm: 100 })
    // RACK 타입: blockId=2, rowId=4 (2층), cellIndex=0에 빈 추가
    cellDataMap.value.set('2-4-0', { sku: 'BIN-003', name: '테스트 빈 3', height_mm: 100 })

    // SHELF_UNIT 타입: blockId=6, 선반형은 하나의 층에 여러 빈 배치 가능
    // blockId=6, rowId=7 (1층)에 빈 2개 추가
    cellDataMap.value.set('6-7-0', {
      sku: 'SHELF-BIN-001',
      name: '선반 부품함 1',
      height_mm: 150,
    })
    cellDataMap.value.set('6-7-1', {
      sku: 'SHELF-BIN-002',
      name: '선반 부품함 2',
      height_mm: 150,
    })
    // blockId=6, rowId=9 (3층)에 빈 3개 추가
    cellDataMap.value.set('6-9-0', {
      sku: 'SHELF-BIN-003',
      name: '선반 부품함 3',
      height_mm: 180,
    })
    cellDataMap.value.set('6-9-1', {
      sku: 'SHELF-BIN-004',
      name: '선반 부품함 4',
      height_mm: 180,
    })
    cellDataMap.value.set('6-9-2', {
      sku: 'SHELF-BIN-005',
      name: '선반 부품함 5',
      height_mm: 180,
    })

    // 초기 테스트 데이터 저장
    saveCellDataToStorage()
  }

  // 루트 노드들 가져오기
  const getRootNodes = computed(() => {
    return spaces.value
  })

  // 특정 노드의 자식 노드들 가져오기
  function getChildNodes(parentId) {
    const findNode = (nodes, id) => {
      for (const node of nodes) {
        if (node.id === id) return node
        if (node.children) {
          const found = findNode(node.children, id)
          if (found) return found
        }
      }
      return null
    }

    const node = findNode(spaces.value, parentId)
    return node?.children || []
  }

  // 노드 업데이트 (확장/축소 등)
  function updateNode(nodeId, updates) {
    const findAndUpdate = (nodes) => {
      for (const node of nodes) {
        if (node.id === nodeId) {
          Object.assign(node, updates)
          return true
        }
        if (node.children) {
          if (findAndUpdate(node.children)) return true
        }
      }
      return false
    }

    findAndUpdate(spaces.value)
  }

  // storage_row 선택
  function setSelectedStorageRow(row) {
    selectedStorageRow.value = row
    // storage_row 선택 시 storage_block 선택 해제 (부모 블록은 그리드에서 자동으로 찾음)
    selectedStorageBlock.value = null
  }

  // storage_block 선택
  function setSelectedStorageBlock(block) {
    selectedStorageBlock.value = block
    // storage_block 선택 시 storage_row 선택 해제
    selectedStorageRow.value = null
  }

  // 노드 ID로 노드 찾기
  function getNodeById(nodeId) {
    const findNode = (nodes, id) => {
      for (const node of nodes) {
        if (node.id === id) return node
        if (node.children) {
          const found = findNode(node.children, id)
          if (found) return found
        }
      }
      return null
    }

    return findNode(spaces.value, nodeId)
  }

  // 노드 삭제 (자식들도 함께 삭제)
  function removeNode(nodeId) {
    // 삭제할 노드와 모든 자식 노드의 ID 수집
    const collectNodeIds = (node) => {
      const ids = [node.id]
      if (node.children && node.children.length > 0) {
        node.children.forEach((child) => {
          ids.push(...collectNodeIds(child))
        })
      }
      return ids
    }

    // 삭제할 노드 찾기
    const nodeToDelete = getNodeById(nodeId)
    if (!nodeToDelete) {
      console.warn('[PartsManagementStore] Node not found for deletion:', nodeId)
      return
    }

    // 삭제될 모든 노드 ID 수집 (본인 + 모든 자식)
    const idsToDelete = collectNodeIds(nodeToDelete)

    // 선택된 노드가 삭제될 노드 목록에 포함되어 있으면 선택 해제
    if (selectedStorageRow.value && idsToDelete.includes(selectedStorageRow.value.id)) {
      selectedStorageRow.value = null
    }
    if (selectedStorageBlock.value && idsToDelete.includes(selectedStorageBlock.value.id)) {
      selectedStorageBlock.value = null
    }

    // 실제 삭제 수행
    const findAndRemove = (nodes) => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === nodeId) {
          // 배열에서 제거
          nodes.splice(i, 1)
          return true
        }
        if (nodes[i].children) {
          if (findAndRemove(nodes[i].children)) return true
        }
      }
      return false
    }

    findAndRemove(spaces.value)
  }

  // 공간 추가
  function addSpace(spaceData) {
    const newSpace = {
      id: spaceData.id || Date.now(),
      type: 'base_space',
      name: spaceData.name,
      sku: spaceData.sku || '',
      description: spaceData.description || '',
      expanded: spaceData.expanded || false,
      children: [],
    }
    spaces.value.push(newSpace)
    return newSpace
  }

  // 스토리지 블록 추가
  function addStorageBlock(blockData) {
    const parentNode = getNodeById(blockData.parentId)
    if (!parentNode) {
      console.error('[PartsManagementStore] Parent node not found:', blockData.parentId)
      return null
    }

    if (!parentNode.children) {
      parentNode.children = []
    }

    const newBlock = {
      id: blockData.id || Date.now(),
      type: 'storage_block',
      name: blockData.name,
      sku: blockData.sku || '',
      storage_type: blockData.storage_type || null, // RACK, SHELF_UNIT, CABINET
      column_count: blockData.column_count || null, // RACK인 경우만 사용
      parentId: blockData.parentId,
      expanded: blockData.expanded || false,
      children: [],
    }

    parentNode.children.push(newBlock)
    return newBlock
  }

  // 스토리지 행 추가
  function addStorageRow(rowData) {
    const parentNode = getNodeById(rowData.parentId)
    if (!parentNode) {
      console.error('[PartsManagementStore] Parent node not found:', rowData.parentId)
      return null
    }

    if (!parentNode.children) {
      parentNode.children = []
    }

    const newRow = {
      id: rowData.id || Date.now(),
      type: 'storage_row',
      name: rowData.name,
      sku: rowData.sku || '',
      row_identifier: rowData.row_identifier || '',
      parentId: rowData.parentId,
      expanded: false,
    }

    parentNode.children.push(newRow)
    return newRow
  }

  // 셀 선택
  function setSelectedCellIndex(cellIndex) {
    selectedCellIndex.value = cellIndex
  }

  // 셀 선택 해제
  function clearSelectedCellIndex() {
    selectedCellIndex.value = null
  }

  // 빈 선택 (상세 모달용)
  function setSelectedBin(binData, position) {
    selectedBin.value = {
      binData,
      position, // { blockId, rowId, cellIndex }
    }
  }

  // 빈 선택 해제
  function clearSelectedBin() {
    selectedBin.value = null
  }

  // 임시 보관소에 빈 추가
  function addToTemporaryBins(binData) {
    temporaryBins.value.push({
      id: binData.id || Date.now(),
      originalPosition: binData.originalPosition, // { blockId, rowId, cellIndex }
      binData: binData.binData, // 빈의 실제 데이터
      addedAt: new Date().toISOString(),
    })
    saveTemporaryBinsToStorage()
  }

  // 임시 보관소에서 빈 제거 (복원용)
  function removeFromTemporaryBins(binId) {
    const index = temporaryBins.value.findIndex((bin) => bin.id === binId)
    if (index !== -1) {
      temporaryBins.value.splice(index, 1)
      saveTemporaryBinsToStorage()
    }
  }

  // 임시 보관소에서 빈 완전 삭제
  function deleteBinFromTemporary(binId) {
    const bin = temporaryBins.value.find((b) => b.id === binId)
    if (!bin) {
      console.warn('[PartsManagementStore] Bin not found in temporary storage:', binId)
      return false
    }

    // 임시 보관소에서 제거
    const index = temporaryBins.value.findIndex((b) => b.id === binId)
    if (index !== -1) {
      temporaryBins.value.splice(index, 1)
      saveTemporaryBinsToStorage()
      // TODO: 필요시 데이터베이스에서도 삭제하는 로직 추가
      return true
    }

    return false
  }

  // 임시 보관소 비우기
  function clearTemporaryBins() {
    temporaryBins.value = []
    saveTemporaryBinsToStorage()
  }

  // 셀 키 생성 (blockId-rowId-cellIndex)
  function getCellKey(blockId, rowId, cellIndex) {
    return `${blockId}-${rowId}-${cellIndex}`
  }

  // 셀 데이터 가져오기
  function getCellData(blockId, rowId, cellIndex) {
    const key = getCellKey(blockId, rowId, cellIndex)
    return cellDataMap.value.get(key) || null
  }

  // 셀 데이터 설정
  function setCellData(blockId, rowId, cellIndex, binData) {
    const key = getCellKey(blockId, rowId, cellIndex)
    const block = getNodeById(blockId)

    // SHELF_UNIT/CABINET 타입이고 부품함을 추가하는 경우 높이 자동 조정
    if (
      binData &&
      block &&
      (block.storage_type === 'SHELF_UNIT' || block.storage_type === 'CABINET')
    ) {
      // 부품함 높이 가져오기 (binData에서 직접 또는 bin_model_id로 조회)
      const binHeight = binData.height_mm || 100 // TODO: 실제로는 bin_model에서 가져와야 함

      // 선반 높이 자동 조정
      const adjustResult = updateRowHeightForBin(blockId, rowId, binHeight)

      if (!adjustResult.success) {
        // 높이 조정 실패 시 경고 (하지만 부품함은 추가됨)
        console.warn('[PartsManagementStore] Row height adjustment failed:', adjustResult.message)
        // TODO: 사용자에게 피드백 표시 (Quasar Notify 등)
      }
    }

    if (binData) {
      cellDataMap.value.set(key, binData)
    } else {
      cellDataMap.value.delete(key)

      // 부품함 제거 시 선반 높이 재계산 (가장 높은 부품함 기준)
      if (block && (block.storage_type === 'SHELF_UNIT' || block.storage_type === 'CABINET')) {
        const maxBinHeight = getMaxBinHeightInRow(blockId, rowId)
        if (maxBinHeight > 0) {
          updateRowHeightForBin(blockId, rowId, maxBinHeight)
        }
      }
    }

    // localStorage에 저장
    saveCellDataToStorage()
  }

  // 셀 간 스와핑
  function swapCells(
    sourceBlockId,
    sourceRowId,
    sourceCellIndex,
    targetBlockId,
    targetRowId,
    targetCellIndex,
  ) {
    const sourceData = getCellData(sourceBlockId, sourceRowId, sourceCellIndex)
    const targetData = getCellData(targetBlockId, targetRowId, targetCellIndex)

    // 스와핑
    setCellData(sourceBlockId, sourceRowId, sourceCellIndex, targetData)
    setCellData(targetBlockId, targetRowId, targetCellIndex, sourceData)
  }

  // 임시 보관소에서 원래 위치로 복원
  function restoreBinFromTemporary(binId) {
    const bin = temporaryBins.value.find((b) => b.id === binId)
    if (!bin || !bin.originalPosition) {
      console.warn('[PartsManagementStore] Bin not found or missing originalPosition:', binId)
      return false
    }

    const { blockId, rowId, cellIndex } = bin.originalPosition

    // cellIndex 문자열 파싱 (예: "1-1" -> colIndex = 0)
    // 형식: "층수-칸수" (1-based) -> colIndex는 0-based
    let colIndex = 0
    if (cellIndex && typeof cellIndex === 'string') {
      const parts = cellIndex.split('-')
      if (parts.length >= 2) {
        // 칸수 부분을 사용 (1-based -> 0-based)
        colIndex = parseInt(parts[1], 10) - 1
        if (isNaN(colIndex) || colIndex < 0) {
          colIndex = 0
        }
      }
    }

    // 원래 위치에 현재 빈이 있는지 확인
    const currentCellData = getCellData(blockId, rowId, colIndex)

    if (currentCellData) {
      // 원래 위치에 빈이 있으면 스와핑
      // 기존 빈을 임시 보관소로 이동
      addToTemporaryBins({
        binData: currentCellData,
        originalPosition: {
          blockId,
          rowId,
          cellIndex,
        },
      })
    }

    // 복원할 빈을 원래 위치에 배치
    setCellData(blockId, rowId, colIndex, bin.binData)

    // 임시 보관소에서 제거
    removeFromTemporaryBins(binId)

    return true
  }

  // 선반 높이 관리 상수
  const SHELF_HEIGHT_MARGIN = 20 // mm (여유 공간)
  const MIN_ROW_HEIGHT = 100 // mm (최소 층 높이)

  // 특정 층의 모든 부품함 중 가장 높은 높이 가져오기
  function getMaxBinHeightInRow(blockId, rowId) {
    const block = getNodeById(blockId)
    if (!block || (block.storage_type !== 'SHELF_UNIT' && block.storage_type !== 'CABINET')) {
      return 0
    }

    // SHELF_UNIT은 cellIndex=0만 사용 (현재 구조)
    const binData = getCellData(blockId, rowId, 0)
    if (!binData) {
      return 0
    }

    // TODO: 실제로는 binData에서 bin_model_id를 가져와서 bin_model의 height_mm을 조회해야 함
    // 현재는 임시로 기본값 사용
    return binData.height_mm || 100 // 기본값 100mm
  }

  // 전체 블록의 현재 높이 합계 계산
  function getTotalBlockHeight(blockId) {
    const block = getNodeById(blockId)
    if (!block || !block.children) {
      return 0
    }

    const rows = block.children.filter((child) => child.type === 'storage_row')
    return rows.reduce((sum, row) => {
      return sum + (row.height_mm || MIN_ROW_HEIGHT)
    }, 0)
  }

  // 선반 높이 증가 가능 여부 검사
  function canIncreaseRowHeight(blockId, rowId, requiredHeight) {
    const block = getNodeById(blockId)
    if (!block || (block.storage_type !== 'SHELF_UNIT' && block.storage_type !== 'CABINET')) {
      return { canIncrease: false, reason: 'RACK 타입은 지원하지 않습니다' }
    }

    const blockHeight = block.height_mm || 2000 // 기본값 2000mm
    const rows = block.children.filter((child) => child.type === 'storage_row')
    const currentRow = rows.find((r) => r.id === rowId)

    if (!currentRow) {
      return { canIncrease: false, reason: '해당 층을 찾을 수 없습니다' }
    }

    // 현재 층 높이
    const currentRowHeight = currentRow.height_mm || MIN_ROW_HEIGHT
    const newRowHeight = requiredHeight + SHELF_HEIGHT_MARGIN

    // 높이 차이
    const heightDiff = newRowHeight - currentRowHeight

    if (heightDiff <= 0) {
      return { canIncrease: true, reason: '높이 증가 불필요' }
    }

    // 현재 전체 높이
    const currentTotalHeight = getTotalBlockHeight(blockId)

    // 다른 층들의 최소 높이 합계
    const otherRowsMinHeight = (rows.length - 1) * MIN_ROW_HEIGHT

    // 새로운 전체 높이
    const newTotalHeight = currentTotalHeight + heightDiff

    // 전체 높이 제한 검사
    if (newTotalHeight > blockHeight) {
      return {
        canIncrease: false,
        reason: `전체 높이 제한 초과 (${newTotalHeight}mm > ${blockHeight}mm)`,
        maxHeight: blockHeight - (currentTotalHeight - currentRowHeight) - otherRowsMinHeight,
      }
    }

    // 다른 층들이 최소 높이를 유지할 수 있는지 검사
    const otherRowsCurrentHeight = currentTotalHeight - currentRowHeight
    const otherRowsAvailableHeight = blockHeight - newRowHeight

    if (otherRowsAvailableHeight < otherRowsMinHeight) {
      return {
        canIncrease: false,
        reason: `다른 층의 최소 높이를 유지할 수 없습니다 (필요: ${otherRowsMinHeight}mm, 사용 가능: ${otherRowsAvailableHeight}mm)`,
        maxHeight: blockHeight - otherRowsMinHeight - otherRowsCurrentHeight,
      }
    }

    return { canIncrease: true, heightDiff, newRowHeight }
  }

  // 선반 높이 자동 조정
  function adjustRowHeight(blockId, rowId, binHeight) {
    const result = canIncreaseRowHeight(blockId, rowId, binHeight)

    if (!result.canIncrease) {
      return {
        success: false,
        message: result.reason,
        maxHeight: result.maxHeight,
      }
    }

    const block = getNodeById(blockId)
    const rows = block.children.filter((child) => child.type === 'storage_row')
    const currentRow = rows.find((r) => r.id === rowId)

    if (!currentRow) {
      return { success: false, message: '해당 층을 찾을 수 없습니다' }
    }

    // 높이 증가가 필요한 경우
    if (result.heightDiff && result.heightDiff > 0) {
      const oldHeight = currentRow.height_mm || MIN_ROW_HEIGHT
      currentRow.height_mm = result.newRowHeight

      // 다른 층들 높이 조정 (비율 유지)
      adjustOtherRowsHeight(blockId, rowId, result.heightDiff)

      return {
        success: true,
        oldHeight,
        newHeight: result.newRowHeight,
        message: `선반 높이가 ${oldHeight}mm에서 ${result.newHeight}mm로 조정되었습니다`,
      }
    }

    return { success: true, message: '높이 조정 불필요' }
  }

  // 다른 층들의 높이 비율 조정
  function adjustOtherRowsHeight(blockId, excludedRowId, heightDiff) {
    const block = getNodeById(blockId)
    const rows = block.children.filter((child) => child.type === 'storage_row')
    const otherRows = rows.filter((r) => r.id !== excludedRowId)

    if (otherRows.length === 0) {
      return
    }

    // 현재 다른 층들의 높이 합계
    const totalOtherHeight = otherRows.reduce((sum, row) => {
      return sum + (row.height_mm || MIN_ROW_HEIGHT)
    }, 0)

    if (totalOtherHeight <= 0) {
      return
    }

    // 비율에 따라 높이 분배
    otherRows.forEach((row) => {
      const currentHeight = row.height_mm || MIN_ROW_HEIGHT
      const ratio = currentHeight / totalOtherHeight
      const newHeight = Math.max(currentHeight - heightDiff * ratio, MIN_ROW_HEIGHT)

      row.height_mm = newHeight
    })
  }

  // 부품함 추가/변경 시 선반 높이 자동 조정
  function updateRowHeightForBin(blockId, rowId, binHeight) {
    if (!binHeight || binHeight <= 0) {
      return { success: true, message: '부품함 높이가 없습니다' }
    }

    return adjustRowHeight(blockId, rowId, binHeight)
  }

  // 새 부품함 생성
  function createBin(blockId, rowId, cellIndex, binData = {}) {
    const block = getNodeById(blockId)
    const row = getNodeById(rowId)

    if (!block || !row) {
      return { success: false, message: '블록 또는 층을 찾을 수 없습니다' }
    }

    // 선반 타입이 아닌 경우에만 위치 중복 체크 (렉형은 정확한 위치 필요)
    const isShelfType = block.storage_type === 'SHELF_UNIT' || block.storage_type === 'CABINET'
    if (!isShelfType) {
      // 이미 해당 위치에 빈이 있는지 확인
      const existingBin = getCellData(blockId, rowId, cellIndex)
      if (existingBin) {
        return { success: false, message: '이 위치에는 이미 부품함이 있습니다' }
      }
    } else {
      // 선반 타입인 경우, 지정된 위치에 빈이 있으면 다음 사용 가능한 위치 찾기
      const existingBin = getCellData(blockId, rowId, cellIndex)
      if (existingBin) {
        // 다음 사용 가능한 위치 찾기 (최대 20개까지)
        let foundEmptySlot = false
        for (let i = cellIndex + 1; i < 20; i++) {
          const nextBin = getCellData(blockId, rowId, i)
          if (!nextBin) {
            cellIndex = i
            foundEmptySlot = true
            break
          }
        }
        // 모든 위치가 차있으면 마지막 위치에 추가
        if (!foundEmptySlot) {
          cellIndex = 20
        }
      }
    }

    // 기본 빈 데이터 생성
    const timestamp = Date.now()
    const defaultBinData = {
      sku: binData.sku || `BIN-${blockId}-${rowId}-${timestamp}`,
      name: binData.name || `부품함 ${row.row_identifier || cellIndex}`,
      height_mm: binData.height_mm || 100, // 기본 높이 100mm
      width_mm: binData.width_mm || null,
      depth_mm: binData.depth_mm || null,
      created_at: new Date().toISOString(),
      ...binData, // 사용자 제공 데이터로 덮어쓰기
    }

    // 셀 데이터 설정 (높이 자동 조정 포함)
    setCellData(blockId, rowId, cellIndex, defaultBinData)

    return {
      success: true,
      message: '부품함이 생성되었습니다',
      binData: defaultBinData,
    }
  }

  // 공간 순서 변경 (최상단 공간만)
  function reorderSpaces(fromIndex, toIndex) {
    if (fromIndex === toIndex) {
      return { success: false, message: '같은 위치로 이동할 수 없습니다' }
    }

    if (fromIndex < 0 || fromIndex >= spaces.value.length) {
      return { success: false, message: '유효하지 않은 시작 위치입니다' }
    }

    if (toIndex < 0 || toIndex >= spaces.value.length) {
      return { success: false, message: '유효하지 않은 목표 위치입니다' }
    }

    // 배열에서 요소를 제거하고 새 위치에 삽입
    const [movedSpace] = spaces.value.splice(fromIndex, 1)
    spaces.value.splice(toIndex, 0, movedSpace)

    return { success: true, message: '순서가 변경되었습니다' }
  }

  // 빈 모델 추가
  function addBinModel(modelData) {
    // SKU 중복 확인
    const existingModel = binModels.value.find((m) => m.sku === modelData.sku)
    if (existingModel) {
      return { success: false, message: '이미 존재하는 SKU입니다' }
    }

    const newModel = {
      id: Date.now(), // 임시 ID
      name: modelData.name,
      sku: modelData.sku,
      width_mm: modelData.width_mm,
      depth_mm: modelData.depth_mm,
      height_mm: modelData.height_mm,
      material: modelData.material || null,
      color: modelData.color || null,
      description: modelData.description || null,
      created_at: new Date().toISOString(),
    }

    binModels.value.push(newModel)
    saveBinModelsToStorage()

    return { success: true, message: '모델이 추가되었습니다', model: newModel }
  }

  // 빈 모델 수정
  function updateBinModel(modelId, updates) {
    const modelIndex = binModels.value.findIndex((m) => m.id === modelId)
    if (modelIndex === -1) {
      return { success: false, message: '모델을 찾을 수 없습니다' }
    }

    // SKU 중복 확인 (자기 자신 제외)
    if (updates.sku) {
      const existingModel = binModels.value.find((m) => m.sku === updates.sku && m.id !== modelId)
      if (existingModel) {
        return { success: false, message: '이미 존재하는 SKU입니다' }
      }
    }

    binModels.value[modelIndex] = {
      ...binModels.value[modelIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    }

    saveBinModelsToStorage()

    return { success: true, message: '모델이 수정되었습니다', model: binModels.value[modelIndex] }
  }

  // 빈 모델 삭제
  function deleteBinModel(modelId) {
    const modelIndex = binModels.value.findIndex((m) => m.id === modelId)
    if (modelIndex === -1) {
      return { success: false, message: '모델을 찾을 수 없습니다' }
    }

    // TODO: 이 모델을 사용하는 빈이 있는지 확인 (나중에 구현)
    // const binsUsingModel = getBinsUsingModel(modelId)
    // if (binsUsingModel.length > 0) {
    //   return { success: false, message: `이 모델을 사용하는 빈이 ${binsUsingModel.length}개 있습니다` }
    // }

    binModels.value.splice(modelIndex, 1)
    saveBinModelsToStorage()

    return { success: true, message: '모델이 삭제되었습니다' }
  }

  // 빈 모델 ID로 조회
  function getBinModelById(modelId) {
    return binModels.value.find((m) => m.id === modelId) || null
  }

  // 빈 모델 순서 변경
  function reorderBinModels(fromIndex, toIndex) {
    if (fromIndex === toIndex) {
      return { success: false, message: '같은 위치로 이동할 수 없습니다' }
    }

    if (fromIndex < 0 || fromIndex >= binModels.value.length) {
      return { success: false, message: '유효하지 않은 시작 위치입니다' }
    }

    if (toIndex < 0 || toIndex >= binModels.value.length) {
      return { success: false, message: '유효하지 않은 목표 위치입니다' }
    }

    // 배열에서 요소를 제거하고 새 위치에 삽입
    const [movedModel] = binModels.value.splice(fromIndex, 1)
    binModels.value.splice(toIndex, 0, movedModel)

    saveBinModelsToStorage()

    return { success: true, message: '순서가 변경되었습니다' }
  }

  return {
    spaces,
    selectedStorageRow,
    selectedStorageBlock,
    selectedCellIndex,
    getRootNodes,
    getChildNodes,
    updateNode,
    setSelectedStorageRow,
    setSelectedStorageBlock,
    setSelectedCellIndex,
    clearSelectedCellIndex,
    selectedBin,
    setSelectedBin,
    clearSelectedBin,
    getNodeById,
    removeNode,
    addSpace,
    addStorageBlock,
    addStorageRow,
    temporaryBins,
    addToTemporaryBins,
    removeFromTemporaryBins,
    deleteBinFromTemporary,
    clearTemporaryBins,
    cellDataMap,
    getCellData,
    setCellData,
    swapCells,
    getCellKey,
    restoreBinFromTemporary,
    // 선반 높이 관리
    getMaxBinHeightInRow,
    getTotalBlockHeight,
    canIncreaseRowHeight,
    adjustRowHeight,
    updateRowHeightForBin,
    SHELF_HEIGHT_MARGIN,
    MIN_ROW_HEIGHT,
    // 빈 생성
    createBin,
    // 빈 모델 관리
    binModels,
    addBinModel,
    updateBinModel,
    deleteBinModel,
    getBinModelById,
    reorderBinModels,
    // 공간 순서 변경
    reorderSpaces,
    // 사이드바 모드
    sidebarMode,
    setSidebarMode,
    // 부품 데이터 관리 뷰
    selectedPartsDataView,
    setSelectedPartsDataView,
    clearSelectedPartsDataView,
  }
})
