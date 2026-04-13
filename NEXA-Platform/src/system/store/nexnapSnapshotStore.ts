import { NIXIE_HUD_MARQUEE } from '@system/nixie/nixieUiConfig'
import { encodeTextToMorseHudText, hudTapePeriodWidthCols, normalizeDemoHudText, textFitsCompletelyInGrid } from '@system/nixie/nixieDotMap'
import type { HowState, WhoPulse } from '@system/schemas/storage/nexa-protocol'
import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export type { HowState, WhoPulse } from '@system/schemas/storage/nexa-protocol'

/** 모스 미리듣기 스테레오: L=-1, ALL(중앙)=0, R=1 — Web Audio `StereoPannerNode.pan` */
export type MorseStereoPan = -1 | 0 | 1
/** 원자 기준 프리셋 키(가청 매핑 전 기준 주파수 식별자) */
export type MorseAtomicClockKey = 'H_1420MHz' | 'Cs_9192631770Hz' | 'Rb_6834682610Hz' | 'Sr_429THz' | 'Yb_518THz' | 'YbPlus_E2_688THz' | 'YbPlus_E3_642THz' | 'HgPlus_1064THz' | 'AlPlus_1121THz' | 'CaPlus_411THz' | 'Mg_655THz' | 'InPlus_1267THz' | 'TlPlus_1483THz' | 'Dy_235THz' | 'Th229_Nuclear'

/**
 * 시뮬: Nexion 스냅샷 형식.
 * `morse_dit_ms` / `morse_tone_hz` / `morse_volume` 은 HUD·미리듣기·타임라인에 쓰이며,
 * 향후 Nexnap 상황(entropy·confidence·how_state 등)에 따라 덮어쓰기·보간하는 매핑은 본편 닉시 단계에서 별도 모듈로 둘 예정(현재 미연결).
 * §8 M-F: 의미 6축(0~100)·의미→DSP·모스 토글 — `getNixieSoundAtmosphere` / 매핑 모듈 입력 SSOT.
 */
export type NexnapSnapshot = {
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
  /** §8 M-F — 닉시 사운드 의미 6축(개발 패널·이벤트 공통, 0~100) */
  sound_atmosphere_tension: number
  sound_atmosphere_uncanniness: number
  sound_atmosphere_mechanical: number
  sound_atmosphere_space: number
  sound_atmosphere_vitality: number
  sound_atmosphere_harmony: number
  /** §8 M-E~F — 의미 벡터→DSP·모스 매핑 적용 여부 */
  sound_atmosphere_mapping_enabled: boolean
  /** 시뮬: HUD 도트 텍스트(A–Z·a–z·0–9·한글·스페이스·모스 `.` `-`, 전각·중점 등 정규화). 빈 문자열이면 기본 루미나만 */
  demo_hud_text: string
  /** 시뮬 입력 원문(사용자 타이핑 그대로 유지; 예: 한글 완성형) */
  demo_hud_text_raw: string
  /** 시뮬: 원문을 모스(`.` `-` `^`)로 변환해 HUD에 표시 */
  demo_hud_morse_enabled: boolean
  /** 모스 dit 길이(ms) 20~500 — 재생·타임라인에 항상 적용 */
  morse_dit_ms: number
  /** 이후 I2S/앰프 재생용 캐리어 주파수(Hz) 1~12000 — 타임라인과 함께 전달 가능 */
  morse_tone_hz: number
  /** 모스 재생 볼륨(0~100). Web Audio 마스터 게인에 비례 */
  morse_volume: number
  /** 모스 미리듣기 L/R/중앙 — 엿듣기·대화 연출용 */
  morse_stereo_pan: MorseStereoPan
  /** 원자 기준 프리셋 키 — 이후 DIT/톤 매핑에 사용 */
  morse_atomic_clock: MorseAtomicClockKey
  /** 긴 문자열 마퀴: 테이프 왼쪽에서 건너뛸 그리드 열 수(도트 1칸=1열), 주기=hudTapePeriodWidthCols */
  demo_hud_scroll_offset: number
  /** HUD 마퀴 틱 간격(ms) — `NIXIE_HUD_MARQUEE.intervalMsMin~intervalMsMax`, `NixieOnlineCharacter` `setInterval` */
  hud_marquee_interval_ms: number
  /** 모스 미리듣기 시 닉시 HUD를 타임라인과 동기(방식 ②) — false면 재생 중에도 마퀴·기존 스크롄만 사용 */
  morse_hud_sync_with_playback: boolean
  /**
   * true: 디트/다시 재생 순간에 해당하는 `.`/`-` **한 글자**만 강조(입문 학습용).
   * false: 토큰(글자 묶음) 전체 강조 — 눈의 피로가 적음(기본).
   */
  morse_hud_per_event_highlight: boolean
  /** 모스 미리듣기 재생 중 — 마퀴 틱 억제·스크롄 오버라이드에 사용 */
  morse_playback_active: boolean
  /** 재생 세대 — UI 경합 방지용 */
  morse_playback_generation: number
  /** 재생 중 `mapHudTextToDots` 스크롄 — null이면 `demo_hud_scroll_offset` */
  morse_playback_scroll_offset_override: number | null
  /** 강조할 모스 토큰 인덱스(공백 분리) — -1이면 강조 없음 */
  morse_playback_highlight_token_index: number
  /**
   * `morse_hud_per_event_highlight` 일 때 dot/dash 에 해당하는 `demo_hud_text` 문자 구간 `[start, end)`.
   * 둘 다 -1이면 토큰 전체 강조(`morse_playback_highlight_token_index`) 사용.
   */
  morse_playback_highlight_char_start: number
  morse_playback_highlight_char_end: number
  /** false면 루미나 강조 마스크 없음(갭 구간 등) */
  morse_playback_highlight_accent_active: boolean
  /** 재생 시작 직전 `demo_hud_scroll_offset` — 종료 시 복구 */
  morse_playback_scroll_restore: number
}

