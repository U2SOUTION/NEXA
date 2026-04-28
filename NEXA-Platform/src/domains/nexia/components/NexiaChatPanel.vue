<template>
  <div class="nexia-chat-panel column no-wrap">
    <div v-if="!selectedChannelId" class="empty-state text-center q-pa-xl text-grey-7">
      <q-icon name="folder_open" size="64px" class="q-mb-md" />
      <div class="text-h6 q-mb-sm">채널을 선택하세요</div>
      <div class="text-body2">왼쪽에서 채널을 선택하거나 새 채널을 만드세요.</div>
    </div>

    <template v-else>
      <div class="chat-main row no-wrap" :class="{ 'chat-main--with-outline': outlineEnabled }">
        <div class="chat-body column col">
          <div class="chat-messages col scroll" ref="messagesRef">
            <template v-if="messages.length === 0">
              <div class="empty-state-welcome-wrapper">
                <div class="empty-state-welcome q-pa-lg text-center">
                  <div class="welcome-main-title q-mb-lg">NEXA NEXIA Platform</div>
                  <div class="welcome-header q-mb-lg">
                    <q-icon name="smart_toy" size="72px" class="q-mb-sm" />
                    <div class="text-h6 q-mb-xs">AI와 대화를 시작해 보세요</div>
                    <div class="text-body2 text-grey-7">메시지를 입력하고 Enter를 누르면 AI가 답변합니다.</div>
                    <div class="text-body2 text-grey-7">Ctrl + Enter를 누르면 새 줄을 추가합니다.</div>
                  </div>
                  <div class="welcome-guide q-mb-lg">
                    <div class="text-subtitle2 q-mb-sm">안내</div>
                    <ul class="welcome-guide-list text-body2 text-grey-7">
                      <li>첫 메시지가 대화 제목으로 저장됩니다</li>
                      <li>질문이나 요청을 자연스럽게 입력하세요</li>
                      <li v-if="supportsVision">이미지를 첨부해 분석을 요청할 수 있습니다</li>
                      <li v-if="supportsAudio && speechSupported">음성 지원 모델: 입력창 마이크로 말하기 → 텍스트로 입력됩니다</li>
                    </ul>
                  </div>
                  <div class="example-prompts">
                    <div class="text-caption text-grey-6 q-mb-sm">예시:</div>
                    <div class="example-prompts-buttons">
                      <q-btn outline dense size="sm" label="오늘 날씨에 대해 알려줘" @click="fillExample('오늘 날씨에 대해 알려줘')" />
                      <q-btn outline dense size="sm" label="코드 리뷰 해줘" @click="fillExample('코드 리뷰 해줘')" />
                      <q-btn v-if="supportsVision" outline dense size="sm" label="이 이미지를 분석해줘" @click="fillExample('이 이미지를 분석해줘')" />
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="q-pa-md chat-messages-inner" :style="{ '--chat-font-size': `${chatFontSize ?? 16}px` }">
              <div v-for="(msg, idx) in messages" :key="idx" :class="['message-row', msg.role]" :data-msg-idx="idx">
                <div class="message-bubble" :class="{ 'message-bubble--contextable': msg.role === 'assistant' && msg.content?.trim() }">
                  <div v-if="msg.images?.length" class="msg-images row q-gutter-xs q-mb-sm">
                    <img v-for="(img, i) in msg.images" :key="i" :src="typeof img === 'string' && img.startsWith('data:') ? img : `data:image/png;base64,${img}`" alt="" class="msg-image-thumb" />
                  </div>
                  <template v-if="msg.content">
                    <div v-if="msg.role === 'assistant'" class="markdown-content chat-markdown" v-html="parseMarkdown(msg.content, '', {})"></div>
                    <span v-else>{{ msg.content }}</span>
                  </template>
                </div>
              </div>
              <div v-if="isLoading" class="message-row assistant">
                <div class="message-bubble message-loading">
                  <q-spinner-dots color="primary" size="28px" />
                  <span class="loading-text">응답을 기다리는 중...</span>
                </div>
              </div>
            </div>
          </div>

          <div class="chat-input q-pa-md flex-shrink">
            <div v-if="supportsVision && attachedImages.length > 0" class="attached-images row q-gutter-xs q-mb-sm">
              <div v-for="(img, i) in attachedImages" :key="i" class="attached-image-thumb">
                <img :src="img.dataUrl || getUploadDisplayUrl(img.file_path) || img.url" alt="첨부" />
                <q-btn round dense flat size="sm" icon="close" class="thumb-remove" @click="removeAttachedImage(i)" />
              </div>
            </div>
            <input v-if="supportsVision" ref="fileInputRef" type="file" accept="image/png,image/jpeg,image/jpg" class="hidden" @change="handleFileSelect" />
            <div class="chat-input-row row items-end" @paste="handlePaste">
              <q-input v-model="inputText" type="textarea" outlined dense autogrow :rows="1" :placeholder="chatInputPlaceholder" class="chat-textarea" :style="{ '--chat-max-rows': Math.min(20, Math.max(2, chatInputMaxRows ?? 8)) }" @keydown.enter.exact.prevent="sendMessage">
                <template #append>
                  <q-btn v-if="supportsVision" round dense flat icon="image" title="이미지 첨부" @click="triggerFileSelect" />
                  <q-btn
                    v-if="supportsAudio"
                    round
                    dense
                    class="chat-mic-btn"
                    :class="{ 'chat-mic-btn--listening': speechListening }"
                    :flat="!speechSupported"
                    :outline="speechSupported && !speechListening"
                    :unelevated="speechListening"
                    :icon="speechListening ? 'stop_circle' : 'mic'"
                    :color="speechListening ? 'negative' : speechSupported ? 'primary' : 'grey-7'"
                    :disable="!speechSupported"
                    :aria-pressed="speechListening ? 'true' : 'false'"
                    :aria-label="speechMicTitle"
                    :title="speechMicTitle"
                    @click="onSpeechMicClick"
                  />
                  <q-btn round dense flat icon="send" :disable="!canSend" @click="sendMessage" />
                </template>
              </q-input>
              <q-select v-model="selectedModel" :options="models" borderless dense hide-bottom-space hide-dropdown-icon option-value="name" option-label="name" emit-value map-options class="chat-model-select chat-model-select--bare" :loading="isLoadingModels" @focus="loadModels">
                <template #selected>
                  <span v-if="selectedModel" class="model-select-trigger-icon row items-center justify-center">
                    <q-icon name="smart_toy" size="30px" class="model-select-compact-icon" :title="selectedModelDetailTitle" />
                  </span>
                  <span v-else class="model-select-trigger-icon row items-center justify-center">
                    <q-icon name="memory" size="30px" class="model-select-compact-icon" title="모델을 선택하세요" />
                  </span>
                </template>
                <template #option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ formatModelDisplayName(scope.opt.name) }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <span class="model-capability-icons">
                        <q-icon v-for="item in getCapabilityIcons(scope.opt.name)" :key="item.icon" :name="item.icon" size="16px" class="q-mr-xs" :title="item.title" />
                      </span>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
          </div>
        </div>
        <template v-if="outlineEnabled && outlineDisplayMode === 'push'">
          <div class="chat-outline chat-outline--push" :style="{ '--outline-width': `${outlinePanelWidth}px` }">
            <div class="chat-outline-header row items-center justify-between no-wrap">
              <span class="chat-outline-title">목차</span>
              <div class="chat-outline-filters row no-wrap">
                <q-btn dense flat size="sm" :label="'AI'" :color="outlineFilter === 'assistant' ? 'primary' : undefined" @click="outlineFilter = 'assistant'" />
                <q-btn dense flat size="sm" :label="'사용자'" :color="outlineFilter === 'user' ? 'primary' : undefined" @click="outlineFilter = 'user'" />
                <q-btn dense flat size="sm" :label="'모두'" :color="outlineFilter === 'all' ? 'primary' : undefined" @click="outlineFilter = 'all'" />
              </div>
            </div>
            <div class="chat-outline-list scroll">
              <div v-for="item in filteredOutlineItems" :key="item.idx" class="chat-outline-item" :class="{ 'chat-outline-item--user': item.role === 'user' }" @click="scrollToMessage(item.idx)">
                {{ item.label }}
              </div>
            </div>
          </div>
        </template>
        <div v-else-if="outlineEnabled && outlineDisplayMode === 'overlay'" class="chat-outline-overlay-wrap" :style="{ '--outline-width': `${outlinePanelWidth}px` }">
          <div class="chat-outline-trigger" @mouseenter="outlineHover = true" @mouseleave="outlineHover = false">
            <q-btn round dense flat icon="list" size="sm" :title="outlinePinned ? '목차 닫기' : '목차 열기'" @click="outlinePinned = !outlinePinned" />
          </div>
          <div v-show="outlineOverlayVisible" class="chat-outline chat-outline--overlay" @mouseenter="outlineHover = true" @mouseleave="outlineHover = false">
            <div class="chat-outline-header row items-center justify-between no-wrap">
              <div class="row items-center no-wrap">
                <span class="chat-outline-title">목차</span>
                <div class="chat-outline-filters row no-wrap q-ml-sm">
                  <q-btn dense flat size="sm" :label="'AI'" :color="outlineFilter === 'assistant' ? 'primary' : undefined" @click="outlineFilter = 'assistant'" />
                  <q-btn dense flat size="sm" :label="'사용자'" :color="outlineFilter === 'user' ? 'primary' : undefined" @click="outlineFilter = 'user'" />
                  <q-btn dense flat size="sm" :label="'모두'" :color="outlineFilter === 'all' ? 'primary' : undefined" @click="outlineFilter = 'all'" />
                </div>
              </div>
              <q-btn round dense flat icon="close" size="xs" @click="outlinePinned = false" />
            </div>
            <div class="chat-outline-list scroll">
              <div v-for="item in filteredOutlineItems" :key="item.idx" class="chat-outline-item" :class="{ 'chat-outline-item--user': item.role === 'user' }" @click="scrollToMessage(item.idx)">
                {{ item.label }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <NexiaChatMessageContextMenu
      v-model="chatMessagesCtxMenuVisible"
      :active="!!selectedChannelId"
      :anchor-x="chatMessagesCtxMenuX"
      :anchor-y="chatMessagesCtxMenuY"
      :has-text="chatCtxMenuHasText"
      :editor-available="!!aiInsertContent"
      @copy="onChatCtxCopy"
      @add-memo="onChatCtxAddMemo"
      @insert-ethos="onChatCtxInsertNarrative"
      @insert-glos="onChatCtxInsertLogic"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, inject, onMounted, onUnmounted } from 'vue'
