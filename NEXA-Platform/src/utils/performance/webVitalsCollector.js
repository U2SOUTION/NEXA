/**
 * Web Vitals Collector
 * LCP, FID, CLS 측정
 */

let webVitalsData = {
  lcp: null,
  fid: null,
  cls: null,
}

let observers = []

/**
 * LCP (Largest Contentful Paint) 측정
 * @param {Function} callback - LCP 측정 콜백
 */
export function collectLCP(callback) {
  // 이미 측정된 LCP 값이 있으면 반환 (페이지 로드 후 모니터링 시작하는 경우 대비)
  try {
    // navigation timing을 통해 LCP 근사값 계산 시도
    const navTiming = performance.getEntriesByType('navigation')[0]
    if (navTiming && navTiming.loadEventEnd) {
      // loadEventEnd를 LCP 근사값으로 사용
      const approximateLCP = navTiming.loadEventEnd - navTiming.fetchStart
      if (approximateLCP > 0) {
        webVitalsData.lcp = {
          value: approximateLCP,
          element: 'approximate',
          timestamp: Date.now(),
        }
        if (callback) {
          callback(webVitalsData.lcp)
        }
      }
    }
  } catch {
    // 실패해도 계속 진행
  }

  if (typeof PerformanceObserver === 'undefined') {
    console.warn('[WebVitalsCollector] PerformanceObserver is not supported')
    return
  }

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      if (entries.length > 0) {
        const lastEntry = entries[entries.length - 1]

        webVitalsData.lcp = {
          value: lastEntry.renderTime || lastEntry.loadTime,
          element: lastEntry.element?.tagName || 'unknown',
          timestamp: Date.now(),
        }

        if (callback) {
          callback(webVitalsData.lcp)
        }
      }
    })

    observer.observe({ type: 'largest-contentful-paint', buffered: true })
    observers.push(observer)
  } catch (error) {
    console.error('[WebVitalsCollector] Failed to collect LCP:', error)
  }
}

/**
 * FID (First Input Delay) 측정
 * @param {Function} callback - FID 측정 콜백
 */
export function collectFID(callback) {
  if (typeof PerformanceObserver === 'undefined') {
    console.warn('[WebVitalsCollector] PerformanceObserver is not supported')
    return
  }

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        // FID는 첫 번째 입력만 측정
        if (!webVitalsData.fid) {
          webVitalsData.fid = {
            value: entry.processingStart - entry.startTime,
            eventType: entry.name,
            timestamp: Date.now(),
          }

          if (callback) {
            callback(webVitalsData.fid)
          }

          // 한 번만 측정하므로 관찰 중지
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

/**
 * CLS (Cumulative Layout Shift) 측정
 * @param {Function} callback - CLS 측정 콜백
 */
export function collectCLS(callback) {
  if (typeof PerformanceObserver === 'undefined') {
    console.warn('[WebVitalsCollector] PerformanceObserver is not supported')
    return
  }

  let clsValue = 0
  let clsEntries = []

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        // 사용자 입력으로 인한 레이아웃 시프트는 제외
        if (!entry.hadRecentInput) {
          clsValue += entry.value
          clsEntries.push({
            value: entry.value,
            sources:
              entry.sources?.map((s) => ({
                node: s.node?.tagName || 'unknown',
                previousRect: s.previousRect,
                currentRect: s.currentRect,
              })) || [],
          })
        }
      })

      webVitalsData.cls = {
        value: clsValue,
        entries: clsEntries,
        timestamp: Date.now(),
      }

      if (callback) {
        callback(webVitalsData.cls)
      }
    })

    observer.observe({ type: 'layout-shift', buffered: true })
    observers.push(observer)
  } catch (error) {
    console.error('[WebVitalsCollector] Failed to collect CLS:', error)
  }
}

/**
 * 모든 Web Vitals 측정 시작
 * @param {Function} callback - Web Vitals 업데이트 콜백
 */
export function onWebVitals(callback) {
  collectLCP((lcp) => {
    if (callback) callback({ ...webVitalsData, lcp })
  })
  collectFID((fid) => {
    if (callback) callback({ ...webVitalsData, fid })
  })
  collectCLS((cls) => {
    if (callback) callback({ ...webVitalsData, cls })
  })
}

/**
 * Web Vitals 데이터 반환
 * @returns {Object} Web Vitals 데이터
 */
export function getWebVitals() {
  // LCP가 없으면 navigation timing을 통해 근사값 계산
  if (!webVitalsData.lcp) {
    try {
      const navTiming = performance.getEntriesByType('navigation')[0]
      if (navTiming && navTiming.loadEventEnd) {
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
      // 실패 시 무시
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

/**
 * Web Vitals 평가 (좋음/개선 필요/나쁨)
 * @param {string} metric - 평가할 지표 (lcp, fid, cls)
 * @param {number} value - 지표 값
 * @returns {string} 평가 결과 ('good', 'needs-improvement', 'poor')
 */
export function evaluateWebVital(metric, value) {
  if (value === null || value === undefined) {
    return 'unknown'
  }

  const thresholds = {
    lcp: { good: 2500, poor: 4000 }, // milliseconds
    fid: { good: 100, poor: 300 }, // milliseconds
    cls: { good: 0.1, poor: 0.25 }, // score
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
