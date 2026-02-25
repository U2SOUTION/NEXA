import { ref, computed, watch } from 'vue'
import { Notify } from 'quasar'

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
/** 채팅모드: streaming(실시간 출력) | full-delivery(완료 후 일괄) */
const chatMode = ref(saved.chatMode ?? 'streaming')
const chatInputMaxRows = ref(Math.max(2, Math.min(20, saved.chatInputMaxRows ?? 8)))
const chatFontSize = ref(Math.max(12, Math.min(24, saved.chatFontSize ?? 16)))
const chatMessageMaxLength = ref(Math.max(0, Math.min(10000, saved.chatMessageMaxLength ?? 0)))
const modelCapabilities = ref({})
const pendingWebcamCapture = ref(null)
/** 갤러리/웹서버에서 선택한 파일을 채팅에 첨부 요청 { url, original_name } */
const pendingAttachmentsFromGallery = ref([])
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

/** 목차 기능: true=표시, false=숨김 */
const outlineEnabled = ref(saved.outlineEnabled ?? false)
/** 목차 표시 모드: overlay(오버레이, 30% 투명도, 호버 시 표시) | push(밀어내기) */
const outlineDisplayMode = ref(saved.outlineDisplayMode ?? 'overlay')

const selectedModelCapabilities = computed(() => {
  const name = selectedModel.value
  return name ? (modelCapabilities.value[name] || []) : []
})

function setModelCapabilities(capabilitiesMap) {
  modelCapabilities.value = { ...modelCapabilities.value, ...capabilitiesMap }
}

watch(
  [selectedModel, chatMode, chatInputMaxRows, chatFontSize, chatMessageMaxLength, webcamFlipMode, webcamResolution, webcamFilterBrightness, webcamFilterContrast, webcamFilterSaturate, webcamFilterGrayscale, titleSuggestionMinTurns, titleSuggestionMaxTurnsForContext, outlineEnabled, outlineDisplayMode],
  () => {
    saveSettings({
      selectedModel: selectedModel.value,
      chatMode: chatMode.value,
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
      outlineEnabled: outlineEnabled.value,
      outlineDisplayMode: outlineDisplayMode.value,
    })
  },
  { deep: true }
)

export function requestAttachToChat(item) {
  if (!item?.url) return
  const caps = modelCapabilities.value[selectedModel.value] || []
  if (!caps.includes('vision')) {
    Notify.create({ type: 'warning', message: '이미지 첨부는 이미지 지원 모델을 선택한 후에 가능합니다.' })
    return
  }
  pendingAttachmentsFromGallery.value = [...pendingAttachmentsFromGallery.value, { url: item.url, original_name: item.original_name, file_path: item.file_path }]
}

export function useAiSettings() {
  return {
    selectedModel,
    chatMode,
    chatInputMaxRows,
    chatFontSize,
    chatMessageMaxLength,
    modelCapabilities,
    selectedModelCapabilities,
    setModelCapabilities,
    pendingWebcamCapture,
    pendingAttachmentsFromGallery,
    requestAttachToChat,
    webcamFlipMode,
    webcamResolution,
    webcamFilterBrightness,
    webcamFilterContrast,
    webcamFilterSaturate,
    webcamFilterGrayscale,
    titleSuggestionMinTurns,
    titleSuggestionMaxTurnsForContext,
    outlineEnabled,
    outlineDisplayMode,
  }
}