const LOCAL_SHELL_ID = 'local'

function clampUi100(n: number): number {
  const x = Number(n)
  if (!Number.isFinite(x)) return 0
  return Math.max(0, Math.min(100, Math.round(x)))
}

/** §8 M-F — `applyPatch`마다 보정. 구버전·부분 객체에 키가 없으면 spread 후에도 `undefined`가 남아 UI(토글·슬라이더)가 깨짐 */
function ensureSoundAtmosphereFields(next: NexnapSnapshot): NexnapSnapshot {
  const d = defaultSnapshot()
  const t = next.sound_atmosphere_tension
  const u = next.sound_atmosphere_uncanniness
  const m = next.sound_atmosphere_mechanical
  const sp = next.sound_atmosphere_space
  const v = next.sound_atmosphere_vitality
  const h = next.sound_atmosphere_harmony
  const mapOn = next.sound_atmosphere_mapping_enabled
  return {
    ...next,
    schemaVersion: Math.max(next.schemaVersion ?? 1, 2),
    sound_atmosphere_tension: typeof t === 'number' && Number.isFinite(t) ? clampUi100(t) : d.sound_atmosphere_tension,
    sound_atmosphere_uncanniness: typeof u === 'number' && Number.isFinite(u) ? clampUi100(u) : d.sound_atmosphere_uncanniness,
    sound_atmosphere_mechanical: typeof m === 'number' && Number.isFinite(m) ? clampUi100(m) : d.sound_atmosphere_mechanical,
    sound_atmosphere_space: typeof sp === 'number' && Number.isFinite(sp) ? clampUi100(sp) : d.sound_atmosphere_space,
    sound_atmosphere_vitality: typeof v === 'number' && Number.isFinite(v) ? clampUi100(v) : d.sound_atmosphere_vitality,
    sound_atmosphere_harmony: typeof h === 'number' && Number.isFinite(h) ? clampUi100(h) : d.sound_atmosphere_harmony,
    sound_atmosphere_mapping_enabled: typeof mapOn === 'boolean' ? mapOn : d.sound_atmosphere_mapping_enabled,
  }
}

