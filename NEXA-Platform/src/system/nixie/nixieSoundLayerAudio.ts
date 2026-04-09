/**
 * 닉시 사운드 레이어 — 단계 C·D: 모스와 **별도** `AudioContext`.
 * 단계 D: 필터(저역) · 릴리즈(트레몰로) · 디튜닝(듀얼 오실) · 지터(LFO→detune) 각각 `NixieSoundLayerParams` 축에 연결.
 */

import type { NixieSoundLayerParams } from './nixieSoundLayerParams'

/** 테스트 톤 캐리어(Hz) */
export const NIXIE_SOUND_LAYER_PROBE_CARRIER_HZ = 440

/** 출력 마스터 선형 게인(고정) — 축별 효과가 드러지도록 평균 볼륨 매핑은 쓰지 않음 */
export const NIXIE_SOUND_LAYER_PROBE_OUTPUT_LINEAR = 0.07

/** 저역 통과 주파수(Hz) 범위 — filter01=0 어둡게, 1 밝게 */
const FILTER_LP_MIN_HZ = 320
const FILTER_LP_MAX_HZ = 16000

/** 디튜닝: 두 오실레이터 사이 최대 스프레드(센트, 각각 ±절반) */
const DETUNE_SPREAD_MAX_CENTS = 65

/** 릴리즈: 트레몰로 LFO가 `postFilterGain.gain`에 더해지는 최대 진폭(±) */
const RELEASE_TREMOLO_DEPTH_MAX = 0.22

/** 지터: LFO가 detune에 더해지는 최대 깊이(센트) */
const JITTER_DETUNE_MOD_MAX_CENTS = 28

/** `mechanicalBlend01` — 디튜닝 스프레드 배율(0일 때 1배) */
const MECH_DETUNE_SPREAD_MUL = 1.2
/** 기계성 — 지터 LFO 깊이 배율 */
const MECH_JITTER_DEPTH_MUL = 1.05
/** `uncannyBlend01` — 듀얼 디튜닝 스프레드 추가(어긋난 간격) */
const UNCANNY_DETUNE_SPREAD_MUL = 0.58
/** 이질감 — 지터 LFO→detune 깊이 추가 */
const UNCANNY_JITTER_DEPTH_MUL = 0.72
/** 이질감 — 지터 LFO 속도 배율(불안정한 떨림) */
const UNCANNY_JITTER_LFO_MUL = 0.82
/** 이질감 — 저역통과 Q 소폭 상승(미세한 공진·날카로움) */
const UNCANNY_LP_Q_EXTRA = 1.55
/** 이질감 전용 잡음 — 하이패스 기준(Hz). LFO로 주변 스윕 */
const UNCANNY_NOISE_HPF_HZ = 2600
/** 이질감 잡음 마스터 선형 게인 상한(0~1 블렌드 × 이 값). 프로브 출력과 균형 */
const UNCANNY_NOISE_GAIN_MAX = 0.048
/** 잡음 레벨 LFO(Hz) — 서로 다른 속도로 “숨 쉬는” 느낌 */
const UNCANNY_NOISE_LFO_GAIN_HZ_BASE = 0.42
const UNCANNY_NOISE_LFO_FC_HZ_BASE = 0.11
/** 게인 오실 진폭(±, 선형) — `uncannyBlend` 에 비례해 깊이 상한 */
const UNCANNY_NOISE_GAIN_MOD_DEPTH_MAX = 0.028
/** 컷오프 LFO 진폭(Hz) — `uncannyBlend` 에 비례 */
const UNCANNY_NOISE_FC_MOD_DEPTH_HZ = 1050
/** 저역통과 Q: 기계성↑ 시 공진으로 육중·버즈 강조 */
const MECH_LP_Q_BASE = 0.85
const MECH_LP_Q_EXTRA_MAX = 5.2
/** 이 값 이상이면 프로브 시작 시 스퀘어 파형(사인 대비 기계음) */
const MECH_SQUARE_WAVE_THRESHOLD = 0.12

