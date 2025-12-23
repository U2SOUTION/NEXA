<!-- DocumentManagerContent.vue
  문서 관리 메인 컨텐츠 컴포넌트
  파일 헤더, 통계, 마크다운 렌더링, 편집 모드 등 포함
-->
<template>
  <div class="file-content-container" :class="{ 'edit-mode': isEditMode }">
    <div v-if="!documentStore.selectedFile" class="q-pa-xl text-center">
      <q-icon name="description" size="64px" class="q-mb-md" />
      <div class="text-h6">왼쪽 사이드바에서 문서를 선택하세요</div>
    </div>

    <div v-else class="file-content">
      <!-- 편집 모드가 아닐 때만 헤더와 통계 표시 -->
      <template v-if="!isEditMode">
        <div class="file-content-header row items-center justify-between">
          <div>
            <div class="text-h6 file-content-title">{{ documentStore.selectedFile.displayName }}</div>
            <div class="text-caption file-content-filename">{{ documentStore.selectedFile.relativePath || documentStore.selectedFile.path || documentStore.selectedFile.name }}</div>
          </div>
          <div class="row q-gutter-xs">
            <!-- 휴지통에 있는 파일인 경우: 복원, 영구 삭제, 전체 휴지통 비우기 -->
            <template v-if="documentStore.selectedFile && documentStore.trashFiles.includes(documentStore.selectedFile.name)">
              <q-btn flat dense icon="restore" label="복원" color="primary" @click="handleRestoreFile" />
              <q-btn flat dense icon="delete_forever" label="영구 삭제" color="negative" @click="handlePermanentlyDelete" />
              <q-btn flat dense icon="delete_sweep" label="전체 비우기" color="negative" @click="handleEmptyTrash" />
            </template>
            <template v-else>
              <!-- 일반 파일인 경우: 파일명 변경, 수정일 갱신, 업데이트, 휴지통, 편집, 다이어그램 편집, 목차 -->
              <q-btn flat dense icon="text_fields" color="grey-7" class="rename-btn" @click="handleRenameFile">
                <q-tooltip>이름 변경</q-tooltip>
              </q-btn>
              <q-btn flat dense icon="update" color="grey-7" class="update-date-btn" @click="handleUpdateModifiedDate">
                <q-tooltip>수정일 갱신</q-tooltip>
              </q-btn>
              <q-btn flat dense icon="cached" color="grey-7" class="refresh-btn" @click="handleRefreshFile">
                <q-tooltip>업데이트</q-tooltip>
              </q-btn>
              <q-btn flat dense icon="delete" color="grey-7" class="trash-btn" @click="handleMoveToTrash">
                <q-tooltip>휴지통</q-tooltip>
              </q-btn>
              <q-btn flat dense icon="edit_note" color="grey-7" class="edit-btn" @click="enterEditMode">
                <q-tooltip>편집</q-tooltip>
              </q-btn>
              <q-btn v-if="hasMermaidBlocks" flat dense icon="account_tree" :color="isRightSidebarOpen ? 'primary' : 'grey-7'" class="mermaid-edit-btn" @click="toggleMermaidEditor">
                <q-tooltip>{{ isRightSidebarOpen ? '다이어그램 편집 닫기' : '다이어그램 편집' }}</q-tooltip>
              </q-btn>
              <q-btn ref="tocButtonRef" flat dense icon="menu" color="grey-7" class="toc-btn" @click="openTOCInSidebar" :disable="documentStore.tocItems.length === 0">
                <q-tooltip>목차</q-tooltip>
              </q-btn>
            </template>
          </div>
        </div>

        <!-- 선택한 파일의 상세 통계 -->
        <div v-if="getFileTotalCount(documentStore.selectedFile) > 0" class="file-stats-section q-pa-sm q-mb-md">
          <div class="row items-center q-gutter-sm">
            <div class="text-caption">진행률:</div>
            <q-linear-progress :value="getFileProgress(documentStore.selectedFile) / 100" :color="getFileProgress(documentStore.selectedFile) === 100 ? 'positive' : 'primary'" size="8px" rounded class="col" />
            <div class="text-caption text-primary text-weight-bold">{{ getFileProgress(documentStore.selectedFile) }}%</div>
            <q-separator vertical />
            <div class="text-caption">
              완료: <span class="text-positive text-weight-bold">{{ getFileCompletedCount(documentStore.selectedFile) }}</span>
            </div>
            <div class="text-caption">
              미완료: <span class="text-weight-bold">{{ getFilePendingCount(documentStore.selectedFile) }}</span>
            </div>
          </div>
        </div>

        <!-- 파싱된 마크다운 내용 -->
        <div class="markdown-content" ref="markdownContentRef" v-html="displayContent" @click="handleContentClick" @scroll="updateCurrentSection"></div>
      </template>

      <!-- 편집 모드: 에디터 표시 -->
      <div v-else class="edit-mode-container">
        <div class="edit-mode-header row items-center justify-between q-pa-sm">
          <div class="text-subtitle2 text-primary">편집 모드</div>
          <div class="row q-gutter-xs">
            <q-btn flat dense icon="save" label="저장" color="primary" @click="saveEdit" />
            <q-btn flat dense icon="close" label="취소" color="grey-7" @click="exitEditMode" />
          </div>
        </div>
        <TiptapEditor v-model="editContent" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch, toRef, computed } from 'vue'
