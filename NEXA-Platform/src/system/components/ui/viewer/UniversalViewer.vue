<!--
  UniversalViewer: 당분간 보존. [NEXA-AI-07] 추후 NexusLens로 대체 예정.

  CSV: q-table + virtual-scroll로 수만 행도 가볍게 표시.
  현재 CSV는 Tiptap 에디터에 삽입되도록 라우팅됨. UniversalViewer로 보려면
  AiExplorerPanel/AiLeftNav에서 CSV 클릭 시 showPanel('viewer') 분기 추가,
  AiContent injectCsvToEditor에서 큰 파일일 때 뷰어 전환 로직 참고.
  사용자 설정(preferCsvView: tiptap|viewer|auto)으로 선택 기능 확장 예정.
-->
<template>
  <div class="universal-viewer column">
    <template v-if="!file">
      <div class="universal-viewer-empty text-grey-6 text-center q-pa-lg">파일을 선택하면 미리보기가 표시됩니다.</div>
    </template>
    <template v-else>
      <div class="universal-viewer-header row items-center q-pa-sm">
        <span class="ellipsis">{{ file.original_name }}</span>
      </div>
      <div class="universal-viewer-body col">
        <template v-if="isImage">
          <img v-if="!imageError" :src="previewUrl" alt="" class="universal-viewer-image" @error="onImageError" />
          <div v-else class="text-grey-6 text-center q-pa-md">미리보기를 불러올 수 없습니다.</div>
        </template>
        <template v-else-if="isVideo">
          <div class="universal-viewer-video column">
            <div class="media-preview-header column items-center q-pa-sm">
              <h2 class="media-player-title">NEXA Video Player</h2>
              <span class="media-player-subtitle">영상 미리보기</span>
            </div>
            <div class="media-options row q-px-sm q-pb-xs wrap q-gutter-x-sm q-gutter-y-xs">
              <q-toggle v-model="videoAutoplay" dense label="자동 재생" />
              <q-toggle v-model="videoLoop" dense label="반복 재생" />
              <q-toggle v-model="videoMuted" dense label="음소거" />
            </div>
            <video v-if="previewUrl" ref="videoEl" controls class="preview-video q-px-sm q-pb-sm" :src="previewUrl" :autoplay="videoAutoplay" :loop="videoLoop" :muted="videoMuted">이 브라우저는 영상 재생을 지원하지 않습니다.</video>
            <div v-else class="text-grey-6 text-center q-pa-md">재생할 수 있는 주소가 없습니다.</div>
          </div>
        </template>
        <template v-else-if="isAudio">
          <div class="universal-viewer-audio column">
            <div class="media-preview-header column items-center q-pa-sm">
              <h2 class="media-player-title">NEXA Sound Player</h2>
              <span class="media-player-subtitle">오디오 미리듣기</span>
            </div>
            <div class="media-options row q-px-sm q-pb-xs wrap q-gutter-x-sm q-gutter-y-xs">
              <q-toggle v-model="audioAutoplay" dense label="자동 재생" />
              <q-toggle v-model="audioLoop" dense label="반복 재생" />
              <q-toggle v-model="audioMuted" dense label="음소거" />
            </div>
            <audio v-if="previewUrl" ref="audioEl" controls class="preview-audio q-px-sm q-pb-sm" :src="previewUrl" :autoplay="audioAutoplay" :loop="audioLoop" :muted="audioMuted">이 브라우저는 오디오 재생을 지원하지 않습니다.</audio>
            <div v-else class="text-grey-6 text-center q-pa-md">재생할 수 있는 주소가 없습니다.</div>
          </div>
        </template>
        <template v-else-if="isPdf">
          <iframe v-if="previewUrl" :src="previewUrl" class="universal-viewer-iframe" title="PDF 미리보기" />
          <div v-else class="text-grey-6 text-center q-pa-md">미리보기를 불러올 수 없습니다.</div>
        </template>
        <template v-else-if="isMemo">
          <div class="universal-viewer-memo markdown-content q-pa-md" v-html="parsedMarkdownHtml"></div>
        </template>
        <template v-else-if="isMarkdownFile">
          <div v-if="markdownFetchError" class="universal-viewer-placeholder text-grey-6 text-center q-pa-lg">파일을 불러올 수 없습니다.</div>
          <div v-else class="universal-viewer-memo markdown-content q-pa-md" v-html="parsedMarkdownHtml"></div>
        </template>
        <template v-else-if="isTxtFile">
          <div v-if="textFileFetchError" class="universal-viewer-placeholder text-grey-6 text-center q-pa-lg">파일을 불러올 수 없습니다.</div>
          <div v-else-if="textFileLoading" class="universal-viewer-placeholder text-grey-6 text-center q-pa-lg">불러오는 중...</div>
          <pre v-else class="universal-viewer-text q-pa-md">{{ textFileContent }}</pre>
        </template>
        <template v-else-if="isCsvFile">
          <div v-if="textFileFetchError" class="universal-viewer-placeholder text-grey-6 text-center q-pa-lg">파일을 불러올 수 없습니다.</div>
          <div v-else-if="textFileLoading" class="universal-viewer-placeholder text-grey-6 text-center q-pa-lg">불러오는 중...</div>
          <div v-else class="universal-viewer-csv">
            <div v-if="parsedCsvRows.length" class="universal-viewer-csv-caption text-caption text-grey-6">
              {{ csvTotalRows > parsedCsvRows.length ? `표시 제한: ${parsedCsvRows.length}행 (전체 ${csvTotalRows}행)` : `${csvTotalRows}행` }}
            </div>
            <div ref="csvTableWrapperRef" class="universal-viewer-csv-table-wrapper">
              <q-table
                v-if="csvTableColumns.length"
                :rows="csvTableRows"
                :columns="csvTableColumns"
                row-key="__idx"
                v-model:pagination="csvPagination"
                :rows-per-page-options="[0]"
                virtual-scroll
                :virtual-scroll-item-size="28"
                :table-style="csvTableStyle"
                flat
                dense
                bordered
                hide-pagination
                hide-bottom
                class="universal-viewer-csv-table"
              />
              <div v-else class="text-grey-6 text-center q-pa-md">데이터가 없습니다.</div>
            </div>
          </div>
        </template>
        <!-- JSON: 코드 패널에서 열리므로 뷰어 비활성화. 복원 시 아래 주석 블록 해제 후, 위 placeholder·hidden div 제거 -->
        <template v-else-if="isJsonFile">
          <div class="universal-viewer-placeholder text-grey-6 text-center q-pa-lg">JSON 파일은 코드 패널에서 확인하세요.</div>
          <div v-if="false" v-html="highlightedJson" aria-hidden="true"></div>
          <!--
          <div v-if="textFileFetchError" class="universal-viewer-placeholder text-grey-6 text-center q-pa-lg">파일을 불러올 수 없습니다.</div>
          <div v-else-if="textFileLoading" class="universal-viewer-placeholder text-grey-6 text-center q-pa-lg">불러오는 중...</div>
          <pre v-else class="universal-viewer-json q-pa-md" v-html="highlightedJson"></pre>
          -->
        </template>
        <div v-else class="universal-viewer-placeholder text-grey-6 text-center q-pa-lg">준비중</div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, watch, ref, onBeforeUnmount } from 'vue'
