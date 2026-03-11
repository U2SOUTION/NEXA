/**
 * SKU 생성 유틸리티
 * 문서: docs/database/file_upload_logic_final.md 참고
 * 
 * 부품 계층 구조에 따라 SKU를 생성합니다:
 * - 1레벨 (part_classes): {대분류약어}-{C코드}
 * - 2레벨 (part_models): {대분류약어}-{C코드}-{Table_ID}
 * - 3레벨 (part_specs): {대분류약어}-{C코드}-{Table_ID}-{Table_ID}
 */

// 대분류 약어 매핑 (서버 측)
// 클라이언트의 src/constants/categories.js와 동일하게 유지
const CATEGORY_ABBREVIATIONS = {
  '능동소자': 'ACP',      // Active Component Parts
  '수동소자': 'PAS',      // Passive Components
  '제어소자': 'CTL',      // Control Components
  '모듈보드': 'MOD',      // Module Board
  '하드웨어': 'HWD',      // Hardware
  '전원전압': 'PWR',      // Power
  '통신저장': 'COM',      // Communication Storage
  '출력구동': 'OUT',      // Output Drive
  '센서입력': 'SEN',      // Sensor Input
  '공구/소모품': 'TOL',   // Tools/Consumables
}

/**
 * 대분류명을 약어로 변환
 * @param {string} category - 대분류명 (예: '능동소자', '수동소자')
 * @returns {string} 약어 (예: 'ACP', 'PAS')
 */
export function getCategoryAbbreviation(category: string): string {
  if (!category) {
    return 'UNK' // Unknown
  }

  type CatKey = keyof typeof CATEGORY_ABBREVIATIONS
  if (category in CATEGORY_ABBREVIATIONS) {
    return CATEGORY_ABBREVIATIONS[category as CatKey]
  }

  const normalizedCategory = category.trim()
  if (normalizedCategory in CATEGORY_ABBREVIATIONS) {
    return CATEGORY_ABBREVIATIONS[normalizedCategory as CatKey]
  }

  // 매핑되지 않은 경우 UNK 반환
  console.warn(`[SKU Generator] 알 수 없는 카테고리: ${category}`)
  return 'UNK'
}

/**
 * 1레벨 SKU 생성 (part_classes)
 * 형식: {대분류약어}-{C코드}
 * @param {string} category - 대분류명
 * @param {string} cCode - C 코드
 * @returns {string} SKU (예: 'ACP-R001')
 */
export function generatePartClassSKU(category: string, cCode: string): string {
  if (!cCode) {
    throw new Error('C Code는 필수입니다.')
  }

  const abbreviation = getCategoryAbbreviation(category)
  return `${abbreviation}-${cCode}`
}

/**
 * 2레벨 SKU 생성 (part_models)
 * 형식: {대분류약어}-{C코드}-{Table_ID}
 * @param {string} category - 대분류명
 * @param {string} cCode - C 코드
 * @param {number} tableId - part_models 테이블의 id
 * @returns {string} SKU (예: 'ACP-R001-123')
 */
export function generatePartModelSKU(category: string, cCode: string, tableId: number): string {
  if (!cCode) {
    throw new Error('C Code는 필수입니다.')
  }
  if (!tableId) {
    throw new Error('Table ID는 필수입니다.')
  }

  const abbreviation = getCategoryAbbreviation(category)
  return `${abbreviation}-${cCode}-${Number(tableId)}`
}

/**
 * 3레벨 SKU 생성 (part_specs)
 * 형식: {대분류약어}-{C코드}-{Table_ID}-{Table_ID}
 * @param {string} category - 대분류명
 * @param {string} cCode - C 코드
 * @param {number} partModelId - part_models 테이블의 id
 * @param {number} partSpecId - part_specs 테이블의 id
 * @returns {string} SKU (예: 'ACP-R001-123-789')
 */
export function generatePartSpecSKU(category: string, cCode: string, partModelId: number, partSpecId: number): string {
  if (!cCode) {
    throw new Error('C Code는 필수입니다.')
  }
  if (!partModelId) {
    throw new Error('Part Model ID는 필수입니다.')
  }
  if (!partSpecId) {
    throw new Error('Part Spec ID는 필수입니다.')
  }

  const abbreviation = getCategoryAbbreviation(category)
  return `${abbreviation}-${cCode}-${Number(partModelId)}-${Number(partSpecId)}`
}

/**
 * 데이터베이스 레코드에서 SKU 생성 (자동 감지)
 * @param {Object} record - 데이터베이스 레코드
 * @param {string} record.category - 대분류명
 * @param {string} record.c_code - C 코드
 * @param {number} record.id - 레코드 ID
 * @param {number} [record.part_model_id] - part_models ID (2레벨용)
 * @param {number} [record.part_spec_id] - part_specs ID (3레벨용)
 * @returns {string} SKU
 */
export function generateSKUFromRecord(record: { category?: string; c_code?: string; id?: number; part_model_id?: number | null; part_spec_id?: number | null }): string {
  const category = record.category ?? ''
  const cCode = record.c_code ?? ''
  const { part_model_id: partModelId, part_spec_id: partSpecId } = record

  if (!cCode) {
    throw new Error('C Code는 필수입니다.')
  }

  // 3레벨: part_specs
  if (partSpecId != null && partModelId != null) {
    return generatePartSpecSKU(category, cCode, partModelId, partSpecId)
  }

  // 2레벨: part_models
  if (partModelId != null) {
    return generatePartModelSKU(category, cCode, partModelId)
  }

  // 1레벨: part_classes
  return generatePartClassSKU(category, cCode)
}

/**
 * SKU에서 정보 추출
 * @param {string} sku - SKU 문자열
 * @returns {Object} { categoryAbbr, cCode, partModelId?, partSpecId? }
 */
export function parseSKU(sku: string): { categoryAbbr: string; cCode: string; partModelId: number | null; partSpecId: number | null } {
  if (!sku) {
    throw new Error('SKU는 필수입니다.')
  }

  const parts = sku.split('-')
  if (parts.length < 2) {
    throw new Error(`잘못된 SKU 형식: ${sku}`)
  }

  const categoryAbbr = parts[0]
  const cCode = parts[1]
  const partModelIdRaw = parts.length >= 3 ? parseInt(parts[2], 10) : null
  const partSpecIdRaw = parts.length >= 4 ? parseInt(parts[3], 10) : null

  return {
    categoryAbbr,
    cCode,
    partModelId: (partModelIdRaw != null && !isNaN(partModelIdRaw)) ? partModelIdRaw : null,
    partSpecId: (partSpecIdRaw != null && !isNaN(partSpecIdRaw)) ? partSpecIdRaw : null,
  }
}

