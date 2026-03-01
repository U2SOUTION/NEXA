<template>
  <div class="ai-explorer-panel column">
    <GlobalFileExplorer mode="embed" class="col ai-explorer-embed" @select="onSelect" />
    <div v-if="selectedFile" class="action-bar row items-center q-pa-sm q-gutter-sm flex-wrap">
      <span class="text-caption text-grey-7">선택: {{ selectedFile.original_name }}</span>
      <q-btn dense flat size="sm" label="미디어에 추가" icon="library_add" @click="addToMedia" :loading="addingToMedia" />
      <q-btn dense flat size="sm" label="채팅에 넣기" icon="chat" @click="injectToChat" />
      <q-btn dense flat size="sm" label="에디터에 넣기" icon="edit_note" @click="injectToEditor" />
      <q-btn dense flat size="sm" label="이미지 편집" icon="image" @click="openInImageEditor" />
      <q-btn dense flat size="sm" label="음원 편집" icon="graphic_eq" @click="openInAudioEditor" />
      <q-btn dense flat size="sm" label="영상 편집" icon="videocam" @click="openInVideoEditor" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Notify } from 'quasar'
import GlobalFileExplorer from '@system/components/ui/explorer/GlobalFileExplorer.vue'
import { useFileSelection } from '@system/composables/useFileSelection'
import { useAiExplorerSelection } from '../composables/useAiExplorerSelection'
import { useAiAssets } from '../composables/useAiAssets'
import { showPanel } from '../composables/useAiSplitLayout'

const { selectedFile } = useFileSelection()
const { requestInjectToChat, requestInjectToEditor, requestOpenInImageEditor, requestOpenInAudioEditor, requestOpenInVideoEditor } = useAiExplorerSelection()
const { addFileToMedia } = useAiAssets()
const addingToMedia = ref(false)

function onSelect() {
  // 선택은 useFileSelection에 이미 반영됨 (GlobalFileExplorer에서 setSelectedFile 호출)
  // 파일 선택 시 뷰어 탭 자동 활성화
  showPanel('viewer')
}

function injectToChat() {
  if (selectedFile.value) requestInjectToChat(selectedFile.value)
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

async function addToMedia() {
  const file = selectedFile.value
  if (!file) return
  addingToMedia.value = true
  try {
    await addFileToMedia(file)
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
