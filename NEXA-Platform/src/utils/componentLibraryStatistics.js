/**
 * 컴포넌트 라이브러리 통계 계산 유틸리티
 *
 * 컴포넌트 카테고리 데이터를 기반으로 다양한 통계를 계산합니다.
 */

/**
 * 컴포넌트 라이브러리 통계 계산
 * @param {Array} categories - 디렉토리 기반 카테고리 배열
 * @param {Array} manualCategories - 수동 분류 카테고리 배열
 * @returns {Object} 계산된 통계 데이터
 */
export function calculateComponentLibraryStatistics(categories, manualCategories) {
  // ============================================
  // 1. 전체 컴포넌트 수집 (중복 제거)
  // ============================================
  // 디렉토리 기반 카테고리의 모든 컴포넌트 수집
  const directoryComponents = categories.flatMap((cat) => cat.components || [])

  // 고유한 컴포넌트만 추출 (path 기준)
  const uniqueComponentsSet = new Set(directoryComponents.map((comp) => comp.path))
  const uniqueComponents = Array.from(uniqueComponentsSet).map((path) => directoryComponents.find((comp) => comp.path === path))

  // ============================================
  // 2. 전체 탭 통계
  // ============================================
  const totalComponents = uniqueComponents.length
  const scannedComponents = uniqueComponents.length // 현재는 스캔된 컴포넌트 = 전체 컴포넌트

  // 시스템 카테고리에 매핑된 컴포넌트 수집 (중복 제거)
  const systemMappedComponentsSet = new Set()
  function collectSystemComponents(category) {
    if (category.components) {
      category.components.forEach((comp) => systemMappedComponentsSet.add(comp.path))
    }
    if (category.subcategories) {
      category.subcategories.forEach((subCat) => collectSystemComponents(subCat))
    }
  }
  manualCategories.forEach((cat) => collectSystemComponents(cat))
  const categorizedComponents = systemMappedComponentsSet.size
  const uncategorizedComponents = totalComponents - categorizedComponents

  // 중복 매핑된 컴포넌트 계산 (여러 시스템 카테고리에 속한 컴포넌트)
  const componentCategoryCount = new Map()
  function countComponentMappings(category) {
    if (category.components) {
      category.components.forEach((comp) => {
        const count = componentCategoryCount.get(comp.path) || 0
        componentCategoryCount.set(comp.path, count + 1)
      })
    }
    if (category.subcategories) {
      category.subcategories.forEach((subCat) => countComponentMappings(subCat))
    }
  }
  manualCategories.forEach((cat) => countComponentMappings(cat))
  const duplicateMappedComponents = Array.from(componentCategoryCount.values()).filter((count) => count > 1).length

  // ============================================
  // 3. 시스템 탭 통계
  // ============================================
  const systemsCount = manualCategories.length

  // 시스템별 컴포넌트 수 계산 (중복 제거)
  function countSystemComponents(category) {
    const componentSet = new Set()
    if (category.components) {
      category.components.forEach((comp) => componentSet.add(comp.path))
    }
    if (category.subcategories) {
      category.subcategories.forEach((subCat) => {
        const subComponents = countSystemComponents(subCat)
        subComponents.forEach((path) => componentSet.add(path))
      })
    }
    return componentSet
  }

  const systemComponentCounts = manualCategories.map((cat) => ({
    name: cat.displayName,
    count: countSystemComponents(cat).size,
  }))

  const systemsComponentCount = systemComponentCounts.reduce((sum, item) => sum + item.count, 0)
  const averageComponentsPerSystem = systemsCount > 0 ? Math.round(systemsComponentCount / systemsCount) : 0
  const topSystemByComponents = systemComponentCounts.length > 0 ? systemComponentCounts.reduce((max, item) => (item.count > max.count ? item : max), systemComponentCounts[0]) : null
  const emptySystems = systemComponentCounts.filter((item) => item.count === 0).length

  // ============================================
  // 4. 디렉토리 탭 통계
  // ============================================
  const directoryCategoryCount = categories.length
  const directoryComponentCount = uniqueComponents.length

  // 깊이별 통계
  const depths = categories.map((cat) => {
    if (cat.components && cat.components.length > 0) {
      return cat.components[0].depth || 1
    }
    return 1
  })
  const maxDepth = depths.length > 0 ? Math.max(...depths) : 0
  const averageDepth = depths.length > 0 ? Math.round(depths.reduce((sum, d) => sum + d, 0) / depths.length) : 0

  // 깊이별 컴포넌트 수 분포
  const componentsByDepth = new Map()
  uniqueComponents.forEach((comp) => {
    const depth = comp.depth || 1
    const count = componentsByDepth.get(depth) || 0
    componentsByDepth.set(depth, count + 1)
  })

  // ============================================
  // 5. 통계 결과 반환
  // ============================================
  return {
    // 전체 탭 통계
    totalComponents,
    scannedComponents,
    categorizedComponents,
    uncategorizedComponents,
    duplicateMappedComponents,

    // 시스템 탭 통계
    systemsCount,
    systemsComponentCount,
    averageComponentsPerSystem,
    topSystemByComponents: topSystemByComponents
      ? {
          name: topSystemByComponents.name,
          count: topSystemByComponents.count,
        }
      : null,
    emptySystems,

    // 디렉토리 탭 통계
    directoryCategoryCount,
    directoryComponentCount,
    maxDepth,
    averageDepth,
    componentsByDepth: Object.fromEntries(componentsByDepth),
  }
}
