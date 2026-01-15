// engines/archive-sentinel/settings/DiscardSettings.ts

/**
 * 자동 패기(폐기) 정책 설정
 */
export interface DiscardSettings {
  /** 자동 폐기 기능 활성화 여부 */
  enabled: boolean

  /**
   * 폐기 판단 후 실제 이동까지의 유예 기간 (일)
   */
  gracePeriodDays: number

  /**
   * 폐기 전 요약본 생성 여부
   */
  preserveSummary: boolean

  /**
   * 자동 폐기를 허용하는 최대 판단 신뢰도 임계값
   * (너무 낮으면 폐기 안 함)
   */
  autoDiscardThreshold: number
}

export const DEFAULT_DISCARD_SETTINGS: DiscardSettings = {
  enabled: true,
  gracePeriodDays: 7,
  preserveSummary: true,
  autoDiscardThreshold: 0.7,
}
