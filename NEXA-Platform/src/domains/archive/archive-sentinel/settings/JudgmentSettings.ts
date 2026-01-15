// engines/archive-sentinel/settings/JudgmentSettings.ts

/**
 * 작성 중 / 작성 후 자동 판단 개입 설정
 */
export interface JudgmentSettings {
  /** 작성 중 감시 활성화 여부 */
  enableWritingWatch: boolean

  /**
   * 개입 강도
   * - soft  : 알림만
   * - medium: 비교/지표 제시
   * - hard  : 강한 경고
   */
  interventionLevel: 'soft' | 'medium' | 'hard'

  /**
   * 유사 문서 감시 활성화 여부
   */
  enableSimilarityWatch: boolean

  /**
   * 품질 신호 분석 활성화 여부
   */
  enableQualitySignals: boolean
}

export const DEFAULT_JUDGMENT_SETTINGS: JudgmentSettings = {
  enableWritingWatch: true,
  interventionLevel: 'soft',
  enableSimilarityWatch: true,
  enableQualitySignals: true,
}
