<template>
  <div class="ai-chat-panel column no-wrap">
    <div v-if="!selectedChannelId" class="empty-state text-center q-pa-xl text-grey-7">
      <q-icon name="folder_open" size="64px" class="q-mb-md" />
      <div class="text-h6 q-mb-sm">채널을 선택하세요</div>
      <div class="text-body2">왼쪽에서 채널을 선택하거나 새 채널을 만드세요.</div>
    </div>

    <template v-else>
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
          <div v-for="(msg, idx) in messages" :key="idx" :class="['message-row', msg.role]">
            <div
              class="message-bubble"
              :class="{ 'message-bubble--contextable': msg.role === 'assistant' && msg.content }"
              @contextmenu.prevent="msg.role === 'assistant' && msg.content ? onMessageContextMenu($event, msg) : null"
            >
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
      <div class="chat-input q-pa-md">
        <div v-if="supportsVision && attachedImages.length > 0" class="attached-images row q-gutter-xs q-mb-sm">
          <div v-for="(img, i) in attachedImages" :key="i" class="attached-image-thumb">
            <img :src="img.dataUrl" alt="첨부" />
            <q-btn round dense flat size="sm" icon="close" class="thumb-remove" @click="removeAttachedImage(i)" />
          </div>
        </div>
        <input v-if="supportsVision" ref="fileInputRef" type="file" accept="image/png,image/jpeg,image/jpg" class="hidden" @change="handleFileSelect" />
        <div class="chat-input-row row items-end no-wrap" @paste="handlePaste">
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
        </div>
      </div>
    </template>

    <ContextMenu
      :visible="contextMenuVisible"
      :position="contextMenuPosition"
      :items="contextMenuItems"
      @item-click="handleContextMenuItemClick"
      @update:visible="handleContextMenuVisibilityChange"
    />
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
import { useAiChannels } from '../composables/useAiChannels.js'

const { selectedModel, selectedModelCapabilities, chatInputMaxRows, chatFontSize, chatMessageMaxLength, titleSuggestionMinTurns, titleSuggestionMaxTurnsForContext, pendingWebcamCapture } = useAiSettings()

const supportsVision = computed(() => (selectedModelCapabilities.value || []).includes('vision'))
const { selectedChannelId, selectedChatId, selectedChat, getEffectiveInstruction, addChat, updateChatTitle, updateChatMessages, selectChat, setPendingTitleSuggestion, getPendingTitleSuggestion } = useAiChannels()

const aiInsertContent = inject('aiInsertContent', null)
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

  const msgImages = attachedImages.value.map((img) => img.dataUrl)
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
  try {
    const instruction = getEffectiveInstruction()
    const response = await aiApi.chat(apiMessages, selectedModel.value, instruction || undefined)
    const content = response?.message?.content ?? response?.response ?? ''
    const el = messagesRef.value
    if (el) {
      const threshold = 80
      shouldScrollToBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - threshold
    }
    messages.value.push({ role: 'assistant', content })
    updateChatMessages(channelId, chatId, messages.value)

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

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    min-height: 0;

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
        background: var(--q-primary);
        color: white;
        border-radius: 16px 16px 4px 16px;
      }
    }

    &.assistant .message-bubble {
      background: var(--nexa-surface);
      border: 1px solid var(--nexa-border-color);
      border-radius: 16px 16px 16px 4px;
    }
  }

  .chat-messages-inner .message-bubble {
    font-size: var(--chat-font-size, 16px);
  }

  .message-bubble {
    max-width: 80%;
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
