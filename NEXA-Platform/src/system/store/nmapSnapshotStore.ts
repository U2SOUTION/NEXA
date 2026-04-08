import { NIXIE_HUD_MARQUEE } from '@system/nixie/nixieHudMarqueeConfig'
import { encodeTextToMorseHudText, hudTapePeriodWidthCols, normalizeDemoHudText, textFitsCompletelyInGrid } from '@system/nixie/nixieDotMap'
import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export type HowState = 'FLOW' | 'STUCK' | 'VOID'
export type WhoPulse = 'WILL' | 'ECHO' | 'ASK'

/** 모스 미리듣기 스테레오: L=-1, ALL(중앙)=0, R=1 — Web Audio `StereoPannerNode.pan` */
export type MorseStereoPan = -1 | 0 | 1

/**
 * 시뮬: Nexion 스냅샷 형식.
 * `morse_dit_ms` / `morse_tone_hz` / `morse_volume` 은 HUD·미리듣기·타임라인에 쓰이며,
 * 향후 N-MAP 상황(entropy·confidence·how_state 등)에 따라 덮어쓰기·보간하는 매핑은 본편 닉시 단계에서 별도 모듈로 둘 예정(현재 미연결).
 */
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
  /** 모스 dit 길이(ms) 20~500 — 재생·타임라인에 항상 적용 */
  morse_dit_ms: number
  /** 이후 I2S/앰프 재생용 캐리어 주파수(Hz) 50~2000 — 타임라인과 함께 전달 가능 */
  morse_tone_hz: number
  /** 모스 재생 볼륨(0~100). Web Audio 마스터 게인에 비례 */
  morse_volume: number
  /** 모스 미리듣기 L/R/중앙 — 엿듣기·대화 연출용 */
  morse_stereo_pan: MorseStereoPan
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
    morse_dit_ms: 60,
    morse_tone_hz: 800,
    morse_volume: 35,
    morse_stereo_pan: 0,
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

  function setMorseDitMs(ms: number) {
    applyPatch({ morse_dit_ms: Math.max(20, Math.min(500, Math.round(Number(ms) || 60))) })
  }

  function setMorseToneHz(hz: number) {
    applyPatch({ morse_tone_hz: Math.max(50, Math.min(2000, Math.round(Number(hz) || 800))) })
  }

  function setMorseVolume(percent: number) {
    applyPatch({ morse_volume: Math.max(0, Math.min(100, Math.round(Number(percent) || 0))) })
  }

  function setMorseStereoPan(pan: MorseStereoPan) {
    applyPatch({ morse_stereo_pan: pan })
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
    setMorseDitMs,
    setMorseToneHz,
    setMorseVolume,
    setMorseStereoPan,
    setDemoHudScrollOffset,
    tickDemoHudMarquee,
    simulateNebulaInflux,
    clearNebulaToLocal,
  }
})