import { getUploadDisplayUrl } from '@system/utils/apiBaseUrl'
import { parseMarkdown } from '@system/utils/markdown'

const props = defineProps({
  file: { type: Object, default: null },
})

const imageError = ref(false)
const markdownFetchedContent = ref('')
const markdownFetchError = ref(false)
const textFileContent = ref('')
const textFileFetchError = ref(false)
const textFileLoading = ref(false)
const audioEl = ref(null)
const audioAutoplay = ref(false)
const audioLoop = ref(false)
const audioMuted = ref(false)
const videoEl = ref(null)
const videoAutoplay = ref(false)
const videoLoop = ref(false)
const videoMuted = ref(false)

const csvPagination = ref({ rowsPerPage: 0 })
const csvTableWrapperRef = ref(null)
const csvTableHeightPx = ref(400)

const Q_TABLE_HEADER_HEIGHT = 48
const csvTableStyle = computed(() => ({ maxHeight: `${Math.max(100, csvTableHeightPx.value - Q_TABLE_HEADER_HEIGHT)}px` }))

let csvResizeObserver = null
function setupCsvResizeObserver() {
  if (!csvTableWrapperRef.value) return
  csvResizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0]
    if (!entry) return
    const h = entry.contentRect.height
    if (h > 0) csvTableHeightPx.value = h
  })
  csvResizeObserver.observe(csvTableWrapperRef.value)
}

const isImage = computed(() => {
  const t = (props.file?.file_type || props.file?.category || '').toLowerCase()
  return t === 'image' || t === 'images'
})

const isAudio = computed(() => {
  const t = (props.file?.file_type || props.file?.category || '').toLowerCase()
  return t === 'audio'
})

const isVideo = computed(() => {
  const t = (props.file?.file_type || props.file?.category || '').toLowerCase()
  return t === 'video'
})

