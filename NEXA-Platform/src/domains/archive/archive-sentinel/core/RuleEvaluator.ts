/**
 * RuleEvaluator.ts
 * ----------------
 * AI 없이 동작하는 1차 규칙 기반 신호 생성기
 * 판단하지 않고, 신호만 만든다
 */

import { SentinelContext } from './SentinelContext'

export interface RuleEvaluationResult {
  signals: {
    inactivityRisk?: number // 장기 미사용 위험
    redundancyRisk?: number // 중복 가능성
    structuralRisk?: number // 구조 실패 가능성
    userIntentStrength?: number // 사용자 의도 강도
  }
  reasons: string[]
}

export class RuleEvaluator {
  evaluate(context: SentinelContext): RuleEvaluationResult {
    const reasons: string[] = []
    const signals: RuleEvaluationResult['signals'] = {}

    /* -------------------------
     * 1. 장기 미접근 위험
     * ------------------------- */
    if (context.lastAccessedAt) {
      const days = (Date.now() - context.lastAccessedAt.getTime()) / (1000 * 60 * 60 * 24)

      if (days > 30) {
        signals.inactivityRisk = Math.min(days / 90, 1)
        reasons.push(`최근 ${Math.floor(days)}일간 열람 없음`)
      }
    }

    /* -------------------------
     * 2. 구조적 미완성 위험
     * ------------------------- */
    if (context.lifecycleStage === 'draft' && (context.editCount ?? 0) < 3) {
      signals.structuralRisk = 0.6
      reasons.push('초안 상태에서 편집 이력 부족')
    }

    /* -------------------------
     * 3. 사용자 의도 강도
     * ------------------------- */
    let intent = 0

    if (context.isPinned) intent += 0.5
    if (context.userMarkedImportant) intent += 0.5
    if (context.userExplicitCategory) intent += 0.3

    if (intent > 0) {
      signals.userIntentStrength = Math.min(intent, 1)
      reasons.push('사용자 명시적 의도 감지')
    }

    /* -------------------------
     * 4. 반복 생성 가능성
     * ------------------------- */
    if ((context.viewCount ?? 0) === 0 && (context.editCount ?? 0) <= 1) {
      signals.redundancyRisk = 0.4
      reasons.push('열람/편집 이력이 거의 없음')
    }

    return {
      signals,
      reasons,
    }
  }
}
