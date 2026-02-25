<!--
  FileDropZone.vue
  My PC / Web Server 토글, 드롭존, 파일 선택
  도메인 독립 - uploadUrl, listUrl props
-->
<template>
  <div class="file-drop-zone">
    <q-btn-toggle
      v-model="sourceMode"
      spread
      no-caps
      toggle-color="primary"
      :options="[
        { label: 'My PC', value: 'pc' },
        { label: 'Web Server', value: 'server' },
      ]"
      class="q-mb-sm"
    />

    <!-- My PC: 드롭존 + 파일 선택 -->
    <div v-if="sourceMode === 'pc'" class="drop-area" :class="{ 'drop-active': isDragging }" @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop">
      <q-icon name="cloud_upload" size="48px" class="text-grey-6 q-mb-sm" />
      <div class="text-body2 text-grey-7">{{ label }}</div>
      <q-btn flat label="파일 선택" color="primary" class="q-mt-sm" @click="triggerFileInput" />
      <input ref="fileInputRef" type="file" :accept="accept" :multiple="multiple" class="hidden" @change="handleFileSelect" />
    </div>

    <!-- Web Server: 찾아보기 -->
    <div v-else>
      <q-btn flat label="찾아보기" color="primary" @click="showBrowser = true" />
    </div>

    <FileBrowserModal v-model="showBrowser" :list-url="listUrl" :accept="accept" @select="handleServerSelect" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import FileBrowserModal from './FileBrowserModal.vue'

defineProps({
  uploadUrl: { type: String, required: true },
  listUrl: { type: String, required: true },
  accept: { type: String, default: '' },
  label: { type: String, default: '파일을 드래그하거나 선택하세요' },
  multiple: { type: Boolean, default: true },
})

const emit = defineEmits(['add'])

const sourceMode = ref('pc')
const isDragging = ref(false)
const showBrowser = ref(false)
const fileInputRef = ref(null)

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileSelect(ev) {
  const files = ev.target.files
  if (!files?.length) return
  for (const file of files) {
    emit('add', { source: 'pc', file, name: file.name, type: file.type })
  }
  ev.target.value = ''
}

function handleDrop(ev) {
  isDragging.value = false
  const files = ev.dataTransfer?.files
  if (!files?.length) return
  for (const file of files) {
    emit('add', { source: 'pc', file, name: file.name, type: file.type })
  }
}

function handleServerSelect(item) {
  showBrowser.value = false
  emit('add', {
    source: 'server',
    id: item.id,
    serverPath: item.file_path,
    name: item.original_name,
    type: item.file_type,
    url: item.url,
  })
}
</script>

<style lang="scss" scoped>
.file-drop-zone {
  padding: 8px 0;
}

.drop-area {
  border: 2px dashed rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  transition: border-color 0.2s, background 0.2s;

  &.drop-active {
    border-color: var(--q-primary);
    background: rgba(var(--q-primary-rgb), 0.05);
  }
}

.hidden {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}
</style>
