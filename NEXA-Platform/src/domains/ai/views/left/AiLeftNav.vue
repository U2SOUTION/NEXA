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
          <q-input v-model="searchQuery" outlined dense placeholder="Search channels & chats" clearable>
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
            <div class="toolbar-label text-caption text-grey-6">TOOLbar</div>
            <div class="toolbar-actions row q-gutter-xs flex-shrink-0">
              <q-btn flat dense round size="md" icon="add" title="Add">
                <q-menu anchor="bottom start" self="top start" :offset="[0, 4]">
                  <q-list dense style="min-width: 140px">
                    <q-item clickable v-close-popup @click="showAddChannel = true">
                      <q-item-section avatar>
                        <q-icon name="folder" size="18px" />
                      </q-item-section>
                      <q-item-section>채널 추가</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="handleAddChatFromToolbar">
                      <q-item-section avatar>
                        <q-icon name="chat_bubble_outline" size="18px" />
                      </q-item-section>
                      <q-item-section>대화 추가</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
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
                :class="['channel-item', { 'channel-selected': selectedChannelId === item.channel.id }]"
                @update:model-value="(v) => (v ? selectChannel(item.channel.id) : selectChannel(null))"
              >
                <template #header>
                  <q-item-section avatar>
                    <q-icon :name="selectedChannelId === item.channel.id ? 'folder_open' : 'folder'" size="20px" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-body2 channel-label">{{ item.channel.name }}</q-item-label>
                  </q-item-section>
                </template>
                <div class="chat-list">
                  <div v-for="chat in item.chats" :key="chat.id" role="button" tabindex="0" class="chat-item" :class="{ 'chat-item-selected': selectedChatId === chat.id }" @click="selectChat(chat.id)" @keydown.enter.space.prevent="selectChat(chat.id)">
                    <q-icon name="chat_bubble_outline" size="18px" class="chat-item-icon" />
                    <span class="chat-item-label text-caption ellipsis">{{ chat.title }}</span>
                    <q-icon :name="getPendingTitleSuggestion(item.channel.id, chat.id) ? 'auto_awesome' : 'edit'" size="16px" class="chat-item-edit-icon" title="제목 편집" @click.stop="openEditChatFromItem(item.channel.id, chat)" />
                  </div>
                  <div v-if="item.chats.length === 0" class="chat-empty text-grey-6 text-caption">No chats</div>
                </div>
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
              <q-expansion-item
                v-for="ch in channels"
                :key="ch.id"
                :model-value="selectedChannelId === ch.id"
                :header-inset-level="0"
                expand-icon-class="text-grey-6"
                :class="['channel-item', { 'channel-selected': selectedChannelId === ch.id }]"
                @update:model-value="(v) => (v ? selectChannel(ch.id) : selectChannel(null))"
              >
                <template #header>
                  <q-item-section avatar>
                    <q-icon :name="selectedChannelId === ch.id ? 'folder_open' : 'folder'" size="20px" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-body2 channel-label">{{ ch.name }}</q-item-label>
                  </q-item-section>
                </template>

                <!-- 대화 목록 -->
                <div class="chat-list">
                  <transition-group name="chat-move" tag="div" class="chat-transition-group">
                    <div v-for="chat in ch.chats || []" :key="chat.id" role="button" tabindex="0" class="chat-item" :class="{ 'chat-item-selected': selectedChatId === chat.id }" @click="selectChat(chat.id)" @keydown.enter.space.prevent="selectChat(chat.id)">
                      <q-icon name="chat_bubble_outline" size="18px" class="chat-item-icon" />
                      <span class="chat-item-label text-caption ellipsis">{{ chat.title }}</span>
                      <q-icon :name="getPendingTitleSuggestion(ch.id, chat.id) ? 'auto_awesome' : 'edit'" size="16px" class="chat-item-edit-icon" title="제목 편집" @click.stop="openEditChatFromItem(ch.id, chat)" />
                    </div>
                  </transition-group>

                  <div role="button" tabindex="0" class="add-chat-item text-primary" @click="handleNewChat(ch.id)" @keydown.enter.space.prevent="handleNewChat(ch.id)">
                    <q-icon name="add" size="18px" class="chat-item-icon" />
                    <span class="text-caption">새 대화</span>
                  </div>
                </div>
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
                <div v-if="memos.length === 0" class="ai-placeholder text-grey-6 text-caption">채팅에서 우클릭 → 메모로 추가</div>
                <q-list v-else dense class="memo-list">
                  <q-item v-for="m in memos" :key="m.id" clickable class="memo-item memo-item-clickable" @click="onMemoClick(m)">
                    <q-item-section avatar>
                      <q-icon name="sticky_note_2" size="18px" color="grey-6" />
                    </q-item-section>
                    <q-item-section class="memo-item-content">
                      <q-item-label class="text-caption ellipsis" :title="m.content">{{ getMemoPreview(m.content) }}</q-item-label>
                      <q-item-label caption>{{ formatMemoDate(m.createdAt) }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn flat dense round size="sm" icon="delete_outline" color="grey-6" @click.stop="removeMemo(m.id)" />
                    </q-item-section>
                  </q-item>
                </q-list>
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
            <q-expansion-item @hide="onWebcamHide">
              <template #header>
                <q-item-section avatar>
                  <q-icon name="videocam" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>웹캠</q-item-label>
                </q-item-section>
                <q-item-section side @click.stop class="webcam-toggle-wrap" :class="{ 'webcam-on': webcamOn }">
                  <q-toggle dense :model-value="webcamOn" :label="webcamOn ? '켜짐' : '꺼짐'" @update:model-value="onWebcamToggle" />
                </q-item-section>
              </template>
              <div class="ai-accordion-content">
                <WebcamViewer
                  ref="webcamRef"
                  :flip-mode="webcamFlipMode"
                  :resolution="webcamResolution"
                  :brightness="webcamFilterBrightness"
                  :contrast="webcamFilterContrast"
                  :saturate="webcamFilterSaturate"
                  :grayscale="webcamFilterGrayscale"
                  :show-capture-button="supportsVision"
                  @update:flip-mode="webcamFlipMode = $event"
                  @update:resolution="webcamResolution = $event"
                  @update:brightness="webcamFilterBrightness = $event"
                  @update:contrast="webcamFilterContrast = $event"
                  @update:saturate="webcamFilterSaturate = $event"
                  @update:grayscale="webcamFilterGrayscale = $event"
                  @capture="onWebcamCapture"
                />
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
import { Notify } from 'quasar'
import StandardLeftHeader from '@frame/layout/components/StandardLeftHeader.vue'
import WebcamViewer from '@system/components/ui/WebcamViewer.vue'
import { useAiChannels } from '../../composables/useAiChannels.js'
import { useAiSettings } from '../../composables/useAiSettings.js'
import { useAiMemos } from '../../composables/useAiMemos.js'
import { useAiInsertRequest } from '../../composables/useAiInsertRequest.js'

const { memos, removeMemo, getMemoPreview } = useAiMemos()
const { requestInsert } = useAiInsertRequest()

function onMemoClick(m) {
  requestInsert(m.content)
  Notify.create({ message: '에디터에 삽입되었습니다.', icon: 'edit_note' })
}

function formatMemoDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  return isToday ? d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

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
  getPendingTitleSuggestion,
  clearPendingTitleSuggestion,
} = useAiChannels()

