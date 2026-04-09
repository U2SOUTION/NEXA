/**
 * 단계 D 매핑 — UI 0~1 축 → Hz·센트·깊이 스케일.
 */

import { describe, expect, it } from 'vitest'
import {
  detune01ToHalfSpreadCents,
  filter01ToLowpassHz,
  jitter01ToDetuneModCents,
  release01ToTremoloDepth,
} from './nixieSoundLayerAudio'

describe('filter01ToLowpassHz', () => {
  it('0 에서 낮은 Hz, 1 에서 높은 Hz', () => {
    expect(filter01ToLowpassHz(0)).toBe(320)
    expect(filter01ToLowpassHz(1)).toBe(16000)
  })
})

describe('release01ToTremoloDepth', () => {
  it('0 에서 0, 1 에서 양의 상한 이하', () => {
    expect(release01ToTremoloDepth(0)).toBe(0)
    expect(release01ToTremoloDepth(1)).toBeGreaterThan(0)
    expect(release01ToTremoloDepth(1)).toBeLessThanOrEqual(0.25)
  })
})

describe('detune01ToHalfSpreadCents', () => {
  it('0 에서 0, 1 에서 양의 값', () => {
    expect(detune01ToHalfSpreadCents(0)).toBe(0)
    expect(detune01ToHalfSpreadCents(1)).toBeGreaterThan(20)
  })
})

describe('jitter01ToDetuneModCents', () => {
  it('0 에서 0, 1 에서 양의 상한', () => {
    expect(jitter01ToDetuneModCents(0)).toBe(0)
    expect(jitter01ToDetuneModCents(1)).toBeLessThanOrEqual(30)
  })
})
