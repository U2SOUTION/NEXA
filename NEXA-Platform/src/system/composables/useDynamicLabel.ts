/**
 * 동적 라벨 생성 Composable
 * 선택/필터/전체 상태에 따른 라벨 자동 생성
 *
 * @param {object} options - 컨텍스트 옵션
 * @param {Ref<number>} options.selectedCount - 선택된 항목 개수
 * @param {Ref<boolean>} options.hasActiveFilter - 활성 필터 여부
 * @param {function} options.getFilteredCount - 필터된 항목 개수 반환 함수
 * @param {function} options.getTotalCount - 전체 항목 개수 반환 함수
 * @returns {function} getLabel(type, baseLabel, options)
 *
 * @example
 * const { getLabel } = useDynamicLabel({
 *   selectedCount,
 *   hasActiveFilter,
 *   getFilteredCount: () => filteredItems.value.length,
 *   getTotalCount: () => allItems.value.length
 * })
 *
 * const exportLabel = computed(() => getLabel('export', '내보내기'))
 * // → "선택 항목 내보내기 (3개)" 또는 "필터 결과 내보내기 (10개)" 또는 "전체 내보내기"
 */
import { computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'

export interface DynamicLabelOptions {
  selectedCount?: Ref<number> | ComputedRef<number>
  hasActiveFilter?: Ref<boolean> | ComputedRef<boolean>
  getFilteredCount?: () => number
  getTotalCount?: () => number
}

export function useDynamicLabel(options: DynamicLabelOptions = {}) {
  const {
    selectedCount = computed(() => 0) as ComputedRef<number>,
    hasActiveFilter = computed(() => false) as ComputedRef<boolean>,
    getFilteredCount = () => 0,
    getTotalCount = () => 0,
  } = options

  /**
   * 동적 라벨 생성
   * @param {string} type - 라벨 타입 ('export', 'print', 'activate', 'favorite' 등)
   * @param {string} baseLabel - 기본 라벨 (예: '내보내기', '인쇄')
   * @param {object} labelOptions - 추가 옵션
   * @param {boolean} labelOptions.showCount - 개수 표시 여부 (기본: true)
   * @param {string} labelOptions.selectedPrefix - 선택 항목일 때 접두사 (기본: '선택 항목')
   * @param {string} labelOptions.filteredPrefix - 필터 결과일 때 접두사 (기본: '필터 결과')
   * @param {string} labelOptions.allPrefix - 전체일 때 접두사 (기본: '전체')
   * @returns {string} 생성된 라벨
   */
  function getLabel(
    type: string,
    baseLabel: string,
    labelOptions: { showCount?: boolean; selectedPrefix?: string; filteredPrefix?: string; allPrefix?: string } = {}
  ): string {
    const { showCount = true, selectedPrefix = '선택 항목', filteredPrefix = '필터 결과', allPrefix = '전체' } = labelOptions

    // 선택된 항목이 있는 경우
    if (selectedCount.value > 0) {
      const count = selectedCount.value
      if (showCount && count > 1) {
        return `${selectedPrefix} ${baseLabel} (${count}개)`
      }
      return `${selectedPrefix} ${baseLabel}`
    }

    // 필터가 활성화된 경우
    if (hasActiveFilter.value) {
      const count = getFilteredCount()
      if (showCount) {
        return `${filteredPrefix} ${baseLabel} (${count}개)`
      }
      return `${filteredPrefix} ${baseLabel}`
    }

    // 전체 항목
    const count = getTotalCount()
    if (showCount) {
      return `${allPrefix} ${baseLabel} (${count}개)`
    }
    return `${allPrefix} ${baseLabel}`
  }

  /**
   * 개수만 반환하는 함수
   * @returns {number} 현재 컨텍스트에 맞는 항목 개수
   */
  function getCount() {
    if (selectedCount.value > 0) {
      return selectedCount.value
    }
    if (hasActiveFilter.value) {
      return getFilteredCount()
    }
    return getTotalCount()
  }

  /**
   * 타입 반환 함수
   * @returns {string} 'selected' | 'filtered' | 'all'
   */
  function getType() {
    if (selectedCount.value > 0) {
      return 'selected'
    }
    if (hasActiveFilter.value) {
      return 'filtered'
    }
    return 'all'
  }

  return {
    getLabel,
    getCount,
    getType,
  }
}