const { pendingWebcamCapture, webcamFlipMode, webcamResolution, webcamFilterBrightness, webcamFilterContrast, webcamFilterSaturate, webcamFilterGrayscale, selectedModelCapabilities } = useAiSettings()

const supportsVision = computed(() => (selectedModelCapabilities.value || []).includes('vision'))

const leftMainTab = ref('chat')
const webcamOn = ref(false)
const webcamRef = ref(null)
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

function handleAddChatFromToolbar() {
  if (selectedChannelId.value) {
    selectChannel(selectedChannelId.value)
    startNewChat()
  } else {
    Notify.create({ type: 'warning', message: '채널을 선택한 후 대화를 추가해 주세요' })
  }
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
  openEditChatFromItem(selectedChannelId.value, chat)
}
function openEditChatFromItem(channelId, chat) {
  if (!chat || !channelId) return
  const suggestion = getPendingTitleSuggestion(channelId, chat.id)
  editTarget.value = { type: 'chat', channelId, chatId: chat.id }
  editValue.value = suggestion ?? chat.title ?? ''
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
    clearPendingTitleSuggestion(channelId, chatId)
  }
  showEditDialog.value = false
}

function onWebcamToggle(on) {
  webcamOn.value = on
  if (on) {
    webcamRef.value?.start()
  } else {
    webcamRef.value?.stop()
  }
}

