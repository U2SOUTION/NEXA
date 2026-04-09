import type { MorseSoundEvent } from './morseTimeline'
import type { NixieSoundLayerParams } from './nixieSoundLayerParams'
import {
  applySpaceReverbParams,
  applyUncannyNoiseBranchParams,
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
/** 슬라이더·AI 볼륨 조절 시 순간 점프 완화 */
const MORSE_MASTER_GAIN_SMOOTH_SEC = 0.035
/** 라이브 캐리어 Hz 변경 시 지퍼/팝 완화 (`setTargetAtTime` 시간 상수) */
const MORSE_CARRIER_FREQ_SMOOTH_SEC = 0.028
/** 사인/스퀘어 최소 어택 — 저역·스퀘어 하모닉이 급격히 들어올 때 틱 완화 */
const MORSE_ENV_ATTACK_MIN_SINE_SEC = 0.008
const MORSE_ENV_ATTACK_MIN_SQUARE_SEC = 0.0135
/** 노트 끝 엔벨로프 0 이후 오실 정지 지연 — 정지 순간 변조/샘플 경계 틱 완화 */
const MORSE_OSC_STOP_PAD_SEC = 0.012
/** 신규 바이쿼드 저역이 첫 샘플에서 튀는 것 완화 */
const MORSE_FILTER_OPEN_SEC = 0.022
/** DC·서브 저역으로 인한 경계 틱 완화 (보이스당 1개) */
const MORSE_VOICE_HPF_HZ = 32
/** 트레몰로·불협 보조 진입 시 변조 점프 완화 */
const MORSE_MOD_FADE_IN_SEC = 0.0045
/** 릴리즈 직전부터 트레몰로·지터·불협 믹스를 끔 — 저레벨 AM/비트가 “가죽 스침”처럼 들리는 현상 완화 */
const MORSE_MOD_RELEASE_SMOOTH_SEC = 0.018

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
/** `setMorseSoundLayerParams` → 공간 딜레이·웻/드라이 즉시 반영 */
type MorseSpaceRefs = {
  dryGain: GainNode
  wetGain: GainNode
  feedbackGain: GainNode
  spaceDelay: DelayNode
}
let activeMorseSpace: MorseSpaceRefs | null = null
/** `setTimeout` 체인 — 정지 시 전부 취소 */
const activeScheduleTimeouts: number[] = []
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
  activeMorseSpace = null
  for (const id of activeScheduleTimeouts) clearTimeout(id)
  activeScheduleTimeouts.length = 0
}

function pow01(u: number, p: number): number {
  const x = Math.max(0, Math.min(1, u))
  return Math.pow(x, p)
}

/** 기계성이 높을수록 닷 꼬리를 더 짧게 — morseWebAudioDsp 와 동일 */
function morseRelease01Effective(layers: NixieSoundLayerParams): number {
  const mech = layerMechanicalBlend01(layers)
  const r = layers.release01
  return Math.max(0, Math.min(1, r * (1 - 0.48 * mech)))
}

