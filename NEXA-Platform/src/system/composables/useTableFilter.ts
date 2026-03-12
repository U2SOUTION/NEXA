/**
 * 범용 테이블 필터링 Composable
 *
 * 다양한 테이블에서 재사용 가능한 필터링 로직을 제공합니다.
 *
 * 사용법:
 * ```javascript
 * import { useTableFilter } from 'src/system/composables/useTableFilter'
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

interface FilterRefLike {
  value: unknown
}

interface CustomFilter<T = unknown> {
  key?: string
  value: unknown
  condition: (item: T, value: unknown) => boolean
}

interface SortConfig {
  primary?: string
  secondary?: string
  fallback?: string[]
}

interface TableFilterParams<T = Record<string, unknown>> {
  items: { value: T[] }
  searchText: { value: string }
  searchFields?: string[] | { value: string[] }
  filters?: Record<string, FilterRefLike>
  customFilters?: CustomFilter<T>[]
  sortConfig?: SortConfig | null
}

/**
 * 범용 테이블 필터링 Composable
 *
 * @param params - 필터링 파라미터
 * @param {import('vue').ComputedRef<Array>} params.items - 전체 아이템 목록
 * @param {import('vue').Ref<string>} params.searchText - 검색 텍스트
 * @param {Array<string>} params.searchFields - 검색할 필드명 배열 (예: ['name', 'c_code', 'description'])
 * @param {Object<string, import('vue').Ref>} params.filters - 간단한 필터 맵 (필드명: 값)
 * @param {Array<Object>} params.customFilters - 커스텀 필터 배열
 * @param {Object} params.sortConfig - 정렬 설정
 * @param {string} params.sortConfig.primary - 주 정렬 필드
 * @param {string} params.sortConfig.secondary - 보조 정렬 필드
 * @param {Array<string>} params.sortConfig.fallback - 추가 정렬 필드 배열
 * @returns 필터링된 결과 및 상태
 */
export function useTableFilter<T = Record<string, unknown>>({
  items,
  searchText,
  searchFields = [],
  filters = {},
  customFilters = [],
  sortConfig = null,
}: TableFilterParams<T>) {
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

    if (searchText.value && actualSearchFields && (actualSearchFields as string[]).length > 0) {
      const search = searchText.value.toLowerCase()
      filtered = filtered.filter((item: T) => {
        return (actualSearchFields as string[]).some((field: string) => {
          const value = (item as Record<string, unknown>)[field]
          return value && String(value).toLowerCase().includes(search)
        })
      })
    }

    // 간단한 필터 (필드명과 값이 일치하는지 확인)
    Object.keys(filters).forEach((fieldName: string) => {
      const filterValue = filters[fieldName]
      if (
        filterValue &&
        filterValue.value !== null &&
        filterValue.value !== undefined &&
        filterValue.value !== ''
      ) {
        filtered = filtered.filter((item: T) => {
          const itemValue = (item as Record<string, unknown>)[fieldName]
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
        filtered = filtered.filter((item: T) => {
          return customFilter.condition(item, actualValue)
        })
      }
    })

    // 정렬
    if (sortConfig) {
      filtered = filtered.sort((a: T, b: T) => {
        const aRec = a as Record<string, unknown>
        const bRec = b as Record<string, unknown>
        // 주 정렬 필드
        if (sortConfig!.primary) {
          const aPrimary = (aRec[sortConfig!.primary!] as number) ?? 0
          const bPrimary = (bRec[sortConfig!.primary!] as number) ?? 0
          if (aPrimary !== bPrimary) return aPrimary - bPrimary
        }

        // 보조 정렬 필드
        if (sortConfig!.secondary) {
          const aSecondary = (aRec[sortConfig!.secondary!] as number) ?? 0
          const bSecondary = (bRec[sortConfig!.secondary!] as number) ?? 0
          if (aSecondary !== bSecondary) return aSecondary - bSecondary
        }

        // 추가 정렬 필드 (fallback)
        if (sortConfig!.fallback && sortConfig!.fallback.length > 0) {
          for (const field of sortConfig!.fallback) {
            if (field === 'updated_at') {
              const aUpdated = aRec.updated_at ? new Date(String(aRec.updated_at)).getTime() : 0
              const bUpdated = bRec.updated_at ? new Date(String(bRec.updated_at)).getTime() : 0
              if (aUpdated !== bUpdated) return bUpdated - aUpdated // DESC
            } else {
              const aValue = (aRec[field] as number) ?? 0
              const bValue = (bRec[field] as number) ?? 0
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
    const hasSimpleFilter = Object.keys(filters).some((fieldName: string) => {
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
    const hasCustomFilter = customFilters.some((customFilter: CustomFilter<T>) => {
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
