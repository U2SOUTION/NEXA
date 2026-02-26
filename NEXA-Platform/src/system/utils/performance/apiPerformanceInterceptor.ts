/**
 * API Performance Interceptor
 * fetch 및 XMLHttpRequest 인터셉트하여 API 성능 측정
 *
 * ✅ 인터셉트 로직: 정상 작동 (fetch/XHR 인터셉트 성공)
 * ⚠️ 데이터 수집: 실제 API 호출이 없어서 데이터 0 (실제 사용 시 자동 작동)
 */

let apiMetrics = []
let originalFetch = null
let originalXHROpen = null
let originalXHRSend = null

const MAX_METRICS = 1000 // 최대 저장할 메트릭 수

/**
 * fetch API 인터셉트
 */
export function interceptFetch() {
  if (originalFetch) {
    console.log('[APIMonitor] fetch는 이미 인터셉트되어 있습니다.')
    return // 이미 인터셉트됨
  }

  originalFetch = window.fetch
  console.log('[APIMonitor] fetch 인터셉트 시작')

  window.fetch = async function (...args) {
    const startTime = performance.now()

    // URL 추출 로직 개선
    let url = ''
    if (typeof args[0] === 'string') {
      url = args[0]
    } else if (args[0] instanceof Request) {
      url = args[0].url
    } else if (args[0] && typeof args[0] === 'object' && args[0].url) {
      url = args[0].url
    } else {
      url = String(args[0] || 'unknown')
    }

    // Method 추출 로직 개선
    let method = 'GET'
    if (args[1] && args[1].method) {
      method = args[1].method
    } else if (args[0] instanceof Request && args[0].method) {
      method = args[0].method
    } else if (args[0] && typeof args[0] === 'object' && args[0].method) {
      method = args[0].method
    }

    try {
      const response = await originalFetch.apply(this, args)
      const endTime = performance.now()
      const duration = endTime - startTime

      const metric = {
        url,
        method,
        duration,
        status: response.status,
        statusText: response.statusText,
        timestamp: Date.now(),
        success: response.ok,
      }

      recordAPIMetric(metric)
      console.log('[APIMonitor] API 호출 기록:', { url, method, duration: `${duration.toFixed(2)}ms`, status: response.status })

      return response
    } catch (error) {
      const endTime = performance.now()
      const duration = endTime - startTime

      recordAPIMetric({
        url,
        method,
        duration,
        status: 0,
        statusText: error.message,
        timestamp: Date.now(),
        success: false,
        error: error.message,
      })

      throw error
    }
  }
}

/**
 * XMLHttpRequest 인터셉트
 */
export function interceptXHR() {
  if (originalXHROpen) {
    return // 이미 인터셉트됨
  }

  originalXHROpen = XMLHttpRequest.prototype.open
  originalXHRSend = XMLHttpRequest.prototype.send

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this._apiMethod = method
    this._apiUrl = url
    this._apiStartTime = performance.now()

    return originalXHROpen.apply(this, [method, url, ...rest])
  }

  XMLHttpRequest.prototype.send = function (...args) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias -- XHR callback에서 this 캡처 필요
    const xhr = this

    xhr.addEventListener('loadend', function () {
      const endTime = performance.now()
      const duration = endTime - (xhr._apiStartTime || endTime)

      recordAPIMetric({
        url: xhr._apiUrl,
        method: xhr._apiMethod || 'GET',
        duration,
        status: xhr.status,
        statusText: xhr.statusText,
        timestamp: Date.now(),
        success: xhr.status >= 200 && xhr.status < 300,
      })
    })

    xhr.addEventListener('error', function () {
      const endTime = performance.now()
      const duration = endTime - (xhr._apiStartTime || endTime)

      recordAPIMetric({
        url: xhr._apiUrl,
        method: xhr._apiMethod || 'GET',
        duration,
        status: 0,
        statusText: 'Network Error',
        timestamp: Date.now(),
        success: false,
        error: 'Network Error',
      })
    })

    return originalXHRSend.apply(this, args)
  }
}

