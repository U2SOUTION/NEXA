/**
 * 딥 링킹 처리 Composable
 *
 * 공유 URL 접근 시 자동으로 해당 상태로 복원합니다.
 *
 * @param {Object} config - 딥 링킹 설정
 * @param {Function} config.onDeepLink - 딥 링킹 처리 콜백 (state) => void
 * @param {Function} config.onDefaultInit - 기본 초기화 콜백 (state) => void
 * @param {string} config.defaultView - 기본 뷰 이름
 * @returns {Object} 딥 링킹 함수들
 */

import { useRoute } from 'vue-router'
import { getURLStateParamName } from 'src/config/url-state'

export function useDeepLinking(config = {}) {
  const { onDeepLink, onDefaultInit, defaultView } = config
  const route = useRoute()

  /**
   * 공유 URL 모드 처리 함수
   * @returns {boolean} 공유 URL 모드 처리 여부
   */
  function handleShareUrlMode() {
    const selectedParam = getURLStateParamName('selected')
    const viewParam = getURLStateParamName('view')
    const searchParam = getURLStateParamName('search')
    const categoryParam = getURLStateParamName('category')
    const statusParam = getURLStateParamName('status')

    // mode가 없거나 parts-data이면 공유 URL 모드로 간주 (parts-data는 기본값이므로 URL에 없을 수 있음)
    const currentMode = route.query.mode || 'parts-data'

    // 공유 URL 모드: selected 파라미터 또는 필터 파라미터가 있으면 자동으로 해당 뷰로 이동
    const hasSelected = route.query[selectedParam]
    const hasFilter =
      route.query[searchParam] || route.query[categoryParam] || route.query[statusParam]

    if ((hasSelected || hasFilter) && currentMode === 'parts-data') {
      const targetView = route.query[viewParam] || defaultView

      // 딥 링킹 처리 콜백 호출
      if (onDeepLink) {
        onDeepLink({
          mode: 'parts-data',
          view: targetView,
          hasSelected: !!hasSelected,
          hasFilter: !!hasFilter,
        })
      }

      return true // 공유 URL 모드 처리됨
    }
    return false // 공유 URL 모드 아님
  }

  /**
   * 딥 링킹 처리 (초기화 및 URL 변경 시)
   * @returns {boolean} 딥 링킹 처리 여부
   */
  function processDeepLink() {
    // 공유 URL 모드 처리
    if (handleShareUrlMode()) {
      return true
    }

    // URL에 상태가 없을 때만 초기화
    // mode가 없거나 parts-data이고, view도 없으면 대시보드로 초기화
    const viewParam = getURLStateParamName('view')
    const currentMode = route.query.mode || 'parts-data'
    if (currentMode === 'parts-data' && !route.query[viewParam]) {
      // 기본 초기화 콜백 호출
      if (onDefaultInit) {
        onDefaultInit({
          mode: 'parts-data',
          view: null,
        })
      }
    }

    return false
  }

  /**
   * 딥 링킹 여부 확인
   * @returns {boolean} 딥 링킹 여부
   */
  function isDeepLink() {
    const selectedParam = getURLStateParamName('selected')
    const searchParam = getURLStateParamName('search')
    const categoryParam = getURLStateParamName('category')
    const statusParam = getURLStateParamName('status')

    return !!(
      route.query[selectedParam] ||
      route.query[searchParam] ||
      route.query[categoryParam] ||
      route.query[statusParam]
    )
  }

  return {
    processDeepLink,
    isDeepLink,
  }
}
