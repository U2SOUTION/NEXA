/**
 * EscalationPolicy.ts
 * /archive-sentinel/settings/EscalationPolicy.ts
 * -------------------
 * 자동 판단 결과를 어디까지 허용할지 결정하고,
 * 인간 개입(Human-in-the-loop)이 필요한 시점을 판단하는 정책
 */
// settings/EscalationPolicy.ts

import { BufferDecision, BufferState } from './BufferPolicy'

/**
 * EscalationAction
 * - 실제 행동은 상위 시스템이 수행
 */
export enum EscalationAction {
  NONE = 'none', // 개입 없음
  NOTIFY = 'notify', // 조용한 알림 (배너, 인디케이터)
  REQUEST_REVIEW = 'review', // 검토 요청
  REQUIRE_DECISION = 'decision', // 명시적 판단 요구
}

/**
 * EscalationPolicyConfig
 * - 인간 개입의 성격을 정의
 */
export interface EscalationPolicyConfig {
  allowAutoEscalation: boolean
  minConfidenceToNotify: number
  minConfidenceToRequestReview: number
  minConfidenceToRequireDecision: number
}

/**
 * EscalationPolicy
 * - 책임을 시스템 → 인간으로 넘길지 결정
 */
export class EscalationPolicy {
  private readonly config: EscalationPolicyConfig

  constructor(config?: Partial<EscalationPolicyConfig>) {
    this.config = {
      allowAutoEscalation: true,
      minConfidenceToNotify: 0.5,
      minConfidenceToRequestReview: 0.7,
      minConfidenceToRequireDecision: 0.85,
      ...config,
    }
  }

  /**
   * Escalation 여부 판단
   * - 판단 대상은 오직 BufferState
   */
  evaluate(state: BufferState): EscalationAction {
    if (!this.config.allowAutoEscalation) {
      return EscalationAction.NONE
    }

    if (state.decision !== BufferDecision.ESCALATABLE) {
      return EscalationAction.NONE
    }

    if (state.confidence >= this.config.minConfidenceToRequireDecision) {
      return EscalationAction.REQUIRE_DECISION
    }

    if (state.confidence >= this.config.minConfidenceToRequestReview) {
      return EscalationAction.REQUEST_REVIEW
    }

    if (state.confidence >= this.config.minConfidenceToNotify) {
      return EscalationAction.NOTIFY
    }

    return EscalationAction.NONE
  }

  /**
   * 정책 변경 시점에서도 안전하게 사용 가능
   */
  isEscalationAllowed(): boolean {
    return this.config.allowAutoEscalation
  }
}
