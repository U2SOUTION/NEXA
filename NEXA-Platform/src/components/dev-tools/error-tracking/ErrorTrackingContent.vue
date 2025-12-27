<template>
  <div class="error-tracking-content">
    <!-- 선택된 에러가 없을 때 -->
    <div v-if="!selectedError" class="dashboard-view q-pa-md">
      <!-- 대시보드 타이틀 -->
      <div class="dashboard-header q-mb-lg">
        <h2 class="dashboard-title">에러 트래킹 대시보드</h2>
        <p class="dashboard-subtitle">수집된 에러의 통계 및 분석 정보를 확인할 수 있습니다</p>
      </div>

      <!-- 통계 카드 -->
      <div class="statistics-cards q-mb-lg">
        <q-card class="stat-card">
          <q-card-section>
            <div class="stat-card-header">
              <q-icon name="bug_report" size="32px" />
              <div class="stat-card-content">
                <div class="stat-card-label">총 에러</div>
                <div class="stat-card-value">{{ statistics.total }}개</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
        <q-card class="stat-card">
          <q-card-section>
            <div class="stat-card-header">
              <q-icon name="new_releases" size="32px" />
              <div class="stat-card-content">
                <div class="stat-card-label">신규</div>
                <div class="stat-card-value stat-value-new">{{ statistics.new }}개</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
        <q-card class="stat-card">
          <q-card-section>
            <div class="stat-card-header">
              <q-icon name="check_circle" size="32px" />
              <div class="stat-card-content">
                <div class="stat-card-label">해결</div>
                <div class="stat-card-value stat-value-resolved">{{ statistics.resolved }}개</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
        <q-card class="stat-card">
          <q-card-section>
            <div class="stat-card-header">
              <q-icon name="today" size="32px" />
              <div class="stat-card-content">
                <div class="stat-card-label">오늘</div>
                <div class="stat-card-value">{{ statistics.today }}개</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 차트 섹션 -->
      <div v-if="statistics.total > 0" class="charts-section q-mb-lg">
        <div class="charts-grid">
          <!-- 에러 발생 추이 차트 -->
          <div class="chart-card">
            <NexaChart v-if="errorTrendChartData.length > 0" type="line" :data="errorTrendChartData" title="에러 발생 추이" title-icon="trending_up" :options="{ animation: true, showLabels: true }" :on-refresh="handleRefreshErrors">
              <template #title-right="{ isRefreshing, handleRefresh }">
                <q-chip size="sm">
                  {{ errorTrendChartData.length }}일간
                  <q-tooltip>최근 7일간 에러 발생 추이 데이터 포인트 수</q-tooltip>
                </q-chip>
                <q-btn flat dense icon="refresh" size="sm" :loading="isRefreshing" @click="handleRefresh" />
              </template>
            </NexaChart>
            <div v-else class="text-center q-pa-lg text-grey-7">데이터가 없습니다.</div>
          </div>

          <!-- 에러 유형별 분포 차트 -->
          <div class="chart-card">
            <NexaChart v-if="errorTypeChartData.length > 0" type="pie" :data="errorTypeChartData" title="에러 유형별 분포" title-icon="pie_chart" :margin="{ top: 0, right: 10, bottom: 10, left: 10 }" :options="{ animation: true, showLabels: true }" :on-refresh="handleRefreshErrors">
              <template #title-right="{ isRefreshing, handleRefresh }">
                <q-chip size="sm">
                  {{ errorTypeChartData.length }}개
                  <q-tooltip>에러 유형별 분포 데이터 포인트 수</q-tooltip>
                </q-chip>
                <q-btn flat dense icon="refresh" size="sm" :loading="isRefreshing" @click="handleRefresh" />
              </template>
            </NexaChart>
            <div v-else class="text-center q-pa-lg text-grey-7">데이터가 없습니다.</div>
          </div>
        </div>
      </div>

      <!-- 다이어그램 섹션 -->
      <div v-if="statistics.total > 0 && diagramData.nodes && diagramData.nodes.length > 0" class="diagram-section q-mb-lg">
        <div class="text-h6 q-mb-md">
          <q-icon name="account_tree" class="q-mr-sm" />
          에러 의존성 다이어그램
        </div>
        <div ref="diagramContainer" class="error-dependency-diagram"></div>
      </div>

      <!-- 안내 메시지 -->
      <div v-if="statistics.total === 0" class="empty-state q-pa-lg text-center">
        <q-icon name="bug_report" size="80px" class="empty-icon q-mb-md" />
        <h3 class="empty-title">에러 트래킹</h3>
        <p class="empty-description">현재 수집된 에러가 없습니다.</p>
        <p class="empty-description">왼쪽 목록에서 에러를 선택하여 상세 정보를 확인하세요.</p>
      </div>
    </div>

    <!-- 선택된 에러 상세 정보 -->
    <div v-else class="error-detail q-pa-md">
      <!-- 에러 기본 정보 -->
      <div class="error-header q-mb-md">
        <div class="row items-center q-gutter-md">
          <q-icon :name="getErrorIcon(selectedError)" :class="getErrorIconClass()" size="32px" />
          <div class="col">
            <h4 class="error-title">{{ selectedError.message || '에러 메시지 없음' }}</h4>
            <div class="error-meta q-mt-xs">
              <q-chip v-if="selectedError.type === 'lint'" size="sm" label="Lint" />
            </div>
          </div>
        </div>
        <div class="error-actions q-mt-md">
          <div class="row q-gutter-sm items-center justify-between">
            <!-- 메인 액션 버튼들 -->
            <div class="row q-gutter-sm items-center">
              <q-btn flat dense :icon="resolvedButtonIcon" :label="resolvedButtonLabel" @click="handleResolved" />
              <q-btn flat dense :icon="ignoredButtonIcon" :label="ignoredButtonLabel" @click="handleIgnored" />
              <q-btn flat dense icon="delete" label="삭제" @click="handleDelete" />
              <q-separator vertical />
              <q-btn flat dense icon="content_copy" label="정보 복사" @click="copyToClipboard">
                <q-tooltip>에러의 전체 정보를 상세한 형식으로 클립보드에 복사합니다</q-tooltip>
              </q-btn>
            </div>

            <!-- 전체적용 옵션 그룹 (우측) -->
            <div class="batch-apply-group row q-gutter-xs items-center">
              <q-separator vertical />
              <span class="text-caption text-weight-medium q-mr-xs batch-apply-label">전체 적용</span>

              <q-checkbox v-model="batchOptions.resolved" dense @update:model-value="handleBatchOptionChange" />
              <span class="text-caption">해결</span>
              <q-btn v-if="batchOptions.resolved" flat dense size="xs" @click="batchMarkAsResolved" />

              <q-checkbox v-model="batchOptions.ignored" dense @update:model-value="handleBatchOptionChange" />
              <span class="text-caption">무시</span>
              <q-btn v-if="batchOptions.ignored" flat dense size="xs" @click="batchMarkAsIgnored" />

              <q-checkbox v-model="batchOptions.deleted" dense @update:model-value="handleBatchOptionChange" />
              <span class="text-caption">삭제</span>
              <q-btn v-if="batchOptions.deleted" flat dense size="xs" @click="batchDelete" />
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
              <q-chip v-if="selectedError.type === 'lint'" size="sm" label="Lint" />
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
            <span class="info-label">에러 타입</span>
            <span class="info-value">
              <q-icon :name="getErrorIcon(selectedError)" :color="getErrorColor(selectedError)" size="20px" class="q-mr-xs" />
              <span>{{ getErrorTypeLabel(selectedError) }}</span>
            </span>
          </div>
          <div class="info-row info-row-no-margin">
            <span class="info-label">상태</span>
            <span class="info-value">
              <q-icon :name="getStatusIcon(selectedError.status)" :color="getStatusColor(selectedError.status)" size="20px" class="q-mr-xs" />
              <span>{{ getStatusLabel(selectedError.status) }}</span>
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
            <span class="info-value code">{{ normalizedFilePath || selectedError.file }}</span>
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
        <pre class="stack-trace">{{ normalizedStack || selectedError.stack }}</pre>
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
            <span class="info-value">{{ selectedError.networkInfo.status }} {{ selectedError.networkInfo.statusText || '' }}</span>
          </div>
          <div v-if="selectedError.networkInfo.error" class="info-row">
            <span class="info-label">에러:</span>
            <span class="info-value">{{ selectedError.networkInfo.error }}</span>
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
            <span class="info-value">예</span>
          </div>
        </div>
      </div>

      <!-- 컨텍스트 정보 -->
      <div class="error-context q-pa-md q-mb-md">
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

      <!-- 원인 및 해결법 메모 -->
      <div class="error-notes q-pa-md q-mb-md">
        <div class="section-header q-mb-sm">
          <h5 class="section-title">
            <q-icon name="lightbulb" />
            원인 및 해결법
          </h5>
          <div class="row q-gutter-xs">
            <q-btn flat dense icon="content_copy" size="sm" label="AI 분석용 복사" @click="handleCopyContextForAI">
              <q-tooltip>AI 분석용 에러 컨텍스트를 @error-ref 형식으로 클립보드에 복사합니다 (Cursor에서 사용)</q-tooltip>
            </q-btn>
          </div>
        </div>

        <q-tabs v-model="notesTab" class="notes-tabs">
          <q-tab name="cause" label="원인 분석" icon="bug_report" />
          <q-tab name="solution" label="해결 방법" icon="build" />
          <q-tab name="learned" label="학습 내용" icon="school" />
          <q-tab name="references" label="참고 자료" icon="link" />
        </q-tabs>

        <q-tab-panels v-model="notesTab" class="notes-panels">
          <q-tab-panel name="cause">
            <div class="notes-editor">
              <q-input :model-value="errorNotes.cause || ''" @update:model-value="handleNotesChange('cause', $event)" type="textarea" placeholder="에러 발생 원인을 분석해주세요..." rows="5" class="notes-textarea" @blur="handleSaveNotes" />
              <div v-if="errorNotes.updatedBy === 'ai'" class="notes-meta q-mt-xs">
                <q-icon name="auto_awesome" size="xs" />
                <span class="text-caption">AI가 생성한 내용</span>
              </div>
            </div>
          </q-tab-panel>

          <q-tab-panel name="solution">
            <div class="notes-editor">
              <q-input :model-value="errorNotes.solution || ''" @update:model-value="handleNotesChange('solution', $event)" type="textarea" placeholder="에러 해결 방법을 기록해주세요..." rows="5" class="notes-textarea" @blur="handleSaveNotes" />
            </div>
          </q-tab-panel>

          <q-tab-panel name="learned">
            <div class="notes-editor">
              <q-input :model-value="errorNotes.learned || ''" @update:model-value="handleNotesChange('learned', $event)" type="textarea" placeholder="이 에러를 통해 배운 내용을 기록해주세요..." rows="5" class="notes-textarea" @blur="handleSaveNotes" />
            </div>
          </q-tab-panel>

          <q-tab-panel name="references">
            <div class="notes-editor">
              <div v-for="(ref, index) in errorNotes.references || []" :key="index" class="reference-item q-mb-sm">
                <q-input :model-value="ref" @update:model-value="handleReferenceChange(index, $event)" placeholder="참고 자료 URL 또는 설명" @blur="handleSaveNotes">
                  <template #append>
                    <q-btn flat dense icon="delete" size="sm" @click="handleRemoveReference(index)" />
                  </template>
                </q-input>
              </div>
              <q-btn flat dense icon="add" label="참고 자료 추가" @click="handleAddReference" class="q-mt-sm" />
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </div>

      <!-- 에러 분석 문서 -->
      <div class="error-analysis-docs q-pa-md q-mb-md">
        <h5 class="section-title q-mb-sm">
          <q-icon name="description" />
          에러 분석 문서
          <q-chip v-if="tempDocumentCount > 1" size="sm" class="q-ml-sm"> {{ tempDocumentCount }}개 </q-chip>
        </h5>

        <!-- 문서가 1개면 바로 표시 -->
        <div v-if="tempDocumentCount === 1" class="analysis-doc-preview">
          <q-card>
            <q-card-section>
              <div class="text-h6">{{ tempDocumentTitle }}</div>
              <div class="text-caption q-mt-xs">작성일: {{ tempDocumentDate }}</div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div class="markdown-content">
                <p class="text-body2">이 영역에 마크다운 렌더링된 문서 내용이 표시됩니다.</p>
                <p class="text-caption text-grey-6">기능은 Phase 5에서 구현됩니다</p>
              </div>
            </q-card-section>
            <q-card-actions>
              <q-btn flat label="문서 뷰어에서 열기" icon="open_in_new" @click="handleOpenInDocumentViewer" />
            </q-card-actions>
          </q-card>
        </div>

        <!-- 여러 개면 리스트 -->
        <q-list v-else-if="tempDocumentCount > 1">
          <q-item v-for="(doc, index) in tempDocuments" :key="index" clickable @click="handleSelectDocument(doc)">
            <q-item-section>
              <q-item-label>{{ doc.title }}</q-item-label>
              <q-item-label caption>
                {{ doc.date }}
                <span v-if="doc.tags && doc.tags.length" class="q-ml-sm">
                  <q-chip v-for="tag in doc.tags" :key="tag" size="xs">
                    {{ tag }}
                  </q-chip>
                </span>
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn flat dense icon="open_in_new" @click.stop="handleOpenInDocumentViewer" />
            </q-item-section>
          </q-item>
        </q-list>

        <!-- 문서가 없을 때 안내 -->
        <div v-else class="error-analysis-empty text-center">
          <q-icon name="description" size="48px" class="q-mb-sm" />
          <div class="text-body2">이 에러에 대한 분석 문서가 없습니다.</div>
          <div class="text-caption q-mt-xs">Cursor에서 에러를 분석하여 문서를 생성하세요.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import NexaChart from 'src/charts/NexaChart.vue'
