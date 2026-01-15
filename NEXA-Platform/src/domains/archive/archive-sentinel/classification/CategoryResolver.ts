/**
 * /domains/archive/archive-sentinel/classification/CategoryResolver.ts
 * 분류 판단 결과 분석 후 제시된 결과를 분석하여 사용자에게 최종 분류 결정을 제시
 * 기존 분류 자동 귀속 판단, 신규 분류 제안 판단, 보류
 */

import { ClassificationPolicy } from './ClassificationPolicy'
import { ClassificationResult } from './AutoClassifier'

interface CategoryResolutionResult {
  resolvedPrimary?: string // 확정된 주 분류 (있다면)
  pendingNewCategory?: string // 신규 분류 후보 (보류 상태)
  secondaryCategories: string[] // 다중 분류 후보
  action: 'accept-existing' | 'propose-new' | 'defer'
  reason: string[]
}

export class CategoryResolver {
  constructor(
    private readonly policy: ClassificationPolicy,
    private readonly existingCategories: string[],
  ) {}

  resolve(result: ClassificationResult): CategoryResolutionResult {
    const reasons: string[] = []

    /** STEP 1: 기존 분류 자동 귀속 판단 */
    if (result.primaryCandidate && result.confidence >= 0.7 && this.existingCategories.includes(result.primaryCandidate)) {
      reasons.push(`기존 분류 '${result.primaryCandidate}'에 충분한 신뢰도로 귀속 가능`)

      return {
        resolvedPrimary: result.primaryCandidate,
        secondaryCategories: result.secondaryCandidates ?? [],
        action: 'accept-existing',
        reason: reasons,
      }
    }

    /** STEP 2: 신규 분류 제안 판단 */
    if (result.newCategorySuggestion && this.policy.allowAutoCreate && this.isValidNewCategory(result.newCategorySuggestion)) {
      reasons.push(`기존 분류에 속하지 않으며 신규 분류 '${result.newCategorySuggestion}' 제안 가능`)

      return {
        pendingNewCategory: result.newCategorySuggestion,
        secondaryCategories: [],
        action: 'propose-new',
        reason: reasons,
      }
    }

    /** STEP 3: 보류 */
    reasons.push('분류 판단 보류 (사용자 결정 필요)')

    return {
      secondaryCategories: [],
      action: 'defer',
      reason: reasons,
    }
  }

  /** ------------------ 내부 유틸 ------------------ */

  private isValidNewCategory(candidate: string): boolean {
    const normalized = candidate.toLowerCase()

    // 너무 짧거나 의미 없는 이름 방지
    if (normalized.length < 3) return false

    // 기존 분류와 거의 같은 경우 방지
    if (this.existingCategories.some((cat) => cat.toLowerCase() === normalized)) return false

    // 지나치게 일반적인 분류 방지 (확장 가능)
    const forbidden = ['note', 'doc', 'temp', 'misc', 'etc', 'unsorted']
    if (forbidden.includes(normalized)) return false

    return true
  }
}
