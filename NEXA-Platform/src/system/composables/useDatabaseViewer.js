/**
 * 데이터베이스 뷰어 관리 Composable
 * 
 * 데이터베이스 정보 조회, 테이블 목록 관리 등을 담당합니다.
 */

import { ref } from 'vue'
import { getApiBaseUrl } from '@system/utils/apiBaseUrl.js'

/**
 * 데이터베이스 뷰어 관리 Composable
 * @returns {Object} 데이터베이스 뷰어 관련 상태 및 함수
 */
export function useDatabaseViewer() {
  // ============================================
  // 상태 관리
  // ============================================
  const apiBaseUrl = getApiBaseUrl()
  const dbInfo = ref({
    databaseName: null,
    version: null,
    charset: null,
  })
  const tableCount = ref(0)
  const searchQuery = ref('')
  const refreshTrigger = ref(0)
  const subMenu = ref('erd')
  const selectedTable = ref(null)

  // ============================================
  // 핸들러 함수
  // ============================================

  /**
   * 데이터베이스 뷰어 새로고침
   */
  async function refresh() {
    try {
      // 데이터베이스 정보 조회
      const infoResponse = await fetch(`${apiBaseUrl}/db/info`)
      const infoData = await infoResponse.json()

      // 503 에러는 데이터베이스 연결 문제
      if (infoResponse.status === 503) {
        console.warn('[useDatabaseViewer] 데이터베이스 연결이 없습니다:', infoData.message)
        dbInfo.value = {
          databaseName: null,
          version: null,
          charset: null,
        }
        tableCount.value = 0
        return
      }

      if (infoData.success && infoData.data) {
        dbInfo.value = infoData.data
      }

      // 테이블 목록 조회 (개수만)
      const tablesResponse = await fetch(`${apiBaseUrl}/db/tables`)
      const tablesData = await tablesResponse.json()

      // 503 에러는 데이터베이스 연결 문제
      if (tablesResponse.status === 503) {
        console.warn('[useDatabaseViewer] 데이터베이스 연결이 없습니다:', tablesData.message)
        tableCount.value = 0
        return
      }

      if (tablesData.success && tablesData.data) {
        tableCount.value = tablesData.data.length
      }

      // 리스트 컴포넌트 새로고침 트리거
      refreshTrigger.value++
    } catch (error) {
      // ERR_CONNECTION_REFUSED 등 네트워크 에러 처리
      if (error.name === 'TypeError' && error.message?.includes('Failed to fetch')) {
        console.warn('[useDatabaseViewer] 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.')
        dbInfo.value = {
          databaseName: null,
          version: null,
          charset: null,
        }
        tableCount.value = 0
      } else {
        console.error('[useDatabaseViewer] 데이터베이스 뷰어 새로고침 실패:', error)
      }
    }
  }

  /**
   * 검색 변경 핸들러
   * @param {string} query - 검색어
   */
  function handleSearchChange(query) {
    searchQuery.value = query
  }

  /**
   * 테이블 선택 핸들러
   * @param {string} tableName - 선택된 테이블 이름
   */
  function handleTableSelected(tableName) {
    selectedTable.value = tableName
    // 전역 이벤트로 DatabaseViewerContent에 알림
    window.dispatchEvent(
      new CustomEvent('database-table-selected', {
        detail: {
          tableName: tableName,
        },
      }),
    )
  }

  /**
   * 설정 핸들러
   */
  function handleSettings() {
    // TODO: 설정 모달 열기
    console.log('[useDatabaseViewer] 데이터베이스 뷰어 설정')
  }

  /**
   * 서브 메뉴 변경 핸들러
   * @param {string} newSubMenu - 새로운 서브 메뉴
   */
  function handleSubMenuChange(newSubMenu) {
    subMenu.value = newSubMenu
    // 전역 이벤트로 DatabaseViewerContent에 알림 (선택된 테이블 정보도 포함)
    window.dispatchEvent(
      new CustomEvent('database-viewer-sub-menu-changed', {
        detail: {
          subMenu: newSubMenu,
          selectedTable: selectedTable.value, // 선택된 테이블 정보 포함
        },
      }),
    )
    // 서브 메뉴 변경 시 선택된 테이블이 있으면 테이블 선택 이벤트 재발생
  }

  /**
   * 새로고침 이벤트 핸들러
   */
  function handleRefreshEvent() {
    console.log('[useDatabaseViewer] database-viewer-refresh 이벤트 수신')
    refresh()
  }

  // ============================================
  // 반환값
  // ============================================
  return {
    // 상태
    dbInfo,
    tableCount,
    searchQuery,
    refreshTrigger,
    subMenu,
    selectedTable,

    // 함수
    refresh,
    handleSearchChange,
    handleTableSelected,
    handleSettings,
    handleSubMenuChange,
    handleRefreshEvent,
  }
}

