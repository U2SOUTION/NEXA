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

    <template v-else>
      <!-- 편집 모드가 아닐 때만 헤더와 통계 표시 -->
      <template v-if="!isEditMode">
        <!-- 헤더를 스크롤 컨테이너의 직접 자식으로 배치 (sticky 작동을 위해) -->
        <div class="file-content-header row items-center justify-between">
          <div>
            <div class="text-h6 file-content-title">{{ documentStore.selectedFile.displayName }}</div>
            <div class="text-caption file-content-filename row items-center q-gutter-xs">
              <span>{{ documentStore.selectedFile.displayPath || documentStore.selectedFile.relativePath || documentStore.selectedFile.path || documentStore.selectedFile.name }}</span>
              <q-btn flat dense round icon="content_copy" size="sm" class="copy-path-btn" @click="handleCopyFilePath">
                <q-tooltip>경로 복사</q-tooltip>
              </q-btn>
            </div>
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
              <q-btn flat dense icon="text_fields" class="rename-btn" @click="handleRenameFile">
                <q-tooltip>이름 변경</q-tooltip>
              </q-btn>
              <q-btn flat dense icon="update" class="update-date-btn" @click="handleUpdateModifiedDate">
                <q-tooltip>수정일 갱신</q-tooltip>
              </q-btn>
              <q-btn flat dense icon="cached" :class="['refresh-btn', { 'refresh-rotating': isRefreshingFile }]" @click="handleRefreshFile">
                <q-tooltip>업데이트</q-tooltip>
              </q-btn>
              <q-btn flat dense icon="delete" class="trash-btn" @click="handleMoveToTrash">
                <q-tooltip>휴지통</q-tooltip>
              </q-btn>
              <q-btn flat dense icon="edit_note" class="edit-btn" @click="enterEditMode">
                <q-tooltip>편집</q-tooltip>
              </q-btn>
              <q-btn v-if="hasMermaidBlocks" flat dense icon="account_tree" :class="['mermaid-edit-btn', { active: isRightSidebarOpen }]" @click="toggleMermaidEditor">
                <q-tooltip>{{ isRightSidebarOpen ? '다이어그램 편집 닫기' : '다이어그램 편집' }}</q-tooltip>
              </q-btn>
              <q-btn v-if="hasSearchKeywords" flat dense icon="highlight" :class="['highlight-toggle-btn', { active: showHighlight }]" @click="toggleHighlight">
                <q-tooltip>{{ showHighlight ? '검색어 하일라이팅 숨기기' : '검색어 하일라이팅 보기' }}</q-tooltip>
              </q-btn>
              <q-btn v-if="hasCodeBlocks" flat dense icon="code" :class="['code-block-toggle-btn', { active: !codeBlocksCollapsed }]" @click="toggleCodeBlocks">
                <q-tooltip>{{ codeBlocksCollapsed ? '코드 블럭 모두 펼치기' : '코드 블럭 모두 접기' }}</q-tooltip>
              </q-btn>
              <q-btn ref="tocButtonRef" flat dense icon="menu" class="toc-btn" @click="openTOCInSidebar" :disable="documentStore.tocItems.length === 0">
                <q-tooltip>목차</q-tooltip>
              </q-btn>
            </template>
          </div>
        </div>

        <!-- 컨텐츠 래퍼 (헤더 다음에 배치) -->
        <div class="file-content">
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
        </div>
      </template>

      <!-- 편집 모드: 에디터 표시 -->
      <template v-else>
        <div class="edit-mode-container">
          <div class="edit-mode-header row items-center justify-between q-pa-sm">
            <div class="text-subtitle2 text-primary">편집 모드</div>
            <div class="row q-gutter-xs">
              <q-btn flat dense icon="save" label="저장" color="primary" @click="saveEdit" />
              <q-btn flat dense icon="close" label="취소" class="cancel-edit-btn" @click="exitEditMode" />
            </div>
          </div>
          <TiptapEditor v-model="editContent" />
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch, toRef, computed } from 'vue'
import { useQuasar } from 'quasar'
import TiptapEditor from '@domains/parts/components/TiptapEditor.vue'
import { parseMarkdown } from '@system/utils/markdown/index'
import { useMermaid } from '@domains/dev/modules/document-manager/composables/useMermaid'
import { useUserSettingsStore } from '@system/store/userSettingsStore'
import { loadCheckboxStates, loadTOCSettings, moveToTrash, restoreFromTrash, permanentlyDeleteFromTrash, emptyTrash, renameFile } from '@domains/dev/modules/document-manager/services/documentStorage'
import { useDocumentStats } from '@domains/dev/modules/document-manager/composables/useDocumentStats'
import { useDocumentManagerStore } from '@system/store/documentManagerStore'
import { copyTextToClipboard } from '@system/utils/clipboard'
import { getDocFileUrl } from '@system/utils/apiBaseUrl'

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
const isRefreshingFile = ref(false)

