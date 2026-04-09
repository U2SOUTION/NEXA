import type { MorseSoundEvent } from './morseTimeline'
import type { NixieSoundLayerParams } from './nixieSoundLayerParams'
import type { UncannyNoiseBranch } from './nixieSoundLayerAudio'
import {
  applySpaceReverbParams,
  applyUncannyNoiseBranchParams,
  createUncannyNoiseBranch,
  detuneHalfSpreadCentsForLayer,
  filter01ToLowpassHz,
  jitterDetuneModCentsForLayer,
  jitterLfoHzForLayer,
  layerMechanicalBlend01,
  lowpassQForLayer,
  release01ToTremoloDepth,
  spaceReverbGainParams,
  stopUncannyNoiseBranch,
} from './nixieSoundLayerAudio'

/** 모스 재생 시 사운드 레이어 미지정이면 — 레거시 단일 사인에 가깝게(밝은 LP, 트레몰로·디튜닝·지터 없음) */
const DEFAULT_MORSE_SOUND_LAYERS: NixieSoundLayerParams = {
  filter01: 1,
  release01: 0,
  detune01: 0,
  jitter01: 0,
}

const MORSE_LAYER_PARAM_SMOOTH_SEC = 0.04

/** `playMorseTimeline` 옵션 — 재생 중 HUD 동기 등(정지 시 훅 타이머 전부 정리) */
export type MorsePlaybackHooks = {
  /** 각 이벤트(갭 포함) 시작 — `elapsedMs` 는 타임라인 누적 시작 시각(ms) */
  onEventStart?: (eventIndex: number, event: MorseSoundEvent, elapsedMs: number) => void
  /** 자연 종료 시 페이드 직후 `play` Promise resolve 직전 */
  onComplete?: () => void
  /** `stopMorsePlayback` 또는 새 재생 시작으로 중단 */
  onStopped?: () => void
}

/**
 * 모스 미리듣기(Web Audio)
 * - 타임라인을 오실레이터로 스케줄, `stopMorsePlayback` 시 대기 중인 `play` Promise 도 즉시 완료.
 * - 재생 시작: 마스터 게인 짧은 페이드인(무음→목표)으로 첫 재생 클릭 완화.
 * - 재생 중: `setMorseMasterGainLinear` / `setMorseCarrierFrequencyHz` / `setMorseStereoPanValue` 로 볼륨·톤·L/R 라이브 반영.
 * - 정지·자연 종료: 마스터 페이드아웃 후 `AudioContext` close — 즉시 끊김 팝 완화(`immediate` 는 페이드 생략).
 * - dit(리듬) 변경은 타임라인 재구성이 필요해 UI 쪽에서 재생 재시작으로 처리.
 * - `playbackHooks`: 이벤트 시작(`onEventStart`)은 `setTimeout`으로 벽시계 정렬 — `stopMorsePlayback` 시 훅 타이머 전부 정리. 자연 종료는 `onComplete`, 중단은 `onStopped`.
 * `MORSE_MASTER_GAIN_MAX`: 슬라이더 100% 환산 시 선형 게인 상한. 1 초과는 의도적 과증폭·연출 여지(클리핑 가능).
 * N-MAP(entropy·confidence 등) → 게인/톤/dit 자동 매핑은 닉시 본편에서 별 레이어로 둘 예정 — 현재는 스냅샷 값 + 수동 컨트롤만.
 */
export const MORSE_MASTER_GAIN_MAX = 1.2

/** L/R 전환 시 `pan` 점프로 나는 클릭 완화 — 선형 램프 길이(초) */
const MORSE_STEREO_PAN_RAMP_SEC = 0.035

/** 재생 시작 시 마스터 게인 0→목표 선형 램프 — `AudioContext`·그래프 기동 시 첫 클릭 완화 */
const MORSE_PLAY_FADE_IN_SEC = 0.045

/** 정지·타임라인 종료 시 마스터 게인→0 후 close — 팝 완화 */
const MORSE_PLAY_FADE_OUT_SEC = 0.045