import * as d3 from 'd3'
import { useErrorTracking } from 'src/composables/dev-tools/useErrorTracking.js'
import { classifyErrorType, getErrorIcon, getErrorColor, getErrorTypeLabel, getErrorTypeChartLabel } from 'src/utils/error-tracking/errorTypeClassifier.js'
import { normalizeFilePathForAI, normalizeStackForAI } from 'src/utils/error-tracking/pathNormalizer.js'
import { formatTimeRelative, formatTimeAbsolute, formatTime, formatDuration } from 'src/utils/error-tracking/timeFormatter.js'
import { copyTextToClipboard } from 'src/utils/clipboard.js'

const $q = useQuasar()

// 에러 트래킹 composable
const { selectedError, saveErrorNotes, errors } = useErrorTracking()

// 메모 탭 상태
const notesTab = ref('cause')

// 메모 데이터 (computed로 selectedError의 notes와 동기화)
// 정규화된 파일 경로 (UI 표시용)
const normalizedFilePath = computed(() => {
  if (!selectedError.value?.file) return null
  return normalizeFilePathForAI(selectedError.value.file)
})

// 정규화된 스택 트레이스 (UI 표시용)
const normalizedStack = computed(() => {
  if (!selectedError.value?.stack) return null
  return normalizeStackForAI(selectedError.value.stack)
})

