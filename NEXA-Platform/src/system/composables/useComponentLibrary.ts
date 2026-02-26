/**
 * 컴포넌트 라이브러리 관리 Composable
 * 
 * 컴포넌트 라이브러리의 상태 관리, 스캔, 통계 계산 등을 담당합니다.
 */

import { ref, watch } from 'vue'
import { scanAndCategorizeComponents } from '@system/utils/componentScanner'
import { buildCategoryStructure, mapComponentToCategory, getAllCategoriesFlat } from '@system/config/componentCategories'
import { calculateComponentLibraryStatistics } from '@system/utils/componentLibraryStatistics'

/**
 * 컴포넌트 라이브러리 관리 Composable
 * @returns {Object} 컴포넌트 라이브러리 관련 상태 및 함수
 */
export function useComponentLibrary() {
  // ============================================
  // 상태 관리
  // ============================================
  const categories = ref([]) // 디렉토리 기반 자동 분류
  const manualCategories = ref([]) // 하드코딩된 수동 분류
  const violations = ref([])
  const selectedCategory = ref(null)
  const selectedComponent = ref(null)
  const selectedViolation = ref(null)
  const searchQuery = ref('')
  const depth = ref(2) // 기본값: 2단계

  // ============================================
  // 유틸리티 함수
  // ============================================

  /**
   * 컴포넌트를 하드코딩된 카테고리에 매핑
   * @param {Array} allComponents - 모든 컴포넌트 배열
   * @returns {Array} 매핑된 카테고리 배열
   */
  function mapComponentsToManualCategories(allComponents) {
    // 카테고리 구조 동적 생성
    const manualCategories = buildCategoryStructure()

    // 모든 카테고리와 하위 카테고리를 평면 배열로 만들기
    const allManualCategories = getAllCategoriesFlat(manualCategories)

    // 각 컴포넌트를 적절한 카테고리에 매핑
    for (const component of allComponents) {
      const categoryId = mapComponentToCategory(component.path)
      if (categoryId) {
        const targetCategory = allManualCategories.find((cat) => cat.name === categoryId)
        if (targetCategory) {
          targetCategory.components.push(component)
        }
      }
    }

    return manualCategories
  }

  /**
   * 통계 계산 및 이벤트 전달
   */
  function updateStatistics() {
    const statistics = calculateComponentLibraryStatistics(categories.value, manualCategories.value)

    // 통계 업데이트 이벤트 전달
    window.dispatchEvent(
      new CustomEvent('component-library-statistics-updated', {
        detail: statistics,
      }),
    )

    console.log('[useComponentLibrary] 통계 업데이트:', statistics)
  }

  // ============================================
  // 핸들러 함수
  // ============================================

  /**
   * 컴포넌트 라이브러리 새로고침
   */
  async function refresh() {
    console.log('[useComponentLibrary] 컴포넌트 라이브러리 새로고침 시작 (깊이:', depth.value, ')')
    try {
      // 디렉토리 기반 자동 분류
      const scannedCategories = await scanAndCategorizeComponents(depth.value)
      categories.value = scannedCategories

      // 모든 컴포넌트 수집
      const allComponents = scannedCategories.flatMap((cat) => cat.components || [])

      // 하드코딩된 카테고리에 컴포넌트 매핑
      const mappedManualCategories = mapComponentsToManualCategories(allComponents)
      manualCategories.value = mappedManualCategories

      console.log(
        '[useComponentLibrary] 컴포넌트 스캔 완료:',
        scannedCategories.length,
        '개 카테고리 (자동),',
        mappedManualCategories.length,
        '개 카테고리 (수동)',
      )

      // 통계 업데이트 (watch가 자동으로 호출하지만, 명시적으로 호출하여 즉시 업데이트)
      updateStatistics()
    } catch (error) {
      console.error('[useComponentLibrary] 컴포넌트 스캔 중 오류:', error)
    }
  }

  /**
   * 깊이 변경 핸들러
   * @param {number} newDepth - 새로운 깊이 값
   */
  async function handleDepthChange(newDepth) {
    console.log('[useComponentLibrary] 깊이 변경:', newDepth)
    depth.value = newDepth
    // 깊이 변경 시 자동으로 스캔 다시 실행
    await refresh()
  }

  /**
   * 검색 변경 핸들러
   * @param {string} query - 검색어
   */
  function handleSearchChange(query) {
    searchQuery.value = query
  }

  /**
   * 카테고리 선택 핸들러
   * @param {string} categoryName - 카테고리 이름
   */
  function handleCategorySelected(categoryName) {
    selectedCategory.value = categoryName
    selectedComponent.value = null
    selectedViolation.value = null

    // 전역 이벤트로 CategoryDetail에 알림
    const category = categories.value.find((cat) => cat.name === categoryName)
    window.dispatchEvent(
      new CustomEvent('component-library-category-selected', {
        detail: {
          category: category,
        },
      }),
    )
  }

  /**
   * 컴포넌트 선택 핸들러
   * @param {Object} component - 선택된 컴포넌트
   */
  function handleComponentSelected(component) {
    selectedComponent.value = component
    selectedViolation.value = null

    // 전역 이벤트로 DevToolsPanel에 알림
    window.dispatchEvent(
      new CustomEvent('component-library-component-selected', {
        detail: {
          component: component,
        },
      }),
    )
  }

  /**
   * 위반 항목 선택 핸들러
   * @param {Object} violation - 선택된 위반 항목
   */
  function handleViolationSelected(violation) {
    selectedViolation.value = violation
    selectedComponent.value = null

    // 전역 이벤트로 DevToolsPanel에 알림
    window.dispatchEvent(
      new CustomEvent('component-library-violation-selected', {
        detail: {
          violation: violation,
        },
      }),
    )
  }

  /**
   * 탭 변경 핸들러
   * @param {string} tabName - 탭 이름
   */
  function handleTabChange(tabName) {
    console.log('[useComponentLibrary] 탭 변경 요청:', tabName)
    window.dispatchEvent(
      new CustomEvent('component-library-tab-changed', {
        detail: {
          tab: tabName,
        },
      }),
    )
    console.log('[useComponentLibrary] 탭 변경 이벤트 전달 완료')
  }

  /**
   * 차원 선택 핸들러 (부류체계)
   * @param {string} dimensionId - 차원 ID
   */
  function handleDimensionSelected(dimensionId) {
    window.dispatchEvent(
      new CustomEvent('component-library-dimension-selected', {
        detail: {
          dimensionId: dimensionId,
        },
      }),
    )
  }

  /**
   * 부류체계 카테고리 선택 핸들러
   * @param {Object} data - 카테고리 데이터
   */
  function handleTaxonomyCategorySelected(data) {
    window.dispatchEvent(
      new CustomEvent('component-library-taxonomy-category-selected', {
        detail: data,
      }),
    )
  }

  /**
   * 파일 구조 표시 핸들러
   */
  function handleShowFileStructure() {
    // TODO: 파일 구조 표시 구현
    console.log('[useComponentLibrary] 파일 구조 표시')
  }

  /**
   * 파일 구조 상세 표시 핸들러
   */
  function handleShowFileStructureDetail() {
    // TODO: 파일 구조 상세 표시 구현
    console.log('[useComponentLibrary] 파일 구조 상세 표시')
  }

  /**
   * 설정 핸들러
   */
  function handleSettings() {
    // TODO: 설정 다이얼로그 표시
    console.log('[useComponentLibrary] 컴포넌트 라이브러리 설정')
  }

  /**
   * 초기화 함수
   */
  async function initialize() {
    await refresh()
  }

  /**
   * 통계 요청 핸들러
   */
  function handleStatisticsRequest() {
    // 현재 통계를 즉시 전달
    updateStatistics()
  }

  // ============================================
  // Watch: 카테고리 변경 시 통계 업데이트
  // ============================================
  watch(
    [() => categories.value, () => manualCategories.value],
    () => {
      // 카테고리 데이터가 있을 때만 통계 업데이트
      if (categories.value.length > 0 || manualCategories.value.length > 0) {
        updateStatistics()
      }
    },
    { deep: true },
  )

  // ============================================
  // 반환값
  // ============================================
  return {
    // 상태
    categories,
    manualCategories,
    violations,
    selectedCategory,
    selectedComponent,
    selectedViolation,
    searchQuery,
    depth,

    // 함수
    refresh,
    initialize,
    handleDepthChange,
    handleSearchChange,
    handleCategorySelected,
    handleComponentSelected,
    handleViolationSelected,
    handleTabChange,
    handleDimensionSelected,
    handleTaxonomyCategorySelected,
    handleShowFileStructure,
    handleShowFileStructureDetail,
    handleSettings,
    handleStatisticsRequest,
    updateStatistics,
  }
}