let activeCtx: AudioContext | null = null
/** 브라우저 `setTimeout` 핸들(숫자) — Node `Timeout` 과 구분 */
let activeWaitTimer: number | null = null
let activePlayResolve: (() => void) | null = null
let activeMasterGain: GainNode | null = null
let activeStereoPanner: StereoPannerNode | null = null
let activeAnalyser: AnalyserNode | null = null
const activeOscillators: OscillatorNode[] = []

/** DSP 4축 — `playMorseTimeline` 세션 공유 노드 */
let activeMorseFilter: BiquadFilterNode | null = null
let activeMorseLayerTremLfo: OscillatorNode | null = null
let activeMorseLayerTremGain: GainNode | null = null
let activeMorseLayerJitterLfo: OscillatorNode | null = null
let activeMorseLayerJitterGain: GainNode | null = null

/** 공간감 — Delay+피드백(드라이/웻 분기) */
let activeMorseDryGain: GainNode | null = null
let activeMorseWetGain: GainNode | null = null
let activeMorseSpaceFeedback: GainNode | null = null
let activeMorseSpaceDelay: DelayNode | null = null

/** 이질감 전용 잡음 — LFO 변조 포함 */
let activeMorseUncannyNoise: UncannyNoiseBranch | null = null

/** 페이드아웃 후 `close` 예약 — 새 재생 `immediate` 시 취소 */
let pendingFadeCloseTimer: number | null = null

/** `onEventStart` 등 재생 훅용 `setTimeout` — 정지 시 전부 `clearTimeout` */
const activePlaybackHookTimers: number[] = []

/** 현재 `playMorseTimeline` 세션의 훅 — 자연 종료는 `onComplete`, 중단은 `onStopped` */
let activePlaybackHooks: MorsePlaybackHooks | null = null

/** 타임라인 진행률(0~1) — `AudioContext.currentTime` 기준, `clearActiveAudioNodes` 시 해제 */
let activePlaybackTimelineStartSec: number | null = null
let activePlaybackTotalSec: number | null = null

function clearPlaybackHookTimers(): void {
  for (const id of activePlaybackHookTimers) {
    clearTimeout(id)
  }
  activePlaybackHookTimers.length = 0
}

/** 재생 중단 시 훅 타이머 정리 + `onStopped` (자연 종료 경로에서는 호출하지 않음) */
function notifyPlaybackStopped(): void {
  const h = activePlaybackHooks
  activePlaybackHooks = null
  clearPlaybackHookTimers()
  h?.onStopped?.()
}

/** `activePlayResolve` 가 있을 때만 — 자연 종료가 아닌 중단 */
function resolvePlayPromiseIfPending(): void {
  if (!activePlayResolve) return
  const r = activePlayResolve
  activePlayResolve = null
  notifyPlaybackStopped()
  r()
}

function stopMorseLayerLfos(): void {
  for (const o of [activeMorseLayerTremLfo, activeMorseLayerJitterLfo]) {
    if (o) {
      try {
        o.stop()
      } catch {
        /* noop */
      }
      try {
        o.disconnect()
      } catch {
        /* noop */
      }
    }
  }
  activeMorseLayerTremLfo = null
  activeMorseLayerJitterLfo = null
  activeMorseLayerTremGain = null
  activeMorseLayerJitterGain = null
  activeMorseFilter = null
  activeMorseDryGain = null
  activeMorseWetGain = null
  activeMorseSpaceFeedback = null
  activeMorseSpaceDelay = null
  if (activeMorseUncannyNoise) {
    stopUncannyNoiseBranch(activeMorseUncannyNoise)
  }
  activeMorseUncannyNoise = null
}

function clearActiveAudioNodes(): void {
  stopMorseLayerLfos()
  activeMasterGain = null
  activeStereoPanner = null
  activeAnalyser = null
  activeOscillators.length = 0
  activePlaybackTimelineStartSec = null
  activePlaybackTotalSec = null
}

/** 기계성이 높을수록 닷 꼬리를 더 짧게(스타카토에 가깝게) */
function morseRelease01Effective(layers: NixieSoundLayerParams): number {
  const mech = layerMechanicalBlend01(layers)
  const r = layers.release01
  return Math.max(0, Math.min(1, r * (1 - 0.48 * mech)))
}