import { useQuasar } from 'quasar'
import TiptapEditor from 'src/components/parts-management/TiptapEditor.vue'
import { parseMarkdown } from 'src/modules/document-manager/services/markdownParser.js'
import { useMermaid } from 'src/modules/document-manager/composables/useMermaid.js'
import { useUserSettingsStore } from 'src/stores/userSettingsStore'
import { loadCheckboxStates, loadTOCSettings, moveToTrash, restoreFromTrash, permanentlyDeleteFromTrash, emptyTrash, renameFile } from 'src/modules/document-manager/services/documentStorage.js'
import { useDocumentStats } from 'src/modules/document-manager/composables/useDocumentStats.js'
import { useDocumentManagerStore } from 'src/stores/documentManagerStore.js'

const $q = useQuasar()
const documentStore = useDocumentManagerStore()
const userSettings = useUserSettingsStore()

// 편집 모드 상태
const isEditMode = ref(false)
const editContent = ref('')

// 검색 모드 (하일라이팅을 위해 필요)
const searchMode = ref('both') // 검색 모드: 'title', 'content', 'both', 'checkbox'

// 템플릿 ref
const markdownContentRef = ref(null)
const tocButtonRef = ref(null)

// Mermaid 렌더링 Composable 사용
const { renderMermaid, reapplyMermaidStyles, cleanup: cleanupMermaid } = useMermaid(markdownContentRef, () => documentStore.selectedFile?.name || null)

// 테마 변경 시 Mermaid 스타일 재적용
watch(
  () => userSettings.settings.theme.isDarkMode,
  () => {
    nextTick(() => {
      setTimeout(() => {
        reapplyMermaidStyles()
      }, 300)
    })
  },
)

// Store에서 함수 가져오기
const { updateCurrentSection, handleContentClick, getDisplayContentWithHighlight } = documentStore

// 파일 선택 시 편집 모드 자동 종료 및 TOC 업데이트
watch(
  () => documentStore.selectedFile,
  (newFile, oldFile) => {
    if (isEditMode.value) {
      exitEditMode()
    }
    if (newFile && oldFile !== undefined) {
      nextTick(() => {
        documentStore.generateTOC()
      })
    }
  },
  { immediate: true },
)

// 통계 계산 Composable 사용
const { getFileTotalCount, getFileCompletedCount, getFilePendingCount, getFileProgress } = useDocumentStats(toRef(documentStore, 'markdownFiles'), toRef(documentStore, 'fileContents'), toRef(documentStore, 'checkboxStates'))

// Mermaid 블록 존재 여부 감지
const hasMermaidBlocks = computed(() => {
  if (!documentStore.selectedFile) return false

  const content = documentStore.displayContent || ''
  if (content.includes('mermaid-block')) return true

  if (markdownContentRef.value) {
    const mermaidBlocks = markdownContentRef.value.querySelectorAll('.mermaid-block')
    return mermaidBlocks.length > 0
  }

  return false
})

// 우측 사이드바 열림 상태 감지
const isRightSidebarOpen = computed(() => userSettings.settings.drawer.rightOpen)

