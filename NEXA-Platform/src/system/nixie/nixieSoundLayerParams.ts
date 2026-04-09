/**
 * 닉시 사운드 레이어 4축 — UI(0~100) → 정규화 파라미터(0~1).
 * 오디오·이벤트 쪽은 이 객체만 받도록 맞춘다(단계 B).
 */

/** 개발 패널 슬라이더 원시 값 (0~100) */
export type NixieSoundLayerUi0to100 = {
  filter: number
  release: number
  detune: number
  jitter: number
}

/** 매핑·메시지·Web Audio 입력용 (0~1) */
export type NixieSoundLayerParams = {
  filter01: number
  release01: number
  detune01: number
  jitter01: number
}

function clampUi100(n: number): number {
  const x = Number(n)
  if (!Number.isFinite(x)) return 0
  return Math.max(0, Math.min(100, x))
}

/**
 * 슬라이더 네 값을 한 객체로 정규화한다.
 * 이후 모듈은 `NixieSoundLayerParams`만 의존하면 된다.
 */
export function getNixieSoundLayers(ui: NixieSoundLayerUi0to100): NixieSoundLayerParams {
  return {
    filter01: clampUi100(ui.filter) / 100,
    release01: clampUi100(ui.release) / 100,
    detune01: clampUi100(ui.detune) / 100,
    jitter01: clampUi100(ui.jitter) / 100,
  }
}
