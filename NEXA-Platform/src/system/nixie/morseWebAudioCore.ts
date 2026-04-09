import type { MorseSoundEvent } from './morseTimeline'
import type { NixieSoundLayerParams } from './nixieSoundLayerParams'
import {
  createUncannyNoiseBranch,
  filter01ToLowpassHz,
  harmonyIntervalRatioForLayer,
  jitterDetuneModCentsForLayer,
  jitterLfoHzForLayer,
  layerMechanicalBlend01,
  layerUncannyBlend01,
  lowpassQForLayer,
  NIXIE_SPACE_WET_LP_HZ,
  NIXIE_SPACE_WET_LP_Q,
  release01ToTremoloDepth,
  spaceReverbGainParams,
  stopUncannyNoiseBranch,
  tremoloHzForLayer,
  detuneHalfSpreadCentsForLayer,
  type UncannyNoiseBranch,
} from './nixieSoundLayerAudio'

export type MorsePlaybackHooks = {
  onEventStart?: (eventIndex: number, event: MorseSoundEvent, elapsedMs: number) => void
  onComplete?: () => void
  onStopped?: () => void
}

export const MORSE_MASTER_GAIN_MAX = 1.2

/** UNCANNY: 보조 사인 레이어 최대 믹스(메인 엔벨로프 1 대비, 이벤트마다 난수 Hz 오프셋) */
const MORSE_UNCANNY_DISSONANCE_MAX_MIX = 0.38
/** UNCANNY: 난수 오프셋 상한(Hz) — `uncanniness01`에 의해 스케일 */
const MORSE_UNCANNY_OFFSET_HZ_MAX = 92

const MORSE_STEREO_PAN_RAMP_SEC = 0.035
const MORSE_PLAY_FADE_IN_SEC = 0.045
const MORSE_PLAY_FADE_OUT_SEC = 0.045

/** 프로브와 동일 — 이 값 이상이면 스퀘어 파형 */
const MECH_SQUARE_WAVE_THRESHOLD = 0.12

let activeCtx: AudioContext | null = null
let activeWaitTimer: number | null = null
let activePlayResolve: (() => void) | null = null
let activeMasterGain: GainNode | null = null
let activeStereoPanner: StereoPannerNode | null = null
let activeAnalyser: AnalyserNode | null = null
/** 캐리어 라이브 반영용 — (기준 Hz, 둘째는 × harmonyRatio) */
const activeCarrierPairs: { osc1: OscillatorNode; osc2: OscillatorNode }[] = []
let activeHarmonyRatio = 1
let activeUncannyNoise: UncannyNoiseBranch | null = null
let activePanWobbleOsc: OscillatorNode | null = null
const activePlaybackHookTimers: number[] = []
let activePlaybackHooks: MorsePlaybackHooks | null = null
let activePlaybackTimelineStartSec: number | null = null
let activePlaybackTotalSec: number | null = null
let pendingFadeCloseTimer: number | null = null

function clearPlaybackHookTimers(): void {
  for (const id of activePlaybackHookTimers) clearTimeout(id)
  activePlaybackHookTimers.length = 0
}

function notifyPlaybackStopped(): void {
  const h = activePlaybackHooks
  activePlaybackHooks = null
  clearPlaybackHookTimers()
  h?.onStopped?.()
}

function resolvePlayPromiseIfPending(): void {
  if (!activePlayResolve) return
  const r = activePlayResolve
  activePlayResolve = null
  notifyPlaybackStopped()
  r()
}

function clearActiveAudioNodes(): void {
  activeMasterGain = null
  activeStereoPanner = null
  activeAnalyser = null
  activeCarrierPairs.length = 0
  activeHarmonyRatio = 1
  if (activeUncannyNoise) {
    stopUncannyNoiseBranch(activeUncannyNoise)
    activeUncannyNoise = null
  }
  if (activePanWobbleOsc) {
    try {
      activePanWobbleOsc.stop()
    } catch {
      /* noop */
    }
    activePanWobbleOsc = null
  }
  activePlaybackTimelineStartSec = null
  activePlaybackTotalSec = null
}

