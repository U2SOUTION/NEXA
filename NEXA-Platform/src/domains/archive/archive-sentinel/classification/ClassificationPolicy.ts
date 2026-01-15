/**
 * /domains/archive/archive-sentinel/classification/ClassificationPolicy.ts
 * 자동 분류 시스템의 정책 정의
 * - 판단 로직 없음
 * - 상태 없음
 * - 오직 "허용 범위"와 "우선순위 기준"만 선언
 */
export interface ClassificationPolicy {
  /** -----------------------------
   * 자동 분류 기본 허용 여부
   * ----------------------------- */

  /** 기존 분류로의 자동 귀속 허용 */
  allowAutoAssign: boolean

  /** 신규 분류 자동 생성 제안 허용 */
  allowAutoCreate: boolean

  /** 다중 분류 허용 여부 */
  allowMultiCategory: boolean

  /** -----------------------------
   * 신뢰도 / 임계값 관련
   * ----------------------------- */

  /** 기존 분류로 자동 귀속 가능한 최소 신뢰도 */
  minConfidenceForAutoAssign: number

  /** 다중 분류로 추가 가능한 최소 신뢰도 */
  minConfidenceForSecondary: number

  /** 신규 분류 제안 가능한 최소 신뢰도 */
  minConfidenceForNewCategory: number

  /** -----------------------------
   * 신규 분류 생성 제약
   * ----------------------------- */

  /** 신규 분류 이름 최소 길이 */
  minNewCategoryLength: number

  /** 신규 분류 이름 최대 길이 */
  maxNewCategoryLength: number

  /** 자동 생성이 금지된 일반적 카테고리명 */
  forbiddenCategoryNames: string[]

  /** -----------------------------
   * 다중 분류 정책
   * ----------------------------- */

  /** 최대 허용 다중 분류 개수 */
  maxSecondaryCategories: number

  /** 주 분류와 유사한 분류를 보조로 허용할지 여부 */
  allowNearDuplicateSecondary: boolean

  /** -----------------------------
   * 사용자 개입 유도 기준
   * ----------------------------- */

  /** 분류 애매함 경고를 띄우는 신뢰도 구간 */
  ambiguityConfidenceRange: [number, number]

  /** 분류 보류 시 사용자 선택을 반드시 요구할지 */
  requireUserConfirmationOnDefer: boolean

  /**
   * 보조 분류로 인정되는 최소 신뢰도
   * (0 ~ 1)
   */
  multiCategoryThreshold: number
}

/**
 * 보수적인 기본 정책
 * - 분류 난발 방지
 * - 신규 분류 생성 최소화
 */
export const DefaultClassificationPolicy: ClassificationPolicy = {
  /** 자동화 허용 */
  allowAutoAssign: true,
  allowAutoCreate: false,
  allowMultiCategory: true,

  /** 신뢰도 기준 */
  minConfidenceForAutoAssign: 0.7,
  minConfidenceForSecondary: 0.5,
  minConfidenceForNewCategory: 0.75,

  /** 신규 분류 제약 */
  minNewCategoryLength: 3,
  maxNewCategoryLength: 32,
  forbiddenCategoryNames: ['misc', 'etc', 'temp', 'note', 'doc', 'document', 'unsorted', 'draft'],

  /** 다중 분류 */
  maxSecondaryCategories: 3,
  allowNearDuplicateSecondary: false,
  multiCategoryThreshold: 0.5,

  /** 사용자 개입 */
  ambiguityConfidenceRange: [0.45, 0.65],
  requireUserConfirmationOnDefer: true,
}
