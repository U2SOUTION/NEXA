import type { MorseSoundEvent } from './morseTimeline'

let activeCtx: AudioContext | null = null
/** 브라우저 `setTimeout` 핸들(숫자) — Node `Timeout` 과 구분 */
let activeWaitTimer: number | null = null
let activePlayResolve: (() => void) | null = null

/** 진행 중 재생 중단(새 재생 전에도 호출됨) — `playMorseTimeline` 대기 Promise 도 즉시 완료 */
export function stopMorsePlayback(): void {
  if (activeWaitTimer !== null) {
    clearTimeout(activeWaitTimer)
    activeWaitTimer = null
  }
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
  /** 마스터 게인(선형) 0~0.35 — 호출부에서 볼륨% 환산 권장 */
  volume?: number
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
  const vol = Math.min(0.35, Math.max(0, options.volume ?? 0.12))

  const master = ctx.createGain()
  master.gain.value = vol
  master.connect(ctx.destination)

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
    t += durSec
  }

  const totalMs = events.reduce((s, ev) => s + ev.ms, 0)
  await new Promise<void>((resolve) => {
    activePlayResolve = resolve
    activeWaitTimer = window.setTimeout(() => {
      activeWaitTimer = null
      if (activeCtx === ctx) {
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
