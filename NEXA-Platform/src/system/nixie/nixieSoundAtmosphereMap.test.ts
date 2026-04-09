/**
 * `mapNixieSoundAtmosphereToLayerParams` / `mapNixieSoundAtmosphereToMorseDelta` — 표 A~C·B.
 */

import { describe, expect, it } from 'vitest'
import {
  mapNixieSoundAtmosphereToLayerParams,
  mapNixieSoundAtmosphereToMorseDelta,
  NIXIE_ATMOSPHERE_RELEASE_MECHANICAL_BETA,
  sanitizeNixieSoundAtmosphereParams,
} from './nixieSoundAtmosphereMap'

const zero: Parameters<typeof mapNixieSoundAtmosphereToLayerParams>[0] = {
  tension01: 0,
  uncanniness01: 0,
  mechanical01: 0,
  space01: 0,
  vitality01: 0,
  harmony01: 0,
}

describe('sanitizeNixieSoundAtmosphereParams', () => {
  it('축을 [0,1] 로 클램프한다', () => {
    expect(
      sanitizeNixieSoundAtmosphereParams({
        tension01: -1,
        uncanniness01: 2,
        mechanical01: Number.NaN,
        space01: 0.5,
        vitality01: Number.POSITIVE_INFINITY,
        harmony01: 0.25,
      }),
    ).toEqual({
      tension01: 0,
      uncanniness01: 1,
      mechanical01: 0,
      space01: 0.5,
      vitality01: 0,
      harmony01: 0.25,
    })
  })
})

describe('mapNixieSoundAtmosphereToLayerParams', () => {
  it('전부 0이면 DSP 4축도 0', () => {
    expect(mapNixieSoundAtmosphereToLayerParams(zero)).toEqual({
      filter01: 0,
      release01: 0,
      detune01: 0,
      jitter01: 0,
      mechanicalBlend01: 0,
      spaceBlend01: 0,
      uncannyBlend01: 0,
    })
  })

  it('표 A: 긴장만 1일 때 가중 합 (R2·R3 미적용)', () => {
    expect(
      mapNixieSoundAtmosphereToLayerParams({
        ...zero,
        tension01: 1,
      }),
    ).toEqual({
      filter01: 0.45,
      release01: 0.25,
      detune01: 0.15,
      jitter01: 0.35,
      mechanicalBlend01: 0,
      spaceBlend01: 0,
      uncannyBlend01: 0,
    })
  })

  it('공간감 축이 의미 spaceBlend01 로 전달된다', () => {
    expect(
      mapNixieSoundAtmosphereToLayerParams({
        ...zero,
        space01: 0.7,
      }).spaceBlend01,
    ).toBe(0.7)
  })

  it('이질감 축이 의미 uncannyBlend01 로 전달된다', () => {
    expect(
      mapNixieSoundAtmosphereToLayerParams({
        ...zero,
        uncanniness01: 0.85,
      }).uncannyBlend01,
    ).toBe(0.85)
  })

  it('R3: 기계성 ≥ 임계일 때 릴리즈 감쇠', () => {
    const base = mapNixieSoundAtmosphereToLayerParams({
      ...zero,
      mechanical01: 1,
    })
    expect(base.mechanicalBlend01).toBe(1)
    expect(base.release01).toBeCloseTo(
      clampExpected(0.04 - NIXIE_ATMOSPHERE_RELEASE_MECHANICAL_BETA * 1),
    )
  })

  it('R2: 조화 ≥ 임계일 때 이질감→지터 가중만 0.75배 (조화 항은 별도)', () => {
    expect(
      mapNixieSoundAtmosphereToLayerParams({
        ...zero,
        uncanniness01: 1,
        harmony01: 0.59,
      }).jitter01,
    ).toBeCloseTo(0.72 + 0.15 * 0.59)
    expect(
      mapNixieSoundAtmosphereToLayerParams({
        ...zero,
        uncanniness01: 1,
        harmony01: 0.6,
      }).jitter01,
    ).toBeCloseTo(0.72 * 0.75 + 0.15 * 0.6)
  })

  it('R1: 긴장·활력 둘 다 높을 때 지터에 0.85 배 보수', () => {
    const jitterBase = 0.35 * 0.6 + 0.2 * 0.6
    expect(
      mapNixieSoundAtmosphereToLayerParams({
        ...zero,
        tension01: 0.6,
        vitality01: 0.6,
      }).jitter01,
    ).toBeCloseTo(jitterBase * 0.85)
    expect(
      mapNixieSoundAtmosphereToLayerParams({
        ...zero,
        tension01: 0.6,
        vitality01: 0.49,
      }).jitter01,
    ).toBeCloseTo(0.35 * 0.6 + 0.2 * 0.49)
  })
})

function clampExpected(x: number): number {
  return Math.max(0, Math.min(1, x))
}

describe('mapNixieSoundAtmosphereToMorseDelta', () => {
  it('ditScale: 긴장·활력·표 B 곱 (R1 하한)', () => {
    const d = mapNixieSoundAtmosphereToMorseDelta({
      ...zero,
      tension01: 1,
      vitality01: 1,
    })
    const raw = (1 - 0.25) * 0.95 * (0.85 + 0.15)
    expect(d.ditScale).toBe(Math.max(raw, 0.82))
  })

  it('캐리어·패닝 필드가 표 B와 일치', () => {
    expect(
      mapNixieSoundAtmosphereToMorseDelta({
        ...zero,
        tension01: 1,
        uncanniness01: 0.5,
        space01: 1,
      }),
    ).toMatchObject({
      carrierOffsetHzFromTension: 120,
      carrierUncannyOffsetMaxHz: 26,
      panWobbleDepth01: clampExpected(0.05 + 0.2 + 0.15),
    })
  })
})
