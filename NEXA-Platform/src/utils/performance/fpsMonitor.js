/**
 * FPS Monitor
 * requestAnimationFrame을 활용한 FPS 측정
 *
 * ✅ 측정 로직: 정상 작동 (FPS 값 정확히 측정됨)
 * ⚠️ UI 렌더링: 부모에서 currentFPS.value는 업데이트되지만 자식 컴포넌트에서 반응성 문제로 렌더링 안 됨
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
    console.log('[FPSMonitor] 이미 모니터링 중입니다.')
    return
  }

  console.log('[FPSMonitor] FPS 모니터링 시작 (샘플링 간격:', sampleInterval, 'ms)')
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
      const measuredFrames = frameCount
      currentFPS = Math.round((measuredFrames * 1000) / elapsed)

      // FPS가 0이거나 음수인 경우 (초기 상태 또는 탭 비활성화) 처리
      if (currentFPS <= 0) {
        // 브라우저가 렌더링을 중지한 경우 (예: 탭 비활성화)
        // 마지막 유효한 FPS 값을 유지하거나 0으로 설정
        if (fpsHistory.length > 0) {
          currentFPS = fpsHistory[fpsHistory.length - 1].fps
        } else {
          currentFPS = 0
        }
      }

      fpsHistory.push({
        fps: currentFPS,
        timestamp: Date.now(),
      })

      // 히스토리 크기 제한
      if (fpsHistory.length > MAX_HISTORY) {
        fpsHistory.shift()
      }

      console.log('[FPSMonitor] FPS 업데이트:', currentFPS, 'fps (프레임 수:', measuredFrames, ', 경과 시간:', elapsed.toFixed(2), 'ms)')

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
    samples = fpsHistory.filter((item) => item.timestamp >= cutoffTime)
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
    samples = fpsHistory.filter((item) => item.timestamp >= cutoffTime)
  }

  if (samples.length === 0) {
    return 0
  }

  return Math.min(...samples.map((item) => item.fps))
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
