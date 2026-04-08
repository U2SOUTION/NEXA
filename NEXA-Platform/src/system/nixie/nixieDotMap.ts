/**
 * NIXIE HUD 24×7 도트 매핑(그리드·마퀴·정규화).
 *
 * 지원: 라틴 대·소문자, 숫자, 공백, 모스 `.` `-`, 한글(완성형→자모 분해 표시).
 * 전각 영숫자·일부 기호는 ASCII로 치환. 한글은 예: `감` -> `ㄱ ㅏ ㅁ`.
 */

export const NIXIE_GRID_COLS = 24
export const NIXIE_GRID_ROWS = 7
/** 최대 가로 열 수(대부분의 글자) */
export const NIXIE_GLYPH_W = 5
/** 대문자·숫자·모스 등 기본 글리프 세로 행 수(소문자는 7행 별도) */
export const NIXIE_GLYPH_H = 5
/** 소문자 HUD: 7행 = 상단 공백 2 + 본문 4 + 하단 공백 1 */
export const NIXIE_HUD_LOWER_ROWS = 7
export const NIXIE_GLYPH_GAP_COLS = 1

const EMPTY_FALLBACK: string[] = ['00000', '00000', '00000', '00000', '00000']

/** 마퀴 무한 루프용: 사용자 입력에 없는 PUA. `normalizeDemoHudText` 에서 제거되지 않도록 비입력 전용.*/
const HUD_TAPE_GAP_CHAR = '\uE900'

/** HUD 대문자·숫자·스페이스. 소문자는 `NIXIE_HUD_LATIN_LOWER`에 별도 정의. */
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

/** 소문자 7행: 행0·1·6은 `0000`, 행2–5는 본문(각 4열). 별도 오프셋 없이 그리드 전고(7)에 맞춤. */
function hudLatinLower7(a: string, b: string, c: string, d: string): string[] {
  const z = '0000'
  return [z, z, a, b, c, d, z]
}

/** 한글 자모 7행: 상단 1칸, 본문 5행, 하단 1칸 */
function hudHangulJamo7(a: string, b: string, c: string, d: string, e = d): string[] {
  const z = '0000'
  return [z, a, b, c, d, e, z]
}

/** HUD 소문자 a–z. 행마다 동일 열 수(4). 시뮬에서 본문 4행(`hudLatinLower7` 인자)만 조정하면 됨.*/
export const NIXIE_HUD_LATIN_LOWER: Record<string, string[]> = {
  a: hudLatinLower7('0111', '0001', '0111', '1001'),
  b: hudLatinLower7('1000', '1111', '1001', '1111'),
  c: hudLatinLower7('0111', '1000', '1000', '0111'),
  d: hudLatinLower7('0001', '0111', '1001', '0111'),
  e: hudLatinLower7('0111', '1111', '1000', '0111'),
  f: hudLatinLower7('0110', '1000', '1110', '1000'),
  g: hudLatinLower7('0111', '1001', '0111', '1110'),
  h: hudLatinLower7('1000', '1111', '1001', '1001'),
  i: hudLatinLower7('0100', '0000', '0100', '0100'),
  j: hudLatinLower7('0010', '0000', '0010', '1100'),
  k: hudLatinLower7('1001', '1011', '1100', '1011'),
  l: hudLatinLower7('1100', '0100', '0100', '1110'),
  m: hudLatinLower7('1101', '1010', '1010', '1010'),
  n: hudLatinLower7('1111', '1001', '1001', '1001'),
  o: hudLatinLower7('0111', '1001', '1001', '0111'),
  p: hudLatinLower7('1111', '1001', '1111', '1000'),
  q: hudLatinLower7('0111', '1001', '0111', '0001'),
  r: hudLatinLower7('1011', '1100', '1000', '1000'),
  s: hudLatinLower7('0111', '1000', '0011', '1111'),
  t: hudLatinLower7('0100', '1110', '0100', '0011'),
  u: hudLatinLower7('1001', '1001', '1001', '0111'),
  v: hudLatinLower7('1001', '1001', '0101', '0010'),
  w: hudLatinLower7('1001', '1010', '1010', '0101'),
  x: hudLatinLower7('1001', '0101', '0101', '1001'),
  y: hudLatinLower7('1001', '1001', '0111', '0001'),
  z: hudLatinLower7('1111', '0011', '0110', '1111'),
}
/** 모스부호 요소(텍스트로 `.` 띠, `-` 닻). 글자 사이는 공백으로 구분. `·`(U+00B7) 등은 정규화에서 `.`로 통일.*/
export const NIXIE_HUD_MORSE_ELEMENTS: Record<string, string[]> = {
  '.': ['0', '0', '0', '0', '1'],
  '-': ['000', '000', '111', '000', '000'],
  '^': ['010', '101', '000', '000', '000'],
}

