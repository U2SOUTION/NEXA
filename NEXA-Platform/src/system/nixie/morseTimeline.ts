/**
 * HUD 모스 문자열(`.` `-` `^` + 공백) → 사운드/재생용 이벤트 타임라인.
 * 국제 모스 관례: dit=1, dah=3, 글자 내 간격=1, 글자 간=3, 단어 간=7 (dit 단위).
 */

export type MorseSoundEventKind = 'dot' | 'dash' | 'gap'

export type MorseSoundEvent = {
  kind: MorseSoundEventKind
  /** 재생/무음 지속시간(ms), dit 기준 배수 적용 후 정수 */
  ms: number
}

export type MorseTimingInput = {
  /** PARIS 기준 WPM — dit(ms) = 1200 / wpm (오버라이드 없을 때) */
  wpm: number
  /** null이면 WPM으로 dit 계산, 숫자면 직접 지정(ms) */
  ditMsOverride: number | null
}

const WPM_MIN = 5
const WPM_MAX = 60
const DIT_MS_MIN = 20
const DIT_MS_MAX = 500

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n))
}

/** WPM 또는 dit 오버라이드로 dit 길이(ms) 결정 */
export function resolveMorseDitMs(input: MorseTimingInput): number {
  if (input.ditMsOverride != null && Number.isFinite(input.ditMsOverride)) {
    return clamp(Math.round(input.ditMsOverride), DIT_MS_MIN, DIT_MS_MAX)
  }
  const wpm = clamp(Number(input.wpm) || 20, WPM_MIN, WPM_MAX)
  return clamp(Math.round(1200 / wpm), DIT_MS_MIN, DIT_MS_MAX)
}

/**
 * `normalizeDemoHudText` 결과(모스 모드) 문자열을 파싱해 타임라인 생성.
 * 공백으로 토큰 분리: `....` 한 토큰=한 글자(영문/숫자/한글 자모 1단위), `^`=단어 구분.
 */
export function buildMorseSoundTimeline(hudText: string, ditMs: number): MorseSoundEvent[] {
  const dit = Math.max(1, Math.round(ditMs))
  const dah = dit * 3
  const intraGap = dit
  const interGap = dit * 3
  const wordGap = dit * 7

  const raw = hudText.trim()
  if (!raw.length) return []

  const tokens = raw.split(/\s+/).filter(Boolean)
  const out: MorseSoundEvent[] = []

  function emitLetter(token: string): void {
    const parts = token.split('').filter((c) => c === '.' || c === '-')
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i]!
      if (p === '.') out.push({ kind: 'dot', ms: dit })
      else out.push({ kind: 'dash', ms: dah })
      if (i < parts.length - 1) out.push({ kind: 'gap', ms: intraGap })
    }
  }

  let i = 0
  while (i < tokens.length) {
    const t = tokens[i]!
    if (t === '^') {
      out.push({ kind: 'gap', ms: wordGap })
      i++
      continue
    }
    emitLetter(t)
    i++
    if (i >= tokens.length) break
    const next = tokens[i]!
    if (next === '^') {
      out.push({ kind: 'gap', ms: wordGap })
      i++
    } else {
      out.push({ kind: 'gap', ms: interGap })
    }
  }

  return out
}

/** 타임라인 총 길이(ms) — UI·디버그용 */
export function morseTimelineTotalMs(events: MorseSoundEvent[]): number {
  let s = 0
  for (const e of events) s += e.ms
  return s
}
