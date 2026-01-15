// settings/BufferPolicy.ts

/**
 * BufferDecision
 * - 판단 결과가 아니라 "상태" 즉 판단 결과를 어떻게 다룰지를 정의한다
 * - EscalationPolicy 또는 Flow가 해석한다
 */
export enum BufferDecision {
  PASS = 'pass', // 바로 진행 가능
  HOLD = 'hold', // 잠시 보류
  SUPPRESS = 'suppress', // 시스템 내부에서 억제
  ESCALATABLE = 'escalatable', // 사람 호출 후보 (아직 호출 아님)
}

/**
 * BufferSignal
 * - 규칙/AI/도메인에서 발생한 1회성 판단 신호
 */
export interface BufferSignal {
  source: 'rule' | 'ai' | 'system'
  strength: number // 0~1
  reason: string
  timestamp: number
}

/**
 * BufferState
 * - "지금 이 판단이 어떤 상태인가?"
 */
export interface BufferState {
  decision: BufferDecision
  confidence: number // 누적 신뢰도
  signalCount: number
  durationMs: number // 누적 시간
  reasons: string[]
}

/**
 * BufferPolicyConfig
 * - 사용자/도메인별 조율 지점
 */
export interface BufferPolicyConfig {
  minSignalsToHold: number
  minSignalsToEscalate: number
  escalationConfidence: number
  maxHoldDurationMs: number
}

/**
 * BufferPolicy
 * - 중재자 + 완충자 + 책임 분배 전 단계
 */
export class BufferPolicy {
  private signals: BufferSignal[] = []
  private readonly config: BufferPolicyConfig

  constructor(config?: Partial<BufferPolicyConfig>) {
    this.config = {
      minSignalsToHold: 2,
      minSignalsToEscalate: 3,
      escalationConfidence: 0.75,
      maxHoldDurationMs: 1000 * 60 * 5, // 5분
      ...config,
    }
  }

  /**
   * 판단 신호 추가
   */
  push(signal: BufferSignal): void {
    this.signals.push(signal)
  }

  /**
   * 현재 버퍼 상태 계산
   */
  evaluate(): BufferState {
    if (this.signals.length === 0) {
      return {
        decision: BufferDecision.PASS,
        confidence: 0,
        signalCount: 0,
        durationMs: 0,
        reasons: [],
      }
    }

    const now = Date.now()
    const duration = now - this.signals[0].timestamp

    const totalStrength = this.signals.reduce((sum, s) => sum + s.strength, 0)

    const averageStrength = totalStrength / this.signals.length

    const reasons = this.signals.map((s) => s.reason)

    // --- 상태 판정 (결론 아님) ---
    if (this.signals.length >= this.config.minSignalsToEscalate && averageStrength >= this.config.escalationConfidence) {
      return {
        decision: BufferDecision.ESCALATABLE,
        confidence: averageStrength,
        signalCount: this.signals.length,
        durationMs: duration,
        reasons,
      }
    }

    if (this.signals.length >= this.config.minSignalsToHold || duration >= this.config.maxHoldDurationMs) {
      return {
        decision: BufferDecision.HOLD,
        confidence: averageStrength,
        signalCount: this.signals.length,
        durationMs: duration,
        reasons,
      }
    }

    return {
      decision: BufferDecision.SUPPRESS,
      confidence: averageStrength,
      signalCount: this.signals.length,
      durationMs: duration,
      reasons,
    }
  }

  /**
   * 버퍼 초기화 (결론 이후)
   */
  reset(): void {
    this.signals = []
  }
}
