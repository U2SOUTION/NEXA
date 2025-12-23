import { defineStore } from 'pinia'
import { ref, computed, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { parseMarkdown, escapeHtml } from 'src/modules/document-manager/services/markdownParser.js'
import { saveCheckboxStates, loadCheckboxStates, loadTOCExpandedState, loadSupportedExtensions } from 'src/modules/document-manager/services/documentStorage.js'
import { useTOC } from 'src/modules/document-manager/composables/useTOC.js'
import { removeExtension } from 'src/config/documentConfig.js'

/**
 * 문서 관리 Store
 * DevelopmentPage와 DocumentListSidebar 간 상태 공유
 */
export const useDocumentManagerStore = defineStore('documentManager', () => {
  const $q = useQuasar()

  // 상태
  const markdownFiles = ref([])
  const selectedFile = ref(null)
  const fileContents = ref({}) // 파일 내용 캐시
  const checkboxStates = ref({}) // 체크박스 상태
  const tocItems = ref([]) // 목차 항목
  const tocExpanded = ref({}) // 목차 확장 상태
  const tocAutoCollapse = ref(true) // 자동 접힘 모드
  const tocAutoCloseOnContentClick = ref(true) // 본문 클릭 시 자동 닫기
  const autoHighlightOnScroll = ref(true) // 스크롤 시 자동 하일라이팅
  const currentSectionId = ref(null) // 현재 보이는 섹션 ID
  const showTOC = ref(false) // 목차 오버레이 표시 여부
  const isManualHighlight = ref(false) // 수동 하일라이팅 모드
  const hideCompleted = ref(false) // 완료 항목 숨기기
  const loadingFile = ref(null) // 현재 로딩 중인 파일명
  const trashFiles = ref([]) // 휴지통 파일 목록
  const allTOCExpandedState = ref(false) // 전체 토글 상태 (개별 항목 토글과 독립적)

  // 휴지통 파일 추가
  function addToTrash(fileName) {
    if (!trashFiles.value.includes(fileName)) {
      const currentArray = Array.from(trashFiles.value)
      const newArray = [...currentArray, fileName]
      trashFiles.value = newArray
    }
  }

  // 휴지통에서 파일 제거
  function removeFromTrash(fileName) {
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
  // 검색 상태 (DocumentListSidebar와 DevelopmentPage 간 공유)
  const globalSearchKeywords = ref([]) // 검색 키워드 배열
  const globalSearchResults = ref([]) // 검색 결과 배열

  // 백엔드 확장자 설정 동기화
  async function syncExtensionsToBackend() {
    try {
      const extensions = loadSupportedExtensions()
      const response = await fetch('http://localhost:3000/api/docs/config/extensions', {
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
      console.warn('[Store] 백엔드 확장자 설정 동기화 중 오류 (무시됨):', error.message)
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
      let currentFileRelativePaths = []
      try {
        const metadataResponse = await fetch('http://localhost:3000/api/docs/metadata')
        if (metadataResponse.ok) {
          const metadataData = await metadataResponse.json()
          if (metadataData.success && metadataData.files) {
            // 백엔드 파일 목록을 Map으로 저장 (relativePath를 키로)
            metadataData.files.forEach((fileMeta) => {
              const key = fileMeta.relativePath || fileMeta.fileName
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
        const missingFiles = previousFileList.filter((prevPath) => !currentFileRelativePaths.includes(prevPath))
        const newFiles = currentFileRelativePaths.filter((currPath) => !previousFileList.includes(currPath))

        if (missingFiles.length > 0 && newFiles.length > 0) {
          console.log(`[Store] 파일 목록 변경 감지 - 사라진 파일: ${missingFiles.length}개, 새 파일: ${newFiles.length}개`)

          // 파일명 변경 감지: 이전 파일과 새 파일의 contentHash를 비교
          for (const newFilePath of newFiles) {
            const newFileMeta = metadataMap.get(newFilePath)
            if (!newFileMeta || !newFileMeta.contentHash) continue

            // 새 파일의 contentHash와 동일한 해시를 가진 이전 파일 찾기
            const matchingPrevFile = missingFiles.find((prevPath) => {
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
            const encodedFilePath = encodeURIComponent(filePath)
            const response = await fetch(`http://localhost:3000/api/docs/${encodedFilePath}/touch`, {
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
          const metadataResponse = await fetch('http://localhost:3000/api/docs/metadata')
          if (metadataResponse.ok) {
            const metadataData = await metadataResponse.json()
            if (metadataData.success && metadataData.files) {
              // 메타데이터 업데이트
              backendFilesMap.clear()
              metadataMap.clear()
              currentFileRelativePaths = []
              metadataData.files.forEach((fileMeta) => {
                const key = fileMeta.relativePath || fileMeta.fileName
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
        const currentFileHashes = {}
        metadataMap.forEach((meta, path) => {
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
          const pathParts = relativePath.split('/').filter((part) => part && part.trim() !== '')
          if (pathParts.length > 1) {
            // 파일명 제외한 모든 폴더 경로 추출
            const folderParts = pathParts.slice(0, -1) // 마지막 요소(파일명) 제외

            // 각 폴더명에서 숫자 접두사 제거 및 가독성 변환
            const cleanedFolders = folderParts.map((folder) => folder.replace(/^\d+-/, '').replace(/_/g, ' ').replace(/-/g, ' '))

            // "README (Platform - 기획)" 형식으로 표시
            displayName = `README (${cleanedFolders.join('/')})`
          }
        }

        const metadata = metadataMap.get(relativePath) || { modifiedDate: null, createdDate: null }

        // 백엔드 API를 통해 파일 내용을 로드하는 함수
        const loadContent = async () => {
          try {
            const response = await fetch(`http://localhost:3000/api/docs/${encodeURIComponent(relativePath)}`)
            if (response.ok) {
              return await response.text()
            } else {
              console.warn(`[Store] 파일 내용 로드 실패: ${relativePath} (${response.status})`)
            }
          } catch (error) {
            console.warn(`[Store] 파일 내용 로드 실패: ${relativePath}`, error)
          }
          return ''
        }

        // path는 relativePath와 동일하게 설정 (표시용, 기존 코드 호환성 유지)
        // docs/ 폴더가 삭제되었으므로 /docs/ 접두사 불필요

        files.push({
          name: fileName,
          displayName: displayName,
          path: relativePath, // relativePath와 동일 (기존 코드 호환성)
          relativePath: relativePath, // 실제 경로 (카테고리 분류용)
          loadContent: loadContent,
          modifiedDate: metadata.modifiedDate,
          createdDate: metadata.createdDate,
        })
      }

      // 파일명으로 정렬
      files.sort((a, b) => a.name.localeCompare(b.name))

      markdownFiles.value = files

      // 첫 번째 파일 자동 선택
      if (files.length > 0 && !selectedFile.value) {
        selectFile(files[0])
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

  // 파일 선택
  async function selectFile(file, fileUsageCounts, incrementFileUsage) {
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
        const content = await file.loadContent()
        fileContents.value[file.name] = content
      } catch (error) {
        console.error('[Store] 파일 내용 로드 실패:', error)
        // 로드 실패 시 캐시된 내용이 있으면 사용, 없으면 오류 메시지
        if (!fileContents.value[file.name]) {
          fileContents.value[file.name] = '# 오류\n\n파일을 불러올 수 없습니다.'
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
      loadCheckboxStates(checkboxStates)

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

  // 인접 파일 프리로딩 (현재 파일 앞뒤 2개씩)
  async function preloadAdjacentFiles(currentFile) {
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

    const headings = []
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

    // 트리 구조 생성
    const tree = []
    const stack = [] // 부모 노드 스택

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
        // 부모 노드의 children에 추가
        stack[stack.length - 1].children.push(node)
      }

      stack.push(node)
    })

    tocItems.value = tree

    // 저장된 확장 상태 로드 (파일별)
    const savedExpandedState = loadTOCExpandedState(selectedFile.value.name)

    // 기본 확장 상태 설정 (저장된 상태가 없으면 모두 펼침)
    const expanded = {}
    function setExpandedState(items) {
      items.forEach((item) => {
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
    function checkAllExpanded(items, isRootLevel = false) {
      return items.every((item) => {
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

  // 본문 클릭 핸들러 (체크박스 + 자동 닫기)
  function handleContentClick(event) {
    // .checkbox-item div 자체를 클릭한 경우 무시 (빈 공간 클릭 방지)
    if (event.target.classList.contains('checkbox-item')) {
      event.stopPropagation()
      event.preventDefault()
      return
    }

    // .checkbox-item 내부의 빈 공간 클릭 확인
    const checkboxItem = event.target.closest('.checkbox-item')
    if (checkboxItem) {
      // 클릭한 요소가 체크박스나 라벨이 아닌 경우 무시
      const isCheckbox = event.target.classList.contains('dev-checkbox-input') && event.target.tagName === 'INPUT'
      const isLabel = event.target.classList.contains('dev-checkbox-label') && event.target.tagName === 'LABEL'

      // 체크박스나 라벨이 아닌 경우 무시 (빈 공간 클릭)
      if (!isCheckbox && !isLabel) {
        event.stopPropagation()
        event.preventDefault()
        return
      }
    }

    // 체크박스 또는 라벨 클릭 처리
    const isCheckbox = event.target.classList.contains('dev-checkbox-input') && event.target.tagName === 'INPUT'
    const isLabel = event.target.classList.contains('dev-checkbox-label') && event.target.tagName === 'LABEL'

    if (isCheckbox || isLabel) {
      // 체크박스 직접 클릭 또는 라벨 클릭으로 인한 체크박스 토글
      let checkbox = null
      if (isCheckbox) {
        checkbox = event.target
      } else if (isLabel) {
        // 라벨의 for 속성으로 연결된 체크박스 찾기
        const labelFor = event.target.getAttribute('for')
        if (labelFor) {
          checkbox = document.getElementById(labelFor)
        }
        // for 속성이 없으면 형제 요소로 찾기
        if (!checkbox) {
          checkbox = event.target.previousElementSibling
        }
      }

      const container = checkbox?.closest('.checkbox-item')

      if (container && checkbox && checkbox.classList.contains('dev-checkbox-input')) {
        const fileKey = container.dataset.fileKey
        const lineKey = container.dataset.lineKey
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
    // 사이드바의 PanelTOC는 본문 클릭 시 자동 닫기 기능이 없음
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
  function getDisplayContentWithHighlight(globalSearchKeywords, globalSearchResults, searchMode) {
    let content = displayContent.value

    // 검색 키워드 하일라이팅 (전체 문서 검색 키워드가 있고 현재 문서가 검색 결과에 포함된 경우)
    if (globalSearchKeywords && globalSearchKeywords.length > 0 && selectedFile.value) {
      const isInSearchResults = globalSearchResults && globalSearchResults.some((result) => result.file.name === selectedFile.value.name)

      if (isInSearchResults) {
        // 체크박스 검색 모드일 때는 체크박스 라벨에만 하일라이팅
        if (searchMode === 'checkbox') {
          globalSearchKeywords.forEach((keyword) => {
            const escapedKeyword = escapeHtml(keyword).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            const regex = new RegExp(`(${escapedKeyword})`, 'gi')

            // 체크박스 라벨 내부 텍스트만 하일라이팅
            content = content.replace(/(<label[^>]*class="dev-checkbox-label"[^>]*>)([^<]+)(<\/label>)/g, (match, before, text, after) => {
              const highlighted = text.replace(regex, (found) => {
                return `<mark class="global-search-highlight">${found}</mark>`
              })
              return before + highlighted + after
            })
          })
        } else {
          // 다른 검색 모드일 때는 일반 텍스트에 하일라이팅
          globalSearchKeywords.forEach((keyword) => {
            const escapedKeyword = escapeHtml(keyword).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            const regex = new RegExp(`(${escapedKeyword})`, 'gi')

            // HTML 태그 내부가 아닌 텍스트만 검색 (코드 블록, 체크박스 제외)
            content = content.replace(/(>)([^<]+)(<)/g, (match, before, text, after) => {
              // 코드 블록, 체크박스, 이미 하일라이팅된 부분은 제외
              if (before === '>' && after === '<' && !text.includes('__CODE_BLOCK_') && !text.includes('__CHECKBOX_') && !text.includes('<mark') && !text.includes('class="code-inline"') && !text.includes('class="code-block"') && !text.includes('class="dev-checkbox-label"')) {
                const highlighted = text.replace(regex, (found) => {
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