const errorNotes = computed({
  get: () => {
    if (!selectedError.value) {
      return {
        cause: '',
        solution: '',
        learned: '',
        references: [],
        updatedAt: null,
        updatedBy: null,
      }
    }
    return (
      selectedError.value.notes || {
        cause: null,
        solution: null,
        learned: null,
        references: [],
        updatedAt: null,
        updatedBy: null,
      }
    )
  },
  set: () => {
    // computed setter는 사용하지 않음 (직접 저장 함수 사용)
  },
})

// Phase 1: 문서 표시용 임시 데이터
const tempDocumentCount = ref(0) // 0: 없음, 1: 1개, 2+: 여러 개
const tempDocumentTitle = ref('Vue ref 초기화 에러 분석')
const tempDocumentDate = ref('2024-12-20 10:30:00')
const tempDocuments = ref([
  {
    title: 'Vue ref 초기화 에러 분석',
    date: '2024-12-20 10:30:00',
    tags: ['vue', 'ref', '초기화'],
  },
  {
    title: '네트워크 요청 타임아웃 분석',
    date: '2024-12-20 11:00:00',
    tags: ['network', 'timeout'],
  },
])

// 에러 목록은 useErrorTracking()에서 가져옴 (위에서 이미 선언됨)

// 다이어그램 컨테이너
const diagramContainer = ref(null)
let diagramSvg = null
let diagramSimulation = null

