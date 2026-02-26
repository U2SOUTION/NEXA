/**
 * Memory Monitor
 * 주기적 메모리 사용량 추적 및 메모리 누수 감지
 */

let memoryInterval = null
let memoryHistory = []
let isMonitoring = false
let leakThreshold = 10 * 1024 * 1024 // 10MB (메모리 누수 의심 임계값)
let growthRateThreshold = 0.1 // 10% 이상 증가 시 경고

const MAX_HISTORY = 100 // 최대 저장할 메모리 히스토리 수

/**
 * 메모리 모니터링 시작
 * @param {number} interval - 샘플링 간격 (ms, 기본값: 1000ms)
 * @param {Function} callback - 메모리 업데이트 콜백
 */
export function startMemoryMonitoring(interval = 1000, callback = null) {
  if (isMonitoring) {
    return
  }

  if (!performance.memory) {
    console.warn('[MemoryMonitor] performance.memory is not available')
    return
  }

  isMonitoring = true
  memoryHistory = []

  memoryInterval = setInterval(() => {
    const memory = collectMemorySnapshot()

    if (memory) {
      memoryHistory.push(memory)

      // 히스토리 크기 제한
      if (memoryHistory.length > MAX_HISTORY) {
        memoryHistory.shift()
      }

      if (callback) {
        callback(memory)
      }
    }
  }, interval)
}

/**
 * 메모리 모니터링 중지
 */
export function stopMemoryMonitoring() {
  isMonitoring = false
  if (memoryInterval !== null) {
    clearInterval(memoryInterval)
    memoryInterval = null
  }
}

/**
 * 메모리 스냅샷 수집
 * @returns {Object|null} 메모리 스냅샷
 */
export function collectMemorySnapshot() {
  if (!performance.memory) {
    return null
  }

  return {
    usedJSHeapSize: performance.memory.usedJSHeapSize,
    totalJSHeapSize: performance.memory.totalJSHeapSize,
    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
    timestamp: Date.now(),
  }
}

/**
 * 메모리 누수 감지
 * @param {number} windowSize - 분석할 샘플 수 (기본값: 10)
 * @returns {Object|null} 메모리 누수 감지 결과
 */
export function detectMemoryLeak(windowSize = 10) {
  if (memoryHistory.length < windowSize) {
    return null
  }

  const recent = memoryHistory.slice(-windowSize)
  const first = recent[0]
  const last = recent[recent.length - 1]
  
  const growth = last.usedJSHeapSize - first.usedJSHeapSize
  const growthRate = growth / first.usedJSHeapSize

  // 메모리 누수 의심 조건
  const isLeaking = growth > leakThreshold || growthRate > growthRateThreshold

  return {
    isLeaking,
    growth,
    growthRate: (growthRate * 100).toFixed(2) + '%',
    initialSize: first.usedJSHeapSize,
    currentSize: last.usedJSHeapSize,
    samples: recent.length,
  }
}

/**
 * 메모리 히스토리 반환
 * @returns {Array} 메모리 히스토리
 */
export function getMemoryHistory() {
  return [...memoryHistory]
}

/**
 * 메모리 히스토리 초기화
 */
export function clearMemoryHistory() {
  memoryHistory = []
}

/**
 * 메모리 누수 임계값 설정
 * @param {number} threshold - 임계값 (bytes)
 */
export function setLeakThreshold(threshold) {
  leakThreshold = threshold
}

/**
 * 성장률 임계값 설정
 * @param {number} rate - 성장률 (0-1 사이 값)
 */
export function setGrowthRateThreshold(rate) {
  growthRateThreshold = rate
}

/**
 * 모니터링 상태 확인
 * @returns {boolean} 모니터링 중 여부
 */
export function isMemoryMonitoring() {
  return isMonitoring
}