// 다이어그램 편집 아이콘 클릭 핸들러
async function toggleMermaidEditor() {
  const isCurrentlyOpen = userSettings.settings.drawer.rightOpen

  if (isCurrentlyOpen) {
    userSettings.setRightDrawerOpen(false)
  } else {
    userSettings.setRightDrawerOpen(true)
    await nextTick()
    window.dispatchEvent(new CustomEvent('expand-mermaid-section'))
  }
}

// 표시할 내용 (검색 키워드 하일라이팅 포함)
const displayContent = ref('')

// store의 displayContent computed를 watch하여 파일 로드 완료 시 자동 업데이트
watch(
  () => documentStore.displayContent,
  (newContent) => {
    if (documentStore.selectedFile && newContent && newContent.length > 0) {
      displayContent.value = getDisplayContentWithHighlight(documentStore.globalSearchKeywords, documentStore.globalSearchResults, searchMode.value)
      nextTick(() => {
        nextTick(() => {
          setTimeout(() => {
            renderMermaid()
          }, 800)
        })
      })
    } else if (!documentStore.selectedFile) {
      displayContent.value = ''
    }
  },
  { immediate: true },
)

// 로딩 상태가 변경될 때도 업데이트
watch(
  () => documentStore.loadingFile,
  (loadingFileName) => {
    if (!loadingFileName && documentStore.selectedFile) {
      nextTick(() => {
        const baseContent = documentStore.displayContent
        if (baseContent) {
          displayContent.value = getDisplayContentWithHighlight(documentStore.globalSearchKeywords, documentStore.globalSearchResults, searchMode.value)
          nextTick(() => {
            nextTick(() => {
              setTimeout(() => {
                renderMermaid()
              }, 800)
            })
          })
        }
      })
    }
  },
)

// 검색 키워드, 검색 결과, 검색 모드 변경 시 하일라이팅 업데이트
watch(
  [() => documentStore.globalSearchKeywords, () => documentStore.globalSearchResults, () => searchMode.value],
  () => {
    if (documentStore.selectedFile && documentStore.displayContent) {
      nextTick(() => {
        const baseContent = documentStore.displayContent
        if (baseContent) {
          displayContent.value = getDisplayContentWithHighlight(documentStore.globalSearchKeywords, documentStore.globalSearchResults, searchMode.value)
          nextTick(() => {
            nextTick(() => {
              setTimeout(() => {
                renderMermaid()
              }, 800)
            })
          })
        }
      })
    }
  },
  { deep: true },
)

// HTML의 체크박스를 Tiptap TaskList 형식으로 변환
function convertCheckboxesToTiptapFormat(html) {
  if (!html) return html

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const checkboxItems = Array.from(doc.querySelectorAll('.checkbox-item'))

  let currentTaskList = null
  let lastCheckboxItem = null

  checkboxItems.forEach((checkboxItem) => {
    const input = checkboxItem.querySelector('input[type="checkbox"]')
    const label = checkboxItem.querySelector('label')

    if (input && label) {
      const isChecked = input.hasAttribute('checked')
      const text = label.textContent || label.innerText || ''
      const isAdjacent = lastCheckboxItem && checkboxItem.previousElementSibling === lastCheckboxItem

      if (!isAdjacent || !currentTaskList) {
        currentTaskList = doc.createElement('ul')
        currentTaskList.setAttribute('data-type', 'taskList')
        currentTaskList.style.listStyle = 'none'
        currentTaskList.style.paddingLeft = '0'
      }

      const taskItem = doc.createElement('li')
      taskItem.setAttribute('data-type', 'taskItem')
      taskItem.setAttribute('data-checked', isChecked.toString())
      taskItem.style.listStyle = 'none'

      const taskLabel = doc.createElement('label')
      taskLabel.style.display = 'flex'
      taskLabel.style.alignItems = 'flex-start'
      taskLabel.style.cursor = 'pointer'

      const taskInput = doc.createElement('input')
      taskInput.setAttribute('type', 'checkbox')
      if (isChecked) {
        taskInput.setAttribute('checked', 'checked')
      }
      taskInput.style.marginRight = '8px'
      taskInput.style.marginTop = '2px'
      taskInput.style.flexShrink = '0'

      const taskSpan = doc.createElement('span')
      taskSpan.textContent = ''

      const taskDiv = doc.createElement('div')
      const taskP = doc.createElement('p')
      const taskTextSpan = doc.createElement('span')
      taskTextSpan.textContent = text
      taskP.appendChild(taskTextSpan)
      taskDiv.appendChild(taskP)

      taskLabel.appendChild(taskInput)
      taskLabel.appendChild(taskSpan)
      taskItem.appendChild(taskLabel)
      taskItem.appendChild(taskDiv)
      currentTaskList.appendChild(taskItem)

      if (currentTaskList.children.length === 1) {
        checkboxItem.parentNode?.insertBefore(currentTaskList, checkboxItem)
      }

      checkboxItem.remove()
      lastCheckboxItem = taskItem
    }
  })

  return doc.body.innerHTML
}

