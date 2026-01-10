import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getComponentCategory } from '@system/utils/path-categorizer/index.js'
import { filterByPath } from '@system/utils/path-tree-builder.js'
import { getTopLevelLabel } from '@system/config/devGuideConfig.js'

/**
 * 개발 가이드 Store
 *
 * 왼쪽 사이드바(DevGuideList) ↔ 컨텐츠(DevGuideContent) ↔ 오른쪽 사이드바(DevGuidePanel, DevGuideStatistics)
 * 간의 상태 공유를 담당합니다.
 *
 * 명명 규칙:
 * - 파일명: devGuideStore.js (기능 중심 명명)
 * - Store ID: devGuide (camelCase)
 * - Export 함수: useDevGuideStore
 */
export const useDevGuideStore = defineStore('devGuide', () => {
  // ============================================
  // 상태 (State)
  // ============================================

  // 검색 및 필터 상태
  const searchQuery = ref('')
  const filterCategory = ref(null)
  const filterTags = ref([])
  const filterListOnSearch = ref(true) // 리스트도 검색 필터 적용 여부

  // 뷰 모드 상태
  const viewMode = ref('flat') // 'flat' | 'hierarchy'
  const activeTab = ref('all') // 'all' | 'recent' | 'favorite'
  const accordionMode = ref(false) // 아코디언 모드 (최상위 폴더 하나만 열기)

  // 샘플 데이터
  const samples = ref([])
  const selectedSample = ref(null)
  const selectedFolderNode = ref(null)
  const recentSamples = ref([])
  const favoriteSamples = ref([])

  // 스크롤 위치 저장 (뒤로가기 시 복원용)
  const scrollPosition = ref(0)

  // 미리보기 캐시 상태 (컨텐츠 ↔ 통계 패널 간 공유)
  const previewStates = {
    // 로드된 컴포넌트 캐시 (Map<sampleId, Component>)
    loadedPreviews: ref(new Map()),
    // 로딩 중인 샘플 ID (Set<sampleId>)
    loadingPreviews: ref(new Set()),
    // 에러 상태 (Map<sampleId, Error>)
    previewErrors: ref(new Map()),
    // 파싱 정보 (Map<sampleId, PreviewInfo>)
    previewInfo: ref(new Map()),
    // 뷰포트에 보이는 샘플 ID (Set<sampleId>)
    visibleSamples: ref(new Set()),
    // 캐시 접근 시간 추적 (LRU 정리를 위해) (Map<sampleId, timestamp>)
    cacheAccessTime: ref(new Map()),
  }

  // 캐시 최적화 설정
  const CACHE_CONFIG = {
    // 최대 캐시 크기 (컴포넌트 개수)
    MAX_CACHE_SIZE: 50,
    // 오래된 캐시 정리 임계값 (밀리초, 5분)
    CACHE_CLEANUP_THRESHOLD: 5 * 60 * 1000,
    // 캐시 정리 간격 (밀리초, 1분)
    CLEANUP_INTERVAL: 60 * 1000,
  }

  // ============================================
  // Getters (계산된 속성)
  // ============================================

  // 카테고리 목록 (샘플 데이터에서 동적으로 추출)
  const categories = computed(() => {
    const categorySet = new Set()
    samples.value.forEach((sample) => {
      // 명시적으로 category가 있으면 사용
      if (sample.category) {
        categorySet.add(sample.category)
      }
      // category가 없으면 componentPath에서 추출
      else if (sample.componentPath) {
        const extractedCategory = getComponentCategory(sample.componentPath)
        if (extractedCategory) {
          categorySet.add(extractedCategory)
        }
      }
    })
    return Array.from(categorySet)
      .sort()
      .map((cat) => ({
        value: cat,
        label: cat,
      }))
  })

  // 한글 검색어를 영문 키워드로 변환 (간단한 매핑)
  function expandSearchQuery(query) {
    const lowerQuery = query.toLowerCase().trim()
    const keywords = [lowerQuery]

    // 한글-영문 매핑 (일반적인 용어)
    const keywordMap = {
      사이드바: ['sidebar', 'side-bar'],
      버튼: ['button', 'btn'],
      차트: ['chart'],
      패널: ['panel'],
      폼: ['form'],
      입력: ['input'],
      카드: ['card'],
      리스트: ['list'],
      테이블: ['table'],
      모달: ['modal'],
      아이콘: ['icon'],
      스타일: ['style', 'styles'],
      패턴: ['pattern', 'patterns'],
      컨벤션: ['convention', 'conventions'],
      베스트프랙티스: ['best-practice', 'best-practices', 'practices'],
      모범사례: ['practices', 'best-practice', 'best-practices'],
    }

    // 한글 키워드가 매핑에 있으면 영문 키워드 추가
    for (const [korean, english] of Object.entries(keywordMap)) {
      if (lowerQuery.includes(korean)) {
        keywords.push(...english)
      }
      // 역방향: 영문 키워드가 검색어에 포함되면 한글도 추가
      for (const eng of english) {
        if (lowerQuery.includes(eng)) {
          keywords.push(korean)
        }
      }
    }

    return keywords
  }

  // 샘플 필터링 헬퍼 함수 (검색, 카테고리, 태그 필터 적용)
  function filterSamples(sampleList) {
    let result = [...sampleList]

    // 검색 필터
    if (searchQuery.value && searchQuery.value.trim()) {
      const keywords = expandSearchQuery(searchQuery.value)
      result = result.filter((sample) => {
        const searchableText = [sample.name, sample.displayName, sample.category, sample.description, ...(sample.tags || [])].filter(Boolean).join(' ').toLowerCase()

        return keywords.some((keyword) => searchableText.includes(keyword))
      })
    }

    // 카테고리 필터
    if (filterCategory.value) {
      result = result.filter((sample) => {
        const sampleCategory = sample.category || getComponentCategory(sample.componentPath)
        return sampleCategory === filterCategory.value
      })
    }

    // 태그 필터
    if (filterTags.value.length > 0) {
      result = result.filter((sample) => {
        if (!sample.tags || sample.tags.length === 0) return false
        return filterTags.value.every((tag) => sample.tags.includes(tag))
      })
    }

    // 폴더 필터
    if (selectedFolderNode.value) {
      const folderNode = selectedFolderNode.value

      // 경로 기반 필터링 (모든 레벨 지원, 우선순위 높음)
      if (folderNode.type === 'path' && folderNode.path) {
        result = filterByPath(result, folderNode.path, 'componentPath', 'guides')
      }
      // 하위 호환성: 기존 topLevel 필터링
      else if (folderNode.type === 'topLevel') {
        result = result.filter((sample) => {
          const sampleTopLevel = getTopLevel(sample.componentPath)
          return sampleTopLevel === folderNode.name
        })
      }
      // 하위 호환성: 기존 category 필터링
      else if (folderNode.type === 'category') {
        result = result.filter((sample) => {
          const sampleTopLevel = getTopLevel(sample.componentPath)
          const sampleCategory = sample.category || getComponentCategory(sample.componentPath)
          return sampleTopLevel === folderNode.topLevel && sampleCategory === folderNode.name
        })
      }
    }

    return result
  }

  // 필터링된 샘플 목록
  const filteredSamples = computed(() => filterSamples(samples.value))

  // 필터링된 최근 샘플 목록
  const filteredRecentSamples = computed(() => filterSamples(recentSamples.value))

  // 필터링된 즐겨찾기 샘플 목록
  const filteredFavoriteSamples = computed(() => filterSamples(favoriteSamples.value))

  // 캐시 통계 (통계 패널용)
  const cacheStats = computed(() => ({
    loadedPreviews: previewStates.loadedPreviews.value.size,
    visibleSamples: previewStates.visibleSamples.value.size,
    loadingPreviews: previewStates.loadingPreviews.value.size,
    previewErrors: previewStates.previewErrors.value.size,
    maxCacheSize: CACHE_CONFIG.MAX_CACHE_SIZE,
    cacheUsageRate: Math.round((previewStates.loadedPreviews.value.size / CACHE_CONFIG.MAX_CACHE_SIZE) * 100),
    cleanupThresholdMinutes: Math.round(CACHE_CONFIG.CACHE_CLEANUP_THRESHOLD / 1000 / 60),
  }))

  // ============================================
  // Actions (액션)
  // ============================================

  /**
   * 검색어 변경
   * @param {string} query - 검색어
   */
  function setSearchQuery(query) {
    searchQuery.value = query
    if (!query) {
      selectedSample.value = null
    }
  }

  /**
   * 카테고리 필터 변경
   * @param {string|null} category - 카테고리
   */
  function setFilterCategory(category) {
    filterCategory.value = category
  }

  /**
   * 태그 필터 변경
   * @param {Array<string>} tags - 태그 배열
   */
  function setFilterTags(tags) {
    filterTags.value = tags
  }

  /**
   * 뷰 모드 변경
   * @param {string} mode - 'flat' | 'hierarchy'
   */
  function setViewMode(mode) {
    viewMode.value = mode
    // localStorage에 저장
    try {
      localStorage.setItem('dev-guide-view-mode', mode)
    } catch (error) {
      console.error('[DevGuideStore] 뷰 모드 저장 실패:', error)
    }
  }

  /**
   * 활성 탭 변경
   * @param {string} tab - 'all' | 'recent' | 'favorite'
   */
  function setActiveTab(tab) {
    activeTab.value = tab
  }

  /**
   * 아코디언 모드 토글
   * @param {boolean} enabled - 아코디언 모드 활성화 여부
   */
  function setAccordionMode(enabled) {
    accordionMode.value = enabled
    // localStorage에 저장
    try {
      localStorage.setItem('dev-guide-accordion-mode', enabled ? 'true' : 'false')
    } catch (error) {
      console.error('[DevGuideStore] 아코디언 모드 저장 실패:', error)
    }
  }

  /**
   * 리스트 필터링 토글
   * @param {boolean} enabled - 리스트 필터링 활성화 여부
   */
  function setFilterListOnSearch(enabled) {
    filterListOnSearch.value = enabled
    // localStorage에 저장
    try {
      localStorage.setItem('dev-guide-filter-list-on-search', String(enabled))
    } catch (error) {
      console.error('[DevGuideStore] 리스트 필터링 설정 저장 실패:', error)
    }
  }

  /**
   * 샘플 선택
   * @param {Object|null} sample - 선택된 샘플
   */
  function selectSample(sample) {
    selectedSample.value = sample
    selectedFolderNode.value = null // 샘플 선택 시 폴더 필터 해제
    if (sample) {
      // 최근 사용 목록에 추가
      addToRecentSamples(sample)
    }
  }

  /**
   * 폴더 선택
   * @param {Object|null} folderNode - 선택된 폴더 노드 { type: 'topLevel' | 'category', name: string, topLevel?: string }
   */
  function selectFolder(folderNode) {
    selectedFolderNode.value = folderNode
    selectedSample.value = null // 폴더 선택 시 샘플 선택 해제
  }

  /**
   * 스크롤 위치 저장
   * @param {number} position - 스크롤 위치
   */
  function setScrollPosition(position) {
    scrollPosition.value = position
  }

  /**
   * 스크롤 위치 가져오기
   * @returns {number} 스크롤 위치
   */
  function getScrollPosition() {
    return scrollPosition.value
  }

  /**
   * 최근 사용 샘플에 추가
   * @param {Object} sample - 샘플
   */
  function addToRecentSamples(sample) {
    // 중복 제거
    recentSamples.value = recentSamples.value.filter((s) => s.id !== sample.id)
    // 맨 앞에 추가
    recentSamples.value.unshift(sample)
    // 최대 20개 유지
    if (recentSamples.value.length > 20) {
      recentSamples.value = recentSamples.value.slice(0, 20)
    }
    // localStorage에 저장
    saveRecentSamples()
  }

  /**
   * 즐겨찾기 토글
   * @param {Object} sample - 샘플
   */
  function toggleFavorite(sample) {
    const index = favoriteSamples.value.findIndex((s) => s.id === sample.id)
    if (index >= 0) {
      favoriteSamples.value.splice(index, 1)
    } else {
      favoriteSamples.value.push(sample)
    }
    // localStorage에 저장
    saveFavoriteSamples()
  }

  /**
   * 샘플 목록 설정
   * @param {Array} newSamples - 샘플 배열
   */
  function setSamples(newSamples) {
    samples.value = newSamples
  }

  /**
   * 최근 샘플 저장 (localStorage)
   */
  function saveRecentSamples() {
    try {
      localStorage.setItem('dev-guide-recent-samples', JSON.stringify(recentSamples.value.map((s) => s.id)))
    } catch (error) {
      console.error('[DevGuideStore] 최근 샘플 저장 실패:', error)
    }
  }

  /**
   * 즐겨찾기 샘플 저장 (localStorage)
   */
  function saveFavoriteSamples() {
    try {
      localStorage.setItem('dev-guide-favorite-samples', JSON.stringify(favoriteSamples.value.map((s) => s.id)))
    } catch (error) {
      console.error('[DevGuideStore] 즐겨찾기 샘플 저장 실패:', error)
    }
  }

  /**
   * 최근 샘플 로드 (localStorage)
   * @param {Array} allSamples - 전체 샘플 배열
   */
  function loadRecentSamples(allSamples) {
    try {
      const saved = localStorage.getItem('dev-guide-recent-samples')
      if (saved) {
        const ids = JSON.parse(saved)
        recentSamples.value = ids.map((id) => allSamples.find((s) => s.id === id)).filter(Boolean)
      }
    } catch (error) {
      console.error('[DevGuideStore] 최근 샘플 로드 실패:', error)
    }
  }

  /**
   * 즐겨찾기 샘플 로드 (localStorage)
   * @param {Array} allSamples - 전체 샘플 배열
   */
  function loadFavoriteSamples(allSamples) {
    try {
      const saved = localStorage.getItem('dev-guide-favorite-samples')
      if (saved) {
        const ids = JSON.parse(saved)
        favoriteSamples.value = ids.map((id) => allSamples.find((s) => s.id === id)).filter(Boolean)
      }
    } catch (error) {
      console.error('[DevGuideStore] 즐겨찾기 샘플 로드 실패:', error)
    }
  }

  // ============================================
  // 캐시 관리 액션 (컨텐츠 ↔ 통계 패널)
  // ============================================

  /**
   * 로드된 컴포넌트 추가
   * @param {string} sampleId - 샘플 ID
   * @param {Component} component - 컴포넌트
   */
  function addLoadedPreview(sampleId, component) {
    previewStates.loadedPreviews.value.set(sampleId, component)
    previewStates.cacheAccessTime.value.set(sampleId, Date.now())
  }

  /**
   * 로드된 컴포넌트 제거
   * @param {string} sampleId - 샘플 ID
   */
  function removeLoadedPreview(sampleId) {
    previewStates.loadedPreviews.value.delete(sampleId)
    previewStates.cacheAccessTime.value.delete(sampleId)
    previewStates.previewInfo.value.delete(sampleId)
  }

  /**
   * 로딩 중인 샘플 추가
   * @param {string} sampleId - 샘플 ID
   */
  function addLoadingPreview(sampleId) {
    previewStates.loadingPreviews.value.add(sampleId)
  }

  /**
   * 로딩 중인 샘플 제거
   * @param {string} sampleId - 샘플 ID
   */
  function removeLoadingPreview(sampleId) {
    previewStates.loadingPreviews.value.delete(sampleId)
  }

  /**
   * 에러 상태 설정
   * @param {string} sampleId - 샘플 ID
   * @param {Error} error - 에러 객체
   */
  function setPreviewError(sampleId, error) {
    previewStates.previewErrors.value.set(sampleId, error)
    removeLoadingPreview(sampleId)
  }

  /**
   * 에러 상태 제거
   * @param {string} sampleId - 샘플 ID
   */
  function clearPreviewError(sampleId) {
    previewStates.previewErrors.value.delete(sampleId)
  }

  /**
   * 파싱 정보 설정
   * @param {string} sampleId - 샘플 ID
   * @param {Object} info - 파싱 정보
   */
  function setPreviewInfo(sampleId, info) {
    previewStates.previewInfo.value.set(sampleId, info)
  }

  /**
   * 파싱 정보 가져오기
   * @param {string} sampleId - 샘플 ID
   * @returns {Object|undefined} 파싱 정보
   */
  function getPreviewInfo(sampleId) {
    return previewStates.previewInfo.value.get(sampleId)
  }

  /**
   * 보이는 샘플 추가
   * @param {string} sampleId - 샘플 ID
   */
  function addVisibleSample(sampleId) {
    previewStates.visibleSamples.value.add(sampleId)
    if (previewStates.loadedPreviews.value.has(sampleId)) {
      previewStates.cacheAccessTime.value.set(sampleId, Date.now())
    }
  }

  /**
   * 보이는 샘플 제거
   * @param {string} sampleId - 샘플 ID
   */
  function removeVisibleSample(sampleId) {
    previewStates.visibleSamples.value.delete(sampleId)
  }

  /**
   * 샘플이 보이는지 확인
   * @param {string} sampleId - 샘플 ID
   * @returns {boolean} 보이는지 여부
   */
  function isVisibleSample(sampleId) {
    return previewStates.visibleSamples.value.has(sampleId)
  }

  /**
   * 캐시 접근 시간 업데이트
   * @param {string} sampleId - 샘플 ID
   */
  function updateCacheAccessTime(sampleId) {
    if (previewStates.loadedPreviews.value.has(sampleId)) {
      previewStates.cacheAccessTime.value.set(sampleId, Date.now())
    }
  }

  /**
   * 오래된 캐시 정리
   */
  function cleanupOldCache() {
    const now = Date.now()

    if (previewStates.loadedPreviews.value.size <= CACHE_CONFIG.MAX_CACHE_SIZE) {
      return
    }

    const candidatesToRemove = []
    for (const [sampleId] of previewStates.loadedPreviews.value.entries()) {
      // 현재 보이는 샘플은 정리하지 않음
      if (previewStates.visibleSamples.value.has(sampleId)) {
        continue
      }

      const accessTime = previewStates.cacheAccessTime.value.get(sampleId) || 0
      const age = now - accessTime

      if (age > CACHE_CONFIG.CACHE_CLEANUP_THRESHOLD) {
        candidatesToRemove.push({ sampleId, accessTime })
      }
    }

    // 오래된 순서로 정렬
    candidatesToRemove.sort((a, b) => a.accessTime - b.accessTime)

    let removedCount = 0
    const targetSize = CACHE_CONFIG.MAX_CACHE_SIZE
    for (const { sampleId } of candidatesToRemove) {
      if (previewStates.loadedPreviews.value.size - removedCount <= targetSize) {
        break
      }

      removeLoadedPreview(sampleId)
      removedCount++
    }

    if (import.meta.env.DEV && removedCount > 0) {
      console.log(`[DevGuideStore] 오래된 캐시 정리: ${removedCount}개 제거`)
    }
  }

  /**
   * 모든 캐시 초기화
   */
  function clearAllCache() {
    const removedCount = previewStates.loadedPreviews.value.size
    previewStates.loadedPreviews.value.clear()
    previewStates.cacheAccessTime.value.clear()
    previewStates.previewInfo.value.clear()
    previewStates.loadingPreviews.value.clear()
    previewStates.previewErrors.value.clear()

    if (import.meta.env.DEV) {
      console.log(`[DevGuideStore] 모든 캐시 초기화: ${removedCount}개 컴포넌트 제거`)
    }
  }

  /**
   * 로드된 컴포넌트 가져오기
   * @param {string} sampleId - 샘플 ID
   * @returns {Component|undefined} 컴포넌트
   */
  function getLoadedPreview(sampleId) {
    return previewStates.loadedPreviews.value.get(sampleId)
  }

  /**
   * 로드된 컴포넌트 확인
   * @param {string} sampleId - 샘플 ID
   * @returns {boolean} 로드 여부
   */
  function hasLoadedPreview(sampleId) {
    return previewStates.loadedPreviews.value.has(sampleId)
  }

  /**
   * 로딩 중인지 확인
   * @param {string} sampleId - 샘플 ID
   * @returns {boolean} 로딩 여부
   */
  function isLoadingPreview(sampleId) {
    return previewStates.loadingPreviews.value.has(sampleId)
  }

  /**
   * 에러가 있는지 확인
   * @param {string} sampleId - 샘플 ID
   * @returns {boolean} 에러 여부
   */
  function hasPreviewError(sampleId) {
    return previewStates.previewErrors.value.has(sampleId)
  }

  /**
   * 에러 가져오기
   * @param {string} sampleId - 샘플 ID
   * @returns {Error|undefined} 에러 객체
   */
  function getPreviewError(sampleId) {
    return previewStates.previewErrors.value.get(sampleId)
  }

  // ============================================
  // 유틸리티 함수 (기존 useDevGuide에서 사용하던 함수들)
  // ============================================

  /**
   * 경로에서 최상위 레벨 추출 (styles, patterns, library, cores, conventions, practices)
   * @param {string} componentPath - 컴포넌트 경로
   * @returns {string|null} 최상위 레벨명
   */
  function getTopLevel(componentPath) {
    if (!componentPath) return null
    const parts = componentPath.split('/')
    // domains/dev/guides/styles/... -> styles
    // domains/dev/guides/patterns/... -> patterns
    const guidesIndex = parts.indexOf('guides')
    if (guidesIndex >= 0 && guidesIndex < parts.length - 1) {
      return parts[guidesIndex + 1]
    }
    return null
  }

  /**
   * 최상위 레벨 라벨 가져오기
   * @param {string} topLevel - 최상위 레벨명
   * @returns {string} 라벨
   */
  function getLabelForTopLevel(topLevel) {
    return getTopLevelLabel(topLevel)
  }

  /**
   * 카테고리 아이콘 가져오기
   * @param {string} category - 카테고리명
   * @returns {string} 아이콘명
   */
  // eslint-disable-next-line no-unused-vars
  function getIconForCategory(category) {
    // 기본 아이콘 (필요시 확장)
    return 'label'
  }

  // ============================================
  // 통계 분석 함수
  // ============================================

  /**
   * 전체 통계 분석
   * @returns {Object} 전체 통계 데이터
   */
  function getFullStatistics() {
    const totalSamples = samples.value.length
    const totalCategories = categories.value.length
    const favoriteCount = favoriteSamples.value.length
    const recentCount = recentSamples.value.length

    // 카테고리별 샘플 수
    const categoryCounts = {}
    samples.value.forEach((sample) => {
      const category = sample.category || getComponentCategory(sample.componentPath) || '기타'
      categoryCounts[category] = (categoryCounts[category] || 0) + 1
    })

    // 태그별 샘플 수
    const tagCounts = {}
    samples.value.forEach((sample) => {
      if (sample.tags && Array.isArray(sample.tags)) {
        sample.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      }
    })

    // 가장 많은 샘플을 가진 카테고리
    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0] || null

    // 캐시 통계
    const cacheStatsData = cacheStats.value

    return {
      overview: {
        totalSamples,
        totalCategories,
        favoriteCount,
        recentCount,
      },
      categories: {
        total: totalCategories,
        distribution: categoryCounts,
        topCategory: topCategory ? { name: topCategory[0], count: topCategory[1] } : null,
      },
      tags: {
        total: Object.keys(tagCounts).length,
        distribution: tagCounts,
        topTags: Object.entries(tagCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([tag, count]) => ({ tag, count })),
      },
      cache: cacheStatsData,
    }
  }

  /**
   * 카테고리별 통계
   * @returns {Object} 카테고리별 통계 데이터
   */
  function getCategoryStatistics() {
    const categoryStats = {}

    samples.value.forEach((sample) => {
      const category = sample.category || getComponentCategory(sample.componentPath) || '기타'

      if (!categoryStats[category]) {
        categoryStats[category] = {
          name: category,
          totalSamples: 0,
          favoriteCount: 0,
          recentCount: 0,
          cachedCount: 0,
          errorCount: 0,
          samples: [],
        }
      }

      const stats = categoryStats[category]
      stats.totalSamples++
      stats.samples.push(sample)

      // 즐겨찾기 여부
      if (favoriteSamples.value.some((fav) => fav.id === sample.id)) {
        stats.favoriteCount++
      }

      // 최근 사용 여부
      if (recentSamples.value.some((recent) => recent.id === sample.id)) {
        stats.recentCount++
      }

      // 캐시 상태
      if (previewStates.loadedPreviews.value.has(sample.id)) {
        stats.cachedCount++
      }

      // 에러 상태
      if (previewStates.previewErrors.value.has(sample.id)) {
        stats.errorCount++
      }
    })

    // 배열로 변환하고 정렬 (샘플 수 기준 내림차순)
    const categoryList = Object.values(categoryStats).sort((a, b) => b.totalSamples - a.totalSamples)

    return {
      totalCategories: categoryList.length,
      categories: categoryList,
      summary: {
        totalSamples: samples.value.length,
        averageSamplesPerCategory: Math.round((samples.value.length / categoryList.length) * 10) / 10,
        maxSamplesInCategory: categoryList[0]?.totalSamples || 0,
        minSamplesInCategory: categoryList[categoryList.length - 1]?.totalSamples || 0,
      },
    }
  }

  /**
   * 초기화 (localStorage에서 설정 복원)
   */
  function init() {
    // localStorage에서 뷰 모드 복원
    try {
      const savedViewMode = localStorage.getItem('dev-guide-view-mode')
      if (savedViewMode) {
        viewMode.value = savedViewMode
      }
      // localStorage에서 리스트 필터링 설정 복원
      const savedFilterListOnSearch = localStorage.getItem('dev-guide-filter-list-on-search')
      if (savedFilterListOnSearch !== null) {
        filterListOnSearch.value = savedFilterListOnSearch === 'true'
      }
      // localStorage에서 아코디언 모드 설정 복원
      const savedAccordionMode = localStorage.getItem('dev-guide-accordion-mode')
      if (savedAccordionMode !== null) {
        accordionMode.value = savedAccordionMode === 'true'
      }
    } catch (error) {
      console.error('[DevGuideStore] 설정 복원 실패:', error)
    }
  }

  return {
    // 상태
    searchQuery,
    filterCategory,
    filterTags,
    viewMode,
    activeTab,
    accordionMode,
    filterListOnSearch,
    samples,
    selectedSample,
    selectedFolderNode,
    recentSamples,
    favoriteSamples,
    scrollPosition,
    previewStates,
    CACHE_CONFIG,

    // Getters
    categories,
    filteredSamples,
    filteredRecentSamples,
    filteredFavoriteSamples,
    cacheStats,

    // Actions
    setSearchQuery,
    setFilterCategory,
    setFilterTags,
    setViewMode,
    setActiveTab,
    setAccordionMode,
    setFilterListOnSearch,
    selectSample,
    selectFolder,
    setScrollPosition,
    getScrollPosition,
    addToRecentSamples,
    toggleFavorite,
    setSamples,
    saveRecentSamples,
    saveFavoriteSamples,
    loadRecentSamples,
    loadFavoriteSamples,

    // 캐시 관리 Actions
    addLoadedPreview,
    removeLoadedPreview,
    addLoadingPreview,
    removeLoadingPreview,
    setPreviewError,
    clearPreviewError,
    setPreviewInfo,
    getPreviewInfo,
    addVisibleSample,
    removeVisibleSample,
    isVisibleSample,
    updateCacheAccessTime,
    cleanupOldCache,
    clearAllCache,
    getLoadedPreview,
    hasLoadedPreview,
    isLoadingPreview,
    hasPreviewError,
    getPreviewError,

    // 유틸리티
    getTopLevel,
    getLabelForTopLevel,
    getIconForCategory,
    init,

    // 통계 분석
    getFullStatistics,
    getCategoryStatistics,
  }
})
