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

type ProbeGraph = {
  ctx: AudioContext
  master: GainNode
  osc1: OscillatorNode
  osc2: OscillatorNode
  g1: GainNode
  g2: GainNode
  filter: BiquadFilterNode
  postFilterGain: GainNode
  tremLfo: OscillatorNode
  tremGain: GainNode
  jitterLfo: OscillatorNode
  jitterGain: GainNode
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
  g.filter.Q.setValueAtTime(0.85, t)

  const half = detune01ToHalfSpreadCents(layers.detune01)
  g.osc1.detune.setTargetAtTime(half, t, PARAM_SMOOTH_SEC)
  g.osc2.detune.setTargetAtTime(-half, t, PARAM_SMOOTH_SEC)

  g.tremGain.gain.setTargetAtTime(release01ToTremoloDepth(layers.release01), t, PARAM_SMOOTH_SEC)
  g.jitterGain.gain.setTargetAtTime(jitter01ToDetuneModCents(layers.jitter01), t, PARAM_SMOOTH_SEC)

  g.master.gain.setTargetAtTime(NIXIE_SOUND_LAYER_PROBE_OUTPUT_LINEAR, t, PARAM_SMOOTH_SEC)
}

/**
 * 테스트 사인 파이프 시작. 브라우저 정책상 사용자 제스처(토글 클릭 등) 직후 호출 권장.
 *
 * 그래프: osc1/osc2(±detune, 지터 LFO) → 합성 → 저역통과 → 트레몰로(릴리즈) → 마스터 → 출력
 */
export async function startNixieSoundLayerProbe(layers: NixieSoundLayerParams): Promise<void> {
  stopNixieSoundLayerProbe()
  const Ctor = getAudioContextCtor()
  if (!Ctor) return

  const ctx = new Ctor()
  const t0 = ctx.currentTime
  await ctx.resume()

  const carrier = NIXIE_SOUND_LAYER_PROBE_CARRIER_HZ

  const osc1 = ctx.createOscillator()
  const osc2 = ctx.createOscillator()
  osc1.type = 'sine'
  osc2.type = 'sine'
  osc1.frequency.setValueAtTime(carrier, t0)
  osc2.frequency.setValueAtTime(carrier, t0)

  const g1 = ctx.createGain()
  const g2 = ctx.createGain()
  g1.gain.setValueAtTime(0.5, t0)
  g2.gain.setValueAtTime(0.5, t0)

  const filter = ctx.createBiquadFilter()
  const postFilterGain = ctx.createGain()
  postFilterGain.gain.setValueAtTime(1, t0)

  const tremLfo = ctx.createOscillator()
  tremLfo.type = 'sine'
  tremLfo.frequency.setValueAtTime(TREMOLO_HZ, t0)
  const tremGain = ctx.createGain()
  tremGain.gain.setValueAtTime(release01ToTremoloDepth(layers.release01), t0)
  tremLfo.connect(tremGain)
  tremGain.connect(postFilterGain.gain)

  const jitterLfo = ctx.createOscillator()
  jitterLfo.type = 'sine'
  jitterLfo.frequency.setValueAtTime(JITTER_LFO_HZ, t0)
  const jitterGain = ctx.createGain()
  jitterGain.gain.setValueAtTime(jitter01ToDetuneModCents(layers.jitter01), t0)
  jitterLfo.connect(jitterGain)
  jitterGain.connect(osc1.detune)
  jitterGain.connect(osc2.detune)

  const master = ctx.createGain()
  master.gain.setValueAtTime(NIXIE_SOUND_LAYER_PROBE_OUTPUT_LINEAR, t0)

  osc1.connect(g1)
  osc2.connect(g2)
  g1.connect(filter)
  g2.connect(filter)
  filter.connect(postFilterGain)
  postFilterGain.connect(master)
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
    tremLfo,
    tremGain,
    jitterLfo,
    jitterGain,
  }
  probeGraph = graph

  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(filter01ToLowpassHz(layers.filter01), t0)
  filter.Q.setValueAtTime(0.85, t0)

  const half = detune01ToHalfSpreadCents(layers.detune01)
  osc1.detune.setValueAtTime(half, t0)
  osc2.detune.setValueAtTime(-half, t0)

  osc1.start(t0)
  osc2.start(t0)
  tremLfo.start(t0)
  jitterLfo.start(t0)
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

/** 모든 노드 정리 후 컨텍스트 종료 */
export function stopNixieSoundLayerProbe(): void {
  const g = probeGraph
  probeGraph = null
  if (!g) return

  stopOscSafe(g.osc1)
  stopOscSafe(g.osc2)
  stopOscSafe(g.tremLfo)
  stopOscSafe(g.jitterLfo)

  try {
    g.g1.disconnect()
    g.g2.disconnect()
    g.filter.disconnect()
    g.postFilterGain.disconnect()
    g.tremGain.disconnect()
    g.jitterGain.disconnect()
    g.master.disconnect()
  } catch {
    // 일부 브라우저/상태에서 무시
  }

  void g.ctx.close()
}