// 편집 모드 진입
function enterEditMode() {
  if (!documentStore.selectedFile) return
  const markdownContent = documentStore.fileContents[documentStore.selectedFile.name] || ''
  const fileKey = documentStore.selectedFile.name
  const fileCheckboxStates = documentStore.checkboxStates[fileKey] || {}
  let html = parseMarkdown(markdownContent, fileKey, fileCheckboxStates)
  html = convertCheckboxesToTiptapFormat(html)
  editContent.value = html
  isEditMode.value = true
}

// 편집 모드 종료
function exitEditMode() {
  isEditMode.value = false
  editContent.value = ''
}

// 편집 내용 저장
function saveEdit() {
  if (!documentStore.selectedFile) return
  // TODO: 파일 저장 로직 구현 필요
  documentStore.fileContents[documentStore.selectedFile.name] = editContent.value
  exitEditMode()
}

// 목차를 사이드바에서 열기
async function openTOCInSidebar() {
  if (!userSettings.settings.drawer.rightOpen) {
    userSettings.setRightDrawerOpen(true)
    await nextTick()
  }
  window.dispatchEvent(new CustomEvent('expand-toc-section'))
}

// 파일을 휴지통으로 이동
function handleMoveToTrash() {
  if (!documentStore.selectedFile) return

  $q.dialog({
    title: '휴지통으로 이동',
    message: `"${documentStore.selectedFile.displayName}"을(를) 휴지통으로 이동하시겠습니까?`,
    persistent: true,
    ok: {
      label: '이동',
      color: 'negative',
      flat: false,
    },
    cancel: {
      label: '취소',
      flat: true,
    },
  }).onOk(() => {
    moveToTrash(documentStore.selectedFile.name, documentStore)
    documentStore.selectedFile = null
    $q.notify({
      type: 'info',
      message: '휴지통으로 이동했습니다',
      position: 'top',
      timeout: 2000,
    })
  })
}

// 파일 복구
function handleRestoreFile() {
  if (!documentStore.selectedFile) return

  restoreFromTrash(documentStore.selectedFile.name, documentStore)
  $q.notify({
    type: 'positive',
    message: `${documentStore.selectedFile.displayName}을(를) 복구했습니다`,
    position: 'top',
    timeout: 2000,
  })
}