/** 시뮬: 기본 스냅샷 */
function defaultSnapshot(): NexnapSnapshot {
  return {
    schemaVersion: 2,
    how_state: 'FLOW',
    who_pulse: 'ECHO',
    confidence_score: 100,
    warn_token: null,
    entropy_level: 100,
    is_virtual: false,
    source_shell_id: LOCAL_SHELL_ID,
    user_defined_threshold: 95,
    /** §8 M-B: 의미 6축 슬라이더 → 스냅샷 `sound_atmosphere_*` */
    sound_atmosphere_tension: 0,
    sound_atmosphere_uncanniness: 0,
    sound_atmosphere_mechanical: 0,
    sound_atmosphere_space: 0,
    sound_atmosphere_vitality: 0,
    sound_atmosphere_harmony: 0,
    sound_atmosphere_mapping_enabled: false,
    demo_hud_text: '',
    demo_hud_text_raw: '',
    demo_hud_morse_enabled: false,
    morse_dit_ms: 60,
    morse_tone_hz: 800,
    morse_volume: 35,
    morse_stereo_pan: 0,
    morse_atomic_clock: 'H_1420MHz',
    demo_hud_scroll_offset: 0,
    hud_marquee_interval_ms: NIXIE_HUD_MARQUEE.intervalMs,
    morse_hud_sync_with_playback: true,
    /** true일 때만 디트(단음)·다시(장음)마다 한 글자 강조(옵션). false면 토큰 전체 강조 */
    morse_hud_per_event_highlight: false,
    morse_playback_active: false,
    morse_playback_generation: 0,
    morse_playback_scroll_offset_override: null,
    morse_playback_highlight_token_index: -1,
    morse_playback_highlight_char_start: -1,
    morse_playback_highlight_char_end: -1,
    morse_playback_highlight_accent_active: true,
    morse_playback_scroll_restore: 0,
  }
}

/** `setMorsePlaybackHudFrame` 세 번째 인자 */
export type MorsePlaybackHudFrameOptions = {
  /** dot/dash 한 글자 강조 — 생략·null이면 토큰 전체 강조 */
  highlightCharRange?: { start: number; end: number } | null
  /** false면 강조 루미나 없음(갭 등) */
  accentActive?: boolean
}