/** 공간감 — Delay+피드백 최대 지연(초), `DelayNode` 버퍼 상한 */
const SPACE_DELAY_MAX_SEC = 0.55

const TREMOLO_HZ = 2.4
const JITTER_LFO_HZ = 6.3

/** `setTargetAtTime` 시간 상수(초) */
const PARAM_SMOOTH_SEC = 0.04

function getAudioContextCtor(): (typeof AudioContext) | null {
  const g = globalThis as unknown as {
    AudioContext?: typeof AudioContext
    webkitAudioContext?: typeof AudioContext
  }
  return g.AudioContext ?? g.webkitAudioContext ?? null
}

function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0
  return Math.max(0, Math.min(1, x))
}

/** 단계 D — FILTER 축 → 저역 통과 절단 주파수 */
export function filter01ToLowpassHz(filter01: number): number {
  const t = clamp01(filter01)
  return FILTER_LP_MIN_HZ + t * (FILTER_LP_MAX_HZ - FILTER_LP_MIN_HZ)
}

/** 단계 D — RELEASE 축 → 트레몰로 깊이(게인 변조 진폭, 0~1 스케일) */
export function release01ToTremoloDepth(release01: number): number {
  return clamp01(release01) * RELEASE_TREMOLO_DEPTH_MAX
}

/** 단계 D — DETUNE 축 → 한쪽 오실레이터 detune(센트), 반대편은 부호 반대 */
export function detune01ToHalfSpreadCents(detune01: number): number {
  return clamp01(detune01) * (DETUNE_SPREAD_MAX_CENTS / 2)
}

/** 단계 D — JITTER 축 → LFO→detune 변조 깊이(센트) */
export function jitter01ToDetuneModCents(jitter01: number): number {
  return clamp01(jitter01) * JITTER_DETUNE_MOD_MAX_CENTS
}

/** 의미 기계성 블렌드 0~1 (레이어 파라미터에 있을 때만) */
export function layerMechanicalBlend01(layers: NixieSoundLayerParams): number {
  return clamp01(layers.mechanicalBlend01 ?? 0)
}

/** 디튜닝 반스프레드(센트) — 기계성·이질감 블렌드 시 스프레드 확대 */
export function detuneHalfSpreadCentsForLayer(layers: NixieSoundLayerParams): number {
  const mech = layerMechanicalBlend01(layers)
  const u = layerUncannyBlend01(layers)
  return (
    detune01ToHalfSpreadCents(layers.detune01) * (1 + MECH_DETUNE_SPREAD_MUL * mech) * (1 + UNCANNY_DETUNE_SPREAD_MUL * u)
  )
}

/** 지터 LFO → detune 변조(센트) — 기계성·이질감 시 더 거칠게 */
export function jitterDetuneModCentsForLayer(layers: NixieSoundLayerParams): number {
  const mech = layerMechanicalBlend01(layers)
  const u = layerUncannyBlend01(layers)
  return (
    jitter01ToDetuneModCents(layers.jitter01) *
    (1 + MECH_JITTER_DEPTH_MUL * mech) *
    (1 + UNCANNY_JITTER_DEPTH_MUL * u)
  )
}

/** 저역통과 Q — 기계성·이질감이 높을수록 날카로운 피크 */
export function lowpassQForLayer(layers: NixieSoundLayerParams): number {
  const mech = layerMechanicalBlend01(layers)
  const u = layerUncannyBlend01(layers)
  return MECH_LP_Q_BASE + mech * MECH_LP_Q_EXTRA_MAX + u * UNCANNY_LP_Q_EXTRA
}

/** 의미 공간감 블렌드 0~1 */
export function layerSpaceBlend01(layers: NixieSoundLayerParams): number {
  return clamp01(layers.spaceBlend01 ?? 0)
}

/** 의미 이질감 블렌드 0~1 */
export function layerUncannyBlend01(layers: NixieSoundLayerParams): number {
  return clamp01(layers.uncannyBlend01 ?? 0)
}