function pow01(u: number, p: number): number {
  const x = Math.max(0, Math.min(1, u))
  return Math.pow(x, p)
}

function mergeMorseLayers(layers?: NixieSoundLayerParams): NixieSoundLayerParams {
  return {
    filter01: layers?.filter01 ?? 0,
    release01: layers?.release01 ?? 0,
    detune01: layers?.detune01 ?? 0,
    jitter01: layers?.jitter01 ?? 0,
    mechanicalBlend01: layers?.mechanicalBlend01,
    spaceBlend01: layers?.spaceBlend01,
    uncannyBlend01: layers?.uncannyBlend01,
    vitalityBlend01: layers?.vitalityBlend01,
    harmonyBlend01: layers?.harmonyBlend01,
  }
}


function getAudioParamAt(param: AudioParam, time: number): number {
  const p = param as AudioParam & { getValueAtTime?(time: number): number }
  return typeof p.getValueAtTime === 'function' ? p.getValueAtTime(time) : p.value
}

function scheduleFadeOutClose(ctx: AudioContext, afterClose?: () => void): void {
  if (pendingFadeCloseTimer !== null) {
    clearTimeout(pendingFadeCloseTimer)
    pendingFadeCloseTimer = null
  }
  const master = activeMasterGain
  if (!master || activeCtx !== ctx) {
    clearActiveAudioNodes()
    try {
      void ctx.close()
    } catch {
      /* noop */
    }
    if (activeCtx === ctx) activeCtx = null
    afterClose?.()
    return
  }
  const t = ctx.currentTime
  const cur = getAudioParamAt(master.gain, t)
  master.gain.cancelScheduledValues(t)
  master.gain.setValueAtTime(cur, t)
  master.gain.linearRampToValueAtTime(0, t + MORSE_PLAY_FADE_OUT_SEC)
  pendingFadeCloseTimer = window.setTimeout(() => {
    pendingFadeCloseTimer = null
    if (activeCtx !== ctx) {
      afterClose?.()
      return
    }
    clearActiveAudioNodes()
    try {
      void ctx.close()
    } catch {
      /* noop */
    }
    activeCtx = null
    afterClose?.()
  }, MORSE_PLAY_FADE_OUT_SEC * 1000 + 35)
}

function stopMorsePlaybackImmediate(): void {
  if (pendingFadeCloseTimer !== null) {
    clearTimeout(pendingFadeCloseTimer)
    pendingFadeCloseTimer = null
  }
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
  resolvePlayPromiseIfPending()
}

export function readMorseScopeTimeDomain(target: Uint8Array): boolean {
  const analyser = activeAnalyser
  if (!analyser || !target?.length) return false
  const need = analyser.fftSize
  if (target.length < need) return false
  analyser.getByteTimeDomainData(target as Uint8Array<ArrayBuffer>)
  return true
}

export function getMorsePlaybackProgress01(): number | null {
  const ctx = activeCtx
  if (!ctx || activePlaybackTimelineStartSec == null || activePlaybackTotalSec == null) return null
  const total = activePlaybackTotalSec
  if (total <= 0) return null
  const elapsed = ctx.currentTime - activePlaybackTimelineStartSec
  return Math.max(0, Math.min(1, elapsed / total))
}

export function setMorseMasterGainLinear(linearGain: number): void {
  const g = Math.min(MORSE_MASTER_GAIN_MAX, Math.max(0, linearGain))
  const node = activeMasterGain
  const ctx = activeCtx
  if (!node || !ctx) return
  const t = ctx.currentTime
  node.gain.cancelScheduledValues(t)
  node.gain.setValueAtTime(g, t)
}

export function setMorseCarrierFrequencyHz(hz: number): void {
  const f = Math.max(1, Math.min(12000, hz))
  const ctx = activeCtx
  if (!ctx) return
  const t = ctx.currentTime
  const hr = activeHarmonyRatio
  for (const pair of activeCarrierPairs) {
    try {
      pair.osc1.frequency.cancelScheduledValues(t)
      pair.osc1.frequency.setValueAtTime(f, t)
      pair.osc2.frequency.cancelScheduledValues(t)
      pair.osc2.frequency.setValueAtTime(f * hr, t)
    } catch {
      /* noop */
    }
  }
}

