import { ref, computed, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { parseMarkdown, escapeHtml } from 'src/modules/document-manager/services/markdownParser.js'
import { saveCheckboxStates } from 'src/modules/document-manager/services/documentStorage.js'

/**
 * 문서 관리 메인 로직 Composable
 * 파일 로드, 선택, 목차 생성, 체크박스 관리 등을 담당합니다.
 */
export function useDocumentManager() {
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
  const markdownContentRef = ref(null) // 마크다운 컨텐츠 ref
  const showTOC = ref(false) // 목차 오버레이 표시 여부
  const isManualHighlight = ref(false) // 수동 하일라이팅 모드
  const hideCompleted = ref(false) // 완료 항목 숨기기

  // 마크다운 파일 목록 로드
  async function loadMarkdownFiles() {
    try {
      // Vite의 import.meta.glob을 사용하여 docs 폴더의 .md 파일 자동 감지
      const modules = import.meta.glob('/docs/**/*.md', { as: 'raw', eager: false })

      const files = []
      for (const path in modules) {
        const fileName = path.split('/').pop()
        const displayName = fileName.replace('.md', '').replace(/_/g, ' ')
        files.push({
          name: fileName,
          displayName: displayName,
          path: path,
          loadContent: modules[path],
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
      console.error('마크다운 파일 로드 실패:', error)
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

    selectedFile.value = file

    // 파일 사용 빈도 증가
    if (fileUsageCounts && incrementFileUsage) {
      incrementFileUsage(file.name, fileUsageCounts)
    }

    // 파일 내용이 캐시에 없으면 로드
    if (!fileContents.value[file.name]) {
      try {
        const content = await file.loadContent()
        fileContents.value[file.name] = content
      } catch (error) {
        console.error('파일 내용 로드 실패:', error)
        fileContents.value[file.name] = '# 오류\n\n파일을 불러올 수 없습니다.'
      }
    }

    // 목차 생성
    nextTick(() => {
      generateTOC()
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

    // 기본 확장 상태 설정 (h1, h2는 기본적으로 펼침)
    const expanded = {}
    function setExpandedState(items) {
      items.forEach((item) => {
        // h1, h2는 기본적으로 펼침
        if (item.level <= 2) {
          expanded[item.id] = true
        } else {
          // h3 이하는 기본적으로 접힘
          expanded[item.id] = false
        }
        // 자식 항목도 재귀적으로 설정
        if (item.children && item.children.length > 0) {
          setExpandedState(item.children)
        }
      })
    }
    setExpandedState(tree)
    tocExpanded.value = expanded
  }

  // 부드러운 스크롤 애니메이션 함수
  function smoothScrollTo(element, targetScrollTop, duration = 800) {
    const contentContainer = document.querySelector('.file-content-container')
    if (!contentContainer) return Promise.resolve()

    const startScrollTop = contentContainer.scrollTop
    const distance = targetScrollTop - startScrollTop
    const startTime = performance.now()

    return new Promise((resolve) => {
      function animate(currentTime) {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        // easeInOutCubic 이징 함수
        const easeInOutCubic = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2

        const currentScrollTop = startScrollTop + distance * easeInOutCubic
        contentContainer.scrollTop = currentScrollTop

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          resolve()
        }
      }
      requestAnimationFrame(animate)
    })
  }

  // 목차 항목 클릭 (스크롤 이동)
  function scrollToHeading(headingId) {
    // 수동 하일라이팅 모드 활성화
    isManualHighlight.value = true

    nextTick(() => {
      const element = document.getElementById(headingId)
      const contentContainer = document.querySelector('.file-content-container')
      const fileHeader = document.querySelector('.file-content-header')

      if (!element || !contentContainer) return

      // 헤더 높이 계산
      let headerHeight = 0
      if (fileHeader) {
        const headerRect = fileHeader.getBoundingClientRect()
        headerHeight = headerRect.height
      } else {
        headerHeight = 100
      }

      // 요소의 절대 위치 계산
      const containerRect = contentContainer.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()
      const elementTop = elementRect.top - containerRect.top + contentContainer.scrollTop
      const targetScrollTop = Math.max(0, elementTop - headerHeight - 20)

      // 부드러운 스크롤 실행
      smoothScrollTo(element, targetScrollTop, 800).then(() => {
        currentSectionId.value = headingId
      })
    })
  }

  // 목차 확장/축소 토글
  function toggleTOCItem(itemId) {
    if (tocAutoCollapse.value) {
      // 자동 접힘 모드: 다른 항목 접기
      const newExpanded = {}
      newExpanded[itemId] = !tocExpanded.value[itemId]
      tocExpanded.value = newExpanded
    } else {
      // 독립적 모드: 현재 항목만 토글
      tocExpanded.value = {
        ...tocExpanded.value,
        [itemId]: !tocExpanded.value[itemId],
      }
    }
  }

  // 현재 보이는 섹션 감지 (스크롤 이벤트)
  function updateCurrentSection() {
    // 자동 하일라이팅 옵션이 꺼져있으면 업데이트하지 않음
    if (!autoHighlightOnScroll.value) return

    // 수동 하일라이팅 모드일 때는 자동 업데이트하지 않음
    if (isManualHighlight.value) return

    if (!selectedFile.value) return

    const headings = document.querySelectorAll('.markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4, .markdown-content h5, .markdown-content h6')
    const contentContainer = document.querySelector('.file-content-container')
    if (!contentContainer || headings.length === 0) return

    const scrollTop = contentContainer.scrollTop
    const containerTop = contentContainer.getBoundingClientRect().top
    const fileHeader = document.querySelector('.file-content-header')
    const headerHeight = fileHeader ? fileHeader.getBoundingClientRect().height : 0
    const viewportTop = scrollTop + headerHeight + 20

    let closestId = null
    let closestDistance = Infinity

    headings.forEach((heading) => {
      const rect = heading.getBoundingClientRect()
      const headingTop = rect.top - containerTop + scrollTop
      const distance = Math.abs(headingTop - viewportTop)

      if (headingTop <= viewportTop + 50 && distance < closestDistance) {
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
    // 체크박스 클릭 처리
    if (event.target.classList.contains('dev-checkbox-input')) {
      const checkbox = event.target
      const container = checkbox.closest('.checkbox-item')
      if (container) {
        const fileKey = container.dataset.fileKey
        const lineKey = container.dataset.lineKey
        const isChecked = checkbox.checked

        if (!checkboxStates.value[fileKey]) {
          checkboxStates.value[fileKey] = {}
        }
        checkboxStates.value[fileKey][lineKey] = isChecked
        saveCheckboxStates(checkboxStates.value)

        // 내용 다시 파싱하여 반영
        if (fileContents.value[fileKey] && selectedFile.value) {
          const currentFile = selectedFile.value
          selectedFile.value = null
          nextTick(() => {
            selectedFile.value = currentFile
          })
        }
      }
      return
    }

    // 본문 클릭 시 자동 닫기
    if (tocAutoCloseOnContentClick.value && showTOC.value) {
      const tocPanel = document.querySelector('.toc-overlay-panel')
      if (tocPanel && !tocPanel.contains(event.target)) {
        showTOC.value = false
      }
    }
  }

  // 파싱된 내용 (computed)
  const parsedContent = computed(() => {
    if (!selectedFile.value) return ''
    const content = fileContents.value[selectedFile.value.name] || ''
    const fileKey = selectedFile.value.name
    const fileCheckboxStates = checkboxStates.value[fileKey] || {}
    return parseMarkdown(content, fileKey, fileCheckboxStates)
  })

  // 표시할 내용 (완료 항목 숨기기 필터링 + 검색 키워드 하일라이팅)
  const displayContent = computed(() => {
    let content = parsedContent.value

    // 완료된 체크박스 항목 숨기기
    if (hideCompleted.value) {
      const fileKey = selectedFile.value?.name || ''
      const fileCheckboxStates = checkboxStates.value[fileKey] || {}

      Object.keys(fileCheckboxStates).forEach((lineKey) => {
        if (fileCheckboxStates[lineKey]) {
          const regex = new RegExp(`<div class="checkbox-item[^"]*"[^>]*data-line-key="${lineKey}"[^>]*>[\\s\\S]*?<\\/div>`, 'g')
          content = content.replace(regex, '')
        }
      })
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
    markdownContentRef,
    showTOC,
    isManualHighlight,
    hideCompleted,
    // 함수
    loadMarkdownFiles,
    selectFile,
    generateTOC,
    smoothScrollTo,
    scrollToHeading,
    toggleTOCItem,
    updateCurrentSection,
    handleContentClick,
    // computed
    parsedContent,
    displayContent,
    // 함수
    getDisplayContentWithHighlight,
  }
}