// localStorage 키 (새 네임스페이스)
const BATCH_OPTIONS_STORAGE_KEY = 'tracking-error:batch-options'
// 기존 키 (마이그레이션용)
const OLD_BATCH_OPTIONS_KEYS = ['error-tracking-batch-options']

// 전체적용 옵션 (localStorage에서 불러오거나 기본값 true)
function loadBatchOptions() {
  try {
    let saved = localStorage.getItem(BATCH_OPTIONS_STORAGE_KEY)

    // 새 키에 데이터가 없으면 기존 키에서 마이그레이션 시도
    if (!saved) {
      for (const oldKey of OLD_BATCH_OPTIONS_KEYS) {
        try {
          const oldData = localStorage.getItem(oldKey)
          if (oldData) {
            // 새 키로 저장
            localStorage.setItem(BATCH_OPTIONS_STORAGE_KEY, oldData)
            // 기존 키 삭제
            localStorage.removeItem(oldKey)
            saved = oldData
            break
          }
        } catch {
          // 마이그레이션 실패 시 무시
        }
      }
    }

    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        resolved: parsed.resolved ?? true, // 기본값 true
        ignored: parsed.ignored ?? true,
        deleted: parsed.deleted ?? true,
      }
    }
  } catch {
    // 저장된 상태 불러오기 실패 시 기본값 사용
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
  } catch {
    // 체크박스 상태 저장 실패 시 무시
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

// 에러 목록 업데이트 이벤트 리스너
function handleErrorsUpdated(event) {
  const eventErrors = event.detail.errors || event.detail || []

  // errors 배열 업데이트
  if (Array.isArray(eventErrors)) {
    errors.value = eventErrors
  }
}

// 에러 발생 추이 차트 데이터 (최근 7일)
const errorTrendChartData = computed(() => {
  if (errors.value.length === 0) {
    return []
  }

  const now = Date.now()
  const days = 7
  const dayMs = 24 * 60 * 60 * 1000
  const data = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now - i * dayMs)
    const dayStartDate = new Date(date)
    dayStartDate.setHours(0, 0, 0, 0)
    const dayStart = dayStartDate.getTime()
    const dayEnd = dayStart + dayMs

    const count = errors.value.filter((error) => {
      const errorTime = new Date(error.timestamp).getTime()
      return errorTime >= dayStart && errorTime < dayEnd
    }).length

    data.push({
      x: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
      y: count,
    })
  }

  return data
})

