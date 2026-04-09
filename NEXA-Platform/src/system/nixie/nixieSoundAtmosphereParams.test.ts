/**
 * `getNixieSoundAtmosphere` — UI 0~100 → 0~1 정규화.
 */

import { describe, expect, it } from 'vitest'
import { getNixieSoundAtmosphere } from './nixieSoundAtmosphereParams'

describe('getNixieSoundAtmosphere', () => {
  it('0~100 을 0~1 로 스케일한다', () => {
    expect(
      getNixieSoundAtmosphere({
        tension: 0,
        uncanniness: 50,
        mechanical: 100,
        space: 25,
        vitality: 75,
        harmony: 10,
      }),
    ).toEqual({
      tension01: 0,
      uncanniness01: 0.5,
      mechanical01: 1,
      space01: 0.25,
      vitality01: 0.75,
      harmony01: 0.1,
    })
  })

  it('범위 밖·비유한 값은 클램프한다', () => {
    expect(
      getNixieSoundAtmosphere({
        tension: -5,
        uncanniness: 200,
        mechanical: Number.NaN,
        space: Number.POSITIVE_INFINITY,
        vitality: 0,
        harmony: 0,
      }),
    ).toEqual({
      tension01: 0,
      uncanniness01: 1,
      mechanical01: 0,
      space01: 0,
      vitality01: 0,
      harmony01: 0,
    })
  })
})
