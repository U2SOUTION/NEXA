/**
 * 의미 6축 → DSP 4(`NixieSoundLayerParams`)·모스 델타 — **M-D** 순수 함수.
 *
 * SSOT: `docs/NIXIE [ARCH] 사운드 DSP 4축 과 6대 의미축 (UI·Web Audio) 아키텍셔.md`
 * 「M-C 매핑 설계 고정 (v0.1)」표 A~C·합성식.
 */

import type { NixieSoundAtmosphereParams } from './nixieSoundAtmosphereParams'
import type { NixieSoundLayerParams } from './nixieSoundLayerParams'

/** 문서 M-C v0.1 과 동기 — 변경 시 문서·테스트 함께 갱신 */
export const NIXIE_SOUND_ATMOSPHERE_MAP_SPEC_VERSION = '0.1' as const

/** R1: 긴장·활력이 둘 다 "높을 때" 적용하는 임계값 */
export const NIXIE_ATMOSPHERE_R1_HIGH_THRESHOLD = 0.5

/** R2: 조화 감쇠 적용 하한 */
export const NIXIE_ATMOSPHERE_R2_HARMONY_THRESHOLD = 0.6

/** R3: 기계성 릴리즈 감쇠 적용 하한 */
export const NIXIE_ATMOSPHERE_R3_MECHANICAL_THRESHOLD = 0.5

/**
 * R3: `release01_eff = clamp01(release_base − β·mechanical01)` 의 β (튜닝).
 * 문서 M-C 합성식과 동일 의미.
 */
export const NIXIE_ATMOSPHERE_RELEASE_MECHANICAL_BETA = 0.52

/** R1: 지터 보수 배율 */
const R1_JITTER_FACTOR = 0.85

/** R1: dit 배율 하한 */
const R1_DIT_FLOOR = 0.82

/** R2: 이질감→지터 가중 감쇠 (harmony 높을 때) */
const R2_UNCANNY_JITTER_FACTOR = 0.75

/**
 * 표 A — 행 순서: 긴장, 이질감, 기계성, 공간감, 활력, 조화
 * 열: filter, release, detune, jitter
 */
/** 인덱스 2 = 기계성 — 필터·디튜닝·지터 가중 상향(듣기 쉬운 기계 질감) */
/** 인덱스 1 = 이질감 — 디튜닝·지터·릴리즈·필터 가중 상향(불안정·어긋남) */
const W_FILTER = [0.45, 0.32, 0.44, 0.2, 0.42, 0.35] as const
const W_RELEASE = [0.25, 0.28, 0.04, 0.4, 0.5, 0.3] as const
const W_DETUNE = [0.15, 0.6, 0.36, 0.25, 0.56, 0.5] as const
const W_JITTER = [0.35, 0.82, 0.44, 0.1, 0.34, 0.15] as const

/** 표 B — 이질감: 캐리어 흔들림 상한(Hz) — 모스 톤 박기·LFO 진폭 상한 */
const MORSE_UNCANNY_CARRIER_OFFSET_MAX_HZ = 64

/** 표 B — dit가 이질감에 살짝 달라붙지 않게(리듬 미세 불안) */
const MORSE_UNCANNY_DIT_SCALE_MUL = 0.14

function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0
  return Math.max(0, Math.min(1, x))
}

/** 매핑 입력 축을 [0,1] 로 안전화 */
export function sanitizeNixieSoundAtmosphereParams(a: NixieSoundAtmosphereParams): NixieSoundAtmosphereParams {
  return {
    tension01: clamp01(a.tension01),
    uncanniness01: clamp01(a.uncanniness01),
    mechanical01: clamp01(a.mechanical01),
    space01: clamp01(a.space01),
    vitality01: clamp01(a.vitality01),
    harmony01: clamp01(a.harmony01),
  }
}

function dot6(w: readonly number[], v: readonly number[]): number {
  return w[0]! * v[0]! + w[1]! * v[1]! + w[2]! * v[2]! + w[3]! * v[3]! + w[4]! * v[4]! + w[5]! * v[5]!
}

export type MapNixieSoundAtmosphereToLayerOptions = {
  /** R3 β 오버라이드 */
  releaseMechanicalBeta?: number
}

/**
 * 의미 벡터 → DSP 4축 (표 A 가중 합 + clamp01, R1~R3).
 */
