/**
 * 범용 테이블 복제 관리 Composable
 *
 * 기능:
 * - 항목 복제
 * - 중복 필드 자동 처리
 * - 고유값 생성
 * - 위치 계산 (콜백으로 처리)
 *
 * @param {Object} options - 설정 옵션
 * @param {Array} options.items - 전체 항목 목록 (ref 또는 computed)
 * @param {Array} options.filteredItems - 필터링된 항목 목록 (ref 또는 computed, 위치 계산용)
 * @param {Object} options.uniqueFields - 중복 체크 필드 설정
 * @param {Object} options.uniqueFields.name - 이름 필드 설정 (기본값: { field: 'name', generateFn: generateUniqueName })
 * @param {Object} options.uniqueFields.c_code - 코드 필드 설정 (기본값: { field: 'c_code', generateFn: generateUniqueCCode, maxLength: 6 })
 * @param {Function} options.onDuplicate - 복제 완료 시 콜백 (duplicatedData, sourceItem, targetIndex 전달)
 * @param {Function} options.calculatePosition - 위치 계산 함수 (sourceItem, targetIndex, filteredItems 전달, 새 sort_order 반환)
 * @param {Function} options.onError - 에러 발생 시 콜백 (error 전달)
 *
 * @returns {Object} 복제 관련 함수
 */

import { unref } from 'vue'

interface ItemWithNameAndId {
  id?: unknown
  name?: string
}

interface ItemWithCodeAndId {
  id?: unknown
  c_code?: string
}

/**
 * 중복되지 않는 고유한 이름 생성
 * @param {string} originalName - 원본 이름
 * @param {Array} items - 전체 항목 목록
 * @param {number|null} excludeId - 제외할 항목 ID
 * @returns {string} 고유한 이름
 */
function generateUniqueName(
  originalName: string,
  items: ItemWithNameAndId[] | { value: ItemWithNameAndId[] },
  excludeId: unknown = null
): string {
  if (!originalName) return originalName

  let newName = `${originalName} (복사본)`
  let counter = 1

  const itemsValue = unref(items)
  while (itemsValue.some((item: ItemWithNameAndId) => item.name === newName && item.id !== excludeId)) {
    newName = `${originalName} (복사본 ${counter})`
    counter++
    // 무한 루프 방지
    if (counter > 1000) break
  }
  return newName
}

/**
 * 중복되지 않는 고유한 코드 생성 (6자 제한 고려)
 * @param {string} originalCode - 원본 코드
 * @param {Array} items - 전체 항목 목록
 * @param {number|null} excludeId - 제외할 항목 ID
 * @param {number} maxLength - 최대 길이 (기본값: 6)
 * @returns {string} 고유한 코드
 */
function generateUniqueCCode(
  originalCode: string,
  items: ItemWithCodeAndId[] | { value: ItemWithCodeAndId[] },
  excludeId: unknown = null,
  maxLength = 6
): string {
  if (!originalCode) return originalCode

  const itemsValue = unref(items)
  // c_code는 최대 6자 제한
  // 마지막 문자를 숫자로 변경하거나 접미사 추가
  let base = originalCode.slice(0, maxLength - 1) // 마지막 1자 공간 확보
  let counter = 1
  let newCode = `${base}${counter}`

  // maxLength 제한을 고려하여 생성
  while (itemsValue.some((item: ItemWithCodeAndId) => item.c_code === newCode && item.id !== excludeId)) {
    counter++
    if (counter <= 9) {
      // 1자리 숫자 (0-9)
      newCode = `${base}${counter}`
    } else if (counter <= 99) {
      // 2자리 숫자 (10-99) - base를 1자 줄임
      newCode = `${base.slice(0, base.length - 1)}${counter}`
    } else {
      // 3자리 숫자 (100-999) - base를 2자 줄임
      newCode = `${base.slice(0, base.length - 2)}${counter}`
      if (counter > 999) break // 무한 루프 방지
    }
  }
  return newCode
}

interface UniqueFieldConfig {
  field: string
  generateFn: (
    original: string,
    items: Record<string, unknown>[] | { value: Record<string, unknown>[] },
    excludeId?: unknown,
    maxLength?: number
  ) => string
  maxLength?: number
}

interface ItemWithSortOrder extends Record<string, unknown> {
  id?: unknown
  sort_order?: number
}

