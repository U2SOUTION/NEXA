import { ref, computed } from 'vue'
import type { Channel, Chat } from '../types/nexiaDomainTypes'

const STORAGE_KEY = 'nexia-channels'

interface StoragePayload {
  channels?: unknown[]
  systemInstruction?: string
}

function loadFromStorage(): { channels: Channel[]; systemInstruction: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { channels: [], systemInstruction: '' }
    const data = JSON.parse(raw) as StoragePayload
    const channelsData = Array.isArray(data.channels) ? (data.channels as Channel[]) : []
    return { channels: channelsData, systemInstruction: data.systemInstruction ?? '' }
  } catch {
    return { channels: [], systemInstruction: '' }
  }
}

function saveToStorage(data: Channel[]): void {
  try {
    const payload = { channels: data, systemInstruction: systemInstructionRef.value }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch (e) {
    console.error('[useNexiaChannels] 저장 실패:', e instanceof Error ? e.message : String(e))
  }
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

const channels = ref<Channel[]>([])
const systemInstructionRef = ref('')

function init(): void {
  const { channels: saved, systemInstruction } = loadFromStorage()
  channels.value = saved.length ? saved : [{ id: genId(), name: '기본체널', chats: [] }]
  systemInstructionRef.value = systemInstruction || ''
}

function addChannel(name?: string): Channel {
  const ch: Channel = { id: genId(), name: name || '새 채널', chats: [] }
  channels.value.push(ch)
  saveToStorage(channels.value)
  return ch
}

function deleteChannel(channelId: string): void {
  channels.value = channels.value.filter((c) => c.id !== channelId)
  saveToStorage(channels.value)
  if (selectedChannelId.value === channelId) {
    selectedChannelId.value = channels.value[0]?.id ?? null
  }
}

function updateChannelName(channelId: string, name?: string): void {
  const ch = channels.value.find((c) => c.id === channelId)
  if (ch && name?.trim()) {
    ch.name = name.trim()
    saveToStorage(channels.value)
  }
}

function moveChannelUp(channelId: string): void {
  const idx = channels.value.findIndex((c) => c.id === channelId)
  if (idx <= 0) return
  const arr = [...channels.value]
  ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
  channels.value = arr
  saveToStorage(channels.value)
}

function moveChannelDown(channelId: string): void {
  const idx = channels.value.findIndex((c) => c.id === channelId)
  if (idx < 0 || idx >= channels.value.length - 1) return
  const arr = [...channels.value]
  ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
  channels.value = arr
  saveToStorage(channels.value)
}

function moveChatUp(channelId: string, chatId: string): void {
  const ch = channels.value.find((c) => c.id === channelId)
  if (!ch?.chats?.length) return
  const idx = ch.chats.findIndex((c) => c.id === chatId)
  if (idx <= 0) return
  const arr = [...ch.chats]
  ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
  ch.chats = arr
  saveToStorage(channels.value)
}

function moveChatDown(channelId: string, chatId: string): void {
  const ch = channels.value.find((c) => c.id === channelId)
  if (!ch?.chats?.length) return
  const idx = ch.chats.findIndex((c) => c.id === chatId)
  if (idx < 0 || idx >= ch.chats.length - 1) return
  const arr = [...ch.chats]
  ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
  ch.chats = arr
  saveToStorage(channels.value)
}

function addChat(channelId: string, title?: string): Chat | null {
  const ch = channels.value.find((c) => c.id === channelId)
  if (!ch) return null
  const chat: Chat = { id: genId(), title: title || '새 대화', messages: [] }
  ch.chats = ch.chats || []
  ch.chats.unshift(chat)
  saveToStorage(channels.value)
  return chat
}

function updateChatTitle(channelId: string, chatId: string, title?: string): void {
  const ch = channels.value.find((c) => c.id === channelId)
  const chat = ch?.chats?.find((c) => c.id === chatId)
  if (chat) {
    chat.title = title ?? ''
    saveToStorage(channels.value)
  }
}

function updateSystemInstruction(text?: string): void {
  systemInstructionRef.value = text ?? ''
  saveToStorage(channels.value)
}

function updateChannelInstruction(channelId: string, text?: string): void {
  const ch = channels.value.find((c) => c.id === channelId)
  if (ch) {
    ch.instruction = text ?? ''
    saveToStorage(channels.value)
  }
}

function updateChatInstruction(channelId: string, chatId: string, text?: string): void {
  const ch = channels.value.find((c) => c.id === channelId)
  const chat = ch?.chats?.find((c) => c.id === chatId)
  if (chat) {
    chat.instruction = text ?? ''
    saveToStorage(channels.value)
  }
}

interface UpdateChatMessagesOpts {
  skipPersist?: boolean
}

function updateChatMessages(
  channelId: string,
  chatId: string,
  messages: { role: string; content?: string; [key: string]: unknown }[],
  opts?: UpdateChatMessagesOpts,
): void {
  const ch = channels.value.find((c) => c.id === channelId)
  const chat = ch?.chats?.find((c) => c.id === chatId)
  if (chat) {
    chat.messages = messages
    if (!opts?.skipPersist) saveToStorage(channels.value)
  }
}

function deleteChat(channelId: string, chatId: string): void {
  const ch = channels.value.find((c) => c.id === channelId)
  if (!ch?.chats) return
  ch.chats = ch.chats.filter((c) => c.id !== chatId)
  clearPendingTitleSuggestion(channelId, chatId)
  saveToStorage(channels.value)
  if (selectedChatId.value === chatId) {
    selectedChatId.value = null
  }
}

const selectedChannelId = ref<string | null>(null)
const selectedChatId = ref<string | null>(null)
const pendingTitleSuggestions = ref<Map<string, string>>(new Map())
const searchQuery = ref('')
const searchTarget = ref<string>('both')

const selectedChannel = computed(() => channels.value.find((c) => c.id === selectedChannelId.value))
const selectedChat = computed(() => {
  const ch = selectedChannel.value
  return ch?.chats?.find((c) => c.id === selectedChatId.value)
})

/** 채팅 답변 형식 규칙: HTML 대신 마크다운만 사용 */
const MARKDOWN_ONLY_RULE = `Markdown only. No HTML.`

function getEffectiveInstruction(): string {
  const parts = [
    MARKDOWN_ONLY_RULE,
    systemInstructionRef.value?.trim(),
    selectedChannel.value?.instruction?.trim(),
    selectedChat.value?.instruction?.trim(),
  ].filter(Boolean)
  return parts.join('\n')
}

function selectChannel(id: string | null): void {
  selectedChannelId.value = id
  selectedChatId.value = null
}

function selectChat(id: string | null): void {
  selectedChatId.value = id
}

function startNewChat(): void {
  selectedChatId.value = null
}

function _pendingKey(channelId: string, chatId: string): string {
  return `${channelId}:${chatId}`
}

function setPendingTitleSuggestion(channelId: string, chatId: string, title?: string): void {
  const next = new Map(pendingTitleSuggestions.value)
  next.set(_pendingKey(channelId, chatId), title ?? '')
  pendingTitleSuggestions.value = next
}

function clearPendingTitleSuggestion(channelId: string, chatId: string): void {
  const next = new Map(pendingTitleSuggestions.value)
  next.delete(_pendingKey(channelId, chatId))
  pendingTitleSuggestions.value = next
}

function getPendingTitleSuggestion(channelId: string, chatId: string): string | null {
  return pendingTitleSuggestions.value.get(_pendingKey(channelId, chatId)) ?? null
}

const showSearchResults = computed(() => (searchQuery.value || '').trim().length > 0)

interface SearchGroup {
  channel: Channel
  chats: Chat[]
}

const searchResults = computed<SearchGroup[]>(() => {
  const q = (searchQuery.value || '').trim().toLowerCase()
  if (!q) return []
  const target = searchTarget.value || 'both'
  const grouped: SearchGroup[] = []
  for (const ch of channels.value) {
    let includeChannel = false
    let matchingChats: Chat[] = []
    if (target === 'channel' || target === 'both') {
      if ((ch.name || '').toLowerCase().includes(q)) includeChannel = true
    }
    if (target === 'chat' || target === 'both') {
      matchingChats = (ch.chats || []).filter((chat) =>
        (chat.title || '').toLowerCase().includes(q),
      )
      if (matchingChats.length > 0) includeChannel = true
    }
    if (includeChannel) {
      const chatsToShow = target === 'channel' ? ch.chats || [] : matchingChats
      grouped.push({ channel: ch, chats: chatsToShow })
    }
  }
  return grouped
})

export function useNexiaChannels() {
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