const isPdf = computed(() => {
  const t = (props.file?.file_type || props.file?.category || '').toLowerCase()
  const name = (props.file?.original_name || props.file?.file_path || '').toLowerCase()
  return t === 'pdf' || name.endsWith('.pdf')
})

const isMemo = computed(() => {
  const t = (props.file?.file_type || props.file?.category || '').toLowerCase()
  return t === 'memo'
})

/** 마크다운 형식 여부: 메모(file_type=memo) 또는 확장자 .md */
const isMarkdownContent = computed(() => {
  if (isMemo.value) return true
  const name = (props.file?.original_name || props.file?.file_path || '').toLowerCase()
  return name.endsWith('.md')
})

/** 탐색기 .md 파일 여부 (file_path로 fetch 필요) */
const isMarkdownFile = computed(() => {
  if (isMemo.value) return false
  const name = (props.file?.original_name || props.file?.file_path || '').toLowerCase()
  return name.endsWith('.md') && (!!props.file?.file_path || !!props.file?.url)
})

function getExtension() {
  const name = (props.file?.original_name || props.file?.file_path || '').toLowerCase()
  const m = name.match(/\.([a-z0-9]+)$/)
  return m ? m[1] : ''
}

/** .txt 파일 (fetch 필요) */
const isTxtFile = computed(() => getExtension() === 'txt' && (!!props.file?.file_path || !!props.file?.url))

/** .csv 파일 (fetch 필요) */
const isCsvFile = computed(() => getExtension() === 'csv' && (!!props.file?.file_path || !!props.file?.url))

/** .json 파일 (fetch 필요) */
const isJsonFile = computed(() => getExtension() === 'json' && (!!props.file?.file_path || !!props.file?.url))

import { parseCsv, countCsvRows } from '@system/utils/parseCsv'

/** CSV 파싱 결과 (2차원 배열, virtual-scroll로 최대 3000행) */
const parsedCsvRows = computed(() => (isCsvFile.value ? parseCsv(textFileContent.value) : []))

/** QTable용 columns (첫 행이 헤더) */
const csvTableColumns = computed(() => {
  const rows = parsedCsvRows.value
  if (!rows.length) return []
  const header = rows[0]
  const maxCols = Math.max(...rows.map((r) => r.length), header.length)
  return Array.from({ length: maxCols }, (_, j) => ({
    name: `col_${j}`,
    label: (header[j] ?? '') || `열 ${j + 1}`,
    field: `col_${j}`,
    align: 'left',
  }))
})

/** QTable용 rows (객체 배열, row-key: __idx) */
const csvTableRows = computed(() => {
  const rows = parsedCsvRows.value
  if (rows.length < 2) return []
  const cols = csvTableColumns.value
  return rows.slice(1).map((row, i) => {
    const obj = { __idx: i }
    cols.forEach((c, j) => {
      obj[c.field] = row[j] ?? ''
    })
    return obj
  })
})

/** CSV 전체 행 수 (제한 안 내림) */
const csvTotalRows = computed(() => (isCsvFile.value ? countCsvRows(textFileContent.value) : 0))

/** JSON 포맷팅 결과 */
const formattedJson = computed(() => {
  const raw = textFileContent.value
  if (!raw || !isJsonFile.value) return ''
  try {
    const parsed = JSON.parse(raw)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return raw
  }
})

/** JSON 구문 강조 (JSON 뷰어 복원 시 사용) */
const highlightedJson = computed(() => {
  const s = formattedJson.value
  if (!s || !isJsonFile.value) return ''
  const escaped = s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
  const strPat = '&quot;(?:(?!&quot;)[\\s\\S])*?&quot;'
  return escaped
    .replace(new RegExp(`(${strPat})(\\s*:)`, 'g'), '<span class="json-key">$1</span>$2')
    .replace(new RegExp(`(:)\\s*(${strPat})`, 'g'), '$1 <span class="json-string">$2</span>')
    .replace(/: (-?\\d+\\.?\\d*([eE][+-]?\\d+)?)/g, ': <span class="json-number">$1</span>')
    .replace(/\b(true|false|null)\b/g, '<span class="json-literal">$1</span>')
})

/** 마크다운 파싱된 HTML */
const parsedMarkdownHtml = computed(() => {
  if (!isMarkdownContent.value) return ''
  if (isMemo.value && props.file?.content) return parseMarkdown(props.file.content, '', {})
  if (isMarkdownFile.value && markdownFetchedContent.value) return parseMarkdown(markdownFetchedContent.value, props.file?.original_name || '', {})
  return ''
})

