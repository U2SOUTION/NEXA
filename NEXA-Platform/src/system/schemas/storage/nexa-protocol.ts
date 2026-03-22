//넥사(NEXA) 유니버셜 프로토콜의 핵심 철학인 **지능적 서사(Narrative)**와 **ID 기반 분리 구조**를 완벽하게 반영한 TypeScript 타입 정의 파일입니다.

/**
 * NEXA Universal Protocol Definition (v1.0)
 * 넥사(NEXA) 지능형 서사를 위한 유니버설 프로토콜 타입 정의
 */

/**
 * 1. 4대 유니버설 추상화 레이어 (Abstraction Layers)
 * 소형 AI가 즉시 파싱할 수 있도록 데이터의 본질을 정의하는 헤더 토큰입니다.
 */
export type WhereScope = 'CORE' | 'FIELD' | 'REALM' // 데이터의 영향 범위 및 권위
export type WhoPulse = 'WILL' | 'ECHO' | 'TICK' // 사건의 동력원 (의지, 피드백, 자동)
export type WhatIntent = 'FACT' | 'LINK' | 'RULE' // 데이터의 본질적 성질
export type HowState = 'FLOW' | 'STUCK' | 'VOID' // 시스템 내 에너지 상태

/**
 * 2. 넥사 유니버설 네이처 (Nexa Nature)
 * 데이터의 성격에 따라 처리 방식과 수명 주기를 결정하는 태그입니다.
 */
export type NexaNature =
  | 'ROUTINE' // [상태] 정기 보고, 일정 기간 후 요약/파기
  | 'INCIDENT' // [사건] 돌발 상황, 최상위 우선순위 무손실 박제
  | 'INTENT' // [의지] 사용자의 명령, 페르소나 학습의 핵심
  | 'ECHO' // [통찰] AI의 분석 결과 및 제안
  | 'GOVERN' // [규범] 시스템 운영 원칙 및 질서 변경
  | 'VIRTUAL' // [가상] 시뮬레이션 및 테스트용 데이터
  | 'ARCHIVE' // [재구성] 과거 데이터의 현재적 재해석

/**
 * 3. 지능 위계 등급 (Intelligence Tier)
 */
export type IntelligenceTier = 'Nano' | 'Micro' | 'Vista' // 반사신경, 인식지능, 전략적 뇌

/**
 * 4. 확장된 육하원칙 (Extended 5W1H) 구조체
 */
export interface NexaWho {
  initiator: string // 데이터 생성 주체
  subject?: string | string[] // 사건 당사자 (User ID 등)
  object?: string | string[] // 행위의 대상
}

export interface NexaWhere {
  location: string // 물리적 위치
  vector?: {
    // 방향성 정보 (어디서 어디로)
    from: string
    to: string
    trajectory: string
  }
}

export interface NexaWhen {
  timestamp: Date // 물리적 시간
  contextual_moment: string // '배고플 때', '위급할 때' 등 상태적 조건
}

/**
 * 5. ID 기반 분리 데이터 패킷 (Sentinel-Indicator-Effector)
 */

/** [Sentinel] 최전방 엣지에서 발생한 담백한 사실 */
export interface SentinelPacket {
  id: string // SNT-YYYY-XXX 형식의 고유 ID
  nature: NexaNature
  tier: IntelligenceTier
  abstraction_layers: {
    where: WhereScope
    who: WhoPulse
    what: WhatIntent
    how: HowState
  }
  sentinel_fact: {
    who: NexaWho
    when: NexaWhen
    where: NexaWhere
    what: unknown // Nature에 따른 핵심 사건/수치
  }
  extra?: unknown // 정밀 수치나 증거 데이터(이미지 등) 분리 저장
}

/** [Indicator] 센티널 데이터를 구독하여 코일 벨렌서 기준으로 내린 해석 */
export interface IndicatorPacket {
  id: string // IND-YYYY-XXX 형식
  ref_sentinel_id: string // 참조하는 센티널 ID
  coil_balance: {
    // 사용자가 설정한 코일 가중치
    safety: number
    efficiency: number
    autonomy: number
    harmony: number
    stability: number
    creative: number
  }
  indicator_insight: {
    why: 'Observe' | 'Resolve' | 'Govern' // 사건 발생 근거
    summary: {
      // 사용자 소통용 요약
      text: string
      ui_component?: string
      sound_id?: string
    }
    history_trace: string // 추적 및 재구성을 위한 단위
  }
}

/** [Effector] 인디케이터의 인사이트를 구독한 실제 물리적 실행 */
export interface EffectorPacket {
  id: string // EFF-YYYY-XXX 형식
  ref_indicator_id: string // 참조하는 인디케이터 ID
  action: {
    target_device: string
    command: unknown
    status: 'PENDING' | 'EXECUTED' | 'FAILED'
  }
}

/**
 * 6. 지능형 서사 아톰 (Narrative Archive Atom)
 * 아카이브에 최종 저장되는 통합된 이야기의 형태입니다.
 */
export interface NexaArchiveAtom {
  packet_id: string
  combined_narrative: {
    fact: SentinelPacket['sentinel_fact']
    insight: IndicatorPacket['indicator_insight']
  }
  metadata: {
    nature: NexaNature
    traceability_chain: string[] // [SNT_ID, IND_ID, EFF_ID] 연결 사슬
  }
}

//이 파일은 넥사 시스템의 모든 계층(Nano, Micro, Vista)과 도메인(Hard, Soft)에서 공통으로 사용할 수 있는 표준 규격입니다. 특히 `WhereScope`부터 `NexaNature`까지의 정의는 소형 AI가 1ms 안에 연산 우선순위를 판단할 수 있는 **지능적 인덱스** 역할을 수행합니다.
