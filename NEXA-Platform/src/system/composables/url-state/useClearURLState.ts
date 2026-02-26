/**
 * URL 상태 제거 Composable
 *
 * URL에서 상태 파라미터를 제거합니다.
 *
 * @param {Object} options - 제거 옵션
 * @param {Array<string>} options.exclude - 제외할 파라미터 목록
 * @param {boolean} options.useNextTick - nextTick 사용 여부 (기본값: false)
 * @returns {Object} clearURLState 함수
 */

import { nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getURLStateParamName } from '@system/config/url-state/index'

export function useClearURLState(options = {}) {
  const { exclude = [], useNextTick = false } = options
  const route = useRoute()
  const router = useRouter()

  /**
   * URL 상태 제거 함수
   * @param {Array<string>} paramNames - 제거할 파라미터 이름 목록 (기본값: 모든 공유 파라미터)
   */
  function clearURLState(paramNames = null) {
    const execute = () => {
      // 제거할 파라미터 목록이 지정되지 않으면 기본 공유 파라미터 사용
      const paramsToRemove = paramNames || ['selected', 'search', 'category', 'status']

      // 제외할 파라미터 필터링
      const filteredParams = paramsToRemove.filter((param) => !exclude.includes(param))

      // 공유 URL 관련 파라미터가 하나라도 있는지 확인
      const hasSharedParams = filteredParams.some((paramName) => {
        const shortName = getURLStateParamName(paramName)
        return route.query[shortName]
      })

      if (hasSharedParams) {
        const query = { ...route.query }
        filteredParams.forEach((paramName) => {
          const shortName = getURLStateParamName(paramName)
          delete query[shortName]
        })
        router.replace({ query })
      }
    }

    if (useNextTick) {
      nextTick(execute)
    } else {
      execute()
    }
  }

  return {
    clearURLState,
  }
}