import { Notify } from 'quasar'
import { parseMarkdown } from '@system/utils/markdown/index'
import { trySyncClipboardCopy } from '@system/utils/clipboard'
import { nexiaApi } from '../services/nexiaApi'
import { useNexiaSettings } from '../composables/useNexiaSettings'
import { useNexiaModels } from '../composables/useNexiaModels'
import { formatModelDisplayName } from '../utils/modelDisplayName'
import { extractOutlineFromMessages } from '../utils/chatOutline'
import { getUploadDisplayUrl } from '@system/utils/apiBaseUrl'
import { useNexiaChannels } from '../composables/useNexiaChannels'
import { useNexiaMemos } from '../composables/useNexiaMemos'
import { useWebSpeechRecognition } from '../composables/useWebSpeechRecognition'
import { parseVoiceClearPhraseList } from '../utils/voiceClearCommand'
import NexiaChatMessageContextMenu from './NexiaChatMessageContextMenu.vue'

const aiInsertContent = inject('aiInsertContent', null)
const { addMemo } = useNexiaMemos()

const {
  selectedModel,
  selectedModelCapabilities,
  chatMode,
  chatInputMaxRows,
  chatFontSize,
  chatMessageMaxLength,
  titleSuggestionMinTurns,
  titleSuggestionMaxTurnsForContext,
  pendingWebcamCapture,
  pendingAttachmentsFromGallery,
  modelCapabilities,
  outlineEnabled,
  outlineDisplayMode,
  outlinePanelWidth,
  voiceClearConversationPhrases,
  voiceClearConversationDelayMs,
} = useNexiaSettings()
const { models, isLoadingModels, loadModels } = useNexiaModels()

