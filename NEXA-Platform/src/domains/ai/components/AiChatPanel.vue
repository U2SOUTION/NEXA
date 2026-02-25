<template>
  <div class="ai-chat-panel column no-wrap">
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
              <div class="welcome-main-title q-mb-lg">NEXA AI Platform</div>
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
            <div class="message-bubble" :class="{ 'message-bubble--contextable': msg.role === 'assistant' && msg.content }" @contextmenu.prevent="msg.role === 'assistant' && msg.content ? onMessageContextMenu($event, msg) : null">
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
        <div class="chat-input-row row items-end no-wrap q-gutter-sm" @paste="handlePaste">
          <q-input
            v-model="inputText"
            type="textarea"
            outlined
            dense
            autogrow
            :rows="1"
            :placeholder="supportsVision ? '메시지 입력... (이미지 붙여넣기 가능, Enter 전송)' : '메시지 입력... (Enter 전송, Shift+Enter 새 줄)'"
            class="chat-textarea col"
            :style="{ '--chat-max-rows': Math.min(20, Math.max(2, chatInputMaxRows ?? 8)) }"
            @keydown.enter.exact.prevent="sendMessage"
          >
            <template #append>
              <q-btn v-if="supportsVision" round dense flat icon="image" title="이미지 첨부" @click="triggerFileSelect" />
              <q-btn round dense flat icon="send" :disable="!canSend" @click="sendMessage" />
            </template>
          </q-input>
          <q-select v-model="selectedModel" :options="models" outlined dense hide-bottom-space option-value="name" option-label="name" emit-value map-options class="chat-model-select" :loading="isLoadingModels" @focus="loadModels">
            <template #selected>
              <span v-if="selectedModel" class="model-select-selected row items-center no-wrap">
                <span class="model-select-name">{{ formatModelDisplayName(selectedModel) }}</span>
                <span v-if="getCapabilityIcons(selectedModel).length" class="model-capability-icons q-ml-xs">
                  <q-icon v-for="item in getCapabilityIcons(selectedModel)" :key="item.icon" :name="item.icon" size="16px" class="q-mr-xs" :title="item.title" />
                </span>
              </span>
              <span v-else class="model-select-placeholder">모델</span>
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

    <ContextMenu :visible="contextMenuVisible" :position="contextMenuPosition" :items="contextMenuItems" @item-click="handleContextMenuItemClick" @update:visible="handleContextMenuVisibilityChange" />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, inject } from 'vue'
import { Notify } from 'quasar'
import { parseMarkdown } from '@system/utils/markdown/index.js'
import { copyTextToClipboard } from '@system/utils/clipboard.js'
import ContextMenu from '@system/components/ui/ContextMenu.vue'
import { useContextMenu } from '@system/composables/useContextMenu.js'
import { aiApi } from '../services/aiApi.js'
import { useAiSettings } from '../composables/useAiSettings.js'
import { useAiModels } from '../composables/useAiModels.js'
import { formatModelDisplayName } from '../utils/modelDisplayName.js'
import { extractOutlineFromMessages } from '../utils/chatOutline.js'
import { getUploadDisplayUrl } from '@system/utils/apiBaseUrl.js'
import { useAiChannels } from '../composables/useAiChannels.js'
import { useAiMemos } from '../composables/useAiMemos.js'

const aiInsertContent = inject('aiInsertContent', null)
const { addMemo } = useAiMemos()
const { selectedModel, selectedModelCapabilities, chatMode, chatInputMaxRows, chatFontSize, chatMessageMaxLength, titleSuggestionMinTurns, titleSuggestionMaxTurnsForContext, pendingWebcamCapture, pendingAttachmentsFromGallery, modelCapabilities, outlineEnabled, outlineDisplayMode, outlinePanelWidth } = useAiSettings()
const { models, isLoadingModels, loadModels } = useAiModels()

const supportsVision = computed(() => (selectedModelCapabilities.value || []).includes('vision'))

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
const { selectedChannelId, selectedChatId, selectedChat, getEffectiveInstruction, addChat, updateChatTitle, updateChatMessages, selectChat, setPendingTitleSuggestion, getPendingTitleSuggestion } = useAiChannels()

const { showContextMenu, hideContextMenu, contextMenuState } = useContextMenu()
const contextMenuVisible = computed(() => contextMenuState.visible.value)
const contextMenuPosition = computed(() => contextMenuState.position.value)
const contextMenuItems = computed(() => contextMenuState.items.value)

const messages = ref([])
const inputText = ref('')
const attachedImages = ref([])
const isLoading = ref(false)
const messagesRef = ref(null)
const fileInputRef = ref(null)
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

function onMessageContextMenu(event, msg) {
  const content = (msg.content || '').trim()
  if (!content) return
  const items = [
    {
      id: 'copy',
      label: '복사',
      icon: 'content_copy',
      shortcut: 'Ctrl+C',
      action: async () => {
        try {
          await copyTextToClipboard(content)
          Notify.create({ message: '클립보드에 복사되었습니다.', icon: 'content_copy' })
        } catch {
          Notify.create({ type: 'negative', message: '복사에 실패했습니다.' })
        }
      },
    },
    {
      id: 'add-to-memo',
      label: '메모로 추가',
      icon: 'sticky_note_2',
      action: () => {
        addMemo(content, 'chat')
        Notify.create({ message: '메모에 추가되었습니다.', icon: 'sticky_note_2' })
      },
    },
    ...(aiInsertContent
      ? [
          {
            id: 'insert-to-editor',
            label: '에디터에 삽입',
            icon: 'edit_note',
            action: () => {
              const html = parseMarkdown(content, '', {})
              aiInsertContent.setCenterTab('editor')
              nextTick(() => {
                aiInsertContent.pendingInsertContent.value = html
              })
              Notify.create({ message: '에디터에 삽입되었습니다.', icon: 'edit_note' })
            },
          },
        ]
      : []),
  ]
  showContextMenu(event, items)
}

function handleContextMenuItemClick(item) {
  if (typeof item.action === 'function') {
    item.action()
  }
  hideContextMenu()
}

function handleContextMenuVisibilityChange(visible) {
  if (!visible) {
    hideContextMenu()
  }
}

watch(
  [selectedChannelId, selectedChatId, selectedChat],
  () => {
    const chat = selectedChat.value
    messages.value = chat?.messages?.length ? [...chat.messages] : []
  },
  { immediate: true },
)

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

      const content = await aiApi.chatStream(apiMessages, selectedModel.value, instruction || undefined, (delta) => {
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
      const response = await aiApi.chat(apiMessages, selectedModel.value, instruction || undefined)
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
          const result = await aiApi.generateTitle(excerpt, model)
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
.ai-chat-panel {
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

  .chat-model-select {
    flex-shrink: 0;
    min-width: 140px;
    max-width: 200px;

    .model-select-selected,
    .model-select-name,
    .model-select-placeholder {
      color: var(--nexa-text-primary);
      opacity: 0.8;
    }
  }

  .model-select-selected {
    min-width: 0;
    overflow: hidden;
  }

  .model-select-name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
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

  .chat-textarea {
    --line-height: 24px;

    // deep 사용 이유: Quasar textarea 내부 요소에 max-height 적용
    :deep(textarea) {
      max-height: calc(var(--line-height) * var(--chat-max-rows, 8));
    }
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
