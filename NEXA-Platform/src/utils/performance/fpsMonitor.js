/**
 * FPS Monitor
 * requestAnimationFrame을 활용한 FPS 측정
 */

let lastTime = performance.now()
let frameCount = 0
let currentFPS = 0
let fpsHistory = []
let isMonitoring = false
let animationFrameId = null

const MAX_HISTORY = 100 // 최대 저장할 FPS 히스토리 수

/**
 * FPS 모니터링 시작
 * @param {number} sampleInterval - FPS 샘플링 간격 (ms, 기본값: 1000ms)
 * @param {Function} callback - FPS 업데이트 콜백
 */
export function startFPSMonitoring(sampleInterval = 1000, callback = null) {
  if (isMonitoring) {
    return
  }

  isMonitoring = true
  frameCount = 0
  lastTime = performance.now()
  fpsHistory = []

  function measureFPS(currentTime) {
    if (!isMonitoring) {
      return
    }

    frameCount++
    const elapsed = currentTime - lastTime

    if (elapsed >= sampleInterval) {
      currentFPS = Math.round((frameCount * 1000) / elapsed)
      fpsHistory.push({
        fps: currentFPS,
        timestamp: Date.now(),
      })

      // 히스토리 크기 제한
      if (fpsHistory.length > MAX_HISTORY) {
        fpsHistory.shift()
      }

      frameCount = 0
      lastTime = currentTime

      if (callback) {
        callback(currentFPS)
      }
    }

    animationFrameId = requestAnimationFrame(measureFPS)
  }

  animationFrameId = requestAnimationFrame(measureFPS)
}

/**
 * FPS 모니터링 중지
 */
export function stopFPSMonitoring() {
  isMonitoring = false
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

/**
 * 현재 FPS 반환
 * @returns {number} 현재 FPS
 */
export function getCurrentFPS() {
  return currentFPS
}

/**
 * 평균 FPS 반환
 * @param {number} duration - 계산할 기간 (ms, 기본값: 전체 히스토리)
 * @returns {number} 평균 FPS
 */
export function getAverageFPS(duration = null) {
  if (fpsHistory.length === 0) {
    return 0
  }

  let samples = fpsHistory
  if (duration) {
    const cutoffTime = Date.now() - duration
    samples = fpsHistory.filter(item => item.timestamp >= cutoffTime)
  }

  if (samples.length === 0) {
    return 0
  }

  const sum = samples.reduce((acc, item) => acc + item.fps, 0)
  return Math.round(sum / samples.length)
}

/**
 * 최소 FPS 반환
 * @param {number} duration - 계산할 기간 (ms, 기본값: 전체 히스토리)
 * @returns {number} 최소 FPS
 */
export function getMinFPS(duration = null) {
  if (fpsHistory.length === 0) {
    return 0
  }

  let samples = fpsHistory
  if (duration) {
    const cutoffTime = Date.now() - duration
    samples = fpsHistory.filter(item => item.timestamp >= cutoffTime)
  }

  if (samples.length === 0) {
    return 0
  }

  return Math.min(...samples.map(item => item.fps))
}

/**
 * FPS 히스토리 반환
 * @returns {Array} FPS 히스토리
 */
export function getFPSHistory() {
  return [...fpsHistory]
}

/**
 * FPS 히스토리 초기화
 */
export function clearFPSHistory() {
  fpsHistory = []
}

/**
 * 모니터링 상태 확인
 * @returns {boolean} 모니터링 중 여부
 */
export function isFPSMonitoring() {
  return isMonitoring
}