/** 지터 LFO 주파수(Hz) — 이질감↑ 시 더 빠른 피치 변조 */
export function jitterLfoHzForLayer(layers: NixieSoundLayerParams): number {
  const u = layerUncannyBlend01(layers)
  return JITTER_LFO_HZ * (1 + UNCANNY_JITTER_LFO_MUL * u)
}

/**
 * 이질감 전용 백색 잡음(하이패스) 선형 게인 — `uncannyBlend01` 만 반영(긴장 축과 무관).
 */
export function uncannyNoiseGainLinear(layers: NixieSoundLayerParams): number {
  return layerUncannyBlend01(layers) * UNCANNY_NOISE_GAIN_MAX
}

function createWhiteNoiseBuffer(ctx: AudioContext, durationSec: number): AudioBuffer {
  const sampleRate = ctx.sampleRate
  const length = Math.max(1, Math.floor(sampleRate * durationSec))
  const buf = ctx.createBuffer(1, length, sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < length; i++) d[i] = Math.random() * 2 - 1
  return buf
}

/** 루프 잡음 `AudioBufferSourceNode` 정지·분리 — 프로브·모스 정리용 */
export function stopUncannyNoiseBufferSource(s: AudioBufferSourceNode): void {
  try {
    s.stop()
  } catch {
    /* noop */
  }
  try {
    s.disconnect()
  } catch {
    /* noop */
  }
}

function uncannyNoiseGainLfoHz(u01: number): number {
  return UNCANNY_NOISE_LFO_GAIN_HZ_BASE * (1 + 0.42 * u01)
}

function uncannyNoiseFcLfoHz(u01: number): number {
  return UNCANNY_NOISE_LFO_FC_HZ_BASE * (1 + 0.38 * u01)
}

/** 이질감 잡음 — 루프 백색 + 하이패스 + LFO(레벨·컷오프 변조) */
export type UncannyNoiseBranch = {
  src: AudioBufferSourceNode
  hp: BiquadFilterNode
  gain: GainNode
  gainLfo: OscillatorNode
  gainModDepth: GainNode
  fcLfo: OscillatorNode
  fcModDepth: GainNode
}

/**
 * 이질감 전용 잡음 가지 — `gain` 을 마스터에 연결한 뒤 `gainLfo`·`fcLfo`·`src` 를 `t` 에서 `start`.
 */
export function createUncannyNoiseBranch(
  ctx: AudioContext,
  layers: NixieSoundLayerParams,
  t0: number,
): UncannyNoiseBranch {
  const u = layerUncannyBlend01(layers)
  const noiseBuf = createWhiteNoiseBuffer(ctx, 2)
  const src = ctx.createBufferSource()
  src.buffer = noiseBuf
  src.loop = true
  const hp = ctx.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.setValueAtTime(UNCANNY_NOISE_HPF_HZ, t0)
  hp.Q.setValueAtTime(0.707, t0)
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(uncannyNoiseGainLinear(layers), t0)

  const gainLfo = ctx.createOscillator()
  gainLfo.type = 'sine'
  gainLfo.frequency.setValueAtTime(uncannyNoiseGainLfoHz(u), t0)
  const gainModDepth = ctx.createGain()
  gainModDepth.gain.setValueAtTime(UNCANNY_NOISE_GAIN_MOD_DEPTH_MAX * u, t0)
  gainLfo.connect(gainModDepth)
  gainModDepth.connect(gain.gain)

  const fcLfo = ctx.createOscillator()
  fcLfo.type = 'sine'
  fcLfo.frequency.setValueAtTime(uncannyNoiseFcLfoHz(u), t0)
  const fcModDepth = ctx.createGain()
  fcModDepth.gain.setValueAtTime(UNCANNY_NOISE_FC_MOD_DEPTH_HZ * u, t0)
  fcLfo.connect(fcModDepth)
  fcModDepth.connect(hp.frequency)

  src.connect(hp)
  hp.connect(gain)

  return { src, hp, gain, gainLfo, gainModDepth, fcLfo, fcModDepth }
}

