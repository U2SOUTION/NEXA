import { defineStore } from 'pinia'
import { ref, computed, watch, nextTick } from 'vue'
import type { Ref } from 'vue'
import { useQuasar } from 'quasar'
import { parseMarkdown, escapeHtml } from '@system/utils/markdown/index'
import { saveCheckboxStates, loadCheckboxStates, loadTOCExpandedState, loadSupportedExtensions } from '@domains/dev/modules/document-manager/services/documentStorage'
import { useTOC } from '@domains/dev/modules/document-manager/composables/useTOC'
import { removeExtension } from '@system/config/documentConfig'
import { getDocsBaseUrl, getDocFileUrl } from '@system/utils/apiBaseUrl'

export interface MarkdownFileMeta {
  name: string
  displayName: string
  path: string
  relativePath: string
  displayPath: string
  loadContent: () => Promise<string>
  modifiedDate: string | null
  createdDate: string | null
}

interface TOCNode {
  id: string
  text: string
  level: number
  lineIndex?: number
  children?: TOCNode[]
}

/**
 * 문서 관리 Store
 * DevelopmentPage와 DocumentListSidebar 간 상태 공유
 */
export const useDocumentManagerStore = defineStore('documentManager', () => {
  const $q = useQuasar()
  const docsBaseUrl = getDocsBaseUrl()

  const markdownFiles = ref<MarkdownFileMeta[]>([])
  const selectedFile = ref<MarkdownFileMeta | null>(null)
  const fileContents = ref<Record<string, string>>({})
  const checkboxStates = ref<Record<string, Record<string, boolean>>>({})
  const tocItems = ref<TOCNode[]>([])
  const tocExpanded = ref<Record<string, boolean>>({})
  const tocAutoCollapse = ref(true)
  const tocAutoCloseOnContentClick = ref(true)
  const autoHighlightOnScroll = ref(true)
  const currentSectionId = ref<string | null>(null)
  const showTOC = ref(false)
  const isManualHighlight = ref(false)
  const hideCompleted = ref(false)
  const loadingFile = ref<string | null>(null)
  const trashFiles = ref<string[]>([])
  const allTOCExpandedState = ref(false)
  const globalSearchKeywords = ref<string[]>([])
  const globalSearchResults = ref<unknown[]>([])

  function addToTrash(fileName: string) {
    if (!trashFiles.value.includes(fileName)) {
      const currentArray = Array.from(trashFiles.value)
      const newArray = [...currentArray, fileName]
      trashFiles.value = newArray
    }
  }

  function removeFromTrash(fileName: string) {
    const currentArray = Array.from(trashFiles.value)
    const newArray = currentArray.filter((name) => name !== fileName)
    trashFiles.value = newArray
  }

  // localStorage에서 휴지통 파일 목록 로드
  function loadTrashFilesFromStorage() {
    try {
      const saved = localStorage.getItem('dev-trash-files')
      if (saved) {
        const parsed = JSON.parse(saved)
        const newArray = Array.isArray(parsed) ? parsed : []
        trashFiles.value = newArray
      } else {
        trashFiles.value = []
      }
    } catch (error) {
      console.error('[Trash] Store loadTrashFilesFromStorage 실패:', error)
      trashFiles.value = []
    }
  }

  // 백엔드 확장자 설정 동기화
  async function syncExtensionsToBackend() {
    try {
      const extensions = loadSupportedExtensions()
      const response = await fetch(`${docsBaseUrl}/config/extensions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          extensions: extensions,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('[Store] 백엔드 확장자 설정 동기화 성공:', result.extensions)
      } else {
        console.warn('[Store] 백엔드 확장자 설정 동기화 실패:', response.status)
      }
    } catch (error) {
      console.warn('[Store] 백엔드 확장자 설정 동기화 중 오류 (무시됨):', (error as Error).message)
      // 초기 로드 시 백엔드가 아직 시작되지 않았을 수 있으므로 오류는 무시
    }
  }

  // 마크다운 파일 목록 로드
  async function loadMarkdownFiles() {
    // 백엔드 확장자 설정 동기화 (파일 로드 전에 수행)
    await syncExtensionsToBackend()

    try {
      // 이전 파일 목록 및 해시 정보 로드 (localStorage에서)
      const PREVIOUS_FILES_KEY = 'dev-previous-file-list'
      const PREVIOUS_FILES_HASH_KEY = 'dev-previous-file-hashes'
      let previousFileList = []
      let previousFileHashes = new Map() // relativePath -> { contentHash, size }
      try {
        const saved = localStorage.getItem(PREVIOUS_FILES_KEY)
        if (saved) {
          previousFileList = JSON.parse(saved)
        }
        const savedHashes = localStorage.getItem(PREVIOUS_FILES_HASH_KEY)
        if (savedHashes) {
          const hashData = JSON.parse(savedHashes)
          previousFileHashes = new Map(Object.entries(hashData))
        }
      } catch (e) {
        console.warn('[Store] 이전 파일 목록 로드 실패:', e)
      }

      // 백엔드에서 파일 목록과 메타데이터 가져오기 (실제 파일 시스템과 동기화)
      let backendFilesMap = new Map()
      let metadataMap = new Map()
      let currentFileRelativePaths: string[] = []
      try {
        const metadataResponse = await fetch(`${docsBaseUrl}/metadata`)
        if (metadataResponse.ok) {
          const metadataData = await metadataResponse.json()
          if (metadataData.success && metadataData.files) {
            type FileMetaItem = { relativePath?: string; fileName?: string; modifiedDate?: string; createdDate?: string; displayPath?: string; contentHash?: string; size?: number }
            metadataData.files.forEach((fileMeta: FileMetaItem) => {
              const key = fileMeta.relativePath || fileMeta.fileName
              if (!key) return
              backendFilesMap.set(key, fileMeta)
              metadataMap.set(key, {
                modifiedDate: fileMeta.modifiedDate,
                createdDate: fileMeta.createdDate,
                size: fileMeta.size,
                contentHash: fileMeta.contentHash,
              })
              currentFileRelativePaths.push(key)
            })
          }
        }
      } catch (metadataError) {
        console.warn('[Store] 메타데이터 로드 실패 (계속 진행):', metadataError)
        // 메타데이터 로드 실패 시 빈 Map 사용
      }

      // 파일명 변경 감지 및 mtime 업데이트
      // 이전 파일 목록과 현재 파일 목록을 비교하여 파일명이 변경된 파일 감지
      const filesToTouch = []
      if (previousFileList.length > 0 && currentFileRelativePaths.length > 0) {
        // 이전 파일 목록에서 사라진 파일 찾기 (파일명 변경 또는 삭제)
        const missingFiles = previousFileList.filter((prevPath: string) => !currentFileRelativePaths.includes(prevPath))
        const newFiles = currentFileRelativePaths.filter((currPath) => !previousFileList.includes(currPath))

        if (missingFiles.length > 0 && newFiles.length > 0) {
          console.log(`[Store] 파일 목록 변경 감지 - 사라진 파일: ${missingFiles.length}개, 새 파일: ${newFiles.length}개`)

          // 파일명 변경 감지: 이전 파일과 새 파일의 contentHash를 비교
          for (const newFilePath of newFiles) {
            const newFileMeta = metadataMap.get(newFilePath)
            if (!newFileMeta || !newFileMeta.contentHash) continue

            // 새 파일의 contentHash와 동일한 해시를 가진 이전 파일 찾기
            const matchingPrevFile = missingFiles.find((prevPath: string) => {
              const prevHashData = previousFileHashes.get(prevPath)
              return prevHashData && prevHashData.contentHash === newFileMeta.contentHash
            })

            if (matchingPrevFile) {
              // 파일명이 변경된 것으로 확인됨
              console.log(`[Store] 파일명 변경 감지: ${matchingPrevFile} -> ${newFilePath}`)
              filesToTouch.push(newFilePath)
            }
          }
        }
      }

      // 파일명이 변경된 파일의 mtime 업데이트
      if (filesToTouch.length > 0) {
        console.log(`[Store] ${filesToTouch.length}개 파일의 mtime 업데이트 시작...`)
        for (const filePath of filesToTouch) {
          try {
            const response = await fetch(getDocFileUrl(filePath) + '/touch', {
              method: 'POST',
            })
            if (response.ok) {
              const result = await response.json()
              console.log(`[Store] 파일 mtime 업데이트 성공: ${filePath} -> ${result.updatedModifiedDate}`)
            } else {
              console.warn(`[Store] 파일 mtime 업데이트 실패: ${filePath}`, response.status)
            }
          } catch (error) {
            console.error(`[Store] 파일 mtime 업데이트 오류: ${filePath}`, error)
          }
        }

        // mtime 업데이트 후 메타데이터 재로드
        console.log('[Store] mtime 업데이트 후 메타데이터 재로드 중...')
        try {
          const metadataResponse = await fetch(`${docsBaseUrl}/metadata`)
          if (metadataResponse.ok) {
            const metadataData = await metadataResponse.json()
            if (metadataData.success && metadataData.files) {
              // 메타데이터 업데이트
              backendFilesMap.clear()
              metadataMap.clear()
              currentFileRelativePaths = []
              metadataData.files.forEach((fileMeta: { relativePath?: string; fileName?: string; modifiedDate?: string; createdDate?: string; displayPath?: string; contentHash?: string; size?: number }) => {
                const key = fileMeta.relativePath || fileMeta.fileName
                if (!key) return
                backendFilesMap.set(key, fileMeta)
                metadataMap.set(key, {
                  modifiedDate: fileMeta.modifiedDate,
                  createdDate: fileMeta.createdDate,
                  size: fileMeta.size,
                  contentHash: fileMeta.contentHash,
                })
                currentFileRelativePaths.push(key)
              })
              console.log('[Store] 메타데이터 재로드 완료')
            }
          }
        } catch (error) {
          console.warn('[Store] 메타데이터 재로드 실패 (계속 진행):', error)
        }
      }

      // 현재 파일 목록 및 해시 정보 저장 (다음 로드 시 비교용)
      try {
        localStorage.setItem(PREVIOUS_FILES_KEY, JSON.stringify(currentFileRelativePaths))
        const currentFileHashes: Record<string, { contentHash?: string; size?: number }> = {}
        metadataMap.forEach((meta: { contentHash?: string; size?: number }, path: string) => {
          if (meta.contentHash) {
            currentFileHashes[path] = {
              contentHash: meta.contentHash,
              size: meta.size,
            }
          }
        })
        localStorage.setItem(PREVIOUS_FILES_HASH_KEY, JSON.stringify(currentFileHashes))
      } catch (e) {
        console.warn('[Store] 현재 파일 목록 저장 실패:', e)
      }

      // 백엔드 API에서 가져온 파일 목록만 사용 (import.meta.glob 제거)
      // 문서는 NEXA-Documentation 폴더에 있으며, 모든 파일 로드는 백엔드 API를 통해 수행됩니다
      const files = []

      // 백엔드에서 가져온 모든 파일을 추가
      for (const [relativePath, fileMeta] of backendFilesMap.entries()) {
        const fileName = fileMeta.fileName
        // 확장자 제거 (설정에서 지정한 확장자 사용)
        let displayName = removeExtension(fileName).replace(/_/g, ' ')

        // README 파일인 경우 최상위 폴더부터 부모 폴더까지 모두 포함
        // 확장자 제거 후 'readme'인지 확인
        const fileNameWithoutExt = removeExtension(fileName).toLowerCase()
        if (fileNameWithoutExt === 'readme') {
          const pathParts = relativePath.split('/').filter((part: string) => part && part.trim() !== '')
          if (pathParts.length > 1) {
            // 파일명 제외한 모든 폴더 경로 추출
            const folderParts = pathParts.slice(0, -1) // 마지막 요소(파일명) 제외

            // 각 폴더명에서 숫자 접두사 제거 및 가독성 변환
            const cleanedFolders = folderParts.map((folder: string) => folder.replace(/^\d+-/, '').replace(/_/g, ' ').replace(/-/g, ' '))

            // "README (Platform - 기획)" 형식으로 표시
            displayName = `README (${cleanedFolders.join('/')})`
          }
        }

        const metadata = metadataMap.get(relativePath) || { modifiedDate: null, createdDate: null }
        const displayPath = fileMeta.displayPath || relativePath

        // 백엔드 API를 통해 파일 내용을 로드하는 함수 (다중 폴더 지원: /f/ 경로)
        const loadContent = async () => {
          try {
            const url = getDocFileUrl(relativePath)
            console.log(`[Store] 파일 내용 로드 시도: ${relativePath} -> ${url}`)

            const response = await fetch(url)
            if (response.ok) {
              const content = await response.text()
              console.log(`[Store] 파일 내용 로드 성공: ${relativePath} (${content.length} bytes)`)
              return content
            } else {
              const errorText = await response.text().catch(() => '')
              console.error(`[Store] 파일 내용 로드 실패: ${relativePath} (${response.status})`, errorText)
              throw new Error(`파일을 불러올 수 없습니다: ${response.status} ${errorText}`)
            }
          } catch (error) {
            console.error(`[Store] 파일 내용 로드 실패: ${relativePath}`, error)
            throw error // 에러를 다시 throw하여 상위에서 처리할 수 있도록 함
          }
        }

        files.push({
          name: fileName,
          displayName: displayName,
          path: relativePath, // API용 (nexa-docs/..., platform-docs/...)
          relativePath: relativePath,
          displayPath, // 복사/표시용 실제 경로
          loadContent: loadContent,
          modifiedDate: metadata.modifiedDate,
          createdDate: metadata.createdDate,
        })
      }

      // 파일명으로 정렬
      files.sort((a, b) => a.name.localeCompare(b.name))

      markdownFiles.value = files

      if (files.length > 0 && !selectedFile.value) {
        selectFile(files[0], undefined, undefined)
      }
    } catch (error) {
      console.error('[Store] 마크다운 파일 로드 실패:', error)
      $q.notify({
        type: 'negative',
        message: '문서를 불러오는 중 오류가 발생했습니다.',
        position: 'top',
      })
    }
  }

  async function selectFile(
    file: MarkdownFileMeta,
    fileUsageCounts?: Record<string, number>,
    incrementFileUsage?: (fileName: string, counts: Record<string, number>) => void,
  ) {
    // 이전 하일라이팅 제거
    if (currentSectionId.value) {
      const oldElement = document.getElementById(currentSectionId.value)
      if (oldElement) {
        oldElement.classList.remove('current-section')
      }
    }
    currentSectionId.value = null
    isManualHighlight.value = false // 파일 변경 시 수동 하일라이팅 모드 해제

    // 항상 최신 내용을 가져오기 위해 백엔드에서 다시 로드
    loadingFile.value = file.name

    try {
      // 항상 최신 내용을 백엔드에서 가져오기 (외부에서 변경된 내용 반영)
      try {
        console.log(`[Store] selectFile: 파일 선택 시작 - ${file.name} (relativePath: ${file.relativePath || file.path || '없음'})`)

        // loadContent 함수가 있는지 확인
        if (!file.loadContent || typeof file.loadContent !== 'function') {
          console.error(`[Store] selectFile: loadContent 함수가 없습니다 - ${file.name}`, file)
          throw new Error('파일 로드 함수가 없습니다.')
        }

        const content = await file.loadContent()

        if (!content || content.trim() === '') {
          // 빈 내용이면 경고 메시지 표시
          fileContents.value[file.name] = '# 경고\n\n파일 내용이 비어있거나 불러올 수 없습니다.'
        } else {
          fileContents.value[file.name] = content
        }
      } catch (error) {
        console.error('[Store] 파일 내용 로드 실패:', error)
        // 로드 실패 시 캐시된 내용이 있으면 사용, 없으면 오류 메시지
        if (!fileContents.value[file.name]) {
          fileContents.value[file.name] = `# 오류\n\n파일을 불러올 수 없습니다.\n\n오류: ${(error as Error).message || '알 수 없는 오류'}`
        }
      }

      // 파일 사용 빈도 증가
      if (fileUsageCounts && incrementFileUsage) {
        incrementFileUsage(file.name, fileUsageCounts)
      }

      // 파일 로드 완료 후 selectedFile 설정 (내용이 준비된 후에 선택)
      selectedFile.value = file

      // 체크박스 상태를 다시 로드하여 최신 상태 보장
      // 파일을 다시 선택하거나 새로고침할 때 체크박스 상태가 제대로 반영되도록 함
      loadCheckboxStates(checkboxStates as Ref<Record<string, Record<string, boolean>>>)

      // 목차 생성
      nextTick(() => {
        generateTOC()
      })

      // 인접 파일 프리로딩 (비동기, 백그라운드)
      nextTick(() => {
        preloadAdjacentFiles(file)
      })
    } finally {
      // 로딩 상태 해제
      if (loadingFile.value === file.name) {
        loadingFile.value = null
      }
    }
  }

  async function preloadAdjacentFiles(currentFile: MarkdownFileMeta) {
    const currentIndex = markdownFiles.value.findIndex((f) => f.name === currentFile.name)
    if (currentIndex === -1) return

    const indicesToPreload = [currentIndex - 2, currentIndex - 1, currentIndex + 1, currentIndex + 2].filter((idx) => idx >= 0 && idx < markdownFiles.value.length)

    // 병렬로 프리로드 (에러는 무시)
    const preloadPromises = indicesToPreload.map((idx) => {
      const file = markdownFiles.value[idx]
      if (!fileContents.value[file.name]) {
        return file
          .loadContent()
          .then((content) => {
            fileContents.value[file.name] = content
          })
          .catch(() => {
            // 프리로드 실패는 무시
          })
      }
      return Promise.resolve()
    })

    // 백그라운드에서 실행 (await 하지 않음)
    Promise.all(preloadPromises).catch(() => {
      // 프리로드 실패는 무시
    })
  }

  // 목차(TOC) 생성
  function generateTOC() {
    if (!selectedFile.value) {
      tocItems.value = []
      return
    }

    const content = fileContents.value[selectedFile.value.name] || ''

    if (!content) {
      tocItems.value = []
      return
    }

    const headings: Array<{ id: string; text: string; level: number; lineIndex: number; parent?: unknown; children?: unknown[] }> = []
    const lines = content.split('\n')
    let headingIndex = 0
    let inCodeBlock = false

    lines.forEach((line, lineIndex) => {
      // 코드 블록 시작/종료 감지
      const trimmedLine = line.trim()
      if (trimmedLine.startsWith('```')) {
        inCodeBlock = !inCodeBlock
        return
      }

      // 코드 블록 내부는 제외
      if (inCodeBlock) return

      // 제목 패턴 매칭 (# 뒤에 공백 필수)
      const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/)

      if (headingMatch) {
        const level = headingMatch[1].length
        const text = headingMatch[2].trim()

        if (text) {
          const id = `heading-${headingIndex++}`
          headings.push({
            id,
            level,
            text: escapeHtml(text),
            lineIndex,
          })
        }
      }
    })

    const tree: TOCNode[] = []
    const stack: TOCNode[] = []

    headings.forEach((heading) => {
      // 스택에서 현재 레벨보다 높은 레벨의 노드 제거
      while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
        stack.pop()
      }

      const node = {
        ...heading,
        children: [],
      }

      if (stack.length === 0) {
        // 루트 레벨
        tree.push(node)
      } else {
        const parent = stack[stack.length - 1]
        if (parent) {
          parent.children = parent.children ?? []
          parent.children.push(node)
        }
      }

      stack.push(node)
    })

    tocItems.value = tree

    const savedExpandedState = selectedFile.value ? loadTOCExpandedState(selectedFile.value.name) : {}

    const expanded: Record<string, boolean> = {}
    function setExpandedState(items: TOCNode[]) {
      items.forEach((item: TOCNode) => {
        // 저장된 상태가 있으면 사용, 없으면 기본값(펼침)
        expanded[item.id] = savedExpandedState?.[item.id] ?? true
        // 자식 항목도 재귀적으로 설정
        if (item.children && item.children.length > 0) {
          setExpandedState(item.children)
        }
      })
    }
    setExpandedState(tree)
    tocExpanded.value = expanded

    // 전체 토글 상태 초기화 (초기값: 모든 하위 항목이 펼쳐져 있는지 확인)
    function checkAllExpanded(items: TOCNode[], isRootLevel = false): boolean {
      return items.every((item: TOCNode) => {
        if (isRootLevel) {
          if (item.children && item.children.length > 0) {
            return checkAllExpanded(item.children, false)
          }
          return true
        }
        const isExpanded = expanded[item.id] ?? true
        if (item.children && item.children.length > 0) {
          return isExpanded && checkAllExpanded(item.children, false)
        }
        return isExpanded
      })
    }
    allTOCExpandedState.value = tree.length > 0 && tree.every((item) => checkAllExpanded([item], true))
  }

  // TOC 관련 로직을 composable로 분리
  const { scrollToHeading, toggleTOCItem, toggleAllTOC, setAutoCollapse, setAutoCloseOnContentClick } = useTOC({
    tocItems,
    tocExpanded,
    tocAutoCollapse,
    tocAutoCloseOnContentClick,
    currentSectionId,
    allTOCExpandedState,
    isManualHighlight,
    selectedFile,
  })

  // TOC 관련 함수들을 외부에서 사용할 수 있도록 제공
  const useTOCFunctions = {
    setAutoCollapse,
    setAutoCloseOnContentClick,
  }

  // 전체 토글 상태 (computed - 실제 상태를 확인하여 초기값 설정용)
  const isAllTOCExpanded = computed(() => {
    return allTOCExpandedState.value
  })

  // 현재 보이는 섹션 감지 (스크롤 이벤트)
  function updateCurrentSection() {
    // 자동 하일라이팅 옵션이 꺼져있으면 업데이트하지 않음
    if (!autoHighlightOnScroll.value) return

    // 수동 하일라이팅 모드일 때는 자동 업데이트하지 않음
    if (isManualHighlight.value) return

    if (!selectedFile.value) return

    const headings = document.querySelectorAll('.markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4, .markdown-content h5, .markdown-content h6')
    // 실제 스크롤 컨테이너는 .q-page (MainLayout에서 overflow-y: auto로 설정됨)
    const scrollContainer = document.querySelector('.q-page.development-page') || document.querySelector('.q-page')
    if (!scrollContainer || headings.length === 0) return

    const scrollTop = scrollContainer.scrollTop
    const containerRect = scrollContainer.getBoundingClientRect()

    // 헤더 높이 계산 (page-header + .q-pa-lg 패딩 + file-content-header)
    let headerHeight = 0
    const pageHeader = document.querySelector('.page-header')
    const qPaLg = document.querySelector('.q-pa-lg')
    const fileHeader = document.querySelector('.file-content-header')

    if (pageHeader) {
      headerHeight += pageHeader.getBoundingClientRect().height
    }
    if (qPaLg) {
      const qPaLgStyles = window.getComputedStyle(qPaLg)
      headerHeight += parseFloat(qPaLgStyles.paddingTop) || 0
    }
    if (fileHeader) {
      headerHeight += fileHeader.getBoundingClientRect().height
    }

    const viewportTop = scrollTop + headerHeight + 20

    let closestId = null
    let closestDistance = Infinity

    headings.forEach((heading) => {
      const rect = heading.getBoundingClientRect()
      // 요소의 절대 위치를 계산 (스크롤 컨테이너 기준)
      const relativeTop = rect.top - containerRect.top
      const headingAbsoluteTop = scrollTop + relativeTop
      const distance = Math.abs(headingAbsoluteTop - viewportTop)

      if (headingAbsoluteTop <= viewportTop + 50 && distance < closestDistance) {
        closestDistance = distance
        closestId = heading.id
      }
    })

    if (closestId) {
      currentSectionId.value = closestId
    }
  }

  function handleContentClick(event: MouseEvent) {
    const target = event.target
    if (!target || !(target instanceof HTMLElement)) return
    if (target.classList?.contains('checkbox-item')) {
      event.stopPropagation()
      event.preventDefault()
      return
    }

    const checkboxItem = target.closest('.checkbox-item')
    if (checkboxItem) {
      // 클릭한 요소가 체크박스나 라벨이 아닌 경우 무시
      const isCheckbox = target.classList.contains('dev-checkbox-input') && target.tagName === 'INPUT'
      const isLabel = target.classList.contains('dev-checkbox-label') && target.tagName === 'LABEL'

      if (!isCheckbox && !isLabel) {
        event.stopPropagation()
        event.preventDefault()
        return
      }
    }

    const isCheckbox = target.classList.contains('dev-checkbox-input') && target.tagName === 'INPUT'
    const isLabel = target.classList.contains('dev-checkbox-label') && target.tagName === 'LABEL'

    if (isCheckbox || isLabel) {
      // 체크박스 직접 클릭 또는 라벨 클릭으로 인한 체크박스 토글
      let checkbox: HTMLInputElement | null = null
      if (isCheckbox) {
        checkbox = target as HTMLInputElement
      } else if (isLabel) {
        // 라벨의 for 속성으로 연결된 체크박스 찾기
        const labelFor = target.getAttribute('for')
        if (labelFor) {
          checkbox = document.getElementById(labelFor) as HTMLInputElement | null
        }
        // for 속성이 없으면 형제 요소로 찾기
        if (!checkbox) {
          checkbox = target.previousElementSibling as HTMLInputElement | null
        }
      }

      const container = checkbox?.closest('.checkbox-item') as HTMLElement | null

      if (container && checkbox && checkbox.classList.contains('dev-checkbox-input')) {
        const fileKey = container.dataset.fileKey
        const lineKey = container.dataset.lineKey
        if (fileKey === undefined || lineKey === undefined) return

        // 라벨 클릭 시 브라우저가 이미 체크박스를 토글했으므로 현재 상태를 읽음
        const isChecked = checkbox.checked

        // Vue 반응성을 보장하기 위해 객체를 새로 생성하여 교체
        const currentFileStates = checkboxStates.value[fileKey] || {}
        const updatedFileStates = {
          ...currentFileStates,
          [lineKey]: isChecked,
        }

        // 전체 checkboxStates 객체를 새로 생성하여 반응성 보장
        checkboxStates.value = {
          ...checkboxStates.value,
          [fileKey]: updatedFileStates,
        }

        console.log('[Store] 체크박스 상태 업데이트:', {
          fileKey,
          lineKey,
          isChecked,
          checkboxStatesForFile: Object.keys(updatedFileStates).length,
          totalFiles: Object.keys(checkboxStates.value).length,
        })

        // checkboxStates는 ref이므로 그대로 전달
        // 현재는 localStorage에만 저장 (원본 마크다운 파일은 수정하지 않음)
        // TODO: 나중에 에디터 기능 완성 시 원본 파일에도 체크박스 상태를 반영하는 기능 추가 예정
        // - 편집 모드에서 문서 저장 시 체크박스 상태도 함께 저장
        // - - [ ] → - [x] 변환 로직 필요
        saveCheckboxStates(checkboxStates)

        // parsedContent computed가 checkboxStates 변경을 감지하여 자동으로 재계산됨
        // fileContents는 변경하지 않으므로 원본 마크다운이 보존됨
        // nextTick을 사용하여 DOM 업데이트 보장
        nextTick(() => {
          // 강제로 재렌더링을 트리거하기 위해 selectedFile을 임시로 null로 설정 후 복원
          // 이렇게 하면 parsedContent가 확실히 재계산됨
          const currentFile = selectedFile.value
          if (currentFile) {
            selectedFile.value = null
            nextTick(() => {
              selectedFile.value = currentFile
            })
          }
        })
      }
      // 체크박스나 라벨 클릭 시 이벤트 전파 중지
      event.stopPropagation()
      return
    }

    // 본문 클릭 시 자동 닫기 (TOCPanel 제거로 인해 더 이상 필요 없음)
    // 사이드바의 NexetTOC는 본문 클릭 시 자동 닫기 기능이 없음
  }

  // 파싱된 내용 (computed)
  // checkboxStates의 모든 키를 의존성으로 추가하여 반응성 보장
  const parsedContent = computed(() => {
    if (!selectedFile.value) {
      return ''
    }
    // 파일명 변경 시 일시적으로 키가 맞지 않을 수 있으므로,
    // 새 파일명과 이전 파일명 모두 확인
    const fileName = selectedFile.value.name
    let content = fileContents.value[fileName]

    // 현재 파일명으로 찾을 수 없으면 빈 문자열 반환하지 않고,
    // 이전 파일명을 시도하지 않음 (파일명 변경 중에는 빈 문자열이 나올 수 있음)
    if (!content) {
      console.warn(`[Store] parsedContent: 파일 내용을 찾을 수 없습니다 - ${fileName}`, {
        selectedFile: selectedFile.value,
        availableKeys: Object.keys(fileContents.value),
        fileContentsSize: Object.keys(fileContents.value).length,
      })
      return ''
    }

    const fileKey = fileName
    // checkboxStates.value를 직접 참조하여 반응성 보장
    // 또한 checkboxStates.value[fileKey]도 참조하여 중첩된 객체 변경도 감지
    const fileCheckboxStates = checkboxStates.value[fileKey] || {}

    // 반응성을 위해 checkboxStates의 모든 키와 값을 참조
    // 이렇게 하면 checkboxStates가 변경될 때마다 computed가 재계산됨
    // JSON.stringify를 사용하여 깊은 반응성 보장 (의도적으로 사용하지 않지만 반응성 트리거)
    void JSON.stringify(checkboxStates.value)

    return parseMarkdown(content, fileKey, fileCheckboxStates)
  })

  // 표시할 내용 (완료 항목 숨기기 필터링 + 검색 키워드 하일라이팅)
  const displayContent = computed(() => {
    // 로딩 중이면 빈 문자열 반환 (이전 내용 유지를 위해 빈 문자열)
    if (loadingFile.value && selectedFile.value?.name === loadingFile.value) {
      return ''
    }

    let content = parsedContent.value

    // 완료된 체크박스 항목 숨기기
    if (hideCompleted.value) {
      const fileKey = selectedFile.value?.name || ''
      const fileCheckboxStates = checkboxStates.value[fileKey] || {}

      // 방법 1: localStorage에 저장된 체크된 항목 제거
      Object.keys(fileCheckboxStates).forEach((lineKey) => {
        if (fileCheckboxStates[lineKey] === true) {
          const escapedLineKey = lineKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          const regex = new RegExp(`<div class="checkbox-item[^"]*"[^>]*data-line-key="${escapedLineKey}"[^>]*>[\\s\\S]*?<\\/div>`, 'g')
          content = content.replace(regex, '')
        }
      })

      // 방법 2: HTML에서 checked 속성이 있는 체크박스 제거 (원본 마크다운에서 체크된 항목 포함)
      // checked 속성이 있는 체크박스를 모두 찾아서 제거
      const checkedCheckboxRegex = /<div[^>]*class="checkbox-item[^"]*"[^>]*>[\s\S]*?<input[^>]*\bchecked\b[^>]*>[\s\S]*?<\/div>/g
      const checkedMatches = content.match(checkedCheckboxRegex)
      if (checkedMatches) {
        // 중복 제거를 위해 Set 사용 (방법 1에서 이미 제거된 항목 제외)
        const uniqueMatches = [...new Set(checkedMatches)]
        uniqueMatches.forEach((match) => {
          content = content.replace(match, '')
        })
      }
    }

    return content
  })

  // 검색 키워드 하일라이팅을 적용한 displayContent (외부에서 전달받은 검색 관련 데이터 사용)
  function getDisplayContentWithHighlight(globalSearchKeywords: string[], globalSearchResults: Array<{ file: { name: string } }>, searchMode: string) {
    let content = displayContent.value

    // 검색 키워드 하일라이팅 (전체 문서 검색 키워드가 있고 현재 문서가 검색 결과에 포함된 경우)
    const sf = selectedFile.value
    if (globalSearchKeywords && globalSearchKeywords.length > 0 && sf) {
      const isInSearchResults = globalSearchResults && globalSearchResults.some((result: { file: { name: string } }) => result.file.name === sf.name)

      if (isInSearchResults) {
        // 체크박스 검색 모드일 때는 체크박스 라벨에만 하일라이팅
        if (searchMode === 'checkbox') {
          globalSearchKeywords.forEach((keyword) => {
            const escapedKeyword = escapeHtml(keyword).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            const regex = new RegExp(`(${escapedKeyword})`, 'gi')

            // 체크박스 라벨 내부 텍스트만 하일라이팅
            content = content.replace(/(<label[^>]*class="dev-checkbox-label"[^>]*>)([^<]+)(<\/label>)/g, (_match: string, before: string, text: string, after: string) => {
              const highlighted = text.replace(regex, (found: string) => {
                return `<mark class="global-search-highlight">${found}</mark>`
              })
              return before + highlighted + after
            })
          })
        } else {
          // 다른 검색 모드일 때는 일반 텍스트에 하일라이팅
          globalSearchKeywords.forEach((keyword: string) => {
            const escapedKeyword = escapeHtml(keyword).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            const regex = new RegExp(`(${escapedKeyword})`, 'gi')

            content = content.replace(/(>)([^<]+)(<)/g, (match: string, before: string, text: string, after: string) => {
              if (before === '>' && after === '<' && !text.includes('__CODE_BLOCK_') && !text.includes('__CHECKBOX_') && !text.includes('<mark') && !text.includes('class="code-inline"') && !text.includes('class="code-block"') && !text.includes('class="dev-checkbox-label"')) {
                const highlighted = text.replace(regex, (found: string) => {
                  return `<mark class="global-search-highlight">${found}</mark>`
                })
                return before + highlighted + after
              }
              return match
            })
          })
        }
      }
    }

    return content
  }

  // hideCompleted 변경 시 내용 다시 렌더링
  watch(hideCompleted, () => {
    const currentFile = selectedFile.value
    selectedFile.value = null
    nextTick(() => {
      selectedFile.value = currentFile
    })
  })

  // currentSectionId 변경 시 제목 하일라이팅
  watch(currentSectionId, (newId) => {
    nextTick(() => {
      // 모든 제목에서 하일라이팅 제거
      const allHeadings = document.querySelectorAll('.markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4, .markdown-content h5, .markdown-content h6')
      allHeadings.forEach((heading) => {
        heading.classList.remove('current-section')
      })

      // 현재 섹션에만 하일라이팅 추가
      if (newId) {
        const newElement = document.getElementById(newId)
        if (newElement) {
          newElement.classList.add('current-section')
        }
      }
    })
  })

  // autoHighlightOnScroll 변경 시 하일라이팅 제거
  watch(autoHighlightOnScroll, (newValue) => {
    if (!newValue) {
      nextTick(() => {
        const allHeadings = document.querySelectorAll('.markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4, .markdown-content h5, .markdown-content h6')
        allHeadings.forEach((heading) => {
          heading.classList.remove('current-section')
        })
        currentSectionId.value = null
      })
    }
  })

  return {
    // 상태
    markdownFiles,
    selectedFile,
    fileContents,
    checkboxStates,
    tocItems,
    tocExpanded,
    tocAutoCollapse,
    tocAutoCloseOnContentClick,
    autoHighlightOnScroll,
    currentSectionId,
    showTOC,
    isManualHighlight,
    hideCompleted,
    loadingFile,
    trashFiles,
    addToTrash,
    removeFromTrash,
    loadTrashFilesFromStorage,
    // 검색 상태
    globalSearchKeywords,
    globalSearchResults,
    // 함수
    loadMarkdownFiles,
    selectFile,
    generateTOC,
    scrollToHeading,
    toggleTOCItem,
    toggleAllTOC,
    setAutoCollapse,
    setAutoCloseOnContentClick,
    useTOCFunctions,
    updateCurrentSection,
    handleContentClick,
    preloadAdjacentFiles,
    // computed
    parsedContent,
    displayContent,
    isAllTOCExpanded,
    // 함수
    getDisplayContentWithHighlight,
  }
})
