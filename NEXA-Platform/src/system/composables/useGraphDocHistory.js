/**
 * useGraphDocHistory.js
 * GraphDoc 통합 히스토리 관리 Composable
 *
 * 기능:
 * - 모든 다이어그램 타입의 히스토리 통합 관리
 * - 뒤로가기/앞으로가기 기능
 * - 현재 위치 추적
 * - localStorage에 히스토리 저장/로드
 * - 확장 가능한 메타데이터 구조
 */

import { ref, computed } from 'vue'

const STORAGE_KEY = 'graph-doc-history'
const MAX_HISTORY_SIZE = 100 // 기획서 기준 100개로 증가

/**
 * 히스토리 항목 구조 (최소 정보만 저장, 클릭 시 재분석)
 * @typedef {Object} HistoryItem
 * @property {string} id - 고유 ID
 * @property {string} diagramType - 다이어그램 타입 (예: 'dependencyGraph', 'dependencyAnalysis', 'fileStructure')
 * @property {string} target - 분석 대상 (URL 또는 파일 경로) - 이것만으로 재분석 가능
 * @property {string} title - 간단한 제목 (파일명)
 * @property {string} displayName - 사용자 친화적 표시명 (자동 생성)
 * @property {number} timestamp - 분석 시간 (timestamp)
 * @property {Object} metadata - 표시용 메타데이터 (클릭 시 재계산됨)
 * @property {number} metadata.nodeCount - 노드 수 (표시용)
 * @property {number} metadata.edgeCount - 엣지 수 (표시용)
 * @property {string} [metadata.fileName] - 파일명 (표시용)
 * @property {string} [metadata.comment] - 주석 (표시용, 클릭 시 재읽음)
 * 
 * @note 클릭 시 target을 사용하여 실제 파일에서 다시 분석함
 * @note graphData, settings는 저장하지 않음 (실시간성 보장)
 */

/**
 * 표시명 생성 헬퍼 함수
 * @param {Object} item - 히스토리 항목 데이터
 * @param {string} item.target - 분석 대상
 * @param {string} [item.diagramType] - 다이어그램 타입
 * @param {Object} [item.metadata] - 메타데이터
 * @returns {string} 표시명
 */
export function generateHistoryDisplayName(item) {
  const { target, diagramType, metadata = {} } = item

  // 1. 파일명 추출
  let fileName = metadata.fileName
  if (!fileName && target) {
    // 경로에서 파일명 추출
    if (target.includes('/')) {
      const parts = target.split('/')
      fileName = parts[parts.length - 1]
      // 확장자 제거 (선택적)
      if (fileName.includes('.')) {
        fileName = fileName.split('.')[0]
      }
    } else {
      fileName = target
    }
  }

  // 2. 추가 정보 수집
  const infoParts = []

  // 주석 정보 (가장 먼저 표시)
  if (metadata.comment) {
    // 주석이 너무 길면 자르기
    const comment = metadata.comment.length > 30 
      ? metadata.comment.substring(0, 30) + '...' 
      : metadata.comment
    infoParts.push(comment)
  }

  // 노드/엣지 수 정보
  if (metadata.nodeCount !== undefined || metadata.edgeCount !== undefined) {
    const nodeCount = metadata.nodeCount || 0
    const edgeCount = metadata.edgeCount || 0
    if (nodeCount > 0 || edgeCount > 0) {
      infoParts.push(`${nodeCount}노드/${edgeCount}엣지`)
    }
  }

  // 다이어그램 타입 정보 (간단한 형태)
  if (diagramType) {
    const typeLabels = {
      dependencyGraph: '파일의존',
      dependencyAnalysis: '패키지의존',
      fileStructure: '파일구조',
      codeSearch: '코드검색',
    }
    const typeLabel = typeLabels[diagramType] || diagramType
    if (typeLabel) {
      infoParts.push(typeLabel)
    }
  }

  // 3. 표시명 조합
  let displayName = fileName || target || '알 수 없음'

  // 추가 정보가 있으면 괄호로 추가
  if (infoParts.length > 0) {
    displayName += ` (${infoParts.join(', ')})`
  }

  return displayName
}

// 싱글톤 패턴: 모든 컴포넌트가 동일한 히스토리 인스턴스를 공유
const history = ref([])
const currentIndex = ref(-1)
let isInitialized = false