// 파일 영구 삭제
async function handlePermanentlyDelete() {
  if (!documentStore.selectedFile) return

  $q.dialog({
    title: '영구 삭제',
    message: `"${documentStore.selectedFile.displayName}"을(를) 영구적으로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
    persistent: true,
    ok: {
      label: '삭제',
      color: 'negative',
      flat: false,
    },
    cancel: {
      label: '취소',
      flat: true,
    },
  }).onOk(async () => {
    const fileName = documentStore.selectedFile.name
    const displayName = documentStore.selectedFile.displayName

    try {
      await permanentlyDeleteFromTrash(fileName, documentStore)
      documentStore.selectedFile = null

      $q.notify({
        type: 'negative',
        message: `${displayName}을(를) 영구적으로 삭제했습니다`,
        position: 'top',
        timeout: 2000,
      })
    } catch (error) {
      console.error('[Trash] 영구 삭제 실패:', error)
      $q.notify({
        type: 'negative',
        message: `삭제 실패: ${error.message || '알 수 없는 오류'}`,
        position: 'top',
        timeout: 3000,
      })
    }
  })
}

// 전체 휴지통 비우기
async function handleEmptyTrash() {
  if (!documentStore.trashFiles || documentStore.trashFiles.length === 0) {
    $q.notify({
      type: 'info',
      message: '휴지통이 이미 비어있습니다',
      position: 'top',
      timeout: 2000,
    })
    return
  }

  const trashCount = documentStore.trashFiles.length

  $q.dialog({
    title: '전체 휴지통 비우기',
    message: `정말로 휴지통의 모든 항목(${trashCount}개)을 영구적으로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
    persistent: true,
    ok: {
      label: '전체 삭제',
      color: 'negative',
      flat: false,
    },
    cancel: {
      label: '취소',
      flat: true,
    },
  }).onOk(async () => {
    try {
      const deletedCount = await emptyTrash(documentStore)

      if (documentStore.selectedFile && documentStore.trashFiles.includes(documentStore.selectedFile.name)) {
        documentStore.selectedFile = null
      }

      $q.notify({
        type: 'negative',
        message: `휴지통의 모든 항목(${deletedCount}개)을 영구적으로 삭제했습니다`,
        position: 'top',
        timeout: 3000,
      })
    } catch (error) {
      console.error('[Trash] 전체 휴지통 비우기 실패:', error)
      $q.notify({
        type: 'negative',
        message: `휴지통 비우기 실패: ${error.message || '알 수 없는 오류'}`,
        position: 'top',
        timeout: 3000,
      })
    }
  })
}

// 파일 내용 업데이트
async function handleRefreshFile() {
  if (!documentStore.selectedFile) return

  try {
    const { selectFile } = documentStore
    if (selectFile) {
      await selectFile(documentStore.selectedFile)
    }

    $q.notify({
      type: 'positive',
      message: '파일 내용이 업데이트되었습니다',
      position: 'top',
      timeout: 2000,
    })
  } catch (error) {
    console.error('[Refresh] 파일 업데이트 실패:', error)
    $q.notify({
      type: 'negative',
      message: `파일 업데이트 실패: ${error.message || '알 수 없는 오류'}`,
      position: 'top',
      timeout: 3000,
    })
  }
}

// 수정일 갱신
async function handleUpdateModifiedDate() {
  if (!documentStore.selectedFile) return

  // path는 이미 relativePath와 동일하므로 그대로 사용
  const filePath = documentStore.selectedFile.relativePath || documentStore.selectedFile.path || ''
  const pathParts = filePath.split('/')
  const actualFileName = pathParts[pathParts.length - 1]
  const directoryPath = pathParts.length > 1 ? pathParts.slice(0, -1).join('/') : ''
  const fullRelativePath = directoryPath ? `${directoryPath}/${actualFileName}` : actualFileName

  try {
    const encodedFileName = encodeURIComponent(fullRelativePath)
    const response = await fetch(`http://localhost:3000/api/docs/${encodedFileName}/touch`, {
      method: 'POST',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `서버 오류: ${response.status}`)
    }

    await response.json()

    const { loadMarkdownFiles } = documentStore
    if (loadMarkdownFiles) {
      await loadMarkdownFiles()

      if (documentStore.markdownFiles && documentStore.markdownFiles.length > 0) {
        const updatedFile = documentStore.markdownFiles.find((f) => f.path === filePath || f.name === actualFileName)
        if (updatedFile) {
          const { selectFile } = documentStore
          if (selectFile) {
            await selectFile(updatedFile)
          }
        }
      }
    }

    $q.notify({
      type: 'positive',
      message: '수정일이 갱신되었습니다',
      position: 'top',
      timeout: 2000,
    })
  } catch (error) {
    console.error('[Touch] 수정일 갱신 실패:', error)
    $q.notify({
      type: 'negative',
      message: `수정일 갱신 실패: ${error.message || '알 수 없는 오류'}`,
      position: 'top',
      timeout: 3000,
    })
  }
}

