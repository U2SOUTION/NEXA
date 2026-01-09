<!--
  DataPageNavigation.vue
  범용 페이징 컴포넌트 - 모든 뷰(테이블, 카드 등)에서 사용 가능
  테이블 뷰 전용 자동 행 수 계산 기능 포함 (autoCalculateRows prop으로 제어)
-->
<template>
  <div class="custom-pagination">
    <!-- 왼쪽: LimitPage 셀렉트 -->
    <div v-if="showLimitSelect" class="pagination-left">
      <span class="pagination-label">LimitPage</span>
      <q-select :model-value="localPagination.rowsPerPage" :options="rowsPerPageOptions" dense borderless class="pagination-select" @update:model-value="handleRowsPerPageChange" />
    </div>

    <!-- 중앙: 네비게이션 버튼 + 페이지 번호 -->
    <div class="pagination-center">
      <!-- 첫 페이지로 이동 -->
      <q-btn v-if="showFirstLast && pageNumbers.showFirst" flat round icon="first_page" :disable="localPagination.page === 1" @click="goToPage(1)" class="pagination-nav-btn pagination-first-btn" />
      <!-- 이전 페이지 -->
      <q-btn flat round icon="chevron_left" :disable="!pageNumbers.hasPrev" @click="prevPage" class="pagination-nav-btn" />
      <!-- 페이지 번호 버튼들 -->
      <div class="pagination-numbers">
        <q-btn v-for="pageNum in pageNumbers.pages" :key="pageNum" flat dense round :label="pageNum.toString()" :class="['pagination-page-btn', { 'pagination-page-active': localPagination.page === pageNum }]" @click="goToPage(pageNum)" />
      </div>
      <!-- 다음 페이지 -->
      <q-btn flat round icon="chevron_right" :disable="!pageNumbers.hasNext" @click="nextPage" class="pagination-nav-btn" />
      <!-- 마지막 페이지로 이동 -->
      <q-btn v-if="showFirstLast && pageNumbers.showLast" flat round icon="last_page" :disable="localPagination.page >= paginationInfo.pages" @click="goToPage(paginationInfo.pages)" class="pagination-nav-btn pagination-last-btn" />
    </div>

    <!-- 오른쪽: 페이지 정보 -->
    <div v-if="showInfo" class="pagination-right">
      <span class="pagination-info"> {{ paginationInfo.from }}-{{ paginationInfo.to }} of {{ paginationInfo.total }} </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

// 개발 모드 체크
const isDev = import.meta.env.DEV
const debugLog = () => {
  // 디버깅 로그 비활성화
}

const props = defineProps({
  // 페이징 상태 객체 (v-model로 바인딩) - { page: number, rowsPerPage: number }
  modelValue: {
    type: Object,
    required: true,
    validator: (value) => {
      return typeof value.page === 'number' && typeof value.rowsPerPage === 'number'
    },
  },
  // 전체 데이터 개수 (필터링된 경우 필터링된 개수 전달)
  total: {
    type: Number,
    required: true,
    default: 0,
  },
  // 행 수 선택 옵션 (이 값 중 선택 시 자동 계산 비활성화)
  rowsPerPageOptions: {
    type: Array,
    default: () => [10, 25, 50, 100],
  },
  // 최대 표시할 페이지 번호 개수
  maxVisiblePages: {
    type: Number,
    default: 5,
  },
  // 첫/마지막 페이지 버튼 표시 여부
  showFirstLast: {
    type: Boolean,
    default: true,
  },
  // 페이지 정보 표시 여부
  showInfo: {
    type: Boolean,
    default: true,
  },
  // LimitPage 셀렉트 표시 여부
  showLimitSelect: {
    type: Boolean,
    default: true,
  },
  // 자동 행 수 계산 활성화 (true일 경우 tableWrapperRef 필수)
  autoCalculateRows: {
    type: Boolean,
    default: true,
  },
  // 테이블 컨테이너 ref (자동 계산용, ref 객체 자체를 전달)
  tableWrapperRef: {
    type: [Object, null],
    default: null,
  },
  // 최소 행 수
  minRows: {
    type: Number,
    default: 5,
  },
  // 디바운스 시간 (ms)
  debounceTime: {
    type: Number,
    default: 300,
  },
})