interface TableDuplicateOptions<T extends ItemWithSortOrder = ItemWithSortOrder> {
  items?: T[] | { value: T[] }
  filteredItems?: T[] | { value: T[] }
  uniqueFields?: Record<string, UniqueFieldConfig>
  onDuplicate?: (duplicatedData: T, sourceItem: T, targetIndex: number) => void
  calculatePosition?: (sourceItem: T, targetIndex: number, filteredItems: T[]) => number
  onError?: (error: unknown) => void
}

export function useTableDuplicate<T extends ItemWithSortOrder = ItemWithSortOrder>(
  options: TableDuplicateOptions<T> = {}
) {
  const {
    items = [] as T[],
    filteredItems = [] as T[],
    uniqueFields = {
      name: {
        field: 'name',
        generateFn: generateUniqueName,
      },
      c_code: {
        field: 'c_code',
        generateFn: generateUniqueCCode,
        maxLength: 6,
      },
    },
    onDuplicate = () => {},
    calculatePosition = (sourceItem: T, _targetIndex: number, filteredItemsArr: T[]) => {
      const srcOrder = (sourceItem.sort_order ?? 0)
      const sourceIndex = filteredItemsArr.findIndex((item: T) => item.id === sourceItem.id)
      const nextItem = filteredItemsArr[sourceIndex + 1]

      if (nextItem) {
        const srcOrder = (sourceItem.sort_order ?? 0)
        const nextOrder = (nextItem.sort_order ?? 0)
        const newOrder = (srcOrder + nextOrder) / 2
        // 중간값이 같거나 범위를 벗어나면 원본 + 1
        if (newOrder <= srcOrder || newOrder >= nextOrder) {
          return srcOrder + 1
        }
        return newOrder
      } else {
        // 다음 항목이 없으면 원본 + 10
        return srcOrder + 10
      }
    },
    onError = () => {},
  } = options

  /**
   * 항목 복제
   * @param {Object} sourceItem - 복제할 원본 항목
   * @param {Object} additionalConfig - 추가 설정
   * @param {Array<string>} additionalConfig.excludeFields - 제외할 필드 목록 (기본값: ['id', 'created_at', 'updated_at'])
   * @param {Object} additionalConfig.overrideFields - 덮어쓸 필드 값
   * @returns {Object|null} 복제된 데이터 (에러 시 null)
   */
  function duplicateItem(
    sourceItem: T,
    additionalConfig: { excludeFields?: string[]; overrideFields?: Record<string, unknown> } = {}
  ): T | null {
    if (!sourceItem) {
      onError(new Error('복제할 항목이 없습니다.'))
      return null
    }

    try {
      const { excludeFields = ['id', 'created_at', 'updated_at'], overrideFields = {} } =
        additionalConfig

      const duplicatedData = { ...sourceItem } as T & Record<string, unknown>

      excludeFields.forEach((field: string) => {
        delete duplicatedData[field]
      })

      // 3. 덮어쓸 필드 적용
      Object.assign(duplicatedData, overrideFields)

      // 4. 중복 필드 자동 처리
      const itemsValue = unref(items)
      Object.keys(uniqueFields).forEach((key: string) => {
        const config = uniqueFields[key]
        const fieldName = config.field
        const originalValue = (sourceItem as Record<string, unknown>)[fieldName]

        if (originalValue !== undefined && originalValue !== null) {
          if (config.maxLength) {
            // maxLength가 있으면 (c_code 등)
            duplicatedData[fieldName] = config.generateFn(
              originalValue,
              itemsValue,
              sourceItem.id,
              config.maxLength,
            )
          } else {
            // maxLength가 없으면 (name 등)
            duplicatedData[fieldName] = config.generateFn(originalValue, itemsValue, sourceItem.id)
          }
        }
      })

      // 5. 위치 계산
      const filteredItemsValue = unref(filteredItems)
      const targetIndex = filteredItemsValue.findIndex((item: T) => item.id === sourceItem.id)
      const newSortOrder = calculatePosition(sourceItem, targetIndex, filteredItemsValue)
      duplicatedData.sort_order = newSortOrder

      // 6. sub_sort_order 초기화 (있는 경우)
      if (duplicatedData.sub_sort_order !== undefined) {
        duplicatedData.sub_sort_order = 0
      }

      // 7. 콜백 호출
      onDuplicate(duplicatedData, sourceItem, targetIndex)

      return duplicatedData
    } catch (error) {
      onError(error)
      return null
    }
  }

  return {
    duplicateItem,
    generateUniqueName,
    generateUniqueCCode,
  }
}