const supportsVision = computed(() => (selectedModelCapabilities.value || []).includes('vision'))
const supportsAudio = computed(() => (selectedModelCapabilities.value || []).includes('audio'))

const {
  isListening: speechListening,
  isSupported: speechSupported,
  lastError: speechLastError,
  startDictation: startSpeechDictation,
  stop: stopSpeech,
} = useWebSpeechRecognition({
  lang: 'ko-KR',
  getVoiceClearOptions: () => ({
    phrases: parseVoiceClearPhraseList(voiceClearConversationPhrases.value),
    delayMs: voiceClearConversationDelayMs.value,
  }),
})

const speechMicTitle = computed(() => {
  if (!speechSupported.value) return '이 브라우저는 음성 입력(Web Speech)을 지원하지 않습니다'
  if (speechListening.value) return '[녹음 중] 클릭하여 중지 · 입력이 있으면 바로 전송 · 음성으로 「취소」만 말하면 이 채팅 대화 전체 삭제(타이핑 제외) · Ctrl+왼쪽 Shift'
  return '[대기] 음성 입력 시작 — 클릭 후 말하기 (마이크 권한 필요) · Ctrl+왼쪽 Shift'
})

function onSpeechMicClick() {
  if (!supportsAudio.value) return
  if (!speechSupported.value) {
    Notify.create({ type: 'warning', message: '이 브라우저는 음성 입력(Web Speech API)을 지원하지 않습니다.' })
    return
  }
  if (speechListening.value) {
    stopSpeech(() => {
      nextTick(() => trySendAfterMicStop())
    })
    return
  }
  startSpeechDictation(inputText, undefined, handleVoiceCancelConversation)
}

/** 마이크 토글 단축키 — Ctrl+왼쪽 Shift 나중에 전역 설정에 추가할 것(GlobalSettings.vue) */
function onNexiaMicToggleShortcut(event) {
  if (!event.ctrlKey || event.code !== 'ShiftLeft' || event.metaKey || event.altKey || event.repeat) return
  if (!selectedChannelId.value) return
  if (!supportsAudio.value || !speechSupported.value) return
  event.preventDefault()
  event.stopPropagation()
  onSpeechMicClick()
}

watch(speechLastError, (err) => {
  if (!err || err === 'aborted') return
  const messages = {
    'not-allowed': '마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크를 허용해 주세요.',
    'service-not-allowed': '음성 인식 서비스를 사용할 수 없습니다.',
    'audio-capture': '마이크에 접근할 수 없습니다.',
    network: '네트워크 오류로 음성 인식에 실패했습니다.',
    unsupported: '이 브라우저는 음성 입력을 지원하지 않습니다.',
    start_failed: '음성 입력을 시작할 수 없습니다.',
  }
  const msg = messages[err] || `음성 인식 오류: ${err}`
  Notify.create({ type: err === 'no-speech' ? 'info' : 'warning', message: msg })
})