export function useGraphDocHistory() {

  // 초기화: localStorage에서 히스토리 로드
  function loadHistory() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        
        // 버전 호환성: 이전 버전 데이터 마이그레이션
        if (parsed.version === undefined) {
          // 이전 버전 데이터 마이그레이션
          history.value = migrateLegacyHistory(parsed.history || [])
        } else {
          history.value = parsed.history || []
        }
        
        currentIndex.value = parsed.currentIndex ?? -1
        
        // 유효성 검사: currentIndex가 범위를 벗어나면 조정
        if (currentIndex.value >= history.value.length) {
          currentIndex.value = history.value.length - 1
        }
        if (currentIndex.value < -1) {
          currentIndex.value = -1
        }

        // 표시명 자동 생성 (이전 데이터에 없을 수 있음)
        history.value.forEach(item => {
          if (!item.displayName) {
            item.displayName = generateHistoryDisplayName(item)
          }
        })
      }
    } catch (error) {
      console.error('[useGraphDocHistory] 히스토리 로드 실패:', error)
      history.value = []
      currentIndex.value = -1
    }
  }

  // 이전 버전 데이터 마이그레이션
  function migrateLegacyHistory(legacyHistory) {
    return legacyHistory.map(item => {
      // 이전 버전에는 diagramType이 없을 수 있음
      if (!item.diagramType) {
        // 기본값: dependencyGraph (가장 많이 사용)
        item.diagramType = 'dependencyGraph'
      }

      // metadata 구조 변환
      if (!item.metadata) {
        item.metadata = {
          nodeCount: item.nodeCount || 0,
          edgeCount: item.edgeCount || 0,
        }
        // 이전 필드 제거
        delete item.nodeCount
        delete item.edgeCount
      }

      // displayName 생성
      if (!item.displayName) {
        item.displayName = generateHistoryDisplayName(item)
      }

      return item
    })
  }

  // 히스토리 저장
  function saveHistory() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: '2.0', // 버전 정보 추가
        history: history.value,
        currentIndex: currentIndex.value,
      }))
    } catch (error) {
      console.error('[useGraphDocHistory] 히스토리 저장 실패:', error)
    }
  }

  // 히스토리에 항목 추가
  /**
   * @param {Object} item - 히스토리 항목
   * @param {string} item.diagramType - 다이어그램 타입 (필수)
   * @param {string} item.target - 분석 대상 (필수)
   * @param {Object} [item.metadata] - 메타데이터 (표시용, 클릭 시 재계산됨)
   * @param {number} [item.metadata.nodeCount] - 노드 수 (표시용)
   * @param {number} [item.metadata.edgeCount] - 엣지 수 (표시용)
   * @param {string} [item.metadata.comment] - 주석 (표시용, 클릭 시 재읽음)
   * @param {string} [item.metadata.fileName] - 파일명 (표시용)
   */
  function addToHistory(item) {
    if (!item.diagramType || !item.target) {
      console.warn('[useGraphDocHistory] diagramType과 target은 필수입니다.')
      return
    }

    // 파일명 추출 (표시용)
    let fileName = item.metadata?.fileName
    if (!fileName && item.target) {
      if (item.target.includes('/')) {
        const parts = item.target.split('/')
        fileName = parts[parts.length - 1]
        // 확장자 제거
        if (fileName.includes('.')) {
          fileName = fileName.split('.')[0]
        }
      } else {
        fileName = item.target
      }
    }

    // 최소한의 메타데이터만 저장 (표시용, 클릭 시 재계산)
    const metadata = {
      // 표시용 정보만 저장 (클릭 시 실제 파일에서 다시 읽어옴)
      nodeCount: item.metadata?.nodeCount || 0, // 표시용
      edgeCount: item.metadata?.edgeCount || 0, // 표시용
      fileName: fileName, // 표시용
      comment: item.metadata?.comment || null, // 표시용 (클릭 시 재읽음)
    }

    const historyItem = {
      id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      diagramType: item.diagramType,
      target: item.target, // 이것만으로 재분석 가능
      title: fileName || item.target, // 간단한 제목
      displayName: item.displayName || generateHistoryDisplayName({
        target: item.target,
        diagramType: item.diagramType,
        metadata,
      }),
      timestamp: Date.now(),
      metadata, // 최소한의 표시용 정보만 저장
      // graphData, settings는 저장하지 않음 (클릭 시 재분석)
    }

    // 현재 위치 이후의 항목 제거 (앞으로가기 스택 제거)
    if (currentIndex.value >= 0 && currentIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, currentIndex.value + 1)
    }

    // 새 항목 추가
    history.value.push(historyItem)

    // 최대 크기 제한
    if (history.value.length > MAX_HISTORY_SIZE) {
      history.value.shift() // 오래된 항목 제거
      // currentIndex 조정 불필요 (항상 마지막에 추가하므로)
    }

    // 현재 위치를 새 항목으로 설정
    currentIndex.value = history.value.length - 1

    // 저장
    saveHistory()
  }

  // 뒤로가기
  function goBack() {
    if (canGoBack.value) {
      currentIndex.value--
      saveHistory()
      return getCurrentHistoryItem()
    }
    return null
  }

  // 앞으로가기
  function goForward() {
    if (canGoForward.value) {
      currentIndex.value++
      saveHistory()
      return getCurrentHistoryItem()
    }
    return null
  }

  // 현재 히스토리 항목 가져오기
  function getCurrentHistoryItem() {
    if (currentIndex.value >= 0 && currentIndex.value < history.value.length) {
      return history.value[currentIndex.value]
    }
    return null
  }

  // 특정 히스토리 항목으로 이동
  function goToHistoryItem(index) {
    if (index >= 0 && index < history.value.length) {
      currentIndex.value = index
      saveHistory()
      return getCurrentHistoryItem()
    }
    return null
  }

  // 다이어그램 타입별 히스토리 필터링
  function getHistoryByDiagramType(diagramType) {
    return history.value.filter(item => item.diagramType === diagramType)
  }

  // 히스토리 초기화
  function clearHistory() {
    history.value = []
    currentIndex.value = -1
    saveHistory()
  }

  // 특정 다이어그램 타입의 히스토리만 초기화
  function clearHistoryByDiagramType(diagramType) {
    history.value = history.value.filter(item => item.diagramType !== diagramType)
    
    // currentIndex 조정
    if (currentIndex.value >= history.value.length) {
      currentIndex.value = history.value.length - 1
    }
    
    saveHistory()
  }

  // 히스토리 항목 삭제
  function removeHistoryItem(id) {
    const index = history.value.findIndex(item => item.id === id)
    if (index >= 0) {
      history.value.splice(index, 1)
      
      // currentIndex 조정
      if (currentIndex.value > index) {
        currentIndex.value--
      } else if (currentIndex.value === index) {
        // 현재 항목을 삭제한 경우
        if (currentIndex.value >= history.value.length) {
          currentIndex.value = history.value.length - 1
        }
      }
      
      saveHistory()
    }
  }

  // Computed properties
  const canGoBack = computed(() => {
    return currentIndex.value > 0
  })

  const canGoForward = computed(() => {
    return currentIndex.value >= 0 && currentIndex.value < history.value.length - 1
  })

  const currentPosition = computed(() => {
    if (history.value.length === 0) {
      return { current: 0, total: 0 }
    }
    return {
      current: currentIndex.value + 1,
      total: history.value.length,
    }
  })

  const hasHistory = computed(() => {
    return history.value.length > 0
  })

  // 다이어그램 타입별 히스토리 개수
  const historyByType = computed(() => {
    const grouped = {}
    history.value.forEach(item => {
      if (!grouped[item.diagramType]) {
        grouped[item.diagramType] = []
      }
      grouped[item.diagramType].push(item)
    })
    return grouped
  })

  // 초기 로드 (한 번만 실행)
  if (!isInitialized) {
    loadHistory()
    isInitialized = true
    console.log('[useGraphDocHistory] 히스토리 초기화 완료:', history.value.length, '개')
  }

  return {
    // State
    history,
    currentIndex,
    
    // Computed
    canGoBack,
    canGoForward,
    currentPosition,
    hasHistory,
    historyByType,
    
    // Methods
    addToHistory,
    goBack,
    goForward,
    getCurrentHistoryItem,
    goToHistoryItem,
    getHistoryByDiagramType,
    clearHistory,
    clearHistoryByDiagramType,
    removeHistoryItem,
    loadHistory,
    saveHistory,
    generateHistoryDisplayName, // 외부에서도 사용 가능하도록 export
  }
}
