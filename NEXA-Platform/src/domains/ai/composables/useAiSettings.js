import { ref, watch } from 'vue'

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

watch(
  [selectedModel, chatInputMaxRows, chatFontSize, chatMessageMaxLength],
  () => {
    saveSettings({
      selectedModel: selectedModel.value,
      chatInputMaxRows: chatInputMaxRows.value,
      chatFontSize: chatFontSize.value,
      chatMessageMaxLength: chatMessageMaxLength.value,
    })
  },
  { deep: true }
)

export function useAiSettings() {
  return { selectedModel, chatInputMaxRows, chatFontSize, chatMessageMaxLength }
}