const CAPABILITY_ICONS = {
  completion: { icon: 'chat_bubble', title: '채팅' },
  vision: { icon: 'image', title: '이미지 지원' },
  audio: { icon: 'mic', title: '음성 지원' },
}
function getCapabilityIcons(modelName) {
  const caps = modelCapabilities.value?.[modelName] ?? []
  if (caps.length === 0) return [CAPABILITY_ICONS.completion]
  const order = ['completion', 'vision', 'audio']
  return order.filter((k) => caps.includes(k)).map((k) => CAPABILITY_ICONS[k])
}

const selectedModelDetailTitle = computed(() => {
  const m = selectedModel.value
  if (!m) return '모델 선택'
  const label = formatModelDisplayName(m)
  const parts = getCapabilityIcons(m).map((x) => x.title)
  return parts.length ? `${label} — ${parts.join(' · ')}` : label
})

const { selectedChannelId, selectedChatId, selectedChat, getEffectiveInstruction, addChat, updateChatTitle, updateChatMessages, selectChat, setPendingTitleSuggestion, getPendingTitleSuggestion } = useNexiaChannels()

const messages = ref([])
const inputText = ref('')

/** 음성 인식으로만 처리 — 타이핑한 '취소'는 일반 메시지로 전송됨 */
function handleVoiceCancelConversation() {
  const channelId = selectedChannelId.value
  const chatId = selectedChatId.value
  if (!channelId || !chatId) return
  messages.value = []
  updateChatMessages(channelId, chatId, [])
  Notify.create({ type: 'info', message: '음성 명령으로 이 채팅의 대화가 모두 삭제되었습니다.' })
}

const baseInputPlaceholder = computed(() => {
  const v = supportsVision.value
  const a = supportsAudio.value && speechSupported.value
  if (v && a) return '메시지 입력... (이미지 붙여넣기·마이크 음성 가능, Enter 전송)'
  if (v) return '메시지 입력... (이미지 붙여넣기 가능, Enter 전송)'
  if (a) return '메시지 입력... (마이크 음성 가능, Enter 전송)'
  return '메시지 입력... (Enter 전송, Shift+Enter 새 줄)'
})

/** 음성 인식 중이고 아직 글자가 없을 때 — 실시간 텍스트가 나오면 일반 플레이스홀더 */
const chatInputPlaceholder = computed(() => {
  if (speechListening.value && !(inputText.value || '').trim()) {
    return '듣는 중...'
  }
  return baseInputPlaceholder.value
})

const attachedImages = ref([])
const isLoading = ref(false)
const messagesRef = ref(null)
const fileInputRef = ref(null)

const chatMessagesCtxMenuVisible = ref(false)
const chatMessagesCtxMenuX = ref(0)
const chatMessagesCtxMenuY = ref(0)
/** 우클릭 시점의 메시지 본문(마크다운 원문 또는 사용자 입력 텍스트) */
const chatCtxTargetText = ref('')

const chatCtxMenuHasText = computed(() => !!(chatCtxTargetText.value || '').trim())

function resolveChatContextTargetFromEvent(ev) {
  const root = messagesRef.value
  const t = ev.target
  if (!root || !(t instanceof Element) || !root.contains(t)) return null
  const row = t.closest('[data-msg-idx]')
  if (!row || !root.contains(row)) return null
  const raw = row.getAttribute('data-msg-idx')
  const idx = raw === null || raw === '' ? NaN : Number(raw)
  if (!Number.isFinite(idx) || idx < 0 || idx >= messages.value.length) return null
  const msg = messages.value[idx]
  const text = (msg?.content ?? '').trim()
  if (!text) return null
  return text
}

/** document 캡처 + messagesRef.contains — 마크다운 등 내부 노드에서도 안정적으로 수신 */
function onDocumentContextmenuChat(ev) {
  if (ev.type !== 'contextmenu') return
  const root = messagesRef.value
  const t = ev.target
  if (!root || !(t instanceof Node) || !root.contains(t)) return
  const targetText = resolveChatContextTargetFromEvent(ev)
  if (targetText === null) return
  chatCtxTargetText.value = targetText
  chatMessagesCtxMenuX.value = ev.clientX ?? 0
  chatMessagesCtxMenuY.value = ev.clientY ?? 0
  ev.preventDefault()
  ev.stopPropagation()
  void nextTick(() => {
    chatMessagesCtxMenuVisible.value = true
  })
}

/**
 * 컨텍스트 메뉴 복사: await/writeText 제스처 끊김을 피하려고 동기 execCommand를 먼저 쓰고,
 * 실패 시에만 Clipboard API를 then으로 이어 붙인다(메뉴는 writeText 완료 후 닫음).
 */
