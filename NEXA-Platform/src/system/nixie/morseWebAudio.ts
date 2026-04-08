import type { MorseSoundEvent } from './morseTimeline'

/**
 * 모스 미리듣기(Web Audio)
 * - 타임라인을 오실레이터로 스케줄, `stopMorsePlayback` 시 대기 중인 `play` Promise 도 즉시 끝남.
 * - 재생 중: `setMorseMasterGainLinear` / `setMorseCarrierFrequencyHz` / `setMorseStereoPanValue` 로 볼륨·톤·L/R 라이브 반영.
 * - dit(리듬) 변경은 타임라인 재구성이 필요해 UI 쪽에서 재생 재시작으로 처리.
 * `MORSE_MASTER_GAIN_MAX`: 슬라이더 100% 환산 시 선형 게인 상한. 1 초과는 의도적 과증폭·연출 여지(클리핑 가능).
 * N-MAP(entropy·confidence 등) → 게인/톤/dit 자동 매핑은 닉시 본편에서 별 레이어로 둘 예정 — 현재는 스냅샷 값 + 수동 컨트롤만.
 */
export const MORSE_MASTER_GAIN_MAX = 1.2

let activeCtx: AudioContext | null = null
/** 브라우저 `setTimeout` 핸들(숫자) — Node `Timeout` 과 구분 */
let activeWaitTimer: number | null = null
let activePlayResolve: (() => void) | null = null
let activeMasterGain: GainNode | null = null
let activeStereoPanner: StereoPannerNode | null = null
const activeOscillators: OscillatorNode[] = []

function clearActiveAudioNodes(): void {
  activeMasterGain = null
  activeStereoPanner = null
  activeOscillators.length = 0
}

/** 재생 중 마스터 게인(선형 0~`MORSE_MASTER_GAIN_MAX`) — 슬라이더 놓을 때 반영 */
export function setMorseMasterGainLinear(linearGain: number): void {
  const g = Math.min(MORSE_MASTER_GAIN_MAX, Math.max(0, linearGain))
  const node = activeMasterGain
  const ctx = activeCtx
  if (!node || !ctx) return
  const t = ctx.currentTime
  node.gain.cancelScheduledValues(t)
  node.gain.setValueAtTime(g, t)
}

/** 재생 중 캐리어 주파수(Hz) — 예약된 톤 오실레이터에 즉시 반영 */
export function setMorseCarrierFrequencyHz(hz: number): void {
  const f = Math.max(50, Math.min(8000, hz))
  const ctx = activeCtx
  if (!ctx) return
  const t = ctx.currentTime
  for (const osc of activeOscillators) {
    try {
      osc.frequency.cancelScheduledValues(t)
      osc.frequency.setValueAtTime(f, t)
    } catch {
      /* noop */
    }
  }
}

/** 재생 중 스테레오 패닝 -1(왼쪽) ~ 1(오른쪽), 0=중앙 — 버튼 전환 시 즉시 반영 */
export function setMorseStereoPanValue(pan: number): void {
  const p = Math.max(-1, Math.min(1, pan))
  const node = activeStereoPanner
  const ctx = activeCtx
  if (!node || !ctx) return
  const t = ctx.currentTime
  node.pan.cancelScheduledValues(t)
  node.pan.setValueAtTime(p, t)
}

/** 진행 중 재생 중단(새 재생 전에도 호출됨) — `playMorseTimeline` 대기 Promise 도 즉시 완료 */
export function stopMorsePlayback(): void {
  if (activeWaitTimer !== null) {
    clearTimeout(activeWaitTimer)
    activeWaitTimer = null
  }
  clearActiveAudioNodes()
  if (activeCtx) {
    try {
      void activeCtx.close()
    } catch {
      /* noop */
    }
    activeCtx = null
  }
  if (activePlayResolve) {
    const r = activePlayResolve
    activePlayResolve = null
    r()
  }
}

export type PlayMorseOptions = {
  /** 캐리어 주파수(Hz) */
  frequencyHz: number
  /** 마스터 게인(선형) 0~`MORSE_MASTER_GAIN_MAX` — 호출부에서 볼륨% 환산 권장 */
  volume?: number
  /** `StereoPannerNode.pan` — -1=L, 0=중앙, 1=R */
  stereoPan?: number
}

/**
 * 모스 타임라인을 Web Audio API(사인파)로 재생.
 * 브라우저 정책상 사용자 클릭 등 제스처 이후 `AudioContext.resume()` 이 안전함.
 */
export async function playMorseTimeline(events: MorseSoundEvent[], options: PlayMorseOptions): Promise<void> {
  stopMorsePlayback()
  if (!events.length) return

  const ctx = new AudioContext()
  activeCtx = ctx
  await ctx.resume()

  const freq = Math.max(50, Math.min(8000, options.frequencyHz))
  const vol = Math.min(MORSE_MASTER_GAIN_MAX, Math.max(0, options.volume ?? 0.12))

  const master = ctx.createGain()
  master.gain.value = vol
  activeMasterGain = master

  const panValue = Math.max(-1, Math.min(1, options.stereoPan ?? 0))
  const panner = ctx.createStereoPanner()
  panner.pan.value = panValue
  master.connect(panner)
  panner.connect(ctx.destination)
  activeStereoPanner = panner

  let t = ctx.currentTime
  const fade = 0.004

  for (const e of events) {
    const durSec = e.ms / 1000
    if (e.kind === 'gap' || durSec <= 0) {
      t += durSec
      continue
    }

    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq
    const env = ctx.createGain()
    env.gain.value = 0
    osc.connect(env)
    env.connect(master)

    const attack = Math.min(fade, durSec / 4)
    const release = Math.min(fade, durSec / 4)
    env.gain.setValueAtTime(0, t)
    env.gain.linearRampToValueAtTime(1, t + attack)
    env.gain.setValueAtTime(1, t + durSec - release)
    env.gain.linearRampToValueAtTime(0, t + durSec)

    osc.start(t)
    osc.stop(t + durSec)
    activeOscillators.push(osc)
    t += durSec
  }

  const totalMs = events.reduce((s, ev) => s + ev.ms, 0)
  await new Promise<void>((resolve) => {
    activePlayResolve = resolve
    activeWaitTimer = window.setTimeout(() => {
      activeWaitTimer = null
      if (activeCtx === ctx) {
        clearActiveAudioNodes()
        try {
          void ctx.close()
        } catch {
          /* noop */
        }
        activeCtx = null
      }
      if (activePlayResolve) {
        const r = activePlayResolve
        activePlayResolve = null
        r()
      }
    }, totalMs + 100)
  })
}