/** 이벤트 길이·RELEASE 축 → 엔벨로프 꼬리(초). 지속 트레몰로와 별개. */
function morseEnvelopeReleaseSec(durSec: number, release01: number): number {
  if (!Number.isFinite(durSec) || durSec <= 0) return 0.002
  const r = Math.max(0, Math.min(1, release01))
  const cap = Math.min(durSec * 0.45, 0.12)
  const floor = 0.002
  return floor + r * Math.max(cap - floor, 0)
}

/** 현재 모스 출력 파형 샘플을 0~255로 채움(없으면 false) */
export function readMorseScopeTimeDomain(target: Uint8Array): boolean {
  const analyser = activeAnalyser
  if (!analyser || !target?.length) return false
  const need = analyser.fftSize
  if (target.length < need) return false
  analyser.getByteTimeDomainData(target as Uint8Array<ArrayBuffer>)
  return true
}

/**
 * 재생 중 타임라인 진행률 0~1 (`AudioContext` 스케줄 기준).
 * 재생 없음·정지 직후에는 `null`.
 */
export function getMorsePlaybackProgress01(): number | null {
  const ctx = activeCtx
  if (!ctx || activePlaybackTimelineStartSec == null || activePlaybackTotalSec == null) return null
  const total = activePlaybackTotalSec
  if (total <= 0) return null
  const elapsed = ctx.currentTime - activePlaybackTimelineStartSec
  return Math.max(0, Math.min(1, elapsed / total))
}

function getAudioParamAt(param: AudioParam, time: number): number {
  const p = param as AudioParam & { getValueAtTime?(time: number): number }
  return typeof p.getValueAtTime === 'function' ? p.getValueAtTime(time) : p.value
}

/** 마스터 무음으로 램프 후 컨텍스트 종료(팝 완화). `afterClose`는 페이드 이후 한 번. */
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
  /** 이질감 잡음은 마스터 페이드와 무관하게 즉시 끊음(루프 버퍼·LFO가 남아 소리가 이어지는 것 방지) */
  if (activeMorseUncannyNoise) {
    stopUncannyNoiseBranch(activeMorseUncannyNoise)
    activeMorseUncannyNoise = null
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
  const f = Math.max(1, Math.min(12000, hz))
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

/** 재생 중 사운드 레이어 4축 — 필터·트레몰로·지터·듀얼 디튜닝(활성 오실에만) */
export function setMorseSoundLayerParams(layers: NixieSoundLayerParams): void {
  const ctx = activeCtx
  if (!ctx) return
  const t = ctx.currentTime
  const filter = activeMorseFilter
  const trem = activeMorseLayerTremGain
  const jit = activeMorseLayerJitterGain
  if (filter) {
    filter.type = 'lowpass'
    filter.frequency.setTargetAtTime(filter01ToLowpassHz(layers.filter01), t, MORSE_LAYER_PARAM_SMOOTH_SEC)
    filter.Q.setTargetAtTime(lowpassQForLayer(layers), t, MORSE_LAYER_PARAM_SMOOTH_SEC)
  }
  if (trem) {
    trem.gain.setTargetAtTime(release01ToTremoloDepth(layers.release01), t, MORSE_LAYER_PARAM_SMOOTH_SEC)
  }
  const jLfo = activeMorseLayerJitterLfo
  if (jLfo) {
    jLfo.frequency.setTargetAtTime(jitterLfoHzForLayer(layers), t, MORSE_LAYER_PARAM_SMOOTH_SEC)
  }
  if (jit) {
    jit.gain.setTargetAtTime(jitterDetuneModCentsForLayer(layers), t, MORSE_LAYER_PARAM_SMOOTH_SEC)
  }
  const dry = activeMorseDryGain
  const wet = activeMorseWetGain
  const fb = activeMorseSpaceFeedback
  const del = activeMorseSpaceDelay
  if (dry && wet && fb && del) {
    applySpaceReverbParams(dry, wet, fb, del, layers, t)
  }
  const uncannyNoise = activeMorseUncannyNoise
  if (uncannyNoise) {
    applyUncannyNoiseBranchParams(uncannyNoise, layers, t)
  }
  const half = detuneHalfSpreadCentsForLayer(layers)
  for (let i = 0; i < activeOscillators.length; i += 2) {
    const o1 = activeOscillators[i]
    const o2 = activeOscillators[i + 1]
    if (o1 && o2) {
      o1.detune.setTargetAtTime(half, t, MORSE_LAYER_PARAM_SMOOTH_SEC)
      o2.detune.setTargetAtTime(-half, t, MORSE_LAYER_PARAM_SMOOTH_SEC)
    }
  }
}

/** 재생 중 스테레오 패닝 -1(왼쪽) ~ 1(오른쪽), 0=중앙 — 짧은 선형 램프로 전환(클릭·팝 완화) */
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
  /** true: 페이드 없이 즉시 종료(새 재생 직전·dit 재시작·언마운트). false: 마스터 페이드아웃 후 close */
  immediate?: boolean
}