/** 이벤트 길이·RELEASE 축 → 엔벨로프 꼬리(초). 짧은 토큰에서 어택+릴리즈 겹침 방지 */
function morseEnvelopeReleaseSec(durSec: number, release01: number): number {
  if (!Number.isFinite(durSec) || durSec <= 0) return 0.002
  const r = Math.max(0, Math.min(1, release01))
  const cap = Math.min(durSec * 0.45, 0.12)
  const floor = 0.002
  return floor + r * Math.max(cap - floor, 0)
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

/** 다음 점/대시부터 적용 — AI·슬라이더가 `setMorseSoundLayerParams`로 갱신 */
let lastMorseLiveLayers: NixieSoundLayerParams = mergeMorseLayers()

function applyLiveMorseFromLayers(layers: NixieSoundLayerParams): void {
  const L = mergeMorseLayers(layers)
  const ctx = activeCtx
  if (!ctx) return
  const t = ctx.currentTime
  activeHarmonyRatio = harmonyIntervalRatioForLayer(L)
  if (activeMorseSpace) {
    applySpaceReverbParams(
      activeMorseSpace.dryGain,
      activeMorseSpace.wetGain,
      activeMorseSpace.feedbackGain,
      activeMorseSpace.spaceDelay,
      L,
      t,
    )
  }
  if (activeUncannyNoise) {
    applyUncannyNoiseBranchParams(activeUncannyNoise, L, t)
  }
}

function enqueueMorseSchedule(fn: () => void, delayMs: number): void {
  const handle = window.setTimeout(() => {
    const ix = activeScheduleTimeouts.indexOf(handle)
    if (ix >= 0) activeScheduleTimeouts.splice(ix, 1)
    fn()
  }, delayMs)
  activeScheduleTimeouts.push(handle)
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
  for (const id of activeScheduleTimeouts) clearTimeout(id)
  activeScheduleTimeouts.length = 0
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
  const cur = getAudioParamAt(node.gain, t)
  node.gain.cancelScheduledValues(t)
  node.gain.setValueAtTime(cur, t)
  node.gain.setTargetAtTime(g, t, MORSE_MASTER_GAIN_SMOOTH_SEC)
}

export function setMorseCarrierFrequencyHz(hz: number): void {
  const f = Math.max(1, Math.min(12000, hz))
  const ctx = activeCtx
  if (!ctx) return
  const t = ctx.currentTime
  const hr = activeHarmonyRatio
  for (const pair of activeCarrierPairs) {
    try {
      const o1 = pair.osc1.frequency
      const o2 = pair.osc2.frequency
      const c1 = getAudioParamAt(o1, t)
      const c2 = getAudioParamAt(o2, t)
      o1.cancelScheduledValues(t)
      o2.cancelScheduledValues(t)
      o1.setValueAtTime(c1, t)
      o2.setValueAtTime(c2, t)
      o1.setTargetAtTime(f, t, MORSE_CARRIER_FREQ_SMOOTH_SEC)
      o2.setTargetAtTime(f * hr, t, MORSE_CARRIER_FREQ_SMOOTH_SEC)
    } catch {
      /* noop */
    }
  }
}

/** 재생 중 레이어 갱신 — 공간·이질 잡음·하모니 비율 즉시 반영, 다음 점/대시 보이스는 최신 `lastMorseLiveLayers` 사용. */
export function setMorseSoundLayerParams(layers: NixieSoundLayerParams): void {
  lastMorseLiveLayers = mergeMorseLayers(layers)
  applyLiveMorseFromLayers(lastMorseLiveLayers)
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
  const panWobbleRaw = Number(options.panWobbleDepth01)
  const panWobbleD = Number.isFinite(panWobbleRaw) ? Math.max(0, Math.min(1, panWobbleRaw)) : 0
  lastMorseLiveLayers = mergeMorseLayers(options.soundLayers)
  const layers = lastMorseLiveLayers
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

  activeMorseSpace = {
    dryGain,
    wetGain,
    feedbackGain,
    spaceDelay,
  }

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

  const baseAttack = 0.004
  /** `setTimeout` 드리프트와 `ctx.currentTime` 불일치로 인한 노트 겹침·경계 팝 방지 */
  let nextMorseAudioTimeSec = tFade + 0.028

  function buildVoiceAtTime(ev: MorseSoundEvent, audioT: number): void {
    const L = mergeMorseLayers(lastMorseLiveLayers)
    const hr = harmonyIntervalRatioForLayer(L)
    activeHarmonyRatio = hr
    /** `options.uncanniness01` 은 재생 시작 시 한 번만 읽히면 `Math.max(레이어, 옵션)` 에서 옵션이 고정되어 UNCANNY 내림이 다음 재생까지 막힘 — 레이어 SSOT (`setMorseSoundLayerParams`). */
    const uBlend = layerUncannyBlend01(L)
    const durSec = ev.ms / 1000
    if (durSec <= 0) return

    const mechBlend = layerMechanicalBlend01(L)
    const oscType = mechBlend >= MECH_SQUARE_WAVE_THRESHOLD ? 'square' : 'sine'
    const halfCents = detuneHalfSpreadCentsForLayer(L)
    const jitterDepth = jitterDetuneModCentsForLayer(L)
    const jitterLfoHz = jitterLfoHzForLayer(L)
    const tremDepth = release01ToTremoloDepth(L.release01)
    const tremHz = tremoloHzForLayer(L)

    const minAtk =
      oscType === 'square' ? MORSE_ENV_ATTACK_MIN_SQUARE_SEC : MORSE_ENV_ATTACK_MIN_SINE_SEC
    let attack = Math.max(minAtk, Math.min(baseAttack, durSec / 4))
    let releaseSec = morseEnvelopeReleaseSec(durSec, morseRelease01Effective(L))
    if (attack + releaseSec > durSec * 0.92) {
      releaseSec = Math.max(0.002, durSec * 0.92 - attack)
    }
    const sustainSpan = durSec - releaseSec
    const maxAtkForSustain =
      sustainSpan > 0.0025
        ? Math.max(0.0012, sustainSpan - 0.00025)
        : Math.max(0.00035, sustainSpan * 0.48)
    attack = Math.min(attack, maxAtkForSustain)
    const tSustainEnd = audioT + durSec - releaseSec
    const tNoteEnd = audioT + durSec
    const tStop = audioT + durSec + MORSE_OSC_STOP_PAD_SEC

    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    osc1.type = oscType
    osc2.type = oscType
    osc1.frequency.setValueAtTime(freq, audioT)
    osc2.frequency.setValueAtTime(freq * hr, audioT)
    osc1.detune.setValueAtTime(halfCents, audioT)
    osc2.detune.setValueAtTime(-halfCents, audioT)

    const g1 = ctx.createGain()
    const g2 = ctx.createGain()
    g1.gain.setValueAtTime(0.5, audioT)
    g2.gain.setValueAtTime(0.5, audioT)

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    const fLpTarget = filter01ToLowpassHz(L.filter01)
    const fLpOpen = Math.max(120, Math.min(fLpTarget * 0.38, 2200))
    filter.frequency.setValueAtTime(fLpOpen, audioT)
    filter.frequency.exponentialRampToValueAtTime(Math.max(40, fLpTarget), audioT + MORSE_FILTER_OPEN_SEC)
    filter.Q.setValueAtTime(lowpassQForLayer(L), audioT)

    const postFilterGain = ctx.createGain()
    postFilterGain.gain.setValueAtTime(1, audioT)

    const tremLfo = ctx.createOscillator()
    tremLfo.type = 'sine'
    tremLfo.frequency.setValueAtTime(tremHz, audioT)
    const tremGain = ctx.createGain()
    if (tremDepth > 1e-5) {
      tremGain.gain.setValueAtTime(0, audioT)
      tremGain.gain.linearRampToValueAtTime(tremDepth, audioT + MORSE_MOD_FADE_IN_SEC)
      tremGain.gain.setTargetAtTime(0, tSustainEnd, MORSE_MOD_RELEASE_SMOOTH_SEC)
    } else {
      tremGain.gain.setValueAtTime(0, audioT)
    }
    tremLfo.connect(tremGain)
    tremGain.connect(postFilterGain.gain)

    const jitterLfo = ctx.createOscillator()
    jitterLfo.type = 'sine'
    jitterLfo.frequency.setValueAtTime(jitterLfoHz, audioT)
    const jitterGain = ctx.createGain()
    if (jitterDepth > 1e-5) {
      jitterGain.gain.setValueAtTime(0, audioT)
      jitterGain.gain.linearRampToValueAtTime(jitterDepth, audioT + MORSE_MOD_FADE_IN_SEC)
      jitterGain.gain.setTargetAtTime(0, tSustainEnd, MORSE_MOD_RELEASE_SMOOTH_SEC)
    } else {
      jitterGain.gain.setValueAtTime(0, audioT)
    }
    jitterLfo.connect(jitterGain)
    jitterGain.connect(osc1.detune)
    jitterGain.connect(osc2.detune)

    osc1.connect(g1)
    osc2.connect(g2)
    g1.connect(filter)
    g2.connect(filter)
    filter.connect(postFilterGain)

    const dissMix = uBlend > 1e-4 ? MORSE_UNCANNY_DISSONANCE_MAX_MIX * pow01(uBlend, 1.08) : 0
    if (dissMix > 1e-4) {
      const offsetHz = (Math.random() * 2 - 1) * MORSE_UNCANNY_OFFSET_HZ_MAX * pow01(uBlend, 1.12)
      const oscD = ctx.createOscillator()
      oscD.type = 'sine'
      oscD.frequency.setValueAtTime(Math.max(20, Math.min(12000, freq + offsetHz)), audioT)
      const dissPre = ctx.createGain()
      dissPre.gain.setValueAtTime(0, audioT)
      dissPre.gain.linearRampToValueAtTime(dissMix, audioT + MORSE_MOD_FADE_IN_SEC)
      dissPre.gain.setTargetAtTime(0, tSustainEnd, MORSE_MOD_RELEASE_SMOOTH_SEC)
      oscD.connect(dissPre)
      dissPre.connect(postFilterGain)
      oscD.start(audioT)
      oscD.stop(audioT + durSec + MORSE_OSC_STOP_PAD_SEC)
    }

    /** HPF를 엔벨로프 뒤에 두면 입력이 0이 된 뒤에도 IIR 상태가 잠깐 출력 → 끝 툭·잡음. 선형 env가 마지막에 곱해져 버스로는 정확히 0. */
    const voiceHpf = ctx.createBiquadFilter()
    voiceHpf.type = 'highpass'
    voiceHpf.frequency.setValueAtTime(MORSE_VOICE_HPF_HZ, audioT)
    voiceHpf.Q.setValueAtTime(0.707, audioT)
    postFilterGain.connect(voiceHpf)
    const env = ctx.createGain()
    env.gain.value = 0
    voiceHpf.connect(env)
    env.connect(eventSum)

    env.gain.setValueAtTime(0.0001, audioT)
    env.gain.exponentialRampToValueAtTime(1, audioT + attack)
    env.gain.setValueAtTime(1, tSustainEnd)
    /** 지수+선형 이중 꼬리는 끝에서 “겹쳐 잡아당김” 같은 질감으로 들릴 수 있어 단일 선형 릴리즈 */
    env.gain.linearRampToValueAtTime(0, tNoteEnd)

    osc1.start(audioT)
    osc2.start(audioT)
    tremLfo.start(audioT)
    jitterLfo.start(audioT)
    osc1.stop(tStop)
    osc2.stop(tStop)
    tremLfo.stop(tStop)
    jitterLfo.stop(tStop)

    activeCarrierPairs.length = 0
    activeCarrierPairs.push({ osc1, osc2 })
  }

  function scheduleFromIndex(i: number): void {
    if (i >= events.length) return
    const ev = events[i]!
    if (ev.kind === 'gap' || ev.ms <= 0) {
      nextMorseAudioTimeSec += ev.ms / 1000
      enqueueMorseSchedule(() => scheduleFromIndex(i + 1), ev.ms)
      return
    }
    const durSec = ev.ms / 1000
    enqueueMorseSchedule(() => {
      if (activeCtx !== ctx) return
      const t0 = Math.max(ctx.currentTime, nextMorseAudioTimeSec)
      buildVoiceAtTime(ev, t0)
      nextMorseAudioTimeSec = t0 + durSec
      enqueueMorseSchedule(() => scheduleFromIndex(i + 1), ev.ms)
    }, 0)
  }

  scheduleFromIndex(0)

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