// Emits: update:modelValue, page-change, rows-per-page-change, calculation-complete
const emit = defineEmits(['update:modelValue', 'page-change', 'rows-per-page-change', 'calculation-complete'])

// ref 객체에서 실제 DOM 요소 추출 (ref 객체와 DOM 요소 모두 처리)
const getTableWrapper = () => {
  if (!props.tableWrapperRef) return null
  if (props.tableWrapperRef.value !== undefined) {
    return props.tableWrapperRef.value
  }
  return props.tableWrapperRef
}

debugLog('Props 확인', {
  total: props.total,
  autoCalculateRows: props.autoCalculateRows,
  tableWrapper: !!getTableWrapper(),
})

// v-model 양방향 바인딩을 위한 computed
const localPagination = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
  },
})

// 사용자가 수동으로 페이지 크기를 변경했는지 추적 (true면 자동 계산 비활성화)
const isManualPageSizeSet = ref(false)
// 자동 계산 중인지 추적 (자동 계산 중에는 isManualPageSizeSet 변경하지 않음)
let isAutoCalculating = false
// 디바운스 타이머 및 옵저버 (onUnmounted에서 정리 필요)
let calculateTimer = null
let isCalculating = false
let resizeTimer = null
let resizeObserver = null

// 페이징 정보 계산 (total, rowsPerPage, page 기반)
const paginationInfo = computed(() => {
  const total = props.total || 0
  const rowsPerPage = localPagination.value.rowsPerPage || 25
  const currentPage = localPagination.value.page || 1
  const pages = Math.ceil(total / rowsPerPage) || 1

  const from = total === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1
  const to = Math.min(currentPage * rowsPerPage, total)

  return {
    total,
    pages,
    from,
    to,
    currentPage,
  }
})

// 페이지 범위 보정 (유효 범위를 벗어나면 자동 보정)
watch(
  () => [paginationInfo.value.pages, localPagination.value.rowsPerPage],
  ([pages]) => {
    if (pages > 0 && localPagination.value.page > pages) {
      localPagination.value = { ...localPagination.value, page: pages }
    } else if (localPagination.value.page < 1) {
      localPagination.value = { ...localPagination.value, page: 1 }
    }
  },
  { immediate: true },
)

// 페이지 번호 배열 계산 (현재 페이지 주변 표시)
const pageNumbers = computed(() => {
  const currentPage = localPagination.value.page || 1
  const totalPages = paginationInfo.value.pages
  const maxVisible = props.maxVisiblePages || 5
  const halfVisible = Math.floor(maxVisible / 2)

  let start = Math.max(1, currentPage - halfVisible)
  let end = Math.min(totalPages, start + maxVisible - 1)

  // 끝에서 시작점 조정
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }

  const pages = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return {
    pages,
    showFirst: start > 1,
    showLast: end < totalPages,
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages,
  }
})

// 특정 페이지로 이동
function goToPage(page) {
  if (page >= 1 && page <= paginationInfo.value.pages) {
    localPagination.value = { ...localPagination.value, page }
    emit('page-change', page)
  }
}

// 이전 페이지로 이동
function prevPage() {
  if (pageNumbers.value.hasPrev) {
    const newPage = localPagination.value.page - 1
    goToPage(newPage)
  }
}

// 다음 페이지로 이동
function nextPage() {
  if (pageNumbers.value.hasNext) {
    const newPage = localPagination.value.page + 1
    goToPage(newPage)
  }
}

// 행 수 변경 핸들러 (사용자가 셀렉트에서 직접 변경한 경우 수동 설정으로 간주)
function handleRowsPerPageChange(newRowsPerPage) {
  // 자동 계산 중이 아닐 때만 수동 설정으로 간주
  if (!isAutoCalculating) {
    isManualPageSizeSet.value = true
    debugLog('사용자 수동 설정', { rowsPerPage: newRowsPerPage })
  }

  localPagination.value = { ...localPagination.value, rowsPerPage: newRowsPerPage }
  emit('rows-per-page-change', newRowsPerPage)

  // 페이지 범위 보정
  nextTick(() => {
    const pages = paginationInfo.value.pages
    if (localPagination.value.page > pages && pages > 0) {
      localPagination.value = { ...localPagination.value, page: pages }
    }
  })
}

