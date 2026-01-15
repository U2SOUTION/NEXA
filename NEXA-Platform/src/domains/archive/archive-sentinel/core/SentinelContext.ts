/**
 * SentinelContext.ts
 * ------------------
 * Sentinel 내부에서 공유되는 "상황 스냅샷"
 * 판단하지 않고, 해석하지 않고, 계산하지 않는다.
 * 오직 현재 상태를 정직하게 보존한다.
 */

// 나중에 사용할 때 사용하자.
// import { SentinelContext } from './SentinelContext';
// import { EscalationAction } from '../settings/EscalationPolicy';

/* ===========================
 * 기본 타입
 * =========================== */

/**
 * Sentinel이 관여하는 도메인
 */
export type SentinelDomain = 'archive' | 'board' | 'panel' | 'track' | 'parts' | 'system'

/**
 * 문서 또는 엔티티의 생애주기 상태
 */
export type LifecycleStage = 'draft' | 'active' | 'idle' | 'archived' | 'discard_candidate' | 'discarded'

/**
 * Sentinel이 관찰하는 액션 유형
 */
export type SentinelAction = 'create' | 'update' | 'classify' | 'move' | 'discard' | 'link' | 'analyze'

/* ===========================
 * 핵심 Context 구조
 * =========================== */

export interface SentinelContext {
  /* ---------------------------
   * 정체성
   * --------------------------- */
  id: string // 문서 또는 엔티티 ID
  domain: SentinelDomain // 소속 도메인
  action: SentinelAction // 현재 발생한 행동

  /* ---------------------------
   * 내용 요약 (원본은 다루지 않음)
   * --------------------------- */
  title?: string
  summary?: string // 짧은 요약 (AI/규칙 결과 가능)
  keywords?: string[]

  /* ---------------------------
   * 시간 맥락
   * --------------------------- */
  createdAt: Date
  updatedAt: Date
  lastAccessedAt?: Date

  /* ---------------------------
   * 구조적 위치
   * --------------------------- */
  currentCategoryIds?: string[] // 현재 분류
  relatedEntityIds?: string[] // 연결된 문서/패널/부품 등

  /* ---------------------------
   * 상태 정보
   * --------------------------- */
  lifecycleStage: LifecycleStage
  isPinned?: boolean // 사용자 명시 고정
  isIrreversibleAction?: boolean // 되돌릴 수 없는 작업 여부

  /* ---------------------------
   * 사용자 의도 신호
   * --------------------------- */
  userExplicitCategory?: boolean // 사용자가 직접 분류했는가
  userMarkedImportant?: boolean // 중요 표시 여부

  /* ---------------------------
   * 행동 이력 요약
   * --------------------------- */
  viewCount?: number
  editCount?: number
  userOverrideCount?: number // 자동 판단 거부 횟수

  /* ---------------------------
   * 외부 판단 결과 수용 슬롯
   * (계산하지 않음, 기록만)
   * --------------------------- */
  signals?: {
    similarityScore?: number // 유사 문서 점수
    qualityScore?: number // 완성도/명확성
    confidenceScore?: number // 자동 판단 신뢰도
    impactScore?: number // 시스템 영향도
  }

  /* ---------------------------
   * 설정 스냅샷
   * (실시간 설정 변경과 분리)
   * --------------------------- */
  appliedSettingsVersion?: string

  /* ---------------------------
   * 메타
   * --------------------------- */
  capturedAt: Date // 이 Context가 생성된 시점
}
