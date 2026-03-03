<template>
  <div class="ai-left-nav column">
    <StandardLeftHeader title="NEXA AI" subtitle="Channel & Chat Management" />

    <q-tabs v-model="leftMainTab" dense class="left-main-tabs" active-color="primary" indicator-color="primary" align="left">
      <q-tab name="chat" label="채팅" icon="chat" />
      <q-tab name="note" label="노트" icon="sticky_note_2" />
      <q-tab name="media" label="미디어" icon="photo_library" />
    </q-tabs>

    <!-- 통합 검색 폼 (채널/노트/미디어/파일) -->
    <div class="search-form q-pa-sm q-mx-sm q-mb-xs">
      <div class="search-row row q-gutter-xs">
        <q-input :model-value="unifiedSearch.searchQuery.value" outlined dense :placeholder="unifiedSearchPlaceholder" clearable class="col" debounce="300" @update:model-value="unifiedSearch.setSearchQuery">
          <template #prepend>
            <q-icon name="search" />
          </template>
          <template #append>
            <q-btn flat dense round size="sm" :icon="unifiedSearchTargetIcon" class="search-target-btn" title="검색 대상">
              <q-menu anchor="bottom end" self="top end" :offset="[0, 4]">
                <q-list dense style="min-width: 120px">
                  <q-item v-for="opt in SEARCH_TARGET_OPTIONS" :key="opt.value" clickable v-close-popup @click="unifiedSearch.setSearchTarget(opt.value)">
                    <q-item-section avatar>
                      <q-icon :name="opt.icon" size="18px" />
                    </q-item-section>
                    <q-item-section>{{ opt.label }}</q-item-section>
                    <q-item-section side v-if="unifiedSearch.searchTarget.value === opt.value">
                      <q-icon name="check" size="16px" color="primary" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </template>
        </q-input>
      </div>
      <!-- 타겟별 필터 (2행) -->
      <div v-if="unifiedSearch.searchTarget.value === 'chat'" class="filter-row filter-row--chat row q-mt-xs q-gutter-xs items-center">
        <span class="text-caption text-grey-7">범위:</span>
        <q-btn-toggle :model-value="unifiedSearch.chatSearchTarget.value" toggle-color="primary" dense no-caps size="sm" :options="chatFilterOptions" class="chat-range-toggle" @update:model-value="unifiedSearch.setChatSearchTarget" />
      </div>
      <div v-else-if="unifiedSearch.searchTarget.value === 'files'" class="filter-row filter-row--files row q-mt-xs q-gutter-xs items-center wrap">
        <q-select :model-value="fileFilters.sortBy?.value" dense outlined emit-value map-options options-dense :options="FILE_SORT_OPTIONS" class="filter-select" style="min-width: 100px" @update:model-value="(v) => unifiedSearch.setFileFilter({ sortBy: v })" />
        <q-select :model-value="fileFilters.filterCategory?.value" dense outlined emit-value map-options options-dense :options="FILE_CATEGORY_OPTIONS" class="filter-select" style="min-width: 90px" @update:model-value="(v) => unifiedSearch.setFileFilter({ filterCategory: v })" />
        <q-select :model-value="fileFilters.scopeDomain?.value" dense outlined emit-value map-options options-dense :options="fileDomainOptions" class="filter-select" style="min-width: 90px" @update:model-value="onFileScopeChange" />
        <q-btn flat dense round size="sm" icon="refresh" @click="fileExplorer.refreshList()">
          <q-tooltip>새로고침</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- 파일 업로드 (모든 탭 통일: 채팅·노트·미디어 검색 아래) -->
    <div class="media-upload-area q-px-sm q-py-xs q-mx-sm q-mb-xs rounded-borders">
      <q-btn flat dense no-caps size="sm" :icon="showMediaUpload ? 'expand_less' : 'cloud_upload'" :label="showMediaUpload ? '업로드 영역 접기' : '파일 업로드'" class="full-width media-upload-btn" @click="showMediaUpload = !showMediaUpload" />
      <div v-show="showMediaUpload" class="q-mt-xs">
        <FileDropZone upload-url="/files/upload" list-url="/files/list?domain=ai" accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.csv" label="이미지·오디오·영상·문서를 드래그하거나 선택하세요 (모든 탭 공용)" @add="handleMediaAdd" />
        <UploadProgress :files="uploadProgressFiles" :show="showUploadProgress" />
      </div>
    </div>

    <!-- 공유 툴바 (설정 기반) -->
    <div v-if="showToolbar" class="list-management-toolbar q-pa-sm q-mx-sm q-mb-xs rounded-borders">
      <div class="row items-center no-wrap full-width justify-between">
        <div class="toolbar-label text-caption text-grey-6">{{ toolbarLabel }}</div>
        <div class="toolbar-actions row q-gutter-xs flex-shrink-0">
          <template v-for="btn in toolbarItems" :key="btn.id">
            <q-btn v-if="btn.type === 'menu'" flat dense round :size="btn.size || 'sm'" :icon="btn.icon" :title="btn.title">
              <q-menu anchor="bottom start" self="top start" :offset="[0, 4]">
                <q-list dense style="min-width: 140px">
                  <q-item v-for="mi in btn.menuItems" :key="mi.label" clickable v-close-popup @click="mi.onClick?.()">
                    <q-item-section avatar>
                      <q-icon :name="mi.icon" size="18px" />
                    </q-item-section>
                    <q-item-section>{{ mi.label }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
            <q-btn v-else flat dense round :size="btn.size || 'sm'" :icon="btn.icon" :title="btn.title" :color="btn.color" :disable="btn.disabled" @click="btn.onClick?.()" />
          </template>
        </div>
      </div>
    </div>

    <q-tab-panels v-model="leftMainTab" animated class="col left-main-panels">
      <q-tab-panel name="chat" class="q-pa-none left-panel-inner">
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
                <div v-if="filteredMemos.length === 0" class="ai-placeholder text-grey-6 text-caption">{{ memos.length === 0 ? '채팅에서 우클릭 → 메모로 추가' : '검색 결과 없음' }}</div>
                <q-list v-else dense class="memo-list">
                  <transition-group name="memo-move" tag="div" class="memo-transition-group">
                    <q-item v-for="m in filteredMemos" :key="m.id" clickable class="memo-item memo-item-clickable" :class="{ 'memo-item-selected': selectedMemoId === m.id }" @click="onMemoClick(m)">
                      <q-item-section avatar>
                        <q-icon name="sticky_note_2" size="18px" color="grey-6" />
                      </q-item-section>
                      <q-item-section class="memo-item-content">
                        <q-item-label class="text-caption ellipsis" :title="m.content">{{ getMemoPreview(m.content) }}</q-item-label>
                        <q-item-label caption>{{ formatMemoDate(m.createdAt) }}</q-item-label>
                      </q-item-section>
                      <q-item-section side class="memo-item-actions">
                        <q-btn flat dense round size="sm" icon="edit_note" color="grey-6" title="에디터에 넣기" @click.stop="injectMemoToEditor(m)" />
                      </q-item-section>
                    </q-item>
                  </transition-group>
                </q-list>
              </div>
            </q-expansion-item>
            <q-expansion-item v-model="expandedDocuments" icon="description" label="문서" @show="aiAssets.loadCategory('documents')">
              <div class="ai-accordion-content">
                <q-list dense class="q-mt-sm">
                  <q-item v-for="f in documents.length ? documents : docPlaceholders" :key="f.id" clickable :class="{ 'text-grey-6': !f.url }" @click="f.url ? onDocumentClick(f) : null" @contextmenu.prevent="f.url ? openMediaContextMenu($event, f) : null">
                    <q-item-section>{{ f.original_name }}</q-item-section>
                  </q-item>
                </q-list>
              </div>
            </q-expansion-item>
          </div>
        </div>
      </q-tab-panel>

      <q-tab-panel name="media" class="q-pa-none left-panel-inner">
        <div class="panel-scroll-area">
          <div class="ai-panel-padding">
            <q-expansion-item v-model="expandedGallery" icon="photo_library" label="갤러리" @show="aiAssets.loadCategory('images')">
              <div class="ai-accordion-content">
                <q-list dense class="q-mt-sm">
                  <transition-group name="media-move" tag="div" class="media-transition-group">
                    <q-item v-for="f in displayImages" :key="f.id" clickable :class="{ 'text-grey-6': !f.url, 'media-item-selected': selectedMediaItem?.category === 'images' && selectedMediaItem?.item?.id === f.id }" @click="f.url ? onMediaItemClick(f, 'images') : null" @contextmenu.prevent="f.url ? openMediaContextMenu($event, f) : null">
                      <q-item-section v-if="f.url" avatar>
                        <img :src="getUploadDisplayUrl(f.file_path) || f.url" :alt="f.original_name" class="media-thumb media-thumb-img" loading="lazy" />
                      </q-item-section>
                      <q-item-section v-else avatar>
                        <q-icon name="image" size="24px" color="grey-5" />
                      </q-item-section>
                      <q-item-section>{{ f.original_name }}</q-item-section>
                      <q-item-section v-if="f.url" side @click.stop="requestAttachToChat(f)">
                        <q-icon name="add_photo_alternate" size="18px" class="text-grey-6" title="채팅에 첨부" />
                      </q-item-section>
                    </q-item>
                  </transition-group>
                </q-list>
              </div>
            </q-expansion-item>
            <q-expansion-item v-model="expandedAudio" icon="music_note" label="사운드" @show="aiAssets.loadCategory('audio')">
              <div class="ai-accordion-content">
                <q-list dense class="q-mt-sm">
                  <transition-group name="media-move" tag="div" class="media-transition-group">
                    <q-item v-for="f in displayAudio" :key="f.id" clickable :class="{ 'text-grey-6': !f.url, 'media-item-selected': selectedMediaItem?.category === 'audio' && selectedMediaItem?.item?.id === f.id }" @click="f.url ? onMediaItemClick(f, 'audio') : null" @contextmenu.prevent="f.url ? openMediaContextMenu($event, f) : null">
                      <q-item-section avatar>
                        <div class="media-audio-thumb">
                          <q-icon name="music_note" size="28px" color="grey-6" />
                          <div class="media-waveform-placeholder">
                            <span v-for="i in 5" :key="i" class="wave-bar" :style="{ height: 30 + (i % 3) * 25 + '%' }" />
                          </div>
                        </div>
                      </q-item-section>
                      <q-item-section>
                        <span class="ellipsis">{{ f.original_name }}</span>
                      </q-item-section>
                    </q-item>
                  </transition-group>
                </q-list>
              </div>
            </q-expansion-item>
            <q-expansion-item v-model="expandedVideo" icon="videocam" label="영상" @show="aiAssets.loadCategory('video')">
              <div class="ai-accordion-content">
                <q-list dense class="q-mt-sm">
                  <transition-group name="media-move" tag="div" class="media-transition-group">
                    <q-item v-for="f in displayVideos" :key="f.id" clickable :class="{ 'text-grey-6': !f.url, 'media-item-selected': selectedMediaItem?.category === 'video' && selectedMediaItem?.item?.id === f.id }" @click="f.url ? onMediaItemClick(f, 'video') : null" @contextmenu.prevent="f.url ? openMediaContextMenu($event, f) : null">
                      <q-item-section v-if="f.url" avatar>
                        <video :src="getUploadDisplayUrl(f.file_path) || f.url" preload="metadata" class="media-thumb media-thumb-video" muted playsinline />
                      </q-item-section>
                      <q-item-section v-else avatar>
                        <q-icon name="videocam" size="24px" color="grey-5" />
                      </q-item-section>
                      <q-item-section>
                        <span class="ellipsis">{{ f.original_name }}</span>
                      </q-item-section>
                    </q-item>
                  </transition-group>
                </q-list>
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

    <!-- 노트/미디어 우클릭 컨텍스트 메뉴 (우측 탐색기와 동일) -->
    <q-menu v-model="contextMenuVisible" context-menu :position-x="contextMenuX" :position-y="contextMenuY" class="ai-media-context-menu">
      <q-list dense style="min-width: 180px">
        <q-item clickable v-close-popup @click="injectToChatFromContext">
          <q-item-section avatar><q-icon name="chat" /></q-item-section>
          <q-item-section>채팅에 넣기</q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="injectToEditorFromContext">
          <q-item-section avatar><q-icon name="edit_note" /></q-item-section>
          <q-item-section>에디터에 넣기</q-item-section>
        </q-item>
        <q-separator />
        <q-item clickable v-close-popup @click="openInImageEditorFromContext">
          <q-item-section avatar><q-icon name="image" /></q-item-section>
          <q-item-section>이미지 편집</q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="openInAudioEditorFromContext">
          <q-item-section avatar><q-icon name="graphic_eq" /></q-item-section>
          <q-item-section>음원 편집</q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="openInVideoEditorFromContext">
          <q-item-section avatar><q-icon name="videocam" /></q-item-section>
          <q-item-section>영상 편집</q-item-section>
        </q-item>
      </q-list>
    </q-menu>

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

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { Notify } from 'quasar'
import StandardLeftHeader from '@frame/layout/components/StandardLeftHeader.vue'
import WebcamViewer from '@system/components/ui/WebcamViewer.vue'
import FileDropZone from '@system/components/ui/FileDropZone.vue'
import UploadProgress from '@system/components/ui/UploadProgress.vue'
import { getUploadDisplayUrl } from '@system/utils/apiBaseUrl'
import { useAiChannels } from '../../composables/useAiChannels'
import { useAiAssets } from '../../composables/useAiAssets'
import { useAiLeftToolbar } from '../../composables/useAiLeftToolbar'
import { useAiUnifiedSearch, registerChannelsSync, SEARCH_TARGET_OPTIONS, CHAT_SEARCH_TARGET_OPTIONS, FILE_SORT_OPTIONS, FILE_CATEGORY_OPTIONS } from '../../composables/useAiUnifiedSearch'
import { useAiSettings, requestAttachToChat } from '../../composables/useAiSettings'
import { useAiExplorerSelection } from '../../composables/useAiExplorerSelection'
import { useAiMemos } from '../../composables/useAiMemos'
import { useAiInsertRequest } from '../../composables/useAiInsertRequest'
import { useAiMediaTab } from '../../composables/useAiMediaTab'
import { useFileSelection } from '@system/composables/useFileSelection'
import { showPanel } from '../../composables/useAiSplitLayout'

const { memos, loadMemos, removeMemo, moveMemoUp, moveMemoDown, getMemoPreview } = useAiMemos()
const { setSelectedFile } = useFileSelection()
const aiAssets = useAiAssets()
const { requestInsert, requestOpenEditor } = useAiInsertRequest()
const { onOpenMediaTab } = useAiMediaTab()
const { requestInjectToEditor, requestOpenInImageEditor, requestOpenInAudioEditor, requestOpenInVideoEditor } = useAiExplorerSelection()

const { documents, images, audio, videos, uploadProgressFiles, showUploadProgress } = aiAssets

const showMediaUpload = ref(false)
const expandedGallery = ref(true)
const expandedAudio = ref(false)
const expandedVideo = ref(false)
const expandedDocuments = ref(false)
const contextMenuVisible = ref(false)
const contextMenuFile = ref(null)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
function injectMemoToEditor(m) {
  const text = m?.content ? String(m.content).trim() : ''
  if (!text) return
  showPanel('editor')
  requestInsert(text)
  Notify.create({ message: '에디터에 삽입되었습니다.', icon: 'edit_note' })
}

function openMediaContextMenu(evt, f) {
  if (!f?.url) return
  contextMenuFile.value = f
  contextMenuX.value = evt?.clientX ?? 0
  contextMenuY.value = evt?.clientY ?? 0
  contextMenuVisible.value = true
}

function injectToChatFromContext() {
  const file = contextMenuFile.value
  if (!file) return
  if (!isImageForChat(file)) {
    Notify.create({ type: 'info', message: '이미지만 채팅에 첨부할 수 있습니다.' })
    return
  }
  const url = file.file_path ? getUploadDisplayUrl(file.file_path) : file.url
  if (!url) {
    Notify.create({ type: 'warning', message: '파일 URL을 가져올 수 없습니다.' })
    return
  }
  requestAttachToChat({ url, original_name: file.original_name, file_path: file.file_path })
  showPanel('chat')
  Notify.create({ message: `"${file.original_name}" 채팅에 첨부됨`, icon: 'check_circle' })
}

function injectToEditorFromContext() {
  const file = contextMenuFile.value
  if (file) requestInjectToEditor(file)
}

function openInImageEditorFromContext() {
  const file = contextMenuFile.value
  if (file) requestOpenInImageEditor(file)
}

function openInAudioEditorFromContext() {
  const file = contextMenuFile.value
  if (file) requestOpenInAudioEditor(file)
}

function openInVideoEditorFromContext() {
  const file = contextMenuFile.value
  if (file) requestOpenInVideoEditor(file)
}

function isImageForChat(file) {
  if (!file) return false
  const cat = inferCategoryFromPayload({ file_type: file.file_type, type: file.category })
  return cat === 'images'
}

function openMediaAccordion(category) {
  if (category === 'images') expandedGallery.value = true
  else if (category === 'audio') expandedAudio.value = true
  else if (category === 'video') expandedVideo.value = true
  else if (category === 'documents') expandedDocuments.value = true
}

function inferCategoryFromPayload(p) {
  const t = (p.type || p.file_type || '').toLowerCase()
  if (t.includes('image')) return 'images'
  if (t.includes('audio')) return 'audio'
  if (t.includes('video')) return 'video'
  return 'documents'
}

function onDocumentClick(f) {
  if (!f?.url) return
  setSelectedFile(f)
  showPanel('viewer')
}

function onMediaItemClick(f, category) {
  if (!f?.url) return
  setSelectedFile(f)
  showPanel('viewer')
  selectMediaItem(category, f)
}

async function handleMediaAdd(p) {
  const cat = p.category || inferCategoryFromPayload(p)
  try {
    await aiAssets.addAsset({ ...p, category: cat })
    openMediaAccordion(cat)
    if (cat === 'documents') leftMainTab.value = 'note'
    else leftMainTab.value = 'media'
    unifiedSearch.fileExplorer.refreshList()
  } catch {
    /* addAsset already shows Notify on error */
  }
}

const { selectedMediaItem, selectMediaItem } = aiAssets

/** 빈 리스트일 때 UI 확인용 플레이스홀더 */
const galleryPlaceholders = [
  { id: 'ph-img-1', original_name: '(등록된 이미지 없음)' },
  { id: 'ph-img-2', original_name: '(업로드 또는 웹서버에서 선택)' },
]
const docPlaceholders = [{ id: 'ph-doc-1', original_name: '(등록된 문서 없음)' }]
const audioPlaceholders = [{ id: 'ph-audio-1', original_name: '(등록된 오디오 없음)' }]
const videoPlaceholders = [{ id: 'ph-video-1', original_name: '(등록된 영상 없음)' }]

const selectedMemoId = ref(null)
const selectedMemo = computed(() => (selectedMemoId.value ? memos.value.find((m) => m.id === selectedMemoId.value) : null))

const filteredMemos = computed(() => {
  const q = (searchQuery.value || '').trim().toLowerCase()
  if (!q) return memos.value
  return memos.value.filter((m) => (m.content || '').toLowerCase().includes(q))
})

const showToolbar = computed(() => true)

function onMemoClick(m) {
  selectedMemoId.value = m.id
  if (m?.content) {
    setSelectedFile({ id: m.id, original_name: '메모', file_type: 'memo', content: m.content || '' })
    showPanel('viewer')
  }
}

function handleNoteAdd() {
  selectedMemoId.value = null
  requestOpenEditor()
}

function handleNoteEdit() {
  const m = selectedMemo.value
  if (!m) return
  requestInsert(m.content)
}

async function handleRemoveMemo(m) {
  try {
    await removeMemo(m.id)
    if (selectedMemoId.value === m.id) selectedMemoId.value = null
    Notify.create({ message: '삭제됨', icon: 'check_circle' })
  } catch (e) {
    Notify.create({ type: 'negative', message: e?.message || '삭제 실패' })
  }
}

async function handleNoteDelete() {
  const m = selectedMemo.value
  if (!m) return
  await handleRemoveMemo(m)
  selectedMemoId.value = null
}

const canMoveMemoUp = computed(() => {
  if (!selectedMemoId.value) return false
  const idx = memos.value.findIndex((m) => m.id === selectedMemoId.value)
  return idx > 0
})

const canMoveMemoDown = computed(() => {
  if (!selectedMemoId.value) return false
  const idx = memos.value.findIndex((m) => m.id === selectedMemoId.value)
  return idx >= 0 && idx < memos.value.length - 1
})

async function handleNoteMoveUp() {
  if (!selectedMemoId.value) return
  try {
    await moveMemoUp(selectedMemoId.value)
    Notify.create({ message: '위로 이동', icon: 'check_circle' })
  } catch (e) {
    Notify.create({ type: 'negative', message: e?.message || '이동 실패' })
  }
}

async function handleNoteMoveDown() {
  if (!selectedMemoId.value) return
  try {
    await moveMemoDown(selectedMemoId.value)
    Notify.create({ message: '아래로 이동', icon: 'check_circle' })
  } catch (e) {
    Notify.create({ type: 'negative', message: e?.message || '이동 실패' })
  }
}

function formatMemoDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  return isToday ? d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

const unifiedSearch = useAiUnifiedSearch()
const fileFilters = unifiedSearch.fileFiltersRefs
const fileExplorer = unifiedSearch.fileExplorer

const unifiedSearchPlaceholder = computed(() => {
  const t = unifiedSearch.searchTarget.value
  const labels = { chat: '채널·대화 검색', note: '메모 검색', media: '미디어 검색', files: '파일 검색' }
  return labels[t] || '검색'
})

const unifiedSearchTargetIcon = computed(() => {
  const v = unifiedSearch.searchTarget.value
  return SEARCH_TARGET_OPTIONS.find((o) => o.value === v)?.icon ?? 'search'
})

const chatFilterOptions = CHAT_SEARCH_TARGET_OPTIONS.map((o) => ({ label: o.label, value: o.value }))

const fileDomainOptions = computed(() => {
  const options = [{ value: '', label: '전체' }]
  const nodes = fileExplorer.treeNodes.value || []
  for (const n of nodes) {
    if (n.domain) options.push({ value: n.domain, label: n.domain })
  }
  return options
})

function onFileScopeChange(val: string) {
  unifiedSearch.setFileFilter({ scopeDomain: val })
  if (val) {
    const node = fileExplorer.treeNodes.value?.find((n: { domain?: string }) => n.domain === val)
    if (node) fileExplorer.selectNode(node)
  } else {
    const first = fileExplorer.treeNodes.value?.[0]
    if (first) fileExplorer.selectNode(first)
  }
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

const filterByQuery = (arr, getText) => {
  const q = (searchQuery.value || '').trim().toLowerCase()
  if (!q) return arr
  return arr.filter((x) => (getText(x) || '').toLowerCase().includes(q))
}
const filteredImages = computed(() => filterByQuery(images.value || [], (f) => f.original_name))
const filteredAudio = computed(() => filterByQuery(audio.value || [], (f) => f.original_name))
const filteredVideos = computed(() => filterByQuery(videos.value || [], (f) => f.original_name))
const displayImages = computed(() => ((searchQuery.value || '').trim() ? filteredImages.value : images.value?.length ? images.value : galleryPlaceholders))
const displayAudio = computed(() => ((searchQuery.value || '').trim() ? filteredAudio.value : audio.value?.length ? audio.value : audioPlaceholders))
const displayVideos = computed(() => ((searchQuery.value || '').trim() ? filteredVideos.value : videos.value?.length ? videos.value : videoPlaceholders))

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
let unregisterOpenMediaTab = null

watch(
  () => unifiedSearch.searchTarget.value,
  (t) => {
    if (t === 'files' && (!fileExplorer.treeNodes.value || fileExplorer.treeNodes.value.length === 0)) {
      fileExplorer.loadTree()
    }
  },
  { immediate: true },
)

onMounted(async () => {
  registerChannelsSync(searchQuery, searchTarget)
  init()
  unregisterOpenMediaTab = onOpenMediaTab((category) => {
    openMediaAccordion(category)
    if (category === 'documents') leftMainTab.value = 'note'
    else leftMainTab.value = 'media'
  })
  if (channels.value.length > 0 && !selectedChannelId.value) {
    selectChannel(channels.value[0].id)
  }
  // DB에 저장된 파일·메모 목록 로드
  await Promise.all([loadMemos(), aiAssets.loadCategory('documents'), aiAssets.loadCategory('images'), aiAssets.loadCategory('audio'), aiAssets.loadCategory('video')])
})

onBeforeUnmount(() => {
  unregisterOpenMediaTab?.()
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

const toolbarCtx = {
  leftMainTab,
  searchTarget,
  showAddChannel,
  selectedChat,
  selectedChannel,
  selectedChannelId,
  selectedChatId,
  handleAddChatFromToolbar,
  openEditChat,
  openEditChannel,
  confirmDeleteChat,
  confirmDeleteChannel,
  canMoveChatUp,
  canMoveChatDown,
  canMoveChannelUp,
  canMoveChannelDown,
  moveChatUp,
  moveChatDown,
  moveChannelUp,
  moveChannelDown,
  selectedMemo,
  handleNoteAdd,
  handleNoteEdit,
  handleNoteMoveUp,
  handleNoteMoveDown,
  handleNoteDelete,
  canMoveMemoUp,
  canMoveMemoDown,
  selectedMediaItem: aiAssets.selectedMediaItem,
  canMoveMediaUp: aiAssets.canMoveMediaUp,
  canMoveMediaDown: aiAssets.canMoveMediaDown,
  handleMediaDelete: aiAssets.handleMediaDelete,
  handleMediaMoveUp: aiAssets.handleMediaMoveUp,
  handleMediaMoveDown: aiAssets.handleMediaMoveDown,
}
const { toolbarItems, toolbarLabel } = useAiLeftToolbar(toolbarCtx)

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
      background-color: var(--nexa-button-save-bg);
    }
  }

  .add-chat-item .chat-item-icon {
    flex-shrink: 0;
    min-width: 20px;
    padding-right: 2px;
  }

  .channel-move-move,
  .chat-move-move,
  .memo-move-move,
  .media-move-move {
    transition: transform 0.25s ease;
  }

  .channel-transition-group,
  .chat-transition-group,
  .memo-transition-group,
  .media-transition-group {
    display: contents;
  }

  .media-upload-area {
    background: var(--nexa-background-darker);
    border: 1px solid var(--nexa-border-color);
    border-radius: 4px;
    min-width: 0;
  }
  .media-upload-btn :deep(.q-btn__content) {
    font-size: 0.8rem;
  }

  .search-form {
    background: var(--nexa-surface-header-bg, var(--nexa-background-darker));
    border: 1px solid var(--nexa-border-color);
    border-radius: 4px;

    .search-row {
      min-width: 0;
    }
    .filter-row {
      min-width: 0;
    }
    .filter-row--chat .chat-range-toggle :deep(.q-btn) {
      padding-left: 16px;
      padding-right: 16px;
    }
    .filter-row--files {
      padding-top: 0;
      padding-bottom: 0;
      margin-top: 4px;
    }
    .filter-row--files .filter-select {
      flex: 0 1 auto;
      min-width: 0;
    }
    .filter-row--files .filter-select :deep(.q-field__control) {
      min-height: 28px;
      height: 28px;
    }
    .filter-row--files .filter-select :deep(.q-field__control-container) {
      padding-top: 0;
      padding-bottom: 0;
    }
    .filter-row--files .filter-select :deep(.q-field__native) {
      min-height: 28px;
      padding-top: 0;
      padding-bottom: 0;
    }
    .filter-select {
      flex: 0 1 auto;
      min-width: 0;
    }
    .search-target-btn {
      margin-right: -4px;
    }
  }

  .media-item-selected {
    background-color: var(--nexa-background-darker, rgba(0, 0, 0, 0.06));
    font-weight: 600;
  }

  .media-thumb {
    width: 48px;
    height: 48px;
    border-radius: 6px;
    object-fit: cover;
    flex-shrink: 0;
  }

  .media-thumb-img {
    display: block;
  }

  .media-thumb-video {
    background: #000;
  }

  .media-audio-thumb {
    width: 48px;
    height: 48px;
    border-radius: 6px;
    background: var(--nexa-background-darker, rgba(0, 0, 0, 0.06));
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .media-waveform-placeholder {
    position: absolute;
    bottom: 4px;
    left: 6px;
    right: 6px;
    height: 10px;
    display: flex;
    align-items: flex-end;
    gap: 2px;
  }

  .media-waveform-placeholder .wave-bar {
    flex: 1;
    min-width: 2px;
    background: rgba(128, 128, 128, 0.5);
    border-radius: 1px;
  }

  .media-audio-row,
  .media-video-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .media-audio-row .ellipsis,
  .media-video-row .ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .media-audio-player,
  .media-video-player {
    width: 100%;
    max-width: 200px;
    height: 28px;
    min-height: 28px;
  }

  .media-video-player {
    height: 80px;
    min-height: 80px;
    max-height: 120px;
    object-fit: contain;
  }

  .list-management-toolbar {
    background: var(--nexa-surface-header-bg, var(--nexa-background-darker));
    border: 1px solid var(--nexa-border-color, rgba(0, 0, 0, 0.12));
    min-width: 0;

    .toolbar-actions {
      flex-shrink: 0;
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
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

  .memo-item-selected {
    background-color: var(--nexa-background-darker, rgba(0, 0, 0, 0.06));
    color: var(--nexa-accent);
  }
}
</style>
