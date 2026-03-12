/**
 * URL 상태 파라미터 매핑
 *
 * 긴 파라미터 이름을 짧은 이름으로 매핑합니다.
 */

/**
 * 파라미터 이름 매핑 (긴 이름 → 짧은 이름)
 */
export const URL_STATE_PARAMS = {
  selected: 'sel', // 선택된 항목 ID 목록 (하이픈으로 구분)
  view: 'v', // 뷰 이름 (part-classes, part-models, part-specs 등)
  search: 'q', // 검색어 (query의 q)
  category: 'cat', // 카테고리 필터
  status: 'st', // 상태 필터
  page: 'p', // 페이지 번호
  // 추가 가능
}

/**
 * 역매핑 (짧은 이름 → 긴 이름)
 */
export const URL_STATE_PARAMS_REVERSE = Object.fromEntries(
  Object.entries(URL_STATE_PARAMS).map(([key, value]) => [value, key]),
)

/**
 * 파라미터 이름 가져오기
 * @param {string} paramName - 파라미터 이름 (긴 이름 또는 짧은 이름)
 * @returns {string} 짧은 파라미터 이름
 */
export function getURLStateParamName(paramName: string): string {
  return (paramName in URL_STATE_PARAMS ? URL_STATE_PARAMS[paramName as keyof typeof URL_STATE_PARAMS] : paramName) ?? paramName
}

/**
 * 역매핑 파라미터 이름 가져오기
 * @param {string} shortName - 짧은 파라미터 이름
 * @returns {string} 긴 파라미터 이름
 */
export function getURLStateParamNameReverse(shortName: string): string {
  return (shortName in URL_STATE_PARAMS_REVERSE ? URL_STATE_PARAMS_REVERSE[shortName as keyof typeof URL_STATE_PARAMS_REVERSE] : shortName) ?? shortName
}