// Mermaid 렌더링 Composable 사용
const { renderMermaid, reapplyMermaidStyles, cleanup: cleanupMermaid } = useMermaid(markdownContentRef, () => documentStore.selectedFile?.name || null)

// 강제 스티키 헤더 보정용 변수/함수
let scrollContainerEl = null
let headerEl = null
let sectionScrollTimer = null
let scrollCleanup = null

function isScrollable(el) {
  if (!el) return false
  const style = window.getComputedStyle(el)
  const overflowY = style.overflowY
  const hasScroll = el.scrollHeight > el.clientHeight + 1
  return hasScroll && (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay')
}

function findScrollableParent(startEl) {
  let node = startEl
  while (node && node !== document.body && node !== document.documentElement) {
    if (isScrollable(node)) return node
    node = node.parentElement
  }
  return window
}

function getCssNumber(el, name, fallback) {
  if (!el) return fallback
  const v = window.getComputedStyle(el).getPropertyValue(name)
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : fallback
}

function applyForceSticky() {
  if (!scrollContainerEl || !headerEl) return

  const headerHeight = headerEl.getBoundingClientRect().height
  // 전역으로 헤더 높이 변수 설정 (컨텐츠 패딩 보정에 사용)
  document.documentElement.style.setProperty('--file-header-height', `${headerHeight}px`)

  const offset = getCssNumber(scrollContainerEl, '--dev-sticky-offset', 44)
  const padding = getCssNumber(scrollContainerEl, '--dev-page-padding', 16)

  // 컨텐츠 컨테이너 폭을 기준으로 중앙 정렬
  const containerRect =
    headerEl.closest('.file-content-container')?.getBoundingClientRect() ||
    (scrollContainerEl === window ? document.documentElement.getBoundingClientRect() : scrollContainerEl.getBoundingClientRect())
  const scrollLeft = scrollContainerEl === window ? window.scrollX : scrollContainerEl.scrollLeft

  headerEl.classList.add('force-sticky-fixed')
  headerEl.style.position = 'fixed'
  headerEl.style.top = `${offset + padding}px`
  headerEl.style.left = `${containerRect.left + scrollLeft}px`
  headerEl.style.width = `${containerRect.width}px`
  headerEl.style.marginLeft = '0'
  headerEl.style.marginRight = '0'
}

function handleForceStickyScroll() {
  if (!scrollContainerEl) return
  applyForceSticky()
}

function handleForceStickyResize() {
  if (!scrollContainerEl || !headerEl) return
  headerEl.style.position = 'sticky'
  headerEl.style.left = ''
  headerEl.style.width = ''
  applyForceSticky()
}

function setupStickyHeader() {
  if (scrollCleanup) {
    scrollCleanup()
    scrollCleanup = null
  }

  nextTick(() => {
    const headerCandidate = document.querySelector('.file-content-header')
    if (!headerCandidate) return

    const scrollContainer =
      findScrollableParent(headerCandidate) ||
      document.querySelector('.q-page.development-page') ||
      document.querySelector('.q-page') ||
      window

    scrollContainerEl = scrollContainer
    headerEl = headerCandidate

    const rect = headerEl.getBoundingClientRect()
    document.documentElement.style.setProperty('--file-header-height', `${rect.height}px`)
    applyForceSticky()

    const handleScroll = () => {
      handleForceStickyScroll()
      if (sectionScrollTimer) clearTimeout(sectionScrollTimer)
      sectionScrollTimer = setTimeout(() => {
        updateCurrentSection()
      }, 100)
    }

    scrollContainer.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleForceStickyResize)

    scrollCleanup = () => {
      scrollContainer.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleForceStickyResize)
    }
  })
}

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
        setupStickyHeader()
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

// 하일라이팅 토글 상태
const showHighlight = ref(true)

// 검색 키워드가 있는지 확인
const hasSearchKeywords = computed(() => {
  return documentStore.globalSearchKeywords && documentStore.globalSearchKeywords.length > 0
})

