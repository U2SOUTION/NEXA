<template>
  <div class="error-tracking-content">
    <!-- 선택된 에러가 없을 때 -->
    <div v-if="!selectedError" class="dashboard-view q-pa-md">
      <!-- 통계 카드 -->
      <div class="statistics-cards q-mb-lg">
        <div class="row q-gutter-md">
          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="stat-card">
              <q-card-section>
                <div class="stat-card-header">
                  <q-icon name="bug_report" size="32px" color="negative" />
                  <div class="stat-card-content">
                    <div class="stat-card-label">총 에러</div>
                    <div class="stat-card-value">{{ statistics.total }}개</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="stat-card">
              <q-card-section>
                <div class="stat-card-header">
                  <q-icon name="new_releases" size="32px" color="warning" />
                  <div class="stat-card-content">
                    <div class="stat-card-label">신규</div>
                    <div class="stat-card-value stat-value-new">{{ statistics.new }}개</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="stat-card">
              <q-card-section>
                <div class="stat-card-header">
                  <q-icon name="check_circle" size="32px" color="positive" />
                  <div class="stat-card-content">
                    <div class="stat-card-label">해결</div>
                    <div class="stat-card-value stat-value-resolved">{{ statistics.resolved }}개</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <q-card class="stat-card">
              <q-card-section>
                <div class="stat-card-header">
                  <q-icon name="today" size="32px" color="info" />
                  <div class="stat-card-content">
                    <div class="stat-card-label">오늘</div>
                    <div class="stat-card-value">{{ statistics.today }}개</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- 차트 섹션 -->
      <div v-if="statistics.total > 0" class="charts-section q-mb-lg">
        <div class="charts-grid">
          <!-- 에러 발생 추이 차트 -->
          <div class="chart-card">
            <NexaChart v-if="errorTrendChartData.length > 0" type="line" :data="errorTrendChartData" title="에러 발생 추이" title-icon="trending_up" :options="{ animation: true, showLabels: true }" :on-refresh="handleRefreshErrors">
              <template #title-right="{ isRefreshing, handleRefresh }">
                <q-chip size="sm" color="primary" text-color="white">
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
                <q-chip size="sm" color="primary" text-color="white">
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
              <q-btn flat dense icon="code" label="에러 정보 복사" class="btn-copy-context" @click="handleCopyErrorInfo">
                <q-tooltip>에러의 기본 정보를 클립보드에 복사합니다</q-tooltip>
              </q-btn>
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
            <q-btn flat dense icon="content_copy" size="sm" label="컨텍스트 복사" class="btn-copy-context" @click="handleCopyContextForAI">
              <q-tooltip>AI 분석용 에러 컨텍스트를 클립보드에 복사합니다 (Cursor에서 사용)</q-tooltip>
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
          <q-chip v-if="tempDocumentCount > 1" size="sm" color="primary" class="q-ml-sm"> {{ tempDocumentCount }}개 </q-chip>
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
                  <q-chip v-for="tag in doc.tags" :key="tag" size="xs" color="secondary" text-color="white">
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

const $q = useQuasar()

// 에러 트래킹 composable
const { selectedError, saveErrorNotes, errors } = useErrorTracking()

// 메모 탭 상태
const notesTab = ref('cause')

// 메모 데이터 (computed로 selectedError의 notes와 동기화)
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
            console.log(`[ErrorTracking] 기존 배치 옵션 키에서 데이터 발견: ${oldKey}`)
            // 새 키로 저장
            localStorage.setItem(BATCH_OPTIONS_STORAGE_KEY, oldData)
            // 기존 키 삭제
            localStorage.removeItem(oldKey)
            console.log(`[ErrorTracking] 배치 옵션 마이그레이션 완료: ${BATCH_OPTIONS_STORAGE_KEY}`)
            saved = oldData
            break
          }
        } catch (error) {
          console.warn(`[ErrorTracking] 기존 배치 옵션 키 마이그레이션 실패 (${oldKey}):`, error)
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
  console.log('[ErrorTrackingContent] 통계 업데이트:', statistics.value)
}

// 에러 목록 업데이트 이벤트 리스너
// errors는 useErrorTracking()에서 가져온 것이므로 이벤트로 업데이트할 필요 없음
// (useErrorTracking 내부에서 자동으로 관리됨)
function handleErrorsUpdated(event) {
  // 이벤트는 받지만, errors는 useErrorTracking()에서 직접 관리되므로 여기서는 로그만
  console.log('[ErrorTrackingContent] 에러 목록 업데이트:', event.detail.errors?.length || 0, '개')
}

// 에러 발생 추이 차트 데이터 (최근 7일)
const errorTrendChartData = computed(() => {
  if (errors.value.length === 0) return []

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
  if (errors.value.length === 0) return []

  const typeCounts = {
    error: 0,
    warning: 0,
    unhandled: 0,
    lint: 0,
  }

  errors.value.forEach((error) => {
    if (error.type === 'lint') {
      typeCounts.lint++
    } else {
      typeCounts[error.level] = (typeCounts[error.level] || 0) + 1
    }
  })

  return Object.entries(typeCounts)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => ({
      x: type === 'lint' ? 'Lint' : type.charAt(0).toUpperCase() + type.slice(1),
      y: count,
    }))
})