/** 한글 자모(저밀도 4열/7행) — 복합 자모는 정규화에서 기본 자모열로 분해. */
export const NIXIE_HUD_HANGUL_JAMO: Record<string, string[]> = {
  // 자음 (Consonants)
  ㄱ: hudHangulJamo7('111', '001', '001', '001', '001'),
  ㄲ: hudHangulJamo7('1111', '0011', '0011', '0011', '0011'),
  ㄴ: hudHangulJamo7('100', '100', '100', '100', '111'),
  ㄷ: hudHangulJamo7('111', '100', '100', '100', '111'),
  ㄸ: hudHangulJamo7('111', '110', '110', '110', '111'),
  ㄹ: hudHangulJamo7('111', '001', '111', '100', '111'),
  ㅁ: hudHangulJamo7('111', '101', '101', '101', '111'),
  ㅂ: hudHangulJamo7('101', '101', '111', '101', '111'),
  ㅃ: hudHangulJamo7('1001', '1111', '1111', '1111', '1111'),
  ㅅ: hudHangulJamo7('010', '010', '101', '101', '101'),
  ㅆ: hudHangulJamo7('0101', '0101', '1010', '1010', '1010'),
  ㅇ: hudHangulJamo7('010', '101', '101', '101', '010'),
  ㅈ: hudHangulJamo7('111', '001', '110', '101', '101'),
  ㅉ: hudHangulJamo7('1111', '0011', '1110', '1010', '1010'),
  ㅊ: hudHangulJamo7('010', '111', '010', '101', '101'),
  ㅋ: hudHangulJamo7('111', '001', '111', '001', '001'),
  ㅌ: hudHangulJamo7('111', '100', '111', '100', '111'),
  ㅍ: hudHangulJamo7('1111', '0110', '0110', '0110', '1111'),
  ㅎ: hudHangulJamo7('0110', '0000', '0110', '1001', '0110'),

  // 모음 (Vowels)
  ㅏ: hudHangulJamo7('100', '100', '110', '100', '100'),
  ㅐ: hudHangulJamo7('101', '101', '111', '101', '101'),
  ㅑ: hudHangulJamo7('010', '011', '010', '011', '010'),
  ㅒ: hudHangulJamo7('010', '011', '010', '011', '010'),
  ㅓ: hudHangulJamo7('010', '010', '110', '010', '010'),
  ㅔ: hudHangulJamo7('101', '101', '111', '101', '101'),
  ㅕ: hudHangulJamo7('010', '110', '110', '010', '010'),
  ㅖ: hudHangulJamo7('101', '111', '111', '101', '101'),
  ㅗ: hudHangulJamo7('000', '010', '010', '111', '000'),
  ㅛ: hudHangulJamo7('0000', '1010', '1111', '0000', '0000'),
  ㅜ: hudHangulJamo7('000', '111', '010', '010', '010'),
  ㅠ: hudHangulJamo7('0000', '1111', '1010', '1010', '1010'),
  ㅡ: hudHangulJamo7('000', '000', '111', '000', '000'),
  ㅣ: hudHangulJamo7('1', '1', '1', '1', '1'),
}

/** 런타임 조회용(테이프 경계 글리프 포함). */
const GLYPHS: Record<string, string[]> = {
  ...NIXIE_HUD_LATIN_UPPER_DIGITS,
  ...NIXIE_HUD_LATIN_LOWER,
  ...NIXIE_HUD_MORSE_ELEMENTS,
  ...NIXIE_HUD_HANGUL_JAMO,
  [HUD_TAPE_GAP_CHAR]: ['0000', '0000', '0000', '0000', '0000'],
}

const CHOSEONG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'] as const
const JUNGSEONG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'] as const
const JONGSEONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'] as const