// 코드 블럭 접기/펼치기 상태
const codeBlocksCollapsed = ref(false)

// 코드 블럭 존재 여부 확인
const hasCodeBlocks = ref(false)

// 코드 블럭 존재 여부 업데이트
function updateCodeBlocksStatus() {
  nextTick(() => {
    if (markdownContentRef.value) {
      const codeBlocks = markdownContentRef.value.querySelectorAll('.code-block')
      hasCodeBlocks.value = codeBlocks.length > 0
    } else {
      hasCodeBlocks.value = false
    }
  })
}

// 표시할 내용 (검색 키워드 하일라이팅 포함)
const displayContent = ref('')

// 하일라이팅 적용 여부에 따라 내용 업데이트
function updateDisplayContent() {
  if (!documentStore.selectedFile || !documentStore.displayContent) {
    displayContent.value = ''
    return
  }

  if (showHighlight.value && hasSearchKeywords.value) {
    displayContent.value = getDisplayContentWithHighlight(documentStore.globalSearchKeywords, documentStore.globalSearchResults, searchMode.value)
  } else {
    displayContent.value = documentStore.displayContent
  }

  nextTick(() => {
    nextTick(() => {
      setTimeout(() => {
        renderMermaid()
        // 코드 블럭 상태 복원 및 존재 여부 업데이트
        updateCodeBlocksStatus()
        if (markdownContentRef.value && codeBlocksCollapsed.value) {
          const codeBlocks = markdownContentRef.value.querySelectorAll('.code-block')
          codeBlocks.forEach((block) => {
            block.classList.add('collapsed')
          })
        }
        // 코드 블럭에 아이콘 추가 및 클릭 이벤트 연결
        if (markdownContentRef.value) {
          const codeBlocks = markdownContentRef.value.querySelectorAll('.code-block')
          codeBlocks.forEach((block) => {
            // 코드 블럭에 아이콘 추가 (이미 있으면 추가하지 않음)
            let icon = block.querySelector('.code-block-toggle-icon')
            if (!icon) {
              icon = document.createElement('i')
              icon.className = 'code-block-toggle-icon material-icons'
              icon.textContent = 'code'
              icon.setAttribute('aria-hidden', 'true')
              block.style.position = 'relative'
              block.appendChild(icon)
            }

            // 아이콘에 클릭 이벤트 리스너 추가 (중복 방지)
            icon.removeEventListener('click', handleCodeBlockIconClick)
            icon.addEventListener('click', handleCodeBlockIconClick)
          })
        }
      }, 800)
    })
  })
}

// store의 displayContent computed를 watch하여 파일 로드 완료 시 자동 업데이트
watch(
  () => documentStore.displayContent,
  () => {
    updateDisplayContent()
  },
  { immediate: true },
)

// 로딩 상태가 변경될 때도 업데이트
watch(
  () => documentStore.loadingFile,
  (loadingFileName) => {
    if (!loadingFileName && documentStore.selectedFile) {
      nextTick(() => {
        updateDisplayContent()
      })
    }
  },
)

// 검색 키워드, 검색 결과, 검색 모드 변경 시 하일라이팅 업데이트
watch(
  [() => documentStore.globalSearchKeywords, () => documentStore.globalSearchResults, () => searchMode.value, () => showHighlight.value],
  () => {
    if (documentStore.selectedFile && documentStore.displayContent) {
      nextTick(() => {
        updateDisplayContent()
      })
    }
  },
  { deep: true },
)

// 하일라이팅 토글 핸들러
function toggleHighlight() {
  showHighlight.value = !showHighlight.value
  updateDisplayContent()
}

// 코드 블럭 접기 함수 (개별 블럭용)
function collapseCodeBlock(block) {
  const currentHeight = block.scrollHeight
  block.style.maxHeight = `${currentHeight}px`
  block.offsetHeight
  block.classList.add('collapsed')
  block.style.maxHeight = '50px'
}

// 코드 블럭 펼치기 함수 (개별 블럭용)
function expandCodeBlock(block) {
  const currentHeight = block.scrollHeight
  block.style.maxHeight = `${currentHeight}px`
  block.classList.remove('collapsed')
  block.offsetHeight
  block.style.maxHeight = `${block.scrollHeight}px`
  setTimeout(() => {
    block.style.maxHeight = ''
  }, 500)
}

