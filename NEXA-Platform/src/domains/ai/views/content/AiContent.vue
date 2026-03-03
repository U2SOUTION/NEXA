<template>
  <div class="ai-content column">
    <AiSplitLayout
      v-model:editor-content="editorContent"
      v-model:code-content="codeContent"
      :code-language="codeLanguage"
    />
  </div>
</template>

<script setup>
import { ref, provide, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { Notify } from 'quasar'
import { parseMarkdown } from '@system/utils/markdown/index'
import { useAiInsertRequest } from '../../composables/useAiInsertRequest'
import { useAiExplorerSelection } from '../../composables/useAiExplorerSelection'
import { showPanel } from '../../composables/useAiSplitLayout'
import { getUploadDisplayUrl } from '@system/utils/apiBaseUrl'
import { csvToTiptapTableHtml } from '../../utils/csvToTiptapTable'
import { MAX_CSV_DISPLAY_ROWS } from '@system/utils/parseCsv'
import AiSplitLayout from './AiSplitLayout.vue'

const editorContent = ref('')
const codeContent = ref('// 코드를 입력하세요\n')
const codeLanguage = ref('javascript')
const pendingInsertContent = ref(null)
const pendingCodeInsertContent = ref(null)

const { onInsertRequest, onOpenEditorRequest } = useAiInsertRequest()
const { onInjectToEditor, onOpenInCodePanel } = useAiExplorerSelection()
let unregisterInsertRequest = null
let unregisterOpenEditorRequest = null
let unregisterInjectToEditor = null
let unregisterOpenInCodePanel = null

function extToMonacoLanguage(ext) {
  const map = {
    js: 'javascript',
    mjs: 'javascript',
    cjs: 'javascript',
    ts: 'typescript',
    mts: 'typescript',
    cts: 'typescript',
    jsx: 'javascript',
    tsx: 'typescript',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    xml: 'xml',
    py: 'python',
    css: 'css',
    scss: 'scss',
    html: 'html',
    htm: 'html',
    md: 'markdown',
    sql: 'sql',
    sh: 'shell',
    bash: 'shell',
    vue: 'html',
  }
  return map[ext] || 'plaintext'
}

const MEDIA_IMAGE = ['image', 'images']
const MEDIA_AUDIO = ['audio']
const MEDIA_VIDEO = ['video']
const AUDIO_EXT = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma']
const VIDEO_EXT = ['mp4', 'webm', 'mkv', 'mov', 'avi', 'wmv', 'flv', 'm4v']

function getMediaType(file) {
  const t = (file?.file_type || file?.category || '').toLowerCase()
  if (MEDIA_IMAGE.includes(t)) return 'image'
  if (MEDIA_AUDIO.includes(t)) return 'audio'
  if (MEDIA_VIDEO.includes(t)) return 'video'
  const ext = (file?.original_name || '').toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] || ''
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) return 'image'
  if (AUDIO_EXT.includes(ext)) return 'audio'
  if (VIDEO_EXT.includes(ext)) return 'video'
  return null
}

function getFileExtension(file) {
  const name = (file?.original_name || file?.file_path || '').toLowerCase()
  return name.match(/\.([a-z0-9]+)$/)?.[1] || ''
}

function fileToEditorHtml(file) {
  if (!file?.file_path && !file?.url) return ''
  const url = file.file_path ? getUploadDisplayUrl(file.file_path) : file.url
  const name = (file.original_name || '파일').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const mediaType = getMediaType(file)
  const caption = `<p class="media-filename" style="text-align:center">${name}</p>`
  if (mediaType === 'image') {
    return `<p><img src="${url}" alt="${name}" /></p>${caption}`
  }
  if (mediaType === 'audio') {
    return `<p><audio src="${url}" controls></audio></p>${caption}`
  }
  if (mediaType === 'video') {
    return `<p><video src="${url}" controls></video></p>${caption}`
  }
  return `<p><a href="${url}">${name}</a></p>`
}

/**
 * CSV 파일을 Tiptap 에디터에 테이블로 삽입.
 *
 * ## UniversalViewer 전환 (큰 CSV용)
 * 행 수가 많을 때 UniversalViewer(q-table + virtual-scroll)로 보이게 하려면:
 * 1. useFileSelection, setSelectedFile import 복원
 * 2. 아래 조건 분기 추가:
 *    if (totalRows > MAX_CSV_DISPLAY_ROWS) {
 *      setSelectedFile(file)
 *      showPanel('viewer')
 *      return
 *    }
 *
 * ## 향후: 사용자 설정 preferCsvView
 * 'tiptap' | 'viewer' | 'auto' 에 따라 Tiptap 삽입 vs 뷰어 전환 선택 가능.
 */
async function injectCsvToEditor(file) {
  const url = file.file_path ? getUploadDisplayUrl(file.file_path) : file.url
  if (!url) {
    Notify.create({ type: 'warning', message: 'CSV 파일 주소를 가져올 수 없습니다.' })
    return
  }
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(res.statusText)
    const raw = await res.text()
    const { html, totalRows, displayRows } = csvToTiptapTableHtml(raw)
    if (totalRows > MAX_CSV_DISPLAY_ROWS) {
      Notify.create({
        type: 'info',
        message: `${displayRows}행 삽입됨 (전체 ${totalRows}행, 최대 ${MAX_CSV_DISPLAY_ROWS}행까지 표시)`,
      })
    }
    showPanel('editor')
    nextTick(() => {
      pendingInsertContent.value = html
    })
  } catch (e) {
    console.error('[AiContent] CSV fetch failed:', e)
    Notify.create({ type: 'negative', message: 'CSV 파일을 불러올 수 없습니다.' })
  }
}

onMounted(() => {
  unregisterInsertRequest = onInsertRequest((raw) => {
    const html = parseMarkdown(raw, '', {})
    showPanel('editor')
    nextTick(() => {
      pendingInsertContent.value = html
    })
  })
  unregisterOpenEditorRequest = onOpenEditorRequest(() => {
    showPanel('editor')
  })
  unregisterInjectToEditor = onInjectToEditor((file) => {
    // CSV: Tiptap 테이블로 삽입. UniversalViewer 전환은 injectCsvToEditor 주석 참고.
    if (getFileExtension(file) === 'csv') {
      injectCsvToEditor(file)
      return
    }
    const html = fileToEditorHtml(file)
    if (html) {
      showPanel('editor')
      nextTick(() => {
        pendingInsertContent.value = html
      })
    }
  })
  unregisterOpenInCodePanel = onOpenInCodePanel(async (file) => {
    if (!file?.file_path && !file?.url) return
    const url = file.file_path ? getUploadDisplayUrl(file.file_path) : file.url
    if (!url) return
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(res.statusText)
      const text = await res.text()
      const ext = (file.original_name || '').toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] || ''
      codeContent.value = text
      codeLanguage.value = extToMonacoLanguage(ext)
      showPanel('code')
    } catch (e) {
      console.error('[AiContent] code file fetch failed:', e)
    }
  })
})

onBeforeUnmount(() => {
  unregisterInsertRequest?.()
  unregisterOpenEditorRequest?.()
  unregisterInjectToEditor?.()
  unregisterOpenInCodePanel?.()
})

provide('aiInsertContent', {
  pendingInsertContent,
  pendingCodeInsertContent,
  setCenterTab: (tabId) => {
    showPanel(tabId)
  },
})
</script>

<style lang="scss" scoped>
.ai-content {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
</style>