// 자동 행 수 계산: 테이블 컨테이너 높이 측정하여 최적 행 수 계산
// 동작: 사용 가능 높이 측정 → 행 높이 측정 → 초기 행 수 계산 → 반복 조정 (여백 있으면 증가, 부족하면 감소)
// force=true면 수동 설정 상태여도 강제 실행, 디바운싱 적용, 최대 4번 반복 시도
function calculateOptimalRowsPerPage(force = false) {
  if (!props.autoCalculateRows) {
    return
  }
  if (isManualPageSizeSet.value && !force) {
    return
  }
  if (isCalculating) {
    return
  }
  const tableWrapper = getTableWrapper()

  if (!tableWrapper) {
    return
  }

  debugLog('자동 행 수 계산 시작', { force, total: props.total })

  // 디바운싱
  if (calculateTimer) {
    clearTimeout(calculateTimer)
  }

  calculateTimer = setTimeout(() => {
    isCalculating = true
    isAutoCalculating = true // 자동 계산 시작 플래그 설정

    nextTick(() => {
      try {
        const tableWrapper = getTableWrapper()
        if (!tableWrapper) {
          isCalculating = false
          isAutoCalculating = false
          return
        }

        const tableContainer = tableWrapper.querySelector('.q-table__middle')
        const tableHeader = tableWrapper.querySelector('.q-table thead')
        const tableBottom = tableWrapper.querySelector('.q-table__bottom')
        const tableBody = tableWrapper.querySelector('.q-table tbody')

        if (!tableContainer || !tableHeader) {
          isCalculating = false
          return
        }

        // 실제 사용 가능한 높이 측정
        // parts-table-wrapper의 실제 높이를 기준으로 계산
        const measureAvailableHeight = () => {
          // tableWrapper (parts-table-wrapper)의 실제 높이
          const wrapperRect = tableWrapper.getBoundingClientRect()
          const wrapperHeight = wrapperRect.height

          // 헤더 높이
          const headerRect = tableHeader.getBoundingClientRect()
          const headerHeight = headerRect.height

          // 바닥(pagination) 높이 - 더 정확하게 측정
          const bottomRect = tableBottom?.getBoundingClientRect()
          const bottomHeight = bottomRect ? bottomRect.height : 0

          // 페이징 영역 여유 공간 추가 (가려지는 것을 방지하기 위해)
          const paginationPadding = 30

          // 사용 가능한 높이 = 전체 높이 - 헤더 - 바닥 - 여유 공간
          const availableHeight = wrapperHeight - headerHeight - bottomHeight - paginationPadding

          debugLog('높이 측정 상세', {
            wrapperHeight: Math.round(wrapperHeight),
            headerHeight: Math.round(headerHeight),
            bottomHeight: Math.round(bottomHeight),
            paginationPadding,
            availableHeight: Math.round(availableHeight),
          })

          return availableHeight
        }

        const availableHeight = measureAvailableHeight()

        if (availableHeight <= 0) {
          isCalculating = false
          return
        }

        // 행 높이 측정
        let rowHeight = 48
        if (tableBody) {
          const rows = tableBody.querySelectorAll('tr')
          if (rows.length > 0) {
            let totalHeight = 0
            let measuredCount = 0

            rows.forEach((row) => {
              const rowRect = row.getBoundingClientRect()
              if (rowRect.height > 0) {
                totalHeight += rowRect.height
                measuredCount++
              }
            })

            if (measuredCount > 0) {
              rowHeight = totalHeight / measuredCount
            } else {
              const firstRow = rows[0]
              rowHeight = firstRow.offsetHeight || 48
            }
          }
        }

        if (rowHeight < 10) {
          rowHeight = 48
        }

        // 초기 행 수 계산
        let targetRows = Math.max(props.minRows, Math.floor(availableHeight / rowHeight))
        const maxRows = props.total

        debugLog('계산된 값', {
          availableHeight: Math.round(availableHeight),
          rowHeight: Math.round(rowHeight * 100) / 100,
          targetRows,
          maxRows,
          currentRowsPerPage: localPagination.value.rowsPerPage,
        })

        // 반복적으로 측정하고 조정하여 정확한 행 수 찾기
        let lastTargetRows = targetRows
        const adjustRows = (attempt = 0) => {
          if (attempt > 3) {
            isCalculating = false
            isAutoCalculating = false // 자동 계산 종료

            emit('calculation-complete', targetRows)
            return
          }

          // 현재 행 수로 설정 (자동 계산 중이므로 isManualPageSizeSet 변경하지 않음)
          if (targetRows !== localPagination.value.rowsPerPage) {
            debugLog('행 수 변경 (자동)', {
              from: localPagination.value.rowsPerPage,
              to: targetRows,
              attempt,
            })
            // 자동 계산 중 플래그를 유지하면서 값만 변경
            localPagination.value = { ...localPagination.value, rowsPerPage: targetRows }

            // rowsPerPage 변경 시 페이지 범위 보정
            nextTick(() => {
              const pages = paginationInfo.value.pages
              if (localPagination.value.page > pages && pages > 0) {
                localPagination.value = { ...localPagination.value, page: pages }
              }
            })
          }

          // DOM 업데이트 대기 후 실제 높이 측정
          nextTick(() => {
            setTimeout(() => {
              const newTableBody = tableWrapper?.querySelector('.q-table tbody')
              const newTableContainer = tableWrapper?.querySelector('.q-table__middle')

              if (!newTableBody || !newTableContainer) {
                isCalculating = false
                isAutoCalculating = false
                return
              }

              const newRows = newTableBody.querySelectorAll('tr')
              if (newRows.length === 0) {
                isCalculating = false
                isAutoCalculating = false
                return
              }

              // 실제 렌더링된 높이 측정 (초기 계산과 동일한 방식 사용)
              const wrapperRect = tableWrapper.getBoundingClientRect()
              const wrapperHeight = wrapperRect.height
              const headerRect = tableHeader.getBoundingClientRect()
              const headerHeight = headerRect.height
              const bottomRect = tableBottom?.getBoundingClientRect()
              const bottomHeight = bottomRect ? bottomRect.height : 0

              // 페이징 영역 여유 공간 추가 (가려지는 것을 방지하기 위해)
              const paginationPadding = 40

              const actualAvailableHeight = wrapperHeight - headerHeight - bottomHeight - paginationPadding

              const firstRowRect = newRows[0].getBoundingClientRect()
              const lastRowRect = newRows[newRows.length - 1].getBoundingClientRect()
              const actualContentHeight = lastRowRect.bottom - firstRowRect.top

              const remainingSpace = actualAvailableHeight - actualContentHeight
              const threshold = 10 // threshold 증가 (5 -> 10)로 더 안정적인 계산

              debugLog('반복 계산 상세', {
                attempt,
                targetRows,
                actualAvailableHeight: Math.round(actualAvailableHeight),
                actualContentHeight: Math.round(actualContentHeight),
                remainingSpace: Math.round(remainingSpace),
                rowHeight: Math.round(rowHeight * 100) / 100,
              })

              // 안정화 체크: 같은 값이 반복되면 종료
              if (targetRows === lastTargetRows && Math.abs(remainingSpace) <= threshold) {
                debugLog('안정화됨, 계산 종료', {
                  finalRows: targetRows,
                  remainingSpace: Math.round(remainingSpace),
                })
                isCalculating = false
                isAutoCalculating = false // 자동 계산 종료
                emit('calculation-complete', targetRows)
                return
              }
              lastTargetRows = targetRows

              // 여백이 있으면 행 수 증가 (더 공격적으로 증가)
              if (remainingSpace > threshold && targetRows < maxRows) {
                const additionalRows = Math.min(
                  Math.max(1, Math.ceil(remainingSpace / rowHeight)), // 최소 1개 행 증가
                  maxRows - targetRows,
                )
                if (additionalRows > 0) {
                  targetRows += additionalRows
                  debugLog('행 수 증가', {
                    from: targetRows - additionalRows,
                    to: targetRows,
                    additionalRows,
                  })
                  adjustRows(attempt + 1)
                  return
                }
              }

              // 공간이 부족하면 행 수 감소 (더 보수적으로 감소)
              if (remainingSpace < -threshold && targetRows > props.minRows) {
                const reduceRows = Math.min(
                  Math.max(1, Math.ceil(Math.abs(remainingSpace) / rowHeight)), // 최소 1개 행 감소
                  targetRows - props.minRows,
                )
                if (reduceRows > 0) {
                  targetRows -= reduceRows
                  debugLog('행 수 감소', {
                    from: targetRows + reduceRows,
                    to: targetRows,
                    reduceRows,
                  })
                  adjustRows(attempt + 1)
                  return
                }
              }

              // 여백이 threshold 이내면 안정화된 것으로 간주
              if (Math.abs(remainingSpace) <= threshold) {
                debugLog('안정화됨 (threshold 이내), 계산 종료', {
                  finalRows: targetRows,
                  remainingSpace: Math.round(remainingSpace),
                })
                isCalculating = false
                isAutoCalculating = false
                emit('calculation-complete', targetRows)
                return
              }

              // 정확한 행 수를 찾았거나 더 이상 조정할 수 없으면 종료
              debugLog('계산 완료', {
                finalRows: targetRows,
                remainingSpace: Math.round(remainingSpace),
              })
              isCalculating = false
              isAutoCalculating = false // 자동 계산 종료
              emit('calculation-complete', targetRows)
            }, 200)
          })
        }

        // 초기 조정 시작
        adjustRows(0)
      } catch (error) {
        if (isDev) {
          console.error('[DataPageNavigation] 계산 오류', error)
        }
        isCalculating = false
        isAutoCalculating = false
      }
    })
  }, props.debounceTime)
}

