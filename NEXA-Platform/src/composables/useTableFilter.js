/**
 * 범용 테이블 필터링 Composable
 *
 * 다양한 테이블에서 재사용 가능한 필터링 로직을 제공합니다.
 *
 * 사용법:
 * ```javascript
 * import { useTableFilter } from 'src/composables/useTableFilter'
 *
 * const { filteredItems, hasActiveFilter } = useTableFilter({
 *   items: partClasses,
 *   searchText,
 *   searchFields: ['name', 'c_code', 'description'], // 검색할 필드명 배열
 *   filters: {
 *     category: selectedCategory,
 *     status: statusFilter,
 *   },
 *   customFilters: [
 *     {
 *       key: 'fileFilter',
 *       value: fileFilter,
 *       condition: (item, value) => {
 *         if (value === 'has_files') return (item.file_upload_count || 0) > 0
 *         if (value === 'no_files') return (item.file_upload_count || 0) === 0
 *         return true
 *       }
 *     }
 *   ],
 *   sortConfig: {
 *     primary: 'sort_order',
 *     secondary: 'sub_sort_order',
 *     fallback: ['updated_at', 'id']
 *   }
 * })
 * ```
 */

import { computed } from 'vue'

/**
 * 범용 테이블 필터링 Composable
 *
 * @param {Object} params - 필터링 파라미터
 * @param {import('vue').ComputedRef<Array>} params.items - 전체 아이템 목록
 * @param {import('vue').Ref<string>} params.searchText - 검색 텍스트
 * @param {Array<string>} params.searchFields - 검색할 필드명 배열 (예: ['name', 'c_code', 'description'])
 * @param {Object<string, import('vue').Ref>} params.filters - 간단한 필터 맵 (필드명: 값)
 * @param {Array<Object>} params.customFilters - 커스텀 필터 배열
 * @param {Object} params.sortConfig - 정렬 설정
 * @param {string} params.sortConfig.primary - 주 정렬 필드
 * @param {string} params.sortConfig.secondary - 보조 정렬 필드
 * @param {Array<string>} params.sortConfig.fallback - 추가 정렬 필드 배열
 * @returns {Object} 필터링된 결과 및 상태
 */
export function useTableFilter({
  items,
  searchText,
  searchFields = [],
  filters = {},
  customFilters = [],
  sortConfig = null,
}) {
  /**
   * 필터링된 목록
   */
  const filteredItems = computed(() => {
    let filtered = items.value

    // 검색 필터
    // searchFields가 ref/computed인 경우 .value로 접근, 그렇지 않으면 직접 사용
    const actualSearchFields =
      searchFields && typeof searchFields === 'object' && 'value' in searchFields
        ? searchFields.value
        : searchFields

    if (searchText.value && actualSearchFields && actualSearchFields.length > 0) {
      const search = searchText.value.toLowerCase()
      filtered = filtered.filter((item) => {
        return actualSearchFields.some((field) => {
          const value = item[field]
          return value && String(value).toLowerCase().includes(search)
        })
      })
    }

    // 간단한 필터 (필드명과 값이 일치하는지 확인)
    Object.keys(filters).forEach((fieldName) => {
      const filterValue = filters[fieldName]
      if (
        filterValue &&
        filterValue.value !== null &&
        filterValue.value !== undefined &&
        filterValue.value !== ''
      ) {
        filtered = filtered.filter((item) => {
          const itemValue = item[fieldName]
          return itemValue === filterValue.value
        })
      }
    })

    // 커스텀 필터
    customFilters.forEach((customFilter) => {
      const filterValue = customFilter.value
      // filterValue가 ref/computed인 경우 .value로 접근, 그렇지 않으면 직접 사용
      const actualValue =
        filterValue && typeof filterValue === 'object' && 'value' in filterValue
          ? filterValue.value
          : filterValue

      // null, undefined, 빈 문자열이 아니고, boolean false가 아닌 경우에만 필터 적용
      if (
        actualValue !== null &&
        actualValue !== undefined &&
        actualValue !== '' &&
        actualValue !== false
      ) {
        filtered = filtered.filter((item) => {
          return customFilter.condition(item, actualValue)
        })
      }
    })

    // 정렬
    if (sortConfig) {
      filtered = filtered.sort((a, b) => {
        // 주 정렬 필드
        if (sortConfig.primary) {
          const aPrimary = a[sortConfig.primary] || 0
          const bPrimary = b[sortConfig.primary] || 0
          if (aPrimary !== bPrimary) return aPrimary - bPrimary
        }

        // 보조 정렬 필드
        if (sortConfig.secondary) {
          const aSecondary = a[sortConfig.secondary] || 0
          const bSecondary = b[sortConfig.secondary] || 0
          if (aSecondary !== bSecondary) return aSecondary - bSecondary
        }

        // 추가 정렬 필드 (fallback)
        if (sortConfig.fallback && sortConfig.fallback.length > 0) {
          for (const field of sortConfig.fallback) {
            if (field === 'updated_at') {
              const aUpdated = a.updated_at ? new Date(a.updated_at).getTime() : 0
              const bUpdated = b.updated_at ? new Date(b.updated_at).getTime() : 0
              if (aUpdated !== bUpdated) return bUpdated - aUpdated // DESC
            } else {
              const aValue = a[field] || 0
              const bValue = b[field] || 0
              if (aValue !== bValue) return aValue - bValue
            }
          }
        }

        return 0
      })
    }

    return filtered
  })

  /**
   * 활성 필터 여부
   */
  const hasActiveFilter = computed(() => {
    // 검색 텍스트 확인
    if (searchText.value) return true

    // 간단한 필터 확인
    const hasSimpleFilter = Object.keys(filters).some((fieldName) => {
      const filterValue = filters[fieldName]
      return (
        filterValue &&
        filterValue.value !== null &&
        filterValue.value !== undefined &&
        filterValue.value !== ''
      )
    })
    if (hasSimpleFilter) return true

    // 커스텀 필터 확인
    const hasCustomFilter = customFilters.some((customFilter) => {
      const filterValue = customFilter.value
      // filterValue가 ref/computed인 경우 .value로 접근, 그렇지 않으면 직접 사용
      const actualValue =
        filterValue && typeof filterValue === 'object' && 'value' in filterValue
          ? filterValue.value
          : filterValue

      // null, undefined, 빈 문자열이 아니고, boolean false가 아닌 경우에만 필터 활성화로 간주
      return (
        actualValue !== null &&
        actualValue !== undefined &&
        actualValue !== '' &&
        actualValue !== false
      )
    })
    if (hasCustomFilter) return true

    return false
  })

  return {
    filteredItems,
    hasActiveFilter,
  }
}