// 파일명 변경
function handleRenameFile() {
  if (!documentStore.selectedFile) return

  // path는 이미 relativePath와 동일하므로 그대로 사용
  const filePath = documentStore.selectedFile.relativePath || documentStore.selectedFile.path || ''
  const relativeFullPath = filePath
  const pathParts = relativeFullPath.split('/')
  const actualFileName = pathParts[pathParts.length - 1]
  const directoryPath = pathParts.length > 1 ? pathParts.slice(0, -1).join('/') : ''
  const currentNameWithoutExt = actualFileName.replace('.md', '')

  $q.dialog({
    title: '파일명 변경',
    message: '새 파일명을 입력하세요 (.md 확장자는 자동으로 추가됩니다)',
    prompt: {
      model: currentNameWithoutExt,
      type: 'text',
      isValid: (val) => val.length > 0 && !val.includes('..') && !val.includes('/') && !val.includes('\\'),
      attrs: {
        maxlength: 255,
        placeholder: '파일명 입력',
      },
    },
    persistent: true,
    ok: {
      label: '변경',
      color: 'primary',
      flat: false,
    },
    cancel: {
      label: '취소',
      flat: true,
    },
  }).onOk(async (newNameWithoutExt) => {
    const newFileName = newNameWithoutExt.endsWith('.md') ? newNameWithoutExt : `${newNameWithoutExt}.md`

    if (newFileName === actualFileName) {
      $q.notify({
        type: 'info',
        message: '동일한 파일명입니다',
        position: 'top',
        timeout: 2000,
      })
      return
    }

    try {
      const oldFilePath = directoryPath ? `${directoryPath}/${actualFileName}` : actualFileName
      const newFilePath = directoryPath ? `${directoryPath}/${newFileName}` : newFileName

      await renameFile(oldFilePath, newFilePath, documentStore, null)

      $q.notify({
        type: 'positive',
        message: `파일명이 "${newFileName.replace('.md', '').replace(/_/g, ' ')}"으로 변경되었습니다`,
        position: 'top',
        timeout: 2000,
      })
    } catch (error) {
      console.error('[Rename] 파일명 변경 실패:', error)
      $q.notify({
        type: 'negative',
        message: `파일명 변경 실패: ${error.message || '알 수 없는 오류'}`,
        position: 'top',
        timeout: 3000,
      })
    }
  })
}

// ESC 키로 편집 모드 종료
function handleKeydown(event) {
  const activeElement = document.activeElement
  const isInputField = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable || activeElement.closest('input, textarea, [contenteditable]'))

  if (event.key === 'Escape') {
    if (isEditMode.value) {
      exitEditMode()
      event.preventDefault()
      return
    }
    return
  }

  if (isInputField && !event.ctrlKey && !event.metaKey) {
    return
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'e' && !event.shiftKey) {
    if (!isInputField) {
      event.preventDefault()
      event.stopPropagation()
      if (isEditMode.value) {
        exitEditMode()
      } else {
        enterEditMode()
      }
    }
    return
  }
}

onMounted(() => {
  // 마운트 후 초기 Mermaid 렌더링 시도
  nextTick(() => {
    setTimeout(() => {
      renderMermaid()
    }, 500)
  })
  loadCheckboxStates(documentStore.checkboxStates)
  loadTOCSettings({
    tocAutoCloseOnContentClick: documentStore.tocAutoCloseOnContentClick,
    autoHighlightOnScroll: documentStore.autoHighlightOnScroll,
    searchMode,
    listMode: 'default',
    sortOrder: 'asc',
    sortType: 'name',
  })

  // ESC 키 이벤트 리스너
  window.addEventListener('keydown', handleKeydown)

  // 스크롤 이벤트 리스너
  nextTick(() => {
    let scrollTimer = null
    const scrollContainer = document.querySelector('.q-page.development-page') || document.querySelector('.q-page') || window
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', () => {
        if (scrollTimer) clearTimeout(scrollTimer)
        scrollTimer = setTimeout(() => {
          updateCurrentSection()
        }, 100)
      })
    }
  })
})

