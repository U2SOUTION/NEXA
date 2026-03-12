/**
 * Web Vitals Collector
 * LCP, FID, CLS 측정
 */

export interface LCPEntry {
  value: number
  element: string
  timestamp: number
}

export interface FIDEntry {
  value: number
  eventType: string
  timestamp: number
}

export interface CLSEntry {
  value: number
  entries: Array<{ value: number; sources: unknown[] }>
  timestamp: number
}

interface WebVitalsDataShape {
  lcp: LCPEntry | null
  fid: FIDEntry | null
  cls: CLSEntry | null
}

let webVitalsData: WebVitalsDataShape = {
  lcp: null,
  fid: null,
  cls: null,
}

let observers: PerformanceObserver[] = []

export function collectLCP(callback?: (entry: LCPEntry) => void): void {
  try {
    const navEntries = performance.getEntriesByType('navigation')
    const navTiming = navEntries[0] as PerformanceNavigationTiming | undefined
    if (navTiming?.loadEventEnd != null && navTiming?.fetchStart != null) {
      const approximateLCP = navTiming.loadEventEnd - navTiming.fetchStart
      if (approximateLCP > 0) {
        const entry: LCPEntry = {
          value: approximateLCP,
          element: 'approximate',
          timestamp: Date.now(),
        }
        webVitalsData.lcp = entry
        callback?.(entry)
      }
    }
  } catch {
    // continue
  }

  if (typeof PerformanceObserver === 'undefined') {
    console.warn('[WebVitalsCollector] PerformanceObserver is not supported')
    return
  }

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      if (entries.length > 0) {
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number; element?: { tagName?: string } }
        const value = lastEntry.renderTime ?? lastEntry.loadTime ?? 0
        const entry: LCPEntry = {
          value,
          element: lastEntry.element?.tagName ?? 'unknown',
          timestamp: Date.now(),
        }
        webVitalsData.lcp = entry
        callback?.(entry)
      }
    })

    observer.observe({ type: 'largest-contentful-paint', buffered: true })
    observers.push(observer)
  } catch (error) {
    console.error('[WebVitalsCollector] Failed to collect LCP:', error)
  }
}

export function collectFID(callback?: (entry: FIDEntry) => void): void {
  if (typeof PerformanceObserver === 'undefined') {
    console.warn('[WebVitalsCollector] PerformanceObserver is not supported')
    return
  }

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        const e = entry as PerformanceEntry & { processingStart?: number; startTime?: number; name?: string }
        if (!webVitalsData.fid && e.processingStart != null && e.startTime != null) {
          const fidEntry: FIDEntry = {
            value: e.processingStart - e.startTime,
            eventType: e.name ?? 'first-input',
            timestamp: Date.now(),
          }
          webVitalsData.fid = fidEntry
          callback?.(fidEntry)
          observer.disconnect()
        }
      })
    })

    observer.observe({ type: 'first-input', buffered: true })
    observers.push(observer)
  } catch (error) {
    console.error('[WebVitalsCollector] Failed to collect FID:', error)
  }
}

interface LayoutShiftEntryExt extends PerformanceEntry {
  hadRecentInput?: boolean
  value?: number
  sources?: Array<{ node?: { tagName?: string }; previousRect?: unknown; currentRect?: unknown }>
}

export function collectCLS(callback?: (entry: CLSEntry) => void): void {
  if (typeof PerformanceObserver === 'undefined') {
    console.warn('[WebVitalsCollector] PerformanceObserver is not supported')
    return
  }

  let clsValue = 0
  const clsEntries: Array<{ value: number; sources: unknown[] }> = []

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        const e = entry as LayoutShiftEntryExt
        if (!e.hadRecentInput && e.value != null) {
          clsValue += e.value
          clsEntries.push({
            value: e.value,
            sources: e.sources?.map((s) => ({
              node: s.node?.tagName ?? 'unknown',
              previousRect: s.previousRect,
              currentRect: s.currentRect,
            })) ?? [],
          })
        }
      })

      const clsEntry: CLSEntry = {
        value: clsValue,
        entries: clsEntries,
        timestamp: Date.now(),
      }
      webVitalsData.cls = clsEntry
      callback?.(clsEntry)
    })

    observer.observe({ type: 'layout-shift', buffered: true })
    observers.push(observer)
  } catch (error) {
    console.error('[WebVitalsCollector] Failed to collect CLS:', error)
  }
}

export function onWebVitals(callback?: (data: WebVitalsDataShape) => void): void {
  collectLCP((lcp) => {
    callback?.({ ...webVitalsData, lcp })
  })
  collectFID((fid) => {
    callback?.({ ...webVitalsData, fid })
  })
  collectCLS((cls) => {
    callback?.({ ...webVitalsData, cls })
  })
}

export function getWebVitals(): WebVitalsDataShape {
  if (!webVitalsData.lcp) {
    try {
      const navEntries = performance.getEntriesByType('navigation')
      const navTiming = navEntries[0] as PerformanceNavigationTiming | undefined
      if (navTiming?.loadEventEnd != null && navTiming?.fetchStart != null) {
        const approximateLCP = navTiming.loadEventEnd - navTiming.fetchStart
        if (approximateLCP > 0) {
          webVitalsData.lcp = {
            value: approximateLCP,
            element: 'approximate',
            timestamp: Date.now(),
          }
        }
      }
    } catch {
      // ignore
    }
  }
  return { ...webVitalsData }
}

/**
 * Web Vitals 데이터 초기화
 */
export function clearWebVitals() {
  webVitalsData = {
    lcp: null,
    fid: null,
    cls: null,
  }

  // 모든 observer 중지
  observers.forEach((observer) => observer.disconnect())
  observers = []
}

type WebVitalMetricKey = 'lcp' | 'fid' | 'cls'

export function evaluateWebVital(metric: WebVitalMetricKey, value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return 'unknown'
  }

  const thresholds: Record<WebVitalMetricKey, { good: number; poor: number }> = {
    lcp: { good: 2500, poor: 4000 },
    fid: { good: 100, poor: 300 },
    cls: { good: 0.1, poor: 0.25 },
  }

  const threshold = thresholds[metric]
  if (!threshold) {
    return 'unknown'
  }

  if (value <= threshold.good) {
    return 'good'
  } else if (value <= threshold.poor) {
    return 'needs-improvement'
  } else {
    return 'poor'
  }
}
