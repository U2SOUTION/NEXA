import { ref, computed } from 'vue'

const STORAGE_KEY = 'nexa-ai-channels'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { channels: [] }
    const data = JSON.parse(raw)
    return Array.isArray(data.channels) ? data : { channels: [] }
  } catch {
    return { channels: [] }
  }
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ channels: data }))
  } catch (e) {
    console.error('[useAiChannels] 저장 실패:', e)
  }
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

const channels = ref([])

function init() {
  const { channels: saved } = loadFromStorage()
  channels.value = saved.length ? saved : [{ id: genId(), name: '기본체널', chats: [] }]
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

function updateChatMessages(channelId, chatId, messages) {
  const ch = channels.value.find((c) => c.id === channelId)
  const chat = ch?.chats?.find((c) => c.id === chatId)
  if (chat) {
    chat.messages = messages
    saveToStorage(channels.value)
  }
}

function deleteChat(channelId, chatId) {
  const ch = channels.value.find((c) => c.id === channelId)
  if (!ch?.chats) return
  ch.chats = ch.chats.filter((c) => c.id !== chatId)
  saveToStorage(channels.value)
  if (selectedChatId.value === chatId) {
    selectedChatId.value = null
  }
}

const selectedChannelId = ref(null)
const selectedChatId = ref(null)

const selectedChannel = computed(() => channels.value.find((c) => c.id === selectedChannelId.value))
const selectedChat = computed(() => {
  const ch = selectedChannel.value
  return ch?.chats?.find((c) => c.id === selectedChatId.value)
})

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

export function useAiChannels() {
  if (channels.value.length === 0) init()
  return {
    channels,
    selectedChannelId,
    selectedChatId,
    selectedChannel,
    selectedChat,
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
    selectChannel,
    selectChat,
    startNewChat,
  }
}