/** 긴 모음 → 기본 모음 매핑. */
const COMPLEX_VOWEL_TO_BASIC: Record<string, string[]> = {
  ㅘ: ['ㅗ', 'ㅏ'],
  ㅙ: ['ㅗ', 'ㅐ'],
  ㅚ: ['ㅗ', 'ㅣ'],
  ㅝ: ['ㅜ', 'ㅓ'],
  ㅞ: ['ㅜ', 'ㅔ'],
  ㅟ: ['ㅜ', 'ㅣ'],
  ㅢ: ['ㅡ', 'ㅣ'],
}

/** 긴 모음 → 기본 모음 매핑. */
const COMPLEX_FINAL_TO_BASIC: Record<string, string[]> = {
  ㄳ: ['ㄱ', 'ㅅ'],
  ㄵ: ['ㄴ', 'ㅈ'],
  ㄶ: ['ㄴ', 'ㅎ'],
  ㄺ: ['ㄹ', 'ㄱ'],
  ㄻ: ['ㄹ', 'ㅁ'],
  ㄼ: ['ㄹ', 'ㅂ'],
  ㄽ: ['ㄹ', 'ㅅ'],
  ㄾ: ['ㄹ', 'ㅌ'],
  ㄿ: ['ㄹ', 'ㅍ'],
  ㅀ: ['ㄹ', 'ㅎ'],
  ㅄ: ['ㅂ', 'ㅅ'],
}
/** 긴 자음 → 기본 자음 매핑. */
const TENSE_CONSONANT_TO_BASIC: Record<string, string> = {
  ㄲ: 'ㄱ',
  ㄸ: 'ㄷ',
  ㅃ: 'ㅂ',
  ㅆ: 'ㅅ',
  ㅉ: 'ㅈ',
}

/** 전각·유사 문자 → 표준 자모 */
function normalizeCompatJamo(ch: string): string {
  if (Object.prototype.hasOwnProperty.call(NIXIE_HUD_HANGUL_JAMO, ch)) return ch
  return TENSE_CONSONANT_TO_BASIC[ch] ?? ch
}

/** 한글 음절 → 자모 배열. 복합 자모는 정규화에서 기본 자모열로 분해. */
function decomposeHangulSyllableToJamo(ch: string): string[] | null {
  const cp = ch.codePointAt(0)
  if (cp === undefined) return null
  if (cp < 0xac00 || cp > 0xd7a3) return null
  const sIndex = cp - 0xac00
  const l = Math.floor(sIndex / 588)
  const v = Math.floor((sIndex % 588) / 28)
  const t = sIndex % 28

  const cho = normalizeCompatJamo(CHOSEONG[l] ?? '')
  const jungRaw = JUNGSEONG[v] ?? ''
  const jung = (COMPLEX_VOWEL_TO_BASIC[jungRaw] ?? [jungRaw]).map(normalizeCompatJamo)
  const jongRaw = JONGSEONG[t] ?? ''
  const jong = jongRaw ? (COMPLEX_FINAL_TO_BASIC[jongRaw] ?? [jongRaw]).map(normalizeCompatJamo) : []

  return [cho, ...jung, ...jong].filter(Boolean)
}

