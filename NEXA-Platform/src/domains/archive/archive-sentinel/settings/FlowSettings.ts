// engines/archive-sentinel/settings/FlowSettings.ts

/**
 * 시간 흐름 및 문서 리듬 관리 설정
 */
export interface FlowSettings {
  /** 흐름 분석 기능 활성화 여부 */
  enabled: boolean

  /**
   * 최근 문서 분석 기준 기간 (일)
   */
  recentWindowDays: number

  /**
   * 문서 편중 경고 임계 비율 (0 ~ 1)
   */
  imbalanceThreshold: number

  /**
   * 현재 작업 맥락에 맞지 않는 문서
   * 노출을 제한할지 여부
   */
  enableAttentionRouting: boolean
}

export const DEFAULT_FLOW_SETTINGS: FlowSettings = {
  enabled: true,
  recentWindowDays: 7,
  imbalanceThreshold: 0.7,
  enableAttentionRouting: true,
}