/** 재생 중 이질감 슬라이더·매핑 반영 — 잡음 평균 레벨·변조 깊이·LFO 속도 */
export function applyUncannyNoiseBranchParams(
  branch: UncannyNoiseBranch,
  layers: NixieSoundLayerParams,
  t: number,
): void {
  const u = layerUncannyBlend01(layers)
  branch.gain.gain.setTargetAtTime(uncannyNoiseGainLinear(layers), t, PARAM_SMOOTH_SEC)
  branch.gainModDepth.gain.setTargetAtTime(UNCANNY_NOISE_GAIN_MOD_DEPTH_MAX * u, t, PARAM_SMOOTH_SEC)
  branch.fcModDepth.gain.setTargetAtTime(UNCANNY_NOISE_FC_MOD_DEPTH_HZ * u, t, PARAM_SMOOTH_SEC)
  branch.gainLfo.frequency.setTargetAtTime(uncannyNoiseGainLfoHz(u), t, PARAM_SMOOTH_SEC)
  branch.fcLfo.frequency.setTargetAtTime(uncannyNoiseFcLfoHz(u), t, PARAM_SMOOTH_SEC)
}

/**
 * 공간감(리버브 느낌) — Delay 시간·피드백·드라이/웻.
 * `spaceBlend01` 이 클수록 지연·반사·웻이 커진다.
 */
export function spaceReverbGainParams(layers: NixieSoundLayerParams): {
  delaySec: number
  feedback: number
  dryLinear: number
  wetLinear: number
} {
  const s = layerSpaceBlend01(layers)
  return {
    delaySec: 0.028 + s * SPACE_DELAY_MAX_SEC,
    feedback: Math.min(0.72, 0.06 + s * 0.7),
    dryLinear: Math.max(0.15, 1 - s * 0.68),
    wetLinear: 0.12 + s * 0.72,
  }
}

/** 프로브·모스 공통 — Delay+피드백 게인·지연 갱신 */
export function applySpaceReverbParams(
  dryGain: GainNode,
  wetGain: GainNode,
  feedbackGain: GainNode,
  delay: DelayNode,
  layers: NixieSoundLayerParams,
  t: number,
): void {
  const p = spaceReverbGainParams(layers)
  const d = Math.max(0.001, Math.min(SPACE_DELAY_MAX_SEC + 0.05, p.delaySec))
  delay.delayTime.setTargetAtTime(d, t, PARAM_SMOOTH_SEC)
  feedbackGain.gain.setTargetAtTime(p.feedback, t, PARAM_SMOOTH_SEC)
  dryGain.gain.setTargetAtTime(p.dryLinear, t, PARAM_SMOOTH_SEC)
  wetGain.gain.setTargetAtTime(p.wetLinear, t, PARAM_SMOOTH_SEC)
}

type ProbeGraph = {
  ctx: AudioContext
  master: GainNode
  osc1: OscillatorNode
  osc2: OscillatorNode
  g1: GainNode
  g2: GainNode
  filter: BiquadFilterNode
  postFilterGain: GainNode
  dryGain: GainNode
  wetGain: GainNode
  feedbackGain: GainNode
  delayInputMerge: GainNode
  spaceDelay: DelayNode
  tremLfo: OscillatorNode
  tremGain: GainNode
  jitterLfo: OscillatorNode
  jitterGain: GainNode
  uncannyNoise: UncannyNoiseBranch
}

let probeGraph: ProbeGraph | null = null

export function isNixieSoundLayerProbeRunning(): boolean {
  return probeGraph != null
}

