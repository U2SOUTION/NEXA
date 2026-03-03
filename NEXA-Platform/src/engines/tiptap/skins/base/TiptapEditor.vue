<!-- TiptapEditor.vue - base 스킨 (도메인 비의존) -->
<template>
  <div class="tiptap-editor" :class="editorClass">
    <!-- 툴바 (일반 모드) -->
    <div v-if="editor && !isFullscreen" class="editor-toolbar q-pa-sm" :class="toolbarClass">
      <slot name="toolbar" :editor="editor" :items="normalToolbarItems" :isFullscreen="isFullscreen" :toggleFullscreen="toggleFullscreen">
        <div class="row q-gutter-xs">
          <template v-for="item in normalToolbarItems" :key="item.id">
            <template v-if="item.id === 'insertTable'">
              <q-btn flat dense round color="grey-7" :icon="item.icon" @click="item.action()" />
              <q-btn-dropdown v-if="isTableSelected" flat dense round color="grey-7" icon="border_all" :disable="!isTableSelected">
                <q-list dense>
                  <q-item clickable @click="addRowBefore">
                    <q-item-section avatar>
                      <q-icon name="add" size="xs" />
                    </q-item-section>
                    <q-item-section>위에 행 추가</q-item-section>
                  </q-item>
                  <q-item clickable @click="addRowAfter">
                    <q-item-section avatar>
                      <q-icon name="add" size="xs" />
                    </q-item-section>
                    <q-item-section>아래에 행 추가</q-item-section>
                  </q-item>
                  <q-item clickable @click="deleteRow" :disable="!canDeleteRow">
                    <q-item-section avatar>
                      <q-icon name="remove" size="xs" />
                    </q-item-section>
                    <q-item-section>행 삭제</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable @click="addColumnBefore">
                    <q-item-section avatar>
                      <q-icon name="add" size="xs" />
                    </q-item-section>
                    <q-item-section>왼쪽에 열 추가</q-item-section>
                  </q-item>
                  <q-item clickable @click="addColumnAfter">
                    <q-item-section avatar>
                      <q-icon name="add" size="xs" />
                    </q-item-section>
                    <q-item-section>오른쪽에 열 추가</q-item-section>
                  </q-item>
                  <q-item clickable @click="deleteColumn" :disable="!canDeleteColumn">
                    <q-item-section avatar>
                      <q-icon name="remove" size="xs" />
                    </q-item-section>
                    <q-item-section>열 삭제</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable @click="deleteTable">
                    <q-item-section avatar>
                      <q-icon name="delete" size="xs" />
                    </q-item-section>
                    <q-item-section>테이블 삭제</q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </template>
            <template v-else>
              <q-btn flat dense round :color="item.isActive && item.isActive() ? 'primary' : 'grey-7'" :icon="typeof item.icon === 'function' ? item.icon() : item.icon" :disable="item.canExecute && !item.canExecute()" @click="item.action()">
                <q-tooltip v-if="item.tooltip">
                  {{ typeof item.tooltip === 'function' ? item.tooltip() : item.tooltip }}
                </q-tooltip>
              </q-btn>
            </template>
          </template>
          <q-space />
          <q-btn v-if="allowFullscreen" flat dense round color="grey-7" :icon="isFullscreen ? 'close_fullscreen' : 'fullscreen'" @click="toggleFullscreen">
            <q-tooltip>{{ isFullscreen ? '풀스크린 종료' : '풀스크린 모드' }}</q-tooltip>
          </q-btn>
        </div>
      </slot>
    </div>

    <!-- 에디터 영역 (풀스크린 모드가 아닐 때만 표시) -->
    <div v-if="!isFullscreen" class="editor-content">
      <editor-content :editor="editor" />
    </div>

    <!-- 링크 입력 다이얼로그 -->
    <q-dialog v-model="showLinkDialog">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">링크 추가</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="linkUrl" label="URL" outlined dense @keyup.enter="insertLink" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="취소" v-close-popup />
          <q-btn flat label="추가" color="primary" @click="insertLink" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 풀스크린 모달 -->
    <q-dialog v-if="allowFullscreen" v-model="isFullscreen" maximized>
      <q-card class="fullscreen-editor-card" :class="editorClass">
        <q-card-section class="fullscreen-header">
          <div class="row items-center justify-between">
            <div class="fullscreen-title-container">
              <div class="fullscreen-main-title">
                NEXA SYSTEM CONTENT STUDIO
                <span class="fullscreen-mode-label"> Fullscreen Mode</span>
              </div>
              <div class="fullscreen-subtitle">넥사 시스템 컨텐츠 스튜디오</div>
            </div>
            <q-btn flat round dense icon="close" @click="isFullscreen = false" class="close-btn" />
          </div>
        </q-card-section>

        <q-card-section class="fullscreen-content">
          <div v-if="editor" class="editor-toolbar q-pa-sm" :class="toolbarClass">
            <slot name="toolbar-fullscreen" :editor="editor" :items="fullscreenToolbarItems" :isFullscreen="isFullscreen" :toggleFullscreen="toggleFullscreen">
              <div class="row q-gutter-xs">
                <template v-for="item in fullscreenToolbarItems" :key="item.id">
                  <template v-if="item.id === 'insertTable'">
                    <q-btn flat dense round color="grey-7" :icon="item.icon" @click="item.action()" />
                    <q-btn-dropdown v-if="isTableSelected" flat dense round color="grey-7" icon="border_all" :disable="!isTableSelected">
                      <q-list dense>
                        <q-item clickable @click="addRowBefore">
                          <q-item-section avatar>
                            <q-icon name="add" size="xs" />
                          </q-item-section>
                          <q-item-section>위에 행 추가</q-item-section>
                        </q-item>
                        <q-item clickable @click="addRowAfter">
                          <q-item-section avatar>
                            <q-icon name="add" size="xs" />
                          </q-item-section>
                          <q-item-section>아래에 행 추가</q-item-section>
                        </q-item>
                        <q-item clickable @click="deleteRow" :disable="!canDeleteRow">
                          <q-item-section avatar>
                            <q-icon name="remove" size="xs" />
                          </q-item-section>
                          <q-item-section>행 삭제</q-item-section>
                        </q-item>
                        <q-separator />
                        <q-item clickable @click="addColumnBefore">
                          <q-item-section avatar>
                            <q-icon name="add" size="xs" />
                          </q-item-section>
                          <q-item-section>왼쪽에 열 추가</q-item-section>
                        </q-item>
                        <q-item clickable @click="addColumnAfter">
                          <q-item-section avatar>
                            <q-icon name="add" size="xs" />
                          </q-item-section>
                          <q-item-section>오른쪽에 열 추가</q-item-section>
                        </q-item>
                        <q-item clickable @click="deleteColumn" :disable="!canDeleteColumn">
                          <q-item-section avatar>
                            <q-icon name="remove" size="xs" />
                          </q-item-section>
                          <q-item-section>열 삭제</q-item-section>
                        </q-item>
                        <q-separator />
                        <q-item clickable @click="deleteTable">
                          <q-item-section avatar>
                            <q-icon name="delete" size="xs" />
                          </q-item-section>
                          <q-item-section>테이블 삭제</q-item-section>
                        </q-item>
                      </q-list>
                    </q-btn-dropdown>
                  </template>
                  <template v-else>
                    <q-btn flat dense round :color="item.isActive && item.isActive() ? 'primary' : 'grey-7'" :icon="typeof item.icon === 'function' ? item.icon() : item.icon" :disable="item.canExecute && !item.canExecute()" @click="item.action()">
                      <q-tooltip v-if="item.tooltip">
                        {{ typeof item.tooltip === 'function' ? item.tooltip() : item.tooltip }}
                      </q-tooltip>
                    </q-btn>
                  </template>
                </template>
                <q-space />
                <q-btn flat dense round color="grey-7" icon="close_fullscreen" @click="isFullscreen = false">
                  <q-tooltip>풀스크린 종료</q-tooltip>
                </q-btn>
              </div>
            </slot>
          </div>

          <div v-if="isFullscreen" class="editor-content-fullscreen">
            <editor-content :editor="editor" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 이미지 추가 다이얼로그 -->
    <q-dialog v-model="showImageDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">이미지 추가</div>
        </q-card-section>
        <q-tabs v-model="imageDialogTab" dense class="text-grey" active-color="primary">
          <q-tab name="url" label="URL 입력" />
          <q-tab name="file" label="파일 선택" />
        </q-tabs>
        <q-separator />
        <q-tab-panels v-model="imageDialogTab" animated>
          <q-tab-panel name="url">
            <q-card-section>
              <q-input v-model="imageUrl" label="이미지 URL" outlined dense placeholder="https://example.com/image.jpg" @keyup.enter="insertImage" />
              <div class="text-caption text-grey-6 q-mt-xs">이미지 URL을 입력하거나 붙여넣으세요</div>
            </q-card-section>
          </q-tab-panel>
          <q-tab-panel name="file">
            <q-card-section>
              <q-file v-model="selectedImageFile" label="이미지 파일 선택" outlined dense accept="image/*" @update:model-value="handleImageFileSelect" class="q-mb-md">
                <template #prepend>
                  <q-icon name="image" />
                </template>
              </q-file>
              <div v-if="imagePreviewUrl" class="image-preview q-mt-md">
                <div class="text-caption q-mb-xs">미리보기:</div>
                <img :src="imagePreviewUrl" alt="미리보기" style="max-width: 100%; max-height: 200px; border-radius: 4px; border: 1px solid rgba(255, 255, 255, 0.1)" />
                <div v-if="selectedImageFile" class="text-caption text-grey-6 q-mt-xs">파일명: {{ selectedImageFile.name }} ({{ formatFileSize(selectedImageFile.size) }})</div>
              </div>
            </q-card-section>
          </q-tab-panel>
        </q-tab-panels>
        <q-card-actions align="right">
          <q-btn flat label="취소" v-close-popup @click="resetImageDialog" />
          <q-btn flat label="추가" color="primary" @click="insertImage" :disable="imageDialogTab === 'file' && !selectedImageFile" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 색상 선택 다이얼로그 -->
    <q-dialog v-model="showColorDialog">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">{{ colorPickerType === 'text' ? '텍스트 색상' : '배경색' }} 선택</div>
        </q-card-section>
        <q-card-section>
          <q-color v-model="selectedColor" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="제거" @click="removeColor" />
          <q-btn flat label="취소" v-close-popup />
          <q-btn flat label="적용" color="primary" @click="applyColor" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 폰트 패밀리 선택 다이얼로그 -->
    <q-dialog v-model="showFontFamilyDialog">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">폰트 선택</div>
        </q-card-section>
        <q-card-section>
          <q-select v-model="selectedFontFamily" :options="fontFamilies" label="폰트 패밀리" outlined dense />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="제거" @click="removeFontFamily" />
          <q-btn flat label="취소" v-close-popup />
          <q-btn flat label="적용" color="primary" @click="applyFontFamily" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- YouTube 추가 다이얼로그 -->
    <q-dialog v-model="showYouTubeDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">YouTube 비디오 추가</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="youtubeUrl" label="YouTube URL 또는 비디오 ID" outlined dense placeholder="https://www.youtube.com/watch?v=..." @keyup.enter="insertYouTube" />
          <div class="text-caption text-grey-6 q-mt-xs">YouTube 비디오 URL을 입력하거나 붙여넣으세요</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="취소" v-close-popup @click="resetYouTubeDialog" />
          <q-btn flat label="추가" color="primary" @click="insertYouTube" :disable="!youtubeUrl" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, computed } from 'vue'
