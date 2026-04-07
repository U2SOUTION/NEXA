/**
 * 24×7 NIXIE HUD용 영문 대문자 도트 매핑.
 * 글리프마다 가로 열 수가 다를 수 있음(예: I=3열). 글리프 사이는 NIXIE_GLYPH_GAP_COLS(1열)만.
 * 세로: 5행 글리프를 그리드 세로 중앙(상·하 동일 여백).
 */

export const NIXIE_GRID_COLS = 24
export const NIXIE_GRID_ROWS = 7
/** 최대 가로 열 수(대부분의 글자) */
export const NIXIE_GLYPH_W = 5
export const NIXIE_GLYPH_H = 5
export const NIXIE_GLYPH_GAP_COLS = 0

const EMPTY_FALLBACK: string[] = ['00000', '00000', '00000', '00000', '00000']

/** 행별 '0' | '1' 문자열. 행마다 길이 동일 = 해당 글리프 가로 열 수 */
const GLYPHS: Record<string, string[]> = {
  A: ['01110', '10001', '10001', '11111', '10001'],
  B: ['11110', '10001', '11110', '10001', '11110'],
  C: ['01110', '10001', '10000', '10001', '01110'],
  D: ['1110', '1001', '1001', '1001', '1110'],
  E: ['1111', '1000', '1111', '1000', '1111'],
  F: ['1111', '1000', '1111', '1000', '1000'],
  G: ['01110', '10000', '10111', '10001', '01110'],
  H: ['10001', '10001', '11111', '10001', '10001'],
  I: ['111', '010', '010', '010', '111'],
  J: ['00111', '00010', '00010', '10010', '01100'],
  K: ['10001', '10010', '11100', '10010', '10001'],
  /** 4열: 5열(11110)이면 오른쪽 빈 열+글리프 간격으로 L 뒤가 2칸처럼 보임 */
  L: ['1000', '1000', '1000', '1000', '1111'],
  M: ['10001', '11011', '10101', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001'],
  O: ['01110', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '11110', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10101', '01111'],
  R: ['11110', '10001', '11110', '10010', '10001'],
  S: ['01111', '10000', '01110', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10101', '10101', '01010'],
  X: ['10001', '01010', '00100', '01010', '10001'],
  Y: ['10001', '01010', '00100', '00100', '00100'],
  Z: ['11111', '00010', '00100', '01000', '11111'],
  /** 0–9: 3열 (한 줄에 더 많이 표시·마퀴와 궁합) */
  '0': ['111', '101', '101', '101', '111'],
  '1': ['010', '110', '010', '010', '111'],
  '2': ['111', '001', '111', '100', '111'],
  '3': ['111', '001', '011', '001', '111'],
  '4': ['101', '101', '111', '001', '001'],
  '5': ['111', '100', '111', '001', '111'],
  '6': ['111', '100', '111', '101', '111'],
  '7': ['111', '001', '001', '001', '001'],
  '8': ['111', '101', '111', '101', '111'],
  '9': ['111', '101', '111', '001', '111'],
  /** 단어 간격: 도트 없이 2열만 진행 */
  ' ': ['00', '00', '00', '00', '00'],
}

/** 전각 A–Z / 0–9 → ASCII 동일 문자 */
function narrowCompatChar(ch: string): string {
  const cp = ch.codePointAt(0)
  if (cp === undefined) return ch
  if (cp >= 0xff21 && cp <= 0xff3a) return String.fromCodePoint(cp - 0xff21 + 0x41)
  if (cp >= 0xff10 && cp <= 0xff19) return String.fromCodePoint(cp - 0xff10 + 0x30)
  return ch
}

export function glyphColWidthForChar(ch: string): number {
  const g = GLYPHS[ch] ?? EMPTY_FALLBACK
  return g[0]?.length ?? NIXIE_GLYPH_W
}

function getGlyphRows(ch: string): string[] {
  return GLYPHS[ch] ?? EMPTY_FALLBACK
}

/** 글리프 시작 행(0-based) */
export function getGlyphRowOffset(rows = NIXIE_GRID_ROWS, glyphH = NIXIE_GLYPH_H): number {
  return Math.max(0, Math.floor((rows - glyphH) / 2))
}

/**
 * 정규화된 문자열에서, 스크롤 시작 인덱스로 허용되는 최댓값
 * (해당 인덱스부터 그리드에 1글자 이상 들어갈 수 있어야 함)
 */
export function getMaxScrollOffsetChars(fullNormalized: string): number {
  const t = fullNormalized
  if (!t.length) return 0
  for (let start = t.length - 1; start >= 0; start--) {
    if (fitsVisibleFrom(t, start)) return start
  }
  return 0
}

function fitsVisibleFrom(t: string, start: number): boolean {
  let col = 0
  for (let i = start; i < t.length; i++) {
    const w = glyphColWidthForChar(t[i]!)
    if (i > start) col += NIXIE_GLYPH_GAP_COLS
    if (col + w > NIXIE_GRID_COLS) break
    col += w
  }
  return col > 0
}

/** 인덱스 0부터 전체 문자열이 그리드 너비 안에 들어가면 true(마퀴 불필요) */
export function textFitsCompletelyInGrid(fullNormalized: string): boolean {
  if (!fullNormalized.length) return true
  let col = 0
  for (let i = 0; i < fullNormalized.length; i++) {
    const w = glyphColWidthForChar(fullNormalized[i]!)
    if (i > 0) col += NIXIE_GLYPH_GAP_COLS
    if (col + w > NIXIE_GRID_COLS) return false
    col += w
  }
  return true
}

/**
 * HUD에 쓸 문자만 남김: A–Z, 0–9, 스페이스.
 * 전각 영문·전각 숫자(Ａ–Ｚ, ０–９)는 ASCII로 치환 후 허용.
 */
export function normalizeDemoHudText(input: string): string {
  const u = input.toUpperCase()
  let out = ''
  for (const ch0 of u) {
    const ch = narrowCompatChar(ch0)
    if (ch === '\t' || ch === '\n' || ch === '\r') {
      out += ' '
      continue
    }
    if (ch === ' ') out += ' '
    else if (ch >= 'A' && ch <= 'Z') out += ch
    else if (ch >= '0' && ch <= '9') out += ch
  }
  return out
}

/**
 * HUD 24×7 도트 on/off 배열.
 * `scrollOffset`: 정규화된 문자열에서 시작 글자 인덱스.
 */
export function mapUppercaseTextToHudDots(input: string, scrollOffset = 0): boolean[] {
  const len = NIXIE_GRID_COLS * NIXIE_GRID_ROWS
  const out = new Array<boolean>(len).fill(false)
  const full = normalizeDemoHudText(input)
  if (!full) return out

  const off = Math.max(0, Math.floor(scrollOffset))
  const rowOffset = getGlyphRowOffset()

  let col = 0
  for (let i = off; i < full.length; i++) {
    const ch = full[i]!
    const glyph = getGlyphRows(ch)
    const w = glyph[0]!.length
    if (i > off) col += NIXIE_GLYPH_GAP_COLS
    if (col + w > NIXIE_GRID_COLS) break

    for (let r = 0; r < NIXIE_GLYPH_H; r++) {
      const rowStr = glyph[r] ?? ''
      for (let c = 0; c < rowStr.length; c++) {
        if (rowStr[c] !== '1') continue
        const gridCol = col + c
        const gridRow = r + rowOffset
        const idx = gridRow * NIXIE_GRID_COLS + gridCol
        if (idx >= 0 && idx < len) out[idx] = true
      }
    }
    col += w
  }
  return out
}

export function hasHudTextMapping(input: string | null | undefined): boolean {
  return normalizeDemoHudText(input ?? '').length > 0
}
