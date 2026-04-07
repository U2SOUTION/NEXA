/**
 * NIXIE HUD 24×7 도트 매핑(그리드·마퀴·정규화).
 *
 * 지원: 라틴 대·소문자(소문자는 대문자와 동일 도형), 숫자, 공백, 모스 **·**(`.`) **다**(`-`).
 * 전각 영숫자·일부 기호는 ASCII로 치환. 한글 등은 추후 `GLYPHS`·`normalizeDemoHudText` 확장.
 */

export const NIXIE_GRID_COLS = 24
export const NIXIE_GRID_ROWS = 7
/** 최대 가로 열 수(대부분의 글자) */
export const NIXIE_GLYPH_W = 5
export const NIXIE_GLYPH_H = 5
export const NIXIE_GLYPH_GAP_COLS = 0

const EMPTY_FALLBACK: string[] = ['00000', '00000', '00000', '00000', '00000']

/**
 * 마퀴 무한 루프용: 사용자 입력에 없는 PUA. `normalizeDemoHudText` 에서 제거되지 않도록 비입력 전용.
 */
const HUD_TAPE_GAP_CHAR = '\uE900'

/**
 * HUD 기본 글리프(대문자 A–Z, 0–9, 스페이스). 소문자는 `getGlyphRows`에서 여기 대문자로 폴백.
 * 모스 등은 `NIXIE_HUD_MORSE_ELEMENTS` 등을 `GLYPHS`에 병합.
 */
export const NIXIE_HUD_LATIN_UPPER_DIGITS: Record<string, string[]> = {
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
  ' ': ['00', '00', '00', '00', '00'],
}

/**
 * 모스부호 요소(텍스트로 `.` 띠, `-` 닻). 글자 사이는 공백으로 구분.
 * `·`(U+00B7) 등은 정규화에서 `.`로 통일.
 */
export const NIXIE_HUD_MORSE_ELEMENTS: Record<string, string[]> = {
  '.': ['1', '1', '1', '1', '1'],
  '-': ['000', '000', '111', '000', '000'],
}

/** 런타임 조회용(테이프 경계 글리프 포함). */
const GLYPHS: Record<string, string[]> = {
  ...NIXIE_HUD_LATIN_UPPER_DIGITS,
  ...NIXIE_HUD_MORSE_ELEMENTS,
  [HUD_TAPE_GAP_CHAR]: ['0000', '0000', '0000', '0000', '0000'],
}

/** 전각·유사 문자 → HUD 입력용 ASCII */
function narrowCompatChar(ch: string): string {
  const cp = ch.codePointAt(0)
  if (cp === undefined) return ch
  if (cp >= 0xff21 && cp <= 0xff3a) return String.fromCodePoint(cp - 0xff21 + 0x41)
  if (cp >= 0xff41 && cp <= 0xff5a) return String.fromCodePoint(cp - 0xff41 + 0x61)
  if (cp >= 0xff10 && cp <= 0xff19) return String.fromCodePoint(cp - 0xff10 + 0x30)
  if (cp === 0xff0e) return '.'
  if (cp === 0xff0d || cp === 0x2212 || cp === 0x2013 || cp === 0x2014) return '-'
  if (cp === 0xb7 || cp === 0x2022) return '.'
  return ch
}

function getGlyphRows(ch: string): string[] {
  if (Object.prototype.hasOwnProperty.call(GLYPHS, ch)) {
    return GLYPHS[ch]!
  }
  const cp = ch.codePointAt(0)
  if (cp !== undefined && cp >= 97 && cp <= 122) {
    const upper = String.fromCodePoint(cp - 32)
    const g = NIXIE_HUD_LATIN_UPPER_DIGITS[upper]
    if (g) return g
  }
  return EMPTY_FALLBACK
}

export function glyphColWidthForChar(ch: string): number {
  const g = getGlyphRows(ch)
  return g[0]?.length ?? NIXIE_GLYPH_W
}

