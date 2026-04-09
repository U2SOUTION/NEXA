/**
 * Nixie 개발·체험 UI 상수 — HUD 마퀴 등.
 * 빌드 후 숫자만 바꿔 확인하거나, 이후 Pinia/설정으로 승격할 때 이 파일을 기준으로 분리하면 됨.
 */

/** HUD 마퀴(흐름) — 틱 간격·슬라이더 역매핑 */
export const NIXIE_HUD_MARQUEE = {
  // `colsPerTick`과 주기(열 합)의 최대공약수가 1이 아니면 일부 위상만 순환할 수 있음(보통 1 권장).
  // 마퀴 틱마다 밀 그리드 열 수 (도트 1칸 = 1열)
  colsPerTick: 1,
  // 마퀴 틱 간격(ms). 값이 작을수록 빠르게 흐름.
  intervalMs: 220,
  /** 스토어·`setInterval`과 동일 — 브라우저 타이머 하한에 맞춤 */
  intervalMsMin: 16,
  /** 가장 느린 틱(긴 간격) */
  intervalMsMax: 500,
  /**
   * 개발 패널 슬라이더(클수록 빠름). `interval = (min+max) - ui` 이므로
   * max=500일 때 틱 간격은 `intervalMsMin`(가장 빠름).
   */
  marqueeSpeedUiMin: 16,
  marqueeSpeedUiMax: 500,
}
