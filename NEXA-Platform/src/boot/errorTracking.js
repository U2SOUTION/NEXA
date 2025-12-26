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

  console.log('[boot] 에러 트래킹 시스템 초기화 완료')
}