function applyLayerParams(g: ProbeGraph, layers: NixieSoundLayerParams): void {
  const ctx = g.ctx
  const t = ctx.currentTime

  g.filter.type = 'lowpass'
  g.filter.frequency.setTargetAtTime(filter01ToLowpassHz(layers.filter01), t, PARAM_SMOOTH_SEC)
  g.filter.Q.setTargetAtTime(lowpassQForLayer(layers), t, PARAM_SMOOTH_SEC)

  const half = detuneHalfSpreadCentsForLayer(layers)
  g.osc1.detune.setTargetAtTime(half, t, PARAM_SMOOTH_SEC)
  g.osc2.detune.setTargetAtTime(-half, t, PARAM_SMOOTH_SEC)

  g.tremGain.gain.setTargetAtTime(release01ToTremoloDepth(layers.release01), t, PARAM_SMOOTH_SEC)
  g.jitterLfo.frequency.setTargetAtTime(jitterLfoHzForLayer(layers), t, PARAM_SMOOTH_SEC)
  g.jitterGain.gain.setTargetAtTime(jitterDetuneModCentsForLayer(layers), t, PARAM_SMOOTH_SEC)

  applySpaceReverbParams(g.dryGain, g.wetGain, g.feedbackGain, g.spaceDelay, layers, t)

  applyUncannyNoiseBranchParams(g.uncannyNoise, layers, t)

  g.master.gain.setTargetAtTime(NIXIE_SOUND_LAYER_PROBE_OUTPUT_LINEAR, t, PARAM_SMOOTH_SEC)
}

/**
 * 테스트 사인 파이프 시작. 브라우저 정책상 사용자 제스처(토글 클릭 등) 직후 호출 권장.
 *
 * 그래프: … → 마스터; 이질감 전용 하이패스 백색 잡음 → 마스터(텐션과 별도 질감).
 */
export async function startNixieSoundLayerProbe(layers: NixieSoundLayerParams): Promise<void> {
  stopNixieSoundLayerProbe()
  const Ctor = getAudioContextCtor()
  if (!Ctor) return

  const ctx = new Ctor()
  const t0 = ctx.currentTime
  await ctx.resume()

  const carrier = NIXIE_SOUND_LAYER_PROBE_CARRIER_HZ

  const mechBlend = layerMechanicalBlend01(layers)
  const oscType = mechBlend >= MECH_SQUARE_WAVE_THRESHOLD ? 'square' : 'sine'

  const osc1 = ctx.createOscillator()
  const osc2 = ctx.createOscillator()
  osc1.type = oscType
  osc2.type = oscType
  osc1.frequency.setValueAtTime(carrier, t0)
  osc2.frequency.setValueAtTime(carrier, t0)

  const g1 = ctx.createGain()
  const g2 = ctx.createGain()
  g1.gain.setValueAtTime(0.5, t0)
  g2.gain.setValueAtTime(0.5, t0)

  const filter = ctx.createBiquadFilter()
  const postFilterGain = ctx.createGain()
  postFilterGain.gain.setValueAtTime(1, t0)

  const sr = spaceReverbGainParams(layers)
  const delayInputMerge = ctx.createGain()
  delayInputMerge.gain.setValueAtTime(1, t0)
  const spaceDelay = ctx.createDelay(1)
  const feedbackGain = ctx.createGain()
  const dryGain = ctx.createGain()
  const wetGain = ctx.createGain()
  spaceDelay.delayTime.setValueAtTime(sr.delaySec, t0)
  feedbackGain.gain.setValueAtTime(sr.feedback, t0)
  dryGain.gain.setValueAtTime(sr.dryLinear, t0)
  wetGain.gain.setValueAtTime(sr.wetLinear, t0)

  postFilterGain.connect(delayInputMerge)
  feedbackGain.connect(delayInputMerge)
  delayInputMerge.connect(spaceDelay)
  spaceDelay.connect(wetGain)
  spaceDelay.connect(feedbackGain)
  postFilterGain.connect(dryGain)

  const tremLfo = ctx.createOscillator()
  tremLfo.type = 'sine'
  tremLfo.frequency.setValueAtTime(TREMOLO_HZ, t0)
  const tremGain = ctx.createGain()
  tremGain.gain.setValueAtTime(release01ToTremoloDepth(layers.release01), t0)
  tremLfo.connect(tremGain)
  tremGain.connect(postFilterGain.gain)

  const jitterLfo = ctx.createOscillator()
  jitterLfo.type = 'sine'
  jitterLfo.frequency.setValueAtTime(jitterLfoHzForLayer(layers), t0)
  const jitterGain = ctx.createGain()
  jitterGain.gain.setValueAtTime(jitterDetuneModCentsForLayer(layers), t0)
  jitterLfo.connect(jitterGain)
  jitterGain.connect(osc1.detune)
  jitterGain.connect(osc2.detune)

  const master = ctx.createGain()
  master.gain.setValueAtTime(NIXIE_SOUND_LAYER_PROBE_OUTPUT_LINEAR, t0)

  const uncannyNoise = createUncannyNoiseBranch(ctx, layers, t0)
  uncannyNoise.gain.connect(master)

  osc1.connect(g1)
  osc2.connect(g2)
  g1.connect(filter)
  g2.connect(filter)
  filter.connect(postFilterGain)
  dryGain.connect(master)
  wetGain.connect(master)
  master.connect(ctx.destination)

  const graph: ProbeGraph = {
    ctx,
    master,
    osc1,
    osc2,
    g1,
    g2,
    filter,
    postFilterGain,
    dryGain,
    wetGain,
    feedbackGain,
    delayInputMerge,
    spaceDelay,
    tremLfo,
    tremGain,
    jitterLfo,
    jitterGain,
    uncannyNoise,
  }
  probeGraph = graph

  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(filter01ToLowpassHz(layers.filter01), t0)
  filter.Q.setValueAtTime(lowpassQForLayer(layers), t0)

  const half = detuneHalfSpreadCentsForLayer(layers)
  osc1.detune.setValueAtTime(half, t0)
  osc2.detune.setValueAtTime(-half, t0)

  osc1.start(t0)
  osc2.start(t0)
  tremLfo.start(t0)
  jitterLfo.start(t0)
  uncannyNoise.gainLfo.start(t0)
  uncannyNoise.fcLfo.start(t0)
  uncannyNoise.src.start(t0)
}