// rowsPerPage 변경 감지 (자동 계산 중이 아니고 옵션에 포함된 값이면 수동 설정으로 간주)
watch(
  () => localPagination.value.rowsPerPage,
  (newVal, oldVal) => {
    if (oldVal !== undefined && newVal !== oldVal) {
      // 자동 계산 중이 아닐 때만 처리
      if (!isAutoCalculating) {
        // rows-per-page-options에 있는 값이면 수동 설정으로 간주
        if (props.rowsPerPageOptions.includes(newVal)) {
          isManualPageSizeSet.value = true
          debugLog('수동 설정 감지', { rowsPerPage: newVal })
        }
        // 자동 계산된 값이면 재계산 트리거하지 않음 (이미 자동 계산 중이 아니므로)
      }
    }
  },
)

// total 변경 감지 (유효 범위 벗어나면 첫 페이지로 이동, 행 수 재계산은 리사이즈에서만 처리)
watch(
  () => props.total,
  () => {
    // 현재 페이지가 유효한 범위를 벗어나면 첫 페이지로 이동
    const maxPage = Math.ceil(props.total / localPagination.value.rowsPerPage) || 1
    if (localPagination.value.page > maxPage) {
      localPagination.value = { ...localPagination.value, page: 1 }
    }

    // 데이터 변경 시에는 행 수 재계산하지 않음
    // 행 수 재계산은 리사이즈 이벤트에서만 처리
  },
)

