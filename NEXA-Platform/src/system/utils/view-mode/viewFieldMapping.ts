/**
 * viewFieldMapping.js
 * 필드명 매핑 유틸리티 (모든 뷰 모드 공통)
 *
 * 각 테이블의 필드명을 표준화된 키로 매핑하여
 * 다양한 뷰 모드에서 일관되게 사용할 수 있도록 합니다.
 */

/**
 * 필드명 매핑을 사용하여 행 데이터에서 값을 가져옵니다.
 * @param {Object} row - 행 데이터 객체
 * @param {string} fieldKey - 표준화된 필드 키 (예: 'favorite', 'active')
 * @param {Object} fieldMapping - 필드명 매핑 객체
 * @returns {*} 필드 값
 */
export function getFieldValue(row, fieldKey, fieldMapping) {
  if (!row || !fieldMapping || !fieldKey) {
    return undefined
  }

  const actualFieldName = fieldMapping[fieldKey]
  if (!actualFieldName) {
    return undefined
  }

  return row[actualFieldName]
}

/**
 * 기본 필드명 매핑과 사용자 정의 매핑을 병합하여 정규화합니다.
 * @param {Object} defaultMapping - 기본 필드명 매핑
 * @param {Object} customMapping - 사용자 정의 필드명 매핑
 * @returns {Object} 정규화된 필드명 매핑
 */
export function normalizeFieldMapping(defaultMapping, customMapping) {
  if (!defaultMapping) {
    return customMapping || {}
  }

  if (!customMapping) {
    return defaultMapping
  }

  return {
    ...defaultMapping,
    ...customMapping,
  }
}

/**
 * 필드 키를 실제 필드명으로 해석합니다.
 * @param {string} fieldKey - 표준화된 필드 키
 * @param {Object} fieldMapping - 필드명 매핑 객체
 * @returns {string} 실제 필드명
 */
export function resolveFieldName(fieldKey, fieldMapping) {
  if (!fieldMapping || !fieldKey) {
    return fieldKey
  }

  return fieldMapping[fieldKey] || fieldKey
}

/**
 * 기본 필드명 매핑을 반환합니다.
 * @returns {Object} 기본 필드명 매핑
 */
export function getDefaultFieldMapping() {
  return {
    id: 'id',
    favorite: 'is_favorite',
    active: 'is_active',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
}
