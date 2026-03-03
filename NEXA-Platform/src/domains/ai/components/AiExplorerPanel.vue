<template>
  <div class="ai-explorer-panel column" @contextmenu.prevent="onContextMenuTrigger">
    <GlobalFileExplorer mode="embed" class="col ai-explorer-embed" @select="onSelect" @contextmenu="onContextMenu" />
    <div v-if="selectedFile" class="action-bar row items-center q-pa-sm q-gutter-sm flex-wrap">
      <span class="text-caption text-grey-7">선택: {{ selectedFile.original_name }}</span>
      <q-btn dense flat size="sm" label="미디어에 추가" icon="library_add" @click="addToMedia" :loading="addingToMedia" />
      <q-btn dense flat size="sm" label="채팅에 넣기" icon="chat" @click="injectToChat" />
      <q-btn dense flat size="sm" label="에디터에 넣기" icon="edit_note" @click="injectToEditor" />
      <q-btn dense flat size="sm" label="이미지 편집" icon="image" @click="openInImageEditor" />
      <q-btn dense flat size="sm" label="음원 편집" icon="graphic_eq" @click="openInAudioEditor" />
      <q-btn dense flat size="sm" label="영상 편집" icon="videocam" @click="openInVideoEditor" />
    </div>
    <q-menu v-model="contextMenuVisible" context-menu class="explorer-context-menu">
      <q-list dense style="min-width: 180px">
        <q-item clickable v-close-popup @click="addToMedia">
          <q-item-section avatar><q-icon name="library_add" /></q-item-section>
          <q-item-section>미디어에 추가</q-item-section>
          <q-item-section side v-if="addingToMedia"><q-spinner-dots size="16px" /></q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="injectToChat">
          <q-item-section avatar><q-icon name="chat" /></q-item-section>
          <q-item-section>채팅에 넣기</q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="injectToEditor">
          <q-item-section avatar><q-icon name="edit_note" /></q-item-section>
          <q-item-section>에디터에 넣기</q-item-section>
        </q-item>
        <q-separator />
        <q-item clickable v-close-popup @click="openInImageEditor">
          <q-item-section avatar><q-icon name="image" /></q-item-section>
          <q-item-section>이미지 편집</q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="openInAudioEditor">
          <q-item-section avatar><q-icon name="graphic_eq" /></q-item-section>
          <q-item-section>음원 편집</q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="openInVideoEditor">
          <q-item-section avatar><q-icon name="videocam" /></q-item-section>
          <q-item-section>영상 편집</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Notify } from 'quasar'
import GlobalFileExplorer from '@system/components/ui/explorer/GlobalFileExplorer.vue'
import { useFileSelection } from '@system/composables/useFileSelection'
import { useAiExplorerSelection } from '../composables/useAiExplorerSelection'
import { useAiAssets } from '../composables/useAiAssets'
import { useAiSettings } from '../composables/useAiSettings'
import { useAiMediaTab } from '../composables/useAiMediaTab'
import { showPanel } from '../composables/useAiSplitLayout'
import { getUploadDisplayUrl } from '@system/utils/apiBaseUrl'

const { selectedFile, setSelectedFile } = useFileSelection()
const { requestInjectToEditor, requestOpenInImageEditor, requestOpenInAudioEditor, requestOpenInVideoEditor, requestOpenInCodePanel } = useAiExplorerSelection()

const CODE_EXTENSIONS = ['js', 'mjs', 'cjs', 'ts', 'mts', 'cts', 'jsx', 'tsx', 'json', 'yaml', 'yml', 'xml', 'py', 'css', 'scss', 'html', 'htm', 'md', 'sql', 'sh', 'bash', 'vue', 'env', 'toml', 'ini', 'cfg', 'conf']
function isCodeFile(file) {
  if (!file?.original_name) return false
  const ext = (file.original_name || '').toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] || ''
  return CODE_EXTENSIONS.includes(ext)
}