// 리사이즈 핸들러 (수동 설정 상태가 아니면 자동 계산, 디바운싱 250ms)
function handleResize() {
  if (resizeTimer) {
    clearTimeout(resizeTimer)
  }

  resizeTimer = setTimeout(() => {
    debugLog('리사이즈 감지', {
      isManualPageSizeSet: isManualPageSizeSet.value,
      autoCalculateRows: props.autoCalculateRows,
    })

    if (!isManualPageSizeSet.value && props.autoCalculateRows) {
      calculateOptimalRowsPerPage(true)
    }

    // 리사이즈 후 페이지 범위 보정
    nextTick(() => {
      const pages = paginationInfo.value.pages
      if (localPagination.value.page > pages && pages > 0) {
        localPagination.value = { ...localPagination.value, page: pages }
      } else if (localPagination.value.page < 1) {
        localPagination.value = { ...localPagination.value, page: 1 }
      }
    })
  }, 250)
}

// 리사이즈 옵저버 설정 플래그 (중복 등록 방지)
let resizeObserverSetup = false
// 컴포넌트 마운트 상태 추적 (언마운트된 경우 setTimeout 실행 방지)
let isMounted = false

// 리사이즈 옵저버 설정 (ResizeObserver + window resize 이벤트)
function setupResizeObserver() {
  // 컴포넌트가 언마운트되었으면 실행하지 않음
  if (!isMounted) {
    debugLog('리사이즈 옵저버 설정 건너뜀 (컴포넌트 언마운트됨)')
    return
  }

  const tableWrapper = getTableWrapper()

  if (!tableWrapper || !props.autoCalculateRows) {
    debugLog('리사이즈 옵저버 설정 실패', {
      tableWrapper: !!tableWrapper,
      autoCalculateRows: props.autoCalculateRows,
      isMounted,
    })
    return
  }

  // 기존 옵저버가 있으면 제거
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }

  // ResizeObserver로 테이블 컨테이너 감지
  if (window.ResizeObserver) {
    resizeObserver = new ResizeObserver(() => {
      handleResize()
    })
    resizeObserver.observe(tableWrapper)
    debugLog('ResizeObserver 설정 완료', { tableWrapper: !!tableWrapper })
  }

  // window resize 이벤트도 함께 감지 (창 크기 변경 대응)
  if (!resizeObserverSetup) {
    window.addEventListener('resize', handleResize)
    resizeObserverSetup = true
    debugLog('window resize 이벤트 리스너 설정 완료')
  }
}