import { useQuasar, Loading } from 'quasar'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import { createBaseExtensions } from './extensions'
import { convertClipboardImageToFile } from '../../utils/clipboardImage'
import { formatFileSize } from '../../utils/fileFormat'
import { extractYouTubeId } from '../../utils/youtube'

const $q = useQuasar()

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '내용을 입력하세요...' },
  uploadHandler: { type: Function, required: true }, // (file, context) => Promise<{ url, original_filename? }>
  toolbarOrder: {
    type: Array,
    default: () => [
      'bold',
      'italic',
      'underline',
      'strike',
      'heading1',
      'heading2',
      'heading3',
      'alignLeft',
      'alignCenter',
      'alignRight',
      'alignJustify',
      'highlight',
      'textColor',
      'backgroundColor',
      'fontFamily',
      'superscript',
      'subscript',
      'bulletList',
      'orderedList',
      'taskList',
      'blockquote',
      'codeBlock',
      'code',
      'insertTable',
      'link',
      'image',
      'youtube',
      'undo',
      'redo',
      'clearAll',
      'spellcheck',
      'horizontalRule',
    ],
  },
  normalModeExcludedIds: {
    type: Array,
    default: () => ['heading3', 'italic', 'underline', 'strike', 'code', 'undo', 'redo', 'highlight', 'textColor', 'backgroundColor', 'fontFamily', 'superscript', 'subscript', 'alignJustify'],
  },
  allowFullscreen: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue'])

