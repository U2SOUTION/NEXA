import { describe, expect, it } from 'vitest'
import {
  buildMorseSoundTimeline,
  buildMorseSoundTimelineWithMeta,
  morseTimelineTotalMs,
} from './morseTimeline'

const DIT = 60

describe('buildMorseSoundTimelineWithMeta', () => {
  it('buildMorseSoundTimeline 과 events 가 동일하다', () => {
    const samples = ['', '   ', '.', '.-', '... ---', '... --- ^ ... --', '^', '. ^ .']
    for (const s of samples) {
      const a = buildMorseSoundTimeline(s, DIT)
      const b = buildMorseSoundTimelineWithMeta(s, DIT).events
      expect(a).toEqual(b)
    }
  })

  it('메타 배열 길이가 events 와 일치한다', () => {
    const meta = buildMorseSoundTimelineWithMeta('... . ^ .-', DIT)
    expect(meta.eventDisplayTokenIndex.length).toBe(meta.events.length)
    expect(meta.eventStartMs.length).toBe(meta.events.length)
  })

  it('eventStartMs 누적이 total 과 일치한다', () => {
    const meta = buildMorseSoundTimelineWithMeta('... .', DIT)
    const lastStart = meta.eventStartMs[meta.eventStartMs.length - 1] ?? 0
    const lastMs = meta.events[meta.events.length - 1]?.ms ?? 0
    expect(lastStart + lastMs).toBe(morseTimelineTotalMs(meta.events))
  })

  it('... . 에서 글자 간 갭(ms=interGap)은 다음 토큰 인덱스 1', () => {
    const meta = buildMorseSoundTimelineWithMeta('... .', DIT)
    const interGapMs = DIT * 3
    const interLetterGap = meta.events.findIndex(
      (e, i) => e.kind === 'gap' && e.ms === interGapMs && meta.eventDisplayTokenIndex[i] === 1,
    )
    expect(interLetterGap).toBeGreaterThan(-1)
    expect(meta.eventDisplayTokenIndex[0]).toBe(0)
  })

  it('^ 단어 갭은 토큰 인덱스 -1', () => {
    const meta = buildMorseSoundTimelineWithMeta('... ^ .', DIT)
    const gapIdx = meta.events.findIndex((e) => e.kind === 'gap' && e.ms === DIT * 7)
    expect(gapIdx).toBeGreaterThan(-1)
    expect(meta.eventDisplayTokenIndex[gapIdx]).toBe(-1)
  })
})