// 에러 유형별 분포 차트 데이터
const errorTypeChartData = computed(() => {
  if (errors.value.length === 0) {
    return []
  }

  const typeCounts = {
    error: 0,
    warning: 0,
    unhandled: 0,
    lint: 0,
    typeError: 0,
    referenceError: 0,
    networkError: 0,
    promiseRejection: 0,
  }

  // 공통 분류 함수 사용
  errors.value.forEach((error) => {
    const errorType = classifyErrorType(error)
    typeCounts[errorType] = (typeCounts[errorType] || 0) + 1
  })

  const result = Object.entries(typeCounts)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => ({
      x: getErrorTypeChartLabel(type),
      y: count,
    }))

  return result
})

// 다이어그램 데이터 (에러 의존성)
const diagramData = computed(() => {
  if (errors.value.length === 0) {
    return { nodes: [], edges: [] }
  }

  // 파일별로 에러 그룹화
  const fileErrors = {}
  errors.value.forEach((error) => {
    const file = error.file || 'unknown'
    if (!fileErrors[file]) {
      fileErrors[file] = []
    }
    fileErrors[file].push(error)
  })

  // 노드 생성 (파일별, 최대 20개)
  const fileEntries = Object.entries(fileErrors).slice(0, 20)
  const nodes = fileEntries.map(([file, fileErrorList], index) => ({
    id: `file-${index}`,
    label: file.split('/').pop() || file,
    type: 'file',
    count: fileErrorList.length,
    file: file,
  }))

  // 에지 생성 (파일 간 연관성 - 같은 에러 메시지를 가진 파일들)
  const edges = []
  const messageToFiles = {}
  errors.value.forEach((error) => {
    const message = error.message || 'unknown'
    const file = error.file || 'unknown'
    if (!messageToFiles[message]) {
      messageToFiles[message] = new Set()
    }
    messageToFiles[message].add(file)
  })

  Object.values(messageToFiles).forEach((fileSet) => {
    const fileArray = Array.from(fileSet)
    if (fileArray.length > 1) {
      // 같은 메시지를 가진 파일들을 연결
      for (let i = 0; i < fileArray.length - 1; i++) {
        const sourceNode = nodes.find((n) => n.file === fileArray[i])
        const targetNode = nodes.find((n) => n.file === fileArray[i + 1])
        if (sourceNode && targetNode) {
          edges.push({
            id: `edge-${sourceNode.id}-${targetNode.id}`,
            source: sourceNode.id,
            target: targetNode.id,
            type: 'related',
          })
        }
      }
    }
  })

  return { nodes, edges }
})

// 다이어그램 렌더링
function renderDiagram() {
  if (!diagramContainer.value || !diagramData.value.nodes || diagramData.value.nodes.length === 0) {
    return
  }

  // 기존 다이어그램 제거
  d3.select(diagramContainer.value).selectAll('*').remove()

  const width = diagramContainer.value.clientWidth || 800
  const height = 400

  // CSS 변수에서 색상 가져오기
  const root = getComputedStyle(document.documentElement)
  const borderColor = root.getPropertyValue('--nexa-border-color').trim() || '#666'
  const primaryColor = root.getPropertyValue('--nexa-primary').trim() || '#1976d2'
  const textColor = root.getPropertyValue('--nexa-text-primary').trim() || '#fff'

  // SVG 생성
  diagramSvg = d3.select(diagramContainer.value).append('svg').attr('width', width).attr('height', height)

  // 시뮬레이션 생성
  diagramSimulation = d3
    .forceSimulation(diagramData.value.nodes)
    .force(
      'link',
      d3
        .forceLink(diagramData.value.edges)
        .id((d) => d.id)
        .distance(100),
    )
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))

  // 링크 그리기
  const link = diagramSvg.append('g').selectAll('line').data(diagramData.value.edges).enter().append('line').attr('stroke', borderColor).attr('stroke-width', 2).attr('opacity', 0.6)

  // 노드 그리기
  const node = diagramSvg.append('g').selectAll('g').data(diagramData.value.nodes).enter().append('g').attr('class', 'diagram-node').call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended))

  // 노드 원
  node
    .append('circle')
    .attr('r', (d) => Math.max(15, Math.min(35, 15 + d.count * 2)))
    .attr('fill', primaryColor)
    .attr('stroke', borderColor)
    .attr('stroke-width', 2)
    .style('cursor', 'pointer')
    .on('click', (event, d) => {
      const fileError = errors.value.find((error) => error.file === d.file)
      if (fileError) {
        window.dispatchEvent(
          new CustomEvent('error-tracking-error-selected', {
            detail: { error: fileError },
          }),
        )
      }
    })

  // 노드 라벨
  node
    .append('text')
    .text((d) => d.label)
    .attr('dx', 0)
    .attr('dy', (d) => Math.max(15, Math.min(35, 15 + d.count * 2)) + 18)
    .attr('text-anchor', 'middle')
    .attr('fill', textColor)
    .attr('font-size', '11px')
    .attr('font-weight', '500')

  // 카운트 표시
  node
    .append('text')
    .text((d) => d.count)
    .attr('text-anchor', 'middle')
    .attr('dy', 4)
    .attr('fill', textColor)
    .attr('font-size', '10px')
    .attr('font-weight', 'bold')

  // 시뮬레이션 업데이트
  diagramSimulation.on('tick', () => {
    link
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y)

    node.attr('transform', (d) => `translate(${d.x},${d.y})`)
  })

  function dragstarted(event) {
    if (!event.active) diagramSimulation.alphaTarget(0.3).restart()
    event.subject.fx = event.subject.x
    event.subject.fy = event.subject.y
  }

  function dragged(event) {
    event.subject.fx = event.x
    event.subject.fy = event.y
  }

  function dragended(event) {
    if (!event.active) diagramSimulation.alphaTarget(0)
    event.subject.fx = null
    event.subject.fy = null
  }
}

