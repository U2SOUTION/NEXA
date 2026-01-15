/*
 * engines/archive-sentinel/settings/SentinelSettingsSchema.ts
 *
 * 자동 판단의 기준이 아니라 "판단 결과를 어떻게 다룰지"를 정의한다
 * core는 이 설정을 읽기만 하고, 직접 판단하지 않는다
 * 모든 하위 설정의 단일 진입점 (Single Source of Truth)

core / classification / discard / judgment / flow 는
→ 이 파일만 의존

“판단을 어떻게 처리할지”를 정책적으로 선언
 */

import type { ClassificationSettings } from './ClassificationSettings'
import type { DiscardSettings } from './DiscardSettings'
import type { JudgmentSettings } from './JudgmentSettings'
import type { FlowSettings } from './FlowSettings'

/**
 * ArchiveSentinel 전체 동작을 조율하는 최상위 설정 스키마
 * - 판단 기준이 아니라 "판단 결과를 어떻게 다룰지"를 정의한다
 * - core는 이 설정을 읽기만 하고, 직접 판단하지 않는다
 */
export interface SentinelSettingsSchema {
  /** Sentinel 자체 활성화 여부 */
  enabled: boolean

  /**
   * 자동 판단의 기본 운영 모드
   * - passive  : 감시 + 기록만
   * - assist   : 제안 중심 (기본값)
   * - assertive: 강한 개입 (자동 이동/폐기 허용)
   */
  mode: 'passive' | 'assist' | 'assertive'

  /**
   * 판단 결과를 즉시 적용하지 않고
   * 버퍼에 머무르게 하는 기본 유예 시간 (분)
   * - 0 이면 즉시 반영
   */
  decisionBufferMinutes: number

  /**
   * AI 개입에 대한 전역 허용 정책
   * (각 세부 설정에서 override 가능)
   */
  aiPolicy: {
    enabled: boolean

    /** 하루 최대 AI 호출 횟수 */
    dailyRequestLimit: number

    /**
     * AI 판단 신뢰 가중치 (0 ~ 1)
     * - 0   : 참고만
     * - 1.0 : 규칙 판단과 동등
     */
    confidenceWeight: number
  }

  /** 자동 분류 설정 */
  classification: ClassificationSettings

  /** 자동 패기(폐기) 설정 */
  discard: DiscardSettings

  /** 작성 중/후 판단 개입 설정 */
  judgment: JudgmentSettings

  /** 시간 흐름 및 리듬 관리 설정 */
  flow: FlowSettings
}

/**
 * Sentinel 기본 설정값
 * - UI가 없어도 바로 동작 가능하도록 보수적으로 설정
 */
export const DEFAULT_SENTINEL_SETTINGS: SentinelSettingsSchema = {
  enabled: true,
  mode: 'assist',

  decisionBufferMinutes: 60,

  aiPolicy: {
    enabled: true,
    dailyRequestLimit: 1,
    confidenceWeight: 0.5,
  },

  classification: {} as ClassificationSettings,
  discard: {} as DiscardSettings,
  judgment: {} as JudgmentSettings,
  flow: {} as FlowSettings,
}
