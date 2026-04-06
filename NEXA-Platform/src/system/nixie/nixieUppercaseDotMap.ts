/**
 * 18×6 NIXIE HUD용 영문 대문자 5×5 도트 매핑.
 * 가로: 글리프(5열) + 슬롯 간 1열 간격 · 세로 5행, 하단 1행은 여백.
 * 긴 문자열은 이후 좌→우 스크롤(demo_hud_scroll_offset)으로 창만 이동.
 */

export const NIXIE_GRID_COLS = 18
export const NIXIE_GRID_ROWS = 6
export const NIXIE_GLYPH_W = 5
export const NIXIE_GLYPH_H = 5

/** 현재 그리드 너비에 들어가는 최대 글리프 수(스크롤 없이 보이는 창 크기) */
export function getMaxGlyphSlotsForGrid(): number {
  let n = 0
  for (let s = 0; ; s++) {
    const colStart = 1 + s * (NIXIE_GLYPH_W + 1)
    if (colStart + NIXIE_GLYPH_W > NIXIE_GRID_COLS) return n
    n++
  }
}

/** 행별 '0' | '1' 문자열 (왼쪽→오른쪽) */
const GLYPHS: Record<string, string[]> = {
  A: ['01110', '10001', '10001', '11111', '10001'],
  B: ['11110', '10001', '11110', '10001', '11110'],
  C: ['01110', '10001', '10000', '10001', '01110'],
  D: ['11100', '10010', '10001', '10010', '11100'],
  E: ['11111', '10000', '11110', '10000', '11111'],
  F: ['11111', '10000', '11110', '10000', '10000'],
  G: ['01110', '10000', '10111', '10001', '01110'],
  H: ['10001', '10001', '11111', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '11111'],
  J: ['00111', '00010', '00010', '10010', '01100'],
  K: ['10001', '10010', '11100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '11111'],
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
  ' ': ['00000', '00000', '00000', '00000', '00000'],
}

const EMPTY_SLOT = GLYPHS[' ']!

/** 입력을 대문자·스페이스만 남김(길이 제한 없음, 스토어에 그대로 보관) */
export function normalizeDemoHudText(input: string): string {
  const u = input.toUpperCase()
  let out = ''
  for (let i = 0; i < u.length; i++) {
    const ch = u[i]!
    if (ch === ' ') out += ' '
    else if (ch >= 'A' && ch <= 'Z') out += ch
  }
  return out
}

/**
 * HUD 18×6 도트 on/off 배열(길이 108).
 * `scrollOffset`: 정규화된 문자열에서 몇 글자부터 그릴지(이후 좌→우 흐름용).
 */
export function mapUppercaseTextToHudDots(input: string, scrollOffset = 0): boolean[] {
  const len = NIXIE_GRID_COLS * NIXIE_GRID_ROWS
  const out = new Array<boolean>(len).fill(false)
  const full = normalizeDemoHudText(input)
  if (!full) return out

  const maxSlots = getMaxGlyphSlotsForGrid()
  const off = Math.max(0, Math.floor(scrollOffset))
  const text = full.slice(off, off + maxSlots)
  if (!text.length) return out

  for (let slot = 0; slot < text.length; slot++) {
    const ch = text[slot]!
    const glyph = GLYPHS[ch] ?? EMPTY_SLOT
    const colStart = 1 + slot * (NIXIE_GLYPH_W + 1)

    for (let r = 0; r < NIXIE_GLYPH_H; r++) {
      const rowStr = glyph[r] ?? '00000'
      for (let c = 0; c < NIXIE_GLYPH_W; c++) {
        const bit = rowStr[c] === '1'
        if (!bit) continue
        const col = colStart + c
        const idx = r * NIXIE_GRID_COLS + col
        if (idx >= 0 && idx < len) out[idx] = true
      }
    }
  }
  return out
}

export function hasHudTextMapping(input: string | null | undefined): boolean {
  return normalizeDemoHudText(input ?? '').length > 0
}
