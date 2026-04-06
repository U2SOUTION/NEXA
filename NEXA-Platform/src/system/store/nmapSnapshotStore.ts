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
    simulateNebulaInflux,
    clearNebulaToLocal,
  }
})
