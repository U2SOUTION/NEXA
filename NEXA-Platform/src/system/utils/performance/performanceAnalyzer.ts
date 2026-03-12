/**
 * Performance Analyzer
 * 성능 트렌드 분석, 병목 식별, 최적화 제안
 */

export type TrendResult = { trend: string; change: number }

interface MetricRecord {
  frontend?: { fps?: number; memory?: { usedJSHeapSize?: number }; webVitals?: { lcp?: { value?: number } } }
  api?: { requests?: Array<{ duration?: number; url?: string }> }
  timestamp?: number
}

export function analyzeTrend(metrics: MetricRecord[]): Record<string, TrendResult> {
  if (metrics.length < 2) {
    return {
      fps: { trend: 'stable', change: 0 },
      memory: { trend: 'stable', change: 0 },
      lcp: { trend: 'stable', change: 0 },
      apiDuration: { trend: 'stable', change: 0 },
    }
  }

  const first = metrics[0]!
  const last = metrics[metrics.length - 1]!

  const getValue = (metric: MetricRecord, path: string): unknown => {
    const parts = path.split('.')
    let value: unknown = metric
    for (const part of parts) {
      value = (value as Record<string, unknown>)?.[part]
    }
    return value
  }

  const calculateTrend = (firstValue: unknown, lastValue: unknown): TrendResult => {
    const f = Number(firstValue)
    const l = Number(lastValue)
    if (Number.isNaN(f) || Number.isNaN(l) || f === 0) {
      return { trend: 'unknown', change: 0 }
    }

    const change = ((l - f) / f) * 100
    let trend = 'stable'
    if (Math.abs(change) < 5) {
      trend = 'stable'
    } else if (change > 0) {
      trend = 'increasing'
    } else {
      trend = 'decreasing'
    }

    return { trend, change: Number(change.toFixed(2)) }
  }

  const fpsFirst = getValue(first, 'frontend.fps')
  const fpsLast = getValue(last, 'frontend.fps')
  const fpsTrend = calculateTrend(fpsFirst, fpsLast)
  if (fpsTrend.change > 0) {
    fpsTrend.trend = 'improving'
  } else if (fpsTrend.change < -5) {
    fpsTrend.trend = 'degrading'
  }

  const memoryFirst = getValue(first, 'frontend.memory.usedJSHeapSize')
  const memoryLast = getValue(last, 'frontend.memory.usedJSHeapSize')
  const memoryTrend = calculateTrend(memoryFirst, memoryLast)

  const lcpFirst = getValue(first, 'frontend.webVitals.lcp.value')
  const lcpLast = getValue(last, 'frontend.webVitals.lcp.value')
  const lcpTrend = calculateTrend(lcpFirst, lcpLast)

  const apiFirst = getValue(first, 'api.requests.0.duration')
  const apiLast = getValue(last, 'api.requests.0.duration')
  const apiTrend = calculateTrend(apiFirst, apiLast)

  return {
    fps: fpsTrend,
    memory: memoryTrend,
    lcp: lcpTrend,
    apiDuration: apiTrend,
  }
}

export interface BottleneckItem {
  type: string
  severity: string
  value: string | number
  timestamp?: number
  suggestion: string
  url?: string
}

export function identifyBottlenecks(metrics: MetricRecord[]): BottleneckItem[] {
  const bottlenecks: BottleneckItem[] = []

  metrics.forEach((metric: MetricRecord) => {
    // FPS 병목
    if (metric.frontend?.fps && metric.frontend.fps < 30) {
      bottlenecks.push({
        type: 'low-fps',
        severity: metric.frontend.fps < 20 ? 'high' : 'medium',
        value: metric.frontend.fps,
        timestamp: metric.timestamp,
        suggestion: '렌더링 성능 최적화 필요. 무거운 컴포넌트나 애니메이션을 확인하세요.',
      })
    }

    // 메모리 병목
    if (metric.frontend?.memory?.usedJSHeapSize) {
      const memoryMB = metric.frontend.memory.usedJSHeapSize / (1024 * 1024)
      if (memoryMB > 100) {
        bottlenecks.push({
          type: 'high-memory',
          severity: memoryMB > 200 ? 'high' : 'medium',
          value: memoryMB.toFixed(2) + ' MB',
          timestamp: metric.timestamp,
          suggestion: '메모리 사용량이 높습니다. 메모리 누수를 확인하세요.',
        })
      }
    }

    // LCP 병목
    if (metric.frontend?.webVitals?.lcp?.value) {
      const lcp = metric.frontend.webVitals.lcp.value
      if (lcp > 2500) {
        bottlenecks.push({
          type: 'slow-lcp',
          severity: lcp > 4000 ? 'high' : 'medium',
          value: lcp.toFixed(0) + ' ms',
          timestamp: metric.timestamp,
          suggestion: 'LCP가 느립니다. 이미지 최적화, 리소스 로딩 순서 개선을 고려하세요.',
        })
      }
    }

    if (metric.api?.requests) {
      metric.api.requests.forEach((request: { duration?: number; url?: string }) => {
        const duration = request.duration ?? 0
        if (duration > 1000) {
          bottlenecks.push({
            type: 'slow-api',
            severity: duration > 3000 ? 'high' : 'medium',
            value: duration.toFixed(0) + ' ms',
            url: request.url,
            timestamp: metric.timestamp,
            suggestion: `API 응답이 느립니다: ${request.url ?? ''}. 서버 최적화 또는 캐싱을 고려하세요.`,
          })
        }
      })
    }
  })

  return bottlenecks
}

