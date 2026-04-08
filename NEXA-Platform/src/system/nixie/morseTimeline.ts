/**
 * HUD 모스 문자열(`.` `-` `^` + 공백) → 사운드/재생용 이벤트 타임라인.
 * 국제 모스 관례: dit=1, dah=3, 글자 내 간격=1, 글자 간=3, 단어 간=7 (dit 단위).
 */

import { getMorseTokenCharRange, normalizeDemoHudText } from './nixieDotMap'

export type MorseSoundEventKind = 'dot' | 'dash' | 'gap'

export type MorseSoundEvent = {
  kind: MorseSoundEventKind
  /** 재생/무음 지속시간(ms), dit 기준 배수 적용 후 정수 */
  ms: number
}

const DIT_MS_MIN = 20
const DIT_MS_MAX = 500

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n))
}

/** 스냅샷 dit(ms) — 항상 20~500ms로 고정(재생·타임라인 공통) */
export function clampMorseDitMs(ms: number): number {
  return clamp(Math.round(Number(ms) || 60), DIT_MS_MIN, DIT_MS_MAX)
}

/** `buildMorseSoundTimelineWithMeta` 결과 — 재생·HUD 동기 공통 */
export type MorseSoundTimelineMeta = {
  events: MorseSoundEvent[]
  /**
   * `events[i]` 가 HUD에서 맞출 **공백 분리 토큰** 인덱스 (`split(/\\s+/)` 기준).
   * `^` 전용 이벤트·단어 간 갭(gap)은 표시 대상이 없어 `-1`.
   */
  eventDisplayTokenIndex: number[]
  /**
   * `events[i]` 가 `dot`/`dash` 일 때만 — `hudText.trim()` 기준 **문자 인덱스** `[start, end)` (end 배타).
   * 갭·단어 갭 등은 `null` (강조 없음).
   */
  eventHudCharRange: Array<{ start: number; end: number } | null>
  /** 각 이벤트의 타임라인 시작 시각(ms), `events[i].ms` 누적 전 위치 */
  eventStartMs: number[]
}

/** 토큰 문자열에서 j번째 `.`/`-` 문자의 **토큰 내** 인덱스 */
function charIndexOfMorseElement(token: string, elementIndex: number): number {
  let k = 0
  for (let c = 0; c < token.length; c++) {
    const ch = token[c]!
    if (ch === '.' || ch === '-') {
      if (k === elementIndex) return c
      k++
    }
  }
  return -1
}

/**
 * `buildMorseSoundTimeline` 와 **동일 파싱**으로 이벤트 + 이벤트별 표시 토큰 인덱스 + 시작 시각(ms) 생성.
 * 공백으로 토큰 분리: `....` 한 토큰=한 글자, `^`=단어 구분.
 */
export function buildMorseSoundTimelineWithMeta(hudText: string, ditMs: number): MorseSoundTimelineMeta {
  const dit = Math.max(1, Math.round(ditMs))
  const dah = dit * 3
  const intraGap = dit
  const interGap = dit * 3
  const wordGap = dit * 7

  /** `demo_hud_text`·`mapHudTextToDots` 와 동일 문자열 기준 — `eventHudCharRange` 인덱스 일치 */
  const raw = normalizeDemoHudText(hudText.trim())
  if (!raw.length) {
    return { events: [], eventDisplayTokenIndex: [], eventHudCharRange: [], eventStartMs: [] }
  }

  const tokens = raw.split(/\s+/).filter(Boolean)
  const events: MorseSoundEvent[] = []
  const eventDisplayTokenIndex: number[] = []
  const eventHudCharRange: Array<{ start: number; end: number } | null> = []

  /** HUD `scrollOffsetToCenterToken` / `mapHudTextToDotsCharRangeMask` 와 동일 토큰 경계 — `indexOf` 경로와 어긋나면 강조가 테이프 양끝으로 밀림 */
  function emitLetter(tokenIdx: number): void {
    const tr = getMorseTokenCharRange(raw, tokenIdx)
    if (!tr) return
    const token = raw.slice(tr.start, tr.end)
    const parts = token.split('').filter((c) => c === '.' || c === '-')
    for (let j = 0; j < parts.length; j++) {
      const p = parts[j]!
      const posInToken = charIndexOfMorseElement(token, j)
      const absStart = posInToken >= 0 ? tr.start + posInToken : tr.start
      const absEnd = absStart + 1
      if (p === '.') {
        events.push({ kind: 'dot', ms: dit })
        eventDisplayTokenIndex.push(tokenIdx)
        eventHudCharRange.push({ start: absStart, end: absEnd })
      } else {
        events.push({ kind: 'dash', ms: dah })
        eventDisplayTokenIndex.push(tokenIdx)
        eventHudCharRange.push({ start: absStart, end: absEnd })
      }
      if (j < parts.length - 1) {
        events.push({ kind: 'gap', ms: intraGap })
        eventDisplayTokenIndex.push(tokenIdx)
        eventHudCharRange.push(null)
      }
    }
  }

  let i = 0
  while (i < tokens.length) {
    const t = tokens[i]!
    if (t === '^') {
      events.push({ kind: 'gap', ms: wordGap })
      eventDisplayTokenIndex.push(-1)
      eventHudCharRange.push(null)
      i++
      continue
    }
    emitLetter(i)
    i++
    if (i >= tokens.length) break
    const next = tokens[i]!
    if (next === '^') {
      events.push({ kind: 'gap', ms: wordGap })
      eventDisplayTokenIndex.push(-1)
      eventHudCharRange.push(null)
      i++
    } else {
      events.push({ kind: 'gap', ms: interGap })
      eventDisplayTokenIndex.push(i)
      eventHudCharRange.push(null)
    }
  }

  const eventStartMs: number[] = []
  let acc = 0
  for (let k = 0; k < events.length; k++) {
    eventStartMs.push(acc)
    acc += events[k]!.ms
  }

  return { events, eventDisplayTokenIndex, eventHudCharRange, eventStartMs }
}

/**
 * `normalizeDemoHudText` 결과(모스 모드) 문자열을 파싱해 타임라인 생성.
 * 공백으로 토큰 분리: `....` 한 토큰=한 글자(영문/숫자/한글 자모 1단위), `^`=단어 구분.
 */
export function buildMorseSoundTimeline(hudText: string, ditMs: number): MorseSoundEvent[] {
  return buildMorseSoundTimelineWithMeta(hudText, ditMs).events
}

/** 타임라인 총 길이(ms) — UI·디버그용 */
export function morseTimelineTotalMs(events: MorseSoundEvent[]): number {
  let s = 0
  for (const e of events) s += e.ms
  return s
}
