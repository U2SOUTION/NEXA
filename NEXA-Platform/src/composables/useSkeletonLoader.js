/**
 * 전역 스켈레톤 로더 Composable
 *
 * 사용법:
 * ```javascript
 * import { useSkeletonLoader } from 'src/composables/useSkeletonLoader'
 *
 * const { showSkeleton, hideSkeleton, isLoading } = useSkeletonLoader()
 *
 * // 스켈레톤 표시
 * showSkeleton({ type: 'table', rows: 10 })
 *
 * // 스켈레톤 숨기기
 * hideSkeleton()
 * ```
 */

import { ref, reactive } from 'vue'

// 전역 상태
const isLoading = ref(false)
const skeletonConfig = reactive({
  type: 'default', // 'default' | 'table' | 'card' | 'list' | 'custom'
  message: '', // 로딩 메시지
  rows: 5, // 테이블/리스트 행 수
  columns: 4, // 테이블 컬럼 수
  cards: 3, // 카드 개수
  customTemplate: null, // 커스텀 템플릿 함수
})

/**
 * 스켈레톤 로더 Composable
 */
export function useSkeletonLoader() {
  /**
   * 스켈레톤 표시
   * @param {Object} config - 스켈레톤 설정
   * @param {string} config.type - 타입: 'default' | 'table' | 'card' | 'list' | 'custom'
   * @param {string} config.message - 로딩 메시지
   * @param {number} config.rows - 행 수 (테이블/리스트용)
   * @param {number} config.columns - 컬럼 수 (테이블용)
   * @param {number} config.cards - 카드 개수 (카드용)
   * @param {Function} config.customTemplate - 커스텀 템플릿 함수
   */
  const showSkeleton = (config = {}) => {
    Object.assign(skeletonConfig, {
      type: 'default',
      message: '',
      rows: 5,
      columns: 4,
      cards: 3,
      customTemplate: null,
      ...config,
    })
    isLoading.value = true
  }

  /**
   * 스켈레톤 숨기기
   */
  const hideSkeleton = () => {
    isLoading.value = false
  }

  return {
    isLoading,
    skeletonConfig,
    showSkeleton,
    hideSkeleton,
  }
}
