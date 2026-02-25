/**
 * /domains/archive/archive-sentinel/classification/AutoClassifier.ts
 * 자동 분류 엔진
 * 사용자 분류 우선, 기존 분류 유사도 계산, 신규 분류 후보 제안
 * 유사도 계산 - 이후 AI/벡터 교체 예정, 다른 도메인에서 사용할때 수정 후 사용
 * 분류 후보 제안 - 제목에서 명사 추출 → 임시 카테고리
 */

import { SentinelContext } from '../core/SentinelContext'
import { ClassificationPolicy } from './ClassificationPolicy'

//분류 출력
export interface ClassificationResult {
  primaryCandidate?: string
  secondaryCandidates: string[]
  newCategorySuggestion?: string
  confidence: number
  reason: string[]
}

export class AutoClassifier {
  constructor(
    private readonly policy: ClassificationPolicy,
    private readonly existingCategories: string[],
  ) {}

  classify(context: SentinelContext): ClassificationResult {
    const reasons: string[] = []

    /** STEP 1: 사용자 분류 우선 */
    const categoryIds = context.currentCategoryIds ?? []
    if (categoryIds.length > 0) {
      reasons.push('사용자가 이미 분류를 지정함')

      return {
        primaryCandidate: context.categories?.[0] ?? context.currentCategoryIds?.[0],
        secondaryCandidates: [],
        confidence: 0.9,
        reason: reasons,
      }
    }

    /** STEP 2: 기존 분류 유사도 계산 */
    const scored = this.existingCategories.map((cat) => ({
      category: cat,
      score: this.calculateSimilarity(context, cat),
    }))

    scored.sort((a, b) => b.score - a.score)

    const best = scored[0]

    if (best && best.score >= 0.6) {
      reasons.push(`기존 분류 '${best.category}' 와 높은 유사도`)

      return {
        primaryCandidate: best.category,
        secondaryCandidates: scored
          .slice(1, 3)
          .filter((s) => s.score >= 0.4)
          .map((s) => s.category),
        confidence: best.score,
        reason: reasons,
      }
    }

    /** STEP 3: 신규 분류 후보 */
    if (this.policy.allowAutoCreate) {
      const suggestion = this.suggestNewCategory(context)

      reasons.push('기존 분류에 명확히 속하지 않음')

      return {
        secondaryCandidates: [],
        newCategorySuggestion: suggestion,
        confidence: 0.4,
        reason: reasons,
      }
    }

    return {
      secondaryCandidates: [],
      confidence: 0.1,
      reason: ['분류 보류'],
    }
  }

  /** ------------------ 내부 유틸 ------------------ */
  //유사도 계산 - 이후 AI/벡터 교체 예정, 다른 도메인에서 사용할때 수정 후 사용
  private calculateSimilarity(context: SentinelContext, category: string): number {
    // 🔧 지금은 단순 키워드 기반 (향후 AI/벡터 교체)
    const text = `${context.title ?? ''} ${context.summary ?? ''} ${(context.keywords ?? []).join(' ')}`.toLowerCase()
    return text.includes(category.toLowerCase()) ? 0.7 : 0.2
  }

  private suggestNewCategory(context: SentinelContext): string {
    // 제목에서 명사 추출 → 임시 카테고리
    if (context.title) {
      return context.title.split(' ')[0]
    }
    return 'unsorted'
  }
}