export type PlayMorseOptions = {
  /** 캐리어 주파수(Hz) */
  frequencyHz: number
  /** 마스터 게인(선형) 0~`MORSE_MASTER_GAIN_MAX` — 호출부에서 볼륨% 환산 권장 */
  volume?: number
  /** `StereoPannerNode.pan` — -1=L, 0=중앙, 1=R */
  stereoPan?: number
  /**
   * 사운드 레이어 DSP 4축(0~1). 생략 시 레거시 단일 사인에 가까운 기본값.
   * 필터·듀얼 detune·지터 LFO·릴리즈(트레몰로+닷 꼬리 길이).
   */
  soundLayers?: NixieSoundLayerParams
  /** 재생 진행 콜백 — 정지 시 훅용 타이머 전부 정리 */
  playbackHooks?: MorsePlaybackHooks
  /**
   * `stopMorsePlayback` 직후·`playbackHooks` 등록 직후, 오디오 컨텍스트 생성 전에 한 번.
   * 이전 세션 `onStopped`가 먼저 처리된 뒤이므로 Pinia `beginMorsePlaybackHudSync` 등은 여기서 호출.
   */
  onAfterPrepare?: () => void
}

/**
 * 진행 중 재생 중단 — `playMorseTimeline` 대기 Promise 는 즉시 완료.
 * 기본(`immediate: false`): 사용자 정지에 가깝게 페이드아웃 후 close.
 */
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

