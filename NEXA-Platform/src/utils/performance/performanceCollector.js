/**
 * Performance Collector
 * 브라우저 Performance API를 활용한 기본 성능 지표 수집
 */

/**
 * 기본 성능 지표 수집
 * @returns {Object} 기본 성능 지표
 */
export function collectBasicMetrics() {
  const navigation = performance.getEntriesByType('navigation')[0]
  
  return {
    navigation: {
      dns: navigation?.domainLookupEnd - navigation?.domainLookupStart || 0,
      tcp: navigation?.connectEnd - navigation?.connectStart || 0,
      request: navigation?.responseStart - navigation?.requestStart || 0,
      response: navigation?.responseEnd - navigation?.responseStart || 0,
      domProcessing: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
      load: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
      total: navigation?.loadEventEnd - navigation?.fetchStart || 0,
    },
    timestamp: Date.now(),
  }
}

/**
 * 메모리 사용량 수집
 * @returns {Object|null} 메모리 사용량 정보 (Chrome만 지원)
 */
export function collectMemoryMetrics() {
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
 * 네트워크 상태 수집
 * @returns {Object|null} 네트워크 상태 정보
 */
export function collectNetworkMetrics() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  
  if (!connection) {
    return null
  }

  return {
    downlink: connection.downlink || 0,
    effectiveType: connection.effectiveType || 'unknown',
    rtt: connection.rtt || 0,
    saveData: connection.saveData || false,
    timestamp: Date.now(),
  }
}

/**
 * 리소스 로딩 시간 수집
 * @returns {Array} 리소스 타이밍 정보
 */
export function collectResourceTiming() {
  const resources = performance.getEntriesByType('resource')
  
  return resources.map(resource => ({
    name: resource.name,
    type: resource.initiatorType,
    duration: resource.duration,
    size: resource.transferSize || 0,
    startTime: resource.startTime,
    redirect: resource.redirectEnd - resource.redirectStart,
    dns: resource.domainLookupEnd - resource.domainLookupStart,
    tcp: resource.connectEnd - resource.connectStart,
    request: resource.responseStart - resource.requestStart,
    response: resource.responseEnd - resource.responseStart,
  }))
}

/**
 * 모든 기본 성능 지표 수집
 * @returns {Object} 종합 성능 지표
 */
export function collectAllBasicMetrics() {
  return {
    basic: collectBasicMetrics(),
    memory: collectMemoryMetrics(),
    network: collectNetworkMetrics(),
    resources: collectResourceTiming(),
    timestamp: Date.now(),
  }
}

