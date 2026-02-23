<template>
  <div class="ai-left-nav column">
    <StandardLeftHeader title="NEXA AI" subtitle="Channel & Chat Management" />

    <q-tabs v-model="leftMainTab" dense class="left-main-tabs" active-color="primary" indicator-color="primary" align="left">
      <q-tab name="chat" label="채팅" icon="chat" />
      <q-tab name="note" label="노트" icon="sticky_note_2" />
      <q-tab name="media" label="미디어" icon="photo_library" />
    </q-tabs>

    <q-tab-panels v-model="leftMainTab" animated class="col left-main-panels">
      <q-tab-panel name="chat" class="q-pa-none left-panel-inner">
    <!-- 검색 폼 -->
    <div class="search-form q-pa-sm q-mx-sm q-mb-xs">
      <q-input
        v-model="searchQuery"
        outlined
        dense
        placeholder="Search channels & chats"
        clearable
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
        <template #append>
          <q-btn flat dense round size="sm" :icon="searchTargetIcon" class="search-target-btn" title="Search target">
            <q-menu anchor="bottom end" self="top end" :offset="[0, 4]">
              <q-list dense style="min-width: 120px">
                <q-item clickable v-close-popup @click="searchTarget = 'both'">
                  <q-item-section avatar>
                    <q-icon name="view_list" size="18px" />
                  </q-item-section>
                  <q-item-section>Both</q-item-section>
                  <q-item-section side v-if="searchTarget === 'both'">
                    <q-icon name="check" size="16px" color="primary" />
                  </q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="searchTarget = 'channel'">
                  <q-item-section avatar>
                    <q-icon name="folder" size="18px" />
                  </q-item-section>
                  <q-item-section>Channel</q-item-section>
                  <q-item-section side v-if="searchTarget === 'channel'">
                    <q-icon name="check" size="16px" color="primary" />
                  </q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="searchTarget = 'chat'">
                  <q-item-section avatar>
                    <q-icon name="chat_bubble_outline" size="18px" />
                  </q-item-section>
                  <q-item-section>Chat</q-item-section>
                  <q-item-section side v-if="searchTarget === 'chat'">
                    <q-icon name="check" size="16px" color="primary" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </template>
      </q-input>
    </div>

    <!-- 목록 관리 툴바 -->
    <div class="list-management-toolbar q-pa-sm q-mx-sm q-mb-xs rounded-borders">
      <div class="row items-center no-wrap full-width justify-between">
        <div class="toolbar-label col ellipsis">
          <template v-if="selectedChat">
            <div class="text-caption text-grey-7">Chat</div>
            <div class="text-body2 ellipsis">{{ selectedChat.title }}</div>
          </template>
          <template v-else-if="selectedChannel">
            <div class="text-caption text-grey-7">Channel</div>
            <div class="text-body2 ellipsis">{{ selectedChannel.name }}</div>
          </template>
          <template v-else>
            <div class="text-caption text-grey-6">Select a channel or chat</div>
          </template>
        </div>
        <div class="toolbar-actions row q-gutter-xs flex-shrink-0">
          <q-btn flat dense round size="sm" icon="add" title="Add channel" @click="showAddChannel = true" />
          <template v-if="selectedChat">
            <q-btn flat dense round size="sm" icon="edit" title="Edit" @click="openEditChat" />
            <q-btn flat dense round size="sm" icon="arrow_upward" title="Move up" :disable="!canMoveChatUp" @click="moveChatUp(selectedChannelId, selectedChatId)" />
            <q-btn flat dense round size="sm" icon="arrow_downward" title="Move down" :disable="!canMoveChatDown" @click="moveChatDown(selectedChannelId, selectedChatId)" />
            <q-btn flat dense round size="sm" icon="delete_outline" title="Delete" color="negative" @click="confirmDeleteChat(selectedChannelId, selectedChat)" />
          </template>
          <template v-else-if="selectedChannel">
            <q-btn flat dense round size="sm" icon="edit" title="Edit" @click="openEditChannel" />
            <q-btn flat dense round size="sm" icon="arrow_upward" title="Move up" :disable="!canMoveChannelUp" @click="moveChannelUp(selectedChannelId)" />
            <q-btn flat dense round size="sm" icon="arrow_downward" title="Move down" :disable="!canMoveChannelDown" @click="moveChannelDown(selectedChannelId)" />
            <q-btn flat dense round size="sm" icon="delete_outline" title="Delete" color="negative" @click="confirmDeleteChannel(selectedChannel)" />
          </template>
        </div>
      </div>
    </div>

    <div class="panel-scroll-area">
      <!-- 검색 결과 (채널·채팅 동일 구조) -->
      <q-list v-if="showSearchResults" dense class="q-px-sm channel-list">
        <template v-for="item in searchResults" :key="item.channel.id">
          <q-expansion-item
            :model-value="selectedChannelId === item.channel.id"
            :header-inset-level="0"
            expand-icon-class="text-grey-6"
            class="channel-item"
            @update:model-value="(v) => (v ? selectChannel(item.channel.id) : selectChannel(null))"
          >
            <template #header>
              <q-item-section avatar>
                <q-icon name="folder" size="20px" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-body2">{{ item.channel.name }}</q-item-label>
              </q-item-section>
            </template>
            <q-list dense class="q-pl-md q-pr-xs q-pb-sm chat-list">
              <q-item
                v-for="chat in item.chats"
                :key="chat.id"
                clickable
                :active="selectedChatId === chat.id"
                active-class="bg-primary-1"
                class="chat-item rounded-borders q-my-xs"
                @click="selectChat(chat.id)"
              >
                <q-item-section avatar>
                  <q-icon name="chat_bubble_outline" size="18px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-caption ellipsis">{{ chat.title }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="item.chats.length === 0" class="text-grey-6 text-caption q-pl-md">
                <q-item-section>No chats</q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>
        </template>
        <q-item v-if="searchResults.length === 0" class="text-grey-6">
          <q-item-section>
            <q-item-label class="text-caption">No results</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- 채널 목록 -->
      <q-list v-else dense class="q-px-sm channel-list">
        <transition-group name="channel-move" tag="div" class="channel-transition-group">
          <q-expansion-item v-for="ch in channels" :key="ch.id" :model-value="selectedChannelId === ch.id" :header-inset-level="0" expand-icon-class="text-grey-6" class="channel-item" @update:model-value="(v) => (v ? selectChannel(ch.id) : selectChannel(null))">
            <template #header>
              <q-item-section avatar>
                <q-icon name="folder" size="20px" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-body2">{{ ch.name }}</q-item-label>
              </q-item-section>
            </template>

            <!-- 대화 목록 -->
            <q-list dense class="q-pl-md q-pr-xs q-pb-sm chat-list">
              <transition-group name="chat-move" tag="div" class="chat-transition-group">
                <q-item v-for="chat in ch.chats || []" :key="chat.id" clickable :active="selectedChatId === chat.id" active-class="bg-primary-1" class="chat-item rounded-borders q-my-xs" @click="selectChat(chat.id)">
                  <q-item-section avatar>
                    <q-icon name="chat_bubble_outline" size="18px" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-caption ellipsis">{{ chat.title }}</q-item-label>
                  </q-item-section>
                </q-item>
              </transition-group>

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
        </transition-group>
      </q-list>
    </div>
      </q-tab-panel>

      <q-tab-panel name="note" class="q-pa-none left-panel-inner">
        <div class="panel-scroll-area">
          <div class="ai-panel-padding">
            <q-expansion-item icon="sticky_note_2" label="메모" :default-opened="true">
              <div class="ai-accordion-content">
                <div class="ai-placeholder text-grey-6 text-caption">준비 중</div>
              </div>
            </q-expansion-item>
            <q-expansion-item icon="description" label="문서">
              <div class="ai-accordion-content">
                <div class="ai-placeholder text-grey-6 text-caption">준비 중</div>
              </div>
            </q-expansion-item>
          </div>
        </div>
      </q-tab-panel>

      <q-tab-panel name="media" class="q-pa-none left-panel-inner">
        <div class="panel-scroll-area">
          <div class="ai-panel-padding">
            <q-expansion-item icon="photo_library" label="갤러리" :default-opened="true">
              <div class="ai-accordion-content">
                <div class="ai-placeholder text-grey-6 text-caption">준비 중</div>
              </div>
            </q-expansion-item>
            <q-expansion-item icon="music_note" label="사운드">
              <div class="ai-accordion-content">
                <div class="ai-placeholder text-grey-6 text-caption">준비 중</div>
              </div>
            </q-expansion-item>
            <q-expansion-item icon="videocam" label="영상">
              <div class="ai-accordion-content">
                <div class="ai-placeholder text-grey-6 text-caption">준비 중</div>
              </div>
            </q-expansion-item>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>

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

    <!-- 편집 다이얼로그 -->
    <q-dialog v-model="showEditDialog" persistent>
      <q-card style="min-width: 280px">
        <q-card-section>
          <div class="text-h6">{{ editTarget.type === 'channel' ? 'Edit channel' : 'Edit chat' }}</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="editValue" :label="editTarget.type === 'channel' ? 'Channel name' : 'Chat title'" outlined dense autofocus @keyup.enter="doEditSave" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn unelevated color="primary" label="Save" :disable="!editValue.trim()" @click="doEditSave" />
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
import { ref, computed, onMounted } from 'vue'
import StandardLeftHeader from '@frame/layout/components/StandardLeftHeader.vue'
import { useAiChannels } from '../../composables/useAiChannels.js'

const {
  channels,
  selectedChannelId,
  selectedChatId,
  selectedChannel,
  selectedChat,
  searchQuery,
  searchTarget,
  searchResults,
  showSearchResults,
  init,
  addChannel,
  deleteChannel,
  updateChannelName,
  updateChatTitle,
  moveChannelUp,
  moveChannelDown,
  moveChatUp,
  moveChatDown,
  deleteChat,
  selectChannel,
  selectChat,
  startNewChat,
} = useAiChannels()

const leftMainTab = ref('chat')
const showAddChannel = ref(false)
const showEditDialog = ref(false)
const editTarget = ref({ type: null, channelId: null, chatId: null })
const editValue = ref('')
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

const searchTargetIcon = computed(() => {
  const map = { both: 'view_list', channel: 'folder', chat: 'chat_bubble_outline' }
  return map[searchTarget.value] || 'view_list'
})

const canMoveChannelUp = computed(() => {
  if (!selectedChannelId.value) return false
  const idx = channels.value.findIndex((c) => c.id === selectedChannelId.value)
  return idx > 0
})
const canMoveChannelDown = computed(() => {
  if (!selectedChannelId.value) return false
  const idx = channels.value.findIndex((c) => c.id === selectedChannelId.value)
  return idx >= 0 && idx < channels.value.length - 1
})
const canMoveChatUp = computed(() => {
  const ch = selectedChannel.value
  if (!ch?.chats?.length || !selectedChatId.value) return false
  const idx = ch.chats.findIndex((c) => c.id === selectedChatId.value)
  return idx > 0
})
const canMoveChatDown = computed(() => {
  const ch = selectedChannel.value
  if (!ch?.chats?.length || !selectedChatId.value) return false
  const idx = ch.chats.findIndex((c) => c.id === selectedChatId.value)
  return idx >= 0 && idx < ch.chats.length - 1
})

function openEditChannel() {
  const ch = selectedChannel.value
  if (!ch) return
  editTarget.value = { type: 'channel', channelId: ch.id, chatId: null }
  editValue.value = ch.name
  showEditDialog.value = true
}
function openEditChat() {
  const chat = selectedChat.value
  if (!chat || !selectedChannelId.value) return
  editTarget.value = { type: 'chat', channelId: selectedChannelId.value, chatId: chat.id }
  editValue.value = chat.title
  showEditDialog.value = true
}
function doEditSave() {
  const { type, channelId, chatId } = editTarget.value
  const v = editValue.value?.trim()
  if (!v) return
  if (type === 'channel') {
    updateChannelName(channelId, v)
  } else if (type === 'chat') {
    updateChatTitle(channelId, chatId, v)
  }
  showEditDialog.value = false
}
</script>

<style lang="scss" scoped>
.ai-left-nav {
  height: 100%;
  min-height: 0;
  overflow: hidden;

  .left-main-tabs {
    flex-shrink: 0;
  }

  .left-main-panels {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .left-panel-inner {
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }

  .ai-panel-padding {
    padding: 6px;
  }

  .ai-accordion-content {
    padding: 4px;
  }

  .ai-placeholder {
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

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

  .channel-move-move,
  .chat-move-move {
    transition: transform 0.25s ease;
  }

  .channel-transition-group,
  .chat-transition-group {
    display: contents;
  }

  .search-form {
    background: var(--nexa-surface-header-bg, var(--nexa-background-darker));
    border: 1px solid var(--nexa-border-color, rgba(0, 0, 0, 0.12));
    border-radius: 4px;

    .search-target-btn {
      margin-right: -4px;
    }
  }

  .list-management-toolbar {
    background: var(--nexa-surface-header-bg, var(--nexa-background-darker));
    border: 1px solid var(--nexa-border-color, rgba(0, 0, 0, 0.12));

    .toolbar-label {
      min-width: 0;
    }

    .toolbar-actions {
      flex-shrink: 0;
    }
  }
}
</style>
