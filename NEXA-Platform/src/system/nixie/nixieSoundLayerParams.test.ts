/**
 * `getNixieSoundLayers` — UI 0~100 → 0~1 정규화.
 */

import { describe, expect, it } from 'vitest'
import { getNixieSoundLayers } from './nixieSoundLayerParams'

describe('getNixieSoundLayers', () => {
  it('0~100 를 0~1 로 스케일한다', () => {
    expect(
      getNixieSoundLayers({
        filter: 0,
        release: 50,
        detune: 100,
        jitter: 25,
      }),
    ).toEqual({
      filter01: 0,
      release01: 0.5,
      detune01: 1,
      jitter01: 0.25,
    })
  })

  it('범위 밖·비유한 값은 클램프한다', () => {
    expect(
      getNixieSoundLayers({
        filter: -10,
        release: 200,
        detune: Number.NaN,
        jitter: Number.POSITIVE_INFINITY,
      }),
    ).toEqual({
      filter01: 0,
      release01: 1,
      detune01: 0,
      jitter01: 0,
    })
  })
})
