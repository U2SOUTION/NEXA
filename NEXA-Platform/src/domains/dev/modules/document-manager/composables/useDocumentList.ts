import { computed, ref } from 'vue'
import { sortByName, sortByModified, sortByCreated, sortByUsage, sortByFavorite, sortByPriority } from '@system/utils/file-sorter/index'
import { getFileCategory, getMainCategory } from '@system/utils/path-categorizer/index'

/**
 * 문서 목록 모드 및 정렬 Composable
 * 문서 목록의 모드 전환, 정렬 기능을 담당합니다.
 */
export function useDocumentList(markdownFiles, fileUsageCounts, favoriteStates, priorityStates, listMode, sortOrder, sortType, saveSettingsCallback) {
  // 카테고리 필터 상태
  const selectedCategory = ref(null) // null이면 전체, 문자열이면 선택된 카테고리

  // 사용 가능한 카테고리 목록 추출 (1레벨 디렉토리)
  const availableCategories = computed(() => {
    const categories = new Set()
    markdownFiles.value.forEach((file) => {
      const mainCategory = getMainCategory(file.relativePath || file.path)
      if (mainCategory) {
        categories.add(mainCategory)
      }
    })
    return Array.from(categories).sort((a, b) => a.localeCompare(b, 'ko'))
  })

  // 카테고리 선택 핸들러
  function selectCategory(category) {
    selectedCategory.value = category === '전체' || category === null ? null : category
    if (saveSettingsCallback) {
      saveSettingsCallback()
    }
  }

  // 카테고리 필터링된 파일 목록
  const filteredFiles = computed(() => {
    if (!selectedCategory.value) {
      return markdownFiles.value
    }
    return markdownFiles.value.filter((file) => {
      const mainCategory = getMainCategory(file.relativePath || file.path)
      return mainCategory === selectedCategory.value
    })
  })

  // 문서 목록 모드 전환
  function toggleListMode() {
    const modes = ['default', 'group', 'name', 'modified', 'created', 'usage', 'favorite', 'priority']
    const currentIndex = modes.indexOf(listMode.value)
    const nextIndex = (currentIndex + 1) % modes.length
    listMode.value = modes[nextIndex]

    if (saveSettingsCallback) {
      saveSettingsCallback()
    }
  }

  // 정렬 방향 토글
  function toggleSortOrder() {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'

    if (saveSettingsCallback) {
      saveSettingsCallback()
    }
  }

  // 정렬 기준 토글 (기본 모드와 그룹 모드에서 사용)
  function toggleSortType() {
    const types = ['name', 'modified', 'created', 'usage', 'favorite', 'priority', 'category']
    const currentIndex = types.indexOf(sortType.value)
    const nextIndex = (currentIndex + 1) % types.length
    sortType.value = types[nextIndex]

    if (saveSettingsCallback) {
      saveSettingsCallback()
    }
  }

  // 정렬 기준 아이콘 반환
  function getSortTypeIcon() {
    switch (sortType.value) {
      case 'name':
        return 'sort_by_alpha'
      case 'modified':
        return 'schedule'
      case 'created':
        return 'add_circle'
      case 'usage':
        return 'trending_up'
      case 'favorite':
        return 'star'
      case 'priority':
        return 'flag'
      case 'category':
        return 'folder'
      default:
        return 'sort_by_alpha'
    }
  }

  // 정렬 기준 라벨 반환
  function getSortTypeLabel() {
    switch (sortType.value) {
      case 'name':
        return '이름순'
      case 'modified':
        return '수정일순'
      case 'created':
        return '생성일순'
      case 'usage':
        return '사용빈도순'
      case 'favorite':
        return '즐겨찾기순'
      case 'priority':
        return '우선순위순'
      case 'category':
        return '카테고리순'
      default:
        return '이름순'
    }
  }

  // 문서 목록 모드 아이콘 반환
  function getListModeIcon() {
    switch (listMode.value) {
      case 'default':
        return 'list'
      case 'group':
        return 'folder'
      case 'name':
        return 'sort_by_alpha'
      case 'modified':
        return 'schedule'
      case 'created':
        return 'add_circle'
      case 'usage':
        return 'trending_up'
      case 'favorite':
        return 'star'
      case 'priority':
        return 'flag'
      default:
        return 'list'
    }
  }

  // 문서 목록 모드 라벨 반환
  function getListModeLabel() {
    switch (listMode.value) {
      case 'default':
        return '기본 순서 정렬'
      case 'group':
        return '폴더 그룹 정렬'
      case 'name':
        return '이름순 정렬'
      case 'modified':
        return '수정일순 정렬'
      case 'created':
        return '생성일순 정렬'
      case 'usage':
        return '사용빈도순 정렬'
      case 'favorite':
        return '즐겨찾기순 정렬'
      case 'priority':
        return '우선순위순 정렬'
      default:
        return '기본 순서 정렬'
    }
  }

  // 날짜 포맷팅 (수정일 표시용)
  function formatDate(date) {
    if (!date) return ''
    try {
      return new Date(date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    } catch {
      return ''
    }
  }

  // 그룹화된 문서 목록
  const groupedFiles = computed(() => {
    const groups = new Map()

    // 그룹화 레벨 결정
    let groupLevel = 1
    if (sortType.value === 'category') {
      groupLevel = 2 // 정렬 기준이 "category"일 때 2레벨로 그룹화
    } else if (selectedCategory.value && listMode.value === 'group') {
      groupLevel = 3 // 카테고리 필터 선택 + 그룹 모드일 때 3레벨로 그룹화
    } else if (listMode.value === 'group') {
      groupLevel = 1 // 기본 그룹 모드
    }

    // 필터링된 파일 목록 사용
    const filesToGroup = selectedCategory.value ? filteredFiles.value : markdownFiles.value

    filesToGroup.forEach((file) => {
      const category = getFileCategory(file, groupLevel)
      if (!groups.has(category)) {
        groups.set(category, [])
      }
      groups.get(category).push(file)
    })

    // 각 그룹 내에서 선택된 정렬 기준으로 정렬
    let sortedFilesInGroup = []
    switch (sortType.value) {
      case 'name':
        sortedFilesInGroup = (files) => sortByName(files, sortOrder.value)
        break
      case 'modified':
        sortedFilesInGroup = (files) => sortByModified(files, sortOrder.value)
        break
      case 'created':
        sortedFilesInGroup = (files) => sortByCreated(files, sortOrder.value)
        break
      case 'usage':
        sortedFilesInGroup = (files) => sortByUsage(files, sortOrder.value, fileUsageCounts.value)
        break
      case 'favorite':
        sortedFilesInGroup = (files) => sortByFavorite(files, sortOrder.value, favoriteStates.value)
        break
      case 'priority':
        sortedFilesInGroup = (files) => sortByPriority(files, sortOrder.value, priorityStates.value)
        break
      default:
        sortedFilesInGroup = (files) => sortByName(files, sortOrder.value)
    }

    // 카테고리별로 정렬하고, 각 카테고리 내에서도 선택된 정렬 기준으로 정렬
    const sortedGroups = Array.from(groups.entries())
      .map(([name, files]) => ({
        name,
        files: sortedFilesInGroup(files),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'ko'))

    return sortedGroups
  })

  // 카테고리 기준 정렬 함수
  function sortByCategory(files, order) {
    const sorted = [...files].sort((a, b) => {
      const categoryA = getMainCategory(a.relativePath || a.path) || '기타'
      const categoryB = getMainCategory(b.relativePath || b.path) || '기타'

      const categoryCompare = categoryA.localeCompare(categoryB, 'ko')
      if (categoryCompare !== 0) {
        return order === 'asc' ? categoryCompare : -categoryCompare
      }

      // 같은 카테고리 내에서는 파일명으로 정렬
      return a.name.localeCompare(b.name, 'ko')
    })
    return sorted
  }

  // 정렬된 문서 목록
  const sortedFiles = computed(() => {
    // 필터링된 파일 목록 사용
    const files = selectedCategory.value ? filteredFiles.value : markdownFiles.value

    if (!files || !Array.isArray(files) || files.length === 0) {
      return []
    }

    let sorted = []

    // 기본 모드: 선택된 정렬 기준 사용
    if (listMode.value === 'default') {
      switch (sortType.value) {
        case 'name':
          sorted = sortByName(files, sortOrder.value)
          break
        case 'modified':
          sorted = sortByModified(files, sortOrder.value)
          break
        case 'created':
          sorted = sortByCreated(files, sortOrder.value)
          break
        case 'usage':
          sorted = sortByUsage(files, sortOrder.value, fileUsageCounts.value)
          break
        case 'favorite':
          sorted = sortByFavorite(files, sortOrder.value, favoriteStates.value)
          break
        case 'priority':
          sorted = sortByPriority(files, sortOrder.value, priorityStates.value)
          break
        case 'category':
          sorted = sortByCategory(files, sortOrder.value)
          break
        default:
          sorted = files
      }
    } else {
      // 이름순, 수정일순, 생성일순, 사용빈도순, 즐겨찾기순, 우선순위순 모드: 각 모드에 맞는 정렬
      switch (listMode.value) {
        case 'name':
          sorted = sortByName(files, sortOrder.value)
          break
        case 'modified':
          sorted = sortByModified(files, sortOrder.value)
          break
        case 'created':
          sorted = sortByCreated(files, sortOrder.value)
          break
        case 'usage':
          sorted = sortByUsage(files, sortOrder.value, fileUsageCounts.value)
          break
        case 'favorite':
          sorted = sortByFavorite(files, sortOrder.value, favoriteStates.value)
          break
        case 'priority':
          sorted = sortByPriority(files, sortOrder.value, priorityStates.value)
          break
        case 'category':
          sorted = sortByCategory(files, sortOrder.value)
          break
        default:
          sorted = files
      }
    }

    // 사용 빈도 정보 추가 (수정일/생성일은 이미 파일 객체에 포함되어 있음)
    const result = sorted.map((file) => ({
      ...file,
      usageCount: fileUsageCounts.value[file.name] || 0,
      // modifiedDate와 createdDate는 loadMarkdownFiles()에서 이미 설정됨
    }))

    // 디버깅: 수정일순 정렬 시 상위 3개 확인
    if ((sortType.value === 'modified' || listMode.value === 'modified') && result.length > 0 && Math.random() < 0.1) {
      console.log('[SortedFiles] modified 정렬 결과:')
      console.log(`  정렬 방향: ${sortOrder.value}, 정렬 기준: ${sortType.value}, 모드: ${listMode.value}`)
      result.slice(0, 5).forEach((f, index) => {
        console.log(`  ${index + 1}. ${f.name} - ${f.modifiedDate || 'N/A'} (${f.modifiedDate ? new Date(f.modifiedDate).getTime() : 'N/A'})`)
      })

      // "직접수정" 파일이 있는지 확인
      const directModifiedFile = result.find((f) => f.name.includes('직접수정'))
      if (directModifiedFile) {
        const rank = result.findIndex((f) => f.name === directModifiedFile.name) + 1
        console.log(`[SortedFiles] "직접수정" 파일 발견: ${directModifiedFile.name}`)
        console.log(`  순위: ${rank}/${result.length}`)
        console.log(`  수정일: ${directModifiedFile.modifiedDate || 'N/A'}`)
      }
    }

    return result
  })

  return {
    // 함수
    toggleListMode,
    toggleSortOrder,
    toggleSortType,
    getSortTypeIcon,
    getSortTypeLabel,
    getListModeIcon,
    getListModeLabel,
    formatDate,
    selectCategory,
    // 상태
    selectedCategory,
    // computed
    groupedFiles,
    sortedFiles,
    availableCategories,
    filteredFiles,
  }
}
