/**
 * @file simMetrics.ts
 * @role 시뮬레이션용 다중 센서·부하 메트릭 SSOT.
 */

export interface SimMetrics {
  temp: number
  humidity: number
  pressure: number
  load: number[]
  ringSegments: number[]
}

export const INITIAL_METRICS: SimMetrics = {
  temp: 72,
  humidity: 48,
  pressure: 1013,
  load: [32, 45, 58, 52, 61, 48, 55],
  ringSegments: [0.72, 0.55, 0.88, 0.4],
}

export function tickMetrics(m: SimMetrics): SimMetrics {
  const temp = Math.round(Math.min(95, Math.max(65, m.temp + (Math.random() - 0.48) * 4)))
  const humidity = Math.round(Math.min(99, Math.max(20, m.humidity + (Math.random() - 0.5) * 6)))
  const pressure = Math.round(Math.min(1040, Math.max(990, m.pressure + (Math.random() - 0.5) * 3)))
  const load = [...m.load.slice(-11), Math.round(30 + Math.random() * 50)]
  const ringSegments = m.ringSegments.map((v) =>
    Math.min(1, Math.max(0.1, v + (Math.random() - 0.5) * 0.12)),
  )
  return { temp, humidity, pressure, load, ringSegments }
}