function onChatCtxCopy() {
  const text = (chatCtxTargetText.value || '').trim()
  if (!text) return

  if (trySyncClipboardCopy(text)) {
    Notify.create({ message: '클립보드에 복사되었습니다.', icon: 'content_copy' })
    chatMessagesCtxMenuVisible.value = false
    return
  }

  const clip = navigator.clipboard
  if (clip?.writeText) {
    clip
      .writeText(text)
      .then(() => {
        Notify.create({ message: '클립보드에 복사되었습니다.', icon: 'content_copy' })
      })
      .catch(() => {
        Notify.create({ type: 'negative', message: '복사에 실패했습니다.' })
      })
      .finally(() => {
        chatMessagesCtxMenuVisible.value = false
      })
    return
  }

  Notify.create({ type: 'negative', message: '복사에 실패했습니다.' })
  chatMessagesCtxMenuVisible.value = false
}

async function onChatCtxAddMemo() {
  const text = (chatCtxTargetText.value || '').trim()
  if (!text) return
  try {
    await addMemo(text, 'chat', selectedChannelId.value, selectedChatId.value)
    Notify.create({ message: '메모에 추가되었습니다.', icon: 'sticky_note_2' })
  } catch (e) {
    Notify.create({ type: 'negative', message: e?.message || '메모 추가 실패' })
  }
}

function onChatCtxInsertNarrative() {
  if (!aiInsertContent) return
  const text = (chatCtxTargetText.value || '').trim()
  if (!text) return
  const html = parseMarkdown(text, '', {})
  aiInsertContent.setCenterTab('narrative')
  nextTick(() => {
    aiInsertContent.pendingInsertContent.value = html
  })
  Notify.create({ message: 'Ethos(에토스) 탭에 삽입되었습니다.', icon: 'edit_note' })
}

function onChatCtxInsertLogic() {
  if (!aiInsertContent) return
  const text = (chatCtxTargetText.value || '').trim()
  if (!text) return
  aiInsertContent.setCenterTab('logic')
  nextTick(() => {
    aiInsertContent.pendingCodeInsertContent.value = text
  })
  Notify.create({ message: 'Glos(글로스) 탭에 삽입되었습니다.', icon: 'code' })
}

function attachChatMessagesContextmenuDocumentListener() {
  detachChatMessagesContextmenuDocumentListener()
  document.addEventListener('contextmenu', onDocumentContextmenuChat, true)
}

function detachChatMessagesContextmenuDocumentListener() {
  document.removeEventListener('contextmenu', onDocumentContextmenuChat, true)
}

onMounted(() => {
  window.addEventListener('keydown', onNexiaMicToggleShortcut, true)
  attachChatMessagesContextmenuDocumentListener()
})

onUnmounted(() => {
  window.removeEventListener('keydown', onNexiaMicToggleShortcut, true)
  detachChatMessagesContextmenuDocumentListener()
})

const outlineHover = ref(false)
const outlinePinned = ref(false)

const outlineFilter = ref('all')
const outlineItems = computed(() => extractOutlineFromMessages(messages.value))
const filteredOutlineItems = computed(() => {
  const items = outlineItems.value
  if (outlineFilter.value === 'all') return items
  return items.filter((item) => item.role === outlineFilter.value)
})
const outlineOverlayVisible = computed(() => outlineHover.value || outlinePinned.value)

function scrollToMessage(idx) {
  const container = messagesRef.value
  if (!container) return
  const el = container.querySelector(`[data-msg-idx="${idx}"]`)
  if (!el) return
  const containerRect = container.getBoundingClientRect()
  const elRect = el.getBoundingClientRect()
  const targetTop = Math.max(0, container.scrollTop + (elRect.top - containerRect.top) - 8)
  const startTop = container.scrollTop
  const distance = targetTop - startTop
  if (Math.abs(distance) < 2) return
  const duration = 350
  const startTime = performance.now()

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  function animate() {
    const elapsed = performance.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    container.scrollTop = startTop + distance * easeInOutCubic(progress)
    if (progress < 1) requestAnimationFrame(animate)
  }
  requestAnimationFrame(animate)
}

const TITLE_MAX_LEN = 40
const MAX_ATTACHED_IMAGES = 4

const canSend = computed(() => {
  const hasText = (inputText.value || '').trim().length > 0
  const hasImages = supportsVision.value && attachedImages.value.length > 0
  if (supportsVision.value) return hasText || hasImages
  return hasText
})

/** 마이크 해제 시 글/이미지가 있으면 곧바로 전송 */
function trySendAfterMicStop() {
  if (isLoading.value) return
  if (!canSend.value) return
  void sendMessage()
}

function truncateTitle(text) {
  const t = (text || '').trim()
  if (t.length <= TITLE_MAX_LEN) return t
  return t.slice(0, TITLE_MAX_LEN) + '...'
}