// 코드 블럭 아이콘 클릭 핸들러 (아코디언 방식)
function handleCodeBlockIconClick(event) {
  // 이벤트 전파 중단
  event.stopPropagation()
  event.preventDefault()

  const icon = event.currentTarget
  const codeBlock = icon.closest('.code-block')

  if (!codeBlock || !markdownContentRef.value) return

  // 코드 블럭 접기/펼치기 처리
  const codeBlocks = markdownContentRef.value.querySelectorAll('.code-block')
  const isClickedBlockCollapsed = codeBlock.classList.contains('collapsed')

  // 클릭된 블럭의 상태에 따라 토글
  if (isClickedBlockCollapsed) {
    // 접혀있으면 펼치기
    expandCodeBlock(codeBlock)
  } else {
    // 펼쳐져 있으면 접기
    collapseCodeBlock(codeBlock)
  }

  // 클릭된 블럭을 제외한 나머지 모두 접기
  codeBlocks.forEach((block) => {
    if (block !== codeBlock && !block.classList.contains('collapsed')) {
      collapseCodeBlock(block)
    }
  })
}

// 코드 블럭 접기/펼치기 토글 핸들러 (전체 토글 버튼용)
function toggleCodeBlocks() {
  codeBlocksCollapsed.value = !codeBlocksCollapsed.value
  nextTick(() => {
    if (markdownContentRef.value) {
      const codeBlocks = markdownContentRef.value.querySelectorAll('.code-block')
      codeBlocks.forEach((block) => {
        if (codeBlocksCollapsed.value) {
          collapseCodeBlock(block)
        } else {
          expandCodeBlock(block)
        }
      })
    }
  })
}

