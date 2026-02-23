<template>
  <div class="ai-left-nav">
    <StandardLeftHeader title="NEXA AI" subtitle="Channel & Chat Management">
      <template #actions>
        <q-btn flat dense icon="add" size="sm" label="CHANNEL" @click="showAddChannel = true" />
      </template>
    </StandardLeftHeader>

    <div class="panel-scroll-area">
      <!-- 채널 목록 -->
      <q-list dense class="q-px-sm">
        <template v-for="ch in channels" :key="ch.id">
          <q-expansion-item :model-value="selectedChannelId === ch.id" :header-inset-level="0" expand-icon-class="text-grey-6" class="channel-item" @update:model-value="(v) => (v ? selectChannel(ch.id) : selectChannel(null))">
            <template #header>
              <q-item-section avatar>
                <q-icon name="folder" size="20px" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-body2">{{ ch.name }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn flat dense round size="xs" icon="delete_outline" class="opacity-60" @click.stop="confirmDeleteChannel(ch)" />
              </q-item-section>
            </template>

            <!-- 대화 목록 -->
            <q-list dense class="q-pl-md q-pr-xs q-pb-sm">
              <q-item v-for="chat in ch.chats || []" :key="chat.id" clickable :active="selectedChatId === chat.id" active-class="bg-primary-1" class="chat-item rounded-borders q-my-xs" @click="selectChat(chat.id)">
                <q-item-section avatar>
                  <q-icon name="chat_bubble_outline" size="18px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-caption ellipsis">{{ chat.title }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat dense round size="xs" icon="close" class="opacity-50" @click.stop="confirmDeleteChat(ch.id, chat)" />
                </q-item-section>
              </q-item>

              <q-item clickable class="add-chat-item text-primary rounded-borders q-mt-xs" @click="handleNewChat(ch.id)">
                <q-item-section avatar>
                  <q-icon name="add" size="18px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-caption">새 대화</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>
        </template>
      </q-list>
    </div>

    <!-- 새 채널 다이얼로그 -->
    <q-dialog v-model="showAddChannel" persistent>
      <q-card style="min-width: 280px">
        <q-card-section>
          <div class="text-h6">새 채널</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="newChannelName" label="채널 이름" outlined dense autofocus @keyup.enter="doAddChannel" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="취소" v-close-popup />
          <q-btn unelevated color="primary" label="추가" :disable="!newChannelName.trim()" @click="doAddChannel" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 삭제 확인 -->
    <q-dialog v-model="showDeleteConfirm" persistent>
      <q-card style="min-width: 280px">
        <q-card-section>
          <div class="text-body1">{{ deleteConfirmMessage }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="취소" v-close-popup />
          <q-btn unelevated color="negative" label="삭제" @click="doDeleteConfirm" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import StandardLeftHeader from '@frame/layout/components/StandardLeftHeader.vue'
import { useAiChannels } from '../../composables/useAiChannels.js'

const { channels, selectedChannelId, selectedChatId, init, addChannel, deleteChannel, deleteChat, selectChannel, selectChat, startNewChat } = useAiChannels()

const showAddChannel = ref(false)
const newChannelName = ref('')
const showDeleteConfirm = ref(false)
const deleteConfirmMessage = ref('')
let deleteConfirmAction = null

onMounted(() => {
  init()
  if (channels.value.length > 0 && !selectedChannelId.value) {
    selectChannel(channels.value[0].id)
  }
})

function doAddChannel() {
  const name = newChannelName.value?.trim()
  if (!name) return
  const ch = addChannel(name)
  newChannelName.value = ''
  showAddChannel.value = false
  selectChannel(ch.id)
}

function confirmDeleteChannel(ch) {
  deleteConfirmMessage.value = `채널 "${ch.name}"과 대화 ${(ch.chats || []).length}개를 삭제할까요?`
  deleteConfirmAction = () => deleteChannel(ch.id)
  showDeleteConfirm.value = true
}

function confirmDeleteChat(channelId, chat) {
  deleteConfirmMessage.value = `"${chat.title}" 대화를 삭제할까요?`
  deleteConfirmAction = () => deleteChat(channelId, chat.id)
  showDeleteConfirm.value = true
}

function doDeleteConfirm() {
  if (deleteConfirmAction) deleteConfirmAction()
  deleteConfirmAction = null
  showDeleteConfirm.value = false
}

function handleNewChat(channelId) {
  selectChannel(channelId)
  startNewChat()
}
</script>

<style lang="scss" scoped>
.ai-left-nav {
  height: 100%;
  display: flex;
  flex-direction: column;

  .panel-scroll-area {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }

  .channel-item :deep(.q-item) {
    min-height: 40px;
  }

  .chat-item {
    min-height: 36px;
  }

  .add-chat-item {
    min-height: 32px;
  }
}
</style>