export function mapNixieSoundAtmosphereToLayerParams(
  atmosphere: NixieSoundAtmosphereParams,
  options?: MapNixieSoundAtmosphereToLayerOptions,
): NixieSoundLayerParams {
  const a = sanitizeNixieSoundAtmosphereParams(atmosphere)
  const beta = options?.releaseMechanicalBeta ?? NIXIE_ATMOSPHERE_RELEASE_MECHANICAL_BETA

  const axes = [
    a.tension01,
    a.uncanniness01,
    a.mechanical01,
    a.space01,
    a.vitality01,
    a.harmony01,
  ] as const

  let wUncannyJitter = W_JITTER[1]!
  if (a.harmony01 >= NIXIE_ATMOSPHERE_R2_HARMONY_THRESHOLD) {
    wUncannyJitter *= R2_UNCANNY_JITTER_FACTOR
  }
  const wJitterEff = [W_JITTER[0]!, wUncannyJitter, W_JITTER[2]!, W_JITTER[3]!, W_JITTER[4]!, W_JITTER[5]!] as const

  let jitter01 = clamp01(dot6(wJitterEff, axes))

  if (a.tension01 >= NIXIE_ATMOSPHERE_R1_HIGH_THRESHOLD && a.vitality01 >= NIXIE_ATMOSPHERE_R1_HIGH_THRESHOLD) {
    jitter01 = clamp01(jitter01 * R1_JITTER_FACTOR)
  }

  const filter01 = clamp01(dot6(W_FILTER, axes))
  let release01 = clamp01(dot6(W_RELEASE, axes))
  const detune01 = clamp01(dot6(W_DETUNE, axes))

  if (a.mechanical01 >= NIXIE_ATMOSPHERE_R3_MECHANICAL_THRESHOLD) {
    release01 = clamp01(release01 - beta * a.mechanical01)
  }

  return {
    filter01,
    release01,
    detune01,
    jitter01,
    mechanicalBlend01: a.mechanical01,
    spaceBlend01: a.space01,
    uncannyBlend01: a.uncanniness01,
    vitalityBlend01: a.vitality01,
    harmonyBlend01: a.harmony01,
  }
}

/** 표 B — 모스 경로 델타 (스냅샷 dit·캐리어·패닝에 가감) */
export type NixieSoundMorseAtmosphereDelta = {
  /** 스냅샷 dit(ms)에 곱할 배율 */
  ditScale: number
  /** 캐리어에 더할 Hz (긴장·표 B: 0~120 × tension) */
  carrierOffsetHzFromTension: number
  /** 이질감 ±오프셋 상한 Hz (호출 측 랜덤/LFO 진폭) */
  carrierUncannyOffsetMaxHz: number
  /** 스테레오 미세 흔들림 깊이 0~1 (표 B pan 보조 가중 합 후 clamp) */
  panWobbleDepth01: number
}

/**
 * 의미 벡터 → 모스 델타 (표 B, R1 dit 하한).
 */
export function mapNixieSoundAtmosphereToMorseDelta(atmosphere: NixieSoundAtmosphereParams): NixieSoundMorseAtmosphereDelta {
  const a = sanitizeNixieSoundAtmosphereParams(atmosphere)

  /**
   * 활력: dit(ms) 배율 — `ditScale`↑ 이면 dit 가 길어져 WPM↓ 이므로,
   * 활력↑ 일수록 배율을 낮춰 **더 빠른(짧은) dit** 이 되게 한다.
   * 범위는 이전 (0.62+0.48v) 과 동일 폭으로 역방향: v=0 → 1.1, v=1 → 0.62.
   */
  let ditScale =
    (1 - 0.25 * a.tension01) * 0.95 * 1.0 * 1.0 * (1.1 - 0.48 * a.vitality01) * 1.0

  /** 기계성: dit 살짧게(리듬이 더 딱딱하게) */
  ditScale *= 1 - 0.1 * a.mechanical01

  /** 이질감: dit 미세 단축(살짝 빨라져 “어색한” 리듬) */
  ditScale *= 1 - MORSE_UNCANNY_DIT_SCALE_MUL * a.uncanniness01

  if (a.tension01 >= NIXIE_ATMOSPHERE_R1_HIGH_THRESHOLD && a.vitality01 >= NIXIE_ATMOSPHERE_R1_HIGH_THRESHOLD) {
    ditScale = Math.max(ditScale, R1_DIT_FLOOR)
  }

  const carrierOffsetHzFromTension = 120 * a.tension01
  const carrierUncannyOffsetMaxHz = MORSE_UNCANNY_CARRIER_OFFSET_MAX_HZ * a.uncanniness01

  const panWobbleDepth01 = clamp01(
    0.05 * a.tension01 + 0.48 * a.uncanniness01 + 0.15 * a.space01 + 0.18 * a.vitality01,
  )

  return {
    ditScale,
    carrierOffsetHzFromTension,
    carrierUncannyOffsetMaxHz,
    panWobbleDepth01,
  }
}