/** 전각·유사 문자 → HUD 입력용 자모 배열. 복합 자모는 정규화에서 기본 자모열로 분해. */
function expandCompatJamoInput(ch: string): string[] | null {
  if (Object.prototype.hasOwnProperty.call(COMPLEX_VOWEL_TO_BASIC, ch)) {
    return COMPLEX_VOWEL_TO_BASIC[ch]!.map(normalizeCompatJamo).filter(Boolean)
  }
  if (Object.prototype.hasOwnProperty.call(COMPLEX_FINAL_TO_BASIC, ch)) {
    return COMPLEX_FINAL_TO_BASIC[ch]!.map(normalizeCompatJamo).filter(Boolean)
  }
  const normalized = normalizeCompatJamo(ch)
  if (Object.prototype.hasOwnProperty.call(NIXIE_HUD_HANGUL_JAMO, normalized)) {
    return [normalized]
  }
  return null
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

/** 모스 문자 인코딩 매핑. 대문자 알파벳 → 모스 문자열. */
const MORSE_LATIN_DIGITS: Record<string, string> = {
  A: '.-',
  B: '-...',
  C: '-.-.',
  D: '-..',
  E: '.',
  F: '..-.',
  G: '--.',
  H: '....',
  I: '..',
  J: '.---',
  K: '-.-',
  L: '.-..',
  M: '--',
  N: '-.',
  O: '---',
  P: '.--.',
  Q: '--.-',
  R: '.-.',
  S: '...',
  T: '-',
  U: '..-',
  V: '...-',
  W: '.--',
  X: '-..-',
  Y: '-.--',
  Z: '--..',
  '0': '-----',
  '1': '.----',
  '2': '..---',
  '3': '...--',
  '4': '....-',
  '5': '.....',
  '6': '-....',
  '7': '--...',
  '8': '---..',
  '9': '----.',
}

/** 한글 자모 → 모스 문자열 인코딩 매핑. */
const MORSE_HANGUL_JAMO: Record<string, string> = {
  ㄱ: '.-..',
  ㄴ: '..-.',
  ㄷ: '-...',
  ㄹ: '...-',
  ㅁ: '--',
  ㅂ: '.--',
  ㅅ: '--.',
  ㅇ: '-.-',
  ㅈ: '.--.',
  ㅊ: '-.-.',
  ㅋ: '-..-',
  ㅌ: '--..',
  ㅍ: '---',
  ㅎ: '.---',
  ㅏ: '.',
  ㅑ: '..',
  ㅓ: '-',
  ㅕ: '...',
  ㅗ: '.-',
  ㅛ: '-.',
  ㅜ: '....',
  ㅠ: '.-.',
  ㅡ: '-..',
  ㅣ: '..-',
}

/** 한글 자모 → 모스 문자열 인코딩 매핑. 복합 자모는 정규화에서 기본 자모열로 분해. */
const MORSE_JAMO_VOWEL_DECOMPOSE: Record<string, string[]> = {
  ㅐ: ['ㅏ', 'ㅣ'],
  ㅒ: ['ㅑ', 'ㅣ'],
  ㅔ: ['ㅓ', 'ㅣ'],
  ㅖ: ['ㅕ', 'ㅣ'],
  ㅘ: ['ㅗ', 'ㅏ'],
  ㅙ: ['ㅗ', 'ㅐ'],
  ㅚ: ['ㅗ', 'ㅣ'],
  ㅝ: ['ㅜ', 'ㅓ'],
  ㅞ: ['ㅜ', 'ㅔ'],
  ㅟ: ['ㅜ', 'ㅣ'],
  ㅢ: ['ㅡ', 'ㅣ'],
}

/** 한글 자모 → 모스 문자열 인코딩 매핑. 복합 자모는 정규화에서 기본 자모열로 분해. */
function expandJamoForMorse(ch: string): string[] {
  if (Object.prototype.hasOwnProperty.call(MORSE_JAMO_VOWEL_DECOMPOSE, ch)) {
    return MORSE_JAMO_VOWEL_DECOMPOSE[ch]!.flatMap(expandJamoForMorse)
  }
  if (Object.prototype.hasOwnProperty.call(COMPLEX_FINAL_TO_BASIC, ch)) {
    return COMPLEX_FINAL_TO_BASIC[ch]!.flatMap(expandJamoForMorse)
  }
  return [normalizeCompatJamo(ch)]
}

/**
 * 입력 텍스트를 HUD 출력용 모스 문자열(`.` `-` `^` 공백 구분)로 변환.
 * - 문자 간 구분: 스페이스 1칸
 * - 단어 구분: `^`
 * - 한글 완성형: 자모 분해 후 각 자모를 모스로 인코딩
 */
export function encodeTextToMorseHudText(input: string): string {
  const out: string[] = []
  for (const raw of input) {
    const ch = narrowCompatChar(raw)
    if (ch === '\t' || ch === '\n' || ch === '\r' || ch === ' ') {
      if (out.length > 0 && out[out.length - 1] !== '^') out.push('^')
      continue
    }

    const upper = ch.toUpperCase()
    const latin = MORSE_LATIN_DIGITS[upper]
    if (latin) {
      out.push(latin)
      continue
    }

    const syllable = decomposeHangulSyllableToJamo(ch)
    if (syllable) {
      const parts = syllable
        .flatMap(expandJamoForMorse)
        .map((j) => MORSE_HANGUL_JAMO[j])
        .filter(Boolean)
      if (parts.length) out.push(parts.join(' '))
      continue
    }

    const jamo = expandCompatJamoInput(ch)
    if (jamo) {
      const parts = jamo
        .flatMap(expandJamoForMorse)
        .map((j) => MORSE_HANGUL_JAMO[j])
        .filter(Boolean)
      if (parts.length) out.push(parts.join(' '))
      continue
    }
  }
  return out
    .join(' ')
    .replace(/\s*\^\s*/g, ' ^ ')
    .trim()
}

/** 문자 → 글리프 행 배열. 한글 자모는 정규화에서 기본 자모열로 분해. */
function getGlyphRows(ch: string): string[] {
  if (Object.prototype.hasOwnProperty.call(GLYPHS, ch)) {
    return GLYPHS[ch]!
  }
  return EMPTY_FALLBACK
}

/** 글리프 행 배열 → 가시 너비(좌측 공백 제외). */
function glyphVisibleWidth(glyph: string[]): number {
  let w = 0
  for (const row of glyph) {
    const idx = row.lastIndexOf('1')
    if (idx >= 0) w = Math.max(w, idx + 1)
  }
  return w > 0 ? w : 1
}

/** 문자 → 실제 글리프 가시 너비(좌측 공백 제외). 한글 자모는 우측 공백 열을 제거해 자모 사이 간격이 GAP 값만 적용되게 함. */
function glyphDrawWidthForChar(ch: string, glyph: string[]): number {
  if (Object.prototype.hasOwnProperty.call(NIXIE_HUD_HANGUL_JAMO, ch)) {
    // 자모는 우측 공백 열을 제거해 자모 사이 간격이 GAP 값만 적용되게 함.
    return glyphVisibleWidth(glyph)
  }
  return glyph[0]?.length ?? NIXIE_GLYPH_W
}

/** 문자 → 글리프 가시 너비(좌측 공백 제외). 한글 자모는 우측 공백 열을 제거해 자모 사이 간격이 GAP 값만 적용되게 함. */
export function glyphColWidthForChar(ch: string): number {
  const g = getGlyphRows(ch)
  return glyphDrawWidthForChar(ch, g)
}

/** 고정 높이 glyphH 기준 세로 중앙(레거시·문서용) */
export function getGlyphRowOffset(rows = NIXIE_GRID_ROWS, glyphH = NIXIE_GLYPH_H): number {
  return Math.max(0, Math.floor((rows - glyphH) / 2))
}

/** 실제 글리프 행 수에 맞춘 세로 시작(소문자 7행→0, 대문자 5행→1). 패턴에 여백을 넣은 경우 오프셋 추가 없음. */
export function hudRowOffsetForGlyph(glyph: string[]): number {
  const h = glyph.length
  if (h <= 0) return getGlyphRowOffset()
  return Math.max(0, Math.floor((NIXIE_GRID_ROWS - h) / 2))
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

/** 문자열 → 마퀴 주기의 슬롯 수(문자열 길이 + 슬롯 간 GAP). */
function hudTapePeriodSlots(fullNormalized: string): number {
  return fullNormalized.length + 1
}

/** 문자열 → 마퀴 1주기의 그리드 열 수(글리프 폭 + 슬롯 간 GAP). 열 단위 스크롄 모듈로 랩. */
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

/** 문자열 → 열 단위 마퀴 시 스크롄 최댓값(포함): `periodWidthCols - 1`. 한 화면에 다 들어가면 0. */
export function getMaxScrollOffsetChars(fullNormalized: string): number {
  const t = fullNormalized
  if (!t.length) return 0
  if (textFitsCompletelyInGrid(t)) return 0
  const w = hudTapePeriodWidthCols(t)
  return w > 0 ? w - 1 : 0
}

/**
 * 테이프 0열 기준, `full[charIndex]` 글리프가 시작하는 **그리드 열 오프셋**.
 * `mapTapeToHudDotsColScroll` / `hudTapePeriodWidthCols` 와 동일 규칙(슬롯 간 GAP).
 */
export function tapeColStartForCharIndex(full: string, charIndex: number): number {
  const n = full.length
  if (charIndex <= 0) return 0
  const end = Math.min(charIndex, n)
  let total = 0
  for (let k = 0; k < end; k++) {
    if (k > 0) total += NIXIE_GLYPH_GAP_COLS
    total += glyphColWidthForChar(full[k]!)
  }
  return total
}

/**
 * `morseTimeline` 의 공백 분리 토큰과 동일 규칙(`trim` + `split(/\\s+/)`)으로
 * `tokenIndex` 번째 토큰이 차지하는 **`fullNormalized` 내 문자 구간** `[start, end)` (end 배타).
 * `^` 도 한 토큰. 범위 밖이면 `null`.
 */
export function getMorseTokenCharRange(fullNormalized: string, tokenIndex: number): { start: number; end: number } | null {
  const full = fullNormalized
  if (!full.length || tokenIndex < 0) return null
  const tokens = full.trim().split(/\s+/).filter(Boolean)
  if (tokenIndex >= tokens.length) return null
  let searchFrom = 0
  while (searchFrom < full.length && /\s/.test(full[searchFrom]!)) searchFrom++
  for (let t = 0; t < tokens.length; t++) {
    const tok = tokens[t]!
    const idx = full.indexOf(tok, searchFrom)
    if (idx < 0) return null
    if (t === tokenIndex) return { start: idx, end: idx + tok.length }
    searchFrom = idx + tok.length
    while (searchFrom < full.length && full[searchFrom] === ' ') searchFrom++
  }
  return null
}

/**
 * 긴 테이프에서 `tokenIndex` 토큰이 **24열 뷰 안에서 가운데** 오도록 하는 `scrollOffset`
 * (`mapHudTextToDots` 의 두 번째 인자와 동일 단위: 건너뛸 그리드 열 수, 주기 내 랩).
 * 한 화면에 전부 들어가면 `0`.
 */
export function scrollOffsetToCenterToken(fullNormalized: string, tokenIndex: number): number {
  const full = fullNormalized
  if (!full.length) return 0
  if (textFitsCompletelyInGrid(full)) return 0
  const rng = getMorseTokenCharRange(full, tokenIndex)
  if (!rng) return 0
  const colStart = tapeColStartForCharIndex(full, rng.start)
  const colEndEx = tapeColStartForCharIndex(full, rng.end)
  const center = (colStart + colEndEx) / 2
  const target = Math.round(center - NIXIE_GRID_COLS / 2)
  const maxScroll = getMaxScrollOffsetChars(full)
  return Math.max(0, Math.min(maxScroll, target))
}

/** 문자열 → HUD에 쓸 문자만 남김: A–Z, a–z, 0–9, 공백, 모스 `.` `-` `^`, 한글(자모 분해). 한글 완성형은 예: `감` -> `ㄱ ㅏ ㅁ` 형태로 확장. */
export function normalizeDemoHudText(input: string): string {
  let out = ''
  for (const ch0 of input) {
    const decomposed = decomposeHangulSyllableToJamo(ch0)
    if (decomposed) {
      out += decomposed.join('')
      continue
    }
    const jamoExpanded = expandCompatJamoInput(ch0)
    if (jamoExpanded) {
      out += jamoExpanded.join('')
      continue
    }
    const ch = narrowCompatChar(ch0)
    if (ch === '\t' || ch === '\n' || ch === '\r') {
      out += ' '
      continue
    }
    if (ch === ' ') out += ' '
    else if (ch >= 'A' && ch <= 'Z') out += ch
    else if (ch >= 'a' && ch <= 'z') out += ch
    else if (ch >= '0' && ch <= '9') out += ch
    else if (ch === '.' || ch === '-' || ch === '^') out += ch
    else if (Object.prototype.hasOwnProperty.call(NIXIE_HUD_HANGUL_JAMO, ch)) out += normalizeCompatJamo(ch)
  }
  return out
}

/** 글리프 행 배열 → HUD 도트 배열에 그리기. */
function drawGlyphInto(out: boolean[], len: number, col: number, rowOffset: number, glyph: string[], drawWidth: number): void {
  const gh = glyph.length
  for (let r = 0; r < gh; r++) {
    const rowStr = glyph[r] ?? ''
    const rw = Math.min(rowStr.length, drawWidth)
    for (let c = 0; c < rw; c++) {
      if (rowStr[c] !== '1') continue
      const gridCol = col + c
      const gridRow = r + rowOffset
      if (gridRow < 0 || gridRow >= NIXIE_GRID_ROWS) continue
      const idx = gridRow * NIXIE_GRID_COLS + gridCol
      if (idx >= 0 && idx < len) out[idx] = true
    }
  }
}

/** 글리프 행 배열 → HUD 도트 배열에 그리기. */
function drawGlyphColumnInto(out: boolean[], len: number, gridCol: number, rowOffset: number, glyph: string[], glyphCol: number): void {
  const gh = glyph.length
  for (let r = 0; r < gh; r++) {
    const rowStr = glyph[r] ?? ''
    if (glyphCol >= rowStr.length || rowStr[glyphCol] !== '1') continue
    const gridRow = r + rowOffset
    if (gridRow < 0 || gridRow >= NIXIE_GRID_ROWS) continue
    const idx = gridRow * NIXIE_GRID_COLS + gridCol
    if (idx >= 0 && idx < len) out[idx] = true
  }
}

/**
 * 문자열 → HUD 도트 배열에 마퀴 스크롄 그리기.
 * `drawSlotGlyph` 가 있으면 `slotCharIndex < full.length` 이고 참일 때만 해당 슬롯 글리프를 그린다(마지막 테이프 갭 슬롯은 `drawSlotGlyph` 없을 때만 그림).
 */
function mapTapeToHudDotsColScroll(
  full: string,
  scrollCols: number,
  out: boolean[],
  len: number,
  drawSlotGlyph?: (slotCharIndex: number) => boolean,
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
    const gw = glyphDrawWidthForChar(ch, glyph)
    const drawThisSlot =
      drawSlotGlyph === undefined ? true : idx < full.length && drawSlotGlyph(idx)

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
      if (drawThisSlot) {
        drawGlyphColumnInto(out, len, gridCol, hudRowOffsetForGlyph(glyph), glyph, gc)
      }
      gridCol++
    }
    k++
  }
}

