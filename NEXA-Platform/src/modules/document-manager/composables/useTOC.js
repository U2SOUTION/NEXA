import { nextTick } from 'vue'
import { saveTOCExpandedState, saveTOCSettings } from 'src/modules/document-manager/services/documentStorage.js'

/**
 * TOC (목차) 관련 로직 Composable
 * 목차 항목 토글, 스크롤 이동 등의 비즈니스 로직을 담당합니다.
 *
 * @param {Object} storeRefs - Store의 ref 객체들
 * @param {Ref} storeRefs.tocItems - 목차 항목 배열
 * @param {Ref} storeRefs.tocExpanded - 목차 확장 상태 객체
 * @param {Ref} storeRefs.tocAutoCollapse - 아코디언 모드 여부
 * @param {Ref} storeRefs.tocAutoCloseOnContentClick - 본문 클릭 시 자동 닫기 여부
 * @param {Ref} storeRefs.currentSectionId - 현재 섹션 ID
 * @param {Ref} storeRefs.allTOCExpandedState - 전체 토글 상태
 * @param {Ref} storeRefs.isManualHighlight - 수동 하일라이팅 모드
 * @param {Ref} storeRefs.selectedFile - 현재 선택된 파일
 * @returns {Object} TOC 관련 함수들
 */
export function useTOC(storeRefs) {
  const { tocItems, tocExpanded, tocAutoCollapse, tocAutoCloseOnContentClick, currentSectionId, allTOCExpandedState, isManualHighlight, selectedFile } = storeRefs

  /**
   * 목차 항목 클릭 시 해당 위치로 스크롤 이동
   * @param {string} headingId - 헤딩 요소의 ID
   */
  function scrollToHeading(headingId) {
    // 수동 하일라이팅 모드 활성화
    isManualHighlight.value = true

    // DOM이 업데이트될 때까지 재시도
    const tryScroll = (attempt = 0) => {
      nextTick(() => {
        // 요소 찾기
        const markdownContent = document.querySelector('.markdown-content')
        const element = markdownContent ? markdownContent.querySelector(`#${headingId}`) : document.getElementById(headingId)

        // 실제 스크롤 컨테이너는 .q-page (MainLayout에서 overflow-y: auto로 설정됨)
        const scrollContainer = document.querySelector('.q-page.development-page') || document.querySelector('.q-page')

        if (!element || !scrollContainer) {
          if (attempt < 2) {
            setTimeout(() => tryScroll(attempt + 1), 100)
          }
          return
        }

        // 스크롤 정보
        const scrollHeight = scrollContainer.scrollHeight
        const clientHeight = scrollContainer.clientHeight
        const maxScrollTop = scrollHeight - clientHeight
        const currentScrollTop = scrollContainer.scrollTop

        // 스크롤 가능하지 않으면 재시도
        if (maxScrollTop <= 0 && attempt < 3) {
          setTimeout(() => tryScroll(attempt + 1), 150)
          return
        }

        // 헤더 높이 계산
        let headerHeight = 0
        const fileHeader = document.querySelector('.file-content-header')
        const pageHeader = document.querySelector('.page-header')
        const qPaLg = document.querySelector('.q-pa-lg')

        if (fileHeader) {
          headerHeight += fileHeader.getBoundingClientRect().height
        }
        if (pageHeader) {
          headerHeight += pageHeader.getBoundingClientRect().height
        }
        if (qPaLg) {
          const qPaLgStyles = window.getComputedStyle(qPaLg)
          headerHeight += parseFloat(qPaLgStyles.paddingTop) || 0
        }
        if (headerHeight === 0) {
          headerHeight = 100
        }

        // 요소 위치 계산
        const elementRect = element.getBoundingClientRect()
        const containerRect = scrollContainer.getBoundingClientRect()
        const relativeTop = elementRect.top - containerRect.top
        const elementAbsoluteTop = currentScrollTop + relativeTop
        const targetScrollTop = Math.max(0, elementAbsoluteTop - headerHeight - 20)
        const finalScrollTop = Math.min(targetScrollTop, Math.max(0, maxScrollTop))

        // 스크롤 실행 (부드러운 스크롤)
        if (Math.abs(finalScrollTop - currentScrollTop) > 1) {
          // 부드러운 스크롤 애니메이션 직접 구현
          const startScrollTop = currentScrollTop
          const distance = finalScrollTop - startScrollTop
          const duration = 500 // 500ms
          const startTime = performance.now()

          function animateScroll(currentTime) {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)

            // easeInOutCubic 이징 함수
            const easeInOutCubic = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2

            const currentScrollPosition = startScrollTop + distance * easeInOutCubic
            scrollContainer.scrollTop = currentScrollPosition

            if (progress < 1) {
              requestAnimationFrame(animateScroll)
            } else {
              // 애니메이션 완료 후 하일라이팅 업데이트
              currentSectionId.value = headingId
            }
          }

          requestAnimationFrame(animateScroll)
        } else {
          currentSectionId.value = headingId
        }
      })
    }

    tryScroll(0)
  }

  /**
   * 목차 확장/축소 토글 (개별 항목)
   * @param {string} itemId - 토글할 항목의 ID
   */
  function toggleTOCItem(itemId) {
    /**
     * 트리에서 항목과 부모 정보를 재귀적으로 찾기
     * @param {string} targetId - 찾을 항목 ID
     * @param {Array} items - 검색할 항목 배열
     * @param {Object|null} parent - 부모 항목
     * @returns {Object|null} { item, parent } 또는 null
     */
    function findItemWithParent(targetId, items, parent = null) {
      for (const item of items) {
        if (item.id === targetId) {
          return { item, parent }
        }
        if (item.children && item.children.length > 0) {
          const found = findItemWithParent(targetId, item.children, item)
          if (found) return found
        }
      }
      return null
    }

    if (tocAutoCollapse.value) {
      // 자동 접힘 모드 (아코디언): 형제 항목들 자동 접기
      const newExpanded = {}

      // 최상위 레벨 항목들은 항상 true로 유지
      tocItems.value.forEach((rootItem) => {
        newExpanded[rootItem.id] = true
      })

      // 현재 항목과 부모 정보 찾기
      const result = findItemWithParent(itemId, tocItems.value)
      if (result) {
        const { parent } = result

        // 현재 항목의 상태 토글
        const currentState = tocExpanded.value[itemId] ?? true
        const newState = !currentState

        /**
         * 부모 경로의 모든 항목을 펼치는 함수 (재귀적)
         * @param {Object|null} parentItem - 부모 항목
         */
        function setParentPath(parentItem) {
          if (parentItem) {
            newExpanded[parentItem.id] = true
            // 재귀적으로 모든 부모 찾아서 펼치기
            const grandParentResult = findItemWithParent(parentItem.id, tocItems.value)
            if (grandParentResult && grandParentResult.parent) {
              setParentPath(grandParentResult.parent)
            }
          }
        }

        // 현재 항목이 최상위 레벨인 경우
        if (!parent) {
          // 최상위 레벨의 형제 항목들 찾기
          tocItems.value.forEach((sibling) => {
            if (sibling.id === itemId) {
              newExpanded[sibling.id] = newState
              // 현재 항목이 펼쳐지는 경우, 자식 항목들은 기존 상태 유지
              if (newState && sibling.children && sibling.children.length > 0) {
                sibling.children.forEach((child) => {
                  if (newExpanded[child.id] === undefined) {
                    newExpanded[child.id] = tocExpanded.value[child.id] ?? true
                  }
                })
              }
            } else {
              // 같은 레벨의 형제 항목들은 접기 (아코디언 동작)
              newExpanded[sibling.id] = true // 최상위는 항상 true로 유지
              // 하지만 하위 항목들은 접기
              if (sibling.children && sibling.children.length > 0) {
                /**
                 * 모든 자식 항목을 재귀적으로 접는 함수
                 * @param {Array} children - 자식 항목 배열
                 */
                function collapseChildren(children) {
                  children.forEach((child) => {
                    newExpanded[child.id] = false
                    if (child.children && child.children.length > 0) {
                      collapseChildren(child.children)
                    }
                  })
                }
                collapseChildren(sibling.children)
              }
            }
          })
        } else {
          // 하위 레벨 항목인 경우
          // 부모 경로는 모두 펼쳐야 함
          setParentPath(parent)

          // 같은 레벨의 형제 항목들 찾기 (부모의 자식들)
          if (parent.children && parent.children.length > 0) {
            parent.children.forEach((sibling) => {
              if (sibling.id === itemId) {
                // 현재 항목은 토글된 상태로
                newExpanded[sibling.id] = newState
                // 현재 항목이 펼쳐지는 경우, 자식 항목들은 기존 상태 유지
                if (newState && sibling.children && sibling.children.length > 0) {
                  sibling.children.forEach((child) => {
                    if (newExpanded[child.id] === undefined) {
                      newExpanded[child.id] = tocExpanded.value[child.id] ?? true
                    }
                  })
                }
              } else {
                // 형제 항목들은 접기 (아코디언 동작)
                newExpanded[sibling.id] = false
                // 형제 항목의 하위 항목들도 모두 접기
                if (sibling.children && sibling.children.length > 0) {
                  /**
                   * 모든 자식 항목을 재귀적으로 접는 함수
                   * @param {Array} children - 자식 항목 배열
                   */
                  function collapseChildren(children) {
                    children.forEach((child) => {
                      newExpanded[child.id] = false
                      if (child.children && child.children.length > 0) {
                        collapseChildren(child.children)
                      }
                    })
                  }
                  collapseChildren(sibling.children)
                }
              }
            })
          }
        }
      }

      tocExpanded.value = newExpanded
    } else {
      // 독립적 모드: 현재 항목만 토글 (전체 토글 상태와 무관)
      tocExpanded.value = {
        ...tocExpanded.value,
        [itemId]: !(tocExpanded.value[itemId] ?? true),
      }
    }

    // 상태 저장 (파일별)
    if (selectedFile.value) {
      saveTOCExpandedState(selectedFile.value.name, tocExpanded.value)
    }
  }

  /**
   * 전체 접기/펼치기 토글 (개별 항목 토글과 완전히 독립적)
   */
  function toggleAllTOC() {
    // 현재 전체 토글 상태를 반전
    const shouldExpand = !allTOCExpandedState.value

    const expanded = {}

    /**
     * 모든 항목의 상태를 재귀적으로 설정
     * @param {Array} items - 설정할 항목 배열
     * @param {boolean} isRootLevel - 최상위 레벨인지 여부
     */
    function setState(items, isRootLevel = false) {
      items.forEach((item) => {
        // 루트 레벨은 항상 펼침 상태로 유지
        if (isRootLevel) {
          expanded[item.id] = true
        } else {
          // 하위 레벨은 shouldExpand에 따라 결정
          expanded[item.id] = shouldExpand
        }

        // 자식 항목도 재귀적으로 설정
        if (item.children && item.children.length > 0) {
          setState(item.children, false)
        }
      })
    }

    setState(tocItems.value, true)
    tocExpanded.value = expanded

    // 전체 토글 상태 업데이트
    allTOCExpandedState.value = shouldExpand

    // 상태 저장 (파일별)
    if (selectedFile.value) {
      saveTOCExpandedState(selectedFile.value.name, tocExpanded.value)
    }
  }

  /**
   * 항목의 expanded 상태를 계산하는 함수
   * @param {string} itemId - 항목 ID
   * @param {Object} expandedMap - 확장 상태 맵
   * @param {boolean} autoCollapse - 아코디언 모드 여부
   * @param {string|null} currentSectionId - 현재 섹션 ID
   * @param {Array} allItems - 모든 항목 배열 (아코디언 로직용)
   * @returns {boolean} 확장 여부
   */
  function getItemExpanded(itemId, expandedMap, autoCollapse, currentSectionId, allItems) {
    // 1. expandedMap에 명시적으로 값이 있으면 무조건 사용 (최우선)
    if (itemId in expandedMap) {
      return !!expandedMap[itemId]
    }

    // 2. 아코디언 모드이고 현재 섹션이 있으면 아코디언 로직 적용
    if (autoCollapse && currentSectionId) {
      // allItems에서 해당 항목 찾기
      function findItemById(targetId, items) {
        for (const item of items) {
          if (item.id === targetId) {
            return item
          }
          if (item.children && item.children.length > 0) {
            const found = findItemById(targetId, item.children)
            if (found) return found
          }
        }
        return null
      }

      const item = findItemById(itemId, allItems)
      if (item) {
        return isChildOfActive(item, currentSectionId)
      }
    }

    // 3. 기본값: true (값이 없으면 펼침)
    return true
  }

  /**
   * 아코디언 모드: 항목이 활성 섹션의 자손인지 확인
   * @param {Object} item - 확인할 항목
   * @param {string} activeId - 활성 섹션 ID
   * @returns {boolean} 활성 섹션의 자손인지 여부
   */
  function isChildOfActive(item, activeId) {
    if (item.id === activeId) return true
    if (item.children) {
      return item.children.some((child) => isChildOfActive(child, activeId))
    }
    return false
  }

  /**
   * 아코디언 모드 변경 핸들러
   * @param {boolean} value - 아코디언 모드 여부
   */
  function setAutoCollapse(value) {
    tocAutoCollapse.value = value
    // 설정 저장
    saveTOCSettings({
      autoCollapse: value,
      autoCloseOnContentClick: tocAutoCloseOnContentClick.value,
    })
  }

  /**
   * 자동 닫기 모드 변경 핸들러
   * @param {boolean} value - 자동 닫기 모드 여부
   */
  function setAutoCloseOnContentClick(value) {
    tocAutoCloseOnContentClick.value = value
    // 설정 저장
    saveTOCSettings({
      autoCollapse: tocAutoCollapse.value,
      autoCloseOnContentClick: value,
    })
  }

  return {
    scrollToHeading,
    toggleTOCItem,
    toggleAllTOC,
    getItemExpanded,
    isChildOfActive,
    setAutoCollapse,
    setAutoCloseOnContentClick,
  }
}
