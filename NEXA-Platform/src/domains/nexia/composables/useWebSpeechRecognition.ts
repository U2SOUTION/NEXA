import { ref, computed, onBeforeUnmount, type Ref } from 'vue'
import { matchesVoiceClearCommand, parseVoiceClearPhraseList } from '../utils/voiceClearCommand'

interface SpeechRecCtor {
  new (): {
    lang: string
    interimResults: boolean
    continuous: boolean
    maxAlternatives: number
    onresult: ((ev: SpeechResultLike) => void) | null
    onerror: ((ev: { error?: string }) => void) | null
    onend: (() => void) | null
    start: () => void
    stop: () => void
  }
}

/** SpeechRecognition 이벤트 최소 형태 */
interface SpeechResultLike {
  results: Array<{ 0: { transcript: string }; isFinal: boolean; length: number }>
}

function getSpeechRecognitionCtor(): SpeechRecCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { SpeechRecognition?: SpeechRecCtor; webkitSpeechRecognition?: SpeechRecCtor }
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

/** 음성으로 인식된 구간만 검사 (타이핑 경로와 무관) */
function extractSpokenSegment(prefix: string, full: string): string {
  if (!full.startsWith(prefix)) return full.trim()
  if (full.length <= prefix.length) return ''
  return full.slice(prefix.length).replace(/^\s+/, '').trim()
}

function concatResults(ev: SpeechResultLike): string {
  let segment = ''
  for (let i = 0; i < ev.results.length; i++) {
    segment += ev.results[i][0].transcript
  }
  return segment
}

function defaultVoiceClearOptions(): { phrases: string[]; delayMs: number } {
  return {
    phrases: parseVoiceClearPhraseList(undefined),
    delayMs: 0,
  }
}

/**
 * 브라우저 Web Speech API(음성 → 텍스트).
 * interim + continuous: 말하는 동안 입력란에 실시간 반영, 중지 버튼까지 인식 유지.
 *
 * @param getVoiceClearOptions 트리거 문구·지연(ms) — useNexiaSettings 등과 연동 (설정 UI에서 편집 예정)
 */
export function useWebSpeechRecognition(options?: {
  lang?: string
  getVoiceClearOptions?: () => { phrases: string[]; delayMs: number }
}) {
  const lang = options?.lang ?? 'ko-KR'
  const getVoiceClearOptions = options?.getVoiceClearOptions
  const isListening = ref(false)
  const lastError = ref<string | null>(null)

  const isSupported = computed(() => !!getSpeechRecognitionCtor())

  let recognition: InstanceType<SpeechRecCtor> | null = null
  /** 세션 시작 시점의 입력값(이후 음성 구간은 여기에 이어 붙임) */
  let sessionPrefix = ''
  let dictationTarget: Ref<string> | null = null
  let voiceCancelCb: (() => void) | undefined
  let pendingVoiceCancelTimer: ReturnType<typeof setTimeout> | null = null

  function clearPendingVoiceCancelTimer() {
    if (pendingVoiceCancelTimer != null) {
      clearTimeout(pendingVoiceCancelTimer)
      pendingVoiceCancelTimer = null
    }
  }

  function scheduleVoiceClearCancel(run: () => void) {
    clearPendingVoiceCancelTimer()
    const opts = getVoiceClearOptions?.() ?? defaultVoiceClearOptions()
    const delayMs = Math.max(0, Math.min(10000, Number(opts.delayMs) || 0))
    if (delayMs <= 0) {
      run()
      return
    }
    pendingVoiceCancelTimer = setTimeout(() => {
      pendingVoiceCancelTimer = null
      run()
    }, delayMs)
  }

  function dispose() {
    if (recognition) {
      try {
        recognition.onresult = null
        recognition.onerror = null
        recognition.onend = null
        recognition.stop()
      } catch {
        /* ignore */
      }
      recognition = null
    }
    isListening.value = false
    dictationTarget = null
    voiceCancelCb = undefined
    clearPendingVoiceCancelTimer()
  }

  function applyLiveTranscript(target: Ref<string>, event: SpeechResultLike) {
    let segment = ''
    for (let i = 0; i < event.results.length; i++) {
      segment += event.results[i][0].transcript
    }
    const p = sessionPrefix
    const needSpace = p.length > 0 && segment.length > 0 && !/\s$/.test(p)
    target.value = p + (needSpace ? ' ' : '') + segment
  }

  /**
   * 음성 입력 세션 시작. 중지 버튼(stop) 또는 인식 종료 시까지 continuous.
   * @param onVoiceCancelConversation 음성으로 '취소'만 인식된 경우(타이핑 제외) 호출 — 대화 비우기 등
   */
  function startDictation(target: Ref<string>, onEnd?: () => void, onVoiceCancelConversation?: () => void) {
    lastError.value = null
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) {
      lastError.value = 'unsupported'
      return
    }
    dispose()
    sessionPrefix = target.value
    dictationTarget = target
    voiceCancelCb = onVoiceCancelConversation
    recognition = new Ctor()
    recognition.lang = lang
    recognition.interimResults = true
    recognition.continuous = true
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      const ev = event as SpeechResultLike
      const n = ev.results.length
      const segment = concatResults(ev)
      const opts = getVoiceClearOptions?.() ?? defaultVoiceClearOptions()
      if (pendingVoiceCancelTimer && !matchesVoiceClearCommand(segment, opts.phrases)) {
        clearPendingVoiceCancelTimer()
      }
      if (n > 0 && onVoiceCancelConversation && ev.results[n - 1]?.isFinal) {
        if (matchesVoiceClearCommand(segment, opts.phrases)) {
          const cb = voiceCancelCb
          if (cb) {
            voiceCancelCb = undefined
            target.value = sessionPrefix
            scheduleVoiceClearCancel(() => {
              cb()
            })
          }
          try {
            recognition?.stop()
          } catch {
            /* ignore */
          }
          return
        }
      }
      applyLiveTranscript(target, ev)
    }

    recognition.onerror = (event) => {
      lastError.value = event.error || 'unknown'
      isListening.value = false
    }

    recognition.onend = () => {
      isListening.value = false
      onEnd?.()
    }

    try {
      recognition.start()
      isListening.value = true
    } catch {
      lastError.value = 'start_failed'
      isListening.value = false
    }
  }

  /** @param onRecognitionEnded 인식 세션이 완전히 끝난 뒤(보통 최종 transcript 반영 후) 호출 */
  function stop(onRecognitionEnded?: () => void) {
    isListening.value = false
    if (dictationTarget && voiceCancelCb) {
      const spoken = extractSpokenSegment(sessionPrefix, dictationTarget.value)
      const opts = getVoiceClearOptions?.() ?? defaultVoiceClearOptions()
      if (matchesVoiceClearCommand(spoken, opts.phrases)) {
        const cb = voiceCancelCb
        voiceCancelCb = undefined
        dictationTarget.value = sessionPrefix
        scheduleVoiceClearCancel(() => {
          cb()
        })
      }
    }
    const r = recognition
    if (!r) {
      onRecognitionEnded?.()
      return
    }
    let ended = false
    const fire = () => {
      if (ended) return
      ended = true
      onRecognitionEnded?.()
    }
    const previousOnEnd = r.onend
    r.onend = () => {
      if (typeof previousOnEnd === 'function') previousOnEnd()
      fire()
    }
    try {
      r.stop()
    } catch {
      fire()
    }
  }

  onBeforeUnmount(() => {
    dispose()
  })

  return {
    isListening,
    isSupported,
    lastError,
    startDictation,
    stop,
    dispose,
  }
}