function onWebcamHide() {
  webcamOn.value = false
  webcamRef.value?.stop()
}

function onWebcamCapture(dataUrl) {
  pendingWebcamCapture.value = dataUrl
}
</script>

<style lang="scss" scoped>
.ai-left-nav {
  --ai-selected-icon-color: var(--nexa-accent);

  height: 100%;
  min-height: 0;
  min-width: 0;
  overflow: hidden;

  .left-main-tabs {
    flex-shrink: 0;
  }

  .left-main-panels {
    flex: 1;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
  }

  .left-panel-inner {
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
    min-width: 0;
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
    overflow-x: hidden;
    overflow-y: auto;
    min-height: 0;
    min-width: 0;
  }

  .channel-item {
    min-width: 0;
  }

  .channel-item :deep(.q-item) {
    min-height: 40px;
  }

  .channel-item :deep(.q-item__section--avatar) {
    min-width: 24px;
    padding-right: 4px;
  }

  .channel-item :deep(.q-item__section--main) {
    padding-left: 2px;
  }

  .channel-item.channel-selected .channel-label {
    font-weight: 800;
  }

  .channel-item.channel-selected :deep(.q-icon) {
    color: var(--ai-selected-icon-color);
  }

  .channel-list {
    min-width: 0;
    overflow: hidden;
  }

  .chat-list {
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 0;
    margin: 0;
    width: 100%;
    min-width: 0;
    overflow: hidden;
  }

  .channel-item .chat-list :deep(.q-item) {
    min-height: 24px;
    padding: 0;
    margin: 0;
    border-bottom: none;
    background: transparent;
  }

  .chat-item {
    display: flex;
    align-items: center;
    min-height: 24px;
    padding: 1px 0;
    min-width: 0;
    border-radius: 4px;
    transition: background-color 0.15s ease;

    &:hover {
      background-color: var(--nexa-background-darker, rgba(0, 0, 0, 0.06));
      color: var(--nexa-accent);
      cursor: pointer;
    }
  }

  .chat-item .chat-item-icon {
    flex-shrink: 0;
    min-width: 20px;
    padding-right: 2px;
  }

  .chat-item .chat-item-edit-icon {
    flex-shrink: 0;
    min-width: 20px;
    padding-left: 2px;
    opacity: 0.5;
    transition: opacity 0.15s ease;
  }

  .chat-item:hover .chat-item-edit-icon,
  .chat-item.chat-item-selected .chat-item-edit-icon {
    opacity: 1;
  }

  /* SidebarOverflowPrevention: width: 0 + overflow: hidden = flex 아이템이 부모를 초과하지 않음 */
  .chat-item .chat-item-label {
    flex: 1;
    min-width: 0;
    width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .chat-item.chat-item-selected .chat-item-label {
    color: var(--nexa-accent);
    font-weight: 700;
    font-size: 1em;
  }

  .chat-item.chat-item-selected :deep(.q-icon) {
    color: var(--nexa-accent);
  }

  .add-chat-item {
    display: flex;
    align-items: center;
    min-height: 24px;
    margin-bottom: 3px;
    padding: 1px 0 0;
    min-width: 0;
    border-radius: 4px;
    transition: background-color 0.15s ease;

    &:hover {
      background-color: var(--nexa-button-save-bg, rgba(0, 0, 0, 0.06));
    }
  }

  .add-chat-item .chat-item-icon {
    flex-shrink: 0;
    min-width: 20px;
    padding-right: 2px;
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
    min-width: 0;

    .toolbar-actions {
      flex-shrink: 0;
    }
  }

  .webcam-toggle-wrap.webcam-on :deep(.q-toggle__label) {
    color: var(--nexa-warning);
  }

  .memo-item-clickable {
    cursor: pointer;

    &:hover {
      background-color: var(--nexa-background-darker, rgba(0, 0, 0, 0.06));
    }
  }
}
</style>
