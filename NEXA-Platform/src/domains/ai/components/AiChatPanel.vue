<template>
  <div class="ai-chat-panel column no-wrap">
    <div class="chat-messages col scroll" ref="messagesRef">
      <template v-if="messages.length === 0">
        <div class="empty-state text-center q-pa-xl text-grey-7">
          <q-icon name="smart_toy" size="64px" class="q-mb-md" />
          <div class="text-h6 q-mb-sm">AI 플랫폼 (Ollama)</div>
          <div class="text-body2">메시지를 입력하고 전송하세요.</div>
        </div>
      </template>
      <div v-else class="q-pa-md">
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
        outlined
        dense
        placeholder="메시지 입력..."
        @keydown.enter.prevent="sendMessage"
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
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { aiApi } from '../services/aiApi.js'
import { useAiSettings } from '../composables/useAiSettings.js'

const { selectedModel } = useAiSettings()
const messages = ref([])
const inputText = ref('')
const isLoading = ref(false)
const messagesRef = ref(null)

async function sendMessage() {
  const text = inputText.value?.trim()
  if (!text || isLoading.value) return

  messages.value.push({ role: 'user', content: text })
  inputText.value = ''
  isLoading.value = true

  try {
    const response = await aiApi.chat(messages.value, selectedModel.value)
    const content = response?.message?.content ?? response?.response ?? ''
    messages.value.push({ role: 'assistant', content })
  } catch (err) {
    messages.value.push({
      role: 'assistant',
      content: `오류: ${err.message || '응답을 받지 못했습니다.'}`,
    })
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

  .message-bubble {
    max-width: 80%;
    padding: 10px 14px;
    white-space: pre-wrap;
  }

  .empty-state {
    padding-top: 80px;
  }
}
</style>
