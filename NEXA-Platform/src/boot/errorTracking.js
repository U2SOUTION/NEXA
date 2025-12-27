/**
 * 에러 트래킹 시스템 초기화
 *
 * 앱 시작 시 전역 에러 핸들러를 등록합니다.
 */

import { initializeErrorCollector } from 'src/utils/error-tracking/errorCollector.js'

export default ({ app }) => {
  // 에러 수집기 초기화
  initializeErrorCollector({
    collecting: true,
    interceptNetwork: true,
  })

  // Vue 에러 핸들러 등록
  app.config.errorHandler = (error, instance, info) => {
    // 기본 에러 핸들링 (콘솔 출력)
    console.error('[Vue Error Handler]', error, instance, info)

    // 에러 수집
    window.dispatchEvent(
      new CustomEvent('error-tracking-vue-error', {
        detail: {
          error,
          instance,
          info,
        },
      }),
    )
  }

  // 개발 환경에서만 전역 테스트 함수 노출
  if (import.meta.env.DEV) {
    /**
     * 에러 트래킹 테스트 함수
     * 콘솔에서 `testError()` 또는 `testError('커스텀 메시지')`로 호출 가능
     */
    window.testError = (message = '테스트 에러') => {
      console.log('[테스트] 에러 발생 시도:', message)
      throw new Error(message)
    }

    /**
     * Promise rejection 테스트 함수
     * 콘솔에서 `testRejection()` 또는 `testRejection('커스텀 메시지')`로 호출 가능
     */
    window.testRejection = (message = '테스트 Promise Rejection') => {
      console.log('[테스트] Promise Rejection 발생 시도:', message)
      Promise.reject(new Error(message))
    }

    /**
     * 네트워크 에러 테스트 함수
     * 콘솔에서 `testNetworkError()`로 호출 가능
     */
    window.testNetworkError = () => {
      console.log('[테스트] 네트워크 에러 발생 시도')
      fetch('/api/nonexistent-endpoint-that-will-fail')
        .then(() => {})
        .catch(() => {})
    }

    console.log('[boot] 에러 트래킹 테스트 함수 등록 완료')
    console.log('[boot] 사용법: testError(), testRejection(), testNetworkError()')
  }

  console.log('[boot] 에러 트래킹 시스템 초기화 완료')
}

