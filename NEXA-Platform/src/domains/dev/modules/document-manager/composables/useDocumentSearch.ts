import type { Ref } from 'vue'
import { ref, watch } from 'vue'

export interface MarkdownFileWithContent {
  name: string
  displayName?: string
  loadContent?: () => Promise<string>
}

/**
 * 문서 검색 Composable
 */
export function useDocumentSearch(
  markdownFiles: Ref<MarkdownFileWithContent[]>,
  fileContents: Ref<Record<string, string>>,
  searchMode: Ref<string>,
  saveSettingsCallback: (() => void) | undefined,
  trashFiles: Ref<string[]> | string[],
) {
  const globalSearchQuery = ref('')
  const globalSearchKeywords = ref<string[]>([])
  const globalSearchResults = ref<Array<{ file: MarkdownFileWithContent; matchCount: number }>>([])
  const globalSearchExcluded = ref<MarkdownFileWithContent[]>([])
  const showExcludedFiles = ref(false)

  function extractCheckboxTexts(content: string): string {
    const checkboxTexts: string[] = []
    const lines = content.split('\n')
    let inCodeBlock = false

    lines.forEach((line: string) => {
      // Windows 줄바꿈 문자(\r) 제거
      const cleanLine = line.replace(/\r$/, '')
      const trimmedLine = cleanLine.trim()

      // 코드 블록 시작/종료 감지
      if (trimmedLine.startsWith('```')) {
        inCodeBlock = !inCodeBlock
        return
      }

      // 코드 블록 내부는 제외
      if (inCodeBlock) return

      // 체크박스 패턴 매칭: - [ ] 또는 - [x] (공백 포함)
      const checkboxMatch = cleanLine.match(/^(\s*)- \[([ x])\] (.+)$/)
      if (checkboxMatch) {
        const text = checkboxMatch[3].trim()
        if (text) {
          checkboxTexts.push(text)
        }
      }
    })

    return checkboxTexts.join(' ')
  }

  // 전체 문서 검색 수행
  async function performGlobalSearch() {
    const query = globalSearchQuery.value?.trim() || ''

    // 검색어가 없으면 초기화
    if (!query) {
      globalSearchKeywords.value = []
      globalSearchResults.value = []
      globalSearchExcluded.value = []
      return
    }

    // 검색어를 공백으로 구분하여 배열화 (빈 문자열 제거)
    globalSearchKeywords.value = query
      .split(/\s+/)
      .map((keyword) => keyword.trim())
      .filter((keyword) => keyword.length > 0)

    if (globalSearchKeywords.value.length === 0) {
      globalSearchResults.value = []
      globalSearchExcluded.value = []
      return
    }

    let filesToSearch = markdownFiles.value
    if (searchMode.value === 'trash') {
      const trashList = Array.isArray(trashFiles) ? trashFiles : (trashFiles as Ref<string[]>).value
      filesToSearch = markdownFiles.value.filter((file: MarkdownFileWithContent) => trashList.includes(file.name))
    }
    // 그 외 모드(title, content, both, checkbox): 모든 파일 검색 (일반 + 휴지통)

    // 검색 수행
    const results = []
    const excluded = []

    for (const file of filesToSearch) {
      let content: string | undefined = fileContents.value[file.name]

      if (!content && file.loadContent) {
        try {
          content = await file.loadContent()
          fileContents.value[file.name] = content
        } catch (error) {
          console.error(`파일 로드 실패: ${file.name}`, error)
          excluded.push(file)
          continue
        }
      }

      // 검색 모드에 따라 검색 범위 결정
      let searchText = ''
      if (searchMode.value === 'title') {
        searchText = (file.displayName ?? file.name).toLowerCase()
      } else if (searchMode.value === 'trash') {
        searchText = (file.displayName ?? file.name).toLowerCase()
      } else if (searchMode.value === 'content') {
        searchText = (content ?? '').toLowerCase()
      } else if (searchMode.value === 'checkbox') {
        searchText = extractCheckboxTexts(content ?? '').toLowerCase()
      } else {
        const disp = file.displayName ?? file.name
        searchText = `${disp.toLowerCase()} ${(content ?? '').toLowerCase()}`
      }

      // 검색 키워드가 모두 포함되어 있는지 확인
      let matchCount = 0
      let allKeywordsMatch = true

      for (const keyword of globalSearchKeywords.value) {
        const lowerKeyword = keyword.toLowerCase()
        const escapedKeyword = lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const matches = (searchText.match(new RegExp(escapedKeyword, 'g')) || []).length

        if (matches > 0) {
          matchCount += matches
        } else {
          allKeywordsMatch = false
          break
        }
      }

      if (allKeywordsMatch && matchCount > 0) {
        results.push({
          file,
          matchCount,
        })
      } else {
        excluded.push(file)
      }
    }

    // 검색 결과를 일치 개수 순으로 정렬 (내림차순)
    results.sort((a, b) => b.matchCount - a.matchCount)

    globalSearchResults.value = results
    globalSearchExcluded.value = excluded
  }

  // 검색 모드 전환
  function toggleSearchMode() {
    const modes = ['title', 'content', 'both', 'checkbox', 'trash']
    const currentIndex = modes.indexOf(searchMode.value)
    const nextIndex = (currentIndex + 1) % modes.length
    searchMode.value = modes[nextIndex]

    if (saveSettingsCallback) {
      saveSettingsCallback()
    }

    // 검색어가 있으면 다시 검색
    if (globalSearchQuery.value && globalSearchQuery.value.trim()) {
      performGlobalSearch()
    }
  }

  // 검색 모드 아이콘 반환
  function getSearchModeIcon() {
    switch (searchMode.value) {
      case 'title':
        return 'title'
      case 'content':
        return 'description'
      case 'both':
        return 'merge_type'
      case 'checkbox':
        return 'check_box'
      case 'trash':
        return 'delete'
      default:
        return 'find_in_page'
    }
  }

  // 검색 모드 라벨 반환
  function getSearchModeLabel() {
    switch (searchMode.value) {
      case 'title':
        return '제목 검색'
      case 'content':
        return '내용 검색'
      case 'both':
        return '제목+내용 검색'
      case 'checkbox':
        return '체크박스 검색'
      case 'trash':
        return '휴지통 검색'
      default:
        return '제목+내용 검색'
    }
  }

  // 검색 플레이스홀더 반환
  function getSearchPlaceholder() {
    switch (searchMode.value) {
      case 'title':
        return '제목 검색 (공백으로 구분)'
      case 'content':
        return '내용 검색 (공백으로 구분)'
      case 'both':
        return '전체 문서 검색 (공백으로 구분)'
      case 'checkbox':
        return '체크박스 검색 (공백으로 구분)'
      case 'trash':
        return '휴지통 검색 (공백으로 구분)'
      default:
        return '전체 문서 검색 (공백으로 구분)'
    }
  }

  let searchTimer: ReturnType<typeof setTimeout> | null = null
  watch(globalSearchQuery, () => {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      performGlobalSearch()
    }, 300) // 300ms 디바운싱
  })

  return {
    // 상태
    globalSearchQuery,
    globalSearchKeywords,
    globalSearchResults,
    globalSearchExcluded,
    showExcludedFiles,
    // 함수
    performGlobalSearch,
    extractCheckboxTexts,
    toggleSearchMode,
    getSearchModeIcon,
    getSearchModeLabel,
    getSearchPlaceholder,
  }
}
