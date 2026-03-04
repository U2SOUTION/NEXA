<template>
  <div class="ai-explorer-panel column" @contextmenu.prevent="onContextMenuTrigger">
    <GlobalFileExplorer
      mode="embed"
      class="col ai-explorer-embed"
      :tree-width="explorerTreeWidth"
      @update:tree-width="onExplorerTreeWidthUpdate"
      @select="onSelect"
      @contextmenu="onContextMenu"
    />
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
          <q-item-section>네레이션에 넣기</q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="injectToEditor">
          <q-item-section avatar><q-icon name="edit_note" /></q-item-section>
          <q-item-section>로직에 넣기</q-item-section>
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
import { showPanel, explorerTreeWidth } from '../composables/useAiSplitLayout'
import { getUploadDisplayUrl } from '@system/utils/apiBaseUrl'

const { selectedFile, setSelectedFile } = useFileSelection()
const { requestInjectToEditor, requestOpenInImageEditor, requestOpenInAudioEditor, requestOpenInVideoEditor, requestOpenInCodePanel } = useAiExplorerSelection()

function onExplorerTreeWidthUpdate(v: number) {
  explorerTreeWidth.value = v
}

// Phase 3: extToMonacoLanguage와 동기화 (웹·ESP32·모바일·설정)
const CODE_EXTENSIONS = [
  'js',
  'mjs',
  'cjs',
  'ts',
  'mts',
  'cts',
  'jsx',
  'tsx',
  'json',
  'yaml',
  'yml',
  'xml',
  'py',
  'css',
  'scss',
  'html',
  'htm',
  'vue',
  'md',
  'sql',
  'sh',
  'bash',
  'env',
  'toml',
  'ini',
  'cfg',
  'conf',
  'c',
  'h',
  'cpp',
  'cc',
  'cxx',
  'hpp',
  'ino',
  'kt',
  'kts',
  'swift',
  'dart',
  'dockerfile',
  'makefile',
  'mk',
]
function isCodeFile(file) {
  if (!file?.original_name) return false
  const ext = (file.original_name || '').toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] || ''
  return CODE_EXTENSIONS.includes(ext)
}

function getFileExt(file) {
  const name = (file?.original_name || file?.file_path || '').toLowerCase()
  return name.match(/\.([a-z0-9]+)$/)?.[1] || ''
}

const { addFileToMedia } = useAiAssets()
const { requestAttachToChat } = useAiSettings()
const { requestOpenMediaTab } = useAiMediaTab()
const addingToMedia = ref(false)
const contextMenuVisible = ref(false)

/** 클릭: 뷰어에 단일 표시. md도 파서로 뷰어. 코드 파일(md 제외)만 Monaco. 삽입은 우클릭 "에디터에 넣기"로만. */
function onSelect(file) {
  if (!file) return
  if (getFileExt(file) === 'md') {
    showPanel('sense')
    return
  }
  if (isCodeFile(file)) {
    requestOpenInCodePanel(file)
    return
  }
  showPanel('sense')
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
  showPanel('dialogue')
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
