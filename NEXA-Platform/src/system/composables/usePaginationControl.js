/**
 * 페이지네이션 제어 Composable
 *
 * 사용법:
 * ```javascript
 * import { usePaginationControl } from 'src/system/composables/usePaginationControl'
 *
 * const {
 *   pendingPageAction,
 *   pageActionStartTime,
 *   handleCalculationComplete,
 *   setupPaginationWatchers
 * } = usePaginationControl({
 *   pagination,
 *   filteredClasses
 * })
 * ```
 */

import { ref, watch, nextTick } from 'vue'

/**
 * 페이지네이션 제어 Composable
 *
 * @param {Object} params - 파라미터
 * @param {import('vue').Ref<Object>} params.pagination - 페이지네이션 상태
 * @param {import('vue').ComputedRef<Array>} params.filteredClasses - 필터링된 목록
 * @returns {Object} 페이지네이션 제어 함수 및 상태
 */
export function usePaginationControl({ pagination, filteredClasses }) {
  // 페이지 이동 제어 플래그 (삭제 시에만 사용, 추가 시에는 즉시 처리)
  const pendingPageAction = ref(null) // 'keepCurrent' | null
  const pageActionStartTime = ref(null) // 플래그가 설정된 시간

  /**
   * 계산 완료 핸들러 (리사이즈 시 재계산 완료 후 페이지 조정용)
   * 리사이즈로 인한 재계산 완료 시에만 호출됨
   *
   * @param {number} finalRowsPerPage - 최종 행 수
   */
  function handleCalculationComplete(finalRowsPerPage) {
    // 리사이즈로 인한 재계산 완료 시 페이지 범위만 조정
    // (페이지 이동 플래그는 데이터 변경 시에만 사용)
    const totalItems = filteredClasses.value.length
    const rowsPerPage = finalRowsPerPage || pagination.value.rowsPerPage
    const maxPage = Math.ceil(totalItems / rowsPerPage) || 1

    if (pagination.value.page > maxPage && maxPage > 0) {
      pagination.value.page = maxPage
    }
  }

  /**
   * 페이지네이션 watcher 설정
   */
  function setupPaginationWatchers() {
    // 페이지 이동 제어: 삭제 시 현재 페이지 유지 처리
    // 삭제 시에는 filteredClasses.length 변경을 감지하여 페이지 조정
    watch(
      () => filteredClasses.value.length,
      (newLength, oldLength) => {
        // 초기 로드 시에는 실행하지 않음
        if (oldLength === undefined || !pendingPageAction.value) {
          return
        }

        // 삭제 시에만 처리 (추가 시에는 이미 처리됨)
        const action = pendingPageAction.value
        if (action === 'keepCurrent') {
          const totalItems = newLength
          const rowsPerPage = pagination.value.rowsPerPage
          const maxPage = Math.ceil(totalItems / rowsPerPage) || 1

          nextTick(() => {
            // 현재 페이지 유지 (유효 범위를 벗어나면 조정)
            const currentPage = pagination.value.page
            if (currentPage > maxPage && maxPage > 0) {
              pagination.value.page = maxPage
            }

            // 플래그 초기화
            pendingPageAction.value = null
            pageActionStartTime.value = null
          })
        }
      },
    )

    // pagination.value.page가 변경될 때도 확인하여 DataPageNavigation이 변경한 경우 복원
    // 삭제 시에만 사용 (플래그가 설정된 후 2초 이내에만 실행)
    watch(
      () => pagination.value.page,
      (newPage) => {
        if (!pendingPageAction.value || !pageActionStartTime.value) return
        if (pendingPageAction.value !== 'keepCurrent') return // 삭제 시에만 처리

        // 플래그가 설정된 후 2초 이내에만 실행
        const elapsed = Date.now() - pageActionStartTime.value
        if (elapsed > 2000) {
          pendingPageAction.value = null
          pageActionStartTime.value = null
          return
        }

        const totalItems = filteredClasses.value.length
        const rowsPerPage = pagination.value.rowsPerPage
        const maxPage = Math.ceil(totalItems / rowsPerPage) || 1

        // keepCurrent: 유효 범위 내에서만 유지
        if (newPage > maxPage && maxPage > 0) {
          nextTick(() => {
            pagination.value.page = maxPage
          })
        }
      },
    )
  }

  /**
   * 현재 페이지 유지 플래그 설정
   */
  function setKeepCurrentPage() {
    pendingPageAction.value = 'keepCurrent'
    pageActionStartTime.value = Date.now()
  }

  return {
    pendingPageAction,
    pageActionStartTime,
    handleCalculationComplete,
    setupPaginationWatchers,
    setKeepCurrentPage,
  }
}
