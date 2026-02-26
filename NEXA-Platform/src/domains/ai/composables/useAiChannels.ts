import { ref, computed } from 'vue'

const STORAGE_KEY = 'nexa-ai-channels'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { channels: [], systemInstruction: '' }
    const data = JSON.parse(raw)
    const channelsData = Array.isArray(data.channels) ? data.channels : []
    return { channels: channelsData, systemInstruction: data.systemInstruction ?? '' }
  } catch {
    return { channels: [], systemInstruction: '' }
  }
}

function saveToStorage(data) {
  try {
    const payload = { channels: data, systemInstruction: systemInstructionRef.value }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch (e) {
    console.error('[useAiChannels] 저장 실패:', e)
  }
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

const channels = ref([])
const systemInstructionRef = ref('')

function init() {
  const { channels: saved, systemInstruction } = loadFromStorage()
  channels.value = saved.length ? saved : [{ id: genId(), name: '기본체널', chats: [] }]
  systemInstructionRef.value = systemInstruction || ''
}

function addChannel(name) {
  const ch = { id: genId(), name: name || '새 채널', chats: [] }
  channels.value.push(ch)
  saveToStorage(channels.value)
  return ch
}

function deleteChannel(channelId) {
  channels.value = channels.value.filter((c) => c.id !== channelId)
  saveToStorage(channels.value)
  if (selectedChannelId.value === channelId) {
    selectedChannelId.value = channels.value[0]?.id || null
  }
}

function updateChannelName(channelId, name) {
  const ch = channels.value.find((c) => c.id === channelId)
  if (ch && name?.trim()) {
    ch.name = name.trim()
    saveToStorage(channels.value)
  }
}

function moveChannelUp(channelId) {
  const idx = channels.value.findIndex((c) => c.id === channelId)
  if (idx <= 0) return
  const arr = [...channels.value]
  ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
  channels.value = arr
  saveToStorage(channels.value)
}

function moveChannelDown(channelId) {
  const idx = channels.value.findIndex((c) => c.id === channelId)
  if (idx < 0 || idx >= channels.value.length - 1) return
  const arr = [...channels.value]
  ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
  channels.value = arr
  saveToStorage(channels.value)
}

function moveChatUp(channelId, chatId) {
  const ch = channels.value.find((c) => c.id === channelId)
  if (!ch?.chats?.length) return
  const idx = ch.chats.findIndex((c) => c.id === chatId)
  if (idx <= 0) return
  const arr = [...ch.chats]
  ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
  ch.chats = arr
  saveToStorage(channels.value)
}

function moveChatDown(channelId, chatId) {
  const ch = channels.value.find((c) => c.id === channelId)
  if (!ch?.chats?.length) return
  const idx = ch.chats.findIndex((c) => c.id === chatId)
  if (idx < 0 || idx >= ch.chats.length - 1) return
  const arr = [...ch.chats]
  ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
  ch.chats = arr
  saveToStorage(channels.value)
}

function addChat(channelId, title) {
  const ch = channels.value.find((c) => c.id === channelId)
  if (!ch) return null
  const chat = { id: genId(), title: title || '새 대화', messages: [] }
  ch.chats = ch.chats || []
  ch.chats.unshift(chat)
  saveToStorage(channels.value)
  return chat
}

function updateChatTitle(channelId, chatId, title) {
  const ch = channels.value.find((c) => c.id === channelId)
  const chat = ch?.chats?.find((c) => c.id === chatId)
  if (chat) {
    chat.title = title
    saveToStorage(channels.value)
  }
}

function updateSystemInstruction(text) {
  systemInstructionRef.value = text ?? ''
  saveToStorage(channels.value)
}

function updateChannelInstruction(channelId, text) {
  const ch = channels.value.find((c) => c.id === channelId)
  if (ch) {
    ch.instruction = text ?? ''
    saveToStorage(channels.value)
  }
}

function updateChatInstruction(channelId, chatId, text) {
  const ch = channels.value.find((c) => c.id === channelId)
  const chat = ch?.chats?.find((c) => c.id === chatId)
  if (chat) {
    chat.instruction = text ?? ''
    saveToStorage(channels.value)
  }
}

/**
 * @param {string} channelId
 * @param {string} chatId
 * @param {Array} messages
 * @param {{ skipPersist?: boolean }} [opts] - skipPersist: true면 localStorage 저장 생략 (스트리밍 중 UI만 갱신)
 */
function updateChatMessages(channelId, chatId, messages, opts) {
  const ch = channels.value.find((c) => c.id === channelId)
  const chat = ch?.chats?.find((c) => c.id === chatId)
  if (chat) {
    chat.messages = messages
    if (!opts?.skipPersist) saveToStorage(channels.value)
  }
}

function deleteChat(channelId, chatId) {
  const ch = channels.value.find((c) => c.id === channelId)
  if (!ch?.chats) return
  ch.chats = ch.chats.filter((c) => c.id !== chatId)
  clearPendingTitleSuggestion(channelId, chatId)
  saveToStorage(channels.value)
  if (selectedChatId.value === chatId) {
    selectedChatId.value = null
  }
}

const selectedChannelId = ref(null)
const selectedChatId = ref(null)
const pendingTitleSuggestions = ref(new Map())
const searchQuery = ref('')
const searchTarget = ref('both')

const selectedChannel = computed(() => channels.value.find((c) => c.id === selectedChannelId.value))
const selectedChat = computed(() => {
  const ch = selectedChannel.value
  return ch?.chats?.find((c) => c.id === selectedChatId.value)
})

/** 채팅 답변 형식 규칙: HTML 대신 마크다운만 사용 */
//const MARKDOWN_ONLY_RULE = `답변 형식: 마크다운 문법만 사용하세요. HTML 태그(<hr>, <h2>, <div>, <table> 등)는 사용하지 마세요. 제목은 ##, 수평선은 ---, 표는 | 열 | 형식으로 작성하세요.`
//최상위 룰을 마크다운 형식 권장과 HTML 금지 하여 마크다운 파싱 편리 하도록 수정
const MARKDOWN_ONLY_RULE = `Markdown only. No HTML.`

function getEffectiveInstruction() {
  const parts = [MARKDOWN_ONLY_RULE, systemInstructionRef.value?.trim(), selectedChannel.value?.instruction?.trim(), selectedChat.value?.instruction?.trim()].filter(Boolean)
  return parts.join('\n')
}

function selectChannel(id) {
  selectedChannelId.value = id
  selectedChatId.value = null
}

function selectChat(id) {
  selectedChatId.value = id
}

function startNewChat() {
  selectedChatId.value = null
}

function _pendingKey(channelId, chatId) {
  return `${channelId}:${chatId}`
}

function setPendingTitleSuggestion(channelId, chatId, title) {
  const next = new Map(pendingTitleSuggestions.value)
  next.set(_pendingKey(channelId, chatId), title ?? '')
  pendingTitleSuggestions.value = next
}

function clearPendingTitleSuggestion(channelId, chatId) {
  const next = new Map(pendingTitleSuggestions.value)
  next.delete(_pendingKey(channelId, chatId))
  pendingTitleSuggestions.value = next
}

function getPendingTitleSuggestion(channelId, chatId) {
  return pendingTitleSuggestions.value.get(_pendingKey(channelId, chatId)) ?? null
}

const showSearchResults = computed(() => (searchQuery.value || '').trim().length > 0)

const searchResults = computed(() => {
  const q = (searchQuery.value || '').trim().toLowerCase()
  if (!q) return []
  const target = searchTarget.value || 'both'
  const grouped = []
  for (const ch of channels.value) {
    let includeChannel = false
    let matchingChats = []
    if (target === 'channel' || target === 'both') {
      if ((ch.name || '').toLowerCase().includes(q)) includeChannel = true
    }
    if (target === 'chat' || target === 'both') {
      matchingChats = (ch.chats || []).filter((chat) => (chat.title || '').toLowerCase().includes(q))
      if (matchingChats.length > 0) includeChannel = true
    }
    if (includeChannel) {
      const chatsToShow = target === 'channel' ? ch.chats || [] : matchingChats
      grouped.push({ channel: ch, chats: chatsToShow })
    }
  }
  return grouped
})

export function useAiChannels() {
  if (channels.value.length === 0) init()
  return {
    channels,
    selectedChannelId,
    selectedChatId,
    selectedChannel,
    selectedChat,
    systemInstruction: systemInstructionRef,
    getEffectiveInstruction,
    updateSystemInstruction,
    updateChannelInstruction,
    updateChatInstruction,
    searchQuery,
    searchTarget,
    searchResults,
    showSearchResults,
    init,
    addChannel,
    deleteChannel,
    updateChannelName,
    moveChannelUp,
    moveChannelDown,
    moveChatUp,
    moveChatDown,
    addChat,
    updateChatTitle,
    updateChatMessages,
    deleteChat,
    pendingTitleSuggestions,
    setPendingTitleSuggestion,
    clearPendingTitleSuggestion,
    getPendingTitleSuggestion,
    selectChannel,
    selectChat,
    startNewChat,
  }
}