export interface OptimizationSuggestion {
  category: string
  priority: string
  title: string
  description: string
  actions: string[]
}

export function generateOptimizationSuggestions(metrics: MetricRecord[]): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = []

  if (metrics.length === 0) {
    return suggestions
  }

  const fpsFiltered = metrics.filter((m) => m.frontend?.fps != null)
  const avgFPS = fpsFiltered.length > 0 ? fpsFiltered.reduce((sum, m) => sum + (m.frontend!.fps ?? 0), 0) / fpsFiltered.length : 0

  const memFiltered = metrics.filter((m) => m.frontend?.memory?.usedJSHeapSize != null)
  const avgMemory = memFiltered.length > 0 ? memFiltered.reduce((sum, m) => sum + (m.frontend!.memory!.usedJSHeapSize ?? 0), 0) / memFiltered.length / (1024 * 1024) : 0

  const lcpFiltered = metrics.filter((m) => m.frontend?.webVitals?.lcp?.value != null)
  const avgLCP = lcpFiltered.length > 0 ? lcpFiltered.reduce((sum, m) => sum + (m.frontend!.webVitals!.lcp!.value ?? 0), 0) / lcpFiltered.length : 0

  const apiDurations = metrics.flatMap((m) => m.api?.requests?.map((r) => r.duration) ?? []).filter((d): d is number => typeof d === 'number')
  const avgAPIDuration = apiDurations.length > 0 ? apiDurations.reduce((sum, d) => sum + d, 0) / apiDurations.length : 0

  // FPS 제안
  if (avgFPS && avgFPS < 50) {
    suggestions.push({
      category: 'rendering',
      priority: avgFPS < 30 ? 'high' : 'medium',
      title: '렌더링 성능 개선',
      description: `평균 FPS가 ${avgFPS.toFixed(0)}입니다. 렌더링 성능 최적화를 고려하세요.`,
      actions: [
        '무거운 컴포넌트 최적화',
        '불필요한 리렌더링 방지 (React.memo, useMemo 활용)',
        '애니메이션 최적화 (CSS transform 활용)',
      ],
    })
  }

  // 메모리 제안
  if (avgMemory && avgMemory > 80) {
    suggestions.push({
      category: 'memory',
      priority: avgMemory > 150 ? 'high' : 'medium',
      title: '메모리 사용량 개선',
      description: `평균 메모리 사용량이 ${avgMemory.toFixed(2)}MB입니다.`,
      actions: [
        '메모리 누수 확인 (Chrome DevTools Memory Profiler 활용)',
        '이벤트 리스너 정리',
        '큰 객체 참조 해제',
      ],
    })
  }

  // LCP 제안
  if (avgLCP && avgLCP > 2500) {
    suggestions.push({
      category: 'loading',
      priority: avgLCP > 4000 ? 'high' : 'medium',
      title: '페이지 로딩 성능 개선',
      description: `평균 LCP가 ${avgLCP.toFixed(0)}ms입니다.`,
      actions: [
        '이미지 최적화 (WebP, lazy loading)',
        '리소스 우선순위 조정 (preload, preconnect)',
        '렌더링 차단 리소스 제거',
      ],
    })
  }

  // API 제안
  if (avgAPIDuration > 500) {
    suggestions.push({
      category: 'api',
      priority: avgAPIDuration > 1000 ? 'high' : 'medium',
      title: 'API 응답 시간 개선',
      description: `평균 API 응답 시간이 ${avgAPIDuration.toFixed(0)}ms입니다.`,
      actions: [
        '서버 성능 최적화',
        '응답 캐싱 구현',
        '불필요한 데이터 요청 줄이기',
        'API 요청 병렬화',
      ],
    })
  }

  return suggestions
}