function formatDialogueExcerpt(msgs, maxTurns) {
  const pairs = []
  for (let i = 0; i < msgs.length - 1; i++) {
    if (msgs[i].role === 'user' && msgs[i + 1].role === 'assistant') {
      pairs.push({
        user: (msgs[i].content ?? '').trim(),
        assistant: (msgs[i + 1].content ?? '').trim(),
      })
      i++ // skip assistant
    }
  }
  const recent = pairs.slice(-maxTurns)
  return recent.map((p) => `사용자: ${p.user}\n\nAI: ${p.assistant}`).join('\n\n')
}

function triggerFileSelect() {
  fileInputRef.value?.click()
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function urlToDataUrl(url) {
  const res = await fetch(url, { mode: 'cors' })
  if (!res.ok) throw new Error(`이미지 로드 실패 (${res.status})`)
  const blob = await res.blob()
  if (!blob.type?.startsWith('image/')) {
    throw new Error('이미지 형식이 아닙니다.')
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function dataUrlToBase64(dataUrl) {
  const idx = dataUrl.indexOf(',')
  return idx >= 0 ? dataUrl.slice(idx + 1) : ''
}

async function handleFileSelect(ev) {
  const files = ev?.target?.files
  if (!files?.length || !supportsVision.value) return
  const allowed = ['image/png', 'image/jpeg', 'image/jpg']
  for (let i = 0; i < files.length && attachedImages.value.length < MAX_ATTACHED_IMAGES; i++) {
    const f = files[i]
    if (!allowed.includes(f.type)) continue
    try {
      const dataUrl = await fileToDataUrl(f)
      attachedImages.value.push({ dataUrl })
    } catch {
      Notify.create({ type: 'negative', message: '이미지 읽기 실패' })
    }
  }
  ev.target.value = ''
  if (attachedImages.value.length >= MAX_ATTACHED_IMAGES) {
    Notify.create({ type: 'info', message: `최대 ${MAX_ATTACHED_IMAGES}장까지 첨부할 수 있습니다.` })
  }
}

function handlePaste(ev) {
  const items = ev?.clipboardData?.items
  if (!items?.length) return
  for (const item of items) {
    if (item.kind !== 'file' || !item.type.startsWith('image/')) continue
    if (!supportsVision.value || attachedImages.value.length >= MAX_ATTACHED_IMAGES) return
    const file = item.getAsFile()
    if (!file || !/^(image\/png|image\/jpe?g)$/i.test(file.type)) continue
    ev.preventDefault()
    fileToDataUrl(file)
      .then((dataUrl) => {
        if (attachedImages.value.length < MAX_ATTACHED_IMAGES) {
          attachedImages.value.push({ dataUrl })
        }
      })
      .catch(() => {
        Notify.create({ type: 'negative', message: '붙여넣기 이미지 읽기 실패' })
      })
    return
  }
}

function removeAttachedImage(index) {
  attachedImages.value = attachedImages.value.filter((_, i) => i !== index)
}

// 갤러리/웹서버에서 선택한 이미지를 채팅에 첨부 (URL 직접 사용 → 썸네일 액박 방지, 전송 시 base64 변환)
watch(
  pendingAttachmentsFromGallery,
  (items) => {
    if (!items?.length || !supportsVision.value) return
    for (const item of items) {
      if (attachedImages.value.length >= MAX_ATTACHED_IMAGES) {
        Notify.create({ type: 'info', message: `최대 ${MAX_ATTACHED_IMAGES}장까지 첨부할 수 있습니다.` })
        break
      }
      attachedImages.value.push({ url: item.url, original_name: item.original_name, file_path: item.file_path })
      Notify.create({ message: `"${item.original_name || '이미지'}" 첨부됨`, icon: 'add_photo_alternate' })
    }
    pendingAttachmentsFromGallery.value = []
  },
  { deep: true },
)

function fillExample(text) {
  inputText.value = text || ''
}

watch(
  [selectedChannelId, selectedChatId, selectedChat],
  () => {
    const chat = selectedChat.value
    messages.value = chat?.messages?.length ? [...chat.messages] : []
  },
  { immediate: true },
)

watch(selectedChannelId, () => {
  stopSpeech()
  chatMessagesCtxMenuVisible.value = false
  chatCtxTargetText.value = ''
})

watch(
  () => pendingWebcamCapture.value,
  (dataUrl) => {
    if (!dataUrl || !supportsVision.value || attachedImages.value.length >= MAX_ATTACHED_IMAGES) return
    attachedImages.value.push({ dataUrl })
    pendingWebcamCapture.value = null
  },
)

async function sendMessage() {
  const text = (inputText.value || '').trim()
  const hasImages = supportsVision.value && attachedImages.value.length > 0
  if ((!text && !hasImages) || isLoading.value) return

  const maxLen = chatMessageMaxLength.value
  if (maxLen > 0 && text.length > maxLen) {
    Notify.create({ type: 'warning', message: `메시지가 최대 길이를 초과했습니다 (최대 ${maxLen.toLocaleString()}자)` })
    return
  }

  let channelId = selectedChannelId.value
  let chatId = selectedChatId.value
  const isNewChat = !chatId

  if (isNewChat) {
    const title = truncateTitle(text || (hasImages ? '이미지' : '새 대화'))
    const chat = addChat(channelId, title)
    if (chat) {
      chatId = chat.id
      selectChat(chatId)
    }
  } else {
    const chat = selectedChat.value
    if (chat?.messages?.length === 0) {
      updateChatTitle(channelId, chatId, truncateTitle(text || (hasImages ? '이미지' : '새 대화')))
    }
  }

  let msgImages = []
  if (hasImages) {
    try {
      msgImages = (
        await Promise.all(
          attachedImages.value.map(async (img) => {
            if (img.dataUrl) return img.dataUrl
            const fetchUrl = img.file_path ? getUploadDisplayUrl(img.file_path) : img.url
            return fetchUrl ? await urlToDataUrl(fetchUrl) : null
          }),
        )
      ).filter(Boolean)
    } catch (err) {
      Notify.create({ type: 'negative', message: err.message || '이미지 로드 실패' })
      return
    }
  }
  const userMsg = { role: 'user', content: text || (hasImages ? '(이미지)' : ''), images: hasImages ? msgImages : undefined }
  messages.value.push(userMsg)
  updateChatMessages(channelId, chatId, messages.value)
  inputText.value = ''
  attachedImages.value = []

  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })

  const apiMessages = messages.value.map((m) => {
    if (m.role !== 'user' || !m.images?.length) return m
    const base64List = m.images.map((dataUrl) => dataUrlToBase64(dataUrl)).filter(Boolean)
    return { ...m, images: base64List }
  })
  isLoading.value = true

  let shouldScrollToBottom = true
  const scrollToBottomIfNeeded = () => {
    nextTick(() => {
      if (messagesRef.value && shouldScrollToBottom) {
        messagesRef.value.scrollTop = messagesRef.value.scrollHeight
      }
    })
  }

  try {
    const instruction = getEffectiveInstruction()
    const el = messagesRef.value
    if (el) {
      const threshold = 80
      shouldScrollToBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - threshold
    }

    if (chatMode.value === 'streaming') {
      messages.value.push({ role: 'assistant', content: '' })
      updateChatMessages(channelId, chatId, messages.value)
      scrollToBottomIfNeeded()

      const content = await nexiaApi.chatStream(apiMessages, selectedModel.value, instruction || undefined, (delta) => {
        const last = messages.value[messages.value.length - 1]
        if (last?.role === 'assistant') {
          last.content += delta
          updateChatMessages(channelId, chatId, messages.value, { skipPersist: true })
          scrollToBottomIfNeeded()
        }
      })
      const last = messages.value[messages.value.length - 1]
      if (last?.role === 'assistant' && last.content !== content) {
        last.content = content
      }
      updateChatMessages(channelId, chatId, messages.value)
    } else {
      const response = await nexiaApi.chat(apiMessages, selectedModel.value, instruction || undefined)
      const content = response?.message?.content ?? response?.response ?? ''
      messages.value.push({ role: 'assistant', content })
      updateChatMessages(channelId, chatId, messages.value)
    }

    const turnCount = messages.value.filter((m) => m.role === 'user').length
    const minTurns = titleSuggestionMinTurns.value ?? 2
    const maxTurns = titleSuggestionMaxTurnsForContext.value ?? 5
    const model = selectedModel.value
    if (turnCount >= minTurns && model && !getPendingTitleSuggestion(channelId, chatId)) {
      try {
        const excerpt = formatDialogueExcerpt(messages.value, maxTurns)
        if (excerpt.trim()) {
          const result = await nexiaApi.generateTitle(excerpt, model)
          const title = (result?.title ?? '').trim()
          if (title) setPendingTitleSuggestion(channelId, chatId, title)
        }
      } catch {
        // silent fail: 유지 휴리스틱 제목
      }
    }
  } catch (err) {
    shouldScrollToBottom = true
    messages.value.push({
      role: 'assistant',
      content: `오류: ${err.message || '응답을 받지 못했습니다.'}`,
    })
    updateChatMessages(channelId, chatId, messages.value)
  } finally {
    isLoading.value = false
    nextTick(() => {
      if (messagesRef.value && shouldScrollToBottom) {
        messagesRef.value.scrollTop = messagesRef.value.scrollHeight
      }
    })
  }
}
</script>

<style lang="scss" scoped>
.nexia-chat-panel {
  height: 100%;
  min-height: 0;

  .chat-main {
    flex: 1;
    min-height: 0;
    min-width: 0;

    &.chat-main--with-outline {
      position: relative;
    }
  }

  .chat-body {
    container-type: inline-size;
    container-name: chat-body;
    min-width: 0;
    min-height: 0;
  }

  .chat-outline-overlay-wrap {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 80px;
    display: flex;
    align-items: stretch;
    pointer-events: none;

    > * {
      pointer-events: auto;
    }
  }

  .chat-outline-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    min-height: 40px;
    border-left: 1px solid var(--nexa-border-color);
    background: var(--nexa-surface);
    border-radius: 8px 0 0 8px;
    margin-top: 8px;
  }

  .chat-outline {
    display: flex;
    flex-direction: column;
    min-height: 0;
    border-left: 1px solid var(--nexa-border-color);
    background: var(--nexa-surface);

    &.chat-outline--overlay {
      position: absolute;
      right: 28px;
      top: 0;
      bottom: 0;
      width: var(--outline-width, 180px);
      box-shadow: -4px 0 12px rgba(0, 0, 0, 0.15);
    }

    &.chat-outline--push {
      flex-shrink: 0;
      width: var(--outline-width, 180px);
    }
  }

  .chat-outline-header {
    flex-shrink: 0;
    padding: 8px 12px;
    background: color-mix(in srgb, var(--nexa-surface) 92%, black);
  }

  .chat-outline-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--nexa-text-primary, inherit);
  }

  .chat-outline-filters .q-btn {
    min-width: auto;
    padding: 2px 6px;
  }

  .chat-outline-list {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    padding: 0 8px 8px;
  }

  .chat-outline-item {
    padding: 6px 8px;
    font-size: 0.8rem;
    cursor: pointer;
    border-radius: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
      background: color-mix(in srgb, var(--q-primary) 15%, transparent);
    }

    &.chat-outline-item--user {
      color: var(--q-primary);
    }
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    scroll-behavior: smooth;

    &:has(.empty-state-welcome-wrapper) {
      display: flex;
    }
  }

  .empty-state-welcome-wrapper {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 0;
  }

  .message-row {
    display: flex;
    margin-bottom: 12px;

    &.user {
      justify-content: flex-end;

      .message-bubble {
        max-width: 80%;
        background: var(--q-primary);
        color: white;
        border-radius: 16px 16px 4px 16px;
      }
    }

    &.assistant {
      justify-content: flex-start;

      .message-bubble {
        max-width: 100%;
        background: var(--nexa-surface);
        border: 1px solid var(--nexa-border-color);
        border-radius: 16px 16px 16px 4px;
      }
    }
  }

  .chat-messages-inner .message-bubble {
    font-size: var(--chat-font-size, 16px);
  }

  .message-bubble {
    padding: 10px 14px;
    white-space: pre-wrap;

    .chat-markdown {
      white-space: normal;
      overflow-x: auto;
      min-width: 0;

      p:first-child {
        margin-top: 0;
      }
      p:last-child {
        margin-bottom: 0;
      }

      /* marked 출력 테이블 기본 스타일 */
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 0.5em 0;

        th,
        td {
          padding: 6px 10px;
          border: 1px solid var(--nexa-border-color);
          text-align: left;
        }

        th {
          background: var(--nexa-surface);
          font-weight: 600;
        }

        tr:nth-child(even) td {
          background: color-mix(in srgb, var(--nexa-surface) 80%, transparent);
        }
      }
    }
  }

  /* 마이크: 대기=윤곽 primary / 수신 중=채움 negative·펄스 — flat 이미지·전송과 구분 */
  .chat-mic-btn--listening {
    animation: nexia-chat-mic-pulse 1.15s ease-in-out infinite;
  }

  @keyframes nexia-chat-mic-pulse {
    0%,
    100% {
      box-shadow: 0 0 0 0 color-mix(in srgb, var(--q-negative, var(--nexa-negative, #c62828)) 50%, transparent);
    }
    55% {
      box-shadow: 0 0 0 8px transparent;
    }
  }

  .chat-input {
    min-width: 0;
  }

  .chat-input-row {
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
    min-width: 0;
  }

  /* 입력 행 레이아웃만 — 필드 보더·높이는 nexa-system/_form.scss */
  .chat-textarea {
    flex: 1 1 0;
    min-width: 0;
    max-width: 100%;
    width: 100%;
  }

  .chat-model-select .model-select-compact-icon {
    color: var(--nexa-text-primary);
    opacity: 0.88;
  }

  .model-capability-icons {
    flex-shrink: 0;
  }

  .empty-state {
    padding-top: 80px;
  }

  .empty-state-welcome {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .welcome-main-title {
    font-size: 1.75rem;
    font-weight: 800;
    color: var(--nexa-text-primary, inherit);
  }

  .welcome-guide-list {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      margin-bottom: 4px;
    }
  }

  .example-prompts {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .example-prompts-buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }

  .hidden {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
    pointer-events: none;
  }

  .attached-images {
    .attached-image-thumb {
      position: relative;
      width: 48px;
      height: 48px;
      border-radius: 8px;
      overflow: hidden;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .thumb-remove {
        position: absolute;
        top: 2px;
        right: 2px;
        background: rgba(0, 0, 0, 0.5);
        color: white;
      }
    }
  }

  .msg-image-thumb {
    max-width: 120px;
    max-height: 120px;
    border-radius: 8px;
    object-fit: cover;
  }

  .message-loading {
    display: flex;
    align-items: center;
    gap: 10px;

    .loading-text {
      font-size: 0.9em;
      color: var(--nexa-muted, #666);
    }
  }
}
</style>
