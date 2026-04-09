/**
 * 닉시 6대 의미 축 — UI(0~100) → 정규화 파라미터(0~1). §8 M-B.
 * 매핑(M-C~)·이벤트는 `NixieSoundAtmosphereParams`만 받도록 맞춘다.
 */

/** 개발 패널 슬라이더 원시 값 (0~100) */
export type NixieSoundAtmosphereUi0to100 = {
  tension: number
  uncanniness: number
  mechanical: number
  space: number
  vitality: number
  harmony: number
}

/** 긴장·이질감·기계성·공간감·활력·조화 — 매핑·스토어 입력용 (0~1) */
export type NixieSoundAtmosphereParams = {
  tension01: number
  uncanniness01: number
  mechanical01: number
  space01: number
  vitality01: number
  harmony01: number
}

function clampUi100(n: number): number {
  const x = Number(n)
  if (!Number.isFinite(x)) return 0
  return Math.max(0, Math.min(100, x))
}

/**
 * 6개 슬라이더 값을 한 객체로 정규화한다.
 * 이후 모듈은 `NixieSoundAtmosphereParams`만 의존하면 된다.
 */
export function getNixieSoundAtmosphere(ui: NixieSoundAtmosphereUi0to100): NixieSoundAtmosphereParams {
  return {
    tension01: clampUi100(ui.tension) / 100,
    uncanniness01: clampUi100(ui.uncanniness) / 100,
    mechanical01: clampUi100(ui.mechanical) / 100,
    space01: clampUi100(ui.space) / 100,
    vitality01: clampUi100(ui.vitality) / 100,
    harmony01: clampUi100(ui.harmony) / 100,
  }
}