/** 문자열 → HUD 24×7 도트 on/off 배열. `scrollOffset`: 한 화면에 다 들어가면 0과 동일(전부 표시); 넘치면 테이프 기준 왼쪽에서 건너뛸 그리드 열 수(도트 1칸=1열). */
export function mapHudTextToDots(input: string, scrollOffset = 0): boolean[] {
  const len = NIXIE_GRID_COLS * NIXIE_GRID_ROWS
  const out = new Array<boolean>(len).fill(false)
  const full = normalizeDemoHudText(input)
  if (!full) return out

  const off = Math.max(0, Math.floor(scrollOffset))

  if (textFitsCompletelyInGrid(full)) {
    let col = 0
    for (let i = 0; i < full.length; i++) {
      const ch = full[i]!
      const glyph = getGlyphRows(ch)
      const w = glyphDrawWidthForChar(ch, glyph)
      if (i > 0) col += NIXIE_GLYPH_GAP_COLS
      if (col + w > NIXIE_GRID_COLS) break
      drawGlyphInto(out, len, col, hudRowOffsetForGlyph(glyph), glyph, w)
      col += w
    }
    return out
  }

  mapTapeToHudDotsColScroll(full, off, out, len)
  return out
}

/**
 * `mapHudTextToDots` 와 동일 스크롄·테이프 규칙이되, **문자 구간 `[charStart, charEndExclusive)`** 에 해당하는 글리프만 켜진 도트 마스크.
 * 재생 중 현재 토큰 강조(이중 루미나)용.
 */