const showLinkDialog = ref(false)
const showImageDialog = ref(false)
const showColorDialog = ref(false)
const showFontFamilyDialog = ref(false)
const showYouTubeDialog = ref(false)
const linkUrl = ref('')
const imageUrl = ref('')
const youtubeUrl = ref('')
const imageDialogTab = ref('url')
const selectedImageFile = ref(null)
const imagePreviewUrl = ref('')
const isFullscreen = ref(false)
const colorPickerType = ref('text')
const selectedColor = ref('#000000')
const selectedFontFamily = ref('Arial')
const spellcheckEnabled = ref(true)

const toolbarClass = computed(() => ($q.dark.isActive ? 'toolbar-dark' : 'toolbar-light'))
const editorClass = computed(() => ($q.dark.isActive ? 'editor-dark' : 'editor-light'))

const editor = useEditor({
  content: props.modelValue || '',
  extensions: createBaseExtensions(),
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      spellcheck: 'true',
    },
    handlePaste: (view, event) => {
      const items = Array.from(event.clipboardData?.items || [])
      const imageItem = items.find((item) => item.type.startsWith('image/'))
      if (imageItem) {
        event.preventDefault()
        processClipboardImage(imageItem)
        return true
      }
      return false
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
  onCreate: ({ editor }) => {
    if (editor.view?.dom) {
      editor.view.dom.setAttribute('spellcheck', spellcheckEnabled.value.toString())
      editor.view.dom.spellcheck = spellcheckEnabled.value
    }
  },
})

