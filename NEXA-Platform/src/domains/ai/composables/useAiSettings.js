import { ref, computed, watch } from 'vue'

const SETTINGS_KEY = 'nexa-ai-settings'

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function saveSettings(data) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('[useAiSettings] 저장 실패:', e)
  }
}

const saved = loadSettings()
const selectedModel = ref(saved.selectedModel ?? '')
const chatInputMaxRows = ref(Math.max(2, Math.min(20, saved.chatInputMaxRows ?? 8)))
const chatFontSize = ref(Math.max(12, Math.min(24, saved.chatFontSize ?? 16)))
const chatMessageMaxLength = ref(Math.max(0, Math.min(10000, saved.chatMessageMaxLength ?? 0)))
const modelCapabilities = ref({})
const pendingWebcamCapture = ref(null)
const webcamFlipMode = ref(saved.webcamFlipMode ?? 'none')
const webcamResolution = ref(saved.webcamResolution ?? '640x480')
const webcamFilterBrightness = ref(Math.max(0, Math.min(200, saved.webcamFilterBrightness ?? 100)))
const webcamFilterContrast = ref(Math.max(0, Math.min(200, saved.webcamFilterContrast ?? 100)))
const webcamFilterSaturate = ref(Math.max(0, Math.min(200, saved.webcamFilterSaturate ?? 100)))
const webcamFilterGrayscale = ref(saved.webcamFilterGrayscale ?? false)
function loadTitleSuggestionRange() {
  if (saved.titleSuggestionMinTurns != null && saved.titleSuggestionMaxTurnsForContext != null) {
    const min = Math.max(1, Math.min(10, saved.titleSuggestionMinTurns))
    const max = Math.max(1, Math.min(10, saved.titleSuggestionMaxTurnsForContext))
    return { min: Math.min(min, max), max: Math.max(min, max) }
  }
  const legacy = saved.titleSuggestionTurns ?? 3
  const v = Math.max(1, Math.min(10, legacy))
  return { min: v, max: v }
}
const _range = loadTitleSuggestionRange()
const titleSuggestionMinTurns = ref(_range.min)
const titleSuggestionMaxTurnsForContext = ref(_range.max)

const selectedModelCapabilities = computed(() => {
  const name = selectedModel.value
  return name ? (modelCapabilities.value[name] || []) : []
})

function setModelCapabilities(capabilitiesMap) {
  modelCapabilities.value = { ...modelCapabilities.value, ...capabilitiesMap }
}

watch(
  [selectedModel, chatInputMaxRows, chatFontSize, chatMessageMaxLength, webcamFlipMode, webcamResolution, webcamFilterBrightness, webcamFilterContrast, webcamFilterSaturate, webcamFilterGrayscale, titleSuggestionMinTurns, titleSuggestionMaxTurnsForContext],
  () => {
    saveSettings({
      selectedModel: selectedModel.value,
      chatInputMaxRows: chatInputMaxRows.value,
      chatFontSize: chatFontSize.value,
      chatMessageMaxLength: chatMessageMaxLength.value,
      webcamFlipMode: webcamFlipMode.value,
      webcamResolution: webcamResolution.value,
      webcamFilterBrightness: webcamFilterBrightness.value,
      webcamFilterContrast: webcamFilterContrast.value,
      webcamFilterSaturate: webcamFilterSaturate.value,
      webcamFilterGrayscale: webcamFilterGrayscale.value,
      titleSuggestionMinTurns: titleSuggestionMinTurns.value,
      titleSuggestionMaxTurnsForContext: titleSuggestionMaxTurnsForContext.value,
    })
  },
  { deep: true }
)

export function useAiSettings() {
  return {
    selectedModel,
    chatInputMaxRows,
    chatFontSize,
    chatMessageMaxLength,
    modelCapabilities,
    selectedModelCapabilities,
    setModelCapabilities,
    pendingWebcamCapture,
    webcamFlipMode,
    webcamResolution,
    webcamFilterBrightness,
    webcamFilterContrast,
    webcamFilterSaturate,
    webcamFilterGrayscale,
    titleSuggestionMinTurns,
    titleSuggestionMaxTurnsForContext,
  }
}