/** 시뮬: Nexion 스냅샷 관리 스토어 */
export const useNexnapSnapshotStore = defineStore('nexnapSnapshot', () => {
  const snapshot: Ref<NexnapSnapshot> = ref(defaultSnapshot())
  /** Nebula 시뮬 시 Nixie 쪽에서 watch 할 트리거 */
  const nebulaPulse: Ref<number> = ref(0)

  function applyPatch(partial: Partial<NexnapSnapshot>) {
    snapshot.value = ensureSoundAtmosphereFields({ ...snapshot.value, ...partial })
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

  // §8 M-B: 의미 6축 슬라이더 → 스냅샷 `sound_atmosphere_*`
  function setSoundAtmosphereTension(v: number) {
    applyPatch({ sound_atmosphere_tension: clampUi100(v) })
  }
  function setSoundAtmosphereUncanniness(v: number) {
    applyPatch({ sound_atmosphere_uncanniness: clampUi100(v) })
  }
  function setSoundAtmosphereMechanical(v: number) {
    applyPatch({ sound_atmosphere_mechanical: clampUi100(v) })
  }
  function setSoundAtmosphereSpace(v: number) {
    applyPatch({ sound_atmosphere_space: clampUi100(v) })
  }
  function setSoundAtmosphereVitality(v: number) {
    applyPatch({ sound_atmosphere_vitality: clampUi100(v) })
  }
  function setSoundAtmosphereHarmony(v: number) {
    applyPatch({ sound_atmosphere_harmony: clampUi100(v) })
  }
  function setSoundAtmosphereMappingEnabled(enabled: boolean) {
    applyPatch({ sound_atmosphere_mapping_enabled: Boolean(enabled) })
  }

  function setHudMarqueeIntervalMs(ms: number) {
    const lo = NIXIE_HUD_MARQUEE.intervalMsMin
    const hi = NIXIE_HUD_MARQUEE.intervalMsMax
    applyPatch({ hud_marquee_interval_ms: Math.max(lo, Math.min(hi, Math.round(Number(ms) || NIXIE_HUD_MARQUEE.intervalMs))) })
  }

  function setMorseDitMs(ms: number) {
    applyPatch({ morse_dit_ms: Math.max(20, Math.min(500, Math.round(Number(ms) || 60))) })
  }

  function setMorseToneHz(hz: number) {
    applyPatch({ morse_tone_hz: Math.max(1, Math.min(12000, Math.round(Number(hz) || 800))) })
  }

  function setMorseVolume(percent: number) {
    applyPatch({ morse_volume: Math.max(0, Math.min(100, Math.round(Number(percent) || 0))) })
  }

  function setMorseStereoPan(pan: MorseStereoPan) {
    applyPatch({ morse_stereo_pan: pan })
  }

  function setMorseAtomicClock(key: MorseAtomicClockKey) {
    applyPatch({ morse_atomic_clock: key })
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
    const s = snapshot.value
    if (s.morse_playback_active && (s.morse_hud_sync_with_playback ?? true) && s.demo_hud_morse_enabled) {
      return
    }
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

  function setMorseHudSyncWithPlayback(enabled: boolean) {
    applyPatch({ morse_hud_sync_with_playback: Boolean(enabled) })
  }

  function setMorseHudPerEventHighlight(enabled: boolean) {
    applyPatch({ morse_hud_per_event_highlight: Boolean(enabled) })
  }

  /** 재생 시작 시 호출 — 스크롄 복구값·세대·활성 플래그 */
  function beginMorsePlaybackHudSync(payload: { generation: number; restoreScroll: number }) {
    applyPatch({
      morse_playback_active: true,
      morse_playback_generation: payload.generation,
      morse_playback_scroll_restore: payload.restoreScroll,
      morse_playback_scroll_offset_override: null,
      morse_playback_highlight_token_index: -1,
      morse_playback_highlight_char_start: -1,
      morse_playback_highlight_char_end: -1,
      morse_playback_highlight_accent_active: false,
    })
  }

  /** 재생 중 HUD 프레임(스크롄 오버라이드·강조 토큰·선택적 문자 구간) */
  function setMorsePlaybackHudFrame(scrollOffset: number, highlightTokenIndex: number, options?: MorsePlaybackHudFrameOptions) {
    const o = options ?? {}
    if (o.accentActive === false) {
      applyPatch({
        morse_playback_scroll_offset_override: scrollOffset,
        morse_playback_highlight_token_index: highlightTokenIndex,
        morse_playback_highlight_accent_active: false,
        morse_playback_highlight_char_start: -1,
        morse_playback_highlight_char_end: -1,
      })
      return
    }
    const hr = o.highlightCharRange
    const useChar = hr != null && Number.isFinite(hr.start) && Number.isFinite(hr.end) && hr.end > hr.start
    const patch: Partial<NexnapSnapshot> = {
      morse_playback_scroll_offset_override: scrollOffset,
      morse_playback_highlight_token_index: highlightTokenIndex,
      morse_playback_highlight_accent_active: true,
    }
    if (useChar) {
      patch.morse_playback_highlight_char_start = Math.floor(hr!.start)
      patch.morse_playback_highlight_char_end = Math.floor(hr!.end)
    } else {
      patch.morse_playback_highlight_char_start = -1
      patch.morse_playback_highlight_char_end = -1
    }
    applyPatch(patch)
  }

  /** 재생 종료·정지 시 — 마퀴용 스크롄을 `morse_playback_scroll_restore` 로 복구 */
  function endMorsePlaybackHudSync() {
    const restore = snapshot.value.morse_playback_scroll_restore ?? 0
    applyPatch({
      morse_playback_active: false,
      morse_playback_scroll_offset_override: null,
      morse_playback_highlight_token_index: -1,
      morse_playback_highlight_char_start: -1,
      morse_playback_highlight_char_end: -1,
      morse_playback_highlight_accent_active: true,
      demo_hud_scroll_offset: restore,
    })
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
    /** §8 M-B: 의미 6축 슬라이더 → 스냅샷 `sound_atmosphere_*` */
    setSoundAtmosphereTension,
    setSoundAtmosphereUncanniness,
    setSoundAtmosphereMechanical,
    setSoundAtmosphereSpace,
    setSoundAtmosphereVitality,
    setSoundAtmosphereHarmony,
    /** §8 M-F: 의미→DSP·모스 매핑 토글 — 스냅샷 `sound_atmosphere_mapping_enabled` */
    setSoundAtmosphereMappingEnabled,
    setHudMarqueeIntervalMs,
    resetToDefaults,
    setDemoHudText,
    setDemoHudMorseEnabled,
    /** §8 M-E~F: 의미→DSP·모스 매핑 적용 여부 — 스냅샷 `sound_atmosphere_mapping_enabled` */
    setMorseDitMs,
    setMorseToneHz,
    setMorseVolume,
    setMorseStereoPan,
    setMorseAtomicClock,
    setDemoHudScrollOffset,
    tickDemoHudMarquee,
    simulateNebulaInflux,
    clearNebulaToLocal,
    setMorseHudSyncWithPlayback,
    setMorseHudPerEventHighlight,
    beginMorsePlaybackHudSync,
    setMorsePlaybackHudFrame,
    endMorsePlaybackHudSync,
  }
})
