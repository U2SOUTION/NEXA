/**
 * NIXIE 온라인 HUD 도트 루미나 — 불투명도·티어 분류만 (GSAP/DOM 없음).
 *
 * 데이터 흐름 요약:
 * - `nmapSnapshotStore` · `morseTimeline` · `morseWebAudio` → 재생 프레임·강조 문자
 * - `nixieDotMap` → 텍스트+스크롄 → 도트 마스크
 * - 이 모듈 → 마스크 조합으로 티어(tape / token / accent) + 권장 opacity
 * - `NixieOnlineCharacter.vue` → 클래스 부착 + gsap.set
 */

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max)
}

/** per-event 옵션 ON일 때 GSAP에 넣을 상대 불투명도(엔트로피 `minOpacity` 기반) */
export const HUD_LUMINA_PER_EVENT = {
  /** 테이프 맥락은 필터만으로 어둡게 하지 말 것 — GSAP opacity가 최종 밝기를 지배함 */
  tape: { minMul: 0.66, add: 0.1, clampMin: 0.11, clampMax: 0.28 },
  /** 토큰 나머지는 필터만으로 어둡게 하지 말 것 — GSAP opacity가 최종 밝기를 지배함 */
  token: { minMul: 0.82, add: 0.2, clampMin: 0.22, clampMax: 0.46 },
  /** `tokenFullMask` 없을 때 기존 2단 dim */
  fallbackDim: { minMul: 0.34, add: 0.04, clampMin: 0.07, clampMax: 0.26 },
} as const

export function opacityFromMinOpacity(minOpacity: number, spec: { minMul: number; add: number; clampMin: number; clampMax: number }): number {
  return clamp(minOpacity * spec.minMul + spec.add, spec.clampMin, spec.clampMax)
}

export type MorsePerEventTier = 'tape' | 'token' | 'accent'

/**
 * per-event 3단계: 테이프 맥락 / 같은 토큰 나머지 / 현재 부호(accent).
 * `tokenFullMask`가 있을 때만 의미 있음.
 */
export function morsePerEventDotTier(i: number, mask: boolean[], tokenFullMask: boolean[], highlightMask: boolean[] | null, hasHighlight: boolean): MorsePerEventTier | null {
  if (!mask[i]) return null
  if (hasHighlight && highlightMask?.[i]) return 'accent'
  if (tokenFullMask[i]) return 'token'
  return 'tape'
}
