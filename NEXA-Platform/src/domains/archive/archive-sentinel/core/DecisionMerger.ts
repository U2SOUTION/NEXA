/**
 * DecisionMerger.ts
 * -----------------
 * 여러 판단 결과를 병합하여 결정 후보 상태를 생성하는 조율자
 * 엔진이 많을때 충돌을 감지하고 병합하는 역할 과 투명하게 노출하여 사용자에게 보여주는 역할을 한다.
 * 사용자는 이 결과를 보고 최종 결정을 내릴 수 있다.
 */

import { SentinelContext } from './SentinelContext'
import { RuleEvaluationResult } from './RuleEvaluator'

/* ===========================
 * 타입 정의
 * =========================== */

export type DecisionType = 'classify' | 'discard' | 'archive' | 'keep' | 'review'

export interface DecisionRecommendation {
  type: DecisionType
  strength: number // 0~1 추천 강도
  source: 'rule' | 'ai' | 'user' | 'system'
  reasons: string[]
}

export interface DecisionConflict {
  between: DecisionType[]
  reason: string
}

export interface MergedDecision {
  recommendations: DecisionRecommendation[]
  conflicts: DecisionConflict[]
  confidence: number // 병합 결과 신뢰도
}

/* ===========================
 * DecisionMerger
 * =========================== */

export class DecisionMerger {
  merge(context: SentinelContext, ruleResult: RuleEvaluationResult, aiResult?: DecisionRecommendation[]): MergedDecision {
    const recommendations: DecisionRecommendation[] = []
    const conflicts: DecisionConflict[] = []

    /* -------------------------
     * 1. 규칙 기반 추천 생성
     * ------------------------- */

    const signals = ruleResult.signals

    if ((signals.inactivityRisk ?? 0) > 0.7) {
      recommendations.push({
        type: 'discard',
        strength: signals.inactivityRisk!,
        source: 'rule',
        reasons: ruleResult.reasons,
      })
    }

    if ((signals.userIntentStrength ?? 0) > 0.6) {
      recommendations.push({
        type: 'keep',
        strength: signals.userIntentStrength!,
        source: 'rule',
        reasons: ['사용자 명시적 의도 강함'],
      })
    }

    /* -------------------------
     * 2. AI 의견 병합 (선택)
     * ------------------------- */

    if (aiResult) {
      for (const ai of aiResult) {
        recommendations.push({
          ...ai,
          source: 'ai',
        })
      }
    }

    /* -------------------------
     * 3. 충돌 감지
     * ------------------------- */

    const decisionTypes = recommendations.map((r) => r.type)
    if (decisionTypes.includes('discard') && decisionTypes.includes('keep')) {
      conflicts.push({
        between: ['discard', 'keep'],
        reason: '폐기와 유지 판단이 동시에 존재',
      })
    }

    /* -------------------------
     * 4. 병합 신뢰도 계산
     * ------------------------- */

    const confidence = recommendations.length === 0 ? 0 : recommendations.reduce((acc, r) => acc + r.strength, 0) / recommendations.length

    return {
      recommendations,
      conflicts,
      confidence: Math.min(confidence, 1),
    }
  }
}
