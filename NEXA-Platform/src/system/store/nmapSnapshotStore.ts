import { NIXIE_HUD_MARQUEE } from '@system/nixie/nixieHudMarqueeConfig'
import { encodeTextToMorseHudText, hudTapePeriodWidthCols, normalizeDemoHudText, textFitsCompletelyInGrid } from '@system/nixie/nixieDotMap'
import { resolveMorseDitMs } from '@system/nixie/morseTimeline'
import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export type HowState = 'FLOW' | 'STUCK' | 'VOID'
export type WhoPulse = 'WILL' | 'ECHO' | 'ASK'

/** 시뮬: Nexion 스냅샷 형식 */
export type NmapSnapshot = {
  schemaVersion: number
  how_state: HowState
  who_pulse: WhoPulse
  confidence_score: number
  warn_token: string | null
  /** 엔트로피 강도(0~100). 0=정적에 가까움, 100=가장 동적 */
  entropy_level: number
  is_virtual: boolean
  source_shell_id: string | null
  user_defined_threshold: number
  /** 시뮬: HUD 도트 텍스트(A–Z·a–z·0–9·한글·스페이스·모스 `.` `-`, 전각·중점 등 정규화). 빈 문자열이면 기본 루미나만 */
  demo_hud_text: string
  /** 시뮬 입력 원문(사용자 타이핑 그대로 유지; 예: 한글 완성형) */
  demo_hud_text_raw: string
  /** 시뮬: 원문을 모스(`.` `-` `^`)로 변환해 HUD에 표시 */
  demo_hud_morse_enabled: boolean
  /** 모스 속도(WPM). PARIS 기준 dit(ms)≈1200/WPM — `morse_dit_ms_override`가 있으면 무시 */
  morse_wpm: number
  /** dit 길이(ms) 직접 지정. null이면 WPM으로 계산 */
  morse_dit_ms_override: number | null
  /** 이후 I2S/앰프 재생용 캐리어 주파수(Hz) — 타임라인과 함께 전달 가능 */
  morse_tone_hz: number
  /** 긴 문자열 마퀴: 테이프 왼쪽에서 건너뛸 그리드 열 수(도트 1칸=1열), 주기=hudTapePeriodWidthCols */
  demo_hud_scroll_offset: number
}

const LOCAL_SHELL_ID = 'local'

/** 시뮬: 기본 스냅샷 */
function defaultSnapshot(): NmapSnapshot {
  return {
    schemaVersion: 1,
    how_state: 'FLOW',
    who_pulse: 'ECHO',
    confidence_score: 100,
    warn_token: null,
    entropy_level: 100,
    is_virtual: false,
    source_shell_id: LOCAL_SHELL_ID,
    user_defined_threshold: 95,
    demo_hud_text: '',
    demo_hud_text_raw: '',
    demo_hud_morse_enabled: false,
    morse_wpm: 20,
    morse_dit_ms_override: null,
    morse_tone_hz: 800,
    demo_hud_scroll_offset: 0,
  }
}

