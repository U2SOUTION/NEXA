/**
 * Performance Storage
 * localStorage 기반 성능 히스토리 저장소
 */

const STORAGE_KEY = 'performance-monitor-history'
const MAX_DAYS_TO_KEEP = 30

export interface DailyHistoryEntry {
  date: string
  metrics: unknown[]
  summary: DailySummary | null
}

export interface DailySummary {
  avgFPS: number
  avgMemory: number
  avgLCP: number
  avgAPIDuration: number
  totalRequests: number
}

export function savePerformanceData(data: unknown): void {
  try {
    const history = getPerformanceHistory() as Record<string, DailyHistoryEntry>
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
    history[today].summary = calculateDailySummary(history[today].metrics as MetricRecord[])

    // 오래된 데이터 정리
    clearOldData()

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch (error) {
    console.error('[PerformanceStorage] Failed to save performance data:', error)
  }
}

export function getPerformanceHistory(startDate: string | null = null, endDate: string | null = null): Record<string, DailyHistoryEntry> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return {}
    }

    const history = JSON.parse(stored) as Record<string, DailyHistoryEntry>

    if (!startDate && !endDate) {
      return history
    }

    const filtered: Record<string, DailyHistoryEntry> = {}
    Object.keys(history).forEach((date) => {
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

interface MetricRecord {
  frontend?: { fps?: number; memory?: { usedJSHeapSize?: number }; webVitals?: { lcp?: { value?: number } } }
  api?: { requests?: Array<{ duration?: number }> }
}

function calculateDailySummary(metrics: MetricRecord[]): DailySummary | null {
  if (metrics.length === 0) {
    return null
  }

  const fpsValues = metrics.filter((m) => m.frontend?.fps != null).map((m) => m.frontend!.fps!)
  const memoryValues = metrics.filter((m) => m.frontend?.memory?.usedJSHeapSize != null).map((m) => m.frontend!.memory!.usedJSHeapSize!)
  const lcpValues = metrics.filter((m) => m.frontend?.webVitals?.lcp?.value != null).map((m) => m.frontend!.webVitals!.lcp!.value!)
  const apiDurations = metrics.flatMap((m) => m.api?.requests?.map((r) => r.duration) ?? []).filter((d): d is number => typeof d === 'number')

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
export function clearOldData(daysToKeep = MAX_DAYS_TO_KEEP): void {
  try {
    const history = getPerformanceHistory()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
    const cutoffDateString = cutoffDate.toISOString().split('T')[0]

    const filtered: Record<string, DailyHistoryEntry> = {}
    Object.keys(history).forEach((date) => {
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

    const history = JSON.parse(stored) as Record<string, DailyHistoryEntry>
    const days = Object.keys(history).length
    const totalMetrics = Object.values(history).reduce((sum: number, day: DailyHistoryEntry) => sum + (day.metrics?.length ?? 0), 0)

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