const previewUrl = computed(() => {
  if (!props.file) return ''
  if (props.file.file_path) return getUploadDisplayUrl(props.file.file_path)
  if (props.file.url) return props.file.url
  return ''
})

function onImageError() {
  imageError.value = true
}

async function fetchMarkdownContent() {
  markdownFetchedContent.value = ''
  markdownFetchError.value = false
  const f = props.file
  if (!f) return
  const url = f.file_path ? getUploadDisplayUrl(f.file_path) : f.url || ''
  if (!url) return
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(res.statusText)
    markdownFetchedContent.value = await res.text()
  } catch (e) {
    markdownFetchError.value = true
    console.error('[UniversalViewer] markdown fetch failed:', e)
  }
}

async function fetchTextFile() {
  textFileContent.value = ''
  textFileFetchError.value = false
  textFileLoading.value = true
  const f = props.file
  if (!f) {
    textFileLoading.value = false
    return
  }
  const url = f.file_path ? getUploadDisplayUrl(f.file_path) : f.url || ''
  if (!url) {
    textFileLoading.value = false
    return
  }
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(res.statusText)
    textFileContent.value = await res.text()
  } catch (e) {
    textFileFetchError.value = true
    console.error('[UniversalViewer] text file fetch failed:', e)
  } finally {
    textFileLoading.value = false
  }
}

watch(
  () => props.file,
  (file) => {
    imageError.value = false
    markdownFetchedContent.value = ''
    markdownFetchError.value = false
    textFileContent.value = ''
    textFileFetchError.value = false
    textFileLoading.value = false
    if (!file) return
    const name = (file.original_name || file.file_path || '').toLowerCase()
    if (name.endsWith('.md') && !file.content && (file.file_path || file.url)) {
      fetchMarkdownContent()
    } else if ((name.endsWith('.txt') || name.endsWith('.csv') || name.endsWith('.json')) && (file.file_path || file.url)) {
      fetchTextFile()
    }
  },
  { immediate: true },
)

watch(
  csvTableWrapperRef,
  (el) => {
    csvResizeObserver?.disconnect()
    if (el) setupCsvResizeObserver()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  csvResizeObserver?.disconnect()
})
</script>

<style lang="scss" scoped>
.universal-viewer {
  flex: 1;
  min-height: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.universal-viewer-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.universal-viewer-header {
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.universal-viewer-body {
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.universal-viewer-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.universal-viewer-video,
.universal-viewer-audio {
  width: 100%;
  min-height: 0;
}
.media-preview-header {
  flex-shrink: 0;
}
.media-player-title {
  margin: 0;
  font-size: 2.25rem;
  font-weight: 900;
  color: inherit;
  letter-spacing: 0.02em;
}
.media-player-subtitle {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
}
.media-options {
  flex-shrink: 0;
}
.preview-video {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  flex-shrink: 0;
}
.preview-audio {
  max-width: 100%;
  width: 100%;
  flex-shrink: 0;
}
.universal-viewer-iframe {
  width: 100%;
  min-height: 400px;
  flex: 1;
  border: none;
}
.universal-viewer-memo {
  width: 100%;
  flex: 1;
  overflow: auto;
  text-align: left;
  min-height: 0;
}
.universal-viewer-text,
.universal-viewer-json {
  width: 100%;
  flex: 1;
  overflow: auto;
  text-align: left;
  min-height: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 0.9rem;
  margin: 0;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}
.universal-viewer-json :deep(.json-key) {
  color: var(--nexa-json-key, var(--nexa-link-color, #0d6efd));
}
.universal-viewer-json :deep(.json-string) {
  color: var(--nexa-json-string, #7ec8e3);
}
.universal-viewer-json :deep(.json-number) {
  color: var(--nexa-json-number, var(--nexa-accent, #fd7e14));
}
.universal-viewer-json :deep(.json-literal) {
  color: var(--nexa-json-literal, var(--nexa-warning, #ffc107));
}
.universal-viewer-csv {
  flex: 1;
  min-height: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 0 16px 16px;
}
.universal-viewer-csv-caption {
  flex-shrink: 0;
  padding: 4px 0;
}
.universal-viewer-csv-table-wrapper {
  flex: 1;
  min-height: 200px;
  min-width: 0;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}
.universal-viewer-csv-table {
  font-size: 0.85rem;
}
.universal-viewer-csv-table :deep(.q-table__container) {
  min-width: 0;
  max-width: 100%;
}
.universal-viewer-csv-table :deep(.q-table__middle) {
  min-width: 0;
  max-width: 100%;
}
.universal-viewer-csv-table :deep(table) {
  table-layout: fixed;
  width: 100%;
}
</style>