/**
 * API 메트릭 기록
 * @param {Object} metric - API 메트릭 데이터
 */
function recordAPIMetric(metric) {
  apiMetrics.push(metric)

  // 메트릭 수 제한
  if (apiMetrics.length > MAX_METRICS) {
    apiMetrics.shift()
  }
}

/**
 * API 성능 지표 반환
 * @param {Object} options - 옵션
 * @param {string} options.url - 특정 URL 필터
 * @param {string} options.method - 특정 메서드 필터
 * @param {number} options.duration - 최근 기간 (ms)
 * @returns {Array} API 메트릭 배열
 */
export function getAPIMetrics(options = {}) {
  let filtered = [...apiMetrics]

  if (options.url) {
    filtered = filtered.filter((m) => m.url.includes(options.url))
  }

  if (options.method) {
    filtered = filtered.filter((m) => m.method === options.method)
  }

  if (options.duration) {
    const cutoffTime = Date.now() - options.duration
    filtered = filtered.filter((m) => m.timestamp >= cutoffTime)
  }

  return filtered
}

/**
 * API 성능 통계 반환
 * @param {Object} options - 옵션 (getAPIMetrics와 동일)
 * @returns {Object} API 성능 통계
 */
export function getAPIStats(options = {}) {
  const metrics = getAPIMetrics(options)

  if (metrics.length === 0) {
    return {
      count: 0,
      avgDuration: 0,
      minDuration: 0,
      maxDuration: 0,
      successRate: 0,
      errorRate: 0,
    }
  }

  const durations = metrics.map((m) => m.duration)
  const successes = metrics.filter((m) => m.success).length
  const errors = metrics.length - successes

  return {
    count: metrics.length,
    avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
    minDuration: Math.min(...durations),
    maxDuration: Math.max(...durations),
    successRate: (successes / metrics.length) * 100,
    errorRate: (errors / metrics.length) * 100,
  }
}

/**
 * 엔드포인트별 API 성능 통계
 * @param {Object} options - 옵션
 * @returns {Object} 엔드포인트별 통계
 */
export function getAPIStatsByEndpoint(options = {}) {
  const metrics = getAPIMetrics(options)
  const endpointStats = {}

  metrics.forEach((metric) => {
    const key = `${metric.method} ${metric.url}`
    if (!endpointStats[key]) {
      endpointStats[key] = {
        url: metric.url,
        method: metric.method,
        requests: [],
      }
    }
    endpointStats[key].requests.push(metric)
  })

  // 통계 계산
  Object.keys(endpointStats).forEach((key) => {
    const stats = endpointStats[key]
    const durations = stats.requests.map((r) => r.duration)
    const successes = stats.requests.filter((r) => r.success).length

    stats.count = stats.requests.length
    stats.avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length
    stats.minDuration = Math.min(...durations)
    stats.maxDuration = Math.max(...durations)
    stats.successRate = (successes / stats.requests.length) * 100
    stats.errorRate = 100 - stats.successRate
  })

  return endpointStats
}

/**
 * API 메트릭 초기화
 */
export function clearAPIMetrics() {
  apiMetrics = []
}

/**
 * 모든 API 인터셉터 활성화
 */
export function enableAPIMonitoring() {
  console.log('[APIMonitor] API 모니터링 활성화 시작')
  interceptFetch()
  interceptXHR()
  console.log('[APIMonitor] API 모니터링 활성화 완료')
}

/**
 * 모든 API 인터셉터 비활성화
 */
export function disableAPIMonitoring() {
  if (originalFetch) {
    window.fetch = originalFetch
    originalFetch = null
  }

  if (originalXHROpen && originalXHRSend) {
    XMLHttpRequest.prototype.open = originalXHROpen
    XMLHttpRequest.prototype.send = originalXHRSend
    originalXHROpen = null
    originalXHRSend = null
  }
}