/** 재생 중 슬라이더 갱신 훅(향후 라이브 그래프 갱신). 현재 재생은 `playMorseTimeline`의 `soundLayers` 스냅샷으로만 그래프를 만든다. */
export function setMorseSoundLayerParams(layers: NixieSoundLayerParams): void {
  void mergeMorseLayers(layers)
}

export function setMorseStereoPanValue(pan: number): void {
  const target = Math.max(-1, Math.min(1, pan))
  const node = activeStereoPanner
  const ctx = activeCtx
  if (!node || !ctx) return
  const t = ctx.currentTime
  const panParam = node.pan as AudioParam & { getValueAtTime?(time: number): number }
  const current =
    typeof panParam.getValueAtTime === 'function' ? panParam.getValueAtTime(t) : panParam.value
  if (Math.abs(current - target) < 1e-5) {
    node.pan.cancelScheduledValues(t)
    node.pan.setValueAtTime(target, t)
    return
  }
  node.pan.cancelScheduledValues(t)
  node.pan.setValueAtTime(current, t)
  node.pan.linearRampToValueAtTime(target, t + MORSE_STEREO_PAN_RAMP_SEC)
}

export type StopMorsePlaybackOptions = {
  immediate?: boolean
}

export type PlayMorseOptions = {
  frequencyHz: number
  volume?: number
  stereoPan?: number
  /** 의미 축 UNCANNY 0~1 — 0이면 보조 불협 레이어 없음 */
  uncanniness01?: number
  /** 표 B — 스테레오 미세 흔들림 깊이 0~1 */
  panWobbleDepth01?: number
  soundLayers?: NixieSoundLayerParams
  playbackHooks?: MorsePlaybackHooks
  onAfterPrepare?: () => void
}

export function stopMorsePlayback(options?: StopMorsePlaybackOptions): void {
  const immediate = options?.immediate ?? false
  if (activeWaitTimer !== null) {
    clearTimeout(activeWaitTimer)
    activeWaitTimer = null
  }
  resolvePlayPromiseIfPending()
  const ctx = activeCtx
  if (!ctx) return
  if (immediate) {
    stopMorsePlaybackImmediate()
    return
  }
  if (!activeMasterGain) {
    stopMorsePlaybackImmediate()
    return
  }
  scheduleFadeOutClose(ctx)
}