/** 슬라이더 반영 — 파이프가 살아 있을 때만 */
export function updateNixieSoundLayerProbeGain(layers: NixieSoundLayerParams): void {
  const g = probeGraph
  if (!g) return
  applyLayerParams(g, layers)
}

function stopOscSafe(o: OscillatorNode): void {
  try {
    o.stop()
  } catch {
    // 이미 stop 된 경우 등
  }
  o.disconnect()
}

/** 이질감 잡음 LFO·버퍼 정지 — 마스터에서 먼저 분리해 페이드 대기 중에도 잡음이 새지 않게 함 */
export function stopUncannyNoiseBranch(b: UncannyNoiseBranch): void {
  try {
    b.gain.disconnect()
  } catch {
    /* noop */
  }
  try {
    b.gainModDepth.disconnect()
  } catch {
    /* noop */
  }
  try {
    b.fcModDepth.disconnect()
  } catch {
    /* noop */
  }
  stopOscSafe(b.gainLfo)
  stopOscSafe(b.fcLfo)
  stopUncannyNoiseBufferSource(b.src)
}

/** 모든 노드 정리 후 컨텍스트 종료 */
export function stopNixieSoundLayerProbe(): void {
  const g = probeGraph
  probeGraph = null
  if (!g) return

  stopOscSafe(g.osc1)
  stopOscSafe(g.osc2)
  stopOscSafe(g.tremLfo)
  stopOscSafe(g.jitterLfo)
  stopUncannyNoiseBranch(g.uncannyNoise)

  try {
    g.g1.disconnect()
    g.g2.disconnect()
    g.filter.disconnect()
    g.postFilterGain.disconnect()
    g.dryGain.disconnect()
    g.wetGain.disconnect()
    g.feedbackGain.disconnect()
    g.delayInputMerge.disconnect()
    g.spaceDelay.disconnect()
    g.tremGain.disconnect()
    g.jitterGain.disconnect()
    g.uncannyNoise.gainModDepth.disconnect()
    g.uncannyNoise.fcModDepth.disconnect()
    g.uncannyNoise.hp.disconnect()
    g.uncannyNoise.gain.disconnect()
    g.master.disconnect()
  } catch {
    // 일부 브라우저/상태에서 무시
  }

  void g.ctx.close()
}
