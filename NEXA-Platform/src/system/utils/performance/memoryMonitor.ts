/**
 * Memory Monitor
 * 주기적 메모리 사용량 추적 및 메모리 누수 감지
 */

export interface MemorySnapshot {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
  timestamp: number
}

let memoryInterval: ReturnType<typeof setInterval> | null = null
let memoryHistory: MemorySnapshot[] = []
let isMonitoring = false
let leakThreshold = 10 * 1024 * 1024
let growthRateThreshold = 0.1

const MAX_HISTORY = 100

export function startMemoryMonitoring(interval = 1000, callback: ((snapshot: MemorySnapshot) => void) | null = null): void {
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

      if (callback != null) {
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
export function collectMemorySnapshot(): MemorySnapshot | null {
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
export function detectMemoryLeak(windowSize = 10): { isLeaking: boolean; growth: number; growthRate: string; initialSize: number; currentSize: number; samples: number } | null {
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
export function getMemoryHistory(): MemorySnapshot[] {
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
export function setLeakThreshold(threshold: number): void {
  leakThreshold = threshold
}

export function setGrowthRateThreshold(rate: number): void {
  growthRateThreshold = rate
}

/**
 * 모니터링 상태 확인
 * @returns {boolean} 모니터링 중 여부
 */
export function isMemoryMonitoring() {
  return isMonitoring
}