// 파일 변경 시 코드 블럭 상태 초기화
watch(
  () => documentStore.selectedFile,
  () => {
    codeBlocksCollapsed.value = false
    nextTick(() => {
      if (markdownContentRef.value) {
        const codeBlocks = markdownContentRef.value.querySelectorAll('.code-block')
        codeBlocks.forEach((block) => {
          block.classList.remove('collapsed')
        })
      }
    })
  },
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
  // - HTML을 마크다운으로 변환
  // - 체크박스 상태를 원본 마크다운에 반영 (- [ ] → - [x])
  // - PUT /api/docs/:fileName API 호출하여 파일 저장
  // - localStorage의 체크박스 상태도 원본 파일에 반영
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
    // relativePath를 우선 사용, 없으면 name 사용
    const filePath = documentStore.selectedFile.relativePath || documentStore.selectedFile.path || documentStore.selectedFile.name
    const displayName = documentStore.selectedFile.displayName

    try {
      await permanentlyDeleteFromTrash(filePath, documentStore)
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
  if (!documentStore.selectedFile || isRefreshingFile.value) return

  isRefreshingFile.value = true

  try {
    const { selectFile } = documentStore
    if (selectFile) {
      await selectFile(documentStore.selectedFile)
    }

    $q.notify({
      type: 'positive',
      message: '파일 내용이 업데이트되었습니다',
      position: 'top',
      timeout: 4000,
      icon: 'cached',
    })
  } catch (error) {
    console.error('[Refresh] 파일 업데이트 실패:', error)
    $q.notify({
      type: 'negative',
      message: `파일 업데이트 실패: ${error.message || '알 수 없는 오류'}`,
      position: 'top',
      timeout: 6000,
      icon: 'error',
    })
  } finally {
    // 1회전 애니메이션 (0.8초 후 초기화)
    setTimeout(() => {
      isRefreshingFile.value = false
    }, 800)
  }
}

// 수정일 갱신
async function handleUpdateModifiedDate() {
  if (!documentStore.selectedFile) return

  const filePath = documentStore.selectedFile.relativePath || documentStore.selectedFile.path || ''
  const pathParts = filePath.split('/')
  const actualFileName = pathParts[pathParts.length - 1]

  try {
    const response = await fetch(getDocFileUrl(filePath) + '/touch', {
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

// 파일 경로 복사 (실제 경로 형식으로 복사 - 복붙·공유에 유리)
async function handleCopyFilePath() {
  if (!documentStore.selectedFile) return

  const filePath = documentStore.selectedFile.displayPath || documentStore.selectedFile.relativePath || documentStore.selectedFile.path || documentStore.selectedFile.name

  try {
    await copyTextToClipboard(filePath)
    $q.notify({
      type: 'positive',
      message: '경로가 클립보드에 복사되었습니다',
      position: 'top',
      timeout: 2000,
      icon: 'content_copy',
    })
  } catch (error) {
    console.error('[Copy] 경로 복사 실패:', error)
    $q.notify({
      type: 'negative',
      message: `경로 복사 실패: ${error.message || '알 수 없는 오류'}`,
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

  // 스크롤 이벤트/스티키 설정
  setupStickyHeader()
})

onUnmounted(() => {
  if (cleanupMermaid) {
    cleanupMermaid()
  }
  window.removeEventListener('keydown', handleKeydown)
  if (scrollContainerEl) {
    scrollContainerEl.removeEventListener('scroll', handleForceStickyScroll)
  }
  window.removeEventListener('resize', handleForceStickyResize)
  if (scrollCleanup) {
    scrollCleanup()
  }
})

// 편집 모드가 끝나면 헤더가 다시 나타나므로 스티키 재설정
watch(isEditMode, (val) => {
  if (!val) {
    setupStickyHeader()
  } else if (scrollCleanup) {
    scrollCleanup()
  }
})
</script>

<style lang="scss" scoped>
.file-content-header {
  position: sticky;
  // 필요 시 상위에서 CSS 변수로 오버라이드
  z-index: 10;
  background: var(--nexa-background); //투명도 있으면 스크롤 할때 비춰서 투명도 없도록 할것
  padding: 18px 20px 10px 20px;
  //margin: 0 -20px 16px -20px;
  border-bottom: 5px solid var(--nexa-border-color);
  box-shadow: 0 2px 4px var(--nexa-shadow-1, rgba(0, 0, 0, 0.5));
  width: calc(100% + 40px);
  box-sizing: border-box;

  .file-content-title {
    margin-bottom: 0 !important;
    font-size: 2.5em;
    line-height: 1;
    letter-spacing: -0.05em;
    font-weight: 800;
  }

  .file-content-filename {
    color: var(--nexa-text-secondary);
    line-height: 1.2;

    .copy-path-btn {
      opacity: 0.6;
      transition:
        opacity 0.2s ease,
        color 0.2s ease;

      &:hover {
        opacity: 1;
        color: var(--nexa-primary);
      }

      :deep(.q-icon) {
        font-size: 14px;
      }
    }
  }

  :deep(.rename-btn),
  :deep(.update-date-btn),
  :deep(.refresh-btn),
  :deep(.edit-btn),
  :deep(.toc-btn),
  :deep(.cancel-edit-btn) {
    color: var(--nexa-text-secondary);
    transition:
      color 0.2s ease,
      background-color 0.2s ease;

    .q-btn__content {
      color: var(--nexa-text-secondary);
    }

    &:hover .q-btn__content {
      color: var(--q-primary);
    }
    &:hover {
      background-color: color-mix(in srgb, var(--q-primary) 10%, transparent);
    }
  }

  :deep(.mermaid-edit-btn),
  :deep(.highlight-toggle-btn),
  :deep(.code-block-toggle-btn) {
    color: var(--nexa-text-secondary);
    transition:
      color 0.2s ease,
      background-color 0.2s ease;

    .q-btn__content {
      color: var(--nexa-text-secondary);
    }

    &.active {
      color: var(--nexa-accent);

      .q-btn__content {
        color: var(--nexa-accent);
      }

      // active 상태일 때 hover해도 primary 색상 유지
      &:hover .q-btn__content {
        color: var(--q-primary);
      }
    }

    &:hover .q-btn__content {
      color: var(--q-primary);
    }
    &:hover {
      background-color: color-mix(in srgb, var(--q-primary) 10%, transparent);
    }
  }

  // 새로고침 아이콘 회전 애니메이션
  :deep(.refresh-btn.refresh-rotating) {
    .q-icon {
      animation: refresh-rotate 0.4s ease-in-out;
    }
  }

  @keyframes refresh-rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
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

.file-content-header.force-sticky-fixed {
  margin-left: 0;
  margin-right: 0;
}

// 헤더가 sticky일 때 컨텐츠가 가려지지 않도록 상단 여백 확보
.file-content {
  // 헤더가 고정될 때 가리지 않도록 충분한 상단 여백 확보
  margin-top: calc(var(--file-header-height, 96px) + 10px);
  padding-top: 6px;
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

// .markdown-content 스타일은 전역으로 이동됨
// src/css/nexa-system/_markdown.scss 참조
</style>
