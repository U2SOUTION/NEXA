import {
  getMaxScrollOffsetChars,
  normalizeDemoHudText,
  textFitsCompletelyInGrid,
} from '@system/nixie/nixieUppercaseDotMap'
import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export type HowState = 'FLOW' | 'STUCK' | 'VOID'
export type WhoPulse = 'WILL' | 'ECHO' | 'ASK'
export type UiEntropyMode = 'full' | 'minimal' | 'static'

export type NmapSnapshot = {
  schemaVersion: number
  how_state: HowState
  who_pulse: WhoPulse
  confidence_score: number
  warn_token: string | null
  ui_entropy_mode: UiEntropyMode
  is_virtual: boolean
  source_shell_id: string | null
  user_defined_threshold: number
  /** 시뮬: HUD 도트 텍스트(A–Z·0–9·스페이스, 전각 영숫자 정규화, 길이 제한 없음). 빈 문자열이면 기본 루미나만 */
  demo_hud_text: string
  /** 긴 문자열 좌→우 흐름용: 정규화된 문자열 기준 시작 글자 인덱스 */
  demo_hud_scroll_offset: number
}

const LOCAL_SHELL_ID = 'local'

function defaultSnapshot(): NmapSnapshot {
  return {
    schemaVersion: 1,
    how_state: 'FLOW',
    who_pulse: 'ECHO',
    confidence_score: 100,
    warn_token: null,
    ui_entropy_mode: 'full',
    is_virtual: false,
    source_shell_id: LOCAL_SHELL_ID,
    user_defined_threshold: 95,
    demo_hud_text: '',
    demo_hud_scroll_offset: 0,
  }
}

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

  function setUiEntropyMode(ui_entropy_mode: UiEntropyMode) {
    applyPatch({ ui_entropy_mode })
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

  function setDemoHudText(raw: string | null | undefined) {
    const demo_hud_text = normalizeDemoHudText(String(raw ?? ''))
    const maxOff = getMaxScrollOffsetChars(demo_hud_text)
    const prev = snapshot.value.demo_hud_scroll_offset ?? 0
    const demo_hud_scroll_offset = Math.min(Math.max(0, Math.floor(prev)), maxOff)
    applyPatch({ demo_hud_text, demo_hud_scroll_offset })
  }

  function setDemoHudScrollOffset(offset: number) {
    const full = normalizeDemoHudText(snapshot.value.demo_hud_text)
    const maxOff = getMaxScrollOffsetChars(full)
    const o = Math.max(0, Math.min(Math.floor(offset), maxOff))
    applyPatch({ demo_hud_scroll_offset: o })
  }

  /** 긴 HUD 텍스트용: 한 글자씩 시작 인덱스를 올려 오른쪽→왼쪽 흐름(끝에서 0으로 루프) */
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
    const maxOff = getMaxScrollOffsetChars(demo_hud_text)
    const cur = snapshot.value.demo_hud_scroll_offset ?? 0
    const next = cur >= maxOff ? 0 : cur + 1
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
    setUiEntropyMode,
    setIsVirtual,
    setSourceShellId,
    setUserDefinedThreshold,
    resetToDefaults,
    setDemoHudText,
    setDemoHudScrollOffset,
    tickDemoHudMarquee,
    simulateNebulaInflux,
    clearNebulaToLocal,
  }
})
