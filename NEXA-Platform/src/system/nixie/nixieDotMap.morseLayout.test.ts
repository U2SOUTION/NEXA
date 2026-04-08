import { describe, expect, it } from 'vitest'
import {
  getMorseTokenCharRange,
  mapHudTextToDots,
  mapHudTextToDotsCharRangeMask,
  normalizeDemoHudText,
  scrollOffsetToCenterToken,
  tapeColStartForCharIndex,
} from './nixieDotMap'

function countTrue(m: boolean[]): number {
  return m.filter(Boolean).length
}

describe('getMorseTokenCharRange', () => {
  it('토큰 구간이 공백 분리와 일치한다', () => {
    expect(getMorseTokenCharRange('... .', 0)).toEqual({ start: 0, end: 3 })
    expect(getMorseTokenCharRange('... .', 1)).toEqual({ start: 4, end: 5 })
  })

  it('범위 밖 인덱스는 null', () => {
    expect(getMorseTokenCharRange('...', 1)).toBeNull()
  })
})

describe('tapeColStartForCharIndex', () => {
  it('누적 열이 단조 증가한다', () => {
    const full = normalizeDemoHudText('... .')
    expect(tapeColStartForCharIndex(full, 0)).toBe(0)
    expect(tapeColStartForCharIndex(full, full.length)).toBeGreaterThan(tapeColStartForCharIndex(full, 1))
  })
})

describe('mapHudTextToDotsCharRangeMask', () => {
  it('전체 구간은 mapHudTextToDots 와 같은 true 집합', () => {
    const raw = '... . --'
    const full = normalizeDemoHudText(raw)
    if (!full.length) return
    const scroll = 0
    const base = mapHudTextToDots(raw, scroll)
    const maskAll = mapHudTextToDotsCharRangeMask(raw, scroll, 0, full.length)
    expect(countTrue(maskAll)).toBe(countTrue(base))
    for (let i = 0; i < base.length; i++) {
      expect(maskAll[i]).toBe(base[i])
    }
  })

  it('부분 구간은 전체의 부분집합(켜진 도트 수)', () => {
    const raw = '... . --'
    const full = normalizeDemoHudText(raw)
    if (full.length < 2) return
    const scroll = 0
    const base = mapHudTextToDots(raw, scroll)
    const mask0 = mapHudTextToDotsCharRangeMask(raw, scroll, 0, 1)
    expect(countTrue(mask0)).toBeLessThanOrEqual(countTrue(base))
  })
})

describe('scrollOffsetToCenterToken', () => {
  it('한 화면에 다 들어가면 0', () => {
    expect(scrollOffsetToCenterToken(normalizeDemoHudText('...'), 0)).toBe(0)
  })
})