// 초기 계산 완료 플래그 (watch와 onMounted 중복 실행 방지)
let initialCalculationTriggered = false

// tableWrapperRef 변경 감지 (설정될 때 자동 계산 트리거 및 리사이즈 옵저버 설정)
watch(
  () => getTableWrapper(),
  (newVal, oldVal) => {
    if (newVal && !oldVal && props.autoCalculateRows && !isManualPageSizeSet.value && !initialCalculationTriggered) {
      initialCalculationTriggered = true
      debugLog('tableWrapperRef 감지, 자동 계산 트리거')
      // DOM이 준비될 때까지 대기
      nextTick(() => {
        setTimeout(() => {
          if (isMounted) {
            calculateOptimalRowsPerPage(true)
          }
          // 리사이즈 옵저버도 함께 설정
          setTimeout(() => {
            if (isMounted) {
              setupResizeObserver()
            }
          }, 600)
        }, 100)
      })
    }
  },
  { immediate: true },
)

// 컴포넌트 마운트 시 초기 자동 계산 및 리사이즈 옵저버 설정 (watch에서 처리 안 된 경우만, 최대 2초 재시도)
onMounted(() => {
  isMounted = true
  const tableWrapper = getTableWrapper()

  debugLog('onMounted 실행', {
    autoCalculateRows: props.autoCalculateRows,
    tableWrapper: !!tableWrapper,
    total: props.total,
    initialCalculationTriggered,
  })

  // watch에서 이미 처리했으면 중복 실행 방지
  if (initialCalculationTriggered) {
    // 리사이즈 옵저버만 설정
    setTimeout(() => {
      if (isMounted) {
        setupResizeObserver()
      }
    }, 600)
    return
  }

  // 초기 계산 (watch에서 처리되지 않은 경우에만)
  if (props.autoCalculateRows && tableWrapper) {
    initialCalculationTriggered = true
    debugLog('즉시 계산 시작')
    const initialCalculate = () => {
      setTimeout(() => {
        if (isMounted) {
          calculateOptimalRowsPerPage(true)
        }
        // 한 번만 실행 (중복 제거)
      }, 500)
    }

    initialCalculate()

    // 리사이즈 옵저버 설정
    setTimeout(() => {
      if (isMounted) {
        setupResizeObserver()
      }
    }, 600)
  } else if (props.autoCalculateRows) {
    debugLog('tableWrapperRef 대기 중...')
    // tableWrapperRef가 아직 없으면 재시도 (최대 2초)
    let retryCount = 0
    const maxRetries = 10 // 최대 2초 (200ms * 10)
    const retryCalculate = () => {
      if (!isMounted) {
        return
      }
      retryCount++
      const currentTableWrapper = getTableWrapper()

      if (currentTableWrapper && !initialCalculationTriggered) {
        initialCalculationTriggered = true
        debugLog('tableWrapperRef 발견, 계산 시작')
        setTimeout(() => {
          if (isMounted) {
            calculateOptimalRowsPerPage(true)
          }
        }, 500)
        setTimeout(() => {
          if (isMounted) {
            setupResizeObserver()
          }
        }, 600)
      } else if (retryCount < maxRetries) {
        setTimeout(retryCalculate, 200)
      } else if (!initialCalculationTriggered) {
        if (isDev) {
          console.warn('[DataPageNavigation] tableWrapperRef를 찾을 수 없음 (최대 재시도 횟수 초과)')
        }
      }
    }
    setTimeout(retryCalculate, 200)
  }
})