// 다이어그램 데이터 변경 감지 (컨테이너가 마운트된 후에만 렌더링)
watch(
  () => [diagramData.value.nodes, diagramContainer.value],
  ([nodes, container]) => {
    if (container && nodes && nodes.length > 0) {
      nextTick(() => {
        renderDiagram()
      })
    }
  },
  { deep: true, immediate: false },
)

// 에러 아이콘, 색상, 라벨은 공통 유틸리티에서 import하여 사용

// 에러 아이콘 클래스 (색상 제거)
function getErrorIconClass() {
  return ''
}

// 상태 아이콘
function getStatusIcon(status) {
  switch (status) {
    case 'new':
      return 'new_releases'
    case 'resolved':
      return 'check_circle'
    case 'ignored':
      return 'block'
    default:
      return 'help_outline'
  }
}

// 상태 색상
function getStatusColor(status) {
  switch (status) {
    case 'new':
      return 'negative'
    case 'resolved':
      return 'positive'
    case 'ignored':
      return 'grey-7'
    default:
      return 'grey-7'
  }
}

// 상태 라벨
function getStatusLabel(status) {
  switch (status) {
    case 'new':
      return '신규'
    case 'resolved':
      return '해결'
    case 'ignored':
      return '무시'
    default:
      return '알 수 없음'
  }
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

// ============================================
// Phase 1: UI 틀 구성용 임시 데이터 및 핸들러
// ============================================

// 메모 탭 상태, 임시 메모 데이터, 문서 표시용 임시 데이터는 위에서 이미 선언됨 (512-535번 줄)

// Phase 1: UI 테스트용 - 문서 개수 변경 함수 (개발 중 테스트용)
// 개발자 도구 콘솔에서 사용: window.tempDocumentCount = 0, 1, 2
if (import.meta.env.DEV) {
  window.tempDocumentCount = (count) => {
    tempDocumentCount.value = count
  }
}

// Phase 1: 임시 핸들러 함수 (기능 없음, UI만 구성)

// 메모 섹션: AI 분석용 컨텍스트 복사 (@error-ref 형식)
function handleCopyContextForAI() {
  if (!selectedError.value) {
    $q.notify({
      type: 'warning',
      message: '복사할 에러가 선택되지 않았습니다.',
      position: 'top',
      timeout: 2000,
    })
    return
  }

  const error = selectedError.value

  // 프로젝트 식별 (현재는 Platform 고정, 향후 동적으로 식별)
  // TODO: 동적으로 프로젝트 식별 (예: import.meta.env.VITE_PROJECT_NAME 또는 설정에서 가져오기)
  const project = 'Platform'
  const savePath = `NEXA-Documentation/Error/${project}/`

  // FILE 경로 정규화
  const normalizedFilePath = normalizeFilePathForAI(error.file)

  // STACK 정규화 (내부 경로 변환)
  const normalizedStack = normalizeStackForAI(error.stack)

  // @error-ref 형식으로 포맷팅
  let errorRef = `@error-ref\n`
  errorRef += `ID: ${error.id || 'unknown'}\n`
  errorRef += `PROJECT: ${project}\n`
  errorRef += `SAVE_PATH: ${savePath}\n`
  errorRef += `MESSAGE: ${error.message || '없음'}\n`
  errorRef += `FILE: ${normalizedFilePath}:${error.line || 0}:${error.column || 0}\n`
  errorRef += `STACK: ${normalizedStack}\n`
  errorRef += `TIMESTAMP: ${error.timestamp || Date.now()}\n`

  // 추가 정보 (있는 경우만)
  if (error.url) {
    errorRef += `URL: ${error.url}\n`
  }
  if (error.userAgent) {
    errorRef += `USER_AGENT: ${error.userAgent}\n`
  }
  if (error.level) {
    errorRef += `LEVEL: ${error.level}\n`
  }
  if (error.status) {
    errorRef += `STATUS: ${error.status}\n`
  }
  if (error.count) {
    errorRef += `COUNT: ${error.count}\n`
  }
  if (error.type) {
    errorRef += `TYPE: ${error.type}\n`
  }
  if (error.ruleId) {
    errorRef += `RULE_ID: ${error.ruleId}\n`
  }
  if (error.networkInfo) {
    errorRef += `NETWORK_REQUEST_URL: ${error.networkInfo.requestUrl || '없음'}\n`
    errorRef += `NETWORK_METHOD: ${error.networkInfo.method || 'GET'}\n`
    if (error.networkInfo.status) {
      errorRef += `NETWORK_STATUS: ${error.networkInfo.status}\n`
    }
  }

  copyTextToClipboard(errorRef)
  $q.notify({
    type: 'positive',
    message: 'AI 분석용 컨텍스트가 클립보드에 복사되었습니다. Cursor에서 붙여넣기 후 AI에게 분석을 요청하세요.',
    position: 'top',
    timeout: 4000,
  })
}

// 메모 변경 핸들러 (임시 저장용)
const pendingNotes = ref({
  cause: null,
  solution: null,
  learned: null,
  references: null,
})

// 저장 디바운싱을 위한 타이머
let saveNotesTimer = null
let isSaving = ref(false)

// selectedError 변경 시 pendingNotes 초기화
watch(
  () => selectedError.value?.id,
  () => {
    // 타이머 취소
    if (saveNotesTimer) {
      clearTimeout(saveNotesTimer)
      saveNotesTimer = null
    }
    pendingNotes.value = {
      cause: null,
      solution: null,
      learned: null,
      references: null,
    }
    isSaving.value = false
  },
)

/**
 * 메모 필드 변경 핸들러
 */
function handleNotesChange(field, value) {
  if (!selectedError.value) return

  // 임시 저장
  pendingNotes.value[field] = value

  // notes 필드가 없으면 초기화
  if (!selectedError.value.notes) {
    selectedError.value.notes = {
      cause: null,
      solution: null,
      learned: null,
      references: [],
      updatedAt: null,
      updatedBy: null,
    }
  }

  // 즉시 반영 (UI 반응성)
  selectedError.value.notes[field] = value
}

/**
 * 참고 자료 변경 핸들러
 */
function handleReferenceChange(index, value) {
  if (!selectedError.value) return

  // notes 필드가 없으면 초기화
  if (!selectedError.value.notes) {
    selectedError.value.notes = {
      cause: null,
      solution: null,
      learned: null,
      references: [],
      updatedAt: null,
      updatedBy: null,
    }
  }

  if (!selectedError.value.notes.references) {
    selectedError.value.notes.references = []
  }

  // 배열 업데이트
  if (selectedError.value.notes.references[index] !== undefined) {
    selectedError.value.notes.references[index] = value
  }
}

/**
 * 메모 저장 핸들러 (디바운싱 적용)
 */
function handleSaveNotes() {
  if (!selectedError.value || !selectedError.value.id) {
    return
  }

  // 이미 저장 중이면 무시
  if (isSaving.value) {
    return
  }

  // 기존 타이머 취소
  if (saveNotesTimer) {
    clearTimeout(saveNotesTimer)
  }

  // 디바운싱: 500ms 후 저장 (더 긴 딜레이로 중복 방지)
  saveNotesTimer = setTimeout(() => {
    isSaving.value = true

    const currentErrorId = selectedError.value.id

    // pendingNotes와 현재 notes를 병합하여 저장
    const notesToSave = {
      ...errorNotes.value,
      ...pendingNotes.value,
      updatedBy: 'user',
    }

    // null 값 제거 (기존 값 유지)
    Object.keys(notesToSave).forEach((key) => {
      if (notesToSave[key] === null && errorNotes.value[key] !== null) {
        notesToSave[key] = errorNotes.value[key]
      }
    })

    // 저장
    saveErrorNotes(currentErrorId, notesToSave)

    // pendingNotes 초기화
    pendingNotes.value = {
      cause: null,
      solution: null,
      learned: null,
      references: null,
    }

    // 토스트 메시지 (저장할 때마다 표시)
    $q.notify({
      type: 'positive',
      message: '메모가 저장되었습니다.',
      position: 'top',
      timeout: 1500,
    })

    isSaving.value = false
    saveNotesTimer = null
  }, 500)
}

/**
 * 참고 자료 추가
 */
function handleAddReference() {
  if (!selectedError.value) return

  // notes 필드가 없으면 초기화
  if (!selectedError.value.notes) {
    selectedError.value.notes = {
      cause: null,
      solution: null,
      learned: null,
      references: [],
      updatedAt: null,
      updatedBy: null,
    }
  }

  if (!selectedError.value.notes.references) {
    selectedError.value.notes.references = []
  }

  selectedError.value.notes.references.push('')
}

/**
 * 참고 자료 삭제
 */
function handleRemoveReference(index) {
  if (!selectedError.value || !selectedError.value.notes || !selectedError.value.notes.references) {
    return
  }

  selectedError.value.notes.references.splice(index, 1)
  handleSaveNotes()
}

function handleSelectDocument(doc) {
  $q.notify({
    type: 'info',
    message: `문서 선택 기능은 Phase 5에서 구현됩니다: ${doc.title}`,
    position: 'top',
    timeout: 2000,
  })
}

function handleOpenInDocumentViewer() {
  $q.notify({
    type: 'info',
    message: '문서 뷰어 연동 기능은 Phase 8에서 구현됩니다.',
    position: 'top',
    timeout: 2000,
  })
}

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

// 무시 버튼 아이콘 (상태에 따라 동적 변경)
const ignoredButtonIcon = computed(() => {
  if (!selectedError.value) return 'block'
  return selectedError.value.status === 'ignored' ? 'undo' : 'block'
})

// 무시 버튼 라벨 (상태에 따라 동적 변경)
const ignoredButtonLabel = computed(() => {
  if (!selectedError.value) return '무시'
  return selectedError.value.status === 'ignored' ? '무시 취소' : '무시'
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

// 에러 무시 처리 (토글 방식)
function handleIgnored() {
  if (selectedError.value) {
    // ID가 없어도 error 객체를 전달하여 batchUpdateErrorStatus에서 찾도록 함
    const errorId = selectedError.value.id || null

    const includeSimilar = batchOptions.value.ignored
    // 현재 상태가 'ignored'면 'new'로, 아니면 'ignored'로 변경
    const newStatus = selectedError.value.status === 'ignored' ? 'new' : 'ignored'

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
  // FILE 경로 정규화
  const normalizedFilePath = normalizeFilePathForAI(error.file)

  // STACK 정규화 (내부 경로 변환)
  const normalizedStack = normalizeStackForAI(error.stack)

  let text = `에러 전체 정보\n`
  text += `==========\n\n`
  text += `메시지: ${error.message || '없음'}\n`
  text += `레벨: ${error.level || '없음'}\n`
  text += `상태: ${error.status || '없음'}\n`
  text += `발생 시간: ${formatTime(error.timestamp)}\n\n`

  if (normalizedFilePath && normalizedFilePath !== 'unknown') {
    text += `발생 위치\n`
    text += `----------\n`
    text += `파일: ${normalizedFilePath}\n`
    if (error.line) text += `라인: ${error.line}\n`
    if (error.column) text += `컬럼: ${error.column}\n`
    text += `\n`
  }

  if (normalizedStack && normalizedStack !== '없음') {
    text += `스택 트레이스\n`
    text += `----------\n`
    text += `${normalizedStack}\n\n`
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

// 유사한 에러 개수 업데이트 이벤트 리스너
function handleSimilarErrorsCount(event) {
  similarErrorsCountRef.value = event.detail.count || 0
}

// 에러 목록 새로고침
function handleRefreshErrors() {
  window.dispatchEvent(new CustomEvent('error-tracking-request-errors'))
}

onMounted(() => {
  window.addEventListener('error-tracking-error-selected', handleErrorSelected)
  window.addEventListener('error-tracking-statistics-updated', handleStatisticsUpdated)
  window.addEventListener('error-tracking-similar-errors-count', handleSimilarErrorsCount)
  window.addEventListener('error-tracking-errors-updated', handleErrorsUpdated)

  // 에러 목록 요청 (약간의 지연을 두어 useErrorTracking이 초기화된 후 요청)
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('error-tracking-request-errors'))
  }, 100)

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
  window.removeEventListener('error-tracking-errors-updated', handleErrorsUpdated)

  // 다이어그램 정리
  if (diagramSimulation) {
    diagramSimulation.stop()
  }
  if (diagramSvg) {
    diagramSvg.remove()
  }
})
</script>

<style lang="scss" scoped>
// 기본 레이아웃
.error-tracking-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

// 통계 카드 그리드
.statistics-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

// 차트 그리드 레이아웃
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1rem;
}

.chart-card {
  border: 1px solid var(--nexa-border-color);
  border-radius: 4px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  min-height: 400px;
  max-height: 600px;
  height: 500px;
  overflow: hidden;
}

// 스택 트레이스
.stack-trace {
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid var(--nexa-border-color);
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