/** 시뮬: Nexion 스냅샷 관리 스토어 */
export const useNmapSnapshotStore = defineStore('nmapSnapshot', () => {
  const snapshot: Ref<NmapSnapshot> = ref(defaultSnapshot())
  /** Nebula 시뮬 시 Nixie 쪽에서 watch 할 트리거 */
  const nebulaPulse: Ref<number> = ref(0)

  function applyPatch(partial: Partial<NmapSnapshot>) {
    snapshot.value = { ...snapshot.value, ...partial }
  }

  function setHowState(how_state: HowState) {
    applyPatch({ how_state })
  }

  function setWhoPulse(who_pulse: WhoPulse) {
    applyPatch({ who_pulse })
  }

  function setConfidenceScore(confidence_score: number) {
    applyPatch({ confidence_score: Math.max(0, Math.min(100, confidence_score)) })
  }

  function setWarnToken(warn_token: string | null) {
    applyPatch({ warn_token })
  }

  function setEntropyLevel(entropy_level: number) {
    applyPatch({ entropy_level: Math.max(0, Math.min(100, entropy_level)) })
  }

  function setIsVirtual(is_virtual: boolean) {
    applyPatch({ is_virtual })
  }

  function setSourceShellId(source_shell_id: string | null) {
    applyPatch({ source_shell_id })
  }

  function setUserDefinedThreshold(user_defined_threshold: number) {
    applyPatch({ user_defined_threshold: Math.max(0, Math.min(100, user_defined_threshold)) })
  }

  function setMorseWpm(wpm: number) {
    applyPatch({ morse_wpm: Math.max(5, Math.min(60, Math.round(Number(wpm) || 20))) })
  }

  function setMorseDitMsOverride(ms: number | null) {
    if (ms == null || !Number.isFinite(ms)) {
      applyPatch({ morse_dit_ms_override: null })
      return
    }
    applyPatch({ morse_dit_ms_override: Math.max(20, Math.min(500, Math.round(ms))) })
  }

  /** dit 직접 지정 켜기: 현재 WPM 기준 dit 값으로 초기화 */
  function setMorseUseCustomDit(enabled: boolean) {
    if (enabled) {
      const dit = resolveMorseDitMs({
        wpm: snapshot.value.morse_wpm,
        ditMsOverride: null,
      })
      applyPatch({ morse_dit_ms_override: dit })
    } else {
      applyPatch({ morse_dit_ms_override: null })
    }
  }

  function setMorseToneHz(hz: number) {
    applyPatch({ morse_tone_hz: Math.max(300, Math.min(2000, Math.round(Number(hz) || 800))) })
  }

  /** 시뮬: 원문을 모스(`.` `-` `^`)로 변환해 HUD에 표시 */
  function buildNormalizedHudText(raw: string): string {
    const source = snapshot.value.demo_hud_morse_enabled ? encodeTextToMorseHudText(raw) : raw
    return normalizeDemoHudText(source)
  }

  /** 시뮬: 원문을 모스(`.` `-` `^`)로 변환해 HUD에 표시 */
  function setDemoHudText(raw: string | null | undefined) {
    const demo_hud_text_raw = String(raw ?? '')
    const demo_hud_text = buildNormalizedHudText(demo_hud_text_raw)
    if (!demo_hud_text.length) {
      applyPatch({ demo_hud_text: '', demo_hud_text_raw, demo_hud_scroll_offset: 0 })
      return
    }
    if (textFitsCompletelyInGrid(demo_hud_text)) {
      applyPatch({ demo_hud_text, demo_hud_text_raw, demo_hud_scroll_offset: 0 })
      return
    }
    const period = hudTapePeriodWidthCols(demo_hud_text)
    const prev = snapshot.value.demo_hud_scroll_offset ?? 0
    const demo_hud_scroll_offset = period > 0 ? ((Math.floor(prev) % period) + period) % period : 0
    applyPatch({ demo_hud_text, demo_hud_text_raw, demo_hud_scroll_offset })
  }

  /** 시뮬: 모스 모드 활성화 여부 설정 */
  function setDemoHudMorseEnabled(enabled: boolean) {
    const demo_hud_morse_enabled = Boolean(enabled)
    const demo_hud_text_raw = snapshot.value.demo_hud_text_raw ?? ''
    const demo_hud_text = normalizeDemoHudText(demo_hud_morse_enabled ? encodeTextToMorseHudText(demo_hud_text_raw) : demo_hud_text_raw)
    if (!demo_hud_text.length) {
      applyPatch({ demo_hud_morse_enabled, demo_hud_text: '', demo_hud_scroll_offset: 0 })
      return
    }
    if (textFitsCompletelyInGrid(demo_hud_text)) {
      applyPatch({ demo_hud_morse_enabled, demo_hud_text, demo_hud_scroll_offset: 0 })
      return
    }
    const period = hudTapePeriodWidthCols(demo_hud_text)
    const prev = snapshot.value.demo_hud_scroll_offset ?? 0
    const demo_hud_scroll_offset = period > 0 ? ((Math.floor(prev) % period) + period) % period : 0
    applyPatch({ demo_hud_morse_enabled, demo_hud_text, demo_hud_scroll_offset })
  }

  /** 시뮬: HUD 스크롤 오프셋 설정 */
  function setDemoHudScrollOffset(offset: number) {
    const full = normalizeDemoHudText(snapshot.value.demo_hud_text)
    if (!full.length) {
      applyPatch({ demo_hud_scroll_offset: 0 })
      return
    }
    if (textFitsCompletelyInGrid(full)) {
      applyPatch({ demo_hud_scroll_offset: 0 })
      return
    }
    const period = hudTapePeriodWidthCols(full)
    const o = period > 0 ? ((Math.floor(offset) % period) + period) % period : 0
    applyPatch({ demo_hud_scroll_offset: o })
  }

  /** 긴 HUD: `NIXIE_HUD_MARQUEE.colsPerTick` 열씩 스크롄(주기=테이프 열 합) */
  function tickDemoHudMarquee() {
    const demo_hud_text = normalizeDemoHudText(snapshot.value.demo_hud_text ?? '')
    if (!demo_hud_text.length) {
      applyPatch({ demo_hud_scroll_offset: 0 })
      return
    }
    if (textFitsCompletelyInGrid(demo_hud_text)) {
      if (snapshot.value.demo_hud_scroll_offset !== 0) applyPatch({ demo_hud_scroll_offset: 0 })
      return
    }
    const period = hudTapePeriodWidthCols(demo_hud_text)
    if (period <= 0) return
    const cur = snapshot.value.demo_hud_scroll_offset ?? 0
    const step = Math.max(1, Math.floor(NIXIE_HUD_MARQUEE.colsPerTick))
    const next = (cur + step) % period
    applyPatch({ demo_hud_scroll_offset: next })
  }

  function resetToDefaults() {
    snapshot.value = defaultSnapshot()
    nebulaPulse.value = 0
  }

  /** 외부 쉘 유입 시뮬 + 연출 트리거 */
  function simulateNebulaInflux(externalId = 'external-device-demo') {
    applyPatch({ source_shell_id: externalId })
    nebulaPulse.value += 1
  }

  function clearNebulaToLocal() {
    applyPatch({ source_shell_id: LOCAL_SHELL_ID })
  }

  return {
    snapshot,
    nebulaPulse,
    applyPatch,
    setHowState,
    setWhoPulse,
    setConfidenceScore,
    setWarnToken,
    setEntropyLevel,
    setIsVirtual,
    setSourceShellId,
    setUserDefinedThreshold,
    resetToDefaults,
    setDemoHudText,
    setDemoHudMorseEnabled,
    setMorseWpm,
    setMorseDitMsOverride,
    setMorseUseCustomDit,
    setMorseToneHz,
    setDemoHudScrollOffset,
    tickDemoHudMarquee,
    simulateNebulaInflux,
    clearNebulaToLocal,
  }
})
