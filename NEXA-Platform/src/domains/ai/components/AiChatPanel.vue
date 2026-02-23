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
          <div class="empty-state text-center q-pa-xl text-grey-7">
            <q-icon name="smart_toy" size="64px" class="q-mb-md" />
            <div class="text-h6 q-mb-sm">AI 플랫폼 (Ollama)</div>
            <div class="text-body2">메시지를 입력하고 전송하세요. 첫 질문이 대화 제목으로 사용됩니다.</div>
          </div>
        </template>
        <div v-else class="q-pa-md chat-messages-inner" :style="{ '--chat-font-size': `${chatFontSize ?? 16}px` }">
          <div
            v-for="(msg, idx) in messages"
            :key="idx"
            :class="['message-row', msg.role]"
          >
            <div class="message-bubble">{{ msg.content }}</div>
          </div>
        </div>
      </div>
      <div class="chat-input q-pa-md">
        <q-input
          v-model="inputText"
          type="textarea"
          outlined
          dense
          autogrow
          :rows="1"
          placeholder="메시지 입력... (Enter 전송, Shift+Enter 새 줄)"
          class="chat-textarea"
          :style="{ '--chat-max-rows': Math.min(20, Math.max(2, chatInputMaxRows ?? 8)) }"
          @keydown.enter.exact.prevent="sendMessage"
        >
          <template #append>
            <q-btn
              round
              dense
              flat
              icon="send"
              :loading="isLoading"
              :disable="!inputText.trim()"
              @click="sendMessage"
            />
          </template>
        </q-input>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { Notify } from 'quasar'
import { aiApi } from '../services/aiApi.js'
import { useAiSettings } from '../composables/useAiSettings.js'
import { useAiChannels } from '../composables/useAiChannels.js'

const { selectedModel, chatInputMaxRows, chatFontSize, chatMessageMaxLength } = useAiSettings()
const {
  selectedChannelId,
  selectedChatId,
  selectedChat,
  getEffectiveInstruction,
  addChat,
  updateChatTitle,
  updateChatMessages,
  selectChat,
} = useAiChannels()

const messages = ref([])
const inputText = ref('')
const isLoading = ref(false)
const messagesRef = ref(null)

const TITLE_MAX_LEN = 40

function truncateTitle(text) {
  const t = (text || '').trim()
  if (t.length <= TITLE_MAX_LEN) return t
  return t.slice(0, TITLE_MAX_LEN) + '...'
}

watch(
  [selectedChannelId, selectedChatId, selectedChat],
  () => {
    const chat = selectedChat.value
    messages.value = chat?.messages?.length ? [...chat.messages] : []
  },
  { immediate: true }
)

async function sendMessage() {
  const text = inputText.value?.trim()
  if (!text || isLoading.value) return

  const maxLen = chatMessageMaxLength.value
  if (maxLen > 0 && text.length > maxLen) {
    Notify.create({ type: 'warning', message: `메시지가 최대 길이를 초과했습니다 (최대 ${maxLen.toLocaleString()}자)` })
    return
  }

  let channelId = selectedChannelId.value
  let chatId = selectedChatId.value
  const isNewChat = !chatId

  if (isNewChat) {
    const title = truncateTitle(text)
    const chat = addChat(channelId, title)
    if (chat) {
      chatId = chat.id
      selectChat(chatId)
    }
  } else {
    const chat = selectedChat.value
    if (chat?.messages?.length === 0) {
      updateChatTitle(channelId, chatId, truncateTitle(text))
    }
  }

  messages.value.push({ role: 'user', content: text })
  inputText.value = ''
  isLoading.value = true

  try {
    const instruction = getEffectiveInstruction()
    const response = await aiApi.chat(messages.value, selectedModel.value, instruction || undefined)
    const content = response?.message?.content ?? response?.response ?? ''
    messages.value.push({ role: 'assistant', content })
    updateChatMessages(channelId, chatId, messages.value)
  } catch (err) {
    messages.value.push({
      role: 'assistant',
      content: `오류: ${err.message || '응답을 받지 못했습니다.'}`,
    })
    updateChatMessages(channelId, chatId, messages.value)
  } finally {
    isLoading.value = false
    nextTick(() => {
      if (messagesRef.value) {
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
  }

  .empty-state {
    padding-top: 80px;
  }

  .chat-textarea {
    --line-height: 24px;

    // deep 사용 이유: Quasar textarea 내부 요소에 max-height 적용
    :deep(textarea) {
      max-height: calc(var(--line-height) * var(--chat-max-rows, 8));
    }
  }
}
</style>
