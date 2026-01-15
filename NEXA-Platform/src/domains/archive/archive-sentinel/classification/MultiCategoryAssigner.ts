/**
 * archive-sentinel/classification/MultiCategoryAssigner.ts
 * 다중 분류 할당 엔진
 * 사용자 지정 분류를 최우선으로 보호
 * 신뢰도 기반으로 대표 / 보조 분류 분리
 */

import { ClassificationPolicy } from './ClassificationPolicy'

/**
 * 단일 분류 후보
 */
export interface CategoryCandidate {
  categoryId: string
  confidence: number // 0 ~ 1
  source: 'user' | 'rule' | 'ai'
}

/**
 * 다중 분류 결과
 */
export interface CategoryAssignmentResult {
  primaryCategory: string | null
  secondaryCategories: string[]
  scoredCategories: CategoryCandidate[]
}

/**
 * 다중 분류 할당 엔진
 * - 사용자 지정 분류를 최우선으로 보호
 * - 신뢰도 기반으로 대표 / 보조 분류 분리
 */
export class MultiCategoryAssigner {
  constructor(private policy: ClassificationPolicy) {}

  /**
   * 분류 후보들을 받아 최종 분류 결과를 산출
   */
  assign(candidates: CategoryCandidate[]): CategoryAssignmentResult {
    if (candidates.length === 0) {
      return {
        primaryCategory: null,
        secondaryCategories: [],
        scoredCategories: [],
      }
    }

    // 1️⃣ 사용자 지정 분류 우선 정렬
    const sorted = [...candidates].sort((a, b) => {
      if (a.source === 'user' && b.source !== 'user') return -1
      if (a.source !== 'user' && b.source === 'user') return 1
      return b.confidence - a.confidence
    })

    // 2️⃣ 대표 분류 선정
    const primary = sorted[0]

    // 3️⃣ 다중 분류 허용 여부 판단
    let secondary: CategoryCandidate[] = []

    if (this.policy.allowMultiCategory) {
      secondary = sorted.slice(1).filter((candidate) => {
        return candidate.confidence >= this.policy.multiCategoryThreshold
      })
    }

    // 4️⃣ 최대 개수 제한
    if (this.policy.maxSecondaryCategories !== undefined) {
      secondary = secondary.slice(0, this.policy.maxSecondaryCategories)
    }

    return {
      primaryCategory: primary.categoryId,
      secondaryCategories: secondary.map((c) => c.categoryId),
      scoredCategories: sorted,
    }
  }
}
