// engines/archive-sentinel/settings/ClassificationSettings.ts

/**
 * 자동 분류 전체 동작을 제어하는 설정
 * - 분류 "판단"이 아니라 분류 "정책"만 정의
 */
export interface ClassificationSettings {
  /** 자동 분류 기능 활성화 여부 */
  enabled: boolean

  /**
   * 사용자가 직접 지정한 분류를
   * 자동 분류보다 우선할지 여부
   */
  userOverridePriority: boolean

  /**
   * 신규 분류 자동 생성 허용 여부
   */
  allowAutoCreateCategory: boolean

  /**
   * 다중 분류 허용 여부
   */
  allowMultiCategory: boolean

  /**
   * 다중 분류로 인정할 최소 신뢰도 (0 ~ 1)
   */
  multiCategoryThreshold: number
}

export const DEFAULT_CLASSIFICATION_SETTINGS: ClassificationSettings = {
  enabled: true,
  userOverridePriority: true,
  allowAutoCreateCategory: true,
  allowMultiCategory: true,
  multiCategoryThreshold: 0.6,
}