export async function playMorseTimeline(events: MorseSoundEvent[], options: PlayMorseOptions): Promise<void> {
  stopMorsePlayback({ immediate: true })
  if (!events.length) return

  activePlaybackHooks = options.playbackHooks ?? null
  options.onAfterPrepare?.()

  const ctx = new AudioContext()
  activeCtx = ctx
  await ctx.resume()

  const freq = Math.max(1, Math.min(12000, options.frequencyHz))
  const vol = Math.min(MORSE_MASTER_GAIN_MAX, Math.max(0, options.volume ?? 0.12))
  const uncannyRaw = Number(options.uncanniness01)
  const uncannyU = Number.isFinite(uncannyRaw) ? Math.max(0, Math.min(1, uncannyRaw)) : 0
  const panWobbleRaw = Number(options.panWobbleDepth01)
  const panWobbleD = Number.isFinite(panWobbleRaw) ? Math.max(0, Math.min(1, panWobbleRaw)) : 0

  const layers = mergeMorseLayers(options.soundLayers)
  activeHarmonyRatio = harmonyIntervalRatioForLayer(layers)

  const totalMs = events.reduce((s, ev) => s + ev.ms, 0)
  const tFade = ctx.currentTime
  activePlaybackTimelineStartSec = tFade
  activePlaybackTotalSec = Math.max(totalMs / 1000, 1e-6)

  const eventSum = ctx.createGain()
  eventSum.gain.setValueAtTime(1, tFade)

  if (layerUncannyBlend01(layers) > 1e-4) {
    const unc = createUncannyNoiseBranch(ctx, layers, tFade)
    unc.gain.connect(eventSum)
    unc.src.start(tFade)
    unc.gainLfo.start(tFade)
    unc.fcLfo.start(tFade)
    activeUncannyNoise = unc
  }

  const sr = spaceReverbGainParams(layers)
  const delayInputMerge = ctx.createGain()
  delayInputMerge.gain.setValueAtTime(1, tFade)
  const spaceDelay = ctx.createDelay(1)
  const spaceWetLp = ctx.createBiquadFilter()
  spaceWetLp.type = 'lowpass'
  spaceWetLp.frequency.setValueAtTime(NIXIE_SPACE_WET_LP_HZ, tFade)
  spaceWetLp.Q.setValueAtTime(NIXIE_SPACE_WET_LP_Q, tFade)
  const feedbackGain = ctx.createGain()
  const dryGain = ctx.createGain()
  const wetGain = ctx.createGain()
  spaceDelay.delayTime.setValueAtTime(sr.delaySec, tFade)
  feedbackGain.gain.setValueAtTime(sr.feedback, tFade)
  dryGain.gain.setValueAtTime(sr.dryLinear, tFade)
  wetGain.gain.setValueAtTime(sr.wetLinear, tFade)

  eventSum.connect(delayInputMerge)
  feedbackGain.connect(delayInputMerge)
  delayInputMerge.connect(spaceDelay)
  spaceDelay.connect(spaceWetLp)
  spaceWetLp.connect(wetGain)
  spaceWetLp.connect(feedbackGain)
  eventSum.connect(dryGain)

  const master = ctx.createGain()
  master.gain.setValueAtTime(0, tFade)
  master.gain.linearRampToValueAtTime(vol, tFade + MORSE_PLAY_FADE_IN_SEC)
  activeMasterGain = master

  dryGain.connect(master)
  wetGain.connect(master)

  const panValue = Math.max(-1, Math.min(1, options.stereoPan ?? 0))
  const panner = ctx.createStereoPanner()
  panner.pan.setValueAtTime(panValue, tFade)

  if (panWobbleD > 1e-4) {
    const panLfo = ctx.createOscillator()
    panLfo.type = 'sine'
    panLfo.frequency.setValueAtTime(5.2 + 2.8 * pow01(panWobbleD, 1.1), tFade)
    const panDepth = ctx.createGain()
    panDepth.gain.setValueAtTime(panWobbleD * 0.42, tFade)
    panLfo.connect(panDepth)
    panDepth.connect(panner.pan)
    panLfo.start(tFade)
    activePanWobbleOsc = panLfo
  }

  const analyser = ctx.createAnalyser()
  analyser.fftSize = 512
  analyser.smoothingTimeConstant = 0.72
  master.connect(analyser)
  analyser.connect(panner)
  panner.connect(ctx.destination)
  activeStereoPanner = panner
  activeAnalyser = analyser

  const mechBlend = layerMechanicalBlend01(layers)
  const oscType = mechBlend >= MECH_SQUARE_WAVE_THRESHOLD ? 'square' : 'sine'
  const halfCents = detuneHalfSpreadCentsForLayer(layers)
  const jitterDepth = jitterDetuneModCentsForLayer(layers)
  const jitterLfoHz = jitterLfoHzForLayer(layers)
  const tremDepth = release01ToTremoloDepth(layers.release01)
  const tremHz = tremoloHzForLayer(layers)

  let t = tFade
  const baseAttack = 0.004
  for (const e of events) {
    const durSec = e.ms / 1000
    if (e.kind === 'gap' || durSec <= 0) {
      t += durSec
      continue
    }

    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    osc1.type = oscType
    osc2.type = oscType
    osc1.frequency.setValueAtTime(freq, t)
    osc2.frequency.setValueAtTime(freq * activeHarmonyRatio, t)
    osc1.detune.setValueAtTime(halfCents, t)
    osc2.detune.setValueAtTime(-halfCents, t)

    const g1 = ctx.createGain()
    const g2 = ctx.createGain()
    g1.gain.setValueAtTime(0.5, t)
    g2.gain.setValueAtTime(0.5, t)

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(filter01ToLowpassHz(layers.filter01), t)
    filter.Q.setValueAtTime(lowpassQForLayer(layers), t)

    const postFilterGain = ctx.createGain()
    postFilterGain.gain.setValueAtTime(1, t)

    const tremLfo = ctx.createOscillator()
    tremLfo.type = 'sine'
    tremLfo.frequency.setValueAtTime(tremHz, t)
    const tremGain = ctx.createGain()
    tremGain.gain.setValueAtTime(tremDepth, t)
    tremLfo.connect(tremGain)
    tremGain.connect(postFilterGain.gain)

    const jitterLfo = ctx.createOscillator()
    jitterLfo.type = 'sine'
    jitterLfo.frequency.setValueAtTime(jitterLfoHz, t)
    const jitterGain = ctx.createGain()
    jitterGain.gain.setValueAtTime(jitterDepth, t)
    jitterLfo.connect(jitterGain)
    jitterGain.connect(osc1.detune)
    jitterGain.connect(osc2.detune)

    osc1.connect(g1)
    osc2.connect(g2)
    g1.connect(filter)
    g2.connect(filter)
    filter.connect(postFilterGain)

    const dissMix = uncannyU > 1e-4 ? MORSE_UNCANNY_DISSONANCE_MAX_MIX * pow01(uncannyU, 1.08) : 0
    if (dissMix > 1e-4) {
      const offsetHz = (Math.random() * 2 - 1) * MORSE_UNCANNY_OFFSET_HZ_MAX * pow01(uncannyU, 1.12)
      const oscD = ctx.createOscillator()
      oscD.type = 'sine'
      oscD.frequency.setValueAtTime(Math.max(20, Math.min(12000, freq + offsetHz)), t)
      const dissPre = ctx.createGain()
      dissPre.gain.setValueAtTime(dissMix, t)
      oscD.connect(dissPre)
      dissPre.connect(postFilterGain)
      oscD.start(t)
      oscD.stop(t + durSec)
    }

    const env = ctx.createGain()
    env.gain.value = 0
    postFilterGain.connect(env)
    env.connect(eventSum)

    const attack = Math.min(baseAttack, durSec / 4)
    const releaseSec = Math.min(Math.max(0.002, durSec * 0.25), 0.04)
    env.gain.setValueAtTime(0, t)
    env.gain.linearRampToValueAtTime(1, t + attack)
    env.gain.setValueAtTime(1, t + durSec - releaseSec)
    env.gain.linearRampToValueAtTime(0, t + durSec)

    osc1.start(t)
    osc2.start(t)
    tremLfo.start(t)
    jitterLfo.start(t)
    osc1.stop(t + durSec)
    osc2.stop(t + durSec)
    tremLfo.stop(t + durSec)
    jitterLfo.stop(t + durSec)

    activeCarrierPairs.push({ osc1, osc2 })

    t += durSec
  }

  const hooks = options.playbackHooks
  let elapsedSchedule = 0
  for (let i = 0; i < events.length; i++) {
    const ev = events[i]!
    const startMs = elapsedSchedule
    if (hooks?.onEventStart) {
      const delay = Math.max(0, Math.round(startMs))
      const id = window.setTimeout(() => {
        hooks.onEventStart!(i, ev, startMs)
      }, delay)
      activePlaybackHookTimers.push(id)
    }
    elapsedSchedule += ev.ms
  }

  await new Promise<void>((resolve) => {
    activePlayResolve = resolve
    activeWaitTimer = window.setTimeout(() => {
      activeWaitTimer = null
      if (activeCtx !== ctx) {
        resolvePlayPromiseIfPending()
        return
      }
      scheduleFadeOutClose(ctx, () => {
        const h = activePlaybackHooks
        activePlaybackHooks = null
        clearPlaybackHookTimers()
        h?.onComplete?.()
        if (activePlayResolve) {
          const r = activePlayResolve
          activePlayResolve = null
          r()
        }
      })
    }, totalMs + 100)
  })
}
