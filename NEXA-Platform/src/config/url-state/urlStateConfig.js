/**
 * URL 상태 관리 기본 설정
 */

/**
 * 기본 뷰 이름 (딥 링킹 시 사용)
 *
 * @deprecated 특정 도메인(부품 관리)에 종속된 설정입니다.
 * 향후 도메인별 설정 파일로 분리하거나, 사용하는 곳에서 직접 지정하도록 변경 예정.
 */
export const DEFAULT_VIEW = 'default'

/**
 * 뷰 이름과 테이블명 매핑
 * 서버 측에서 URL의 view 파라미터를 파싱하여 어떤 테이블을 조회할지 결정하는데 사용됩니다.
 *
 * @deprecated 특정 도메인(부품 관리)에 종속된 설정입니다.
 * 향후 도메인별 설정 파일로 분리 예정.
 */
export const VIEW_TABLE_MAP = {
  'part-classes': 'part_classes',
  'part-models': 'part_models',
  'part-specs': 'part_specs',
  'part-classes-trash': 'part_classes', // 휴지통도 part_classes 테이블 사용
}

/**
 * 공유 URL에서 view 파라미터가 없을 때 사용할 기본 뷰
 *
 * @deprecated 특정 도메인(부품 관리)에 종속된 설정입니다.
 * 향후 도메인별 설정 파일로 분리하거나, 사용하는 곳에서 직접 지정하도록 변경 예정.
 */
export const DEFAULT_SHARE_VIEW = 'part-classes'

/**
 * 유효한 뷰 이름 목록
 *
 * @deprecated 특정 도메인(부품 관리)에 종속된 설정입니다.
 */
export const VALID_VIEWS = Object.keys(VIEW_TABLE_MAP)

/**
 * 뷰 이름이 유효한지 확인
 * @param {string} view - 확인할 뷰 이름
 * @returns {boolean} 유효한 뷰인지 여부
 *
 * @deprecated 특정 도메인(부품 관리)에 종속된 함수입니다.
 */
export function isValidView(view) {
  return VALID_VIEWS.includes(view)
}

/**
 * 뷰 이름으로 테이블명 가져오기
 * @param {string} view - 뷰 이름
 * @returns {string} 테이블명 (없으면 null)
 *
 * @deprecated 특정 도메인(부품 관리)에 종속된 함수입니다.
 */
export function getTableNameByView(view) {
  return VIEW_TABLE_MAP[view] || null
}

/**
 * 공유 URL에서 사용할 기본 뷰 가져오기
 * @returns {string} 기본 뷰 이름
 *
 * @deprecated 특정 도메인(부품 관리)에 종속된 함수입니다.
 */
export function getDefaultShareView() {
  return DEFAULT_SHARE_VIEW
}

/**
 * URL 상태 동기화 옵션
 */
export const URL_STATE_OPTIONS = {
  // 기본값 처리 방식
  defaultValueHandling: 'remove', // 'remove' | 'keep'

  // 히스토리 관리
  historyMode: 'replace', // 'replace' | 'push'

  // 디바운스 시간 (ms)
  debounceMs: 0,
}

/**
 * URL 상태 관리 모드
 */
export const URL_STATE_MODES = {
  SYNC: 'sync', // 동기화만
  DEEP_LINK: 'deep', // 딥 링킹 포함
  FULL: 'full', // 전체 기능
}