// paginationInfo를 부모 컴포넌트에서 접근할 수 있도록 expose
defineExpose({
  paginationInfo,
})

// 컴포넌트 언마운트 시 리소스 정리 (타이머, 옵저버, 이벤트 리스너 제거)
onUnmounted(() => {
  isMounted = false
  if (calculateTimer) {
    clearTimeout(calculateTimer)
    calculateTimer = null
  }
  if (resizeTimer) {
    clearTimeout(resizeTimer)
    resizeTimer = null
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (resizeObserverSetup) {
    window.removeEventListener('resize', handleResize)
    resizeObserverSetup = false
  }
})
</script>

<style lang="scss" scoped>
// 페이징 컴포넌트 스타일 (CSS 변수로 커스터마이징 가능, 부모에서 --pagination-* 변수로 오버라이드)
.custom-pagination {
  background-color: transparent;
  // CSS 변수 정의 (투명도, 크기, 폰트, border-radius)
  --pagination-opacity-side: 0.3; // 양쪽 리미트/정보 투명도
  --pagination-opacity-select: 0.5; // 셀렉트 투명도
  --pagination-opacity-center: 0.6; // 중앙 버튼 기본 투명도
  --pagination-opacity-hover: 0.8; // 호버 투명도
  --pagination-opacity-disabled: 0.3; // 비활성 투명도
  --pagination-opacity-active: 1; // 활성 페이지 투명도

  --pagination-size-btn: 40px; // 화살표 버튼 크기
  --pagination-size-page: 30px; // 페이지 번호 버튼 크기
  --pagination-size-icon: 25px; // 아이콘 크기
  --pagination-size-mobile-btn: 36px; // 모바일 버튼 크기
  --pagination-size-mobile-icon: 24px; // 모바일 아이콘 크기
  --pagination-size-page-mobile: 28px; // 모바일 페이지 버튼 크기

  --pagination-font-size: 14px; // 기본 폰트 크기
  --pagination-font-size-select: 13px; // 셀렉트 폰트 크기
  --pagination-font-size-mobile: 12px; // 모바일 폰트 크기

  --pagination-border-radius: 6px; // 페이지 번호 버튼 둥근 모서리

  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 3px 16px 8px 16px; // 상단 3px, 우측 16px, 하단 8px, 좌측 16px
  border-top: 1px solid #040404;
  flex-wrap: wrap;
  gap: 12px;
  position: relative;

  // 왼쪽: LimitPage 셀렉트
  .pagination-left {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 0 0 auto;
    flex-shrink: 0;

    .pagination-label {
      color: var(--nexa-text-primary);
      opacity: var(--pagination-opacity-side);
      font-size: var(--pagination-font-size);
      white-space: nowrap;
      line-height: 1.5;
      display: flex;
      align-items: center;

      @media (max-width: 600px) {
        display: none;
      }
    }

    .pagination-select {
      min-width: 50px;
      max-width: 60px;
      width: auto;
      color: var(--nexa-text-primary);
      opacity: var(--pagination-opacity-select);
      display: flex;
      align-items: center;

      :deep(.q-field) {
        margin: 0;
        padding: 0;
        display: flex;
        align-items: center;
      }

      :deep(.q-field__control) {
        min-height: 32px;
        height: 32px;
        padding: 0 8px;
        display: flex;
        align-items: center;
      }

      :deep(.q-field__native) {
        color: var(--nexa-text-primary);
        opacity: var(--pagination-opacity-select);
        font-size: var(--pagination-font-size-select);
        padding: 0;
        min-width: 0;
        width: auto;
        line-height: 1.5;
        display: flex;
        align-items: center;
      }

      :deep(.q-field__label) {
        display: none;
      }

      :deep(.q-select__dropdown-icon) {
        color: var(--nexa-text-primary);
        opacity: var(--pagination-opacity-select);
        font-size: 16px;
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
      }

      :deep(.q-field__inner),
      :deep(.q-field__control-container) {
        padding: 0;
        display: flex;
        align-items: center;
      }

      // 태블릿 크기 (768px 이하)
      @media (max-width: 768px) {
        min-width: 48px;
        max-width: 55px;

        :deep(.q-field__control) {
          min-height: 30px;
          height: 30px;
          padding: 0 7px;
        }

        :deep(.q-field__native) {
          font-size: 12.5px;
        }

        :deep(.q-select__dropdown-icon) {
          font-size: 15px;
          width: 15px;
          height: 15px;
        }
      }

      // 모바일 크기 (600px 이하)
      @media (max-width: 600px) {
        min-width: 45px;
        max-width: 50px;

        :deep(.q-field__control) {
          min-height: 28px;
          height: 28px;
          padding: 0 6px;
        }

        :deep(.q-field__native) {
          font-size: var(--pagination-font-size-mobile);
        }

        :deep(.q-select__dropdown-icon) {
          font-size: 14px;
          width: 14px;
          height: 14px;
        }
      }
    }
  }

  // 중앙: 네비게이션 버튼 + 페이지 번호 (정가운데 정렬)
  .pagination-center {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex: 1;
    flex-wrap: wrap;
    min-width: 0;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);

    .pagination-nav-btn {
      min-width: var(--pagination-size-btn);
      min-height: var(--pagination-size-btn);
      width: var(--pagination-size-btn);
      height: var(--pagination-size-btn);
      padding: 0;
      color: var(--nexa-text-primary);
      opacity: var(--pagination-opacity-center);
      flex-shrink: 0;

      :deep(.q-icon) {
        font-size: var(--pagination-size-icon);
        width: var(--pagination-size-icon);
        height: var(--pagination-size-icon);
        min-width: var(--pagination-size-icon);
        min-height: var(--pagination-size-icon);
        max-width: var(--pagination-size-icon);
        max-height: var(--pagination-size-icon);
      }

      :deep(.q-btn__content) {
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      :deep(.q-btn__wrapper) {
        padding: 0;
      }

      &:hover:not(.q-btn--disabled) {
        opacity: var(--pagination-opacity-hover);
      }

      &.q-btn--disabled {
        opacity: var(--pagination-opacity-disabled);
      }

      @media (max-width: 768px) {
        min-width: var(--pagination-size-mobile-btn);
        min-height: var(--pagination-size-mobile-btn);
        width: var(--pagination-size-mobile-btn);
        height: var(--pagination-size-mobile-btn);

        :deep(.q-icon) {
          font-size: var(--pagination-size-mobile-icon);
          width: var(--pagination-size-mobile-icon);
          height: var(--pagination-size-mobile-icon);
          min-width: var(--pagination-size-mobile-icon);
          min-height: var(--pagination-size-mobile-icon);
          max-width: var(--pagination-size-mobile-icon);
          max-height: var(--pagination-size-mobile-icon);
        }
      }
    }

    // 페이지 번호 버튼 그룹
    .pagination-numbers {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-wrap: wrap;
      justify-content: center;

      .pagination-page-btn {
        min-width: var(--pagination-size-page);
        min-height: var(--pagination-size-page);
        width: var(--pagination-size-page);
        height: var(--pagination-size-page);
        padding: 0;
        color: var(--nexa-text-primary);
        opacity: var(--pagination-opacity-center);
        font-size: var(--pagination-font-size);
        font-weight: 400;
        flex-shrink: 0;
        border-radius: var(--pagination-border-radius);

        &:hover {
          opacity: var(--pagination-opacity-hover);
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: var(--pagination-border-radius);
        }

        &.pagination-page-active {
          opacity: var(--pagination-opacity-active);
          background-color: rgba(65, 170, 223, 0.3);
          color: var(--nexa-ui-primary);
          font-weight: 600;
          border-radius: var(--pagination-border-radius);
        }

        @media (max-width: 768px) {
          min-width: var(--pagination-size-page-mobile);
          min-height: var(--pagination-size-page-mobile);
          width: var(--pagination-size-page-mobile);
          height: var(--pagination-size-page-mobile);
          font-size: var(--pagination-font-size-mobile);
        }
      }
    }
  }

  // 오른쪽: 페이지 정보
  .pagination-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    flex: 0 0 auto;
    flex-shrink: 0;
    margin-left: auto;

    .pagination-info {
      color: var(--nexa-text-primary);
      opacity: var(--pagination-opacity-side);
      font-size: var(--pagination-font-size);
      white-space: nowrap;
      flex-shrink: 0;

      @media (max-width: 600px) {
        display: none;
      }
    }
  }

  @media (max-width: 768px) {
    padding: 8px 12px;
    gap: 8px;
  }
}
</style>
