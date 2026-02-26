/**
 * URL 상태 동기화 Composable
 *
 * 상태와 URL 쿼리 파라미터를 자동으로 동기화합니다.
 * - 새로고침 시 상태 복원
 * - 북마크 및 URL 공유 가능
 * - 뒤로 가기/앞으로 가기 지원
 *
 * 사용법:
 * ```javascript
 * import { useURLStateSync } from '@system/composables/url-state'
 *
 * const selectedCategory = ref(null)
 * const statusFilter = ref(null)
 * const pagination = ref({ page: 1, rowsPerPage: 25 })
 *
 * useURLStateSync({
 *   category: selectedCategory,
 *   status: statusFilter,
 *   page: computed(() => pagination.value.page),
 * })
 * ```
 *
 * @param {Object} stateMap - 상태 맵핑 객체
 * @param {Object} stateMap[key] - Vue ref 또는 computed (상태 값)
 * @param {Object} options - 옵션 (향후 확장용)
 * @returns {void}
 */

import { watch, onMounted, ref, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { URL_STATE_PARAMS } from '@system/config/url-state/index'

export function useURLStateSync(stateMap, _options = {}) {
  void _options
  const route = useRoute()
  const router = useRouter()

  // 순환 참조 방지를 위한 플래그
  // State → URL 업데이트 중일 때는 URL → State watch를 무시
  const isUpdatingFromState = ref(false)

  /**
   * 값이 기본값인지 확인 (URL에서 제거할지 결정)
   */
  function isDefaultValue(value) {
    return value === null || value === undefined || value === '' || value === 0 || value === false
  }

  /**
   * 안전하게 값을 설정 (computed setter 지원)
   *
   * readonly computed인 경우 에러를 발생시키지 않고 무시합니다.
   */
  function setValueSafely(stateRef, value) {
    // Vue 3에서 computed에 set이 있으면 value 할당 시 자동으로 set이 호출됨
    // 하지만 readonly 에러를 방지하기 위해 try-catch 사용
    try {
      if (stateRef && stateRef.value !== undefined) {
        // computed 또는 ref인 경우
        // computed에 set이 있으면 자동으로 set이 호출됨
        stateRef.value = value
      } else {
        // 그 외의 경우는 처리하지 않음 (일반 변수는 stateMap에서 직접 처리)
        console.warn('[useURLStateSync] 값을 설정할 수 없습니다. ref 또는 computed가 필요합니다.')
      }
    } catch (error) {
      // readonly computed인 경우 에러 발생
      // 이 경우 무시 (computed의 get만 사용하는 경우)
      // 경고 메시지도 출력하지 않음 (정상적인 동작)
      if (error && error.message && error.message.includes('readonly')) {
        // 읽기 전용 computed는 URL에서 읽기만 하고, 값 설정은 하지 않음
        // 이 경우 watch를 통해서만 URL 업데이트가 가능
        return
      }
      // 다른 에러는 다시 throw
      console.error('[useURLStateSync] 값을 설정하는 중 에러 발생:', error)
      throw error
    }
  }

  /**
   * URL에서 상태 복원 (공통 로직)
   */
  function restoreStateFromURL() {
    Object.keys(stateMap).forEach((key) => {
      // 짧은 파라미터 이름 사용 (URL_STATE_PARAMS에 정의된 경우)
      const paramName = URL_STATE_PARAMS[key] || key
      const queryValue = route.query[paramName]
      if (queryValue !== undefined && queryValue !== null && queryValue !== '') {
        const stateRef = stateMap[key]

        // computed인 경우 value 접근
        const currentValue = stateRef.value !== undefined ? stateRef.value : stateRef

        // 현재 State 값과 URL 값이 같으면 스킵 (불필요한 업데이트 방지)
        const currentStateValue = stateRef.value !== undefined ? stateRef.value : stateRef
        let urlValue = queryValue

        // 타입에 맞게 변환
        if (key === 'page' || typeof currentValue === 'number') {
          urlValue = parseInt(queryValue, 10)
          if (isNaN(urlValue)) return
          if (currentStateValue === urlValue) return
        } else if (typeof currentValue === 'boolean') {
          urlValue = queryValue === 'true'
          if (currentStateValue === urlValue) return
        } else {
          if (currentStateValue === urlValue) return
        }

        // State 업데이트 (플래그 설정하여 URL 업데이트 방지)
        isUpdatingFromState.value = true
        setValueSafely(stateRef, urlValue)
        // nextTick을 사용하여 State watch가 완료된 후 플래그 리셋
        nextTick(() => {
          isUpdatingFromState.value = false
        })
      }
    })
  }

  /**
   * URL에서 상태 복원 (초기 마운트 시)
   */
  onMounted(() => {
    restoreStateFromURL()
  })

  /**
   * URL 변경 감지 (같은 페이지에서 URL만 변경된 경우)
   */
  watch(
    () => route.query,
    (newQuery, oldQuery) => {
      // State → URL 업데이트 중이면 무시 (순환 참조 방지)
      if (isUpdatingFromState.value) {
        return
      }

      // 실제로 변경된 파라미터가 있는지 확인
      const hasChanged = Object.keys(stateMap).some((key) => {
        const paramName = URL_STATE_PARAMS[key] || key
        return newQuery[paramName] !== oldQuery?.[paramName]
      })

      if (hasChanged) {
        restoreStateFromURL()
      }
    },
    { deep: true },
  )

  /**
   * 상태 변경 시 URL 업데이트
   */
  Object.keys(stateMap).forEach((key) => {
    watch(
      () => {
        const stateRef = stateMap[key]
        return stateRef.value !== undefined ? stateRef.value : stateRef
      },
      (newValue) => {
        // URL → State 업데이트 중이면 무시 (순환 참조 방지)
        if (isUpdatingFromState.value) {
          return
        }

        const query = { ...route.query }

        // 짧은 파라미터 이름 사용 (URL_STATE_PARAMS에 정의된 경우)
        const paramName = URL_STATE_PARAMS[key] || key

        // 기본값이면 URL에서 제거 (깔끔한 URL 유지)
        if (isDefaultValue(newValue)) {
          delete query[paramName]
        } else {
          query[paramName] = String(newValue)
        }

        // URL 업데이트 (히스토리 추가하지 않음 - replace 사용)
        router.replace({ query })
      },
    )
  })
}