function getFileExt(file) {
  const name = (file?.original_name || file?.file_path || '').toLowerCase()
  return name.match(/\.([a-z0-9]+)$/)?.[1] || ''
}

function isCsvFile(file) {
  return getFileExt(file) === 'csv'
}

function isTiptapMediaFile(file) {
  const t = (file?.file_type || file?.category || '').toLowerCase()
  if (['image', 'images', 'audio', 'video'].includes(t)) return true
  const ext = getFileExt(file)
  const mediaExt = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma', 'mp4', 'webm', 'mkv', 'mov', 'avi', 'wmv', 'flv', 'm4v', 'csv']
  return mediaExt.includes(ext)
}
const { addFileToMedia } = useAiAssets()
const { requestAttachToChat } = useAiSettings()
const { requestOpenMediaTab } = useAiMediaTab()
const addingToMedia = ref(false)
const contextMenuVisible = ref(false)

function onSelect(file) {
  if (!file) return
  if (isCodeFile(file)) {
    requestOpenInCodePanel(file)
  } else if (isCsvFile(file)) {
    requestInjectToEditor(file)
    showPanel('editor')
  } else if (isTiptapMediaFile(file)) {
    requestInjectToEditor(file)
    showPanel('editor')
  } else {
    showPanel('viewer')
  }
}

function onContextMenu(_evt, file) {
  if (file) setSelectedFile(file)
}

function onContextMenuTrigger() {
  if (selectedFile.value) contextMenuVisible.value = true
}

function isImage(file) {
  const t = (file?.file_type || file?.category || '').toLowerCase()
  return t === 'image' || t === 'images'
}

function injectToChat() {
  const file = selectedFile.value
  if (!file) return
  if (!isImage(file)) {
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

function injectToEditor() {
  if (selectedFile.value) requestInjectToEditor(selectedFile.value)
}

function openInImageEditor() {
  if (selectedFile.value) requestOpenInImageEditor(selectedFile.value)
}

function openInAudioEditor() {
  if (selectedFile.value) requestOpenInAudioEditor(selectedFile.value)
}

function openInVideoEditor() {
  if (selectedFile.value) requestOpenInVideoEditor(selectedFile.value)
}

function inferMediaCategory(file) {
  const t = (file?.file_type || file?.category || '').toLowerCase()
  if (t === 'image' || t === 'images') return 'images'
  if (t === 'audio') return 'audio'
  if (t === 'video') return 'video'
  return 'documents'
}

async function addToMedia() {
  const file = selectedFile.value
  if (!file) return
  addingToMedia.value = true
  try {
    await addFileToMedia(file)
    const cat = inferMediaCategory(file)
    requestOpenMediaTab(cat)
    Notify.create({ message: `"${file.original_name}" 미디어에 추가됨`, icon: 'check_circle' })
  } catch (err) {
    Notify.create({ type: 'negative', message: err.message || '미디어 추가 실패' })
  } finally {
    addingToMedia.value = false
  }
}
</script>

<style lang="scss" scoped>
.ai-explorer-panel {
  min-height: 0;
  height: 100%;
}
.action-bar {
  flex-shrink: 0;
  border-top: 1px solid var(--nexa-border-color);
  background: var(--nexa-surface);
}

/* deep 사용 이유: GlobalFileExplorer 헤더 타이틀 숨김, embed 모드에서 중복 표시 방지 */
.ai-explorer-embed :deep(.explorer-top-bar-title) {
  display: none;
}

/* 우측 아이템 구분선: nexa-border-color 테마 칼라 */
.ai-explorer-panel :deep(.explorer-file-item),
.ai-explorer-panel :deep(.q-virtual-scroll .q-item) {
  border-color: var(--nexa-border-color) !important;
}
.ai-explorer-panel :deep(.q-splitter__separator),
.ai-explorer-panel :deep(.q-splitter__separator-area) {
  background-color: var(--nexa-border-color);
}
</style>