/**
 * 모스 타임라인을 Web Audio API(사인파)로 재생.
 * 브라우저 정책상 사용자 클릭 등 제스처 이후 `AudioContext.resume()` 이 안전함.
 */
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
  const layers = options.soundLayers ?? DEFAULT_MORSE_SOUND_LAYERS

  const master = ctx.createGain()
  const tFade = ctx.currentTime
  master.gain.setValueAtTime(0, tFade)
  master.gain.linearRampToValueAtTime(vol, tFade + MORSE_PLAY_FADE_IN_SEC)
  activeMasterGain = master

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(filter01ToLowpassHz(layers.filter01), tFade)
  filter.Q.setValueAtTime(lowpassQForLayer(layers), tFade)

  const postFilterGain = ctx.createGain()
  postFilterGain.gain.setValueAtTime(1, tFade)

  const srInit = spaceReverbGainParams(layers)
  const delayInputMerge = ctx.createGain()
  delayInputMerge.gain.setValueAtTime(1, tFade)
  const spaceDelay = ctx.createDelay(1)
  const feedbackGain = ctx.createGain()
  const dryGain = ctx.createGain()
  const wetGain = ctx.createGain()
  spaceDelay.delayTime.setValueAtTime(srInit.delaySec, tFade)
  feedbackGain.gain.setValueAtTime(srInit.feedback, tFade)
  dryGain.gain.setValueAtTime(srInit.dryLinear, tFade)
  wetGain.gain.setValueAtTime(srInit.wetLinear, tFade)
  postFilterGain.connect(delayInputMerge)
  feedbackGain.connect(delayInputMerge)
  delayInputMerge.connect(spaceDelay)
  spaceDelay.connect(wetGain)
  spaceDelay.connect(feedbackGain)
  postFilterGain.connect(dryGain)
  dryGain.connect(master)
  wetGain.connect(master)
  activeMorseDryGain = dryGain
  activeMorseWetGain = wetGain
  activeMorseSpaceFeedback = feedbackGain
  activeMorseSpaceDelay = spaceDelay

  const uncannyNoise = createUncannyNoiseBranch(ctx, layers, tFade)
  uncannyNoise.gain.connect(master)
  activeMorseUncannyNoise = uncannyNoise

  const tremLfo = ctx.createOscillator()
  tremLfo.type = 'sine'
  tremLfo.frequency.setValueAtTime(2.4, tFade)
  const tremGain = ctx.createGain()
  tremGain.gain.setValueAtTime(release01ToTremoloDepth(layers.release01), tFade)
  tremLfo.connect(tremGain)
  tremGain.connect(postFilterGain.gain)

  const jitterLfo = ctx.createOscillator()
  jitterLfo.type = 'sine'
  jitterLfo.frequency.setValueAtTime(jitterLfoHzForLayer(layers), tFade)
  const jitterGain = ctx.createGain()
  jitterGain.gain.setValueAtTime(jitterDetuneModCentsForLayer(layers), tFade)
  jitterLfo.connect(jitterGain)

  activeMorseFilter = filter
  activeMorseLayerTremLfo = tremLfo
  activeMorseLayerTremGain = tremGain
  activeMorseLayerJitterLfo = jitterLfo
  activeMorseLayerJitterGain = jitterGain

  filter.connect(postFilterGain)

  const panValue = Math.max(-1, Math.min(1, options.stereoPan ?? 0))
  const panner = ctx.createStereoPanner()
  panner.pan.value = panValue
  const analyser = ctx.createAnalyser()
  analyser.fftSize = 512
  analyser.smoothingTimeConstant = 0.72
  master.connect(analyser)
  analyser.connect(panner)
  panner.connect(ctx.destination)
  activeStereoPanner = panner
  activeAnalyser = analyser

  tremLfo.start(tFade)
  jitterLfo.start(tFade)
  uncannyNoise.gainLfo.start(tFade)
  uncannyNoise.fcLfo.start(tFade)
  uncannyNoise.src.start(tFade)

  const totalMs = events.reduce((s, ev) => s + ev.ms, 0)
  let t = ctx.currentTime
  activePlaybackTimelineStartSec = t
  activePlaybackTotalSec = Math.max(totalMs / 1000, 1e-6)

  const baseAttack = 0.004

  for (const e of events) {
    const durSec = e.ms / 1000
    if (e.kind === 'gap' || durSec <= 0) {
      t += durSec
      continue
    }

    const mech = layerMechanicalBlend01(layers)
    const oscType = mech >= 0.12 ? 'square' : 'sine'

    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    osc1.type = oscType
    osc2.type = oscType
    osc1.frequency.value = freq
    osc2.frequency.value = freq
    const half = detuneHalfSpreadCentsForLayer(layers)
    osc1.detune.setValueAtTime(half, t)
    osc2.detune.setValueAtTime(-half, t)
    jitterGain.connect(osc1.detune)
    jitterGain.connect(osc2.detune)

    const g1 = ctx.createGain()
    const g2 = ctx.createGain()
    g1.gain.setValueAtTime(0.5, t)
    g2.gain.setValueAtTime(0.5, t)

    const env = ctx.createGain()
    env.gain.value = 0
    osc1.connect(g1)
    osc2.connect(g2)
    g1.connect(env)
    g2.connect(env)
    env.connect(filter)

    const attack = Math.min(baseAttack, durSec / 4)
    let releaseSec = morseEnvelopeReleaseSec(durSec, morseRelease01Effective(layers))
    if (attack + releaseSec > durSec * 0.92) {
      releaseSec = Math.max(0.002, durSec * 0.92 - attack)
    }
    env.gain.setValueAtTime(0, t)
    env.gain.linearRampToValueAtTime(1, t + attack)
    env.gain.setValueAtTime(1, t + durSec - releaseSec)
    env.gain.linearRampToValueAtTime(0, t + durSec)

    osc1.start(t)
    osc2.start(t)
    osc1.stop(t + durSec)
    osc2.stop(t + durSec)
    activeOscillators.push(osc1, osc2)
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