// 다이어그램 데이터 (에러 의존성)
const diagramData = computed(() => {
  if (errors.value.length === 0) {
    return { nodes: [], edges: [] }
  }

  // 🔍 디버깅: 파일 정보 확인
  const filesWithInfo = errors.value.filter((e) => e.file).length
  const filesWithoutInfo = errors.value.filter((e) => !e.file).length
  console.log('=== 다이어그램 데이터 확인 ===')
  console.log('전체 에러 개수:', errors.value.length)
  console.log('파일 정보 있는 에러:', filesWithInfo)
  console.log('파일 정보 없는 에러:', filesWithoutInfo)
  if (filesWithInfo > 0) {
    console.log(
      '파일 정보 샘플:',
      errors.value
        .filter((e) => e.file)
        .slice(0, 5)
        .map((e) => e.file),
    )
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

  // 🔍 디버깅: 그룹화 결과 확인
  console.log('파일별 그룹화 결과:', Object.keys(fileErrors))
  console.log('그룹화된 파일 개수:', Object.keys(fileErrors).length)
  if (Object.keys(fileErrors).length > 0) {
    console.log(
      '각 파일별 에러 개수:',
      Object.entries(fileErrors).map(([file, list]) => ({ file, count: list.length })),
    )
  }

  // 노드 생성 (파일별, 최대 20개)
  const fileEntries = Object.entries(fileErrors).slice(0, 20)
  const nodes = fileEntries.map(([file, fileErrorList], index) => ({
    id: `file-${index}`,
    label: file.split('/').pop() || file,
    type: 'file',
    count: fileErrorList.length,
    file: file,
  }))

  // 🔍 디버깅: 생성된 노드 확인
  console.log('생성된 노드 개수:', nodes.length)
  console.log('생성된 노드 정보:', nodes)

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

  // 🔍 디버깅: 에지 생성 결과 확인
  console.log('생성된 에지 개수:', edges.length)
  if (edges.length > 0) {
    console.log('생성된 에지 정보:', edges)
  } else {
    console.log('에지가 생성되지 않은 이유: 같은 메시지를 가진 파일이 2개 이상 없음')
    console.log(
      '메시지별 파일 매핑:',
      Object.entries(messageToFiles).map(([msg, files]) => ({
        message: msg.substring(0, 50),
        files: Array.from(files),
        fileCount: files.size,
      })),
    )
  }

  console.log('=== 다이어그램 데이터 생성 완료 ===')
  console.log('최종 노드:', nodes.length, '개')
  console.log('최종 에지:', edges.length, '개')

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

// 상단: 에러 기본 정보 복사 (일반적인 에러 정보)
function handleCopyErrorInfo() {
  $q.notify({
    type: 'info',
    message: '에러 정보 복사 기능은 Phase 4에서 구현됩니다.',
    position: 'top',
    timeout: 2000,
  })
}

// 메모 섹션: AI 분석용 컨텍스트 복사 (@error-ref 형식)
function handleCopyContextForAI() {
  $q.notify({
    type: 'info',
    message: 'AI 컨텍스트 복사 기능은 Phase 4에서 구현됩니다.',
    position: 'top',
    timeout: 2000,
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
.error-tracking-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--nexa-background);
  overflow-y: auto;
}

.dashboard-view {
  background-color: var(--nexa-background);
}

.statistics-cards {
  .stat-card {
    background-color: var(--nexa-surface);
    border: 1px solid var(--nexa-border-color);
  }

  .stat-card-header {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .stat-card-content {
    flex: 1;
  }

  .stat-card-label {
    font-size: 0.9rem;
    color: var(--nexa-text-secondary);
    margin-bottom: 0.25rem;
  }

  .stat-card-value {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--nexa-text-primary);

    &.stat-value-new {
      color: var(--nexa-error);
    }

    &.stat-value-resolved {
      color: var(--nexa-success);
    }
  }
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1rem;
}

.chart-card {
  //background-color: var(--nexa-surface);
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

.diagram-section {
  background-color: var(--nexa-surface);
  border: 1px solid var(--nexa-border-color);
  border-radius: 4px;
  padding: 1rem;
}

.error-dependency-diagram {
  width: 100%;
  height: 400px;
  min-height: 400px;
  background-color: var(--nexa-surface);
  border: 1px solid var(--nexa-border-color);
  border-radius: 4px;

  :deep(.diagram-node) {
    cursor: pointer;

    circle {
      transition:
        r 0.2s,
        fill 0.2s,
        opacity 0.2s;
    }

    &:hover circle {
      fill: var(--nexa-primary);
      opacity: 0.8;
    }
  }
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
.error-context,
.error-notes,
.error-analysis-docs {
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

// ============================================
// Phase 1: 메모 섹션 스타일
// ============================================
.error-notes {
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .notes-tabs {
    margin-bottom: 1rem;
  }

  .notes-panels {
    .notes-editor {
      .notes-textarea {
        width: 100%;
      }

      .notes-meta {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        color: var(--nexa-text-secondary);
      }
    }

    .reference-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  }
}

// ============================================
// Phase 1: 문서 표시 섹션 스타일
// ============================================
.error-analysis-docs {
  .section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .analysis-doc-preview {
    .markdown-content {
      color: var(--nexa-text-primary);
      line-height: 1.6;
    }
  }

  .error-analysis-empty {
    padding: 2rem;
    color: var(--nexa-text-secondary);
  }
}

// 컨텍스트 복사 버튼 스타일
.btn-copy-context {
  color: var(--nexa-primary);
}
</style>
