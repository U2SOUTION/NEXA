/**
 * Performance Storage
 * localStorage 기반 성능 히스토리 저장소
 */

const STORAGE_KEY = 'performance-monitor-history'
const MAX_DAYS_TO_KEEP = 30 // 기본 30일 보관

/**
 * 성능 데이터 저장
 * @param {Object} data - 성능 데이터
 */
export function savePerformanceData(data) {
  try {
    const history = getPerformanceHistory()
    const today = new Date().toISOString().split('T')[0]
    
    if (!history[today]) {
      history[today] = {
        date: today,
        metrics: [],
        summary: null,
      }
    }

    history[today].metrics.push(data)

    // 일일 요약 업데이트
    history[today].summary = calculateDailySummary(history[today].metrics)

    // 오래된 데이터 정리
    clearOldData()

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch (error) {
    console.error('[PerformanceStorage] Failed to save performance data:', error)
  }
}

/**
 * 성능 히스토리 조회
 * @param {string} startDate - 시작 날짜 (YYYY-MM-DD)
 * @param {string} endDate - 종료 날짜 (YYYY-MM-DD)
 * @returns {Object} 성능 히스토리
 */
export function getPerformanceHistory(startDate = null, endDate = null) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return {}
    }

    const history = JSON.parse(stored)

    if (!startDate && !endDate) {
      return history
    }

    const filtered = {}
    Object.keys(history).forEach(date => {
      if ((!startDate || date >= startDate) && (!endDate || date <= endDate)) {
        filtered[date] = history[date]
      }
    })

    return filtered
  } catch (error) {
    console.error('[PerformanceStorage] Failed to get performance history:', error)
    return {}
  }
}

/**
 * 일일 요약 계산
 * @param {Array} metrics - 일일 메트릭 배열
 * @returns {Object} 일일 요약
 */
function calculateDailySummary(metrics) {
  if (metrics.length === 0) {
    return null
  }

  const fpsValues = metrics.filter(m => m.frontend?.fps).map(m => m.frontend.fps)
  const memoryValues = metrics.filter(m => m.frontend?.memory?.usedJSHeapSize).map(m => m.frontend.memory.usedJSHeapSize)
  const lcpValues = metrics.filter(m => m.frontend?.webVitals?.lcp?.value).map(m => m.frontend.webVitals.lcp.value)
  const apiDurations = metrics.flatMap(m => m.api?.requests?.map(r => r.duration) || [])

  return {
    avgFPS: fpsValues.length > 0 ? fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length : 0,
    avgMemory: memoryValues.length > 0 ? memoryValues.reduce((a, b) => a + b, 0) / memoryValues.length : 0,
    avgLCP: lcpValues.length > 0 ? lcpValues.reduce((a, b) => a + b, 0) / lcpValues.length : 0,
    avgAPIDuration: apiDurations.length > 0 ? apiDurations.reduce((a, b) => a + b, 0) / apiDurations.length : 0,
    totalRequests: apiDurations.length,
  }
}

/**
 * 오래된 데이터 삭제
 * @param {number} daysToKeep - 보관할 일수
 */
export function clearOldData(daysToKeep = MAX_DAYS_TO_KEEP) {
  try {
    const history = getPerformanceHistory()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
    const cutoffDateString = cutoffDate.toISOString().split('T')[0]

    const filtered = {}
    Object.keys(history).forEach(date => {
      if (date >= cutoffDateString) {
        filtered[date] = history[date]
      }
    })

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('[PerformanceStorage] Failed to clear old data:', error)
  }
}

/**
 * 모든 성능 히스토리 삭제
 */
export function clearAllHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('[PerformanceStorage] Failed to clear all history:', error)
  }
}

/**
 * 저장소 사용량 확인
 * @returns {Object} 저장소 사용량 정보
 */
export function getStorageInfo() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return {
        size: 0,
        days: 0,
        totalMetrics: 0,
      }
    }

    const history = JSON.parse(stored)
    const days = Object.keys(history).length
    const totalMetrics = Object.values(history).reduce((sum, day) => sum + (day.metrics?.length || 0), 0)

    return {
      size: new Blob([stored]).size, // bytes
      days,
      totalMetrics,
    }
  } catch (error) {
    console.error('[PerformanceStorage] Failed to get storage info:', error)
    return null
  }
}