watch(
  () => props.modelValue,
  (value) => {
    if (!editor.value) return
    const current = editor.value.getHTML()
    if (current !== value) {
      editor.value.commands.setContent(value || '')
    }
  },
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})

function setLink() {
  const previousUrl = editor.value?.getAttributes('link').href
  linkUrl.value = previousUrl || ''
  showLinkDialog.value = true
}

function insertLink() {
  if (linkUrl.value) {
    editor.value?.chain().focus().extendMarkRange('link').setLink({ href: linkUrl.value }).run()
  } else {
    editor.value?.chain().focus().unsetLink().run()
  }
  showLinkDialog.value = false
  linkUrl.value = ''
}

function addImage() {
  imageDialogTab.value = 'url'
  showImageDialog.value = true
}

function handleImageFileSelect(file) {
  if (!file) {
    imagePreviewUrl.value = ''
    return
  }
  const MAX_FILE_SIZE = 10 * 1024 * 1024
  if (file.size > MAX_FILE_SIZE) {
    $q.notify({
      type: 'negative',
      message: '파일 크기가 너무 큽니다.',
      caption: `최대 10MB까지 업로드 가능합니다. (현재: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
      position: 'top',
    })
    selectedImageFile.value = null
    imagePreviewUrl.value = ''
    return
  }
  if (!file.type.startsWith('image/')) {
    $q.notify({
      type: 'negative',
      message: '이미지 파일만 선택할 수 있습니다.',
      position: 'top',
    })
    selectedImageFile.value = null
    imagePreviewUrl.value = ''
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreviewUrl.value = e.target.result
  }
  reader.onerror = () => {
    imagePreviewUrl.value = ''
  }
  reader.readAsDataURL(file)
}

async function insertImage() {
  if (imageDialogTab.value === 'url') {
    if (imageUrl.value) {
      editor.value?.chain().focus().setImage({ src: imageUrl.value }).run()
    }
  } else if (imageDialogTab.value === 'file' && selectedImageFile.value) {
    try {
      Loading.show({ message: '이미지 업로드 중...' })
      const uploadedFile = await props.uploadHandler(selectedImageFile.value, { source: 'dialog' })
      const imageAttrs = { src: uploadedFile.url }
      if (uploadedFile.original_filename || selectedImageFile.value?.name) {
        imageAttrs['data-original-filename'] = uploadedFile.original_filename || selectedImageFile.value?.name
      }
      editor.value?.chain().focus().setImage(imageAttrs).run()
      Loading.hide()
      $q.notify({
        type: 'positive',
        message: '이미지가 업로드되었습니다.',
        position: 'top',
      })
    } catch (error) {
      if (import.meta.env.DEV) console.error('이미지 업로드 오류:', error)
      Loading.hide()
      $q.notify({
        type: 'negative',
        message: '이미지 업로드에 실패했습니다.',
        caption: error.message,
        position: 'top',
      })
      return
    }
  }
  resetImageDialog()
}

function resetImageDialog() {
  showImageDialog.value = false
  imageUrl.value = ''
  imageDialogTab.value = 'url'
  selectedImageFile.value = null
  imagePreviewUrl.value = ''
}

async function processClipboardImage(imageItem) {
  try {
    const file = await convertClipboardImageToFile(imageItem)
    await uploadClipboardImage(file)
  } catch (error) {
    if (import.meta.env.DEV) console.error('클립보드 이미지 처리 실패:', error)
  }
}

async function uploadClipboardImage(file) {
  try {
    Loading.show({ message: '이미지 업로드 중...' })
    const uploadedFile = await props.uploadHandler(file, { source: 'clipboard' })
    const imageAttrs = { src: uploadedFile.url }
    if (uploadedFile.original_filename || file.name) {
      imageAttrs['data-original-filename'] = uploadedFile.original_filename || file.name
    }
    editor.value?.chain().focus().setImage(imageAttrs).run()
    Loading.hide()
    $q.notify({
      type: 'positive',
      message: '이미지가 업로드되었습니다.',
      position: 'top',
    })
  } catch (error) {
    if (import.meta.env.DEV) console.error('클립보드 이미지 업로드 오류:', error)
    Loading.hide()
    $q.notify({
      type: 'negative',
      message: '이미지 업로드에 실패했습니다.',
      caption: error.message,
      position: 'top',
    })
    throw error
  }
}

function addYouTube() {
  youtubeUrl.value = ''
  showYouTubeDialog.value = true
}

function insertYouTube() {
  if (!youtubeUrl.value) return
  const videoId = extractYouTubeId(youtubeUrl.value.trim())
  if (!videoId) {
    $q.notify({
      type: 'negative',
      message: '유효한 YouTube URL이 아닙니다.',
      caption: 'YouTube URL 또는 비디오 ID를 입력해주세요.',
      position: 'top',
    })
    return
  }
  editor.value?.chain().focus().setYoutubeVideo({ src: videoId }).run()
  resetYouTubeDialog()
}

function resetYouTubeDialog() {
  showYouTubeDialog.value = false
  youtubeUrl.value = ''
}

const isTableSelected = computed(() => editor.value?.isActive('table'))

const canDeleteRow = computed(() => {
  if (!editor.value) return false
  try {
    return editor.value.can().deleteRow()
  } catch {
    return false
  }
})

const canDeleteColumn = computed(() => {
  if (!editor.value) return false
  try {
    return editor.value.can().deleteColumn()
  } catch {
    return false
  }
})

function addRowBefore() {
  editor.value?.chain().focus().addRowBefore().run()
}
function addRowAfter() {
  editor.value?.chain().focus().addRowAfter().run()
}
function deleteRow() {
  editor.value?.chain().focus().deleteRow().run()
}
function addColumnBefore() {
  editor.value?.chain().focus().addColumnBefore().run()
}
function addColumnAfter() {
  editor.value?.chain().focus().addColumnAfter().run()
}
function deleteColumn() {
  editor.value?.chain().focus().deleteColumn().run()
}
function deleteTable() {
  editor.value?.chain().focus().deleteTable().run()
}

function clearAll() {
  editor.value?.chain().focus().clearContent().run()
}

function toggleFullscreen() {
  if (!props.allowFullscreen) return
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    setTimeout(() => {
      editor.value?.chain().focus().run()
    }, 100)
  }
}

function showColorPicker(type) {
  colorPickerType.value = type
  if (type === 'text') {
    const color = editor.value?.getAttributes('textStyle')?.color || '#000000'
    selectedColor.value = color
  } else {
    const color = editor.value?.getAttributes('highlight')?.color || '#ffff00'
    selectedColor.value = color
  }
  showColorDialog.value = true
}

function applyColor() {
  if (colorPickerType.value === 'text') {
    editor.value?.chain().focus().setColor(selectedColor.value).run()
  } else {
    editor.value?.chain().focus().setHighlight({ color: selectedColor.value }).run()
  }
  showColorDialog.value = false
}

function removeColor() {
  if (colorPickerType.value === 'text') {
    editor.value?.chain().focus().unsetColor().run()
  } else {
    editor.value?.chain().focus().unsetHighlight().run()
  }
  showColorDialog.value = false
}

function showFontFamilyPicker() {
  const fontFamily = editor.value?.getAttributes('textStyle')?.fontFamily || 'Arial'
  selectedFontFamily.value = fontFamily
  showFontFamilyDialog.value = true
}

function applyFontFamily() {
  editor.value?.chain().focus().setFontFamily(selectedFontFamily.value).run()
  showFontFamilyDialog.value = false
}

function removeFontFamily() {
  editor.value?.chain().focus().unsetFontFamily().run()
  showFontFamilyDialog.value = false
}

function toggleSpellcheck() {
  spellcheckEnabled.value = !spellcheckEnabled.value
  if (editor.value?.view?.dom) {
    editor.value.view.dom.setAttribute('spellcheck', spellcheckEnabled.value.toString())
    editor.value.view.dom.spellcheck = spellcheckEnabled.value
  }
}

const toolbarItemDefinitions = {
  bold: { id: 'bold', icon: 'format_bold', action: () => editor.value?.chain().focus().toggleBold().run(), isActive: () => editor.value?.isActive('bold'), group: 'text-style' },
  italic: { id: 'italic', icon: 'format_italic', action: () => editor.value?.chain().focus().toggleItalic().run(), isActive: () => editor.value?.isActive('italic'), group: 'text-style' },
  underline: { id: 'underline', icon: 'format_underlined', action: () => editor.value?.chain().focus().toggleUnderline().run(), isActive: () => editor.value?.isActive('underline'), group: 'text-style' },
  strike: { id: 'strike', icon: 'strikethrough_s', action: () => editor.value?.chain().focus().toggleStrike().run(), isActive: () => editor.value?.isActive('strike'), group: 'text-style' },
  heading1: { id: 'heading1', icon: 'title', action: () => editor.value?.chain().focus().toggleHeading({ level: 1 }).run(), isActive: () => editor.value?.isActive('heading', { level: 1 }), group: 'heading' },
  heading2: { id: 'heading2', icon: 'format_size', action: () => editor.value?.chain().focus().toggleHeading({ level: 2 }).run(), isActive: () => editor.value?.isActive('heading', { level: 2 }), group: 'heading' },
  heading3: { id: 'heading3', icon: 'text_fields', action: () => editor.value?.chain().focus().toggleHeading({ level: 3 }).run(), isActive: () => editor.value?.isActive('heading', { level: 3 }), group: 'heading' },
  bulletList: { id: 'bulletList', icon: 'format_list_bulleted', action: () => editor.value?.chain().focus().toggleBulletList().run(), isActive: () => editor.value?.isActive('bulletList'), group: 'list' },
  orderedList: { id: 'orderedList', icon: 'format_list_numbered', action: () => editor.value?.chain().focus().toggleOrderedList().run(), isActive: () => editor.value?.isActive('orderedList'), group: 'list' },
  taskList: { id: 'taskList', icon: 'checklist', action: () => editor.value?.chain().focus().toggleTaskList().run(), isActive: () => editor.value?.isActive('taskList'), group: 'list' },
  blockquote: { id: 'blockquote', icon: 'format_quote', action: () => editor.value?.chain().focus().toggleBlockquote().run(), isActive: () => editor.value?.isActive('blockquote'), group: 'block' },
  codeBlock: { id: 'codeBlock', icon: 'code', action: () => editor.value?.chain().focus().toggleCodeBlock().run(), isActive: () => editor.value?.isActive('codeBlock'), group: 'block' },
  code: { id: 'code', icon: 'integration_instructions', action: () => editor.value?.chain().focus().toggleCode().run(), isActive: () => editor.value?.isActive('code'), group: 'block' },
  link: { id: 'link', icon: 'link', action: () => setLink(), group: 'media' },
  image: { id: 'image', icon: 'image', action: () => addImage(), group: 'media' },
  youtube: { id: 'youtube', icon: 'play_circle', action: () => addYouTube(), group: 'media' },
  alignLeft: { id: 'alignLeft', icon: 'format_align_left', action: () => editor.value?.chain().focus().setTextAlign('left').run(), isActive: () => editor.value?.isActive({ textAlign: 'left' }), group: 'align' },
  alignCenter: { id: 'alignCenter', icon: 'format_align_center', action: () => editor.value?.chain().focus().setTextAlign('center').run(), isActive: () => editor.value?.isActive({ textAlign: 'center' }), group: 'align' },
  alignRight: { id: 'alignRight', icon: 'format_align_right', action: () => editor.value?.chain().focus().setTextAlign('right').run(), isActive: () => editor.value?.isActive({ textAlign: 'right' }), group: 'align' },
  alignJustify: { id: 'alignJustify', icon: 'format_align_justify', action: () => editor.value?.chain().focus().setTextAlign('justify').run(), isActive: () => editor.value?.isActive({ textAlign: 'justify' }), group: 'align' },
  highlight: { id: 'highlight', icon: 'border_color', action: () => editor.value?.chain().focus().toggleHighlight().run(), isActive: () => editor.value?.isActive('highlight'), group: 'format' },
  textColor: { id: 'textColor', icon: 'format_color_text', action: () => showColorPicker('text'), group: 'text-style' },
  backgroundColor: { id: 'backgroundColor', icon: 'format_color_fill', action: () => showColorPicker('background'), group: 'text-style' },
  fontFamily: { id: 'fontFamily', icon: 'font_download', action: () => showFontFamilyPicker(), group: 'text-style' },
  superscript: { id: 'superscript', icon: 'superscript', action: () => editor.value?.chain().focus().toggleSuperscript().run(), isActive: () => editor.value?.isActive('superscript'), group: 'text-style' },
  subscript: { id: 'subscript', icon: 'subscript', action: () => editor.value?.chain().focus().toggleSubscript().run(), isActive: () => editor.value?.isActive('subscript'), group: 'text-style' },
  horizontalRule: { id: 'horizontalRule', icon: 'remove', action: () => editor.value?.chain().focus().setHorizontalRule().run(), group: 'format' },
  insertTable: { id: 'insertTable', icon: 'table_view', action: () => editor.value?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(), group: 'table' },
  undo: { id: 'undo', icon: 'undo', action: () => editor.value?.chain().focus().undo().run(), canExecute: () => editor.value?.can().undo(), group: 'actions' },
  redo: { id: 'redo', icon: 'redo', action: () => editor.value?.chain().focus().redo().run(), canExecute: () => editor.value?.can().redo(), group: 'actions' },
  clearAll: { id: 'clearAll', icon: 'delete_sweep', action: () => clearAll(), group: 'actions' },
  spellcheck: { id: 'spellcheck', icon: 'spellcheck', action: () => toggleSpellcheck(), isActive: () => spellcheckEnabled.value, tooltip: () => (spellcheckEnabled.value ? '맞춤법 검사 끄기' : '맞춤법 검사 켜기'), group: 'actions' },
}

function createToolbarItems(mode = 'normal') {
  const items = props.toolbarOrder.map((id) => toolbarItemDefinitions[id]).filter(Boolean)
  return items.filter((item) => {
    if (item.visible && typeof item.visible === 'function') {
      if (!item.visible()) return false
    }
    if (mode === 'normal' && props.normalModeExcludedIds.includes(item.id)) {
      return false
    }
    return true
  })
}

const normalToolbarItems = computed(() => createToolbarItems('normal'))
const fullscreenToolbarItems = computed(() => createToolbarItems('fullscreen'))

const fontFamilies = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Comic Sans MS', 'Trebuchet MS', 'Arial Black', 'Impact']
</script>

<style lang="scss" scoped>
.tiptap-editor {
  border-radius: 4px;
  overflow: hidden;

  &.editor-light {
    border: 1px solid rgba(0, 0, 0, 0.12);
  }

  &.editor-dark {
    border: 1px solid rgba(1, 1, 1, 0.47);
  }

  .editor-toolbar {
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);

    .row {
      margin-left: -2px !important;
      margin-right: -2px !important;
    }

    :deep(.q-btn) {
      margin-left: -1px !important;
      margin-right: -1px !important;
    }

    &.toolbar-light {
      background-color: #1a1a1a;
      border-bottom-color: rgba(16, 16, 16, 0.731);

      :deep(.q-btn) {
        color: rgba(255, 255, 255, 0.7);

        &:hover {
          background-color: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
        }

        &.q-btn--active,
        &[aria-pressed='true'] {
          color: var(--q-primary);
        }
      }
    }

    &.toolbar-dark {
      background-color: #1a1a1ad0;
      border-bottom-color: rgba(0, 0, 0, 0.8);

      :deep(.q-btn) {
        color: rgba(255, 255, 255, 0.62);

        &:hover {
          background-color: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
        }

        &.q-btn--active,
        &[aria-pressed='true'] {
          color: var(--q-primary);
        }
      }
    }
  }

  &.editor-light {
    .editor-content {
      background-color: #ffffff;
    }
  }

  &.editor-dark {
    .editor-content {
      background-color: #202020;

      :deep(.ProseMirror) {
        color: #b0b0b0;
      }
    }
  }

  .editor-content {
    min-height: 200px;
    max-height: 800px;
    overflow-y: auto;
    padding: 16px;
    :deep(.ProseMirror) {
      outline: none;
      min-height: 200px;

      p {
        margin: 0.5em 0;
      }

      h1 {
        font-size: 2em;
        font-weight: bold;
        margin: 0.5em 0;
      }

      h2 {
        font-size: 1.5em;
        font-weight: bold;
        margin: 0.5em 0;
      }

      ul,
      ol {
        padding-left: 1.5em;
        margin: 0.5em 0;
      }

      ul[data-type='taskList'] {
        list-style: none !important;
        padding-left: 0 !important;
        margin-left: 0 !important;

        li[data-type='taskItem'] {
          list-style: none !important;
          list-style-type: none !important;

          &::before {
            display: none !important;
            content: none !important;
          }
        }
      }

      blockquote {
        border-left: 3px solid rgba(0, 0, 0, 0.12);
        padding-left: 1em;
        margin: 0.5em 0;
        font-style: italic;
      }

      code {
        background-color: rgba(0, 0, 0, 0.05);
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-family: monospace;
      }

      pre {
        background-color: rgba(0, 0, 0, 0.05);
        padding: 1em;
        border-radius: 4px;
        overflow-x: auto;
        margin: 0.5em 0;

        code {
          background-color: transparent;
          padding: 0;
        }
      }

      img {
        max-width: 100%;
        height: auto;
        border-radius: 4px;
        margin: 0.5em 0;
      }

      video {
        max-width: 90%;
        width: 90%;
        height: auto;
        border-radius: 4px;
        margin: 0.5em auto;
        display: block;
      }

      audio {
        max-width: 90%;
        width: 90%;
        margin: 0.5em auto;
        display: block;
      }

      table {
        border-collapse: collapse;
        margin: 0.5em 0;
        width: 100%;

        td,
        th {
          padding: 0.5em;
        }

        th {
          font-weight: bold;
        }
      }

      a {
        color: var(--q-primary);
        text-decoration: underline;
      }
    }

    :deep(.ProseMirror-focused) {
      outline: none;
    }
  }
}

body:not(.dark) {
  .tiptap-editor,
  .fullscreen-content {
    :deep(.ProseMirror) {
      table {
        td,
        th {
          border: 1px solid rgba(0, 0, 0, 0.2) !important;
        }

        th {
          background-color: rgba(0, 0, 0, 0.05) !important;
        }
      }
    }
  }
}

body.dark {
  .tiptap-editor,
  .fullscreen-content {
    :deep(.ProseMirror) {
      table {
        td,
        th {
          border: 1px solid rgba(0, 0, 0, 0.965) !important;
        }

        th {
          background-color: rgba(0, 0, 0, 0.099) !important;
        }
      }
    }
  }
}

.fullscreen-editor-card {
  display: flex;
  flex-direction: column;
  height: 100vh;

  &.editor-light {
    .fullscreen-content .editor-content-fullscreen {
      background-color: #ffffff;
    }
  }

  &.editor-dark {
    .fullscreen-content .editor-content-fullscreen {
      background-color: #49494929;

      :deep(.ProseMirror) {
        color: #b0b0b0;
      }
    }
  }
}

.fullscreen-header {
  flex-shrink: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);

  .fullscreen-title-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .fullscreen-main-title {
    font-size: 48px;
    font-weight: 900;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    letter-spacing: -0.5px;
    line-height: 1;

    .fullscreen-mode-label {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0px;
    }
  }

  .fullscreen-subtitle {
    font-size: 16px;
    font-weight: 400;
    letter-spacing: 2.5px;
    line-height: 0.8;
  }

  .fullscreen-editor-card.editor-light & {
    .fullscreen-main-title {
      color: #000000;
    }

    .fullscreen-subtitle {
      color: rgba(0, 0, 0, 0.6);
    }
  }

  .fullscreen-editor-card.editor-dark & {
    .fullscreen-main-title {
      color: var(--nexa-text-primary, #919191);
    }

    .fullscreen-subtitle {
      color: rgba(236, 236, 13, 0.7);
    }
  }

  .close-btn {
    color: var(--nexa-text-primary, #000000);
    opacity: 0.6;

    &:hover {
      opacity: 1;
    }
  }
}

.fullscreen-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 !important;
  min-height: 0;

  .editor-toolbar {
    flex-shrink: 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);

    .row {
      margin-left: -2px !important;
      margin-right: -2px !important;
    }

    :deep(.q-btn) {
      margin-left: 2px !important;
      margin-right: 2px !important;
    }

    &.toolbar-light {
      background-color: #1a1a1a;
      border-bottom-color: rgba(16, 16, 16, 0.731);

      :deep(.q-btn) {
        color: rgba(255, 255, 255, 0.7);

        &:hover {
          background-color: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
        }

        &.q-btn--active,
        &[aria-pressed='true'] {
          color: var(--q-primary);
        }
      }
    }

    &.toolbar-dark {
      background-color: #1a1a1ad0;
      border-bottom-color: rgba(0, 0, 0, 0.8);

      :deep(.q-btn) {
        color: rgba(255, 255, 255, 0.62);

        &:hover {
          background-color: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
        }

        &.q-btn--active,
        &[aria-pressed='true'] {
          color: var(--q-primary);
        }
      }
    }
  }

  .editor-content-fullscreen {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    min-height: 0;

    :deep(.ProseMirror) {
      outline: none;
      min-height: 100%;

      p {
        margin: 0.5em 0;
      }

      h1 {
        font-size: 2em;
        font-weight: bold;
        margin: 0.5em 0;
      }

      h2 {
        font-size: 1.5em;
        font-weight: bold;
        margin: 0.5em 0;
      }

      ul,
      ol {
        padding-left: 1.5em;
        margin: 0.5em 0;
      }

      ul[data-type='taskList'] {
        list-style: none !important;
        padding-left: 0 !important;
        margin-left: 0 !important;

        li[data-type='taskItem'] {
          list-style: none !important;
          list-style-type: none !important;

          &::before {
            display: none !important;
            content: none !important;
          }
        }
      }

      blockquote {
        border-left: 3px solid rgba(0, 0, 0, 0.12);
        padding-left: 1em;
        margin: 0.5em 0;
        font-style: italic;
      }

      code {
        background-color: rgba(0, 0, 0, 0.05);
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-family: monospace;
      }

      pre {
        background-color: rgba(0, 0, 0, 0.05);
        padding: 1em;
        border-radius: 4px;
        overflow-x: auto;
        margin: 0.5em 0;

        code {
          background-color: transparent;
          padding: 0;
        }
      }

      img {
        max-width: 100%;
        height: auto;
        border-radius: 4px;
        margin: 0.5em 0;
      }

      video {
        max-width: 90%;
        width: 90%;
        height: auto;
        border-radius: 4px;
        margin: 0.5em auto;
        display: block;
      }

      audio {
        max-width: 90%;
        width: 90%;
        margin: 0.5em auto;
        display: block;
      }

      table {
        border-collapse: collapse;
        margin: 0.5em 0;
        width: 100%;

        td,
        th {
          padding: 0.5em;
        }

        th {
          font-weight: bold;
        }
      }

      a {
        color: var(--q-primary);
        text-decoration: underline;
      }
    }

    :deep(.ProseMirror-focused) {
      outline: none;
    }
  }
}
</style>
