import { defineStore } from 'pinia'
import { ref, computed, type Ref, type ComputedRef } from 'vue'
import type { Component } from 'vue'
import { getComponentCategory } from '@system/utils/path-categorizer/index'
import { filterByPath } from '@system/utils/path-tree-builder'
import { getTopLevelLabel } from '@system/config/devGuideConfig'

export type DevGuideSample = {
  id: string
  name: string
  displayName?: string
  category?: string
  componentPath?: string
  description?: string
  tags?: string[]
  [key: string]: unknown
}

export type FolderNode = {
  type: 'topLevel' | 'category' | 'path'
  name: string
  topLevel?: string
  path?: string
  [key: string]: unknown
}

export type PreviewInfo = Record<string, unknown>

const CACHE_CONFIG = {
  MAX_CACHE_SIZE: 50,
  CACHE_CLEANUP_THRESHOLD: 5 * 60 * 1000,
  CLEANUP_INTERVAL: 60 * 1000,
}

export const useDevGuideStore = defineStore('devGuide', () => {
  const searchQuery: Ref<string> = ref('')
  const filterCategory: Ref<string | null> = ref(null)
  const filterTags: Ref<string[]> = ref([])
  const filterListOnSearch: Ref<boolean> = ref(true)

  const viewMode: Ref<string> = ref('flat')
  const activeTab: Ref<string> = ref('all')
  const accordionMode: Ref<boolean> = ref(false)

  const samples: Ref<DevGuideSample[]> = ref([])
  const selectedSample: Ref<DevGuideSample | null> = ref(null)
  const selectedFolderNode: Ref<FolderNode | null> = ref(null)
  const recentSamples: Ref<DevGuideSample[]> = ref([])
  const favoriteSamples: Ref<DevGuideSample[]> = ref([])

  const scrollPosition: Ref<number> = ref(0)

  const previewStates = {
    loadedPreviews: ref(new Map<string, Component>()),
    loadingPreviews: ref(new Set<string>()),
    previewErrors: ref(new Map<string, Error>()),
    previewInfo: ref(new Map<string, PreviewInfo>()),
    visibleSamples: ref(new Set<string>()),
    cacheAccessTime: ref(new Map<string, number>()),
  }

  const categories: ComputedRef<Array<{ value: string; label: string }>> = computed(() => {
    const categorySet = new Set<string>()
    samples.value.forEach((sample) => {
      if (sample.category) {
        categorySet.add(sample.category)
      } else if (sample.componentPath) {
        const extractedCategory = getComponentCategory(sample.componentPath ?? '')
        if (extractedCategory) categorySet.add(extractedCategory)
      }
    })
    return Array.from(categorySet)
      .sort()
      .map((cat) => ({ value: cat, label: cat }))
  })

  function expandSearchQuery(query: string): string[] {
    const lowerQuery = query.toLowerCase().trim()
    const keywords: string[] = [lowerQuery]
    const keywordMap: Record<string, string[]> = {
      사이드바: ['sidebar', 'side-bar'],
      버튼: ['button', 'btn'],
      차트: ['chart'],
      넥셋: ['nexet'],
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
    for (const [korean, english] of Object.entries(keywordMap)) {
      if (lowerQuery.includes(korean)) keywords.push(...english)
      for (const eng of english) {
        if (lowerQuery.includes(eng)) keywords.push(korean)
      }
    }
    return keywords
  }

  function getTopLevel(componentPath: string | undefined): string | null {
    if (!componentPath) return null
    const parts = componentPath.split('/')
    const guidesIndex = parts.indexOf('guides')
    if (guidesIndex >= 0 && guidesIndex < parts.length - 1) return parts[guidesIndex + 1]
    return null
  }

  function filterSamples(sampleList: DevGuideSample[]): DevGuideSample[] {
    let result = [...sampleList]

    if (searchQuery.value?.trim()) {
      const keywords = expandSearchQuery(searchQuery.value)
      result = result.filter((sample) => {
        const searchableText = [sample.name, sample.displayName, sample.category, sample.description, ...(sample.tags || [])].filter(Boolean).join(' ').toLowerCase()
        return keywords.some((keyword) => searchableText.includes(keyword))
      })
    }

    if (filterCategory.value) {
      result = result.filter((sample) => {
        const sampleCategory = sample.category || getComponentCategory(sample.componentPath ?? '')
        return sampleCategory === filterCategory.value
      })
    }

    if (filterTags.value.length > 0) {
      result = result.filter((sample) => {
        if (!sample.tags?.length) return false
        return filterTags.value.every((tag) => sample.tags!.includes(tag))
      })
    }

    if (selectedFolderNode.value) {
      const folderNode = selectedFolderNode.value
      if (folderNode.type === 'path' && folderNode.path) {
        result = filterByPath(result, folderNode.path, 'componentPath', 'guides') as DevGuideSample[]
      } else if (folderNode.type === 'topLevel') {
        result = result.filter((sample) => getTopLevel(sample.componentPath ?? '') === folderNode.name)
      } else if (folderNode.type === 'category') {
        result = result.filter((sample) => {
          const sampleTopLevel = getTopLevel(sample.componentPath ?? '')
          const sampleCategory = sample.category || getComponentCategory(sample.componentPath ?? '')
          return sampleTopLevel === folderNode.topLevel && sampleCategory === folderNode.name
        })
      }
    }

    return result
  }

  const filteredSamples: ComputedRef<DevGuideSample[]> = computed(() => filterSamples(samples.value))
  const filteredRecentSamples: ComputedRef<DevGuideSample[]> = computed(() => filterSamples(recentSamples.value))
  const filteredFavoriteSamples: ComputedRef<DevGuideSample[]> = computed(() => filterSamples(favoriteSamples.value))

  const cacheStats: ComputedRef<{
    loadedPreviews: number
    visibleSamples: number
    loadingPreviews: number
    previewErrors: number
    maxCacheSize: number
    cacheUsageRate: number
    cleanupThresholdMinutes: number
  }> = computed(() => ({
    loadedPreviews: previewStates.loadedPreviews.value.size,
    visibleSamples: previewStates.visibleSamples.value.size,
    loadingPreviews: previewStates.loadingPreviews.value.size,
    previewErrors: previewStates.previewErrors.value.size,
    maxCacheSize: CACHE_CONFIG.MAX_CACHE_SIZE,
    cacheUsageRate: Math.round((previewStates.loadedPreviews.value.size / CACHE_CONFIG.MAX_CACHE_SIZE) * 100),
    cleanupThresholdMinutes: Math.round(CACHE_CONFIG.CACHE_CLEANUP_THRESHOLD / 1000 / 60),
  }))

  function setSearchQuery(query: string): void {
    searchQuery.value = query
    if (!query) selectedSample.value = null
  }

  function setFilterCategory(category: string | null): void {
    filterCategory.value = category
  }

  function setFilterTags(tags: string[]): void {
    filterTags.value = tags
  }

  function setViewMode(mode: string): void {
    viewMode.value = mode
    try {
      localStorage.setItem('dev-guide-view-mode', mode)
    } catch (error) {
      console.error('[DevGuideStore] 뷰 모드 저장 실패:', error)
    }
  }

  function setActiveTab(tab: string): void {
    activeTab.value = tab
  }

  function setAccordionMode(enabled: boolean): void {
    accordionMode.value = enabled
    try {
      localStorage.setItem('dev-guide-accordion-mode', enabled ? 'true' : 'false')
    } catch (error) {
      console.error('[DevGuideStore] 아코디언 모드 저장 실패:', error)
    }
  }

  function setFilterListOnSearch(enabled: boolean): void {
    filterListOnSearch.value = enabled
    try {
      localStorage.setItem('dev-guide-filter-list-on-search', String(enabled))
    } catch (error) {
      console.error('[DevGuideStore] 리스트 필터링 설정 저장 실패:', error)
    }
  }

  function selectSample(sample: DevGuideSample | null): void {
    selectedSample.value = sample
    selectedFolderNode.value = null
    if (sample) addToRecentSamples(sample)
  }

  function selectFolder(folderNode: FolderNode | null): void {
    selectedFolderNode.value = folderNode
    selectedSample.value = null
  }

  function setScrollPosition(position: number): void {
    scrollPosition.value = position
  }

  function getScrollPosition(): number {
    return scrollPosition.value
  }

  function addToRecentSamples(sample: DevGuideSample): void {
    recentSamples.value = recentSamples.value.filter((s) => s.id !== sample.id)
    recentSamples.value.unshift(sample)
    if (recentSamples.value.length > 20) {
      recentSamples.value = recentSamples.value.slice(0, 20)
    }
    saveRecentSamples()
  }

  function toggleFavorite(sample: DevGuideSample): void {
    const index = favoriteSamples.value.findIndex((s) => s.id === sample.id)
    if (index >= 0) {
      favoriteSamples.value.splice(index, 1)
    } else {
      favoriteSamples.value.push(sample)
    }
    saveFavoriteSamples()
  }

  function setSamples(newSamples: DevGuideSample[]): void {
    samples.value = newSamples
  }

  function saveRecentSamples(): void {
    try {
      localStorage.setItem('dev-guide-recent-samples', JSON.stringify(recentSamples.value.map((s) => s.id)))
    } catch (error) {
      console.error('[DevGuideStore] 최근 샘플 저장 실패:', error)
    }
  }

  function saveFavoriteSamples(): void {
    try {
      localStorage.setItem('dev-guide-favorite-samples', JSON.stringify(favoriteSamples.value.map((s) => s.id)))
    } catch (error) {
      console.error('[DevGuideStore] 즐겨찾기 샘플 저장 실패:', error)
    }
  }

  function loadRecentSamples(allSamples: DevGuideSample[]): void {
    try {
      const saved = localStorage.getItem('dev-guide-recent-samples')
      if (saved) {
        const ids: string[] = JSON.parse(saved)
        recentSamples.value = ids.map((id) => allSamples.find((s) => s.id === id)).filter(Boolean) as DevGuideSample[]
      }
    } catch (error) {
      console.error('[DevGuideStore] 최근 샘플 로드 실패:', error)
    }
  }

  function loadFavoriteSamples(allSamples: DevGuideSample[]): void {
    try {
      const saved = localStorage.getItem('dev-guide-favorite-samples')
      if (saved) {
        const ids: string[] = JSON.parse(saved)
        favoriteSamples.value = ids.map((id) => allSamples.find((s) => s.id === id)).filter(Boolean) as DevGuideSample[]
      }
    } catch (error) {
      console.error('[DevGuideStore] 즐겨찾기 샘플 로드 실패:', error)
    }
  }

  function addLoadedPreview(sampleId: string, component: Component): void {
    previewStates.loadedPreviews.value.set(sampleId, component)
    previewStates.cacheAccessTime.value.set(sampleId, Date.now())
  }

  function removeLoadedPreview(sampleId: string): void {
    previewStates.loadedPreviews.value.delete(sampleId)
    previewStates.cacheAccessTime.value.delete(sampleId)
    previewStates.previewInfo.value.delete(sampleId)
  }

  function addLoadingPreview(sampleId: string): void {
    previewStates.loadingPreviews.value.add(sampleId)
  }

  function removeLoadingPreview(sampleId: string): void {
    previewStates.loadingPreviews.value.delete(sampleId)
  }

  function setPreviewError(sampleId: string, error: Error): void {
    previewStates.previewErrors.value.set(sampleId, error)
    removeLoadingPreview(sampleId)
  }

  function clearPreviewError(sampleId: string): void {
    previewStates.previewErrors.value.delete(sampleId)
  }

  function setPreviewInfo(sampleId: string, info: PreviewInfo): void {
    previewStates.previewInfo.value.set(sampleId, info)
  }

  function getPreviewInfo(sampleId: string): PreviewInfo | undefined {
    return previewStates.previewInfo.value.get(sampleId)
  }

  function addVisibleSample(sampleId: string): void {
    previewStates.visibleSamples.value.add(sampleId)
    if (previewStates.loadedPreviews.value.has(sampleId)) {
      previewStates.cacheAccessTime.value.set(sampleId, Date.now())
    }
  }

  function removeVisibleSample(sampleId: string): void {
    previewStates.visibleSamples.value.delete(sampleId)
  }

  function isVisibleSample(sampleId: string): boolean {
    return previewStates.visibleSamples.value.has(sampleId)
  }

  function updateCacheAccessTime(sampleId: string): void {
    if (previewStates.loadedPreviews.value.has(sampleId)) {
      previewStates.cacheAccessTime.value.set(sampleId, Date.now())
    }
  }

  function cleanupOldCache(): void {
    const now = Date.now()
    if (previewStates.loadedPreviews.value.size <= CACHE_CONFIG.MAX_CACHE_SIZE) return

    const candidatesToRemove: { sampleId: string; accessTime: number }[] = []
    for (const [sampleId] of previewStates.loadedPreviews.value.entries()) {
      if (previewStates.visibleSamples.value.has(sampleId)) continue
      const accessTime = previewStates.cacheAccessTime.value.get(sampleId) || 0
      if (now - accessTime > CACHE_CONFIG.CACHE_CLEANUP_THRESHOLD) {
        candidatesToRemove.push({ sampleId, accessTime })
      }
    }
    candidatesToRemove.sort((a, b) => a.accessTime - b.accessTime)
    const targetSize = CACHE_CONFIG.MAX_CACHE_SIZE
    let removedCount = 0
    for (const { sampleId } of candidatesToRemove) {
      if (previewStates.loadedPreviews.value.size - removedCount <= targetSize) break
      removeLoadedPreview(sampleId)
      removedCount++
    }
  }

  function clearAllCache(): void {
    previewStates.loadedPreviews.value.clear()
    previewStates.cacheAccessTime.value.clear()
    previewStates.previewInfo.value.clear()
    previewStates.loadingPreviews.value.clear()
    previewStates.previewErrors.value.clear()
  }

  function getLoadedPreview(sampleId: string): Component | undefined {
    return previewStates.loadedPreviews.value.get(sampleId)
  }

  function hasLoadedPreview(sampleId: string): boolean {
    return previewStates.loadedPreviews.value.has(sampleId)
  }

  function isLoadingPreview(sampleId: string): boolean {
    return previewStates.loadingPreviews.value.has(sampleId)
  }

  function hasPreviewError(sampleId: string): boolean {
    return previewStates.previewErrors.value.has(sampleId)
  }

  function getPreviewError(sampleId: string): Error | undefined {
    return previewStates.previewErrors.value.get(sampleId)
  }

  function getLabelForTopLevel(topLevel: string): string {
    return getTopLevelLabel(topLevel)
  }

  function getIconForCategory(_category: string): string {
    void _category
    return 'label'
  }

  function getFullStatistics(): Record<string, unknown> {
    const totalSamples = samples.value.length
    const totalCategories = categories.value.length
    const categoryCounts: Record<string, number> = {}
    samples.value.forEach((sample) => {
      const category = sample.category || getComponentCategory(sample.componentPath ?? '') || '기타'
      categoryCounts[category] = (categoryCounts[category] || 0) + 1
    })
    const tagCounts: Record<string, number> = {}
    samples.value.forEach((sample) => {
      if (sample.tags?.length) {
        sample.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      }
    })
    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0] || null
    return {
      overview: {
        totalSamples,
        totalCategories,
        favoriteCount: favoriteSamples.value.length,
        recentCount: recentSamples.value.length,
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
      cache: cacheStats.value,
    }
  }

  function getCategoryStatistics(): Record<string, unknown> {
    const categoryStats: Record<string, { name: string; totalSamples: number; favoriteCount: number; recentCount: number; cachedCount: number; errorCount: number; samples: DevGuideSample[] }> = {}
    samples.value.forEach((sample) => {
      const category = sample.category || getComponentCategory(sample.componentPath ?? '') || '기타'
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
      if (favoriteSamples.value.some((fav) => fav.id === sample.id)) stats.favoriteCount++
      if (recentSamples.value.some((recent) => recent.id === sample.id)) stats.recentCount++
      if (previewStates.loadedPreviews.value.has(sample.id)) stats.cachedCount++
      if (previewStates.previewErrors.value.has(sample.id)) stats.errorCount++
    })
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

  function init(): void {
    try {
      const savedViewMode = localStorage.getItem('dev-guide-view-mode')
      if (savedViewMode) viewMode.value = savedViewMode
      const savedFilterListOnSearch = localStorage.getItem('dev-guide-filter-list-on-search')
      if (savedFilterListOnSearch !== null) filterListOnSearch.value = savedFilterListOnSearch === 'true'
      const savedAccordionMode = localStorage.getItem('dev-guide-accordion-mode')
      if (savedAccordionMode !== null) accordionMode.value = savedAccordionMode === 'true'
    } catch (error) {
      console.error('[DevGuideStore] 설정 복원 실패:', error)
    }
  }

  return {
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
    categories,
    filteredSamples,
    filteredRecentSamples,
    filteredFavoriteSamples,
    cacheStats,
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
    getTopLevel,
    getLabelForTopLevel,
    getIconForCategory,
    init,
    getFullStatistics,
    getCategoryStatistics,
  }
})
