/**
 * URL 상태 관리 통합 Composable
 *
 * URL 상태 동기화, 딥 링킹, 상태 제거를 통합 관리합니다.
 *
 * 사용법:
 * ```javascript
 * import { useURLStateManagement } from 'src/system/composables/url-state'
 *
 * const { syncState, processDeepLink, clearState } = useURLStateManagement({
 *   stateMap: {
 *     search: searchText,
 *     category: selectedCategory,
 *     status: statusFilter,
 *     page: computed(() => pagination.value.page),
 *   },
 *   deepLink: {
 *     onDeepLink: (state) => {
 *       // 딥 링킹 처리
 *       partsStore.setSidebarMode(state.mode)
 *       partsStore.setSelectedPartsDataView(state.view)
 *     },
 *     onDefaultInit: (state) => {
 *       // 기본 초기화
 *       partsStore.setSidebarMode(null)
 *     },
 *     defaultView: 'part-classes',
 *   },
 *   clearOptions: {
 *     exclude: ['page'], // 페이지는 제거하지 않음
 *     useNextTick: true,
 *   },
 * })
 *
 * // 자동으로 State ↔ URL 동기화
 * // processDeepLink() 호출 시 딥 링킹 처리
 * // clearState() 호출 시 상태 제거
 * ```
 *
 * @param {Object} config - 설정 객체
 * @param {Object} config.stateMap - 상태 맵핑 객체
 * @param {Object} config.stateMap[key] - Vue ref 또는 computed (상태 값)
 * @param {Object} config.deepLink - 딥 링킹 설정
 * @param {Function} config.deepLink.onDeepLink - 딥 링킹 처리 콜백
 * @param {Function} config.deepLink.onDefaultInit - 기본 초기화 콜백
 * @param {string} config.deepLink.defaultView - 기본 뷰 이름
 * @param {Object} config.clearOptions - 상태 제거 옵션
 * @param {Array<string>} config.clearOptions.exclude - 제외할 파라미터 목록
 * @param {boolean} config.clearOptions.useNextTick - nextTick 사용 여부
 * @param {Object} config.syncOptions - 동기화 옵션 (향후 확장용)
 * @returns {Object} 관리 함수들
 */

import { useURLStateSync } from './useURLStateSync'
import { useDeepLinking } from './useDeepLinking'
import { useClearURLState } from './useClearURLState'

export function useURLStateManagement(config = {}) {
  const {
    stateMap = {},
    deepLink = {},
    clearOptions = {},
    syncOptions = {},
  } = config

  // 1. URL 상태 동기화 (State ↔ URL)
  useURLStateSync(stateMap, syncOptions)

  // 2. 딥 링킹 처리
  const { processDeepLink, isDeepLink } = useDeepLinking(deepLink)

  // 3. 상태 제거
  const { clearURLState } = useClearURLState(clearOptions)

  /**
   * 상태 제거 (편의 함수)
   * @param {Array<string>} paramNames - 제거할 파라미터 이름 목록 (기본값: 모든 공유 파라미터)
   */
  function clearState(paramNames = null) {
    clearURLState(paramNames)
  }

  return {
    // 동기화는 자동으로 수행되므로 별도 함수 불필요
    // processDeepLink: 딥 링킹 처리
    processDeepLink,
    // isDeepLink: 딥 링킹 여부 확인
    isDeepLink,
    // clearState: 상태 제거
    clearState,
  }
}