export function mapHudTextToDotsCharRangeMask(
  input: string,
  scrollOffset: number,
  charStart: number,
  charEndExclusive: number,
): boolean[] {
  const len = NIXIE_GRID_COLS * NIXIE_GRID_ROWS
  const out = new Array<boolean>(len).fill(false)
  const full = normalizeDemoHudText(input)
  if (!full) return out
  const lo = Math.max(0, Math.min(full.length, Math.floor(charStart)))
  const hi = Math.max(lo, Math.min(full.length, Math.floor(charEndExclusive)))
  if (lo >= hi) return out

  const off = Math.max(0, Math.floor(scrollOffset))

  if (textFitsCompletelyInGrid(full)) {
    let col = 0
    for (let i = 0; i < full.length; i++) {
      const ch = full[i]!
      const glyph = getGlyphRows(ch)
      const w = glyphDrawWidthForChar(ch, glyph)
      if (i > 0) col += NIXIE_GLYPH_GAP_COLS
      if (col + w > NIXIE_GRID_COLS) break
      if (i >= lo && i < hi) {
        drawGlyphInto(out, len, col, hudRowOffsetForGlyph(glyph), glyph, w)
      }
      col += w
    }
    return out
  }

  mapTapeToHudDotsColScroll(full, off, out, len, (slotIdx) => slotIdx >= lo && slotIdx < hi)
  return out
}

/** @deprecated `mapHudTextToDots` 사용 */
export const mapUppercaseTextToHudDots = mapHudTextToDots

export function hasHudTextMapping(input: string | null | undefined): boolean {
  return normalizeDemoHudText(input ?? '').length > 0
}