/** 글리프 시작 행(0-based) */
export function getGlyphRowOffset(rows = NIXIE_GRID_ROWS, glyphH = NIXIE_GLYPH_H): number {
  return Math.max(0, Math.floor((rows - glyphH) / 2))
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

function hudTapePeriodSlots(fullNormalized: string): number {
  return fullNormalized.length + 1
}

/**
 * 마퀴 1주기의 그리드 열 수(글리프 폭 + 슬롯 간 GAP). 열 단위 스크롄 모듈로 랩.
 */
export function hudTapePeriodWidthCols(fullNormalized: string): number {
  const n = fullNormalized.length
  if (n === 0) return 0
  const slots = hudTapePeriodSlots(fullNormalized)
  let total = 0
  for (let k = 0; k < slots; k++) {
    if (k > 0) total += NIXIE_GLYPH_GAP_COLS
    const ch = k < n ? fullNormalized[k]! : HUD_TAPE_GAP_CHAR
    total += glyphColWidthForChar(ch)
  }
  return total
}

/**
 * 열 단위 마퀴 시 스크롄 최댓값(포함): `periodWidthCols - 1`.
 * 한 화면에 다 들어가면 0.
 */
export function getMaxScrollOffsetChars(fullNormalized: string): number {
  const t = fullNormalized
  if (!t.length) return 0
  if (textFitsCompletelyInGrid(t)) return 0
  const w = hudTapePeriodWidthCols(t)
  return w > 0 ? w - 1 : 0
}

/**
 * HUD에 쓸 문자만 남김: A–Z, a–z, 0–9, 공백, 모스 `.` `-`.
 * 전각·중점 등은 `narrowCompatChar`로 ASCII에 맞춤. (한글 등 미지원 문자는 제거.)
 */
export function normalizeDemoHudText(input: string): string {
  let out = ''
  for (const ch0 of input) {
    const ch = narrowCompatChar(ch0)
    if (ch === '\t' || ch === '\n' || ch === '\r') {
      out += ' '
      continue
    }
    if (ch === ' ') out += ' '
    else if (ch >= 'A' && ch <= 'Z') out += ch
    else if (ch >= 'a' && ch <= 'z') out += ch
    else if (ch >= '0' && ch <= '9') out += ch
    else if (ch === '.' || ch === '-') out += ch
  }
  return out
}

function drawGlyphInto(out: boolean[], len: number, col: number, rowOffset: number, glyph: string[]): void {
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
}

function drawGlyphColumnInto(
  out: boolean[],
  len: number,
  gridCol: number,
  rowOffset: number,
  glyph: string[],
  glyphCol: number,
): void {
  for (let r = 0; r < NIXIE_GLYPH_H; r++) {
    const rowStr = glyph[r] ?? ''
    if (rowStr[glyphCol] !== '1') continue
    const gridRow = r + rowOffset
    const idx = gridRow * NIXIE_GRID_COLS + gridCol
    if (idx >= 0 && idx < len) out[idx] = true
  }
}

function mapTapeToHudDotsColScroll(
  full: string,
  scrollCols: number,
  out: boolean[],
  len: number,
  rowOffset: number,
): void {
  const period = hudTapePeriodWidthCols(full)
  if (period <= 0) return
  let skip = Math.floor(scrollCols) % period
  if (skip < 0) skip += period

  const periodSlots = hudTapePeriodSlots(full)
  let gridCol = 0
  let k = 0
  const maxK = periodSlots * (NIXIE_GRID_COLS + period + 8)

  while (gridCol < NIXIE_GRID_COLS && k < maxK) {
    const idx = k % periodSlots
    const ch = idx < full.length ? full[idx]! : HUD_TAPE_GAP_CHAR
    const glyph = getGlyphRows(ch)
    const gw = glyph[0]!.length

    if (k > 0) {
      for (let g = 0; g < NIXIE_GLYPH_GAP_COLS; g++) {
        if (gridCol >= NIXIE_GRID_COLS) return
        if (skip > 0) skip--
        else gridCol++
      }
    }
    if (gridCol >= NIXIE_GRID_COLS) return

    for (let gc = 0; gc < gw; gc++) {
      if (gridCol >= NIXIE_GRID_COLS) return
      if (skip > 0) {
        skip--
        continue
      }
      drawGlyphColumnInto(out, len, gridCol, rowOffset, glyph, gc)
      gridCol++
    }
    k++
  }
}

/**
 * HUD 24×7 도트 on/off 배열.
 * `scrollOffset`: 한 화면에 다 들어가면 0과 동일(전부 표시);
 * 넘치면 테이프 기준 왼쪽에서 건너뛸 그리드 열 수(도트 1칸=1열).
 */
export function mapHudTextToDots(input: string, scrollOffset = 0): boolean[] {
  const len = NIXIE_GRID_COLS * NIXIE_GRID_ROWS
  const out = new Array<boolean>(len).fill(false)
  const full = normalizeDemoHudText(input)
  if (!full) return out

  const rowOffset = getGlyphRowOffset()
  const off = Math.max(0, Math.floor(scrollOffset))

  if (textFitsCompletelyInGrid(full)) {
    let col = 0
    for (let i = 0; i < full.length; i++) {
      const ch = full[i]!
      const glyph = getGlyphRows(ch)
      const w = glyph[0]!.length
      if (i > 0) col += NIXIE_GLYPH_GAP_COLS
      if (col + w > NIXIE_GRID_COLS) break
      drawGlyphInto(out, len, col, rowOffset, glyph)
      col += w
    }
    return out
  }

  mapTapeToHudDotsColScroll(full, off, out, len, rowOffset)
  return out
}

/** @deprecated `mapHudTextToDots` 사용 */
export const mapUppercaseTextToHudDots = mapHudTextToDots

export function hasHudTextMapping(input: string | null | undefined): boolean {
  return normalizeDemoHudText(input ?? '').length > 0
}
