<template>
  <div class="error-tracking-content">
    <!-- 선택된 에러가 없을 때 -->
    <div v-if="!selectedError" class="empty-state q-pa-lg">
      <q-icon name="bug_report" size="80px" class="empty-icon q-mb-md" />
      <h3 class="empty-title">에러 트래킹</h3>
      <p class="empty-description">왼쪽 목록에서 에러를 선택하여 상세 정보를 확인하세요.</p>
      <div v-if="statistics.total > 0" class="statistics-summary q-mt-lg">
        <div class="stat-item">
          <span class="stat-label">총 에러:</span>
          <span class="stat-value">{{ statistics.total }}개</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">신규:</span>
          <span class="stat-value stat-value-new">{{ statistics.new }}개</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">오늘:</span>
          <span class="stat-value">{{ statistics.today }}개</span>
        </div>
      </div>
    </div>

    <!-- 선택된 에러 상세 정보 -->
    <div v-else class="error-detail q-pa-md">
      <!-- 에러 기본 정보 -->
      <div class="error-header q-mb-md">
        <div class="row items-center q-gutter-md">
          <q-icon :name="getErrorIcon(selectedError.level)" :class="getErrorIconClass(selectedError.level)" size="32px" />
          <div class="col">
            <h4 class="error-title">{{ selectedError.message || '에러 메시지 없음' }}</h4>
            <div class="error-meta q-mt-xs">
              <q-chip v-if="selectedError.type === 'lint'" class="chip-lint" size="sm" label="Lint" />
            </div>
          </div>
        </div>
        <div class="error-actions q-mt-md">
          <div class="row q-gutter-sm items-center justify-between">
            <!-- 메인 액션 버튼들 -->
            <div class="row q-gutter-sm items-center">
              <q-btn flat dense :icon="resolvedButtonIcon" :label="resolvedButtonLabel" :class="resolvedButtonClass" @click="handleResolved" />
              <q-btn flat dense icon="block" label="무시" class="btn-ignored" @click="handleIgnored" />
              <q-btn flat dense icon="delete" label="삭제" class="btn-delete" @click="handleDelete" />
              <q-separator vertical />
              <q-btn flat dense icon="content_copy" label="복사" class="btn-copy" @click="copyToClipboard" />
            </div>

            <!-- 전체적용 옵션 그룹 (우측) -->
            <div class="batch-apply-group row q-gutter-xs items-center">
              <q-separator vertical />
              <span class="text-caption text-weight-medium q-mr-xs batch-apply-label">전체 적용</span>

              <q-checkbox v-model="batchOptions.resolved" dense class="checkbox-resolved" @update:model-value="handleBatchOptionChange" />
              <span class="text-caption">해결</span>
              <q-btn v-if="batchOptions.resolved" flat dense size="xs" class="btn-batch-resolved" @click="batchMarkAsResolved" />

              <q-checkbox v-model="batchOptions.ignored" dense class="checkbox-ignored" @update:model-value="handleBatchOptionChange" />
              <span class="text-caption">무시</span>
              <q-btn v-if="batchOptions.ignored" flat dense size="xs" class="btn-batch-ignored" @click="batchMarkAsIgnored" />

              <q-checkbox v-model="batchOptions.deleted" dense class="checkbox-deleted" @update:model-value="handleBatchOptionChange" />
              <span class="text-caption">삭제</span>
              <q-btn v-if="batchOptions.deleted" flat dense size="xs" class="btn-batch-deleted" @click="batchDelete" />
            </div>
          </div>
        </div>
      </div>

      <!-- 에러 발생 통계 -->
      <div class="error-statistics q-pa-md q-mb-md">
        <h5 class="section-title q-mb-sm">
          <q-icon name="bar_chart" />
          발생 통계
        </h5>
        <div class="statistics-info">
          <div class="info-row">
            <span class="info-label">발생 횟수</span>
            <span class="info-value">{{ selectedError.count || 1 }}회</span>
          </div>
          <div v-if="selectedError.type" class="info-row">
            <span class="info-label">에러 타입</span>
            <span class="info-value">
              <q-chip v-if="selectedError.type === 'lint'" class="chip-lint" size="sm" label="Lint" />
              <span v-else class="text-caption">{{ selectedError.type }}</span>
            </span>
          </div>
          <div v-if="similarErrorsCount > 0" class="info-row">
            <span class="info-label">유사 에러</span>
            <span class="info-value">{{ similarErrorsCount }}개</span>
          </div>
          <div class="info-row">
            <span class="info-label">최초 발생</span>
            <span class="info-value time-value">
              <span class="time-relative">{{ formatTimeRelative(selectedError.timestamp) }}</span>
              <span class="time-absolute">{{ formatTimeAbsolute(selectedError.timestamp) }}</span>
            </span>
          </div>
          <div v-if="selectedError.count > 1" class="info-row">
            <span class="info-label">최근 발생</span>
            <span class="info-value time-value">
              <span class="time-relative">{{ formatTimeRelative(selectedError.timestamp) }}</span>
              <span class="time-absolute">{{ formatTimeAbsolute(selectedError.timestamp) }}</span>
            </span>
          </div>
          <div v-if="selectedError.count > 1" class="info-row">
            <span class="info-label">발생 기간</span>
            <span class="info-value">{{ formatDuration(selectedError.timestamp) }}</span>
          </div>
          <q-separator class="q-my-sm" />
          <div class="info-row info-row-no-margin">
            <span class="info-label">에러 레벨</span>
            <span class="info-value">
              <q-chip v-if="selectedError.level === 'error'" color="negative" text-color="white" size="sm" label="Error" />
              <q-chip v-else-if="selectedError.level === 'warning'" color="warning" text-color="white" size="sm" label="Warning" />
              <q-chip v-else-if="selectedError.level === 'unhandled'" color="negative" text-color="white" size="sm" label="Unhandled" />
              <span v-else class="text-caption">{{ selectedError.level || '알 수 없음' }}</span>
            </span>
          </div>
          <div class="info-row info-row-no-margin">
            <span class="info-label">상태</span>
            <span class="info-value">
              <q-chip v-if="selectedError.status === 'new'" class="chip-new" size="sm" label="신규" />
              <q-chip v-else-if="selectedError.status === 'resolved'" class="chip-resolved" size="sm" icon="check_circle" label="해결" />
              <q-chip v-else-if="selectedError.status === 'ignored'" class="chip-ignored" size="sm" label="무시" />
              <span v-else class="text-caption">알 수 없음</span>
            </span>
          </div>
        </div>
      </div>

      <!-- 에러 위치 정보 -->
      <div v-if="selectedError.file" class="error-location q-pa-md q-mb-md">
        <h5 class="section-title q-mb-sm">
          <q-icon name="location_on" />
          발생 위치
        </h5>
        <div class="location-info">
          <div class="info-row">
            <span class="info-label">파일:</span>
            <span class="info-value code">{{ selectedError.file }}</span>
          </div>
          <div v-if="selectedError.line" class="info-row">
            <span class="info-label">라인:</span>
            <span class="info-value">{{ selectedError.line }}</span>
            <span v-if="selectedError.column" class="info-value q-ml-sm">컬럼: {{ selectedError.column }}</span>
          </div>
        </div>
      </div>

      <!-- 스택 트레이스 -->
      <div v-if="selectedError.stack" class="error-stack q-pa-md q-mb-md">
        <h5 class="section-title q-mb-sm">
          <q-icon name="code" />
          스택 트레이스
        </h5>
        <pre class="stack-trace">{{ selectedError.stack }}</pre>
      </div>

      <!-- 네트워크 정보 (네트워크 에러인 경우) -->
      <div v-if="selectedError.networkInfo" class="error-network q-pa-md q-mb-md">
        <h5 class="section-title q-mb-sm">
          <q-icon name="cloud_off" />
          네트워크 정보
        </h5>
        <div class="network-info">
          <div class="info-row">
            <span class="info-label">요청 URL:</span>
            <span class="info-value code">{{ selectedError.networkInfo.requestUrl }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">메서드:</span>
            <span class="info-value">{{ selectedError.networkInfo.method || 'GET' }}</span>
          </div>
          <div v-if="selectedError.networkInfo.status" class="info-row">
            <span class="info-label">상태 코드:</span>
            <span class="info-value" :class="getStatusClass(selectedError.networkInfo.status)">{{ selectedError.networkInfo.status }} {{ selectedError.networkInfo.statusText || '' }}</span>
          </div>
          <div v-if="selectedError.networkInfo.error" class="info-row">
            <span class="info-label">에러:</span>
            <span class="info-value error-text">{{ selectedError.networkInfo.error }}</span>
          </div>
        </div>
      </div>

      <!-- 린트 정보 (린트 오류인 경우) -->
      <div v-if="selectedError.type === 'lint'" class="error-lint q-pa-md q-mb-md">
        <h5 class="section-title q-mb-sm">
          <q-icon name="code" />
          린트 정보
        </h5>
        <div class="lint-info">
          <div v-if="selectedError.ruleId" class="info-row">
            <span class="info-label">규칙 ID:</span>
            <span class="info-value code">{{ selectedError.ruleId }}</span>
          </div>
          <div v-if="selectedError.fixable" class="info-row">
            <span class="info-label">자동 수정 가능:</span>
            <span class="info-value success-text">예</span>
          </div>
        </div>
      </div>

      <!-- 컨텍스트 정보 -->
      <div class="error-context q-pa-md">
        <h5 class="section-title q-mb-sm">
          <q-icon name="info" />
          컨텍스트 정보
        </h5>
        <div class="context-info">
          <div v-if="selectedError.url" class="info-row">
            <span class="info-label">페이지 URL:</span>
            <span class="info-value">{{ selectedError.url }}</span>
          </div>
          <div v-if="selectedError.userAgent" class="info-row">
            <span class="info-label">User Agent:</span>
            <span class="info-value text-caption">{{ selectedError.userAgent }}</span>
          </div>
          <div v-if="selectedError.timestamp" class="info-row">
            <span class="info-label">발생 시간:</span>
            <span class="info-value">{{ formatTime(selectedError.timestamp) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// 선택된 에러 상태
const selectedError = ref(null)

// localStorage 키
const BATCH_OPTIONS_STORAGE_KEY = 'error-tracking-batch-options'

// 전체적용 옵션 (localStorage에서 불러오거나 기본값 true)
function loadBatchOptions() {
  try {
    const saved = localStorage.getItem(BATCH_OPTIONS_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        resolved: parsed.resolved ?? true, // 기본값 true
        ignored: parsed.ignored ?? true,
        deleted: parsed.deleted ?? true,
      }
    }
  } catch (error) {
    console.warn('[ErrorTracking] 저장된 체크박스 상태 불러오기 실패:', error)
  }
  // 저장된 값이 없으면 기본값 true
  return {
    resolved: true,
    ignored: true,
    deleted: true,
  }
}

// 전체적용 옵션
const batchOptions = ref(loadBatchOptions())

// 체크박스 상태 저장
function saveBatchOptions() {
  try {
    localStorage.setItem(BATCH_OPTIONS_STORAGE_KEY, JSON.stringify(batchOptions.value))
  } catch (error) {
    console.warn('[ErrorTracking] 체크박스 상태 저장 실패:', error)
  }
}

// 통계 정보 (임시)
const statistics = ref({
  total: 0,
  new: 0,
  resolved: 0,
  ignored: 0,
  today: 0,
})

// 에러 선택 이벤트 리스너
function handleErrorSelected(event) {
  selectedError.value = event.detail.error
  // 에러가 변경되어도 체크박스 상태는 유지 (저장된 값 사용)

  // 유사한 에러 개수 요청
  if (selectedError.value) {
    window.dispatchEvent(
      new CustomEvent('error-tracking-request-similar-count', {
        detail: { error: selectedError.value },
      }),
    )
  }
}

// 통계 업데이트 이벤트 리스너
function handleStatisticsUpdated(event) {
  statistics.value = event.detail
}

// 에러 아이콘
function getErrorIcon(level) {
  switch (level) {
    case 'error':
      return 'error'
    case 'warning':
      return 'warning'
    case 'unhandled':
      return 'cancel'
    default:
      return 'bug_report'
  }
}

// 에러 아이콘 클래스
function getErrorIconClass(level) {
  switch (level) {
    case 'error':
      return 'error-icon-error'
    case 'warning':
      return 'error-icon-warning'
    case 'unhandled':
      return 'error-icon-unhandled'
    default:
      return 'error-icon-default'
  }
}

// 상대 시간 포맷팅 (몇 분 전)
function formatTimeRelative(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  // 1분 이내
  if (diff < 60000) {
    return '방금 전'
  }

  // 1시간 이내
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}분 전`
  }

  // 24시간 이내
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}시간 전`
  }

  // 7일 이내
  if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}일 전`
  }

  return ''
}

// 절대 시간 포맷팅 (원본 시간)
function formatTimeAbsolute(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// 시간 포맷팅 (기존 호환성 유지)
function formatTime(timestamp) {
  if (!timestamp) return ''
  const relative = formatTimeRelative(timestamp)
  if (relative) {
    return relative
  }
  return formatTimeAbsolute(timestamp)
}

// 기간 포맷팅 (발생 기간 계산)
function formatDuration(timestamp) {
  if (!timestamp) return ''
  const now = Date.now()
  const diff = now - timestamp

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) {
    return `${days}일 ${hours}시간`
  } else if (hours > 0) {
    return `${hours}시간 ${minutes}분`
  } else {
    return `${minutes}분`
  }
}

// 상태 코드에 따른 클래스 반환
function getStatusClass(status) {
  if (status >= 500) return 'status-error'
  if (status >= 400) return 'status-warning'
  return ''
}

// 유사한 에러 개수 계산
const similarErrorsCount = computed(() => {
  if (!selectedError.value) {
    return 0
  }
  // 이벤트를 통해 유사한 에러 개수 받기
  return similarErrorsCountRef.value
})

const similarErrorsCountRef = ref(0)

// 해결 버튼 아이콘 (상태에 따라 동적 변경)
const resolvedButtonIcon = computed(() => {
  if (!selectedError.value) return 'check_circle'
  return selectedError.value.status === 'resolved' ? 'undo' : 'check_circle'
})

// 해결 버튼 라벨 (상태에 따라 동적 변경)
const resolvedButtonLabel = computed(() => {
  if (!selectedError.value) return '해결 처리'
  return selectedError.value.status === 'resolved' ? '해결 취소' : '해결 처리'
})

// 해결 버튼 클래스 (상태에 따라 동적 변경)
const resolvedButtonClass = computed(() => {
  if (!selectedError.value) return 'btn-resolved'
  return selectedError.value.status === 'resolved' ? 'btn-resolved btn-resolved-active' : 'btn-resolved'
})

// 에러 상태 변경 (토글 방식)
function handleResolved() {
  if (selectedError.value) {
    // ID가 없어도 error 객체를 전달하여 batchUpdateErrorStatus에서 찾도록 함
    const errorId = selectedError.value.id || null

    const includeSimilar = batchOptions.value.resolved
    // 현재 상태가 'resolved'면 'new'로, 아니면 'resolved'로 변경
    const newStatus = selectedError.value.status === 'resolved' ? 'new' : 'resolved'

    window.dispatchEvent(
      new CustomEvent('error-tracking-status-update', {
        detail: {
          errorId,
          status: newStatus,
          includeSimilar,
          error: selectedError.value, // ID가 없을 때 찾기 위해 error 객체도 전달
        },
      }),
    )
    selectedError.value.status = newStatus
    // 체크박스 상태는 유지 (저장된 설정 유지)
  }
}

function handleIgnored() {
  if (selectedError.value) {
    const includeSimilar = batchOptions.value.ignored
    window.dispatchEvent(
      new CustomEvent('error-tracking-status-update', {
        detail: {
          errorId: selectedError.value.id || null,
          status: 'ignored',
          includeSimilar,
          error: selectedError.value, // ID가 없을 때 찾기 위해 error 객체도 전달
        },
      }),
    )
    selectedError.value.status = 'ignored'
    // 체크박스 상태는 유지 (저장된 설정 유지)
  }
}

function handleDelete() {
  if (selectedError.value) {
    const includeSimilar = batchOptions.value.deleted
    if (includeSimilar) {
      $q.dialog({
        title: '일괄 삭제 확인',
        message: '유사한 에러를 모두 삭제하시겠습니까?',
        cancel: true,
        persistent: true,
      }).onOk(() => {
        window.dispatchEvent(
          new CustomEvent('error-tracking-delete', {
            detail: {
              errorId: selectedError.value.id || null,
              includeSimilar: true,
              error: selectedError.value, // ID가 없을 때 찾기 위해 error 객체도 전달
            },
          }),
        )
        selectedError.value = null
        // 체크박스 상태는 유지 (저장된 설정 유지)
        $q.notify({
          type: 'positive',
          message: '유사한 에러가 모두 삭제되었습니다.',
          position: 'top',
        })
      })
    } else {
      window.dispatchEvent(
        new CustomEvent('error-tracking-delete', {
          detail: {
            errorId: selectedError.value.id || null,
            includeSimilar: false,
            error: selectedError.value, // ID가 없을 때 찾기 위해 error 객체도 전달
          },
        }),
      )
      selectedError.value = null
    }
  }
}

// 전체적용 옵션 변경 핸들러
function handleBatchOptionChange() {
  // 체크박스 상태 변경 시 localStorage에 저장
  saveBatchOptions()
}

// 일괄 작업 함수들
function batchMarkAsResolved() {
  if (selectedError.value) {
    window.dispatchEvent(
      new CustomEvent('error-tracking-status-update', {
        detail: {
          errorId: selectedError.value.id || null,
          status: 'resolved',
          includeSimilar: true,
          error: selectedError.value, // ID가 없을 때 찾기 위해 error 객체도 전달
        },
      }),
    )
    selectedError.value.status = 'resolved'
    // 체크박스 상태는 유지 (저장된 설정 유지)
    $q.notify({
      type: 'positive',
      message: '유사한 에러가 모두 해결됨으로 표시되었습니다.',
      position: 'top',
    })
  }
}

function batchMarkAsIgnored() {
  if (selectedError.value) {
    window.dispatchEvent(
      new CustomEvent('error-tracking-status-update', {
        detail: {
          errorId: selectedError.value.id || null,
          status: 'ignored',
          includeSimilar: true,
          error: selectedError.value, // ID가 없을 때 찾기 위해 error 객체도 전달
        },
      }),
    )
    selectedError.value.status = 'ignored'
    // 체크박스 상태는 유지 (저장된 설정 유지)
    $q.notify({
      type: 'info',
      message: '유사한 에러가 모두 무시됨으로 표시되었습니다.',
      position: 'top',
    })
  }
}

function batchDelete() {
  if (selectedError.value) {
    $q.dialog({
      title: '일괄 삭제 확인',
      message: '유사한 에러를 모두 삭제하시겠습니까?',
      cancel: true,
      persistent: true,
    }).onOk(() => {
      window.dispatchEvent(
        new CustomEvent('error-tracking-delete', {
          detail: {
            errorId: selectedError.value.id || null,
            includeSimilar: true,
            error: selectedError.value, // ID가 없을 때 찾기 위해 error 객체도 전달
          },
        }),
      )
      selectedError.value = null
      // 체크박스 상태는 유지 (저장된 설정 유지)
      $q.notify({
        type: 'positive',
        message: '유사한 에러가 모두 삭제되었습니다.',
        position: 'top',
      })
    })
  }
}

// 클립보드 복사 함수들
function copyToClipboard() {
  if (!selectedError.value) return

  const errorText = formatErrorForClipboard(selectedError.value)
  copyTextToClipboard(errorText)
  $q.notify({
    type: 'positive',
    message: '클립보드에 복사되었습니다.',
    position: 'top',
    timeout: 1000,
  })
}

function formatErrorForClipboard(error) {
  let text = `에러 정보\n`
  text += `==========\n\n`
  text += `메시지: ${error.message || '없음'}\n`
  text += `레벨: ${error.level || '없음'}\n`
  text += `상태: ${error.status || '없음'}\n`
  text += `발생 시간: ${formatTime(error.timestamp)}\n\n`

  if (error.file) {
    text += `발생 위치\n`
    text += `----------\n`
    text += `파일: ${error.file}\n`
    if (error.line) text += `라인: ${error.line}\n`
    if (error.column) text += `컬럼: ${error.column}\n`
    text += `\n`
  }

  if (error.stack) {
    text += `스택 트레이스\n`
    text += `----------\n`
    text += `${error.stack}\n\n`
  }

  if (error.url) {
    text += `컨텍스트\n`
    text += `----------\n`
    text += `페이지 URL: ${error.url}\n`
    if (error.userAgent) text += `User Agent: ${error.userAgent}\n`
    text += `\n`
  }

  if (error.networkInfo) {
    text += `네트워크 정보\n`
    text += `----------\n`
    text += `요청 URL: ${error.networkInfo.requestUrl || '없음'}\n`
    text += `메서드: ${error.networkInfo.method || 'GET'}\n`
    if (error.networkInfo.status) {
      text += `상태 코드: ${error.networkInfo.status} ${error.networkInfo.statusText || ''}\n`
    }
    text += `\n`
  }

  return text
}

function copyTextToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch((err) => {
      console.error('클립보드 복사 실패:', err)
      fallbackCopyTextToClipboard(text)
    })
  } else {
    fallbackCopyTextToClipboard(text)
  }
}

function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.position = 'fixed'
  textArea.style.left = '-999999px'
  textArea.style.top = '-999999px'
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  try {
    document.execCommand('copy')
  } catch (err) {
    console.error('클립보드 복사 실패:', err)
  }
  document.body.removeChild(textArea)
}

// 유사한 에러 개수 업데이트 이벤트 리스너
function handleSimilarErrorsCount(event) {
  similarErrorsCountRef.value = event.detail.count || 0
}

onMounted(() => {
  window.addEventListener('error-tracking-error-selected', handleErrorSelected)
  window.addEventListener('error-tracking-statistics-updated', handleStatisticsUpdated)
  window.addEventListener('error-tracking-similar-errors-count', handleSimilarErrorsCount)

  // 선택된 에러가 변경될 때마다 유사한 에러 개수 요청
  if (selectedError.value) {
    window.dispatchEvent(
      new CustomEvent('error-tracking-request-similar-count', {
        detail: { error: selectedError.value },
      }),
    )
  }
})

onUnmounted(() => {
  window.removeEventListener('error-tracking-error-selected', handleErrorSelected)
  window.removeEventListener('error-tracking-statistics-updated', handleStatisticsUpdated)
  window.removeEventListener('error-tracking-similar-errors-count', handleSimilarErrorsCount)
})
</script>

<style lang="scss" scoped>
.error-tracking-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--nexa-background);
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.empty-title {
  color: var(--nexa-text-primary);
  font-size: 2rem;
  font-weight: 600;
  margin: 1rem 0;
}

.empty-description {
  color: var(--nexa-text-secondary);
  font-size: 1rem;
  margin: 0;
}

.statistics-summary {
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.stat-label {
  color: var(--nexa-text-secondary);
  font-size: 0.875rem;
}

.stat-value {
  color: var(--nexa-text-primary);
  font-size: 1.5rem;
  font-weight: 600;
}

.error-detail {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.error-header {
  border-bottom: 2px solid var(--nexa-border-color);
  padding-bottom: 1rem;
}

.error-title {
  color: var(--nexa-text-primary);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  word-break: break-word;
}

.error-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.error-actions {
  margin-top: 1rem;
}

.batch-apply-group {
  padding-left: 0.5rem;
}

.error-location,
.error-stack,
.error-network,
.error-context {
  background-color: var(--nexa-surface);
  border-radius: 4px;
  border: 1px solid var(--nexa-border-color);
}

.network-info {
  margin-top: 1rem;
}

.section-title {
  color: var(--nexa-text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.location-info,
.context-info {
  margin-top: 1rem;
}

.info-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.5rem;

  &.info-row-no-margin {
    margin-bottom: 0;
  }
}

.info-label {
  color: var(--nexa-text-secondary);
  font-weight: 500;
  min-width: 80px;
}

.info-value {
  color: var(--nexa-text-primary);
  flex: 1;
  word-break: break-all;

  &.code {
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
    background-color: var(--nexa-surface);
    padding: 0.25rem 0.5rem;
    border-radius: 3px;
  }

  &.time-value {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: space-between;
  }
}

.time-relative {
  color: var(--nexa-text-primary);
  font-size: 0.9em;
}

.time-absolute {
  color: var(--nexa-text-secondary);
  font-size: 0.85em;
  font-family: monospace;
}

.stack-trace {
  background-color: var(--nexa-background);
  color: var(--nexa-text-primary);
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid var(--nexa-border-color);
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
}

// ============================================
// 아이콘 색상
// ============================================
.empty-icon {
  color: var(--nexa-text-secondary);
}

.error-icon-error {
  color: var(--nexa-error);
}

.error-icon-warning {
  color: var(--nexa-warning);
}

.error-icon-unhandled {
  color: var(--nexa-error);
}

.error-icon-default {
  color: var(--nexa-text-secondary);
}

// ============================================
// 칩 색상
// ============================================
.chip-lint {
  background-color: var(--nexa-accent);
  color: var(--nexa-text-primary);
}

.chip-new {
  background-color: var(--nexa-error);
  color: var(--nexa-text-primary);
}

.chip-resolved {
  background-color: var(--nexa-primary);
  color: var(--nexa-text-dark);
  padding: 12px 14px 10px 6px;
  border-radius: 12px;

  :deep(.q-chip__content) {
    color: var(--nexa-text-dark) !important;
  }

  :deep(.q-icon) {
    color: var(--nexa-text-dark) !important;
  }
}

.chip-ignored {
  background-color: var(--nexa-text-secondary);
  color: var(--nexa-text-primary);
}

.chip-similar {
  background-color: var(--nexa-accent);
  color: var(--nexa-text-primary);
}

// ============================================
// 버튼 색상
// ============================================
.btn-resolved {
  color: var(--nexa-primary);
}

.btn-resolved:hover {
  background-color: var(--nexa-surface-hover);
}

.btn-resolved-active {
  color: var(--nexa-warning);
}

.btn-resolved-active:hover {
  background-color: var(--nexa-surface-hover);
}

.btn-ignored {
  color: var(--nexa-text-secondary);
}

.btn-ignored:hover {
  background-color: var(--nexa-surface-hover);
}

.btn-delete {
  color: var(--nexa-warning);
}

.btn-delete:hover {
  background-color: var(--nexa-surface-hover);
}

.btn-copy {
  color: var(--nexa-primary);
}

.btn-copy:hover {
  background-color: var(--nexa-surface-hover);
}

.btn-batch-resolved {
  color: var(--nexa-primary);
}

.btn-batch-ignored {
  color: var(--nexa-text-secondary);
}

.btn-batch-deleted {
  color: var(--nexa-error);
}

// ============================================
// 체크박스 색상
// ============================================
.checkbox-resolved {
  :deep(.q-checkbox__inner) {
    color: var(--nexa-primary);
  }
}

.checkbox-ignored {
  :deep(.q-checkbox__inner) {
    color: var(--nexa-text-secondary);
  }
}

.checkbox-deleted {
  :deep(.q-checkbox__inner) {
    color: var(--nexa-error);
  }
}

// ============================================
// 텍스트 색상
// ============================================
.error-time {
  color: var(--nexa-text-secondary);
}

.error-count {
  color: var(--nexa-error-text);
}

.stat-value-new {
  color: var(--nexa-error-text);
}

.error-text {
  color: var(--nexa-error-text);
}

.success-text {
  color: var(--nexa-primary);
}

.status-error {
  color: var(--nexa-error-text);
}

.status-warning {
  color: var(--nexa-warning);
}

.batch-apply-label {
  color: var(--nexa-text-primary);
}
</style>