onUnmounted(() => {
  if (cleanupMermaid) {
    cleanupMermaid()
  }
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style lang="scss" scoped>
.file-content-container {
  height: 100%;
  overflow-y: auto;
  background: var(--nexa-background);
  padding: 0 20px 20px 20px;
  scroll-behavior: smooth;
  display: flex;
  flex-direction: column;

  &.edit-mode {
    padding: 0;
    overflow: hidden;

    .file-content {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
  }
}

.file-content-header {
  background: var(--nexa-background-darker);
  padding: 18px 20px 10px 20px;
  margin: 0 -20px 16px -20px;
  border-bottom: 3px solid var(--nexa-border-color);
  box-shadow: 0 2px 4px var(--nexa-shadow-1, rgba(0, 0, 0, 0.5));
  width: calc(100% + 40px);
  box-sizing: border-box;

  .file-content-title {
    margin-bottom: 0 !important;
    line-height: 1.2;
  }

  .file-content-filename {
    color: var(--nexa-text-secondary);
    margin-top: 2px !important;
    line-height: 1.2;
  }

  :deep(.rename-btn),
  :deep(.update-date-btn),
  :deep(.refresh-btn),
  :deep(.edit-btn),
  :deep(.toc-btn) {
    transition:
      color 0.2s ease,
      background-color 0.2s ease;
    &:hover .q-btn__content {
      color: var(--q-primary);
    }
    &:hover {
      background-color: color-mix(in srgb, var(--q-primary) 10%, transparent);
    }
  }

  :deep(.trash-btn) {
    transition:
      color 0.2s ease,
      background-color 0.2s ease;
    &:hover .q-btn__content {
      color: var(--nexa-button-danger-bg);
    }
    &:hover {
      background-color: color-mix(in srgb, var(--nexa-button-danger-bg) 10%, transparent);
    }
  }
}

.edit-mode-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  height: 100%;

  .edit-mode-header {
    flex-shrink: 0;
    background: var(--nexa-background-darker);
    border-bottom: 1px solid var(--nexa-border-color);
  }

  :deep(.tiptap-editor) {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 100%;
    border: none !important;
    border-radius: 0 !important;

    .editor-content {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
      max-height: none !important;
      height: 100%;
    }
  }
}

.file-stats-section {
  background: var(--nexa-background-lower);
  border: 1px solid var(--nexa-border-color);
  border-radius: 8px;
}

.markdown-content {
  line-height: 1.4;
  color: var(--nexa-text-secondary);
  padding: 0;
  margin: 0;
  text-align: left;

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4),
  :deep(h5),
  :deep(h6) {
    transition: all 0.3s ease;
    position: relative;
    border-radius: 4px;

    /* 스크롤 하일라이팅 스타일 */
    &.current-section {
      border: 1px solid color-mix(in srgb, var(--nexa-accent) 50%, transparent);
      border-left: 15px solid var(--nexa-accent);
      animation: highlightPulse 0.5s ease-out 3;
      padding: 2px 8px;
      margin-left: -15px;
    }
  }

  @keyframes highlightPulse {
    50% {
      border-left-width: 2px;
    }
    100% {
      border-left-width: 5px;
    }
  }

  :deep(h1) {
    font-weight: 900;
    color: var(--nexa-text-primary);
    opacity: 1;
    margin-bottom: 5px;
  }

  :deep(h2) {
    font-weight: 800;
    color: var(--nexa-text-primary);
    opacity: 0.9;
    margin-bottom: 5px;
  }

  :deep(h3) {
    font-weight: 700;
    color: var(--nexa-text-primary);
    opacity: 0.8;
    margin-bottom: 5px;
  }
  :deep(h4) {
    font-weight: 600;
    color: var(--nexa-text-primary);
    opacity: 0.7;
    margin-bottom: 5px;
  }

  :deep(h5) {
    font-weight: 500;
    color: var(--nexa-text-primary);
    opacity: 0.6;
    margin-bottom: 5px;
  }

  :deep(h6) {
    font-weight: 400;
    color: var(--nexa-text-primary);
    opacity: 0.5;
    margin-bottom: 5px;
  }

  :deep(p) {
    color: var(--nexa-text-secondary);
    margin-bottom: 1em;
  }

  :deep(hr) {
    border: none;
    border-top: 2px solid var(--nexa-border-color);
    margin-top: 2em;
    opacity: 0.6;
  }

  // ul, ol 태그 스타일
  :deep(ul),
  :deep(ol) {
    color: var(--nexa-text-secondary);
    margin-bottom: 1em;
    margin-left: 0 !important;
    padding-left: 2em !important;
    list-style-position: outside;
  }

  // 순서 있는 리스트 스타일 (번호 표시)
  :deep(ol) {
    list-style-type: decimal !important;
  }

  // li 태그 스타일 (부모 ul/ol이 있는 경우)
  :deep(ul li),
  :deep(ol li) {
    margin-top: 0.3em;
    margin-bottom: 0.1em;
    margin-left: 0 !important;
    padding-left: 0 !important;
    text-indent: 0;
    display: list-item !important;
  }

  // 순서 있는 리스트 아이템 (번호 표시)
  :deep(ol li) {
    list-style-type: decimal !important;
  }

  // li 태그가 부모 없이 직접 사용되는 경우
  // 마크다운 파서가 ul/ol을 생성하지 못한 경우 대비
  :deep(li) {
    margin-bottom: 0.5em;
    margin-left: 0 !important;
    padding-left: 2em !important;
    text-indent: 0;
    list-style-position: outside;
    display: list-item;
  }

  // 중첩 리스트
  :deep(ul ul),
  :deep(ol ol),
  :deep(ul ol),
  :deep(ol ul) {
    margin-left: 0 !important;
    padding-left: 1em !important;
  }

  :deep(.code-block) {
    background: var(--nexa-background-lower);
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 16px 0;
    border: 2px solid var(--nexa-border-color);
    white-space: pre-wrap;
    word-wrap: break-word;

    code {
      color: var(--nexa-text-primary-focus);
      font-size: 0.9em;
      white-space: pre-wrap;
      display: block;
      width: 100%;
      opacity: 0.8;
    }
  }

  :deep(.code-inline) {
    background: var(--nexa-background-darker);
    padding: 3px 8px;
    border-radius: 6px;
    font-family: 'Courier New', monospace;
    font-size: 1em;
    color: var(--q-primary);
  }

  :deep(strong) {
    color: var(--nexa-accent);
    font-weight: 600;
    opacity: 0.9;
  }

  :deep(.global-search-highlight) {
    background-color: var(--nexa-accent);
    color: var(--nexa-text-primary);
    padding: 2px 4px;
    border-radius: 3px;
    font-weight: 600;
  }

  :deep(.checkbox-item) {
    display: flex;
    align-items: flex-start;
    margin-bottom: 2px;
    margin-top: 0;
    pointer-events: none;

    .dev-checkbox-input {
      margin-right: 8px;
      margin-top: 1.5px;
      cursor: pointer;
      pointer-events: auto;
      width: 18px;
      height: 18px;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      background: transparent;
      border: 3px solid var(--nexa-border-color);
      border-radius: 4px;
      position: relative;
      flex-shrink: 0;

      &:checked {
        &::after {
          content: '';
          position: absolute;
          left: 4px;
          top: 1px;
          width: 5px;
          height: 10px;
          border: solid var(--q-primary);
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
      }

      &:hover {
        border-color: var(--q-primary);
      }

      &:focus {
        outline: none;
        border-color: var(--q-primary);
        box-shadow: 0 0 0 2px rgba(var(--q-primary-rgb), 0.2);
      }
    }

    .dev-checkbox-label {
      color: var(--nexa-text-secondary);
      line-height: 1.6;
      cursor: pointer;
      flex: 0 0 auto;
      user-select: none;
      pointer-events: auto;
      width: fit-content;
      max-width: 100%;
    }
  }

  :deep(.mermaid-block) {
    margin: 24px 0;
    padding: 16px;
    background: var(--nexa-surface);
    border-radius: 8px;
    border: 1px solid var(--nexa-border-color);
    overflow-x: auto;
    overflow-y: visible;
    text-align: center;
    min-height: 100px;
    min-width: 100%;
    display: block;
    box-sizing: border-box;

    svg {
      max-width: 100%;
      height: auto;
      width: 100%;
    }

    &.mermaid-rendered {
      display: block;
    }

    &:not(.mermaid-rendered) {
      position: relative;
      &::after {
        content: '차트 렌더링 중...';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: var(--nexa-text-secondary);
        font-size: 0.875rem;
      }
    }
  }

  :deep(.mermaid-error) {
    background: var(--nexa-error-bg, rgba(193, 0, 21, 0.1));
    border: 1px solid var(--nexa-error-border, rgba(193, 0, 21, 0.3));
    border-radius: 4px;
    font-size: 0.875rem;
    color: var(--nexa-error-text, var(--nexa-error, #c10015));
  }
}
</style>
